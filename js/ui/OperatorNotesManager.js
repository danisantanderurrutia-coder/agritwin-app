/**
 * AgriTwin - OperatorNotesManager Module
 * 
 * Espacio de notas y tareas operativas para el trabajador/operador del hub.
 * IMPORTANTE: Completamente DESACOPLADO del sistema central del hub.
 * - Almacenamiento 100% local en localStorage.
 * - Cero peticiones de red o escrituras a bases de datos de telemetría/GIS.
 * - Apuntes y tareas organizadas por ramas de trabajo (Personal, Riego, Sensores, etc.)
 */

export class OperatorNotesManager {
  constructor(app = null) {
    this.app = app;
    this.storageKey = 'agritwin_operator_fieldnotes_v1';
    this.activeTab = 'tasks'; // 'tasks' | 'scratchpad'
    this.activeBranch = 'all'; // 'all' o branch.id
    this.isOpen = false;

    this.defaultBranches = [
      { id: 'galpon', name: 'El Galpón Predial (3D)', icon: '🏡', color: '#38bdf8', zone: 'Zona 0 & 1', advisors: 'Don Belisario (PRV), Maestra Laura (Biocons.), Ing. Rodrigo (IoT)', modalFn: 'openAgriPredioAdvisorsModal' },
      { id: 'invernadero', name: 'Invernadero & Cultivos', icon: '🌿', color: '#34d399', zone: 'Zona 1 & 2', advisors: 'Ing. Soledad (Biofábrica), Dña. Carmen (Semillas), Ing. Rodrigo (IoT)', modalFn: 'openAgriInvernaderoAdvisorsModal' },
      { id: 'establo', name: 'Establo & Ganadería PRV', icon: '🐄', color: '#f59e0b', zone: 'Zona 2 & 3', advisors: 'Dra. Javiera (Veterinaria), D. Gastón (PRV), Ignacio (Fauna)', modalFn: 'openAgriEstabloAdvisorsModal' },
      { id: 'incursion', name: 'Incursión a Campo (Rewilding)', icon: '🌲', color: '#a3e635', zone: 'Zona 5', advisors: 'Dr. Marcelo (Botánica), Ignacio (Fototrampeo), Dr. Gonzalo (Suelos)', modalFn: 'openAgriExcursionAdvisorsModal' },
      { id: 'cerro', name: 'La Cumbre del Cerro (Cuenca)', icon: '🏔️', color: '#c084fc', zone: 'Zona 4 & Macro', advisors: 'Dr. Fernando (Geomorfología), Dra. Natalia (Meteorología), Dr. Marcelo (Ecología)', modalFn: null, hubUrl: 'http://localhost:7777/#cerro' },
      { id: 'mesa', name: 'La Mesa Vecinal DAO', icon: '👥', color: '#60a5fa', zone: 'Infraestructura Social', advisors: 'Dra. Camila (Antropología), Mg. Patricia (Adm. Pública), D. Silvestre (Memoria)', modalFn: null, hubUrl: 'http://localhost:7777/#mesa' }
    ];

    this.data = this.loadData();
    this.elements = {};
  }

