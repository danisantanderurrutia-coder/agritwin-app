        // ═══════════════════════════════════════════════════════════════════
        // TELEMETRY STUDIO INITIALIZER
        // ═══════════════════════════════════════════════════════════════════
        let studioChartInstance = null;

        function initStudioCharts() {
            const ctx = document.getElementById('studioSoilChart');
            if (!ctx || studioChartInstance) return;

            studioChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
                    datasets: [
                        {
                            label: 'Colliguay 10cm (Keyline)',
                            data: [39.1, 38.8, 38.5, 37.8, 36.9, 36.2, 37.0, 38.4],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 2,
                            tension: 0.35,
                            fill: true
                        },
                        {
                            label: 'Colliguay 30cm (Retención)',
                            data: [29.5, 29.4, 29.3, 29.2, 29.1, 29.0, 29.1, 29.1],
                            borderColor: '#0ea5e9',
                            borderWidth: 2,
                            tension: 0.35
                        },
                        {
                            label: 'Testigo Vecino Convencional (10cm)',
                            data: [32.0, 30.5, 29.0, 26.5, 23.0, 21.5, 22.0, 23.5],
                            borderColor: '#f59e0b',
                            borderDash: [5, 5],
                            borderWidth: 2,
                            tension: 0.35
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } },
                            title: { display: true, text: 'Humedad Volumétrica VWC (%)', color: '#64748b', font: { size: 10 } }
                        },
                        x: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } }
                        }
                    },
                    plugins: {
                        legend: { labels: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans', size: 10 } } }
                    }
                }
            });
        }

        window.updateStudioChartSeries = function() {
            if (!studioChartInstance) return;
            const variable = document.getElementById('chartVariableSelect')?.value || 'vwc';
            const range = document.getElementById('chartRangeSelect')?.value || '24h';
            const scale = document.getElementById('chartScaleSelect')?.value || 'both';

            let labels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
            if (range === '7d') {
                labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            } else if (range === '30d') {
                labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
            }

            let datasets = [];

            if (variable === 'vwc') {
                datasets = [
                    {
                        label: 'FDR 10cm (Horizonte A - Keyline)',
                        data: range === '24h' ? [39.1, 38.8, 38.5, 37.8, 36.9, 36.2, 37.0, 38.4] : [39.5, 38.2, 37.0, 36.5, 38.0, 37.5, 38.4],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        tension: 0.35,
                        fill: true
                    },
                    {
                        label: 'FDR 30cm (Horizonte B - Retención)',
                        data: range === '24h' ? [29.5, 29.4, 29.3, 29.2, 29.1, 29.0, 29.1, 29.1] : [29.8, 29.5, 29.2, 29.0, 29.1, 29.2, 29.1],
                        borderColor: '#0ea5e9',
                        borderWidth: 2,
                        tension: 0.35
                    },
                    {
                        label: 'FDR 60cm (Horizonte C - Recarga)',
                        data: range === '24h' ? [44.2, 44.1, 44.0, 44.0, 43.9, 43.8, 43.9, 44.0] : [44.5, 44.2, 44.0, 43.8, 44.0, 44.1, 44.0],
                        borderColor: '#6366f1',
                        borderWidth: 2,
                        tension: 0.35
                    }
                ];
                if (scale === 'both') {
                    datasets.push({
                        label: 'Sentinel-2 NDWI (Humedad Canopia)',
                        data: range === '24h' ? [31.5, 31.0, 30.5, 29.0, 28.2, 27.8, 28.5, 30.2] : [32.0, 30.8, 29.5, 28.4, 30.0, 29.2, 30.5],
                        borderColor: '#a855f7',
                        borderDash: [4, 4],
                        borderWidth: 2,
                        tension: 0.35
                    });
                }
            } else if (variable === 'ndvi') {
                datasets = [
                    {
                        label: 'Sentinel-2 NDVI (Fundo Meniel Keyline)',
                        data: range === '24h' ? [0.78, 0.78, 0.78, 0.79, 0.78, 0.77, 0.78, 0.78] : [0.72, 0.74, 0.76, 0.78, 0.79, 0.78, 0.78],
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        borderWidth: 2.5,
                        tension: 0.35,
                        fill: true
                    },
                    {
                        label: 'NDVI Testigo Convencional Vecino',
                        data: range === '24h' ? [0.52, 0.52, 0.51, 0.51, 0.50, 0.49, 0.50, 0.51] : [0.55, 0.53, 0.51, 0.49, 0.48, 0.49, 0.50],
                        borderColor: '#f59e0b',
                        borderDash: [5, 5],
                        borderWidth: 2,
                        tension: 0.35
                    }
                ];
                if (scale === 'both') {
                    datasets.push({
                        label: 'Biomasa Forrajera Estimada (x1000 kg/ha)',
                        data: range === '24h' ? [0.68, 0.68, 0.68, 0.69, 0.68, 0.67, 0.68, 0.68] : [0.60, 0.62, 0.65, 0.68, 0.70, 0.69, 0.68],
                        borderColor: '#06b6d4',
                        borderWidth: 2,
                        tension: 0.35
                    });
                }
            } else if (variable === 'temp') {
                datasets = [
                    {
                        label: 'Sensor Suelo 10cm (°C)',
                        data: range === '24h' ? [14.2, 13.8, 13.5, 15.2, 18.5, 21.0, 19.4, 16.0] : [15.0, 16.2, 17.5, 18.0, 17.2, 16.5, 16.0],
                        borderColor: '#f97316',
                        borderWidth: 2,
                        tension: 0.35
                    },
                    {
                        label: 'Sentinel-2 LST Superficial (°C)',
                        data: range === '24h' ? [12.5, 11.8, 11.2, 17.8, 24.5, 28.2, 23.0, 15.8] : [22.0, 24.5, 26.0, 27.5, 25.0, 23.8, 24.0],
                        borderColor: '#ef4444',
                        borderDash: [4, 4],
                        borderWidth: 2,
                        tension: 0.35
                    }
                ];
            } else if (variable === 'water') {
                datasets = [
                    {
                        label: 'Aforo Estero / Acequia (L/s)',
                        data: range === '24h' ? [28.2, 28.5, 28.4, 28.0, 27.5, 27.2, 27.6, 28.0] : [32.0, 30.5, 29.0, 28.2, 28.0, 27.8, 28.0],
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        borderWidth: 2,
                        tension: 0.35,
                        fill: true
                    },
                    {
                        label: 'Volumen Tranque Keyline (x1000 m³)',
                        data: range === '24h' ? [18.5, 18.5, 18.5, 18.4, 18.3, 18.2, 18.3, 18.5] : [18.5, 18.4, 18.3, 18.2, 18.2, 18.3, 18.5],
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        tension: 0.35
                    }
                ];
            }

            studioChartInstance.data.labels = labels;
            studioChartInstance.data.datasets = datasets;
            studioChartInstance.update();
        };

        window.addStudioChartToCanva = function() {
            if (!studioChartInstance) return;
            const dataUrl = studioChartInstance.toBase64Image();
            const variableText = document.getElementById('chartVariableSelect')?.selectedOptions[0]?.text || 'Telemetría';
            const rangeText = document.getElementById('chartRangeSelect')?.selectedOptions[0]?.text || 'Periodo';
            const scaleText = document.getElementById('chartScaleSelect')?.selectedOptions[0]?.text || 'Escala';

            const figureHtml = `
            <div class="space-y-3">
                <div class="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Variable: <strong class="text-white">${variableText}</strong></span>
                    <span>Rango: <strong class="text-amber-300">${rangeText}</strong> • ${scaleText}</span>
                </div>
                <div class="rounded-xl overflow-hidden border border-white/10 bg-black/60 p-2 flex justify-center">
                    <img src="${dataUrl}" alt="${variableText}" class="max-h-72 object-contain rounded-lg w-full" />
                </div>
                <div class="text-[10px] text-slate-400 font-mono italic">
                    Gráfico generado en vivo desde el Telemetry Studio • AgriTwin Hub (Micro-FDR + Satélite Sentinel-2).
                </div>
            </div>`;

            if (typeof window.addCustomCanvaBlock === 'function') {
                window.addCustomCanvaBlock(`Gráfico Analítico: ${variableText}`, figureHtml);
            }
        };

        function refreshLiveStudioTelemetry() {
            // Animación sutil de micro-actualización
            const v10 = (37 + Math.random() * 2).toFixed(1);
            const v30 = (28 + Math.random() * 2).toFixed(1);
            const v60 = (43 + Math.random() * 2).toFixed(1);
            document.getElementById('vwc-10cm').innerText = v10 + '% VWC';
            document.getElementById('vwc-30cm').innerText = v30 + '% VWC';
            document.getElementById('vwc-60cm').innerText = v60 + '% VWC';
            if (typeof window.updateStudioChartSeries === 'function') {
                window.updateStudioChartSeries();
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // DOCUMENTATION VAULT INITIALIZER
        // ═══════════════════════════════════════════════════════════════════
        function initDocsCatalog() {
            // Galería de Biomas (Estilo Galpón Luminoso)
            const gallery = document.getElementById('biomesGalleryGrid');
            if (gallery && gallery.children.length === 0) {
                gallery.innerHTML = Object.entries(BIOMES_MAP).map(([id, b]) => `
                    <div class="rounded-2xl overflow-hidden bg-white border border-[#E7DAC6] shadow-sm space-y-3 p-4 flex flex-col justify-between hover:shadow-md transition-all">
                        <div class="space-y-2">
                            <div class="relative h-40 rounded-xl overflow-hidden border border-[#E7DAC6]">
                                <img src="${b.image}" alt="${b.name}" class="w-full h-full object-cover">
                            </div>
                            <h4 class="font-bold text-stone-900 text-sm font-serif">${b.name}</h4>
                            <p class="text-[11px] text-stone-600 leading-relaxed">${b.desc}</p>
                        </div>
                        <a href="${b.image}" download class="w-full py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-mono font-bold text-center transition-colors border border-stone-200 flex items-center justify-center gap-1 cursor-pointer">
                            ⬇️ Descargar PNG HD
                        </a>
                    </div>
                `).join('');
            }

            // Tabla Catastral de Mosaico (Luminosa)
            const tableBody = document.getElementById('parcelsMasterTableBody');
            if (tableBody && tableBody.children.length === 0) {
                tableBody.innerHTML = geojsonPredios.features.map(f => {
                    const p = f.properties;
                    const waterDisplay = (p.water_L_s && p.water_L_s !== 'Dato no disponible') ? `${p.water_L_s} L/s` : '<span class="text-stone-400 italic text-[11px]">No disponible</span>';
                    return `
                        <tr class="hover:bg-amber-50/50 transition-colors">
                            <td class="py-2.5 px-3 font-bold text-stone-900">${p.name}</td>
                            <td class="py-2.5 px-3 text-stone-500">${p.rol}</td>
                            <td class="py-2.5 px-3 text-sky-800 font-bold">${p.area_ha} ha</td>
                            <td class="py-2.5 px-3 text-stone-700">${p.crop}</td>
                            <td class="py-2.5 px-3 text-emerald-800 font-bold">${waterDisplay}</td>
                            <td class="py-2.5 px-3 font-bold ${p.fwi > 50 ? 'text-rose-700' : 'text-emerald-800'}">${p.fwi}</td>
                        </tr>
                    `;
                }).join('');
            }

            // Tabla Catastral en Visor de Datasets Unificados
            const datasetTableBody = document.getElementById('parcelsDatasetTableBody');
            if (datasetTableBody && datasetTableBody.children.length === 0) {
                datasetTableBody.innerHTML = geojsonPredios.features.map(f => {
                    const p = f.properties;
                    const waterDisplay = (p.water_L_s && p.water_L_s !== 'Dato no disponible') ? `${p.water_L_s} L/s` : '<span class="text-stone-400 italic text-[11px]">No disponible</span>';
                    return `
                        <tr class="hover:bg-amber-50/50 transition-colors">
                            <td class="py-2 px-3 font-bold text-stone-900">${p.name}</td>
                            <td class="py-2 px-3 text-stone-500">${p.rol}</td>
                            <td class="py-2 px-3 text-sky-800 font-bold">${p.area_ha} ha</td>
                            <td class="py-2 px-3 text-stone-700">${p.crop}</td>
                            <td class="py-2 px-3 text-emerald-800 font-bold">${waterDisplay}</td>
                            <td class="py-2 px-3 font-bold ${p.fwi > 50 ? 'text-rose-700' : 'text-emerald-800'}">${p.fwi}</td>
                        </tr>
                    `;
                }).join('');
            }

            // Visor GeoJSON
            const geoJsonView = document.getElementById('geojsonCodeView');
            if (geoJsonView) {
                geoJsonView.innerText = JSON.stringify(geojsonPredios, null, 2);
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // COCKPIT DEL TOMADOR DE DECISIONES & REPORTE INTEGRADO MULTI-ESCALA
        // ═══════════════════════════════════════════════════════════════════
        function initCockpitView() {
            renderCockpitTable(geojsonPredios.features);
            generateIntegratedReportText();
        }

        function renderCockpitTable(features) {
            const tbody = document.getElementById('cockpitParcelsTableBody');
            if (!tbody) return;

            tbody.innerHTML = features.map(f => {
                const p = f.properties;
                const isFirmado = p.id !== 'DON_TOMAS'; // 9 de 10 firmados
                const statusBadge = isFirmado 
                    ? '<span class="px-2 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold font-mono">✓ 45m Firmado</span>'
                    : '<span class="px-2 py-0.5 rounded-full text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-bold font-mono">⏳ En Trámite</span>';
                
                const fwiVal = p.fwi || 24;
                const fwiColor = fwiVal < 25 ? 'text-emerald-700' : (fwiVal < 40 ? 'text-amber-700' : 'text-rose-700');

                return `
                    <tr class="hover:bg-stone-50 transition-colors">
                        <td class="p-3 font-bold text-stone-900 flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full shadow-sm" style="background-color: ${p.color}"></span>
                            <span>${p.name}</span>
                        </td>
                        <td class="p-3 text-stone-500 font-mono">${p.rol}</td>
                        <td class="p-3 text-stone-900 font-bold font-mono">${p.area_ha} ha</td>
                        <td class="p-3 text-stone-700">${p.crop}</td>
                        <td class="p-3 text-sky-800 font-bold font-mono">${p.vwc || '36.2%'}</td>
                        <td class="p-3 ${fwiColor} font-bold font-mono">${fwiVal}</td>
                        <td class="p-3">${statusBadge}</td>
                        <td class="p-3 text-stone-700 font-mono">${p.water_L_s} L/s</td>
                        <td class="p-3 text-right space-x-1.5 whitespace-nowrap">
                            <button onclick="openNeighborDrawer('${p.id}')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-800 border border-[#E7DAC6] text-[10px] font-mono font-bold transition-colors cursor-pointer shadow-sm" title="Ver ficha predial y notas">
                                📋 Ficha
                            </button>
                            <button onclick="switchMasterView('territory'); flyToParcel('${p.id}')" class="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 text-[10px] font-mono font-bold transition-colors cursor-pointer shadow-sm" title="Ver en mapa satelital">
                                🗺️ Volar
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function filterCockpitTable(query) {
            const q = (query || '').toLowerCase().trim();
            if (!q) {
                renderCockpitTable(geojsonPredios.features);
                return;
            }
            const filtered = geojsonPredios.features.filter(f => {
                const p = f.properties;
                return p.name.toLowerCase().includes(q) ||
                    p.rol.toLowerCase().includes(q) ||
                    p.crop.toLowerCase().includes(q) ||
                    (p.owner && p.owner.toLowerCase().includes(q));
            });
            renderCockpitTable(filtered);
        }

        function flyToParcel(parcelId) {
            const feature = geojsonPredios.features.find(f => f.properties.id === parcelId);
            if (!feature || !map) return;
            try {
                const coords = feature.geometry.coordinates[0];
                const bounds = L.latLngBounds(coords.map(c => [c[1], c[0]]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            } catch (_) {}
        }

        function generateIntegratedReportText() {
            const dateStr = new Date().toISOString().split('T')[0];
            const timeStr = new Date().toTimeString().split(' ')[0];
            const hash = "0x" + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');

            const report = 
`================================================================================
AGROTWIN MASTER SUITE • INFORME TÉCNICO INTEGRADO MULTI-ESCALA
MACRO-CUENCA DEL MAULE SUR • RÍO LONGAVÍ (122.070 HA)
CONEXIÓN MICRO-PREDIAL (Z0) ➔ MESO-PAISAJE (Z1) ➔ GOBERNANZA TERRITORIAL (Z2)
================================================================================
FECHA DE EMISIÓN: ${dateStr} ${timeStr}
ESTADO DE AUDITORÍA: CONFORME • CERTIFICADO MRV V2.4
HASH DE INTEGRIDAD CRIPTOGRÁFICA: ${hash}
AUTORIDAD EMISORA: Jefatura de Operaciones & Mayordomía Territorial AgroTwin

--------------------------------------------------------------------------------
1. RESUMEN EJECUTIVO PARA EL TOMADOR DE DECISIONES
--------------------------------------------------------------------------------
• Cobertura Catastral Consolidada: 10 Predios contiguos (508.0 ha totales)
• Nivel de Cumplimiento Faja Cortafuegos (45m): 9/10 predios (90.0% quórum)
• Reserva Hídrica Comunitaria: 18.500 m³ en Tranques Keyline amortiguadores
• Caudal Fluviométrico Río Longaví: 124.5 m³/s (Límite seguro pre-crecida)
• Índice Piro-Meteorológico (Van Wagner): FWI 24.0 (Riesgo Bajo, Puelche ESE 38 km/h)
• Cartera de Inversión Territorial: 4 Obras en ejecución por $420M CLP (72% avance)
• Red de Agua Potable Rural (APR): 5 Comités monitoreados (3.220 familias, 100% estables)

--------------------------------------------------------------------------------
2. NIVEL 1: MICRO-BIOFÍSICA PREDIAL (FUNDO COLLIGUAY / MENIEL - 12.8 HA)
--------------------------------------------------------------------------------
• Modelo Productivo: Pastoreo Racional Voisin (PRV) en 8 potreros rotacionales
• Sondas FDR Multi-Nivel:
  - Estrato 0-10 cm (Horizonte A):  38.4% VWC (Capacidad de Campo óptima)
  - Estrato 10-30 cm (Horizonte B): 29.1% VWC (Agua disponible para raíces)
  - Estrato 30-60 cm (Horizonte C): 44.0% VWC (Recarga activa a napa freática)
• Balance Hídrico Penman-Monteith (FAO-56): ETo = 4.82 mm/día (Demanda: 61.7 m³/día)
• Balance de Carbono Edáfico: -24.2 tCO2e/ha fijados en suelo vivo con PRV
• Estrés Hídrico del Cultivo (CWSI): 0.14 (Nulo a Leve, cero estrés fisiológico)

--------------------------------------------------------------------------------
3. NIVEL 2: MESO-CUENCA & BALANCE HIDROLÓGICO (122.070 HA)
--------------------------------------------------------------------------------
• Batimetría y Estado Embalses:
  - Embalse Bullileo: 89.5M m³ almacenados (86% capacidad total)
  - Río Longaví (Aforo DGA): 124.5 m³/s | Nivel fluviométrico: 2.15 m
• Simulación de Escenarios de Crecida Fluvial:
  - T = 10 años (180 m³/s): Confinado al lecho menor. Afectación: 0 ha agrícolas.
  - T = 50 años (345 m³/s): Desborde en bajas de Retiro. Tranque amortigua 18.500 m³ (4.2%).
  - T = 100 años (520 m³/s): Alerta máxima APR. Activación compuertas de seguridad.
• Estado Pozos APR:
  - APR-01 Retiro Centro:    Pozo 68m | Nivel -18.4m | 1.450 familias | Óptimo
  - APR-02 Copihue:          Pozo 52m | Nivel -14.2m |   680 familias | Óptimo
  - APR-03 Romeral-San Luis: Pozo 44m | Nivel -19.8m |   380 familias | Alerta Abatimiento
  - APR-04 Villaseca:        Pozo 58m | Nivel -16.0m |   420 familias | Óptimo
  - APR-05 Los Cuarteles:    Pozo 36m | Nivel -11.5m |   290 familias | Óptimo

--------------------------------------------------------------------------------
4. NIVEL 3: GOBERNANZA COMUNITARIA & VOTO CUADRÁTICO DAO
--------------------------------------------------------------------------------
• Modelo de Decisión: Gobernanza Cuadrática (Cost = Votes^2) con 100 Voice Credits/predio
• Padrón Electoral: 10 Propietarios / Quórum Efectivo: 78.0%
• Estado de Mociones del Portafolio de Inversión Territorial ($420M CLP):
  1. Tranque Comunitario Bullileo 2 ($180M CLP): 65% Avance | 88% Votos A Favor
  2. Faja Cortafuegos 28 km ($95M CLP):          80% Avance | 94% Votos A Favor
  3. Reforestación Ribereña Nativa ($65M CLP):   45% Avance | 91% Votos A Favor
  4. Telemetría Pozos APR ($80M CLP):            90% Avance | 96% Votos A Favor
• Protocolo de Alerta Temprana: Radio VHF Canal 146.520 MHz FM (Tono 88.5)

--------------------------------------------------------------------------------
5. NIVEL 4: DOCTRINA TÁCTICA C2, MATRIZ MULTIAMENAZA H-V-R & VECTORES DE MANIOBRA
--------------------------------------------------------------------------------
• Matriz Cuantitativa Canónica: R = (H × V) / 100
  - Amenaza Física (Hazard H): 28.0% (Línea Base) ➔ 92.0% (Río Atmosférico T=100) / 88.0% (Puelche)
  - Vulnerabilidad Expuesta (V): 35.0% (Línea Base) ➔ 74.0% (T=100) / 65.0% (Puelche)
  - Riesgo Integrado Cuenca (R): 9.8% (Clase 1: Muy Bajo) ➔ 68.1% (Clase 4: Alto/Severo)
• Unidades Tácticas de Riesgo (Polígonos Punteados con Trazo Segmentado):
  - UD-01 Frente Fluvial: Cabecera Quilaimo ➔ Desborde R5 Sur (0-12h)
  - UD-02 Frente Pirogénico: Ladera Bullileo ➔ Salto de Pavesas 1.5 km WUI (0-12h)
  - UD-03 Deslizamiento A110: Escarpe Coluvio 34° ➔ Cono Runout 420m (28.5k m³)
• Capas de Exposición Acopladas (Modelos SIG Internacionales):
  - Exposición Suelo (Colonia): Residencial/APR, Corredor Vial R5/L110, Agrícola, Vega
  - Severidad Incendio (CAL FIRE FHSZ + Austin WUI Ember Zone 500m)
  - Susceptibilidad Gravitacional: Talud A110 Garganta Bullileo
• Líneas de Defensa Activa & Vectores de Maniobra:
  - Faja Cortafuegos WUI 45m: 90% Quórum (9/10 predios firmados, 28 km continuos)
  - Zanjas & Tranque Keyline: 18.500 m³ capacidad amortiguadora
  - Vectores Temporales Phased: Fase 1 (0-2h), Fase 2 (2-6h), Fase 3 (6-12h)

--------------------------------------------------------------------------------
6. RECOMENDACIONES TÁCTICAS PARA AUTORIDADES Y CANALISTAS
--------------------------------------------------------------------------------
1. Mantener apertura de compuertas en Fundo Meniel para canalizar excedentes al Tranque Keyline.
2. Monitorear abatimiento freático en Pozo APR-03 (Romeral) durante horas de riego punta (14:00-18:00).
3. Completar firma digital de servidumbre cortafuegos en predio Don Tomás (Rol 144-19).
4. Sostener protocolo preventivo de viento Puelche en laderas de Pino Insigne andinas.
5. Supervisar en tablero táctico C2 (#tactico) la variación del delta de riesgo en frentes activos.

================================================================================
FIN DEL INFORME TÉCNICO • AGROTWIN DIGITAL TWIN PLATFORM (HTTP://LOCALHOST:7777)
================================================================================`;

            const el = document.getElementById('integratedReportPreview');
            if (el) el.innerText = report;
            return report;
        }

        function downloadIntegratedReport() {
            const report = generateIntegratedReportText();
            const dateStr = new Date().toISOString().split('T')[0];
            const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Informe_Integrado_AgroTwin_MauleSur_${dateStr}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }

        function copyIntegratedReportToClipboard() {
            const report = generateIntegratedReportText();
            navigator.clipboard.writeText(report);
            alert("📋 Informe Integrado Multi-Escala copiado al portapapeles con éxito.");
        }

        function exportParcelsToCSV() {
            let csv = "ID,Nombre,Rol,Area_Ha,Cultivo,Derechos_DGA_Ls,FWI\n";
            geojsonPredios.features.forEach(f => {
                const p = f.properties;
                csv += `"${p.id}","${p.name}","${p.rol}",${p.area_ha},"${p.crop}",${p.water_L_s},${p.fwi}\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'catastro_predios_maule_sur.csv';
            a.click();
        }

        function copyGeoJSONToClipboard() {
            navigator.clipboard.writeText(JSON.stringify(geojsonPredios, null, 2));
            alert("✅ GeoJSON de los 10 predios copiado al portapapeles");
        }

        function handleRouteHash() {
            const hash = window.location.hash.replace('#', '');
            if (hash === 'mesa' || hash.startsWith('mesa-')) {
                openMesaLanding();
                if (hash.startsWith('mesa-')) {
                    const hotspotId = hash.replace('mesa-', '');
                    openMesaHotspotModal(hotspotId);
                }
            }
            else if (hash === 'cerro' || hash.startsWith('cerro-')) {
                openCerroMode();
                if (hash === 'cerro-sim') {
                    setCerroSubView('sim');
                } else if (hash === 'cerro-decreto') {
                    setCerroSubView('decreto');
                } else if (hash.startsWith('cerro-')) {
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
                } else if (hash.startsWith('docs-')) switchDocsTab(hash);
            }
            else if (hash === 'territory') switchMasterView('territory');
            else if (hash === 'tactico') {
                if (typeof openCerroMapWithTab === 'function') openCerroMapWithTab('tab-tactico');
                else switchMasterView('territory', 'cerro');
            }
            else if (hash === 'landing' || hash === '') switchMasterView('landing');
        }

        window.addEventListener('hashchange', handleRouteHash);

        // Ejecución inmediata del enrutador de hash para evitar retraso visual
        handleRouteHash();
        document.addEventListener('DOMContentLoaded', handleRouteHash);

        // Llamada de inicialización de Badges y Obras al cargar el mapa
        setTimeout(() => {
            addHexBadgesToMap();
            initObrasGisMarkers();
            loadCooperativeProjects();
            handleRouteHash();
            if (!window.basinTwin && typeof BasinTwinEngine !== 'undefined') {
                window.basinTwin = new BasinTwinEngine();
                window.basinTwin.updateUI();
            }
            if (!window.cerroVectorEngine && typeof CerroVectorEngine !== 'undefined') {
                window.cerroVectorEngine = new CerroVectorEngine();
            }
        }, 300);

