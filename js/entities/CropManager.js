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

    // 3. Render Vegetable Gardens (Papa & Tomate Beds) in Zona 1
    this.addPotatoAndTomatoBeds(-16, -4);

    bus.on('layer:trees', (visible) => this.toggleVisibility(visible));

    console.log(`🌲 Rendered InstancedVegetationManager single-draw-call canopy + specialized infrastructure.`);
  }

  /**
   * Quillay (Quillaja saponaria): Nativo esclerófilo con copa globosa densa
   */
  createQuillayTreeMesh(height = 9.5) {
    const group = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, height * 0.4, 7);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = height * 0.2;
    trunk.castShadow = true;
    group.add(trunk);

    const canopyGeo = new THREE.DodecahedronGeometry(height * 0.45, 1);
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.75, flatShading: true });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = height * 0.7;
    canopy.castShadow = true;
    group.add(canopy);

    // Flores blancas/crema de Quillay
    for (let i = 0; i < 6; i++) {
      const flGeo = new THREE.SphereGeometry(0.2, 5, 5);
      const flMat = new THREE.MeshStandardMaterial({ color: '#fef08a', roughness: 0.5 });
      const fl = new THREE.Mesh(flGeo, flMat);
      const ang = (i / 6) * Math.PI * 2;
      fl.position.set(Math.cos(ang) * 2.8, height * 0.72 + (Math.random() - 0.5), Math.sin(ang) * 2.8);
      group.add(fl);
    }
    return group;
  }

  /**
   * Boldo (Peumus boldus): Copa redondeada compacta verde oliva
   */
  createBoldoTreeMesh(height = 8.0) {
    const group = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.5, height * 0.35, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#543818', roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = height * 0.17;
    trunk.castShadow = true;
    group.add(trunk);

    const canopyGeo = new THREE.SphereGeometry(height * 0.42, 8, 8);
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#14532d', roughness: 0.8, flatShading: true });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = height * 0.65;
    canopy.scale.set(1.1, 0.9, 1.1);
    canopy.castShadow = true;
    group.add(canopy);
    return group;
  }

  /**
   * Maitén (Maytenus boaria): Ramas colgantes elegantes
   */
  createMaitenTreeMesh(height = 10.0) {
    const group = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, height * 0.45, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#3f2e18', roughness: 0.85 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = height * 0.22;
    trunk.castShadow = true;
    group.add(trunk);

    const mainCanopy = new THREE.Mesh(
      new THREE.ConeGeometry(height * 0.45, height * 0.65, 7),
      new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.7, flatShading: true })
    );
    mainCanopy.position.y = height * 0.68;
    mainCanopy.castShadow = true;
    group.add(mainCanopy);
    return group;
  }

  /**
   * Sauce Chileno (Salix humboldtiana): Estero fluvial con ramas péndulas
   */
  createWillowTreeMesh(height = 11.5) {
    const group = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.45, 0.7, height * 0.45, 7);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#4b382a', roughness: 0.95 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = height * 0.22;
    trunk.rotation.z = 0.08; // leve inclinación natural hacia el agua
    trunk.castShadow = true;
    group.add(trunk);

    const topGeo = new THREE.DodecahedronGeometry(height * 0.42, 1);
    const topMat = new THREE.MeshStandardMaterial({ color: '#4ade80', roughness: 0.7, flatShading: true });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(0.6, height * 0.75, 0);
    top.scale.set(1.3, 0.9, 1.3);
    top.castShadow = true;
    group.add(top);

    // Cortinas colgantes
    for (let i = 0; i < 5; i++) {
      const dropGeo = new THREE.CylinderGeometry(0.1, 0.25, 3.5, 5);
      const drop = new THREE.Mesh(dropGeo, topMat);
      const ang = (i / 5) * Math.PI * 2;
      drop.position.set(Math.cos(ang) * 2.8, height * 0.52, Math.sin(ang) * 2.8);
      group.add(drop);
    }
    return group;
  }

  /**
   * Maqui (Aristotelia chilensis): Arbusto tupido con bayas púrpuras
   */
  createMaquiBushMesh(height = 3.8) {
    const group = new THREE.Group();
    const bushGeo = new THREE.DodecahedronGeometry(height * 0.5, 1);
    const bushMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8, flatShading: true });
    const bush = new THREE.Mesh(bushGeo, bushMat);
    bush.position.y = height * 0.5;
    bush.castShadow = true;
    group.add(bush);

    // Bayas de maqui
    for (let i = 0; i < 6; i++) {
      const bGeo = new THREE.SphereGeometry(0.12, 5, 5);
      const bMat = new THREE.MeshStandardMaterial({ color: '#4c1d95', roughness: 0.3 });
      const b = new THREE.Mesh(bGeo, bMat);
      b.position.set((Math.random() - 0.5) * 2.0, height * 0.5 + (Math.random() - 0.5), (Math.random() - 0.5) * 2.0);
      group.add(b);
    }
    return group;
  }

  /**
   * Avellano Europeo (Corylus avellana)
   */
  createHazelnutTreeMesh(height = 4.5) {
    const group = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, height * 0.4, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.85 });
    const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
    trunkMesh.position.y = height * 0.2;
    trunkMesh.castShadow = true;
    group.add(trunkMesh);

    const canopyGeo = new THREE.DodecahedronGeometry(2.1, 1);
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.75, flatShading: true });
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
    canopyMesh.position.y = height * 0.7;
    canopyMesh.castShadow = true;
    group.add(canopyMesh);

    // Avellanas
    for (let i = 0; i < 5; i++) {
      const nutGeo = new THREE.SphereGeometry(0.18, 6, 6);
      const nutMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.5 });
      const nutMesh = new THREE.Mesh(nutGeo, nutMat);
      const angle = (i / 5) * Math.PI * 2;
      nutMesh.position.set(Math.cos(angle) * 1.6, height * 0.7 + (Math.random() - 0.5), Math.sin(angle) * 1.6);
      group.add(nutMesh);
    }
    return group;
  }

  /**
   * Nogal Chandler (Juglans regia)
   */
  createWalnutTreeMesh(height = 7.5) {
    const group = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, height * 0.35, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#573418', roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = height * 0.18;
    trunk.castShadow = true;
    group.add(trunk);

    const canopyGeo = new THREE.SphereGeometry(height * 0.45, 8, 8);
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.7, flatShading: true });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = height * 0.68;
    canopy.scale.set(1.3, 0.9, 1.3);
    canopy.castShadow = true;
    group.add(canopy);
    return group;
  }

  /**
   * Viñedos en Espaldera (Vitis vinifera): Postes de roble, alambres tensados, follaje y uvas
   */
  createVineyardTrellisMesh() {
    const group = new THREE.Group();

    // 4 Postes de madera de espaldera
    const postMat = new THREE.MeshStandardMaterial({ color: '#5c3a21', roughness: 0.9 });
    for (let p = -4; p <= 4; p += 2.6) {
      const postGeo = new THREE.CylinderGeometry(0.08, 0.09, 1.9, 6);
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(p, 0.95, 0);
      post.castShadow = true;
      group.add(post);
    }

    // Follaje de vid continuo
    const vineGeo = new THREE.BoxGeometry(9.0, 0.9, 0.55);
    const vineMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.75, flatShading: true });
    const vine = new THREE.Mesh(vineGeo, vineMat);
    vine.position.set(0, 1.25, 0);
    vine.castShadow = true;
    group.add(vine);

    // Racimos de uvas púrpuras
    const grapeMat = new THREE.MeshStandardMaterial({ color: '#581c87', roughness: 0.35 });
    for (let g = -3.5; g <= 3.5; g += 1.2) {
      const clusterGeo = new THREE.ConeGeometry(0.18, 0.35, 6);
      clusterGeo.rotateX(Math.PI);
      const cluster = new THREE.Mesh(clusterGeo, grapeMat);
      cluster.position.set(g, 0.85, 0.28);
      group.add(cluster);
    }

    // Línea de riego por goteo en la base
    const dripGeo = new THREE.CylinderGeometry(0.03, 0.03, 9.2, 6);
    dripGeo.rotateZ(Math.PI / 2);
    const dripMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5 });
    const drip = new THREE.Mesh(dripGeo, dripMat);
    drip.position.set(0, 0.2, 0);
    group.add(drip);

    return group;
  }

  /**
   * Cerezo de Exportación (Prunus avium): Frutal con cerezas y microaspersor
   */
  createCherryTreeMesh(height = 3.5) {
    const group = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.3, height * 0.45, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#6b301c', roughness: 0.8 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = height * 0.22;
    trunk.castShadow = true;
    group.add(trunk);

    const canopyGeo = new THREE.DodecahedronGeometry(1.6, 1);
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.7, flatShading: true });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = height * 0.72;
    canopy.castShadow = true;
    group.add(canopy);

    // Cerezas rojas brillantes
    const cherryMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.25, metalness: 0.1 });
    for (let i = 0; i < 8; i++) {
      const chGeo = new THREE.SphereGeometry(0.12, 6, 6);
      const ch = new THREE.Mesh(chGeo, cherryMat);
      const ang = (i / 8) * Math.PI * 2;
      ch.position.set(Math.cos(ang) * 1.3, height * 0.7 + (Math.random() - 0.5) * 0.5, Math.sin(ang) * 1.3);
      group.add(ch);
    }

    // Microaspersor elevado
    const sprGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6);
    const spr = new THREE.Mesh(sprGeo, new THREE.MeshStandardMaterial({ color: '#38bdf8' }));
    spr.position.set(0.9, 0.6, 0);
    group.add(spr);

    return group;
  }

  /**
   * Olivo (Olea europaea): Tronco nudoso y hojas gris-verdosas
   */
  createOliveTreeMesh(height = 4.5) {
    const group = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, height * 0.45, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#57534e', roughness: 0.95 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = height * 0.22;
    trunk.castShadow = true;
    group.add(trunk);

    const canopyGeo = new THREE.SphereGeometry(height * 0.4, 7, 7);
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#65a30d', roughness: 0.75, flatShading: true });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = height * 0.68;
    canopy.scale.set(1.2, 0.8, 1.2);
    canopy.castShadow = true;
    group.add(canopy);
    return group;
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

  /**
   * Eucalipto
   */
  createEucalyptusTreeMesh(height = 16.0) {
    const group = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, height * 0.7, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#d6d3d1', roughness: 0.7 });
    const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
    trunkMesh.position.y = height * 0.35;
    trunkMesh.castShadow = true;
    group.add(trunkMesh);

    const canopyGeo = new THREE.ConeGeometry(1.6, height * 0.5, 6);
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#047857', roughness: 0.8, flatShading: true });
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
    canopyMesh.position.y = height * 0.75;
    canopyMesh.castShadow = true;
    group.add(canopyMesh);
    return group;
  }

  /**
   * Pino Insigne
   */
  createPineTreeMesh(height = 14.0) {
    const group = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, height * 0.35, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#543818', roughness: 0.9 });
    const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
    trunkMesh.position.y = height * 0.18;
    trunkMesh.castShadow = true;
    group.add(trunkMesh);

    const tierColors = ['#14532d', '#166534', '#15803d'];
    const tierScales = [
      { radius: 2.2, h: 3.2, y: height * 0.40 },
      { radius: 1.7, h: 2.8, y: height * 0.65 },
      { radius: 1.1, h: 2.2, y: height * 0.88 }
    ];

    tierScales.forEach((tier, index) => {
      const coneGeo = new THREE.ConeGeometry(tier.radius, tier.h, 7);
      const coneMat = new THREE.MeshStandardMaterial({ color: tierColors[index], roughness: 0.8, flatShading: true });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      coneMesh.position.y = tier.y;
      coneMesh.castShadow = true;
      group.add(coneMesh);
    });
    return group;
  }

  /**
   * Vegetable Beds (Papa & Tomate)
   */
  addPotatoAndTomatoBeds(x, z) {
    const vegGroup = new THREE.Group();

    for (let r = 0; r < 4; r++) {
      const moundGeo = new THREE.BoxGeometry(6.0, 0.35, 0.8);
      const moundMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.95 });
      const moundMesh = new THREE.Mesh(moundGeo, moundMat);
      moundMesh.position.set(x, 0.6, z + r * 1.5);
      vegGroup.add(moundMesh);

      for (let p = -2.5; p <= 2.5; p += 1.2) {
        const plantGeo = new THREE.DodecahedronGeometry(0.3, 0);
        const plantMat = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.8 });
        const plantMesh = new THREE.Mesh(plantGeo, plantMat);
        plantMesh.position.set(x + p, 0.85, z + r * 1.5);
        plantMesh.castShadow = true;
        vegGroup.add(plantMesh);
      }
    }

    for (let r = 0; r < 3; r++) {
      const rowZ = z + 8 + r * 1.8;
      const trellisGeo = new THREE.BoxGeometry(7.0, 1.6, 0.3);
      const trellisMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8, flatShading: true });
      const trellisMesh = new THREE.Mesh(trellisGeo, trellisMat);
      trellisMesh.position.set(x, 1.2, rowZ);
      trellisMesh.castShadow = true;
      vegGroup.add(trellisMesh);

      for (let t = -3.0; t <= 3.0; t += 1.0) {
        const tomGeo = new THREE.SphereGeometry(0.12, 6, 6);
        const tomMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.3 });
        const tomMesh = new THREE.Mesh(tomGeo, tomMat);
        tomMesh.position.set(x + t, 1.1 + (Math.random() - 0.5) * 0.4, rowZ + 0.2);
        vegGroup.add(tomMesh);
      }
    }
    this.cropGroup.add(vegGroup);
  }

  /**
   * Hileras densas de Viñedos en Espaldera en Cuartel B101
   */
  addVineyardRows(baseX, baseZ) {
    const vGroup = new THREE.Group();
    for (let r = 0; r < 5; r++) {
      const trellis = this.createVineyardTrellisMesh();
      trellis.position.set(baseX, 0.45, baseZ + r * 3.5);
      vGroup.add(trellis);
    }
    this.cropGroup.add(vGroup);
  }

  /**
   * Hileras de Cerezos de Exportación en Cuartel B102
   */
  addCherryOrchardRows(baseX, baseZ) {
    const cGroup = new THREE.Group();
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const cherry = this.createCherryTreeMesh(3.4);
        cherry.position.set(baseX + col * 4.2 - 6, 0.45, baseZ + row * 4.2 - 6);
        cGroup.add(cherry);
      }
    }
    this.cropGroup.add(cGroup);
  }

  /**
   * Corredor Ribereño Nativo a lo largo del meandro del estero
   */
  addRiparianRiverCorridor(baseX, baseZ) {
    const ripGroup = new THREE.Group();
    const corridorItems = [
      { dx: -6, dz: -4, fn: () => this.createWillowTreeMesh(10.5) },
      { dx: -2, dz: -2, fn: () => this.createQuillayTreeMesh(8.5) },
      { dx: 2,  dz: 2,  fn: () => this.createBoldoTreeMesh(7.5) },
      { dx: 6,  dz: 6,  fn: () => this.createMaitenTreeMesh(9.0) },
      { dx: 0,  dz: 5,  fn: () => this.createMaquiBushMesh(3.5) }
    ];

    corridorItems.forEach(item => {
      const m = item.fn();
      m.position.set(baseX + item.dx, 0.45, baseZ + item.dz);
      ripGroup.add(m);
    });
    this.cropGroup.add(ripGroup);
  }

  addForestBelts() {
    const forestPositions = [
      { x: 34, z: 22, type: 'pine' },
      { x: 38, z: 28, type: 'pine' },
      { x: 42, z: 16, type: 'euc' },
      { x: 46, z: 24, type: 'euc' }
    ];

    forestPositions.forEach(p => {
      const mesh = p.type === 'pine' ? this.createPineTreeMesh(14.0) : this.createEucalyptusTreeMesh(16.0);
      mesh.position.set(p.x, 0.45, p.z);
      this.cropGroup.add(mesh);
    });
  }

  toggleVisibility(visible) {
    this.visible = visible;
    this.cropGroup.visible = visible;
    if (this.instancedVeg && this.instancedVeg.rootGroup) {
      this.instancedVeg.rootGroup.visible = visible;
    }
  }
}
