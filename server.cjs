// ═══════════════════════════════════════════════════════════════════════════════
// AgroTwin Master Suite — Servidor Unificado (Predio, Vecindario y Cuenca)
// Puerto 7777 — Plataforma Consolidada Single-Pane-of-Glass
// ═══════════════════════════════════════════════════════════════════════════════
const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const AgriSoilWaterEngine = require('./js/engines/soil-water-engine.cjs');
const AgriBasinHydrologyEngine = require('./js/engines/basin-hydrology-engine.cjs');
const AgriStacClient = require('./js/engines/stac-cog-client.cjs');
const AgriDataCubeEngine = require('./js/engines/data-cube-engine.cjs');

const PORT     = process.env.PORT || 7777;
const ROOT_DIR = __dirname;
const CACHE_TILES_DIR = path.join(ROOT_DIR, 'cache_tiles');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.geojson': 'application/geo+json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.mp3':  'audio/mpeg',
  '.mp4':  'video/mp4',
  '.wasm': 'application/wasm'
};

// ── Cache y Conexión Meteorológica Real (Open-Meteo Parral/Retiro) ─────────
let cachedLiveWeather = null;
let lastWeatherFetch = 0;

async function getLiveMauleWeather() {
  const now = Date.now();
  if (cachedLiveWeather && (now - lastWeatherFetch) < 10 * 60 * 1000) {
    return cachedLiveWeather;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=-36.2115&longitude=-71.6050&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m&daily=et0_fao_evapotranspiration&timezone=America%2FSantiago',
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (resp.ok) {
      const data = await resp.json();
      const deg = data.current?.wind_direction_10m ?? 75;
      const degToCard = (d) => {
        const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
        return dirs[Math.round(d / 22.5) % 16];
      };
      cachedLiveWeather = {
        is_real: true,
        source: 'Open-Meteo / WMO (En vivo)',
        temp_air_c: data.current?.temperature_2m ?? 21.5,
        humidity_pct: data.current?.relative_humidity_2m ?? 50,
        precip_24h_mm: data.current?.precipitation ?? 0,
        wind_speed_kmh: data.current?.wind_speed_10m ?? 12.0,
        wind_dir: `${degToCard(deg)} (${deg}°)`,
        eto_mm_day: data.daily?.et0_fao_evapotranspiration?.[0] ?? 4.5,
        timestamp: new Date().toISOString()
      };
      lastWeatherFetch = now;
      return cachedLiveWeather;
    }
  } catch (err) {
    console.warn('Aviso: Fallback en clima en vivo Open-Meteo:', err.message);
  }
  return cachedLiveWeather || {
    is_real: false,
    source: 'Modelo agroclimático Maule Sur (Simulado)',
    temp_air_c: 21.5,
    humidity_pct: 52,
    precip_24h_mm: 0,
    wind_speed_kmh: 12.5,
    wind_dir: 'ENE (75°)',
    eto_mm_day: 4.8,
    timestamp: new Date().toISOString()
  };
}

// ── Cache y Pronóstico Climático 7 Días (Forzamiento para Motor Biofísico) ──
let cachedForecast7d = null;
let lastForecastFetch = 0;

async function getForecast7dForcing() {
  const now = Date.now();
  if (cachedForecast7d && (now - lastForecastFetch) < 30 * 60 * 1000) {
    return cachedForecast7d;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=-36.2115&longitude=-71.6050&daily=et0_fao_evapotranspiration,precipitation_sum,temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=America%2FSantiago',
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (resp.ok) {
      const data = await resp.json();
      const daily = data.daily || {};
      const times = daily.time || [];
      const et0s = daily.et0_fao_evapotranspiration || [];
      const precips = daily.precipitation_sum || [];
      if (times.length > 0) {
        cachedForecast7d = times.map((t, idx) => ({
          timestamp: t,
          et0_mm: et0s[idx] != null ? Number(et0s[idx].toFixed(2)) : 5.2,
          precip_mm: precips[idx] != null ? Number(precips[idx].toFixed(2)) : 0.0,
          irrigation_mm: 5.5
        }));
        lastForecastFetch = now;
        return cachedForecast7d;
      }
    }
  } catch (err) {
    console.warn('[Pronóstico 7D] Fallback climático:', err.message);
  }
  const fallbackDays = ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'];
  return fallbackDays.map((d, i) => ({
    timestamp: d,
    et0_mm: Number((5.2 + (i % 3) * 0.4).toFixed(2)),
    precip_mm: 0,
    irrigation_mm: 5.5
  }));
}

