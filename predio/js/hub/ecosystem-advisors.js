        // LIVING ENERGY FLOW ENGINE (MAPA VIVO & FLUJOS TOPOGRÁFICOS)
        // ═══════════════════════════════════════════════════════════════════
        class LivingEnergyFlowEngine {
            constructor(leafletMap, canvasId) {
                this.map = leafletMap;
                this.canvas = document.getElementById(canvasId);
                if (!this.canvas) return;
                this.ctx = this.canvas.getContext('2d');
                this.running = true;
                this.regime = 'base'; // 'calm', 'base', 'storm'
                this.speedMult = 1.0;

                this.toggles = {
                    water: false,
                    wind: false,
                    contours: false,
                    aquifer: false,
                    floodWave: false,
                    fireWave: false,
                    landslideWave: false
                };

                // Path coordinates (Lat, Lng)
                this.waterPaths = [
                    // Río Longaví desde Bullileo hasta Retiro
                    [
                        [-36.2800, -71.4200], // Embalse Bullileo
                        [-36.2550, -71.4600],
                        [-36.2300, -71.5000],
                        [-36.2115, -71.5800], // Meniel entrance
                        [-36.1950, -71.6200], // Quilaimo
                        [-36.1700, -71.6600],
                        [-36.1432, -71.7200],
                        [-36.1100, -71.7600], // Perquilauquén
                        [-36.0550, -71.7800]  // Retiro
                    ],
                    // Keyline bifurcación en Fundo Meniel
                    [
                        [-36.2115, -71.5800],
                        [-36.2150, -71.6053], // Tranque
                        [-36.2200, -71.6150],
                        [-36.2100, -71.6300],
                        [-36.1950, -71.6200]
                    ]
                ];

                // Corredores de Crecida Fluvial Hidráulica (F-01 Quilaimo -> F-02 Meniel -> F-03 Cruce R5)
                this.floodPaths = [
                    // Cauce principal Longaví
                    [
                        [-36.2550, -71.4600],
                        [-36.2300, -71.5000],
                        [-36.2115, -71.5800], // Meniel
                        [-36.1950, -71.6200], // F-02 Valle Meniel
                        [-36.1830, -71.6540], // F-01 Quilaimo
                        [-36.1700, -71.6800],
                        [-36.1525, -71.7245], // F-03 Cruce Ruta 5
                        [-36.1100, -71.7600]
                    ],
                    // Talweg estero tributario y canal de desborde hacia vegas bajas
                    [
                        [-36.2115, -71.5800],
                        [-36.2080, -71.6050],
                        [-36.2020, -71.6210],
                        [-36.1960, -71.6290], // F-02 Valle
                        [-36.1880, -71.6460],
                        [-36.1830, -71.6540]
                    ]
                ];

                // Corredores Pirogénicos de Propagación de Fuego por Viento Puelche & Biomasa
                this.firePaths = [
                    // Eje Central: Ladera Alta Pino (P-01) -> Transición WUI (P-02) -> Meniel (P-03)
                    [
                        [-36.1720, -71.4750], // P-01 Ladera Alta
                        [-36.1820, -71.5020],
                        [-36.1920, -71.5300], // P-02 WUI Pavesas
                        [-36.2000, -71.5550],
                        [-36.2070, -71.5800], // P-03 Peri-Predial Meniel
                        [-36.2115, -71.6050]  // Fundo Meniel Core
                    ],
                    // Flanco Norte: Quebradas de secano y eucalipto denso
                    [
                        [-36.1600, -71.4500],
                        [-36.1690, -71.4800],
                        [-36.1810, -71.5150],
                        [-36.1940, -71.5450],
                        [-36.2040, -71.5750]
                    ],
                    // Flanco Sur: Interfaz bosque nativo / matorral esclerófilo
                    [
                        [-36.1850, -71.4800],
                        [-36.1950, -71.5100],
                        [-36.2050, -71.5400],
                        [-36.2140, -71.5700],
                        [-36.2200, -71.5950]
                    ]
                ];

                // Corredores Gravitacionales de Alud / Remoción en Masa por Pendiente
                this.landslidePaths = [
                    // Escarpe Activo 34° M-01 -> Garganta Bullileo -> Cono Runout Aluvial L-110 M-02
                    [
                        [-36.2575, -71.4350], // M-01 Escarpe activo 34°
                        [-36.2600, -71.4390], // Garganta torrencial
                        [-36.2635, -71.4440], // Canal de transporte
                        [-36.2665, -71.4485], // Ápice del cono aluvial
                        [-36.2685, -71.4520], // M-02 Cono Runout calzada L-110
                        [-36.2715, -71.4560]  // Pie del talud
                    ],
                    // Talud secundario coluvial
                    [
                        [-36.2550, -71.4310],
                        [-36.2585, -71.4360],
                        [-36.2620, -71.4410],
                        [-36.2655, -71.4460],
                        [-36.2680, -71.4500]
                    ]
                ];

                // Viento Puelche: Descenso cordillerano ESE a ONO
                this.windPaths = [
                    [[-36.1600, -71.3600], [-36.1800, -71.4500], [-36.1900, -71.5500], [-36.1800, -71.6800], [-36.1600, -71.7800]],
                    [[-36.2200, -71.3800], [-36.2300, -71.4800], [-36.2200, -71.5900], [-36.2000, -71.7200], [-36.1800, -71.8200]],
                    [[-36.2800, -71.4000], [-36.2600, -71.5200], [-36.2400, -71.6300], [-36.2100, -71.7500], [-36.1900, -71.8500]]
                ];

                // Curvas de Nivel Topográficas
                this.contours = [
                    { elev: '150m (Valle)', color: 'rgba(52, 211, 153, 0.45)', pts: [[-36.0500,-71.8000], [-36.1000,-71.7800], [-36.1500,-71.7500], [-36.2000,-71.7200], [-36.2500,-71.7000]] },
                    { elev: '250m (Secano)', color: 'rgba(96, 165, 250, 0.45)', pts: [[-36.0800,-71.7200], [-36.1300,-71.6900], [-36.1800,-71.6500], [-36.2300,-71.6300], [-36.2800,-71.6000]] },
                    { elev: '450m (Fundo Meniel Keyline)', color: 'rgba(251, 191, 36, 0.55)', pts: [[-36.1200,-71.6400], [-36.1700,-71.6100], [-36.2115,-71.6053], [-36.2500,-71.5500], [-36.3000,-71.5200]] },
                    { elev: '800m (Precordillera)', color: 'rgba(249, 115, 22, 0.55)', pts: [[-36.1500,-71.5500], [-36.1900,-71.5000], [-36.2300,-71.4600], [-36.2700,-71.4300], [-36.3200,-71.4000]] },
                    { elev: '1400m (Bullileo)', color: 'rgba(168, 85, 247, 0.55)', pts: [[-36.1800,-71.4500], [-36.2200,-71.4200], [-36.2800,-71.4200], [-36.3400,-71.3800]] },
                    { elev: '2200m (Altas Cumbres)', color: 'rgba(241, 245, 249, 0.65)', pts: [[-36.1500,-71.3800], [-36.2000,-71.3500], [-36.2600,-71.3200], [-36.3200,-71.3000]] }
                ];

                // Partículas hídricas
                this.waterParticles = [];
                for (let i = 0; i < 90; i++) {
                    const pIdx = i % this.waterPaths.length;
                    this.waterParticles.push({
                        pathIdx: pIdx,
                        progress: Math.random(),
                        speed: 0.0012 + Math.random() * 0.0015,
                        size: 2.0 + Math.random() * 2.0,
                        color: i % 2 === 0 ? '#38bdf8' : '#2dd4bf'
                    });
                }

                // Partículas de Onda de Crecida Fluvial
                this.floodParticles = [];
                for (let i = 0; i < 48; i++) {
                    const pIdx = i % this.floodPaths.length;
                    this.floodParticles.push({
                        pathIdx: pIdx,
                        progress: Math.random(),
                        speed: 0.0022 + Math.random() * 0.0025,
                        size: 3.0 + Math.random() * 2.5,
                        color: i % 2 === 0 ? '#38bdf8' : '#06b6d4',
                        wobble: Math.random() * Math.PI * 2
                    });
                }

                // Partículas de Fuego y Pavesas Volantes (Viento Puelche & Biomasa)
                this.fireParticles = [];
                for (let i = 0; i < 60; i++) {
                    const pIdx = i % this.firePaths.length;
                    this.fireParticles.push({
                        pathIdx: pIdx,
                        progress: Math.random(),
                        speed: 0.0035 + Math.random() * 0.0045, // Alta velocidad impulsada por ráfaga Puelche
                        size: 2.5 + Math.random() * 3.5,
                        wobble: Math.random() * Math.PI * 2,
                        isSpark: i % 3 === 0 // 1 de cada 3 es una pavesa voladora
                    });
                }

                // Partículas de Alud / Remoción en Masa por Pendiente
                this.landslideParticles = [];
                for (let i = 0; i < 35; i++) {
                    const pIdx = i % this.landslidePaths.length;
                    this.landslideParticles.push({
                        pathIdx: pIdx,
                        progress: Math.random(),
                        speed: 0.0015 + Math.random() * 0.0020,
                        size: 3.5 + Math.random() * 3.0,
                        color: i % 3 === 0 ? '#f59e0b' : (i % 3 === 1 ? '#d97706' : '#78350f')
                    });
                }

                // Partículas de viento
                this.windParticles = [];
                for (let i = 0; i < 60; i++) {
                    const pIdx = i % this.windPaths.length;
                    this.windParticles.push({
                        pathIdx: pIdx,
                        progress: Math.random(),
                        speed: 0.0025 + Math.random() * 0.0035,
                        size: 1.5 + Math.random() * 2.0
                    });
                }

                // Partículas de flujo continuo 2D sobre la Cuenca 122k ha (Estilo Windy)
                this.basinBounds = {
                    minLat: -36.3300, maxLat: -36.0400,
                    minLng: -71.8600, maxLng: -71.3600
                };
                this.flowFieldCount = 2800;
                this.flowFieldParticles = [];
                for (let i = 0; i < this.flowFieldCount; i++) {
                    const lat = this.basinBounds.minLat + Math.random() * (this.basinBounds.maxLat - this.basinBounds.minLat);
                    const lng = this.basinBounds.minLng + Math.random() * (this.basinBounds.maxLng - this.basinBounds.minLng);
                    this.flowFieldParticles.push({
                        lat: lat,
                        lng: lng,
                        prevLat: lat,
                        prevLng: lng,
                        age: Math.floor(Math.random() * 120),
                        maxAge: 70 + Math.floor(Math.random() * 80),
                        speedMult: 0.75 + Math.random() * 0.5
                    });
                }

                this.altitudeM = 10;
                this.forecastModel = 'ecmwf';
                this.userSpeedMultiplier = 1.0;
                this.userOpacity = 0.85;

                // Anillos freáticos
                this.aquiferRings = [
                    { r: 10, maxR: 120, speed: 0.8 },
                    { r: 50, maxR: 120, speed: 0.8 },
                    { r: 90, maxR: 120, speed: 0.8 }
                ];

                this.activeVariable = 'wind'; // 'wind', 'temp', 'precip', 'fwi'
                this.showInfluenceSurfaces = false; // Solo bajo demanda o emergencia táctica

                // Zonas de influencia atmosférica (Curvas de nivel por variable y conos de arrastre)
                this.influenceZones = {
                    fire: {
                        // Cono de avance pirogénico desde interface andina hacia el valle
                        apex: [-36.1900, -71.4200], // Foco andino
                        axisDeg: 255, // Dirección hacia OSO
                        spreadAngle: 0.65, // Ángulo del abanico
                        lengthKm: 28,
                        levels: [
                            { radiusRatio: 0.35, fwi: 68, alpha: 0.38, label: 'FWI 68+ Frente Activo' },
                            { radiusRatio: 0.65, fwi: 52, alpha: 0.24, label: 'FWI 52 Cono Inminente' },
                            { radiusRatio: 1.00, fwi: 38, alpha: 0.12, label: 'FWI 38 Envolvente Humo & Pavesas' }
                        ]
                    },
                    wind: {
                        // Isopletas barométricas de aceleración catabática
                        isopleths: [
                            { pts: [[-36.1200,-71.4000], [-36.1600,-71.5000], [-36.2000,-71.6000], [-36.2400,-71.7000]], label: 'Isopleta 55 km/h (Cordillera)', val: 55 },
                            { pts: [[-36.1000,-71.5000], [-36.1500,-71.6000], [-36.1900,-71.7000], [-36.2300,-71.8000]], label: 'Isopleta 35 km/h (Precordillera)', val: 35 },
                            { pts: [[-36.0800,-71.6000], [-36.1300,-71.7000], [-36.1800,-71.8000], [-36.2200,-71.9000]], label: 'Isopleta 18 km/h (Valle Central)', val: 18 }
                        ]
                    },
                    temp: {
                        // Isotermas de cuenca (gradiente adiabático)
                        isotherms: [
                            { pts: [[-36.0500,-71.7800], [-36.1200,-71.7400], [-36.2000,-71.7000]], label: 'Isoterma 38°C (Fondo de Valle)', color: 'rgba(239, 68, 68, 0.28)' },
                            { pts: [[-36.1000,-71.6600], [-36.1700,-71.6200], [-36.2400,-71.5800]], label: 'Isoterma 32°C (Lomas Meniel)', color: 'rgba(245, 158, 11, 0.22)' },
                            { pts: [[-36.1500,-71.4800], [-36.2200,-71.4400], [-36.3000,-71.4000]], label: 'Isoterma 22°C (Cabecera Andina)', color: 'rgba(56, 189, 248, 0.18)' }
                        ]
                    },
                    precip: {
                        // Isopletas de precipitación / crecida fluvial
                        isohyets: [
                            { pts: [[-36.1400,-71.4200], [-36.2000,-71.4800], [-36.2700,-71.4500]], label: 'Isoyeta 140 mm (Andes)', color: 'rgba(30, 64, 175, 0.35)' },
                            { pts: [[-36.1200,-71.5600], [-36.1800,-71.6000], [-36.2500,-71.5800]], label: 'Isoyeta 85 mm (Piedemonte)', color: 'rgba(2, 132, 199, 0.25)' },
                            { pts: [[-36.0800,-71.7000], [-36.1400,-71.7400], [-36.2100,-71.7200]], label: 'Isoyeta 45 mm (Vega Retiro)', color: 'rgba(56, 189, 248, 0.18)' }
                        ]
                    }
                };

                this.resize();
                window.addEventListener('resize', () => this.resize());
                this.map.on('move', () => this.render());
                this.map.on('zoom', () => this.render());
                this.map.on('resize', () => { this.resize(); this.render(); });

                this.frameCount = 0;
                this.fpsTimer = performance.now();

                this.loop();
            }

            setActiveVariable(varKey) {
                this.activeVariable = varKey;
            }

            resize() {
                if (!this.canvas) return;
                const mapEl = document.getElementById('map');
                const w = (mapEl && mapEl.clientWidth > 0) ? mapEl.clientWidth : (this.canvas.clientWidth || window.innerWidth);
                const h = (mapEl && mapEl.clientHeight > 0) ? mapEl.clientHeight : (this.canvas.clientHeight || (window.innerHeight - 88));
                this.canvas.width = Math.max(w, 320);
                this.canvas.height = Math.max(h, 320);
                if (mapEl) {
                    this.canvas.style.top = (mapEl.offsetTop || 56) + 'px';
                    this.canvas.style.left = (mapEl.offsetLeft || 0) + 'px';
                    this.canvas.style.width = this.canvas.width + 'px';
                    this.canvas.style.height = this.canvas.height + 'px';
                }
            }

            toggle(layer, state) {
                if (this.toggles.hasOwnProperty(layer)) {
                    this.toggles[layer] = state;
                }
            }

            setRegime(regime) {
                this.regime = regime;
                if (regime === 'calm') this.speedMult = 0.5;
                else if (regime === 'base') this.speedMult = 1.0;
                else if (regime === 'storm') this.speedMult = 2.5;

                const lbl = document.getElementById('flowRegimeLabel');
                if (lbl) {
                    if (regime === 'calm') lbl.innerText = 'Primavera • Calma (0.5x)';
                    else if (regime === 'base') lbl.innerText = 'Verano • Flujo Base (1.0x)';
                    else if (regime === 'storm') lbl.innerText = 'Alerta • Viento Puelche / Tormenta (2.5x)';
                }
            }

            setAtmosphericState(params) {
                if (!params) return;
                this.windSpeed = params.windSpeed !== undefined ? params.windSpeed : (this.windSpeed || 15);
                this.windDir = params.windDir !== undefined ? params.windDir : (this.windDir || 225);
                this.temp = params.temp !== undefined ? params.temp : (this.temp || 20);
                this.precip = params.precip !== undefined ? params.precip : (this.precip || 0);

                const calculatedSpeed = Math.max(0.35, Math.min(3.5, this.windSpeed / 16.0));
                this.speedMult = calculatedSpeed;

                if (this.windDir >= 45 && this.windDir <= 125) {
                    this.windColorStart = 'rgba(245, 158, 11, 0.1)';
                    this.windColorEnd = 'rgba(239, 68, 68, 0.9)';
                    this.windHeadColor = '#fef08a';
                } else if (this.temp < 8) {
                    this.windColorStart = 'rgba(186, 230, 253, 0.1)';
                    this.windColorEnd = 'rgba(56, 189, 248, 0.85)';
                    this.windHeadColor = '#e0f2fe';
                } else if (this.precip > 5.0) {
                    this.windColorStart = 'rgba(59, 130, 246, 0.1)';
                    this.windColorEnd = 'rgba(30, 64, 175, 0.9)';
                    this.windHeadColor = '#93c5fd';
                } else {
                    this.windColorStart = 'rgba(56, 189, 248, 0.05)';
                    this.windColorEnd = 'rgba(14, 165, 233, 0.8)';
                    this.windHeadColor = '#ffffff';
                }

                this.isSouthWestWind = (this.windDir >= 180 && this.windDir <= 280);
            }

            resume() {
                this.running = true;
            }

            getPointOnPolyline(pts, progress) {
                if (pts.length < 2) return null;
                const totalSegments = pts.length - 1;
                const scaledProg = progress * totalSegments;
                const segIdx = Math.min(Math.floor(scaledProg), totalSegments - 1);
                const segT = scaledProg - segIdx;

                const p1 = pts[segIdx];
                const p2 = pts[segIdx + 1];

                const lat = p1[0] + (p2[0] - p1[0]) * segT;
                const lng = p1[1] + (p2[1] - p1[1]) * segT;

                return this.map.latLngToContainerPoint([lat, lng]);
            }

            loop() {
                if (this.running) {
                    this.update();
                    this.render();
                }
                requestAnimationFrame(() => this.loop());
            }

            update() {
                const dt = this.speedMult;

                this.waterParticles.forEach(p => {
                    p.progress += p.speed * dt;
                    if (p.progress > 1.0) p.progress = 0;
                });

                // 1. Partículas de Onda de Crecida Fluvial
                if (this.toggles.floodWave) {
                    this.floodParticles.forEach(p => {
                        p.progress += p.speed * dt;
                        p.wobble += 0.05;
                        if (p.progress > 1.0) p.progress = 0;
                    });
                }

                // 2. Partículas de Fuego y Pavesas Volantes (Viento Puelche & Biomasa)
                if (this.toggles.fireWave) {
                    const isPuelche = !!(window.isPuelcheActive || this.isPuelcheActive || (this.windSpeed >= 40 && this.windDir >= 60 && this.windDir <= 120));
                    const puelcheMult = isPuelche ? 2.2 : 0.7;
                    this.fireParticles.forEach(p => {
                        // Las pavesas (chispas) se desplazan a velocidad incrementada si Puelche rachea
                        const pSpeed = p.isSpark ? (p.speed * 1.6 * puelcheMult) : (p.speed * puelcheMult);
                        p.progress += pSpeed * dt;
                        p.wobble += isPuelche ? 0.08 : 0.04;
                        if (p.progress > 1.0) p.progress = 0;
                    });
                }

                // 3. Partículas de Alud (Aceleración Gravitacional según Pendiente 34°)
                if (this.toggles.landslideWave) {
                    this.landslideParticles.forEach(p => {
                        // Aceleración exponencial con la caída gravitacional
                        const gravityFactor = 1.0 + p.progress * 2.0;
                        p.progress += p.speed * dt * gravityFactor;
                        if (p.progress > 1.0) p.progress = 0;
                    });
                }

                this.windParticles.forEach(p => {
                    p.progress += p.speed * dt;
                    if (p.progress > 1.0) p.progress = 0;
                });

                // Actualizar partículas continuas de flujo Windy
                if (this.flowFieldParticles && (this.toggles.wind || ['wind', 'gusts', 'precip', 'temp', 'clouds', 'pressure'].includes(this.activeVariable))) {
                    const stepMult = (this.speedMult || 1.0) * (this.userSpeedMultiplier || 1.0) * (window.hubPlaySpeed || 1.0);
                    const isGusts = (this.activeVariable === 'gusts');
                    const altFactor = Math.pow(Math.max(10, this.altitudeM || 10) / 10, 0.14);
                    const baseAngleRad = ((this.windDir !== undefined ? this.windDir : 220) - 180) * Math.PI / 180;
                    
                    const stepLat = Math.cos(baseAngleRad) * 0.00030 * stepMult * altFactor * (isGusts ? 1.6 : 1.0);
                    const stepLng = Math.sin(baseAngleRad) * 0.00038 * stepMult * altFactor * (isGusts ? 1.6 : 1.0);

                    for (let i = 0; i < this.flowFieldParticles.length; i++) {
                        const p = this.flowFieldParticles[i];
                        if (!p.trail) p.trail = [];
                        p.trail.unshift({ lat: p.lat, lng: p.lng });
                        if (p.trail.length > 4) p.trail.pop();

                        p.prevLat = p.lat;
                        p.prevLng = p.lng;

                        // Curvatura orográfica local por el cajón cordillerano del Río Longaví
                        const orographicDeflection = Math.sin((p.lng + 71.60) * 12.0) * 0.00008;

                        p.lat += (stepLat + orographicDeflection) * p.speedMult;
                        p.lng += stepLng * p.speedMult;
                        p.age++;

                        if (p.age >= p.maxAge ||
                            p.lat < this.basinBounds.minLat || p.lat > this.basinBounds.maxLat ||
                            p.lng < this.basinBounds.minLng || p.lng > this.basinBounds.maxLng) {
                            p.lat = this.basinBounds.minLat + Math.random() * (this.basinBounds.maxLat - this.basinBounds.minLat);
                            p.lng = this.basinBounds.minLng + Math.random() * (this.basinBounds.maxLng - this.basinBounds.minLng);
                            p.prevLat = p.lat;
                            p.prevLng = p.lng;
                            p.trail = [];
                            p.age = 0;
                            p.maxAge = 60 + Math.floor(Math.random() * 80);
                        }
                    }
                }

                this.aquiferRings.forEach(ring => {
                    ring.r += ring.speed * dt;
                    if (ring.r > ring.maxR) ring.r = 5;
                });

                this.frameCount++;
                const now = performance.now();
                if (now - this.fpsTimer >= 1000) {
                    const fps = Math.round((this.frameCount * 1000) / (now - this.fpsTimer));
                    const fpsEl = document.getElementById('energyEngineFps');
                    if (fpsEl) fpsEl.innerText = `${fps} FPS`;
                    this.frameCount = 0;
                    this.fpsTimer = now;
                }
            }

            // Helper para rotular curvas e isopletas con tipografía negra sobre cápsula de alto contraste
            drawHighContrastLabel(ctx, text, x, y, pillBg = '#ffffff', borderColor = '#000000') {
                ctx.save();
                ctx.font = 'bold 12px "JetBrains Mono", monospace';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                const textMetrics = ctx.measureText(text);
                const textWidth = textMetrics.width;
                const padX = 8;
                const padY = 5;
                const h = 20;
                const rx = x - 2;
                const ry = y - h / 2;

                // Cápsula de fondo luminoso
                ctx.fillStyle = pillBg;
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(rx, ry, textWidth + padX * 2, h, 6);
                ctx.fill();
                ctx.stroke();

                // Texto en color negro puro
                ctx.fillStyle = '#000000';
                ctx.fillText(text, rx + padX, y);
                ctx.restore();
            }

            // ═══════════════════════════════════════════════════════════════════
            // RENDER: SUPERFICIES DE INFLUENCIA, CURVAS DE NIVEL & VECTORES CONO
            // ═══════════════════════════════════════════════════════════════════
            renderInfluenceSurfaces(ctx) {
                if (!this.showInfluenceSurfaces) return;

                // 1. ÁREAS DE INFLUENCIA DE INCENDIO (FRANJA FORESTAL EXTENDIDA + CONO DE ARRASTRE CATABÁTICO)
                if (this.activeVariable === 'fwi' || (this.windDir >= 45 && this.windDir <= 125)) {
                    const z = this.influenceZones.fire;
                    
                    // A. ENVOLVENTE CONTINUA DE INTERFAZ FORESTAL ANDINA (EXTENDIDA SOBRE TODA LA MASA FORESTAL DE ORIGEN)
                    // Polígono de interfase forestal continua desde donde sopla el viento Puelche
                    const forestRidgeCoords = [
                        [-36.0800, -71.4200],
                        [-36.1400, -71.4000],
                        [-36.2200, -71.3800],
                        [-36.3200, -71.4000],
                        [-36.3000, -71.5200],
                        [-36.2100, -71.5500],
                        [-36.1200, -71.5200]
                    ];
                    
                    ctx.save();
                    ctx.beginPath();
                    let fFirst = true;
                    forestRidgeCoords.forEach(c => {
                        const pt = this.map.latLngToContainerPoint(c);
                        if (fFirst) { ctx.moveTo(pt.x, pt.y); fFirst = false; }
                        else { ctx.lineTo(pt.x, pt.y); }
                    });
                    ctx.closePath();
                    
                    const forestGrad = ctx.createLinearGradient(
                        this.canvas.width * 0.75, this.canvas.height * 0.2,
                        this.canvas.width * 0.45, this.canvas.height * 0.6
                    );
                    forestGrad.addColorStop(0, 'rgba(239, 68, 68, 0.42)');
                    forestGrad.addColorStop(0.6, 'rgba(249, 115, 22, 0.28)');
                    forestGrad.addColorStop(1, 'rgba(234, 179, 8, 0.12)');
                    ctx.fillStyle = forestGrad;
                    ctx.fill();
                    
                    ctx.strokeStyle = '#dc2626';
                    ctx.lineWidth = 3.5;
                    ctx.setLineDash([8, 6]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.restore();

                    // Rótulo de la Franja Forestal Continua
                    const forestLabelPt = this.map.latLngToContainerPoint([-36.1400, -71.4200]);
                    this.drawHighContrastLabel(ctx, '🔥 FRENTE FORESTAL CONTINUO • INTERFAZ PUELCHE', forestLabelPt.x, forestLabelPt.y, '#fef08a', '#dc2626');

                    // B. VECTOR CONO Y ENVOLVENTE DE PAVESAS HACIA EL VALLE
                    const apexPt = this.map.latLngToContainerPoint(z.apex);
                    const coneLen = Math.min(this.canvas.width * 0.48, 380);
                    const angleRad = (z.axisDeg * Math.PI) / 180;
                    const halfSpread = z.spreadAngle;

                    z.levels.forEach((lvl, idx) => {
                        const curLen = coneLen * lvl.radiusRatio;
                        ctx.beginPath();
                        ctx.moveTo(apexPt.x, apexPt.y);
                        ctx.arc(apexPt.x, apexPt.y, curLen, angleRad - halfSpread, angleRad + halfSpread);
                        ctx.closePath();

                        // Gradiente radial de calor y pavesas
                        const radGrad = ctx.createRadialGradient(apexPt.x, apexPt.y, 8, apexPt.x, apexPt.y, curLen);
                        radGrad.addColorStop(0, `rgba(220, 38, 38, ${lvl.alpha * 1.6})`);
                        radGrad.addColorStop(0.7, `rgba(245, 158, 11, ${lvl.alpha * 1.2})`);
                        radGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

                        ctx.fillStyle = radGrad;
                        ctx.fill();

                        // Curva de nivel envolvente (Isopleta FWI)
                        ctx.strokeStyle = `rgba(220, 38, 38, ${Math.min(1.0, lvl.alpha * 2.2)})`;
                        ctx.lineWidth = 3.0;
                        ctx.setLineDash([6, 5]);
                        ctx.stroke();
                        ctx.setLineDash([]);

                        // Etiqueta de la curva en alto contraste negro
                        const lblX = apexPt.x + Math.cos(angleRad) * curLen;
                        const lblY = apexPt.y + Math.sin(angleRad) * curLen;
                        this.drawHighContrastLabel(ctx, `🔥 ${lvl.label}`, lblX + 6, lblY, '#fee2e2', '#ef4444');
                    });
                }

                // 2. ISOPLETAS DE VIENTO & DISTRIBUCIÓN DEL AIRE (WIND)
                if (this.activeVariable === 'wind') {
                    const isopleths = this.influenceZones.wind.isopleths;
                    isopleths.forEach((iso, idx) => {
                        ctx.beginPath();
                        let first = true;
                        iso.pts.forEach(pt => {
                            const p = this.map.latLngToContainerPoint(pt);
                            if (first) { ctx.moveTo(p.x, p.y); first = false; }
                            else { ctx.lineTo(p.x, p.y); }
                        });
                        const intensity = Math.min(1.0, (this.windSpeed || 20) / 45);
                        ctx.strokeStyle = `rgba(14, 165, 233, ${0.45 + intensity * 0.50})`;
                        ctx.lineWidth = 3.5;
                        ctx.setLineDash([10, 6]);
                        ctx.stroke();
                        ctx.setLineDash([]);

                        // Rótulo visible en alto contraste con letras negras
                        if (iso.pts.length > 2) {
                            const mid = this.map.latLngToContainerPoint(iso.pts[1]);
                            this.drawHighContrastLabel(
                                ctx, 
                                `💨 ${iso.label} [${this.windSpeed || iso.val} km/h]`, 
                                mid.x + 10, 
                                mid.y, 
                                '#e0f2fe', 
                                '#0284c7'
                            );
                        }
                    });
                }

                // 3. ISOTERMAS TÉRMICAS (TEMP)
                if (this.activeVariable === 'temp') {
                    const isotherms = this.influenceZones.temp.isotherms;
                    isotherms.forEach(iso => {
                        ctx.beginPath();
                        let first = true;
                        iso.pts.forEach(pt => {
                            const p = this.map.latLngToContainerPoint(pt);
                            if (first) { ctx.moveTo(p.x, p.y); first = false; }
                            else { ctx.lineTo(p.x, p.y); }
                        });
                        ctx.strokeStyle = iso.color.replace('0.28', '0.85').replace('0.22', '0.85').replace('0.18', '0.85');
                        ctx.lineWidth = 3.5;
                        ctx.stroke();

                        const mid = this.map.latLngToContainerPoint(iso.pts[1]);
                        this.drawHighContrastLabel(
                            ctx, 
                            `🌡️ ${iso.label}`, 
                            mid.x + 10, 
                            mid.y, 
                            '#fef08a', 
                            '#eab308'
                        );
                    });
                }

                // 4. ISOYETAS DE PRECIPITACIÓN & CAUDAL (PRECIP)
                if (this.activeVariable === 'precip') {
                    const isohyets = this.influenceZones.precip.isohyets;
                    isohyets.forEach(iso => {
                        ctx.beginPath();
                        let first = true;
                        iso.pts.forEach(pt => {
                            const p = this.map.latLngToContainerPoint(pt);
                            if (first) { ctx.moveTo(p.x, p.y); first = false; }
                            else { ctx.lineTo(p.x, p.y); }
                        });
                        ctx.strokeStyle = iso.color.replace('0.35', '0.88').replace('0.25', '0.85').replace('0.18', '0.85');
                        ctx.lineWidth = 3.5;
                        ctx.stroke();

                        const mid = this.map.latLngToContainerPoint(iso.pts[1]);
                        this.drawHighContrastLabel(
                            ctx, 
                            `🌧️ ${iso.label}`, 
                            mid.x + 10, 
                            mid.y, 
                            '#bae6fd', 
                            '#0369a1'
                        );
                    });
                }
            }

            render() {
                if (!this.ctx || !this.map) return;
                if (!this.canvas.height || !this.canvas.width || this.canvas.height < 50) {
                    this.resize();
                }
                const ctx = this.ctx;
                // Fondo 100% transparente para que la imagen satelital brille con total claridad
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                // 0. ÁREAS DE INFLUENCIA, CURVAS DE NIVEL POR VARIABLE & CONOS DE ARRASTRE
                this.renderInfluenceSurfaces(ctx);

                // 1. Curvas de Nivel Topográficas Básicas
                if (this.toggles.contours) {
                    this.contours.forEach((c) => {
                        ctx.beginPath();
                        let first = true;
                        c.pts.forEach(pt => {
                            const p = this.map.latLngToContainerPoint(pt);
                            if (first) { ctx.moveTo(p.x, p.y); first = false; }
                            else { ctx.lineTo(p.x, p.y); }
                        });
                        ctx.strokeStyle = c.color;
                        ctx.lineWidth = 2.5;
                        ctx.setLineDash([6, 4]);
                        ctx.stroke();
                        ctx.setLineDash([]);

                        if (c.pts.length > 2) {
                            const mid = this.map.latLngToContainerPoint(c.pts[Math.floor(c.pts.length / 2)]);
                            this.drawHighContrastLabel(
                                ctx, 
                                `⛰️ ${c.elev}`, 
                                mid.x + 10, 
                                mid.y, 
                                '#f1f5f9', 
                                '#475569'
                            );
                        }
                    });
                }

                // 2. Recarga Freática Subterránea
                if (this.toggles.aquifer) {
                    const menielCenter = this.map.latLngToContainerPoint([-36.2115, -71.6053]);
                    this.aquiferRings.forEach(ring => {
                        const alpha = Math.max(0, 1 - ring.r / ring.maxR) * 0.6;
                        ctx.beginPath();
                        ctx.arc(menielCenter.x, menielCenter.y, ring.r, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
                        ctx.lineWidth = 2.0;
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc(menielCenter.x, menielCenter.y, ring.r * 0.7, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.7})`;
                        ctx.lineWidth = 1.0;
                        ctx.stroke();
                    });

                    ctx.beginPath();
                    ctx.arc(menielCenter.x, menielCenter.y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#38bdf8';
                    ctx.fill();
                    ctx.fillStyle = '#a5b4fc';
                    ctx.font = '10px "JetBrains Mono", monospace';
                    ctx.fillText('Recarga Keyline Meniel', menielCenter.x + 8, menielCenter.y + 3);
                }

                // 3. CAPAS ESPECIALES ESTILO WINDY: ISÓBARAS, NUBES, TEMPERATURA
                if (this.activeVariable === 'pressure') {
                    // Isóbaras suaves a lo largo de la cuenca
                    const isobars = [
                        { hpa: 1020, pts: [[-36.05, -71.42], [-36.14, -71.48], [-36.24, -71.46], [-36.32, -71.43]] },
                        { hpa: 1016, pts: [[-36.06, -71.52], [-36.15, -71.58], [-36.25, -71.56], [-36.33, -71.53]] },
                        { hpa: 1012, pts: [[-36.07, -71.62], [-36.16, -71.68], [-36.26, -71.66], [-36.34, -71.63]] },
                        { hpa: 1008, pts: [[-36.08, -71.72], [-36.17, -71.78], [-36.27, -71.76], [-36.35, -71.73]] },
                        { hpa: 1004, pts: [[-36.09, -71.82], [-36.18, -71.86], [-36.28, -71.84], [-36.36, -71.81]] }
                    ];

                    ctx.save();
                    isobars.forEach(iso => {
                        ctx.beginPath();
                        let first = true;
                        iso.pts.forEach(pt => {
                            const p = this.map.latLngToContainerPoint(pt);
                            if (first) { ctx.moveTo(p.x, p.y); first = false; }
                            else { ctx.lineTo(p.x, p.y); }
                        });
                        ctx.strokeStyle = 'rgba(168, 85, 247, 0.75)';
                        ctx.lineWidth = 2.0;
                        ctx.stroke();

                        const mid = this.map.latLngToContainerPoint(iso.pts[1]);
                        this.drawHighContrastLabel(ctx, `🔘 ${iso.hpa} hPa`, mid.x + 8, mid.y, '#faf5ff', '#9333ea');
                    });
                    ctx.restore();
                } else if (this.activeVariable === 'clouds') {
                    // Masas suaves de nubosidad flotante
                    ctx.save();
                    const cloudCenters = [
                        [-36.12, -71.46, 75],
                        [-36.18, -71.54, 95],
                        [-36.24, -71.65, 80],
                        [-36.20, -71.75, 110],
                        [-36.28, -71.48, 85]
                    ];
                    cloudCenters.forEach(([lat, lng, r]) => {
                        const pt = this.map.latLngToContainerPoint([lat, lng]);
                        const grad = ctx.createRadialGradient(pt.x, pt.y, 5, pt.x, pt.y, r * 1.5);
                        grad.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
                        grad.addColorStop(0.5, 'rgba(241, 245, 249, 0.18)');
                        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, r * 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    });
                    ctx.restore();
                } else if (this.activeVariable === 'temp') {
                    // Gradiente térmico cordillera (frío) a valle (cálido)
                    ctx.save();
                    const p1 = this.map.latLngToContainerPoint([-36.15, -71.40]);
                    const p2 = this.map.latLngToContainerPoint([-36.20, -71.85]);
                    const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                    grad.addColorStop(0, 'rgba(59, 130, 246, 0.22)');
                    grad.addColorStop(0.5, 'rgba(34, 197, 94, 0.15)');
                    grad.addColorStop(1, 'rgba(239, 68, 68, 0.25)');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    ctx.restore();
                } else if (this.activeVariable === 'precip') {
                    // RADAR METEOROLÓGICO PLUVIOMÉTRICO (DOPPLER) & ESCORRENTÍA FLUVIAL
                    ctx.save();
                    const now = performance.now() * 0.001;

                    // 1. Células de radar de lluvia activa (mm/h)
                    const rainCells = [
                        { lat: -36.26, lng: -71.45, r: 110, mm: 22.4, label: 'Núcleo Andino 22.4 mm/h' },
                        { lat: -36.20, lng: -71.55, r: 85,  mm: 14.2, label: 'Frente Bullileo 14 mm/h' },
                        { lat: -36.16, lng: -71.66, r: 70,  mm: 6.8,  label: 'Precipitación Retiro 7 mm/h' },
                        { lat: -36.12, lng: -71.78, r: 60,  mm: 2.1,  label: 'Llovizna Parral 2 mm/h' }
                    ];

                    rainCells.forEach(cell => {
                        const pt = this.map.latLngToContainerPoint([cell.lat, cell.lng]);
                        const pulse = Math.sin(now * 2.0 + cell.lat * 5) * 8;
                        const radius = cell.r + pulse;
                        const grad = ctx.createRadialGradient(pt.x, pt.y, 4, pt.x, pt.y, radius);
                        grad.addColorStop(0, 'rgba(147, 51, 234, 0.42)');   // Violeta núcleo convectivo
                        grad.addColorStop(0.35, 'rgba(37, 99, 235, 0.32)'); // Azul lluvia torrencial
                        grad.addColorStop(0.70, 'rgba(56, 189, 248, 0.18)'); // Cyan lluvia moderada
                        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
                        ctx.fill();

                        this.drawHighContrastLabel(ctx, `🌧️ ${cell.label}`, pt.x - 20, pt.y - 12, '#eff6ff', '#1d4ed8');
                    });

                    // 2. Escorrentía fluvial activa y pulsante en el eje del Río Longaví
                    const riverPts = [
                        [-36.2800, -71.4200], [-36.2300, -71.4800], [-36.2100, -71.5500],
                        [-36.1900, -71.6200], [-36.1750, -71.6700], [-36.1600, -71.7200],
                        [-36.1400, -71.7800]
                    ];
                    ctx.beginPath();
                    let first = true;
                    riverPts.forEach(pt => {
                        const p = this.map.latLngToContainerPoint(pt);
                        if (first) { ctx.moveTo(p.x, p.y); first = false; }
                        else { ctx.lineTo(p.x, p.y); }
                    });
                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
                    ctx.lineWidth = 4.5;
                    ctx.setLineDash([14, 8]);
                    ctx.lineDashOffset = -now * 45; // Pulso de escorrentía rápida aguas abajo
                    ctx.stroke();
                    ctx.setLineDash([]);

                    ctx.restore();
                }

                // 4. FLUJO CONTINUO DE PARTÍCULAS ESTILO WINDY (3.000 PARTÍCULAS SOBRE 122.000 HA)
                if (this.flowFieldParticles && (this.toggles.wind || ['wind', 'gusts', 'precip', 'temp', 'clouds', 'pressure'].includes(this.activeVariable))) {
                    const isGusts = (this.activeVariable === 'gusts');
                    const isPrecip = (this.activeVariable === 'precip');
                    const opacity = (this.userOpacity || 0.85);

                    ctx.save();
                    ctx.lineWidth = isGusts ? 2.4 : (isPrecip ? 2.0 : 1.7);
                    ctx.lineCap = 'round';

                    const bounds = this.map.getBounds();
                    const minPtLat = bounds.getSouth();
                    const maxPtLat = bounds.getNorth();
                    const minPtLng = bounds.getWest();
                    const maxPtLng = bounds.getEast();

                    for (let i = 0; i < this.flowFieldParticles.length; i++) {
                        const p = this.flowFieldParticles[i];
                        if (p.lat < minPtLat || p.lat > maxPtLat || p.lng < minPtLng || p.lng > maxPtLng) continue;

                        const curr = this.map.latLngToContainerPoint([p.lat, p.lng]);
                        const prev = this.map.latLngToContainerPoint([p.prevLat, p.prevLng]);

                        const dx = curr.x - prev.x;
                        const dy = curr.y - prev.y;
                        if (dx * dx + dy * dy < 0.2) continue;

                        // Color espectral base según velocidad y capa activa
                        let colorBase = 'rgba(56, 189, 248, 1)';
                        const spd = (this.windSpeed || 18) * (isGusts ? 1.6 : 1.0);
                        if (isPrecip) {
                            colorBase = 'rgba(96, 165, 250, 1)'; // Azul lluvia índigo
                        } else if (spd < 15) {
                            colorBase = 'rgba(56, 189, 248, 1)'; // cyan
                        } else if (spd < 28) {
                            colorBase = 'rgba(34, 197, 94, 1)'; // verde
                        } else if (spd < 42) {
                            colorBase = 'rgba(234, 179, 8, 1)'; // amarillo
                        } else if (spd < 60) {
                            colorBase = 'rgba(239, 68, 68, 1)'; // rojo
                        } else {
                            colorBase = 'rgba(217, 70, 239, 1)'; // magenta
                        }

                        // Trazar estela decreciente transparente (Cero velo negro)
                        if (p.trail && p.trail.length > 0) {
                            let pStart = curr;
                            for (let t = 0; t < p.trail.length; t++) {
                                const ptPrev = this.map.latLngToContainerPoint([p.trail[t].lat, p.trail[t].lng]);
                                const trailAlpha = (1.0 - (t + 1) / (p.trail.length + 1)) * opacity;
                                ctx.strokeStyle = colorBase.replace(/[\d\.]+\)$/, `${trailAlpha.toFixed(2)})`);
                                ctx.beginPath();
                                ctx.moveTo(pStart.x, pStart.y);
                                ctx.lineTo(ptPrev.x, ptPrev.y);
                                ctx.stroke();
                                pStart = ptPrev;
                            }
                        } else {
                            ctx.strokeStyle = colorBase.replace(/[\d\.]+\)$/, `${opacity})`);
                            ctx.beginPath();
                            ctx.moveTo(prev.x, prev.y);
                            ctx.lineTo(curr.x, curr.y);
                            ctx.stroke();
                        }

                        // En ráfagas, dibujar cabeza iluminada
                        if (isGusts && i % 4 === 0) {
                            ctx.fillStyle = '#fef08a';
                            ctx.beginPath();
                            ctx.arc(curr.x, curr.y, 1.8, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                    ctx.restore();
                }

                // Corrientes históricas individuales
                if (this.toggles.wind && this.windParticles) {
                    const cStart = this.windColorStart || 'rgba(245, 158, 11, 0)';
                    const cEnd = this.windColorEnd || 'rgba(239, 68, 68, 0.85)';
                    const cHead = this.windHeadColor || '#fef08a';

                    this.windParticles.forEach(p => {
                        const pts = this.windPaths[p.pathIdx];
                        const prog = this.isSouthWestWind ? (1.0 - p.progress) : p.progress;
                        const prevProg = this.isSouthWestWind ? Math.min(1.0, prog + 0.04) : Math.max(0, prog - 0.04);

                        const pt = this.getPointOnPolyline(pts, prog);
                        const prevPt = this.getPointOnPolyline(pts, prevProg);
                        if (!pt || !prevPt) return;

                        const grad = ctx.createLinearGradient(prevPt.x, prevPt.y, pt.x, pt.y);
                        grad.addColorStop(0, cStart);
                        grad.addColorStop(1, cEnd);

                        ctx.beginPath();
                        ctx.moveTo(prevPt.x, prevPt.y);
                        ctx.lineTo(pt.x, pt.y);
                        ctx.strokeStyle = grad;
                        ctx.lineWidth = p.size;
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, p.size * 0.8, 0, Math.PI * 2);
                        ctx.fillStyle = cHead;
                        ctx.fill();
                    });
                }

                // 4. Escorrentía Hídrica
                if (this.toggles.water) {
                    this.waterPaths.forEach(pts => {
                        ctx.beginPath();
                        let first = true;
                        pts.forEach(coord => {
                            const pt = this.map.latLngToContainerPoint(coord);
                            if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
                            else { ctx.lineTo(pt.x, pt.y); }
                        });
                        ctx.strokeStyle = 'rgba(14, 165, 233, 0.25)';
                        ctx.lineWidth = 4;
                        ctx.stroke();
                    });

                    this.waterParticles.forEach(p => {
                        const pts = this.waterPaths[p.pathIdx];
                        const pt = this.getPointOnPolyline(pts, p.progress);
                        const prevPt = this.getPointOnPolyline(pts, Math.max(0, p.progress - 0.025));
                        if (!pt || !prevPt) return;

                        ctx.beginPath();
                        ctx.moveTo(prevPt.x, prevPt.y);
                        ctx.lineTo(pt.x, pt.y);
                        ctx.strokeStyle = p.color;
                        ctx.lineWidth = p.size;
                        ctx.lineCap = 'round';
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, p.size + 0.5, 0, Math.PI * 2);
                        ctx.fillStyle = '#ffffff';
                        ctx.shadowColor = '#38bdf8';
                        ctx.shadowBlur = 6;
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    });
                }

                // 5. Flujos Dinámicos Específicos de Amenaza (Onda Crecida, Fuego Puelche & Alud)
                this.renderFloodWave(ctx);
                this.renderFireWave(ctx);
                this.renderLandslideWave(ctx);
            }

            // ═══════════════════════════════════════════════════════════════════
            // HELPERS TÁCTICOS C2 / RTS: MACRO CHEVRONS, RADAR SPAWN Y DEFENSAS
            // ═══════════════════════════════════════════════════════════════════
            drawRtsTacticalChevron(ctx, x, y, angle, length = 38, width = 28, fillColor = '#ef4444', strokeColor = '#fde047', alpha = 0.55, pulsePhase = 0) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle);

                const pulse = 0.82 + 0.18 * Math.sin(pulsePhase);
                const l = length * pulse;
                const w = width * pulse;
                const notch = l * 0.42;

                ctx.beginPath();
                ctx.moveTo(l * 0.55, 0);
                ctx.lineTo(-l * 0.45, w * 0.55);
                ctx.lineTo(-l * 0.45 + notch, 0);
                ctx.lineTo(-l * 0.45, -w * 0.55);
                ctx.closePath();

                ctx.fillStyle = fillColor;
                ctx.globalAlpha = Math.max(0.12, Math.min(0.95, alpha * pulse));
                ctx.fill();

                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 2.2;
                ctx.shadowColor = strokeColor;
                ctx.shadowBlur = 10;
                ctx.globalAlpha = Math.min(1.0, (alpha + 0.28) * pulse);
                ctx.stroke();

                // Chevron interior de impulso cinético
                ctx.beginPath();
                ctx.moveTo(l * 0.22, 0);
                ctx.lineTo(-l * 0.18, w * 0.28);
                ctx.moveTo(l * 0.22, 0);
                ctx.lineTo(-l * 0.18, -w * 0.28);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.8;
                ctx.globalAlpha = 0.85 * pulse;
                ctx.stroke();

                ctx.restore();
            }

            drawRtsRadarEmitter(ctx, latLng, label, tag, color = '#ef4444') {
                const pt = this.map.latLngToContainerPoint(latLng);
                const t = performance.now() * 0.0022;
                ctx.save();

                // 3 anillos concéntricos expansivos estilo radar militar
                const maxR = 48;
                for (let i = 0; i < 3; i++) {
                    const ringProg = (t + i * 0.33) % 1.0;
                    const r = 6 + ringProg * (maxR - 6);
                    const ringAlpha = (1.0 - ringProg) * 0.70;
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1.8;
                    ctx.globalAlpha = ringAlpha;
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 9;
                    ctx.stroke();
                }

                // Núcleo central pulsante
                const corePulse = 0.75 + 0.25 * Math.sin(t * 3.5);
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 6.5 * corePulse, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = color;
                ctx.shadowBlur = 12;
                ctx.globalAlpha = 1.0;
                ctx.fill();

                // Retículo militar en cruz
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.85;
                const arm = 14;
                const gap = 8;
                ctx.beginPath();
                ctx.moveTo(pt.x, pt.y - gap); ctx.lineTo(pt.x, pt.y - gap - arm);
                ctx.moveTo(pt.x, pt.y + gap); ctx.lineTo(pt.x, pt.y + gap + arm);
                ctx.moveTo(pt.x - gap, pt.y); ctx.lineTo(pt.x - gap - arm, pt.y);
                ctx.moveTo(pt.x + gap, pt.y); ctx.lineTo(pt.x + gap + arm, pt.y);
                ctx.stroke();

                // Badge táctico de origen
                const bW = 166;
                const bH = 26;
                const bx = pt.x + 18;
                const by = pt.y - 13;

                ctx.fillStyle = 'rgba(7, 14, 26, 0.94)';
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.4;
                ctx.globalAlpha = 0.95;
                ctx.beginPath();
                ctx.roundRect(bx, by, bW, bH, 5);
                ctx.fill();
                ctx.stroke();

                ctx.font = 'bold 9px "JetBrains Mono", monospace';
                ctx.fillStyle = color;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(`🎯 ${label}`, bx + 7, by + 4);

                ctx.font = '8px "JetBrains Mono", monospace';
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText(tag, bx + 7, by + 14);

                ctx.restore();
            }

            drawRtsDefenseWall(ctx, latLng1, latLng2, label, color = '#10b981') {
                const p1 = this.map.latLngToContainerPoint(latLng1);
                const p2 = this.map.latLngToContainerPoint(latLng2);
                const t = performance.now() * 0.003;
                const pulse = 0.65 + 0.35 * Math.sin(t);

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = color;
                ctx.lineWidth = 4.5;
                ctx.setLineDash([12, 6]);
                ctx.shadowColor = color;
                ctx.shadowBlur = 12;
                ctx.globalAlpha = 0.85 * pulse;
                ctx.stroke();
                ctx.setLineDash([]);

                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;
                ctx.font = 'bold 9px "JetBrains Mono", monospace';
                ctx.fillStyle = 'rgba(6, 28, 18, 0.92)';
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.2;
                const w = ctx.measureText(label).width + 16;
                ctx.beginPath();
                ctx.roundRect(midX - w/2, midY - 10, w, 20, 4);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`🛡️ ${label}`, midX, midY);
                ctx.restore();
            }

            // ═══════════════════════════════════════════════════════════════════
            // FLUJO DINÁMICO DE CRECIDA FLUVIAL (F-01..F-03 • CAUCE & PENDIENTE)
            // ═══════════════════════════════════════════════════════════════════
            renderFloodWave(ctx) {
                if (!this.toggles.floodWave) return;

                // 1. Radar Palpitante en Foco Emisor de Cuenca Alta
                this.drawRtsRadarEmitter(ctx, [-36.2420, -71.4500], 'CABECERA RÍO LONGAVÍ', 'SPAWN Q = 142 m³/s • CAUCE MATRIZ', '#0284c7');

                // 2. Traza del cauce matriz y meandros de desborde
                this.floodPaths.forEach((pts, idx) => {
                    ctx.save();
                    ctx.beginPath();
                    let first = true;
                    pts.forEach(coord => {
                        const pt = this.map.latLngToContainerPoint(coord);
                        if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
                        else { ctx.lineTo(pt.x, pt.y); }
                    });
                    ctx.strokeStyle = (idx === 0) ? 'rgba(56, 189, 248, 0.45)' : 'rgba(6, 182, 212, 0.35)';
                    ctx.lineWidth = (idx === 0) ? 6 : 4;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.shadowColor = '#0284c7';
                    ctx.shadowBlur = 12;
                    ctx.stroke();
                    ctx.restore();
                });

                // 3. Macro Flechas Tácticas Chevrons RTS a lo largo de la curvatura del río y pendiente
                const floodPts = this.floodPaths[0];
                if (floodPts && floodPts.length >= 2) {
                    const chevronStations = [0.18, 0.42, 0.66, 0.88];
                    chevronStations.forEach((progress, cIdx) => {
                        const pt = this.getPointOnPolyline(floodPts, progress);
                        const prevPt = this.getPointOnPolyline(floodPts, Math.max(0, progress - 0.035));
                        if (!pt || !prevPt) return;

                        // Ángulo sigue exactamente el gradiente hidráulico y curvatura del talweg
                        const streamAngle = Math.atan2(pt.y - prevPt.y, pt.x - prevPt.x);
                        const pulsePhase = (performance.now() * 0.003 - progress * 4.5);
                        this.drawRtsTacticalChevron(ctx, pt.x, pt.y, streamAngle, 38, 30, 'rgba(2, 132, 199, 0.65)', '#38bdf8', 0.68, pulsePhase);
                    });
                }

                // 4. Partículas y cabezas de onda viajando a lo largo del Río Longaví
                this.floodParticles.forEach(p => {
                    const pts = this.floodPaths[p.pathIdx];
                    const pt = this.getPointOnPolyline(pts, p.progress);
                    const prevPt = this.getPointOnPolyline(pts, Math.max(0, p.progress - 0.04));
                    if (!pt || !prevPt) return;

                    const angle = Math.atan2(pt.y - prevPt.y, pt.x - prevPt.x);
                    const lateral = Math.sin(p.wobble) * 2.5;
                    const curX = pt.x + Math.cos(angle + Math.PI / 2) * lateral;
                    const curY = pt.y + Math.sin(angle + Math.PI / 2) * lateral;

                    ctx.save();
                    const grad = ctx.createLinearGradient(prevPt.x, prevPt.y, curX, curY);
                    grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
                    grad.addColorStop(0.6, p.color);
                    grad.addColorStop(1, '#ffffff');

                    ctx.beginPath();
                    ctx.moveTo(prevPt.x, prevPt.y);
                    ctx.lineTo(curX, curY);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = p.size;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                    // Cabeza de onda hidrodinámica
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = '#38bdf8';
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(curX, curY, p.size * 0.75, 0, Math.PI * 2);
                    ctx.fill();

                    // Flecha direccional dinámica
                    ctx.beginPath();
                    ctx.moveTo(curX, curY);
                    ctx.lineTo(curX - 10 * Math.cos(angle - 0.4), curY - 10 * Math.sin(angle - 0.4));
                    ctx.lineTo(curX - 6 * Math.cos(angle), curY - 6 * Math.sin(angle));
                    ctx.lineTo(curX - 10 * Math.cos(angle + 0.4), curY - 10 * Math.sin(angle + 0.4));
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(224, 242, 254, 0.95)';
                    ctx.fill();
                    ctx.restore();
                });

                // 5. Línea Defensiva Keyline en Meniel (Absorción y retención activa)
                this.drawRtsDefenseWall(ctx, [-36.2080, -71.6150], [-36.2190, -71.5920], 'DEFENSA KEYLINE ~18.5k m³ (ATENUACIÓN -3.2%)', '#06b6d4');

                // 6. Rótulo de flujo fluvial de cuenca
                const labelCoord = [-36.1830, -71.6540];
                const lPt = this.map.latLngToContainerPoint(labelCoord);
                this.drawHighContrastLabel(ctx, '🌊 FLUJO CRECIDA RÍO LONGAVÍ ➔ 142 m³/s (2.4 m/s)', lPt.x + 12, lPt.y - 18, '#e0f2fe', '#0284c7');
            }

            // ═══════════════════════════════════════════════════════════════════
            // FLUJO DINÁMICO DE INCENDIO & PAVESAS PUELCHE (P-01..P-03 • VIENTO & BIOMASA)
            // ═══════════════════════════════════════════════════════════════════
            // FLUJO DINÁMICO DE INCENDIO: BALANCE FÍSICO PUELCHE VS COMBUSTIÓN BASAL
            // ═══════════════════════════════════════════════════════════════════
            renderFireWave(ctx) {
                if (!this.toggles.fireWave) return;

                const isPuelche = !!(window.isPuelcheActive || this.isPuelcheActive || (this.windSpeed >= 40 && this.windDir >= 60 && this.windDir <= 120));

                // 1. Radar Palpitante en Foco Primario de Cordillera
                if (isPuelche) {
                    this.drawRtsRadarEmitter(ctx, [-36.1720, -71.4750], 'FOCO CORDILLERA P-01', 'SPAWN FWI 74 (EXTREMO) • 850 m/h (PUELCHE ACTIVO)', '#ef4444');
                } else {
                    this.drawRtsRadarEmitter(ctx, [-36.1720, -71.4750], 'FOCO CORDILLERA P-01', 'SPAWN FWI 24 (MODERADO) • 180 m/h (COMBUSTIÓN BASAL)', '#f59e0b');
                }

                // 2. Trazas incandescentes de propagación por viento & biomasa
                this.firePaths.forEach((pts, idx) => {
                    ctx.save();
                    ctx.beginPath();
                    let first = true;
                    pts.forEach(coord => {
                        const pt = this.map.latLngToContainerPoint(coord);
                        if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
                        else { ctx.lineTo(pt.x, pt.y); }
                    });
                    if (isPuelche) {
                        ctx.strokeStyle = (idx === 0) ? 'rgba(239, 68, 68, 0.55)' : 'rgba(249, 115, 22, 0.40)';
                        ctx.lineWidth = (idx === 0) ? 5.5 : 3.8;
                    } else {
                        ctx.strokeStyle = (idx === 0) ? 'rgba(245, 158, 11, 0.35)' : 'rgba(217, 119, 6, 0.25)';
                        ctx.lineWidth = (idx === 0) ? 3.5 : 2.5;
                    }
                    ctx.setLineDash([12, 6]);
                    ctx.shadowColor = isPuelche ? '#ea580c' : '#b45309';
                    ctx.shadowBlur = isPuelche ? 14 : 6;
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.restore();
                });

                // 3. Macro Flechas Tácticas Chevrons RTS: Balance de Vector Viento Puelche + Biomasa
                const firePts = this.firePaths[0];
                if (firePts && firePts.length >= 2) {
                    const windAngleBase = (295 * Math.PI) / 180; // Dirección dominante Puelche ONO
                    const windWobble = Math.sin(performance.now() * 0.0018) * 0.16 + Math.cos(performance.now() * 0.0009) * 0.10; // Ráfagas momento a momento
                    const chevronStations = isPuelche ? [0.18, 0.44, 0.68, 0.86] : [0.22, 0.52, 0.80];

                    chevronStations.forEach((progress, cIdx) => {
                        const pt = this.getPointOnPolyline(firePts, progress);
                        const prevPt = this.getPointOnPolyline(firePts, Math.max(0, progress - 0.035));
                        if (!pt || !prevPt) return;

                        const pathAngle = Math.atan2(pt.y - prevPt.y, pt.x - prevPt.x);
                        // Balanceo físico: Si Puelche está ON, 55% combustible + 45% vector eólico catabático
                        // Si Puelche está OFF, 90% combustible/ladera + 10% brisa basal
                        const effectiveAngle = isPuelche
                            ? (pathAngle * 0.55 + (windAngleBase + windWobble) * 0.45)
                            : (pathAngle * 0.90 + (windAngleBase + windWobble) * 0.10);
                        const pulsePhase = (performance.now() * (isPuelche ? 0.005 : 0.0025) - progress * 5.0);

                        const chevronLength = isPuelche ? 42 : 30;
                        const chevronWidth = isPuelche ? 32 : 22;
                        const mainColor = isPuelche ? 'rgba(220, 38, 38, 0.75)' : 'rgba(217, 119, 6, 0.65)';
                        const tipColor = isPuelche ? '#fde047' : '#fef08a';

                        this.drawRtsTacticalChevron(ctx, pt.x, pt.y, effectiveAngle, chevronLength, chevronWidth, mainColor, tipColor, 0.72, pulsePhase);

                        // Si Puelche está ON: En P-02 proyectar chevrons de spotting (pavesas) hacia sotavento
                        if (isPuelche && cIdx === 1) {
                            const spotAngle = effectiveAngle + 0.15;
                            const spotPtX = pt.x + Math.cos(spotAngle) * 38;
                            const spotPtY = pt.y + Math.sin(spotAngle) * 38;
                            this.drawRtsTacticalChevron(ctx, spotPtX, spotPtY, spotAngle, 24, 18, 'rgba(249, 115, 22, 0.55)', '#fef08a', 0.55, pulsePhase + 1.2);
                        }
                    });
                }

                // 4. Partículas de fuego, lenguas de llama y pavesas volantes (spotting)
                this.fireParticles.forEach(p => {
                    // Si Puelche está OFF, suprimir o atenuar chispas de salto largo
                    if (!isPuelche && p.isSpark && p.progress > 0.5) return;

                    const pts = this.firePaths[p.pathIdx];
                    const pt = this.getPointOnPolyline(pts, p.progress);
                    const prevPt = this.getPointOnPolyline(pts, Math.max(0, p.progress - 0.05));
                    if (!pt || !prevPt) return;

                    const angle = Math.atan2(pt.y - prevPt.y, pt.x - prevPt.x);
                    const lateral = Math.sin(p.wobble) * (p.isSpark ? (isPuelche ? 8 : 3) : 3.5);
                    const curX = pt.x + Math.cos(angle + Math.PI / 2) * lateral;
                    const curY = pt.y + Math.sin(angle + Math.PI / 2) * lateral;

                    ctx.save();
                    if (p.isSpark && isPuelche) {
                        ctx.fillStyle = '#fde047';
                        ctx.shadowColor = '#f97316';
                        ctx.shadowBlur = 10;
                        ctx.beginPath();
                        ctx.arc(curX, curY, p.size * 0.7, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.strokeStyle = 'rgba(249, 115, 22, 0.65)';
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(prevPt.x, prevPt.y);
                        ctx.lineTo(curX, curY);
                        ctx.stroke();
                    } else if (!p.isSpark) {
                        const grad = ctx.createLinearGradient(prevPt.x, prevPt.y, curX, curY);
                        grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
                        grad.addColorStop(0.5, isPuelche ? 'rgba(249, 115, 22, 0.85)' : 'rgba(217, 119, 6, 0.65)');
                        grad.addColorStop(1, isPuelche ? '#fef08a' : '#fed7aa');

                        ctx.beginPath();
                        ctx.moveTo(prevPt.x, prevPt.y);
                        ctx.lineTo(curX, curY);
                        ctx.strokeStyle = grad;
                        ctx.lineWidth = isPuelche ? p.size : (p.size * 0.75);
                        ctx.lineCap = 'round';
                        ctx.stroke();

                        ctx.fillStyle = isPuelche ? '#fde047' : '#fbbf24';
                        ctx.shadowColor = isPuelche ? '#dc2626' : '#ea580c';
                        ctx.shadowBlur = isPuelche ? 12 : 6;
                        ctx.beginPath();
                        ctx.moveTo(curX, curY);
                        ctx.lineTo(curX - 11 * Math.cos(angle - 0.45), curY - 11 * Math.sin(angle - 0.45));
                        ctx.lineTo(curX - 7 * Math.cos(angle), curY - 7 * Math.sin(angle));
                        ctx.lineTo(curX - 11 * Math.cos(angle + 0.45), curY - 11 * Math.sin(angle + 0.45));
                        ctx.closePath();
                        ctx.fill();
                    }
                    ctx.restore();
                });

                // 5. Barrera Defensiva Activa: Faja Cortafuego WUI 45m
                this.drawRtsDefenseWall(ctx, [-36.1850, -71.4950], [-36.2150, -71.5180], 'FAJA CORTAFUEGO WUI 45m (BARRERA ACTIVA)', '#10b981');

                // 6. Rótulo de propagación según condición física de viento Puelche vs Combustión Basal
                const labelCoord = [-36.1920, -71.5300];
                const lPt = this.map.latLngToContainerPoint(labelCoord);
                if (isPuelche) {
                    this.drawHighContrastLabel(ctx, '🔥 FRENTE DE AVANCE PUELCHE ➔ 850 m/h (PAVESAS 1.2 km)', lPt.x + 10, lPt.y - 20, '#fef08a', '#dc2626');
                } else {
                    this.drawHighContrastLabel(ctx, '🔥 FRENTE BASAL ➔ 180 m/h (COMBUSTIÓN BIOMASA LOCAL)', lPt.x + 10, lPt.y - 20, '#fef08a', '#b45309');
                }
            }

            // ═══════════════════════════════════════════════════════════════════
            // FLUJO DINÁMICO DE ALUD & REMOCIÓN EN MASA POR PENDIENTE (M-01..M-02 • PENDIENTE 34°)
            // ═══════════════════════════════════════════════════════════════════
            renderLandslideWave(ctx) {
                if (!this.toggles.landslideWave) return;

                // 1. Radar Palpitante en Escarpe Inestable de Ladera 34°
                this.drawRtsRadarEmitter(ctx, [-36.2575, -71.4390], 'ESCARPE ROCOSO M-01', 'SPAWN PENDIENTE 34° • VOL 28.5k m³', '#f59e0b');

                // 2. Trazas gravitacionales por la ladera de escarpe 34°
                this.landslidePaths.forEach((pts, idx) => {
                    ctx.save();
                    ctx.beginPath();
                    let first = true;
                    pts.forEach(coord => {
                        const pt = this.map.latLngToContainerPoint(coord);
                        if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
                        else { ctx.lineTo(pt.x, pt.y); }
                    });
                    ctx.strokeStyle = (idx === 0) ? 'rgba(245, 158, 11, 0.50)' : 'rgba(217, 119, 6, 0.40)';
                    ctx.lineWidth = (idx === 0) ? 6 : 4;
                    ctx.lineCap = 'round';
                    ctx.shadowColor = '#b45309';
                    ctx.shadowBlur = 10;
                    ctx.stroke();
                    ctx.restore();
                });

                // 3. Macro Flechas Tácticas Chevrons RTS: Vector Pendiente Gravitacional Pura
                const slidePts = this.landslidePaths[0];
                if (slidePts && slidePts.length >= 2) {
                    const chevronStations = [0.22, 0.52, 0.82];
                    chevronStations.forEach((progress, cIdx) => {
                        const pt = this.getPointOnPolyline(slidePts, progress);
                        const prevPt = this.getPointOnPolyline(slidePts, Math.max(0, progress - 0.035));
                        if (!pt || !prevPt) return;

                        const slopeAngle = Math.atan2(pt.y - prevPt.y, pt.x - prevPt.x);
                        // Al llegar a la base (cono de deyección), ensanchar el chevron en abanico
                        const chevronWidth = (progress >= 0.70) ? 44 : 30;
                        const pulsePhase = (performance.now() * 0.0035 - progress * 4.5);

                        this.drawRtsTacticalChevron(ctx, pt.x, pt.y, slopeAngle, 38, chevronWidth, 'rgba(217, 119, 6, 0.72)', '#fde68a', 0.72, pulsePhase);
                    });
                }

                // 4. Partículas detríticas y flechas gravitacionales acelerando por pendiente
                this.landslideParticles.forEach(p => {
                    const pts = this.landslidePaths[p.pathIdx];
                    const pt = this.getPointOnPolyline(pts, p.progress);
                    const prevPt = this.getPointOnPolyline(pts, Math.max(0, p.progress - 0.05));
                    if (!pt || !prevPt) return;

                    const angle = Math.atan2(pt.y - prevPt.y, pt.x - prevPt.x);

                    ctx.save();
                    const grad = ctx.createLinearGradient(prevPt.x, prevPt.y, pt.x, pt.y);
                    grad.addColorStop(0, 'rgba(245, 158, 11, 0)');
                    grad.addColorStop(0.5, p.color);
                    grad.addColorStop(1, '#fde68a');

                    ctx.beginPath();
                    ctx.moveTo(prevPt.x, prevPt.y);
                    ctx.lineTo(pt.x, pt.y);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = p.size;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                    // Detrito rodante
                    ctx.fillStyle = '#fde68a';
                    ctx.shadowColor = '#d97706';
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, p.size * 0.8, 0, Math.PI * 2);
                    ctx.fill();

                    // Flecha gravitacional descendente
                    ctx.fillStyle = '#b45309';
                    ctx.beginPath();
                    ctx.moveTo(pt.x, pt.y);
                    ctx.lineTo(pt.x - 10 * Math.cos(angle - 0.45), pt.y - 10 * Math.sin(angle - 0.45));
                    ctx.lineTo(pt.x - 6 * Math.cos(angle), pt.y - 6 * Math.sin(angle));
                    ctx.lineTo(pt.x - 10 * Math.cos(angle + 0.45), pt.y - 10 * Math.sin(angle + 0.45));
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                });

                // 5. Barrera Defensiva Activa: Muro Gaviones de Protección Vial Ruta L-110
                this.drawRtsDefenseWall(ctx, [-36.2655, -71.4540], [-36.2715, -71.4540], 'MURO GAVIONES & CONTENCIÓN L-110', '#f59e0b');

                // 6. Abanico de sedimentación en el cono aluvial M-02
                const coneApexCoord = [-36.2665, -71.4485];
                const conePt = this.map.latLngToContainerPoint(coneApexCoord);
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(conePt.x, conePt.y);
                ctx.arc(conePt.x, conePt.y, 45, 0.4, 1.8);
                ctx.closePath();
                ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.restore();

                // 7. Rótulo de alud gravitacional por pendiente
                const labelCoord = [-36.2600, -71.4390];
                const lPt = this.map.latLngToContainerPoint(labelCoord);
                this.drawHighContrastLabel(ctx, '⛰️ ALUD GRAVITACIONAL • PENDIENTE 34° ➔ CONO L-110 (28.5k m³)', lPt.x + 10, lPt.y - 18, '#fef3c7', '#d97706');
            }
        }

        window.setEnergyFlowRegime = function(regime) {
            if (window.energyFlowEngine) {
                window.energyFlowEngine.setRegime(regime);
            }
            ['calm', 'base', 'storm'].forEach(r => {
                const btn = document.getElementById('btnRegime' + r.charAt(0).toUpperCase() + r.slice(1));
                if (btn) {
                    if (r === regime) {
                        btn.className = (r === 'storm') ? 'px-1.5 py-1 rounded bg-amber-500/30 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/50 transition-all cursor-pointer' : 'px-1.5 py-1 rounded bg-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/50 transition-all cursor-pointer';
                    } else {
                        btn.className = 'px-1.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono border border-white/10 transition-all cursor-pointer';
                    }
                }
            });
        };

        // ═══════════════════════════════════════════════════════════════════
        // MOTOR DEL "PANAL APPROACH": TESELADO CATAN CONTINUO & BIO-FLUJOS
        // ═══════════════════════════════════════════════════════════════════
        
        let panalCurrentLevel = 'cuenca'; // 'cuenca' | 'mesa'
        let panalZoomMode = 'detail';     // 'detail' (11 hex) | 'macro' (1 big hex)
        let panalActiveHexId = 'MENIEL_HOGAR';
        let panalActiveFilter = 'all';

        
        const CATAN_TILE_MAP = {
            'MENIEL_HOGAR': 'assets/catan/tile_pasture.jpg',
            'MENIEL_MADERA': 'assets/catan/tile_forest.jpg',
            'MENIEL_AGUA': 'assets/catan/tile_water.jpg',
            'MENIEL_AGRICULTURA': 'assets/catan/tile_wheat.jpg',
            'VECINO_FRAMBUESA_1': 'assets/catan/tile_vineyard.jpg',
            'VECINO_FRAMBUESA_2': 'assets/catan/tile_colliguay.jpg',
            'VECINO_ARANDANO_1': 'assets/catan/tile_colliguay.jpg',
            'VECINO_ARANDANO_2': 'assets/catan/tile_pasture.jpg',
            'VECINO_VIVIENDA_1': 'assets/catan/tile_pines.jpg',
            'VECINO_VIVIENDA_2': 'assets/catan/parchment_board.jpg',
            'CANAL_VECINAL': 'assets/catan/tile_water.jpg',
            'MACRO': 'assets/catan/tile_mountain.jpg'
        };

        const PANAL_DATA = {
            'MENIEL_HOGAR': {
                id: 'MENIEL_HOGAR',
                q: 0, r: 0,
                isMenielCore: true,
                title: 'Hogar & Matriz Energética',
                category: 'Residencial, Energía & Domótica',
                owner: 'Fundo Meniel (Propietario al Centro)',
                icon: '🏡',
                color: '#f59e0b',
                badge: 'NÚCLEO MENIEL • HOGAR',
                metricPrimary: '18 kWp Solar',
                metricSub: '30 kWh LiFePO4',
                stat1: { label: 'Potencia Solar', val: '18.0 kWp' },
                stat2: { label: 'Almacenamiento', val: '30 kWh' },
                stat3: { label: 'Consumo Base', val: '14.2 kWh/d' },
                stat4: { label: 'Excedente Vecinal', val: '4.2 kWh/d' },
                description: 'Centro neurálgico y residencia del Fundo Meniel con el propietario al centro de la red. Concentra el sistema de generación fotovoltaica con 36 paneles solares de 500Wp, inversor híbrido trifásico y banco de acumulación en litio LiFePO4. Alimenta las bombas de impulsión de riego, telecomunicaciones LoRaWAN de las 15 sondas FDR y abastece confort térmico pasivo.',
                specs: [
                    'Generación solar diurna: 78.4 kWh/día promedio estival',
                    'Banco de baterías de ciclo profundo LiFePO4 (90% DoD)',
                    'Estación Gateway LoRaWAN 915 MHz para telemetría territorial',
                    'Monitoreo y balance de cargas domóticas automatizado'
                ],
                inputs: [
                    { from: 'Huertos Frambuesa 1 & 2', item: '🍓 Fruta fresca de temporada & canastas familiares', rate: '2.4 t/año' },
                    { from: 'Vivienda Vecino 1', item: '🤝 Rondas compartidas de vigilancia piro-riesgo', rate: '12 patrullas/mes' }
                ],
                outputs: [
                    { to: 'Vivienda Vecino 2', item: '⚡ Excedente solar fotovoltaico en horas peak (11:00-16:00)', rate: '4.2 kWh/día' },
                    { to: 'Madera & PRV', item: '⚡ Energía para bombeo, cerco eléctrico y electrificación rural', rate: '10.5 kWh/día' }
                ],
                balance: { auto: 65, out: 25, in: 10, text: '+15.0% Exportador Energético Neto' },
                governance: [
                    'Pacto de Micro-red Rural Maule Sur con Familia González',
                    'Acuerdo de enlace LoRaWAN comunitario de emergencia',
                    'Participación en rondas de vigilancia preventiva contra incendios'
                ],
                mathFormula: '$$E_{\\text{net}} = \\int_0^T \\left( P_{\\text{solar}}(t) - C_{\\text{hogar}}(t) - \\eta_{\\text{bat}} \\cdot \\frac{d S_{\\text{bat}}}{dt} \\right) dt$$',
                mathExplain: 'Cálculo de energía neta exportable garantizando reserva mínima de resiliencia del 35% en baterías.'
            },
            'MENIEL_MADERA': {
                id: 'MENIEL_MADERA',
                q: 1, r: -1,
                isMenielCore: true,
                title: 'Madera & Biomasa Sostenible',
                category: 'Silvicultura & Protección Fuego',
                owner: 'Fundo Meniel',
                icon: '🪵',
                color: '#10b981',
                badge: 'NÚCLEO MENIEL • MADERA',
                metricPrimary: '3.4 ha Eucalipto',
                metricSub: '140 m³/ha Stock',
                stat1: { label: 'Superficie Forestal', val: '3.4 ha' },
                stat2: { label: 'Stock Volumétrico', val: '140 m³/ha' },
                stat3: { label: 'Faja Cortafuegos', val: '45m perimetral' },
                stat4: { label: 'Mulch Producido', val: '18 t/año' },
                description: 'Módulo silvícola regenerativo de Eucalipto con manejo de raleo periódico. Genera madera estructural, leña seca certificada de bajas emisiones y material chipeado para acolchado (mulch) de huertos vecinos, reduciendo la carga de combustible fino en la interfaz.',
                specs: [
                    'Especie principal: Eucalyptus globulus bajo rotación corta silvopastoril',
                    'Faja perimetral de amortiguación de fuego de 45m sin sotobosque leñoso',
                    'Chipeadora estacionaria para valorización de restos de poda',
                    'Humedad de leña despachada: <18% garantizado'
                ],
                inputs: [
                    { from: 'Hogar Meniel', item: '⚡ Potencia para chipeadora y aserradero portátil', rate: '3.8 kWh/sesión' },
                    { from: 'Vecino 1 & 2', item: '🤝 Mano de obra comunitaria para faena de raleo y desmalezado', rate: '8 jornales/mes' }
                ],
                outputs: [
                    { to: 'Huertos Frambuesa 1 & 2', item: '🪵 Chips de madera (mulch) para retención hídrica', rate: '18 t/año' },
                    { to: 'Viviendas Vecinales', item: '🔥 Leña certificada de baja emisión para calefacción', rate: '14 m³/año' },
                    { to: 'Deslindes Comunitarios', item: '🛡️ Faja cortafuegos de 45m con carga de combustible <0.3 kg/m²', rate: '1.2 km lineales' }
                ],
                balance: { auto: 45, out: 45, in: 10, text: '+35.0% Exportador de Biomasa & Fajas' },
                governance: [
                    'Pacto Vecinal de Manejo de Faja Cortafuegos (Quórum 90% en Mesa)',
                    'Registro de trazabilidad CONAF Cero Deforestación nativa'
                ],
                mathFormula: '$$I_{\\text{fuego}} = H \\cdot w \\cdot R_{\\text{propagación}} \\quad \\Rightarrow \\quad I_{\\text{faja}} < 350\\text{ kW/m}$$',
                mathExplain: 'Ecuación de Byram: la reducción de combustible fino ($w$) en la faja corta la transición de fuego de superficie a copas.'
            },
            'MENIEL_AGUA': {
                id: 'MENIEL_AGUA',
                q: 0, r: 1,
                isMenielCore: true,
                title: 'Agua & Servicios Ecosistémicos',
                category: 'Hidrología Keyline & Recarga',
                owner: 'Fundo Meniel',
                icon: '💧',
                color: '#0284c7',
                badge: 'NÚCLEO MENIEL • AGUA',
                metricPrimary: '18.500 m³ Tranque',
                metricSub: '8.4 L/s Infiltración',
                stat1: { label: 'Volumen Tranque', val: '18.500 m³' },
                stat2: { label: 'Infiltración Napa', val: '8.4 L/s' },
                stat3: { label: 'Mitigación Crecida', val: 'T=50 años' },
                stat4: { label: 'Recarga APR', val: '42.000 m³/año' },
                description: 'Corazón hidrológico del Fundo Meniel basado en el diseño Keyline. Tranque de tierra compactada con disipador escalonado, biofiltro de macrófitas y canales en línea clave que siembran agua de lluvia en el subsuelo hacia las napas freáticas comunitarias.',
                specs: [
                    'Capacidad útil de almacenamiento: 18.500 m³ con cota de coronamiento de 214 msnm',
                    'Zanja de infiltración Keyline de 850m asociada a curvas de nivel',
                    'Humedal biofiltrante con totora (Typha) y jacinto para remoción de turbidez',
                    'Monitoreo con sensor ultrasónico de nivel de agua y sonda FDR freática'
                ],
                inputs: [
                    { from: 'Canal Matriz Vecinal', item: '🌊 Caudal de turno DGA en temporada de deshielo', rate: '28 L/s por turno' },
                    { from: 'Cuenca Vertiente', item: '🌧️ Escorrentía pluvial captada en laderas Keyline', rate: '32.000 m³/año' }
                ],
                outputs: [
                    { to: 'Viviendas Vecino 1 & 2', item: '💧 Agua potable de emergencia y soporte de norias', rate: '1.8 L/s' },
                    { to: 'Canal Matriz', item: '🛡️ Laminación de crecidas estivales y retención de sedimentos', rate: '18.500 m³ buffer' },
                    { to: 'Potreros PRV & Frutales', item: '💦 Riego presurizado por gravedad (cero costo eléctrico)', rate: '12 L/s' }
                ],
                balance: { auto: 40, out: 50, in: 10, text: '+40.0% Donante Hídrico Ecosistémico' },
                governance: [
                    'Turno oficial de canal matriz según Junta de Vigilancia Río Longaví',
                    'Protocolo de apertura de compuertas ante alerta de crecida SENAPRED',
                    'Convenio de soporte recíproco con APR Las Rosas'
                ],
                mathFormula: '$$Q_{\\text{out}} = Q_{\\text{in}} - A \\cdot ET - \\frac{dV}{dt} + K \\cdot A_{\\text{inf}} \\cdot \\nabla h$$',
                mathExplain: 'Balance hidrológico de conservación de masa combinando evapotranspiración Penman y recarga freática Darcy.'
            },
            'MENIEL_AGRICULTURA': {
                id: 'MENIEL_AGRICULTURA',
                q: 1, r: 0,
                isMenielCore: true,
                title: 'Agricultura & Pastoreo PRV',
                category: 'Producción Agroecológica & Suelo',
                owner: 'Fundo Meniel',
                icon: '🌾',
                color: '#16a34a',
                badge: 'NÚCLEO MENIEL • AGRICULTURA',
                metricPrimary: '5.8 ha Pastoreo',
                metricSub: '8.200 kg MS/ha',
                stat1: { label: 'Área Regenerativa', val: '5.8 ha' },
                stat2: { label: 'Biomasa Forraje', val: '8.200 kg MS/ha' },
                stat3: { label: 'Carga Animal', val: '1.8 UGM/ha' },
                stat4: { label: 'Captura Carbono', val: '2.4 tCO2e/ha/año' },
                description: 'Pastoreo Racional Voisin (PRV) en 8 potreros rotacionales con descanso biológico de 38 días. Regenera la estructura porosa del suelo, fija carbono atmosférico en raíces profundas y produce compost orgánico de alta fertilidad para huertos vecinos.',
                specs: [
                    '8 potreros delimitados con cerco eléctrico solar y bebederos móviles',
                    'Pradera polifítica: Festuca, trébol blanco, ballica perenne y chicoria',
                    'Lombricultura intensiva alimentada con bosta bovina estabulada',
                    'Stock de carbono edáfico verificado: +0.4% materia orgánica en 3 años'
                ],
                inputs: [
                    { from: 'Agua Meniel', item: '💧 Riego por aspersión y abrevadero animal permanente', rate: '4.5 L/s' },
                    { from: 'Hogar Meniel', item: '⚡ Energía para cerco eléctrico solar perimetral', rate: '0.8 kWh/día' }
                ],
                outputs: [
                    { to: 'Huertos Arándanos 1 & 2', item: '🌱 Compost húmico maduro enriquecido con lombrices', rate: '24 t/año' },
                    { to: 'Vecinos Ganaderos', item: '🌾 Fardos de heno de pradera polifítica para invierno', rate: '450 fardos/año' },
                    { to: 'Mercado Local', item: '🥩 Carne regenerativa libre de hormonas con pasaporte MRV', rate: '3.2 t/año' }
                ],
                balance: { auto: 60, out: 30, in: 10, text: '+20.0% Exportador de Forraje & Abono' },
                governance: [
                    'Certificación de Manejo Holístico y Pastoreo Regenerativo',
                    'Alianza de intercambio forraje x jornales con productores locales'
                ],
                mathFormula: '$$C_{\\text{seq}} = \\Delta \\text{SOC} \\cdot \\rho_b \\cdot d \\cdot 3.67 \\quad \\Rightarrow \\quad 2.4\\text{ tCO}_2\\text{e/ha/año}$$',
                mathExplain: 'Modelo IPCC para cálculo de secuestro de carbono orgánico en los primeros 30 cm de suelo agrícola.'
            },
            'VECINO_FRAMBUESA_1': {
                id: 'VECINO_FRAMBUESA_1',
                q: 2, r: -1,
                isMenielCore: false,
                title: 'Huerto Frambuesa Norte',
                category: 'Agrícola Frutal Menor',
                owner: 'Don Manuel / Vecindad Norte',
                icon: '🍓',
                color: '#f43f5e',
                badge: 'PREDIO VECINO • FRAMBUESA 1',
                metricPrimary: '2.1 ha Heritage',
                metricSub: '16 t/año Fruta',
                stat1: { label: 'Variedad Frutal', val: 'Heritage' },
                stat2: { label: 'Superficie', val: '2.1 ha' },
                stat3: { label: 'Riego Tecnificado', val: 'Goteo 1.6 L/h' },
                stat4: { label: 'Producción Neta', val: '16.2 t/año' },
                description: 'Plantación comercial tecnificada de frambuesa variedad Heritage orientada a exportación. Requiere constante retención de humedad en camellones y polinización estival coordinada con Fundo Meniel.',
                specs: [
                    'Marco de plantación: 2.5m x 0.4m en camellones acolchados',
                    'Líneas dobles de goteo autocompensado con fertirriego',
                    'Malla cortaviento perimetral con fajas de álamo',
                    'Certificación GlobalGAP para exportación en fresco'
                ],
                inputs: [
                    { from: 'Madera Meniel', item: '🪵 Acolchado de chips de eucalipto para camellones', rate: '10 t/año' },
                    { from: 'Agua Meniel', item: '💧 Riego complementario en semanas de ola de calor', rate: '3.2 L/s' }
                ],
                outputs: [
                    { to: 'Meniel & Vecindad', item: '🍓 Frambuesa fresca de primera selección y mermeladas', rate: '1.2 t' },
                    { to: 'Mesa Vecinal', item: '🤝 Aporte al fondo comunitario de faja cortafuegos', rate: '100 Créditos DAO' }
                ],
                balance: { auto: 30, out: 50, in: 20, text: 'Equilibrio Agrofrutal Sostenible' },
                governance: [
                    'Pacto de Riego de Emergencia con Fundo Meniel',
                    'Acuerdo de faja libre de combustible en el linde este'
                ],
                mathFormula: '$$ET_c = K_c \\cdot ET_0 \\quad (K_{c,\\text{mid}} = 1.05)$$',
                mathExplain: 'Determinación de la demanda evapotranspirativa de frambuesa en floración según FAO-56.'
            },
            'VECINO_FRAMBUESA_2': {
                id: 'VECINO_FRAMBUESA_2',
                q: 2, r: 0,
                isMenielCore: false,
                title: 'Huerto Frambuesa Sur',
                category: 'Agrícola Frutal Menor',
                owner: 'Familia Morales / Vecinos Sur',
                icon: '🍓',
                color: '#e11d48',
                badge: 'PREDIO VECINO • FRAMBUESA 2',
                metricPrimary: '1.8 ha Regina',
                metricSub: '14 t/año Fruta',
                stat1: { label: 'Variedad Frutal', val: 'Regina' },
                stat2: { label: 'Superficie', val: '1.8 ha' },
                stat3: { label: 'Suelo Aluvial', val: 'Franco-Arenoso' },
                stat4: { label: 'Producción Neta', val: '13.8 t/año' },
                description: 'Cultivo de frambuesa tardía variedad Regina. Aprovecha la pendiente sur protegida y se abastece de mulch y servicios mecánicos en alianza con Meniel.',
                specs: [
                    'Camellones levantados con mulch orgánico para evitar asfixia radicular',
                    'Sistemas de micro-túneles para protección de heladas de primavera tardía',
                    'Cosecha manual escalonada durante 7 semanas'
                ],
                inputs: [
                    { from: 'Madera Meniel', item: '🪵 Chips de eucalipto para control de malezas en hileras', rate: '8 t/año' },
                    { from: 'Agricultura Meniel', item: '🌱 Té de compost aireado para inoculación foliar', rate: '1.200 L/temporada' }
                ],
                outputs: [
                    { to: 'Comunidad Vecinal', item: '🍓 Frambuesa IQF para congelado y jornales de cosecha', rate: '13.8 t/año' }
                ],
                balance: { auto: 25, out: 55, in: 20, text: 'Alta Productividad Frutal' },
                governance: ['Acuerdo de recolección compartida en temporada peak estival'],
                mathFormula: '$$P_{\\text{fruta}} = \\text{Plantas/ha} \\cdot \\text{Brotes} \\cdot \\text{Peso Fruto}$$',
                mathExplain: 'Estimación de rendimiento agronómico por metro lineal de hilera.'
            },
            'VECINO_ARANDANO_1': {
                id: 'VECINO_ARANDANO_1',
                q: 0, r: -1,
                isMenielCore: false,
                title: 'Huerto Arándano Legacy',
                category: 'Frutal Arbustivo Exportación',
                owner: 'Agrícola Santa Lucía / Vecino Este',
                icon: '🫐',
                color: '#8b5cf6',
                badge: 'PREDIO VECINO • ARÁNDANO 1',
                metricPrimary: '3.2 ha Legacy',
                metricSub: '32 t/año Export',
                stat1: { label: 'Variedad Arándano', val: 'Legacy' },
                stat2: { label: 'Superficie', val: '3.2 ha' },
                stat3: { label: 'Malla Monofilamento', val: '30% Sombra' },
                stat4: { label: 'Consumo Hídrico', val: '4.200 m³/ha' },
                description: 'Huerto intensivo de arándanos variedad Legacy de alto calibre. Emplea malla sombreadora y requiere enmienda orgánica y polinización apícola permanente provista por Meniel.',
                specs: [
                    'Suelo con pH corregido a 5.2 mediante turba y azufre elemental',
                    'Densidad: 3.333 plantas/ha con acolchado de corteza de pino',
                    'Monitoreo con sondas FDR de humedad y conductividad eléctrica'
                ],
                inputs: [
                    { from: 'Agricultura Meniel', item: '🌱 Enmienda húmica de lombricompost deshidratado', rate: '14 t/año' },
                    { from: 'Meniel Núcleo', item: '🐝 Servicios de polinización con apiario comunitario', rate: '8 colmenas fijas' }
                ],
                outputs: [
                    { to: 'Packing Regional', item: '🫐 Arándano fresco de exportación a mercados asiáticos', rate: '32 t/año' },
                    { to: 'Mesa Vecinos', item: '🚜 Acceso a tractor viñatero para labores comunitarias', rate: '40 horas/año' }
                ],
                balance: { auto: 20, out: 60, in: 20, text: 'Pilar Agroexportador Vecinal' },
                governance: ['Convenio de Apicultura y Polinización Cruzada con Meniel'],
                mathFormula: '$$\\text{EC}_{\\text{suelo}} = \\frac{\\sigma_{\\text{poro}} \\cdot \\theta}{\\varepsilon} \\quad (\\text{Óptimo: } 1.2\\text{ dS/m})$$',
                mathExplain: 'Control estricto de salinidad en zona radicular de ericáceas mediante lecturas FDR.'
            },
            'VECINO_ARANDANO_2': {
                id: 'VECINO_ARANDANO_2',
                q: -1, r: 0,
                isMenielCore: false,
                title: 'Huerto Arándano Duke',
                category: 'Frutal Arbustivo Exportación',
                owner: 'Don Patricio / Vecino Ladera',
                icon: '🫐',
                color: '#7c3aed',
                badge: 'PREDIO VECINO • ARÁNDANO 2',
                metricPrimary: '2.5 ha Duke',
                metricSub: '24 t/año Export',
                stat1: { label: 'Variedad Arándano', val: 'Duke Temprano' },
                stat2: { label: 'Superficie', val: '2.5 ha' },
                stat3: { label: 'Cosecha Peak', val: 'Noviembre' },
                stat4: { label: 'Producción Neta', val: '24.5 t/año' },
                description: 'Huerto temprano de arándano Duke en ladera suave. Su cosecha temprana alivia el estrés hídrico de pleno verano y colabora estrechamente en el mantenimiento de fajas cortafuegos.',
                specs: [
                    'Variedad de bajo requerimiento de horas de frío invernal',
                    'Riego automatizado por pulsos con fertirrigación proporcional',
                    'Faja cortafuegos perimetral limpia en interfaz con plantación forestal'
                ],
                inputs: [
                    { from: 'Agricultura Meniel', item: '🌱 Compost orgánico para recuperación de suelos degradados', rate: '10 t/año' },
                    { from: 'Agua Meniel', item: '💧 Respaldo hídrico para lavado de salinidad invernal', rate: '2.5 L/s' }
                ],
                outputs: [
                    { to: 'Mercado Mayorista', item: '🫐 Primicias de arándano en ventana temprana', rate: '24.5 t/año' }
                ],
                balance: { auto: 25, out: 55, in: 20, text: 'Ventana Comercial Temprana' },
                governance: ['Acuerdo de faja retardante de fuego en ladera oeste'],
                mathFormula: '$$\\Delta H_{\\text{frío}} = \\sum_{t} \\max(0, 7.2 - T(t))$$',
                mathExplain: 'Cálculo de acumulación de horas frío para quiebre de dormancia invernal.'
            },
            'VECINO_VIVIENDA_1': {
                id: 'VECINO_VIVIENDA_1',
                q: -1, r: 1,
                isMenielCore: false,
                title: 'Vivienda Familiar Don Manuel',
                category: 'Habitación & Comunidad',
                owner: 'Familia Don Manuel (Vecino Histórico)',
                icon: '🏠',
                color: '#f97316',
                badge: 'PREDIO VECINO • VIVIENDA 1',
                metricPrimary: 'Residencia Familiar',
                metricSub: 'Servidumbre Paso',
                stat1: { label: 'Habitantes', val: '4 personas' },
                stat2: { label: 'Acceso APR', val: 'Conexión Red' },
                stat3: { label: 'Servidumbre', val: 'Paso & Canal' },
                stat4: { label: 'Rol Catastral', val: 'Rol 218-42' },
                description: 'Vivienda rural colindante con el camino vecinal principal. Familia histórica con servidumbre recíproca de paso con Fundo Meniel y participación activa en el comité del APR.',
                specs: [
                    'Residencia de albañilería reforzada y madera nativa',
                    'Huerto hortícola de autoconsumo familiar (tomates, ajíes, porotos)',
                    'Punto de encuentro y control de portón perimetral'
                ],
                inputs: [
                    { from: 'Agua Meniel', item: '💧 Conexión de seguridad hídrica a estanque de 5.000 L', rate: '1.2 L/s' },
                    { from: 'Madera Meniel', item: '🔥 Leña seca para calefacción estufa de doble cámara', rate: '8 m³/año' }
                ],
                outputs: [
                    { to: 'Meniel & Vecindad', item: '🤝 Servidumbre de paso vehicular y apertura de compuertas', rate: '365 días/año' },
                    { to: 'Mesa Vecinal', item: '📢 Mediación de conflictos de aguas y actas de asamblea', rate: '100% Asistencia' }
                ],
                balance: { auto: 70, out: 15, in: 15, text: 'Núcleo Social Comunitario' },
                governance: [
                    'Escritura pública de servidumbre de acueducto y tránsito inscrita en CBR',
                    'Vocal titular de la Junta de Vecinos Las Camelias'
                ],
                mathFormula: '$$V_{\\text{voto}} = \\sqrt{\\text{Créditos}} \\quad (\\text{Votación Cuadrática DAO})$$',
                mathExplain: 'Poder de decisión en mociones vecinales sin concentración asimétrica.'
            },
            'VECINO_VIVIENDA_2': {
                id: 'VECINO_VIVIENDA_2',
                q: -1, r: 2,
                isMenielCore: false,
                title: 'Vivienda Familiar Familia González',
                category: 'Habitación & Micro-Red',
                owner: 'Familia González (Parcela Los Aromos)',
                icon: '🏠',
                color: '#ea580c',
                badge: 'PREDIO VECINO • VIVIENDA 2',
                metricPrimary: 'Residencia Familiar',
                metricSub: 'Micro-Red Solar',
                stat1: { label: 'Habitantes', val: '5 personas' },
                stat2: { label: 'Alimentación Solar', val: 'Micro-Red Meniel' },
                stat3: { label: 'Refrigeración', val: 'Comunal' },
                stat4: { label: 'Rol Catastral', val: 'Rol 218-88' },
                description: 'Vivienda rural beneficiaria de la micro-red solar de baja tensión de Meniel. Aporta al banco comunitario de maquinaria agrícola y mano de obra para mantención de canales.',
                specs: [
                    'Empalme bidireccional de baja tensión con medidor inteligente IoT',
                    'Refrigerador inverter de alta eficiencia para conservación de alimentos',
                    'Almacén y taller de mantención de herramientas agrícolas'
                ],
                inputs: [
                    { from: 'Hogar Meniel', item: '⚡ Excedente solar fotovoltaico diurno en horas de alta radiación', rate: '4.2 kWh/día' },
                    { from: 'Agua Meniel', item: '💧 Riego por goteo para huerto doméstico de frutillas', rate: '0.6 L/s' }
                ],
                outputs: [
                    { to: 'Meniel & Vecindad', item: '🚜 Tractor mediano y coloso para traslado de forraje', rate: '60 horas/año' },
                    { to: 'Mesa Vecinos', item: '🛠️ Reparación y soldadura de marcos partidores de canal', rate: 'Voluntariado' }
                ],
                balance: { auto: 65, out: 20, in: 15, text: 'Socio de Micro-Red & Taller' },
                governance: [
                    'Pacto de intercambio de energía fotovoltaica por horas-maquinaria',
                    'Protocolo de uso equitativo del banco comunal de herramientas'
                ],
                mathFormula: '$$P_{\\text{loss}} = I^2 \\cdot R_{\\text{cable}} \\quad \\Rightarrow \\quad \\text{Eficiencia } \\eta > 94\\%$$',
                mathExplain: 'Monitoreo de disipación térmica en la línea de 220V inter-predial.'
            },
            'VECINO_AGUA_CANAL': {
                id: 'VECINO_AGUA_CANAL',
                q: 1, r: 1,
                isMenielCore: false,
                title: 'Canal Matriz & Vertiente Compartida',
                category: 'Infraestructura Hídrica Matriz',
                owner: 'Comunidad de Aguas Canal El Carmen',
                icon: '🌊',
                color: '#06b6d4',
                badge: 'PREDIO VECINO • CANAL MATRIZ',
                metricPrimary: '42 L/s Asignados',
                metricSub: 'Junta de Vigilancia',
                stat1: { label: 'Caudal Concesionado', val: '42.0 L/s' },
                stat2: { label: 'Comuneros', val: '14 usuarios' },
                stat3: { label: 'Matriz Matriz', val: 'Tierra & Gaviones' },
                stat4: { label: 'Vertiente Sur', val: 'Aporte 6.5 L/s' },
                description: 'Arteria de distribución hídrica comunal derivada del Río Longaví. Alimenta los cuarteles de riego de los 10 predios y recibe la laminación de crecidas del tranque Keyline de Meniel para evitar socavaciones.',
                specs: [
                    'Canal matriz de 4.8 km con pendiente media de 0.08%',
                    'Marco partidor de hormigón con regla graduada y aforador Parshall',
                    'Compuertas de guillotina metálicas con candado de turno comunal',
                    'Sensor ultrasónico de nivel telemétrico conectado a la red LoRaWAN'
                ],
                inputs: [
                    { from: 'Agua Meniel', item: '🛡️ Amortiguación de crecidas pluviales y retención de sólidos', rate: '18.500 m³ buffer' },
                    { from: 'Todos los Predios', item: '🧹 Jornadas de limpia de canal ("La Malla") anuales', rate: '140 jornales' }
                ],
                outputs: [
                    { to: 'Fundo Meniel', item: '💧 Caudal asignado de turno para llenado de tranque', rate: '28 L/s por turno' },
                    { to: 'Huertos & Chacras', item: '💦 Riego superficial para 84 ha de cultivos agrícolas', rate: '42 L/s continuo' }
                ],
                balance: { auto: 10, out: 80, in: 10, text: 'Distribuidor Hídrico Esencial' },
                governance: [
                    'Cuadro oficial de turnos de la Junta de Vigilancia del Río Longaví',
                    'Estatutos de la Asociación de Canalistas inscritos en DGA',
                    'Protocolo de desvío de emergencia en caudales extremos T=50'
                ],
                mathFormula: '$$Q = \\frac{1}{n} \\cdot A \\cdot R_h^{2/3} \\cdot S^{1/2} \\quad (\\text{Manning: } n = 0.025)$$',
                mathExplain: 'Ecuación de Manning para flujo uniforme en canal abierto de tierra y piedras.'
            }
        };

        
        // Auto-asignar textura Catán a cada nodo del Panal
        Object.keys(PANAL_DATA).forEach(k => {
            PANAL_DATA[k].catanTile = CATAN_TILE_MAP[k] || 'assets/catan/tile_pasture.jpg';
        });

        const PANAL_FLUXES = [
            {
                id: 'flux_water_meniel_houses',
                category: 'water',
                from: 'MENIEL_AGUA',
                to: 'VECINO_VIVIENDA_1',
                label: 'Agua Somera (1.8 L/s)',
                color: '#06b6d4',
                marker: 'arrowWater',
                strokeWidth: 3,
                description: 'Suministro de agua filtrada y recarga de norias familiares.'
            },
            {
                id: 'flux_water_meniel_canal',
                category: 'water',
                from: 'MENIEL_AGUA',
                to: 'VECINO_AGUA_CANAL',
                label: 'Laminación Crecidas (18.5k m³)',
                color: '#06b6d4',
                marker: 'arrowWater',
                strokeWidth: 3.5,
                description: 'Amortiguación de crecidas y captación de turnos DGA.'
            },
            {
                id: 'flux_energy_meniel_vivienda2',
                category: 'energy',
                from: 'MENIEL_HOGAR',
                to: 'VECINO_VIVIENDA_2',
                label: 'Micro-Red Solar (4.2 kWh/d)',
                color: '#f59e0b',
                marker: 'arrowEnergy',
                strokeWidth: 3,
                description: 'Excedente fotovoltaico diurno transferido para refrigeración.'
            },
            {
                id: 'flux_biomass_meniel_frambuesas',
                category: 'biomass',
                from: 'MENIEL_MADERA',
                to: 'VECINO_FRAMBUESA_1',
                label: 'Mulch Retenedor (18 t/año)',
                color: '#10b981',
                marker: 'arrowBiomass',
                strokeWidth: 3,
                description: 'Chips de eucalipto para cobertura de camellones.'
            },
            {
                id: 'flux_firebreak_meniel_lindes',
                category: 'biomass',
                from: 'MENIEL_MADERA',
                to: 'VECINO_ARANDANO_1',
                label: 'Faja Cortafuego 45m',
                color: '#10b981',
                marker: 'arrowBiomass',
                strokeWidth: 3,
                description: 'Desmalezado y reducción de combustible fino en linderos.'
            },
            {
                id: 'flux_compost_meniel_arandanos',
                category: 'agriculture',
                from: 'MENIEL_AGRICULTURA',
                to: 'VECINO_ARANDANO_2',
                label: 'Compost PRV (24 t/año)',
                color: '#f43f5e',
                marker: 'arrowAgri',
                strokeWidth: 3,
                description: 'Abono orgánico maduro con lombricultura para frutales.'
            },
            {
                id: 'flux_fruits_vecinos_meniel',
                category: 'agriculture',
                from: 'VECINO_FRAMBUESA_2',
                to: 'MENIEL_HOGAR',
                label: 'Fruta & Polinización (2.4 t)',
                color: '#f43f5e',
                marker: 'arrowAgri',
                strokeWidth: 2.5,
                description: 'Intercambio directo de fruta de exportación y mano de obra.'
            }
        ];

        const PANAL_MACRO_DATA = {
            title: 'Macro-Cuenca Maule Sur',
            category: 'Hidrología Mayor Regional',
            owner: 'DGA / Junta de Vigilancia Río Longaví',
            icon: '🏔️',
            color: '#38bdf8',
            badge: 'MACRO-CUENCA • 122.070 HA',
            metricPrimary: '124.5 m³/s Longaví',
            metricSub: 'Embalse 78.5%',
            stat1: { label: 'Caudal Río Longaví', val: '124.5 m³/s' },
            stat2: { label: 'Embalse Bullileo', val: '47.1M m³ (78.5%)' },
            stat3: { label: 'Infiltración Cuenca', val: '14.2 m³/s' },
            stat4: { label: 'Piro-Riesgo FWI', val: 'FWI 24 (Moderado)' },
            description: 'Visión agregada macro-hidrológica de la cuenca del Río Longaví. En este nivel de zoom out, todo el mosaico territorial se consolida en un único Macro-Hexágono que representa la masa de agua, balance de sedimentos y balance hídrico regional. Al hacer zoom in, se desempaqueta el panal de 11 hexágonos que detalla cómo el Fundo Meniel y sus vecinos gestionan los flujos capilares.',
            specs: [
                'Superficie total de cuenca tributaria: 122.070 ha',
                'Precipitación media acumulada anual: 840 mm/año',
                'Red hidrográfica principal: Río Longaví, Estero Colliguay, Canal El Carmen',
                'Capacidad de laminación distribuida en tranques prediales: 142.000 m³'
            ],
            inputs: [
                { from: 'Cordillera de los Andes', item: '❄️ Fusión nival y deshielos de primavera', rate: '85.0 m³/s peak' },
                { from: 'Red de Predios Regenerativos', item: '🛡️ Agua infiltrada y retenida en curvas Keyline', rate: '14.2 m³/s neta' }
            ],
            outputs: [
                { to: 'Riego del Valle Central', item: '🌾 Caudal regulado para 28.000 ha de cultivo', rate: '92.0 m³/s' },
                { to: 'Río Maule / Océano Pacífico', item: '🌊 Caudal ecológico de salida de cuenca', rate: '32.5 m³/s' }
            ],
            balance: { auto: 20, out: 70, in: 10, text: 'Cuenca Proveedora de Seguridad Hídrica' },
            governance: [
                'Decreto DGA de Escasez Hídrica / Alerta de Crecidas',
                'Plan Estratégico de Recursos Hídricos en Cuenca (PERH) Maule Sur',
                'Mesa Tripartita: Regantes, APRs y Productores Silvoagropecuarios'
            ],
            mathFormula: '$$Q_{\\text{cuenca}} = \\sum_{i=1}^{N} P_i \\cdot A_i - \\sum_{i=1}^{N} ET_i \\cdot A_i - \\frac{d S_{\\text{nieve+suelo}}}{dt}$$',
            mathExplain: 'Ecuación maestra de balance hidrológico en cuenca de montaña y secano interior.'
        };

        // --- FUNCIONES DE NAVEGACIÓN Y APERTURA RÁPIDA ---
        function openPanalFromCuenca() {
            // El Panal pertenece a la escala comunitaria de Vecinos
            openPanalFromMesa();
        }

        function openPanalFromMesa() {
            switchMasterView('panal', 'mesa');
            setPanalLevel('mesa');
        }

        function setPanalLevel(level) {
            panalCurrentLevel = level;
            
            // Actualizar botones de subdeck
            const btnC = document.getElementById('panalLevelBtn-cuenca');
            const btnM = document.getElementById('panalLevelBtn-mesa');
            if (btnC && btnM) {
                if (level === 'cuenca') {
                    btnC.className = 'panal-lvl-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active bg-sky-700 text-white shadow-sm cursor-pointer';
                    btnM.className = 'panal-lvl-btn px-3 py-1.5 rounded-lg text-xs font-bold text-stone-700 hover:text-stone-950 transition-all flex items-center gap-1.5 cursor-pointer';
                } else {
                    btnM.className = 'panal-lvl-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active bg-emerald-700 text-white shadow-sm cursor-pointer';
                    btnC.className = 'panal-lvl-btn px-3 py-1.5 rounded-lg text-xs font-bold text-stone-700 hover:text-stone-950 transition-all flex items-center gap-1.5 cursor-pointer';
                }
            }

            // Actualizar banner contextual y modo de visualización directa
            const ctxText = document.getElementById('panalContextText');
            const scaleInd = document.getElementById('panalScaleIndicator');

            if (level === 'cuenca') {
                if (ctxText) ctxText.innerHTML = '<b>Nivel Cuenca:</b> Macro-balance hidrológico del Río Longaví (122.070 ha), laminación de crecidas en tranques y recarga de napas.';
                if (scaleInd) { scaleInd.innerText = '122.070 ha • Macro Cuenca'; scaleInd.className = 'text-[10px] px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-bold'; }
                panalZoomMode = 'macro';
            } else {
                if (ctxText) ctxText.innerHTML = '<b>Nivel Vecinal:</b> Acuerdos de servidumbre, turnos de riego en canal matriz, fajas cortafuegos y micro-red solar de 11 hexágonos.';
                if (scaleInd) { scaleInd.innerText = '508 ha • Nivel Vecinal'; scaleInd.className = 'text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'; }
                panalZoomMode = 'detail';
            }

            renderPanalSvg();
        }

        function setPanalZoom(zoomMode) {
            panalZoomMode = zoomMode;
            const btnMacro = document.getElementById('panalZoomBtn-macro');
            const btnDetail = document.getElementById('panalZoomBtn-detail');

            if (btnMacro && btnDetail) {
                if (zoomMode === 'macro') {
                    btnMacro.className = 'panal-zoom-btn active px-2 py-1 rounded-lg text-[10px] font-bold bg-sky-500/25 text-sky-300 border border-sky-500/40 transition-all flex items-center gap-1 cursor-pointer';
                    btnDetail.className = 'panal-zoom-btn px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer';
                } else {
                    btnDetail.className = 'panal-zoom-btn active px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-all flex items-center gap-1 cursor-pointer';
                    btnMacro.className = 'panal-zoom-btn px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-sky-300 transition-all flex items-center gap-1 cursor-pointer';
                }
            }

            renderPanalSvg();
        }

        function togglePanalZoom() {
            setPanalZoom(panalZoomMode === 'macro' ? 'detail' : 'macro');
        }

        function filterPanalFluxes(category) {
            panalActiveFilter = category;
            document.querySelectorAll('.flux-filter-pill').forEach(btn => {
                btn.classList.remove('active', 'bg-white/20', 'text-white', 'border-white/30');
                btn.classList.add('text-slate-400');
            });
            const activeBtn = document.getElementById('fluxFilter-' + category);
            if (activeBtn) {
                activeBtn.classList.add('active', 'bg-white/20', 'text-white', 'border-white/30');
                activeBtn.classList.remove('text-slate-400');
            }
            renderPanalSvg();
        }

        function switchPanalDetailTab(tabId) {
            ['bio', 'flux', 'gov', 'math'].forEach(t => {
                const btn = document.getElementById('pnlTabBtn-' + t);
                const content = document.getElementById('pnlTabContent-' + t);
                if (btn && content) {
                    if (t === tabId) {
                        btn.className = 'pnl-tab-btn active px-2.5 py-1 rounded-lg bg-white/15 text-white font-bold transition-all cursor-pointer';
                        content.style.display = 'block';
                    } else {
                        btn.className = 'pnl-tab-btn px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer';
                        content.style.display = 'none';
                    }
                }
            });
        }

        // --- CÁLCULO DE COORDENADAS HEXAGONALES (AXIAL TO CARTESIAN) ---
        function getHexCartesian(q, r, R, originX, originY) {
            const stepX = R * Math.sqrt(3);
            const stepY = 1.5 * R;
            const cx = originX + stepX * (q + r / 2.0);
            const cy = originY + stepY * r;
            return { cx, cy };
        }

        function buildHexPointsStr(cx, cy, R) {
            const pts = [];
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 180) * (30 + i * 60);
                const x = cx + R * Math.cos(angle);
                const y = cy + R * Math.sin(angle);
                pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
            }
            return pts.join(' ');
        }

        // --- RENDERIZADOR PRINCIPAL DEL SVG ---
        function renderPanalSvg() {
            const svg = document.getElementById('panalSvg');
            if (!svg) return;

            const bgGridGroup = document.getElementById('panalBgGrid');
            const macroGroup = document.getElementById('panalMacroGroup');
            const fluxesGroup = document.getElementById('panalFluxesGroup');
            const haloGroup = document.getElementById('panalMenielHaloGroup');
            const hexesGroup = document.getElementById('panalHexesGroup');
            const labelsGroup = document.getElementById('panalLabelsGroup');

            if (!bgGridGroup || !macroGroup || !fluxesGroup || !haloGroup || !hexesGroup || !labelsGroup) return;

            // Limpiar grupos
            bgGridGroup.innerHTML = '';
            macroGroup.innerHTML = '';
            fluxesGroup.innerHTML = '';
            haloGroup.innerHTML = '';
            hexesGroup.innerHTML = '';
            labelsGroup.innerHTML = '';

            const originX = 380;
            const originY = 270;
            const R = 54;

            // CASO A: MODO MACRO-HEXÁGONO (ZOOM OUT EN CUENCA)
            if (panalCurrentLevel === 'cuenca' && panalZoomMode === 'macro') {
                macroGroup.style.display = 'block';
                fluxesGroup.style.display = 'none';
                haloGroup.style.display = 'none';
                hexesGroup.style.display = 'none';
                labelsGroup.style.display = 'none';

                const macroR = 175;
                const pts = buildHexPointsStr(originX, originY, macroR);

                macroGroup.innerHTML = `
                    <defs>
                        <clipPath id="clip_macro_cuenca">
                            <polygon points="${pts}" />
                        </clipPath>
                    </defs>
                    <!-- Catán Mountain Tile Texture -->
                    <image href="assets/catan/tile_mountain.jpg" x="${originX - macroR}" y="${originY - macroR}" width="${macroR * 2}" height="${macroR * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip_macro_cuenca)"/>
                    <polygon points="${pts}" fill="none" stroke="#f59e0b" stroke-width="4.5" filter="url(#goldSelectGlow)"/>

                    <!-- Icono Central de Montaña & Río -->
                    <text x="${originX}" y="${originY - 80}" text-anchor="middle" font-size="44" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.8))">🏔️</text>
                    
                    <!-- Banner de Título Macro en Pergamino / Madera Clara -->
                    <g transform="translate(${originX - 140}, ${originY - 60})">
                        <rect width="280" height="48" rx="24" fill="rgba(255, 253, 245, 0.96)" stroke="#b45309" stroke-width="2" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.35))"/>
                        <text x="140" y="21" text-anchor="middle" fill="#78350f" font-size="14" font-family="'Cinzel', serif" font-weight="900" letter-spacing="1">🏔️ MACRO-CUENCA MAULE SUR</text>
                        <text x="140" y="37" text-anchor="middle" fill="#0369a1" font-size="9.5" font-family="monospace" font-weight="bold">122.070 HECTÁREAS • HIDROLOGÍA MAYOR</text>
                    </g>
                    
                    <!-- Tarjetas de Telemetría Consolidada Dentro del Macro-Hexágono -->
                    <g transform="translate(${originX - 120}, ${originY + 10})">
                        <rect width="115" height="42" rx="8" fill="#04121d" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1"/>
                        <text x="57" y="16" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="monospace">Río Longaví</text>
                        <text x="57" y="32" text-anchor="middle" fill="#38bdf8" font-size="12" font-family="monospace" font-weight="bold">124.5 m³/s</text>
                    </g>
                    <g transform="translate(${originX + 5}, ${originY + 10})">
                        <rect width="115" height="42" rx="8" fill="#04121d" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1"/>
                        <text x="57" y="16" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="monospace">Embalse Bullileo</text>
                        <text x="57" y="32" text-anchor="middle" fill="#34d399" font-size="12" font-family="monospace" font-weight="bold">78.5% (47M m³)</text>
                    </g>

                    <!-- Botón Interactivo Central para Zoom In -->
                    <g transform="translate(${originX - 110}, ${originY + 70})" onclick="setPanalZoom('detail')" class="cursor-pointer group" style="cursor: pointer;">
                        <rect width="220" height="38" rx="12" fill="url(#btnGradZoom)" stroke="#f59e0b" stroke-width="1.5" filter="drop-shadow(0 0 12px rgba(245,158,11,0.5))"/>
                        <text x="110" y="24" text-anchor="middle" fill="#0f172a" font-size="11" font-family="monospace" font-weight="900" letter-spacing="0.5">
                            🔬 ZOOM IN: DESPLEGAR PANAL (11 HEX)
                        </text>
                    </g>

                    <defs>
                        <linearGradient id="btnGradZoom" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#fcd34d"/>
                            <stop offset="50%" stop-color="#f59e0b"/>
                            <stop offset="100%" stop-color="#d97706"/>
                        </linearGradient>
                    </defs>
                `;

                // Actualizar panel lateral con data macro
                updatePanalDetailPanel('MACRO');
                return;
            }

            // CASO B: MODO DETALLADO (11 HEXÁGONOS CONTINUOS Y LÍNEAS DE FLUJO)
            macroGroup.style.display = 'none';
            fluxesGroup.style.display = 'block';
            haloGroup.style.display = 'block';
            hexesGroup.style.display = 'block';
            labelsGroup.style.display = 'block';

            // Coordenadas calculadas de los nodos
            const nodeCoords = {};
            Object.values(PANAL_DATA).forEach(node => {
                nodeCoords[node.id] = getHexCartesian(node.q, node.r, R, originX, originY);
            });

            // 1. DIBUJAR LÍNEAS DE FLUJO VECTORIALES ANIMADAS
            PANAL_FLUXES.forEach(flux => {
                if (panalActiveFilter !== 'all' && flux.category !== panalActiveFilter) return;

                const c1 = nodeCoords[flux.from];
                const c2 = nodeCoords[flux.to];
                if (!c1 || !c2) return;

                // Curvatura bezier sutil
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
                pathEl.setAttribute('stroke-width', flux.strokeWidth);
                pathEl.setAttribute('fill', 'none');
                pathEl.setAttribute('stroke-linecap', 'round');
                pathEl.setAttribute('stroke-dasharray', '8, 6');
                pathEl.setAttribute('class', 'panal-flux-line cursor-pointer');
                pathEl.setAttribute('marker-end', `url(#${flux.marker})`);
                pathEl.style.animation = 'panalFluxPulse 1.4s linear infinite';
                
                pathEl.addEventListener('click', () => {
                    selectPanalFlux(flux.id);
                });

                fluxesGroup.appendChild(pathEl);
            });

            // 2. DIBUJAR HALO ROJO UNIFICADOR ALREDEDOR DEL NÚCLEO MENIEL (4 HEXÁGONOS)
            // Meniel Hogar (0,0), Madera (1,-1), Agua (0,1), Agricultura (1,0)
            const menielCenters = [
                nodeCoords['MENIEL_HOGAR'],
                nodeCoords['MENIEL_MADERA'],
                nodeCoords['MENIEL_AGRICULTURA'],
                nodeCoords['MENIEL_AGUA']
            ];

            // Halo perimetral envolvente rojo luminiscente
            const haloBorder = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const menielMidX = (nodeCoords['MENIEL_HOGAR'].cx + nodeCoords['MENIEL_AGRICULTURA'].cx) / 2;
            const menielMidY = (nodeCoords['MENIEL_MADERA'].cy + nodeCoords['MENIEL_AGUA'].cy) / 2;
            
            haloBorder.setAttribute('cx', menielMidX);
            haloBorder.setAttribute('cy', menielMidY);
            haloBorder.setAttribute('r', R * 2.3);
            haloBorder.setAttribute('fill', 'none');
            haloBorder.setAttribute('stroke', '#ef4444');
            haloBorder.setAttribute('stroke-width', '3');
            haloBorder.setAttribute('stroke-dasharray', '12, 6');
            haloBorder.setAttribute('filter', 'url(#redHaloGlow)');
            haloBorder.setAttribute('opacity', '0.85');
            haloGroup.appendChild(haloBorder);

            // Badge Superior del Núcleo Meniel
            const badgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            badgeGroup.setAttribute('transform', `translate(${menielMidX}, ${nodeCoords['MENIEL_MADERA'].cy - 68})`);
            badgeGroup.innerHTML = `
                <rect x="-140" y="-12" width="280" height="24" rx="12" fill="#450a0a" stroke="#ef4444" stroke-width="1.5" filter="url(#redHaloGlow)"/>
                <text x="0" y="4" text-anchor="middle" fill="#fecaca" font-size="10" font-family="monospace" font-weight="900" letter-spacing="1">
                    🛡️ NÚCLEO MENIEL (PROPIETARIO AL CENTRO)
                </text>
            `;
            haloGroup.appendChild(badgeGroup);

            // 3. DIBUJAR LOS 11 HEXÁGONOS CONTIGUOS
            Object.values(PANAL_DATA).forEach(node => {
                const c = nodeCoords[node.id];
                if (!c) return;

                const pts = buildHexPointsStr(c.cx, c.cy, R);
                const isSelected = (node.id === panalActiveHexId);

                const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                g.setAttribute('class', `panal-hex-cell ${node.isMenielCore ? 'panal-hex-meniel' : ''} ${isSelected ? 'active-node' : ''}`);
                g.setAttribute('data-id', node.id);
                g.style.cursor = 'pointer';

                // 1. ClipPath para la loseta Catán
                const clipId = `clip_hex_${node.id}`;
                const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
                clip.setAttribute('id', clipId);
                const clipPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                clipPoly.setAttribute('points', pts);
                clip.appendChild(clipPoly);
                g.appendChild(clip);

                // 2. Imagen Catán recortada en el hexágono
                const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                img.setAttribute('href', node.catanTile || 'assets/catan/tile_pasture.jpg');
                img.setAttribute('x', c.cx - R);
                img.setAttribute('y', c.cy - R);
                img.setAttribute('width', R * 2);
                img.setAttribute('height', R * 2);
                img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
                img.setAttribute('clip-path', `url(#${clipId})`);
                g.appendChild(img);

                // 3. Bisel de Madera / Marco Hexagonal Catán
                const borderPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                borderPoly.setAttribute('points', pts);
                borderPoly.setAttribute('fill', 'none');
                let strokeColor = isSelected ? '#d97706' : (node.isMenielCore ? '#dc2626' : '#b49f82');
                let strokeW = isSelected ? '4' : (node.isMenielCore ? '3.5' : '2.2');
                let filterAttr = isSelected ? 'url(#goldSelectGlow)' : (node.isMenielCore ? 'url(#redHaloGlow)' : '');
                borderPoly.setAttribute('stroke', strokeColor);
                borderPoly.setAttribute('stroke-width', strokeW);
                if (filterAttr) borderPoly.setAttribute('filter', filterAttr);
                g.appendChild(borderPoly);

                // 4. Ficha Circular Estilo Token Catán de Madera & Marfil (Chit)
                const chitCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                chitCircle.setAttribute('cx', c.cx);
                chitCircle.setAttribute('cy', c.cy - 12);
                chitCircle.setAttribute('r', '15');
                chitCircle.setAttribute('fill', '#FFFDF5');
                chitCircle.setAttribute('stroke', node.isMenielCore ? '#dc2626' : '#8B5A2B');
                chitCircle.setAttribute('stroke-width', node.isMenielCore ? '2.5' : '1.8');
                chitCircle.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))');
                g.appendChild(chitCircle);

                // Ícono del Chit
                const iconText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                iconText.setAttribute('x', c.cx);
                iconText.setAttribute('y', c.cy - 7);
                iconText.setAttribute('text-anchor', 'middle');
                iconText.setAttribute('font-size', '13');
                iconText.textContent = node.icon;
                g.appendChild(iconText);

                // 5. Pergamino / Placa de Título de Madera Clara
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

                // Texto del Título
                const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                titleText.setAttribute('x', c.cx);
                titleText.setAttribute('y', c.cy + 22);
                titleText.setAttribute('text-anchor', 'middle');
                titleText.setAttribute('fill', '#1C1917');
                titleText.setAttribute('font-size', '8.5');
                titleText.setAttribute('font-family', "'Plus Jakarta Sans', sans-serif");
                titleText.setAttribute('font-weight', '800');
                const shortTitle = node.title.split(' ')[0] + (node.title.split(' ')[1] ? ' ' + node.title.split(' ')[1] : '');
                titleText.textContent = shortTitle;
                g.appendChild(titleText);

                // Métrica Primaria en Mini-Pill
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
                metricText.textContent = node.metricPrimary;
                g.appendChild(metricText);

                // Interacción de clic
                g.addEventListener('click', () => {
                    selectPanalHex(node.id);
                });

                hexesGroup.appendChild(g);
            });

            // Actualizar panel lateral con el nodo activo
            updatePanalDetailPanel(panalActiveHexId);
        }

        // --- SELECCIÓN Y ACTUALIZACIÓN DEL PANEL DE DETALLE ---
        function selectPanalHex(hexId) {
            panalActiveHexId = hexId;
            renderPanalSvg();
        }

        function selectPanalFlux(fluxId) {
            const flux = PANAL_FLUXES.find(f => f.id === fluxId);
            if (!flux) return;

            // Seleccionar el nodo emisor y abrir pestaña de flujos
            panalActiveHexId = flux.from;
            renderPanalSvg();
            switchPanalDetailTab('flux');
        }

        function updatePanalDetailPanel(nodeId) {
            let data;
            if (nodeId === 'MACRO') {
                data = PANAL_MACRO_DATA;
            } else {
                data = PANAL_DATA[nodeId] || PANAL_DATA['MENIEL_HOGAR'];
            }

            // Encabezado
            const badgeEl = document.getElementById('pnlDetailBadge');
            const ownerBadgeEl = document.getElementById('pnlDetailOwnerBadge');
            const iconEl = document.getElementById('pnlDetailIcon');
            const titleEl = document.getElementById('pnlDetailTitle');
            const subEl = document.getElementById('pnlDetailSubtitle');

            if (badgeEl) {
                badgeEl.innerText = data.badge;
                badgeEl.className = data.isMenielCore 
                    ? 'text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-red-100 text-red-900 border border-red-300'
                    : 'text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/40';
            }
            if (ownerBadgeEl) {
                ownerBadgeEl.innerText = data.owner;
            }
            if (iconEl) {
                iconEl.innerText = data.icon;
                iconEl.style.backgroundColor = data.color + '25';
                iconEl.style.borderColor = data.color + '60';
            }
            if (titleEl) titleEl.innerText = data.title;
            if (subEl) {
                subEl.innerText = data.category;
                subEl.style.color = data.color;
            }

            // 4 Tarjetas de Telemetría
            const sL1 = document.getElementById('pnlStatLabel1');
            const sV1 = document.getElementById('pnlStatVal1');
            const sL2 = document.getElementById('pnlStatLabel2');
            const sV2 = document.getElementById('pnlStatVal2');
            const sL3 = document.getElementById('pnlStatLabel3');
            const sV3 = document.getElementById('pnlStatVal3');
            const sL4 = document.getElementById('pnlStatLabel4');
            const sV4 = document.getElementById('pnlStatVal4');

            if (sL1 && data.stat1) sL1.innerText = data.stat1.label + ':';
            if (sV1 && data.stat1) sV1.innerText = data.stat1.val;
            if (sL2 && data.stat2) sL2.innerText = data.stat2.label + ':';
            if (sV2 && data.stat2) sV2.innerText = data.stat2.val;
            if (sL3 && data.stat3) sL3.innerText = data.stat3.label + ':';
            if (sV3 && data.stat3) sV3.innerText = data.stat3.val;
            if (sL4 && data.stat4) sL4.innerText = data.stat4.label + ':';
            if (sV4 && data.stat4) sV4.innerText = data.stat4.val;

            // Descripción y Especificaciones
            const descEl = document.getElementById('pnlDetailDescription');
            if (descEl) descEl.innerText = data.description;

            const specsListEl = document.getElementById('pnlDetailSpecsList');
            if (specsListEl && data.specs) {
                specsListEl.innerHTML = data.specs.map(s => `<li>${s}</li>`).join('');
            }

            // Entradas y Salidas
            const inListEl = document.getElementById('pnlDetailInputsList');
            if (inListEl && data.inputs) {
                inListEl.innerHTML = data.inputs.map(i => `
                    <div class="p-2 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                        <div>
                            <span class="text-white font-bold block">${i.item}</span>
                            <span class="text-[10px] text-slate-400">Origen: ${i.from}</span>
                        </div>
                        <span class="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 font-bold text-[10px] border border-cyan-800">${i.rate}</span>
                    </div>
                `).join('');
            }

            const outListEl = document.getElementById('pnlDetailOutputsList');
            if (outListEl && data.outputs) {
                outListEl.innerHTML = data.outputs.map(o => `
                    <div class="p-2 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                        <div>
                            <span class="text-white font-bold block">${o.item}</span>
                            <span class="text-[10px] text-slate-400">Destino: ${o.to}</span>
                        </div>
                        <span class="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 font-bold text-[10px] border border-emerald-800">${o.rate}</span>
                    </div>
                `).join('');
            }

            // Barra de Balance
            const balTextEl = document.getElementById('pnlDetailBalanceText');
            const barAuto = document.getElementById('pnlBalanceBarAuto');
            const barOut = document.getElementById('pnlBalanceBarOut');
            const barIn = document.getElementById('pnlBalanceBarIn');

            if (data.balance) {
                if (balTextEl) balTextEl.innerText = data.balance.text;
                if (barAuto) barAuto.style.width = data.balance.auto + '%';
                if (barOut) barOut.style.width = data.balance.out + '%';
                if (barIn) barIn.style.width = data.balance.in + '%';
            }

            // Gobernanza
            const govListEl = document.getElementById('pnlDetailGovList');
            if (govListEl && data.governance) {
                govListEl.innerHTML = data.governance.map(g => `
                    <div class="flex items-start gap-1.5 py-0.5">
                        <span class="text-emerald-400">✔</span>
                        <span>${g}</span>
                    </div>
                `).join('');
            }

            // Fórmulas Matemáticas
            const formulaEl = document.getElementById('pnlDetailMathFormula');
            const mathExplainEl = document.getElementById('pnlDetailMathExplain');
            if (formulaEl && data.mathFormula) formulaEl.innerHTML = data.mathFormula;
            if (mathExplainEl && data.mathExplain) mathExplainEl.innerText = data.mathExplain;
        }

        // --- TRANSFERENCIA DE FICHA DEL PANAL A CANVA REPORT STUDIO ---
        function transferPanalToCanva() {
            const data = (panalZoomMode === 'macro' && panalCurrentLevel === 'cuenca') ? PANAL_MACRO_DATA : PANAL_DATA[panalActiveHexId];
            if (!data) return;

            const textToAppend = `
## 🐝 Ficha Técnica del Panal: ${data.title}
* **Categoría:** ${data.category} | **Propietario / Liderazgo:** ${data.owner}
* **Métrica Principal:** ${data.metricPrimary} (${data.metricSub})

### 📊 Indicadores Biofísicos Clave:
| Indicador | Valor Registrado | Estado / Eficiencia |
| :--- | :--- | :--- |
| ${data.stat1.label} | **${data.stat1.val}** | Conforme a diseño |
| ${data.stat2.label} | **${data.stat2.val}** | Operativo |
| ${data.stat3.label} | **${data.stat3.val}** | Monitoreo continuo |
| ${data.stat4.label} | **${data.stat4.val}** | Tasa transferible |

### 🔄 Intercambio de Flujos Vecinales:
* **Entradas (Inputs):** ${data.inputs.map(i => `${i.item} [${i.rate}] de ${i.from}`).join('; ')}
* **Salidas (Outputs):** ${data.outputs.map(o => `${o.item} [${o.rate}] hacia ${o.to}`).join('; ')}
* **Balance Metabólico:** ${data.balance ? data.balance.text : 'Balance Positivo'}

### ⚖️ Acuerdos y Gobernanza:
${data.governance.map(g => `- ${g}`).join('\n')}
`;

            const canvaArea = document.getElementById('canvaReportTextarea');
            if (canvaArea) {
                canvaArea.value += "\n" + textToAppend;
                renderCanvaReport();
            }

            alert(`✅ Ficha de "${data.title}" transferida exitosamente a Canva Report Studio.`);
        }

        // --- INICIALIZADOR GENERAL DE LA SUITE DEL PANAL (VECINOS) ---
        function initPanalSuite(mode) {
            setPanalLevel('mesa');
            renderPanalSvg();
        }

        // Inicialización diferida del Engine y Canva Studio
        setTimeout(() => {
            if (typeof L !== 'undefined' && typeof map !== 'undefined' && map && !window.energyFlowEngine) {
                window.energyFlowEngine = new LivingEnergyFlowEngine(map, 'energyFlowCanvas');
            }
            renderCanvaReport();
        }, 500);

