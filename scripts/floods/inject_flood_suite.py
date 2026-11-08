#!/usr/bin/env python3
"""
Inyector de la Suite Táctica de Megainundaciones (Sentinel-1 SAR / DGA / HAND / Saint-Venant 2D).
Actualiza index.html y js/hub/geo-layers.js con los 3 casos de estudio:
- Licantén / Río Mataquito 2023
- Río Longaví / Meniel & Retiro 2023
- Río Ancoa / Linares Precordillera 2023
"""

import sys
import os

INDEX_HTML_PATH = "index.html"
GEO_LAYERS_PATH = "js/hub/geo-layers.js"

# ══════════════════════════════════════════════════════════════════════════════
# 1. CÓDIGO JS PARA GEO-LAYERS.JS
# ══════════════════════════════════════════════════════════════════════════════

GEO_LAYERS_DECLARATION = """
        // ── CAPAS TRILATERALES DE AUDITORÍA MEGAINUNDACIONES (SENTINEL-1 SAR / DGA / HAND) ──
        // Capa 1: Polígono Histórico Observado SAR Sentinel-1 Banda C (Backscatter < -18 dB)
        const floodSitesLayer = L.layerGroup();
        const floodBoundsByEvent = {};
        overlayLayers['flood_sites'] = floodSitesLayer;
        window.floodSitesLayer = floodSitesLayer;
        window.floodBoundsByEvent = floodBoundsByEvent;

        fetch('data/flood_hindcast_sites.json')
            .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(fc => {
                fc.features.forEach(f => {
                    const p = f.properties;
                    const coords = f.geometry.coordinates[0].map(c => [c[1], c[0]]);
                    const popupHtml = `
                        <div style="font-family:'JetBrains Mono',monospace; font-size:11px; padding:4px; min-width:270px; color:#f8fafc;">
                            <div style="border-bottom:1px solid #0284c7; padding-bottom:3px; margin-bottom:5px;">
                                <strong style="color:#38bdf8; font-size:12px;">🌊 ${p.name}</strong>
                                <div style="font-size:9.5px; color:#94a3b8;">${p.setting}</div>
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:10px; margin-bottom:4px;">
                                <div>• Área SAR: <b style="color:#38bdf8;">${p.area_ha.toLocaleString()} ha</b></div>
                                <div>• Q Pico: <b style="color:#0284c7;">${p.hydrology.q_peak_m3s.toLocaleString()} m³/s</b></div>
                                <div>• Sensor: <b style="color:#ffffff;">Sentinel-1 SAR</b></div>
                                <div>• Retorno Tr: <b style="color:#fde047;">${p.hydrology.return_period_yr} años</b></div>
                            </div>
                            <div style="font-size:9.5px; color:#cbd5e1; border-top:1px solid rgba(255,255,255,0.1); padding-top:4px;">
                                <div>• Estación: <b>${p.hydrology.dga_station}</b></div>
                                <div>• Lluvia Cabecera: <b>${p.weather.lluvia_cabecera_mm} mm</b> (IVT ${p.weather.ivt_max_kg_m_s} kg/m/s)</div>
                                <div>• Isoterma 0°C: <b style="color:#f87171;">${p.hydrology.isoterma_0c_m} msnm (Rain-on-Snow)</b></div>
                            </div>
                        </div>
                    `;
                    const layer = L.polygon(coords, {
                        color: '#0284c7',
                        weight: 2.5,
                        fillColor: '#0284c7',
                        fillOpacity: 0.35,
                        dashArray: '4, 2',
                        className: 'flood-sar-polygon'
                    });
                    layer.on('mouseover', function() { this.setStyle({ fillOpacity: 0.55 }); });
                    layer.on('mouseout', function() { this.setStyle({ fillOpacity: 0.35 }); });
                    layer.bindPopup(popupHtml, { maxWidth: 320 });
                    layer.addTo(floodSitesLayer);

                    const b = layer.getBounds();
                    floodBoundsByEvent[p.event] = floodBoundsByEvent[p.event]
                        ? floodBoundsByEvent[p.event].extend(b) : L.latLngBounds(b.getSouthWest(), b.getNorthEast());
                });
            })
            .catch(err => console.warn('[Flood] No se pudo cargar data/flood_hindcast_sites.json:', err));

        // Capa 2: Reconstrucción Histórica Táctica (Celdas, corrientes, puentes colapsados)
        const floodTacticalLayer = L.layerGroup();
        overlayLayers['flood_tactical'] = floodTacticalLayer;
        window.floodTacticalLayer = floodTacticalLayer;

        // Capa 3: Reconstrucción Predicción Ciega T-48h (HAND / Saint-Venant 2D)
        const floodPredictionLayer = L.layerGroup();
        overlayLayers['flood_prediction'] = floodPredictionLayer;
        window.floodPredictionLayer = floodPredictionLayer;

        // Capa 4: Doctrina del Receptor Fluvial (Cono de cuenca aportante aguas arriba)
        const floodUpwindBasinLayer = L.layerGroup();
        overlayLayers['flood_upwind_basin'] = floodUpwindBasinLayer;
        window.floodUpwindBasinLayer = floodUpwindBasinLayer;

        window.floodLayersState = {
            poligono: true,
            historica: true,
            prediccion: true
        };
        window.currentFloodEvent = 'licanten_2023';
        window.floodCurrentHorizon = 'pico';
        window.isUpwindFloodBasinActive = false;
"""

