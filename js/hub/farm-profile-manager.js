/**
 * AgriTwin Hub - FarmProfileManager
 * 
 * Gestiona el sistema Multi-Usuario / Multi-Predio del Hub y su propagación
 * hacia las 6 Ramas del Territorio.
 * 
 * Separa estrictamente:
 * 1. Lo Inmutable / Doctrina (Cómo funciona la app, principios, algoritmos y métodos)
 * 2. Lo Particular (Datos específicos del mapa, polígonos, sensores y bitácora)
 * 3. Datos Transversales (Permacultura Zonas 0-5 y Keyline que cruzan las 6 ramas)
 * 4. Datos Verticales (Predio que sostiene al Establo y al Invernadero)
 */

(function(window) {
  class FarmProfileManager {
    constructor() {
      this.storageKey = 'agritwin_profiles_v2';
      this.activeKey = 'agritwin_active_profile_v2';
      
      // Punto representativo central: Casa Patronal / El Galpón (Zona 0)
      this.CASA_ORIGIN = { lat: -36.2115, lon: -71.6050 };

      // Perfil de Referencia Maestro (Pre-poblado al 100%)
      this.defaultMenielProfile = {
        id: 'meniel',
        userName: 'Familia Meniel & AgroTech',
        farmName: 'Fundo Meniel',
        location: 'Sector Río Longaví (Parral - Retiro), Maule, Chile',
        coordinates: { lat: -36.2115, lon: -71.6050, refPoint: 'Casa Patronal / Galpón (Zona 0: 0m E, 0m N)' },
        areaHa: 24.8,
        rolSii: '142-88 Retiro',
        isReference: true,
        created: '2026-09-25T00:00:00.000Z',
        status: 'active',
        description: 'Predio de referencia agroecológico de alta resolución (24.8 ha) con coordenadas relativas a la Casa Patronal (Zona 0), 8 cuarteles, parque agrovoltaico, tranque Keyline 18.500 m³ y manejo PRV.',
        
        // Matriz de las 6 Ramas (Instancia Particular de Meniel)
        branches: {
          predio: {
            configured: true,
            parcelsCount: 8,
            waterStorageM3: 18500,
            solarKwp: 9.9,
            sensorsCount: 6,
            statusLabel: 'Operativo 100% (24.8 ha)'
          },
          vecinal: {
            configured: true,
            communityFarms: 10,
            firebreakMeters: 450,
            daoPactStatus: 'Activo',
            statusLabel: 'Mosaico 508 ha'
          },
          cuenca: {
            configured: true,
            river: 'Río Longaví',
            basinAreaHa: 122070,
            fwiRisk: 'Moderado (24)',
            statusLabel: 'Alerta Puelche OK'
          },
          establo: {
            configured: true,
            animalsCount: 24,
            prvPaddocks: 8,
            dailyForageKgMs: 380,
            statusLabel: '8 Potreros PRV'
          },
          invernadero: {
            configured: true,
            varietiesCount: 16,
            biofactoryActive: true,
            fdrSoilMoisturePct: 36.2,
            statusLabel: 'Biofábrica Activa'
          },
          excursion: {
            configured: true,
            soilPitsCount: 4,
            organicMatterPct: 6.8,
            cameraTrapsCount: 4,
            statusLabel: 'Rewilding Activo'
          }
        },

        // Capa Transversal: Permacultura Holística (Mollison Zonas 0-5 & Yeomans Keyline)
        transversal: {
          mollisonZones: ['Zona 0: Casa', 'Zona 1: Biointensivo', 'Zona 2: Frutales', 'Zona 3: Praderas', 'Zona 4: Silvopastoril', 'Zona 5: Reserva'],
          keylineMasterWaterline: 'Cota 182m a tranque 18.5k m³',
          soilCarbonFixedTC: 44.5,
          waterHarvestAnnualLiters: 240000
        }
      };

      this.profiles = this.loadProfiles();
      this.activeProfileId = this.loadActiveProfileId();
    }

    loadProfiles() {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            if (!parsed.meniel) {
              parsed.meniel = this.defaultMenielProfile;
            }
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Error loading profiles from localStorage', e);
      }
      return { meniel: this.defaultMenielProfile };
    }

    saveProfiles() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.profiles));
      } catch (e) {
        console.warn('Error saving profiles to localStorage', e);
      }
    }

    loadActiveProfileId() {
      try {
        const active = localStorage.getItem(this.activeKey);
        if (active && this.profiles[active]) {
          return active;
        }
      } catch (e) {
        console.warn('Error loading active profile id', e);
      }
      return 'meniel';
    }

    getActiveProfile() {
      return this.profiles[this.activeProfileId] || this.defaultMenielProfile;
    }

    setActiveProfile(profileId) {
      if (!this.profiles[profileId]) return false;
      this.activeProfileId = profileId;
      try {
        localStorage.setItem(this.activeKey, profileId);
      } catch (e) {
        console.warn('Error saving active profile id', e);
      }

      const currentProfile = this.getActiveProfile();
      this.updateHeaderUI(currentProfile);
      this.broadcastProfileChange(currentProfile);
      return true;
    }

    createProfile(formData) {
      const id = 'farm_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
      const newProfile = {
        id,
        userName: formData.userName || 'Nuevo Agricultor',
        farmName: formData.farmName || 'Nuevo Predio',
        location: formData.location || 'Chile Central',
        coordinates: formData.coordinates || { lat: -36.14, lon: -71.82 },
        areaHa: parseFloat(formData.areaHa) || 10.0,
        rolSii: formData.rolSii || 'S/N',
        isReference: false,
        created: new Date().toISOString(),
        status: 'bootstrap',
        description: formData.description || 'Predio recién inicializado en AgriTwin Suite.',

        // Ramas en modo Semilla (Bootstrap)
        branches: {
          predio: {
            configured: false,
            parcelsCount: 0,
            waterStorageM3: 0,
            solarKwp: 0,
            sensorsCount: 0,
            statusLabel: 'Lienzo Semilla (Sin Polígonos)'
          },
          vecinal: {
            configured: false,
            communityFarms: 0,
            firebreakMeters: 0,
            daoPactStatus: 'Por Iniciar',
            statusLabel: 'Esperando Vecinos'
          },
          cuenca: {
            configured: true, // Datos públicos orográficos disponibles
            river: 'Cuenca Local',
            basinAreaHa: 100000,
            fwiRisk: 'Consultando DGA',
            statusLabel: 'Monitoreo Público OK'
          },
          establo: {
            configured: false,
            animalsCount: 0,
            prvPaddocks: 0,
            dailyForageKgMs: 0,
            statusLabel: 'Planificación Pecuaria'
          },
          invernadero: {
            configured: false,
            varietiesCount: 0,
            biofactoryActive: false,
            fdrSoilMoisturePct: 0,
            statusLabel: 'Por Configurar'
          },
          excursion: {
            configured: false,
            soilPitsCount: 0,
            organicMatterPct: 0,
            cameraTrapsCount: 0,
            statusLabel: 'Calicatas Pendientes'
          }
        },

        transversal: {
          mollisonZones: ['Pendiente de Delimitar en Rama 1'],
          keylineMasterWaterline: 'Cálculo de Curvas de Nivel Disponible',
          soilCarbonFixedTC: 0,
          waterHarvestAnnualLiters: 0
        }
      };

      this.profiles[id] = newProfile;
      this.saveProfiles();
      this.setActiveProfile(id);
      return newProfile;
    }

    broadcastProfileChange(profile) {
      const payload = {
        type: 'SYNC_BRANCH_STATE',
        action: 'SET_ACTIVE_PROFILE',
        profile: {
          id: profile.id,
          farmName: profile.farmName,
          userName: profile.userName,
          areaHa: profile.areaHa,
          isReference: profile.isReference,
          status: profile.status,
          branches: profile.branches,
          transversal: profile.transversal
        }
      };

      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          iframe.contentWindow?.postMessage(payload, '*');
        } catch (e) {
          console.warn('Error broadcasting profile to iframe', e);
        }
      });

      window.dispatchEvent(new CustomEvent('agritwin:profileChanged', { detail: profile }));
    }

    updateHeaderUI(profile) {
      const farmNameEl = document.getElementById('headerProfileFarmName');
      const userNameEl = document.getElementById('headerProfileUserName');
      if (farmNameEl) farmNameEl.textContent = profile.farmName;
      if (userNameEl) userNameEl.textContent = profile.userName + ' • ' + (profile.isReference ? 'Demo Maestro' : 'Predio Propio');
    }

    renderSplashConsole() {
      const container = document.getElementById('splashProfileConsoleContainer');
      if (!container) return;

      const currentProfile = this.getActiveProfile();
      const profileIds = Object.keys(this.profiles);

      let otherProfilesHTML = '';
      profileIds.forEach(pid => {
        if (pid === 'meniel') return;
        const p = this.profiles[pid];
        const isSelected = p.id === currentProfile.id;
        otherProfilesHTML += `
          <div onclick="window.farmProfileManager.selectAndEnterProfile('${p.id}')" class="p-3 rounded-xl ${isSelected ? 'bg-amber-500/20 border-amber-500' : 'bg-stone-900/60 border-stone-800 hover:border-amber-500/40'} border transition-all cursor-pointer flex items-center justify-between text-left">
            <div>
              <div class="text-xs font-bold text-amber-300 font-serif">${p.farmName}</div>
              <div class="text-[10px] text-stone-400 font-mono">${p.location} • ${p.areaHa} ha</div>
            </div>
            <span class="text-xs font-mono font-bold text-amber-400">Entrar ➔</span>
          </div>
        `;
      });

      container.innerHTML = `
        <div class="w-full max-w-xl mx-auto bg-[#180f08]/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-amber-600/40 shadow-2xl text-center space-y-4">
          
          <!-- Título del Pórtico -->
          <div>
            <div class="text-[10px] font-mono font-bold text-amber-400/90 tracking-widest uppercase flex items-center justify-center gap-2">
              <span>🌳</span>
              <span>CONSOLA DE ACCESO TERRITORIAL • 6 VERTIENTES</span>
              <span>🌳</span>
            </div>
            <h2 class="text-lg sm:text-xl font-bold text-stone-100 font-serif mt-1">Seleccionar o Crear Predio de Trabajo</h2>
            <p class="text-[11px] text-stone-300 font-sans max-w-md mx-auto mt-0.5">
              Sincroniza los polígonos, telemetría y modelos biofísicos de las 6 ramas bajo el Principio Árbol.
            </p>
          </div>

          <!-- Matriz de Acceso: Tarjeta Meniel + Botón Nuevo Predio + Botón Cuenca -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            
            <!-- Opción 1: Fundo Meniel (Predio Maestro de Referencia) -->
            <div onclick="window.farmProfileManager.selectAndEnterProfile('meniel')" class="p-4 rounded-2xl bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/50 hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between group shadow-lg">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-2xl">🏡</span>
                  <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Demo Maestro 100%</span>
                </div>
                <h3 class="text-sm font-bold text-amber-200 font-serif mt-2 group-hover:text-amber-100">Fundo Meniel</h3>
                <p class="text-[10px] text-stone-300 mt-1 line-clamp-2">
                  Parral–Retiro • 24.8 ha (Rol 142-88), Casa Patronal (Zona 0), 8 cuarteles, tranque 18.5k m³ y PRV.
                </p>
                <div class="mt-2.5 flex items-center gap-1.5 flex-wrap text-[9px] font-mono text-amber-400/80">
                  <span class="bg-black/40 px-1.5 py-0.5 rounded">6 Ramas</span>
                  <span class="bg-black/40 px-1.5 py-0.5 rounded">Keyline</span>
                </div>
              </div>
              <button class="mt-3 w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-all shadow flex items-center justify-center gap-1 cursor-pointer">
                <span>Cargar Meniel</span> <span>➔</span>
              </button>
            </div>

            <!-- Opción 2: Macro-Cuenca Río Longaví (Digital Twin 122.070 ha) -->
            <div onclick="window.openCuencaDirectFromSplash()" class="p-4 rounded-2xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/60 hover:border-sky-400 transition-all cursor-pointer flex flex-col justify-between group shadow-lg">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-2xl">🏔️</span>
                  <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/30 text-sky-200 border border-sky-400/50">Macro-Cuenca</span>
                </div>
                <h3 class="text-sm font-bold text-sky-200 font-serif mt-2 group-hover:text-sky-100">Gemelo de Cuenca</h3>
                <p class="text-[10px] text-stone-300 mt-1 line-clamp-2">
                  122.070 ha • Embalse Bullileo 110 hm³, Río Longaví, radar Sentinel-2, FWI Puelche y balance hidrológico.
                </p>
                <div class="mt-2.5 flex items-center gap-1.5 flex-wrap text-[9px] font-mono text-sky-300/80">
                  <span class="bg-black/40 px-1.5 py-0.5 rounded">Sentinel-2</span>
                  <span class="bg-black/40 px-1.5 py-0.5 rounded">Bullileo</span>
                </div>
              </div>
              <button class="mt-3 w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition-all shadow flex items-center justify-center gap-1 cursor-pointer">
                <span>Explorar Cuenca</span> <span>➔</span>
              </button>
            </div>

            <!-- Opción 3: Registrar / Crear Nuevo Predio -->
            <div onclick="window.farmProfileManager.openCreateForm()" class="p-4 rounded-2xl bg-stone-900/60 hover:bg-stone-900/80 border border-stone-700 hover:border-teal-400/60 transition-all cursor-pointer flex flex-col justify-between group shadow-lg">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-2xl">🌱</span>
                  <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">Semilla / Virgen</span>
                </div>
                <h3 class="text-sm font-bold text-teal-200 font-serif mt-2 group-hover:text-teal-100">+ Nuevo Predio</h3>
                <p class="text-[10px] text-stone-300 mt-1 line-clamp-2">
                  Inicializa un gemelo en blanco listo para dibujar con el dock 3D, subir Shapefile o vincular Rol SII.
                </p>
                <div class="mt-2.5 flex items-center gap-1.5 flex-wrap text-[9px] font-mono text-teal-400/80">
                  <span class="bg-black/40 px-1.5 py-0.5 rounded">Lienzo Semilla</span>
                  <span class="bg-black/40 px-1.5 py-0.5 rounded">Shapefile</span>
                </div>
              </div>
              <button class="mt-3 w-full py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-mono text-xs font-bold transition-all shadow flex items-center justify-center gap-1 cursor-pointer">
                <span>+ Registrar</span>
              </button>
            </div>

          </div>

          <!-- Otros Predios Guardados (si existen) -->
          ${otherProfilesHTML ? `
            <div class="pt-2 border-t border-amber-600/20 text-left">
              <div class="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-2">Tus Predios Registrados:</div>
              <div class="space-y-1.5 max-h-28 overflow-y-auto">
                ${otherProfilesHTML}
              </div>
            </div>
          ` : ''}

          <!-- Formulario de Creación de Nuevo Predio (Oculto por defecto) -->
          <div id="splashCreateFarmForm" class="hidden text-left bg-stone-950/80 p-4 rounded-2xl border border-teal-500/40 space-y-3">
            <div class="flex items-center justify-between border-b border-stone-800 pb-2">
              <span class="text-xs font-bold text-teal-300 font-serif">🌱 Formulario de Inicialización Predial</span>
              <button type="button" onclick="window.farmProfileManager.closeCreateForm()" class="text-stone-400 hover:text-white text-xs font-mono">✕ Cerrar</button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <label class="block text-[10px] text-stone-400">Nombre del Agricultor:</label>
                <input id="newFarmUserName" type="text" placeholder="Ej. Daniel Santander" class="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-white text-xs focus:border-teal-400 focus:outline-none">
              </div>
              <div>
                <label class="block text-[10px] text-stone-400">Nombre del Predio:</label>
                <input id="newFarmName" type="text" placeholder="Ej. Fundo Los Quillayes" class="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-white text-xs focus:border-teal-400 focus:outline-none">
              </div>
              <div>
                <label class="block text-[10px] text-stone-400">Comuna / Región:</label>
                <input id="newFarmLocation" type="text" placeholder="Ej. San Clemente, Maule" class="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-white text-xs focus:border-teal-400 focus:outline-none">
              </div>
              <div>
                <label class="block text-[10px] text-stone-400">Superficie Estimada (ha):</label>
                <input id="newFarmAreaHa" type="number" step="0.1" placeholder="Ej. 15.5" class="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-white text-xs focus:border-teal-400 focus:outline-none">
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button type="button" onclick="window.farmProfileManager.closeCreateForm()" class="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-mono">Cancelar</button>
              <button type="button" onclick="window.farmProfileManager.submitNewFarm()" class="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-mono text-xs font-bold transition-all shadow flex items-center gap-1.5">
                <span>Inicializar Gemelo</span> <span>➔</span>
              </button>
            </div>
          </div>

          <!-- Pie: Atajo de teclado -->
          <div class="pt-2 text-[10px] font-mono text-stone-400 flex items-center justify-between border-t border-amber-600/20">
            <span>Presiona <kbd class="px-1.5 py-0.5 rounded bg-black/50 border border-stone-700 text-amber-300">Esc</kbd> o <kbd class="px-1.5 py-0.5 rounded bg-black/50 border border-stone-700 text-amber-300">Espacio</kbd> para acceso rápido</span>
            <span class="text-amber-500/80">6 Ramas &middot; Sincronización P2P</span>
          </div>
        </div>
      `;
    }

    openCreateForm() {
      const f = document.getElementById('splashCreateFarmForm');
      if (f) {
        f.classList.remove('hidden');
        document.getElementById('newFarmUserName')?.focus();
      }
    }

    closeCreateForm() {
      const f = document.getElementById('splashCreateFarmForm');
      if (f) f.classList.add('hidden');
    }

    submitNewFarm() {
      const userName = document.getElementById('newFarmUserName')?.value?.trim() || 'Nuevo Agricultor';
      const farmName = document.getElementById('newFarmName')?.value?.trim() || 'Nuevo Predio';
      const location = document.getElementById('newFarmLocation')?.value?.trim() || 'Maule, Chile';
      const areaHa = document.getElementById('newFarmAreaHa')?.value || 10;

      const profile = this.createProfile({ userName, farmName, location, areaHa });
      this.selectAndEnterProfile(profile.id);
    }

    selectAndEnterProfile(profileId) {
      this.setActiveProfile(profileId);
      if (typeof window.dismissAlchemicalSplash === 'function') {
        window.dismissAlchemicalSplash();
      }
    }

    openProfileSelectorDirect() {
      const splash = document.getElementById('alchemicalAppSplash');
      if (splash) {
        splash.style.display = 'flex';
        splash.style.opacity = '1';
        splash.style.pointerEvents = 'auto';
        this.renderSplashConsole();
      }
    }
  }

  window.FarmProfileManager = FarmProfileManager;
  window.farmProfileManager = new FarmProfileManager();

  // Inicializador del Portal de Acceso Alquímico & Deep-Linking por URL del Hub
  window.initAlchemicalSplashAndRouting = function() {
    let splashDismissed = false;
    const splashEl = document.getElementById('alchemicalAppSplash');
    if (!splashEl) return;

    if (window.farmProfileManager) {
      window.farmProfileManager.renderSplashConsole();
      window.farmProfileManager.updateHeaderUI(window.farmProfileManager.getActiveProfile());
    }

    function dismissSplash() {
      if (splashDismissed) return;
      splashDismissed = true;
      if (splashEl) {
        splashEl.style.opacity = '0';
        splashEl.style.pointerEvents = 'none';
        setTimeout(() => {
          splashEl.style.display = 'none';
        }, 800);
      }
    }

    window.dismissAlchemicalSplash = dismissSplash;

    window.openCuencaDirectFromSplash = function() {
      dismissSplash();
      setTimeout(() => {
        if (typeof openCerroMap === 'function') {
          openCerroMap();
        } else if (typeof switchMasterView === 'function') {
          switchMasterView('territory', 'cerro');
        }
      }, 100);
    };

    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const targetMode = urlParams.get('mode') || urlParams.get('view') || (hash ? hash : null);

    if (targetMode) {
      dismissSplash();
      setTimeout(() => {
        if (targetMode === 'map' || targetMode === 'cuenca' || targetMode === 'cuenca_map' || targetMode === 'cuenca-gis' || targetMode === 'territory') {
          if (typeof openCerroMap === 'function') openCerroMap();
          else if (typeof switchMasterView === 'function') switchMasterView('territory', 'cerro');
        } else if (targetMode === 'sim' || targetMode === 'cuenca-sim' || targetMode === 'cerro-sim') {
          if (typeof switchMasterView === 'function') switchMasterView('cerro');
          if (typeof setCerroSubView === 'function') setCerroSubView('sim');
        } else if (targetMode === 'cerro') {
          if (typeof openCerroMap === 'function') openCerroMap();
        } else if (typeof switchMasterView === 'function') {
          switchMasterView(targetMode);
        }
      }, 200);
    }

    window.addEventListener('hashchange', function() {
      const h = window.location.hash.replace('#', '');
      if (h) dismissSplash();
    });

    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' || e.key === ' ' || e.code === 'Space') {
        if (splashEl && splashEl.style.display !== 'none' && !splashDismissed) {
          dismissSplash();
        }
      }
    });
  };

  window.openComparativeStatusModal = function() {
    if (typeof switchMasterView === 'function') switchMasterView('docs');
    if (typeof switchDocsTab === 'function') switchDocsTab('docs-dossier');
    setTimeout(() => {
      const iframe = document.getElementById('iframeDossier');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ action: 'openComparativeModal' }, '*');
      }
      const modalIframe = document.getElementById('iframeDossierModal');
      if (modalIframe && modalIframe.contentWindow) {
        modalIframe.contentWindow.postMessage({ action: 'openComparativeModal' }, '*');
      }
    }, 150);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initAlchemicalSplashAndRouting);
  } else {
    window.initAlchemicalSplashAndRouting();
  }

})(window);
