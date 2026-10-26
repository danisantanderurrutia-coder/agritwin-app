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

export class UIController {
  constructor(dataSource, simulationEngine) {
    this.dataSource = dataSource;
    this.simulationEngine = simulationEngine;

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
  }

  init() {
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

    // Render Default Creator View on startup and collapse into edge tab
    this.renderDefaultCreatorView();
    this.collapseDrawer();

    bus.on('entity:selected', (data) => this.onEntitySelected(data));
    bus.on('entity:deselected', () => this.renderDefaultCreatorView());
    bus.on('sensor:telemetry_updated', (sensor) => this.onSensorUpdated(sensor));

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
      this.closeDrawerBtn.addEventListener('click', () => this.renderDefaultCreatorView());
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

    window.selectAnimal = (animalId) => {
      this.selectedAnimalId = animalId;
      this.activeHouseTab = 'livestock';
      this.renderMainHouseDashboard();
      const animal = this.livestockManager?.getAnimal(animalId);
      if (animal && this.mapManager) {
        this.mapManager.flyToPosition(animal.x - 6, animal.y + 6, animal.z + 8, animal.x, animal.y, animal.z);
      }
    };

    window.startRelocatingAnimal = (animalId) => {
      if (this.livestockManager) {
        this.livestockManager.startInteractiveRelocation(animalId);
      }
    };

    window.teleportAnimal = (animalId, preset) => {
      if (this.livestockManager) {
        this.livestockManager.teleportPreset(animalId, preset);
        this.renderMainHouseDashboard();
      }
    };

    window.moveAnimalCoords = (animalId) => {
      const xInput = document.getElementById('edit_coord_x');
      const zInput = document.getElementById('edit_coord_z');
      if (xInput && zInput && this.livestockManager) {
        const x = parseFloat(xInput.value) || 0;
        const z = parseFloat(zInput.value) || 0;
        this.livestockManager.relocateAnimal(animalId, x, z);
        this.renderMainHouseDashboard();
      }
    };

    window.saveAnimalData = (animalId) => {
      const name = document.getElementById('edit_animal_name')?.value;
      const tag = document.getElementById('edit_animal_tag')?.value;
      const breed = document.getElementById('edit_animal_breed')?.value;
      const weight = parseFloat(document.getElementById('edit_animal_weight')?.value) || 0;
      const health = document.getElementById('edit_animal_health')?.value;
      const category = document.getElementById('edit_animal_category')?.value;
      const notes = document.getElementById('edit_animal_notes')?.value;

      if (this.livestockManager) {
        this.livestockManager.updateAnimalData(animalId, {
          name, tag, breed, weightKg: weight, health, category, notes
        });
        this.renderMainHouseDashboard();
      }
    };

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
      { id: 'btn_risk_none', mode: 'none', label: 'Normal' },
      { id: 'btn_risk_water', mode: 'water', label: 'Hídrico' },
      { id: 'btn_risk_frost', mode: 'frost', label: 'Heladas' },
      { id: 'btn_risk_fire', mode: 'fire', label: 'Incendios' },
      { id: 'btn_risk_ndvi', mode: 'ndvi', label: 'NDVI Satelital' }
    ];

    const triggerRiskLabel = document.getElementById('trigger_risk_label');