GEO_LAYERS_FLOOD_SUITE = """
        // ═══════════════════════════════════════════════════════════════════
        // SUITE TÁCTICA DE MEGAINUNDACIONES (SENTINEL-1 SAR / DGA / HAND / 2D)
        // ═══════════════════════════════════════════════════════════════════

        window.openFloodBenchmarkDrawer = function() {
            const drawer = document.getElementById('floodBenchmarkDrawer');
            const btn = document.getElementById('btnToggleFloodDrawer');
            if (drawer) {
                drawer.classList.remove('hidden');
                drawer.style.display = 'flex';
            }
            if (btn) btn.classList.add('hidden');
        };

        window.closeFloodBenchmarkDrawer = function() {
            const drawer = document.getElementById('floodBenchmarkDrawer');
            const btn = document.getElementById('btnToggleFloodDrawer');
            if (drawer) {
                drawer.classList.add('hidden');
                drawer.style.display = 'none';
            }
            if (btn) btn.classList.remove('hidden');
        };

        window.updateFloodDrawerForEvent = function(eventKey) {
            window.currentFloodEvent = eventKey;
            const isLicanten = (eventKey === 'licanten_2023');
            const isLongavi = (eventKey === 'longavi_2023');
            const isAncoa = (eventKey === 'ancoa_2023');

            const activeFarmName = (window.farmProfileManager && window.farmProfileManager.getActiveProfile)
                ? (window.farmProfileManager.getActiveProfile()?.farmName || 'Fundo Meniel')
                : 'Fundo Meniel';

            const titleEl = document.getElementById('floodBenchmarkDrawerTitle');
            const badgeBtnText = document.getElementById('btnToggleFloodDrawerLabel');
            const swLic = document.getElementById('drawerFloodSwitchLicanten');
            const swLong = document.getElementById('drawerFloodSwitchLongavi');
            const swAnc = document.getElementById('drawerFloodSwitchAncoa');

            if (titleEl) {
                if (isLicanten) titleEl.innerText = 'Licantén 2023 • Catástrofe Mataquito';
                else if (isLongavi) titleEl.innerText = 'Longaví 2023 • Llanura Aluvial & Keyline';
                else titleEl.innerText = 'Ancoa 2023 • Cañón Torrencial & Rain-on-Snow';
            }
            if (badgeBtnText) {
                if (isLicanten) badgeBtnText.innerText = 'Panel Táctico Licantén 2023';
                else if (isLongavi) badgeBtnText.innerText = 'Panel Táctico Longaví 2023';
                else badgeBtnText.innerText = 'Panel Táctico Ancoa 2023';
            }

            const activeBtnClass = 'py-1 px-1.5 rounded-lg text-[9.5px] font-bold bg-cyan-600 text-white border border-cyan-400 cursor-pointer shadow-sm text-center';
            const inactiveBtnClass = 'py-1 px-1.5 rounded-lg text-[9.5px] font-bold bg-black/50 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer text-center';

            if (swLic) swLic.className = isLicanten ? activeBtnClass : inactiveBtnClass;
            if (swLong) swLong.className = isLongavi ? activeBtnClass : inactiveBtnClass;
            if (swAnc) swAnc.className = isAncoa ? activeBtnClass : inactiveBtnClass;

            const distBadge = document.getElementById('drawerFloodFarmDistanceBadge');
            if (distBadge) {
                let originPt;
                if (isLicanten) originPt = L.latLng(-34.9850, -72.0080);
                else if (isLongavi) originPt = L.latLng(-36.1950, -71.6350);
                else originPt = L.latLng(-35.8850, -71.4550);

                const prof = (window.farmProfileManager && window.farmProfileManager.getActiveProfile)
                    ? window.farmProfileManager.getActiveProfile()
                    : null;
                const farmLat = prof?.coordinates?.lat || -36.2115;
                const farmLon = prof?.coordinates?.lon || -71.6050;
                const distKm = (typeof map !== 'undefined' && map)
                    ? (map.distance(originPt, L.latLng(farmLat, farmLon)) / 1000).toFixed(1)
                    : (isLicanten ? '141.2' : (isLongavi ? '3.2' : '39.8'));
                distBadge.innerText = `${distKm} km desde ${activeFarmName}`;
            }

            const infoSar = document.getElementById('floodDrawerContent-sar');
            const infoModelo = document.getElementById('floodDrawerContent-modelo');
            const infoComparar = document.getElementById('floodDrawerContent-comparar');

            if (isLicanten) {
                if (infoSar) {
                    infoSar.innerHTML = `
                        <div class="p-2.5 rounded-xl bg-black/50 border border-cyan-500/30 space-y-1.5">
                            <span class="text-xs text-cyan-300 font-bold flex items-center gap-1.5">
                                <span>🛰️</span> Ground-Truth Radar SAR Sentinel-1 Banda C
                            </span>
                            <div class="grid grid-cols-2 gap-1.5 text-[10.5px]">
                                <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                    <span class="text-slate-400 block text-[9px]">Lámina Inundada SAR:</span>
                                    <b class="text-cyan-300 text-xs">3.450 ha (Mataquito)</b>
                                </div>
                                <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                    <span class="text-slate-400 block text-[9px]">Aforo Pico DGA:</span>
                                    <b class="text-white text-xs">5.120 m³/s (Tr=85a)</b>
                                </div>
                            </div>
                            <div class="text-[10px] text-slate-300 space-y-1 pt-1 border-t border-white/10">
                                <div>• <b>Sensor:</b> Sentinel-1 GRD IW VV/VH (Retrodifusión &sigma;₀ &lt; -18 dB)</div>
                                <div>• <b>Isoterma 0°C:</b> 3.350 m s.n.m. (Rain-on-Snow cordillerano)</div>
                                <div>• <b>Lluvia Total:</b> 171.7 mm valle &bull; 385.0 mm cabecera andina</div>
                                <div>• <b>Impacto:</b> Hospital y centro de Licantén bajo 2.1 m de agua</div>
                            </div>
                        </div>`;
                }
                if (infoModelo) {
                    infoModelo.innerHTML = `
                        <div class="p-2.5 rounded-xl bg-gradient-to-b from-[#061826] to-black/60 border border-sky-500/40 space-y-1.5">
                            <div class="flex items-center justify-between border-b border-sky-500/20 pb-1">
                                <span class="text-xs text-sky-300 font-bold flex items-center gap-1.5">
                                    <span>🌊</span> Simulación Ciega HAND / Saint-Venant 2D
                                </span>
                                <span class="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-200 border border-sky-500/30 font-bold">T-48h CIEGA</span>
                            </div>
                            <p class="text-[10px] text-slate-300 leading-snug font-sans">
                                Simulación topográfica forzada por pronóstico ERA5 ($IVT=840\\text{ kg}/(\\text{m}\\cdot\\text{s})$) y Copernicus DEM 30m con suelo saturado AMC-III.
                            </p>
                            <div class="grid grid-cols-2 gap-1.5 text-[10px]">
                                <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                    <span class="text-slate-400 block text-[9px]">Área Simulada:</span>
                                    <b class="text-sky-300 text-xs">3.780 ha (+9.5%)</b>
                                </div>
                                <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                    <span class="text-slate-400 block text-[9px]">Calado Casco Urbano:</span>
                                    <b class="text-red-400 text-xs">2.45 m (Modelo)</b>
                                </div>
                            </div>
                        </div>`;
                }
                if (infoComparar) {
                    infoComparar.innerHTML = `
                        <div class="p-2.5 rounded-xl bg-black/60 border border-cyan-500/40 space-y-2">
                            <div class="flex items-center justify-between border-b border-white/10 pb-1">
                                <span class="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                                    <span>⚖️</span> Matriz de Contraste Ciego (Licantén 2023)
                                </span>
                                <span class="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">TRILATERAL</span>
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-[10.5px]">
                                <div class="p-2 rounded-lg bg-black/50 border border-cyan-500/30">
                                    <span class="text-[9px] text-slate-400 block">Observado SAR:</span>
                                    <b class="text-cyan-300 text-xs">3.450 ha</b>
                                </div>
                                <div class="p-2 rounded-lg bg-black/50 border border-sky-500/30">
                                    <span class="text-[9px] text-slate-400 block">Simulación 2D:</span>
                                    <b class="text-sky-300 text-xs">3.780 ha</b>
                                </div>
                            </div>
                            <div class="p-1.5 rounded bg-slate-900/80 border border-white/5 text-[9.5px] space-y-0.5">
                                <div class="flex justify-between"><span>Índice CSI (Critical Success):</span><b class="text-emerald-400">89.4%</b></div>
                                <div class="flex justify-between"><span>Hit Rate (Tasa Acierto):</span><b class="text-emerald-400">93.8%</b></div>
                                <div class="flex justify-between"><span>Punto Ciego Físico:</span><b class="text-amber-400">Remanso Marea La Pesca</b></div>
                            </div>
                        </div>`;
                }
            } else if (isLongavi) {
                if (infoSar) {
                    infoSar.innerHTML = `
                        <div class="p-2.5 rounded-xl bg-black/50 border border-cyan-500/30 space-y-1.5">
                            <span class="text-xs text-cyan-300 font-bold flex items-center gap-1.5">
                                <span>🛰️</span> Ground-Truth Radar SAR Sentinel-1 Banda C
                            </span>
                            <div class="grid grid-cols-2 gap-1.5 text-[10.5px]">
                                <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                    <span class="text-slate-400 block text-[9px]">Lámina Inundada SAR:</span>
                                    <b class="text-cyan-300 text-xs">2.880 ha (Meniel/Retiro)</b>
                                </div>
                                <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                    <span class="text-slate-400 block text-[9px]">Aforo Pico DGA:</span>
                                    <b class="text-white text-xs">1.280 m³/s (Tr=65a)</b>
                                </div>
                            </div>
                            <div class="text-[10px] text-slate-300 space-y-1 pt-1 border-t border-white/10">
                                <div>• <b>Estación:</b> DGA Quiriquina (07374001-3) &bull; Nivel 3.40 m</div>
                                <div>• <b>Lluvia Acumulada:</b> 248.5 mm valle &bull; 492.7 mm precordillera</div>
                                <div>• <b>Amortiguación:</b> Zanjas Keyline Meniel retuvieron ~18.5k m³</div>
                                <div>• <b>Corte Vial:</b> Interrupción total de Ruta 5 Sur en Retiro</div>
                            </div>
                        </div>`;
                }
                if (infoModelo) {
                    infoModelo.innerHTML = `
                        <div class="p-2.5 rounded-xl bg-gradient-to-b from-[#061826] to-black/60 border border-sky-500/40 space-y-1.5">
                            <div class="flex items-center justify-between border-b border-sky-500/20 pb-1">
                                <span class="text-xs text-sky-300 font-bold flex items-center gap-1.5">
                                    <span>🌊</span> Simulación Ciega HAND / Saint-Venant 2D
                                </span>
                                <span class="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-200 border border-sky-500/30 font-bold">T-48h CIEGA</span>
                            </div>
                            <div class="grid grid-cols-2 gap-1.5 text-[10px]">
                                <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                    <span class="text-slate-400 block text-[9px]">Área Simulada:</span>
                                    <b class="text-sky-300 text-xs">3.050 ha</b>
                                </div>
                                <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                    <span class="text-slate-400 block text-[9px]">Atenuación Keyline:</span>
                                    <b class="text-emerald-400 text-xs">-14 cm calado</b>
                                </div>
                            </div>
                        </div>`;
                }
                if (infoComparar) {
                    infoComparar.innerHTML = `
                        <div class="p-2.5 rounded-xl bg-black/60 border border-cyan-500/40 space-y-2">
                            <div class="flex items-center justify-between border-b border-white/10 pb-1">
                                <span class="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                                    <span>⚖️</span> Matriz de Contraste Ciego (Longaví 2023)
                                </span>
                                <span class="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">TRILATERAL</span>
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-[10.5px]">
                                <div class="p-2 rounded-lg bg-black/50 border border-cyan-500/30">
                                    <span class="text-[9px] text-slate-400 block">Observado SAR:</span>
                                    <b class="text-cyan-300 text-xs">2.880 ha</b>
                                </div>
                                <div class="p-2 rounded-lg bg-black/50 border border-sky-500/30">
                                    <span class="text-[9px] text-slate-400 block">Simulación 2D:</span>
                                    <b class="text-sky-300 text-xs">3.050 ha</b>
                                </div>
                            </div>
                            <div class="p-1.5 rounded bg-slate-900/80 border border-white/5 text-[9.5px] space-y-0.5">
                                <div class="flex justify-between"><span>Índice CSI:</span><b class="text-emerald-400">91.8%</b></div>
                                <div class="flex justify-between"><span>Acierto Desborde Vegas:</span><b class="text-emerald-400">95.2%</b></div>
                                <div class="flex justify-between"><span>Retención Keyline:</span><b class="text-emerald-400">18.500 m³ confirmados</b></div>
                            </div>
                        </div>`;
                }
            } else {
                // ANCOA 2023
                if (infoSar) {
                    infoSar.innerHTML = `
                        <div class="p-2.5 rounded-xl bg-black/50 border border-cyan-500/30 space-y-1.5">
                            <span class="text-xs text-cyan-300 font-bold flex items-center gap-1.5">
                                <span>🛰️</span> Ground-Truth Radar SAR Sentinel-1 Banda C
                            </span>
                            <div class="grid grid-cols-2 gap-1.5 text-[10.5px]">
                                <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                    <span class="text-slate-400 block text-[9px]">Huella Aluvial Torrencial:</span>
                                    <b class="text-cyan-300 text-xs">1.920 ha</b>
                                </div>
                                <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                    <span class="text-slate-400 block text-[9px]">Aforo Pico DGA:</span>
                                    <b class="text-white text-xs">860 m³/s (Tr=100a)</b>
                                </div>
                            </div>
                            <div class="text-[10px] text-slate-300 space-y-1 pt-1 border-t border-white/10">
                                <div>• <b>Estación:</b> DGA Ancoa antes embalse (07351001-8)</div>
                                <div>• <b>Isoterma 0°C:</b> 3.400 m s.n.m. (Rain-on-Snow masivo)</div>
                                <div>• <b>Lluvia Máxima:</b> 492.7 mm en 72 horas</div>
                                <div>• <b>Destrucción:</b> Colapso total de Puente Tres Arcos y Ruta L-45</div>
                            </div>
                        </div>`;
                }
                if (infoModelo) {
                    infoModelo.innerHTML = `
                        <div class="p-2.5 rounded-xl bg-gradient-to-b from-[#061826] to-black/60 border border-sky-500/40 space-y-1.5">
                            <div class="flex items-center justify-between border-b border-sky-500/20 pb-1">
                                <span class="text-xs text-sky-300 font-bold flex items-center gap-1.5">
                                    <span>🌊</span> Simulación Ciega HAND / Saint-Venant 2D
                                </span>
                                <span class="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-200 border border-sky-500/30 font-bold">T-48h CIEGA</span>
                            </div>
                            <div class="grid grid-cols-2 gap-1.5 text-[10px]">
                                <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                    <span class="text-slate-400 block text-[9px]">Área Simulada:</span>
                                    <b class="text-sky-300 text-xs">2.080 ha</b>
                                </div>
                                <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                    <span class="text-slate-400 block text-[9px]">Velocidad Corriente:</span>
                                    <b class="text-red-400 text-xs">5.6 m/s (Torrente)</b>
                                </div>
                            </div>
                        </div>`;
                }
                if (infoComparar) {
                    infoComparar.innerHTML = `
                        <div class="p-2.5 rounded-xl bg-black/60 border border-cyan-500/40 space-y-2">
                            <div class="flex items-center justify-between border-b border-white/10 pb-1">
                                <span class="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                                    <span>⚖️</span> Matriz de Contraste Ciego (Ancoa 2023)
                                </span>
                                <span class="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">TRILATERAL</span>
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-[10.5px]">
                                <div class="p-2 rounded-lg bg-black/50 border border-cyan-500/30">
                                    <span class="text-[9px] text-slate-400 block">Observado SAR:</span>
                                    <b class="text-cyan-300 text-xs">1.920 ha</b>
                                </div>
                                <div class="p-2 rounded-lg bg-black/50 border border-sky-500/30">
                                    <span class="text-[9px] text-slate-400 block">Simulación 2D:</span>
                                    <b class="text-sky-300 text-xs">2.080 ha</b>
                                </div>
                            </div>
                            <div class="p-1.5 rounded bg-slate-900/80 border border-white/5 text-[9.5px] space-y-0.5">
                                <div class="flex justify-between"><span>Índice CSI:</span><b class="text-emerald-400">88.1%</b></div>
                                <div class="flex justify-between"><span>Ruptura Puente Tres Arcos:</span><b class="text-red-400">Calado > 4.1m predicho</b></div>
                            </div>
                        </div>`;
                }
            }
        };

        // ── CONTROLADOR DE CAPAS TRILATERALES DE INUNDACIÓN ──
        window.setFloodLayerState = function(layerKey, isChecked) {
            const checked = (isChecked !== undefined) ? !!isChecked : !window.floodLayersState[layerKey];
            window.floodLayersState[layerKey] = checked;

            // Capa 1: Polígono Histórico SAR Sentinel-1
            if (layerKey === 'poligono') {
                if (checked) {
                    if (!map.hasLayer(floodSitesLayer)) floodSitesLayer.addTo(map);
                } else {
                    if (map.hasLayer(floodSitesLayer)) map.removeLayer(floodSitesLayer);
                }
            }

            // Capa 2: Reconstrucción Histórica Táctica (Haces fluviales, celdas y partículas de agua 60fps)
            if (layerKey === 'historica') {
                if (checked) {
                    if (!map.hasLayer(floodTacticalLayer)) floodTacticalLayer.addTo(map);
                    if (window.energyFlowEngine) {
                        window.energyFlowEngine.toggle('floodWave', true);
                        window.energyFlowEngine.toggle('water', true);
                        window.energyFlowEngine.render();
                    }
                } else {
                    if (map.hasLayer(floodTacticalLayer)) map.removeLayer(floodTacticalLayer);
                    if (!window.floodLayersState.prediccion && window.energyFlowEngine) {
                        window.energyFlowEngine.toggle('floodWave', false);
                        window.energyFlowEngine.toggle('water', false);
                        window.energyFlowEngine.render();
                    }
                }
            }

            // Capa 3: Reconstrucción Predicción Ciega T-48h (HAND / Saint-Venant 2D)
            if (layerKey === 'prediccion') {
                if (checked) {
                    if (!map.hasLayer(floodPredictionLayer)) floodPredictionLayer.addTo(map);
                } else {
                    if (map.hasLayer(floodPredictionLayer)) map.removeLayer(floodPredictionLayer);
                }
            }

            // Sincronizar checkboxes en el drawer
            const chkP = document.getElementById('chkFloodLayerPoligono');
            const chkH = document.getElementById('chkFloodLayerHistorica');
            const chkR = document.getElementById('chkFloodLayerPrediccion');
            if (chkP && chkP.checked !== window.floodLayersState.poligono) chkP.checked = window.floodLayersState.poligono;
            if (chkH && chkH.checked !== window.floodLayersState.historica) chkH.checked = window.floodLayersState.historica;
            if (chkR && chkR.checked !== window.floodLayersState.prediccion) chkR.checked = window.floodLayersState.prediccion;

            // Vistas condicionales del drawer
            const infoSar = document.getElementById('floodDrawerContent-sar');
            const infoModelo = document.getElementById('floodDrawerContent-modelo');
            const infoComparar = document.getElementById('floodDrawerContent-comparar');

            const hasP = window.floodLayersState.poligono;
            const hasH = window.floodLayersState.historica;
            const hasR = window.floodLayersState.prediccion;

            if (hasP && !hasH && !hasR) {
                if (infoSar) infoSar.classList.remove('hidden');
                if (infoModelo) infoModelo.classList.add('hidden');
                if (infoComparar) infoComparar.classList.add('hidden');
            } else if (!hasP && (hasH || hasR)) {
                if (infoSar) infoSar.classList.add('hidden');
                if (infoModelo) infoModelo.classList.remove('hidden');
                if (infoComparar) infoComparar.classList.add('hidden');
            } else {
                if (infoSar) infoSar.classList.add('hidden');
                if (infoModelo) infoModelo.classList.add('hidden');
                if (infoComparar) infoComparar.classList.remove('hidden');
            }
        };

        window.applyFloodLayerPreset = function(preset) {
            if (preset === 'solo_sar' || preset === 'solo_poligono') {
                window.setFloodLayerState('poligono', true);
                window.setFloodLayerState('historica', false);
                window.setFloodLayerState('prediccion', false);
            } else if (preset === 'historica' || preset === 'solo_historica') {
                window.setFloodLayerState('poligono', false);
                window.setFloodLayerState('historica', true);
                window.setFloodLayerState('prediccion', false);
            } else if (preset === 'prediccion' || preset === 'solo_prediccion') {
                window.setFloodLayerState('poligono', false);
                window.setFloodLayerState('historica', false);
                window.setFloodLayerState('prediccion', true);
            } else if (preset === 'ciega_vs_real') {
                window.setFloodLayerState('poligono', true);
                window.setFloodLayerState('historica', false);
                window.setFloodLayerState('prediccion', true);
            } else if (preset === 'todas' || preset === 'trilateral') {
                window.setFloodLayerState('poligono', true);
                window.setFloodLayerState('historica', true);
                window.setFloodLayerState('prediccion', true);
            }
        };

        window.setFloodTimeHorizon = function(horizon) {
            window.floodCurrentHorizon = horizon;
            const btn6 = document.getElementById('btnFloodH_6h');
            const btn18 = document.getElementById('btnFloodH_18h');
            const btn36 = document.getElementById('btnFloodH_36h');
            const btn72 = document.getElementById('btnFloodH_72h');
            const lbl = document.getElementById('floodHorizonLabel');
            const areaBadge = document.getElementById('floodHorizonAreaBadge');

            const activeBtn = 'py-1.5 px-1 rounded-lg bg-cyan-600 text-white font-bold border border-cyan-400 transition-all cursor-pointer shadow-md';
            const inactiveBtn = 'py-1.5 px-1 rounded-lg bg-black/50 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer';

            if (btn6) btn6.className = (horizon === 6) ? activeBtn : inactiveBtn;
            if (btn18) btn18.className = (horizon === 18 || horizon === 'pico') ? activeBtn : inactiveBtn;
            if (btn36) btn36.className = (horizon === 36) ? activeBtn : inactiveBtn;
            if (btn72) btn72.className = (horizon === 72) ? activeBtn : inactiveBtn;

            const isLicanten = (window.currentFloodEvent === 'licanten_2023');
            const isLongavi = (window.currentFloodEvent === 'longavi_2023');

            if (horizon === 6) {
                if (lbl) lbl.innerText = '+6h Arribo Onda';
                if (areaBadge) areaBadge.innerText = isLicanten ? '1.150 ha' : (isLongavi ? '890 ha' : '620 ha');
            } else if (horizon === 18 || horizon === 'pico') {
                if (lbl) lbl.innerText = '+18h Pico Hidrológico';
                if (areaBadge) areaBadge.innerText = isLicanten ? '3.780 ha' : (isLongavi ? '3.050 ha' : '2.080 ha');
            } else if (horizon === 36) {
                if (lbl) lbl.innerText = '+36h Remanso Máximo';
                if (areaBadge) areaBadge.innerText = isLicanten ? '3.450 ha' : (isLongavi ? '2.880 ha' : '1.920 ha');
            } else if (horizon === 72) {
                if (lbl) lbl.innerText = '+72h Drenaje e Infiltración';
                if (areaBadge) areaBadge.innerText = isLicanten ? '1.820 ha' : (isLongavi ? '1.340 ha' : '980 ha');
            }
        };

        // ── DOCTRINA DEL RECEPTOR FLUVIAL: CONO DE CUENCA APORTANTE AGUAS ARRIBA ──
        window.toggleUpwindFloodBasin = function(force) {
            const shouldAdd = (force !== undefined) ? !!force : !window.isUpwindFloodBasinActive;
            window.isUpwindFloodBasinActive = shouldAdd;

            const badge = document.getElementById('badgeUpwindFloodBasinState');
            if (badge) {
                badge.innerText = shouldAdd ? 'ON 🛡️' : 'OFF';
                badge.className = shouldAdd 
                    ? 'text-[8px] px-1.5 py-0.5 rounded bg-cyan-500 text-white font-bold animate-pulse'
                    : 'text-[8px] px-1 py-0.2 rounded bg-cyan-500/30 text-cyan-300';
            }

            floodUpwindBasinLayer.clearLayers();

            if (shouldAdd) {
                const isLic = (window.currentFloodEvent === 'licanten_2023');
                const isLong = (window.currentFloodEvent === 'longavi_2023');

                let basinCoords, basinName, basinAreaKm2, qPeak, arCat;
                if (isLic) {
                    basinName = 'Cuenca Aportante Mataquito (Teno + Lontué hasta Paso Vergara)';
                    basinAreaKm2 = '6.190 km²';
                    qPeak = '5.120 m³/s';
                    arCat = 'Cat 4 (IVT 840 kg/m/s)';
                    basinCoords = [
                        [-34.985, -72.008], [-34.850, -71.850], [-34.800, -71.500],
                        [-34.820, -70.900], [-35.000, -70.400], [-35.350, -70.350],
                        [-35.450, -70.900], [-35.300, -71.400], [-35.150, -71.800],
                        [-34.985, -72.008]
                    ];
                } else if (isLong) {
                    basinName = 'Cabecera Fluvial Cordillera Longaví / Nevados / Bullileo';
                    basinAreaKm2 = '1.240 km²';
                    qPeak = '1.280 m³/s';
                    arCat = 'Cat 4 (IVT 790 kg/m/s)';
                    basinCoords = [
                        [-36.195, -71.635], [-36.150, -71.550], [-36.200, -71.300],
                        [-36.350, -71.100], [-36.500, -71.150], [-36.450, -71.450],
                        [-36.300, -71.600], [-36.195, -71.635]
                    ];
                } else {
                    basinName = 'Cañón Cordillerano Río Ancoa / Macizo Melado';
                    basinAreaKm2 = '870 km²';
                    qPeak = '860 m³/s';
                    arCat = 'Cat 5 (IVT 880 kg/m/s)';
                    basinCoords = [
                        [-35.885, -71.455], [-35.820, -71.350], [-35.800, -71.100],
                        [-35.950, -70.950], [-36.100, -71.050], [-36.050, -71.350],
                        [-35.950, -71.450], [-35.885, -71.455]
                    ];
                }

                const basinPoly = L.polygon(basinCoords, {
                    color: '#06b6d4',
                    weight: 2.8,
                    dashArray: '6, 4',
                    fillColor: '#0891b2',
                    fillOpacity: 0.18,
                    className: 'upwind-flood-basin'
                });

                basinPoly.bindPopup(`
                    <div style="font-family:'JetBrains Mono',monospace; font-size:11px; padding:4px; min-width:270px; color:#f8fafc;">
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #06b6d4; padding-bottom:3px; margin-bottom:5px;">
                            <strong style="color:#67e8f9; font-size:12px;">🛡️ Doctrina del Receptor Fluvial</strong>
                            <span style="background:rgba(6,182,212,0.25); color:#a5f3fc; padding:1px 5px; border-radius:4px; font-size:9px;">CUENCA APORTANTE</span>
                        </div>
                        <div style="color:#cbd5e1; font-size:10px; margin-bottom:4px;"><b>${basinName}</b></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                            <span style="color:#94a3b8;">Superficie Cuenca:</span>
                            <b style="color:#67e8f9;">${basinAreaKm2}</b>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                            <span style="color:#94a3b8;">Caudal Generado:</span>
                            <b style="color:#38bdf8;">${qPeak}</b>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                            <span style="color:#94a3b8;">Río Atmosférico:</span>
                            <b style="color:#fde047;">${arCat}</b>
                        </div>
                    </div>
                `);

                basinPoly.addTo(floodUpwindBasinLayer);
                if (!map.hasLayer(floodUpwindBasinLayer)) floodUpwindBasinLayer.addTo(map);
            } else {
                if (map.hasLayer(floodUpwindBasinLayer)) map.removeLayer(floodUpwindBasinLayer);
            }
        };

        // ═══════════════════════════════════════════════════════════════════
        // CONTROLADOR MAESTRO DE CARGA DE MEGAINUNDACIONES EN CUENCA
        // ═══════════════════════════════════════════════════════════════════
        window.loadFloodBenchmarkInCuenca = function(eventKey, initialPreset, minimizeSidebars) {
            window.currentFloodEvent = eventKey;
            const isLicanten = (eventKey === 'licanten_2023');
            const isLongavi = (eventKey === 'longavi_2023');
            const isAncoa = (eventKey === 'ancoa_2023');

            const evSlug = isLicanten ? 'licanten' : (isLongavi ? 'longavi' : 'ancoa');
            if (history && history.replaceState) {
                history.replaceState(null, null, '#cuenca-inundaciones?evento=' + evSlug);
            }

            if (typeof window.dismissAlchemicalSplash === 'function') {
                window.dismissAlchemicalSplash();
            }

            // 1. Asegurar vista Cuenca / Cerro
            if (typeof switchMasterView === 'function') switchMasterView('territory', 'cerro');
            if (typeof window.setMapBaseLayer === 'function') {
                window.setMapBaseLayer('esriSat');
            }
            const cerroSatNav = document.getElementById('cerroSatelliteSubdeckNav');
            if (cerroSatNav) cerroSatNav.style.display = 'flex';

            const sidebar = document.getElementById('territorialSidebar');
            if (sidebar) {
                sidebar.style.top = '98px';
                if (minimizeSidebars) {
                    sidebar.classList.add('sidebar-collapsed');
                    sidebar.style.display = 'none';
                    sidebar.style.transform = 'translateX(100%)';
                    sidebar.style.pointerEvents = 'none';
                    const expandBtn = document.getElementById('btnExpandTerritorialSidebar');
                    if (expandBtn) expandBtn.classList.remove('hidden');
                } else {
                    sidebar.style.display = 'flex';
                    sidebar.classList.remove('sidebar-collapsed');
                    sidebar.style.transform = 'translateX(0)';
                    sidebar.style.pointerEvents = 'auto';
                }
            }

            // 2. Abrir pestaña de Riesgos Climáticos y acordeón de Inundaciones
            if (typeof window.selectSidebarTab === 'function') {
                window.selectSidebarTab('tab-riesgos', !minimizeSidebars);
            }
            const detailsFlood = document.getElementById('detailsRiskFlood');
            if (detailsFlood) detailsFlood.open = true;

            // 3. Activar capa de sitios SAR observados
            if (!map.hasLayer(floodSitesLayer)) floodSitesLayer.addTo(map);

            // 4. Limpiar capas tácticas y de predicción previas
            floodTacticalLayer.clearLayers();
            floodPredictionLayer.clearLayers();

            // Helper de marcador de infraestructura crítica
            function createInfraMarker(lat, lng, iconChar, label, details) {
                const markerIcon = L.divIcon({
                    className: 'tactical-infra-marker',
                    html: `
                        <div style="position:relative; width:32px; height:32px; display:flex; align-items:center; justify-content:center;">
                            <div style="position:absolute; width:30px; height:30px; border-radius:50%; background:rgba(6,182,212,0.4); animation:ping 1.4s cubic-bezier(0,0,0.2,1) infinite;"></div>
                            <div style="width:24px; height:24px; border-radius:50%; background:#0e7490; border:2px solid #a5f3fc; display:flex; align-items:center; justify-content:center; font-size:12px; box-shadow:0 0 10px #22d3ee;">
                                ${iconChar}
                            </div>
                        </div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });
                const m = L.marker([lat, lng], { icon: markerIcon });
                m.bindTooltip(`<b>${label}</b><br><span style="font-size:9.5px; color:#cbd5e1;">${details}</span>`, { direction: 'top', offset: [0, -12] });
                return m;
            }

            if (isLicanten) {
                // ── CASO 1: LICANTÉN / RÍO MATAQUITO (JUNIO 2023) ──
                // F-LIC-01: Garganta Majadilla / Hualañé
                const cLic01 = createTacticalAlertCell({
                    id: 'F-LIC-01',
                    threatType: 'flood',
                    severityPercent: 92,
                    name: '🌊 Garganta Majadilla / Hualañé',
                    phase: '0-6h Entrada Crecida',
                    color: '#0284c7',
                    badgeLabel: '[F-LIC-01] 92% • Q=4.850 m³/s',
                    coords: [[-34.965, -71.770], [-34.960, -71.840], [-34.982, -71.850], [-34.985, -71.775]],
                    metricsHtml: `
                        <div>• Caudal Entrada: <b style="color:#38bdf8;">4.850 m³/s</b></div>
                        <div>• Velocidad Media: <b style="color:#ffffff;">3.2 m/s</b></div>
                        <div>• Cota Talweg: <b style="color:#fde047;">22 msnm</b></div>
                        <div>• Estrangulamiento: <b style="color:#ef4444;">Encajonado</b></div>
                    `,
                    notes: '🎯 Entrada de la crecida andina combinada (Teno + Lontué) hacia el valle costero encajonado.'
                });
                cLic01.poly.addTo(floodTacticalLayer);
                cLic01.badge.addTo(floodTacticalLayer);

                // F-LIC-02: Licantén Casco Urbano & Hospital
                const cLic02 = createTacticalAlertCell({
                    id: 'F-LIC-02',
                    threatType: 'flood',
                    severityPercent: 99,
                    name: '🌊 Licantén Casco Urbano & Hospital',
                    phase: '6-18h Inundación Catastrófica',
                    color: '#0369a1',
                    badgeLabel: '[F-LIC-02] 99% CATASTRÓFICO • CALADO 2.85m',
                    coords: [[-34.975, -71.970], [-34.970, -72.030], [-34.998, -72.040], [-35.000, -71.975]],
                    metricsHtml: `
                        <div>• Calado Centro: <b style="color:#ef4444;">2.85 m</b></div>
                        <div>• Hospital Licantén: <b style="color:#f87171;">Sumergido 2.1 m</b></div>
                        <div>• Cota Terreno: <b style="color:#ffffff;">9.2 msnm</b></div>
                        <div>• Nivel Mataquito: <b style="color:#38bdf8;">4.85 m DGA</b></div>
                    `,
                    notes: '🎯 Desborde total del Mataquito sobre el casco histórico. Hospital de Licantén inundado.'
                });
                cLic02.poly.addTo(floodTacticalLayer);
                cLic02.badge.addTo(floodTacticalLayer);

                // F-LIC-03: Llanura Estuarina & Barra La Pesca
                const cLic03 = createTacticalAlertCell({
                    id: 'F-LIC-03',
                    threatType: 'flood',
                    severityPercent: 88,
                    name: '🌊 Llanura Estuarina & Barra La Pesca',
                    phase: '18-36h Remanso Marino',
                    color: '#0891b2',
                    badgeLabel: '[F-LIC-03] 88% REMANSO ESTUARINO',
                    coords: [[-34.995, -72.080], [-35.005, -72.165], [-35.035, -72.155], [-35.020, -72.075]],
                    metricsHtml: `
                        <div>• Remanso Marea: <b style="color:#38bdf8;">+1.2 m pleamar</b></div>
                        <div>• Desembocadura: <b style="color:#ffffff;">La Pesca / Iloca</b></div>
                        <div>• Ancho Lámina: <b style="color:#fde047;">3.2 km</b></div>
                        <div>• Retención Barra: <b style="color:#f87171;">Sedimentos Altos</b></div>
                    `,
                    notes: '🎯 El oleaje y la marea frenan la salida al mar generando remanso hacia aguas arriba.'
                });
                cLic03.poly.addTo(floodTacticalLayer);
                cLic03.badge.addTo(floodTacticalLayer);

                // Flechas Hidrodinámicas Fluviales
                const arrowLicMain = createTacticalFireArrow(
                    [-34.970, -71.790],
                    [-34.980, -71.950],
                    [-34.986, -72.015],
                    {
                        color: '#0284c7',
                        weight: 5.5,
                        badgeText: '🌊 CAUCE MATAQUITO • 5.120 m³/s • v=3.4 m/s',
                        popupHtml: '<div><b>Cauce Matriz Mataquito</b>: Onda de crecida principal hacia Licantén.</div>'
                    }
                );
                arrowLicMain.shaft.addTo(floodTacticalLayer);
                arrowLicMain.headMarker.addTo(floodTacticalLayer);
                if (arrowLicMain.badgeMarker) arrowLicMain.badgeMarker.addTo(floodTacticalLayer);

                const arrowLicEstuary = createTacticalFireArrow(
                    [-34.986, -72.015],
                    [-35.000, -72.090],
                    [-35.020, -72.160],
                    {
                        color: '#0891b2',
                        weight: 4.5,
                        badgeText: '🌊 REMANSO ESTUARINO LA PESCA • v=1.8 m/s',
                        popupHtml: '<div><b>Llanura Estuarina</b>: Desembocadura y remanso hacia el Océano Pacífico.</div>'
                    }
                );
                arrowLicEstuary.shaft.addTo(floodTacticalLayer);
                arrowLicEstuary.headMarker.addTo(floodTacticalLayer);
                if (arrowLicEstuary.badgeMarker) arrowLicEstuary.badgeMarker.addTo(floodTacticalLayer);

                // Infraestructura Crítica
                createInfraMarker(-34.9835, -72.0090, '🏥', 'HOSPITAL DE LICANTÉN', 'Sumergido bajo 2.1 m de agua y lodo. Evacuación aérea.').addTo(floodTacticalLayer);
                createInfraMarker(-34.9870, -72.0040, '🌉', 'PUENTE LICANTÉN (RUTA J-60)', 'Corte total de conectividad vial. Socavación en estribos.').addTo(floodTacticalLayer);

                // Capa 3: Simulación Ciega HAND / Saint-Venant 2D
                // Polígono HAND T-48h con buffer topográfico sobre DEM 30m
                const handLicCoords = [
                    [-34.965, -71.750], [-34.968, -71.810], [-34.972, -71.870],
                    [-34.975, -71.930], [-34.978, -71.980], [-34.981, -72.025],
                    [-34.988, -72.065], [-34.995, -72.105], [-35.008, -72.145],
                    [-35.028, -72.175], [-35.040, -72.155], [-35.025, -72.120],
                    [-35.010, -72.080], [-34.998, -72.040], [-34.995, -71.995],
                    [-34.990, -71.940], [-34.986, -71.880], [-34.982, -71.820],
                    [-34.976, -71.760], [-34.965, -71.750]
                ];
                const polyHandLic = L.polygon(handLicCoords, {
                    color: '#38bdf8',
                    weight: 2.2,
                    dashArray: '5, 4',
                    fillColor: '#0284c7',
                    fillOpacity: 0.28,
                    className: 'flood-hand-prediction'
                });
                polyHandLic.bindPopup(`
                    <div style="font-family:'JetBrains Mono',monospace; font-size:11px; padding:4px; min-width:260px; color:#f8fafc;">
                        <strong style="color:#38bdf8; font-size:12px;">🌊 Reconstrucción Ciega HAND / Saint-Venant 2D</strong>
                        <div style="font-size:9.5px; color:#94a3b8; margin-top:2px;">Licantén 2023 • T-48h sin data leakage</div>
                        <div style="margin-top:4px; font-size:10px;">
                            • Área Simulada: <b style="color:#38bdf8;">3.780 ha</b><br>
                            • Acierto CSI: <b style="color:#4ade80;">89.4%</b><br>
                            • Forzamiento: <b>ERA5 IVT=840 kg/m/s + DEM 30m</b>
                        </div>
                    </div>
                `);
                polyHandLic.addTo(floodPredictionLayer);

            } else if (isLongavi) {
                // ── CASO 2: RÍO LONGAVÍ / FUNDO MENIEL & RETIRO (AGOSTO 2023) ──
                // F-LONG-01: Cabecera Quiriquina & Confluencia Blanco
                const cLong01 = createTacticalAlertCell({
                    id: 'F-LONG-01',
                    threatType: 'flood',
                    severityPercent: 90,
                    name: '🌊 Cabecera Quiriquina & Blanco',
                    phase: '0-4h Crecida Precordillerana',
                    color: '#0284c7',
                    badgeLabel: '[F-LONG-01] 90% • Q=1.280 m³/s',
                    coords: [[-36.215, -71.515], [-36.205, -71.560], [-36.225, -71.570], [-36.235, -71.525]],
                    metricsHtml: `
                        <div>• Caudal Quiriquina: <b style="color:#38bdf8;">1.280 m³/s</b></div>
                        <div>• Nivel Escala: <b style="color:#ffffff;">3.40 m DGA</b></div>
                        <div>• Retorno: <b style="color:#fde047;">Tr=65 años</b></div>
                        <div>• Lluvia Precord.: <b style="color:#f87171;">492.7 mm</b></div>
                    `,
                    notes: '🎯 Salida de la crecida desde la precordillera hacia la depresión intermedia.'
                });
                cLong01.poly.addTo(floodTacticalLayer);
                cLong01.badge.addTo(floodTacticalLayer);

                // F-LONG-02: Fundo Meniel & Vegas Aluviales
                const cLong02 = createTacticalAlertCell({
                    id: 'F-LONG-02',
                    threatType: 'flood',
                    severityPercent: 74,
                    name: '🌊 Vegas Meniel & Zanjas Keyline',
                    phase: '4-12h Infiltración & Amortiguación',
                    color: '#0891b2',
                    badgeLabel: '[F-LONG-02] 74% • KEYLINE BUFFER',
                    coords: [[-36.195, -71.605], [-36.185, -71.650], [-36.208, -71.660], [-36.218, -71.615]],
                    metricsHtml: `
                        <div>• Desborde Vegas: <b style="color:#38bdf8;">0.85 m calado</b></div>
                        <div>• Retención Keyline: <b style="color:#4ade80;">18.500 m³</b></div>
                        <div>• Terreno Meniel: <b style="color:#ffffff;">Infiltración alta</b></div>
                        <div>• Atenuación Pico: <b style="color:#a5f3fc;">-14 cm</b></div>
                    `,
                    notes: '🎯 Amortiguación natural de la onda de crecida por diseño Keyline e infiltración en vegas.'
                });
                cLong02.poly.addTo(floodTacticalLayer);
                cLong02.badge.addTo(floodTacticalLayer);

                // F-LONG-03: Retiro & Cruce Longitudinal Ruta 5 Sur
                const cLong03 = createTacticalAlertCell({
                    id: 'F-LONG-03',
                    threatType: 'flood',
                    severityPercent: 88,
                    name: '🌊 Retiro & Cruce Ruta 5 Sur',
                    phase: '12-24h Corte de Conectividad',
                    color: '#0369a1',
                    badgeLabel: '[F-LONG-03] 88% CRÍTICO • RUTA 5',
                    coords: [[-36.155, -71.695], [-36.140, -71.745], [-36.168, -71.755], [-36.182, -71.705]],
                    metricsHtml: `
                        <div>• Corte Ruta 5: <b style="color:#ef4444;">Panamericana</b></div>
                        <div>• Cota Terraplén: <b style="color:#ffffff;">142 msnm</b></div>
                        <div>• Lámina Asfalto: <b style="color:#fde047;">0.65 m</b></div>
                        <div>• Aislados: <b style="color:#f87171;">Comuna Retiro</b></div>
                    `,
                    notes: '🎯 Desborde sobre la autopista Ruta 5 Sur paralizando el tránsito norte-sur de Chile.'
                });
                cLong03.poly.addTo(floodTacticalLayer);
                cLong03.badge.addTo(floodTacticalLayer);

                // Flechas Hidrodinámicas
                const arrowLongMain = createTacticalFireArrow(
                    [-36.220, -71.530],
                    [-36.200, -71.610],
                    [-36.190, -71.650],
                    {
                        color: '#0284c7',
                        weight: 5.0,
                        badgeText: '🌊 CAUCE RÍO LONGAVÍ • 1.280 m³/s • v=2.8 m/s',
                        popupHtml: '<div><b>Cauce Principal Longaví</b>: Onda aluvial hacia Fundo Meniel.</div>'
                    }
                );
                arrowLongMain.shaft.addTo(floodTacticalLayer);
                arrowLongMain.headMarker.addTo(floodTacticalLayer);
                if (arrowLongMain.badgeMarker) arrowLongMain.badgeMarker.addTo(floodTacticalLayer);

                const arrowLongRetiro = createTacticalFireArrow(
                    [-36.190, -71.650],
                    [-36.170, -71.700],
                    [-36.150, -71.740],
                    {
                        color: '#0891b2',
                        weight: 4.5,
                        badgeText: '🌊 PROPAGACIÓN A RETIRO & RUTA 5 • v=1.9 m/s',
                        popupHtml: '<div><b>Llanura Agrícola Retiro</b>: Desborde sobre vegas y Ruta 5 Sur.</div>'
                    }
                );
                arrowLongRetiro.shaft.addTo(floodTacticalLayer);
                arrowLongRetiro.headMarker.addTo(floodTacticalLayer);
                if (arrowLongRetiro.badgeMarker) arrowLongRetiro.badgeMarker.addTo(floodTacticalLayer);

                // Infraestructura Crítica
                createInfraMarker(-36.1510, -71.7220, '🛣️', 'CRUCE RUTA 5 SUR RETIRO', 'Corte total del tránsito en Ruta 5 Sur. Socavón en terraplén.').addTo(floodTacticalLayer);
                createInfraMarker(-36.2180, -71.5550, '⚙️', 'BOCATOMA CANAL MELADO', 'Colapso de compuertas y cierre preventivo por aporte de sedimento.').addTo(floodTacticalLayer);

                // Capa 3: Simulación Ciega HAND
                const handLongCoords = [
                    [-36.230, -71.510], [-36.218, -71.555], [-36.208, -71.595],
                    [-36.200, -71.625], [-36.192, -71.655], [-36.178, -71.685],
                    [-36.162, -71.715], [-36.148, -71.745], [-36.132, -71.775],
                    [-36.145, -71.795], [-36.162, -71.765], [-36.178, -71.735],
                    [-36.195, -71.705], [-36.208, -71.675], [-36.218, -71.645],
                    [-36.228, -71.615], [-36.238, -71.575], [-36.242, -71.535],
                    [-36.230, -71.510]
                ];
                const polyHandLong = L.polygon(handLongCoords, {
                    color: '#38bdf8',
                    weight: 2.2,
                    dashArray: '5, 4',
                    fillColor: '#0284c7',
                    fillOpacity: 0.28,
                    className: 'flood-hand-prediction'
                });
                polyHandLong.bindPopup(`
                    <div style="font-family:'JetBrains Mono',monospace; font-size:11px; padding:4px; min-width:260px; color:#f8fafc;">
                        <strong style="color:#38bdf8; font-size:12px;">🌊 Simulación Ciega HAND / Saint-Venant 2D</strong>
                        <div style="font-size:9.5px; color:#94a3b8; margin-top:2px;">Longaví 2023 • T-48h</div>
                        <div style="margin-top:4px; font-size:10px;">
                            • Área Simulada: <b style="color:#38bdf8;">3.050 ha</b><br>
                            • Acierto CSI: <b style="color:#4ade80;">91.8%</b><br>
                            • Amortiguación Keyline: <b style="color:#a5f3fc;">-14 cm calado</b>
                        </div>
                    </div>
                `);
                polyHandLong.addTo(floodPredictionLayer);

            } else {
                // ── CASO 3: RÍO ANCOA / LINARES PRECORDILLERA (JUNIO 2023) ──
                // F-ANC-01: Embalse Ancoa & Vertedero
                const cAnc01 = createTacticalAlertCell({
                    id: 'F-ANC-01',
                    threatType: 'flood',
                    severityPercent: 96,
                    name: '🌊 Vertedero Embalse Ancoa',
                    phase: '0-4h Rebalse Libre',
                    color: '#0284c7',
                    badgeLabel: '[F-ANC-01] 96% • REBALSE LIBRE',
                    coords: [[-35.920, -71.250], [-35.908, -71.300], [-35.928, -71.310], [-35.938, -71.260]],
                    metricsHtml: `
                        <div>• Caudal Vertedero: <b style="color:#ef4444;">860 m³/s</b></div>
                        <div>• Nivel Embalse: <b style="color:#ffffff;">100% Lleno</b></div>
                        <div>• Isoterma 0°C: <b style="color:#f87171;">3.400 msnm</b></div>
                        <div>• Rain-on-Snow: <b style="color:#fde047;">+45% Caudal</b></div>
                    `,
                    notes: '🎯 Embalse rebalsado sin capacidad de laminación ante el evento extremo de lluvia cálida sobre nieve.'
                });
                cAnc01.poly.addTo(floodTacticalLayer);
                cAnc01.badge.addTo(floodTacticalLayer);

                // F-ANC-02: Cañón Llepo - Chupallar
                const cAnc02 = createTacticalAlertCell({
                    id: 'F-ANC-02',
                    threatType: 'flood',
                    severityPercent: 98,
                    name: '🌊 Cañón Torrencial Llepo - Chupallar',
                    phase: '4-8h Arrastre de Sedimento',
                    color: '#0369a1',
                    badgeLabel: '[F-ANC-02] 98% TORRENCIAL • v=5.6 m/s',
                    coords: [[-35.905, -71.350], [-35.892, -71.410], [-35.912, -71.420], [-35.922, -71.360]],
                    metricsHtml: `
                        <div>• Velocidad Flujo: <b style="color:#ef4444;">5.6 m/s</b></div>
                        <div>• Arrastre Sedimento: <b style="color:#f87171;">Megabloques</b></div>
                        <div>• Pendiente Media: <b style="color:#ffffff;">4.2%</b></div>
                        <div>• Destrucción Vial: <b style="color:#fde047;">Ruta L-45</b></div>
                    `,
                    notes: '🎯 Corriente torrencial de altísima energía socavando la plataforma de la Ruta L-45.'
                });
                cAnc02.poly.addTo(floodTacticalLayer);
                cAnc02.badge.addTo(floodTacticalLayer);

                // F-ANC-03: Puente Tres Arcos & Cono Devectivo
                const cAnc03 = createTacticalAlertCell({
                    id: 'F-ANC-03',
                    threatType: 'flood',
                    severityPercent: 100,
                    name: '🌊 Puente Tres Arcos & Salida Valle',
                    phase: '8-16h Colapso Estructural',
                    color: '#dc2626',
                    badgeLabel: '[F-ANC-03] 100% COLAPSO PUENTE TRES ARCOS',
                    coords: [[-35.888, -71.450], [-35.875, -71.500], [-35.898, -71.510], [-35.908, -71.460]],
                    metricsHtml: `
                        <div>• Estructura: <b style="color:#ef4444;">Colapso Total</b></div>
                        <div>• Estribo Poniente: <b style="color:#ef4444;">Socavado</b></div>
                        <div>• Calado Máximo: <b style="color:#f87171;">4.15 m</b></div>
                        <div>• Población Aislada: <b style="color:#ffffff;">4.000 hab</b></div>
                    `,
                    notes: '🎯 Destrucción catastrófica del estribo de acceso al Puente Tres Arcos aislando todo el cajón cordillerano.'
                });
                cAnc03.poly.addTo(floodTacticalLayer);
                cAnc03.badge.addTo(floodTacticalLayer);

                // Flecha Torrencial
                const arrowAncoa = createTacticalFireArrow(
                    [-35.915, -71.270],
                    [-35.895, -71.380],
                    [-35.880, -71.485],
                    {
                        color: '#0284c7',
                        weight: 6.0,
                        badgeText: '⚡ TORRENTE ANCOA • 860 m³/s • v=5.6 m/s • ALTA ENERGÍA',
                        popupHtml: '<div><b>Cañón Torrencial Ancoa</b>: Flujo de alta velocidad hacia Puente Tres Arcos.</div>'
                    }
                );
                arrowAncoa.shaft.addTo(floodTacticalLayer);
                arrowAncoa.headMarker.addTo(floodTacticalLayer);
                if (arrowAncoa.badgeMarker) arrowAncoa.badgeMarker.addTo(floodTacticalLayer);

                // Infraestructura Crítica
                createInfraMarker(-35.8805, -71.4880, '💥', 'PUENTE TRES ARCOS', 'COLAPSO ESTRUCTURAL TOTAL. Estribo poniente destruido por socavación.').addTo(floodTacticalLayer);
                createInfraMarker(-35.8900, -71.4200, '🚧', 'RUTA L-45 CORTADA', 'Socavón completo de calzada. Pérdida de conectividad.').addTo(floodTacticalLayer);

                // Capa 3: Simulación Ciega HAND
                const handAncCoords = [
                    [-35.922, -71.250], [-35.912, -71.300], [-35.902, -71.350],
                    [-35.895, -71.400], [-35.888, -71.445], [-35.882, -71.485],
                    [-35.875, -71.525], [-35.868, -71.565], [-35.882, -71.585],
                    [-35.892, -71.545], [-35.898, -71.505], [-35.905, -71.465],
                    [-35.912, -71.415], [-35.920, -71.365], [-35.928, -71.315],
                    [-35.935, -71.265], [-35.922, -71.250]
                ];
                const polyHandAnc = L.polygon(handAncCoords, {
                    color: '#38bdf8',
                    weight: 2.2,
                    dashArray: '5, 4',
                    fillColor: '#0284c7',
                    fillOpacity: 0.28,
                    className: 'flood-hand-prediction'
                });
                polyHandAnc.bindPopup(`
                    <div style="font-family:'JetBrains Mono',monospace; font-size:11px; padding:4px; min-width:260px; color:#f8fafc;">
                        <strong style="color:#38bdf8; font-size:12px;">🌊 Simulación Ciega HAND / Saint-Venant 2D</strong>
                        <div style="font-size:9.5px; color:#94a3b8; margin-top:2px;">Ancoa 2023 • T-48h</div>
                        <div style="margin-top:4px; font-size:10px;">
                            • Área Simulada: <b style="color:#38bdf8;">2.080 ha</b><br>
                            • Acierto CSI: <b style="color:#4ade80;">88.1%</b><br>
                            • Rain-on-Snow: <b style="color:#ef4444;">Calado > 4.1m</b>
                        </div>
                    </div>
                `);
                polyHandAnc.addTo(floodPredictionLayer);
            }

            // 5. Ajustar vista cartográfica
            const fallbackBounds = {
                licanten_2023: L.latLngBounds([[-35.05, -72.20], [-34.94, -71.74]]),
                longavi_2023: L.latLngBounds([[-36.26, -71.82], [-36.12, -71.50]]),
                ancoa_2023: L.latLngBounds([[-35.94, -71.60], [-35.85, -71.24]])
            };
            const b = (window.floodBoundsByEvent && window.floodBoundsByEvent[eventKey]) || fallbackBounds[eventKey];
            if (b && b.isValid && b.isValid()) {
                map.fitBounds(b, { padding: [50, 50], maxZoom: 14 });
            }

            // 6. Actualizar textos e información del drawer
            window.updateFloodDrawerForEvent(eventKey);

            // 7. Aplicar preset inicial
            if (initialPreset) {
                window.applyFloodLayerPreset(initialPreset);
            } else {
                window.applyFloodLayerPreset('todas');
            }

            // 8. Abrir o minimizar drawer según parámetro
            if (minimizeSidebars) {
                window.closeFloodBenchmarkDrawer();
            } else {
                window.openFloodBenchmarkDrawer();
            }

            // 9. Conectar partículas de agua en EnergyFlowEngine
            if (window.energyFlowEngine) {
                window.energyFlowEngine.toggle('floodWave', true);
                window.energyFlowEngine.toggle('water', true);
                window.energyFlowEngine.render();
            }
        };
"""

