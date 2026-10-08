/**
 * AgriTwin - MapManager Module (HD Terrain Engine + Real-time Sun Simulator)
 *
 * GRAPHICS UPGRADE (2026-09-01):
 *  - G1: Terrain HD — 256×256 segments with procedural multi-texture blending (zone-based shader)
 *  - G2: Dynamic sky gradient background (dawn/noon/dusk based on hourOfDay)
 *  - G5: Post-processing EffectComposer + UnrealBloomPass (via CDN addons)
 *  - G6: Shadows upgraded to 4096×4096 mapSize
 *  - G7: Water upgraded to MeshPhysicalMaterial with transmission + reflection
 *  - BUG-3: latLonToVector3() center fixed from Silicon Valley → Parral, Maule (-71.82, -36.14)
 */

import { bus } from '../utils/EventBus.js';
import { SpatialWidgets } from './SpatialWidgets.js';
import { PBRSoilGenerator } from './PBRSoilGenerator.js';
import { BiophysicalTerrainShader } from './BiophysicalTerrainShader.js';
import { GeomorphicFlowManager } from './GeomorphicFlowManager.js';

// Post-processing availability check
async function tryLoadPostProcessing() {
  const available = (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.RenderPass !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined');
  if (available) {
    console.info('✨ Post-processing EffectComposer & UnrealBloomPass detected and ready.');
    return true;
  }
  return false;
}

export class MapManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.container   = null;
    this.scene       = null;
    this.camera      = null;
    this.renderer    = null;
    this.composer    = null; // G5: EffectComposer
    this.controls    = null;
    this.raycaster   = new THREE.Raycaster();
    this.mouse       = new THREE.Vector2();
    this.pickableObjects = [];
    this.animatedObjects = [];
    this.selectedEntity  = null;

    this.groundMesh    = null;
    this.groundCiv6Mat = null;
    this.groundSatMat  = null;
    this.groundReliefMat = null; // Topographic DEM & Contour Lines Material
    this.baseYValues   = null;   // Stored base elevation heights for dynamic relief scaling
    this.currentReliefScale = 1.0;

    this.waterMesh     = null;
    this.waterMaterial = null;
    this.sunLight      = null;
    this.riverCurve    = null;
    this.skyMesh       = null;

    // Sculpting tool properties
    this.sculptMode    = null; // 'raise' | 'lower' | null
    this.sculptRadius  = 9.0;  // tamaño casa (~9m)
    this.sculptSpeed   = 0.55;
    this.isSculpting   = false;
    this.brushRing     = null;

    // Moon & Astro properties
    this.moonMesh      = null;
    this.moonLight     = null;

    // Tidal / Ocean Simulation properties
    this.tidalMesh     = null;
    this.tidalLevel    = -10.0; // hidden initially

    // Escala Cuenca: Andes, Viento Puelche & Inundación Fluvial
    this.andesGroup       = null;
    this.puelcheWindGroup = null;
    this.puelcheActive    = false;
    this.floodMesh        = null;
    this.floodLevel       = -10.0; // Oculto por defecto bajo el lecho

    // Single-Engine Multi-Profile System Groups
    this.currentProfile = 'enterprise';
    this.enterpriseLayersGroup = new THREE.Group();
    this.enterpriseLayersGroup.name = 'enterpriseLayersGroup';
    this.territorialLayersGroup = new THREE.Group();
    this.territorialLayersGroup.name = 'territorialLayersGroup';
    this.esgLayersGroup = new THREE.Group();
    this.esgLayersGroup.name = 'esgLayersGroup';

    this.currentMode = 'hybrid';
    this.dayOfYear   = 172; // June 21 — Maule winter solstice
    this.hourOfDay   = 12;
    this.spatialWidgets = null;
  }

  /**
   * Smart spatial projection: maps geographic WGS84 coordinates to local Three.js terrain units.
   * Auto-detects coordinate reference frames:
   * - Bundled reference dataset (Cupertino reference: lon ~ -122°, lat ~ 37°) -> centered on farm
   * - Maule / Chilean coordinates (lon ~ -71.8°, lat ~ -36.1°) -> centered on Parral terrain
   */
  static latLonToVector3(lon, lat, height = 0) {
    let centerLon = -71.820;  // Parral, Maule
    let centerLat = -36.145; // Parral, Maule
    let scaleX = 8800;
    let scaleZ = 11100;

    // Bundled farm dataset uses California reference frame
    if (lon < -100 && lat > 20) {
      centerLon = -122.0838;
      centerLat = 37.3860;
    }

    const x = (lon - centerLon) * scaleX;
    const z = -(lat - centerLat) * scaleZ;
    return new THREE.Vector3(x, height, z);
  }

  async init() {
    this.container = document.getElementById(this.containerId);
    const width  = this.container.clientWidth  || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // --- Scene ---
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog('#cbd5e1', 180, 750); // Crisp clarity for farm; atmospheric perspective on distant horizon

    // --- Camera ---
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1200);
    this.camera.position.set(22, 40, 52);

    // --- Renderer (G6: High DPR + tone mapping) ---
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;
      this.renderer.outputColorSpace  = THREE.SRGBColorSpace;
    } catch (webglErr) {
      console.warn('⚠️ WebGL context unavailable, falling back to dummy 3D renderer:', webglErr);
      this.isFallbackRenderer = true;
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = width;
      fallbackCanvas.height = height;
      this.renderer = {
        domElement: fallbackCanvas,
        setSize: () => {},
        setPixelRatio: () => {},
        getPixelRatio: () => 1,
        getSize: (target) => {
          if (target) { target.set(width, height); return target; }
          return new THREE.Vector2(width, height);
        },
        getDrawingBufferSize: (target) => {
          if (target) { target.set(width, height); return target; }
          return new THREE.Vector2(width, height);
        },
        render: () => {},
        clear: () => {},
        setRenderTarget: () => {},
        compile: () => {},
        capabilities: { isWebGL2: false },
        shadowMap: { enabled: false },
        toneMapping: 0,
        outputColorSpace: ''
      };
    }

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // --- Orbit Controls ---
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping  = true;
      this.controls.dampingFactor  = 0.05;
      this.controls.maxPolarAngle  = Math.PI / 2.15;
      this.controls.minDistance    = 5;
      this.controls.maxDistance    = 200;
      this.controls.target.set(0, 0, 0);
    }

    // --- G2: Dynamic Sky ---
    this.buildDynamicSky();

    // --- Lighting (G6: 4096×4096 shadow maps) ---
    this.buildLighting();

    // --- G1: HD Terrain with multi-texture blending ---
    this.buildTerrain();

    // --- G5: Post-processing (optional — graceful fallback) ---
    const ppAvailable = await tryLoadPostProcessing();
    if (ppAvailable && !this.isFallbackRenderer) {
      this.buildPostProcessing(width, height);
    }

    // --- Moon & Astro ---
    this.buildMoon();

    // --- Tidal / Ocean Plane ---
    this.buildTidalWater();

    // --- Sculpting Tool ---
    this.buildSculptBrushRing();
    this.setupSculptingEvents();

    // --- Escala Cuenca: Andes, Viento Puelche & Inundación Fluvial ---
    this.buildAndesMountainsBackdrop();
    this.buildPuelcheWindRibbons();
    this.buildFloodWaterPlane();

    // --- Sistema de Precipitación Procedural (Lluvia en Modo Predio) ---
    this.buildPrecipitationSystem();

    // --- Geomorphic & Stratigraphic Flow Manager ---
    this.geomorphicManager = new GeomorphicFlowManager(this.scene, (x, z) => this.getTerrainElevation(x, z));

    // --- Single-Engine Multi-Profile Layers ---
    this.scene.add(this.enterpriseLayersGroup);
    this.scene.add(this.territorialLayersGroup);
    this.scene.add(this.esgLayersGroup);
    this.buildProfileLayers();
    this.setProfileView('enterprise', false);

    // --- Event Listeners ---
    this.setupEntityPicker();
    window.addEventListener('resize', () => this.onWindowResize());

    bus.on('map:flyto',            (preset)        => this.flyToPreset(preset));
    bus.on('map:set_mode',         (mode)          => this.setMapMode(mode));
    bus.on('map:set_layer_mode',   (layer)         => this.setSpectralLayerMode(layer));
    bus.on('map:set_profile',      (profile)       => this.setProfileView(profile));
    bus.on('map:set_relief_scale', (scale)         => this.setReliefScale(scale));
    bus.on('map:set_sculpt_mode',  (mode)          => this.setSculptMode(mode));
    bus.on('map:set_tidal_level',  (meters)        => this.setTidalLevel(meters));
    bus.on('basin:puelche_wind',    (active)        => this.togglePuelcheWind(active));
    bus.on('basin:flood_level',     (meters)        => this.setFloodLevel(meters));
    bus.on('basin:aquifer_stress',  (active)        => this.setAquiferStress(active));
    bus.on('basin:reset_scenarios', ()              => this.resetBasinScenarios());
    bus.on('weather:updated',       (wx)            => this.onWeatherUpdated(wx));
    bus.on('weather:toggle_rain',   (active)        => this.setRainActive(active));
    bus.on('map:update_sun',       ({ day, hour }) => {
      this.updateSunPosition(day, hour);
      this.updateMoonPosition(day, hour);
    });
    bus.on('map:set_ndvi_mode',    (active)        => this.setNdviMode(active));

    this.animate();

    console.log('🌱 AgriTwin HD Terrain Engine initialized — Andes scale, Puelche wind vectors, Flood modeling, Geomorphic Flows.');
    return this;
  }

  // ─── G2: Dynamic Sky ─────────────────────────────────────────────────────────

  buildDynamicSky() {
    // Sky dome — large hemisphere with vertical gradient baked into vertex colors
    const skyGeo = new THREE.SphereGeometry(600, 32, 16);

    // Visible from interior of dome, rendering behind all geometry
    this.skyMaterial = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false
    });

    // Bake initial vertex colors (noon default)
    this._paintSkyVertices(skyGeo, 12);

    this.skyMesh = new THREE.Mesh(skyGeo, this.skyMaterial);
    this.skyMesh.renderOrder = -1;
    this.scene.add(this.skyMesh);
    this.scene.background = new THREE.Color('#93c5fd');
  }

  _paintSkyVertices(geometry, hour) {
    // Sky color interpolation: dawn → noon → dusk → night
    const skyPalettes = {
      dawn:  { horizon: new THREE.Color('#fdba74'), zenith: new THREE.Color('#38bdf8') },
      noon:  { horizon: new THREE.Color('#bae6fd'), zenith: new THREE.Color('#1e40af') },
      dusk:  { horizon: new THREE.Color('#fb923c'), zenith: new THREE.Color('#4338ca') },
      night: { horizon: new THREE.Color('#0f172a'), zenith: new THREE.Color('#020617') }
    };

    let palette;
    if (hour < 6)       palette = skyPalettes.night;
    else if (hour < 9)  palette = skyPalettes.dawn;
    else if (hour < 17) palette = skyPalettes.noon;
    else if (hour < 20) palette = skyPalettes.dusk;
    else                palette = skyPalettes.night;

    const pos    = geometry.attributes.position;
    const colors = [];
    const tmpColor = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = Math.max(0, Math.min(1, (y + 50) / 600));
      tmpColor.lerpColors(palette.horizon, palette.zenith, t);
      colors.push(tmpColor.r, tmpColor.g, tmpColor.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.attributes.color.needsUpdate = true;
  }

  updateSkyColors(hour) {
    if (this.skyMesh) {
      this._paintSkyVertices(this.skyMesh.geometry, hour);
    }
  }

  // ─── Lighting (PBR Soft Shadows & Hyperrealistic Daylight IBL) ───────────────

  buildLighting() {
    const ambientLight = new THREE.AmbientLight('#e2e8f0', 0.28);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#bae6fd', '#1c2e1b', 0.40);
    this.scene.add(hemiLight);

    // Dynamic Solar Directional Light with PCFSoftShadowMap
    this.sunLight = new THREE.DirectionalLight('#fffef5', 1.45);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width  = 4096;
    this.sunLight.shadow.mapSize.height = 4096;
    this.sunLight.shadow.camera.near   = 1.0;
    this.sunLight.shadow.camera.far    = 420;
    this.sunLight.shadow.camera.left   = -95;
    this.sunLight.shadow.camera.right  =  95;
    this.sunLight.shadow.camera.top    =  95;
    this.sunLight.shadow.camera.bottom = -95;
    this.sunLight.shadow.bias          = -0.0003;
    this.sunLight.shadow.normalBias    =  0.04; // Eradicates shadow acne
    this.scene.add(this.sunLight);

    // Fill light from sky (cool blue-tinted for ambient sky bounce)
    const fillLight = new THREE.DirectionalLight('#93c5fd', 0.20);
    fillLight.position.set(-40, 25, -40);
    this.scene.add(fillLight);

    // Image-Based Lighting (IBL) environment map (Hyperrealistic Daylight preset)
    this.buildEnvironmentMap();

    this.updateSunPosition(this.dayOfYear, this.hourOfDay);
  }

  /**
   * Generates a hyperrealistic daylight radiance environment map using PMREMGenerator.
   * Provides natural sky reflections and foliage ground bounce for PBR materials.
   */
  buildEnvironmentMap() {
    if (!this.renderer) return;
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      pmremGenerator.compileEquirectangularShader();

      const envCanvas = document.createElement('canvas');
      envCanvas.width = 512;
      envCanvas.height = 256;
      const ctx = envCanvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0.0, '#1d4ed8');  // Sky zenith crystal blue
      grad.addColorStop(0.35, '#60a5fa'); // Pure daylight azure
      grad.addColorStop(0.50, '#dbeafe'); // Horizon clear atmospheric haze
      grad.addColorStop(0.55, '#2e4a2d'); // Landscape foliage bounce
      grad.addColorStop(0.70, '#26221c'); // Fertile earth bounce
      grad.addColorStop(1.0, '#15120e');  // Nadir ground
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      // Clean natural daylight solar disk
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(256, 110, 16, 0, Math.PI * 2);
      ctx.fill();

      const envTex = new THREE.CanvasTexture(envCanvas);
      const envRenderTarget = pmremGenerator.fromEquirectangular(envTex);
      this.scene.environment = envRenderTarget.texture;
      envTex.dispose();
      pmremGenerator.dispose();
      console.log('☀️ Hyperrealistic Daylight PBR Environment Map active.');
    } catch (err) {
      console.warn('Environment map setup skipped:', err);
    }
  }

  /**
   * Calculates 3D solar position for Parral, Maule (-36.14°S)
   */
  updateSunPosition(dayOfYear, hour) {
    this.dayOfYear = dayOfYear;
    this.hourOfDay = hour;

    const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81)) * (Math.PI / 180);
    const hourAngle   = (hour - 12) * 15 * (Math.PI / 180);
    const latRad      = -36.14 * (Math.PI / 180);

    const sinElev  = Math.sin(latRad) * Math.sin(declination) + Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle);
    const elevation = Math.asin(Math.max(-1, Math.min(1, sinElev)));
    const cosAz     = (Math.sin(declination) - Math.sin(latRad) * sinElev) / (Math.cos(latRad) * Math.cos(elevation));
    const azimuth   = Math.atan2(Math.sin(hourAngle), cosAz);

    const distance = 120;
    const sunX = distance * Math.cos(elevation) * Math.sin(azimuth);
    const sunY = Math.max(8, distance * Math.sin(elevation));
    const sunZ = distance * Math.cos(elevation) * Math.cos(azimuth);

    if (this.sunLight) {
      this.sunLight.position.set(sunX, sunY, sunZ);

      // Modulate sun color & intensity based on elevation (golden hour agricultural effect)
      const elevDeg = elevation * (180 / Math.PI);
      if (elevDeg < 14 && elevDeg > 0) {
        this.sunLight.color.setHex(0xfb923c); // Warm golden sunrise/sunset (alargadas sombras)
        this.sunLight.intensity = 1.05;
      } else if (elevDeg <= 0) {
        this.sunLight.color.setHex(0x1e293b); // Night
        this.sunLight.intensity = 0.08;
      } else {
        this.sunLight.color.setHex(0xfffef5); // Midday crisp clean natural daylight sunlight
        this.sunLight.intensity = 1.45;
      }
    }

    // Dynamic atmospheric fog color transition
    if (this.scene.fog) {
      if (hour < 6 || hour > 21) {
        this.scene.fog.color.set('#0b132b');
      } else if (hour < 9) {
        this.scene.fog.color.set('#e0a96d'); // Warm morning mist
      } else if (hour > 18) {
        this.scene.fog.color.set('#b56576'); // Dusky haze
      } else {
        this.scene.fog.color.set('#b8cce0'); // Daylight
      }
    }

    this.updateSkyColors(hour);
    bus.emit('environment:time_of_day', { hour, isNight: (hour < 7 || hour > 19) });
  }

  // ─── G1: HD Terrain ───────────────────────────────────────────────────────────

  buildTerrain() {
    this.riverCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-60,  0, -24),
      new THREE.Vector3(-30,  0, -20),
      new THREE.Vector3(-5,   0, -12),
      new THREE.Vector3(20,   0,  -4),
      new THREE.Vector3(60,   0,  10)
    ]);

    const riverPoints = this.riverCurve.getPoints(150);

    const getDistToRiver = (x, z) => {
      let minDist = Infinity;
      for (const rp of riverPoints) {
        const d = Math.hypot(x - rp.x, z - rp.z);
        if (d < minDist) minDist = d;
      }
      return minDist;
    };

    // G1: 256×256 segments (from 120×120)
    const groundGeo = new THREE.PlaneGeometry(180, 180, 256, 256);
    groundGeo.rotateX(-Math.PI / 2);

    const posAttr = groundGeo.attributes.position;
    const uvAttr  = groundGeo.attributes.uv;
    const colors  = new Float32Array(posAttr.count * 3);
    this.baseYValues = new Float32Array(posAttr.count);

    // Natural hyperrealistic linear vertex colors (Maule Sur / Fundo Colliguay):
    const cRiparian   = new THREE.Color('#164a20').convertSRGBToLinear();
    const cHighAndes  = new THREE.Color('#cbd5e1').convertSRGBToLinear();
    const cPrecord    = new THREE.Color('#4a5245').convertSRGBToLinear();
    const cHillside   = new THREE.Color('#2d4d24').convertSRGBToLinear();
    const cPasturePRV = new THREE.Color('#1f6628').convertSRGBToLinear();
    const cGrassland  = new THREE.Color('#275825').convertSRGBToLinear();
    const tmpC        = new THREE.Color();

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);

      // Smoother multi-octave noise terrain (manual Perlin-like sum)
      let y = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 1.8
            + Math.sin(x * 0.09 + 0.7) * Math.cos(z * 0.07 - 0.3) * 1.0
            + Math.sin(x * 0.18 + 1.2) * Math.cos(z * 0.16 + 0.9) * 0.4
            + Math.sin(x * 0.02 + z * 0.02) * 2.5;

      // Gradiente Orográfico Andino hacia el Este (Precordillera de Parral / Longaví)
      if (x > 25) {
        const andesProgress = (x - 25) / 65.0;
        const andesRidge = Math.sin(z * 0.07) * 3.5 + Math.cos(z * 0.12) * 2.0;
        y += Math.pow(andesProgress, 1.5) * 18.0 + andesRidge * andesProgress;
      }

      const dist      = getDistToRiver(x, z);
      const riverWidth = 4.2;

      if (dist < riverWidth) {
        const t = 1 - Math.pow(dist / riverWidth, 2);
        y -= t * 2.8;
      } else if (dist < riverWidth + 3.5) {
        const t = 1 - (dist - riverWidth) / 3.5;
        y -= t * 0.9;
      }

      posAttr.setY(i, y);
      this.baseYValues[i] = y;

      // G1: Zone-based vertex colors for multi-texture blending effect
      // Zones: river bank, cultivated, high mountain, rocky slopes, dry pasture
      const u = uvAttr.getX(i);
      const v = uvAttr.getY(i);

      let c;
      if (dist < riverWidth + 5) {
        // Riparian zone — deep native Chilean riverbank forest (Boldo, Peumo, Sauce)
        c = cRiparian;
      } else if (y > 2.0) {
        // Continuous smooth Andean elevation gradient
        if (y < 4.5) {
          const t = (y - 2.0) / 2.5;
          c = tmpC.lerpColors(cGrassland, cHillside, t);
        } else if (y < 8.0) {
          const t = (y - 4.5) / 3.5;
          c = tmpC.lerpColors(cHillside, cPrecord, t);
        } else {
          const t = Math.min(1.0, (y - 8.0) / 4.0);
          c = tmpC.lerpColors(cPrecord, cHighAndes, t);
        }
      } else if ((u > 0.3 && u < 0.65) && (v > 0.2 && v < 0.7)) {
        // Cultivated central zone (Potreros PRV Fundo Colliguay) — rich chlorophyll pasture
        c = cPasturePRV;
      } else {
        // Natural pasture / valley grassland
        c = cGrassland;
      }

      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    groundGeo.computeVertexNormals();
    groundGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // PBR Soil Micro-Relieve textures
    const soilNormalMap = PBRSoilGenerator.createSoilNormalMap(1024);
    const soilRoughnessMap = PBRSoilGenerator.createSoilRoughnessMap(1024);

    // 1. Multi-texture material using vertex colors + Biophysical Soil Moisture
    this.groundCiv6Mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.0,
      flatShading: false
    });
    this.terrainMoistureUniforms = BiophysicalTerrainShader.apply(this.groundCiv6Mat, { initialMoisture: 0.38 });

    // 2. Satellite mode — canvas texture with zone colors + PBR furrow micro-relief
    const satTexture     = this.createSatelliteTexture();
    this.groundSatMat    = new THREE.MeshStandardMaterial({
      map: satTexture,
      normalMap: soilNormalMap,
      normalScale: new THREE.Vector2(1.1, 1.1),
      roughnessMap: soilRoughnessMap,
      roughness: 0.75,
      metalness: 0.02
    });

    // 3. Relieve & DEM Hypsometric Material with Real Mathematical Contour Lines
    this.groundReliefMat = new THREE.MeshStandardMaterial({
      roughness: 0.55,
      metalness: 0.06,
      normalMap: soilNormalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
      flatShading: false
    });

    this.groundReliefMat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
         varying float vElevation;`
      );
      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
         vElevation = transformed.y;`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
         varying float vElevation;

         vec3 getHypsometricColor(float h) {
           // Color ramp: Estero depth -> Valley green -> Mid slopes -> High terrain -> Peak snow
           if (h < -1.2) return mix(vec3(0.01, 0.35, 0.65), vec3(0.02, 0.68, 0.82), clamp((h + 3.0) / 1.8, 0.0, 1.0));
           if (h < 0.3)  return mix(vec3(0.06, 0.68, 0.45), vec3(0.48, 0.78, 0.12), clamp((h + 1.2) / 1.5, 0.0, 1.0));
           if (h < 2.2)  return mix(vec3(0.48, 0.78, 0.12), vec3(0.92, 0.72, 0.05), clamp((h - 0.3) / 1.9, 0.0, 1.0));
           if (h < 4.2)  return mix(vec3(0.92, 0.72, 0.05), vec3(0.88, 0.36, 0.08), clamp((h - 2.2) / 2.0, 0.0, 1.0));
           if (h < 6.5)  return mix(vec3(0.88, 0.36, 0.08), vec3(0.68, 0.12, 0.12), clamp((h - 4.2) / 2.3, 0.0, 1.0));
           return mix(vec3(0.68, 0.12, 0.12), vec3(0.98, 0.98, 1.0), clamp((h - 6.5) / 2.5, 0.0, 1.0));
         }`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         vec3 topo = getHypsometricColor(vElevation);

         // Curvas de nivel: líneas menores cada 0.8m, líneas maestras cada 4.0m
         float minorLine = smoothstep(0.42, 0.5, abs(fract(vElevation * 1.25) - 0.5));
         float majorLine = smoothstep(0.44, 0.5, abs(fract(vElevation * 0.25) - 0.5));

         // Dark contour lines with bright major index lines
         topo = mix(topo, vec3(0.04, 0.07, 0.12), minorLine * 0.38);
         topo = mix(topo, vec3(1.0, 1.0, 1.0), majorLine * 0.62);

         diffuseColor.rgb = topo;`
      );
    };

    this.groundMesh = new THREE.Mesh(groundGeo, this.groundCiv6Mat);
    this.groundMesh.receiveShadow = true;
    this.groundMesh.castShadow    = false;
    this.scene.add(this.groundMesh);

    // G7: Water with MeshPhysicalMaterial — transmission + reflectivity
    this.buildWater();
  }

  // ─── Terrain Elevation Query (Bilinear Interpolation) ─────────────────────────

  getTerrainElevation(x, z) {
    if (!this.groundMesh) return 0;
    const halfSize = 90; // 180 / 2
    const segs = 256;
    const gx = ((x + halfSize) / 180) * segs;
    const gz = ((z + halfSize) / 180) * segs;

    if (gx < 0 || gx >= segs || gz < 0 || gz >= segs) return 0;

    const ix = Math.floor(gx);
    const iz = Math.floor(gz);
    const fx = gx - ix;
    const fz = gz - iz;

    const pos = this.groundMesh.geometry.attributes.position;
    const stride = segs + 1;
    const y00 = pos.getY(iz * stride + ix);
    const y10 = pos.getY(iz * stride + Math.min(segs, ix + 1));
    const y01 = pos.getY(Math.min(segs, iz + 1) * stride + ix);
    const y11 = pos.getY(Math.min(segs, iz + 1) * stride + Math.min(segs, ix + 1));

    const y0 = y00 * (1 - fx) + y10 * fx;
    const y1 = y01 * (1 - fx) + y11 * fx;
    return y0 * (1 - fz) + y1 * fz;
  }

  // ─── G7: Reflective Water (Conformed to Terrain Bed) ──────────────────────────

  buildWater() {
    const numSteps = 150;
    const points = this.riverCurve.getPoints(numSteps);
    const width = 4.6;

    const vertices = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= numSteps; i++) {
      const p = points[i];
      let tangent;
      if (i === 0) {
        tangent = points[1].clone().sub(points[0]).normalize();
      } else if (i === numSteps) {
        tangent = points[numSteps].clone().sub(points[numSteps - 1]).normalize();
      } else {
        tangent = points[i + 1].clone().sub(points[i - 1]).normalize();
      }

      // Normal perpendicular in XZ plane
      const norm = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const leftX  = p.x - norm.x * (width / 2);
      const leftZ  = p.z - norm.z * (width / 2);
      const rightX = p.x + norm.x * (width / 2);
      const rightZ = p.z + norm.z * (width / 2);

      const leftY  = this.getTerrainElevation(leftX, leftZ) + 0.12;
      const midY   = this.getTerrainElevation(p.x, p.z) + 0.12;
      const rightY = this.getTerrainElevation(rightX, rightZ) + 0.12;

      vertices.push(leftX, leftY, leftZ);
      vertices.push(p.x, midY, p.z);
      vertices.push(rightX, rightY, rightZ);

      const u = i / numSteps;
      uvs.push(0, u, 0.5, u, 1, u);

      if (i < numSteps) {
        const row1 = i * 3;
        const row2 = (i + 1) * 3;
        indices.push(row1, row1 + 1, row2);
        indices.push(row1 + 1, row2 + 1, row2);
        indices.push(row1 + 1, row1 + 2, row2 + 1);
        indices.push(row1 + 2, row2 + 2, row2 + 1);
      }
    }

    const waterGeo = new THREE.BufferGeometry();
    waterGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    waterGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    waterGeo.setIndex(indices);
    waterGeo.computeVertexNormals();

    this.waterMaterial = new THREE.MeshPhysicalMaterial({
      color:        0x0284c7,
      roughness:    0.04,
      metalness:    0.05,
      transparent:  true,
      opacity:      0.82,
      envMapIntensity: 1.0,
      emissive:     new THREE.Color(0x013a63),
      emissiveIntensity: 0.03,
      side:         THREE.DoubleSide
    });

    this.waterMesh = new THREE.Mesh(waterGeo, this.waterMaterial);
    this.waterMesh.receiveShadow = true;
    this.scene.add(this.waterMesh);

    this._waterTime = 0;
    this._initWetlandFauna();
  }

  _initWetlandFauna() {
    this.ducksGroup = new THREE.Group();
    this.ducksGroup.name = 'wetland_ducks_group';
    this.scene.add(this.ducksGroup);
    this.ducks = [];

    const loader = (typeof THREE.GLTFLoader !== 'undefined') ? new THREE.GLTFLoader() : null;
    if (!loader) return;

    loader.load(
      'assets/models/Duck.glb',
      (gltf) => {
        const duckModel = gltf.scene;

        // Tranque de acumulación / Laguna coordinates (~x: -16, z: 12)
        const duckLocations = [
          { x: -16.2, z: 10.5, heading: 0.8 },
          { x: -14.8, z: 12.0, heading: -0.6 },
          { x: -17.5, z: 13.2, heading: 1.4 },
          { x: -15.4, z: 8.8,  heading: 2.1 }
        ];

        duckLocations.forEach((loc, idx) => {
          const duck = duckModel.clone(true);
          const elev = this.getTerrainElevation ? (this.getTerrainElevation(loc.x, loc.z) + 0.12) : 0.45;
          duck.position.set(loc.x, elev, loc.z);
          duck.scale.set(0.28, 0.28, 0.28);
          duck.rotation.y = loc.heading;

          duck.traverse(c => {
            if (c.isMesh) {
              c.castShadow = true;
              c.receiveShadow = true;
            }
          });

          const duckData = {
            id: `duck_${idx + 1}`,
            type: 'wildlife',
            name: `Ánade Silvestre #${idx + 1} (Anas platyrhynchos)`,
            icon: '🦆',
            species: 'Fauna Silvestre Ecosistémica (Modelo 3D GLB)',
            habitat: 'Tranque de Acumulación 18.500 m³',
            telemetry: 'Bioindicador de calidad hídrica y control biológico de insectos'
          };
          duck.userData = duckData;
          this.addPickable(duck, duckData);

          this.ducksGroup.add(duck);
          this.ducks.push({ mesh: duck, baseElev: elev, baseRot: loc.heading, offset: idx * 1.5 });
        });
        console.log('🦆 Wetland wildlife Ducks loaded in irrigation reservoir');
      },
      undefined,
      (err) => console.warn('Could not load Duck.glb:', err)
    );
  }

  conformWaterToTerrain() {
    if (!this.waterMesh || !this.groundMesh) return;
    const pos = this.waterMesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const elev = this.getTerrainElevation(x, z);
      pos.setY(i, elev + 0.12);
    }
    pos.needsUpdate = true;
    this.waterMesh.geometry.computeVertexNormals();
  }

  _animateWater(time) {
    if (!this.waterMaterial) return;
    // Sutil destello de agua natural sin sobreexposición de luz
    const shimmer = 0.02 + Math.sin(time * 0.001) * 0.01;
    this.waterMaterial.emissiveIntensity = shimmer;
    this.waterMaterial.needsUpdate = false;

    // Gentle bobbing and drifting for ducks on water surface
    if (this.ducks && this.ducks.length > 0) {
      const t = (time || performance.now()) * 0.002;
      this.ducks.forEach(d => {
        d.mesh.position.y = d.baseElev + Math.sin(t * 2.0 + d.offset) * 0.035;
        d.mesh.rotation.y = d.baseRot + Math.sin(t * 0.6 + d.offset) * 0.12;
        d.mesh.rotation.z = Math.cos(t * 1.5 + d.offset) * 0.025;
      });
    }
  }

  // ─── G5: Post-Processing ─────────────────────────────────────────────────────

  buildPostProcessing(width, height) {
    const ComposerClass   = (typeof THREE.EffectComposer !== 'undefined') ? THREE.EffectComposer : (typeof EffectComposer !== 'undefined' ? EffectComposer : null);
    const RenderPassClass = (typeof THREE.RenderPass !== 'undefined') ? THREE.RenderPass : (typeof RenderPass !== 'undefined' ? RenderPass : null);
    const BloomPassClass  = (typeof THREE.UnrealBloomPass !== 'undefined') ? THREE.UnrealBloomPass : (typeof UnrealBloomPass !== 'undefined' ? UnrealBloomPass : null);

    if (!ComposerClass || !RenderPassClass || !BloomPassClass) return;

    this.composer = new ComposerClass(this.renderer);
    this.composer.addPass(new RenderPassClass(this.scene, this.camera));

    const bloomPass = new BloomPassClass(
      new THREE.Vector2(width, height),
      0.04,  // Ajustado a nivel natural para evitar brillo cegador/sci-fi
      0.20,  // radius
      0.98   // threshold: sólo reflejos especulares de luz extrema
    );
    this.composer.addPass(bloomPass);
    console.log('✨ UnrealBloomPass post-processing active with realistic natural lighting.');
  }

  // ─── Satellite texture ────────────────────────────────────────────────────────

  createSatelliteTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base soil
    ctx.fillStyle = '#7a5c38';
    ctx.fillRect(0, 0, 1024, 1024);

    // North quadrant — darker soil
    ctx.fillStyle = '#8b6244';
    ctx.beginPath();
    ctx.moveTo(512, 0); ctx.lineTo(1024, 0); ctx.lineTo(1024, 512); ctx.lineTo(512, 512);
    ctx.closePath(); ctx.fill();

    // South-east — cultivated plots
    ctx.fillStyle = '#5a7a3a';
    ctx.fillRect(520, 530, 480, 460);

    // River riparian strip
    ctx.fillStyle = '#2e6e3a';
    ctx.beginPath();
    ctx.moveTo(120, 0);
    ctx.bezierCurveTo(220, 300, 300, 650, 480, 1024);
    ctx.lineTo(80, 1024);
    ctx.bezierCurveTo(150, 650, 100, 300, 30, 0);
    ctx.closePath();
    ctx.fill();

    // River channel
    ctx.strokeStyle = '#5a9ec5';
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(100, 0);
    ctx.bezierCurveTo(200, 300, 280, 650, 460, 1024);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  // ─── Map Mode ─────────────────────────────────────────────────────────────────

  setMapMode(mode) {
    this.currentMode = mode;
    if (mode === 'satellite') {
      this.groundMesh.material = this.groundSatMat;
    } else if (mode === 'civ6') {
      this.groundMesh.material = this.groundCiv6Mat;
    } else if (mode === 'relief' || mode === 'dem') {
      this.groundMesh.material = this.groundReliefMat;
    } else {
      this.groundMesh.material = this.groundCiv6Mat;
    }
    bus.emit('map:mode_changed', mode);
  }

  /**
   * Sets topographic 3D relief / elevation exaggeration scale.
   * Multiplies stored base Y heights and updates normal vectors & shadows in real-time.
   * @param {number} scale (0.1x to 4.0x)
   */
  setReliefScale(scale) {
    this.currentReliefScale = Math.max(0.1, Math.min(4.0, scale));
    if (!this.groundMesh || !this.baseYValues) return;

    const posAttr = this.groundMesh.geometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      posAttr.setY(i, this.baseYValues[i] * this.currentReliefScale);
    }
    posAttr.needsUpdate = true;
    this.groundMesh.geometry.computeVertexNormals();

    if (this.waterMesh) {
      this.conformWaterToTerrain();
    }

    bus.emit('terrain:relief_scale_updated', this.currentReliefScale);
  }

  // ─── Entity Picker ────────────────────────────────────────────────────────────

  addPickable(mesh, entityData) {
    mesh.userData = entityData;
    if (!this.pickableObjects.includes(mesh)) {
      this.pickableObjects.push(mesh);
    }
  }

  removePickable(mesh) {
    if (!this.pickableObjects) return;
    const idx = this.pickableObjects.indexOf(mesh);
    if (idx !== -1) {
      this.pickableObjects.splice(idx, 1);
    }
  }

  addAnimated(object, updateFn) {
    this.animatedObjects.push({ object, updateFn });
  }

  setupEntityPicker() {
    const canvas = this.renderer.domElement;

    // Helper: Validar visibilidad estricta de jerarquía completa (Three.js no lo hace por defecto al raycastear arrays directos)
    const isHierarchyVisible = (obj) => {
      let cur = obj;
      while (cur) {
        if (cur.visible === false) return false;
        cur = cur.parent;
      }
      return true;
    };

    // Filtro de arrastre vs clic (OrbitControls drag threshold)
    // Evita que al rotar/orbitar la cámara o dejar apretado se dispare selección o deselección
    let pointerDownPos = { x: 0, y: 0 };
    let isDragging = false;

    canvas.addEventListener('pointerdown', (event) => {
      pointerDownPos.x = event.clientX;
      pointerDownPos.y = event.clientY;
      isDragging = false;
    });

    canvas.addEventListener('pointermove', (event) => {
      const dist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
      if (dist > 6) {
        isDragging = true;
      }
    });

    // 1. Mouse Click Raycaster (Selection)
    canvas.addEventListener('click', (event) => {
      // Ignorar el evento si el usuario estaba orbitando, arrastrando o inspeccionando la vista 3D
      const dragDist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
      if (isDragging || dragDist > 6) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      this.mouse.x =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const rawIntersects = this.raycaster.intersectObjects(this.pickableObjects, true);

      // Filtrar estrictamente solo objetos cuyos ancestros estén 100% visibles
      const intersects = rawIntersects.filter(hit => hit.object && isHierarchyVisible(hit.object));

      if (intersects.length > 0) {
        const hit = intersects[0];
        let pickedObj = hit.object;

        // Support InstancedMesh picking
        if (pickedObj && pickedObj.isInstancedMesh && pickedObj.userData && pickedObj.userData.metadataList && hit.instanceId !== undefined) {
          const meta = pickedObj.userData.metadataList[hit.instanceId];
          if (meta) {
            this.selectedEntity = meta;
            bus.emit('entity:selected', {
              id:         meta.id,
              name:       meta.name,
              properties: meta
            });
            return;
          }
        }

        while (pickedObj && !pickedObj.userData.type && pickedObj.parent) {
          pickedObj = pickedObj.parent;
        }

        if (pickedObj && pickedObj.userData && pickedObj.userData.type) {
          this.selectedEntity = pickedObj.userData;
          bus.emit('entity:selected', {
            id:         pickedObj.userData.id,
            name:       pickedObj.userData.name,
            properties: pickedObj.userData
          });
          return;
        }
      }

      this.selectedEntity = null;
      bus.emit('entity:deselected', {});
    });

    // 2. Mouse Move Raycaster (Civilization VI Y-Axis Hover & Cursor Snapping)
    let lastHoveredId = null;

    canvas.addEventListener('mousemove', (event) => {
      if (this.isSculpting) return;

      const rect = canvas.getBoundingClientRect();
      this.mouse.x =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const rawIntersects = this.raycaster.intersectObjects(this.pickableObjects, true);
      const intersects = rawIntersects.filter(hit => hit.object && isHierarchyVisible(hit.object));

      if (intersects.length > 0) {
        const hit = intersects[0];
        let hitObj = hit.object;

        if (hitObj.isInstancedMesh && hitObj.userData && hitObj.userData.metadataList && hit.instanceId !== undefined) {
          canvas.style.cursor = 'pointer';
          const meta = hitObj.userData.metadataList[hit.instanceId];
          if (meta && meta.id !== lastHoveredId) {
            lastHoveredId = meta.id;
            bus.emit('entity:hover', meta);
          }
          return;
        }

        while (hitObj && !hitObj.userData.type && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj && hitObj.userData && hitObj.userData.type) {
          canvas.style.cursor = 'pointer';
          const id = hitObj.userData.id || hitObj.userData.parcelId;
          if (id !== lastHoveredId) {
            lastHoveredId = id;
            if (hitObj.userData.type === 'parcel') {
              bus.emit('parcel:hover', id);
            }
          }
          return;
        }
      }

      if (lastHoveredId !== null) {
        lastHoveredId = null;
        bus.emit('parcel:unhover');
      }
      if (!this.sculptMode) {
        canvas.style.cursor = 'default';
      }
    });
  }

  // ─── Camera Presets & Single-Engine Multi-Profile System ─────────────────────

  flyToPreset(preset) {
    const presets = {
      // Perfiles Ejecutivos de Negocio
      enterprise:  { pos: new THREE.Vector3(14, 20, 24),   target: new THREE.Vector3(-4, 1.5, 0)   }, // Zoom Predio / Cuarteles
      territorial: { pos: new THREE.Vector3(65, 85, 95),   target: new THREE.Vector3(0, 0, -10)    }, // Zoom Cuenca / Comuna
      esg:         { pos: new THREE.Vector3(120, 185, 210),target: new THREE.Vector3(0, 0, 0)      }, // Zoom Regional / Ecosistémico
      studio:      { pos: new THREE.Vector3(22, 40, 52),   target: new THREE.Vector3(0, 0, 0)      }, // Modo Estudio / Sandbox
      
      // Presets Clásicos Preservados
      overview:    { pos: new THREE.Vector3(22, 40, 52),   target: new THREE.Vector3(0, 0, 0)      },
      house:       { pos: new THREE.Vector3(0, 8, 14),     target: new THREE.Vector3(-8, 2.5, 8)   }, // Casa Principal / Tudor Farmhouse
      orchard:     { pos: new THREE.Vector3(-12, 20, 12),  target: new THREE.Vector3(-10, 2, -5)   },
      sensors:     { pos: new THREE.Vector3(12, 16, 22),   target: new THREE.Vector3(5, 2, 8)      },
      livestock:   { pos: new THREE.Vector3(14, 18, 22),   target: new THREE.Vector3(10, 2, 7)     },
      permaculture:{ pos: new THREE.Vector3(18, 36, 44),   target: new THREE.Vector3(-2, 2, 6)     }
    };

    const t = presets[preset] || presets.overview;
    this.animateCamera(t.pos, t.target);
  }

  setProfileView(profile, animate = true) {
    const validModes = ['enterprise', 'territorial', 'esg', 'studio'];
    const mode = validModes.includes(profile) ? profile : 'enterprise';
    this.currentProfile = mode;

    if (mode === 'enterprise') {
      this.enterpriseLayersGroup.visible = true;
      this.territorialLayersGroup.visible = false;
      this.esgLayersGroup.visible = false;
      if (animate) this.flyToPreset('enterprise');
    } else if (mode === 'territorial') {
      this.enterpriseLayersGroup.visible = false;
      this.territorialLayersGroup.visible = true;
      this.esgLayersGroup.visible = false;
      if (animate) this.flyToPreset('territorial');
    } else if (mode === 'esg') {
      this.enterpriseLayersGroup.visible = false;
      this.territorialLayersGroup.visible = false;
      this.esgLayersGroup.visible = true;
      if (animate) this.flyToPreset('esg');
    } else if (mode === 'studio') {
      // Modo Estudio / Sandbox: todo visible y configurable
      this.enterpriseLayersGroup.visible = true;
      this.territorialLayersGroup.visible = true;
      this.esgLayersGroup.visible = true;
      if (animate) this.flyToPreset('studio');
    }

    bus.emit('profile:active_changed', mode);
  }

  buildProfileLayers() {
    this.buildEnterpriseLayers();
    this.buildTerritorialLayers();
    this.buildEsgLayers();
  }

  // 1. MODO B2B ENTERPRISE: Estratigrafía Radicular 3D, Riego y Alertas Heladas
  buildEnterpriseLayers() {
    const spots = [
      { x: -6, z: 4, label: 'Cuartel A • Brotes' },
      { x: -14, z: -6, label: 'Cuartel B • Cerezos' },
      { x: 4, z: 6, label: 'Cuartel C • Viñedo' }
    ];

    spots.forEach(spot => {
      const colGroup = new THREE.Group();
      colGroup.position.set(spot.x, 0.45, spot.z);

      // Columna Estratigráfica Subterránea
      // Estrato 1: 0 - 20 cm (Evaporación - Ámbar)
      const l1Geo = new THREE.CylinderGeometry(0.5, 0.5, 0.8, 16);
      const l1Mat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.3, emissive: '#78350f', emissiveIntensity: 0.3 });
      const l1Mesh = new THREE.Mesh(l1Geo, l1Mat);
      l1Mesh.position.y = 0.4;
      colGroup.add(l1Mesh);

      // Estrato 2: 20 - 60 cm (Zona Radicular Activa - Cyan Óptimo)
      const l2Geo = new THREE.CylinderGeometry(0.5, 0.5, 1.4, 16);
      const l2Mat = new THREE.MeshStandardMaterial({ color: '#06b6d4', roughness: 0.2, emissive: '#0e7490', emissiveIntensity: 0.4 });
      const l2Mesh = new THREE.Mesh(l2Geo, l2Mat);
      l2Mesh.position.y = 1.5;
      colGroup.add(l2Mesh);

      // Estrato 3: 60 - 100 cm (Reserva Subterránea - Esmeralda)
      const l3Geo = new THREE.CylinderGeometry(0.5, 0.5, 1.4, 16);
      const l3Mat = new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.2, emissive: '#065f46', emissiveIntensity: 0.4 });
      const l3Mesh = new THREE.Mesh(l3Geo, l3Mat);
      l3Mesh.position.y = 2.9;
      colGroup.add(l3Mesh);

      // Anillo de Lámina de Riego Pulsante (Drip Spray Radius)
      const sprayGeo = new THREE.RingGeometry(1.8, 2.3, 32);
      sprayGeo.rotateX(-Math.PI / 2);
      const sprayMat = new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.55, side: THREE.DoubleSide });
      const sprayMesh = new THREE.Mesh(sprayGeo, sprayMat);
      sprayMesh.position.y = 0.05;
      colGroup.add(sprayMesh);

      this.enterpriseLayersGroup.add(colGroup);
    });

    // Malla de Drenaje Katabático de Heladas (Fondo de Quebrada)
    const frostCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-25, 0.6, 20),
      new THREE.Vector3(-10, 0.4, 12),
      new THREE.Vector3(0, 0.35, 10),
      new THREE.Vector3(15, 0.4, 6)
    ]);
    const frostGeo = new THREE.TubeGeometry(frostCurve, 24, 0.6, 8, false);
    const frostMat = new THREE.MeshBasicMaterial({ color: '#818cf8', transparent: true, opacity: 0.45, wireframe: true });
    const frostMesh = new THREE.Mesh(frostGeo, frostMat);
    this.enterpriseLayersGroup.add(frostMesh);
  }

  // 2. MODO B2G TERRITORIAL: Semáforo Acuíferos, Piro-Riesgo FWI, Rutas Aljibe y Cortafuegos
  buildTerritorialLayers() {
    // A. Trazado de Cortafuegos CONAF (14.2 km)
    const firebreakCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-32, 0.8, -20),
      new THREE.Vector3(-15, 0.7, -25),
      new THREE.Vector3(5, 0.7, -28),
      new THREE.Vector3(28, 0.8, -32)
    ]);
    const firebreakGeo = new THREE.TubeGeometry(firebreakCurve, 40, 0.9, 8, false);
    const firebreakMat = new THREE.MeshStandardMaterial({
      color: '#ea580c',
      roughness: 0.4,
      metalness: 0.2,
      emissive: '#c2410c',
      emissiveIntensity: 0.5
    });
    const firebreakMesh = new THREE.Mesh(firebreakGeo, firebreakMat);
    this.territorialLayersGroup.add(firebreakMesh);

    // B. Rutas de Camiones Aljibe & Puntos de Abastecimiento APR
    const tankerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(30, 0.6, 25),
      new THREE.Vector3(15, 0.5, 10),
      new THREE.Vector3(-2, 0.5, -5),
      new THREE.Vector3(-18, 0.6, -18)
    ]);
    const tankerGeo = new THREE.TubeGeometry(tankerCurve, 32, 0.4, 8, false);
    const tankerMat = new THREE.MeshBasicMaterial({ color: '#06b6d4', transparent: true, opacity: 0.75 });
    const tankerMesh = new THREE.Mesh(tankerGeo, tankerMat);
    this.territorialLayersGroup.add(tankerMesh);

    // Balizas 3D de Puntos de Entrega Aljibe
    [new THREE.Vector3(15, 0.8, 10), new THREE.Vector3(-18, 0.9, -18)].forEach(pt => {
      const beaconGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 16);
      const beaconMat = new THREE.MeshStandardMaterial({ color: '#0284c7', emissive: '#0369a1', emissiveIntensity: 0.6 });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.copy(pt);
      this.territorialLayersGroup.add(beaconMesh);
    });

    // C. Semáforo de Acuífero (Estero Colliguay Alluvial Zone)
    const aquiferGeo = new THREE.RingGeometry(3.5, 5.0, 32);
    aquiferGeo.rotateX(-Math.PI / 2);
    const aquiferMat = new THREE.MeshBasicMaterial({
      color: '#eab308', // Amarillo Precaución 68%
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    const aquiferMesh = new THREE.Mesh(aquiferGeo, aquiferMat);
    aquiferMesh.position.set(18, 0.35, -4);
    this.territorialLayersGroup.add(aquiferMesh);

    this.addAnimated(aquiferMesh, (time) => {
      const s = 1.0 + Math.sin(time * 0.003) * 0.08;
      aquiferMesh.scale.set(s, s, s);
    });
  }

  // 3. MODO ESG / MRV LEDGER: Captura de Carbono (tCO2e), Índice IEI y Polígonos No-Deforestación
  buildEsgLayers() {
    // A. Polígono Certificado Cero-Deforestación (EUDR 2025)
    const eudrCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-25, 0.7, -10),
      new THREE.Vector3(-5, 0.6, -12),
      new THREE.Vector3(10, 0.6, -26),
      new THREE.Vector3(-15, 0.7, -30),
      new THREE.Vector3(-25, 0.7, -10)
    ]);
    const eudrGeo = new THREE.TubeGeometry(eudrCurve, 48, 0.5, 8, true);
    const eudrMat = new THREE.MeshStandardMaterial({
      color: '#10b981',
      emissive: '#047857',
      emissiveIntensity: 0.7,
      roughness: 0.3
    });
    const eudrMesh = new THREE.Mesh(eudrGeo, eudrMat);
    this.esgLayersGroup.add(eudrMesh);

    // B. Corredor de Integridad Ecológica (IEI 0.88)
    const corridorGeo = new THREE.PlaneGeometry(16, 24);
    corridorGeo.rotateX(-Math.PI / 2);
    const corridorMat = new THREE.MeshBasicMaterial({
      color: '#059669',
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const corridorMesh = new THREE.Mesh(corridorGeo, corridorMat);
    corridorMesh.position.set(-8, 0.4, -20);
    this.esgLayersGroup.add(corridorMesh);

    // C. Halos de Densidad de Carbono (tCO2e/ha)
    const carbonGeo = new THREE.RingGeometry(1.5, 3.2, 24);
    carbonGeo.rotateX(-Math.PI / 2);
    const carbonMat = new THREE.MeshBasicMaterial({
      color: '#15803d',
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    [-18, -10, 2].forEach(x => {
      const cRing = new THREE.Mesh(carbonGeo, carbonMat);
      cRing.position.set(x, 0.42, -22);
      this.esgLayersGroup.add(cRing);
    });
  }

  flyToPosition(px, py, pz, tx = 0, ty = 0, tz = 0, duration = 1000) {
    if (this.camera && typeof this.animateCamera === 'function') {
      this.animateCamera(new THREE.Vector3(px, py, pz), new THREE.Vector3(tx, ty, tz), duration);
    }
  }

  animateCamera(targetPos, targetLookAt, duration = 1200) {
    const startPos    = this.camera.position.clone();
    const startTarget = this.controls ? this.controls.target.clone() : new THREE.Vector3();
    const startTime   = performance.now();

    const updateCamera = () => {
      const elapsed  = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const ease     = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(startPos, targetPos, ease);
      if (this.controls) {
        this.controls.target.lerpVectors(startTarget, targetLookAt, ease);
        this.controls.update();
      }

      if (progress < 1.0) requestAnimationFrame(updateCamera);
    };
    updateCamera();
  }

  // ─── Terrain Sculpting Engine (Hacedor de Relieves / Profundidades) ─────────

  buildSculptBrushRing() {
    const ringGeo = new THREE.RingGeometry(this.sculptRadius - 0.35, this.sculptRadius, 48);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthTest: false
    });
    this.brushRing = new THREE.Mesh(ringGeo, ringMat);
    this.brushRing.visible = false;
    this.brushRing.renderOrder = 999;
    this.scene.add(this.brushRing);
  }

  setSculptMode(mode) {
    this.sculptMode = mode; // 'raise' | 'lower' | null
    if (this.brushRing) {
      this.brushRing.visible = (mode !== null);
      if (mode === 'raise') {
        this.brushRing.material.color.setHex(0x10b981); // emerald green
      } else if (mode === 'lower') {
        this.brushRing.material.color.setHex(0xef4444); // crimson red
      }
    }

    const container = this.container || document.getElementById(this.containerId);
    if (container) {
      container.style.cursor = mode ? 'crosshair' : 'default';
    }

    // Disable orbit controls while sculpting so mouse drag edits the terrain
    if (this.controls) {
      this.controls.enabled = (mode === null);
    }
  }

  setupSculptingEvents() {
    const canvas = this.renderer.domElement;
    if (!canvas) return;

    let sculptAnimId = null;
    const lastHitPoint = new THREE.Vector3();
    let hasHit = false;

    const performSculptStep = () => {
      if (!this.isSculpting || !this.sculptMode || !hasHit || !this.groundMesh) return;

      const posAttr = this.groundMesh.geometry.attributes.position;
      const dir = (this.sculptMode === 'raise') ? 1.0 : -1.0;
      const delta = dir * this.sculptSpeed * 0.18;
      const cx = lastHitPoint.x;
      const cz = lastHitPoint.z;
      const radius = this.sculptRadius;

      let changed = false;
      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vz = posAttr.getZ(i);
        const dist = Math.hypot(vx - cx, vz - cz);

        if (dist < radius) {
          const factor = 0.5 * (1.0 + Math.cos((Math.PI * dist) / radius));
          const currentY = posAttr.getY(i);
          const newY = currentY + delta * factor;
          posAttr.setY(i, newY);
          this.baseYValues[i] = newY / this.currentReliefScale;
          changed = true;
        }
      }

      if (changed) {
        posAttr.needsUpdate = true;
        this.groundMesh.geometry.computeVertexNormals();
        this.conformWaterToTerrain();
      }

      sculptAnimId = requestAnimationFrame(performSculptStep);
    };

    canvas.addEventListener('mousemove', (event) => {
      if (!this.groundMesh) return;
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.sculptMode) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hits = this.raycaster.intersectObject(this.groundMesh);
        if (hits.length > 0) {
          hasHit = true;
          lastHitPoint.copy(hits[0].point);
          if (this.brushRing) {
            this.brushRing.position.set(hits[0].point.x, hits[0].point.y + 0.15, hits[0].point.z);
            this.brushRing.visible = true;
          }
        } else {
          hasHit = false;
          if (this.brushRing) this.brushRing.visible = false;
        }
      }
    });

    canvas.addEventListener('mousedown', (event) => {
      if (event.button !== 0 || !this.sculptMode) return;
      this.isSculpting = true;
      cancelAnimationFrame(sculptAnimId);
      performSculptStep();
    });

    // Soporte Táctil para Esculpir Terreno (Mobile & Tablet)
    const updateRaycastFromTouch = (touch) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hits = this.raycaster.intersectObject(this.groundMesh);
      if (hits.length > 0) {
        hasHit = true;
        lastHitPoint.copy(hits[0].point);
        if (this.brushRing) {
          this.brushRing.position.set(hits[0].point.x, hits[0].point.y + 0.15, hits[0].point.z);
          this.brushRing.visible = true;
        }
      } else {
        hasHit = false;
        if (this.brushRing) this.brushRing.visible = false;
      }
    };

    canvas.addEventListener('touchstart', (e) => {
      if (!this.sculptMode || e.touches.length !== 1) return;
      if (this.controls) this.controls.enabled = false;
      updateRaycastFromTouch(e.touches[0]);
      if (hasHit) {
        this.isSculpting = true;
        cancelAnimationFrame(sculptAnimId);
        performSculptStep();
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      if (!this.sculptMode || e.touches.length !== 1) return;
      e.preventDefault();
      updateRaycastFromTouch(e.touches[0]);
    }, { passive: false });

    const stopTouchSculpt = () => {
      this.isSculpting = false;
      cancelAnimationFrame(sculptAnimId);
      if (this.brushRing) this.brushRing.visible = false;
      if (this.controls) this.controls.enabled = true;
    };

    canvas.addEventListener('touchend', stopTouchSculpt);
    canvas.addEventListener('touchcancel', stopTouchSculpt);

    const stopSculpt = () => {
      this.isSculpting = false;
      cancelAnimationFrame(sculptAnimId);
    };

    canvas.addEventListener('mouseup', stopSculpt);
    canvas.addEventListener('mouseleave', stopSculpt);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.sculptMode) {
        this.setSculptMode(null);
        bus.emit('map:sculpt_mode_canceled', {});
      }
    });
  }

  // ─── Celestial Moon & Night Lighting ─────────────────────────────────────────

  buildMoon() {
    const moonGeo = new THREE.SphereGeometry(14, 24, 24);
    const moonCanvas = document.createElement('canvas');
    moonCanvas.width = 256; moonCanvas.height = 256;
    const mCtx = moonCanvas.getContext('2d');
    mCtx.fillStyle = '#e2e8f0'; mCtx.fillRect(0, 0, 256, 256);
    mCtx.fillStyle = '#cbd5e1';
    for (let i = 0; i < 24; i++) {
      mCtx.beginPath();
      mCtx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 20 + 6, 0, Math.PI * 2);
      mCtx.fill();
    }
    const moonTex = new THREE.CanvasTexture(moonCanvas);

    this.moonMaterial = new THREE.MeshBasicMaterial({
      map: moonTex,
      fog: false
    });
    this.moonMesh = new THREE.Mesh(moonGeo, this.moonMaterial);
    this.scene.add(this.moonMesh);

    this.moonLight = new THREE.DirectionalLight('#93c5fd', 0.25);
    this.moonLight.castShadow = false;
    this.scene.add(this.moonLight);

    this.updateMoonPosition(this.dayOfYear, this.hourOfDay);
  }

  updateMoonPosition(dayOfYear, hour) {
    if (!this.moonMesh) return;
    const moonAgeDays = (dayOfYear + hour / 24 + 14) % 29.53;
    const phaseAngle = (moonAgeDays / 29.53) * Math.PI * 2;

    const distance = 420;
    const moonAzimuth = ((hour - 12) * 15 * (Math.PI / 180)) + phaseAngle + Math.PI;
    const moonElevation = Math.max(-0.5, Math.sin(moonAzimuth) * 0.75);

    const mx = distance * Math.cos(moonElevation) * Math.sin(moonAzimuth);
    const my = Math.max(-50, distance * Math.sin(moonElevation));
    const mz = distance * Math.cos(moonElevation) * Math.cos(moonAzimuth);

    this.moonMesh.position.set(mx, my, mz);
    if (this.moonLight) {
      this.moonLight.position.set(mx, Math.max(10, my), mz);
      this.moonLight.intensity = (hour < 7 || hour > 19) ? 0.35 : 0.05;
    }
  }

  // ─── Tidal / Ocean Simulation ────────────────────────────────────────────────

  buildTidalWater() {
    const tidalGeo = new THREE.PlaneGeometry(320, 320, 32, 32);
    tidalGeo.rotateX(-Math.PI / 2);

    this.tidalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0369a1,
      roughness: 0.04,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75,
      envMapIntensity: 1.2,
      emissive: new THREE.Color(0x075985),
      emissiveIntensity: 0.22,
      side: THREE.DoubleSide
    });

    this.tidalMesh = new THREE.Mesh(tidalGeo, this.tidalMaterial);
    this.tidalMesh.position.y = -20; // hidden initially
    this.tidalMesh.visible = false;
    this.scene.add(this.tidalMesh);
  }

  setTidalLevel(meters) {
    this.tidalLevel = meters;
    if (!this.tidalMesh) return;
    if (meters <= -10) {
      this.tidalMesh.visible = false;
    } else {
      this.tidalMesh.visible = true;
      this.tidalMesh.position.y = meters;
    }
    bus.emit('terrain:tidal_level_updated', meters);
  }

  // ─── Escala Cuenca: Cordillera de los Andes, Viento Puelche & Inundación Fluvial ─

  buildAndesMountainsBackdrop() {
    this.andesGroup = new THREE.Group();
    this.andesGroup.name = 'andesMountainsBackdrop';

    // Cadena montañosa andina en el límite este del horizonte (Nevados de Longaví / Parral)
    const peakDefs = [
      { x: 125, z: -80, h: 42, r: 24, name: 'Cerro El Nevado' },
      { x: 135, z: -40, h: 52, r: 28, name: 'Nevados de Longaví (3.242m)' },
      { x: 130, z:   0, h: 46, r: 26, name: 'Cordón Los Baños' },
      { x: 138, z:  45, h: 49, r: 27, name: 'Punta Bullileo' },
      { x: 128, z:  85, h: 39, r: 22, name: 'Cajón de Digua' }
    ];

    peakDefs.forEach(p => {
      // 1. Cuerpo de la montaña (roca granítica oscura)
      const mountainGeo = new THREE.ConeGeometry(p.r, p.h, 9);
      const mountainMat = new THREE.MeshStandardMaterial({
        color: '#334155',
        roughness: 0.95,
        flatShading: true
      });
      const mountain = new THREE.Mesh(mountainGeo, mountainMat);
      mountain.position.set(p.x, p.h * 0.45, p.z);
      this.andesGroup.add(mountain);

      // 2. Casquete de nieve y glaciares andinos
      const snowGeo = new THREE.ConeGeometry(p.r * 0.45, p.h * 0.35, 9);
      const snowMat = new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.6,
        metalness: 0.1,
        flatShading: true
      });
      const snow = new THREE.Mesh(snowGeo, snowMat);
      snow.position.set(p.x, p.h * 0.82, p.z);
      this.andesGroup.add(snow);
    });

    this.scene.add(this.andesGroup);
  }

  buildPuelcheWindRibbons() {
    this.puelcheWindGroup = new THREE.Group();
    this.puelcheWindGroup.name = 'puelcheWindGroup';
    this.puelcheWindGroup.visible = false; // Activado bajo demanda o escenario

    const windLines = [];
    const numRibbons = 12;

    for (let i = 0; i < numRibbons; i++) {
      const startZ = -60 + i * 11 + (Math.random() - 0.5) * 5;
      const startY = 14 + (Math.random() - 0.5) * 6;

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(90, startY + 8, startZ - 10),
        new THREE.Vector3(45, startY + 4, startZ - 4),
        new THREE.Vector3(0,  startY,     startZ),
        new THREE.Vector3(-45,startY - 3, startZ + 4),
        new THREE.Vector3(-90,startY - 6, startZ + 8)
      ]);

      const ribbonGeo = new THREE.TubeGeometry(curve, 36, 0.28, 6, false);
      const ribbonMat = new THREE.MeshStandardMaterial({
        color: '#f97316', // Naranja fuego Puelche cálido y seco
        emissive: '#ea580c',
        emissiveIntensity: 0.85,
        transparent: true,
        opacity: 0.65
      });
      const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
      this.puelcheWindGroup.add(ribbon);
      windLines.push({ mesh: ribbon, startZ: startZ, offset: i * 0.2 });
    }

    this.scene.add(this.puelcheWindGroup);

    // Animación de flujo de viento Puelche
    this.addAnimated(this.puelcheWindGroup, (time) => {
      if (!this.puelcheWindGroup.visible) return;
      windLines.forEach((w) => {
        const pulse = 0.5 + Math.sin(time * 0.005 + w.offset * Math.PI) * 0.35;
        w.mesh.material.opacity = pulse;
      });
    });
  }

  togglePuelcheWind(active) {
    this.puelcheActive = active;
    if (this.puelcheWindGroup) {
      this.puelcheWindGroup.visible = active;
    }
  }

  buildFloodWaterPlane() {
    // Lámina hidráulica dinámica del Estero Colliguay / Cuenca Perquilauquén
    const floodGeo = new THREE.PlaneGeometry(160, 80, 48, 24);
    floodGeo.rotateX(-Math.PI / 2);

    this.floodMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      roughness: 0.08,
      metalness: 0.15,
      transparent: true,
      opacity: 0.82,
      transmission: 0.65,
      emissive: new THREE.Color(0x0369a1),
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide
    });

    this.floodMesh = new THREE.Mesh(floodGeo, this.floodMaterial);
    this.floodMesh.position.set(0, -10, 0); // Oculto bajo el terreno inicialmente
    this.floodMesh.rotation.y = 0.22; // Alineado con el meandro del estero
    this.floodMesh.visible = false;
    this.scene.add(this.floodMesh);

    // Animación sutil de oleaje en crecida
    this.addAnimated(this.floodMesh, (time) => {
      if (!this.floodMesh.visible) return;
      const wave = Math.sin(time * 0.003) * 0.08;
      this.floodMesh.position.y = this.floodLevel + wave;
    });
  }

  setFloodLevel(targetElevation) {
    this.floodLevel = targetElevation;
    if (!this.floodMesh) return;

    if (targetElevation <= -5.0) {
      this.floodMesh.visible = false;
    } else {
      this.floodMesh.visible = true;
      this.floodMesh.position.y = targetElevation;
    }
  }

  setAquiferStress(isStressed) {
    // Busca el mesh del acuífero en territorialLayersGroup y actualiza su semáforo
    if (this.territorialLayersGroup) {
      this.territorialLayersGroup.traverse((child) => {
        if (child.isMesh && child.material && child.geometry && child.geometry.type === 'RingGeometry') {
          if (isStressed) {
            child.material.color.set('#ef4444'); // Rojo Crítico sobreexplotación
          } else {
            child.material.color.set('#eab308'); // Amarillo Precaución 68%
          }
        }
      });
    }
  }

  resetBasinScenarios() {
    this.togglePuelcheWind(false);
    this.setFloodLevel(-10.0);
    this.setAquiferStress(false);
    this.setRainActive(false);
  }

  /**
   * Sistema de Precipitación Procedural (Lluvia en Modo Predio)
   * Crea un volumen de partículas cilíndrico/prismático centrado en el campo de visión.
   */
  buildPrecipitationSystem() {
    this.rainCount = 2800;
    this.rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    const velocities = new Float32Array(this.rainCount);

    const rangeX = 120;
    const rangeY = 45;
    const rangeZ = 120;

    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * rangeX;
      positions[i * 3 + 1] = Math.random() * rangeY;
      positions[i * 3 + 2] = (Math.random() - 0.5) * rangeZ;
      velocities[i] = 0.8 + Math.random() * 0.6; // Velocidad de caída
    }

    this.rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.rainVelocities = velocities;

    this.rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.28,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.rainPoints = new THREE.Points(this.rainGeo, this.rainMat);
    this.rainPoints.visible = false;
    this.rainActive = false;
    this.scene.add(this.rainPoints);

    // Animación de caída de lluvia en el loop principal
    this.addAnimated(this.rainPoints, () => {
      if (!this.rainPoints.visible || !this.rainActive) return;

      const posAttr = this.rainGeo.attributes.position;
      const arr = posAttr.array;
      const count = this.rainCount;

      // Anclar caja de lluvia a la posición actual de la cámara (efecto de inmersión en cámara)
      const camX = this.camera ? this.camera.position.x : 0;
      const camZ = this.camera ? this.camera.position.z : 0;

      for (let i = 0; i < count; i++) {
        // Caída vertical con ligera inclinación por viento
        arr[i * 3 + 1] -= this.rainVelocities[i];

        // Deriva por viento Maule (dirección ENE)
        arr[i * 3 + 0] -= 0.08;
        arr[i * 3 + 2] += 0.05;

        // Reset cuando toca el suelo o se aleja demasiado de la cámara
        if (arr[i * 3 + 1] < 0) {
          arr[i * 3 + 1] = 45 + Math.random() * 5;
          arr[i * 3 + 0] = camX + (Math.random() - 0.5) * 120;
          arr[i * 3 + 2] = camZ + (Math.random() - 0.5) * 120;
        }
      }
      posAttr.needsUpdate = true;
    });
  }

  setRainActive(active) {
    this.rainActive = !!active;
    if (this.rainPoints) {
      this.rainPoints.visible = this.rainActive;
    }
  }

  onWeatherUpdated(wx) {
    if (!wx) return;
    // Si hay lluvia en el pronóstico actual (> 0 mm) o condición de lluvia
    const isRaining = (wx.rain_1h_mm && wx.rain_1h_mm > 0) || 
                      (wx.conditionCode && (wx.conditionCode.toLowerCase().includes('rain') || wx.conditionCode.toLowerCase().includes('drizzle')));
    if (isRaining && !this.rainActive) {
      this.setRainActive(true);
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width  = this.container.clientWidth  || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.composer) this.composer.setSize(width, height);
  }

  /**
   * Sets multispectral & topographic layers on terrain:
   * 'pbr' | 'ndvi' | 'dem' | 'ndwi' | 'nbr'
   * @param {string} mode 
   */
  setSpectralLayerMode(mode) {
    if (this.terrainMoistureUniforms) {
      BiophysicalTerrainShader.setLayerMode(this.terrainMoistureUniforms, mode);

      // Asegurar que groundMesh tenga asignado groundCiv6Mat (posee el shader multispectral)
      if (this.groundMesh) {
        if (mode === 'pbr') {
          // Si el modo original era satélite o relieve, restaurarlo; sino mantener Civ6 PBR
          if (this.currentMode === 'satellite') {
            this.groundMesh.material = this.groundSatMat;
          } else if (this.currentMode === 'relief' || this.currentMode === 'dem') {
            this.groundMesh.material = this.groundReliefMat;
          } else {
            this.groundMesh.material = this.groundCiv6Mat;
          }
        } else {
          // Si se activa cualquier capa espectral (NDVI, DEM, NDWI, NBR), activar material con shader
          this.groundMesh.material = this.groundCiv6Mat;
        }
      }

      // Mostrar u ocultar leyenda espectral flotante en la UI si existe
      bus.emit('spectral:mode_changed', { mode });

      const labels = {
        pbr: '🌱 Capa Biofísica de Suelo PBR',
        ndvi: '🛰️ Capa Satelital NDVI (Sentinel-2 Vigor)',
        dem: '🏔️ Capa Topográfica DEM & Curvas de Nivel',
        ndwi: '💧 Capa Hídrica NDWI (Humedad & Drenaje)',
        nbr: '🔥 Capa NBR / Biomasa Forestal (Combustible)'
      };
      bus.emit('ui:show_toast', labels[mode] || `🛰️ Modo Espectral: ${mode.toUpperCase()}`);
    }
  }

  /**
   * Toggles scientific Sentinel-2 NDVI multispectral layer on terrain.
   * @param {boolean} active 
   */
  setNdviMode(active) {
    this.setSpectralLayerMode(active ? 'ndvi' : 'pbr');
  }

  // ─── Render Loop ──────────────────────────────────────────────────────────────

  animate(time = 0) {
    requestAnimationFrame((t) => this.animate(t));

    if (this.controls) this.controls.update();

    // Animate water shimmer & biophysical shader time
    this._animateWater(time);
    if (this.terrainMoistureUniforms) {
      BiophysicalTerrainShader.updateTime(this.terrainMoistureUniforms, 0.016);
    }

    // Animate geomorphic wind vector particles (Windy style)
    if (this.geomorphicManager) {
      if (typeof this.geomorphicManager.updateWindParticles === 'function') {
        this.geomorphicManager.updateWindParticles(0.016);
      }
      if (typeof this.geomorphicManager.updateRunoffParticles === 'function') {
        this.geomorphicManager.updateRunoffParticles(0.016);
      }
    }

    // Animate procedural foliage wind sway
    if (this.vegetationManager && typeof this.vegetationManager.animateWind === 'function') {
      this.vegetationManager.animateWind(time * 0.001, 18.0);
    }

    // Update animated objects
    this.animatedObjects.forEach(item => {
      if (item.updateFn) item.updateFn(time);
    });

    // Update Spatial Widgets (compass, sun tracker, scale bar)
    if (this.spatialWidgets) this.spatialWidgets.update();

    // Render via composer (bloom) if available, else standard renderer
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
