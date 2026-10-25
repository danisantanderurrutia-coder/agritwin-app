/**
 * AgriTwin - Entity Detail Panels Module
 * 
 * Renderizado de fichas técnicas y paneles de inspección en el sideDrawer:
 *  - Parcelas agrícolas (NDVI, balances hídricos, riesgo de heladas)
 *  - Plantaciones y árboles (fenología, especie, visor PBR 3D)
 *  - Polígonos trazados a mano con el Pincel 3D
 *  - Objetos y estructuras del catálogo Age of Empires III
 */

import { fruit3DViewer } from '../components/Fruit3DViewer.js';

export class EntityDetailPanels {
  constructor(uiController) {
    this.ui = uiController;
  }
  renderParcelPanel(props) {
    this.ui.drawerTitle.textContent = `Parcela ${props.parcelId}`;
    this.ui.drawerSubtitle.textContent = `Cultivo: ${props.crop} | Predio Meniels (Parral)`;

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

    this.ui.drawerBody.innerHTML = `
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
    this.ui.drawerTitle.textContent = props.name || 'Plantación';
    this.ui.drawerSubtitle.textContent = `Especie: ${props.species} | Categoría: ${props.cropCategory || 'Agroecológico'}`;

    this.ui.drawerBody.innerHTML = `
      <!-- Acceso Directo a Caja de Terreno & Microclima Cuarteles -->
      <div class="glass-card" style="border-left: 4px solid #10b981; padding: 12px; margin-bottom: 10px; background: rgba(16, 185, 129, 0.05);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 800; color: #34d399; font-family: monospace; letter-spacing: 0.05em;">[ATMÓSFERA UNIFICADA] • Cuarteles & Frutales</span>
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
          <button onclick="window.openGalponWorkshop && window.openGalponWorkshop('cuarteles')" style="flex: 1; min-width: 140px; padding: 7px 10px; background: rgba(16, 185, 129, 0.25); border: 1px solid #10b981; color: #6ee7b7; border-radius: 6px; font-size: 10.5px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>📟</span> Abrir Caja de Terreno (Sub-Caja Cuarteles)
          </button>
          <button onclick="window.triggerSimRain && window.triggerSimRain()" style="padding: 7px 10px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #7dd3fc; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>🌧️</span> Probar Lluvia 3D
          </button>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="glass-card metric-card"><div class="metric-label">Rendimiento Est.</div><div class="metric-value">${props.estimatedYieldKg || 12500} kg</div></div>
        <div class="glass-card metric-card"><div class="metric-label">Año Plantación</div><div class="metric-value">${props.plantedYear || 2021}</div></div>
      </div>

      <!-- Visor Fenológico y PBR del Fruto en 3D (Avocado.glb) -->
      <div class="glass-card" style="margin-top: 10px; padding: 12px; border: 1px solid rgba(16, 185, 129, 0.35); background: rgba(6, 15, 25, 0.7);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #34d399; font-family: monospace;">🥑 INSPECCIÓN BOTÁNICA 3D (CALIDAD PBR)</span>
          <span style="font-size: 9px; font-family: monospace; background: rgba(52, 211, 153, 0.15); color: #a7f3d0; padding: 2px 6px; border-radius: 4px;">GLB • INTERACTIVO</span>
        </div>
        <div style="position: relative; width: 100%; height: 160px; background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(0,0,0,0.65) 85%); border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center;" id="fruit_3d_container">
          <canvas id="fruit_3d_canvas" style="width: 100%; height: 100%; display: block; cursor: grab;"></canvas>
          <div id="fruit_3d_loading" style="position: absolute; font-size: 10px; color: #94a3b8; font-family: monospace; pointer-events: none;">Cargando modelo PBR...</div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 10px; margin-top: 8px; font-family: monospace;">
          <div style="background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 4px; color: #cbd5e1;">Calibre: <strong style="color: #6ee7b7;">18-20 (Export)</strong></div>
          <div style="background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 4px; color: #cbd5e1;">Materia Seca: <strong style="color: #fde047;">24.2%</strong></div>
          <div style="background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 4px; color: #cbd5e1;">Cutícula: <strong style="color: #6ee7b7;">Rugosa Hass</strong></div>
          <div style="background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 4px; color: #cbd5e1;">Grado Brix: <strong style="color: #38bdf8;">14.5° Bx</strong></div>
        </div>
      </div>
    `;

    // Initialize the interactive 3D Fruit Viewer
    setTimeout(() => fruit3DViewer.initViewer(), 60);
  }


  renderCustomPolygonPanel(props) {
    const icon = props.icon || '📍';
    const name = props.name || 'Polígono 3D';
    const itemName = props.itemName || props.name;
    const category = props.category || 'Catálogo de Ítems';
    const areaHa = props.areaHa || 0.0;
    const details = props.itemDetails || {};

    this.ui.drawerTitle.textContent = `${icon} ${name}`;
    this.ui.drawerSubtitle.textContent = `${itemName} | ${areaHa} ha | Catálogo de Ítems`;

    this.ui.drawerBody.innerHTML = `
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

      <!-- Objetos y Estructuras Asentadas en este Tipo de Suelo (Simbiosis AoE III) -->
      ${(() => {
        const placed = window.objectPlacementManager?.placedObjects || [];
        const inPoly = placed.filter(o => o.polygonId === props.id);
        const synList = this.permacultureEngine ? this.permacultureEngine.evaluatePolygonSynergies([props], inPoly) : [];
        const syn = synList[0] || { scoreLabel: '⚪ Coexistencia', rationale: 'Uso de suelo activo.' };

        return `
          <!-- Tarjeta de Simbiosis Permacultural del Cuartel (1 Polígono = 1 Uso de Suelo) -->
          <div style="background: linear-gradient(180deg, #2a1b10 0%, #150d07 100%); border: 1.5px solid #b8860b; border-radius: 8px; padding: 10px; margin-top: 10px; box-shadow: inset 0 0 10px rgba(0,0,0,0.8); color: #fef3c7;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #fbbf24; font-size: 11px; display: flex; align-items: center; gap: 5px;">
                <span>🌱</span> Simbiosis Permacultural del Cuartel
              </strong>
              <span style="font-size: 9px; font-weight: 800; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px; border: 1px solid #78521d;">
                ${syn.scoreLabel}
              </span>
            </div>
            <div style="font-size: 10px; color: #dfc8a5; line-height: 1.4;">
              ${syn.rationale}
            </div>
            <div style="font-size: 8.5px; color: #a89078; margin-top: 6px; font-family: monospace;">
              Principio: 1 Polígono = 1 Tipo de Suelo ("${itemName}"), conviviendo armónicamente con ${inPoly.length} elementos.
            </div>
          </div>

          <div class="glass-card" style="margin-top: 10px;">
            <div class="future-title" style="color: #fbbf24;">🏛️ Elementos Asentados en este Suelo (${inPoly.length})</div>
            ${inPoly.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
                ${inPoly.map(obj => `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; background: rgba(255,255,255,0.04); border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="font-size: 16px;">${obj.icon || '🏛️'}</span>
                      <div>
                        <strong style="color: #fef3c7; font-size: 11px;">${obj.name}</strong>
                        <div style="font-size: 9.5px; color: #94a3b8;">${obj.role || 'Instalación activa'}</div>
                      </div>
                    </div>
                    <span style="font-size: 9px; color: #fbbf24; font-family: monospace; background: rgba(245,158,11,0.15); padding: 2px 6px; border-radius: 4px;">Zona ${obj.mollisonZone || 1}</span>
                  </div>
                `).join('')}
              </div>
            ` : `
              <p style="font-size: 0.78rem; color: #94a3b8; margin-top: 6px;">
                No hay estructuras asentadas aún en este cuartel. Utiliza el botón <strong>🏛️ Objetos</strong> para insertar galpones, sensores, árboles o animales aquí.
              </p>
            `}
          </div>
        `;
      })()}

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
    if (deleteBtn && this.ui.drawingManager) {
      deleteBtn.addEventListener('click', () => {
        if (confirm(`¿Deseas eliminar el polígono "${props.name}"?`)) {
          this.ui.drawingManager.deletePolygonById(props.id);
        }
      });
    }
  }

  /**
   * Panel inspector para figuras y estructuras 3D asentadas con el Editor de Objetos (AoE III)
   */
  renderPlacedObjectPanel(props) {
    const rec = props.record || props;
    this.openDrawer();
    this.ui.drawerTitle.textContent = `${rec.icon || '🏛️'} ${rec.name}`;
    this.ui.drawerSubtitle.textContent = `Categoría: ${rec.category || 'Estructura'} • Zona Mollison: ${rec.mollisonZone || '?'}`;

    let polygonName = 'Suelo Libre / Zona Abierta';
    if (rec.polygonId && rec.polygonId !== 'free_land') {
      const p = this.ui.drawingManager?.customPolygons?.find(cp => cp.id === rec.polygonId) ||
                this.parcelManager?.parcels?.find(pr => pr.id === rec.polygonId);
      if (p) polygonName = p.customName || p.name || p.id;
    }

    this.ui.drawerBody.innerHTML = `
      <div class="metrics-grid">
        <div class="glass-card metric-card">
          <div class="metric-label">Zona Mollison</div>
          <div class="metric-value" style="font-size: 15px; color: #38bdf8;">Zona ${rec.mollisonZone || 1}</div>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-label">Inversión Ref.</div>
          <div class="metric-value" style="font-size: 12.5px; color: #fbbf24;">$${(rec.costClp || 0).toLocaleString('es-CL')}</div>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-label">Faena Montaje</div>
          <div class="metric-value" style="font-size: 13px; color: #34d399;">${rec.buildHours || 0} <span class="metric-unit">hrs</span></div>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-label">Uso de Suelo</div>
          <div class="metric-value" style="font-size: 11px; color: #e2e8f0; overflow:hidden; text-overflow:ellipsis;" title="${polygonName}">${polygonName}</div>
        </div>
      </div>

      <div class="glass-card" style="margin-top: 10px;">
        <div class="future-title" style="color: #fbbf24;">🏛️ Ficha Técnica & Propósito Permacultural</div>
        <p style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.4; margin-top: 6px;">
          <strong>Rol Operativo:</strong> ${rec.role || 'Instalación predial activa en el gemelo digital.'}
        </p>
        <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 6px;">
          📍 Distancia a Casa Central: <strong>${Math.round(Math.hypot(Number(rec.x || 0) - (-8), Number(rec.z || 0) - 8))}m</strong> (X: ${Number(rec.x || 0).toFixed(1)}m, Z: ${Number(rec.z || 0).toFixed(1)}m)
        </div>
        <div style="font-size: 0.78rem; color: #67e8f9; margin-top: 4px;">
          🚶 Traslado Anual Estimado: ~${Math.round(2 * Math.hypot(Number(rec.x || 0) - (-8), Number(rec.z || 0) - 8) * (Number(rec.mollisonZone) <= 2 ? 650 : 120) / 1000)} km/año ida y vuelta
        </div>
        <div style="font-size: 0.78rem; color: #38bdf8; margin-top: 4px;">
          🔗 Vínculo Infraestructura: ${rec.linkType && rec.linkType !== 'none' ? rec.linkType : 'Sin conexión directa'}
        </div>
      </div>

      <div class="custom-poly-action-bar" style="margin-top: 12px; display: flex; gap: 8px;">
        <button id="btnMoveThisObject" class="btn-change-item" style="flex: 1; background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fde047;">
          ✋ Mover en Terreno
        </button>
        <button id="btnDeletePlacedObject" class="btn-delete-poly" style="flex: 1;" title="Retirar este objeto del predio">
          🗑️ Eliminar
        </button>
      </div>
    `;

    const btnMove = document.getElementById('btnMoveThisObject');
    if (btnMove && this.ui.drawingManager) {
      btnMove.addEventListener('click', () => {
        const obj3D = this.ui.mapManager?.scene?.getObjectByName(rec.id);
        if (obj3D) {
          this.ui.drawingManager.startMoveMode();
          this.ui.drawingManager.selectedMoveObject = obj3D;
          this.ui.drawingManager.showMoveSelectionHelper(obj3D);
          bus.emit('ui:show_toast', `✋ Moviendo "${rec.name}". Haz clic en el terreno donde deseas ubicarlo.`);
        }
      });
    }

    const btnDel = document.getElementById('btnDeletePlacedObject');
    if (btnDel) {
      btnDel.addEventListener('click', () => {
        if (confirm(`¿Deseas retirar "${rec.name}" del predio?`)) {
          window.objectPlacementManager?.removePlacedObjectById(rec.id);
          this.closeDrawer();
        }
      });
    }
  }
}
