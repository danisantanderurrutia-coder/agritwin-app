/**
 * AgriTwin - CropManager Module (Enriched Agroecological & River Corridor 3D Engine)
 * 
 * Features 3D Renderers for:
 *  - Native Riparian Corridor: Quillay, Boldo, Maitén, Sauce Chileno, Maqui
 *  - Orchards & Agroforestry: Avellano Europeo, Nogal Chandler, Olivos
 *  - Commercial Vines & Fruits: Viñedos en Espaldera (País/Carignan), Cerezos Lapins con microaspersión
 *  - Clean Energy & Infrastructure: Parque Agrovoltaico 3D, Tranque HDPE, Biofábrica
 *  - Specialty: Hongos Shiitake en Troncos, Bosque Silvopastoril Pino/Eucalipto
 */

import { bus } from '../utils/EventBus.js';
import { MapManager } from '../map/MapManager.js';
import { InstancedVegetationManager } from './InstancedVegetationManager.js';

export class CropManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.scene = mapManager.scene;
    this.cropGroup = new THREE.Group();
    this.scene.add(this.cropGroup);
    this.visible = true;

    // High-performance single-draw-call instanced vegetation engine
    this.instancedVeg = new InstancedVegetationManager(mapManager);
  }

  renderTrees(treesData) {
    // 1. Build Massive Single-Draw-Call Instanced Vegetation & Machinery
    this.instancedVeg.buildVegetation(treesData);

    // 2. Render Specialized Agricultural Facilities (Agrivoltaic, Tranque, Biofactory, Shiitake)
    treesData.forEach(crop => {
      const sp = (crop.species || '').toLowerCase();
      const varName = (crop.variety || '').toLowerCase();

      const isSpecial = sp.includes('agrivoltaic') ||
                        sp.includes('water basin') || varName.includes('tranque') || varName.includes('embalse') ||
                        sp.includes('biofactory') || varName.includes('biofábrica') || varName.includes('invernadero') ||
                        sp.includes('lentinula');

      if (!isSpecial) return; // Handled by instancedVeg

      const pos = MapManager.latLonToVector3(crop.location.longitude, crop.location.latitude);
      let cropMesh;

      if (sp.includes('agrivoltaic')) {
        cropMesh = this.createAgrivoltaicArrayMesh();
      } else if (sp.includes('water basin') || varName.includes('tranque') || varName.includes('embalse')) {
        cropMesh = this.createWaterBasinMesh();
      } else if (sp.includes('biofactory') || varName.includes('biofábrica') || varName.includes('invernadero')) {
        cropMesh = this.createBiofactoryMesh();
      } else if (sp.includes('lentinula')) {
        cropMesh = this.createShiitakeLogMesh();
      }

      if (cropMesh) {
        cropMesh.position.set(pos.x, 0.45, pos.z);
        const entityData = {
          type: 'crop',
          id: crop.id,
          name: `${crop.species} (${crop.variety})`,
          species: crop.species,
          variety: crop.variety,
          cropCategory: crop.cropCategory
        };
        cropMesh.userData = entityData;
        this.cropGroup.add(cropMesh);
        this.mapManager.addPickable(cropMesh, entityData);
      }
    });


    bus.on('layer:trees', (visible) => this.toggleVisibility(visible));

    console.log(`🌲 Rendered InstancedVegetationManager single-draw-call canopy + specialized infrastructure.`);
  }

  /**
   * Parque Agrovoltaico (Agrivoltaics 3D): Paneles solares bifaciales elevados con pastura abajo
   */
  createAgrivoltaicArrayMesh() {
    const group = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.85, roughness: 0.25 });
    const pvMat = new THREE.MeshStandardMaterial({ color: '#1e1b4b', roughness: 0.15, metalness: 0.75 });

    // 4 Pilares metálicos de elevación (permiten paso de ovejas y tractores)
    const pillarCoords = [
      [-4, -2], [4, -2], [-4, 2], [4, 2]
    ];
    pillarCoords.forEach(([px, pz]) => {
      const pGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.8, 8);
      const p = new THREE.Mesh(pGeo, metalMat);
      p.position.set(px, 1.4, pz);
      p.castShadow = true;
      group.add(p);
    });

    // Marco transversal
    const frameGeo = new THREE.BoxGeometry(9.6, 0.15, 5.0);
    const frame = new THREE.Mesh(frameGeo, metalMat);
    frame.position.set(0, 2.8, 0);
    frame.rotation.x = -Math.PI / 10; // inclinación solar Maule
    group.add(frame);

    // Módulos solares fotovoltaicos
    for (let r = -1; r <= 1; r++) {
      for (let c = -3.5; c <= 3.5; c += 2.4) {
        const panelGeo = new THREE.BoxGeometry(2.1, 0.08, 1.2);
        const panel = new THREE.Mesh(panelGeo, pvMat);
        panel.position.set(c, 2.88, r * 1.3);
        panel.rotation.x = -Math.PI / 10;
        panel.castShadow = true;
        group.add(panel);
      }
    }

    return group;
  }

  /**
   * Tranque Predial Australiano (18.000 m³): Terraplén excavado, geomembrana HDPE y lámina de agua
   */
  createWaterBasinMesh() {
    const group = new THREE.Group();

    // Talud/Terraplén exterior de tierra compactada
    const bermGeo = new THREE.RingGeometry(6.5, 8.5, 32);
    bermGeo.rotateX(-Math.PI / 2);
    const bermMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.95 });
    const berm = new THREE.Mesh(bermGeo, bermMat);
    berm.position.y = 0.25;
    group.add(berm);

    // Borde negro de geomembrana HDPE
    const hdpeGeo = new THREE.RingGeometry(5.8, 6.6, 32);
    hdpeGeo.rotateX(-Math.PI / 2);
    const hdpeMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.4 });
    const hdpe = new THREE.Mesh(hdpeGeo, hdpeMat);
    hdpe.position.y = 0.3;
    group.add(hdpe);

    // Lámina de agua reflectante
    const waterGeo = new THREE.CircleGeometry(5.8, 32);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      roughness: 0.05,
      transmission: 0.6,
      opacity: 0.85,
      transparent: true,
      metalness: 0.1
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0.28;
    group.add(water);

    return group;
  }

  /**
   * Biofábrica & Vivero Bioclimático Bokashi
   */
  createBiofactoryMesh() {
    const group = new THREE.Group();

    // Estructura tipo túnel invernadero
    const tunnelGeo = new THREE.CylinderGeometry(2.8, 2.8, 7.0, 16, 1, false, 0, Math.PI);
    tunnelGeo.rotateZ(Math.PI / 2);
    const tunnelMat = new THREE.MeshPhysicalMaterial({
      color: 0xdcfce7,
      roughness: 0.2,
      transmission: 0.5,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.position.set(0, 0.4, 0);
    tunnel.castShadow = true;
    group.add(tunnel);

    // Camas de cultivo y compostaje interior
    const bedGeo = new THREE.BoxGeometry(6.0, 0.4, 1.2);
    const bedMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.9 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(0, 0.2, 0);
    group.add(bed);

    return group;
  }

  /**
   * Shiitake en troncos
   */
  createShiitakeLogMesh() {
    const group = new THREE.Group();

    for (let i = 0; i < 4; i++) {
      const logGeo = new THREE.CylinderGeometry(0.2, 0.2, 2.2, 8);
      logGeo.rotateZ(Math.PI / 3);
      const logMat = new THREE.MeshStandardMaterial({ color: '#543818', roughness: 0.9 });
      const logMesh = new THREE.Mesh(logGeo, logMat);
      logMesh.position.set(i * 0.7 - 1.0, 0.3, (i % 2) * 0.5);
      logMesh.castShadow = true;
      group.add(logMesh);

      for (let j = 0; j < 3; j++) {
        const capGeo = new THREE.ConeGeometry(0.35, 0.2, 8);
        const capMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.6 });
        const capMesh = new THREE.Mesh(capGeo, capMat);
        capMesh.position.set(i * 0.7 - 1.0 + (j - 1) * 0.4, 0.55, (i % 2) * 0.5);
        group.add(capMesh);
      }
    }
    return group;
  }

    toggleVisibility(visible) {
    this.visible = visible;
    this.cropGroup.visible = visible;
    if (this.instancedVeg && this.instancedVeg.rootGroup) {
      this.instancedVeg.rootGroup.visible = visible;
    }
  }
}
