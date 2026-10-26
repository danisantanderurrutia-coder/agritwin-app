/**
 * AgriTwin - VisionManager Module (Cámaras Fijas, Frustums 3D & Streaming PiP)
 * 
 * Arquitectura Ciberfísica:
 *  - Cámaras Solares PTZ 4G y Cámaras Trampa con Frustums 3D cónicos e interactivos.
 *  - Proyección de conos de cobertura sobre la topografía real con atenuación y wireframes.
 *  - Ventana flotante Picture-in-Picture (PiP) con streaming de baja latencia (WHEP/WebRTC simulado).
 *  - Controles PTZ bidireccionales: mover el joystick virtual rota el cono 3D en el mapa en tiempo real.
 *  - Detección Edge AI: alertas en tiempo real (intrusos, aforo canal DGA, fauna nativa y ganado PRV).
 */

import { bus } from '../utils/EventBus.js';
import { MapManager } from '../map/MapManager.js';

export class VisionManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.scene = mapManager.scene;
    this.visionGroup = new THREE.Group();
    this.visionGroup.name = 'visionCamerasGroup';
    // Parten desactivadas por defecto según requerimiento de usuario
    this.isEnabled = false;
    this.visionGroup.visible = false;
    this.scene.add(this.visionGroup);

    this.cameras = [];
    this.cameraMeshes = new Map();
    this.activeCamera = null;
    this.isPipOpen = false;
    this.alertPings = [];
    this.pipRenderer = null;
    this.pipCamera = null;

    // Init UI HUD container for PiP
    this.initPipDOM();

    // Register into MapManager animation loop
    if (this.mapManager.addAnimated) {
      this.mapManager.addAnimated(this.visionGroup, (delta, time) => this.update(delta, time));
    }

    // Inicializar cámaras (quedan ocultas hasta activación explícita)
    this.initCameras();
    this.visionGroup.visible = false;

    // Listen to selection bus events (only if vision cameras are enabled)
    bus.on('entity:selected', (event) => {
      if (!this.isEnabled) return;
      if (event && event.properties && event.properties.type === 'camera') {
        const cam = this.cameras.find(c => c.id === event.id);
        if (cam) {
          this.openPip(cam);
        }
      }
    });
  }

  /**
   * Alterna la visibilidad de las cámaras visoras y frustums 3D desde herramientas
   */
  toggleVisionCameras(forceState) {
    if (typeof forceState === 'boolean') {
      this.isEnabled = forceState;
    } else {
      this.isEnabled = !this.isEnabled;
    }
    this.visionGroup.visible = this.isEnabled;

    // Sincronizar pickableObjects para evitar que clics fantasma seleccionen cámaras apagadas
    if (this.mapManager?.pickableObjects) {
      this.cameraMeshes.forEach(group => {
        const idx = this.mapManager.pickableObjects.indexOf(group);
        if (this.isEnabled) {
          if (idx === -1) this.mapManager.pickableObjects.push(group);
        } else {
          if (idx !== -1) this.mapManager.pickableObjects.splice(idx, 1);
        }
      });
    }

    this.updateToolbarUI();

    if (!this.isEnabled && this.isPipOpen) {
      this.closePip();
    }

    if (this.isEnabled) {
      this.showToast('👁️ Cámaras visoras y conos PTZ activados.');
    } else {
      this.showToast('🚫 Cámaras visoras desactivadas.');
    }
    return this.isEnabled;
  }

  updateToolbarUI() {
    const lbl = document.getElementById('label_toggle_vision_cameras');
    const ico = document.getElementById('icon_toggle_vision_cameras');
    const triggerLbl = document.getElementById('trigger_vision_label');
    const btn = document.getElementById('btn_toggle_vision_cameras');

    if (this.isEnabled) {
      if (lbl) lbl.textContent = 'Desactivar Cámaras Visoras';
      if (ico) ico.textContent = '🟢';
      if (triggerLbl) triggerLbl.textContent = 'Activo';
      if (btn) {
        btn.style.color = '#34d399';
        btn.style.background = 'rgba(16, 185, 129, 0.15)';
      }
    } else {
      if (lbl) lbl.textContent = 'Activar Cámaras Visoras';
      if (ico) ico.textContent = '👁️';
      if (triggerLbl) triggerLbl.textContent = 'Inactivo';
      if (btn) {
        btn.style.color = '#fbbf24';
        btn.style.background = 'rgba(245, 158, 11, 0.12)';
      }
    }
  }

  /**
   * Inicializa las cámaras de campo por defecto o desde dataset
   */
  initCameras() {
    if (this.cameras.length > 0) return;
    const defaultCameras = [
      {
        id: 'CAM-01-NORTE',
        name: 'CAM-01 • PTZ Solar 4G - Portería & Acceso Norte',
        role: 'Seguridad Perimetral & Prevención de Intrusión',
        type: 'ptz_solar_4g',
        x: -16.0,
        z: -28.0,
        height: 4.2,
        yaw: 135, // grados
        pitch: -24,
        fov: 48,
        range: 42,
        battery: 98,
        solarWatts: 18.4,
        network: '4G LTE-M (Entel Rural)',
        latencyMs: 195,
        aiModel: 'YOLOv11-Edge Intrusión & Vehículos',
        status: 'optimal',
        alertActive: false,
        lastEvent: 'Vigilancia perimetral activa. Límites seguros.',
        waterData: null
      },
      {
        id: 'CAM-02-DGA',
        name: 'CAM-02 • PTZ Solar 4G - Marco Partidor & Compuerta DGA',
        role: 'Gestión Hídrica & Cumplimiento Extracción DGA',
        type: 'gate_dga',
        x: -34.0,
        z: 16.0,
        height: 3.8,
        yaw: 215,
        pitch: -32,
        fov: 42,
        range: 36,
        battery: 94,
        solarWatts: 21.0,
        network: '4G LTE-M (Mesh Casco Starlink)',
        latencyMs: 140,
        aiModel: 'HydroOCR-DGA + WaterSegmenter v1.8',
        status: 'optimal',
        alertActive: false,
        lastEvent: 'Caudal aforado continuo: 28.4 L/s (Derecho DGA: 30 L/s).',
        waterData: {
          flowLps: 28.4,
          waterHeightCm: 42.5,
          maxAllowedLps: 30.0,
          gateOpeningPct: 68
        }
      },
      {
        id: 'CAM-03-FAUNA',
        name: 'CAM-03 • Cámara Trampa AI - Quebrada Boldos (Rewilding)',
        role: 'Biodiversidad Nativa & Métricas ESG / BioToken',
        type: 'trap_wildlife',
        x: 28.0,
        z: 24.0,
        height: 2.8,
        yaw: 50,
        pitch: -18,
        fov: 54,
        range: 26,
        battery: 100,
        solarWatts: 12.5,
        network: 'LoRaWAN 915MHz + Snapshot 4G',
        latencyMs: 420,
        aiModel: 'MegaDetector v5a (Fauna Esclerófila)',
        status: 'optimal',
        alertActive: false,
        lastEvent: 'Avistamiento auditado: Lycalopex culpaeus (Zorro Culpeo).',
        speciesData: {
          commonName: 'Zorro Culpeo',
          scientific: 'Lycalopex culpaeus',
          protection: 'Nativa Protegida (Vulnerable)',
          esgUnits: '+12 BioTokens PBC'
        }
      },
      {
        id: 'CAM-04-PRV',
        name: 'CAM-04 • PTZ Solar 4G - Potrero PRV & Manga de Ganado',
        role: 'Ganadería Regenerativa & Condición Corporal BCS',
        type: 'prv_livestock',
        x: 16.0,
        z: -6.0,
        height: 3.9,
        yaw: 305,
        pitch: -28,
        fov: 46,
        range: 38,
        battery: 91,
        solarWatts: 19.5,
        network: '4G LTE-M',
        latencyMs: 210,
        aiModel: 'ByteTrack-CattleBCS v3.1',
        status: 'optimal',
        alertActive: false,
        lastEvent: 'Conteo en manga: 24 cabezas verificadas. BCS Promedio: 3.4/5.0.',
        livestockData: {
          count: 24,
          bcsAvg: 3.4,
          paddockActive: 'Potrero 3 (Alfalfa / Trébol)',
          electricFenceMv: 7800
        }
      }
    ];

    this.cameras = defaultCameras;
    this.renderAllCameras();
  }

  /**
   * Renderiza los modelos 3D y los frustums interactivos
   */
  renderAllCameras() {
    this.cameras.forEach(cam => {
      this.createCameraEntity(cam);
    });
  }

  createCameraEntity(cam) {
    const groundY = this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(cam.x, cam.z) : 0;
    const posY = groundY + cam.height;

    const group = new THREE.Group();
    group.position.set(cam.x, groundY, cam.z);

    // 1. Poste de Acero Galvanizado
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, cam.height, 12);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.85,
      roughness: 0.25
    });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = cam.height / 2;
    pole.castShadow = true;
    group.add(pole);

    // 2. Base de Hormigón
    const baseGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.35, 12);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.175;
    group.add(base);

    // 3. Gabinete Electrónico IP65 + Antena 4G
    const boxGeo = new THREE.BoxGeometry(0.5, 0.6, 0.35);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, metalness: 0.3 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, cam.height * 0.55, 0.22);
    group.add(box);

    const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8);
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.set(0.18, (cam.height * 0.55) + 0.6, 0.22);
    group.add(antenna);

    // 4. Panel Solar Superior Tilted (33 grados)
    const panelFrame = new THREE.Group();
    panelFrame.position.set(0, cam.height + 0.25, 0);
    panelFrame.rotation.x = THREE.MathUtils.degToRad(-33);

    const panelGeo = new THREE.BoxGeometry(0.9, 0.04, 1.2);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panelFrame.add(panel);

    // Células solares fotovoltaicas (azul profundo)
    const cellsGeo = new THREE.PlaneGeometry(0.84, 1.14);
    const cellsMat = new THREE.MeshBasicMaterial({ color: 0x1e3a8a, side: THREE.DoubleSide });
    const cells = new THREE.Mesh(cellsGeo, cellsMat);
    cells.position.y = 0.025;
    cells.rotation.x = -Math.PI / 2;
    panelFrame.add(cells);
    group.add(panelFrame);

    // 5. Domo PTZ de Cámara Robotizada
    const ptzGroup = new THREE.Group();
    ptzGroup.position.set(0, cam.height - 0.15, 0.35);

    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(0, 0, -0.15);
    ptzGroup.add(arm);

    const domeHousingGeo = new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const domeHousingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 });
    const domeHousing = new THREE.Mesh(domeHousingGeo, domeHousingMat);
    domeHousing.position.y = 0.05;
    ptzGroup.add(domeHousing);

    const lensGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.05, metalness: 0.95 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0, -0.05, 0);
    ptzGroup.add(lens);

    // LED de Estado Inteligente (Verde normal / Rojo pulsante en Alerta)
    const ledGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(0.12, -0.08, 0.18);
    ptzGroup.add(led);

    group.add(ptzGroup);

    // 6. Cono / Frustum 3D Interactivo
    const frustumGroup = this.createFrustumMesh(cam);
    frustumGroup.position.set(0, cam.height - 0.15, 0.35);
    group.add(frustumGroup);

    // Metadata para Raycaster e interacción
    group.userData = {
      type: 'camera',
      id: cam.id,
      name: cam.name,
      cameraData: cam,
      ptzGroup: ptzGroup,
      frustumGroup: frustumGroup,
      ledMesh: led,
      ledMat: ledMat
    };

    // Añadir a Three.js scene y pickable objects
    this.visionGroup.add(group);
    this.cameraMeshes.set(cam.id, group);

    if (this.mapManager?.pickableObjects && this.isEnabled) {
      this.mapManager.pickableObjects.push(group);
    }
  }

  /**
   * Crea la geometría tridimensional del Frustum de visualización
   */
  createFrustumMesh(cam) {
    const frustumContainer = new THREE.Group();

    // Orientación inicial según pitch y yaw
    frustumContainer.rotation.y = THREE.MathUtils.degToRad(cam.yaw);
    frustumContainer.rotation.x = THREE.MathUtils.degToRad(cam.pitch);

    const fovRad = THREE.MathUtils.degToRad(cam.fov);
    const range = cam.range;
    const baseRadius = range * Math.tan(fovRad / 2);

    // Cono volumétrico semitransparente con AdditiveBlending
    const coneGeo = new THREE.ConeGeometry(baseRadius, range, 24, 1, true);
    // En Three.js ConeGeometry se orienta sobre el eje Y con vértice en +Y/2. Lo trasladamos y rotamos para proyectar hacia +Z
    coneGeo.translate(0, -range / 2, 0);
    coneGeo.rotateX(-Math.PI / 2);

    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    frustumContainer.add(coneMesh);

    // Wireframe de líneas radiales y bordes para estilo HUD CAD
    const wireGeo = new THREE.WireframeGeometry(coneGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const wireLines = new THREE.LineSegments(wireGeo, wireMat);
    frustumContainer.add(wireLines);

    // Aro de huella en la base del cono
    const ringGeo = new THREE.RingGeometry(baseRadius * 0.95, baseRadius, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 0, range);
    frustumContainer.add(ring);

    frustumContainer.userData = {
      coneMesh,
      coneMat,
      wireLines,
      wireMat,
      ring,
      ringMat,
      baseRadius,
      range
    };

    return frustumContainer;
  }

  /**
   * Actualiza dinámicamente el Frustum 3D al mover el joystick virtual PTZ
   */
  updateCameraPTZ(cameraId, newYaw, newPitch, newFov) {
    const cam = this.cameras.find(c => c.id === cameraId);
    const meshGroup = this.cameraMeshes.get(cameraId);
    if (!cam || !meshGroup) return;

    if (newYaw !== undefined) cam.yaw = newYaw;
    if (newPitch !== undefined) cam.pitch = newPitch;
    if (newFov !== undefined) cam.fov = newFov;

    const frustumGroup = meshGroup.userData.frustumGroup;
    if (frustumGroup) {
      frustumGroup.rotation.y = THREE.MathUtils.degToRad(cam.yaw);
      frustumGroup.rotation.x = THREE.MathUtils.degToRad(cam.pitch);
    }

    const ptzGroup = meshGroup.userData.ptzGroup;
    if (ptzGroup) {
      ptzGroup.rotation.y = THREE.MathUtils.degToRad(cam.yaw);
    }
  }

  /**
   * Inyecta una alerta de Edge AI simulada sobre una cámara
   */
  triggerEdgeAiAlert(cameraId, eventType) {
    const cam = this.cameras.find(c => c.id === cameraId);
    const meshGroup = this.cameraMeshes.get(cameraId);
    if (!cam || !meshGroup) return;

    cam.alertActive = true;
    cam.status = 'alert';

    let alertDesc = 'Alerta de Edge AI activada';
    if (cam.id === 'CAM-01-NORTE') {
      alertDesc = '🚨 INTRUSO: Persona detectada cruzando cerco perimetral (94%).';
    } else if (cam.id === 'CAM-02-DGA') {
      alertDesc = '⚠️ EXTRACCIÓN ANÓMALA: Motobomba no identificada en canal DGA (89%).';
    } else if (cam.id === 'CAM-03-FAUNA') {
      alertDesc = '🌿 AVISTAMIENTO PRIORITARIO: Zorro Culpeo activo en corredor biológico (98%).';
    } else if (cam.id === 'CAM-04-PRV') {
      alertDesc = '⚡ CERCO ELÉCTRICO: Caída de voltaje en hilo de potrero PRV 3 (<3000V).';
    }

    cam.lastEvent = alertDesc;

    // Cambiar cono a rojo carmesí parpadeante
    const frustum = meshGroup.userData.frustumGroup;
    if (frustum && frustum.userData.coneMat) {
      frustum.userData.coneMat.color.setHex(0xef4444);
      frustum.userData.wireMat.color.setHex(0xf87171);
      frustum.userData.ringMat.color.setHex(0xef4444);
    }

    if (meshGroup.userData.ledMat) {
      meshGroup.userData.ledMat.color.setHex(0xef4444);
    }

    // Sonido sutil de alerta vía Web Audio API
    this.playAlertTone();

    // Refrescar PiP si está abierto
    if (this.isPipOpen && this.activeCamera && this.activeCamera.id === cam.id) {
      this.updatePipContent();
    } else {
      // Abrir automáticamente el PiP para inspección
      this.openPip(cam);
    }

    // Toast flotante
    this.showToast(`🚨 [${cam.id}] ${alertDesc}`);
  }

  /**
   * Restablece el estado normal de la cámara
   */
  clearEdgeAiAlert(cameraId) {
    const cam = this.cameras.find(c => c.id === cameraId);
    const meshGroup = this.cameraMeshes.get(cameraId);
    if (!cam || !meshGroup) return;

    cam.alertActive = false;
    cam.status = 'optimal';

    const frustum = meshGroup.userData.frustumGroup;
    if (frustum && frustum.userData.coneMat) {
      frustum.userData.coneMat.color.setHex(0x06b6d4);
      frustum.userData.wireMat.color.setHex(0x38bdf8);
      frustum.userData.ringMat.color.setHex(0x22d3ee);
    }

    if (meshGroup.userData.ledMat) {
      meshGroup.userData.ledMat.color.setHex(0x10b981);
    }

    if (this.isPipOpen && this.activeCamera && this.activeCamera.id === cam.id) {
      this.updatePipContent();
    }
  }

  /**
   * Ciclo de animación para pulsación de los conos y render del visor PiP
   */
  update(delta, time) {
    if (this.isEnabled) {
      this.cameras.forEach(cam => {
        const meshGroup = this.cameraMeshes.get(cam.id);
        if (!meshGroup) return;

        const frustum = meshGroup.userData.frustumGroup;
        if (!frustum) return;

        if (cam.alertActive) {
          // Pulso rápido de alarma
          const pulse = 0.35 + 0.35 * Math.sin(time * 9.0);
          frustum.userData.coneMat.opacity = pulse;
          frustum.userData.ring.scale.setScalar(1.0 + 0.08 * Math.sin(time * 9.0));
        } else {
          // Pulso suave de respiración sensorial
          const pulse = 0.18 + 0.08 * Math.sin(time * 2.5);
          frustum.userData.coneMat.opacity = pulse;
        }
      });
    }

    // Renderizar perspectiva del gemelo digital en el visor PiP si está abierto
    if (this.isPipOpen && this.activeCamera) {
      this.renderPip3DView(time);
      if (this.pipCanvasCtx) {
        this.drawPipSyntheticVideo(time);
      }
    }
  }

  /**
   * Inicializa el contenedor DOM de la ventana flotante PiP con paleta Age of Empires III
   */
  initPipDOM() {
    if (document.getElementById('agritwin-vision-pip-modal')) return;

    const style = document.createElement('style');
    style.id = 'agritwin-vision-styles';
    style.textContent = `
      /* Ventana Flotante PiP - Paleta de Madera & Bronce Age of Empires III */
      #agritwin-vision-pip-modal {
        position: fixed;
        bottom: 74px;
        right: 350px;
        width: 384px;
        background: linear-gradient(180deg, #2b1d13 0%, #170f09 100%);
        border: 2px solid #b8860b;
        outline: 1px solid #4a3416;
        border-radius: 10px;
        box-shadow: inset 0 0 14px rgba(0, 0, 0, 0.85), 0 16px 44px rgba(0, 0, 0, 0.95), 0 0 16px rgba(184, 134, 11, 0.3);
        backdrop-filter: blur(20px);
        z-index: 9999;
        font-family: 'Plus Jakarta Sans', Georgia, serif;
        color: #fef3c7;
        display: none;
        flex-direction: column;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
      }
      #agritwin-vision-pip-modal.minimized {
        width: 290px;
        height: 44px;
        overflow: hidden;
      }
      .pip-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 12px;
        background: linear-gradient(180deg, #44301d 0%, #291b10 100%);
        border-bottom: 2px solid #8c6721;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
      }
      .pip-title-box {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        font-weight: 700;
        color: #fef3c7;
        text-shadow: 0 1px 2px #000;
      }
      .pip-live-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 7px;
        border-radius: 4px;
        background: rgba(185, 28, 28, 0.4);
        border: 1px solid #ef4444;
        color: #fca5a5;
        font-size: 8.5px;
        font-weight: 800;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        box-shadow: inset 0 0 4px rgba(0,0,0,0.5);
      }
      .pip-feed-toggle-btn {
        flex: 1;
        padding: 5px 8px;
        border-radius: 4px;
        font-size: 9.5px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        text-shadow: 0 1px 2px #000;
      }
      .pip-feed-toggle-btn.active {
        background: linear-gradient(180deg, #6c4b28 0%, #3e2815 100%) !important;
        border: 1px solid #fde047 !important;
        color: #fff !important;
        box-shadow: 0 0 8px rgba(245, 158, 11, 0.5), inset 0 1px 0 rgba(255,255,255,0.3) !important;
      }
      .pip-video-wrapper {
        position: relative;
        width: 100%;
        height: 215px;
        background: #000;
        overflow: hidden;
        border-bottom: 1px solid #5a3f1a;
      }
      #pip-three-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: block;
      }
      #pip-video-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: block;
        pointer-events: none;
      }
      .pip-hud-osd {
        position: absolute;
        top: 8px;
        left: 10px;
        right: 10px;
        display: flex;
        justify-content: space-between;
        font-family: ui-monospace, monospace;
        font-size: 9.5px;
        color: #fbbf24;
        text-shadow: 0 1px 3px rgba(0,0,0,0.9);
        pointer-events: none;
        z-index: 5;
      }
      .pip-telemetry-bar {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
        padding: 7px 12px;
        background: rgba(18, 12, 7, 0.95);
        border-bottom: 1px solid #4a3418;
        font-size: 10px;
      }
      .pip-tele-item {
        display: flex;
        flex-direction: column;
      }
      .pip-tele-label {
        font-size: 8px;
        color: #a8896c;
        text-transform: uppercase;
        font-weight: 700;
      }
      .pip-tele-val {
        font-weight: 700;
        color: #fbbf24;
        font-family: ui-monospace, monospace;
      }
      .pip-controls {
        padding: 9px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: linear-gradient(180deg, #24180e 0%, #160e08 100%);
      }
      .pip-ptz-pad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
        max-width: 125px;
        margin: 0 auto;
      }
      .btn-ptz {
        background: linear-gradient(180deg, #3d2a1a 0%, #201309 100%);
        border: 1px solid #8c6721;
        color: #fef3c7;
        border-radius: 4px;
        padding: 6px;
        font-size: 11px;
        cursor: pointer;
        box-shadow: inset 1px 1px 0 rgba(255,255,255,0.15), inset -1px -1px 0 rgba(0,0,0,0.7);
        transition: all 0.15s ease;
      }
      .btn-ptz:hover {
        background: linear-gradient(180deg, #593c23 0%, #301d0e 100%);
        border-color: #fde047;
        color: #fff;
        box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
      }
      .btn-ptz:active {
        transform: translateY(1px);
        box-shadow: inset 1px 1px 2px rgba(0,0,0,0.9);
      }
      .pip-action-row {
        display: flex;
        gap: 6px;
      }
      .btn-pip-action {
        flex: 1;
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        transition: all 0.2s;
        border: 1px solid #8c6721;
        text-shadow: 0 1px 2px #000;
      }
      .btn-pip-alert {
        background: linear-gradient(180deg, #5c2020 0%, #351010 100%);
        color: #fca5a5;
        border-color: #ef4444;
      }
      .btn-pip-alert:hover {
        background: linear-gradient(180deg, #7f2929 0%, #4a1515 100%);
        color: #fff;
        box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
      }
      .btn-pip-fly {
        background: linear-gradient(180deg, #3d2a1a 0%, #201309 100%);
        color: #fde047;
        border-color: #b8860b;
      }
      .btn-pip-fly:hover {
        background: linear-gradient(180deg, #5c4026 0%, #321d0d 100%);
        border-color: #fde047;
        color: #fff;
        box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
      }
    `;
    document.head.appendChild(style);

    const pipModal = document.createElement('div');
    pipModal.id = 'agritwin-vision-pip-modal';
    pipModal.innerHTML = `
      <div class="pip-header">
        <div class="pip-title-box">
          <span class="pip-live-badge"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ef4444;animation:pulse 1.2s infinite;"></span> TWIN LIVE</span>
          <span id="pip-camera-name" style="color:#fef3c7;">CAM-01 • PTZ Solar 4G</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button id="btn-pip-min" style="background:none;border:none;color:#d4af37;cursor:pointer;font-size:12px;" title="Minimizar">_</button>
          <button id="btn-pip-close" style="background:none;border:none;color:#d4af37;cursor:pointer;font-size:14px;font-weight:bold;" title="Cerrar">✕</button>
        </div>
      </div>

      <div style="display:flex;background:rgba(22,14,8,0.95);padding:4px 8px;gap:6px;border-bottom:1px solid #4a3418;">
        <button id="btn-pip-feed-ground" class="pip-feed-toggle-btn active" style="background:linear-gradient(180deg,#6c4b28 0%,#3e2815 100%);border:1px solid #fde047;color:#fff;">📹 Feed Terrestre</button>
        <button id="btn-pip-feed-drone" class="pip-feed-toggle-btn" style="background:linear-gradient(180deg,#3d2a1a 0%,#201309 100%);border:1px solid #8c6721;color:#d4af37;">🚁 Feed Gimbal Dron</button>
      </div>

      <div class="pip-video-wrapper">
        <canvas id="pip-three-canvas" width="380" height="215"></canvas>
        <canvas id="pip-video-canvas" width="380" height="215"></canvas>
        <div class="pip-hud-osd">
          <span id="pip-osd-time">TWIN LIVE 12:44:02</span>
          <span id="pip-osd-model">YOLOv11 Edge</span>
        </div>
        <div id="pip-alert-banner" style="position:absolute;bottom:8px;left:8px;right:8px;background:rgba(185,28,28,0.9);color:#fff;padding:4px 8px;border-radius:4px;font-size:9.5px;font-weight:bold;display:none;backdrop-filter:blur(4px);border:1px solid #fca5a5;z-index:6;">
          🚨 ALERTA: Infiltración detectada
        </div>
      </div>

      <div class="pip-telemetry-bar">
        <div class="pip-tele-item">
          <span class="pip-tele-label">Batería</span>
          <span class="pip-tele-val" id="pip-val-battery">98% (Solar)</span>
        </div>
        <div class="pip-tele-item">
          <span class="pip-tele-label">Red</span>
          <span class="pip-tele-val" id="pip-val-net">4G LTE-M</span>
        </div>
        <div class="pip-tele-item">
          <span class="pip-tele-label">Latencia</span>
          <span class="pip-tele-val" id="pip-val-latency">195 ms</span>
        </div>
        <div class="pip-tele-item">
          <span class="pip-tele-label">Azimut / PTZ</span>
          <span class="pip-tele-val" id="pip-val-ptz">135° / -24°</span>
        </div>
      </div>

      <div class="pip-controls">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:9.5px;font-weight:700;color:#c4a582;text-transform:uppercase;">Control PTZ Bidireccional:</span>
          <span style="font-size:9px;color:#fbbf24;">FOV: <strong id="pip-fov-val">48°</strong></span>
        </div>
        
        <div class="pip-ptz-pad">
          <div></div>
          <button class="btn-ptz" id="ptz-up" title="Inclinar Arriba">▲</button>
          <div></div>
          <button class="btn-ptz" id="ptz-left" title="Girar Izquierda">◀</button>
          <button class="btn-ptz" id="ptz-center" title="Centrar">🎯</button>
          <button class="btn-ptz" id="ptz-right" title="Girar Derecha">▶</button>
          <div></div>
          <button class="btn-ptz" id="ptz-down" title="Inclinar Abajo">▼</button>
          <div></div>
        </div>

        <div class="pip-action-row">
          <button class="btn-pip-action btn-pip-alert" id="btn-pip-trigger-alert">
            <span>🚨</span> Simular Edge AI
          </button>
          <button class="btn-pip-action btn-pip-fly" id="btn-pip-fly-cam">
            <span>🎥</span> Volar a Cámara
          </button>
        </div>

        <div class="pip-action-row" style="margin-top:2px;">
          <button class="btn-pip-action" id="btn-pip-dispatch-drone" style="background:linear-gradient(180deg,#3d2a1a 0%,#201309 100%);color:#fde047;border:1px solid #d4af37;width:100%;font-weight:800;">
            <span>🚁</span> Despachar Dron a este Punto (Intercepción)
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(pipModal);

    // Inicializar Canvas 2D Overlay
    const canvas = document.getElementById('pip-video-canvas');
    if (canvas) {
      this.pipCanvasCtx = canvas.getContext('2d');
    }

    // Inicializar sub-renderizador WebGL Three.js para reproducir la vista viva del gemelo digital
    const threeCanvas = document.getElementById('pip-three-canvas');
    if (threeCanvas && typeof THREE.WebGLRenderer !== 'undefined') {
      try {
        this.pipRenderer = new THREE.WebGLRenderer({
          canvas: threeCanvas,
          antialias: true,
          alpha: false,
          powerPreference: 'default'
        });
        this.pipRenderer.setSize(380, 215, false);
        this.pipRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        if (this.mapManager && this.mapManager.renderer) {
          this.pipRenderer.outputEncoding = this.mapManager.renderer.outputEncoding;
          this.pipRenderer.toneMapping = this.mapManager.renderer.toneMapping;
        }
      } catch (err) {
        console.warn('⚠️ WebGL secundario para PiP no disponible:', err);
      }
    }
    this.pipCamera = new THREE.PerspectiveCamera(48, 380 / 215, 0.5, 3000);

    // Wiring UI Events
    document.getElementById('btn-pip-close').onclick = () => this.closePip();
    document.getElementById('btn-pip-min').onclick = () => {
      pipModal.classList.toggle('minimized');
    };

    // Arrastre libre de la ventana PiP desde la cabecera
    const headerEl = pipModal.querySelector('.pip-header');
    if (headerEl) {
      headerEl.style.cursor = 'grab';
      let isDragging = false;
      let startX = 0, startY = 0, initLeft = 0, initTop = 0;

      headerEl.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        headerEl.style.cursor = 'grabbing';
        const rect = pipModal.getBoundingClientRect();
        initLeft = rect.left;
        initTop = rect.top;
        startX = e.clientX;
        startY = e.clientY;
        pipModal.style.bottom = 'auto';
        pipModal.style.right = 'auto';
        pipModal.style.left = initLeft + 'px';
        pipModal.style.top = initTop + 'px';
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        pipModal.style.left = (initLeft + dx) + 'px';
        pipModal.style.top = (initTop + dy) + 'px';
      });

      window.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          headerEl.style.cursor = 'grab';
        }
      });
    }

    // PTZ Controls
    document.getElementById('ptz-left').onclick = () => {
      if (this.activeCamera) {
        this.updateCameraPTZ(this.activeCamera.id, this.activeCamera.yaw - 8, this.activeCamera.pitch);
        this.updatePipContent();
      }
    };
    document.getElementById('ptz-right').onclick = () => {
      if (this.activeCamera) {
        this.updateCameraPTZ(this.activeCamera.id, this.activeCamera.yaw + 8, this.activeCamera.pitch);
        this.updatePipContent();
      }
    };
    document.getElementById('ptz-up').onclick = () => {
      if (this.activeCamera) {
        this.updateCameraPTZ(this.activeCamera.id, this.activeCamera.yaw, Math.min(this.activeCamera.pitch + 6, 10));
        this.updatePipContent();
      }
    };
    document.getElementById('ptz-down').onclick = () => {
      if (this.activeCamera) {
        this.updateCameraPTZ(this.activeCamera.id, this.activeCamera.yaw, Math.max(this.activeCamera.pitch - 6, -60));
        this.updatePipContent();
      }
    };
    document.getElementById('ptz-center').onclick = () => {
      if (this.activeCamera) {
        this.updateCameraPTZ(this.activeCamera.id, 180, -25);
        this.updatePipContent();
      }
    };

    // Trigger AI Alert
    document.getElementById('btn-pip-trigger-alert').onclick = () => {
      if (this.activeCamera) {
        if (this.activeCamera.alertActive) {
          this.clearEdgeAiAlert(this.activeCamera.id);
        } else {
          this.triggerEdgeAiAlert(this.activeCamera.id);
        }
      }
    };

    // Fly To Camera in 3D
    document.getElementById('btn-pip-fly-cam').onclick = () => {
      if (this.activeCamera && this.mapManager.animateCamera) {
        const mesh = this.cameraMeshes.get(this.activeCamera.id);
        if (mesh) {
          const camPos = mesh.position.clone().add(new THREE.Vector3(12, 10, 16));
          const target = mesh.position.clone().add(new THREE.Vector3(0, 2, 0));
          this.mapManager.animateCamera(camPos, target, 1200);
        }
      }
    };

    // Despacho Reactivo del Dron a la posición de la cámara
    const dispatchDroneBtn = document.getElementById('btn-pip-dispatch-drone');
    if (dispatchDroneBtn) {
      dispatchDroneBtn.onclick = () => {
        if (this.activeCamera && window.droneMissionManager) {
          const cam = this.activeCamera;
          const target = new THREE.Vector3(cam.x, 0, cam.z);
          window.droneMissionManager.dispatchIntercept(target, cam);
          this.setPipFeedSource('drone');
        }
      };
    }

    // Toggle Feed Terrestre vs Dron
    const btnFeedGround = document.getElementById('btn-pip-feed-ground');
    const btnFeedDrone = document.getElementById('btn-pip-feed-drone');
    if (btnFeedGround) {
      btnFeedGround.onclick = () => this.setPipFeedSource('ground');
    }
    if (btnFeedDrone) {
      btnFeedDrone.onclick = () => this.setPipFeedSource('drone');
    }
  }

  setPipFeedSource(mode) {
    this.pipFeedSource = mode;
    const btnGround = document.getElementById('btn-pip-feed-ground');
    const btnDrone = document.getElementById('btn-pip-feed-drone');
    if (btnGround && btnDrone) {
      if (mode === 'ground') {
        btnGround.classList.add('active');
        btnDrone.classList.remove('active');
      } else {
        btnDrone.classList.add('active');
        btnGround.classList.remove('active');
      }
    }
  }

  /**
   * Abre la ventana flotante PiP con la cámara seleccionada
   */
  openPip(camera) {
    if (!this.isEnabled) {
      this.toggleVisionCameras(true);
    }
    this.activeCamera = camera;
    this.isPipOpen = true;

    const modal = document.getElementById('agritwin-vision-pip-modal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.remove('minimized');
    }

    this.updatePipContent();
  }

  closePip() {
    this.isPipOpen = false;
    const modal = document.getElementById('agritwin-vision-pip-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  updatePipContent() {
    if (!this.activeCamera) return;
    const cam = this.activeCamera;

    const nameEl = document.getElementById('pip-camera-name');
    if (nameEl) nameEl.textContent = cam.name;

    const batEl = document.getElementById('pip-val-battery');
    if (batEl) batEl.textContent = `${cam.battery}% (${cam.solarWatts}W)`;

    const netEl = document.getElementById('pip-val-net');
    if (netEl) netEl.textContent = cam.network;

    const latEl = document.getElementById('pip-val-latency');
    if (latEl) latEl.textContent = `${cam.latencyMs} ms`;

    const ptzEl = document.getElementById('pip-val-ptz');
    if (ptzEl) ptzEl.textContent = `${Math.round(cam.yaw)}° / ${Math.round(cam.pitch)}°`;

    const fovEl = document.getElementById('pip-fov-val');
    if (fovEl) fovEl.textContent = `${cam.fov}°`;

    const modelEl = document.getElementById('pip-osd-model');
    if (modelEl) modelEl.textContent = cam.aiModel;

    const bannerEl = document.getElementById('pip-alert-banner');
    const alertBtn = document.getElementById('btn-pip-trigger-alert');
    if (bannerEl && alertBtn) {
      if (cam.alertActive) {
        bannerEl.style.display = 'block';
        bannerEl.textContent = cam.lastEvent;
        alertBtn.innerHTML = '<span>✅</span> Silenciar Alerta';
      } else {
        bannerEl.style.display = 'none';
        alertBtn.innerHTML = '<span>🚨</span> Simular Edge AI';
      }
    }
  }

  /**
   * Renderiza la perspectiva 3D real de la cámara mirando hacia el Digital Twin
   */
  renderPip3DView(time) {
    if (!this.pipRenderer || !this.pipCamera || !this.scene) return;
    const cam = this.activeCamera;
    if (!cam) return;

    if (this.pipFeedSource === 'drone') {
      if (window.droneMissionManager && window.droneMissionManager.droneMesh) {
        const drone = window.droneMissionManager.droneMesh;
        this.pipCamera.position.copy(drone.position);
        this.pipCamera.fov = 55;
        this.pipCamera.updateProjectionMatrix();

        if (window.droneMissionManager.state === 'intercept' || window.droneMissionManager.state === 'orbit') {
          const tgt = window.droneMissionManager.interceptTarget;
          if (tgt) {
            this.pipCamera.lookAt(new THREE.Vector3(tgt.x, (tgt.y || 0) + 1, tgt.z));
          } else {
            this.pipCamera.lookAt(new THREE.Vector3(drone.position.x, 0, drone.position.z));
          }
        } else {
          this.pipCamera.lookAt(new THREE.Vector3(drone.position.x, 0, drone.position.z));
        }

        const scanMesh = window.droneMissionManager.nadirScanMesh;
        if (scanMesh) scanMesh.visible = false;
        this.pipRenderer.render(this.scene, this.pipCamera);
        if (scanMesh) scanMesh.visible = true;
        return;
      }
    }

    // Modo Terrestre: cámara solar en el mástil mirando hacia el gemelo
    const groundY = this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(cam.x, cam.z) : 0;
    const eye = new THREE.Vector3(cam.x, groundY + cam.height, cam.z);

    const yawRad = THREE.MathUtils.degToRad(cam.yaw);
    const pitchRad = THREE.MathUtils.degToRad(cam.pitch);

    const dir = new THREE.Vector3(
      Math.sin(yawRad) * Math.cos(pitchRad),
      Math.sin(pitchRad),
      Math.cos(yawRad) * Math.cos(pitchRad)
    ).normalize();

    // Desplazar 0.55m en la dirección frontal para librar el mástil y el domo
    const camPos = eye.clone().addScaledVector(dir, 0.55);
    this.pipCamera.position.copy(camPos);
    this.pipCamera.fov = cam.fov || 48;
    this.pipCamera.updateProjectionMatrix();
    this.pipCamera.lookAt(camPos.clone().add(dir.clone().multiplyScalar(60)));

    // Ocultar temporalmente el cono y poste de esta cámara para que no tape el lente
    const myMesh = this.cameraMeshes.get(cam.id);
    const prevVis = myMesh ? myMesh.visible : true;
    if (myMesh) myMesh.visible = false;

    this.pipRenderer.render(this.scene, this.pipCamera);

    if (myMesh) myMesh.visible = prevVis;
  }

  /**
   * Dibuja la retícula táctica y bounding boxes sobre el canvas PiP transparente
   */
  drawPipSyntheticVideo(time) {
    const ctx = this.pipCanvasCtx;
    const w = 380;
    const h = 215;
    const cam = this.activeCamera;
    if (!ctx || !cam) return;

    // Limpiar canvas overlay transparente
    ctx.clearRect(0, 0, w, h);

    // Si pipRenderer no está activo (fallback), dibujar fondo gradiente
    if (!this.pipRenderer) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1c130b');
      grad.addColorStop(0.5, '#2b1d12');
      grad.addColorStop(1, '#150f09');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // Viñeta óptica sutil en los bordes para sensación de cámara de vigilancia
    const radGrad = ctx.createRadialGradient(w / 2, h / 2, 70, w / 2, h / 2, w / 2);
    radGrad.addColorStop(0, 'rgba(0,0,0,0)');
    radGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);

    if (this.pipFeedSource === 'drone') {
      // Retícula de Gimbal de Dron
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 40, 0, Math.PI * 2);
      ctx.arc(w / 2, h / 2, 72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w / 2 - 90, h / 2); ctx.lineTo(w / 2 + 90, h / 2);
      ctx.moveTo(w / 2, h / 2 - 60); ctx.lineTo(w / 2, h / 2 + 60);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('DJI DOCK 2 • GIMBAL TWIN STREAM', 15, 20);
      ctx.fillText(`OBJETIVO EN TIERRA: [${cam.id}]`, 15, 33);
      return;
    }

    // Retícula táctica de cámara PTZ terrestre estilo AoE 3 / CAD
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 25); ctx.lineTo(w / 2, h - 25);
    ctx.moveTo(35, h / 2); ctx.lineTo(w - 35, h / 2);
    ctx.stroke();
    ctx.strokeRect(w / 2 - 14, h / 2 - 14, 28, 28);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(Math.floor(now.getMilliseconds() / 100));
    const timeEl = document.getElementById('pip-osd-time');
    if (timeEl) timeEl.textContent = `TWIN LIVE ${timeStr}`;

    // Overlays contextuales de detección Edge AI sobre el gemelo
    if (cam.id === 'CAM-01-NORTE') {
      if (cam.alertActive) {
        this.drawBBox(ctx, 155 + Math.sin(time * 3) * 12, 65, 75, 110, '👤 INTRUSO 94%', '#ef4444');
      } else {
        this.drawBBox(ctx, 215, 115, 95, 65, '🚗 Camioneta Autorizada 98%', '#10b981');
      }
    } else if (cam.id === 'CAM-02-DGA') {
      this.drawBBox(ctx, 115, 75, 150, 100, `🌊 Aforo DGA: ${cam.waterData.flowLps} L/s [OK]`, '#38bdf8');
    } else if (cam.id === 'CAM-03-FAUNA') {
      const zorroX = 135 + Math.cos(time * 1.5) * 8;
      this.drawBBox(ctx, zorroX, 90, 105, 70, '🦊 Zorro Culpeo (98%)', '#f59e0b');
    } else if (cam.id === 'CAM-04-PRV') {
      this.drawBBox(ctx, 75, 95, 100, 75, '🐄 Vaca #42 BCS:3.5', '#10b981');
      this.drawBBox(ctx, 195, 80, 95, 70, '🐄 Vaca #18 BCS:3.3', '#10b981');
    }
  }

  drawBBox(ctx, x, y, bw, bh, label, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, bw, bh);

    // Esquinas tácticas
    const cLen = 6;
    ctx.fillStyle = color;
    ctx.fillRect(x - 1, y - 1, cLen, 2);
    ctx.fillRect(x - 1, y - 1, 2, cLen);
    ctx.fillRect(x + bw - cLen, y - 1, cLen, 2);
    ctx.fillRect(x + bw - 1, y - 1, 2, cLen);

    // Label tag
    ctx.fillStyle = color;
    ctx.fillRect(x - 1, y - 16, ctx.measureText(label).width + 10, 15);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(label, x + 4, y - 5);
  }

  playAlertTone() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, actx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, actx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, actx.currentTime);
      gain.gain.linearRampToValueAtTime(0, actx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.3);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 84px;
      right: 24px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid #ef4444;
      color: #f8fafc;
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      box-shadow: 0 10px 25px rgba(0,0,0,0.6);
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 8px;
      backdrop-filter: blur(10px);
      animation: fadeIn 0.3s ease;
    `;
    toast.innerHTML = `<span>🚨</span> <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}
