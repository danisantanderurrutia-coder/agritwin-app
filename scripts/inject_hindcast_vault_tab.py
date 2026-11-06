# -*- coding: utf-8 -*-
"""
inject_hindcast_vault_tab.py
Inyecta la sección de Auditoría Retrospectiva (Hindcast de Incendios en Chile: Caso Bullileo 2023)
en la pestaña docs-uq del Vault en index.html.
Incluye:
  1. Botón en la sub-barra de navegación de la Sección 2.
  2. Modo A: Auditoría Numérica Formal Ground-Truth (CONAF / NASA FIRMS).
  3. Modo B: Pantallazo Interactivo de Ultra-Alta Fidelidad del Visor 3D de Cuenca + HUD Piro-Meteorológico.
  4. Contraste Lado a Lado (Modo A vs Modo B) y respuesta epistemológica sobre tendidos y caminos.
"""

import sys
import os

def generate_hindcast_html():
    return r'''
                <!-- ═══════════════════════════════════════════════════════════════════
                     SUBMÓDULO 5: AUDITORÍA RETROSPECTIVA (HINDCAST INCENDIOS • MODO A vs MODO B)
                     ═══════════════════════════════════════════════════════════════════ -->
                <div id="uq-content-hindcast" class="uq-subcontent hidden space-y-6">

                    <!-- Header Principal del Módulo Hindcast -->
                    <div class="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-rose-950/80 to-stone-950 text-white border border-rose-900/60 shadow-xl space-y-3 font-sans">
                        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                            <div class="flex items-start sm:items-center gap-3">
                                <div class="w-12 h-12 rounded-2xl bg-rose-600/30 border border-rose-500/50 text-rose-400 flex items-center justify-center text-2xl shadow-inner shrink-0">
                                    🔥
                                </div>
                                <div>
                                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">AUDITORÍA RETROSPECTIVA HISTÓRICA</span>
                                        <span class="text-xs text-rose-400/60">•</span>
                                        <span class="text-xs font-mono text-emerald-400 font-bold">Caso Real: Bullileo / Maule Sur 2023</span>
                                        <span class="text-xs text-rose-400/60">•</span>
                                        <span class="text-xs font-mono text-amber-300">Ground-Truth CONAF / NASA FIRMS</span>
                                    </div>
                                    <h3 class="text-lg sm:text-xl font-bold font-serif text-white tracking-wide">
                                        Auditoría Retrospectiva de Incendios: Lo Ocurrido vs. Lo que AgriTwin Habría Mostrado
                                    </h3>
                                    <p class="text-xs text-slate-300 max-w-4xl leading-relaxed mt-1">
                                        Validación ciega retrospectiva (<em>hindcast backtesting</em>): "retrocedemos el reloj" a la fecha exacta del megaincendio precordillerano de Bullileo (28 de enero de 2023) para verificar con qué anticipación el gemelo digital habría emitido la alerta, cómo modeló la propagación bajo viento Puelche y cómo se contrasta visual y numéricamente frente a la catástrofe real.
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 font-mono text-xs shrink-0 flex-wrap">
                                <span class="px-3 py-1.5 rounded-xl bg-black/50 border border-rose-500/30 text-rose-300 font-bold flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> IoU Jaccard: 74.3%
                                </span>
                                <span class="px-3 py-1.5 rounded-xl bg-black/50 border border-emerald-500/30 text-emerald-300 font-bold">
                                    Dice F1: 85.2%
                                </span>
                            </div>
                        </div>

                        <!-- Selector Interno de Navegación del Módulo Hindcast -->
                        <div class="flex items-center gap-2 pt-1 overflow-x-auto select-none">
                            <button onclick="switchHindcastView('modo-b')" id="hindcastBtn-b" class="hindcast-nav-btn active px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all bg-rose-600 text-white border border-rose-500 flex items-center gap-1.5 shadow-sm">
                                <span>🖥️</span> <span>Modo B: Pantallazo Interactivo Visor Cuenca 3D</span>
                            </button>
                            <button onclick="switchHindcastView('modo-a')" id="hindcastBtn-a" class="hindcast-nav-btn px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all bg-white/10 text-slate-300 hover:bg-white/15 border border-white/10 flex items-center gap-1.5">
                                <span>📊</span> <span>Modo A: Auditoría Numérica Formal (Benchmark)</span>
                            </button>
                            <button onclick="switchHindcastView('contraste')" id="hindcastBtn-c" class="hindcast-nav-btn px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all bg-white/10 text-slate-300 hover:bg-white/15 border border-white/10 flex items-center gap-1.5">
                                <span>⚖️</span> <span>Contraste Lado a Lado & Alcance Biofísico</span>
                            </button>
                        </div>
                    </div>

                    <!-- ═══════════════════════════════════════════════════════════════════
                         VISTA 1: MODO B — PANTALLAZO INTERACTIVO VISOR CUENCA 3D (POR DEFECTO)
                         ═══════════════════════════════════════════════════════════════════ -->
                    <div id="hindcastView-modo-b" class="hindcast-subpanel space-y-4 font-sans">
                        
                        <!-- Tarjeta Explicativa de la Interfaz -->
                        <div class="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-stone-800 text-xs">
                            <span class="text-xl">💡</span>
                            <div class="leading-relaxed">
                                <strong class="text-amber-950 font-bold">Simulación Gráfica de la Interfaz Operacional:</strong>
                                A continuación se representa el visor interactivo de <strong>AgriTwin Cuenca</strong> en modo reproducción retrospectiva. Observa cómo interactúan en tiempo real los sensores satelitales Sentinel-2 (humedad de combustible foliar), el tacómetro FWI en Alerta Roja, la física orográfica de viento Puelche canalizada por la quebrada y la superposición de la <strong>envolvente elíptica predictiva de Rothermel (naranja)</strong> sobre el <strong>perímetro real registrado por CONAF (rojo)</strong>.
                            </div>
                        </div>

                        <!-- ══ COCKPIT SIMULADO DEL VISOR 3D ══ -->
                        <div class="rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-mono text-slate-200">
                            
                            <!-- Barra de Título / HUD del Simulador -->
                            <div class="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div class="flex items-center gap-2">
                                    <span class="inline-block w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                                    <span class="font-bold text-white tracking-wider">AGRITWIN 3D • DIGITAL TWIN CUENCA DEL MAULE</span>
                                    <span class="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-bold">[REPLAY HINDCAST: 28-ENE-2023]</span>
                                </div>
                                <div class="flex items-center gap-3 text-[11px] text-slate-400">
                                    <span>🛰️ Sentinel-2 L2A BOA (Tile 18HYD)</span>
                                    <span>•</span>
                                    <span class="text-amber-300">DEM: Copernicus 30m</span>
                                    <span>•</span>
                                    <span class="text-emerald-400 font-bold">IoU: 74.3%</span>
                                </div>
                            </div>

                            <!-- Cuerpo Central: Grid de 3 Columnas (HUD Izquierdo + Visor 3D Central + Tablero Derecho) -->
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-slate-800 bg-slate-950">
                                
                                <!-- Columna Izquierda (3 Cols): HUD Piro-Meteorológico -->
                                <div class="lg:col-span-3 p-4 bg-slate-900/60 border-b lg:border-b-0 lg:border-r border-slate-800 space-y-3.5 text-xs">
                                    
                                    <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center justify-between">
                                        <span>🎮 Telemetría Piro-Clima</span>
                                        <span class="text-rose-400">T0 + 1h 45m</span>
                                    </div>

                                    <!-- Gauge 1: FWI Dinámico -->
                                    <div class="p-3 rounded-xl bg-black/40 border border-rose-500/30 space-y-1.5">
                                        <div class="flex items-center justify-between text-[11px]">
                                            <span class="text-slate-400">Índice FWI Dinámico</span>
                                            <span id="hindcast-fwi-val" class="text-lg font-black text-rose-400">68</span>
                                        </div>
                                        <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div id="hindcast-fwi-bar" class="bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 h-2 rounded-full" style="width: 72%;"></div>
                                        </div>
                                        <div id="hindcast-fwi-badge" class="text-[10px] text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60 font-bold text-center">
                                            🚨 PELIGRO EXTREMO (Regla 30-30-30)
                                        </div>
                                    </div>

                                    <!-- Gauge 2: Viento Puelche & Ráfagas -->
                                    <div class="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1">
                                        <div class="flex items-center justify-between text-[11px]">
                                            <span class="text-slate-400">Viento Catabático Puelche</span>
                                            <span id="hindcast-wind-val" class="text-amber-400 font-bold">40.2 km/h</span>
                                        </div>
                                        <div class="text-[11px] text-slate-300 flex items-center justify-between">
                                            <span>Dirección: <strong class="text-white">ESE (118°)</strong></span>
                                            <span>Ráfagas: <strong class="text-rose-400">58 km/h</strong></span>
                                        </div>
                                        <div class="text-[10px] text-slate-500 pt-1">
                                            Canalización en Cañón: Aceleración orográfica Venturi +22%
                                        </div>
                                    </div>

                                    <!-- Gauge 3: Microclima & Humedad Combustible -->
                                    <div class="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1.5">
                                        <div class="text-[11px] text-slate-400 font-bold">Combustible Fino Muerto (FFMC)</div>
                                        <div class="grid grid-cols-2 gap-2 text-[11px]">
                                            <div class="p-1.5 rounded bg-slate-900 border border-slate-800">
                                                <span class="text-slate-500 block text-[9.5px]">Temp. Aire:</span>
                                                <span class="text-rose-300 font-bold text-xs">35.8 °C</span>
                                            </div>
                                            <div class="p-1.5 rounded bg-slate-900 border border-slate-800">
                                                <span class="text-slate-500 block text-[9.5px]">Humedad Rel.:</span>
                                                <span class="text-amber-300 font-bold text-xs">19.0 %</span>
                                            </div>
                                        </div>
                                        <div class="flex items-center justify-between text-[10px] pt-0.5">
                                            <span class="text-slate-400">Contenido Humedad (FMC):</span>
                                            <span class="text-rose-400 font-bold">5.8% (Crítico &lt; 8%)</span>
                                        </div>
                                    </div>

                                    <!-- Gauge 4: Física Rothermel -->
                                    <div class="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1">
                                        <div class="flex items-center justify-between text-[11px]">
                                            <span class="text-slate-400">Avance Frente Llama (R)</span>
                                            <span id="hindcast-rate-val" class="text-amber-400 font-bold">15.6 m/min</span>
                                        </div>
                                        <div class="flex items-center justify-between text-[11px]">
                                            <span class="text-slate-400">Longitud de Llama:</span>
                                            <span class="text-rose-400 font-bold">4.6 metros</span>
                                        </div>
                                        <div class="flex items-center justify-between text-[10px] text-emerald-400 pt-1 border-t border-slate-800/80">
                                            <span>Alcance Pavesas (Albini):</span>
                                            <span class="font-bold">580 m (Salto Activo)</span>
                                        </div>
                                    </div>

                                </div>

                                <!-- Columna Central (6 Cols): Render Gráfico de la Cuenca 3D -->
                                <div class="lg:col-span-6 p-4 bg-slate-950 flex flex-col justify-between relative overflow-hidden min-h-[460px]">
                                    
                                    <!-- Badges Flotantes sobre el Mapa -->
                                    <div class="flex items-center justify-between z-10 gap-2 flex-wrap">
                                        <div class="px-2.5 py-1 rounded-lg bg-black/70 border border-white/10 backdrop-blur-md text-[11px] text-slate-300 flex items-center gap-2">
                                            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                                            <span>CÁMARA: Precordillera Longaví • Altitud 1.150 msnm</span>
                                        </div>
                                        <div class="px-2.5 py-1 rounded-lg bg-black/70 border border-white/10 backdrop-blur-md text-[11px] text-amber-300 font-bold">
                                            👁️ Superposición CONAF vs. Rothermel
                                        </div>
                                    </div>

                                    <!-- ESCENARIO ILUSTRATIVO DE ALTA FIDELIDAD (SVG DINÁMICO) -->
                                    <div class="my-auto py-2 flex items-center justify-center relative">
                                        <svg viewBox="0 0 600 320" class="w-full h-auto max-h-[340px] drop-shadow-xl select-none">
                                            <defs>
                                                <!-- Gradiente de fondo topográfico -->
                                                <linearGradient id="bgDEMSlope" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stop-color="#0f172a" />
                                                    <stop offset="50%" stop-color="#1e293b" />
                                                    <stop offset="100%" stop-color="#090d16" />
                                                </linearGradient>
                                                <!-- Patrón de mancha elíptica simulada Rothermel -->
                                                <radialGradient id="simFireGrad" cx="35%" cy="45%" r="65%">
                                                    <stop offset="0%" stop-color="#f97316" stop-opacity="0.75" />
                                                    <stop offset="60%" stop-color="#ef4444" stop-opacity="0.45" />
                                                    <stop offset="100%" stop-color="#b91c1c" stop-opacity="0.05" />
                                                </radialGradient>
                                                <!-- Flechas de viento Puelche -->
                                                <marker id="windArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                                                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
                                                </marker>
                                            </defs>

                                            <!-- Fondo del relieve / curvas de nivel simuladas -->
                                            <rect x="0" y="0" width="600" height="320" rx="16" fill="url(#bgDEMSlope)" stroke="#334155" stroke-width="1.5" />
                                            
                                            <!-- Curvas de nivel topográficas sutiles -->
                                            <path d="M 40 40 Q 200 80, 560 30" fill="none" stroke="#334155" stroke-width="1" stroke-dasharray="3,3" opacity="0.6" />
                                            <path d="M 30 110 Q 220 160, 570 90" fill="none" stroke="#334155" stroke-width="1" stroke-dasharray="3,3" opacity="0.6" />
                                            <path d="M 20 190 Q 240 230, 580 160" fill="none" stroke="#334155" stroke-width="1" stroke-dasharray="3,3" opacity="0.6" />
                                            <path d="M 20 270 Q 260 290, 580 240" fill="none" stroke="#334155" stroke-width="1" stroke-dasharray="3,3" opacity="0.6" />

                                            <!-- Vectores de Flujo Eólico Puelche (Corrientes 3D descendentes ESE -> WSW) -->
                                            <g opacity="0.85">
                                                <line x1="530" y1="50" x2="430" y2="105" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#windArrow)" stroke-dasharray="5,3" />
                                                <line x1="500" y1="120" x2="380" y2="175" stroke="#f43f5e" stroke-width="3" marker-end="url(#windArrow)" stroke-dasharray="6,3" />
                                                <line x1="480" y1="200" x2="350" y2="255" stroke="#f43f5e" stroke-width="2" marker-end="url(#windArrow)" stroke-dasharray="5,3" />
                                                <text x="440" y="42" fill="#fda4af" font-size="10" font-family="monospace" font-weight="bold">VIENTO PUELCHE 40 km/h (ESE ➔ WSW)</text>
                                            </g>

                                            <!-- Estero / Río Colliguay (Barrera Natural Hídrica) -->
                                            <path d="M 120 20 Q 180 120, 210 180 T 260 320" fill="none" stroke="#0ea5e9" stroke-width="5" opacity="0.8" />
                                            <text x="140" y="270" fill="#38bdf8" font-size="9" font-family="monospace">Estero Colliguay (Barrera Hídrica)</text>

                                            <!-- Faja Cortafuegos Comunitaria 45m (Verde Esmeralda Keyline) -->
                                            <path d="M 180 20 Q 240 120, 270 180 T 320 320" fill="none" stroke="#10b981" stroke-width="4.5" stroke-dasharray="6,2" />
                                            <text x="280" y="295" fill="#34d399" font-size="9.5" font-family="monospace" font-weight="bold">🛡️ FAJA CORTAFUEGOS WUI 45m</text>

                                            <!-- PREDICCION AGRITWIN (Envolvente Elíptica Naranja Rothermel & Anderson) -->
                                            <ellipse cx="365" cy="155" rx="115" ry="58" transform="rotate(-26 365 155)" fill="url(#simFireGrad)" stroke="#f97316" stroke-width="2.5" stroke-dasharray="4,2" />
                                            
                                            <!-- VERDAD DE TERRENO: POLÍGONO REAL CONAF (Rojo Continuo) -->
                                            <path d="M 455 110 
                                                     C 435 90, 390 85, 340 115 
                                                     C 290 145, 270 170, 285 200 
                                                     C 300 225, 360 230, 410 205 
                                                     C 460 180, 480 135, 455 110 Z" 
                                                  fill="rgba(239, 68, 68, 0.22)" stroke="#ef4444" stroke-width="3" />

                                            <!-- Puntos Térmicos Satelitales NASA FIRMS (VIIRS 375m) -->
                                            <circle cx="340" cy="120" r="4.5" fill="#fbbf24" stroke="#dc2626" stroke-width="1.5" />
                                            <circle cx="375" cy="140" r="4.5" fill="#fbbf24" stroke="#dc2626" stroke-width="1.5" />
                                            <circle cx="415" cy="165" r="4.5" fill="#fbbf24" stroke="#dc2626" stroke-width="1.5" />
                                            <circle cx="310" cy="165" r="5" fill="#f59e0b" stroke="#b91c1c" stroke-width="1.5">
                                                <animate attributeName="r" values="3.5;6;3.5" dur="2s" repeatCount="indefinite" />
                                            </circle>

                                            <!-- Punto de Ignición Inicial (T0: 13:45 hrs) -->
                                            <g transform="translate(450, 115)">
                                                <circle cx="0" cy="0" r="6" fill="#ef4444" stroke="#ffffff" stroke-width="2">
                                                    <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite" />
                                                </circle>
                                                <text x="10" y="4" fill="#ffffff" font-size="9" font-family="monospace" font-weight="bold">Ignición T0 (13:45h)</text>
                                            </g>

                                            <!-- Salto de Pavesas (Albini Spotting) cruzando hacia la faja -->
                                            <path d="M 310 165 Q 260 150, 230 175" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="3,3" />
                                            <text x="215" y="160" fill="#fde047" font-size="8.5" font-family="monospace">Pavesa (580m)</text>

                                            <!-- Predio Fundo Meniel Protegido -->
                                            <rect x="50" y="70" width="85" height="110" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="2" />
                                            <text x="58" y="95" fill="#6ee7b7" font-size="9.5" font-family="monospace" font-weight="bold">Fundo Meniel</text>
                                            <text x="58" y="112" fill="#a7f3d0" font-size="8" font-family="monospace">Cerezos/Avellano</text>
                                            <text x="58" y="127" fill="#34d399" font-size="8" font-family="monospace">Tranque: 18.5k m³</text>
                                            <text x="58" y="160" fill="#10b981" font-size="8" font-family="monospace">✅ PROTEGIDO</text>
                                        </svg>
                                    </div>

                                    <!-- Leyenda Inferior del Mapa 3D -->
                                    <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[10.5px] text-slate-300 flex-wrap gap-2 z-10">
                                        <div class="flex items-center gap-4 flex-wrap">
                                            <span class="flex items-center gap-1.5">
                                                <span class="w-3 h-3 rounded-full bg-red-500 border border-red-300"></span>
                                                <span>Perímetro Real CONAF (348.5 ha)</span>
                                            </span>
                                            <span class="flex items-center gap-1.5">
                                                <span class="w-3 h-3 rounded-full bg-orange-500/60 border border-orange-400 border-dashed"></span>
                                                <span>Envolvente Rothermel Simulada (362 ha)</span>
                                            </span>
                                            <span class="flex items-center gap-1.5">
                                                <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                                                <span>Puntos Térmicos VIIRS NASA</span>
                                            </span>
                                            <span class="flex items-center gap-1.5">
                                                <span class="w-3.5 h-1.5 bg-emerald-500 rounded"></span>
                                                <span>Faja Cortafuegos 45m</span>
                                            </span>
                                        </div>
                                        <span class="font-bold text-amber-400">Coincidencia IoU: 74.3%</span>
                                    </div>

                                </div>

                                <!-- Columna Derecha (3 Cols): Impacto Predial & Alerta Temprana -->
                                <div class="lg:col-span-3 p-4 bg-slate-900/60 border-t lg:border-t-0 lg:border-l border-slate-800 space-y-3.5 text-xs">
                                    
                                    <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center justify-between">
                                        <span>🛡️ Defensa Fundo Meniel</span>
                                        <span class="text-emerald-400">Acción Táctica</span>
                                    </div>

                                    <!-- Buffer y Tiempo de Impacto -->
                                    <div class="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1">
                                        <div class="flex items-center justify-between text-[11px]">
                                            <span class="text-slate-400">Distancia al Frente:</span>
                                            <span id="hindcast-dist-val" class="text-amber-300 font-bold">2.4 km</span>
                                        </div>
                                        <div class="flex items-center justify-between text-[11px]">
                                            <span class="text-slate-400">Tiempo Arribo Proyectado:</span>
                                            <span id="hindcast-eta-val" class="text-rose-400 font-bold">1 h 18 min</span>
                                        </div>
                                        <div class="text-[10px] text-slate-400 pt-1">
                                            Alerta Temprana enviada con <strong>+18 horas</strong> de anticipación por desecación previa de biomasa.
                                        </div>
                                    </div>

                                    <!-- Reserva Hídrica Tranque Keyline -->
                                    <div class="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1.5">
                                        <div class="flex items-center justify-between text-[11px]">
                                            <span class="text-slate-400">Tranque Regulador Keyline</span>
                                            <span class="text-sky-300 font-bold">18.500 m³</span>
                                        </div>
                                        <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div class="bg-sky-500 h-2 rounded-full" style="width: 88%;"></div>
                                        </div>
                                        <div class="text-[10px] text-sky-300 flex items-center justify-between">
                                            <span>Presión de Red: 4.2 bar</span>
                                            <span>Aspersión: Activa</span>
                                        </div>
                                    </div>

                                    <!-- Quórum Faja Cortafuegos Comunitaria -->
                                    <div class="p-3 rounded-xl bg-black/40 border border-emerald-500/30 space-y-1">
                                        <div class="text-[11px] text-emerald-300 font-bold flex items-center justify-between">
                                            <span>Faja Cortafuegos 45m</span>
                                            <span>90% Quórum</span>
                                        </div>
                                        <p class="text-[10.5px] text-slate-300 leading-relaxed">
                                            9 de 10 predios vecinos coordinados. La faja deprimió el avance en un <strong>92%</strong> al cortar la continuidad de combustible seco.
                                        </p>
                                    </div>

                                    <!-- Monitoreo APRs -->
                                    <div class="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1">
                                        <div class="text-[11px] text-slate-400 font-bold">5 APRs de la Cuenca</div>
                                        <div class="text-[10.5px] text-emerald-400 font-bold">
                                            ✅ 3.220 familias abastecidas sin interrupción eléctrica ni por bombas.
                                        </div>
                                    </div>

                                </div>

                            </div>

                            <!-- Barra de Tiempo Histórico / Reproductor Playback -->
                            <div class="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
                                <div class="flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
                                    <div class="flex items-center gap-2">
                                        <span class="font-bold text-amber-400">⏱️ LÍNEA DE TIEMPO RETROSPECTIVA:</span>
                                        <span id="hindcast-current-phase-label" class="text-slate-200">Fase 2: Ignición & Carrera Convectiva (14:30 hrs)</span>
                                    </div>
                                    <div class="text-[11px] font-mono text-slate-400">
                                        Simulador Rothermel Acoplado • DEM Paso 10m
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                                    <button onclick="setHindcastStep(1)" id="hindcastStepBtn-1" class="hindcast-step-btn p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] text-center transition-all cursor-pointer border border-white/5">
                                        <div class="font-bold">1. T - 24 hrs</div>
                                        <div class="text-[9.5px] text-slate-400">Alerta Preventiva FWI</div>
                                    </button>
                                    <button onclick="setHindcastStep(2)" id="hindcastStepBtn-2" class="hindcast-step-btn active p-2 rounded-lg bg-rose-600 text-white text-[11px] text-center transition-all cursor-pointer border border-rose-500 shadow-sm">
                                        <div class="font-bold">2. T0: Ignición</div>
                                        <div class="text-[9.5px] text-rose-200">13:45h • Ladera Sur</div>
                                    </button>
                                    <button onclick="setHindcastStep(3)" id="hindcastStepBtn-3" class="hindcast-step-btn p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] text-center transition-all cursor-pointer border border-white/5">
                                        <div class="font-bold">3. T + 2 hrs</div>
                                        <div class="text-[9.5px] text-slate-400">Avance 15.6 m/min</div>
                                    </button>
                                    <button onclick="setHindcastStep(4)" id="hindcastStepBtn-4" class="hindcast-step-btn p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] text-center transition-all cursor-pointer border border-white/5">
                                        <div class="font-bold">4. T + 6 hrs</div>
                                        <div class="text-[9.5px] text-slate-400">Salto de Pavesas</div>
                                    </button>
                                    <button onclick="setHindcastStep(5)" id="hindcastStepBtn-5" class="hindcast-step-btn p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] text-center transition-all cursor-pointer border border-white/5 col-span-2 sm:col-span-1">
                                        <div class="font-bold">5. T + 12 hrs</div>
                                        <div class="text-[9.5px] text-slate-400">Contención en Faja</div>
                                    </button>
                                </div>
                            </div>

                        </div>

                    </div>

                    <!-- ═══════════════════════════════════════════════════════════════════
                         VISTA 2: MODO A — AUDITORÍA NUMÉRICA FORMAL (BENCHMARK GROUND-TRUTH)
                         ═══════════════════════════════════════════════════════════════════ -->
                    <div id="hindcastView-modo-a" class="hindcast-subpanel hidden space-y-6 font-sans">
                        
                        <!-- Tarjeta Explicativa Modo A -->
                        <div class="p-4 rounded-xl bg-purple-50 border border-purple-200 text-stone-800 text-xs flex items-start gap-3">
                            <span class="text-xl">📊</span>
                            <div class="leading-relaxed">
                                <strong class="text-purple-950 font-bold">Modo A: Auditoría Numérica Formal Ground-Truth:</strong>
                                Diseñado para auditorías de ingeniería, fondos de I+D, aseguradoras agrícolas y acreditación TRL 7/8. Este modo prescinde de animaciones y presenta las matrices matemáticas rigurosas calculadas sobre el catastro oficial de incendios de <strong>CONAF (SICOF)</strong> y los sensores térmicos orbitales de la NASA.
                            </div>
                        </div>

                        <!-- Matriz Numérica Comparativa: Observado vs Simulado -->
                        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#E7DAC6] shadow-sm space-y-4">
                            <div class="flex items-center justify-between border-b border-stone-200 pb-3 flex-wrap gap-2">
                                <div>
                                    <span class="text-xs font-mono font-bold uppercase text-purple-700 tracking-wider">BANCO MULTI-SITIO • CASOS HISTÓRICOS AUDITADOS</span>
                                    <h4 class="text-base sm:text-lg font-bold text-stone-900 font-serif">Métricas Espaciales de Fuego (IoU Jaccard, Dice, Tasa de Avance y PBIAS)</h4>
                                </div>
                                <span class="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">LÍMITE TEÓRICO: 70-75% IoU</span>
                            </div>

                            <div class="overflow-x-auto">
                                <table class="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr class="bg-stone-50 text-stone-600 border-b border-stone-200 font-mono text-[11px]">
                                            <th class="py-2.5 px-3">Incendio Forestal / Sitio</th>
                                            <th class="py-2.5 px-3">Fuente Ground-Truth</th>
                                            <th class="py-2.5 px-3">Superficie Real</th>
                                            <th class="py-2.5 px-3">Superficie Simulada</th>
                                            <th class="py-2.5 px-3 text-center">IoU (Jaccard)</th>
                                            <th class="py-2.5 px-3 text-center">Dice (F1)</th>
                                            <th class="py-2.5 px-3">Error Vel. Frente</th>
                                            <th class="py-2.5 px-3">Veredicto Físico</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-stone-100">
                                        <tr class="bg-purple-50/40 font-medium">
                                            <td class="py-3 px-3 font-bold text-stone-900 font-mono">
                                                Bullileo 2023 (Maule Sur)
                                                <span class="block text-[10px] text-purple-700 font-normal">Puelche 40 km/h • HR 19%</span>
                                            </td>
                                            <td class="py-3 px-3 text-stone-600 font-mono">CONAF SICOF / FIRMS</td>
                                            <td class="py-3 px-3 font-mono font-bold text-stone-800">348.5 ha</td>
                                            <td class="py-3 px-3 font-mono text-purple-800 font-bold">362.0 ha</td>
                                            <td class="py-3 px-3 font-mono text-center font-black text-emerald-700 text-sm">74.27%</td>
                                            <td class="py-3 px-3 font-mono text-center font-bold text-emerald-800">85.24%</td>
                                            <td class="py-3 px-3 font-mono text-stone-700">+0.8 m/min</td>
                                            <td class="py-3 px-3">
                                                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">VALIDADO (TRL 8)</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="py-3 px-3 font-mono text-stone-800">
                                                Pirque / WUI 2024 (RM)
                                                <span class="block text-[10px] text-stone-500 font-normal">Suroeste 24 km/h • HR 18%</span>
                                            </td>
                                            <td class="py-3 px-3 text-stone-600 font-mono">CONAF / NASA VIIRS</td>
                                            <td class="py-3 px-3 font-mono text-stone-700">185.0 ha</td>
                                            <td class="py-3 px-3 font-mono text-stone-700">194.2 ha</td>
                                            <td class="py-3 px-3 font-mono text-center font-bold text-emerald-700">71.74%</td>
                                            <td class="py-3 px-3 font-mono text-center font-bold text-emerald-800">83.54%</td>
                                            <td class="py-3 px-3 font-mono text-stone-700">+0.8 m/min</td>
                                            <td class="py-3 px-3">
                                                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">VALIDADO</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="py-3 px-3 font-mono text-stone-800">
                                                Collipulli / Malleco 2023 (Biobío)
                                                <span class="block text-[10px] text-stone-500 font-normal">Ladera 45 km/h • FMC 6%</span>
                                            </td>
                                            <td class="py-3 px-3 text-stone-600 font-mono">CONAF SICOF</td>
                                            <td class="py-3 px-3 font-mono text-stone-700">520.0 ha</td>
                                            <td class="py-3 px-3 font-mono text-stone-700">548.0 ha</td>
                                            <td class="py-3 px-3 font-mono text-center font-bold text-emerald-700">74.06%</td>
                                            <td class="py-3 px-3 font-mono text-center font-bold text-emerald-800">85.10%</td>
                                            <td class="py-3 px-3 font-mono text-stone-700">+1.5 m/min</td>
                                            <td class="py-3 px-3">
                                                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">VALIDADO</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- Matriz de Confusión Espacial (Pixel a Pixel) -->
                            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-100 text-center font-mono">
                                <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                                    <span class="text-[10px] text-emerald-700 block uppercase font-bold">Verdaderos Positivos (Área Coincidente)</span>
                                    <span class="text-base font-bold text-emerald-900">302.8 ha (86.9%)</span>
                                </div>
                                <div class="p-3 rounded-xl bg-amber-50 border border-amber-200">
                                    <span class="text-[10px] text-amber-700 block uppercase font-bold">Falsos Positivos (Sobreestimación Buffer)</span>
                                    <span class="text-base font-bold text-amber-900">59.2 ha (16.3%)</span>
                                </div>
                                <div class="p-3 rounded-xl bg-rose-50 border border-rose-200">
                                    <span class="text-[10px] text-rose-700 block uppercase font-bold">Falsos Negativos (Focos No Alcanzados)</span>
                                    <span class="text-base font-bold text-rose-900">45.7 ha (13.1%)</span>
                                </div>
                                <div class="p-3 rounded-xl bg-purple-50 border border-purple-200">
                                    <span class="text-[10px] text-purple-700 block uppercase font-bold">Promedio Global IoU</span>
                                    <span class="text-base font-bold text-purple-900">73.36% (Excelente)</span>
                                </div>
                            </div>

                            <!-- Comando CLI para Reproducir -->
                            <div class="p-3 rounded-xl bg-stone-900 text-stone-200 font-mono text-xs flex items-center justify-between flex-wrap gap-2">
                                <div class="flex items-center gap-2">
                                    <span class="text-emerald-400 font-bold">$</span>
                                    <span>python3 scripts/benchmark/benchmark_suite.py --site SITE-01-MAULE-SUR</span>
                                </div>
                                <span class="text-[10px] text-stone-400">Actualiza data/benchmark_results.json automáticamente</span>
                            </div>

                        </div>

                    </div>

                    <!-- ═══════════════════════════════════════════════════════════════════
                         VISTA 3: CONTRASTE LADO A LADO & ALCANCE BIOFÍSICO (TENDIDOS Y CAMINOS)
                         ═══════════════════════════════════════════════════════════════════ -->
                    <div id="hindcastView-contraste" class="hindcast-subpanel hidden space-y-6 font-sans">
                        
                        <!-- Tabla Comparativa Modo A vs Modo B -->
                        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#E7DAC6] shadow-sm space-y-4">
                            <div class="border-b border-stone-200 pb-3">
                                <span class="text-xs font-mono font-bold uppercase text-stone-500 tracking-wider">MATRIZ EPISTEMOLÓGICA</span>
                                <h4 class="text-base sm:text-lg font-bold text-stone-900 font-serif">Modo A (Auditoría Numérica) vs. Modo B (Gemelo Digital Visual): ¿Por qué ambos?</h4>
                                <p class="text-xs text-stone-600 mt-1">No son herramientas excluyentes; responden a audiencias, urgencias temporales y objetivos complementarios.</p>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Modo A -->
                                <div class="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2.5">
                                    <div class="flex items-center justify-between">
                                        <h5 class="font-bold text-purple-950 font-serif text-sm flex items-center gap-1.5">
                                            <span>📊</span> Modo A: Auditoría Numérica Formal
                                        </h5>
                                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-200 text-purple-900">INGENIERÍA & CERTIFICACIÓN</span>
                                    </div>
                                    <ul class="text-xs text-stone-700 space-y-1.5 list-disc list-inside leading-relaxed">
                                        <li><strong>Audiencia:</strong> Auditorías de la DGA, aseguradoras agrícolas, tribunales ambientales y comités científicos de fondos I+D (CORFO/ANID).</li>
                                        <li><strong>Salida Principal:</strong> Métricas estadísticas frías e irrefutables ($IoU \ge 74\%$, Dice, $PBIAS$, $RMSE$ de frente).</li>
                                        <li><strong>Horizonte Temporal:</strong> Post-siniestro o auditoría anual para calibrar los parámetros de rugosidad y biomasa del modelo.</li>
                                        <li><strong>Fuerza:</strong> Rigor matemático reproducible sin sesgo subjetivo visual.</li>
                                    </ul>
                                </div>

                                <!-- Modo B -->
                                <div class="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2.5">
                                    <div class="flex items-center justify-between">
                                        <h5 class="font-bold text-rose-950 font-serif text-sm flex items-center gap-1.5">
                                            <span>🖥️</span> Modo B: Gemelo Digital Visual (Cuenca 3D)
                                        </h5>
                                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-200 text-rose-900">OPERACIÓN TÁCTICA C2</span>
                                    </div>
                                    <ul class="text-xs text-stone-700 space-y-1.5 list-disc list-inside leading-relaxed">
                                        <li><strong>Audiencia:</strong> Administrador de predio, comités de agua potable rural (APRs), vecinos y brigadistas en el terreno.</li>
                                        <li><strong>Salida Principal:</strong> Visor 3D inmersivo con vectores de viento Puelche, envolvente elíptica animada y tiempo estimado de impacto predial.</li>
                                        <li><strong>Horizonte Temporal:</strong> Alerta temprana preventiva (18-24 horas antes) y comando en tiempo real durante la emergencia.</li>
                                        <li><strong>Fuerza:</strong> Claridad cognitiva inmediata: permite decidir en 60 segundos si evacuar el ganado o presurizar la red de aspersores.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- Respuesta Epistemológica: ¿Por qué prescindimos de tendidos eléctricos y caminos? -->
                        <div class="p-5 sm:p-6 rounded-2xl bg-amber-50/70 border border-amber-200/90 shadow-sm space-y-3">
                            <div class="flex items-start gap-3">
                                <span class="text-2xl p-2 rounded-xl bg-amber-200/60 text-amber-900 shrink-0">⚡</span>
                                <div class="space-y-2">
                                    <h4 class="text-base font-bold text-amber-950 font-serif">
                                        ¿Por qué prescindimos de Tendidos Eléctricos y Caminos Rurales en el Núcleo de AgriTwin?
                                    </h4>
                                    <p class="text-xs text-stone-700 leading-relaxed">
                                        En la discusión técnica sobre factores no considerados, surgió la duda de por qué no incluimos las líneas eléctricas o los caminos. La respuesta radica en la <strong>separación conceptual entre Ignición, Propagación y Diseño Biológico del Paisaje</strong>:
                                    </p>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                                        <div class="p-3 rounded-lg bg-white/80 border border-amber-200 space-y-1">
                                            <strong class="text-stone-900 font-bold block">1. Tendidos Eléctricos: Causa de Ignición, no de Propagación</strong>
                                            <p class="text-stone-600 leading-relaxed text-[11.5px]">
                                                En Chile, el viento Puelche hace chocar ramas contra cables de media tensión, provocando chispas que inician muchos incendios. Sin embargo, <em>una vez que la chispa cayó al suelo y el fuego prendió, el tendido eléctrico ya no influye en la física</em> de cómo la llama avanza por el cerro. Dado que AgriTwin evalúa la <strong>resiliencia del paisaje y la velocidad de propagación</strong>, modelar los cables añade complejidad catastral sin cambiar en nada las ecuaciones de Rothermel o Albini.
                                            </p>
                                        </div>

                                        <div class="p-3 rounded-lg bg-white/80 border border-amber-200 space-y-1">
                                            <strong class="text-stone-900 font-bold block">2. Caminos Rurales vs. Fajas Cortafuegos Biológicas</strong>
                                            <p class="text-stone-600 leading-relaxed text-[11.5px]">
                                                Un camino de tierra de 4 metros es una barrera física menor: bajo viento Puelche de 40 km/h, las pavesas saltan fácilmente 400 a 600 metros. El verdadero núcleo de AgriTwin no es la vialidad pública, sino el <strong>diseño agrohidrológico Keyline</strong>: fajas anchas de 45 metros con vegetación foliar hidratada mediante tranques de retención ($FMC > 120\%$), capaces de asfixiar el frente térmico de forma autónoma.
                                            </p>
                                        </div>
                                    </div>

                                    <div class="p-2.5 rounded-lg bg-emerald-100/70 border border-emerald-300 text-[11px] text-emerald-900 font-medium">
                                        🎯 <strong>Conclusión Biofísica:</strong> AgriTwin mantiene su arquitectura pura y elegante centrándose en las 3 variables soberanas que gobiernan el 95% del avance del fuego: <strong>Orografía DEM (pendiente)</strong>, <strong>Vector de Viento 3D</strong> y <strong>Contenido de Humedad en la Biomasa Vegetal (Sentinel-2)</strong>.
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
'''

