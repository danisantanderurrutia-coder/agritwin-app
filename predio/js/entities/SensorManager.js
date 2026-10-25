/**
 * AgriTwin - SensorManager Module (Distinct 3D Sensor Icons & 3D Glowing Selection Highlight)
 * 
 * Sensor Types & Icons:
 *  - 🌱 Soil Moisture Probe (ESP32-S3 + LoRaWAN)
 *  - 💧 Fluvial Estero Station (ESP32-C3)
 *  - 🌤️ Weather Station Central (STM32 LTE-M)
 * 
 * Features:
 *  - Highlight 3D Sensor Node with camera fly-to and pulsing emissive light halo on map
 *  - Real-time status ring color updates driven by telemetry events
 */

import { bus } from '../utils/EventBus.js';
import { MapManager } from '../map/MapManager.js';
import { IoTHtmlOverlayManager } from '../map/IoTHtmlOverlayManager.js';

export class SensorManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.scene = mapManager.scene;
    this.sensorGroup = new THREE.Group();
    this.sensorGroup.name = 'sensorGroup';
    this.scene.add(this.sensorGroup);
    this.sensorMap = new Map();
    this.visible = true;
    this.highlightedSensorId = null;

    // 3D Floating HTML Micro-Cards (Civilization VI / Farm Sim widget overlay)
    this.htmlOverlay = new IoTHtmlOverlayManager(mapManager);
    this.mapManager.addAnimated(this.sensorGroup, () => this.htmlOverlay.update());
  }

  renderSensors(sensors) {
    sensors.forEach(sensor => {
      const pos = MapManager.latLonToVector3(
        sensor.location.longitude,
        sensor.location.latitude,
        0.45
      );

      const sensorMeshGroup = new THREE.Group();
      sensorMeshGroup.name = sensor.id;
      sensorMeshGroup.position.set(pos.x, pos.y, pos.z);

      // Determine sensor type & icon symbol
      let iconSymbol = '🌱';
      let frameColor = '#10b981';

      if (sensor.id.includes('WX') || sensor.name.includes('Meteorológica')) {
        iconSymbol = '🌤️';
        frameColor = '#f59e0b'; // Amber for weather station
      } else if (sensor.id.includes('WIND') || sensor.name.includes('Anemómetro')) {
        iconSymbol = '💨';
        frameColor = '#06b6d4'; // Cyan for wind station
      } else if (sensor.id.includes('RIVER') || sensor.name.includes('Limnígrafo')) {
        iconSymbol = '🌊';
        frameColor = '#0284c7'; // Deep cyan for river gauge
      } else if (sensor.id.includes('PIEZO') || sensor.name.includes('Piezométrica')) {
        iconSymbol = '💧';
        frameColor = '#38bdf8'; // Sky blue for groundwater well
      } else if (sensor.id.includes('BOYA') || sensor.name.includes('Boya')) {
        iconSymbol = '⚓';
        frameColor = '#0ea5e9'; // Marine blue for water quality buoy
      } else if (sensor.id.includes('DENDRO') || sensor.name.includes('Dendrómetro')) {
        iconSymbol = '📏';
        frameColor = '#8b5cf6'; // Violet for trunk micrometer
      } else if (sensor.id.includes('PEST') || sensor.name.includes('Trampa')) {
        iconSymbol = '🦋';
        frameColor = '#ec4899'; // Pink for pheromone trap
      } else if (sensor.id.includes('SOLAR') || sensor.name.includes('Piranómetro')) {
        iconSymbol = '☀️';
        frameColor = '#eab308'; // Yellow for solar radiation sensor
      } else if (sensor.id.includes('FROST') || sensor.categoryMaule === 'frost_fruit_height') {
        iconSymbol = '❄️';
        frameColor = '#38bdf8'; // Ice blue for fruit-height frost probe
      } else if (sensor.id.includes('LEAF') || sensor.categoryMaule === 'foliar_wetness') {
        iconSymbol = '🍃';
        frameColor = '#84cc16'; // Lime leaf green for foliar wetness
      } else if (sensor.id.includes('FLOW') || sensor.categoryMaule === 'water_canal_dga') {
        iconSymbol = '🚰';
        frameColor = '#0ea5e9'; // Water cyan for canal/well flow meter
      } else if (sensor.name.includes('Estero') || sensor.name.includes('Ribereña')) {
        iconSymbol = '💧';
        frameColor = '#0284c7';
      }

      // 1. Metallic Sensor Pole & Enclosure
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.15, 3.4, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.8, roughness: 0.3 });
      const poleMesh = new THREE.Mesh(poleGeo, poleMat);
      poleMesh.position.y = 1.7;
      poleMesh.castShadow = true;
      sensorMeshGroup.add(poleMesh);

      // Sleek modern compact IoT antenna cap
      const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8);
      const antennaMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.8, roughness: 0.2 });
      const antennaMesh = new THREE.Mesh(antennaGeo, antennaMat);
      antennaMesh.position.set(0, 3.25, 0);
      sensorMeshGroup.add(antennaMesh);

      // Distinctive 3D Hardware attachments
      if (sensor.id.includes('WIND') || sensor.name.includes('Anemómetro')) {
        const headGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.4, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: '#06b6d4', metalness: 0.7, roughness: 0.2 });
        const headMesh = new THREE.Mesh(headGeo, headMat);
        headMesh.position.set(0, 3.5, 0);
        sensorMeshGroup.add(headMesh);

        // Ultrasonic cross transducers
        const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
        armGeo.rotateZ(Math.PI / 2);
        const arm1 = new THREE.Mesh(armGeo, poleMat);
        arm1.position.set(0, 3.7, 0);
        sensorMeshGroup.add(arm1);

        const arm2 = new THREE.Mesh(armGeo, poleMat);
        arm2.position.set(0, 3.7, 0);
        arm2.rotation.y = Math.PI / 2;
        sensorMeshGroup.add(arm2);
      } else if (sensor.id.includes('WX') || sensor.name.includes('Meteorológica')) {
        // Radiation shield cylinder
        const shieldGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.6, 16);
        const shieldMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.1 });
        const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
        shieldMesh.position.set(0, 2.2, 0.25);
        sensorMeshGroup.add(shieldMesh);
      } else if (sensor.id.includes('RIVER') || sensor.name.includes('Limnígrafo')) {
        // Horizontal gantry arm pointing downwards to measure water elevation
        const armGantry = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.08), poleMat);
        armGantry.position.set(0.8, 3.3, 0);
        sensorMeshGroup.add(armGantry);
        const hornGeo = new THREE.ConeGeometry(0.2, 0.3, 12);
        hornGeo.rotateX(Math.PI);
        const horn = new THREE.Mesh(hornGeo, new THREE.MeshStandardMaterial({ color: '#0284c7' }));
        horn.position.set(1.5, 3.1, 0);
        sensorMeshGroup.add(horn);
      } else if (sensor.id.includes('BOYA') || sensor.name.includes('Boya')) {
        // Yellow marine flotation ring
        const buoyRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.8, 0.25, 12, 24),
          new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.3 })
        );
        buoyRing.rotateX(Math.PI / 2);
        buoyRing.position.y = 0.4;
        sensorMeshGroup.add(buoyRing);
      } else if (sensor.id.includes('DENDRO') || sensor.name.includes('Dendrómetro')) {
        // Collar band around trunk
        const collar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16, 1, true),
          new THREE.MeshStandardMaterial({ color: '#8b5cf6', metalness: 0.8 })
        );
        collar.position.y = 1.0;
        sensorMeshGroup.add(collar);
      } else if (sensor.id.includes('PEST') || sensor.name.includes('Trampa')) {
        // Triangular delta trap
        const trapGeo = new THREE.ConeGeometry(0.4, 0.5, 3);
        const trapMat = new THREE.MeshStandardMaterial({ color: '#fbcfe8', roughness: 0.4 });
        const trap = new THREE.Mesh(trapGeo, trapMat);
        trap.position.set(0.4, 2.0, 0);
        sensorMeshGroup.add(trap);
      } else if (sensor.id.includes('SOLAR') || sensor.name.includes('Piranómetro')) {
        // Glass dome pyranometer
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 0.8, roughness: 0.1 })
        );
        dome.position.set(0, 3.25, 0);
        sensorMeshGroup.add(dome);
      } else if (sensor.id.includes('FROST') || sensor.categoryMaule === 'frost_fruit_height') {
        // Low-elevation fruit-height arm (1.2m) with miniature SHT45 radiation aspirator
        const armGeo = new THREE.BoxGeometry(0.8, 0.06, 0.06);
        const armMesh = new THREE.Mesh(armGeo, poleMat);
        armMesh.position.set(0.4, 1.2, 0);
        sensorMeshGroup.add(armMesh);

        // Micro sensor tip pointing downwards toward crop canopy
        const probeTip = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 0.25, 12),
          new THREE.MeshStandardMaterial({ color: '#38bdf8', metalness: 0.8, roughness: 0.2 })
        );
        probeTip.position.set(0.8, 1.1, 0);
        sensorMeshGroup.add(probeTip);
      } else if (sensor.id.includes('LEAF') || sensor.categoryMaule === 'foliar_wetness') {
        // PHYTOS-31 artificial leaf wetness grid blade angled at 45 degrees
        const bladeGeo = new THREE.BoxGeometry(0.35, 0.02, 0.65);
        const bladeMat = new THREE.MeshStandardMaterial({ color: '#84cc16', roughness: 0.3 });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.set(0.45, 1.6, 0);
        blade.rotation.x = Math.PI / 4;
        sensorMeshGroup.add(blade);
      } else if (sensor.id.includes('FLOW') || sensor.categoryMaule === 'water_canal_dga') {
        // Electromagnetic flow meter pipe spool DN100 with flanges & antenna
        const pipeGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.2, 16);
        pipeGeo.rotateZ(Math.PI / 2);
        const pipeMat = new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.7, roughness: 0.3 });
        const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
        pipeMesh.position.set(0, 0.6, 0);
        sensorMeshGroup.add(pipeMesh);

        // Flanges
        const flangeGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.08, 16);
        flangeGeo.rotateZ(Math.PI / 2);
        const fl1 = new THREE.Mesh(flangeGeo, poleMat);
        fl1.position.set(-0.55, 0.6, 0);
        const fl2 = new THREE.Mesh(flangeGeo, poleMat);
        fl2.position.set(0.55, 0.6, 0);
        sensorMeshGroup.add(fl1);
        sensorMeshGroup.add(fl2);
      }

      // 2. Glowing Ground Status Ring (Highlight halo)
      const ringColorHex = this.getStatusColorHex(sensor.telemetry.status);
      const ringGeo = new THREE.RingGeometry(0.9, 1.4, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.05;
      sensorMeshGroup.add(ringMesh);

      // 3. Floating 3D Sensor Badge deshabilitado para hiperrealismo (el sensor cuenta con hardware diegético y HTML Micro-Cards)
      const entityData = {
        type: 'sensor',
        id: `sensor_${sensor.id}`,
        sensorId: sensor.id,
        name: sensor.name,
        hardware: sensor.hardware,
        protocol: sensor.protocol,
        telemetry: sensor.telemetry,
        history: sensor.history || [],
        iconSymbol: iconSymbol
      };

      this.addFloatingSensorBadge(sensorMeshGroup, iconSymbol, frameColor, entityData);

      sensorMeshGroup.userData = entityData;
      this.sensorGroup.add(sensorMeshGroup);
      this.mapManager.addPickable(poleMesh, entityData);

      this.sensorMap.set(sensor.id, {
        group: sensorMeshGroup,
        ringMesh: ringMesh,
        ringMat: ringMat,
        position: new THREE.Vector3(pos.x, pos.y, pos.z),
        entityData: entityData,
        labelSprite: entityData.labelSprite
      });

      // Register with 3D Floating HTML Micro-Cards (Drei <Html> equivalent)
      this.htmlOverlay.registerSensorNode(sensor, new THREE.Vector3(pos.x, pos.y, pos.z));
    });

    // Listen for telemetry updates, highlights & profile changes
    bus.on('sensor:telemetry_updated', (sensorData) => this.onTelemetryUpdated(sensorData));
    bus.on('sensor:highlight', (sensorId) => this.highlightSensor(sensorId));
    bus.on('layer:sensors', (visible) => this.toggleVisibility(visible));
    bus.on('profile:active_changed', (profile) => this.setProfile(profile));
    bus.on('simulation:tick', (simData) => this.onSimulationTick(simData));
    bus.on('sensor_labels:toggle', (visible) => {
      this.sensorMap.forEach(item => {
        if (item.labelSprite) {
          item.labelSprite.visible = visible;
        }
      });
    });

    console.log(`Rendered ${this.sensorMap.size} IoT sensor posts with dynamic multi-profile billboards.`);
  }

  setProfile(profile) {
    this.currentProfile = profile;
    this.updateAllProfileSprites();
  }

  onSimulationTick(simData) {
    this.latestSimData = simData;
    this.updateAllProfileSprites();
  }

  updateAllProfileSprites() {
    this.sensorMap.forEach((item) => {
      if (item.labelSprite && item.labelSprite.userData?.updateTexture) {
        item.labelSprite.userData.updateTexture(this.currentProfile || 'enterprise', this.latestSimData);
      }
    });
  }

  getStatusColorHex(status) {
    switch (status) {
      case 'optimal': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#64748b';
    }
  }

  addFloatingSensorBadge(parentGroup, symbol, frameColor, entityData) {
    const hexGroup = new THREE.Group();
    hexGroup.position.set(0, 4.8, 0);

    const hexGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.3, 6);
    const hexMat = new THREE.MeshStandardMaterial({
      color: frameColor,
      metalness: 0.7,
      roughness: 0.2,
      flatShading: true
    });
    const hexMesh = new THREE.Mesh(hexGeo, hexMat);
    hexMesh.castShadow = true;
    hexGroup.add(hexMesh);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 128, 128);
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const topGeo = new THREE.CircleGeometry(1.0, 6);
    topGeo.rotateX(-Math.PI / 2);
    const topMat = new THREE.MeshBasicMaterial({ map: texture });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 0.16;
    hexGroup.add(topMesh);

    // ─── Billboard Icon Sprite (Visible directly facing camera) ───
    const iconCanvas = document.createElement('canvas');
    iconCanvas.width = 128;
    iconCanvas.height = 128;
    const iconCtx = iconCanvas.getContext('2d');
    iconCtx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    iconCtx.beginPath();
    iconCtx.arc(64, 64, 56, 0, Math.PI * 2);
    iconCtx.fill();
    iconCtx.strokeStyle = frameColor || '#10b981';
    iconCtx.lineWidth = 6;
    iconCtx.stroke();
    iconCtx.font = '64px sans-serif';
    iconCtx.textAlign = 'center';
    iconCtx.textBaseline = 'middle';
    iconCtx.fillText(symbol, 64, 64);

    const iconTexture = new THREE.CanvasTexture(iconCanvas);
    const iconMat = new THREE.SpriteMaterial({ map: iconTexture, transparent: true, depthWrite: false });
    const iconSprite = new THREE.Sprite(iconMat);
    iconSprite.position.set(0, 0.9, 0);
    iconSprite.scale.set(2.4, 2.4, 1.0);
    hexGroup.add(iconSprite);

    // ─── Etiqueta Flotante Dinámica Adaptada al viewMode ───
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 384;
    spriteCanvas.height = 96;
    const spriteCtx = spriteCanvas.getContext('2d');
    const spriteTexture = new THREE.CanvasTexture(spriteCanvas);
    const spriteMat = new THREE.SpriteMaterial({ map: spriteTexture, transparent: true, depthWrite: false });
    const labelSprite = new THREE.Sprite(spriteMat);
    labelSprite.position.set(0, 2.6, 0);
    labelSprite.scale.set(5.5, 1.4, 1.0);
    labelSprite.visible = true; // Activo para lectura directa de métricas y símbolos
    hexGroup.add(labelSprite);

    const updateSpriteTexture = (profile, simData) => {
      spriteCtx.clearRect(0, 0, 384, 96);

      let title = entityData.name || 'Nodo IoT';
      let metricText = '';
      let badgeColor = '#10b981';

      const telem = entityData.telemetry || {};
      const moistureL2 = telem.soilMoistureLayer2 || telem.soilMoisture || 36.2;
      const moistureL1 = telem.soilMoistureLayer1 || 24.8;
      const moistureL3 = telem.soilMoistureLayer3 || 42.5;

      if (profile === 'enterprise') {
        badgeColor = '#10b981';
        title = `🍇 ${entityData.name} • ENTERPRISE`;
        metricText = `L1: ${moistureL1}% | L2: ${moistureL2}% | Riego: 5.8mm`;
      } else if (profile === 'territorial') {
        badgeColor = '#38bdf8';
        title = `🏛️ ${entityData.name} • TERRITORIAL`;
        const fwi = simData?.territorial?.fwiScore || 38;
        metricText = `FWI: ${fwi} (Piro-Riesgo) • Acuífero: 68%`;
      } else if (profile === 'esg') {
        badgeColor = '#f59e0b';
        title = `🌿 ${entityData.name} • ESG LEDGER`;
        const carbon = simData?.esg?.carbonTco2eHa || 4.8;
        metricText = `Carbono: ${carbon} tCO2e/ha • IEI: 0.88`;
      } else {
        // Modo Estudio / Sandbox
        badgeColor = '#a855f7';
        title = `⚙️ ${entityData.name} (${entityData.protocol || 'LoRaWAN'})`;
        metricText = `Hum: ${moistureL2}% | Temp: ${telem.temperature || 22}°C`;
      }

      // Dibujar tarjeta glassmorphic en canvas
      spriteCtx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      spriteCtx.strokeStyle = badgeColor;
      spriteCtx.lineWidth = 4;
      
      // Rectángulo redondeado
      const x = 8, y = 8, w = 368, h = 80, r = 16;
      spriteCtx.beginPath();
      spriteCtx.moveTo(x + r, y);
      spriteCtx.arcTo(x + w, y, x + w, y + h, r);
      spriteCtx.arcTo(x + w, y + h, x, y + h, r);
      spriteCtx.arcTo(x, y + h, x, y, r);
      spriteCtx.arcTo(x, y, x + w, y, r);
      spriteCtx.closePath();
      spriteCtx.fill();
      spriteCtx.stroke();

      // Textos
      spriteCtx.fillStyle = '#ffffff';
      spriteCtx.font = 'bold 22px sans-serif';
      spriteCtx.textAlign = 'center';
      spriteCtx.fillText(title, 192, 38);

      spriteCtx.fillStyle = badgeColor;
      spriteCtx.font = 'bold 20px monospace';
      spriteCtx.fillText(metricText, 192, 68);

      spriteTexture.needsUpdate = true;
    };

    labelSprite.userData = { updateTexture: updateSpriteTexture };
    updateSpriteTexture(this.currentProfile || 'enterprise', this.latestSimData);
    entityData.labelSprite = labelSprite;

    parentGroup.add(hexGroup);
    this.mapManager.addPickable(hexMesh, entityData);

    this.mapManager.addAnimated(hexGroup, (time) => {
      hexGroup.position.y = 4.8 + Math.sin(time * 0.004 + parentGroup.position.x) * 0.3;
      hexGroup.rotation.y = time * 0.0008;
    });
  }

  /**
   * Highlights selected sensor node with camera fly-to and pulsing emissive 3D halo
   */
  highlightSensor(sensorId) {
    const cleanId = sensorId.replace('sensor_', '');
    const item = this.sensorMap.get(cleanId);
    if (!item) return;

    this.highlightedSensorId = cleanId;

    // Smooth camera fly-to focus
    const targetPos = new THREE.Vector3(item.position.x + 8, 14, item.position.z + 14);
    const targetLookAt = new THREE.Vector3(item.position.x, 2, item.position.z);
    this.mapManager.animateCamera(targetPos, targetLookAt, 1000);

    // Trigger pulsing scale & color highlight effect
    let pulseCount = 0;
    const pulseInterval = setInterval(() => {
      pulseCount++;
      const scale = 1.0 + Math.sin(pulseCount * 0.5) * 0.4;
      item.ringMesh.scale.set(scale, scale, scale);

      if (pulseCount > 20) {
        clearInterval(pulseInterval);
        item.ringMesh.scale.set(1.0, 1.0, 1.0);
      }
    }, 60);

    // Emit selection event
    bus.emit('entity:selected', {
      id: item.entityData.id,
      name: item.entityData.name,
      properties: item.entityData
    });
  }

  onTelemetryUpdated(sensorData) {
    const item = this.sensorMap.get(sensorData.id);
    if (item) {
      item.entityData.telemetry = sensorData.telemetry;
      item.entityData.history = sensorData.history;
      item.ringMat.color.set(this.getStatusColorHex(sensorData.telemetry.status));
      if (item.labelSprite && item.labelSprite.userData?.updateTexture) {
        item.labelSprite.userData.updateTexture(this.currentProfile || 'enterprise', this.latestSimData);
      }
    }
  }

  toggleVisibility(visible) {
    this.visible = visible;
    this.sensorGroup.visible = visible;
    if (this.htmlOverlay) {
      this.htmlOverlay.toggleVisibility(visible);
    }
  }
}
