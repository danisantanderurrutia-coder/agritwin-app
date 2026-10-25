/**
 * AgriTwin - DroneMissionManager Module (Drone-in-a-Box, Vuelos Autónomos & Orquestación Reactiva)
 * 
 * Arquitectura Ciberfísica & Diegética:
 *  - Estación base fija DJI Dock 2 con RTK centimétrico en el casco central.
 *  - Dron cuadricóptero 3D con hélices rotatorias y haz nadir multiespectral.
 *  - Widget Diegético Flotante con Sprite Real ('assets/ui/sprite_cerro_drone.png').
 *  - Orquestación Reactiva Cámara ➔ Dron: despacho de intercepción al punto de alerta.
 *  - Línea guía de haz láser táctico en 3D que conecta el dron con el objetivo.
 *  - Actualización DINÁMICA de texturas del terreno en Three.js sin recargar la web.
 */

import { bus } from '../utils/EventBus.js';
import { MapManager } from '../map/MapManager.js';

export class DroneMissionManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.scene = mapManager.scene;
    this.droneGroup = new THREE.Group();
    this.droneGroup.name = 'droneMissionGroup';
    this.scene.add(this.droneGroup);

    // Estados de Misión: 'docked' | 'takeoff' | 'survey' | 'intercept' | 'orbit' | 'rth' | 'landing'
    this.state = 'docked';
    this.missionType = 'survey'; // 'survey' | 'intercept'
    this.progress = 0;
    this.photosCount = 0;
    this.targetPhotos = 240;
    this.battery = 98;
    this.flightAlt = 28.0; // Altura estándar de vuelo AGL
    this.speed = 16.0;

    // Variables de intercepción reactiva
    this.interceptTarget = null;
    this.interceptSourceCamera = null;
    this.orbitTimer = 0;
    this.orbitRadius = 14.0;
    this.orbitAngle = 0;

    // Posición del Dock (Casco Central / Galpón)
    this.dockPos = new THREE.Vector3(-8.0, 0, 12.0);
    const dockGroundY = this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(this.dockPos.x, this.dockPos.z) : 0;
    this.dockPos.y = dockGroundY;

    // Waypoints de Fotogrametría General
    this.waypoints = [
      new THREE.Vector3(-25.0, this.flightAlt, -25.0),
      new THREE.Vector3(25.0, this.flightAlt, -25.0),
      new THREE.Vector3(25.0, this.flightAlt, -12.0),
      new THREE.Vector3(-25.0, this.flightAlt, -12.0),
      new THREE.Vector3(-25.0, this.flightAlt, 0.0),
      new THREE.Vector3(25.0, this.flightAlt, 0.0),
      new THREE.Vector3(25.0, this.flightAlt, 12.0),
      new THREE.Vector3(-25.0, this.flightAlt, 12.0),
      new THREE.Vector3(-25.0, this.flightAlt, 25.0),
      new THREE.Vector3(25.0, this.flightAlt, 25.0)
    ];
    this.currentWpIndex = 0;

    // Construir modelos y widgets
    this.buildDjiDock();
    this.buildDroneModel();
    this.buildTacticalLaserBeam();

    // UI Diegética & HUD
    this.initDiegeticDroneWidget();
    this.initDroneHUD();

    // Loop de animación
    if (this.mapManager.addAnimated) {
      this.mapManager.addAnimated(this.droneGroup, (delta, time) => this.update(delta, time));
    }

    // Escuchar eventos de solicitud de intercepción
    bus.on('drone:dispatch_intercept', (data) => {
      if (data && data.target) {
        this.dispatchIntercept(data.target, data.camera);
      }
    });
  }

  /**
   * Construye el modelo 3D del DJI Dock 2 en el suelo
   */
  buildDjiDock() {
    this.dockGroup = new THREE.Group();
    this.dockGroup.position.copy(this.dockPos);

    // 1. Base del Dock
    const baseGeo = new THREE.BoxGeometry(2.4, 0.4, 2.4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    this.dockGroup.add(base);

    // 2. Escotilla motorizada
    const hatchGeo = new THREE.BoxGeometry(2.1, 0.5, 2.1);
    const hatchMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.2, roughness: 0.3 });
    this.dockHatch = new THREE.Mesh(hatchGeo, hatchMat);
    this.dockHatch.position.y = 0.55;
    this.dockGroup.add(this.dockHatch);

    // 3. Mástil y antena RTK centimétrica
    const mastGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(1.0, 1.0, 1.0);
    this.dockGroup.add(mast);

    const rtkGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 12);
    const rtkMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const rtk = new THREE.Mesh(rtkGeo, rtkMat);
    rtk.position.set(1.0, 1.9, 1.0);
    this.dockGroup.add(rtk);

    // 4. Pad de aterrizaje 'H'
    const padGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const padMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.81;
    this.dockGroup.add(pad);

    // 5. LED indicador de estado
    const ledGeo = new THREE.SphereGeometry(0.07, 8, 8);
    this.dockLedMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const led = new THREE.Mesh(ledGeo, this.dockLedMat);
    led.position.set(0.9, 0.7, -0.9);
    this.dockGroup.add(led);

    this.droneGroup.add(this.dockGroup);
  }

  /**
   * Construye el modelo 3D del Dron Cuadricóptero
   */
  buildDroneModel() {
    this.droneMesh = new THREE.Group();
    this.droneMesh.position.set(this.dockPos.x, this.dockPos.y + 0.85, this.dockPos.z);

    // Fuselaje aerodinámico
    const bodyGeo = new THREE.BoxGeometry(0.6, 0.18, 0.8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.85 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    this.droneMesh.add(body);

    const hoodGeo = new THREE.BoxGeometry(0.48, 0.12, 0.6);
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2 });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.y = 0.12;
    this.droneMesh.add(hood);

    // Gimbal con lente multiespectral
    const gimbalGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const gimbalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95 });
    const gimbal = new THREE.Mesh(gimbalGeo, gimbalMat);
    gimbal.position.set(0, -0.12, 0.15);
    this.droneMesh.add(gimbal);

    // 4 Brazos con hélices
    this.rotors = [];
    const armPositions = [
      { x: -0.5, z: -0.5 },
      { x: 0.5, z: -0.5 },
      { x: -0.5, z: 0.5 },
      { x: 0.5, z: 0.5 }
    ];

    armPositions.forEach(pos => {
      const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.65, 8);
      const armMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.rotation.z = Math.PI / 2;
      arm.position.set(pos.x * 0.5, 0, pos.z * 0.5);
      arm.lookAt(new THREE.Vector3(pos.x, 0, pos.z));
      this.droneMesh.add(arm);

      const motorGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8);
      const motorMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
      const motor = new THREE.Mesh(motorGeo, motorMat);
      motor.position.set(pos.x, 0.05, pos.z);
      this.droneMesh.add(motor);

      const propGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.01, 16);
      const propMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
      const prop = new THREE.Mesh(propGeo, propMat);
      prop.position.set(pos.x, 0.12, pos.z);
      this.droneMesh.add(prop);
      this.rotors.push(prop);
    });

    // Cono nadir de escaneo
    const scanGeo = new THREE.ConeGeometry(8.5, 30.0, 16, 1, true);
    scanGeo.translate(0, -15.0, 0);
    scanGeo.rotateX(-Math.PI / 2);

    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.nadirScanMesh = new THREE.Mesh(scanGeo, scanMat);
    this.droneMesh.add(this.nadirScanMesh);

    this.droneGroup.add(this.droneMesh);
  }

  /**
   * Línea guía táctica de intercepción (haz de luz que conecta Dron ➔ Objetivo)
   */
  buildTacticalLaserBeam() {
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
    const beamGeo = new THREE.BufferGeometry().setFromPoints(points);
    const beamMat = new THREE.LineDashedMaterial({
      color: 0xef4444,
      dashSize: 1.5,
      gapSize: 0.8,
      linewidth: 2,
      transparent: true,
      opacity: 0.0
    });
    this.laserBeam = new THREE.Line(beamGeo, beamMat);
    this.laserBeam.computeLineDistances();
    this.droneGroup.add(this.laserBeam);
  }

  /**
   * Inicia misión de fotogrametría estándar (patrulla de cuarteles)
   */
  startMission() {
    if (this.state !== 'docked') return;

    this.state = 'takeoff';
    this.missionType = 'survey';
    this.progress = 0;
    this.photosCount = 0;
    this.currentWpIndex = 0;
    this.battery = 98;

    this.dockLedMat.color.setHex(0x38bdf8);
    this.nadirScanMesh.material.opacity = 0.22;
    this.nadirScanMesh.material.color.setHex(0x10b981); // Verde NDVI

    this.updateHUD();
    this.updateDiegeticWidgetStatus();
    this.showToast('🚁 Misión DJI Dock 2 iniciada: Despegue a 28m AGL para captura de ortomosaico.');
  }

  /**
   * ORQUESTACIÓN REACTIVA: Despacha el dron inmediatamente a verificar una alerta de cámara fija
   */
  dispatchIntercept(targetPos, cameraData) {
    this.interceptTarget = targetPos.clone();
    this.interceptSourceCamera = cameraData;
    this.missionType = 'intercept';
    this.orbitTimer = 0;
    this.orbitAngle = 0;

    // Conectar el haz láser visual
    this.laserBeam.material.opacity = 0.85;
    this.laserBeam.material.color.setHex(0xef4444);

    if (this.state === 'docked') {
      this.state = 'takeoff';
    } else {
      this.state = 'intercept';
    }

    this.dockLedMat.color.setHex(0xef4444); // Rojo alerta
    this.nadirScanMesh.material.opacity = 0.35;
    this.nadirScanMesh.material.color.setHex(0xef4444); // Cono rojo táctico

    this.updateHUD();
    this.updateDiegeticWidgetStatus();

    const camName = cameraData ? cameraData.name : 'Punto Objetivo';
    this.showToast(`🚨 DISPACHO REACTIVO: DJI Dock 2 en ruta de intercepción directa hacia [${camName}].`);
  }

  /**
   * Ciclo de actualización de física y vuelo
   */
  update(rawDelta, time) {
    const delta = Math.min(rawDelta || 0.016, 0.06);
    if (this.state !== 'docked') {
      this.rotors.forEach(r => { r.rotation.y += delta * 48; });
      this.nadirScanMesh.material.opacity = 0.2 + 0.12 * Math.sin(time * 7.0);

      // Si hay un haz táctico activo hacia un blanco
      if (this.interceptTarget && this.laserBeam.material.opacity > 0) {
        const positions = this.laserBeam.geometry.attributes.position.array;
        positions[0] = this.droneMesh.position.x;
        positions[1] = this.droneMesh.position.y;
        positions[2] = this.droneMesh.position.z;
        positions[3] = this.interceptTarget.x;
        positions[4] = this.interceptTarget.y + 0.5;
        positions[5] = this.interceptTarget.z;
        this.laserBeam.geometry.attributes.position.needsUpdate = true;
        this.laserBeam.computeLineDistances();
      }
    }

    // Máquina de estados
    if (this.state === 'takeoff') {
      const targetY = this.dockPos.y + this.flightAlt;
      this.droneMesh.position.y += delta * 9.0;

      if (this.droneMesh.position.y >= targetY) {
        this.droneMesh.position.y = targetY;
        this.state = (this.missionType === 'intercept') ? 'intercept' : 'survey';
      }
      this.updateHUD();
    } else if (this.state === 'survey') {
      // Patrulla regular
      const targetWp = this.waypoints[this.currentWpIndex];
      const curPos = this.droneMesh.position;

      const dir = new THREE.Vector3().subVectors(targetWp, curPos);
      dir.y = 0;
      const dist = dir.length();

      if (dist < 1.0) {
        this.currentWpIndex++;
        this.photosCount += 24;
        if (this.currentWpIndex >= this.waypoints.length) {
          this.state = 'rth';
          this.showToast('📸 Captura multiespectral finalizada. Retornando al Dock.');
        }
      } else {
        dir.normalize();
        curPos.addScaledVector(dir, this.speed * delta);
        this.droneMesh.rotation.y = Math.atan2(dir.x, dir.z);
      }
      this.battery = Math.max(70, 98 - (this.currentWpIndex * 2.2));
      this.updateHUD();
    } else if (this.state === 'intercept') {
      // Vuelo directo a alta velocidad hacia el objetivo de la cámara
      const targetAir = new THREE.Vector3(this.interceptTarget.x, this.dockPos.y + 22.0, this.interceptTarget.z);
      const curPos = this.droneMesh.position;
      const dir = new THREE.Vector3().subVectors(targetAir, curPos);
      const dist = dir.length();

      if (dist < 1.5) {
        this.state = 'orbit';
        this.orbitTimer = 0;
        this.showToast('🎯 OBJETIVO ALCANZADO: Dron iniciando órbita táctica de inspección (360°).');
        bus.emit('drone:target_reached', { camera: this.interceptSourceCamera });
      } else {
        dir.normalize();
        curPos.addScaledVector(dir, (this.speed * 1.35) * delta); // 35% más rápido en intercepción
        this.droneMesh.rotation.y = Math.atan2(dir.x, dir.z);
      }
      this.updateHUD();
    } else if (this.state === 'orbit') {
      // Órbita circular de 360 grados sobre el objetivo
      this.orbitTimer += delta;
      this.orbitAngle += delta * 1.2;

      const ox = this.interceptTarget.x + Math.cos(this.orbitAngle) * this.orbitRadius;
      const oz = this.interceptTarget.z + Math.sin(this.orbitAngle) * this.orbitRadius;
      this.droneMesh.position.set(ox, this.dockPos.y + 22.0, oz);

      // Mirar continuamente hacia el centro del objetivo
      this.droneMesh.lookAt(new THREE.Vector3(this.interceptTarget.x, this.dockPos.y + 2.0, this.interceptTarget.z));

      // 18 segundos de inspección aérea
      if (this.orbitTimer >= 18.0) {
        this.state = 'rth';
        this.laserBeam.material.opacity = 0.0;
        this.showToast('✅ Verificación aérea completada. Dron iniciando retorno autónomo (RTH).');
      }
      this.updateHUD();
    } else if (this.state === 'rth') {
      const targetDockAir = new THREE.Vector3(this.dockPos.x, this.dockPos.y + this.flightAlt, this.dockPos.z);
      const dir = new THREE.Vector3().subVectors(targetDockAir, this.droneMesh.position);
      const dist = dir.length();

      if (dist < 0.8) {
        this.state = 'landing';
      } else {
        dir.normalize();
        this.droneMesh.position.addScaledVector(dir, this.speed * delta);
        this.droneMesh.rotation.y = Math.atan2(dir.x, dir.z);
      }
      this.updateHUD();
    } else if (this.state === 'landing') {
      const landingY = this.dockPos.y + 0.85;
      this.droneMesh.position.y -= delta * 6.0;

      if (this.droneMesh.position.y <= landingY) {
        this.droneMesh.position.y = landingY;
        this.state = 'docked';
        this.nadirScanMesh.material.opacity = 0.0;
        this.dockLedMat.color.setHex(0x10b981);
        this.laserBeam.material.opacity = 0.0;

        if (this.missionType === 'survey') {
          this.applyDroneOrthomosaic();
        }
        this.updateHUD();
        this.updateDiegeticWidgetStatus();
      }
    }
  }

  /**
   * ACTUALIZACIÓN EN CALIENTE: Aplica ortomosaico multiespectral en el terreno
   */
  applyDroneOrthomosaic() {
    this.showToast('⚡ Procesando ortomosaico multiespectral en contenedor NodeODM...');

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createRadialGradient(512, 512, 100, 512, 512, 500);
      grad.addColorStop(0, '#15803d');
      grad.addColorStop(0.5, '#4ade80');
      grad.addColorStop(0.8, '#a3e635');
      grad.addColorStop(1, '#854d0e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);

      ctx.strokeStyle = 'rgba(21, 128, 61, 0.45)';
      ctx.lineWidth = 3;
      for (let y = 60; y < 960; y += 18) {
        ctx.beginPath();
        ctx.moveTo(80, y);
        ctx.lineTo(940, y);
        ctx.stroke();
      }

      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.arc(820, 240, 90, 0, Math.PI * 2);
      ctx.fill();

      const newTexture = new THREE.CanvasTexture(canvas);
      newTexture.wrapS = THREE.RepeatWrapping;
      newTexture.wrapT = THREE.RepeatWrapping;

      if (this.mapManager.groundCiv6Mat) {
        this.mapManager.groundCiv6Mat.map = newTexture;
        this.mapManager.groundCiv6Mat.needsUpdate = true;
      }
      if (this.mapManager.groundSatMat) {
        this.mapManager.groundSatMat.map = newTexture;
        this.mapManager.groundSatMat.needsUpdate = true;
      }

      this.showToast('✅ ¡Terreno 3D actualizado en caliente! Ortomosaico de dron (NDVI/RGB) aplicado con éxito.');
    }, 1200);
  }

  /**
   * Widget Diegético Flotante con Sprite Real ('assets/ui/sprite_cerro_drone.png')
   */
  initDiegeticDroneWidget() {
    if (document.getElementById('agritwin-diegetic-drone-pill')) return;

    const style = document.createElement('style');
    style.id = 'agritwin-diegetic-drone-styles';
    style.textContent = `
      .diegetic-drone-pill {
        position: fixed;
        top: 16px;
        left: 236px;
        z-index: 40;
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(13, 20, 36, 0.94);
        border: 1px solid rgba(56, 189, 248, 0.45);
        color: #f8fafc;
        padding: 5px 12px 5px 6px;
        border-radius: 9999px;
        cursor: pointer;
        backdrop-filter: blur(16px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.65), 0 0 16px rgba(56, 189, 248, 0.2);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      }
      .diegetic-drone-pill:hover {
        transform: translateY(-2px) scale(1.02);
        border-color: #38bdf8;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.75), 0 0 22px rgba(56, 189, 248, 0.35);
      }
      .diegetic-drone-avatar {
        position: relative;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%);
        border: 1px solid rgba(56, 189, 248, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: visible;
      }
      .diegetic-drone-img {
        width: 46px;
        height: auto;
        object-fit: contain;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.7));
        transform: scale(1.15);
        transition: transform 0.2s ease;
      }
      .diegetic-drone-pill:hover .diegetic-drone-img {
        transform: scale(1.28) rotate(-4deg);
      }
      .diegetic-drone-ping {
        position: absolute;
        top: -1px;
        right: -1px;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
        border: 1.5px solid #0f172a;
      }
      .diegetic-drone-ping.in-flight {
        background: #f59e0b;
        box-shadow: 0 0 10px #f59e0b;
        animation: pulse 1s infinite;
      }
      .diegetic-drone-ping.intercept {
        background: #ef4444;
        box-shadow: 0 0 12px #ef4444;
        animation: pulse 0.7s infinite;
      }
      .diegetic-drone-info {
        display: flex;
        flex-direction: column;
        line-height: 1.15;
      }
      .diegetic-drone-title {
        font-size: 11px;
        font-weight: 800;
        color: #f8fafc;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .diegetic-drone-status {
        font-size: 9.5px;
        font-family: ui-monospace, monospace;
        color: #38bdf8;
      }
      .diegetic-drone-action-btn {
        background: rgba(14, 165, 233, 0.25);
        border: 1px solid rgba(56, 189, 248, 0.45);
        color: #e0f2fe;
        font-size: 10px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 9999px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .diegetic-drone-action-btn:hover {
        background: #0284c7;
        color: #fff;
      }
    `;
    document.head.appendChild(style);

    const pill = document.createElement('div');
    pill.id = 'agritwin-diegetic-drone-pill';
    pill.className = 'diegetic-drone-pill';
    pill.title = 'DJI Dock 2 • Haz clic para volar la cámara al hangar o despachar';
    pill.innerHTML = `
      <div class="diegetic-drone-avatar">
        <img src="assets/ui/sprite_cerro_drone.png" alt="DJI Dock Dron" class="diegetic-drone-img" />
        <span class="diegetic-drone-ping" id="diegetic-drone-ping-dot"></span>
      </div>
      <div class="diegetic-drone-info">
        <div class="diegetic-drone-title">DJI Dock 2 • Sentinel</div>
        <div class="diegetic-drone-status" id="diegetic-drone-status-text">Hangar • 98% Bat • RTK FIX</div>
      </div>
      <button class="diegetic-drone-action-btn" id="btn-diegetic-drone-action">
        🚀 Despegar
      </button>
    `;

    document.body.appendChild(pill);

    // Eventos
    pill.onclick = (e) => {
      if (e.target.id === 'btn-diegetic-drone-action') return;
      if (this.mapManager && this.mapManager.animateCamera) {
        // Volar suavemente al dock
        const dockCamPos = this.dockPos.clone().add(new THREE.Vector3(10, 12, 14));
        const target = this.dockPos.clone().add(new THREE.Vector3(0, 1, 0));
        this.mapManager.animateCamera(dockCamPos, target, 1200);
      }
    };

    document.getElementById('btn-diegetic-drone-action').onclick = (e) => {
      e.stopPropagation();
      if (this.state === 'docked') {
        this.startMission();
      } else {
        this.state = 'rth';
        this.showToast('↩️ Solicitado Retorno Autónomo a Base (RTH).');
      }
    };
  }

  updateDiegeticWidgetStatus() {
    const statusText = document.getElementById('diegetic-drone-status-text');
    const pingDot = document.getElementById('diegetic-drone-ping-dot');
    const actionBtn = document.getElementById('btn-diegetic-drone-action');
    if (!statusText || !pingDot || !actionBtn) return;

    if (this.state === 'docked') {
      statusText.textContent = `Hangar • ${Math.round(this.battery)}% Bat • RTK FIX`;
      pingDot.className = 'diegetic-drone-ping';
      actionBtn.textContent = '🚀 Despegar';
    } else if (this.state === 'intercept' || this.state === 'orbit') {
      statusText.textContent = `🎯 INTERCEPCIÓN • ${this.droneMesh.position.y.toFixed(0)}m AGL`;
      pingDot.className = 'diegetic-drone-ping intercept';
      actionBtn.textContent = '↩ RTH';
    } else {
      statusText.textContent = `🛰️ VUELO FOTOGRAMETRÍA • ${this.photosCount}/240`;
      pingDot.className = 'diegetic-drone-ping in-flight';
      actionBtn.textContent = '↩ RTH';
    }
  }

  /**
   * HUD flotante de telemetría superior
   */
  initDroneHUD() {
    if (document.getElementById('agritwin-drone-hud')) return;

    const hud = document.createElement('div');
    hud.id = 'agritwin-drone-hud';
    hud.style.cssText = `
      position: fixed;
      top: 76px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(13, 20, 36, 0.94);
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 9999px;
      padding: 8px 20px;
      display: none;
      align-items: center;
      gap: 16px;
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      font-size: 11px;
      font-weight: 700;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 15px rgba(56, 189, 248, 0.2);
      backdrop-filter: blur(14px);
      z-index: 1000;
      pointer-events: auto;
    `;

    hud.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#38bdf8;animation:pulse 1.2s infinite;"></span>
        <span style="color:#38bdf8;" id="drone-hud-mode-badge">DJI DOCK 2 • RTK FIX</span>
      </div>
      <div style="color:#94a3b8;">|</div>
      <div>Alt: <span id="drone-hud-alt" style="color:#fde047;font-family:monospace;">28.0 m</span></div>
      <div>GSD: <span style="color:#6ee7b7;font-family:monospace;">1.8 cm/px</span></div>
      <div>Fotos: <span id="drone-hud-photos" style="color:#38bdf8;font-family:monospace;">0/240</span></div>
      <div>Batería: <span id="drone-hud-bat" style="color:#4ade80;font-family:monospace;">98%</span></div>
      <button id="btn-drone-apply-ortho" style="background:#0284c7;color:#fff;border:none;padding:4px 10px;border-radius:9999px;font-size:10px;font-weight:bold;cursor:pointer;">
        Actualizar Terreno Ahora
      </button>
    `;

    document.body.appendChild(hud);

    document.getElementById('btn-drone-apply-ortho').onclick = () => {
      this.applyDroneOrthomosaic();
    };
  }

  updateHUD() {
    this.updateDiegeticWidgetStatus();
    const hud = document.getElementById('agritwin-drone-hud');
    if (!hud) return;

    if (this.state === 'docked') {
      hud.style.display = 'none';
      return;
    }

    hud.style.display = 'flex';
    const altEl = document.getElementById('drone-hud-alt');
    if (altEl) altEl.textContent = `${this.droneMesh.position.y.toFixed(1)} m`;

    const photosEl = document.getElementById('drone-hud-photos');
    if (photosEl) photosEl.textContent = (this.missionType === 'intercept') ? `OBJETIVO` : `${this.photosCount}/240`;

    const batEl = document.getElementById('drone-hud-bat');
    if (batEl) batEl.textContent = `${Math.round(this.battery)}%`;

    const badgeEl = document.getElementById('drone-hud-mode-badge');
    if (badgeEl) {
      badgeEl.textContent = (this.missionType === 'intercept') ? '🎯 INTERCEPCIÓN GUIADA' : 'DJI DOCK 2 • RTK FIX';
    }
  }

  showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 84px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(13, 20, 36, 0.96);
      border: 1px solid #38bdf8;
      color: #f8fafc;
      padding: 10px 18px;
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
    toast.innerHTML = `<span>🚁</span> <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}
