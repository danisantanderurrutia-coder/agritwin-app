/**
 * AgriTwin - AdminPanelViews Module
 * 
 * Renderizador de las 9 pestañas maestras del Panel Administrador:
 *  1. sensors (Red Sensores Maule & Telemetría IoT / Formato Informe)
 *  2. predios (Libreta Biofísica & Suelos)
 *  3. visor3d (Cámaras & Ajustes Gráficos)
 *  4. map (Mosaico & Bóveda Documental Legal CBR/SII/SAG)
 *  5. vault (Libro ESG / MRV Ledger Deforestación)
 *  6. territorial (Red Territorial & APRs)
 *  7. scripts (Herramientas & CLI)
 *  8. tree (Árbol de Ramas y Soberanía)
 *  9. engines (Motores & Auditoría)
 */

import { propertyRegistryManager, CHILEAN_LAND_LEGAL_FRAMEWORK } from '../../data/PropertyRegistryManager.js';
import { MAULE_SENSORS_CONFIG } from '../AgroWorkshopOverlay.js';

export class AdminPanelViews {
  static render(overlay) {
    const activeKey = overlay.selectedMauleSensorTab || 'frost';
    const activeCfg = MAULE_SENSORS_CONFIG[activeKey] || MAULE_SENSORS_CONFIG.frost;
    const mauleTabs = [
      { id: 'frost', icon: '❄️', label: 'Heladas Fruta' },
      { id: 'leaf', icon: '🍃', label: 'Mojamiento Foliar' },
      { id: 'flow', icon: '🚰', label: 'Caudal & Turno DGA' },
      { id: 'wx', icon: '🌤️', label: 'Estación Microzona' },
      { id: 'soil', icon: '🌱', label: 'Sonda Suelo' }
    ];

    const activeProp = propertyRegistryManager.getProperty(overlay.selectedPredioId) || propertyRegistryManager.getActiveProperty();
    const propSubTab = overlay.selectedPropertySubTab || 'titles';
    const legalKey = overlay.selectedLegalDocTab || 'dl3516';
    const legalFramework = CHILEAN_LAND_LEGAL_FRAMEWORK[legalKey] || CHILEAN_LAND_LEGAL_FRAMEWORK.dl3516;

    return `
      <aside class="workshop-admin-panel" style="background: rgba(22, 13, 8, 0.98); backdrop-filter: blur(20px); border: 2px solid #b45309; border-radius: 18px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.95); font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Header Modal Diegético -->
        <div class="admin-panel-header" style="height: 60px; border-bottom: 2px solid #78350f; background: #27150c; padding: 0 20px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.5); display: flex; align-items: center; justify-content: center; font-size: 18px;">
              🧭
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-family: monospace; font-size: 10px; font-weight: 800; color: #fbbf24; background: #451a03; padding: 2px 6px; border-radius: 4px; border: 1px solid #92400e;">
                  MOMENTO 1 • MANDO INTEGRAL
                </span>
                <h2 style="margin: 0; font-family: Georgia, serif; font-size: 16px; font-weight: 800; color: #ffffff; letter-spacing: 0.02em;">
                  PANEL MAESTRO PREDIAL & TELEMETRÍA
                </h2>
              </div>
              <div style="font-size: 11px; color: #d6c4a8; font-style: italic;">
                Centro Técnico, Modelos Biofísicos, Red de Sensores IoT & Registro Operativo del Fundo
              </div>
            </div>
          </div>
          <button id="btnCloseAdminPanel" class="btn-workshop-close" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Cerrar Panel Maestro (Esc)">&times;</button>
        </div>

        <!-- Barra de Pestañas Maestras del Predio -->
        <nav class="admin-tabs-nav" style="display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #180d07; border-bottom: 1px solid rgba(120, 53, 15, 0.6); overflow-x: auto;">
          <button class="admin-tab-btn ${overlay.activeAdminTab === 'sensors' ? 'active' : ''}" data-tab="sensors">
            <span>📡</span> Red Sensores Maule
          </button>
          <button class="admin-tab-btn ${overlay.activeAdminTab === 'predios' ? 'active' : ''}" data-tab="predios">
            <span>🌿</span> Estratégico de Permacultura
          </button>
          <button class="admin-tab-btn ${overlay.activeAdminTab === 'scripts' ? 'active' : ''}" data-tab="scripts">
            <span>🧰</span> Caja de Herramientas & Biofísica
          </button>
          <button class="admin-tab-btn ${overlay.activeAdminTab === 'map' ? 'active' : ''}" data-tab="map">
            <span>🗺️</span> Mosaico & Linderos
          </button>
          <button class="admin-tab-btn ${overlay.activeAdminTab === 'vault' ? 'active' : ''}" data-tab="vault">
            <span>📖</span> Libro ESG / MRV
          </button>
          <button class="admin-tab-btn ${overlay.activeAdminTab === 'territorial' ? 'active' : ''}" data-tab="territorial">
            <span>📻</span> Red Territorial & APRs
          </button>
        </nav>

        <!-- Contenedor del Cuerpo -->
        <div class="admin-panel-body" style="padding: 18px 20px; overflow-y: auto; max-height: calc(88vh - 140px); display: flex; flex-direction: column; gap: 14px; color: #e6ccb2;">

          <!-- ================= TAB: RED DE SENSORES MAULE & TELEMETRÍA IOT ================= -->
          ${overlay.activeAdminTab === 'sensors' ? `
            <!-- Barra Superior: Selector de Nodos + Selector Sub-vista -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px;">
                ${mauleTabs.map(t => {
                  const isCur = t.id === activeKey;
                  return `
                    <button class="maule-sensor-tab-btn ${isCur ? 'active' : ''}" data-maule-tab="${t.id}" style="
                      padding: 6px 12px;
                      border-radius: 6px;
                      font-family: monospace;
                      font-size: 11px;
                      font-weight: bold;
                      display: flex;
                      align-items: center;
                      gap: 6px;
                      cursor: pointer;
                      white-space: nowrap;
                      border: 1px solid ${isCur ? '#fbbf24' : 'rgba(120,53,15,0.5)'};
                      background: ${isCur ? 'rgba(245,158,11,0.2)' : 'rgba(25,14,8,0.7)'};
                      color: ${isCur ? '#fde68a' : '#cbd5e1'};
                    ">
                      <span>${t.icon}</span>
                      <span>${t.label}</span>
                    </button>
                  `;
                }).join('')}
              </div>

              <div style="display: flex; gap: 6px; background: rgba(0,0,0,0.4); padding: 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
                <button id="btnSubTelemetria" style="padding: 6px 10px; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: bold; border-radius: 6px; border: none; cursor: pointer; ${overlay.sensorSubView === 'telemetry' ? 'background: rgba(245, 158, 11, 0.3); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.5);' : 'background: transparent; color: #94a3b8;'}">
                  📡 Telemetría en Vivo
                </button>
                <button id="btnSubInforme" style="padding: 6px 10px; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: bold; border-radius: 6px; border: none; cursor: pointer; ${overlay.sensorSubView === 'report' ? 'background: rgba(16, 185, 129, 0.3); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.5);' : 'background: transparent; color: #94a3b8;'}">
                  📋 Formato Informe Oficial
                </button>
              </div>
            </div>

            ${overlay.sensorSubView === 'telemetry' ? `
              <!-- Ficha Técnica del Sensor en 2 Columnas -->
              <div style="background: #24130a; padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(120,53,15,0.8); display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(120,53,15,0.5); padding-bottom: 8px;">
                  <div style="font-family: Georgia, serif; font-size: 15px; font-weight: bold; color: #fff; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">${activeCfg.icon}</span>
                    <span>${activeCfg.name}</span>
                  </div>
                  <span style="font-size: 10px; font-family: monospace; color: ${activeCfg.color}; background: rgba(0,0,0,0.4); padding: 2px 8px; border-radius: 4px; border: 1px solid ${activeCfg.color}; font-weight: bold;">
                    ${activeCfg.badge}
                  </span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 11px; line-height: 1.45;">
                  <div style="background: #180d07; padding: 10px; border-radius: 8px; border: 1px solid rgba(120,53,15,0.5);">
                    <strong style="color: #fbbf24; display: block; margin-bottom: 3px;">🛠️ Especificación Hardware:</strong>
                    ${activeCfg.hardware}<br><br>
                    <strong style="color: #38bdf8; display: block; margin-bottom: 3px;">📍 Ubicación en Predio:</strong>
                    ${activeCfg.locationNote}<br><br>
                    <strong style="color: #34d399; display: block; margin-bottom: 3px;">🎯 Cultivos Monitoreados:</strong>
                    ${activeCfg.targetCrop}
                  </div>

                  <div style="background: #180d07; padding: 10px; border-radius: 8px; border: 1px solid rgba(120,53,15,0.5);">
                    <strong style="color: #fbbf24; display: block; margin-bottom: 3px;">🧠 Herramienta Biofísica: ${activeCfg.toolName}</strong>
                    ${activeCfg.toolDesc}<br><br>
                    <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 6px 8px; border-radius: 4px; margin-top: 4px;">
                      <strong style="color: #fde047;">🚜 Dictamen Operativo Clave:</strong><br>
                      ${activeCfg.recommendation}
                    </div>
                  </div>
                </div>

                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.4); padding: 8px 12px; border-radius: 8px; font-size: 11px; display: flex; align-items: center; justify-content: space-between;">
                  <span style="color: #6ee7b7;">💰 <strong>Impacto Económico Medido en Maule:</strong> ${activeCfg.economicImpact}</span>
                  <span style="color: #a7f3d0; font-family: monospace; font-size: 10px;">Validación Red Maule 2026</span>
                </div>
              </div>

              <!-- Gráfica Dinámica Chart.js Especializada -->
              <div style="background: #120804; padding: 14px; border-radius: 12px; border: 1px solid rgba(120,53,15,0.8);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <div style="font-family: Georgia, serif; font-size: 13px; font-weight: 800; color: #fff;">
                    📊 ${activeCfg.chartTitle}
                  </div>
                  <span style="font-family: monospace; font-size: 9.5px; background: rgba(56,189,248,0.15); color: #38bdf8; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3);">
                    Telemetría 60fps • Ground-Truth
                  </span>
                </div>
                <div style="position: relative; height: 165px; width: 100%;">
                  <canvas id="stationDynamicChart"></canvas>
                </div>
              </div>

              <!-- Nodos Activos en Predio Meniels (Red Maule Sur) -->
              <div style="background: #1c1008; padding: 12px; border-radius: 10px; border: 1px solid rgba(120,53,15,0.6); display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #fbbf24; font-weight: bold; font-size: 11.5px;">📡 Resumen de Red Maule in situ:</span>
                  <span style="font-size: 9.5px; color: #38bdf8; font-family: monospace;">LoRaWAN EU/AU915 • 5 Nodos Activos</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 8px; font-family: monospace; font-size: 10px;">
                  <div style="display: flex; justify-content: space-between; padding: 6px 8px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); border-radius: 6px;">
                    <div>
                      <strong style="color: #f87171;">❄️ IOT-FROST-01 (Cerezo Hondonada)</strong>
                      <div style="color: #cbd5e1; font-size: 9px;">Fruta: -0.8°C | Twb: -1.5°C | 2m: 2.4°C</div>
                    </div>
                    <span style="color: #f87171; font-weight: bold; text-align: right;">⚠️ NO RIEGO<br>(Bulbo bajo)</span>
                  </div>

                  <div style="display: flex; justify-content: space-between; padding: 6px 8px; background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3); border-radius: 6px;">
                    <div>
                      <strong style="color: #fde047;">🍃 IOT-LEAF-01 (Parrón Cepa País)</strong>
                      <div style="color: #cbd5e1; font-size: 9px;">Mojamiento: 11.5 h | Mills: 82% | HR: 94%</div>
                    </div>
                    <span style="color: #fde047; font-weight: bold; text-align: right;">🍄 GATILLAR<br>Fungicida</span>
                  </div>

                  <div style="display: flex; justify-content: space-between; padding: 6px 8px; background: rgba(2,132,199,0.1); border: 1px solid rgba(2,132,199,0.3); border-radius: 6px;">
                    <div>
                      <strong style="color: #38bdf8;">🚰 IOT-FLOW-01 (Caudalímetro Pozo #1)</strong>
                      <div style="color: #cbd5e1; font-size: 9px;">Q: 24.5 L/s | Turno: en 4d | Reserva: 4.2d</div>
                    </div>
                    <span style="color: #34d399; font-weight: bold; text-align: right;">📜 MEE DGA OK<br>Pozo Apagado</span>
                  </div>

                  <div style="display: flex; justify-content: space-between; padding: 6px 8px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 6px;">
                    <div>
                      <strong style="color: #fbbf24;">🌤️ IOT-WX-01 (Estación Microzona)</strong>
                      <div style="color: #cbd5e1; font-size: 9px;">Viento: 5.2 km/h | Ventana: 07:30-10:45</div>
                    </div>
                    <span style="color: #fbbf24; font-weight: bold; text-align: right;">🍒 Cracking<br>Riesgo Medio</span>
                  </div>

                  <div style="display: flex; justify-content: space-between; padding: 6px 8px; background: #27160c; border: 1px solid rgba(16,185,129,0.3); border-radius: 6px;">
                    <div>
                      <strong style="color: #4ade80;">🌱 IOT-SN-01 (Sonda Franco-Arcilloso)</strong>
                      <div style="color: #cbd5e1; font-size: 9px;">Humedad 20-60cm: ${overlay.simMoisture}% | Bat: 96%</div>
                    </div>
                    <span style="color: #4ade80; font-weight: bold;">🟢 Óptimo</span>
                  </div>
                </div>
              </div>

              <!-- Sliders de Calibración FDR Interactiva en Vivo -->
              <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); font-family: 'JetBrains Mono', monospace; font-size: 11px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <span style="color: #cbd5e1;">Temperatura Suelo:</span>
                    <span id="txtSimTemp" style="color: #fbbf24; font-weight: bold;">${overlay.simTemp}°C</span>
                  </div>
                  <input type="range" id="sliderSimTemp" min="0" max="42" step="0.5" value="${overlay.simTemp}" style="width: 100%; accent-color: #f59e0b;">
                </div>
                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <span style="color: #cbd5e1;">Humedad Estrato 1:</span>
                    <span id="txtSimMoisture" style="color: #38bdf8; font-weight: bold;">${overlay.simMoisture}%</span>
                  </div>
                  <input type="range" id="sliderSimMoisture" min="10" max="60" step="0.5" value="${overlay.simMoisture}" style="width: 100%; accent-color: #0284c7;">
                </div>
                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <span style="color: #cbd5e1;">Estrés CWSI:</span>
                    <span id="txtSimCwsi" style="color: #4ade80; font-weight: bold;">${overlay.simCwsi}</span>
                  </div>
                  <input type="range" id="sliderSimCwsi" min="0" max="1" step="0.05" value="${overlay.simCwsi}" style="width: 100%; accent-color: #22c55e;">
                </div>
              </div>
            ` : `
              <!-- Vista de Formato Informe Oficial SAG/DGA -->
              <div style="background: #ffffff; color: #0f172a; padding: 16px; border-radius: 12px; font-family: sans-serif; font-size: 11px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                <div style="border-bottom: 2px solid #059669; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <div style="font-size: 9px; font-family: monospace; font-weight: bold; color: #047857; text-transform: uppercase;">
                      URRUTIA AGROTECH & AGRITWIN 3D • RED MAULE SUR
                    </div>
                    <div style="font-size: 14px; font-weight: 800; color: #0f172a;">
                      Informe Técnico de Telemetría IoT & Dictamen Agronómico
                    </div>
                    <div style="font-size: 10px; color: #64748b;">Folio: INF-IOT-2026-MAULE • Predio: Fundo Meniels (Parral, Maule Sur)</div>
                  </div>
                  <span style="background: #ecfdf5; color: #047857; border: 1px solid #10b981; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">
                    SAG / DGA MEE Conforme • GlobalGAP Apto
                  </span>
                </div>

                <!-- Estratos de Suelo Multi-Capa (0-20cm, 20-60cm, 60-100cm) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-family: monospace; font-size: 10px;">
                  <div style="background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0; text-align: center;">
                    <span style="color: #64748b; display: block; font-size: 9px;">Estrato 0-20cm (Superficie)</span>
                    <strong style="color: #0284c7; font-size: 14px;">${(overlay.simMoisture * 0.75).toFixed(1)}%</strong>
                    <span style="color: #64748b; font-size: 8.5px; display: block;">Evaporación activa</span>
                  </div>
                  <div style="background: #f0fdf4; padding: 8px; border-radius: 6px; border: 1px solid #bbf7d0; text-align: center;">
                    <span style="color: #166534; display: block; font-size: 9px;">Estrato 20-60cm (Raíz Activa)</span>
                    <strong style="color: #15803d; font-size: 14px;">${overlay.simMoisture}%</strong>
                    <span style="color: #166534; font-size: 8.5px; display: block;">Capacidad de Campo</span>
                  </div>
                  <div style="background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0; text-align: center;">
                    <span style="color: #64748b; display: block; font-size: 9px;">Estrato 60-100cm (Reserva)</span>
                    <strong style="color: #0f766e; font-size: 14px;">${(overlay.simMoisture * 1.15).toFixed(1)}%</strong>
                    <span style="color: #64748b; font-size: 8.5px; display: block;">Agua profunda estable</span>
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 10.5px;">
                  <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 8px; border-radius: 6px; color: #991b1b;">
                    <strong>1. Heladas de Primavera (Cerezo Lapins):</strong> T. Fruta: -0.8°C / Bulbo Húmedo: -1.5°C. <em>Dictamen:</em> NO activar aspersión antihelada por riesgo de daño evaporativo destructivo. Emplear ventiladores de inversión térmica o calefactores.
                  </div>
                  <div style="background: #fefce8; border: 1px solid #fef08a; padding: 8px; border-radius: 6px; color: #854d0e;">
                    <strong>2. Presión Fúngica (PHYTOS-31):</strong> 11.5 h de mojamiento a 17.2°C cumplen tabla de Mills para Botrytis (82%). <em>Dictamen:</em> Aplicación preventiva de botricida recomendada hoy en franja sin deriva de 16:30 a 19:00 h.
                  </div>
                  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px; border-radius: 6px; color: #166534;">
                    <strong>3. Balance Hídrico & Turno de Canal:</strong> Perfil radicular retiene 4.2 días de agua útil. El turno de canal arriba en 4 días. <em>Dictamen:</em> Mantener bomba de pozo apagada (ahorro $112.000 CLP en energía) y solicitar 32 mm en el turno. Telemetría MEE DGA transmitida OK.
                  </div>
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; color: #334155;">
                    <strong>4. Ventana Fitosanitaria & Cosecha:</strong> Viento calmo (5.2 km/h) permite pulverizar sin deriva hasta las 10:45 h. Alerta preventiva de lluvia (cracking cerezas) a 72h.
                  </div>
                </div>
              </div>
            `}

            <!-- Footer con Botones de Acción de Sensores -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(120,53,15,0.6); padding-top: 12px;">
              <span style="font-size: 11px; color: #a89984; font-family: Georgia, serif;">
                Nodo en foco: <strong>${activeCfg.sensorId}</strong>
              </span>
              <div style="display: flex; gap: 8px;">
                <button id="btnDownloadIoTReport" class="btn-workshop-action" style="padding: 7px 12px; font-size: 11px; font-weight: bold; background: #140b06; border: 1px solid #78350f; color: #fde68a; border-radius: 6px; cursor: pointer;">
                  📥 Descargar Copia Certificada (.txt)
                </button>
                <button id="btnFocusSensorIn3D" class="btn-workshop-action btn-workshop-primary" style="padding: 7px 14px; font-size: 11px; font-weight: bold; background: #d97706; border: 1px solid #f59e0b; color: #ffffff; border-radius: 6px; cursor: pointer;">
                  🎯 Localizar Sensor en Visor 3D
                </button>
              </div>
            </div>
          ` : ''}

          <!-- ================= TAB: ESTRATÉGICO DE PERMACULTURA ================= -->
          ${overlay.activeAdminTab === 'predios' ? `
            <div style="background: #24140b; padding: 14px 16px; border-radius: 12px; border: 1px solid #78350f; display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 20px;">📜</span>
                  <div>
                    <span style="font-family: Georgia, serif; font-weight: bold; color: #fbbf24; font-size: 14px;">Plan Maestro & Estratégico de Permacultura:</span>
                    <div style="font-size: 10px; color: #94a3b8;">Evaluación Agroecológica Integral • Curva 5 Años & Zonas 0-5</div>
                  </div>
                </div>
                <select id="selectAdminPredio" style="background: #140b06; color: #fbbf24; border: 1px solid #b45309; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-family: monospace;">
                  <option value="meniels" ${overlay.selectedPredioId === 'meniels' ? 'selected' : ''}>Fundo Estero Colliguay (12.8 ha • Parral)</option>
                  <option value="boldo" ${overlay.selectedPredioId === 'boldo' ? 'selected' : ''}>Fundo El Boldo (18.5 ha • Curicó)</option>
                  <option value="quebrada" ${overlay.selectedPredioId === 'quebrada' ? 'selected' : ''}>Reserva Quebrada Los Boldos (62.0 ha)</option>
                </select>
              </div>

              <!-- 4 Pilares Estratégicos Permaculturales -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-family: monospace; font-size: 10.5px;">
                <div style="background: #150a04; border: 1px solid rgba(16, 185, 129, 0.4); padding: 8px; border-radius: 8px; text-align: center;">
                  <span style="color: #64748b; font-size: 9px; display: block; text-transform: uppercase;">Curva Suelo Vivo</span>
                  <strong style="color: #4ade80; font-size: 13px;">+340% / 5 Años</strong>
                  <div style="color: #94a3b8; font-size: 8.5px; margin-top: 2px;">Microbiología activa</div>
                </div>
                <div style="background: #150a04; border: 1px solid rgba(56, 189, 248, 0.4); padding: 8px; border-radius: 8px; text-align: center;">
                  <span style="color: #64748b; font-size: 9px; display: block; text-transform: uppercase;">Infiltración Keyline</span>
                  <strong style="color: #38bdf8; font-size: 13px;">18.500 m³</strong>
                  <div style="color: #94a3b8; font-size: 8.5px; margin-top: 2px;">Cosecha pluvial gravedosa</div>
                </div>
                <div style="background: #150a04; border: 1px solid rgba(245, 158, 11, 0.4); padding: 8px; border-radius: 8px; text-align: center;">
                  <span style="color: #64748b; font-size: 9px; display: block; text-transform: uppercase;">Ahorro Insumos</span>
                  <strong style="color: #fbbf24; font-size: 13px;">$4.85M CLP/año</strong>
                  <div style="color: #94a3b8; font-size: 8.5px; margin-top: 2px;">Fertilizante 0 + Diésel -65%</div>
                </div>
                <div style="background: #150a04; border: 1px solid rgba(168, 85, 247, 0.4); padding: 8px; border-radius: 8px; text-align: center;">
                  <span style="color: #64748b; font-size: 9px; display: block; text-transform: uppercase;">Retorno Inversión</span>
                  <strong style="color: #c084fc; font-size: 13px;">3.8 Años (ROI)</strong>
                  <div style="color: #94a3b8; font-size: 8.5px; margin-top: 2px;">Punto de equilibrio neto</div>
                </div>
              </div>

              <!-- Gráfica de Regeneración Biológica a 5 Años -->
              <div style="background: #120804; padding: 14px; border-radius: 12px; border: 1px solid rgba(120,53,15,0.8);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <div style="font-family: Georgia, serif; font-size: 13px; font-weight: 800; color: #fff;">
                    📈 Curva de Regeneración Biológica a 5 Años vs. Independencia de Insumos (%)
                  </div>
                  <span style="font-family: monospace; font-size: 9.5px; background: rgba(16,185,129,0.15); color: #34d399; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.3);">
                    Mollison & Yeomans Ground-Truth
                  </span>
                </div>
                <div style="position: relative; height: 165px; width: 100%;">
                  <canvas id="stationDynamicChart"></canvas>
                </div>
              </div>

              <!-- Las 6 Zonas Concéntricas de Bill Mollison (Zonas 0 a 5) -->
              <div style="background: #140b06; padding: 12px; border-radius: 10px; border: 1px solid #92400e; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="color: #fbbf24; font-family: Georgia, serif; font-size: 12px;">🌱 Zonificación de Bill Mollison (Zonas 0 a 5):</strong>
                  <span style="font-size: 9.5px; color: #94a3b8; font-family: monospace;">1 Polígono = 1 Tipo de Uso de Suelo</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; font-size: 10.5px;">
                  <div style="background: #1a0f08; padding: 6px 8px; border-radius: 6px; border-left: 2px solid #ef4444;">
                    <strong style="color: #f87171;">Zona 0: Casa & Centro</strong><br>
                    <span style="color: #94a3b8; font-size: 9.5px;">Casona, taller ciberfísico, IP67 y cocina. Visitas diarias constantes.</span>
                  </div>
                  <div style="background: #1a0f08; padding: 6px 8px; border-radius: 6px; border-left: 2px solid #f97316;">
                    <strong style="color: #fb923c;">Zona 1: Huerta & Hierbas</strong><br>
                    <span style="color: #94a3b8; font-size: 9.5px;">Bancales intensivos, espiral de hierbas y almácigos. Riego diario localizado.</span>
                  </div>
                  <div style="background: #1a0f08; padding: 6px 8px; border-radius: 6px; border-left: 2px solid #eab308;">
                    <strong style="color: #fde047;">Zona 2: Huerto & Aves</strong><br>
                    <span style="color: #94a3b8; font-size: 9.5px;">Cerezos, gallinero móvil, compostaje e invernaderos semi-intensivos.</span>
                  </div>
                  <div style="background: #1a0f08; padding: 6px 8px; border-radius: 6px; border-left: 2px solid #22c55e;">
                    <strong style="color: #4ade80;">Zona 3: Praderas PRV & Cultivos</strong><br>
                    <span style="color: #94a3b8; font-size: 9.5px;">Potreros de rotación Voisin (1.8 UGM/ha), viñedos y tranque Keyline.</span>
                  </div>
                  <div style="background: #1a0f08; padding: 6px 8px; border-radius: 6px; border-left: 2px solid #06b6d4;">
                    <strong style="color: #22d3ee;">Zona 4: Agroforestería & Forraje</strong><br>
                    <span style="color: #94a3b8; font-size: 9.5px;">Cortinas cortaviento, silvopastoreo leñoso y forraje arbóreo. Manejo periódico.</span>
                  </div>
                  <div style="background: #1a0f08; padding: 6px 8px; border-radius: 6px; border-left: 2px solid #a855f7;">
                    <strong style="color: #c084fc;">Zona 5: Bosque Nativo & Silvestre</strong><br>
                    <span style="color: #94a3b8; font-size: 9.5px;">Reserva esclerófila sin intervención humana. Corredor biológico del estero.</span>
                  </div>
                </div>
              </div>

              <!-- Pie con Acción para ir al Mapa 3D -->
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(120,53,15,0.6); padding-top: 8px;">
                <span style="color: #94a3b8; font-size: 10px;">💡 Abre la Barra de Objetos [⚔️ Objetos] en el visor 3D para asentar elementos y ver su impacto What-If.</span>
                <button id="btnJumpMapFromStrategic" class="btn-workshop-action btn-workshop-primary" style="padding: 7px 14px; font-size: 11px; font-weight: bold; background: #16a34a; border: 1px solid #22c55e; color: #ffffff; border-radius: 6px; cursor: pointer;">
                  🌐 Ir al Visor 3D para Diseñar Predio
                </button>
              </div>
            </div>
          ` : ''}

          <!-- ================= TAB: VISOR PREDIAL 3D ================= -->
          ${overlay.activeAdminTab === 'visor3d' ? `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="background: #1f120a; padding: 14px 16px; border-radius: 12px; border: 1px solid #78350f; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="font-family: Georgia, serif; font-size: 14px; font-weight: bold; color: #fff; display: flex; align-items: center; gap: 8px;">
                    <span>🌾</span>
                    <span>Visor Predial 3D & Gemelo Digital (Three.js WebGL)</span>
                  </div>
                  <span style="font-family: monospace; font-size: 10px; background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid #22c55e; padding: 2px 8px; border-radius: 4px;">
                    PBR Shaders • DEM Dinámico
                  </span>
                </div>
                <p style="font-size: 11.5px; color: #cbd5e1; margin: 0; line-height: 1.45;">
                  Centro de mando táctico del gemelo digital: relieve topográfico DEM dinámico, textura de suelo PBR con surcos normales, iluminación solar diurna según coordenadas astronómicas (-36.14°S, Parral) y parcelas extruidas estilo Civ VI con pastoreo rotacional Voisin.
                </p>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 6px; font-family: monospace; font-size: 10.5px;">
                  <div style="background: #140b06; padding: 8px; border-radius: 6px; border: 1px solid #451a03; text-align: center;">
                    <span style="color: #94a3b8; display: block; font-size: 9px;">Superficie</span>
                    <strong style="color: #fbbf24; font-size: 12px;">12.8 ha</strong>
                  </div>
                  <div style="background: #140b06; padding: 8px; border-radius: 6px; border: 1px solid #451a03; text-align: center;">
                    <span style="color: #94a3b8; display: block; font-size: 9px;">Potreros PRV</span>
                    <strong style="color: #4ade80; font-size: 12px;">8 Cuarteles</strong>
                  </div>
                  <div style="background: #140b06; padding: 8px; border-radius: 6px; border: 1px solid #451a03; text-align: center;">
                    <span style="color: #94a3b8; display: block; font-size: 9px;">Tranque Keyline</span>
                    <strong style="color: #38bdf8; font-size: 12px;">18.500 m³</strong>
                  </div>
                  <div style="background: #140b06; padding: 8px; border-radius: 6px; border: 1px solid #451a03; text-align: center;">
                    <span style="color: #94a3b8; display: block; font-size: 9px;">Framerate</span>
                    <strong style="color: #c084fc; font-size: 12px;">60 FPS</strong>
                  </div>
                </div>
              </div>

              <!-- Gráfica NDVI por Cuartel -->
              <div style="background: #120804; padding: 14px; border-radius: 12px; border: 1px solid rgba(120,53,15,0.8);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <div style="font-family: Georgia, serif; font-size: 13px; font-weight: 800; color: #fff;">
                    📊 Índice de Vigor NDVI & Superficie por Cuartel
                  </div>
                  <span style="font-family: monospace; font-size: 9.5px; background: rgba(34,197,94,0.15); color: #4ade80; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(34,197,94,0.3);">
                    Sentinel-2 + Calibración Terrestre
                  </span>
                </div>
                <div style="position: relative; height: 165px; width: 100%;">
                  <canvas id="stationDynamicChart"></canvas>
                </div>
              </div>

              <!-- Acciones Directas 3D -->
              <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid rgba(120,53,15,0.6); padding-top: 12px;">
                <button id="btnToggleCampaignFromAdmin" class="btn-workshop-action" style="padding: 8px 14px; font-size: 11px; font-weight: bold; background: #140b06; border: 1px solid #78350f; color: #fde68a; border-radius: 6px; cursor: pointer;">
                  🗺️ Alternar Tablón de Misión
                </button>
                <button id="btnEnter3DFromAdmin" class="btn-workshop-action btn-workshop-primary" style="padding: 8px 16px; font-size: 11px; font-weight: bold; background: linear-gradient(135deg, #f59e0b, #d97706); color: #1e1103; border-radius: 6px; cursor: pointer;">
                  🌾 Entrar al Gemelo Digital 3D (Vuelo Libre)
                </button>
              </div>
            </div>
          ` : ''}

          <!-- ================= TAB: MOSAICO & LINDEROS PREDIALES ================= -->
          ${overlay.activeAdminTab === 'map' ? `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <!-- Selector de Predio & Sub-pestañas -->
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; gap: 6px;">
                  <button class="prop-registry-tab-btn ${propSubTab === 'titles' ? 'active' : ''}" data-prop-tab="titles" style="padding: 6px 10px; border-radius: 6px; font-size: 10.5px; font-weight: bold; cursor: pointer; border: 1px solid ${propSubTab === 'titles' ? '#fbbf24' : 'rgba(120,53,15,0.5)'}; background: ${propSubTab === 'titles' ? 'rgba(245,158,11,0.2)' : 'rgba(25,14,8,0.7)'}; color: ${propSubTab === 'titles' ? '#fde68a' : '#cbd5e1'};">
                    🏛️ Títulos & CBR
                  </button>
                  <button class="prop-registry-tab-btn ${propSubTab === 'legal' ? 'active' : ''}" data-prop-tab="legal" style="padding: 6px 10px; border-radius: 6px; font-size: 10.5px; font-weight: bold; cursor: pointer; border: 1px solid ${propSubTab === 'legal' ? '#fbbf24' : 'rgba(120,53,15,0.5)'}; background: ${propSubTab === 'legal' ? 'rgba(245,158,11,0.2)' : 'rgba(25,14,8,0.7)'}; color: ${propSubTab === 'legal' ? '#fde68a' : '#cbd5e1'};">
                    ⚖️ Marco Legal & Suelo
                  </button>
                  <button class="prop-registry-tab-btn ${propSubTab === 'survey' ? 'active' : ''}" data-prop-tab="survey" style="padding: 6px 10px; border-radius: 6px; font-size: 10.5px; font-weight: bold; cursor: pointer; border: 1px solid ${propSubTab === 'survey' ? '#fbbf24' : 'rgba(120,53,15,0.5)'}; background: ${propSubTab === 'survey' ? 'rgba(245,158,11,0.2)' : 'rgba(25,14,8,0.7)'}; color: ${propSubTab === 'survey' ? '#fde68a' : '#cbd5e1'};">
                    📐 Topografía & Deslindes
                  </button>
                  <button class="prop-registry-tab-btn ${propSubTab === 'vault' ? 'active' : ''}" data-prop-tab="vault" style="padding: 6px 10px; border-radius: 6px; font-size: 10.5px; font-weight: bold; cursor: pointer; border: 1px solid ${propSubTab === 'vault' ? '#fbbf24' : 'rgba(120,53,15,0.5)'}; background: ${propSubTab === 'vault' ? 'rgba(245,158,11,0.2)' : 'rgba(25,14,8,0.7)'}; color: ${propSubTab === 'vault' ? '#fde68a' : '#cbd5e1'};">
                    📂 Bóveda Documental (${activeProp.documentos.length})
                  </button>
                </div>

                <select id="selectModalPropertyRegistry" style="background: #140b06; color: #fbbf24; border: 1px solid #b45309; padding: 4px 8px; border-radius: 6px; font-size: 10.5px; font-family: monospace;">
                  ${propertyRegistryManager.getAllProperties().map(p => `
                    <option value="${p.id}" ${p.id === activeProp.id ? 'selected' : ''}>
                      ${p.name} (Rol: ${p.rolSII})
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- Contenido Dinámico por Sub-pestaña de Linderos -->
              ${propSubTab === 'titles' ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px;">
                    <strong style="color: #fbbf24; font-size: 12px; display: block; margin-bottom: 4px;">🏛️ Conservador de Bienes Raíces (CBR)</strong>
                    <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
                      • <strong>Jurisdicción:</strong> ${activeProp.cbr.conservador}<br>
                      • <strong>Inscripción:</strong> Fojas ${activeProp.cbr.fojas} N° ${activeProp.cbr.numero} (${activeProp.cbr.ano})<br>
                      • <strong>Superficie Física:</strong> ${activeProp.superficieTotalHa} hectáreas
                    </div>
                  </div>

                  <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px;">
                    <strong style="color: #38bdf8; font-size: 12px; display: block; margin-bottom: 4px;">📑 Servicio de Impuestos Internos (SII)</strong>
                    <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
                      • <strong>Rol de Avalúo:</strong> ${activeProp.rolSII}<br>
                      • <strong>Destino:</strong> ${activeProp.serieSII}<br>
                      • <strong>Avalúo Fiscal:</strong> $${activeProp.avaluoFiscalCLP.toLocaleString('es-CL')} CLP
                    </div>
                  </div>
                </div>

                <div style="background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(14, 165, 233, 0.4); border-radius: 10px; padding: 12px; font-size: 11px;">
                  <strong style="color: #38bdf8; font-size: 12px;">💧 Derechos de Agua DGA:</strong>
                  Caudal: <strong>${activeProp.derechosAgua.caudalTotalLs} L/s</strong> • Fuente: ${activeProp.derechosAgua.fuente} • MEE Res. 1238: <span style="color: #4ade80; font-weight: bold;">${activeProp.derechosAgua.estadoMEE}</span>
                </div>
              ` : ''}

              ${propSubTab === 'legal' ? `
                <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px;">
                  <div style="display: flex; gap: 6px; margin-bottom: 10px; overflow-x: auto;">
                    ${Object.keys(CHILEAN_LAND_LEGAL_FRAMEWORK).map(k => {
                      const fw = CHILEAN_LAND_LEGAL_FRAMEWORK[k];
                      return `
                        <button class="legal-framework-btn ${legalKey === k ? 'active' : ''}" data-legal-key="${k}" style="padding: 4px 8px; border-radius: 6px; border: 1px solid ${legalKey === k ? fw.color : 'rgba(255,255,255,0.1)'}; background: ${legalKey === k ? 'rgba(0,0,0,0.4)' : '#140803'}; color: ${legalKey === k ? fw.color : '#cbd5e1'}; font-size: 10px; font-weight: bold; cursor: pointer; white-space: nowrap;">
                          ${fw.title.split('-')[0].trim()}
                        </button>
                      `;
                    }).join('')}
                  </div>
                  <div style="border-left: 3px solid ${legalFramework.color}; padding-left: 10px;">
                    <h4 style="margin: 0; color: #ffffff; font-size: 12.5px;">${legalFramework.title}</h4>
                    <p style="font-size: 11px; color: #e2e8f0; margin: 4px 0 0 0; line-height: 1.4;">
                      ${legalFramework.summary}
                    </p>
                  </div>
                </div>
              ` : ''}

              ${propSubTab === 'survey' ? `
                <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px;">
                  <strong style="color: #fbbf24; font-size: 12px; display: block; margin-bottom: 8px;">🧭 Deslindes Notariales del Título:</strong>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                    <div style="background: #120703; padding: 8px; border-radius: 6px; border-left: 3px solid #38bdf8;"><strong>NORTE:</strong> ${activeProp.deslindes.norte}</div>
                    <div style="background: #120703; padding: 8px; border-radius: 6px; border-left: 3px solid #f59e0b;"><strong>SUR:</strong> ${activeProp.deslindes.sur}</div>
                    <div style="background: #120703; padding: 8px; border-radius: 6px; border-left: 3px solid #10b981;"><strong>ESTE:</strong> ${activeProp.deslindes.este}</div>
                    <div style="background: #120703; padding: 8px; border-radius: 6px; border-left: 3px solid #c084fc;"><strong>OESTE:</strong> ${activeProp.deslindes.oeste}</div>
                  </div>
                </div>
              ` : ''}

              ${propSubTab === 'vault' ? `
                <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: #fbbf24; font-size: 12px;">📂 Documentos Custodiados en Bóveda (${activeProp.documentos.length}):</strong>
                    <button id="btnTriggerUploadLegalDoc" style="padding: 4px 8px; background: rgba(16,185,129,0.2); border: 1px solid #10b981; color: #34d399; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">
                      + Cargar Documento
                    </button>
                    <input type="file" id="inputUploadLegalDoc" style="display: none;" accept=".pdf,.dwg,.txt">
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${activeProp.documentos.map(d => `
                      <div style="display: flex; justify-content: space-between; align-items: center; background: #120703; padding: 8px 10px; border-radius: 6px; font-size: 11px;">
                        <div>
                          <strong style="color: #ffffff;">📄 ${d.nombre}</strong>
                          <div style="font-size: 9.5px; color: #94a3b8;">${d.tipo} • ${d.tamano} • ${d.fecha}</div>
                        </div>
                        <div style="display: flex; gap: 6px;">
                          <button class="btn-download-vault-doc" data-doc-name="${d.nombre}" style="padding: 3px 6px; background: #27150c; border: 1px solid #78350f; color: #fbbf24; border-radius: 4px; font-size: 10px; cursor: pointer;">Descargar</button>
                          <button class="btn-delete-vault-doc" data-doc-id="${d.id}" style="padding: 3px 6px; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #f87171; border-radius: 4px; font-size: 10px; cursor: pointer;">&times;</button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Gráfica de Linderos & Vecinos -->
              <div style="background: #120804; padding: 14px; border-radius: 12px; border: 1px solid rgba(120,53,15,0.8);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <div style="font-family: Georgia, serif; font-size: 13px; font-weight: 800; color: #fff;">
                    📊 Conformidad Legal y Superficie de Predios Vecinos Contiguos
                  </div>
                  <span style="font-family: monospace; font-size: 9.5px; background: rgba(56,189,248,0.15); color: #38bdf8; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3);">
                    Mosaico Territorial 15x11
                  </span>
                </div>
                <div style="position: relative; height: 165px; width: 100%;">
                  <canvas id="stationDynamicChart"></canvas>
                </div>
              </div>

              <!-- Footer Acciones de Linderos -->
              <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid rgba(120,53,15,0.6); padding-top: 12px;">
                <button id="btnDownloadConsolidatedReport" class="btn-workshop-action" style="padding: 7px 12px; font-size: 11px; font-weight: bold; background: #140b06; border: 1px solid #78350f; color: #fde68a; border-radius: 6px; cursor: pointer;">
                  📥 Descargar Dossier Legal (.txt)
                </button>
                <button id="btnFocusPredioIn3D" class="btn-workshop-action btn-workshop-primary" style="padding: 7px 14px; font-size: 11px; font-weight: bold; background: #d97706; border: 1px solid #f59e0b; color: #ffffff; border-radius: 6px; cursor: pointer;">
                  🎯 Enfocar Límites en Visor 3D
                </button>
              </div>
            </div>
          ` : ''}

          <!-- ================= TAB: LIBRO DE REGISTROS ESG, MRV & GANADERÍA ================= -->
          ${overlay.activeAdminTab === 'vault' ? `
            <div style="background: #24140b; padding: 14px 16px; border-radius: 12px; border: 1px solid #78350f; display: flex; flex-direction: column; gap: 12px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-family: Georgia, serif; font-weight: bold; color: #fbbf24; font-size: 14px;">MRV Ledger & Pasaporte Verde Predial:</span>
                <span style="color: #4ade80; font-family: monospace; font-weight: bold; background: rgba(16,185,129,0.2); padding: 2px 8px; border-radius: 4px; border: 1px solid #10b981;">100% EUDR Cero Deforestación</span>
              </div>
              <p style="color: #d6c4a8; margin: 0; line-height: 1.45;">
                Libro de contabilidad de carbono y biodiversidad verificado mediante línea base satelital Sentinel-2 (Diciembre 2020) y sensores in situ. Permite la emisión de créditos auditados y pasaportes digitales para exportación.
              </p>
              <div style="background: #140b06; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 11px; color: #fbbf24; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                <div>Hash MRV: <strong>0x8f2d4a19c6e</strong></div>
                <div>Balance Carbono: <strong>4.8 tCO2e/ha/año</strong></div>
                <div>Integridad Ecológica (IEI): <strong>0.88 / 1.00</strong></div>
              </div>

              <!-- Gráfica Dinámica Histórica ESG -->
              <div style="background: #120804; padding: 14px; border-radius: 12px; border: 1px solid rgba(120,53,15,0.8);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <div style="font-family: Georgia, serif; font-size: 13px; font-weight: 800; color: #fff;">
                    📊 Evolución de Secuestro de Carbono (tCO2e/ha) & Índice IEI
                  </div>
                  <span style="font-family: monospace; font-size: 9.5px; background: rgba(16,185,129,0.15); color: #34d399; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.3);">
                    Certificación 2020-2025
                  </span>
                </div>
                <div style="position: relative; height: 165px; width: 100%;">
                  <canvas id="stationDynamicChart"></canvas>
                </div>
              </div>

              <!-- Ganadería Regenerativa PRV -->
              <div style="background: #140b06; padding: 10px 12px; border-radius: 8px; border-left: 3px solid #f59e0b; font-size: 11px; color: #d6c4a8; line-height: 1.45;">
                <strong style="color: #fde047; display: block; margin-bottom: 2px;">🐄 Ganadería Regenerativa (PRV) & Censo Predial:</strong>
                • <strong>Bovinos:</strong> 6 vacas Clavel Alemán y Angus en pasturas polifíticas.<br>
                • <strong>Ovinos:</strong> 5 ovejas Suffolk Down en cuadro P5.<br>
                • <strong>Gallinas:</strong> 60 ponedoras en Egg Mobile sanitario P8.<br>
                • <strong>Carga Global:</strong> 1.8 UGM/ha con rotación estricta bajo las 4 Leyes de André Voisin.
              </div>

              <!-- ================= ENLACE CENTRALIZADO AL VAULT DE DOCUMENTACIÓN EN EL HUB ================= -->
              <div style="background: #140b06; border: 1.5px solid #d97706; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(180,83,9,0.4); padding-bottom: 10px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 24px;">🏛️</span>
                    <div>
                      <strong style="color: #fbbf24; font-size: 13.5px; font-family: Georgia, serif;">Centro de Documentación Técnica & Arquitectura C2 (Vault Central)</strong>
                      <div style="font-size: 10px; color: #94a3b8;">La documentación técnica completa y los diagramas vectoriales residen en la Bóveda del Hub.</div>
                    </div>
                  </div>
                  <span style="font-family: monospace; font-size: 9.5px; background: rgba(245,158,11,0.2); color: #fbbf24; padding: 2px 8px; border-radius: 4px; border: 1px solid #d97706;">Bóveda Central</span>
                </div>

                <p style="font-size: 11px; color: #cbd5e1; margin: 0; line-height: 1.5;">
                  El <strong>Stack Tecnológico</strong> (JS ESM, GLSL Sobel, R3F, Node.js, ESP32, WebRTC) y los <strong>4 Diagramas Arquitectónicos Vectoriales</strong> (Arquitectura 3 Capas, Ciclo EventBus, Mapa de Ecosistema y Visión & Drones C2) han sido trasladados y centralizados en el <strong>Asset & Knowledge Vault</strong> de la suite Hub.
                </p>

                <div style="display: flex; gap: 8px; margin-top: 4px;">
                  <button id="btnOpenCentralVaultFromAdmin" class="btn-workshop-action btn-workshop-primary" style="flex: 1; padding: 9px 14px; font-size: 11.5px; font-weight: bold; background: linear-gradient(135deg, #d97706, #b45309); border: 1px solid #f59e0b; color: #ffffff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.4);" onclick="window.open('http://localhost:7777/?view=docs&tab=vault', '_blank')">
                    📚 Abrir Vault de Documentación en AgriTwin Hub (:7777) ↗
                  </button>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- ================= TAB: RED TERRITORIAL & APRS ================= -->
          ${overlay.activeAdminTab === 'territorial' ? `
            <div style="background: #24140b; padding: 14px 16px; border-radius: 12px; border: 1px solid #78350f; display: flex; flex-direction: column; gap: 12px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-family: Georgia, serif; font-weight: bold; color: #fbbf24; font-size: 14px;">Red Territorial Comunal & Agua Potable Rural (APR):</span>
                <span style="color: #38bdf8; font-family: monospace; font-weight: bold; background: rgba(56,189,248,0.2); padding: 2px 8px; border-radius: 4px; border: 1px solid #0284c7;">1.420 Familias Conectadas</span>
              </div>
              <p style="color: #d6c4a8; margin: 0; line-height: 1.45;">
                Estación de enlace territorial: semáforo de recarga de acuíferos para Comités de Agua Potable Rural (APR), índice de riesgo de incendios forestales FWI y planificación colaborativa de cortafuegos.
              </p>

              <!-- Gráfica Dinámica FWI vs Acuífero -->
              <div style="background: #120804; padding: 14px; border-radius: 12px; border: 1px solid rgba(120,53,15,0.8);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <div style="font-family: Georgia, serif; font-size: 13px; font-weight: 800; color: #fff;">
                    📊 Riesgo de Incendios FWI vs. Nivel Freático del Acuífero (%)
                  </div>
                  <span style="font-family: monospace; font-size: 9.5px; background: rgba(239,68,68,0.15); color: #f87171; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(239,68,68,0.3);">
                    Alerta Viento Puelche
                  </span>
                </div>
                <div style="position: relative; height: 165px; width: 100%;">
                  <canvas id="stationDynamicChart"></canvas>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(120,53,15,0.6); padding-top: 10px;">
                <span style="color: #94a3b8; font-size: 10.5px;">Cortafuegos preventivos trazados: <strong>14.2 km</strong></span>
                <button id="btnJumpTerritorial" class="btn-workshop-action btn-workshop-primary" style="padding: 7px 14px; font-size: 11px; font-weight: bold; background: #d97706; border: 1px solid #f59e0b; color: #ffffff; border-radius: 6px; cursor: pointer;">
                  🌐 Volar a Vista Territorial (El Cerro / APRs)
                </button>
              </div>
            </div>
          ` : ''}

          <!-- ================= TAB: CAJA DE HERRAMIENTAS & SCRIPTS ================= -->
          ${overlay.activeAdminTab === 'scripts' ? `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <!-- Sección 1: Modelos Biofísicos & Shaders 3D (Migrados desde Libreta Biofísica) -->
              <div style="background: #24140b; border: 1px solid #78350f; border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">🌱</span>
                    <div>
                      <strong style="color: #fbbf24; font-size: 13px; font-family: Georgia, serif;">Modelos Biofísicos & Shaders 3D (Unificados):</strong>
                      <div style="font-size: 9.5px; color: #94a3b8;">FAO-56 • 3 Estratos Radiculares • PBR WebGL • Vegetación Instanciada</div>
                    </div>
                  </div>
                  <span style="font-family: monospace; font-size: 9px; color: #4ade80; background: rgba(74,222,128,0.15); border: 1px solid #10b981; padding: 2px 6px; border-radius: 4px;">60 FPS Activo</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                  <div style="background: #150a04; padding: 8px 10px; border-radius: 8px; border-left: 3px solid #10b981; color: #d6c4a8; line-height: 1.45;">
                    <strong style="color: #6ee7b7; display: block; margin-bottom: 2px;">💧 FAO-56 Penman-Monteith:</strong>
                    ETc = ETo × Kc. Modela la evapotranspiración de referencia horaria cruzada con balance en 3 estratos (0-20, 20-60, 60-100 cm) en suelo franco-arcilloso del Maule.
                  </div>
                  <div style="background: #150a04; padding: 8px 10px; border-radius: 8px; border-left: 3px solid #38bdf8; color: #d6c4a8; line-height: 1.45;">
                    <strong style="color: #7dd3fc; display: block; margin-bottom: 2px;">🎨 Shaders GLSL PBR & DEM:</strong>
                    Normales Sobel procedurales para rugosidad de arado, gradiente de humedad volumétrica dinámica y sombra PCF 4K sobre ortofoto Esri.
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; background: #180c06; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(180,83,9,0.3);">
                  <div style="font-size: 10.5px; color: #cbd5e1;">
                    📐 <strong>Dossier Ejecutivo de Obra:</strong> 18.500 m³ Keyline, replanteo topográfico y cubicación de tranque.
                  </div>
                  <button id="btnOpenDossierFromPredios" class="btn-workshop-action" style="padding: 5px 12px; background: #b45309; border: 1px solid #f59e0b; color: #ffffff; font-weight: bold; font-size: 10.5px; border-radius: 6px; cursor: pointer;">
                    📐 Abrir Dossier de Obra
                  </button>
                </div>
              </div>

              <!-- Sección 2: Comandos de Terminal & Automatización -->
              <div style="background: #1c0e07; border: 1px solid #78350f; border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;">
                <span style="font-family: Georgia, serif; font-weight: bold; color: #fbbf24; font-size: 13px;">Comandos de Terminal & Automatización (1-Click Copy):</span>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <div style="background: #140803; padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(120,53,15,0.6); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 11px; color: #ffffff; font-weight: bold;">Lanzador AgriTwin 3D</div>
                      <code style="font-size: 10px; color: #fbbf24; font-family: monospace;">node agritwin/server.cjs</code>
                    </div>
                    <button class="btn-copy-cmd" data-cmd="node agritwin/server.cjs" style="padding: 4px 8px; background: #b45309; color: #fff; border: none; border-radius: 4px; font-size: 10px; cursor: pointer;">Copiar</button>
                  </div>

                  <div style="background: #140803; padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(120,53,15,0.6); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 11px; color: #ffffff; font-weight: bold;">Lanzador Cuenca Regional</div>
                      <code style="font-size: 10px; color: #fbbf24; font-family: monospace;">node agritwin-regional/server.cjs</code>
                    </div>
                    <button class="btn-copy-cmd" data-cmd="node agritwin-regional/server.cjs" style="padding: 4px 8px; background: #b45309; color: #fff; border: none; border-radius: 4px; font-size: 10px; cursor: pointer;">Copiar</button>
                  </div>
                </div>

                <!-- Gráfica Rendimiento 3D -->
                <div style="background: #120804; padding: 12px; border-radius: 10px; border: 1px solid rgba(120,53,15,0.8); margin-top: 4px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <div style="font-family: Georgia, serif; font-size: 12.5px; font-weight: 800; color: #fff;">
                      📊 Auditoría de Rendimiento WebGL vs. Umbral Seguro
                    </div>
                    <span style="font-family: monospace; font-size: 9px; background: rgba(168,85,247,0.15); color: #c084fc; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(168,85,247,0.3);">
                      PBR Benchmark 60 FPS
                    </span>
                  </div>
                  <div style="position: relative; height: 155px; width: 100%;">
                    <canvas id="stationDynamicChart"></canvas>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- ================= TAB: ÁRBOL DE ARCHIVOS ================= -->
          ${overlay.activeAdminTab === 'tree' ? `
            <div style="background: #24150d; padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(120,53,15,0.6); font-size: 11px; color: #fde68a;">
              <strong>Arquitectura Unificada</strong>: Todo componente corre mapeado a las estaciones diegéticas.
            </div>
            <div class="file-tree-container" style="max-height: 320px; overflow-y: auto;">
              <div class="file-tree-node folder">📁 agritwin/</div>
              <div class="file-tree-children">
                <div class="file-tree-node folder">📁 js/</div>
                <div class="file-tree-children">
                  <div class="file-tree-node file">📄 app.js (Orquestador Three.js)</div>
                  <div class="file-tree-node file" style="color: #fbbf24;">📄 AgroWorkshopOverlay.js (Taller AoE & Panel Maestro)</div>
                  <div class="file-tree-node file">📄 MapManager.js (PBR & Relieve)</div>
                  <div class="file-tree-node file">📄 SimulationEngine.js (FAO-56)</div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- ================= TAB: MOTORES & AUDITORÍA ================= -->
          ${overlay.activeAdminTab === 'engines' ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="background: #1f120a; padding: 12px; border-radius: 8px; border: 1px solid #78350f; font-size: 11px;">
                <strong style="color: #fbbf24; font-size: 12px; display: block; margin-bottom: 4px;">💻 Motor Gráfico 3D (Three.js WebGL)</strong>
                <p style="color: #cbd5e1; margin: 0 0 8px 0; line-height: 1.4;">
                  Sombreadores PBR con relieve DEM dinámico, surcos normales de suelo y sombreado solar diurno.
                </p>
                <button id="btnAdminLaunchEngineInspector" class="btn-workshop-action" style="width: 100%; justify-content: center; background: rgba(168, 85, 247, 0.25); border-color: rgba(168, 85, 247, 0.6); color: #c084fc; font-weight: bold;">
                  ⚙️ Abrir Inspector 3D (Shift+D / I)
                </button>
              </div>

              <div style="background: #1f120a; padding: 12px; border-radius: 8px; border: 1px solid #78350f; font-size: 11px;">
                <strong style="color: #fbbf24; font-size: 12px; display: block; margin-bottom: 4px;">🌱 Motor Biofísico (FAO-56 Penman)</strong>
                <p style="color: #cbd5e1; margin: 0 0 8px 0; line-height: 1.4;">
                  Balance hídrico estratificado (0-20cm, 20-60cm, 60-100cm) y estrés CWSI acoplado a la cuenca.
                </p>
                <button id="btnAdminLaunchBioSim" class="btn-workshop-action" style="width: 100%; justify-content: center; background: rgba(245, 158, 11, 0.25); border-color: rgba(245, 158, 11, 0.6); color: #fde047; font-weight: bold;">
                  🔬 Ver Motor Biofísico FAO-56
                </button>
              </div>

              <div style="background: #1f120a; padding: 12px; border-radius: 8px; border: 1px solid #78350f; font-size: 11px;">
                <strong style="color: #fbbf24; font-size: 12px; display: block; margin-bottom: 4px;">🌪️ Dinámica de Vientos Orográficos</strong>
                <p style="color: #cbd5e1; margin: 0 0 8px 0; line-height: 1.4;">
                  Microescala DEM: Puelche catabático, Brisa marina, Drenaje nocturno y Chorro fluvial.
                </p>
                <button id="btnAdminLaunchWindModal" class="btn-workshop-action" style="width: 100%; justify-content: center; background: rgba(245, 158, 11, 0.25); border-color: rgba(245, 158, 11, 0.6); color: #fbbf24; font-weight: bold;">
                  📖 Ver Fundamento de Corrientes
                </button>
              </div>

              <div style="background: #1f120a; padding: 12px; border-radius: 8px; border: 1px solid #78350f; font-size: 11px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="color: #fbbf24; font-size: 12px;">🍎 Motor Decisiones Maule Sur & Caja de Terreno IP67</strong>
                  <span style="font-size: 9.5px; color: #38bdf8; font-family: monospace; background: rgba(56,189,248,0.2); padding: 2px 6px; border-radius: 4px;">ESP32 + TFT + Relés</span>
                </div>
                <p style="color: #cbd5e1; margin: 0 0 8px 0; line-height: 1.45;">
                  <strong>Arquitectura de Campo Emulada:</strong> Gabinete IP67 con cerebro ESP32 y display TFT 3.5" (ILI9341). Conecta el macro-clima de <strong>OpenWeatherMap</strong> con sensores reales in situ (FDR, bulbo húmedo Stull, PHYTOS-31 Mills).
                  Los datos de entrada gobiernan interbloqueos de seguridad automáticos sobre el <strong>Banco de Relés e Interruptores</strong> (riego goteo, aspersión antihelada, bebederos y cortinas de galpón).
                </p>
                <div style="display: flex; gap: 6px;">
                  <button id="btnAdminOpenMauleIoTBoard" class="btn-workshop-action" style="flex: 1; justify-content: center; background: rgba(16, 185, 129, 0.25); border-color: rgba(16, 185, 129, 0.6); color: #6ee7b7; font-weight: bold;">
                    📟 Abrir Gabinete IP67 (Sprite)
                  </button>
                  <button class="admin-tab-btn" data-tab="sensors" style="flex: 1; justify-content: center; background: rgba(245, 158, 11, 0.25); border-color: rgba(245, 158, 11, 0.6); color: #fde047; font-weight: bold;">
                    📡 Telemetría Sensores
                  </button>
                </div>
              </div>

              <!-- NUEVO: 8 Momentos Climáticos, Leyenda & Analizador AOI de Cuenca -->
              <div style="background: #1f120a; padding: 12px; border-radius: 8px; border: 1px solid #78350f; font-size: 11px; grid-column: span 2;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="color: #fbbf24; font-size: 12px;">🎯 8 Momentos Climáticos & Analizador de Área (AOI Libre)</strong>
                  <span style="font-size: 9.5px; color: #34d399; font-family: monospace; background: rgba(16,185,129,0.2); padding: 2px 6px; border-radius: 4px;">Sincronizado Cuenca 2026</span>
                </div>
                <p style="color: #cbd5e1; margin: 0 0 8px 0; line-height: 1.45;">
                  <strong>Fundamento del Modelo Espacial:</strong> Permite simular los 8 momentos biofísicos canónicos (Puelche FWI 52, Río Atmosférico T=100 145mm, Megasequía, Ola de Calor 38°C, Heladas -3.8°C, etc.) y correrlos sobre <strong>cualquier área libre (AOI)</strong> trazada en el mapa con cálculo automático de superficie (ha), cota DEM y riesgo biofísico.
                  Incluye <strong>leyenda dinámica integrada</strong> para FWI CONAF, amenazas de crecida DGA y recoloración reactiva del mosaico predial.
                </p>
                <div style="display: flex; gap: 8px; font-family: monospace; font-size: 10px;">
                  <span style="background: rgba(245,158,11,0.15); color: #fbbf24; padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(245,158,11,0.3);">
                    📖 docs/DINAMICA_CLIMATICA_ESCENARIOS_CUENCA.md
                  </span>
                  <span style="background: rgba(56,189,248,0.15); color: #38bdf8; padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3);">
                    📐 Analizador AOI: Leaflet Bounds + DEM + Van Wagner FWI
                  </span>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- ================= TAB: REGLA DE DISEÑO VISUAL AOE II (6 RAMAS) ================= -->
          ${overlay.activeAdminTab === 'design' ? `
            <div style="display: flex; flex-direction: column; gap: 14px;">
              <!-- Cabecera de la Regla -->
              <div style="background: rgba(36, 19, 10, 0.95); padding: 14px 18px; border-radius: 12px; border: 1px solid #b45309; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-family: monospace; font-size: 10px; font-weight: 800; color: #fbbf24; background: #451a03; padding: 2px 6px; border-radius: 4px; border: 1px solid #92400e;">
                      NORMATIVA UI/UX DIEGÉTICA • AOE II
                    </span>
                    <strong style="color: #ffffff; font-size: 14px; font-family: Georgia, serif;">Regla Visual Unificada de Menús de Campaña (6 Ramas)</strong>
                  </div>
                  <div style="font-size: 11px; color: #d6c4a8; margin-top: 4px;">
                    Estandariza los botones entre Modo Predio (siempre activos, cromática unificada) y Modo Cuenca (gran formato, densidad técnica y tooltips enriquecidos).
                  </div>
                </div>
                <span style="font-size: 26px;">🎨</span>
              </div>

              <!-- Los 3 Pilares de la Regla -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                <div style="background: rgba(13, 19, 34, 0.9); border: 1px solid rgba(245, 158, 11, 0.45); border-radius: 10px; padding: 12px;">
                  <span style="font-family: monospace; font-size: 10px; font-weight: 800; color: #fbbf24; display: block; margin-bottom: 4px;">
                    1. CROMÁTICA MATRIZ
                  </span>
                  <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
                    • <strong>Fondo común:</strong> Obsidiana & Madera profunda (<code>#0d1322</code>).<br>
                    • <strong>Borde común:</strong> Latón pulido (<code>#f59e0b / 0.45</code>).<br>
                    • <strong>Cero dispersión:</strong> El color de la rama se reserva solo para el código de nodo y el ping dot.
                  </div>
                </div>

                <div style="background: rgba(13, 19, 34, 0.9); border: 1px solid rgba(245, 158, 11, 0.45); border-radius: 10px; padding: 12px;">
                  <span style="font-family: monospace; font-size: 10px; font-weight: 800; color: #fde047; display: block; margin-bottom: 4px;">
                    2. REPOSO ACTIVO (100% VISIBLE)
                  </span>
                  <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
                    • <strong>Siempre en pantalla:</strong> No requiere hover para encontrarlo.<br>
                    • <strong>Ancho intermedio:</strong> 135px a 155px de cartela fija.<br>
                    • <strong>Tríada informativa:</strong> [Icono] + [Título Estación] + [Métrica Numérica en Vivo].
                  </div>
                </div>

                <div style="background: rgba(13, 19, 34, 0.9); border: 1px solid rgba(245, 158, 11, 0.45); border-radius: 10px; padding: 12px;">
                  <span style="font-family: monospace; font-size: 10px; font-weight: 800; color: #38bdf8; display: block; margin-bottom: 4px;">
                    3. HOVER TÁCTICO ENRIQUECIDO
                  </span>
                  <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
                    • <strong>Cartela flotante:</strong> Despliegue de resumen de 2 líneas.<br>
                    • <strong>Micro-física AoE:</strong> Ligero balanceo (sway) y halo áureo.<br>
                    • <strong>Call to action:</strong> "▶ Clic para interactuar / abrir inspector".
                  </div>
                </div>
              </div>

              <!-- Tabla Matriz de las 6 Ramas -->
              <div style="background: #190f08; border: 1px solid #78350f; border-radius: 10px; padding: 12px; overflow-x: auto;">
                <strong style="font-size: 11.5px; color: #fbbf24; display: block; margin-bottom: 8px; font-family: Georgia, serif;">
                  📋 Despliegue de las 6 Ramas del Ecosistema AgriTwin
                </strong>
                <table style="width: 100%; font-size: 10.5px; border-collapse: collapse; text-align: left; font-family: 'JetBrains Mono', monospace;">
                  <thead>
                    <tr style="border-bottom: 1px solid #78350f; color: #94a3b8;">
                      <th style="padding: 6px 8px;">Rama</th>
                      <th style="padding: 6px 8px;">Escena de Fondo</th>
                      <th style="padding: 6px 8px;">Código</th>
                      <th style="padding: 6px 8px;">Acento Ping</th>
                      <th style="padding: 6px 8px;">Métrica Visible en Reposo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid rgba(120,53,15,0.3);">
                      <td style="padding: 6px 8px; font-weight: bold; color: #f8fafc;">1. El Galpón Predial</td>
                      <td style="padding: 6px 8px; color: #cbd5e1;">workshop_bg.png</td>
                      <td style="padding: 6px 8px; color: #fbbf24;">RAMA-PREDIO-01</td>
                      <td style="padding: 6px 8px; color: #fbbf24;">#fbbf24 (Ámbar)</td>
                      <td style="padding: 6px 8px; color: #fde047;">Humedad 37.2% VWC • Bulbo 1.2m</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(120,53,15,0.3);">
                      <td style="padding: 6px 8px; font-weight: bold; color: #f8fafc;">2. Invernadero & Cultivos</td>
                      <td style="padding: 6px 8px; color: #cbd5e1;">invernadero_landing_bg.jpg</td>
                      <td style="padding: 6px 8px; color: #34d399;">RAMA-CULT-02</td>
                      <td style="padding: 6px 8px; color: #34d399;">#34d399 (Esmeralda)</td>
                      <td style="padding: 6px 8px; color: #a7f3d0;">840 Plántulas • LER 1.34 (+34%)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(120,53,15,0.3);">
                      <td style="padding: 6px 8px; font-weight: bold; color: #f8fafc;">3. Establo & Ganadería PRV</td>
                      <td style="padding: 6px 8px; color: #cbd5e1;">establo_landing_bg.jpg</td>
                      <td style="padding: 6px 8px; color: #f59e0b;">RAMA-GANAD-03</td>
                      <td style="padding: 6px 8px; color: #f59e0b;">#f59e0b (Caramelo)</td>
                      <td style="padding: 6px 8px; color: #fde68a;">Potrero P4 • 2.850 kg MS • Clarita</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(120,53,15,0.3);">
                      <td style="padding: 6px 8px; font-weight: bold; color: #f8fafc;">4. Incursión a Campo</td>
                      <td style="padding: 6px 8px; color: #cbd5e1;">incursion_landing_bg.jpg</td>
                      <td style="padding: 6px 8px; color: #a3e635;">RAMA-REWILD-04</td>
                      <td style="padding: 6px 8px; color: #a3e635;">#a3e635 (Lima)</td>
                      <td style="padding: 6px 8px; color: #d9f99d;">Faja 45m • Zanja Keyline • Esclerófilo</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(120,53,15,0.3);">
                      <td style="padding: 6px 8px; font-weight: bold; color: #f8fafc;">5. La Cumbre del Cerro (Cuenca)</td>
                      <td style="padding: 6px 8px; color: #cbd5e1;">cerro_landing_bg.jpg</td>
                      <td style="padding: 6px 8px; color: #38bdf8;">RAMA-CUENCA-05</td>
                      <td style="padding: 6px 8px; color: #38bdf8;">#38bdf8 (Cielo)</td>
                      <td style="padding: 6px 8px; color: #bae6fd;">Río 124.5 m³/s • FWI 24 • Bullileo 78%</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 8px; font-weight: bold; color: #f8fafc;">6. La Mesa Vecinal DAO</td>
                      <td style="padding: 6px 8px; color: #cbd5e1;">sprite_map_vecinal.png</td>
                      <td style="padding: 6px 8px; color: #818cf8;">RAMA-MESA-06</td>
                      <td style="padding: 6px 8px; color: #818cf8;">#818cf8 (Índigo)</td>
                      <td style="padding: 6px 8px; color: #e0e7ff;">10 Predios • Voto V² • 78% Quórum</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Botón de apertura a la documentación en markdown -->
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); font-size: 11px;">
                <span style="color: #94a3b8; font-family: monospace;">📁 Archivo: docs/REGLA_DISENO_MENUS_CAMPANA_AOE.md</span>
                <span style="color: #10b981; font-weight: bold;">✓ Documentación sincronizada en el sistema</span>
              </div>
            </div>
          ` : ''}

        </div>
      </aside>
    `;
  }
}
