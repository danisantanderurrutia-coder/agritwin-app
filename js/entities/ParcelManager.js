/**
 * AgriTwin - ParcelManager Module (Tudor Farmhouse & Permaculture Overlay)
 * 
 * Features:
 *  - High-Detail Tudor Style Farmhouse (Terracotta tiled roof, dormer window, timber beams, chimney, solar panels, barrels & garden)
 *  - Optional Permaculture Zones 0-5 Overlay Projection (Toggle Layer)
 *  - Crop Quadrant Field Textures & Ribbons
 */

import { bus } from '../utils/EventBus.js';
import { MapManager } from '../map/MapManager.js';
import { PBRArchitecturalMaterialFactory } from '../map/PBRArchitecturalMaterialFactory.js';

export class ParcelManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.scene = mapManager.scene;
    this.parcelGroup = new THREE.Group();
    this.permacultureGroup = new THREE.Group();
    this.permacultureGroup.visible = false; // Off by default

    this.scene.add(this.parcelGroup);
    this.scene.add(this.permacultureGroup);
    this.visible = true;
    this.parcelMeshes = [];
    this.gltfLoader = (typeof THREE.GLTFLoader !== 'undefined') ? new THREE.GLTFLoader() : null;

    // Interaction & Animation state
    this.hoveredParcelMesh = null;
    this.selectedParcelMesh = null;

    bus.on('entity:selected', (e) => this.setSelectedParcel(e ? e.id : null));
    bus.on('entity:deselected', () => this.setSelectedParcel(null));
    bus.on('parcel:hover', (id) => this.setHoveredParcel(id));
    bus.on('parcel:unhover', () => this.setHoveredParcel(null));
    bus.on('environment:time_of_day', (env) => {
      if (this.porchLight) {
        this.porchLight.intensity = env.isNight ? 1.8 : 0.05;
      }
    });

    // Register smooth spring-damper Y-axis hover animation loop
    this.mapManager.addAnimated(this.parcelGroup, (time) => this.updateParcelAnimations(time));
  }

  async renderParcels(geojsonData) {
    geojsonData.features.forEach((feature) => {
      const props = feature.properties;
      const coordinates = feature.geometry.coordinates[0];

      const shapePoints = [];
      let centerSumX = 0;
      let centerSumZ = 0;

      coordinates.forEach(([lon, lat]) => {
        const v = MapManager.latLonToVector3(lon, lat);
        shapePoints.push(new THREE.Vector2(v.x, v.z));
        centerSumX += v.x;
        centerSumZ += v.z;
      });

      const centerX = centerSumX / coordinates.length;
      const centerZ = centerSumZ / coordinates.length;

      const shape = new THREE.Shape(shapePoints);
      const extrudeSettings = { depth: 0.6, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.2, bevelThickness: 0.2 };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.rotateX(Math.PI / 2);

      // Paleta agroecológica especializada por tipo de cuartel
      const cropType = props.cropType || '';
      let baseColor = '#15803d'; // Default verde follaje

      if (cropType === 'trigo') baseColor = '#ca8a04'; // Trigo dorado
      else if (cropType === 'agrovoltaico') baseColor = '#1e3a8a'; // Azul cobalto tecnológico
      else if (cropType === 'tranque') baseColor = '#0284c7'; // Azul hídrico
      else if (cropType === 'biofabrica') baseColor = '#059669'; // Verde biofábrica
      else if (cropType === 'vinedo') baseColor = '#6b21a8'; // Púrpura uva
      else if (cropType === 'cerezos') baseColor = '#991b1b'; // Carmesí cereza
      else if (cropType === 'olivos') baseColor = '#3f6212'; // Verde oliva
      else if (cropType === 'pradera') baseColor = '#16a34a'; // Verde esmeralda pradera
      else if (cropType === 'frutales') baseColor = '#d97706'; // Ámbar avellano
      else if (cropType === 'shiitake') baseColor = '#543818'; // Tierra sombría
      else if (cropType === 'nativo') baseColor = '#047857'; // Verde bosque nativo
      else if (cropType === 'forestal') baseColor = '#1e293b'; // Pizarra bosque biomasa

      const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.65,
        metalness: 0.08,
        transparent: true,
        opacity: 0.72,
        emissive: new THREE.Color(baseColor),
        emissiveIntensity: 0.08
      });

      const fieldMesh = new THREE.Mesh(geometry, material);
      fieldMesh.position.y = 0.45;
      fieldMesh.castShadow = true;
      fieldMesh.receiveShadow = true;

      // Civilization VI / Farming Sim: Glowing Outline Edge Geometry
      const edgeGeo = new THREE.EdgesGeometry(geometry, 28);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x34d399, // Vibrant emerald / neon contour
        transparent: true,
        opacity: 0.0,
        linewidth: 2
      });
      const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
      edgeLine.position.y = 0.02; // avoid z-fighting
      fieldMesh.add(edgeLine);

      const entityData = {
        type: 'parcel',
        id: `parcel_${props.id}`,
        name: `Parcela: ${props.name}`,
        parcelId: props.id,
        crop: props.crop,
        areaHa: props.area_ha,
        ndvi: props.ndvi,
        soilType: props.soil_type,
        irrigationType: props.irrigation_type,
        status: props.status
      };

      fieldMesh.userData = entityData;
      fieldMesh.userData.baseColor = baseColor;
      fieldMesh.userData.baseY = 0.45;
      fieldMesh.userData.targetY = 0.45;
      fieldMesh.userData.edgeLine = edgeLine;
      fieldMesh.userData.isHovered = false;
      fieldMesh.userData.isSelected = false;

      this.parcelGroup.add(fieldMesh);
      this.mapManager.addPickable(fieldMesh, entityData);
      this.parcelMeshes.push(fieldMesh);

      // Add High-Detail Tudor Main House for Predio Meniels (una sola vez)
      if (!this.houseAdded) {
        this.houseAdded = true;
        const houseEntityData = {
          type: 'house',
          id: 'house_main',
          name: 'Casa Principal - Predio Meniels',
          propertyName: 'Meniels',
          locationRegion: 'Parral, Región del Maule, Chile',
          coordinatesLabel: '36.14°S, 71.82°O',
          houseSizeM2: 180,
          occupants: 4
        };
        this.addDetailedTudorFarmhouse(-8, 8, houseEntityData);
      }

      // 3D Hex Badges eliminados a solicitud del usuario para realismo del predio
      // this.addCivVIHexBadge(centerX, centerZ, props.symbol || '🌾', entityData);
    });

    // Build Optional Permaculture Zones Overlay (0-5)
    this.renderPermacultureZones();

    this.currentRiskMode = 'none';

    bus.on('layer:parcels', (visible) => this.toggleVisibility(visible));
    bus.on('layer:permaculture', (visible) => this.togglePermacultureZones(visible));
    bus.on('risk:set_mode', (mode) => this.setRiskMode(mode));
    bus.on('sensor:telemetry_updated', () => {
      if (this.currentRiskMode !== 'none') {
        this.updateRiskOverlay();
      }
    });

    console.log(`Rendered Tudor Farmhouse & Permaculture Zones overlay with 3D Risk Layer support.`);
  }

  setRiskMode(mode) {
    this.currentRiskMode = mode;
    this.updateRiskOverlay();
  }

  updateRiskOverlay() {
    this.parcelMeshes.forEach(mesh => {
      const props = mesh.userData;
      if (!props) return;

      const pid = props.parcelId || '';

      if (this.currentRiskMode === 'none') {
        mesh.material.color.set(mesh.userData.baseColor || '#65a30d');
        mesh.material.opacity = 0.65;
      } else if (this.currentRiskMode === 'water') {
        // Diagnóstico Estrés Hídrico
        let moisture = 38;
        if (pid === 'B103' || pid === 'D101') moisture = 22; // Secano estrés
        else if (pid === 'B101' || pid === 'A101') moisture = 32; // Alerta moderada
        else if (pid === 'C103' || pid === 'A103') moisture = 75; // Saturado / Óptimo

        if (moisture < 25) {
          mesh.material.color.set('#ef4444'); // Rojo Crítico
          mesh.material.opacity = 0.88;
        } else if (moisture < 35) {
          mesh.material.color.set('#f59e0b'); // Ámbar Alerta
          mesh.material.opacity = 0.8;
        } else {
          mesh.material.color.set('#10b981'); // Esmeralda Óptimo
          mesh.material.opacity = 0.75;
        }
      } else if (this.currentRiskMode === 'frost') {
        // Diagnóstico Heladas Katabáticas (Fondos de estero y quebradas)
        let frostRisk = 'low';
        if (pid === 'C103' || pid === 'B102') frostRisk = 'high'; // Cerezos y Estero en el bajo
        else if (pid === 'A101' || pid === 'B101') frostRisk = 'moderate';

        if (frostRisk === 'high') {
          mesh.material.color.set('#38bdf8'); // Azul Hielo Crítico
          mesh.material.opacity = 0.92;
        } else if (frostRisk === 'moderate') {
          mesh.material.color.set('#818cf8'); // Violeta Alerta
          mesh.material.opacity = 0.8;
        } else {
          mesh.material.color.set('#059669'); // Seguro
          mesh.material.opacity = 0.65;
        }
      } else if (this.currentRiskMode === 'fire') {
        // Diagnóstico Riesgo Incendios Forestales (FWI & Combustible Rothermel)
        let fireRisk = 'low';
        if (pid === 'D101') fireRisk = 'critical'; // Monocultivo forestal de secano
        else if (pid === 'A101' || pid === 'B104') fireRisk = 'moderate'; // Pastizales / Rastrojo
        else if (pid === 'C103' || pid === 'A103') fireRisk = 'buffer'; // Corredor biológico / Tranque húmedo

        if (fireRisk === 'critical') {
          mesh.material.color.set('#dc2626'); // Rojo Fuego Crítico Rothermel
          mesh.material.opacity = 0.95;
        } else if (fireRisk === 'moderate') {
          mesh.material.color.set('#f97316'); // Naranja Alerta
          mesh.material.opacity = 0.85;
        } else if (fireRisk === 'buffer') {
          mesh.material.color.set('#047857'); // Verde Esmeralda Húmedo (Barrera Cortafuegos Natural)
          mesh.material.opacity = 0.9;
        } else {
          mesh.material.color.set('#10b981'); // Huertos regados protegidos
          mesh.material.opacity = 0.7;
        }
      } else if (this.currentRiskMode === 'ndvi') {
        // Rampa Sentinel-2 NDVI Satelital
        const ndvi = props.ndvi !== undefined ? props.ndvi : 0.68;
        if (ndvi < 0.35) {
          mesh.material.color.set('#b45309'); // Suelo desnudo / estrés severo (marrón ocre)
          mesh.material.opacity = 0.88;
        } else if (ndvi < 0.6) {
          mesh.material.color.set('#eab308'); // Vigor moderado (amarillo)
          mesh.material.opacity = 0.82;
        } else {
          mesh.material.color.set('#10b981'); // Vigor óptimo (verde esmeralda)
          mesh.material.opacity = 0.82;
        }
      }
    });
  }

  /**
   * Builds High-Detail Tudor Style Farmhouse with Realistic PBR Textures
   * (Artisan brick plinth, weathered timber beams, terracotta pantiles, chiseled stone chimney)
   */
  addDetailedTudorFarmhouse(x, z, entityData) {
    const houseGroup = new THREE.Group();
    houseGroup.position.set(x, 0.5, z);

    // PBR Material Suite
    const brickMat = PBRArchitecturalMaterialFactory.getBrickMaterial(3);
    const roofMat  = PBRArchitecturalMaterialFactory.getTerracottaRoofMaterial(4);
    const timberMat = PBRArchitecturalMaterialFactory.getTimberMaterial(2);
    const stoneMat  = PBRArchitecturalMaterialFactory.getStoneMasonryMaterial(2);

    // 1. Lower Level: Ground Floor Plinth in Exposed Artisan Brickwork
    const brickBaseGeo = new THREE.BoxGeometry(4.7, 1.3, 3.5);
    const brickBaseMesh = new THREE.Mesh(brickBaseGeo, brickMat);
    brickBaseMesh.position.y = 0.65;
    brickBaseMesh.castShadow = true;
    brickBaseMesh.receiveShadow = true;
    houseGroup.add(brickBaseMesh);

    // 2. Upper Level: Traditional Tudor Whitewashed Plaster Facade
    const upperWallGeo = new THREE.BoxGeometry(4.6, 1.4, 3.4);
    const plasterMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.85,
      metalness: 0.02
    });
    const upperWallMesh = new THREE.Mesh(upperWallGeo, plasterMat);
    upperWallMesh.position.y = 2.0;
    upperWallMesh.castShadow = true;
    upperWallMesh.receiveShadow = true;
    houseGroup.add(upperWallMesh);

    // 3. Exposed Heavy Oak Timber Framing (Vertical Studs & Horizontal Plates)
    // Horizontal Jetty Beam separating lower brick and upper floor
    const jettyBeamGeo = new THREE.BoxGeometry(4.74, 0.16, 3.54);
    const jettyBeam = new THREE.Mesh(jettyBeamGeo, timberMat);
    jettyBeam.position.y = 1.3;
    jettyBeam.castShadow = true;
    houseGroup.add(jettyBeam);

    // Vertical Timber Studs
    for (let bx = -2.25; bx <= 2.25; bx += 0.9) {
      const vBeamGeo = new THREE.BoxGeometry(0.14, 1.42, 3.46);
      const vBeamMesh = new THREE.Mesh(vBeamGeo, timberMat);
      vBeamMesh.position.set(bx, 2.0, 0);
      vBeamMesh.castShadow = true;
      houseGroup.add(vBeamMesh);
    }

    // Diagonal Tudor Knee Braces
    [-1.6, 1.6].forEach(dx => {
      const braceGeo = new THREE.BoxGeometry(0.12, 1.2, 0.08);
      const brace = new THREE.Mesh(braceGeo, timberMat);
      brace.position.set(dx, 2.0, 1.72);
      brace.rotation.z = (dx < 0 ? 1 : -1) * Math.PI / 4;
      houseGroup.add(brace);
    });

    // 4. Terracotta Curved Tile Gabled Roof (Dual Sloped Pitched Roof)
    const roofSlopeLGeo = new THREE.BoxGeometry(2.7, 0.14, 3.9);
    const roofSlopeL = new THREE.Mesh(roofSlopeLGeo, roofMat);
    roofSlopeL.position.set(-1.0, 3.5, 0);
    roofSlopeL.rotation.z = Math.PI / 5.2; // ~35 degree pitch
    roofSlopeL.castShadow = true;
    roofSlopeL.receiveShadow = true;
    houseGroup.add(roofSlopeL);

    const roofSlopeRGeo = new THREE.BoxGeometry(2.7, 0.14, 3.9);
    const roofSlopeR = new THREE.Mesh(roofSlopeRGeo, roofMat);
    roofSlopeR.position.set(1.0, 3.5, 0);
    roofSlopeR.rotation.z = -Math.PI / 5.2;
    roofSlopeR.castShadow = true;
    roofSlopeR.receiveShadow = true;
    houseGroup.add(roofSlopeR);

    // Roof Ridge Cap (Caballete de tejas)
    const ridgeCapGeo = new THREE.CylinderGeometry(0.14, 0.14, 4.0, 8);
    ridgeCapGeo.rotateX(Math.PI / 2);
    const ridgeCap = new THREE.Mesh(ridgeCapGeo, roofMat);
    ridgeCap.position.set(0, 4.35, 0);
    houseGroup.add(ridgeCap);

    // Dormer Window with Tiled Roof
    const dormerGeo = new THREE.ConeGeometry(1.2, 1.1, 4);
    const dormerMesh = new THREE.Mesh(dormerGeo, roofMat);
    dormerMesh.position.set(0, 3.8, 1.3);
    dormerMesh.rotation.y = Math.PI / 4;
    dormerMesh.castShadow = true;
    houseGroup.add(dormerMesh);

    // 5. Massive Chiseled Stone Chimney with Terracotta Clay Pots
    const chimneyGeo = new THREE.BoxGeometry(0.9, 4.8, 0.9);
    const chimneyMesh = new THREE.Mesh(chimneyGeo, stoneMat);
    chimneyMesh.position.set(-2.1, 2.7, -1.2);
    chimneyMesh.castShadow = true;
    chimneyMesh.receiveShadow = true;
    houseGroup.add(chimneyMesh);

    // Dual Chimney Clay Pots
    [-0.2, 0.2].forEach(offZ => {
      const potGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.6, 12);
      const potMesh = new THREE.Mesh(potGeo, roofMat);
      potMesh.position.set(-2.1, 5.25, -1.2 + offZ);
      potMesh.castShadow = true;
      houseGroup.add(potMesh);
    });

    // 6. Rooftop Solar Photovoltaic Array (12x High-Efficiency Monocrystalline Panels)
    const solarArrayGroup = new THREE.Group();
    const cellMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.85,
      roughness: 0.15
    });
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 6; c++) {
        const panelFrame = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.9), timberMat);
        const cellMesh = new THREE.Mesh(new THREE.BoxGeometry(0.51, 0.045, 0.86), cellMat);
        const singlePanel = new THREE.Group();
        singlePanel.add(panelFrame);
        singlePanel.add(cellMesh);

        singlePanel.position.set(-1.4 + c * 0.58, 3.5 + (1 - r) * 0.35, -0.6 + r * 1.0);
        singlePanel.rotation.x = -Math.PI / 5.5;
        solarArrayGroup.add(singlePanel);
      }
    }
    houseGroup.add(solarArrayGroup);

    // 7. Leaded Glass Windows with Diamond Pattern & Reflections
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#bfdbfe',
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85
    });
    // Ground Floor Front Windows
    [-1.2, 1.4].forEach(wx => {
      const winGeo = new THREE.BoxGeometry(0.8, 0.7, 0.08);
      const winMesh = new THREE.Mesh(winGeo, glassMat);
      winMesh.position.set(wx, 0.85, 1.76);
      houseGroup.add(winMesh);

      // Wooden Window Frame
      const frameGeo = new THREE.BoxGeometry(0.88, 0.78, 0.06);
      const frameMesh = new THREE.Mesh(frameGeo, timberMat);
      frameMesh.position.set(wx, 0.85, 1.74);
      houseGroup.add(frameMesh);
    });

    // 8. Heavy Plank Oak Door with Forged Iron Hardware
    const doorGeo = new THREE.BoxGeometry(0.9, 1.7, 0.1);
    const doorMesh = new THREE.Mesh(doorGeo, timberMat);
    doorMesh.position.set(0.1, 0.85, 1.73);
    houseGroup.add(doorMesh);

    // Forged Iron Latch
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.16);
    const ironMat = new THREE.MeshStandardMaterial({ color: '#18181b', metalness: 0.9, roughness: 0.3 });
    const handleMesh = new THREE.Mesh(handleGeo, ironMat);
    handleMesh.position.set(0.42, 0.85, 1.8);
    houseGroup.add(handleMesh);

    // 9. Rainwater Harvesting Oak Barrel with Iron Hoops
    const barrelGeo = new THREE.CylinderGeometry(0.42, 0.46, 1.05, 14);
    const barrelMesh = new THREE.Mesh(barrelGeo, timberMat);
    barrelMesh.position.set(2.4, 0.52, 1.5);
    barrelMesh.castShadow = true;
    houseGroup.add(barrelMesh);

    // Barrel Iron Rings
    [-0.3, 0.3].forEach(ringY => {
      const ringGeo = new THREE.TorusGeometry(0.45, 0.02, 8, 16);
      ringGeo.rotateX(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeo, ironMat);
      ringMesh.position.set(2.4, 0.52 + ringY, 1.5);
      houseGroup.add(ringMesh);
    });

    // 10. Rustic Porch Barn Lantern (GLTF AnisotropyBarnLamp.glb) with Warm Amber Point Light
    if (this.gltfLoader) {
      this.gltfLoader.load(
        'assets/models/AnisotropyBarnLamp.glb',
        (gltf) => {
          const lamp = gltf.scene;
          lamp.name = 'tudor_porch_barn_lamp';
          lamp.position.set(-0.55, 1.85, 1.76);
          lamp.scale.set(3.2, 3.2, 3.2);
          lamp.rotation.y = Math.PI;

          lamp.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // Warm ambient porch illumination
          const porchLight = new THREE.PointLight(0xfbbf24, 1.6, 14, 1.6);
          porchLight.position.set(-0.55, 1.75, 1.95);
          porchLight.castShadow = true;
          porchLight.shadow.bias = -0.002;
          this.porchLight = porchLight;
          houseGroup.add(porchLight);
          houseGroup.add(lamp);

          console.log('💡 Tudor Porch Barn Lamp loaded: AnisotropyBarnLamp.glb');
        },
        undefined,
        (err) => console.warn('Could not load AnisotropyBarnLamp.glb:', err)
      );
    }

    houseGroup.userData = entityData;
    this.parcelGroup.add(houseGroup);

    // Enable raycasting picking on all house elements
    this.mapManager.addPickable(brickBaseMesh, entityData);
    this.mapManager.addPickable(roofSlopeL, entityData);
    this.mapManager.addPickable(roofSlopeR, entityData);
    houseGroup.traverse((child) => {
      if (child.isMesh) {
        this.mapManager.addPickable(child, entityData);
      }
    });
  }

  /**
   * Renders optional Permaculture Zones overlay projection (Zonas 0-5)
   */
  renderPermacultureZones() {
    const zones = [
      { name: 'Zona 0 - Casa Meniels', radius: 6, color: '#f8fafc', opacity: 0.35, y: 0.5 },
      { name: 'Zona 1 - Huerto Intensivo', radius: 14, color: '#facc15', opacity: 0.25, y: 0.48 },
      { name: 'Zona 2 - Frutales & Hongos', radius: 24, color: '#a3e635', opacity: 0.22, y: 0.46 },
      { name: 'Zona 3 - Cereales Trigo', radius: 36, color: '#eab308', opacity: 0.20, y: 0.44 },
      { name: 'Zona 4 - Silvicultura Biomasa', radius: 48, color: '#b45309', opacity: 0.18, y: 0.42 },
      { name: 'Zona 5 - Reserva Estero Colliguay', radius: 60, color: '#0284c7', opacity: 0.18, y: 0.40 }
    ];

    zones.forEach(z => {
      const ringGeo = new THREE.RingGeometry(z.radius - 3, z.radius, 48);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: z.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: z.opacity
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(-8, z.y, 8);
      this.permacultureGroup.add(ringMesh);
    });
  }

  addCivVIHexBadge(x, z, symbol, entityData) {
    const hexGroup = new THREE.Group();
    hexGroup.position.set(x, 6.5, z);

    const outerGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.35, 6);
    const outerMat = new THREE.MeshStandardMaterial({ color: '#b45309', metalness: 0.8, roughness: 0.2, flatShading: true });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.castShadow = true;
    hexGroup.add(outerMesh);

    const innerGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.38, 6);
    const innerMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.3, flatShading: true });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    hexGroup.add(innerMesh);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#27272a';
    ctx.fillRect(0, 0, 128, 128);
    ctx.font = '72px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const topGeo = new THREE.CircleGeometry(1.2, 6);
    topGeo.rotateX(-Math.PI / 2);
    const topMat = new THREE.MeshBasicMaterial({ map: texture });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 0.20;
    hexGroup.add(topMesh);

    this.parcelGroup.add(hexGroup);
    this.mapManager.addPickable(outerMesh, entityData);

    this.mapManager.addAnimated(hexGroup, (time) => {
      hexGroup.position.y = 6.5 + Math.sin(time * 0.003 + x) * 0.35;
      hexGroup.rotation.y = Math.sin(time * 0.001) * 0.12;
    });
  }

  setHoveredParcel(parcelId) {
    this.parcelMeshes.forEach(m => {
      const isThis = m.userData && (m.userData.id === parcelId || m.userData.parcelId === parcelId);
      m.userData.isHovered = isThis;
      if (!m.userData.isSelected) {
        m.userData.targetY = isThis ? m.userData.baseY + 0.85 : m.userData.baseY;
      }
    });
  }

  setSelectedParcel(parcelId) {
    this.parcelMeshes.forEach(m => {
      const isThis = parcelId && m.userData && (m.userData.id === parcelId || m.userData.parcelId === parcelId);
      m.userData.isSelected = !!isThis;
      m.userData.targetY = isThis ? m.userData.baseY + 1.25 : (m.userData.isHovered ? m.userData.baseY + 0.85 : m.userData.baseY);
    });
  }

  updateParcelAnimations(time) {
    if (!this.parcelMeshes.length) return;

    for (let i = 0; i < this.parcelMeshes.length; i++) {
      const m = this.parcelMeshes[i];
      const targetY = m.userData.targetY || m.userData.baseY || 0.45;

      // Spring-lerp Y-axis position (Civilization VI hover elevation)
      m.position.y += (targetY - m.position.y) * 0.14;

      // Glowing outline & emissive pulsing
      const isElevated = m.userData.isSelected || m.userData.isHovered;
      if (m.userData.edgeLine) {
        if (isElevated) {
          m.userData.edgeLine.visible = true;
          const pulse = m.userData.isSelected
            ? 0.7 + 0.3 * Math.sin(time * 0.007)
            : 0.55;
          m.userData.edgeLine.material.opacity = pulse;
          m.userData.edgeLine.material.color.set(m.userData.isSelected ? 0xfbbf24 : 0x34d399);

          // Emissive rim glow
          if (m.material) {
            m.material.emissiveIntensity = m.userData.isSelected ? 0.32 + 0.12 * Math.sin(time * 0.007) : 0.22;
          }
        } else {
          m.userData.edgeLine.visible = false;
          if (m.material) {
            m.material.emissiveIntensity = 0.08;
          }
        }
      }
    }
  }

  togglePermacultureZones(visible) {
    this.permacultureGroup.visible = visible;
  }

  toggleVisibility(visible) {
    this.visible = visible;
    this.parcelGroup.visible = visible;
  }
}
