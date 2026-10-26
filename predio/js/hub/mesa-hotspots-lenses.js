        // ═══════════════════════════════════════════════════════════════════
        // MODAL DIEGÉTICO MULTI-PESTAÑA DE LA MESA DE VECINOS (MOMENTO 3)
        // ═══════════════════════════════════════════════════════════════════
        let currentMesaTab = 'fogata';
        let currentRadioAudio = null;

        function openMesaHotspotModal(tabId) {
            playDiegeticAudio('bell');
            const modal = document.getElementById('mesaHotspotModal');
            if (!modal) return;
            modal.classList.add('active');
            switchMesaHotspotTab(tabId || 'fogata');
        }

        function closeMesaHotspotModal() {
            const modal = document.getElementById('mesaHotspotModal');
            if (modal) modal.classList.remove('active');
            // Detener radio al cerrar para evitar audio en segundo plano
            stopMesaRadioStream();
        }

        function stopMesaRadioStream() {
            if (currentRadioAudio) {
                try {
                    currentRadioAudio.pause();
                    currentRadioAudio.src = '';
                    currentRadioAudio.load();
                } catch (e) {
                    console.warn('Radio pause notice:', e);
                }
                currentRadioAudio = null;
            }
            const statusEl = document.getElementById('radioLivePlayerStatus');
            if (statusEl) statusEl.innerHTML = '<span class="text-slate-500">⏸️ Transmisión detenida</span>';
            const btnPlay = document.getElementById('btnRadioTogglePlay');
            if (btnPlay) btnPlay.innerHTML = '<span>▶</span> Conectar Emisión';
        }

        function playMesaRadioStream(url, name, freq) {
            stopMesaRadioStream();
            const statusEl = document.getElementById('radioLivePlayerStatus');
            const btnPlay = document.getElementById('btnRadioTogglePlay');
            if (statusEl) statusEl.innerHTML = `<span class="text-rose-400 font-bold animate-pulse">🔴 Sintonizando ${name} (${freq})...</span>`;
            
            try {
                currentRadioAudio = new Audio(url);
                currentRadioAudio.crossOrigin = 'anonymous';
                currentRadioAudio.play().then(() => {
                    if (statusEl) statusEl.innerHTML = `<span class="text-emerald-400 font-bold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> AL AIRE: ${name} • ${freq}</span>`;
                    if (btnPlay) btnPlay.innerHTML = '<span>⏹</span> Pausar Emisión';
                }).catch(err => {
                    console.error('Radio play error:', err);
                    if (statusEl) statusEl.innerHTML = `<span class="text-amber-400 font-bold">⚠️ Conexión en búfer o stream no disponible en directo. Intentando reconectar...</span>`;
                });
            } catch (e) {
                console.error(e);
            }
        }

        function toggleMesaRadioPlayback(url, name, freq) {
            if (currentRadioAudio && !currentRadioAudio.paused) {
                stopMesaRadioStream();
            } else {
                playMesaRadioStream(url, name, freq);
            }
        }

        function switchMesaHotspotTab(tabId) {
            // Normalizar alias
            if (tabId === 'circulo') tabId = 'fogata';
            if (tabId === 'pizarra') tabId = 'panal';
            if (tabId === 'dao') tabId = 'balanza';
            if (!['fogata', 'panal', 'radio', 'pactos', 'balanza', 'maletin'].includes(tabId)) {
                tabId = 'fogata';
            }
            currentMesaTab = tabId;

            const titleEl = document.getElementById('mesaModalTitle');
            const badgeEl = document.getElementById('mesaModalBadge');
            const bodyEl = document.getElementById('mesaModalBody');
            if (!titleEl || !badgeEl || !bodyEl) return;

            // Actualizar apariencia de las pestañas en el header del modal
            document.querySelectorAll('.mesa-hotspot-tab-btn').forEach(btn => {
                btn.className = 'mesa-hotspot-tab-btn px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer text-slate-400 hover:text-white hover:bg-white/5';
            });
            const activeBtn = document.getElementById(`tabBtn-${tabId}`);
            if (activeBtn) {
                activeBtn.className = 'mesa-hotspot-tab-btn active px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-md';
            }

            // Inyectar contenido según pestaña
            if (tabId === 'fogata') {
                badgeEl.innerText = 'OBJ-MESA-06 • FOGATA DE ACUERDOS';
                titleEl.innerHTML = '<span>🔥</span> Actas de Asambleas & Libro de Reuniones Vecinales';
                bodyEl.innerHTML = `
                    <div class="space-y-4 text-xs">
                        <div class="p-3.5 rounded-2xl bg-gradient-to-r from-orange-950/40 to-amber-950/20 border border-orange-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <span class="font-mono text-orange-400 font-bold uppercase text-[10px] block">Asamblea Vecinal Maule Sur</span>
                                <h4 class="text-white font-bold text-sm">Libro Formal de Actas de la Junta de Vecinos</h4>
                                <p class="text-slate-300 text-xs mt-0.5">5 actas registradas con presencia de ministros de fe, aforos de canal y quórum legal.</p>
                            </div>
                            <div class="flex items-center gap-2 shrink-0 font-mono">
                                <span class="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold text-[10px]">Quórum Promedio: 88%</span>
                            </div>
                        </div>

                        <!-- Lista de Actas Oficiales -->
                        <div class="space-y-2.5">
                            <!-- Acta 1: Primavera Riego & Turnos -->
                            <div class="p-3.5 rounded-2xl bg-black/45 border border-white/10 hover:border-orange-500/40 transition-all space-y-1.5">
                                <div class="flex flex-wrap items-center justify-between gap-2">
                                    <div class="flex items-center gap-2">
                                        <span class="text-base">🌊</span>
                                        <h5 class="font-bold text-white text-xs">Acta Nº 24/2026: Calendario de Turnos de Riego y Compuertas Canal Longaví</h5>
                                    </div>
                                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">15 Septiembre 2026 • 85% Quórum</span>
                                </div>
                                <p class="text-slate-300 text-xs leading-relaxed">
                                    <b>Acuerdo vinculante:</b> Se fijan turnos rotativos de 36 horas por predio durante la temporada estival. Fundo Meniel cede 6 horas de aforo nocturno hacia el tranque comunitario San José para mantener cota mínima de seguridad de fauna.
                                </p>
                                <div class="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-mono text-slate-400">
                                    <span>Ministro de Fe: Don Pedro Soto (Agrícola El Roble)</span>
                                    <span class="text-emerald-400 font-bold">10/10 Firmas Validadas</span>
                                </div>
                            </div>

                            <!-- Acta 2: Faja Cortafuegos de 45m -->
                            <div class="p-3.5 rounded-2xl bg-black/45 border border-white/10 hover:border-emerald-500/40 transition-all space-y-1.5">
                                <div class="flex flex-wrap items-center justify-between gap-2">
                                    <div class="flex items-center gap-2">
                                        <span class="text-base">🛡️</span>
                                        <h5 class="font-bold text-white text-xs">Acta Nº 23/2026: Homologación Faja Cortafuegos 45m y Pastoreo PRV Limítrofe</h5>
                                    </div>
                                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">02 Agosto 2026 • 90% Quórum</span>
                                </div>
                                <p class="text-slate-300 text-xs leading-relaxed">
                                    <b>Acuerdo vinculante:</b> Desbroce y chipeado de 22.5 metros a cada lado del deslinde común con Forestal Los Pinos. Uso coordinado del apiñamiento bovino PRV para consumo intensivo de maleza fina antes del período de riesgo estival (noviembre a marzo).
                                </p>
                                <div class="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-mono text-slate-400">
                                    <span>Coordinación: Fundo Meniel & CONAF Provincial Linares</span>
                                    <span class="text-teal-400 font-bold">9/10 Predios Adheridos</span>
                                </div>
                            </div>

                            <!-- Acta 3: Crecidas de Invierno y Tranque Keyline -->
                            <div class="p-3.5 rounded-2xl bg-black/45 border border-white/10 hover:border-sky-500/40 transition-all space-y-1.5">
                                <div class="flex flex-wrap items-center justify-between gap-2">
                                    <div class="flex items-center gap-2">
                                        <span class="text-base">🌧️</span>
                                        <h5 class="font-bold text-white text-xs">Acta Nº 22/2026: Protocolo de Crecidas y Vertederos de Alivio Keyline</h5>
                                    </div>
                                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-500/30">24 Junio 2026 • 100% Quórum</span>
                                </div>
                                <p class="text-slate-300 text-xs leading-relaxed">
                                    <b>Acuerdo vinculante:</b> Operación coordinada de compuertas durante el temporal del 23-25 de junio. Desvío de excedentes de caudal hacia zanjas de infiltración y tranque 18.500 m³ para mitigar anegamiento de parcelas bajas y caminos rurales.
                                </p>
                                <div class="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-mono text-slate-400">
                                    <span>Registro: Bomberos Retiro & Junta de Vigilancia Longaví</span>
                                    <span class="text-sky-300 font-bold">100% Evacuación Sin Daños</span>
                                </div>
                            </div>
                        </div>

                        <!-- Próxima Asamblea & Descarga -->
                        <div class="p-3 rounded-xl bg-orange-950/20 border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
                            <div class="flex items-center gap-2 text-slate-300">
                                <span class="text-orange-400">📅</span>
                                <span><b>Próxima Sesión Ordinaria:</b> Sábado 18 de Octubre • 11:00 hrs • Sede Fundo Meniel</span>
                            </div>
                            <button onclick="downloadFormalAgreements()" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 font-black font-mono text-xs shadow-lg transition-all cursor-pointer">
                                📥 Descargar Libro Consolidado (.txt)
                            </button>
                        </div>
                    </div>
                `;
            } else if (tabId === 'panal') {
                badgeEl.innerText = 'OBJ-MESA-01 • EL PANAL VECINAL';
                titleEl.innerHTML = '<span>🐝</span> Pizarra: El Panal • Topología de 11 Hexágonos & Red de Bio-Flujos';
                bodyEl.innerHTML = `
                    <div class="space-y-3.5 text-xs">
                        <!-- Cabecera y Filtros de Flujo -->
                        <div class="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900/60 to-yellow-950/30 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2.5">
                            <div class="flex items-center gap-2">
                                <span class="text-xl">🐝</span>
                                <div>
                                    <h4 class="text-white font-bold text-sm font-sans">Red Interpredial El Panal (Núcleo Meniel + 7 Vecinos)</h4>
                                    <p class="text-slate-300 text-[11px]">Intercambio directo de recursos: haz clic en cualquier hexágono para cargar su ficha biofísica en tiempo real.</p>
                                </div>
                            </div>
                            <!-- Filtros de Flujos Vectoriales -->
                            <div class="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                                <span class="text-slate-400 font-bold uppercase mr-1">Flujo:</span>
                                <button id="modalFlux-all" onclick="filterMesaModalPanalFluxes('all')" class="modal-flux-btn active px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold border border-amber-400 cursor-pointer shadow-sm">
                                    🌐 Todos
                                </button>
                                <button id="modalFlux-water" onclick="filterMesaModalPanalFluxes('water')" class="modal-flux-btn px-2.5 py-1 rounded-lg bg-black/50 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 cursor-pointer">
                                    💧 Agua
                                </button>
                                <button id="modalFlux-energy" onclick="filterMesaModalPanalFluxes('energy')" class="modal-flux-btn px-2.5 py-1 rounded-lg bg-black/50 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 cursor-pointer">
                                    ⚡ Solar
                                </button>
                                <button id="modalFlux-biomass" onclick="filterMesaModalPanalFluxes('biomass')" class="modal-flux-btn px-2.5 py-1 rounded-lg bg-black/50 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer">
                                    🪵 Biomasa
                                </button>
                                <button id="modalFlux-agriculture" onclick="filterMesaModalPanalFluxes('agriculture')" class="modal-flux-btn px-2.5 py-1 rounded-lg bg-black/50 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 cursor-pointer">
                                    🍓 Frutales
                                </button>
                            </div>
                        </div>

                        <!-- Grid Principal: Canvas SVG (65%) + Ficha Dinámica del Nodo (35%) -->
                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
                            <!-- Columna SVG: 7 de 12 columnas en desktop -->
                            <div class="lg:col-span-7 flex flex-col rounded-2xl border border-amber-500/30 bg-[#0d1522] shadow-inner p-2 relative overflow-hidden min-h-[390px] sm:min-h-[440px]">
                                <div class="absolute top-2 left-2 z-10 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-black/70 px-2 py-0.5 rounded border border-white/10">
                                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span>Teselado Axial Dinámico (11 Celdas)</span>
                                </div>
                                <div class="absolute top-2 right-2 z-10 flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-black/70 px-2 py-0.5 rounded border border-white/10">
                                    <span>Fundo Meniel al Centro</span>
                                </div>

                                <svg id="modalPanalSvg" viewBox="0 0 760 540" class="w-full h-full max-h-[440px] select-none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <filter id="mRedHaloGlow" x="-30%" y="-30%" width="160%" height="160%">
                                            <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#ef4444" flood-opacity="0.95"/>
                                        </filter>
                                        <filter id="mGoldSelectGlow" x="-30%" y="-30%" width="160%" height="160%">
                                            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#f59e0b" flood-opacity="0.9"/>
                                        </filter>
                                        <marker id="mArrowWater" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                            <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4"/>
                                        </marker>
                                        <marker id="mArrowEnergy" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
                                        </marker>
                                        <marker id="mArrowBiomass" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981"/>
                                        </marker>
                                        <marker id="mArrowAgri" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e"/>
                                        </marker>
                                    </defs>
                                    <g id="modalPanalBgGrid" opacity="0.08"></g>
                                    <g id="modalPanalFluxesGroup"></g>
                                    <g id="modalPanalHaloGroup"></g>
                                    <g id="modalPanalHexesGroup"></g>
                                    <g id="modalPanalLabelsGroup" pointer-events="none"></g>
                                </svg>

                                <div class="mt-1 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                                    <div class="flex items-center gap-2">
                                        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> Núcleo Meniel</span>
                                        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Vecinos Corona</span>
                                    </div>
                                    <span>Toca cualquier celda para inspeccionar</span>
                                </div>
                            </div>

                            <!-- Columna Ficha de Detalle: 5 de 12 columnas -->
                            <div class="lg:col-span-5 flex flex-col rounded-2xl border border-white/10 bg-black/60 p-4 space-y-3 font-mono text-xs overflow-y-auto max-h-[460px]">
                                <!-- Encabezado del Nodo -->
                                <div class="border-b border-white/10 pb-2.5">
                                    <div class="flex items-center justify-between mb-1.5">
                                        <span id="mPnlBadge" class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/40">
                                            NÚCLEO MENIEL • HOGAR
                                        </span>
                                        <span id="mPnlOwner" class="text-[10px] text-amber-300">
                                            Propietario al Centro
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-2.5">
                                        <div id="mPnlIcon" class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
                                            🏡
                                        </div>
                                        <div>
                                            <h4 id="mPnlTitle" class="text-sm font-bold text-white font-sans">Hogar & Matriz Energética</h4>
                                            <p id="mPnlSub" class="text-[11px] text-amber-400">Residencial, Energía & Domótica</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- 4 Métricas de Telemetría -->
                                <div class="grid grid-cols-2 gap-2 text-[11px]">
                                    <div class="p-2 rounded-xl bg-white/5 border border-white/10">
                                        <span class="text-[10px] text-slate-400 block" id="mPnlStatL1">Potencia Solar:</span>
                                        <span class="text-white font-bold" id="mPnlStatV1">18.0 kWp</span>
                                    </div>
                                    <div class="p-2 rounded-xl bg-white/5 border border-white/10">
                                        <span class="text-[10px] text-slate-400 block" id="mPnlStatL2">Almacenamiento:</span>
                                        <span class="text-emerald-400 font-bold" id="mPnlStatV2">30 kWh</span>
                                    </div>
                                    <div class="p-2 rounded-xl bg-white/5 border border-white/10">
                                        <span class="text-[10px] text-slate-400 block" id="mPnlStatL3">Consumo Base:</span>
                                        <span class="text-sky-400 font-bold" id="mPnlStatV3">14.2 kWh/d</span>
                                    </div>
                                    <div class="p-2 rounded-xl bg-white/5 border border-white/10">
                                        <span class="text-[10px] text-slate-400 block" id="mPnlStatL4">Excedente:</span>
                                        <span class="text-amber-400 font-bold" id="mPnlStatV4">4.2 kWh/d</span>
                                    </div>
                                </div>

                                <!-- Descripción Biofísica -->
                                <div class="space-y-1">
                                    <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Descripción del Nodo:</span>
                                    <p id="mPnlDesc" class="text-[11px] text-slate-300 font-sans leading-relaxed">
                                        Núcleo habitacional y centro de despacho energético del Fundo Meniel. Banco de baterías LiFePO4 de 30 kWh y respaldo ante cortes de red.
                                    </p>
                                </div>

                                <!-- Flujos Entrantes / Salientes Resumidos -->
                                <div class="space-y-1.5 pt-1 border-t border-white/10">
                                    <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Flujos de Intercambio:</span>
                                    <div id="mPnlFluxList" class="space-y-1 text-[11px] text-slate-300">
                                        <!-- Inyectado dinámicamente -->
                                    </div>
                                </div>

                                <!-- Botón de Sincronización Directa -->
                                <div class="pt-2">
                                    <button onclick="downloadFormalAgreements()" class="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black font-mono text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md">
                                        <span>📜</span> Exportar Ficha Notariada del Nodo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Renderizar SVG interactivo dentro del modal
                setTimeout(() => {
                    renderModalPanalSvg();
                }, 20);
            } else if (tabId === 'radio') {
                badgeEl.innerText = 'OBJ-MESA-05 • RADIOS ONLINE & VHF';
                titleEl.innerHTML = '<span>📻</span> Radios Online del Maule Sur & Frecuencia de Emergencia VHF';
                bodyEl.innerHTML = `
                    <div class="space-y-4 text-xs font-mono">
                        <!-- Sintonizador Online Maule Sur -->
                        <div class="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-950/60 border border-rose-500/30 space-y-3">
                            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                                <div>
                                    <div class="flex items-center gap-2">
                                        <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                                        <h4 class="font-bold text-white text-sm font-sans">Sintonizador de Emisoras Locales del Maule</h4>
                                    </div>
                                    <p class="text-slate-400 text-[11px] font-sans mt-0.5">Streaming de audio directo para acompañar la jornada en el predio y monitorear noticias comunales.</p>
                                </div>
                                <div id="radioLivePlayerStatus" class="text-[11px] font-mono text-slate-300 bg-black/60 px-3 py-1 rounded-xl border border-white/10">
                                    <span class="text-slate-500">⏸️ Transmisión en espera</span>
                                </div>
                            </div>

                            <!-- Botonera de Emisoras Reales del Maule -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <!-- Radio Ancoa Linares -->
                                <button onclick="toggleMesaRadioPlayback('https://audio2.tustreaming.cl:10991/;', 'Radio Ancoa', '95.7 FM')" class="p-3 rounded-xl bg-black/50 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/50 text-left transition-all group cursor-pointer">
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="font-bold text-white group-hover:text-rose-300">Radio Ancoa</span>
                                        <span class="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">95.7 FM</span>
                                    </div>
                                    <div class="text-[10px] text-slate-400">Linares & Retiro</div>
                                    <div class="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">▶ Reproducir Stream</div>
                                </button>

                                <!-- FM+ Talca / Maule -->
                                <button onclick="toggleMesaRadioPlayback('https://audio5.tustreaming.cl/8010/fmmas', 'FM+ Maule', '92.3 FM')" class="p-3 rounded-xl bg-black/50 hover:bg-sky-950/40 border border-white/10 hover:border-sky-500/50 text-left transition-all group cursor-pointer">
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="font-bold text-white group-hover:text-sky-300">FM+ Maule</span>
                                        <span class="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">92.3 FM</span>
                                    </div>
                                    <div class="text-[10px] text-slate-400">Noticias Regionales</div>
                                    <div class="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">▶ Reproducir Stream</div>
                                </button>

                                <!-- Radio Marisol Maule -->
                                <button onclick="toggleMesaRadioPlayback('https://audio0.tustreaming.cl/7620/stream', 'Radio Marisol', 'Maule Sur')" class="p-3 rounded-xl bg-black/50 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500/50 text-left transition-all group cursor-pointer">
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="font-bold text-white group-hover:text-amber-300">Radio Marisol</span>
                                        <span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">Música & Campo</span>
                                    </div>
                                    <div class="text-[10px] text-slate-400">Clásicos del Maule</div>
                                    <div class="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">▶ Reproducir Stream</div>
                                </button>

                                <!-- Guza FM Costa Maule -->
                                <button onclick="toggleMesaRadioPlayback('https://radio.somosguza.cl/listen/estacion_guza/radio.mp3', 'Guza FM', 'Costa Maule')" class="p-3 rounded-xl bg-black/50 hover:bg-teal-950/40 border border-white/10 hover:border-teal-500/50 text-left transition-all group cursor-pointer">
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="font-bold text-white group-hover:text-teal-300">Guza FM</span>
                                        <span class="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">En Línea</span>
                                    </div>
                                    <div class="text-[10px] text-slate-400">Costa & Cuenca Maule</div>
                                    <div class="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">▶ Reproducir Stream</div>
                                </button>
                            </div>

                            <div class="flex items-center justify-between pt-1">
                                <button id="btnRadioTogglePlay" onclick="stopMesaRadioStream()" class="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-mono transition-all cursor-pointer">
                                    <span>⏹</span> Detener Reproductor
                                </button>
                                <span class="text-[10px] text-slate-400 font-mono">Emisión en vivo provista por servidores de streaming regional Maule</span>
                            </div>
                        </div>

                        <!-- Frecuencia Transpredial VHF (Emergencias y Telecomunicaciones de Campo) -->
                        <div class="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <span class="text-base">🚨</span>
                                    <div>
                                        <h5 class="text-white font-bold text-xs">Canal VHF Transpredial: 146.520 MHz Simplex</h5>
                                        <span class="text-[10px] text-slate-400">Subtono CTCSS 88.5 Hz • Sin dependencia de torres 4G ni fibra</span>
                                    </div>
                                </div>
                                <span class="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">10 Handies en Escucha</span>
                            </div>

                            <p class="text-slate-300 text-xs font-sans leading-relaxed">
                                Canal de enlace rápido para guardias nocturnas, confirmación de apertura de compuertas y despacho instantáneo ante avistamiento de humo en la interfaz con plantaciones forestales.
                            </p>

                            <button onclick="dispatchVhfAlert()" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black font-mono text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                                <span>📢</span> TRANSMITIR BALIZA DE PRUEBA VHF (146.520 MHz)
                            </button>
                            <div id="vhfAlertStatus" class="hidden text-center text-rose-300 font-bold text-[11px] pt-1">
                                📢 PROTOCOLO ACTIVADO • ALERTA TRANSMITIDA POR CANAL 146.520 MHz A LOS 10 PREDIOS
                            </div>
                        </div>
                    </div>
                `;
            } else if (tabId === 'pactos') {
                badgeEl.innerText = 'OBJ-MESA-02 • PACTOS & ESTATUTO';
                titleEl.innerHTML = '<span>📜</span> Libro de Pactos & Consolidado Formal de la Organización';
                bodyEl.innerHTML = `
                    <div class="space-y-4 text-xs font-sans">
                        <div class="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <span class="font-mono text-teal-400 font-bold uppercase text-[10px] block">Marco Legal & Jurídico Vecinal</span>
                                <h4 class="text-white font-bold text-sm">Pacto de Servidumbre Recíproca & Faja Cortafuegos 45m</h4>
                                <p class="text-slate-300 text-xs mt-0.5">Estatuto consolidado con personería jurídica comunitaria de la Ley 19.418 de Juntas de Vecinos.</p>
                            </div>
                            <div class="flex items-center gap-2 shrink-0 font-mono">
                                <span class="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold text-[10px]">90% Adhesión (9/10)</span>
                            </div>
                        </div>

                        <!-- 3 Pilares del Consolidado Formal -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono">
                            <div class="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                                <span class="text-teal-400 font-bold text-[11px] block">Cláusula 1: Faja 45m</span>
                                <p class="text-slate-300 text-xs font-sans leading-snug">
                                    22.5m limpios de combustible a cada lado del límite predial. Prohibición de rebrote de pino en la franja.
                                </p>
                            </div>
                            <div class="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                                <span class="text-sky-400 font-bold text-[11px] block">Cláusula 2: Aforo & Cánones</span>
                                <p class="text-slate-300 text-xs font-sans leading-snug">
                                    Respeto irrestricto de turnos fijados en asamblea. Monitoreo telemétrico mutuo con sensores de ultrasonido.
                                </p>
                            </div>
                            <div class="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                                <span class="text-emerald-400 font-bold text-[11px] block">Cláusula 3: Fondo Solidario</span>
                                <p class="text-slate-300 text-xs font-sans leading-snug">
                                    Fondo común para adquisición de mangueras de 1.5", motobombas y repuestos de compuertas automáticas.
                                </p>
                            </div>
                        </div>

                        <!-- Estado de Firmas por Predio -->
                        <div class="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2 font-mono text-[11px]">
                            <div class="flex items-center justify-between text-slate-400 font-bold">
                                <span>Adhesión Notarial por Predio Vecinal (508 ha totales):</span>
                                <span class="text-emerald-400">9 Firmados • 1 En Trámite</span>
                            </div>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-slate-300">
                                <div>✅ Fundo Meniel (Rol 142-88)</div>
                                <div>✅ Forestal Los Pinos (Rol 143-05)</div>
                                <div>✅ Viña Santa Elena (Rol 142-30)</div>
                                <div>✅ Agrícola San José (Rol 142-12)</div>
                                <div>✅ Reserva Esclerófila (Rol 144-01)</div>
                                <div>✅ Agrícola El Roble (Rol 142-55)</div>
                                <div>✅ Fundo San Luis (Rol 143-18)</div>
                                <div>✅ Criadero Copihue (Rol 142-77)</div>
                                <div>✅ Hda. Quilaimo (Rol 143-44)</div>
                                <div class="text-amber-400">⏳ Parcela Don Tomás (Rol 142-99)</div>
                            </div>
                        </div>

                        <div class="pt-1 flex items-center justify-between gap-3">
                            <button onclick="downloadFormalAgreements()" class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black font-mono text-xs shadow-lg transition-all cursor-pointer">
                                📜 Descargar Convenio Notariado Completo (.txt)
                            </button>
                            <button onclick="closeMesaHotspotModal()" class="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono cursor-pointer">
                                Cerrar
                            </button>
                        </div>
                    </div>
                `;
            } else if (tabId === 'balanza') {
                badgeEl.innerText = 'OBJ-MESA-04 • BALANZA DE VOTOS DAO';
                titleEl.innerHTML = '<span>⚖️</span> Sistema de Votación & Gobernanza DAO (Cálculo Cuadrático C = V²)';
                bodyEl.innerHTML = `
                    <div class="space-y-4 text-xs font-mono">
                        <div class="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-1 font-sans">
                            <div class="flex items-center justify-between font-mono text-[11px]">
                                <span class="text-indigo-300 font-bold">Voice Credits por Predio: 100</span>
                                <span id="daoCreditsLeft" class="text-emerald-400 font-bold">100 Restantes</span>
                            </div>
                            <p class="text-slate-300 text-xs">
                                <b>Principio de Voto Cuadrático:</b> Para emitir <b>V</b> votos sobre un tema sensible, gastas <b>C = V²</b> créditos. Esto impide que mayorías acaparen decisiones y permite a predios afectados expresar alta intensidad de preferencia.
                            </p>
                        </div>

                        <!-- 3 Mociones en Votación Activa -->
                        <div class="space-y-3 font-mono">
                            <div class="p-3 rounded-xl bg-black/45 border border-white/10 space-y-1.5">
                                <div class="flex justify-between items-center text-slate-200">
                                    <span class="font-bold">Moción 1: Adquisición de Chipeadora Comunitaria (Faja 45m)</span>
                                    <span id="m1-votes" class="text-emerald-400 font-bold">0 Votos (0 C)</span>
                                </div>
                                <input type="range" min="0" max="10" value="0" id="m1-slider" oninput="calcMesaQuadraticVotes()" class="w-full accent-emerald-500 cursor-pointer">
                                <div class="flex justify-between text-[10px] text-slate-500">
                                    <span>Prioridad baja (0V = 0C)</span>
                                    <span>Prioridad moderada (5V = 25C)</span>
                                    <span>Prioridad máxima (10V = 100C)</span>
                                </div>
                            </div>

                            <div class="p-3 rounded-xl bg-black/45 border border-white/10 space-y-1.5">
                                <div class="flex justify-between items-center text-slate-200">
                                    <span class="font-bold">Moción 2: Compuerta Automática en Bocatoma Río Longaví</span>
                                    <span id="m2-votes" class="text-sky-400 font-bold">0 Votos (0 C)</span>
                                </div>
                                <input type="range" min="0" max="10" value="0" id="m2-slider" oninput="calcMesaQuadraticVotes()" class="w-full accent-sky-500 cursor-pointer">
                                <div class="flex justify-between text-[10px] text-slate-500">
                                    <span>0V (0 C)</span>
                                    <span>5V (25 C)</span>
                                    <span>10V (100 C)</span>
                                </div>
                            </div>

                            <div class="p-3 rounded-xl bg-black/45 border border-white/10 space-y-1.5">
                                <div class="flex justify-between items-center text-slate-200">
                                    <span class="font-bold">Moción 3: Repetidor LoRaWAN de Telemetría Vecinal en Cerro</span>
                                    <span id="m3-votes" class="text-indigo-400 font-bold">0 Votos (0 C)</span>
                                </div>
                                <input type="range" min="0" max="10" value="0" id="m3-slider" oninput="calcMesaQuadraticVotes()" class="w-full accent-indigo-500 cursor-pointer">
                                <div class="flex justify-between text-[10px] text-slate-500">
                                    <span>0V (0 C)</span>
                                    <span>5V (25 C)</span>
                                    <span>10V (100 C)</span>
                                </div>
                            </div>
                        </div>

                        <div id="daoVoteSuccessFeedback" class="hidden p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-center font-bold">
                            ✅ Votos registrados en el smart contract Governor de la DAO Vecinal Maule Sur
                        </div>

                        <div class="pt-1 flex items-center justify-between gap-3">
                            <button onclick="submitMesaDaoVotes()" class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black font-mono text-xs shadow-lg transition-all cursor-pointer">
                                🗳️ Emitir Voto Vinculante en la Balanza DAO
                            </button>
                            <button onclick="closeMesaHotspotModal()" class="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono cursor-pointer">
                                Cerrar
                            </button>
                        </div>
                    </div>
                `;
            } else if (tabId === 'maletin') {
                badgeEl.innerText = 'OBJ-MESA-03 • MALETÍN METODOLÓGICO';
                titleEl.innerHTML = '<span>💼</span> Maletín de Metodologías: Diálogo & Extensión con Comunidades Rurales';
                bodyEl.innerHTML = `
                    <div class="space-y-4 text-xs font-sans">
                        <div class="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900/60 border border-amber-500/30 space-y-1">
                            <div class="flex items-center justify-between font-mono text-[11px]">
                                <span class="text-amber-300 font-bold">Caja de Herramientas para Ciencias Sociales & Extensión</span>
                                <span class="text-emerald-400">Validado en Terreno Maule Sur</span>
                            </div>
                            <p class="text-slate-300 text-xs leading-relaxed">
                                Marco metodológico riguroso para sociólogos, antropólogos, agrónomos y trabajadores sociales que facilitan acuerdos entre predios agrícolas, parceleros y comités de agua:
                            </p>
                        </div>

                        <!-- 4 Módulos Metodológicos Prácticos -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                            <!-- Módulo 1: DRP -->
                            <div class="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2 hover:border-amber-500/40 transition-all">
                                <div class="flex items-center gap-2">
                                    <span class="text-base">🗺️</span>
                                    <h5 class="text-white font-bold text-xs">1. DRP: Diagnóstico Rural Participativo</h5>
                                </div>
                                <ul class="text-[11px] text-slate-300 space-y-1 font-sans list-disc list-inside">
                                    <li><b>Transecto de Cuenca:</b> Caminata conjunta a lo largo del canal con regantes antiguos y nuevos.</li>
                                    <li><b>Línea de Tiempo Local:</b> Registro de sequías históricas (1968, 1998, 2019) e incendios críticos.</li>
                                    <li><b>Diagrama de Venn Institucional:</b> Mapeo de relación con DGA, INDAP, APR y Bomberos.</li>
                                </ul>
                            </div>

                            <!-- Módulo 2: Matriz de Conflictos -->
                            <div class="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2 hover:border-amber-500/40 transition-all">
                                <div class="flex items-center gap-2">
                                    <span class="text-base">⚖️</span>
                                    <h5 class="text-white font-bold text-xs">2. Mediación & Matriz de Conflictos</h5>
                                </div>
                                <ul class="text-[11px] text-slate-300 space-y-1 font-sans list-disc list-inside">
                                    <li><b>Deslinde y Ramas:</b> Manejo de sombras y raíces en cercos limítrofes entre viñas y pinos.</li>
                                    <li><b>Robo de Caudal vs Fugas:</b> Calibración técnica con aforo antes de imputar disputas legales.</li>
                                    <li><b>Servidumbres de Tránsito:</b> Paso de maquinaria de cosecha y ensanchamiento de fajas.</li>
                                </ul>
                            </div>

                            <!-- Módulo 3: Sociograma de Aguas -->
                            <div class="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2 hover:border-amber-500/40 transition-all">
                                <div class="flex items-center gap-2">
                                    <span class="text-base">👥</span>
                                    <h5 class="text-white font-bold text-xs">3. Mapeo de Actores & Redes de Poder</h5>
                                </div>
                                <ul class="text-[11px] text-slate-300 space-y-1 font-sans list-disc list-inside">
                                    <li><b>Líderes Naturales:</b> Jueces de río tradicionales, celadores y presidentes de APR.</li>
                                    <li><b>Asimetría de Información:</b> Nivelar brecha entre grandes exportadoras y parcelas de 5 ha.</li>
                                    <li><b>Espacios de Confianza:</b> Asambleas en terreno (galpón o tranque) vs reuniones municipales.</li>
                                </ul>
                            </div>

                            <!-- Módulo 4: Acuerdos Consensuados -->
                            <div class="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2 hover:border-amber-500/40 transition-all">
                                <div class="flex items-center gap-2">
                                    <span class="text-base">📜</span>
                                    <h5 class="text-white font-bold text-xs">4. Protocolo de Acuerdos Vinculantes</h5>
                                </div>
                                <ul class="text-[11px] text-slate-300 space-y-1 font-sans list-disc list-inside">
                                    <li><b>Acta en Lenguaje Claro:</b> Redacción sin jerga jurídica incomprensible pero con validez legal.</li>
                                    <li><b>Cláusula de Revisión:</b> Re-evaluación a 90 días en asamblea con aforos medidos.</li>
                                    <li><b>Mecanismo de Salida Pacífica:</b> Arbitraje comunal antes de escalamiento a tribunales ordinarios.</li>
                                </ul>
                            </div>
                        </div>

                        <div class="pt-1 flex items-center justify-between gap-3">
                            <button onclick="downloadFormalAgreements()" class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black font-mono text-xs shadow-lg transition-all cursor-pointer">
                                📥 Descargar Guía de Facilitación Rural DRP (.txt)
                            </button>
                            <button onclick="closeMesaHotspotModal()" class="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono cursor-pointer">
                                Cerrar
                            </button>
                        </div>
                    </div>
                `;
            }
        }

        function calcMesaQuadraticVotes() {
            const m1 = parseInt(document.getElementById('m1-slider')?.value || 0);
            const m2 = parseInt(document.getElementById('m2-slider')?.value || 0);
            const m3 = parseInt(document.getElementById('m3-slider')?.value || 0);

            const c1 = m1 * m1;
            const c2 = m2 * m2;
            const c3 = m3 * m3;
            const totalCost = c1 + c2 + c3;
            const left = Math.max(0, 100 - totalCost);

            const el1 = document.getElementById('m1-votes');
            const el2 = document.getElementById('m2-votes');
            const el3 = document.getElementById('m3-votes');
            const elLeft = document.getElementById('daoCreditsLeft');

            if (el1) el1.innerText = `${m1} Votos (${c1} C)`;
            if (el2) el2.innerText = `${m2} Votos (${c2} C)`;
            if (el3) el3.innerText = `${m3} Votos (${c3} C)`;
            if (elLeft) {
                elLeft.innerText = `${left} Restantes`;
                elLeft.style.color = (totalCost > 100) ? '#ef4444' : '#34d399';
            }
        }

        function submitMesaDaoVotes() {
            playDiegeticAudio('bell');
            const fb = document.getElementById('daoVoteSuccessFeedback');
            if (fb) fb.classList.remove('hidden');
        }

        function dispatchVhfAlert() {
            playDiegeticAudio('alert');
            const status = document.getElementById('vhfAlertStatus');
            if (status) status.classList.remove('hidden');
        }

        // ═══════════════════════════════════════════════════════════════════
        // CONTROLADOR DEL PANAL INTERACTIVO INTEGRADO EN EL MODAL (11 HEXÁGONOS)
        // ═══════════════════════════════════════════════════════════════════
        let modalPanalActiveFilter = 'all';
        let modalPanalActiveHexId = 'MENIEL_HOGAR';

        function filterMesaModalPanalFluxes(category) {
            modalPanalActiveFilter = category;
            const btnIds = ['all', 'water', 'energy', 'biomass', 'agriculture'];
            btnIds.forEach(id => {
                const btn = document.getElementById(`modalFlux-${id}`);
                if (!btn) return;
                if (id === category) {
                    btn.className = 'modal-flux-btn active px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold border border-amber-400 cursor-pointer shadow-sm';
                } else {
                    let textColor = 'text-slate-400';
                    let borderColor = 'border-white/10';
                    if (id === 'water') { textColor = 'text-sky-300'; borderColor = 'border-sky-500/30'; }
                    if (id === 'energy') { textColor = 'text-amber-300'; borderColor = 'border-amber-500/30'; }
                    if (id === 'biomass') { textColor = 'text-emerald-300'; borderColor = 'border-emerald-500/30'; }
                    if (id === 'agriculture') { textColor = 'text-rose-300'; borderColor = 'border-rose-500/30'; }
                    btn.className = `modal-flux-btn px-2.5 py-1 rounded-lg bg-black/50 ${textColor} border ${borderColor} hover:bg-white/10 cursor-pointer`;
                }
            });
            renderModalPanalSvg();
        }

        function selectModalPanalHex(hexId) {
            if (typeof playDiegeticAudio === 'function') playDiegeticAudio('click');
            modalPanalActiveHexId = hexId;
            renderModalPanalSvg();
            updateModalPanalDetail(hexId);
        }

        function updateModalPanalDetail(hexId) {
            const dataPool = (typeof PANAL_DATA !== 'undefined') ? PANAL_DATA : null;
            if (!dataPool || !dataPool[hexId]) return;
            const node = dataPool[hexId];

            const badgeEl = document.getElementById('mPnlBadge');
            const ownerEl = document.getElementById('mPnlOwner');
            const iconEl = document.getElementById('mPnlIcon');
            const titleEl = document.getElementById('mPnlTitle');
            const subEl = document.getElementById('mPnlSub');

            if (badgeEl) {
                badgeEl.textContent = node.badge || (node.isMenielCore ? 'NÚCLEO MENIEL' : 'PREDIO VECINO');
                badgeEl.className = node.isMenielCore 
                    ? 'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/40'
                    : 'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40';
            }
            if (ownerEl) ownerEl.textContent = node.owner || 'Comunidad Vecinal';
            if (iconEl) iconEl.textContent = node.icon || '🏡';
            if (titleEl) titleEl.textContent = node.title || hexId;
            if (subEl) subEl.textContent = node.category || '';

            const setStat = (num, statObj) => {
                const lEl = document.getElementById(`mPnlStatL${num}`);
                const vEl = document.getElementById(`mPnlStatV${num}`);
                if (lEl && statObj) lEl.textContent = statObj.label + ':';
                if (vEl && statObj) vEl.textContent = statObj.val;
            };
            if (node.stat1) setStat(1, node.stat1);
            if (node.stat2) setStat(2, node.stat2);
            if (node.stat3) setStat(3, node.stat3);
            if (node.stat4) setStat(4, node.stat4);

            const descEl = document.getElementById('mPnlDesc');
            if (descEl) descEl.textContent = node.description || '';

            const fluxListEl = document.getElementById('mPnlFluxList');
            if (fluxListEl) {
                let html = '';
                if (node.inputs && node.inputs.length > 0) {
                    html += '<div class="space-y-1"><span class="text-[10px] text-sky-400 font-bold">📥 Entradas / Consumos:</span>';
                    node.inputs.forEach(inp => {
                        html += `<div class="p-1.5 rounded-lg bg-sky-950/30 border border-sky-500/20 text-[10px] flex items-center justify-between">
                            <span>${inp.item}</span>
                            <span class="text-sky-300 font-mono text-[9px]">${inp.rate} • De ${inp.from}</span>
                        </div>`;
                    });
                    html += '</div>';
                }
                if (node.outputs && node.outputs.length > 0) {
                    html += '<div class="space-y-1 mt-1.5"><span class="text-[10px] text-emerald-400 font-bold">📤 Salidas / Aportes:</span>';
                    node.outputs.forEach(out => {
                        html += `<div class="p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[10px] flex items-center justify-between">
                            <span>${out.item}</span>
                            <span class="text-emerald-300 font-mono text-[9px]">${out.rate} • Hacia ${out.to}</span>
                        </div>`;
                    });
                    html += '</div>';
                }
                if (!html) {
                    html = '<div class="text-[10px] text-slate-500 italic">Sin flujos registrados directamente para este nodo.</div>';
                }
                fluxListEl.innerHTML = html;
            }
        }

        function renderModalPanalSvg() {
            const svg = document.getElementById('modalPanalSvg');
            if (!svg) return;

            const bgGridGroup = document.getElementById('modalPanalBgGrid');
            const fluxesGroup = document.getElementById('modalPanalFluxesGroup');
            const haloGroup = document.getElementById('modalPanalHaloGroup');
            const hexesGroup = document.getElementById('modalPanalHexesGroup');
            const labelsGroup = document.getElementById('modalPanalLabelsGroup');

            if (!fluxesGroup || !haloGroup || !hexesGroup || !labelsGroup) return;

            if (bgGridGroup) bgGridGroup.innerHTML = '';
            fluxesGroup.innerHTML = '';
            haloGroup.innerHTML = '';
            hexesGroup.innerHTML = '';
            labelsGroup.innerHTML = '';

            const dataPool = (typeof PANAL_DATA !== 'undefined') ? PANAL_DATA : null;
            const fluxesPool = (typeof PANAL_FLUXES !== 'undefined') ? PANAL_FLUXES : [];
            if (!dataPool) return;

            const originX = 380;
            const originY = 270;
            const R = 54;

            function getModalCoords(q, r) {
                const stepX = Math.sqrt(3) * R;
                const stepY = 1.5 * R;
                const cx = originX + stepX * (q + r / 2.0);
                const cy = originY + stepY * r;
                return { cx, cy };
            }

            function getModalHexPoints(cx, cy, radius) {
                const pts = [];
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 180) * (30 + i * 60);
                    const x = cx + radius * Math.cos(angle);
                    const y = cy + radius * Math.sin(angle);
                    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
                }
                return pts.join(' ');
            }

            const nodeCoords = {};
            Object.values(dataPool).forEach(node => {
                nodeCoords[node.id] = getModalCoords(node.q, node.r);
            });

            // 1. DIBUJAR LÍNEAS DE FLUJO
            fluxesPool.forEach(flux => {
                if (modalPanalActiveFilter !== 'all' && flux.category !== modalPanalActiveFilter) return;

                const c1 = nodeCoords[flux.from];
                const c2 = nodeCoords[flux.to];
                if (!c1 || !c2) return;

                const dx = c2.cx - c1.cx;
                const dy = c2.cy - c1.cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const nx = -dy / dist;
                const ny = dx / dist;
                const offset = 22;
                const mx = (c1.cx + c2.cx) / 2 + nx * offset;
                const my = (c1.cy + c2.cy) / 2 + ny * offset;

                const pathD = `M ${c1.cx.toFixed(1)} ${c1.cy.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${c2.cx.toFixed(1)} ${c2.cy.toFixed(1)}`;

                const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                pathEl.setAttribute('d', pathD);
                pathEl.setAttribute('stroke', flux.color);
                pathEl.setAttribute('stroke-width', flux.strokeWidth || 3);
                pathEl.setAttribute('fill', 'none');
                pathEl.setAttribute('stroke-linecap', 'round');
                pathEl.setAttribute('stroke-dasharray', '8, 6');
                pathEl.setAttribute('class', 'panal-flux-line cursor-pointer');

                const mKey = flux.marker ? ('m' + flux.marker.charAt(0).toUpperCase() + flux.marker.slice(1)) : 'mArrowWater';
                pathEl.setAttribute('marker-end', `url(#${mKey})`);
                pathEl.style.animation = 'panalFluxPulse 1.4s linear infinite';

                pathEl.addEventListener('click', () => {
                    selectModalPanalHex(flux.from);
                });

                fluxesGroup.appendChild(pathEl);
            });

            // 2. HALO ROJO NÚCLEO MENIEL
            if (nodeCoords['MENIEL_HOGAR'] && nodeCoords['MENIEL_AGRICULTURA'] && nodeCoords['MENIEL_MADERA'] && nodeCoords['MENIEL_AGUA']) {
                const menielMidX = (nodeCoords['MENIEL_HOGAR'].cx + nodeCoords['MENIEL_AGRICULTURA'].cx) / 2;
                const menielMidY = (nodeCoords['MENIEL_MADERA'].cy + nodeCoords['MENIEL_AGUA'].cy) / 2;

                const haloBorder = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                haloBorder.setAttribute('cx', menielMidX);
                haloBorder.setAttribute('cy', menielMidY);
                haloBorder.setAttribute('r', R * 2.3);
                haloBorder.setAttribute('fill', 'none');
                haloBorder.setAttribute('stroke', '#ef4444');
                haloBorder.setAttribute('stroke-width', '3');
                haloBorder.setAttribute('stroke-dasharray', '12, 6');
                haloBorder.setAttribute('filter', 'url(#mRedHaloGlow)');
                haloBorder.setAttribute('opacity', '0.85');
                haloGroup.appendChild(haloBorder);

                const badgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                badgeGroup.setAttribute('transform', `translate(${menielMidX}, ${nodeCoords['MENIEL_MADERA'].cy - 68})`);
                badgeGroup.innerHTML = `
                    <rect x="-140" y="-12" width="280" height="24" rx="12" fill="#450a0a" stroke="#ef4444" stroke-width="1.5" filter="url(#mRedHaloGlow)"/>
                    <text x="0" y="4" text-anchor="middle" fill="#fecaca" font-size="10" font-family="monospace" font-weight="900" letter-spacing="1">
                        🛡️ NÚCLEO MENIEL (PROPIETARIO AL CENTRO)
                    </text>
                `;
                haloGroup.appendChild(badgeGroup);
            }

            // 3. DIBUJAR LOS 11 HEXÁGONOS
            Object.values(dataPool).forEach(node => {
                const c = nodeCoords[node.id];
                if (!c) return;

                const pts = getModalHexPoints(c.cx, c.cy, R);
                const isSelected = (node.id === modalPanalActiveHexId);

                const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                g.setAttribute('class', `modal-panal-hex ${node.isMenielCore ? 'panal-hex-meniel' : ''} ${isSelected ? 'active-node' : ''}`);
                g.setAttribute('data-id', node.id);
                g.style.cursor = 'pointer';

                // ClipPath
                const clipId = `mclip_hex_${node.id}`;
                const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
                clip.setAttribute('id', clipId);
                const clipPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                clipPoly.setAttribute('points', pts);
                clip.appendChild(clipPoly);
                g.appendChild(clip);

                // Imagen Catán
                const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                img.setAttribute('href', node.catanTile || 'assets/catan/tile_pasture.jpg');
                img.setAttribute('x', c.cx - R);
                img.setAttribute('y', c.cy - R);
                img.setAttribute('width', R * 2);
                img.setAttribute('height', R * 2);
                img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
                img.setAttribute('clip-path', `url(#${clipId})`);
                g.appendChild(img);

                // Bisel
                const borderPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                borderPoly.setAttribute('points', pts);
                borderPoly.setAttribute('fill', 'none');
                let strokeColor = isSelected ? '#d97706' : (node.isMenielCore ? '#dc2626' : '#b49f82');
                let strokeW = isSelected ? '4' : (node.isMenielCore ? '3.5' : '2.2');
                let filterAttr = isSelected ? 'url(#mGoldSelectGlow)' : (node.isMenielCore ? 'url(#mRedHaloGlow)' : '');
                borderPoly.setAttribute('stroke', strokeColor);
                borderPoly.setAttribute('stroke-width', strokeW);
                if (filterAttr) borderPoly.setAttribute('filter', filterAttr);
                g.appendChild(borderPoly);

                // Chit Token
                const chitCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                chitCircle.setAttribute('cx', c.cx);
                chitCircle.setAttribute('cy', c.cy - 12);
                chitCircle.setAttribute('r', '15');
                chitCircle.setAttribute('fill', '#FFFDF5');
                chitCircle.setAttribute('stroke', node.isMenielCore ? '#dc2626' : '#8B5A2B');
                chitCircle.setAttribute('stroke-width', node.isMenielCore ? '2.5' : '1.8');
                chitCircle.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))');
                g.appendChild(chitCircle);

                const iconText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                iconText.setAttribute('x', c.cx);
                iconText.setAttribute('y', c.cy - 7);
                iconText.setAttribute('text-anchor', 'middle');
                iconText.setAttribute('font-size', '13');
                iconText.textContent = node.icon || '🏡';
                g.appendChild(iconText);

                // Pergamino título
                const bannerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bannerRect.setAttribute('x', c.cx - 38);
                bannerRect.setAttribute('y', c.cy + 9);
                bannerRect.setAttribute('width', '76');
                bannerRect.setAttribute('height', '18');
                bannerRect.setAttribute('rx', '9');
                bannerRect.setAttribute('fill', 'rgba(255, 253, 245, 0.96)');
                bannerRect.setAttribute('stroke', '#C7B9A2');
                bannerRect.setAttribute('stroke-width', '1.2');
                bannerRect.setAttribute('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))');
                g.appendChild(bannerRect);

                const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                titleText.setAttribute('x', c.cx);
                titleText.setAttribute('y', c.cy + 22);
                titleText.setAttribute('text-anchor', 'middle');
                titleText.setAttribute('fill', '#1C1917');
                titleText.setAttribute('font-size', '8.5');
                titleText.setAttribute('font-family', "'Plus Jakarta Sans', sans-serif");
                titleText.setAttribute('font-weight', '800');
                const shortTitle = (node.title || '').split(' ')[0] + ((node.title || '').split(' ')[1] ? ' ' + (node.title || '').split(' ')[1] : '');
                titleText.textContent = shortTitle;
                g.appendChild(titleText);

                // Mini-Pill Métrica
                const metricPill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                metricPill.setAttribute('x', c.cx - 30);
                metricPill.setAttribute('y', c.cy + 30);
                metricPill.setAttribute('width', '60');
                metricPill.setAttribute('height', '13');
                metricPill.setAttribute('rx', '6.5');
                metricPill.setAttribute('fill', '#FAF5ED');
                metricPill.setAttribute('stroke', '#D9C5A8');
                metricPill.setAttribute('stroke-width', '0.8');
                g.appendChild(metricPill);

                const metricText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                metricText.setAttribute('x', c.cx);
                metricText.setAttribute('y', c.cy + 39.5);
                metricText.setAttribute('text-anchor', 'middle');
                metricText.setAttribute('fill', '#78350F');
                metricText.setAttribute('font-size', '7.5');
                metricText.setAttribute('font-family', 'monospace');
                metricText.setAttribute('font-weight', 'bold');
                metricText.textContent = node.metricPrimary || '';
                g.appendChild(metricText);

                // Clic en hexágono
                g.addEventListener('click', () => {
                    selectModalPanalHex(node.id);
                });

                hexesGroup.appendChild(g);
            });

            // Actualizar detalle del hexágono activo
            updateModalPanalDetail(modalPanalActiveHexId);
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeCerroHotspotModal();
                closeMesaHotspotModal();
            }
        });

        // ═══════════════════════════════════════════════════════════════════
        // LENTES ANALÍTICOS TRANSVERSALES (UNIVERSAL DATA LENSES)
        // ═══════════════════════════════════════════════════════════════════
        let currentUniversalLens = 'all';

        function setUniversalLens(lensId) {
            currentUniversalLens = lensId;

            // Actualizar botones visuales
            document.querySelectorAll('.lens-pill').forEach(btn => {
                btn.className = 'lens-pill px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/10 border border-transparent transition-all flex items-center gap-1.5 cursor-pointer';
            });
            const activeBtn = document.getElementById('lensBtn-' + lensId);
            if (activeBtn) {
                if (lensId === 'water') {
                    activeBtn.className = 'lens-pill px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/25 text-sky-300 border border-sky-500/40 shadow-lg flex items-center gap-1.5 cursor-pointer';
                } else if (lensId === 'fire') {
                    activeBtn.className = 'lens-pill px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-lg flex items-center gap-1.5 cursor-pointer';
                } else if (lensId === 'carbon') {
                    activeBtn.className = 'lens-pill px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-lg flex items-center gap-1.5 cursor-pointer';
                } else if (lensId === 'governance') {
                    activeBtn.className = 'lens-pill px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-lg flex items-center gap-1.5 cursor-pointer';
                } else {
                    activeBtn.className = 'lens-pill px-3 py-1.5 rounded-xl text-xs font-bold bg-white/20 text-white border border-white/30 shadow-lg flex items-center gap-1.5 cursor-pointer';
                }
            }

            // Reacción en la vista activa
            if (currentMasterView === 'territory') {
                if (lensId === 'water') selectSidebarTab('tab-water');
                else if (lensId === 'fire') selectSidebarTab('tab-windy');
                else if (lensId === 'carbon') selectSidebarTab('tab-territory');
                else if (lensId === 'governance') selectSidebarTab('tab-territory');
            } else if (currentMasterView === 'cerro') {
                if (lensId === 'water') openCerroHotspotModal('hidro');
                else if (lensId === 'fire') openCerroHotspotModal('clima');
                else if (lensId === 'carbon') openCerroHotspotModal('drone');
                else if (lensId === 'governance') openCerroHotspotModal('obras');
            } else if (currentMasterView === 'mesa') {
                if (lensId === 'water') openMesaHotspotModal('maletin');
                else if (lensId === 'fire') openMesaHotspotModal('pacto');
                else if (lensId === 'governance') openMesaHotspotModal('dao');
                else if (lensId === 'carbon') openMesaHotspotModal('pizarra');
            } else if (currentMasterView === 'dashboard') {
                const searchInput = document.getElementById('cockpitSearch');
                if (searchInput) {
                    if (lensId === 'water') filterCockpitTable('L/s');
                    else if (lensId === 'fire') filterCockpitTable('45m');
                    else filterCockpitTable('');
                }
            }

            // Notificar al iframe de predio si está montado
            try {
                const iframe = document.querySelector('#view-galpon iframe');
                if (iframe && iframe.contentWindow) {
                    let rMode = 'none';
                    if (lensId === 'water') rMode = 'water';
                    else if (lensId === 'fire') rMode = 'fire';
                    else if (lensId === 'carbon') rMode = 'ndvi';
                }
            } catch (_) {}
        }

        // ═══════════════════════════════════════════════════════════════════
        // CONTROLADOR DE SUB-TABS DEL PANEL DE ADMINISTRADOR UNIFICADO
        // ═══════════════════════════════════════════════════════════════════
        function switchAdminTab(tabId) {
            const tabs = ['cockpit', 'advisors', 'ecosystem', 'informes', 'canva'];
            tabs.forEach(t => {
                const btn = document.getElementById('adminTabBtn-' + t);
                const content = document.getElementById('adminTabContent-' + t);
                if (btn) {
                    if (t === tabId) {
                        btn.className = 'admin-tab-btn active px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer bg-amber-600 text-white shadow-sm';
                    } else {
                        btn.className = 'admin-tab-btn px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 flex items-center gap-2 transition-all cursor-pointer';
                    }
                }
                if (content) {
                    content.style.display = (t === tabId) ? 'block' : 'none';
                }
            });

            // Sincronizar el botón activo del menú superior si estamos en la vista dashboard
            if (currentMasterView === 'dashboard') {
                document.querySelectorAll('.master-nav-btn').forEach(b => b.classList.remove('active-nav'));
                if (tabId === 'advisors' || tabId === 'ecosystem' || tabId === 'cockpit' || tabId === 'informes') {
                    document.getElementById('navBtn-datos')?.classList.add('active-nav');
                }
            }

            if (tabId === 'canva') {
                renderCanvaReport();
            } else if (tabId === 'advisors') {
                initAdvisorsSuite();
            } else if (tabId === 'ecosystem') {
                if (typeof renderEcosystemServicesTable === 'function') {
                    renderEcosystemServicesTable(currentEcoFilter || 'all');
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // CANVA REPORT STUDIO • ENSAMBLADOR DE INFORMES MODULARES EN VIVO
        // ═══════════════════════════════════════════════════════════════════
        const CANVA_STUDIO_STATE = {
            selectedTools: new Set(['cover', 'catastro', 'water', 'fire', 'apr', 'decree']),
            customBlocks: [],
            documentTitle: 'INFORME CONSOLIDADO DE GOBERNANZA & RESILIENCIA CUENCA MAULE SUR',
            documentSubtitle: 'Auditoría Biofísica, Catastral (508 ha) y Seguridad Hídrica Territorial',
            documentAuthor: 'Dirección de Operaciones AgriTwin • Región del Maule',
            documentNotes: 'El presente instrumento compila la telemetría en tiempo real de la Red Centinela, los derechos de aprovechamiento de aguas suscritos en la Mesa de Vecinos y las obras de mitigación de borde de cara al ciclo estival.'
        };

        function toggleCanvaTool(toolId) {
            if (CANVA_STUDIO_STATE.selectedTools.has(toolId)) {
                CANVA_STUDIO_STATE.selectedTools.delete(toolId);
            } else {
                CANVA_STUDIO_STATE.selectedTools.add(toolId);
            }
            updateCanvaToolsUI();
            renderCanvaReport();
        }

        function applyCanvaPreset(presetKey) {
            if (presetKey === 'executive') {
                CANVA_STUDIO_STATE.selectedTools = new Set(['cover', 'catastro', 'water', 'fire', 'decree']);
            } else if (presetKey === 'water') {
                CANVA_STUDIO_STATE.selectedTools = new Set(['cover', 'water', 'apr', 'scripts', 'decree']);
            } else if (presetKey === 'fire') {
                CANVA_STUDIO_STATE.selectedTools = new Set(['cover', 'fire', 'obras', 'scripts', 'decree']);
            } else if (presetKey === 'mesa') {
                CANVA_STUDIO_STATE.selectedTools = new Set(['cover', 'catastro', 'governance', 'obras', 'decree']);
            } else if (presetKey === 'all') {
                CANVA_STUDIO_STATE.selectedTools = new Set(['cover', 'catastro', 'water', 'fire', 'apr', 'obras', 'scripts', 'governance', 'mrv', 'decree']);
            }
            updateCanvaToolsUI();
            renderCanvaReport();
        }

        function updateCanvaToolsUI() {
            const allTools = ['cover', 'catastro', 'water', 'fire', 'apr', 'obras', 'scripts', 'governance', 'mrv', 'decree'];
            let count = 0;
            allTools.forEach(t => {
                const card = document.getElementById('canvaToolCard-' + t);
                const chk = document.getElementById('chkTool-' + t);
                const isSel = CANVA_STUDIO_STATE.selectedTools.has(t);
                if (isSel) count++;
                if (card) {
                    if (isSel) {
                        card.classList.add('selected', 'border-indigo-500/40');
                        card.classList.remove('border-white/10');
                    } else {
                        card.classList.remove('selected', 'border-indigo-500/40');
                        card.classList.add('border-white/10');
                    }
                }
                if (chk) chk.checked = isSel;
            });
            const countBadge = document.getElementById('canvaSelectedCount');
            if (countBadge) countBadge.innerText = `${count} Activas`;
        }

        function renderCanvaReport() {
            const paper = document.getElementById('canvaReportPaper');
            if (!paper) return;

            let html = '';
            const tools = CANVA_STUDIO_STATE.selectedTools;
            const now = new Date();
            const dateStr = now.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });

            // 1. Tool Cover
            if (tools.has('cover')) {
                html += `
                <div class="border-b border-indigo-500/30 pb-6 space-y-3">
                    <div class="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span class="text-indigo-400 font-bold tracking-wider">AGRITWIN EXPEDIENTE OFICIAL • FOLIO #EXP-2026-089</span>
                        <span>Expedido: ${dateStr}</span>
                    </div>
                    <div class="space-y-1">
                        <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                            ${CANVA_STUDIO_STATE.documentTitle}
                        </h1>
                        <p class="text-sm text-indigo-300 font-mono">
                            ${CANVA_STUDIO_STATE.documentSubtitle}
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-slate-400 border-t border-white/5">
                        <div><strong>Autor:</strong> ${CANVA_STUDIO_STATE.documentAuthor}</div>
                        <div><strong>Macro-Cuenca:</strong> Maule Sur (122.070 ha)</div>
                        <div><strong>Hash SHA-256:</strong> <span class="text-emerald-400">a7f4c9...e82b</span></div>
                    </div>
                </div>`;
            }

            // 2. Tool Catastro
            if (tools.has('catastro')) {
                html += `
                <div class="p-5 rounded-xl bg-slate-900/60 border border-white/10 space-y-3">
                    <div class="flex items-center justify-between border-b border-white/10 pb-2">
                        <h3 class="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                            <span>🗺️</span> Mosaico Catastral Predial (508.0 ha • 10 Roles SII)
                        </h3>
                        <span class="text-[10px] font-mono text-emerald-400">100% Georreferenciado</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs font-mono">
                            <thead>
                                <tr class="text-slate-400 border-b border-white/5 pb-1">
                                    <th class="py-1.5">Rol SII</th>
                                    <th>Predio Rural</th>
                                    <th>Superficie</th>
                                    <th>Bioma Gemini</th>
                                    <th>Derechos Agua</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5 text-slate-300">
                                <tr><td class="py-1.5 text-emerald-400 font-bold">142-05</td><td>Fundo Meniel (Núcleo)</td><td>48.5 ha</td><td>Keyline & PRV</td><td>18.5 L/s (100%)</td></tr>
                                <tr><td class="py-1.5 text-slate-200">142-06</td><td>San José de las Lomas</td><td>62.0 ha</td><td>Arroz Inundado</td><td>24.0 L/s</td></tr>
                                <tr><td class="py-1.5 text-slate-200">142-07</td><td>Los Boldos Oriente</td><td>55.3 ha</td><td>Forestal Pino</td><td>12.0 L/s</td></tr>
                                <tr><td class="py-1.5 text-slate-200">142-08</td><td>Retiro Poniente</td><td>71.2 ha</td><td>Granos Dorados</td><td>28.5 L/s</td></tr>
                                <tr><td class="py-1.5 text-slate-200">142-09</td><td>La Montaña Alta</td><td>84.0 ha</td><td>Ladera Granítica</td><td>8.0 L/s</td></tr>
                                <tr><td class="py-1.5 text-slate-200">142-10</td><td>El Quillay</td><td>39.0 ha</td><td>Bosque Nativo</td><td>10.0 L/s</td></tr>
                                <tr><td class="py-1.5 text-slate-200">142-11</td><td>Quilaimo Sur</td><td>45.8 ha</td><td>Frutales Menores</td><td>15.0 L/s</td></tr>
                                <tr><td class="py-1.5 text-slate-200">142-12</td><td>Vega Larga</td><td>33.2 ha</td><td>Humedal & Pasto</td><td>14.0 L/s</td></tr>
                                <tr><td class="py-1.5 text-slate-200">142-13</td><td>Rincón de San Luis</td><td>38.0 ha</td><td>Viñedos Secano</td><td>9.5 L/s</td></tr>
                                <tr><td class="py-1.5 text-slate-200">142-14</td><td>Loma Colorada</td><td>31.0 ha</td><td>Pradera Apícola</td><td>7.5 L/s</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>`;
            }

            // 3. Tool Water
            if (tools.has('water')) {
                html += `
                <div class="p-5 rounded-xl bg-sky-950/20 border border-sky-500/30 space-y-3">
                    <div class="flex items-center justify-between border-b border-sky-500/20 pb-2">
                        <h3 class="text-sm font-bold text-sky-200 font-mono uppercase tracking-wider flex items-center gap-2">
                            <span>💧</span> Balance Hídrico & Capacidad de Amortiguación Cuenca
                        </h3>
                        <span class="text-xs font-mono text-sky-400 font-bold">18.500 m³ Almacenados</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div class="p-3 rounded-lg bg-black/40 border border-sky-500/20">
                            <div class="text-[10px] text-slate-400">Caudal Río Longaví</div>
                            <div class="text-lg font-bold text-sky-300">124.5 m³/s</div>
                            <div class="text-[9px] text-slate-500">Estación DGA La Quiriquina</div>
                        </div>
                        <div class="p-3 rounded-lg bg-black/40 border border-sky-500/20">
                            <div class="text-[10px] text-slate-400">Amortiguación Crecidas</div>
                            <div class="text-lg font-bold text-emerald-400">-22.4% Pico</div>
                            <div class="text-[9px] text-slate-500">Tranque Keyline Fundo Meniel</div>
                        </div>
                        <div class="p-3 rounded-lg bg-black/40 border border-sky-500/20">
                            <div class="text-[10px] text-slate-400">Autonomía Hídrica Estival</div>
                            <div class="text-lg font-bold text-indigo-300">48 Días</div>
                            <div class="text-[9px] text-slate-500">Demanda agregada: 147 L/s</div>
                        </div>
                    </div>
                </div>`;
            }

            // 4. Tool Fire
            if (tools.has('fire')) {
                html += `
                <div class="p-5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                    <div class="flex items-center justify-between border-b border-amber-500/20 pb-2">
                        <h3 class="text-sm font-bold text-amber-200 font-mono uppercase tracking-wider flex items-center gap-2">
                            <span>🔥</span> Piro-Resiliencia Canónica (Van Wagner 1987) & Viento Puelche
                        </h3>
                        <span class="text-xs font-mono text-amber-400 font-bold">FWI 24.0 (Nivel Bajo)</span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
                        <div class="p-2.5 rounded bg-black/40 border border-amber-500/20">
                            <div class="text-[10px] text-slate-400">Combustible Fino (FFMC)</div>
                            <div class="text-base font-bold text-amber-300">84.2</div>
                        </div>
                        <div class="p-2.5 rounded bg-black/40 border border-amber-500/20">
                            <div class="text-[10px] text-slate-400">Sequía de Suelo (DMC)</div>
                            <div class="text-base font-bold text-amber-300">32.0</div>
                        </div>
                        <div class="p-2.5 rounded bg-black/40 border border-amber-500/20">
                            <div class="text-[10px] text-slate-400">Capas Profundas (DC)</div>
                            <div class="text-base font-bold text-amber-300">195.0</div>
                        </div>
                        <div class="p-2.5 rounded bg-black/40 border border-amber-500/20">
                            <div class="text-[10px] text-slate-400">Vel. Propagación (ISI)</div>
                            <div class="text-base font-bold text-emerald-400">6.2 m/min</div>
                        </div>
                    </div>
                </div>`;
            }

            // 5. Tool APR
            if (tools.has('apr')) {
                html += `
                <div class="p-5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                    <div class="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                        <h3 class="text-sm font-bold text-cyan-200 font-mono uppercase tracking-wider flex items-center gap-2">
                            <span>🚰</span> Monitoreo Piezométrico de 5 Comités APR
                        </h3>
                        <span class="text-xs font-mono text-emerald-400">Abastecimiento Seguro (3.420 Familias)</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono text-center">
                        <div class="p-2.5 rounded bg-black/40 border border-cyan-500/20">
                            <div class="text-[10px] text-slate-400">APR Las Rosas</div>
                            <div class="text-sm font-bold text-cyan-300">-14.2 m</div>
                            <div class="text-[9px] text-emerald-400">🟢 Estable</div>
                        </div>
                        <div class="p-2.5 rounded bg-black/40 border border-cyan-500/20">
                            <div class="text-[10px] text-slate-400">APR La Quinta</div>
                            <div class="text-sm font-bold text-cyan-300">-18.6 m</div>
                            <div class="text-[9px] text-emerald-400">🟢 Estable</div>
                        </div>
                        <div class="p-2.5 rounded bg-black/40 border border-cyan-500/20">
                            <div class="text-[10px] text-slate-400">APR San José</div>
                            <div class="text-sm font-bold text-cyan-300">-11.0 m</div>
                            <div class="text-[9px] text-emerald-400">🟢 Óptimo</div>
                        </div>
                        <div class="p-2.5 rounded bg-black/40 border border-cyan-500/20">
                            <div class="text-[10px] text-slate-400">APR Retiro Sur</div>
                            <div class="text-sm font-bold text-cyan-300">-22.4 m</div>
                            <div class="text-[9px] text-amber-400">🟡 Monitoreo</div>
                        </div>
                        <div class="p-2.5 rounded bg-black/40 border border-cyan-500/20">
                            <div class="text-[10px] text-slate-400">APR Meniel Rural</div>
                            <div class="text-sm font-bold text-cyan-300">-9.8 m</div>
                            <div class="text-[9px] text-emerald-400">🟢 Recarga Keyline</div>
                        </div>
                    </div>
                </div>`;
            }

            // 6. Tool Obras
            if (tools.has('obras')) {
                html += `
                <div class="p-5 rounded-xl bg-slate-900/60 border border-white/10 space-y-3">
                    <h3 class="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                        <span>🛠️</span> Obras Comunitarias de Borde en Ejecución
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div class="p-3 rounded bg-black/40 border border-white/5 space-y-1">
                            <div class="font-bold text-amber-300">Faja Cortafuego 45m</div>
                            <div class="text-slate-400 text-[11px]">8.4 km de desbroce y pastoreo PRV ultra-denso en frontera forestal.</div>
                            <div class="text-emerald-400 text-[10px] pt-1">Avance: 85% • $12.5M CLP</div>
                        </div>
                        <div class="p-3 rounded bg-black/40 border border-white/5 space-y-1">
                            <div class="font-bold text-sky-300">Compuertas Telemétricas</div>
                            <div class="text-slate-400 text-[11px]">4 compuertas automatizadas con actuador solar y telemetría LoRaWAN.</div>
                            <div class="text-emerald-400 text-[10px] pt-1">Avance: 100% • $18.0M CLP</div>
                        </div>
                        <div class="p-3 rounded bg-black/40 border border-white/5 space-y-1">
                            <div class="font-bold text-emerald-300">Zanjas de Infiltración Keyline</div>
                            <div class="text-slate-400 text-[11px]">14.2 km de zanjas a nivel para sembrar agua en las laderas de Fundo Meniel.</div>
                            <div class="text-emerald-400 text-[10px] pt-1">Avance: 92% • $14.5M CLP</div>
                        </div>
                    </div>
                </div>`;
            }

            // 7. Tool Scripts
            if (tools.has('scripts')) {
                html += `
                <div class="p-5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                    <h3 class="text-sm font-bold text-purple-200 font-mono uppercase tracking-wider flex items-center gap-2 border-b border-purple-500/20 pb-2">
                        <span>⚡</span> Modelación Biofísica & Fórmulas Matemáticas Canónicas
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div class="p-3 rounded bg-black/40 border border-purple-500/20 space-y-1">
                            <div class="font-bold text-sky-300">Evapotranspiración FAO-56</div>
                            <div class="text-[10px] text-slate-400">ET₀ = [0.408Δ(Rn - G) + γ(900/(T+273))u₂(es - ea)] / [Δ + γ(1 + 0.34u₂)]</div>
                            <div class="text-slate-300 pt-1">Resultado: <strong class="text-sky-300">5.82 mm/día</strong> (Demanda hídrica máxima estival).</div>
                        </div>
                        <div class="p-3 rounded bg-black/40 border border-purple-500/20 space-y-1">
                            <div class="font-bold text-amber-300">Propagación Rothermel (1972)</div>
                            <div class="text-[10px] text-slate-400">R = [IR · ξ · (1 + Φw + Φs)] / [ρb · ε · Qig]</div>
                            <div class="text-slate-300 pt-1">Resultado: <strong class="text-amber-300">R = 0.42 m/s</strong> (Con viento Puelche de 45 km/h).</div>
                        </div>
                    </div>
                </div>`;
            }

            // 8. Tool Governance
            if (tools.has('governance')) {
                html += `
                <div class="p-5 rounded-xl bg-teal-950/20 border border-teal-500/30 space-y-3">
                    <h3 class="text-sm font-bold text-teal-200 font-mono uppercase tracking-wider flex items-center gap-2 border-b border-teal-500/20 pb-2">
                        <span>🤝</span> Gobernanza Vecinal & Votación Cuadrática (DAO Maule Sur)
                    </h3>
                    <p class="text-xs text-slate-300 leading-relaxed">
                        Mecanismo de gobernanza participativa donde el costo de voto es cuadrático: Costo = (Votos)². Se asignaron 100 créditos de voz a cada uno de los 10 predios participantes para priorizar el fondo comunal de mitigación ($45.000.000 CLP).
                    </p>
                    <div class="p-3 rounded bg-black/40 border border-teal-500/20 text-xs font-mono space-y-1">
                        <div class="flex justify-between text-slate-300"><span>1. Faja Cortafuegos 45m Compartida:</span><span class="text-emerald-400 font-bold">484 Votos Cuadráticos (42%)</span></div>
                        <div class="flex justify-between text-slate-300"><span>2. Tranque Keyline Comunitario:</span><span class="text-sky-400 font-bold">382 Votos Cuadráticos (33%)</span></div>
                        <div class="flex justify-between text-slate-300"><span>3. Telemetría de Napas para 5 APRs:</span><span class="text-indigo-400 font-bold">290 Votos Cuadráticos (25%)</span></div>
                    </div>
                </div>`;
            }

            // 9. Tool MRV
            if (tools.has('mrv')) {
                html += `
                <div class="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                    <h3 class="text-sm font-bold text-emerald-200 font-mono uppercase tracking-wider flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                        <span>🌿</span> Auditoría MRV (Monitoreo, Reporte y Verificación) & Carbono
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div class="p-3 rounded bg-black/40 border border-emerald-500/20">
                            <div class="text-[10px] text-slate-400">Captura de Carbono</div>
                            <div class="text-lg font-bold text-emerald-400">4.6 t CO₂e/ha/a</div>
                            <div class="text-[9px] text-slate-500">Manejo Holístico PRV</div>
                        </div>
                        <div class="p-3 rounded bg-black/40 border border-emerald-500/20">
                            <div class="text-[10px] text-slate-400">Materia Orgánica (0-30cm)</div>
                            <div class="text-lg font-bold text-emerald-300">+2.4% ΔMO</div>
                            <div class="text-[9px] text-slate-500">De 1.4% a 3.8% en 3 años</div>
                        </div>
                        <div class="p-3 rounded bg-black/40 border border-emerald-500/20">
                            <div class="text-[10px] text-slate-400">Certificación Cripto</div>
                            <div class="text-lg font-bold text-teal-300">2.336 t/año</div>
                            <div class="text-[9px] text-slate-500">Tokenizable en Verra/Gold Std</div>
                        </div>
                    </div>
                </div>`;
            }

            // 10. Tool Decree & Signatures
            if (tools.has('decree')) {
                html += `
                <div class="p-5 rounded-xl bg-slate-900/80 border border-indigo-500/40 space-y-4">
                    <div class="flex items-center justify-between border-b border-white/10 pb-2">
                        <h3 class="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                            <span>✍️</span> Certificación & Rúbricas Oficiales de Acuerdo
                        </h3>
                        <span class="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">Validez Jurídica Ley 19.799</span>
                    </div>
                    <p class="text-xs text-slate-300 leading-relaxed font-serif italic">
                        "${CANVA_STUDIO_STATE.documentNotes}"
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10 text-center">
                        <div class="space-y-1">
                            <div class="h-12 border-b border-dashed border-slate-600 flex items-end justify-center pb-1 text-xs font-serif italic text-emerald-400">
                                Alberto Meniel S.
                            </div>
                            <div class="text-xs font-bold text-white font-mono">Alberto Meniel S.</div>
                            <div class="text-[10px] text-slate-400">Presidente Junta de Vigilancia Río Longaví</div>
                        </div>
                        <div class="space-y-1">
                            <div class="h-12 border-b border-dashed border-slate-600 flex items-end justify-center pb-1 text-xs font-serif italic text-sky-400">
                                Ing. Rodrigo Valenzuela C.
                            </div>
                            <div class="text-xs font-bold text-white font-mono">Ing. Rodrigo Valenzuela</div>
                            <div class="text-[10px] text-slate-400">Director Regional DGA Maule</div>
                        </div>
                        <div class="space-y-1">
                            <div class="h-12 border-b border-dashed border-slate-600 flex items-end justify-center pb-1 text-xs font-mono text-amber-400">
                                [FIRMA CRIPTOGRÁFICA SHA-256]
                            </div>
                            <div class="text-xs font-bold text-white font-mono">AgriTwin Engine v2.4</div>
                            <div class="text-[10px] text-slate-400">Hash: 8f92a10b4c81...</div>
                        </div>
                    </div>
                </div>`;
            }

            // 11. Custom Figure Blocks & Live Script Tables
            if (CANVA_STUDIO_STATE.customBlocks && CANVA_STUDIO_STATE.customBlocks.length > 0) {
                html += `
                <div class="space-y-4 pt-4 border-t border-indigo-500/30">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-bold text-amber-300 font-mono uppercase tracking-wider flex items-center gap-2">
                            <span>📈</span> Figuras Analíticas & Tablas de Telemetría Agregadas (${CANVA_STUDIO_STATE.customBlocks.length})
                        </h3>
                        <button onclick="clearCustomCanvaBlocks()" class="text-[10px] font-mono text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800">
                            Vaciar Figuras
                        </button>
                    </div>`;
                
                CANVA_STUDIO_STATE.customBlocks.forEach((block, idx) => {
                    html += `
                    <div class="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-3 font-mono shadow-xl relative group">
                        <div class="flex items-center justify-between border-b border-white/10 pb-2">
                            <span class="text-xs font-bold text-amber-200 flex items-center gap-2">
                                <span>[Fig. ${idx + 1}]</span> ${block.title}
                            </span>
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] text-slate-400">${block.timestamp || ''}</span>
                                <button onclick="removeCustomCanvaBlock(${idx})" class="text-slate-400 hover:text-rose-400 text-xs px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10">✕</button>
                            </div>
                        </div>
                        <div class="overflow-x-auto text-xs text-slate-200">${block.content}</div>
                    </div>`;
                });

                html += `</div>`;
            }

            paper.innerHTML = html;
        }

        function copyCanvaMarkdown() {
            const paper = document.getElementById('canvaReportPaper');
            if (!paper) return;
            const text = paper.innerText;
            navigator.clipboard.writeText(text).then(() => {
                alert('✅ Informe copiado en formato texto / markdown al portapapeles.');
            }).catch(() => {
                alert('✅ Informe preparado para copia.');
            });
        }

        function exportCanvaJSON() {
            const exportData = {
                title: CANVA_STUDIO_STATE.documentTitle,
                subtitle: CANVA_STUDIO_STATE.documentSubtitle,
                author: CANVA_STUDIO_STATE.documentAuthor,
                selectedModules: Array.from(CANVA_STUDIO_STATE.selectedTools),
                basin: 'Macro-Cuenca Maule Sur (122.070 ha)',
                timestamp: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `informe_agritwin_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }

        window.addCustomCanvaBlock = function(title, contentHtml) {
            if (!CANVA_STUDIO_STATE.customBlocks) CANVA_STUDIO_STATE.customBlocks = [];
            CANVA_STUDIO_STATE.customBlocks.push({
                title: title,
                content: contentHtml,
                timestamp: new Date().toLocaleTimeString('es-CL')
            });
            renderCanvaReport();
            if (typeof showMasterToast === 'function') {
                showMasterToast(`📊 "${title}" añadida al Informe Canva Studio`);
            }
        };

        window.removeCustomCanvaBlock = function(index) {
            if (CANVA_STUDIO_STATE.customBlocks) {
                CANVA_STUDIO_STATE.customBlocks.splice(index, 1);
                renderCanvaReport();
            }
        };

        window.clearCustomCanvaBlocks = function() {
            if (confirm('¿Vaciar todas las figuras analíticas agregadas al informe?')) {
                CANVA_STUDIO_STATE.customBlocks = [];
                renderCanvaReport();
            }
        };

        window.transferScriptTableToCanva = function(title, snippetHtml) {
            window.addCustomCanvaBlock(title, snippetHtml);
            switchMasterView('dashboard');
            switchAdminTab('canva');
            setTimeout(() => {
                const el = document.getElementById('canvaReportPaper');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 150);
        };

        window.printReportDocument = function() {
            window.print();
        };

        // ═══════════════════════════════════════════════════════════════════
        // CONSOLA DE SCRIPTS BIOFÍSICOS & MRV (RUNNER MATEMÁTICO EN NAVEGADOR)
        // ═══════════════════════════════════════════════════════════════════
        window.filterAdminScripts = function(branch) {
            document.querySelectorAll('.admin-script-filter-btn').forEach(b => {
                b.classList.remove('bg-amber-600', 'text-white', 'shadow-sm');
                b.classList.add('text-stone-400', 'hover:text-white', 'bg-white/5');
            });
            const activeBtn = document.getElementById('scriptFilterBtn-' + branch);
            if (activeBtn) {
                activeBtn.classList.remove('text-stone-400', 'hover:text-white', 'bg-white/5');
                activeBtn.classList.add('bg-amber-600', 'text-white', 'shadow-sm');
            }
            document.querySelectorAll('.admin-script-card').forEach(card => {
                const cardBranch = card.getAttribute('data-branch') || 'all';
                if (branch === 'all' || cardBranch.includes(branch)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        };

        function runBioScript(scriptId) {
            const now = new Date().toLocaleTimeString();

            // 0. RAMA 1: PREDIO TWIN - PASTOREO RACIONAL VOISIN (PRV) & METABOLISMO DE CASA MENIELS
            if (scriptId === 'predio_prv') {
                const ugm = parseFloat(document.getElementById('scriptPrvUgm')?.value || 1.8);
                const restDays = parseInt(document.getElementById('scriptPrvRest')?.value || 38);
                const paddocksCount = parseInt(document.getElementById('scriptPrvPaddocks')?.value || 8);
                const areaHa = 12.8;
                const targetBiomass = parseFloat(document.getElementById('scriptPrvTargetBiomass')?.value || 2800);
                const solarKwh = 920;
                const aforoLs = 28.0;

                const ocupacionDias = Math.max(1, Math.round(restDays / (paddocksCount - 1)));
                const dailyConsumptionTotal = ugm * areaHa * 13.5;
                const totalBiomassAvailable = areaHa * targetBiomass;
                const autonomiaDias = Math.round(totalBiomassAvailable / (dailyConsumptionTotal || 1));
                const cargaInstantanea = Math.round(ugm * paddocksCount * 10) / 10;

                const paddocksData = [
                    { id: 'P1', name: 'Potrero 1 - Trébol Blanco & Festuca', rest: Math.min(restDays + 6, 44), alt: 24, ms: 2850, status: 'Listo para Pastoreo', species: 'Vacas Crianceras', badge: 'bg-emerald-500/20 text-emerald-300' },
                    { id: 'P2', name: 'Potrero 2 - Alfalfa & Raygrass Perenne', rest: Math.min(restDays + 3, 41), alt: 22, ms: 2600, status: 'Listo para Pastoreo', species: 'Siguiente Turno', badge: 'bg-emerald-500/20 text-emerald-300' },
                    { id: 'P3', name: 'Potrero 3 - Pastura Sur-Oeste (Núcleo)', rest: 1, alt: 25, ms: 3100, status: 'PASTOREO ACTIVO (Día 1)', species: 'Vacas (Carga Instantánea)', badge: 'bg-amber-500/30 text-amber-300 font-bold' },
                    { id: 'P4', name: 'Potrero 4 - Silvopastoreo Borde Cerezos', rest: 32, alt: 18, ms: 1950, status: 'Reposo Vegetativo (32d)', species: 'Ovejas en Espera', badge: 'bg-sky-500/20 text-sky-300' },
                    { id: 'P5', name: 'Potrero 5 - Trébol Subterráneo Húmedo', rest: 24, alt: 16, ms: 1750, status: 'Reposo Vegetativo (24d)', species: 'Ovejas', badge: 'bg-sky-500/20 text-sky-300' },
                    { id: 'P6', name: 'Potrero 6 - Pradera Regenerativa Este', rest: 16, alt: 12, ms: 1250, status: 'Rebrote Inicial (16d)', species: 'En Recuperación', badge: 'bg-slate-500/20 text-slate-300' },
                    { id: 'P7', name: 'Potrero 7 - Franja Sur (Keyline Inferior)', rest: 8, alt: 10, ms: 950, status: 'Rebrote Temprano (8d)', species: 'Caballos Libres', badge: 'bg-slate-500/20 text-slate-300' },
                    { id: 'P8', name: 'Potrero 8 - Cuadro Nor-Este (Caserío)', rest: 4, alt: 8, ms: 750, status: 'Gallinero Móvil (4d)', species: 'Aves de Postura', badge: 'bg-purple-500/20 text-purple-300' }
                ];

                let pRows = '';
                paddocksData.forEach(p => {
                    pRows += `
                    <tr class="hover:bg-white/5 transition-colors">
                        <td class="p-2 font-bold text-white">${p.id} • ${p.name}</td>
                        <td class="p-2 text-center font-bold ${p.rest >= restDays ? 'text-emerald-400' : 'text-amber-300'}">${p.rest} días</td>
                        <td class="p-2 text-center text-white">${p.alt} cm</td>
                        <td class="p-2 text-center font-mono text-emerald-300 font-bold">${p.ms.toLocaleString()} kg/ha</td>
                        <td class="p-2 text-center text-slate-300">${p.species}</td>
                        <td class="p-2 text-center"><span class="px-2 py-0.5 rounded text-[10px] ${p.badge}">${p.status}</span></td>
                    </tr>`;
                });

                const out = document.getElementById('console-predio-prv');
                if (out) {
                    const tableHtml = `
                    <div class="space-y-3 font-mono text-xs">
                        <div class="flex items-center justify-between text-[11px] text-emerald-400 border-b border-emerald-500/30 pb-1.5">
                            <span class="font-bold">🏡 RAMA 1: MICRO-GESTIÓN PREDIAL & PRV • FUNDO MENIEL • [${now}]</span>
                            <span class="bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 font-bold">Carga: ${ugm} UGM/ha • Autonomía: ${autonomiaDias} días</span>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white/5 p-2 rounded-xl border border-white/10">
                            <div><span class="text-slate-400">Biomasa Total:</span> <strong class="text-white">${Math.round(totalBiomassAvailable).toLocaleString()} kg MS</strong></div>
                            <div><span class="text-slate-400">Demanda Rebaño:</span> <strong class="text-amber-300">${Math.round(dailyConsumptionTotal)} kg MS/día</strong></div>
                            <div><span class="text-slate-400">Ocupación / Potrero:</span> <strong class="text-emerald-300">${ocupacionDias} días máx</strong></div>
                            <div><span class="text-slate-400">Carga Instantánea:</span> <strong class="text-purple-300">${cargaInstantanea} UGM/ha</strong></div>
                        </div>
                        <div class="overflow-x-auto rounded-xl border border-white/10">
                            <table class="w-full text-left text-[11px]">
                                <thead>
                                    <tr class="text-slate-400 border-b border-white/10 bg-white/5">
                                        <th class="p-2">Potrero (PRV Voisin)</th>
                                        <th class="p-2 text-center">Reposo</th>
                                        <th class="p-2 text-center">Altura</th>
                                        <th class="p-2 text-center">Rendimiento MS</th>
                                        <th class="p-2 text-center">Especie Animal</th>
                                        <th class="p-2 text-center">Estado Rotación</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5 text-slate-300">
                                    ${pRows}
                                    <tr class="bg-emerald-950/30 font-bold text-white border-t border-emerald-500/40">
                                        <td class="p-2 text-emerald-400" colspan="2">METABOLISMO HOGAR & CASA PRINCIPAL</td>
                                        <td class="p-2 text-center text-sky-300" colspan="2">Solar: +${solarKwh - 320} kWh/mes (Superávit)</td>
                                        <td class="p-2 text-center text-emerald-300" colspan="2">Aforo Estero: ${aforoLs} L/s • Tranque 18.5k m³</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="flex items-center justify-between pt-1">
                            <span class="text-[10px] text-slate-400">Calibrado con Sensores FDR en Potreros & Micro-red Fotovoltaica • Fundo Meniel (12.8 ha)</span>
                            <button onclick="transferScriptTableToCanva('Manejo PRV y Metabolismo Fundo Meniel', this.closest('.space-y-3').querySelector('table').outerHTML)" class="px-2.5 py-1 rounded-lg bg-emerald-600/40 hover:bg-emerald-600 text-emerald-200 text-[10px] font-bold transition-all cursor-pointer">
                                📋 A Canva Report
                            </button>
                        </div>
                    </div>`;
                    out.innerHTML = tableHtml;
                }

            // 2. FAO-56 PENMAN-MONTEITH
            } else if (scriptId === 'fao56') {
                const T = parseFloat(document.getElementById('scriptFaoTemp')?.value || 28.4);
                const RH = parseFloat(document.getElementById('scriptFaoRh')?.value || 29.0);
                const u2 = parseFloat(document.getElementById('scriptFaoWind')?.value || 4.2);
                const Rn = parseFloat(document.getElementById('scriptFaoRad')?.value || 22.8);
                const G = 0;
                const delta = 4098 * (0.6108 * Math.exp((17.27 * T) / (T + 237.3))) / Math.pow(T + 237.3, 2);
                const gamma = 0.067;
                const es = 0.6108 * Math.exp((17.27 * T) / (T + 237.3));
                const ea = es * (RH / 100);
                const num = 0.408 * delta * (Rn - G) + gamma * (900 / (T + 273)) * u2 * (es - ea);
                const den = delta + gamma * (1 + 0.34 * u2);
                const et0 = num / den;

                const out = document.getElementById('console-fao56');
                if (out) {
                    const tableHtml = `
                    <div class="space-y-3 font-mono text-xs">
                        <div class="flex items-center justify-between text-[11px] text-sky-400 border-b border-sky-500/30 pb-1.5">
                            <span class="font-bold">⚡ CÓMPUTO PENMAN-MONTEITH FAO-56 • [${now}]</span>
                            <span class="bg-sky-500/20 px-2 py-0.5 rounded text-sky-300 font-bold">ET₀ = ${et0.toFixed(2)} mm/día</span>
                        </div>
                        <div class="overflow-x-auto rounded-xl border border-white/10">
                            <table class="w-full text-left text-[11px]">
                                <thead>
                                    <tr class="text-slate-400 border-b border-white/10 bg-white/5">
                                        <th class="p-2">Escala Territorial</th>
                                        <th class="p-2">Superficie</th>
                                        <th class="p-2">Lámina ET₀</th>
                                        <th class="p-2">Demanda Diaria</th>
                                        <th class="p-2">Caudal Continuo</th>
                                        <th class="p-2">Balance Hídrico</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5 text-slate-300">
                                    <tr class="hover:bg-white/5">
                                        <td class="p-2 font-bold text-emerald-400">Fundo Meniel (Núcleo)</td>
                                        <td class="p-2">24.8 ha</td>
                                        <td class="p-2">${et0.toFixed(2)} mm/d</td>
                                        <td class="p-2">${Math.round(et0 * 24.8 * 10).toLocaleString()} m³/d</td>
                                        <td class="p-2 font-bold text-white">${(et0 * 24.8 * 10 / 86.4).toFixed(1)} L/s</td>
                                        <td class="p-2 text-emerald-300 font-bold">110% Cubierto (DGA 18.5 L/s)</td>
                                    </tr>
                                    <tr class="hover:bg-white/5">
                                        <td class="p-2 font-bold text-sky-400">Mesa Vecinal (10 Predios)</td>
                                        <td class="p-2">508.0 ha</td>
                                        <td class="p-2">${et0.toFixed(2)} mm/d</td>
                                        <td class="p-2">${Math.round(et0 * 508.0 * 10).toLocaleString()} m³/d</td>
                                        <td class="p-2 font-bold text-white">${(et0 * 508.0 * 10 / 86.4).toFixed(1)} L/s</td>
                                        <td class="p-2 text-yellow-300">Requiere Tranque Keyline</td>
                                    </tr>
                                    <tr class="hover:bg-white/5">
                                        <td class="p-2 font-bold text-indigo-400">Macro-Cuenca Maule Sur</td>
                                        <td class="p-2">122.070 ha</td>
                                        <td class="p-2">${et0.toFixed(2)} mm/d</td>
                                        <td class="p-2">${(et0 * 122070 * 10 / 1e6).toFixed(2)} M m³/d</td>
                                        <td class="p-2 font-bold text-white">${Math.round(et0 * 122070 * 10 / 86.4).toLocaleString()} L/s</td>
                                        <td class="p-2 text-sky-300">Río Longaví base: 124.5 m³/s</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="flex items-center justify-between pt-1">
                            <span class="text-[10px] text-slate-400">Parámetros: VPD=${(es-ea).toFixed(2)} kPa • Δ=${delta.toFixed(3)} kPa/°C • Rn=${Rn} MJ/m²d</span>
                            <button onclick="transferScriptTableToCanva('Demanda Hídrica FAO-56', this.closest('.space-y-3').querySelector('table').outerHTML)" class="px-2.5 py-1 rounded-lg bg-sky-600/40 hover:bg-sky-600 text-sky-200 text-[10px] font-bold transition-all cursor-pointer">
                                📋 A Canva Report
                            </button>
                        </div>
                    </div>`;
                    out.innerHTML = tableHtml;
                }

            // 2. PIRO-RIESGO VAN WAGNER & ROTHERMEL
            } else if (scriptId === 'fire') {
                const T = parseFloat(document.getElementById('scriptFireTemp')?.value || 34.0);
                const wind = parseFloat(document.getElementById('scriptFireWind')?.value || 45.0);
                const ffmc = parseFloat(document.getElementById('scriptFireFfmc')?.value || 91.5);
                const slope = parseFloat(document.getElementById('scriptFireSlope')?.value || 22.0);

                const m = 147.2 * (101 - ffmc) / (59.5 + ffmc);
                const fW = Math.exp(0.05039 * wind);
                const fF = 91.9 * Math.exp(-0.1386 * m) * (1 + Math.pow(m, 5.31) / (4.93e7));
                const isi = 0.208 * fW * fF;

                const phiS = 5.275 * Math.pow(Math.tan(slope * Math.PI / 180), 2);
                const ros = (isi * 0.12) * (1 + phiS); // m/min
                const fl = 0.0775 * Math.pow(ros * 60, 0.46); // metros
                const byram = Math.round(300 * Math.pow(fl, 2.17)); // kW/m

                const out = document.getElementById('console-fire');
                if (out) {
                    const tableHtml = `
                    <div class="space-y-3 font-mono text-xs">
                        <div class="flex items-center justify-between text-[11px] text-amber-400 border-b border-amber-500/30 pb-1.5">
                            <span class="font-bold">🔥 SIMULACIÓN VAN WAGNER & ROTHERMEL • [${now}]</span>
                            <span class="bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-bold border border-red-500/30">BOTÓN ROJO CONAF</span>
                        </div>
                        <div class="overflow-x-auto rounded-xl border border-white/10">
                            <table class="w-full text-left text-[11px]">
                                <thead>
                                    <tr class="text-slate-400 border-b border-white/10 bg-white/5">
                                        <th class="p-2">Variable de Propagación</th>
                                        <th class="p-2">Valor Simulado</th>
                                        <th class="p-2">Umbral Seguro</th>
                                        <th class="p-2">Sin Cortafuego</th>
                                        <th class="p-2">Con Faja 45m Meniel</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5 text-slate-300">
                                    <tr class="hover:bg-white/5">
                                        <td class="p-2 font-bold text-amber-400">Velocidad Avance (ROS)</td>
                                        <td class="p-2 font-bold text-white">${ros.toFixed(2)} m/min (${(ros*0.06).toFixed(2)} km/h)</td>
                                        <td class="p-2 text-slate-400">&lt; 0.30 m/min</td>
                                        <td class="p-2 text-red-400 font-bold">Avance Explosivo</td>
                                        <td class="p-2 text-emerald-300 font-bold">Frente Detenido en Suelo Mineral</td>
                                    </tr>
                                    <tr class="hover:bg-white/5">
                                        <td class="p-2 font-bold text-orange-400">Longitud de Llama</td>
                                        <td class="p-2 font-bold text-white">${fl.toFixed(1)} metros</td>
                                        <td class="p-2 text-slate-400">&lt; 1.2 m</td>
                                        <td class="p-2 text-red-400 font-bold">Fuego de Copa Incontrolable</td>
                                        <td class="p-2 text-emerald-300 font-bold">Colapso de Llama &lt; 0.8m</td>
                                    </tr>
                                    <tr class="hover:bg-white/5">
                                        <td class="p-2 font-bold text-red-400">Intensidad Lineal Byram</td>
                                        <td class="p-2 font-bold text-white">${byram.toLocaleString()} kW/m</td>
                                        <td class="p-2 text-slate-400">&lt; 350 kW/m</td>
                                        <td class="p-2 text-red-400 font-bold">Ataque Aéreo Requerido</td>
                                        <td class="p-2 text-emerald-300 font-bold">Disipación Radiativa 82%</td>
                                    </tr>
                                    <tr class="hover:bg-white/5">
                                        <td class="p-2 font-bold text-yellow-400">Tiempo Arribo a Casas</td>
                                        <td class="p-2 font-bold text-white">18 minutos</td>
                                        <td class="p-2 text-slate-400">&gt; 60 min</td>
                                        <td class="p-2 text-red-400 font-bold">Evacuación Forzada</td>
                                        <td class="p-2 text-emerald-300 font-bold">Zona de Seguridad Protegida</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="flex items-center justify-between pt-1">
                            <span class="text-[10px] text-slate-400">Viento Puelche=${wind} km/h • FFMC=${ffmc} • Pendiente=${slope}%</span>
                            <button onclick="transferScriptTableToCanva('Piro-Riesgo Rothermel', this.closest('.space-y-3').querySelector('table').outerHTML)" class="px-2.5 py-1 rounded-lg bg-amber-600/40 hover:bg-amber-600 text-amber-200 text-[10px] font-bold transition-all cursor-pointer">
                                📋 A Canva Report
                            </button>
                        </div>
                    </div>`;
                    out.innerHTML = tableHtml;
                }

            // 3. SCS-CN & RETENCIÓN KEYLINE
            } else if (scriptId === 'keyline') {
                const P = parseFloat(document.getElementById('scriptScsPrecip')?.value || 85.0);
                const Area = parseFloat(document.getElementById('scriptScsArea')?.value || 508.0);
                const CN1 = parseFloat(document.getElementById('scriptScsCnConv')?.value || 84);
                const CN2 = parseFloat(document.getElementById('scriptScsCnKeyline')?.value || 68);

                const S1 = (25400 / CN1) - 254;
                const Q1 = (P > 0.2 * S1) ? Math.pow(P - 0.2 * S1, 2) / (P + 0.8 * S1) : 0;
                const vol1 = (Q1 / 1000) * (Area * 10000);

                const S2 = (25400 / CN2) - 254;
                const Q2 = (P > 0.2 * S2) ? Math.pow(P - 0.2 * S2, 2) / (P + 0.8 * S2) : 0;
                const vol2 = (Q2 / 1000) * (Area * 10000);

                const buffered = vol1 - vol2;

                const out = document.getElementById('console-keyline');
                if (out) {
                    const tableHtml = `
                    <div class="space-y-3 font-mono text-xs">
                        <div class="flex items-center justify-between text-[11px] text-emerald-400 border-b border-emerald-500/30 pb-1.5">
                            <span class="font-bold">⛰️ SIMULACIÓN HIDROLÓGICA SCS-CN & KEYLINE • [${now}]</span>
                            <span class="bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 font-bold">Tormenta P = ${P} mm (24h)</span>
                        </div>
                        <div class="overflow-x-auto rounded-xl border border-white/10">
                            <table class="w-full text-left text-[11px]">
                                <thead>
                                    <tr class="text-slate-400 border-b border-white/10 bg-white/5">
                                        <th class="p-2">Escenario Hidrológico</th>
                                        <th class="p-2">Curva Número</th>
                                        <th class="p-2">Retención S</th>
                                        <th class="p-2">Lámina Q</th>
                                        <th class="p-2">Vol. Escurrimiento</th>
                                        <th class="p-2">Amortiguación</th>
                                        <th class="p-2">Diagnóstico Cuenca</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5 text-slate-300">
                                    <tr class="hover:bg-white/5">
                                        <td class="p-2 font-bold text-amber-400">1. Convencional (Suelo Compacto)</td>
                                        <td class="p-2">CN ${CN1}</td>
                                        <td class="p-2">${S1.toFixed(1)} mm</td>
                                        <td class="p-2 font-bold text-white">${Q1.toFixed(1)} mm</td>
                                        <td class="p-2">${Math.round(vol1).toLocaleString()} m³</td>
                                        <td class="p-2 text-slate-400">0.0% (Línea Base)</td>
                                        <td class="p-2 text-rose-300">Anegamiento rápido en valle</td>
                                    </tr>
                                    <tr class="hover:bg-white/5">
                                        <td class="p-2 font-bold text-emerald-400">2. Regenerativo (Keyline Meniel)</td>
                                        <td class="p-2">CN ${CN2}</td>
                                        <td class="p-2">${S2.toFixed(1)} mm</td>
                                        <td class="p-2 font-bold text-white">${Q2.toFixed(1)} mm</td>
                                        <td class="p-2">${Math.round(vol2).toLocaleString()} m³</td>
                                        <td class="p-2 text-emerald-300 font-bold">-${((buffered/vol1)*100).toFixed(1)}% Caudal</td>
                                        <td class="p-2 text-emerald-300 font-bold">Infiltración en perfil & recarga</td>
                                    </tr>
                                    <tr class="bg-emerald-950/30 font-bold text-white border-t border-emerald-500/40">
                                        <td class="p-2 text-emerald-400">DIFERENCIAL RETENIDO EN SUELO</td>
                                        <td class="p-2">ΔCN -${CN1-CN2}</td>
                                        <td class="p-2">+${(S2-S1).toFixed(1)} mm</td>
                                        <td class="p-2">-${(Q1-Q2).toFixed(1)} mm</td>
                                        <td class="p-2 text-emerald-300">${Math.round(buffered).toLocaleString()} m³</td>
                                        <td class="p-2 text-emerald-300">18.500 m³ Tranque</td>
                                        <td class="p-2 text-emerald-200">Tranque al 100% (Laminar)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="flex items-center justify-between pt-1">
                            <span class="text-[10px] text-slate-400">Área Aporte=${Area} ha • Infiltración neta incremental: ${Math.round(buffered).toLocaleString()} m³</span>
                            <button onclick="transferScriptTableToCanva('Amortiguación SCS-CN Keyline', this.closest('.space-y-3').querySelector('table').outerHTML)" class="px-2.5 py-1 rounded-lg bg-emerald-600/40 hover:bg-emerald-600 text-emerald-200 text-[10px] font-bold transition-all cursor-pointer">
                                📋 A Canva Report
                            </button>
                        </div>
                    </div>`;
                    out.innerHTML = tableHtml;
                }

            // 4. GOBERNANZA DAO & VOTACIÓN CUADRÁTICA
            } else if (scriptId === 'dao') {
                const credits = parseFloat(document.getElementById('scriptDaoCredits')?.value || 100);
                const predios = parseInt(document.getElementById('scriptDaoPredios')?.value || 10);
                const fund = parseFloat(document.getElementById('scriptDaoFund')?.value || 45000000);

                const initiatives = [
                    { name: 'Faja Cortafuego Comunitaria 45m', votes: 22, desc: 'Franja mineral de interfaz forestal contigua a caseríos' },
                    { name: 'Tranque & Zanjas Keyline Meniel', votes: 19, desc: 'Amortiguación de crecidas 18.500 m³ & recarga freática' },
                    { name: 'Red Centinela Telemetría Pozos APR', votes: 17, desc: 'Monitoreo freático LoRaWAN en 5 comités rurales' },
                    { name: 'Fondo de Contingencia & Emergencia', votes: 6, desc: 'Reserva para reparación de compuertas y motobombas' }
                ];
                let sumSqrt = 0;
                initiatives.forEach(it => {
                    it.sqrtScore = Math.sqrt(it.votes * predios);
                    sumSqrt += it.sqrtScore;
                });

                let rowsHtml = '';
                initiatives.forEach(it => {
                    const share = (it.sqrtScore / sumSqrt) * 100;
                    const allocated = (it.sqrtScore / sumSqrt) * fund;
                    rowsHtml += `
                    <tr class="hover:bg-white/5 transition-colors">
                        <td class="p-2 font-bold text-white">${it.name}</td>
                        <td class="p-2 text-slate-400">${it.desc}</td>
                        <td class="p-2 text-center text-purple-300 font-bold">${it.votes * predios}</td>
                        <td class="p-2 text-center text-amber-300 font-bold">${Math.round(Math.pow(it.votes, 2) * predios)}</td>
                        <td class="p-2 text-center text-sky-300 font-bold">${it.sqrtScore.toFixed(1)}</td>
                        <td class="p-2 text-center font-bold text-emerald-400">${share.toFixed(1)}%</td>
                        <td class="p-2 text-right font-bold text-white font-mono">$${Math.round(allocated).toLocaleString()} CLP</td>
                        <td class="p-2 text-center"><span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">Aprobado</span></td>
                    </tr>`;
                });

                const out = document.getElementById('console-dao');
                if (out) {
                    const tableHtml = `
                    <div class="space-y-3 font-mono text-xs">
                        <div class="flex items-center justify-between text-[11px] text-purple-400 border-b border-purple-500/30 pb-1.5">
                            <span class="font-bold">🤝 ESCRUTINIO DE GOBERNANZA CUADRÁTICA (DAO) • [${now}]</span>
                            <span class="bg-purple-500/20 px-2 py-0.5 rounded text-purple-300 font-bold">Fondo: $${fund.toLocaleString()} CLP</span>
                        </div>
                        <div class="overflow-x-auto rounded-xl border border-white/10">
                            <table class="w-full text-left text-[11px]">
                                <thead>
                                    <tr class="text-slate-400 border-b border-white/10 bg-white/5">
                                        <th class="p-2">Iniciativa Comunitaria</th>
                                        <th class="p-2">Descripción</th>
                                        <th class="p-2 text-center">Votos (v)</th>
                                        <th class="p-2 text-center">Créditos (v²)</th>
                                        <th class="p-2 text-center">Impacto (√v)</th>
                                        <th class="p-2 text-center">Ponderación</th>
                                        <th class="p-2 text-right">Asignación Fondos</th>
                                        <th class="p-2 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5 text-slate-300">
                                    ${rowsHtml}
                                    <tr class="bg-purple-950/30 font-bold text-white border-t border-purple-500/40">
                                        <td class="p-2 text-purple-300" colspan="2">TOTALES CONSOLIDADOS (10 PREDIOS)</td>
                                        <td class="p-2 text-center">640 votos</td>
                                        <td class="p-2 text-center">1.134 créditos</td>
                                        <td class="p-2 text-center">${sumSqrt.toFixed(1)}</td>
                                        <td class="p-2 text-center text-emerald-400">100.0%</td>
                                        <td class="p-2 text-right text-emerald-300 font-mono">$${fund.toLocaleString()} CLP</td>
                                        <td class="p-2 text-center text-emerald-400">Timbrado SHA-256</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="flex items-center justify-between pt-1">
                            <span class="text-[10px] text-slate-400">Escrutinio validado • Quórum alcanzado: 83.3% • Contrato inteligente desplegado</span>
                            <button onclick="transferScriptTableToCanva('Gobernanza Cuadrática DAO', this.closest('.space-y-3').querySelector('table').outerHTML)" class="px-2.5 py-1 rounded-lg bg-purple-600/40 hover:bg-purple-600 text-purple-200 text-[10px] font-bold transition-all cursor-pointer">
                                📋 A Canva Report
                            </button>
                        </div>
                    </div>`;
                    out.innerHTML = tableHtml;
                }

            // 5. INGESTA SATELITAL & ESTADÍSTICAS ZONALES (SENTINEL-2 / LANDSAT 9)
            } else if (scriptId === 'satellite') {
                const sensor = document.getElementById('scriptSatSensor')?.value || 'sentinel2';
                const coverage = document.getElementById('scriptSatCoverage')?.value || 'mesa';
                const epoch = document.getElementById('scriptSatEpoch')?.value || 'sep';
                const index = document.getElementById('scriptSatIndex')?.value || 'ndvi';

                const sensorLabel = (sensor === 'sentinel2') ? 'Sentinel-2B MSI (10m • Copernicus ESA)' : (sensor === 'landsat9') ? 'Landsat 9 OLI-2/TIRS (30m • USGS)' : 'PlanetScope Dove (3m • Planet Labs)';
                const epochLabel = (epoch === 'sep') ? 'Primavera 2026 (Rebrote Máximo)' : (epoch === 'ene') ? 'Verano 2026 (Estío & Piro-Riesgo)' : 'Invierno 2026 (Crecida T=50)';

                const parcels = [
                    { rol: '142-88', name: 'Fundo Meniel (Núcleo)', owner: 'Familia Santander', area: 24.8, cota: 340, ndvi: 0.78, ndwi: 0.32, nbr: 0.65, lst: 21.4, biomass: 4820, diag: 'Óptimo (Keyline Activo)' },
                    { rol: '142-12', name: 'Fundo El Peumo', owner: 'Agrícola Longaví SpA', area: 62.4, cota: 380, ndvi: 0.71, ndwi: 0.18, nbr: 0.58, lst: 23.1, biomass: 3910, diag: 'Estable (Riego Tendido)' },
                    { rol: '142-45', name: 'Viña Los Boldos', owner: 'Vinos del Maule Ltda', area: 48.0, cota: 410, ndvi: 0.68, ndwi: 0.09, nbr: 0.54, lst: 24.8, biomass: 3200, diag: 'Riego Goteo Eficiente' },
                    { rol: '143-05', name: 'Hijuela San Pedro', owner: 'Sucesión Martínez', area: 35.5, cota: 360, ndvi: 0.64, ndwi: 0.05, nbr: 0.49, lst: 25.6, biomass: 2850, diag: 'Alerta Hídrica Media' },
                    { rol: '143-22', name: 'Agrícola Copihue', owner: 'Cooperativa Retiro', area: 88.2, cota: 450, ndvi: 0.59, ndwi: -0.04, nbr: 0.44, lst: 27.2, biomass: 2410, diag: 'Estrés Hídrico Leve' },
                    { rol: '144-11', name: 'Parcela Las Rosas', owner: 'Comité APR Las Rosas', area: 18.0, cota: 310, ndvi: 0.79, ndwi: 0.38, nbr: 0.69, lst: 20.8, biomass: 5100, diag: 'Ribera Fluvial Óptima' },
                    { rol: '144-80', name: 'Fundo Bellavista', owner: 'Forestal y Ganadera', area: 75.3, cota: 520, ndvi: 0.51, ndwi: -0.12, nbr: 0.38, lst: 29.5, biomass: 1850, diag: 'Piro-Riesgo Secano Alto' },
                    { rol: '145-02', name: 'Hijuela Los Robles', owner: 'Comunidad Romero', area: 29.6, cota: 490, ndvi: 0.55, ndwi: -0.08, nbr: 0.41, lst: 28.3, biomass: 2100, diag: 'Requiere Faja 45m' },
                    { rol: '145-33', name: 'Parcela San Ramón', owner: 'Agrícola San Ramón', area: 42.1, cota: 330, ndvi: 0.74, ndwi: 0.22, nbr: 0.61, lst: 22.5, biomass: 4150, diag: 'Recarga APR Favorable' },
                    { rol: '145-90', name: 'Hijuela El Carmen', owner: 'Forestal Maule', area: 84.1, cota: 580, ndvi: 0.46, ndwi: -0.19, nbr: 0.31, lst: 31.8, biomass: 1420, diag: 'Piro-Riesgo Severo' }
                ];

                if (epoch === 'ene') {
                    parcels.forEach(p => {
                        p.ndvi = Math.max(0.18, +(p.ndvi - 0.25).toFixed(2));
                        p.ndwi = +(p.ndwi - 0.22).toFixed(2);
                        p.lst = +(p.lst + 8.5).toFixed(1);
                        p.biomass = Math.round(p.biomass * 0.48);
                    });
                } else if (epoch === 'jun') {
                    parcels.forEach(p => {
                        p.ndvi = +(p.ndvi - 0.08).toFixed(2);
                        p.ndwi = +(p.ndwi + 0.28).toFixed(2);
                        p.lst = Math.max(9.5, +(p.lst - 9.0).toFixed(1));
                        p.biomass = Math.round(p.biomass * 0.72);
                    });
                }

                let totalArea = 0, sumNdvi = 0, sumNdwi = 0, sumLst = 0, sumBiomass = 0;
                parcels.forEach(p => {
                    totalArea += p.area;
                    sumNdvi += p.ndvi * p.area;
                    sumNdwi += p.ndwi * p.area;
                    sumLst += p.lst * p.area;
                    sumBiomass += p.biomass * p.area;
                });
                const avgNdvi = (sumNdvi / totalArea).toFixed(2);
                const avgNdwi = (sumNdwi / totalArea).toFixed(2);
                const avgLst = (sumLst / totalArea).toFixed(1);
                const avgBiomass = Math.round(sumBiomass / totalArea);

                let rowsHtml = '';
                parcels.forEach(p => {
                    const ndviBadge = p.ndvi > 0.65 ? 'text-emerald-400 font-bold' : p.ndvi > 0.50 ? 'text-yellow-400' : 'text-rose-400 font-bold';
                    const ndwiBadge = p.ndwi > 0.15 ? 'text-sky-400 font-bold' : p.ndwi > 0 ? 'text-cyan-300' : 'text-slate-400';
                    const lstBadge = p.lst > 30 ? 'text-red-400 font-bold' : p.lst > 25 ? 'text-amber-400' : 'text-sky-300 font-bold';
                    const diagBadge = p.diag.includes('Óptimo') || p.diag.includes('Favorable') 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : p.diag.includes('Severo') || p.diag.includes('Alto')
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30 font-bold'
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';

                    rowsHtml += `
                    <tr class="hover:bg-white/5 transition-colors">
                        <td class="p-2 font-bold text-white">${p.rol}</td>
                        <td class="p-2 text-slate-300">${p.name}</td>
                        <td class="p-2 text-slate-400">${p.owner}</td>
                        <td class="p-2 font-mono text-white">${p.area.toFixed(1)} ha</td>
                        <td class="p-2 text-amber-300">${p.cota} m</td>
                        <td class="p-2 font-mono ${ndviBadge}">${p.ndvi}</td>
                        <td class="p-2 font-mono ${ndwiBadge}">${p.ndwi > 0 ? '+' : ''}${p.ndwi}</td>
                        <td class="p-2 font-mono ${lstBadge}">${p.lst}°C</td>
                        <td class="p-2 font-mono text-lime-300">${p.biomass.toLocaleString()}</td>
                        <td class="p-2"><span class="px-2 py-0.5 rounded text-[10px] ${diagBadge}">${p.diag}</span></td>
                    </tr>`;
                });

                const out = document.getElementById('console-satellite');
                if (out) {
                    const tableHtml = `
                    <div class="space-y-3 font-mono text-xs">
                        <div class="flex flex-wrap items-center justify-between text-[11px] text-sky-400 border-b border-sky-500/30 pb-2 gap-2">
                            <div class="flex items-center gap-2">
                                <span class="font-bold">🛰️ ESTADÍSTICAS ZONALES BOA MULTIESPECTRALES • [${now}]</span>
                                <span class="text-slate-500">|</span>
                                <span class="text-slate-300">${sensorLabel}</span>
                                <span class="text-slate-500">|</span>
                                <span class="text-amber-300">${epochLabel}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">10 Predios • 508.0 ha</span>
                                <button onclick="transferScriptTableToCanva('Estadísticas Zonales Satelitales (508 ha)', this.closest('.space-y-3').querySelector('table').outerHTML)" class="px-3 py-1 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold transition-all shadow cursor-pointer">
                                    📋 A Canva Report
                                </button>
                            </div>
                        </div>

                        <div class="overflow-x-auto rounded-2xl border border-white/10 bg-black/60 max-h-96">
                            <table class="w-full text-left text-[11px] font-mono">
                                <thead class="sticky top-0 bg-[#070b14] z-10 border-b border-white/10">
                                    <tr class="text-slate-400">
                                        <th class="p-2.5">Rol SII</th>
                                        <th class="p-2.5">Predio</th>
                                        <th class="p-2.5">Propietario / Uso</th>
                                        <th class="p-2.5">Área (ha)</th>
                                        <th class="p-2.5">Cota</th>
                                        <th class="p-2.5">NDVI (Vigor)</th>
                                        <th class="p-2.5">NDWI (Agua)</th>
                                        <th class="p-2.5">LST (°C)</th>
                                        <th class="p-2.5">Biomasa (kg MS/ha)</th>
                                        <th class="p-2.5">Diagnóstico Biofísico</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5 text-slate-300">
                                    ${rowsHtml}
                                    <tr class="bg-sky-950/40 font-bold border-t-2 border-sky-500/40 text-white">
                                        <td class="p-2.5 text-sky-400" colspan="3">TOTALES & PROMEDIOS PONDERADOS (MESA VECINAL)</td>
                                        <td class="p-2.5 text-sky-300">${totalArea.toFixed(1)} ha</td>
                                        <td class="p-2.5 text-slate-400">-</td>
                                        <td class="p-2.5 text-emerald-400 font-bold">${avgNdvi}</td>
                                        <td class="p-2.5 text-sky-400 font-bold">${avgNdwi > 0 ? '+' : ''}${avgNdwi}</td>
                                        <td class="p-2.5 text-yellow-400 font-bold">${avgLst}°C</td>
                                        <td class="p-2.5 text-lime-300 font-bold">${avgBiomass.toLocaleString()} kg/ha</td>
                                        <td class="p-2.5 text-emerald-300">Resiliencia Sistémica Alta</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>`;
                    out.innerHTML = tableHtml;
                }
            }

            // 6. RAMA 1 & 3: BALANCE DE CARBONO IPCC TIER 2 & MRV
            else if (scriptId === 'ipcc') {
                const areaBosque = parseFloat(document.getElementById('scriptIpccBosque')?.value || 4.5);
                const areaPrv = parseFloat(document.getElementById('scriptIpccPrv')?.value || 14.8);
                const anios = parseInt(document.getElementById('scriptIpccAnios')?.value || 5);
                const factorBosque = 3.65; // t C/ha/año en bosque esclerófilo
                const factorPrv = 1.25;    // t C/ha/año incremento suelo PRV
                const cToCo2 = 44 / 12;    // Factor estequiométrico C -> CO2e (3.667)

                const cBosqueAnual = areaBosque * factorBosque;
                const cPrvAnual = areaPrv * factorPrv;
                const cTotalAnual = cBosqueAnual + cPrvAnual;
                const co2eAnual = cTotalAnual * cToCo2;
                const co2eAcumulado = co2eAnual * anios;
                const bonoEurTon = 32.5; // EUR por tCO2e en mercado voluntario Gold Standard
                const valorAcumuladoEur = Math.round(co2eAcumulado * bonoEurTon);
                const clpPerEur = 1040;
                const valorAcumuladoClp = (valorAcumuladoEur * clpPerEur).toLocaleString('es-CL');

                const out = document.getElementById('console-ipcc');
                if (out) {
                    const tableHtml = `
                    <div class="space-y-3 font-mono text-xs">
                        <div class="flex items-center justify-between text-[11px] text-emerald-400 border-b border-emerald-500/30 pb-1.5">
                            <span class="font-bold">🌿 BALANCE CARBONO IPCC TIER-2 • [${now}]</span>
                            <span class="bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 font-bold">Captura Neta: ${co2eAnual.toFixed(1)} tCO₂e/año</span>
                        </div>
                        <div class="overflow-x-auto rounded-xl border border-white/10">
                            <table class="w-full text-left text-[11px]">
                                <thead>
                                    <tr class="text-slate-400 border-b border-white/10 bg-white/5">
                                        <th class="p-2">Estrato Ecosistémico</th>
                                        <th class="p-2">Área (ha)</th>
                                        <th class="p-2">Factor C (t/ha/a)</th>
                                        <th class="p-2">Secuestro Anual (tCO₂e)</th>
                                        <th class="p-2">Acumulado ${anios} Años</th>
                                        <th class="p-2">Valoración ESG</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5 text-slate-300">
                                    <tr class="hover:bg-white/5">
                                        <td class="p-2 font-bold text-emerald-400">Bosque Esclerófilo Nativo</td>
                                        <td class="p-2">${areaBosque.toFixed(1)} ha</td>
                                        <td class="p-2">${factorBosque}</td>
                                        <td class="p-2 text-white font-bold">${(cBosqueAnual * cToCo2).toFixed(1)} tCO₂e</td>
                                        <td class="p-2 font-bold text-emerald-300">${(cBosqueAnual * cToCo2 * anios).toFixed(1)} t</td>
                                        <td class="p-2 text-slate-400">Permanencia &gt; 30a</td>
                                    </tr>
                                    <tr class="hover:bg-white/5">
                                        <td class="p-2 font-bold text-lime-400">Pastoreo Racional Voisin (Suelo)</td>
                                        <td class="p-2">${areaPrv.toFixed(1)} ha</td>
                                        <td class="p-2">${factorPrv}</td>
                                        <td class="p-2 text-white font-bold">${(cPrvAnual * cToCo2).toFixed(1)} tCO₂e</td>
                                        <td class="p-2 font-bold text-lime-300">${(cPrvAnual * cToCo2 * anios).toFixed(1)} t</td>
                                        <td class="p-2 text-slate-400">ΔMO +0.8% verificado</td>
                                    </tr>
                                    <tr class="bg-emerald-950/40 font-bold border-t border-emerald-500/30 text-white">
                                        <td class="p-2 text-emerald-300" colspan="3">CONSOLIDADO BALANCE MRV</td>
                                        <td class="p-2 text-emerald-400 font-extrabold">${co2eAnual.toFixed(1)} tCO₂e/año</td>
                                        <td class="p-2 text-amber-300 font-extrabold">${co2eAcumulado.toFixed(1)} tCO₂e</td>
                                        <td class="p-2 text-emerald-300 font-extrabold">$${valorAcumuladoClp} CLP</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="flex items-center justify-between pt-1">
                            <span class="text-[10px] text-slate-400">Metodología: IPCC 2019 Refinement Vol 4 AFOLU • Certificación EUDR compliant</span>
                            <button onclick="transferScriptTableToCanva('Balance Carbono IPCC Tier 2', this.closest('.space-y-3').querySelector('table').outerHTML)" class="px-2.5 py-1 rounded-lg bg-emerald-600/40 hover:bg-emerald-600 text-emerald-200 text-[10px] font-bold transition-all cursor-pointer">
                                📋 A Canva Report
                            </button>
                        </div>
                    </div>`;
                    out.innerHTML = tableHtml;
                }
            }

            // 7. RAMA 1: ESTRÉS CALÓRICO PECUARIO (THI - TEMPERATURE HUMIDITY INDEX)
            else if (scriptId === 'thi') {
                const T = parseFloat(document.getElementById('scriptThiTemp')?.value || 33.5);
                const RH = parseFloat(document.getElementById('scriptThiRh')?.value || 32.0);
                const cabezas = parseInt(document.getElementById('scriptThiHeads')?.value || 42);

                // THI fórmula canónica NRC (National Research Council):
                // THI = (1.8 * T + 32) - (0.55 - 0.0055 * RH) * (1.8 * T - 26)
                const thi = (1.8 * T + 32) - (0.55 - 0.0055 * RH) * (1.8 * T - 26);
                let thiLevel = 'Normal / Confort';
                let thiBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                let prodLossPct = 0;
                let waterDemandLitre = 45; // L/animal/día base
                let protocolAction = 'Pastoreo normal en potrero activo.';

                if (thi >= 84) {
                    thiLevel = 'Emergencia / Estrés Muy Severo';
                    thiBadge = 'bg-rose-500/30 text-rose-300 border-rose-500/50 font-bold';
                    prodLossPct = 25;
                    waterDemandLitre = 95;
                    protocolAction = 'Activar aspersión de niebla en corrales, sombreadero obligatorio y suspensión de traslados a pleno sol.';
                } else if (thi >= 79) {
                    thiLevel = 'Peligro / Estrés Severo';
                    thiBadge = 'bg-orange-500/20 text-orange-300 border-orange-500/30 font-bold';
                    prodLossPct = 15;
                    waterDemandLitre = 80;
                    protocolAction = 'Mover rebaño a potreros con cortaviento peumo/quillay de sombra alta. Aumentar aforo bebederos.';
                } else if (thi >= 72) {
                    thiLevel = 'Alerta / Estrés Moderado';
                    thiBadge = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
                    prodLossPct = 8;
                    waterDemandLitre = 65;
                    protocolAction = 'Monitoreo de frecuencia respiratoria de ganado; verificar disponibilidad de agua continua.';
                }

                const totalWaterDemandedL = cabezas * waterDemandLitre;

                const out = document.getElementById('console-thi');
                if (out) {
                    const tableHtml = `
                    <div class="space-y-3 font-mono text-xs">
                        <div class="flex items-center justify-between text-[11px] text-amber-400 border-b border-amber-500/30 pb-1.5">
                            <span class="font-bold">🐄 ESTRÉS CALÓRICO PECUARIO (THI NRC) • [${now}]</span>
                            <span class="px-2 py-0.5 rounded border ${thiBadge}">THI = ${thi.toFixed(1)} • ${thiLevel}</span>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white/5 p-2 rounded-xl border border-white/10">
                            <div><span class="text-slate-400">Rebaño Activo:</span> <strong class="text-white">${cabezas} Cabezas</strong></div>
                            <div><span class="text-slate-400">Agua Diaria Total:</span> <strong class="text-sky-300">${totalWaterDemandedL.toLocaleString()} L/día</strong></div>
                            <div><span class="text-slate-400">Merma Prod. Est.:</span> <strong class="text-rose-400">-${prodLossPct}%</strong></div>
                            <div><span class="text-slate-400">Condición:</span> <strong class="text-amber-300">${T}°C • ${RH}% HR</strong></div>
                        </div>
                        <div class="overflow-x-auto rounded-xl border border-white/10">
                            <table class="w-full text-left text-[11px]">
                                <thead>
                                    <tr class="text-slate-400 border-b border-white/10 bg-white/5">
                                        <th class="p-2">Rango THI</th>
                                        <th class="p-2">Categoría NRC</th>
                                        <th class="p-2">Consumo Agua/U</th>
                                        <th class="p-2">Pérdida Ganancia Peso</th>
                                        <th class="p-2">Protocolo Mitigación Meniel</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5 text-slate-300">
                                    <tr class="${thi < 72 ? 'bg-emerald-950/40 font-bold text-emerald-300' : 'hover:bg-white/5'}">
                                        <td class="p-2">&lt; 72</td>
                                        <td class="p-2">Confort Térmico</td>
                                        <td class="p-2">45-50 L/día</td>
                                        <td class="p-2 text-emerald-400">0% (Óptimo)</td>
                                        <td class="p-2 text-slate-400">Pastoreo regular PRV</td>
                                    </tr>
                                    <tr class="${thi >= 72 && thi < 79 ? 'bg-yellow-950/40 font-bold text-yellow-300' : 'hover:bg-white/5'}">
                                        <td class="p-2">72 – 78</td>
                                        <td class="p-2">Alerta Leve</td>
                                        <td class="p-2">60-70 L/día</td>
                                        <td class="p-2 text-yellow-400">-5% a -10%</td>
                                        <td class="p-2 text-slate-300">Bebederos móviles en línea</td>
                                    </tr>
                                    <tr class="${thi >= 79 && thi < 84 ? 'bg-orange-950/40 font-bold text-orange-300' : 'hover:bg-white/5'}">
                                        <td class="p-2">79 – 83</td>
                                        <td class="p-2">Peligro Moderado</td>
                                        <td class="p-2">75-85 L/día</td>
                                        <td class="p-2 text-orange-400">-12% a -18%</td>
                                        <td class="p-2 text-slate-200">Silvopastoreo bajo dosel nativo</td>
                                    </tr>
                                    <tr class="${thi >= 84 ? 'bg-rose-950/40 font-bold text-rose-300' : 'hover:bg-white/5'}">
                                        <td class="p-2">&ge; 84</td>
                                        <td class="p-2">Emergencia Severa</td>
                                        <td class="p-2">90-110 L/día</td>
                                        <td class="p-2 text-rose-400">-25% o más</td>
                                        <td class="p-2 text-rose-300 font-bold">Aspersión forzada y descanso estricto</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="flex items-center justify-between pt-1">
                            <span class="text-[10px] text-slate-400">Acción Táctica: ${protocolAction}</span>
                            <button onclick="transferScriptTableToCanva('Estrés Calórico Pecuario THI', this.closest('.space-y-3').querySelector('table').outerHTML)" class="px-2.5 py-1 rounded-lg bg-amber-600/40 hover:bg-amber-600 text-amber-200 text-[10px] font-bold transition-all cursor-pointer">
                                📋 A Canva Report
                            </button>
                        </div>
                    </div>`;
                    out.innerHTML = tableHtml;
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════
