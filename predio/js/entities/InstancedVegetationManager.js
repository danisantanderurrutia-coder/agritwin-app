/**
 * AgriTwin 3D - InstancedVegetationManager Module
 * High-Performance Single-Draw-Call Instanced Rendering for Vegetation & Machinery
 * 
 * Inspired by Civilization VI & Farming Simulator:
 * - Native Sclerophyllous Trees (Quillay, Boldo, Maitén) with stylized multi-layered canopies
 * - Commercial Vineyards in Espaldera (Vitis vinifera) & Cherry Orchards
 * - Agricultural Machinery (PBR Precision Tractor)
 * - Single Draw Call per species using THREE.InstancedMesh
 * - Per-instance matrix transforms (scale/rotation jitter) and NDVI color modulation
 * - GLTF/GLB Loader pipeline with seamless procedural high-fidelity fallback
 */

import { MapManager } from '../map/MapManager.js';

export class InstancedVegetationManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.scene = mapManager.scene;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'instancedVegetationGroup';
    this.scene.add(this.rootGroup);

    // Instanced mesh registry
    this.instancedMeshes = new Map();
    this.instanceMetadata = new Map(); // meshName -> Array of entity data by instanceId

    // GLTF Loader reference
    this.gltfLoader = (typeof THREE.GLTFLoader !== 'undefined') ? new THREE.GLTFLoader() : null;
    this.loadedModels = new Map();
  }

  /**
   * Initializes all vegetation and infrastructure instances from dataset.
   * 
   * @param {Array} treesData - JSON data of individual trees/plantations
   * @param {Object} options - Custom spawn counts & row options
   */
  async buildVegetation(treesData = [], options = {}) {
    this.clear();

    // 1. Native Forest Trees (Quillay / Boldo / Maitén)
    await this.buildNativeTreesInstances(treesData);

    // 2. Vineyard Trellises (Organic natural foliage and wooden posts)
    this.buildVineyardInstances(options.vineyardRows || 36);

    // 3. Cherry & Nut Fruit Orchards
    this.buildOrchardInstances(options.orchardRows || 24);

    // 4. Agricultural Machinery (Tractor PBR / Cesium Milk Truck)
    this.buildMachineryInstances();

    // 5. Camino 2: Real GLB Farmstead Models (Barn, Silo, Shed, Windmill, Haystacks, MilkTruck)
    this.loadRealFarmGLBModels();

    // 6. Volumetric 3D Grass Tufts (Pasto y Pradera Regenerativa - Pastoreo y Bordes)
    this.buildDenseGrassTuftsInstances(options.grassCount || 1600);

    // 7. Real 3D Foliage Trees (OakTree.glb y PineTree.glb en bosques y cortinas)
    this.loadReal3DTreesInstances();

    console.log(`🌲 InstancedVegetationManager: Dispatched multi-species InstancedMesh with 3D Grass & Real GLB Trees.`);
  }

  /**
   * Builds high-detail native tree instances using real 3D GLB models (OakTree.glb & PineTree.glb)
   */
  async buildNativeTreesInstances(treesData) {
    if (!this.gltfLoader) {
      this._buildProceduralNativeTrees(treesData);
      return;
    }

    const treesGroup = new THREE.Group();
    treesGroup.name = 'nativeForestGLBGroup';
    this.rootGroup.add(treesGroup);

    const getElev = (x, z) => this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(x, z) : 0.45;

    // Load OakTree as default lush deciduous/sclerophyllous tree
    this.gltfLoader.load('assets/models/OakTree.glb', (gltf) => {
      const baseOak = gltf.scene;
      baseOak.traverse(c => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });

      treesData.forEach((crop, idx) => {
        const sp = (crop.species || '').toLowerCase();
        const cat = (crop.cropCategory || '').toLowerCase();
        if (sp.includes('water basin') || sp.includes('tranque') || sp.includes('embalse') ||
            sp.includes('agrivoltaic') || sp.includes('biofactory') || sp.includes('biofábrica') ||
            cat.includes('hídrica') || cat.includes('infraestructura')) {
          return;
        }

        const pos = MapManager.latLonToVector3(crop.location.longitude, crop.location.latitude);
        const oak = baseOak.clone(true);
        const elev = getElev(pos.x, pos.z);
        const scale = (crop.heightMeters ? crop.heightMeters / 13.0 : 0.8) * 0.28 * (0.85 + Math.random() * 0.3);
        oak.position.set(pos.x, elev, pos.z);
        oak.scale.set(scale, scale, scale);
        oak.rotation.y = Math.random() * Math.PI * 2;
        treesGroup.add(oak);

        const meta = {
          type: 'crop',
          id: crop.id || `tree_${idx}`,
          name: `${crop.species || 'Nativo'} (${crop.variety || 'Esclerófilo'})`,
          species: crop.species,
          variety: crop.variety,
          cropCategory: crop.cropCategory || 'Nativo',
          heightMeters: crop.heightMeters || 9.5
        };
        oak.traverse(c => {
          if (c.isMesh) this.mapManager.addPickable(c, meta);
        });
      });

      // Extra river buffer trees
      for (let i = 0; i < 40; i++) {
        const z = (Math.random() - 0.5) * 150;
        const rx = -18.0 + Math.sin(z * 0.045) * 8.0 + (Math.random() - 0.5) * 12.0;
        const elev = getElev(rx, z);
        const oak = baseOak.clone(true);
        const scale = 0.22 + Math.random() * 0.12;
        oak.position.set(rx, elev, z);
        oak.scale.set(scale, scale, scale);
        oak.rotation.y = Math.random() * Math.PI * 2;
        treesGroup.add(oak);
      }
      console.log('🌲 Árboles nativos actualizados a modelos 3D frondosos reales (OakTree.glb).');
    }, undefined, () => this._buildProceduralNativeTrees(treesData));
  }

  _buildProceduralNativeTrees(treesData) {
    const treeGeo = this.createStylizedNativeTreeGeometry();
    const treeMat = new THREE.MeshStandardMaterial({ roughness: 0.72, metalness: 0.05, flatShading: true, vertexColors: true });
    const totalInstances = Math.max(treesData.length + 40, 120);
    const instMesh = new THREE.InstancedMesh(treeGeo, treeMat, totalInstances);
    instMesh.name = 'instanced_native_trees';
    instMesh.castShadow = true;
    instMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const metadataList = [];
    const color = new THREE.Color();
    let instanceIdx = 0;

    treesData.forEach((crop) => {
      if (instanceIdx >= totalInstances) return;
      const pos = MapManager.latLonToVector3(crop.location.longitude, crop.location.latitude);
      const elev = this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(pos.x, pos.z) : 0.45;
      const scale = (crop.heightMeters ? crop.heightMeters / 9.0 : 1.0) * (0.85 + Math.random() * 0.3);
      dummy.position.set(pos.x, elev, pos.z);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      instMesh.setMatrixAt(instanceIdx, dummy.matrix);
      color.set('#166534');
      instMesh.setColorAt(instanceIdx, color);
      instanceIdx++;
    });

    instMesh.instanceMatrix.needsUpdate = true;
    if (instMesh.instanceColor) instMesh.instanceColor.needsUpdate = true;
    this.rootGroup.add(instMesh);
    this.instancedMeshes.set('native_trees', instMesh);
  }

  /**
   * Stylized Native Tree Geometry: trunk + layered faceted canopies
   */
  createStylizedNativeTreeGeometry() {
    const geometries = [];

    // 1. Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 3.8, 6);
    trunkGeo.translate(0, 1.9, 0);
    this._bakeColorToGeometry(trunkGeo, new THREE.Color('#451a03'));
    geometries.push(trunkGeo);

    // 2. Lower main canopy (large dodecahedron)
    const c1 = new THREE.DodecahedronGeometry(2.4, 1);
    c1.translate(0, 4.4, 0);
    this._bakeColorToGeometry(c1, new THREE.Color('#166534'));
    geometries.push(c1);

    // 3. Upper crown foliage cluster
    const c2 = new THREE.DodecahedronGeometry(1.8, 1);
    c2.translate(0.5, 5.8, -0.3);
    this._bakeColorToGeometry(c2, new THREE.Color('#15803d'));
    geometries.push(c2);

    // 4. Accent side foliage cluster
    const c3 = new THREE.DodecahedronGeometry(1.4, 1);
    c3.translate(-0.7, 4.8, 0.5);
    this._bakeColorToGeometry(c3, new THREE.Color('#14532d'));
    geometries.push(c3);

    return this.mergeBufferGeometriesSimple(geometries);
  }

  /**
    * Vineyard Trellis Row Instancing (Precision Farming style with natural organic foliage)
    */
  buildVineyardInstances(rowCount = 36) {
    const vineGeo = this.createVineyardTrellisGeometry();
    const vineMat = new THREE.MeshStandardMaterial({
      roughness: 0.65,
      metalness: 0.08,
      vertexColors: true
    });

    const instMesh = new THREE.InstancedMesh(vineGeo, vineMat, rowCount);
    instMesh.name = 'instanced_vineyards';
    instMesh.castShadow = true;
    instMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const metadataList = [];
    const color = new THREE.Color(1, 1, 1);

    const startX = 14;
    const startZ = -18;
    const spacingX = 2.4;

    for (let i = 0; i < rowCount; i++) {
      const x = startX + (i % 6) * spacingX;
      const z = startZ + Math.floor(i / 6) * 5.2;
      const elev = this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(x, z) : 0.45;

      dummy.position.set(x, elev, z);
      dummy.rotation.y = 0.05;
      dummy.scale.set(1.0, 1.0, 1.0);
      dummy.updateMatrix();

      instMesh.setMatrixAt(i, dummy.matrix);

      // Keep natural vertex colors intact (do not tint blue/purple)
      color.setRGB(1.0, 1.0, 1.0);
      instMesh.setColorAt(i, color);

      metadataList.push({
        type: 'crop',
        id: `vine_row_${i}`,
        name: `Hilera Viñedo Carménère / Carignan #${i + 1}`,
        species: 'Vitis vinifera',
        variety: 'Espaldera Doble Guyot',
        cropCategory: 'Frutícola Comercial'
      });
    }

    instMesh.instanceMatrix.needsUpdate = true;
    if (instMesh.instanceColor) instMesh.instanceColor.needsUpdate = true;

    this.rootGroup.add(instMesh);
    this.instancedMeshes.set('vineyards', instMesh);
    this.instanceMetadata.set('vineyards', metadataList);

    this.mapManager.addPickable(instMesh, {
      type: 'instanced_group',
      groupKey: 'vineyards',
      metadataList
    });
  }

  createVineyardTrellisGeometry() {
    const geometries = [];

    // Wooden end posts (natural rustic wood)
    [-2.2, 0, 2.2].forEach(px => {
      const post = new THREE.CylinderGeometry(0.08, 0.1, 2.0, 6);
      post.translate(px, 1.0, 0);
      this._bakeColorToGeometry(post, new THREE.Color('#5c3a21'));
      geometries.push(post);
    });

    // Steel tension wire (fine metallic wire, not thick boxes)
    [1.1, 1.7].forEach(wy => {
      const wire = new THREE.CylinderGeometry(0.015, 0.015, 4.6, 5);
      wire.rotateZ(Math.PI / 2);
      wire.translate(0, wy, 0);
      this._bakeColorToGeometry(wire, new THREE.Color('#cbd5e1'));
      geometries.push(wire);
    });

    // Organic rounded vine foliage clusters (NO rectangular box geometry!)
    for (let f = -1.9; f <= 1.9; f += 0.76) {
      const r = 0.48 + (Math.sin(f * 3.7) * 0.08);
      const clump = new THREE.DodecahedronGeometry(r, 1);
      clump.translate(f, 1.25 + (Math.cos(f * 2.1) * 0.08), (Math.sin(f * 5.1) * 0.06));
      // Lush agricultural vine greens
      const leafColor = (Math.abs(f) < 1.0) ? new THREE.Color('#15803d') : new THREE.Color('#166534');
      this._bakeColorToGeometry(clump, leafColor);
      geometries.push(clump);
    }

    // Grape clusters (small organic accent dots under canopy)
    for (let g = 0; g < 4; g++) {
      const grape = new THREE.SphereGeometry(0.14, 5, 4);
      grape.translate(-1.4 + g * 0.95, 0.75, 0.22);
      this._bakeColorToGeometry(grape, new THREE.Color('#581c87'));
      geometries.push(grape);
    }

    return this.mergeBufferGeometriesSimple(geometries);
  }

  /**
   * Real 3D Orchard Fruit Trees (Cerezos Lapins / Avellanos) using OakTree.glb
   */
  buildOrchardInstances(count = 24) {
    if (!this.gltfLoader) return;

    const orchardGroup = new THREE.Group();
    orchardGroup.name = 'orchardGLBGroup';
    this.rootGroup.add(orchardGroup);

    const getElev = (x, z) => this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(x, z) : 0.45;

    this.gltfLoader.load('assets/models/OakTree.glb', (gltf) => {
      const baseTree = gltf.scene;
      baseTree.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });

      const startX = 16;
      const startZ = 12;

      for (let i = 0; i < count; i++) {
        const x = startX + (i % 6) * 3.8;
        const z = startZ + Math.floor(i / 6) * 4.2;
        const elev = getElev(x, z);

        const tree = baseTree.clone(true);
        // Escala ~2.2 - 2.5m (árbol frutal podado de huerto comercial)
        const scale = 0.17 + (i % 3) * 0.02;
        tree.position.set(x, elev, z);
        tree.scale.set(scale, scale, scale);
        tree.rotation.y = (i * 0.6);

        const meta = {
          type: 'crop',
          id: `orchard_tree_${i}`,
          name: `Cerezo Lapins / Avellano Europeo #${i + 1}`,
          species: 'Prunus avium / Corylus avellana',
          variety: 'Microaspersión Antiescarcha',
          cropCategory: 'Frutal de Exportación'
        };
        tree.traverse((c) => {
          if (c.isMesh) this.mapManager.addPickable(c, meta);
        });
        orchardGroup.add(tree);
      }
      console.log('🍎 Huerto frutal actualizado a modelos 3D frondosos reales (OakTree.glb).');
    });
  }

  /**
   * PBR Agricultural Machinery (Tractors removed per user request)
   */
  buildMachineryInstances() {
    // Tractors removed as requested by user
  }

  /**
   * Detailed Agricultural 4x4 Double-Cab Pickup Truck (Toyota Hilux / Mitsubishi L200)
   */
  createAgriculturalPickupTruck4x4() {
    const truck = new THREE.Group();

    // 1. Double Cab & Hood (Toyota White / Farm Cream)
    const cabMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.35, metalness: 0.4 });
    const cabGeo = new THREE.BoxGeometry(1.8, 1.05, 1.9);
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 1.25, -0.15);
    cab.castShadow = true;
    truck.add(cab);

    // Front Engine Bonnet
    const hoodGeo = new THREE.BoxGeometry(1.76, 0.65, 1.4);
    const hood = new THREE.Mesh(hoodGeo, cabMat);
    hood.position.set(0, 0.95, 1.35);
    hood.castShadow = true;
    truck.add(hood);

    // Dark Tinted Windows (Windshield, Rear, Sides)
    const glassMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1, metalness: 0.85 });
    const windGeo = new THREE.BoxGeometry(1.68, 0.65, 0.08);
    const wind = new THREE.Mesh(windGeo, glassMat);
    wind.position.set(0, 1.38, 0.82);
    wind.rotation.x = -Math.PI / 7;
    truck.add(wind);

    const sideGlassGeo = new THREE.BoxGeometry(1.84, 0.45, 1.3);
    const sideGlass = new THREE.Mesh(sideGlassGeo, glassMat);
    sideGlass.position.set(0, 1.42, -0.15);
    truck.add(sideGlass);

    // 2. Pickup Cargo Bed (Caja de Carga con portalón)
    const bedWallMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.4 });
    const bedFloorMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.8 }); // Bedliner negro

    const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.15, 1.6), bedFloorMat);
    bedFloor.position.set(0, 0.75, -1.75);
    truck.add(bedFloor);

    // Left and Right Cargo Walls
    [-0.84, 0.84].forEach(bx => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 1.6), bedWallMat);
      wall.position.set(bx, 1.0, -1.75);
      wall.castShadow = true;
      truck.add(wall);
    });

    // Tailgate
    const tailgate = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.55, 0.12), bedWallMat);
    tailgate.position.set(0, 1.0, -2.55);
    tailgate.castShadow = true;
    truck.add(tailgate);

    // 3. Roll Bar (Barra antivuelco cromada) & Tool Chest
    const barMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.9, roughness: 0.15 });
    [-0.75, 0.75].forEach(rx => {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.85, 8), barMat);
      bar.position.set(rx, 1.5, -1.05);
      truck.add(bar);
    });
    const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.55, 8), barMat);
    topBar.rotation.z = Math.PI / 2;
    topBar.position.set(0, 1.9, -1.05);
    truck.add(topBar);

    // 4. Heavy-Duty All-Terrain Wheels & Steel Rims
    const tireMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.7, roughness: 0.3 });

    [
      [-0.92, 1.15],
      [0.92,  1.15],
      [-0.92, -1.65],
      [0.92,  -1.65]
    ].forEach(([wx, wz]) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(wx, 0.42, wz);

      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.32, 14), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.34, 10), rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      truck.add(wheelGroup);
    });

    // 5. Front Bumper & Bull Bar
    const bumperMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.6 });
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.28, 0.3), bumperMat);
    bumper.position.set(0, 0.55, 2.1);
    truck.add(bumper);

    // Headlights (LED)
    [-0.65, 0.65].forEach(hx => {
      const headlight = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.16, 0.06),
        new THREE.MeshStandardMaterial({ color: '#fef08a', emissive: new THREE.Color('#fef08a'), emissiveIntensity: 0.6 })
      );
      headlight.position.set(hx, 0.95, 2.06);
      truck.add(headlight);
    });

    truck.scale.set(0.85, 0.85, 0.85);
    return truck;
  }

  // ─── Geometry Utilities ──────────────────────────────────────────────────────

  _bakeColorToGeometry(geometry, color) {
    const pos = geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      colors[i * 3]     = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }

  mergeBufferGeometriesSimple(geometries) {
    let totalPositions = 0;
    let totalNormals = 0;
    let totalColors = 0;

    geometries.forEach(g => {
      totalPositions += g.attributes.position.array.length;
      if (g.attributes.normal) totalNormals += g.attributes.normal.array.length;
      if (g.attributes.color)  totalColors += g.attributes.color.array.length;
    });

    const mergedPositions = new Float32Array(totalPositions);
    const mergedNormals = new Float32Array(totalNormals);
    const mergedColors = new Float32Array(totalColors);

    let posOffset = 0;
    let normOffset = 0;
    let colOffset = 0;

    geometries.forEach(g => {
      const p = g.attributes.position.array;
      mergedPositions.set(p, posOffset);
      posOffset += p.length;

      if (g.attributes.normal) {
        const n = g.attributes.normal.array;
        mergedNormals.set(n, normOffset);
        normOffset += n.length;
      }

      if (g.attributes.color) {
        const c = g.attributes.color.array;
        mergedColors.set(c, colOffset);
        colOffset += c.length;
      }
    });

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(mergedPositions, 3));
    if (totalNormals > 0) merged.setAttribute('normal', new THREE.BufferAttribute(mergedNormals, 3));
    if (totalColors > 0)  merged.setAttribute('color', new THREE.BufferAttribute(mergedColors, 3));

    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Loads real low-poly GLB models (Camino 2: Civilization VI / Living Farmstead Diorama)
   * Integrates Barn, SmallBarn, Silo, Windmill, Haystacks, and Milk Truck.
   */
  loadRealFarmGLBModels() {
    if (!this.gltfLoader) {
      console.warn('⚠️ GLTFLoader not available on THREE, skipping real farmstead GLBs');
      return;
    }

    const farmGroup = new THREE.Group();
    farmGroup.name = 'realFarmsteadGLBGroup';
    this.rootGroup.add(farmGroup);
    this.farmsteadGroup = farmGroup;

    const getElev = (x, z, offset = 0.0) => {
      const base = this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(x, z) : 0.45;
      return base + offset;
    };

    // Helper to configure shadows and metadata recursively
    const setupModel = (model, meta) => {
      model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.roughness = Math.max(0.4, child.material.roughness || 0.6);
          }
          if (meta) {
            this.mapManager.addPickable(child, meta);
          }
        }
      });
      if (meta) model.userData = meta;
    };

    // 1. Granero Principal (Barn.glb)
    this.gltfLoader.load('assets/models/Barn.glb', (gltf) => {
      const barn = gltf.scene;
      const x = -13.5, z = 10.5;
      barn.position.set(x, getElev(x, z, 0.05), z);
      barn.scale.set(0.55, 0.55, 0.55);
      barn.rotation.y = -Math.PI / 12;
      setupModel(barn, {
        type: 'infrastructure',
        id: 'granero_principal',
        name: 'Granero de Acopio & Secado Tradicional',
        spec: 'Madera de Roble & Techo Galvalume • Capacidad: 450 Fardos / 30 Toneladas',
        telemetry: 'Humedad relativa interior: 42% • Temperatura: 18.5°C'
      });
      farmGroup.add(barn);
      console.log('🌾 Granero Principal (Barn.glb) cargado con éxito en el predio.');
    }, undefined, (err) => console.warn('Error loading Barn.glb:', err));

    // 2. Silo de Granos Vertical (Silo.glb)
    this.gltfLoader.load('assets/models/Silo.glb', (gltf) => {
      const silo = gltf.scene;
      const x = -18.2, z = 12.0;
      silo.position.set(x, getElev(x, z, 0.05), z);
      silo.scale.set(0.65, 0.65, 0.65);
      setupModel(silo, {
        type: 'infrastructure',
        id: 'silo_granos',
        name: 'Silo Vertical de Almacenamiento de Granos',
        spec: 'Acero Galvanizado Corrugado • Altura: 6.8m • Capacidad: 25 Toneladas',
        telemetry: 'Nivel actual: 68% • Grano: Avena & Maíz rolado para forraje PRV'
      });
      farmGroup.add(silo);
      console.log('🌾 Silo de Granos (Silo.glb) cargado con éxito.');
    }, undefined, (err) => console.warn('Error loading Silo.glb:', err));

    // 3. Cobertizo de Aperos / Taller (SmallBarn.glb)
    this.gltfLoader.load('assets/models/SmallBarn.glb', (gltf) => {
      const shed = gltf.scene;
      const x = -17.5, z = 6.2;
      shed.position.set(x, getElev(x, z, 0.05), z);
      shed.scale.set(0.50, 0.50, 0.50);
      shed.rotation.y = Math.PI / 6;
      setupModel(shed, {
        type: 'infrastructure',
        id: 'galpon_herramientas',
        name: 'Galpón de Herramientas & Taller Rústico',
        spec: 'Banco de Taller, Soldadura Solar, Sala de Bombas y Filtros de Riego',
        telemetry: 'Herramientas operativas: 100% • Generador de emergencia: Listo'
      });
      farmGroup.add(shed);
      console.log('🌾 Galpón de Aperos (SmallBarn.glb) cargado con éxito.');
    }, undefined, (err) => console.warn('Error loading SmallBarn.glb:', err));

    // 4. Molino de Viento Clásico (Windmill.glb)
    this.gltfLoader.load('assets/models/Windmill.glb', (gltf) => {
      const windmill = gltf.scene;
      const x = -15.2, z = 2.8;
      windmill.position.set(x, getElev(x, z, 0.05), z);
      windmill.scale.set(3.2, 3.2, 3.2); // Extent is ~1.0m, scale to ~3.2m rustic windpump
      windmill.rotation.y = Math.PI / 4;
      setupModel(windmill, {
        type: 'infrastructure',
        id: 'molino_agua',
        name: 'Molino de Viento Clásico (Bomba Eólica de Agua)',
        spec: 'Extracción Eólica de Pozos Profundos para Red Hidráulica PRV',
        telemetry: 'Caudal de bombeo: 1.8 L/s • Viento activo del Puelche: Girando'
      });
      farmGroup.add(windmill);
      this.windmillModel = windmill;
      console.log('🌾 Molino de Viento (Windmill.glb) cargado con éxito.');
    }, undefined, (err) => console.warn('Error loading Windmill.glb:', err));

    // 5. Pilas de Fardos de Heno (Haystack.glb)
    this.gltfLoader.load('assets/models/Haystack.glb', (gltf) => {
      const baseHaystack = gltf.scene;
      const haySpawns = [
        { x: -10.8, z: 13.8, rot: 0.2, scale: 0.16, name: 'Fardos de Alfalfa - Lote A' },
        { x: -15.2, z: 14.5, rot: 1.4, scale: 0.14, name: 'Fardos de Trébol y Festuca - Lote B' },
        { x: -4.5,  z: 11.2, rot: -0.6, scale: 0.15, name: 'Fardos Pradera Polifítica - Lote C' }
      ];

      haySpawns.forEach((spawn, idx) => {
        const h = baseHaystack.clone(true);
        h.position.set(spawn.x, getElev(spawn.x, spawn.z, 0.02), spawn.z);
        h.scale.set(spawn.scale, spawn.scale, spawn.scale);
        h.rotation.y = spawn.rot;
        setupModel(h, {
          type: 'feed',
          id: `haystack_${idx + 1}`,
          name: spawn.name,
          spec: 'Heno seco de pradera regenerativa • Materia seca: 88% • Proteína cruda: 16.4%',
          telemetry: 'Reserva invernal para contingencias climáticas'
        });
        farmGroup.add(h);
      });
      console.log('🌾 Fardos de Heno (Haystack.glb) distribuidos en la era del granero.');
    }, undefined, (err) => console.warn('Error loading Haystack.glb:', err));

    // 6. Camioneta Agrícola 4x4 de Terreno (Pickup Truck - Hilux / L200 de Campo)
    const pickup = this.createAgriculturalPickupTruck4x4();
    const px = -4.5, pz = 5.2;
    pickup.position.set(px, getElev(px, pz, 0.05), pz);
    pickup.rotation.y = -Math.PI / 5;
    setupModel(pickup, {
      type: 'machinery',
      id: 'camioneta_campo_4x4',
      name: 'Camioneta de Terreno 4x4 Agrícola',
      spec: 'Doble Cabina Diésel 2.8L 4WD • Baliza LED & Radio VHF • Neumáticos All-Terrain',
      telemetry: 'Combustible: 82% • Odómetro: 48.210 km • Estado: En faena diaria'
    });
    farmGroup.add(pickup);
    console.log('🛻 Camioneta Agrícola 4x4 posicionada junto a la Casa Principal.');

    // 7. Tractor Agrícola GLB de Alta Precisión (Tractor.glb)
    this.gltfLoader.load('assets/models/Tractor.glb', (gltf) => {
      const tractor = gltf.scene;
      const box = new THREE.Box3().setFromObject(tractor);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3.2 / (maxDim || 1);
      tractor.scale.set(scale, scale, scale);

      const tx = 7.5, tz = -11.0;
      tractor.position.set(tx, getElev(tx, tz, 0.05), tz);
      tractor.rotation.y = -Math.PI / 4;

      setupModel(tractor, {
        type: 'machinery',
        id: 'tractor_agricola_glb',
        name: 'Tractor Agrícola de Precisión RTK (GLB)',
        spec: 'Motor Diésel 140 HP 4WD • Piloto Automático RTK ISOBUS • Enganche tripuntal',
        telemetry: 'Combustible: 78% • Horómetro: 1.420 hrs • Estado: En Faena Activa'
      });
      farmGroup.add(tractor);
      console.log('🚜 Tractor Agrícola GLB cargado y posicionado en el centro logístico.');
    }, undefined, (err) => console.warn('Error loading Tractor.glb:', err));
  }

  /**
   * Builds high-density volumetric grass tufts (Civilization VI lush diorama pasture)
   * High performance: single draw call for 1600+ grass tufts distributed in PRV paddocks and borders.
   */
  buildDenseGrassTuftsInstances(grassCount = 1600) {
    const grassGeo = this.createGrassTuftGeometry();
    const grassMat = new THREE.MeshStandardMaterial({
      roughness: 0.82,
      metalness: 0.02,
      flatShading: true,
      vertexColors: true,
      side: THREE.DoubleSide
    });

    const instMesh = new THREE.InstancedMesh(grassGeo, grassMat, grassCount);
    instMesh.name = 'instanced_grass_tufts';
    instMesh.castShadow = false; // Grass receives shadow but doesn't cast to save shadowmap passes
    instMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    let idx = 0;

    // A. Pastizales en los Potreros de Pastoreo PRV (P1 a P5)
    const paddockCenters = [
      { x: -34, z: 28, r: 4.5 }, // P1
      { x: -26, z: 28, r: 4.5 }, // P2
      { x: -34, z: 36, r: 5.0 }, // P3 (Vacas)
      { x: -26, z: 36, r: 4.5 }, // P4
      { x: -29, z: 4,  r: 5.5 }, // P5 (Ovejas)
      { x: 18,  z: 22, r: 6.0 }, // Pradera Caballos
      { x: 6,   z: -2, r: 4.5 }  // Egg Mobile
    ];

    paddockCenters.forEach((pad) => {
      const countForPad = Math.floor(grassCount * 0.10);
      for (let k = 0; k < countForPad; k++) {
        if (idx >= grassCount) break;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * pad.r;
        const gx = pad.x + Math.cos(angle) * dist;
        const gz = pad.z + Math.sin(angle) * dist;
        const elev = this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(gx, gz) : 0.45;

        const scale = 0.65 + Math.random() * 0.55;
        dummy.position.set(gx, elev, gz);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.4), scale);
        dummy.updateMatrix();
        instMesh.setMatrixAt(idx, dummy.matrix);

        // Warm, vibrant agricultural clover & rye greens
        const tone = Math.random();
        if (tone < 0.35) {
          color.set('#15803d'); // Deep clover
        } else if (tone < 0.70) {
          color.set('#16a34a'); // Lush rye
        } else {
          color.set('#4d7c0f'); // Golden-green fescue
        }
        instMesh.setColorAt(idx, color);
        idx++;
      }
    });

    // B. Pasto natural y ribera a lo largo del estero/río
    while (idx < grassCount) {
      const z = (Math.random() - 0.5) * 160;
      const riverX = -18.0 + Math.sin(z * 0.045) * 8.0 + (Math.random() - 0.5) * 22.0;
      const elev = this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(riverX, z) : 0.45;

      const scale = 0.55 + Math.random() * 0.6;
      dummy.position.set(riverX, elev, z);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      instMesh.setMatrixAt(idx, dummy.matrix);

      color.set('#14532d').offsetHSL((Math.random() - 0.5) * 0.05, 0, (Math.random() - 0.5) * 0.08);
      instMesh.setColorAt(idx, color);
      idx++;
    }

    instMesh.instanceMatrix.needsUpdate = true;
    if (instMesh.instanceColor) instMesh.instanceColor.needsUpdate = true;

    this.rootGroup.add(instMesh);
    this.instancedMeshes.set('grass_tufts', instMesh);
    console.log(`🌾 Pasto volumétrico 3D instanciado (${grassCount} mechones de pradera polifítica).`);
  }

  /**
   * Procedural Cross-Quad Grass Geometry with tapered blades
   */
  createGrassTuftGeometry() {
    const geometries = [];
    const bladeMatCol = new THREE.Color('#16a34a');

    // 3 intersecting vertical quads at 60 degree angles for 360-degree volume
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI) / 3;
      const bladeGeo = new THREE.PlaneGeometry(0.7, 0.65, 1, 2);
      bladeGeo.translate(0, 0.32, 0);
      bladeGeo.rotateY(angle);

      // Taper the top vertices to give a natural blade tip
      const pos = bladeGeo.attributes.position;
      for (let v = 0; v < pos.count; v++) {
        const y = pos.getY(v);
        if (y > 0.4) {
          pos.setX(v, pos.getX(v) * 0.35);
          pos.setZ(v, pos.getZ(v) * 0.35);
        }
      }
      bladeGeo.computeVertexNormals();
      this._bakeColorToGeometry(bladeGeo, bladeMatCol);
      geometries.push(bladeGeo);
    }

    return this.mergeBufferGeometriesSimple(geometries);
  }

  /**
   * Real 3D Foliage Trees (OakTree.glb y PineTree.glb)
   * Placed along windbreaks, hillsides and riparian corridors
   */
  loadReal3DTreesInstances() {
    if (!this.gltfLoader) return;

    const treesGroup = new THREE.Group();
    treesGroup.name = 'real3DTreesGroup';
    this.rootGroup.add(treesGroup);

    const getElev = (x, z, offset = 0.0) => {
      const base = this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(x, z) : 0.45;
      return base + offset;
    };

    // 1. Robles / Quillayes frondosos (OakTree.glb)
    this.gltfLoader.load('assets/models/OakTree.glb', (gltf) => {
      const baseOak = gltf.scene;
      baseOak.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material = child.material.clone();
            child.material.roughness = 0.8;
            child.material.metalness = 0.02;
          }
        }
      });

      // Cortinas cortaviento y parque del granero
      const oakLocations = [
        { x: -7.5,  z: 7.2,   scale: 0.28, rot: 0.4 },
        { x: -10.2, z: 4.8,   scale: 0.25, rot: 1.2 },
        { x: -5.0,  z: 14.5,  scale: 0.32, rot: 2.1 },
        { x: -21.5, z: 16.0,  scale: 0.26, rot: 0.8 },
        { x: 3.2,   z: -8.5,  scale: 0.30, rot: 1.7 },
        { x: 12.0,  z: 5.5,   scale: 0.27, rot: 3.0 },
        { x: -2.0,  z: -14.0, scale: 0.29, rot: 0.5 }
      ];

      oakLocations.forEach((loc, i) => {
        const oak = baseOak.clone(true);
        oak.position.set(loc.x, getElev(loc.x, loc.z, 0.05), loc.z);
        oak.scale.set(loc.scale, loc.scale, loc.scale);
        oak.rotation.y = loc.rot;
        treesGroup.add(oak);

        const oakMeta = {
          type: 'crop',
          id: `oak_tree_3d_${i+1}`,
          name: `Árbol Nativo Frondoso (Quillay / Roble) #${i+1}`,
          species: 'Quillaja saponaria',
          cropCategory: 'Árbol Nativo de Alto Valor',
          heightMeters: 12.5
        };
        oak.traverse(child => {
          if (child.isMesh) this.mapManager.addPickable(child, oakMeta);
        });
      });
      console.log('🌳 Árboles 3D frondosos (OakTree.glb) cargados en cortinas biológicas.');
    }, undefined, (err) => console.warn('Could not load OakTree.glb:', err));

    // 2. Coníferas / Pinos cortaviento (PineTree.glb)
    this.gltfLoader.load('assets/models/PineTree.glb', (gltf) => {
      const basePine = gltf.scene;
      basePine.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Barrera perimetral y faldeo
      const pineLocations = [
        { x: -24.0, z: -12.0, scale: 2.8, rot: 0.2 },
        { x: -26.5, z: -8.0,  scale: 3.2, rot: 1.1 },
        { x: -23.0, z: -4.0,  scale: 2.6, rot: 2.4 },
        { x: 28.0,  z: 14.0,  scale: 3.0, rot: 0.7 },
        { x: 26.5,  z: 18.0,  scale: 2.7, rot: 1.9 },
        { x: 24.0,  z: 22.0,  scale: 3.1, rot: 0.4 }
      ];

      pineLocations.forEach((loc, i) => {
        const pine = basePine.clone(true);
        pine.position.set(loc.x, getElev(loc.x, loc.z, 0.05), loc.z);
        pine.scale.set(loc.scale, loc.scale, loc.scale);
        pine.rotation.y = loc.rot;
        treesGroup.add(pine);

        const pineMeta = {
          type: 'crop',
          id: `pine_tree_3d_${i+1}`,
          name: `Cortina Cortavientos Pinar Perimetral #${i+1}`,
          species: 'Pinus radiata',
          cropCategory: 'Cortina Cortaviento',
          heightMeters: 14.0
        };
        pine.traverse(child => {
          if (child.isMesh) this.mapManager.addPickable(child, pineMeta);
        });
      });
      console.log('🌲 Pinos 3D cortaviento (PineTree.glb) cargados en barreras perimetrales.');
    }, undefined, (err) => console.warn('Could not load PineTree.glb:', err));
  }

  /**
   * Animates foliage wind sway for all instanced vegetation meshes
   * and rotates the farm windmill fan blades.
   * 
   * @param {number} time - Elapsed time in seconds
   * @param {number} windSpeed - Wind speed in km/h (default ~18)
   */
  animateWind(time, windSpeed = 18.0) {
    if (!this.rootGroup) return;
    const intensity = Math.min(0.08, (windSpeed / 50.0) * 0.05);
    const swayX = Math.sin(time * 2.2) * intensity;
    const swayZ = Math.cos(time * 1.8) * (intensity * 0.6);
    this.rootGroup.children.forEach(mesh => {
      if (mesh.isInstancedMesh) {
        mesh.rotation.x = swayX;
        mesh.rotation.z = swayZ;
      }
    });

    // Animate rustic windmill rotor rotation
    if (this.windmillModel) {
      // Rotate around local Y or Z depending on model axis
      this.windmillModel.rotation.y += 0.008 * (windSpeed / 12.0);
    }
  }

  clear() {
    while (this.rootGroup.children.length > 0) {
      const child = this.rootGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      this.rootGroup.remove(child);
    }
    this.instancedMeshes.clear();
    this.instanceMetadata.clear();
    this.windmillModel = null;
    this.farmsteadGroup = null;
  }
}

