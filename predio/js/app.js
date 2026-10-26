/**
 * AgriTwin - Main Application Entry Point
 * 
 * Orchestrates module initialization:
 *  1. Initializes Three.js 3D Engine via `MapManager`
 *  2. Instantiates `SpatialWidgets` (Compass, Sun Tracker, Scale Bar)
 *  3. Instantiates `DrawingManager` (Polygon Pincel tool & 3D cataloging)
 *  4. Instantiates `ProjectManager` (.agritwin & Shapefile importer)
 *  5. Renders `PossibilitiesCatalog` & App Info modal (Botón 'i')
 *  6. Renders 3D spatial features (Parcels, Sensors, Crops)
 *  7. Starts IoT Telemetry Simulation & Wildfire Risk Analytics
 */

import { MapManager } from './map/MapManager.js?v=3.9.6';
import { DataSource } from './data/DataSource.js?v=3.9.6';
import { ParcelManager } from './entities/ParcelManager.js?v=3.9.6';
import { SensorManager } from './entities/SensorManager.js?v=3.9.6';
import { CropManager } from './entities/CropManager.js?v=3.9.6';
import { LivestockManager } from './entities/LivestockManager.js?v=3.9.6';
import { PermacultureManager } from './entities/PermacultureManager.js?v=3.9.6';
import { TerritorialCatanManager } from './entities/TerritorialCatanManager.js?v=3.9.6';
import { SimulationEngine } from './sim/SimulationEngine.js?v=3.9.6';
import { UIController } from './ui/UIController.js?v=3.9.6';
import { SpatialWidgets } from './map/SpatialWidgets.js?v=3.9.6';
import { DrawingManager } from './map/DrawingManager.js?v=3.9.6';
import { ProjectManager } from './data/ProjectManager.js?v=3.9.6';
import { PossibilitiesCatalog } from './ui/PossibilitiesCatalog.js?v=3.9.6';
import { WildfireRiskModel } from './sim/WildfireRiskModel.js?v=3.9.6';
import { EngineInspectorModal } from './ui/EngineInspectorModal.js?v=3.9.6';
import { AgroWorkshopOverlay } from './ui/AgroWorkshopOverlay.js?v=3.9.6';
import { OperatorNotesManager } from './ui/OperatorNotesManager.js?v=3.2.0';
import { VisionManager } from './entities/VisionManager.js?v=1.0.0';
import { DroneMissionManager } from './entities/DroneMissionManager.js?v=1.0.0';
import { ObjectPlacementManager } from './map/ObjectPlacementManager.js?v=1.0.0';
import { SuiteBridge } from './utils/SuiteBridge.js';
import { bus } from './utils/EventBus.js';

class AgriTwinApp {
  constructor() {
    SuiteBridge.init();
    window.agriTwinApp = this;
    window.app = this;
    window.bus = bus;
    this.bus = bus;
    this.mapManager = new MapManager('cesiumContainer');
    window.mapManager = this.mapManager;
    this.dataSource = new DataSource();
  }

