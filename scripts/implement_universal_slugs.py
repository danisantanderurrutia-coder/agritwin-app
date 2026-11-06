# -*- coding: utf-8 -*-
"""
implement_universal_slugs.py
Implementa slugs generales y contextuales para agritwin-app:
  - #cuenca-incendios (con soporte ?evento=vina o ?evento=santajuana y ?predio=id)
  - #hindcast (abre el reporte hindcast con datos del predio activo del usuario)
  - #hindcast-modo-a / #hindcast-modo-b / #hindcast-contraste
  - Dinamización de la defensa predial: lee farmProfileManager.getActiveProfile()
    tanto en popups del mapa de cuenca como en el cockpit de hindcast.
"""

import sys
import os
import re

APP_DIR = "/Users/danielsantander/Documents/agritwin-app"

def update_vault_cockpit_js():
    js_path = os.path.join(APP_DIR, "js/hub/vault-cockpit.js")
    with open(js_path, "r", encoding="utf-8") as f:
        code = f.read()

    # Reemplazar handleRouteHash con la versión con soporte de slugs universales y query params
    old_func_start = "        function handleRouteHash() {"
    idx = code.find(old_func_start)
    if idx == -1:
        print("❌ No se encontró handleRouteHash en vault-cockpit.js")
        return False

    old_func_end = "        window.addEventListener('hashchange', handleRouteHash);"
    end_idx = code.find(old_func_end, idx)
    if end_idx == -1:
        print("❌ No se encontró fin de handleRouteHash")
        return False

    new_handle_route = r'''        function handleRouteHash() {
            const rawHash = window.location.hash.replace('#', '');
            if (!rawHash) {
                if (typeof switchMasterView === 'function') switchMasterView('landing');
                return;
            }

            const [baseRoute, queryString] = rawHash.split('?');
            const params = new URLSearchParams(queryString || '');
            const hash = baseRoute.toLowerCase();

            // Si se pasa ?predio=ID, sincronizar el perfil activo del usuario
            if (params.has('predio') && typeof window.farmProfileManager !== 'undefined' && window.farmProfileManager) {
                window.farmProfileManager.setActiveProfile(params.get('predio'));
            }

            if (hash && typeof dismissAlchemicalSplash === 'function') {
                dismissAlchemicalSplash();
            }

            // ── 1. SLUGS GENERALES: CUENCA & INCENDIOS (Contextual al predio del usuario) ──
            if (hash === 'cuenca-incendios' || hash === 'cuenca-fuego' || hash === 'cuenca-validacion' || hash === 'incendios') {
                const evParam = params.get('evento') || params.get('event');
                if (evParam === 'vina' || evParam === 'vina_2024') {
                    if (typeof openHindcastSiteInCuenca === 'function') openHindcastSiteInCuenca('vina_2024');
                    else openCerroMap();
                } else if (evParam === 'santajuana' || evParam === 'santa_juana' || evParam === 'santa_juana_2023') {
                    if (typeof openHindcastSiteInCuenca === 'function') openHindcastSiteInCuenca('santa_juana_2023');
                    else openCerroMap();
                } else {
                    if (typeof openCerroMap === 'function') openCerroMap();
                    setTimeout(() => {
                        if (typeof hindcastSitesLayer !== 'undefined' && window.map && !map.hasLayer(hindcastSitesLayer)) {
                            hindcastSitesLayer.addTo(map);
                        }
                    }, 400);
                }
            }
            // ── 2. SLUGS GENERALES: HINDCAST & AUDITORÍA DE MODELO ──
            else if (hash === 'hindcast' || hash.startsWith('hindcast-') || hash === 'auditoria-incendios') {
                switchMasterView('docs');
                if (typeof switchDocsTab === 'function') switchDocsTab('docs-uq');
                if (typeof window.switchUqTab === 'function') window.switchUqTab('hindcast');
                if (typeof window.syncHindcastFarmProfile === 'function') window.syncHindcastFarmProfile();

                if (hash === 'hindcast-modo-a' && typeof window.switchHindcastView === 'function') {
                    window.switchHindcastView('modo-a');
                } else if (hash === 'hindcast-modo-b' && typeof window.switchHindcastView === 'function') {
                    window.switchHindcastView('modo-b');
                } else if (hash === 'hindcast-contraste' && typeof window.switchHindcastView === 'function') {
                    window.switchHindcastView('contraste');
                }
            }
            // ── 3. RUTAS TRADICIONALES DE CUENCA & CERRO ──
            else if (hash === 'cuenca' || hash === 'cuenca-gis' || hash === 'cuenca-map') {
                openCerroMap();
            }
            else if (hash === 'cuenca-sim') {
                switchMasterView('cerro');
                if (typeof setCerroSubView === 'function') setCerroSubView('sim');
            }
            else if (hash === 'cuenca-decreto') {
                switchMasterView('cerro');
                if (typeof setCerroSubView === 'function') setCerroSubView('decreto');
            }
            else if (hash === 'mesa' || hash.startsWith('mesa-')) {
                openMesaLanding();
                if (hash.startsWith('mesa-')) {
                    const hotspotId = hash.replace('mesa-', '');
                    openMesaHotspotModal(hotspotId);
                }
            }
            else if (hash === 'cerro' || hash.startsWith('cerro-')) {
                if (hash === 'cerro') {
                    openCerroMap();
                } else if (hash === 'cerro-sim') {
                    switchMasterView('cerro');
                    if (typeof setCerroSubView === 'function') setCerroSubView('sim');
                } else if (hash === 'cerro-decreto') {
                    switchMasterView('cerro');
                    if (typeof setCerroSubView === 'function') setCerroSubView('decreto');
                } else if (hash === 'cerro-panorama') {
                    openCerroMode();
                } else if (hash.startsWith('cerro-')) {
                    openCerroMode();
                    const hotspotId = hash.replace('cerro-', '');
                    openCerroHotspotModal(hotspotId);
                }
            }
            else if (hash === 'galpon' || hash === 'predio') openPredioMode();
            else if (hash === 'establo') openEstabloModeDirect();
            else if (hash === 'invernadero') openInvernaderoModeDirect();
            else if (hash === 'incursion') openIncursionModeDirect();
            else if (hash === 'dashboard' || hash === 'cockpit') switchMasterView('dashboard');
            else if (hash === 'telemetry') switchMasterView('telemetry');
            else if (hash === 'docs' || hash.startsWith('docs-')) {
                switchMasterView('docs');
                if (hash === 'docs-tactico') {
                    switchDocsTab('docs-arch');
                    if (typeof switchArchModule === 'function') switchArchModule('tactico');
                } else if (hash === 'docs-destine') {
                    switchDocsTab('docs-arch');
                    if (typeof switchArchModule === 'function') switchArchModule('destine');
                } else if (hash.startsWith('docs-')) switchDocsTab(hash);
                else switchDocsTab('docs-vecino');
            }
            else if (hash === 'territory') openCerroMap();
            else if (hash === 'tactico') {
                if (typeof openCerroMapWithTab === 'function') openCerroMapWithTab('tab-tactico');
                else switchMasterView('territory', 'cerro');
            }
            else if (hash === 'landing' || hash === '') switchMasterView('landing');
        }

'''
    code = code[:idx] + new_handle_route + code[end_idx:]
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("✅ vault-cockpit.js actualizado con enrutador de slugs generales.")
    return True

