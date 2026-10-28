// Servidor HTTP estático nativo y ultraligero para AgriTwin 3D
// No requiere npm install ni dependencias externas.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 7777;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.geojson': 'application/geo+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.wasm': 'application/wasm',
  '.zip': 'application/zip',
  '.shp': 'application/octet-stream',
  '.dbf': 'application/octet-stream',
  '.shx': 'application/octet-stream',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream'
};

const server = http.createServer((req, res) => {
  // Manejo de CORS para recursos locales
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlPath = decodeURI(req.url.split('?')[0]);

  // ─── API: Acople Regional ↔ Predial (Unificado en Tronco Hub :7777) ─────────
  if (urlPath === '/api/basin-sync') {
    const regionalReq = http.get('http://127.0.0.1:7777/api/telemetry/summary', { timeout: 1200 }, (regRes) => {
      let data = '';
      regRes.on('data', chunk => data += chunk);
      regRes.on('end', () => {
        try {
          const regJson = JSON.parse(data);
          const combined = {
            source: 'agritwin-hub-7777',
            status: 'connected',
            timestamp: new Date().toISOString(),
            fundoMeniel: {
              areaHa: 24.8,
              tranqueM3: 18500,
              tranqueFillPct: 92,
              retentionBufferingPct: 3.2,
              fwiIndex: 18,
              soilMoistureAvg: 36.2
            },
            regionalCuenca: regJson
          };
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(combined));
        } catch (_) {
          serveFallbackTelemetry(res);
        }
      });
    });

    regionalReq.on('error', () => {
      serveFallbackTelemetry(res);
    });
    regionalReq.on('timeout', () => {
      regionalReq.destroy();
      serveFallbackTelemetry(res);
    });
    return;
  }

  if (urlPath === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'agritwin-predial-1', port: PORT }));
    return;
  }

  // ─── API: ESP32 Hardware Bridge (Telemetría y Estado de Relés) ───────────────
  if (urlPath === '/api/enclosure/status') {
    // Devuelve el estado actual de los interruptores para que un ESP32 real accione sus relés físicos
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
        frostSprinklersLocked: true, // Twb < -0.5
        cherryIrrigationLocked: true  // Rain forecast > 10mm
      }
    };
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(responsePayload));
    return;
  }

  if (urlPath === '/api/enclosure/telemetry' && req.method === 'POST') {
    // Permite que un ESP32 real inyecte lecturas de sensores (BME280/SHT45/PHYTOS-31)
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        console.log('[ESP32 Hardware Bridge] Telemetría recibida desde hardware real:', parsed);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', receivedAt: new Date().toISOString() }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // Parsear URL y proteger contra directory traversal
  let safePath = path.normalize(urlPath);
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  const filePath = path.join(ROOT_DIR, safePath);

  // Asegurar que la ruta esté dentro de ROOT_DIR
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${safePath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function serveFallbackTelemetry(res) {
  const fallback = {
    source: 'predial-calibrated-fao56',
    timestamp: new Date().toISOString(),
    fundoMeniel: {
      areaHa: 24.8,
      tranqueM3: 18500,
      tranqueFillPct: 92,
      retentionBufferingPct: 3.2,
      fwiIndex: 18,
      soilMoistureAvg: 36.2
    },
    regionalCuenca: {
      cuenca: 'Parral - Retiro (122.000 ha)',
      rioLongaviFlowM3s: 142.5,
      fwiRegional: 38,
      vientoPuelcheKmH: 24,
      alertLevel: 'MODERADA'
    }
  };
  const body = JSON.stringify(fallback, null, 2);
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-cache'
  });
  res.end(body);
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[AgriTwin 3D] Servidor activo en http://localhost:${PORT}`);
});