  async start() {
    console.log('🌱 Starting AgriTwin 3D Digital Twin (Powered by Nanobanana Engine)...');

    try {
      // 0. Instantiate AoE II Diegetic Workshop Overlay (abrir landing al inicio si no viene con mode=3d)
      this.workshopOverlay = new AgroWorkshopOverlay(this);
      window.workshopOverlay = this.workshopOverlay;
      this.workshopOverlay.init();
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('mode') !== '3d' && urlParams.get('noworkshop') !== '1') {
        this.workshopOverlay.open();
      }
      this.bindBrandHomeEvent();

      // 1. Initialize Three.js 3D Engine in background
      const mapInstance = await this.mapManager.init();

      // 2. Instantiate spatial widgets
      this.spatialWidgets = new SpatialWidgets(this.mapManager);
      this.spatialWidgets.init();
      this.mapManager.spatialWidgets = this.spatialWidgets;

      // 3. Instantiate drawing tool & project manager
      this.drawingManager = new DrawingManager(this.mapManager);
      this.projectManager = new ProjectManager(this);

      // 4. Instantiate entity managers
      this.parcelManager = new ParcelManager(mapInstance);
      this.sensorManager = new SensorManager(mapInstance);
      this.cropManager = new CropManager(mapInstance);
      this.livestockManager = new LivestockManager(this.mapManager);
      this.permacultureManager = new PermacultureManager(this.mapManager);
      this.territorialCatanManager = new TerritorialCatanManager(this.mapManager);
      this.visionManager = new VisionManager(this.mapManager);
      this.droneMissionManager = new DroneMissionManager(this.mapManager);
      this.objectPlacementManager = new ObjectPlacementManager(this.mapManager, this.drawingManager, this.parcelManager);
      window.livestockManager = this.livestockManager;
      window.visionManager = this.visionManager;
      window.droneMissionManager = this.droneMissionManager;
      window.objectPlacementManager = this.objectPlacementManager;
      window.drawingManager = this.drawingManager;
      window.agroWorkshopOverlay = this.workshopOverlay;

      // 5. Instantiate simulation engine & UI controller
      this.simulationEngine = new SimulationEngine(this.dataSource);
      this.uiController = new UIController(this.dataSource, this.simulationEngine);
      window.uiController = this.uiController;
      this.uiController.drawingManager = this.drawingManager;
      this.uiController.projectManager = this.projectManager;
      this.uiController.livestockManager = this.livestockManager;
      this.uiController.permacultureManager = this.permacultureManager;
      this.uiController.territorialCatanManager = this.territorialCatanManager;
      this.uiController.mapManager = this.mapManager;
      this.uiController.init();

      // 5b. Instantiate 3D Engine Technical Inspector Modal (Shift+D o 'I')
      this.engineInspectorModal = new EngineInspectorModal(this.mapManager);
      this.engineInspectorModal.init();

      // 5c. Instantiate Operator Field Log & Notes (100% Desacoplado del Hub)
      this.operatorNotesManager = new OperatorNotesManager(this);
      this.operatorNotesManager.init();
      window.operatorNotesManager = this.operatorNotesManager;

      // 6. Inject modals HTML
      this.injectModalsHTML();

      // 7. Load spatial datasets
      const { parcels, entities } = await this.dataSource.loadAll();
      this.parcels = parcels;

      // 8. Render 3D spatial features
      await this.parcelManager.renderParcels(parcels);
      this.sensorManager.renderSensors(entities.sensors || []);
      this.cropManager.renderTrees(entities.trees || []);
      this.visionManager.initCameras();

      // 9. Initial camera preset over farm site
      this.mapManager.flyToPreset('overview');

      // 10. Start IoT telemetry simulation loop
      this.simulationEngine.start();

      // 11. Wire UI event listeners for new features
      this.bindNewFeatureEvents();

      // 12. Check URL parameters for direct mode launch
      if (urlParams.get('mode') === 'territorial' || urlParams.get('vecinos') === '1') {
        if (this.workshopOverlay) this.workshopOverlay.close();
        setTimeout(() => {
          this.uiController?.openVecinosCatanModal();
        }, 300);
      } else if (urlParams.get('noworkshop') === '1' || urlParams.get('mode') === '3d') {
        if (this.workshopOverlay) this.workshopOverlay.close();
      }

      const selAnimal = urlParams.get('selectAnimal');
      if (selAnimal) {
        if (this.workshopOverlay) this.workshopOverlay.close();
        const triggerSelect = () => {
          if (typeof window.selectAnimal === 'function') {
            window.selectAnimal(selAnimal);
          } else if (this.uiController) {
            this.uiController.selectedAnimalId = selAnimal;
            this.uiController.activeHouseTab = 'livestock';
            this.uiController.openDrawer();
            this.uiController.renderMainHouseDashboard();
          }
        };
        setTimeout(triggerSelect, 300);
        setTimeout(triggerSelect, 1200);
      } else if (urlParams.get('openHouse') === '1') {
        if (this.workshopOverlay) this.workshopOverlay.close();
        setTimeout(() => {
          window.inspectPredioHouse?.();
        }, 500);
      }

      console.log('✅ AgriTwin Digital Twin running successfully.');
    } catch (error) {
      console.error('❌ Error bootstrapping AgriTwin application:', error);
    }
  }

  injectModalsHTML() {
    const container = document.getElementById('modalsContainer');
    if (container) {
      container.innerHTML = PossibilitiesCatalog.renderModalHTML() + 
                            ProjectManager.renderWelcomeModalHTML() + 
                            ProjectManager.renderShapefileModalHTML();
    }
  }

  bindBrandHomeEvent() {
    const brandHomeBtn = document.getElementById('brandHomeBtn') || document.querySelector('.header-brand');
    if (brandHomeBtn && this.workshopOverlay) {
      brandHomeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.workshopOverlay.open();
      });
    }
    const brandIcon = document.querySelector('.brand-icon');
    if (brandIcon && this.workshopOverlay) {
      brandIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.workshopOverlay.open();
      });
    }
  }

  bindNewFeatureEvents() {
    this.bindBrandHomeEvent();

    // 1. Botón (i) Info & Catálogo
    const btnInfo = document.getElementById('btnInfoModal');
    const infoModal = document.getElementById('infoModalOverlay');
    const closeInfoBtn = document.getElementById('closeInfoModalBtn');
    const closeInfoFooter = document.getElementById('closeInfoModalFooterBtn');

    if (btnInfo && infoModal) {
      btnInfo.addEventListener('click', () => {
        infoModal.style.display = 'flex';
      });
    }

    const closeInfoModal = () => {
      if (infoModal) infoModal.style.display = 'none';
    };

    if (closeInfoBtn) closeInfoBtn.addEventListener('click', closeInfoModal);
    if (closeInfoFooter) closeInfoFooter.addEventListener('click', closeInfoModal);

    // Modal Tabs switcher inside Info modal
    const tabBtns = document.querySelectorAll('.modal-tabs .tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetTab = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(tc => {
          tc.style.display = tc.id === targetTab ? 'block' : 'none';
        });
      });
    });

    // Catalog search input filter
    const searchInput = document.getElementById('catalogSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        document.querySelectorAll('.catalog-item-card').forEach(card => {
          const name = card.getAttribute('data-name') || '';
          card.style.display = name.includes(query) ? 'block' : 'none';
        });
      });
    }

    // 2. Marcas Rewild & AgroTech Chile Redirect Popups
    const btnRewild = document.getElementById('brandRewildBtn');
    const btnUrrutia = document.getElementById('brandUrrutiaBtn');
    const brandModal = document.getElementById('brandRedirectModal');
    const brandTitle = document.getElementById('brandModalTitle');
    const brandMsg = document.getElementById('brandModalMsg');
    const closeBrandBtn = document.getElementById('closeBrandModalBtn');

    if (btnRewild && brandModal) {
      btnRewild.addEventListener('click', () => {
        brandTitle.textContent = '🌿 Portal Oficial Rewild Chile';
        brandMsg.innerHTML = 'Estás accediendo a la iniciativa de conservación y restauración de ecosistemas de <strong>Rewild</strong>. El portal web se encuentra en fase de actualización.';
        brandModal.style.display = 'flex';
      });
    }

    if (btnUrrutia && brandModal) {
      btnUrrutia.addEventListener('click', () => {
        brandTitle.textContent = '⚡ AgroTech Chile';
        brandMsg.innerHTML = 'Estás accediendo al centro de innovación agrotecnológica de <strong>AgroTech Chile</strong>. Próximamente disponible en línea.';
        brandModal.style.display = 'flex';
      });
    }

    if (closeBrandBtn && brandModal) {
      closeBrandBtn.addEventListener('click', () => brandModal.style.display = 'none');
    }

    const btnDrawPoly = document.getElementById('btn_draw_polygon');
    const btnMoveObjects = document.getElementById('btn_move_objects');
    const btnErasePoly = document.getElementById('btn_erase_polygon');
    const btnClearCanvas = document.getElementById('btn_clear_canvas');
    const labelDraw = document.getElementById('trigger_draw_label');

    if (btnMoveObjects) {
      btnMoveObjects.addEventListener('click', () => {
        const isActive = this.drawingManager.isMoveMode;
        this.drawingManager.toggleMoveMode(!isActive);
        if (labelDraw) labelDraw.textContent = !isActive ? 'Mano/Mover' : 'Pincel';
        if (this.uiController.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    if (btnDrawPoly) {
      btnDrawPoly.addEventListener('click', () => {
        this.drawingManager.toggleDrawingMode(true);
        if (labelDraw) labelDraw.textContent = 'Dibujando';
        bus.emit('ui:show_toast', '🎨 Haz clic en el mapa 3D para definir los vértices del polígono.');
        if (this.uiController.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    if (btnErasePoly) {
      btnErasePoly.addEventListener('click', () => {
        this.drawingManager.toggleEraseMode(true);
        if (labelDraw) labelDraw.textContent = 'Borrando';
        bus.emit('ui:show_toast', '🗑️ Haz clic sobre un polígono personalizado para eliminarlo.');
        if (this.uiController.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    if (btnClearCanvas) {
      btnClearCanvas.addEventListener('click', () => {
        this.drawingManager.cancelDrawing();
        if (labelDraw) labelDraw.textContent = 'Pincel';
        bus.emit('ui:show_toast', '🧹 Lienzo de dibujo limpiado.');
        if (this.uiController.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    // Setup Catálogo de Ítems picker modal for 3D polygons
    this.setupItemCatalogPickerModal();

    // 4. Proyecto & Shapefiles
    const btnSaveProject = document.getElementById('btn_save_project');
    const btnOpenProjectDropdown = document.getElementById('btn_open_project_dropdown');
    const btnImportShpDropdown = document.getElementById('btn_import_shp_dropdown');
    const welcomeModal = document.getElementById('welcomeProjectModal');

    if (btnSaveProject) {
      btnSaveProject.addEventListener('click', () => {
        this.projectManager.exportProject();
        if (this.uiController.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    if (btnOpenProjectDropdown && welcomeModal) {
      btnOpenProjectDropdown.addEventListener('click', () => {
        welcomeModal.style.display = 'flex';
        if (this.uiController.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    // Initialize Shapefile / GeoJSON importer dialog and dropzone
    if (this.projectManager?.setupImporterUI) {
      this.projectManager.setupImporterUI();
    }

    if (btnImportShpDropdown) {
      btnImportShpDropdown.addEventListener('click', () => {
        if (this.projectManager.openImporterModal) {
          this.projectManager.openImporterModal();
        }
        if (this.uiController.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    // Welcome project options buttons
    const btnDefault = document.getElementById('btnProjectDefault');
    const btnNew = document.getElementById('btnProjectNew');
    const btnOpen = document.getElementById('btnProjectOpen');
    const agritwinInput = document.getElementById('agritwinFileInput');

    if (btnDefault && welcomeModal) {
      btnDefault.addEventListener('click', () => {
        welcomeModal.style.display = 'none';
        bus.emit('ui:show_toast', '🌾 Proyecto Fundo Colliguay cargado.');
      });
    }

    if (btnNew && welcomeModal) {
      btnNew.addEventListener('click', () => {
        welcomeModal.style.display = 'none';
        this.drawingManager.toggleDrawingMode(true);
        bus.emit('ui:show_toast', '✨ Nuevo proyecto iniciado. Utiliza el Pincel 3D para trazar tus primeras parcelas.');
      });
    }

    if (btnOpen && agritwinInput) {
      btnOpen.addEventListener('click', () => agritwinInput.click());
      agritwinInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.projectManager.loadProjectFile(e.target.files[0]);
        }
      });
    }

    // 5. Capa de Riesgo de Incendios (FWI) Button
    const btnRiskFire = document.getElementById('btn_risk_fire');
    if (btnRiskFire) {
      btnRiskFire.addEventListener('click', () => {
        const telemetry = this.simulationEngine.getTelemetry();
        if (this.parcels && this.parcels.length > 0) {
          const sampleParcel = this.parcels[0];
          const fireMetrics = WildfireRiskModel.evaluateParcelRisk(sampleParcel, telemetry);
          bus.emit('ui:show_toast', `🔥 Capa de Riesgo Incendios (FWI): Índice ${fireMetrics.score}/100 [Riesgo ${fireMetrics.tier}]`);
        }
      });
    }

    // 5B. Editor de Objetos 3D (Age of Empires III)
    const btnTriggerObjects = document.getElementById('trigger_objects_btn');
    const btnOpenObjDock = document.getElementById('btn_open_objects_dock');
    if (btnTriggerObjects) {
      btnTriggerObjects.addEventListener('click', () => {
        this.objectPlacementManager.toggleDock();
      });
    }
    if (btnOpenObjDock) {
      btnOpenObjDock.addEventListener('click', () => {
        this.objectPlacementManager.openDock();
        if (this.uiController?.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    // 6. Visión & Drones Autónomos Toolbar Event Listeners
    const btnToggleCameras = document.getElementById('btn_toggle_vision_cameras');
    const btnCamNorte = document.getElementById('btn_cam_01_norte');
    const btnCamDga = document.getElementById('btn_cam_02_dga');
    const btnCamFauna = document.getElementById('btn_cam_03_fauna');
    const btnCamPrv = document.getElementById('btn_cam_04_prv');
    const btnDroneMission = document.getElementById('btn_drone_start_mission');
    const btnDroneOrtho = document.getElementById('btn_drone_update_ortho');
    const btnVisionAlert = document.getElementById('btn_vision_sim_alert');

    if (btnToggleCameras) {
      btnToggleCameras.addEventListener('click', () => {
        this.visionManager.toggleVisionCameras();
      });
    }

    if (btnCamNorte) {
      btnCamNorte.addEventListener('click', () => {
        const cam = this.visionManager.cameras.find(c => c.id === 'CAM-01-NORTE');
        if (cam) this.visionManager.openPip(cam);
        if (this.uiController?.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    if (btnCamDga) {
      btnCamDga.addEventListener('click', () => {
        const cam = this.visionManager.cameras.find(c => c.id === 'CAM-02-DGA');
        if (cam) this.visionManager.openPip(cam);
        if (this.uiController?.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    if (btnCamFauna) {
      btnCamFauna.addEventListener('click', () => {
        const cam = this.visionManager.cameras.find(c => c.id === 'CAM-03-FAUNA');
        if (cam) this.visionManager.openPip(cam);
        if (this.uiController?.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    if (btnCamPrv) {
      btnCamPrv.addEventListener('click', () => {
        const cam = this.visionManager.cameras.find(c => c.id === 'CAM-04-PRV');
        if (cam) this.visionManager.openPip(cam);
        if (this.uiController?.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    if (btnDroneMission) {
      btnDroneMission.addEventListener('click', () => {
        this.droneMissionManager.startMission();
        if (this.uiController?.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    if (btnDroneOrtho) {
      btnDroneOrtho.addEventListener('click', () => {
        this.droneMissionManager.applyDroneOrthomosaic();
        if (this.uiController?.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    if (btnVisionAlert) {
      btnVisionAlert.addEventListener('click', () => {
        this.visionManager.triggerEdgeAiAlert('CAM-01-NORTE');
        if (this.uiController?.closeAllDropdowns) this.uiController.closeAllDropdowns();
      });
    }

    // Toast notification bus listener
    bus.on('ui:show_toast', (msg) => {
      this.uiController.showAlert(msg);
    });
  }

  /**
   * Catálogo de Ítems selector modal setup.
   * Handles immediate item assignment upon closing a drawn polygon,
   * as well as reclassifying existing polygons later.
   */
  setupItemCatalogPickerModal() {
    const pickerGrid = document.getElementById('catalogPickerGrid');
    const searchInput = document.getElementById('polyItemSearchInput');
    const pillsContainer = document.getElementById('itemCategoryPills');
    const polyModal = document.getElementById('catalogPolyModal');
    const areaVal = document.getElementById('polyAreaHaVal');
    const nameInput = document.getElementById('polyNameInput');
    const selectedIcon = document.getElementById('selectedItemIcon');
    const selectedName = document.getElementById('selectedItemName');
    const selectedFamily = document.getElementById('selectedItemFamily');
    const selectedCategory = document.getElementById('selectedItemCategory');
    const saveBtn = document.getElementById('savePolyBtn');
    const cancelBtn = document.getElementById('cancelPolyBtn');
    const closeBtn = document.getElementById('closeCatalogPolyBtn');

    if (!pickerGrid || !polyModal) return;

    const allItems = PossibilitiesCatalog.getAllItems();
    let currentSelectedItem = allItems[0];
    let pendingPolyData = null;
    let isReclassifying = false;

    // Render picker cards
    const renderCards = (itemsToRender) => {
      pickerGrid.innerHTML = itemsToRender.map(item => `
        <div class="catalog-picker-card ${item.name === currentSelectedItem.name ? 'selected' : ''}" data-name="${item.name}">
          <div class="picker-card-header">
            <span class="picker-card-icon">${item.icon}</span>
            <div>
              <div class="picker-card-title">${item.name}</div>
              <span class="picker-card-badge">${item.family || item.categoryTitle || ''}</span>
            </div>
          </div>
          <p class="picker-card-desc">${item.desc || ''}</p>
          <div class="picker-card-tags">
            ${item.water ? `<span class="tag blue">💧 ${item.water}</span>` : ''}
            ${item.fireRisk ? `<span class="tag rose">🔥 ${item.fireRisk}</span>` : ''}
            ${item.material ? `<span class="tag amber">🏗️ ${item.material}</span>` : ''}
          </div>
        </div>
      `).join('');

      // Bind card selection
      pickerGrid.querySelectorAll('.catalog-picker-card').forEach(card => {
        card.addEventListener('click', () => {
          const itemName = card.getAttribute('data-name');
          const found = allItems.find(it => it.name === itemName);
          if (found) {
            currentSelectedItem = found;
            pickerGrid.querySelectorAll('.catalog-picker-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            updateSelectedBanner();
          }
        });
      });
    };

    const updateSelectedBanner = () => {
      if (selectedIcon) selectedIcon.textContent = currentSelectedItem.icon;
      if (selectedName) selectedName.textContent = currentSelectedItem.name;
      if (selectedFamily) selectedFamily.textContent = currentSelectedItem.family || currentSelectedItem.categoryTitle || 'Agrícola';
      if (selectedCategory) selectedCategory.textContent = currentSelectedItem.categoryTitle || 'Catálogo de Ítems';
      if (nameInput && (!nameInput.value || nameInput.getAttribute('data-auto') === 'true')) {
        nameInput.value = currentSelectedItem.name.split(' (')[0];
        nameInput.setAttribute('data-auto', 'true');
      }
    };

    if (nameInput) {
      nameInput.addEventListener('input', () => {
        nameInput.setAttribute('data-auto', 'false');
      });
    }

    // Category pills filter
    let activeCat = 'all';
    if (pillsContainer) {
      pillsContainer.querySelectorAll('.cat-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          pillsContainer.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          activeCat = pill.getAttribute('data-cat');
          filterItems();
        });
      });
    }

    // Search filter
    const filterItems = () => {
      const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
      const filtered = allItems.filter(item => {
        const matchCat = (activeCat === 'all') || (item.categoryId === activeCat);
        const matchQuery = !q || item.name.toLowerCase().includes(q) ||
          (item.family && item.family.toLowerCase().includes(q)) ||
          (item.desc && item.desc.toLowerCase().includes(q));
        return matchCat && matchQuery;
      });
      renderCards(filtered);
    };

    if (searchInput) {
      searchInput.addEventListener('input', filterItems);
    }

    // Initial render
    renderCards(allItems);
    updateSelectedBanner();

    const closeModal = () => {
      polyModal.style.display = 'none';
      pendingPolyData = null;
      isReclassifying = false;
      const labelDraw = document.getElementById('trigger_draw_label');
      if (labelDraw) labelDraw.textContent = 'Pincel';
    };

    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // 1. Immediately after closing a newly drawn polygon
    bus.on('drawing:polygon_completed', (data) => {
      pendingPolyData = data;
      isReclassifying = false;
      const labelDraw = document.getElementById('trigger_draw_label');
      if (labelDraw) labelDraw.textContent = 'Pincel';
      if (areaVal) areaVal.textContent = `${data.areaHa} ha`;
      if (nameInput) {
        nameInput.value = currentSelectedItem.name.split(' (')[0];
        nameInput.setAttribute('data-auto', 'true');
      }
      polyModal.style.display = 'flex';
    });

    // 2. Reclassifying an existing polygon later
    bus.on('drawing:reclassify_polygon', (data) => {
      pendingPolyData = data;
      isReclassifying = true;
      if (areaVal) areaVal.textContent = `${data.areaHa} ha`;

      const existing = PossibilitiesCatalog.findItemByName(data.currentName || data.currentItem);
      if (existing) {
        currentSelectedItem = existing;
        updateSelectedBanner();
        renderCards(allItems);
      }
      if (nameInput) {
        nameInput.value = data.currentName || currentSelectedItem.name;
        nameInput.setAttribute('data-auto', 'false');
      }
      polyModal.style.display = 'flex';
    });

    // Save button click
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const customName = nameInput ? nameInput.value.trim() || currentSelectedItem.name : currentSelectedItem.name;
        const itemMeta = {
          ...currentSelectedItem,
          customName: customName
        };

        if (isReclassifying && pendingPolyData && pendingPolyData.polyId) {
          this.drawingManager.updatePolygonItem(pendingPolyData.polyId, itemMeta);
        } else if (pendingPolyData && pendingPolyData.onSave) {
          pendingPolyData.onSave(itemMeta);
        }

        closeModal();
      });
    }
  }
}

// Bootstrap application on DOM ready or immediately if already loaded
function bootstrap() {
  if (window.agriTwinApp) return;
  const app = new AgriTwinApp();
  window.app = app;
  window.agriTwinApp = app;
  window.twinApp = app;
  app.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