// ═══════════════════════════════════════════════════════════════════════════════
// AGROTWIN SUITE • SERVICIOS ECOSISTÉMICOS & CONSEJO CONSULTIVO 18 ASESORES IA (6 TWINS)
// ═══════════════════════════════════════════════════════════════════════════════

const ECOSYSTEM_SERVICES_DATA = [
    // --- ESCALA PREDIO (Fundo Meniel • 12.8 ha) ---
    {
        id: 'PRED_PROV_FORAGE',
        twin: 'predio',
        category: 'provision',
        categoryLabel: 'Provisión',
        title: 'Biomasa Forrajera Polifítica PRV',
        scale: 'Predio Meniel (12.8 ha)',
        indicator: '8.200 kg MS/ha/año en 8 potreros',
        benefit: 'Alimentación bovina regenerativa de alta densidad sin concentrados ni fertilizantes sintéticos.',
        valueYear: '$18.400.000 CLP',
        advisor: 'Don Belisario Valenzuela (Agricultor)',
        mathFormula: 'MS_{\\text{prv}} = \\sum_{i=1}^{8} A_i \\cdot \\beta_i \\cdot (1 - \\text{rastrojo})',
        status: 'Óptimo'
    },
    {
        id: 'PRED_PROV_WOOD',
        twin: 'predio',
        category: 'provision',
        categoryLabel: 'Provisión',
        title: 'Madera Certificada & Leña Seca',
        scale: 'Predio Meniel (3.4 ha silvicultura)',
        indicator: '140 m³/ha de eucalipto seleccionado',
        benefit: 'Material estructural para galpones, fajas cortafuego y biomasa leñosa para mulch húmedo.',
        valueYear: '$12.200.000 CLP',
        advisor: 'Maestra Laura Henríquez (Carpintera)',
        mathFormula: 'V_{\\text{madera}} = \\frac{\\pi}{4} D^2 \\cdot H \\cdot f_f \\cdot N_{\\text{árboles}}',
        status: 'Activo'
    },
    {
        id: 'PRED_PROV_SOLAR',
        twin: 'predio',
        category: 'provision',
        categoryLabel: 'Provisión',
        title: 'Generación Solar Fotovoltaica Híbrida',
        scale: 'Predio Meniel (Matriz 18 kWp)',
        indicator: '78.4 kWh/día promedio estival (30 kWh LiFePO4)',
        benefit: 'Autonomía eléctrica 100%, impulsión de bombas de riego y excedente transferible de 4.2 kWh/d.',
        valueYear: '$6.800.000 CLP',
        advisor: 'Ing. Rodrigo Bustamante (Sistemas IoT)',
        mathFormula: 'E_{\\text{solar}} = P_{\\text{pk}} \\cdot HSP \\cdot \\eta_{\\text{inv}} \\cdot (1 - \\gamma \\Delta T)',
        status: 'Óptimo'
    },
    {
        id: 'PRED_REG_INFILTRATION',
        twin: 'predio',
        category: 'regulation',
        categoryLabel: 'Regulación',
        title: 'Infiltración Keyline a Napas Someras',
        scale: 'Predio Meniel (Diseño Yeomans)',
        indicator: '8.4 L/s continuo hacia freático',
        benefit: 'Recarga pasiva de acuífero somero que abastece norias y pozos de comités APR Las Rosas.',
        valueYear: '$28.500.000 CLP',
        advisor: 'Don Belisario Valenzuela (Agricultor)',
        mathFormula: 'I_{\\text{keyline}} = K_{\\text{sat}} \\cdot \\nabla h \\cdot L_{\\text{zanja}}',
        status: 'Óptimo'
    },
    {
        id: 'PRED_REG_POND',
        twin: 'predio',
        category: 'regulation',
        categoryLabel: 'Regulación',
        title: 'Cosecha & Retención en Tranque Keyline',
        scale: 'Predio Meniel (Cota Media 240 msnm)',
        indicator: '18.500 m³ capacidad amortiguadora',
        benefit: 'Laminación de crecidas pluviales (T=50 años), decantación de sedimentos y riego por gravedad.',
        valueYear: '$34.000.000 CLP',
        advisor: 'Dr. Fernando Albornoz (Geógrafo)',
        mathFormula: 'V_{\\text{tranque}} = \\int_0^{T_{\\text{pico}}} (Q_{\\text{in}}(t) - Q_{\\text{out}}(t)) dt',
        status: 'Óptimo'
    },
    {
        id: 'PRED_REG_CARBON',
        twin: 'predio',
        category: 'regulation',
        categoryLabel: 'Regulación',
        title: 'Secuestro de Carbono en Horizonte A',
        scale: 'Predio Meniel (5.8 ha potreros)',
        indicator: '2.4 tCO2e/ha/año (MO sube de 2.1% a 4.6%)',
        benefit: 'Mitigación de gases de efecto invernadero y retención de humedad edáfica en +32%.',
        valueYear: '$9.600.000 CLP',
        advisor: 'Dr. Marcelo Lagos R. (Biólogo)',
        mathFormula: '\\Delta C_{\\text{suelo}} = \\Delta \\text{MO} \\cdot \\rho_{\\text{aparente}} \\cdot Z \\cdot 0.58 \\cdot 3.67',
        status: 'Activo'
    },
    {
        id: 'PRED_SUP_NUTRIENTS',
        twin: 'predio',
        category: 'support',
        categoryLabel: 'Soporte',
        title: 'Ciclaje Rápido de Nutrientes & Microbiología',
        scale: 'Predio Meniel (Suelo Andisol / Trumao)',
        indicator: '>120 lombrices/m² y alta micorrización',
        benefit: 'Degradación natural de materia orgánica por bosteo concentrado sin compactación de subsuelo.',
        valueYear: '$14.200.000 CLP',
        advisor: 'Don Belisario Valenzuela (Agricultor)',
        mathFormula: 'N_{\\text{disp}} = N_{\\text{org}} \\cdot k_{\\text{min}} \\cdot f(T_{\\text{suelo}}, \\theta)',
        status: 'Óptimo'
    },
    {
        id: 'PRED_CULT_SOVEREIGNTY',
        twin: 'predio',
        category: 'cultural',
        categoryLabel: 'Cultural',
        title: 'Soberanía Campesina & Confort Bioclimático',
        scale: 'Predio Meniel (Habitacional)',
        indicator: 'Confort térmico pasivo 18-24°C sin AC fósil',
        benefit: 'Tranquilidad habitacional, arraigo familiar y resiliencia energética ante cortes de red troncal.',
        valueYear: '$8.500.000 CLP',
        advisor: 'Maestra Laura Henríquez (Carpintera)',
        mathFormula: 'R_{\\text{térmico}} = \\sum \\frac{d_i}{\\lambda_i} \\ge 3.8 \\text{ m}^2\\text{K/W}',
        status: 'Óptimo'
    },

    // --- ESCALA VECINAL (Mesa Vecinal • 10 Roles • 508 ha) ---
    {
        id: 'VEC_PROV_WATER_SHARES',
        twin: 'vecinal',
        category: 'provision',
        categoryLabel: 'Provisión',
        title: 'Turnos Dinámicos en Canal Matriz Vecinal',
        scale: 'Mosaico Vecinal (10 Predios)',
        indicator: '42.0 L/s asignados DGA en turno coordinado',
        benefit: 'Distribución equitativa de aguas superficiales de deshielo sin judicialización ni hurtos.',
        valueYear: '$48.000.000 CLP',
        advisor: 'Mg. Patricia Retamal (Adm. Pública)',
        mathFormula: 'Q_{\\text{turno}} = Q_{\\text{matriz}} \\cdot \\frac{\\text{Acciones}_i}{\\sum \\text{Acciones}}',
        status: 'Óptimo'
    },
    {
        id: 'VEC_PROV_BERRIES',
        twin: 'vecinal',
        category: 'provision',
        categoryLabel: 'Provisión',
        title: 'Producción de Berries de Exportación',
        scale: 'Huertos Vecinos (9.6 ha arándanos y frambuesas)',
        indicator: '14.2 ton/ha promedio cooperativo',
        benefit: 'Exportación asociativa y jornales agrícolas compartidos entre las 10 familias del sector.',
        valueYear: '$72.000.000 CLP',
        advisor: 'Dra. Camila Morales (Antropóloga)',
        mathFormula: 'Y_{\\text{asoc}} = \\sum A_{\\text{huerto}} \\cdot \\text{Rendimiento}',
        status: 'Activo'
    },
    {
        id: 'VEC_PROV_GRID',
        twin: 'vecinal',
        category: 'provision',
        categoryLabel: 'Provisión',
        title: 'Micro-Red Vecinal de Energía Solar',
        scale: 'Línea de Baja Tensión Meniel ⇄ Vecinos 1 y 2',
        indicator: '4.2 kWh/día inyectados a viviendas vecinas',
        benefit: 'Alimentación de refrigeración de medicinas, alimentos y bombeo de emergencia en estiaje.',
        valueYear: '$3.600.000 CLP',
        advisor: 'Ing. Rodrigo Bustamante (Sistemas IoT)',
        mathFormula: 'E_{\\text{net}} = E_{\\text{gen}} - E_{\\text{autocons}} - \\text{Pérdidas Joule}',
        status: 'Activo'
    },
    {
        id: 'VEC_REG_FIREBREAK',
        twin: 'vecinal',
        category: 'regulation',
        categoryLabel: 'Regulación',
        title: 'Faja Cortafuegos Comunitaria de 45m',
        scale: 'Frontera Silvoagropecuaria (28 km perimetrales)',
        indicator: 'Reducción del 78% en propagación interfacial',
        benefit: 'Blindaje colectivo frente a incendios forestales bajo condiciones de Viento Puelche extremo.',
        valueYear: '$95.000.000 CLP',
        advisor: 'Dra. Natalia Oyarzún (Meteoróloga)',
        mathFormula: 'I_{\\text{Byram}} = H_{\\text{comb}} \\cdot w_{\\text{faja}} \\cdot R_{\\text{propagación}} < I_{\\text{crítica}}',
        status: 'Óptimo'
    },
    {
        id: 'VEC_REG_FLOOD_MITIGATION',
        twin: 'vecinal',
        category: 'regulation',
        categoryLabel: 'Regulación',
        title: 'Laminación Vecinal de Quebradas en Tranques',
        scale: 'Red de 3 Tranques Prediales Interconectados',
        indicator: '32.000 m³ amortiguación pico en estero',
        benefit: 'Protección de caminos vecinales, puentes comunales y huertos frutales ante lluvias torrenciales.',
        valueYear: '$42.000.000 CLP',
        advisor: 'Dr. Fernando Albornoz (Geógrafo)',
        mathFormula: '\\Delta Q_{\\text{pico}} = Q_{\\text{sin\\_tranque}} - Q_{\\text{laminado}}',
        status: 'Óptimo'
    },
    {
        id: 'VEC_SUP_POLLINATION',
        twin: 'vecinal',
        category: 'support',
        categoryLabel: 'Soporte',
        title: 'Polinización Cruzada & Refugio Apícola',
        scale: 'Corredores de Cercos Vivos & Bosquete Nativo',
        indicator: 'Cobertura de 1.800 m lineales de flora melífera',
        benefit: 'Incremento del 22% en cuaja de frutos en huertos de arándano y frambuesa sin pesticidas.',
        valueYear: '$16.500.000 CLP',
        advisor: 'Dr. Marcelo Lagos R. (Biólogo)',
        mathFormula: 'C_{\\text{cuaja}} = C_0 \\cdot (1 + \\alpha_{\\text{polin}} \\cdot D_{\\text{polinizadores}})',
        status: 'Óptimo'
    },
    {
        id: 'VEC_CULT_DAO',
        twin: 'vecinal',
        category: 'cultural',
        categoryLabel: 'Cultural',
        title: 'Gobernanza Territorial Participativa (DAO)',
        scale: 'Mesa Vecinal de Retiro (10 Miembros)',
        indicator: '78% quórum activo y voto cuadrático =V^2$',
        benefit: 'Resolución pacífica de controversias de límites, priorización de obras públicas y mingas.',
        valueYear: '$15.000.000 CLP',
        advisor: 'Dra. Camila Morales (Antropóloga)',
        mathFormula: 'Cost = V^2 \\quad \\Rightarrow \\quad \\text{Voz proporcional a la intensidad de preferencia}',
        status: 'Óptimo'
    },
    {
        id: 'VEC_CULT_MEMORY',
        twin: 'vecinal',
        category: 'cultural',
        categoryLabel: 'Cultural',
        title: 'Memoria Biocultural & Acuerdos Campesinos',
        scale: 'Saberes Tradicionales del Maule Sur',
        indicator: 'Transmisión oral de hitos climáticos (1968-2023)',
        benefit: 'Respaldo empírico a las decisiones técnicas mediante el conocimiento de ancianos arrieros.',
        valueYear: '$7.500.000 CLP',
        advisor: 'Don Silvestre Gómez (Vecino Histórico)',
        mathFormula: 'M_{\\text{bioc}} = f(\\text{Historia oral}, \\text{Vertientes}, \\text{Costumbres})',
        status: 'Óptimo'
    },

    // --- ESCALA CUENCA (Cuenca Río Longaví • 122.070 ha) ---
    {
        id: 'CUEN_PROV_RIVER_DISCHARGE',
        twin: 'cuenca',
        category: 'provision',
        categoryLabel: 'Provisión',
        title: 'Caudal Hídrico Matriz del Río Longaví',
        scale: 'Macro-Cuenca Maule Sur (122.070 ha)',
        indicator: '124.5 m³/s caudal base estival (Embalse Bullileo 47.1M m³)',
        benefit: 'Seguridad hídrica regional para 32.000 ha de regadío y agua potable de Retiro, Parral y Longaví.',
        valueYear: '$280.000.000 CLP',
        advisor: 'Dr. Fernando Albornoz (Geógrafo)',
        mathFormula: 'Q_{\\text{cuenca}} = P_{\\text{nieve}} + P_{\\text{lluvia}} - ET_0 - \\Delta S_{\\text{embalse}}',
        status: 'Óptimo'
    },
    {
        id: 'CUEN_REG_HYDRO_BUFFER',
        twin: 'cuenca',
        category: 'regulation',
        categoryLabel: 'Regulación',
        title: 'Regulación Hidrológica & Laminación Regional',
        scale: 'Alta Cordillera & Quebradas Precordilleranas',
        indicator: 'Amortiguación de crecidas frente a T=100 años',
        benefit: 'Protección de infraestructura vial (Ruta 5 Sur) y estabilidad de puentes fluviales.',
        valueYear: '$140.000.000 CLP',
        advisor: 'Dr. Fernando Albornoz (Geógrafo)',
        mathFormula: 'H_{\\text{lamin}} = f(\\text{Capacidad cabeceras}, \\text{Retención bosque esclerófilo})',
        status: 'Óptimo'
    },
    {
        id: 'CUEN_REG_EROSION_CONTROL',
        twin: 'cuenca',
        category: 'regulation',
        categoryLabel: 'Regulación',
        title: 'Control de Erosión de Laderas & Sedimentos',
        scale: 'Relieve de Ladera Precordillerana (Cota 300-800 msnm)',
        indicator: '<1.2 ton/ha/año arrastre de sedimentos finos',
        benefit: 'Prevención de embancamiento prematuro de bocatomas y protección de la vida útil del Embalse Bullileo.',
        valueYear: '$45.000.000 CLP',
        advisor: 'Dr. Fernando Albornoz (Geógrafo)',
        mathFormula: 'A_{\\text{USLE}} = R \\cdot K \\cdot LS \\cdot C \\cdot P',
        status: 'Óptimo'
    },
    {
        id: 'CUEN_REG_PUELCHE_BUFFER',
        twin: 'cuenca',
        category: 'regulation',
        categoryLabel: 'Regulación',
        title: 'Atenuación Microclimática del Viento Puelche',
        scale: 'Faja Boscosa Cordillerana & Cortinas Riparias',
        indicator: 'Reducción de velocidad de ráfaga de 68 km/h a 38 km/h',
        benefit: 'Disminución del estrés evaporativo Penman-Monteith en los cultivos y retardo en desecación de biomasa.',
        valueYear: '$55.000.000 CLP',
        advisor: 'Dra. Natalia Oyarzún (Meteoróloga)',
        mathFormula: 'u(z) = \\frac{u_*}{\\kappa} \\ln\\left(\\frac{z - d}{z_0}\\right)',
        status: 'Activo'
    },
    {
        id: 'CUEN_SUP_BIOCORRIDOR',
        twin: 'cuenca',
        category: 'support',
        categoryLabel: 'Soporte',
        title: 'Corredor Biológico Andes-Cordillera de la Costa',
        scale: 'Continuo Ripario Río Longaví y Afluentes',
        indicator: 'Conectividad estructural de 84 km de ribera',
        benefit: 'Conservación de fauna nativa (guiña, loro tricahue, carpintero negro) y flora esclerófila relictual.',
        valueYear: '$32.000.000 CLP',
        advisor: 'Dr. Marcelo Lagos R. (Biólogo)',
        mathFormula: 'I_{\\text{con}} = \\sum \\frac{A_i \\cdot A_j}{1 + d_{ij}^2}',
        status: 'Óptimo'
    },
    {
        id: 'CUEN_CULT_HERITAGE',
        twin: 'cuenca',
        category: 'cultural',
        categoryLabel: 'Cultural',
        title: 'Identidad Biocultural Andino-Maulina & Paisaje',
        scale: 'Territorio Histórico Maule Sur',
        indicator: 'Reconocimiento como Cuenca Viva Intergeneracional',
        benefit: 'Arraigo de las nuevas generaciones en la ruralidad, patrimonio agroecológico y ecoturismo de cordillera.',
        valueYear: '$22.000.000 CLP',
        advisor: 'Dra. Camila Morales (Antropóloga)',
        mathFormula: 'V_{\\text{paisaje}} = \\text{Identidad} + \\text{Patrimonio} + \\text{Legado intergeneracional}',
        status: 'Óptimo'
    },

    // --- ESCALA ESTABLO (Ganadería PRV & Bienestar Animal • 8 Potreros) ---
    {
        id: 'ESTAB_PROV_MILK_MEAT',
        twin: 'establo',
        category: 'provision',
        categoryLabel: 'Provisión',
        title: 'Proteína Bovina & Lácteos Agroecológicos A2A2',
        scale: 'Rebaño Meniel (8 Potreros PRV)',
        indicator: '2.850 kg MS/ha forraje & carga 180 UGM/ha/día',
        benefit: 'Producción de leche de pastoreo y carne limpia sin hormonas, antibióticos sintéticos ni granos importados.',
        valueYear: '$24.500.000 CLP',
        advisor: 'Don Gastón Fuenzalida (Pastoreo PRV)',
        mathFormula: 'P_{\\text{prv}} = \\text{UGM} \\cdot \\text{Consumo MS} \\cdot \\eta_{\\text{conv}}',
        status: 'Óptimo'
    },
    {
        id: 'ESTAB_REG_ANIMAL_WELFARE',
        twin: 'establo',
        category: 'regulation',
        categoryLabel: 'Regulación',
        title: 'Bienestar Animal & Inmunidad Holística SAG',
        scale: 'Instalaciones Establo & Abrevaderos Móviles',
        indicator: '<100 HPG coprología & Condición Corporal 3.75/5.0',
        benefit: 'Supresión absoluta de ivermectinas y químicos; sanidad preventiva con fitoterapia y baños de ceniza.',
        valueYear: '$16.200.000 CLP',
        advisor: 'Dra. Javiera Montecinos (Médico Veterinaria)',
        mathFormula: 'I_{\\text{salud}} = f(\\text{Descanso PRV}, \\text{Fitofármacos}, \\text{DIIO SAG})',
        status: 'Óptimo'
    },
    {
        id: 'ESTAB_SUP_COEXISTENCE',
        twin: 'establo',
        category: 'support',
        categoryLabel: 'Soporte',
        title: 'Coexistencia No Letal con Fauna Silvestre',
        scale: 'Perímetro Silvopastoril & Quebrada El Espino',
        indicator: '0% depredación anual & 6 Foxlights solares activas',
        benefit: 'Disuasión con perros protectores Mastín del Pirineo, preservando pumas, zorros y güiñas sin caza letal.',
        valueYear: '$19.800.000 CLP',
        advisor: 'Ignacio Subercaseaux (Conservacionista)',
        mathFormula: 'D_{\\text{riesgo}} = 1 - (E_{\\text{mastines}} \\cdot E_{\\text{foxlights}})',
        status: 'Óptimo'
    },

    // --- ESCALA INVERNADERO (Biofábrica, Semillas & Clima Solar) ---
    {
        id: 'INVER_PROV_BIOINPUTS',
        twin: 'invernadero',
        category: 'provision',
        categoryLabel: 'Provisión',
        title: 'Biofábrica Regenerativa: Bioles, Bokashi & Microorganismos',
        scale: 'Biofábrica Solar Meniel (Estación Invernadero)',
        indicator: '1.200 kg Bokashi/sem & 450 µg C/g biomasa benéfica',
        benefit: 'Autosuficiencia en fertilizantes biológicos, bioles supermagro y té de compost hiperoxigenado para todo el predio.',
        valueYear: '$21.400.000 CLP',
        advisor: 'Ing. Soledad Navarrete (Biofábrica & Fisiología)',
        mathFormula: 'B_{\\text{prod}} = V_{\\text{biol}} \\cdot C_{\\text{microbiana}} + M_{\\text{bokashi}}',
        status: 'Óptimo'
    },
    {
        id: 'INVER_REG_PASSIVE_CLIMATE',
        twin: 'invernadero',
        category: 'regulation',
        categoryLabel: 'Regulación',
        title: 'Clima Solar Pasivo & Amortiguación Térmica Domótica',
        scale: 'Nave Bioclimática Invernadero (Off-Grid 12V)',
        indicator: 'Delta 8.2°C regulado & DPV 0.95 kPa estable',
        benefit: 'Protección de cultivos de alto valor contra heladas invernales (-2.5°C) y golpes de calor sin gasto de red.',
        valueYear: '$14.600.000 CLP',
        advisor: 'Ing. Rodrigo Bustamante (Automatización IoT)',
        mathFormula: '\\Delta T = T_{\\text{ext}} - (R_{\\text{nebuliz}} + V_{\\text{cenital}})',
        status: 'Óptimo'
    },
    {
        id: 'INVER_CULT_HERITAGE_SEEDS',
        twin: 'invernadero',
        category: 'cultural',
        categoryLabel: 'Cultural',
        title: 'Resguardo de Germoplasma Criollo & Fitoterapia Campesina',
        scale: 'Banco de Semillas del Maule Sur (45.000 simientes)',
        indicator: '28 ecotipos campesinos vivos & 94.2% germinación',
        benefit: 'Preservación de tomates patrimoniales, legumbres de guarda y sabiduría botánica tradicional sin royalties.',
        valueYear: '$18.900.000 CLP',
        advisor: 'Doña Carmen Gloria Uribe (Curadora de Semillas)',
        mathFormula: 'S_{\\text{patrimonio}} = \\sum_{k=1}^{28} E_k \\cdot P_{\\text{germinativo}}',
        status: 'Óptimo'
    },

    // --- ESCALA EXCURSIÓN (Rewilding, Edafología & Bioindicadores de Campo) ---
    {
        id: 'EXCUR_REG_SOIL_INFILTRATION',
        twin: 'excursion',
        category: 'regulation',
        categoryLabel: 'Regulación',
        title: 'Infiltración & Carbono en Suelo Vivo (Calicatas in situ)',
        scale: 'Área de Rewilding & Estero Colliguay (Horizontes A/B)',
        indicator: '185 mm/h infiltración & 44.5 t C/ha secuestradas',
        benefit: 'Esponja edáfica que retiene aluviones, estructura agregados Sq1 VESS y elimina la erosión hídrica superficial.',
        valueYear: '$31.500.000 CLP',
        advisor: 'Dr. Gonzalo Verdugo (Edafólogo de Campo)',
        mathFormula: 'C_{\\text{edáfico}} = \\text{COS} \\cdot \\rho_b \\cdot z \\cdot (1 - \\delta_{\\text{pedregosidad}})',
        status: 'Óptimo'
    },
    {
        id: 'EXCUR_SUP_WILDLIFE_CAMERA',
        twin: 'excursion',
        category: 'support',
        categoryLabel: 'Soporte',
        title: 'Monitoreo de Vertebrados & Fototrampeo Infrarrojo',
        scale: 'Red de Quebradas & Corredor Ripario Colliguay',
        indicator: '8 estaciones autónomas & 18 especies nativas/mes',
        benefit: 'Validación científica de hábitat para güiñas, quiques, chingues y rapaces crepusculares con 96.4% precisión.',
        valueYear: '$22.000.000 CLP',
        advisor: 'Ignacio Subercaseaux (Conservacionista)',
        mathFormula: 'H_{\\text{fauna}} = \\frac{\\text{Capturas nativas}}{\\text{Esfuerzo muestreo (días-trampa)}}',
        status: 'Óptimo'
    },
    {
        id: 'EXCUR_CULT_BOTANY_LICHENS',
        twin: 'excursion',
        category: 'cultural',
        categoryLabel: 'Cultural',
        title: 'Botánica Andina, Líquenes Epífitos & Necromasa Activa',
        scale: 'Dosel de Bosque Esclerófilo (Peumo, Boldo, Quillay)',
        indicator: '48% cobertura de Usnea & 22.4 m³/ha necromasa',
        benefit: 'Bioindicador de máxima pureza atmosférica y banco genético de plántulas nativas (38 ind/m² espontáneos).',
        valueYear: '$17.300.000 CLP',
        advisor: 'Dr. Marcelo Lagos Riquelme (Biólogo Paisajista)',
        mathFormula: 'I_{\\text{pureza}} = \\text{Cobertura Usnea} \\cdot \\text{Densidad necromasa}',
        status: 'Óptimo'
    }
];

