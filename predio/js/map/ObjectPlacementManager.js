/**
 * AgriTwin - ObjectPlacementManager Module
 * 
 * Editor de Objetos 3D & Figuras GLB Diegético (Inspirado en Age of Empires III)
 * 
 * Características:
 *  - Catálogo de 6 categorías: Estructuras, Vehículos, Sensores, Árboles, Animales, Cultivos.
 *  - Carga de figuras GLB reales (assets/models/) y procedurales Three.js de alta fidelidad.
 *  - Previsualización holográfica fantasma (Ghost Mesh con aureola de bronce AoE3).
 *  - Atajos de teclado: [R] Rotar en 15°, [+/-] Escalar, [ESC] Cancelar colocación.
 *  - Simbiosis espacial punto-en-polígono: vincula automáticamente el objeto al polígono/suelo contenedor (1 Polígono = 1 Uso de Suelo).
 *  - Auditoría Permacultural instantánea (Zonas 0 a 5 de Bill Mollison) según distancia al centro neurálgico predial.
 *  - Persistencia completa en localStorage (agritwin_placed_objects) y compatibilidad con herramienta de la Mano (✋ Mover).
 */

import { bus } from '../utils/EventBus.js';

import { OBJECT_CATALOG } from '../data/ObjectPlacementCatalog.js';
import { ProceduralObjectFactory } from '../entities/factories/ProceduralObjectFactory.js';

export { OBJECT_CATALOG };

export class ObjectPlacementManager {
  constructor(mapManager, drawingManager, parcelManager) {
    this.mapManager = mapManager;
    this.drawingManager = drawingManager;
    this.parcelManager = parcelManager;
    this.scene = mapManager.scene;

    // Grupo Three.js contenedor de objetos colocados
    this.placedObjectsGroup = new THREE.Group();
    this.placedObjectsGroup.name = 'placedObjectsGroup';
    this.scene.add(this.placedObjectsGroup);

    // Grupo de previsualización para trazado continuo de lotes (caminos, cercos, árboles)
    this.batchPreviewGroup = new THREE.Group();
    this.batchPreviewGroup.name = 'aoe3_batch_preview';
    this.scene.add(this.batchPreviewGroup);
    this.batchPlacedItems = [];

    // Estado de colocación
    this.activePlacementItem = null;
    this.ghostMesh = null;
    this.ghostRotationY = 0;
    this.ghostScale = 1.0;
    this.isPlacing = false;

    // Loader GLTF compartido
    this.gltfLoader = (typeof THREE.GLTFLoader !== 'undefined') ? new THREE.GLTFLoader() : null;
    this.modelCache = new Map();

    // Colección de objetos colocados
    this.placedObjects = [];

    // Origen de referencia Zona 0 (Casa Central / Galpón: x = -8, z = 8)
    this.originX = -8;
    this.originZ = 8;

    this.initDOM();
    this.setupListeners();
    this.loadFromLocalStorage();
  }

  /**
   * Inicializa el Dock inferior estilo Age of Empires III y el Modal de Inserción
   */
  initDOM() {
    this.injectStyles();
    this.createCommandDockDOM();
    this.createInsertionModalDOM();
    this.createPlacementHudDOM();
  }

  injectStyles() {
    // Los estilos del Dock AoE III se gestionan de forma modular via css/placement-dock.css
    if (!document.getElementById('aoe3-object-editor-styles') && !document.querySelector('link[href*="placement-dock.css"]')) {
      const link = document.createElement('link');
      link.id = 'aoe3-object-editor-styles';
      link.rel = 'stylesheet';
      link.href = 'css/placement-dock.css';
      document.head.appendChild(link);
    }
  }

