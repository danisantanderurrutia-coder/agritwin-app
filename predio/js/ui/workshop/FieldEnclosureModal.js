/**
 * AgriTwin - FieldEnclosureModal Module
 * 
 * Renderizador diegético del Gabinete Industrial de Terreno IP67:
 *  - Cerebro ESP32 con display TFT ILI9341 3.5"
 *  - Enlace dual: Telemetría simulada vs. Hardware real WiFi/LoRa
 *  - Tablero de relés e interruptores basculantes (AUTO / MANUAL / OFF)
 *  - Interbloqueos agroclimáticos en tiempo real
 */

import { weatherService } from '../../data/WeatherService.js';
import { actuatorManager } from '../../data/ActuatorManager.js';
import { WiringTwinView } from './WiringTwinView.js?v=3.2.0';

const wiringTwinInstance = new WiringTwinView();

export class FieldEnclosureModal {
  static render(overlay, station) {
    if (station?.id === 'station_b') {
      const curBranch = overlay?.selectedEnclosureBranch || 'general';
      const curTab = overlay?.selectedEnclosureTab || 'operation'; // 'operation' | 'wiring'
      const curWeather = weatherService.weatherData || weatherService.getRealisticMauleMock();
      const actuators = actuatorManager.getByBranch(curBranch);

      const branches = [
        { id: 'general', icon: '⭐', label: 'Caja Madre (Predio)' },
        { id: 'cuarteles', icon: '🍇', label: 'Sub-Caja Cuarteles' },
        { id: 'establo', icon: '🐄', label: 'Sub-Caja Establo & PRV' }
      ];

      return `
        <div class="modal-overlay glass-modal-backdrop" style="display: flex; z-index: 70;">
          <div class="station-modal-container industrial-enclosure-box" style="max-width: 900px; width: 95%; border: 3px solid #78350f; background: #1a0f08; box-shadow: 0 10px 40px rgba(0,0,0,0.85); border-radius: 12px; overflow: hidden;">
            
            <!-- Marco Industrial: Gabinete Estanco IP67 con Pernos y Bisagras -->
            <div style="background: linear-gradient(180deg, #2b1810 0%, #1a0e07 100%); padding: 12px 18px; border-bottom: 2px solid #b45309; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 38px; height: 38px; border-radius: 6px; background: #120703; border: 2px solid #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                  📟
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-family: monospace; font-size: 10px; font-weight: 800; color: #fbbf24; background: #451a03; padding: 2px 6px; border-radius: 4px; border: 1px solid #d97706;">
                      GABINETE IP67 • SERIE AGRI-MAULE
                    </span>
                    <h3 style="margin: 0; font-family: Georgia, serif; font-size: 15px; font-weight: 800; color: #ffffff;">
                      Caja de Terreno & Cerebro Agroclimático ESP32
                    </h3>
                  </div>
                  <div style="font-size: 10px; color: #cbd5e1; font-family: monospace;">
                    Nodo Central Fundo Colliguay • Enlace LoRaWAN & OpenWeatherMap
                  </div>
                </div>
              </div>

              <!-- LEDs de Diagnóstico Físico, Selector Modo Sim/Real & Cerrar -->
              <div style="display: flex; align-items: center; gap: 10px;">
                <!-- Conmutador Simulado / Hardware Real -->
                <button id="btnToggleHardwareLinkMode" style="
                  padding: 5px 10px;
                  border-radius: 6px;
                  font-family: monospace;
                  font-size: 10px;
                  font-weight: 800;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  border: 1px solid ${weatherService.linkMode === 'live_hardware' ? '#38bdf8' : '#10b981'};
                  background: ${weatherService.linkMode === 'live_hardware' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.2)'};
                  color: ${weatherService.linkMode === 'live_hardware' ? '#7dd3fc' : '#6ee7b7'};
                  transition: all 0.2s;
                " title="Alternar entre telemetría simulada offline y enlace a ESP32 físico por WiFi/LoRa">
                  <span>${weatherService.linkMode === 'live_hardware' ? '🔌 ENLACE HARDWARE REAL' : '🧪 SIMULACIÓN ACTIVA'}</span>
                  <span style="font-size: 8.5px; opacity: 0.8; background: rgba(0,0,0,0.4); padding: 1px 4px; border-radius: 3px;">(Clic alternar)</span>
                </button>

                <div style="display: flex; gap: 8px; font-size: 9.5px; font-family: monospace; color: #cbd5e1; background: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
                  <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e;"></span>PWR 12V</span>
                  <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: ${weatherService.linkMode === 'live_hardware' ? '#38bdf8' : '#64748b'}; box-shadow: 0 0 6px ${weatherService.linkMode === 'live_hardware' ? '#38bdf8' : '#000'};"></span>LoRa/WiFi</span>
                  <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 6px #f59e0b;"></span>DGA MEE</span>
                </div>
                <button id="btnCloseStationModal" class="btn-workshop-close">&times;</button>
              </div>
            </div>

            <!-- Selector Doble: Pestañas Modo (Operación vs Esquema Conexiones) & Jerarquía de Cajas -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: #140803; border-bottom: 1px solid #78350f; padding: 6px 14px; gap: 8px; overflow-x: auto;">
              
              <!-- Pestaña Principal: Operación vs Cableado Físico -->
              <div style="display: flex; gap: 6px;">
                <button class="enclosure-main-tab-btn ${curTab === 'operation' ? 'active' : ''}" data-tab="operation" style="
                  padding: 6px 12px;
                  border-radius: 6px;
                  font-family: monospace;
                  font-size: 11px;
                  font-weight: bold;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  border: 1px solid ${curTab === 'operation' ? '#f59e0b' : 'rgba(255,255,255,0.1)'};
                  background: ${curTab === 'operation' ? '#b45309' : '#1e1108'};
                  color: #ffffff;
                ">
                  <span>🎛️ Operación & Relés</span>
                </button>
                <button class="enclosure-main-tab-btn ${curTab === 'wiring' ? 'active' : ''}" data-tab="wiring" style="
                  padding: 6px 12px;
                  border-radius: 6px;
                  font-family: monospace;
                  font-size: 11px;
                  font-weight: bold;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  border: 1px solid ${curTab === 'wiring' ? '#38bdf8' : 'rgba(255,255,255,0.1)'};
                  background: ${curTab === 'wiring' ? '#0369a1' : '#1e1108'};
                  color: #ffffff;
                ">
                  <span>🛠️ Esquema de Conexiones Físicas (Pinout)</span>
                </button>
              </div>

              <!-- Selector de Ramas (Cajas) -->
              <div style="display: flex; gap: 6px;">
                ${branches.map(b => {
                  const isCur = b.id === curBranch;
                  return `
                    <button class="enclosure-branch-btn ${isCur ? 'active' : ''}" data-branch-id="${b.id}" style="
                      padding: 5px 10px;
                      border-radius: 6px;
                      font-family: monospace;
                      font-size: 10px;
                      font-weight: bold;
                      display: flex;
                      align-items: center;
                      gap: 4px;
                      cursor: pointer;
                      border: 1px solid ${isCur ? '#f59e0b' : 'rgba(120,53,15,0.5)'};
                      background: ${isCur ? 'rgba(245, 158, 11, 0.25)' : '#1e0e06'};
                      color: ${isCur ? '#fde047' : '#cbd5e1'};
                      transition: all 0.2s;
                    ">
                      <span>${b.icon}</span>
                      <span>${b.label}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Panel Interno del Gabinete -->
            <div style="padding: 16px 20px; overflow-y: auto; max-height: calc(88vh - 170px); display: flex; flex-direction: column; gap: 14px; color: #e6ccb2;">
              
              ${curTab === 'wiring' ? `
                <!-- VISTA PEDAGÓGICA: GEMELO DE CONEXIÓN FÍSICA & PINOUT -->
                ${wiringTwinInstance.renderWiringTab(overlay?.selectedCircuitId)}
              ` : `
                <!-- VISTA DE OPERACIÓN: PANTALLA TFT + BANCO DE RELÉS -->
                <!-- SECCIÓN 1: PANTALLA TFT COLOR 3.5" (ESP32 DISPLAY EMULATOR) -->
                <div style="background: #080d08; border: 3px solid #1e293b; border-radius: 10px; padding: 12px; box-shadow: inset 0 0 20px rgba(0,0,0,0.9); font-family: 'Courier New', Courier, monospace; position: relative;">
                
                <!-- Borde Superior TFT: Estado & Reloj -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #14532d; padding-bottom: 6px; margin-bottom: 10px; font-size: 11px; color: #4ade80;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="background: #14532d; color: #86efac; padding: 1px 6px; border-radius: 3px; font-weight: bold;">TFT-ILI9341 SPI</span>
                    <span>SRC: ${curWeather.source}</span>
                  </div>
                  <div>
                    <span>📡 PING: 42ms • BATT: 98% (Solar)</span>
                  </div>
                </div>

                <!-- Grid TFT: Contraste OpenWeather vs. Microclima Real de Suelo -->
                <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 12px; margin-bottom: 12px;">
                  
                  <!-- Lado Izquierdo: Macroclima OpenWeather -->
                  <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid #1e3a5f; padding: 10px; border-radius: 6px; color: #38bdf8;">
                    <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #7dd3fc; margin-bottom: 4px; display: flex; justify-content: space-between;">
                      <span>🌤️ MACRO-CLIMA (OPENWEATHER API)</span>
                      <span>${curWeather.location}</span>
                    </div>
                    <div style="font-size: 20px; font-weight: bold; color: #ffffff;">
                      ${curWeather.temp}°C <span style="font-size: 11px; font-weight: normal; color: #94a3b8;">(Abrigo 2m)</span>
                    </div>
                    <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 3px;">
                      Condición: <strong>${curWeather.condition}</strong> (${curWeather.cloudCoverPct}% nubes)
                    </div>
                    <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 2px;">
                      Viento: <strong>${curWeather.windSpeedKmH} km/h</strong> (Ráfagas ${curWeather.windGustKmH} km/h)
                    </div>
                    <div style="font-size: 10.5px; color: #fbbf24; margin-top: 4px; background: rgba(245,158,11,0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245,158,11,0.3);">
                      🍒 Pronóstico Lluvia 72h: <strong>${curWeather.rain_mm_forecast} mm</strong> (Prob. ${curWeather.rain_72h_prob}%)
                    </div>
                  </div>

                  <!-- Lado Derecho: Microclima Real Adaptado a la Rama -->
                  <div style="background: rgba(20, 10, 5, 0.85); border: 1px solid #78350f; padding: 10px; border-radius: 6px; color: #fde047;">
                    ${curBranch === 'cuarteles' ? `
                      <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #34d399; margin-bottom: 4px; display: flex; justify-content: space-between;">
                        <span>🍒 SUB-RAMA: CUARTELES & FRUTALES</span>
                        <span>Sector 1</span>
                      </div>
                      <div style="font-size: 20px; font-weight: bold; color: #f87171;">
                        -0.8°C <span style="font-size: 11px; font-weight: normal; color: #fca5a5;">(T. Floración 1.2m)</span>
                      </div>
                      <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 3px;">
                        Ventana Fitosanitaria: <strong style="color: #34d399;">07:30 - 11:30 h</strong> (Deriva segura)
                      </div>
                      <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 2px;">
                        Riesgo Cracking 72h: <strong style="color: #fbbf24;">14.5 mm (75%)</strong>
                      </div>
                      <div style="font-size: 10.5px; color: #fde047; margin-top: 4px; background: rgba(245,158,11,0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245,158,11,0.3);">
                        🍄 Presión Botrytis: <strong>82% (Mills)</strong> • Mojamiento: 11.5 h
                      </div>
                    ` : curBranch === 'establo' ? `
                      <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #fbbf24; margin-bottom: 4px; display: flex; justify-content: space-between;">
                        <span>🐄 SUB-RAMA: ESTABLO & GANADERÍA</span>
                        <span>Galpón PRV</span>
                      </div>
                      <div style="font-size: 20px; font-weight: bold; color: #10b981;">
                        64.2 <span style="font-size: 11px; font-weight: normal; color: #6ee7b7;">(Índice ITH / Confort)</span>
                      </div>
                      <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 3px;">
                        Climatización: <strong style="color: #4ade80;">Zona de Confort Térmico</strong> (Sin estrés)
                      </div>
                      <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 2px;">
                        Bebederos Automáticos: <strong style="color: #38bdf8;">Presurizados P1-P8</strong> (60 L/vaca)
                      </div>
                      <div style="font-size: 10.5px; color: #fde047; margin-top: 4px; background: rgba(245,158,11,0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245,158,11,0.3);">
                        🚪 Portón PRV: <strong>Listo para Rotación a P1</strong> (42d reposo)
                      </div>
                    ` : `
                      <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #fbbf24; margin-bottom: 4px; display: flex; justify-content: space-between;">
                        <span>🌱 MICROCLIMA REAL DE SUELO & FRUTA</span>
                        <span>Hondonada</span>
                      </div>
                      <div style="font-size: 20px; font-weight: bold; color: #f87171;">
                        -0.8°C <span style="font-size: 11px; font-weight: normal; color: #fca5a5;">(T. Fruta a 1.2m)</span>
                      </div>
                      <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 3px;">
                        Bulbo Húmedo (Stull): <strong style="color: #f87171;">-1.5°C</strong> (Drenaje Katabático)
                      </div>
                      <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 2px;">
                        Humedad Suelo FDR: <strong>36.2% VWC</strong> (Perfil radicular 20-60cm)
                      </div>
                      <div style="font-size: 10.5px; color: #34d399; margin-top: 4px; background: rgba(16,185,129,0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.3);">
                        🍃 Mojamiento Foliar: <strong>11.5 h</strong> (Presión Botrytis: 82%)
                      </div>
                    `}
                  </div>

                </div>

                <!-- Gráfica Histórica en Pantalla TFT -->
                <div style="background: #040804; border: 1px solid #14532d; border-radius: 6px; padding: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 10px; color: #4ade80;">
                    <span>📈 TELEMETRÍA 24H: BULBO HÚMEDO VS. ABRIGO 2M</span>
                    <span>TFT REFRESH 60Hz</span>
                  </div>
                  <div style="position: relative; height: 130px; width: 100%;">
                    <canvas id="stationDynamicChart"></canvas>
                  </div>
                </div>

              </div>

              <!-- SECCIÓN 2: BANCO DE INTERRUPTORES BASCLANTES & RELÉS INDUSTRIALES (OUT) -->
              <div style="background: #24130a; border: 2px solid #78350f; border-radius: 10px; padding: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(120,53,15,0.7); padding-bottom: 6px;">
                  <div>
                    <strong style="color: #fde047; font-size: 13px; font-family: Georgia, serif;">
                      🎛️ Banco de Interruptores & Relés de Campo (${actuators.length} Módulos Activos):
                    </strong>
                    <div style="font-size: 10px; color: #cbd5e1;">
                      Conmutación manual o por piloto automático guiado por OpenWeather y sensores de terreno.
                    </div>
                  </div>
                  <span style="font-size: 9.5px; font-family: monospace; background: rgba(0,0,0,0.5); padding: 3px 6px; border-radius: 4px; border: 1px solid #b45309; color: #fde047;">
                    RAMA: ${curBranch.toUpperCase()}
                  </span>
                </div>

                <!-- Lista de Interruptores Basculantes -->
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${actuators.map(act => {
                    const isLockout = !!act.lockoutReason;
                    const modeColor = act.mode === 'auto' ? '#f59e0b' : (act.mode === 'on' ? '#22c55e' : '#ef4444');
                    const ledColor = act.state ? '#22c55e' : '#64748b';
                    
                    return `
                      <div class="actuator-relay-card" style="background: #150a04; border: 1px solid ${isLockout ? '#b91c1c' : '#451a03'}; border-radius: 8px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                        
                        <!-- Info Relé -->
                        <div style="flex: 1;">
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 16px;">${act.icon}</span>
                            <strong style="color: #ffffff; font-size: 12px;">${act.name}</strong>
                            <span style="font-size: 9px; font-family: monospace; background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 3px; color: #cbd5e1;">
                              ${act.voltage} • ${act.kwRating} kW
                            </span>
                          </div>
                          
                          <div style="font-size: 10px; color: #94a3b8; margin-top: 3px;">
                            ${act.category} • <em>${act.autoRule}</em>
                          </div>

                          ${isLockout ? `
                            <div style="margin-top: 4px; font-size: 10px; color: #fca5a5; background: rgba(239,68,68,0.15); padding: 3px 6px; border-radius: 4px; border: 1px solid rgba(239,68,68,0.3);">
                              ⚠️ ${act.lockoutReason}
                            </div>
                          ` : `
                            <div style="margin-top: 3px; font-size: 9.5px; color: #4ade80;">
                              ✓ ${act.impactMessage}
                            </div>
                          `}
                        </div>

                        <!-- Interruptor Basculante Físico -->
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <!-- LED de Estado -->
                            <span style="width: 10px; height: 10px; border-radius: 50%; background: ${ledColor}; box-shadow: 0 0 8px ${ledColor};"></span>
                            
                            <!-- Botón Basculante -->
                            <button class="btn-toggle-actuator-mode" data-act-id="${act.id}" style="
                              padding: 6px 12px;
                              border-radius: 6px;
                              font-family: monospace;
                              font-size: 11px;
                              font-weight: 800;
                              cursor: pointer;
                              border: 1px solid ${modeColor};
                              background: #1e1108;
                              color: ${modeColor};
                              display: flex;
                              align-items: center;
                              gap: 6px;
                              transition: all 0.2s;
                            " onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='#1e1108'">
                              <span>🔘 MODO:</span>
                              <span style="background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px;">${act.mode.toUpperCase()}</span>
                            </button>
                          </div>
                          <span style="font-size: 9px; font-family: monospace; color: #94a3b8;">
                            ESTADO: <strong style="color: ${act.state ? '#4ade80' : '#cbd5e1'};">${act.state ? 'ACTIVADO (ON)' : 'CORTADO (OFF)'}</strong>
                          </span>
                        </div>

                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
              `}

            </div>

            <!-- Footer del Gabinete Industrial -->
            <div style="padding: 12px 20px; background: #231309; border-top: 1px solid #78350f; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; color: #a89984; font-family: Georgia, serif;">
                Gabinete Activo: <strong>${curBranch.toUpperCase()}</strong> • DGA MEE Res. 1238 Conforme
              </span>
              <div style="display: flex; gap: 8px;">
                <button id="btnDismissStationModal" class="btn-workshop-action">
                  Cerrar
                </button>
                <button id="btnExecuteStationAction" class="btn-workshop-action btn-workshop-primary" style="background: #d97706; border-color: #f59e0b; color: #ffffff;">
                  🎯 Localizar Gabinete en Visor 3D
                </button>
              </div>
            </div>

          </div>
        </div>
      `;
    }
    return '';
  }
}