const ADVISORS_DATA = {
    // ════════ PREDIO TWIN (3 Asesores) ════════
    predio_agricultor: {
        id: 'predio_agricultor',
        name: 'Don Belisario Valenzuela',
        role: 'Agricultor & Granjero Regenerativo',
        twin: 'predio',
        twinLabel: 'Predio Twin',
        icon: '🌾',
        avatarBg: 'from-amber-600 to-amber-800',
        badgeColor: 'amber',
        avatarImg: 'assets/advisors/avatar_predio_efrain.jpg',
        credentials: '35 años en manejo de ganado, diplomado en Manejo Holístico Savory Institute y Pastoreo Racional Voisin.',
        specialty: 'Manejo Holístico, lectura de bostas, rotación diaria de potreros, cálculo de materia seca (MS) y keyline.',
        focusThesis: 'El suelo no se ara; se alimenta con bosteo concentrado y rotación diaria. Si cuidamos la microbiología, el agua se queda en la raíz.',
        quote: '"Cuando la bosta tiene forma de torta con cráter al centro y las lombrices la procesan en 4 días, sabemos que el potrero está en su punto óptimo de reposo."',
        liveMetrics: [
            { label: 'Forraje Disponible', value: '8.200 kg MS/ha', status: 'optimal' },
            { label: 'Tiempo de Reposo Potrero 4', value: '38 días', status: 'optimal' },
            { label: 'Lombrices en Suelo', value: '142 / m²', status: 'optimal' },
            { label: 'Materia Orgánica Horizonte A', value: '4.6%', status: 'optimal' }
        ],
        detailedBio: 'Don Belisario es el corazón operativo del Fundo Meniel. Ha transformado una pradera degradada por laboreo tradicional en un sistema PRV de 8 potreros de alta densidad. Su agudeza visual para leer la curva de crecimiento del pasto y la actividad biológica del suelo permite maximizar la fotosíntesis y el secuestro de carbono sin gastar un solo peso en fertilizantes nitrogenados.',
        recommendedActions: [
            'Rotar rebaño al Potrero 5 tras 24 horas de ocupación para no afectar el rebrote de trébol blanco.',
            'Aplicar raspado de Keyline en ladera norte antes de las primeras lluvias de otoño para canalizar escorrentía.',
            'Donar excedente de compost bovino estabilizado al huerto de frambuesas de Don Manuel.'
        ]
    },
    predio_carpintera: {
        id: 'predio_carpintera',
        name: 'Maestra Laura Henríquez',
        role: 'Carpintera & Constructora Bioclimática',
        twin: 'predio',
        twinLabel: 'Predio Twin',
        icon: '🔨',
        avatarBg: 'from-orange-600 to-amber-900',
        badgeColor: 'amber',
        avatarImg: 'assets/advisors/avatar_predio_laura.jpg',
        credentials: 'Constructora civil técnica, especialista en carpintería de armar tradicional y estructuras rurales sismorresistentes.',
        specialty: 'Bioconstrucción con maderas locales, fardos de paja aislantes, ventilación pasiva y cortafuegos estructurales.',
        focusThesis: 'La madera bien dimensionada y curada es más resistente al fuego que el acero. El galpón debe respirar con el viento de la tarde.',
        quote: '"Si sellamos los aleros con malla mosquitera de cobre y usamos maderas impregnadas con bórax natural, las pavesas del Puelche no encuentran por dónde encender el galpón."',
        liveMetrics: [
            { label: 'Aislación Galpón R', value: '3.8 m²K/W', status: 'optimal' },
            { label: 'Humedad Madera Silvicultura', value: '12.4% (Seca)', status: 'optimal' },
            { label: 'Faja Cortafuego Galpón', value: '15m perímetro limpio', status: 'optimal' },
            { label: 'Resistencia Estructural', value: 'NCh 433 Sismo OK', status: 'optimal' }
        ],
        detailedBio: 'La Maestra Laura lidera la infraestructura física de Meniel. Combina la nobleza de la madera de roble de demolición y el eucalipto de silvicultura regenerativa para crear edificaciones que regulan pasivamente la temperatura interior. Ha diseñado el galpón central con ventilación cruzada y aleros protegidos contra pavesas ignífugas de incendios forestales.',
        recommendedActions: [
            'Inspeccionar los aleros norte del galpón y reforzar el sellado contra cenizas incandescentes.',
            'Preparar 40 m³ de mulch leñoso con ramas de poda para distribuir en la faja cortafuegos perimetral.',
            'Armar la nueva pérgola comunitaria para la Mesa Vecinal con vigas de eucalipto curado en autoclave natural.'
        ]
    },
    predio_electrico: {
        id: 'predio_electrico',
        name: 'Ing. Rodrigo Bustamante',
        role: 'Ingeniero de Sistemas IoT & Microrredes',
        twin: 'predio',
        twinLabel: 'Predio Twin',
        icon: '⚡',
        avatarBg: 'from-amber-500 to-yellow-700',
        badgeColor: 'amber',
        avatarImg: 'assets/advisors/avatar_predio_rodrigo.jpg',
        credentials: 'Ingeniero civil electricista y magíster en IoT rural, certificado en inversores Victron y baterías de litio ferrofosfato.',
        specialty: 'Microrredes solares híbridas, telemetría LoRaWAN 915 MHz, redes de sensores FDR y balance de cargas de bombeo.',
        focusThesis: 'Con 78.4 kWh/día de generación y 4.2 kWh/d de excedente, la microrred de Meniel puede energizar el bombeo de dos vecinos en estiaje.',
        quote: '"La energía solar distribuida no solo ilumina la casa: estabiliza las presiones de riego por gravedad y mantiene viva la señal de las 15 sondas de humedad."',
        liveMetrics: [
            { label: 'Potencia Solar FV', value: '18.0 kWp', status: 'optimal' },
            { label: 'Almacenamiento LiFePO4', value: '30.0 kWh (92% SoC)', status: 'optimal' },
            { label: 'Excedente Transferible', value: '4.2 kWh/día', status: 'optimal' },
            { label: 'Uptime Red LoRaWAN', value: '99.98% (15 Sondas)', status: 'optimal' }
        ],
        detailedBio: 'Rodrigo es el artífice de la inteligencia digital y energética de Meniel. Conectó los 36 paneles fotovoltaicos al banco LiFePO4 y programó el sistema de desacople automático de cargas no críticas ante eventos climáticos adversos. Garantiza que la red de telecomunicaciones LoRaWAN transmita las lecturas de humedad de suelo cada 15 minutos sin interrupción.',
        recommendedActions: [
            'Monitorear la línea de baja tensión hacia la vivienda de la Familia González para evitar caídas de tensión.',
            'Calibrar las 3 sondas FDR del Potrero 4 antes del inicio del turno de riego.',
            'Mantener el banco de respaldo al 100% de carga preventiva ante pronóstico de tormenta eléctrica.'
        ]
    },

    // ════════ VECINAL TWIN (MESA) (3 Asesores) ════════
    vecinal_antropologa: {
        id: 'vecinal_antropologa',
        name: 'Dra. Camila Morales',
        role: 'Antropóloga Social & Comunitaria',
        twin: 'vecinal',
        twinLabel: 'Vecinal Twin',
        icon: '🔍',
        avatarBg: 'from-emerald-600 to-teal-800',
        badgeColor: 'emerald',
        avatarImg: 'assets/advisors/avatar_vecinal_camila.jpg',
        credentials: 'Doctora en Antropología Social, investigadora de gobernanza de bienes comunes y economías comunitarias en el Valle del Maule.',
        specialty: 'Etnografía campesina, dinámicas de parentesco, resolución pacífica de conflictos y principios de Elinor Ostrom.',
        focusThesis: 'Los contratos legales fracasan si no hay legitimidad en el mate compartido. La faja de 45m existe porque hay confianza inter-familiar.',
        quote: '"En el campo chileno, la línea del deslinde no es un muro: es un espacio de conversación. Cuando los vecinos se reconocen como socios ecológicos, el territorio se vuelve indestructible."',
        liveMetrics: [
            { label: 'Índice de Confianza Vecinal', value: '88 / 100', status: 'optimal' },
            { label: 'Participación en Asambleas', value: '90% Quórum', status: 'optimal' },
            { label: 'Conflictos Activos de Linde', value: '0 (Resueltos)', status: 'optimal' },
            { label: 'Mingas Coordinadas 2026', value: '6 jornadas', status: 'optimal' }
        ],
        detailedBio: 'Camila investiga y acompaña los procesos organizativos de la Mesa Vecinal de Retiro. Ha documentado cómo los acuerdos consuetudinarios de paso de agua y fajas cortafuegos se sostienen en lazos de parentesco y reciprocidad histórica. Introduce metodologías de facilitación dialógica para que las decisiones de inversión en obras se tomen por consenso genuino.',
        recommendedActions: [
            'Convocar a la asamblea mensual con enfoque en la formalización de servidumbres de paso de agua.',
            'Facilitar la votación DAO comunitaria sobre la priorización de obras de ensanche del canal matriz.',
            'Registrar la memoria oral de las familias más antiguas en el Cuaderno de Inteligencia Vecinal.'
        ]
    },
    vecinal_administradora: {
        id: 'vecinal_administradora',
        name: 'Mg. Patricia Retamal',
        role: 'Administradora Pública & Fomento Territorial',
        twin: 'vecinal',
        twinLabel: 'Vecinal Twin',
        icon: '⚖️',
        avatarBg: 'from-teal-600 to-emerald-900',
        badgeColor: 'emerald',
        avatarImg: 'assets/advisors/avatar_vecinal_patricia.jpg',
        credentials: 'Magíster en Gestión y Políticas Públicas, consultora acreditada CNR Ley 18.450 y especialista en programas INDAP y GORE.',
        specialty: 'Postulación a fondos concursables, constitución de asociaciones de canalistas, ordenanzas municipales y convenios DGA.',
        focusThesis: 'Si postulamos como grupo asociativo a la Ley de Riego con telemetría integrada, el subsidio estatal cubre el 85% de las obras.',
        quote: '"El Estado tiene los recursos en la Ley 18.450 y el SIRSD-S, pero exige carpetas técnicas intachables. Nuestra misión es transformar los acuerdos del potrero en decretos adjudicados."',
        liveMetrics: [
            { label: 'Subsidio Ley 18.450 Adjudicado', value: '$85.000.000 CLP', status: 'optimal' },
            { label: 'Cumplimiento Normativo DGA', value: '100% al día', status: 'optimal' },
            { label: 'Eficacia de Inversión FNDR', value: '94% ejecutado', status: 'optimal' },
            { label: 'Roles Catastrales Alineados', value: '10 de 10', status: 'optimal' }
        ],
        detailedBio: 'Patricia es la articuladora institucional entre el mundo rural del Maule Sur y el aparato público chileno. Conoce al detalle las ventanillas de fomento de INDAP, la CNR, CORFO y el Gobierno Regional. Gracias a su gestión, los 10 predios de la Mesa cuentan con personalidad jurídica de Grupo de Riego Asociativo y han adjudicado proyectos de telemetría y tranques.',
        recommendedActions: [
            'Ingresar el expediente técnico del segundo tranque asociativo a la ventanilla única de la CNR antes del 15 de octubre.',
            'Coordinar con la DGA la instalación del caudalímetro ultrasónico oficial en el marco partidor del Canal Matriz.',
            'Tramitar la exención tributaria municipal para las franjas de amortiguación de incendios declaradas de interés comunal.'
        ]
    },
    vecinal_anciano: {
        id: 'vecinal_anciano',
        name: 'Don Silvestre Gómez (82 años)',
        role: 'Vecino Histórico & Memoria Biocultural',
        twin: 'vecinal',
        twinLabel: 'Vecinal Twin',
        icon: '👴',
        avatarBg: 'from-emerald-700 to-slate-900',
        badgeColor: 'emerald',
        avatarImg: 'assets/advisors/avatar_vecinal_silvestre.jpg',
        credentials: '82 años de vida continua en las tierras de Retiro Poniente, arriero veterano y ex-presidente del Comité de Riego tradicional.',
        specialty: 'Conocimiento empírico de vertientes milenarias, lectura de nubes en la cordillera y memoria de sequías e inundaciones históricas.',
        focusThesis: 'El agua que no se respeta en la sequía, te cobra la casa en el invierno. Al vecino nunca se le niega el paso ni un trago de vertiente.',
        quote: '"En la gran seca del 68 nos salvamos porque juntamos las aguas de las tres quebradas en un solo pozo común. El egoísmo en el campo es la muerte segura cuando el cielo se cierra."',
        liveMetrics: [
            { label: 'Años en el Territorio', value: '82 años', status: 'optimal' },
            { label: 'Vertientes Históricas Identificadas', value: '7 manantiales', status: 'optimal' },
            { label: 'Sequías Sobrevividas', value: '4 grandes eventos', status: 'optimal' },
            { label: 'Hitos Climáticos Mapeados', value: '1968, 1986, 1998, 2023', status: 'optimal' }
        ],
        detailedBio: 'Don Silvestre es la biblioteca viva del territorio. Conoce cada piedra, cada zanjón y cada árbol añejo de la precordillera del Longaví. Recuerda con precisión milimétrica por dónde corrió el agua en la gran crecida de 1986 y qué vertientes siguieron goteando en la sequía de 1968. Su voz tiene peso moral incuestionable en cada sesión de la Mesa de Vecinos.',
        recommendedActions: [
            'Guiar al Dr. Fernando a la vertiente alta de la Quebrada El Espino que nunca se ha secado para aforarla.',
            'Aconsejar a los jóvenes productores sobre el momento exacto de limpiar los canales de greda antes de las heladas.',
            'Presidir la ceremonia tradicional de agradecimiento a la tierra en el nuevo tranque Keyline de Meniel.'
        ]
    },

    // ════════ CUENCA TWIN (EL CERRO) (3 Asesores) ════════
    cuenca_geografo: {
        id: 'cuenca_geografo',
        name: 'Dr. Fernando Albornoz',
        role: 'Geógrafo & Geomorfólogo de Cuencas',
        twin: 'cuenca',
        twinLabel: 'Cuenca Twin',
        icon: '🗺️',
        avatarBg: 'from-sky-600 to-blue-800',
        badgeColor: 'sky',
        avatarImg: 'assets/advisors/avatar_cuenca_fernando.jpg',
        credentials: 'Doctor en Geografía Física, investigador principal en geomorfología fluvial de la cuenca del Río Maule y modelado HEC-RAS.',
        specialty: 'Geomorfología de cuencas andinas, dinámica de sedimentos, índice de humedad topográfica (TWI) y ordenamiento territorial.',
        focusThesis: 'Cada tranque Keyline en la cota media retiene 4.2% del pico de crecida, salvando los puentes de Retiro y Parral aguas abajo.',
        quote: '"Una cuenca no es un mapa estático: es un embudo viviente de sedimentos, agua y energía gravitacional. Las curvas de nivel son las venas por donde late la montaña."',
        liveMetrics: [
            { label: 'Caudal Río Longaví', value: '124.5 m³/s', status: 'optimal' },
            { label: 'Volumen Embalse Bullileo', value: '47.1M m³ (78.5%)', status: 'optimal' },
            { label: 'Arrastre Sedimentos Laderas', value: '<1.2 ton/ha/año', status: 'optimal' },
            { label: 'Infiltración Regional Consolidada', value: '14.2 m³/s', status: 'optimal' }
        ],
        detailedBio: 'Fernando estudia la física del relieve maulino desde hace dos décadas. Modela digitalmente los hidrogramas de escorrentía del Río Longaví y sus tributarios. Sus simulaciones de crecida para periodos de retorno de 50 y 100 años son el estándar utilizado para diseñar la red de tranques amortiguadores y defensas fluviales de los comités de riego.',
        recommendedActions: [
            'Correr la simulación HEC-RAS con caudal de 180 m³/s para verificar el comportamiento de los marcos partidores.',
            'Actualizar el mapa satelital TWI de saturación de suelo tras el frente de precipitaciones cordilleranas.',
            'Integrar las cotas de los 10 predios en el modelo digital de elevación LiDAR de la cuenca alta.'
        ]
    },
    cuenca_meteorologa: {
        id: 'cuenca_meteorologa',
        name: 'Dra. Natalia Oyarzún',
        role: 'Meteoróloga & Piro-Climatóloga',
        twin: 'cuenca',
        twinLabel: 'Cuenca Twin',
        icon: '🌤️',
        avatarBg: 'from-sky-500 to-indigo-800',
        badgeColor: 'sky',
        avatarImg: 'assets/advisors/avatar_cuenca_natalia.jpg',
        credentials: 'Doctora en Ciencias Atmosféricas, especialista en mesoclimas mediterráneos, viento Foehn (Puelche) y modelos de propagación de fuego.',
        specialty: 'Piro-meteorología, índice canadiense FWI Van Wagner, balance Penman-Monteith y sistemas de alerta sinóptica temprana.',
        focusThesis: 'Cuando el Puelche baja por la quebrada de Bullileo, la humedad del pasto cae a 8% en 4 horas. La faja de 45m es la única defensa.',
        quote: '"El fuego en Chile central no se combate con agua cuando ya arde: se combate 48 horas antes, cerrando fajas y humedeciendo laderas cuando el barómetro anuncia viento del este."',
        liveMetrics: [
            { label: 'Índice de Fuego FWI', value: '24.0 (Bajo)', status: 'optimal' },
            { label: 'Viento Puelche Ráfagas', value: '38 km/h ESE', status: 'optimal' },
            { label: 'Humedad Relativa Mínima', value: '28% HR', status: 'optimal' },
            { label: 'Evapotranspiración ET0', value: '5.2 mm/día', status: 'optimal' }
        ],
        detailedBio: 'Natalia es la guardiana del cielo del Maule Sur. Monitorea las estaciones agrometeorológicas DMC e INIA y calibra los modelos meteorológicos para anticipar las olas de calor y las invasiones de aire cálido y seco que descienden de la cordillera. Ha parametrizado el algoritmo de FWI Van Wagner para los biomas específicos de pino, eucalipto y pradera.',
        recommendedActions: [
            'Emitir alerta amarilla preventiva si el modelo WRF proyecta ráfagas de Puelche superiores a 50 km/h el fin de semana.',
            'Activar el riego por aspersión perimetral en la faja cortafuego de 45m 12 horas antes del pico térmico.',
            'Cruzar las lecturas de las 15 sondas FDR con el balance ET0 para recalcular las necesidades hídricas diarias.'
        ]
    },
    cuenca_biologo: {
        id: 'cuenca_biologo',
        name: 'Dr. Marcelo Lagos Riquelme',
        role: 'Biólogo Ecólogo del Paisaje',
        twin: 'cuenca',
        twinLabel: 'Cuenca Twin',
        icon: '🌿',
        avatarBg: 'from-teal-600 to-sky-900',
        badgeColor: 'sky',
        avatarImg: 'assets/advisors/avatar_cuenca_marcelo.jpg',
        credentials: 'Doctor en Ecología y Biología Evolutiva, investigador en restauración ecológica de ecosistemas esclerófilos de Chile central.',
        specialty: 'Ecología del paisaje, corredores biológicos riparios, biofiltros con macrófitas y pago por servicios ecosistémicos (PSE).',
        focusThesis: 'El bosque nativo de quebrada actúa como esponja viva y refugio de aves rapaces que controlan roedores sin usar raticidas.',
        quote: '"Un monocultivo limpio es un desierto biológico esperando enfermar. Un paisaje en panal con cercos vivos, totoras en el agua y árboles nativos se cura a sí mismo."',
        liveMetrics: [
            { label: 'Índice de Integridad Biótica', value: '82 / 100', status: 'optimal' },
            { label: 'Eficiencia Biofiltro Totoras', value: '94% retención N/P', status: 'optimal' },
            { label: 'Cobertura Bosque Esclerófilo', value: '42.5 ha protegidas', status: 'optimal' },
            { label: 'Diversidad Avifauna Riparia', value: '28 especies censadas', status: 'optimal' }
        ],
        detailedBio: 'Marcelo trabaja en la regeneración de la red ecológica del territorio. Diseñó el sistema de biofiltros con totoras y juncos que purifica el agua de escorrentía antes de ingresar al tranque Keyline de Meniel. Promueve la reconexión de los parches de bosque esclerófilo nativo mediante corredores ribereños que brindan hábitat a controladores biológicos de plagas.',
        recommendedActions: [
            'Monitorear la población de macrófitas en el desarenador del tranque para asegurar la retención de nitratos.',
            'Plantar 200 quillayes y peumos en el borde del canal de desborde para consolidar el corredor biológico.',
            'Medir la tasa de recarga de carbono orgánico en el horizonte A en las parcelas PRV bajo pastoreo continuo.'
        ]
    },

    // ════════ ESTABLO TWIN (3 Asesores) ════════
    establo_veterinaria: {
        id: 'establo_veterinaria',
        name: 'Dra. Javiera Montecinos',
        role: 'Médico Veterinaria Holística & Bienestar SAG',
        twin: 'establo',
        twinLabel: 'Establo Twin',
        icon: '🩺',
        avatarBg: 'from-amber-600 to-rose-800',
        badgeColor: 'amber',
        avatarImg: 'assets/advisors/avatar_establo_javiera.jpg',
        credentials: 'Médico Veterinaria Universidad de Chile, especialista en bienestar animal, fitofármacos preventivos y certificación PABCO.',
        specialty: 'Sanidad preventiva de rebaño, biometría clínica, fitoterapia (ajo silvestre, tierra de diatomeas), coprología McMaster y trazabilidad DIIO.',
        focusThesis: 'El mejor antibiótico es el forraje limpio con descanso biológico. Con sales bioactivas y pastoreo sin estrés, la inmunidad de rebaño es absoluta.',
        quote: '"Paloma y Clavel están en condición corporal 3.75. Con el baño seco de ceniza y ajo silvestre mantenemos al rebaño blindado sin comprometer la microbiología del suelo."',
        liveMetrics: [
            { label: 'Huevos por Gramo (HPG)', value: '<100 (Bajo)', status: 'optimal' },
            { label: 'Condición Corporal Prom.', value: '3.75 / 5.0', status: 'optimal' },
            { label: 'Antibióticos de Síntesis', value: '0.0 mg (100% Limpio)', status: 'optimal' },
            { label: 'Cumplimiento SAG DIIO', value: '100% Trazable', status: 'optimal' }
        ],
        detailedBio: 'Javiera lidera la salud animal del Fundo Meniel bajo principios de medicina veterinaria integrativa y holística. Prioriza el descanso de potreros para cortar los ciclos de vida de parásitos gastrointestinales sin recurrir a ivermectinas que dañen la vida del suelo. Supervisa la trazabilidad oficial ante el SAG y los planes preventivos de terneros, ovinos y aves camperas.',
        recommendedActions: [
            'Efectuar muestreo coprológico semestral a las terneras Clavel y Paloma antes del cambio a potreros de primavera.',
            'Renovar los bloques de sal marina con azufre y ajo deshidratado en los abrevaderos móviles del Potrero 2.',
            'Inspeccionar el cenicero de desparasitación con tierra de diatomeas del Egg Mobile de gallinas ponedoras.'
        ]
    },
    establo_pastor: {
        id: 'establo_pastor',
        name: 'Don Gastón Fuenzalida',
        role: 'Maestro de Pastoreo Racional Voisin (PRV)',
        twin: 'establo',
        twinLabel: 'Establo Twin',
        icon: '🌾',
        avatarBg: 'from-amber-700 to-emerald-900',
        badgeColor: 'amber',
        avatarImg: 'assets/advisors/avatar_establo_gaston.jpg',
        credentials: '38 años de experiencia en manejo forrajero templado, maestro práctico certificado en PRV y Manejo Holístico regenerativo.',
        specialty: 'Punto Óptimo de Reposo (POR), llamarada de crecimiento del forraje, cálculo de carga instantánea de alta densidad y rotación multiespecie.',
        focusThesis: 'El pasto no se corta ni se apura; se respeta su tiempo de reposo para que las raíces bajen profundo. La bosta concentrada en 18 horas vale más que 10 sacos de urea.',
        quote: '"El Potrero 1 llegó a la hoja en bandera con 24 cm de forraje. Metemos las vacas hoy al amanecer por 18 horas y atrás entran las ponedoras a quebrar la bosta y comer larvas de mosca."',
        liveMetrics: [
            { label: 'Biomasa Forraje Disponible', value: '2.850 kg MS/ha', status: 'optimal' },
            { label: 'Tiempo de Reposo Potrero 1', value: '44 días', status: 'optimal' },
            { label: 'Carga Instantánea PRV', value: '180 UGM/ha/día', status: 'optimal' },
            { label: 'Aprovechamiento de Pradera', value: '86% sin pisoteo muerto', status: 'optimal' }
        ],
        detailedBio: 'Don Gastón es el estratega de la rotación forrajera en Meniel. Conoce el ritmo exacto de rebrote de cada gramínea y leguminosa del predio. Diseñó la subdivisión en 8 potreros móviles conectados a un callejón central con agua fresca continua, asegurando que el ganado ingiera pasto en su máximo tenor proteico sin volver a pisar el rebrote fresco.',
        recommendedActions: [
            'Abrir la franja norte del Potrero 1 a las 07:30 para aprovechar la turgencia matutina del trébol blanco.',
            'Monitorear la altura remanente post-pastoreo asegurando un corte uniforme a 5 cm para acelerar el rebrote.',
            'Desplazar el Egg Mobile de 45 gallinas al Potrero 8 recién desocupado para incorporar nitrógeno orgánico.'
        ]
    },
    establo_conservacionista: {
        id: 'establo_conservacionista',
        name: 'Ignacio Subercaseaux',
        role: 'Conservacionista & Coexistencia Rebaño-Fauna',
        twin: 'establo',
        twinLabel: 'Establo Twin',
        icon: '🦊',
        avatarBg: 'from-emerald-700 to-stone-900',
        badgeColor: 'emerald',
        avatarImg: 'assets/advisors/avatar_fauna_ignacio.jpg',
        credentials: 'Biólogo de la Conservación, especialista en mitigación de conflictos carnívoros-ganadería y adiestramiento de perros protectores de rebaño.',
        specialty: 'Coexistencia entre carnívoros nativos (pumas, zorros culpeo/chilla, güiñas) y rebaños; luces disuasivas Foxlights y cercado perimetral no letal.',
        focusThesis: 'Para cuidar a los corderos no se envenena ni se caza a los carnívoros nativos. Con perros protectores bien improntados y cercos disuasivos, el depredador aprende a cazar liebres en el monte y respeta el potrero.',
        quote: '"En Meniel la tasa de depredación es cero porque el rebaño está vigilado por mastines y el zorro cumple su función biológica en el monte. Ganadería próspera y fauna protegida conviven en paz."',
        liveMetrics: [
            { label: 'Tasa de Depredación Anual', value: '0.0% (Cero Bajas)', status: 'optimal' },
            { label: 'Efectividad Perros Protectores', value: '98.5% disuasión', status: 'optimal' },
            { label: 'Disuasivos Foxlights Activos', value: '6 unidades perimetrales', status: 'optimal' },
            { label: 'Incidentes Letales con Fauna', value: '0 eventos', status: 'optimal' }
        ],
        detailedBio: 'Ignacio es el puente entre el mundo productivo y la conservación silvestre. Asesora a los ganaderos del valle para erradicar el uso histórico de trampas y venenos, implementando en su lugar perros de protección animal y cercos electrificados disuasivos en zonas de interfase bosque-pradera. Demuestra día a día que la coexistencia beneficia la salud del ecosistema.',
        recommendedActions: [
            'Revisar la batería solar y cadencia de destello de las luces Foxlights en el cerco colindante con la Quebrada El Espino.',
            'Supervisar el entrenamiento de socialización de los dos cachorros Mastín del Pirineo con las ovejas Suffolk Down.',
            'Mapear huellas de tránsito de zorros chilla en los callejones de pastoreo para descartar acercamientos indebidos.'
        ]
    },

    // ════════ INVERNADERO TWIN (3 Asesores) ════════
    invernadero_agronoma: {
        id: 'invernadero_agronoma',
        name: 'Ing. Agr. Soledad Navarrete',
        role: 'Fisióloga Vegetal & Biofábrica Regenerativa',
        twin: 'invernadero',
        twinLabel: 'Invernadero Twin',
        icon: '🌱',
        avatarBg: 'from-emerald-600 to-teal-800',
        badgeColor: 'emerald',
        avatarImg: 'assets/advisors/avatar_invernadero_soledad.jpg',
        credentials: 'Ingeniera Agrónoma con mención en Agroecología, máster en microbiología de suelos y biopreparados fermentados.',
        specialty: 'Biofábrica artesanal, formulación de compost Bokashi, té de compost hiperoxigenado, bioles supermagro, cálculo de DPV y control biológico con parasitoides.',
        focusThesis: 'La planta no se enferma por falta de veneno, sino por desbalance nutricional y falta de vida en la rizosfera. El té de compost inocula millones de bacterias benéficas que colonizan la hoja antes de que llegue el hongo.',
        quote: '"El té de compost aireado alcanzó 450 µg C/g de biomasa bacteriana benéfica. Con una sola aplicación foliar al amanecer sellamos la canopia contra el oídio y fortalecemos los goteros."',
        liveMetrics: [
            { label: 'Vigor Radicular Relativo', value: '+34% vs testigo', status: 'optimal' },
            { label: 'Déficit Presión Vapor (DPV)', value: '0.95 kPa (Óptimo)', status: 'optimal' },
            { label: 'Biomasa Microbiana Activa', value: '450 µg C/g', status: 'optimal' },
            { label: 'Producción Bokashi Semanal', value: '1.200 kg maduros', status: 'optimal' }
        ],
        detailedBio: 'Soledad comanda la biofábrica del invernadero solar. Ha estandarizado las recetas campesinas de fermentación anaeróbica y aeróbica, transformando bosta fresca, harina de rocas locales, salvado y melaza en enmiendas de altísimo valor biológico. Diseña además las coberturas de policultivo que mantienen el suelo del invernadero fresco y vivo.',
        recommendedActions: [
            'Inocular 200 litros de biol fermentado en el sistema de fertirriego por goteo del mesón de tomates criollos.',
            'Chequear la temperatura de la pila de compost Bokashi en el día 5 para mantenerla en el rango termófilo de 55°C.',
            'Liberar microavispas Aphidius colemani en el cuartel de hortalizas para control preventivo de pulgones.'
        ]
    },
    invernadero_curadora: {
        id: 'invernadero_curadora',
        name: 'Doña Carmen Gloria Uribe',
        role: 'Curadora de Semillas Criollas & Fitoterapia',
        twin: 'invernadero',
        twinLabel: 'Invernadero Twin',
        icon: '🏺',
        avatarBg: 'from-amber-600 to-rose-900',
        badgeColor: 'amber',
        avatarImg: 'assets/advisors/avatar_invernadero_carmen.jpg',
        credentials: 'Guardiana tradicional de semillas con más de 30 años de rescate fitogenético en la cuenca del Maule y curadora de la Red de Semillas Libres.',
        specialty: 'Selección masal de ecotipos criollos adaptados a estrés hídrico, semilleros en alveolos bioclimáticos, extractos botánicos de fitoterapia campesina y calendarios lunares.',
        focusThesis: 'La semilla campesina tiene memoria de heladas y de secas de cien años. No necesita patentes ni fertilizantes importados: necesita tierra viva, manos cariñosas y comunidad que la intercambie.',
        quote: '"Nuestros tomates criollos y porotos pallares aguantan 2.5 grados bajo cero en semillero porque nacieron en esta tierra. Con un buen macerado de ortiga y cola de caballo no hay peste que los voltee."',
        liveMetrics: [
            { label: 'Poder Germinativo Promedio', value: '94.2% verificado', status: 'optimal' },
            { label: 'Variedades Criollas Activas', value: '28 ecotipos locales', status: 'optimal' },
            { label: 'Tolerancia Térmica Adicional', value: '+2.5°C resiliencia', status: 'optimal' },
            { label: 'Semillas Patrimoniales Banco', value: '45.000 unidades', status: 'optimal' }
        ],
        detailedBio: 'Doña Carmen Gloria custodia el patrimonio biocultural vivo del valle. Ha rescatado variedades de tomate limachino antiguo, zapallos de guarda, maíces multicolores y hierbas medicinales que estaban a punto de extinguirse por el avance de híbridos comerciales. Enseña a las nuevas generaciones cómo cosechar, fermentar, secar y almacenar simientes con técnicas ancestrales.',
        recommendedActions: [
            'Iniciar el repique de las bandejas de 50 alveolos de tomate criollo rosado hacia macetas de aclimatación.',
            'Preparar macerado en frío de cola de caballo silvestre para asperjar los semilleros contra hongos de almaciguera.',
            'Organizar el trafkintu (intercambio comunitario de semillas) para la próxima sesión de la Mesa Vecinal.'
        ]
    },
    invernadero_iot: {
        id: 'invernadero_iot',
        name: 'Ing. Rodrigo Bustamante',
        role: 'Automatización IoT & Climatización Solar',
        twin: 'invernadero',
        twinLabel: 'Invernadero Twin',
        icon: '⚡',
        avatarBg: 'from-amber-500 to-yellow-700',
        badgeColor: 'amber',
        avatarImg: 'assets/advisors/avatar_predio_rodrigo.jpg',
        credentials: 'Ingeniero civil electricista y magíster en IoT rural, certificado en automatización off-grid y redes sensoriales LoRaWAN.',
        specialty: 'Telemetría climática protegida (PAR, DPV, CE, pH), control domótico de aperturas cenitales a 12V, nebulización térmica y respaldo solar.',
        focusThesis: 'El invernadero de precisión no requiere conectarse a la red eléctrica: los actuadores a 12V y las sondas LoRaWAN funcionan indefinidamente con un solo panel fotovoltaico de 150W y una batería de litio.',
        quote: '"Al superar los 27°C abrimos automáticamente las lucarnas cenitales y activamos la microaspersión superior para amortiguar el calor 8.2°C con cero consumo de la red."',
        liveMetrics: [
            { label: 'Autonomía Solar Domótica', value: '100% Off-Grid', status: 'optimal' },
            { label: 'Amortiguación Térmica Máx.', value: '8.2°C delta regulado', status: 'optimal' },
            { label: 'Uptime Nodos LoRa Invernadero', value: '99.9% (8 sensores)', status: 'optimal' },
            { label: 'Eficiencia Uso de Agua Riego', value: '96.4% por pulso', status: 'optimal' }
        ],
        detailedBio: 'Rodrigo conecta el invernadero a la red digital del Fundo Meniel. Integró los sensores de conductividad eléctrica del suelo, radiación fotosintéticamente activa (PAR) y las sondas de humedad volumétrica directamente a la microrred del predio. Automatizó la ventilación cenital y las cortinas térmicas para neutralizar las heladas invernales y las olas de calor del verano.',
        recommendedActions: [
            'Calibrar los electrodos de conductividad eléctrica (CE) y pH del estanque de biofertilización líquida.',
            'Verificar la carrera del actuador lineal de la lucarna cenital norte antes del pronóstico de 32°C de mañana.',
            'Revisar la señal LoRaWAN del nodo de radiación PAR ubicado en el mesón de semilleros bioclimáticos.'
        ]
    },

    // ════════ EXCURSIÓN TWIN (3 Asesores) ════════
    excursion_biologo: {
        id: 'excursion_biologo',
        name: 'Dr. Marcelo Lagos Riquelme',
        role: 'Biólogo del Paisaje & Bioindicadores Botánicos',
        twin: 'excursion',
        twinLabel: 'Excursión Twin',
        icon: '🌿',
        avatarBg: 'from-teal-600 to-sky-900',
        badgeColor: 'teal',
        avatarImg: 'assets/advisors/avatar_cuenca_marcelo.jpg',
        credentials: 'Doctor en Ecología y Biología Evolutiva, especialista en bosque esclerófilo, bioindicadores criptogámicos y dinámica de necromasa.',
        specialty: 'Conectividad de corredores riparios, muestreo de líquenes epífitos (Usnea), estratificación del dosel arbóreo nativo y protocolos de rewilding.',
        focusThesis: 'Los líquenes en las ramas de los peumos no mienten: su presencia del 48% certifica aire químicamente puro y humedad ambiental estable. Un bosque sin madera muerta en suelo pierde su memoria ecosistémica.',
        quote: '"El dosel de peumos y boldos sobre el estero presenta una cobertura de líquenes del 48%. Esa masa de necromasa caída es el pulmón microbiológico que nutre al valle."',
        liveMetrics: [
            { label: 'Cobertura Líquenes / Epífitas', value: '48% (Calidad A+)', status: 'optimal' },
            { label: 'Conectividad Corredor Ripario', value: '0.95 IEI', status: 'optimal' },
            { label: 'Necromasa en Suelo Activa', value: '22.4 m³/ha', status: 'optimal' },
            { label: 'Regeneración Natural Plántulas', value: '38 ind/m² espontáneos', status: 'optimal' }
        ],
        detailedBio: 'Marcelo amplía su mirada de paisaje adentrándose en el corazón biológico del predio. Lidera las expediciones de terreno evaluando los bioindicadores botánicos más sensibles a la polución y el cambio climático. Monitorea la presencia de epífitas, musgos y la densidad de madera muerta como pilares de hábitat para artrópodos y aves nativas del Estero Colliguay.',
        recommendedActions: [
            'Completar el transecto de 100 metros en el cuadrante de rewilding midiendo diámetro de troncos caídos.',
            'Identificar la dispersión de plántulas de peumo bajo los posaderos de torcazas y zorzales en la ribera.',
            'Censar las colonias de líquenes barbas de viejo en las laderas expuestas a la brisa vespertina del estero.'
        ]
    },
    excursion_conservacionista: {
        id: 'excursion_conservacionista',
        name: 'Ignacio Subercaseaux',
        role: 'Conservacionista & Fototrampeo Avanzado',
        twin: 'excursion',
        twinLabel: 'Excursión Twin',
        icon: '📸',
        avatarBg: 'from-teal-700 to-emerald-950',
        badgeColor: 'teal',
        avatarImg: 'assets/advisors/avatar_fauna_ignacio.jpg',
        credentials: 'Biólogo de la Conservación, rastreador de fauna andino-costera y coordinador de redes de fototrampeo satelital.',
        specialty: 'Instalación y triangulación de cámaras trampa infrarrojas, mapas de calor de tránsito biológico, etología de mesodepredadores y huellas de campo.',
        focusThesis: 'El bosque habla a través de los pasos silenciosos de sus habitantes nocturnos. Si triangulamos las cámaras trampa en las aguadas naturales, detectamos a la güiña y al quique sin perturbar un milímetro de su hábitat.',
        quote: '"Las cámaras trampa en el estero captaron dos ejemplares de güiña y una familia de quiques. Si preservamos este sendero sin desmalezar, el corredor biológico queda sellado."',
        liveMetrics: [
            { label: 'Especies Nativas Censadas', value: '18 especies / mes', status: 'optimal' },
            { label: 'Precisión de Fototrampeo', value: '96.4% capturas limpias', status: 'optimal' },
            { label: 'Índice de Hábitat Efectivo', value: '94% integridad', status: 'optimal' },
            { label: 'Cámaras Trampa Activas', value: '8 estaciones autónomas', status: 'optimal' }
        ],
        detailedBio: 'En el modo Excursión, Ignacio despliega todo su instrumental de rastreo y tecnología de campo. Ha montado una red de fototrampeo infrarrojo en las quebradas más profundas de Colliguay, documentando la presencia de mamíferos esquivos y monitoreando los hábitos crepusculares de la fauna nativa para validar la integridad ecológica de la reserva.',
        recommendedActions: [
            'Descargar y archivar las tarjetas SD de las estaciones trampa 4 y 7 ubicadas en el vado del estero.',
            'Revisar marcas de raspado en troncos de boldo viejo para confirmar rutas de tránsito territorial de felinos.',
            'Programar el sensor PIR de la cámara trampa del roblal a sensibilidad alta por la temporada de pariciones.'
        ]
    },
    excursion_edafologo: {
        id: 'excursion_edafologo',
        name: 'Dr. Gonzalo Verdugo',
        role: 'Edafólogo de Campo & Dinámica del Suelo Vivo',
        twin: 'excursion',
        twinLabel: 'Excursión Twin',
        icon: '⛏️',
        avatarBg: 'from-amber-800 to-stone-900',
        badgeColor: 'amber',
        avatarImg: 'assets/advisors/avatar_excursion_gonzalo.jpg',
        credentials: 'Doctor en Ciencias del Suelo, investigador en física y biología de horizontes edáficos mediterráneos y cromatografía de Pfeiffer.',
        specialty: 'Calicatas in situ, barrena edafológica, velocidad de infiltración con infiltrómetro de doble anillo, densidad aparente y captura de Carbono Orgánico del Suelo (COS).',
        focusThesis: 'El suelo no es soporte inerte: es una esponja viva de carbono, poros y hongos micorrícicos. Si la calicata muestra horizonte orgánico oscuro con lombrices y olor a geosmina, esa tierra jamás se erosionará con un aluvión.',
        quote: '"La calicata en el área de rewilding muestra 12 cm de horizonte orgánico esponjoso con estructura granular perfecta. El suelo infiltra 185 mm de lluvia por hora sin escurrir una gota de barro al río."',
        liveMetrics: [
            { label: 'Infiltración Hídrica In Situ', value: '185 mm/h (Excelente)', status: 'optimal' },
            { label: 'Materia Orgánica Horizonte A', value: '6.8% acumulada', status: 'optimal' },
            { label: 'Carbono Orgánico Secuestrado', value: '44.5 t C/ha', status: 'optimal' },
            { label: 'Estructura Agregados VESS', value: 'Sq1 (Muy Buena)', status: 'optimal' }
        ],
        detailedBio: 'Gonzalo es el científico que lee la historia geológica y biológica bajo nuestros pies. Con su barrena, penetrómetro y reactivos de campo desciende a los perfiles de suelo para diagnosticar la permeabilidad, aireación y actividad enzimática. Sus mediciones de carbono orgánico son el estándar técnico que certifica el secuestro real de carbono en el ecosistema.',
        recommendedActions: [
            'Ejecutar prueba de infiltración de doble anillo en el suelo bajo dosel esclerófilo vs pradera testigo.',
            'Tomar muestra no perturbada con cilindro de Kopecky para medir densidad aparente en horizonte A.',
            'Realizar cromatografía circular de Pfeiffer para evaluar la armonía biológica de los agregados del suelo.'
        ]
    }
};

