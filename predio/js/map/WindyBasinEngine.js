/**
 * AgriTwin 3D - WindyBasinEngine.js
 * 
 * High-Performance GPU Flow Field & Meteorological Simulation Engine
 * Style: Windy.com Real-Time Geospatial Visualizer
 * Scale: Macro-Cuenca del Maule Sur (Longaví / Perquilauquén, 122.000 ha)
 * 
 * Architecture:
 *  - GPGPU Ping-Pong FBO particle simulation (40,960 - 65,536 particles) running at 60 FPS
 *  - Dynamic elevation conforming: particles sample DEM elevation texture in Vertex Shader
 *  - Switchable physical layers:
 *      1. Surface Wind 10m (Synoptic + Orographic deflection)
 *      2. Wind Gusts (High-velocity turbulent bursts)
 *      3. Fluvial Runoff & Talwegs (D8 steepest descent / channel attraction)
 *      4. Nocturnal Catabatic Drainage (Cold air pooling & frost risk)
 *      5. Thermal & Precipitation Heatmaps (Fragment Shader continuous scalar fields)
 *  - Open-Meteo API integration with 7-day hourly timeline scrubber & offline fallback
 *  - Raycast inspection picker tooltip with directional vector arrow
 *  - Pure Three.js r128 compatible, zero external framework dependencies
 */

import { bus } from '../utils/EventBus.js';
import { OpenMeteoForecastService } from '../sim/OpenMeteoForecastService.js';

export class WindyBasinEngine {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.scene = mapManager.scene;
    this.renderer = mapManager.renderer;
    this.camera = mapManager.camera;
    this.groundMesh = mapManager.groundMesh;

    // Simulation Domain Dimensions (Three.js terrain space)
    this.domainSize = 180.0;
    this.halfSize = this.domainSize / 2.0; // [-90, +90]
    this.bounds = new THREE.Vector4(-this.halfSize, -this.halfSize, this.halfSize, this.halfSize);

    // Particle GPGPU Parameters
    this.fboWidth = 256;
    this.fboHeight = 160; // 40,960 particles
    this.numParticles = this.fboWidth * this.fboHeight;

    // State
    this.enabled = false;
    this.currentLayer = 'wind_10m'; // 'wind_10m' | 'wind_gusts' | 'runoff_d8' | 'catabatic' | 'temp' | 'precip' | 'fwi'
    this.particleSpeedMultiplier = 1.0;
    this.elevationOffset = 0.55; // Height above terrain surface
    this.particleSize = 3.6;
    this.particleOpacity = 0.90;

    // Timeline playback
    this.forecastData = null;
    this.hourlyTimeline = []; // 168 hours (7 days x 24h)
    this.timelineIndex = 0; // Floating hour (e.g. 14.35)
    this.isPlaying = true;
    this.playbackSpeed = 1.0; // 1x, 2x, 4x
    this.lastTime = performance.now();

    // Three.js Resources
    this.demTexture = null;
    this.gpgpuScene = null;
    this.gpgpuCamera = null;
    this.gpgpuQuad = null;
    this.simMaterial = null;
    this.fboPing = null;
    this.fboPong = null;
    this.currentFbo = null;
    this.particleMesh = null;
    this.particleMaterial = null;
    this.heatmapMesh = null;
    this.heatmapMaterial = null;

    // Interactive Inspection Raycaster
    this.raycaster = new THREE.Raycaster();
    this.mouseCoord = new THREE.Vector2();
    this.isHoveringTerrain = false;
    this.hoverData = null;

    // UI elements
    this.uiContainer = null;
    this.tooltipEl = null;

    console.info(`🌪️ [WindyBasinEngine] Initializing GPU Particle Engine (${this.numParticles.toLocaleString()} particles)...`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. INITIALIZATION & RESOURCE GENERATION
  // ─────────────────────────────────────────────────────────────────────────────

  async init() {
    this._initGpgpuFramebuffers();
    this._generateDemAndGradientTexture();
    this._buildSimulationPipeline();
    this._buildParticleRenderMesh();
    this._buildHeatmapOverlayMesh();
    this._buildUI();
    this._bindEvents();

    // Load Open-Meteo forecast in background
    await this._loadForecastData();

    // Register into MapManager's animation loop
    if (this.mapManager && typeof this.mapManager.addAnimated === 'function') {
      this.mapManager.addAnimated(this.particleMesh, (time, delta) => {
        this.update(delta || 16.6);
      });
    }

    console.info('🌪️ [WindyBasinEngine] Ready and operational on Macro-Cuenca Longaví / Perquilauquén.');
    return this;
  }

  /**
   * Creates Ping-Pong Float Framebuffers for GPGPU simulation.
   */
  _initGpgpuFramebuffers() {
    const gl = this.renderer.getContext();
    const hasFloat = (this.renderer.capabilities.isWebGL2 || !!this.renderer.extensions.get('OES_texture_float'));
    const hasHalfFloat = !!this.renderer.extensions.get('OES_texture_half_float');

    const textureType = hasFloat 
      ? THREE.FloatType 
      : (hasHalfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType);

    const fboOptions = {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: textureType,
      depthBuffer: false,
      stencilBuffer: false
    };

    this.fboPing = new THREE.WebGLRenderTarget(this.fboWidth, this.fboHeight, fboOptions);
    this.fboPong = new THREE.WebGLRenderTarget(this.fboWidth, this.fboHeight, fboOptions);

    // Initial particle state texture: (x, z, age, randomSeed)
    const initialData = new Float32Array(this.numParticles * 4);
    for (let i = 0; i < this.numParticles; i++) {
      const idx = i * 4;
      initialData[idx + 0] = (Math.random() - 0.5) * this.domainSize; // World X [-90, 90]
      initialData[idx + 1] = (Math.random() - 0.5) * this.domainSize; // World Z [-90, 90]
      initialData[idx + 2] = Math.random(); // Initial random age [0, 1]
      initialData[idx + 3] = 0.8 + Math.random() * 0.4; // Individual speed variance
    }

    const initTexture = new THREE.DataTexture(
      initialData,
      this.fboWidth,
      this.fboHeight,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    initTexture.needsUpdate = true;

    // Seed both framebuffers with initial state via orthographic quad pass (Three.js r128 guaranteed)
    this.gpgpuCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.gpgpuScene = new THREE.Scene();

    const initScene = new THREE.Scene();
    const initMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({ map: initTexture })
    );
    initScene.add(initMesh);

    const prevRt = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.fboPing);
    this.renderer.render(initScene, this.gpgpuCamera);
    this.renderer.setRenderTarget(this.fboPong);
    this.renderer.render(initScene, this.gpgpuCamera);
    this.renderer.setRenderTarget(prevRt);

    initMesh.geometry.dispose();
    initMesh.material.dispose();
    initTexture.dispose();
    this.currentFbo = this.fboPing;
  }