  createCommandDockDOM() {
    if (document.getElementById('aoe3-command-dock')) return;

    const dock = document.createElement('div');
    dock.id = 'aoe3-command-dock';
    dock.innerHTML = `
      <div class="aoe3-dock-header">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:16px;">🏛️</span>
          <strong style="color:#fef3c7;font-size:11.5px;letter-spacing:0.5px;">CATÁLOGO DE CONSTRUCCIÓN & OBJETOS PREDIO</strong>
          <span style="font-size:9px;color:#fbbf24;font-family:monospace;background:rgba(0,0,0,0.4);padding:2px 6px;border-radius:3px;">AOE III MAP EDITOR</span>
        </div>
        <button id="btn-close-aoe3-dock" style="background:none;border:none;color:#d4af37;cursor:pointer;font-size:14px;font-weight:bold;">✕</button>
      </div>

      <div class="aoe3-dock-tabs">
        <button class="aoe3-tab-btn active" data-cat="structures"><span>🏚️</span> Estructuras</button>
        <button class="aoe3-tab-btn" data-cat="water"><span>💧</span> Agua & Albercas</button>
        <button class="aoe3-tab-btn" data-cat="paths"><span>🛤️</span> Caminos</button>
        <button class="aoe3-tab-btn" data-cat="fences"><span>🚪</span> Portones & Rejas</button>
        <button class="aoe3-tab-btn" data-cat="vehicles"><span>🚜</span> Vehículos</button>
        <button class="aoe3-tab-btn" data-cat="sensors"><span>📡</span> Sensores IoT</button>
        <button class="aoe3-tab-btn" data-cat="trees"><span>🌳</span> Árboles</button>
        <button class="aoe3-tab-btn" data-cat="animals"><span>🐄</span> Animales</button>
        <button class="aoe3-tab-btn" data-cat="crops"><span>🌾</span> Cultivos</button>
      </div>

      <div class="aoe3-grid-container" id="aoe3-dock-items-grid">
        <!-- Renderizado dinámicamente según la categoría activa -->
      </div>

      <div class="aoe3-dock-footer" style="padding: 6px 12px; background: rgba(18, 12, 7, 0.95); border-top: 1px solid #4a3418; display: flex; justify-content: space-between; align-items: center; font-size: 10px;">
        <div id="aoe3-dock-status-summary" style="color: #dfc8a5; display: flex; align-items: center; gap: 8px;">
          <span>🏛️ <strong>0</strong> Asentados</span> • <span style="color:#fbbf24;">CAPEX: <strong>$0</strong></span>
        </div>
        <button id="btn-open-whatif-drawer" style="background: linear-gradient(180deg, #6c4b28 0%, #3e2815 100%); border: 1px solid #fde047; color: #fff; padding: 4px 10px; border-radius: 4px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">
          <span>📜</span> Análisis What-If Permacultura
        </button>
      </div>
    `;
    document.body.appendChild(dock);

    // Cableado de pestañas
    dock.querySelectorAll('.aoe3-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        dock.querySelectorAll('.aoe3-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderDockGrid(btn.dataset.cat);
      });
    });

    document.getElementById('btn-close-aoe3-dock').onclick = () => this.closeDock();
    const btnWhatIf = document.getElementById('btn-open-whatif-drawer');
    if (btnWhatIf) {
      btnWhatIf.onclick = () => {
        if (window.selectPredioHouseTab) window.selectPredioHouseTab('permaculture');
        if (window.uiController) window.uiController.openDrawer();
      };
    }
    this.renderDockGrid('structures');
    this.updateDockStatusSummary();
  }

  createInsertionModalDOM() {
    if (document.getElementById('aoe3-placement-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'aoe3-placement-modal';
    modal.innerHTML = `
      <div class="aoe3-modal-box">
        <div class="aoe3-modal-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <span id="aoe3-m-icon" style="font-size:20px;">🏛️</span>
            <div>
              <strong id="aoe3-m-title" style="color:#fef3c7;font-size:12px;">ASENTAR ESTRUCTURA EN EL PREDIO</strong>
              <div id="aoe3-m-coords" style="font-size:9px;color:#fbbf24;font-family:monospace;">Coordenadas: (0.0, 0.0)</div>
            </div>
          </div>
          <button id="btn-aoe3-m-close" style="background:none;border:none;color:#d4af37;cursor:pointer;font-size:16px;">✕</button>
        </div>

        <div class="aoe3-modal-body">
          <div class="aoe3-field-group">
            <label>Nombre / Identificador de la Unidad:</label>
            <input type="text" id="aoe3-input-name" class="aoe3-input" placeholder="Ej: Galpón Secano Cuartel 2">
          </div>

          <div class="aoe3-field-group">
            <label>Rol Agronómico & Función Operativa:</label>
            <input type="text" id="aoe3-input-role" class="aoe3-input" placeholder="Ej: Acopio de heno y taller mecánico">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div class="aoe3-field-group">
              <label>Uso de Suelo / Polígono Contenedor:</label>
              <select id="aoe3-select-polygon" class="aoe3-select">
                <!-- Poblado automáticamente según detección espacial -->
              </select>
            </div>
            <div class="aoe3-field-group">
              <label>Vínculo Funcional / Infraestructura:</label>
              <select id="aoe3-select-link" class="aoe3-select">
                <option value="none">Sin conexión directa</option>
                <option value="water_pond">💧 Tranque Yeomans (Riego Gravedad)</option>
                <option value="canal_dga">🌊 Canal Matriz DGA (Marco Partidor)</option>
                <option value="solar_grid">☀️ Parque Agrovoltaico (Energía)</option>
                <option value="lora_network">📡 Red de Telemetría LoRaWAN</option>
                <option value="electric_fence">⚡ Cerco Eléctrico PRV (7.8 kV)</option>
              </select>
            </div>
          </div>

          <!-- Diagnóstico Permacultural Inmediato -->
          <div class="aoe3-perma-box">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:700;color:#fde047;font-size:10px;">🌱 EVALUACIÓN PERMACULTURAL (WHAT-IF):</span>
              <span id="aoe3-perma-zone-badge" style="font-weight:800;color:#38bdf8;font-size:9.5px;font-family:monospace;">ZONA ?</span>
            </div>
            <p id="aoe3-perma-text" style="margin:0;font-size:9.5px;line-height:1.35;color:#e2e8f0;">
              Calculando esfuerzo energético y coherencia espacial según Mollison...
            </p>
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:4px;margin-top:4px;font-size:9px;font-family:monospace;">
              <div>Costo Ref: <strong id="aoe3-perma-cost" style="color:#fbbf24;">$0</strong></div>
              <div>Faena: <strong id="aoe3-perma-hours" style="color:#a7f3d0;">0 hrs</strong></div>
              <div>Distancia Casa: <strong id="aoe3-perma-dist" style="color:#93c5fd;">0 m</strong></div>
            </div>
          </div>
        </div>

        <div class="aoe3-modal-footer">
          <button id="btn-aoe3-cancel" class="btn-aoe3-action btn-aoe3-cancel">Cancelar</button>
          <button id="btn-aoe3-confirm" class="btn-aoe3-action btn-aoe3-primary">
            <span>⚔️</span> Asentar en el Terreno
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('btn-aoe3-m-close').onclick = () => this.closeModal();
    document.getElementById('btn-aoe3-cancel').onclick = () => this.closeModal();
    document.getElementById('btn-aoe3-confirm').onclick = () => this.confirmPlacement();
  }

  createPlacementHudDOM() {
    if (document.getElementById('aoe3-placement-hud')) return;

    const hud = document.createElement('div');
    hud.id = 'aoe3-placement-hud';
    hud.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <span id="aoe3-hud-icon" style="font-size:18px;">🏛️</span>
        <span id="aoe3-hud-title" style="font-weight:700;color:#fef3c7;font-size:11.5px;">Colocando Objeto</span>
        <span id="aoe3-hud-count-badge" style="background:#451a03;border:1px solid #d97706;padding:2px 8px;border-radius:10px;font-size:10px;color:#fde047;font-family:monospace;font-weight:700;">0 trazados</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <button id="btn-aoe3-hud-rotate" class="btn-aoe3-action" style="padding:4px 9px;font-size:10px;background:#2a1b10;border:1px solid #b8860b;color:#fef3c7;" title="Rotar 15° (o presiona R)">
          🔄 [R] Girar <span id="aoe3-hud-rot-val">0°</span>
        </button>
        <button id="btn-aoe3-hud-consolidate" class="btn-aoe3-action btn-aoe3-primary" style="padding:4px 12px;font-size:10.5px;font-weight:800;opacity:0.5;pointer-events:none;" title="Confirmar posiciones y abrir análisis What-If (o presiona Enter)">
          ⚔️ Consolidar <span id="aoe3-hud-btn-count">(0)</span> [Enter]
        </button>
        <button id="btn-aoe3-hud-cancel" class="btn-aoe3-action btn-aoe3-cancel" style="padding:4px 10px;font-size:10px;" title="Cancelar colocación [ESC]">
          ✕ Salir [ESC]
        </button>
      </div>
    `;
    document.body.appendChild(hud);

    document.getElementById('btn-aoe3-hud-rotate').onclick = (e) => {
      e.stopPropagation();
      this.ghostRotationY = (this.ghostRotationY + 45) % 360;
      if (this.ghostMesh) {
        this.ghostMesh.rotation.y = THREE.MathUtils.degToRad(this.ghostRotationY);
      }
      this.updatePlacementHud();
    };

    document.getElementById('btn-aoe3-hud-consolidate').onclick = (e) => {
      e.stopPropagation();
      this.consolidateBatch();
    };

    document.getElementById('btn-aoe3-hud-cancel').onclick = (e) => {
      e.stopPropagation();
      this.cancelPlacement();
    };
  }

  renderDockGrid(category) {
    const grid = document.getElementById('aoe3-dock-items-grid');
    if (!grid) return;

    const items = OBJECT_CATALOG.filter(it => it.category === category);
    grid.innerHTML = items.map(it => `
      <div class="aoe3-card-btn" data-item-id="${it.id}" title="${it.description}">
        <div class="aoe3-card-icon">${it.icon}</div>
        <div class="aoe3-card-title">${it.shortName}</div>
        <div class="aoe3-card-cost">$${(it.baseCostClp >= 1000000 ? (it.baseCostClp / 1000000).toFixed(1) + 'M' : (it.baseCostClp / 1000).toFixed(0) + 'k')}</div>
      </div>
    `).join('');

    grid.querySelectorAll('.aoe3-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = OBJECT_CATALOG.find(it => it.id === btn.dataset.itemId);
        if (item) {
          this.startPlacement(item);
        }
      });
    });
  }

  toggleDock() {
    const dock = document.getElementById('aoe3-command-dock');
    if (dock) {
      dock.classList.toggle('dock-open');
      if (dock.classList.contains('dock-open')) this.updateDockStatusSummary();
    }
  }

  openDock() {
    const dock = document.getElementById('aoe3-command-dock');
    if (dock) {
      dock.classList.add('dock-open');
      this.updateDockStatusSummary();
    }
  }

  closeDock() {
    const dock = document.getElementById('aoe3-command-dock');
    if (dock) dock.classList.remove('dock-open');
  }

  updateDockStatusSummary() {
    const el = document.getElementById('aoe3-dock-status-summary');
    if (!el) return;
    const count = this.placedObjects.length;
    let totalClp = 0;
    this.placedObjects.forEach(o => totalClp += (Number(o.costClp) || 0));
    el.innerHTML = `<span>🏛️ <strong>${count}</strong> Asentados</span> • <span style="color:#fbbf24;">CAPEX: <strong>$${totalClp.toLocaleString('es-CL')}</strong></span>`;
  }

  setupListeners() {
    // Teclado interactivo para rotación, consolidación y cancelación
    window.addEventListener('keydown', (e) => {
      if (!this.isPlacing) return;
      if (e.key === 'Escape') {
        this.cancelPlacement();
      } else if (e.key === 'Enter') {
        if (this.batchPlacedItems && this.batchPlacedItems.length > 0) {
          e.preventDefault();
          this.consolidateBatch();
        }
      } else if (e.key.toLowerCase() === 'r') {
        // Rotar 15 grados (o 45 si shift)
        this.ghostRotationY = (this.ghostRotationY + (e.shiftKey ? -15 : 15) + 360) % 360;
        if (this.ghostMesh) {
          this.ghostMesh.rotation.y = THREE.MathUtils.degToRad(this.ghostRotationY);
        }
        this.updatePlacementHud();
      } else if (e.key === '+' || e.key === '=') {
        this.ghostScale = Math.min(this.ghostScale + 0.1, 2.5);
        if (this.ghostMesh) this.ghostMesh.scale.setScalar(this.ghostScale);
      } else if (e.key === '-' || e.key === '_') {
        this.ghostScale = Math.max(this.ghostScale - 0.1, 0.4);
        if (this.ghostMesh) this.ghostMesh.scale.setScalar(this.ghostScale);
      }
    });

    // Eventos sobre el viewport del mapa
    const container = document.getElementById(this.mapManager.containerId);
    if (!container) return;

    container.addEventListener('mousemove', (e) => this.onMouseMove(e));
    container.addEventListener('click', (e) => this.onMapClick(e));
  }

  /**
   * Inicia el modo de colocación 3D con preview holográfico y trazado continuo
   */
  startPlacement(item) {
    this.closeDock();
    this.activePlacementItem = item;
    this.isPlacing = true;
    this.ghostRotationY = 0;
    this.ghostScale = item.scale || 1.0;
    this.batchPlacedItems = [];
    this.clearBatchPreview();

    this.createGhostMesh(item);

    // Mostrar HUD AoE3 inferior de colocación
    const hud = document.getElementById('aoe3-placement-hud');
    if (hud) hud.style.display = 'flex';
    this.updatePlacementHud();

    bus.emit('ui:show_toast', `🏛️ Modo Colocación: Haz clic en el terreno para ubicar "${item.name}". [R: Girar • Enter: Consolidar • Esc: Salir]`);

    const container = document.getElementById(this.mapManager.containerId);
    if (container) container.style.cursor = 'crosshair';
  }

  cancelPlacement() {
    this.isPlacing = false;
    this.activePlacementItem = null;
    this.pendingBatch = null;
    this.pendingPlacement = null;

    if (this.ghostMesh) {
      this.scene.remove(this.ghostMesh);
      this.ghostMesh = null;
    }

    this.clearBatchPreview();

    const hud = document.getElementById('aoe3-placement-hud');
    if (hud) hud.style.display = 'none';

    const drawHud = document.getElementById('drawingHudPill');
    if (drawHud) drawHud.style.display = 'none';

    const container = document.getElementById(this.mapManager.containerId);
    if (container) container.style.cursor = 'default';
  }

  /**
   * Crea la malla fantasma semitransparente con resplandor dorado AoE3
   */
  createGhostMesh(item) {
    if (this.ghostMesh) {
      this.scene.remove(this.ghostMesh);
      this.ghostMesh = null;
    }

    const group = new THREE.Group();
    group.name = 'aoe3_ghost_preview';

    // Cilindro/Caja base de referencia con aura ámbar
    const auraGeo = new THREE.CylinderGeometry(2.0, 2.2, 0.25, 24);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.45,
      wireframe: true
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.position.y = 0.12;
    group.add(aura);

    // Placeholder geométrico estilizado temporal mientras carga
    const bodyGeo = new THREE.BoxGeometry(2.4, 2.2, 2.4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      transparent: true,
      opacity: 0.5,
      roughness: 0.4
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.1;
    group.add(body);

    group.scale.setScalar(this.ghostScale);
    this.ghostMesh = group;
    this.scene.add(this.ghostMesh);
  }

  onMouseMove(e) {
    if (!this.isPlacing || !this.ghostMesh) return;

    const hit = this.getTerrainRaycast(e);
    if (hit) {
      const pt = hit.point;
      const elev = this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(pt.x, pt.z) : pt.y;
      this.ghostMesh.position.set(pt.x, elev, pt.z);
    }
  }

  onMapClick(e) {
    if (!this.isPlacing || !this.activePlacementItem) return;

    // Ignorar clics sobre elementos del UI (HUDs, modals, dock)
    if (e.target && (
      e.target.closest('#aoe3-placement-hud') ||
      e.target.closest('#aoe3-placement-modal') ||
      e.target.closest('#aoe3-command-dock') ||
      e.target.closest('#drawingHudPill') ||
      e.target.closest('.modal-overlay')
    )) {
      return;
    }

    const hit = this.getTerrainRaycast(e);
    if (!hit) return;

    const pt = hit.point;
    const elev = this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(pt.x, pt.z) : pt.y;

    const stamped = {
      item: this.activePlacementItem,
      x: pt.x,
      y: elev,
      z: pt.z,
      rotY: this.ghostRotationY,
      scale: this.ghostScale
    };

    this.batchPlacedItems.push(stamped);
    this.createBatchPreviewInstance(stamped);
    this.updatePlacementHud();

    const count = this.batchPlacedItems.length;
    bus.emit('ui:show_toast', `📍 ${this.activePlacementItem.shortName} #${count} ubicado. Puedes seguir haciendo clic para continuar el trazado, [R] para rotar, o [Enter / Consolidar] para finalizar.`);
  }

  /**
   * Crea una instancia de previsualización fija en 3D para el lote
   */
  createBatchPreviewInstance(stamped) {
    const item = stamped.item;
    const group = new THREE.Group();
    group.position.set(stamped.x, stamped.y, stamped.z);
    group.rotation.y = THREE.MathUtils.degToRad(stamped.rotY || 0);
    group.scale.setScalar(stamped.scale || 1.0);

    let modelHeight = 2.0;
    if (item.modelType === 'glb' && item.modelPath && this.gltfLoader) {
      this.loadGLBModel(item.modelPath, group, stamped.scale || item.scale || 1.0, (h) => {
        const badge = this.createBillboardBadge(item.icon || '🏛️', `#${this.batchPlacedItems.length}`);
        badge.position.y = (h || 2.4) + 0.8;
        group.add(badge);
      });
    } else {
      modelHeight = this.buildProceduralModel(group, item);
      const badge = this.createBillboardBadge(item.icon || '🏛️', `#${this.batchPlacedItems.length}`);
      badge.position.y = modelHeight + 0.8;
      group.add(badge);
    }

    // Aura ámbar de previsualización activa estilo AoE3
    const ringGeo = new THREE.RingGeometry(1.2, 1.5, 20);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.08;
    group.add(ring);

    this.batchPreviewGroup.add(group);
  }

  clearBatchPreview() {
    if (this.batchPreviewGroup) {
      while (this.batchPreviewGroup.children.length > 0) {
        const obj = this.batchPreviewGroup.children[0];
        this.batchPreviewGroup.remove(obj);
        obj.traverse?.((c) => {
          if (c.geometry) c.geometry.dispose();
          if (c.material) {
            if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
            else c.material.dispose();
          }
        });
      }
    }
  }

  updatePlacementHud() {
    const hud = document.getElementById('aoe3-placement-hud');
    if (!hud) return;

    const count = this.batchPlacedItems.length;
    const item = this.activePlacementItem;
    if (!item) return;

    const iconEl = document.getElementById('aoe3-hud-icon');
    if (iconEl) iconEl.textContent = item.icon || '🏛️';

    const titleEl = document.getElementById('aoe3-hud-title');
    if (titleEl) titleEl.textContent = `Colocando: ${item.name}`;

    const countBadge = document.getElementById('aoe3-hud-count-badge');
    if (countBadge) {
      countBadge.textContent = count === 0 ? '0 trazados' : `${count} trazado${count > 1 ? 's' : ''}`;
      countBadge.style.background = count > 0 ? '#14532d' : '#451a03';
      countBadge.style.borderColor = count > 0 ? '#22c55e' : '#d97706';
      countBadge.style.color = count > 0 ? '#86efac' : '#fde047';
    }

    const rotVal = document.getElementById('aoe3-hud-rot-val');
    if (rotVal) rotVal.textContent = `${(this.ghostRotationY % 360)}°`;

    const btnCount = document.getElementById('aoe3-hud-btn-count');
    if (btnCount) btnCount.textContent = `(${count})`;

    const btnConsolidate = document.getElementById('btn-aoe3-hud-consolidate');
    if (btnConsolidate) {
      if (count > 0) {
        btnConsolidate.style.opacity = '1';
        btnConsolidate.style.pointerEvents = 'auto';
        btnConsolidate.classList.add('pulse-glow');
      } else {
        btnConsolidate.style.opacity = '0.5';
        btnConsolidate.style.pointerEvents = 'none';
        btnConsolidate.classList.remove('pulse-glow');
      }
    }
  }

  consolidateBatch() {
    if (!this.isPlacing || this.batchPlacedItems.length === 0) return;
    this.openPlacementModal(this.batchPlacedItems);
  }

  getTerrainRaycast(event) {
    const container = document.getElementById(this.mapManager.containerId);
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    this.mapManager.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mapManager.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.mapManager.raycaster.setFromCamera(this.mapManager.mouse, this.mapManager.camera);

    const targets = [];
    if (this.mapManager.groundMesh) targets.push(this.mapManager.groundMesh);
    if (this.drawingManager && this.drawingManager.drawnPolygonsGroup) {
      this.drawingManager.drawnPolygonsGroup.children.forEach(c => targets.push(c));
    }

    const intersects = this.mapManager.raycaster.intersectObjects(targets, true);
    return intersects.length > 0 ? intersects[0] : null;
  }

  /**
   * Abre el modal AoE 3 calculando simbiosis con polígonos y zona de Mollison
   * Acepta tanto un objeto único como un lote consolidado de objetos
   */
  openPlacementModal(dataOrBatch) {
    const modal = document.getElementById('aoe3-placement-modal');
    if (!modal) return;

    const batch = Array.isArray(dataOrBatch) ? dataOrBatch : [dataOrBatch];
    if (batch.length === 0) return;
    this.pendingBatch = batch;

    const count = batch.length;
    const item = batch[0].item;

    let sumX = 0, sumY = 0, sumZ = 0;
    batch.forEach(b => {
      sumX += b.x;
      sumY += b.y;
      sumZ += b.z;
    });
    const avgX = sumX / count;
    const avgY = sumY / count;
    const avgZ = sumZ / count;

    document.getElementById('aoe3-m-icon').textContent = item.icon || '🏛️';
    document.getElementById('aoe3-m-title').textContent = count > 1
      ? `ASENTAR LOTE: ${count}x ${item.name.toUpperCase()}`
      : `ASENTAR: ${item.name.toUpperCase()}`;

    document.getElementById('aoe3-m-coords').textContent = count > 1
      ? `Centroide de Trazado: (X: ${avgX.toFixed(1)}, Z: ${avgZ.toFixed(1)}) • ${count} segmentos acumulados`
      : `Coordenadas: (X: ${avgX.toFixed(1)}, Z: ${avgZ.toFixed(1)}) • Altura: ${avgY.toFixed(1)}m`;

    const nameInput = document.getElementById('aoe3-input-name');
    nameInput.value = count > 1
      ? `${item.shortName} (Trazado de ${count} uds)`
      : `${item.shortName} #${this.placedObjects.length + 1}`;

    const roleInput = document.getElementById('aoe3-input-role');
    roleInput.value = item.roleDefault || '';

    // Poblar selector de polígonos con detección espacial Punto-en-Polígono en centroide
    this.populatePolygonsSelect(avgX, avgZ);

    // Calcular análisis de Permacultura (Distancia a Casa y Zona Mollison)
    const dist = Math.hypot(avgX - this.originX, avgZ - this.originZ);
    let zone = 1;
    if (dist > 550) zone = 5;
    else if (dist > 250) zone = 4;
    else if (dist > 90) zone = 3;
    else if (dist > 35) zone = 2;

    const zoneBadge = document.getElementById('aoe3-perma-zone-badge');
    const textEl = document.getElementById('aoe3-perma-text');
    zoneBadge.textContent = `ZONA MOLLISON: ${zone}`;

    // Evaluación pedagógica permacultural
    let permaVerdict = '';
    if (item.category === 'paths') {
      permaVerdict = `🛤️ Red Vial Keyline: Trazado continuo de ${count} segmento${count > 1 ? 's' : ''} (~${(count * 8)}m lineales). Optimiza el flujo de maquinaria, minimiza compactación de suelos vivos y canaliza escorrentía pluvial hacia tranques.`;
      zoneBadge.style.color = '#38bdf8';
    } else if (item.category === 'fences') {
      permaVerdict = `🚪 Delimitación Perimetral PRV: ${count} seccion${count > 1 ? 'es' : ''} de cerco/portón. Permite subdivisión de potreros para pastoreo regenerativo de ultra-alta densidad sin sobrepastoreo.`;
      zoneBadge.style.color = '#34d399';
    } else if (item.category === 'water') {
      permaVerdict = `💧 Infraestructura Hídrica Yeomans: ${count} cuerpo${count > 1 ? 's' : ''} de agua/albercas. Aumenta la capacidad de retención predial, recarga napas freáticas y crea microclimas contra heladas.`;
      zoneBadge.style.color = '#38bdf8';
    } else if (item.idealZone !== undefined) {
      if (zone === item.idealZone) {
        permaVerdict = `✅ Ubicación Óptima (${count} uds): Se ubica en Zona ${zone}, maximizando la eficiencia de flujo de trabajo y reduciendo pérdidas de energía en traslados.`;
        zoneBadge.style.color = '#34d399';
      } else if (zone > item.idealZone) {
        const deltaZ = zone - item.idealZone;
        const extraDistKm = ((dist * 2) * 300 / 1000).toFixed(0);
        permaVerdict = `⚠️ Ineficiencia por Distancia (+${deltaZ} zonas): Este lote requiere visitas frecuentes y a ${dist.toFixed(0)}m de la casa implicará caminar ~${extraDistKm} km/año extra. Recomendación: Mover más cerca de la Casona (Zona ${item.idealZone}).`;
        zoneBadge.style.color = '#f59e0b';
      } else {
        permaVerdict = `ℹ️ Advertencia de Proximidad: Ubicar ${count} unidades extensivas en Zona ${zone} puede generar interferencia con la vivienda (olores/tránsito). Idealmente ubicar en Zona ${item.idealZone}.`;
        zoneBadge.style.color = '#38bdf8';
      }
    } else {
      permaVerdict = `Lote de ${count} unidad${count > 1 ? 'es' : ''} integrado en radio de ${dist.toFixed(0)}m de la Casona Central. Coherente con zonificación regenerativa.`;
      zoneBadge.style.color = '#94a3b8';
    }

    textEl.textContent = permaVerdict;
    const totalCost = item.baseCostClp * count;
    const totalHours = Number((item.buildHours * count).toFixed(1));
    document.getElementById('aoe3-perma-cost').textContent = `$${totalCost.toLocaleString('es-CL')}`;
    document.getElementById('aoe3-perma-hours').textContent = `${totalHours} hrs`;
    document.getElementById('aoe3-perma-dist').textContent = `${dist.toFixed(0)} m`;

    modal.style.display = 'flex';
  }

  closeModal() {
    const modal = document.getElementById('aoe3-placement-modal');
    if (modal) modal.style.display = 'none';
    this.cancelPlacement();
  }

  populatePolygonsSelect(x, z) {
    const select = document.getElementById('aoe3-select-polygon');
    if (!select) return;

    select.innerHTML = '';

    // 1. Polígonos de cuarteles del predio
    const allPolygons = [];
    if (this.parcelManager && this.parcelManager.parcels) {
      this.parcelManager.parcels.forEach(p => {
        allPolygons.push({
          id: p.id,
          name: p.name || `Cuartel ${p.id}`,
          type: 'Cuartel Predial',
          landUse: p.crop || 'Uso Agrícola',
          points: p.coordinates || []
        });
      });
    }

    // 2. Polígonos dibujados por el usuario
    if (this.drawingManager && this.drawingManager.customPolygons) {
      this.drawingManager.customPolygons.forEach(cp => {
        allPolygons.push({
          id: cp.id,
          name: cp.customName || cp.elementMeta?.name || 'Polígono Personalizado',
          type: 'Polígono Dibujado',
          landUse: cp.elementMeta?.name || 'Uso Mixto',
          points: cp.points || []
        });
      });
    }

    let detectedPolygonId = null;

    // Test de detección espacial Punto-en-Polígono
    allPolygons.forEach(poly => {
      if (poly.points && poly.points.length >= 3) {
        if (this.isPointInsidePolygon({ x, z }, poly.points)) {
          detectedPolygonId = poly.id;
        }
      }
    });

    // Opción Libre
    const optFree = document.createElement('option');
    optFree.value = 'free_land';
    optFree.textContent = '📍 Suelo Libre / Zona Abierta del Predio';
    select.appendChild(optFree);

    allPolygons.forEach(poly => {
      const opt = document.createElement('option');
      opt.value = poly.id;
      opt.textContent = `🌾 ${poly.name} [${poly.landUse}]`;
      if (poly.id === detectedPolygonId) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    if (detectedPolygonId) {
      bus.emit('ui:show_toast', `🎯 Objeto georreferenciado dentro del suelo: ${select.options[select.selectedIndex].text}`);
    }
  }

  /**
   * Algoritmo 2D Point-in-Polygon (Ray-casting plano X-Z)
   */
  isPointInsidePolygon(point, polygonPoints) {
    let inside = false;
    for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
      const xi = polygonPoints[i].x, zi = polygonPoints[i].z !== undefined ? polygonPoints[i].z : polygonPoints[i].y;
      const xj = polygonPoints[j].x, zj = polygonPoints[j].z !== undefined ? polygonPoints[j].z : polygonPoints[j].y;

      const intersect = ((zi > point.z) !== (zj > point.z)) &&
        (point.x < (xj - xi) * (point.z - zi) / (zj - zi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Confirma la colocación, carga el modelo 3D real y persiste
   */
  confirmPlacement() {
    const batch = this.pendingBatch || (this.pendingPlacement ? [this.pendingPlacement] : []);
    if (!batch || batch.length === 0) return;

    const item = batch[0].item;
    const customName = document.getElementById('aoe3-input-name').value.trim() || item.name;
    const customRole = document.getElementById('aoe3-input-role').value.trim() || item.roleDefault;
    const polygonId = document.getElementById('aoe3-select-polygon').value;
    const linkType = document.getElementById('aoe3-select-link').value;
    const batchId = batch.length > 1 ? `batch_${Date.now()}` : null;

    batch.forEach((data, idx) => {
      const dist = Math.hypot(data.x - this.originX, data.z - this.originZ);
      let zone = 1;
      if (dist > 550) zone = 5;
      else if (dist > 250) zone = 4;
      else if (dist > 90) zone = 3;
      else if (dist > 35) zone = 2;

      const objRecord = {
        id: `aoe_obj_${Date.now()}_${idx}`,
        itemId: item.id,
        name: batch.length === 1 ? customName : `${customName} #${idx + 1}`,
        role: customRole,
        icon: item.icon,
        category: item.category,
        x: data.x,
        y: data.y,
        z: data.z,
        rotationY: data.rotY,
        scale: data.scale,
        polygonId: polygonId,
        linkType: linkType,
        mollisonZone: zone,
        costClp: item.baseCostClp,
        buildHours: item.buildHours,
        batchId: batchId,
        createdAt: new Date().toISOString()
      };

      // Crear la entidad en la escena 3D Three.js
      this.instantiateObject3D(objRecord, item);

      // Guardar en la colección activa
      this.placedObjects.push(objRecord);
    });

    // Guardar en LocalStorage y actualizar dock
    this.saveToLocalStorage();
    this.updateDockStatusSummary();

    // Limpiar preview de lote
    this.clearBatchPreview();

    const count = batch.length;
    bus.emit('ui:show_toast', count > 1
      ? `✅ Lote de ${count}x "${customName}" asentado con éxito en el gemelo digital.`
      : `✅ "${customName}" asentado con éxito en el gemelo digital.`
    );
    bus.emit('object:placed', { batch: batch, item: item, count: count });

    // Cerrar modal y limpiar estado
    const modal = document.getElementById('aoe3-placement-modal');
    if (modal) modal.style.display = 'none';
    this.cancelPlacement();
  }

  /**
   * Instancia el modelo 3D real o procedural en la escena Three.js
   */
  instantiateObject3D(record, item) {
    const group = new THREE.Group();
    group.name = record.id;
    group.position.set(record.x, record.y, record.z);
    group.rotation.y = THREE.MathUtils.degToRad(record.rotationY || 0);

    // Metadata completa para inspector y herramienta de la Mano (✋ Mover)
    group.userData = {
      type: 'placed_aoe_object',
      id: record.id,
      name: record.name,
      role: record.role,
      category: record.category,
      record: record,
      isCustom: true
    };

    let modelHeight = 2.0;

    // Si tiene modelo GLB y el loader está disponible
    if (item.modelType === 'glb' && item.modelPath && this.gltfLoader) {
      this.loadGLBModel(item.modelPath, group, record.scale || item.scale || 1.0, (h) => {
        // Añadir Billboard Badge flotante sobre el objeto
        const badge = this.createBillboardBadge(record.icon || '🏛️', record.name);
        badge.position.y = (h || 2.4) + 1.2;
        group.add(badge);
      });
    } else {
      // Procedural fallback de alta calidad
      modelHeight = this.buildProceduralModel(group, item);
      const badge = this.createBillboardBadge(record.icon || '🏛️', record.name);
      badge.position.y = modelHeight + 1.2;
      group.add(badge);
    }

    this.placedObjectsGroup.add(group);

    // Registrar en pickableObjects para selección e interacción con la Mano
    if (this.mapManager.pickableObjects) {
      this.mapManager.pickableObjects.push(group);
    }
  }

  loadGLBModel(path, parentGroup, scale, onLoaded) {
    if (this.modelCache.has(path)) {
      const cached = this.modelCache.get(path);
      const clone = cached.clone(true);
      clone.scale.setScalar(scale);
      parentGroup.add(clone);
      const box = new THREE.Box3().setFromObject(clone);
      if (onLoaded) onLoaded(box.max.y - box.min.y);
      return;
    }

    this.gltfLoader.load(
      path,
      (gltf) => {
        const scene = gltf.scene;
        scene.traverse(node => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        this.modelCache.set(path, scene);
        const clone = scene.clone(true);
        clone.scale.setScalar(scale);
        parentGroup.add(clone);
        const box = new THREE.Box3().setFromObject(clone);
        if (onLoaded) onLoaded(box.max.y - box.min.y);
      },
      undefined,
      (err) => {
        console.warn(`⚠️ Error cargando GLB (${path}), usando procedural:`, err);
        const h = this.buildProceduralModel(parentGroup, { id: 'fallback' });
        if (onLoaded) onLoaded(h);
      }
    );
  }

  /**
   * Construye modelos procedurales Three.js cuando no hay GLB
   */
  buildProceduralModel(group, item) {
    return ProceduralObjectFactory.buildModel(group, item);
  }

  /**
   * Crea el cartel billboard flotante con estética de latón y pergamino
   */
  createBillboardBadge(icon, label) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');

    // Fondo madera oscura pulida
    ctx.fillStyle = 'rgba(28, 18, 11, 0.92)';
    this.roundRect(ctx, 4, 4, 248, 88, 16);
    ctx.fill();

    // Marco dorado latón
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    this.roundRect(ctx, 4, 4, 248, 88, 16);
    ctx.stroke();

    // Emoji / Icono
    ctx.font = '34px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 44, 48);

    // Texto de la etiqueta
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 20px "Plus Jakarta Sans", Georgia, serif';
    ctx.textAlign = 'left';

    const shortLabel = label.length > 14 ? label.slice(0, 13) + '…' : label;
    ctx.fillText(shortLabel, 76, 48);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.2, 1.2, 1);
    return sprite;
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('agritwin_placed_objects', JSON.stringify(this.placedObjects));
    } catch (e) {
      console.warn('Could not save placed objects to localStorage:', e);
    }
  }

  loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem('agritwin_placed_objects');
      if (!raw) return;
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        list.forEach(rec => {
          const item = OBJECT_CATALOG.find(it => it.id === rec.itemId) || {
            id: rec.itemId,
            name: rec.name,
            icon: rec.icon,
            category: rec.category,
            modelType: 'procedural'
          };
          this.instantiateObject3D(rec, item);
          this.placedObjects.push(rec);
        });
        this.updateDockStatusSummary();
      }
    } catch (e) {
      console.warn('Could not load placed objects from localStorage:', e);
    }
  }

  removePlacedObjectById(id) {
    const idx = this.placedObjects.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.placedObjects.splice(idx, 1);
      this.saveToLocalStorage();
      this.updateDockStatusSummary();
    }
    const mesh = this.placedObjectsGroup.getObjectByName(id);
    if (mesh) {
      this.placedObjectsGroup.remove(mesh);
      if (this.mapManager && this.mapManager.pickableObjects) {
        const pIdx = this.mapManager.pickableObjects.indexOf(mesh);
        if (pIdx !== -1) this.mapManager.pickableObjects.splice(pIdx, 1);
      }
    }
    bus.emit('ui:show_toast', '🗑️ Estructura retirada del gemelo digital.');
    bus.emit('object:removed', { id });
  }
}
