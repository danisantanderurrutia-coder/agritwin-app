        // ═══════════════════════════════════════════════════════════════════
        // BADGES HEXAGONALES EN EL MAPA SATELITAL
        // ═══════════════════════════════════════════════════════════════════
        let hexMarkersGroup = L.layerGroup();

        function addHexBadgesToMap() {
            if (!geojsonPredios || !geojsonPredios.features) return;

            geojsonPredios.features.forEach(feat => {
                const p = feat.properties;
                const coords = feat.geometry.coordinates[0];
                
                // Calcular centroide simple del polígono
                let latSum = 0, lngSum = 0;
                coords.forEach(c => { lngSum += c[0]; latSum += c[1]; });
                const centerLat = latSum / coords.length;
                const centerLng = lngSum / coords.length;

                const biomes = (typeof BIOMES_MAP !== 'undefined') ? BIOMES_MAP : (window.BIOMES_MAP || {});
                const biome = biomes[p.id] || {
                    image: 'assets/catan/tile_pasture.jpg',
                    color: p.color || '#10b981'
                };

                const hexHtml = `
                    <div class="hex-badge-wrapper" onclick="openNeighborDrawer('${p.id}')" title="${p.name} • ${p.rol}">
                        <div class="hex-badge-halo" style="background: ${biome.color}; color: ${biome.color};"></div>
                        <div class="hex-badge-inner" style="border: 2px solid ${biome.color};">
                            <img src="${biome.image}" alt="${p.name}">
                        </div>
                    </div>
                `;

                const hexIcon = L.divIcon({
                    html: hexHtml,
                    className: 'custom-hex-div-icon',
                    iconSize: [44, 50],
                    iconAnchor: [22, 25]
                });

                const marker = L.marker([centerLat, centerLng], { icon: hexIcon });
                marker.on('click', () => openNeighborDrawer(p.id));
                hexMarkersGroup.addLayer(marker);
            });

            // Registrar en capas pero no forzar en el arranque limpio
            overlayLayers['badges_gemini'] = hexMarkersGroup;
        }

        // ═══════════════════════════════════════════════════════════════════
        // DRAWER LATERAL: FICHA TERRITORIAL VECINAL
        // ═══════════════════════════════════════════════════════════════════
        let activeParcelId = 'MENIEL';

        async function openNeighborDrawer(parcelId) {
            activeParcelId = parcelId;
            const feat = geojsonPredios.features.find(f => f.properties.id === parcelId);
            if (!feat) return;
            const p = feat.properties;
            const biomes = (typeof BIOMES_MAP !== 'undefined') ? BIOMES_MAP : (window.BIOMES_MAP || {});
            const biome = biomes[parcelId] || {
                image: 'assets/catan/tile_pasture.jpg',
                name: p.crop,
                tag: 'Predio Vecino',
                color: p.color
            };

            // Rellenar cabecera visual
            document.getElementById('drawerBiomeImg').src = biome.image;
            const drawerTagEl = document.getElementById('drawerBiomeTag');
            if (drawerTagEl) {
                drawerTagEl.innerText = biome.tag;
                drawerTagEl.style.backgroundColor = biome.color;
            }
            document.getElementById('drawerParcelName').innerText = p.name;
            document.getElementById('drawerParcelRol').innerText = 'Rol: ' + p.rol;
            document.getElementById('drawerParcelArea').innerText = p.area_ha + ' ha';

            // Rellenar telemetría
            document.getElementById('drawerParcelCrop').innerText = p.crop;
            document.getElementById('drawerParcelWater').innerText = p.water_L_s + ' L/s';
            document.getElementById('drawerParcelVwc').innerText = p.vwc;
            document.getElementById('drawerParcelFwi').innerText = p.fwi + ' (' + p.fwi_status + ')';

            // Cargar notas desde /api/notes
            try {
                const res = await fetch('/api/notes');
                const allNotes = await res.json();
                const note = allNotes[parcelId] || {};
                document.getElementById('noteAdmin').value = note.admin || p.owner || '';
                document.getElementById('notePhone').value = note.phone || '';
                document.getElementById('noteRadio').value = note.radio_channel || '';
                document.getElementById('noteCortafuego').value = note.cortafuego_status || '';
                document.getElementById('noteAgreements').value = note.agreements || '';
                document.getElementById('noteText').value = note.notes || '';
            } catch (_) {}

            const drawer = document.getElementById('neighborDrawer');
            drawer.classList.remove('drawer-closed');
            drawer.classList.add('drawer-open');
        }

        function closeNeighborDrawer() {
            const drawer = document.getElementById('neighborDrawer');
            if (drawer) {
                drawer.classList.remove('drawer-open');
                drawer.classList.add('drawer-closed');
            }
        }

        async function saveCurrentNeighborNotes() {
            const payload = {
                id: activeParcelId,
                admin: document.getElementById('noteAdmin').value,
                phone: document.getElementById('notePhone').value,
                radio_channel: document.getElementById('noteRadio').value,
                cortafuego_status: document.getElementById('noteCortafuego').value,
                agreements: document.getElementById('noteAgreements').value,
                notes: document.getElementById('noteText').value
            };

            try {
                const res = await fetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    const toast = document.getElementById('saveNoteToast');
                    toast.classList.remove('hidden');
                    setTimeout(() => toast.classList.add('hidden'), 3000);
                }
            } catch (err) {
                alert("Error al guardar notas: " + err.message);
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // BANCO DE PROYECTOS & OBRAS DE BORDE (CON CAPA GIS)
        // ═══════════════════════════════════════════════════════════════════
        let obrasLayerGroup = L.layerGroup();
        const OBRAS_TERRITORIALES_DATA = [
            {
                id: 'OBRA-01',
                name: 'Faja Cortafuegos Comunitaria (45m)',
                coords: [-36.2115, -71.5800],
                status: '100% EJECUTADA',
                color: '#10b981',
                icon: '🌲🔥',
                details: '8.4 km lineales de desbroce y pastoreo PRV ultra-denso (1.8 UGM/ha) en límite forestal Los Pinos.'
            },
            {
                id: 'OBRA-02',
                name: 'Defensas Fluviales Río Longaví',
                coords: [-36.1950, -71.6200],
                status: '75% EN EJECUCIÓN',
                color: '#06b6d4',
                icon: '🌊🛡️',
                details: '3.2 km de gaviones y espigones de enrocado disipador de energía en meandros críticos ($180M CLP).'
            },
            {
                id: 'OBRA-03',
                name: 'Sistema de Tranques Keyline Amortiguadores',
                coords: [-36.2150, -71.6053],
                status: '80% EN EJECUCIÓN',
                color: '#f59e0b',
                icon: '💧🚜',
                details: '3 tranques en cascada (18.500 m³ reserva) vinculados por canales de infiltración en contorno.'
            },
            {
                id: 'OBRA-04',
                name: 'Telemetría Pozos APR LoRaWAN',
                coords: [-36.2080, -71.6300],
                status: '90% EN EJECUCIÓN',
                color: '#a855f7',
                icon: '📡🚰',
                details: '5 sondas piezorresistivas en pozos de agua potable rural enlazadas en tiempo real ($80M CLP).'
            }
        ];

        function initObrasGisMarkers() {
            if (!map) return;
            obrasLayerGroup.clearLayers();

            OBRAS_TERRITORIALES_DATA.forEach(obra => {
                const iconHtml = `
                    <div style="background: ${obra.color}; width: 32px; height: 32px; border-radius: 10px; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 14px rgba(0,0,0,0.7); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
                        ${obra.icon}
                    </div>
                `;
                const customIcon = L.divIcon({
                    html: iconHtml,
                    className: 'obra-marker-icon',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });

                const popupHtml = `
                    <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; min-width: 240px; padding: 2px;">
                        <div style="border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px; margin-bottom: 6px;">
                            <span style="font-size: 9px; font-weight: bold; background: ${obra.color}25; color: ${obra.color}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${obra.color}60;">${obra.status}</span>
                            <div style="font-weight: 800; color: #fff; font-size: 12px; margin-top: 4px;">${obra.name}</div>
                        </div>
                        <p style="color: #cbd5e1; font-size: 11px; margin: 4px 0 8px 0; font-family: sans-serif; line-height: 1.4;">${obra.details}</p>
                        <button onclick="selectSidebarTab('tab-territory')" style="width: 100%; padding: 5px 8px; border-radius: 6px; background: ${obra.color}; color: #000; font-weight: bold; font-size: 10px; border: none; cursor: pointer;">
                            🛠️ Ver en Capas Territoriales
                        </button>
                    </div>
                `;

                const marker = L.marker(obra.coords, { icon: customIcon }).bindPopup(popupHtml);
                obrasLayerGroup.addLayer(marker);
            });

            // Registrar en overlayLayers sin agregar por defecto para mantener visual limpia
            if (typeof overlayLayers !== 'undefined' && overlayLayers) {
                overlayLayers['obras'] = obrasLayerGroup;
            }
        }

        function flyToObra(lat, lng, zoom, name, desc) {
            if (map) {
                map.flyTo([lat, lng], zoom || 14, { duration: 1.2 });
                setTimeout(() => {
                    obrasLayerGroup.eachLayer(layer => {
                        if (layer.getLatLng && Math.abs(layer.getLatLng().lat - lat) < 0.005 && Math.abs(layer.getLatLng().lng - lng) < 0.005) {
                            layer.openPopup();
                        }
                    });
                }, 1300);
            }
        }
        window.flyToObra = flyToObra;

        async function loadCooperativeProjects() {
            const listEl = document.getElementById('cooperativeProjectsList');
            if (!listEl) return;
            try {
                const res = await fetch('/api/projects');
                const projects = await res.json();
                if (projects && projects.length > 0) {
                    renderProjectsList(projects);
                    return;
                }
            } catch (_) {}

            // Fallback robusto en caso de latencia de red
            const fallbackProjects = [
                {
                    id: "PROJ-01",
                    name: "Faja Cortafuegos de Interfaz (45m)",
                    category: "Piro-Resiliencia & Biodiversidad",
                    description: "Establecimiento de franja de 45 metros de bosque nativo esclerófilo con pastoreo de impacto PRV a 1.8 UGM/ha.",
                    impact: "Amortigua la velocidad del fuego en un 45% ante viento Puelche (FWI > 50).",
                    capex_clp: 1250000,
                    executed: true
                },
                {
                    id: "PROJ-02",
                    name: "Tranque & Abrevadero Keyline Compartido",
                    category: "Resiliencia Hídrica & Mitigación TWI",
                    description: "Ampliación de tranque acumulador a 18.500 m³ conectado a red de zanjas en contorno al 1% de gradiente.",
                    impact: "Retiene 18.500 m³ durante crecidas y garantiza 45 días de autonomía hídrica.",
                    capex_clp: 4800000,
                    executed: false
                },
                {
                    id: "PROJ-03",
                    name: "Sonda LoRaWAN FDR en Parcela Don Pedro",
                    category: "Red Centinela IoT & Monitoreo Freático",
                    description: "Sonda capacitiva FDR multinivel (10, 30 y 60 cm) con enlace inalámbrico LoRaWAN 915 MHz.",
                    impact: "Mide el gradiente de recarga freática trans-predial e infiltración comunitaria.",
                    capex_clp: 450000,
                    executed: false
                }
            ];
            renderProjectsList(fallbackProjects);

            function renderProjectsList(projects) {
                listEl.innerHTML = projects.map(proj => `
                    <div class="p-3.5 rounded-xl bg-slate-900/80 border ${proj.executed ? 'border-emerald-500/50' : 'border-white/10'} space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>${proj.executed ? '✅' : '⏳'}</span> ${proj.name}
                            </span>
                            <span class="text-[10px] font-mono font-bold ${proj.executed ? 'text-emerald-400 bg-emerald-950/60' : 'text-amber-400 bg-amber-950/60'} px-2 py-0.5 rounded border border-white/10">
                                ${proj.executed ? 'EJECUTADA' : 'PLANIFICADA'}
                            </span>
                        </div>
                        <p class="text-[10px] text-slate-300 font-sans">${proj.description}</p>
                        <div class="text-[9px] font-mono text-sky-400 font-bold">${proj.impact}</div>
                        <div class="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] font-mono text-slate-400">
                            <span>CAPEX: $${(proj.capex_clp / 1000000).toFixed(1)}M CLP</span>
                            <button onclick="toggleProjectExecution('${proj.id}')" class="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer">
                                ${proj.executed ? 'Desmarcar' : 'Marcar Ejecutada'}
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }

        async function toggleProjectExecution(id) {
            try {
                await fetch('/api/projects/toggle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                loadCooperativeProjects();
            } catch (_) {}
        }