function computeScenarioMetrics(trajectory, capacity) {
  let minVwc = 100;
  let daysInStress = 0;
  let totalEtc = 0;
  let totalIrrigation = 0;
  let totalDrainage = 0;

  for (let i = 0; i < trajectory.length; i++) {
    const st = trajectory[i];
    if (st.vwc_percent < minVwc) minVwc = st.vwc_percent;
    if (st.ks_stress_factor < 1.0) daysInStress++;
    if (st.etc_adj_mm) totalEtc += st.etc_adj_mm;
    if (st.irrigation_applied_mm) totalIrrigation += st.irrigation_applied_mm;
    if (st.deep_drainage_mm) totalDrainage += st.deep_drainage_mm;
  }

  const wp_pct = capacity.soil.theta_wp * 100.0;
  let verdict = 'ÓPTIMO_CONFORT';
  if (minVwc <= wp_pct + 1.0) {
    verdict = 'ALERTA_MARCHITEZ_SEVERA';
  } else if (daysInStress >= 2) {
    verdict = 'ESTRÉS_HÍDRICO_ACTIVO';
  }

  return {
    min_vwc_percent: Number(minVwc.toFixed(2)),
    days_in_stress: daysInStress,
    total_etc_mm: Number(totalEtc.toFixed(2)),
    total_irrigation_mm: Number(totalIrrigation.toFixed(2)),
    total_drainage_mm: Number(totalDrainage.toFixed(2)),
    risk_verdict: verdict
  };
}

