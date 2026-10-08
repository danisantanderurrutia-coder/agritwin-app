/**
 * AgriTwin 3D - GeomorphicFlowManager Module
 * 
 * Renders scientific, clean and aesthetic geomorphic flow diagrams on 3D terrain:
 * 1. Gravitational Runoff Flow Vectors (D8 steepest descent talweg vectors)
 * 2. Windy-style Streamlines & Wind Vector Particles (catabatic Puelche wind)
 * 3. Demarcated Flood & Wildfire Hazard Zones (inspired by geomorphology & stratigraphy plates)
 */

import { bus } from '../utils/EventBus.js?v=3.0.0';

export class GeomorphicFlowManager {
  constructor(scene, getElevationFn) {
    this.scene = scene;
    this.getElevation = getElevationFn || ((x, z) => 0);

    // Three.js Display Groups
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'geomorphicFlowRootGroup';

    this.waterFlowGroup = new THREE.Group();
    this.waterFlowGroup.name = 'waterFlowGroup';

    this.windParticleGroup = new THREE.Group();
    this.windParticleGroup.name = 'windParticleGroup';

    this.hazardZonesGroup = new THREE.Group();
    this.hazardZonesGroup.name = 'hazardZonesGroup';

    this.rootGroup.add(this.waterFlowGroup);
    this.rootGroup.add(this.windParticleGroup);
    this.rootGroup.add(this.hazardZonesGroup);
    this.scene.add(this.rootGroup);

    // Internal State
    this.waterFlowsVisible = false;
    this.windStreamlinesVisible = false;
    this.hazardZonesVisible = false;

    // Wind Particle Simulation Cache
    this.windParticles = [];
    this.maxWindParticles = 120;
    this.windSpeedScale = 0.55;

    // Build initial geomorphic elements
    this.initWaterFlowVectors();
    this.initWindParticles();
    this.initDemarcatedHazardZones();

    // Wire EventBus listeners
    this.setupListeners();

    // 4. Simulador de Tormenta Torrencial / Escorrentía Dinámica
    this.initTorrentialRunoffParticles();
  }

  setupListeners() {
    bus.on('geomorph:toggle_water_flows', (active) => this.toggleWaterFlows(active));
    bus.on('geomorph:toggle_wind_streamlines', (active) => this.toggleWindStreamlines(active));
    bus.on('geomorph:toggle_hazard_zones', (active) => this.toggleHazardZones(active));
    bus.on('geomorph:toggle_wind_current', ({ currentId, active }) => this.toggleCurrentType(currentId, active));
    bus.on('geomorph:set_wind_params', ({ speed, direction }) => this.setWindParams(speed, direction));
    bus.on('geomorph:set_all_modes', ({ water, wind, zones }) => {
      if (water !== undefined) this.toggleWaterFlows(water);
      if (wind !== undefined) this.toggleWindStreamlines(wind);
      if (zones !== undefined) this.toggleHazardZones(zones);
    });
    bus.on('simulation:trigger_torrential_rain', (params) => this.startTorrentialStorm(params));
  }