def update_geo_layers_js():
    js_path = os.path.join(APP_DIR, "js/hub/geo-layers.js")
    with open(js_path, "r", encoding="utf-8") as f:
        code = f.read()

    # 1. En openHindcastSiteInCuenca: actualizar URL slug sin recargar
    old_open = "window.openHindcastSiteInCuenca = function(eventKey) {"
    new_open = r'''window.openHindcastSiteInCuenca = function(eventKey) {
            const evSlug = (eventKey === 'vina_2024') ? 'vina' : 'santajuana';
            if (history && history.replaceState) {
                history.replaceState(null, null, '#cuenca-incendios?evento=' + evSlug);
            }
'''
    if old_open in code and "history.replaceState(null, null, '#cuenca-incendios" not in code:
        code = code.replace(old_open, new_open)
        print("✅ openHindcastSiteInCuenca actualizado con slug universal.")

    # 2. En hindcastSitesLayer popup: mostrar distancia al predio activo de quien esté navegando
    popup_needle = '<div style="color:#64748b; font-size:9.5px; margin-bottom:5px;">${p.area_source}</div>'
    replacement_popup = r'''<div style="color:#64748b; font-size:9.5px; margin-bottom:5px;">${p.area_source}</div>
                            <div style="padding:4px 6px; border-radius:4px; background:rgba(14,165,233,0.12); border:1px solid rgba(14,165,233,0.3); color:#7dd3fc; font-size:10px; margin-bottom:5px;">
                                📍 Distancia a tu predio activo (<span style="font-weight:bold; color:#ffffff;">${(window.farmProfileManager?.getActiveProfile()?.farmName || "Fundo Meniel")}</span>): 
                                <strong>${((map.distance(L.latLng(p.centroid[1], p.centroid[0]), L.latLng(window.farmProfileManager?.getActiveProfile()?.coordinates?.lat || -36.2115, window.farmProfileManager?.getActiveProfile()?.coordinates?.lon || -71.6050)) / 1000).toFixed(1))} km</strong>
                            </div>'''
    if popup_needle in code and "Distancia a tu predio activo" not in code:
        code = code.replace(popup_needle, replacement_popup)
        print("✅ Popup de hindcastSitesLayer dinamizado con predio activo del usuario.")

    # 3. En click-to-ignite: dinamizar contra el predio activo
    hardcoded_boundary = "const menielEastBoundary = [-36.2115, -71.5950];"
    dynamic_boundary = r'''const activeUserFarm = (typeof window.farmProfileManager !== 'undefined' && window.farmProfileManager)
                ? window.farmProfileManager.getActiveProfile()
                : null;
            const targetFarmName = activeUserFarm?.farmName || "Fundo Meniel";
            const menielEastBoundary = activeUserFarm?.coordinates 
                ? [activeUserFarm.coordinates.lat, activeUserFarm.coordinates.lon]
                : [-36.2115, -71.5950];'''
    if hardcoded_boundary in code:
        code = code.replace(hardcoded_boundary, dynamic_boundary)
        code = code.replace("km a Meniel (${arrivalTimeMin} min)", "km a ${targetFarmName} (${arrivalTimeMin} min)")
        print("✅ Click-to-Ignite dinamizado para calcular buffer contra el predio activo.")

    with open(js_path, "w", encoding="utf-8") as f:
        f.write(code)
    return True