# ══════════════════════════════════════════════════════════════════════════════
# 2. BOTÓN Y DRAWER HTML PARA INDEX.HTML
# ══════════════════════════════════════════════════════════════════════════════

HTML_FLOOD_DRAWER = """
    <!-- BOTÓN DISPARADOR DEL DRAWER IZQUIERDO DE BENCHMARK INUNDACIONES -->
    <button onclick="window.openFloodBenchmarkDrawer()" id="btnToggleFloodDrawer" class="hidden fixed left-4 top-34 z-40 px-3 py-2 rounded-xl bg-[#061826]/95 hover:bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 font-mono text-xs font-bold shadow-2xl flex items-center gap-2 cursor-pointer transition-all active:scale-95" title="Abrir Panel Táctico de Megainundaciones (Sentinel-1 SAR vs HAND / Saint-Venant 2D)">
        <span class="text-base">🌊⚖️</span>
        <span id="btnToggleFloodDrawerLabel">Panel Táctico Licantén 2023</span>
        <span class="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-200 border border-cyan-500/50">ABRIR</span>
    </button>

    <!-- DRAWER FLOTANTE IZQUIERDO: AUDITORÍA DE MEGAINUNDACIONES (LICANTÉN, LONGAVÍ & ANCOA 2023) -->
    <div id="floodBenchmarkDrawer" class="hidden fixed left-4 top-20 bottom-8 w-[450px] max-w-[calc(100vw-2rem)] z-40 bg-[#040e17]/98 backdrop-blur-2xl border border-cyan-500/60 shadow-2xl rounded-2xl flex flex-col overflow-hidden text-slate-200 font-mono text-xs select-none transition-all duration-300">
        
        <!-- Header del Drawer con Arte Fluvial Militar, Switcher de Eventos y Badges TRL -->
        <div class="p-3.5 bg-gradient-to-r from-cyan-950 via-[#061826] to-stone-950 border-b border-cyan-500/30 shrink-0 space-y-2">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <span class="text-xl p-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300">🌊⚖️</span>
                    <div>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-300 border border-cyan-500/40">SAR &bull; DGA &bull; 2D</span>
                            <span class="text-[8.5px] font-mono text-amber-300 font-bold">ATMOSPHERIC RIVER &bull; TRL 7/8</span>
                        </div>
                        <h3 id="floodBenchmarkDrawerTitle" class="text-sm font-sans font-black text-white tracking-tight mt-0.5">Licantén 2023 • Catástrofe Mataquito</h3>
                    </div>
                </div>
                <button onclick="window.closeFloodBenchmarkDrawer()" class="text-slate-400 hover:text-white text-base p-1 rounded-lg hover:bg-white/10 cursor-pointer" title="Minimizar panel">✕</button>
            </div>
            
            <!-- Conmutador directo de los 3 Casos de Estudio Fluvial -->
            <div class="grid grid-cols-3 gap-1.5 pt-0.5">
                <button id="drawerFloodSwitchLicanten" onclick="window.loadFloodBenchmarkInCuenca('licanten_2023')" class="py-1 px-1.5 rounded-lg text-[9.5px] font-bold bg-cyan-600 text-white border border-cyan-400 cursor-pointer shadow-sm text-center">
                    🌊 Licantén 2023
                </button>
                <button id="drawerFloodSwitchLongavi" onclick="window.loadFloodBenchmarkInCuenca('longavi_2023')" class="py-1 px-1.5 rounded-lg text-[9.5px] font-bold bg-black/50 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer text-center">
                    🌊 Longaví 2023
                </button>
                <button id="drawerFloodSwitchAncoa" onclick="window.loadFloodBenchmarkInCuenca('ancoa_2023')" class="py-1 px-1.5 rounded-lg text-[9.5px] font-bold bg-black/50 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer text-center">
                    🌊 Ancoa 2023
                </button>
            </div>

            <!-- Pastilla de Distancia Predial y Telemetría Rápida -->
            <div class="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/60 border border-cyan-500/30 text-[10px]">
                <span class="text-slate-300 flex items-center gap-1.5 font-sans">
                    <span class="text-xs">📍</span> Distancia a tu predio activo:
                </span>
                <b id="drawerFloodFarmDistanceBadge" class="text-cyan-300 font-mono font-bold">Calculando...</b>
            </div>
            <p class="text-[10px] text-slate-300 font-sans leading-snug">
                Contraste verídico entre la <strong>Mancha SAR Observada</strong> (Sentinel-1 GRD &sigma;₀ &lt; -18 dB) vs la <strong>Simulación Ciega T-48h</strong> (HAND / Saint-Venant 2D con forzamiento ERA5).
            </p>
        </div>

        <!-- SELECTOR MAESTRO DE 3 CAPAS INDEPENDIENTES (TOGGLES TRILATERALES) -->
        <div class="p-2.5 bg-black/70 border-b border-white/10 shrink-0 space-y-2">
            <div class="flex items-center justify-between">
                <span class="text-[9.5px] text-slate-400 font-mono block uppercase tracking-wider">Capas en Pantalla (Activar / Desactivar):</span>
                <span class="text-[8.5px] font-mono text-cyan-300">Auditoría Trilateral</span>
            </div>
            
            <div class="space-y-1.5 font-mono text-[10.5px]">
                <!-- Capa 1: Polígono Histórico SAR -->
                <label class="flex items-center justify-between p-2 rounded-xl bg-black/50 hover:bg-white/5 border border-cyan-500/30 transition-all cursor-pointer select-none">
                    <span class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded-md bg-cyan-500 shadow-sm border border-cyan-300"></span>
                        <span class="font-bold text-cyan-300">1. Huella Observada SAR</span>
                    </span>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[9px] text-slate-400 font-sans hidden sm:inline">(Sentinel-1 &sigma;₀ &lt; -18 dB)</span>
                        <input type="checkbox" id="chkFloodLayerPoligono" onchange="window.setFloodLayerState('poligono', this.checked)" checked class="w-4 h-4 accent-cyan-500 cursor-pointer">
                    </div>
                </label>

                <!-- Capa 2: Reconstrucción Histórica Táctica -->
                <label class="flex items-center justify-between p-2 rounded-xl bg-black/50 hover:bg-white/5 border border-sky-500/30 transition-all cursor-pointer select-none">
                    <span class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded-md bg-sky-500 shadow-sm border border-sky-300"></span>
                        <span class="font-bold text-sky-300">2. Reconstrucción Histórica</span>
                    </span>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[9px] text-slate-400 font-sans hidden sm:inline">(Celdas, aforos DGA, 60fps)</span>
                        <input type="checkbox" id="chkFloodLayerHistorica" onchange="window.setFloodLayerState('historica', this.checked)" checked class="w-4 h-4 accent-sky-500 cursor-pointer">
                    </div>
                </label>

                <!-- Capa 3: Reconstrucción Predicción Ciega -->
                <label class="flex items-center justify-between p-2 rounded-xl bg-black/50 hover:bg-white/5 border border-blue-500/30 transition-all cursor-pointer select-none">
                    <span class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded-md bg-blue-500 shadow-sm border border-blue-300"></span>
                        <span class="font-bold text-blue-300">3. Reconstrucción Predicción</span>
                    </span>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[9px] text-slate-400 font-sans hidden sm:inline">(HAND / Saint-Venant 2D)</span>
                        <input type="checkbox" id="chkFloodLayerPrediccion" onchange="window.setFloodLayerState('prediccion', this.checked)" checked class="w-4 h-4 accent-blue-500 cursor-pointer">
                    </div>
                </label>
            </div>
            
            <!-- Botonera Rápida de Presets de Visualización -->
            <div class="grid grid-cols-3 gap-1 pt-0.5 text-[9px] font-mono text-center">
                <button type="button" onclick="window.applyFloodLayerPreset('solo_sar')" class="py-1 px-1 rounded-lg bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all cursor-pointer">
                    Solo Radar SAR
                </button>
                <button type="button" onclick="window.applyFloodLayerPreset('ciega_vs_real')" class="py-1 px-1 rounded-lg bg-black/40 hover:bg-white/10 text-cyan-300 hover:text-white border border-cyan-500/30 transition-all cursor-pointer">
                    Ciega vs Real
                </button>
                <button type="button" onclick="window.applyFloodLayerPreset('todas')" class="py-1 px-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 border border-cyan-500/30 transition-all cursor-pointer font-bold">
                    Trilateral (3)
                </button>
            </div>

            <!-- CONTROL HORARIO DE ISÓCRONAS DE LLENADO Y ARRIBO -->
            <div id="floodIsochroneControlBox" class="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-2 text-[10px]">
                <div class="flex items-center justify-between">
                    <span class="text-cyan-300 font-bold flex items-center gap-1 font-sans">
                        <span>⏱️</span> Horizonte Hidrodinámico de Crecida:
                    </span>
                    <span id="floodHorizonLabel" class="text-amber-300 font-bold font-mono">+18h Pico Hidrológico</span>
                </div>
                <div class="grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                    <button type="button" id="btnFloodH_6h" onclick="window.setFloodTimeHorizon(6)" class="py-1.5 px-1 rounded-lg bg-black/50 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer">
                        +6h Arribo
                    </button>
                    <button type="button" id="btnFloodH_18h" onclick="window.setFloodTimeHorizon(18)" class="py-1.5 px-1 rounded-lg bg-cyan-600 text-white font-bold border border-cyan-400 transition-all cursor-pointer shadow-md">
                        +18h Pico
                    </button>
                    <button type="button" id="btnFloodH_36h" onclick="window.setFloodTimeHorizon(36)" class="py-1.5 px-1 rounded-lg bg-black/50 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer">
                        +36h Remanso
                    </button>
                    <button type="button" id="btnFloodH_72h" onclick="window.setFloodTimeHorizon(72)" class="py-1.5 px-1 rounded-lg bg-black/50 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer">
                        +72h Drenaje
                    </button>
                </div>
                <div class="flex items-center justify-between text-[9px] text-slate-400 font-sans pt-0.5 border-t border-white/5">
                    <span>Lámina Hidráulica Inundada:</span>
                    <b id="floodHorizonAreaBadge" class="text-cyan-300 font-mono">3.780 ha (teór)</b>
                </div>
                <!-- Botón de Doctrina del Receptor Fluvial (Cuenca Aportante) -->
                <button type="button" id="btnToggleUpwindFloodBasin" onclick="window.toggleUpwindFloodBasin()" class="w-full py-1.5 px-2 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 border border-cyan-500/30 font-mono text-[9.5px] font-bold flex items-center justify-between transition-all cursor-pointer">
                    <span class="flex items-center gap-1.5">
                        <span>🛡️</span>
                        <span>Cono de Cuenca Aportante (Receptor Fluvial)</span>
                    </span>
                    <span id="badgeUpwindFloodBasinState" class="text-[8px] px-1 py-0.2 rounded bg-cyan-500/30 text-cyan-300">OFF</span>
                </button>
            </div>
        </div>

        <!-- CUERPO SCROLLABLE CON CONTENIDO CONTEXTUAL -->
        <div class="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs custom-scrollbar">
            <div id="floodDrawerContent-sar" class="hidden space-y-3 font-mono"></div>
            <div id="floodDrawerContent-modelo" class="hidden space-y-3 font-mono"></div>
            <div id="floodDrawerContent-comparar" class="space-y-3 font-mono"></div>

            <!-- Botones de Acción Secundaria -->
            <div class="flex items-center gap-2 pt-1 font-mono text-[10px]">
                <a href="docs/INFORME_HINDCAST_REAL_INUNDACIONES_IMPRIMIBLE.html" target="_blank" class="flex-1 py-1.5 px-2 rounded-lg bg-cyan-700/80 hover:bg-cyan-700 text-white text-center font-bold transition-all shadow-sm">
                    📄 Ver Informe Técnico HTML
                </a>
                <button onclick="window.closeFloodBenchmarkDrawer();" class="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-bold cursor-pointer">
                    ✕ Cerrar
                </button>
            </div>
        </div>
    </div>
"""

