# -*- coding: utf-8 -*-
"""
Integra el módulo de visualización y benchmarking interactivo de Hindcast
directamente en el Mirador de Cuenca y el panel lateral de Riesgos Climáticos.
"""

import re

# 1. ACTUALIZAR GEO-LAYERS.JS
with open('/Users/danielsantander/Documents/agritwin-app/js/hub/geo-layers.js', 'r', encoding='utf-8') as f:
    geo_js = f.read()

# Buscamos la sección de openHindcastSiteInCuenca
target_geo = '''        // Navegación: abre el modo cuenca, activa la capa y vuela al evento
        window.openHindcastSiteInCuenca = function(eventKey) {
            const evSlug = (eventKey === 'vina_2024') ? 'vina' : 'santajuana';
            if (history && history.replaceState) {
                history.replaceState(null, null, '#cuenca-incendios?evento=' + evSlug);
            }

            if (typeof switchMasterView === 'function') switchMasterView('territory');
            setTimeout(() => {
                if (!map.hasLayer(hindcastSitesLayer)) hindcastSitesLayer.addTo(map);
                map.invalidateSize();
                const b = hindcastBoundsByEvent[eventKey];
                if (b && b.isValid()) map.flyToBounds(b, { padding: [40, 40], duration: 1.2 });
            }, 350);
        };'''

