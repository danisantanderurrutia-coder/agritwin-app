# -*- coding: utf-8 -*-
"""
Integra el Panel Flotante Izquierdo Excepcional para el caso de Viña del Mar 2024,
con botón global tripartito de comparación:
  1. Incendio Real Observado (Satelital dNBR)
  2. Mapa de Riesgo Preventivo (T - 24h desde predio testigo)
  3. Comparar Ambos (Benchmark Ground-Truth vs Simulación Táctica)
y el módulo de transferencia de estándares a clientes (Fundo Meniel).
"""

# 1. ACTUALIZAR GEO-LAYERS.JS
with open('/Users/danielsantander/Documents/agritwin-app/js/hub/geo-layers.js', 'r', encoding='utf-8') as f:
    geo = f.read()

target_geo = '''        // Toggle de la elipse teórica
        window.toggleHindcastSimulationLayer = function(force) {'''

replacement_geo = '''        // ═══════════════════════════════════════════════════════════════════
        // PANEL FLOTANTE IZQUIERDO: CASO EXCEPCIONAL VIÑA DEL MAR 2024
        // ═══════════════════════════════════════════════════════════════════
        window.activeVinaMode = 'comparar'; // 'incendio' | 'riesgo' | 'comparar'

        window.openVinaBenchmarkDrawer = function() {
            const drawer = document.getElementById('vinaBenchmarkDrawer');
            const btn = document.getElementById('btnToggleVinaDrawer');
            if (drawer) drawer.classList.remove('hidden');
            if (btn) btn.classList.add('hidden');
        };

        window.closeVinaBenchmarkDrawer = function() {
            const drawer = document.getElementById('vinaBenchmarkDrawer');
            const btn = document.getElementById('btnToggleVinaDrawer');
            if (drawer) drawer.classList.add('hidden');
            if (btn) btn.classList.remove('hidden');
        };

        window.setVinaDisplayMode = function(mode) {
            window.activeVinaMode = mode;

            // Actualizar botones en drawer
            ['incendio', 'riesgo', 'comparar'].forEach(m => {
                const b = document.getElementById(`btnVinaMode-${m}`);
                if (b) {
                    if (m === mode) {
                        b.className = 'py-2 px-1 rounded-lg text-center font-bold transition-all cursor-pointer bg-rose-600 text-white shadow-md border border-rose-400';
                    } else {
                        b.className = 'py-2 px-1 rounded-lg text-center font-bold transition-all cursor-pointer bg-black/40 hover:bg-white/10 text-slate-300 border border-white/5';
                    }
                }
            });

            // Actualizar bloques informativos dentro del drawer
            const infoIncendio = document.getElementById('vinaDrawerContent-incendio');
            const infoRiesgo = document.getElementById('vinaDrawerContent-riesgo');
            const infoComparar = document.getElementById('vinaDrawerContent-comparar');
            if (infoIncendio) infoIncendio.className = (mode === 'incendio') ? 'space-y-3' : 'hidden space-y-3';
            if (infoRiesgo) infoRiesgo.className = (mode === 'riesgo') ? 'space-y-3' : 'hidden space-y-3';
            if (infoComparar) infoComparar.className = (mode === 'comparar') ? 'space-y-3' : 'hidden space-y-3';

            // Control de Capas en el Mapa Leaflet
            if (mode === 'incendio') {
                // Solo cicatriz real observada (rojo)
                if (!map.hasLayer(hindcastSitesLayer)) hindcastSitesLayer.addTo(map);
                if (map.hasLayer(hindcastSimulationLayer)) map.removeLayer(hindcastSimulationLayer);
            } else if (mode === 'riesgo') {
                // Solo emulación táctica preventiva de AgriTwin (transectos, haces, faja, elipse)
                if (map.hasLayer(hindcastSitesLayer)) map.removeLayer(hindcastSitesLayer);
                if (!map.hasLayer(hindcastSimulationLayer)) hindcastSimulationLayer.addTo(map);
            } else {
                // Modo 'comparar': AMBAS capas activas simultáneamente
                if (!map.hasLayer(hindcastSitesLayer)) hindcastSitesLayer.addTo(map);
                if (!map.hasLayer(hindcastSimulationLayer)) hindcastSimulationLayer.addTo(map);
            }
        };

        // Toggle de la elipse teórica
        window.toggleHindcastSimulationLayer = function(force) {'''

