/**
 * AgriTwin - Animal Mesh 3D Factory
 * 
 * Generación procedural de mallas Three.js para animales del predio
 * (Vacas Hereford/Overas, Ovejas Suffolk, Caballos Chilenos y Gallinas)
 */

export class AnimalMeshFactory {
  /**
   * Construye una vaca procedural (Blanca y Negra o Colorada)
   */
  static buildCowMesh(index, isBrown = false) {
    const cow = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.9, 0.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: isBrown ? '#854d0e' : '#18181b',
      roughness: 0.75,
      metalness: 0.05
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.95;
    body.castShadow = true;
    cow.add(body);

    const patchGeo = new THREE.BoxGeometry(0.7, 0.7, 0.82);
    const patchMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.8 });
    const patch = new THREE.Mesh(patchGeo, patchMat);
    patch.position.set(0.1, 0.95, 0);
    cow.add(patch);

    const headGroup = new THREE.Group();
    headGroup.position.set(0.85, 1.25, 0);

    const headGeo = new THREE.BoxGeometry(0.55, 0.5, 0.5);
    const headMat = new THREE.MeshStandardMaterial({ color: isBrown ? '#854d0e' : '#18181b', roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.castShadow = true;
    headGroup.add(head);

    const snoutGeo = new THREE.BoxGeometry(0.28, 0.24, 0.38);
    const snoutMat = new THREE.MeshStandardMaterial({ color: '#fda4af', roughness: 0.6 });
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.position.set(0.32, -0.1, 0);
    headGroup.add(snout);

    const hornGeo = new THREE.ConeGeometry(0.04, 0.22, 6);
    const hornMat = new THREE.MeshStandardMaterial({ color: '#fef08a' });
    [-0.2, 0.2].forEach(z => {
      const horn = new THREE.Mesh(hornGeo, hornMat);
      horn.position.set(-0.05, 0.3, z);
      horn.rotation.z = -Math.PI / 6;
      headGroup.add(horn);
    });

    cow.add(headGroup);
    cow.userData.headGroup = headGroup;

    // Patas
    const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.8, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: '#18181b' });
    [
      [-0.55, -0.26],
      [-0.55, 0.26],
      [0.55, -0.26],
      [0.55, 0.26]
    ].forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, 0.4, z);
      leg.castShadow = true;
      cow.add(leg);
    });

    cow.scale.set(0.85, 0.85, 0.85);
    cow.userData.animOffset = index * 1.5;
    return cow;
  }

  /**
   * Construye una oveja procedural
   */
  static buildSheepMesh(index) {
    const sheep = new THREE.Group();
    const bodyGeo = new THREE.DodecahedronGeometry(0.52, 1);
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#f5f5f4', roughness: 0.95 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.55;
    body.castShadow = true;
    sheep.add(body);

    const headGeo = new THREE.BoxGeometry(0.32, 0.28, 0.26);
    const headMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.8 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0.48, 0.65, 0);
    head.castShadow = true;
    sheep.add(head);

    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6);
    const legMat = new THREE.MeshStandardMaterial({ color: '#18181b' });
    [
      [-0.24, -0.18],
      [-0.24, 0.18],
      [0.24, -0.18],
      [0.24, 0.18]
    ].forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, 0.2, z);
      sheep.add(leg);
    });

    sheep.scale.set(0.9, 0.9, 0.9);
    sheep.userData.animOffset = index * 2.1;
    sheep.userData.head = head;
    return sheep;
  }

  /**
   * Construye un caballo criollo chileno
   */
  static buildHorseMesh(index, coatColor = '#c29858', maneColor = '#1c1917') {
    const horse = new THREE.Group();

    // 1. Torso muscular
    const bodyGeo = new THREE.BoxGeometry(1.85, 0.95, 0.72);
    const bodyMat = new THREE.MeshStandardMaterial({ color: coatColor, roughness: 0.65, metalness: 0.1 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.25;
    body.castShadow = true;
    horse.add(body);

    // 2. Cuello arqueado
    const neckGroup = new THREE.Group();
    neckGroup.position.set(0.85, 1.45, 0);

    const neckGeo = new THREE.BoxGeometry(0.55, 1.05, 0.38);
    const neckMesh = new THREE.Mesh(neckGeo, bodyMat);
    neckMesh.position.set(0.18, 0.45, 0);
    neckMesh.rotation.z = -Math.PI / 4.5;
    neckMesh.castShadow = true;
    neckGroup.add(neckMesh);

    // Crin (Mane)
    const maneGeo = new THREE.BoxGeometry(0.14, 1.0, 0.18);
    const maneMat = new THREE.MeshStandardMaterial({ color: maneColor, roughness: 0.9 });
    const maneMesh = new THREE.Mesh(maneGeo, maneMat);
    maneMesh.position.set(0.08, 0.52, 0);
    maneMesh.rotation.z = -Math.PI / 4.5;
    neckGroup.add(maneMesh);

    // Cabeza fina
    const headGeo = new THREE.BoxGeometry(0.68, 0.42, 0.34);
    const headMesh = new THREE.Mesh(headGeo, bodyMat);
    headMesh.position.set(0.48, 0.88, 0);
    headMesh.castShadow = true;
    neckGroup.add(headMesh);

    // Hocico
    const muzzleGeo = new THREE.BoxGeometry(0.32, 0.26, 0.28);
    const muzzleMat = new THREE.MeshStandardMaterial({ color: '#1c1917', roughness: 0.7 });
    const muzzleMesh = new THREE.Mesh(muzzleGeo, muzzleMat);
    muzzleMesh.position.set(0.85, 0.78, 0);
    neckGroup.add(muzzleMesh);

    // Orejas alertas erguidas
    const earGeo = new THREE.ConeGeometry(0.05, 0.22, 4);
    [-0.1, 0.1].forEach(z => {
      const ear = new THREE.Mesh(earGeo, bodyMat);
      ear.position.set(0.32, 1.15, z);
      neckGroup.add(ear);
    });

    horse.add(neckGroup);
    horse.userData.neckGroup = neckGroup;

    // 3. Patas esbeltas
    const legGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.95, 6);
    const legMat = new THREE.MeshStandardMaterial({ color: coatColor, roughness: 0.7 });
    const hoofGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.15, 6);
    const hoofMat = new THREE.MeshStandardMaterial({ color: '#171717', roughness: 0.5 });

    [
      [-0.65, -0.24],
      [-0.65, 0.24],
      [0.65, -0.24],
      [0.65, 0.24]
    ].forEach(([x, z]) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(x, 0.55, z);

      const leg = new THREE.Mesh(legGeo, legMat);
      leg.castShadow = true;
      legGroup.add(leg);

      const hoof = new THREE.Mesh(hoofGeo, hoofMat);
      hoof.position.y = -0.42;
      legGroup.add(hoof);

      horse.add(legGroup);
    });

    // 4. Cola larga
    const tailGeo = new THREE.CylinderGeometry(0.05, 0.14, 1.05, 6);
    const tail = new THREE.Mesh(tailGeo, maneMat);
    tail.position.set(-1.0, 1.1, 0);
    tail.rotation.z = Math.PI / 7;
    horse.add(tail);
    horse.userData.tail = tail;

    horse.scale.set(0.95, 0.95, 0.95);
    horse.userData.animOffset = index * 1.8;
    return horse;
  }
}