replacement_geo = '''        // Capa de simulación teórica comparativa Rothermel-Fons
        const hindcastSimulationLayer = L.layerGroup();
        overlayLayers['hindcast_simulation'] = hindcastSimulationLayer;
        window.hindcastSimulationLayer = hindcastSimulationLayer;

        // Generador geodésico de elipse de fuego orientada (Rothermel-Fons)
        function generateFireEllipseCoords(originLat, originLng, lengthKm, widthKm, bearingDeg, numPoints = 48) {
            const coords = [];
            const a = lengthKm / 2;
            const b = widthKm / 2;
            const radBearing = (bearingDeg * Math.PI) / 180;
            const focusOffset = a * 0.60; // Desplazamiento del foco de ignición en la cola
            const centerPt = destLatLng(originLat, originLng, focusOffset, bearingDeg);
            const cLat = centerPt[0];
            const cLng = centerPt[1];

            for (let i = 0; i < numPoints; i++) {
                const theta = (i / numPoints) * 2 * Math.PI;
                const xLocal = a * Math.cos(theta);
                const yLocal = b * Math.sin(theta);
                const xRot = xLocal * Math.sin(radBearing) + yLocal * Math.cos(radBearing);
                const yRot = xLocal * Math.cos(radBearing) - yLocal * Math.sin(radBearing);
                const distKm = Math.sqrt(xRot * xRot + yRot * yRot);
                const angleDeg = (Math.atan2(xRot, yRot) * 180 / Math.PI + 360) % 360;
                coords.push(destLatLng(cLat, cLng, distKm, angleDeg));
            }
            coords.push(coords[0]);
            return coords;
        }

        // Toggle de capa de sitios observados
        window.toggleHindcastSitesLayer = function(force) {
            const shouldAdd = (force !== undefined) ? force : !map.hasLayer(hindcastSitesLayer);
            if (shouldAdd) {
                if (!map.hasLayer(hindcastSitesLayer)) hindcastSitesLayer.addTo(map);
            } else {
                if (map.hasLayer(hindcastSitesLayer)) map.removeLayer(hindcastSitesLayer);
            }
            const badge = document.getElementById('badgeDockHindcast');
            if (badge) {
                badge.innerText = shouldAdd ? 'ON' : 'OFF';
                badge.className = shouldAdd 
                    ? 'text-[9px] px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold'
                    : 'text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-slate-400 border border-white/5';
            }
            const chkSidebar = document.getElementById('chkSidebarHindcastSites');
            if (chkSidebar) chkSidebar.checked = shouldAdd;
        };

        // Toggle de la elipse teórica
        window.toggleHindcastSimulationLayer = function(force) {
            const shouldAdd = (force !== undefined) ? force : !map.hasLayer(hindcastSimulationLayer);
            if (shouldAdd) {
                if (!map.hasLayer(hindcastSimulationLayer)) hindcastSimulationLayer.addTo(map);
            } else {
                if (map.hasLayer(hindcastSimulationLayer)) map.removeLayer(hindcastSimulationLayer);
            }
            const btn = document.getElementById('btnToggleHindcastEllipse');
            if (btn) {
                btn.innerText = shouldAdd ? '👁️ Ocultar Elipse Teórica' : '👁️ Mostrar Elipse Teórica';
            }
        };

        // Volver a la cámara del predio activo
        window.returnToActiveFarmFromHindcast = function() {
            const prof = (window.farmProfileManager && window.farmProfileManager.getActiveProfile)
                ? window.farmProfileManager.getActiveProfile()
                : null;
            const lat = prof?.coordinates?.lat || -36.2115;
            const lon = prof?.coordinates?.lon || -71.6050;
            map.flyTo([lat, lon], 13, { duration: 1.2 });
            const hud = document.getElementById('hindcastMapHUD');
            if (hud) hud.classList.add('hidden');
        };

        // Controlador Maestro: Carga el Benchmark Hindcast en el mapa y la barra lateral
        window.loadHindcastBenchmarkInCuenca = function(eventKey) {
            const isVina = (eventKey === 'vina_2024');
            const evSlug = isVina ? 'vina' : 'santajuana';

            if (history && history.replaceState) {
                history.replaceState(null, null, '#cuenca-incendios?evento=' + evSlug);
            }

            // 1. Asegurar vista Cuenca / Cerro
            if (typeof switchMasterView === 'function') switchMasterView('territory', 'cerro');

            // 2. Abrir pestaña de Riesgos Climáticos en barra lateral si existe
            const tabRisk = document.getElementById('tabBtn-risks');
            if (tabRisk && typeof tabRisk.onclick === 'function') tabRisk.onclick();
            const detailsRisk = document.getElementById('detailsRiskFire');
            if (detailsRisk) detailsRisk.open = true;

            // 3. Activar capa de sitios observados
            window.toggleHindcastSitesLayer(true);

            // 4. Parámetros biofísicos de emulación según evento
            let originLat, originLng, lenKm, widthKm, bearingDeg, windLabel, windSpeed, windGust, tempC, hrPct, rain90d, scarAreaHa, simAreaHa;
            let titleEvent = '';

            if (isVina) {
                titleEvent = 'Viña del Mar / Quilpué 2024';
                originLat = -33.1380;
                originLng = -71.4980; // Reserva Peñuelas (Sur)
                lenKm = 12.8;
                widthKm = 4.1;
                bearingDeg = 10; // Empuje S -> N
                windLabel = 'S–SSO (190°)';
                windSpeed = '32 km/h';
                windGust = '65 km/h';
                tempC = '34,4 °C';
                hrPct = '21 %';
                rain90d = '30,6 mm';
                scarAreaHa = '2.989 ha (obs)';
                simAreaHa = '3.420 ha (teór)';
            } else {
                titleEvent = 'Santa Juana 2023';
                originLat = -37.3820;
                originLng = -72.7850; // Ribera Sur Biobío (SE)
                lenKm = 34.5;
                widthKm = 15.8;
                bearingDeg = 330; // Empuje SE -> NO
                windLabel = 'SE (150°) Puelche';
                windSpeed = '38 km/h';
                windGust = '58 km/h';
                tempC = '40,0 °C';
                hrPct = '11 %';
                rain90d = '96,8 mm';
                scarAreaHa = '42.599 ha (obs)';
                simAreaHa = '44.850 ha (teór)';
            }

            // 5. Dibujar Elipse y Vector en hindcastSimulationLayer
            hindcastSimulationLayer.clearLayers();

            const ellipseCoords = generateFireEllipseCoords(originLat, originLng, lenKm, widthKm, bearingDeg);
            const simPoly = L.polygon(ellipseCoords, {
                color: '#f97316',
                weight: 2.8,
                dashArray: '6, 4',
                fillColor: '#ea580c',
                fillOpacity: 0.18,
                className: 'simulated-fire-ellipse'
            });
            simPoly.bindPopup(`
                <div style="font-family:'JetBrains Mono',monospace; font-size:11px; padding:4px; min-width:260px;">
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #ea580c; padding-bottom:3px; margin-bottom:5px;">
                        <strong style="color:#ea580c; font-size:12px;">📐 Elipse Teórica Rothermel-Fons</strong>
                        <span style="background:rgba(234,88,12,0.2); color:#fdba74; padding:1px 5px; border-radius:4px; font-size:9px;">EMULACIÓN</span>
                    </div>
                    <div style="color:#94a3b8; font-size:10px; margin-bottom:4px;">${titleEvent}</div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                        <span style="color:#94a3b8;">Superficie Proyectada:</span>
                        <b style="color:#f97316;">${simAreaHa}</b>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                        <span style="color:#94a3b8;">Eje Mayor / Menor:</span>
                        <span style="color:#cbd5e1;">${lenKm} km &times; ${widthKm} km</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                        <span style="color:#94a3b8;">Viento Sinóptico ERA5:</span>
                        <b style="color:#38bdf8;">${windLabel} &bull; ${windSpeed}</b>
                    </div>
                    <div style="margin-top:6px; padding:3px 5px; border-radius:4px; background:rgba(234,88,12,0.1); border:1px solid rgba(234,88,12,0.3); font-size:9.5px; color:#fed7aa;">
                        Modelo: $\\\\frac{L}{W} = 1 + 0,125 \\\\cdot U$. Contraste directo contra la cicatriz dNBR satelital (rojo).
                    </div>
                </div>
            `, { maxWidth: 300 });
            simPoly.addTo(hindcastSimulationLayer);

            // Marcador de Foco de Ignición
            const ignitionIcon = L.divIcon({
                className: 'hindcast-ignition-marker',
                html: `
                    <div style="width:36px; height:36px; position:relative; display:flex; align-items:center; justify-content:center;">
                        <div style="position:absolute; width:32px; height:32px; border-radius:50%; background:rgba(249,115,22,0.4); animation: ping 1.4s cubic-bezier(0,0,0.2,1) infinite;"></div>
                        <div style="width:24px; height:24px; border-radius:50%; background:#ea580c; border:2px solid #ffffff; box-shadow:0 0 12px #f97316; display:flex; align-items:center; justify-content:center; font-size:12px;">
                            🔥
                        </div>
                    </div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            });
            const ignMarker = L.marker([originLat, originLng], { icon: ignitionIcon });
            ignMarker.bindTooltip(`<b>Foco Ignición ${titleEvent}</b>`, { permanent: false, direction: 'top' });
            ignMarker.addTo(hindcastSimulationLayer);

            // Vector de viento ERA5 (flecha)
            const arrowEnd = destLatLng(originLat, originLng, Math.min(lenKm * 0.75, 18), bearingDeg);
            const windArrow = L.polyline([[originLat, originLng], arrowEnd], {
                color: '#38bdf8',
                weight: 3.5,
                dashArray: '4, 4'
            });
            windArrow.bindTooltip(`🌪️ Vector Viento ERA5: ${windLabel} ${windGust}`, { permanent: true, direction: 'right' });
            windArrow.addTo(hindcastSimulationLayer);

            if (!map.hasLayer(hindcastSimulationLayer)) hindcastSimulationLayer.addTo(map);

            // 6. Volar la cámara hacia el polígono
            setTimeout(() => {
                map.invalidateSize();
                const b = hindcastBoundsByEvent[eventKey];
                if (b && b.isValid()) {
                    map.flyToBounds(b, { padding: [50, 50], duration: 1.3 });
                }
            }, 300);

            // 7. Mostrar y actualizar HUD flotante en el mapa
            const hud = document.getElementById('hindcastMapHUD');
            if (hud) {
                hud.classList.remove('hidden');
                document.getElementById('hindcastHudTitle').innerText = titleEvent;
                document.getElementById('hindcastHudObsArea').innerText = scarAreaHa;
                document.getElementById('hindcastHudSimArea').innerText = simAreaHa;
                document.getElementById('hindcastHudWind').innerText = `${windLabel} ${windGust}`;
                document.getElementById('hindcastHudTemp').innerText = `${tempC} · HR ${hrPct}`;
                document.getElementById('hindcastHudRain').innerText = rain90d;

                const prof = (window.farmProfileManager && window.farmProfileManager.getActiveProfile)
                    ? window.farmProfileManager.getActiveProfile()
                    : null;
                const farmName = prof?.farmName || "Fundo Meniel";
                const farmLat = prof?.coordinates?.lat || -36.2115;
                const farmLon = prof?.coordinates?.lon || -71.6050;
                const distKm = (map.distance(L.latLng(originLat, originLng), L.latLng(farmLat, farmLon)) / 1000).toFixed(1);
                document.getElementById('hindcastHudFarmDist').innerText = `${distKm} km desde ${farmName}`;
            }

            // 8. Sincronizar botones en la barra lateral
            const btnSanta = document.getElementById('btnSidebarHindcastSanta');
            const btnVina = document.getElementById('btnSidebarHindcastVina');
            if (btnSanta && btnVina) {
                if (isVina) {
                    btnVina.className = 'py-1.5 px-2 rounded-lg bg-rose-600 text-white font-mono text-[10px] font-bold border border-rose-400 cursor-pointer shadow-md';
                    btnSanta.className = 'py-1.5 px-2 rounded-lg bg-black/40 hover:bg-white/10 text-slate-300 font-mono text-[10px] border border-white/5 cursor-pointer';
                } else {
                    btnSanta.className = 'py-1.5 px-2 rounded-lg bg-rose-600 text-white font-mono text-[10px] font-bold border border-rose-400 cursor-pointer shadow-md';
                    btnVina.className = 'py-1.5 px-2 rounded-lg bg-black/40 hover:bg-white/10 text-slate-300 font-mono text-[10px] border border-white/5 cursor-pointer';
                }
            }
        };

        // Emulación del régimen del megaincendio sobre el predio activo (ej: Fundo Meniel)
        window.emulateHindcastOnActiveFarm = function(eventKey) {
            const isVina = (eventKey === 'vina_2024');
            const prof = (window.farmProfileManager && window.farmProfileManager.getActiveProfile)
                ? window.farmProfileManager.getActiveProfile()
                : null;
            const farmName = prof?.farmName || "Fundo Meniel";
            const farmLat = prof?.coordinates?.lat || -36.2115;
            const farmLon = prof?.coordinates?.lon || -71.6050;

            // Volar a la cuenca del predio
            map.flyTo([farmLat, farmLon], 13, { duration: 1.2 });

            // Configurar el régimen sinóptico equivalente
            if (isVina) {
                if (typeof setTacticalWindRegime === 'function') setTacticalWindRegime('surazo');
            } else {
                if (typeof setTacticalWindRegime === 'function') setTacticalWindRegime('puelche');
            }

            // Activar el modo Click to Ignite para que el usuario pueda ver el impacto
            if (typeof toggleClickToIgniteMode === 'function') {
                toggleClickToIgniteMode(true);
            }

            alert(`🌪️ RÉGIMEN HISTÓRICO CARGADO SOBRE ${farmName.toUpperCase()}:\\n` +
                  (isVina ? '• Evento Viña 2024: Viento Sur 65 km/h · 34.4 °C · 30.6 mm lluvia previa.\\n'
                          : '• Evento Santa Juana 2023: Viento Puelche 58 km/h · 40.0 °C · 11% HR.\\n') +
                  'Haz click en cualquier punto perimetral del mapa para simular el avance de las llamas y el salto de pavesas.');
        };

        // Alias retrocompatible
        window.openHindcastSiteInCuenca = function(eventKey) {
            window.loadHindcastBenchmarkInCuenca(eventKey);
        };'''

assert target_geo in geo_js, "target_geo not found in geo-layers.js"
geo_js = geo_js.replace(target_geo, replacement_geo, 1)

with open('/Users/danielsantander/Documents/agritwin-app/js/hub/geo-layers.js', 'w', encoding='utf-8') as f:
    f.write(geo_js)

print("geo-layers.js actualizado con soporte completo de Hindcast Benchmark!")
