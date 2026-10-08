import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Interactive Parcel Extrusions with Civilization VI Style Y-Axis Hover
 * 
 * Features:
 * - Extruded parcel shapes with beveled rims
 * - Smooth lerped Y-axis displacement on mouse hover / selection
 * - Glowing neon boundary lines with pulsating emissive feedback
 */
export function InteractiveParcels({ parcels = [], onSelectParcel }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  return (
    <group name="interactive_parcels">
      {parcels.map((p) => (
        <ParcelMeshItem
          key={p.id}
          parcel={p}
          isHovered={hoveredId === p.id}
          isSelected={selectedId === p.id}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredId(p.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            if (hoveredId === p.id) setHoveredId(null);
          }}
          onClick={(e) => {
            e.stopPropagation();
            const newSel = selectedId === p.id ? null : p.id;
            setSelectedId(newSel);
            if (onSelectParcel) onSelectParcel(newSel ? p : null);
          }}
        />
      ))}
    </group>
  );
}

function ParcelMeshItem({ parcel, isHovered, isSelected, onPointerOver, onPointerOut, onClick }) {
  const meshRef = useRef();
  const edgeLineRef = useRef();

  // Create Shape & Extrusion Geometry
  const { geometry, edgeGeometry } = useMemo(() => {
    const coords = parcel.coordinates || [
      [-10, -10], [10, -10], [10, 10], [-10, 10]
    ];
    const points = coords.map(([x, z]) => new THREE.Vector2(x, z));
    const shape = new THREE.Shape(points);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.6,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.2,
      bevelThickness: 0.2
    });
    geo.rotateX(Math.PI / 2);

    const edgeGeo = new THREE.EdgesGeometry(geo, 28);
    return { geometry: geo, edgeGeometry: edgeGeo };
  }, [parcel.coordinates]);

  const baseColor = parcel.color || '#15803d';
  const baseY = 0.45;
  const targetY = isSelected ? baseY + 1.25 : (isHovered ? baseY + 0.85 : baseY);

  // Smooth spring-lerp Y-axis animation on every frame
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.14;

    if (edgeLineRef.current) {
      if (isSelected || isHovered) {
        edgeLineRef.current.visible = true;
        const pulse = isSelected ? 0.7 + 0.3 * Math.sin(state.clock.elapsedTime * 6.0) : 0.6;
        edgeLineRef.current.material.opacity = pulse;
      } else {
        edgeLineRef.current.visible = false;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, baseY, 0]}
      castShadow
      receiveShadow
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    >
      <meshStandardMaterial
        color={baseColor}
        roughness={0.65}
        metalness={0.08}
        transparent
        opacity={0.72}
        emissive={baseColor}
        emissiveIntensity={isSelected ? 0.35 : (isHovered ? 0.22 : 0.08)}
      />

      {/* Glowing Edge Contour Lines */}
      <lineSegments ref={edgeLineRef} geometry={edgeGeometry} visible={false}>
        <lineBasicMaterial
          color={isSelected ? '#fbbf24' : '#34d399'}
          transparent
          opacity={0.8}
        />
      </lineSegments>
    </mesh>
  );
}
