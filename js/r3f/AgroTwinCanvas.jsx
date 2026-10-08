import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

import { AtmosphereAndSun } from './AtmosphereAndSun.jsx';
import { TerrainPBR } from './TerrainPBR.jsx';
import { VegetationInstances } from './VegetationInstances.jsx';
import { InteractiveParcels } from './InteractiveParcels.jsx';
import { IoTSensorNodes } from './IoTSensorNodes.jsx';
import { PostProcessingPipeline } from './PostProcessingPipeline.jsx';

/**
 * AgroTwin 3D Master Canvas (React Three Fiber)
 * 
 * Direct replacement viewer component for React / Next.js / Vite architectures.
 * Inspired by Civilization VI & Farming Simulator (Precision Farming).
 * 
 * @param {Object} props
 * @param {number} props.hourOfDay - Simulation hour (0 - 24)
 * @param {number} props.dayOfYear - Day of year (1 - 365)
 * @param {number} props.moistureLevel - Global soil moisture (0.0 to 1.0)
 * @param {number} props.reliefScale - Topographic elevation exaggeration (0.1 to 4.0)
 * @param {Array} props.treesData - Raw crop/tree JSON dataset
 * @param {Array} props.parcelsData - GeoJSON parcels feature list
 * @param {Array} props.sensorsData - IoT sensor nodes list
 * @param {Function} props.onSelectEntity - Callback on clicking any parcel, tree, or sensor
 */
export function AgroTwinCanvas({
  hourOfDay = 17.5, // Default agricultural Golden Hour
  dayOfYear = 172,
  moistureLevel = 0.38,
  reliefScale = 1.0,
  treesData = [],
  parcelsData = [],
  sensorsData = [],
  onSelectEntity = () => {},
  enablePostProcessing = true
}) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.25,
          outputColorSpace: THREE.SRGBColorSpace
        }}
        camera={{ position: [22, 40, 52], fov: 45, near: 0.1, far: 1200 }}
      >
        {/* Camera Orbit Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.15}
          minDistance={5}
          maxDistance={250}
          target={[0, 0, 0]}
        />

        <Suspense fallback={null}>
          {/* 1. PBR Lighting, Soft PCF Shadows & Sunset IBL Environment */}
          <AtmosphereAndSun hourOfDay={hourOfDay} dayOfYear={dayOfYear} />

          {/* 2. PBR Terrain Mesh with Furrow NormalMap & Biophysical Moisture Shader */}
          <TerrainPBR moistureLevel={moistureLevel} reliefScale={reliefScale} />

          {/* 3. Massive Single-Draw-Call Instanced Vegetation & Precision Tractor Machinery */}
          <VegetationInstances treesData={treesData} onSelectEntity={onSelectEntity} />

          {/* 4. Interactive Civilization VI Extruded Parcels (Y-Axis Hover & Glowing Contours) */}
          <InteractiveParcels parcels={parcelsData} onSelectParcel={onSelectEntity} />

          {/* 5. Precision IoT Sensor Nodes with 3D Floating HTML Micro-Cards (Drei <Html>) */}
          <IoTSensorNodes sensors={sensorsData} onSelectSensor={onSelectEntity} />

          {/* 6. Post-Processing Pipeline: N8AO Ambient Occlusion + Bloom + Vignette */}
          {enablePostProcessing && <PostProcessingPipeline />}
        </Suspense>
      </Canvas>
    </div>
  );
}
