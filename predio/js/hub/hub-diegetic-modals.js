/**
 * hub-diegetic-modals.js
 * Sistema unificado de modales diegéticos para los 18 sprites de Cultivos, Establo e Incursión.
 * Incluye Visor Planta a Planta, Visor Animal a Animal, Recetarios y Guías de Terreno.
 */

window.ECOSYSTEM_DATA = null;

async function loadEcosystemData() {
    if (window.ECOSYSTEM_DATA) return window.ECOSYSTEM_DATA;
    try {
        const res = await fetch('data/farm_ecosystem_master.json');
        window.ECOSYSTEM_DATA = await res.json();
    } catch(e) {
        console.warn('Error loading ecosystem data, using fallback', e);
    }
    return window.ECOSYSTEM_DATA;
}

// -------------------------------------------------------------
// CONTENEDOR BASE DE MODALES DIEGÉTICOS (Madera, Latón & Filtro)
// -------------------------------------------------------------
function ensureDiegeticModalContainer() {
    let container = document.getElementById('diegeticModalHost');
    if (!container) {
        container = document.createElement('div');
        container.id = 'diegeticModalHost';
        container.className = 'fixed inset-0 z-[9995] hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 transition-all duration-300';
        container.innerHTML = `
            <div id="diegeticModalCard" class="relative w-full max-w-4xl max-h-[92vh] bg-[#0f172a] border-2 border-amber-500/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-200 font-sans animate-fadeIn">
                <!-- Header con madera y latón -->
                <div id="diegeticModalHeader" class="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span id="diegeticModalIcon" class="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">🌿</span>
                        <div>
                            <div class="flex items-center gap-2">
                                <span id="diegeticModalCategory" class="text-xs text-stone-400 font-mono">AgroTwin Suite</span>
                            </div>
                            <h3 id="diegeticModalTitle" class="text-lg sm:text-xl font-black text-white font-serif tracking-tight mt-0.5">Título</h3>
                        </div>
                    </div>
                    <button onclick="closeDiegeticModal()" class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center text-lg font-bold cursor-pointer transition-all">&times;</button>
                </div>

                <!-- Contenido Dinámico Scrollable -->
                <div id="diegeticModalBody" class="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs font-sans">
                </div>

                <!-- Footer de Acción Rápida -->
                <div id="diegeticModalFooter" class="p-4 bg-stone-950/80 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span id="diegeticModalStatus" class="text-stone-400">⚡ Sincronizado con Gemelo 3D & Telemetría</span>
                    <button onclick="closeDiegeticModal()" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black transition-all cursor-pointer shadow-md">
                        Entendido / Cerrar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }
    return container;
}

function openDiegeticModal(opts) {
    const host = ensureDiegeticModalContainer();
    const card = document.getElementById('diegeticModalCard');
    const icon = document.getElementById('diegeticModalIcon');
    const tag = document.getElementById('diegeticModalTag');
    const cat = document.getElementById('diegeticModalCategory');
    const title = document.getElementById('diegeticModalTitle');
    const body = document.getElementById('diegeticModalBody');
    const status = document.getElementById('diegeticModalStatus');

    if (opts.borderColor) card.style.borderColor = opts.borderColor;
    if (opts.icon) icon.textContent = opts.icon;
    if (tag && opts.tag) tag.textContent = opts.tag;
    if (opts.category) cat.textContent = opts.category;
    if (opts.title) title.textContent = opts.title;
    if (opts.status) status.textContent = opts.status;
    if (opts.html) body.innerHTML = opts.html;

    host.classList.remove('hidden');
    host.style.display = 'flex';
}

function closeDiegeticModal() {
    const host = document.getElementById('diegeticModalHost');
    if (host) {
        host.classList.add('hidden');
        host.style.display = 'none';
    }
}
window.closeDiegeticModal = closeDiegeticModal;

// =========================================================================
// 1. VISOR PLANTA A PLANTA (CULTIVOS 1 & 2)
// =========================================================================
window.openPlantByPlantViewer = async function(initialId) {
    const data = await loadEcosystemData();
    const crops = data?.crops_detailed || [];
    let selected = crops.find(c => c.id === initialId) || crops[0];

    function renderContent(curr) {
        const cropCards = crops.map(c => `
            <div onclick="window.selectCropUnit('${c.id}')" class="p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${c.id === curr.id ? 'bg-emerald-950/80 border-emerald-400 shadow-md' : 'bg-stone-900/60 border-white/10 hover:border-emerald-500/50'}">
                <div class="flex items-center gap-2.5">
                    <span class="text-xl">${c.environment === 'indoor' ? '🌱' : '🍇'}</span>
                    <div>
                        <div class="font-bold text-white text-xs">${c.name}</div>
                        <div class="text-[10px] text-stone-400 font-mono">${c.species} • ${c.cuartel}</div>
                    </div>
                </div>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded ${c.environment === 'indoor' ? 'bg-emerald-900/80 text-emerald-300' : 'bg-amber-900/80 text-amber-300'}">${c.environment.toUpperCase()}</span>
            </div>
        `).join('');

        return `
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <!-- Columna Izquierda: Lista de Plantas y Cuarteles -->
                <div class="lg:col-span-5 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                    <div class="text-xs font-mono text-emerald-400 font-bold mb-1 flex items-center justify-between">
                        <span>CATÁLOGO DE CUARTELES (${crops.length})</span>
                        <span class="text-[10px] text-stone-400">Selecciona para ver ficha</span>
                    </div>
                    ${cropCards}
                </div>

                <!-- Columna Derecha: Ficha Técnica Detallada de la Planta Seleccionada -->
                <div class="lg:col-span-7 bg-stone-900/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div class="flex items-start justify-between border-b border-white/10 pb-3">
                        <div>
                            <span class="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">[FICHA-BOTÁNICA • ${curr.id}]</span>
                            <h4 class="text-lg font-black text-white font-serif">${curr.name}</h4>
                            <div class="text-xs text-stone-300 font-mono italic">${curr.species} — ${curr.variety}</div>
                        </div>
                        <span class="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">${curr.currentPhenology}</span>
                    </div>

                    <!-- Métricas Biofísicas Principales -->
                    <div class="grid grid-cols-3 gap-2.5 font-mono text-center">
                        <div class="bg-black/50 p-2 rounded-xl border border-white/10">
                            <span class="text-[9px] text-stone-400 block uppercase">Superficie / Densidad</span>
                            <span class="text-xs font-bold text-white">${curr.surfaceHa} ha (${curr.plantsCount} plantas)</span>
                        </div>
                        <div class="bg-black/50 p-2 rounded-xl border border-white/10">
                            <span class="text-[9px] text-stone-400 block uppercase">Año Plantación</span>
                            <span class="text-xs font-bold text-amber-300">${curr.plantedYear} (${2026 - curr.plantedYear} años)</span>
                        </div>
                        <div class="bg-black/50 p-2 rounded-xl border border-white/10">
                            <span class="text-[9px] text-stone-400 block uppercase">Cosecha Estimada</span>
                            <span class="text-xs font-bold text-emerald-300">${curr.harvestPeriod}</span>
                        </div>
                    </div>

                    <!-- Pestañas de Manejo Limpio -->
                    <div class="space-y-2.5 text-xs">
                        <div class="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3">
                            <div class="font-bold text-emerald-300 flex items-center gap-1.5 mb-1 font-mono">
                                <span>💧</span> Estrategia de Riego & Humedad Radicular:
                            </div>
                            <p class="text-stone-300 leading-relaxed">${curr.irrigationStrategy}</p>
                        </div>

                        <div class="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3">
                            <div class="font-bold text-amber-300 flex items-center gap-1.5 mb-1 font-mono">
                                <span>🧪</span> Nutrición Biológica & Suelo Vivo:
                            </div>
                            <p class="text-stone-300 leading-relaxed">${curr.soilTreatment}</p>
                        </div>

                        <div class="bg-sky-950/30 border border-sky-500/30 rounded-xl p-3">
                            <div class="font-bold text-sky-300 flex items-center gap-1.5 mb-1 font-mono">
                                <span>🛡️</span> Sanidad Vegetal Cero Residuos:
                            </div>
                            <p class="text-stone-300 leading-relaxed">${curr.pestManagement}</p>
                        </div>

                        <div class="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3">
                            <div class="font-bold text-purple-300 flex items-center gap-1.5 mb-1 font-mono">
                                <span>🌿</span> Socios de Intercropping (Policultivo):
                            </div>
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                ${curr.intercroppingPartners.map(p => `<span class="px-2 py-0.5 rounded-md bg-purple-900/60 text-purple-200 border border-purple-500/30 text-[10px] font-mono">${p}</span>`).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Botón de Acción Directa -->
                    <div class="flex items-center justify-between pt-2 border-t border-white/10">
                        <span class="text-[10px] text-stone-400 font-mono">Estado: ${curr.healthStatus}</span>
                        <button onclick="alert('Registrando labor para ${curr.name} en el cuaderno de campo')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-mono font-bold text-xs transition-all cursor-pointer">
                            + Añadir Labor / Foto
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    window.selectCropUnit = function(cropId) {
        selected = crops.find(c => c.id === cropId) || crops[0];
        document.getElementById('diegeticModalBody').innerHTML = renderContent(selected);
    };

    openDiegeticModal({
        icon: '🌿',
        tag: '[RAMA-CULTIVOS-VISOR]',
        category: 'Invernadero & Cuarteles Exteriores',
        title: 'Explorador Planta a Planta & Fichas de Cuartel',
        borderColor: '#10b981',
        status: '🌱 14 Cuarteles con trazabilidad agroecológica y sensores FDR',
        html: renderContent(selected)
    });
};

// =========================================================================
// 2. VISOR ANIMAL A ANIMAL (ESTABLO 1 & 2)
// =========================================================================
window.openAnimalByAnimalViewer = async function(initialId) {
    const data = await loadEcosystemData();
    const animals = data?.animals_detailed || [];
    let selected = animals.find(a => a.id === initialId) || animals[0];

    function renderContent(curr) {
        const animalCards = animals.map(a => `
            <div onclick="window.selectAnimalUnit('${a.id}')" class="p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${a.id === curr.id ? 'bg-amber-950/80 border-amber-400 shadow-md' : 'bg-stone-900/60 border-white/10 hover:border-amber-500/50'}">
                <div class="flex items-center gap-2.5">
                    <span class="text-xl">${a.species.includes('Bovino') ? '🐄' : a.species.includes('Ovino') ? '🐑' : a.species.includes('Caballo') ? '🐎' : '🐓'}</span>
                    <div>
                        <div class="font-bold text-white text-xs">${a.name}</div>
                        <div class="text-[10px] text-stone-400 font-mono">${a.species} • ${a.currentPaddock}</div>
                    </div>
                </div>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-900/80 text-amber-300">${a.weightKg} kg</span>
            </div>
        `).join('');

        return `
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <!-- Columna Izquierda: Lista de Animales y Lotes -->
                <div class="lg:col-span-5 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                    <div class="text-xs font-mono text-amber-400 font-bold mb-1 flex items-center justify-between">
                        <span>REBAÑO ACTIVO (${animals.length} Lotes)</span>
                        <span class="text-[10px] text-stone-400">Selecciona para ver ficha</span>
                    </div>
                    ${animalCards}
                </div>

                <!-- Columna Derecha: Ficha Técnica Zootécnica y SAG RFID -->
                <div class="lg:col-span-7 bg-stone-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div class="flex items-start justify-between border-b border-white/10 pb-3">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest">[FICHA-SAG-RFID]</span>
                                <span class="px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 font-mono text-[10px] font-bold border border-yellow-400/40">${curr.rfid}</span>
                            </div>
                            <h4 class="text-lg font-black text-white font-serif mt-1">${curr.name} — <span class="text-amber-300 font-sans text-sm font-semibold">${curr.role}</span></h4>
                            <div class="text-xs text-stone-300 font-mono">${curr.species} • Nacimiento: ${curr.birthDate}</div>
                        </div>
                        <span class="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">${curr.currentPaddock}</span>
                    </div>

                    <!-- Métricas Zootécnicas de Crecimiento & Bienestar -->
                    <div class="grid grid-cols-3 gap-2.5 font-mono text-center">
                        <div class="bg-black/50 p-2 rounded-xl border border-white/10">
                            <span class="text-[9px] text-stone-400 block uppercase">Peso Actual / Meta</span>
                            <span class="text-xs font-bold text-white">${curr.weightKg} kg / ${curr.targetWeightKg} kg</span>
                        </div>
                        <div class="bg-black/50 p-2 rounded-xl border border-white/10">
                            <span class="text-[9px] text-stone-400 block uppercase">Ganancia Diaria (GDP)</span>
                            <span class="text-xs font-bold text-emerald-300">+${curr.gdpKgDay} kg/día</span>
                        </div>
                        <div class="bg-black/50 p-2 rounded-xl border border-white/10">
                            <span class="text-[9px] text-stone-400 block uppercase">Condición Corporal</span>
                            <span class="text-xs font-bold text-amber-300">${curr.bodyConditionScore}</span>
                        </div>
                    </div>

                    <!-- Estado de Pastoreo Voisin & Sanidad Preventiva -->
                    <div class="space-y-2.5 text-xs">
                        <div class="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3">
                            <div class="font-bold text-emerald-300 flex items-center justify-between font-mono mb-1">
                                <span>📋 Pastoreo Racional Voisin (PRV):</span>
                                <span class="text-[10px] text-emerald-400">${curr.paddockDays}</span>
                            </div>
                            <p class="text-stone-300 leading-relaxed">Próxima rotación planificada: <b>${curr.nextPaddock}</b> para asegurar el rebrote óptimo de la pastura.</p>
                        </div>

                        <div class="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3">
                            <div class="font-bold text-amber-300 flex items-center gap-1.5 mb-1 font-mono">
                                <span>💉</span> Plan Sanitario Oficial SAG & Vacunas:
                            </div>
                            <div class="space-y-1">
                                ${curr.vaccineSAG.map(v => `
                                    <div class="flex items-center justify-between text-[11px] border-b border-white/5 pb-0.5">
                                        <span class="text-stone-200">• ${v.name}</span>
                                        <span class="text-emerald-400 font-mono">${v.status} (${v.date})</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="bg-sky-950/30 border border-sky-500/30 rounded-xl p-3">
                            <div class="font-bold text-sky-300 flex items-center gap-1.5 mb-1 font-mono">
                                <span>🌿</span> Cuidados Preventivos & Fitoterapia:
                            </div>
                            <p class="text-stone-300 leading-relaxed">${curr.preventiveCare}</p>
                            <div class="text-[10px] text-stone-400 mt-1 italic font-sans">Notas de campo: "${curr.notes}"</div>
                        </div>
                    </div>

                    <!-- Acciones Rápidas -->
                    <div class="flex items-center justify-between pt-2 border-t border-white/10">
                        <span class="text-[10px] text-emerald-400 font-mono">Estado Clínico: ${curr.healthStatus}</span>
                        <div class="flex gap-2">
                            <button onclick="alert('Abriendo balanza para ingresar nuevo pesaje de ${curr.name}')" class="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-all cursor-pointer">
                                ⚖️ Nuevo Pesaje
                            </button>
                            <button onclick="alert('Rotando ${curr.name} al potrero programado')" class="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-mono font-bold text-xs transition-all cursor-pointer">
                                ➔ Rotar Potrero
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    window.selectAnimalUnit = function(animId) {
        selected = animals.find(a => a.id === animId) || animals[0];
        document.getElementById('diegeticModalBody').innerHTML = renderContent(selected);
    };

    openDiegeticModal({
        icon: '🐂',
        tag: '[RAMA-ESTABLO-VISOR]',
        category: 'Establo & Sanidad Ganadera',
        title: 'Explorador Animal a Animal & Arete SAG RFID',
        borderColor: '#d97706',
        status: '🐄 Fichas zootécnicas sincronizadas con los 8 potreros Voisin',
        html: renderContent(selected)
    });
};

// =========================================================================
// 3. RECETARIO DE BIOPREPARADOS & BOKASHI (CULTIVOS 4)
// =========================================================================
window.openBiopreparadosRecipeModal = function() {
    const html = `
        <div class="space-y-4">
            <p class="text-stone-300 leading-relaxed">
                Manual agronómico limpio: fórmulas probadas en campo con insumos de bajo costo, sin dependencia de agrotóxicos sintéticos y con <b>período de carencia cero (0 días)</b>.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <!-- Receta 1: Bokashi Aeróbico -->
                <div class="bg-black/50 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-2xl">🍂</span>
                        <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">ABONO SÓLIDO</span>
                    </div>
                    <h4 class="font-bold text-white text-sm">Bokashi Aeróbico de 15 Días</h4>
                    <p class="text-[11px] text-stone-400">Nutrición radicular completa y revitalización microbiana profunda del suelo.</p>
                    <div class="bg-stone-900/80 p-2.5 rounded-xl border border-white/5 space-y-1 font-mono text-[10px]">
                        <div>• <b>Base:</b> 40% bosta de vaca seca, 30% cascarilla o paja chipeada, 20% tierra de bosque nativo, 10% carbón vegetal molido.</div>
                        <div>• <b>Inóculo:</b> 2 L de melaza + 100g de levadura en 20 L de agua tibia.</div>
                        <div>• <b>Control:</b> Voltear 2 veces al día cuando supere los 55°C. Listo a los 14-16 días.</div>
                    </div>
                </div>

                <!-- Receta 2: Caldo Sulfocálcico -->
                <div class="bg-black/50 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-2xl">🔥</span>
                        <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">FUNGICIDA / ACARICIDA</span>
                    </div>
                    <h4 class="font-bold text-white text-sm">Caldo Sulfocálcico Concentrado</h4>
                    <p class="text-[11px] text-stone-400">Control biológico de oídio, arañitas rojas y trips en viñedos y frutales caducos.</p>
                    <div class="bg-stone-900/80 p-2.5 rounded-xl border border-white/5 space-y-1 font-mono text-[10px]">
                        <div>• <b>Ingredientes:</b> 20 kg de azufre en polvo + 10 kg de cal viva (óxido de calcio) + 100 L de agua.</div>
                        <div>• <b>Cocción:</b> Hervir a fuego vivo durante 45-60 min hasta que el líquido tome color rojo teja o ladrillo.</div>
                        <div>• <b>Dosis:</b> 1.5% a 2% en receso invernal; 0.5% en follaje tierno (nunca aplicar bajo sol directo ni en cucurbitáceas).</div>
                    </div>
                </div>

                <!-- Receta 3: Té de Compost Aireado -->
                <div class="bg-black/50 border border-sky-500/30 rounded-2xl p-4 space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-2xl">🫧</span>
                        <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/40">BIOESTIMULANTE FOLIAR</span>
                    </div>
                    <h4 class="font-bold text-white text-sm">Té de Compost Aireado (ACT)</h4>
                    <p class="text-[11px] text-stone-400">Multiplicación de bacterias y hongos benéficos para colonizar la filósfera foliar.</p>
                    <div class="bg-stone-900/80 p-2.5 rounded-xl border border-white/5 space-y-1 font-mono text-[10px]">
                        <div>• <b>Bolsa:</b> 2 kg de compost maduro o vermicompost en saco de malla fina (400 micras).</div>
                        <div>• <b>Reactor:</b> 50 L de agua desclorada con bomba aireadora de acuario (inyección constante de O₂).</div>
                        <div>• <b>Alimento:</b> 100 ml de melaza + 50 ml de extracto de algas. Airear 24 a 36 horas. Aplicar antes de 4 horas de apagado.</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    openDiegeticModal({
        icon: '🧪',
        tag: '[BOTICA-AGROECOLÓGICA]',
        category: 'Recetario Limpio de Terreno',
        title: 'Botica de Biopreparados, Bokashi & Caldos Minerales',
        borderColor: '#10b981',
        status: '🌿 Fórmulas orgánicas con carencia cero y certificación biodinámica',
        html
    });
};

// =========================================================================
// 4. MATRIZ DE INTERCROPPING & GREMIOS (CULTIVOS 3)
// =========================================================================
window.openIntercroppingMatrixModal = function() {
    const html = `
        <div class="space-y-4">
            <p class="text-stone-300 leading-relaxed">
                Diseño agroecológico de estratos verticales y alelopatía positiva. El índice <b>LER (Land Equivalent Ratio)</b> mide cuánta tierra se requeriría en monocultivo para igualar la producción del policultivo asociado.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-black/50 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-white text-sm">🍇 Gremio Viñedo & Secano Costero</span>
                        <span class="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 font-mono text-[10px] font-bold">LER: 1.34 (+34%)</span>
                    </div>
                    <div class="text-[11px] text-stone-300 space-y-1 font-sans">
                        <div>• <b>Estrato Arbóreo / Espaldera:</b> Vitis vinifera (Cepa País).</div>
                        <div>• <b>Estrato Cobertura Viva:</b> Trébol subterráneo (fijador de N₂, tapiz que auto-resiembra en verano).</div>
                        <div>• <b>Estrato Insectario:</b> Lavándula angustifolia y Aliso marítimo (refugio de avispas parasitoides y crisopas).</div>
                    </div>
                </div>

                <div class="bg-black/50 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-white text-sm">🌰 Gremio Frutal de Nuez (Avellano & Nogal)</span>
                        <span class="px-2 py-0.5 rounded bg-amber-900 text-amber-300 font-mono text-[10px] font-bold">LER: 1.28 (+28%)</span>
                    </div>
                    <div class="text-[11px] text-stone-300 space-y-1 font-sans">
                        <div>• <b>Dosel Superior:</b> Avellano europeo Tonda di Giffoni (corte de viento y nuez de alto valor).</div>
                        <div>• <b>Estrato Pradera Silvopastoril:</b> Festuca arundinacea + Trébol blanco (soporta pisoteo de ovejas de invierno).</div>
                        <div>• <b>Alelopatía:</b> Residuos de cáscara ricos en taninos que impiden la proliferación de malezas competitivas.</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    openDiegeticModal({
        icon: '📐',
        tag: '[INTERCROPPING-GUILD]',
        category: 'Agroecología de Policultivos',
        title: 'Matriz de Intercropping, Gremios & Rendimiento LER',
        borderColor: '#38bdf8',
        status: '🌱 Diversidad biológica funcional para control de plagas y fertilidad natural',
        html
    });
};

// =========================================================================
// 5. CALENDARIO BIODINÁMICO & GDD (CULTIVOS 5)
// =========================================================================
window.openBiodynamicCalendarModal = function() {
    const html = `
        <div class="space-y-4">
            <div class="grid grid-cols-4 gap-2 text-center font-mono">
                <div class="bg-black/50 p-2.5 rounded-xl border border-amber-500/30">
                    <span class="text-[9px] text-stone-400 block uppercase">Fase Lunar Actual</span>
                    <span class="text-xs font-bold text-amber-300">🌔 Cuarto Creciente</span>
                </div>
                <div class="bg-black/50 p-2.5 rounded-xl border border-amber-500/30">
                    <span class="text-[9px] text-stone-400 block uppercase">GDD Acumulados</span>
                    <span class="text-xs font-bold text-emerald-400">1,420 GDD (Base 10)</span>
                </div>
                <div class="bg-black/50 p-2.5 rounded-xl border border-amber-500/30">
                    <span class="text-[9px] text-stone-400 block uppercase">Horas de Frío (HF)</span>
                    <span class="text-xs font-bold text-sky-400">620 HF (&lt;7.2°C)</span>
                </div>
                <div class="bg-black/50 p-2.5 rounded-xl border border-amber-500/30">
                    <span class="text-[9px] text-stone-400 block uppercase">Próxima Labor</span>
                    <span class="text-xs font-bold text-white">Poda de Frutales</span>
                </div>
            </div>

            <div class="bg-stone-900/80 p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
                <h4 class="font-bold text-white font-serif">Recomendaciones Fenológicas de la Semana:</h4>
                <div class="space-y-1.5 text-stone-300">
                    <div>• <b>Luna Creciente:</b> La savia asciende con fuerza. Momento ideal para siembra de hortalizas de fruto y hoja, injertación y aplicación de bioestimulantes foliares (ACT).</div>
                    <div>• <b>Evitar:</b> Poda severa en menguante o bajo riesgo de heladas tardías.</div>
                    <div>• <b>Riego Fenológico:</b> Ajustar lámina a 12.4 mm netos en cuartel de nogales por inicio de endurecimiento de cáscara.</div>
                </div>
            </div>
        </div>
    `;

    openDiegeticModal({
        icon: '📅',
        tag: '[CALENDARIO-GDD]',
        category: 'Fenología & Biodinámica',
        title: 'Calendario Agronómico, Grados Día (GDD) & Lunas',
        borderColor: '#f59e0b',
        status: '☀️ Cálculo bioclimático adaptado a la latitud 36.14°S (Maule Sur)',
        html
    });
};

// =========================================================================
// 6. ATLAS DIAGNÓSTICO FOLIAR (CULTIVOS 6)
// =========================================================================
window.openDiagnosticAtlasModal = function() {
    const html = `
        <div class="space-y-4">
            <p class="text-stone-300 leading-relaxed">
                Guía visual de identificación rápida en campo: compara las hojas de tus árboles y hortalizas para diagnosticar deficiencias nutricionales o patógenos antes de aplicar tratamientos.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="bg-black/50 border border-yellow-500/30 rounded-2xl p-3.5 space-y-1.5">
                    <span class="text-xs font-mono font-bold text-yellow-400 block">🍂 Clorosis Férrica (Fe)</span>
                    <p class="text-[11px] text-stone-400">Amarillamiento internerval pronunciado en hojas jóvenes con nervaduras verdes vivas.</p>
                    <div class="text-[10px] text-emerald-300 font-mono mt-2 bg-emerald-950/60 p-2 rounded-lg">Tratamiento: Quelatos biológicos de humus líquido + bajar pH de suelo con enmienda azufrada.</div>
                </div>

                <div class="bg-black/50 border border-amber-500/30 rounded-2xl p-3.5 space-y-1.5">
                    <span class="text-xs font-mono font-bold text-amber-400 block">🍁 Deficiencia de Potasio (K)</span>
                    <p class="text-[11px] text-stone-400">Bordes quemados o necrosados en hojas adultas inferiores, enrollamiento marginal.</p>
                    <div class="text-[10px] text-emerald-300 font-mono mt-2 bg-emerald-950/60 p-2 rounded-lg">Tratamiento: Ceniza de leña cernida (rica en carbonato de potasio) o té de consuelda rusa.</div>
                </div>

                <div class="bg-black/50 border border-sky-500/30 rounded-2xl p-3.5 space-y-1.5">
                    <span class="text-xs font-mono font-bold text-sky-400 block">💧 Estrés Hídrico Severo (CWSI &gt; 0.6)</span>
                    <p class="text-[11px] text-stone-400">Pérdida de turgencia en zarcillos de viña, enrollamiento foliar hacia el envés.</p>
                    <div class="text-[10px] text-emerald-300 font-mono mt-2 bg-emerald-950/60 p-2 rounded-lg">Tratamiento: Activar pulso de riego nocturno de reposición inmediata según sonda FDR 40cm.</div>
                </div>
            </div>
        </div>
    `;

    openDiegeticModal({
        icon: '📖',
        tag: '[ATLAS-CLÍNICO-FOLIAR]',
        category: 'Prensa Botánica & Diagnóstico',
        title: 'Atlas Diagnóstico de Deficiencias & Síntomas Foliares',
        borderColor: '#e11d48',
        status: '🔍 Diagnóstico no destructivo en terreno para operarios y técnicos',
        html
    });
};

// =========================================================================
// 7. BOTIQUÍN SAG & FITOTERAPIA GANADERA (ESTABLO 3)
// =========================================================================
window.openVeterinaryCabinetModal = function() {
    const html = `
        <div class="space-y-4">
            <p class="text-stone-300 leading-relaxed">
                Protocolo clínico preventivo: cumplimiento estricto de las exigencias del <b>Servicio Agrícola y Ganadero (SAG)</b> de Chile, complementado con medicina preventiva de base biológica y fitoterapia.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-black/50 border border-red-500/30 rounded-2xl p-4 space-y-2">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-white text-sm">📋 Calendario Oficial SAG Obligatorio</h4>
                        <span class="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 font-mono text-[10px] font-bold">100% AL DÍA</span>
                    </div>
                    <div class="space-y-1.5 text-[11px] text-stone-300 font-mono">
                        <div>• <b>Fiebre Aftosa / Brucelosis:</b> Muestreo serológico anual predial negativo. Certificado SAG #99102.</div>
                        <div>• <b>Carbunclo Bacteridiano:</b> Vacunación preventiva anual en primavera (Cepa Sterne).</div>
                        <div>• <b>Trazabilidad RUP:</b> Registro de Ubicación Predial #07-1-04-0192 activo con DIIO oficial.</div>
                    </div>
                </div>

                <div class="bg-black/50 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-white text-sm">🌿 Fitoterapia & Mineralización Natural</h4>
                        <span class="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 font-mono text-[10px] font-bold">PREVENTIVO</span>
                    </div>
                    <div class="space-y-1.5 text-[11px] text-stone-300 font-sans">
                        <div>• <b>Desparasitación Externa:</b> Baño seco con tierra de diatomeas grado alimentario en manga contra mosca brava y piojos.</div>
                        <div>• <b>Desparasitación Interna:</b> Suplemento forrajero con harina de semilla de zapallo y extracto de artemisa.</div>
                        <div>• <b>Minerales de Traza:</b> Bloques macizos de sal de roca de Cáhuil con azufre y ajo deshidratado en los abrevaderos.</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    openDiegeticModal({
        icon: '💉',
        tag: '[BOTIQUÍN-SAG-OFICIAL]',
        category: 'Sanidad Animal & Bienestar',
        title: 'Botiquín Veterinario Preventivo & Certificación SAG',
        borderColor: '#ef4444',
        status: '🛡️ Trazabilidad oficial con DIIO / Arete electrónico RFID activo',
        html
    });
};

// =========================================================================
// 8. CICLADO DE NUTRIENTES & BOSTA (ESTABLO 6)
// =========================================================================
window.openNutrientCyclingModal = function() {
    const html = `
        <div class="space-y-4">
            <p class="text-stone-300 leading-relaxed">
                En el Pastoreo Racional Voisin, los animales no son extractores de fertilidad sino <b>biorreactores móviles</b>. El estiércol y la orina concentrados en el potrero alimentan la red trófica edáfica sin gastar un solo peso en urea química.
            </p>

            <div class="grid grid-cols-3 gap-3 text-center font-mono">
                <div class="bg-black/50 p-3 rounded-xl border border-lime-500/30">
                    <span class="text-[9px] text-stone-400 block uppercase">Aporte Diario de Bosta</span>
                    <span class="text-sm font-bold text-lime-400">288 kg / día (12 vacas)</span>
                </div>
                <div class="bg-black/50 p-3 rounded-xl border border-lime-500/30">
                    <span class="text-[9px] text-stone-400 block uppercase">Aporte N-P-K Orgánico</span>
                    <span class="text-sm font-bold text-amber-300">1.8 kg N • 0.9 kg P • 2.1 kg K</span>
                </div>
                <div class="bg-black/50 p-3 rounded-xl border border-lime-500/30">
                    <span class="text-[9px] text-stone-400 block uppercase">Tiempo Desintegración</span>
                    <span class="text-sm font-bold text-emerald-400">48 hrs (Con Egg Mobile)</span>
                </div>
            </div>

            <div class="bg-stone-900/80 p-4 rounded-2xl border border-white/10 text-xs space-y-2">
                <h4 class="font-bold text-white font-serif">Sinergia Clave: La Danza de la Vaca y la Gallina</h4>
                <p class="text-stone-300 leading-relaxed">
                    Las vacas pastorean el potrero en 24 horas y dejan sus bostas. 3 días después ingresa el <b>Egg Mobile con 45 gallinas</b>: escarban las bostas para comer las larvas de moscas, esparcen el estiércol uniformemente y aportan guano rico en fósforo, dejando la pradera perfectamente abonada para iniciar sus 38-44 días de descanso biológico.
                </p>
            </div>
        </div>
    `;

    openDiegeticModal({
        icon: '🪲',
        tag: '[CICLADO-DE-NUTRIENTES]',
        category: 'Biología del Suelo & Estiércol',
        title: 'Ciclado de Nutrientes, Bosteo Natural & Escarabajos',
        borderColor: '#84cc16',
        status: '🌱 Regeneración biológica del suelo sin fertilizantes sintéticos',
        html
    });
};

// =========================================================================
// 9. GUÍA DE CAMPO: PRUEBA VESS & HORIZONTES DE SUELO (INCURSIÓN 2)
// =========================================================================
window.openSoilHorizonsModal = function() {
    const html = `
        <div class="space-y-4">
            <p class="text-stone-300 leading-relaxed">
                Manual de terreno para la evaluación física del suelo: la <b>prueba VESS (Visual Evaluation of Soil Structure)</b> permite conocer en 10 minutos la compactación, porosidad y vida de la raíz.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-black/50 border border-teal-500/30 rounded-2xl p-4 space-y-2">
                    <h4 class="font-bold text-white text-sm font-serif">Cómo ejecutar el test VESS en terreno:</h4>
                    <div class="text-[11px] text-stone-300 space-y-1.5 font-sans leading-relaxed">
                        <div><b>1. Corte del bloque:</b> Cavar una zanja pequeña y extraer un prisma de suelo intacto de 20x20 cm y 20 cm de profundidad con pala recta.</div>
                        <div><b>2. Apertura suave:</b> Dejar caer el terrón desde 1 metro de altura sobre una lona o abrirlo con las manos sin forzarlo.</div>
                        <div><b>3. Clasificación:</b> Observar el tamaño de los agregados:</div>
                        <div class="pl-3 border-l-2 border-teal-500 text-[10px] font-mono">
                            • <b>Sq1 (Muy Bueno):</b> Agregados porosos menores a 6mm, raíces abundantes.<br>
                            • <b>Sq2 (Bueno):</b> Terrones redondeados fáciles de romper con los dedos.<br>
                            • <b>Sq3 (Moderado):</b> Bloques angulares de 2 a 5 cm con resistencia.<br>
                            • <b>Sq4/Sq5 (Pobre/Compactado):</b> Bloques densos sin poros visibles (piso de arado).
                        </div>
                    </div>
                </div>

                <div class="bg-black/50 border border-teal-500/30 rounded-2xl p-4 space-y-2">
                    <h4 class="font-bold text-white text-sm font-serif">Estratigrafía Registrada en Fundo Meniel:</h4>
                    <div class="space-y-2 text-[11px] font-mono">
                        <div class="bg-teal-950/40 p-2.5 rounded-xl border border-teal-500/30">
                            <span class="text-teal-300 font-bold block">Horizonte O (0 - 4 cm) • Mantillo</span>
                            <span class="text-stone-400">Hojarasca de boldo y quillay en descomposición activa con hifas blancas.</span>
                        </div>
                        <div class="bg-teal-950/40 p-2.5 rounded-xl border border-teal-500/30">
                            <span class="text-teal-300 font-bold block">Horizonte A (4 - 24 cm) • Capa Orgánica</span>
                            <span class="text-stone-400">Franco arcilloso, estructura granular esponjosa, MOS: 7.8%, VESS: Sq1.</span>
                        </div>
                        <div class="bg-teal-950/40 p-2.5 rounded-xl border border-teal-500/30">
                            <span class="text-teal-300 font-bold block">Horizonte B (24 - 55 cm) • Acumulación</span>
                            <span class="text-stone-400">Mayor contenido de arcillas montmorillonitas con alta capacidad de retención de agua.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    openDiegeticModal({
        icon: '🟤',
        tag: '[MUESTREO-VESS-SUELO]',
        category: 'Edafología & Suelo Vivo',
        title: 'Guía de Campo VESS & Horizontes Edafológicos',
        borderColor: '#14b8a6',
        status: '🧱 Protocolo estandarizado SRUC para monitoreo directo de infiltración',
        html
    });
};

// =========================================================================
// 10. CÁMARAS TRAMPA & FAUNA NATIVA (INCURSIÓN 3)
// =========================================================================
window.openCameraTrapGalleryModal = function() {
    const html = `
        <div class="space-y-4">
            <p class="text-stone-300 leading-relaxed">
                Fototrampeo no invasivo en el corredor ribereño del Estero Colliguay: cámaras infrarrojas de activación térmica (PIR) registrando la fauna nativa residente.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div class="bg-black/50 border border-sky-500/30 rounded-2xl p-4 space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-2xl">🦊</span>
                        <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/40">NOCTURNO</span>
                    </div>
                    <h4 class="font-bold text-white text-sm">Zorro Culpeo (Lycalopex culpaeus)</h4>
                    <p class="text-[11px] text-stone-400">Registro: Cámara #02 • 02:44 AM • Temperatura: 11.2°C</p>
                    <div class="text-[10px] text-stone-300 bg-stone-900 p-2 rounded-lg font-mono">
                        Rol: Depredador tope en el predio. Control biológico de roedores y conejos silvestres.
                    </div>
                </div>

                <div class="bg-black/50 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-2xl">🦌</span>
                        <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">CREPUSCULAR</span>
                    </div>
                    <h4 class="font-bold text-white text-sm">Pudú (Pudu puda)</h4>
                    <p class="text-[11px] text-stone-400">Registro: Cámara #01 • 06:15 AM • Humedad: 88%</p>
                    <div class="text-[10px] text-stone-300 bg-stone-900 p-2 rounded-lg font-mono">
                        Rol: Bioindicador de regeneración densa del sotobosque y ausencia de perros asilvestrados.
                    </div>
                </div>

                <div class="bg-black/50 border border-purple-500/30 rounded-2xl p-4 space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-2xl">🐱</span>
                        <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">NOCTURNO</span>
                    </div>
                    <h4 class="font-bold text-white text-sm">Güiña (Leopardus guigna)</h4>
                    <p class="text-[11px] text-stone-400">Registro: Cámara #04 • 23:18 PM • Riberas</p>
                    <div class="text-[10px] text-stone-300 bg-stone-900 p-2 rounded-lg font-mono">
                        Rol: El felino más pequeño de América, arborícola, utiliza las copas continuas del bosque nativo.
                    </div>
                </div>
            </div>
        </div>
    `;

    openDiegeticModal({
        icon: '📸',
        tag: '[FOTOTRAMPEO-FAUNA]',
        category: 'Monitoreo de Vida Silvestre',
        title: 'Cámaras Trampa, Fauna Nativa & Horarios de Paso',
        borderColor: '#38bdf8',
        status: '4 Cámaras Activas • Red de Detección Térmica Nocturna',
        html: html
    });
};

// =========================================================================
// 12. GABINETE IP67 & CEREBRO IOT ESP32 IN SITU (MODAL DIRECTO EN RAMA)
// =========================================================================
window.openCajaTerrenoHubModal = function(initialBranch = 'general') {
    let curBranch = initialBranch;
    let curTab = 'operation'; // 'operation' | 'wiring'
    let curCircuitId = 'circuit-sht45-weather';

    const circuitsList = [
        {
            id: 'circuit-sht45-weather',
            title: 'SHT45 Termo-Higrómetro Digital (Abrigo Meteorológico)',
            sensorName: 'Sensirion SHT45 (±1.5% RH, ±0.1°C)',
            mcu: 'ESP32-S3 LoRaWAN',
            voltage: '3.3V DC LDO',
            protocol: 'I2C Bus (0x44)',
            icon: '🌤️',
            difficulty: 'Fácil (4 cables)',
            description: 'Sensor digital para temperatura de bulbo seco y humedad relativa. Calcula el Bulbo Húmedo (Stull) para defensa de heladas y estrés vegetal.',
            materials: [
                '1x ESP32-S3 DevKit',
                '1x Módulo SHT45 con cápsula de teflón antipolvo',
                '2x Resistencias Pull-Up 4.7 kΩ (SDA/SCL)',
                '1x Cable apantallado 4 hilos AWG 24'
            ],
            connections: [
                { pinSensor: 'VIN / VDD', pinEsp: '3V3', color: '#ef4444', wireType: 'Alimentación 3.3V', note: 'Nunca conectar a 5V (daña el chip SHT45)' },
                { pinSensor: 'GND', pinEsp: 'GND', color: '#1e293b', wireType: 'Tierra común', note: 'Conectar también malla de chasis' },
                { pinSensor: 'SDA', pinEsp: 'GPIO 21 (SDA)', color: '#38bdf8', wireType: 'I2C Data', note: 'Línea de datos con pull-up' },
                { pinSensor: 'SCL', pinEsp: 'GPIO 22 (SCL)', color: '#facc15', wireType: 'I2C Clock', note: 'Reloj sincronizado a 100 kHz' }
            ],
            codeSnippet: `// ESP32 Arduino Wire.h (Lectura SHT45)
#include <Wire.h>
#define SHT45_ADDR 0x44
void setup() {
  Wire.begin(21, 22, 100000);
}
void loop() {
  Wire.beginTransmission(SHT45_ADDR);
  Wire.write(0xFD);
  Wire.endTransmission();
  delay(10);
  Wire.requestFrom(SHT45_ADDR, 6);
  delay(2000);
}`,
            tip: '💡 Consejo de Terreno: Para evitar lecturas falseadas por el sol directo, coloca el SHT45 dentro de un abrigo meteorológico o plato de lamas blancas ventilado a 1.2 m en el cuartel.'
        },
        {
            id: 'circuit-fdr-soil',
            title: 'Sonda FDR Multinivel de Suelo (Estratos 20, 40, 60 cm)',
            sensorName: 'Sonda FDR Multi-Estrato RS485 Modbus',
            mcu: 'ESP32-S3 + MAX485',
            voltage: '12V DC (Sonda) / 3.3V (ESP32)',
            protocol: 'RS485 Modbus RTU',
            icon: '🌱',
            difficulty: 'Intermedio (Módulo MAX485)',
            description: 'Sonda tubular enterrada para medición continua del contenido volumétrico de agua (VWC) y conductividad. Comunica por bus industrial RS485 diferencial.',
            materials: [
                '1x ESP32-S3',
                '1x Módulo MAX485 / SP3485 (TTL a RS485)',
                '1x Sonda FDR multinivel con conector M12',
                '1x Resistencia terminal de 120 Ω entre líneas A y B'
            ],
            connections: [
                { pinSensor: 'VCC (12V)', pinEsp: 'VOUT 12V Conmutable', color: '#ef4444', wireType: 'Alimentación 12V', note: 'Encendido vía transistor MOSFET P' },
                { pinSensor: 'GND', pinEsp: 'GND', color: '#1e293b', wireType: 'Tierra común', note: 'Referencia común 0V' },
                { pinSensor: 'Línea A (+)', pinEsp: 'MAX485 Pin A', color: '#22c55e', wireType: 'RS485 A (+)', note: 'Par trenzado industrial' },
                { pinSensor: 'Línea B (-)', pinEsp: 'MAX485 Pin B', color: '#38bdf8', wireType: 'RS485 B (-)', note: 'Par trenzado industrial' },
                { pinSensor: 'MAX485 RO (Rx)', pinEsp: 'GPIO 16 (UART2 Rx)', color: '#a855f7', wireType: 'UART Serial Rx', note: 'Lectura de tramas Modbus hex' },
                { pinSensor: 'MAX485 DI (Tx)', pinEsp: 'GPIO 17 (UART2 Tx)', color: '#ec4899', wireType: 'UART Serial Tx', note: 'Envío de peticiones Modbus' },
                { pinSensor: 'MAX485 RE/DE', pinEsp: 'GPIO 4 (Dirección)', color: '#f59e0b', wireType: 'Control de Flujo', note: 'HIGH = Transmitir, LOW = Recibir' }
            ],
            codeSnippet: `// Modbus RTU Master ESP32
#define PIN_RS485_DIR 4
void setup() {
  pinMode(PIN_RS485_DIR, OUTPUT);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
}`,
            tip: '💡 Consejo de Terreno: Los buses RS485 toleran hasta 1.200 metros en el campo. Usa cable STP apantallado para aislar el ruido de motores y bombas.'
        },
        {
            id: 'circuit-relays-actuators',
            title: 'Módulo de 4 Canales de Relé Optoacoplados (Electroválvulas 24VAC)',
            sensorName: 'Banco de Relés SPDT Songle 10A 250VAC',
            mcu: 'ESP32-S3 Industrial',
            voltage: '5V (Bobinas) / 3.3V (Optoaisladores)',
            protocol: 'GPIO Digital (Active-LOW)',
            icon: '⚡',
            difficulty: 'Intermedio (Lógica Optoacoplador)',
            description: 'Conmutación de potencia para electroválvulas de riego, bomba trifásica y aspersión antiheladas con aislamiento galvánico de transitorios inductivos.',
            materials: [
                '1x ESP32-S3',
                '1x Módulo 4 u 8 Relés con optoacopladores PC817',
                '1x Transformador 220V a 24V AC para electroválvulas',
                '4x Snubbers RC / Diodos Flyback'
            ],
            connections: [
                { pinSensor: 'VCC (Módulo Relé)', pinEsp: '5V (Fuente Externa)', color: '#ef4444', wireType: 'Alimentación Bobinas', note: 'No sobrecargar el regulador 3.3V' },
                { pinSensor: 'GND (Módulo Relé)', pinEsp: 'GND Común', color: '#1e293b', wireType: 'Tierra sistema', note: 'Referencia 0V' },
                { pinSensor: 'IN1 (Bomba Pozo)', pinEsp: 'GPIO 25', color: '#f59e0b', wireType: 'Salida Digital', note: 'LOW = Bobina armada / Contacto cerrado' },
                { pinSensor: 'IN2 (Válvula Cerezos)', pinEsp: 'GPIO 26', color: '#10b981', wireType: 'Salida Digital', note: 'LOW = Riego nocturno activo' },
                { pinSensor: 'IN3 (Válvula Viña)', pinEsp: 'GPIO 27', color: '#8b5cf6', wireType: 'Salida Digital', note: 'LOW = Sector RDC abierto' },
                { pinSensor: 'IN4 (Aspersión Helada)', pinEsp: 'GPIO 14', color: '#06b6d4', wireType: 'Salida Digital', note: 'Interbloqueo si bulbo húmedo < -0.5°C' }
            ],
            codeSnippet: `// Relés Optoacoplados (Active-LOW)
#define RELAY_PUMP 25
#define RELAY_VALVE_CHERRIES 26
void setup() {
  digitalWrite(RELAY_PUMP, HIGH);
  pinMode(RELAY_PUMP, OUTPUT);
}`,
            tip: '💡 Consejo de Seguridad: Retira el jumper "JD-VCC" para tener aislamiento galvánico 100% puro entre la lógica del ESP32 y la potencia de los motores.'
        },
        {
            id: 'circuit-phytos31-leaf',
            title: 'Sensor de Mojamiento Foliar (PHYTOS-31 Mills)',
            sensorName: 'METER PHYTOS-31 Dieléctrico',
            mcu: 'ESP32-C3 Ultra-Low-Power',
            voltage: '2.5V - 5V DC',
            protocol: 'Salida Analógica ADC (mV)',
            icon: '🍃',
            difficulty: 'Fácil (3 cables)',
            description: 'Mide la presencia de película de agua sobre la canopia foliar. Esencial para calcular las "Horas de Hoja Mojada" contra Botrytis cinerea.',
            materials: [
                '1x ESP32-C3',
                '1x Sensor de hoja artificial PHYTOS-31',
                '1x Soporte de montaje a 45°'
            ],
            connections: [
                { pinSensor: 'Blanco (VCC)', pinEsp: '3V3 Conmutable', color: '#ef4444', wireType: 'Alimentación DC', note: '2.5V a 5.0V (miliamperios mínimos)' },
                { pinSensor: 'Negro (GND)', pinEsp: 'GND', color: '#1e293b', wireType: 'Tierra común', note: 'Referencia analógica 0V' },
                { pinSensor: 'Rojo (Output)', pinEsp: 'GPIO 34 (ADC1_CH6)', color: '#10b981', wireType: 'Entrada ADC', note: '250 a 1250 mV (<450mV = Seco, >600mV = Mojado)' }
            ],
            codeSnippet: `// Lectura ADC PHYTOS-31
#define PIN_LEAF_ADC 34
void setup() {
  analogSetPinAttenuation(PIN_LEAF_ADC, ADC_11db);
}`,
            tip: '💡 Consejo de Terreno: Orienta la hoja artificial hacia el norte en un ángulo de 45° simulando las hojas reales. Limpia suavemente con agua destilada.'
        }
    ];

    const actuatorsData = [
        // GENERAL
        { id: 'act_pump_deepwell', branch: 'general', name: 'Bomba Pozo Profundo (MEE DGA)', category: 'Extracción Hídrica', icon: '⚡', voltage: '380V Trifásico', kw: 15.0, mode: 'auto', state: false, lockout: 'Turno de canal activo. Ahorro energético en curso.', rule: 'Apagado si reserva de suelo > 3d y turno en < 4d.', impact: 'Ahorro de $112.000 CLP/semana al priorizar gravedad.' },
        { id: 'act_canal_gate', branch: 'general', name: 'Compuerta Matriz Turno Canal', category: 'Riego Gravitacional', icon: '🌊', voltage: '24V DC Actuador', kw: 0.2, mode: 'auto', state: true, lockout: null, rule: 'Apertura programada rol Asociación Canalistas (Martes 08:00 h).', impact: 'Ingreso de 1.150 m³ sin costo eléctrico.' },
        { id: 'act_master_valve', branch: 'general', name: 'Válvula Matriz Tranque Keyline', category: 'Distribución Principal', icon: '🚰', voltage: '24V AC', kw: 0.05, mode: 'auto', state: true, lockout: null, rule: 'Presurización gravimétrica mientras tranque > 25% cota.', impact: 'Presión natural 2.2 bar hacia cuarteles bajos.' },
        
        // CUARTELES / PLANTAS
        { id: 'act_valve_sector_cherries', branch: 'cuarteles', name: 'Electroválvula Sector 1 (Cerezos Lapins)', category: 'Riego Localizado Goteo', icon: '🍒', voltage: '24V AC', kw: 0.04, mode: 'auto', state: false, lockout: 'Lluvia > 12 mm en 48h. Evita cracking.', rule: 'Riego nocturno (22:00 a 04:00) anti-evapotranspiración.', impact: 'Preserva cutícula y evita rajado de fruta exportación.' },
        { id: 'act_frost_sprinklers', branch: 'cuarteles', name: 'Aspersión Antihelada Sub-Copa', category: 'Defensa Térmica', icon: '❄️', voltage: '380V Booster', kw: 22.0, mode: 'auto', state: false, lockout: 'BLOQUEO: Bulbo Húmedo es -1.5°C (< -0.5°C). Aspersión prohibida por daño evaporativo destructivo.', rule: 'Arma solo si T. Fruta <= 0°C Y Bulbo Húmedo >= -0.5°C.', impact: 'Protege $14.5M CLP en botones florales sin congelación.' },
        { id: 'act_valve_vineyard', branch: 'cuarteles', name: 'Riego Deficitario Controlado (Viña País)', category: 'Manejo Enológico', icon: '🍇', voltage: '24V AC', kw: 0.04, mode: 'auto', state: false, lockout: null, rule: 'Sostiene estrés moderado (CWSI 0.35-0.45) para polifenoles.', impact: 'Concentración de brix y taninos en cepa patrimonial.' },

        // ESTABLO / GANADERÍA
        { id: 'act_water_trough', branch: 'establo', name: 'Llenado Automático Bebederos P1-P8', category: 'Hidratación Animal', icon: '🐄', voltage: '12V DC Flotador', kw: 0.02, mode: 'auto', state: true, lockout: null, rule: 'Corte por helada severa < -2.0°C para cuidar cañerías.', impact: 'Asegura 60 L/vaca/día para rebaño Clavel Alemán.' },
        { id: 'act_curtains_barn', branch: 'establo', name: 'Cortinas Motorizadas Galpón (Viento Puelche)', category: 'Climatización Establo', icon: '🏠', voltage: '220V Reductor', kw: 0.75, mode: 'auto', state: false, lockout: null, rule: 'Cierre hermético si ráfagas de Puelche > 25 km/h o lluvia > 5 mm/h.', impact: 'Mantiene ITH 64.2 y zona de confort sin estrés eólico.' },
        { id: 'act_gate_prv', branch: 'establo', name: 'Portón Automatizado Pastoreo Voisin (PRV)', category: 'Manejo Rotacional', icon: '🚪', voltage: '12V DC Solar', kw: 0.05, mode: 'auto', state: false, lockout: null, rule: 'Apertura hacia potrero P1 tras 42 días de reposo de pasto.', impact: 'Cero sobrepastoreo. Rotación programada P3 -> P1.' },
        { id: 'act_feed_doser', branch: 'establo', name: 'Dosificador Suplementación Térmica', category: 'Nutrición Inviernal', icon: '🌾', voltage: '220V Sinfín', kw: 1.1, mode: 'auto', state: false, lockout: null, rule: 'Incrementa 15% ración seca si el pronóstico anuncia frentes polares < 0°C.', impact: 'Mantenimiento del calor metabólico del ganado.' }
    ];

    function renderModalBody() {
        const branchActs = actuatorsData.filter(a => a.branch === curBranch);
        const curCircuit = circuitsList.find(c => c.id === curCircuitId) || circuitsList[0];

        let tftRightHtml = '';
        if (curBranch === 'cuarteles') {
            tftRightHtml = `
                <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #34d399; margin-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>🍒 SUB-RAMA: CUARTELES & FRUTALES</span>
                    <span>Sector 1</span>
                </div>
                <div style="font-size: 20px; font-weight: bold; color: #f87171;">
                    -0.8°C <span style="font-size: 11px; font-weight: normal; color: #fca5a5;">(T. Floración 1.2m)</span>
                </div>
                <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 3px;">
                    Ventana Fitosanitaria: <strong style="color: #34d399;">07:30 - 11:30 h</strong> (Deriva segura &lt; 10 km/h)
                </div>
                <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 2px;">
                    Riesgo Cracking 72h: <strong style="color: #fbbf24;">14.5 mm (75% Prob.)</strong>
                </div>
                <div style="font-size: 10.5px; color: #fde047; margin-top: 4px; background: rgba(245,158,11,0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245,158,11,0.3);">
                    🍄 Presión Botrytis: <strong>82% (Mills)</strong> • Mojamiento Foliar: 11.5 h
                </div>
            `;
        } else if (curBranch === 'establo') {
            tftRightHtml = `
                <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #fbbf24; margin-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>🐂 SUB-RAMA: ESTABLO & GANADERÍA</span>
                    <span>Galpón PRV</span>
                </div>
                <div style="font-size: 20px; font-weight: bold; color: #10b981;">
                    64.2 <span style="font-size: 11px; font-weight: normal; color: #6ee7b7;">(Índice ITH / Confort)</span>
                </div>
                <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 3px;">
                    Climatización: <strong style="color: #4ade80;">Zona de Confort Térmico</strong> (Sin estrés calórico)
                </div>
                <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 2px;">
                    Bebederos Automáticos: <strong style="color: #38bdf8;">Presurizados P1-P8</strong> (60 L/vaca)
                </div>
                <div style="font-size: 10.5px; color: #fde047; margin-top: 4px; background: rgba(245,158,11,0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245,158,11,0.3);">
                    🚪 Portón PRV: <strong>Listo para Rotación a P1</strong> (42d reposo)
                </div>
            `;
        } else {
            tftRightHtml = `
                <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #fbbf24; margin-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>🌱 MICROCLIMA REAL DE SUELO & FRUTA</span>
                    <span>Hondonada</span>
                </div>
                <div style="font-size: 20px; font-weight: bold; color: #f87171;">
                    -0.8°C <span style="font-size: 11px; font-weight: normal; color: #fca5a5;">(T. Fruta a 1.2m)</span>
                </div>
                <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 3px;">
                    Bulbo Húmedo (Stull): <strong style="color: #f87171;">-1.5°C</strong> (Drenaje Katabático)
                </div>
                <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 2px;">
                    Humedad Suelo FDR: <strong>36.2% VWC</strong> (Perfil radicular 20-60cm)
                </div>
                <div style="font-size: 10.5px; color: #34d399; margin-top: 4px; background: rgba(16,185,129,0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.3);">
                    🍃 Mojamiento Foliar: <strong>11.5 h</strong> (Presión Botrytis: 82%)
                </div>
            `;
        }

        const switchesHtml = branchActs.map(act => {
            const isLockout = !!act.lockout;
            const modeColor = act.mode === 'auto' ? '#f59e0b' : (act.mode === 'on' ? '#22c55e' : '#ef4444');
            const ledColor = act.state ? '#22c55e' : '#64748b';

            return `
                <div style="background: #140904; border: 1px solid ${isLockout ? '#b91c1c' : '#451a03'}; border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 18px;">${act.icon}</span>
                            <strong style="color: #ffffff; font-size: 12px;">${act.name}</strong>
                            <span style="font-size: 9px; font-family: monospace; background: rgba(255,255,255,0.08); padding: 1px 6px; border-radius: 4px; color: #cbd5e1;">
                                ${act.voltage} • ${act.kw} kW
                            </span>
                        </div>
                        <div style="font-size: 10.5px; color: #94a3b8; margin-top: 3px;">
                            ${act.category} • <em>${act.rule}</em>
                        </div>
                        ${isLockout ? `
                            <div style="margin-top: 4px; font-size: 10px; color: #fca5a5; background: rgba(239,68,68,0.2); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(239,68,68,0.4);">
                                ⚠️ ${act.lockout}
                            </div>
                        ` : `
                            <div style="margin-top: 3px; font-size: 10px; color: #4ade80;">
                                ✓ ${act.impact}
                            </div>
                        `}
                    </div>

                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: ${ledColor}; box-shadow: 0 0 8px ${ledColor};"></span>
                        <button onclick="window.cycleHubActuatorMode('${act.id}')" style="padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 11px; font-weight: 800; cursor: pointer; border: 1px solid ${modeColor}; background: ${act.mode === 'auto' ? 'rgba(245, 158, 11, 0.2)' : (act.mode === 'on' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)')}; color: ${modeColor};">
                            ${act.mode.toUpperCase()}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // HTML Vista Cableado Físico
        const wiringHtml = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <!-- Header de Selección de Circuito -->
                <div style="background: linear-gradient(135deg, #091326 0%, #17153b 100%); border: 1px solid #3b82f6; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                        <div>
                            <span style="font-size: 9px; font-family: monospace; background: #2563eb; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold;">ESQUEMA EDUCATIVO INTERACTIVO</span>
                            <div style="font-size: 14px; font-weight: bold; color: #ffffff; margin-top: 3px;">🛠️ ${curCircuit.title}</div>
                        </div>
                        <div style="font-size: 10.5px; font-family: monospace; color: #93c5fd; background: rgba(0,0,0,0.4); padding: 3px 8px; border-radius: 6px;">
                            MCU: <strong style="color: #67e8f9;">${curCircuit.mcu}</strong> • Bus: <strong style="color: #fde047;">${curCircuit.protocol}</strong>
                        </div>
                    </div>

                    <!-- Selector de Circuitos -->
                    <div style="display: flex; gap: 6px; overflow-x: auto; padding-top: 4px;">
                        ${circuitsList.map(c => `
                            <button onclick="window.switchHubCircuit('${c.id}')" style="
                                padding: 5px 10px;
                                border-radius: 6px;
                                font-size: 10.5px;
                                font-family: monospace;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                gap: 6px;
                                white-space: nowrap;
                                border: 1px solid ${c.id === curCircuitId ? '#38bdf8' : 'rgba(255,255,255,0.1)'};
                                background: ${c.id === curCircuitId ? 'rgba(56,189,248,0.25)' : 'rgba(15,23,42,0.8)'};
                                color: ${c.id === curCircuitId ? '#ffffff' : '#cbd5e1'};
                                font-weight: ${c.id === curCircuitId ? 'bold' : 'normal'};
                            ">
                                <span>${c.icon}</span>
                                <span>${c.sensorName.split(' ')[0]}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Tablero Físico y Trazas de Cableado -->
                <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 12px;">
                    
                    <!-- Diagrama Visual -->
                    <div style="background: #080d16; border: 2px solid #1e293b; border-radius: 10px; padding: 12px; position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px; margin-bottom: 10px; font-size: 10px; font-family: monospace; color: #38bdf8;">
                            <span>PINOUT & TERMINALES (COLOR-CODED)</span>
                            <button onclick="window.testHubSignalPulse()" style="background: rgba(34,197,94,0.2); border: 1px solid #22c55e; color: #86efac; padding: 2px 6px; border-radius: 4px; cursor: pointer; font-size: 9.5px;">⚡ Probar Pulso</button>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: stretch; gap: 14px; min-height: 220px;">
                            <!-- ESP32 -->
                            <div style="flex: 1; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 8px; display: flex; flex-direction: column; justify-content: space-between;">
                                <div style="text-align: center; font-size: 10px; font-weight: bold; color: #f8fafc; font-family: monospace; border-bottom: 1px solid #334155; padding-bottom: 4px;">ESP32-S3 Board</div>
                                <div style="display: flex; flex-direction: column; gap: 5px; margin: 8px 0;">
                                    ${curCircuit.connections.map(c => `
                                        <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; border: 1px solid ${c.color}; padding: 3px 6px; border-radius: 3px; font-size: 9.5px; font-family: monospace;">
                                            <span style="color: #cbd5e1; font-weight: bold;">${c.pinEsp}</span>
                                            <span style="width: 7px; height: 7px; border-radius: 50%; background: ${c.color};"></span>
                                        </div>
                                    `).join('')}
                                </div>
                                <div style="text-align: center; font-size: 8.5px; color: #64748b; font-family: monospace;">LoRa / SPI / I2C</div>
                            </div>

                            <!-- Cables -->
                            <div style="width: 50px; display: flex; flex-direction: column; justify-content: center; gap: 10px; align-items: center;">
                                ${curCircuit.connections.map(c => `
                                    <div style="width: 100%; height: 3px; background: ${c.color}; border-radius: 2px; box-shadow: 0 0 5px ${c.color};" title="${c.wireType}"></div>
                                `).join('')}
                            </div>

                            <!-- Sensor -->
                            <div style="flex: 1; background: #131d2e; border: 1px solid #1e3a5f; border-radius: 6px; padding: 8px; display: flex; flex-direction: column; justify-content: space-between;">
                                <div style="text-align: center; font-size: 10px; font-weight: bold; color: #38bdf8; font-family: monospace; border-bottom: 1px solid #1e3a5f; padding-bottom: 4px;">${curCircuit.sensorName.split('(')[0]}</div>
                                <div style="display: flex; flex-direction: column; gap: 5px; margin: 8px 0;">
                                    ${curCircuit.connections.map(c => `
                                        <div style="display: flex; justify-content: space-between; align-items: center; background: #0c4a6e; border: 1px solid ${c.color}; padding: 3px 6px; border-radius: 3px; font-size: 9.5px; font-family: monospace;">
                                            <span style="width: 7px; height: 7px; border-radius: 50%; background: ${c.color};"></span>
                                            <span style="color: #e2e8f0; font-weight: bold;">${c.pinSensor}</span>
                                        </div>
                                    `).join('')}
                                </div>
                                <div style="text-align: center; font-size: 8.5px; color: #38bdf8; font-family: monospace;">${curCircuit.protocol}</div>
                            </div>
                        </div>

                        <div id="hubPulseFeedback" style="display: none; margin-top: 8px; background: rgba(34,197,94,0.15); border: 1px solid #22c55e; border-radius: 4px; padding: 4px; font-size: 9.5px; font-family: monospace; color: #86efac; text-align: center;">
                            ⚡ Pulso transmitido: Paquete ACK recibido con 0 errores de paridad.
                        </div>
                    </div>

                    <!-- Paso a Paso & Instrucciones -->
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 10.5px;">
                        <div style="background: #182234; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #cbd5e1; line-height: 1.35;">
                            ${curCircuit.description}
                        </div>

                        <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 8px; max-height: 140px; overflow-y: auto;">
                            <div style="font-size: 9.5px; font-weight: bold; color: #94a3b8; font-family: monospace; margin-bottom: 4px;">CONEXIONES CABLE A CABLE:</div>
                            ${curCircuit.connections.map(c => `
                                <div style="border-left: 2px solid ${c.color}; padding-left: 6px; margin-bottom: 4px; font-size: 9.5px; font-family: monospace;">
                                    <strong style="color: #fff;">${c.pinSensor} ➔ ${c.pinEsp}</strong> (${c.wireType})
                                    <div style="color: #94a3b8; font-size: 8.5px;">${c.note}</div>
                                </div>
                            `).join('')}
                        </div>

                        <div style="background: rgba(245,158,11,0.1); border: 1px solid #d97706; border-radius: 6px; padding: 6px 8px; font-size: 9.5px; color: #fef08a;">
                            ${curCircuit.tip}
                        </div>
                    </div>
                </div>

                <!-- Firmware & BOM -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div style="background: #111827; border: 1px solid #1f2937; border-radius: 6px; padding: 8px; font-size: 10px;">
                        <strong style="color: #f3f4f6; font-family: monospace;">📦 Materiales Necesarios:</strong>
                        <ul style="margin: 4px 0 0 0; padding-left: 16px; color: #9ca3af; display: flex; flex-direction: column; gap: 2px;">
                            ${curCircuit.materials.map(m => `<li>${m}</li>`).join('')}
                        </ul>
                    </div>

                    <div style="background: #09090b; border: 1px solid #27272a; border-radius: 6px; padding: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="font-size: 9.5px; font-family: monospace; color: #a1a1aa; font-weight: bold;">💻 FIRMWARE ARDUINO / ESP32:</span>
                        </div>
                        <pre style="margin: 0; background: #000; padding: 6px; border-radius: 4px; color: #4ade80; font-family: monospace; font-size: 9px; max-height: 90px; overflow-y: auto;">${curCircuit.codeSnippet}</pre>
                    </div>
                </div>
            </div>
        `;

        return `
            <div style="display: flex; flex-direction: column; gap: 14px;">
                
                <!-- Barra de Conmutación Modo (Operación vs Esquema de Conexiones) -->
                <div style="display: flex; justify-content: space-between; align-items: center; background: #140803; padding: 6px 10px; border-radius: 10px; border: 1px solid #78350f; gap: 8px;">
                    
                    <!-- Pestaña Operación vs Wiring -->
                    <div style="display: flex; gap: 6px;">
                        <button onclick="window.switchHubEnclosureTab('operation')" style="padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 11px; font-weight: bold; cursor: pointer; border: 1px solid ${curTab === 'operation' ? '#f59e0b' : 'rgba(255,255,255,0.1)'}; background: ${curTab === 'operation' ? '#b45309' : '#1e1108'}; color: #ffffff;">
                            🎛️ Operación & Relés
                        </button>
                        <button onclick="window.switchHubEnclosureTab('wiring')" style="padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 11px; font-weight: bold; cursor: pointer; border: 1px solid ${curTab === 'wiring' ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; background: ${curTab === 'wiring' ? '#0369a1' : '#1e1108'}; color: #ffffff;">
                            🛠️ Esquema de Conexiones Físicas (Pinout)
                        </button>
                    </div>

                    <!-- Barra de Ramas dentro del Gabinete -->
                    <div style="display: flex; gap: 6px;">
                        <button onclick="window.switchHubEnclosureBranch('general')" style="padding: 5px 9px; border-radius: 6px; font-family: monospace; font-size: 10px; font-weight: bold; cursor: pointer; border: 1px solid ${curBranch === 'general' ? '#f59e0b' : 'rgba(120,53,15,0.5)'}; background: ${curBranch === 'general' ? 'rgba(245,158,11,0.25)' : '#1e0e06'}; color: ${curBranch === 'general' ? '#fde047' : '#cbd5e1'};">
                            🏡 General
                        </button>
                        <button onclick="window.switchHubEnclosureBranch('cuarteles')" style="padding: 5px 9px; border-radius: 6px; font-family: monospace; font-size: 10px; font-weight: bold; cursor: pointer; border: 1px solid ${curBranch === 'cuarteles' ? '#f59e0b' : 'rgba(120,53,15,0.5)'}; background: ${curBranch === 'cuarteles' ? 'rgba(245,158,11,0.25)' : '#1e0e06'}; color: ${curBranch === 'cuarteles' ? '#fde047' : '#cbd5e1'};">
                            🍒 Cuarteles
                        </button>
                        <button onclick="window.switchHubEnclosureBranch('establo')" style="padding: 5px 9px; border-radius: 6px; font-family: monospace; font-size: 10px; font-weight: bold; cursor: pointer; border: 1px solid ${curBranch === 'establo' ? '#f59e0b' : 'rgba(120,53,15,0.5)'}; background: ${curBranch === 'establo' ? 'rgba(245,158,11,0.25)' : '#1e0e06'}; color: ${curBranch === 'establo' ? '#fde047' : '#cbd5e1'};">
                            🐂 Establo
                        </button>
                    </div>
                </div>

                ${curTab === 'wiring' ? wiringHtml : `
                    <!-- PANTALLA TFT SIMULADA 3.5" (ESP32 ILI9341) -->
                    <div style="background: #080d08; border: 2px solid #14532d; border-radius: 12px; padding: 12px; font-family: monospace;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #14532d; padding-bottom: 6px; margin-bottom: 10px; font-size: 11px; color: #4ade80;">
                            <span style="background: #14532d; color: #86efac; padding: 2px 6px; border-radius: 4px; font-weight: bold;">TFT-ILI9341 SPI (ESP32-S3)</span>
                            <span>ENLACE: LORAWAN / WIFI • BATT: 98% (Solar)</span>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <!-- MACRO -->
                            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid #1e3a5f; padding: 10px; border-radius: 8px; color: #38bdf8;">
                                <div style="font-size: 10px; font-weight: bold; color: #7dd3fc; margin-bottom: 4px;">🌤️ MACRO-CLIMA (OPENWEATHER API)</div>
                                <div style="font-size: 20px; font-weight: bold; color: #ffffff;">18.5°C <span style="font-size: 11px; color: #94a3b8;">(Abrigo 2m)</span></div>
                                <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 3px;">Condición: <strong>Cielo Despejado</strong> (15% nubes)</div>
                                <div style="font-size: 10.5px; color: #cbd5e1;">Viento: <strong>9.0 km/h</strong> (Ráfagas 14.2 km/h)</div>
                                <div style="font-size: 10.5px; color: #fbbf24; margin-top: 4px;">Lluvia 72h: <strong>14.5 mm</strong> (75% Prob.)</div>
                            </div>

                            <!-- MICRO -->
                            <div style="background: rgba(20, 10, 5, 0.85); border: 1px solid #78350f; padding: 10px; border-radius: 8px; color: #fde047;">
                                ${tftRightHtml}
                            </div>
                        </div>
                    </div>

                    <!-- BANCO DE INTERRUPTORES Y RELÉS -->
                    <div style="background: #24130a; border: 2px solid #78350f; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(120,53,15,0.7); padding-bottom: 6px;">
                            <strong style="color: #fde047; font-size: 13px; font-family: Georgia, serif;">
                                🎛️ Banco de Interruptores & Relés Industriales (${branchActs.length} Actuadores):
                            </strong>
                            <span style="font-size: 9.5px; font-family: monospace; background: rgba(0,0,0,0.5); padding: 3px 6px; border-radius: 4px; border: 1px solid #b45309; color: #fde047;">
                                RAMA: ${curBranch.toUpperCase()}
                            </span>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${switchesHtml}
                        </div>
                    </div>
                `}

            </div>
        `;
    }

    window.switchHubEnclosureTab = function(tab) {
        curTab = tab;
        const body = document.getElementById('diegeticModalBody');
        if (body) body.innerHTML = renderModalBody();
    };

    window.switchHubCircuit = function(circuitId) {
        curCircuitId = circuitId;
        const body = document.getElementById('diegeticModalBody');
        if (body) body.innerHTML = renderModalBody();
    };

    window.testHubSignalPulse = function() {
        const fb = document.getElementById('hubPulseFeedback');
        if (fb) {
            fb.style.display = 'block';
            setTimeout(() => { fb.style.display = 'none'; }, 3500);
        }
    };

    window.switchHubEnclosureBranch = function(branch) {
        curBranch = branch;
        const body = document.getElementById('diegeticModalBody');
        if (body) body.innerHTML = renderModalBody();
    };

    window.cycleHubActuatorMode = function(actId) {
        const act = actuatorsData.find(a => a.id === actId);
        if (act) {
            const nextMode = act.mode === 'auto' ? 'on' : (act.mode === 'on' ? 'off' : 'auto');
            act.mode = nextMode;
            act.state = nextMode === 'on' ? true : (nextMode === 'off' ? false : !act.lockout);
            const body = document.getElementById('diegeticModalBody');
            if (body) body.innerHTML = renderModalBody();
        }
    };

    openDiegeticModal({
        icon: '📟',
        tag: '[GABINETE-IP67]',
        category: 'Hardware Agroindustrial & Relés ESP32',
        title: 'Caja de Terreno IP67 • Pantalla TFT & Tablero de Conexiones',
        borderColor: '#b45309',
        status: '⚡ Modo Operación & Esquema de Cableado Físico Activo',
        html: renderModalBody()
    });
};

// Reemplazar openCajaTerrenoFromHub para abrir el modal in-situ sin salir de la vista actual
window.openCajaTerrenoFromHub = function(branch = 'general') {
    window.openCajaTerrenoHubModal(branch);
};
