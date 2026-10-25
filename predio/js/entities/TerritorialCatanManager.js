/**
 * AgriTwin - TerritorialCatanManager Module
 * 
 * Implements a Seamless Multi-Scale 3D Landscape:
 *  - Continuous Semantic Zoom: Local Farm (12.8 ha) ↔ Regional Catan Matrix
 *  - Procedural 3D Hexagonal Landscape (Civ VI / Catan style) surrounding Fundo Colliguay
 *  - Inter-System Permaculture Coupling (Permacultura entre sistemas a nivel territorial):
 *      * Corredor Biológico Trans-Predial (Zona 5 Nativa ↔ Reserva Esclerófila)
 *      * Hidrología Keyline Supraterritorial (Excedentes de Tranque ↔ Humedal Fluvial)
 *      * Cortafuegos Silvopastoril Comunitario (Ganado PRV ↔ Forestal Los Pinos)
 *  - Creación y Monitoreo de Predios Vecinos por el Usuario (+ Agregar Predio Vecino)
 *  - Dados y Fichas Numéricas Diegéticas de Probabilidad / Riesgo
 */

import { bus } from '../utils/EventBus.js';

export const CATAN_BIOMES = {
  fundo_colliguay: {
    name: 'Fundo Estero Colliguay',
    color: '#059669',
    edgeColor: '#fde047',
    icon: '🏰',
    height: 1.8,
    desc: 'Capital Predial • 12.8 ha • Manejo Regenerativo Holístico'
  },
  monoculture: {
    name: 'Plantación Pino / Eucalipto',
    color: '#78350f',
    edgeColor: '#ea580c',
    icon: '🌲',
    height: 1.2,
    desc: 'Forestal Monocultivo • Alto Combustible FWI • Riesgo Puelche'
  },
  forest_pine: {
    name: 'Plantación Pino / Eucalipto',
    color: '#78350f',
    edgeColor: '#ea580c',
    icon: '🌲',
    height: 1.2,
    desc: 'Forestal Monocultivo • Alto Combustible FWI • Riesgo Puelche'
  },
  wheat: {
    name: 'Cereal Secano / Trigo',
    color: '#d97706',
    edgeColor: '#fde047',
    icon: '🌾',
    height: 1.3,
    desc: 'Cultivo Tradicional de Trigo y Leguminosas'
  },
  vineyard: {
    name: 'Viñedo Patrimonial',
    color: '#881337',
    edgeColor: '#fb7185',
    icon: '🍇',
    height: 1.4,
    desc: 'Viñas País y Carménère • Estrés Hídrico Estival'
  },
  native_forest: {
    name: 'Reserva Bosque Esclerófilo',
    color: '#065f46',
    edgeColor: '#34d399',
    icon: '🌳',
    height: 2.2,
    desc: 'Corredor Biológico Nativo • Peumo, Quillay y Boldo'
  },
  river_wetland: {
    name: 'Ribera & Humedal Colliguay',
    color: '#0284c7',
    edgeColor: '#38bdf8',
    icon: '💧',
    height: 0.8,
    desc: 'Amortiguación de Crecidas TWI • Recarga de Acuífero Aluvial'
  },
  pasture: {
    name: 'Pradera Agroecológica',
    color: '#166534',
    edgeColor: '#86efac',
    icon: '🌾',
    height: 1.5,
    desc: 'Silvopastoreo y Producción de Forraje Regenerativo'
  },
  precordillera: {
    name: 'Precordillera Andina',
    color: '#475569',
    edgeColor: '#94a3b8',
    icon: '🏔️',
    height: 3.5,
    desc: 'Cabecera de Cuenca • Aporte de Deshielos y Viento Cordillerano'
  }
};

