/**
 * AgriTwin - AgroWorkshopOverlay Module
 * 
 * Implements the Age of Empires II diegetic Workshop Menu ("Taller Agrícola"):
 *  - Diegetic background layer (workshop_bg.png)
 *  - 6 Interactive cutout PNG sprites with percentage positioning
 *  - Physics hang/sway & golden glow hover effects
 *  - Diegetic wood & brass tooltips
 *  - Fixed Admin Panel with live audited File Tree and central engines dock
 *  - Interactive dynamic Chart.js replacement for Python static graphs
 *  - Seamless navigation to all audited tools and 3D digital twin
 */

import { bus } from '../utils/EventBus.js';
import { propertyRegistryManager, CHILEAN_LAND_LEGAL_FRAMEWORK } from '../data/PropertyRegistryManager.js';
import { actuatorManager } from '../data/ActuatorManager.js';
if (typeof window !== 'undefined') {
  window.propertyRegistryManager = propertyRegistryManager;
}
import { weatherService } from '../data/WeatherService.js';
import { AdminPanelViews } from './workshop/AdminPanelViews.js';
import { FieldEnclosureModal } from './workshop/FieldEnclosureModal.js';

import { MAULE_SENSORS_CONFIG, WORKSHOP_STATIONS_DATA } from '../data/MauleSensorsConfig.js';
export { MAULE_SENSORS_CONFIG, WORKSHOP_STATIONS_DATA };

// ─── Procedural Audio Engine (Silenciado Total por instrucción de usuario) ────
class WorkshopAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }
  init() {}
  playWoodClick() {}
  playBellGong() {}
  playParchmentOpen() {}
}

export class AgroWorkshopOverlay {
  constructor(app) {
    this.app = app;
    this.audio = new WorkshopAudioEngine();
    this.overlayEl = null;
    this.activeModalStation = null;
    this.showAdminPanel = false;
    this.activeAdminTab = 'sensors';
    this.sensorSubView = 'telemetry';
    this.simTemp = 18.5;
    this.simMoisture = 36.2;
    this.simCwsi = 0.25;
    this.selectedPredioId = 'meniels';
    this.currentChartInstance = null;
    this.showCampaignBoard = true;
    this.selectedMauleSensorTab = 'frost';
    this.selectedPropertySubTab = 'titles'; // 'titles' | 'legal' | 'vault' | 'mosaic'
    this.selectedLegalDocTab = 'dl3516';
    this.selectedEnclosureBranch = 'general'; // 'general' | 'cuarteles' | 'establo'
  }

