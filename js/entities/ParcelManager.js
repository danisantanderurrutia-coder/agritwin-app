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

export class ParcelManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.scene = mapManager.scene;
    this.parcelGroup = new THREE.Group();
    this.permacultureGroup = new THREE.Group();
    this.permacultureGroup.visible = false; // Off by default

    this.scene.add(this.parcelGroup);
    this.scene.add(this.permacultureGroup);
    this.visible = false; // Desactivado por defecto para visión limpia y fotorrealista
    this.parcelGroup.visible = false;
    this.parcelMeshes = [];
    this.gltfLoader = (typeof THREE.GLTFLoader !== 'undefined') ? new THREE.GLTFLoader() : null;

    // Interaction & Animation state
    this.hoveredParcelMesh = null;
    this.selectedParcelMesh = null;

    bus.on('entity:selected', (e) => this.setSelectedParcel(e ? e.id : null));
    bus.on('entity:deselected', () => this.setSelectedParcel(null));
    bus.on('parcel:hover', (id) => this.setHoveredParcel(id));
    bus.on('parcel:unhover', () => this.setHoveredParcel(null));

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
      else if (cropType === 'agrovoltaico') baseColor = '#16a34a'; // Pradera natural verde
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
        roughness: 0.88,
        metalness: 0.02,
        transparent: true,
        opacity: 0.48,
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0.0
      });

      const fieldMesh = new THREE.Mesh(geometry, material);
      const baseElev = this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(centerX, centerZ) : 0.45;
      fieldMesh.position.y = baseElev + 0.08;
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
   * Builds Main Farmhouse (FarmHouse.glb - Camino 2 real 3D model)
   * Connected directly to drawer inspection and metabolism dashboard.
   */
  addDetailedTudorFarmhouse(x, z, entityData) {
    const houseGroup = new THREE.Group();
    const elev = this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(x, z) : 0.45;
    houseGroup.position.set(x, elev, z);
    houseGroup.userData = entityData;
    this.houseGroup = houseGroup;
    this.scene.add(houseGroup); // Añadido directamente a la escena para que la casa realista siempre se vea

    if (this.gltfLoader) {
      this.gltfLoader.load(
        'assets/models/FarmHouse.glb',
        (gltf) => {
          const house = gltf.scene;
          house.scale.set(0.24, 0.24, 0.24); // Extent is ~25m -> scale to ~6.0m realistic farmhouse
          house.rotation.y = Math.PI / 4;
          house.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.roughness = 0.75;
                child.material.metalness = 0.05;
              }
              this.mapManager.addPickable(child, entityData);
            }
          });
          houseGroup.add(house);
          console.log('🏡 Casa Principal (FarmHouse.glb) conectada con éxito al panel interactivo.');
        },
        undefined,
        (err) => {
          console.warn('⚠️ Error loading FarmHouse.glb, fallback to procedural house:', err);
          this._buildProceduralHouse(houseGroup, entityData);
        }
      );
    } else {
      this._buildProceduralHouse(houseGroup, entityData);
    }
  }

  _buildProceduralHouse(houseGroup, entityData) {
    const wallGeo = new THREE.BoxGeometry(4.6, 2.6, 3.4);
    const wallMat = new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 0.8, flatShading: true });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = 1.3;
    wallMesh.castShadow = true;
    houseGroup.add(wallMesh);

    const roofGeo = new THREE.ConeGeometry(4.0, 2.4, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.8, flatShading: true });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = 3.8;
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.castShadow = true;
    houseGroup.add(roofMesh);

    houseGroup.traverse((child) => {
      if (child.isMesh) this.mapManager.addPickable(child, entityData);
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