  initTorrentialRunoffParticles() {
    this.stormGroup = new THREE.Group();
    this.stormGroup.name = 'stormTorrentialGroup';
    this.rootGroup.add(this.stormGroup);
    this.isStormActive = false;

    // Pool de partículas de escorrentía superficial
    this.runoffParticles = [];
    const particleCount = 140;
    const dropGeo = new THREE.SphereGeometry(0.18, 6, 6);
    const dropMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
      emissive: new THREE.Color('#0284c7'),
      emissiveIntensity: 0.2
    });

    for (let i = 0; i < particleCount; i++) {
      const mesh = new THREE.Mesh(dropGeo, dropMat);
      mesh.visible = false;
      this.stormGroup.add(mesh);
      this.runoffParticles.push({
        mesh,
        x: 0,
        z: 0,
        y: 0,
        vx: 0,
        vz: 0,
        life: 0,
        maxLife: 100,
        active: false
      });
    }
  }

  startTorrentialStorm(params = {}) {
    const intensityMm = params.mm || 60;
    const durationHours = params.hours || 4;
    this.isStormActive = true;
    this.waterFlowsVisible = true;
    this.waterFlowGroup.visible = true;

    // Reactivar y dispersar partículas en laderas altas
    this.runoffParticles.forEach(p => {
      p.active = true;
      p.mesh.visible = true;
      p.x = 20 + (Math.random() - 0.5) * 50;
      p.z = -30 + (Math.random() - 0.5) * 50;
      p.life = Math.floor(Math.random() * 80);
      p.maxLife = 90 + Math.random() * 60;
    });

    bus.emit('ui:show_toast', `🌧️ Simulación de Tormenta (${intensityMm}mm en ${durationHours}h): Escorrentía activa hacia zanjas y tranques`);
  }

  updateRunoffParticles(delta = 0.016) {
    if (!this.isStormActive) return;

    this.runoffParticles.forEach(p => {
      if (!p.active) return;
      p.life++;

      // Gradiente de descenso: escorrentía por gravedad hacia x negativo y cota más baja
      p.vx = -0.45 + (Math.random() - 0.5) * 0.15;
      p.vz = 0.25 + (Math.random() - 0.5) * 0.15;

      p.x += p.vx;
      p.z += p.vz;
      p.y = this.getElevation(p.x, p.z) + 0.22;

      p.mesh.position.set(p.x, p.y, p.z);

      // Si llega al estero / vaguada o expira, reaparece en la cumbre
      if (p.life >= p.maxLife || p.x < -30) {
        p.x = 25 + (Math.random() - 0.5) * 40;
        p.z = -25 + (Math.random() - 0.5) * 40;
        p.life = 0;
      }
    });
  }

  // ─── 1. Gravitational Runoff Flow Vectors (D8 & Talwegs) ────────────────────

  initWaterFlowVectors() {
    this.waterFlowGroup.clear();

    // Ejes preferenciales de escorrentía gravitatoria hacia el Estero Colliguay / Perquilauquén
    // Siguiendo el vector de gradiente descendente (-grad h)
    const runoffChains = [
      // Cuenca Alta Oriental (Precordillera de los Andes -> Valle Central)
      [
        { x: 42, z: -45 }, { x: 30, z: -35 }, { x: 18, z: -25 }, { x: 6, z: -18 }, { x: -6, z: -12 }, { x: -18, z: -8 }
      ],
      // Quebrada Norte (Laderas de Longaví hacia meandro norte)
      [
        { x: 35, z: 25 }, { x: 22, z: 18 }, { x: 10, z: 12 }, { x: -2, z: 8 }, { x: -14, z: 4 }
      ],
      // Vaguada Sur (Drenaje de terrazas agrícolas hacia el estero)
      [
        { x: 15, z: 50 }, { x: 5, z: 38 }, { x: -4, z: 26 }, { x: -12, z: 16 }, { x: -20, z: 8 }
      ],
      // Micro-quebradas secundarias de ladera
      [
        { x: -5, z: -55 }, { x: -10, z: -40 }, { x: -15, z: -25 }, { x: -18, z: -10 }
      ],
      [
        { x: 20, z: -70 }, { x: 10, z: -50 }, { x: -2, z: -32 }, { x: -15, z: -15 }
      ]
    ];

    runoffChains.forEach(chain => {
      for (let i = 0; i < chain.length - 1; i++) {
        const p1 = chain[i];
        const p2 = chain[i + 1];

        const y1 = this.getElevation(p1.x, p1.z) + 0.35;
        const y2 = this.getElevation(p2.x, p2.z) + 0.35;

        const v1 = new THREE.Vector3(p1.x, y1, p1.z);
        const v2 = new THREE.Vector3(p2.x, y2, p2.z);

        const dir = new THREE.Vector3().subVectors(v2, v1);
        const length = dir.length();
        dir.normalize();

        // Flecha estilizada de geomorfología (Cian translúcido con cabeza nítida)
        const arrow = new THREE.ArrowHelper(dir, v1, length * 0.88, 0x0284c7, Math.min(1.8, length * 0.35), Math.min(1.0, length * 0.22));
        
        // Ajustar grosor y material de la línea
        if (arrow.line && arrow.line.material) {
          arrow.line.material.transparent = true;
          arrow.line.material.opacity = 0.85;
          arrow.line.material.linewidth = 2;
        }
        if (arrow.cone && arrow.cone.material) {
          arrow.cone.material.color = new THREE.Color('#38bdf8');
        }

        this.waterFlowGroup.add(arrow);

        // Nódulo esférico pulsante de acumulación de escorrentía en el inicio de talweg
        if (i === 0) {
          const sphereGeo = new THREE.SphereGeometry(0.4, 12, 12);
          const sphereMat = new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.75 });
          const sphere = new THREE.Mesh(sphereGeo, sphereMat);
          sphere.position.copy(v1);
          this.waterFlowGroup.add(sphere);
        }
      }
    });

    this.waterFlowGroup.visible = this.waterFlowsVisible;
  }

  // ─── 2. Windy-style Wind Vector Particles (Dynamic Vector & Palette) ─────────

  // ─── 2. Multi-Current Orographic Wind Simulation (Estilo Windy 3D) ─────────

  initWindParticles() {
    this.windParticleGroup.clear();

    // Definición de las 4 Corrientes de Aire Dominantes en la Cuenca del Maule / Perquilauquén:
    this.windCurrents = {
      puelche: {
        id: 'puelche',
        name: 'Viento Puelche / Raco (Cálido y Desecante)',
        desc: 'Viento de descenso andino (foehn), alta velocidad y ráfagas secas',
        active: true,
        baseDirX: -0.95, // ENE -> WSW
        baseDirZ: 0.30,
        speedKmH: 42,
        speedScale: 0.85,
        elevationOffset: 2.2,
        colorPalette: [0xef4444, 0xf97316, 0xfacc15], // Rojo / Naranja fuego
        count: 140,
        spawnArea: { xMin: 55, xMax: 85, zMin: -70, zMax: 30 },
        particles: []
      },
      breeze: {
        id: 'breeze',
        name: 'Brisa Marina Diurna (Suroeste)',
        desc: 'Corriente fresca del Pacífico que asciende por laderas térmicas',
        active: true,
        baseDirX: 0.75, // SW -> NE
        baseDirZ: -0.66,
        speedKmH: 18,
        speedScale: 0.45,
        elevationOffset: 1.8,
        colorPalette: [0x38bdf8, 0x0ea5e9, 0x06b6d4], // Cian / Azul fresco
        count: 120,
        spawnArea: { xMin: -85, xMax: -45, zMin: 40, zMax: 80 },
        particles: []
      },
      catabatic: {
        id: 'catabatic',
        name: 'Drenaje Nocturno de Aire Frío (Catabático)',
        desc: 'Aire denso que desciende por laderas hacia las hondonadas (Riesgo Heladas)',
        active: true,
        baseDirX: -0.4, // Desciende desde cerros hacia el centro
        baseDirZ: 0.8,
        speedKmH: 9,
        speedScale: 0.25,
        elevationOffset: 0.8, // Muy pegado al suelo
        colorPalette: [0xa855f7, 0x818cf8, 0xc084fc], // Violeta / Púrpura frío
        count: 90,
        spawnArea: { xMin: 15, xMax: 65, zMin: -65, zMax: -15 },
        particles: []
      },
      talweg: {
        id: 'talweg',
        name: 'Canalización por Quebrada y Estero (Efecto Venturi)',
        desc: 'Chorro de aire encajonado a lo largo del cauce fluvial principal',
        active: true,
        baseDirX: -0.85, // Sigue el eje del estero
        baseDirZ: -0.35,
        speedKmH: 26,
        speedScale: 0.60,
        elevationOffset: 1.1,
        colorPalette: [0x10b981, 0x34d399, 0x2dd4bf], // Esmeralda / Turquesa fluvial
        count: 80,
        spawnArea: { xMin: 20, xMax: 60, zMin: 30, zMax: 70 },
        particles: []
      }
    };

    // Subgrupos de Three.js para cada corriente (permite encender/apagar limpiamente)
    this.currentGroups = {};
    Object.keys(this.windCurrents).forEach(key => {
      const current = this.windCurrents[key];
      const grp = new THREE.Group();
      grp.name = `windGroup_${key}`;
      this.currentGroups[key] = grp;
      this.windParticleGroup.add(grp);

      this._initParticlesForCurrent(current, grp);
    });

    this.windParticleGroup.visible = this.windStreamlinesVisible;
  }

  _initParticlesForCurrent(current, parentGroup) {
    current.particles = [];
    const numPts = 6;

    for (let i = 0; i < current.count; i++) {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(numPts * 3);
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const colorHex = current.colorPalette[i % current.colorPalette.length];
      const mat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.8,
        linewidth: 2
      });

      const line = new THREE.Line(geo, mat);
      parentGroup.add(line);

      const spawnX = current.spawnArea.xMin + Math.random() * (current.spawnArea.xMax - current.spawnArea.xMin);
      const spawnZ = current.spawnArea.zMin + Math.random() * (current.spawnArea.zMax - current.spawnArea.zMin);

      current.particles.push({
        line: line,
        pos: new THREE.Vector3(spawnX, 0, spawnZ),
        speed: (0.7 + Math.random() * 0.6) * current.speedScale,
        age: Math.random() * 80,
        maxAge: 65 + Math.random() * 70,
        history: []
      });
    }
  }

  setWindParams(speedKmH = 20, directionDeg = 65) {
    this.windSpeedKmH = speedKmH;
    this.windDirectionDeg = directionDeg;
    // Si se modifica la meteorología general, ajustamos el Puelche y la brisa según corresponda
    if (this.windCurrents && this.windCurrents.puelche) {
      this.windCurrents.puelche.speedKmH = speedKmH;
      this.windCurrents.puelche.speedScale = Math.max(0.2, speedKmH / 28);
    }
  }

  toggleCurrentType(currentId, active) {
    if (!this.windCurrents || !this.windCurrents[currentId]) return;
    this.windCurrents[currentId].active = active;
    if (this.currentGroups[currentId]) {
      this.currentGroups[currentId].visible = active;
    }
    const currentName = this.windCurrents[currentId].name;
    bus.emit('ui:show_toast', active ? `🌬️ Corriente activa: ${currentName}` : `💨 Oculta: ${currentName}`);
  }

  updateWindParticles(delta) {
    if (!this.windStreamlinesVisible) return;

    Object.keys(this.windCurrents).forEach(key => {
      const current = this.windCurrents[key];
      if (!current.active) return;

      const baseDirX = current.baseDirX;
      const baseDirZ = current.baseDirZ;

      current.particles.forEach(p => {
        p.age += 1;

        // Comportamiento fluidodinámico específico por corriente
        let wave = Math.sin(p.pos.z * 0.05 + p.age * 0.06) * 0.24;
        if (key === 'talweg') {
          // Meandros más pronunciados encajonados en el cañón
          wave = Math.cos(p.pos.x * 0.08 + p.age * 0.08) * 0.35;
        } else if (key === 'catabatic') {
          // Flujo laminar lento
          wave *= 0.5;
        }

        p.pos.x += (baseDirX + wave) * p.speed;
        p.pos.z += (baseDirZ + wave * 0.4) * p.speed;

        const groundY = this.getElevation(p.pos.x, p.pos.z);
        p.pos.y = groundY + current.elevationOffset + Math.sin(p.age * 0.08) * 0.3;

        // Mantener cola de estela
        p.history.unshift(p.pos.clone());
        if (p.history.length > 6) p.history.pop();

        // Actualizar geometría de línea
        const posAttr = p.line.geometry.attributes.position;
        for (let j = 0; j < 6; j++) {
          const pt = p.history[j] || p.pos;
          posAttr.setXYZ(j, pt.x, pt.y, pt.z);
        }
        posAttr.needsUpdate = true;

        // Atenuación suave en inicio y fin de vida
        const lifeRatio = p.age / p.maxAge;
        p.line.material.opacity = Math.sin(lifeRatio * Math.PI) * 0.85;

        // Resiembra fuera de límites o al expirar
        if (p.age >= p.maxAge || Math.abs(p.pos.x) > 85 || Math.abs(p.pos.z) > 85) {
          const spawnX = current.spawnArea.xMin + Math.random() * (current.spawnArea.xMax - current.spawnArea.xMin);
          const spawnZ = current.spawnArea.zMin + Math.random() * (current.spawnArea.zMax - current.spawnArea.zMin);

          p.pos.set(spawnX, 0, spawnZ);
          p.pos.y = this.getElevation(p.pos.x, p.pos.z) + current.elevationOffset;
          p.age = 0;
          p.history = [p.pos.clone()];
        }
      });
    });
  }

  // ─── 3. Demarcated Hazard Zones (Inundación & Piro-Riesgo) ──────────────────

  initDemarcatedHazardZones() {
    this.hazardZonesGroup.clear();

    // A. ZONA DE INUNDACIÓN FLUVIAL ORDINARIA (T=10 años)
    const floodPtsT10 = [
      new THREE.Vector3(-24, 0.4, -75),
      new THREE.Vector3(-14, 0.4, -40),
      new THREE.Vector3(-10, 0.4, -5),
      new THREE.Vector3(-14, 0.4, 25),
      new THREE.Vector3(-22, 0.4, 65),
      new THREE.Vector3(-30, 0.4, 60),
      new THREE.Vector3(-24, 0.4, 20),
      new THREE.Vector3(-20, 0.4, -10),
      new THREE.Vector3(-26, 0.4, -45)
    ];
    this.buildPolygonZone(floodPtsT10, {
      color: 0x0284c7,
      fillOpacity: 0.28,
      borderHex: '#38bdf8',
      label: 'Zona Inundación Fluvial Ordinaria (T=10)',
      dashed: false
    });

    // B. ZONA DE INUNDACIÓN EXTRAORDINARIA (T=50/100 años - Desborde Isoterma 0 Alta)
    const floodPtsT100 = [
      new THREE.Vector3(-32, 0.6, -80),
      new THREE.Vector3(-18, 0.6, -42),
      new THREE.Vector3(-6,  0.6, -8),
      new THREE.Vector3(-8,  0.6, 28),
      new THREE.Vector3(-16, 0.6, 75),
      new THREE.Vector3(-38, 0.6, 70),
      new THREE.Vector3(-30, 0.6, 25),
      new THREE.Vector3(-26, 0.6, -15),
      new THREE.Vector3(-35, 0.6, -50)
    ];
    this.buildPolygonZone(floodPtsT100, {
      color: 0x0369a1,
      fillOpacity: 0.16,
      borderHex: '#7dd3fc',
      label: 'Envolvente Máxima Crecida (T=100 Isoterma 0)',
      dashed: true
    });

    // C. ZONA CRÍTICA DE PIRO-RIESGO (Sotavento Puelche + Biomasa Forestal Alta)
    const fireRiskPts = [
      new THREE.Vector3(12, 1.8, -35),
      new THREE.Vector3(34, 4.2, -40),
      new THREE.Vector3(42, 5.5, -15),
      new THREE.Vector3(25, 3.2, 10),
      new THREE.Vector3(8,  1.5, 5)
    ];
    this.buildPolygonZone(fireRiskPts, {
      color: 0xef4444,
      fillOpacity: 0.25,
      borderHex: '#f87171',
      label: 'Sector Piro-Riesgo Extremo (FWI 44 - Pino/Esclerófilo)',
      dashed: false
    });

    // D. CORREDOR DE BIOINGENIERÍA RIBEREÑA (Amortiguación de crecidas)
    const riparianPts = [
      new THREE.Vector3(-16, 0.5, -45),
      new THREE.Vector3(-11, 0.5, -12),
      new THREE.Vector3(-14, 0.5, 20),
      new THREE.Vector3(-20, 0.5, 18),
      new THREE.Vector3(-18, 0.5, -15)
    ];
    this.buildPolygonZone(riparianPts, {
      color: 0x10b981,
      fillOpacity: 0.32,
      borderHex: '#34d399',
      label: 'Filtro Biofísico Ribereño (Quillay & Sauce - Reducción Velocidad -42%)',
      dashed: false
    });

    this.hazardZonesGroup.visible = this.hazardZonesVisible;
  }

  buildPolygonZone(points, options) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].z);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].z);
    }
    shape.closePath();

    const shapeGeo = new THREE.ShapeGeometry(shape);
    shapeGeo.rotateX(-Math.PI / 2); // Alinear al plano XZ

    // Ajustar elevación promedio para calzar sobre el relieve
    const avgY = points.reduce((acc, p) => acc + (this.getElevation(p.x, p.z) || p.y), 0) / points.length;
    shapeGeo.translate(0, avgY + 0.12, 0);

    const shapeMat = new THREE.MeshBasicMaterial({
      color: options.color,
      transparent: true,
      opacity: options.fillOpacity,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const zoneMesh = new THREE.Mesh(shapeGeo, shapeMat);
    this.hazardZonesGroup.add(zoneMesh);

    // Contorno vectorizado estilo lámina geomorfológica
    const linePts = points.map(p => new THREE.Vector3(p.x, (this.getElevation(p.x, p.z) || p.y) + 0.18, p.z));
    linePts.push(linePts[0]); // cerrar bucle

    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
    const lineMat = new THREE.LineBasicMaterial({
      color: options.borderHex,
      transparent: true,
      opacity: 0.9,
      linewidth: 2
    });
    const borderLine = new THREE.Line(lineGeo, lineMat);
    this.hazardZonesGroup.add(borderLine);
  }

  // ─── Control Toggles ─────────────────────────────────────────────────────────

  toggleWaterFlows(active) {
    this.waterFlowsVisible = active;
    this.waterFlowGroup.visible = active;
    bus.emit('ui:show_toast', active ? '🌊 Flechas de Flujo Hidráulico (D8 & Talwegs) Visibles' : '🌊 Flujos de Drenaje Ocultos');
  }

  toggleWindStreamlines(active) {
    this.windStreamlinesVisible = active;
    this.windParticleGroup.visible = active;
    bus.emit('ui:show_toast', active ? '🌪️ Vectores de Viento Estilo Windy Activos' : '🌪️ Campo de Viento Oculto');
  }

  toggleHazardZones(active) {
    this.hazardZonesVisible = active;
    this.hazardZonesGroup.visible = active;
    bus.emit('ui:show_toast', active ? '📐 Zonas Demarcadas de Riesgo (Geomorfología) Visibles' : '📐 Zonas de Riesgo Ocultas');
  }
}
