import React from 'react';
import { EffectComposer, Bloom, Vignette, N8AO } from '@react-three/postprocessing';

/**
 * Post-Processing Pipeline (R3F)
 * 
 * Features:
 * - N8AO (Ambient Occlusion): High-speed ground contact shadow and furrow crevice depth
 * - Bloom: Subtly highlights water specular reflections and IoT LED beacons without overexposing crops
 * - Vignette: Cinema-grade edge contrast emphasizing the farm center
 */
export function PostProcessingPipeline({ enableAO = true, enableBloom = true }) {
  return (
    <EffectComposer multisampling={4} disableNormalPass={false}>
      {/* 1. Ambient Occlusion for furrow depth */}
      {enableAO && (
        <N8AO
          aoRadius={2.8}
          intensity={1.8}
          distanceFalloff={2.0}
          color="#0f172a"
        />
      )}

      {/* 2. Selective Specular Bloom */}
      {enableBloom && (
        <Bloom
          luminanceThreshold={0.82}
          luminanceSmoothing={0.2}
          intensity={0.45}
          mipmapBlur
        />
      )}

      {/* 3. Subtle Vignette */}
      <Vignette eskil={false} offset={0.2} darkness={0.45} />
    </EffectComposer>
  );
}
