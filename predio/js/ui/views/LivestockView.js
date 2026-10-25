/**
 * LivestockView.js
 * Vista modular desacoplada de Manejo Ganadero Multiespecie,
 * Pastoreo Racional Voisin (PRV), Ficha Clínica, Vacunas SAG y Biometría.
 */

export class LivestockView {
  constructor(uiController) {
    this.ui = uiController;
  }

  initGlobalHandlers() {
    window.selectAnimal = (animalId) => {
      this.ui.selectedAnimalId = animalId;
      this.ui.activeHouseTab = 'livestock';
      this.ui.openDrawer();
      this.ui.renderMainHouseDashboard();
      const animal = this.ui.livestockManager?.getAnimal(animalId);
      if (animal && this.ui.mapManager) {
        if (typeof this.ui.mapManager.flyToPosition === 'function') {
          this.ui.mapManager.flyToPosition(animal.x - 6, animal.y + 6, animal.z + 8, animal.x, animal.y, animal.z);
        } else if (typeof this.ui.mapManager.animateCamera === 'function') {
          this.ui.mapManager.animateCamera(
            new THREE.Vector3(animal.x - 6, animal.y + 6, animal.z + 8),
            new THREE.Vector3(animal.x, animal.y, animal.z),
            1000
          );
        }
      }
    };

    window.startRelocatingAnimal = (animalId) => {
      if (this.ui.livestockManager) {
        this.ui.livestockManager.startInteractiveRelocation(animalId);
      }
    };

    window.teleportAnimal = (animalId, preset) => {
      if (this.ui.livestockManager) {
        this.ui.livestockManager.teleportPreset(animalId, preset);
        this.ui.renderMainHouseDashboard();
      }
    };

    window.moveAnimalCoords = (animalId) => {
      const xInput = document.getElementById('edit_coord_x');
      const zInput = document.getElementById('edit_coord_z');
      if (xInput && zInput && this.ui.livestockManager) {
        const x = parseFloat(xInput.value) || 0;
        const z = parseFloat(zInput.value) || 0;
        this.ui.livestockManager.relocateAnimal(animalId, x, z);
        this.ui.renderMainHouseDashboard();
      }
    };

    window.saveAnimalData = (animalId) => {
      const name = document.getElementById('edit_animal_name')?.value;
      const tag = document.getElementById('edit_animal_tag')?.value;
      const breed = document.getElementById('edit_animal_breed')?.value;
      const weight = parseFloat(document.getElementById('edit_animal_weight')?.value) || 0;
      const dailyGain = parseFloat(document.getElementById('edit_animal_dailygain')?.value) || 0;
      const ageMonths = parseInt(document.getElementById('edit_animal_agemonths')?.value) || 0;
      const birthDate = document.getElementById('edit_animal_birthdate')?.value || '';
      const waterLDay = parseFloat(document.getElementById('edit_animal_water')?.value) || 0;
      const dryMatterKgDay = parseFloat(document.getElementById('edit_animal_drymatter')?.value) || 0;
      const freshForageKgDay = parseFloat(document.getElementById('edit_animal_freshforage')?.value) || 0;
      const bodyCondition = document.getElementById('edit_animal_bodycondition')?.value || '';
      const diioSag = document.getElementById('edit_animal_diio')?.value || '';
      const health = document.getElementById('edit_animal_health')?.value;
      const category = document.getElementById('edit_animal_category')?.value;
      const notes = document.getElementById('edit_animal_notes')?.value;

      if (this.ui.livestockManager) {
        this.ui.livestockManager.updateAnimalData(animalId, {
          name, tag, breed, weightKg: weight, dailyGainKg: dailyGain,
          ageMonths, birthDate, waterLDay, dryMatterKgDay, freshForageKgDay,
          bodyCondition, diioSag, health, category, notes
        });
        this.ui.renderMainHouseDashboard();
      }
    };

    window.addAnimalVaccine = (animalId) => {
      const vacName = prompt('Nombre de la Vacuna SAG a Registrar (ej: Clostridiosis 8 Vías, Carbunclo, Aftosa):');
      if (!vacName || !vacName.trim()) return;
      const date = prompt('Fecha de Aplicación (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
      const dose = prompt('Dosis y Vía de Administración (ej: 5 ml Subcutánea):', '5 ml Subcutánea');
      const lot = prompt('Lote Oficial SAG / Serie:', 'SAG-2026-' + Math.floor(1000 + Math.random() * 9000));
      const booster = prompt('Próximo Refuerzo (ej: Anual / 6 meses):', 'Anual (2027)');
      const vet = prompt('Médico Veterinario SAG Responsable:', 'Dra. Camila Morales (SAG Maule)');

      if (this.ui.livestockManager) {
        this.ui.livestockManager.addVaccine(animalId, {
          name: vacName.trim(),
          date: date || new Date().toISOString().split('T')[0],
          dose: dose || '5 ml SC',
          lot: lot || 'L-2026-X',
          booster: booster || 'Anual',
          vet: vet || 'Dr. Veterinario SAG'
        });
        this.ui.renderMainHouseDashboard();
      }
    };

    window.addAnimalMedicalRecord = (animalId) => {
      const procName = prompt('Procedimiento Médico / Clínico (ej: Desparasitación Ivermectina 1%, Despalme Podal, Ecografía):');
      if (!procName || !procName.trim()) return;
      const date = prompt('Fecha de Realización (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
      const withdrawal = parseInt(prompt('Días de Resguardo / Retiro (leche/carne en días, 0 si no aplica):', '0')) || 0;
      const vet = prompt('Médico Veterinario / Clínico Responsable:', 'Dr. Marcelo Rivas MV');
      const notes = prompt('Notas / Observaciones Clínicas:', 'Evolución favorable, sin signos de reacción adversa.');

      if (this.ui.livestockManager) {
        this.ui.livestockManager.addMedicalProcedure(animalId, {
          procedure: procName.trim(),
          date: date || new Date().toISOString().split('T')[0],
          withdrawalDays: withdrawal,
          vet: vet || 'Dr. Marcelo Rivas MV',
          status: 'Completado',
          notes: notes || 'Procedimiento ejecutado conforme a protocolo.'
        });
        this.ui.renderMainHouseDashboard();
      }
    };
  }

  renderTab() {
    const paddocks = (this.ui.livestockManager && this.ui.livestockManager.paddocks) ? this.ui.livestockManager.paddocks : [
      { id: 'P1', name: 'Potrero 1 - Trébol Blanco & Festuca', restDays: 44, forrajeCm: 24, kgMsHa: 2850, status: 'ready', badge: 'Listo (44d)' },
      { id: 'P2', name: 'Potrero 2 - Alfalfa & Raygrass', restDays: 41, forrajeCm: 22, kgMsHa: 2600, status: 'ready', badge: 'Listo (41d)' },
      { id: 'P3', name: 'Potrero 3 - Pastura Sur-Oeste (Vacas)', restDays: 1, forrajeCm: 25, kgMsHa: 3100, status: 'active', badge: 'Ocupado (1d)' },
      { id: 'P4', name: 'Potrero 4 - Silvopastoreo Borde Cerezos', restDays: 32, forrajeCm: 18, kgMsHa: 1950, status: 'resting', badge: 'Reposo (32d)' },
      { id: 'P5', name: 'Potrero 5 - Trébol Subterráneo (Ovejas)', restDays: 24, forrajeCm: 16, kgMsHa: 1750, status: 'resting', badge: 'Reposo (24d)' },
      { id: 'P6', name: 'Potrero 6 - Pradera Regenerativa Este', restDays: 16, forrajeCm: 12, kgMsHa: 1250, status: 'resting', badge: 'Reposo (16d)' },
      { id: 'P7', name: 'Potrero 7 - Franja Sur (Caballos)', restDays: 8, forrajeCm: 10, kgMsHa: 950, status: 'resting', badge: 'Rebrote (8d)' },
      { id: 'P8', name: 'Potrero 8 - Cuadro Nor-Este (Gallinero)', restDays: 4, forrajeCm: 8, kgMsHa: 750, status: 'coop', badge: 'Gallinero (4d)' }
    ];

    const currentPaddock = paddocks.find(p => p.id === (this.ui.selectedPaddockId || 'P3')) || paddocks[2];

    // Obtener lista completa de animales
    const allAnimals = this.ui.livestockManager ? this.ui.livestockManager.getAllAnimals() : [];
    const activeAnimal = (this.ui.selectedAnimalId && this.ui.livestockManager) ? 
      (this.ui.livestockManager.getAnimal(this.ui.selectedAnimalId) || allAnimals[0]) : (allAnimals[0] || null);

    return `
      <!-- 0. Header con Retorno a Menú Predio y Badge -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <button onclick="window.inspectPredioHouse()" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(180, 83, 9, 0.35)); border: 1px solid #f59e0b; border-radius: 8px; color: #fde047; font-size: 11px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.3); transition: all 0.2s;" onmouseover="this.style.background='rgba(245,158,11,0.4)'" onmouseout="this.style.background='linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(180, 83, 9, 0.35))'" title="Volver al Menú Principal del Predio (Metabolismo / Casa)">
          <span>🏡</span> ‹ Volver al Menú de Predio
        </button>
        <span class="panel-id-tag" style="font-size: 8px; padding: 2px 5px; background: rgba(0,0,0,0.5); border: 1px solid rgba(245,158,11,0.4); color: #fbbf24; border-radius: 4px; font-family: monospace; font-weight: bold;">[PANEL-FICHA-ANIMAL]</span>
      </div>

      <!-- 1. Herd Overview Banner -->
      <div class="glass-card" style="border-left: 4px solid #f59e0b; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-family: monospace; color: #f59e0b; font-weight: 700;">[PASTOREO RACIONAL VOISIN • PRV]</span>
          <span class="status-badge optimal" style="font-size: 10px;">🟢 Carga: 1.8 UGM/ha</span>
        </div>
        <div style="font-size: 14px; font-weight: 800; color: #fff; margin-top: 4px;">
          🐄 Manejo Ganadero Multiespecie & Ficha Clínica
        </div>
        <div style="margin-top: 8px; display: flex; gap: 8px;">
          <button onclick="window.openAgriEstabloAdvisorsModal && window.openAgriEstabloAdvisorsModal()" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.4)); border: 1px solid #f59e0b; border-radius: 6px; color: #fde047; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(245, 158, 11, 0.5)'" onmouseout="this.style.background='linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.4))'" title="Consultar Consejo de Asesores del Establo (Dra. Javiera Montecinos, Don Gastón Fuenzalida, Ignacio Subercaseaux)">
            <span>🧠</span> <strong>Consejo Asesor Establo (3)</strong>
          </button>
        </div>
      </div>

      <!-- 1b. [ATMÓSFERA UNIFICADA]: OpenWeatherMap API + Simulación Maule (Sub-rama Establo & Animales) -->
      <div class="glass-card" style="border-left: 4px solid #f59e0b; padding: 12px; margin-top: 10px; background: rgba(245, 158, 11, 0.06);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 800; color: #fbbf24; font-family: monospace; letter-spacing: 0.05em;">[ATMÓSFERA UNIFICADA] • OpenWeatherMap + Maule</span>
          <span style="font-size: 9px; font-family: monospace; background: rgba(245, 158, 11, 0.2); color: #fde047; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.4);">CONFORT ANIMAL & THI</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-bottom: 8px;">
          <div style="background: rgba(0,0,0,0.35); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="color: #94a3b8; font-size: 9px; font-family: monospace;">MACRO-CLIMA & VIENTO PUELCHE</div>
            <div style="font-size: 13px; font-weight: 800; color: #fff; margin-top: 2px;">18.5°C • 56% HR</div>
            <div style="font-size: 9.5px; color: #fbbf24; margin-top: 2px;">💨 Ráfaga: 14.2 km/h ENE (Puelche)</div>
          </div>
          <div style="background: rgba(0,0,0,0.35); padding: 8px; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.3);">
            <div style="color: #fde047; font-size: 9px; font-family: monospace;">ÍNDICE ESTRÉS TÉRMICO (ITH/THI)</div>
            <div style="font-size: 13px; font-weight: 800; color: #10b981; margin-top: 2px;">64.2 • Zona de Confort</div>
            <div style="font-size: 9.5px; color: #6ee7b7; margin-top: 2px;">🛡️ Sin estrés calórico en galpón</div>
          </div>
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button onclick="window.openGalponWorkshop && window.openGalponWorkshop('establo')" style="flex: 1; min-width: 140px; padding: 6px 10px; background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fde047; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
            <span>📟</span> Abrir Sub-Caja Establo (Relés)
          </button>
          <button onclick="window.triggerSimRain && window.triggerSimRain()" style="padding: 6px 10px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #7dd3fc; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>🌧️</span> Probar Lluvia 3D
          </button>
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
          <div style="margin-top: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10px; color: #94a3b8; font-weight: 700;">Seleccionar Ejemplar:</span>
              <span class="panel-id-tag" style="font-size: 8px; padding: 2px 4px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; border-radius: 4px; font-family: monospace; font-weight: bold;">[PANEL-REBAÑO-LIST]</span>
            </div>
            <div style="display: flex; gap: 4px; overflow-x: auto; padding: 2px 0 6px; scrollbar-width: none;">
              ${allAnimals.map(a => `
                <button onclick="window.selectAnimal('${a.id}')" style="padding: 4px 8px; font-size: 10px; border-radius: 6px; border: 1px solid ${a.id === activeAnimal.id ? '#f59e0b' : 'rgba(255,255,255,0.1)'}; background: ${a.id === activeAnimal.id ? '#b45309' : 'rgba(255,255,255,0.04)'}; color: #fff; cursor: pointer; white-space: nowrap; font-weight: ${a.id === activeAnimal.id ? '700' : '500'};">
                  ${a.icon} ${a.name.split(' ')[0]}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Grid de Variables Críticas de Monitoreo -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 8px;">
            <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 6px 8px;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Edad & F. Nac</div>
              <div style="font-size: 12px; font-weight: 800; color: #fde047;">${activeAnimal.ageMonths || 36}m <span style="font-size: 9px; color: #94a3b8;">(${((activeAnimal.ageMonths || 36)/12).toFixed(1)}a)</span></div>
              <div style="font-size: 8px; color: #64748b;">${activeAnimal.birthDate || '2023-09-15'}</div>
            </div>
            <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 6px 8px;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Peso Vivo & GMD</div>
              <div style="font-size: 12px; font-weight: 800; color: #38bdf8;">${activeAnimal.weightKg} kg</div>
              <div style="font-size: 8px; color: #10b981;">GMD: +${activeAnimal.dailyGainKg || 0.75} kg/d</div>
            </div>
            <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 6px 8px;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Agua Diaria</div>
              <div style="font-size: 12px; font-weight: 800; color: #06b6d4;">${activeAnimal.waterLDay || 65} <span style="font-size: 9px;">L/d</span></div>
              <div style="font-size: 8px; color: #64748b;">Abrev. Keyline</div>
            </div>
            <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 6px 8px;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Kilos Comida MS</div>
              <div style="font-size: 12px; font-weight: 800; color: #a3e635;">${activeAnimal.dryMatterKgDay || 14.5} <span style="font-size: 9px;">kg MS/d</span></div>
              <div style="font-size: 8px; color: #64748b;">${activeAnimal.freshForageKgDay || 68} kg MV/d</div>
            </div>
            <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 6px 8px;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">DIIO SAG Oficial</div>
              <div style="font-size: 10px; font-weight: 800; color: #f59e0b; font-family: monospace;">${activeAnimal.diioSag || activeAnimal.tag || 'CL-07-219-0142'}</div>
              <div style="font-size: 8px; color: #10b981;">Trazable SAG</div>
            </div>
            <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 6px 8px;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Cond. Corporal</div>
              <div style="font-size: 12px; font-weight: 800; color: #f472b6;">${activeAnimal.bodyCondition || '3.5 / 5.0'}</div>
              <div style="font-size: 8px; color: #64748b;">Rumen: 38.6°C</div>
            </div>
          </div>

          <!-- Campos Editables de Datos -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px;">
            <div>
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Nombre Identificador</label>
              <input id="edit_animal_name" value="${activeAnimal.name}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #fff; font-size: 11px; padding: 4px 6px;">
            </div>
            <div>
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Caravana / Tag</label>
              <input id="edit_animal_tag" value="${activeAnimal.tag}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #fde047; font-family: monospace; font-size: 11px; padding: 4px 6px;">
            </div>
            <div>
              <label style="font-size: 9px; color: var(--text-muted); display: block;">DIIO SAG Oficial</label>
              <input id="edit_animal_diio" value="${activeAnimal.diioSag || activeAnimal.tag || 'CL-07-219-0142'}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #f59e0b; font-family: monospace; font-size: 11px; padding: 4px 6px;">
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
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Ganancia Diaria (kg/d)</label>
              <input type="number" step="0.05" id="edit_animal_dailygain" value="${activeAnimal.dailyGainKg || 0.75}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #10b981; font-size: 11px; padding: 4px 6px;">
            </div>
            <div>
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Edad (meses)</label>
              <input type="number" id="edit_animal_agemonths" value="${activeAnimal.ageMonths || 36}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #fde047; font-size: 11px; padding: 4px 6px;">
            </div>
            <div>
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Fecha Nacimiento</label>
              <input id="edit_animal_birthdate" value="${activeAnimal.birthDate || '2023-09-15'}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #cbd5e1; font-size: 11px; padding: 4px 6px;">
            </div>
            <div>
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Agua Diaria (L/d)</label>
              <input type="number" id="edit_animal_water" value="${activeAnimal.waterLDay || 65}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #06b6d4; font-size: 11px; padding: 4px 6px;">
            </div>
            <div>
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Comida Forraje (kg MS/d)</label>
              <input type="number" step="0.1" id="edit_animal_drymatter" value="${activeAnimal.dryMatterKgDay || 14.5}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #a3e635; font-size: 11px; padding: 4px 6px;">
            </div>
            <div>
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Condición Corporal</label>
              <input id="edit_animal_bodycondition" value="${activeAnimal.bodyCondition || '3.5 / 5.0'}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #f472b6; font-size: 11px; padding: 4px 6px;">
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
            <div style="grid-column: span 2;">
              <label style="font-size: 9px; color: var(--text-muted); display: block;">Categoría / Destino</label>
              <input id="edit_animal_category" value="${activeAnimal.category}" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #fff; font-size: 11px; padding: 4px 6px;">
            </div>
          </div>

          <div style="margin-top: 6px;">
            <label style="font-size: 9px; color: var(--text-muted); display: block;">Notas Veterinarias & Manejo</label>
            <textarea id="edit_animal_notes" rows="2" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #cbd5e1; font-size: 10px; padding: 4px 6px; resize: none;">${activeAnimal.notes || ''}</textarea>
          </div>

          <!-- Historial de Vacunación Oficial SAG -->
          <div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 12px;">💉</span>
                <strong style="font-size: 11px; color: #f8fafc;">Historial de Vacunación SAG</strong>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="panel-id-tag" style="font-size: 8px; padding: 1px 4px; background: rgba(0,0,0,0.5); border: 1px solid rgba(56,189,248,0.4); color: #38bdf8; border-radius: 4px; font-family: monospace; font-weight: bold;">[PANEL-FICHA-VACUNAS]</span>
                <button onclick="window.addAnimalVaccine('${activeAnimal.id}')" style="padding: 2px 7px; font-size: 9px; background: #0284c7; color: #fff; border: 1px solid #38bdf8; border-radius: 4px; cursor: pointer; font-weight: 700;">
                  ➕ Registrar Vacuna
                </button>
              </div>
            </div>
            ${(activeAnimal.vaccines && activeAnimal.vaccines.length > 0) ? `
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${activeAnimal.vaccines.map(v => `
                  <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 5px 8px; border-radius: 6px; font-size: 10px;">
                    <div>
                      <strong style="color: #fde047;">${v.name}</strong>
                      <div style="font-size: 9px; color: #94a3b8;">${v.dose} • Lote: ${v.lot || 'L-2026'} • ${v.vet || 'Vet SAG'}</div>
                    </div>
                    <div style="text-align: right;">
                      <span style="color: #38bdf8; font-family: monospace;">${v.date}</span>
                      <div style="font-size: 8px; color: #10b981;">Refuerzo: ${v.booster || 'Anual'}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="font-size: 10px; color: #64748b; font-style: italic;">Sin registros de vacunación ingresados. Clic en 'Registrar Vacuna'.</div>
            `}
          </div>

          <!-- Historial Clínico & Procedimientos Médicos -->
          <div style="margin-top: 8px; padding: 10px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 12px;">🩺</span>
                <strong style="font-size: 11px; color: #f8fafc;">Procedimientos Médicos & Clínicos</strong>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="panel-id-tag" style="font-size: 8px; padding: 1px 4px; background: rgba(0,0,0,0.5); border: 1px solid rgba(16,185,129,0.4); color: #34d399; border-radius: 4px; font-family: monospace; font-weight: bold;">[PANEL-FICHA-CLINICA]</span>
                <button onclick="window.addAnimalMedicalRecord('${activeAnimal.id}')" style="padding: 2px 7px; font-size: 9px; background: #047857; color: #fff; border: 1px solid #10b981; border-radius: 4px; cursor: pointer; font-weight: 700;">
                  ➕ Registrar Procedimiento
                </button>
              </div>
            </div>
            ${(activeAnimal.medicalProcedures && activeAnimal.medicalProcedures.length > 0) ? `
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${activeAnimal.medicalProcedures.map(m => `
                  <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 5px 8px; border-radius: 6px; font-size: 10px;">
                    <div>
                      <strong style="color: #86efac;">${m.procedure}</strong>
                      <div style="font-size: 9px; color: #cbd5e1;">${m.notes || ''}</div>
                      <div style="font-size: 8px; color: #94a3b8;">${m.vet || 'Dr. Marcelo Rivas MV'} • Resguardo: ${m.withdrawalDays ? m.withdrawalDays + ' días retiro' : '0 días (sin resguardo)'}</div>
                    </div>
                    <div style="text-align: right;">
                      <span style="color: #38bdf8; font-family: monospace;">${m.date}</span>
                      <div style="font-size: 8px; color: #fde047;">${m.status || 'Completado'}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="font-size: 10px; color: #64748b; font-style: italic;">Sin intervenciones clínicas recientes.</div>
            `}
          </div>

          <!-- Coordenadas Georreferenciadas & Herramienta Mover -->
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.15);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">
                📍 Terreno: X: <strong style="color: #fff;">${activeAnimal.x.toFixed(1)}</strong>, Z: <strong style="color: #fff;">${activeAnimal.z.toFixed(1)}</strong> | Cota: <strong style="color: #38bdf8;">${activeAnimal.y.toFixed(2)}m</strong>
              </span>
              <button onclick="window.saveAnimalData('${activeAnimal.id}')" style="padding: 4px 10px; font-size: 10px; background: #047857; color: #fff; border: 1px solid #10b981; border-radius: 4px; cursor: pointer; font-weight: 700;">
                💾 Guardar Ficha Completa
              </button>
            </div>

            <!-- Botón de Reubicación Interactiva en 3D -->
            <button onclick="window.startRelocatingAnimal('${activeAnimal.id}')" style="width: 100%; padding: 7px 12px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(180, 83, 9, 0.4)); border: 1px solid #f59e0b; border-radius: 6px; color: #fde047; font-weight: 700; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px;">
              <span>🎯</span>
              <span>Mover / Reubicar en el Terreno 3D (Clic en mapa)</span>
            </button>

            <!-- Accesos directos a sectores del predio -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 9px; color: #94a3b8;">Teletransportar a sector:</span>
              <span class="panel-id-tag" style="font-size: 8px; padding: 1px 4px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; border-radius: 4px; font-family: monospace; font-weight: bold;">[PANEL-ANIMAL-PRESETS]</span>
            </div>
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
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="panel-id-tag" style="font-size: 8px; padding: 2px 4px; background: rgba(0,0,0,0.5); border: 1px solid rgba(245,158,11,0.4); color: #f59e0b; border-radius: 4px; font-family: monospace; font-weight: bold;">[PANEL-POTREROS-PRV]</span>
            <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">Clic en 'Mover 🐄'</span>
          </div>
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
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
        <span style="font-size: 10px; color: #94a3b8; font-weight: 700;">Instalaciones Móviles de Pastoreo:</span>
        <span class="panel-id-tag" style="font-size: 8px; padding: 2px 4px; background: rgba(0,0,0,0.5); border: 1px solid rgba(56,189,248,0.4); color: #38bdf8; border-radius: 4px; font-family: monospace; font-weight: bold;">[PANEL-MANEJO-MOVIL]</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;">
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
}

