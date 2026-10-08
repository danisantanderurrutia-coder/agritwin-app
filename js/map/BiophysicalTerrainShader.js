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
      uGlobalMoisture: { value: options.initialMoisture !== undefined ? options.initialMoisture : 0.38 },
      uTime:           { value: 0.0 },
      uDrySoilColor:   { value: new THREE.Color('#38281a').convertSRGBToLinear() }, // Suelo arable franco natural fértil (Linear)
      uWetSoilColor:   { value: new THREE.Color('#140d08').convertSRGBToLinear() }, // Humus profundo orgánico húmedo y saturado (Linear)
      uLushGreenColor: { value: new THREE.Color('#1b6326').convertSRGBToLinear() }, // Verde clorofila pradera natural hiperrealista (Linear)
      uRiverInfluence: { value: 1.0 },
      uNdviMode:       { value: 0.0 }, // 0.0 = Real Soil PBR, 1.0 = NDVI, 2.0 = DEM Hypsometric, 3.0 = NDWI Water, 4.0 = NBR/Biomass
      uLayerMode:      { value: 0.0 }  // Alias for multispectral layer index
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
         varying float vTerrainElev;
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
         vTerrainWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
         vTerrainUv = uv;
         vTerrainElev = transformed.y;
        `
      );

      // 2. Fragment Shader Hook: biophysical soil moisture & Multispectral formulas (NDVI, DEM, NDWI, NBR)
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
         uniform float uLayerMode;

         varying vec3 vTerrainWorldPos;
         varying vec2 vTerrainUv;
         varying float vTerrainElev;

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

         // DEM Hypsometric tint with Stratigraphic Contour Lines
         vec3 getDemPalette(float h) {
           vec3 c;
           if (h < -1.2)      c = mix(vec3(0.01, 0.35, 0.65), vec3(0.02, 0.68, 0.82), clamp((h + 3.0) / 1.8, 0.0, 1.0));
           else if (h < 0.3)  c = mix(vec3(0.06, 0.68, 0.45), vec3(0.48, 0.78, 0.12), clamp((h + 1.2) / 1.5, 0.0, 1.0));
           else if (h < 2.2)  c = mix(vec3(0.48, 0.78, 0.12), vec3(0.92, 0.72, 0.05), clamp((h - 0.3) / 1.9, 0.0, 1.0));
           else if (h < 4.2)  c = mix(vec3(0.92, 0.72, 0.05), vec3(0.88, 0.36, 0.08), clamp((h - 2.2) / 2.0, 0.0, 1.0));
           else if (h < 6.5)  c = mix(vec3(0.88, 0.36, 0.08), vec3(0.68, 0.12, 0.12), clamp((h - 4.2) / 2.3, 0.0, 1.0));
           else               c = mix(vec3(0.68, 0.12, 0.12), vec3(0.98, 0.98, 1.0), clamp((h - 6.5) / 2.5, 0.0, 1.0));

           // Curvas de nivel topográficas
           float minorLine = smoothstep(0.40, 0.5, abs(fract(h * 1.25) - 0.5));
           float majorLine = smoothstep(0.44, 0.5, abs(fract(h * 0.25) - 0.5));
           c = mix(c, vec3(0.05, 0.08, 0.14), minorLine * 0.35);
           c = mix(c, vec3(1.0, 1.0, 1.0), majorLine * 0.65);
           return c;
         }

         // Sentinel-2 NDWI (Water Index) Palette: Dry clay -> Moist meadow -> Shallow water -> Deep Channel
         vec3 getNdwiPalette(float ndwi) {
           if (ndwi < -0.2) return mix(vec3(0.72, 0.58, 0.38), vec3(0.55, 0.65, 0.42), (ndwi + 0.5) / 0.3);
           if (ndwi < 0.1)  return mix(vec3(0.55, 0.65, 0.42), vec3(0.25, 0.72, 0.78), (ndwi + 0.2) / 0.3);
           if (ndwi < 0.45) return mix(vec3(0.25, 0.72, 0.78), vec3(0.08, 0.45, 0.88), (ndwi - 0.1) / 0.35);
           return mix(vec3(0.08, 0.45, 0.88), vec3(0.02, 0.15, 0.55), clamp((ndwi - 0.45) / 0.4, 0.0, 1.0));
         }

         // NBR / Forest Biomass Palette: Bare soil/Rock -> Shrub -> Native Forest -> Dense Canopy
         vec3 getNbrBiomassPalette(float nbr) {
           if (nbr < 0.1)  return mix(vec3(0.42, 0.28, 0.22), vec3(0.78, 0.55, 0.22), nbr / 0.1);
           if (nbr < 0.35) return mix(vec3(0.78, 0.55, 0.22), vec3(0.85, 0.78, 0.18), (nbr - 0.1) / 0.25);
           if (nbr < 0.65) return mix(vec3(0.85, 0.78, 0.18), vec3(0.28, 0.68, 0.32), (nbr - 0.35) / 0.30);
           return mix(vec3(0.28, 0.68, 0.32), vec3(0.08, 0.35, 0.12), clamp((nbr - 0.65) / 0.35, 0.0, 1.0));
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
         float localMoisture = clamp(uGlobalMoisture + riverCapillary * 0.40 + fieldMask * 0.25, 0.0, 1.0);

         // Base soil transition: Real arable soil -> Deep organic humus
         vec3 moistureSoil = mix(uDrySoilColor, uWetSoilColor, smoothstep(0.15, 0.75, localMoisture));

         // Vegetative canopy vitality (pastures, alfalfa, cover crops)
         float canopy = clamp(fieldMask * 0.85 + riverCapillary * 0.65 + smoothstep(0.30, 0.85, localMoisture) * 0.35, 0.0, 1.0);
         vec3 bioColor = mix(moistureSoil, uLushGreenColor, canopy);

         // Dynamic multispectral indices simulation
         float simulatedNdvi = clamp(0.15 + fieldMask * 0.52 + riverCapillary * 0.24 + uGlobalMoisture * 0.15, 0.05, 0.92);
         float simulatedNdwi = clamp(-0.35 + riverCapillary * 0.92 + localMoisture * 0.25 - clamp(vTerrainElev * 0.08, 0.0, 0.5), -0.5, 0.85);
         float simulatedNbr  = clamp(0.12 + canopy * 0.65 + (vTerrainElev > 3.0 ? 0.18 : 0.0), 0.05, 0.95);

         vec3 ndviColor = getNdviPalette(simulatedNdvi);
         vec3 demColor  = getDemPalette(vTerrainElev);
         vec3 ndwiColor = getNdwiPalette(simulatedNdwi);
         vec3 nbrColor  = getNbrBiomassPalette(simulatedNbr);

         // Determine active spectral / topographic color
         vec3 spectralColor = ndviColor;
         float effectiveMode = uLayerMode > 0.0 ? uLayerMode : uNdviMode;

         if (effectiveMode >= 3.5) {
           spectralColor = nbrColor;  // Modo NBR / Biomasa
         } else if (effectiveMode >= 2.5) {
           spectralColor = ndwiColor; // Modo NDWI Agua
         } else if (effectiveMode >= 1.5) {
           spectralColor = demColor;  // Modo DEM Hipsométrico
         } else {
           spectralColor = ndviColor; // Modo NDVI Clásico
         }

         float blendWeight = effectiveMode > 0.0 ? 1.0 : 0.0;

         // Blend with existing vertex colors: preserve natural chlorophyll vibrancy, enrich with biophysical moisture
         #ifdef USE_COLOR
           float moistureDarkening = mix(1.0, 0.82, smoothstep(0.20, 0.80, localMoisture));
           vec3 naturalGround = diffuseColor.rgb * moistureDarkening;
           naturalGround = mix(naturalGround, bioColor, 0.15);
           diffuseColor.rgb = mix(naturalGround, spectralColor, blendWeight);
         #else
           diffuseColor.rgb = mix(bioColor, spectralColor, blendWeight);
         #endif
        `
      );

      // 4. Roughness attenuation: Wet soil reflects light with specular Fresnel sheen
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         // Attenuate roughness on wet ground (specular water sheen in furrows)
         float wetness = clamp(uGlobalMoisture * 0.6 + calculateRiverProximity(vTerrainWorldPos) * 0.4, 0.0, 0.9);
         roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.75, wetness);
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
   * Sets terrain layer mode:
   * 0 = PBR Natural, 1 = NDVI, 2 = DEM Topográfico, 3 = NDWI Agua, 4 = NBR Biomasa Forestal
   * 
   * @param {Object} uniforms 
   * @param {number|string|boolean} mode 
   */
  static setLayerMode(uniforms, mode) {
    if (!uniforms) return;
    let modeVal = 0.0;
    if (typeof mode === 'boolean') {
      modeVal = mode ? 1.0 : 0.0;
    } else if (typeof mode === 'string') {
      const m = mode.toLowerCase();
      if (m === 'ndvi') modeVal = 1.0;
      else if (m === 'dem' || m === 'relief') modeVal = 2.0;
      else if (m === 'ndwi' || m === 'water') modeVal = 3.0;
      else if (m === 'nbr' || m === 'biomass') modeVal = 4.0;
      else modeVal = 0.0;
    } else if (typeof mode === 'number') {
      modeVal = mode;
    }

    if (uniforms.uLayerMode) uniforms.uLayerMode.value = modeVal;
    if (uniforms.uNdviMode) uniforms.uNdviMode.value = modeVal;
  }

  /**
   * Backward-compatible toggle for NDVI mode.
   */
  static setNdviMode(uniforms, active) {
    this.setLayerMode(uniforms, active ? 1.0 : 0.0);
  }
}
