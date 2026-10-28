/**
 * AgriTwin - SuiteBridge & Principio Árbol Telemetry Channel
 * 
 * Gestiona la sincronización del Predio con el Tronco Hub (Suite AgriTwin)
 * y los puentes bidireccionales de eventos window.postMessage.
 */

export class SuiteBridge {
  static init() {
    // Sincronización del Predio con el Tronco Hub (Leyendo estado vivo + metadatos de sensores prototipo)
    window.syncPredioWithHub = function() {
      const app = window.agriTwinApp;
      const sensors = app?.dataSource?.entitiesData?.sensors || [];
      let avgVwc = 36.2;
      if (sensors.length > 0) {
        const sum = sensors.reduce((acc, s) => acc + (parseFloat(s.telemetry?.soilMoistureLayer2 ?? s.telemetry?.soilMoisture ?? 36.2)), 0);
        avgVwc = +(sum / sensors.length).toFixed(1);
      }

      const parcelsCount = app?.parcelManager?.parcels?.length || 8;
      const livestockCount = app?.livestockManager?.animals?.length || 24;
      const basin = app?.simulationEngine?.latestBasinTelemetry;
      const fwiVal = basin?.macro_fwi ?? basin?.fundoMeniel?.fwiIndex ?? 24;

      const syncPayload = {
        type: 'SYNC_BRANCH_STATE',
        branch: 'predio',
        source: 'agritwin_3d',
        data: {
          aforoDgaLps: 28.0,
          tranqueKeylineM3: 18500,
          soilMoistureVwc: avgVwc,
          soilVwc: `${avgVwc}%`,
          fwiLocal: fwiVal,
          fwi: fwiVal,
          biomasaKgMsHa: 4820,
          biomassKgHa: 4820,
          potrerosPrv: 8,
          cuartelesActivos: parcelsCount,
          ganadoCabezas: livestockCount,
          referenceOrigin: 'Casa Patronal / Galpón (Zona 0: 0m N, 0m E)',
          telemetryStatus: 'Híbrido (Clima Open-Meteo Real + Sensores Prototipo KioT Simulados)',
          timestamp: new Date().toISOString()
        }
      };

      if (window.parent && window.parent !== window) {
        window.parent.postMessage(syncPayload, '*');
      }

      const toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(5,150,105,0.95);color:white;padding:12px 20px;border-radius:12px;font-family:Plus Jakarta Sans,sans-serif;font-size:12px;font-weight:700;box-shadow:0 10px 25px rgba(0,0,0,0.5);border:1px solid #34d399;z-index:99999;display:flex;align-items:center;gap:8px;backdrop-filter:blur(8px);';
      toast.innerHTML = `<span>🌳</span> <span>Predio sincronizado con el Tronco Hub: Aforo 28 L/s, Tranque 18.5k m³ y Humedad FDR ${avgVwc}% (Prototipo).</span>`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);
    };

    // Apertura y Cierre de Consejos Consultivos IA
    window.openAgriPredioAdvisorsModal = () => {
      const m = document.getElementById('predioAdvisorsModalAgri');
      if (m) m.style.display = 'flex';
    };
    window.closeAgriPredioAdvisorsModal = () => {
      const m = document.getElementById('predioAdvisorsModalAgri');
      if (m) m.style.display = 'none';
    };

    window.openAgriEstabloAdvisorsModal = () => {
      const m = document.getElementById('establoAdvisorsModalAgri');
      if (m) m.style.display = 'flex';
    };
    window.closeAgriEstabloAdvisorsModal = () => {
      const m = document.getElementById('establoAdvisorsModalAgri');
      if (m) m.style.display = 'none';
    };

    window.openAgriInvernaderoAdvisorsModal = () => {
      const m = document.getElementById('invernaderoAdvisorsModalAgri');
      if (m) m.style.display = 'flex';
    };
    window.closeAgriInvernaderoAdvisorsModal = () => {
      const m = document.getElementById('invernaderoAdvisorsModalAgri');
      if (m) m.style.display = 'none';
    };

    window.openAgriExcursionAdvisorsModal = () => {
      const m = document.getElementById('excursionAdvisorsModalAgri');
      if (m) m.style.display = 'flex';
    };
    window.closeAgriExcursionAdvisorsModal = () => {
      const m = document.getElementById('excursionAdvisorsModalAgri');
      if (m) m.style.display = 'none';
    };

    // Galpón Workshop & Navegación Integrada
    window.openGalponWorkshop = function(branch = null) {
      if (window.agriTwinApp?.workshopOverlay) {
        window.agriTwinApp.workshopOverlay.open();
        if (branch) {
          window.agriTwinApp.workshopOverlay.selectedEnclosureBranch = branch;
          window.agriTwinApp.workshopOverlay.openStationModal('station_b');
        } else {
          window.agriTwinApp.workshopOverlay.showCampaignBoard = true;
          window.agriTwinApp.workshopOverlay.closeStationModal();
          window.agriTwinApp.workshopOverlay.render();
        }
      } else {
        const w = document.getElementById('workshopOverlay');
        if (w) {
          w.style.display = 'flex';
          w.classList.add('active');
        }
      }
    };

