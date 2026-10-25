/**
 * AgriTwin - Procedural Object 3D Factory
 * 
 * Síntesis procedural de mallas Three.js para estructuras e infraestructura agrícola
 * (Invernaderos, gallineros móviles, colmenares, paneles FV, casetas de bombeo, etc.)
 */

export class ProceduralObjectFactory {
  /**
   * Construye modelos procedurales Three.js cuando no hay GLB
   */
  static buildModel(group, item) {
    const t = item.modelType;

    // Helper para sombras
    const cast = (m) => {
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };

    // ──────────────── 1. INVERNADERO BIOCLIMÁTICO ────────────────
    if (t === 'procedural_greenhouse') {
      const slabMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.8 });
      const slab = cast(new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.2, 3.4), slabMat));
      slab.position.y = 0.1;
      group.add(slab);

      const glassMat = new THREE.MeshPhysicalMaterial({
        color: '#7dd3fc',
        roughness: 0.12,
        transmission: 0.65,
        transparent: true,
        opacity: 0.6,
        ior: 1.45
      });
      const body = cast(new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.8, 3.2), glassMat));
      body.position.y = 1.1;
      group.add(body);

      const frameMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8, roughness: 0.3 });
      const roof = cast(new THREE.Mesh(new THREE.ConeGeometry(2.7, 1.4, 4), frameMat));
      roof.position.y = 2.7;
      roof.rotation.y = Math.PI / 4;
      group.add(roof);

      // Bancales internos
      const plantMat = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.7 });
      const b1 = cast(new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 0.8), plantMat));
      b1.position.set(0, 0.4, 0.8);
      const b2 = cast(new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 0.8), plantMat));
      b2.position.set(0, 0.4, -0.8);
      group.add(b1, b2);

      return 3.5;
    }

    // ──────────────── 2. PARQUE AGROVOLTAICO (SOLAR PV) ────────────────
    else if (t === 'procedural_solar_pv') {
      const mastMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.9, roughness: 0.25 });
      const mast1 = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.2, 8), mastMat));
      mast1.position.set(-1.0, 1.1, 0);
      const mast2 = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.2, 8), mastMat));
      mast2.position.set(1.0, 1.1, 0);
      const crossBeam = cast(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 0.12), mastMat));
      crossBeam.position.set(0, 2.1, 0);
      group.add(mast1, mast2, crossBeam);

      const panelMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', metalness: 0.85, roughness: 0.15 });
      const frameMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9 });
      const panel = cast(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 1.8), panelMat));
      panel.position.set(0, 2.3, 0);
      panel.rotation.x = THREE.MathUtils.degToRad(-35);
      const panelBorder = cast(new THREE.Mesh(new THREE.BoxGeometry(3.26, 0.04, 1.86), frameMat));
      panelBorder.position.set(0, 2.28, 0);
      panelBorder.rotation.x = THREE.MathUtils.degToRad(-35);
      group.add(panel, panelBorder);

      return 2.9;
    }

    // ──────────────── 3. TORRE METEOROLÓGICA IOT ────────────────
    else if (t === 'procedural_weather_tower') {
      const mastMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.85, roughness: 0.3 });
      const mast = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 4.4, 8), mastMat));
      mast.position.y = 2.2;
      group.add(mast);

      // Caja abrigo meteorológico Stevenson
      const boxMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 });
      const whiteBox = cast(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.4), boxMat));
      whiteBox.position.set(0, 2.0, 0.3);
      group.add(whiteBox);

      // Brazos de sensores en la cima
      const armMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.9 });
      const arm = cast(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.04), armMat));
      arm.position.y = 4.3;
      const armCross = cast(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 1.2), armMat));
      armCross.position.y = 4.3;
      const beaconMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), beaconMat);
      beacon.position.y = 4.5;
      group.add(arm, armCross, beacon);

      return 4.6;
    }

    // ──────────────── 4. DJI DOCK 2 AUTÓNOMO ────────────────
    else if (t === 'procedural_dronedock') {
      const padMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.8 });
      const pad = cast(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 2.4), padMat));
      pad.position.y = 0.075;
      group.add(pad);

      const dockMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.2, roughness: 0.3 });
      const dock = cast(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 1.8), dockMat));
      dock.position.y = 0.575;
      group.add(dock);

      const hatchMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.5, roughness: 0.4 });
      const hatch = cast(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 1.6), hatchMat));
      hatch.position.y = 1.025;
      group.add(hatch);

      const ledMat = new THREE.MeshBasicMaterial({ color: '#10b981' });
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), ledMat);
      led.position.set(0.7, 1.05, 0.7);
      group.add(led);

      return 1.8;
    }

    // ──────────────── 5. SONDA LORAWAN SUELO ────────────────
    else if (t === 'procedural_soil_lora') {
      const caseMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.5 });
      const probeCase = cast(new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.42, 0.18), caseMat));
      probeCase.position.y = 0.45;
      group.add(probeCase);

      const antMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.8 });
      const ant = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.65, 6), antMat));
      ant.position.set(0.07, 0.9, 0);
      group.add(ant);

      const panelMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.2 });
      const panel = cast(new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.2), panelMat));
      panel.position.set(-0.04, 0.7, 0);
      panel.rotation.x = THREE.MathUtils.degToRad(-35);
      group.add(panel);

      const baseMat = new THREE.MeshStandardMaterial({ color: '#78716c', roughness: 0.9 });
      const baseStake = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.5, 6), baseMat));
      baseStake.position.y = 0.2;
      group.add(baseStake);

      return 1.4;
    }

    // ──────────────── 6. COMPUERTA TELEMÉTRICA DGA ────────────────
    else if (t === 'procedural_dga_gate') {
      const concMat = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.85 });
      const p1 = cast(new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.2, 0.5), concMat));
      p1.position.set(-1.0, 1.1, 0);
      const p2 = cast(new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.2, 0.5), concMat));
      p2.position.set(1.0, 1.1, 0);
      const lintel = cast(new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.35, 0.55), concMat));
      lintel.position.set(0, 2.1, 0);
      group.add(p1, p2, lintel);

      const gateMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.3 });
      const gatePlate = cast(new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.06), gateMat));
      gatePlate.position.set(0, 0.65, 0);
      group.add(gatePlate);

      const shaftMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.9 });
      const shaft = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 8), shaftMat));
      shaft.position.set(0, 1.9, 0);
      group.add(shaft);

      const wheelMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.3 });
      const wheel = cast(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 16), wheelMat));
      wheel.position.set(0, 2.5, 0);
      wheel.rotation.x = Math.PI / 2;
      group.add(wheel);

      return 2.7;
    }

    // ──────────────── 7. CEREZO FRUTAL ────────────────
    else if (t === 'procedural_cherry') {
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#5c3a21', roughness: 0.9 });
      const trunk = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.25, 1.8, 8), trunkMat));
      trunk.position.y = 0.9;
      group.add(trunk);

      const leafMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.75 });
      const f1 = cast(new THREE.Mesh(new THREE.SphereGeometry(1.2, 10, 10), leafMat));
      f1.position.set(0, 2.3, 0);
      const f2 = cast(new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), leafMat));
      f2.position.set(0.6, 2.6, 0.4);
      const f3 = cast(new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 8), leafMat));
      f3.position.set(-0.5, 2.5, -0.3);
      group.add(f1, f2, f3);

      // Frutos cerezas rojas
      const cherryMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.2 });
      for (let i = 0; i < 8; i++) {
        const c = cast(new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), cherryMat));
        const ang = (i / 8) * Math.PI * 2;
        c.position.set(Math.cos(ang) * 0.9, 2.0 + (i % 3) * 0.25, Math.sin(ang) * 0.9);
        group.add(c);
      }

      return 3.4;
    }

    // ──────────────── 8. CAMELLONES DE HUERTO BIOINTENSIVO ────────────────
    else if (t === 'procedural_crop_rows') {
      const soilMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.95 });
      const vegMat1 = new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.7 });
      const vegMat2 = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.75 });

      for (let row = -1; row <= 1; row++) {
        const bed = cast(new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.3, 4.4), soilMat));
        bed.position.set(row * 1.1, 0.15, 0);
        group.add(bed);

        for (let i = -4; i <= 4; i++) {
          const v = cast(new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), (i + row) % 2 === 0 ? vegMat1 : vegMat2));
          v.position.set(row * 1.1, 0.38, i * 0.5);
          group.add(v);
        }
      }

      return 1.0;
    }

    // ──────────────── 9. SWALE / ZANJA DE INFILTRACIÓN ────────────────
    else if (t === 'procedural_swale') {
      const earthMat = new THREE.MeshStandardMaterial({ color: '#785532', roughness: 0.95 });
      const berm = cast(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 5.2), earthMat));
      berm.position.set(0.65, 0.25, 0);
      group.add(berm);

      const waterMat = new THREE.MeshPhysicalMaterial({ color: '#0284c7', transmission: 0.7, roughness: 0.1, transparent: true, opacity: 0.85 });
      const swaleWater = cast(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 5.2), waterMat));
      swaleWater.position.set(-0.55, 0.06, 0);
      group.add(swaleWater);

      // Arbustos fijadores en la loma del swale
      const bushMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8 });
      for (let z = -2.0; z <= 2.0; z += 1.3) {
        const bush = cast(new THREE.Mesh(new THREE.SphereGeometry(0.35, 7, 7), bushMat));
        bush.position.set(0.65, 0.6, z);
        group.add(bush);
      }

      return 1.2;
    }

    // ──────────────── 10. PILA DE COMPOST TERMOFÍLICO ────────────────
    else if (t === 'procedural_compost') {
      const woodMat = new THREE.MeshStandardMaterial({ color: '#854d0e', roughness: 0.9 });
      for (let x of [-0.9, 0.9]) {
        for (let z of [-0.9, 0.9]) {
          const post = cast(new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.12), woodMat));
          post.position.set(x, 0.6, z);
          group.add(post);
        }
      }
      for (let y of [0.3, 0.65, 1.0]) {
        const slatFront = cast(new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.14, 0.05), woodMat));
        slatFront.position.set(0, y, 0.9);
        const slatBack = cast(new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.14, 0.05), woodMat));
        slatBack.position.set(0, y, -0.9);
        const slatLeft = cast(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 1.85), woodMat));
        slatLeft.position.set(-0.9, y, 0);
        const slatRight = cast(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 1.85), woodMat));
        slatRight.position.set(0.9, y, 0);
        group.add(slatFront, slatBack, slatLeft, slatRight);
      }

      const compostMat = new THREE.MeshStandardMaterial({ color: '#291809', roughness: 0.98 });
      const compostMound = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.95, 10), compostMat));
      compostMound.position.y = 0.48;
      group.add(compostMound);

      return 1.4;
    }

    // ──────────────── 11. LAGUNA NATURAL / TRANQUE ────────────────
    else if (t === 'procedural_lagoon') {
      const waterMat = new THREE.MeshPhysicalMaterial({
        color: '#0284c7',
        roughness: 0.06,
        transmission: 0.75,
        transparent: true,
        opacity: 0.88,
        ior: 1.333
      });
      const water = cast(new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.8, 0.16, 24), waterMat));
      water.position.y = 0.08;
      group.add(water);

      // Anillo de piedras y rocas ribereñas
      const stoneMat = new THREE.MeshStandardMaterial({ color: '#78716c', roughness: 0.85 });
      const stoneCount = 18;
      for (let i = 0; i < stoneCount; i++) {
        const ang = (i / stoneCount) * Math.PI * 2;
        const rad = 3.65 + (i % 3) * 0.22;
        const sSize = 0.35 + (i % 4) * 0.12;
        const stone = cast(new THREE.Mesh(new THREE.DodecahedronGeometry(sSize), stoneMat));
        stone.position.set(Math.cos(ang) * rad, 0.18, Math.sin(ang) * rad);
        stone.rotation.set((i * 13) % 3, (i * 7) % 3, 0);
        group.add(stone);
      }

      // Junquillos / totora palustre en un borde
      const reedMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8 });
      const headMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
      for (let r = 0; r < 7; r++) {
        const ang = 0.8 + (r * 0.18);
        const rx = Math.cos(ang) * 3.3;
        const rz = Math.sin(ang) * 3.3;
        const stalk = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.4, 6), reedMat));
        stalk.position.set(rx, 0.7, rz);
        const head = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 6), headMat));
        head.position.set(rx, 1.25, rz);
        group.add(stalk, head);
      }

      return 1.8;
    }

    // ──────────────── 12. FUENTE DE PIEDRA & ABREVADERO ────────────────
    else if (t === 'procedural_fountain') {
      const stoneMat = new THREE.MeshStandardMaterial({ color: '#a8a29e', roughness: 0.75 });
      const basin = cast(new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.95, 0.45, 18), stoneMat));
      basin.position.y = 0.225;
      group.add(basin);

      const waterMat = new THREE.MeshPhysicalMaterial({ color: '#38bdf8', roughness: 0.05, transmission: 0.8, transparent: true, opacity: 0.85 });
      const pool = cast(new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.08, 18), waterMat));
      pool.position.y = 0.38;
      group.add(pool);

      const ped = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 1.2, 12), stoneMat));
      ped.position.y = 0.85;
      group.add(ped);

      const topBasin = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.65, 0.3, 16), stoneMat));
      topBasin.position.y = 1.35;
      group.add(topBasin);

      const spoutMat = new THREE.MeshStandardMaterial({ color: '#b8860b', metalness: 0.8, roughness: 0.3 });
      const spout = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.35, 8), spoutMat));
      spout.position.y = 1.6;
      group.add(spout);

      return 2.0;
    }

    // ──────────────── 13. PISCINA RECREATIVA & RESERVA ────────────────
    else if (t === 'procedural_pool') {
      const edgeMat = new THREE.MeshStandardMaterial({ color: '#e7e5e4', roughness: 0.7 });
      const coping = cast(new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.2, 4.6), edgeMat));
      coping.position.y = 0.1;
      group.add(coping);

      const waterMat = new THREE.MeshPhysicalMaterial({
        color: '#06b6d4',
        roughness: 0.04,
        transmission: 0.82,
        transparent: true,
        opacity: 0.88,
        ior: 1.333
      });
      const water = cast(new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.08, 3.6), waterMat));
      water.position.y = 0.14;
      group.add(water);

      // Escalera de piscina en acero inoxidable
      const chromeMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.95, roughness: 0.15 });
      const rail1 = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8), chromeMat));
      rail1.position.set(3.4, 0.6, 1.2);
      const rail2 = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8), chromeMat));
      rail2.position.set(3.4, 0.6, 0.7);
      group.add(rail1, rail2);

      return 1.4;
    }

    // ──────────────── 14. HUMEDAL BIOFILTRO / ESTANQUE ────────────────
    else if (t === 'procedural_wetland') {
      const boxWood = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
      const border = cast(new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.38, 3.2), boxWood));
      border.position.y = 0.19;
      group.add(border);

      const gravelMat = new THREE.MeshStandardMaterial({ color: '#44403c', roughness: 0.95 });
      const gravel = cast(new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.24, 2.8), gravelMat));
      gravel.position.y = 0.14;
      group.add(gravel);

      const bioWaterMat = new THREE.MeshPhysicalMaterial({ color: '#0891b2', transmission: 0.7, roughness: 0.1, transparent: true, opacity: 0.75 });
      const bioWater = cast(new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.06, 2.7), bioWaterMat));
      bioWater.position.y = 0.24;
      group.add(bioWater);

      // Plantas macrófitas y totoras filtrantes
      const plantMat = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.75 });
      for (let i = 0; i < 14; i++) {
        const px = -2.0 + (i % 5) * 0.95 + ((i % 2) * 0.2);
        const pz = -1.0 + Math.floor(i / 5) * 0.9 + ((i % 3) * 0.15);
        const stalk = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.2 + (i % 3) * 0.3, 6), plantMat));
        stalk.position.set(px, 0.7, pz);
        group.add(stalk);
      }

      return 1.8;
    }

    // ──────────────── 15. CAMINO RURAL DE RIPIO ────────────────
    else if (t === 'procedural_road') {
      const gravelMat = new THREE.MeshStandardMaterial({ color: '#a8a29e', roughness: 0.95 });
      const roadBed = cast(new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.14, 11.8), gravelMat));
      roadBed.position.y = 0.07;
      group.add(roadBed);

      const shoulderMat = new THREE.MeshStandardMaterial({ color: '#785532', roughness: 0.98 });
      const sLeft = cast(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 11.8), shoulderMat));
      sLeft.position.set(-2.0, 0.04, 0);
      const sRight = cast(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 11.8), shoulderMat));
      sRight.position.set(2.0, 0.04, 0);
      group.add(sLeft, sRight);

      return 0.4;
    }

    // ──────────────── 16. SENDERO DE PIEDRA LAJA ────────────────
    else if (t === 'procedural_stone_trail') {
      const stoneMat = new THREE.MeshStandardMaterial({ color: '#78716c', roughness: 0.85 });
      const stoneMat2 = new THREE.MeshStandardMaterial({ color: '#57534e', roughness: 0.8 });

      for (let i = 0; i < 9; i++) {
        const z = -4.0 + i * 1.0;
        const xOffset = ((i % 3) - 1) * 0.3;
        const slab = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.42 + (i % 3) * 0.08, 0.46, 0.06, 7), (i % 2 === 0) ? stoneMat : stoneMat2));
        slab.position.set(xOffset, 0.03, z);
        slab.rotation.y = (i * 17) % 6;
        group.add(slab);
      }

      return 0.3;
    }

    // ──────────────── 17. VADO CON ALCANTARILLA ────────────────
    else if (t === 'procedural_culvert') {
      const concMat = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.85 });
      const deck = cast(new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.28, 4.2), concMat));
      deck.position.set(0, 0.95, 0);
      group.add(deck);

      // Cabezales / Muros de ala laterales
      const wLeft = cast(new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.25, 4.4), concMat));
      wLeft.position.set(-1.8, 0.7, 0);
      const wRight = cast(new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.25, 4.4), concMat));
      wRight.position.set(1.8, 0.7, 0);
      group.add(wLeft, wRight);

      // Tubos de alcantarilla inferiores
      const pipeMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.7 });
      for (let z of [-1.0, 1.0]) {
        const pipe = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 3.4, 14), pipeMat));
        pipe.position.set(0, 0.44, z);
        pipe.rotation.z = Math.PI / 2;
        group.add(pipe);
      }

      return 1.6;
    }

    // ──────────────── 18. PORTÓN PATRONAL DE ROBLE & FORJA ────────────────
    else if (t === 'procedural_gate_patronal') {
      const stoneMat = new THREE.MeshStandardMaterial({ color: '#78716c', roughness: 0.85 });
      const p1 = cast(new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.8, 0.7), stoneMat));
      p1.position.set(-2.0, 1.4, 0);
      const p2 = cast(new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.8, 0.7), stoneMat));
      p2.position.set(2.0, 1.4, 0);
      group.add(p1, p2);

      // Faroles coloniales en la cima
      const lanternMat = new THREE.MeshStandardMaterial({ color: '#b8860b', metalness: 0.85 });
      const l1 = cast(new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.45, 0.26), lanternMat));
      l1.position.set(-2.0, 2.95, 0);
      const l2 = cast(new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.45, 0.26), lanternMat));
      l2.position.set(2.0, 2.95, 0);
      group.add(l1, l2);

      // Batientes de roble oscuro
      const oakMat = new THREE.MeshStandardMaterial({ color: '#5c3a21', roughness: 0.85 });
      const gateL = cast(new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.2, 0.12), oakMat));
      gateL.position.set(-0.88, 1.2, 0);
      const gateR = cast(new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.2, 0.12), oakMat));
      gateR.position.set(0.88, 1.2, 0);
      group.add(gateL, gateR);

      // Herrajes de forja negra
      const ironMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.9, roughness: 0.25 });
      const h1 = cast(new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.08, 0.16), ironMat));
      h1.position.set(0, 0.6, 0);
      const h2 = cast(new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.08, 0.16), ironMat));
      h2.position.set(0, 1.8, 0);
      group.add(h1, h2);

      return 3.3;
    }

    // ──────────────── 19. TRANQUERA RÚSTICA GANADERA ────────────────
    else if (t === 'procedural_tranquera') {
      const woodMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
      const postL = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.1, 8), woodMat));
      postL.position.set(-1.8, 1.05, 0);
      const postR = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.1, 8), woodMat));
      postR.position.set(1.8, 1.05, 0);
      group.add(postL, postR);

      // 4 varas horizontales
      for (let y of [0.4, 0.75, 1.1, 1.45]) {
        const rail = cast(new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.09, 0.07), woodMat));
        rail.position.set(0, y, 0);
        group.add(rail);
      }

      // Diagonal de arriostre
      const diag = cast(new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.07), woodMat));
      diag.position.set(0, 0.95, 0);
      diag.rotation.z = Math.PI / 4;
      group.add(diag);

      return 2.2;
    }

    // ──────────────── 20. REJA PERIMETRAL DE FIERRO ────────────────
    else if (t === 'procedural_fence_metal') {
      const ironMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.92, roughness: 0.2 });
      for (let x of [-2.4, 0, 2.4]) {
        const post = cast(new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.95, 0.12), ironMat));
        post.position.set(x, 0.975, 0);
        group.add(post);
      }
      for (let y of [0.25, 1.7]) {
        const rail = cast(new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.06, 0.06), ironMat));
        rail.position.set(0, y, 0);
        group.add(rail);
      }
      for (let i = 0; i <= 16; i++) {
        const x = -2.3 + (i / 16) * 4.6;
        const picket = cast(new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.6, 0.04), ironMat));
        picket.position.set(x, 0.98, 0);
        group.add(picket);
      }

      return 2.1;
    }

    // ──────────────── 21. CERCO DE CAMPO 5 HEBRAS ────────────────
    else if (t === 'procedural_fence_wire') {
      const woodMat = new THREE.MeshStandardMaterial({ color: '#854d0e', roughness: 0.9 });
      for (let x of [-2.5, 0, 2.5]) {
        const post = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.85, 8), woodMat));
        post.position.set(x, 0.925, 0);
        group.add(post);
      }
      const wireMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.95, roughness: 0.3 });
      for (let y of [0.35, 0.65, 0.95, 1.25, 1.55]) {
        const wire = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 5.1, 6), wireMat));
        wire.position.set(0, y, 0);
        wire.rotation.z = Math.PI / 2;
        group.add(wire);
      }

      return 1.9;
    }

    // ──────────────── 22. CERCO ELÉCTRICO MÓVIL PRV ────────────────
    else if (t === 'procedural_fence_electric') {
      const postMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.4 });
      for (let x of [-2.0, 0, 2.0]) {
        const post = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.35, 6), postMat));
        post.position.set(x, 0.675, 0);
        group.add(post);
      }
      const tapeMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 });
      for (let y of [0.45, 0.85]) {
        const tape = cast(new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.035, 0.01), tapeMat));
        tape.position.set(0, y, 0);
        group.add(tape);
      }
      // Electrificador solar
      const energizerMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.4 });
      const energizer = cast(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.14), energizerMat));
      energizer.position.set(0, 1.0, 0);
      group.add(energizer);

      return 1.4;
    }

    // ──────────────── FALLBACK GENÉRICO ────────────────
    else {
      const mat = new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.8 });
      const b = cast(new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 2.0, 12), mat));
      b.position.y = 1.0;
      group.add(b);
      return 2.2;
    }
  }
}