const DEBATE_SCENARIOS = {
    SCENARIO_PUELCHE: {
        id: 'SCENARIO_PUELCHE',
        title: '🔥 Alerta Roja: Viento Puelche & Ola de Calor Extrema (FWI 48 • Alto Riesgo)',
        alertLevel: 'ALERTA ROJA PIRO-METEOROLÓGICA',
        contextText: 'La Dirección Meteorológica pronostica una masa de aire seco y cálido con ráfagas de Viento Puelche de 65 km/h, temperaturas de 38.5°C y humedad relativa bajo el 12% durante 72 horas continuas.',
        interventions: [
            {
                advisorId: 'cuenca_meteorologa',
                time: '10:00 AM',
                tag: 'ALERTA TEMPRANA',
                text: 'Atención Consejo: El modelo sinóptico indica gradiente de presión pronunciado en la cordillera. El Viento Puelche bajará por la quebrada de Bullileo desde las 14:00 hrs. El índice FWI saltará de 24 a 48. La humedad de la paja caerá a 7% en tres horas. Si hay una chispa, la propagación será incontrolable sin fajas activas.'
            },
            {
                advisorId: 'predio_agricultor',
                time: '10:03 AM',
                tag: 'RESPUESTA PREDIAL',
                text: 'Enterado, Dra. Natalia. Voy a trasladar inmediatamente el rebaño al Potrero 1, junto al galpón, donde el pasto ya fue comido y no hay material seco acumulado. Además, el ganado mantendrá la tierra pisoteada y limpia. Los aspersores del Keyline están listos para humedecer la ladera este.'
            },
            {
                advisorId: 'predio_carpintera',
                time: '10:06 AM',
                tag: 'BLINDAJE ESTRUCTURAL',
                text: 'Desde la bioconstrucción: estoy revisando el galpón y las casas. Cerré las troneras superiores de ventilación para que no entren pavesas arrastradas por el viento. La faja de 15m alrededor de las edificaciones está libre de madera apilada. Si la faja comunitaria de 45m aguanta, las estructuras están seguras.'
            },
            {
                advisorId: 'predio_electrico',
                time: '10:09 AM',
                tag: 'RED & BOMBEO',
                text: 'Sistema fotovoltaico operando a máxima potencia. Las baterías están al 98% SoC. Voy a forzar el arranque de las bombas solares de 7.5 HP para llenar el tranque auxiliar y saturar las líneas de aspersión perimetral de la faja cortafuegos. Dejo 5 kWh de reserva exclusiva para las radios VHF y la estación LoRaWAN.'
            },
            {
                advisorId: 'vecinal_anciano',
                time: '10:12 AM',
                tag: 'MEMORIA TERRITORIAL',
                text: 'Hijos, este viento ya lo vimos en febrero del 98. Cuando el cerro zumba así de seco, el fuego no viene caminando, viene volando por las copas de los pinos. Hay que avisarle a Don Manuel que apague el asador y que moje los fardos del galpón chico. El agua del canal matriz tiene que correr abierta por las acequias de linde.'
            },
            {
                advisorId: 'vecinal_administradora',
                time: '10:15 AM',
                tag: 'DECRETOS & BOMBEROS',
                text: 'Acabo de comunicar la situación a la Delegación Presidencial de Linares y al Cuerpo de Bomberos de Retiro. Activamos el protocolo del Decreto B2B comunal: se prohíbe toda faena con maquinaria agrícola o desbrozadoras en los 10 predios hasta que el FWI baje de 30. CONAF tiene las coordenadas del tranque Meniel como punto de carguío de helicópteros.'
            },
            {
                advisorId: 'vecinal_antropologa',
                time: '10:18 AM',
                tag: 'COHESIÓN COMUNITARIA',
                text: 'La red de radios VHF vecinal ya está coordinada en Canal 4. Las 10 familias están en contacto. Acordamos que los jóvenes apoyen a los adultos mayores en la limpieza de techos. La confianza construida en la Mesa es lo que evita el pánico: sabemos exactamente quién cuida qué sector de la frontera de 45m.'
            },
            {
                advisorId: 'cuenca_geografo',
                time: '10:21 AM',
                tag: 'ANÁLISIS DE RELIEVE',
                text: 'Cartográficamente, el punto de mayor peligro es el embudo de la Quebrada La Zanja, donde el viento acelera por efecto Venturi. Recomiendo concentrar la humectación en la cota 280 msnm. El tranque de Meniel tiene 18.500 m³; podemos drenar 2 L/s de gravedad continua para crear una barrera húmeda de 800 metros lineales.'
            },
            {
                advisorId: 'establo_veterinaria',
                time: '10:23 AM',
                tag: 'PROTECCIÓN GANADERA',
                text: 'Desde el Establo: activamos protocolo de resguardo térmico y humo para el ganado. Confinamos a las terneras en los cobertizos sombreados con ventilación baja para evitar sofocación por pavesas, habilitando bebederos frescos con electrolitos y sales bioactivas.'
            },
            {
                advisorId: 'invernadero_iot',
                time: '10:25 AM',
                tag: 'DOMÓTICA PROTEGIDA',
                text: 'En el Invernadero activo el cierre preventivo de lucarnas cenitales contra pavesas incandescentes y disparo la microaspersión térmica off-grid para amortiguar el delta a 8.2°C sin depender de la red eléctrica general.'
            },
            {
                advisorId: 'cuenca_biologo',
                time: '10:27 AM',
                tag: 'CORREDOR RIPARIO',
                text: 'El bosque nativo de quillay y peumo de la ribera del estero está turgente gracias a la recarga de las napas. Actúa como cortina verde hidrofítica natural. Mantengamos el agua corriendo por el lecho para que la vegetación riparia absorba el calor y retenga las chispas que intente saltar el viento.'
            }
        ],
        consensus: {
            title: 'RESOLUCIÓN UNÁNIME: PROTOCOLO ALFA DE PIRO-RESILIENCIA COMUNITARIA',
            text: 'El Consejo Consultivo consensúa una estrategia combinada en tres escalones: 1) Blindaje micro-predial mediante pastoreo intensivo del Potrero 1, protección de ganado en establo, nebulización térmica en invernadero y sellado de aleros; 2) Activación de bombeo solar fotovoltaico para inundación de la faja perimetral de 45m; 3) Suspensión total de faenas mecánicas mediante ordenanza y apertura del tranque Meniel para carguío aéreo de emergencia.',
            priorityActions: [
                'Inundación preventiva de la faja cortafuegos de 45m durante 4 horas continuas con bombeo solar.',
                'Acuartelamiento de brigada vecinal con 4 motobombas portátiles en el punto de recarga del tranque.',
                'Resguardo del ganado con electrolitos y cierre domótico de lucarnas de invernadero.',
                'Suspensión total de tránsito de maquinaria pesada y uso de soldadoras en los 10 predios.',
                'Verificación de canales de radio VHF 148.500 MHz cada 60 minutos con Bomberos y CONAF.',
                'Monitoreo minuto a minuto de la estación meteorológica Meniel por la Dra. Natalia Oyarzún.'
            ]
        }
    },

    SCENARIO_DROUGHT: {
        id: 'SCENARIO_DROUGHT',
        title: '💧 Estrés Hídrico Estival & Regulación de Turnos en Canal Matriz',
        alertLevel: 'ALERTA AMARILLA HÍDRICA SEVERA',
        contextText: 'En pleno enero, el caudal del Río Longaví cae a 78 m³/s y el Canal Matriz solo recibe 28 L/s de los 42 L/s asignados. Los huertos de arándano y frambuesa están en etapa de maduración de fruta.',
        interventions: [
            {
                advisorId: 'vecinal_administradora',
                time: '09:00 AM',
                tag: 'MARCO REGULATORIO',
                text: 'La Junta de Vigilancia del Río Longaví aplicó el prorrateo de sequía según el artículo 17 del Código de Aguas. Nos corresponden 28 L/s. Si regamos todos a la vez por gravedad, el agua no llegará a las puntas de los canales de Don Manuel y la Familia González.'
            },
            {
                advisorId: 'vecinal_anciano',
                time: '09:04 AM',
                tag: 'REGLA DE SABIDURÍA',
                text: 'Cuando el río se encoge, no hay que pelear por la compuerta. Hay que juntar el agua de noche en los tranques y largarla de día con fuerza para que no se la chupe el zanjón seco. El agua repartida en charquitos se pierde por evaporación.'
            },
            {
                advisorId: 'predio_agricultor',
                time: '09:08 AM',
                tag: 'GESTIÓN DE CUPO',
                text: 'Apoyo a Don Silvestre. En Meniel, nuestros 8 potreros PRV tienen cobertura densa y retienen 36.2% de humedad con el Keyline. Puedo ceder el 100% de mi turno superficial del Canal Matriz durante 5 días seguidos para que los huertos de frambuesa de los vecinos rieguen a fondo.'
            },
            {
                advisorId: 'establo_pastor',
                time: '09:10 AM',
                tag: 'PASTOREO PRV ADAPTATIVO',
                text: 'Desde el pastoreo PRV confirmo: ajusto el Punto Óptimo de Reposo a 48 días en los potreros bajos y pastoreo de noche para no estresar a las vacas con el calor. El bosteo concentrado mantendrá el horizonte orgánico húmedo sin gastar un litro de riego.'
            },
            {
                advisorId: 'predio_electrico',
                time: '09:12 AM',
                tag: 'TECNIFICACIÓN',
                text: 'Además, nuestro tranque de 18.500 m³ está al 94% de capacidad y se recarga con la infiltración subterránea. Podemos entregar 12 L/s presurizados con nuestras bombas solares hacia la matriz de los vecinos en horas de mayor radiación, sin costo de red.'
            },
            {
                advisorId: 'invernadero_agronoma',
                time: '09:14 AM',
                tag: 'NUTRICIÓN & FERTIRRIEGO',
                text: 'En el Invernadero aplicamos bioles supermagro y té de compost con microaspersión nocturna en pulsos cortos. Reducimos el consumo de agua un 40% manteniendo el DPV en 0.95 kPa sin perder cuaja floral.'
            },
            {
                advisorId: 'invernadero_curadora',
                time: '09:15 AM',
                tag: 'GERMOPLASMA RESILIENTE',
                text: 'Las variedades criollas de tomate y poroto pallar que custodiamos tienen memoria de sequía centenaria. Soportan el pulso restringido sin marchitez; comparto plantines rústicos con los vecinos para reemplazar variedades comerciales sedientas.'
            },
            {
                advisorId: 'cuenca_geografo',
                time: '09:16 AM',
                tag: 'BALANCE DE MASA',
                text: 'El cálculo hidráulico demuestra que si acumulamos el turno de 28 L/s durante 12 horas nocturnas en el tranque Meniel y lo soltamos a 56 L/s durante 6 horas diurnas, la eficiencia de conducción sube de 45% a 88%, reduciendo pérdidas por infiltración en el canal de greda.'
            },
            {
                advisorId: 'vecinal_antropologa',
                time: '09:20 AM',
                tag: 'ACUERDO VECINAL',
                text: 'La Mesa de Vecinos valida esta propuesta: Meniel cede agua y presta tranque, y a cambio, los huertos vecinos de frambuesa aportan jornales y fruta para consolidar el packing asociativo de exportación. Es un pacto de reciprocidad territorial perfecto.'
            }
        ],
        consensus: {
            title: 'RESOLUCIÓN UNÁNIME: PACTO DE ROTACIÓN HÍDRICA & EMBALSE NOCTURNO',
            text: 'El Consejo acuerda transformar el turno deficitario continuo de 28 L/s en un sistema de pulsos concentrados mediante el almacenamiento nocturno en el tranque Keyline de Meniel, priorizando el riego de huertos de berries en maduración, protegiendo el germoplasma en invernadero y descansando praderas PRV con mulch.',
            priorityActions: [
                'Almacenar el turno completo del canal matriz en el tranque Keyline de 20:00 a 08:00 hrs.',
                'Liberar pulsos presurizados diurnos con energía solar hacia los Huertos de Arándano y Frambuesa.',
                'Monitoreo cada 30 minutos de la humedad edáfica en las 15 sondas FDR para cortar riego en punto de capacidad de campo.',
                'Aplicación de bioles y resguardo de ecotipos criollos en invernadero con micro-pulsos.',
                'Cierre preventivo de derivaciones secundarias para eliminar filtraciones en tramos no revestidos.',
                'Inscripción del acuerdo en acta notarial y en el registro digital de la DAO de la Mesa.'
            ]
        }
    },

    SCENARIO_FLOOD: {
        id: 'SCENARIO_FLOOD',
        title: '🌊 Crecida Torrencial Histórica del Río Longaví & Resiliencia de Obras',
        alertLevel: 'ALERTA ROJA HIDROLÓGICA (T=50 AÑOS)',
        contextText: 'Un río atmosférico categoría 4 con isoterma cero alta (3.200 msnm) descarga 180 mm en 24 horas sobre la alta cuenca, generando un hidrograma de crecida de 240 m³/s en el Río Longaví.',
        interventions: [
            {
                advisorId: 'cuenca_geografo',
                time: '08:00 AM',
                tag: 'HIDROGRAMA DE CRECIDA',
                text: 'Caudal en estación El Guindo supera los 220 m³/s. El pico de crecida llegará a la zona baja de Retiro en 4 horas. Los sedimentos finos aumentarán el peso específico del agua. Se requiere apertura controlada de vertederos de alivio.'
            },
            {
                advisorId: 'excursion_edafologo',
                time: '08:03 AM',
                tag: 'INFILTRACIÓN & CALICATAS',
                text: 'Monitoreo de calicatas en la cuenca media: el horizonte orgánico con estructura Sq1 está absorbiendo 185 mm/h. El suelo vivo actúa como una esponja biológica de 44.5 t C/ha, impidiendo que el lodo descienda directo al cauce principal.'
            },
            {
                advisorId: 'predio_agricultor',
                time: '08:05 AM',
                tag: 'KEYLINE AMORTIGUADOR',
                text: 'En Meniel, las zanjas Keyline están canalizando la escorrentía de las laderas hacia el tranque de 18.500 m³. El biofiltro de totoras está frenando el barro para que no se colmate el fondo. El ganado está resguardado en la cota alta del Potrero 8.'
            },
            {
                advisorId: 'cuenca_biologo',
                time: '08:10 AM',
                tag: 'VEGETACIÓN RIPARIA',
                text: 'Las totoras y sauces de la ribera están disipando la energía cinética del agua. Si los vecinos respetaron la franja de 15 metros sin arar junto al estero, el suelo no se lavará. El bosque nativo está funcionando como esponja viva.'
            },
            {
                advisorId: 'excursion_conservacionista',
                time: '08:12 AM',
                tag: 'RUTAS DE FAUNA & ESTERO',
                text: 'Cámaras trampa en Quebrada Colliguay muestran que la fauna nativa se desplazó preventivamente a las laderas altas. Corredores biológicos despejados sin alambradas de púas permiten el escape seguro de zorros y güiñas ante la crecida.'
            },
            {
                advisorId: 'predio_carpintera',
                time: '08:15 AM',
                tag: 'SEGURIDAD DE PUENTES',
                text: 'Revisé los pilotes de roble del puente vecinal del camino El Carmen: el agua está a 40 cm del tablero pero la estructura triangular disipa el empuje de los troncos arrastrados. Mantenemos el monitoreo de socavación de estribos.'
            }
        ],
        consensus: {
            title: 'RESOLUCIÓN UNÁNIME: PROTOCOLO DE RETENCIÓN DE CRECIDAS & EVACUACIÓN PREVENTIVA',
            text: 'El tranque Keyline de Meniel y los 3 embalses prediales absorben 32.000 m³ del pico de la crecida, reduciendo el caudal de salida hacia los caminos vecinales en un 18%. Se consolida la faja riparia y la infiltración en calicatas como infraestructura biofísica de retención.',
            priorityActions: [
                'Mantener abiertas las compuertas de disipación Keyline para canalizar excedentes a praderas altas.',
                'Verificación de infiltración y estabilidad de taludes en calicatas por el Dr. Gonzalo Verdugo.',
                'Corte preventivo del tránsito sobre el puente El Carmen mientras el caudal supere los 200 m³/s.',
                'Monitoreo continuo de turbidez y limpieza de rejillas desarenadoras en los marcos partidores.',
                'Inspección de taludes y defensas fluviales con drones al cese de la lluvia torrencial.',
                'Certificación de estabilidad de norias APR por parte del Comité de Agua Potable.'
            ]
        }
    },

    SCENARIO_CARBON: {
        id: 'SCENARIO_CARBON',
        title: '🌿 Transición Agroecológica, PSE & Bonos de Carbono',
        alertLevel: 'OPORTUNIDAD ESTRATÉGICA REGIONAL',
        contextText: 'El Gobierno Regional del Maule y fondos internacionales abren la convocatoria de Pago por Servicios Ecosistémicos (PSE) y certificación de créditos de carbono edáficos bajo estándar Verra / Gold Standard.',
        interventions: [
            {
                advisorId: 'cuenca_biologo',
                time: '11:00 AM',
                tag: 'LÍNEA DE BASE BIOLÓGICA',
                text: 'La métrica en terreno está lista: el manejo regenerativo PRV de Meniel ha incrementado el carbono del suelo a una tasa de 2.4 tCO2e/ha/año. Sumando las 42.5 ha de bosque esclerófilo protegido, el mosaico vecinal captura 380 tCO2e anuales auditables.'
            },
            {
                advisorId: 'excursion_edafologo',
                time: '11:02 AM',
                tag: 'CARBONO ORGÁNICO EN SUELOS',
                text: 'Las muestras no perturbadas con cilindro Kopecky y las calicatas de rewilding certifican 44.5 t C/ha secuestradas en horizonte A, con 6.8% de materia orgánica estable. Esto valida metodologías Verra VM0042 de alta integridad.'
            },
            {
                advisorId: 'vecinal_administradora',
                time: '11:05 AM',
                tag: 'ESTRUCTURACIÓN FINANCIERA',
                text: 'Podemos paquetizar los 10 predios en un único portafolio territorial asociativo. Al presentar 508 ha consolidadas con telemetría de 15 sondas FDR y firmas digitales inmutables, reducimos los costos de auditoría MRV en un 65% y duplicamos el valor por tonelada.'
            },
            {
                advisorId: 'predio_agricultor',
                time: '11:10 AM',
                tag: 'PRODUCCIÓN LIMPIA',
                text: 'El bono de carbono es la recompensa justa por no usar urea ni venenos. Con ese ingreso extra, podemos financiar la compra de semillas polifíticas de trébol y festuca para los vecinos que aún no hacen rotación holística.'
            },
            {
                advisorId: 'establo_conservacionista',
                time: '11:12 AM',
                tag: 'CO-BENEFICIOS DE BIODIVERSIDAD',
                text: 'Al vincular el carbono con créditos de biodiversidad verificados mediante fototrampeo y coexistencia con carnívoros nativos, el valor del portafolio se incrementa un 35% como carbono premium de alto impacto ecosistémico.'
            },
            {
                advisorId: 'vecinal_antropologa',
                time: '11:15 AM',
                tag: 'REPARTO EQUITATIVO',
                text: 'La DAO vecinal votará el reparto de los fondos: 60% directo a cada productor según su captura medida por sensor, y 40% a un fondo común para mantención de caminos, bombas solares comunitarias y becas escolares rurales.'
            }
        ],
        consensus: {
            title: 'RESOLUCIÓN UNÁNIME: CREACIÓN DEL CONGLOMERADO DE CARBONO MAULE SUR',
            text: 'El Consejo acuerda unificar los 10 predios en el primer consorcio agroecológico de la Región del Maule que certifica carbono edáfico y servicios hídricos con telemetría IoT en tiempo real, garantizando un flujo financiero regenerativo de largo plazo.',
            priorityActions: [
                'Ingresar el expediente de pre-factibilidad al estándar Verra VM0042 para carbono en suelos agrícolas.',
                'Instalar 5 sondas FDR adicionales en los predios de Don Manuel y Familia González para completar la malla MRV.',
                'Aprobar en la Mesa Vecinal el reglamento de distribución de dividendos ecológicos mediante Voto DAO.',
                'Vincular los datos de captura al Canva Report Studio para generar el dossier para compradores corporativos ESG.',
                'Firmar el convenio de cooperación científica con la Universidad de Talca para validación de muestras edáficas.'
            ]
        }
    }
};