  init() {
    this.injectHTML();
    this.bindEvents();
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === '3d' || params.get('noworkshop') === '1') {
      this.close();
    } else {
      this.open(false);
    }
  }

  injectHTML() {
    let overlay = document.getElementById('workshopOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'workshopOverlay';
      overlay.className = 'workshop-overlay';
      document.body.appendChild(overlay);
    }
    this.overlayEl = overlay;
    this.render();
  }

  render() {
    this.overlayEl.innerHTML = `
      <!-- Botón Flotante para Cerrar Galpón (Esc) -->
      <button id="btnWorkshopClose" class="btn-workshop-close" style="position: absolute; top: 16px; right: 16px; z-index: 60; width: 36px; height: 36px; border-radius: 10px; background: rgba(13, 19, 34, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.18); color: #cbd5e1; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.6); transition: all 0.2s;" onmouseover="this.style.color='white'; this.style.borderColor='rgba(255,255,255,0.4)'" onmouseout="this.style.color='#cbd5e1'; this.style.borderColor='rgba(255,255,255,0.18)'" title="Volver al Predio 3D (Esc)">
        &times;
      </button>

      <!-- Escena Diegética: Fondo + Sprites PNG -->
      <div class="workshop-stage-container">
        <div class="workshop-stage-viewport">
          <img src="assets/ui/workshop_bg.png" alt="Taller Agrícola Menú" class="workshop-bg-img" draggable="false">
          <div class="workshop-vignette"></div>

          <!-- Panel Central Obsidian Glass: Selección y Despacho Predial (Solo visible al hacer clic en Mesa de Planos) -->
          ${this.showCampaignBoard ? `
          <div class="workshop-campaign-board" id="workshopCampaignBoard" style="position: absolute; top: 24px; left: 50%; transform: translateX(-50%); z-index: 45; width: 620px; max-width: 94vw; animation: fadeIn 0.25s ease-out;">
            <div style="position: relative; background: rgba(13, 19, 34, 0.96); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 22px 24px; box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.95), 0 0 35px rgba(245, 158, 11, 0.2); text-align: center;">

              <!-- Botón Cerrar Tablero -->
              <button id="btnCloseCampaignBoard" style="position: absolute; top: 12px; right: 14px; width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.color='white'; this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.color='#cbd5e1'; this.style.background='rgba(255,255,255,0.08)'">&times;</button>

              <!-- Ribbon de Identificación -->
              <div style="display: inline-flex; align-items: center; gap: 6px; padding: 3px 12px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 9999px; margin-bottom: 10px;">
                <span style="font-size: 11px;">🏡</span>
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #fbbf24;">
                  FUNDO COLLIGUAY • TRABAJO DIARIO
                </span>
              </div>

              <!-- Título del Predio -->
              <div style="margin-bottom: 12px;">
                <h2 style="font-size: 22px; font-weight: 800; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; margin: 0 0 4px 0;">
                  ${this.app?.projectManager?.currentProject?.name || 'Fundo Estero Colliguay'}
                </h2>
                <div style="font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span>📍 Parral, Maule Sur</span>
                  <span>•</span>
                  <span>12.8 ha • PRV & Keyline</span>
                  <span>•</span>
                  <span style="color: #10b981;">Ground-Truth Activo</span>
                </div>
              </div>

              <!-- Píldoras de Telemetría Predial -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 18px; font-family: 'JetBrains Mono', monospace;">
                <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.06); padding: 8px; border-radius: 12px; text-align: center;">
                  <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase;">Superficie</span>
                  <span style="font-size: 13px; font-weight: 800; color: #f8fafc;">12.8 ha</span>
                </div>
                <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.06); padding: 8px; border-radius: 12px; text-align: center;">
                  <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase;">Red IoT</span>
                  <span style="font-size: 13px; font-weight: 800; color: #10b981;">5 Sondas</span>
                </div>
                <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.06); padding: 8px; border-radius: 12px; text-align: center;">
                  <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase;">Humedad Suelo</span>
                  <span style="font-size: 13px; font-weight: 800; color: #0ea5e9;">37.2% VWC</span>
                </div>
                <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.06); padding: 8px; border-radius: 12px; text-align: center;">
                  <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase;">Tranque Keyline</span>
                  <span style="font-size: 13px; font-weight: 800; color: #f59e0b;">18.5k m³</span>
                </div>
              </div>

              <!-- Botón Principal Único: Entrar al Fundo en Modo Predio 3D -->
              <div style="margin-bottom: 10px;">
                <button id="btnBoardLaunchPredio3D" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-radius: 14px; background: linear-gradient(135deg, #f59e0b, #d97706); border: 1.5px solid rgba(251, 191, 36, 0.6); cursor: pointer; text-align: left; transition: all 0.2s; box-shadow: 0 4px 18px rgba(245, 158, 11, 0.35);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 22px rgba(245, 158, 11, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 18px rgba(245, 158, 11, 0.35)'">
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <span style="font-size: 26px;">🌾</span>
                    <div>
                      <div style="font-weight: 800; font-size: 15px; color: #1e1103; font-family: 'Plus Jakarta Sans', sans-serif;">Entrar en Modo Predio 3D</div>
                      <div style="font-size: 11px; color: #451a03; font-weight: 600; font-family: 'JetBrains Mono', monospace;">Fundo Estero Colliguay • Relieve DEM • Sondas IoT</div>
                    </div>
                  </div>
                  <span style="font-weight: 800; color: #1e1103; font-size: 18px;">▶</span>
                </button>
              </div>

              <!-- Botón Estratégico de Permacultura en Landing -->
              <div style="margin-bottom: 16px;">
                <button id="btnBoardStrategicPermaculture" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); border: 1.5px solid rgba(16, 185, 129, 0.5); cursor: pointer; text-align: left; transition: all 0.2s; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.2);" onmouseover="this.style.background='rgba(16, 185, 129, 0.25)'; this.style.borderColor='#34d399';" onmouseout="this.style.background='rgba(16, 185, 129, 0.15)'; this.style.borderColor='rgba(16, 185, 129, 0.5)';">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">📜</span>
                    <div>
                      <div style="font-weight: 800; font-size: 13px; color: #a7f3d0; font-family: 'Plus Jakarta Sans', sans-serif;">Plan Maestro & Estratégico de Permacultura</div>
                      <div style="font-size: 10.5px; color: #6ee7b7; font-family: 'JetBrains Mono', monospace;">Curva de Retorno a 5 Años • Zonas 0 a 5 Mollison • Cero Químicos</div>
                    </div>
                  </div>
                  <span style="font-weight: 800; color: #34d399; font-size: 16px;">▶</span>
                </button>
              </div>

              <!-- Acciones Secundarias de Proyecto -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 10px; color: #94a3b8; font-weight: 600;">Gestión de Proyectos:</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                <button id="btnBoardNewProject" style="padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'">
                  <span>✨</span> Nuevo Predio
                </button>
                <button id="btnBoardOpenProject" style="padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'">
                  <span>📁</span> Cargar .agritwin
                </button>
                <button id="btnBoardImportGis" style="padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'">
                  <span>🗺️</span> Importar (.shp)
                </button>
              </div>

              <div style="margin-top: 14px; font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace;">
                💡 Explora las estaciones técnicas diegéticas o presiona <kbd style="background: rgba(255,255,255,0.1); padding: 1px 5px; border-radius: 4px; color: #cbd5e1;">W</kbd> para alternar el taller.
              </div>
            </div>
          </div>
          ` : ''}

          <!-- Los 6 Sprites Recortados Diegéticos -->
          ${WORKSHOP_STATIONS_DATA.map(st => `
            <div class="workshop-sprite-anchor ${st.hangClass}" data-station-id="${st.id}" style="top: ${st.position.top}; left: ${st.position.left}; width: ${st.position.width};">
              <img src="${st.spriteSrc}" alt="${st.title}" class="workshop-sprite-img" draggable="false">
              <span class="sprite-ping-dot"></span>

              <!-- Cartela Tooltip Madera y Latón -->
              <div class="workshop-tooltip">
                <div class="tooltip-cartela">
                  <div class="tooltip-header">
                    <span class="tooltip-code">${st.code} • ${st.badge}</span>
                    <span class="tooltip-category">${st.category}</span>
                  </div>
                  <h4 class="tooltip-title">${st.title}</h4>
                  <p class="tooltip-desc">${st.description}</p>
                  <div class="tooltip-footer">
                    <span class="tooltip-callout">▶ Clic para interactuar</span>
                    <span style="color: #a8a29e;">${st.tools.length} submódulos</span>
                  </div>
                </div>
              </div>

              <!-- Cartela Unificada AoE II Persistente (Capa 2) -->
              <div class="aoe-unified-station-badge">
                <div class="aoe-badge-meta">
                  <span class="aoe-badge-code">${st.code}</span>
                  <span class="aoe-badge-dot"></span>
                </div>
                <div class="aoe-badge-title">${st.shortTitle}</div>
                <div class="aoe-badge-metric">${st.metric || st.badge}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Panel Maestro Predial (Modal Amplio Centrado Diegético) -->
      ${this.showAdminPanel ? `
        <div class="modal-overlay glass-modal-backdrop" id="adminPanelBackdrop" style="display: flex; z-index: 70;">
          ${this.renderAdminPanelHTML()}
        </div>
      ` : ''}

      <!-- Modal de Detalle de Estación con Gráfica Dinámica Chart.js (Legacy / Fallback) -->
      ${this.activeModalStation ? this.renderStationModalHTML(this.activeModalStation) : ''}
    `;

    this.bindDynamicListeners();

    // Inicializar Gráfica Chart.js si el Panel Maestro o Modal está abierto
    if (this.showAdminPanel) {
      this.initChartForActiveTab();
      if (this.activeAdminTab === 'vault') {
        this.initMermaidInVault();
      }
    } else if (this.activeModalStation) {
      this.initChart(this.activeModalStation);
    }
  }

  renderAdminPanelHTML() {
    return AdminPanelViews.render(this);
  }

  renderStationModalHTML(station) {
    // Especialización: Gabinete Industrial de Terreno IP67 (station_b)
    if (station?.id === 'station_b') {
      return FieldEnclosureModal.render(this, station);
    }

    // Especialización: Modal del Sprite de Registro de Límites Prediales & Régimen Jurídico (station_map)
    if (station.id === 'station_map') {
      const activeProp = propertyRegistryManager.getProperty(this.selectedPredioId);
      const subTab = this.selectedPropertySubTab || 'titles';
      const legalKey = this.selectedLegalDocTab || 'dl3516';
      const legalFramework = CHILEAN_LAND_LEGAL_FRAMEWORK[legalKey] || CHILEAN_LAND_LEGAL_FRAMEWORK.dl3516;

      const subTabs = [
        { id: 'titles', icon: '📜', label: 'Títulos & CBR' },
        { id: 'legal', icon: '⚖️', label: 'Marco Legal & Suelo' },
        { id: 'vault', icon: '📁', label: `Bóveda Documental (${activeProp.documentos.length})` },
        { id: 'mosaic', icon: '🗺️', label: 'Deslindes & Mosaico' }
      ];

      return `
        <div class="modal-overlay glass-modal-backdrop" style="display: flex; z-index: 70;">
          <div class="station-modal-container" style="max-width: 820px; width: 92%; max-height: 90vh;">
            <!-- Header Modal con Selector de Predio -->
            <div style="padding: 14px 18px; background: #27150c; border-bottom: 2px solid #78350f; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 8px; background: #1a0e07; border: 1px solid #d97706; padding: 4px; display: flex; align-items: center; justify-content: center;">
                  <img src="${station.spriteSrc}" alt="${station.title}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-family: monospace; font-size: 11px; font-weight: 800; color: #fbbf24; background: #451a03; padding: 1px 6px; border-radius: 4px; border: 1px solid #92400e;">
                      ${station.code}
                    </span>
                    <h3 style="margin: 0; font-family: Georgia, serif; font-size: 16px; font-weight: 800; color: #ffffff;">
                      ${station.title}
                    </h3>
                  </div>
                  <div style="font-size: 11px; color: #d6c4a8;">
                    Rol SII: <strong style="color: #fde047;">${activeProp.rolSII}</strong> • CBR ${activeProp.cbr.conservador}
                  </div>
                </div>
              </div>

              <!-- Selector de Predio & Botón Cerrar -->
              <div style="display: flex; align-items: center; gap: 10px;">
                <select id="selectModalPropertyRegistry" style="background: #150a04; color: #fde047; border: 1px solid #b45309; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-family: monospace; cursor: pointer;">
                  ${propertyRegistryManager.getAllProperties().map(p => `
                    <option value="${p.id}" ${p.id === activeProp.id ? 'selected' : ''}>${p.name} (${p.rolSII})</option>
                  `).join('')}
                </select>
                <button id="btnCloseStationModal" class="btn-workshop-close">&times;</button>
              </div>
            </div>

            <!-- Barra de Sub-Pestañas Operativas del Registro Predial -->
            <div style="display: flex; background: #1a0d06; border-bottom: 1px solid #78350f; padding: 4px 12px; gap: 6px; overflow-x: auto;">
              ${subTabs.map(t => `
                <button class="prop-registry-tab-btn ${subTab === t.id ? 'active' : ''}" data-prop-tab="${t.id}" style="padding: 8px 14px; border-radius: 6px; border: 1px solid ${subTab === t.id ? '#f59e0b' : 'transparent'}; background: ${subTab === t.id ? 'rgba(245, 158, 11, 0.2)' : 'transparent'}; color: ${subTab === t.id ? '#fde047' : '#cbd5e1'}; font-size: 11px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
                  <span>${t.icon}</span>
                  <span>${t.label}</span>
                </button>
              `).join('')}
            </div>

            <!-- Body Modal Dinámico por Pestaña -->
            <div style="padding: 16px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; color: #e6ccb2; max-height: calc(90vh - 180px);">
              
              <!-- ================= 1. SUB-PESTAÑA: TÍTULOS & CBR ================= -->
              ${subTab === 'titles' ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <!-- Tarjeta Inscripción CBR -->
                  <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong style="color: #fbbf24; font-size: 12px;">🏛️ Conservador de Bienes Raíces (CBR)</strong>
                      <span style="font-size: 9.5px; background: rgba(16,185,129,0.2); color: #34d399; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.4); font-weight: bold;">Dominio Vigente</span>
                    </div>
                    <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
                      • <strong>Jurisdicción:</strong> ${activeProp.cbr.conservador}<br>
                      • <strong>Inscripción:</strong> Fojas ${activeProp.cbr.fojas} N° ${activeProp.cbr.numero} del Año ${activeProp.cbr.ano}<br>
                      • <strong>Registro:</strong> ${activeProp.cbr.registro}<br>
                      • <strong>Superficie Física:</strong> ${activeProp.superficieTotalHa} hectáreas
                    </div>
                  </div>

                  <!-- Tarjeta Avalúo SII -->
                  <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong style="color: #38bdf8; font-size: 12px;">📑 Servicio de Impuestos Internos (SII)</strong>
                      <span style="font-size: 9.5px; background: rgba(56,189,248,0.2); color: #38bdf8; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.4); font-weight: bold;">Serie Agrícola</span>
                    </div>
                    <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
                      • <strong>Rol de Avalúo:</strong> ${activeProp.rolSII}<br>
                      • <strong>Destino Predial:</strong> ${activeProp.serieSII}<br>
                      • <strong>Avalúo Fiscal:</strong> $${activeProp.avaluoFiscalCLP.toLocaleString('es-CL')} CLP<br>
                      • <strong>Impuesto Territorial:</strong> ${activeProp.exencionContribuciones}
                    </div>
                  </div>
                </div>

                <!-- Propietarios y Titulares de Dominio -->
                <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px;">
                  <strong style="color: #fbbf24; font-size: 12px; display: block; margin-bottom: 8px;">👥 Registro de Titulares de Dominio & Propietarios:</strong>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${activeProp.propietarios.map(p => `
                      <div style="display: flex; justify-content: space-between; align-items: center; background: #120703; padding: 8px 10px; border-radius: 6px; border: 1px solid #3d1704; font-size: 11px;">
                        <div>
                          <strong style="color: #ffffff;">${p.nombre}</strong>
                          <span style="color: #94a3b8; font-family: monospace; margin-left: 8px;">RUT: ${p.rut}</span>
                        </div>
                        <span style="color: #fde047; font-weight: bold; font-family: monospace;">Participación: ${p.participacion}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Derechos de Agua DGA -->
                <div style="background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(14, 165, 233, 0.4); border-radius: 10px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="color: #38bdf8; font-size: 12px;">💧 Derechos de Aprovechamiento de Aguas (Código de Aguas & DGA)</strong>
                    <span style="font-size: 9.5px; color: #7dd3fc; font-family: monospace;">${activeProp.derechosAgua.codigoCPA_DGA}</span>
                  </div>
                  <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
                    • <strong>Caudal Autorizado:</strong> ${activeProp.derechosAgua.caudalTotalLs} L/s<br>
                    • <strong>Fuentes de Captación:</strong> ${activeProp.derechosAgua.fuente}<br>
                    • <strong>Registro de Aguas CBR:</strong> ${activeProp.derechosAgua.fojasAguasCBR}<br>
                    • <strong>Transmisión MEE DGA Res. 1238:</strong> <span style="color: #4ade80; font-weight: bold;">${activeProp.derechosAgua.estadoMEE}</span>
                  </div>
                </div>

                <!-- Deslindes Notariales -->
                <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px;">
                  <strong style="color: #fbbf24; font-size: 12px; display: block; margin-bottom: 8px;">🧭 Deslindes Notariales del Título de Propiedad:</strong>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                    <div style="background: #120703; padding: 8px; border-radius: 6px; border-left: 3px solid #38bdf8;">
                      <strong style="color: #38bdf8;">NORTE:</strong> <span style="color: #cbd5e1;">${activeProp.deslindes.norte}</span>
                    </div>
                    <div style="background: #120703; padding: 8px; border-radius: 6px; border-left: 3px solid #f59e0b;">
                      <strong style="color: #f59e0b;">SUR:</strong> <span style="color: #cbd5e1;">${activeProp.deslindes.sur}</span>
                    </div>
                    <div style="background: #120703; padding: 8px; border-radius: 6px; border-left: 3px solid #10b981;">
                      <strong style="color: #10b981;">ESTE:</strong> <span style="color: #cbd5e1;">${activeProp.deslindes.este}</span>
                    </div>
                    <div style="background: #120703; padding: 8px; border-radius: 6px; border-left: 3px solid #c084fc;">
                      <strong style="color: #c084fc;">OESTE:</strong> <span style="color: #cbd5e1;">${activeProp.deslindes.oeste}</span>
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- ================= 2. SUB-PESTAÑA: MARCO LEGAL & USO DE SUELO ================= -->
              ${subTab === 'legal' ? `
                <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px;">
                  <div style="display: flex; gap: 6px; margin-bottom: 12px; overflow-x: auto; padding-bottom: 4px;">
                    ${Object.keys(CHILEAN_LAND_LEGAL_FRAMEWORK).map(k => {
                      const fw = CHILEAN_LAND_LEGAL_FRAMEWORK[k];
                      return `
                        <button class="legal-framework-btn ${legalKey === k ? 'active' : ''}" data-legal-key="${k}" style="padding: 6px 10px; border-radius: 6px; border: 1px solid ${legalKey === k ? fw.color : 'rgba(255,255,255,0.1)'}; background: ${legalKey === k ? 'rgba(0,0,0,0.4)' : '#140803'}; color: ${legalKey === k ? fw.color : '#cbd5e1'}; font-size: 10.5px; font-weight: bold; cursor: pointer; white-space: nowrap;">
                          ${fw.title.split('-')[0].trim()}
                        </button>
                      `;
                    }).join('')}
                  </div>

                  <div style="border-left: 3px solid ${legalFramework.color}; padding-left: 10px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <h4 style="margin: 0; color: #ffffff; font-size: 13px; font-family: Georgia, serif;">${legalFramework.title}</h4>
                      <span style="font-size: 9.5px; background: rgba(0,0,0,0.4); color: ${legalFramework.color}; border: 1px solid ${legalFramework.color}; padding: 2px 6px; border-radius: 4px; font-family: monospace;">
                        ${legalFramework.badge}
                      </span>
                    </div>
                    <div style="font-size: 10.5px; color: #94a3b8; margin-top: 3px;">
                      Autoridad Fiscalizadora: <strong style="color: #cbd5e1;">${legalFramework.authority}</strong>
                    </div>
                    <p style="font-size: 11px; color: #e2e8f0; margin: 6px 0 0 0; line-height: 1.45;">
                      ${legalFramework.summary}
                    </p>
                  </div>

                  <!-- Reglas & Obligaciones Clave -->
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${legalFramework.rules.map(r => `
                      <div style="background: #120703; padding: 10px; border-radius: 6px; border: 1px solid #3d1704;">
                        <strong style="color: ${legalFramework.color}; font-size: 11px; display: block; margin-bottom: 3px;">
                          ✓ ${r.topic}
                        </strong>
                        <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
                          ${r.desc}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Resumen de Restricciones del Predio Actual -->
                <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 10px; padding: 12px;">
                  <strong style="color: #f87171; font-size: 12px; display: block; margin-bottom: 6px;">
                    ⚠️ Gravámenes, Servidumbres & Restricciones Activas para ${activeProp.name}:
                  </strong>
                  <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #fecaca; line-height: 1.5;">
                    ${activeProp.restriccionesLegales.map(r => `<li>${r}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              <!-- ================= 3. SUB-PESTAÑA: BÓVEDA DE DOCUMENTOS (.AGRITWIN) ================= -->
              ${subTab === 'vault' ? `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #180d06; padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(120,53,15,0.7);">
                  <div>
                    <strong style="color: #fbbf24; font-size: 12px;">📁 Custodia Documental del Predio (${activeProp.documentos.length} archivos)</strong>
                    <div style="font-size: 10px; color: #94a3b8;">Almacenamiento seguro persistente para escrituras, certificados CBR, planos SAG y DGA.</div>
                  </div>
                  <div>
                    <input type="file" id="inputUploadLegalDoc" style="display: none;" accept=".pdf,.dwg,.doc,.docx,.txt,.agritwin">
                    <button id="btnTriggerUploadLegalDoc" style="padding: 6px 12px; background: #d97706; color: #fff; border: 1px solid #f59e0b; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                      <span>➕ Adjuntar Archivo</span>
                    </button>
                  </div>
                </div>

                <!-- Lista de Documentos en Custodia -->
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${activeProp.documentos.map(doc => `
                    <div style="background: #140803; border: 1px solid #451a03; border-radius: 8px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;" onmouseover="this.style.borderColor='#f59e0b'" onmouseout="this.style.borderColor='#451a03'">
                      <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <span style="font-size: 22px;">📄</span>
                        <div>
                          <div style="font-size: 12px; font-weight: bold; color: #ffffff;">
                            ${doc.nombre}
                          </div>
                          <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">
                            <span style="color: #fde047; font-weight: 600;">${doc.tipo}</span> • Emisor: ${doc.emisor} • ${doc.fecha} • ${doc.tamano}
                          </div>
                          <div style="font-size: 9.5px; color: #94a3b8; font-family: monospace; margin-top: 3px;">
                            SHA-256: ${doc.hashSha256.substring(0, 24)}... ${doc.verificado ? '<span style="color: #34d399;">✓ Conforme CBR</span>' : ''}
                          </div>
                          ${doc.nota ? `<div style="font-size: 10px; color: #d6c4a8; font-style: italic; margin-top: 3px;">"${doc.nota}"</div>` : ''}
                        </div>
                      </div>

                      <div style="display: flex; gap: 6px;">
                        <button class="btn-download-vault-doc" data-doc-name="${doc.nombre}" style="padding: 5px 8px; background: rgba(56,189,248,0.2); border: 1px solid rgba(56,189,248,0.4); color: #38bdf8; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">
                          📥 Descargar
                        </button>
                        <button class="btn-delete-vault-doc" data-doc-id="${doc.id}" style="padding: 5px 8px; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #f87171; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">
                          🗑️
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <!-- ================= 4. SUB-PESTAÑA: DESLINDES & MOSAICO ================= -->
              ${subTab === 'mosaic' ? `
                <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="color: #fbbf24; font-size: 12px;">🗺️ Mosaico Catastral & Predios Colindantes</strong>
                    <span style="font-size: 10px; font-family: monospace; color: #34d399; background: rgba(16,185,129,0.2); padding: 2px 6px; border-radius: 4px;">100% Acoplado DEM 3D</span>
                  </div>
                  <p style="font-size: 11px; color: #cbd5e1; margin: 0 0 10px 0; line-height: 1.45;">
                    Permite visualizar el polígono del predio en relación a predios vecinos, evaluar riesgos de interfaz (incendios, amortiguación de quebradas) y verificar deslindes físicos georreferenciados.
                  </p>
                  
                  <!-- Contenedor del Gráfico Dinámico Chart.js de Conformidad de Linderos -->
                  <div style="background: #120804; padding: 12px; border-radius: 8px; border: 1px solid rgba(120,53,15,0.8); margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-size: 11px; font-weight: bold; color: #ffffff;">📊 Conformidad Legal de Linderos vs. Superficie Predial</span>
                      <span style="font-size: 9.5px; color: #fbbf24; font-family: monospace;">Malla Vecinal Maule</span>
                    </div>
                    <div style="position: relative; height: 160px; width: 100%;">
                      <canvas id="stationDynamicChart"></canvas>
                    </div>
                  </div>

                  <button id="btnFocusPredioIn3D" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #38bdf8; color: #7dd3fc; border-radius: 8px; font-size: 11.5px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
                    <span>🎯 Enfocar Polígono de Límites & Curvas en el Visor 3D</span>
                  </button>
                </div>
              ` : ''}

            </div>

            <!-- Footer Modal -->
            <div style="padding: 12px 20px; background: #231309; border-top: 1px solid #78350f; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; color: #a89984; font-family: Georgia, serif;">
                Predio Activo: <strong>${activeProp.name}</strong> • Rol: <strong>${activeProp.rolSII}</strong>
              </span>
              <div style="display: flex; gap: 8px;">
                <button id="btnDismissStationModal" class="btn-workshop-action">
                  Cerrar
                </button>
                <button id="btnDownloadConsolidatedReport" class="btn-workshop-action btn-workshop-primary" style="background: #047857; border-color: #10b981; color: #ffffff;">
                  📥 Descargar Dossier Legal (.txt)
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Modal genérico para el resto de los sprites
    return `
      <div class="modal-overlay glass-modal-backdrop" style="display: flex; z-index: 70;">
        <div class="station-modal-container">
          <!-- Header Modal -->
          <div style="padding: 16px 20px; background: #27150c; border-bottom: 2px solid #78350f; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 44px; height: 44px; border-radius: 8px; background: #1a0e07; border: 1px solid #d97706; padding: 4px; display: flex; align-items: center; justify-content: center;">
                <img src="${station.spriteSrc}" alt="${station.title}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-family: monospace; font-size: 11px; font-weight: 800; color: #fbbf24; background: #451a03; padding: 1px 6px; border-radius: 4px; border: 1px solid #92400e;">
                    ${station.code}
                  </span>
                  <h3 style="margin: 0; font-family: Georgia, serif; font-size: 16px; font-weight: 800; color: #ffffff;">
                    ${station.title}
                  </h3>
                </div>
                <div style="font-size: 11px; color: #d6c4a8; font-style: italic;">
                  ${station.category} • ${station.badge}
                </div>
              </div>
            </div>
            <button id="btnCloseStationModal" class="btn-workshop-close">&times;</button>
          </div>

          <!-- Body Modal con Gráfica Dinámica Reemplazando Python -->
          <div style="padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; color: #e6ccb2;">
            <div style="background: #24130a; padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(120,53,15,0.6); font-size: 12px; line-height: 1.5;">
              ${station.description}
            </div>

            <div>
              <div style="font-family: monospace; font-size: 11px; font-weight: 800; color: #fbbf24; text-transform: uppercase; margin-bottom: 8px;">
                🛠️ Submódulos Auditados
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                ${station.tools.map(tool => `
                  <div style="background: #140a05; padding: 8px 10px; border-radius: 6px; border: 1px solid #451a03; font-size: 11px; display: flex; align-items: center; gap: 6px; color: #cbd5e1;">
                    <span style="color: #34d399;">✓</span>
                    <span>${tool}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Contenedor del Gráfico Dinámico Chart.js -->
            <div style="background: #120804; padding: 14px; border-radius: 12px; border: 1px solid rgba(120,53,15,0.8);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <div style="font-family: Georgia, serif; font-size: 13px; font-weight: 800; color: #fff;">
                  📊 Gráfica Interactiva en Tiempo Real (Reemplazo Python)
                </div>
                <span style="font-family: monospace; font-size: 10px; background: rgba(16,185,129,0.2); color: #34d399; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.4);">
                  Chart.js 60fps
                </span>
              </div>
              <div style="position: relative; height: 160px; width: 100%;">
                <canvas id="stationDynamicChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Footer Modal -->
          <div style="padding: 14px 20px; background: #231309; border-top: 1px solid #78350f; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; color: #a89984; font-family: Georgia, serif;">
              Presiona Esc para volver al taller
            </span>
            <div style="display: flex; gap: 8px;">
              <button id="btnDismissStationModal" class="btn-workshop-action">
                Cerrar
              </button>
              <button id="btnExecuteStationAction" class="btn-workshop-action btn-workshop-primary">
                ${station.id === 'station_c' ? 'Abrir Gemelo 3D' : station.id === 'station_map' ? 'Abrir Simulación Territorial' : 'Abrir Herramienta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Exponer ayudantes globales para interacción desde Drawer de Predio (Establo, Cultivos, etc.)
    window.openGalponWorkshop = (branch = null) => {
      this.open();
      if (branch) {
        this.selectedEnclosureBranch = branch;
        this.openStationModal('station_b');
      } else {
        this.showCampaignBoard = true;
        this.closeStationModal();
        this.render();
      }
    };
    window.triggerSimRain = () => {
      bus.emit('weather:toggle_rain');
      bus.emit('ui:show_toast', '🌧️ Alternando simulación 3D de precipitaciones procedurales.');
    };

    // Abrir/cerrar con tecla W o Escape (ignorar si el usuario camina en 3D)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'w' || e.key === 'W') {
        if (window.__agritwin_app?.mapManager?.isWalkthrough || window.agriTwinApp?.mapManager?.isWalkthrough) {
          return;
        }
        if (!e.target.matches('input, textarea')) {
          this.toggle();
        }
      }
      if (e.key === 'Escape' && this.overlayEl.classList.contains('active')) {
        if (this.activeModalStation) {
          this.closeStationModal();
        } else if (this.showAdminPanel) {
          this.showAdminPanel = false;
          this.render();
        } else {
          this.close();
        }
      }
    });
  }

  bindDynamicListeners() {
    // Botón Salto al Gemelo 3D (Header)
    const btnLaunch = document.getElementById('btnWorkshopLaunchTwin');
    if (btnLaunch) {
      btnLaunch.addEventListener('click', () => {
        this.close();
        if (this.app && this.app.mapManager) {
          this.app.mapManager.flyToPreset('overview');
        }
        bus.emit('ui:show_toast', '🌾 Bienvenido al Fundo Estero Colliguay. Gemelo 3D activo.');
      });
    }

    // Acciones del Tablón de Campaña Diegético (AoE II)
    const btnBoardGabinete = document.getElementById('btnBoardOpenGabinete');
    if (btnBoardGabinete) {
      btnBoardGabinete.addEventListener('click', () => {
        this.openStationModal('station_b');
      });
    }

    const btnBoardRain = document.getElementById('btnBoardSimulateRain');
    if (btnBoardRain) {
      btnBoardRain.addEventListener('click', () => {
        if (window.triggerSimRain) {
          window.triggerSimRain();
        } else {
          bus.emit('weather:toggle_rain');
        }
      });
    }

    const btnBoardLaunchPredio = document.getElementById('btnBoardLaunchPredio3D') || document.getElementById('btnBoardLaunchColliguay');
    if (btnBoardLaunchPredio) {
      btnBoardLaunchPredio.addEventListener('click', () => {
        this.close();
        if (this.app && this.app.mapManager) {
          this.app.mapManager.flyToPreset('overview');
        }
        bus.emit('ui:show_toast', '🌾 Modo Predio 3D activo. Explorando Fundo Estero Colliguay.');
      });
    }

    const btnBoardNew = document.getElementById('btnBoardNewProject');
    if (btnBoardNew) {
      btnBoardNew.addEventListener('click', () => {
        this.close();
        if (this.app && this.app.drawingManager) {
          this.app.drawingManager.toggleDrawingMode(true);
        }
        bus.emit('ui:show_toast', '✨ Nuevo predio en blanco. Usa el Pincel 3D para trazar tus primeras parcelas.');
      });
    }

    const btnBoardOpen = document.getElementById('btnBoardOpenProject');
    if (btnBoardOpen) {
      btnBoardOpen.addEventListener('click', () => {
        const agritwinInput = document.getElementById('agritwinFileInput');
        if (agritwinInput) {
          agritwinInput.click();
        } else {
          bus.emit('ui:show_toast', '📁 Selector de archivo .agritwin no disponible.');
        }
      });
    }

    const btnBoardImportGis = document.getElementById('btnBoardImportGis');
    if (btnBoardImportGis) {
      btnBoardImportGis.addEventListener('click', () => {
        this.close();
        if (this.app && this.app.projectManager && typeof this.app.projectManager.openImporterModal === 'function') {
          this.app.projectManager.openImporterModal();
        } else {
          const shapefileModal = document.getElementById('shapefileModal');
          if (shapefileModal) shapefileModal.style.display = 'flex';
        }
        bus.emit('ui:show_toast', '🗺️ Importador Shapefile (.shp / GeoJSON) abierto.');
      });
    }

    // Botón Cerrar Tablero Campaña
    const btnCloseCampaign = document.getElementById('btnCloseCampaignBoard');
    if (btnCloseCampaign) {
      btnCloseCampaign.addEventListener('click', () => {
        this.showCampaignBoard = false;
        this.render();
      });
    }

    // Botón Cerrar
    const btnClose = document.getElementById('btnWorkshopClose');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }

    // Toggle Admin Panel
    const btnAdminToggle = document.getElementById('btnWorkshopAdminToggle');
    if (btnAdminToggle) {
      btnAdminToggle.addEventListener('click', () => {
        this.showAdminPanel = !this.showAdminPanel;
        this.render();
      });
    }

    const btnCloseAdmin = document.getElementById('btnCloseAdminPanel');
    if (btnCloseAdmin) {
      btnCloseAdmin.addEventListener('click', () => {
        this.showAdminPanel = false;
        this.render();
      });
    }

    // Tabs del Admin Panel
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeAdminTab = btn.dataset.tab;
        this.render();
      });
    });

    // Clicks en los Sprites Diegéticos con protección contra arrastre (drag/pan)
    document.querySelectorAll('.workshop-sprite-anchor').forEach(el => {
      let startX = 0;
      let startY = 0;

      el.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
      });

      el.addEventListener('click', (e) => {
        const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
        if (dist > 8) return; // Si el usuario estaba desplazando la pantalla, ignorar

        this.audio?.playWoodClick();
        const id = el.dataset.stationId;
        const station = WORKSHOP_STATIONS_DATA.find(s => s.id === id);
        if (station && station.action) {
          station.action(this.app, this);
        } else if (station) {
          this.openStationModal(station);
        }
      });
    });

    // Clicks en saltos de estación del Admin Panel
    document.querySelectorAll('.station-jump-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.stationId;
        const station = WORKSHOP_STATIONS_DATA.find(s => s.id === id);
        if (station && station.action) {
          station.action(this.app, this);
        } else if (station) {
          this.openStationModal(station);
        }
      });
    });

    // Sub-vistas de Sensores: Telemetría vs Formato Informe
    const btnSubTelemetria = document.getElementById('btnSubTelemetria');
    if (btnSubTelemetria) {
      btnSubTelemetria.addEventListener('click', () => {
        this.sensorSubView = 'telemetry';
        this.render();
      });
    }

    const btnSubInforme = document.getElementById('btnSubInforme');
    if (btnSubInforme) {
      btnSubInforme.addEventListener('click', () => {
        this.sensorSubView = 'report';
        this.render();
      });
    }

    // Sliders de Calibración FDR en Vivo
    const sliderTemp = document.getElementById('sliderSimTemp');
    if (sliderTemp) {
      sliderTemp.addEventListener('input', (e) => {
        this.simTemp = parseFloat(e.target.value);
        const txt = document.getElementById('txtSimTemp');
        if (txt) txt.innerText = `${this.simTemp}°C`;
      });
    }

    const sliderMoisture = document.getElementById('sliderSimMoisture');
    if (sliderMoisture) {
      sliderMoisture.addEventListener('input', (e) => {
        this.simMoisture = parseFloat(e.target.value);
        const txt = document.getElementById('txtSimMoisture');
        if (txt) txt.innerText = `${this.simMoisture}%`;
      });
    }

    const sliderCwsi = document.getElementById('sliderSimCwsi');
    if (sliderCwsi) {
      sliderCwsi.addEventListener('input', (e) => {
        this.simCwsi = parseFloat(e.target.value);
        const txt = document.getElementById('txtSimCwsi');
        if (txt) txt.innerText = `${this.simCwsi}`;
      });
    }

    // Selector de Predios en Libreta Biofísica
    const selectPredio = document.getElementById('selectAdminPredio');
    if (selectPredio) {
      selectPredio.addEventListener('change', (e) => {
        this.selectedPredioId = e.target.value;
        propertyRegistryManager.setSelectedProperty(this.selectedPredioId);
        this.render();
      });
    }

    const btnAdminOpenPropStation = document.getElementById('btnAdminOpenPropertyRegistryStation');
    if (btnAdminOpenPropStation) {
      btnAdminOpenPropStation.addEventListener('click', () => {
        const st = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_map');
        if (st) this.openStationModal(st);
      });
    }

    const btnBoardStrat = document.getElementById('btnBoardStrategicPermaculture');
    if (btnBoardStrat) {
      btnBoardStrat.addEventListener('click', () => {
        this.openStrategicPermacultureModal();
      });
    }

    const btnJumpMapFromStrat = document.getElementById('btnJumpMapFromStrategic');
    if (btnJumpMapFromStrat) {
      btnJumpMapFromStrat.addEventListener('click', () => {
        this.close();
        if (this.app?.mapManager?.flyToPreset) {
          this.app.mapManager.flyToPreset('overview');
        }
        if (this.app?.objectPlacementManager?.openDock) {
          setTimeout(() => this.app.objectPlacementManager.openDock(), 300);
        }
      });
    }

    const btnOpenDossierPredios = document.getElementById('btnOpenDossierFromPredios');
    if (btnOpenDossierPredios) {
      btnOpenDossierPredios.addEventListener('click', () => {
        if (typeof window.openDossierPlanMaestroModal === 'function') {
          window.openDossierPlanMaestroModal();
        } else {
          const dModal = document.getElementById('dossierPlanMaestroModal');
          if (dModal) dModal.style.display = 'flex';
        }
      });
    }

    // Botones de 1-Click Copy en Herramientas & CLI
    document.querySelectorAll('.btn-copy-cmd').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        if (cmd) {
          navigator.clipboard.writeText(cmd).then(() => {
            const originalText = btn.innerText;
            btn.innerText = '✓ ¡Copiado!';
            setTimeout(() => { btn.innerText = originalText; }, 2000);
            bus.emit('ui:show_toast', `📋 Comando copiado: ${cmd}`);
          }).catch(() => {
            bus.emit('ui:show_toast', `Comando: ${cmd}`);
          });
        }
      });
    });

    // Descarga de Informe Oficial de Telemetría IoT en formato TXT (Red Maule Sur)
    const btnDownloadReport = document.getElementById('btnDownloadIoTReport');
    if (btnDownloadReport) {
      btnDownloadReport.addEventListener('click', () => {
        const reportContent = `========================================================================
URRUTIA AGROTECH & AGRITWIN 3D - CERTIFICADO TÉCNICO OFICIAL DE TELEMETRÍA IOT
Código Documento: INF-IOT-2026-MAULE-SUR
Fecha Emisión: ${new Date().toISOString()}
Norma / Estándar: SAG / DGA MEE (Res. 1238) / GlobalGAP / EUDR Verificado
========================================================================

1. ANTECEDENTES DEL PREDIO & RED DE MICROCLIMA
------------------------------------------------------------------------
- Predio: Fundo Meniels (Estero Colliguay)
- Ubicación: Parral, Región del Maule, Chile (Lat -36.14°S, Lon -71.82°W)
- Superficie: 24.8 Hectáreas (Cerezo Lapins, Cepa País, Pastoreo PRV)
- Modelo de Red: Hardware Compartido (Gateway LoRaWAN Industrial + Nodos Satélite)
- Operador Técnico: AgroTech Maule SpA & Asesoría Técnica de Red

2. TELEMETRÍA EN VIVO • PILARES PRODUCTIVOS DEL MAULE
------------------------------------------------------------------------
[A] NODO HELADAS A ALTURA DE FRUTA (IOT-FROST-01 - 1.2 metros):
    - Temperatura Altura Fruta: -0.8 °C (Yemas de Cerezo Expuestas)
    - Temperatura Abrigo Meteorológico (2.0 metros): 2.4 °C (Delta: -3.2 °C)
    - Temperatura de Bulbo Húmedo: -1.5 °C (Psicrometría de Stull)
    - Dinámica Eólica: 1.8 km/h (Calma - Helada Radiativa Katabática)
    - DICTAMEN: NO ENCENDER RIEGO ANTIHELADA. Bulbo húmedo es menor a -0.5 °C;
      aplicar agua provocará congelamiento evaporativo destructivo en flores.
      Activar ventiladores de inversión térmica o calefactores.

[B] SENSOR DE MOJAMIENTO FOLIAR (IOT-LEAF-01 - PHYTOS-31):
    - Horas Continuas de Hoja Mojada: 11.5 horas
    - Humedad Relativa Canopia: 94 % | Temperatura Follaje: 17.2 °C
    - Índice de Presión Botrytis (Modelo Mills): 82 % (Crítico > 70%)
    - DICTAMEN: GATILLAR APLICACIÓN DE BOTRICIDA. Umbral epidemiológico
      cumplido. Realizar aplicación preventiva hoy en franja 16:30 - 19:00 h.
      Ahorro vs. calendario ciego: $380.000 CLP/ha.

[C] CAUDALÍMETRO TELEMÉTRICO & TURNO DE CANAL (IOT-FLOW-01):
    - Caudal Instantáneo de Bombeo: 24.5 L/s
    - Transmisión DGA MEE: CONFORME (Resolución DGA N° 1238 / Lote 0912)
    - Días de Reserva en Suelo: 4.2 días (Perfil Franco-Arcilloso Maule)
    - Próximo Turno de Canal: en 4.0 días (Martes 08:00 h)
    - DICTAMEN: POZO APAGADO. El suelo sostiene el cultivo hasta el turno.
      Solicitar 32 mm en el turno para recarga por gravedad. Ahorro: $112.000 CLP.

[D] ESTACIÓN MICROZONA & VENTANA FITOSANITARIA (IOT-WX-01):
    - Viento Actual: 5.2 km/h ENE (Apto pulverización < 10 km/h)
    - Ventana Segura de Hoy: 07:30 a 10:45 h (Suspender al mediodía por Puelche)
    - Riesgo de Partidura de Cerezas (Cracking 72h): Riesgo Medio (14.5 mm previstos)
    - Horas de Frío Acumuladas: 745 HF | Grados-Día: 390 GD

3. DICTAMEN INTEGRAL DEL ASESOR AGRONÓMICO
------------------------------------------------------------------------
El manejo en el Maule prioriza el seguro productivo sobre el volumen hídrico.
Se valida la estrategia de cero daño por heladas mediante ventilación de aire frío
y se mantiene el cumplimiento normativo DGA al 100%.

Firma Digital Criptográfica: 0x8f2d4a19c6e3b7fa99d140e
AgriTwin Telemetry Engine v2.4 • Red AgroTech Región del Maule
========================================================================`;
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'INF-IOT-2026-MAULE_Fundo_Meniels.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        bus.emit('ui:show_toast', '📥 Informe técnico Maule descargado exitosamente (.txt)');
      });
    }

    // Acciones de la Pestaña Motores & Auditoría en el Admin Panel
    const btnLaunchInspector = document.getElementById('btnAdminLaunchEngineInspector');
    if (btnLaunchInspector) {
      btnLaunchInspector.addEventListener('click', () => {
        this.close();
        if (this.app?.engineInspectorModal) {
          this.app.engineInspectorModal.open();
        } else {
          bus.emit('ui:show_toast', '⚙️ Presiona Shift+D para abrir el Inspector de Motor 3D.');
        }
      });
    }

    const btnLaunchBioSim = document.getElementById('btnAdminLaunchBioSim');
    if (btnLaunchBioSim) {
      btnLaunchBioSim.addEventListener('click', () => {
        const modal = document.getElementById('bioSimModal');
        if (modal) modal.style.display = 'flex';
      });
    }

    const btnLaunchWindModal = document.getElementById('btnAdminLaunchWindModal');
    if (btnLaunchWindModal) {
      btnLaunchWindModal.addEventListener('click', () => {
        this.openWindDossierModal();
      });
    }

    const btnActivateAllWinds = document.getElementById('btnAdminActivateAllWinds');
    if (btnActivateAllWinds) {
      btnActivateAllWinds.addEventListener('click', () => {
        this.close();
        bus.emit('geomorph:toggle_wind_streamlines', true);
        bus.emit('ui:show_toast', '🌪️ Campo de vientos orográficos multidirreccionales activado en el Visor 3D.');
      });
    }

    const btnOpenMauleBoard = document.getElementById('btnAdminOpenMauleIoTBoard');
    if (btnOpenMauleBoard) {
      btnOpenMauleBoard.addEventListener('click', () => {
        const stationB = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_b');
        if (stationB) {
          this.openStationModal(stationB);
        }
      });
    }

    const btnLaunchReporte = document.getElementById('btnAdminLaunchReporteTecnico');
    if (btnLaunchReporte) {
      btnLaunchReporte.addEventListener('click', () => {
        const modal = document.getElementById('reporteTecnicoModal');
        if (modal) modal.style.display = 'flex';
      });
    }

    // Maule Sensor Network Tabs Listener
    document.querySelectorAll('.maule-sensor-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.dataset.mauleTab;
        if (tabKey) {
          this.selectedMauleSensorTab = tabKey;
          this.render();
        }
      });
    });

    // Selector de Modo de Caja de Terreno (Operación vs Esquema de Conexiones Físicas)
    document.querySelectorAll('.enclosure-main-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab) {
          this.selectedEnclosureTab = tab;
          this.render();
        }
      });
    });

    // Selector de Circuitos en el Gemelo de Conexiones
    document.querySelectorAll('.btn-select-circuit').forEach(btn => {
      btn.addEventListener('click', () => {
        const cId = btn.dataset.circuitId;
        if (cId) {
          this.selectedCircuitId = cId;
          this.render();
        }
      });
    });

    // Pulso de señal interactivo en el Gemelo de Conexiones
    const btnPulse = document.getElementById('btnSimulateSignalPulse');
    const feedbackPulse = document.getElementById('signalPulseFeedback');
    if (btnPulse && feedbackPulse) {
      btnPulse.addEventListener('click', () => {
        feedbackPulse.style.display = 'block';
        btnPulse.style.background = '#22c55e';
        btnPulse.style.color = '#000000';
        setTimeout(() => {
          btnPulse.style.background = 'rgba(34, 197, 94, 0.2)';
          btnPulse.style.color = '#86efac';
        }, 300);
        setTimeout(() => {
          feedbackPulse.style.display = 'none';
        }, 4000);
      });
    }

    // Copiar código firmware en el Gemelo de Conexiones
    const btnCopyCode = document.getElementById('btnCopyFirmwareCode');
    if (btnCopyCode) {
      btnCopyCode.addEventListener('click', () => {
        const codePre = btnCopyCode.closest('div').parentElement.querySelector('pre');
        if (codePre) {
          navigator.clipboard.writeText(codePre.textContent).then(() => {
            const orig = btnCopyCode.textContent;
            btnCopyCode.textContent = '¡Copiado! ✓';
            btnCopyCode.style.color = '#4ade80';
            setTimeout(() => {
              btnCopyCode.textContent = orig;
              btnCopyCode.style.color = '#e4e4e7';
            }, 2000);
          });
        }
      });
    }

    // Selector de Ramas de la Caja de Terreno (General / Cuarteles / Establo)
    document.querySelectorAll('.enclosure-branch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const branchId = btn.dataset.branchId;
        if (branchId) {
          this.selectedEnclosureBranch = branchId;
          this.render();
        }
      });
    });

    // Conmutador Enlace Simulado vs. Hardware Real (ESP32)
    const btnToggleHwLink = document.getElementById('btnToggleHardwareLinkMode');
    if (btnToggleHwLink) {
      btnToggleHwLink.addEventListener('click', () => {
        const nextMode = weatherService.linkMode === 'live_hardware' ? 'simulated' : 'live_hardware';
        weatherService.setLinkMode(nextMode);
        this.render();
      });
    }

    // Conmutador Basculante de Interruptores / Relés Industriales
    document.querySelectorAll('.btn-toggle-actuator-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        const actId = btn.dataset.actId;
        if (actId) {
          actuatorManager.cycleMode(actId);
          this.render();
        }
      });
    });

    // Sub-pestañas de Registro Predial (station_map)
    document.querySelectorAll('.prop-registry-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.dataset.propTab;
        if (tabKey) {
          this.selectedPropertySubTab = tabKey;
          this.render();
        }
      });
    });

    // Selector de predio en modal station_map
    const selectPropModal = document.getElementById('selectModalPropertyRegistry');
    if (selectPropModal) {
      selectPropModal.addEventListener('change', (e) => {
        this.selectedPredioId = e.target.value;
        propertyRegistryManager.setSelectedProperty(this.selectedPredioId);
        this.render();
      });
    }

    // Botones de Marco Legal
    document.querySelectorAll('.legal-framework-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.legalKey;
        if (k) {
          this.selectedLegalDocTab = k;
          this.render();
        }
      });
    });

    // Carga de archivos en Bóveda Documental
    const btnTriggerUpload = document.getElementById('btnTriggerUploadLegalDoc');
    const inputUploadDoc = document.getElementById('inputUploadLegalDoc');
    if (btnTriggerUpload && inputUploadDoc) {
      btnTriggerUpload.addEventListener('click', () => inputUploadDoc.click());
      inputUploadDoc.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const sizeKb = (file.size / 1024).toFixed(1);
          const sizeStr = file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${sizeKb} KB`;
          const ext = file.name.split('.').pop().toLowerCase();
          const docType = ext === 'pdf' ? 'Documento Legal PDF' : (ext === 'dwg' ? 'Plano CAD Georreferenciado' : 'Archivo Predial');

          const reader = new FileReader();
          reader.onload = (re) => {
            propertyRegistryManager.addDocumentToProperty(this.selectedPredioId, {
              nombre: file.name,
              tipo: docType,
              emisor: 'Cargado por Propietario',
              fecha: new Date().toISOString().split('T')[0],
              tamano: sizeStr,
              verificado: true,
              nota: `Archivo ingresado localmente (${file.type || ext}).`,
              dataUrl: re.target?.result || null
            });
            this.render();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Descarga de documentos desde la Bóveda Documental
    document.querySelectorAll('.btn-download-vault-doc').forEach(btn => {
      btn.addEventListener('click', () => {
        const docName = btn.dataset.docName;
        const prop = propertyRegistryManager.getProperty(this.selectedPredioId);
        const doc = prop.documentos.find(d => d.nombre === docName);
        if (doc) {
          const content = doc.dataUrl || `DOCUMENTO PREDIAL DIGITALIZADO\nPredio: ${prop.name}\nRol SII: ${prop.rolSII}\nDocumento: ${doc.nombre}\nTipo: ${doc.tipo}\nEmisor: ${doc.emisor}\nFecha: ${doc.fecha}\nHash SHA-256: ${doc.hashSha256}\n\n[Contenido certificado bajo custodia en AgriTwin Digital Twin Bóveda]`;
          const isDataUrl = doc.dataUrl && doc.dataUrl.startsWith('data:');
          const a = document.createElement('a');
          if (isDataUrl) {
            a.href = doc.dataUrl;
          } else {
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            a.href = URL.createObjectURL(blob);
          }
          a.download = doc.nombre.endsWith('.txt') || doc.nombre.endsWith('.pdf') ? doc.nombre : `${doc.nombre}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          bus.emit('ui:show_toast', `📥 Descargando documento: ${doc.nombre}`);
        }
      });
    });

    // Eliminación de documentos de la Bóveda
    document.querySelectorAll('.btn-delete-vault-doc').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.dataset.docId;
        if (confirm('¿Deseas eliminar este documento del registro local?')) {
          propertyRegistryManager.deleteDocumentFromProperty(this.selectedPredioId, docId);
          this.render();
        }
      });
    });

    // Descarga de Dossier Consolidado Legal .txt
    const btnDownloadConsolidated = document.getElementById('btnDownloadConsolidatedReport');
    if (btnDownloadConsolidated) {
      btnDownloadConsolidated.addEventListener('click', () => {
        const prop = propertyRegistryManager.getProperty(this.selectedPredioId);
        const report = propertyRegistryManager.generateConsolidatedLegalReport(this.selectedPredioId);
        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DOSSIER_LEGAL_${prop.rolSII.replace('-', '_')}_${prop.name.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        bus.emit('ui:show_toast', `📥 Dossier Legal de ${prop.name} descargado exitosamente (.txt)`);
      });
    }

    // Botón Enfocar Predio en 3D
    const btnFocus3D = document.getElementById('btnFocusPredioIn3D');
    if (btnFocus3D) {
      btnFocus3D.addEventListener('click', () => {
        this.close();
        if (this.app?.uiController?.flyToColliguayLocal) {
          this.app.uiController.flyToColliguayLocal();
        } else {
          bus.emit('map:flyto', 'overview');
        }
        bus.emit('ui:show_toast', '🎯 Enfocando polígono de límites prediales y curvas de relieve en el Visor 3D.');
      });
    }

    // Modal listeners
    const adminBackdrop = document.getElementById('adminPanelBackdrop');
    if (adminBackdrop) {
      adminBackdrop.addEventListener('click', (e) => {
        if (e.target === adminBackdrop) {
          this.closeAdminPanel();
        }
      });
    }

    const btnFocusSensor = document.getElementById('btnFocusSensorIn3D');
    if (btnFocusSensor) {
      btnFocusSensor.addEventListener('click', () => {
        const activeKey = this.selectedMauleSensorTab || 'frost';
        const cfg = MAULE_SENSORS_CONFIG[activeKey] || MAULE_SENSORS_CONFIG.frost;
        this.close();
        if (this.app?.sensorManager) {
          this.app.sensorManager.highlightSensor(cfg.sensorId);
        }
        bus.emit('ui:show_toast', `🎯 Enfocando sensor ${cfg.name} en el Visor de Predio 3D.`);
      });
    }

    const btnToggleCampaign = document.getElementById('btnToggleCampaignFromAdmin');
    if (btnToggleCampaign) {
      btnToggleCampaign.addEventListener('click', () => {
        this.showCampaignBoard = !this.showCampaignBoard;
        this.render();
        bus.emit('ui:show_toast', this.showCampaignBoard ? '🗺️ Tablón de Misión visible.' : '🗺️ Tablón de Misión oculto.');
      });
    }

    const btnEnter3D = document.getElementById('btnEnter3DFromAdmin');
    if (btnEnter3D) {
      btnEnter3D.addEventListener('click', () => {
        this.close();
        if (this.app?.mapManager?.flyToPreset) {
          this.app.mapManager.flyToPreset('overview');
        }
        bus.emit('ui:show_toast', '🌾 Entrando al Gemelo Digital 3D del Predio.');
      });
    }

    const btnJumpTerritorial = document.getElementById('btnJumpTerritorial');
    if (btnJumpTerritorial) {
      btnJumpTerritorial.addEventListener('click', () => {
        this.close();
        const btn = document.getElementById('nav_profile_territorial');
        if (btn) btn.click();
        bus.emit('ui:show_toast', '📻 Conectando con la Red Territorial & APRs.');
      });
    }

    const btnCloseModal = document.getElementById('btnCloseStationModal');
    const btnDismissModal = document.getElementById('btnDismissStationModal');
    if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeStationModal());
    if (btnDismissModal) btnDismissModal.addEventListener('click', () => this.closeStationModal());

    const btnAction = document.getElementById('btnExecuteStationAction');
    if (btnAction && this.activeModalStation) {
      btnAction.addEventListener('click', () => {
        const st = this.activeModalStation;
        if (st.id === 'station_b') {
          const activeKey = this.selectedMauleSensorTab || 'frost';
          const cfg = MAULE_SENSORS_CONFIG[activeKey] || MAULE_SENSORS_CONFIG.frost;
          this.close();
          if (this.app?.sensorManager) {
            this.app.sensorManager.highlightSensor(cfg.sensorId);
          }
          bus.emit('ui:show_toast', `🎯 Enfocando sensor ${cfg.name} en el Visor de Predio 3D.`);
          return;
        }
        this.close();
        if (st.action) {
          st.action(this.app, this);
        }
      });
    }

    // Inicializar Gráfica Chart.js si el modal está abierto
    if (this.activeModalStation) {
      this.initChart(this.activeModalStation);
    }
  }

  openAdminPanelWithTab(tabId) {
    if (this.overlayEl) {
      this.overlayEl.style.display = 'flex';
      this.overlayEl.classList.add('active');
    }
    this.showAdminPanel = true;
    this.activeAdminTab = tabId || 'sensors';
    this.activeModalStation = null;
    this.audio?.playParchmentOpen();
    this.render();
  }

  closeAdminPanel() {
    this.showAdminPanel = false;
    if (this.currentChartInstance) {
      this.currentChartInstance.destroy();
      this.currentChartInstance = null;
    }
    this.render();
  }

  openStationModal(station) {
    const id = typeof station === 'string' ? station : station?.id;
    if (id === 'station_b') {
      this.activeModalStation = typeof station === 'object' ? station : WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_b');
      this.showAdminPanel = false;
      this.audio?.playWoodClick();
      this.render();
      return;
    }
    if (id === 'station_a') {
      this.openStrategicPermacultureModal();
      return;
    }
    else if (id === 'station_c') this.openAdminPanelWithTab('visor3d');
    else if (id === 'station_map') this.openAdminPanelWithTab('map');
    else if (id === 'station_d') this.openAdminPanelWithTab('vault');
    else if (id === 'station_e') this.openAdminPanelWithTab('territorial');
    else if (id === 'station_f') this.openAdminPanelWithTab('scripts');
    else this.openAdminPanelWithTab('sensors');
  }

  closeStationModal() {
    this.activeModalStation = null;
    if (this.currentChartInstance) {
      this.currentChartInstance.destroy();
      this.currentChartInstance = null;
    }
    this.render();
  }

  initChartForActiveTab() {
    const canvas = document.getElementById('stationDynamicChart');
    if (!canvas || !window.Chart) return;

    if (this.currentChartInstance) {
      this.currentChartInstance.destroy();
      this.currentChartInstance = null;
    }

    const ctx = canvas.getContext('2d');
    let cLabels, cDataset1, cDataset2, cLabel1, cLabel2, cColor1, cColor2, chartType = 'line';

    if (this.activeAdminTab === 'sensors') {
      const activeKey = this.selectedMauleSensorTab || 'frost';
      const cfg = MAULE_SENSORS_CONFIG[activeKey] || MAULE_SENSORS_CONFIG.frost;
      cLabels = cfg.chartLabels;
      cDataset1 = cfg.dataset1;
      cDataset2 = cfg.dataset2;
      cLabel1 = cfg.label1;
      cLabel2 = cfg.label2;
      cColor1 = cfg.color || '#38bdf8';
      cColor2 = '#fbbf24';
    } else if (this.activeAdminTab === 'predios') {
      const st = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_a');
      cLabels = st?.chartData?.labels || ['Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'];
      cDataset1 = st?.chartData?.dataset1 || [18, 38, 64, 85, 96];
      cDataset2 = st?.chartData?.dataset2 || [25, 48, 72, 89, 98];
      cLabel1 = st?.chartData?.label1 || 'Regeneración Suelo Vivo (%)';
      cLabel2 = st?.chartData?.label2 || 'Independencia de Insumos (%)';
      cColor1 = '#10b981';
      cColor2 = '#fbbf24';
    } else if (this.activeAdminTab === 'visor3d') {
      const st = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_c');
      cLabels = st?.chartData?.labels || ['Cuartel A', 'Cuartel B', 'Cuartel C', 'Cuartel D', 'Borde Estero'];
      cDataset1 = st?.chartData?.dataset1 || [0.78, 0.82, 0.65, 0.71, 0.89];
      cDataset2 = st?.chartData?.dataset2 || [12.4, 8.6, 14.1, 9.8, 5.2];
      cLabel1 = st?.chartData?.label1 || 'Índice Vigor NDVI';
      cLabel2 = st?.chartData?.label2 || 'Área Cuartel (ha)';
      cColor1 = '#22c55e';
      cColor2 = '#f59e0b';
      chartType = 'bar';
    } else if (this.activeAdminTab === 'map') {
      const st = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_map');
      cLabels = st?.chartData?.labels || ['Fundo Meniels', 'Forestal Pinos', 'Viña Santa Elena', 'Don Pedro', 'Los Boldos'];
      cDataset1 = st?.chartData?.dataset1 || [100, 100, 85, 70, 100];
      cDataset2 = st?.chartData?.dataset2 || [12.8, 140.0, 35.2, 18.0, 62.0];
      cLabel1 = st?.chartData?.label1 || 'Conformidad Legal %';
      cLabel2 = st?.chartData?.label2 || 'Superficie (ha)';
      cColor1 = '#38bdf8';
      cColor2 = '#f59e0b';
      chartType = 'bar';
    } else if (this.activeAdminTab === 'vault') {
      const st = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_d');
      cLabels = st?.chartData?.labels || ['2020', '2021', '2022', '2023', '2024', '2025'];
      cDataset1 = st?.chartData?.dataset1 || [1.8, 2.4, 3.1, 3.9, 4.8, 5.6];
      cDataset2 = st?.chartData?.dataset2 || [0.65, 0.70, 0.76, 0.82, 0.88, 0.92];
      cLabel1 = st?.chartData?.label1 || 'Carbono Secuestrado (tCO2e/ha)';
      cLabel2 = st?.chartData?.label2 || 'Índice Integridad IEI';
      cColor1 = '#10b981';
      cColor2 = '#c084fc';
    } else if (this.activeAdminTab === 'territorial') {
      const st = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_e');
      cLabels = st?.chartData?.labels || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      cDataset1 = st?.chartData?.dataset1 || [18, 24, 38, 45, 52, 42, 28];
      cDataset2 = st?.chartData?.dataset2 || [72, 70, 68, 65, 63, 62, 64];
      cLabel1 = st?.chartData?.label1 || 'Índice FWI Piro-Riesgo';
      cLabel2 = st?.chartData?.label2 || 'Nivel Freático Acuífero (%)';
      cColor1 = '#ef4444';
      cColor2 = '#0284c7';
    } else if (this.activeAdminTab === 'scripts') {
      const st = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_f');
      cLabels = st?.chartData?.labels || ['Draw Calls', 'Triángulos (k)', 'Texturas (MB)', 'Shader Passes', 'FPS'];
      cDataset1 = st?.chartData?.dataset1 || [4, 48, 32, 6, 60];
      cDataset2 = st?.chartData?.dataset2 || [12, 120, 96, 10, 30];
      cLabel1 = st?.chartData?.label1 || 'Métricas Actuales';
      cLabel2 = st?.chartData?.label2 || 'Umbral Máximo Seguro';
      cColor1 = '#fbbf24';
      cColor2 = '#a855f7';
      chartType = 'bar';
    } else {
      return;
    }

    const grad1 = ctx.createLinearGradient(0, 0, 0, 160);
    grad1.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    grad1.addColorStop(1, 'rgba(56, 189, 248, 0.02)');

    const grad2 = ctx.createLinearGradient(0, 0, 0, 160);
    grad2.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    grad2.addColorStop(1, 'rgba(251, 191, 36, 0.02)');

    this.currentChartInstance = new window.Chart(ctx, {
      type: chartType,
      data: {
        labels: cLabels,
        datasets: [
          {
            label: cLabel1,
            data: cDataset1,
            borderColor: cColor1,
            backgroundColor: chartType === 'bar' ? 'rgba(56, 189, 248, 0.5)' : grad1,
            borderWidth: 2,
            tension: 0.35,
            fill: chartType !== 'bar',
            pointBackgroundColor: cColor1,
            pointRadius: 3
          },
          {
            label: cLabel2,
            data: cDataset2,
            borderColor: cColor2,
            backgroundColor: chartType === 'bar' ? 'rgba(251, 191, 36, 0.5)' : grad2,
            borderWidth: 2,
            tension: 0.35,
            fill: chartType !== 'bar',
            pointBackgroundColor: cColor2,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#d6c4a8',
              font: { family: 'Georgia, serif', size: 10 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(22, 14, 10, 0.95)',
            titleColor: '#fbbf24',
            bodyColor: '#e6ccb2',
            borderColor: '#b45309',
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(120, 53, 15, 0.2)' },
            ticks: { color: '#94a3b8', font: { size: 9, family: 'monospace' } }
          },
          y: {
            grid: { color: 'rgba(120, 53, 15, 0.2)' },
            ticks: { color: '#94a3b8', font: { size: 9, family: 'monospace' } }
          }
        }
      }
    });
  }

  initChart(station) {
    const canvas = document.getElementById('stationDynamicChart');
    if (!canvas || !window.Chart) return;

    if (this.currentChartInstance) {
      this.currentChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');

    let cLabels, cDataset1, cDataset2, cLabel1, cLabel2, cColor1, cColor2;

    if (station.id === 'station_b') {
      const activeKey = this.selectedMauleSensorTab || 'frost';
      const cfg = MAULE_SENSORS_CONFIG[activeKey] || MAULE_SENSORS_CONFIG.frost;
      cLabels = cfg.chartLabels;
      cDataset1 = cfg.dataset1;
      cDataset2 = cfg.dataset2;
      cLabel1 = cfg.label1;
      cLabel2 = cfg.label2;
      cColor1 = cfg.color || '#38bdf8';
      cColor2 = '#fbbf24';
    } else {
      const cData = station.chartData;
      cLabels = cData.labels;
      cDataset1 = cData.dataset1;
      cDataset2 = cData.dataset2;
      cLabel1 = cData.label1;
      cLabel2 = cData.label2;
      cColor1 = '#fbbf24';
      cColor2 = '#34d399';
    }

    const grad1 = ctx.createLinearGradient(0, 0, 0, 160);
    grad1.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    grad1.addColorStop(1, 'rgba(56, 189, 248, 0.02)');

    const grad2 = ctx.createLinearGradient(0, 0, 0, 160);
    grad2.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    grad2.addColorStop(1, 'rgba(251, 191, 36, 0.02)');

    this.currentChartInstance = new window.Chart(ctx, {
      type: station.id === 'station_f' ? 'bar' : 'line',
      data: {
        labels: cLabels,
        datasets: [
          {
            label: cLabel1,
            data: cDataset1,
            borderColor: cColor1,
            backgroundColor: grad1,
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointBackgroundColor: cColor1,
            pointRadius: 3
          },
          {
            label: cLabel2,
            data: cDataset2,
            borderColor: cColor2,
            backgroundColor: grad2,
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointBackgroundColor: cColor2,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#d6c4a8',
              font: { family: 'Georgia, serif', size: 10 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(22, 14, 10, 0.95)',
            titleColor: '#fbbf24',
            bodyColor: '#e6ccb2',
            borderColor: '#b45309',
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(120, 53, 15, 0.2)' },
            ticks: { color: '#94a3b8', font: { size: 9, family: 'monospace' } }
          },
          y: {
            grid: { color: 'rgba(120, 53, 15, 0.2)' },
            ticks: { color: '#94a3b8', font: { size: 9, family: 'monospace' } }
          }
        }
      }
    });
  }

  open(playSound = true) {
    if (this.overlayEl) {
      this.overlayEl.style.display = 'flex';
      this.overlayEl.classList.add('active');
      this.showCampaignBoard = true;
      this.render();
      const floatBar = document.getElementById('floatingPlanMaestroBar');
      if (floatBar) floatBar.style.display = 'none';
      if (playSound) this.audio?.playBellGong();
    }
  }

  close() {
    if (this.overlayEl) {
      this.audio?.playWoodClick();
      this.overlayEl.classList.remove('active');
      this.overlayEl.style.display = 'none';
      this.closeStationModal();
      const floatBar = document.getElementById('floatingPlanMaestroBar');
      if (floatBar) floatBar.style.display = 'flex';
      if (this.app?.ui?.expandDrawer) {
        this.app.ui.expandDrawer();
      }
      if (this.app?.mapManager?.onWindowResize) {
        setTimeout(() => this.app.mapManager.onWindowResize(), 50);
      }
    }
  }

  openStrategicPermacultureModal() {
    const existing = document.getElementById('strategicPermacultureModal');
    if (existing) existing.remove();

    const placedObjs = this.app?.objectPlacementManager?.placedObjects || [];
    const countZ0 = placedObjs.filter(o => o.mollisonZone === 0).length;
    const countZ1 = placedObjs.filter(o => o.mollisonZone === 1).length;
    const countZ2 = placedObjs.filter(o => o.mollisonZone === 2).length;
    const countZ3 = placedObjs.filter(o => o.mollisonZone === 3).length;
    const countZ4 = placedObjs.filter(o => o.mollisonZone === 4).length;
    const countZ5 = placedObjs.filter(o => o.mollisonZone === 5).length;

    let totalCapex = 0;
    placedObjs.forEach(o => totalCapex += (Number(o.costClp) || 0));

    const modal = document.createElement('div');
    modal.id = 'strategicPermacultureModal';
    modal.className = 'modal-overlay glass-modal-backdrop';
    modal.style.cssText = 'display: flex; z-index: 100005; position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(14px); align-items: center; justify-content: center; padding: 16px;';

    modal.innerHTML = `
      <div style="background: linear-gradient(180deg, #24140b 0%, #150a04 100%); border: 2px solid #b45309; border-radius: 16px; max-width: 860px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.9), 0 0 35px rgba(245, 158, 11, 0.25); font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Header AoE3 Estilo Madera & Latón -->
        <div style="padding: 16px 22px; background: #1c0e07; border-bottom: 2px solid #78350f; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #120803; border: 1.5px solid #d97706; display: flex; align-items: center; justify-content: center; font-size: 24px;">
              📜
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 800; color: #fbbf24; background: #451a03; padding: 2px 8px; border-radius: 4px; border: 1px solid #92400e;">
                  OBJ-A • PLAN MAESTRO
                </span>
                <strong style="color: #ffffff; font-size: 15px; font-family: Georgia, serif; letter-spacing: 0.02em;">
                  Plan Maestro & Estratégico de Permacultura
                </strong>
              </div>
              <div style="font-size: 11px; color: #d6c4a8; margin-top: 2px;">
                Fundo Estero Colliguay (12.8 ha) • Retorno Agroecológico & Zonas 0-5 de Bill Mollison
              </div>
            </div>
          </div>
          <button id="btnCloseStrategicPermaculture" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); width: 32px; height: 32px; border-radius: 8px; font-size: 20px; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.color='white'; this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.color='#cbd5e1'; this.style.background='rgba(255,255,255,0.08)'">&times;</button>
        </div>

        <!-- Body con Scroll -->
        <div style="padding: 20px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; color: #e6ccb2;">
          
          <!-- 4 KPIs Estratégicos -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-family: 'JetBrains Mono', monospace;">
            <div style="background: #140803; border: 1px solid rgba(16, 185, 129, 0.4); padding: 10px; border-radius: 10px; text-align: center;">
              <span style="color: #64748b; font-size: 9px; display: block; text-transform: uppercase;">Suelo Vivo Acumulado</span>
              <strong style="color: #4ade80; font-size: 15px;">+340%</strong>
              <div style="color: #94a3b8; font-size: 9px; margin-top: 3px;">Materia orgánica & hongos</div>
            </div>
            <div style="background: #140803; border: 1px solid rgba(56, 189, 248, 0.4); padding: 10px; border-radius: 10px; text-align: center;">
              <span style="color: #64748b; font-size: 9px; display: block; text-transform: uppercase;">Cosecha Hídrica Keyline</span>
              <strong style="color: #38bdf8; font-size: 15px;">18.500 m³</strong>
              <div style="color: #94a3b8; font-size: 9px; margin-top: 3px;">Captación pluvial pasiva</div>
            </div>
            <div style="background: #140803; border: 1px solid rgba(245, 158, 11, 0.4); padding: 10px; border-radius: 10px; text-align: center;">
              <span style="color: #64748b; font-size: 9px; display: block; text-transform: uppercase;">Ahorro Anual Insumos</span>
              <strong style="color: #fbbf24; font-size: 15px;">$4.850.000</strong>
              <div style="color: #94a3b8; font-size: 9px; margin-top: 3px;">Cero NPK + -65% Diésel</div>
            </div>
            <div style="background: #140803; border: 1px solid rgba(168, 85, 247, 0.4); padding: 10px; border-radius: 10px; text-align: center;">
              <span style="color: #64748b; font-size: 9px; display: block; text-transform: uppercase;">Retorno Inversión</span>
              <strong style="color: #c084fc; font-size: 15px;">3.8 Años</strong>
              <div style="color: #94a3b8; font-size: 9px; margin-top: 3px;">Payback neto consolidado</div>
            </div>
          </div>

          <!-- Gráfica Dinámica Chart.js Curva 5 Años -->
          <div style="background: #120703; padding: 16px; border-radius: 12px; border: 1px solid rgba(180,83,9,0.5);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="font-family: Georgia, serif; font-size: 13.5px; font-weight: bold; color: #ffffff;">
                📈 Curva de Regeneración Biológica a 5 Años vs. Autosuficiencia (%)
              </div>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 9.5px; background: rgba(16,185,129,0.2); color: #34d399; padding: 2px 8px; border-radius: 4px; border: 1px solid #10b981;">
                Ground-Truth Maule Sur
              </span>
            </div>
            <div style="position: relative; height: 180px; width: 100%;">
              <canvas id="strategicPermacultureChart"></canvas>
            </div>
          </div>

          <!-- Las 6 Zonas Concéntricas de Bill Mollison con Conteo de Objetos Asentados -->
          <div style="background: #160a04; border: 1px solid #78350f; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: #fbbf24; font-family: Georgia, serif; font-size: 13px;">🌱 Zonificación de Bill Mollison (Zonas 0 a 5):</strong>
              <span style="font-size: 10px; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">1 Polígono = 1 Uso de Suelo • ${placedObjs.length} Elementos en Mapa</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 11px;">
              <div style="background: #100602; padding: 8px 10px; border-radius: 8px; border-left: 3px solid #ef4444;">
                <div style="display: flex; justify-content: space-between;">
                  <strong style="color: #f87171;">Zona 0: Casona & Núcleo</strong>
                  <span style="font-family: monospace; font-size: 10px; color: #fca5a5;">${countZ0} elem.</span>
                </div>
                <div style="color: #94a3b8; font-size: 10px; margin-top: 3px;">Hogar, taller IP67, secador solar y cocina. Frecuencia: Continua (múltiples visitas/día).</div>
              </div>

              <div style="background: #100602; padding: 8px 10px; border-radius: 8px; border-left: 3px solid #f97316;">
                <div style="display: flex; justify-content: space-between;">
                  <strong style="color: #fb923c;">Zona 1: Huerta & Hierbas</strong>
                  <span style="font-family: monospace; font-size: 10px; color: #fdba74;">${countZ1} elem.</span>
                </div>
                <div style="color: #94a3b8; font-size: 10px; margin-top: 3px;">Bancales intensivos, espiral aromática, vermicompostera y almácigos. Frecuencia: Diaria.</div>
              </div>

              <div style="background: #100602; padding: 8px 10px; border-radius: 8px; border-left: 3px solid #eab308;">
                <div style="display: flex; justify-content: space-between;">
                  <strong style="color: #fde047;">Zona 2: Huerto & Aves</strong>
                  <span style="font-family: monospace; font-size: 10px; color: #fef08a;">${countZ2} elem.</span>
                </div>
                <div style="color: #94a3b8; font-size: 10px; margin-top: 3px;">Frutales semi-intensivos, gallinero móvil (Egg Mobile), estanques y biofiltro. Frecuencia: 1-2 veces/día.</div>
              </div>

              <div style="background: #100602; padding: 8px 10px; border-radius: 8px; border-left: 3px solid #22c55e;">
                <div style="display: flex; justify-content: space-between;">
                  <strong style="color: #4ade80;">Zona 3: Praderas & PRV</strong>
                  <span style="font-family: monospace; font-size: 10px; color: #86efac;">${countZ3} elem.</span>
                </div>
                <div style="color: #94a3b8; font-size: 10px; margin-top: 3px;">Pastoreo Racional Voisin (8 potreros, 1.8 UGM/ha), viñedos y tranque Keyline. Frecuencia: Semanal.</div>
              </div>

              <div style="background: #100602; padding: 8px 10px; border-radius: 8px; border-left: 3px solid #06b6d4;">
                <div style="display: flex; justify-content: space-between;">
                  <strong style="color: #22d3ee;">Zona 4: Agroforestería</strong>
                  <span style="font-family: monospace; font-size: 10px; color: #67e8f9;">${countZ4} elem.</span>
                </div>
                <div style="color: #94a3b8; font-size: 10px; margin-top: 3px;">Cortinas cortaviento andinas, silvopastoreo leñoso y madera para leña. Frecuencia: Mensual/estacional.</div>
              </div>

              <div style="background: #100602; padding: 8px 10px; border-radius: 8px; border-left: 3px solid #a855f7;">
                <div style="display: flex; justify-content: space-between;">
                  <strong style="color: #c084fc;">Zona 5: Reserva Nativa</strong>
                  <span style="font-family: monospace; font-size: 10px; color: #d8b4fe;">${countZ5} elem.</span>
                </div>
                <div style="color: #94a3b8; font-size: 10px; margin-top: 3px;">Bosque esclerófilo (peumos, quillayes) y estero. Cero intervención (observación y aprendizaje).</div>
              </div>
            </div>
          </div>

          <!-- Sinergia & Auditoría What-If Dinámica -->
          <div style="background: #100703; border: 1px solid rgba(180,83,9,0.4); border-radius: 10px; padding: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div>
              <strong style="color: #fde047; font-size: 11.5px;">⚔️ Simulación What-If & Objetos Asentados:</strong>
              <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 2px;">
                ${placedObjs.length} estructuras activas en el mapa • Inversión asentada: <strong>$${totalCapex.toLocaleString('es-CL')} CLP</strong>
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button id="btnStratOpenDossier" style="padding: 6px 12px; background: #b45309; border: 1px solid #f59e0b; color: #ffffff; font-weight: bold; font-size: 11px; border-radius: 6px; cursor: pointer;">
                📐 Dossier Keyline
              </button>
              <button id="btnStratGoToMap" style="padding: 6px 14px; background: #16a34a; border: 1px solid #22c55e; color: #ffffff; font-weight: bold; font-size: 11px; border-radius: 6px; cursor: pointer;">
                🌐 Diseñar en Visor 3D ↗
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Inicializar gráfica Chart.js para Curva de 5 Años
    const canvas = document.getElementById('strategicPermacultureChart');
    if (canvas && window.Chart) {
      const ctx = canvas.getContext('2d');
      const grad1 = ctx.createLinearGradient(0, 0, 0, 160);
      grad1.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
      grad1.addColorStop(1, 'rgba(16, 185, 129, 0.02)');

      const grad2 = ctx.createLinearGradient(0, 0, 0, 160);
      grad2.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
      grad2.addColorStop(1, 'rgba(245, 158, 11, 0.02)');

      new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Año 1 (Inicio)', 'Año 2 (Establecimiento)', 'Año 3 (Maduración)', 'Año 4 (Autosuficiencia)', 'Año 5 (Clímax)'],
          datasets: [
            {
              label: 'Regeneración Suelo Vivo (%)',
              data: [18, 38, 64, 85, 96],
              borderColor: '#10b981',
              backgroundColor: grad1,
              borderWidth: 2.5,
              tension: 0.35,
              fill: true,
              pointBackgroundColor: '#10b981',
              pointRadius: 4
            },
            {
              label: 'Independencia de Insumos Sintéticos (%)',
              data: [25, 48, 72, 89, 98],
              borderColor: '#fbbf24',
              backgroundColor: grad2,
              borderWidth: 2.5,
              tension: 0.35,
              fill: true,
              pointBackgroundColor: '#fbbf24',
              pointRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: '#d6c4a8', font: { family: 'Georgia, serif', size: 10 } }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(120, 53, 15, 0.2)' },
              ticks: { color: '#94a3b8', font: { size: 9, family: 'monospace' } }
            },
            y: {
              grid: { color: 'rgba(120, 53, 15, 0.2)' },
              ticks: { color: '#94a3b8', font: { size: 9, family: 'monospace' } },
              max: 100
            }
          }
        }
      });
    }

    // Bindings
    document.getElementById('btnCloseStrategicPermaculture')?.addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.getElementById('btnStratOpenDossier')?.addEventListener('click', () => {
      modal.remove();
      if (typeof window.openDossierPlanMaestroModal === 'function') {
        window.openDossierPlanMaestroModal();
      } else {
        const dModal = document.getElementById('dossierPlanMaestroModal');
        if (dModal) dModal.style.display = 'flex';
      }
    });

    document.getElementById('btnStratGoToMap')?.addEventListener('click', () => {
      modal.remove();
      this.close();
      if (this.app?.mapManager?.flyToPreset) {
        this.app.mapManager.flyToPreset('overview');
      }
      if (this.app?.objectPlacementManager?.openDock) {
        setTimeout(() => this.app.objectPlacementManager.openDock(), 300);
      }
    });
  }

  openWindDossierModal() {
    const existing = document.getElementById('windDossierModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'windDossierModal';
    modal.className = 'modal-overlay glass-modal-backdrop';
    modal.style.cssText = 'display: flex; z-index: 100; position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(12px); align-items: center; justify-content: center; padding: 20px;';

    modal.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.98); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 14px; max-width: 760px; width: 100%; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Header -->
        <div style="padding: 16px 20px; background: rgba(245, 158, 11, 0.1); border-bottom: 1px solid rgba(245, 158, 11, 0.3); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 22px;">🌪️</span>
            <div>
              <div style="font-weight: 800; font-size: 14px; color: #fbbf24;">Fundamento Científico: Dinámica de Vientos en Cuenca</div>
              <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">MICROESCALA OROGRÁFICA 3D vs. MALLAS REGIONALES 2D (WINDY)</div>
            </div>
          </div>
          <button id="btnCloseWindDossier" style="background: transparent; border: none; font-size: 24px; color: #94a3b8; cursor: pointer;">&times;</button>
        </div>

        <!-- Body -->
        <div style="padding: 20px; overflow-y: auto; color: #cbd5e1; font-size: 11px; line-height: 1.55; display: flex; flex-direction: column; gap: 14px;">
          <!-- 1. Por qué no es uniforme como Windy -->
          <div style="background: rgba(0,0,0,0.3); padding: 12px 14px; border-radius: 8px; border-left: 3px solid #38bdf8;">
            <strong style="color: #38bdf8; font-size: 12px;">¿Por qué Windy cubre todo el mapa y en un visor de cuenca no debe ser así?</strong>
            <p style="margin: 6px 0 0 0; color: #94a3b8;">
              Modelos globales (ECMWF, GFS) operan a resoluciones de 9 a 22 km por celda. A esa escala, una montaña o una quebrada de 200m se promedia como una planicie; el motor de Windy dibuja una textura homogénea en pantalla plana (2D). Si proyectáramos ese campo sin considerar el DEM, las flechas atravesarían cerros de forma físicamente imposible. En AgriTwin, cada partícula sigue la cota del relieve <em>(Y = DEM(x, z) + h)</em> y sortea la orografía.
            </p>
          </div>

          <!-- 2. Matriz de las 4 Corrientes -->
          <div>
            <div style="font-weight: 700; color: #fbbf24; font-size: 12px; margin-bottom: 8px;">Las 4 Corrientes de Aire Físicas en la Cuenca del Maule:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 10px; border-radius: 8px;">
                <div style="font-weight: 700; color: #f87171;">🔴 1. Viento Puelche / Raco (ENE $\\to$ WSW)</div>
                <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">
                  Viento catabático de descenso andino (efecto foehn). Caliente y seco (~42 km/h, ráfagas >60 km/h). Activa la regla 30-30-30 y el índice FWI de incendios forestales.
                </div>
              </div>
              <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); padding: 10px; border-radius: 8px;">
                <div style="font-weight: 700; color: #38bdf8;">🔵 2. Brisa Marina Diurna (SW $\\to$ NE)</div>
                <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">
                  Flujo fresco del Pacífico impulsado por gradiente térmico vespertino. Asciende por laderas soleadas (~18 km/h), amortiguando el estrés térmico en frutales.
                </div>
              </div>
              <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); padding: 10px; border-radius: 8px;">
                <div style="font-weight: 700; color: #c084fc;">🟣 3. Drenaje Catabático Nocturno (Heladas)</div>
                <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">
                  Enfriamiento radiativo de laderas altas. El aire frío y denso desciende a baja velocidad (~9 km/h) a ras de suelo (0.8m) acumulándose en fondos de cuenca.
                </div>
              </div>
              <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 10px; border-radius: 8px;">
                <div style="font-weight: 700; color: #34d399;">🟢 4. Chorro Quebrada (Efecto Venturi)</div>
                <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">
                  Encajonamiento orográfico a lo largo del talweg del estero Colliguay. Flujo acelerado por conservación de masa, define el corredor biológico ripario.
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Formulación Matemática -->
          <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; font-family: monospace; font-size: 10px; color: #e2e8f0;">
            <div style="color: #fbbf24; font-weight: bold; margin-bottom: 4px;">Fórmula de Advección 3D Acoplada al DEM:</div>
            <div>P_{t+Δt}.x = P_t.x + (u_base + Δu_turb) * Δt</div>
            <div>P_{t+Δt}.z = P_t.z + (w_base + Δw_turb) * Δt</div>
            <div>P_{t+Δt}.y = DEM(P_x, P_z) + h_offset + A * sin(ω_y * t)</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 12px 20px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: flex-end; gap: 8px;">
          <button id="btnDismissWindDossier" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 11px;">Cerrar</button>
          <button id="btnApplyWindsFromDossier" style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #000; font-weight: bold; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 11px;">🌪️ Visualizar en Terreno 3D</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    document.getElementById('btnCloseWindDossier')?.addEventListener('click', closeModal);
    document.getElementById('btnDismissWindDossier')?.addEventListener('click', closeModal);
    document.getElementById('btnApplyWindsFromDossier')?.addEventListener('click', () => {
      closeModal();
      this.close();
      bus.emit('geomorph:toggle_wind_streamlines', true);
      bus.emit('ui:show_toast', '🌪️ Visualizando corrientes orográficas en el Gemelo 3D.');
    });
  }

  initMermaidInVault() {
    const target = document.getElementById('vaultMermaidTarget');
    if (!target) return;

    if (!this.selectedVaultDiagram) {
      this.selectedVaultDiagram = 'arch';
    }

    const diagrams = {
      arch: `%%{init: {
  "theme": "base",
  "themeVariables": {
    "fontFamily": "Outfit, -apple-system, sans-serif",
    "darkMode": true,
    "background": "transparent",
    "primaryColor": "#064e3b",
    "primaryTextColor": "#f0fdf4",
    "primaryBorderColor": "#10b981",
    "lineColor": "#38bdf8",
    "secondaryColor": "#1e1b4b",
    "tertiaryColor": "#180d06"
  }
}}%%
graph TB
    classDef iot fill:#064E3B,stroke:#10B981,stroke-width:2px,color:#ECFDF5;
    classDef srv fill:#1E1B4B,stroke:#818CF8,stroke-width:2px,color:#E0E7FF;
    classDef client fill:#0C4A6E,stroke:#38BDF8,stroke-width:2px,color:#F0F9FF;
    classDef render fill:#431407,stroke:#FB923C,stroke-width:2px,color:#FFF7ED;

    subgraph TERRENO["🌱 CAPA 1: Hardware IoT Terreno (C / C++ Embebido)"]
        direction LR
        FDR["💧 Sondas FDR Suelo<br/>(20-100cm multinivel)"]:::iot -->|ADC| ESP(["⚡ ESP32 DevKit v1/S3<br/>firmware/esp32_enclosure.ino"]):::iot
        CLIM["🌡️ BME280 / SHT45<br/>(T° / RH / Presión)"]:::iot -->|I2C| ESP
        ESP -->|GPIO| RELE["🔌 Relés Industriales<br/>(Bomba Pozo & Riego)"]:::iot
        ESP -->|SPI| TFT["📟 Display ILI9341 3.5''<br/>(Pantalla de Campo)"]:::iot
    end

    subgraph BACK["⚡ CAPA 2: Backend & Sincronización Local (Node.js :7773)"]
        direction LR
        API_TEL["📡 API REST Telemetría<br/>/api/enclosure/telemetry"]:::srv
        SRV(["🖥️ Servidor HTTP Nativo<br/>server.cjs (Zero Deps)"]):::srv
        SYNC_CUENCA["🏔️ Acople Cuenca Longaví<br/>/api/basin-sync (:7774)"]:::srv
        API_TEL --- SRV --- SYNC_CUENCA
    end

    subgraph CLIENTE["🌐 CAPA 3: Gemelo Digital 3D & UX Diegética (WebGL / Three.js)"]
        direction TB
        subgraph ENGINES["🎨 Motores de Render & Simulación"]
            direction LR
            THREE["🎨 Three.js r128 + R3F<br/>PBR Shaders, Sombras 4K"]:::render
            CESIUM["🗺️ CesiumJS Engine<br/>Ortofoto Esri & DEM"]:::render
            SHADERS["✨ Shaders GLSL<br/>Normales Sobel & Humedad"]:::render
            SIM["🧬 Simulación FAO-56<br/>Estratos Radiculares"]:::client
        end
        subgraph FRONT["💻 Interfaz & Mando Táctico"]
            direction LR
            BROWSER(["💻 WebGL 2.0 @ 60 FPS<br/>Navegador / App de Escritorio"]):::client
            UI["🎛️ UI Glassmorphism<br/>EventBus Pub/Sub & Chart.js"]:::client
        end
        FRONT <--> ENGINES
    end

    ESP ==>|"📡 WiFi / 4G (Payload JSON)"| API_TEL
    SRV ==>|"⚡ WebSocket / EventBus Local"| BROWSER`,

      events: `%%{init: {
  "theme": "base",
  "themeVariables": {
    "fontFamily": "Outfit, -apple-system, sans-serif",
    "darkMode": true,
    "background": "transparent",
    "actorBkg": "#064e3b",
    "actorBorder": "#10b981",
    "actorTextColor": "#f0fdf4",
    "actorLineColor": "#38bdf8",
    "signalColor": "#38bdf8",
    "signalTextColor": "#f8fafc",
    "noteBkgColor": "#1c1917",
    "noteTextColor": "#fde047",
    "noteBorderColor": "#d97706",
    "sequenceNumberColor": "#022c22"
  }
}}%%
sequenceDiagram
    autonumber
    box #064e3b 🎛️ Interfaz Humana & Mandos
    actor Operador as 🧑‍🌾 Operador Agrícola
    participant UI as 🎛️ UIController<br/>(Glassmorphism)
    end
    box #1e1b4b 📡 Bus Desacoplado & Motores
    participant Bus as 📡 EventBus<br/>(Pub/Sub)
    participant Map as 🌐 MapManager<br/>(Three.js 3D)
    participant Sim as 🧬 SimulationEngine<br/>(Biofísica)
    end
    box #451a03 🌱 Capa de Terreno
    participant HW as ⚡ ESP32 & Sondas FDR<br/>(Hardware)
    end

    rect rgba(56, 189, 248, 0.16)
    note over Operador,Map: 🎯 1. ACCIÓN INTERACTIVA DEL USUARIO
    Operador->>UI: 👆 Clic en Sensor IOT-SN-02 o Cuartel
    UI->>Bus: 📡 emit('ENTITY_SELECTED', id)
    Bus->>Map: 🎥 Vuelo cinemático (flyTo) + Pulso Verde
    Bus->>UI: 📊 Abre Drawer Lateral & Curvas Chart.js
    end

    rect rgba(16, 185, 129, 0.16)
    note over HW,UI: 🔄 2. CICLO CONTINUO DE TELEMETRÍA (CADA 15s)
    loop Telemetría y Balance Biofísico
        HW->>Sim: 📦 Payload: Humedad 24.5%, T 18.2°C, VPD 1.1 kPa
        Sim->>Sim: 💧 Cálculo FAO-56 Penman-Monteith en 3 Estratos
        Sim->>Bus: 🔔 emit('TELEMETRY_UPDATED')
        Bus->>Map: 🎨 Actualiza gradientes GLSL de humedad en suelo
        Bus->>UI: 📈 Refresca Sparklines en vivo & Alertas de Helada
    end
    end`,

      tech: `%%{init: {
  "theme": "base",
  "themeVariables": {
    "fontFamily": "Outfit, -apple-system, sans-serif",
    "darkMode": true,
    "background": "transparent",
    "primaryColor": "#064e3b",
    "primaryTextColor": "#ffffff",
    "primaryBorderColor": "#10b981",
    "lineColor": "#38bdf8"
  }
}}%%
graph TB
    classDef root fill:#064E3B,stroke:#10B981,stroke-width:3px,color:#FFF;
    classDef cat fill:#180D06,stroke:#F59E0B,stroke-width:2px,color:#FDE68A;
    classDef leaf fill:#0F172A,stroke:#38BDF8,stroke-width:1.5px,color:#E2E8F0;

    ROOT(["🌿 AgriTwin 3D Platform<br/><b>Motor Biofísico Fundo Meniels</b>"]):::root

    subgraph G_CORE["🎨 1. Core Gráfico, 3D & Geoespacial"]
        direction LR
        subgraph M3D_BOX["🎨 Motores 3D & Shaders"]
            T1["Three.js r128 WebGL 2.0 @ 60 FPS"]:::leaf
            T2["CesiumJS Ortofoto Esri & DEM"]:::leaf
            T3["React Three Fiber (R3F)"]:::leaf
            T4["Shaders GLSL Sobel & PBR"]:::leaf
        end
        subgraph DAT_BOX["🗺️ Datos & Modelos"]
            D1["Modelos 3D GLTF / GLB 2.0"]:::leaf
            D2["Polígonos GeoJSON WGS84"]:::leaf
            D3["Shapefiles (.shp) shpjs Parser"]:::leaf
            D4["Ecosistema Maestro JSON"]:::leaf
        end
    end

    subgraph G_OPS["⚡ 2. Operación, Hardware & C2"]
        direction LR
        subgraph IOT_BOX["🌱 Hardware IoT Maule"]
            I1["ESP32 DevKit v1 / S3 (Dual Core)"]:::leaf
            I2["C / C++ Embebido (Arduino)"]:::leaf
            I3["Display SPI ILI9341 3.5'' Touch"]:::leaf
            I4["Sondas FDR Multinivel & Relés"]:::leaf
        end
        subgraph VIS_BOX["🚁 Visión & Drones C2"]
            V1["Postes Solares 4G a 33° N"]:::leaf
            V2["Edge AI YOLOv8-Nano / TPU"]:::leaf
            V3["WebRTC Streaming & Control PTZ"]:::leaf
            V4["DJI Dock 2 & Misión Reactiva"]:::leaf
        end
    end

    ROOT ==> G_CORE
    ROOT ==> G_OPS`,

      vision: `%%{init: {
  "theme": "base",
  "themeVariables": {
    "fontFamily": "Outfit, -apple-system, sans-serif",
    "darkMode": true,
    "background": "transparent",
    "actorBkg": "#064e3b",
    "actorBorder": "#10b981",
    "actorTextColor": "#ffffff",
    "actorLineColor": "#38bdf8",
    "signalColor": "#38bdf8",
    "signalTextColor": "#f8fafc",
    "noteBkgColor": "#1c1917",
    "noteTextColor": "#fde047",
    "noteBorderColor": "#d97706",
    "sequenceNumberColor": "#022c22",
    "activationBorderColor": "#f59e0b",
    "activationBkgColor": "#78350f"
  }
}}%%
sequenceDiagram
    autonumber
    box #064e3b 📹 Terreno & Edge AI (Postes Solares 4G)
    participant CAM as 📹 CAM-02 DGA<br/>(Canal Maule)
    participant EDGE as 🧠 Edge AI YOLOv8<br/>(Inferencia en Borde)
    end
    box #1e1b4b ⚡ Broker & Gemelo Digital 3D (C2)
    participant MQTT as ⚡ Broker MQTT / TLS<br/>(Telemetría JSON)
    participant TWIN as 🌐 AgriTwin 3D WebGL<br/>(Motor Three.js)
    end
    box #451a03 🚁 Estación Robótica Drone-in-a-Box
    participant DOCK as 🏢 DJI Dock 2<br/>(Hangar Estanco IP55)
    participant DRON as 🚁 Matrice 3D Quad<br/>(RGB + Térmica)
    end

    rect rgba(239, 68, 68, 0.2)
    note over CAM,EDGE: 🔴 FASE 1: DETECCIÓN PERIMETRAL EN EL BORDE
    CAM->>EDGE: 📡 Video stream RTSP continuo (15 fps @ 4MP)
    EDGE->>EDGE: ⚠️ Inferencia IA: Caída de caudal en canal (89% conf)
    EDGE->>MQTT: 🚨 Alerta JSON: CAM-02 WATER_DROP CRITICAL
    MQTT->>TWIN: ⚡ Push en tiempo real vía WebSocket / EventBus
    TWIN->>TWIN: 🔴 Frustum 3D volumétrico pulsa en Rojo Alerta (#ef4444)
    TWIN->>TWIN: 🎛️ OSD PiP activa badge de alerta y botón de intercepción
    end

    rect rgba(245, 158, 11, 0.2)
    note over TWIN,DRON: 🟡 FASE 2: DESPACHO TÁCTICO E INTERCEPCIÓN REACTIVA (<90s)
    Note over TWIN: 👤 Operador pulsa [🚁 Despachar Dron a este Punto] en visor PiP
    TWIN->>MQTT: 🎯 Comando MISSION_DISPATCH(Target_XYZ)
    MQTT->>DOCK: 🚀 Trigger misión: Apertura domo + Posicionamiento RTK
    DOCK->>DRON: 🛫 Despegue vertical autónomo hasta 22m AGL (Takeoff)
    DRON->>TWIN: 💨 Vuelo directo de crucero a 12 m/s hacia CAM-02
    TWIN->>TWIN: 📍 Proyecta Haz Láser Táctico 3D entre dron y cámara
    end

    rect rgba(16, 185, 129, 0.2)
    note over TWIN,DRON: 🟢 FASE 3: INSPECCIÓN CENITAL EN ÓRBITA Y RETORNO SEGURO
    DRON->>TWIN: 🔄 Órbita circular 360° con gimbal inclinado 45°
    DRON->>TWIN: 🎥 Transmisión en vivo de Feed Cenital estabilizado en PiP
    Note over TWIN,DRON: ✅ Verificación visual confirmada por operador / Incidencia resuelta
    DRON->>DOCK: 🛬 Return-to-Home (RTH) con navegación centimétrica
    DOCK->>DOCK: 🔌 Aterrizaje asistido, cierre de compuerta y recarga LiFePO4
    TWIN->>TWIN: 🌾 Shader PBR actualiza ortomosaico NDVI en caliente sin recargas
    end`
    };

    const code = diagrams[this.selectedVaultDiagram] || diagrams.arch;

    if (window.mermaid) {
      const id = 'mermaid-render-' + Date.now();
      try {
        window.mermaid.render(id, code).then(({ svg }) => {
          target.innerHTML = svg;
          const svgEl = target.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
            svgEl.style.borderRadius = '12px';
            svgEl.style.filter = 'drop-shadow(0 14px 32px rgba(0, 0, 0, 0.75))';

            // Inyectar estilos CSS avanzados para embellecer nodos, tipografías, gradientes y sombras del SVG
            const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
            style.textContent = `
              .actor { rx: 12px !important; ry: 12px !important; stroke-width: 2px !important; stroke: #34d399 !important; fill: #064e3b !important; filter: drop-shadow(0 6px 14px rgba(6,78,59,0.6)) !important; font-weight: 700 !important; font-size: 12px !important; }
              .actor text { fill: #f0fdf4 !important; font-family: 'Outfit', -apple-system, sans-serif !important; font-weight: 700 !important; }
              .actor-line { stroke: rgba(56, 189, 248, 0.4) !important; stroke-dasharray: 4 4 !important; stroke-width: 1.5px !important; }
              .messageLine0, .messageLine1 { stroke: #38bdf8 !important; stroke-width: 2px !important; filter: drop-shadow(0 2px 6px rgba(56, 189, 248, 0.6)) !important; }
              .messageText { font-family: 'Outfit', -apple-system, sans-serif !important; font-size: 11.5px !important; font-weight: 600 !important; fill: #f8fafc !important; text-shadow: 0 1px 4px rgba(0,0,0,0.9) !important; }
              .note { rx: 10px !important; ry: 10px !important; stroke: #f59e0b !important; stroke-width: 1.8px !important; fill: #1c1917 !important; filter: drop-shadow(0 6px 16px rgba(0,0,0,0.7)) !important; }
              .noteText { font-family: 'Outfit', sans-serif !important; font-weight: 700 !important; font-size: 11.5px !important; fill: #fef08a !important; }
              .node rect, .node circle, .node polygon { rx: 12px !important; ry: 12px !important; stroke-width: 2px !important; filter: drop-shadow(0 6px 16px rgba(0,0,0,0.5)) !important; }
              .node .label { font-family: 'Outfit', -apple-system, sans-serif !important; font-size: 12px !important; font-weight: 600 !important; }
              .cluster rect { rx: 16px !important; ry: 16px !important; stroke-width: 1.8px !important; fill-opacity: 0.3 !important; stroke: rgba(52, 211, 153, 0.5) !important; stroke-dasharray: 6 3 !important; filter: drop-shadow(0 4px 16px rgba(0,0,0,0.4)) !important; }
              .cluster .nodeLabel { font-family: 'Outfit', sans-serif !important; font-size: 13px !important; font-weight: 800 !important; fill: #fde047 !important; letter-spacing: 0.5px !important; }
              .edgeLabel { font-family: 'Outfit', sans-serif !important; font-size: 11px !important; font-weight: 700 !important; color: #fef08a !important; background-color: rgba(15,23,42,0.92) !important; padding: 3px 8px !important; border-radius: 6px !important; border: 1px solid rgba(245, 158, 11, 0.4) !important; }
              .edgePath path { stroke: #38bdf8 !important; stroke-width: 2px !important; filter: drop-shadow(0 2px 6px rgba(56, 189, 248, 0.4)) !important; }
              .marker { fill: #38bdf8 !important; stroke: #38bdf8 !important; }
              .sequenceNumber { font-weight: 900 !important; font-size: 10.5px !important; fill: #042f2e !important; }
            `;
            svgEl.prepend(style);
          }
        }).catch(err => {
          console.warn('[Mermaid render error]', err);
          target.innerHTML = `<pre style="color: #cbd5e1; font-size: 10px; font-family: monospace; text-align: left; background: #0f0704; padding: 10px; border-radius: 6px;">${code}</pre>`;
        });
      } catch (e) {
        target.innerHTML = `<pre style="color: #cbd5e1; font-size: 10px; font-family: monospace; text-align: left; background: #0f0704; padding: 10px; border-radius: 6px;">${code}</pre>`;
      }
    } else {
      target.innerHTML = `<pre style="color: #cbd5e1; font-size: 10px; font-family: monospace; text-align: left; background: #0f0704; padding: 10px; border-radius: 6px;">${code}</pre>`;
    }

    // Listeners para botones de pestañas del diagrama Mermaid
    document.querySelectorAll('.btn-mermaid-tab').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        document.querySelectorAll('.btn-mermaid-tab').forEach(b => {
          b.classList.remove('active');
          b.style.background = '#221209';
          b.style.borderColor = '#78350f';
          b.style.color = '#cbd5e1';
          b.style.boxShadow = 'none';
        });
        btn.classList.add('active');
        btn.style.background = 'rgba(245,158,11,0.25)';
        btn.style.borderColor = '#f59e0b';
        btn.style.color = '#fef08a';
        btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        this.selectedVaultDiagram = btn.dataset.diagram;
        this.initMermaidInVault();
      };
    });
  }

  toggle() {
    if (this.overlayEl && this.overlayEl.classList.contains('active')) {
      this.close();
    } else {
      this.open();
    }
  }
}