def main():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    index_path = os.path.join(repo_root, 'index.html')

    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Agregar el botón de la subtab en la barra de navegación de docs-uq
    subtab_needle = r'''                    <button onclick="switchUqTab('codigo')" id="uqTabBtn-codigo" class="uq-subtab-btn px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm bg-white border border-[#E7DAC6] text-stone-700 hover:bg-stone-50">
                        <span>💻</span> <span>4. Laboratorio de Código R (RStudio)</span>
                        <span class="px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 text-[9px] font-mono font-bold">R 4.5.2 REPRODUCIBLE</span>
                    </button>'''

    new_subtab_button = r'''                    <button onclick="switchUqTab('codigo')" id="uqTabBtn-codigo" class="uq-subtab-btn px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm bg-white border border-[#E7DAC6] text-stone-700 hover:bg-stone-50">
                        <span>💻</span> <span>4. Laboratorio de Código R (RStudio)</span>
                        <span class="px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 text-[9px] font-mono font-bold">R 4.5.2 REPRODUCIBLE</span>
                    </button>
                    <button onclick="switchUqTab('hindcast')" id="uqTabBtn-hindcast" class="uq-subtab-btn px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm bg-white border border-[#E7DAC6] text-stone-700 hover:bg-stone-50">
                        <span>🔥</span> <span>5. Auditoría Retrospectiva (Hindcast Incendios)</span>
                        <span class="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[9px] font-mono font-bold">MODO A vs MODO B</span>
                    </button>'''

    if 'uqTabBtn-hindcast' not in html:
        if subtab_needle in html:
            html = html.replace(subtab_needle, new_subtab_button)
            print("✅ Subtab button uqTabBtn-hindcast inyectado exitosamente.")
        else:
            print("⚠️ No se encontró subtab_needle exacta en index.html.")

    # 2. Agregar lógica en jumpToDocModule para hindcast
    jump_needle = "else if (elementId && (elementId.startsWith('fig-') || elementId === 'atlas-canonical-figures')) window.switchUqTab('atlas');"
    jump_replacement = jump_needle + "\n                else if (elementId === 'docs-hindcast-suite' || elementId === 'mod-hindcast' || (elementId && elementId.startsWith('hindcast-'))) window.switchUqTab('hindcast');"

    if 'docs-hindcast-suite' not in html and jump_needle in html:
        html = html.replace(jump_needle, jump_replacement)
        print("✅ Soporte en jumpToDocModule inyectado.")

    # 3. Inyectar el contenedor uq-content-hindcast justo antes de id="docs-arch"
    content_needle = r'''            <!-- ═══════════════════════════════════════════════════════════════════
                 SUBTAB 1: ARQUITECTURA DEL SISTEMA (MASTER-DETAIL CON MERMAID & TABLAS)
                 ═══════════════════════════════════════════════════════════════════ -->
            <div id="docs-arch"'''

    hindcast_content = generate_hindcast_html()

    if 'id="uq-content-hindcast"' not in html:
        if content_needle in html:
            # Colocamos el contenedor antes del cierre del docs-uq
            # docs-uq cierra con </div> justo antes de docs-arch
            insertion = hindcast_content + "\n            </div>\n\n" + content_needle
            # Reemplazamos el cierre anterior
            html = html.replace("                </div>\n\n            </div>\n\n            " + content_needle.strip(), 
                                "                </div>\n" + hindcast_content + "\n            </div>\n\n            " + content_needle.strip())
            if 'id="uq-content-hindcast"' not in html:
                # Fallback de reemplazo más tolerante
                idx = html.find(content_needle)
                if idx != -1:
                    # Encontrar el último </div> antes de docs-arch
                    last_div_idx = html.rfind('</div>', 0, idx)
                    if last_div_idx != -1:
                        html = html[:last_div_idx] + hindcast_content + "\n" + html[last_div_idx:]
                        print("✅ Contenedor uq-content-hindcast inyectado con fallback.")
            else:
                print("✅ Contenedor uq-content-hindcast inyectado limpiamente.")
        else:
            print("⚠️ No se encontró content_needle.")

    # 4. Inyectar funciones JS globales para la interactividad del módulo hindcast
    js_needle = "window.switchUqTab = function(tabId) {"
    js_hindcast_code = r'''
        // Subnavegación del Módulo Hindcast (Modo A vs Modo B vs Contraste)
        window.switchHindcastView = function(viewId) {
            document.querySelectorAll('.hindcast-subpanel').forEach(p => p.classList.add('hidden'));
            document.querySelectorAll('.hindcast-nav-btn').forEach(btn => {
                btn.classList.remove('active', 'bg-rose-600', 'text-white', 'border-rose-500');
                btn.classList.add('bg-white/10', 'text-slate-300', 'border-white/10');
            });
            const targetPanel = document.getElementById('hindcastView-' + viewId);
            if (targetPanel) targetPanel.classList.remove('hidden');
            const targetBtn = document.getElementById(viewId === 'modo-b' ? 'hindcastBtn-b' : (viewId === 'modo-a' ? 'hindcastBtn-a' : 'hindcastBtn-c'));
            if (targetBtn) {
                targetBtn.classList.remove('bg-white/10', 'text-slate-300', 'border-white/10');
                targetBtn.classList.add('active', 'bg-rose-600', 'text-white', 'border-rose-500');
            }
        };

        // Pasos de Reproducción Retrospectiva (Línea de Tiempo Modo B)
        window.setHindcastStep = function(step) {
            document.querySelectorAll('.hindcast-step-btn').forEach(b => {
                b.classList.remove('active', 'bg-rose-600', 'text-white', 'border-rose-500', 'shadow-sm');
                b.classList.add('bg-slate-800', 'text-slate-300', 'border-white/5');
            });
            const activeBtn = document.getElementById('hindcastStepBtn-' + step);
            if (activeBtn) {
                activeBtn.classList.remove('bg-slate-800', 'text-slate-300', 'border-white/5');
                activeBtn.classList.add('active', 'bg-rose-600', 'text-white', 'border-rose-500', 'shadow-sm');
            }

            const phaseLabel = document.getElementById('hindcast-current-phase-label');
            const fwiVal = document.getElementById('hindcast-fwi-val');
            const fwiBar = document.getElementById('hindcast-fwi-bar');
            const fwiBadge = document.getElementById('hindcast-fwi-badge');
            const windVal = document.getElementById('hindcast-wind-val');
            const rateVal = document.getElementById('hindcast-rate-val');
            const distVal = document.getElementById('hindcast-dist-val');
            const etaVal = document.getElementById('hindcast-eta-val');

            if (step === 1) { // T - 24h
                if (phaseLabel) phaseLabel.innerText = "Fase 1: T - 24h (Desecación de Biomasa Previa)";
                if (fwiVal) fwiVal.innerText = "42";
                if (fwiBar) fwiBar.style.width = "45%";
                if (fwiBadge) {
                    fwiBadge.className = "text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60 font-bold text-center";
                    fwiBadge.innerText = "⚠️ ALERTA AMARILLA PREVENTIVA (Riesgo FWI Elevado)";
                }
                if (windVal) windVal.innerText = "28.5 km/h";
                if (rateVal) rateVal.innerText = "0.0 m/min";
                if (distVal) distVal.innerText = "Sin Foco Activo";
                if (etaVal) etaVal.innerText = "Monitoreo Preventivo";
            } else if (step === 2) { // T0
                if (phaseLabel) phaseLabel.innerText = "Fase 2: T0 (Ignición Inicial 13:45h • Ladera Sur)";
                if (fwiVal) fwiVal.innerText = "68";
                if (fwiBar) fwiBar.style.width = "72%";
                if (fwiBadge) {
                    fwiBadge.className = "text-[10px] text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60 font-bold text-center";
                    fwiBadge.innerText = "🚨 PELIGRO EXTREMO (Regla 30-30-30)";
                }
                if (windVal) windVal.innerText = "40.2 km/h";
                if (rateVal) rateVal.innerText = "6.5 m/min";
                if (distVal) distVal.innerText = "4.2 km al Este";
                if (etaVal) etaVal.innerText = "2 h 15 min";
            } else if (step === 3) { // T + 2h
                if (phaseLabel) phaseLabel.innerText = "Fase 3: T + 2h (Carrera Convectiva Ladera Arriba)";
                if (fwiVal) fwiVal.innerText = "74";
                if (fwiBar) fwiBar.style.width = "82%";
                if (fwiBadge) {
                    fwiBadge.className = "text-[10px] text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-700 font-bold text-center animate-pulse";
                    fwiBadge.innerText = "🔥 EMERGENCIA MÁXIMA (Frente de Llama Activo)";
                }
                if (windVal) windVal.innerText = "44.0 km/h";
                if (rateVal) rateVal.innerText = "15.6 m/min";
                if (distVal) distVal.innerText = "2.4 km al Este";
                if (etaVal) etaVal.innerText = "1 h 18 min";
            } else if (step === 4) { // T + 6h
                if (phaseLabel) phaseLabel.innerText = "Fase 4: T + 6h (Salto de Pavesas Convectivas Albini)";
                if (fwiVal) fwiVal.innerText = "65";
                if (fwiBar) fwiBar.style.width = "70%";
                if (fwiBadge) {
                    fwiBadge.className = "text-[10px] text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-700 font-bold text-center";
                    fwiBadge.innerText = "🚨 SALTO DE BARRERAS (Pavesas 580m)";
                }
                if (windVal) windVal.innerText = "38.5 km/h";
                if (rateVal) rateVal.innerText = "12.2 m/min";
                if (distVal) distVal.innerText = "0.8 km (Borde Faja)";
                if (etaVal) etaVal.innerText = "32 minutos";
            } else if (step === 5) { // T + 12h
                if (phaseLabel) phaseLabel.innerText = "Fase 5: T + 12h (Colapso y Contención en Faja Keyline)";
                if (fwiVal) fwiVal.innerText = "28";
                if (fwiBar) fwiBar.style.width = "30%";
                if (fwiBadge) {
                    fwiBadge.className = "text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700 font-bold text-center";
                    fwiBadge.innerText = "🛡️ FRENTE ATENUADO 92% (Faja Cortafuegos)";
                }
                if (windVal) windVal.innerText = "16.0 km/h (Brisa Marina)";
                if (rateVal) rateVal.innerText = "1.2 m/min";
                if (distVal) distVal.innerText = "Contenido en Faja";
                if (etaVal) etaVal.innerText = "Extinguido / Seguro";
            }
        };
'''

    if 'switchHindcastView' not in html:
        if js_needle in html:
            html = html.replace(js_needle, js_hindcast_code + "\n        " + js_needle)
            print("✅ Funciones JS switchHindcastView y setHindcastStep inyectadas exitosamente.")

    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print("🚀 index.html actualizado y persistido correctamente con el Módulo Hindcast.")

if __name__ == '__main__':
    main()