// Exportar para Node de prueba o uso global en navegador
if (typeof module !== 'undefined') {
    module.exports = { ECOSYSTEM_SERVICES_DATA, ADVISORS_DATA, DEBATE_SCENARIOS };
}


// ═══════════════════════════════════════════════════════════════════════════════
// UI CONTROLLER & MODALS FOR ECOSYSTEM SERVICES & ADVISORS SUITE
// ═══════════════════════════════════════════════════════════════════════════════

let currentEcoFilter = 'all';
let currentDebateScenario = 'SCENARIO_PUELCHE';
let isDebatePlaying = false;
let debateTimer = null;

// Variables de estado del carrusel interactivo de los 18 asesores
let currentAdvisorCarouselFilter = 'all';
let selectedAdvisorInCarouselId = 'predio_agricultor';

function initAdvisorsSuite() {
    initAdvisorCarousel();
    renderEcosystemServicesTable(currentEcoFilter);
    loadDebateScenario(currentDebateScenario);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROLADOR DEL CARRUSEL DE 18 ASESORES (GALPÓN LUMINOSO)
// ═══════════════════════════════════════════════════════════════════════════════
function initAdvisorCarousel() {
    renderAdvisorCarousel();
    selectAdvisorInCarousel(selectedAdvisorInCarouselId);
}

function filterAdvisorCarousel(filterTwin) {
    currentAdvisorCarouselFilter = filterTwin;
    
    // Actualizar estilos de los botones de filtro
    const filterIds = ['all', 'predio', 'invernadero', 'establo', 'excursion', 'cuenca', 'vecinal'];
    filterIds.forEach(id => {
        const btn = document.getElementById(`advFilter-${id}`);
        if (btn) {
            if (id === filterTwin) {
                btn.className = 'adv-filter-btn px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer bg-amber-600 text-white border-amber-600 shadow-sm';
            } else {
                btn.className = 'adv-filter-btn px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer bg-white text-stone-700 border-[#E7DAC6] hover:bg-stone-100';
            }
        }
    });

    // Obtener los asesores del filtro actual (deduplicando en 'all' para no repetir personas)
    let advisorKeys = [];
    if (filterTwin === 'all') {
        const seenNames = new Set();
        Object.keys(ADVISORS_DATA).forEach(k => {
            const adv = ADVISORS_DATA[k];
            if (!seenNames.has(adv.name)) {
                seenNames.add(adv.name);
                advisorKeys.push(k);
            }
        });
    } else {
        advisorKeys = Object.keys(ADVISORS_DATA).filter(k => ADVISORS_DATA[k].twin === filterTwin);
    }

    // Si el asesor actualmente seleccionado no está en la terna/filtro, seleccionar el primero
    if (!advisorKeys.includes(selectedAdvisorInCarouselId) && advisorKeys.length > 0) {
        selectedAdvisorInCarouselId = advisorKeys[0];
    }

    renderAdvisorCarousel();
    selectAdvisorInCarousel(selectedAdvisorInCarouselId);

    // Scroll suave al inicio del track
    const track = document.getElementById('advisorCarouselTrack');
    if (track) track.scrollTo({ left: 0, behavior: 'smooth' });
}

function renderAdvisorCarousel() {
    const track = document.getElementById('advisorCarouselTrack');
    if (!track) return;

    let advisorKeys = [];
    if (currentAdvisorCarouselFilter === 'all') {
        const seenNames = new Set();
        Object.keys(ADVISORS_DATA).forEach(k => {
            const adv = ADVISORS_DATA[k];
            if (!seenNames.has(adv.name)) {
                seenNames.add(adv.name);
                advisorKeys.push(k);
            }
        });
    } else {
        advisorKeys = Object.keys(ADVISORS_DATA).filter(k => ADVISORS_DATA[k].twin === currentAdvisorCarouselFilter);
    }

    track.innerHTML = advisorKeys.map(k => {
        const adv = ADVISORS_DATA[k];
        const isSelected = (k === selectedAdvisorInCarouselId);
        
        // Colores temáticos por Twin
        let borderClass = 'border-[#E7DAC6] hover:border-amber-500 bg-white shadow-md';
        let badgeColor = 'bg-stone-900/80 text-stone-200 border-white/20';
        let accentGlow = 'from-amber-500/10 to-transparent';
        if (adv.twin === 'predio') {
            badgeColor = 'bg-sky-950/80 text-sky-200 border-sky-400/40';
            accentGlow = 'from-sky-500/20 to-transparent';
        } else if (adv.twin === 'invernadero') {
            badgeColor = 'bg-emerald-950/80 text-emerald-200 border-emerald-400/40';
            accentGlow = 'from-emerald-500/20 to-transparent';
        } else if (adv.twin === 'establo') {
            badgeColor = 'bg-amber-950/80 text-amber-200 border-amber-400/40';
            accentGlow = 'from-amber-500/20 to-transparent';
        } else if (adv.twin === 'excursion') {
            badgeColor = 'bg-lime-950/80 text-lime-200 border-lime-400/40';
            accentGlow = 'from-lime-500/20 to-transparent';
        } else if (adv.twin === 'cuenca') {
            badgeColor = 'bg-purple-950/80 text-purple-200 border-purple-400/40';
            accentGlow = 'from-purple-500/20 to-transparent';
        } else if (adv.twin === 'vecinal') {
            badgeColor = 'bg-blue-950/80 text-blue-200 border-blue-400/40';
            accentGlow = 'from-blue-500/20 to-transparent';
        }

        if (isSelected) {
            borderClass = 'border-amber-600 bg-amber-50 shadow-2xl ring-4 ring-amber-500/40 scale-[1.02]';
        }

        return `
            <div onclick="selectAdvisorInCarousel('${k}')" class="shrink-0 w-80 sm:w-96 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group select-none ${borderClass}">
                <!-- Contenedor de la Foto Principal a TAMAÑO COMPLETO (Retrato Artístico de Alta Definición) -->
                <div class="relative w-full h-80 sm:h-96 bg-stone-950 overflow-hidden">
                    <img src="${adv.avatarImg}" alt="${adv.name}" class="w-full h-full object-cover object-top filter contrast-[1.06] brightness-[0.98] group-hover:scale-105 group-hover:brightness-105 transition-all duration-700 ease-out">
                    
                    <!-- Capas de Gradiente Cinematográfico para Máxima Legibilidad -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                    <div class="absolute inset-0 bg-gradient-to-b ${accentGlow}"></div>
                    
                    <!-- Header Flotante sobre la Foto -->
                    <div class="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                        <span class="px-3 py-1.5 rounded-xl text-xs font-mono font-black border backdrop-blur-md shadow-lg ${badgeColor}">
                            ${adv.twinLabel}
                        </span>
                        
                        ${isSelected ? `
                            <span class="px-3 py-1.5 rounded-xl text-xs font-mono font-black bg-amber-500 text-stone-950 shadow-xl flex items-center gap-1.5 ring-2 ring-white/50">
                                <span class="w-2 h-2 rounded-full bg-stone-950 animate-ping"></span>
                                SELECCIONADO
                            </span>
                        ` : `
                            <span class="px-2.5 py-1 rounded-xl bg-black/60 text-white text-[11px] font-mono backdrop-blur-md opacity-80 group-hover:opacity-100 transition-opacity border border-white/10">
                                Toca para ver ↗
                            </span>
                        `}
                    </div>

                    <!-- Faja Inferior sobre la Foto: Nombre, Rol y Cita Principal -->
                    <div class="absolute bottom-4 left-4 right-4 text-white space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="text-xl">${adv.icon}</span>
                            <h4 class="font-serif font-black text-lg sm:text-xl leading-tight drop-shadow-lg text-white">
                                ${adv.name}
                            </h4>
                        </div>
                        <div class="text-xs sm:text-sm font-sans font-semibold text-amber-200 drop-shadow-md">
                            ${adv.role}
                        </div>
                    </div>
                </div>

                <!-- Pie de la Tarjeta con Cita Textual y Especialidad -->
                <div class="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between bg-inherit border-t border-amber-900/10">
                    <p class="text-xs sm:text-sm text-stone-700 font-serif italic line-clamp-2 leading-relaxed">
                        ${adv.quote}
                    </p>

                    <div class="flex items-center justify-between pt-2.5 border-t border-stone-200/80 text-[11px] font-mono">
                        <div class="text-stone-600 truncate max-w-[220px]" title="${adv.specialty}">
                            <b class="text-amber-900">Enfoque:</b> ${adv.specialty.split(',')[0]}
                        </div>
                        <span class="${isSelected ? 'text-amber-800 font-black' : 'text-stone-500 group-hover:text-amber-700'} transition-colors font-bold shrink-0">
                            ${isSelected ? 'Inspeccionando abajo ▼' : 'Ver Ficha Completa ▶'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function selectAdvisorInCarousel(advisorId) {
    selectedAdvisorInCarouselId = advisorId;
    const adv = ADVISORS_DATA[advisorId];
    if (!adv) return;

    // Actualizar estilos activos en las tarjetas del carrusel volviendo a renderizar
    renderAdvisorCarousel();

    // Renderizar la tarjeta de información detallada inferior
    const detail = document.getElementById('advisorDetailCard');
    if (!detail) return;

    let twinBadge = 'bg-stone-100 text-stone-700 border-stone-200';
    if (adv.twin === 'predio') twinBadge = 'bg-sky-50 text-sky-800 border-sky-300';
    else if (adv.twin === 'invernadero') twinBadge = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    else if (adv.twin === 'establo') twinBadge = 'bg-amber-50 text-amber-800 border-amber-300';
    else if (adv.twin === 'excursion') twinBadge = 'bg-lime-50 text-lime-800 border-lime-300';
    else if (adv.twin === 'cuenca') twinBadge = 'bg-purple-50 text-purple-800 border-purple-300';
    else if (adv.twin === 'vecinal') twinBadge = 'bg-blue-50 text-blue-800 border-blue-300';

    detail.innerHTML = `
        <!-- Cabecera de la Ficha del Asesor Seleccionado -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/15 pb-5">
            <div class="flex items-start sm:items-center gap-4">
                <img src="${adv.avatarImg}" alt="${adv.name}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-300 shadow-md shrink-0">
                <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${twinBadge}">
                            ${adv.twinLabel}
                        </span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            ${adv.icon} ASESOR FACILITADO CON IA
                        </span>
                    </div>
                    <h3 class="text-xl sm:text-2xl font-serif font-black text-stone-900">
                        ${adv.name}
                    </h3>
                    <div class="text-xs sm:text-sm font-sans font-medium text-amber-900">
                        ${adv.role}
                    </div>
                    <div class="text-[11px] text-stone-500 font-sans">
                        ${adv.credentials}
                    </div>
                </div>
            </div>

            <!-- Botón Destacado de Consulta Interactivo -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                <button onclick="consultSingleAdvisor('${adv.id}')" class="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]">
                    <span>💬</span> Consultar en Profundidad a ${adv.name.split(' ')[0]}
                </button>
                <button onclick="document.getElementById('advSection-debate')?.scrollIntoView({behavior: 'smooth'})" class="px-3.5 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                    <span>🗣️</span> Al Diálogo
                </button>
            </div>
        </div>

        <!-- Cita & Tesis del Asesor -->
        <div class="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
            <div class="text-[10px] font-mono font-bold text-amber-900 uppercase">
                Tesis Central de Asesoría:
            </div>
            <p class="text-xs sm:text-sm text-stone-800 font-serif italic leading-relaxed">
                ${adv.quote}
            </p>
            <div class="text-xs text-stone-600 font-sans pt-1">
                <b>Especialidad:</b> ${adv.specialty}
            </div>
        </div>

        <!-- Métricas Vivas del Territorio Gestionadas por este Asesor -->
        <div class="space-y-2">
            <div class="text-xs font-mono font-bold text-stone-700 uppercase flex items-center gap-1.5">
                <span>📊</span> Métricas Territoriales Bajo Su Supervisión:
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                ${adv.liveMetrics.map(m => `
                    <div class="p-3 rounded-xl bg-white border border-[#E7DAC6] shadow-sm space-y-1">
                        <div class="text-[10px] text-stone-500 font-sans">${m.label}</div>
                        <div class="text-sm font-bold text-emerald-800 font-mono">${m.value}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Bio y Acciones Recomendadas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div class="p-4 rounded-xl bg-white border border-[#E7DAC6] space-y-2 shadow-sm">
                <div class="text-xs font-serif font-bold text-stone-900 flex items-center gap-1.5">
                    <span>📖</span> Trayectoria & Aporte al Territorio
                </div>
                <p class="text-xs text-stone-600 leading-relaxed font-sans">
                    ${adv.detailedBio}
                </p>
            </div>

            <div class="p-4 rounded-xl bg-white border border-[#E7DAC6] space-y-2 shadow-sm">
                <div class="text-xs font-serif font-bold text-stone-900 flex items-center gap-1.5">
                    <span>⚡</span> Próximas Acciones Recomendadas
                </div>
                <ul class="space-y-1.5 text-xs text-stone-700 font-sans">
                    ${adv.recommendedActions.map(a => `
                        <li class="flex items-start gap-1.5">
                            <span class="text-emerald-600 font-bold">▶</span>
                            <span>${a}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;
}

function scrollAdvisorCarousel(direction) {
    const track = document.getElementById('advisorCarouselTrack');
    if (!track) return;
    const scrollAmount = 360 * direction;
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

function scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function filterEcosystemView(twin) {
    currentEcoFilter = twin;
    const filterBtns = ['all', 'predio', 'establo', 'invernadero', 'excursion', 'vecinal', 'cuenca'];
    filterBtns.forEach(f => {
        const btn = document.getElementById('ecoFilter-' + f);
        if (btn) {
            if (f === twin) {
                btn.className = 'eco-filter-btn active px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 transition-all';
            } else {
                btn.className = 'eco-filter-btn px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition-all';
            }
        }
    });

    renderEcosystemServicesTable(twin);
}

function filterEcosystemMatrix(twin) {
    const btns = document.querySelectorAll('.eco-scale-filter');
    btns.forEach(btn => {
        const text = btn.innerText.toUpperCase();
        if (text.includes(twin)) {
            btn.className = 'eco-scale-filter px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold transition-all cursor-pointer shadow-sm';
        } else {
            btn.className = 'eco-scale-filter px-2.5 py-1 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-amber-50 transition-all cursor-pointer';
        }
    });

    const targetFilter = twin.toLowerCase() === 'all' ? 'all' : twin.toLowerCase();
    renderEcosystemServicesTable(targetFilter);
}

function renderEcosystemServicesTable(twinFilter = 'all') {
    const tbody = document.getElementById('ecosystemMatrixTableBody') || document.getElementById('ecoServicesTableBody');
    if (!tbody) return;

    let items = ECOSYSTEM_SERVICES_DATA || [];
    if (twinFilter && twinFilter !== 'all') {
        items = items.filter(i => i.twin === twinFilter);
    }

    tbody.innerHTML = items.map((item, idx) => {
        let twinBadge = '';
        if (item.twin === 'predio') twinBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-100 text-amber-900 border border-amber-300 font-bold">🏡 Predio</span>';
        else if (item.twin === 'establo') twinBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-200 text-amber-950 border border-amber-400 font-bold">🐄 Establo</span>';
        else if (item.twin === 'invernadero') twinBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">🌿 Invernadero</span>';
        else if (item.twin === 'excursion') twinBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-mono bg-teal-100 text-teal-900 border border-teal-300 font-bold">🥾 Excursión</span>';
        else if (item.twin === 'vecinal') twinBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">🤝 Vecinal</span>';
        else if (item.twin === 'cuenca') twinBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-mono bg-sky-100 text-sky-900 border border-sky-300 font-bold">🏔️ Cuenca</span>';

        let catBadge = '';
        if (item.category === 'provision') catBadge = '<span class="text-amber-800 font-bold font-serif">🍎 Provisión</span>';
        else if (item.category === 'regulation') catBadge = '<span class="text-sky-800 font-bold font-serif">🛡️ Regulación</span>';
        else if (item.category === 'support') catBadge = '<span class="text-emerald-800 font-bold font-serif">🐝 Soporte</span>';
        else if (item.category === 'cultural') catBadge = '<span class="text-purple-800 font-bold font-serif">⚖️ Cultural</span>';

        return `
            <tr class="hover:bg-amber-50/70 transition-colors border-b border-amber-900/10 text-stone-800">
                <td class="p-3 whitespace-nowrap">${twinBadge}</td>
                <td class="p-3 whitespace-nowrap text-[11px]">${catBadge}</td>
                <td class="p-3 text-stone-900">
                    <div class="font-bold text-xs font-serif">${item.title}</div>
                    <div class="text-[10px] text-stone-500 font-mono">${item.scale}</div>
                </td>
                <td class="p-3 text-emerald-800 font-bold text-xs font-mono">${item.indicator}</td>
                <td class="p-3 text-stone-700 text-xs max-w-sm">
                    <div>${item.benefit}</div>
                    <details class="mt-1 text-[10px] font-mono text-amber-800">
                        <summary class="cursor-pointer hover:text-amber-950 font-bold">📖 Ver fórmula biofísica & estado ▾</summary>
                        <div class="p-2 rounded-lg bg-amber-50 border border-amber-200 mt-1 space-y-0.5 text-stone-800">
                            <div>Fórmula: <code class="text-amber-900 font-bold">${item.mathFormula}</code></div>
                            <div>Estado: <b class="text-emerald-700">${item.status}</b></div>
                        </div>
                    </details>
                </td>
                <td class="p-3 text-right font-bold text-amber-900 font-mono text-xs whitespace-nowrap">${item.valueYear}</td>
                <td class="p-3 text-[11px] text-stone-600 whitespace-nowrap">${item.advisor}</td>
            </tr>
        `;
    }).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// AGROTWIN GAMES ENGINE: SIMULADORES DIDÁCTICOS DE LA PLATAFORMA
// ═══════════════════════════════════════════════════════════════════════════

let agroGameGlobalScore = 100;
let agroTreeHealth = 100;

window.switchAgroGameTab = function(tabId) {
    const panels = ['tree', 'predio', 'vecinos', 'cuenca', 'iot'];
    panels.forEach(id => {
        const panel = document.getElementById(`gamePanel-${id}`);
        const btn = document.getElementById(`tabBtn-game-${id}`);
        if (panel) {
            if (id === tabId) {
                panel.classList.remove('hidden');
            } else {
                panel.classList.add('hidden');
            }
        }
        if (btn) {
            if (id === tabId) {
                btn.className = 'px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-cyan-600 text-white shadow-sm';
            } else {
                btn.className = 'px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white text-stone-700 hover:bg-amber-50 border border-amber-200';
            }
        }
    });

    if (tabId === 'iot' && typeof window.loadIoTMission === 'function') {
        window.loadIoTMission('sht45');
    }
};

// ─── JUEGO 1: EL PRINCIPIO ÁRBOL ───────────────────────────────────────────
const TREE_CRISES = [
    {
        title: "🔥 Alerta Roja: Viento Puelche genera foco en Forestal Los Pinos (Vecino Oeste)",
        desc: "Ráfagas de 55 km/h empujan pavesas hacia el límite del Fundo Colliguay. El sensor térmico LoRaWAN marca FWI 82. ¿Cómo gestionas el flujo de datos y respuesta?"
    },
    {
        title: "🌊 Excedente Hídrico: Tranque Predial al 98% de Capacidad (18.100 m³)",
        desc: "Deshielos cordilleranos y lluvias benignas llenan el tranque de Colliguay. El humedal ribereño del vecino requiere recarga estival. ¿Cómo conduces el excedente?"
    },
    {
        title: "❄️ Alerta de Helada Negra (-2.2°C) en Cabecera de Cuenca",
        desc: "Masa de aire polar desciende por el río Longaví. Los frutales del valle están en brotación sensible. ¿Cómo orquestas la alerta preventiva?"
    },
    {
        title: "⚖️ Asignación de Turnos de Riego DGA en Sequía Estival",
        desc: "La Junta de Vigilancia del Río Longaví convoca a repartición de turnos de 42 L/s entre 10 parceleros vecinos. ¿Cómo se procesa la coordinación?"
    }
];

let currentTreeCrisisIdx = 0;

window.generateRandomTreeCrisis = function() {
    currentTreeCrisisIdx = (currentTreeCrisisIdx + 1) % TREE_CRISES.length;
    const crisis = TREE_CRISES[currentTreeCrisisIdx];
    const tEl = document.getElementById('treeCrisisTitle');
    const dEl = document.getElementById('treeCrisisDesc');
    const fEl = document.getElementById('treeGameFeedback');
    if (tEl) tEl.innerText = crisis.title;
    if (dEl) dEl.innerText = crisis.desc;
    if (fEl) {
        fEl.className = 'p-3 rounded-xl bg-stone-100 border border-stone-300 text-xs font-sans text-stone-700 leading-relaxed';
        fEl.innerHTML = '👉 Selecciona una opción para poner a prueba si comprendes el <b>Principio Árbol</b> de AgroTwin.';
    }
};

window.handleTreeGameDecision = function(choice) {
    const feedbackEl = document.getElementById('treeGameFeedback');
    const healthBadge = document.getElementById('treeHealthBadge');
    const scoreBadge = document.getElementById('gameGlobalScoreBadge');
    if (!feedbackEl) return;

    if (choice === 'direct_jump') {
        agroTreeHealth = Math.max(10, agroTreeHealth - 30);
        agroGameGlobalScore = Math.max(0, agroGameGlobalScore - 20);
        feedbackEl.className = 'p-3.5 rounded-xl bg-red-100 border-2 border-red-400 text-xs font-sans text-red-950 leading-relaxed shadow-sm animate-pulse';
        feedbackEl.innerHTML = `
            <div class="font-bold text-red-900 flex items-center gap-1.5 mb-1 text-sm">
                <span>⚠️</span> ERROR ARQUITECTÓNICO: VIOLACIÓN DEL PRINCIPIO ÁRBOL (-30% Salud Sistémica)
            </div>
            <div>
                <b>¿Por qué está mal?</b> Las 6 ramas (Predio, Vecinos, Cuenca, Invernadero, Establo, Excursión) son módulos autónomos e independientes. <b>Nunca deben existir redirecciones directas entre ramas</b> porque se pierde la trazabilidad de telemetría, los 18 Asesores quedan ciegos y se descalibra el balance general. 
                <br><span class="font-mono text-red-800 font-bold mt-1 block">Regla de Oro: Toda coordinación territorial debe reportar al Tronco (Hub Central) y desde el Hub despacharse a las ramas.</span>
            </div>
        `;
    } else if (choice === 'isolate') {
        agroTreeHealth = Math.max(10, agroTreeHealth - 20);
        agroGameGlobalScore = Math.max(0, agroGameGlobalScore - 15);
        feedbackEl.className = 'p-3.5 rounded-xl bg-amber-100 border-2 border-amber-400 text-xs font-sans text-amber-950 leading-relaxed shadow-sm';
        feedbackEl.innerHTML = `
            <div class="font-bold text-amber-900 flex items-center gap-1.5 mb-1 text-sm">
                <span>🔒</span> ERROR ECOSISTÉMICO: LA ILUSIÓN DE LA PARCELA AISLADA (-20% Salud Sistémica)
            </div>
            <div>
                <b>¿Por qué falla?</b> En la naturaleza no existen fronteras impermeables. El fuego no respeta alambrados y el agua escurre ladera abajo. Aislarse en el predio sin cooperar con la Mesa Vecinal ni monitorear la Cuenca condena al predio al colapso cuando sople el viento Puelche.
            </div>
        `;
    } else if (choice === 'sync_hub') {
        agroTreeHealth = Math.min(100, agroTreeHealth + 25);
        agroGameGlobalScore += 50;
        feedbackEl.className = 'p-3.5 rounded-xl bg-emerald-100 border-2 border-emerald-500 text-xs font-sans text-emerald-950 leading-relaxed shadow-md';
        feedbackEl.innerHTML = `
            <div class="font-bold text-emerald-900 flex items-center gap-1.5 mb-1 text-sm">
                <span>🌟</span> ¡EXCELENTE! PRINCIPIO ÁRBOL APLICADO A LA PERFECCIÓN (+50 Puntos Resiliencia)
            </div>
            <div>
                <b>Dinámica correcta:</b> El evento fue canalizado hacia el <b>Tronco (Hub Central)</b>. El Hub consolidó la telemetría, consultó a los 18 Asesores IA (Pirogestión, Hidrología, Suelos, Clima Controlado, Bienestar Animal, Biodiversidad) y generó respuestas sincronizadas para cada rama simultáneamente:
                <ul class="list-disc pl-5 mt-1 space-y-0.5 font-mono text-[11px] text-emerald-900">
                    <li><b>Rama Predio:</b> Ordena humectar fajas por gravedad desde el tranque.</li>
                    <li><b>Rama Vecinos:</b> Envía ganado ovino PRV a pastorear la biomasa seca en la frontera forestal.</li>
                    <li><b>Rama Cuenca:</b> Monitorea estaciones meteorológicas de cabecera para prever duración de ráfagas.</li>
                </ul>
            </div>
        `;
    }

    if (healthBadge) {
        healthBadge.innerText = `Salud Sistémica: ${agroTreeHealth}% ${agroTreeHealth > 70 ? 'Óptima' : (agroTreeHealth > 40 ? 'En Riesgo' : 'Crítica')}`;
        healthBadge.className = `px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${agroTreeHealth > 70 ? 'bg-white text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'}`;
    }
    if (scoreBadge) {
        scoreBadge.innerText = `🏆 Puntos de Resiliencia: ${agroGameGlobalScore}`;
    }
};

// ─── JUEGO 2: DESAFÍO PREDIAL 12.8 HA ──────────────────────────────────────
let predioMoisture = 36.5;
let predioPondM3 = 15200;
let predioForageCm = 18;
let predioCarbon = 2.6;

window.playPredioAction = function(action) {
    const mVal = document.getElementById('predioMoistureVal');
    const mBar = document.getElementById('predioMoistureBar');
    const pVal = document.getElementById('predioPondVal');
    const fVal = document.getElementById('predioForageVal');
    const cVal = document.getElementById('predioCarbonVal');
    const feed = document.getElementById('predioGameFeedback');
    const badge = document.getElementById('predioScoreBadge');

    if (action === 'keyline_infiltrate') {
        predioMoisture = Math.min(48, predioMoisture + 6.2);
        predioPondM3 = Math.max(5000, predioPondM3 - 800);
        if (feed) {
            feed.className = 'p-3 rounded-xl bg-sky-100 border border-sky-300 text-xs font-sans text-sky-950 leading-relaxed';
            feed.innerHTML = `<b>💧 Cosecha de Agua Pasiva (Keyline Yeomans):</b> Se abrieron las compuertas gravitacionales. El agua de las vaguadas se redirigió suavemente al 1% hacia las lomas secas. Humedad subió a <b>${predioMoisture.toFixed(1)}%</b> sin encender una sola motobomba ni gastar un peso en combustible.`;
        }
    } else if (action === 'prv_rotate') {
        predioForageCm = 22;
        predioCarbon += 0.2;
        if (feed) {
            feed.className = 'p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-xs font-sans text-emerald-950 leading-relaxed';
            feed.innerHTML = `<b>🐄 Pastoreo Racional Voisin (PRV):</b> Se movió el ganado al Potrero 4 justo en el <i>Punto Óptimo de Reposo</i>. Los animales comen forraje de alta proteína y depositan bosta que activa la biología del suelo. Carbono aumentó a <b>${predioCarbon.toFixed(1)} tCO2e/ha</b>.`;
        }
    } else if (action === 'apply_bokashi') {
        predioCarbon += 0.3;
        predioMoisture = Math.min(48, predioMoisture + 3.0);
        if (feed) {
            feed.className = 'p-3 rounded-xl bg-amber-100 border border-amber-300 text-xs font-sans text-amber-950 leading-relaxed';
            feed.innerHTML = `<b>🪱 Materia Orgánica Viva (Bokashi):</b> La biofábrica de Zona 1 entregó 4 toneladas de compost fermentado. Cada 1% adicional de materia orgánica en el suelo retiene hasta 140.000 litros extra de agua por hectárea.`;
        }
    } else if (action === 'heatwave_test') {
        if (predioMoisture > 30 && predioForageCm >= 16) {
            predioMoisture = Math.max(26, predioMoisture - 5.5);
            agroGameGlobalScore += 30;
            if (feed) {
                feed.className = 'p-3 rounded-xl bg-emerald-100 border-2 border-emerald-400 text-xs font-sans text-emerald-950 leading-relaxed';
                feed.innerHTML = `<b>☀️ Superaste la Ola de Calor (37°C):</b> La cobertura vegetal densa y el subsolado Keyline mantuvieron el suelo fresco (reserva hídrica <b>${predioMoisture.toFixed(1)}%</b>). Sin estrés térmico en cerezos ni pastizales. ¡Predio biofísicamente resiliente!`;
            }
        } else {
            predioMoisture = Math.max(15, predioMoisture - 12);
            if (feed) {
                feed.className = 'p-3 rounded-xl bg-red-100 border-2 border-red-400 text-xs font-sans text-red-950 leading-relaxed';
                feed.innerHTML = `<b>⚠️ Estrés Hídrico Severo:</b> El suelo no tenía suficiente humedad acumulada ni cobertura forrajera. La evapotranspiración secó la capa superficial (humedad cayó a <b>${predioMoisture.toFixed(1)}%</b>). Recuerda infiltrar con Keyline antes de los eventos extremos.`;
            }
        }
    }

    if (mVal) mVal.innerText = `${predioMoisture.toFixed(1)}%`;
    if (mBar) mBar.style.width = `${Math.min(100, predioMoisture * 2)}%`;
    if (pVal) pVal.innerText = `${predioPondM3.toLocaleString()} m³`;
    if (fVal) fVal.innerText = `${predioForageCm} cm`;
    if (cVal) cVal.innerText = `${predioCarbon.toFixed(1)} tCO2e/ha`;
    if (badge) {
        const score = Math.round((predioMoisture * 1.5) + (predioCarbon * 15));
        badge.innerText = `Balance Biofísico: ${Math.min(100, score)}/100`;
    }
};

// ─── JUEGO 3: LA MESA VECINAL ──────────────────────────────────────────────
let vecinosActions = {
    graze: false,
    wet: false,
    lorawan: false
};

window.playVecinosAction = function(act) {
    const feed = document.getElementById('vecinosGameFeedback');
    if (act === 'graze_firebreak') {
        vecinosActions.graze = true;
        if (feed) feed.innerHTML = `✅ <b>Pastoreo Silvopastoril Activado:</b> 40 ovejas de Colliguay pastorean la franja de 45 metros entre el bosque de pinos y las parcelas. Consumen 800 kg de forraje seco fino (pastizal que de otro modo ardería como pólvora).`;
    } else if (act === 'wet_firebreak') {
        vecinosActions.wet = true;
        if (feed) feed.innerHTML = `✅ <b>Humectación por Gravedad Activada:</b> Desde el tranque de Colliguay se bombea agua por caída natural hacia los aspersores de la faja de amortiguación. El suelo y el follaje alcanzan 60% de contenido de humedad.`;
    } else if (act === 'lorawan_alert') {
        vecinosActions.lorawan = true;
        if (feed) feed.innerHTML = `✅ <b>Red LoRaWAN Sincronizada:</b> Los sensores térmicos e infrarrojos del predio transmiten datos cada 30 segundos al grupo de WhatsApp comunal y al retén de bomberos de Parral.`;
    }
    feed.className = 'p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs font-sans text-amber-900 leading-relaxed';
};

window.evaluateVecinosFireDefense = function() {
    const feed = document.getElementById('vecinosGameFeedback');
    const badge = document.getElementById('vecinosFwiBadge');
    const count = (vecinosActions.graze ? 1 : 0) + (vecinosActions.wet ? 1 : 0) + (vecinosActions.lorawan ? 1 : 0);

    if (count >= 2) {
        if (badge) {
            badge.innerText = 'Piro-Riesgo FWI: 24 Bajo (Fuego Sofocado)';
            badge.className = 'px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300';
        }
        agroGameGlobalScore += 50;
        if (feed) {
            feed.className = 'p-3.5 rounded-xl bg-emerald-100 border-2 border-emerald-500 text-xs font-sans text-emerald-950 leading-relaxed shadow-md';
            feed.innerHTML = `
                <div class="font-bold text-emerald-900 text-sm mb-1">🎉 ¡VICTORIA COMUNITARIA! EL BIO-CORTAFUEGOS FRENÓ LAS LLAMAS</div>
                <div>
                    El fuego avanzó a gran velocidad por el pinar vecino, pero al chocar contra la <b>faja de 45m pastoreada y húmeda</b>, se quedó sin combustible fino y se extinguió por sí solo. Ninguna casa sufrió daños. 
                    <br><b class="font-mono text-emerald-800">Lección de La Mesa:</b> La agroecología y los monocultivos forestales sólo sobreviven si construyen zonas de amortiguación colaborativas.
                </div>
            `;
        }
    } else {
        if (feed) {
            feed.className = 'p-3.5 rounded-xl bg-red-100 border-2 border-red-400 text-xs font-sans text-red-950 leading-relaxed shadow-sm';
            feed.innerHTML = `
                <div class="font-bold text-red-900 text-sm mb-1">🔥 DEFENSA INSUFICIENTE: EL FUEGO CRUZÓ EL LINDERO</div>
                <div>
                    Solo activaste ${count} de las 3 medidas de protección. El pasto seco del deslinde prendió con pavesas voladoras. 
                    <br>Debes coordinar al menos <b>el pastoreo de choque</b> y <b>la humectación con agua del tranque</b> para que el bio-cortafuegos sea impenetrable.
                </div>
            `;
        }
    }
};

// ─── JUEGO 4: EL CERRO & CUENCA ────────────────────────────────────────────
window.playCuencaSeason = function(season) {
    const feed = document.getElementById('cuencaGameFeedback');
    const badge = document.getElementById('cuencaStatusBadge');
    if (!feed) return;

    if (season === 'spring_melt') {
        if (badge) badge.innerText = 'Seguridad Hídrica: 98% (Recarga de Acuíferos)';
        feed.className = 'p-3.5 rounded-xl bg-cyan-50 border border-cyan-300 text-xs font-sans text-cyan-950 leading-relaxed';
        feed.innerHTML = `
            <b>❄️ Primavera Andina:</b> El deshielo en la cabecera del Longaví aporta 140 m³/s. En vez de canalizar a velocidad destructiva, se abren meandros para recargar los acuíferos subterráneos aluviales. El Fundo Colliguay recibe la confirmación satelital en el Hub de que el verano tendrá 100% de agua asegurada.
        `;
    } else if (season === 'summer_drought') {
        if (badge) badge.innerText = 'Seguridad Hídrica: 85% (Turnos Solidarios DGA)';
        feed.className = 'p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-sans text-amber-950 leading-relaxed';
        feed.innerHTML = `
            <b>☀️ Verano & Turnos Solidarios:</b> El río baja a 18 m³/s. A través de la Mesa Vecinal, Colliguay entrega 12 horas de su turno nocturno a los viñateros patrimoniales del secano. Gracias a la retención previa en el tranque Keyline, el fundo no sufre pérdidas y se fortalece la paz comunitaria del valle.
        `;
    } else if (season === 'winter_flood') {
        if (badge) badge.innerText = 'Seguridad Hídrica: 92% (Amortiguación TWI)';
        feed.className = 'p-3.5 rounded-xl bg-blue-50 border border-blue-300 text-xs font-sans text-blue-950 leading-relaxed';
        feed.innerHTML = `
            <b>🌧️ Invierno de Temporales:</b> Precipitaciones de 90 mm en 24 horas. Los bosques riparios de peumo, boldo y quillay del estero Colliguay disipan la energía cinética del agua, reteniendo sedimentos y previniendo la socavación de caminos comunales.
        `;
    }
};

// ─── JUEGO 5: TALLER TUTORIAL DE CABLEADO IOT & ESP32 ──────────────────────
const IOT_MISSIONS = {
    sht45: {
        title: "MISIÓN 1: Sensor de Clima Digital SHT45 (Bulbo Húmedo & Heladas)",
        sensorName: "Sensirion SHT45 (±0.1°C)",
        protocol: "I2C Bus (0x44)",
        wires: [
            { id: 'w1', label: 'VCC ➔ 3V3', color: '#ef4444', connected: false, critical: true, tip: 'Alimenta el sensor. NUNCA a 5V o quemarás el chip Sensirion.' },
            { id: 'w2', label: 'GND ➔ GND', color: '#1e293b', connected: false, critical: true, tip: 'Tierra común de referencia para evitar ruido en la medición.' },
            { id: 'w3', label: 'SDA ➔ GPIO 21', color: '#38bdf8', connected: false, critical: true, tip: 'Línea de datos serie I2C (Serial Data).' },
            { id: 'w4', label: 'SCL ➔ GPIO 22', color: '#facc15', connected: false, critical: true, tip: 'Reloj de sincronización I2C a 100 kHz (Serial Clock).' }
        ],
        steps: [
            '<b>Paso 1:</b> Conecta <b>GND</b> primero para descargar la estática de tus manos.',
            '<b>Paso 2:</b> Une <b>3V3</b> con el pin VCC del módulo (verifica con un tester).',
            '<b>Paso 3:</b> Conecta los pines I2C: <b>SDA a GPIO 21</b> y <b>SCL a GPIO 22</b>.',
            '<b>Paso 4:</b> Monta el sensor a 1.2 m en abrigo de lamas blancas para calcular el Bulbo Húmedo Stull.'
        ],
        proTip: '💡 REGLA DE ORO DE TERRENO: Un sensor bajo el sol directo mide hasta +7°C más que la realidad. Usa siempre un Radiation Shield ventilado.'
    },
    fdr: {
        title: "MISIÓN 2: Sonda FDR Multinivel de Suelo (RS485 Modbus)",
        sensorName: "Sonda FDR 3 Niveles (20, 40, 60cm)",
        protocol: "RS485 Half-Duplex",
        wires: [
            { id: 'w1', label: '12V VCC ➔ MOSFET VOUT', color: '#ef4444', connected: false, critical: true, tip: 'Alimentación de 12V conmutable para no descargar la batería LiFePO4.' },
            { id: 'w2', label: 'GND ➔ GND Común', color: '#1e293b', connected: false, critical: true, tip: 'Malla de tierra del cable blindado.' },
            { id: 'w3', label: 'Línea A (+) ➔ MAX485 Pin A', color: '#22c55e', connected: false, critical: true, tip: 'Línea diferencial no inversora del bus RS485.' },
            { id: 'w4', label: 'Línea B (-) ➔ MAX485 Pin B', color: '#38bdf8', connected: false, critical: true, tip: 'Línea diferencial inversora del bus RS485.' },
            { id: 'w5', label: 'MAX485 RO ➔ GPIO 16 (Rx)', color: '#a855f7', connected: false, critical: true, tip: 'Entrada UART del ESP32 para recibir tramas Modbus.' },
            { id: 'w6', label: 'MAX485 DI ➔ GPIO 17 (Tx)', color: '#ec4899', connected: false, critical: true, tip: 'Salida UART para enviar consulta Modbus.' },
            { id: 'w7', label: 'MAX485 RE/DE ➔ GPIO 4', color: '#f59e0b', connected: false, critical: true, tip: 'Pin de dirección (HIGH = Tx, LOW = Rx).' }
        ],
        steps: [
            '<b>Paso 1:</b> El bus RS485 usa señal diferencial (A y B) para tolerar hasta 1.200 m de cable.',
            '<b>Paso 2:</b> Conecta la resistencia terminal de 120 Ω entre A y B para evitar rebote de señal.',
            '<b>Paso 3:</b> Cablea UART2 hacia el transceptor MAX485 (RO a Rx, DI a Tx).',
            '<b>Paso 4:</b> Alimenta la sonda con 12V sólo 2 segundos antes de cada lectura para ahorrar energía.'
        ],
        proTip: '💡 REGLA DE ORO DE TERRENO: Usa cable de par trenzado apantallado (STP Cat 5/6). Si el cable va cerca de bombas trifásicas, conecta la malla a tierra en un solo extremo.'
    },
    relays: {
        title: "MISIÓN 3: Banco de Relés Optoacoplados (Electroválvulas & Bomba)",
        sensorName: "Módulo 4 Relés SPDT Songle 10A",
        protocol: "GPIO Push-Pull Active-LOW",
        wires: [
            { id: 'w1', label: '5V Bobinas ➔ Fuente Externa 5V', color: '#ef4444', connected: false, critical: true, tip: 'Las bobinas consumen 300 mA. Nunca alimentarlas desde el pin 3V3 del ESP32.' },
            { id: 'w2', label: 'GND ➔ GND Común', color: '#1e293b', connected: false, critical: true, tip: 'Retirar jumper JD-VCC para aislamiento galvánico 100% puro.' },
            { id: 'w3', label: 'IN1 (Bomba Pozo) ➔ GPIO 25', color: '#f59e0b', connected: false, critical: true, tip: 'Control de arrancador suave pozo profundo.' },
            { id: 'w4', label: 'IN2 (Válvula Goteo) ➔ GPIO 26', color: '#10b981', connected: false, critical: true, tip: 'Apertura electroválvula 24VAC sector cerezos.' },
            { id: 'w5', label: 'IN3 (Aspersión Helada) ➔ GPIO 14', color: '#06b6d4', connected: false, critical: true, tip: 'Interbloqueado por software si Bulbo Húmedo < -0.5°C.' }
        ],
        steps: [
            '<b>Paso 1:</b> Retira el jumper "JD-VCC" para aislar los transitorios de los motores.',
            '<b>Paso 2:</b> Conecta 5V externa a JD-VCC para energizar las bobinas electromagnéticas.',
            '<b>Paso 3:</b> Conecta los pines de control a GPIOs sin bootstrap (evita GPIO 0, 2 o 12).',
            '<b>Paso 4:</b> Configura lógica Active-LOW: LOW activa el relé, HIGH lo apaga.'
        ],
        proTip: '💡 REGLA DE SEGURIDAD: Coloca siempre un diodo flyback o snubber RC en paralelo con las electroválvulas para absorber el pico inductivo que resetea el microcontrolador.'
    },
    phytos: {
        title: "MISIÓN 4: Sensor de Mojamiento Foliar (PHYTOS-31 Mills)",
        sensorName: "METER PHYTOS-31 Dieléctrico",
        protocol: "Analógico ADC (0 a 3300 mV)",
        wires: [
            { id: 'w1', label: 'Blanco (VCC) ➔ 3V3 Conmutable', color: '#ef4444', connected: false, critical: true, tip: 'Alimentación ultra baja de miliamperios.' },
            { id: 'w2', label: 'Negro (GND) ➔ GND Analógico', color: '#1e293b', connected: false, critical: true, tip: 'Tierra analógica libre de ruido.' },
            { id: 'w3', label: 'Rojo (Señal) ➔ GPIO 34 (ADC1_CH6)', color: '#10b981', connected: false, critical: true, tip: 'Voltaje proporcional a la película de agua (<450mV seco, >600mV mojado).' }
        ],
        steps: [
            '<b>Paso 1:</b> El sensor mide el cambio dieléctrico del agua líquida sobre la rejilla.',
            '<b>Paso 2:</b> Usa un canal ADC1 (GPIO 34 a 39) para que funcione en simultáneo con el Wi-Fi/LoRa.',
            '<b>Paso 3:</b> Instala la hoja artificial en un soporte a 45° mirando al norte simulando el follaje.',
            '<b>Paso 4:</b> Si acumulas > 8 horas mojadas con T > 15°C, activa la alerta de Botrytis cinerea.'
        ],
        proTip: '💡 REGLA DE TERRENO: Nunca limpies la hoja con solventes o esponjas abrasivas; el biofilm natural se lava sólo con agua destilada y un trapo de algodón.'
    }
};

let currentIoTMissionKey = 'sht45';

window.loadIoTMission = function(missionKey) {
    currentIoTMissionKey = missionKey;
    const mission = IOT_MISSIONS[missionKey];
    if (!mission) return;

    // Resetear conexiones
    mission.wires.forEach(w => w.connected = false);

    // Actualizar botones de misión
    ['sht45', 'fdr', 'relays', 'phytos'].forEach(k => {
        const b = document.getElementById(`btnMission-${k}`);
        if (b) {
            if (k === missionKey) {
                b.className = 'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer bg-cyan-600 text-white shadow-sm flex items-center gap-1.5';
            } else {
                b.className = 'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer bg-white text-stone-700 border border-stone-300 hover:bg-cyan-50 flex items-center gap-1.5';
            }
        }
    });

    const titleEl = document.getElementById('iotMissionTitle');
    const sensorNameEl = document.getElementById('iotSensorName');
    const espPinsEl = document.getElementById('iotEspPinsContainer');
    const wiresEl = document.getElementById('iotWiresContainer');
    const sensorPinsEl = document.getElementById('iotSensorPinsContainer');
    const stepListEl = document.getElementById('iotTutorialStepList');
    const proTipEl = document.getElementById('iotProTipContainer');
    const feedbackEl = document.getElementById('iotCircuitFeedback');

    if (titleEl) titleEl.innerText = mission.title;
    if (sensorNameEl) sensorNameEl.innerText = mission.sensorName;

    // Pines ESP32
    if (espPinsEl) {
        espPinsEl.innerHTML = mission.wires.map((w, idx) => {
            const espPin = w.label.split('➔')[1]?.trim() || `Pin ${idx+1}`;
            return `
                <div class="p-1.5 rounded bg-stone-950 border border-stone-800 flex items-center justify-between">
                    <span class="text-stone-300">${espPin}</span>
                    <span class="w-2.5 h-2.5 rounded-full" style="background: ${w.color}; box-shadow: 0 0 6px ${w.color};"></span>
                </div>
            `;
        }).join('');
    }

    // Botones de Cables Interactivos
    if (wiresEl) {
        wiresEl.innerHTML = mission.wires.map(w => `
            <button onclick="toggleIoTWire('${w.id}')" id="wireBtn-${w.id}" class="w-full py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border flex items-center justify-between gap-1 bg-stone-900 border-stone-700 text-stone-400 hover:border-cyan-400">
                <span class="truncate">${w.label}</span>
                <span id="wireStatus-${w.id}" class="text-[9px] px-1 rounded bg-stone-800">OFF</span>
            </button>
        `).join('');
    }

    // Pines Sensor
    if (sensorPinsEl) {
        sensorPinsEl.innerHTML = mission.wires.map((w, idx) => {
            const sensorPin = w.label.split('➔')[0]?.trim() || `Pin ${idx+1}`;
            return `
                <div class="p-1.5 rounded bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-between">
                    <span class="w-2.5 h-2.5 rounded-full" style="background: ${w.color}; box-shadow: 0 0 6px ${w.color};"></span>
                    <span class="text-cyan-200">${sensorPin}</span>
                </div>
            `;
        }).join('');
    }

    // Tutoría paso a paso
    if (stepListEl) {
        stepListEl.innerHTML = mission.steps.map(s => `
            <div class="p-2 rounded-lg bg-white border border-amber-200 leading-snug">
                ${s}
            </div>
        `).join('');
    }

    if (proTipEl) {
        proTipEl.innerHTML = mission.proTip;
    }

    if (feedbackEl) {
        feedbackEl.className = 'p-3 rounded-xl bg-stone-900 border border-stone-700 text-xs font-sans text-stone-300 leading-relaxed';
        feedbackEl.innerHTML = '👉 Haz clic en cada cable en el panel central para conectarlo entre el sensor y el ESP32. Cuando termines, presiona <b>⚡ Probar Conexión & Encender</b>.';
    }
};

window.toggleIoTWire = function(wireId) {
    const mission = IOT_MISSIONS[currentIoTMissionKey];
    if (!mission) return;
    const wire = mission.wires.find(w => w.id === wireId);
    if (!wire) return;

    wire.connected = !wire.connected;

    const btn = document.getElementById(`wireBtn-${wireId}`);
    const status = document.getElementById(`wireStatus-${wireId}`);

    if (btn && status) {
        if (wire.connected) {
            btn.className = 'w-full py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border flex items-center justify-between gap-1 bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-sm';
            status.innerText = 'CONECTADO ✓';
            status.className = 'text-[9px] px-1 rounded bg-emerald-800 text-white font-bold';
        } else {
            btn.className = 'w-full py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border flex items-center justify-between gap-1 bg-stone-900 border-stone-700 text-stone-400 hover:border-cyan-400';
            status.innerText = 'OFF';
            status.className = 'text-[9px] px-1 rounded bg-stone-800 text-stone-400';
        }
    }
};

window.testIotCircuit = function() {
    const mission = IOT_MISSIONS[currentIoTMissionKey];
    const feedbackEl = document.getElementById('iotCircuitFeedback');
    const badgeEl = document.getElementById('iotScoreBadge');
    if (!mission || !feedbackEl) return;

    const unconnected = mission.wires.filter(w => !w.connected);

    if (unconnected.length === 0) {
        agroGameGlobalScore += 40;
        const globalScoreBadge = document.getElementById('gameGlobalScoreBadge');
        if (globalScoreBadge) globalScoreBadge.innerText = `🏆 Puntos de Resiliencia: ${agroGameGlobalScore}`;

        if (badgeEl) {
            badgeEl.innerText = 'Circuito: 100% OPERATIVO ✓ (Telemetría Viva)';
            badgeEl.className = 'px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300';
        }

        feedbackEl.className = 'p-3.5 rounded-xl bg-emerald-950/90 border-2 border-emerald-500 text-xs font-sans text-emerald-200 leading-relaxed shadow-lg';
        feedbackEl.innerHTML = `
            <div class="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                <span>⚡</span> ¡ENLACE EXITOSO! TELEMETRÍA IOT OPERANDO EN CAMPO (+40 Pts)
            </div>
            <div>
                Todos los terminales están aislados y con los voltajes nominales correctos. El ESP32 leyó el bus <b>${mission.protocol}</b> con 0 errores de CRC.
                <br><span class="font-mono text-emerald-300 mt-1 block">Trama Recibida: [ID: ${mission.sensorName.split(' ')[0]} | STATUS: OK | RSSI: -68 dBm | VAL: NOMINAL]</span>
            </div>
        `;
    } else {
        if (badgeEl) {
            badgeEl.innerText = `Circuito Incompleto (${unconnected.length} cables sueltos)`;
            badgeEl.className = 'px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300';
        }

        feedbackEl.className = 'p-3.5 rounded-xl bg-red-950/90 border-2 border-red-500 text-xs font-sans text-red-200 leading-relaxed';
        feedbackEl.innerHTML = `
            <div class="font-bold text-red-300 text-sm mb-1">⚠️ ERROR DE CIRCUITO ABIERTO</div>
            <div>
                Faltan por conectar <b>${unconnected.length} terminal(es)</b>: ${unconnected.map(w => `<span class="font-mono underline">${w.label}</span>`).join(', ')}. 
                <br>Revisa los pasos del tutor a la derecha y conecta todos los cables para probar el encendido.
            </div>
        `;
    }
};

function loadDebateScenario(scenarioKey) {
    currentDebateScenario = scenarioKey;
    const scenario = DEBATE_SCENARIOS[scenarioKey];
    if (!scenario) return;

    if (debateTimer) {
        clearInterval(debateTimer);
        debateTimer = null;
    }
    isDebatePlaying = false;

    const timeline = document.getElementById('debateMessagesContainer') || document.getElementById('debateTimelineContainer');
    if (timeline) {
        timeline.innerHTML = `
            <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-stone-900 space-y-1 mb-2 shadow-sm">
                <div class="flex items-center justify-between">
                    <b class="text-xs uppercase tracking-wider font-serif text-amber-900">${scenario.title}</b>
                    <span class="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 text-[9px] font-bold font-mono">${scenario.alertLevel}</span>
                </div>
                <p class="text-[11px] text-stone-700 font-sans leading-relaxed">${scenario.contextText}</p>
                <div class="text-[10px] text-amber-800 font-mono pt-1">▶ Haz clic en "Reproducir" para escuchar a los 18 asesores deliberar.</div>
            </div>
        `;

        scenario.interventions.forEach((msg, idx) => {
            const adv = ADVISORS_DATA[msg.advisorId];
            if (!adv) return;
            const bubble = document.createElement('div');
            bubble.className = 'p-3.5 rounded-xl bg-white border border-amber-200 space-y-2 hover:border-amber-400 transition-all shadow-sm';
            bubble.innerHTML = `
                <div class="flex items-center justify-between border-b border-amber-100 pb-1.5">
                    <div class="flex items-center gap-2">
                        <span class="text-base">${adv.icon}</span>
                        <div>
                            <span class="font-bold text-stone-900 text-xs font-serif">${adv.name}</span>
                            <span class="text-[10px] text-amber-800 font-mono ml-1.5">• ${adv.role}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-1.5 py-0.5 rounded text-[8px] font-mono bg-amber-100 text-amber-900 uppercase font-bold border border-amber-200">${msg.tag}</span>
                        <span class="text-[10px] text-stone-500 font-mono">${msg.time}</span>
                    </div>
                </div>
                <p class="text-xs text-stone-700 font-sans leading-relaxed">
                    ${msg.text}
                </p>
            `;
            timeline.appendChild(bubble);
        });
    }

    const consensusText = document.getElementById('debateConsensusText');
    if (consensusText && scenario.consensus) {
        consensusText.innerHTML = `
            <div class="space-y-2">
                <p class="font-semibold text-stone-900 font-serif">${scenario.consensus.text}</p>
                <div class="pt-2 border-t border-amber-200">
                    <span class="text-[10px] font-mono uppercase text-amber-800 font-bold block mb-1">5 Acciones Inmediatas Consensuadas:</span>
                    <ul class="space-y-1 text-[11px] text-stone-700 font-sans">
                        ${scenario.consensus.priorityActions.map(a => `<li class="flex items-start gap-1.5"><span class="text-emerald-700 font-bold">✔</span> <span>${a}</span></li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
}

function startInteractiveDebate() {
    const scenario = DEBATE_SCENARIOS[currentDebateScenario];
    if (!scenario) return;

    const timeline = document.getElementById('debateTimelineContainer');
    if (!timeline) return;

    timeline.innerHTML = `
        <div class="p-3 rounded-xl bg-black/70 border border-amber-500/30 text-amber-200 space-y-1 mb-2">
            <div class="flex items-center justify-between">
                <b class="text-xs uppercase tracking-wider">${scenario.title}</b>
                <span class="px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-300 text-[9px] font-bold">${scenario.alertLevel}</span>
            </div>
            <p class="text-[11px] text-slate-300 font-sans leading-relaxed">${scenario.contextText}</p>
        </div>
    `;

    let step = 0;
    if (debateTimer) clearInterval(debateTimer);

    function addNext() {
        if (step >= scenario.interventions.length) {
            clearInterval(debateTimer);
            debateTimer = null;
            return;
        }

        const msg = scenario.interventions[step];
        const adv = ADVISORS_DATA[msg.advisorId];
        if (adv) {
            const bubble = document.createElement('div');
            bubble.className = 'p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-1.5 shadow-lg animate-pulse';
            bubble.innerHTML = `
                <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <div class="flex items-center gap-2">
                        <span class="text-base">${adv.icon}</span>
                        <div>
                            <span class="font-bold text-white text-xs">${adv.name}</span>
                            <span class="text-[10px] text-slate-400 font-mono ml-1.5">• ${adv.role}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-1.5 py-0.5 rounded text-[8px] font-mono bg-amber-500/20 text-amber-300 uppercase">${msg.tag}</span>
                        <span class="text-[10px] text-slate-500 font-mono">${msg.time}</span>
                    </div>
                </div>
                <p class="text-xs text-slate-200 font-sans leading-relaxed text-justify">
                    ${msg.text}
                </p>
            `;
            timeline.appendChild(bubble);
            setTimeout(() => bubble.classList.remove('animate-pulse'), 800);
            timeline.scrollTop = timeline.scrollHeight;
        }
        step++;
    }

    addNext();
    debateTimer = setInterval(addNext, 1400);
}

function consultSingleAdvisor(advisorId) {
    const adv = ADVISORS_DATA[advisorId];
    if (!adv) return;

    const modal = document.getElementById('singleAdvisorModal');
    if (!modal) return;

    document.getElementById('singleAdvisorModalIcon').innerText = adv.icon;
    document.getElementById('singleAdvisorModalName').innerText = adv.name;
    document.getElementById('singleAdvisorModalRole').innerText = adv.role;
    document.getElementById('singleAdvisorModalTwin').innerText = adv.twinLabel;
    document.getElementById('singleAdvisorModalCreds').innerText = adv.credentials;
    document.getElementById('singleAdvisorModalSpecialty').innerText = adv.specialty;
    document.getElementById('singleAdvisorModalQuote').innerText = adv.quote;
    document.getElementById('singleAdvisorModalBio').innerText = adv.detailedBio;

    const metricsCont = document.getElementById('singleAdvisorModalMetrics');
    if (metricsCont) {
        metricsCont.innerHTML = adv.liveMetrics.map(m => `
            <div class="p-2 rounded-lg bg-black/50 border border-white/10">
                <span class="text-[10px] text-slate-400 block">${m.label}:</span>
                <span class="text-xs font-bold text-emerald-400 font-mono">${m.value}</span>
            </div>
        `).join('');
    }

    const actionsCont = document.getElementById('singleAdvisorModalActions');
    if (actionsCont) {
        actionsCont.innerHTML = adv.recommendedActions.map(a => `
            <li class="flex items-start gap-1.5 text-xs text-slate-300">
                <span class="text-emerald-400">▶</span> <span>${a}</span>
            </li>
        `).join('');
    }

    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeSingleAdvisorModal() {
    const modal = document.getElementById('singleAdvisorModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function openAllAdvisorsDebateModal() {
    switchMasterView('dashboard');
    switchAdminTab('advisors');
    scrollToSection('advSection-debate');
    startInteractiveDebate();
}

function openCuencaAdvisorsModal() {
    const modal = document.getElementById('cuencaAdvisorsModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeCuencaAdvisorsModal() {
    const modal = document.getElementById('cuencaAdvisorsModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function openMesaAdvisorsModal() {
    const modal = document.getElementById('mesaAdvisorsModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeMesaAdvisorsModal() {
    const modal = document.getElementById('mesaAdvisorsModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function openPredioAdvisorsModal() {
    const modal = document.getElementById('predioAdvisorsModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closePredioAdvisorsModal() {
    const modal = document.getElementById('predioAdvisorsModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function openEstabloAdvisorsModal() {
    const modal = document.getElementById('establoAdvisorsModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeEstabloAdvisorsModal() {
    const modal = document.getElementById('establoAdvisorsModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function openInvernaderoAdvisorsModal() {
    const modal = document.getElementById('invernaderoAdvisorsModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeInvernaderoAdvisorsModal() {
    const modal = document.getElementById('invernaderoAdvisorsModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function openExcursionAdvisorsModal() {
    const modal = document.getElementById('excursionAdvisorsModal') || document.getElementById('incursionAdvisorsModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeExcursionAdvisorsModal() {
    const modal = document.getElementById('excursionAdvisorsModal') || document.getElementById('incursionAdvisorsModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Alias globales para asegurar funcionamiento desde cualquier módulo
window.openModalPredioAdvisors = openPredioAdvisorsModal;
window.openModalCuencaAdvisors = openCuencaAdvisorsModal;
window.openModalMesaAdvisors = openMesaAdvisorsModal;
window.openPredioAdvisorsModal = openPredioAdvisorsModal;
window.openCuencaAdvisorsModal = openCuencaAdvisorsModal;
window.openMesaAdvisorsModal = openMesaAdvisorsModal;

window.openEstabloAdvisorsModal = openEstabloAdvisorsModal;
window.closeEstabloAdvisorsModal = closeEstabloAdvisorsModal;
window.openInvernaderoAdvisorsModal = openInvernaderoAdvisorsModal;
window.closeInvernaderoAdvisorsModal = closeInvernaderoAdvisorsModal;
window.openExcursionAdvisorsModal = openExcursionAdvisorsModal;
window.closeExcursionAdvisorsModal = closeExcursionAdvisorsModal;
window.openIncursionAdvisorsModal = openExcursionAdvisorsModal;
window.closeIncursionAdvisorsModal = closeExcursionAdvisorsModal;

function printTwoPageDossier() {
    window.print();
}

function transferDossierToCanva() {
    const textToAppend = `
# 🌿 INFORME DE RECOMENDACIONES TERRITORIALES (DOSSIER DE 2 PÁGINAS)
**Emisor:** Consejo Consultivo General AgroTwin (18 Asesores IA • 6 Twins)
**Fecha:** ${new Date().toLocaleDateString('es-CL')} • **Código:** AT-2026-18-R2P
**Escalas Integradas:** Predio/Galpón (12.8 ha) ⇄ Establo PRV ⇄ Invernadero Solar ⇄ Excursión Rewilding ⇄ Mesa Vecinal (508 ha) ⇄ Cuenca Longaví (122.070 ha)

---

## PÁGINA 1: BALANCE BIOFÍSICO & SERVICIOS ECOSISTÉMICOS (CICES v5.1 • 6 TWINS)
- **Seguridad Hídrica:** 18.500 m³ en Tranque Keyline • Autonomía 48 días • Caudal Longaví 124.5 m³/s.
- **Piro-Riesgo (Van Wagner):** FWI 24 (Bajo) • Faja cortafuegos de 45m al 90% de firma en los 28 km perimetrales.
- **Ganadería PRV & Establo:** Carga 180 UGM/ha/d • Condición corporal 3.75 • Cero depredación con mastines y Foxlights.
- **Invernadero & Biofábrica:** 1.200 kg Bokashi/sem • DPV 0.95 kPa • 28 ecotipos criollos vivos (94.2% germinación).
- **Excursión & Rewilding:** Calicatas con infiltración 185 mm/h • 44.5 t C/ha • 8 estaciones de fototrampeo (18 sp/mes).
- **Gobernanza DAO & Mesa:** 78% quórum activo con voto cuadrático $C=V^2$ en la Mesa Vecinal de Retiro.

### Matriz de Servicios Ecosistémicos Consolidados (6 Escalas):
1. **🍎 Provisión:** 18 kWp Solar FV (78.4 kWh/d), 8.200 kg MS/ha forraje PRV, leche A2A2, bioinsumos Bokashi, 42 L/s turno matriz, berries ($206M CLP/año).
2. **🛡️ Regulación:** Infiltración 8.4 L/s Keyline, clima solar pasivo delta 8.2°C, esponja de calicatas (185 mm/h), faja cortafuego 45m ($247M CLP/año).
3. **🐝 Soporte:** Ciclaje de nutrientes bovino, lombrices >120/m², fototrampeo de fauna nativa, corredor esclerófilo 84 km ($89M CLP/año).
4. **⚖️ Cultural:** Soberanía campesina, banco 45k semillas criollas, bioindicadores líquenes Usnea, acuerdos DAO y memoria biocultural ($65M CLP/año).

---

## PÁGINA 2: PLAN DE ACCIÓN ESTRATÉGICO & COMPROMISOS DE LOS 18 ASESORES
1. **Faja Cortafuego de 45m (Inmediato - 7 días):** Humectación con pastoreo intensivo y bombeo solar en la frontera silvoagropecuaria. *Responsables: Maestra Laura H., Don Gastón F. & Don Silvestre G.*
2. **Turnos Dinámicos de Canal & Tranque (14 días):** Acumulación nocturna del turno de 28 L/s en tranque Meniel y entrega en pulsos presurizados diurnos. *Responsables: Dr. Fernando A. & Mg. Patricia R.*
3. **Micro-Red Solar a Bombas APR & Invernadero (30 días):** Formalización de entrega de 4.2 kWh/d de excedente solar hacia comités de agua potable y biofábrica. *Responsables: Ing. Rodrigo B. & Dra. Camila M.*
4. **Bioinsumos & Semillas Patrimoniales (45 días):** Distribución de té de compost y 28 ecotipos criollos a los huertos vecinos. *Responsables: Ing. Soledad N. & Doña Carmen Gloria U.*
5. **Calicatas, Fototrampeo & Carbono MRV (60 días):** Certificación de 44.5 t C/ha y monitoreo de mesodepredadores sin caza letal. *Responsables: Dr. Gonzalo V., Ignacio S. & Dr. Marcelo L.*
6. **Postulación CNR Ley 18.450 & Bonos de Carbono (90 días):** Ingreso de carpeta técnica asociativa de 508 ha con 85% de subsidio. *Responsables: Mg. Patricia R. & Dra. Natalia O.*

### Firmas Digitales Certificadas del Consejo General (18 Asesores • 6 Garantes):
- [GARANTE-PREDIAL] Don Belisario Valenzuela / Maestra Laura Henríquez / Ing. Rodrigo Bustamante
- [GARANTE-ESTABLO] Dra. Javiera Montecinos / Don Gastón Fuenzalida / Ignacio Subercaseaux
- [GARANTE-INVERNADERO] Ing. Agr. Soledad Navarrete / Doña Carmen Gloria Uribe / Ing. Rodrigo Bustamante
- [GARANTE-EXCURSION] Dr. Gonzalo Verdugo / Ignacio Subercaseaux / Dr. Marcelo Lagos Riquelme
- [GARANTE-VECINAL] Dra. Camila Morales / Mg. Patricia Retamal / Don Silvestre Gómez
- [GARANTE-CUENCA] Dr. Fernando Albornoz / Dra. Natalia Oyarzún / Dr. Marcelo Lagos Riquelme
`;

    const canvaArea = document.getElementById('canvaReportTextarea');
    if (canvaArea) {
        canvaArea.value += "\n" + textToAppend;
        renderCanvaReport();
    }
    switchMasterView('dashboard');
    switchAdminTab('canva');
    alert("✅ Dossier Ejecutivo de 2 Páginas transferido exitosamente a Canva Report Studio.");
}

function copyDossierMarkdown() {
    const textToCopy = `AT-2026-09-R2P: INFORME DE RECOMENDACIONES TERRITORIALES (DOSSIER DE 2 PÁGINAS)\n...`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert("✅ Resumen del Dossier copiado al portapapeles.");
    });
}


// ═══════════════════════════════════════════════════════════════════════
// FUNCIONES GLOBALES: HUB, DEBATE AUDIO, DOSSIER & PRINT
// ═══════════════════════════════════════════════════════════════════════
window.handleHubAction = function(action) {
    if (!action) return;
    if (action === 'cockpit') {
        switchMasterView('dashboard');
        switchAdminTab('cockpit');
    } else if (action === 'telemetry') {
        switchMasterView('telemetry');
    } else if (action === 'territory') {
        switchMasterView('territory');
        if (typeof refreshAndAutoUpdateMap === 'function') refreshAndAutoUpdateMap();
    } else if (action === 'canva') {
        switchMasterView('dashboard');
        switchAdminTab('canva');
    } else if (action === 'vault') {
        switchMasterView('docs');
    } else if (action === 'advisors') {
        switchMasterView('dashboard');
        switchAdminTab('advisors');
    } else if (action === 'juegos') {
        switchMasterView('juegos');
    } else if (action === 'dossier_satelital') {
        if (typeof openDossierInHub === 'function') {
            openDossierInHub();
        } else {
            if (typeof switchMasterView === 'function') switchMasterView('docs');
            if (typeof switchDocsTab === 'function') switchDocsTab('docs-dossier');
        }
    } else if (action === 'dossier') {
        switchMasterView('dashboard');
        switchAdminTab('advisors');
        setTimeout(() => {
            const ds = document.getElementById('advSection-dossier');
            if (ds) ds.scrollIntoView({ behavior: 'smooth' });
        }, 150);
    } else if (action === 'download_txt') {
        if (typeof downloadIntegratedReport === 'function') downloadIntegratedReport();
    } else if (action === 'export_csv') {
        if (typeof exportParcelsToCSV === 'function') exportParcelsToCSV();
    } else if (action === 'panal') {
        switchMasterView('panal');
    } else if (action === 'cuenca_macro') {
        openPanalFromMesa();
    }
};

window.playDebateAudio = function() {
    const sel = document.getElementById('debateScenarioSelector');
    const scenarioName = sel ? sel.options[sel.selectedIndex].text : 'Debate de Asesores';
    
    // Silenciado: todos los sonidos eliminados
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    
    const container = document.getElementById('debateMessagesContainer');
    if (container) {
        const msgs = container.querySelectorAll('.p-3.5, .rounded-2xl, .galpon-wood-card');
        msgs.forEach((m, idx) => {
            setTimeout(() => {
                m.classList.add('ring-2', 'ring-amber-500', 'bg-amber-50');
                m.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                setTimeout(() => {
                    m.classList.remove('ring-2', 'ring-amber-500', 'bg-amber-50');
                }, 1200);
            }, idx * 600);
        });
    }
};

window.generateDebateDossier = function() {
    const dossierSection = document.getElementById('advSection-dossier');
    if (dossierSection) {
        dossierSection.scrollIntoView({ behavior: 'smooth' });
    }
    const consensusText = document.getElementById('debateConsensusText');
    const dossierConsensus = document.getElementById('dossierDebateConsensusTarget');
    if (consensusText && dossierConsensus) {
        dossierConsensus.innerHTML = consensusText.innerHTML;
    }
};

window.printReportDocument = function() {
    window.print();
};

