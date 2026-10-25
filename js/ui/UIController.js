/**
 * AgriTwin - UIController Module (Enterprise SaaS 4-Tab Panel & Sensor Highlight)
 * 
 * Tabs:
 *  1. 🏡 Predio: Metabolism, 180m², 4 inhabitants, energy/water balance.
 *  2. ☀️ Clima & Sol: 3D Sun Trajectory Simulator, Wind Rose SVG, Parral Weather.
 *  3. 📡 Sensores: Active IoT Sensor Inventory with 3D map glowing selection.
 *  4. ⚡ Features: Solar panels, Bosca stove, Biomass & Food matrix.
 */

import { bus } from '../utils/EventBus.js';
import { ChartManager } from './ChartManager.js';
import { LivestockView } from './views/LivestockView.js?v=3.5.0';
import { ClimateScenarioModel } from '../sim/ClimateScenarioModel.js?v=3.0.0';
import { OpenMeteoForecastService } from '../sim/OpenMeteoForecastService.js?v=3.0.0';
import { PermacultureWhatIfEngine } from '../sim/PermacultureWhatIfEngine.js?v=4.0.0';

import { DashboardsView } from './drawers/DashboardsView.js';
import { EntityDetailPanels } from './panels/EntityDetailPanels.js';
import { solarAstroEngine } from '../utils/solar/SolarAstroEngine.js';
export class UIController {
  constructor(dataSource, simulationEngine) {
    this.dataSource = dataSource;
    this.simulationEngine = simulationEngine;
    this.solarAstroEngine = solarAstroEngine;
    this.dashboardsView = new DashboardsView(this);
    this.detailPanels = new EntityDetailPanels(this);

    this.sideDrawer = document.getElementById('sideDrawer');
    this.drawerTitle = document.getElementById('drawerTitle');
    this.drawerSubtitle = document.getElementById('drawerSubtitle');
    this.drawerBody = document.getElementById('drawerBody');
    this.closeDrawerBtn = document.getElementById('closeDrawerBtn');

    this.simToggleBtn = document.getElementById('simToggleBtn');
    this.simTimeEl = document.getElementById('simTime');
    this.totalAreaEl = document.getElementById('totalArea');
    this.activeSensorsEl = document.getElementById('activeSensors');
    this.avgMoistureEl = document.getElementById('avgMoisture');

    this.alertBanner = document.getElementById('alertBanner');
    this.alertMessage = document.getElementById('alertMessage');

    this.currentSelectedEntityId = null;
    this.activeHouseTab = 'metabolism'; // metabolism | weather | sensors | features
    this.selectedDayOfYear = 172; // Solsticio Invierno Parral
    this.selectedHourOfDay = 12;
    this.selectedSensorId = 'IOT-SN-01';
    this.currentAgroTwinMode = 'enterprise'; // enterprise | territorial | esg
    this.livestockView = new LivestockView(this);
    this.permacultureEngine = new PermacultureWhatIfEngine();
    window.permacultureWhatIfEngine = this.permacultureEngine;
  }

  init() {
    this.livestockView.initGlobalHandlers();
    this.setupDropdownMenus();
    this.setupEventListeners();
    this.setupAgroTwinModules();
    this.setupLayerToggles();
    this.setupCameraButtons();
    this.setupMapModeButtons();
    this.setupRiskButtons();
    this.setupSensorCardsButtons();
    this.setupSpeedButtons();
    this.setupReliefControls();
    this.setupGrazingChart();
    this.setupPermacultureToggles();
    this.setupDualModePredio();
    this.setupWindyControls();

    // Render Predio Dashboard on startup and keep drawer expanded
    this.activeHouseTab = 'metabolism';
    this.renderMainHouseDashboard();
    this.expandDrawer();

    bus.on('entity:selected', (data) => this.onEntitySelected(data));
    bus.on('entity:deselected', () => {
      this.selectedAnimalId = null;
      if (this.currentAgroTwinMode === 'territorial') {
        this.renderTerritorialDashboard();
      } else if (this.currentAgroTwinMode === 'esg') {
        this.renderEsgDashboard();
      } else {
        // En modo predio o general, volver al Menú de Predio (Metabolismo Fundo Meniels)
        this.activeHouseTab = 'metabolism';
        this.renderMainHouseDashboard();
      }
    });
    bus.on('sensor:telemetry_updated', (sensor) => this.onSensorUpdated(sensor));

    bus.on('object:placed', () => {
      if (this.activeHouseTab === 'permaculture' || this.activeHouseTab === 'metabolism') {
        this.renderMainHouseDashboard();
      }
    });
    bus.on('object:removed', () => {
      if (this.activeHouseTab === 'permaculture' || this.activeHouseTab === 'metabolism') {
        this.renderMainHouseDashboard();
      }
    });

    bus.on('simulation:tick', (data) => {
      if (this.simTimeEl) this.simTimeEl.textContent = data.simulatedHour;
      if (data.avgMoisture && this.avgMoistureEl) this.avgMoistureEl.textContent = data.avgMoisture;
      
      const riskBadge = document.getElementById('globalRiskBadge');
      if (riskBadge && data.globalRisk) {
        if (data.globalRisk === 'critical') {
          riskBadge.className = 'status-badge critical';
          riskBadge.innerHTML = `<span class="status-dot"></span> Crítico`;
        } else if (data.globalRisk === 'warning') {
          riskBadge.className = 'status-badge warning';
          riskBadge.innerHTML = `<span class="status-dot"></span> Alerta`;
        } else {
          riskBadge.className = 'status-badge optimal';
          riskBadge.innerHTML = `<span class="status-dot"></span> Bajo`;
        }
      }

      this.updateHeaderStats();
    });

    bus.on('simulation:state', (data) => {
      if (this.simToggleBtn) {
        this.simToggleBtn.classList.toggle('active', data.running);
        this.simToggleBtn.innerHTML = data.running ? 
          `<span>⏸ Pausar</span>` : 
          `<span>▶ Reanudar</span>`;
      }
    });

    bus.on('alert:triggered', (alertData) => this.showAlert(alertData.message));
    bus.on('basin:telemetry_updated', (basin) => this.onBasinUpdated(basin));
  }

  setupDropdownMenus() {
    const groups = document.querySelectorAll('.dropdown-group');

    const closeAll = () => {
      groups.forEach(group => {
        group.classList.remove('open');
        const btn = group.querySelector('.btn-dropdown');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    };

    groups.forEach(group => {
      const btn = group.querySelector('.btn-dropdown');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = group.classList.contains('open');
          closeAll();
          if (!isOpen) {
            group.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
          }
        });
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown-group')) {
        closeAll();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAll();
      }
    });

