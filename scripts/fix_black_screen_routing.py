# -*- coding: utf-8 -*-

# 1. FIX EN FARM-PROFILE-MANAGER.JS
with open('/Users/danielsantander/Documents/agritwin-app/js/hub/farm-profile-manager.js', 'r', encoding='utf-8') as f:
    fpm = f.read()

target_fpm = '''    const urlParams = new URLSearchParams(window.location.search);
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
    }'''

replacement_fpm = '''    const urlParams = new URLSearchParams(window.location.search);
    const rawHash = window.location.hash.replace('#', '');
    const cleanHash = rawHash.split('?')[0].toLowerCase();
    const targetMode = urlParams.get('mode') || urlParams.get('view') || null;

    if (rawHash) {
      dismissSplash();
      setTimeout(() => {
        if (typeof handleRouteHash === 'function') {
          handleRouteHash();
        }
      }, 60);
    } else if (targetMode) {
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
        } else if (typeof switchMasterView === 'function' && ['landing', 'dashboard', 'panal', 'telemetry', 'docs', 'cuaderno', 'juegos', 'galpon', 'invernadero', 'establo', 'incursion', 'cerro', 'mesa', 'territory'].includes(targetMode)) {
          switchMasterView(targetMode);
        }
      }, 150);
    }'''

assert target_fpm in fpm, "target_fpm not found in farm-profile-manager.js"
fpm = fpm.replace(target_fpm, replacement_fpm, 1)

with open('/Users/danielsantander/Documents/agritwin-app/js/hub/farm-profile-manager.js', 'w', encoding='utf-8') as f:
    f.write(fpm)

print("farm-profile-manager.js corregido!")

# 2. FIX EN HUB-NAVIGATION.JS (Protección contra vistas inválidas en switchMasterView)
with open('/Users/danielsantander/Documents/agritwin-app/js/hub/hub-navigation.js', 'r', encoding='utf-8') as f:
    nav = f.read()

target_nav = '''        window.switchMasterView = switchMasterView;
        function switchMasterView(viewId, mode) {
            if (typeof window.dismissAlchemicalSplash === 'function') {
                window.dismissAlchemicalSplash();
            }
            if (viewId === 'cuenca') {
                viewId = 'territory';
                if (!mode) mode = 'cerro';
            }'''

replacement_nav = '''        window.switchMasterView = switchMasterView;
        function switchMasterView(viewId, mode) {
            if (typeof window.dismissAlchemicalSplash === 'function') {
                window.dismissAlchemicalSplash();
            }
            if (viewId === 'cuenca') {
                viewId = 'territory';
                if (!mode) mode = 'cerro';
            }
            // Guardia de seguridad: no ocultar la interfaz si la vista recibida no es válida
            const validViews = ['landing', 'dashboard', 'panal', 'telemetry', 'docs', 'cuaderno', 'juegos', 'galpon', 'invernadero', 'establo', 'incursion', 'cerro', 'mesa', 'territory', 'cuenca'];
            if (!validViews.includes(viewId)) {
                console.warn('[Navigation] switchMasterView ignoró vista no reconocida para evitar pantalla negra:', viewId);
                return;
            }'''

assert target_nav in nav, "target_nav not found in hub-navigation.js"
nav = nav.replace(target_nav, replacement_nav, 1)

with open('/Users/danielsantander/Documents/agritwin-app/js/hub/hub-navigation.js', 'w', encoding='utf-8') as f:
    f.write(nav)

print("hub-navigation.js corregido!")

# 3. FIX EN GEO-LAYERS.JS (Garantizar apertura visual completa y fallback bounds)
with open('/Users/danielsantander/Documents/agritwin-app/js/hub/geo-layers.js', 'r', encoding='utf-8') as f:
    geo = f.read()

