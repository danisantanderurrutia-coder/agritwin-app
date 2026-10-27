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
import { WindyBasinEngine } from './WindyBasinEngine.js';

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
    this.windyEngine      = null; // GPU Flow Field Visualizer (Windy.com style)

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

    // Modos de Cámara y Tour Cinematográfico
    this.isTourActive   = false;
    this.tourSpots      = [];
    this.tourIndex      = 0;
    this._tourDriftId   = null;
    this._camAnimId     = null;

    // Inspección en Primera Persona / Paseo a Pie (1.75m sobre terreno)
    this.isWalkthrough    = false;
    this.walkYaw          = 0;
    this.walkPitch        = 0;
    this.walkBobTime      = 0;
    this.walkKeys         = { forward: false, backward: false, left: false, right: false, sprint: false };
    this._walkIsMouseDown = false;
    this._walkLastMouse   = { x: 0, y: 0 };
    this._onWalkKeyDown   = null;
    this._onWalkKeyUp     = null;
    this._onWalkMouseDown = null;
    this._onWalkMouseMove = null;
    this._onWalkMouseUp   = null;

    // Timelapse Solar 24h
    this.isTimelapseActive  = false;
    this.timelapseDuration  = 16000; // 16 segundos para ciclo completo
    this.timelapseStartTime = 0;
  }

  /**
   * Smart spatial projection: maps geographic WGS84 coordinates to local Three.js terrain units.
   * Auto-detects coordinate reference frames:
   * - Bundled reference dataset (Cupertino reference: lon ~ -122°, lat ~ 37°) -> centered on farm
   * - Maule / Chilean coordinates (lon ~ -71.8°, lat ~ -36.1°) -> centered on Parral terrain
   */
  static latLonToVector3(lon, lat, height = 0) {
    let centerLon = -71.6050; // Parral, Maule Sur (Fundo Meniel)
    let centerLat = -36.2115; // Parral, Maule Sur (Fundo Meniel)
    let scaleX = 8800;
    let scaleZ = 11100;

    // Respaldo de compatibilidad para coordenadas de referencia históricas
    if (lon < -100 && lat > 20) {
      centerLon = -122.0838;
      centerLat = 37.3858;
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
    this.scene.fog = new THREE.FogExp2('#b8cce0', 0.0025);

    // --- Camera ---
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1200);
    this.camera.position.set(22, 40, 52);

    // --- Renderer (G6: High DPR + tone mapping) ---
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02; // Calibrated for deep contrast and rich foliage
    this.renderer.outputColorSpace  = THREE.SRGBColorSpace;

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
    if (ppAvailable) {
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

    // --- Single-Engine Multi-Profile Layers ---
    this.scene.add(this.enterpriseLayersGroup);
    this.scene.add(this.territorialLayersGroup);
    this.scene.add(this.esgLayersGroup);
    this.buildProfileLayers();
    // Iniciar con visión limpia y realista: capas analíticas abstractas desactivadas por defecto
    this.enterpriseLayersGroup.visible = false;
    this.territorialLayersGroup.visible = false;
    this.esgLayersGroup.visible = false;

    // --- Event Listeners ---
    this.setupEntityPicker();
    window.addEventListener('resize', () => this.onWindowResize());

    bus.on('map:flyto',            (preset)        => this.flyToPreset(preset));
    bus.on('map:set_mode',         (mode)          => this.setMapMode(mode));
    bus.on('map:set_profile',      (profile)       => this.setProfileView(profile));
    bus.on('map:set_relief_scale', (scale)         => this.setReliefScale(scale));
    bus.on('map:set_sculpt_mode',  (mode)          => this.setSculptMode(mode));
    bus.on('map:set_tidal_level',  (meters)        => this.setTidalLevel(meters));
    bus.on('basin:puelche_wind',    (active)        => this.togglePuelcheWind(active));
    bus.on('basin:flood_level',     (meters)        => this.setFloodLevel(meters));
    bus.on('basin:aquifer_stress',  (active)        => this.setAquiferStress(active));
    bus.on('basin:reset_scenarios', ()              => this.resetBasinScenarios());
    bus.on('map:update_sun',       ({ day, hour }) => {
      this.updateSunPosition(day, hour);
      this.updateMoonPosition(day, hour);
    });
    bus.on('map:set_ndvi_mode',    (active)        => this.setNdviMode(active));

    // Dynamic Camera Modes & Tours
    bus.on('map:start_tour',        ()              => this.startCinematicTour());
    bus.on('map:stop_tour',         ()              => this.stopCinematicTour());
    bus.on('map:toggle_tour',       ()              => this.isTourActive ? this.stopCinematicTour() : this.startCinematicTour());
    bus.on('map:start_walkthrough', ()              => this.startWalkthroughMode());
    bus.on('map:stop_walkthrough',  ()              => this.stopWalkthroughMode());
    bus.on('map:toggle_walkthrough',()              => this.isWalkthrough ? this.stopWalkthroughMode() : this.startWalkthroughMode());
    bus.on('map:start_timelapse',   (durationMs)    => this.startSolarTimelapse(durationMs));
    bus.on('map:stop_timelapse',    ()              => this.stopSolarTimelapse());
    bus.on('map:toggle_timelapse',  ()              => this.isTimelapseActive ? this.stopSolarTimelapse() : this.startSolarTimelapse());

    if (this.controls) {
      this.controls.addEventListener('start', () => {
        if (this.isTourActive) this.stopCinematicTour();
      });
    }

    // GPU Flow Field Visualizer (Windy.com Style for Macro-Cuenca 122.000 ha)
    try {
      this.windyEngine = new WindyBasinEngine(this);
      await this.windyEngine.init();
      window.windyEngine = this.windyEngine;
    } catch (err) {
      console.warn('⚠️ [MapManager] WindyBasinEngine initialization error:', err);
    }

    this.animate();

    console.log('🌱 AgriTwin HD Terrain Engine initialized — Andes scale, Puelche wind vectors, Flood modeling.');
    return this;
  }

  // ─── G2: Dynamic Sky ─────────────────────────────────────────────────────────

  buildDynamicSky() {
    // Sky dome — large hemisphere with vertical gradient baked into vertex colors
    const skyGeo = new THREE.SphereGeometry(600, 32, 16);
    skyGeo.scale(-1, 1, -1); // flip normals inward

    // We'll update this material's colors on each frame based on hourOfDay
    this.skyMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false });

    // Bake initial vertex colors (noon default)
    this._paintSkyVertices(skyGeo, 12);

    this.skyMesh = new THREE.Mesh(skyGeo, this.skyMaterial);
    this.skyMesh.renderOrder = -1;
    this.scene.add(this.skyMesh);
  }

  _paintSkyVertices(geometry, hour) {
    // Sky color interpolation: dawn → noon → dusk → night
    const skyPalettes = {
      dawn:  { horizon: new THREE.Color('#f97316'), zenith: new THREE.Color('#7c3aed') },
      noon:  { horizon: new THREE.Color('#93c5fd'), zenith: new THREE.Color('#1e40af') },
      dusk:  { horizon: new THREE.Color('#fb923c'), zenith: new THREE.Color('#6d28d9') },
      night: { horizon: new THREE.Color('#1e293b'), zenith: new THREE.Color('#0f172a') }
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

  // ─── Lighting (PBR Soft Shadows & Sunset Environment IBL) ─────────────────────

  buildLighting() {
    const ambientLight = new THREE.AmbientLight('#fef3c7', 0.32);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#7dd3fc', '#14532d', 0.38);
    this.scene.add(hemiLight);

    // Dynamic Solar Directional Light with PCFSoftShadowMap
    this.sunLight = new THREE.DirectionalLight('#fffbeb', 1.45);
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

    // Fill light from sky (blue-tinted for ambient sky bounce)
    const fillLight = new THREE.DirectionalLight('#93c5fd', 0.22);
    fillLight.position.set(-40, 25, -40);
    this.scene.add(fillLight);

    // Image-Based Lighting (IBL) environment map (Equirectangular Sunset preset)
    this.buildEnvironmentMap();

    this.updateSunPosition(this.dayOfYear, this.hourOfDay);
  }

  /**
   * Generates a sunset radiance environment map using PMREMGenerator.
   * Equivalent to Drei's <Environment preset="sunset" /> for PBR sheen.
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
      grad.addColorStop(0.0, '#1e3a8a'); // Sky zenith deep navy
      grad.addColorStop(0.38, '#ea580c'); // Warm sunset amber/orange
      grad.addColorStop(0.52, '#fde047'); // Golden horizon line
      grad.addColorStop(0.60, '#36220f'); // Soil diffuse reflection
      grad.addColorStop(1.0, '#18110b'); // Nadir ground
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      // Golden solar disk
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.arc(256, 128, 20, 0, Math.PI * 2);
      ctx.fill();

      const envTex = new THREE.CanvasTexture(envCanvas);
      const envRenderTarget = pmremGenerator.fromEquirectangular(envTex);
      this.scene.environment = envRenderTarget.texture;
      envTex.dispose();
      pmremGenerator.dispose();
      console.log('🌅 Sunset PBR Environment Map active for realistic IBL radiance.');
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
        this.sunLight.intensity = 1.2;
      } else if (elevDeg <= 0) {
        this.sunLight.color.setHex(0x1e293b); // Night
        this.sunLight.intensity = 0.15;
      } else {
        this.sunLight.color.setHex(0xfffbeb); // Midday crisp warm white
        this.sunLight.intensity = 1.9;
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

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);

      // Terreno plano agrícola sobre el campo de Meniel
      let y = 0.0;
      const dist = getDistToRiver(x, z);
      const riverWidth = 4.2;

      // Suave lecho natural del estero Colliguay
      if (dist < riverWidth) {
        const t = 1 - Math.pow(dist / riverWidth, 2);
        y -= t * 0.45;
      }

      posAttr.setY(i, y);
      this.baseYValues[i] = y;

      // Colores de vegetación natural del predio
      const u = uvAttr.getX(i);
      const v = uvAttr.getY(i);
      let r, g, b;

      if (dist < riverWidth + 5) {
        // Ribera húmeda del estero
        r = 0.10; g = 0.36; b = 0.14;
      } else if ((u > 0.28 && u < 0.68) && (v > 0.2 && v < 0.72)) {
        // Zona central de cultivo
        r = 0.16; g = 0.40; b = 0.12;
      } else {
        // Pradera natural regenerativa
        r = 0.22; g = 0.45; b = 0.15;
      }

      colors[i * 3]     = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    groundGeo.computeVertexNormals();
    groundGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // PBR Soil Micro-Relieve: Plowing Furrows & Humus Texture
    const soilNormalMap = PBRSoilGenerator.createSoilNormalMap(1024);
    const soilRoughnessMap = PBRSoilGenerator.createSoilRoughnessMap(1024);

    // 1. Multi-texture material using vertex colors + PBR Furrows + Biophysical Soil Moisture (Civ VI / Farm Sim)
    this.groundCiv6Mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      normalMap: soilNormalMap,
      normalScale: new THREE.Vector2(1.6, 1.6),
      roughnessMap: soilRoughnessMap,
      roughness: 0.86,
      metalness: 0.04,
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
    this.pickableObjects.push(mesh);
  }

  addAnimated(object, updateFn) {
    this.animatedObjects.push({ object, updateFn });
  }

  setupEntityPicker() {
    const canvas = this.renderer.domElement;

    // 1. Mouse Click Raycaster (Selection)
    canvas.addEventListener('click', (event) => {
      // Ignorar selección si hay un modo táctico activo (Mover, Dibujar, Borrar, Colocar Objetos)
      if (
        this.drawingManager?.isDrawingActive ||
        this.drawingManager?.isMoveMode ||
        this.drawingManager?.isEraseMode ||
        this.objectPlacementManager?.isPlacing
      ) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      this.mouse.x =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Filtrar solo objetos visibles (ignora cámaras o capas apagadas)
      const activePickables = (this.pickableObjects || []).filter(obj => {
        let cur = obj;
        while (cur && cur !== this.scene) {
          if (cur.visible === false) return false;
          cur = cur.parent;
        }
        return true;
      });

      const intersects = this.raycaster.intersectObjects(activePickables, true);

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
      const intersects = this.raycaster.intersectObjects(this.pickableObjects, true);

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

        if (hitObj && hitObj.userData && (hitObj.userData.type || hitObj.userData.isCustom || hitObj.userData.cropType)) {
          canvas.style.cursor = 'pointer';
          const id = hitObj.userData.id || hitObj.userData.parcelId;
          if (id !== lastHoveredId) {
            lastHoveredId = id;
            if (hitObj.userData.type === 'parcel') {
              bus.emit('parcel:hover', id);
            }
            if (hitObj.userData.type === 'parcel' || hitObj.userData.type === 'custom_polygon' || hitObj.userData.isCustom || hitObj.userData.cropType) {
              bus.emit('polygon:hover', {
                id,
                data: hitObj.userData,
                point: hit.point,
                worldPos: hit.point.clone()
              });
            }
          }
          return;
        }
      }

      if (lastHoveredId !== null) {
        lastHoveredId = null;
        bus.emit('parcel:unhover');
        bus.emit('polygon:unhover');
      }
      if (!this.sculptMode && !this.drawingManager?.isMoveMode) {
        canvas.style.cursor = 'default';
      }
    });
  }

  // ─── Camera Presets & Single-Engine Multi-Profile System ─────────────────────

  getLiveObjectFocus(preset) {
    if (!this.scene) return null;

    let targetObj = null;

    if (preset === 'tractor') {
      this.scene.traverse((obj) => {
        if (targetObj) return;
        const id = obj.userData?.id || '';
        const name = (obj.name || '') + ' ' + (obj.userData?.name || '');
        if (id === 'tractor_agricola_glb' || id.includes('tractor') || name.toLowerCase().includes('tractor')) {
          let cur = obj;
          while (cur.parent && cur.parent !== this.scene && cur.parent.name !== 'realFarmsteadGLBGroup') {
            if (cur.userData?.id === 'tractor_agricola_glb') break;
            cur = cur.parent;
          }
          targetObj = cur;
        }
      });

      if (targetObj) {
        targetObj.updateMatrixWorld?.(true);
        const box = new THREE.Box3().setFromObject(targetObj);
        const center = new THREE.Vector3();
        box.getCenter(center);
        if (!isNaN(center.x) && !isNaN(center.z)) {
          return {
            target: new THREE.Vector3(center.x, center.y + 0.9, center.z),
            pos:    new THREE.Vector3(center.x + 6.5, center.y + 2.8, center.z + 5.5)
          };
        }
      }
    } else if (preset === 'solar') {
      this.scene.traverse((obj) => {
        if (targetObj) return;
        const id = obj.userData?.id || '';
        const sp = (obj.userData?.species || '') + ' ' + (obj.userData?.variety || '') + ' ' + (obj.name || '');
        if (id.includes('agrovoltaico') || id.includes('solar') || sp.toLowerCase().includes('agrivoltaic') || sp.toLowerCase().includes('solar')) {
          targetObj = obj;
        }
      });

      if (targetObj) {
        targetObj.updateMatrixWorld?.(true);
        const box = new THREE.Box3().setFromObject(targetObj);
        const center = new THREE.Vector3();
        box.getCenter(center);
        if (!isNaN(center.x) && !isNaN(center.z)) {
          return {
            target: new THREE.Vector3(center.x, center.y + 1.4, center.z),
            pos:    new THREE.Vector3(center.x + 7.5, center.y + 3.2, center.z + 6.5)
          };
        }
      }
    } else if (preset === 'house') {
      this.scene.traverse((obj) => {
        if (targetObj) return;
        const id = obj.userData?.id || '';
        const name = (obj.name || '') + ' ' + (obj.userData?.name || '');
        if (id === 'house_main' || id === 'granero_principal_glb' || name.toLowerCase().includes('granero principal') || name.toLowerCase().includes('casa principal')) {
          targetObj = obj;
        }
      });

      if (targetObj) {
        targetObj.updateMatrixWorld?.(true);
        const box = new THREE.Box3().setFromObject(targetObj);
        const center = new THREE.Vector3();
        box.getCenter(center);
        if (!isNaN(center.x) && !isNaN(center.z)) {
          return {
            target: new THREE.Vector3(center.x, center.y + 2.0, center.z),
            pos:    new THREE.Vector3(center.x + 11.0, center.y + 5.0, center.z + 12.0)
          };
        }
      }
    } else if (preset === 'livestock') {
      if (this.livestockManager?.sheepGroup && this.livestockManager.sheepGroup.children.length > 0) {
        targetObj = this.livestockManager.sheepGroup;
      } else if (this.livestockManager?.coopGroup) {
        targetObj = this.livestockManager.coopGroup;
      } else {
        this.scene.traverse((obj) => {
          if (targetObj) return;
          const id = obj.userData?.id || '';
          if (id.includes('sheep') || id.includes('coop')) targetObj = obj;
        });
      }

      if (targetObj) {
        targetObj.updateMatrixWorld?.(true);
        const box = new THREE.Box3().setFromObject(targetObj);
        const center = new THREE.Vector3();
        box.getCenter(center);
        if (!isNaN(center.x) && !isNaN(center.z)) {
          return {
            target: new THREE.Vector3(center.x, center.y + 0.8, center.z),
            pos:    new THREE.Vector3(center.x + 8.5, center.y + 2.5, center.z + 7.0)
          };
        }
      }
    } else if (preset === 'tranque') {
      this.scene.traverse((obj) => {
        if (targetObj) return;
        const id = obj.userData?.id || obj.userData?.parcelId || '';
        const sp = (obj.userData?.species || '') + ' ' + (obj.userData?.variety || '') + ' ' + (obj.name || '');
        if (id === 'A103' || sp.toLowerCase().includes('tranque') || sp.toLowerCase().includes('water basin') || sp.toLowerCase().includes('embalse')) {
          targetObj = obj;
        }
      });

      if (targetObj) {
        targetObj.updateMatrixWorld?.(true);
        const box = new THREE.Box3().setFromObject(targetObj);
        const center = new THREE.Vector3();
        box.getCenter(center);
        if (!isNaN(center.x) && !isNaN(center.z)) {
          return {
            target: new THREE.Vector3(center.x, center.y + 0.8, center.z),
            pos:    new THREE.Vector3(center.x + 14.0, center.y + 5.0, center.z + 15.0)
          };
        }
      }
    }

    return null;
  }

  getCameraPreset(preset) {
    // Si el objeto ha sido reubicado o está en escena viva, enfocar su centro real
    const liveTarget = this.getLiveObjectFocus(preset);
    if (liveTarget) {
      return liveTarget;
    }

    const presets = {
      // Perfiles Ejecutivos de Negocio
      enterprise:  { pos: new THREE.Vector3(14, 20, 24),    target: new THREE.Vector3(-4, 1.5, 0)    },
      territorial: { pos: new THREE.Vector3(65, 85, 95),    target: new THREE.Vector3(0, 0, -10)     },
      esg:         { pos: new THREE.Vector3(120, 185, 210), target: new THREE.Vector3(0, 0, 0)       },
      studio:      { pos: new THREE.Vector3(22, 40, 52),    target: new THREE.Vector3(0, 0, 0)       },
      
      // Presets Clásicos Preservados
      overview:    { pos: new THREE.Vector3(22, 40, 52),    target: new THREE.Vector3(0, 0, 0)       },
      orchard:     { pos: new THREE.Vector3(-12, 20, 12),   target: new THREE.Vector3(-10, 2, -5)    },
      sensors:     { pos: new THREE.Vector3(12, 16, 22),    target: new THREE.Vector3(5, 2, 8)       },
      livestock:   { pos: new THREE.Vector3(15, 3.6, 6),    target: new THREE.Vector3(5, 1.2, -2)    },
      permaculture:{ pos: new THREE.Vector3(18, 36, 44),    target: new THREE.Vector3(-2, 2, 6)      },

      // Puntos de Interés Cinematográficos
      house:       { pos: new THREE.Vector3(-2, 7.5, 20),   target: new THREE.Vector3(-13, 3.0, 8.5) },
      solar:       { pos: new THREE.Vector3(-8, 3.8, -2),   target: new THREE.Vector3(-16, 1.8, -9)  },
      tractor:     { pos: new THREE.Vector3(14, 4.0, -6),   target: new THREE.Vector3(7.5, 1.5, -11) },
      tranque:     { pos: new THREE.Vector3(-24, 6.0, 28),  target: new THREE.Vector3(-38, 1.2, 12)  },
      condor:      { pos: new THREE.Vector3(38, 75, 82),    target: new THREE.Vector3(0, 0, 0)       }
    };

    return presets[preset] || presets.overview;
  }

  flyToPreset(preset) {
    if (this.isTourActive) this.stopCinematicTour();
    if (this.isWalkthrough) this.stopWalkthroughMode();

    const t = this.getCameraPreset(preset);
    this.animateCamera(t.pos, t.target, 1400);
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

  animateCamera(targetPos, targetLookAt, duration = 1200, onComplete = null) {
    if (this._camAnimId) {
      cancelAnimationFrame(this._camAnimId);
      this._camAnimId = null;
    }
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

      if (progress < 1.0) {
        this._camAnimId = requestAnimationFrame(updateCamera);
      } else {
        this._camAnimId = null;
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    };
    this._camAnimId = requestAnimationFrame(updateCamera);
  }

  // ─── Modo 1: Tour Drone Cinematográfico Guiado ─────────────────────────────────

  startCinematicTour() {
    this.stopWalkthroughMode();
    this.stopSolarTimelapse();
    this.isTourActive = true;
    this.tourIndex = 0;

    this.tourSpots = [
      { id: 'house',     label: 'Caserío Patrimonial & Galpón',   desc: 'Arquitectura tradicional, silo de granos y molino de viento', duration: 2800, pause: 3800 },
      { id: 'solar',     label: 'Parque Agrovoltaico 6.6 kWp',     desc: 'Módulos bifaciales con seguimiento solar e inversores de red', duration: 3000, pause: 3800 },
      { id: 'tractor',   label: 'Maquinaria RTK de Precisión',     desc: 'Tractor autónomo y cabecera de cuartel de viñedos', duration: 2800, pause: 3800 },
      { id: 'livestock', label: 'Manejo Holístico & Gallinero',     desc: 'Pastoreo regenerativo Voisin y gallinero móvil en pradera', duration: 2800, pause: 3800 },
      { id: 'tranque',   label: 'Tranque de Infiltración Yeomans', desc: '18.500 m³ cosechados mediante diseño hidrológico Keyline', duration: 3000, pause: 4000 },
      { id: 'condor',    label: 'Vuelo de Cóndor sobre el Valle',   desc: 'Perspectiva aérea de la cuenca y zonificación territorial', duration: 3200, pause: 4200 },
      { id: 'overview',  label: 'Vista Global del Gemelo 3D',      desc: 'Gemelo digital unificado de agricultura regenerativa y de precisión', duration: 2800, pause: 3500 }
    ];

    bus.emit('tour:started', { total: this.tourSpots.length });
    this._runTourStep();
  }

  _runTourStep() {
    if (!this.isTourActive) return;
    const currentSpot = this.tourSpots[this.tourIndex];
    bus.emit('tour:step', {
      spot: currentSpot,
      index: this.tourIndex + 1,
      total: this.tourSpots.length
    });

    const preset = this.getCameraPreset(currentSpot.id);
    if (!preset) return;

    this.animateCamera(preset.pos, preset.target, currentSpot.duration, () => {
      if (!this.isTourActive) return;

      const driftStart = performance.now();
      const originPos = preset.pos.clone();
      const originTarget = preset.target.clone();

      const runDrift = () => {
        if (!this.isTourActive) return;
        const driftElapsed = performance.now() - driftStart;
        if (driftElapsed < currentSpot.pause) {
          const t = driftElapsed * 0.0006;
          this.camera.position.x = originPos.x + Math.sin(t) * 0.6;
          this.camera.position.y = originPos.y + Math.cos(t * 0.8) * 0.2;
          if (this.controls) {
            this.controls.target.x = originTarget.x + Math.sin(t * 0.7) * 0.2;
            this.controls.update();
          }
          this._tourDriftId = requestAnimationFrame(runDrift);
        } else {
          this.tourIndex = (this.tourIndex + 1) % this.tourSpots.length;
          this._runTourStep();
        }
      };
      this._tourDriftId = requestAnimationFrame(runDrift);
    });
  }

  stopCinematicTour() {
    if (!this.isTourActive) return;
    this.isTourActive = false;
    if (this._tourDriftId) {
      cancelAnimationFrame(this._tourDriftId);
      this._tourDriftId = null;
    }
    if (this._camAnimId) {
      cancelAnimationFrame(this._camAnimId);
      this._camAnimId = null;
    }
    bus.emit('tour:stopped');
  }

  // ─── Modo 3: Paseo a Pie / Inspección en Primera Persona (1.75m) ──────────────

  startWalkthroughMode(spawnPos = null) {
    this.stopCinematicTour();
    this.stopSolarTimelapse();

    this.isWalkthrough = true;
    if (this.controls) this.controls.enabled = false;

    let startX = -6;
    let startZ = 12;
    if (spawnPos) {
      startX = spawnPos.x;
      startZ = spawnPos.z;
    } else if (Math.abs(this.camera.position.x) < 70 && Math.abs(this.camera.position.z) < 70) {
      startX = this.camera.position.x;
      startZ = this.camera.position.z;
    }

    const groundY = this.getTerrainElevation(startX, startZ);
    this.camera.position.set(startX, groundY + 1.75, startZ);

    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    this.walkYaw = Math.atan2(-dir.x, -dir.z);
    this.walkPitch = Math.asin(Math.max(-0.85, Math.min(0.85, dir.y)));
    this.walkBobTime = 0;
    this.walkKeys = { forward: false, backward: false, left: false, right: false, sprint: false };

    this._setupWalkthroughListeners();
    bus.emit('walkthrough:started');
  }

  _setupWalkthroughListeners() {
    this._onWalkKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.code === 'KeyW' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.walkKeys.forward = true;
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.code === 'KeyS' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        this.walkKeys.backward = true;
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.code === 'KeyA' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.walkKeys.left = true;
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.code === 'KeyD' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.walkKeys.right = true;
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.walkKeys.sprint = true;
        e.stopPropagation();
      }
      if (e.key === 'Escape') {
        this.stopWalkthroughMode();
        e.preventDefault();
        e.stopPropagation();
      }
    };

    this._onWalkKeyUp = (e) => {
      if (e.code === 'KeyW' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.walkKeys.forward = false;
        e.stopPropagation();
      }
      if (e.code === 'KeyS' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        this.walkKeys.backward = false;
        e.stopPropagation();
      }
      if (e.code === 'KeyA' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.walkKeys.left = false;
        e.stopPropagation();
      }
      if (e.code === 'KeyD' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.walkKeys.right = false;
        e.stopPropagation();
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.walkKeys.sprint = false;
        e.stopPropagation();
      }
    };

    const dom = this.renderer.domElement;
    this._walkIsMouseDown = false;
    this._walkLastMouse = { x: 0, y: 0 };

    this._onWalkMouseDown = (e) => {
      this._walkIsMouseDown = true;
      this._walkLastMouse = { x: e.clientX, y: e.clientY };
    };

    this._onWalkMouseMove = (e) => {
      if (!this._walkIsMouseDown) return;
      const dx = e.clientX - this._walkLastMouse.x;
      const dy = e.clientY - this._walkLastMouse.y;
      this._walkLastMouse = { x: e.clientX, y: e.clientY };

      this.walkYaw   -= dx * 0.0035;
      this.walkPitch = Math.max(-1.3, Math.min(1.3, this.walkPitch - dy * 0.0035));
    };

    this._onWalkMouseUp = () => {
      this._walkIsMouseDown = false;
    };

    window.addEventListener('keydown', this._onWalkKeyDown, true);
    window.addEventListener('keyup', this._onWalkKeyUp, true);
    dom.addEventListener('pointerdown', this._onWalkMouseDown);
    window.addEventListener('pointermove', this._onWalkMouseMove);
    window.addEventListener('pointerup', this._onWalkMouseUp);
  }

  _removeWalkthroughListeners() {
    if (this._onWalkKeyDown)   window.removeEventListener('keydown', this._onWalkKeyDown, true);
    if (this._onWalkKeyUp)     window.removeEventListener('keyup', this._onWalkKeyUp, true);
    if (this._onWalkMouseDown && this.renderer) this.renderer.domElement.removeEventListener('pointerdown', this._onWalkMouseDown);
    if (this._onWalkMouseMove) window.removeEventListener('pointermove', this._onWalkMouseMove);
    if (this._onWalkMouseUp)   window.removeEventListener('pointerup', this._onWalkMouseUp);
    this._walkIsMouseDown = false;
  }

  _updateWalkthrough(dt) {
    let moveX = 0;
    let moveZ = 0;
    const forwardX = -Math.sin(this.walkYaw);
    const forwardZ = -Math.cos(this.walkYaw);
    const rightX = Math.cos(this.walkYaw);
    const rightZ = -Math.sin(this.walkYaw);

    if (this.walkKeys.forward)  { moveX += forwardX; moveZ += forwardZ; }
    if (this.walkKeys.backward) { moveX -= forwardX; moveZ -= forwardZ; }
    if (this.walkKeys.left)     { moveX -= rightX;   moveZ -= rightZ;   }
    if (this.walkKeys.right)    { moveX += rightX;   moveZ += rightZ;   }

    const isMoving = (moveX !== 0 || moveZ !== 0);
    if (isMoving) {
      const len = Math.hypot(moveX, moveZ);
      const speed = (this.walkKeys.sprint ? 11.0 : 5.5) * dt;
      moveX = (moveX / len) * speed;
      moveZ = (moveZ / len) * speed;

      this.camera.position.x = Math.max(-82, Math.min(82, this.camera.position.x + moveX));
      this.camera.position.z = Math.max(-82, Math.min(82, this.camera.position.z + moveZ));

      this.walkBobTime += dt * (this.walkKeys.sprint ? 13 : 8.5);
    } else {
      this.walkBobTime = 0;
    }

    const groundY = this.getTerrainElevation(this.camera.position.x, this.camera.position.z);
    const bob = isMoving ? Math.sin(this.walkBobTime) * 0.04 : 0;
    this.camera.position.y = groundY + 1.75 + bob;

    const lookDist = 10;
    const targetX = this.camera.position.x - Math.sin(this.walkYaw) * Math.cos(this.walkPitch) * lookDist;
    const targetY = this.camera.position.y + Math.sin(this.walkPitch) * lookDist;
    const targetZ = this.camera.position.z - Math.cos(this.walkYaw) * Math.cos(this.walkPitch) * lookDist;
    this.camera.lookAt(targetX, targetY, targetZ);
  }

  stopWalkthroughMode() {
    if (!this.isWalkthrough) return;
    this.isWalkthrough = false;
    this._removeWalkthroughListeners();

    if (this.controls) {
      this.controls.enabled = true;
      const dir = new THREE.Vector3();
      this.camera.getWorldDirection(dir);
      this.controls.target.copy(this.camera.position).addScaledVector(dir, 12);
      this.controls.update();
    }
    bus.emit('walkthrough:stopped');
  }

  // ─── Modo 4: Timelapse Solar 24 Horas Acelerado ────────────────────────────────

  startSolarTimelapse(durationMs = 16000) {
    this.stopCinematicTour();
    this.isTimelapseActive = true;
    this.timelapseDuration = durationMs;
    this.timelapseStartTime = performance.now();
    bus.emit('timelapse:started');
  }

  _updateSolarTimelapse() {
    if (!this.isTimelapseActive) return;
    const elapsed = performance.now() - this.timelapseStartTime;
    const progress = (elapsed % this.timelapseDuration) / this.timelapseDuration;

    // Ciclo completo de 24 horas: 05:00 -> 24:00 -> 05:00
    const hour = (5.0 + progress * 24.0) % 24.0;

    this.updateSunPosition(this.dayOfYear, hour);
    this.updateMoonPosition(this.dayOfYear, hour);

    bus.emit('timelapse:tick', { hour, day: this.dayOfYear });
  }

  stopSolarTimelapse() {
    if (!this.isTimelapseActive) return;
    this.isTimelapseActive = false;
    bus.emit('timelapse:stopped');
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
    // Cordillera eliminada a petición del usuario para vista limpia del predio
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
   * Toggles scientific Sentinel-2 NDVI multispectral layer on terrain.
   * @param {boolean} active 
   */
  setNdviMode(active) {
    if (this.terrainMoistureUniforms) {
      BiophysicalTerrainShader.setNdviMode(this.terrainMoistureUniforms, active);
      bus.emit('ui:show_toast', active ? '🛰️ Capa Satelital NDVI (Sentinel-2) Activada' : '🌱 Capa Biofísica de Suelo PBR Activada');
    }
  }

  // ─── Render Loop ──────────────────────────────────────────────────────────────

  animate(time = 0) {
    requestAnimationFrame((t) => this.animate(t));

    // Update Walkthrough or OrbitControls
    if (this.isWalkthrough) {
      this._updateWalkthrough(0.016);
    } else if (this.controls) {
      this.controls.update();
    }

    // Update Solar Timelapse if active
    if (this.isTimelapseActive) {
      this._updateSolarTimelapse();
    }

    // Animate water shimmer & biophysical shader time
    this._animateWater(time);
    if (this.terrainMoistureUniforms) {
      BiophysicalTerrainShader.updateTime(this.terrainMoistureUniforms, 0.016);
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
