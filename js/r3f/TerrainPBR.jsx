import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PBRSoilGenerator } from '../map/PBRSoilGenerator.js';
import { BiophysicalTerrainShader } from '../map/BiophysicalTerrainShader.js';

/**
 * PBR Agricultural Terrain with Furrow Micro-Relief & Biophysical Moisture Shader
 * 
 * Features:
 * - 256×256 vertex elevation grid with estero meander and Andean gradient
 * - Procedural NormalMap (sobel-encoded plowing furrows) & RoughnessMap
 * - Dynamic soil color modulation (dry clay/straw -> wet humus -> vegetative green)
 * - PBR specular Fresnel wet sheen
 */
export function TerrainPBR({ moistureLevel = 0.38, reliefScale = 1.0 }) {
  const meshRef = useRef();
  const uniformsRef = useRef();

  // 1. Procedural PBR Normal & Roughness Maps (Tiled furrows)
  const { normalMap, roughnessMap } = useMemo(() => {
    return {
      normalMap: PBRSoilGenerator.createSoilNormalMap(1024),
      roughnessMap: PBRSoilGenerator.createSoilRoughnessMap(1024)
    };
  }, []);

  // 2. Geometry with elevation and vertex coloring
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(180, 180, 256, 256);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Base undulating terrain
      let y = Math.sin(x * 0.05) * 1.4 + Math.cos(z * 0.04) * 1.8 + Math.sin(x * 0.02 + z * 0.02) * 2.5;

      // Andean slope towards East
      if (x > 25) {
        const andesProgress = (x - 25) / 65.0;
        y += Math.pow(andesProgress, 1.5) * 18.0;
      }

      // Estero meander incision
      const riverX = -18.0 + Math.sin(z * 0.045) * 8.0 + Math.cos(z * 0.02) * 4.0;
      const dist = Math.abs(x - riverX);
      if (dist < 4.2) {
        y -= (1 - Math.pow(dist / 4.2, 2)) * 2.8;
      }

      pos.setY(i, y * reliefScale);

      // Vertex color zones (Civ VI style)
      let r = 0.56, g = 0.62, b = 0.30;
      if (dist < 8.0) {
        r = 0.20; g = 0.48; b = 0.22; // Riparian lush
      } else if (y > 9.0) {
        r = 0.88; g = 0.90; b = 0.96; // Snow peak
      } else if (y > 3.0) {
        r = 0.68; g = 0.52; b = 0.30; // Ochre ridge
      } else {
        r = 0.42; g = 0.58; b = 0.26; // Cultivated field
      }

      colors[i * 3]     = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [reliefScale]);

  // 3. PBR Material with Biophysical GLSL Shader Hooks
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      normalMap,
      normalScale: new THREE.Vector2(1.6, 1.6),
      roughnessMap,
      roughness: 0.86,
      metalness: 0.04,
      flatShading: false
    });

    uniformsRef.current = BiophysicalTerrainShader.apply(mat, { initialMoisture: moistureLevel });
    return mat;
  }, [normalMap, roughnessMap]);

  // Update moisture in real-time
  useFrame((state, delta) => {
    if (uniformsRef.current) {
      BiophysicalTerrainShader.updateMoisture(uniformsRef.current, moistureLevel);
      BiophysicalTerrainShader.updateTime(uniformsRef.current, delta);
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      receiveShadow
      castShadow={false}
    />
  );
}