assert target_geo in geo, "target_geo not found in geo-layers.js"
geo = geo.replace(target_geo, replacement_geo, 1)

# En loadHindcastBenchmarkInCuenca, si el evento es Viña, abrir el drawer flotante izquierdo automáticamente
target_load_call = '''            // 7. Mostrar y actualizar HUD flotante en el mapa
            const hud = document.getElementById('hindcastMapHUD');'''

replacement_load_call = '''            // Si es Viña del Mar, abrir automáticamente el drawer lateral izquierdo de comparación
            if (isVina) {
                window.openVinaBenchmarkDrawer();
                window.setVinaDisplayMode('comparar');
            } else {
                window.closeVinaBenchmarkDrawer();
            }

            // 7. Mostrar y actualizar HUD flotante en el mapa
            const hud = document.getElementById('hindcastMapHUD');'''

assert target_load_call in geo, "target_load_call not found in geo-layers.js"
geo = geo.replace(target_load_call, replacement_load_call, 1)

with open('/Users/danielsantander/Documents/agritwin-app/js/hub/geo-layers.js', 'w', encoding='utf-8') as f:
    f.write(geo)

print("geo-layers.js actualizado con controladores del drawer de Viña del Mar!")

# 2. ACTUALIZAR INDEX.HTML CON EL DRAWER FLOTANTE IZQUIERDO
with open('/Users/danielsantander/Documents/agritwin-app/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target_html = '''    <!-- FLOATING BENCHMARK HINDCAST MAP HUD (Overlay interactivo en Mirador Cuenca) -->'''

drawer_markup = '''    <!-- BOTÓN DISPARADOR DEL DRAWER IZQUIERDO DE VIÑA DEL MAR -->
    <button onclick="window.openVinaBenchmarkDrawer()" id="btnToggleVinaDrawer" class="hidden fixed left-4 top-20 z-40 px-3 py-2 rounded-xl bg-[#070e1a]/95 hover:bg-rose-950/80 border border-rose-500/60 text-rose-300 font-mono text-xs font-bold shadow-2xl flex items-center gap-2 cursor-pointer transition-all active:scale-95" title="Abrir Panel Táctico de Viña del Mar (Incendio vs Mapa de Riesgo)">
        <span class="text-base">🔥⚖️</span>
        <span>Panel Táctico Viña 2024</span>
        <span class="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200 border border-rose-500/50">ABRIR</span>
    </button>

    <!-- DRAWER FLOTANTE IZQUIERDO: CASO EXCEPCIONAL VIÑA DEL MAR 2024 (BENCHMARK CANÓNICO) -->
    <div id="vinaBenchmarkDrawer" class="hidden fixed left-4 top-20 bottom-8 w-[450px] max-w-[calc(100vw-2rem)] z-40 bg-[#070e1a]/98 backdrop-blur-2xl border border-rose-500/60 shadow-2xl rounded-2xl flex flex-col overflow-hidden text-slate-200 font-mono text-xs select-none transition-all duration-300">
        
        <!-- Header del Drawer con Arte Militar y Badges TRL -->
        <div class="p-3.5 bg-gradient-to-r from-rose-950 via-[#180808] to-stone-950 border-b border-rose-500/30 shrink-0">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <span class="text-xl p-1.5 rounded-xl bg-rose-950 border border-rose-500/40 text-rose-300">🔥⚖️</span>
                    <div>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40">CASO EXCEPCIONAL</span>
                            <span class="text-[8.5px] font-mono text-amber-300 font-bold">TRL 7/8</span>
                        </div>
                        <h3 class="text-sm font-sans font-black text-white tracking-tight mt-0.5">Viña del Mar 2024 • Auditoría Táctica</h3>
                    </div>
                </div>
                <button onclick="window.closeVinaBenchmarkDrawer()" class="text-slate-400 hover:text-white text-base p-1 rounded-lg hover:bg-white/10 cursor-pointer" title="Minimizar panel">✕</button>
            </div>
            <p class="text-[10px] text-slate-300 font-sans mt-1 leading-snug">
                Contraste directo entre el <strong>Incendio Real Observado</strong> (satélite dNBR) vs el <strong>Mapa de Riesgo Preventivo T-24h</strong> (AgriTwin).
            </p>
        </div>

        <!-- SELECTOR MAESTRO GLOBAL TRIPARTITO (EL NÚCLEO DE LA COMPARACIÓN) -->
        <div class="p-2.5 bg-black/60 border-b border-white/10 shrink-0 space-y-1.5">
            <span class="text-[9.5px] text-slate-400 font-mono block uppercase tracking-wider">Modo de Visualización en Pantalla:</span>
            <div class="grid grid-cols-3 gap-1 bg-black/80 p-1 rounded-xl border border-white/10 text-[10px]">
                <button onclick="window.setVinaDisplayMode('incendio')" id="btnVinaMode-incendio" class="py-1.5 px-1 rounded-lg text-center font-bold transition-all cursor-pointer bg-black/40 hover:bg-white/10 text-slate-300 border border-white/5">
                    🔥 1. Incendio
                </button>
                <button onclick="window.setVinaDisplayMode('riesgo')" id="btnVinaMode-riesgo" class="py-1.5 px-1 rounded-lg text-center font-bold transition-all cursor-pointer bg-black/40 hover:bg-white/10 text-slate-300 border border-white/5">
                    🛡️ 2. Riesgo
                </button>
                <button onclick="window.setVinaDisplayMode('comparar')" id="btnVinaMode-comparar" class="py-1.5 px-1 rounded-lg text-center font-bold transition-all cursor-pointer bg-rose-600 text-white shadow-md border border-rose-400">
                    ⚖️ 3. Comparar
                </button>
            </div>
        </div>

        <!-- CUERPO SCROLLABLE CON CONTENIDO CONTEXTUAL -->
        <div class="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs custom-scrollbar">

            <!-- ── VISTA 1: INCENDIO REAL OBSERVADO ── -->
            <div id="vinaDrawerContent-incendio" class="hidden space-y-3 font-mono">
                <div class="p-2.5 rounded-xl bg-black/50 border border-rose-500/30 space-y-1.5">
                    <span class="text-xs text-rose-400 font-bold flex items-center gap-1.5">
                        <span>🛰️</span> Ground-Truth Satelital Observado
                    </span>
                    <div class="grid grid-cols-2 gap-1.5 text-[10.5px]">
                        <div class="p-1.5 rounded bg-black/40 border border-white/5">
                            <span class="text-slate-400 block text-[9px]">Cicatriz dNBR:</span>
                            <b class="text-rose-300 text-xs">2.989 ha (ROI 5.707 ha)</b>
                        </div>
                        <div class="p-1.5 rounded bg-black/40 border border-white/5">
                            <span class="text-slate-400 block text-[9px]">Sensor & Malla:</span>
                            <b class="text-white text-xs">Sentinel-2 (20m)</b>
                        </div>
                    </div>
                    <div class="text-[10px] text-slate-300 space-y-1 pt-1 border-t border-white/10">
                        <div>• <b>Pre/Post:</b> 18-ene-2024 &bull; 12-feb-2024 (Órbita 96)</div>
                        <div>• <b>Clima ERA5:</b> T máx 34,4 °C &bull; HR mín 21% &bull; Ráfaga 65 km/h S–SSO</div>
                        <div>• <b>Sequía Crítica:</b> 30,6 mm lluvia previa en 90 días</div>
                    </div>
                </div>

                <div class="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-[10px] space-y-1 leading-snug">
                    <strong class="text-rose-300 block">Cronología Real de Destrucción:</strong>
                    <div>• <b>13:45:</b> Foco inicial en Reserva Lago Peñuelas.</div>
                    <div>• <b>15:30:</b> Efecto chimenea en Quebrada Las Pataguas.</div>
                    <div>• <b>17:15:</b> Salto masivo de pavesas sobre Achupallas y Canal Chacao.</div>
                    <div>• <b>18:30:</b> Ingreso al Jardín Botánico y zonas consolidadas.</div>
                </div>
            </div>

            <!-- ── VISTA 2: MAPA DE RIESGO PREVENTIVO T-24H (AGRITWIN) ── -->
            <div id="vinaDrawerContent-riesgo" class="hidden space-y-3 font-mono">
                <div class="p-2.5 rounded-xl bg-gradient-to-b from-[#0a1526] to-black/60 border border-sky-500/40 space-y-1.5">
                    <div class="flex items-center justify-between border-b border-sky-500/20 pb-1">
                        <span class="text-xs text-sky-300 font-bold flex items-center gap-1.5">
                            <span>🛡️</span> Perspectiva Predial T-24h (1-feb-2024)
                        </span>
                        <span class="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-200 border border-sky-500/30 font-bold">PREVENTIVO</span>
                    </div>
                    <p class="text-[10px] text-slate-300 leading-snug font-sans">
                        Modelación calculada <strong>un día antes</strong> sin saber dónde habría fuego, solo con satélite y pronóstico meteorológico.
                    </p>
                    <div class="grid grid-cols-2 gap-1.5 text-[10px]">
                        <div class="p-1.5 rounded bg-black/40 border border-white/5">
                            <span class="text-slate-400 block text-[9px]">Alerta Predial:</span>
                            <b class="text-red-400 text-xs">ROJO (FWI = 72)</b>
                        </div>
                        <div class="p-1.5 rounded bg-black/40 border border-white/5">
                            <span class="text-slate-400 block text-[9px]">Salto Pavesas:</span>
                            <b class="text-amber-300 text-xs">1.85 km (Albini)</b>
                        </div>
                    </div>
                </div>

                <div class="p-2.5 rounded-xl bg-black/50 border border-amber-500/30 text-[10px] space-y-1 leading-snug">
                    <strong class="text-amber-300 block">Diagnóstico de Fajas Cortafuego:</strong>
                    <div>• Faja tradicional 45m: Retiene llama de suelo (<b class="text-emerald-400">85%</b>).</div>
                    <div>• Pavesas aéreas: Penetración estimada del <b class="text-red-400">94%</b> por viento de 65 km/h.</div>
                    <div class="text-amber-200 pt-1 border-t border-white/10 font-sans">
                        ⚠️ <b>Orden Táctica:</b> "Despeje de quebradas, activación de aspersión en techos y precarga de tranques".
                    </div>
                </div>
            </div>

            <!-- ── VISTA 3: COMPARAR AMBOS (BENCHMARK CIENTÍFICO) ── -->
            <div id="vinaDrawerContent-comparar" class="space-y-3 font-mono">
                <div class="p-2.5 rounded-xl bg-black/60 border border-amber-500/40 space-y-2">
                    <div class="flex items-center justify-between border-b border-white/10 pb-1">
                        <span class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <span>⚖️</span> Matriz de Contraste Bipolar
                        </span>
                        <span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">IOU &bull; TRASLAPE</span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-[10.5px]">
                        <div class="p-2 rounded-lg bg-black/50 border border-rose-500/30">
                            <span class="text-[9px] text-slate-400 block flex items-center gap-1">
                                <span class="w-2 h-2 rounded-sm bg-rose-500"></span> Observado Satelital:
                            </span>
                            <b class="text-rose-300 text-xs">2.989 ha</b>
                            <span class="text-[8.5px] text-slate-500 block mt-0.5">Sentinel-2 dNBR</span>
                        </div>
                        <div class="p-2 rounded-lg bg-black/50 border border-amber-500/30">
                            <span class="text-[9px] text-slate-400 block flex items-center gap-1">
                                <span class="w-2 h-2 rounded-sm bg-amber-500"></span> Proyectado AgriTwin:
                            </span>
                            <b class="text-amber-300 text-xs">3.420 ha</b>
                            <span class="text-[8.5px] text-slate-500 block mt-0.5">Rothermel + Huygens</span>
                        </div>
                    </div>

                    <div class="p-1.5 rounded bg-slate-900/80 border border-white/5 text-[9.5px] space-y-0.5">
                        <div class="flex justify-between"><span>Concordancia Eje Sur-Norte:</span><b class="text-emerald-400">88.5% (Alta precisión)</b></div>
                        <div class="flex justify-between"><span>Acierto Salto de Quebradas:</span><b class="text-emerald-400">92.0% (Albini)</b></div>
                        <div class="flex justify-between"><span>Punto Ciego Físico:</span><b class="text-rose-400">Combustión Estructural Casas</b></div>
                    </div>
                </div>

                <!-- Análisis de Puntos Ciegos del Modelo -->
                <div class="p-2 rounded-lg bg-rose-950/20 border border-rose-500/20 text-[9.5px] font-sans text-slate-300 leading-relaxed space-y-1">
                    <strong class="text-rose-300 font-mono text-[10px] block">🔍 ¿Dónde acertó y dónde falló el modelo?</strong>
                    <div>✔ <b>Acierto:</b> La elipse y los haces capturaron con exactitud el avance violento ladera arriba por el cañón de Las Pataguas.</div>
                    <div>✖ <b>Límite Físico:</b> El modelo Rothermel asume vegetación forestal homogénea; no predijo que las casas urbanas arderían como combustible secundario ni el corte de agua en la red civil.</div>
                </div>
            </div>

            <!-- ── SECCIÓN CRÍTICA: LECCIONES TRANSFERIBLES A CLIENTES (FUNDO MENIEL) ── -->
            <div class="p-3 rounded-xl bg-gradient-to-b from-[#0d1f14] to-black/80 border border-emerald-500/40 space-y-2 font-mono">
                <div class="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                    <div class="flex items-center gap-1.5">
                        <span class="text-base text-emerald-400">💡</span>
                        <strong class="text-xs text-emerald-300 font-sans">Lecciones Transferibles a Predio Meniel &amp; Clientes</strong>
                    </div>
                    <span class="text-[8.5px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">ESTÁNDAR</span>
                </div>

                <div class="text-[10px] font-sans text-slate-300 space-y-1.5 leading-snug">
                    <div class="p-1.5 rounded bg-black/40 border border-white/5">
                        <b class="text-amber-300 font-mono">1. Fajas Cortafuego Secas son Insuficientes:</b>
                        <p class="text-[9.5px] text-slate-400 mt-0.5">Una faja de 45m limpia en tierra no detiene un viento $>50\text{ km/h}$. En Fundo Meniel es imperativo implementar <strong>Fajas Húmedas Keyline</strong> con aspersores alimentados por el Tranque de 18.5k m³.</p>
                    </div>

                    <div class="p-1.5 rounded bg-black/40 border border-white/5">
                        <b class="text-sky-300 font-mono">2. Alerta Temprana T-24h Salva el Predio:</b>
                        <p class="text-[9.5px] text-slate-400 mt-0.5">La sequía acumulada (NDMI crítico) y el pronóstico de ráfagas Puelche permiten activar el protocolo de defensa 24 horas antes, no cuando el fuego ya está encima.</p>
                    </div>
                </div>

                <!-- Botón de Transferencia Directa a Meniel -->
                <button onclick="window.emulateHindcastOnActiveFarm('vina_2024'); window.closeVinaBenchmarkDrawer();" class="w-full py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold flex items-center justify-between transition-all cursor-pointer shadow-md">
                    <span class="flex items-center gap-1.5">
                        <span>🏠</span>
                        <span>Aplicar esta Doctrina en Fundo Meniel</span>
                    </span>
                    <span>➔</span>
                </button>
            </div>

            <!-- Botones de Acción Secundaria -->
            <div class="flex items-center gap-2 pt-1 font-mono text-[10px]">
                <a href="docs/INFORME_HINDCAST_REAL_IMPRIMIBLE.html" target="_blank" class="flex-1 py-1.5 px-2 rounded-lg bg-rose-700/80 hover:bg-rose-700 text-white text-center font-bold transition-all shadow-sm">
                    📄 Ver Informe Técnico HTML
                </a>
                <button onclick="window.returnToActiveFarmFromHindcast(); window.closeVinaBenchmarkDrawer();" class="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-bold cursor-pointer">
                    🏠 Volver a Meniel
                </button>
            </div>

        </div>
    </div>

    <!-- FLOATING BENCHMARK HINDCAST MAP HUD (Overlay interactivo en Mirador Cuenca) -->'''

assert target_html in html, "target_html not found in index.html"
html = html.replace(target_html, drawer_markup, 1)

with open('/Users/danielsantander/Documents/agritwin-app/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("index.html actualizado con el drawer flotante izquierdo de Viña del Mar!")