  loadData() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          branches: this.defaultBranches,
          tasks: parsed.tasks || [],
          scratchpad: parsed.scratchpad || ''
        };
      }
    } catch (e) {
      console.warn('Error reading OperatorNotes from localStorage:', e);
    }

    // Datos iniciales en las 6 ramas AoE
    return {
      branches: this.defaultBranches,
      tasks: [
        {
          id: 'task_demo_1',
          text: 'Comprobar afilado de herramientas y cuchillas en el Taller del Galpón',
          branchId: 'galpon',
          isPersonal: false,
          completed: false,
          createdAt: Date.now() - 3600000
        },
        {
          id: 'task_demo_2',
          text: 'Verificar humedad y volteo de pila de Bokashi en el Invernadero',
          branchId: 'invernadero',
          isPersonal: false,
          completed: false,
          createdAt: Date.now() - 2400000
        },
        {
          id: 'task_demo_3',
          text: 'Revisar rotación de Clarita hacia potrero P4 y nivel del bebedero',
          branchId: 'establo',
          isPersonal: false,
          completed: false,
          createdAt: Date.now() - 1800000
        },
        {
          id: 'task_demo_4',
          text: 'Pedir guantes de recambio a bodega y avisar cambio de turno',
          branchId: 'galpon',
          isPersonal: true,
          completed: true,
          createdAt: Date.now() - 7200000
        }
      ],
      scratchpad: "Notas libres de turno:\n- Viento calmo en la cuenca, radiación favorable.\n- Buen aforo en zanja Keyline y rotación Voisin en orden.\n- Asunto personal: confirmar recambio de botas de agua para el próximo turno."
    };
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      this.updateBadge();
    } catch (e) {
      console.error('Error saving OperatorNotes to localStorage:', e);
    }
  }

  init() {
    this.createDOM();
    this.bindEvents();
    this.updateBadge();
    this.render();
  }

  createDOM() {
    // 1. Backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'operatorNotesBackdrop';
    backdrop.className = 'notes-backdrop';
    document.body.appendChild(backdrop);
    this.elements.backdrop = backdrop;

    // 2. Slide-over Drawer
    const drawer = document.createElement('aside');
    drawer.id = 'operatorNotesDrawer';
    drawer.className = 'operator-notes-drawer';
    drawer.setAttribute('aria-label', 'Cuaderno de campo y tareas del operador');
    document.body.appendChild(drawer);
    this.elements.drawer = drawer;

    // 3. Botón flotante si no existe
    let floatingBtn = document.getElementById('floatingNotesBtn');
    if (!floatingBtn) {
      floatingBtn = document.createElement('button');
      floatingBtn.id = 'floatingNotesBtn';
      floatingBtn.className = 'floating-notes-btn';
      floatingBtn.title = 'Cuaderno de Campo & Apuntes de Operador (Atajo: N)';
      floatingBtn.innerHTML = `
        <span style="font-size: 15px;">📝</span>
        <span>Cuaderno</span>
        <span id="notesPendingBadge" class="notes-badge" style="display: none;">0</span>
      `;
      // Insertar después de floatingHouseBtn si existe
      const houseBtn = document.getElementById('floatingHouseBtn');
      if (houseBtn && houseBtn.parentNode) {
        houseBtn.parentNode.insertBefore(floatingBtn, houseBtn.nextSibling);
      } else {
        document.body.appendChild(floatingBtn);
      }
    }
    this.elements.floatingBtn = floatingBtn;
    this.elements.pendingBadge = document.getElementById('notesPendingBadge');
  }

  bindEvents() {
    // Click en botón flotante
    this.elements.floatingBtn?.addEventListener('click', () => {
      this.toggle();
    });

    // Click en backdrop para cerrar
    this.elements.backdrop?.addEventListener('click', () => {
      this.close();
    });

    // Atajo de teclado: Tecla 'N' (cuando no está escribiendo en campos de texto)
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable;

      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        return;
      }

      if ((e.key === 'n' || e.key === 'N') && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Evitar activar si hay un modal abierto diferente
        this.toggle();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.elements.drawer.classList.add('open');
    this.elements.backdrop.classList.add('active');
    this.render();
    
    // Enfocar el input de tarea automáticamente
    setTimeout(() => {
      const input = document.getElementById('notesQuickInput');
      input?.focus();
    }, 150);
  }

  close() {
    this.isOpen = false;
    this.elements.drawer.classList.remove('open');
    this.elements.backdrop.classList.remove('active');
  }

  updateBadge() {
    const pendingCount = this.data.tasks.filter(t => !t.completed).length;
    if (this.elements.pendingBadge) {
      if (pendingCount > 0) {
        this.elements.pendingBadge.textContent = pendingCount;
        this.elements.pendingBadge.style.display = 'inline-block';
      } else {
        this.elements.pendingBadge.style.display = 'none';
      }
    }
  }

  render() {
    if (!this.elements.drawer) return;

    const pendingCount = this.data.tasks.filter(t => !t.completed).length;
    const branches = this.data.branches;

    this.elements.drawer.innerHTML = `
      <!-- Header -->
      <div class="notes-header">
        <div class="notes-header-top">
          <div class="notes-title-group">
            <div class="notes-avatar-icon">📝</div>
            <div>
              <h3 class="notes-main-title">
                Cuaderno de Campo
                <span class="notes-scope-tag">LOCAL • NO CONSOLIDADO</span>
              </h3>
            </div>
          </div>
          <div class="notes-header-actions">
            <button class="notes-icon-btn" id="btnExportNotes" title="Exportar mis notas y tareas (.txt)">📥</button>
            <button class="notes-icon-btn notes-close-btn" id="btnCloseNotes" title="Cerrar (Esc)">&times;</button>
          </div>
        </div>

        <div class="notes-subtitle-notice">
          <span>🔒</span>
          <span><strong>Apuntes autónomos:</strong> Este espacio es personal del operador y no se envía ni altera la base de datos central del Hub.</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="notes-nav-tabs">
        <button class="notes-nav-tab ${this.activeTab === 'tasks' ? 'active' : ''}" id="tabNavTasks">
          <span>📋 Tareas & Checklists</span>
          <span style="font-family: monospace; font-size: 10px; opacity: 0.8;">(${pendingCount})</span>
        </button>
        <button class="notes-nav-tab ${this.activeTab === 'scratchpad' ? 'active' : ''}" id="tabNavScratchpad">
          <span>✏️ Bloc Libre</span>
        </button>
      </div>

      <!-- Body Content -->
      ${this.activeTab === 'tasks' ? this.renderTasksView() : this.renderScratchpadView()}

      <!-- Footer -->
      <div class="notes-footer">
        <div class="notes-privacy-pill">
          <span>💾</span>
          <span>Guardado en este navegador</span>
        </div>
        <button class="notes-clear-all-btn" id="btnClearCompletedNotes" title="Limpiar tareas completadas">
          Limpiar completadas
        </button>
      </div>
    `;

    this.bindDrawerActions();
  }

  renderTasksView() {
    const branches = this.data.branches;
    const activeTasks = this.data.tasks.filter(t => {
      if (this.activeBranch === 'all') return true;
      return t.branchId === this.activeBranch;
    });

    const pendingTasks = activeTasks.filter(t => !t.completed);
    const completedTasks = activeTasks.filter(t => t.completed);

    // Calcular contadores por rama
    const countsByBranch = {};
    branches.forEach(b => {
      countsByBranch[b.id] = this.data.tasks.filter(t => t.branchId === b.id && !t.completed).length;
    });
    const totalPending = this.data.tasks.filter(t => !t.completed).length;

    return `
      <!-- Carousel de Ramas / Áreas -->
      <div class="notes-branches-bar">
        <button class="branch-pill ${this.activeBranch === 'all' ? 'active' : ''}" data-branch="all">
          <span>🌐 Todas</span>
          <span class="branch-count">${totalPending}</span>
        </button>
        ${branches.map(b => `
          <button class="branch-pill ${this.activeBranch === b.id ? 'active' : ''}" data-branch="${b.id}" style="${this.activeBranch === b.id ? `border-color: ${b.color};` : ''}">
            <span>${b.icon} ${b.name}</span>
            <span class="branch-count">${countsByBranch[b.id] || 0}</span>
          </button>
        `).join('')}
        <button class="branch-pill" id="btnAddCustomBranch" style="border-style: dashed;" title="Añadir nueva área de trabajo">
          <span>➕ Nueva Rama</span>
        </button>
      </div>

      <!-- Asesores de la Rama Activa -->
      ${(() => {
        const curBranch = branches.find(b => b.id === this.activeBranch);
        if (!curBranch || !curBranch.advisors) return '';
        return `
          <div style="margin: 0 16px 10px 16px; padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid ${curBranch.color}40; border-left: 3px solid ${curBranch.color}; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <div style="min-width: 0;">
              <div style="font-size: 10px; font-weight: 700; color: ${curBranch.color}; font-family: monospace;">
                🧠 3 ASESORES IA: ${curBranch.name}
              </div>
              <div style="font-size: 9.5px; color: #94a3b8; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${curBranch.advisors}
              </div>
            </div>
            ${curBranch.modalFn ? `
              <button onclick="window['${curBranch.modalFn}'] && window['${curBranch.modalFn}']()" style="padding: 4px 8px; border-radius: 6px; background: ${curBranch.color}25; border: 1px solid ${curBranch.color}60; color: #fff; font-size: 10px; font-weight: 700; cursor: pointer; flex-shrink: 0; white-space: nowrap;">
                Consultar ↗
              </button>
            ` : (curBranch.hubUrl ? `
              <a target="_top" href="${curBranch.hubUrl}" style="text-decoration: none; padding: 4px 8px; border-radius: 6px; background: ${curBranch.color}25; border: 1px solid ${curBranch.color}60; color: #fff; font-size: 10px; font-weight: 700; flex-shrink: 0; white-space: nowrap;">
                Ver en Hub ↗
              </a>
            ` : '')}
          </div>
        `;
      })()}

      <!-- Quick Add Input -->
      <div class="notes-quick-input-box">
        <div class="notes-input-row">
          <input type="text" id="notesQuickInput" class="notes-input-field" placeholder="Añadir recordatorio o tarea... [Enter]" autocomplete="off">
          <button id="btnQuickAddTask" class="notes-add-btn">
            <span>+</span> Añadir
          </button>
        </div>
        <div class="notes-input-options">
          <div class="notes-branch-select-badge">
            <span>Rama AoE:</span>
            <select id="notesSelectBranch">
              ${branches.map(b => `
                <option value="${b.id}" ${this.activeBranch === b.id ? 'selected' : (this.activeBranch === 'all' && b.id === 'galpon' ? 'selected' : '')}>
                  ${b.icon} ${b.name}
                </option>
              `).join('')}
            </select>
          </div>
          <label style="display: flex; align-items: center; gap: 4px; color: #c084fc; font-size: 11px; cursor: pointer;">
            <input type="checkbox" id="notesCheckPersonal" style="cursor: pointer;">
            <span>👤 Personal</span>
          </label>
          <span style="color: #64748b; font-size: 10px; font-family: monospace;">[Enter ↵]</span>
        </div>
      </div>

      <!-- Task Items Scroll List -->
      <div class="notes-main-scroll" id="notesTasksContainer">
        ${activeTasks.length === 0 ? `
          <div class="notes-empty-state">
            <div class="notes-empty-icon">🌱</div>
            <div class="notes-empty-title">Sin tareas pendientes en esta rama</div>
            <div class="notes-empty-desc">Escribe arriba para registrar apuntes rápidos o checklists que debas revisar hoy.</div>
          </div>
        ` : `
          <!-- Tareas Pendientes -->
          ${pendingTasks.map(task => this.renderTaskItem(task)).join('')}

          <!-- Tareas Completadas -->
          ${completedTasks.length > 0 ? `
            <div style="font-size: 10px; font-family: monospace; color: #64748b; margin-top: 12px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between;">
              <span>COMPLETADAS (${completedTasks.length})</span>
            </div>
            ${completedTasks.map(task => this.renderTaskItem(task)).join('')}
          ` : ''}
        `}
      </div>
    `;
  }

  renderTaskItem(task) {
    const branch = this.data.branches.find(b => b.id === task.branchId) || { name: 'General', icon: '📌', color: '#94a3b8' };
    const dateFormatted = this.formatRelativeTime(task.createdAt);

    return `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
        <div class="task-checkbox-container">
          <input type="checkbox" class="task-checkbox-input" ${task.completed ? 'checked' : ''} data-action="toggle-task">
        </div>
        <div class="task-content">
          <span class="task-text">${this.escapeHTML(task.text)}</span>
          <div class="task-meta">
            <span class="task-branch-tag" style="border-color: ${branch.color}40; color: ${branch.color};">
              ${branch.icon} ${branch.name}
            </span>
            ${task.isPersonal ? '<span class="task-branch-tag" style="border-color: #a855f750; color: #c084fc;">👤 Personal</span>' : ''}
            <span>•</span>
            <span>${dateFormatted}</span>
          </div>
        </div>
        <button class="task-item-delete" data-action="delete-task" title="Eliminar apunte">&times;</button>
      </div>
    `;
  }

  renderScratchpadView() {
    return `
      <div class="notes-main-scroll" style="padding-bottom: 10px;">
        <div class="scratchpad-container">
          <textarea id="scratchpadTextarea" class="scratchpad-textarea" placeholder="Escribe aquí notas libres, números de contacto, cálculos o reflexiones del día...">${this.escapeHTML(this.data.scratchpad || '')}</textarea>
          <div class="scratchpad-status-bar">
            <div class="scratchpad-autosave-indicator">
              <span class="autosave-dot"></span>
              <span id="scratchpadAutosaveStatus">Autoguardado local activo</span>
            </div>
            <span>${(this.data.scratchpad || '').length} caracteres</span>
          </div>
        </div>
      </div>
    `;
  }

  bindDrawerActions() {
    // 1. Cerrar
    document.getElementById('btnCloseNotes')?.addEventListener('click', () => this.close());

    // 2. Exportar
    document.getElementById('btnExportNotes')?.addEventListener('click', () => this.exportNotes());

    // 3. Tab switching
    document.getElementById('tabNavTasks')?.addEventListener('click', () => {
      this.activeTab = 'tasks';
      this.render();
    });
    document.getElementById('tabNavScratchpad')?.addEventListener('click', () => {
      this.activeTab = 'scratchpad';
      this.render();
    });

    // 4. Branch filters
    document.querySelectorAll('.branch-pill[data-branch]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const branch = btn.getAttribute('data-branch');
        this.activeBranch = branch;
        this.render();
      });
    });

    // 5. Add custom branch
    document.getElementById('btnAddCustomBranch')?.addEventListener('click', () => {
      this.promptAddBranch();
    });

    // 6. Quick add task
    const inputField = document.getElementById('notesQuickInput');
    const branchSelect = document.getElementById('notesSelectBranch');
    const addBtn = document.getElementById('btnQuickAddTask');

    const handleAddTask = () => {
      const text = inputField?.value?.trim();
      if (!text) return;
      const branchId = branchSelect?.value || 'galpon';
      const isPersonal = document.getElementById('notesCheckPersonal')?.checked || false;

      this.data.tasks.unshift({
        id: 'task_' + Date.now(),
        text: text,
        branchId: branchId,
        isPersonal: isPersonal,
        completed: false,
        createdAt: Date.now()
      });

      this.saveData();
      this.render();
    };

    addBtn?.addEventListener('click', handleAddTask);
    inputField?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTask();
      }
    });

    // 7. Checkbox toggle & Delete task delegation
    const container = document.getElementById('notesTasksContainer');
    container?.addEventListener('click', (e) => {
      const target = e.target;
      const taskItem = target.closest('.task-item');
      if (!taskItem) return;
      const taskId = taskItem.getAttribute('data-task-id');
      const task = this.data.tasks.find(t => t.id === taskId);
      if (!task) return;

      if (target.matches('[data-action="toggle-task"]')) {
        task.completed = target.checked;
        this.saveData();
        this.render();
      } else if (target.matches('[data-action="delete-task"]') || target.closest('[data-action="delete-task"]')) {
        this.data.tasks = this.data.tasks.filter(t => t.id !== taskId);
        this.saveData();
        this.render();
      }
    });

    // 8. Scratchpad auto-save
    const textarea = document.getElementById('scratchpadTextarea');
    const statusText = document.getElementById('scratchpadAutosaveStatus');
    let debounceTimer = null;

    textarea?.addEventListener('input', () => {
      if (statusText) statusText.textContent = 'Guardando...';
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.data.scratchpad = textarea.value;
        this.saveData();
        if (statusText) statusText.textContent = 'Autoguardado local activo';
      }, 400);
    });

    // 9. Clear completed tasks
    document.getElementById('btnClearCompletedNotes')?.addEventListener('click', () => {
      const completedCount = this.data.tasks.filter(t => t.completed).length;
      if (completedCount === 0) return;
      if (confirm(`¿Eliminar las ${completedCount} tareas ya completadas?`)) {
        this.data.tasks = this.data.tasks.filter(t => !t.completed);
        this.saveData();
        this.render();
      }
    });
  }

  promptAddBranch() {
    const name = prompt('Nombre de la nueva rama / área de trabajo (ej: Invernadero 2, Compost):');
    if (!name || !name.trim()) return;

    const id = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (this.data.branches.some(b => b.id === id)) {
      alert('Ya existe una rama con ese nombre.');
      return;
    }

    const icons = ['📍', '⚙️', '📦', '🌽', '🐝', '🚜', '🌱', '☀️'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const colors = ['#38bdf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    this.data.branches.push({
      id: id,
      name: name.trim(),
      icon: randomIcon,
      color: randomColor
    });

    this.activeBranch = id;
    this.saveData();
    this.render();
  }

  exportNotes() {
    const dateStr = new Date().toISOString().split('T')[0];
    let content = `=== AGRITWIN - CUADERNO DE OPERACIONES (${dateStr}) ===\n`;
    content += `* Apuntes locales del operador (No consolidados)\n\n`;

    content += `--- TAREAS PENDIENTES ---\n`;
    const pending = this.data.tasks.filter(t => !t.completed);
    if (pending.length === 0) {
      content += `(Sin tareas pendientes)\n`;
    } else {
      pending.forEach(t => {
        const b = this.data.branches.find(br => br.id === t.branchId)?.name || 'General';
        content += `[ ] ${t.text} (Rama: ${b})\n`;
      });
    }

    content += `\n--- TAREAS COMPLETADAS ---\n`;
    const completed = this.data.tasks.filter(t => t.completed);
    completed.forEach(t => {
      const b = this.data.branches.find(br => br.id === t.branchId)?.name || 'General';
      content += `[X] ${t.text} (Rama: ${b})\n`;
    });

    content += `\n--- BLOC LIBRE (SCRATCHPAD) ---\n`;
    content += (this.data.scratchpad || '(Vacío)') + `\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agritwin_apuntes_${dateStr}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  formatRelativeTime(timestamp) {
    if (!timestamp) return 'Reciente';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora mismo';
    if (mins < 60) return `Hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  }

  escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