target_geo = '''            // 1. Asegurar vista Cuenca / Cerro
            if (typeof switchMasterView === 'function') switchMasterView('territory', 'cerro');

            // 2. Abrir pestaña de Riesgos Climáticos en barra lateral si existe
            const tabRisk = document.getElementById('tabBtn-risks');
            if (tabRisk && typeof tabRisk.onclick === 'function') tabRisk.onclick();
            const detailsRisk = document.getElementById('detailsRiskFire');
            if (detailsRisk) detailsRisk.open = true;

            // 3. Activar capa de sitios observados
            window.toggleHindcastSitesLayer(true);'''

replacement_geo = '''            if (typeof window.dismissAlchemicalSplash === 'function') {
                window.dismissAlchemicalSplash();
            }

            // 1. Asegurar vista Cuenca / Cerro completa con todos sus elementos visibles
            if (typeof switchMasterView === 'function') switchMasterView('territory', 'cerro');
            const cerroSatNav = document.getElementById('cerroSatelliteSubdeckNav');
            if (cerroSatNav) cerroSatNav.style.display = 'flex';
            const sidebar = document.getElementById('territorialSidebar');
            if (sidebar) {
                sidebar.style.top = '98px';
                sidebar.style.display = 'flex';
                sidebar.classList.remove('sidebar-collapsed');
                sidebar.style.transform = 'translateX(0)';
                sidebar.style.pointerEvents = 'auto';
            }
            const mapDock = document.getElementById('cuencaMapControlDock');
            if (mapDock) mapDock.style.display = 'flex';
            const scrubber = document.getElementById('cuencaWindyTimelineScrubber');
            if (scrubber) scrubber.style.display = 'block';
            const topPill = document.getElementById('hubWindyTopPill');
            if (topPill) topPill.style.display = 'flex';

            // 2. Abrir pestaña de Riesgos Climáticos en barra lateral
            if (typeof window.selectSidebarTab === 'function') {
                window.selectSidebarTab('tab-riesgos');
            } else {
                const btnRiesgos = document.querySelector('.tab-btn[data-target="tab-riesgos"]');
                if (btnRiesgos) btnRiesgos.click();
            }
            const detailsRisk = document.getElementById('detailsRiskFire');
            if (detailsRisk) detailsRisk.open = true;

            // 3. Activar capa de sitios observados
            window.toggleHindcastSitesLayer(true);'''

assert target_geo in geo, "target_geo not found in geo-layers.js"
geo = geo.replace(target_geo, replacement_geo, 1)

# Asegurar fallbackBounds en el vuelo de la cámara
target_fly = '''            // 6. Volar la cámara hacia el polígono
            setTimeout(() => {
                map.invalidateSize();
                const b = hindcastBoundsByEvent[eventKey];
                if (b && b.isValid()) {
                    map.flyToBounds(b, { padding: [50, 50], duration: 1.3 });
                }
            }, 300);'''

replacement_fly = '''            // 6. Volar la cámara hacia el polígono con bounds de respaldo garantizados
            const fallbackBounds = {
                vina_2024: L.latLngBounds([[-33.16, -71.56], [-33.01, -71.41]]),
                santa_juana_2023: L.latLngBounds([[-37.45, -73.15], [-37.10, -72.70]])
            };
            setTimeout(() => {
                if (window.map) {
                    map.invalidateSize(true);
                    const b = (hindcastBoundsByEvent && hindcastBoundsByEvent[eventKey]) || fallbackBounds[eventKey];
                    if (b && b.isValid()) {
                        map.flyToBounds(b, { padding: [50, 50], duration: 1.3 });
                    } else {
                        map.flyTo([originLat, originLng], 12, { duration: 1.2 });
                    }
                }
            }, 300);'''

assert target_fly in geo, "target_fly not found in geo-layers.js"
geo = geo.replace(target_fly, replacement_fly, 1)

with open('/Users/danielsantander/Documents/agritwin-app/js/hub/geo-layers.js', 'w', encoding='utf-8') as f:
    f.write(geo)

print("geo-layers.js corregido!")
