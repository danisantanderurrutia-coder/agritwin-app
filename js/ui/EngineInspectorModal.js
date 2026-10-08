/**
 * AgriTwin 3D - EngineInspectorModal Module
 * Modo Inspección Técnica 3D & Arquitectura Visual (Behind the Scenes)
 * 
 * Permite explorar:
 * - Mapa completo de módulos JS, su función matemática/gráfica y flujo de datos
 * - Laboratorio de parámetros en vivo (sliders de humedad GLSL, surcos PBR, hora solar, bloom, tarjetas)
 * - Visor de código fuente GLSL del shader biofísico y algoritmos
 */

import { bus } from '../utils/EventBus.js';

export class EngineInspectorModal {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.modalEl = null;
    this.activeTab = 'architecture';
  }

  init() {
    this.createModalHtml();
    this.setupEventListeners();
  }

  createModalHtml() {
    let existing = document.getElementById('engineInspectorModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'engineInspectorModal';
    overlay.className = 'modal-overlay glass-modal-backdrop';
    overlay.style.display = 'none';

    overlay.innerHTML = `
      <div class="modal-container glass-panel engine-inspector-container">
        <!-- Header -->
        <div class="modal-header engine-inspector-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 26px; filter: drop-shadow(0 0 10px #a855f7);">🔬</span>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin: 0;">Motor 3D & Arquitectura Gráfica</h3>
                <span style="font-size: 10px; background: rgba(168, 85, 247, 0.25); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.5); padding: 2px 6px; border-radius: 4px; font-family: monospace;">DEV BLUEPRINT</span>
              </div>
              <div style="font-size: 11px; color: #94a3b8;">Inspección interna de módulos JS, shaders GLSL, texturas PBR y configuraciones en vivo</div>
            </div>
          </div>
          <button id="closeEngineInspectorBtn" class="close-btn" aria-label="Cerrar">&times;</button>
        </div>

        <!-- Navigation Tabs -->
        <div class="engine-inspector-tabs">
          <button class="engine-tab-btn active" data-tab="architecture">
            <span>🗺️</span> 1. Arquitectura de Módulos JS
          </button>
          <button class="engine-tab-btn" data-tab="live_lab">
            <span>🎛️</span> 2. Laboratorio en Vivo (Sliders)
          </button>
          <button class="engine-tab-btn" data-tab="glsl_code">
            <span>💻</span> 3. Shader GLSL & Algoritmos
          </button>
        </div>

        <!-- Tab 1: Architecture -->
        <div id="inspectorTab_architecture" class="engine-tab-content active">
          <div class="engine-arch-grid">
            
            <div class="engine-card">
              <div class="engine-card-badge" style="color: #38bdf8; border-color: #38bdf855;">NÚCLEO ESCENA</div>
              <div class="engine-card-title">MapManager.js</div>
              <div class="engine-card-desc">
                Gestiona el <code>Scene Graph</code> de Three.js, cámara ortográfica/perspectiva con <code>OrbitControls</code>, y mapeo geodésico WGS84 de Parral, Maule (-36.14°S, -71.82°O). Configura <code>ACESFilmicToneMapping</code>, niebla atmosférica dinámica <code>FogExp2</code> y el sistema de iluminación solar física con sombras <code>PCFSoftShadowMap</code> (4096×4096).
              </div>
              <div class="engine-card-tags">
                <span>Three.js r128</span><span>PCFSoftShadowMap</span><span>PMREMGenerator IBL</span>
              </div>
            </div>

            <div class="engine-card">
              <div class="engine-card-badge" style="color: #f59e0b; border-color: #f59e0b55;">PBR PROCEDURAL</div>
              <div class="engine-card-title">PBRSoilGenerator.js</div>
              <div class="engine-card-desc">
                Sintetiza en memoria texturas PBR de 1024×1024 píxeles en canvas sin descargar archivos pesados. Genera un <code>NormalMap</code> con surcos de arado periódicos direccionales y micro-terrones orgánicos mediante derivadas de Sobel (∂h/∂x, ∂h/∂y), junto a un <code>RoughnessMap</code> donde las hendiduras retienen humedad.
              </div>
              <div class="engine-card-tags">
                <span>NormalMap Sobel</span><span>RoughnessMap</span><span>RepeatWrapping</span>
              </div>
            </div>

            <div class="engine-card">
              <div class="engine-card-badge" style="color: #10b981; border-color: #10b98155;">SHADERS GLSL</div>
              <div class="engine-card-title">BiophysicalTerrainShader.js</div>
              <div class="engine-card-desc">
                Inyecta código GLSL en <code>MeshStandardMaterial</code> mediante el hook <code>onBeforeCompile</code>. Calcula en cada fragmento la distancia al estero y la humedad global simulada (<code>uGlobalMoisture</code>), interpolando el color entre arcilla seca (#b89065) y humus fértil (#22170f), reduciendo la rugosidad para lograr brillo especular Fresnel de agua en surcos.
              </div>
              <div class="engine-card-tags">
                <span>onBeforeCompile</span><span>Fragment GLSL</span><span>Fresnel Sheen</span>
              </div>
            </div>

            <div class="engine-card">
              <div class="engine-card-badge" style="color: #84cc16; border-color: #84cc1655;">INSTANCING MASIVO</div>
              <div class="engine-card-title">InstancedVegetationManager.js</div>
              <div class="engine-card-desc">
                Implementa la arquitectura <code>THREE.InstancedMesh</code> que permite dibujar más de 3,000 árboles nativos (Quillay, Boldo, Maitén), hileras continuas de viñedos en espaldera y maquinaria agrícola (tractores) en apenas <strong>1 a 3 Draw Calls</strong>, garantizando 60 FPS estables con variación de matrices (escala/rotación) y color NDVI por espécimen.
              </div>
              <div class="engine-card-tags">
                <span>InstancedMesh</span><span>Single Draw Call</span><span>60 FPS</span>
              </div>
            </div>

            <div class="engine-card">
              <div class="engine-card-badge" style="color: #a855f7; border-color: #a855f755;">INTERACCIÓN CIV VI</div>
              <div class="engine-card-title">ParcelManager.js</div>
              <div class="engine-card-desc">
                Extruye las parcelas desde GeoJSON con biselado PBR. Incorpora animación amortiguada elástica en el eje Y (<code>Y-axis hover lerp</code>) al posar el cursor sobre cualquier cuartel, y contorno perimetral resplandeciente (<code>THREE.EdgesGeometry</code>) con respiración emissive dorada/esmeralda.
              </div>
              <div class="engine-card-tags">
                <span>Y-Axis Hover</span><span>EdgesGeometry</span><span>Glowing Outline</span>
              </div>
            </div>

            <div class="engine-card">
              <div class="engine-card-badge" style="color: #f59e0b; border-color: #f59e0b55;">GANADERÍA & BIENESTAR</div>
              <div class="engine-card-title">LivestockManager.js</div>
              <div class="engine-card-desc">
                Pastoreo Racional Voisin (PRV) en 8 potreros rotacionales. Conforma bovinos en el Sur-Oeste, ovinos en el Centro-Oeste, gallinero móvil en el Nor-Este y caballos chilenos sueltos sobre la cota DEM con <code>getTerrainElevation(x, z)</code>. Provee fichas individuales editables (peso, raza, caravana, estado) y herramienta de reubicación interactiva en 3D.
              </div>
              <div class="engine-card-tags">
                <span>PRV Voisin</span><span>1.8 UGM/ha</span><span>Caballos Criollos</span><span>Raycasting 3D</span>
              </div>
            </div>

            <div class="engine-card">
              <div class="engine-card-badge" style="color: #10b981; border-color: #10b98155;">PERMACULTURA & KEYLINE</div>
              <div class="engine-card-title">PermacultureManager.js</div>
              <div class="engine-card-desc">
                Zonificación concéntrica 0 a 5 de Bill Mollison con tubos radiantes y pancartas holográficas adaptadas al relieve 3D. Escala de permanencia Keyline de P.A. Yeomans con surcos de subsolado al 1% de gradiente, conduciendo el escurrimiento gravitacional hacia el tranque acumulador de 18.500 m³.
              </div>
              <div class="engine-card-tags">
                <span>Zonas 0-5 Mollison</span><span>Keyline Yeomans 1%</span><span>Infiltración Gravitacional</span>
              </div>
            </div>

            <div class="engine-card">
              <div class="engine-card-badge" style="color: #ec4899; border-color: #ec489955;">PROYECCIÓN 3D/2D</div>
              <div class="engine-card-title">IoTHtmlOverlayManager.js</div>
              <div class="engine-card-desc">
                Equivalente al componente <code>&lt;Html&gt;</code> de React Three Drei. Proyecta en tiempo real las coordenadas 3D de cada sonda IoT a píxeles de pantalla mediante <code>Vector3.project(camera)</code>, con frustum culling (oculta si queda a espaldas de la cámara), escalado según distancia y mini-dials circulares SVG animados.
              </div>
              <div class="engine-card-tags">
                <span>3D Screen Projection</span><span>Frustum Culling</span><span>SVG Dials</span>
              </div>
            </div>

            <div class="engine-card">
              <div class="engine-card-badge" style="color: #6366f1; border-color: #6366f155;">REACT THREE FIBER</div>
              <div class="engine-card-title">Suite R3F (js/r3f/)</div>
              <div class="engine-card-desc">
                Suite modular completa en React Three Fiber: <code>AgroTwinCanvas.jsx</code>, <code>AtmosphereAndSun.jsx</code>, <code>TerrainPBR.jsx</code>, <code>VegetationInstances.jsx</code>, <code>InteractiveParcels.jsx</code>, <code>IoTSensorNodes.jsx</code> y <code>PostProcessingPipeline.jsx</code> lista para migrar o empaquetar en Vite / Next.js.
              </div>
              <div class="engine-card-tags">
                <span>@react-three/fiber</span><span>@react-three/drei</span><span>PostProcessing</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Tab 2: Live Lab -->
        <div id="inspectorTab_live_lab" class="engine-tab-content">
          <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 12px; color: #e2e8f0;">
            ⚡ <strong>Laboratorio en Vivo:</strong> Modifica estos controles para ver instantáneamente cómo la escena 3D de Three.js y los shaders GLSL responden en tiempo real.
          </div>

          <div class="engine-controls-grid">
            
            <!-- Soil Moisture Slider -->
            <div class="engine-ctrl-box">
              <div class="engine-ctrl-header">
                <span>🌱 Humedad del Suelo (Shader GLSL uGlobalMoisture)</span>
                <span id="valInspMoisture" class="engine-ctrl-val">38%</span>
              </div>
              <input type="range" id="sliderInspMoisture" min="0" max="100" value="38" class="engine-slider" />
              <div class="engine-ctrl-sub">0% = Arcilla paja seca / 100% = Humus negro saturado con brillo especular</div>
            </div>

            <!-- Furrow Normal Scale Slider -->
            <div class="engine-ctrl-box">
              <div class="engine-ctrl-header">
                <span>🚜 Intensidad de Surcos de Arado (PBR NormalScale)</span>
                <span id="valInspFurrow" class="engine-ctrl-val">1.6x</span>
              </div>
              <input type="range" id="sliderInspFurrow" min="0" max="40" value="16" class="engine-slider" />
              <div class="engine-ctrl-sub">Modula la profundidad óptica de las ondulaciones de arado sin polígonos extra</div>
            </div>

            <!-- Sun Hour Slider -->
            <div class="engine-ctrl-box">
              <div class="engine-ctrl-header">
                <span>☀️ Hora Solar & Sombras Alargadas (Golden Hour)</span>
                <span id="valInspSunHour" class="engine-ctrl-val">17:30</span>
              </div>
              <input type="range" id="sliderInspSunHour" min="6" max="20" step="0.5" value="17.5" class="engine-slider" />
              <div class="engine-ctrl-sub">Mueve el sol en su arco físico para proyectar sombras alargadas al atardecer</div>
            </div>

            <!-- IoT Cards Mode -->
            <div class="engine-ctrl-box">
              <div class="engine-ctrl-header">
                <span>🏷️ Modo de Tarjetas 3D de Sensores</span>
                <span id="valInspCardsMode" class="engine-ctrl-val" style="color: #34d399;">Hover (Limpio)</span>
              </div>
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <button id="btnModeHoverInsp" class="btn-ctrl-mode active" data-mode="hover">Hover (Limpio)</button>
                <button id="btnModeAllInsp" class="btn-ctrl-mode" data-mode="all">Mostrar Todas</button>
                <button id="btnModeNoneInsp" class="btn-ctrl-mode" data-mode="none">Ocultar</button>
              </div>
              <div class="engine-ctrl-sub">Controla si las 15 tarjetas se ven todas juntas, solo al posar el cursor o ninguna</div>
            </div>

            <!-- Relief Exaggeration Slider -->
            <div class="engine-ctrl-box">
              <div class="engine-ctrl-header">
                <span>⛰️ Exageración Topográfica (DEM Relief Scale)</span>
                <span id="valInspRelief" class="engine-ctrl-val">1.0x</span>
              </div>
              <input type="range" id="sliderInspRelief" min="2" max="30" value="10" class="engine-slider" />
              <div class="engine-ctrl-sub">Multiplica la altura de los vértices de terreno y recalcula normales</div>
            </div>

            <!-- PostProcessing Bloom Toggle -->
            <div class="engine-ctrl-box">
              <div class="engine-ctrl-header">
                <span>✨ Post-Procesamiento UnrealBloomPass</span>
                <span id="valInspBloom" class="engine-ctrl-val" style="color: #38bdf8;">Activo (0.42)</span>
              </div>
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <button id="btnBloomToggleInsp" class="btn-ctrl-mode active">Alternar Bloom</button>
              </div>
              <div class="engine-ctrl-sub">Realza destellos especulares del agua y leds IoT en la escena</div>
            </div>

          </div>
        </div>

        <!-- Tab 3: GLSL Code -->
        <div id="inspectorTab_glsl_code" class="engine-tab-content">
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
            Código GLSL inyectado en el Fragment Shader de Three.js para el cálculo de humedad biofísica:
          </div>
          <pre class="engine-code-block"><code>// BiophysicalTerrainShader.js - Fragment Shader Injection
uniform float uGlobalMoisture;
uniform vec3 uDrySoilColor;   // vec3(0.72, 0.56, 0.40) - Arcilla seca
uniform vec3 uWetSoilColor;   // vec3(0.13, 0.09, 0.06) - Humus profundo
uniform vec3 uLushGreenColor; // vec3(0.08, 0.33, 0.18) - Clorofila
varying vec3 vTerrainWorldPos;

void main() {
  // Proximidad al meandro fluvial del estero
  float riverCapillary = calculateRiverProximity(vTerrainWorldPos);
  
  // Humedad local efectiva: global + recarga del estero + riego
  float localMoisture = clamp(uGlobalMoisture + riverCapillary * 0.45, 0.0, 1.0);

  // Transición no lineal Suelo Seco -> Humus Húmedo
  vec3 moistureSoil = mix(uDrySoilColor, uWetSoilColor, smoothstep(0.1, 0.7, localMoisture));

  // Aparición de micro-flora / vigor vegetativo
  float greening = smoothstep(0.45, 0.95, localMoisture) * 0.65;
  vec3 bioColor = mix(moistureSoil, uLushGreenColor, greening);

  diffuseColor.rgb = mix(diffuseColor.rgb, bioColor, 0.65);

  // Atenuación de rugosidad PBR (brillo especular Fresnel de agua en surcos)
  float wetness = clamp(uGlobalMoisture * 0.6 + riverCapillary * 0.4, 0.0, 0.9);
  roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.45, wetness);
}</code></pre>
        </div>

        <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px; font-size: 11px; color: #64748b;">
          <span>💡 Consejo: Presiona <kbd style="background: #1e293b; color: #cbd5e1; padding: 2px 5px; border-radius: 4px;">Shift + D</kbd> o <kbd style="background: #1e293b; color: #cbd5e1; padding: 2px 5px; border-radius: 4px;">I</kbd> en cualquier momento para abrir/cerrar este panel.</span>
          <button id="btnCloseInspFooterBtn" class="btn-primary" style="padding: 6px 14px; font-size: 11px;">Cerrar Inspector</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.modalEl = overlay;
  }

  setupEventListeners() {
    if (!this.modalEl) return;

    // Close buttons
    const closeBtn = document.getElementById('closeEngineInspectorBtn');
    const closeFooterBtn = document.getElementById('btnCloseInspFooterBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.hide());
    if (closeFooterBtn) closeFooterBtn.addEventListener('click', () => this.hide());

    // Click outside to close
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.hide();
    });

    // Keyboard shortcut (Shift+D or I)
    window.addEventListener('keydown', (e) => {
      if ((e.shiftKey && e.key.toLowerCase() === 'd') || (e.key.toLowerCase() === 'i' && !e.target.matches('input, textarea'))) {
        this.toggle();
      }
      if (e.key === 'Escape' && this.isOpen()) {
        this.hide();
      }
    });

    // Tab switching
    const tabBtns = this.modalEl.querySelectorAll('.engine-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tabKey = btn.getAttribute('data-tab');
        const contents = this.modalEl.querySelectorAll('.engine-tab-content');
        contents.forEach(c => c.classList.remove('active'));

        const target = document.getElementById(`inspectorTab_${tabKey}`);
        if (target) target.classList.add('active');
      });
    });

    // ─── Live Lab Controls ───────────────────────────────────────────────────

    // 1. Soil Moisture Slider
    const moistureSlider = document.getElementById('sliderInspMoisture');
    const moistureVal = document.getElementById('valInspMoisture');
    if (moistureSlider && moistureVal) {
      moistureSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        moistureVal.textContent = `${val}%`;
        bus.emit('telemetry:moisture_updated', val);
      });
    }

    // 2. Furrow Normal Scale Slider
    const furrowSlider = document.getElementById('sliderInspFurrow');
    const furrowVal = document.getElementById('valInspFurrow');
    if (furrowSlider && furrowVal) {
      furrowSlider.addEventListener('input', (e) => {
        const scale = parseFloat(e.target.value) / 10;
        furrowVal.textContent = `${scale.toFixed(1)}x`;
        if (this.mapManager.groundCiv6Mat && this.mapManager.groundCiv6Mat.normalScale) {
          this.mapManager.groundCiv6Mat.normalScale.set(scale, scale);
        }
      });
    }

    // 3. Solar Hour Slider
    const sunSlider = document.getElementById('sliderInspSunHour');
    const sunVal = document.getElementById('valInspSunHour');
    if (sunSlider && sunVal) {
      sunSlider.addEventListener('input', (e) => {
        const hour = parseFloat(e.target.value);
        const hh = Math.floor(hour);
        const mm = (hour % 1) === 0.5 ? '30' : '00';
        sunVal.textContent = `${hh < 10 ? '0' : ''}${hh}:${mm}`;
        bus.emit('map:update_sun', { day: 172, hour });
      });
    }

    // 4. Sensor Cards Mode
    const btnHover = document.getElementById('btnModeHoverInsp');
    const btnAll = document.getElementById('btnModeAllInsp');
    const btnNone = document.getElementById('btnModeNoneInsp');
    const cardsVal = document.getElementById('valInspCardsMode');

    const setMode = (mode, label, color) => {
      [btnHover, btnAll, btnNone].forEach(b => b && b.classList.remove('active'));
      if (cardsVal) {
        cardsVal.textContent = label;
        cardsVal.style.color = color;
      }
      bus.emit('sensor_cards:set_mode', mode);
    };

    if (btnHover) btnHover.addEventListener('click', () => {
      btnHover.classList.add('active');
      setMode('hover', 'Hover (Limpio)', '#34d399');
    });
    if (btnAll) btnAll.addEventListener('click', () => {
      btnAll.classList.add('active');
      setMode('all', 'Mostrar Todas', '#38bdf8');
    });
    if (btnNone) btnNone.addEventListener('click', () => {
      btnNone.classList.add('active');
      setMode('none', 'Ocultas', '#ef4444');
    });

    // 5. Relief Scale Slider
    const reliefSlider = document.getElementById('sliderInspRelief');
    const reliefVal = document.getElementById('valInspRelief');
    if (reliefSlider && reliefVal) {
      reliefSlider.addEventListener('input', (e) => {
        const scale = parseFloat(e.target.value) / 10;
        reliefVal.textContent = `${scale.toFixed(1)}x`;
        bus.emit('map:set_relief_scale', scale);
      });
    }

    // 6. PostProcessing Bloom Toggle
    const btnBloom = document.getElementById('btnBloomToggleInsp');
    const bloomVal = document.getElementById('valInspBloom');
    let bloomActive = true;
    if (btnBloom && bloomVal) {
      btnBloom.addEventListener('click', () => {
        bloomActive = !bloomActive;
        btnBloom.classList.toggle('active', bloomActive);
        bloomVal.textContent = bloomActive ? 'Activo (0.42)' : 'Desactivado';
        bloomVal.style.color = bloomActive ? '#38bdf8' : '#94a3b8';
        if (this.mapManager.composer && this.mapManager.composer.passes[1]) {
          this.mapManager.composer.passes[1].enabled = bloomActive;
        }
      });
    }

    // Header Trigger Button
    const headerBtn = document.getElementById('btnEngineInspectorModal');
    if (headerBtn) headerBtn.addEventListener('click', () => this.show());

    // Logo Family Badge Trigger
    const logoBadge = document.querySelector('.brand-family-badge');
    if (logoBadge) {
      logoBadge.style.cursor = 'pointer';
      logoBadge.setAttribute('title', 'Clic para abrir el Modo Inspección Técnica 3D');
      logoBadge.addEventListener('click', () => this.show());
    }
  }

  show() {
    if (this.modalEl) this.modalEl.style.display = 'flex';
  }

  hide() {
    if (this.modalEl) this.modalEl.style.display = 'none';
  }

  toggle() {
    if (this.isOpen()) this.hide();
    else this.show();
  }

  isOpen() {
    return this.modalEl && this.modalEl.style.display === 'flex';
  }
}