    riskModes.forEach(({ id, mode, label }) => {
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
          bus.emit('map:set_ndvi_mode', mode === 'ndvi');
          if (this.closeAllDropdowns) this.closeAllDropdowns();
        });
      }
    });
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
    const cardModes = [
      { id: 'btn_sensor_cards_hover', mode: 'hover', label: 'Hover' },
      { id: 'btn_sensor_cards_all', mode: 'all', label: 'Todas' },
      { id: 'btn_sensor_cards_none', mode: 'none', label: 'Ocultas' }
    ];

    const triggerLabel = document.getElementById('trigger_sensor_cards_label');

    const setCardMode = (mode, label) => {
      cardModes.forEach(c => {
        const el = document.getElementById(c.id);
        if (el) el.classList.toggle('active', c.mode === mode);
      });
      if (triggerLabel) triggerLabel.textContent = label;
      bus.emit('sensor_cards:set_mode', mode);
    };

    cardModes.forEach(({ id, mode, label }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          setCardMode(mode, label);
          bus.emit('ui:show_toast', `📡 Tarjetas IoT 3D: ${label}`);
          if (this.closeAllDropdowns) this.closeAllDropdowns();
        });
      }
    });

    // Support cycling or external synchronization
    bus.on('sensor_cards:cycle', () => {
      const current = cardModes.find(c => document.getElementById(c.id)?.classList.contains('active')) || cardModes[0];
      const nextIdx = (cardModes.indexOf(current) + 1) % cardModes.length;
      const next = cardModes[nextIdx];
      setCardMode(next.mode, next.label);
      bus.emit('ui:show_toast', `📡 Tarjetas IoT 3D: ${next.label}`);
    });

    bus.on('sensor_cards:mode_changed', (mode) => {
      const target = cardModes.find(c => c.mode === mode);
      if (target) {
        cardModes.forEach(c => {
          const el = document.getElementById(c.id);
          if (el) el.classList.toggle('active', c.mode === mode);
        });
        if (triggerLabel) triggerLabel.textContent = target.label;
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
      { id: 'cam_overview', preset: 'overview', label: 'General' },
      { id: 'cam_orchard', preset: 'orchard', label: 'Cuartel A' },
      { id: 'cam_sensors', preset: 'sensors', label: 'Nodos' }
    ];

    const triggerCamLabel = document.getElementById('trigger_cam_label');

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
    this.currentSelectedEntityId = 'studio_dashboard';
    this.drawerTitle.textContent = '🛠️ Modo Estudio / Maestro';
    this.drawerSubtitle.textContent = 'Laboratorio de Riesgos a Escala Cuenca & Sandbox';

    this.drawerBody.innerHTML = `
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

      <!-- SIMULADOR INTERACTIVO DE ESCENARIOS EN TIEMPO REAL -->
      <div class="glass-card" style="margin-top: 12px; border-color: rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.06);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div class="metric-label" style="color: #fbbf24; font-weight: 700;">⚡ SIMULADOR DE ESCENARIOS EXTREMOS (3D LIVE)</div>
          <span style="font-size: 10px; color: var(--text-muted);">Haz clic para activar</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
          <button id="btnSimPuelche" class="btn-tool" style="width: 100%; justify-content: flex-start; padding: 9px 12px; border-color: rgba(249, 115, 22, 0.4); background: rgba(249, 115, 22, 0.12);">
            <span style="font-size: 16px;">🌪️</span>
            <div style="text-align: left; margin-left: 6px;">
              <div style="font-weight: 700; color: #fdba74; font-size: 11px;">Simular Viento Puelche 30-30-30 (Incendios)</div>
              <div style="font-size: 9px; color: var(--text-muted);">Vectores E-NE 36 km/h, HR 22%, T 33°C, FWI 44 Crítico</div>
            </div>
          </button>

          <button id="btnSimFlood" class="btn-tool" style="width: 100%; justify-content: flex-start; padding: 9px 12px; border-color: rgba(2, 132, 199, 0.4); background: rgba(2, 132, 199, 0.12);">
            <span style="font-size: 16px;">🌊</span>
            <div style="text-align: left; margin-left: 6px;">
              <div style="font-weight: 700; color: #38bdf8; font-size: 11px;">Simular Crecida Fluvial T=50 años (Inundación)</div>
              <div style="font-size: 9px; color: var(--text-muted);">Isoterma 0 a 3.400m, desborde estero +1.8m, amortiguación nativa</div>
            </div>
          </button>

          <button id="btnSimDrought" class="btn-tool" style="width: 100%; justify-content: flex-start; padding: 9px 12px; border-color: rgba(234, 179, 8, 0.4); background: rgba(234, 179, 8, 0.12);">
            <span style="font-size: 16px;">☀️</span>
            <div style="text-align: left; margin-left: 6px;">
              <div style="font-weight: 700; color: #fde047; font-size: 11px;">Simular Megasequía La Niña (Estrés Acuífero)</div>
              <div style="font-size: 9px; color: var(--text-muted);">Déficit -45%, napa a -11.2m, semáforo rojo en pozos DGA</div>
            </div>
          </button>

          <button id="btnSimReset" class="btn-tool" style="width: 100%; justify-content: center; padding: 7px 12px; border-color: rgba(255, 255, 255, 0.15);">
            <span>🔄 Restaurar Escenario Normal</span>
          </button>

          <button id="btnOpenVecinosFromTerritorial" class="btn-tool" style="width: 100%; justify-content: flex-start; padding: 9px 12px; border-color: rgba(202, 138, 4, 0.5); background: linear-gradient(135deg, rgba(202, 138, 4, 0.18), rgba(120, 53, 15, 0.25)); margin-top: 4px;">
            <span style="font-size: 16px;">🎲</span>
            <div style="text-align: left; margin-left: 6px;">
              <div style="font-weight: 800; color: #fde047; font-size: 11px;">Abrir Vista Vecinal & Predios Contiguos (Modo Territorial)</div>
              <div style="font-size: 9px; color: #fef08a;">Análisis de riesgo compartido con predios vecinos de Las Camelias</div>
            </div>
          </button>
        </div>
      </div>

      <!-- DOSSIER METODOLÓGICO: CÓMO ELABORAR MAPAS DE RIESGO -->
      <div class="glass-card" style="margin-top: 12px;">
        <div class="metric-label" style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 8px;">
          📚 METODOLOGÍA CIENTÍFICA: CÓMO ELABORAR MAPAS DE RIESGO
        </div>

        <!-- Metodología 1: Incendios -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(239, 68, 68, 0.25); border-left: 3px solid #ef4444; padding: 10px 12px; border-radius: 8px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #f87171; font-size: 11px;">1. Mapas de Piro-Riesgo & FWI (Incendios)</strong>
            <span style="font-size: 9px; font-family: monospace; color: #fca5a5;">SENTINEL-2 / ERA5</span>
          </div>
          <div style="font-size: 10px; color: var(--text-secondary); margin-top: 5px; line-height: 1.45;">
            • <strong>Índice Espectral NBR:</strong> <code style="color: #67e8f9;">(B8A - B12) / (B8A + B12)</code> para detectar humedad de follaje seco vs verde.<br>
            • <strong>Contenido de Humedad del Combustible (FMC):</strong> Determina la inflamabilidad del dosel vivo.<br>
            • <strong>Fórmula FWI Canadiense:</strong> Acoplamiento de <span style="color:#fde047;">FFMC</span> (combustible fino superficial), <span style="color:#fde047;">DMC</span> (materia orgánica media) y <span style="color:#fde047;">DC</span> (sequedad profunda) $\\rightarrow$ <span style="color:#fb923c;">ISI</span> (velocidad propagación por viento) $\\rightarrow$ <strong>FWI Final</strong>.<br>
            • <strong>El Viento Puelche / Raco:</strong> Viento catabático cálido y seco desde la Cordillera de los Andes que activa la regla crítica <strong>30-30-30</strong> (>30°C, <30% HR, >30 km/h).
          </div>
        </div>

        <!-- Metodología 2: Inundaciones -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(2, 132, 199, 0.25); border-left: 3px solid #0284c7; padding: 10px 12px; border-radius: 8px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #38bdf8; font-size: 11px;">2. Mapas de Inundación Fluvial & Isoterma 0 Alta</strong>
            <span style="font-size: 9px; font-family: monospace; color: #7dd3fc;">LiDAR 5cm / SAINT-VENANT</span>
          </div>
          <div style="font-size: 10px; color: var(--text-secondary); margin-top: 5px; line-height: 1.45;">
            • <strong>Modelación 2D Saint-Venant:</strong> Simula velocidades de flujo, tirantes de agua y envolventes de inundación en el meandro del Estero Colliguay.<br>
            • <strong>Fenómeno de Isoterma 0 Alta:</strong> Ríos atmosféricos cálidos que precipitan agua líquida sobre nieve andina acumulada (>3.000m), quintuplicando el caudal instantáneo en la cuenca baja de Parral/Retiro.<br>
            • <strong>Períodos de Retorno:</strong> T=10 años (crecida ordinaria), T=50 años (desborde de riberas bajas) y T=100 años (evento catastrófico como junio 2023).<br>
            • <strong>Bioingeniería:</strong> El corredor ribereño de Quillay y Sauces reduce la velocidad del agua en un 42% por fricción biológica rugosa.
          </div>
        </div>

        <!-- Metodología 3: Sequía & Balance Acuífero -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(16, 185, 129, 0.25); border-left: 3px solid #10b981; padding: 10px 12px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #34d399; font-size: 11px;">3. Sequía & Balance Acuífero Subterráneo</strong>
            <span style="font-size: 9px; font-family: monospace; color: #6ee7b7;">GRACE / FAO-56</span>
          </div>
          <div style="font-size: 10px; color: var(--text-secondary); margin-top: 5px; line-height: 1.45;">
            • <strong>Balance en 3 Estratos:</strong> 0-20 cm (evaporación directa), 20-60 cm (absorción radicular activa de cerezos y vides) y 60-100 cm (recarga de napa).<br>
            • <strong>Penman-Monteith FAO-56:</strong> Evapotranspiración real del cultivo acoplada a déficit de presión de vapor (VPD).<br>
            • <strong>Piezometría DGA en Tiempo Real:</strong> Monitoreo continuo de pozos inscritos en la cuenca del Perquilauquén para evitar la sobreexplotación hídrica.
          </div>
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
    `;

    // Wire Scenario Buttons
    document.getElementById('btnSimPuelche')?.addEventListener('click', () => {
      bus.emit('basin:puelche_wind', true);
      bus.emit('risk:set_mode', 'fire');
      this.showAlert('🌪️ Alerta Piro-Riesgo: Viento Puelche cálido 36 km/h descendente desde los Andes. FWI Crítico 44. Barrera cortafuegos CONAF activa.');
    });

    document.getElementById('btnSimFlood')?.addEventListener('click', () => {
      bus.emit('basin:flood_level', 1.6);
      bus.emit('risk:set_mode', 'water');
      this.showAlert('🌊 Simulación Hidráulica T=50 años: Isoterma 0 Alta a 3.400m. Crecida fluvial en Estero Colliguay amortiguada por el corredor nativo.');
    });

    document.getElementById('btnSimDrought')?.addEventListener('click', () => {
      bus.emit('basin:aquifer_stress', true);
      bus.emit('risk:set_mode', 'water');
      this.showAlert('☀️ Alerta Sequía La Niña: Déficit hídrico -45%. Napa freática desciende a -11.2m. Activando restricción de bombeo B2G.');
    });

    document.getElementById('btnSimReset')?.addEventListener('click', () => {
      bus.emit('basin:reset_scenarios');
      bus.emit('risk:set_mode', 'none');
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
  }

  renderEnterpriseDashboard() {
    this.currentSelectedEntityId = 'enterprise_dashboard';
    this.drawerTitle.textContent = '🍇 AgroTwin Enterprise Suite';
    this.drawerSubtitle.textContent = 'Viñedos & Frutales de Exportación • Maule';

    this.drawerBody.innerHTML = `
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
    this.currentSelectedEntityId = 'territorial_dashboard';
    this.drawerTitle.textContent = '🗺️ AgroTwin Territorial & Vecinal';
    this.drawerSubtitle.textContent = 'Matriz Catan de Predios Acoplados • Retiro / Maule';

    const hex = selectedHex || this.selectedTerritorialHex || this.territorialCatanManager?.getHex(0, 0) || {
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
    const allHexes = this.territorialCatanManager?.getAllHexes() || [];
    const activeLens = this.territorialCatanManager?.activeLens || 'lulc';

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

    this.drawerBody.innerHTML = `
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
    this.currentSelectedEntityId = 'esg_dashboard';
    this.drawerTitle.textContent = '🌿 AgroTwin ESG / MRV Ledger';
    this.drawerSubtitle.textContent = 'Auditoría Ambiental • GIZ, BID & Taxonomía UE';

    this.drawerBody.innerHTML = `
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
    this.currentSelectedEntityId = null;
    this.drawerTitle.textContent = 'AgriTwin 3D Digital Twin';
    this.drawerSubtitle.textContent = 'Predio Meniels | Parral, Región del Maule';

    this.drawerBody.innerHTML = `
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

  onEntitySelected(data) {
    this.currentSelectedEntityId = data.id;
    const props = data.properties || {};

    if (props.isCustom || props.type === 'custom_polygon') {
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
      this.openDrawer();
      this.renderMainHouseDashboard();
    } else if (props.type === 'sensor') {
      this.selectedSensorId = props.sensorId || props.id.replace('sensor_', '');
      this.activeHouseTab = 'sensors';
      this.renderMainHouseDashboard();
    } else if (props.type === 'parcel') {
      this.renderParcelPanel(props);
    } else if (props.type === 'territorial_hex') {
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
      <div class="panel-tab-bar" style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px;">
        <button id="tab_btn_meta" class="tab-btn ${this.activeHouseTab === 'metabolism' ? 'active' : ''}">🏡 Predio</button>
        <button id="tab_btn_livestock" class="tab-btn ${this.activeHouseTab === 'livestock' ? 'active' : ''}">🐄 Ganadería</button>
        <button id="tab_btn_perma" class="tab-btn ${this.activeHouseTab === 'permaculture' ? 'active' : ''}">🌱 Permacultura</button>
        <button id="tab_btn_sens" class="tab-btn ${this.activeHouseTab === 'sensors' ? 'active' : ''}">📡 Sensores</button>
        <button id="tab_btn_weather" class="tab-btn ${this.activeHouseTab === 'weather' ? 'active' : ''}">🌦️ Clima</button>
        <button id="tab_btn_astro" class="tab-btn ${this.activeHouseTab === 'astro' ? 'active' : ''}">🧭 Sol</button>
        <button id="tab_btn_feat" class="tab-btn ${this.activeHouseTab === 'features' ? 'active' : ''}">⚡ Features</button>
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

    // Bind tab button click listeners
    const btnMeta = document.getElementById('tab_btn_meta');
    const btnLivestock = document.getElementById('tab_btn_livestock');
    const btnPerma = document.getElementById('tab_btn_perma');
    const btnWeather = document.getElementById('tab_btn_weather');
    const btnAstro = document.getElementById('tab_btn_astro');
    const btnSens = document.getElementById('tab_btn_sens');
    const btnFeat = document.getElementById('tab_btn_feat');

    if (btnMeta) btnMeta.addEventListener('click', () => { this.activeHouseTab = 'metabolism'; this.renderMainHouseDashboard(); });
    if (btnLivestock) btnLivestock.addEventListener('click', () => { this.activeHouseTab = 'livestock'; this.renderMainHouseDashboard(); bus.emit('map:flyto', 'livestock'); });
    if (btnPerma) btnPerma.addEventListener('click', () => { this.activeHouseTab = 'permaculture'; this.renderMainHouseDashboard(); bus.emit('map:flyto', 'permaculture'); });
    if (btnWeather) btnWeather.addEventListener('click', () => { this.activeHouseTab = 'weather'; this.renderMainHouseDashboard(); });
    if (btnAstro) btnAstro.addEventListener('click', () => { this.activeHouseTab = 'astro'; this.renderMainHouseDashboard(); });
    if (btnSens) btnSens.addEventListener('click', () => { this.activeHouseTab = 'sensors'; this.renderMainHouseDashboard(); });
    if (btnFeat) btnFeat.addEventListener('click', () => { this.activeHouseTab = 'features'; this.renderMainHouseDashboard(); });

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
        const starCanvas = document.getElementById('starMapCanvas');
        if (starCanvas) this.drawStarMap(starCanvas, this.selectedDayOfYear, this.selectedHourOfDay);
      }, 40);
    }

    if (this.activeHouseTab === 'sensors') {
      this.bindSensorTabClickHandlers();
    }
  }

  renderMetabolismTab() {
    return `
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
    `;
  }

  /**
   * Pestaña: Ganadería Regenerativa & Pastoreo Racional Voisin (PRV)
   * Incluye Ficha Técnica Individual Editable y Herramienta de Reubicación 3D en Relieve
   */
  renderLivestockTab() {
    const paddocks = (this.livestockManager && this.livestockManager.paddocks) ? this.livestockManager.paddocks : [
      { id: 'P1', name: 'Potrero 1 - Trébol Blanco & Festuca', restDays: 44, forrajeCm: 24, kgMsHa: 2850, status: 'ready', badge: 'Listo (44d)' },
      { id: 'P2', name: 'Potrero 2 - Alfalfa & Raygrass', restDays: 41, forrajeCm: 22, kgMsHa: 2600, status: 'ready', badge: 'Listo (41d)' },
      { id: 'P3', name: 'Potrero 3 - Pastura Sur-Oeste (Vacas)', restDays: 1, forrajeCm: 25, kgMsHa: 3100, status: 'active', badge: 'Ocupado (1d)' },
      { id: 'P4', name: 'Potrero 4 - Silvopastoreo Borde Cerezos', restDays: 32, forrajeCm: 18, kgMsHa: 1950, status: 'resting', badge: 'Reposo (32d)' },
      { id: 'P5', name: 'Potrero 5 - Trébol Subterráneo (Ovejas)', restDays: 24, forrajeCm: 16, kgMsHa: 1750, status: 'resting', badge: 'Reposo (24d)' },
      { id: 'P6', name: 'Potrero 6 - Pradera Regenerativa Este', restDays: 16, forrajeCm: 12, kgMsHa: 1250, status: 'resting', badge: 'Reposo (16d)' },
      { id: 'P7', name: 'Potrero 7 - Franja Sur (Caballos)', restDays: 8, forrajeCm: 10, kgMsHa: 950, status: 'resting', badge: 'Rebrote (8d)' },
      { id: 'P8', name: 'Potrero 8 - Cuadro Nor-Este (Gallinero)', restDays: 4, forrajeCm: 8, kgMsHa: 750, status: 'coop', badge: 'Gallinero (4d)' }
    ];

    const currentPaddock = paddocks.find(p => p.id === (this.selectedPaddockId || 'P3')) || paddocks[2];

    // Obtener lista completa de animales
    const allAnimals = this.livestockManager ? this.livestockManager.getAllAnimals() : [];
    const activeAnimal = (this.selectedAnimalId && this.livestockManager) ? 
      (this.livestockManager.getAnimal(this.selectedAnimalId) || allAnimals[0]) : (allAnimals[0] || null);

    return `
      <!-- 1. Herd Overview Banner -->
      <div class="glass-card" style="border-left: 4px solid #f59e0b; padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-family: monospace; color: #f59e0b; font-weight: 700;">[PASTOREO RACIONAL VOISIN • PRV]</span>
          <span class="status-badge optimal" style="font-size: 10px;">🟢 Carga: 1.8 UGM/ha</span>
        </div>
        <div style="font-size: 15px; font-weight: 800; color: #fff; margin-top: 4px;">
          🐄 Manejo Ganadero Multiespecie & Bienestar Animal
        </div>
        <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
          Vacas en Sur-Oeste • Ovejas en Centro-Oeste • Gallinas en Nor-Este • Caballos Libres
        </div>
      </div>

      <!-- 2. Ficha Técnica Individual del Animal Seleccionado -->
      ${activeAnimal ? `
        <div class="glass-card" style="margin-top: 10px; border: 1px solid rgba(245, 158, 11, 0.45); background: rgba(245, 158, 11, 0.05); padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">${activeAnimal.icon || '🐄'}</span>
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #fde047;">${activeAnimal.name}</div>
                <div style="font-size: 10px; font-family: monospace; color: #94a3b8;">Caravana: ${activeAnimal.tag} • ${activeAnimal.species}</div>
              </div>
            </div>
            <span class="status-badge optimal" style="font-size: 9px;">${activeAnimal.health}</span>
          </div>

          <!-- Selector rápido de animales -->
          <div style="display: flex; gap: 4px; overflow-x: auto; padding: 8px 0 6px; scrollbar-width: none;">
            ${allAnimals.map(a => `
              <button onclick="window.selectAnimal('${a.id}')" style="padding: 3px 7px; font-size: 10px; border-radius: 6px; border: 1px solid ${a.id === activeAnimal.id ? '#f59e0b' : 'rgba(255,255,255,0.1)'}; background: ${a.id === activeAnimal.id ? '#b45309' : 'rgba(255,255,255,0.04)'}; color: #fff; cursor: pointer; white-space: nowrap;">
                ${a.icon} ${a.name.split(' ')[0]}
              </button>
            `).join('')}
          </div>

          <!-- Campos Editables de Datos -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
            <div>
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Nombre Identificador</label>
              <input id="edit_animal_name" value="${activeAnimal.name}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #fff; font-size: 11px; padding: 4px 6px;">
            </div>
            <div>
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Caravana / ID SAG</label>
              <input id="edit_animal_tag" value="${activeAnimal.tag}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #fde047; font-family: monospace; font-size: 11px; padding: 4px 6px;">
            </div>
            <div>
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Raza / Cruza</label>
              <input id="edit_animal_breed" value="${activeAnimal.breed}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #fff; font-size: 11px; padding: 4px 6px;">
            </div>
            <div>
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Peso Vivo (kg)</label>
              <input type="number" id="edit_animal_weight" value="${activeAnimal.weightKg}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #38bdf8; font-size: 11px; padding: 4px 6px;">
            </div>
            <div>
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Estado Sanitario</label>
              <select id="edit_animal_health" style="width: 100%; background: #18181b; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #fff; font-size: 11px; padding: 4px 6px;">
                <option value="Excelente" ${activeAnimal.health.includes('Excelente') ? 'selected' : ''}>Excelente</option>
                <option value="Óptimo (En Producción)" ${activeAnimal.health.includes('Óptimo') ? 'selected' : ''}>Óptimo (En Producción)</option>
                <option value="En Celo / Reproductivo" ${activeAnimal.health.includes('Celo') ? 'selected' : ''}>En Celo / Reproductivo</option>
                <option value="Gestante" ${activeAnimal.health.includes('Gestante') ? 'selected' : ''}>Gestante</option>
                <option value="En Observación" ${activeAnimal.health.includes('Observación') ? 'selected' : ''}>En Observación</option>
              </select>
            </div>
            <div>
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Categoría</label>
              <input id="edit_animal_category" value="${activeAnimal.category}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #fff; font-size: 11px; padding: 4px 6px;">
            </div>
          </div>

          <div style="margin-top: 6px;">
            <label style="font-size: 9px; color: var(--text-muted); display: block;">Notas Veterinarias & Manejo</label>
            <textarea id="edit_animal_notes" rows="2" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #cbd5e1; font-size: 10px; padding: 4px 6px; resize: none;">${activeAnimal.notes || ''}</textarea>
          </div>

          <!-- Coordenadas Georreferenciadas & Herramienta Mover -->
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.15);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">
                📍 Terreno: X: <strong style="color: #fff;">${activeAnimal.x.toFixed(1)}</strong>, Z: <strong style="color: #fff;">${activeAnimal.z.toFixed(1)}</strong> | Cota: <strong style="color: #38bdf8;">${activeAnimal.y.toFixed(2)}m</strong>
              </span>
              <button onclick="window.saveAnimalData('${activeAnimal.id}')" style="padding: 4px 10px; font-size: 10px; background: #047857; color: #fff; border: 1px solid #10b981; border-radius: 4px; cursor: pointer; font-weight: 700;">
                💾 Guardar Ficha
              </button>
            </div>

            <!-- Botón de Reubicación Interactiva en 3D -->
            <button onclick="window.startRelocatingAnimal('${activeAnimal.id}')" style="width: 100%; padding: 7px 12px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(180, 83, 9, 0.4)); border: 1px solid #f59e0b; border-radius: 6px; color: #fde047; font-weight: 700; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px;">
              <span>🎯</span>
              <span>Mover / Reubicar en el Terreno 3D (Clic en mapa)</span>
            </button>

            <!-- Accesos directos a sectores del predio -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <button onclick="window.teleportAnimal('${activeAnimal.id}', 'sur_oeste')" class="btn-tool-sm" style="font-size: 9px; justify-content: center; cursor: pointer;">
                📍 Sur-Oeste (Vacas)
              </button>
              <button onclick="window.teleportAnimal('${activeAnimal.id}', 'centro_oeste')" class="btn-tool-sm" style="font-size: 9px; justify-content: center; cursor: pointer;">
                📍 Centro-Oeste (Ovejas)
              </button>
              <button onclick="window.teleportAnimal('${activeAnimal.id}', 'nor_este')" class="btn-tool-sm" style="font-size: 9px; justify-content: center; cursor: pointer;">
                📍 Nor-Este (Gallinero)
              </button>
              <button onclick="window.teleportAnimal('${activeAnimal.id}', 'pradera_central')" class="btn-tool-sm" style="font-size: 9px; justify-content: center; cursor: pointer;">
                📍 Pradera (Caballos)
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- 3. Current Herd Status Metrics -->
      <div class="metrics-grid" style="margin-top: 10px;">
        <div class="glass-card metric-card">
          <div class="metric-label">Potrero Actual</div>
          <div class="metric-value" style="color: #f59e0b;">${currentPaddock.id}</div>
          <div style="font-size: 10px; color: var(--text-muted);">${currentPaddock.name.split('-')[1] || ''}</div>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-label">Altura Forraje</div>
          <div class="metric-value" style="color: var(--accent-emerald);">${currentPaddock.forrajeCm} <span class="metric-unit">cm</span></div>
          <div style="font-size: 10px; color: var(--accent-emerald);">Punto Óptimo Reposo</div>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-label">Masa Seca</div>
          <div class="metric-value" style="color: var(--accent-cyan);">${currentPaddock.kgMsHa} <span class="metric-unit">kg/ha</span></div>
          <div style="font-size: 10px; color: var(--text-muted);">Aforo plato medidor</div>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-label">Permanencia</div>
          <div class="metric-value" style="color: #fde047;">1.5 <span class="metric-unit">días</span></div>
          <div style="font-size: 10px; color: #a3e635;">Meta: &le; 2 días</div>
        </div>
      </div>

      <!-- 4. Semáforo Forrajero de los 8 Potreros PRV -->
      <div class="glass-card" style="margin-top: 10px;">
        <div class="future-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>📋 Rotación de Potreros (8)</span>
          <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">Clic en 'Mover 🐄' para rotar</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
          ${paddocks.map(p => {
            const isActive = (p.id === currentPaddock.id);
            const isReady = (p.status === 'ready');
            const isCoop = (p.status === 'coop');
            let statusColor = isReady ? '#22c55e' : (isActive ? '#f59e0b' : (isCoop ? '#38bdf8' : '#84cc16'));
            let badgeBg = isReady ? 'rgba(34, 197, 94, 0.2)' : (isActive ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.06)');

            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 7px 10px; background: ${isActive ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${isActive ? '#f59e0b' : 'rgba(255,255,255,0.08)'}; border-radius: 8px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <strong style="color: #fff; font-size: 12px;">${p.id}</strong>
                    <span style="font-size: 11px; color: var(--text-secondary);">${p.name.split('-')[1] || p.name}</span>
                  </div>
                  <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">
                    ${p.forrajeCm} cm pasto • ${p.kgMsHa} kg MS/ha • ${p.restDays} días reposo
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 10px; font-family: monospace; padding: 2px 6px; border-radius: 4px; background: ${badgeBg}; color: ${statusColor}; font-weight: 700;">
                    ${p.badge || (p.status === 'active' ? 'Ocupado' : 'Listo')}
                  </span>
                  ${!isActive ? `
                    <button class="btn-tool-sm" onclick="window.rotateHerdTo('${p.id}')" style="padding: 3px 8px; font-size: 10px; background: #166534; color: #bbf7d0; border: 1px solid #22c55e; border-radius: 4px; cursor: pointer;">
                      Mover 🐄
                    </button>
                  ` : `
                    <span style="font-size: 10px; color: #fde047; font-weight: 800;">EN PASTOREO</span>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 5. Egg Mobile & Abrevadero Móvil -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
        <div class="glass-card" style="padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #38bdf8;">🐓 Gallinero Móvil (Nor-Este)</div>
          <div style="font-size: 10px; color: var(--text-secondary); margin-top: 4px;">
            Ubicado al Nor-Este (despejado de paneles solares). Sanitiza pastura y rompe bostas.
          </div>
          <button class="btn-tool-sm" onclick="window.teleportAnimal('coop_main', 'nor_este')" style="width: 100%; margin-top: 8px; justify-content: center; font-size: 10px; cursor: pointer;">
            Reubicar Gallinero 🐓
          </button>
        </div>

        <div class="glass-card" style="padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--accent-cyan);">💧 Abrevadero Móvil Keyline</div>
          <div style="font-size: 10px; color: var(--text-secondary); margin-top: 4px;">
            Conectado por manguera PEAD 32mm al Tranque (18.500 m³). Flotador de alta presión en x: -22, z: 18.
          </div>
          <div style="font-size: 10px; color: #10b981; margin-top: 8px; font-family: monospace;">
            Agua fresca permanente
          </div>
        </div>
      </div>

      <!-- 6. Leyes de André Voisin -->
      <div class="glass-card" style="margin-top: 10px; font-size: 11px; color: var(--text-secondary); line-height: 1.5;">
        <strong style="color: #fde047; display: block; margin-bottom: 4px;">📜 Las 4 Leyes del Pastoreo Voisin:</strong>
        1. <strong>Ley del Reposo:</strong> La pastura debe acumular reservas radiculares antes del siguiente corte.<br>
        2. <strong>Ley de la Ocupación:</strong> Permanencia breve (&le; 2 días) para que el animal no coma el rebrote.<br>
        3. <strong>Ley del Rendimiento Máximo:</strong> Ayudar a los animales más exigentes a cosechar la mejor hierba.<br>
        4. <strong>Ley del Rendimiento Regular:</strong> Para producción óptima, rotación constante y uniforme.
      </div>
    `;
  }

  /**
   * Pestaña: Transición Permacultural & Keyline Yeomans
   */
  renderPermacultureTab() {
    return `
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
   * Pestaña 2: Sol y Orientación (Trayectoria Solar, Visor Estelar, Luna 3D, Simulador de Mareas)
   */
  renderAstroOrientationTab() {
    const solarHours = (12.3 + Math.sin((this.selectedDayOfYear - 81) * (2 * Math.PI / 365)) * 2.8).toFixed(1);

    const moonAge = ((this.selectedDayOfYear + this.selectedHourOfDay / 24 + 14) % 29.53).toFixed(1);
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
      <!-- Solar Tracker & Sliders -->
      <div class="glass-card">
        <div class="future-title">☀️ Trayectoria Solar 3D (Parral -36.14°S)</div>
        <div style="margin-top: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span>Día del Año (1 - 365):</span>
            <strong id="label_day" style="color: var(--accent-amber);">Día ${this.selectedDayOfYear}</strong>
          </div>
          <input type="range" id="slider_day" min="1" max="365" value="${this.selectedDayOfYear}" style="width: 100%; margin-top: 4px;" class="slider-glass">
        </div>

        <div style="margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span>Hora del Día (00:00 - 23:00):</span>
            <strong id="label_hour" style="color: var(--accent-cyan);">${this.selectedHourOfDay}:00 hrs</strong>
          </div>
          <input type="range" id="slider_hour" min="0" max="23" value="${this.selectedHourOfDay}" style="width: 100%; margin-top: 4px;" class="slider-glass">
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 10px; color: var(--accent-amber);">
          <span>☀️ Horas Luz: <strong>${solarHours} hrs/día</strong></span>
          <span>🧭 Azimut Solar: <strong>${Math.round(((this.selectedHourOfDay - 12) * 15 + 360) % 360)}°</strong></span>
        </div>
      </div>

      <!-- Southern Hemisphere Sky & Constellations Viewer -->
      <div class="glass-card">
        <div class="future-title" style="display: flex; justify-content: space-between;">
          <span>🌌 Visor Celeste & Constelaciones Australes</span>
          <span style="font-size: 0.7rem; color: var(--accent-cyan);">Lat -36.14°S</span>
        </div>
        <div style="margin-top: 8px; text-align: center;">
          <canvas id="starMapCanvas" width="460" height="250" style="width: 100%; height: auto; border-radius: 8px;"></canvas>
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 6px; text-align: center;">
          ✨ Incluye <strong>Cruz del Sur</strong>, <strong>Punteros Centauro</strong>, <strong>Orión</strong>, <strong>Escorpio</strong>, <strong>Sirio</strong> y <strong>Canopus</strong> sincronizados con el día y la hora.
        </div>
      </div>

      <!-- Lunar Cycle & Moon in Sky -->
      <div class="glass-card">
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

      <!-- Tidal / Ocean Simulation -->
      <div class="glass-card">
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
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const rain = [14, 18, 25, 62, 148, 238, 215, 138, 76, 46, 26, 16];
    const temp = [21.5, 20.8, 18.2, 14.5, 11.2, 8.9, 8.4, 9.8, 12.1, 14.8, 17.5, 20.1];

    const currentMonth = Math.min(11, Math.floor(((dayOfYear - 1) / 365) * 12));

    const padLeft = 36;
    const padRight = 36;
    const padTop = 26;
    const padBottom = 30;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= 4; r++) {
      const y = padTop + (chartH / 4) * r;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(14, 165, 233, 0.7)';
      ctx.font = '9px system-ui';
      ctx.textAlign = 'right';
      const rainVal = Math.round(250 - (r * 250) / 4);
      ctx.fillText(`${rainVal}`, padLeft - 6, y + 3);

      ctx.fillStyle = 'rgba(249, 115, 22, 0.7)';
      ctx.textAlign = 'left';
      const tempVal = Math.round(30 - (r * 30) / 4);
      ctx.fillText(`${tempVal}°`, width - padRight + 6, y + 3);
    }

    const barWidth = (chartW / 12) * 0.58;
    for (let i = 0; i < 12; i++) {
      const x = padLeft + (i + 0.5) * (chartW / 12) - barWidth / 2;
      const barH = (rain[i] / 250) * chartH;
      const y = padTop + chartH - barH;

      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      if (i === currentMonth) {
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(1, '#0284c7');
      } else {
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
        grad.addColorStop(1, 'rgba(2, 132, 199, 0.25)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]) : ctx.rect(x, y, barWidth, barH);
      ctx.fill();

      ctx.fillStyle = (i === currentMonth) ? '#38bdf8' : 'rgba(255, 255, 255, 0.5)';
      ctx.font = (i === currentMonth) ? 'bold 10px system-ui' : '9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(months[i], x + barWidth / 2, height - 12);
    }

    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const cx = padLeft + (i + 0.5) * (chartW / 12);
      const cy = padTop + chartH - (temp[i] / 30) * chartH;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    for (let i = 0; i < 12; i++) {
      const cx = padLeft + (i + 0.5) * (chartW / 12);
      const cy = padTop + chartH - (temp[i] / 30) * chartH;
      ctx.fillStyle = (i === currentMonth) ? '#ffffff' : '#fb923c';
      ctx.beginPath();
      ctx.arc(cx, cy, (i === currentMonth) ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = '10px system-ui';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText('■ Precipitaciones (mm)', padLeft + 10, padTop - 10);
    ctx.fillStyle = '#f97316';
    ctx.fillText('● Temperatura (°C)', padLeft + 150, padTop - 10);
  }

  /**
   * Dibuja la bóveda celeste austral con constelaciones principales
   */
  drawStarMap(canvas, dayOfYear, hourOfDay) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.44;

    ctx.fillStyle = '#030712';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('S (Sur)', cx, cy + radius + 12);
    ctx.fillText('N (Norte)', cx, cy - radius - 4);
    ctx.fillText('E (Este)', cx + radius + 14, cy + 3);
    ctx.fillText('O (Oeste)', cx - radius - 14, cy + 3);

    const siderealDeg = (dayOfYear * (360 / 365) + hourOfDay * 15) % 360;
    const rot = (siderealDeg * Math.PI) / 180;

    const crux = [
      { name: 'Acrux', r: radius * 0.38, a: rot + 0.1, mag: 4.5 },
      { name: 'Mimosa', r: radius * 0.42, a: rot - 0.12, mag: 4.0 },
      { name: 'Gacrux', r: radius * 0.52, a: rot + 0.08, mag: 4.2 },
      { name: 'Imai', r: radius * 0.47, a: rot + 0.28, mag: 3.2 }
    ];

    const centaurus = [
      { name: 'Alfa Centauri', r: radius * 0.48, a: rot - 0.42, mag: 5.2 },
      { name: 'Hadar', r: radius * 0.44, a: rot - 0.28, mag: 4.4 }
    ];

    const orion = [
      { name: 'Betelgeuse', r: radius * 0.75, a: rot + Math.PI - 0.22, mag: 4.8 },
      { name: 'Rigel', r: radius * 0.72, a: rot + Math.PI + 0.24, mag: 5.0 },
      { name: 'Alnitak', r: radius * 0.68, a: rot + Math.PI - 0.05, mag: 3.5 },
      { name: 'Alnilam', r: radius * 0.68, a: rot + Math.PI, mag: 3.6 },
      { name: 'Mintaka', r: radius * 0.68, a: rot + Math.PI + 0.05, mag: 3.5 }
    ];

    const scorpio = [
      { name: 'Antares', r: radius * 0.58, a: rot + 1.6, mag: 5.0 },
      { name: 'Shaula', r: radius * 0.64, a: rot + 1.85, mag: 3.8 }
    ];

    const siriusCanopus = [
      { name: 'Sirio', r: radius * 0.66, a: rot + Math.PI + 0.62, mag: 6.0 },
      { name: 'Canopus', r: radius * 0.42, a: rot + Math.PI * 0.7, mag: 5.5 }
    ];

    const getXY = (item) => ({
      x: cx + item.r * Math.cos(item.a),
      y: cy + item.r * Math.sin(item.a)
    });

    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1.2;

    const pAcrux = getXY(crux[0]);
    const pGacrux = getXY(crux[2]);
    const pMimosa = getXY(crux[1]);
    const pImai = getXY(crux[3]);

    ctx.beginPath();
    ctx.moveTo(pAcrux.x, pAcrux.y);
    ctx.lineTo(pGacrux.x, pGacrux.y);
    ctx.moveTo(pMimosa.x, pMimosa.y);
    ctx.lineTo(pImai.x, pImai.y);
    ctx.stroke();

    const pAlfa = getXY(centaurus[0]);
    const pHadar = getXY(centaurus[1]);
    ctx.beginPath();
    ctx.moveTo(pAlfa.x, pAlfa.y);
    ctx.lineTo(pHadar.x, pHadar.y);
    ctx.stroke();

    const p1 = getXY(orion[2]);
    const p2 = getXY(orion[3]);
    const p3 = getXY(orion[4]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let i = 0; i < 40; i++) {
      const r = ((i * 37) % 100) / 100 * radius * 0.95;
      const a = rot + (i * 2.4);
      ctx.fillRect(cx + r * Math.cos(a), cy + r * Math.sin(a), 1.2, 1.2);
    }

    const allStars = [...crux, ...centaurus, ...orion, ...scorpio, ...siriusCanopus];
    allStars.forEach(s => {
      const pos = getXY(s);
      const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s.mag * 2);
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.5, '#67e8f9');
      glow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s.mag * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s.mag * 0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(s.name, pos.x + 6, pos.y + 3);
    });

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Cruz del Sur', pAcrux.x, pAcrux.y + 14);
    ctx.fillText('✨ Punteros', pAlfa.x, pAlfa.y + 14);
    ctx.fillText('✨ Orión', p2.x, p2.y - 10);
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
      if (s.id.includes('WIND') || s.name.includes('Anemómetro')) icon = '💨';
      else if (s.id.includes('WX') || s.name.includes('Meteorológica')) icon = '🌤️';
      else if (s.id.includes('03') || s.name.includes('Estero')) icon = '💧';

      const statusBadge = s.telemetry.status === 'optimal' 
        ? `<span class="status-badge optimal"><span class="status-dot"></span> Óptimo</span>`
        : `<span class="status-badge warning"><span class="status-dot"></span> Precaución</span>`;

      const isWind = s.id.includes('WIND') || s.telemetry.windSpeedKmH !== undefined;
      const isWx = s.id.includes('WX') || s.name.includes('Meteorológica');

      let metricsHtml = '';
      if (isWind) {
        metricsHtml = `
          <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 11px; flex-wrap: wrap;">
            <span>💨 Viento: <strong style="color: var(--accent-cyan);">${s.telemetry.windSpeedKmH} km/h</strong></span>
            <span>🧭 Dir: <strong>${s.telemetry.windDirectionText || s.telemetry.windDirectionDeg + '°'}</strong></span>
            <span>⚡ Ráfaga: <strong>${s.telemetry.gustSpeedKmH || '34.2'} km/h</strong></span>
            <span>🔋 Bat: <strong>${s.telemetry.batteryLevel}%</strong></span>
          </div>
        `;
      } else if (isWx) {
        metricsHtml = `
          <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 11px; flex-wrap: wrap;">
            <span>🌡️ Temp: <strong>${s.telemetry.temperature}°C</strong></span>
            <span>💧 Hum: <strong>${s.telemetry.humidity}%</strong></span>
            <span>☀️ Rad: <strong>840 W/m²</strong></span>
            <span>📊 Pres: <strong>1014 hPa</strong></span>
            <span>🔋 Bat: <strong>${s.telemetry.batteryLevel}%</strong></span>
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
      const isWind = activeSensor.id.includes('WIND') || activeSensor.telemetry.windSpeedKmH !== undefined;
      const isWx = activeSensor.id.includes('WX') || activeSensor.name.includes('Meteorológica');

      if (isWind) {
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
                <div style="font-size: 10px; color: var(--text-secondary);">${activeSensor.telemetry.windDirectionDeg || 205}° (Barlovento Norte)</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 10px; color: var(--text-muted);">Ráfaga Máxima (Gust)</div>
                <div style="font-size: 14px; font-weight: 700; color: #fff;">${activeSensor.telemetry.gustSpeedKmH || 34.2} km/h</div>
                <div style="font-size: 9px; color: var(--text-secondary);">Turbulencia 1.45x</div>
              </div>
              <div style="background: rgba(16,185,129,0.08); padding: 8px; border-radius: 6px; border: 1px solid rgba(16,185,129,0.3); text-align: center;">
                <div style="font-size: 10px; color: var(--accent-emerald);">Riesgo Inversión Térmica</div>
                <div style="font-size: 12px; font-weight: 700; color: var(--accent-emerald);">Dispersión Activa</div>
                <div style="font-size: 9px; color: var(--text-secondary);">Viento rompe bolsa fría</div>
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
              <span>🌤️ Estación Meteorológica Central (Casa Meniels)</span>
              <span style="font-size: 10px; color: var(--accent-amber); font-family: monospace;">[STM32 LTE-M]</span>
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
                <div style="font-size: 10px; color: var(--text-secondary);">Déficit de Presión: 1.2 kPa</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 10px; color: var(--text-muted);">Presión Atmosférica</div>
                <div style="font-size: 13px; font-weight: 700; color: #fff;">1014.2 hPa</div>
                <div style="font-size: 9px; color: var(--text-secondary);">Estable / Buen tiempo</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 10px; color: var(--text-muted);">Radiación Solar Global</div>
                <div style="font-size: 13px; font-weight: 700; color: var(--accent-amber);">840 W/m²</div>
                <div style="font-size: 9px; color: var(--text-secondary);">UV Index: 7 (Alto)</div>
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
              <span>💧 Humedad por Estratos Radiculares (FAO-56)</span>
              <span style="font-size: 10px; color: var(--accent-emerald); font-family: monospace;">[Simulación Ground-Truth]</span>
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
      <div class="future-title" style="color: var(--accent-cyan); margin-bottom: 6px;">📡 Nodos IoT Activos en Predio Meniels</div>
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
        if (sensor.id.includes('WIND') || sensor.telemetry.windSpeedKmH !== undefined) {
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
    const dayLabel = document.getElementById('label_day');
    const hourLabel = document.getElementById('label_hour');

    if (dayLabel) dayLabel.textContent = `Día ${this.selectedDayOfYear}`;
    if (hourLabel) hourLabel.textContent = `${this.selectedHourOfDay}:00 hrs`;

    const starCanvas = document.getElementById('starMapCanvas');
    if (starCanvas) {
      this.drawStarMap(starCanvas, this.selectedDayOfYear, this.selectedHourOfDay);
    }

    bus.emit('map:update_sun', { day: this.selectedDayOfYear, hour: this.selectedHourOfDay });
  }

  renderSensorPanel(props) {
    this.selectedSensorId = props.sensorId || props.id.replace('sensor_', '');
    this.activeHouseTab = 'sensors';
    this.renderMainHouseDashboard();
  }

  renderParcelPanel(props) {
    this.drawerTitle.textContent = `Parcela ${props.parcelId}`;
    this.drawerSubtitle.textContent = `Cultivo: ${props.crop} | Predio Meniels (Parral)`;

    let waterRiskBadge = `<span class="status-badge optimal"><span class="status-dot"></span> Suficiente</span>`;
    let frostRiskBadge = `<span class="status-badge optimal"><span class="status-dot"></span> Bajo</span>`;
    let fireRiskBadge = `<span class="status-badge optimal"><span class="status-dot"></span> Bajo (FWI 12)</span>`;
    let recText = 'Humedad en rango óptimo. No requiere riego ni alerta de fuego inmediata.';

    if (props.parcelId === 'A101') {
      waterRiskBadge = `<span class="status-badge critical"><span class="status-dot"></span> Crítico (<25%)</span>`;
      fireRiskBadge = `<span class="status-badge critical"><span class="status-dot"></span> Extremo (FWI 54)</span>`;
      recText = '🔥 <strong>Alerta de Incendio & Estrés:</strong> Zona de Pino y rastrojo seco. Mantener cortafuegos despejados y activar goteo 45 m³/ha a las 21:00 hrs.';
    } else if (props.parcelId === 'B102') {
      waterRiskBadge = `<span class="status-badge warning"><span class="status-dot"></span> Moderado (31%)</span>`;
      fireRiskBadge = `<span class="status-badge warning"><span class="status-dot"></span> Moderado (FWI 28)</span>`;
      recText = '💡 <strong>Sugerencia:</strong> Monitorear humedad y rastrojo seco. Riego preventivo recomendado en 12h.';
    } else if (props.parcelId === 'C103') {
      frostRiskBadge = `<span class="status-badge critical"><span class="status-dot"></span> Alerta Helada (Estero)</span>`;
      recText = '❄️ <strong>Riesgo de Helada Invernal:</strong> Bolsón de aire frío en lecho de estero. Activar asperjadores anti-helada si T° baja de 1°C.';
    }

    this.drawerBody.innerHTML = `
      <div class="metrics-grid">
        <div class="glass-card metric-card"><div class="metric-label">Superficie</div><div class="metric-value">${props.areaHa}<span class="metric-unit">ha</span></div></div>
        <div class="glass-card metric-card"><div class="metric-label">Índice Vigor (NDVI)</div><div class="metric-value" style="color: var(--accent-emerald);">${props.ndvi}</div></div>
        <div class="glass-card metric-card"><div class="metric-label">Tipo de Suelo</div><div class="metric-value" style="font-size: 14px;">${props.soilType || 'Franco-Arcilloso'}</div></div>
        <div class="glass-card metric-card"><div class="metric-label">Sistema Riego</div><div class="metric-value" style="font-size: 14px;">${props.irrigationType || 'Goteo Solar'}</div></div>
      </div>

      <!-- Risk Diagnostics Panel -->
      <div class="glass-card">
        <div class="future-title" style="color: var(--accent-cyan);">📊 Diagnóstico de Riesgo 3D</div>
        <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
            <span>💧 Riesgo Hídrico:</span>
            ${waterRiskBadge}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
            <span>❄️ Riesgo de Helada:</span>
            ${frostRiskBadge}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
            <span>🔥 Riesgo Incendio (FWI):</span>
            ${fireRiskBadge}
          </div>
        </div>
      </div>

      <!-- Operational Recommendation -->
      <div class="glass-card" style="border-left: 3px solid var(--accent-amber);">
        <div class="future-title" style="color: var(--accent-amber);">🚜 Recomendación Agronómica</div>
        <div style="font-size: 11px; margin-top: 6px; color: var(--text-primary); line-height: 1.5;">
          ${recText}
        </div>
      </div>
    `;
  }

  renderCropPanel(props) {
    this.drawerTitle.textContent = props.name || 'Plantación';
    this.drawerSubtitle.textContent = `Especie: ${props.species} | Categoría: ${props.cropCategory || 'Agroecológico'}`;

    this.drawerBody.innerHTML = `
      <div class="metrics-grid">
        <div class="glass-card metric-card"><div class="metric-label">Rendimiento Est.</div><div class="metric-value">${props.estimatedYieldKg} kg</div></div>
        <div class="glass-card metric-card"><div class="metric-label">Año Plantación</div><div class="metric-value">${props.plantedYear}</div></div>
      </div>
    `;
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
    const icon = props.icon || '📍';
    const name = props.name || 'Polígono 3D';
    const itemName = props.itemName || props.name;
    const category = props.category || 'Catálogo de Ítems';
    const areaHa = props.areaHa || 0.0;
    const details = props.itemDetails || {};

    this.drawerTitle.textContent = `${icon} ${name}`;
    this.drawerSubtitle.textContent = `${itemName} | ${areaHa} ha | Catálogo de Ítems`;

    this.drawerBody.innerHTML = `
      <div class="metrics-grid">
        <div class="glass-card metric-card">
          <div class="metric-label">Superficie</div>
          <div class="metric-value">${areaHa}<span class="metric-unit">ha</span></div>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-label">Ítem Asignado</div>
          <div class="metric-value" style="font-size: 13px; color: var(--accent-cyan);">${itemName}</div>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-label">Agua / Riego</div>
          <div class="metric-value" style="font-size: 13px; color: #38bdf8;">${details.water || 'Adecuado'}</div>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-label">Riesgo Incendio</div>
          <div class="metric-value" style="font-size: 13px; color: var(--accent-amber);">${details.fireRisk || 'Bajo'}</div>
        </div>
      </div>

      <!-- Item Specification Card -->
      <div class="glass-card" style="margin-top: 10px;">
        <div class="future-title" style="color: var(--accent-emerald);">🌿 Especificación del Catálogo de Ítems</div>
        <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; margin-top: 6px;">
          ${details.desc || 'Elemento trazado interactivamente en el gemelo digital con modelo 3D asignado.'}
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px;">
          ${details.family ? `<span class="tag blue">Familia: ${details.family}</span>` : ''}
          ${details.frost ? `<span class="tag purple">Helada: ${details.frost}</span>` : ''}
          ${details.material ? `<span class="tag amber">Material: ${details.material}</span>` : ''}
          ${details.flow ? `<span class="tag blue">Caudal: ${details.flow}</span>` : ''}
        </div>
      </div>

      <!-- Action Buttons: Change item type or delete -->
      <div class="custom-poly-action-bar">
        <button id="btnChangeCustomPolyItem" class="btn-change-item">
          🔄 Cambiar Tipo de Ítem
        </button>
        <button id="btnDeleteCustomPoly" class="btn-delete-poly" title="Eliminar este polígono">
          🗑️ Eliminar
        </button>
      </div>
    `;

    const changeBtn = document.getElementById('btnChangeCustomPolyItem');
    if (changeBtn) {
      changeBtn.addEventListener('click', () => {
        bus.emit('drawing:reclassify_polygon', {
          polyId: props.id,
          currentName: props.name,
          currentItem: props.itemName || props.name,
          areaHa: props.areaHa
        });
      });
    }

    const deleteBtn = document.getElementById('btnDeleteCustomPoly');
    if (deleteBtn && this.drawingManager) {
      deleteBtn.addEventListener('click', () => {
        if (confirm(`¿Deseas eliminar el polígono "${props.name}"?`)) {
          this.drawingManager.deletePolygonById(props.id);
        }
      });
    }
  }
}