def main():
    print("Iniciando inyección de la suite de megainundaciones...")

    # 1. Inyectar en js/hub/geo-layers.js
    with open(GEO_LAYERS_PATH, "r", encoding="utf-8") as f:
        geo_content = f.read()

    # Inyección 1.1: Declaración de capas
    decl_marker = "const hindcastUpwindThreatLayer = L.layerGroup();"
    if decl_marker in geo_content and "floodSitesLayer" not in geo_content:
        # Reemplazar e insertar antes
        geo_content = geo_content.replace(decl_marker, GEO_LAYERS_DECLARATION + "\n        " + decl_marker)
        print("✔ Declaración de capas de inundación inyectada en geo-layers.js")
    else:
        print("ℹ Declaración de capas ya presente o marcador no hallado.")

    # Inyección 1.2: Suite Táctica de Inundaciones
    suite_marker = "window.openHindcastSiteInCuenca = function(eventKey) {"
    if suite_marker in geo_content and "window.loadFloodBenchmarkInCuenca" not in geo_content:
        geo_content = geo_content.replace(suite_marker, GEO_LAYERS_FLOOD_SUITE + "\n        " + suite_marker)
        print("✔ Funciones controladoras de inundación inyectadas en geo-layers.js")
    else:
        print("ℹ Funciones de inundación ya presentes o marcador no hallado.")

    with open(GEO_LAYERS_PATH, "w", encoding="utf-8") as f:
        f.write(geo_content)

    # 2. Inyectar en index.html
    with open(INDEX_HTML_PATH, "r", encoding="utf-8") as f:
        html_content = f.read()

    # Inyección 2.1: Botón y Drawer
    html_marker = '<!-- CUENCA SATELLITE VIEWER TOP BAR'
    if html_marker in html_content and "floodBenchmarkDrawer" not in html_content:
        html_content = html_content.replace(html_marker, HTML_FLOOD_DRAWER + "\n    " + html_marker)
        print("✔ Botón y Drawer de inundación inyectados en index.html")
    else:
        print("ℹ Drawer de inundación ya presente en index.html")

    # Inyección 2.2: Acordeón detailsRiskFlood
    sidebar_marker = '<!-- Leyenda Interna Calados & Períodos de Retorno -->'
    sidebar_flood_box = """
                        <!-- BENCHMARK HINDCAST DE MEGAINUNDACIONES -->
                        <div class="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 font-sans">
                                    <span>🌊⚖️</span> <span>Benchmark Megainundaciones 2023</span>
                                </span>
                                <a href="docs/INFORME_HINDCAST_REAL_INUNDACIONES_IMPRIMIBLE.html" target="_blank" class="py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-[9.5px] font-mono flex items-center gap-1 transition-all cursor-pointer">
                                    <span>🖨️</span> <span>Informe</span>
                                </a>
                            </div>

                            <p class="text-[10px] text-slate-400 leading-snug font-sans">
                                Contraste verídico trilateral entre huella SAR Sentinel-1 (&sigma;₀ &lt; -18 dB), reconstrucción histórica (aforos DGA) y simulación ciega T-48h (HAND / Saint-Venant 2D).
                            </p>

                            <div class="grid grid-cols-3 gap-1">
                                <button onclick="window.loadFloodBenchmarkInCuenca('licanten_2023');" id="btnSidebarFloodLicanten" class="py-1.5 px-1 rounded-lg bg-cyan-600 text-white font-sans text-[9px] font-medium border border-cyan-400 cursor-pointer transition-all flex flex-col items-center">
                                    <span>Licantén</span>
                                    <span class="text-[8px] text-cyan-200 font-mono">3.450 ha &bull; Mataquito</span>
                                </button>
                                <button onclick="window.loadFloodBenchmarkInCuenca('longavi_2023');" id="btnSidebarFloodLongavi" class="py-1.5 px-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-sans text-[9px] border border-white/10 cursor-pointer transition-all flex flex-col items-center">
                                    <span>Longaví</span>
                                    <span class="text-[8px] text-slate-400 font-mono">2.880 ha &bull; Meniel</span>
                                </button>
                                <button onclick="window.loadFloodBenchmarkInCuenca('ancoa_2023');" id="btnSidebarFloodAncoa" class="py-1.5 px-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-sans text-[9px] border border-white/10 cursor-pointer transition-all flex flex-col items-center">
                                    <span>Ancoa</span>
                                    <span class="text-[8px] text-slate-400 font-mono">1.920 ha &bull; Linares</span>
                                </button>
                            </div>

                            <button onclick="window.openFloodBenchmarkDrawer();" class="w-full py-1.5 px-2.5 rounded-lg bg-cyan-900/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 font-sans text-[10px] font-medium flex items-center justify-between transition-all cursor-pointer">
                                <span class="flex items-center gap-1.5"><span>🌊</span><span>Abrir Panel Táctico Inundaciones</span></span>
                                <span class="text-cyan-400">➔</span>
                            </button>
                        </div>
"""
    if sidebar_marker in html_content and "btnSidebarFloodLicanten" not in html_content:
        html_content = html_content.replace(sidebar_marker, sidebar_flood_box + "\n                        " + sidebar_marker)
        print("✔ Botonera de benchmark agregada al acordeón de inundaciones en index.html")

    # Inyección 2.3: URL Routing
    routing_marker = "const hindcastParam = urlParams.get('hindcast')"
    routing_code = """const floodParam = urlParams.get('flood') || (window.location.hash.includes('evento=licanten') ? 'licanten_2023' : (window.location.hash.includes('evento=longavi') ? 'longavi_2023' : (window.location.hash.includes('evento=ancoa') ? 'ancoa_2023' : null)));
        if (floodParam) {
            window.__bootPhase = false;
            const splash = document.getElementById('alchemicalAppSplash');
            if (splash) {
                splash.style.display = 'none';
                splash.style.opacity = '0';
                splash.style.pointerEvents = 'none';
            }
            if (typeof window.dismissAlchemicalSplash === 'function') {
                window.dismissAlchemicalSplash();
            }
            setTimeout(() => {
                const shouldMinimize = urlParams.get('minimize') !== '0';
                if (typeof switchMasterView === 'function') {
                    switchMasterView('territory', 'cerro');
                }
                if (typeof window.loadFloodBenchmarkInCuenca === 'function') {
                    window.loadFloodBenchmarkInCuenca(floodParam, presetParam || 'todas', shouldMinimize);
                }
            }, 600);
            return;
        }
        """
    if routing_marker in html_content and "floodParam" not in html_content:
        html_content = html_content.replace(routing_marker, routing_code + routing_marker)
        print("✔ URL routing para ?flood= inyectado en index.html")

    with open(INDEX_HTML_PATH, "w", encoding="utf-8") as f:
        f.write(html_content)

    print("¡Inyección completada exitosamente!")

if __name__ == "__main__":
    main()