export class TerritorialCatanManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.scene = mapManager.scene;

    this.group = new THREE.Group();
    this.group.name = 'territorialCatanGroup';
    this.scene.add(this.group);

    // Parámetros de la grilla hexagonal
    this.HEX_RADIUS = 30.0; // Radio del hexágono en metros
    this.HEX_HEIGHT = 1.4;

    this.hexDataMap = new Map();
    this.hexMeshMap = new Map();
    this.selectedHexKey = '0,0';
    this.hoveredHexKey = null;
    this.catanPickables = [];
    this.isTerritorialActive = false;

    // Grupos visuales (desactivados en el visor 3D del predio para máxima limpieza y realismo)
    this.tilesGroup = new THREE.Group();
    this.tokensGroup = new THREE.Group();
    this.couplingsGroup = new THREE.Group();

    this.group.add(this.tilesGroup);
    this.group.add(this.tokensGroup);
    this.group.add(this.couplingsGroup);

    // Ocultar por defecto para que no interfiera con el predio
    this.group.visible = false;
    this.tilesGroup.visible = false;
    this.tokensGroup.visible = false;
    this.couplingsGroup.visible = false;

    this.activeLens = 'lulc'; // lulc | fire | flood | permaculture
    this.isVecinalModeActive = false;

    this.initDefaultNeighborhood();
    this.build3DHexGrid();
    this.buildPermacultureCouplings3D();

    // Eventos
    bus.on('territorial:select_hex', (coords) => this.selectHex(coords.q, coords.r));
    bus.on('territorial:set_lens', (lens) => this.setLens(lens));
    bus.on('territorial:add_hex', (data) => this.addNeighborHex(data));
    bus.on('profile:active_changed', (profile) => this.setTerritorialModeActive(profile === 'territorial'));

    // Animación y zoom semántico
    this.mapManager.addAnimated(this.group, (time) => this.update(time));
  }

  // Conversión de coordenadas axiales (q, r) a 3D Cartesianas (x, z)
  hexToCartesian(q, r) {
    const x = this.HEX_RADIUS * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const z = this.HEX_RADIUS * (1.5 * r);
    return { x, z };
  }

  cartesianToHex(x, z) {
    const q = (Math.sqrt(3) / 3 * x - 1 / 3 * z) / this.HEX_RADIUS;
    const r = (2 / 3 * z) / this.HEX_RADIUS;
    return this.hexRound(q, r);
  }

  hexRound(q, r) {
    const s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);

    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);

    if (qDiff > rDiff && qDiff > sDiff) {
      rq = -rr - rs;
    } else if (rDiff > sDiff) {
      rr = -rq - rs;
    }
    return { q: rq, r: rr };
  }

  initDefaultNeighborhood() {
    const defaultHexes = [
      // Centro (0, 0): Fundo Estero Colliguay
      {
        q: 0, r: 0,
        biome: 'fundo_colliguay',
        name: 'Fundo Estero Colliguay',
        owner: 'Familia Meniels',
        surfaceHa: 12.8,
        dice: 8,
        isCenter: true,
        fwi: 18,
        waterRightsLs: 45,
        permacultureRole: 'Núcleo Central: Tranque Keyline, 8 potreros PRV y huerto biointensivo',
        yieldStr: '+5 🌾 +4 💧 +3 ⚡'
      },
      // Anillo 1: Vecinos contiguos inmediatos
      {
        q: -1, r: 0,
        biome: 'monoculture',
        name: 'Vecino Oeste: Forestal Los Pinos',
        owner: 'Forestal Arauco / Mininco',
        surfaceHa: 140.0,
        dice: 9,
        fwi: 72,
        waterRightsLs: 10,
        permacultureRole: 'Frontera de Riesgo: Requiere cortafuegos silvopastoril con ganado de Colliguay',
        yieldStr: '+4 🪵 -3 💧'
      },
      {
        q: 1, r: 0,
        biome: 'pasture',
        name: 'Vecino Este: Agrícola Las Camelias',
        owner: 'Cooperativa Campesina Retiro',
        surfaceHa: 28.5,
        dice: 6,
        fwi: 24,
        waterRightsLs: 32,
        permacultureRole: 'Intercambio Forrajero & Granos: Producción de cereales de secano',
        yieldStr: '+4 🌾 +2 💧'
      },
      {
        q: 0, r: -1,
        biome: 'vineyard',
        name: 'Vecino Norte: Viña Santa Elena',
        owner: 'Sucesión Santa Elena',
        surfaceHa: 35.0,
        dice: 5,
        fwi: 34,
        waterRightsLs: 20,
        permacultureRole: 'Defensa de Heladas: Drenaje katabático de aire frío hacia el estero',
        yieldStr: '+4 🍇 +1 💧'
      },
      {
        q: 0, r: 1,
        biome: 'pasture',
        name: 'Vecino Sur: Parcela Don Pedro',
        owner: 'Pedro Urrutia & Familia',
        surfaceHa: 18.0,
        dice: 10,
        fwi: 22,
        waterRightsLs: 15,
        permacultureRole: 'Corredor Agroecológico: Conexión de polinizadores y pastoreo conjunto',
        yieldStr: '+3 🥛 +2 🌾'
      },
      {
        q: -1, r: 1,
        biome: 'river_wetland',
        name: 'Suroeste: Humedal Estero Colliguay',
        owner: 'BBNN / Área Protegida Comunal',
        surfaceHa: 22.0,
        dice: 2,
        fwi: 12,
        waterRightsLs: 120,
        permacultureRole: 'Amortiguación Fluvial: Receptor de excedentes del vertedero Keyline',
        yieldStr: '+5 💧 +2 🌿'
      },
      {
        q: 1, r: -1,
        biome: 'native_forest',
        name: 'Noreste: Reserva Quebrada Los Boldos',
        owner: 'Fundación Rewild Maule',
        surfaceHa: 62.0,
        dice: 11,
        fwi: 15,
        waterRightsLs: 50,
        permacultureRole: 'Zona 5 Biológica: Refugio de biodiversidad y banco de semillas esclerófilas',
        yieldStr: '+4 🌳 +4 🛡️'
      },
      // Anillo 2: Escala Territorial Ampliada
      {
        q: -2, r: 0,
        biome: 'monoculture',
        name: 'Forestal El Peumo Poniente',
        owner: 'Agrícola San Carlos',
        surfaceHa: 85.0,
        dice: 4,
        fwi: 68,
        waterRightsLs: 8,
        permacultureRole: 'Zona de Amortiguación Cortafuegos',
        yieldStr: '+3 🪵 -2 💧'
      },
      {
        q: 2, r: 0,
        biome: 'precordillera',
        name: 'Precordillera Andina Los Cristales',
        owner: 'Comunidad de Aguas Canal Melado',
        surfaceHa: 320.0,
        dice: 3,
        fwi: 28,
        waterRightsLs: 450,
        permacultureRole: 'Cabecera de Cuenca: Aporte de deshielos y recarga subterránea',
        yieldStr: '+5 🏔️ +5 💧'
      },
      {
        q: 0, r: -2,
        biome: 'vineyard',
        name: 'Viñedos San Javier del Maule',
        owner: 'Cooperativa Loncomilla',
        surfaceHa: 48.0,
        dice: 9,
        fwi: 38,
        waterRightsLs: 25,
        permacultureRole: 'Viñedo de Secano Costero',
        yieldStr: '+4 🍇'
      },
      {
        q: 0, r: 2,
        biome: 'pasture',
        name: 'Comunidad Campesina Las Toscas',
        owner: 'Asociación Gremial Retiro Sur',
        surfaceHa: 54.0,
        dice: 12,
        fwi: 26,
        waterRightsLs: 30,
        permacultureRole: 'Nodo Ganadero Ovino Comunitario',
        yieldStr: '+3 🐑 +2 🌾'
      },
      {
        q: -1, r: -1,
        biome: 'monoculture',
        name: 'Aserradero & Acopio Los Aromos',
        owner: 'Maderas del Sur S.A.',
        surfaceHa: 16.0,
        dice: 10,
        fwi: 80,
        waterRightsLs: 5,
        permacultureRole: 'Punto Crítico FWI: Monitoreo preventivo con cámaras térmicas',
        yieldStr: '+5 🪵 -4 💧'
      },
      {
        q: 1, r: 1,
        biome: 'river_wetland',
        name: 'Tranque Colectivo Las Camelias',
        owner: 'Junta de Vigilancia Río Longaví',
        surfaceHa: 19.5,
        dice: 4,
        fwi: 10,
        waterRightsLs: 220,
        permacultureRole: 'Seguridad Hídrica Cuenca: Conexión con tranque predial Colliguay',
        yieldStr: '+5 💧 +2 🐟'
      }
    ];

    defaultHexes.forEach(h => {
      const key = `${h.q},${h.r}`;
      this.hexDataMap.set(key, h);
    });
  }

  build3DHexGrid() {
    this.tilesGroup.clear();
    this.tokensGroup.clear();

    const hexGeometry = new THREE.CylinderGeometry(
      this.HEX_RADIUS * 0.96,
      this.HEX_RADIUS * 0.98,
      this.HEX_HEIGHT,
      6
    );

    this.hexDataMap.forEach((hex, key) => {
      const pos = this.hexToCartesian(hex.q, hex.r);
      const biomeConfig = CATAN_BIOMES[hex.biome] || CATAN_BIOMES.pasture;

      const tileGroup = new THREE.Group();
      tileGroup.position.set(pos.x, -0.2, pos.z);

      // Si es el predio central, hacemos un anillo perimetral dorado para dejar ver la maqueta 3D
      if (hex.isCenter) {
        const ringGeo = new THREE.RingGeometry(this.HEX_RADIUS * 0.88, this.HEX_RADIUS * 1.02, 6);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.8,
          metalness: 0.8,
          roughness: 0.2,
          side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.y = 0.45;
        tileGroup.add(ringMesh);

        // Borde exterior biselado
        const edgeMesh = new THREE.Mesh(
          hexGeometry,
          new THREE.MeshStandardMaterial({
            color: '#064e3b',
            metalness: 0.4,
            roughness: 0.6,
            transparent: true,
            opacity: 0.25
          })
        );
        edgeMesh.position.y = -this.HEX_HEIGHT / 2 + 0.1;
        tileGroup.add(edgeMesh);
      } else {
        // Hexágono vecino sólido con PBR
        const mat = new THREE.MeshStandardMaterial({
          color: biomeConfig.color,
          roughness: 0.75,
          metalness: 0.15,
          flatShading: true
        });

        const mesh = new THREE.Mesh(hexGeometry, mat);
        mesh.position.y = -this.HEX_HEIGHT / 2 + 0.2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        tileGroup.add(mesh);

        // Ilustración Gemini sobre la cara superior del hexágono
        const geminiTextureMap = {
          monoculture: 'assets/catan/tile_pines.jpg',
          forest_pine: 'assets/catan/tile_pines.jpg',
          pasture: 'assets/catan/tile_pasture.jpg',
          wheat: 'assets/catan/tile_wheat.jpg',
          vineyard: 'assets/catan/tile_vineyard.jpg',
          native_forest: 'assets/catan/tile_forest.jpg',
          river_wetland: 'assets/catan/tile_water.jpg',
          precordillera: 'assets/catan/tile_mountain.jpg'
        };
        const textureUrl = geminiTextureMap[hex.biome];
        if (textureUrl) {
          if (!this.loadedTextures) this.loadedTextures = new Map();
          if (!this.loadedTextures.has(textureUrl)) {
            const loader = new THREE.TextureLoader();
            const tex = loader.load(textureUrl);
            tex.colorSpace = THREE.SRGBColorSpace;
            this.loadedTextures.set(textureUrl, tex);
          }
          const tex = this.loadedTextures.get(textureUrl);
          const topGeo = new THREE.CircleGeometry(this.HEX_RADIUS * 0.90, 6);
          topGeo.rotateX(-Math.PI / 2);
          const topMat = new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.7,
            metalness: 0.1,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1
          });
          const topMesh = new THREE.Mesh(topGeo, topMat);
          topMesh.position.y = 0.22;
          tileGroup.add(topMesh);
        }

        // Borde superior iluminado (Glowing Edge)
        const edgeGeo = new THREE.EdgesGeometry(hexGeometry);
        const edgeMat = new THREE.LineBasicMaterial({
          color: biomeConfig.edgeColor,
          linewidth: 2,
          transparent: true,
          opacity: 0.75
        });
        const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
        edgeLines.position.copy(mesh.position);
        tileGroup.add(edgeLines);

        // Ficha diegética Catan flotante con número
        if (hex.dice) {
          const token = this.createCatanToken(hex);
          token.position.set(0, 3.8, 0);
          tileGroup.add(token);
        }
      }

      // Datos para Picking y Selección
      const entityData = {
        type: 'territorial_hex',
        id: `hex_${key}`,
        q: hex.q,
        r: hex.r,
        hexKey: key,
        data: hex
      };

      tileGroup.userData = entityData;
      tileGroup.traverse(child => {
        if (child.isMesh) {
          child.userData = entityData;
          this.catanPickables.push(child);
        }
      });

      this.tilesGroup.add(tileGroup);
      this.hexMeshMap.set(key, { group: tileGroup, basePos: tileGroup.position.clone(), targetY: tileGroup.position.y });
    });
  }

  createCatanToken(hex) {
    const group = new THREE.Group();
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const isHot = (hex.dice === 6 || hex.dice === 8);

    // Fondo pergamino circular
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(64, 64, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = isHot ? '#dc2626' : '#78350f';
    ctx.stroke();

    // Número
    ctx.fillStyle = isHot ? '#dc2626' : '#1c1917';
    ctx.font = 'bold 54px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${hex.dice}`, 64, 54);

    // Puntos de probabilidad Catan
    const dotsCount = (hex.dice === 2 || hex.dice === 12) ? 1 :
                      (hex.dice === 3 || hex.dice === 11) ? 2 :
                      (hex.dice === 4 || hex.dice === 10) ? 3 :
                      (hex.dice === 5 || hex.dice === 9)  ? 4 : 5;

    ctx.fillStyle = isHot ? '#dc2626' : '#451a03';
    const startX = 64 - (dotsCount - 1) * 7;
    for (let i = 0; i < dotsCount; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * 14, 96, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    const planeGeo = new THREE.PlaneGeometry(6.5, 6.5);
    const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    group.add(mesh);
    group.userData.tokenMesh = mesh;
    return group;
  }

  // ─── Permacultura Entre Sistemas a Nivel Catan ─────────────────────────────
  buildPermacultureCouplings3D() {
    this.couplingsGroup.clear();

    // 1. Corredor Biológico: Colliguay (0, 0) ↔ Reserva Los Boldos (1, -1) y Parcela Don Pedro (0, 1)
    const bioPts = [
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(15, 2.5, -12),
      this.hexToVector3(1, -1, 2.2)
    ];
    const bioCurve = new THREE.CatmullRomCurve3(bioPts);
    const bioGeo = new THREE.TubeGeometry(bioCurve, 32, 0.6, 8, false);
    const bioMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.65,
      transparent: true,
      opacity: 0.85
    });
    const bioMesh = new THREE.Mesh(bioGeo, bioMat);
    this.couplingsGroup.add(bioMesh);

    // 2. Conexión Hidrológica Keyline: Tranque Colliguay ↔ Humedal (-1, 1)
    const hydroPts = [
      new THREE.Vector3(10, 1.0, -8),
      new THREE.Vector3(-10, 0.8, 8),
      this.hexToVector3(-1, 1, 0.9)
    ];
    const hydroCurve = new THREE.CatmullRomCurve3(hydroPts);
    const hydroGeo = new THREE.TubeGeometry(hydroCurve, 32, 0.5, 8, false);
    const hydroMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.85
    });
    const hydroMesh = new THREE.Mesh(hydroGeo, hydroMat);
    this.couplingsGroup.add(hydroMesh);

    // 3. Cortafuegos Silvopastoril: Entre Colliguay (0, 0) y Forestal Los Pinos (-1, 0)
    const firebreakPos = this.hexToCartesian(-0.5, 0);
    const firebreakGeo = new THREE.BoxGeometry(4.5, 0.8, this.HEX_RADIUS * 1.5);
    const firebreakMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.7,
      roughness: 0.3
    });
    const firebreakMesh = new THREE.Mesh(firebreakGeo, firebreakMat);
    firebreakMesh.position.set(firebreakPos.x, 1.2, firebreakPos.z);
    this.couplingsGroup.add(firebreakMesh);
  }

  hexToVector3(q, r, y = 1.0) {
    const pos = this.hexToCartesian(q, r);
    return new THREE.Vector3(pos.x, y, pos.z);
  }

  // ─── API de Creación y Edición por el Cliente ──────────────────────────────
  addNeighborHex(customData) {
    const q = parseInt(customData.q) || 0;
    const r = parseInt(customData.r) || 0;
    const key = `${q},${r}`;

    const newHex = {
      q, r,
      biome: customData.biome || 'pasture',
      name: customData.name || `Nuevo Predio [${q},${r}]`,
      owner: customData.owner || 'Propietario Vecino',
      surfaceHa: parseFloat(customData.surfaceHa) || 20.0,
      dice: parseInt(customData.dice) || 5,
      fwi: parseInt(customData.fwi) || 25,
      waterRightsLs: parseFloat(customData.waterRightsLs) || 15,
      permacultureRole: customData.permacultureRole || 'Zona de integración agroecológica compartida',
      yieldStr: customData.yieldStr || '+3 🌾 +2 💧'
    };

    this.hexDataMap.set(key, newHex);
    this.build3DHexGrid();
    this.buildPermacultureCouplings3D();

    bus.emit('ui:show_toast', `🗺️ Predio Vecino '${newHex.name}' registrado exitosamente en casilla [${q}, ${r}]`);
    this.selectHex(q, r);
    return newHex;
  }

  updateHexData(q, r, partialData) {
    const key = `${q},${r}`;
    const hex = this.hexDataMap.get(key);
    if (!hex) return;

    Object.assign(hex, partialData);
    this.build3DHexGrid();
    bus.emit('ui:show_toast', `💾 Datos de casilla [${q}, ${r}] actualizados.`);
  }

  getHex(q, r) {
    return this.hexDataMap.get(`${q},${r}`);
  }

  getAllHexes() {
    return Array.from(this.hexDataMap.values());
  }

  selectHex(q, r) {
    const key = `${q},${r}`;
    const hex = this.hexDataMap.get(key);
    if (!hex) return;

    this.selectedHexKey = key;

    // Resaltar en 3D elevando la casilla
    this.hexMeshMap.forEach((entry, k) => {
      const isSelected = (k === key);
      entry.targetY = isSelected ? entry.basePos.y + 2.5 : entry.basePos.y;
    });

    // Mover cámara suavemente hacia el hexágono
    const pos = this.hexToCartesian(q, r);
    if (this.mapManager && typeof this.mapManager.animateCamera === 'function') {
      const camTarget = new THREE.Vector3(pos.x, 1.2, pos.z);
      const camPos = new THREE.Vector3(pos.x + 35, 48, pos.z + 55);
      this.mapManager.animateCamera(camPos, camTarget, 800);
    }

    bus.emit('entity:selected', {
      id: `hex_${key}`,
      name: hex.name,
      properties: {
        type: 'territorial_hex',
        hexKey: key,
        data: hex
      }
    });
  }

  setLens(lens) {
    this.activeLens = lens;
    this.hexMeshMap.forEach((entry, key) => {
      const hex = this.hexDataMap.get(key);
      if (!hex) return;

      const mesh = entry.group.children[0];
      if (!mesh || !mesh.material) return;

      if (lens === 'fire') {
        const fireColor = hex.fwi > 60 ? '#ef4444' : (hex.fwi > 30 ? '#f59e0b' : '#10b981');
        mesh.material.color.set(fireColor);
      } else if (lens === 'flood') {
        const floodColor = hex.biome === 'river_wetland' ? '#0284c7' : (hex.waterRightsLs > 40 ? '#38bdf8' : '#64748b');
        mesh.material.color.set(floodColor);
      } else if (lens === 'permaculture') {
        const permColor = hex.isCenter ? '#10b981' : (hex.permacultureRole.includes('Corredor') ? '#059669' : '#b45309');
        mesh.material.color.set(permColor);
      } else {
        const biomeConfig = CATAN_BIOMES[hex.biome] || CATAN_BIOMES.pasture;
        mesh.material.color.set(biomeConfig.color);
      }
    });

    bus.emit('ui:show_toast', `🔍 Lente Territorial activado: ${lens.toUpperCase()}`);
  }

  // ─── Simuladores Dinámicos Contiguos ───────────────────────────────────────
  simulatePuelcheFire() {
    this.setLens('fire');
    const pineEntry = this.hexMeshMap.get('-1,0');
    const firebreakGroup = this.couplingsGroup.children[2];

    if (pineEntry) {
      pineEntry.targetY = 4.0;
      const mesh = pineEntry.group.children[0];
      if (mesh && mesh.material) {
        mesh.material.emissive = new THREE.Color(0xdc2626);
        mesh.material.emissiveIntensity = 1.0;
      }
    }

    if (firebreakGroup && firebreakGroup.material) {
      firebreakGroup.material.emissive = new THREE.Color(0xf59e0b);
      firebreakGroup.material.emissiveIntensity = 1.5;
    }

    bus.emit('ui:show_toast', '🔥 Viento Puelche simulado: Foco en Forestal Los Pinos frenado por el bio-cortafuegos silvopastoril de Colliguay.');

    setTimeout(() => {
      if (pineEntry) pineEntry.targetY = pineEntry.basePos.y;
      this.setLens(this.activeLens);
    }, 6000);
  }

  simulateFluvialFlood() {
    this.setLens('flood');
    const wetlandEntry = this.hexMeshMap.get('-1,1');
    const tranqueEntry = this.hexMeshMap.get('1,1');

    if (wetlandEntry) wetlandEntry.targetY = 3.2;
    if (tranqueEntry) tranqueEntry.targetY = 2.8;

    bus.emit('ui:show_toast', '🌊 Crecida Fluvial simulada: El estero Colliguay amortigua el caudal previniendo anegamiento en predios vecinos.');

    setTimeout(() => {
      if (wetlandEntry) wetlandEntry.targetY = wetlandEntry.basePos.y;
      if (tranqueEntry) tranqueEntry.targetY = tranqueEntry.basePos.y;
      this.setLens(this.activeLens);
    }, 6000);
  }

  simulateGrazingAlliance() {
    const p1 = this.hexMeshMap.get('1,0');
    const p2 = this.hexMeshMap.get('0,1');
    if (p1) p1.targetY = 2.5;
    if (p2) p2.targetY = 2.5;

    bus.emit('ui:show_toast', '🐄 Alianza de Pastoreo Rotativo: Rebaño de Colliguay limpia biomasa en parcelas colindantes reduciendo FWI.');

    setTimeout(() => {
      if (p1) p1.targetY = p1.basePos.y;
      if (p2) p2.targetY = p2.basePos.y;
    }, 5000);
  }

  registerPickables() {
    if (!this.mapManager || typeof this.mapManager.addPickable !== 'function') return;
    this.catanPickables.forEach(mesh => {
      this.mapManager.addPickable(mesh, mesh.userData);
    });
  }

  unregisterPickables() {
    if (!this.mapManager || typeof this.mapManager.removePickable !== 'function') return;
    this.catanPickables.forEach(mesh => {
      this.mapManager.removePickable(mesh);
    });
  }

  setTerritorialModeActive(active) {
    this.isTerritorialActive = active;
    this.group.visible = active;
    this.tilesGroup.visible = active;
    this.tokensGroup.visible = active;
    this.couplingsGroup.visible = active;
    this.forceVisible = active;
    this.isVecinalModeActive = active;

    if (active) {
      this.registerPickables();
    } else {
      this.unregisterPickables();
    }
  }

  update(time) {
    // Si no estamos en modo territorial / panal, mantener 100% oculto e inactivo
    if (!this.isTerritorialActive) {
      if (this.group.visible) this.group.visible = false;
      if (this.tilesGroup.visible) this.tilesGroup.visible = false;
      if (this.tokensGroup.visible) this.tokensGroup.visible = false;
      if (this.couplingsGroup.visible) this.couplingsGroup.visible = false;
      return;
    }

    // 1. Lerp de elevación en casillas seleccionadas/hovered
    this.hexMeshMap.forEach((entry) => {
      entry.group.position.y += (entry.targetY - entry.group.position.y) * 0.12;
    });

    // 2. Billboarding de tokens Catan hacia la cámara
    const cam = this.mapManager?.camera;
    if (cam) {
      this.tokensGroup.children.forEach(token => {
        token.quaternion.copy(cam.quaternion);
      });

      // 3. Zoom Semántico Automático (Local ↔ Vecinal)
      const dist = cam.position.distanceTo(new THREE.Vector3(0, 0, 0));
      const shouldBeVecinal = (dist > 75.0);

      if (shouldBeVecinal !== this.isVecinalModeActive) {
        this.isVecinalModeActive = shouldBeVecinal;
        // Notifica a la UI si es necesario
        bus.emit('semantic_zoom:changed', {
          isVecinal: shouldBeVecinal,
          distance: dist
        });
      }
    }

    // 4. Ondulación de tubos de permacultura
    if (this.couplingsGroup) {
      const s = 1.0 + Math.sin(time * 0.003) * 0.05;
      this.couplingsGroup.scale.set(s, s, s);
    }
  }
}
