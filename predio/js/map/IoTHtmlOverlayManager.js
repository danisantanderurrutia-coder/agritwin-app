/**
 * AgriTwin 3D - IoTHtmlOverlayManager Module
 * Equivalent to Drei's <Html> component for Three.js.
 * 
 * Pins interactive 3D HTML micro-cards to spatial coordinates in world space.
 * Features:
 * - Smart display modes: 'hover' (default clean), 'all', 'none'
 * - Mathematical camera projection (Vector3.project)
 * - Automatic frustum culling (hides if behind camera plane)
 * - Top-header collision avoidance (prevents overlapping top menu)
 * - Distance-adaptive scaling and opacity fade
 * - Precision Farming telemetry micro-widgets (circular moisture gauge, LoRaWAN signal, temperature)
 * - Ground anchor stem line connecting card to physical 3D probe
 */

import { bus } from '../utils/EventBus.js';

export class IoTHtmlOverlayManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.container = null;
    this.markers = []; // { id, worldPos, element, data }
    this.visible = true;

    // Smart display mode: 'hover' (default clean view) | 'all' | 'none'
    this.displayMode = 'hover';
    this.hoveredSensorId = null;
    this.selectedSensorId = null;

    // Mutually exclusive hover mode: 'sensors' | 'polygons' | 'none'
    this.hoverMode = 'sensors';
    this.hoveredPolygon = null;
    this.polygonCardEl = null;
  }

  init() {
    // Check if container already exists or create overlay layer
    let overlay = document.getElementById('iotHtmlOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'iotHtmlOverlay';
      overlay.className = 'iot-html-overlay-container';
      const parent = this.mapManager.container || document.body;
      parent.appendChild(overlay);
    }
    this.container = overlay;

    // Create Polygon 3D Floating Hover Card (mutually exclusive with sensors)
    const polyCard = document.createElement('div');
    polyCard.className = 'polygon-3d-floating-card';
    polyCard.id = 'polygon3dHoverCard';
    polyCard.style.display = 'none';
    this.container.appendChild(polyCard);
    this.polygonCardEl = polyCard;

    // Listen for layer toggles & sensor telemetry updates
    bus.on('layer:sensors', (visible) => this.toggleVisibility(visible));
    bus.on('sensor:telemetry_updated', (sensorData) => this.updateSensorData(sensorData));

    // Listen for hover & selection events to show cards on demand
    bus.on('sensor:hover', (sensorId) => this.setHoveredSensor(sensorId));
    bus.on('sensor:unhover', () => this.setHoveredSensor(null));
    bus.on('entity:hover', (entity) => {
      if (entity && (entity.type === 'sensor' || entity.sensorId)) {
        this.setHoveredSensor(entity.id || entity.sensorId);
      } else {
        this.setHoveredSensor(null);
      }
    });

    bus.on('entity:selected', (e) => {
      const isSensor = e && (e.properties?.type === 'sensor' || e.type === 'sensor' || (e.id && String(e.id).includes('sensor')));
      this.setSelectedSensor(isSensor ? e.id : null);
    });
    bus.on('entity:deselected', () => this.setSelectedSensor(null));

    // Listen for polygon hover/unhover events
    bus.on('polygon:hover', (payload) => this.onPolygonHover(payload));
    bus.on('polygon:unhover', () => this.onPolygonUnhover());

    // Listen for external mode switches
    bus.on('hover_mode:set', (mode) => this.setHoverMode(mode));
    bus.on('sensor_cards:set_mode', (mode) => this.setDisplayMode(mode));
    bus.on('sensor_cards:toggle_cycle', () => this.cycleDisplayMode());
  }

  /**
   * Registers a sensor node with its world coordinate position and telemetry
   */
  registerSensorNode(sensor, worldPos) {
    if (!this.container) this.init();

    // Check if already registered
    const existing = this.markers.find(m => m.id === sensor.id);
    if (existing) {
      existing.worldPos.copy(worldPos);
      existing.data = sensor;
      return;
    }

    const cardEl = document.createElement('div');
    cardEl.className = 'iot-3d-floating-card';
    cardEl.id = `iot_card_${sensor.id}`;
    cardEl.style.display = 'none'; // Hidden by default in hover mode

    // Anchor stem line connecting to 3D base
    const stemEl = document.createElement('div');
    stemEl.className = 'iot-card-stem-line';
    cardEl.appendChild(stemEl);

    // Card Content Wrapper
    const contentEl = document.createElement('div');
    contentEl.className = 'iot-card-inner glass-panel';
    contentEl.innerHTML = this.renderCardHtml(sensor);

    contentEl.addEventListener('click', (e) => {
      e.stopPropagation();
      bus.emit('entity:selected', {
        id: sensor.id,
        name: sensor.name,
        properties: sensor
      });
      bus.emit('sensor:highlight', sensor.id);
    });

    cardEl.appendChild(contentEl);
    this.container.appendChild(cardEl);

    this.markers.push({
      id: sensor.id,
      worldPos: worldPos.clone(),
      element: cardEl,
      data: sensor
    });
  }

  renderCardHtml(sensor) {
    const telemetry = sensor.telemetry || {};
    const moisture = telemetry.soilMoisture || sensor.metrics?.soilMoisturePercent || (32 + Math.floor(Math.random() * 14));
    const temp = telemetry.temperature !== undefined ? telemetry.temperature : (sensor.metrics?.temperatureC || 18);
    const battery = telemetry.batteryLevel || sensor.metrics?.batteryPercent || 94;

    let icon = '🌱';
    let themeColor = '#10b981';
    let typeLabel = 'Sonda Humedad';
    let dialValue = `${moisture}%`;
    let dialUnit = '%';
    let stat1Label = 'Temp';
    let stat1Val = `${temp}°C`;
    let stat2Label = 'Bat';
    let stat2Val = `${battery}%`;
    let decisionBadge = '';

    if (sensor.id.includes('FROST') || sensor.categoryMaule === 'frost_fruit_height') {
      icon = '❄️';
      themeColor = '#38bdf8';
      typeLabel = 'Helada Altura Fruta';
      const fruitT = telemetry.fruitHeightTempC !== undefined ? telemetry.fruitHeightTempC : temp;
      dialValue = `${fruitT}°`;
      stat1Label = 'Bulbo';
      stat1Val = `${telemetry.wetBulbTempC ?? -1.5}°C`;
      stat2Label = 'Abrigo 2m';
      stat2Val = `${telemetry.shelterTemp2mC ?? 2.4}°C`;
      if (fruitT <= 0) {
        decisionBadge = `<div style="margin-top:6px; font-size:9.5px; padding:2px 6px; border-radius:4px; font-weight:bold; background:rgba(239,68,68,0.2); color:#f87171; border:1px solid #ef4444;">⚠️ ${telemetry.decision?.actionNeeded || 'ALERTA HELADA'}</div>`;
      } else {
        decisionBadge = `<div style="margin-top:6px; font-size:9.5px; padding:2px 6px; border-radius:4px; font-weight:bold; background:rgba(56,189,248,0.2); color:#38bdf8; border:1px solid #0284c7;">❄️ Fruta Segura</div>`;
      }
    } else if (sensor.id.includes('LEAF') || sensor.categoryMaule === 'foliar_wetness') {
      icon = '🍃';
      themeColor = '#84cc16';
      typeLabel = 'Mojamiento Foliar';
      dialValue = `${telemetry.leafWetnessHours ?? 11.5}h`;
      stat1Label = 'Botrytis';
      stat1Val = `${Math.round((telemetry.botrytisRiskIndex ?? 0.82) * 100)}%`;
      stat2Label = 'HR';
      stat2Val = `${telemetry.humidity ?? 94}%`;
      decisionBadge = `<div style="margin-top:6px; font-size:9.5px; padding:2px 6px; border-radius:4px; font-weight:bold; background:rgba(234,179,8,0.2); color:#fde047; border:1px solid #ca8a04;">🍄 Ventana: ${telemetry.decision?.sprayWindowOptimal || 'Hoy 16:30h'}</div>`;
    } else if (sensor.id.includes('FLOW') || sensor.categoryMaule === 'water_canal_dga') {
      icon = '🚰';
      themeColor = '#0284c7';
      typeLabel = 'Caudalímetro & Canal';
      dialValue = `${telemetry.instantFlowLps ?? 24.5}L`;
      stat1Label = 'Turno Canal';
      stat1Val = `En ${telemetry.daysToNextCanalTurn ?? 4}d`;
      stat2Label = 'Reserva';
      stat2Val = `${telemetry.soilWaterReserveDays ?? 4.2}d`;
      decisionBadge = `<div style="margin-top:6px; font-size:9.5px; padding:2px 6px; border-radius:4px; font-weight:bold; background:rgba(16,185,129,0.2); color:#34d399; border:1px solid #10b981;">📜 DGA MEE OK</div>`;
    } else if (sensor.id.includes('WX') || (sensor.name && sensor.name.includes('Meteorológica'))) {
      icon = '🌤️';
      themeColor = '#f59e0b';
      typeLabel = 'Estación Microzona';
      dialValue = `${temp}°`;
      stat1Label = 'Viento';
      stat1Val = `${telemetry.sprayWindow?.windCondition ? '5.2 km/h' : 'Calmo'}`;
      stat2Label = 'Ventana';
      stat2Val = `${telemetry.sprayWindow?.windowToday ? '07:30' : 'Apta'}`;
      decisionBadge = `<div style="margin-top:6px; font-size:9.5px; padding:2px 6px; border-radius:4px; font-weight:bold; background:rgba(245,158,11,0.2); color:#fbbf24; border:1px solid #d97706;">🍒 Cracking: ${telemetry.cherryCrackingRisk?.riskLevel || 'Medio'}</div>`;
    } else if (sensor.id.includes('RIVER') || (sensor.name && sensor.name.includes('Limnígrafo'))) {
      icon = '🌊';
      themeColor = '#0284c7';
      typeLabel = 'Estero Fluvial';
    } else if (sensor.id.includes('WIND')) {
      icon = '💨';
      themeColor = '#06b6d4';
      typeLabel = 'Anemómetro';
    } else if (sensor.id.includes('BOYA')) {
      icon = '⚓';
      themeColor = '#0ea5e9';
      typeLabel = 'Boya Tranque';
    }

    const radius = 16;
    const circ = 2 * Math.PI * radius;
    const offset = circ - 0.7 * circ;

    return `
      <div class="iot-card-header">
        <span class="iot-card-icon" style="background: ${themeColor}22; border-color: ${themeColor}66;">${icon}</span>
        <div class="iot-card-title-group">
          <div class="iot-card-name">${sensor.name || sensor.id}</div>
          <div class="iot-card-type" style="color: ${themeColor}">${typeLabel}</div>
        </div>
        <div class="iot-lora-beacon" title="Señal LoRaWAN 915 MHz activa">
          <span class="iot-signal-dot"></span>
          <span class="iot-signal-bars">📶</span>
        </div>
      </div>

      <div class="iot-card-body">
        <div class="iot-metric-dial">
          <svg class="iot-dial-svg" width="40" height="40" viewBox="0 0 40 40">
            <circle class="iot-dial-bg" cx="20" cy="20" r="${radius}" />
            <circle class="iot-dial-fill" cx="20" cy="20" r="${radius}" 
              style="stroke-dasharray: ${circ}; stroke-dashoffset: ${offset}; stroke: ${themeColor};" />
          </svg>
          <div class="iot-dial-val" style="font-size: 11px;">${dialValue}</div>
        </div>

        <div class="iot-card-stats">
          <div class="iot-stat-row">
            <span class="label">${stat1Label}</span>
            <span class="val" style="color: #fff; font-weight: bold;">${stat1Val}</span>
          </div>
          <div class="iot-stat-row">
            <span class="label">${stat2Label}</span>
            <span class="val" style="color: ${themeColor}; font-weight: bold;">${stat2Val}</span>
          </div>
        </div>
      </div>
      ${decisionBadge}
    `;
  }

  updateSensorData(sensorData) {
    const marker = this.markers.find(m => m.id === sensorData.id);
    if (marker && marker.element) {
      marker.data = { ...marker.data, ...sensorData };
      const inner = marker.element.querySelector('.iot-card-inner');
      if (inner) inner.innerHTML = this.renderCardHtml(marker.data);
    }
  }

  /**
   * Main projection loop called continuously on camera render frame.
   * Maps 3D world coordinates to CSS pixel coordinates on the overlay canvas.
   */
  update() {
    if (!this.visible || !this.mapManager.camera || !this.mapManager.container) return;

    const camera = this.mapManager.camera;
    const width = this.mapManager.container.clientWidth || window.innerWidth;
    const height = this.mapManager.container.clientHeight || window.innerHeight;
    const tempV = new THREE.Vector3();

    // 1. MODO POLÍGONOS EXCLUSIVO: Proyectar tarjeta flotante de polígono / parcela, silenciar sensores
    if (this.hoverMode === 'polygons') {
      for (let i = 0; i < this.markers.length; i++) {
        this.markers[i].element.style.display = 'none';
      }

      if (this.hoveredPolygon && this.polygonCardEl && this.hoveredPolygon.worldPos) {
        tempV.copy(this.hoveredPolygon.worldPos).add(new THREE.Vector3(0, 1.4, 0));
        tempV.project(camera);

        const isBehind = tempV.z > 1.0;
        if (isBehind) {
          this.polygonCardEl.style.display = 'none';
        } else {
          const screenX = (tempV.x * 0.5 + 0.5) * width;
          let screenY = (-(tempV.y * 0.5) + 0.5) * height;

          // Evitar colisión con header superior
          if (screenY < 85 && screenX > 14 && screenX < (width - 195)) {
            screenY = 92;
          }

          this.polygonCardEl.style.display = 'block';
          this.polygonCardEl.style.transform = `translate(-50%, -100%) translate3d(${screenX}px, ${screenY}px, 0px)`;
        }
      } else if (this.polygonCardEl) {
        this.polygonCardEl.style.display = 'none';
      }
      return;
    }

    // 2. MODO DESACTIVADO ('none'): Ocultar todo
    if (this.hoverMode === 'none' || this.displayMode === 'none') {
      for (let i = 0; i < this.markers.length; i++) {
        this.markers[i].element.style.display = 'none';
      }
      if (this.polygonCardEl) this.polygonCardEl.style.display = 'none';
      return;
    }

    // 3. MODO SENSORES: Ocultar polígonos y proyectar tarjetas de sensores
    if (this.polygonCardEl) this.polygonCardEl.style.display = 'none';

    for (let i = 0; i < this.markers.length; i++) {
      const m = this.markers[i];

      // En modo 'hover', solo mostrar si está bajo hover o seleccionado
      if (this.displayMode === 'hover') {
        const isHovered = (m.id === this.hoveredSensorId || `sensor_${m.id}` === this.hoveredSensorId);
        const isSelected = (m.id === this.selectedSensorId || `sensor_${m.id}` === this.selectedSensorId);
        if (!isHovered && !isSelected) {
          m.element.style.display = 'none';
          continue;
        }
      }

      // Elevar punto de proyección sobre el poste físico
      tempV.copy(m.worldPos).add(new THREE.Vector3(0, 3.8, 0));
      const dist = camera.position.distanceTo(tempV);

      tempV.project(camera);
      const isBehind = tempV.z > 1.0;
      const isTooFar = dist > 145;

      if (isBehind || isTooFar) {
        m.element.style.display = 'none';
        continue;
      }

      const screenX = (tempV.x * 0.5 + 0.5) * width;
      let screenY = (-(tempV.y * 0.5) + 0.5) * height;

      if (screenY < 85 && screenX > 14 && screenX < (width - 195)) {
        screenY = 92;
      }

      m.element.style.display = 'block';
      const scale = Math.max(0.70, Math.min(1.0, 38.0 / dist));
      const opacity = dist > 105 ? Math.max(0.2, 1.0 - (dist - 105) / 40) : 1.0;

      m.element.style.transform = `translate(-50%, -100%) translate3d(${screenX}px, ${screenY}px, 0px) scale(${scale})`;
      m.element.style.opacity = opacity.toFixed(2);
    }
  }

  setHoverMode(mode) {
    if (['sensors', 'polygons', 'none'].includes(mode)) {
      this.hoverMode = mode;
      if (mode === 'polygons') {
        for (let i = 0; i < this.markers.length; i++) {
          this.markers[i].element.style.display = 'none';
        }
        bus.emit('sensor_labels:toggle', false);
      } else if (mode === 'sensors') {
        if (this.polygonCardEl) this.polygonCardEl.style.display = 'none';
        this.hoveredPolygon = null;
        bus.emit('sensor_labels:toggle', true);
      } else if (mode === 'none') {
        for (let i = 0; i < this.markers.length; i++) {
          this.markers[i].element.style.display = 'none';
        }
        if (this.polygonCardEl) this.polygonCardEl.style.display = 'none';
        this.hoveredPolygon = null;
        bus.emit('sensor_labels:toggle', false);
      }
      console.log(`🏷️ Modo de hover exclusivo fijado a: ${mode}`);
    }
  }

  onPolygonHover(payload) {
    if (this.hoverMode !== 'polygons' || !this.polygonCardEl) return;
    if (!payload || !payload.data) return;

    this.hoveredPolygon = payload;
    this.polygonCardEl.innerHTML = this.renderPolygonCardHtml(payload.data);
    this.polygonCardEl.style.display = 'block';
  }

  onPolygonUnhover() {
    this.hoveredPolygon = null;
    if (this.polygonCardEl) {
      this.polygonCardEl.style.display = 'none';
    }
  }

  renderPolygonCardHtml(data) {
    const name = data.name || data.cropType || 'Polígono de Cultivo';
    const cropType = data.cropType || data.itemName || 'Cultivo Agrícola';
    const rawArea = data.areaHa !== undefined ? data.areaHa : (data.properties?.areaHa);
    const area = rawArea !== undefined && !isNaN(rawArea) ? `${Number(rawArea).toFixed(2)} ha` : '—';
    const ndvi = data.ndvi || data.properties?.ndvi || '0.78 (Óptimo)';
    const soil = data.soilType || data.properties?.soilType || 'Franco-Arcilloso';
    const irrigation = data.irrigationType || data.properties?.irrigationType || 'Goteo Tecnificado';
    const status = data.variety || data.status || data.properties?.status || 'Vigor Alto';
    const color = data.color || data.baseColor || '#10b981';

    let icon = data.icon || '🌾';
    const lower = (cropType + ' ' + name).toLowerCase();
    if (lower.includes('cerezo')) icon = '🍒';
    else if (lower.includes('trigo')) icon = '🌾';
    else if (lower.includes('avellano')) icon = '🌰';
    else if (lower.includes('solar') || lower.includes('agrovoltaico')) icon = '☀️';
    else if (lower.includes('agua') || lower.includes('tranque') || lower.includes('estanque')) icon = '💧';
    else if (lower.includes('pastura') || lower.includes('voisin')) icon = '🌱';

    return `
      <div class="poly-card-inner" style="border-left: 4px solid ${color};">
        <div class="poly-card-header">
          <span class="poly-card-icon" style="background: ${color}22; border-color: ${color}66;">${icon}</span>
          <div class="poly-card-title-group">
            <div class="poly-card-name">${name}</div>
            <div class="poly-card-crop" style="color: ${color};">${cropType.toUpperCase()}</div>
          </div>
          <div class="poly-card-badge" style="background: rgba(16, 185, 129, 0.18); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35);">
            ${status}
          </div>
        </div>
        <div class="poly-card-metrics">
          <div class="poly-metric-item">
            <span class="poly-metric-lbl">📐 Superficie</span>
            <span class="poly-metric-val" style="color: var(--accent-cyan); font-weight: bold;">${area}</span>
          </div>
          <div class="poly-metric-item">
            <span class="poly-metric-lbl">🌿 Vigor NDVI</span>
            <span class="poly-metric-val" style="color: #4ade80; font-weight: bold;">${ndvi}</span>
          </div>
          <div class="poly-metric-item">
            <span class="poly-metric-lbl">💧 Riego</span>
            <span class="poly-metric-val" style="color: #38bdf8;">${irrigation}</span>
          </div>
          <div class="poly-metric-item">
            <span class="poly-metric-lbl">🪨 Suelo</span>
            <span class="poly-metric-val" style="color: #cbd5e1;">${soil}</span>
          </div>
        </div>
      </div>
    `;
  }

  setDisplayMode(mode) {
    if (['hover', 'all', 'none'].includes(mode)) {
      this.displayMode = mode;
      bus.emit('sensor_cards:mode_changed', mode);
      console.log(`🏷️ IoT 3D Cards display mode: ${mode}`);
    }
  }

  cycleDisplayMode() {
    const next = this.displayMode === 'hover' ? 'all' : (this.displayMode === 'all' ? 'none' : 'hover');
    this.setDisplayMode(next);
    return next;
  }

  setHoveredSensor(sensorId) {
    this.hoveredSensorId = sensorId;
  }

  setSelectedSensor(sensorId) {
    this.selectedSensorId = sensorId;
  }

  toggleVisibility(visible) {
    this.visible = visible;
    if (this.container) {
      this.container.style.display = visible ? 'block' : 'none';
    }
  }

  clear() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.markers = [];
  }
}