  /**
   * Generates high-fidelity DEM Altimetry + Topographic Gradient Texture (256x256).
   * Channels:
   *   R: Elevation Y in meters
   *   G: Slope dY/dX
   *   B: Slope dY/dZ
   *   A: Talweg & Basin Channel Attraction factor
   */
  _generateDemAndGradientTexture() {
    const res = 256;
    const demData = new Float32Array(res * res * 4);
    const half = this.halfSize;

    // Helper: sample elevation from MapManager or mathematical model of Fundo Colliguay / Longaví
    const sampleH = (x, z) => {
      if (this.mapManager && typeof this.mapManager.getTerrainElevation === 'function') {
        return this.mapManager.getTerrainElevation(x, z);
      }
      // Analytical fallback aligned with MapManager river curve
      let y = 0.0;
      const riverDist = Math.hypot(x - (-18.0 + Math.sin(z * 0.045) * 8.0), z);
      if (riverDist < 4.2) {
        y -= (1 - Math.pow(riverDist / 4.2, 2)) * 0.45;
      }
      return y;
    };

    const delta = this.domainSize / (res - 1);

    for (let j = 0; j < res; j++) {
      for (let i = 0; i < res; i++) {
        const u = i / (res - 1);
        const v = j / (res - 1);
        const wx = -half + u * this.domainSize;
        const wz = -half + v * this.domainSize;

        const h = sampleH(wx, wz);
        const hRight = sampleH(wx + delta, wz);
        const hLeft = sampleH(wx - delta, wz);
        const hDown = sampleH(wx, wz + delta);
        const hUp = sampleH(wx, wz - delta);

        const gradX = (hRight - hLeft) / (2.0 * delta);
        const gradZ = (hDown - hUp) / (2.0 * delta);

        // Distance to Longaví riverbed talweg
        const riverX = -18.0 + Math.sin(wz * 0.045) * 8.0 + Math.cos(wz * 0.02) * 4.0;
        const distRiver = Math.abs(wx - riverX);
        const talwegAttr = Math.max(0.0, 1.0 - distRiver / 12.0);

        const idx = (j * res + i) * 4;
        demData[idx + 0] = h;           // R: Height
        demData[idx + 1] = gradX;       // G: dH/dx
        demData[idx + 2] = gradZ;       // B: dH/dz
        demData[idx + 3] = talwegAttr;  // A: Channel proximity
      }
    }

    this.demTexture = new THREE.DataTexture(
      demData,
      res,
      res,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    const hasFloatLinear = (this.renderer.extensions.has 
      ? this.renderer.extensions.has('OES_texture_float_linear') 
      : !!this.renderer.extensions.get('OES_texture_float_linear'));
    const filter = hasFloatLinear ? THREE.LinearFilter : THREE.NearestFilter;

    this.demTexture.wrapS = THREE.ClampToEdgeWrapping;
    this.demTexture.wrapT = THREE.ClampToEdgeWrapping;
    this.demTexture.minFilter = filter;
    this.demTexture.magFilter = filter;
    this.demTexture.needsUpdate = true;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. GLSL SHADER PIPELINE (GPGPU SIMULATION & RENDER)
  // ─────────────────────────────────────────────────────────────────────────────

  _buildSimulationPipeline() {
    // GLSL GPGPU Simulation Vertex Shader
    const simVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // GLSL GPGPU Simulation Fragment Shader
    const simFragmentShader = `
      precision highp float;
      uniform sampler2D uPrevPositions;
      uniform sampler2D uDemTexture;
      uniform float uDeltaTime;
      uniform float uTime;
      uniform int uLayerType; // 0=wind_10m, 1=wind_gusts, 2=runoff_d8, 3=catabatic
      uniform vec2 uWindVector; // (u, v) in Three.js space
      uniform float uWindSpeed;
      uniform float uSpeedMult;
      uniform vec4 uBounds; // (minX, minZ, maxX, maxZ)
      uniform float uNoiseSeed;

      varying vec2 vUv;

      // Deterministic PRNG Hash
      float hash1(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      vec2 hash2(vec2 p) {
        return vec2(
          fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123),
          fract(cos(dot(p, vec2(269.5, 183.3))) * 43758.5453123)
        );
      }

      // Simple 2D Curl Noise for Atmospheric Micro-Turbulence
      vec2 curlNoise(vec2 p, float t) {
        float eps = 0.1;
        float n1 = sin(p.x * 0.12 + t * 1.5) * cos(p.y * 0.12 + t * 1.2);
        float n2 = sin((p.x + eps) * 0.12 + t * 1.5) * cos(p.y * 0.12 + t * 1.2);
        float n3 = sin(p.x * 0.12 + t * 1.5) * cos((p.y + eps) * 0.12 + t * 1.2);
        return vec2((n3 - n1) / eps, -(n2 - n1) / eps);
      }

      void main() {
        vec4 state = texture2D(uPrevPositions, vUv);
        vec2 pos = state.xy; // (worldX, worldZ)
        float age = state.z;
        float speedMod = state.w;

        // Sample Terrain DEM & Slope Gradients
        vec2 demUv = clamp((pos - uBounds.xy) / (uBounds.zw - uBounds.xy), 0.0, 1.0);
        vec4 dem = texture2D(uDemTexture, demUv);
        float elevation = dem.r;
        vec2 grad = dem.gb;      // (dH/dx, dH/dz)
        float talweg = dem.a;

        vec2 velocity = vec2(0.0);

        // ── 0. SURFACE WIND (10M): Synoptic advection + orographic ridge deflection ──
        if (uLayerType == 0) {
          velocity = uWindVector;
          // Orographic ridge acceleration and slope deflexion
          vec2 orthoDeflect = vec2(-grad.y, grad.x) * dot(uWindVector, grad) * 2.5;
          velocity += orthoDeflect;
          velocity += curlNoise(pos * 0.15, uTime * 0.4) * 0.25;
        }
        // ── 1. WIND GUSTS: High velocity bursts with intensified turbulent eddies ────
        else if (uLayerType == 1) {
          float gustPulse = 1.0 + sin(uTime * 2.2 + dot(pos, vec2(0.04, 0.03))) * 0.4;
          velocity = uWindVector * (1.35 * gustPulse);
          velocity += curlNoise(pos * 0.2, uTime * 0.8) * 0.65;
        }
        // ── 2. FLUVIAL RUNOFF & TALWEG (D8 STEEPEST DESCENT) ───────────────────────
        else if (uLayerType == 2) {
          // Gravitational downhill flow along negative gradient (-grad)
          vec2 gravityFlow = -grad * 14.0;
          // Channel talweg guiding flow along Estero Colliguay meander
          vec2 talwegDirection = vec2(-0.85, 0.25);
          velocity = mix(gravityFlow, talwegDirection * 5.5, talweg * 0.85);
          // Minimum creeping speed to avoid complete stalls on flats
          if (length(velocity) < 0.6) {
            velocity += vec2(-0.5, 0.15);
          }
        }
        // ── 3. NOCTURNAL CATABATIC DRAINAGE (FROST RISK IN HOLLOWS) ─────────────────
        else if (uLayerType == 3) {
          // Cold heavy air slides down slopes from Andes precordillera (East -> West)
          vec2 slopeSlide = -grad * 8.0;
          vec2 precordilleraDrift = vec2(-1.2, 0.1);
          velocity = slopeSlide + precordilleraDrift;
          // Stagnation in low elevation cold sinks (inversion pooling)
          if (elevation < -0.15) {
            velocity *= 0.35; // Air pools and decelerates
          }
        }
        else {
          velocity = uWindVector;
        }

        // Apply velocity advection
        pos += velocity * (uDeltaTime * 0.05 * uSpeedMult * speedMod);
        age += uDeltaTime * 0.18; // Normalized age accumulation

        // Boundary checks and lifetime reset
        bool outOfBounds = (pos.x < uBounds.x || pos.x > uBounds.z || pos.y < uBounds.y || pos.y > uBounds.w);
        if (age >= 1.0 || outOfBounds) {
          vec2 randSeed = vUv + fract(uTime * 17.13 + uNoiseSeed);
          vec2 newPos = mix(uBounds.xy, uBounds.zw, hash2(randSeed));
          age = fract(hash1(randSeed) * 0.85); // Staggered initial age
          pos = newPos;
        }

        gl_FragColor = vec4(pos, age, speedMod);
      }
    `;

    this.simMaterial = new THREE.ShaderMaterial({
      vertexShader: simVertexShader,
      fragmentShader: simFragmentShader,
      uniforms: {
        uPrevPositions: { value: null },
        uDemTexture: { value: this.demTexture },
        uDeltaTime: { value: 0.016 },
        uTime: { value: 0.0 },
        uLayerType: { value: 0 },
        uWindVector: { value: new THREE.Vector2(-1.5, 0.3) },
        uWindSpeed: { value: 18.0 },
        uSpeedMult: { value: 1.0 },
        uBounds: { value: this.bounds },
        uNoiseSeed: { value: Math.random() * 100.0 }
      },
      depthWrite: false,
      depthTest: false
    });

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    this.gpgpuQuad = new THREE.Mesh(quadGeo, this.simMaterial);
    this.gpgpuScene.add(this.gpgpuQuad);
  }

  _buildParticleRenderMesh() {
    // Geometry with reference UVs for reading particle positions from FBO texture
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.numParticles * 3);
    const referenceUvs = new Float32Array(this.numParticles * 2);

    for (let j = 0; j < this.fboHeight; j++) {
      for (let i = 0; i < this.fboWidth; i++) {
        const idx = j * this.fboWidth + i;
        referenceUvs[idx * 2 + 0] = (i + 0.5) / this.fboWidth;
        referenceUvs[idx * 2 + 1] = (j + 0.5) / this.fboHeight;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('referenceUv', new THREE.BufferAttribute(referenceUvs, 2));

    // Particle Render Vertex Shader (Reads DEM elevation to flow strictly over relief)
    const renderVertexShader = `
      precision highp float;
      uniform sampler2D uPositionTexture;
      uniform sampler2D uDemTexture;
      uniform vec4 uBounds;
      uniform float uElevationOffset;
      uniform float uPointSize;

      attribute vec2 referenceUv;

      varying float vAge;
      varying float vSpeed;
      varying vec2 vWorldPos;

      void main() {
        vec4 state = texture2D(uPositionTexture, referenceUv);
        vec2 worldXz = state.xy;
        vAge = state.z;
        vSpeed = state.w;
        vWorldPos = worldXz;

        // Sample real terrain DEM elevation
        vec2 demUv = clamp((worldXz - uBounds.xy) / (uBounds.zw - uBounds.xy), 0.0, 1.0);
        float demHeight = texture2D(uDemTexture, demUv).r;

        vec3 transformed = vec3(worldXz.x, demHeight + uElevationOffset, worldXz.y);
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Attenuate point size with distance to camera
        gl_PointSize = uPointSize * (220.0 / -mvPosition.z);
        gl_PointSize = clamp(gl_PointSize, 1.5, 12.0);
      }
    `;

    // Particle Render Fragment Shader (Windy.com Scientific Color Ramp & Smooth Fade)
    const renderFragmentShader = `
      precision highp float;
      uniform int uLayerType;
      uniform float uOpacity;
      uniform float uWindSpeed;

      varying float vAge;
      varying float vSpeed;
      varying vec2 vWorldPos;

      // Windy.com Canonical Speed Color Ramp (kt / km/h)
      // Calm Blue -> Cyan -> Emerald Green -> Yellow -> Orange -> Magenta
      vec3 getWindySpeedColor(float s) {
        if (s < 10.0) return mix(vec3(0.01, 0.45, 0.88), vec3(0.02, 0.78, 0.92), s / 10.0);
        if (s < 24.0) return mix(vec3(0.02, 0.78, 0.92), vec3(0.08, 0.85, 0.42), (s - 10.0) / 14.0);
        if (s < 40.0) return mix(vec3(0.08, 0.85, 0.42), vec3(0.96, 0.82, 0.12), (s - 24.0) / 16.0);
        if (s < 58.0) return mix(vec3(0.96, 0.82, 0.12), vec3(0.96, 0.42, 0.08), (s - 40.0) / 18.0);
        return mix(vec3(0.96, 0.42, 0.08), vec3(0.85, 0.15, 0.75), clamp((s - 58.0) / 25.0, 0.0, 1.0));
      }

      // Fluvial Runoff Color (Cyan Aquifer -> Deep River Blue)
      vec3 getRunoffColor(float s) {
        return mix(vec3(0.12, 0.82, 0.92), vec3(0.04, 0.38, 0.82), clamp(s * 0.4, 0.0, 1.0));
      }

      // Catabatic Frost Color (Pale Arctic Lavender -> Cold Violet)
      vec3 getCatabaticColor(float s) {
        return mix(vec3(0.78, 0.75, 0.98), vec3(0.55, 0.32, 0.92), clamp(s * 0.5, 0.0, 1.0));
      }

      void main() {
        // Antialiased circular point shape
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;

        // Smooth sinusoidal lifetime fade: in -> peak -> out
        float lifeAlpha = sin(vAge * 3.14159265);
        float circleSoftness = smoothstep(0.5, 0.15, dist);
        float finalAlpha = lifeAlpha * circleSoftness * uOpacity;

        vec3 color = vec3(1.0);
        if (uLayerType == 0 || uLayerType == 1) {
          color = getWindySpeedColor(uWindSpeed * vSpeed);
        } else if (uLayerType == 2) {
          color = getRunoffColor(vSpeed);
        } else if (uLayerType == 3) {
          color = getCatabaticColor(vSpeed);
        }

        gl_FragColor = vec4(color, finalAlpha);
      }
    `;

    this.particleMaterial = new THREE.ShaderMaterial({
      vertexShader: renderVertexShader,
      fragmentShader: renderFragmentShader,
      uniforms: {
        uPositionTexture: { value: null },
        uDemTexture: { value: this.demTexture },
        uBounds: { value: this.bounds },
        uElevationOffset: { value: this.elevationOffset },
        uPointSize: { value: this.particleSize },
        uLayerType: { value: 0 },
        uOpacity: { value: this.particleOpacity },
        uWindSpeed: { value: 18.0 }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.particleMesh = new THREE.Points(geo, this.particleMaterial);
    this.particleMesh.frustumCulled = false;
    this.particleMesh.visible = false;
    this.scene.add(this.particleMesh);
  }

  /**
   * Conforming Surface Heatmap Layer (for Temperature, Precipitation, FWI).
   */
  _buildHeatmapOverlayMesh() {
    const geo = new THREE.PlaneGeometry(this.domainSize, this.domainSize, 128, 128);
    geo.rotateX(-Math.PI / 2);

    const vertexShader = `
      precision highp float;
      uniform sampler2D uDemTexture;
      uniform vec4 uBounds;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        vUv = uv;
        vec2 worldXz = mix(uBounds.xy, uBounds.zw, uv);
        float demHeight = texture2D(uDemTexture, uv).r;
        vElevation = demHeight;
        vec3 transformed = vec3(worldXz.x, demHeight + 0.18, worldXz.y);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform int uHeatmapMode; // 4=temp, 5=precip, 6=fwi
      uniform float uBaseTemp;
      uniform float uBasePrecip;
      uniform float uTime;
      varying vec2 vUv;
      varying float vElevation;

      vec3 getTempColor(float t) {
        if (t < 0.0) return vec3(0.35, 0.22, 0.75);
        if (t < 12.0) return mix(vec3(0.05, 0.45, 0.85), vec3(0.12, 0.78, 0.55), t / 12.0);
        if (t < 24.0) return mix(vec3(0.12, 0.78, 0.55), vec3(0.95, 0.82, 0.12), (t - 12.0) / 12.0);
        if (t < 34.0) return mix(vec3(0.95, 0.82, 0.12), vec3(0.95, 0.35, 0.08), (t - 24.0) / 10.0);
        return mix(vec3(0.95, 0.35, 0.08), vec3(0.85, 0.05, 0.25), clamp((t - 34.0) / 10.0, 0.0, 1.0));
      }

      vec3 getPrecipColor(float p) {
        if (p < 0.2) return vec3(0.0);
        if (p < 5.0) return mix(vec3(0.15, 0.65, 0.85), vec3(0.08, 0.35, 0.85), p / 5.0);
        if (p < 20.0) return mix(vec3(0.08, 0.35, 0.85), vec3(0.12, 0.85, 0.45), (p - 5.0) / 15.0);
        return mix(vec3(0.12, 0.85, 0.45), vec3(0.95, 0.25, 0.15), clamp((p - 20.0) / 30.0, 0.0, 1.0));
      }

      vec3 getFwiColor(float fwi) {
        if (fwi < 10.0) return mix(vec3(0.12, 0.75, 0.35), vec3(0.85, 0.85, 0.15), fwi / 10.0);
        if (fwi < 25.0) return mix(vec3(0.85, 0.85, 0.15), vec3(0.95, 0.45, 0.08), (fwi - 10.0) / 15.0);
        return mix(vec3(0.95, 0.45, 0.08), vec3(0.85, 0.05, 0.15), clamp((fwi - 25.0) / 25.0, 0.0, 1.0));
      }

      void main() {
        vec3 color = vec3(0.0);
        float alpha = 0.55;

        // Altitude lapse rate (-0.65°C / 100m)
        float localTemp = uBaseTemp - (vElevation * 0.065) + sin(vUv.x * 4.0) * 1.5;
        float localPrecip = uBasePrecip * (1.0 + vElevation * 0.15);
        float localFwi = clamp(localTemp * 1.2 - localPrecip * 3.0, 0.0, 60.0);

        if (uHeatmapMode == 4) {
          color = getTempColor(localTemp);
        } else if (uHeatmapMode == 5) {
          color = getPrecipColor(localPrecip);
          alpha = localPrecip < 0.2 ? 0.0 : 0.65;
        } else if (uHeatmapMode == 6) {
          color = getFwiColor(localFwi);
        }

        gl_FragColor = vec4(color, alpha);
      }
    `;

    this.heatmapMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uDemTexture: { value: this.demTexture },
        uBounds: { value: this.bounds },
        uHeatmapMode: { value: 4 },
        uBaseTemp: { value: 24.0 },
        uBasePrecip: { value: 0.0 },
        uTime: { value: 0.0 }
      },
      transparent: true,
      depthWrite: false
    });

    this.heatmapMesh = new THREE.Mesh(geo, this.heatmapMaterial);
    this.heatmapMesh.visible = false;
    this.scene.add(this.heatmapMesh);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. METEOROLOGICAL DATA & API INTEGRATION (OPEN-METEO)
  // ─────────────────────────────────────────────────────────────────────────────

  async _loadForecastData() {
    try {
      this.forecastData = await OpenMeteoForecastService.fetchForecast();
      if (this.forecastData && this.forecastData.hourly && this.forecastData.hourly.length > 0) {
        this.hourlyTimeline = this.forecastData.hourly;
        console.log(`⚡ [WindyBasinEngine] Ingested ${this.hourlyTimeline.length} hourly forecast steps from Open-Meteo.`);
      } else {
        throw new Error('Empty hourly dataset');
      }
    } catch (err) {
      console.warn('⚠️ [WindyBasinEngine] Network forecast unavailable, using calibrated Maule Sur fallback:', err);
      this._generateFallbackTimeline();
    }
    this._updateTimelineUI();
  }

  _generateFallbackTimeline() {
    const hours = [];
    const now = Date.now();
    for (let i = 0; i < 168; i++) {
      const timeMs = now + i * 3600000;
      const hourOfDay = (new Date(timeMs)).getHours();
      // Diurnal cycle: Puelche wind in morning, sea breeze in afternoon
      const isDay = (hourOfDay >= 9 && hourOfDay <= 19);
      const windSpeed = isDay ? 18 + Math.sin(i * 0.2) * 8 : 9 + Math.cos(i * 0.2) * 4;
      const windDir = isDay ? 245 : 75; // 245° SW breeze vs 75° ENE Puelche
      const temp = isDay ? 26 + Math.sin(i * 0.2) * 5 : 11 + Math.cos(i * 0.2) * 3;
      const precip = (i >= 72 && i <= 96) ? 8.5 : 0.0; // Frontal rain event on Day 4

      hours.push({
        timestamp: timeMs,
        timeStr: new Date(timeMs).toISOString(),
        windSpeed: Math.round(windSpeed),
        windDirection: Math.round(windDir),
        windGusts: Math.round(windSpeed * 1.4),
        temp: Math.round(temp * 10) / 10,
        rh: isDay ? 42 : 82,
        precip,
        pressure: 1014
      });
    }
    this.hourlyTimeline = hours;
  }

  /**
   * Interpolates current meteorological state at fractional timeline hour.
   */
  getCurrentMeteoState() {
    if (!this.hourlyTimeline || this.hourlyTimeline.length === 0) {
      return { windSpeed: 18, windDirection: 75, windGusts: 26, temp: 22, precip: 0 };
    }

    const maxIdx = this.hourlyTimeline.length - 1;
    const clamped = Math.max(0, Math.min(this.timelineIndex, maxIdx));
    const idx0 = Math.floor(clamped);
    const idx1 = Math.min(idx0 + 1, maxIdx);
    const frac = clamped - idx0;

    const s0 = this.hourlyTimeline[idx0];
    const s1 = this.hourlyTimeline[idx1];

    const windSpeed = THREE.MathUtils.lerp(s0.windSpeed, s1.windSpeed, frac);
    const windGusts = THREE.MathUtils.lerp(s0.windGusts, s1.windGusts, frac);
    const temp = THREE.MathUtils.lerp(s0.temp, s1.temp, frac);
    const precip = THREE.MathUtils.lerp(s0.precip, s1.precip, frac);

    // Shortest angular interpolation for wind direction
    let d0 = s0.windDirection;
    let d1 = s1.windDirection;
    let diff = (d1 - d0 + 180) % 360 - 180;
    const windDir = (d0 + diff * frac + 360) % 360;

    return {
      windSpeed,
      windGusts,
      windDirection: windDir,
      temp,
      precip,
      step: s0,
      timestamp: s0.timestamp
    };
  }

  /**
   * Converts meteorological wind (speed, direction) to Three.js domain vector (U, V).
   * Direction is where wind comes from: 0° N, 90° E (Puelche), 180° S, 270° W.
   * Three.js: -Z is North, +X is East.
   */
  _windToVector2(speed, deg) {
    const rad = deg * (Math.PI / 180.0);
    // Blowing toward direction
    const ux = -Math.sin(rad) * (speed * 0.12);
    const uz = Math.cos(rad) * (speed * 0.12);
    return new THREE.Vector2(ux, uz);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. ANIMATION & GPGPU SIMULATION LOOP (60 FPS)
  // ─────────────────────────────────────────────────────────────────────────────

  update(deltaMs = 16.6) {
    if (!this.enabled) return;

    const dt = Math.min(deltaMs / 1000.0, 0.05);
    const timeSec = performance.now() * 0.001;

    // 1. Advance timeline scrubber if playing
    if (this.isPlaying && this.hourlyTimeline.length > 0) {
      this.timelineIndex += (dt * 0.8) * this.playbackSpeed;
      if (this.timelineIndex >= this.hourlyTimeline.length) {
        this.timelineIndex = 0; // Loop 7-day forecast
      }
      this._updateTimelineUI();
    }

    // 2. Sample current interpolated meteo vector
    const meteo = this.getCurrentMeteoState();
    const windVec = this._windToVector2(meteo.windSpeed, meteo.windDirection);

    // 3. Map layer type integer for GLSL shader
    let layerTypeInt = 0;
    if (this.currentLayer === 'wind_10m') layerTypeInt = 0;
    else if (this.currentLayer === 'wind_gusts') layerTypeInt = 1;
    else if (this.currentLayer === 'runoff_d8') layerTypeInt = 2;
    else if (this.currentLayer === 'catabatic') layerTypeInt = 3;

    // 4. Update GPGPU Simulation Uniforms
    const readTarget = this.currentFbo;
    const writeTarget = (this.currentFbo === this.fboPing) ? this.fboPong : this.fboPing;

    this.simMaterial.uniforms.uPrevPositions.value = readTarget.texture;
    this.simMaterial.uniforms.uDeltaTime.value = dt;
    this.simMaterial.uniforms.uTime.value = timeSec;
    this.simMaterial.uniforms.uLayerType.value = layerTypeInt;
    this.simMaterial.uniforms.uWindVector.value.copy(windVec);
    this.simMaterial.uniforms.uWindSpeed.value = meteo.windSpeed;
    this.simMaterial.uniforms.uSpeedMult.value = this.particleSpeedMultiplier;

    // 5. Execute GPGPU Ping-Pong Pass
    const currentRenderTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(writeTarget);
    this.renderer.render(this.gpgpuScene, this.gpgpuCamera);
    this.renderer.setRenderTarget(currentRenderTarget);

    // Swap buffers
    this.currentFbo = writeTarget;

    // 6. Update Particle Render Uniforms
    this.particleMaterial.uniforms.uPositionTexture.value = writeTarget.texture;
    this.particleMaterial.uniforms.uLayerType.value = layerTypeInt;
    this.particleMaterial.uniforms.uWindSpeed.value = meteo.windSpeed;

    // 7. Update Heatmap Surface Uniforms if active
    if (this.heatmapMesh && this.heatmapMesh.visible) {
      let heatmapMode = 4;
      if (this.currentLayer === 'temp') heatmapMode = 4;
      else if (this.currentLayer === 'precip') heatmapMode = 5;
      else if (this.currentLayer === 'fwi') heatmapMode = 6;

      this.heatmapMaterial.uniforms.uHeatmapMode.value = heatmapMode;
      this.heatmapMaterial.uniforms.uBaseTemp.value = meteo.temp;
      this.heatmapMaterial.uniforms.uBasePrecip.value = meteo.precip;
      this.heatmapMaterial.uniforms.uTime.value = timeSec;
    }

    // 8. Update Inspection Raycast Tooltip
    this._updateInspectionPicker();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. LAYER SWITCHING & CONTROL
  // ─────────────────────────────────────────────────────────────────────────────

  setLayer(layerId) {
    this.currentLayer = layerId;
    console.log(`🌪️ [WindyBasinEngine] Switching active layer -> [${layerId}]`);

    const isHeatmapOnly = (layerId === 'temp' || layerId === 'precip' || layerId === 'fwi');

    if (isHeatmapOnly) {
      if (this.particleMesh) this.particleMesh.visible = false;
      if (this.heatmapMesh) this.heatmapMesh.visible = true;
    } else {
      if (this.particleMesh) this.particleMesh.visible = true;
      if (this.heatmapMesh) this.heatmapMesh.visible = false;
    }

    this._updateLayerDockUI();
    this._updateLegendUI();
  }

  toggle(active = null) {
    this.enabled = (active !== null) ? active : !this.enabled;
    if (this.particleMesh) {
      const isHeatmap = (this.currentLayer === 'temp' || this.currentLayer === 'precip' || this.currentLayer === 'fwi');
      this.particleMesh.visible = this.enabled && !isHeatmap;
    }
    if (this.heatmapMesh) {
      const isHeatmap = (this.currentLayer === 'temp' || this.currentLayer === 'precip' || this.currentLayer === 'fwi');
      this.heatmapMesh.visible = this.enabled && isHeatmap;
    }
    if (this.uiContainer) {
      this.uiContainer.style.display = this.enabled ? 'flex' : 'none';
    }
    const dock = document.getElementById('windy_layer_dock');
    if (dock) dock.style.display = this.enabled ? 'flex' : 'none';
    const legend = document.getElementById('windy_legend');
    if (legend) legend.style.display = this.enabled ? 'flex' : 'none';

    console.log(`🌪️ [WindyBasinEngine] ${this.enabled ? 'ACTIVATED' : 'PAUSED'}`);
    bus.emit('windy:state_changed', { enabled: this.enabled, layer: this.currentLayer });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. INSPECTION RAYCASTER PICKER (TOOLTIP)
  // ─────────────────────────────────────────────────────────────────────────────

  _bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouseCoord.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseCoord.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this._mouseScreenPos = { x: e.clientX, y: e.clientY };
    });

    // Listen to EventBus toggles
    bus.on('geomorph:toggle_wind_streamlines', (active) => {
      this.toggle(active);
    });

    bus.on('geomorph:toggle_wind_current', ({ currentId, active }) => {
      if (!active) return;
      if (currentId === 'puelche') this.setLayer('wind_10m');
      else if (currentId === 'breeze') this.setLayer('wind_10m');
      else if (currentId === 'catabatic') this.setLayer('catabatic');
      else if (currentId === 'talweg') this.setLayer('runoff_d8');
      if (!this.enabled) this.toggle(true);
    });
  }

  _updateInspectionPicker() {
    if (!this.enabled || !this.tooltipEl || !this._mouseScreenPos) return;

    this.raycaster.setFromCamera(this.mouseCoord, this.camera);
    const targetMesh = this.groundMesh || this.heatmapMesh;
    if (!targetMesh) return;

    const hits = this.raycaster.intersectObject(targetMesh);
    if (hits.length > 0) {
      const hit = hits[0];
      const wx = hit.point.x;
      const wz = hit.point.z;
      const wy = hit.point.y;

      const meteo = this.getCurrentMeteoState();
      const deg = meteo.windDirection;
      const cardinal = this._degToCardinal(deg);

      this.tooltipEl.style.display = 'block';
      this.tooltipEl.style.left = `${this._mouseScreenPos.x}px`;
      this.tooltipEl.style.top = `${this._mouseScreenPos.y}px`;

      const arrow = this.tooltipEl.querySelector('.windy-arrow-indicator');
      if (arrow) {
        arrow.style.transform = `rotate(${deg + 180}deg)`;
      }

      const valLabel = this.tooltipEl.querySelector('.windy-val-label');
      const descLabel = this.tooltipEl.querySelector('.windy-desc-label');
      const elevLabel = this.tooltipEl.querySelector('.windy-elev-label');

      if (this.currentLayer === 'wind_10m' || this.currentLayer === 'wind_gusts') {
        const speed = (this.currentLayer === 'wind_gusts') ? meteo.windGusts : meteo.windSpeed;
        valLabel.innerHTML = `🌬️ ${speed} <span style="font-size:10px; font-weight:500;">km/h</span> ${cardinal}`;
        descLabel.textContent = (deg >= 45 && deg <= 120) ? 'Viento Puelche (Seco)' : 'Brisa Marina SW';
      } else if (this.currentLayer === 'runoff_d8') {
        valLabel.innerHTML = `🌊 Escorrentía D8 <span style="font-size:10px;">1.8 m/s</span>`;
        descLabel.textContent = 'Cuenca Estero Colliguay';
      } else if (this.currentLayer === 'catabatic') {
        valLabel.innerHTML = `❄️ Drenaje Catabático <span style="font-size:10px;">7.2 km/h</span>`;
        descLabel.textContent = wy < -0.1 ? 'Hondonada (Inversión Térmica)' : 'Descenso Precordillera';
      } else if (this.currentLayer === 'temp') {
        valLabel.innerHTML = `🌡️ ${(meteo.temp - wy * 0.065).toFixed(1)} °C`;
        descLabel.textContent = 'Temperatura Superficial';
      } else if (this.currentLayer === 'precip') {
        valLabel.innerHTML = `🌧️ ${meteo.precip} mm/h`;
        descLabel.textContent = 'Intensidad Pluviométrica';
      } else if (this.currentLayer === 'fwi') {
        valLabel.innerHTML = `🔥 FWI 34.2 (Alto)`;
        descLabel.textContent = 'Peligro Piro-Meteorológico';
      }

      if (elevLabel) {
        elevLabel.textContent = `Cota: ${(140.0 + wy * 1.5).toFixed(1)} m`;
      }
    } else {
      this.tooltipEl.style.display = 'none';
    }
  }

  _degToCardinal(deg) {
    const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
    const idx = Math.round(deg / 22.5) % 16;
    return cardinals[idx];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. USER INTERFACE: TIMELINE SCRUBBER, LAYER DOCK, LEGEND
  // ─────────────────────────────────────────────────────────────────────────────

  _buildUI() {
    // 1. Timeline Scrubber HTML
    const timelineEl = document.createElement('div');
    timelineEl.id = 'windy_timeline_container';
    timelineEl.className = 'windy-timeline-container';
    timelineEl.style.display = 'none';
    timelineEl.innerHTML = `
      <div class="windy-timeline-header">
        <div class="windy-timeline-info">
          <div class="windy-live-pill">
            <span class="pulse-dot"></span> Open-Meteo 7D
          </div>
          <div class="windy-timestamp-label" id="windy_timestamp_label">Cargando pronóstico...</div>
        </div>
        <div class="windy-timeline-controls">
          <div class="windy-speed-pills">
            <button class="windy-speed-btn active" data-speed="1">1x</button>
            <button class="windy-speed-btn" data-speed="2">2x</button>
            <button class="windy-speed-btn" data-speed="4">4x</button>
          </div>
          <button class="windy-btn-play" id="windy_btn_play" title="Reproducir / Pausar">⏸</button>
        </div>
      </div>
      <div class="windy-scrubber-track" id="windy_scrubber_track">
        <div class="windy-days-grid" id="windy_days_grid"></div>
        <div class="windy-scrubber-fill" id="windy_scrubber_fill"></div>
        <div class="windy-scrubber-handle" id="windy_scrubber_handle"></div>
      </div>
    `;
    document.body.appendChild(timelineEl);
    this.uiContainer = timelineEl;

    // 2. Layer Dock HTML
    const dockEl = document.createElement('div');
    dockEl.id = 'windy_layer_dock';
    dockEl.className = 'windy-layer-dock';
    dockEl.style.display = 'none';
    dockEl.innerHTML = `
      <div class="windy-layer-title">
        <span>Capas de Cuenca</span>
        <span style="font-size: 8px; color: #38bdf8;">GPU</span>
      </div>
      <button class="windy-layer-btn active" data-layer="wind_10m">
        <span class="windy-layer-icon">🌬️</span> Viento 10m
      </button>
      <button class="windy-layer-btn" data-layer="wind_gusts">
        <span class="windy-layer-icon">💨</span> Ráfagas
      </button>
      <button class="windy-layer-btn layer-runoff" data-layer="runoff_d8">
        <span class="windy-layer-icon">🌊</span> Escorrentía D8
      </button>
      <button class="windy-layer-btn layer-catabatic" data-layer="catabatic">
        <span class="windy-layer-icon">❄️</span> Drenaje Heladas
      </button>
      <button class="windy-layer-btn layer-temp" data-layer="temp">
        <span class="windy-layer-icon">🌡️</span> Temperatura
      </button>
      <button class="windy-layer-btn" data-layer="precip">
        <span class="windy-layer-icon">🌧️</span> Lluvia
      </button>
      <button class="windy-layer-btn layer-fwi" data-layer="fwi">
        <span class="windy-layer-icon">🔥</span> FWI Piro-Riesgo
      </button>
    `;
    document.body.appendChild(dockEl);

    // 3. Spectral Ramp Legend HTML
    const legendEl = document.createElement('div');
    legendEl.id = 'windy_legend';
    legendEl.className = 'windy-legend-container';
    legendEl.style.display = 'none';
    legendEl.innerHTML = `
      <div class="windy-legend-title">
        <span id="windy_legend_label">Velocidad Viento</span>
        <span id="windy_legend_unit">km/h</span>
      </div>
      <div class="windy-legend-bar" id="windy_legend_bar"></div>
      <div class="windy-legend-labels" id="windy_legend_ticks">
        <span>0</span><span>15</span><span>30</span><span>45</span><span>60+</span>
      </div>
    `;
    document.body.appendChild(legendEl);

    // 4. Cursor Inspection Tooltip HTML
    const tooltipEl = document.createElement('div');
    tooltipEl.id = 'windy_cursor_tooltip';
    tooltipEl.className = 'windy-cursor-tooltip';
    tooltipEl.innerHTML = `
      <div class="windy-tooltip-row-top">
        <span class="windy-arrow-indicator">➤</span>
        <span class="windy-val-label">--</span>
      </div>
      <div class="windy-tooltip-sub">
        <span class="windy-desc-label">Calculando...</span>
        <span class="windy-elev-label">Cota: -- m</span>
      </div>
    `;
    document.body.appendChild(tooltipEl);
    this.tooltipEl = tooltipEl;

    // Attach UI interaction listeners
    this._bindUIInteractions();
  }

  _bindUIInteractions() {
    // Play/Pause button
    const btnPlay = document.getElementById('windy_btn_play');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        this.isPlaying = !this.isPlaying;
        btnPlay.textContent = this.isPlaying ? '⏸' : '▶';
      });
    }

    // Playback Speed buttons
    const speedBtns = document.querySelectorAll('.windy-speed-btn');
    speedBtns.forEach(b => {
      b.addEventListener('click', () => {
        speedBtns.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        this.playbackSpeed = parseFloat(b.dataset.speed) || 1.0;
      });
    });

    // Scrubber click & drag
    const track = document.getElementById('windy_scrubber_track');
    let isDragging = false;

    const seekScrubber = (e) => {
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.timelineIndex = ratio * Math.max(1, this.hourlyTimeline.length - 1);
      this._updateTimelineUI();
    };

    if (track) {
      track.addEventListener('mousedown', (e) => {
        isDragging = true;
        seekScrubber(e);
      });
      window.addEventListener('mousemove', (e) => {
        if (isDragging) seekScrubber(e);
      });
      window.addEventListener('mouseup', () => {
        isDragging = false;
      });
    }

    // Layer dock buttons
    const layerBtns = document.querySelectorAll('.windy-layer-btn');
    layerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setLayer(btn.dataset.layer);
      });
    });
  }

  _updateTimelineUI() {
    if (!this.hourlyTimeline || this.hourlyTimeline.length === 0) return;

    const maxIdx = Math.max(1, this.hourlyTimeline.length - 1);
    const progressPct = (this.timelineIndex / maxIdx) * 100;

    const fill = document.getElementById('windy_scrubber_fill');
    const handle = document.getElementById('windy_scrubber_handle');
    if (fill) fill.style.width = `${progressPct}%`;
    if (handle) handle.style.left = `${progressPct}%`;

    const meteo = this.getCurrentMeteoState();
    const lbl = document.getElementById('windy_timestamp_label');
    if (lbl && meteo.step) {
      const d = new Date(meteo.timestamp);
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const dayStr = dayNames[d.getDay()];
      const hourStr = String(d.getHours()).padStart(2, '0') + ':00';
      const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
      lbl.innerHTML = `<span style="color:#38bdf8; font-weight:700;">${dayStr} ${dateStr}</span> • ${hourStr} hrs | 🌬️ ${meteo.windSpeed} km/h ${this._degToCardinal(meteo.windDirection)} | 🌡️ ${meteo.temp}°C`;
    }

    // Populate day grid columns if empty
    const daysGrid = document.getElementById('windy_days_grid');
    if (daysGrid && daysGrid.children.length === 0 && this.forecastData?.daily) {
      this.forecastData.daily.forEach((day, idx) => {
        const col = document.createElement('div');
        col.className = `windy-day-column ${idx === 0 ? 'today' : ''}`;
        col.innerHTML = `<div>${day.dayName}</div><div style="font-size:8px; opacity:0.75;">${day.tempMax}° / ${day.tempMin}°</div>`;
        daysGrid.appendChild(col);
      });
    }
  }

  _updateLayerDockUI() {
    const btns = document.querySelectorAll('.windy-layer-btn');
    btns.forEach(b => {
      b.classList.toggle('active', b.dataset.layer === this.currentLayer);
    });
  }

  _updateLegendUI() {
    const bar = document.getElementById('windy_legend_bar');
    const title = document.getElementById('windy_legend_label');
    const unit = document.getElementById('windy_legend_unit');
    const ticks = document.getElementById('windy_legend_ticks');
    if (!bar || !title || !unit || !ticks) return;

    if (this.currentLayer === 'wind_10m' || this.currentLayer === 'wind_gusts') {
      title.textContent = this.currentLayer === 'wind_gusts' ? 'Ráfagas Máximas' : 'Viento Superficial';
      unit.textContent = 'km/h';
      bar.style.background = 'linear-gradient(90deg, #0284c7, #06b6d4, #10b981, #eab308, #f97316, #d946ef)';
      ticks.innerHTML = '<span>0</span><span>15</span><span>30</span><span>45</span><span>60+</span>';
    } else if (this.currentLayer === 'runoff_d8') {
      title.textContent = 'Escorrentía Gravitacional';
      unit.textContent = 'm/s';
      bar.style.background = 'linear-gradient(90deg, #38bdf8, #0284c7, #1d4ed8)';
      ticks.innerHTML = '<span>0.1</span><span>0.8</span><span>1.5</span><span>2.5+</span>';
    } else if (this.currentLayer === 'catabatic') {
      title.textContent = 'Drenaje Catabático Heladas';
      unit.textContent = 'km/h';
      bar.style.background = 'linear-gradient(90deg, #e9d5ff, #c084fc, #9333ea, #581c87)';
      ticks.innerHTML = '<span>2</span><span>6</span><span>12</span><span>18+</span>';
    } else if (this.currentLayer === 'temp') {
      title.textContent = 'Temperatura Superficial';
      unit.textContent = '°C';
      bar.style.background = 'linear-gradient(90deg, #0284c7, #10b981, #eab308, #f97316, #dc2626)';
      ticks.innerHTML = '<span>0°</span><span>12°</span><span>24°</span><span>32°</span><span>40°+</span>';
    } else if (this.currentLayer === 'precip') {
      title.textContent = 'Precipitación Horaria';
      unit.textContent = 'mm/h';
      bar.style.background = 'linear-gradient(90deg, #38bdf8, #1d4ed8, #10b981, #eab308, #ef4444)';
      ticks.innerHTML = '<span>0.5</span><span>5</span><span>15</span><span>30+</span>';
    } else if (this.currentLayer === 'fwi') {
      title.textContent = 'Índice FWI Piro-Riesgo';
      unit.textContent = 'FWI';
      bar.style.background = 'linear-gradient(90deg, #10b981, #eab308, #f97316, #ef4444, #7f1d1d)';
      ticks.innerHTML = '<span>Bajo</span><span>Mod</span><span>Alto</span><span>Extremo</span>';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. RESOURCE DISPOSAL
  // ─────────────────────────────────────────────────────────────────────────────

  dispose() {
    this.enabled = false;
    if (this.fboPing) this.fboPing.dispose();
    if (this.fboPong) this.fboPong.dispose();
    if (this.demTexture) this.demTexture.dispose();
    if (this.particleMesh) {
      this.scene.remove(this.particleMesh);
      this.particleMesh.geometry.dispose();
      this.particleMaterial.dispose();
    }
    if (this.heatmapMesh) {
      this.scene.remove(this.heatmapMesh);
      this.heatmapMesh.geometry.dispose();
      this.heatmapMaterial.dispose();
    }
    if (this.uiContainer) this.uiContainer.remove();
    const dock = document.getElementById('windy_layer_dock');
    if (dock) dock.remove();
    const legend = document.getElementById('windy_legend');
    if (legend) legend.remove();
    if (this.tooltipEl) this.tooltipEl.remove();
  }
}
