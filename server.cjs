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

function buildTelemetrySummary() {
  const now    = new Date();
  const hour   = now.getHours();

  const jitter = (base, pct = 0.03) =>
    +(base * (1 + (Math.random() - 0.5) * 2 * pct)).toFixed(2);

  const kiotNodes = [
    {
      id: 'FDR-01',
      name: 'Cerezos Lapins',
      type: 'soil_moisture_fdr',
      depth_cm: '0-20',
      lat: -36.2095,
      lng: -71.6060,
      network: 'KioT Mesh',
      status: 'online',
      readings: {
        vwc_percent: jitter(36.2),
        temp_soil_c: jitter(14.8),
        ec_dS_m: jitter(0.42),
        battery_pct: 94,
        lqi: 98,
        last_tx: now.toISOString()
      }
    },
    {
      id: 'FDR-02',
      name: 'Avellanos Tonda',
      type: 'soil_moisture_fdr',
      depth_cm: '20-60',
      lat: -36.2120,
      lng: -71.6030,
      network: 'KioT Mesh',
      status: 'online',
      readings: {
        vwc_percent: jitter(35.8),
        temp_soil_c: jitter(13.7),
        ec_dS_m: jitter(0.38),
        battery_pct: 88,
        lqi: 95,
        last_tx: now.toISOString()
      }
    },
    {
      id: 'FDR-03',
      name: 'Keyline Sur (Infiltración)',
      type: 'soil_moisture_fdr',
      depth_cm: '0-40',
      lat: -36.2145,
      lng: -71.6050,
      network: 'KioT Mesh',
      status: 'online',
      readings: {
        vwc_percent: jitter(38.4),
        temp_soil_c: jitter(14.0),
        infiltration_active: true,
        battery_pct: 95,
        lqi: 97,
        last_tx: now.toISOString()
      }
    },
    {
      id: 'FDR-04',
      name: 'Silvopastoril PRV',
      type: 'soil_moisture_fdr',
      depth_cm: '0-30',
      lat: -36.2105,
      lng: -71.6080,
      network: 'KioT Mesh',
      status: 'online',
      readings: {
        vwc_percent: jitter(36.0),
        temp_soil_c: jitter(13.9),
        ec_dS_m: jitter(0.52),
        battery_pct: 90,
        lqi: 94,
        last_tx: now.toISOString()
      }
    },
    {
      id: 'PIEZO-TQ',
      name: 'Piezómetro Tranque Colliguay',
      type: 'piezometer',
      lat: -36.2110,
      lng: -71.6045,
      network: 'KioT Mesh',
      status: 'online',
      readings: {
        volume_m3: jitter(18490, 0.005),
        cota_msnm: 198,
        capacity_pct: 100,
        autonomy_days: 45,
        battery_pct: 99,
        last_tx: now.toISOString()
      }
    }
  ];

  const publicStations = [
    {
      id: 'INIA-RETIRO',
      name: 'INIA Retiro (Agroclimática)',
      agency: 'INIA',
      lat: -36.0580,
      lng: -71.7610,
      status: 'online',
      readings: {
        temp_air_c: jitter(26.5),
        humidity_pct: jitter(32.0),
        eto_mm_day: 4.8,
        radiation_w_m2: 610,
        precip_24h_mm: 0
      }
    },
    {
      id: 'DGA-LONGAVI',
      name: 'DGA Fluviométrica Río Longaví',
      agency: 'DGA',
      lat: -36.1750,
      lng: -71.6700,
      status: 'online',
      readings: {
        caudal_m3_s: jitter(185.0),
        nivel_m: 2.15,
        trend: 'estable'
      }
    },
    {
      id: 'DMC-PARRAL',
      name: 'DMC Parral Centro (Aeronáutica)',
      agency: 'DMC',
      lat: -36.1432,
      lng: -71.8267,
      status: 'online',
      readings: {
        wind_speed_kmh: jitter(38.0),
        wind_dir: 'E-NE',
        wind_type: 'Puelche (Foehn)',
        temp_air_c: jitter(27.5),
        humidity_pct: jitter(26.0)
      }
    },
    {
      id: 'DGA-BULLILEO',
      name: 'DGA Embalse Bullileo',
      agency: 'DGA',
      lat: -36.2800,
      lng: -71.4200,
      status: 'online',
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
      fundo_colliguay: {
        lat: -36.14,
        lng: -71.78,
        rol_sii: '142-88 Retiro',
        area_ha: 12.8
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
        buffer_mitigation_pct: 45
      },
      longavi_q_m3s: 185.0,
      puelche_gusts_kmh: 38.0,
      eto_penman_monteith_mm_day: 4.8,
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

const server = http.createServer((req, res) => {
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
    const payload = buildTelemetrySummary();
    const body = JSON.stringify(payload, null, 2);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(body);
    return;
  }

  if (urlPath === '/api/basin-sync' && req.method === 'GET') {
    const telemetry = buildTelemetrySummary();
    const payload = {
      source: 'agritwin-hub-7777',
      status: 'connected',
      timestamp: new Date().toISOString(),
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

  // ── Servir Gemelo Predial y Regional Integrados en Puerto 7777 ───
  if (urlPath === '/predio' || urlPath === '/galpon') {
    res.writeHead(302, { 'Location': '/predio/' });
    res.end();
    return;
  }
  if (urlPath.startsWith('/predio/')) {
    let rel = urlPath.replace('/predio/', '') || 'index.html';
    if (rel.endsWith('/')) rel += 'index.html';
    const PREDIO_DIR = path.join(ROOT_DIR, '..', 'agritwin');
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

  if (urlPath === '/regional') {
    res.writeHead(302, { 'Location': '/regional/' });
    res.end();
    return;
  }
  if (urlPath.startsWith('/regional/')) {
    let rel = urlPath.replace('/regional/', '') || 'index.html';
    if (rel.endsWith('/')) rel += 'index.html';
    const REGIONAL_DIR = path.join(ROOT_DIR, '..', 'agritwin-regional');
    const regionalFile = path.join(REGIONAL_DIR, path.normalize(rel));
    if (regionalFile.startsWith(REGIONAL_DIR) && fs.existsSync(regionalFile) && fs.statSync(regionalFile).isFile()) {
      const ext = path.extname(regionalFile).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      });
      fs.createReadStream(regionalFile).pipe(res);
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
