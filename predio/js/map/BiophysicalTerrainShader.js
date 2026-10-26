/**
 * AgriTwin 3D - BiophysicalTerrainShader Module
 * Injects custom GLSL shaders into MeshStandardMaterial via onBeforeCompile.
 * 
 * Features:
 * - Dynamic soil color blending: dry clay/straw -> saturated humus -> lush vegetative green
 * - PBR roughness attenuation driven by ground moisture (specular wet sheen)
 * - Micro-relief river bank capillary fringe effect
 */

export class BiophysicalTerrainShader {
  /**
   * Applies the biophysical moisture shader hooks to a MeshStandardMaterial.
   * 
   * @param {THREE.MeshStandardMaterial} material 
   * @param {Object} options 
   * @returns {Object} shaderReference with uniforms
   */
  static apply(material, options = {}) {
    const uniforms = {
      uGlobalMoisture: { value: options.initialMoisture !== undefined ? options.initialMoisture : 0.45 },
      uTime:           { value: 0.0 },
      uDrySoilColor:   { value: new THREE.Color('#5c4033') }, // Tierra franca oscura / arcilla cálida
      uWetSoilColor:   { value: new THREE.Color('#1c130d') }, // Humus fértil negro
      uLushGreenColor: { value: new THREE.Color('#0f3d1f') }, // Verde clorofila esmeralda profundo
      uRiverInfluence: { value: 1.0 },
      uNdviMode:       { value: 0.0 } // 0.0 = Real Soil PBR, 1.0 = Satellite NDVI Multispectral Heatmap
    };

    material.userData.biophysicalUniforms = uniforms;

    const prevOnBeforeCompile = material.onBeforeCompile;

    material.onBeforeCompile = (shader, renderer) => {
      if (prevOnBeforeCompile) prevOnBeforeCompile(shader, renderer);

      // Connect custom uniforms to shader program
      Object.assign(shader.uniforms, uniforms);

      // 1. Vertex Shader Hook: export world coordinates and height
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
         varying vec3 vTerrainWorldPos;
         varying vec2 vTerrainUv;
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
         vTerrainWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
         vTerrainUv = uv;
        `
      );

      // 2. Fragment Shader Hook: biophysical soil moisture & NDVI formula
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
         uniform float uGlobalMoisture;
         uniform float uTime;
         uniform vec3 uDrySoilColor;
         uniform vec3 uWetSoilColor;
         uniform vec3 uLushGreenColor;
         uniform float uRiverInfluence;
         uniform float uNdviMode;

         varying vec3 vTerrainWorldPos;
         varying vec2 vTerrainUv;

         // Distance to River Meander path
         float calculateRiverProximity(vec3 pos) {
           float t = (pos.z + 90.0) / 180.0;
           float riverX = -18.0 + sin(pos.z * 0.045) * 8.0 + cos(pos.z * 0.02) * 4.0;
           float d = abs(pos.x - riverX);
           return clamp(1.0 - (d / 18.0), 0.0, 1.0);
         }

         // Sentinel-2 Scientific NDVI Palette: Brown (barren) -> Red/Orange (stressed) -> Yellow -> Green (vigorous)
         vec3 getNdviPalette(float ndvi) {
           if (ndvi < 0.15) return mix(vec3(0.55, 0.27, 0.07), vec3(0.85, 0.22, 0.12), ndvi / 0.15);
           if (ndvi < 0.35) return mix(vec3(0.85, 0.22, 0.12), vec3(0.95, 0.82, 0.15), (ndvi - 0.15) / 0.20);
           if (ndvi < 0.60) return mix(vec3(0.95, 0.82, 0.15), vec3(0.22, 0.75, 0.25), (ndvi - 0.35) / 0.25);
           return mix(vec3(0.22, 0.75, 0.25), vec3(0.04, 0.45, 0.18), (ndvi - 0.60) / 0.40);
         }
        `
      );

      // 3. Color modification Hook
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         // Calculate local moisture potential
         float riverCapillary = calculateRiverProximity(vTerrainWorldPos) * uRiverInfluence;
         
         // Core cultivated farm field mask
         float fieldMask = smoothstep(0.20, 0.35, vTerrainUv.x) * (1.0 - smoothstep(0.70, 0.85, vTerrainUv.x)) *
                           smoothstep(0.15, 0.30, vTerrainUv.y) * (1.0 - smoothstep(0.75, 0.90, vTerrainUv.y));

         // Effective moisture: global setting + river proximity + field irrigation
         float localMoisture = clamp(uGlobalMoisture + riverCapillary * 0.45 + fieldMask * 0.25, 0.0, 1.0);

         // Base soil transition: Dry Clay -> Humus Wet Soil
         vec3 moistureSoil = mix(uDrySoilColor, uWetSoilColor, smoothstep(0.1, 0.7, localMoisture));

         // In high moisture, vegetative and microbial greening appears
         float greening = smoothstep(0.45, 0.95, localMoisture) * (0.4 + 0.6 * fieldMask);
         vec3 bioColor = mix(moistureSoil, uLushGreenColor, greening);

         // Dynamic NDVI Simulation: 0.15 (bare soil) to 0.88 (dense irrigated canopy)
         float simulatedNdvi = clamp(0.12 + fieldMask * 0.52 + riverCapillary * 0.24 + uGlobalMoisture * 0.15, 0.05, 0.92);
         vec3 ndviColor = getNdviPalette(simulatedNdvi);

         vec3 finalColor = mix(bioColor, ndviColor, uNdviMode);

         // Blend with existing vertex colors if present
         #ifdef USE_COLOR
           diffuseColor.rgb = mix(diffuseColor.rgb, finalColor, mix(0.65, 0.95, uNdviMode));
         #else
           diffuseColor.rgb = finalColor;
         #endif
        `
      );

      // 4. Roughness attenuation: Wet soil reflects light with specular Fresnel sheen
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         // Attenuate roughness on wet ground (specular water sheen in furrows)
         float wetness = clamp(uGlobalMoisture * 0.6 + calculateRiverProximity(vTerrainWorldPos) * 0.4, 0.0, 0.9);
         roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.45, wetness);
        `
      );
    };

    return uniforms;
  }

  /**
   * Updates moisture level and uniforms in real-time.
   * 
   * @param {Object} uniforms 
   * @param {number} moisturePercent (0 to 100 or 0 to 1)
   */
  static updateMoisture(uniforms, moistureVal) {
    if (!uniforms || !uniforms.uGlobalMoisture) return;
    const normalized = moistureVal > 1.0 ? moistureVal / 100 : moistureVal;
    uniforms.uGlobalMoisture.value = Math.max(0.0, Math.min(1.0, normalized));
  }

  static updateTime(uniforms, deltaSeconds) {
    if (!uniforms || !uniforms.uTime) return;
    uniforms.uTime.value += deltaSeconds;
  }

  /**
   * Toggles satellite NDVI heatmap layer on terrain in real-time.
   * 
   * @param {Object} uniforms 
   * @param {boolean} active 
   */
  static setNdviMode(uniforms, active) {
    if (!uniforms || !uniforms.uNdviMode) return;
    uniforms.uNdviMode.value = active ? 1.0 : 0.0;
  }
}
