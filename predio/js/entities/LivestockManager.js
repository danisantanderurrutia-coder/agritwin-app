/**
 * AgriTwin - LivestockManager Module
 * 
 * Implements:
 *  - Pastoreo Racional Voisin (PRV) con 8 Potreros Subdivididos (P1 a P8)
 *  - Ubicaciones georreferenciadas requeridas por el usuario:
 *      * Vacas en la esquina Sur-Oeste (x: -34, z: 36)
 *      * Ovejas en el Centro-Oeste (x: -29, z: 4)
 *      * Gallinas y Egg Mobile al Nor-Este del predio (x: 6, z: -2), despejadas de los paneles solares
 *      * Abrevadero móvil acorde a la red hidráulica (x: -22, z: 18)
 *      * Caballos chilenos sueltos y libres en la pradera (x: 16 a 24, z: 20 a 28)
 *  - Animales interactivos: clic abre su ficha técnica con edición en vivo (Nombre, Caravana, Peso, Raza, Salud, Notas)
 *  - Herramienta de Reubicación 3D en Terreno (clic para mover a cualquier punto adaptado a cota DEM)
 *  - Animación procedural de pastoreo (cabeceo, colas, picoteo)
 */

import { bus } from '../utils/EventBus.js';
import { AnimalMeshFactory } from './factories/AnimalMeshFactory.js';