    window.closeGalponWorkshop = function() {
      const w = document.getElementById('workshopOverlay');
      if (w) {
        w.classList.remove('active');
        w.style.display = 'none';
      }
      window.agriTwinApp?.workshopOverlay?.close?.();
      window.agriTwinApp?.mapManager?.flyToPreset('overview');
      window.agriTwinApp?.mapManager?.onWindowResize?.();
    };

    window.toggleGalponWorkshop = function() {
      const w = document.getElementById('workshopOverlay');
      if (w && (w.classList.contains('active') || w.style.display !== 'none')) {
        window.closeGalponWorkshop();
      } else {
        window.openGalponWorkshop();
      }
    };

    window.inspectPredioHouse = function() {
      window.openGalponWorkshop();
    };

    window.resetPredioOverview = function() {
      window.closeGalponWorkshop();
    };

    window.returnToHub = function() {
      if (window.parent && window.parent !== window && typeof window.parent.switchMasterView === 'function') {
        window.parent.switchMasterView('landing');
      } else {
        window.location.href = '/#landing';
      }
    };

    window.toggleControlsToolbar = function() {
      const c = document.getElementById('toolbarContainer');
      if (c) c.classList.toggle('toolbar-open');
    };

    window.toggleSideDrawer = function() {
      if (document.body.classList.contains('drawer-collapsed')) {
        window.agriTwinApp?.uiController?.expandDrawer?.();
      } else {
        window.agriTwinApp?.uiController?.collapseDrawer?.();
      }
    };

    // Cross-frame messaging from AgroTwin Hub (Tronco)
    window.addEventListener('message', (event) => {
      if (!event.data) return;
      if (event.data.action === 'setPlanMaestro') {
        const isActive = !!event.data.active;
        if (typeof window.setPlanMaestro === 'function') {
          window.setPlanMaestro(isActive);
        } else if (typeof window.setPredioDualMode === 'function') {
          window.setPredioDualMode(isActive ? 'designer' : 'predio');
        }
      } else if (event.data.action === 'setPredioDualMode') {
        if (typeof window.setPredioDualMode === 'function') {
          window.setPredioDualMode(event.data.mode);
        }
      } else if (event.data.action === 'openWorkshop') {
        if (typeof window.openGalponWorkshop === 'function') {
          window.openGalponWorkshop(event.data.branch || null);
        }
      } else if (event.data.action === 'whatif') {
        if (typeof window.triggerWhatIfStorm === 'function') {
          window.triggerWhatIfStorm();
        }
      } else if (event.data.action === 'toggleYeomans') {
        if (typeof window.toggleYeomansPanel === 'function') {
          window.toggleYeomansPanel();
        }
      } else if (event.data.action === 'dossier') {
        if (typeof window.openDossierPlanMaestroModal === 'function') {
          window.openDossierPlanMaestroModal();
        }
      } else if (event.data.action === 'toggleWorkshop') {
        if (typeof window.toggleGalponWorkshop === 'function') {
          window.toggleGalponWorkshop();
        }
      } else if (event.data.action === 'SET_ACTIVE_PROFILE') {
        const profile = event.data.profile;
        if (profile) {
          console.log('🌳 AgriTwin 3D: Sincronizando con perfil predial:', profile.farmName);
          const toast = document.createElement('div');
          toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,0.95);color:#38bdf8;padding:10px 18px;border-radius:12px;font-family:JetBrains Mono,monospace;font-size:11px;font-weight:700;box-shadow:0 10px 25px rgba(0,0,0,0.6);border:1px solid #0284c7;z-index:99999;display:flex;align-items:center;gap:8px;backdrop-filter:blur(10px);';
          toast.innerHTML = `<span>🏡</span> <span>Perfil Activo: <b>${profile.farmName}</b> (${profile.isReference ? 'Demo Maestro 100%' : 'Predio Propio'})</span>`;
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 4000);

          if (profile.status === 'bootstrap' && window.agriTwinApp?.projectManager) {
            window.agriTwinApp.projectManager.currentProject.name = profile.farmName;
            window.agriTwinApp.projectManager.currentProject.author = profile.userName;
          }
        }
      }
    });

    // Notificar al Tronco Hub cuando el iframe del Predio 3D está listo para recibir estado inicial
    const notifyReady = () => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'PREDIO_IFRAME_READY',
          branch: 'predio',
          timestamp: new Date().toISOString()
        }, '*');
      }
    };
    if (document.readyState === 'complete') {
      setTimeout(notifyReady, 150);
    } else {
      window.addEventListener('load', () => setTimeout(notifyReady, 150));
    }
  }
}
