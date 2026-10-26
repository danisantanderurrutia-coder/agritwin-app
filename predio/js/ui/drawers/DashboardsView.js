/**
 * AgriTwin - Dashboards View Module
 * 
 * Gestiona la presentación de los tableros especializados:
 *  - Studio Dashboard (Laboratorio científico de cuenca & sandbox)
 *  - Enterprise Dashboard (Monitoreo agroindustrial)
 *  - Territorial Dashboard (Malla hexagonal Catan & cuenca vecinal)
 *  - ESG Dashboard (Balance de carbono, EUDR & pasaporte verde)
 *  - Creator / Welcome Dashboard (Visión, arquitectura y guía rápida)
 */

export class DashboardsView {
  constructor(uiController) {
    this.ui = uiController;
  }

  renderStudioDashboard() {
    this.ui.currentSelectedEntityId = 'studio_dashboard';
    this.ui.drawerTitle.textContent = '🛠️ Modo Estudio / Maestro';
    this.ui.drawerSubtitle.textContent = 'Laboratorio de Riesgos a Escala Cuenca & Sandbox';

    this.ui.drawerBody.innerHTML = `
      <div class="glass-card" style="border-left: 4px solid var(--accent-purple); padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-family: monospace; color: #c084fc; font-weight: 700;">[LABORATORIO CIENTÍFICO DE CUENCA]</span>
          <span style="font-size: 10px; color: var(--text-muted);">Cuenca Río Perquilauquén - Andes</span>
        </div>
        <div style="font-size: 15px; font-weight: 800; color: #fff; margin-top: 4px;">Modelación de Riesgos Territoriales</div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="metrics-grid" style="margin-top: 10px;">
        <div class="glass-card metric-card">
          <div class="metric-label">Escala Territorial</div>
          <div class="metric-value" style="color: var(--accent-purple);">Cuenca<span class="metric-unit">Andina</span></div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Nevados de Longaví a Parral</div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-label">Satélites Activos</div>
          <div class="metric-value" style="color: var(--accent-cyan);">S2+ERA5<span class="metric-unit">MSI</span></div>
          <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">10m píxel / NBR / NDII</div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-label">Motor Hidráulico</div>
          <div class="metric-value" style="color: var(--accent-emerald);">2D<span class="metric-unit">Saint-Venant</span></div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Tirantes & Cota Desborde</div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-label">Piro-Riesgo FWI</div>
          <div class="metric-value" style="color: var(--accent-amber);">30-30-30<span class="metric-unit">Viento</span></div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Puelche / Raco E-NE</div>
        </div>
      </div>

      <!-- TABS TÁCTICAS DE CUENCA: TIEMPO / CAPAS SIG / RIESGO -->
      <div class="tabs-header" style="display: flex; gap: 4px; margin-top: 12px; margin-bottom: 12px; background: rgba(15, 23, 42, 0.7); padding: 4px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1);">
        <button id="tabBtnCuencaTiempo" class="tab-btn active" style="flex: 1; padding: 8px 4px; font-size: 11px; font-weight: 700; border-radius: 8px; justify-content: center; gap: 4px;">
          <span>⏱️</span> Tiempo
        </button>
        <button id="tabBtnCuencaSig" class="tab-btn" style="flex: 1; padding: 8px 4px; font-size: 11px; font-weight: 700; border-radius: 8px; justify-content: center; gap: 4px;">
          <span>🗺️</span> Capas SIG
        </button>
        <button id="tabBtnCuencaRiesgo" class="tab-btn" style="flex: 1; padding: 8px 4px; font-size: 11px; font-weight: 700; border-radius: 8px; justify-content: center; gap: 4px;">
          <span>⚠️</span> Riesgo
        </button>
      </div>

      <!-- ========================================== -->
      <!-- PESTAÑA 1: TIEMPO (WINDY LIVE ENGINE)       -->
      <!-- ========================================== -->
      <div id="panelCuencaTiempo" class="cuenca-tab-panel">
        <!-- Capas Meteorológicas e Hidrodinámicas -->
        <div class="glass-card" style="border-color: rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.05); margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="metric-label" style="color: #38bdf8; font-weight: 800;">🍃 CAPAS METEOROLÓGICAS (WINDY LIVE)</div>
            <span style="font-size: 9px; font-family: monospace; color: #7dd3fc;">GPU GPGPU</span>
          </div>
          
          <div class="windy-chip-grid">
            <button class="windy-chip-btn active" data-layer="wind_10m">
              <span>🌬️</span> Viento 10m
            </button>
            <button class="windy-chip-btn" data-layer="wind_gusts">
              <span>💨</span> Ráfagas
            </button>
            <button class="windy-chip-btn" data-layer="precip">
              <span>🌧️</span> Lluvia
            </button>
            <button class="windy-chip-btn" data-layer="temp">
              <span>🌡️</span> Temperatura
            </button>
            <button class="windy-chip-btn" data-layer="clouds">
              <span>☁️</span> Nubes
            </button>
            <button class="windy-chip-btn" data-layer="pressure">
              <span>🌀</span> Presión & Isóbaras
            </button>
          </div>
        </div>

        <!-- Slider de Altitud (Windy Altitude con ✈️) -->
        <div class="windy-altitude-box">
          <div class="windy-altitude-header">
            <span>✈️ ALTITUD DE SIMULACIÓN</span>
            <span id="labelCuencaAltitudeVal" class="windy-altitude-val">Superficie (10m) ✈️</span>
          </div>
          <input type="range" id="sliderCuencaAltitude" min="0" max="4" step="1" value="0" class="windy-altitude-range">
          <div class="windy-altitude-ticks">
            <span>10m ✈️</span>
            <span>100m</span>
            <span>500m</span>
            <span>1.500m</span>
            <span>3.000m</span>
          </div>
        </div>

        <!-- Selector de Modelo Numérico -->
        <div class="windy-model-box">
          <span style="font-size: 10px; font-weight: 700; color: #cbd5e1;">🌐 Modelo de Pronóstico:</span>
          <div class="windy-model-chips">
            <button id="btnModelEcmwf" class="windy-model-chip active" data-model="ecmwf">ECMWF 9km</button>
            <button id="btnModelGfs" class="windy-model-chip" data-model="gfs">GFS 22km</button>
          </div>
        </div>

        <!-- Ajustes Finos de Flujo GPU -->
        <div class="glass-card" style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 10px; font-weight: 700; color: #38bdf8;">🎛️ PARTÍCULAS Y VELOCIDAD GPU</span>
            <span style="font-size: 9px; color: var(--text-muted);">40.960 partículas</span>
          </div>
          
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 9.5px; color: #cbd5e1; margin-bottom: 2px;">
              <span>Velocidad de Flujo:</span>
              <strong id="labelWindySpeedMult" style="color: #facc15; font-family: monospace;">1.0x</strong>
            </div>
            <input type="range" id="sliderWindySpeedMult" min="0.2" max="3.0" step="0.2" value="1.0" style="width: 100%; accent-color: #facc15; cursor: pointer;">
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 9.5px; color: #cbd5e1; margin-bottom: 2px;">
              <span>Opacidad de Fondo / Streamlines:</span>
              <strong id="labelWindyOpacity" style="color: #38bdf8; font-family: monospace;">85%</strong>
            </div>
            <input type="range" id="sliderWindyOpacity" min="20" max="100" step="5" value="85" style="width: 100%; accent-color: #0284c7; cursor: pointer;">
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- PESTAÑA 2: CAPAS SIG                       -->
      <!-- ========================================== -->
      <div id="panelCuencaSig" class="cuenca-tab-panel" style="display: none;">
        <!-- TELEDETECCIÓN MULTIESPECTRAL & TOPOGRAFÍA DEM -->
        <div class="glass-card" style="margin-top: 4px; border-color: rgba(6, 182, 212, 0.4); background: rgba(6, 182, 212, 0.06);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="metric-label" style="color: #38bdf8; font-weight: 700;">🛰️ TELEDETECCIÓN & MODELO DIGITAL DE TERRENO (DEM)</div>
            <span style="font-size: 9px; color: #7dd3fc; font-family: monospace;">SENTINEL-2 / DEM</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button id="btnStudioSpectralNdvi" class="btn-tool" style="justify-content: center; font-size: 11px; padding: 7px 6px;">
              <span>🌱 NDVI (Vigor)</span>
            </button>
            <button id="btnStudioSpectralDem" class="btn-tool" style="justify-content: center; font-size: 11px; padding: 7px 6px;">
              <span>🏔️ DEM (Curvas)</span>
            </button>
            <button id="btnStudioSpectralNdwi" class="btn-tool" style="justify-content: center; font-size: 11px; padding: 7px 6px;">
              <span>💧 NDWI (Humedad)</span>
            </button>
            <button id="btnStudioSpectralNbr" class="btn-tool" style="justify-content: center; font-size: 11px; padding: 7px 6px;">
              <span>🔥 NBR (Biomasa)</span>
            </button>
          </div>
        </div>

        <!-- FLUJOS ESTRATIGRÁFICOS & GEOMÓRFICOS -->
        <div class="glass-card" style="margin-top: 10px; border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.06);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="metric-label" style="color: #34d399; font-weight: 700;">📐 FLUJOS GEOMÓRFICOS & ESTRATIGRAFÍA (3D)</div>
            <span style="font-size: 9px; color: #6ee7b7; font-family: monospace;">TARBUCK / D8</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <button id="btnStudioGeoWaterFlow" class="btn-tool" style="justify-content: flex-start; padding: 8px 10px;">
              <span>🌊</span>
              <div style="text-align: left; margin-left: 6px;">
                <div style="font-weight: 700; color: #38bdf8; font-size: 11px;">Flechas de Flujo Hidráulico (D8 Talwegs)</div>
                <div style="font-size: 9px; color: var(--text-muted);">Vectores de máxima pendiente hacia el estero</div>
              </div>
            </button>
            <button id="btnStudioGeoWindyStream" class="btn-tool" style="justify-content: flex-start; padding: 8px 10px;">
              <span>🌪️</span>
              <div style="text-align: left; margin-left: 6px;">
                <div style="font-weight: 700; color: #fbbf24; font-size: 11px;">Campo de Viento Animado (Maestro)</div>
                <div style="font-size: 9px; color: var(--text-muted);">Todas las corrientes orográficas 3D</div>
              </div>
            </button>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding-left: 10px;">
              <button id="btnStudioWindPuelche" class="btn-tool active" style="font-size: 9px; padding: 5px 6px; justify-content: flex-start;">
                <span>🔴</span> Puelche E-NE
              </button>
              <button id="btnStudioWindBreeze" class="btn-tool active" style="font-size: 9px; padding: 5px 6px; justify-content: flex-start;">
                <span>🔵</span> Brisa SW
              </button>
              <button id="btnStudioWindCatabatic" class="btn-tool active" style="font-size: 9px; padding: 5px 6px; justify-content: flex-start;">
                <span>🟣</span> Catabático (Helada)
              </button>
              <button id="btnStudioWindTalweg" class="btn-tool active" style="font-size: 9px; padding: 5px 6px; justify-content: flex-start;">
                <span>🟢</span> Chorro Quebrada
              </button>
            </div>

            <button id="btnStudioGeoHazardZones" class="btn-tool" style="justify-content: flex-start; padding: 8px 10px;">
              <span>📐</span>
              <div style="text-align: left; margin-left: 6px;">
                <div style="font-weight: 700; color: #f472b6; font-size: 11px;">Zonas Delimitadas de Inundación & Fuego</div>
                <div style="font-size: 9px; color: var(--text-muted);">Envolventes T=10, T=100 y sector piro-riesgo</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Acciones de Estudio Espaciales -->
        <div class="glass-card" style="margin-top: 10px;">
          <div class="metric-label">🛠️ Herramientas Espaciales del Gemelo 3D</div>
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
            <button id="btnQuickDrawFromStudio" class="btn-tool" style="width: 100%; justify-content: center;">
              <span>🎨 Abrir Pincel Vectorial 3D</span>
            </button>
            <button id="btnQuickSculptFromStudio" class="btn-tool" style="width: 100%; justify-content: center;">
              <span>⛰️ Esculpir Terreno (Hacedor de Relieve DEM)</span>
            </button>
            <button id="btnQuickCatalogFromStudio" class="btn-tool" style="width: 100%; justify-content: center;">
              <span>ℹ️ Ver Catálogo Botánico de 35 Ítems</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- PESTAÑA 3: RIESGO CLIMÁTICO                 -->
      <!-- ========================================== -->
      <div id="panelCuencaRiesgo" class="cuenca-tab-panel" style="display: none;">
        <!-- CONSEJO CIENTÍFICO DE CUENCA -->
        <div class="glass-card" style="margin-top: 4px; border-color: rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.05);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div class="metric-label" style="color: #38bdf8; font-weight: 800; font-size: 11px;">
              🎓 CONSEJO CIENTÍFICO DE CUENCA (3 ASESORES)
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <a target="_top" href="http://localhost:7777/#cerro" style="text-decoration: none; font-size: 9px; font-family: monospace; color: #7dd3fc; background: rgba(14,165,233,0.2); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(14,165,233,0.3);" title="Abrir Consejo en Modo Cumbre">
                122.070 ha • Ver Fichas ↗
              </a>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <!-- Asesor 1: Dr. Fernando Albornoz -->
            <div style="display: flex; gap: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(56, 189, 248, 0.2); border-left: 3px solid #0284c7; padding: 8px 10px; border-radius: 8px;">
              <img src="assets/advisors/avatar_cuenca_fernando.jpg" alt="Dr. Fernando Albornoz" style="width: 42px; height: 42px; border-radius: 8px; object-fit: cover; border: 1px solid #38bdf8; flex-shrink: 0;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2242%22 height=%2242%22><rect width=%2242%22 height=%2242%22 fill=%22%230284c7%22/><text x=%2250%%22 y=%2255%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2220%22>🗺️</text></svg>'">
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong style="color: #7dd3fc; font-size: 11px;">Dr. Fernando Albornoz</strong>
                  <span style="font-size: 8px; font-family: monospace; color: #38bdf8;">HEC-RAS • TWI • D8</span>
                </div>
                <div style="font-size: 9.5px; color: #cbd5e1; font-weight: 600;">Geógrafo & Geomorfólogo de Cuencas</div>
                <div style="font-size: 9px; color: var(--text-muted); margin-top: 2px; line-height: 1.35;">
                  <em>"Los tranques Keyline en cota media retienen 4.2% del pico de crecida T=100."</em>
                </div>
                <div style="display: flex; gap: 6px; margin-top: 4px;">
                  <button id="btnAdvisorAlbornozTrigger" class="btn-tool" style="padding: 3px 8px; font-size: 9px; background: rgba(2, 132, 199, 0.2); border-color: rgba(56, 189, 248, 0.4); color: #7dd3fc;">
                    🌊 Activar Hidrograma & D8
                  </button>
                </div>
              </div>
            </div>

            <!-- Asesora 2: Dra. Natalia Oyarzún -->
            <div style="display: flex; gap: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(245, 158, 11, 0.2); border-left: 3px solid #f59e0b; padding: 8px 10px; border-radius: 8px;">
              <img src="assets/advisors/avatar_cuenca_natalia.jpg" alt="Dra. Natalia Oyarzún" style="width: 42px; height: 42px; border-radius: 8px; object-fit: cover; border: 1px solid #fbbf24; flex-shrink: 0;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2242%22 height=%2242%22><rect width=%2242%22 height=%2242%22 fill=%22%23f59e0b%22/><text x=%2250%%22 y=%2255%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2220%22>🌤️</text></svg>'">
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong style="color: #fde047; font-size: 11px;">Dra. Natalia Oyarzún</strong>
                  <span style="font-size: 8px; font-family: monospace; color: #fbbf24;">FWI 48 • PUELCHE</span>
                </div>
                <div style="font-size: 9.5px; color: #cbd5e1; font-weight: 600;">Meteoróloga & Piro-Climatóloga</div>
                <div style="font-size: 9px; color: var(--text-muted); margin-top: 2px; line-height: 1.35;">
                  <em>"El viento catabático baja por Bullileo y seca el pasto a 8% en 4 horas."</em>
                </div>
                <div style="display: flex; gap: 6px; margin-top: 4px;">
                  <button id="btnAdvisorOyarzunTrigger" class="btn-tool" style="padding: 3px 8px; font-size: 9px; background: rgba(245, 158, 11, 0.2); border-color: rgba(245, 158, 11, 0.4); color: #fde047;">
                    🌪️ Proyectar Viento Windy & FWI
                  </button>
                </div>
              </div>
            </div>

            <!-- Asesor 3: Dr. Marcelo Lagos Riquelme -->
            <div style="display: flex; gap: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(16, 185, 129, 0.2); border-left: 3px solid #10b981; padding: 8px 10px; border-radius: 8px;">
              <img src="assets/advisors/avatar_cuenca_marcelo.jpg" alt="Dr. Marcelo Lagos Riquelme" style="width: 42px; height: 42px; border-radius: 8px; object-fit: cover; border: 1px solid #34d399; flex-shrink: 0;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2242%22 height=%2242%22><rect width=%2242%22 height=%2242%22 fill=%22%2310b981%22/><text x=%2250%%22 y=%2255%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2220%22>🌿</text></svg>'">
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong style="color: #6ee7b7; font-size: 11px;">Dr. Marcelo Lagos Riquelme</strong>
                  <span style="font-size: 8px; font-family: monospace; color: #34d399;">BIOMASA • RIPARIO</span>
                </div>
                <div style="font-size: 9.5px; color: #cbd5e1; font-weight: 600;">Biólogo Ecólogo del Paisaje</div>
                <div style="font-size: 9px; color: var(--text-muted); margin-top: 2px; line-height: 1.35;">
                  <em>"El dosel de peumos y boldos disipa el 42% de la energía destructiva del agua."</em>
                </div>
                <div style="display: flex; gap: 6px; margin-top: 4px;">
                  <button id="btnAdvisorLagosTrigger" class="btn-tool" style="padding: 3px 8px; font-size: 9px; background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.4); color: #6ee7b7;">
                    🌿 Ver Corredor Ripario & NBR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SIMULADOR INTERACTIVO DE ESCENARIOS Y MOMENTOS CLIMÁTICOS -->
        <div class="glass-card" style="margin-top: 10px; border-color: rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.06);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="metric-label" style="color: #fbbf24; font-weight: 700;">⚡ SIMULADOR DE MOMENTOS Y ESCENARIOS (3D LIVE)</div>
            <span style="font-size: 10px; color: var(--text-muted);">9 Momentos Calibrados</span>
          </div>

          <div style="margin-bottom: 10px;">
            <label style="font-size: 10px; font-weight: 700; color: #cbd5e1; display: block; margin-bottom: 4px;">Seleccionar Momento / Temporada:</label>
            <select id="selectClimateMoment" style="width: 100%; padding: 8px 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(245, 158, 11, 0.4); color: #fde047; font-size: 11px; font-weight: 600; cursor: pointer; outline: none;">
              <option value="CURRENT_LIVE">🟢 1. Momento Actual / Calibrado (Línea Base)</option>
              <option value="SUMMER_NORMAL">☀️ 2. Verano Normal (Base Estival Mediterránea)</option>
              <option value="HEATWAVE_ONLY">🔥 3. Solo Ola de Calor (37.2°C • Sin Puelche)</option>
              <option value="DROUGHT_ONLY">☀️ 4. Solo Megasequía (La Niña • Napa -11.2m)</option>
              <option value="COMPOUND_EXTREME">🌪️ 5. Megasequía + Ola Calor + Viento Puelche (Alerta FWI 52)</option>
              <option value="WINTER_DRY">❄️ 6. Invierno Seco & Heladas Polares (-3.8°C)</option>
              <option value="WINTER_RAINY_T10">🌧️ 7. Invierno Lluvioso Ordinario (65mm • T=10 años)</option>
              <option value="ATMOSPHERIC_RIVER">🌊 8. Río Atmosférico • Isoterma 0 Alta (140mm • Desborde T=100)</option>
              <option value="WHATIF_TORRENTIAL">⛈️ 9. Tormenta Torrencial What-If (60mm en 4h • Keyline & Escorrentía)</option>
            </select>
          </div>

          <div id="climateMomentInfoBox" style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); padding: 8px 10px; border-radius: 8px; margin-bottom: 10px; font-size: 10px; line-height: 1.4; color: #e2e8f0;">
            <span id="momentBadge" style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; background: rgba(16,185,129,0.2); color: #34d399; margin-bottom: 4px;">En Vivo</span>
            <div id="momentDesc" style="color: #cbd5e1;">Condiciones de régimen equilibrado. Caudal base y balance hídrico bajo parámetros normales.</div>
          </div>

          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
            <div style="font-size: 10px; font-weight: 700; color: #38bdf8; margin-bottom: 8px;">🎛️ CONTROLES DINÁMICOS CONTINUOS:</div>

            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 9.5px; color: #cbd5e1; margin-bottom: 2px;">
                <span>🌧️ Lluvia Acumulada 24h:</span>
                <strong id="sliderRainVal" style="color: #38bdf8; font-family: monospace;">0 mm</strong>
              </div>
              <input type="range" id="sliderRainMm" min="0" max="160" step="5" value="0" style="width: 100%; accent-color: #0284c7; cursor: pointer;">
            </div>

            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 9.5px; color: #cbd5e1; margin-bottom: 2px;">
                <span>🏔️ Cota Isoterma 0°C:</span>
                <strong id="sliderIsothermVal" style="color: #a78bfa; font-family: monospace;">2.600 m</strong>
              </div>
              <input type="range" id="sliderIsothermM" min="1200" max="3800" step="100" value="2600" style="width: 100%; accent-color: #8b5cf6; cursor: pointer;">
            </div>

            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 9.5px; color: #cbd5e1; margin-bottom: 2px;">
                <span>🌪️ Viento (Windy Speed):</span>
                <strong id="sliderWindVal" style="color: #fbbf24; font-family: monospace;">14 km/h</strong>
              </div>
              <input type="range" id="sliderWindKmH" min="0" max="80" step="2" value="14" style="width: 100%; accent-color: #f59e0b; cursor: pointer;">
            </div>

            <div style="margin-bottom: 4px;">
              <div style="display: flex; justify-content: space-between; font-size: 9.5px; color: #cbd5e1; margin-bottom: 2px;">
                <span>🧭 Dirección del Viento:</span>
                <strong id="sliderWindDirLabel" style="color: #fdba74; font-family: monospace;">220° (SW • Brisa Valle)</strong>
              </div>
              <select id="selectWindDirection" style="width: 100%; padding: 5px 8px; border-radius: 6px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.15); color: #fff; font-size: 10px; cursor: pointer;">
                <option value="65">65° E-NE (Viento Puelche / Raco • Cordillera)</option>
                <option value="225" selected>225° SW (Brisa Marina Diurna • Valle)</option>
                <option value="315">315° NW (Frente de Temporal de Lluvia)</option>
                <option value="160">160° S (Viento Frío Polar Antártico)</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button id="btnApplyMomentSim" class="btn-tool" style="justify-content: center; background: rgba(245, 158, 11, 0.2); border-color: rgba(245, 158, 11, 0.6); color: #fde047; font-weight: bold; padding: 7px 8px;">
              ⚡ Aplicar al Gemelo 3D
            </button>
            <button id="btnResetMomentSim" class="btn-tool" style="justify-content: center; padding: 7px 8px;">
              🔄 Restaurar Normal
            </button>
          </div>

          <button id="btnOpenVecinosFromTerritorial" class="btn-tool" style="width: 100%; justify-content: flex-start; padding: 9px 12px; border-color: rgba(202, 138, 4, 0.5); background: linear-gradient(135deg, rgba(202, 138, 4, 0.18), rgba(120, 53, 15, 0.25)); margin-top: 8px;">
            <span style="font-size: 16px;">🎲</span>
            <div style="text-align: left; margin-left: 6px;">
              <div style="font-weight: 800; color: #fde047; font-size: 11px;">Abrir Vista Vecinal & Predios Contiguos (Modo Territorial)</div>
              <div style="font-size: 9px; color: #fef08a;">Análisis de riesgo compartido con predios vecinos de Las Camelias</div>
            </div>
          </button>
        </div>

        <!-- DOSSIER METODOLÓGICO: CÓMO ELABORAR MAPAS DE RIESGO -->
        <div class="glass-card" style="margin-top: 10px;">
          <div class="metric-label" style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 8px;">
            📚 METODOLOGÍA CIENTÍFICA: CÓMO ELABORAR MAPAS DE RIESGO
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(239, 68, 68, 0.25); border-left: 3px solid #ef4444; padding: 10px 12px; border-radius: 8px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: #f87171; font-size: 11px;">1. Mapas de Piro-Riesgo & FWI (Incendios)</strong>
              <span style="font-size: 9px; font-family: monospace; color: #fca5a5;">SENTINEL-2 / ERA5</span>
            </div>
            <div style="font-size: 10px; color: var(--text-secondary); margin-top: 5px; line-height: 1.45;">
              • <strong>Índice Espectral NBR:</strong> <code style="color: #67e8f9;">(B8A - B12) / (B8A + B12)</code>.<br>
              • <strong>Fórmula FWI Canadiense:</strong> Acoplamiento de FFMC, DMC y DC $\\rightarrow$ ISI $\\rightarrow$ <strong>FWI Final</strong>.<br>
              • <strong>Regla Crítica 30-30-30:</strong> >30°C, <30% HR, >30 km/h (Puelche / Raco).
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(2, 132, 199, 0.25); border-left: 3px solid #0284c7; padding: 10px 12px; border-radius: 8px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: #38bdf8; font-size: 11px;">2. Mapas de Inundación Fluvial & Isoterma 0 Alta</strong>
              <span style="font-size: 9px; font-family: monospace; color: #7dd3fc;">LiDAR 5cm / SAINT-VENANT</span>
            </div>
            <div style="font-size: 10px; color: var(--text-secondary); margin-top: 5px; line-height: 1.45;">
              • <strong>Modelación 2D Saint-Venant:</strong> Velocidades de flujo, tirantes y envolventes.<br>
              • <strong>Isoterma 0 Alta:</strong> Lluvia cálida sobre nieve andina (>3.000m), quintuplicando el caudal en la cuenca baja de Parral/Retiro.
            </div>
          </div>
        </div>
      </div>
    `;

    // Wire Climate Moment Selector & Sliders (8 Calibrated Moments)
    const selectMoment = document.getElementById('selectClimateMoment');
    const momentBadge = document.getElementById('momentBadge');
    const momentDesc = document.getElementById('momentDesc');

    const sliderRain = document.getElementById('sliderRainMm');
    const sliderRainVal = document.getElementById('sliderRainVal');

    const sliderIsotherm = document.getElementById('sliderIsothermM');
    const sliderIsothermVal = document.getElementById('sliderIsothermVal');

    const sliderWind = document.getElementById('sliderWindKmH');
    const sliderWindVal = document.getElementById('sliderWindVal');

    const selectWindDir = document.getElementById('selectWindDirection');
    const sliderWindDirLabel = document.getElementById('sliderWindDirLabel');

    const updateMomentUI = (momentKey) => {
      const scenario = ClimateScenarioModel.SCENARIOS[momentKey];
      if (!scenario) return;

      if (momentBadge) {
        momentBadge.textContent = scenario.badge;
        momentBadge.style.color = scenario.badgeColor;
        momentBadge.style.background = `${scenario.badgeColor}22`;
      }
      if (momentDesc) {
        momentDesc.textContent = scenario.description;
      }

      // Sincronizar sliders
      if (sliderRain && sliderRainVal) {
        sliderRain.value = scenario.weather.precip24h;
        sliderRainVal.textContent = `${scenario.weather.precip24h} mm`;
      }
      if (sliderIsotherm && sliderIsothermVal) {
        sliderIsotherm.value = scenario.weather.isothermZeroM;
        sliderIsothermVal.textContent = `${scenario.weather.isothermZeroM.toLocaleString()} m`;
      }
      if (sliderWind && sliderWindVal) {
        sliderWind.value = scenario.weather.windSpeed;
        sliderWindVal.textContent = `${scenario.weather.windSpeed} km/h`;
      }
      if (selectWindDir && sliderWindDirLabel) {
        selectWindDir.value = scenario.weather.windDirection;
        const opt = selectWindDir.options[selectWindDir.selectedIndex];
        sliderWindDirLabel.textContent = opt ? opt.textContent : `${scenario.weather.windDirection}°`;
      }
    };

    selectMoment?.addEventListener('change', (e) => {
      updateMomentUI(e.target.value);
    });

    sliderRain?.addEventListener('input', (e) => {
      if (sliderRainVal) sliderRainVal.textContent = `${e.target.value} mm`;
    });

    sliderIsotherm?.addEventListener('input', (e) => {
      if (sliderIsothermVal) sliderIsothermVal.textContent = `${parseInt(e.target.value).toLocaleString()} m`;
    });

    sliderWind?.addEventListener('input', (e) => {
      if (sliderWindVal) sliderWindVal.textContent = `${e.target.value} km/h`;
    });

    selectWindDir?.addEventListener('change', (e) => {
      if (sliderWindDirLabel) {
        const opt = selectWindDir.options[selectWindDir.selectedIndex];
        sliderWindDirLabel.textContent = opt ? opt.textContent : `${e.target.value}°`;
      }
    });

    // Botón: Aplicar al Gemelo 3D
    document.getElementById('btnApplyMomentSim')?.addEventListener('click', () => {
      const momentKey = selectMoment?.value || 'CURRENT_LIVE';
      const scenario = ClimateScenarioModel.SCENARIOS[momentKey];

      const rainMm = parseFloat(sliderRain?.value || (scenario ? scenario.weather.precip24h : 0));
      const isothermM = parseFloat(sliderIsotherm?.value || (scenario ? scenario.weather.isothermZeroM : 2600));
      const windSpeed = parseFloat(sliderWind?.value || (scenario ? scenario.weather.windSpeed : 15));
      const windDir = parseFloat(selectWindDir?.value || (scenario ? scenario.weather.windDirection : 220));

      // 1. Evaluar hidrología de inundación
      const hydro = ClimateScenarioModel.computeHydrology(rainMm, isothermM, 0.5);
      bus.emit('basin:flood_level', hydro.floodLevel);

      // 2. Evaluar y aplicar campo de viento dinámico (Windy Style)
      bus.emit('geomorph:set_wind_params', { speed: windSpeed, direction: windDir });
      bus.emit('geomorph:toggle_wind_streamlines', true);

      // Si el viento es Puelche (>30 km/h y E-NE), activar modo Puelche
      const isPuelche = (windDir >= 30 && windDir <= 110 && windSpeed > 25);
      bus.emit('basin:puelche_wind', isPuelche);

      // 3. Evaluar riesgo de incendios y estrés de acuífero
      if (scenario.id === 'WHATIF_TORRENTIAL') {
        bus.emit('risk:set_mode', 'water');
        bus.emit('geomorph:toggle_water_flows', true);
        if (window.agriTwinApp?.geomorphicFlowManager) {
          window.agriTwinApp.geomorphicFlowManager.startTorrentialStorm({ mm: 60, hours: 4 });
        }
      } else if (isPuelche || scenario.category.includes('fire')) {
        bus.emit('risk:set_mode', 'fire');
        bus.emit('map:set_layer_mode', 'nbr');
      } else if (hydro.isOverflow || rainMm > 40) {
        bus.emit('risk:set_mode', 'water');
        bus.emit('geomorph:toggle_water_flows', true);
      } else if (scenario.category.includes('drought')) {
        bus.emit('basin:aquifer_stress', true);
        bus.emit('risk:set_mode', 'water');
      }

      this.showAlert(`⚡ Momento Aplicado: ${scenario.name} • Caudal est: ${hydro.flowRateM3s} m³/s • Viento: ${windSpeed} km/h`);
    });

    // Botón: Restaurar Normal
    document.getElementById('btnResetMomentSim')?.addEventListener('click', () => {
      if (selectMoment) selectMoment.value = 'CURRENT_LIVE';
      updateMomentUI('CURRENT_LIVE');
      bus.emit('basin:reset_scenarios');
      bus.emit('risk:set_mode', 'none');
      bus.emit('geomorph:set_wind_params', { speed: 14, direction: 220 });
      if (window.agriTwinApp?.geomorphicFlowManager?.resetTorrentialStorm) {
        window.agriTwinApp.geomorphicFlowManager.resetTorrentialStorm();
      }
      this.showAlert('✅ Escenario Normal Restablecido: Sensores y caudales en rango óptimo.');
    });

    document.getElementById('btnOpenVecinosFromTerritorial')?.addEventListener('click', () => {
      this.openVecinosCatanModal();
    });

    // Wire Quick Tools
    document.getElementById('btnQuickDrawFromStudio')?.addEventListener('click', () => {
      this.drawingManager?.toggleDrawingMode(true);
    });
    document.getElementById('btnQuickSculptFromStudio')?.addEventListener('click', () => {
      document.getElementById('dropdown_relief')?.classList.add('open');
    });
    document.getElementById('btnQuickCatalogFromStudio')?.addEventListener('click', () => {
      const modal = document.getElementById('infoModalOverlay');
      if (modal) modal.style.display = 'flex';
    });

    // Wire Multispectral & DEM buttons in Studio
    document.getElementById('btnStudioSpectralNdvi')?.addEventListener('click', () => {
      bus.emit('map:set_layer_mode', 'ndvi');
      this.showAlert('🛰️ Teledetección NDVI: Vigor de vegetación activo (Sentinel-2 B8/B4)');
    });
    document.getElementById('btnStudioSpectralDem')?.addEventListener('click', () => {
      bus.emit('map:set_layer_mode', 'dem');
      this.showAlert('🏔️ Topografía DEM: Modelo Hipsométrico con Curvas de Nivel maestras y secundarias');
    });
    document.getElementById('btnStudioSpectralNdwi')?.addEventListener('click', () => {
      bus.emit('map:set_layer_mode', 'ndwi');
      this.showAlert('💧 Hidrología NDWI: Detección de estero, zonas anegables y drenaje');
    });
    document.getElementById('btnStudioSpectralNbr')?.addEventListener('click', () => {
      bus.emit('map:set_layer_mode', 'nbr');
      this.showAlert('🔥 Biomasa NBR: Carga de combustible forestal esclerófilo / pino');
    });

    // Wire Geomorphic Flow buttons in Studio
    let studioWater = false;
    let studioWind  = false;
    let studioZones = false;

    document.getElementById('btnStudioGeoWaterFlow')?.addEventListener('click', () => {
      studioWater = !studioWater;
      bus.emit('geomorph:toggle_water_flows', studioWater);
    });
    document.getElementById('btnStudioGeoWindyStream')?.addEventListener('click', () => {
      studioWind = !studioWind;
      bus.emit('geomorph:toggle_wind_streamlines', studioWind);
    });

    const studioWindToggles = [
      { id: 'btnStudioWindPuelche', currentId: 'puelche' },
      { id: 'btnStudioWindBreeze', currentId: 'breeze' },
      { id: 'btnStudioWindCatabatic', currentId: 'catabatic' },
      { id: 'btnStudioWindTalweg', currentId: 'talweg' }
    ];

    studioWindToggles.forEach(item => {
      const btn = document.getElementById(item.id);
      if (btn) {
        let isAct = true;
        btn.addEventListener('click', () => {
          isAct = !isAct;
          btn.classList.toggle('active', isAct);
          bus.emit('geomorph:toggle_wind_current', { currentId: item.currentId, active: isAct });
          if (isAct && !studioWind) {
            studioWind = true;
            bus.emit('geomorph:toggle_wind_streamlines', true);
          }
        });
      }
    });

    document.getElementById('btnStudioGeoHazardZones')?.addEventListener('click', () => {
      studioZones = !studioZones;
      bus.emit('geomorph:toggle_hazard_zones', studioZones);
    });

    // Wire Cuenca Advisors Direct Directives
    document.getElementById('btnAdvisorAlbornozTrigger')?.addEventListener('click', () => {
      bus.emit('map:set_layer_mode', 'dem');
      bus.emit('geomorph:toggle_water_flows', true);
      this.showAlert('🗺️ Dr. Fernando Albornoz: Activando análisis geomorfológico HEC-RAS, curvas de nivel y vectores de drenaje D8.');
    });

    document.getElementById('btnAdvisorOyarzunTrigger')?.addEventListener('click', () => {
      bus.emit('map:set_layer_mode', 'nbr');
      bus.emit('geomorph:toggle_wind_streamlines', true);
      bus.emit('basin:puelche_wind', true);
      bus.emit('risk:set_mode', 'fire');
      this.showAlert('🌤️ Dra. Natalia Oyarzún: Proyección de ráfagas de Viento Puelche 65 km/h y mapa de combustible FWI 48 activo.');
    });

    document.getElementById('btnAdvisorLagosTrigger')?.addEventListener('click', () => {
      bus.emit('map:set_layer_mode', 'ndvi');
      bus.emit('geomorph:toggle_hazard_zones', true);
      this.showAlert('🌿 Dr. Marcelo Lagos: Zonificación de corredor ripario, biofiltro macrófitas y amortiguación de crecidas.');
    });

    // ─────────────────────────────────────────────────────────────────────────
    // WIRE TABS TÁCTICAS DE CUENCA & WINDY CONTROLLERS
    // ─────────────────────────────────────────────────────────────────────────

    const tabTiempo = document.getElementById('tabBtnCuencaTiempo');
    const tabSig = document.getElementById('tabBtnCuencaSig');
    const tabRiesgo = document.getElementById('tabBtnCuencaRiesgo');
    const panelTiempo = document.getElementById('panelCuencaTiempo');
    const panelSig = document.getElementById('panelCuencaSig');
    const panelRiesgo = document.getElementById('panelCuencaRiesgo');

    const switchCuencaTab = (tabId) => {
      [tabTiempo, tabSig, tabRiesgo].forEach(b => b?.classList.remove('active'));
      [panelTiempo, panelSig, panelRiesgo].forEach(p => { if (p) p.style.display = 'none'; });

      if (tabId === 'tiempo') {
        tabTiempo?.classList.add('active');
        if (panelTiempo) panelTiempo.style.display = 'block';
        if (window.windyEngine) window.windyEngine.toggle(true);
        else bus.emit('geomorph:toggle_wind_streamlines', true);
      } else if (tabId === 'sig') {
        tabSig?.classList.add('active');
        if (panelSig) panelSig.style.display = 'block';
      } else if (tabId === 'riesgo') {
        tabRiesgo?.classList.add('active');
        if (panelRiesgo) panelRiesgo.style.display = 'block';
      }
    };

    tabTiempo?.addEventListener('click', () => switchCuencaTab('tiempo'));
    tabSig?.addEventListener('click', () => switchCuencaTab('sig'));
    tabRiesgo?.addEventListener('click', () => switchCuencaTab('riesgo'));

    // Wire Windy Layer Chips in Panel Tiempo
    const chips = document.querySelectorAll('.windy-chip-btn');
    chips.forEach(btn => {
      btn.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const layer = btn.dataset.layer;
        if (window.windyEngine) {
          window.windyEngine.setLayer(layer);
          if (!window.windyEngine.enabled) window.windyEngine.toggle(true);
        } else {
          bus.emit('windy:set_layer', layer);
        }
      });
    });

    // Wire Altitude Slider with Plane Icon ✈️
    const altSlider = document.getElementById('sliderCuencaAltitude');
    const altLabel = document.getElementById('labelCuencaAltitudeVal');
    const altLevels = [10, 100, 500, 1500, 3000];
    const altNames = ['Superficie (10m) ✈️', '100 m', '500 m', '1.500 m (Precordillera)', '3.000 m (Alta Cumbre)'];
    altSlider?.addEventListener('input', (e) => {
      const idx = parseInt(e.target.value) || 0;
      const altM = altLevels[idx];
      if (altLabel) altLabel.textContent = altNames[idx];
      if (window.windyEngine) window.windyEngine.setAltitude(altM);
      else bus.emit('windy:set_altitude', altM);
    });

    // Wire Weather Model Chips
    const btnEcmwf = document.getElementById('btnModelEcmwf');
    const btnGfs = document.getElementById('btnModelGfs');
    btnEcmwf?.addEventListener('click', () => {
      btnEcmwf.classList.add('active');
      btnGfs?.classList.remove('active');
      if (window.windyEngine) window.windyEngine.setModel('ecmwf');
    });
    btnGfs?.addEventListener('click', () => {
      btnGfs.classList.add('active');
      btnEcmwf?.classList.remove('active');
      if (window.windyEngine) window.windyEngine.setModel('gfs');
    });

    // Wire Flow Speed and Opacity Sliders
    const sliderSpeed = document.getElementById('sliderWindySpeedMult');
    const labelSpeed = document.getElementById('labelWindySpeedMult');
    sliderSpeed?.addEventListener('input', (e) => {
      if (labelSpeed) labelSpeed.textContent = `${e.target.value}x`;
      if (window.windyEngine) window.windyEngine.particleSpeedMultiplier = parseFloat(e.target.value);
    });

    const sliderOpacity = document.getElementById('sliderWindyOpacity');
    const labelOpacity = document.getElementById('labelWindyOpacity');
    sliderOpacity?.addEventListener('input', (e) => {
      if (labelOpacity) labelOpacity.textContent = `${e.target.value}%`;
      const op = parseFloat(e.target.value) / 100.0;
      if (window.windyEngine?.particleMaterial?.uniforms?.uOpacity) {
        window.windyEngine.particleMaterial.uniforms.uOpacity.value = op;
      }
    });

    // Automatically trigger Windy Engine view when opening Studio
    if (window.windyEngine) {
      window.windyEngine.toggle(true);
    }
  }

  renderEnterpriseDashboard() {
    this.ui.currentSelectedEntityId = 'enterprise_dashboard';
    this.ui.drawerTitle.textContent = '🍇 AgroTwin Enterprise Suite';
    this.ui.drawerSubtitle.textContent = 'Viñedos & Frutales de Exportación • Maule';

    this.ui.drawerBody.innerHTML = `
      <div class="glass-card" style="border-left: 4px solid var(--accent-emerald); padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-family: monospace; color: var(--accent-emerald); font-weight: 700;">[SIMULADO • FAO-56 CALIBRADO]</span>
          <span style="font-size: 10px; color: var(--text-muted);">Cuartel A • Brotes</span>
        </div>
        <div style="font-size: 15px; font-weight: 800; color: #fff; margin-top: 4px;">Balance Hídrico & Turno de Riego</div>
      </div>

      <div class="metrics-grid" style="margin-top: 10px;">
        <div class="glass-card metric-card">
          <div class="metric-label">Estrés Hídrico (CWSI)</div>
          <div class="metric-value" style="color: var(--accent-cyan);">0.26<span class="metric-unit">CWSI</span></div>
          <div style="font-size: 10px; color: var(--accent-emerald); margin-top: 2px;">Óptimo turgencia</div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-label">Lámina de Riego</div>
          <div class="metric-value" style="color: var(--accent-amber);">5.8<span class="metric-unit">mm</span></div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">42 min de bombeo</div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-label">Humedad Radicular (20-60cm)</div>
          <div class="metric-value">36.2<span class="metric-unit">%</span></div>
          <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">Capacidad de Campo: 38%</div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-label">Alerta Helada Nocturna</div>
          <div class="metric-value" style="color: #38bdf8; font-size: 16px;">1.4°C<span class="metric-unit">mínima</span></div>
          <div style="font-size: 10px; color: #38bdf8; margin-top: 2px;">06:15 AM (En el bajo)</div>
        </div>
      </div>

      <!-- Soil Profile 3 Layers -->
      <div class="glass-card" style="margin-top: 10px;">
        <div class="metric-label">💧 Perfil de Suelo por Estratos (Modelo de Cubetas)</div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px; font-size: 11px;">
          <div style="display: flex; justify-content: space-between; background: rgba(255,255,255,0.03); padding: 6px 10px; border-radius: 6px;">
            <span>0 - 20 cm (Evaporación directa):</span>
            <strong style="color: var(--accent-amber);">24.8%</strong>
          </div>
          <div style="display: flex; justify-content: space-between; background: rgba(6,182,212,0.08); padding: 6px 10px; border-radius: 6px; border-left: 2px solid var(--accent-cyan);">
            <span>20 - 60 cm (Zona Radicular Activa):</span>
            <strong style="color: var(--accent-cyan);">36.2%</strong>
          </div>
          <div style="display: flex; justify-content: space-between; background: rgba(16,185,129,0.08); padding: 6px 10px; border-radius: 6px; border-left: 2px solid var(--accent-emerald);">
            <span>60 - 100 cm (Reserva Subterránea):</span>
            <strong style="color: var(--accent-emerald);">42.5%</strong>
          </div>
        </div>
      </div>

      <!-- WhatsApp Action -->
      <div class="glass-card" style="margin-top: 10px; background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; font-size: 12px; color: #fff;">Canal de Despacho Inmediato</div>
            <div style="font-size: 11px; color: var(--text-muted);">Envío autónomo a WhatsApp del Administrador</div>
          </div>
          <button id="btnTriggerWhatsAppFromDrawer" class="btn-primary" style="padding: 6px 12px; font-size: 11px; background: #059669;">
            📲 Ver WhatsApp
          </button>
        </div>
      </div>
    `;

    const btnWs = document.getElementById('btnTriggerWhatsAppFromDrawer');
    if (btnWs) {
      btnWs.addEventListener('click', () => {
        const modal = document.getElementById('whatsAppAlertModal');
        if (modal) modal.style.display = 'flex';
      });
    }
  }

  renderTerritorialDashboard(selectedHex = null) {
    this.ui.currentSelectedEntityId = 'territorial_dashboard';
    this.ui.drawerTitle.textContent = '🗺️ AgroTwin Territorial & Vecinal';
    this.ui.drawerSubtitle.textContent = 'Matriz Catan de Predios Acoplados • Retiro / Maule';

    const hex = selectedHex || this.selectedTerritorialHex || this.ui.territorialCatanManager?.getHex(0, 0) || {
      q: 0, r: 0,
      biome: 'fundo_colliguay',
      name: 'Fundo Estero Colliguay',
      owner: 'Familia Meniels',
      surfaceHa: 12.8,
      dice: 8,
      isCenter: true,
      fwi: 18,
      waterRightsLs: 45,
      permacultureRole: 'Núcleo Central: Tranque Keyline, 8 potreros PRV y huerto biointensivo',
      yieldStr: '+5 🌾 +4 💧 +3 ⚡'
    };

    const isCenter = hex.isCenter || (hex.q === 0 && hex.r === 0);
    const allHexes = this.ui.territorialCatanManager?.getAllHexes() || [];
    const activeLens = this.ui.territorialCatanManager?.activeLens || 'lulc';

    // Biome metadata lookup
    const biomeIcons = {
      fundo_colliguay: '🏰',
      monoculture: '🌲',
      forest_pine: '🌲',
      vineyard: '🍇',
      native_forest: '🌳',
      river_wetland: '💧',
      pasture: '🌾',
      precordillera: '🏔️',
      wheat: '🌾'
    };
    const biomeNames = {
      fundo_colliguay: 'Fundo Central (Regenerativo)',
      monoculture: 'Plantación Pino / Eucalipto',
      forest_pine: 'Plantación Forestal',
      vineyard: 'Viñedo Patrimonial',
      native_forest: 'Reserva Bosque Esclerófilo',
      river_wetland: 'Ribera & Humedal Fluvial',
      pasture: 'Pradera Agroecológica / PRV',
      precordillera: 'Precordillera Andina',
      wheat: 'Cereal de Secano'
    };

    const bIcon = biomeIcons[hex.biome] || '🗺️';
    const bName = biomeNames[hex.biome] || hex.biome;

    // FWI risk presentation
    const fwiVal = hex.fwi || 20;
    const fwiColor = fwiVal > 60 ? '#ef4444' : (fwiVal > 30 ? '#f59e0b' : '#10b981');
    const fwiLevel = fwiVal > 60 ? 'Crítico (Puelche)' : (fwiVal > 30 ? 'Moderado / Alerta' : 'Bajo / Resiliente');

    this.ui.drawerBody.innerHTML = `
      <!-- 1. Multi-Scale Zoom Switcher -->
      <div class="glass-card" style="padding: 10px; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255, 255, 255, 0.12); margin-bottom: 12px;">
        <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">
          🔭 Escala de Observación (Acople Continuo 3D)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <button onclick="window.flyToColliguayLocal()" class="btn-action-primary" style="padding: 8px; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 6px; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #6ee7b7; border-radius: 6px; cursor: pointer; font-weight: 700;">
            <span>🏡 Zoom In: Predio (12.8 ha)</span>
          </button>
          <button onclick="window.flyToTerritorialVecinal()" class="btn-action-primary" style="padding: 8px; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 6px; background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #7dd3fc; border-radius: 6px; cursor: pointer; font-weight: 700;">
            <span>🗺️ Zoom Out: Matriz Catan</span>
          </button>
        </div>
      </div>

      <!-- Consejo Consultivo de la Mesa Vecinal (3 Asesores) -->
      <div class="glass-card" style="padding: 10px; margin-bottom: 12px; background: rgba(6, 78, 59, 0.25); border: 1px solid rgba(16, 185, 129, 0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 16px;">🤝</span>
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #34d399;">Consejo Consultivo Vecinal (3 Asesores)</div>
              <div style="font-size: 9px; color: #a7f3d0; font-family: monospace;">Dra. Camila • Mg. Patricia • Don Silvestre</div>
            </div>
          </div>
          <a target="_top" href="http://localhost:7777/#mesa" style="text-decoration: none; padding: 4px 8px; background: rgba(16, 185, 129, 0.25); border: 1px solid rgba(16, 185, 129, 0.5); border-radius: 6px; color: #86efac; font-size: 10px; font-weight: 700; font-family: monospace; cursor: pointer;" title="Abrir Consejo en La Mesa Vecinal">
            Ver Fichas ↗
          </a>
        </div>
      </div>

      <!-- 2. Catan Tactical Lenses -->
      <div class="glass-card" style="padding: 10px; margin-bottom: 12px; background: rgba(30, 41, 59, 0.5);">
        <div style="font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>🔍 Capas Tácticas de Información</span>
          <span style="color: #fde047; font-size: 10px; font-family: monospace;">[Civ VI / Catan Matrix]</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
          <button onclick="window.setCatanLens('lulc')" class="tab-btn ${activeLens === 'lulc' ? 'active' : ''}" style="font-size: 10.5px; padding: 6px; text-align: left;">
            🗺️ Biomas & Usos (LULC)
          </button>
          <button onclick="window.setCatanLens('fire')" class="tab-btn ${activeLens === 'fire' ? 'active' : ''}" style="font-size: 10.5px; padding: 6px; text-align: left; color: #f87171;">
            🔥 Piro-Riesgo (FWI)
          </button>
          <button onclick="window.setCatanLens('flood')" class="tab-btn ${activeLens === 'flood' ? 'active' : ''}" style="font-size: 10.5px; padding: 6px; text-align: left; color: #38bdf8;">
            💧 Hídrico & TWI
          </button>
          <button onclick="window.setCatanLens('permaculture')" class="tab-btn ${activeLens === 'permaculture' ? 'active' : ''}" style="font-size: 10.5px; padding: 6px; text-align: left; color: #4ade80;">
            🌀 Permacultura Inter-Sistemas
          </button>
        </div>
      </div>

      <!-- 3. Selected Hexagon Dossier -->
      <div class="glass-card" style="border-left: 4px solid ${isCenter ? '#10b981' : '#f59e0b'}; padding: 14px; margin-bottom: 12px; background: rgba(15, 23, 42, 0.85);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 20px;">${bIcon}</span>
              <span style="font-size: 15px; font-weight: 800; color: #fff;">${hex.name}</span>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
              Propietario: <strong style="color: #cbd5e1;">${hex.owner}</strong> • ${hex.surfaceHa} ha
            </div>
          </div>
          <span style="font-size: 11px; font-family: monospace; background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 4px; color: #fde047; font-weight: 700;">
            Casilla [${hex.q}, ${hex.r}]
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px;">
          <div style="background: rgba(0,0,0,0.25); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Uso de Suelo / Bioma</div>
            <div style="font-size: 12px; font-weight: 700; color: #e2e8f0; margin-top: 2px;">${bName}</div>
          </div>
          <div style="background: rgba(0,0,0,0.25); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Ficha Catan & Producción</div>
            <div style="font-size: 12px; font-weight: 700; color: #fde047; margin-top: 2px;">
              🎲 Dado ${hex.dice || 7} • ${hex.yieldStr || 'Estándar'}
            </div>
          </div>
        </div>

        <!-- Risk & Hydro stats -->
        <div style="margin-top: 10px; background: rgba(0,0,0,0.25); padding: 10px; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
            <span style="color: #94a3b8;">🔥 Piro-Riesgo FWI:</span>
            <strong style="color: ${fwiColor};">${hex.fwi} • ${fwiLevel}</strong>
          </div>
          <div style="height: 6px; width: 100%; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
            <div style="height: 100%; width: ${Math.min(100, hex.fwi)}%; background: ${fwiColor};"></div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span style="color: #94a3b8;">💧 Derechos Hídricos DGA:</span>
            <strong style="color: #38bdf8;">${hex.waterRightsLs || 15} L/s</strong>
          </div>
        </div>

        <!-- Inter-System Permaculture Coupling -->
        <div style="margin-top: 10px; padding: 10px; background: rgba(6, 78, 59, 0.3); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 6px;">
          <div style="font-size: 11px; font-weight: 700; color: #34d399; display: flex; align-items: center; gap: 5px;">
            <span>🌀 Acople Permacultural Inter-Sistemas:</span>
          </div>
          <div style="font-size: 11px; color: #e2e8f0; margin-top: 5px; line-height: 1.45;">
            ${hex.permacultureRole}
          </div>
          <div style="font-size: 10px; color: #a7f3d0; margin-top: 6px; border-top: 1px dashed rgba(52, 211, 153, 0.3); padding-top: 5px; line-height: 1.4;">
            • <strong>Corredor Biológico:</strong> Conexión de polinizadores y fauna nativa con la Zona 5 del predio.<br>
            • <strong>Infiltración Keyline:</strong> Amortiguación de escorrentía evitando cárcavas aguas abajo.<br>
            • <strong>Bio-Cortafuegos:</strong> Pradera silvopastoril buffer frente a monocultivos vecinos.
          </div>
        </div>

        <!-- 3.1 Expediente Legal de Límites & CBR -->
        <div style="margin-top: 10px; padding: 10px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-size: 11px; color: #fde047;">⚖️ Registro de Límites & Régimen de Suelo:</strong>
            <span style="font-size: 9px; font-family: monospace; color: #34d399; background: rgba(0,0,0,0.4); padding: 1px 5px; border-radius: 3px;">DL 3516 • CBR</span>
          </div>
          <div style="font-size: 10.5px; color: #cbd5e1; line-height: 1.4;">
            Límite mínimo 0.5 ha ($5.000\text{ m}^2$) • Excepción construcciones Art. 55 LGUC (IFC).
          </div>
          <button onclick="window.app?.agroWorkshopOverlay?.openStationModal?.(window.app?.agroWorkshopOverlay?.constructor?.WORKSHOP_STATIONS_DATA?.find(s => s.id === 'station_map') || {id: 'station_map'})" style="margin-top: 6px; width: 100%; padding: 6px; background: rgba(245,158,11,0.25); border: 1px solid #f59e0b; color: #fef08a; border-radius: 4px; font-size: 10.5px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
            <span>📜 Ver Título CBR, Deslindes & Bóveda Documental</span>
          </button>
        </div>
      </div>

      <!-- 4. Client Tool: + Agregar Predio / Casilla Vecina -->
      <div class="glass-card" style="margin-bottom: 12px; padding: 12px; border: 1px dashed rgba(245, 158, 11, 0.6); background: rgba(30, 41, 59, 0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="window.toggleAddNeighborForm()">
          <span style="font-size: 12px; font-weight: 800; color: #fde047; display: flex; align-items: center; gap: 6px;">
            <span>➕ Registrar Nuevo Predio Vecino (Cliente)</span>
          </span>
          <span id="addNeighborToggleIcon" style="font-size: 12px; color: #fde047;">▼</span>
        </div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 3px;">
          Crea hexágonos contiguos para monitorear riesgos (incendios, inundaciones, derechos de agua) y acoplamiento permacultural.
        </div>

        <div id="addNeighborFormContainer" style="display: none; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div>
              <label style="font-size: 10px; color: #cbd5e1; display: block; margin-bottom: 2px;">Nombre del Predio / Vecino:</label>
              <input id="newHexName" type="text" placeholder="Ej: Fundo San José de Longaví" style="width: 100%; padding: 6px; font-size: 11px; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div>
                <label style="font-size: 10px; color: #cbd5e1; display: block; margin-bottom: 2px;">Propietario / Contacto:</label>
                <input id="newHexOwner" type="text" placeholder="Ej: Sucesión Pinochet" style="width: 100%; padding: 6px; font-size: 11px; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 10px; color: #cbd5e1; display: block; margin-bottom: 2px;">Superficie (ha):</label>
                <input id="newHexSurface" type="number" value="30" step="0.5" style="width: 100%; padding: 6px; font-size: 11px; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div>
                <label style="font-size: 10px; color: #cbd5e1; display: block; margin-bottom: 2px;">Bioma / Uso:</label>
                <select id="newHexBiome" style="width: 100%; padding: 6px; font-size: 11px; background: rgba(15,23,42,0.9); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;">
                  <option value="pasture">🌾 Pradera / Pastizal</option>
                  <option value="wheat">🌾 Trigo / Cereal Secano</option>
                  <option value="vineyard">🍇 Viñedo Patrimonial</option>
                  <option value="monoculture">🌲 Plantación Pino / Eucalipto</option>
                  <option value="native_forest">🌳 Bosque Nativo / Quebrada</option>
                  <option value="river_wetland">💧 Ribera / Estero / Humedal</option>
                </select>
              </div>
              <div>
                <label style="font-size: 10px; color: #cbd5e1; display: block; margin-bottom: 2px;">Ubicación Contigua:</label>
                <select id="newHexDirection" style="width: 100%; padding: 6px; font-size: 11px; background: rgba(15,23,42,0.9); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;">
                  <option value="0,-2">Norte [0, -2]</option>
                  <option value="1,-2">Nor-Este [1, -2]</option>
                  <option value="2,-1">Este-Norte [2, -1]</option>
                  <option value="2,0">Este [2, 0]</option>
                  <option value="1,1">Sur-Este [1, 1]</option>
                  <option value="0,2">Sur [0, 2]</option>
                  <option value="-1,2">Sur-Oeste [-1, 2]</option>
                  <option value="-2,1">Oeste-Sur [-2, 1]</option>
                  <option value="-2,0">Oeste [-2, 0]</option>
                  <option value="-1,-1">Nor-Oeste [-1, -1]</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div>
                <label style="font-size: 10px; color: #cbd5e1; display: block; margin-bottom: 2px;">Riesgo Incendio FWI (1-100):</label>
                <input id="newHexFwi" type="number" value="35" min="5" max="95" style="width: 100%; padding: 6px; font-size: 11px; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 10px; color: #cbd5e1; display: block; margin-bottom: 2px;">Derechos DGA (L/s):</label>
                <input id="newHexWater" type="number" value="18" min="0" max="500" style="width: 100%; padding: 6px; font-size: 11px; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;">
              </div>
            </div>

            <div>
              <label style="font-size: 10px; color: #cbd5e1; display: block; margin-bottom: 2px;">Rol Permacultural & Acople:</label>
              <input id="newHexPerma" type="text" value="Cortafuegos silvopastoril con ganado y recarga de napa freática" style="width: 100%; padding: 6px; font-size: 11px; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;">
            </div>

            <button onclick="window.submitAddNeighborForm()" style="margin-top: 4px; padding: 8px; font-size: 12px; font-weight: 700; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #000; border-radius: 6px; cursor: pointer;">
              🚀 Acoplar Predio al Gemelo 3D
            </button>
          </div>
        </div>
      </div>

      <!-- 5. Dynamic Contiguous Simulators -->
      <div class="glass-card" style="margin-bottom: 12px; padding: 12px; background: rgba(15, 23, 42, 0.7);">
        <div style="font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 8px;">
          ⚡ Simulación de Dinámicas Transfronterizas
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <button onclick="window.triggerSimPuelcheFire()" class="btn-action-primary" style="padding: 7px 10px; font-size: 11px; text-align: left; background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5; border-radius: 6px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            <span>🔥 Viento Puelche (Propagación Incendio)</span>
            <span style="font-size: 9px; background: rgba(239,68,68,0.3); padding: 2px 5px; border-radius: 3px;">Simular</span>
          </button>
          <button onclick="window.triggerSimFloodEstero()" class="btn-action-primary" style="padding: 7px 10px; font-size: 11px; text-align: left; background: rgba(2, 132, 199, 0.15); border: 1px solid #0284c7; color: #7dd3fc; border-radius: 6px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            <span>🌊 Crecida Fluvial Estero (Amortiguación TWI)</span>
            <span style="font-size: 9px; background: rgba(2,132,199,0.3); padding: 2px 5px; border-radius: 3px;">Simular</span>
          </button>
          <button onclick="window.triggerSimGrazingAlliance()" class="btn-action-primary" style="padding: 7px 10px; font-size: 11px; text-align: left; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #86efac; border-radius: 6px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            <span>🐄 Alianza de Pastoreo Rotativo (PRV Vecinal)</span>
            <span style="font-size: 9px; background: rgba(16,185,129,0.3); padding: 2px 5px; border-radius: 3px;">Simular</span>
          </button>
        </div>
      </div>

      <!-- 6. Neighborhood Matrix Quick Jump -->
      <div class="glass-card" style="padding: 10px; background: rgba(15, 23, 42, 0.6);">
        <div style="font-size: 11px; font-weight: 700; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase;">
          🗺️ Red Territorial de Predios Acoplados (${allHexes.length})
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; max-height: 140px; overflow-y: auto;">
          ${allHexes.map(h => `
            <button onclick="window.selectNeighborHex(${h.q}, ${h.r})" style="font-size: 10px; padding: 4px 7px; border-radius: 4px; background: ${(hex.q === h.q && hex.r === h.r) ? 'rgba(253, 224, 71, 0.3)' : 'rgba(255,255,255,0.06)'}; border: 1px solid ${(hex.q === h.q && hex.r === h.r) ? '#fde047' : 'rgba(255,255,255,0.1)'}; color: #fff; cursor: pointer; white-space: nowrap;">
              ${biomeIcons[h.biome] || '📍'} ${h.name.split(':')[0]} [${h.q},${h.r}]
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderEsgDashboard() {
    this.ui.currentSelectedEntityId = 'esg_dashboard';
    this.ui.drawerTitle.textContent = '🌿 AgroTwin ESG / MRV Ledger';
    this.ui.drawerSubtitle.textContent = 'Auditoría Ambiental • GIZ, BID & Taxonomía UE';

    this.ui.drawerBody.innerHTML = `
      <div class="glass-card" style="border-left: 4px solid var(--accent-amber); padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-family: monospace; color: var(--accent-amber); font-weight: 700;">[BLOCKCHAIN & SENTINEL-2 EUDR]</span>
          <span style="font-size: 10px; color: var(--text-muted);">Hash: 0x8f2d...4a1</span>
        </div>
        <div style="font-size: 15px; font-weight: 800; color: #fff; margin-top: 4px;">Pasaporte Verde & Cero Deforestación</div>
      </div>

      <div class="metrics-grid" style="margin-top: 10px;">
        <div class="glass-card metric-card">
          <div class="metric-label">Captura Neta de Carbono</div>
          <div class="metric-value" style="color: var(--accent-emerald);">4.8<span class="metric-unit">tCO2e/ha</span></div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Metodología Tier 2 IPCC</div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-label">Integridad Ecológica (IEI)</div>
          <div class="metric-value" style="color: var(--accent-cyan);">0.88<span class="metric-unit">/1.0</span></div>
          <div style="font-size: 10px; color: var(--accent-emerald); margin-top: 2px;">Bosque esclerófilo nativo</div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-label">Compliance EUDR</div>
          <div class="metric-value" style="color: var(--accent-emerald); font-size: 16px;">100% Cero Def.</div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Línea base post-2020 verificada</div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-label">Créditos de Biodiversidad</div>
          <div class="metric-value" style="color: var(--accent-amber);">128<span class="metric-unit">PBC</span></div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Listo para mercado UE</div>
        </div>
      </div>

      <div class="glass-card" style="margin-top: 10px;">
        <div class="metric-label">📜 Auditoría de Deforestación en Polígono</div>
        <div style="font-size: 11px; margin-top: 6px; color: var(--text-secondary); line-height: 1.5;">
          Serie temporal multiespectral 2015-2026: <strong>0.00 ha</strong> de tala rasa detectada. Conservación de especies protegidas: Peumo, Quillay y Boldo con trazabilidad satelital inmutable.
        </div>
      </div>
    `;
  }

  renderDefaultCreatorView() {
    this.ui.currentSelectedEntityId = null;
    this.ui.drawerTitle.textContent = 'AgriTwin 3D Digital Twin';
    this.ui.drawerSubtitle.textContent = 'Predio Meniels | Parral, Región del Maule';

    this.ui.drawerBody.innerHTML = `
      <!-- 1. Full Creator Brand & Official Logo Card -->
      <div class="creator-card" style="text-align: center;">
        <div class="brand-logo-container" style="margin-bottom: 12px;">
          <img src="assets/agritwin_logo_full.png" alt="AgriTwin 3D Digital Twin" style="width: 100%; max-width: 240px; height: auto; border-radius: 12px; filter: drop-shadow(0 6px 16px rgba(0,0,0,0.5));">
        </div>
        <div class="creator-name">Daniel Santander Urrutia</div>
        <div class="creator-titles">
          Geofísico • Permacultor<br>
          Manejador Ambiental • Protector Ambiental
        </div>
        <div class="creator-bio">
          Diseñador del Gemelo Digital Agroecológico para Predio Meniels en Parral, Maule.
        </div>
      </div>

      <!-- 2. Active Ground-Truth Simulation Status Banner (FAO-56 / ERA5) -->
      <div class="glass-card" style="background: rgba(16, 185, 129, 0.12); border-left: 4px solid var(--accent-emerald); padding: 12px 14px; margin-top: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-family: monospace; color: var(--accent-emerald); font-weight: 700;">● MODO GROUND-TRUTH SIMULADO</span>
          <span style="font-size: 10px; color: var(--accent-amber); font-weight: 600;">FAO-56 / ERA5</span>
        </div>
        <div style="font-size: 12px; color: #fff; margin-top: 4px; font-weight: 600;">
          Operando con telemetría sintética calibrada mientras no hay despliegue físico total de sensores.
        </div>
      </div>

      <!-- 3. Quick Selector for the 3 AgroTwin B2B Modules -->
      <div class="glass-card" style="padding: 12px; margin-top: 10px;">
        <div class="future-title" style="color: #6ee7b7; margin-bottom: 8px; font-size: 11px;">🌱 Selecciona el Módulo Operativo:</div>
        <div style="display: grid; grid-template-columns: 1fr; gap: 6px;">
          <button id="btn_quick_enterprise" class="btn-tool" style="width: 100%; justify-content: flex-start; padding: 8px 12px; font-size: 11px;">
            <span>🍇</span>
            <div style="text-align: left; margin-left: 8px;">
              <strong style="color: #fff; display: block;">1. AgroTwin Enterprise</strong>
              <span style="font-size: 10px; color: var(--text-muted);">Viñedos: Riego mm, CWSI y Alertas de Helada</span>
            </div>
          </button>

          <button id="btn_quick_territorial" class="btn-tool" style="width: 100%; justify-content: flex-start; padding: 8px 12px; font-size: 11px;">
            <span>🏛️</span>
            <div style="text-align: left; margin-left: 8px;">
              <strong style="color: #fff; display: block;">2. AgroTwin Territorial</strong>
              <span style="font-size: 10px; color: var(--text-muted);">Municipios/APRs: Recarga de Napa & FWI Incendios</span>
            </div>
          </button>

          <button id="btn_quick_esg" class="btn-tool" style="width: 100%; justify-content: flex-start; padding: 8px 12px; font-size: 11px;">
            <span>🌿</span>
            <div style="text-align: left; margin-left: 8px;">
              <strong style="color: #fff; display: block;">3. AgroTwin ESG / MRV</strong>
              <span style="font-size: 10px; color: var(--text-muted);">Fondos: Captura de Carbono & Cero Deforestación EUDR</span>
            </div>
          </button>
        </div>
      </div>

      <!-- 4. Ecosystem Family Card (AgroTech Chile • Rewild • AgriTwin 3D) -->
      <div class="glass-card" style="margin-top: 10px;">
        <div class="future-title" style="color: var(--accent-cyan); display: flex; align-items: center; gap: 8px;">
          <span>🌐</span> Ecosistema AgroTech Chile
        </div>
        <div style="font-size: 11px; margin-top: 8px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
          <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 6px; border-left: 3px solid var(--accent-cyan);">
            <strong style="color: #fff;">1. AgroTech Chile</strong><br>
            Plataforma madre de tecnología agrícola de precisión & sensorización IoT.
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 6px; border-left: 3px solid var(--accent-emerald);">
            <strong style="color: #fff;">2. Rewild</strong><br>
            Aplicación de terreno enfocada en ecología, curvas topográficas & restauración de suelos.
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 6px; border-left: 3px solid var(--accent-amber);">
            <strong style="color: #fff;">3. AgriTwin 3D</strong><br>
            Gemelo Digital 3D, simulación predictiva, mallas de datos espaciales & capas de riesgo.
          </div>
        </div>
      </div>

      <!-- 5. Vision & Mission Card -->
      <div class="glass-card" style="margin-top: 10px;">
        <div class="future-title" style="color: var(--accent-emerald);">🎯 Visión & Misión del Proyecto</div>
        <div class="future-desc" style="margin-top: 6px; line-height: 1.5; font-size: 11px; color: var(--text-secondary);">
          <strong style="color: #fff;">Visión:</strong> Transformar la agricultura chilena mediante gemelos digitales 3D para la autonomía alimentaria, eficiencia hídrica y soberanía energética.<br><br>
          <strong style="color: #fff;">Misión:</strong> Proporcionar herramientas de simulación en tiempo real para optimizar la producción de alimento, biomasa y conservación ambiental.
        </div>
      </div>

      <!-- 6. Spatial Inspection Guide -->
      <div class="glass-card" style="text-align: center; color: var(--text-muted); padding: 14px; margin-top: 10px; font-size: 11px;">
        💡 Haz clic en la <strong>Casa Principal 3D</strong>, <strong>Parcelas</strong> o <strong>Nodos IoT</strong> para inspeccionar telemetría y diagnósticos de riesgo.
      </div>
    `;

    // Bind quick module selectors
    const qEnt = document.getElementById('btn_quick_enterprise');
    const qTer = document.getElementById('btn_quick_territorial');
    const qEsg = document.getElementById('btn_quick_esg');

    if (qEnt) qEnt.addEventListener('click', () => this.renderEnterpriseDashboard());
    if (qTer) qTer.addEventListener('click', () => this.renderTerritorialDashboard());
    if (qEsg) qEsg.addEventListener('click', () => this.renderEsgDashboard());
  }

}