def update_index_html():
    html_path = os.path.join(APP_DIR, "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Agregar función syncHindcastFarmProfile en scripts
    sync_func = r'''
        // Sincronización del Cockpit Hindcast con el Predio Activo del Usuario
        window.syncHindcastFarmProfile = function() {
            const activeFarm = (typeof window.farmProfileManager !== 'undefined' && window.farmProfileManager)
                ? window.farmProfileManager.getActiveProfile()
                : null;
            const farmName = activeFarm?.farmName || 'Fundo Meniel';
            const areaHa = activeFarm?.areaHa ? (activeFarm.areaHa + ' ha') : '24.8 ha';
            const tranqueM3 = activeFarm?.branches?.predio?.waterStorageM3 
                ? (activeFarm.branches.predio.waterStorageM3.toLocaleString('es-CL') + ' m³')
                : '18.500 m³';

            const nameEl = document.getElementById('hindcast-farm-name-label');
            const svgNameEl = document.getElementById('hindcast-svg-farm-name');
            const areaEl = document.getElementById('hindcast-farm-area-label');
            const tranqueEl = document.getElementById('hindcast-farm-tranque-label');

            if (nameEl) nameEl.innerText = farmName;
            if (svgNameEl) svgNameEl.textContent = farmName;
            if (areaEl) areaEl.innerText = areaHa;
            if (tranqueEl) tranqueEl.innerText = tranqueM3;
        };
'''
    if "window.syncHindcastFarmProfile = function" not in html:
        needle = "window.switchHindcastView = function"
        html = html.replace(needle, sync_func.strip() + "\n\n        " + needle)
        print("✅ syncHindcastFarmProfile inyectado en index.html.")

    # 2. Agregar slugs a los enlaces y botones de hindcast
    html = html.replace("switchHindcastView('modo-b')", "switchHindcastView('modo-b'); if (history.replaceState) history.replaceState(null, null, '#hindcast-modo-b');")
    html = html.replace("switchHindcastView('modo-a')", "switchHindcastView('modo-a'); if (history.replaceState) history.replaceState(null, null, '#hindcast-modo-a');")
    html = html.replace("switchHindcastView('contraste')", "switchHindcastView('contraste'); if (history.replaceState) history.replaceState(null, null, '#hindcast-contraste');")

    # 3. Dinamizar encabezados de la columna derecha de defensa
    html = html.replace('<span>🛡️ Defensa Fundo Meniel</span>', '<span>🛡️ Defensa: <strong id="hindcast-farm-name-label" class="text-white">Fundo Meniel</strong></span>')
    html = html.replace('<text x="58" y="95" fill="#6ee7b7" font-size="9.5" font-family="monospace" font-weight="bold">Fundo Meniel</text>',
                        '<text id="hindcast-svg-farm-name" x="58" y="95" fill="#6ee7b7" font-size="9.5" font-family="monospace" font-weight="bold">Fundo Meniel</text>')

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)
    print("✅ index.html actualizado con reactividad de predio activo y slugs dinámicos.")
    return True

def main():
    update_vault_cockpit_js()
    update_geo_layers_js()
    update_index_html()

if __name__ == "__main__":
    main()