export class LivestockManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.scene = mapManager.scene;
    this.group = new THREE.Group();
    this.group.name = 'livestockGroup';
    this.scene.add(this.group);

    this.visible = true;
    this.paddockMeshes = [];
    this.gltfLoader = (typeof THREE.GLTFLoader !== 'undefined') ? new THREE.GLTFLoader() : null;

    // Grupos 3D por especie
    this.cowsGroup = new THREE.Group();
    this.sheepGroup = new THREE.Group();
    this.coopGroup = new THREE.Group();
    this.horsesGroup = new THREE.Group();
    this.waterTroughGroup = new THREE.Group();

    this.group.add(this.cowsGroup);
    this.group.add(this.sheepGroup);
    this.group.add(this.coopGroup);
    this.group.add(this.horsesGroup);
    this.group.add(this.waterTroughGroup);

    // Estado interactivo de reubicación
    this.relocatingAnimalId = null;
    this.placementRing = null;

    // Estado Inicial PRV
    this.activePaddockId = 'P3';
    this.coopPaddockId = 'P8';

    // 8 Potreros PRV distribuidos estratégicamente (Modelo forrajero inicial)
    this.paddocks = [
      { id: 'P1', name: 'Potrero 1 - Trébol Blanco & Festuca', x: -34, z: 28, w: 7, d: 7, restDays: 44, forrajeCm: 24, kgMsHa: 2850, status: 'ready', is_simulated: true, simulation_basis: 'Aforo modelado Voisin' },
      { id: 'P2', name: 'Potrero 2 - Alfalfa & Raygrass Perenne', x: -26, z: 28, w: 7, d: 7, restDays: 41, forrajeCm: 22, kgMsHa: 2600, status: 'ready', is_simulated: true, simulation_basis: 'Aforo modelado Voisin' },
      { id: 'P3', name: 'Potrero 3 - Pastura Sur-Oeste (Vacas Activo)', x: -34, z: 36, w: 7.5, d: 7.5, restDays: 1, forrajeCm: 25, kgMsHa: 3100, status: 'active', is_simulated: true, simulation_basis: 'Aforo modelado Voisin' },
      { id: 'P4', name: 'Potrero 4 - Silvopastoreo Borde Cerezos', x: -26, z: 36, w: 7, d: 7, restDays: 32, forrajeCm: 18, kgMsHa: 1950, status: 'resting', is_simulated: true, simulation_basis: 'Aforo modelado Voisin' },
      { id: 'P5', name: 'Potrero 5 - Trébol Subterráneo & Dáctilo (Ovejas)', x: -29, z: 4, w: 8, d: 7, restDays: 24, forrajeCm: 16, kgMsHa: 1750, status: 'resting', is_simulated: true, simulation_basis: 'Aforo modelado Voisin' },
      { id: 'P6', name: 'Potrero 6 - Pradera Regenerativa Este', x: 16, z: 9, w: 6.5, d: 6.5, restDays: 16, forrajeCm: 12, kgMsHa: 1250, status: 'resting', is_simulated: true, simulation_basis: 'Aforo modelado Voisin' },
      { id: 'P7', name: 'Potrero 7 - Franja de Infiltración Sur', x: 18, z: 24, w: 8, d: 6.5, restDays: 8, forrajeCm: 10, kgMsHa: 950, status: 'resting', is_simulated: true, simulation_basis: 'Aforo modelado Voisin' },
      { id: 'P8', name: 'Potrero 8 - Cuadro Nor-Este (Egg Mobile)', x: 6, z: -2, w: 8, d: 6, restDays: 4, forrajeCm: 8, kgMsHa: 750, status: 'coop', is_simulated: true, simulation_basis: 'Aforo modelado Voisin' }
    ];

    // Registro maestro de animales individuales
    this.animals = new Map();

    this.initPaddocks3D();
    this.initPlacementMarker();
    this.createCows3D();
    this.createSheep3D();
    this.createHorses3D();
    this.createEggMobile3D();
    this.createWaterTrough3D();
    this.createHerdFloatingBadges();

    // Eventos
    bus.on('prv:move_herd', (paddockId) => this.moveToPaddock(paddockId));
    bus.on('prv:move_coop', (paddockId) => this.positionCoopInPaddock(paddockId));
    bus.on('layer:livestock', (visible) => this.toggleVisibility(visible));

    this.mapManager.addAnimated(this.group, (time) => this.updateAnimations(time));
    this.setupMapPlacementListener();
  }

  getElev(x, z, offset = 0.05) {
    if (this.mapManager && typeof this.mapManager.getTerrainElevation === 'function') {
      return this.mapManager.getTerrainElevation(x, z) + offset;
    }
    return 0.46 + offset;
  }

  initPlacementMarker() {
    const geo = new THREE.RingGeometry(0.8, 1.1, 32);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    this.placementRing = new THREE.Mesh(geo, mat);
    this.placementRing.visible = false;
    this.scene.add(this.placementRing);
  }

  initPaddocks3D() {
    this.paddocks.forEach(p => {
      const padGroup = new THREE.Group();
      const pElev = this.getElev(p.x, p.z, 0.12);
      padGroup.position.set(p.x, pElev, p.z);

      // Suelo tintado según estado forrajero
      const geo = new THREE.PlaneGeometry(p.w - 0.4, p.d - 0.4);
      geo.rotateX(-Math.PI / 2);

      let color = '#15803d'; // Verde listo
      let opacity = 0.42;

      if (p.status === 'active') {
        color = '#f59e0b'; // Ámbar activo
        opacity = 0.65;
      } else if (p.status === 'coop') {
        color = '#38bdf8'; // Azul gallinero
        opacity = 0.45;
      } else if (p.restDays < 15) {
        color = '#84cc16'; // Verde claro rebrote
        opacity = 0.35;
      } else {
        color = '#22c55e'; // Listo para comer
        opacity = 0.45;
      }

      const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.8,
        metalness: 0.05,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide
      });

      const groundMesh = new THREE.Mesh(geo, mat);
      groundMesh.receiveShadow = true;
      padGroup.add(groundMesh);

      // Cerco Eléctrico Perimetral con postes de madera
      const fenceGroup = this.createElectricFence(p.w, p.d);
      padGroup.add(fenceGroup);

      // Insignia Flotante con ID de Potrero y Altura de Pasto
      const badge = this.createPaddockBadge(p);
      badge.position.set(0, 2.4, 0);
      padGroup.add(badge);

      const entityData = {
        type: 'paddock_prv',
        id: `paddock_${p.id}`,
        name: p.name,
        paddockId: p.id,
        restDays: p.restDays,
        forrajeCm: p.forrajeCm,
        kgMsHa: p.kgMsHa,
        status: p.status,
        areaM2: Math.round(p.w * p.d * 100)
      };

      groundMesh.userData = entityData;
      this.mapManager.addPickable(groundMesh, entityData);

      p.mesh = padGroup;
      p.groundMesh = groundMesh;
      p.badge = badge;
      p.mat = mat;
      this.group.add(padGroup);
      this.paddockMeshes.push(padGroup);
    });
  }

  createElectricFence(width, depth) {
    const fenceGroup = new THREE.Group();
    const halfW = width / 2;
    const halfD = depth / 2;

    const corners = [
      new THREE.Vector3(-halfW, 0, -halfD),
      new THREE.Vector3(halfW, 0, -halfD),
      new THREE.Vector3(halfW, 0, halfD),
      new THREE.Vector3(-halfW, 0, halfD)
    ];

    const postGeo = new THREE.CylinderGeometry(0.08, 0.09, 1.2, 6);
    const postMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });

    corners.forEach(pos => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(pos.x, 0.6, pos.z);
      post.castShadow = true;
      fenceGroup.add(post);
    });

    const wirePoints = [
      new THREE.Vector3(-halfW, 0.85, -halfD),
      new THREE.Vector3(halfW, 0.85, -halfD),
      new THREE.Vector3(halfW, 0.85, halfD),
      new THREE.Vector3(-halfW, 0.85, halfD),
      new THREE.Vector3(-halfW, 0.85, -halfD)
    ];

    const wireGeo = new THREE.BufferGeometry().setFromPoints(wirePoints);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xfef08a,
      linewidth: 3,
      transparent: true,
      opacity: 0.85
    });
    const wireLine = new THREE.Line(wireGeo, wireMat);
    fenceGroup.add(wireLine);

    return fenceGroup;
  }

  createPaddockBadge(paddock) {
    const group = new THREE.Group();
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = paddock.status === 'active' ? '#b45309' : (paddock.restDays >= 35 ? '#15803d' : '#1e293b');
    ctx.roundRect(4, 4, 120, 56, 12);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(paddock.id, 64, 28);

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = paddock.status === 'active' ? '#fde047' : '#86efac';
    ctx.fillText(`${paddock.restDays}d • ${paddock.forrajeCm}cm`, 64, 48);

    const texture = new THREE.CanvasTexture(canvas);
    const planeGeo = new THREE.PlaneGeometry(1.8, 0.9);
    const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(planeGeo, planeMat);

    group.add(mesh);
    group.userData = { texture, canvas, ctx };
    return group;
  }

  createHerdFloatingBadges() {
    // Insignia Vacas Sur-Oeste
    this.badgeCows = this.buildFloatingBanner('🐄 Rebaño Bovino Sur-Oeste (P3)', '6 Bovinos Clavel & Angus', '#fde047', 'rgba(120, 53, 15, 0.92)');
    this.badgeCows.position.set(-34, this.getElev(-34, 36, 4.3), 36);
    this.group.add(this.badgeCows);

    // Insignia Ovejas Centro-Oeste
    this.badgeSheep = this.buildFloatingBanner('🐑 Rebaño Ovino Centro-Oeste (P5)', '5 Ovinos Suffolk Down', '#86efac', 'rgba(21, 128, 61, 0.92)');
    this.badgeSheep.position.set(-29, this.getElev(-29, 4, 3.8), 4);
    this.group.add(this.badgeSheep);

    // Insignia Caballos Libres
    this.badgeHorses = this.buildFloatingBanner('🐎 Caballos Chilenos Sueltos', '4 Equinos en Pradera Abierta', '#fed7aa', 'rgba(154, 52, 18, 0.92)');
    this.badgeHorses.position.set(20, this.getElev(20, 24, 4.2), 24);
    this.group.add(this.badgeHorses);

    // Insignia Egg Mobile Nor-Este
    this.badgeCoop = this.buildFloatingBanner('🐓 Gallinero Móvil Nor-Este (P8)', '60 Ponedoras Sanitizadoras', '#7dd3fc', 'rgba(3, 105, 161, 0.92)');
    this.badgeCoop.position.set(6, this.getElev(6, -2, 3.8), -2);
    this.group.add(this.badgeCoop);
  }

  buildFloatingBanner(title, subtitle, accentColor, bgColor) {
    const group = new THREE.Group();
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 70;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.roundRect(4, 4, 248, 62, 14);
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(title, 14, 28);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(subtitle, 14, 48);

    const texture = new THREE.CanvasTexture(canvas);
    const planeGeo = new THREE.PlaneGeometry(3.6, 1.0);
    const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    group.add(mesh);
    return group;
  }

  // ─── 1. Vacas en la esquina Sur-Oeste ──────────────────────────────────────────
  createCows3D() {
    this.cows = [];
    const cowDefs = [
      {
        id: 'cow_1', name: 'Clavelina', tag: 'CLAV-01', breed: 'Clavel Alemán (Overo Colorado)', weight: 540, health: 'Excelente',
        ageMonths: 34, birthDate: '14/08/2023', dailyGainKg: '+0.85 kg/d', waterLDay: 48, dryMatterKgDay: 15.6, freshForageKgDay: 52.0,
        bodyCondition: '3.5 / 5.0 (Óptima PRV)', rumenTempC: 38.6, ruminationMinDay: 510, diioSag: 'CL-07-28491-01',
        reproductiveStatus: 'Gestante (Tercio Medio - 5 meses)', category: 'Vaca de Pastoreo PRV',
        x: -35.2, z: 34.5,
        vaccines: [
          { name: 'Clostridial 8 Vías (Covexin 8)', date: '15/04/2026', dose: '5 ml SC', lot: 'CVX-8921', booster: '15/10/2026', vet: 'Dra. Javiera Montecinos (SAG #8472)' },
          { name: 'Carbunclo Bacteridiano (Cepa Sterne)', date: '10/01/2026', dose: '2 ml SC', lot: 'CRB-4410', booster: '10/01/2027', vet: 'Dra. Javiera Montecinos' },
          { name: 'Complejo Reproductivo IBR/BVD/Lepto', date: '05/11/2025', dose: '5 ml IM', lot: 'REP-2099', booster: '05/11/2026', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Desparasitación Interna (Ivermectina 1% L.A.)', date: '02/05/2026', withdrawalDays: '28 días (Cumplido)', vet: 'Dra. Javiera Montecinos', status: 'Alta Clínica', notes: 'Control coprológico negativo post-rotación' },
          { procedure: 'Despalme Funcional & Pediluvio Cobre', date: '20/03/2026', withdrawalDays: '0 días', vet: 'Don Silvestre (Podólogo)', status: 'Completado', notes: 'Aplomos nivelados y muralla córnea sana' },
          { procedure: 'Ecografía Diagnóstica de Gestación', date: '12/02/2026', withdrawalDays: '0 días', vet: 'Dra. Javiera Montecinos', status: 'Confirmado', notes: 'Desarrollo embrionario óptimo sin signos inflamatorios' }
        ]
      },
      {
        id: 'cow_2', name: 'Margarita', tag: 'OV-02', breed: 'Overo Negro Holando', weight: 515, health: 'Excelente',
        ageMonths: 42, birthDate: '10/12/2022', dailyGainKg: '+0.78 kg/d', waterLDay: 52, dryMatterKgDay: 14.8, freshForageKgDay: 49.3,
        bodyCondition: '3.25 / 5.0 (Producción A2A2)', rumenTempC: 38.5, ruminationMinDay: 495, diioSag: 'CL-07-28491-02',
        reproductiveStatus: 'Vaca en Ordeña (22 L/día)', category: 'Lechera Pastoreo Directo',
        x: -33.4, z: 36.8,
        vaccines: [
          { name: 'Clostridial 8 Vías (Covexin 8)', date: '15/04/2026', dose: '5 ml SC', lot: 'CVX-8921', booster: '15/10/2026', vet: 'Dra. Javiera Montecinos (SAG #8472)' },
          { name: 'Carbunclo Bacteridiano', date: '10/01/2026', dose: '2 ml SC', lot: 'CRB-4410', booster: '10/01/2027', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Test California Mastitis (CMT Negativo)', date: '18/05/2026', withdrawalDays: '0 días', vet: 'Dra. Javiera Montecinos', status: 'Óptimo', notes: 'Células somáticas <100.000 CS/ml' },
          { procedure: 'Desparasitación Selectiva Natural', date: '10/04/2026', withdrawalDays: '0 días', vet: 'Don Gastón Fuenzalida', status: 'Completado', notes: 'Fitoterapia ajo + extracto de taninos' }
        ]
      },
      {
        id: 'cow_3', name: 'Tizón', tag: 'ANG-03', breed: 'Aberdeen Angus Negro (Toro)', weight: 580, health: 'Excelente',
        ageMonths: 48, birthDate: '20/06/2022', dailyGainKg: '+1.10 kg/d', waterLDay: 65, dryMatterKgDay: 17.4, freshForageKgDay: 58.0,
        bodyCondition: '4.0 / 5.0 (Excelente masa)', rumenTempC: 38.7, ruminationMinDay: 530, diioSag: 'CL-07-28491-03',
        reproductiveStatus: 'Padrillo Activo (Monta Natural)', category: 'Toro Reproductor',
        x: -36.8, z: 37.2,
        vaccines: [
          { name: 'Clostridial 8 Vías (Covexin 8)', date: '15/04/2026', dose: '5 ml SC', lot: 'CVX-8921', booster: '15/10/2026', vet: 'Dra. Javiera Montecinos' },
          { name: 'Campylobacteriosis & Trichomoniasis', date: '01/09/2025', dose: '5 ml SC', lot: 'TRIC-902', booster: '01/09/2026', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Examen Andrológico y Espermograma', date: '25/08/2025', withdrawalDays: '0 días', vet: 'Dra. Javiera Montecinos', status: 'Apto Muy Bueno', notes: 'Motilidad masal >85%, vigor excelente' }
        ]
      },
      {
        id: 'cow_4', name: 'Estrella', tag: 'CLAV-04', breed: 'Clavel Alemán', weight: 495, health: 'Excelente',
        ageMonths: 28, birthDate: '05/02/2024', dailyGainKg: '+0.92 kg/d', waterLDay: 44, dryMatterKgDay: 14.2, freshForageKgDay: 47.3,
        bodyCondition: '3.5 / 5.0 (Óptima)', rumenTempC: 38.6, ruminationMinDay: 480, diioSag: 'CL-07-28491-04',
        reproductiveStatus: 'Vaquilla Gestante (3 meses)', category: 'Vaquilla de Reemplazo',
        x: -32.5, z: 33.6,
        vaccines: [
          { name: 'Clostridial 8 Vías (Covexin 8)', date: '15/04/2026', dose: '5 ml SC', lot: 'CVX-8921', booster: '15/10/2026', vet: 'Dra. Javiera Montecinos' },
          { name: 'Carbunclo Bacteridiano', date: '10/01/2026', dose: '2 ml SC', lot: 'CRB-4410', booster: '10/01/2027', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Control de Crecimiento & Aplomos', date: '14/03/2026', withdrawalDays: '0 días', vet: 'Dra. Javiera Montecinos', status: 'Completado', notes: 'Desarrollo óseo y pélvico excelente' }
        ]
      },
      {
        id: 'cow_5', name: 'Canelo', tag: 'ANG-05', breed: 'Angus Colorado', weight: 560, health: 'Excelente',
        ageMonths: 38, birthDate: '18/04/2023', dailyGainKg: '+0.88 kg/d', waterLDay: 50, dryMatterKgDay: 16.0, freshForageKgDay: 53.3,
        bodyCondition: '3.75 / 5.0', rumenTempC: 38.6, ruminationMinDay: 515, diioSag: 'CL-07-28491-05',
        reproductiveStatus: 'Gestante (Último Tercio - 7 meses)', category: 'Vaca de Cría PRV',
        x: -31.8, z: 38.2,
        vaccines: [
          { name: 'Clostridial 8 Vías (Covexin 8)', date: '15/04/2026', dose: '5 ml SC', lot: 'CVX-8921', booster: '15/10/2026', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Monitoreo Pre-parto y Calostro', date: '12/05/2026', withdrawalDays: '0 días', vet: 'Dra. Javiera Montecinos', status: 'Normal', notes: 'Glándula mamaria en preparación fisiológica' }
        ]
      },
      {
        id: 'cow_6', name: 'Blanquita', tag: 'HOL-06', breed: 'Overo Holando Lechera', weight: 530, health: 'Excelente',
        ageMonths: 36, birthDate: '22/05/2023', dailyGainKg: '+0.80 kg/d', waterLDay: 54, dryMatterKgDay: 15.0, freshForageKgDay: 50.0,
        bodyCondition: '3.25 / 5.0', rumenTempC: 38.5, ruminationMinDay: 505, diioSag: 'CL-07-28491-06',
        reproductiveStatus: 'Vaca en Ordeña (19 L/día)', category: 'Lechera Pastoreo Directo',
        x: -34.8, z: 39.4,
        vaccines: [
          { name: 'Clostridial 8 Vías (Covexin 8)', date: '15/04/2026', dose: '5 ml SC', lot: 'CVX-8921', booster: '15/10/2026', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Sellado de Pezones & Pediluvio', date: '01/05/2026', withdrawalDays: '0 días', vet: 'Don Gastón Fuenzalida', status: 'Excelente', notes: 'Piel de pezones flexible, sin hiperqueratosis' }
        ]
      }
    ];

    if (this.gltfLoader) {
      this.gltfLoader.load(
        'assets/models/Cow.glb',
        (gltf) => {
          const baseCowScene = gltf.scene;

          cowDefs.forEach((def, i) => {
            const cowMesh = baseCowScene.clone(true);
            const elev = this.getElev(def.x, def.z, 0.05);
            cowMesh.position.set(def.x, elev, def.z);
            cowMesh.scale.set(0.011, 0.011, 0.011);
            cowMesh.rotation.y = (i * 1.1) + 0.3;

            cowMesh.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                  child.material = child.material.clone();
                  if (def.breed.includes('Colorado') || def.breed.includes('Clavel')) {
                    child.material.color = new THREE.Color('#92400e');
                  }
                  child.material.roughness = 0.7;
                  child.material.metalness = 0.05;
                }
              }
            });

            const animalData = {
              id: def.id,
              name: def.name,
              tag: def.tag,
              type: 'livestock_animal',
              animalType: 'cow',
              icon: '🐄',
              species: 'Bovino (Modelo 3D GLB)',
              breed: def.breed,
              category: def.category || 'Vaca de Pastoreo PRV',
              weightKg: def.weight,
              dailyGainKg: def.dailyGainKg || '+0.85 kg/d',
              ageMonths: def.ageMonths || 36,
              birthDate: def.birthDate || '2023-04-10',
              waterLDay: def.waterLDay || 48,
              dryMatterKgDay: def.dryMatterKgDay || 15.2,
              freshForageKgDay: def.freshForageKgDay || 50.0,
              bodyCondition: def.bodyCondition || '3.5 / 5.0 (Óptima PRV)',
              diioSag: def.diioSag || `CL-07-28491-0${i+1}`,
              rumenTempC: def.rumenTempC || 38.6,
              ruminationMinDay: def.ruminationMinDay || 500,
              reproductiveStatus: def.reproductiveStatus || 'Activo',
              vaccines: def.vaccines ? [...def.vaccines] : [],
              medicalProcedures: def.medicalProcedures ? [...def.medicalProcedures] : [],
              health: def.health,
              paddockId: 'P3',
              locationSector: 'Esquina Sur-Oeste (PRV)',
              x: def.x,
              z: def.z,
              y: elev,
              notes: def.notes || 'Alimentación 100% pastizal polifítico. Cero antibióticos ni granos concentrados.',
              mesh: cowMesh
            };

            this.animals.set(def.id, animalData);
            cowMesh.userData = animalData;
            cowMesh.userData.animOffset = i * 1.3;
            this.cowsGroup.add(cowMesh);
            this.cows.push(cowMesh);

            cowMesh.traverse((child) => {
              if (child.isMesh) {
                this.mapManager.addPickable(child, animalData);
              }
            });
          });
          console.log('🐄 GLTF Cows (Cow.glb) cargadas con éxito en el Potrero P3');
        },
        undefined,
        (err) => {
          console.warn('⚠️ Could not load Cow.glb, using procedural cows:', err);
          this._spawnProceduralCows(cowDefs);
        }
      );
    } else {
      this._spawnProceduralCows(cowDefs);
    }
  }

  _spawnProceduralCows(cowDefs) {
    cowDefs.forEach((def, i) => {
      const cowMesh = this.buildCowMesh(i, def.breed.includes('Colorado'));
      const elev = this.getElev(def.x, def.z, 0.05);
      cowMesh.position.set(def.x, elev, def.z);
      cowMesh.rotation.y = (i * 1.1) + 0.3;
      this.cowsGroup.add(cowMesh);
      this.cows.push(cowMesh);

      const animalData = {
        id: def.id,
        name: def.name,
        tag: def.tag,
        type: 'livestock_animal',
        animalType: 'cow',
        icon: '🐄',
        species: 'Bovino',
        breed: def.breed,
        category: def.category || 'Vaca de Pastoreo PRV',
        weightKg: def.weight,
        dailyGainKg: def.dailyGainKg || '+0.85 kg/d',
        ageMonths: def.ageMonths || 36,
        birthDate: def.birthDate || '2023-04-10',
        waterLDay: def.waterLDay || 48,
        dryMatterKgDay: def.dryMatterKgDay || 15.2,
        freshForageKgDay: def.freshForageKgDay || 50.0,
        bodyCondition: def.bodyCondition || '3.5 / 5.0 (Óptima PRV)',
        diioSag: def.diioSag || `CL-07-28491-0${i+1}`,
        rumenTempC: def.rumenTempC || 38.6,
        ruminationMinDay: def.ruminationMinDay || 500,
        reproductiveStatus: def.reproductiveStatus || 'Activo',
        vaccines: def.vaccines ? [...def.vaccines] : [],
        medicalProcedures: def.medicalProcedures ? [...def.medicalProcedures] : [],
        health: def.health,
        paddockId: 'P3',
        locationSector: 'Esquina Sur-Oeste',
        x: def.x,
        z: def.z,
        y: elev,
        notes: def.notes || 'Alimentación 100% pastizal polifítico.',
        mesh: cowMesh
      };

      this.animals.set(def.id, animalData);
      cowMesh.userData = animalData;
      this.mapManager.addPickable(cowMesh.children[0] || cowMesh, animalData);
    });
  }

  buildCowMesh(index, isBrown = false) {
    return AnimalMeshFactory.buildCowMesh(index, isBrown);
  }

  // ─── 2. Ovejas en el Centro-Oeste ─────────────────────────────────────────────
  createSheep3D() {
    this.sheep = [];
    const sheepDefs = [
      {
        id: 'sheep_1', name: 'Copito', tag: 'SUF-01', breed: 'Suffolk Down', weight: 78, health: 'Excelente',
        ageMonths: 24, birthDate: '15/05/2024', dailyGainKg: '+0.18 kg/d', waterLDay: 7.2, dryMatterKgDay: 2.5, freshForageKgDay: 8.3,
        bodyCondition: '3.5 / 5.0 (Excelente vellón)', diioSag: 'CL-07-28491-OV1', category: 'Oveja de Lana & Pastoreo',
        x: -30.5, z: 2.8,
        vaccines: [
          { name: 'Clostridial 8 Vías Ovina (Covexin)', date: '12/03/2026', dose: '2 ml SC', lot: 'OV-7721', booster: '12/03/2027', vet: 'Dra. Javiera Montecinos (SAG)' },
          { name: 'Ectima Contagioso (Scabivax)', date: '05/10/2025', dose: 'Escarificación', lot: 'SCB-109', booster: 'Anual', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Desparasitación Oral (Fenbendazol 10%)', date: '15/04/2026', withdrawalDays: '14 días (Cumplido)', vet: 'Dra. Javiera Montecinos', status: 'Completado', notes: 'Control nematodos nematodirus y trichostrongylus' },
          { procedure: 'Esquila Sanitaria de Cuartos Traseros', date: '28/08/2025', withdrawalDays: '0 días', vet: 'Don Silvestre Gómez', status: 'Excelente', notes: 'Prevención miasis pre-encaste' }
        ]
      },
      {
        id: 'sheep_2', name: 'Lana', tag: 'SUF-02', breed: 'Suffolk Down', weight: 82, health: 'Excelente',
        ageMonths: 28, birthDate: '20/01/2024', dailyGainKg: '+0.16 kg/d', waterLDay: 7.5, dryMatterKgDay: 2.6, freshForageKgDay: 8.6,
        bodyCondition: '3.75 / 5.0 (Gestante)', diioSag: 'CL-07-28491-OV2', category: 'Oveja Madre',
        x: -28.2, z: 4.6,
        vaccines: [
          { name: 'Clostridial 8 Vías Ovina', date: '12/03/2026', dose: '2 ml SC', lot: 'OV-7721', booster: '12/03/2027', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Baño de Patas con Sulfato de Zinc (Pediluvio)', date: '10/02/2026', withdrawalDays: '0 días', vet: 'Don Gastón Fuenzalida', status: 'Alta', notes: 'Cascos limpios y secos' }
        ]
      },
      {
        id: 'sheep_3', name: 'Sombra', tag: 'SUF-03', breed: 'Suffolk Cara Negra', weight: 74, health: 'Excelente',
        ageMonths: 20, birthDate: '10/09/2024', dailyGainKg: '+0.19 kg/d', waterLDay: 6.8, dryMatterKgDay: 2.3, freshForageKgDay: 7.8,
        bodyCondition: '3.5 / 5.0', diioSag: 'CL-07-28491-OV3', category: 'Borrega Reposición',
        x: -31.6, z: 5.2,
        vaccines: [
          { name: 'Clostridial 8 Vías Ovina', date: '12/03/2026', dose: '2 ml SC', lot: 'OV-7721', booster: '12/03/2027', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Revisión Dental & Condición Corporal', date: '05/04/2026', withdrawalDays: '0 días', vet: 'Dra. Javiera Montecinos', status: 'Normal', notes: 'Dentición de leche completa y en erupción pinzas' }
        ]
      },
      {
        id: 'sheep_4', name: 'Trébol', tag: 'SUF-04', breed: 'Suffolk Down', weight: 80, health: 'Excelente',
        ageMonths: 26, birthDate: '02/03/2024', dailyGainKg: '+0.17 kg/d', waterLDay: 7.0, dryMatterKgDay: 2.5, freshForageKgDay: 8.2,
        bodyCondition: '3.5 / 5.0', diioSag: 'CL-07-28491-OV4', category: 'Oveja de Pastoreo',
        x: -27.5, z: 2.2,
        vaccines: [
          { name: 'Clostridial 8 Vías Ovina', date: '12/03/2026', dose: '2 ml SC', lot: 'OV-7721', booster: '12/03/2027', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Tratamiento Tópico Podal Preventivo', date: '15/01/2026', withdrawalDays: '0 días', vet: 'Don Silvestre', status: 'Completado', notes: 'Sin presencia de pietín' }
        ]
      },
      {
        id: 'sheep_5', name: 'Nube', tag: 'SUF-05', breed: 'Suffolk Down', weight: 76, health: 'Excelente',
        ageMonths: 22, birthDate: '18/07/2024', dailyGainKg: '+0.18 kg/d', waterLDay: 6.9, dryMatterKgDay: 2.4, freshForageKgDay: 8.0,
        bodyCondition: '3.5 / 5.0', diioSag: 'CL-07-28491-OV5', category: 'Borrega Joven',
        x: -29.8, z: 6.4,
        vaccines: [
          { name: 'Clostridial 8 Vías Ovina', date: '12/03/2026', dose: '2 ml SC', lot: 'OV-7721', booster: '12/03/2027', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Pesaje & Chequeo FAMACHA (Score 1)', date: '20/04/2026', withdrawalDays: '0 días', vet: 'Dra. Javiera Montecinos', status: 'Óptimo', notes: 'Mucosa ocular rosada intensa, sin anemia' }
        ]
      }
    ];

    if (this.gltfLoader) {
      this.gltfLoader.load(
        'assets/models/Sheep.glb',
        (gltf) => {
          const baseSheepScene = gltf.scene;

          sheepDefs.forEach((def, i) => {
            const sMesh = baseSheepScene.clone(true);
            const elev = this.getElev(def.x, def.z, 0.05);
            sMesh.position.set(def.x, elev, def.z);
            sMesh.scale.set(0.18, 0.18, 0.18);
            sMesh.rotation.y = (i * 1.4) + 0.8;

            sMesh.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                  child.material = child.material.clone();
                  child.material.roughness = 0.85;
                }
              }
            });

            const animalData = {
              id: def.id,
              name: def.name,
              tag: def.tag,
              type: 'livestock_animal',
              animalType: 'sheep',
              icon: '🐑',
              species: 'Ovino (Modelo 3D GLB)',
              breed: def.breed,
              category: def.category || 'Oveja de Lana & Pastoreo',
              weightKg: def.weight,
              dailyGainKg: def.dailyGainKg || '+0.18 kg/d',
              ageMonths: def.ageMonths || 24,
              birthDate: def.birthDate || '15/05/2024',
              waterLDay: def.waterLDay || 7.0,
              dryMatterKgDay: def.dryMatterKgDay || 2.5,
              freshForageKgDay: def.freshForageKgDay || 8.0,
              bodyCondition: def.bodyCondition || '3.5 / 5.0',
              diioSag: def.diioSag || `CL-07-28491-OV${i+1}`,
              vaccines: def.vaccines ? [...def.vaccines] : [],
              medicalProcedures: def.medicalProcedures ? [...def.medicalProcedures] : [],
              health: def.health || 'Excelente',
              paddockId: 'P5',
              locationSector: 'Centro-Oeste (PRV)',
              x: def.x,
              z: def.z,
              y: elev,
              notes: def.notes || 'Ramoneo bajo y control de malezas en bordes de viña.',
              mesh: sMesh
            };

            this.animals.set(def.id, animalData);
            sMesh.userData = animalData;
            sMesh.userData.animOffset = i * 2.1;
            this.sheepGroup.add(sMesh);
            this.sheep.push(sMesh);

            sMesh.traverse((child) => {
              if (child.isMesh) {
                this.mapManager.addPickable(child, animalData);
              }
            });
          });
          console.log('🐑 GLTF Sheep (Sheep.glb) cargadas con éxito en el Potrero P5');
        },
        undefined,
        (err) => {
          console.warn('⚠️ Could not load Sheep.glb, using procedural sheep:', err);
          this._spawnProceduralSheep(sheepDefs);
        }
      );
    } else {
      this._spawnProceduralSheep(sheepDefs);
    }
  }

  _spawnProceduralSheep(sheepDefs) {
    sheepDefs.forEach((def, i) => {
      const sMesh = this.buildSheepMesh(i);
      const elev = this.getElev(def.x, def.z, 0.05);
      sMesh.position.set(def.x, elev, def.z);
      sMesh.rotation.y = (i * 1.4) + 0.8;
      this.sheepGroup.add(sMesh);
      this.sheep.push(sMesh);

      const animalData = {
        id: def.id,
        name: def.name,
        tag: def.tag,
        type: 'livestock_animal',
        animalType: 'sheep',
        icon: '🐑',
        species: 'Ovino',
        breed: def.breed,
        category: def.category || 'Oveja de Lana & Pastoreo',
        weightKg: def.weight,
        dailyGainKg: def.dailyGainKg || '+0.18 kg/d',
        ageMonths: def.ageMonths || 24,
        birthDate: def.birthDate || '15/05/2024',
        waterLDay: def.waterLDay || 7.0,
        dryMatterKgDay: def.dryMatterKgDay || 2.5,
        freshForageKgDay: def.freshForageKgDay || 8.0,
        bodyCondition: def.bodyCondition || '3.5 / 5.0',
        diioSag: def.diioSag || `CL-07-28491-OV${i+1}`,
        vaccines: def.vaccines ? [...def.vaccines] : [],
        medicalProcedures: def.medicalProcedures ? [...def.medicalProcedures] : [],
        health: def.health || 'Excelente',
        paddockId: 'P5',
        locationSector: 'Centro-Oeste',
        x: def.x,
        z: def.z,
        y: elev,
        notes: def.notes || 'Ramoneo bajo y control de malezas en bordes de viña.',
        mesh: sMesh
      };

      this.animals.set(def.id, animalData);
      sMesh.userData = animalData;
      this.mapManager.addPickable(sMesh.children[0] || sMesh, animalData);
    });
  }

  buildSheepMesh(index) {
    return AnimalMeshFactory.buildSheepMesh(index);
  }

  // ─── 3. Caballos Sueltos y Libres ─────────────────────────────────────────────
  createHorses3D() {
    this.horses = [];
    const horseDefs = [
      {
        id: 'horse_1', name: 'Lucero', tag: 'CAB-01', breed: 'Caballo Chileno Bayo Dorado', weight: 460, coat: '#c29858', mane: '#1c1917', health: 'Excelente',
        ageMonths: 64, birthDate: '12/01/2021', dailyGainKg: 'Estable (Mantenimiento)', waterLDay: 38, dryMatterKgDay: 9.6, freshForageKgDay: 32.0,
        bodyCondition: '4.0 / 5.0 (Excelente conformación criolla)', diioSag: 'CL-07-28491-EQ1', category: 'Caballo de Trabajo & Montura',
        x: 18.5, z: 22.2,
        vaccines: [
          { name: 'Tétanos & Influenza Equina (Equilis Prequenza Te)', date: '18/02/2026', dose: '1 ml IM', lot: 'EQ-4402', booster: '18/02/2027', vet: 'Dra. Javiera Montecinos (SAG)' },
          { name: 'Adenitis Equina (Papera)', date: '04/09/2025', dose: '2 ml IM', lot: 'AD-991', booster: 'Anual', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Despalme y Recorte de Cascos en Frío', date: '14/04/2026', withdrawalDays: '0 días', vet: 'Don Silvestre Gómez (Herrador)', status: 'Completado', notes: 'Suela despalpada, ranilla sana sin pododermatitis' },
          { procedure: 'Odontología Equina (Limado de Puntas de Muela)', date: '15/11/2025', withdrawalDays: '0 días', vet: 'Dra. Javiera Montecinos', status: 'Óptimo', notes: 'Masticación y oclusión simétrica' }
        ]
      },
      {
        id: 'horse_2', name: 'Canela', tag: 'CAB-02', breed: 'Yegua Alazana Tostada', weight: 440, coat: '#9a3412', mane: '#ea580c', health: 'Excelente',
        ageMonths: 52, birthDate: '08/01/2022', dailyGainKg: 'Estable', waterLDay: 36, dryMatterKgDay: 9.2, freshForageKgDay: 30.5,
        bodyCondition: '3.75 / 5.0 (Gestante)', diioSag: 'CL-07-28491-EQ2', category: 'Yegua Madre Criolla',
        x: 23.2, z: 25.8,
        vaccines: [
          { name: 'Tétanos & Influenza Equina', date: '18/02/2026', dose: '1 ml IM', lot: 'EQ-4402', booster: '18/02/2027', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Ecografía Reproductiva Confirmación Preñez', date: '20/01/2026', withdrawalDays: '0 días', vet: 'Dra. Javiera Montecinos', status: 'Preñez 110d', notes: 'Desarrollo fetal vigoroso' }
        ]
      },
      {
        id: 'horse_3', name: 'Puelche', tag: 'CAB-03', breed: 'Caballo Zaino Colorado', weight: 475, coat: '#451a03', mane: '#18181b', health: 'Excelente',
        ageMonths: 72, birthDate: '15/03/2020', dailyGainKg: 'Estable', waterLDay: 42, dryMatterKgDay: 10.0, freshForageKgDay: 33.0,
        bodyCondition: '4.0 / 5.0 (Excelente masa)', diioSag: 'CL-07-28491-EQ3', category: 'Caballo Padrón Pradera',
        x: 15.8, z: 27.4,
        vaccines: [
          { name: 'Tétanos & Influenza Equina', date: '18/02/2026', dose: '1 ml IM', lot: 'EQ-4402', booster: '18/02/2027', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Desparasitación Pasta Oral (Ivermectina + Praziquantel)', date: '10/03/2026', withdrawalDays: '0 días', vet: 'Don Gastón Fuenzalida', status: 'Completado', notes: 'Dosis para 500 kg PV administrada completa' }
        ]
      },
      {
        id: 'horse_4', name: 'Nevada', tag: 'CAB-04', breed: 'Yegua Tordilla Rosilla', weight: 450, coat: '#cbd5e1', mane: '#64748b', health: 'Excelente',
        ageMonths: 48, birthDate: '04/10/2022', dailyGainKg: 'Estable', waterLDay: 37, dryMatterKgDay: 9.4, freshForageKgDay: 31.0,
        bodyCondition: '3.75 / 5.0', diioSag: 'CL-07-28491-EQ4', category: 'Yegua Criolla',
        x: 21.6, z: 19.4,
        vaccines: [
          { name: 'Tétanos & Influenza Equina', date: '18/02/2026', dose: '1 ml IM', lot: 'EQ-4402', booster: '18/02/2027', vet: 'Dra. Javiera Montecinos' }
        ],
        medicalProcedures: [
          { procedure: 'Evaluación de Dorso & Aplomos', date: '14/04/2026', withdrawalDays: '0 días', vet: 'Dra. Javiera Montecinos', status: 'Normal', notes: 'Sin contracturas ni puntos dolorosos para ensillar' }
        ]
      }
    ];

    if (this.gltfLoader) {
      this.gltfLoader.load(
        'assets/models/Horse.glb',
        (gltf) => {
          const baseHorseScene = gltf.scene;

          horseDefs.forEach((def, i) => {
            const horseMesh = baseHorseScene.clone(true);
            const elev = this.getElev(def.x, def.z, 0.05);
            horseMesh.position.set(def.x, elev, def.z);
            horseMesh.scale.set(0.0095, 0.0095, 0.0095);
            horseMesh.rotation.y = (i * 1.5) + 0.5;

            // Apply realistic coat tint & shadow casting
            horseMesh.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                  child.material = child.material.clone();
                  if (def.coat) {
                    child.material.color = new THREE.Color(def.coat);
                    child.material.roughness = 0.75;
                    child.material.metalness = 0.05;
                  }
                }
              }
            });

            const animalData = {
              id: def.id,
              name: def.name,
              tag: def.tag,
              type: 'livestock_animal',
              animalType: 'horse',
              icon: '🐎',
              species: 'Equino (Modelo 3D GLB)',
              breed: def.breed,
              category: def.category || 'Caballo Chileno Suelto',
              weightKg: def.weight,
              dailyGainKg: def.dailyGainKg || 'Estable',
              ageMonths: def.ageMonths || 56,
              birthDate: def.birthDate || '12/01/2021',
              waterLDay: def.waterLDay || 38,
              dryMatterKgDay: def.dryMatterKgDay || 9.5,
              freshForageKgDay: def.freshForageKgDay || 31.5,
              bodyCondition: def.bodyCondition || '4.0 / 5.0 (Excelente conformación)',
              diioSag: def.diioSag || `CL-07-28491-EQ${i+1}`,
              vaccines: def.vaccines ? [...def.vaccines] : [],
              medicalProcedures: def.medicalProcedures ? [...def.medicalProcedures] : [],
              health: def.health || 'Excelente',
              paddockId: 'P7',
              locationSector: 'Pradera Abierta Este (PRV)',
              x: def.x,
              z: def.z,
              y: elev,
              notes: def.notes || 'Pastoreo libre y descompactación ligera de suelo. Aptitud rústica criolla.',
              mesh: horseMesh
            };

            this.animals.set(def.id, animalData);
            horseMesh.userData = animalData;
            this.horsesGroup.add(horseMesh);
            this.horses.push(horseMesh);

            horseMesh.traverse((child) => {
              if (child.isMesh) {
                this.mapManager.addPickable(child, animalData);
              }
            });
          });
          console.log('🐎 GLTF Horses loaded successfully in PRV Paddock P7');
        },
        undefined,
        (err) => {
          console.warn('⚠️ Could not load Horse.glb, using procedural horses:', err);
          this._spawnProceduralHorses(horseDefs);
        }
      );
    } else {
      this._spawnProceduralHorses(horseDefs);
    }
  }

  _spawnProceduralHorses(horseDefs) {
    horseDefs.forEach((def, i) => {
      const horseMesh = this.buildHorseMesh(i, def.coat, def.mane);
      const elev = this.getElev(def.x, def.z, 0.05);
      horseMesh.position.set(def.x, elev, def.z);
      horseMesh.rotation.y = (i * 1.5) + 0.5;
      this.horsesGroup.add(horseMesh);
      this.horses.push(horseMesh);

      const animalData = {
        id: def.id,
        name: def.name,
        tag: def.tag,
        type: 'livestock_animal',
        animalType: 'horse',
        icon: '🐎',
        species: 'Equino',
        breed: def.breed,
        category: def.category || 'Caballo Chileno Suelto',
        weightKg: def.weight,
        dailyGainKg: def.dailyGainKg || 'Estable',
        ageMonths: def.ageMonths || 56,
        birthDate: def.birthDate || '12/01/2021',
        waterLDay: def.waterLDay || 38,
        dryMatterKgDay: def.dryMatterKgDay || 9.5,
        freshForageKgDay: def.freshForageKgDay || 31.5,
        bodyCondition: def.bodyCondition || '4.0 / 5.0 (Excelente conformación)',
        diioSag: def.diioSag || `CL-07-28491-EQ${i+1}`,
        vaccines: def.vaccines ? [...def.vaccines] : [],
        medicalProcedures: def.medicalProcedures ? [...def.medicalProcedures] : [],
        health: def.health || 'Excelente',
        paddockId: 'P7',
        locationSector: 'Pradera Abierta Este',
        x: def.x,
        z: def.z,
        y: elev,
        notes: def.notes || 'Pastoreo libre y descompactación ligera de suelo. Aptitud rústica criolla.',
        mesh: horseMesh
      };

      this.animals.set(def.id, animalData);
      horseMesh.userData = animalData;
      this.mapManager.addPickable(horseMesh.children[0] || horseMesh, animalData);
    });
  }

  buildHorseMesh(index, coatColor = '#c29858', maneColor = '#1c1917') {
    return AnimalMeshFactory.buildHorseMesh(index, coatColor, maneColor);
  }

  // ─── 4. Gallinas & Egg Mobile al Nor-Este (Despejadas de Paneles) ─────────────
  createEggMobile3D() {
    const coop = new THREE.Group();

    // Carro de madera remolcable
    const cartGeo = new THREE.BoxGeometry(2.6, 1.4, 1.8);
    const cartMat = new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.8 });
    const cart = new THREE.Mesh(cartGeo, cartMat);
    cart.position.y = 1.1;
    cart.castShadow = true;
    coop.add(cart);

    // Techo verde a dos aguas
    const roofGeo = new THREE.ConeGeometry(2.3, 1.1, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.5 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 2.25;
    roof.castShadow = true;
    coop.add(roof);

    // Ruedas de carreta
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.18, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.9 });
    [
      [-0.9, -0.98],
      [0.9, -0.98],
      [-0.9, 0.98],
      [0.9, 0.98]
    ].forEach(([x, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(x, 0.45, z);
      wheel.castShadow = true;
      coop.add(wheel);
    });

    // Gallinas de pastoreo picoteando alrededor (Real Hen.glb)
    this.chickens = [];
    if (this.gltfLoader) {
      this.gltfLoader.load(
        'assets/models/Hen.glb',
        (gltf) => {
          const baseHen = gltf.scene;
          for (let c = 0; c < 8; c++) {
            const ch = baseHen.clone(true);
            ch.scale.set(0.0065, 0.0065, 0.0065);
            ch.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            const rad = 2.0 + (c * 0.35);
            const angle = (c / 8) * Math.PI * 2;
            ch.position.set(Math.cos(angle) * rad, 0.05, Math.sin(angle) * rad);
            ch.rotation.y = Math.random() * Math.PI * 2;
            coop.add(ch);
            this.chickens.push(ch);
          }
          console.log('🐓 Gallinas reales (Hen.glb) añadidas al Egg Mobile');
        },
        undefined,
        () => this._spawnProceduralChickens(coop)
      );
    } else {
      this._spawnProceduralChickens(coop);
    }

    // Posición inicial: Nor-Este del predio (x: 6, z: -2)
    const initX = 6.0;
    const initZ = -2.0;
    const elev = this.getElev(initX, initZ, 0.05);
    coop.position.set(initX, elev, initZ);
    this.coopGroup.add(coop);
    this.eggMobile = coop;

    const coopData = {
      id: 'coop_main',
      name: 'Gallinero Móvil (Egg Mobile)',
      tag: 'AV-60',
      type: 'livestock_animal',
      animalType: 'coop',
      icon: '🐓',
      species: 'Aves de Pastoreo',
      breed: 'Hy-Line Brown & Barrada',
      category: '60 Gallinas Ponedoras',
      weightKg: 126,
      health: 'Excelente (Postura 94%)',
      paddockId: 'P8',
      locationSector: 'Nor-Este (Despejado de Paneles)',
      x: initX,
      z: initZ,
      y: elev,
      notes: 'Sanitización de pasturas, control biológico de larvas y abono nitrogenado.',
      mesh: coop
    };

    this.animals.set('coop_main', coopData);
    coop.userData = coopData;
    this.mapManager.addPickable(cart, coopData);
  }

  _spawnProceduralChickens(coop) {
    const chMat = new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.7 });
    const beakMat = new THREE.MeshStandardMaterial({ color: '#facc15' });
    for (let c = 0; c < 8; c++) {
      const ch = new THREE.Group();
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.35, 5), chMat);
      body.rotation.x = Math.PI / 2;
      ch.add(body);

      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 4), beakMat);
      beak.position.set(0, 0, 0.2);
      beak.rotation.x = -Math.PI / 2;
      ch.add(beak);

      const rad = 2.2 + (c * 0.4);
      const angle = (c / 8) * Math.PI * 2;
      ch.position.set(Math.cos(angle) * rad, 0.18, Math.sin(angle) * rad);
      coop.add(ch);
      this.chickens.push(ch);
    }
  }

  // ─── 5. Abrevadero Móvil ──────────────────────────────────────────────────────
  createWaterTrough3D() {
    const tank = new THREE.Group();

    // Tina de acero inoxidable
    const tinaGeo = new THREE.BoxGeometry(2.4, 0.65, 1.1);
    const tinaMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.25,
      metalness: 0.85
    });
    const tina = new THREE.Mesh(tinaGeo, tinaMat);
    tina.position.y = 0.35;
    tina.castShadow = true;
    tank.add(tina);

    // Superficie de agua azul translúcida
    const waterGeo = new THREE.PlaneGeometry(2.2, 0.9);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0.62;
    tank.add(water);

    // Posición estratégica acorde entre potreros (x: -22, z: 18)
    const initX = -22.0;
    const initZ = 18.0;
    const elev = this.getElev(initX, initZ, 0.05);
    tank.position.set(initX, elev, initZ);

    this.waterTroughGroup.add(tank);
    this.waterTrough = tank;
  }

  // ─── Reubicación Interactiva & Gestión de Datos ──────────────────────────────
  getAnimal(id) {
    return this.animals.get(id);
  }

  getAllAnimals() {
    return Array.from(this.animals.values());
  }

  updateAnimalData(id, newData) {
    const animal = this.animals.get(id);
    if (!animal) return;

    Object.assign(animal, newData);
    if (newData.x !== undefined && newData.z !== undefined) {
      this.relocateAnimal(id, newData.x, newData.z);
    }
    bus.emit('ui:show_toast', `💾 Ficha de ${animal.name} (${animal.tag}) guardada correctamente.`);
  }

  addVaccine(id, vaccine) {
    const animal = this.animals.get(id);
    if (!animal) return;
    if (!animal.vaccines) animal.vaccines = [];
    animal.vaccines.unshift(vaccine);
    bus.emit('ui:show_toast', `💉 Vacuna "${vaccine.name}" registrada para ${animal.name}`);
  }

  addMedicalProcedure(id, proc) {
    const animal = this.animals.get(id);
    if (!animal) return;
    if (!animal.medicalProcedures) animal.medicalProcedures = [];
    animal.medicalProcedures.unshift(proc);
    bus.emit('ui:show_toast', `🩺 Procedimiento "${proc.procedure}" registrado para ${animal.name}`);
  }

  relocateAnimal(id, newX, newZ) {
    const animal = this.animals.get(id);
    if (!animal || !animal.mesh) return;

    animal.x = newX;
    animal.z = newZ;
    animal.y = this.getElev(newX, newZ, 0.05);

    animal.mesh.position.set(animal.x, animal.y, animal.z);

    // Actualizar insignias si corresponde
    if (animal.animalType === 'cow' && this.badgeCows) {
      this.badgeCows.position.set(newX, this.getElev(newX, newZ, 4.3), newZ);
    } else if (animal.animalType === 'sheep' && this.badgeSheep) {
      this.badgeSheep.position.set(newX, this.getElev(newX, newZ, 3.8), newZ);
    } else if (animal.animalType === 'horse' && this.badgeHorses) {
      this.badgeHorses.position.set(newX, this.getElev(newX, newZ, 4.2), newZ);
    } else if (animal.animalType === 'coop' && this.badgeCoop) {
      this.badgeCoop.position.set(newX, this.getElev(newX, newZ, 3.8), newZ);
    }

    bus.emit('livestock:animal_moved', animal);
    bus.emit('ui:show_toast', `📍 ${animal.name} reubicado en (${newX.toFixed(1)}, ${newZ.toFixed(1)})`);
  }

  startInteractiveRelocation(animalId) {
    const animal = this.animals.get(animalId);
    if (!animal) return;

    this.relocatingAnimalId = animalId;
    if (this.placementRing) {
      this.placementRing.position.set(animal.x, animal.y + 0.1, animal.z);
      this.placementRing.visible = true;
    }
    bus.emit('ui:show_toast', `🎯 Modo Reubicación Activo: Haz clic en cualquier punto del terreno para trasladar a ${animal.name}`);
  }

  cancelRelocation() {
    this.relocatingAnimalId = null;
    if (this.placementRing) this.placementRing.visible = false;
  }

  setupMapPlacementListener() {
    const canvas = this.mapManager?.renderer?.domElement;
    if (!canvas) return;

    canvas.addEventListener('mousemove', (e) => {
      if (!this.relocatingAnimalId || !this.placementRing) return;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.mapManager.camera);
      const hits = raycaster.intersectObject(this.mapManager.groundMesh);
      if (hits.length > 0) {
        const p = hits[0].point;
        this.placementRing.position.set(p.x, p.y + 0.12, p.z);
      }
    });

    canvas.addEventListener('click', (e) => {
      if (!this.relocatingAnimalId) return;

      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.mapManager.camera);
      const hits = raycaster.intersectObject(this.mapManager.groundMesh);

      if (hits.length > 0) {
        const p = hits[0].point;
        const targetId = this.relocatingAnimalId;
        this.relocatingAnimalId = null;
        if (this.placementRing) this.placementRing.visible = false;

        this.relocateAnimal(targetId, p.x, p.z);
        e.stopPropagation();
      }
    });
  }

  teleportPreset(animalId, preset) {
    const presets = {
      sur_oeste: { x: -34.0, z: 36.0, label: 'Esquina Sur-Oeste (Vacas)' },
      centro_oeste: { x: -29.0, z: 4.0, label: 'Centro-Oeste (Ovejas)' },
      nor_este: { x: 6.0, z: -2.0, label: 'Nor-Este (Gallinero Móvil)' },
      pradera_central: { x: 18.0, z: 22.0, label: 'Pradera Abierta (Caballos)' }
    };

    const target = presets[preset];
    if (target) {
      this.relocateAnimal(animalId, target.x, target.z);
    }
  }

  positionCoopInPaddock(paddockId) {
    const p = this.paddocks.find(item => item.id === paddockId);
    if (!p || !this.eggMobile) return;

    this.relocateAnimal('coop_main', p.x, p.z);
  }

  moveToPaddock(targetPaddockId) {
    if (this.activePaddockId === targetPaddockId) return;

    const oldPaddock = this.paddocks.find(p => p.id === this.activePaddockId);
    const newPaddock = this.paddocks.find(p => p.id === targetPaddockId);
    if (!newPaddock) return;

    if (oldPaddock) {
      oldPaddock.status = 'resting';
      oldPaddock.restDays = 1;
      oldPaddock.forrajeCm = 6;
      this.updatePaddockVisual(oldPaddock);
    }

    newPaddock.status = 'active';
    this.activePaddockId = targetPaddockId;
    this.updatePaddockVisual(newPaddock);

    // Mover grupo de vacas al nuevo potrero
    this.cows.forEach((cow, i) => {
      const offsetX = ((i % 3) - 1) * 1.5;
      const offsetZ = (Math.floor(i / 3) - 0.5) * 1.5;
      const tx = newPaddock.x + offsetX;
      const tz = newPaddock.z + offsetZ;
      const a = this.animals.get(`cow_${i+1}`);
      if (a) this.relocateAnimal(a.id, tx, tz);
    });

    bus.emit('ui:show_toast', `🐄 Rebaño trasladado a ${newPaddock.name}. Potrero anterior entra en descanso.`);
  }

  updatePaddockVisual(paddock) {
    if (!paddock.mat) return;
    if (paddock.status === 'active') {
      paddock.mat.color.set('#f59e0b');
      paddock.mat.opacity = 0.65;
    } else if (paddock.status === 'coop') {
      paddock.mat.color.set('#38bdf8');
      paddock.mat.opacity = 0.45;
    } else if (paddock.restDays >= 35) {
      paddock.mat.color.set('#15803d');
      paddock.mat.opacity = 0.45;
    } else {
      paddock.mat.color.set('#84cc16');
      paddock.mat.opacity = 0.35;
    }
    this.updateBadgeText(paddock);
  }

  updateBadgeText(paddock) {
    if (!paddock.badge || !paddock.badge.userData.ctx) return;
    const ctx = paddock.badge.userData.ctx;
    const canvas = paddock.badge.userData.canvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = paddock.status === 'active' ? '#b45309' : (paddock.restDays >= 35 ? '#15803d' : '#1e293b');
    ctx.roundRect(4, 4, 120, 56, 12);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(paddock.id, 64, 28);

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = paddock.status === 'active' ? '#fde047' : '#86efac';
    ctx.fillText(`${paddock.restDays}d • ${paddock.forrajeCm}cm`, 64, 48);

    paddock.badge.userData.texture.needsUpdate = true;
  }

  updateAnimations(time) {
    // Billboarding para insignias flotantes
    const cam = this.mapManager?.camera;
    if (cam) {
      this.paddocks.forEach(p => {
        if (p.badge) p.badge.quaternion.copy(cam.quaternion);
      });
      if (this.badgeCows) this.badgeCows.quaternion.copy(cam.quaternion);
      if (this.badgeSheep) this.badgeSheep.quaternion.copy(cam.quaternion);
      if (this.badgeHorses) this.badgeHorses.quaternion.copy(cam.quaternion);
      if (this.badgeCoop) this.badgeCoop.quaternion.copy(cam.quaternion);
    }

    // Pastoreo en vacas
    this.cows.forEach((cow) => {
      const off = cow.userData.animOffset || 0;
      if (cow.userData.headGroup) {
        cow.userData.headGroup.rotation.x = Math.sin(time * 0.002 + off) * 0.25 - 0.15;
      }
      if (cow.userData.tail) {
        cow.userData.tail.rotation.z = Math.PI / 6 + Math.sin(time * 0.006 + off) * 0.18;
      }
    });

    // Pastoreo en ovejas
    this.sheep.forEach((sheep) => {
      const off = sheep.userData.animOffset || 0;
      if (sheep.userData.head) {
        sheep.userData.head.rotation.x = Math.sin(time * 0.003 + off) * 0.2 + 0.1;
      }
    });

    // Movimiento natural en caballos (cuello y cola)
    this.horses.forEach((horse) => {
      const off = horse.userData.animOffset || 0;
      if (horse.userData.neckGroup) {
        horse.userData.neckGroup.rotation.x = Math.sin(time * 0.0018 + off) * 0.18 - 0.08;
      }
      if (horse.userData.tail) {
        horse.userData.tail.rotation.z = Math.PI / 7 + Math.sin(time * 0.005 + off) * 0.15;
      }
    });

    // Gallinas picoteando
    if (this.chickens) {
      this.chickens.forEach((ch, i) => {
        ch.rotation.x = Math.sin(time * 0.008 + i * 2) * 0.4 + 0.2;
      });
    }
  }

  toggleVisibility(visible) {
    this.visible = visible;
    this.group.visible = visible;
  }
}
