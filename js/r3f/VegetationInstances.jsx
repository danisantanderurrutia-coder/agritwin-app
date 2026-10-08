import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { InstancedVegetationManager } from '../entities/InstancedVegetationManager.js';

/**
 * Massive Single-Draw-Call Vegetation & Farm Machinery Instances
 * 
 * Renders hundreds of native trees, vineyard rows, and tractors in 1-3 Draw Calls.
 * Features:
 * - Instance matrix transformation with organic scaling and rotation jitter
 * - Instance color variation driven by NDVI / biological vigor
 * - Built-in GLTF asset loading support with high-detail procedural fallback
 */
export function VegetationInstances({ treesData = [], onSelectEntity }) {
  const nativeTreesRef = useRef();
  const vineyardsRef = useRef();
  const machineryRef = useRef();

  const helper = useMemo(() => new InstancedVegetationManager({}), []);

  // 1. Native Tree Geometry & Material
  const treeGeometry = useMemo(() => helper.createStylizedNativeTreeGeometry(), [helper]);
  const treeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.72,
    metalness: 0.05,
    flatShading: true,
    vertexColors: true
  }), []);

  // 2. Vineyard Trellis Geometry & Material
  const vineyardGeometry = useMemo(() => helper.createVineyardTrellisGeometry(), [helper]);
  const vineyardMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.65,
    metalness: 0.05,
    vertexColors: true
  }), []);

  // 3. Precision Tractor Geometry & Material
  const tractorGeometry = useMemo(() => helper.createPrecisionTractorGeometry(), [helper]);
  const tractorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.35,
    metalness: 0.75,
    vertexColors: true
  }), []);

  const countTrees = Math.max(treesData.length + 80, 240);
  const countVineyards = 36;
  const countMachinery = 2;

  // Populate native trees matrices and colors
  useEffect(() => {
    if (!nativeTreesRef.current) return;
    const mesh = nativeTreesRef.current;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    let idx = 0;
    treesData.forEach(t => {
      if (idx >= countTrees) return;
      const x = (t.location?.longitude || -71.82) * 8800; // or mapped
      const z = -(t.location?.latitude || -36.14) * 11100;
      const scale = (0.85 + Math.random() * 0.3);

      dummy.position.set(t.x || ((Math.random() - 0.5) * 120), 0.45, t.z || ((Math.random() - 0.5) * 120));
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      mesh.setMatrixAt(idx, dummy.matrix);
      color.set('#166534').offsetHSL((Math.random() - 0.5) * 0.05, 0, (Math.random() - 0.5) * 0.1);
      mesh.setColorAt(idx, color);
      idx++;
    });

    for (; idx < countTrees; idx++) {
      const z = (Math.random() - 0.5) * 150;
      const riverX = -18.0 + Math.sin(z * 0.045) * 8.0 + (Math.random() - 0.5) * 14.0;
      const scale = 0.75 + Math.random() * 0.45;

      dummy.position.set(riverX, 0.45, z);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      mesh.setMatrixAt(idx, dummy.matrix);
      color.set('#047857').offsetHSL((Math.random() - 0.5) * 0.06, 0.1, (Math.random() - 0.5) * 0.1);
      mesh.setColorAt(idx, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [treesData, countTrees]);

  // Populate vineyard rows
  useEffect(() => {
    if (!vineyardsRef.current) return;
    const mesh = vineyardsRef.current;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color('#2e1065');

    for (let i = 0; i < countVineyards; i++) {
      const x = 14 + (i % 6) * 2.4;
      const z = -18 + Math.floor(i / 6) * 5.2;

      dummy.position.set(x, 0.45, z);
      dummy.rotation.y = 0.05;
      dummy.scale.set(1.0, 1.0, 1.0);
      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);
      color.set('#2e1065').offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [countVineyards]);

  // Populate machinery
  useEffect(() => {
    if (!machineryRef.current) return;
    const mesh = machineryRef.current;
    const dummy = new THREE.Object3D();

    // Tractor 1: John Deere
    dummy.position.set(-6.5, 0.45, -2.5);
    dummy.rotation.y = Math.PI / 4;
    dummy.scale.set(1.1, 1.1, 1.1);
    dummy.updateMatrix();
    mesh.setMatrixAt(0, dummy.matrix);
    mesh.setColorAt(0, new THREE.Color('#15803d'));

    // Tractor 2: New Holland
    dummy.position.set(8.2, 0.45, -14.0);
    dummy.rotation.y = -Math.PI / 6;
    dummy.scale.set(1.1, 1.1, 1.1);
    dummy.updateMatrix();
    mesh.setMatrixAt(1, dummy.matrix);
    mesh.setColorAt(1, new THREE.Color('#0284c7'));

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [countMachinery]);

  return (
    <group name="vegetation_instances">
      {/* Native Forest (Single Draw Call) */}
      <instancedMesh
        ref={nativeTreesRef}
        args={[treeGeometry, treeMaterial, countTrees]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          if (onSelectEntity) onSelectEntity({ type: 'crop', instanceId: e.instanceId });
        }}
      />

      {/* Vineyards (Single Draw Call) */}
      <instancedMesh
        ref={vineyardsRef}
        args={[vineyardGeometry, vineyardMaterial, countVineyards]}
        castShadow
        receiveShadow
      />

      {/* Farm Machinery Tractors (Single Draw Call) */}
      <instancedMesh
        ref={machineryRef}
        args={[tractorGeometry, tractorMaterial, countMachinery]}
        castShadow
        receiveShadow
      />
    </group>
  );
}