    this.closeAllDropdowns = closeAll;
  }

  openDrawer() {
    this.expandDrawer();
    if (this.sideDrawer) {
      this.sideDrawer.style.display = 'flex';
    }
  }

  collapseDrawer() {
    if (this.sideDrawer) {
      this.sideDrawer.classList.add('collapsed');
    }
    document.body.classList.add('drawer-collapsed');
  }

  expandDrawer() {
    if (this.sideDrawer) {
      this.sideDrawer.classList.remove('collapsed');
      this.sideDrawer.style.display = 'flex';
    }
    document.body.classList.remove('drawer-collapsed');
  }

  setupEventListeners() {
    if (this.closeDrawerBtn) {
      this.closeDrawerBtn.addEventListener('click', () => this.collapseDrawer());
    }

    const btnCollapse = document.getElementById('btnToggleDrawerCollapse');
    if (btnCollapse) {
      btnCollapse.addEventListener('click', () => this.collapseDrawer());
    }

    const btnOpen = document.getElementById('btnDrawerOpen');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        if (this.sideDrawer && this.sideDrawer.classList.contains('collapsed')) {
          this.expandDrawer();
        } else {
          this.collapseDrawer();
        }
      });
    }

    if (this.simToggleBtn) {
      this.simToggleBtn.addEventListener('click', () => {
        this.simulationEngine.toggle();
      });
    }

    // Modal Vista Vecinal Catan / Civ VI
    const btnVecinos = document.getElementById('btnVecinosCatanModal');
    const closeVecinos = document.getElementById('closeVecinosCatanModalBtn');
    if (btnVecinos) {
      btnVecinos.addEventListener('click', () => this.openVecinosCatanModal());
    }
    if (closeVecinos) {
      closeVecinos.addEventListener('click', () => this.closeVecinosCatanModal());
    }

    // Modal Ganadería Regenerativa & PRV
    const btnGanaderia = document.getElementById('btnGanaderiaModal');
    const closeGanaderia = document.getElementById('closeGanaderiaModalBtn');
    const btnUnderstoodGanaderia = document.getElementById('btnUnderstoodGanaderia');
    if (btnGanaderia) {
      btnGanaderia.addEventListener('click', () => this.openGanaderiaModal());
    }
    if (closeGanaderia) {
      closeGanaderia.addEventListener('click', () => this.closeGanaderiaModal());
    }
    if (btnUnderstoodGanaderia) {
      btnUnderstoodGanaderia.addEventListener('click', () => this.closeGanaderiaModal());
    }

    // Modal Informe Técnico & Mapas de Riesgo Dinámicos
    const btnReporte = document.getElementById('btnReporteTecnicoModal');
    const closeReporte = document.getElementById('closeReporteTecnicoModalBtn');
    if (btnReporte) {
      btnReporte.addEventListener('click', () => this.openReporteTecnicoModal());
    }
    if (closeReporte) {
      closeReporte.addEventListener('click', () => this.closeReporteTecnicoModal());
    }

    // Modal Transición Permacultural
    const btnPermacultura = document.getElementById('btnPermaculturaModal');
    const closePermacultura = document.getElementById('closePermaculturaModalBtn');
    const btnUnderstoodPermacultura = document.getElementById('btnUnderstoodPermacultura');
    if (btnPermacultura) {
      btnPermacultura.addEventListener('click', () => this.openPermaculturaModal());
    }
    if (closePermacultura) {
      closePermacultura.addEventListener('click', () => this.closePermaculturaModal());
    }
    if (btnUnderstoodPermacultura) {
      btnUnderstoodPermacultura.addEventListener('click', () => this.closePermaculturaModal());
    }

    // Global helper para cambiar pestañas del panel derecho de Predio
    window.selectPredioHouseTab = (tabId) => {
      this.activeHouseTab = tabId;
      this.openDrawer();
      this.renderMainHouseDashboard();
      if (tabId === 'livestock') bus.emit('map:flyto', 'livestock');
      if (tabId === 'permaculture') bus.emit('map:flyto', 'permaculture');
    };

    // Global helpers for report and risk map triggers
    window.rotateHerdTo = (paddockId) => {
      this.selectedPaddockId = paddockId;
      bus.emit('prv:move_herd', paddockId);
      this.renderMainHouseDashboard();
    };

    window.rotateCoopTo = (paddockId) => {
      bus.emit('prv:move_coop', paddockId);
      bus.emit('ui:show_toast', `🐓 Gallinero Móvil reubicado en potrero ${paddockId}`);
    };

    // (Gestión ganadera, fichas, vacunas y procedimientos clínicos delegados en LivestockView)

    window.togglePermacultureLayer = (layer, visible) => {
      if (layer === 'zones') bus.emit('layer:permaculture_zones', visible);
      if (layer === 'keyline') bus.emit('layer:keyline', visible);
      bus.emit('ui:show_toast', `🌱 Capa ${layer === 'zones' ? 'Zonificación 0-5' : 'Keyline'} ${visible ? 'activada' : 'oculta'}`);
    };

    window.setRiskInViewer = (mode) => {
      bus.emit('risk:set_mode', mode);
      bus.emit('ui:show_toast', `🗺️ Capa de Riesgo Activada: ${mode}`);
    };

    window.downloadAgriTwinReportTxt = () => {
      const date = new Date().toISOString().split('T')[0];
      const text = document.getElementById('reporteTextoPrevia')?.innerText || 'Auditoría AgriTwin Fundo Meniel';
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Auditoria_AgriTwin_Meniel_${date}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    };

    window.openReporteTecnicoModal = () => this.openReporteTecnicoModal();
    window.closeReporteTecnicoModal = () => this.closeReporteTecnicoModal();

    // Global Catan Territorial Helpers
    window.flyToColliguayLocal = () => this.flyToColliguayLocal();
    window.flyToTerritorialVecinal = () => this.flyToTerritorialVecinal();
    window.setCatanLens = (lens) => this.setCatanLens(lens);
    window.selectNeighborHex = (q, r) => this.selectNeighborHex(q, r);
    window.toggleAddNeighborForm = () => this.toggleAddNeighborForm();
    window.submitAddNeighborForm = () => this.submitAddNeighborForm();
    window.triggerSimPuelcheFire = () => this.triggerSimPuelcheFire();
    window.triggerSimFloodEstero = () => this.triggerSimFloodEstero();
    window.triggerSimGrazingAlliance = () => this.triggerSimGrazingAlliance();

    // Permaculture What-If Dossier Download
    window.downloadPermacultureReport = () => {
      const placed = window.objectPlacementManager?.placedObjects || [];
      const polys = this.drawingManager?.customPolygons || [];
      const parcels = this.parcelManager?.parcels || [];
      const metrics = this.permacultureEngine.evaluate(placed, polys, parcels);
      const md = this.permacultureEngine.generateMarkdownReport(metrics);
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Memoria_WhatIf_Permacultura_AgriTwin_${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      bus.emit('ui:show_toast', '📥 Memoria técnica What-If descargada con éxito.');
    };
  }

  openReporteTecnicoModal() {
    const modal = document.getElementById('reporteTecnicoModal');
    if (modal) modal.style.display = 'flex';
  }

  closeReporteTecnicoModal() {
    const modal = document.getElementById('reporteTecnicoModal');
    if (modal) modal.style.display = 'none';
  }

  openPermaculturaModal() {
    this.activeHouseTab = 'permaculture';
    this.openDrawer();
    this.renderMainHouseDashboard();
    bus.emit('layer:permaculture_zones', true);
    bus.emit('layer:keyline', true);
    bus.emit('map:flyto', 'permaculture');
    bus.emit('ui:show_toast', '🌱 Capas de Permacultura & Keyline activadas en 3D');
  }

  closePermaculturaModal() {
    const modal = document.getElementById('permaculturaModal');
    if (modal) modal.style.display = 'none';
  }

  openGanaderiaModal() {
    this.activeHouseTab = 'livestock';
    this.openDrawer();
    this.renderMainHouseDashboard();
    bus.emit('map:flyto', 'livestock');
    bus.emit('ui:show_toast', '🐄 Módulo de Ganadería PRV & Rebaño enfocado en 3D');
  }

  closeGanaderiaModal() {
    const modal = document.getElementById('ganaderiaModal');
    if (modal) modal.style.display = 'none';
  }

  openVecinosCatanModal() {
    this.flyToTerritorialVecinal();
  }

  closeVecinosCatanModal() {
    const modal = document.getElementById('vecinosCatanModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  flyToColliguayLocal() {
    if (this.mapManager && typeof this.mapManager.animateCamera === 'function') {
      const pos = new THREE.Vector3(28, 38, 48);
      const target = new THREE.Vector3(0, 0, 0);
      this.mapManager.animateCamera(pos, target, 1200);
    } else {
      bus.emit('map:flyto', 'overview');
    }
    this.activeHouseTab = 'metabolism';
    this.openDrawer();
    this.renderMainHouseDashboard();
    bus.emit('ui:show_toast', '🏡 Zoom In: Enfocando Predio Local - Fundo Estero Colliguay (12.8 ha)');
  }

  flyToTerritorialVecinal() {
    if (this.mapManager && typeof this.mapManager.animateCamera === 'function') {
      const pos = new THREE.Vector3(65, 85, 95);
      const target = new THREE.Vector3(0, 0, -10);
      this.mapManager.animateCamera(pos, target, 1200);
    } else {
      bus.emit('map:flyto', 'territorial');
    }
    this.openDrawer();
    const hex = this.selectedTerritorialHex || this.territorialCatanManager?.getHex(0, 0);
    this.renderTerritorialDashboard(hex);
    bus.emit('ui:show_toast', '🗺️ Zoom Out: Matriz Catan de Predios Vecinos Acoplados');
  }

  setCatanLens(lens) {
    if (this.territorialCatanManager) {
      this.territorialCatanManager.setLens(lens);
    }
    this.renderTerritorialDashboard(this.selectedTerritorialHex);
  }

  selectNeighborHex(q, r) {
    if (this.territorialCatanManager) {
      this.territorialCatanManager.selectHex(q, r);
      this.selectedTerritorialHex = this.territorialCatanManager.getHex(q, r);
      this.renderTerritorialDashboard(this.selectedTerritorialHex);
    }
  }

  toggleAddNeighborForm() {
    const el = document.getElementById('addNeighborFormContainer');
    const icon = document.getElementById('addNeighborToggleIcon');
    if (el) {
      const isHidden = el.style.display === 'none' || el.style.display === '';
      el.style.display = isHidden ? 'block' : 'none';
      if (icon) icon.textContent = isHidden ? '▲' : '▼';
    }
  }

  submitAddNeighborForm() {
    const name = document.getElementById('newHexName')?.value?.trim();
    const owner = document.getElementById('newHexOwner')?.value?.trim() || 'Propietario Contiguo';
    const surfaceHa = parseFloat(document.getElementById('newHexSurface')?.value) || 25.0;
    const biome = document.getElementById('newHexBiome')?.value || 'pasture';
    const dir = document.getElementById('newHexDirection')?.value || '0,-2';
    const fwi = parseInt(document.getElementById('newHexFwi')?.value) || 30;
    const water = parseFloat(document.getElementById('newHexWater')?.value) || 20;
    const perma = document.getElementById('newHexPerma')?.value?.trim() || 'Acoplamiento agroecológico perimetral';

    if (!name) {
      bus.emit('ui:show_toast', '⚠️ Por favor ingresa el nombre del predio vecino.');
      return;
    }

    const [qStr, rStr] = dir.split(',');
    const q = parseInt(qStr);
    const r = parseInt(rStr);

    if (this.territorialCatanManager) {
      const newHex = this.territorialCatanManager.addNeighborHex({
        q, r,
        name,
        owner,
        surfaceHa,
        biome,
        fwi,
        waterRightsLs: water,
        permacultureRole: perma,
        dice: 5,
        yieldStr: '+3 🌾 +2 💧'
      });
      this.selectedTerritorialHex = newHex;
      this.renderTerritorialDashboard(newHex);
    }
  }

  triggerSimPuelcheFire() {
    if (this.territorialCatanManager) {
      this.territorialCatanManager.simulatePuelcheFire();
    }
  }

  triggerSimFloodEstero() {
    if (this.territorialCatanManager) {
      this.territorialCatanManager.simulateFluvialFlood();
    }
  }

  triggerSimGrazingAlliance() {
    if (this.territorialCatanManager) {
      this.territorialCatanManager.simulateGrazingAlliance();
    }
  }

  setupGrazingChart() {
    this.selectedPrvPaddockId = 'P1';

    const cards = document.querySelectorAll('.prv-paddock-card');
    const label = document.getElementById('selectedPaddockLabel');
    const btnRotate = document.getElementById('btnRotateHerdToSelected');
    const btnFocus = document.getElementById('btnFocusPaddock3D');
    const kpiPotrero = document.getElementById('prvKpiPotrero');
    const kpiEstado = document.getElementById('prvKpiEstado');

    const paddockInfo = {
      P1: { name: 'Potrero 1 - Trébol Blanco & Festuca', rest: '44 días (Punto Óptimo Alcanzado)', cm: 24, kgMs: 2850, x: 4, z: 2 },
      P2: { name: 'Potrero 2 - Alfalfa & Raygrass', rest: '41 días (Punto Óptimo Alcanzado)', cm: 22, kgMs: 2600, x: 10, z: 2 },
      P3: { name: 'Potrero 3 - Pastura Polifítica Central', rest: '1 día (Activo Hoy)', cm: 25, kgMs: 3100, x: 16, z: 2 },
      P4: { name: 'Potrero 4 - Silvopastoreo Cerezos', rest: '32 días (En Rebrote)', cm: 18, kgMs: 1950, x: 4, z: 9 },
      P5: { name: 'Potrero 5 - Trébol Subterráneo', rest: '24 días (En Rebrote)', cm: 15, kgMs: 1600, x: 10, z: 9 },
      P6: { name: 'Potrero 6 - Pradera Este', rest: '16 días (En Rebrote)', cm: 12, kgMs: 1250, x: 16, z: 9 },
      P7: { name: 'Potrero 7 - Franja de Infiltración Sur', rest: '8 días (En Rebrote)', cm: 8, kgMs: 800, x: 7, z: 15.5 },
      P8: { name: 'Potrero 8 - Cuadro Bajo Humedal', rest: '4 días (Gallinero Móvil desparasitando)', cm: 6, kgMs: 650, x: 15, z: 15.5 }
    };

    cards.forEach(card => {
      card.addEventListener('click', () => {
        const pid = card.getAttribute('data-paddock-id');
        if (!pid) return;
        this.selectedPrvPaddockId = pid;

        cards.forEach(c => c.style.outline = 'none');
        card.style.outline = '3px solid #fde047';

        const info = paddockInfo[pid];
        if (info && label) {
          label.textContent = `${info.name} • ${info.rest} • ${info.cm} cm`;
        }
      });
    });

    if (btnRotate) {
      btnRotate.addEventListener('click', () => {
        const pid = this.selectedPrvPaddockId || 'P1';
        bus.emit('prv:move_herd', pid);

        cards.forEach(c => {
          const isAct = c.getAttribute('data-paddock-id') === pid;
          c.classList.toggle('active', isAct);
          if (isAct) {
            c.style.borderColor = '#f59e0b';
            c.style.boxShadow = '0 0 14px rgba(245,158,11,0.6)';
          } else {
            c.style.boxShadow = 'none';
          }
        });

        if (kpiPotrero) kpiPotrero.textContent = `Potrero ${pid.replace('P', '')} (${pid})`;
        if (kpiEstado) kpiEstado.textContent = 'Ocupación: Día 1 de 2 • Carga 1.8 UGM/ha';

        this.showAlert(`🐄 Rebaño trasladado a Potrero ${pid}. Pastoreo Voisin en ejecución.`);
      });
    }

    if (btnFocus) {
      btnFocus.addEventListener('click', () => {
        this.closeGanaderiaModal();
        const pid = this.selectedPrvPaddockId || 'P1';
        const info = paddockInfo[pid];
        if (info && window.agriTwinApp && window.agriTwinApp.mapManager) {
          const mm = window.agriTwinApp.mapManager;
          mm.animateCamera(new THREE.Vector3(info.x, 16, info.z + 18), new THREE.Vector3(info.x, 0.5, info.z));
        }
      });
    }

    bus.on('prv:paddock_updated', (data) => {
      if (data && data.activePaddock) {
        if (kpiPotrero) kpiPotrero.textContent = `${data.activePaddock.name} (${data.activePaddock.id})`;
        if (kpiEstado) kpiEstado.textContent = 'Ocupación: Día 1 de 2 • Carga 1.8 UGM/ha';
      }
    });
  }

  setupPermacultureToggles() {
    let zonesActive = false;
    let keylineActive = false;
    let livestockActive = true;

    const btnZonesModal = document.getElementById('btnToggleZonesModal');
    const btnKeylineModal = document.getElementById('btnToggleKeylineModal');

    const btnZones3D = document.getElementById('btn_toggle_zones_3d');
    const btnKeyline3D = document.getElementById('btn_toggle_keyline_3d');
    const btnLivestock3D = document.getElementById('btn_toggle_livestock_3d');

    const toggleZones = () => {
      zonesActive = !zonesActive;
      bus.emit('layer:permaculture_zones', zonesActive);
      if (btnZonesModal) {
        btnZonesModal.style.background = zonesActive ? 'rgba(34, 197, 94, 0.45)' : 'rgba(34, 197, 94, 0.2)';
        btnZonesModal.style.borderColor = zonesActive ? '#4ade80' : '#22c55e';
      }
      if (btnZones3D) {
        btnZones3D.classList.toggle('active', zonesActive);
      }
      this.showAlert(zonesActive ? '🌿 Proyección 3D: Zonas 0 a 5 de Mollison Activadas' : '🌿 Zonas 0 a 5 Ocultas');
    };

    const toggleKeyline = () => {
      keylineActive = !keylineActive;
      bus.emit('layer:keyline', keylineActive);
      if (btnKeylineModal) {
        btnKeylineModal.style.background = keylineActive ? 'rgba(6, 182, 212, 0.45)' : 'rgba(6, 182, 212, 0.2)';
        btnKeylineModal.style.borderColor = keylineActive ? '#38bdf8' : '#06b6d4';
      }
      if (btnKeyline3D) {
        btnKeyline3D.classList.toggle('active', keylineActive);
      }
      this.showAlert(keylineActive ? '🚜 Hidrología Keyline Yeomans: Subsolado y flujo al tranque activados' : '🚜 Trazado Keyline Oculto');
    };

    const toggleLivestock = () => {
      livestockActive = !livestockActive;
      bus.emit('layer:livestock', livestockActive);
      if (btnLivestock3D) {
        btnLivestock3D.classList.toggle('active', livestockActive);
      }
      this.showAlert(livestockActive ? '🐄 Pastoreo PRV & Rebaño 3D Activado' : '🐄 Pastoreo PRV Oculto');
    };

    if (btnZonesModal) btnZonesModal.addEventListener('click', toggleZones);
    if (btnZones3D) btnZones3D.addEventListener('click', toggleZones);

    if (btnKeylineModal) btnKeylineModal.addEventListener('click', toggleKeyline);
    if (btnKeyline3D) btnKeyline3D.addEventListener('click', toggleKeyline);

    if (btnLivestock3D) btnLivestock3D.addEventListener('click', toggleLivestock);

    const btnSimTorrential = document.getElementById('btn_sim_torrential_rain');
    if (btnSimTorrential) {
      btnSimTorrential.addEventListener('click', () => {
        bus.emit('simulation:trigger_torrential_rain', { mm: 60, hours: 4 });
        this.showAlert('🌧️ Simulación What-If: Tormenta de 60 mm en 4 horas activada sobre la cuenca');
        if (this.closeAllDropdowns) this.closeAllDropdowns();
      });
    }
  }

  /**
   * PLAN MAESTRO: CONTROLADOR DE BOTÓN TOGGLE (ON / OFF)
   * Y APERTURA DEL DOSSIER EJECUTIVO (PUNTO 5)
   */
  setupDualModePredio() {
    const btnFloatToggle = document.getElementById('btn_toggle_plan_maestro');
    const labelFloat = document.getElementById('label_plan_maestro');
    const btnTbToggle = document.getElementById('btn_toggle_plan_maestro_tb');
    const btnFloatDossier = document.getElementById('btn_float_dossier');
    const btnReportDossierTb = document.getElementById('btn_open_dossier_tb');
    const yeomansPanel = document.getElementById('yeomansMasterPanel');
    const closeYeomansBtn = document.getElementById('closeYeomansPanelBtn');
    const panelMaestro = document.getElementById('panelMaestro');

    // Estado inicial: Desactivado
    this.isPlanMaestroActive = false;

    const setPlanMaestro = (active) => {
      this.isPlanMaestroActive = !!active;

      // Actualizar botón flotante
      if (btnFloatToggle) {
        btnFloatToggle.classList.toggle('active', this.isPlanMaestroActive);
      }
      if (labelFloat) {
        labelFloat.textContent = this.isPlanMaestroActive ? 'Plan Maestro: Activo' : 'Plan Maestro';
      }

      // Actualizar botón en toolbar
      if (btnTbToggle) {
        btnTbToggle.classList.toggle('active', this.isPlanMaestroActive);
      }

      // Conmutar botón de Dossier de Obra
      if (btnFloatDossier) {
        btnFloatDossier.style.display = this.isPlanMaestroActive ? 'flex' : 'none';
      }
      if (btnReportDossierTb) {
        btnReportDossierTb.style.display = this.isPlanMaestroActive ? 'flex' : 'none';
      }

      // Mostrar/Ocultar Panel de 18 Puntos de Yeomans
      if (yeomansPanel) {
        yeomansPanel.style.display = this.isPlanMaestroActive ? 'flex' : 'none';
      }

      // Si activamos Plan Maestro, atenuamos panel general para despejar la mesa
      if (panelMaestro) {
        panelMaestro.style.opacity = this.isPlanMaestroActive ? '0.4' : '1';
      }

      // Sincronizar con Hub padre
      try {
        if (window.parent && window.parent !== window && typeof window.parent.setPlanMaestroState === 'function') {
          window.parent.setPlanMaestroState(this.isPlanMaestroActive);
        }
      } catch(e) {}

      // Emitir al bus de eventos
      bus.emit('predio:plan_maestro_toggled', { active: this.isPlanMaestroActive });
      this.showAlert(this.isPlanMaestroActive ? 
        '🌿 Plan Maestro Activado: 18 Puntos de Yeomans y herramientas de diseño abiertas.' : 
        '🌱 Modo Predio 3D: Visor libre activo.'
      );
    };

    const toggle = () => setPlanMaestro(!this.isPlanMaestroActive);

    // Conectar clicks
    if (btnFloatToggle) btnFloatToggle.addEventListener('click', toggle);
    if (btnTbToggle) btnTbToggle.addEventListener('click', toggle);

    if (closeYeomansBtn && yeomansPanel) {
      closeYeomansBtn.addEventListener('click', () => {
        setPlanMaestro(false);
      });
    }

    // Exponer globalmente
    window.togglePlanMaestro = toggle;
    window.setPlanMaestroActive = (active) => setPlanMaestro(active);
    // Compatibilidad retroactiva
    window.setPredioDualMode = (mode) => setPlanMaestro(mode === 'designer');
    window.toggleYeomansPanel = () => toggle();

    // Modal Dossier de Obra (PUNTO 5)
    window.openDossierPlanMaestroModal = () => {
      const modal = document.getElementById('dossierPlanMaestroModal');
      if (modal) modal.style.display = 'flex';
    };

    window.downloadDossierObraTxt = () => {
      const text = `================================================================================
AGRITWIN 3D - DOSSIER EJECUTIVO DE OBRA & PLAN MAESTRO KEYLINE
METODOLOGÍA: ESCALA DE PERMANENCIA DE YEOMANS (18 PUNTOS)
PREDIO: FUNDO COLLIGUAY (12.8 ha) • MAULE SUR, CHILE
================================================================================

1. MEMORIA DE CUBICACIÓN HIDROLÓGICA (RETROEXCAVADORA):
   - Tranque de cota alta: 18,500 m³ (Cota 182.0 msnm)
   - Excavación proyectada: 8,400 m³
   - Terraplén compactado: 7,900 m³ (Corte y relleno equilibrado)
   - Zanjas de Infiltración (Swales): 1,240 metros lineales (Pendiente 0.25% off-fall)
   - Capacidad total de esponja de suelo: 930 m³ por evento de precipitación
   - Carga hidrostática disponible en Zona 0: 2.4 bar (24 mca, riego 100% por gravedad)

2. TABLA DE REPLANTEO TOPOGRÁFICO DE ESTACAS (TOPÓGRAFO / OPERADOR):
   [KP-01]  Keypoint Norte  | Cota 184.2 m | (x: 12.0, z: -10.0) | Inicio canal de desvío
   [SW-01]  Swale Primario  | Cota 183.8 m | (x: 18.0 a 34.0)   | Camellón con empaste vivo
   [TQ-01]  Tranque Alto    | Cota 182.0 m | (x: 34.0, z: -22.0) | Muro con núcleo de arcilla
   [PRV-01] Potrero 1 a 8   | Cota 174-180m| Cuarteles Voisin    | Manguera PE y bebedero móvil

3. CRONOGRAMA DE EJECUCIÓN (ORDEN DE PERMANENCIA):
   - Fase 1 (Mes 1-2): Agua (Tranque, zanjas y aliviaderos antes de lluvias)
   - Fase 2 (Mes 3-4): Accesos (Caminos de cresta y fajas cortafuegos)
   - Fase 3 (Mes 5-8): Árboles (Cortavientos mixtos y siembra de camellones)
   - Fase 4 (Mes 9-12): Seres Vivos (Cerco eléctrico PRV y entrada de piño)

AgriTwin Master Plan v1.0 • Hash MRV: 0xKEY-COLLIGUAY-18`;

      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Dossier_Obra_Plan_Maestro_Colliguay.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    // Helper global para invocar dibujo de ítems desde los 18 puntos
    window.triggerDrawPermacultureItem = (itemName) => {
      const triggerBtn = document.getElementById('btn_draw_polygon');
      if (triggerBtn) triggerBtn.click();
      this.showAlert(`✏️ Modo Pincel Activo: Dibuja el contorno para "${itemName}" y cierra el polígono.`);
    };

    window.triggerDrawItem = (itemName) => {
      const triggerBtn = document.getElementById('btn_draw_polygon');
      if (triggerBtn) triggerBtn.click();
      this.showAlert(`✏️ Modo Pincel Activo: Delimita la ubicación de "${itemName}".`);
    };
  }

  setupSpeedButtons() {
    const speeds = [
      { id: 'btn_speed_1x', mult: 1, label: '1x' },
      { id: 'btn_speed_2x', mult: 2, label: '2x' },
      { id: 'btn_speed_5x', mult: 5, label: '5x' }
    ];

    const triggerSimLabel = document.getElementById('trigger_sim_label');

    speeds.forEach(({ id, mult, label }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          speeds.forEach(s => {
            const el = document.getElementById(s.id);
            if (el) el.classList.remove('active');
          });
          btn.classList.add('active');
          if (triggerSimLabel) triggerSimLabel.textContent = label;
          this.simulationEngine.setSpeed(mult);
        });
      }
    });
  }

  setupRiskButtons() {
    const riskModes = [
      { id: 'btn_risk_none',  mode: 'none',  layer: 'pbr',  label: 'Normal' },
      { id: 'btn_risk_ndvi',  mode: 'ndvi',  layer: 'ndvi', label: 'NDVI (Sentinel-2)' },
      { id: 'btn_risk_dem',   mode: 'dem',   layer: 'dem',  label: 'DEM & Curvas' },
      { id: 'btn_risk_ndwi',  mode: 'ndwi',  layer: 'ndwi', label: 'NDWI (Agua)' },
      { id: 'btn_risk_nbr',   mode: 'nbr',   layer: 'nbr',  label: 'NBR (Biomasa)' },
      { id: 'btn_risk_water', mode: 'water', layer: 'pbr',  label: 'Hídrico' },
      { id: 'btn_risk_fire',  mode: 'fire',  layer: 'pbr',  label: 'Incendios' },
      { id: 'btn_risk_frost', mode: 'frost', layer: 'pbr',  label: 'Heladas' }
    ];

    const triggerRiskLabel = document.getElementById('trigger_risk_label');

    riskModes.forEach(({ id, mode, layer, label }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          riskModes.forEach(r => {
            const el = document.getElementById(r.id);
            if (el) el.classList.remove('active');
          });
          btn.classList.add('active');
          if (triggerRiskLabel) triggerRiskLabel.textContent = label;
          bus.emit('risk:set_mode', mode);
          if (layer) {
            bus.emit('map:set_layer_mode', layer);
          }
          if (this.closeAllDropdowns) this.closeAllDropdowns();
        });
      }
    });

    this.setupGeomorphicButtons();
  }

  setupGeomorphicButtons() {
    let waterActive = false;
    let windActive = false;
    let zonesActive = false;

    const btnWater = document.getElementById('btn_geo_water_flow');
    const btnWind  = document.getElementById('btn_geo_windy_stream');
    const btnZones = document.getElementById('btn_geo_hazard_zones');
    const btnAll   = document.getElementById('btn_geo_all_toggle');

    if (btnWater) {
      btnWater.addEventListener('click', () => {
        waterActive = !waterActive;
        btnWater.classList.toggle('active', waterActive);
        bus.emit('geomorph:toggle_water_flows', waterActive);
      });
    }

    if (btnWind) {
      btnWind.addEventListener('click', () => {
        windActive = !windActive;
        btnWind.classList.toggle('active', windActive);
        bus.emit('geomorph:toggle_wind_streamlines', windActive);
      });
    }

    // Toggles de corrientes individuales de viento
    const currentToggles = [
      { id: 'btn_geo_wind_puelche', currentId: 'puelche' },
      { id: 'btn_geo_wind_breeze', currentId: 'breeze' },
      { id: 'btn_geo_wind_catabatic', currentId: 'catabatic' },
      { id: 'btn_geo_wind_talweg', currentId: 'talweg' }
    ];

    currentToggles.forEach(item => {
      const btn = document.getElementById(item.id);
      if (btn) {
        let isCurrentActive = true;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          isCurrentActive = !isCurrentActive;
          btn.classList.toggle('active', isCurrentActive);
          bus.emit('geomorph:toggle_wind_current', { currentId: item.currentId, active: isCurrentActive });
          // Si activamos una corriente pero el maestro estaba apagado, activamos el maestro
          if (isCurrentActive && !windActive) {
            windActive = true;
            if (btnWind) btnWind.classList.add('active');
            bus.emit('geomorph:toggle_wind_streamlines', true);
          }
        });
      }
    });

    if (btnZones) {
      btnZones.addEventListener('click', () => {
        zonesActive = !zonesActive;
        btnZones.classList.toggle('active', zonesActive);
        bus.emit('geomorph:toggle_hazard_zones', zonesActive);
      });
    }

    if (btnAll) {
      btnAll.addEventListener('click', () => {
        const anyInactive = !waterActive || !windActive || !zonesActive;
        waterActive = anyInactive;
        windActive  = anyInactive;
        zonesActive = anyInactive;

        if (btnWater) btnWater.classList.toggle('active', waterActive);
        if (btnWind)  btnWind.classList.toggle('active', windActive);
        if (btnZones) btnZones.classList.toggle('active', zonesActive);

        bus.emit('geomorph:set_all_modes', {
          water: waterActive,
          wind:  windActive,
          zones: zonesActive
        });

        bus.emit('ui:show_toast', anyInactive ? '🗺️ Modo Estratigrafía & Geomorfología 3D Activado' : '🗺️ Flujos Estratigráficos Desactivados');
      });
    }
  }

  /**
   * Vincula el Dock Flotante Rápido de Capas estilo Windy, el Timeline Scrubber con Open-Meteo Real 7D,
   * y sincroniza los estados del motor GPU con los menús de la HUD.
   */
  setupWindyControls() {
    const triggerLabel = document.getElementById('trigger_geomorph_label');
    const btnWind = document.getElementById('btn_geo_windy_stream');

    bus.on('windy:state_changed', ({ enabled, layer }) => {
      if (btnWind) {
        btnWind.classList.toggle('active', enabled);
      }
      if (triggerLabel) {
        if (!enabled) {
          triggerLabel.textContent = 'Desactivado';
          triggerLabel.style.color = '';
        } else {
          const names = {
            wind_10m: 'Viento 10m',
            wind_gusts: 'Ráfagas',
            runoff_d8: 'Escorrentía',
            catabatic: 'Catabático',
            temp: 'Temperatura',
            precip: 'Lluvia',
            fwi: 'FWI Piro'
          };
          triggerLabel.textContent = names[layer] || 'Viento GPU';
          triggerLabel.style.color = '#38bdf8';
        }
      }
    });
  }

  /**
   * Actualiza y despliega la leyenda espectral interactiva (NDVI, DEM, NBR, NDWI)
   */
  updateSpectralLegend(mode) {
    const widget = document.getElementById('spectralLegendWidget');
    const title = document.getElementById('spectralLegendTitle');
    const ramp = document.getElementById('spectralLegendRamp');
    const labels = document.getElementById('spectralLegendLabels');
    const note = document.getElementById('spectralLegendNote');
    if (!widget) return;

    widget.style.display = 'block';

    if (mode === 'ndvi') {
      if (title) title.innerHTML = '🛰️ Índice NDVI Sentinel-2';
      if (ramp) {
        ramp.innerHTML = `
          <div style="flex: 1; background: #8c4516;" title="<0.15 Suelo desnudo"></div>
          <div style="flex: 1; background: #d9381e;" title="0.15-0.35 Estrés hídrico"></div>
          <div style="flex: 1; background: #f2d126;" title="0.35-0.60 Vigor moderado"></div>
          <div style="flex: 1; background: #38bf40;" title="0.60-0.75 Vigor alto"></div>
          <div style="flex: 1; background: #0b732e;" title=">0.75 Dosel óptimo Keyline"></div>
        `;
      }
      if (labels) labels.innerHTML = `<span>0.10 (Suelo)</span><span>0.40 (Estrés)</span><span>0.85 (Óptimo)</span>`;
      if (note) note.textContent = 'Bandas Sentinel-2 B8 (NIR) y B4 (Red). Resolución 10m.';
    } else if (mode === 'dem') {
      if (title) title.innerHTML = '🏔️ Relieve Hipsométrico DEM';
      if (ramp) {
        ramp.innerHTML = `
          <div style="flex: 1; background: #0284c7;" title="Lecho y estero"></div>
          <div style="flex: 1; background: #16a34a;" title="Terrazas bajas"></div>
          <div style="flex: 1; background: #eab308;" title="Laderas medias"></div>
          <div style="flex: 1; background: #ea580c;" title="Precordillera"></div>
          <div style="flex: 1; background: #f8fafc;" title="Cumbres Andinas"></div>
        `;
      }
      if (labels) labels.innerHTML = `<span>180m (Valle)</span><span>380m (Ladera)</span><span>>800m (Andes)</span>`;
      if (note) note.textContent = 'Curvas de nivel maestras cada 20m y secundarias cada 5m.';
    } else if (mode === 'nbr') {
      if (title) title.innerHTML = '🔥 Carga de Combustible NBR';
      if (ramp) {
        ramp.innerHTML = `
          <div style="flex: 1; background: #6b432e;" title="Suelo mineral / Cortafuego"></div>
          <div style="flex: 1; background: #d97706;" title="Matorral seco"></div>
          <div style="flex: 1; background: #dc2626;" title="Pino denso (Alto Combustible)"></div>
          <div style="flex: 1; background: #059669;" title="Bosque nativo húmedo"></div>
        `;
      }
      if (labels) labels.innerHTML = `<span>Cortafuego</span><span>Matorral</span><span>Pino Crítico</span>`;
      if (note) note.textContent = 'Ratio Normalizado de Calcinación / Biomasa para modelo Rothermel.';
    }
  }

  hideSpectralLegend() {
    const widget = document.getElementById('spectralLegendWidget');
    if (widget) widget.style.display = 'none';
  }

  /**
   * Muestra tarjeta reactiva con la recomendación de los 3 asesores de cuenca
   */
  showAdvisorDirective(scenario) {
    const card = document.getElementById('basinAdvisorDirectiveCard');
    const text = document.getElementById('advisorDirectiveText');
    if (!card || !text || !scenario.advisorDirectives) return;

    card.style.display = 'block';
    text.innerHTML = `
      <div style="margin-bottom: 4px;">
        <span style="color: #38bdf8; font-weight: 700;">💧 Dr. Albornoz (Hidráulica):</span> ${scenario.advisorDirectives.geografo}
      </div>
      <div style="margin-bottom: 4px;">
        <span style="color: #fbbf24; font-weight: 700;">🌪️ Dra. Oyarzún (Atmósfera):</span> ${scenario.advisorDirectives.meteorologa}
      </div>
      <div>
        <span style="color: #34d399; font-weight: 700;">🌿 Dr. Lagos (Riesgo Fluvial):</span> ${scenario.advisorDirectives.biologo}
      </div>
    `;
  }

  onBasinUpdated(basin) {
    const el = document.getElementById('basinSyncStatus');
    if (!el || !basin) return;
    const isLive = basin.status === 'ok';
    const flow = basin.flowRateM3s || 185;
    el.style.color = isLive ? '#10b981' : '#f59e0b';
    el.textContent = isLive ? `En Vivo :7774 (${flow} m³/s)` : `Calibrado (${flow} m³/s)`;
  }

  setupSensorCardsButtons() {
    const triggerSensorLabel = document.getElementById('trigger_sensor_cards_label');
    const triggerPolyLabel = document.getElementById('trigger_polygon_cards_label');

    const btnSensorHover = document.getElementById('btn_sensor_cards_hover');
    const btnSensorAll = document.getElementById('btn_sensor_cards_all');
    const btnSensorNone = document.getElementById('btn_sensor_cards_none');

    const btnPolyHover = document.getElementById('btn_polygon_cards_hover');
    const btnPolyNone = document.getElementById('btn_polygon_cards_none');

    const activateSensors = (mode = 'hover') => {
      if (btnSensorHover) btnSensorHover.classList.toggle('active', mode === 'hover');
      if (btnSensorAll) btnSensorAll.classList.toggle('active', mode === 'all');
      if (btnSensorNone) btnSensorNone.classList.toggle('active', mode === 'none');

      if (btnPolyHover) btnPolyHover.classList.remove('active');
      if (btnPolyNone) btnPolyNone.classList.add('active');

      if (triggerSensorLabel) triggerSensorLabel.textContent = mode === 'all' ? 'Todas' : (mode === 'none' ? 'Ocultas' : 'Hover');
      if (triggerPolyLabel) triggerPolyLabel.textContent = 'Oculto';

      bus.emit('hover_mode:set', mode === 'none' ? 'none' : 'sensors');
      bus.emit('sensor_cards:set_mode', mode);
    };

    const activatePolygons = () => {
      if (btnPolyHover) btnPolyHover.classList.add('active');
      if (btnPolyNone) btnPolyNone.classList.remove('active');

      if (btnSensorHover) btnSensorHover.classList.remove('active');
      if (btnSensorAll) btnSensorAll.classList.remove('active');
      if (btnSensorNone) btnSensorNone.classList.add('active');

      if (triggerPolyLabel) triggerPolyLabel.textContent = 'Hover';
      if (triggerSensorLabel) triggerSensorLabel.textContent = 'Ocultas';

      bus.emit('hover_mode:set', 'polygons');
      bus.emit('sensor_cards:set_mode', 'none');
    };

    const deactivateAll = () => {
      if (btnSensorHover) btnSensorHover.classList.remove('active');
      if (btnSensorAll) btnSensorAll.classList.remove('active');
      if (btnSensorNone) btnSensorNone.classList.add('active');

      if (btnPolyHover) btnPolyHover.classList.remove('active');
      if (btnPolyNone) btnPolyNone.classList.add('active');

      if (triggerSensorLabel) triggerSensorLabel.textContent = 'Ocultas';
      if (triggerPolyLabel) triggerPolyLabel.textContent = 'Oculto';

      bus.emit('hover_mode:set', 'none');
      bus.emit('sensor_cards:set_mode', 'none');
    };

    if (btnSensorHover) {
      btnSensorHover.addEventListener('click', () => {
        activateSensors('hover');
        bus.emit('ui:show_toast', '📡 Hovers de Sensores activados (Polígonos pausados para vista limpia).');
        if (this.closeAllDropdowns) this.closeAllDropdowns();
      });
    }

    if (btnSensorAll) {
      btnSensorAll.addEventListener('click', () => {
        activateSensors('all');
        bus.emit('ui:show_toast', '📡 Todas las tarjetas de sensores visibles.');
        if (this.closeAllDropdowns) this.closeAllDropdowns();
      });
    }

    if (btnSensorNone) {
      btnSensorNone.addEventListener('click', () => {
        deactivateAll();
        bus.emit('ui:show_toast', '🚫 Paneles de sensores ocultos.');
        if (this.closeAllDropdowns) this.closeAllDropdowns();
      });
    }

    if (btnPolyHover) {
      btnPolyHover.addEventListener('click', () => {
        activatePolygons();
        bus.emit('ui:show_toast', '🌾 Hovers de Polígonos activados (Sensores pausados para evitar saturación).');
        if (this.closeAllDropdowns) this.closeAllDropdowns();
      });
    }

    if (btnPolyNone) {
      btnPolyNone.addEventListener('click', () => {
        deactivateAll();
        bus.emit('ui:show_toast', '🚫 Hovers de polígonos desactivados.');
        if (this.closeAllDropdowns) this.closeAllDropdowns();
      });
    }

    // Toggle de geometría de polígonos de cuarteles
    const btnToggleParcelGeo = document.getElementById('btn_toggle_parcel_geometry');
    if (btnToggleParcelGeo) {
      let parcelsVisible = false;
      btnToggleParcelGeo.addEventListener('click', () => {
        parcelsVisible = !parcelsVisible;
        btnToggleParcelGeo.classList.toggle('active', parcelsVisible);
        btnToggleParcelGeo.innerHTML = parcelsVisible 
          ? '<span>🗺️</span> Ocultar Polígonos de Cuarteles' 
          : '<span>🗺️</span> Ver Polígonos de Cuarteles';
        bus.emit('layer:parcels', parcelsVisible);
        bus.emit('ui:show_toast', parcelsVisible ? '🗺️ Polígonos de cuarteles visibles.' : '🌱 Terreno limpio (Polígonos de cuarteles ocultos).');
        if (this.closeAllDropdowns) this.closeAllDropdowns();
      });
    }

    // Direct click on dropdown triggers (convenient 1-click toggle)
    const triggerSensorBtn = document.getElementById('trigger_sensor_cards_btn');
    const triggerPolyBtn = document.getElementById('trigger_polygon_cards_btn');

    // Support cycling or external synchronization
    bus.on('sensor_cards:cycle', () => {
      const isSensorHover = btnSensorHover && btnSensorHover.classList.contains('active');
      if (isSensorHover) {
        activatePolygons();
        bus.emit('ui:show_toast', '🌾 Hovers de Polígonos activados.');
      } else {
        activateSensors('hover');
        bus.emit('ui:show_toast', '📡 Hovers de Sensores activados.');
      }
    });

    bus.on('sensor_cards:mode_changed', (mode) => {
      if (mode === 'none') {
        if (btnSensorNone) btnSensorNone.classList.add('active');
        if (btnSensorHover) btnSensorHover.classList.remove('active');
        if (btnSensorAll) btnSensorAll.classList.remove('active');
        if (triggerSensorLabel) triggerSensorLabel.textContent = 'Ocultas';
      } else if (mode === 'hover') {
        if (btnSensorHover) btnSensorHover.classList.add('active');
        if (btnSensorNone) btnSensorNone.classList.remove('active');
        if (btnSensorAll) btnSensorAll.classList.remove('active');
        if (triggerSensorLabel) triggerSensorLabel.textContent = 'Hover';
      } else if (mode === 'all') {
        if (btnSensorAll) btnSensorAll.classList.add('active');
        if (btnSensorHover) btnSensorHover.classList.remove('active');
        if (btnSensorNone) btnSensorNone.classList.remove('active');
        if (triggerSensorLabel) triggerSensorLabel.textContent = 'Todas';
      }
    });
  }

  setupLayerToggles() {
    const layers = ['parcels', 'sensors', 'trees', 'permaculture'];
    const badgeEl = document.getElementById('trigger_layers_badge');

    const updateBadge = () => {
      if (!badgeEl) return;
      const activeCount = layers.filter(l => {
        const el = document.getElementById(`toggle_${l}`);
        return el && el.classList.contains('active');
      }).length;
      badgeEl.textContent = `${activeCount}/${layers.length}`;
    };

    layers.forEach(layer => {
      const toggleEl = document.getElementById(`toggle_${layer}`);
      if (toggleEl) {
        toggleEl.addEventListener('click', () => {
          const isActive = toggleEl.classList.toggle('active');
          updateBadge();
          bus.emit(`layer:${layer}`, isActive);
        });
      }
    });

    updateBadge();
  }

  setupCameraButtons() {
    const presets = [
      { id: 'cam_overview',  preset: 'overview',  label: 'General' },
      { id: 'cam_house',     preset: 'house',     label: 'Caserío' },
      { id: 'cam_solar',     preset: 'solar',     label: 'Agrovoltaico' },
      { id: 'cam_tractor',   preset: 'tractor',   label: 'Tractor RTK' },
      { id: 'cam_livestock', preset: 'livestock', label: 'Rebaño' },
      { id: 'cam_tranque',   preset: 'tranque',   label: 'Tranque Yeomans' },
      { id: 'cam_condor',    preset: 'condor',    label: 'Cóndor (Cuenca)' },
      { id: 'cam_sensors',   preset: 'sensors',   label: 'Nodos IoT' }
    ];

    const triggerCamLabel = document.getElementById('trigger_cam_label');
    const hudTour         = document.getElementById('hud_cinematic_tour');
    const hudTourTitle    = document.getElementById('hud_tour_title');
    const hudTourSub      = document.getElementById('hud_tour_subtitle');
    const btnStopTourHud  = document.getElementById('btn_stop_tour_hud');

    const hudWalk         = document.getElementById('hud_walkthrough');
    const btnStopWalkHud  = document.getElementById('btn_stop_walk_hud');

    const hudTimelapse    = document.getElementById('hud_solar_timelapse');
    const hudTimeTitle    = document.getElementById('hud_timelapse_title');
    const btnStopTimeHud  = document.getElementById('btn_stop_timelapse_hud');

    const btnToggleTour   = document.getElementById('btn_toggle_tour');
    const btnToggleWalk   = document.getElementById('btn_toggle_walk');
    const btnToggleTime   = document.getElementById('btn_toggle_timelapse');

    // Preset buttons binding
    presets.forEach(({ id, preset, label }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          presets.forEach(p => {
            const el = document.getElementById(p.id);
            if (el) el.classList.remove('active');
          });
          btn.classList.add('active');
          if (triggerCamLabel) triggerCamLabel.textContent = label;
          bus.emit('map:flyto', preset);
          if (this.closeAllDropdowns) this.closeAllDropdowns();
        });
      }
    });

    // Dynamic mode buttons binding
    if (btnToggleTour) {
      btnToggleTour.addEventListener('click', () => {
        bus.emit('map:toggle_tour');
        if (this.closeAllDropdowns) this.closeAllDropdowns();
      });
    }

    if (btnToggleWalk) {
      btnToggleWalk.addEventListener('click', () => {
        bus.emit('map:toggle_walkthrough');
        if (this.closeAllDropdowns) this.closeAllDropdowns();
      });
    }

    if (btnToggleTime) {
      btnToggleTime.addEventListener('click', () => {
        bus.emit('map:toggle_timelapse');
        if (this.closeAllDropdowns) this.closeAllDropdowns();
      });
    }

    // HUD close buttons
    if (btnStopTourHud) btnStopTourHud.onclick = () => bus.emit('map:stop_tour');
    if (btnStopWalkHud) btnStopWalkHud.onclick = () => bus.emit('map:stop_walkthrough');
    if (btnStopTimeHud) btnStopTimeHud.onclick = () => bus.emit('map:stop_timelapse');

    // Bus events for Cinematic Tour
    bus.on('tour:started', () => {
      if (hudTour) hudTour.style.display = 'flex';
      if (hudWalk) hudWalk.style.display = 'none';
      if (hudTimelapse) hudTimelapse.style.display = 'none';
      if (triggerCamLabel) triggerCamLabel.textContent = 'Tour 🚁';
      if (btnToggleTour) btnToggleTour.classList.add('active');
    });

    bus.on('tour:step', ({ spot, index, total }) => {
      if (hudTourTitle) hudTourTitle.textContent = `Tour Guiado: ${spot.label}`;
      if (hudTourSub) hudTourSub.textContent = `Parada ${index} de ${total} • ${spot.desc}`;
      presets.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) {
          if (p.preset === spot.id) el.classList.add('active');
          else el.classList.remove('active');
        }
      });
    });

    bus.on('tour:stopped', () => {
      if (hudTour) hudTour.style.display = 'none';
      if (btnToggleTour) btnToggleTour.classList.remove('active');
      if (triggerCamLabel) triggerCamLabel.textContent = 'General';
    });

    // Bus events for Walkthrough Mode
    bus.on('walkthrough:started', () => {
      if (hudWalk) hudWalk.style.display = 'flex';
      if (hudTour) hudTour.style.display = 'none';
      if (hudTimelapse) hudTimelapse.style.display = 'none';
      if (triggerCamLabel) triggerCamLabel.textContent = 'Paseo 🚶';
      if (btnToggleWalk) btnToggleWalk.classList.add('active');
    });

    bus.on('walkthrough:stopped', () => {
      if (hudWalk) hudWalk.style.display = 'none';
      if (btnToggleWalk) btnToggleWalk.classList.remove('active');
      if (triggerCamLabel) triggerCamLabel.textContent = 'General';
    });

    // Bus events for Solar Timelapse
    bus.on('timelapse:started', () => {
      if (hudTimelapse) hudTimelapse.style.display = 'flex';
      if (hudTour) hudTour.style.display = 'none';
      if (triggerCamLabel) triggerCamLabel.textContent = 'Timelapse 🌅';
      if (btnToggleTime) btnToggleTime.classList.add('active');
    });

    bus.on('timelapse:tick', ({ hour }) => {
      const h = Math.floor(hour);
      const m = Math.floor((hour - h) * 60);
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} hrs`;
      const isDay = (hour >= 6.8 && hour <= 19.2);

      if (hudTimeTitle) {
        hudTimeTitle.textContent = `Timelapse Solar 24h: ${timeStr} (${isDay ? 'Luz Día' : 'Noche Estrellada'})`;
      }

      const hourSlider = document.getElementById('slider_hour');
      if (hourSlider) {
        hourSlider.value = hour.toFixed(1);
        const valHour = document.getElementById('val_hour');
        if (valHour) valHour.textContent = timeStr;
      }
    });

    bus.on('timelapse:stopped', () => {
      if (hudTimelapse) hudTimelapse.style.display = 'none';
      if (btnToggleTime) btnToggleTime.classList.remove('active');
      if (triggerCamLabel) triggerCamLabel.textContent = 'General';
    });

    // Keyboard Shortcuts (C: Tour, P: Paseo a Pie, T: Timelapse, ESC: Detener)
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'c' || e.key === 'C') {
        bus.emit('map:toggle_tour');
      } else if (e.key === 'p' || e.key === 'P') {
        bus.emit('map:toggle_walkthrough');
      } else if (e.key === 't' || e.key === 'T') {
        bus.emit('map:toggle_timelapse');
      }
    });
  }

  setupMapModeButtons() {
    const modes = [
      { id: 'btn_mode_sat', mode: 'satellite', label: 'Satélite' },
      { id: 'btn_mode_civ6', mode: 'civ6', label: 'Gemelo 3D' },
      { id: 'btn_mode_hybrid', mode: 'hybrid', label: 'Híbrido' },
      { id: 'btn_mode_relief', mode: 'relief', label: 'Relieve DEM' }
    ];

    const triggerViewLabel = document.getElementById('trigger_view_label');

    modes.forEach(({ id, mode, label }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          modes.forEach(m => {
            const el = document.getElementById(m.id);
            if (el) el.classList.remove('active');
          });
          btn.classList.add('active');
          if (triggerViewLabel) triggerViewLabel.textContent = label;
          bus.emit('map:set_mode', mode);
          if (this.closeAllDropdowns) this.closeAllDropdowns();
        });
      }
    });
  }

  /**
   * Sets up 3D Relief & Depth exaggeration controls.
   * Handles preset multipliers (0.3x, 1.0x, 1.8x, 2.8x) and smooth continuous slider.
   */
  setupReliefControls() {
    const reliefPresets = [
      { id: 'btn_relief_flat', scale: 0.3, label: '0.3x' },
      { id: 'btn_relief_normal', scale: 1.0, label: '1.0x' },
      { id: 'btn_relief_elevated', scale: 1.8, label: '1.8x' },
      { id: 'btn_relief_extreme', scale: 2.8, label: '2.8x' }
    ];

    const triggerReliefLabel = document.getElementById('trigger_relief_label');
    const reliefSlider = document.getElementById('slider_relief_scale');
    const reliefSliderVal = document.getElementById('reliefSliderVal');

    const applyScale = (scale, btnId = null) => {
      const formatted = `${scale.toFixed(1)}x`;
      if (triggerReliefLabel) triggerReliefLabel.textContent = formatted;
      if (reliefSlider) reliefSlider.value = scale;
      if (reliefSliderVal) reliefSliderVal.textContent = formatted;

      reliefPresets.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.classList.toggle('active', p.id === btnId);
      });

      bus.emit('map:set_relief_scale', scale);
    };

    reliefPresets.forEach(({ id, scale }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          applyScale(scale, id);
          bus.emit('ui:show_toast', `⛰️ Relieve topográfico fijado a ${scale.toFixed(1)}x`);
          if (this.closeAllDropdowns) this.closeAllDropdowns();
        });
      }
    });

    if (reliefSlider) {
      reliefSlider.addEventListener('input', (e) => {
        const scale = parseFloat(e.target.value);
        applyScale(scale);
      });
    }

    // Sculpting buttons (+ ⛰️ Elevar / - ⛰️ Excavar)
    const btnSculptRaise = document.getElementById('btn_sculpt_raise');
    const btnSculptLower = document.getElementById('btn_sculpt_lower');
    const sculptHint     = document.getElementById('sculpt_active_hint');

    let currentSculptMode = null;

    const toggleSculpt = (mode, btn) => {
      if (currentSculptMode === mode) {
        currentSculptMode = null;
        btn.classList.remove('active');
        if (sculptHint) sculptHint.style.display = 'none';
        bus.emit('map:set_sculpt_mode', null);
        bus.emit('ui:show_toast', 'Modo esculpir desactivado.');
      } else {
        currentSculptMode = mode;
        if (btnSculptRaise) btnSculptRaise.classList.toggle('active', mode === 'raise');
        if (btnSculptLower) btnSculptLower.classList.toggle('active', mode === 'lower');
        if (sculptHint) sculptHint.style.display = 'block';
        bus.emit('map:set_sculpt_mode', mode);
        const label = (mode === 'raise') ? '➕⛰️ Hacedor de Relieves (Elevar)' : '➖⛰️ Hacedor de Profundidades (Excavar)';
        bus.emit('ui:show_toast', `${label} ACTIVO: Mantén presionado en el mapa para esculpir`);
      }
    };

    if (btnSculptRaise) {
      btnSculptRaise.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSculpt('raise', btnSculptRaise);
      });
    }

    if (btnSculptLower) {
      btnSculptLower.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSculpt('lower', btnSculptLower);
      });
    }

    bus.on('map:sculpt_mode_canceled', () => {
      currentSculptMode = null;
      if (btnSculptRaise) btnSculptRaise.classList.remove('active');
      if (btnSculptLower) btnSculptLower.classList.remove('active');
      if (sculptHint) sculptHint.style.display = 'none';
    });
  }

  setupAgroTwinModules() {
    // Botones de la barra superior de perfil
    const navEnterprise = document.getElementById('nav_profile_enterprise');
    const navTerritorial = document.getElementById('nav_profile_territorial');
    const navEsg = document.getElementById('nav_profile_esg');
    const navStudio = document.getElementById('nav_profile_studio');

    // Botones del dropdown inferior
    const btnEnterprise = document.getElementById('btn_mode_enterprise');
    const btnTerritorial = document.getElementById('btn_mode_territorial');
    const btnEsg = document.getElementById('btn_mode_esg');
    const btnStudio = document.getElementById('btn_mode_studio');
    const label = document.getElementById('trigger_agrotwin_mode_label');

    const allButtons = [
      navEnterprise, navTerritorial, navEsg, navStudio,
      btnEnterprise, btnTerritorial, btnEsg, btnStudio
    ].filter(Boolean);

    const selectMode = (mode, flyCamera = true) => {
      this.currentAgroTwinMode = mode;
      allButtons.forEach(b => b.classList.remove('active'));

      // Notificar al motor 3D MapManager (Single-Engine) para ajustar cámara y capas vectoriales
      bus.emit('map:set_profile', mode);

      if (mode === 'enterprise') {
        if (navEnterprise) navEnterprise.classList.add('active');
        if (btnEnterprise) btnEnterprise.classList.add('active');
        if (label) label.textContent = 'Enterprise';
        this.updateWhatsAppModalForProfile('enterprise');
        this.renderEnterpriseDashboard();
      } else if (mode === 'territorial') {
        if (navTerritorial) navTerritorial.classList.add('active');
        if (btnTerritorial) btnTerritorial.classList.add('active');
        if (label) label.textContent = 'Territorial';
        this.updateWhatsAppModalForProfile('territorial');
        this.renderTerritorialDashboard();
      } else if (mode === 'esg') {
        if (navEsg) navEsg.classList.add('active');
        if (btnEsg) btnEsg.classList.add('active');
        if (label) label.textContent = 'ESG / MRV';
        this.updateWhatsAppModalForProfile('esg');
        this.renderEsgDashboard();
      } else if (mode === 'studio') {
        if (navStudio) navStudio.classList.add('active');
        if (btnStudio) btnStudio.classList.add('active');
        if (label) label.textContent = 'Estudio';
        this.updateWhatsAppModalForProfile('studio');
        this.renderStudioDashboard();
      }

      this.openDrawer();

      // Cerrar dropdowns flotantes
      document.querySelectorAll('.dropdown-group').forEach(g => g.classList.remove('open'));

      // Notificar a la app padre en React (si está embebido)
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'AGROTWIN_PROFILE_CHANGED',
          profile: mode.toUpperCase(),
          timestamp: new Date().toISOString()
        }, '*');
      }
    };

    // Wire clicks para barra superior
    if (navEnterprise) navEnterprise.addEventListener('click', () => selectMode('enterprise'));
    if (navTerritorial) navTerritorial.addEventListener('click', () => selectMode('territorial'));
    if (navEsg) navEsg.addEventListener('click', () => selectMode('esg'));
    if (navStudio) navStudio.addEventListener('click', () => selectMode('studio'));

    // Wire clicks para dropdown inferior
    if (btnEnterprise) btnEnterprise.addEventListener('click', () => selectMode('enterprise'));
    if (btnTerritorial) btnTerritorial.addEventListener('click', () => selectMode('territorial'));
    if (btnEsg) btnEsg.addEventListener('click', () => selectMode('esg'));
    if (btnStudio) btnStudio.addEventListener('click', () => selectMode('studio'));

    // Listener para recibir órdenes desde Master Suite / React vía postMessage
    window.addEventListener('message', (event) => {
      if (!event.data) return;
      if (event.data.type === 'SET_AGROTWIN_PROFILE' || event.data.type === 'SET_PROFILE') {
        const targetMode = (event.data.profile || '').toLowerCase();
        if (['enterprise', 'territorial', 'esg', 'studio'].includes(targetMode)) {
          selectMode(targetMode, true);
        }
      }
      if (event.data.action === 'setRiskMode' || event.data.type === 'SET_RISK_MODE') {
        const mode = event.data.mode;
        bus.emit('risk:set_mode', mode);
      }
      if (event.data.action === 'openWorkshop') {
        window.openGalponWorkshop?.();
      }
      if (event.data.action === 'closeWorkshop') {
        window.closeGalponWorkshop?.();
      }
    });

    // Modals setup
    const btnWhatsApp = document.getElementById('btnWhatsAppModal');
    const modalWhatsApp = document.getElementById('whatsAppAlertModal');
    const closeWhatsApp = document.getElementById('closeWhatsAppModalBtn');

    if (btnWhatsApp && modalWhatsApp) {
      btnWhatsApp.addEventListener('click', () => { modalWhatsApp.style.display = 'flex'; });
    }
    if (closeWhatsApp && modalWhatsApp) {
      closeWhatsApp.addEventListener('click', () => { modalWhatsApp.style.display = 'none'; });
    }

    const btnBioSim = document.getElementById('btnBioSimModal');
    const modalBioSim = document.getElementById('bioSimModal');
    const closeBioSim = document.getElementById('closeBioSimModalBtn');
    const btnUnderstandBioSim = document.getElementById('btnUnderstandBioSim');

    if (btnBioSim && modalBioSim) {
      btnBioSim.addEventListener('click', () => { modalBioSim.style.display = 'flex'; });
    }
    if (closeBioSim && modalBioSim) {
      closeBioSim.addEventListener('click', () => { modalBioSim.style.display = 'none'; });
    }
    if (btnUnderstandBioSim && modalBioSim) {
      btnUnderstandBioSim.addEventListener('click', () => { modalBioSim.style.display = 'none'; });
    }
  }

  updateWhatsAppModalForProfile(profile) {
    const modalBody = document.querySelector('#whatsAppAlertModal [style*="background: #0b141a"]');
    if (!modalBody) return;

    if (profile === 'enterprise') {
      modalBody.innerHTML = `
        <div style="align-self: center; background: #182229; color: #8696a0; font-size: 10px; padding: 4px 10px; border-radius: 6px;">
          HOY • 05:00 AM • B2B ENTERPRISE
        </div>
        <div style="background: #005c4b; color: #e9edef; padding: 12px 14px; border-radius: 12px 12px 12px 2px; font-size: 12px; line-height: 1.5; box-shadow: 0 2px 5px rgba(0,0,0,0.3); max-width: 90%;">
          <strong style="color: #6ee7b7; display: block; font-size: 13px; margin-bottom: 4px;">🚨 ALERTA MATUTINA PREDIAL</strong>
          Predio: <strong>Meniels (Parral, Maule)</strong><br>
          Modelo: <span style="background: rgba(0,0,0,0.2); padding: 1px 4px; border-radius: 4px; font-family: monospace;">FAO-56 Penman-Monteith</span>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.15); margin: 8px 0;">
          • <strong>Riego Recomendado:</strong> Cuartel A (Brotes)<br>
          • <strong>Lámina de Reposición:</strong> 5.8 mm (42 minutos de bomba)<br>
          • <strong>Humedad Radicular (20-60cm):</strong> 28.4% (Estrés moderado)<br>
          • <strong>Riesgo Helada Katabática:</strong> Mínima prevista: 1.2°C a las 06:15 hrs en el bajo.<br>
          <div style="text-align: right; font-size: 9px; color: #a7f3d0; margin-top: 6px;">05:00 ✓✓</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
          <button style="background: #1f2c34; border: 1px solid #2a3942; color: #25d366; padding: 8px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; text-align: center;">
            💧 Confirmar Bomba de Riego Encendida
          </button>
          <button style="background: #1f2c34; border: 1px solid #2a3942; color: #38bdf8; padding: 8px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; text-align: center;">
            🗺️ Abrir Gemelo 3D en Teléfono
          </button>
        </div>
      `;
    } else if (profile === 'territorial') {
      modalBody.innerHTML = `
        <div style="align-self: center; background: #182229; color: #8696a0; font-size: 10px; padding: 4px 10px; border-radius: 6px;">
          HOY • 08:30 AM • B2G GOBERNANZA
        </div>
        <div style="background: #005c4b; color: #e9edef; padding: 12px 14px; border-radius: 12px 12px 12px 2px; font-size: 12px; line-height: 1.5; box-shadow: 0 2px 5px rgba(0,0,0,0.3); max-width: 90%;">
          <strong style="color: #38bdf8; display: block; font-size: 13px; margin-bottom: 4px;">🏛️ INFORME TERRITORIAL DE CUENCA</strong>
          Comuna: <strong>Parral / Cuenca Perquilauquén</strong><br>
          Destinatarios: <strong>Dirección de Obras & Comité APR</strong>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.15); margin: 8px 0;">
          • <strong>Semáforo de Acuífero:</strong> 🟡 Precaución (Nivel freático al 68%)<br>
          • <strong>Piro-Riesgo FWI Canadiense:</strong> 38 (Alto) en interfaz forestal.<br>
          • <strong>Rutas Aljibe Optimizadas:</strong> 14 rutas ahorradas este mes.<br>
          • <strong>Cortafuegos:</strong> 14.2 km despejados en Ribera Sur.<br>
          <div style="text-align: right; font-size: 9px; color: #a7f3d0; margin-top: 6px;">08:30 ✓✓</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
          <button style="background: #1f2c34; border: 1px solid #2a3942; color: #38bdf8; padding: 8px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; text-align: center;">
            🚒 Notificar a Brigada Forestal CONAF
          </button>
          <button style="background: #1f2c34; border: 1px solid #2a3942; color: #22c55e; padding: 8px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; text-align: center;">
            💧 Despachar Ruta Aljibe Prioritaria
          </button>
        </div>
      `;
    } else if (profile === 'esg') {
      modalBody.innerHTML = `
        <div style="align-self: center; background: #182229; color: #8696a0; font-size: 10px; padding: 4px 10px; border-radius: 6px;">
          HOY • 12:00 PM • ESG / MRV LEDGER
        </div>
        <div style="background: #005c4b; color: #e9edef; padding: 12px 14px; border-radius: 12px 12px 12px 2px; font-size: 12px; line-height: 1.5; box-shadow: 0 2px 5px rgba(0,0,0,0.3); max-width: 90%;">
          <strong style="color: #fbbf24; display: block; font-size: 13px; margin-bottom: 4px;">🌿 CERTIFICADO AUDITORÍA MRV</strong>
          Protocolo: <strong>EUDR Reglamento Europeo 2025</strong><br>
          Ledger Hash: <code style="color: #a7f3d0;">0x8f2d4a19c6e</code>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.15); margin: 8px 0;">
          • <strong>Deforestación Neta:</strong> 0.00% (Verificado Sentinel-2)<br>
          • <strong>Captura de Carbono:</strong> 4.8 tCO2e/ha/año<br>
          • <strong>Índice Integridad Ecológica:</strong> 0.88 / 1.00<br>
          • <strong>Créditos de Biodiversidad:</strong> 128 PBC emitidos.<br>
          <div style="text-align: right; font-size: 9px; color: #a7f3d0; margin-top: 6px;">12:00 ✓✓</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
          <button style="background: #1f2c34; border: 1px solid #2a3942; color: #f59e0b; padding: 8px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; text-align: center;">
            📜 Descargar Certificado de Exportación UE
          </button>
        </div>
      `;
    }
  }

  renderStudioDashboard() {
    return this.dashboardsView.renderStudioDashboard();
  }

  renderEnterpriseDashboard() {
    return this.dashboardsView.renderEnterpriseDashboard();
  }

  renderTerritorialDashboard(selectedHex = null) {
    return this.dashboardsView.renderTerritorialDashboard(selectedHex);
  }

  renderEsgDashboard() {
    return this.dashboardsView.renderEsgDashboard();
  }

  renderDefaultCreatorView() {
    return this.dashboardsView.renderDefaultCreatorView();
  }


  onEntitySelected(data) {
    this.currentSelectedEntityId = data.id;
    const props = data.properties || {};

    if (props.type === 'placed_aoe_object') {
      this.renderPlacedObjectPanel(props);
    } else if (props.isCustom || props.type === 'custom_polygon') {
      this.renderCustomPolygonPanel(props);
    } else if (props.type === 'livestock_animal') {
      this.selectedAnimalId = props.id || props.animalId;
      if (props.paddockId) this.selectedPaddockId = props.paddockId;
      this.activeHouseTab = 'livestock';
      this.openDrawer();
      this.renderMainHouseDashboard();
    } else if (props.type === 'paddock_prv' || props.type === 'livestock_herd' || props.type === 'livestock_coop') {
      this.selectedPaddockId = props.paddockId || 'P3';
      this.activeHouseTab = 'livestock';
      this.openDrawer();
      this.renderMainHouseDashboard();
    } else if (props.type === 'permaculture_zone' || props.type === 'keyline') {
      this.activeHouseTab = 'permaculture';
      this.openDrawer();
      this.renderMainHouseDashboard();
    } else if (props.type === 'house' || props.id === 'house_main') {
      this.selectedAnimalId = null;
      this.activeHouseTab = 'metabolism';
      this.openDrawer();
      this.renderMainHouseDashboard();
      if (this.mapManager && typeof this.mapManager.flyToPreset === 'function') {
        this.mapManager.flyToPreset('house');
      }
    } else if (props.type === 'sensor') {
      this.selectedSensorId = props.sensorId || props.id.replace('sensor_', '');
      this.activeHouseTab = 'sensors';
      this.renderMainHouseDashboard();
    } else if (props.type === 'parcel') {
      this.renderParcelPanel(props);
    } else if (props.type === 'territorial_hex') {
      // Aislamiento estricto de los 3 modos: no procesar hexágonos si estamos en el gemelo 3D de Predio
      if (this.currentAgroTwinMode !== 'territorial') {
        return;
      }
      this.selectedTerritorialHex = props.data;
      this.openDrawer();
      this.renderTerritorialDashboard(props.data);
    } else if (props.type === 'crop' || props.type === 'tree') {
      this.renderCropPanel(props);
    }
  }

  renderMainHouseDashboard() {
    this.drawerTitle.textContent = 'Predio Meniels (Parral, Maule)';
    this.drawerSubtitle.textContent = 'Fundo Estero Colliguay | Lat -36.14°S';

    const tabHeader = `
      <div class="panel-tab-bar">
        <button id="tab_btn_meta" data-tab="metabolism" onclick="window.selectPredioHouseTab && window.selectPredioHouseTab('metabolism')" class="tab-btn ${this.activeHouseTab === 'metabolism' ? 'active' : ''}">🏡 Predio</button>
        <button id="tab_btn_livestock" data-tab="livestock" onclick="window.selectPredioHouseTab && window.selectPredioHouseTab('livestock')" class="tab-btn ${this.activeHouseTab === 'livestock' ? 'active' : ''}">🐄 Ganadería</button>
        <button id="tab_btn_perma" data-tab="permaculture" onclick="window.selectPredioHouseTab && window.selectPredioHouseTab('permaculture')" class="tab-btn ${this.activeHouseTab === 'permaculture' ? 'active' : ''}">🌱 Permacultura</button>
        <button id="tab_btn_sens" data-tab="sensors" onclick="window.selectPredioHouseTab && window.selectPredioHouseTab('sensors')" class="tab-btn ${this.activeHouseTab === 'sensors' ? 'active' : ''}">📡 Sensores</button>
        <button id="tab_btn_weather" data-tab="weather" onclick="window.selectPredioHouseTab && window.selectPredioHouseTab('weather')" class="tab-btn ${this.activeHouseTab === 'weather' ? 'active' : ''}">🌦️ Clima</button>
        <button id="tab_btn_astro" data-tab="astro" onclick="window.selectPredioHouseTab && window.selectPredioHouseTab('astro')" class="tab-btn ${this.activeHouseTab === 'astro' ? 'active' : ''}">🧭 Sol</button>
        <button id="tab_btn_feat" data-tab="features" onclick="window.selectPredioHouseTab && window.selectPredioHouseTab('features')" class="tab-btn ${this.activeHouseTab === 'features' ? 'active' : ''}">⚡ Features</button>
      </div>
    `;

    let tabBody = '';
    if (this.activeHouseTab === 'metabolism') {
      tabBody = this.renderMetabolismTab();
    } else if (this.activeHouseTab === 'livestock') {
      tabBody = this.renderLivestockTab();
    } else if (this.activeHouseTab === 'permaculture') {
      tabBody = this.renderPermacultureTab();
    } else if (this.activeHouseTab === 'weather') {
      tabBody = this.renderWeatherTab();
    } else if (this.activeHouseTab === 'astro') {
      tabBody = this.renderAstroOrientationTab();
    } else if (this.activeHouseTab === 'sensors') {
      tabBody = this.renderSensorsTab();
    } else if (this.activeHouseTab === 'features') {
      tabBody = this.renderFeaturesTab();
    }

    this.drawerBody.innerHTML = tabHeader + tabBody;

    // Helper global y listeners para cambio inmediato de pestaña (blindado contra locks)
    window.selectPredioHouseTab = (tabId) => {
      if (this.activeHouseTab === tabId) return;
      this.activeHouseTab = tabId;
      this.renderMainHouseDashboard();
      if (tabId === 'livestock') bus.emit('map:flyto', 'livestock');
      if (tabId === 'permaculture') bus.emit('map:flyto', 'permaculture');
    };

    // Event delegation sobre la barra de pestañas para máxima solidez
    const tabBar = this.drawerBody.querySelector('.panel-tab-bar');
    if (tabBar) {
      tabBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (btn) {
          e.preventDefault();
          e.stopPropagation();
          const tab = btn.getAttribute('data-tab');
          if (tab) window.selectPredioHouseTab(tab);
        }
      });
    }

    if (this.activeHouseTab === 'weather') {
      setTimeout(() => {
        const climogramCanvas = document.getElementById('climogramCanvas');
        if (climogramCanvas) this.drawClimogram(climogramCanvas, this.selectedDayOfYear);
      }, 40);
    }

    if (this.activeHouseTab === 'astro') {
      const daySlider = document.getElementById('slider_day');
      const hourSlider = document.getElementById('slider_hour');

      if (daySlider) {
        daySlider.addEventListener('input', (e) => {
          this.selectedDayOfYear = parseInt(e.target.value);
          this.updateSunSimulation();
        });
      }
      if (hourSlider) {
        hourSlider.addEventListener('input', (e) => {
          this.selectedHourOfDay = parseInt(e.target.value);
          this.updateSunSimulation();
        });
      }

      window.setSolarDay = (day) => {
        this.selectedDayOfYear = day;
        if (daySlider) daySlider.value = day;
        this.updateSunSimulation();
      };

      window.setSolarHour = (hour) => {
        if (hour === 'sunrise' || hour === 'sunset') {
          const m = this.calculateSolarMetrics(this.selectedDayOfYear, 12);
          const h = hour === 'sunrise' ? Math.floor(parseFloat(m.sunriseTime.split(':')[0])) : Math.floor(parseFloat(m.sunsetTime.split(':')[0]));
          this.selectedHourOfDay = h;
        } else {
          this.selectedHourOfDay = hour;
        }
        if (hourSlider) hourSlider.value = this.selectedHourOfDay;
        this.updateSunSimulation();
      };

      window.getTodayDayOfYear = () => this.getTodayDayOfYear();

      // Tidal Simulation Controls
      const tideSlider = document.getElementById('slider_tide_level');
      const tideVal = document.getElementById('tideLevelVal');
      const applyTide = (meters) => {
        if (tideSlider) tideSlider.value = meters;
        if (tideVal) tideVal.textContent = `${meters > 0 ? '+' : ''}${meters.toFixed(1)}m`;
        bus.emit('map:set_tidal_level', meters);
      };

      if (tideSlider) {
        tideSlider.addEventListener('input', (e) => {
          applyTide(parseFloat(e.target.value));
        });
      }

      const tideButtons = [
        { id: 'btn_tide_low', meters: -1.0 },
        { id: 'btn_tide_mid', meters: 0.0 },
        { id: 'btn_tide_high', meters: 1.8 },
        { id: 'btn_tide_spring', meters: 3.5 }
      ];
      tideButtons.forEach(({ id, meters }) => {
        const b = document.getElementById(id);
        if (b) b.addEventListener('click', () => applyTide(meters));
      });

      setTimeout(() => {
        const sunCanvas = document.getElementById('sunPathHorizonCanvas');
        if (sunCanvas) this.drawSunPathHorizon(sunCanvas, this.selectedDayOfYear, this.selectedHourOfDay);
        const starCanvas = document.getElementById('starMapCanvas');
        if (starCanvas) this.drawStarMap(starCanvas, this.selectedDayOfYear, this.selectedHourOfDay);
      }, 40);
    }

    if (this.activeHouseTab === 'sensors') {
      this.bindSensorTabClickHandlers();
    }
  }

  renderMetabolismTab() {
    const placed = window.objectPlacementManager?.placedObjects || [];
    const polys = this.drawingManager?.customPolygons || [];
    const parcels = this.parcelManager?.parcels || [];
    const metrics = this.permacultureEngine ? this.permacultureEngine.evaluate(placed, polys, parcels) : null;
    const strategicLandingHTML = metrics ? this.permacultureEngine.renderStrategicLandingHTML(metrics) : '';

    return `
      <!-- 0. [ATMÓSFERA UNIFICADA]: OpenWeatherMap API + Simulación Maule (Macro-Predio & Casa) -->
      <div class="glass-card" style="border-left: 4px solid var(--accent-cyan); padding: 12px; margin-bottom: 12px; background: rgba(6, 182, 212, 0.06);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 800; color: #38bdf8; font-family: monospace; letter-spacing: 0.05em;">[ATMÓSFERA UNIFICADA] • OpenWeatherMap + Maule</span>
          <span style="font-size: 9px; font-family: monospace; background: rgba(56,189,248,0.2); color: #7dd3fc; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.4);">CENTRO DE CONTROL PREDIAL</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-bottom: 8px;">
          <div style="background: rgba(0,0,0,0.35); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="color: #94a3b8; font-size: 9px; font-family: monospace;">MACRO-CLIMA (API 2m):</div>
            <div style="font-size: 13px; font-weight: 800; color: #fff; margin-top: 2px;">18.5°C • 56% HR</div>
            <div style="font-size: 9.5px; color: #fbbf24; margin-top: 2px;">Lluvia 72h: 14.5 mm (75%)</div>
          </div>
          <div style="background: rgba(0,0,0,0.35); padding: 8px; border-radius: 6px; border: 1px solid rgba(239,68,68,0.3);">
            <div style="color: #f87171; font-size: 9px; font-family: monospace;">MICROCLIMA SUELO (1.2m):</div>
            <div style="font-size: 13px; font-weight: 800; color: #f87171; margin-top: 2px;">-0.8°C • 92% HR</div>
            <div style="font-size: 9.5px; color: #4ade80; margin-top: 2px;">Bulbo Húmedo: -1.5°C (Stull)</div>
          </div>
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button onclick="window.openGalponWorkshop && window.openGalponWorkshop('general')" style="flex: 1; min-width: 150px; padding: 7px 10px; background: rgba(16, 185, 129, 0.25); border: 1px solid #10b981; color: #6ee7b7; border-radius: 6px; font-size: 10.5px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>📟</span> Abrir Caja de Terreno IP67 (TFT ESP32 & Relés)
          </button>
          <button onclick="window.triggerSimRain && window.triggerSimRain()" style="padding: 7px 10px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #7dd3fc; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>🌧️</span> Lluvia 3D
          </button>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="glass-card metric-card">
          <div class="metric-label">Habitantes</div>
          <div class="metric-value">4<span class="metric-unit">personas</span></div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-label">Superficie Casa</div>
          <div class="metric-value">180<span class="metric-unit">m²</span></div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-label">Consumo Calórico</div>
          <div class="metric-value" style="font-size: 18px;">240k<span class="metric-unit">kcal/mes</span></div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-label">Autonomía Comida</div>
          <div class="metric-value" style="color: var(--accent-emerald);">88<span class="metric-unit">%</span></div>
        </div>
      </div>

      <div class="glass-card">
        <div class="metric-label">Consumo Eléctrico vs Generación Solar</div>
        <div style="font-size: 12px; margin-top: 6px; color: var(--text-secondary);">
          • Consumo Hogar: <strong>320 kWh/mes</strong><br>
          • Generación Solar (12x 550W): <strong style="color: var(--accent-cyan);">920 kWh/mes</strong><br>
          • Superávit Net Metering: <strong style="color: var(--accent-emerald);">+600 kWh/mes</strong>
        </div>
      </div>

      <div class="glass-card">
        <div class="metric-label">Balance Hídrico & Calefacción (Parral)</div>
        <div style="font-size: 12px; margin-top: 6px; color: var(--text-secondary);">
          💧 Consumo Agua: <strong>600 L/día</strong> (18 m³/mes)<br>
          🌧️ Captación Pluvial Techo: <strong style="color: var(--accent-cyan);">180,000 L/año</strong><br>
          🪵 Calefacción Leña: <strong>4.5 m³ / temporada invernal</strong>
        </div>
      </div>

      <!-- Proyección Estratégica Permacultural (Landing Principal Predio) -->
      ${strategicLandingHTML}

      <!-- Ground-Truth Simulation Status Banner (FAO-56 / ERA5) -->
      <div class="glass-card" style="background: rgba(16, 185, 129, 0.12); border-left: 4px solid var(--accent-emerald); padding: 12px 14px; margin-top: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-family: monospace; color: var(--accent-emerald); font-weight: 700;">● MODO GROUND-TRUTH SIMULADO</span>
          <span style="font-size: 10px; color: var(--accent-amber); font-weight: 600;">FAO-56 / ERA5</span>
        </div>
        <div style="font-size: 11.5px; color: #fff; margin-top: 4px; font-weight: 600;">
          Telemetría calibrada con balances hídricos Penman-Monteith y series agroclimáticas ERA5-Land.
        </div>
      </div>

      <!-- Creator Brand & Direction Card -->
      <div class="creator-card" style="text-align: center; margin-top: 10px; padding: 14px;">
        <div class="brand-logo-container" style="margin-bottom: 10px;">
          <img src="assets/agritwin_logo_full.png" alt="AgriTwin 3D Digital Twin" style="width: 100%; max-width: 220px; height: auto; border-radius: 10px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));">
        </div>
        <div class="creator-name" style="font-size: 14px; font-weight: 800; color: #fff;">Daniel Santander Urrutia</div>
        <div class="creator-titles" style="font-size: 11px; color: var(--accent-amber); margin-top: 4px; line-height: 1.4;">
          Geofísico • Permacultor<br>
          Manejador & Protector Ambiental
        </div>
        <div class="creator-bio" style="font-size: 11px; color: var(--text-secondary); margin-top: 6px;">
          Diseñador del Gemelo Digital Agroecológico para Predio Meniels en Parral, Región del Maule.
        </div>
      </div>

      <!-- Ecosystem Family Card (AgroTech Chile • Rewild • AgriTwin 3D) -->
      <div class="glass-card" style="margin-top: 10px;">
        <div class="future-title" style="color: var(--accent-cyan); display: flex; align-items: center; gap: 8px; font-size: 12px;">
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
    `;
  }

  /**
   * Pestaña: Ganadería Regenerativa & Pastoreo Racional Voisin (PRV)
   * Incluye Ficha Técnica Individual Editable y Herramienta de Reubicación 3D en Relieve
   */
  renderLivestockTab() {
    return this.livestockView ? this.livestockView.renderTab() : "";
  }

  /**
   * Pestaña: Transición Permacultural & Keyline Yeomans
   */
  renderPermacultureTab() {
    const placed = window.objectPlacementManager?.placedObjects || [];
    const polys = this.drawingManager?.customPolygons || [];
    const parcels = this.parcelManager?.parcels || [];
    const metrics = this.permacultureEngine ? this.permacultureEngine.evaluate(placed, polys, parcels) : null;
    const whatIfTacticalHTML = metrics ? this.permacultureEngine.renderTacticalDeckHTML(metrics) : '';

    return `
      <!-- BOTÓN PLAN MAESTRO 18 PUNTOS & DOSSIER (Integrado en el Menú Desplegable) -->
      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
        <button id="btn_toggle_plan_maestro_drawer" onclick="window.togglePlanMaestro && window.togglePlanMaestro()" style="width: 100%; padding: 12px 16px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(16, 185, 129, 0.25)); border: 1.5px solid rgba(245, 158, 11, 0.6); border-radius: 10px; color: #fde047; font-weight: 800; font-size: 13.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.2); transition: all 0.2s ease;" title="Activar / Desactivar Capa de Plan Maestro (18 Puntos Yeomans)">
          <span style="font-size: 17px;">🌿</span> <span>Plan Maestro 18 puntos</span>
        </button>
        <button onclick="window.openDossierPlanMaestroModal && window.openDossierPlanMaestroModal()" style="width: 100%; padding: 8px 12px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 8px; color: #fbbf24; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>📐</span> <span>Dossier Ejecutivo de Obra (18.500 m³)</span>
        </button>
      </div>

      <!-- 1. Permaculture Overview Banner -->
      <div class="glass-card" style="border-left: 4px solid var(--accent-emerald); padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-family: monospace; color: var(--accent-emerald); font-weight: 700;">[DISEÑO REGENERATIVO HOLÍSTICO]</span>
          <span class="status-badge optimal" style="font-size: 10px;">Bill Mollison & P.A. Yeomans</span>
        </div>
        <div style="font-size: 15px; font-weight: 800; color: #fff; margin-top: 4px;">
          🌱 Transición Permacultural & Keyline
        </div>
        <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
          Zonificación concéntrica 0 a 5 y red hidrológica de infiltración hacia el Tranque de 18.500 m³.
        </div>
        <!-- Acceso a Consejos Asesores IA de Cultivos / Invernadero y Excursión / Rewilding -->
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
          <button onclick="window.openAgriInvernaderoAdvisorsModal && window.openAgriInvernaderoAdvisorsModal()" style="padding: 5px 10px; background: rgba(16, 185, 129, 0.25); border: 1px solid rgba(16, 185, 129, 0.5); border-radius: 6px; color: #6ee7b7; font-size: 10.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px;" title="Consultar Consejo de Invernadero & Cultivos">
            <span>🌿</span> Asesores Invernadero (3)
          </button>
          <button onclick="window.openAgriExcursionAdvisorsModal && window.openAgriExcursionAdvisorsModal()" style="padding: 5px 10px; background: rgba(20, 184, 166, 0.25); border: 1px solid rgba(20, 184, 166, 0.5); border-radius: 6px; color: #5eead4; font-size: 10.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px;" title="Consultar Consejo de Excursión & Rewilding">
            <span>🧭</span> Asesores Excursión (3)
          </button>
        </div>
      </div>

      <!-- SIMULADOR WHAT-IF TÁCTICO PERMACULTURA (AOE III) -->
      ${whatIfTacticalHTML}

      <!-- 1b. [ATMÓSFERA UNIFICADA]: OpenWeatherMap API + Simulación Maule (Sub-rama Agrícola / Cuarteles) -->
      <div class="glass-card" style="border-left: 4px solid #10b981; padding: 12px; margin-top: 10px; background: rgba(16, 185, 129, 0.05);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 800; color: #34d399; font-family: monospace; letter-spacing: 0.05em;">[ATMÓSFERA UNIFICADA] • OpenWeatherMap + Maule</span>
          <span style="font-size: 9px; font-family: monospace; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.4);">MANEJO AGRÍCOLA 72H</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-bottom: 8px;">
          <div style="background: rgba(0,0,0,0.35); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="color: #94a3b8; font-size: 9px; font-family: monospace;">VENTANA FITOSANITARIA</div>
            <div style="font-size: 13px; font-weight: 800; color: #10b981; margin-top: 2px;">Viento: 5.2 km/h ENE</div>
            <div style="font-size: 9.5px; color: #34d399; margin-top: 2px;">🟢 Deriva segura (&lt; 10 km/h) hasta 11:30h</div>
          </div>
          <div style="background: rgba(0,0,0,0.35); padding: 8px; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.3);">
            <div style="color: #fde047; font-size: 9px; font-family: monospace;">RIESGO CRACKING EN CEREZAS</div>
            <div style="font-size: 13px; font-weight: 800; color: #fbbf24; margin-top: 2px;">14.5 mm en 72h (75%)</div>
            <div style="font-size: 9.5px; color: #fef08a; margin-top: 2px;">⚠️ Activar sellador cuticular / techos</div>
          </div>
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button onclick="window.openGalponWorkshop && window.openGalponWorkshop('cuarteles')" style="flex: 1; min-width: 140px; padding: 6px 10px; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #6ee7b7; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
            <span>📟</span> Abrir Sub-Caja Cuarteles (Riego)
          </button>
          <button onclick="window.triggerSimRain && window.triggerSimRain()" style="padding: 6px 10px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #7dd3fc; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>🌧️</span> Probar Lluvia 3D
          </button>
        </div>
      </div>

      <!-- 2. 3D Visual Toggles -->
      <div class="glass-card" style="margin-top: 10px;">
        <div class="future-title">🗺️ Capas 3D Visibles en el Visor</div>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <label style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer;">
            <div>
              <strong style="color: #fff; font-size: 12px;">🌿 Zonificación 0 a 5 (Bill Mollison)</strong>
              <div style="font-size: 10px; color: var(--text-muted);">6 anillos concéntricos con insignias 3D y límites sobre el terreno</div>
            </div>
            <input type="checkbox" id="chk_drawer_zones" checked onchange="window.togglePermacultureLayer('zones', this.checked)" style="accent-color: #10b981; width: 18px; height: 18px; cursor: pointer;">
          </label>

          <label style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer;">
            <div>
              <strong style="color: #fff; font-size: 12px;">🚜 Hidrología Keyline (Yeomans)</strong>
              <div style="font-size: 10px; color: var(--text-muted);">Surcos de subsolado al 1%, Keypoints y partículas de agua al Tranque</div>
            </div>
            <input type="checkbox" id="chk_drawer_keyline" checked onchange="window.togglePermacultureLayer('keyline', this.checked)" style="accent-color: #38bdf8; width: 18px; height: 18px; cursor: pointer;">
          </label>
        </div>
      </div>

      <!-- 3. Desglose de las 6 Zonas de Mollison -->
      <div class="glass-card" style="margin-top: 10px;">
        <div class="future-title">🏡 Zonas Funcionales del Predio</div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px; font-size: 11px;">
          <div style="padding: 6px 8px; background: rgba(255,255,255,0.03); border-left: 3px solid #f8fafc; border-radius: 4px;">
            <strong style="color: #fff;">Zona 0: Hogar & Taller Central</strong><br>
            <span style="color: var(--text-muted);">Núcleo de decisiones, biofísica y telemetría IoT.</span>
          </div>
          <div style="padding: 6px 8px; background: rgba(255,255,255,0.03); border-left: 3px solid #facc15; border-radius: 4px;">
            <strong style="color: #facc15;">Zona 1: Huerto Biointensivo & Compost Bokashi</strong><br>
            <span style="color: var(--text-muted);">Lombriceras, aromáticas, cocina y visitas diarias múltiples.</span>
          </div>
          <div style="padding: 6px 8px; background: rgba(255,255,255,0.03); border-left: 3px solid #84cc16; border-radius: 4px;">
            <strong style="color: #84cc16;">Zona 2: Aves, Invernadero & Frutales Cercanos</strong><br>
            <span style="color: var(--text-muted);">Gallinas, cítricos y micro-estanques de biofiltro.</span>
          </div>
          <div style="padding: 6px 8px; background: rgba(255,255,255,0.03); border-left: 3px solid #059669; border-radius: 4px;">
            <strong style="color: #059669;">Zona 3: Cuarteles Comerciales & Pastoreo PRV</strong><br>
            <span style="color: var(--text-muted);">Cerezos Lapins, viña en secano y 8 potreros rotacionales.</span>
          </div>
          <div style="padding: 6px 8px; background: rgba(255,255,255,0.03); border-left: 3px solid #b45309; border-radius: 4px;">
            <strong style="color: #b45309;">Zona 4: Silvopastoreo & Bosque de Biomasa</strong><br>
            <span style="color: var(--text-muted);">Forraje leñoso, madera y cortavientos andinos.</span>
          </div>
          <div style="padding: 6px 8px; background: rgba(255,255,255,0.03); border-left: 3px solid #0284c7; border-radius: 4px;">
            <strong style="color: #0284c7;">Zona 5: Reserva Esclerófila & Estero Colliguay</strong><br>
            <span style="color: var(--text-muted);">Bosque nativo de peumo, boldo y quillay. Silvestre intangible.</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Pestaña 1: Clima & Tiempo (Pronóstico semanal, Climograma anual, Radar de Viento)
   */
  renderWeatherTab() {
    const forecastDays = [
      { day: 'Hoy', icon: '☀️', cond: 'Despejado', max: 24, min: 9, rain: 0 },
      { day: 'Mañana', icon: '⛅', cond: 'Parcial', max: 22, min: 8, rain: 0 },
      { day: 'Mié', icon: '🌦️', cond: 'Chubascos', max: 19, min: 11, rain: 4 },
      { day: 'Jue', icon: '🌧️', cond: 'Lluvia', max: 16, min: 7, rain: 16 },
      { day: 'Vie', icon: '🌤️', cond: 'Despejando', max: 20, min: 5, rain: 1 },
      { day: 'Sáb', icon: '☀️', cond: 'Soleado', max: 23, min: 7, rain: 0 },
      { day: 'Dom', icon: '☀️', cond: 'Radiante', max: 25, min: 9, rain: 0 }
    ];

    const forecastCardsHtml = forecastDays.map(f => `
      <div class="glass-card" style="padding: 6px 8px; text-align: center; min-width: 58px; flex: 1;">
        <div style="font-size: 0.72rem; font-weight: 700; color: var(--accent-cyan);">${f.day}</div>
        <div style="font-size: 1.3rem; margin: 2px 0;">${f.icon}</div>
        <div style="font-size: 0.75rem; font-weight: bold; color: #fff;">${f.max}° <span style="font-size: 0.65rem; color: var(--text-muted);">${f.min}°</span></div>
        <div style="font-size: 0.65rem; color: var(--text-secondary); margin-top: 2px;">💧${f.rain}mm</div>
      </div>
    `).join('');

    let windSpeed = 16.5;
    let windDirDeg = 205;
    let windDirText = 'SSW (Sur-Suroeste)';
    let windNote = 'Brisa marina vespertina de la costa de Pelluhue';

    if (this.selectedHourOfDay >= 12 && this.selectedHourOfDay <= 18) {
      windSpeed = Math.round(20 + Math.sin((this.selectedHourOfDay - 12) / 6 * Math.PI) * 12);
      windDirDeg = 210;
      windDirText = 'SSW (Sur-Suroeste)';
      windNote = 'Viento térmico costero del valle del Maule (máxima ventilación agrícola)';
    } else if (this.selectedHourOfDay >= 6 && this.selectedHourOfDay < 12) {
      windSpeed = 9;
      windDirDeg = 85;
      windDirText = 'E (Este)';
      windNote = 'Brisa catabática suave de la cordillera de Los Andes';
    } else {
      windSpeed = 6;
      windDirDeg = 180;
      windDirText = 'S (Sur)';
      windNote = 'Calma nocturna con inversión térmica superficial';
    }

    return `
      <!-- OpenWeather vs Microclima Real de Suelo & Acceso a Caja de Terreno -->
      <div class="glass-card" style="border-left: 4px solid var(--accent-cyan); padding: 12px; margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase;">📡 OpenWeatherMap API vs. Microclima de Suelo</span>
          <span style="font-size: 9px; font-family: monospace; background: rgba(56,189,248,0.2); color: #7dd3fc; padding: 2px 6px; border-radius: 4px;">ESP32 Sync</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-bottom: 8px;">
          <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px;">
            <strong style="color: #94a3b8; font-size: 10px; display: block;">MACRO-CLIMA (API 2m):</strong>
            <span style="font-size: 14px; font-weight: bold; color: #ffffff;">18.5°C</span> • 56% HR<br>
            <span style="font-size: 9.5px; color: #fbbf24;">Lluvia 72h: 14.5 mm (75%)</span>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; border: 1px solid rgba(239,68,68,0.3);">
            <strong style="color: #f87171; font-size: 10px; display: block;">MICROCLIMA SUELO (1.2m):</strong>
            <span style="font-size: 14px; font-weight: bold; color: #f87171;">-0.8°C</span> • 92% HR<br>
            <span style="font-size: 9.5px; color: #4ade80;">Bulbo Húmedo: -1.5°C</span>
          </div>
        </div>
        <button onclick="window.openGalponWorkshop ? window.openGalponWorkshop('cuarteles') : window.agriTwinApp?.workshopOverlay?.openStationModal?.('station_b')" style="width: 100%; padding: 7px; background: rgba(16, 185, 129, 0.25); border: 1px solid #10b981; color: #6ee7b7; border-radius: 6px; font-size: 10.5px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>📟 Abrir Caja de Terreno IP67 (TFT ESP32 & Relés)</span>
        </button>
      </div>

      <!-- 7-Day Forecast -->
      <div class="glass-card">
        <div class="future-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>🌦️ Resumen del Tiempo Semanal (Parral)</span>
          <span style="font-size: 0.7rem; color: var(--text-muted);">Estación Meniels</span>
        </div>
        <div style="display: flex; gap: 5px; overflow-x: auto; margin-top: 8px; padding-bottom: 2px;">
          ${forecastCardsHtml}
        </div>
      </div>

      <!-- Climograma Anual (Temperatura vs Precipitaciones) -->
      <div class="glass-card">
        <div class="metric-label" style="display: flex; justify-content: space-between;">
          <span>📊 Climograma Anual: Temperatura vs Precipitaciones</span>
          <span style="color: var(--accent-emerald);">~1,022 mm/año</span>
        </div>
        <div style="margin-top: 8px;">
          <canvas id="climogramCanvas" width="460" height="210" style="width: 100%; height: auto; border-radius: 8px;"></canvas>
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 6px; text-align: center;">
          Distribución mensual mediterránea interior de Parral (Maule Sur).
        </div>
      </div>

      <!-- Wind Compass / Radar -->
      <div class="glass-card">
        <div class="future-title">💨 Dirección y Velocidad del Viento (Día ${this.selectedDayOfYear} | ${this.selectedHourOfDay}:00 hrs)</div>
        <div style="display: flex; align-items: center; gap: 16px; margin-top: 10px;">
          <div style="position: relative; width: 88px; height: 88px; flex-shrink: 0;">
            <svg width="88" height="88" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
              <line x1="50" y1="12" x2="50" y2="88" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
              <line x1="12" y1="50" x2="88" y2="50" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
              <text x="50" y="22" fill="#ef4444" font-size="9" font-weight="bold" text-anchor="middle">N</text>
              <text x="50" y="86" fill="#38bdf8" font-size="9" font-weight="bold" text-anchor="middle">S</text>
              <text x="84" y="53" fill="#fff" font-size="8" text-anchor="middle">E</text>
              <text x="16" y="53" fill="#fff" font-size="8" text-anchor="middle">O</text>
              <g transform="rotate(${windDirDeg} 50 50)">
                <polygon points="50,16 44,50 56,50" fill="#06b6d4"/>
                <polygon points="50,84 46,50 54,50" fill="rgba(255,255,255,0.3)"/>
                <circle cx="50" cy="50" r="4" fill="#fff"/>
              </g>
            </svg>
          </div>
          <div style="flex: 1; font-size: 0.8rem; line-height: 1.4;">
            <div style="font-size: 1.05rem; font-weight: 700; color: var(--accent-cyan);">${windSpeed} km/h <span style="font-size: 0.75rem; color: var(--text-muted);">(${windDirText})</span></div>
            <div style="color: var(--text-secondary); margin-top: 2px;">Ráfagas esperadas: <strong style="color: #fff;">${Math.round(windSpeed * 1.55)} km/h</strong></div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">🧭 ${windNote}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Cálculos astronómicos y solares de alta precisión para Parral, Maule (Lat -36.14°S)
   */
  calculateSolarMetrics(dayOfYear, hourOfDay, latDeg = -36.14) {
    return this.solarAstroEngine.calculateSolarMetrics(dayOfYear, hourOfDay, latDeg);
  }

  getDayOfYearDateString(dayOfYear) {
    return this.solarAstroEngine.getDayOfYearDateString(dayOfYear);
  }

  getTodayDayOfYear() {
    return this.solarAstroEngine.getTodayDayOfYear();
  }

  drawSunPathHorizon(canvas, dayOfYear, hourOfDay) {
    return this.solarAstroEngine.drawSunPathHorizon(canvas, dayOfYear, hourOfDay);
  }

  /**
   * Pestaña 2: Sol, Orientación & Agrovoltaica (Trayectoria Solar en Horizonte, Radiación, Energía FV, Bóveda Celeste)
   */
  renderAstroOrientationTab() {
    const dayOfYear = this.selectedDayOfYear || 172;
    const hourOfDay = this.selectedHourOfDay !== undefined ? this.selectedHourOfDay : 12;
    const m = this.calculateSolarMetrics(dayOfYear, hourOfDay);

    const moonAge = ((dayOfYear + hourOfDay / 24 + 14) % 29.53).toFixed(1);
    const moonIllum = Math.round((1 - Math.cos((moonAge / 29.53) * 2 * Math.PI)) / 2 * 100);

    let moonPhaseName = 'Luna Llena';
    let moonEmoji = '🌕';
    const ageNum = parseFloat(moonAge);
    if (ageNum < 2.0 || ageNum > 27.5) { moonPhaseName = 'Luna Nueva'; moonEmoji = '🌑'; }
    else if (ageNum < 7.0) { moonPhaseName = 'Creciente Cóncava'; moonEmoji = '🌒'; }
    else if (ageNum < 9.5) { moonPhaseName = 'Cuarto Creciente'; moonEmoji = '🌓'; }
    else if (ageNum < 14.0) { moonPhaseName = 'Gibosa Creciente'; moonEmoji = '🌔'; }
    else if (ageNum < 16.5) { moonPhaseName = 'Luna Llena'; moonEmoji = '🌕'; }
    else if (ageNum < 21.5) { moonPhaseName = 'Gibosa Menguante'; moonEmoji = '🌖'; }
    else if (ageNum < 24.0) { moonPhaseName = 'Cuarto Menguante'; moonEmoji = '🌗'; }
    else { moonPhaseName = 'Menguante Cóncava'; moonEmoji = '🌘'; }

    return `
      <!-- 1. Trayectoria Solar en el Horizonte (Canvas Unificado) -->
      <div class="glass-card" style="border-left: 4px solid var(--accent-amber); padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div>
            <div style="font-size: 13.5px; font-weight: 800; color: #fff;">☀️ Trayectoria Solar en el Horizonte</div>
            <div style="font-size: 10.5px; color: var(--text-muted);">Proyección diurna sobre el horizonte local • Lat -36.14°S (Parral)</div>
          </div>
          <span class="status-badge optimal" style="font-size: 9.5px; padding: 2px 7px;">Maule Sur</span>
        </div>

        <div style="margin-top: 8px;">
          <canvas id="sunPathHorizonCanvas" width="460" height="195" style="width: 100%; height: auto; border-radius: 8px; background: rgba(5, 10, 20, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); display: block;"></canvas>
        </div>

        <!-- Leyenda de trayectorias estacionales -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: space-between; margin-top: 8px; font-size: 9.5px; font-family: monospace; padding: 4px 6px; background: rgba(0,0,0,0.25); border-radius: 6px;">
          <span style="color: #fb923c;">☀️ Verano (77° máx)</span>
          <span style="color: #34d399;">🌱 Equinoccio (54° máx)</span>
          <span style="color: #38bdf8;">❄️ Invierno (30° máx)</span>
          <span style="color: #fde047; font-weight: bold;">🟡 Día Activo</span>
        </div>

        <!-- Sliders Interactivos con Accesos Rápidos -->
        <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
          <!-- Slider Día -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
              <span style="color: #cbd5e1; font-weight: 600;">📅 Día del Año (1 - 365):</span>
              <strong id="label_day" style="color: var(--accent-amber); font-family: monospace;">Día ${dayOfYear} • ${this.getDayOfYearDateString(dayOfYear)}</strong>
            </div>
            <input type="range" id="slider_day" min="1" max="365" value="${dayOfYear}" style="width: 100%; margin-top: 4px;" class="slider-glass">
            
            <!-- Botones Rápidos Estacionales -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 5px;">
              <button onclick="window.setSolarDay && window.setSolarDay(172)" style="padding: 4px 6px; font-size: 9.5px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3); background: rgba(56,189,248,0.1); color: #7dd3fc; cursor: pointer;">❄️ Invierno (21J)</button>
              <button onclick="window.setSolarDay && window.setSolarDay(80)" style="padding: 4px 6px; font-size: 9.5px; border-radius: 4px; border: 1px solid rgba(52,211,153,0.3); background: rgba(52,211,153,0.1); color: #6ee7b7; cursor: pointer;">🌱 Equinoccio</button>
              <button onclick="window.setSolarDay && window.setSolarDay(355)" style="padding: 4px 6px; font-size: 9.5px; border-radius: 4px; border: 1px solid rgba(251,146,60,0.3); background: rgba(251,146,60,0.1); color: #fdba74; cursor: pointer;">☀️ Verano (21D)</button>
              <button onclick="window.setSolarDay && window.setSolarDay(window.getTodayDayOfYear && window.getTodayDayOfYear())" style="padding: 4px 6px; font-size: 9.5px; border-radius: 4px; border: 1px solid rgba(245,158,11,0.4); background: rgba(245,158,11,0.15); color: #fde047; cursor: pointer; font-weight: bold;">📍 Hoy</button>
            </div>
          </div>

          <!-- Slider Hora -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
              <span style="color: #cbd5e1; font-weight: 600;">⏰ Hora del Día (00 - 23 hrs):</span>
              <strong id="label_hour" style="color: var(--accent-cyan); font-family: monospace;">${hourOfDay}:00 hrs (${m.isDay ? 'Luz Día' : 'Noche'})</strong>
            </div>
            <input type="range" id="slider_hour" min="0" max="23" value="${hourOfDay}" style="width: 100%; margin-top: 4px;" class="slider-glass">
            
            <!-- Botones Rápidos de Horas Clave -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 5px;">
              <button onclick="window.setSolarHour && window.setSolarHour('sunrise')" style="padding: 4px 6px; font-size: 9.5px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #fde68a; cursor: pointer;">🌅 Salida</button>
              <button onclick="window.setSolarHour && window.setSolarHour(12)" style="padding: 4px 6px; font-size: 9.5px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #38bdf8; cursor: pointer;">☀️ Mediodía</button>
              <button onclick="window.setSolarHour && window.setSolarHour('sunset')" style="padding: 4px 6px; font-size: 9.5px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #fb923c; cursor: pointer;">🌇 Puesta</button>
              <button onclick="window.setSolarHour && window.setSolarHour(22)" style="padding: 4px 6px; font-size: 9.5px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #cbd5e1; cursor: pointer;">🌙 Noche</button>
            </div>
          </div>
        </div>

        <!-- Ficha de Geometría Solar Instantánea -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 12px;">
          <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 6px 8px;">
            <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Elevación Solar</div>
            <div id="val_sun_elev" style="font-size: 13px; font-weight: 800; color: #fde047; margin-top: 2px;">${m.elevDeg}° Alt</div>
            <div style="font-size: 8.5px; color: #64748b;">Ángulo sobre horizonte</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 6px 8px;">
            <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Azimut Solar</div>
            <div id="val_sun_az" style="font-size: 13px; font-weight: 800; color: #38bdf8; margin-top: 2px;">${m.azDeg}° Az (${m.cardinalDir})</div>
            <div style="font-size: 8.5px; color: #64748b;">Norte = 0° / 360°</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 6px 8px;">
            <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Horas Luz Día</div>
            <div id="val_sun_daylight" style="font-size: 13px; font-weight: 800; color: #34d399; margin-top: 2px;">${m.daylightHours} h/d</div>
            <div id="val_sun_rise_set" style="font-size: 8.5px; color: #94a3b8;">🌅 ${m.sunriseTime} | 🌇 ${m.sunsetTime}</div>
          </div>
        </div>
      </div>

      <!-- 2. Radiación Solar Disponible en Parral (Recurso Solar) -->
      <div class="glass-card" style="border-left: 4px solid #38bdf8; padding: 12px; margin-top: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <div style="font-size: 12.5px; font-weight: 800; color: #fff;">📡 Radiación Solar Disponible</div>
            <div style="font-size: 10px; color: var(--text-muted);">Índices de irradiancia atmosférica para Parral (Maule Sur)</div>
          </div>
          <span style="font-size: 9px; font-family: monospace; background: rgba(56,189,248,0.15); color: #7dd3fc; border: 1px solid rgba(56,189,248,0.3); padding: 2px 6px; border-radius: 4px;">RECURSO SOLAR</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div style="background: rgba(0,0,0,0.35); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="color: #94a3b8; font-size: 9.5px; text-transform: uppercase;">Radiación Global Instantánea (GHI)</div>
            <div id="val_ghi_instant" style="font-size: 17px; font-weight: 800; color: #fde047; margin-top: 2px;">${m.ghiInstant} W/m²</div>
            <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">
              DNI: <span id="val_dni_instant" style="color: #fff;">${m.dniInstant} W/m²</span> • DHI: <span id="val_dhi_instant" style="color: #67e8f9;">${m.dhiInstant} W/m²</span>
            </div>
          </div>
          <div style="background: rgba(0,0,0,0.35); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="color: #94a3b8; font-size: 9.5px; text-transform: uppercase;">Radiación Acumulada Diaria</div>
            <div id="val_ghi_daily" style="font-size: 17px; font-weight: 800; color: #38bdf8; margin-top: 2px;">${m.dailyGhiKwh} <span style="font-size: 11px;">kWh/m²/día</span></div>
            <div style="font-size: 9px; color: #34d399; margin-top: 2px;">
              ⚡ <strong id="val_hsp">${m.hsp} Horas Sol Pico (HSP)</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Energía Capturable & Generación Fotovoltaica (Predio Meniels) -->
      <div class="glass-card" style="border-left: 4px solid #10b981; padding: 12px; margin-top: 10px; background: rgba(16, 185, 129, 0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <div style="font-size: 12.5px; font-weight: 800; color: #fff;">⚡ Energía Capturable (Paneles Fundo Meniels)</div>
            <div style="font-size: 10px; color: var(--text-muted);">Instalación Agrovoltaica: 12x 550W Mono-PERC Bifaciales</div>
          </div>
          <span style="font-size: 9px; font-family: monospace; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); padding: 2px 6px; border-radius: 4px;">6.6 kWp INSTALADOS</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
          <!-- Potencia Instantánea -->
          <div style="background: rgba(0,0,0,0.35); padding: 8px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.25);">
            <div style="color: #94a3b8; font-size: 9.5px; text-transform: uppercase;">Potencia Instantánea Capturada</div>
            <div id="val_pv_power" style="font-size: 17px; font-weight: 800; color: #10b981; margin-top: 2px;">${m.instantPowerKw} kW</div>
            <!-- Barra de capacidad instantánea -->
            <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 6px; overflow: hidden;">
              <div id="val_pv_power_bar" style="width: ${m.instantPowerPercent}%; height: 100%; background: linear-gradient(90deg, #10b981, #fde047); transition: width 0.3s ease;"></div>
            </div>
            <div style="font-size: 8.5px; color: #6ee7b7; margin-top: 4px;">${m.instantPowerPercent}% de potencia nominal</div>
          </div>

          <!-- Generación Diaria Estimada -->
          <div style="background: rgba(0,0,0,0.35); padding: 8px; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.25);">
            <div style="color: #94a3b8; font-size: 9.5px; text-transform: uppercase;">Generación Diaria Estimada</div>
            <div id="val_pv_daily" style="font-size: 17px; font-weight: 800; color: #fde047; margin-top: 2px;">${m.dailyGenKwh} <span style="font-size: 11px;">kWh/día</span></div>
            <div style="font-size: 9px; color: #cbd5e1; margin-top: 4px;">
              Proyección mes: <strong id="val_pv_month" style="color: #fbbf24;">${(m.dailyGenKwh * 30).toFixed(0)} kWh/mes</strong>
            </div>
          </div>
        </div>

        <!-- Desglose de uso y aplicaciones de la energía -->
        <div style="display: flex; flex-direction: column; gap: 5px; font-size: 10.5px; color: var(--text-secondary); padding: 6px 8px; background: rgba(0,0,0,0.25); border-radius: 6px;">
          <div style="display: flex; justify-content: space-between;">
            <span>🔋 <strong>Banco Baterías LiFePO4:</strong> 15 kWh</span>
            <span style="color: #10b981;">100% autónomo noche verano</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>💧 <strong>Bombeo Solar al Tranque (18.500 m³):</strong></span>
            <span id="val_pv_water" style="color: #38bdf8; font-weight: bold;">${m.waterPumpM3} m³/día</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>📐 <strong>Inclinación & Rendimiento:</strong> 32° Norte</span>
            <span style="color: #fde047;">PR: 82% (Pérdidas 18%)</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>🌱 <strong>Compensación CO₂e:</strong></span>
            <span id="val_pv_co2" style="color: #34d399; font-weight: bold;">${m.co2SavedKg} kg CO₂e/mes</span>
          </div>
        </div>
      </div>

      <!-- 4. Southern Hemisphere Sky & Constellations Viewer -->
      <div class="glass-card" style="margin-top: 10px;">
        <div class="future-title" style="display: flex; justify-content: space-between;">
          <span>🌌 Visor Celeste & Constelaciones Australes</span>
          <span style="font-size: 0.7rem; color: var(--accent-cyan);">Lat -36.14°S</span>
        </div>
        <div style="margin-top: 8px; text-align: center;">
          <canvas id="starMapCanvas" width="460" height="230" style="width: 100%; height: auto; border-radius: 8px;"></canvas>
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 6px; text-align: center;">
          ✨ Incluye <strong>Cruz del Sur</strong>, <strong>Punteros Centauro</strong>, <strong>Orión</strong>, <strong>Escorpio</strong>, <strong>Sirio</strong> y <strong>Canopus</strong> sincronizados con el día y la hora.
        </div>
      </div>

      <!-- 5. Lunar Cycle & Moon in Sky -->
      <div class="glass-card" style="margin-top: 10px;">
        <div class="future-title">🌙 Ciclo Lunar & Fases (Parral)</div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding: 4px 6px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 2.4rem;">${moonEmoji}</span>
            <div>
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${moonPhaseName}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                Iluminación: <strong style="color: var(--accent-cyan);">${moonIllum}%</strong> | Edad: <strong>${moonAge} días</strong>
              </div>
            </div>
          </div>
          <div style="text-align: right; font-size: 0.75rem; color: var(--text-muted);">
            <div>Ciclo Sinódico: <strong>29.5 días</strong></div>
            <div style="color: var(--accent-emerald);">Visible en el cielo 3D</div>
          </div>
        </div>
      </div>

      <!-- 6. Tidal / Ocean Simulation -->
      <div class="glass-card" style="margin-top: 10px;">
        <div class="future-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>🌊 Simulador de Mareas & Cota Hídrica</span>
          <span style="font-size: 0.72rem; color: var(--accent-cyan);" id="tideLevelVal">0.0m</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">
          Simula el ascenso del nivel del mar o subida freática en cuencas costeras y riberas bajas.
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-top: 8px;">
          <button id="btn_tide_low" class="btn-dropdown-option" style="padding: 5px 6px; font-size: 0.7rem; border-radius: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer;">
            Bajamar (-1m)
          </button>
          <button id="btn_tide_mid" class="btn-dropdown-option" style="padding: 5px 6px; font-size: 0.7rem; border-radius: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer;">
            Normal (0m)
          </button>
          <button id="btn_tide_high" class="btn-dropdown-option" style="padding: 5px 6px; font-size: 0.7rem; border-radius: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer;">
            Pleamar (+1.8m)
          </button>
          <button id="btn_tide_spring" class="btn-dropdown-option" style="padding: 5px 6px; font-size: 0.7rem; border-radius: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer;">
            Viva (+3.5m)
          </button>
        </div>

        <div style="margin-top: 10px;">
          <input type="range" id="slider_tide_level" min="-2.0" max="4.5" step="0.1" value="0.0" class="slider-glass" style="width: 100%;">
        </div>
      </div>
    `;
  }

  /**
   * Dibuja el climograma anual en canvas (Precipitaciones mm vs Temperatura °C)
   */
  drawClimogram(canvas, dayOfYear) {
    return this.solarAstroEngine.drawClimogram(canvas, dayOfYear);
  }

  drawStarMap(canvas, dayOfYear, hourOfDay) {
    return this.solarAstroEngine.drawStarMap(canvas, dayOfYear, hourOfDay);
  }
  /**
   * Tab 3: Dedicated IoT Sensor Inventory & Highlight Controller
   */
  renderSensorsTab() {
    const sensors = this.dataSource.entitiesData ? this.dataSource.entitiesData.sensors : [];

    let sensorListHtml = '';
    sensors.forEach(s => {
      const isSelected = s.id === this.selectedSensorId;
      let icon = '🌱';
      if (s.id.includes('FROST') || s.categoryMaule === 'frost_fruit_height') icon = '❄️';
      else if (s.id.includes('LEAF') || s.categoryMaule === 'foliar_wetness') icon = '🍃';
      else if (s.id.includes('FLOW') || s.categoryMaule === 'water_canal_dga') icon = '🚰';
      else if (s.id.includes('WIND') || s.name.includes('Anemómetro')) icon = '💨';
      else if (s.id.includes('WX') || s.name.includes('Meteorológica')) icon = '🌤️';
      else if (s.id.includes('03') || s.name.includes('Estero')) icon = '💧';

      const statusBadge = s.telemetry.status === 'optimal' 
        ? `<span class="status-badge optimal"><span class="status-dot"></span> Óptimo</span>`
        : s.telemetry.status === 'critical'
        ? `<span class="status-badge critical" style="background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid #ef4444;"><span class="status-dot" style="background: #ef4444;"></span> Alerta Activa</span>`
        : `<span class="status-badge warning"><span class="status-dot"></span> Precaución</span>`;

      const isFrost = s.id.includes('FROST') || s.categoryMaule === 'frost_fruit_height';
      const isLeaf = s.id.includes('LEAF') || s.categoryMaule === 'foliar_wetness';
      const isFlow = s.id.includes('FLOW') || s.categoryMaule === 'water_canal_dga';
      const isWind = s.id.includes('WIND') || (s.telemetry.windSpeedKmH !== undefined && !isFrost);
      const isWx = s.id.includes('WX') || s.name.includes('Meteorológica');

      let metricsHtml = '';
      if (isFrost) {
        metricsHtml = `
          <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 11px; flex-wrap: wrap;">
            <span>❄️ Fruta (1.2m): <strong style="color: #38bdf8;">${s.telemetry.fruitHeightTempC ?? s.telemetry.temperature}°C</strong></span>
            <span>💧 Bulbo Hdo: <strong style="color: #67e8f9;">${s.telemetry.wetBulbTempC ?? -1.5}°C</strong></span>
            <span>🌡️ Abrigo 2m: <strong>${s.telemetry.shelterTemp2mC ?? 2.4}°C</strong></span>
            <span>🛡️ Decisión: <strong style="color: #fde047;">${s.telemetry.decision?.actionNeeded || s.telemetry.frostType}</strong></span>
          </div>
        `;
      } else if (isLeaf) {
        metricsHtml = `
          <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 11px; flex-wrap: wrap;">
            <span>🍃 Mojamiento: <strong style="color: #84cc16;">${s.telemetry.leafWetnessHours ?? 11.5} h</strong></span>
            <span>🍄 Botrytis: <strong style="color: #f59e0b;">${Math.round((s.telemetry.botrytisRiskIndex ?? 0.82) * 100)}%</strong></span>
            <span>💧 HR: <strong>${s.telemetry.humidity ?? 94}%</strong></span>
            <span>⚡ Ventana Pulverización: <strong style="color: #4ade80;">${s.telemetry.decision?.sprayWindowOptimal || 'Hoy 16:30h'}</strong></span>
          </div>
        `;
      } else if (isFlow) {
        metricsHtml = `
          <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 11px; flex-wrap: wrap;">
            <span>🚰 Caudal: <strong style="color: #0284c7;">${s.telemetry.instantFlowLps ?? 24.5} L/s</strong></span>
            <span>📜 DGA MEE: <strong style="color: #34d399;">Transmitido OK</strong></span>
            <span>⏳ Turno Canal: <strong>En ${s.telemetry.daysToNextCanalTurn ?? 4} días</strong></span>
            <span>🌱 Reserva Suelo: <strong>${s.telemetry.soilWaterReserveDays ?? 4.2} días</strong></span>
          </div>
        `;
      } else if (isWind) {
        metricsHtml = `
          <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 11px; flex-wrap: wrap;">
            <span>💨 Viento: <strong style="color: var(--accent-cyan);">${s.telemetry.windSpeedKmH} km/h</strong></span>
            <span>🧭 Dir: <strong>${s.telemetry.windDirectionText || s.telemetry.windDirectionDeg + '°'}</strong></span>
            <span>⚡ Ráfaga: <strong>${s.telemetry.gustSpeedKmH || '14.2'} km/h</strong></span>
            <span>🔋 Bat: <strong>${s.telemetry.batteryLevel}%</strong></span>
          </div>
        `;
      } else if (isWx) {
        metricsHtml = `
          <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 11px; flex-wrap: wrap;">
            <span>🌡️ Temp: <strong>${s.telemetry.temperature}°C</strong></span>
            <span>💨 Viento: <strong>5.2 km/h</strong></span>
            <span>🚜 Ventana Fito: <strong style="color: #34d399;">${s.telemetry.sprayWindow?.windowToday || '07:30 - 10:45 h'}</strong></span>
            <span>🍒 Cracking 72h: <strong style="color: #fbbf24;">${s.telemetry.cherryCrackingRisk?.riskLevel || 'Medio'}</strong></span>
          </div>
        `;
      } else {
        metricsHtml = `
          <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 11px; flex-wrap: wrap;">
            <span>💧 Suelo (20-60cm): <strong>${s.telemetry.soilMoistureLayer2 || s.telemetry.soilMoisture}%</strong></span>
            <span>🌡️ Temp: <strong>${s.telemetry.temperature}°C</strong></span>
            <span>🔋 Bat: <strong>${s.telemetry.batteryLevel}%</strong></span>
            <span style="color: var(--accent-emerald);">⚡ ET0: <strong>${s.telemetry.et0PenmanMonteith || '3.8'} mm/d</strong></span>
            <span style="color: var(--accent-cyan);">📊 CWSI: <strong>${s.telemetry.cwsiStressIndex || '0.24'}</strong></span>
          </div>
        `;
      }

      sensorListHtml += `
        <div class="glass-card sensor-list-item ${isSelected ? 'selected-item' : ''}" data-sensor-id="${s.id}" style="cursor: pointer; ${isSelected ? 'border-color: var(--accent-cyan); background: rgba(6,182,212,0.12);' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: 700; font-size: 13px; color: #fff; display: flex; align-items: center; gap: 8px;">
              <span>${icon}</span> ${s.name}
            </div>
            ${statusBadge}
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
            Hardware: <strong>${s.hardware}</strong> | Protocolo: ${s.protocol}
          </div>
          ${metricsHtml}
        </div>
      `;
    });

    const activeSensor = sensors.find(s => s.id === this.selectedSensorId) || sensors[0];

    let sensorDetailBoxHtml = '';
    if (activeSensor) {
      const isFrost = activeSensor.id.includes('FROST') || activeSensor.categoryMaule === 'frost_fruit_height';
      const isLeaf = activeSensor.id.includes('LEAF') || activeSensor.categoryMaule === 'foliar_wetness';
      const isFlow = activeSensor.id.includes('FLOW') || activeSensor.categoryMaule === 'water_canal_dga';
      const isWind = activeSensor.id.includes('WIND') || (activeSensor.telemetry.windSpeedKmH !== undefined && !isFrost);
      const isWx = activeSensor.id.includes('WX') || activeSensor.name.includes('Meteorológica');

      if (isFrost) {
        sensorDetailBoxHtml = `
          <!-- Dedicated Fruit-Height Frost Node Box -->
          <div class="glass-card" style="margin-top: 10px; border-left: 3px solid #38bdf8;">
            <div class="metric-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>❄️ Monitoreo de Heladas a Altura de Fruta (Hondonada Crítica)</span>
              <span style="font-size: 10px; color: #38bdf8; font-family: monospace;">[ESP32-C3 LoRaWAN • SHT45 a 1.2m]</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
              <div style="background: rgba(56,189,248,0.1); padding: 8px; border-radius: 6px; border: 1px solid rgba(56,189,248,0.3); text-align: center;">
                <div style="font-size: 10px; color: #38bdf8;">Temperatura a Altura de Fruta</div>
                <div style="font-size: 18px; font-weight: 700; color: #fff;">${activeSensor.telemetry.fruitHeightTempC ?? activeSensor.telemetry.temperature}°C</div>
                <div style="font-size: 10px; color: #f87171;">Yema Expuesta (Umbral Crítico -1.1°C)</div>
              </div>
              <div style="background: rgba(6,182,212,0.1); padding: 8px; border-radius: 6px; border: 1px solid rgba(6,182,212,0.3); text-align: center;">
                <div style="font-size: 10px; color: #67e8f9;">Temperatura de Bulbo Húmedo</div>
                <div style="font-size: 18px; font-weight: 700; color: #fff;">${activeSensor.telemetry.wetBulbTempC ?? -1.5}°C</div>
                <div style="font-size: 10px; color: #fde047;">Decisión Aspersión Antihelada</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 10px; color: var(--text-muted);">Estación Abrigo Oficial (2m)</div>
                <div style="font-size: 14px; font-weight: 700; color: #fff;">${activeSensor.telemetry.shelterTemp2mC ?? 2.4}°C</div>
                <div style="font-size: 9px; color: #38bdf8;">Delta de Inversión: -3.2°C</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 10px; color: var(--text-muted);">Dinámica de Viento en Cuenca</div>
                <div style="font-size: 14px; font-weight: 700; color: #4ade80;">1.8 km/h (Calmo)</div>
                <div style="font-size: 9px; color: var(--text-secondary);">Helada Radiativa Pura</div>
              </div>
            </div>

            <!-- Agronomic Decision Action Card -->
            <div style="margin-top: 10px; padding: 10px; border-radius: 8px; background: rgba(239,68,68,0.12); border: 1px solid #ef4444; font-size: 11px; line-height: 1.45;">
              <strong style="color: #f87171; display: block; font-size: 12px; margin-bottom: 4px;">
                📢 Dictamen Agronómico para el Productor:
              </strong>
              ${activeSensor.telemetry.decision?.summary || 'Alerta activa de helada por drenaje katabático de aire frío en hondonada.'}
              <div style="margin-top: 6px; display: flex; justify-content: space-between; font-family: monospace; font-size: 10px; color: #d6c4a8;">
                <span>Fenología: <strong>${activeSensor.telemetry.decision?.phenology || 'Floración Temprana'}</strong></span>
                <span style="color: #f87171;">Riesgo Cosecha: <strong>$14.5M CLP</strong></span>
              </div>
            </div>
          </div>

          <div class="glass-card" style="margin-top: 10px;">
            <div class="metric-label">❄️ Curva Térmica Fruta vs. Umbral Letal (°C)</div>
            <div class="chart-container">
              <canvas id="sparklineCanvas"></canvas>
            </div>
          </div>
        `;
      } else if (isLeaf) {
        sensorDetailBoxHtml = `
          <!-- Dedicated Foliar Wetness & Fungus Box -->
          <div class="glass-card" style="margin-top: 10px; border-left: 3px solid #84cc16;">
            <div class="metric-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>🍃 Sensor de Mojamiento Foliar & Presión Fúngica</span>
              <span style="font-size: 10px; color: #84cc16; font-family: monospace;">[PHYTOS-31 • Modelo Mills]</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
              <div style="background: rgba(132,204,22,0.1); padding: 8px; border-radius: 6px; border: 1px solid rgba(132,204,22,0.3); text-align: center;">
                <div style="font-size: 10px; color: #84cc16;">Horas Continuas de Hoja Mojada</div>
                <div style="font-size: 18px; font-weight: 700; color: #fff;">${activeSensor.telemetry.leafWetnessHours ?? 11.5} <span style="font-size: 11px;">horas</span></div>
                <div style="font-size: 10px; color: #fde047;">Superficie Foliar al 100%</div>
              </div>
              <div style="background: rgba(245,158,11,0.1); padding: 8px; border-radius: 6px; border: 1px solid rgba(245,158,11,0.3); text-align: center;">
                <div style="font-size: 10px; color: #f59e0b;">Índice Presión Botrytis</div>
                <div style="font-size: 18px; font-weight: 700; color: #f59e0b;">${Math.round((activeSensor.telemetry.botrytisRiskIndex ?? 0.82) * 100)}%</div>
                <div style="font-size: 10px; color: #cbd5e1;">Venturia: ${Math.round((activeSensor.telemetry.venturiaRiskIndex ?? 0.65) * 100)}%</div>
              </div>
            </div>

            <!-- Agronomic Decision Card -->
            <div style="margin-top: 10px; padding: 10px; border-radius: 8px; background: rgba(245,158,11,0.12); border: 1px solid #f59e0b; font-size: 11px; line-height: 1.45;">
              <strong style="color: #fbbf24; display: block; font-size: 12px; margin-bottom: 4px;">
                🍄 Gatillo de Aplicación Fitosanitaria (No Calendario Ciego):
              </strong>
              ${activeSensor.telemetry.decision?.summary || 'Horas de mojamiento superan umbral de infección. Aplicar en ventana segura.'}
              <div style="margin-top: 6px; display: flex; justify-content: space-between; font-family: monospace; font-size: 10px; color: #d6c4a8;">
                <span style="color: #4ade80;">Ventana Segura: <strong>${activeSensor.telemetry.decision?.sprayWindowOptimal || 'Hoy 16:30 - 19:00 h'}</strong></span>
                <span style="color: #34d399;">Ahorro vs Calendario: <strong>$380.000 CLP/ha</strong></span>
              </div>
            </div>
          </div>

          <div class="glass-card" style="margin-top: 10px;">
            <div class="metric-label">🍃 Horas Acumuladas de Mojamiento Foliar (h)</div>
            <div class="chart-container">
              <canvas id="sparklineCanvas"></canvas>
            </div>
          </div>
        `;
      } else if (isFlow) {
        sensorDetailBoxHtml = `
          <!-- Dedicated Flow & Canal Turn Box -->
          <div class="glass-card" style="margin-top: 10px; border-left: 3px solid #0284c7;">
            <div class="metric-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>🚰 Caudalímetro Telemétrico DGA & Gestión Turno de Canal</span>
              <span style="font-size: 10px; color: #0284c7; font-family: monospace;">[Norma DGA Res. 1238 • Pozo Profundo]</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
              <div style="background: rgba(2,132,199,0.1); padding: 8px; border-radius: 6px; border: 1px solid rgba(2,132,199,0.3); text-align: center;">
                <div style="font-size: 10px; color: #0284c7;">Caudal Instantáneo de Bombeo</div>
                <div style="font-size: 18px; font-weight: 700; color: #fff;">${activeSensor.telemetry.instantFlowLps ?? 24.5} <span style="font-size: 11px;">L/s</span></div>
                <div style="font-size: 10px; color: #34d399;">MEE DGA Transmitido OK</div>
              </div>
              <div style="background: rgba(16,185,129,0.1); padding: 8px; border-radius: 6px; border: 1px solid rgba(16,185,129,0.3); text-align: center;">
                <div style="font-size: 10px; color: #10b981;">Reserva del Perfil de Suelo</div>
                <div style="font-size: 18px; font-weight: 700; color: #34d399;">${activeSensor.telemetry.soilWaterReserveDays ?? 4.2} <span style="font-size: 11px;">días</span></div>
                <div style="font-size: 10px; color: #cbd5e1;">Turno Canal Llega en: <strong>${activeSensor.telemetry.daysToNextCanalTurn ?? 4} días</strong></div>
              </div>
            </div>

            <!-- Agronomic Decision Card -->
            <div style="margin-top: 10px; padding: 10px; border-radius: 8px; background: rgba(2,132,199,0.12); border: 1px solid #0284c7; font-size: 11px; line-height: 1.45;">
              <strong style="color: #38bdf8; display: block; font-size: 12px; margin-bottom: 4px;">
                💧 Decisión de Turno de Canal (Maule: Volumen vs Momento):
              </strong>
              ${activeSensor.telemetry.decision?.summary || 'El perfil de suelo aguanta hasta el próximo turno de canal. Evitar gasto eléctrico de pozo.'}
              <div style="margin-top: 6px; display: flex; justify-content: space-between; font-family: monospace; font-size: 10px; color: #d6c4a8;">
                <span style="color: #38bdf8;">Lámina Turno: <strong>32 mm (1.150 m³)</strong></span>
                <span style="color: #4ade80;">Ahorro Eléctrico Evitado: <strong>$112.000 CLP</strong></span>
              </div>
            </div>
          </div>

          <div class="glass-card" style="margin-top: 10px;">
            <div class="metric-label">🚰 Caudal Telemétrico Acumulado (L/s)</div>
            <div class="chart-container">
              <canvas id="sparklineCanvas"></canvas>
            </div>
          </div>
        `;
      } else if (isWind) {
        sensorDetailBoxHtml = `
          <!-- Dedicated Anemometer & Wind Station Box -->
          <div class="glass-card" style="margin-top: 10px; border-left: 3px solid var(--accent-cyan);">
            <div class="metric-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>💨 Vector de Viento & Dinámica Atmosférica</span>
              <span style="font-size: 10px; color: var(--accent-cyan); font-family: monospace;">[Davis 6410 Ultrasonic]</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
              <div style="background: rgba(6,182,212,0.08); padding: 8px; border-radius: 6px; border: 1px solid rgba(6,182,212,0.3); text-align: center;">
                <div style="font-size: 10px; color: var(--accent-cyan);">Velocidad de Viento</div>
                <div style="font-size: 18px; font-weight: 700; color: #fff;">${activeSensor.telemetry.windSpeedKmH} <span style="font-size: 11px; color: var(--accent-cyan);">km/h</span></div>
                <div style="font-size: 10px; color: var(--text-muted);">${(activeSensor.telemetry.windSpeedKmH / 3.6).toFixed(1)} m/s (Brisa Moderada)</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 10px; color: var(--text-muted);">Dirección & Cuadrante</div>
                <div style="font-size: 14px; font-weight: 700; color: var(--accent-amber);">${activeSensor.telemetry.windDirectionText || 'SSW'}</div>
                <div style="font-size: 10px; color: var(--text-secondary);">${activeSensor.telemetry.windDirectionDeg || 205}° (Barlovento)</div>
              </div>
            </div>
          </div>

          <div class="glass-card" style="margin-top: 10px;">
            <div class="metric-label">💨 Tendencia 24h - Velocidad de Viento (km/h)</div>
            <div class="chart-container">
              <canvas id="sparklineCanvas"></canvas>
            </div>
          </div>
        `;
      } else if (isWx) {
        sensorDetailBoxHtml = `
          <!-- Dedicated Weather Station Box -->
          <div class="glass-card" style="margin-top: 10px; border-left: 3px solid var(--accent-amber);">
            <div class="metric-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>🌤️ Estación Meteorológica Central de Microzona (Meniels)</span>
              <span style="font-size: 10px; color: var(--accent-amber); font-family: monospace;">[Red Compartida Maule]</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
              <div style="background: rgba(245,158,11,0.08); padding: 8px; border-radius: 6px; border: 1px solid rgba(245,158,11,0.3); text-align: center;">
                <div style="font-size: 10px; color: var(--accent-amber);">Temperatura Ambiente</div>
                <div style="font-size: 18px; font-weight: 700; color: #fff;">${activeSensor.telemetry.temperature}°C</div>
                <div style="font-size: 10px; color: var(--text-muted);">Punto Rocío: 12.4°C</div>
              </div>
              <div style="background: rgba(6,182,212,0.08); padding: 8px; border-radius: 6px; border: 1px solid rgba(6,182,212,0.3); text-align: center;">
                <div style="font-size: 10px; color: var(--accent-cyan);">Humedad Relativa</div>
                <div style="font-size: 18px; font-weight: 700; color: #fff;">${activeSensor.telemetry.humidity}%</div>
                <div style="font-size: 10px; color: var(--text-secondary);">ET0 Penman: ${activeSensor.telemetry.et0PenmanMonteith || '4.2'} mm/d</div>
              </div>
            </div>

            <!-- Spray Window & Cherry Cracking Cards -->
            <div style="margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="background: rgba(16,185,129,0.08); padding: 8px; border-radius: 6px; border: 1px solid rgba(16,185,129,0.3);">
                <div style="font-size: 10px; color: #34d399; font-weight: bold;">🚜 Ventana de Fitosanitarios:</div>
                <div style="font-size: 12px; font-weight: 700; color: #fff; margin-top: 2px;">${activeSensor.telemetry.sprayWindow?.windowToday || '07:30 - 10:45 h'}</div>
                <div style="font-size: 9.5px; color: #cbd5e1; margin-top: 2px;">Viento sin deriva (&lt;10 km/h).</div>
              </div>
              <div style="background: rgba(245,158,11,0.08); padding: 8px; border-radius: 6px; border: 1px solid rgba(245,158,11,0.3);">
                <div style="font-size: 10px; color: #fbbf24; font-weight: bold;">🍒 Lluvia Cosecha (Cracking 72h):</div>
                <div style="font-size: 12px; font-weight: 700; color: #fff; margin-top: 2px;">${activeSensor.telemetry.cherryCrackingRisk?.riskLevel || 'Riesgo Medio (14.5 mm)'}</div>
                <div style="font-size: 9.5px; color: #cbd5e1; margin-top: 2px;">Adelantar cosecha o protector.</div>
              </div>
            </div>
          </div>

          <div class="glass-card" style="margin-top: 10px;">
            <div class="metric-label">🌡️ Tendencia 24h - Curva Térmica (°C)</div>
            <div class="chart-container">
              <canvas id="sparklineCanvas"></canvas>
            </div>
          </div>
        `;
      } else {
        sensorDetailBoxHtml = `
          <!-- Multilayer Soil Moisture Box -->
          <div class="glass-card" style="margin-top: 10px; border-left: 3px solid var(--accent-cyan);">
            <div class="metric-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>💧 Humedad por Estratos Radiculares (Calibración Franco-Arcilloso Maule)</span>
              <span style="font-size: 10px; color: var(--accent-emerald); font-family: monospace;">[FDR Multi-Estrato]</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-top: 8px; text-align: center;">
              <div style="background: rgba(255,255,255,0.03); padding: 6px; border-radius: 6px;">
                <div style="font-size: 10px; color: var(--text-muted);">0 - 20 cm</div>
                <div style="font-size: 13px; font-weight: 700; color: var(--accent-amber);">${activeSensor.telemetry.soilMoistureLayer1 || (activeSensor.telemetry.soilMoisture * 0.75).toFixed(1)}%</div>
                <div style="font-size: 9px; color: var(--text-muted);">Superficie</div>
              </div>
              <div style="background: rgba(6,182,212,0.08); padding: 6px; border-radius: 6px; border: 1px solid rgba(6,182,212,0.3);">
                <div style="font-size: 10px; color: var(--accent-cyan);">20 - 60 cm</div>
                <div style="font-size: 13px; font-weight: 700; color: var(--accent-cyan);">${activeSensor.telemetry.soilMoistureLayer2 || activeSensor.telemetry.soilMoisture}%</div>
                <div style="font-size: 9px; color: var(--text-secondary);">Raíz Activa</div>
              </div>
              <div style="background: rgba(16,185,129,0.08); padding: 6px; border-radius: 6px; border: 1px solid rgba(16,185,129,0.3);">
                <div style="font-size: 10px; color: var(--accent-emerald);">60 - 100 cm</div>
                <div style="font-size: 13px; font-weight: 700; color: var(--accent-emerald);">${activeSensor.telemetry.soilMoistureLayer3 || (activeSensor.telemetry.soilMoisture * 1.15).toFixed(1)}%</div>
                <div style="font-size: 9px; color: var(--text-secondary);">Reserva</div>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05);">
              <span>⚡ ET0 Penman-Monteith: <strong style="color: var(--accent-emerald);">${activeSensor.telemetry.et0PenmanMonteith || '3.8'} mm/d</strong></span>
              <span>📊 Estrés CWSI: <strong style="color: var(--accent-cyan);">${activeSensor.telemetry.cwsiStressIndex || '0.24'}</strong></span>
            </div>
          </div>

          <div class="glass-card" style="margin-top: 10px;">
            <div class="metric-label">💧 Tendencia 24h - Humedad del Suelo (%)</div>
            <div class="chart-container">
              <canvas id="sparklineCanvas"></canvas>
            </div>
          </div>
        `;
      }
    }

    return `
      <div class="glass-card" style="border-left: 4px solid #f59e0b; padding: 10px 12px; margin-bottom: 10px; background: rgba(245, 158, 11, 0.08); display: flex; align-items: center; justify-content: space-between;">
        <div>
          <span style="font-size: 11px; font-weight: 800; color: #fbbf24; font-family: monospace;">[CEREBRO IOT MAULE]</span>
          <div style="font-size: 10px; color: #cbd5e1;">Gabinete IP67, Pantalla TFT & Relés de Control</div>
        </div>
        <button onclick="window.openGalponWorkshop && window.openGalponWorkshop('general')" style="padding: 6px 12px; background: rgba(245, 158, 11, 0.25); border: 1px solid #f59e0b; color: #fde047; border-radius: 6px; font-size: 10.5px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px;">
          <span>📟</span> Abrir Caja de Terreno
        </button>
      </div>

      <div class="future-title" style="color: var(--accent-cyan); margin-bottom: 6px;">📡 Red de Sensores Maule • Fundo Meniels</div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${sensorListHtml}
      </div>

      ${sensorDetailBoxHtml}
    `;
  }

  bindSensorTabClickHandlers() {
    const items = document.querySelectorAll('.sensor-list-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-sensor-id');
        this.selectedSensorId = id;
        
        // Highlight sensor in 3D Map
        bus.emit('sensor:highlight', id);
        
        // Re-render Tab
        this.renderMainHouseDashboard();
      });
    });

    // Render Canvas Sparkline with corresponding metric
    setTimeout(() => {
      const canvas = document.getElementById('sparklineCanvas');
      const sensors = this.dataSource.entitiesData ? this.dataSource.entitiesData.sensors : [];
      const sensor = sensors.find(s => s.id === this.selectedSensorId) || sensors[0];
      if (canvas && sensor && sensor.history) {
        let metric = 'moisture';
        if (sensor.id.includes('FROST') || sensor.categoryMaule === 'frost_fruit_height') {
          metric = 'fruitHeightTemp';
        } else if (sensor.id.includes('LEAF') || sensor.categoryMaule === 'foliar_wetness') {
          metric = 'wetnessHours';
        } else if (sensor.id.includes('FLOW') || sensor.categoryMaule === 'water_canal_dga') {
          metric = 'flowLps';
        } else if (sensor.id.includes('WIND') || sensor.telemetry.windSpeedKmH !== undefined) {
          metric = 'windSpeed';
        } else if (sensor.id.includes('WX') || sensor.name.includes('Meteorológica')) {
          metric = 'temperature';
        }
        ChartManager.renderSparkline(canvas, sensor.history, metric);
      }
    }, 50);
  }

  renderFeaturesTab() {
    return `
      <div class="glass-card">
        <div class="future-title" style="color: var(--accent-cyan);">☀️ Paneles Solares & Calefacción</div>
        <div style="font-size: 11px; color: var(--text-secondary); margin-top: 6px;">
          • Paneles Solares: <strong>12x Mono-PERC 550W</strong> (Potencia 6.6 kWp)<br>
          • Banco de Baterías: <strong>Litio LiFePO4 15 kWh</strong><br>
          • Chimenea: <strong>Estufa Bosca Doble Cámara 12 kW</strong> (10,320 kcal/h)
        </div>
      </div>

      <div class="glass-card">
        <div class="future-title" style="color: var(--accent-emerald);">🍎 Matriz de Alimentos Producción/Año</div>
        <div style="margin-top: 8px;">
          <div class="prod-item"><span class="prod-name">🌾 Trigo</span><span class="prod-val">3,200 kg</span></div>
          <div class="prod-item"><span class="prod-name">🥔 Papa</span><span class="prod-val">1,800 kg</span></div>
          <div class="prod-item"><span class="prod-name">🍅 Tomate</span><span class="prod-val">650 kg</span></div>
          <div class="prod-item"><span class="prod-name">🌰 Avellano Europeo</span><span class="prod-val">480 kg</span></div>
          <div class="prod-item"><span class="prod-name">🍄 Shiitake</span><span class="prod-val">120 kg</span></div>
        </div>
      </div>

      <div class="glass-card">
        <div class="future-title" style="color: var(--accent-amber);">🪵 Matriz de Madera & Biomasa</div>
        <div style="margin-top: 8px;">
          <div class="prod-item"><span class="prod-name">🌲 Pino radiata</span><span class="prod-val">8.5 m³/año</span></div>
          <div class="prod-item"><span class="prod-name">🌲 Eucaliptus</span><span class="prod-val">5.5 m³/año</span></div>
        </div>
      </div>
    `;
  }

  updateSunSimulation() {
    const dayOfYear = this.selectedDayOfYear || 172;
    const hourOfDay = this.selectedHourOfDay !== undefined ? this.selectedHourOfDay : 12;
    const m = this.calculateSolarMetrics(dayOfYear, hourOfDay);

    // 1. Text Labels
    const dayLabel = document.getElementById('label_day');
    const hourLabel = document.getElementById('label_hour');
    if (dayLabel) {
      const dateStr = this.getDayOfYearDateString(dayOfYear);
      dayLabel.textContent = `Día ${dayOfYear} • ${dateStr}`;
    }
    if (hourLabel) {
      hourLabel.textContent = `${hourOfDay}:00 hrs (${m.isDay ? 'Luz Día' : 'Noche'})`;
    }

    // 2. Solar Position Grid Values
    const setT = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setT('val_sun_elev', `${m.elevDeg}° Alt`);
    setT('val_sun_az', `${m.azDeg}° Az (${m.cardinalDir})`);
    setT('val_sun_dec', `${m.declinationDeg}°`);
    setT('val_sun_daylight', `${m.daylightHours} h/d`);
    setT('val_sun_rise_set', `🌅 ${m.sunriseTime} | 🌇 ${m.sunsetTime}`);

    // 3. Radiation Values
    setT('val_ghi_instant', `${m.ghiInstant} W/m²`);
    setT('val_dni_instant', `${m.dniInstant} W/m²`);
    setT('val_dhi_instant', `${m.dhiInstant} W/m²`);
    setT('val_ghi_daily', `${m.dailyGhiKwh} kWh/m²/d`);
    setT('val_hsp', `${m.hsp} HSP`);

    // 4. PV Energy Capture Values
    setT('val_pv_power', `${m.instantPowerKw} kW`);
    setT('val_pv_daily', `${m.dailyGenKwh} kWh/día`);
    setT('val_pv_month', `${(m.dailyGenKwh * 30).toFixed(0)} kWh/mes`);
    setT('val_pv_water', `${m.waterPumpM3} m³/día`);
    setT('val_pv_co2', `${m.co2SavedKg} kg/mes`);

    const powerBar = document.getElementById('val_pv_power_bar');
    if (powerBar) powerBar.style.width = `${m.instantPowerPercent}%`;

    // 5. Redraw Canvases
    const sunCanvas = document.getElementById('sunPathHorizonCanvas');
    if (sunCanvas) {
      this.drawSunPathHorizon(sunCanvas, dayOfYear, hourOfDay);
    }

    const starCanvas = document.getElementById('starMapCanvas');
    if (starCanvas) {
      this.drawStarMap(starCanvas, dayOfYear, hourOfDay);
    }

    bus.emit('map:update_sun', { day: dayOfYear, hour: hourOfDay });
  }

  renderSensorPanel(props) {
    this.selectedSensorId = props.sensorId || props.id.replace('sensor_', '');
    this.activeHouseTab = 'sensors';
    this.renderMainHouseDashboard();
  }

  renderParcelPanel(props) {
    return this.detailPanels.renderParcelPanel(props);
  }

  renderCropPanel(props) {
    return this.detailPanels.renderCropPanel(props);
  }


  onSensorUpdated(sensor) {
    // Live refresh if on sensor tab
  }

  updateHeaderStats() {
    const sensors = this.dataSource.entitiesData ? this.dataSource.entitiesData.sensors : [];
    if (sensors.length > 0 && this.activeSensorsEl) {
      this.activeSensorsEl.textContent = `${sensors.length} Nodos`;
    }
  }

  showAlert(message) {
    if (!this.alertBanner || !this.alertMessage) return;
    this.alertMessage.textContent = message;
    this.alertBanner.style.display = 'flex';
    setTimeout(() => { this.alertBanner.style.display = 'none'; }, 6000);
  }

  /**
   * Dedicated panel for Custom 3D Polygons created with the Pincel tool.
   * Displays all Catálogo de Ítems specs, area in ha, and options
   * to change the item type or delete the polygon.
   */
  renderCustomPolygonPanel(props) {
    return this.detailPanels.renderCustomPolygonPanel(props);
  }

  renderPlacedObjectPanel(props) {
    return this.detailPanels.renderPlacedObjectPanel(props);
  }
}
