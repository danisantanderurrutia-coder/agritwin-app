# -*- coding: utf-8 -*-
with open('/Users/danielsantander/Documents/agritwin-app/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Agregar botón de Sitios Hindcast en cuencaRiesgosFlyout
flyout_target = '''                <!-- Capa Territorial Edafológica: ISRIC SoilGrids 2.0 (250m) - Carbono en Suelo -->
                <button onclick="toggleSoilGridsLayer();" id="btnDockSoilGrids"'''

flyout_insert = '''                <!-- Sitios Hindcast Reales: Santa Juana 2023 & Viña del Mar 2024 -->
                <button onclick="toggleHindcastSitesLayer();" id="btnDockHindcast" class="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-rose-500/15 border border-white/5 hover:border-rose-500/30 flex items-center justify-between text-xs text-rose-200 transition-all cursor-pointer" title="Cicatrices Satelitales Observadas Sentinel-2 dNBR (Santa Juana 2023 & Viña 2024)">
                    <span class="flex items-center gap-2">
                        <span>🔥</span>
                        <span>Sitios Hindcast Reales</span>
                    </span>
                    <span id="badgeDockHindcast" class="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-slate-400 border border-white/5">OFF</span>
                </button>

                <!-- Capa Territorial Edafológica: ISRIC SoilGrids 2.0 (250m) - Carbono en Suelo -->
                <button onclick="toggleSoilGridsLayer();" id="btnDockSoilGrids"'''

# 2. Agregar Submódulo 2.C en detailsRiskFire
sidebar_target = '''                            <!-- Botón para inspeccionar física in-situ con KaTeX sin abandonar el mapa -->
                            <button onclick="openCuencaDoctrinaModal('m2-fuego')"'''

sidebar_insert = '''                            <!-- SUBMÓDULO 2.C: BANCO DE VALIDACIÓN HINDCAST (SANTA JUANA 2023 · VIÑA 2024) -->
                            <div class="p-3 rounded-xl bg-gradient-to-b from-[#200b0b] to-black/85 border border-rose-500/50 space-y-2.5 font-sans">
                                <div class="flex items-center justify-between border-b border-rose-500/20 pb-2">
                                    <div class="flex items-center gap-2">
                                        <span class="text-base p-1 rounded-lg bg-rose-950/80 border border-rose-500/30 text-rose-400">🔥🛰️</span>
                                        <div>
                                            <h3 class="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                                                Validación Hindcast Real
                                            </h3>
                                            <p class="text-[9px] text-slate-400 font-mono">Sentinel-2 dNBR (20m) &bull; ERA5 Horario vs Rothermel</p>
                                        </div>
                                    </div>
                                    <a href="docs/INFORME_HINDCAST_REAL_IMPRIMIBLE.html" target="_blank" class="py-1 px-2 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/50 text-[9.5px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer" title="Ver informe imprimible completo con KaTeX">
                                        <span>🖨️</span> <span>Informe</span>
                                    </a>
                                </div>

                                <p class="text-[10px] text-slate-300 leading-snug font-sans">
                                    Compara directamente la <strong>cicatriz satelital real observada</strong> (rojo) frente a la <strong>elipse teórica del modelo</strong> (naranja) proyectada con el clima exacto de esa semana.
                                </p>

                                <!-- Selector de Eventos Históricos -->
                                <div class="space-y-1 font-mono">
                                    <span class="text-[9.5px] text-slate-400 block">Seleccionar Evento de Validación:</span>
                                    <div class="grid grid-cols-2 gap-1.5">
                                        <button onclick="window.loadHindcastBenchmarkInCuenca('santa_juana_2023');" id="btnSidebarHindcastSanta" class="py-1.5 px-2 rounded-lg bg-rose-600 text-white font-mono text-[10px] font-bold border border-rose-400 cursor-pointer shadow-md transition-all flex flex-col items-center">
                                            <span>🔥 Santa Juana 2023</span>
                                            <span class="text-[8.5px] text-rose-200 font-normal">42.599 ha · Biobío</span>
                                        </button>
                                        <button onclick="window.loadHindcastBenchmarkInCuenca('vina_2024');" id="btnSidebarHindcastVina" class="py-1.5 px-2 rounded-lg bg-black/40 hover:bg-white/10 text-slate-300 font-mono text-[10px] border border-white/5 cursor-pointer transition-all flex flex-col items-center">
                                            <span>🔥 Viña del Mar 2024</span>
                                            <span class="text-[8.5px] text-slate-400 font-normal">2.989 ha · Valparaíso</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- Botón de Emulación sobre Predio Activo -->
                                <button onclick="window.emulateHindcastOnActiveFarm(document.getElementById('btnSidebarHindcastVina').classList.contains('bg-rose-600') ? 'vina_2024' : 'santa_juana_2023');" class="w-full py-1.5 px-2.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 hover:text-white font-mono text-[10px] font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm">
                                    <span class="flex items-center gap-1.5">
                                        <span>🌪️</span>
                                        <span>Emular este régimen sobre mi predio</span>
                                    </span>
                                    <span>➔</span>
                                </button>
                            </div>

                            <!-- Botón para inspeccionar física in-situ con KaTeX sin abandonar el mapa -->
                            <button onclick="openCuencaDoctrinaModal('m2-fuego')"'''

# 3. Checkbox en Capas Complementarias
checkbox_target = '''                            <label class="flex items-center justify-between p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-white/5 cursor-pointer">
                                <span class="text-rose-300 flex items-center gap-2">
                                    <span class="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                                    <span>Transecto Pirogénico (P-01..P-03)</span>
                                </span>
                                <input type="checkbox" id="chkSidebar-incendios" onchange="window.toggleTransectLayer('incendios')" class="accent-rose-500 cursor-pointer">
                            </label>'''

checkbox_insert = '''                            <label class="flex items-center justify-between p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-rose-500/30 cursor-pointer">
                                <span class="text-rose-300 flex items-center gap-2">
                                    <span class="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                                    <span>Sitios Hindcast Reales (Santa Juana · Viña)</span>
                                </span>
                                <input type="checkbox" id="chkSidebarHindcastSites" onchange="window.toggleHindcastSitesLayer(this.checked)" class="accent-rose-500 cursor-pointer">
                            </label>

                            <label class="flex items-center justify-between p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-white/5 cursor-pointer">
                                <span class="text-rose-300 flex items-center gap-2">
                                    <span class="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                                    <span>Transecto Pirogénico (P-01..P-03)</span>
                                </span>
                                <input type="checkbox" id="chkSidebar-incendios" onchange="window.toggleTransectLayer('incendios')" class="accent-rose-500 cursor-pointer">
                            </label>'''

# 4. Floating Hindcast Map HUD
hud_target = '''    <!-- Living Energy Flow Canvas Overlay (Sits directly over the map) -->
    <canvas id="energyFlowCanvas" class="pointer-events-none absolute inset-0 z-20 w-full h-full" style="top: 56px; bottom: 0; left: 0; right: 0; position: absolute; pointer-events: none;"></canvas>'''

hud_insert = '''    <!-- Living Energy Flow Canvas Overlay (Sits directly over the map) -->
    <canvas id="energyFlowCanvas" class="pointer-events-none absolute inset-0 z-20 w-full h-full" style="top: 56px; bottom: 0; left: 0; right: 0; position: absolute; pointer-events: none;"></canvas>

    <!-- FLOATING BENCHMARK HINDCAST MAP HUD (Overlay interactivo en Mirador Cuenca) -->
    <div id="hindcastMapHUD" class="hidden absolute bottom-36 left-6 z-30 w-96 max-w-[calc(100vw-3rem)] bg-[#070e1a]/95 backdrop-blur-2xl border border-rose-500/60 p-3.5 rounded-2xl shadow-2xl space-y-2.5 text-slate-200 font-mono text-xs select-none">
        <div class="flex items-center justify-between border-b border-rose-500/30 pb-2">
            <div class="flex items-center gap-2">
                <span class="text-base p-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300">🔥🛰️</span>
                <div>
                    <span class="text-[9px] font-bold text-rose-400 uppercase tracking-wider block">BENCHMARK HINDCAST CANÓNICO</span>
                    <strong id="hindcastHudTitle" class="text-xs text-white font-bold font-sans">Santa Juana 2023</strong>
                </div>
            </div>
            <button onclick="document.getElementById('hindcastMapHUD').classList.add('hidden')" class="text-slate-400 hover:text-white text-sm px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer" title="Cerrar HUD">✕</button>
        </div>

        <!-- Métricas comparativas lado a lado -->
        <div class="grid grid-cols-2 gap-2 text-[10.5px]">
            <div class="p-2 rounded-xl bg-black/60 border border-rose-500/30 space-y-0.5">
                <span class="text-slate-400 text-[9px] block flex items-center gap-1">
                    <span class="w-2 h-2 rounded-sm bg-rose-500"></span> Observado (Sentinel-2 dNBR):
                </span>
                <b id="hindcastHudObsArea" class="text-rose-300 text-xs font-black">42.599 ha</b>
            </div>
            <div class="p-2 rounded-xl bg-black/60 border border-amber-500/30 space-y-0.5">
                <span class="text-slate-400 text-[9px] block flex items-center gap-1">
                    <span class="w-2 h-2 rounded-sm bg-amber-500"></span> Simulado (Rothermel-Fons):
                </span>
                <b id="hindcastHudSimArea" class="text-amber-300 text-xs font-black">44.850 ha</b>
            </div>
        </div>

        <!-- Clima y Viento ERA5 de esa semana -->
        <div class="p-2 rounded-xl bg-slate-900/80 border border-white/5 space-y-1 text-[10px]">
            <div class="flex justify-between items-center text-slate-300">
                <span>🌪️ Viento Sinóptico ERA5:</span>
                <b id="hindcastHudWind" class="text-sky-300 font-bold">SE 58 km/h</b>
            </div>
            <div class="flex justify-between items-center text-slate-300">
                <span>🌡️ Temperatura & HR:</span>
                <b id="hindcastHudTemp" class="text-amber-200">40,0 °C · HR 11%</b>
            </div>
            <div class="flex justify-between items-center text-slate-300">
                <span>🌧️ Lluvia 90d previa:</span>
                <b id="hindcastHudRain" class="text-emerald-300">96,8 mm</b>
            </div>
            <div class="flex justify-between items-center pt-1 border-t border-white/10 text-[9.5px] text-purple-300">
                <span>📍 Distancia a tu predio:</span>
                <b id="hindcastHudFarmDist" class="text-purple-200">135 km desde Fundo Meniel</b>
            </div>
        </div>

        <!-- Botones de Acción Rápida -->
        <div class="flex items-center gap-1.5 pt-0.5">
            <button onclick="window.toggleHindcastSimulationLayer()" id="btnToggleHindcastEllipse" class="flex-1 py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 hover:text-white text-[10px] font-bold text-center transition-all cursor-pointer">
                👁️ Alternar Elipse Teórica
            </button>
            <button onclick="window.returnToActiveFarmFromHindcast()" class="py-1.5 px-2.5 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 border border-sky-400/50 text-sky-200 hover:text-white text-[10px] font-bold transition-all cursor-pointer" title="Volver a centrar el mapa en tu predio activo">
                🏠 Mi Predio
            </button>
            <a href="docs/INFORME_HINDCAST_REAL_IMPRIMIBLE.html" target="_blank" class="py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm" title="Abrir Informe Técnico Imprimible">
                📄 Informe
            </a>
        </div>
    </div>'''

assert flyout_target in content, "flyout_target not found"
assert sidebar_target in content, "sidebar_target not found"
assert checkbox_target in content, "checkbox_target not found"
assert hud_target in content, "hud_target not found"

content = content.replace(flyout_target, flyout_insert, 1)
content = content.replace(sidebar_target, sidebar_insert, 1)
content = content.replace(checkbox_target, checkbox_insert, 1)
content = content.replace(hud_target, hud_insert, 1)

with open('/Users/danielsantander/Documents/agritwin-app/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html actualizado exitosamente con todos los controles visuales e interactivos de Hindcast!")
