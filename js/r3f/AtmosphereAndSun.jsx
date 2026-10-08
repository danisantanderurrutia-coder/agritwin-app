import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Sky } from '@react-three/drei';
import * as THREE from 'three';

/**
 * PBR Atmosphere & Dynamic Solar System
 * 
 * Features:
 * - DirectionalLight with soft PCF shadow maps, calibrated frustum and bias to avoid shadow acne
 * - <Environment preset="sunset" /> for rich agricultural golden hour IBL irradiance and reflections
 * - Physical atmospheric fogExp2 with solar elevation color shifts
 */
export function AtmosphereAndSun({ hourOfDay = 17.5, dayOfYear = 172 }) {
  const sunLightRef = useRef();

  // Calculate physical solar position (Parral, Maule -36.14°S)
  const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81)) * (Math.PI / 180);
  const hourAngle = (hourOfDay - 12) * 15 * (Math.PI / 180);
  const latRad = -36.14 * (Math.PI / 180);

  const sinElev = Math.sin(latRad) * Math.sin(declination) + Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle);
  const elevation = Math.asin(Math.max(-1, Math.min(1, sinElev)));
  const cosAz = (Math.sin(declination) - Math.sin(latRad) * sinElev) / (Math.cos(latRad) * Math.cos(elevation));
  const azimuth = Math.atan2(Math.sin(hourAngle), cosAz);

  const distance = 120;
  const sunPos = [
    distance * Math.cos(elevation) * Math.sin(azimuth),
    Math.max(8, distance * Math.sin(elevation)),
    distance * Math.cos(elevation) * Math.cos(azimuth)
  ];

  // Dynamic fog color calculation
  let fogColor = '#b8cce0';
  if (hourOfDay < 6 || hourOfDay > 21) fogColor = '#0b132b';
  else if (hourOfDay < 9) fogColor = '#e0a96d';
  else if (hourOfDay > 18) fogColor = '#b56576';

  return (
    <>
      {/* 1. Atmospheric Fog */}
      <fogExp2 attach="fog" args={[fogColor, 0.0028]} />

      {/* 2. Ambient & Sky Fill Light */}
      <ambientLight intensity={0.45} color="#fef3c7" />
      <hemisphereLight args={['#bae6fd', '#3f6212', 0.5]} />

      {/* 3. Solar Directional Light with Soft Shadows */}
      <directionalLight
        ref={sunLightRef}
        position={sunPos}
        intensity={hourOfDay > 18 || hourOfDay < 7 ? 1.2 : 1.85}
        color={hourOfDay > 17 || hourOfDay < 9 ? '#fb923c' : '#fffbeb'}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={1.0}
        shadow-camera-far={420}
        shadow-camera-left={-95}
        shadow-camera-right={95}
        shadow-camera-top={95}
        shadow-camera-bottom={-95}
        shadow-bias={-0.0003}
        shadow-normalBias={0.04}
      />

      {/* Sky bounce fill */}
      <directionalLight position={[-40, 25, -40]} intensity={0.35} color="#93c5fd" />

      {/* 4. Preetham Sky Dome */}
      <Sky
        sunPosition={sunPos}
        turbidity={8}
        rayleigh={6}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* 5. Sunset HDRI Environment (Drei) for PBR Sheen */}
      <Environment preset="sunset" />
    </>
  );
}