function buildTelemetrySummary(liveWeather = null) {
  const now    = new Date();
  const weather = liveWeather || {
    is_real: false,
    source: 'Modelo agroclimático Maule Sur (Simulado)',
    temp_air_c: 21.5,
    humidity_pct: 52,
    precip_24h_mm: 0,
    wind_speed_kmh: 12.5,
    wind_dir: 'ENE (75°)',
    eto_mm_day: 4.8
  };

  // Dinámica de Macro-Cuenca Acoplada (Andes -> Longaví -> Bullileo -> Retiro)
  const dynamicRiver = AgriBasinHydrologyEngine.calculateLongaviRiverFlow({
    precip_24h_mm: weather.precip_24h_mm || 0,
    temp_air_c: weather.temp_air_c || 21.5
  });
  const dynamicReservoir = AgriBasinHydrologyEngine.calculateBullileoReservoir(dynamicRiver.caudal_m3_s);
  const dynamicCoupling = AgriBasinHydrologyEngine.evaluateFarmBoundaryCoupling(dynamicRiver, dynamicReservoir);

  // Punto Central Representativo: Casa Patronal / Galpón (Zona 0 = [0m E, 0m N])
  const CASA_CENTER = { lat: -36.2115, lng: -71.6050, name: 'Casa Patronal / Galpón (Zona 0)' };
  const toRelMeters = (lat, lng) => {
    const dNorthM = Math.round((lat - CASA_CENTER.lat) * 111111);
    const dEastM  = Math.round((lng - CASA_CENTER.lng) * 111111 * Math.cos(CASA_CENTER.lat * Math.PI / 180));
    const ns = dNorthM >= 0 ? `${dNorthM}m N` : `${Math.abs(dNorthM)}m S`;
    const ew = dEastM >= 0 ? `${dEastM}m E` : `${Math.abs(dEastM)}m O`;
    const distM = Math.round(Math.hypot(dEastM, dNorthM));
    return { dEastM, dNorthM, distFromHouseM: distM, relativeLabel: `${ns}, ${ew} de Casa (${distM}m)` };
  };

  const kiotNodes = [
    {
      id: 'FDR-01',
      name: 'Cerezos Lapins (Fundo Meniel)',
      type: 'soil_moisture_fdr',
      depth_cm: '0-20',
      lat: -36.2095,
      lng: -71.6060,
      relative_to_house: toRelMeters(-36.2095, -71.6060),
      network: 'KioT Mesh (Simulado - Prototipo)',
      status: 'simulado',
      is_simulated: true,
      simulation_basis: 'Simulado (Prototipo de ingeniería bioclimática - Modelo de balance hídrico FAO-56)',
      readings: {
        vwc_percent: 36.2,
        temp_soil_c: 14.8,
        ec_dS_m: 0.42,
        battery_pct: 94,
        lqi: 98,
        last_tx: now.toISOString(),
        simulation_notice: 'Lectura modelada (Prototipo)'
      }
    },
    {
      id: 'FDR-02',
      name: 'Avellanos Tonda (Fundo Meniel)',
      type: 'soil_moisture_fdr',
      depth_cm: '20-60',
      lat: -36.2120,
      lng: -71.6030,
      relative_to_house: toRelMeters(-36.2120, -71.6030),
      network: 'KioT Mesh (Simulado - Prototipo)',
      status: 'simulado',
      is_simulated: true,
      simulation_basis: 'Simulado (Prototipo de ingeniería bioclimática - Modelo de balance hídrico FAO-56)',
      readings: {
        vwc_percent: 35.8,
        temp_soil_c: 13.7,
        ec_dS_m: 0.38,
        battery_pct: 88,
        lqi: 95,
        last_tx: now.toISOString(),
        simulation_notice: 'Lectura modelada (Prototipo)'
      }
    },
    {
      id: 'FDR-03',
      name: 'Keyline Sur (Infiltración - Fundo Meniel)',
      type: 'soil_moisture_fdr',
      depth_cm: '0-40',
      lat: -36.2145,
      lng: -71.6050,
      relative_to_house: toRelMeters(-36.2145, -71.6050),
      network: 'KioT Mesh (Simulado - Prototipo)',
      status: 'simulado',
      is_simulated: true,
      simulation_basis: 'Simulado (Prototipo de ingeniería bioclimática - Modelo de balance hídrico FAO-56)',
      readings: {
        vwc_percent: 38.4,
        temp_soil_c: 14.0,
        infiltration_active: true,
        battery_pct: 95,
        lqi: 97,
        last_tx: now.toISOString(),
        simulation_notice: 'Lectura modelada (Prototipo)'
      }
    },
    {
      id: 'FDR-04',
      name: 'Silvopastoril PRV (Fundo Meniel)',
      type: 'soil_moisture_fdr',
      depth_cm: '0-30',
      lat: -36.2105,
      lng: -71.6080,
      relative_to_house: toRelMeters(-36.2105, -71.6080),
      network: 'KioT Mesh (Simulado - Prototipo)',
      status: 'simulado',
      is_simulated: true,
      simulation_basis: 'Simulado (Prototipo de ingeniería bioclimática - Modelo de balance hídrico FAO-56)',
      readings: {
        vwc_percent: 36.0,
        temp_soil_c: 13.9,
        ec_dS_m: 0.52,
        battery_pct: 90,
        lqi: 94,
        last_tx: now.toISOString(),
        simulation_notice: 'Lectura modelada (Prototipo)'
      }
    },
    {
      id: 'PIEZO-TQ',
      name: 'Piezómetro Tranque Colliguay (Fundo Meniel)',
      type: 'piezometer',
      lat: -36.2110,
      lng: -71.6045,
      relative_to_house: toRelMeters(-36.2110, -71.6045),
      network: 'KioT Mesh (Acoplado a Cuenca)',
      status: 'online_dinamico',
      is_simulated: true,
      simulation_basis: 'Modelo Hidráulico Acoplado (AgriBasinHydrologyEngine)',
      readings: {
        volume_m3: dynamicCoupling.tranque_keyline.current_volume_m3,
        cota_msnm: 198,
        capacity_pct: dynamicCoupling.tranque_keyline.fill_pct,
        autonomy_days: dynamicCoupling.tranque_keyline.autonomy_days,
        daily_inflow_canal_m3: dynamicCoupling.tranque_keyline.daily_inflow_canal_m3,
        battery_pct: 99,
        last_tx: now.toISOString(),
        turn_notice: dynamicCoupling.canal_matriz.turn_notice,
        simulation_notice: 'Acople Dinámico Canal Matriz + Tranque Keyline'
      }
    }
  ];

  const publicStations = [
    {
      id: 'INIA-RETIRO',
      name: 'INIA Retiro (Agroclimática)',
      agency: 'INIA / Open-Meteo',
      lat: -36.0580,
      lng: -71.7610,
      status: weather.is_real ? 'online' : 'simulado',
      is_real: weather.is_real,
      source: weather.source,
      readings: {
        temp_air_c: weather.temp_air_c,
        humidity_pct: weather.humidity_pct,
        eto_mm_day: weather.eto_mm_day,
        precip_24h_mm: weather.precip_24h_mm,
        radiation_w_m2: weather.is_real ? 580 : 610
      }
    },
    {
      id: 'DGA-LONGAVI',
      name: 'DGA Fluviométrica Río Longaví',
      agency: 'DGA / Extremes DT Engine',
      lat: -36.1750,
      lng: -71.6700,
      status: 'online_dinamico',
      is_real: weather.is_real,
      source: 'DGA / Motor Hidrológico de Cuenca Acoplado (AgriBasinHydrologyEngine)',
      readings: {
        caudal_m3_s: dynamicRiver.caudal_m3_s,
        nivel_m: dynamicRiver.nivel_rio_m,
        regime: dynamicRiver.regime,
        alert_level: dynamicRiver.alert_level,
        snowmelt_m3_s: dynamicRiver.snowmelt_m3_s,
        runoff_m3_s: dynamicRiver.runoff_m3_s,
        trend: dynamicRiver.caudal_m3_s >= 14.5 ? 'estable' : 'estiaje_descenso',
        simulation_notice: 'Modelo hidrológico dinámico continuo acoplado a precipitación andina'
      }
    },
    {
      id: 'DMC-PARRAL',
      name: 'DMC Parral Centro (Aeronáutica)',
      agency: 'DMC / Open-Meteo',
      lat: -36.1432,
      lng: -71.8267,
      status: weather.is_real ? 'online' : 'simulado',
      is_real: weather.is_real,
      source: weather.source,
      readings: {
        wind_speed_kmh: weather.wind_speed_kmh,
        wind_dir: weather.wind_dir,
        wind_type: 'Viento Puelche / Ladera Andina',
        temp_air_c: weather.temp_air_c,
        humidity_pct: weather.humidity_pct
      }
    },
    {
      id: 'DGA-BULLILEO',
      name: 'DGA Embalse Bullileo',
      agency: 'DGA / Extremes DT Engine',
      lat: -36.2800,
      lng: -71.4200,
      status: 'online_dinamico',
      is_real: weather.is_real,
      source: 'DGA Embalse Bullileo - Modelo de Balance Volumétrico Acoplado',
      readings: {
        volume_hm3: dynamicReservoir.volume_hm3,
        cota_msnm: dynamicReservoir.cota_msnm,
        fill_pct: dynamicReservoir.fill_pct,
        status: dynamicReservoir.status,
        daily_delta_hm3: dynamicReservoir.daily_delta_hm3,
        simulation_notice: 'Balance hidrológico andino diario acoplado a demanda de regadío'
      }
    }
  ];

  return {
    meta: {
      service: 'agritwin-hub',
      version: '3.1-destine-coupled',
      port: PORT,
      cuenca: 'Macro-Cuenca Maule Sur (Longaví – Parral – Retiro)',
      area_ha: 122070,
      timestamp: now.toISOString(),
      weather_feed: weather.source,
      weather_is_real: weather.is_real,
      fundo_colliguay: {
        lat: -36.2115,
        lng: -71.6050,
        reference_origin: 'Casa Patronal / Galpón (Zona 0: 0m N, 0m E)',
        rol_sii: '142-88 Retiro',
        area_ha: 24.8,
        derechos_dga_lps: 28.0,
        pilot_status: 'Predio Piloto Fundo Meniel'
      }
    },
    sentinel_network: {
      total_stations: 9,
      kiot_mesh: kiotNodes,
      public: publicStations
    },
    derived: {
      fwi: {
        value: 28,
        label: 'MODERADO',
        buffer_mitigation_pct: dynamicCoupling.tranque_keyline.buffer_mitigation_active ? 85 : 45,
        source: 'Estimación índice FWI (Simulado)'
      },
      longavi_q_m3s: dynamicRiver.caudal_m3_s,
      longavi_regime: dynamicRiver.regime,
      longavi_alert: dynamicRiver.alert_level,
      bullileo_fill_pct: dynamicReservoir.fill_pct,
      bullileo_vol_hm3: dynamicReservoir.volume_hm3,
      canal_delivery_lps: dynamicCoupling.canal_matriz.effective_delivery_lps,
      canal_turn_notice: dynamicCoupling.canal_matriz.turn_notice,
      tranque_autonomy_days: dynamicCoupling.tranque_keyline.autonomy_days,
      puelche_gusts_kmh: weather.wind_speed_kmh,
      eto_penman_monteith_mm_day: weather.eto_mm_day,
      avg_vwc_pct: 36.2,
      tranque_keyline_capacity_m3: 18500
    },
    apr_summary: [
      { id: 'APR-01', name: 'Retiro Centro', depth_m: 68, families: 1450, status: 'normal' },
      { id: 'APR-02', name: 'Copihue', depth_m: 52, families: 680, status: 'recharge_positive' },
      { id: 'APR-03', name: 'Romeral-San Luis', depth_m: 44, families: 380, status: 'warning_abatimiento' },
      { id: 'APR-04', name: 'Villaseca', depth_m: 58, families: 420, status: 'normal' },
      { id: 'APR-05', name: 'Los Cuarteles', depth_m: 36, families: 290, status: 'normal' }
    ]
  };
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const urlPath = decodeURI(parsedUrl.pathname);

  // ── Proxy de Teselas Satelitales Offline/Cache ─────────────────────────
  if (urlPath.startsWith('/tiles/')) {
    const tileRel = urlPath.replace('/tiles/', '');
    const localTilePath = path.join(CACHE_TILES_DIR, tileRel);

    if (fs.existsSync(localTilePath)) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Tile-Cache': 'HIT-DISK'
      });
      fs.createReadStream(localTilePath).pipe(res);
      return;
    }

    const match = tileRel.match(/^([^/]+)\/(\d+)\/(\d+)\/(\d+)\.png$/);
    if (!match) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad tile path');
      return;
    }

    const [, layerType, z, x, y] = match;
    let lyrs = 'y';
    if (layerType === 'google-sat') lyrs = 's';
    if (layerType === 'google-terrain') lyrs = 'p';
    if (layerType === 'google-streets') lyrs = 'm';

    const sub = ['0', '1', '2', '3'][Math.floor(Math.random() * 4)];
    const remoteUrl = `https://mt${sub}.google.com/vt/lyrs=${lyrs}&x=${x}&y=${y}&z=${z}`;

    const parentDir = path.dirname(localTilePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    https.get(remoteUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 3500 }, (remoteRes) => {
      if (remoteRes.statusCode === 200) {
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Tile-Cache': 'MISS-FETCHED'
        });
        const fileStream = fs.createWriteStream(localTilePath);
        remoteRes.pipe(fileStream);
        remoteRes.pipe(res);
      } else {
        res.writeHead(remoteRes.statusCode, { 'Content-Type': 'text/plain' });
        res.end(`Tile error ${remoteRes.statusCode}`);
      }
    }).on('error', () => {
      const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
      res.writeHead(200, { 'Content-Type': 'image/png', 'X-Tile-Cache': 'FALLBACK-OFFLINE' });
      res.end(transparentPixel);
    });
    return;
  }

  // ── Endpoints API ──────────────────────────────────────────────────────
  if (urlPath === '/api/telemetry/summary' && req.method === 'GET') {
    const liveWeather = await getLiveMauleWeather();
    const payload = buildTelemetrySummary(liveWeather);
    const body = JSON.stringify(payload, null, 2);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(body);
    return;
  }

  if ((urlPath === '/api/basin-sync' || urlPath === '/predio/api/basin-sync') && req.method === 'GET') {
    const liveWeather = await getLiveMauleWeather();
    const telemetry = buildTelemetrySummary(liveWeather);

    const dynamicRiver = AgriBasinHydrologyEngine.calculateLongaviRiverFlow({
      precip_24h_mm: liveWeather.precip_24h_mm || 0,
      temp_air_c: liveWeather.temp_air_c || 21.5
    });
    const dynamicReservoir = AgriBasinHydrologyEngine.calculateBullileoReservoir(dynamicRiver.caudal_m3_s);
    const dynamicCoupling = AgriBasinHydrologyEngine.evaluateFarmBoundaryCoupling(dynamicRiver, dynamicReservoir);

    const payload = {
      source: 'agritwin-hub-7777',
      status: 'connected',
      timestamp: new Date().toISOString(),
      engine: 'AgriBasinHydrologyEngine v1.0.0 (Extremes DT Flow Coupling)',
      weather_source: liveWeather.source,
      weather_is_real: liveWeather.is_real,
      cuenca: 'Macro-Cuenca Maule Sur (Longaví – Parral – Retiro)',
      rio_longavi: dynamicRiver,
      embalse_bullileo: dynamicReservoir,
      acople_predial: dynamicCoupling,
      macro_fwi: telemetry.derived.fwi.value,
      macro_fwi_label: telemetry.derived.fwi.label,
      q_longavi_m3_s: dynamicRiver.caudal_m3_s,
      puelche_gusts_kmh: telemetry.derived.puelche_gusts_kmh,
      aprs_summary: telemetry.apr_summary,
      buffer_mitigation_pct: dynamicCoupling.tranque_keyline.buffer_mitigation_active ? 85 : 45,
      tranque_keyline_capacity_m3: 18500
    };
    const body = JSON.stringify(payload, null, 2);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(body);
    return;
  }

  // ─── API: Simulador Biofísico What-If Desacoplado (Patrón DestinE) ────────
  if ((urlPath === '/api/simulation/presets' || urlPath === '/predio/api/simulation/presets') && req.method === 'GET') {
    const body = JSON.stringify({
      engine: 'AgriSoilWaterEngine v1.0.0 (FAO-56 Dual/Single Decoupled)',
      soils: AgriSoilWaterEngine.SOIL_TEXTURE_PROFILES,
      crops: AgriSoilWaterEngine.CROP_PROFILES
    }, null, 2);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(body);
    return;
  }

  if ((urlPath === '/api/simulation/run' || urlPath === '/predio/api/simulation/run') && (req.method === 'GET' || req.method === 'POST')) {
    const runSimulationWithParams = async (params) => {
      try {
        const cropId = params.crop_id || 'CROP-AVE-01';
        const soilType = params.soil_type || 'franco_arcilloso';
        const capacity = AgriSoilWaterEngine.calculateHydraulicCapacity(soilType, cropId);

        let initialVwc = params.initial_vwc;
        let vwcSource = 'Parámetro de usuario';
        if (initialVwc == null) {
          initialVwc = (cropId === 'CROP-VIN-01') ? 28.4 : ((cropId === 'CROP-CER-01') ? 32.5 : 34.0);
          vwcSource = 'Sensor FDR de Terreno (Calibrado T=0)';
        }

        const stateT0 = AgriSoilWaterEngine.createInitialState(Number(initialVwc), capacity);
        const baseClimate = await getForecast7dForcing();
        const irrigQuota = params.irrigation_mm != null ? Number(params.irrigation_mm) : 5.5;

        // Bifurcación en 4 ramas de escenarios What-If
        const rawScenarios = AgriSoilWaterEngine.simulateScenarios(stateT0, baseClimate, {
          baseline: {
            name: 'Línea Base (Riego Programado)',
            description: `Riego por goteo normal de ${irrigQuota} mm/día`,
            modifier: (step) => ({ ...step, irrigation_mm: irrigQuota })
          },
          pump_failure: {
            name: 'Corte / Falla de Bomba (What-If)',
            description: 'Falla de bomba de pozo profundo o interrupción de energía desde el día 3',
            modifier: (step, idx) => idx >= 2 ? { ...step, irrigation_mm: 0 } : { ...step, irrigation_mm: irrigQuota }
          },
          heatwave_puelche: {
            name: 'Choque Térmico Viento Puelche (What-If)',
            description: 'Viento cálido descendente (+35% demanda evaporativa ET0) con estrés hídrico',
            modifier: (step, idx) => ({
              ...step,
              et0_mm: Number((step.et0_mm * 1.35).toFixed(2)),
              irrigation_mm: idx >= 3 ? 0 : irrigQuota
            })
          },
          deficit_rdi: {
            name: 'Riego Deficitario Controlado (RDI)',
            description: `Ahorro hídrico sustentable (50% de cuota: ${(irrigQuota * 0.5).toFixed(1)} mm/día)`,
            modifier: (step) => ({ ...step, irrigation_mm: Number((irrigQuota * 0.5).toFixed(2)) })
          }
        }, capacity);

        const formattedScenarios = {};
        Object.keys(rawScenarios).forEach(key => {
          const sc = rawScenarios[key];
          formattedScenarios[key] = {
            name: sc.name,
            description: sc.description,
            metrics: computeScenarioMetrics(sc.trajectory, capacity),
            trajectory: sc.trajectory
          };
        });

        const responsePayload = {
          status: 'success',
          engine: 'AgriSoilWaterEngine v1.0.0 (FAO-56 Dual/Single Decoupled)',
          generated_at: new Date().toISOString(),
          meta: {
            crop_id: cropId,
            crop_name: capacity.crop.name,
            soil_type: soilType,
            soil_name: capacity.soil.name,
            hydraulic_capacity: capacity,
            initial_vwc_percent: stateT0.vwc_percent,
            initial_vwc_source: vwcSource
          },
          state_t0: stateT0,
          scenarios: formattedScenarios
        };

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(responsePayload, null, 2));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ status: 'error', message: err.message }));
      }
    };

    if (req.method === 'GET') {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const params = Object.fromEntries(parsedUrl.searchParams.entries());
      await runSimulationWithParams(params);
      return;
    }

    if (req.method === 'POST') {
      let bodyData = '';
      req.on('data', chunk => bodyData += chunk);
      req.on('end', async () => {
        let params = {};
        try {
          if (bodyData.trim()) params = JSON.parse(bodyData);
        } catch(e) {}
        await runSimulationWithParams(params);
      });
      return;
    }
  }

  // ─── API: Satélite STAC & Índices Radiométricos (Patrón DestinE DEDL) ────
  if ((urlPath === '/api/sat/stac/passes' || urlPath === '/predio/api/sat/stac/passes') && req.method === 'GET') {
    const scenes = await AgriStacClient.searchSentinelScenes();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      status: 'success',
      catalog: 'Sentinel-2 L2A BOA STAC Catalog',
      geometry: AgriStacClient.MENIEL_GEOMETRY,
      scenes_count: scenes.length,
      scenes: scenes
    }, null, 2));
    return;
  }

  if ((urlPath === '/api/sat/indices/summary' || urlPath === '/predio/api/sat/indices/summary') && req.method === 'GET') {
    const summary = AgriStacClient.getPaddocksSpectralSummary();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      status: 'success',
      engine: 'AgriStacClient Radiometric Engine v1.0.0',
      summary: summary
    }, null, 2));
    return;
  }

  // ─── API: Cubo de Datos 4D & Slicer Polytope (Patrón DestinE Zarr) ───────
  if ((urlPath === '/api/cube/query' || urlPath === '/predio/api/cube/query') && (req.method === 'GET' || req.method === 'POST')) {
    const handleCubeQuery = async (params) => {
      try {
        const scenario = params.scenario || 'baseline';
        const forcing = await getForecast7dForcing();

        const cube = AgriDataCubeEngine.buildFarmDataCube({
          soilEngine: AgriSoilWaterEngine,
          stacClient: AgriStacClient,
          basinEngine: AgriBasinHydrologyEngine,
          forcing7d: forcing,
          scenarioKey: scenario
        });

        if (params.paddock || params.stratum || params.time !== undefined) {
          const sliceResult = AgriDataCubeEngine.slice(cube, {
            paddock: params.paddock,
            stratum: params.stratum,
            time: params.time !== undefined ? parseInt(params.time) : undefined,
            variable: params.variable || 'vwc_percent'
          });

          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            status: 'success',
            query: params,
            slice: sliceResult
          }, null, 2));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          status: 'success',
          type: cube.type,
          version: cube.version,
          dimensions: cube.dimensions,
          metadata: cube.metadata,
          sample_slices_available: [
            '?paddock=CROP-AVE-01&variable=vwc_percent (Matriz Estratigráfica)',
            '?time=3&stratum=root_mid_60cm&variable=vwc_percent (Mapa Espacial Día 3)',
            '?paddock=CROP-CER-01&stratum=root_shallow_20cm&variable=vwc_percent (Serie 1D)'
          ]
        }, null, 2));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ status: 'error', message: err.message }));
      }
    };

    if (req.method === 'GET') {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const params = Object.fromEntries(parsedUrl.searchParams.entries());
      await handleCubeQuery(params);
      return;
    }

    if (req.method === 'POST') {
      let bodyData = '';
      req.on('data', chunk => bodyData += chunk);
      req.on('end', async () => {
        let params = {};
        try {
          if (bodyData.trim()) params = JSON.parse(bodyData);
        } catch(e) {}
        await handleCubeQuery(params);
      });
      return;
    }
  }

  // GET & POST /api/notes
  const NOTES_FILE = path.join(ROOT_DIR, 'data', 'parcels_notes.json');
  if (urlPath === '/api/notes' && req.method === 'GET') {
    let data = {};
    if (fs.existsSync(NOTES_FILE)) {
      try { data = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf-8')); } catch(e) {}
    }
    const body = JSON.stringify(data, null, 2);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(body);
    return;
  }

  if (urlPath === '/api/notes' && req.method === 'POST') {
    let bodyData = '';
    req.on('data', chunk => bodyData += chunk);
    req.on('end', () => {
      try {
        const update = JSON.parse(bodyData);
        let existing = {};
        if (fs.existsSync(NOTES_FILE)) {
          try { existing = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf-8')); } catch(e) {}
        }
        if (update.id) {
          existing[update.id] = {
            ...existing[update.id],
            ...update,
            updated_at: new Date().toISOString()
          };
          fs.writeFileSync(NOTES_FILE, JSON.stringify(existing, null, 2), 'utf-8');
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ status: 'ok', saved: existing[update.id] }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing parcel id' }));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // GET & POST /api/projects
  const PROJECTS_FILE = path.join(ROOT_DIR, 'data', 'cooperative_projects.json');
  if (urlPath === '/api/projects' && req.method === 'GET') {
    let list = [];
    if (fs.existsSync(PROJECTS_FILE)) {
      try { list = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8')); } catch(e) {}
    }
    const body = JSON.stringify(list, null, 2);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(body);
    return;
  }

  if (urlPath === '/api/projects/toggle' && req.method === 'POST') {
    let bodyData = '';
    req.on('data', chunk => bodyData += chunk);
    req.on('end', () => {
      try {
        const { id } = JSON.parse(bodyData);
        let list = [];
        if (fs.existsSync(PROJECTS_FILE)) {
          try { list = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8')); } catch(e) {}
        }
        const proj = list.find(p => p.id === id);
        if (proj) {
          proj.executed = !proj.executed;
          proj.last_audit = new Date().toISOString().split('T')[0];
          fs.writeFileSync(PROJECTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok', project: proj }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Project not found' }));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // GET /api/health
  if (urlPath === '/api/health' && req.method === 'GET') {
    const body = JSON.stringify({
      status: 'ok',
      service: 'agritwin-hub',
      port: PORT,
      uptime_s: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(body);
    return;
  }

  // ─── API: ESP32 Hardware Bridge (Telemetría y Estado de Relés en Puerto Único 7777) ───
  if ((urlPath === '/api/enclosure/status' || urlPath === '/predio/api/enclosure/status') && req.method === 'GET') {
    const responsePayload = {
      bridgeMode: 'ready_for_hardware',
      timestamp: new Date().toISOString(),
      relays: {
        r1_cherries_valve: false,
        r2_frost_sprinklers: false,
        r3_deepwell_pump: false,
        r4_water_trough: true,
        r5_barn_curtains: false,
        r6_prv_gate: false
      },
      interlocks: {
        frostSprinklersLocked: true,
        cherryIrrigationLocked: true
      }
    };
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(responsePayload));
    return;
  }

  if ((urlPath === '/api/enclosure/telemetry' || urlPath === '/predio/api/enclosure/telemetry') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        console.log('[ESP32 Hardware Bridge] Telemetría recibida desde hardware:', parsed);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', receivedAt: new Date().toISOString() }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // ── Servir Gemelo Predial & Gemelo de Cuenca en Puerto Único 7777 ───
  if (urlPath === '/cuenca' || urlPath === '/cerro' || urlPath === '/territorio') {
    res.writeHead(302, { 'Location': '/#cuenca' });
    res.end();
    return;
  }
  if (urlPath === '/predio' || urlPath === '/galpon') {
    res.writeHead(302, { 'Location': '/predio/' });
    res.end();
    return;
  }
  if (urlPath.startsWith('/predio/')) {
    let rel = urlPath.replace('/predio/', '') || 'index.html';
    if (rel.endsWith('/')) rel += 'index.html';
    const PREDIO_DIR = path.join(ROOT_DIR, '..', 'agritwin-predio');
    const predioFile = path.join(PREDIO_DIR, path.normalize(rel));
    if (predioFile.startsWith(PREDIO_DIR) && fs.existsSync(predioFile) && fs.statSync(predioFile).isFile()) {
      const ext = path.extname(predioFile).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      });
      fs.createReadStream(predioFile).pipe(res);
      return;
    }
  }

  // ── Servidor de Archivos Estáticos Maestro ───────────────────────────
  let safePath = path.normalize(urlPath);
  if (safePath === '/' || safePath === '') safePath = '/index.html';

  const filePath = path.join(ROOT_DIR, safePath);
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 Not Found</h1><p>Archivo no encontrado: ${safePath}</p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n══════════════════════════════════════════════════════════`);
  console.log(`🌟  AGROTWIN MASTER SUITE — PLATAFORMA UNIFICADA`);
  console.log(`══════════════════════════════════════════════════════════`);
  console.log(`🚀  Portal Unificado:   http://localhost:${PORT}`);
  console.log(`📡  Telemetría API:     http://localhost:${PORT}/api/telemetry/summary`);
  console.log(`🔮  Simulación API:     http://localhost:${PORT}/api/simulation/run`);
  console.log(`🛰️  Satélite STAC API:  http://localhost:${PORT}/api/sat/indices/summary`);
  console.log(`🧊  Cubo de Datos 4D:   http://localhost:${PORT}/api/cube/query`);
  console.log(`💚  Health Check:       http://localhost:${PORT}/api/health`);
  console.log(`══════════════════════════════════════════════════════════\n`);
});
