/**
 * AgriTwin - WiringTwinView.js
 * 
 * Componente interactivo y pedagógico: Gemelo Digital de Conexiones Físicas
 * (ESP32 Microcontroller + Sensores de Terreno + Banco de Relés + Pantalla TFT).
 * 
 * Permite al usuario:
 *  - Seleccionar qué sensor o circuito desea aprender a conectar.
 *  - Ver el diagrama de patillaje físico (Pinout & Breadboard / Terminal Block).
 *  - Probar conexiones interactivas con validación de color de cable y pin.
 *  - Inspeccionar el código fuente C++ / Arduino / ESP-IDF listo para compilar.
 *  - Aprender tips de seguridad industrial, desacoplo eléctrico y normas de campo.
 */

import { SENSOR_CIRCUITS_CATALOG } from '../../data/SensorPinoutData.js?v=3.2.0';

export class WiringTwinView {
  constructor() {
    this.selectedCircuitId = SENSOR_CIRCUITS_CATALOG[0].id;
    this.highlightedWireIndex = null;
    this.testPulseActive = false;
  }

  renderWiringTab(currentCircuitId = null) {
    if (currentCircuitId) {
      this.selectedCircuitId = currentCircuitId;
    }

    const circuit = SENSOR_CIRCUITS_CATALOG.find(c => c.id === this.selectedCircuitId) || SENSOR_CIRCUITS_CATALOG[0];

    return `
      <div id="wiringTwinContainer" style="display: flex; flex-direction: column; gap: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        
        <!-- HEADER PEDAGÓGICO: SELECTOR DE CIRCUITO & HARDWARE -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border: 1px solid #3b82f6; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.4);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div>
              <span style="font-size: 9.5px; font-family: monospace; background: #2563eb; color: #ffffff; padding: 2px 7px; border-radius: 4px; font-weight: bold;">
                ESQUEMA FÍSICO INTERACTIVO • LAB DE CONEXIÓN
              </span>
              <h4 style="margin: 4px 0 0 0; color: #ffffff; font-size: 15px; font-weight: 800; font-family: Georgia, serif;">
                🛠️ Gemelo de Conexiones en Placa & Borneras
              </h4>
            </div>
            <div style="font-size: 11px; color: #93c5fd; font-family: monospace; background: rgba(0,0,0,0.4); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(59,130,246,0.3);">
              MCU Central: <strong style="color: #67e8f9;">${circuit.mcu}</strong> • Voltaje: <strong style="color: #fde047;">${circuit.voltage}</strong>
            </div>
          </div>

          <!-- Selector de Sensores para Conectar -->
          <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;">
            ${SENSOR_CIRCUITS_CATALOG.map(c => {
              const isSel = c.id === circuit.id;
              return `
                <button class="btn-select-circuit" data-circuit-id="${c.id}" style="
                  padding: 6px 12px;
                  border-radius: 6px;
                  font-size: 11px;
                  font-family: monospace;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  white-space: nowrap;
                  border: 1px solid ${isSel ? '#38bdf8' : 'rgba(255,255,255,0.1)'};
                  background: ${isSel ? 'rgba(56,189,248,0.25)' : 'rgba(15,23,42,0.8)'};
                  color: ${isSel ? '#ffffff' : '#cbd5e1'};
                  font-weight: ${isSel ? 'bold' : 'normal'};
                  transition: all 0.2s;
                ">
                  <span>${c.icon}</span>
                  <span>${c.sensorName.split(' ')[0]} ${c.sensorName.split(' ')[1] || ''}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ÁREA CENTRAL: DIAGRAMA VISUAL DE CONEXIÓN (PINOUT BOARD) -->
        <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 14px;">
          
          <!-- LADO IZQUIERDO: CANVAS / TABLERO ESQUEMÁTICO INTERACTIVO -->
          <div style="background: #090d16; border: 2px solid #1e293b; border-radius: 10px; padding: 14px; box-shadow: inset 0 0 30px rgba(0,0,0,0.8); position: relative; overflow: hidden;">
            
            <!-- Barra de Herramientas del Tablero -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 12px;">
              <div style="font-size: 11px; color: #38bdf8; font-family: monospace; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e;"></span>
                <span>TABLERO DE BORNERAS & PINES (BOM ACTIVA)</span>
              </div>
              <button id="btnSimulateSignalPulse" style="
                background: rgba(34, 197, 94, 0.2);
                border: 1px solid #22c55e;
                color: #86efac;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-family: monospace;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;
              " title="Inyecta un pulso eléctrico para probar la continuidad y respuesta del bus">
                <span>⚡ Enviar Pulso de Señal</span>
              </button>
            </div>

            <!-- Representación Gráfica de Placa y Sensor -->
            <div style="display: flex; justify-content: space-between; align-items: stretch; gap: 20px; position: relative; min-height: 290px;">
              
              <!-- BLOQUE 1: MICROCONTROLADOR ESP32 -->
              <div style="flex: 1; background: #0f172a; border: 2px solid #334155; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                <div style="border-bottom: 1px solid #334155; padding-bottom: 6px; text-align: center;">
                  <span style="font-size: 9px; font-family: monospace; background: #1e293b; color: #94a3b8; padding: 2px 6px; border-radius: 3px;">
                    MCU BOARD
                  </span>
                  <div style="font-size: 12px; font-weight: bold; color: #f8fafc; font-family: monospace; margin-top: 4px;">
                    ESP32-S3 DevKit
                  </div>
                </div>

                <!-- Pines Físicos ESP32 -->
                <div style="display: flex; flex-direction: column; gap: 6px; margin: 10px 0;">
                  ${circuit.connections.map((conn, idx) => `
                    <div class="esp-pin-row" data-wire-idx="${idx}" style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      background: rgba(15,23,42,0.9);
                      border: 1px solid ${conn.color};
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-family: monospace;
                      font-size: 10px;
                      transition: all 0.2s;
                    ">
                      <span style="color: #cbd5e1; font-weight: bold;">${conn.pinEsp}</span>
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${conn.color}; box-shadow: 0 0 5px ${conn.color};"></span>
                    </div>
                  `).join('')}
                </div>

                <div style="text-align: center; font-size: 9px; color: #64748b; font-family: monospace;">
                  Antena LoRa / Wi-Fi Integrada
                </div>
              </div>

              <!-- PUENTE CENTRAL: CABLEADO FÍSICO DINÁMICO -->
              <div style="width: 80px; display: flex; flex-direction: column; justify-content: center; gap: 12px; align-items: center;">
                ${circuit.connections.map((conn, idx) => `
                  <div style="width: 100%; height: 3px; background: ${conn.color}; position: relative; border-radius: 2px; box-shadow: 0 0 6px ${conn.color}; cursor: pointer;" title="${conn.wireType}: ${conn.note}">
                    <span style="position: absolute; top: -7px; left: 50%; transform: translateX(-50%); font-size: 8px; background: #000; color: #fff; padding: 0 3px; border-radius: 2px; font-family: monospace;">
                      ${idx + 1}
                    </span>
                  </div>
                `).join('')}
              </div>

              <!-- BLOQUE 2: SENSOR O ACTUADOR EXTERNO -->
              <div style="flex: 1; background: #131d2e; border: 2px solid #1e3a5f; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                <div style="border-bottom: 1px solid #1e3a5f; padding-bottom: 6px; text-align: center;">
                  <span style="font-size: 9px; font-family: monospace; background: #0c4a6e; color: #7dd3fc; padding: 2px 6px; border-radius: 3px;">
                    DISPOSITIVO DE TERRENO
                  </span>
                  <div style="font-size: 11px; font-weight: bold; color: #38bdf8; font-family: monospace; margin-top: 4px;">
                    ${circuit.sensorName.split('(')[0]}
                  </div>
                </div>

                <!-- Terminales del Sensor -->
                <div style="display: flex; flex-direction: column; gap: 6px; margin: 10px 0;">
                  ${circuit.connections.map((conn, idx) => `
                    <div class="sensor-pin-row" data-wire-idx="${idx}" style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      background: rgba(12,74,110,0.3);
                      border: 1px solid ${conn.color};
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-family: monospace;
                      font-size: 10px;
                      transition: all 0.2s;
                    ">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${conn.color}; box-shadow: 0 0 5px ${conn.color};"></span>
                      <span style="color: #e2e8f0; font-weight: bold;">${conn.pinSensor}</span>
                    </div>
                  `).join('')}
                </div>

                <div style="text-align: center; font-size: 9px; color: #38bdf8; font-family: monospace;">
                  Protocolo: ${circuit.protocol}
                </div>
              </div>

            </div>

            <!-- Notificación del Pulso de Prueba -->
            <div id="signalPulseFeedback" style="display: none; margin-top: 10px; background: rgba(34, 197, 94, 0.15); border: 1px solid #22c55e; border-radius: 6px; padding: 6px 10px; font-size: 10px; font-family: monospace; color: #86efac; text-align: center;">
              ⚡ Pulso de telemetría inyectado: <strong>ACK 0x06 Recibido</strong> • Transmisión exitosa sin colisiones en el bus.
            </div>

          </div>

          <!-- LADO DERECHO: GUÍA PASO A PASO & REGLAS DE CONEXIÓN -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            
            <!-- Resumen Técnico -->
            <div style="background: #182234; border: 1px solid #334155; border-radius: 8px; padding: 12px; font-size: 11px;">
              <div style="font-weight: bold; color: #fde047; margin-bottom: 4px; font-family: Georgia, serif; font-size: 12px;">
                📋 Objetivo del Circuito:
              </div>
              <div style="color: #cbd5e1; line-height: 1.4; margin-bottom: 8px;">
                ${circuit.description}
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <span style="background: rgba(56,189,248,0.15); color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 9.5px;">
                  Nivel: ${circuit.difficulty}
                </span>
                <span style="background: rgba(34,197,94,0.15); color: #4ade80; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 9.5px;">
                  Protocolo: ${circuit.protocol}
                </span>
              </div>
            </div>

            <!-- Tabla de Mapeo Pin a Pin -->
            <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 10px; max-height: 180px; overflow-y: auto;">
              <div style="font-size: 10px; font-weight: bold; color: #94a3b8; font-family: monospace; margin-bottom: 6px; text-transform: uppercase;">
                🔌 Mapeo de Cables & Señales:
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${circuit.connections.map((c, i) => `
                  <div style="background: #1e293b; border-left: 3px solid ${c.color}; border-radius: 4px; padding: 6px 8px; font-size: 10px; font-family: monospace;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #f1f5f9;">
                      <span>${c.pinSensor} ➔ ${c.pinEsp}</span>
                      <span style="color: ${c.color};">${c.wireType}</span>
                    </div>
                    <div style="color: #94a3b8; font-size: 9px; margin-top: 2px;">
                      ${c.note}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Consejo Pedagógico de Terreno -->
            <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid #d97706; border-radius: 8px; padding: 10px; font-size: 10.5px; color: #fef08a;">
              ${circuit.pedagogicTip}
            </div>

          </div>

        </div>

        <!-- SECCIÓN INFERIOR: CÓDIGO FUENTE DE EJEMPLO & LISTA DE MATERIALES -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          
          <!-- Lista de Materiales (BOM) -->
          <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 12px; font-size: 11px;">
            <div style="font-weight: bold; color: #f9fafb; margin-bottom: 6px; font-family: monospace; display: flex; align-items: center; gap: 6px;">
              <span>📦 Materiales Requeridos para este Nodo:</span>
            </div>
            <ul style="margin: 0; padding-left: 18px; color: #d1d5db; display: flex; flex-direction: column; gap: 4px; font-size: 10.5px;">
              ${circuit.materials.map(mat => `<li>${mat}</li>`).join('')}
            </ul>
          </div>

          <!-- Código C++ / Arduino / ESP-IDF -->
          <div style="background: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 10px; font-family: monospace; color: #a1a1aa; font-weight: bold;">
                💻 FIRMWARE ARDUINO / ESP32 (READY-TO-FLASH):
              </span>
              <button id="btnCopyFirmwareCode" style="
                background: #27272a;
                border: 1px solid #3f3f46;
                color: #e4e4e7;
                padding: 2px 7px;
                border-radius: 4px;
                font-size: 9.5px;
                font-family: monospace;
                cursor: pointer;
              ">
                Copiar Código
              </button>
            </div>
            <pre style="margin: 0; background: #000000; border: 1px solid #18181b; border-radius: 4px; padding: 8px; color: #4ade80; font-family: 'Courier New', Courier, monospace; font-size: 10px; max-height: 120px; overflow-y: auto; white-space: pre-wrap;">${circuit.codeSnippet}</pre>
          </div>

        </div>

      </div>
    `;
  }
}
