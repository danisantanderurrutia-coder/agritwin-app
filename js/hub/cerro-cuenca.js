        // ═══════════════════════════════════════════════════════════════════
        // PROCEDURAL AUDIO ENGINE - SILENCIADO TOTAL (CERO SONIDO)
        // ═══════════════════════════════════════════════════════════════════
        let diegeticAudioCtx = null;
        function playDiegeticAudio(type) {
            // Silenciado: Todos los sonidos de la web eliminados
            return;
        }

        // ═══════════════════════════════════════════════════════════════════
        // CONTROLADORES DE MODALES DIEGÉTICOS (EL CERRO & LA MESA)
        // ═══════════════════════════════════════════════════════════════════
        function openCerroHotspotModal(id) {
            playDiegeticAudio('bell');
            const modal = document.getElementById('cerroHotspotModal');
            const titleEl = document.getElementById('cerroModalTitle');
            const badgeEl = document.getElementById('cerroModalBadge');
            const bodyEl = document.getElementById('cerroModalBody');
            if (!modal || !titleEl || !bodyEl) return;

            // Actualizar estado visual de las pestañas en la barra unificada
            const allTabs = ['drone', 'clima', 'mirador', 'obras', 'hidro', 'lora', 'resumen'];
            allTabs.forEach(tKey => {
                const btn = document.getElementById('tabHotspot-' + tKey);
                if (btn) {
                    if (tKey === id) {
                        btn.className = 'px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap bg-sky-500/25 text-sky-200 border-sky-400/60 font-bold shadow-[0_0_15px_rgba(14,165,233,0.3)] scale-[1.02]';
                    } else {
                        btn.className = 'px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10 font-medium';
                    }
                }
            });

            if (id === 'drone') {
                if (badgeEl) badgeEl.innerText = 'OBJ-CUENCA-01 • LULC';
                titleEl.innerHTML = '<span>🛸</span> Monitoreo Aéreo LULC & Ortomosaico Sentinel-2';
                bodyEl.innerHTML = `
                    <div class="space-y-4">
                        <div class="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-xs space-y-2">
                            <div class="flex items-center justify-between font-mono">
                                <span class="text-sky-300 font-bold">Sensor: MSI Sentinel-2B (Bandas B4, B8, B11)</span>
                                <span class="text-emerald-400">Paso: 24h</span>
                            </div>
                            <p class="text-slate-300 leading-relaxed">
                                Cobertura total de 122.070 ha procesada en Google Earth Engine. Clasificación supervisada Random Forest para discernir plantaciones comerciales de pino/eucalipto frente al mosaico agrícola tradicional del valle.
                            </p>
                        </div>

                        <div class="space-y-2">
                            <span class="text-[11px] font-mono text-slate-400 font-bold block">Distribución de Coberturas en la Cuenca:</span>
                            <div class="space-y-1.5 font-mono text-xs">
                                <div>
                                    <div class="flex justify-between text-slate-300 mb-0.5"><span>🌲 Plantación Forestal (Pino/Eucalipto):</span><span class="text-amber-400 font-bold">48% (58.590 ha)</span></div>
                                    <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div class="bg-amber-500 h-full" style="width: 48%"></div></div>
                                </div>
                                <div>
                                    <div class="flex justify-between text-slate-300 mb-0.5"><span>🌾 Agrícola Bajo Riego (Cereales/Viñas):</span><span class="text-emerald-400 font-bold">34% (41.500 ha)</span></div>
                                    <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div class="bg-emerald-500 h-full" style="width: 34%"></div></div>
                                </div>
                                <div>
                                    <div class="flex justify-between text-slate-300 mb-0.5"><span>🌿 Bosque Nativo & Matorral Esclerófilo:</span><span class="text-sky-400 font-bold">12% (14.650 ha)</span></div>
                                    <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div class="bg-sky-500 h-full" style="width: 12%"></div></div>
                                </div>
                                <div>
                                    <div class="flex justify-between text-slate-300 mb-0.5"><span>💧 Cuerpos de Agua & Centros Urbanos:</span><span class="text-cyan-400 font-bold">6% (7.330 ha)</span></div>
                                    <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div class="bg-cyan-500 h-full" style="width: 6%"></div></div>
                                </div>
                            </div>
                        </div>

                        <div class="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                            <button onclick="closeCerroHotspotModal(); openCerroMapWithTab('tab-territory');" class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black font-mono text-xs shadow-lg transition-all">
                                🗺️ Activar Capa LULC en Mapa GIS
                            </button>
                            <button onclick="closeCerroHotspotModal()" class="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono">
                                Cerrar
                            </button>
                        </div>
                    </div>
                `;
            } else if (id === 'mirador') {
                if (badgeEl) badgeEl.innerText = 'OBJ-CUENCA-02 • MIRADOR';
                titleEl.innerHTML = '<span>🔭</span> Vistas Predefinidas & Locaciones Estratégicas';
                bodyEl.innerHTML = `
                    <div class="space-y-4">
                        <p class="text-xs text-slate-300">
                            Haz clic en cualquiera de los puntos neurálgicos de la macro-cuenca para volar de inmediato en el visor cartográfico:
                        </p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button onclick="closeCerroHotspotModal(); flyToCerroLocation(-36.21156, -71.60530, 15, 'Fundo Meniel', 'tab-territory');" class="p-3 rounded-xl bg-black/50 hover:bg-emerald-950/40 border border-emerald-500/40 text-left transition-all group">
                                <div class="font-bold text-sm text-white group-hover:text-emerald-300 flex items-center justify-between">
                                    <span>🏡 Fundo Meniel</span>
                                    <span class="text-[10px] font-mono text-emerald-400">Keyline 18.5k m³</span>
                                </div>
                                <div class="text-[11px] text-slate-400 mt-1">Núcleo biofísico de retención y cortafuegos.</div>
                            </button>
                            <button onclick="closeCerroHotspotModal(); flyToCerroLocation(-36.2800, -71.4200, 13, 'Embalse Bullileo', 'tab-water');" class="p-3 rounded-xl bg-black/50 hover:bg-sky-950/40 border border-sky-500/40 text-left transition-all group">
                                <div class="font-bold text-sm text-white group-hover:text-sky-300 flex items-center justify-between">
                                    <span>🌊 Embalse Bullileo</span>
                                    <span class="text-[10px] font-mono text-sky-400">89.5M m³</span>
                                </div>
                                <div class="text-[11px] text-slate-400 mt-1">Cabecera de riego y control de crecidas.</div>
                            </button>
                            <button onclick="closeCerroHotspotModal(); flyToCerroLocation(-36.0500, -71.7667, 14, 'Retiro Pueblo', 'tab-centinela');" class="p-3 rounded-xl bg-black/50 hover:bg-yellow-950/40 border border-yellow-500/40 text-left transition-all group">
                                <div class="font-bold text-sm text-white group-hover:text-yellow-300 flex items-center justify-between">
                                    <span>🌾 Retiro Pueblo</span>
                                    <span class="text-[10px] font-mono text-yellow-400">Valle APR</span>
                                </div>
                                <div class="text-[11px] text-slate-400 mt-1">Pozos comunitarios y cultivos de arroz.</div>
                            </button>
                            <button onclick="closeCerroHotspotModal(); flyToCerroLocation(-36.1432, -71.8267, 14, 'Parral Centro', 'tab-territory');" class="p-3 rounded-xl bg-black/50 hover:bg-slate-800 border border-white/10 text-left transition-all group">
                                <div class="font-bold text-sm text-white group-hover:text-slate-200 flex items-center justify-between">
                                    <span>🚜 Parral Centro</span>
                                    <span class="text-[10px] font-mono text-slate-400">Urbano</span>
                                </div>
                                <div class="text-[11px] text-slate-400 mt-1">Eje agroindustrial y logístico del Maule Sur.</div>
                            </button>
                            <button onclick="closeCerroHotspotModal(); flyToCerroLocation(-36.1300, -71.6500, 11, 'Vista General Cuenca', 'tab-territory');" class="p-3 rounded-xl bg-black/50 hover:bg-cyan-950/40 border border-cyan-500/40 text-left transition-all group">
                                <div class="font-bold text-sm text-white group-hover:text-cyan-300 flex items-center justify-between">
                                    <span>🗺️ Vista General Cuenca</span>
                                    <span class="text-[10px] font-mono text-cyan-400">122k ha</span>
                                </div>
                                <div class="text-[11px] text-slate-400 mt-1">Perspectiva completa de cordillera a secano.</div>
                            </button>
                            <button onclick="closeCerroHotspotModal(); flyToCerroLocation(-36.1800, -71.6400, 14, 'Río Longaví Crossing', 'tab-water');" class="p-3 rounded-xl bg-black/50 hover:bg-blue-950/40 border border-blue-500/40 text-left transition-all group">
                                <div class="font-bold text-sm text-white group-hover:text-blue-300 flex items-center justify-between">
                                    <span>🌊 Río Longaví Crossing</span>
                                    <span class="text-[10px] font-mono text-blue-400">DGA Quilaimo</span>
                                </div>
                                <div class="text-[11px] text-slate-400 mt-1">Caudal fluviométrico y zonas de anegamiento.</div>
                            </button>
                        </div>
                    </div>
                `;
            } else if (id === 'hidro') {
                if (badgeEl) badgeEl.innerText = 'OBJ-CUENCA-03 • HIDROLOGÍA';
                titleEl.innerHTML = '<span>📟</span> Dinámica Hídrica Fluvial & Simulación de Crecidas';
                bodyEl.innerHTML = `
                    <div class="space-y-4 text-xs font-mono">
                        <div class="grid grid-cols-3 gap-2 text-center">
                            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                <span class="text-[10px] text-slate-500 block">Caudal Real</span>
                                <span class="text-sky-400 font-bold text-sm">124.5 m³/s</span>
                            </div>
                            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                <span class="text-[10px] text-slate-500 block">Tiempo Concentración</span>
                                <span class="text-slate-200 font-bold text-sm">tc = 6.2 h</span>
                            </div>
                            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                <span class="text-[10px] text-slate-500 block">Reserva Keyline</span>
                                <span class="text-emerald-400 font-bold text-sm">18.500 m³</span>
                            </div>
                        </div>

                        <div class="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3 font-sans">
                            <div class="font-bold text-slate-200 text-xs">Simulador de Anegamiento Fluvial por Período de Retorno:</div>
                            <div class="grid grid-cols-3 gap-2">
                                <button onclick="simulateFloodScenario(10)" class="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/40 hover:bg-sky-900/60 text-sky-200 font-mono text-xs font-bold transition-all text-center">
                                    T = 10 Años
                                    <span class="block text-[10px] text-sky-400 font-normal mt-0.5">180 m³/s</span>
                                </button>
                                <button onclick="simulateFloodScenario(50)" class="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/40 hover:bg-sky-900/60 text-sky-200 font-mono text-xs font-bold transition-all text-center">
                                    T = 50 Años
                                    <span class="block text-sky-400 font-normal mt-0.5">345 m³/s</span>
                                </button>
                                <button onclick="simulateFloodScenario(100)" class="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/40 hover:bg-blue-900/60 text-blue-200 font-mono text-xs font-bold transition-all text-center">
                                    T = 100 Años
                                    <span class="block text-blue-400 font-normal mt-0.5">520 m³/s</span>
                                </button>
                            </div>
                            <div id="floodScenarioFeedback" class="text-[11px] font-mono text-slate-300 p-2.5 rounded-lg bg-black/30 border border-white/5">
                                💡 Selecciona un período de retorno para modelar el área inundable del valle.
                            </div>
                        </div>

                        <!-- ═══════════════════════════════════════════════════════════════════
                             MODELO 1: PERFIL TRANSECTO TOPOGRÁFICO & HIDRÁULICO X-Y (FIGURAS 1 & 3)
                             ═══════════════════════════════════════════════════════════════════ -->
                        <div class="p-3.5 rounded-2xl bg-black/70 border border-sky-500/40 space-y-2">
                            <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
                                <span class="text-xs font-bold text-sky-300 font-mono flex items-center gap-1.5">
                                    <span>📐</span> Perfil Transecto Hidráulico X-Y (Andes ➔ Valle Central)
                                </span>
                                <span class="text-[9.5px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono border border-sky-500/30">Cotas 1.400m ➔ 145m</span>
                            </div>
                            <p class="text-[11px] text-slate-300 font-sans leading-relaxed">
                                Corte transversal longitudinal del Río Longaví: ilustra la disipación de gradiente hidráulico desde la garganta andina de Bullileo, paso por Fundo Meniel y ensanche aluvial en Retiro.
                            </p>
                            <!-- Gráfico Vectorial SVG Transecto X-Y -->
                            <div class="rounded-xl overflow-hidden bg-[#070e1b] border border-sky-500/20 p-2">
                                <svg viewBox="0 0 540 180" class="w-full h-auto select-none font-mono">
                                    <defs>
                                        <linearGradient id="gradTerrain" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stop-color="#334155" stop-opacity="0.9"/>
                                            <stop offset="60%" stop-color="#1e293b" stop-opacity="0.95"/>
                                            <stop offset="100%" stop-color="#0f172a" stop-opacity="1"/>
                                        </linearGradient>
                                        <linearGradient id="gradWaterFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.75"/>
                                            <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.85"/>
                                            <stop offset="100%" stop-color="#0284c7" stop-opacity="0.75"/>
                                        </linearGradient>
                                    </defs>
                                    <!-- Ejes y grilla de cota -->
                                    <line x1="45" y1="20" x2="520" y2="20" stroke="#334155" stroke-dasharray="2,3" stroke-width="0.8"/>
                                    <text x="12" y="24" fill="#94a3b8" font-size="8.5">1.400m</text>
                                    <line x1="45" y1="70" x2="520" y2="70" stroke="#334155" stroke-dasharray="2,3" stroke-width="0.8"/>
                                    <text x="18" y="74" fill="#94a3b8" font-size="8.5">680m</text>
                                    <line x1="45" y1="120" x2="520" y2="120" stroke="#334155" stroke-dasharray="2,3" stroke-width="0.8"/>
                                    <text x="18" y="124" fill="#94a3b8" font-size="8.5">340m</text>
                                    <line x1="45" y1="155" x2="520" y2="155" stroke="#334155" stroke-dasharray="2,3" stroke-width="0.8"/>
                                    <text x="18" y="159" fill="#94a3b8" font-size="8.5">145m</text>

                                    <!-- Polígono del Relieve de Cuenca -->
                                    <path d="M 45 20 Q 140 40 210 70 T 360 120 T 520 155 L 520 175 L 45 175 Z" fill="url(#gradTerrain)" stroke="#64748b" stroke-width="1.5"/>

                                    <!-- Lámina de Agua y Gradiente Hidráulico -->
                                    <path d="M 45 23 Q 140 43 210 73 T 360 123 T 520 158" fill="none" stroke="url(#gradWaterFlow)" stroke-width="4.5" stroke-linecap="round"/>
                                    <path d="M 45 23 Q 140 43 210 73 T 360 123 T 520 158" fill="none" stroke="#7dd3fc" stroke-width="1.2" stroke-dasharray="6,4"/>

                                    <!-- Nivel Freático y Zona de Infiltración Keyline -->
                                    <path d="M 210 85 Q 360 135 520 166" fill="none" stroke="#a855f7" stroke-dasharray="3,3" stroke-width="1.2"/>
                                    <text x="375" y="150" fill="#c084fc" font-size="7.5">Napa Freática Subálvea (Keyline APR)</text>

                                    <!-- Puntos Clave del Transecto -->
                                    <!-- Bullileo -->
                                    <circle cx="210" cy="73" r="4" fill="#38bdf8" stroke="#ffffff" stroke-width="1.2"/>
                                    <line x1="210" y1="73" x2="210" y2="52" stroke="#38bdf8" stroke-width="0.8"/>
                                    <text x="175" y="48" fill="#e2e8f0" font-size="8.5" font-weight="bold">Embalse Bullileo</text>
                                    <text x="182" y="58" fill="#38bdf8" font-size="7.5">47M m³ • Vaso Regulador</text>

                                    <!-- Meniel -->
                                    <circle cx="360" cy="123" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
                                    <line x1="360" y1="123" x2="360" y2="100" stroke="#10b981" stroke-width="0.8"/>
                                    <text x="325" y="94" fill="#6ee7b7" font-size="8.5" font-weight="bold">Fundo Meniel (Keyline)</text>
                                    <text x="330" y="104" fill="#94a3b8" font-size="7.5">Cota 340m • Tranques Cascada</text>

                                    <!-- Retiro -->
                                    <circle cx="495" cy="154" r="4" fill="#eab308" stroke="#ffffff" stroke-width="1.2"/>
                                    <line x1="495" y1="154" x2="495" y2="135" stroke="#eab308" stroke-width="0.8"/>
                                    <text x="455" y="130" fill="#fef08a" font-size="8.5" font-weight="bold">Valle Retiro / APRs</text>
                                    <text x="460" y="140" fill="#94a3b8" font-size="7.5">Cota 145m • Planicie Inundable</text>

                                    <!-- Flechas de Flujo Hidrodinámico -->
                                    <text x="135" y="50" fill="#bae6fd" font-size="9">➔ ➔</text>
                                    <text x="275" y="98" fill="#bae6fd" font-size="9">➔ ➔</text>
                                    <text x="420" y="138" fill="#bae6fd" font-size="9">➔ ➔</text>
                                </svg>
                            </div>
                        </div>

                        <!-- ═══════════════════════════════════════════════════════════════════
                             MODELO 2: MECÁNICA DE TRANSPORTE DE SEDIMENTOS & TURBIDEZ (FIGURAS 4 & 5)
                             ═══════════════════════════════════════════════════════════════════ -->
                        <div class="p-3.5 rounded-2xl bg-black/70 border border-emerald-500/40 space-y-2">
                            <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
                                <span class="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1.5">
                                    <span>🌊</span> Dinámica de Carga de Sedimentos en el Cauce
                                </span>
                                <span class="text-[9.5px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-500/30">Ley de Shields & Hjulström</span>
                            </div>
                            <p class="text-[11px] text-slate-300 font-sans leading-relaxed">
                                Corte transversal del lecho del Río Longaví: según el caudal $Q$, las arcillas viajan en <b>suspensión</b>, las arenas medias en <b>saltación</b> y los bolones de canto rodado por <b>tracción/rodadura de fondo</b>.
                            </p>
                            <!-- Gráfico Vectorial SVG Sedimentos -->
                            <div class="rounded-xl overflow-hidden bg-[#06101c] border border-emerald-500/20 p-2">
                                <svg viewBox="0 0 540 160" class="w-full h-auto select-none font-mono">
                                    <!-- Espejo de Agua Fluvial -->
                                    <rect x="25" y="15" width="490" height="95" fill="rgba(14, 165, 233, 0.15)" stroke="#38bdf8" stroke-width="0.8" rx="4"/>
                                    <!-- Superficie libre del agua -->
                                    <line x1="25" y1="15" x2="515" y2="15" stroke="#38bdf8" stroke-width="2"/>
                                    <text x="35" y="28" fill="#7dd3fc" font-size="8.5">Superficie Libre (Espejo de Agua Río Longaví)</text>

                                    <!-- Carga Disuelta & Carga en Suspensión (Clay/Silt) -->
                                    <g opacity="0.85">
                                        <circle cx="85" cy="40" r="1.5" fill="#fde047"/>
                                        <circle cx="140" cy="50" r="1.2" fill="#fde047"/>
                                        <circle cx="210" cy="38" r="1.8" fill="#fde047"/>
                                        <circle cx="320" cy="48" r="1.4" fill="#fde047"/>
                                        <circle cx="410" cy="36" r="1.5" fill="#fde047"/>
                                        <circle cx="475" cy="44" r="1.2" fill="#fde047"/>
                                        <text x="35" y="55" fill="#fef08a" font-size="8">Carga en Suspensión (Limos y Arcillas coloidales • Turbidez NTU)</text>
                                    </g>

                                    <!-- Vectores de Flujo Superficial y Medio -->
                                    <line x1="280" y1="35" x2="360" y2="35" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#arrow)"/>
                                    <line x1="260" y1="65" x2="330" y2="65" stroke="#0ea5e9" stroke-width="1.5"/>
                                    <text x="370" y="38" fill="#38bdf8" font-size="8">V = 2.4 m/s</text>

                                    <!-- Saltación (Sand / Gravilla) -->
                                    <path d="M 120 108 Q 145 78 170 108 Q 195 82 220 108" fill="none" stroke="#fb923c" stroke-width="1.5" stroke-dasharray="3,2"/>
                                    <circle cx="145" cy="80" r="2.2" fill="#f97316"/>
                                    <circle cx="195" cy="84" r="2.2" fill="#f97316"/>
                                    <text x="130" y="74" fill="#fb923c" font-size="8">Saltación (Gravas medias)</text>

                                    <!-- Lecho Rocoso y Carga de Fondo (Bedload Traction / Rolling) -->
                                    <rect x="25" y="110" width="490" height="42" fill="#1e293b" stroke="#475569" stroke-width="1"/>
                                    <!-- Cantos rodados en el fondo -->
                                    <circle cx="65" cy="125" r="9" fill="#64748b" stroke="#94a3b8" stroke-width="1"/>
                                    <circle cx="95" cy="126" r="8" fill="#475569" stroke="#94a3b8" stroke-width="1"/>
                                    <circle cx="130" cy="124" r="10" fill="#64748b" stroke="#94a3b8" stroke-width="1"/>
                                    <circle cx="165" cy="126" r="7.5" fill="#475569" stroke="#94a3b8" stroke-width="1"/>
                                    <circle cx="205" cy="124" r="9.5" fill="#64748b" stroke="#94a3b8" stroke-width="1"/>
                                    <circle cx="245" cy="127" r="8" fill="#475569" stroke="#94a3b8" stroke-width="1"/>
                                    <circle cx="285" cy="124" r="10.5" fill="#64748b" stroke="#94a3b8" stroke-width="1"/>
                                    <!-- Vector de rodadura -->
                                    <path d="M 285 113 A 6 6 0 0 1 297 122" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
                                    <circle cx="325" cy="125" r="8" fill="#475569" stroke="#94a3b8" stroke-width="1"/>
                                    <circle cx="360" cy="124" r="9" fill="#64748b" stroke="#94a3b8" stroke-width="1"/>
                                    <circle cx="400" cy="126" r="10" fill="#64748b" stroke="#94a3b8" stroke-width="1"/>
                                    <circle cx="440" cy="125" r="8.5" fill="#475569" stroke="#94a3b8" stroke-width="1"/>
                                    <circle cx="480" cy="126" r="9" fill="#64748b" stroke="#94a3b8" stroke-width="1"/>

                                    <text x="35" y="148" fill="#cbd5e1" font-size="8">Carga de Fondo (Tracción y Rodadura de Cantos Rodados • Matriz Aluvial Infiltrable)</text>
                                </svg>
                            </div>
                        </div>

                        <div class="pt-2 flex items-center justify-between gap-3">
                            <button onclick="closeCerroHotspotModal(); openCerroMapWithTab('tab-water');" class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-400 hover:to-sky-500 text-slate-950 font-black font-mono text-xs shadow-lg transition-all cursor-pointer">
                                💧 Abrir Capa Hídrica en GIS
                            </button>
                            <button onclick="closeCerroHotspotModal()" class="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono cursor-pointer">
                                Cerrar
                            </button>
                        </div>
                    </div>
                `;
            } else if (id === 'clima') {
                if (badgeEl) badgeEl.innerText = 'OBJ-CUENCA-04 • PIRO-METEOROLOGÍA';
                titleEl.innerHTML = '<span>🌪️</span> Viento Puelche & Peligro de Incendios FWI';
                bodyEl.innerHTML = `
                    <div class="space-y-4 text-xs">
                        <!-- Sincronización Atmósfera Unificada -->
                        <div class="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30 space-y-1.5 font-mono">
                            <div class="flex items-center justify-between text-[11px]">
                                <span class="text-sky-300 font-bold">☁️ [ATMÓSFERA UNIFICADA]: OpenWeatherMap + Maule</span>
                                <span class="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">SINCRONIZADO PREDIO-CUENCA</span>
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-slate-300 text-[11px] pt-1">
                                <div>• Macro-Temp: <b class="text-white">18.5°C</b> (56% HR)</div>
                                <div>• Fruta/Suelo: <b class="text-red-400">-0.8°C</b> (Helada)</div>
                                <div>• Lluvia 72h: <b class="text-amber-400">14.5 mm</b> (75%)</div>
                                <div>• Isoterma 0°C: <b class="text-sky-400">2.850 msnm</b></div>
                            </div>
                            <div class="text-[10px] text-slate-400 italic pt-0.5">
                                Frente Sinóptico: Inestabilidad post-frontal y empuje Puelche desde los Andes.
                            </div>
                        </div>

                        <div class="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                            <div class="flex items-center justify-between font-mono">
                                <span class="text-amber-300 font-bold">FWI Actual: 24 (Bajo)</span>
                                <span class="text-slate-400">Viento: 38 km/h ESE</span>
                            </div>
                            <p class="text-slate-300 leading-relaxed font-sans">
                                El viento Puelche desciende catabáticamente desde la cordillera con humedad relativa menor al 25% y alta temperatura, desecando el combustible fino muerto (FFMC) en la interfaz forestal.
                            </p>
                        </div>

                        <div class="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3 font-mono">
                            <div class="font-bold text-slate-200">Simulador de Propagación Rothermel:</div>
                            <div class="grid grid-cols-2 gap-2 text-[11px]">
                                <div class="p-2 rounded bg-black/30 border border-white/5">
                                    <span class="text-slate-500 block">Vel. Llama en Pino:</span>
                                    <span class="text-amber-400 font-bold">18.4 m/min</span>
                                </div>
                                <div class="p-2 rounded bg-black/30 border border-white/5">
                                    <span class="text-slate-500 block">Longitud de Llama:</span>
                                    <span class="text-red-400 font-bold">4.2 metros</span>
                                </div>
                            </div>
                            <div class="text-[11px] text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30">
                                🛡️ Con Faja Cortafuegos de 45m: Atenuación del 92% en avance de frente de fuego.
                            </div>
                        </div>

                        <div class="pt-2 flex items-center justify-between gap-3">
                            <button onclick="closeCerroHotspotModal(); openCerroMapWithTab('tab-windy');" class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black font-mono text-xs shadow-lg transition-all">
                                🔥 Ver Mapa FWI & Cortafuegos
                            </button>
                            <button onclick="closeCerroHotspotModal()" class="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono">
                                Cerrar
                            </button>
                        </div>
                    </div>
                `;
            } else if (id === 'lora') {
                if (badgeEl) badgeEl.innerText = 'OBJ-CUENCA-05 • RED CENTINELA';
                titleEl.innerHTML = '<span>📡</span> Red LoRaWAN & Telemetría de Pozos APR';
                bodyEl.innerHTML = `
                    <div class="space-y-4 text-xs font-mono">
                        <p class="text-slate-300 font-sans leading-relaxed">
                            Monitoreo en tiempo real de los 5 Comités de Agua Potable Rural (APR) de la cuenca baja de Retiro y Parral, integrados con la repetidora LoRaWAN en la cumbre:
                        </p>
                        <div class="overflow-x-auto rounded-xl border border-white/10">
                            <table class="w-full text-[11px] text-left">
                                <thead class="bg-black/60 text-slate-400 border-b border-white/10">
                                    <tr>
                                        <th class="py-2 px-3">Comité APR</th>
                                        <th class="py-2 px-3">Pozo</th>
                                        <th class="py-2 px-3">Familias</th>
                                        <th class="py-2 px-3">Nivel Freático</th>
                                        <th class="py-2 px-3">Estado</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5 bg-black/30">
                                    <tr>
                                        <td class="py-2 px-3 font-bold text-white">Retiro Centro</td>
                                        <td class="py-2 px-3 text-slate-400">68 m</td>
                                        <td class="py-2 px-3 text-sky-400">1.450</td>
                                        <td class="py-2 px-3 text-emerald-400 font-bold">-18.4 m</td>
                                        <td class="py-2 px-3 text-emerald-400">✅ Normal</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 px-3 font-bold text-white">Copihue</td>
                                        <td class="py-2 px-3 text-slate-400">52 m</td>
                                        <td class="py-2 px-3 text-sky-400">680</td>
                                        <td class="py-2 px-3 text-emerald-400 font-bold">-14.2 m</td>
                                        <td class="py-2 px-3 text-emerald-400">✅ Normal</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 px-3 font-bold text-white">Romeral-San Luis</td>
                                        <td class="py-2 px-3 text-slate-400">44 m</td>
                                        <td class="py-2 px-3 text-sky-400">380</td>
                                        <td class="py-2 px-3 text-yellow-400 font-bold">-12.1 m</td>
                                        <td class="py-2 px-3 text-yellow-400">⚠️ Alerta</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 px-3 font-bold text-white">Villaseca</td>
                                        <td class="py-2 px-3 text-slate-400">58 m</td>
                                        <td class="py-2 px-3 text-sky-400">420</td>
                                        <td class="py-2 px-3 text-emerald-400 font-bold">-16.8 m</td>
                                        <td class="py-2 px-3 text-emerald-400">✅ Normal</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 px-3 font-bold text-white">Los Cuarteles</td>
                                        <td class="py-2 px-3 text-slate-400">36 m</td>
                                        <td class="py-2 px-3 text-sky-400">290</td>
                                        <td class="py-2 px-3 text-emerald-400 font-bold">-9.5 m</td>
                                        <td class="py-2 px-3 text-emerald-400">✅ Normal</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="pt-2 flex items-center justify-between gap-3">
                            <button onclick="closeCerroHotspotModal(); openCerroMapWithTab('tab-centinela');" class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black font-mono text-xs shadow-lg transition-all">
                                📡 Ver Sensores en Mapa
                            </button>
                            <button onclick="closeCerroHotspotModal()" class="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono">
                                Cerrar
                            </button>
                        </div>
                    </div>
                `;
            } else if (id === 'obras') {
                if (badgeEl) badgeEl.innerText = 'OBJ-CUENCA-06 • OBRAS PAISAJE';
                titleEl.innerHTML = '<span>🛠️</span> Portafolio de Inversión Paisajística (420M CLP)';
                bodyEl.innerHTML = `
                    <div class="space-y-4 text-xs font-mono">
                        <p class="text-slate-300 font-sans leading-relaxed">
                            Proyectos aprobados para financiamiento conjunto con el Gobierno Regional del Maule y la Asociación de Canalistas:
                        </p>
                        <div class="space-y-2">
                            <div class="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                                <div>
                                    <div class="font-bold text-white font-sans text-sm">1. Tranque Bullileo 2 (Compensación)</div>
                                    <div class="text-[11px] text-slate-400">Retención de 45.000 m³ en pie de monte</div>
                                </div>
                                <div class="text-right">
                                    <span class="text-sky-400 font-bold">$180M CLP</span>
                                    <span class="block text-[10px] text-emerald-400">65% Avance</span>
                                </div>
                            </div>
                            <div class="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                                <div>
                                    <div class="font-bold text-white font-sans text-sm">2. Faja Cortafuegos Borde Cordillera</div>
                                    <div class="text-[11px] text-slate-400">Franja continua de 45m de ancho (28 km)</div>
                                </div>
                                <div class="text-right">
                                    <span class="text-amber-400 font-bold">$95M CLP</span>
                                    <span class="block text-emerald-400">80% Avance</span>
                                </div>
                            </div>
                            <div class="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                                <div>
                                    <div class="font-bold text-white font-sans text-sm">3. Reforestación Ribereña Nativa</div>
                                    <div class="text-[11px] text-slate-400">Quillay, Maytenus y Peumo en bordes fluviales</div>
                                </div>
                                <div class="text-right">
                                    <span class="text-emerald-400 font-bold">$65M CLP</span>
                                    <span class="block text-yellow-400">45% Avance</span>
                                </div>
                            </div>
                            <div class="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                                <div>
                                    <div class="font-bold text-white font-sans text-sm">4. Telemetría Pozos APR LoRaWAN</div>
                                    <div class="text-[11px] text-slate-400">Instalación de 5 sondas hidrostáticas de nivel</div>
                                </div>
                                <div class="text-right">
                                    <span class="text-cyan-400 font-bold">$80M CLP</span>
                                    <span class="block text-emerald-400">90% Avance</span>
                                </div>
                            </div>
                        </div>

                        <!-- ═══════════════════════════════════════════════════════════════════
                             MODELO 3: BLOQUE DIAGRAMA 2.5D DE LADERA & ABANICO ALUVIAL (FIGURA 2)
                             ═══════════════════════════════════════════════════════════════════ -->
                        <div class="p-3.5 rounded-2xl bg-black/70 border border-yellow-500/40 space-y-2">
                            <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
                                <span class="text-xs font-bold text-yellow-300 font-mono flex items-center gap-1.5">
                                    <span>🏔️</span> Bloque Diagrama 2.5D: Remoción en Masa & Cono Aluvial
                                </span>
                                <span class="text-[9.5px] px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 font-mono border border-yellow-500/30">Morfodinámica de Faldeo</span>
                            </div>
                            <p class="text-[11px] text-slate-300 font-sans leading-relaxed">
                                Esquema 2.5D de la ladera precordillerana de Bullileo / Meniel: representa la zona de desprendimiento de detritos (mar de bloques), canal de flujo torrencial y sedimentación en el <b>cono aluvial</b> donde las terrazas Keyline frenan el arrastre hacia las obras de riego.
                            </p>
                            <!-- Gráfico Vectorial SVG Bloque 2.5D -->
                            <div class="rounded-xl overflow-hidden bg-[#0a0f16] border border-yellow-500/20 p-2">
                                <svg viewBox="0 0 540 170" class="w-full h-auto select-none font-mono">
                                    <defs>
                                        <linearGradient id="slopeTop" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stop-color="#475569" stop-opacity="1"/>
                                            <stop offset="60%" stop-color="#334155" stop-opacity="1"/>
                                            <stop offset="100%" stop-color="#1e293b" stop-opacity="1"/>
                                        </linearGradient>
                                        <linearGradient id="slopeFront" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stop-color="#1e293b" stop-opacity="1"/>
                                            <stop offset="100%" stop-color="#0f172a" stop-opacity="1"/>
                                        </linearGradient>
                                    </defs>
                                    <!-- Cara Superior Isométrica del Bloque 2.5D -->
                                    <polygon points="50,45 280,18 490,45 260,75" fill="url(#slopeTop)" stroke="#64748b" stroke-width="1.2"/>
                                    <!-- Cara Frontal Izquierda -->
                                    <polygon points="50,45 260,75 260,145 50,115" fill="url(#slopeFront)" stroke="#475569" stroke-width="1.2"/>
                                    <!-- Cara Frontal Derecha -->
                                    <polygon points="260,75 490,45 490,115 260,145" fill="#131c2e" stroke="#334155" stroke-width="1.2"/>

                                    <!-- Cresta Andina / Zona de Desprendimiento (Mar de bloques) -->
                                    <path d="M 120 36 Q 160 22 220 25 T 320 22" fill="none" stroke="#f87171" stroke-width="2" stroke-dasharray="3,2"/>
                                    <text x="135" y="22" fill="#fca5a5" font-size="8">Escarpe de Desprendimiento (Bloques Andinos)</text>

                                    <!-- Canal de Flujo Torrencial & Aluvión (Garganta) -->
                                    <path d="M 230 25 Q 245 45 260 75" fill="none" stroke="#38bdf8" stroke-width="3.5"/>
                                    <path d="M 230 25 Q 245 45 260 75" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="2,2"/>
                                    <text x="175" y="55" fill="#fef08a" font-size="7.5">Canal Aluvial Encajonado ➔</text>

                                    <!-- Cono Aluvial / Abanico de Deyección en la Base -->
                                    <path d="M 260 75 Q 220 100 180 125 L 340 125 Q 300 100 260 75 Z" fill="rgba(234, 179, 8, 0.25)" stroke="#eab308" stroke-width="1.2"/>
                                    <text x="210" y="112" fill="#fde047" font-size="8.5" font-weight="bold">Abanico / Cono Aluvial</text>
                                    <text x="195" y="122" fill="#cbd5e1" font-size="7.5">Sedimentación de gravas & arenas</text>

                                    <!-- Terrazas Keyline de Retención (Fundo Meniel) -->
                                    <path d="M 170 128 Q 260 115 350 128" fill="none" stroke="#10b981" stroke-width="2.5"/>
                                    <path d="M 160 135 Q 260 122 360 135" fill="none" stroke="#10b981" stroke-width="2.5"/>
                                    <text x="200" y="142" fill="#34d399" font-size="8" font-weight="bold">Terrazas Keyline Amortiguadoras (Freno de Aluvión)</text>

                                    <!-- Río Principal en la Llanura -->
                                    <path d="M 50 113 Q 260 142 490 113" fill="none" stroke="#0ea5e9" stroke-width="3"/>
                                    <text x="390" y="130" fill="#7dd3fc" font-size="8">Río Longaví (Planicie)</text>
                                </svg>
                            </div>
                        </div>

                        <div class="pt-2 flex items-center justify-between gap-3">
                            <button onclick="closeCerroHotspotModal(); openCerroMapWithTab('tab-water');" class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black font-mono text-xs shadow-lg transition-all cursor-pointer">
                                🛠️ Ver Obras en Mapa GIS
                            </button>
                            <button onclick="closeCerroHotspotModal()" class="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono cursor-pointer">
                                Cerrar
                            </button>
                        </div>
                    </div>
                `;
            } else if (id === 'resumen') {
                if (badgeEl) badgeEl.innerText = 'OBJ-CUENCA-00 • RESUMEN PAISAJE';
                titleEl.innerHTML = '<span>📋</span> Tablón Central de Campaña • Cuenca Río Longaví';
                bodyEl.innerHTML = `
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
                            <div class="p-3 rounded-xl bg-black/40 border border-sky-500/30">
                                <span class="text-[10px] text-slate-400 block">Río Longaví</span>
                                <b class="text-sky-300 text-sm">124.5 m³/s</b>
                            </div>
                            <div class="p-3 rounded-xl bg-black/40 border border-emerald-500/30">
                                <span class="text-[10px] text-slate-400 block">Bullileo</span>
                                <b class="text-emerald-300 text-sm">78.5%</b>
                            </div>
                            <div class="p-3 rounded-xl bg-black/40 border border-amber-500/30">
                                <span class="text-[10px] text-slate-400 block">FWI Puelche</span>
                                <b class="text-amber-300 text-sm">24 (Mod.)</b>
                            </div>
                            <div class="p-3 rounded-xl bg-black/40 border border-teal-500/30">
                                <span class="text-[10px] text-slate-400 block">Pozos APR</span>
                                <b class="text-teal-300 text-sm">5 Vivos</b>
                            </div>
                        </div>

                        <div class="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                            <h4 class="font-bold text-xs text-white uppercase tracking-wider font-mono">Consejo Consultivo de Cuenca</h4>
                            <div class="text-xs text-slate-300 space-y-1.5">
                                <div>• <b>Dr. Fernando Albornoz:</b> Caudal matriz en régimen seguro. Retención Keyline en Meniel reduce el pico en 18%.</div>
                                <div>• <b>Dra. Natalia Oyarzún:</b> Humedad relativa en 45%. Monitoreando ráfagas vespertinas del este.</div>
                                <div>• <b>Dr. Marcelo Lagos:</b> Conectividad de corredores biológicos preservada en cota 450m a 800m.</div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
                            <button onclick="closeCerroHotspotModal(); openCerroMap();" class="p-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-slate-950 font-black text-center shadow-lg hover:brightness-110 transition-all cursor-pointer">
                                🗺️ Explorar Gemelo GIS
                            </button>
                            <button onclick="closeCerroHotspotModal(); setCerroSubView('sim');" class="p-3 rounded-xl bg-sky-950/60 border border-sky-400/40 text-sky-200 font-bold text-center hover:bg-sky-900/60 transition-all cursor-pointer">
                                ⚡ Simulador Crecidas
                            </button>
                            <button onclick="closeCerroHotspotModal(); toggleCerroControlDrawer(true);" class="p-3 rounded-xl bg-emerald-950/60 border border-emerald-400/40 text-emerald-200 font-bold text-center hover:bg-emerald-900/60 transition-all cursor-pointer">
                                🛰️ Telemetría Live
                            </button>
                        </div>
                    </div>
                `;
            }

            modal.classList.add('active');
        }

        function closeCerroHotspotModal() {
            const modal = document.getElementById('cerroHotspotModal');
            if (modal) modal.classList.remove('active');
        }

        // ═══════════════════════════════════════════════════════════════════
        // MOMENTO 2: CUENCA MAULE SUR • DIGITAL TWIN & SIMULADOR TÁCTICO
        // ═══════════════════════════════════════════════════════════════════
        
        function setCerroSubView(subviewId) {
            playDiegeticAudio('wood');
            const subdeckNav = document.getElementById('cerroSubdeckNav');
            if (subdeckNav) {
                if (subviewId === 'panorama') {
                    subdeckNav.style.display = 'none';
                } else {
                    subdeckNav.style.display = 'flex';
                }
            }
            const views = ['panorama', 'sim', 'decreto'];
            views.forEach(v => {
                const el = document.getElementById('cerroSubView-' + v);
                const nav = document.getElementById('cerroNav-' + v);
                if (el) {
                    if (v === subviewId) {
                        el.classList.remove('hidden');
                        el.classList.add('block');
                    } else {
                        el.classList.add('hidden');
                        el.classList.remove('block');
                    }
                }
                if (nav) {
                    if (v === subviewId) nav.classList.add('active');
                    else nav.classList.remove('active');
                }
            });

            if (subviewId === 'sim') {
                setTimeout(() => {
                    if (window.basinTwin) {
                        window.basinTwin.drawHydrograph();
                    }
                }, 80);
            } else if (subviewId === 'decreto') {
                setTimeout(() => {
                    generateBasinDecree(window.currentDecreeType || 'DOH_TURNO');
                }, 40);
            } else if (subviewId === 'panorama') {
                setTimeout(() => {
                    if (window.cerroVectorEngine) {
                        window.cerroVectorEngine.resize();
                    }
                }, 60);
            }
        }
        window.setCerroSubView = setCerroSubView;

        // ═══════════════════════════════════════════════════════════════════
        // MOTOR DE ANOTACIONES VECTORIALES Y HERRAMIENTAS 3D DE CUENCA
        // ═══════════════════════════════════════════════════════════════════
        class CerroVectorEngine {
            constructor() {
                this.canvas = document.getElementById('cerroVectorCanvas');
                this.drawLayer = document.getElementById('cerroDrawLayer');
                this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
                this.activeVectors = {
                    floodPoly: true,
                    firePoly: false,
                    floodWave: true,
                    fireWave: false,
                    labels: true
                };
                this.customPolygons = [];
                this.currentDrawingPoly = null;
                this.customLabels = [];
                this.animFrame = null;
                this.animTime = 0;
                this.isDrawing = false;
                this.satelliteLens = 'rgb';
                this.timeEpoch = 'sep';
                this.pixelInspectorActive = false;

                if (this.canvas) {
                    this.resize();
                    window.addEventListener('resize', () => this.resize());
                    this.startAnimation();
                }
                this.initDrawEvents();
                this.updateToolbarButtons();
                this.updateSatelliteUI();
            }

            resize() {
                if (!this.canvas) return;
                const rect = this.canvas.parentElement.getBoundingClientRect();
                this.width = this.canvas.width = rect.width;
                this.height = this.canvas.height = rect.height;
            }

            toggleVector(type) {
                if (this.activeVectors.hasOwnProperty(type)) {
                    this.activeVectors[type] = !this.activeVectors[type];
                }
                this.updateToolbarButtons();
            }

            updateToolbarButtons() {
                const btnFloodPoly = document.getElementById('btnToolPolyFlood');
                const btnFirePoly = document.getElementById('btnToolPolyFire');
                const btnFloodWave = document.getElementById('btnToolVectorFlood');
                const btnFireWave = document.getElementById('btnToolVectorFire');
                const btnLabels = document.getElementById('btnToolLabels');

                if (btnFloodPoly) {
                    btnFloodPoly.className = this.activeVectors.floodPoly 
                        ? 'px-2.5 py-1.5 rounded-xl bg-sky-500/40 text-sky-200 border border-sky-400 font-bold text-[11px] font-mono flex items-center gap-1 shadow-md transition-all cursor-pointer'
                        : 'px-2.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300/70 border border-sky-500/30 text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer';
                }
                if (btnFirePoly) {
                    btnFirePoly.className = this.activeVectors.firePoly 
                        ? 'px-2.5 py-1.5 rounded-xl bg-amber-500/40 text-amber-200 border border-amber-400 font-bold text-[11px] font-mono flex items-center gap-1 shadow-md transition-all cursor-pointer'
                        : 'px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300/70 border border-amber-500/30 text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer';
                }
                if (btnFloodWave) {
                    btnFloodWave.className = this.activeVectors.floodWave 
                        ? 'px-2.5 py-1.5 rounded-xl bg-cyan-500/40 text-cyan-200 border border-cyan-400 font-bold text-[11px] font-mono flex items-center gap-1 shadow-md transition-all cursor-pointer'
                        : 'px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300/70 border border-cyan-500/30 text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer';
                }
                if (btnFireWave) {
                    btnFireWave.className = this.activeVectors.fireWave 
                        ? 'px-2.5 py-1.5 rounded-xl bg-orange-500/40 text-orange-200 border border-orange-400 font-bold text-[11px] font-mono flex items-center gap-1 shadow-md transition-all cursor-pointer'
                        : 'px-2.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-300/70 border border-orange-500/30 text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer';
                }
                if (btnLabels) {
                    btnLabels.className = this.activeVectors.labels 
                        ? 'px-2.5 py-1.5 rounded-xl bg-emerald-500/40 text-emerald-200 border border-emerald-400 font-bold text-[11px] font-mono flex items-center gap-1 shadow-md transition-all cursor-pointer'
                        : 'px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300/70 border border-emerald-500/30 text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer';
                }
            }

            initDrawEvents() {
                if (!this.drawLayer) return;
                this.drawLayer.addEventListener('click', (e) => {
                    const rect = this.drawLayer.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;

                    if (this.pixelInspectorActive) {
                        this.inspectPixelAt(x, y, e.clientX, e.clientY);
                        return;
                    }

                    if (!this.isDrawing) return;
                    if (!this.currentDrawingPoly) {
                        this.currentDrawingPoly = [{x, y}];
                    } else {
                        this.currentDrawingPoly.push({x, y});
                    }
                });

                this.drawLayer.addEventListener('dblclick', (e) => {
                    if (!this.isDrawing) return;
                    if (this.currentDrawingPoly && this.currentDrawingPoly.length >= 3) {
                        const areaHa = Math.round(this.currentDrawingPoly.length * 480 + Math.random() * 200);
                        this.customPolygons.push({
                            points: [...this.currentDrawingPoly],
                            area: areaHa,
                            name: `Polígono Cuenca #${this.customPolygons.length + 1}`
                        });
                    }
                    this.stopDrawing();
                });
            }

            setSatelliteLens(lens) {
                this.satelliteLens = lens;
                this.updateSatelliteUI();
            }

            setTimeEpoch(epoch) {
                this.timeEpoch = epoch;
                this.updateSatelliteUI();
            }

            togglePixelInspector() {
                this.pixelInspectorActive = !this.pixelInspectorActive;
                if (this.drawLayer) {
                    if (this.pixelInspectorActive || this.isDrawing) {
                        this.drawLayer.style.pointerEvents = 'auto';
                        this.drawLayer.style.cursor = 'crosshair';
                    } else {
                        this.drawLayer.style.pointerEvents = 'none';
                    }
                }
                const btn = document.getElementById('btnTogglePixelInspector');
                const lbl = document.getElementById('lblPixelInspector');
                if (btn) {
                    if (this.pixelInspectorActive) {
                        btn.className = 'ml-1 px-2.5 py-1 rounded-lg bg-purple-500 text-white font-mono text-[10px] font-bold transition-all flex items-center gap-1 shadow-lg ring-2 ring-purple-300 active:scale-95 animate-pulse cursor-pointer';
                        if (lbl) lbl.textContent = 'Inspector ON';
                    } else {
                        btn.className = 'ml-1 px-2.5 py-1 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white font-mono text-[10px] font-bold transition-all flex items-center gap-1 shadow cursor-pointer active:scale-95';
                        if (lbl) lbl.textContent = 'Inspector Píxel';
                    }
                }
            }

            updateSatelliteUI() {
                const lenses = ['rgb', 'ndvi', 'nir', 'swir', 'thermal', 'nbr'];
                lenses.forEach(l => {
                    const btn = document.getElementById('btnSatLens' + l.charAt(0).toUpperCase() + l.slice(1));
                    if (btn) {
                        if (this.satelliteLens === l) {
                            if (l === 'ndvi') {
                                btn.className = 'px-3 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg ring-2 ring-emerald-300 cursor-pointer';
                            } else if (l === 'nbr') {
                                btn.className = 'px-3 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg ring-2 ring-red-400 cursor-pointer';
                            } else {
                                btn.className = 'px-3 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow cursor-pointer';
                            }
                        } else {
                            btn.className = 'px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer';
                        }
                    }
                });

                const epochs = ['ene', 'jun', 'sep'];
                epochs.forEach(ep => {
                    const btn = document.getElementById('btnSatEpoch' + ep.charAt(0).toUpperCase() + ep.slice(1));
                    if (btn) {
                        if (this.timeEpoch === ep) {
                            btn.className = (ep === 'ene') 
                                ? 'px-2 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[10px] font-mono transition-all cursor-pointer'
                                : (ep === 'jun')
                                ? 'px-2 py-1 rounded-lg bg-sky-500 text-slate-950 font-bold text-[10px] font-mono transition-all cursor-pointer'
                                : 'px-2 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px] font-mono transition-all cursor-pointer';
                        } else {
                            btn.className = 'px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 text-[10px] font-mono transition-all cursor-pointer';
                        }
                    }
                });
            }

            inspectPixelAt(normX, normY, clientX, clientY) {
                const popup = document.getElementById('cerroPixelInspectorPopup');
                if (!popup) return;

                const lat = (-36.1420 - normY * 0.1840).toFixed(4);
                const lon = (-71.7210 + normX * 0.2850).toFixed(4);
                const latDMS = `36°${Math.floor(Math.abs(lat)%1*60)}'${Math.round(((Math.abs(lat)%1*60)%1)*60)}"S`;
                const lonDMS = `71°${Math.floor(Math.abs(lon)%1*60)}'${Math.round(((Math.abs(lon)%1*60)%1)*60)}"W`;
                const cota = Math.round(280 + (1 - normY) * 980 + Math.sin(normX * 4) * 80);

                let sector = 'Secano Interior • Matorral & Espinal';
                let ndviBase = 0.45, ndwiBase = -0.05, lstBase = 24.5, biomassBase = 2100;

                if (normY > 0.62 && normX > 0.35 && normX < 0.65) {
                    sector = 'Fundo Meniel • Terrazas Keyline & Vega Fluvial';
                    ndviBase = 0.78; ndwiBase = 0.32; lstBase = 21.2; biomassBase = 4820;
                } else if (normX >= 0.25 && normX <= 0.45 && normY > 0.50) {
                    sector = 'Corredor Ribereño Río Longaví • Sauzales y Vegas';
                    ndviBase = 0.84; ndwiBase = 0.52; lstBase = 18.6; biomassBase = 5300;
                } else if (normX > 0.55 && normY < 0.45) {
                    sector = 'Cabecera de Cuenca • Embalse Bullileo & Precordillera';
                    ndviBase = 0.62; ndwiBase = 0.48; lstBase = 17.4; biomassBase = 2800;
                } else if (normX < 0.35 && normY > 0.68) {
                    sector = 'Llanura Agrícola Retiro • Cultivos & Red Pozos APR';
                    ndviBase = 0.69; ndwiBase = 0.14; lstBase = 25.1; biomassBase = 3900;
                } else if (normX > 0.70 && normY > 0.25 && normY < 0.65) {
                    sector = 'Plantación Pino Radiata • Faldeo Puelche';
                    ndviBase = 0.52; ndwiBase = -0.12; lstBase = 32.8; biomassBase = 1800;
                }

                let ndvi = ndviBase;
                let ndwi = ndwiBase;
                let lst = lstBase;
                let biomass = biomassBase;

                if (this.timeEpoch === 'ene') {
                    ndvi = Math.max(0.20, ndviBase - 0.28);
                    ndwi = ndwiBase - 0.25;
                    lst = lstBase + 8.5;
                    biomass = Math.round(biomassBase * 0.45);
                } else if (this.timeEpoch === 'jun') {
                    ndvi = ndviBase - 0.10;
                    ndwi = ndwiBase + 0.30;
                    lst = Math.max(9.0, lstBase - 9.0);
                    biomass = Math.round(biomassBase * 0.75);
                }

                const nbr = (ndvi - Math.abs(ndwi)).toFixed(2);

                const cEl = document.getElementById('pixCoord');
                const sEl = document.getElementById('pixSector');
                const zEl = document.getElementById('pixCota');
                const vEl = document.getElementById('pixNdvi');
                const wEl = document.getElementById('pixNdwi');
                const tEl = document.getElementById('pixLst');
                const bEl = document.getElementById('pixBiomass');

                const dcEl = document.getElementById('drawerPixCoord');
                const dsEl = document.getElementById('drawerPixSector');
                const dzEl = document.getElementById('drawerPixCota');
                const dvEl = document.getElementById('drawerPixNdvi');
                const dwEl = document.getElementById('drawerPixNdwi');
                const dtEl = document.getElementById('drawerPixLst');
                const dbEl = document.getElementById('drawerPixBiomass');

                const coordText = `${latDMS} ${lonDMS}`;
                const cotaText = `${cota} msnm`;
                const ndviText = `${ndvi.toFixed(2)} (${ndvi > 0.6 ? 'Óptimo' : ndvi > 0.4 ? 'Medio' : 'Estrés'})`;
                const ndwiText = `${ndwi > 0 ? '+' : ''}${ndwi.toFixed(2)} (${ndwi > 0.2 ? 'Saturado' : ndwi > 0 ? 'Húmedo' : 'Seco'})`;
                const lstText = `${lst.toFixed(1)} °C`;
                const bioText = `${biomass.toLocaleString()} kg MS/ha`;

                if (cEl) cEl.innerText = coordText;
                if (sEl) sEl.innerText = sector;
                if (zEl) zEl.innerText = cotaText;
                if (vEl) vEl.innerText = ndviText;
                if (wEl) wEl.innerText = ndwiText;
                if (tEl) tEl.innerText = lstText;
                if (bEl) bEl.innerText = bioText;

                if (dcEl) dcEl.innerText = coordText;
                if (dsEl) dsEl.innerText = sector;
                if (dzEl) dzEl.innerText = cotaText;
                if (dvEl) dvEl.innerText = ndviText;
                if (dwEl) dwEl.innerText = ndwiText;
                if (dtEl) dtEl.innerText = lstText;
                if (dbEl) dbEl.innerText = bioText;

                const parentRect = this.canvas.parentElement.getBoundingClientRect();
                const posX = Math.min(parentRect.width - 340, Math.max(16, clientX - parentRect.left - 160));
                const posY = Math.min(parentRect.height - 240, Math.max(70, clientY - parentRect.top - 80));

                popup.style.left = posX + 'px';
                popup.style.top = posY + 'px';
                popup.classList.remove('hidden');

                window.lastInspectedPixel = {
                    coords: `${latDMS} ${lonDMS}`,
                    sector,
                    cota: `${cota} msnm`,
                    ndvi: ndvi.toFixed(2),
                    ndwi: ndwi.toFixed(2),
                    nbr,
                    lst: `${lst.toFixed(1)} °C`,
                    biomass: `${biomass} kg MS/ha`,
                    epoch: this.timeEpoch
                };
            }

            startDrawing() {
                this.isDrawing = true;
                this.currentDrawingPoly = [];
                if (this.drawLayer) {
                    this.drawLayer.style.pointerEvents = 'auto';
                    this.drawLayer.title = 'Haz clic para colocar vértices. Doble clic para cerrar el polígono.';
                }
                const btn = document.getElementById('btnToolPolyDraw');
                if (btn) {
                    btn.classList.add('bg-purple-600', 'text-white', 'animate-pulse');
                    btn.innerHTML = '<span>⏹️</span> Finalizar';
                }
            }

            stopDrawing() {
                this.isDrawing = false;
                this.currentDrawingPoly = null;
                if (this.drawLayer) {
                    this.drawLayer.style.pointerEvents = 'none';
                }
                const btn = document.getElementById('btnToolPolyDraw');
                if (btn) {
                    btn.classList.remove('bg-purple-600', 'text-white', 'animate-pulse');
                    btn.innerHTML = '<span>✏️</span> Trazar';
                }
            }

            clearAll() {
                this.activeVectors = {
                    floodPoly: false,
                    firePoly: false,
                    floodWave: false,
                    fireWave: false,
                    labels: false
                };
                this.customPolygons = [];
                this.customLabels = [];
                this.stopDrawing();
                this.updateToolbarButtons();
            }

            startAnimation() {
                const render = () => {
                    this.animTime += 0.02;
                    this.draw();
                    this.animFrame = requestAnimationFrame(render);
                };
                render();
            }

            draw() {
                if (!this.ctx || !this.width || !this.height) return;
                const ctx = this.ctx;
                const W = this.width;
                const H = this.height;

                ctx.clearRect(0, 0, W, H);

                // 0. Sombreado Espectral de Lentes Satelitales (Sentinel-2 / Landsat 9)
                if (this.satelliteLens !== 'rgb') {
                    ctx.save();
                    if (this.satelliteLens === 'nir') {
                        // Falso Color Infrarrojo (NIR B8 - B4 - B3)
                        const grad = ctx.createLinearGradient(0, H * 0.2, W, H);
                        grad.addColorStop(0, 'rgba(190, 18, 60, 0.26)');
                        grad.addColorStop(0.4, 'rgba(225, 29, 72, 0.34)');
                        grad.addColorStop(0.8, 'rgba(244, 63, 94, 0.38)');
                        grad.addColorStop(1, 'rgba(159, 18, 57, 0.42)');
                        ctx.fillStyle = grad;
                        ctx.fillRect(0, 0, W, H);

                        // Scanlines tenues
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                        ctx.lineWidth = 1;
                        for (let y = 0; y < H; y += 12) {
                            ctx.beginPath();
                            ctx.moveTo(0, y);
                            ctx.lineTo(W, y);
                            ctx.stroke();
                        }

                        // HUD badge en esquina inferior
                        ctx.fillStyle = 'rgba(7, 11, 20, 0.92)';
                        ctx.fillRect(16, H - 38, 480, 24);
                        ctx.strokeStyle = '#f43f5e';
                        ctx.lineWidth = 1.2;
                        ctx.strokeRect(16, H - 38, 480, 24);
                        ctx.fillStyle = '#fda4af';
                        ctx.font = 'bold 10px monospace';
                        ctx.fillText('📡 LENTE NIR B8 (842nm): FALSO COLOR INFRARROJO • VIGOR & TERRAZAS KEYLINE', 24, H - 22);

                    } else if (this.satelliteLens === 'swir') {
                        // SWIR Humedad & Sedimentos (B12 - B8 - B4)
                        const grad = ctx.createLinearGradient(W * 0.5, 0, W * 0.5, H);
                        grad.addColorStop(0, 'rgba(15, 23, 42, 0.35)');
                        grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.32)');
                        grad.addColorStop(1, 'rgba(14, 116, 144, 0.40)');
                        ctx.fillStyle = grad;
                        ctx.fillRect(0, 0, W, H);

                        // HUD badge
                        ctx.fillStyle = 'rgba(7, 11, 20, 0.92)';
                        ctx.fillRect(16, H - 38, 480, 24);
                        ctx.strokeStyle = '#06b6d4';
                        ctx.lineWidth = 1.2;
                        ctx.strokeRect(16, H - 38, 480, 24);
                        ctx.fillStyle = '#67e8f9';
                        ctx.font = 'bold 10px monospace';
                        ctx.fillText('💧 LENTE SWIR B12 (2190nm): HUMEDAD EN SUELO & TRABA DE SEDIMENTOS', 24, H - 22);

                    } else if (this.satelliteLens === 'thermal') {
                        // LST Térmico Landsat 9 TIRS
                        const grad = ctx.createRadialGradient(W * 0.78, H * 0.38, 40, W * 0.5, H * 0.6, W * 0.75);
                        grad.addColorStop(0, 'rgba(239, 68, 68, 0.42)');
                        grad.addColorStop(0.35, 'rgba(245, 158, 11, 0.30)');
                        grad.addColorStop(0.7, 'rgba(16, 185, 129, 0.22)');
                        grad.addColorStop(1, 'rgba(59, 130, 246, 0.35)');
                        ctx.fillStyle = grad;
                        ctx.fillRect(0, 0, W, H);

                        // HUD badge
                        ctx.fillStyle = 'rgba(7, 11, 20, 0.92)';
                        ctx.fillRect(16, H - 38, 480, 24);
                        ctx.strokeStyle = '#ef4444';
                        ctx.lineWidth = 1.2;
                        ctx.strokeRect(16, H - 38, 480, 24);
                        ctx.fillStyle = '#fca5a5';
                        ctx.font = 'bold 10px monospace';
                        ctx.fillText('🌡️ LENTE LANDSAT 9 TIRS B10 (10.8µm): TEMPERATURA DE SUPERFICIE LST (°C)', 24, H - 22);
                    }
                    ctx.restore();
                }

                // 1. Polígono de Inundación Fluvial T=100
                if (this.activeVectors.floodPoly) {
                    const pts = [
                        {x: 0.15 * W, y: 0.88 * H},
                        {x: 0.28 * W, y: 0.72 * H},
                        {x: 0.45 * W, y: 0.62 * H},
                        {x: 0.60 * W, y: 0.52 * H},
                        {x: 0.68 * W, y: 0.54 * H},
                        {x: 0.52 * W, y: 0.69 * H},
                        {x: 0.32 * W, y: 0.82 * H},
                        {x: 0.18 * W, y: 0.94 * H}
                    ];
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(pts[0].x, pts[0].y);
                    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(14, 165, 233, 0.22)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
                    ctx.lineWidth = 2.5;
                    ctx.setLineDash([8, 5]);
                    ctx.stroke();

                    // Etiqueta de la zona de anegamiento
                    ctx.setLineDash([]);
                    ctx.fillStyle = 'rgba(7, 11, 20, 0.85)';
                    ctx.fillRect(0.32 * W, 0.66 * H - 18, 220, 26);
                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
                    ctx.strokeRect(0.32 * W, 0.66 * H - 18, 220, 26);
                    ctx.fillStyle = '#7dd3fc';
                    ctx.font = 'bold 11px monospace';
                    ctx.fillText('🌊 Zona Inundación T=100 • 3.420 ha', 0.32 * W + 8, 0.66 * H - 1);
                    ctx.restore();
                }

                // 2. Polígono de Exclusión Piro-Riesgo Puelche
                if (this.activeVectors.firePoly) {
                    const pts = [
                        {x: 0.62 * W, y: 0.28 * H},
                        {x: 0.88 * W, y: 0.25 * H},
                        {x: 0.95 * W, y: 0.48 * H},
                        {x: 0.78 * W, y: 0.58 * H},
                        {x: 0.65 * W, y: 0.42 * H}
                    ];
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(pts[0].x, pts[0].y);
                    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(245, 158, 11, 0.24)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
                    ctx.lineWidth = 2.5;
                    ctx.setLineDash([6, 4]);
                    ctx.stroke();

                    // Etiqueta
                    ctx.setLineDash([]);
                    ctx.fillStyle = 'rgba(7, 11, 20, 0.85)';
                    ctx.fillRect(0.70 * W, 0.36 * H - 18, 240, 26);
                    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
                    ctx.strokeRect(0.70 * W, 0.36 * H - 18, 240, 26);
                    ctx.fillStyle = '#fde68a';
                    ctx.font = 'bold 11px monospace';
                    ctx.fillText('🔥 Exclusión FWI Puelche • 4.180 ha', 0.70 * W + 8, 0.36 * H - 1);
                    ctx.restore();
                }

                // 3. Flechas Vectoriales Animadas de Onda de Crecida Fluvial
                if (this.activeVectors.floodWave) {
                    const riverPath = [
                        {x: 0.64 * W, y: 0.50 * H},
                        {x: 0.55 * W, y: 0.58 * H},
                        {x: 0.42 * W, y: 0.68 * H},
                        {x: 0.30 * W, y: 0.78 * H},
                        {x: 0.16 * W, y: 0.92 * H}
                    ];

                    ctx.save();
                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(riverPath[0].x, riverPath[0].y);
                    for (let i = 1; i < riverPath.length; i++) ctx.lineTo(riverPath[i].x, riverPath[i].y);
                    ctx.stroke();

                    // Partículas de onda que viajan a lo largo del cauce
                    const numParticles = 6;
                    for (let p = 0; p < numParticles; p++) {
                        const progress = ((this.animTime * 0.4 + p / numParticles) % 1);
                        const idxFloat = progress * (riverPath.length - 1);
                        const idx = Math.floor(idxFloat);
                        const rem = idxFloat - idx;
                        const p1 = riverPath[idx];
                        const p2 = riverPath[Math.min(idx + 1, riverPath.length - 1)];

                        const px = p1.x + (p2.x - p1.x) * rem;
                        const py = p1.y + (p2.y - p1.y) * rem;
                        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

                        // Dibujar cabeza de flecha dinámica
                        ctx.fillStyle = '#38bdf8';
                        ctx.shadowColor = '#0284c7';
                        ctx.shadowBlur = 12;
                        ctx.beginPath();
                        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(px, py);
                        ctx.lineTo(px - 14 * Math.cos(angle - 0.4), py - 14 * Math.sin(angle - 0.4));
                        ctx.lineTo(px - 9 * Math.cos(angle), py - 9 * Math.sin(angle));
                        ctx.lineTo(px - 14 * Math.cos(angle + 0.4), py - 14 * Math.sin(angle + 0.4));
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(125, 211, 252, 0.9)';
                        ctx.fill();
                    }
                    ctx.restore();
                }

                // 4. Flechas Vectoriales de Avance de Fuego Puelche (Este -> Oeste)
                if (this.activeVectors.fireWave) {
                    ctx.save();
                    const waveBases = [
                        {x: 0.92 * W, y: 0.32 * H},
                        {x: 0.88 * W, y: 0.42 * H},
                        {x: 0.84 * W, y: 0.52 * H}
                    ];
                    waveBases.forEach((base, idx) => {
                        const offset = (this.animTime * 60 + idx * 40) % 220;
                        const startX = base.x;
                        const currentX = base.x - offset;
                        const currentY = base.y + Math.sin(this.animTime * 2 + idx) * 12;

                        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
                        ctx.lineWidth = 3;
                        ctx.shadowColor = '#f97316';
                        ctx.shadowBlur = 10;

                        ctx.beginPath();
                        ctx.moveTo(startX, base.y);
                        ctx.lineTo(currentX, currentY);
                        ctx.stroke();

                        // Flecha de fuego
                        ctx.fillStyle = '#f97316';
                        ctx.beginPath();
                        ctx.moveTo(currentX, currentY);
                        ctx.lineTo(currentX + 12, currentY - 6);
                        ctx.lineTo(currentX + 12, currentY + 6);
                        ctx.closePath();
                        ctx.fill();
                    });
                    ctx.restore();
                }

                // 5. Polígonos Dibujados por el Usuario
                if (this.customPolygons.length > 0) {
                    ctx.save();
                    this.customPolygons.forEach((poly) => {
                        ctx.beginPath();
                        ctx.moveTo(poly.points[0].x * W, poly.points[0].y * H);
                        for (let i = 1; i < poly.points.length; i++) {
                            ctx.lineTo(poly.points[i].x * W, poly.points[i].y * H);
                        }
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(168, 85, 247, 0.22)';
                        ctx.fill();
                        ctx.strokeStyle = '#c084fc';
                        ctx.lineWidth = 2.5;
                        ctx.stroke();

                        const midX = poly.points.reduce((acc, p) => acc + p.x, 0) / poly.points.length * W;
                        const midY = poly.points.reduce((acc, p) => acc + p.y, 0) / poly.points.length * H;
                        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
                        ctx.fillRect(midX - 70, midY - 14, 140, 24);
                        ctx.strokeStyle = '#c084fc';
                        ctx.strokeRect(midX - 70, midY - 14, 140, 24);
                        ctx.fillStyle = '#f3e8ff';
                        ctx.font = 'bold 10px monospace';
                        ctx.fillText(`${poly.name} (${poly.area} ha)`, midX - 64, midY + 2);
                    });
                    ctx.restore();
                }

                // Polígono en proceso de trazado
                if (this.isDrawing && this.currentDrawingPoly && this.currentDrawingPoly.length > 0) {
                    ctx.save();
                    ctx.strokeStyle = '#e879f9';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    ctx.moveTo(this.currentDrawingPoly[0].x * W, this.currentDrawingPoly[0].y * H);
                    for (let i = 1; i < this.currentDrawingPoly.length; i++) {
                        ctx.lineTo(this.currentDrawingPoly[i].x * W, this.currentDrawingPoly[i].y * H);
                    }
                    ctx.stroke();
                    this.currentDrawingPoly.forEach(pt => {
                        ctx.fillStyle = '#f43f5e';
                        ctx.beginPath();
                        ctx.arc(pt.x * W, pt.y * H, 5, 0, Math.PI * 2);
                        ctx.fill();
                    });
                    ctx.restore();
                }

                // 6. Etiquetas Territoriales Georreferenciadas
                if (this.activeVectors.labels) {
                    const presetLabels = [
                        {x: 0.38 * W, y: 0.65 * H, text: '🌊 Río Longaví (124.5 m³/s)', color: '#38bdf8'},
                        {x: 0.64 * W, y: 0.34 * H, text: '🏔️ Embalse Bullileo (47.1M m³)', color: '#34d399'},
                        {x: 0.48 * W, y: 0.74 * H, text: '🏡 Fundo Meniel (24.8 ha • Tranque 18.5k m³)', color: '#a7f3d0'},
                        {x: 0.22 * W, y: 0.85 * H, text: '🌾 Llanura Aluvial Retiro (APR Las Rosas)', color: '#fde047'}
                    ];

                    ctx.save();
                    presetLabels.forEach(lbl => {
                        ctx.fillStyle = 'rgba(9, 14, 26, 0.88)';
                        ctx.strokeStyle = lbl.color;
                        ctx.lineWidth = 1.2;
                        const textW = ctx.measureText(lbl.text).width + 20;
                        ctx.fillRect(lbl.x - textW / 2, lbl.y - 12, textW, 22);
                        ctx.strokeRect(lbl.x - textW / 2, lbl.y - 12, textW, 22);
                        ctx.fillStyle = lbl.color;
                        ctx.font = 'bold 11px monospace';
                        ctx.fillText(lbl.text, lbl.x - textW / 2 + 10, lbl.y + 3);

                        ctx.beginPath();
                        ctx.arc(lbl.x, lbl.y + 14, 3, 0, Math.PI * 2);
                        ctx.fill();
                    });

                    this.customLabels.forEach(lbl => {
                        ctx.fillStyle = 'rgba(9, 14, 26, 0.9)';
                        ctx.strokeStyle = '#c084fc';
                        ctx.lineWidth = 1.2;
                        const textW = ctx.measureText(lbl.text).width + 20;
                        ctx.fillRect(lbl.x * W - textW / 2, lbl.y * H - 12, textW, 22);
                        ctx.strokeRect(lbl.x * W - textW / 2, lbl.y * H - 12, textW, 22);
                        ctx.fillStyle = '#e9d5ff';
                        ctx.font = 'bold 11px monospace';
                        ctx.fillText(lbl.text, lbl.x * W - textW / 2 + 10, lbl.y * H + 3);
                    });
                    ctx.restore();
                }
            }
        }

        window.setCerroSatelliteLens = function(lens) {
            if (window.cerroVectorEngine) window.cerroVectorEngine.setSatelliteLens(lens);
        };

        window.setCerroTimeEpoch = function(epoch) {
            if (window.cerroVectorEngine) window.cerroVectorEngine.setTimeEpoch(epoch);
        };

        window.togglePixelInspector = function() {
            if (window.cerroVectorEngine) window.cerroVectorEngine.togglePixelInspector();
        };

        window.exportPixelToCanvaReport = function() {
            if (!window.lastInspectedPixel) return;
            const p = window.lastInspectedPixel;
            switchMasterView('dashboard');
            switchAdminTab('canva');
            setTimeout(() => {
                const canvaArea = document.getElementById('canvaReportPaper');
                if (canvaArea) {
                    const block = document.createElement('div');
                    block.className = 'p-5 rounded-2xl bg-slate-900/85 border border-purple-500/40 space-y-3 mt-4 font-mono shadow-xl';
                    block.innerHTML = `
                        <div class="flex items-center justify-between text-xs text-purple-300 font-bold border-b border-purple-500/20 pb-2">
                            <span class="flex items-center gap-2"><span>🛰️</span> TELEMETRÍA DE PÍXEL SATELITAL (${p.sector.toUpperCase()})</span>
                            <span class="text-[10px] text-slate-400">${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div class="p-2.5 rounded-xl bg-black/50 border border-white/5">
                                <span class="text-[10px] text-slate-400">Coordenadas & Cota:</span>
                                <div class="text-white font-bold text-xs mt-0.5">${p.coords}</div>
                                <div class="text-[10px] text-amber-300 font-mono">${p.cota}</div>
                            </div>
                            <div class="p-2.5 rounded-xl bg-black/50 border border-white/5">
                                <span class="text-[10px] text-slate-400">NDVI & NDWI:</span>
                                <div class="text-emerald-400 font-bold text-sm mt-0.5">NDVI ${p.ndvi}</div>
                                <div class="text-[10px] text-sky-300 font-mono">NDWI ${p.ndwi}</div>
                            </div>
                            <div class="p-2.5 rounded-xl bg-black/50 border border-white/5">
                                <span class="text-[10px] text-slate-400">LST Superficie (L9):</span>
                                <div class="text-yellow-400 font-bold text-sm mt-0.5">${p.lst}</div>
                                <div class="text-[10px] text-slate-400 font-mono">NBR: ${p.nbr}</div>
                            </div>
                            <div class="p-2.5 rounded-xl bg-black/50 border border-white/5">
                                <span class="text-[10px] text-slate-400">Biomasa Forraje:</span>
                                <div class="text-lime-300 font-bold text-sm mt-0.5">${p.biomass}</div>
                                <div class="text-[10px] text-slate-400 font-mono">Época: ${p.epoch.toUpperCase()}</div>
                            </div>
                        </div>
                    `;
                    canvaArea.appendChild(block);
                    block.scrollIntoView({ behavior: 'smooth' });
                }
            }, 120);
        };

        window.transferScriptTableToCanva = function(title, snippetHtml) {
            switchMasterView('dashboard');
            switchAdminTab('canva');
            setTimeout(() => {
                const canvaArea = document.getElementById('canvaReportPaper');
                if (canvaArea) {
                    const block = document.createElement('div');
                    block.className = 'p-5 rounded-2xl bg-slate-900/90 border border-sky-500/40 space-y-3 mt-4 font-mono shadow-2xl';
                    block.innerHTML = `
                        <div class="flex items-center justify-between text-xs text-sky-300 font-bold border-b border-sky-500/30 pb-2">
                            <span class="flex items-center gap-2"><span>📊</span> ${title.toUpperCase()}</span>
                            <span class="text-[10px] text-slate-400">${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="overflow-x-auto">${snippetHtml}</div>
                    `;
                    canvaArea.appendChild(block);
                    block.scrollIntoView({ behavior: 'smooth' });
                }
            }, 120);
        };

        window.toggleCerroToolbar = function() {
            const bar = document.getElementById('cerroToolsExpandedBar');
            const arrow = document.getElementById('cerroToolbarArrow');
            if (!bar) return;
            const isHidden = bar.classList.contains('hidden');
            if (isHidden) {
                bar.classList.remove('hidden');
                bar.classList.add('flex');
                if (arrow) arrow.textContent = '◀';
            } else {
                bar.classList.remove('flex');
                bar.classList.add('hidden');
                if (arrow) arrow.textContent = '▶';
            }
        };

        window.toggleCerroControlDrawer = function(forceState) {
            const drawer = document.getElementById('cerroControlDrawer');
            if (!drawer) return;
            if (typeof forceState === 'boolean') {
                if (forceState) {
                    drawer.classList.remove('hidden');
                    drawer.classList.add('flex');
                } else {
                    drawer.classList.add('hidden');
                    drawer.classList.remove('flex');
                }
                return;
            }
            const isHidden = drawer.classList.contains('hidden');
            if (isHidden) {
                drawer.classList.remove('hidden');
                drawer.classList.add('flex');
            } else {
                drawer.classList.add('hidden');
                drawer.classList.remove('flex');
            }
        };

        window.switchCerroDrawerTab = function(tabName) {
            const tabs = ['satellite', 'telemetry', 'locations'];
            tabs.forEach(t => {
                const pane = document.getElementById('cerroDrawerTab-' + t);
                const btn = document.getElementById('btnCerroDrawerTab-' + t);
                if (pane) {
                    if (t === tabName) {
                        pane.classList.remove('hidden');
                        pane.classList.add('block');
                    } else {
                        pane.classList.add('hidden');
                        pane.classList.remove('block');
                    }
                }
                if (btn) {
                    if (t === tabName) {
                        btn.className = 'flex-1 py-2.5 text-center font-bold font-mono border-b-2 border-sky-400 text-sky-300 bg-sky-500/10 cursor-pointer transition-all flex items-center justify-center gap-1.5';
                    } else {
                        btn.className = 'flex-1 py-2.5 text-center font-medium font-mono text-slate-400 hover:text-slate-200 border-b-2 border-transparent hover:bg-white/5 cursor-pointer transition-all flex items-center justify-center gap-1.5';
                    }
                }
            });
        };

        window.toggleBasinEdgeDrawer = function(forceState) {
            window.toggleCerroControlDrawer(forceState);
            if (forceState !== false) {
                window.switchCerroDrawerTab('locations');
            }
        };

        window.toggleCerroVector = function(type) {
            if (window.cerroVectorEngine) {
                window.cerroVectorEngine.toggleVector(type);
            }
        };

        window.toggleCerroLabels = function() {
            if (window.cerroVectorEngine) {
                window.cerroVectorEngine.toggleVector('labels');
            }
        };

        window.startDrawingCerroPolygon = function() {
            if (window.cerroVectorEngine) {
                if (window.cerroVectorEngine.isDrawing) {
                    window.cerroVectorEngine.stopDrawing();
                } else {
                    window.cerroVectorEngine.startDrawing();
                }
            }
        };

        window.addCustomCerroLabelPrompt = function() {
            const text = prompt('Ingrese texto de la nota o etiqueta territorial:', 'Monitoreo Ribereño Río Longaví');
            if (text && window.cerroVectorEngine) {
                window.cerroVectorEngine.customLabels.push({
                    text: '📍 ' + text,
                    x: 0.5 + (Math.random() - 0.5) * 0.3,
                    y: 0.5 + (Math.random() - 0.5) * 0.3
                });
            }
        };

        window.clearCerroVectors = function() {
            if (window.cerroVectorEngine) {
                window.cerroVectorEngine.clearAll();
            }
        };

        window.exportCerroToCanvaReport = function() {
            switchMasterView('dashboard');
            switchAdminTab('canva');
            setTimeout(() => {
                const canvaArea = document.getElementById('canvaReportPreview');
                if (canvaArea) {
                    canvaArea.innerHTML += `
                        <div class="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/40 space-y-2 mt-4">
                            <div class="flex items-center justify-between text-xs font-mono font-bold text-sky-300">
                                <span>ANÁLISIS TERRITORIAL DE CUENCA (MIRADOR DEL CERRO)</span>
                                <span>${new Date().toLocaleTimeString()}</span>
                            </div>
                            <p class="text-xs text-slate-300">
                                Estado evaluado: Río Longaví 124.5 m³/s • Embalse Bullileo 78.5% • FWI Puelche 24 (Moderado).
                                Rol Fundo Meniel: Retención Keyline 18.500 m³ (-22.4% pico T=50) • Recarga a 5 APRs (42.000 m³/año) • Faja Cortafuego 45m.
                            </p>
                        </div>
                    `;
                }
            }, 100);
        };

        class BasinTwinEngine {
            constructor() {
                this.precip = 25;       // mm
                this.isotherm = 2100;   // msnm
                this.damGate = 25;      // %
                this.wind = 20;         // km/h
                this.rh = 55;           // %
                this.temp = 21;         // °C
                this.keylineActive = true;
                this.hoverHour = null;

                this.aprWells = [
                    { id: 'apr-1', name: 'Retiro Centro', baseDepth: 18.4, families: 1450, flow: '32 L/s' },
                    { id: 'apr-2', name: 'Romeral', baseDepth: 14.2, families: 620, flow: '18 L/s' },
                    { id: 'apr-3', name: 'Mantelfrío', baseDepth: 22.1, families: 380, flow: '12 L/s' },
                    { id: 'apr-4', name: 'Copihue', baseDepth: 16.8, families: 490, flow: '24 L/s' },
                    { id: 'apr-5', name: 'San José', baseDepth: 19.5, families: 280, flow: '15 L/s' }
                ];

                this.initCanvasEvents();
            }

            initCanvasEvents() {
                const canvas = document.getElementById('cerroHydrographCanvas');
                const tooltip = document.getElementById('hydrographTooltip');
                if (!canvas) return;

                canvas.addEventListener('mousemove', (e) => {
                    const rect = canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const padding = { left: 45, right: 25 };
                    const graphW = rect.width - padding.left - padding.right;
                    
                    if (x >= padding.left && x <= rect.width - padding.right) {
                        const ratio = (x - padding.left) / graphW;
                        const hour = Math.min(48, Math.max(0, Math.round(ratio * 48 * 2) / 2));
                        this.hoverHour = hour;
                        this.drawHydrograph();

                        if (tooltip && this.lastHydroData) {
                            const pt = this.lastHydroData.points.find(p => Math.abs(p.t - hour) < 0.3) || this.lastHydroData.points[0];
                            tooltip.style.display = 'block';
                            tooltip.style.left = (e.clientX - rect.left + 15) + 'px';
                            tooltip.style.top = Math.max(10, (e.clientY - rect.top - 50)) + 'px';
                            tooltip.innerHTML = `
                                <div class="font-bold text-sky-300 border-b border-white/10 pb-1">T = ${pt.t.toFixed(1)} hrs</div>
                                <div class="text-sky-400">Onda Natural: <b>${pt.qNat.toFixed(1)} m³/s</b></div>
                                <div class="text-emerald-400">Onda Keyline: <b>${pt.qMit.toFixed(1)} m³/s</b></div>
                                ${this.keylineActive ? `<div class="text-[10px] text-emerald-300">Amortiguado: <b>-${(pt.qNat - pt.qMit).toFixed(1)} m³/s</b></div>` : ''}
                            `;
                        }
                    } else {
                        this.hoverHour = null;
                        if (tooltip) tooltip.style.display = 'none';
                        this.drawHydrograph();
                    }
                });

                canvas.addEventListener('mouseleave', () => {
                    this.hoverHour = null;
                    if (tooltip) tooltip.style.display = 'none';
                    this.drawHydrograph();
                });

                window.addEventListener('resize', () => {
                    this.drawHydrograph();
                });
            }

            calculate() {
                // 1. HIDROLOGÍA CUENCA LONGAVÍ (122.070 ha)
                // Coeficiente de escorrentía C según cota isoterma 0°C (efecto lluvia sobre nieve)
                const cFactor = 0.28 + Math.max(0, Math.min(1, (this.isotherm - 1500) / 2000)) * 0.45;
                const baseFlow = 45 + (this.damGate / 100) * 79.5; // Caudal base regulado Bullileo
                const runoffPeak = (this.precip * 1.55) * cFactor * 1.28;

                const tPeakNat = 6.2;
                const tPeakMit = 8.6;
                const peakNat = baseFlow + runoffPeak;
                const peakMit = this.keylineActive ? (baseFlow + runoffPeak * 0.776) : peakNat;
                
                const points = [];
                let totalDiffM3 = 0;

                for (let h = 0; h <= 48; h += 0.5) {
                    // Distribución gamma / hidrográma sintético
                    const xNat = Math.max(0.001, h / tPeakNat);
                    const qNat = baseFlow + runoffPeak * Math.pow(xNat, 1.85) * Math.exp(1.85 * (1 - xNat));
                    
                    let qMit = qNat;
                    if (this.keylineActive) {
                        const xMit = Math.max(0.001, h / tPeakMit);
                        qMit = baseFlow + (runoffPeak * 0.776) * Math.pow(xMit, 2.05) * Math.exp(2.05 * (1 - xMit));
                        const diff = Math.max(0, qNat - qMit);
                        totalDiffM3 += diff * 1800; // 0.5 hora en segundos = 1800s
                    }
                    points.push({ t: h, qNat, qMit });
                }

                // Volumen infiltrado efectivo en tranques de pie de monte y zanjas Keyline
                const keylineInfilVol = this.keylineActive ? Math.min(45000, Math.max(18500, Math.round(totalDiffM3 * 0.042))) : 0;
                const damVol = Math.min(60.0, Math.max(18.0, 47.1 + (this.precip / 250) * 11.2 - (this.damGate / 100) * 8.4));
                const damPct = ((damVol / 60.0) * 100);

                // 2. PIRO-METEOROLOGÍA ROTHERMEL & FWI PUELCHE
                const tempFactor = (this.temp - 20) * 1.15;
                const rhFactor = (100 - this.rh) * 0.48;
                const windFactor = Math.pow(this.wind / 10, 1.45) * 3.2;
                const fwi = Math.round(Math.min(95, Math.max(5, 12 + tempFactor + rhFactor + windFactor)));

                const flameSpread = ((this.wind * 0.32) * (1 - this.rh / 100) * 1.75).toFixed(1);
                const flameLen = (0.0775 * Math.pow(parseFloat(flameSpread) * 12, 0.46)).toFixed(1);

                return {
                    points,
                    peakNat,
                    peakMit,
                    evacuationBuffer: this.keylineActive ? 2.4 : 0.0,
                    keylineInfilVol,
                    damVol,
                    damPct,
                    fwi,
                    flameSpread,
                    flameLen
                };
            }

            updateUI() {
                const data = this.calculate();
                this.lastHydroData = data;

                // 1. Gauges
                const qPeakEl = document.getElementById('simGaugeQPeak');
                const qMitEl = document.getElementById('simGaugeQMitigado');
                const bufferEl = document.getElementById('simBufferEvacuation');
                const riverBadge = document.getElementById('simBadgeRiverStatus');

                if (qPeakEl) qPeakEl.innerText = data.peakNat.toFixed(1);
                if (qMitEl) qMitEl.innerText = data.peakMit.toFixed(1) + ' m³/s';
                if (bufferEl) bufferEl.innerText = '+' + data.evacuationBuffer.toFixed(1) + ' h margen';

                if (riverBadge) {
                    if (data.peakNat > 345) {
                        riverBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse';
                        riverBadge.innerText = '🚨 ALERTA ROJA (Desborde)';
                    } else if (data.peakNat > 240) {
                        riverBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40';
                        riverBadge.innerText = '⚠️ Alerta Amarilla';
                    } else {
                        riverBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
                        riverBadge.innerText = 'Normal';
                    }
                }

                // Embalse Bullileo
                const damVolEl = document.getElementById('simGaugeDamVol');
                const damPctEl = document.getElementById('simGaugeDamPct');
                const damOutflowEl = document.getElementById('simGaugeDamOutflow');
                const damSpillBadge = document.getElementById('simBadgeDamSpill');

                if (damVolEl) damVolEl.innerText = data.damVol.toFixed(1);
                if (damPctEl) damPctEl.innerText = data.damPct.toFixed(1) + '% Llenado';
                if (damOutflowEl) damOutflowEl.innerText = (12.0 + (this.damGate / 100) * 68.0).toFixed(1) + ' m³/s erogado';

                if (damSpillBadge) {
                    if (data.damPct >= 96) {
                        damSpillBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse';
                        damSpillBadge.innerText = 'Aliviadero Activo';
                    } else if (data.damPct >= 88) {
                        damSpillBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40';
                        damSpillBadge.innerText = 'Precaución';
                    } else {
                        damSpillBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
                        damSpillBadge.innerText = 'Cota Segura';
                    }
                }

                // Piro-Riesgo
                const fwiEl = document.getElementById('simGaugeFWI');
                const fwiBadge = document.getElementById('simBadgeFWI');
                const spreadEl = document.getElementById('simGaugeFlameSpread');
                const flameEl = document.getElementById('simGaugeFlameLen');

                if (fwiEl) fwiEl.innerText = data.fwi;
                if (spreadEl) spreadEl.innerText = data.flameSpread + ' m/min';
                if (flameEl) flameEl.innerText = data.flameLen + ' m';

                if (fwiBadge) {
                    if (data.fwi >= 45) {
                        fwiBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse';
                        fwiBadge.innerText = 'Extremo';
                    } else if (data.fwi >= 30) {
                        fwiBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40';
                        fwiBadge.innerText = 'Alto';
                    } else {
                        fwiBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
                        fwiBadge.innerText = 'Moderado';
                    }
                }

                // Keyline
                const infilEl = document.getElementById('simGaugeKeylineInfil');
                const redPctEl = document.getElementById('simGaugeKeylineRedPct');
                const sedEl = document.getElementById('simGaugeKeylineSed');
                const keylineStatusText = document.getElementById('simStatusKeylineText');

                if (infilEl) infilEl.innerText = data.keylineInfilVol.toLocaleString('es-CL');
                if (redPctEl) redPctEl.innerText = this.keylineActive ? '-22.4% Pico' : '0.0% (Inactivo)';
                if (sedEl) sedEl.innerText = this.keylineActive ? Math.round(45 + this.precip * 3.8) + ' ton retenidas' : '0 ton (Sedimento libre)';

                if (keylineStatusText) {
                    if (this.keylineActive) {
                        keylineStatusText.className = 'text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/30';
                        keylineStatusText.innerHTML = '🛡️ Amortiguación Activa (-22.4% Pico)';
                    } else {
                        keylineStatusText.className = 'text-xs font-mono text-slate-400 font-bold bg-slate-900 px-3 py-1 rounded-lg border border-white/10';
                        keylineStatusText.innerHTML = '⚠️ Keyline Inactivo (Sin Mitigación)';
                    }
                }

                // Tickers en Header
                const tickerQ = document.getElementById('cerroTickerQ');
                const tickerEmbalse = document.getElementById('cerroTickerEmbalse');
                const tickerFWI = document.getElementById('cerroTickerFWI');

                if (tickerQ) tickerQ.innerText = data.peakNat.toFixed(1) + ' m³/s';
                if (tickerEmbalse) tickerEmbalse.innerText = data.damPct.toFixed(1) + '% (' + data.damVol.toFixed(1) + 'M m³)';
                if (tickerFWI) tickerFWI.innerText = data.fwi + (data.fwi >= 45 ? ' (Extremo)' : data.fwi >= 30 ? ' (Alto)' : ' (Moderado)');

                // 2. Render APR Wells
                this.renderAprWells(data);

                // 3. Render Predios Table
                this.renderPrediosTable(data);

                // 4. Actualizar Directivas Reactivas de los 3 Asesores de Cuenca
                const qAlbornoz = document.getElementById('advisorQuoteAlbornoz');
                const qOyarzun = document.getElementById('advisorQuoteOyarzun');
                const qLagos = document.getElementById('advisorQuoteLagos');

                if (qAlbornoz) {
                    if (data.peakNat > 340) {
                        qAlbornoz.innerHTML = `⚠️ <b>ALERTA ROJA HIDRÁULICA:</b> Caudal estimado ${data.peakNat.toFixed(1)} m³/s. El Río Longaví superará terrazas bajas. Compuertas Bullileo al 55% para retener 12.8M m³.`;
                    } else if (this.precip === 0 && data.damPct < 60) {
                        qAlbornoz.innerHTML = `🏜️ <b>ESTRÉS HÍDRICO CRÍTICO:</b> Embalse Bullileo en ${data.damPct.toFixed(1)}%. Caudal base mínimo ${data.peakNat.toFixed(1)} m³/s. Turno estricto DGA de distribución.`;
                    } else {
                        qAlbornoz.innerHTML = `💧 <b>RÉGIMEN EQUILIBRADO:</b> Caudal base ${data.peakNat.toFixed(1)} m³/s. Embalse Bullileo con ${data.damPct.toFixed(1)}% de capacidad. Aforo en canales dentro de tolerancia.`;
                    }
                }

                if (qOyarzun) {
                    if (data.fwi >= 45) {
                        qOyarzun.innerHTML = `🌪️ <b>PIRO-ALERTA PUELCHE:</b> FWI ${data.fwi} (Extremo). Viento ${this.wind} km/h con HR ${this.rh}%. Regla 30-30-30 activada. Foco de avance a ${data.flameSpread} m/min.`;
                    } else if (this.temp < 5) {
                        qOyarzun.innerHTML = `❄️ <b>INVERSIÓN TÉRMICA SEVERA:</b> Mínima estimada ${this.temp}°C con cielo despejado. Drenaje catabático hacia fondos de quebrada. Riesgo de helada negra en brotes.`;
                    } else {
                        qOyarzun.innerHTML = `☀️ <b>ATMÓSFERA ESTABLE:</b> Viento ${this.wind} km/h, HR ${this.rh}%, Temp ${this.temp}°C. FWI ${data.fwi} (Bajo/Moderado). Sin gradiente Foehn.`;
                    }
                }

                if (qLagos) {
                    if (data.peakNat > 340) {
                        qLagos.innerHTML = `🌊 <b>ZONIFICACIÓN DE PELIGRO:</b> Corredor ripario actuando como disipador hidrodinámico. Evacuación inmediata de ganado en terrazas fluviales. Keyline retiene ${data.keylineInfilVol.toLocaleString('es-CL')} m³.`;
                    } else if (this.keylineActive) {
                        qLagos.innerHTML = `🌿 <b>RESILIENCIA ACTIVA:</b> Amortiguación Keyline aplanando la onda de crecida en 22.4%. ${data.keylineInfilVol.toLocaleString('es-CL')} m³ infiltrados para recarga del acuífero APR.`;
                    } else {
                        qLagos.innerHTML = `⚠️ <b>RIESGO POR SUELO DESNUDO:</b> Keyline desactivado. Toda la precipitación escurre superficialmente sin retención edáfica ni recarga en pozos de agua potable.`;
                    }
                }

                // 5. Draw Canvas Hydrograph
                this.drawHydrograph();
            }

            renderAprWells(data) {
                const container = document.getElementById('simAprWellsContainer');
                if (!container) return;

                // Dinámica de napa: precipitación y Keyline recargan, calor y viento abaten
                const rechargeBonus = (this.precip * 0.012) + (this.keylineActive ? 0.8 : -0.4);
                const droughtPenalty = (this.temp > 28 ? (this.temp - 28) * 0.15 : 0) + (this.precip === 0 ? 0.6 : 0);
                const deltaNapa = rechargeBonus - droughtPenalty;

                container.innerHTML = this.aprWells.map(w => {
                    const currentDepth = Math.max(5.0, (w.baseDepth - deltaNapa)).toFixed(1);
                    const healthPct = Math.min(100, Math.max(15, Math.round((1 - (currentDepth / 35)) * 100)));
                    let statusLabel = '✅ Estable';
                    let barColor = 'bg-emerald-400';

                    if (currentDepth > 24) {
                        statusLabel = '🚨 Abatimiento Crítico';
                        barColor = 'bg-red-500';
                    } else if (currentDepth > 20) {
                        statusLabel = '⚠️ Precaución';
                        barColor = 'bg-amber-400';
                    }

                    return `
                        <div class="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 hover:border-sky-500/30 transition-all">
                            <div class="flex items-center justify-between">
                                <span class="font-bold text-white">${w.name}</span>
                                <span class="text-[10px] text-slate-400">${w.families} Familias • ${w.flow}</span>
                                <span class="text-[10px] font-bold ${currentDepth > 24 ? 'text-red-400' : currentDepth > 20 ? 'text-amber-400' : 'text-emerald-400'}">${statusLabel}</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
                                    <div class="${barColor} h-full rounded-full transition-all duration-500" style="width: ${healthPct}%"></div>
                                </div>
                                <span class="text-xs text-sky-300 font-bold shrink-0">-${currentDepth} m</span>
                            </div>
                        </div>
                    `;
                }).join('');

                const aprStatusEl = document.getElementById('simAprGeneralStatus');
                if (aprStatusEl) {
                    if (deltaNapa > 0.5) {
                        aprStatusEl.className = 'text-emerald-400 font-bold';
                        aprStatusEl.innerText = '🛡️ Recarga de Acuífero Favorable (+0.8m napa freática)';
                    } else if (deltaNapa < -0.8) {
                        aprStatusEl.className = 'text-red-400 font-bold';
                        aprStatusEl.innerText = '⚠️ Abatimiento Severo por Déficit Hídrico Estival';
                    } else {
                        aprStatusEl.className = 'text-sky-300 font-bold';
                        aprStatusEl.innerText = 'Balance Dinámico Neutro';
                    }
                }
            }

            renderPrediosTable(data) {
                const tbody = document.getElementById('simPrediosTableBody');
                if (!tbody) return;

                tbody.innerHTML = geojsonPredios.features.map(f => {
                    const p = f.properties;
                    const isNearRiver = ['MENIEL', 'SAN_JOSE', 'RETIRO_PONIENTE'].includes(p.id);
                    const isNearForest = ['BELLAVISTA', 'EL_ROBLE', 'LOS_MAITENES'].includes(p.id);

                    let floodRisk = 'Bajo (0 ha)';
                    let floodClass = 'text-emerald-400';
                    if (data.peakNat > 345 && isNearRiver) {
                        floodRisk = 'Desborde Severo (4.5 ha)';
                        floodClass = 'text-red-400 font-bold';
                    } else if (data.peakNat > 240 && isNearRiver) {
                        floodRisk = 'Crecida Menor (1.2 ha)';
                        floodClass = 'text-amber-400';
                    }

                    let fireRisk = 'Bajo (FWI < 25)';
                    let fireClass = 'text-emerald-400';
                    if (data.fwi >= 45 && isNearForest) {
                        fireRisk = 'Crítico (Borde Cordillera)';
                        fireClass = 'text-red-400 font-bold animate-pulse';
                    } else if (data.fwi >= 30) {
                        fireRisk = 'Alerta Amarilla';
                        fireClass = 'text-amber-400';
                    }

                    const waterBalance = (((p.water_L_s || p.water_rights_ls || 35.0)) * (data.damPct / 100)).toFixed(1) + ' L/s';

                    return `
                        <tr class="hover:bg-sky-950/20 cursor-pointer transition-colors" onclick="openNeighborDrawer('${p.id}')">
                            <td class="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                                <span class="text-xs">${p.id === 'MENIEL' ? '🏡' : '🌾'}</span>
                                ${p.name}
                            </td>
                            <td class="py-2.5 px-3 text-slate-300">${p.crop}</td>
                            <td class="py-2.5 px-3 ${floodClass}">${floodRisk}</td>
                            <td class="py-2.5 px-3 ${fireClass}">${fireRisk}</td>
                            <td class="py-2.5 px-3 text-sky-400 font-bold">${waterBalance}</td>
                        </tr>
                    `;
                }).join('');
            }

            drawHydrograph() {
                const canvas = document.getElementById('cerroHydrographCanvas');
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.getBoundingClientRect();

                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);

                const width = rect.width;
                const height = rect.height;

                const pad = { top: 25, right: 25, bottom: 40, left: 55 };
                const graphW = width - pad.left - pad.right;
                const graphH = height - pad.top - pad.bottom;

                // Fondo
                ctx.fillStyle = '#020612';
                ctx.fillRect(0, 0, width, height);

                const maxQ = Math.max(550, Math.ceil(this.lastHydroData ? this.lastHydroData.peakNat * 1.15 : 520));
                const minQ = 0;

                const getX = (t) => pad.left + (t / 48) * graphW;
                const getY = (q) => pad.top + graphH - ((q - minQ) / (maxQ - minQ)) * graphH;

                // 1. Grid horizontal & Ticks
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
                ctx.lineWidth = 1;
                ctx.font = '10px JetBrains Mono, monospace';
                ctx.fillStyle = '#64748b';

                const qSteps = [0, 100, 200, 300, 400, 500];
                qSteps.forEach(q => {
                    if (q <= maxQ) {
                        const y = getY(q);
                        ctx.beginPath();
                        ctx.moveTo(pad.left, y);
                        ctx.lineTo(width - pad.right, y);
                        ctx.stroke();
                        ctx.fillText(q + ' m³/s', 8, y + 3);
                    }
                });

                // Grid vertical & Ticks
                for (let t = 0; t <= 48; t += 6) {
                    const x = getX(t);
                    ctx.beginPath();
                    ctx.moveTo(x, pad.top);
                    ctx.lineTo(x, pad.top + graphH);
                    ctx.stroke();
                    ctx.fillText('T+' + t + 'h', x - 12, height - 15);
                }

                // 2. Umbrales de Peligro
                // T=50 Desborde (345 m³/s)
                const yT50 = getY(345);
                if (yT50 >= pad.top && yT50 <= pad.top + graphH) {
                    ctx.save();
                    ctx.setLineDash([4, 4]);
                    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(pad.left, yT50);
                    ctx.lineTo(width - pad.right, yT50);
                    ctx.stroke();
                    ctx.fillStyle = '#ef4444';
                    ctx.fillText('Umbral Desborde T=50 (345 m³/s)', width - pad.right - 180, yT50 - 5);
                    ctx.restore();
                }

                // Banco Lleno (180 m³/s)
                const yBankfull = getY(180);
                if (yBankfull >= pad.top && yBankfull <= pad.top + graphH) {
                    ctx.save();
                    ctx.setLineDash([3, 3]);
                    ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(pad.left, yBankfull);
                    ctx.lineTo(width - pad.right, yBankfull);
                    ctx.stroke();
                    ctx.fillStyle = '#eab308';
                    ctx.fillText('Capacidad Cauce Natural (180 m³/s)', pad.left + 10, yBankfull - 4);
                    ctx.restore();
                }

                if (!this.lastHydroData) return;
                const points = this.lastHydroData.points;

                // 3. Área Infiltrada / Amortiguada (Polígono entre Curva Nat y Curva Mit)
                if (this.keylineActive) {
                    ctx.save();
                    ctx.beginPath();
                    points.forEach((p, idx) => {
                        const x = getX(p.t);
                        const y = getY(p.qNat);
                        if (idx === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    });
                    for (let i = points.length - 1; i >= 0; i--) {
                        const x = getX(points[i].t);
                        const y = getY(points[i].qMit);
                        ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + graphH);
                    grad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
                    grad.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
                    ctx.fillStyle = grad;
                    ctx.fill();
                    ctx.restore();
                }

                // 4. Trazo Onda Natural Sin Mitigar (Azul Neón)
                ctx.save();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                points.forEach((p, idx) => {
                    const x = getX(p.t);
                    const y = getY(p.qNat);
                    if (idx === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
                ctx.restore();

                // 5. Trazo Onda Mitigada Keyline (Verde Esmeralda)
                if (this.keylineActive) {
                    ctx.save();
                    ctx.strokeStyle = '#10b981';
                    ctx.lineWidth = 2.5;
                    ctx.setLineDash([6, 3]);
                    ctx.shadowColor = '#10b981';
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    points.forEach((p, idx) => {
                        const x = getX(p.t);
                        const y = getY(p.qMit);
                        if (idx === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    });
                    ctx.stroke();
                    ctx.restore();

                    // Marcador de Pico Mitigado
                    const peakPtMit = points.reduce((prev, curr) => (curr.qMit > prev.qMit ? curr : prev), points[0]);
                    const px = getX(peakPtMit.t);
                    const py = getY(peakPtMit.qMit);
                    ctx.fillStyle = '#10b981';
                    ctx.beginPath();
                    ctx.arc(px, py, 4, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Marcador de Pico Natural
                const peakPtNat = points.reduce((prev, curr) => (curr.qNat > prev.qNat ? curr : prev), points[0]);
                const nx = getX(peakPtNat.t);
                const ny = getY(peakPtNat.qNat);
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(nx, ny, 4, 0, Math.PI * 2);
                ctx.fill();

                // 6. Crosshair si el usuario está sobre el canvas
                if (this.hoverHour !== null) {
                    const hx = getX(this.hoverHour);
                    ctx.save();
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([2, 2]);
                    ctx.beginPath();
                    ctx.moveTo(hx, pad.top);
                    ctx.lineTo(hx, pad.top + graphH);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }

        // Funciones auxiliares llamadas por la UI
        function updateBasinSimFromSliders() {
            if (!window.basinTwin) window.basinTwin = new BasinTwinEngine();

            const pEl = document.getElementById('simSlidePrecip');
            const iEl = document.getElementById('simSlideIsotherm');
            const dEl = document.getElementById('simSlideDamGate');
            const wEl = document.getElementById('simSlideWind');
            const rhEl = document.getElementById('simSlideRH');
            const tEl = document.getElementById('simSlideTemp');
            const kEl = document.getElementById('simCheckKeyline');

            if (pEl) window.basinTwin.precip = parseFloat(pEl.value);
            if (iEl) window.basinTwin.isotherm = parseFloat(iEl.value);
            if (dEl) window.basinTwin.damGate = parseFloat(dEl.value);
            if (wEl) window.basinTwin.wind = parseFloat(wEl.value);
            if (rhEl) window.basinTwin.rh = parseFloat(rhEl.value);
            if (tEl) window.basinTwin.temp = parseFloat(tEl.value);
            if (kEl) window.basinTwin.keylineActive = kEl.checked;

            // Etiquetas numéricas de los sliders
            const lblP = document.getElementById('sliderValPrecip');
            const lblI = document.getElementById('sliderValIsotherm');
            const lblD = document.getElementById('sliderValDamGate');
            const lblW = document.getElementById('sliderValWind');
            const lblRH = document.getElementById('sliderValRH');
            const lblT = document.getElementById('sliderValTemp');

            if (lblP) lblP.innerText = window.basinTwin.precip + ' mm';
            if (lblI) lblI.innerText = window.basinTwin.isotherm.toLocaleString('es-CL') + ' m';
            if (lblD) lblD.innerText = window.basinTwin.damGate + '%';
            if (lblW) lblW.innerText = window.basinTwin.wind + ' km/h';
            if (lblRH) lblRH.innerText = window.basinTwin.rh + '%';
            if (lblT) lblT.innerText = window.basinTwin.temp + ' °C';

            window.basinTwin.updateUI();
        }

        function simulateBasinPreset(presetName) {
            playDiegeticAudio('wood');
            if (!window.basinTwin) window.basinTwin = new BasinTwinEngine();

            const pEl = document.getElementById('simSlidePrecip');
            const iEl = document.getElementById('simSlideIsotherm');
            const dEl = document.getElementById('simSlideDamGate');
            const wEl = document.getElementById('simSlideWind');
            const rhEl = document.getElementById('simSlideRH');
            const tEl = document.getElementById('simSlideTemp');
            const kEl = document.getElementById('simCheckKeyline');

            if (presetName === 'storm_t100' || presetName === 'storm_t50') {
                if (pEl) pEl.value = presetName === 'storm_t100' ? 240 : 180;
                if (iEl) iEl.value = 3400;
                if (dEl) dEl.value = 55;
                if (wEl) wEl.value = 46;
                if (rhEl) rhEl.value = 96;
                if (tEl) tEl.value = 16;
                if (kEl) kEl.checked = true;
            } else if (presetName === 'storm_t10') {
                if (pEl) pEl.value = 65;
                if (iEl) iEl.value = 1800;
                if (dEl) dEl.value = 25;
                if (wEl) wEl.value = 28;
                if (rhEl) rhEl.value = 92;
                if (tEl) tEl.value = 11;
                if (kEl) kEl.checked = true;
            } else if (presetName === 'puelche_fire' || presetName === 'compound_extreme') {
                if (pEl) pEl.value = 0;
                if (iEl) iEl.value = 3600;
                if (dEl) dEl.value = 15;
                if (wEl) wEl.value = 64;
                if (rhEl) rhEl.value = 12;
                if (tEl) tEl.value = 38;
                if (kEl) kEl.checked = true;
            } else if (presetName === 'heatwave') {
                if (pEl) pEl.value = 0;
                if (iEl) iEl.value = 3500;
                if (dEl) dEl.value = 20;
                if (wEl) wEl.value = 14;
                if (rhEl) rhEl.value = 22;
                if (tEl) tEl.value = 37;
                if (kEl) kEl.checked = true;
            } else if (presetName === 'drought') {
                if (pEl) pEl.value = 0;
                if (iEl) iEl.value = 3200;
                if (dEl) dEl.value = 10;
                if (wEl) wEl.value = 15;
                if (rhEl) rhEl.value = 25;
                if (tEl) tEl.value = 31;
                if (kEl) kEl.checked = true;
            } else if (presetName === 'winter_dry') {
                if (pEl) pEl.value = 0;
                if (iEl) iEl.value = 1400;
                if (dEl) dEl.value = 18;
                if (wEl) wEl.value = 8;
                if (rhEl) rhEl.value = 82;
                if (tEl) tEl.value = 3;
                if (kEl) kEl.checked = true;
            } else if (presetName === 'summer_normal') {
                if (pEl) pEl.value = 0;
                if (iEl) iEl.value = 3000;
                if (dEl) dEl.value = 28;
                if (wEl) wEl.value = 18;
                if (rhEl) rhEl.value = 38;
                if (tEl) tEl.value = 28;
                if (kEl) kEl.checked = true;
            } else if (presetName === 'keyline_opt') {
                if (pEl) pEl.value = 85;
                if (iEl) iEl.value = 2200;
                if (dEl) dEl.value = 30;
                if (wEl) wEl.value = 25;
                if (rhEl) rhEl.value = 65;
                if (tEl) tEl.value = 19;
                if (kEl) kEl.checked = true;
            } else if (presetName === 'normal') {
                if (pEl) pEl.value = 25;
                if (iEl) iEl.value = 2100;
                if (dEl) dEl.value = 25;
                if (wEl) wEl.value = 20;
                if (rhEl) rhEl.value = 55;
                if (tEl) tEl.value = 21;
                if (kEl) kEl.checked = true;
            }

            updateBasinSimFromSliders();
        }

        function simulateFloodScenario(returnPeriod) {
            if (!window.basinTwin) window.basinTwin = new BasinTwinEngine();
            const feedback = document.getElementById('floodScenarioFeedback');

            if (returnPeriod === 10) {
                simulateBasinPreset('normal');
                if (feedback) feedback.innerHTML = '🌊 <b>T = 10 Años:</b> Caudal pico 180 m³/s. Inundación confinada al lecho menor del Río Longaví. <b>Afectación agrícola: 0 ha.</b> <a href="javascript:void(0)" onclick="setCerroSubView(\'sim\')" class="text-sky-400 underline font-bold ml-2">Ver en Simulador →</a>';
            } else if (returnPeriod === 50) {
                simulateBasinPreset('storm_t50');
                if (feedback) feedback.innerHTML = '🌊 <b>T = 50 Años:</b> Caudal pico 345 m³/s. Desborde en zonas bajas de Retiro. <b>Tranque Keyline amortigua 18.500 m³ (-22.4% del pico).</b> <a href="javascript:void(0)" onclick="setCerroSubView(\'sim\')" class="text-sky-400 underline font-bold ml-2">Ver en Simulador →</a>';
            } else if (returnPeriod === 100) {
                if (!window.basinTwin) window.basinTwin = new BasinTwinEngine();
                const pEl = document.getElementById('simSlidePrecip');
                const iEl = document.getElementById('simSlideIsotherm');
                if (pEl) pEl.value = 240;
                if (iEl) iEl.value = 3500;
                updateBasinSimFromSliders();
                if (feedback) feedback.innerHTML = '🌊 <b>T = 100 Años:</b> Caudal pico 520 m³/s. Inundación severa en terrazas aluviales. <b>Alerta máxima APR y evacuación preventiva recomendada.</b> <a href="javascript:void(0)" onclick="setCerroSubView(\'sim\')" class="text-sky-400 underline font-bold ml-2">Ver en Simulador →</a>';
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // GENERADOR DE EXPEDIENTES INSTITUCIONALES & DECRETOS B2B
        // ═══════════════════════════════════════════════════════════════════
        function generateBasinDecree(decreeType) {
            playDiegeticAudio('wood');
            window.currentDecreeType = decreeType;

            // Actualizar botones de tipo
            document.querySelectorAll('.decree-type-btn').forEach(b => {
                b.classList.remove('border-sky-500/40', 'border-red-500/40', 'border-amber-500/40', 'border-emerald-500/40', 'ring-2', 'ring-sky-400');
            });
            const activeBtn = document.getElementById('btnDecreeType-' + decreeType);
            if (activeBtn) activeBtn.classList.add('ring-2', 'ring-sky-400');

            if (!window.basinTwin) window.basinTwin = new BasinTwinEngine();
            const data = window.basinTwin.calculate();

            const headerEl = document.getElementById('decreeTitleHeader');
            const folioEl = document.getElementById('decreeFolio');
            const bodyEl = document.getElementById('decreeBodyContent');
            if (!headerEl || !bodyEl) return;

            const now = new Date();
            const dateStr = now.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
            document.getElementById('decreeDate').innerText = dateStr;

            if (decreeType === 'DOH_TURNO') {
                headerEl.innerText = 'RESOLUCIÓN EXENTA DOH-MAULE N° 0482/2026';
                folioEl.innerText = 'DOH-R-LONGAVI-' + now.getFullYear() + '-09';
                bodyEl.innerHTML = `
                    <div class="space-y-4">
                        <p class="font-bold text-sky-300">
                            VISTOS Y CONSIDERANDO:
                        </p>
                        <p>
                            1. Las atribuciones conferidas en el <b>Artículo 314 del Código de Aguas de Chile</b> y las facultades del Director General de Obras Hidráulicas;
                        </p>
                        <p>
                            2. El informe telemétrico de la estación hidrológica DGA Quilaimo y la cota actual del <b>Embalse Bullileo</b> (${data.damVol.toFixed(1)} M m³, equivalente al <b>${data.damPct.toFixed(1)}%</b> de su capacidad útil);
                        </p>
                        <p>
                            3. El monitoreo de escorrentía del Río Longaví modelado por el <b>Digital Twin Cuenca Maule Sur</b>, registrando un caudal regulado de <b>${data.peakMit.toFixed(1)} m³/s</b>;
                        </p>
                        
                        <div class="p-4 rounded-2xl bg-black/50 border border-sky-500/30 font-mono text-xs space-y-2">
                            <div class="text-sky-300 font-bold uppercase tracking-wider">RESUELVO (RÉGIMEN OPERACIONAL DE ENTREGA):</div>
                            <div>• <b>Tasa de Entrega Canales Matrices:</b> Se fija en <b>0.82 L/s por acción</b> para los canales de la margen derecha e izquierda de Retiro.</div>
                            <div>• <b>Compuerta de Fondo Embalse Bullileo:</b> Apertura máxima fijada en <b>${window.basinTwin.damGate}%</b> (${(12.0 + (window.basinTwin.damGate / 100) * 68.0).toFixed(1)} m³/s de erogación continua).</div>
                            <div>• <b>Prioridad de Abastecimiento Humano:</b> Reserva prioritaria intangible de <b>120 L/s</b> para los 5 comités APR de la comuna de Retiro (3.220 familias).</div>
                        </div>

                        <p>
                            Comuníquese a la <b>Junta de Vigilancia del Río Longaví</b>, a la Asociación de Canalistas de Retiro y publíquese en el Diario Oficial.
                        </p>
                    </div>
                `;
            } else if (decreeType === 'SENAPRED_ALERTA') {
                headerEl.innerText = 'DECLARATORIA ALERTA TEMPRANA PREVENTIVA • SENAPRED MAULE';
                folioEl.innerText = 'SENAPRED-ATP-CRECIDA-2026';
                bodyEl.innerHTML = `
                    <div class="space-y-4">
                        <p class="font-bold text-red-400">
                            INFORME TÉCNICO DE AMENAZA HIDROMETEOROLÓGICA:
                        </p>
                        <p>
                            De acuerdo con la información proporcionada por la Dirección Meteorológica de Chile (DMC) y la simulación del <b>Digital Twin AgriTwin Maule Sur</b>, 
                            se proyecta un evento de precipitaciones de <b>${window.basinTwin.precip} mm en 24 horas</b> con isoterma 0°C a <b>${window.basinTwin.isotherm.toLocaleString('es-CL')} msnm</b>.
                        </p>
                        <p>
                            El modelo hidrológico prevé una onda de crecida con caudal pico natural de <b>${data.peakNat.toFixed(1)} m³/s</b>, 
                            el cual es amortiguado a <b>${data.peakMit.toFixed(1)} m³/s</b> gracias a la red de zanjas Keyline y tranques de infiltración (-22.4% pico).
                        </p>

                        <div class="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 font-mono text-xs space-y-2">
                            <div class="text-red-300 font-bold uppercase tracking-wider">MEDIDAS OPERATIVAS OBLIGATORIAS:</div>
                            <div>• <b>Estado:</b> ${data.peakNat > 345 ? '🚨 ALERTA ROJA POR DESBORDE' : data.peakNat > 240 ? '⚠️ ALERTA AMARILLA PREVENTIVA' : '✅ MONITOREO AMARILLO PREVENTIVO'}.</div>
                            <div>• <b>Margen de Evacuación:</b> +${data.evacuationBuffer.toFixed(1)} horas de ventaja conferidas por la amortiguación Keyline en cabecera.</div>
                            <div>• <b>Comité Operativo Comunal:</b> Activación inmediata del COE Comunal de Retiro y refuerzo de pretiles en el cruce Quilaimo.</div>
                        </div>
                    </div>
                `;
            } else if (decreeType === 'JUNTA_VIGILANCIA') {
                headerEl.innerText = 'ACTA EXTRAORDINARIA N° 14 • JUNTA DE VIGILANCIA RÍO LONGAVÍ';
                folioEl.innerText = 'JVRL-ACTA-2026-REPARTO';
                bodyEl.innerHTML = `
                    <div class="space-y-4">
                        <p class="font-bold text-amber-300">
                            DISTRIBUCIÓN Y PRORRATEO DE CAUDALES DE RIEGO:
                        </p>
                        <p>
                            En el Fundo Meniel, comuna de Retiro, se reúne el Directorio de la <b>Junta de Vigilancia del Río Longaví y sus Afluentes</b> para validar las 
                            tasas de distribución de agua superficial para la temporada agrícola.
                        </p>
                        <div class="overflow-x-auto rounded-xl border border-white/10 font-mono text-xs">
                            <table class="w-full text-left">
                                <thead class="bg-black/60 text-slate-400 border-b border-white/10">
                                    <tr>
                                        <th class="py-2 px-3">Canal Matriz</th>
                                        <th class="py-2 px-3">Acciones</th>
                                        <th class="py-2 px-3">Caudal Asignado</th>
                                        <th class="py-2 px-3">Turno</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5 bg-black/30 text-[11px]">
                                    <tr>
                                        <td class="py-2 px-3 text-white font-bold">Canal Retiro Norte</td>
                                        <td class="py-2 px-3 text-slate-300">420 acc</td>
                                        <td class="py-2 px-3 text-sky-400 font-bold">${(18.5 * (data.damPct / 100)).toFixed(1)} L/s</td>
                                        <td class="py-2 px-3 text-emerald-400">Lunes a Miércoles</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 px-3 text-white font-bold">Canal San José - Mantelfrío</td>
                                        <td class="py-2 px-3 text-slate-300">310 acc</td>
                                        <td class="py-2 px-3 text-sky-400 font-bold">${(14.2 * (data.damPct / 100)).toFixed(1)} L/s</td>
                                        <td class="py-2 px-3 text-emerald-400">Jueves a Sábado</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 px-3 text-white font-bold">Canal Derivado Meniel</td>
                                        <td class="py-2 px-3 text-slate-300">180 acc</td>
                                        <td class="py-2 px-3 text-sky-400 font-bold">${(8.9 * (data.damPct / 100)).toFixed(1)} L/s</td>
                                        <td class="py-2 px-3 text-emerald-400">Continuo (Infiltración Keyline)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            } else if (decreeType === 'CORFO_KEYLINE') {
                headerEl.innerText = 'CERTIFICADO TÉCNICO DE RESILIENCIA HÍDRICA & CRÉDITO VERDE';
                folioEl.innerText = 'CORFO-VERDE-KEYLINE-2026';
                bodyEl.innerHTML = `
                    <div class="space-y-4">
                        <p class="font-bold text-emerald-300">
                            CERTIFICACIÓN DE IMPACTO AMBIENTAL POSITIVO (MACRO-CUENCA):
                        </p>
                        <p>
                            El Digital Twin <b>AgriTwin Maule Sur</b> certifica que el sistema regenerativo de manejo hidrológico por curvas de nivel (Keyline), 
                            ejecutado en los 10 predios de Retiro (508 ha totales), ha alcanzado los siguientes hitos verificables:
                        </p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                            <div class="p-3 rounded-xl bg-black/40 border border-emerald-500/30">
                                <span class="text-slate-400 block text-[10px]">Infiltración en Acuífero:</span>
                                <span class="text-emerald-400 font-bold text-sm">${data.keylineInfilVol.toLocaleString('es-CL')} m³ / evento</span>
                            </div>
                            <div class="p-3 rounded-xl bg-black/40 border border-emerald-500/30">
                                <span class="text-slate-400 block text-[10px]">Atenuación Crecida Valle:</span>
                                <span class="text-emerald-400 font-bold text-sm">-22.4% Caudal Pico</span>
                            </div>
                            <div class="p-3 rounded-xl bg-black/40 border border-emerald-500/30">
                                <span class="text-slate-400 block text-[10px]">Retención de Suelo Fértil:</span>
                                <span class="text-lime-300 font-bold text-sm">${Math.round(45 + window.basinTwin.precip * 3.8)} ton de sedimento</span>
                            </div>
                            <div class="p-3 rounded-xl bg-black/40 border border-emerald-500/30">
                                <span class="text-slate-400 block text-[10px]">Elegibilidad Financiera:</span>
                                <span class="text-cyan-300 font-bold text-sm">Tasa Preferencial Banco Estado / BCI</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        function copyBasinDecreeText() {
            const printArea = document.getElementById('cerroDecreePrintArea');
            if (!printArea) return;
            navigator.clipboard.writeText(printArea.innerText).then(() => {
                showToast('✅ Expediente oficial copiado al portapapeles');
            }).catch(() => {
                showToast('📋 Texto seleccionado');
            });
        }

        function printBasinDecree() {
            window.print();
        }

        // ═══════════════════════════════════════════════════════════════════
        // EJE HERRAMIENTA-VISOR: RENDERIZADOR TÁCTICO DE MODELOS VECTORIALES (EXPANDIDO & ENRIQUECIDO)
        // ═══════════════════════════════════════════════════════════════════
        window.triggerBiophysicalTool = function(toolType) {
            const titleEl = document.getElementById('tacticalBiophysicalTitle');
            const badgeEl = document.getElementById('tacticalBiophysicalBadge');
            const descEl = document.getElementById('tacticalBiophysicalDesc');
            const targetEl = document.getElementById('tacticalBiophysicalSvgTarget');

            if (!targetEl) return;

            const modal = document.getElementById('biophysicalModal');
            if (modal) modal.classList.remove('hidden');

            const toolBtns = {
                'transect': 'btnModalToolTransect',
                'sediments': 'btnModalToolSediments',
                'slope25d': 'btnModalToolSlope25d'
            };
            ['btnModalToolTransect', 'btnModalToolSediments', 'btnModalToolSlope25d'].forEach(id => {
                const b = document.getElementById(id);
                if (b) {
                    if (id === toolBtns[toolType]) {
                        b.className = 'px-3 py-1.5 rounded-lg bg-sky-500/30 text-sky-200 border border-sky-400 font-bold transition-all cursor-pointer whitespace-nowrap';
                    } else {
                        b.className = 'px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer whitespace-nowrap';
                    }
                }
            });

            if (toolType === 'transect') {
                if (titleEl) titleEl.innerHTML = '<span>📐</span> Transecto Hidráulico Longitudinal X-Y (Andes ➔ Valle)';
                if (badgeEl) { badgeEl.innerText = 'ANDES ➔ VALLE (Δh 1.255m)'; badgeEl.className = 'text-[9.5px] px-2.5 py-0.5 rounded bg-sky-950 text-sky-300 font-mono border border-sky-500/40 font-bold'; }
                if (descEl) descEl.innerHTML = 'Gradiente hidráulico del Río Longaví: nacientes cordilleranas (Bullileo), infiltración Keyline de recarga profunda (Fundo Meniel) y planicie de amortiguación aluvial en Retiro.';
                targetEl.innerHTML = `
                    <div class="w-full space-y-2">
                        <svg viewBox="0 0 600 230" class="w-full h-auto select-none font-mono filter drop-shadow">
                            <defs>
                                <linearGradient id="tacGradTerrain" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#334155" stop-opacity="0.95"/>
                                    <stop offset="45%" stop-color="#1e293b" stop-opacity="0.95"/>
                                    <stop offset="100%" stop-color="#090d16" stop-opacity="1"/>
                                </linearGradient>
                                <linearGradient id="tacGradWater" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stop-color="#0284c7" stop-opacity="0.9"/>
                                    <stop offset="50%" stop-color="#38bdf8" stop-opacity="1"/>
                                    <stop offset="100%" stop-color="#0284c7" stop-opacity="0.9"/>
                                </linearGradient>
                            </defs>
                            
                            <!-- Grilla de Cotas Físicas -->
                            <line x1="50" y1="24" x2="580" y2="24" stroke="#334155" stroke-dasharray="3,3" stroke-width="1"/>
                            <text x="10" y="28" fill="#94a3b8" font-size="9.5" font-weight="bold">1.400m</text>
                            
                            <line x1="50" y1="80" x2="580" y2="80" stroke="#334155" stroke-dasharray="3,3" stroke-width="1"/>
                            <text x="18" y="84" fill="#94a3b8" font-size="9.5" font-weight="bold">680m</text>
                            
                            <line x1="50" y1="140" x2="580" y2="140" stroke="#334155" stroke-dasharray="3,3" stroke-width="1"/>
                            <text x="18" y="144" fill="#94a3b8" font-size="9.5" font-weight="bold">340m</text>
                            
                            <line x1="50" y1="190" x2="580" y2="190" stroke="#334155" stroke-dasharray="3,3" stroke-width="1"/>
                            <text x="18" y="194" fill="#94a3b8" font-size="9.5" font-weight="bold">145m</text>
                            
                            <!-- Perfil Topográfico de la Cuenca -->
                            <path d="M 50 24 Q 155 48 235 84 T 410 144 T 580 190 L 580 220 L 50 220 Z" fill="url(#tacGradTerrain)" stroke="#64748b" stroke-width="1.8"/>
                            
                            <!-- Lámina de Agua Fluvial con Resplandor -->
                            <path d="M 50 27 Q 155 51 235 87 T 410 147 T 580 193" fill="none" stroke="url(#tacGradWater)" stroke-width="5" stroke-linecap="round"/>
                            
                            <!-- Nivel Freático / Recarga Subterránea -->
                            <path d="M 235 102 Q 410 162 T 580 202" fill="none" stroke="#a855f7" stroke-dasharray="4,3" stroke-width="1.6"/>
                            <text x="320" y="180" fill="#c084fc" font-size="8.5">Nivel Freático Aluvial APR</text>
                            
                            <!-- Hitos de la Cuenca -->
                            <circle cx="235" cy="87" r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.8"/>
                            <text x="190" y="62" fill="#f1f5f9" font-size="9.5" font-weight="bold">Bullileo (680m)</text>
                            <text x="195" y="74" fill="#38bdf8" font-size="8.5">Embalse 60M m³</text>
                            
                            <circle cx="410" cy="147" r="5.5" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                            <text x="365" y="118" fill="#6ee7b7" font-size="10" font-weight="bold">Meniel Keyline (340m)</text>
                            <text x="375" y="130" fill="#a7f3d0" font-size="8.5">+320 L/s Infiltración</text>
                            
                            <circle cx="560" cy="189" r="5" fill="#eab308" stroke="#ffffff" stroke-width="1.8"/>
                            <text x="515" y="166" fill="#fef08a" font-size="9.5" font-weight="bold">Retiro (145m)</text>
                            <text x="515" y="178" fill="#fde047" font-size="8.5">5 Comités APR</text>
                        </svg>

                        <!-- Panel de Métricas Físicas del Transecto -->
                        <div class="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono border-t border-white/10">
                            <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                <span class="text-slate-400 block text-[9px]">Longitud Hidráulica</span>
                                <strong class="text-sky-300 text-xs">48.2 km</strong>
                            </div>
                            <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                <span class="text-slate-400 block text-[9px]">Pendiente Media</span>
                                <strong class="text-amber-300 text-xs">2.6% (i = 0.026)</strong>
                            </div>
                            <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                <span class="text-slate-400 block text-[9px]">Energía Cinética</span>
                                <strong class="text-emerald-300 text-xs">3.4 m/s (Régimen)</strong>
                            </div>
                        </div>
                    </div>
                `;
            } else if (toolType === 'sediments') {
                if (titleEl) titleEl.innerHTML = '<span>🌊</span> Corte Transversal de Cauce & Mecánica de Sedimentos';
                if (badgeEl) { badgeEl.innerText = 'SHIELDS & SUSPENSIÓN'; badgeEl.className = 'text-[9.5px] px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-500/40 font-bold'; }
                if (descEl) descEl.innerHTML = 'Distribución vertical de transporte en el Río Longaví: arcillas en suspensión turbia (NTU), arena en saltación balística y arrastre de gravas por tensión cortante de fondo.';
                targetEl.innerHTML = `
                    <div class="w-full space-y-2">
                        <svg viewBox="0 0 600 220" class="w-full h-auto select-none font-mono filter drop-shadow">
                            <!-- Columna de Agua -->
                            <rect x="25" y="16" width="550" height="135" fill="rgba(14, 165, 233, 0.18)" stroke="#38bdf8" stroke-width="1.2" rx="6"/>
                            <line x1="25" y1="16" x2="575" y2="16" stroke="#38bdf8" stroke-width="2.5"/>
                            <text x="38" y="32" fill="#7dd3fc" font-size="9.5" font-weight="bold">Superficie Libre • Flujo Turbulento (Re > 10⁵)</text>
                            <text x="440" y="32" fill="#38bdf8" font-size="9">V_sup = 2.4 m/s</text>

                            <!-- Capa de Suspensión (Turbidez) -->
                            <g opacity="0.9">
                                <circle cx="85" cy="50" r="2" fill="#fde047"/>
                                <circle cx="160" cy="62" r="2.4" fill="#fde047"/>
                                <circle cx="270" cy="46" r="1.8" fill="#fde047"/>
                                <circle cx="380" cy="58" r="2.2" fill="#fde047"/>
                                <circle cx="490" cy="52" r="2" fill="#fde047"/>
                                <text x="38" y="74" fill="#fef08a" font-size="9">Carga en Suspensión Coloidal (Turbidez: 140 NTU)</text>
                            </g>

                            <!-- Capa de Saltación (Arenas) -->
                            <path d="M 110 148 Q 140 105 170 148 Q 200 110 230 148 Q 260 102 290 148" fill="none" stroke="#fb923c" stroke-width="1.8" stroke-dasharray="4,3"/>
                            <circle cx="140" cy="108" r="2.8" fill="#f97316"/>
                            <circle cx="200" cy="112" r="2.8" fill="#f97316"/>
                            <circle cx="260" cy="105" r="2.8" fill="#f97316"/>
                            <text x="145" y="100" fill="#fb923c" font-size="9" font-weight="bold">Saltación de Arenas (d₅₀ = 1.2 mm)</text>

                            <!-- Lecho de Fondo (Gravas y Bolones) -->
                            <rect x="25" y="151" width="550" height="60" fill="#1e293b" stroke="#475569" stroke-width="1.2" rx="4"/>
                            <ellipse cx="80" cy="174" rx="20" ry="11" fill="#64748b"/>
                            <ellipse cx="180" cy="176" rx="26" ry="13" fill="#475569" stroke="#94a3b8" stroke-width="0.8"/>
                            <ellipse cx="290" cy="174" rx="22" ry="12" fill="#64748b"/>
                            <ellipse cx="400" cy="177" rx="30" ry="14" fill="#475569" stroke="#94a3b8" stroke-width="0.8"/>
                            <ellipse cx="510" cy="174" rx="24" ry="12" fill="#64748b"/>
                            <text x="210" y="196" fill="#cbd5e1" font-size="9.5" font-weight="bold">Tracción de Fondo (Tensión de Shields θ > 0.056)</text>
                        </svg>

                        <!-- Métricas de Sedimentos -->
                        <div class="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono border-t border-white/10">
                            <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                <span class="text-slate-400 block text-[9px]">Tensión Cortante (τ₀)</span>
                                <strong class="text-emerald-300 text-xs">18.4 N/m²</strong>
                            </div>
                            <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                <span class="text-slate-400 block text-[9px]">Gasto Sólido Total</span>
                                <strong class="text-amber-300 text-xs">820 t/día</strong>
                            </div>
                            <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                <span class="text-slate-400 block text-[9px]">Retención en Keyline</span>
                                <strong class="text-sky-300 text-xs">84% Atrapado</strong>
                            </div>
                        </div>
                    </div>
                `;
            } else if (toolType === 'slope25d') {
                if (titleEl) titleEl.innerHTML = '<span>🏔️</span> Bloque 2.5D: Morfodinámica de Ladera & Disipación';
                if (badgeEl) { badgeEl.innerText = 'MORFOLOGÍA 2.5D'; badgeEl.className = 'text-[9.5px] px-2.5 py-0.5 rounded bg-yellow-950 text-yellow-300 font-mono border border-yellow-500/40 font-bold'; }
                if (descEl) descEl.innerHTML = 'Perfil tridimensional de amenazas de ladera: escarpe de fractura en alta cordillera, canal torrencial de transporte y abanico aluvial disipado por terrazas biofísicas.';
                targetEl.innerHTML = `
                    <div class="w-full space-y-2">
                        <svg viewBox="0 0 600 220" class="w-full h-auto select-none font-mono filter drop-shadow">
                            <!-- Bloque Isométrico 2.5D -->
                            <polygon points="50,55 300,20 550,55 300,95" fill="#334155" stroke="#64748b" stroke-width="1.5"/>
                            <polygon points="50,55 300,95 300,185 50,145" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
                            <polygon points="300,95 550,55 550,145 300,185" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
                            
                            <!-- Escarpe de Desprendimiento en Cara Superior -->
                            <path d="M 130,42 Q 190,26 260,30 T 400,28" fill="none" stroke="#f87171" stroke-width="2.5" stroke-dasharray="4,2"/>
                            <text x="145" y="24" fill="#fca5a5" font-size="9" font-weight="bold">Escarpe de Fractura / Desprendimiento</text>
                            
                            <!-- Canal Torrencial Encajonado -->
                            <path d="M 270,30 Q 285,55 300,95" fill="none" stroke="#38bdf8" stroke-width="4"/>
                            <text x="180" y="68" fill="#fef08a" font-size="8.5" font-weight="bold">Canal Aluvial Encajonado ➔</text>
                            
                            <!-- Cono / Abanico Aluvial de Depósito -->
                            <path d="M 300,95 Q 240,128 190,160 L 410,160 Q 360,128 300,95 Z" fill="rgba(234, 179, 8, 0.35)" stroke="#eab308" stroke-width="1.5"/>
                            <text x="235" y="142" fill="#fde047" font-size="10" font-weight="bold">Abanico / Cono Aluvial</text>
                            
                            <!-- Terrazas Keyline de Disipación -->
                            <path d="M 180,165 Q 300,148 420,165" fill="none" stroke="#10b981" stroke-width="3"/>
                            <path d="M 165,175 Q 300,158 435,175" fill="none" stroke="#10b981" stroke-width="3"/>
                            <text x="220" y="185" fill="#34d399" font-size="9.5" font-weight="bold">Terrazas Keyline de Disipación Hidráulica</text>
                            
                            <!-- Río Principal al Pie -->
                            <path d="M 50,142 Q 300,182 550,142" fill="none" stroke="#0ea5e9" stroke-width="3.5"/>
                            <text x="440,135" fill="#7dd3fc" font-size="9" font-weight="bold">Río Longaví</text>
                        </svg>

                        <!-- Métricas del Modelo 2.5D -->
                        <div class="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono border-t border-white/10">
                            <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                <span class="text-slate-400 block text-[9px]">Ángulo de Fricción (φ)</span>
                                <strong class="text-yellow-300 text-xs">34° (Basamento)</strong>
                            </div>
                            <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                <span class="text-slate-400 block text-[9px]">Factor Seguridad Ladera</span>
                                <strong class="text-emerald-300 text-xs">FS = 1.48 (Estable)</strong>
                            </div>
                            <div class="p-1.5 rounded bg-black/40 border border-white/5">
                                <span class="text-slate-400 block text-[9px]">Atenuación Energía</span>
                                <strong class="text-sky-300 text-xs">-72% con Keyline</strong>
                            </div>
                        </div>
                    </div>
                `;
            }

            // Cambiar a la pestaña hídrica del sidebar y asegurar que esté abierto
            if (typeof selectSidebarTab === 'function') {
                selectSidebarTab('tab-water');
            }
            if (typeof window.toggleTerritorialSidebar === 'function') {
                window.toggleTerritorialSidebar(true);
            }
        };

        // ═══════════════════════════════════════════════════════════════════
        // HERRAMIENTA DE DIBUJO DE POLÍGONOS EN LEAFLET (PREDIO / RESERVA EN CUENCA)
        // ═══════════════════════════════════════════════════════════════════
        window.cuencaDrawnPolygons = [];
        window.cuencaDrawingState = {
            active: false,
            points: [],
            tempLine: null,
            tempPolygon: null
        };

        window.toggleCuencaCorteMenu = function(force) {
            const el = document.getElementById('cuencaCorteFlyout');
            if (!el) return;
            const isHidden = el.classList.contains('hidden');
            const show = (force !== undefined) ? force : isHidden;
            if (show) {
                el.classList.remove('hidden');
                const polyFly = document.getElementById('cuencaPolyFlyout');
                if (polyFly) polyFly.classList.add('hidden');
            } else {
                el.classList.add('hidden');
            }
        };

        window.toggleCuencaPolyMenu = function(force) {
            const el = document.getElementById('cuencaPolyFlyout');
            if (!el) return;
            const isHidden = el.classList.contains('hidden');
            const show = (force !== undefined) ? force : isHidden;
            if (show) {
                el.classList.remove('hidden');
                const corteFly = document.getElementById('cuencaCorteFlyout');
                if (corteFly) corteFly.classList.add('hidden');
            } else {
                el.classList.add('hidden');
            }
        };

        window.startDrawingCuencaPolygon = function() {
            if (!map) return;
            window.cuencaDrawingState.active = true;
            window.cuencaDrawingState.points = [];
            
            // Cursor de cruz
            map.getContainer().style.cursor = 'crosshair';
            
            // Toast de notificación
            if (typeof showToastNotification === 'function') {
                showToastNotification('✏️ Haz clic en el mapa para marcar los vértices. Doble clic para cerrar el polígono.', 4000);
            } else {
                alert('✏️ Haz clic en el mapa para marcar los vértices. Doble clic para cerrar el polígono.');
            }

            const onMapClick = function(e) {
                if (!window.cuencaDrawingState.active) return;
                window.cuencaDrawingState.points.push(e.latlng);

                if (!window.cuencaDrawingState.tempPolygon) {
                    window.cuencaDrawingState.tempPolygon = L.polyline(window.cuencaDrawingState.points, {
                        color: '#10b981',
                        weight: 2,
                        dashArray: '4,4'
                    }).addTo(map);
                } else {
                    window.cuencaDrawingState.tempPolygon.setLatLngs(window.cuencaDrawingState.points);
                }
            };

            const onMapDblClick = function(e) {
                if (!window.cuencaDrawingState.active) return;
                L.DomEvent.stop(e);
                
                if (window.cuencaDrawingState.points.length >= 3) {
                    const poly = L.polygon(window.cuencaDrawingState.points, {
                        color: '#10b981',
                        weight: 2.5,
                        fillColor: '#34d399',
                        fillOpacity: 0.35
                    }).addTo(map);

                    // Calcular área aproximada en hectáreas
                    const pts = window.cuencaDrawingState.points;
                    let areaM2 = 0;
                    for (let i = 0; i < pts.length; i++) {
                        const j = (i + 1) % pts.length;
                        areaM2 += (pts[i].lng * pts[j].lat) - (pts[j].lng * pts[i].lat);
                    }
                    const ha = Math.abs(areaM2 * 111319 * 111319 * Math.cos(pts[0].lat * Math.PI / 180) / 20000).toFixed(1);

                    poly.bindPopup(`
                        <div style="font-family: monospace; font-size: 11px;">
                            <strong style="color: #10b981;">📐 Polígono Trazado en Cuenca</strong><br>
                            Área Estimada: <strong>${ha} ha</strong><br>
                            Vértices: ${pts.length}<br>
                            <span style="font-size: 9px; color: #94a3b8;">Parcela / Reserva delimitada</span>
                        </div>
                    `).openPopup();

                    window.cuencaDrawnPolygons.push(poly);
                }

                // Finalizar modo dibujo
                window.cuencaDrawingState.active = false;
                if (window.cuencaDrawingState.tempPolygon) {
                    map.removeLayer(window.cuencaDrawingState.tempPolygon);
                    window.cuencaDrawingState.tempPolygon = null;
                }
                map.getContainer().style.cursor = '';
                map.off('click', onMapClick);
                map.off('dblclick', onMapDblClick);
            };

            map.on('click', onMapClick);
            map.on('dblclick', onMapDblClick);
        };

        window.clearCuencaPolygons = function() {
            if (!map) return;
            window.cuencaDrawnPolygons.forEach(p => map.removeLayer(p));
            window.cuencaDrawnPolygons = [];
            if (window.cuencaDrawingState.tempPolygon) {
                map.removeLayer(window.cuencaDrawingState.tempPolygon);
                window.cuencaDrawingState.tempPolygon = null;
            }
            window.cuencaDrawingState.active = false;
            map.getContainer().style.cursor = '';
        };

