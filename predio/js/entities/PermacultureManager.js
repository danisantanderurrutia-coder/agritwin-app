/**
 * AgriTwin - PermacultureManager Module
 * 
 * Implements:
 *  - Opción B: Zonificación Concéntrica 0 a 5 de Bill Mollison (Conforme al Relieve 3D & Insignias Holográficas)
 *  - Opción C: Hidrología de Escala Keyline de P.A. Yeomans (Curvas de nivel reales sobre el DEM, Surcos de infiltración y Flujo gravitacional animado hacia el Tranque)
 */

import { bus } from '../utils/EventBus.js';

export class PermacultureManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.scene = mapManager.scene;

    this.group = new THREE.Group();
    this.group.name = 'permacultureManagerGroup';
    this.scene.add(this.group);

    this.zonesGroup = new THREE.Group();
    this.keylineGroup = new THREE.Group();
    this.group.add(this.zonesGroup);
    this.group.add(this.keylineGroup);

    // Activamos por defecto para que el usuario vea los datos inmediatamente
    this.showZones = true;
    this.showKeyline = true;
    this.zonesGroup.visible = true;
    this.keylineGroup.visible = true;

    // Origen: Casona Central / Taller: x = -8, z = 8
    this.originX = -8;
    this.originZ = 8;

    // Tranque coordinates: x ≈ 34, z ≈ -22
    this.pondX = 34;
    this.pondZ = -22;

    // Capas dinámicas de usuario (dibujadas libremente con Pincel)
    this.customKeylineGroup = new THREE.Group();
    this.customKeylineGroup.name = 'customKeylineGroup';
    this.keylineGroup.add(this.customKeylineGroup);
    this.customElements = [];

    this.initMollisonZones3D();
    this.initKeylineSystem3D();

    bus.on('layer:permaculture_zones', (visible) => this.toggleZones(visible));
    bus.on('layer:keyline', (visible) => this.toggleKeyline(visible));
    bus.on('permaculture:element_created', (data) => this.registerCustomElement(data));

    this.mapManager.addAnimated(this.group, (time) => this.updateAnimations(time));
  }

  registerCustomElement(data) {
    this.customElements.push(data);
    const meta = data.elementMeta || {};
    
    // Si es un Swale o Tranque, trazamos el canal hidrológico dinámico hacia la red
    if (meta.hydroRole === 'infiltrating_swale' || meta.style === 'swale_keyline') {
      this.buildDynamicSwaleFeed(data);
    }
  }

  buildDynamicSwaleFeed(data) {
    if (!data.points || data.points.length < 2) return;
    
    // Calcular centroide del swale
    let cx = 0, cz = 0;
    data.points.forEach(p => { cx += p.x; cz += p.z; });
    cx /= data.points.length;
    cz /= data.points.length;

    // Vector guía de conexión hacia el punto más cercano o tranque
    const midX = (cx + this.pondX) / 2;
    const midZ = (cz + this.pondZ) / 2;

    const feederPts = [
      new THREE.Vector3(cx, this.getElev(cx, cz, 0.25), cz),
      new THREE.Vector3(midX, this.getElev(midX, midZ, 0.24), midZ),
      new THREE.Vector3(this.pondX, this.getElev(this.pondX, this.pondZ, 0.26), this.pondZ)
    ];

    const curve = new THREE.CatmullRomCurve3(feederPts);
    const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.12, 6, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: '#06b6d4',
      transparent: true,
      opacity: 0.7,
      roughness: 0.1
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.customKeylineGroup.add(tubeMesh);

    bus.emit('ui:show_toast', `〰️ Swale Keyline conectado al circuito de infiltración predial.`);
  }

  getElev(x, z, offset = 0.22) {
    if (this.mapManager && typeof this.mapManager.getTerrainElevation === 'function') {
      return this.mapManager.getTerrainElevation(x, z) + offset;
    }
    return 0.45 + offset;
  }

  initMollisonZones3D() {
    this.zonesData = [
      {
        id: 'Z0',
        name: 'Zona 0: Pabellón Central & Taller Agrícola',
        desc: 'Núcleo de decisiones, hogar, biofísica y telemetría IoT en vivo.',
        rInner: 0,
        rOuter: 9,
        color: '#f8fafc',
        opacity: 0.45,
        symbol: '🏠'
      },
      {
        id: 'Z1',
        name: 'Zona 1: Huerto Biointensivo, Biofábrica & Aromáticas',
        desc: 'Compost Bokashi, lombriceras, visitas diarias múltiples y riego por goteo.',
        rInner: 9.2,
        rOuter: 18,
        color: '#facc15',
        opacity: 0.35,
        symbol: '🌱'
      },
      {
        id: 'Z2',
        name: 'Zona 2: Aves, Invernadero & Frutales Cercanos',
        desc: 'Gallinero, cítricos, nogales jóvenes y estanques pequeños de biofiltro.',
        rInner: 18.2,
        rOuter: 29,
        color: '#84cc16',
        opacity: 0.30,
        symbol: '🐓'
      },
      {
        id: 'Z3',
        name: 'Zona 3: Cuarteles Comerciales & Pastoreo PRV',
        desc: 'Cerezos Lapins, avellanos europeos, viña patrimonial y 8 potreros rotacionales.',
        rInner: 29.2,
        rOuter: 42,
        color: '#059669',
        opacity: 0.28,
        symbol: '🍒'
      },
      {
        id: 'Z4',
        name: 'Zona 4: Silvopastoreo, Olivos & Bosque de Biomasa',
        desc: 'Producción de forraje leñoso, madera para leña y cortavientos andinos.',
        rInner: 42.2,
        rOuter: 56,
        color: '#b45309',
        opacity: 0.25,
        symbol: '🫒'
      },
      {
        id: 'Z5',
        name: 'Zona 5: Reserva Esclerófila & Estero Colliguay',
        desc: 'Bosque nativo de peumo, boldo y quillay. Vida silvestre sin intervención.',
        rInner: 56.2,
        rOuter: 72,
        color: '#0284c7',
        opacity: 0.22,
        symbol: '🌲'
      }
    ];

    this.zoneBadges = [];

    this.zonesData.forEach((z, index) => {
      // 1. Trazado de contornos concéntricos adaptados al relieve 3D
      const segments = 48;
      const borderPoints = [];

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const px = this.originX + Math.cos(theta) * z.rOuter;
        const pz = this.originZ + Math.sin(theta) * z.rOuter;
        const py = this.getElev(px, pz, 0.18 + index * 0.02);
        borderPoints.push(new THREE.Vector3(px, py, pz));
      }

      // Tubo perimetral para el límite de la zona (estilo orgánico natural sin glow cegador)
      const borderCurve = new THREE.CatmullRomCurve3(borderPoints, true);
      const borderGeo = new THREE.TubeGeometry(borderCurve, 64, 0.10, 6, true);
      const borderMat = new THREE.MeshStandardMaterial({
        color: z.color,
        roughness: 0.6,
        metalness: 0.1,
        transparent: true,
        opacity: 0.45,
        emissive: new THREE.Color(z.color),
        emissiveIntensity: 0.05
      });
      const borderMesh = new THREE.Mesh(borderGeo, borderMat);
      this.zonesGroup.add(borderMesh);

      // Insignia Flotante 3D de la Zona
      const badgeAngle = (index * Math.PI) / 3 - 0.3;
      const badgeR = (z.rInner + z.rOuter) / 2;
      const badgeX = this.originX + Math.cos(badgeAngle) * badgeR;
      const badgeZ = this.originZ + Math.sin(badgeAngle) * badgeR;
      const badgeElev = this.getElev(badgeX, badgeZ, 3.8 + index * 0.4);

      const badge = this.createZoneBadge(z);
      badge.position.set(badgeX, badgeElev, badgeZ);
      this.zonesGroup.add(badge);
      this.zoneBadges.push(badge);

      if (this.mapManager && typeof this.mapManager.addPickable === 'function') {
        const entityData = {
          id: `permaculture_${z.id}`,
          name: z.name,
          properties: {
            type: 'permaculture_zone',
            zoneId: z.id,
            name: z.name,
            desc: z.desc
          }
        };
        this.mapManager.addPickable(badge, entityData);
      }

      // Línea de soporte vertical de la insignia al suelo
      const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, badgeElev - this.getElev(badgeX, badgeZ, 0), 4);
      const poleMat = new THREE.MeshBasicMaterial({ color: z.color });
      const poleMesh = new THREE.Mesh(poleGeo, poleMat);
      poleMesh.position.set(badgeX, (badgeElev + this.getElev(badgeX, badgeZ, 0)) / 2, badgeZ);
      this.zonesGroup.add(poleMesh);
    });
  }

  createZoneBadge(zone) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 84;
    const ctx = canvas.getContext('2d');

    // Panel de fondo
    ctx.fillStyle = 'rgba(10, 20, 14, 0.94)';
    ctx.roundRect(4, 4, 248, 76, 14);
    ctx.fill();
    ctx.strokeStyle = zone.color;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Símbolo e ID
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(zone.symbol, 16, 44);

    ctx.fillStyle = zone.color;
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillText(zone.id, 56, 32);

    // Nombre Corto
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    const shortTitle = zone.name.split(':')[1] ? zone.name.split(':')[1].trim() : zone.name;
    ctx.fillText(shortTitle.substring(0, 24), 56, 58);

    const texture = new THREE.CanvasTexture(canvas);
    const planeGeo = new THREE.PlaneGeometry(3.6, 1.2);
    const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(planeGeo, planeMat);

    return mesh;
  }

  initKeylineSystem3D() {
    // 1. Keypoints (Puntos Clave de Yeomans en la pendiente)
    this.keypoints = [
      { name: 'Punto Clave Norte (Keypoint A)', x: 12, z: -10, elevLabel: '184 msnm' },
      { name: 'Punto Clave Central (Keypoint B)', x: -2, z: 2, elevLabel: '188 msnm' },
      { name: 'Punto Clave Sur (Keypoint C)', x: 22, z: 12, elevLabel: '180 msnm' }
    ];

    const keypointMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      metalness: 0.2,
      roughness: 0.25,
      emissive: new THREE.Color('#0369a1'),
      emissiveIntensity: 0.04
    });
    this.keypointMeshes = [];

    this.keypoints.forEach(kp => {
      const terrainY = this.getElev(kp.x, kp.z, 0);
      const pinY = terrainY + 1.8;

      const pinGroup = new THREE.Group();
      pinGroup.position.set(kp.x, pinY, kp.z);

      // Diamante Octaedro 3D
      const markerGeo = new THREE.OctahedronGeometry(0.65, 0);
      const markerMesh = new THREE.Mesh(markerGeo, keypointMat);
      pinGroup.add(markerMesh);

      // Poste al suelo
      const stemGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 6);
      const stemMat = new THREE.MeshBasicMaterial({ color: '#0284c7' });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = -0.9;
      pinGroup.add(stemMesh);

      this.keylineGroup.add(pinGroup);
      this.keypointMeshes.push(pinGroup);
    });

    // 2. Surcos de Subsolado Keyline (Infiltración de Yeomans al 1% que llevan agua de vaguadas a lomas)
    this.subsoilingLines = [];
    const curveOffsets = [-22, -15, -8, 0, 8, 15, 22];

    curveOffsets.forEach((offset, idx) => {
      const points = [];
      const steps = 36;

      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * 64 - 32; // x from -32 to 32
        const z = offset + Math.sin(t * 0.08) * 4.5 + (t * t * 0.003);
        // Muestrear elevación real del suelo 3D para que el surco repose exactamente sobre la superficie
        const y = this.getElev(t, z, 0.22);
        points.push(new THREE.Vector3(t, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.11, 6, false);
      const isMaster = (idx === 3);
      // Material de flujo de agua dulce realista (sin resplandor neón sci-fi)
      const tubeMat = new THREE.MeshStandardMaterial({
        color: isMaster ? '#0284c7' : '#0369a1',
        roughness: 0.08,
        metalness: 0.05,
        transparent: true,
        opacity: isMaster ? 0.80 : 0.65,
        emissive: new THREE.Color('#075985'),
        emissiveIntensity: 0.03
      });

      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      this.keylineGroup.add(tubeMesh);
      this.subsoilingLines.push(tubeMesh);
    });

    // 3. Canal Gravitacional hacia el Tranque Keyline (18.500 m³) - Flujo de agua natural
    const feederPoints = [
      new THREE.Vector3(-2, this.getElev(-2, 2, 0.26), 2),
      new THREE.Vector3(12, this.getElev(12, -10, 0.26), -10),
      new THREE.Vector3(22, this.getElev(22, -16, 0.26), -16),
      new THREE.Vector3(this.pondX, this.getElev(this.pondX, this.pondZ, 0.26), this.pondZ)
    ];
    this.feederCurve = new THREE.CatmullRomCurve3(feederPoints);
    const feederGeo = new THREE.TubeGeometry(this.feederCurve, 40, 0.18, 8, false);
    const feederMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.06,
      metalness: 0.05,
      transparent: true,
      opacity: 0.82,
      emissive: new THREE.Color('#0369a1'),
      emissiveIntensity: 0.03
    });
    const feederMesh = new THREE.Mesh(feederGeo, feederMat);
    this.keylineGroup.add(feederMesh);

    // 4. Ondulaciones de Agua / Espuma Natural en Flujo Continuo hacia el Tranque
    this.particleCount = 22;
    this.particles = [];
    const dropGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const dropMat = new THREE.MeshStandardMaterial({
      color: '#e0f2fe',
      roughness: 0.1,
      metalness: 0.02,
      transparent: true,
      opacity: 0.50,
      emissive: new THREE.Color('#38bdf8'),
      emissiveIntensity: 0.02
    });

    for (let i = 0; i < this.particleCount; i++) {
      const drop = new THREE.Mesh(dropGeo, dropMat);
      drop.userData = { progress: i / this.particleCount };
      this.keylineGroup.add(drop);
      this.particles.push(drop);
    }
  }

  updateAnimations(time) {
    // Orientación de insignias hacia la cámara (Billboarding)
    if (this.showZones) {
      this.zoneBadges.forEach(b => {
        if (this.mapManager && this.mapManager.camera) {
          b.quaternion.copy(this.mapManager.camera.quaternion);
        }
      });
    }

    // Animación de partículas de agua Keyline
    if (this.showKeyline && this.feederCurve) {
      this.particles.forEach(p => {
        p.userData.progress = (p.userData.progress + 0.006) % 1.0;
        const pos = this.feederCurve.getPointAt(p.userData.progress);
        p.position.set(pos.x, pos.y + 0.16, pos.z);
      });

      // Rotación de diamantes de los Keypoints
      this.keypointMeshes.forEach((kp, idx) => {
        kp.rotation.y = time * 0.002 + idx;
      });
    }
  }

  toggleZones(visible) {
    this.showZones = visible;
    this.zonesGroup.visible = visible;
  }

  toggleKeyline(visible) {
    this.showKeyline = visible;
    this.keylineGroup.visible = visible;
  }
}
