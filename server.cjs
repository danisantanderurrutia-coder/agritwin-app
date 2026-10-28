// ═══════════════════════════════════════════════════════════════════════════════
// AgroTwin Master Suite — Servidor Unificado (Predio, Vecindario y Cuenca)
// Puerto 7777 — Plataforma Consolidada Single-Pane-of-Glass
// ═══════════════════════════════════════════════════════════════════════════════
const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

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
      network: 'KioT Mesh (Simulado - Prototipo)',
      status: 'simulado',
      is_simulated: true,
      simulation_basis: 'Simulado (Prototipo batimétrico de tranque 18.500 m³)',
      readings: {
        volume_m3: 18490,
        cota_msnm: 198,
        capacity_pct: 100,
        autonomy_days: 45,
        battery_pct: 99,
        last_tx: now.toISOString(),
        simulation_notice: 'Lectura modelada (Prototipo)'
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
      agency: 'DGA (Referencial)',
      lat: -36.1750,
      lng: -71.6700,
      status: 'simulado',
      is_real: false,
      source: 'DGA - Registro histórico de referencia / Estimación de cuenca (Simulado)',
      readings: {
        caudal_m3_s: 14.5,
        nivel_m: 1.45,
        trend: 'estable',
        simulation_notice: 'Caudal base estacional modelado (sin telemetría continua DGA abierta)'
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
      agency: 'DGA',
      lat: -36.2800,
      lng: -71.4200,
      status: 'referencial',
      is_real: false,
      source: 'DGA Embalse Bullileo - Registro oficial estacional (Referencial)',
      readings: {
        volume_hm3: 85.8,
        cota_msnm: 395,
        fill_pct: 78
      }
    }
  ];

  return {
    meta: {
      service: 'agritwin-hub',
      version: '3.0-unified',
      port: PORT,
      cuenca: 'Maule Sur (Parral – Retiro)',
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
        buffer_mitigation_pct: 45,
        source: 'Estimación índice FWI (Simulado)'
      },
      longavi_q_m3s: 14.5,
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
    const payload = {
      source: 'agritwin-hub-7777',
      status: 'connected',
      timestamp: new Date().toISOString(),
      weather_source: liveWeather.source,
      weather_is_real: liveWeather.is_real,
      macro_fwi: telemetry.derived.fwi.value,
      macro_fwi_label: telemetry.derived.fwi.label,
      q_longavi_m3_s: telemetry.derived.longavi_q_m3s,
      puelche_gusts_kmh: telemetry.derived.puelche_gusts_kmh,
      aprs_summary: telemetry.apr_summary,
      buffer_mitigation_pct: 45,
      tranque_keyline_capacity_m3: 18500
    };
    const body = JSON.stringify(payload, null, 2);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(body);
    return;
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

  // ── Servir Gemelo Predial (agritwin-predio) Integrado en Puerto Único 7777 ───
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
  console.log(`💚  Health Check:       http://localhost:${PORT}/api/health`);
  console.log(`══════════════════════════════════════════════════════════\n`);
});
