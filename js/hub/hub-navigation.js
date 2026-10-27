        // ═══════════════════════════════════════════════════════════════════
        // CONTROLADOR DE VISTAS MAESTRAS (SINGLE-PANE-OF-GLASS)
        // ═══════════════════════════════════════════════════════════════════
        // CONTROLADOR DE NAVEGACIÓN Y VISTAS MAESTRAS (UN SOLO MENÚ SUPERIOR)
        // ═══════════════════════════════════════════════════════════════════
        var currentMasterView = 'landing';
        var currentTerritorialMode = 'mesa';

        // ═══════════════════════════════════════════════════════════════════
        // 💡 CONTROLADOR DE LA AMPOLLETITA: ETIQUETAS DE INTERFAZ & DEBUG TAGS
        // ═══════════════════════════════════════════════════════════════════
        window.isPanelTagsVisible = function() {
            return !document.body.classList.contains('labels-hidden');
        };

        window.syncPanelTagsToIframe = function(visible) {
            try {
                const iframe = document.getElementById('iframePredio');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'SET_PANEL_TAGS_VISIBILITY',
                        visible: visible
                    }, '*');
                }
            } catch (err) {
                console.warn('[Ampolleta] No se pudo sincronizar con iframe de Predio:', err);
            }
        };

        window.updateLightbulbUI = function(visible) {
            const btn = document.getElementById('btnTogglePanelTags');
            const icon = document.getElementById('bulbIcon');
            if (!btn) return;
            if (visible) {
                btn.classList.add('tags-active');
                btn.classList.remove('tags-hidden');
                btn.setAttribute('title', '💡 Etiquetas de interfaz ACTIVAS • Haga clic para ocultarlas (Shift + L)');
                if (icon) icon.textContent = '💡';
            } else {
                btn.classList.remove('tags-active');
                btn.classList.add('tags-hidden');
                btn.setAttribute('title', '🔌 Etiquetas de interfaz OCULTAS • Haga clic para activarlas (Shift + L)');
                if (icon) icon.textContent = '🔌';
            }
        };

        window.togglePanelTags = function(forceState) {
            const currentState = window.isPanelTagsVisible();
            const newState = typeof forceState === 'boolean' ? forceState : !currentState;

            if (newState) {
                document.body.classList.remove('labels-hidden');
            } else {
                document.body.classList.add('labels-hidden');
            }

            try {
                localStorage.setItem('agritwin_panel_tags_hidden', (!newState).toString());
            } catch (e) {}

            window.updateLightbulbUI(newState);
            window.syncPanelTagsToIframe(newState);

            // Toast feedback discreto
            const toast = document.createElement('div');
            toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:rgba(15,23,42,0.92);color:' + (newState ? '#fbbf24' : '#94a3b8') + ';padding:8px 14px;border-radius:10px;font-family:JetBrains Mono,monospace;font-size:11px;font-weight:700;box-shadow:0 10px 25px rgba(0,0,0,0.5);border:1px solid ' + (newState ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)') + ';z-index:99999;display:flex;align-items:center;gap:8px;backdrop-filter:blur(8px);pointer-events:none;transition:all 0.3s ease;';
            toast.innerHTML = '<span>' + (newState ? '💡' : '🔌') + '</span> <span>Etiquetas de Interfaz ' + (newState ? 'ACTIVADAS' : 'OCULTAS') + '</span>';
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px)';
                setTimeout(() => toast.remove(), 300);
            }, 1800);
        };

        // Inicialización del estado de etiquetas al arrancar
        (function initPanelTagsState() {
            function applyInitialTagsState() {
                let isHidden = false;
                try {
                    // Por defecto: visibles a menos que el usuario haya guardado ocultarlas
                    isHidden = localStorage.getItem('agritwin_panel_tags_hidden') === 'true';
                } catch (e) {}

                if (isHidden) {
                    document.body.classList.add('labels-hidden');
                } else {
                    document.body.classList.remove('labels-hidden');
                }
                window.updateLightbulbUI(!isHidden);
                window.syncPanelTagsToIframe(!isHidden);
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', applyInitialTagsState);
            } else {
                applyInitialTagsState();
            }

            // Sincronizar automáticamente cuando el iframe de Predio termine de cargar
            window.addEventListener('load', function() {
                const iframe = document.getElementById('iframePredio');
                if (iframe) {
                    iframe.addEventListener('load', function() {
                        window.syncPanelTagsToIframe(window.isPanelTagsVisible());
                    });
                }
            });

            // Escuchar si el atajo fue presionado desde adentro del iframe
            window.addEventListener('message', function(event) {
                if (event.data && event.data.type === 'PANEL_TAGS_TOGGLED_FROM_IFRAME') {
                    const isVisible = !!event.data.visible;
                    if (isVisible) {
                        document.body.classList.remove('labels-hidden');
                    } else {
                        document.body.classList.add('labels-hidden');
                    }
                    window.updateLightbulbUI(isVisible);
                }
            });

            // Atajo de teclado: Shift + L (o Alt + L) para alternar
            window.addEventListener('keydown', function(e) {
                if ((e.shiftKey || e.altKey) && (e.key === 'L' || e.key === 'l')) {
                    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
                    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
                    e.preventDefault();
                    window.togglePanelTags();
                }
            });
        })();

        // Funciones de acceso directo para el Menú Superior Permanente
        window.toggleDatosDropdown = function(event) {
            if (event) event.stopPropagation();
            const menu = document.getElementById('dropdown-datos-menu');
            if (menu) menu.classList.toggle('hidden');
        };

        window.closeDatosDropdown = function() {
            const menu = document.getElementById('dropdown-datos-menu');
            if (menu) menu.classList.add('hidden');
        };

        window.addEventListener('click', function(e) {
            const container = document.getElementById('dropdown-datos-container');
            if (container && !container.contains(e.target)) {
                window.closeDatosDropdown();
            }
        });

        window.openAdvisorsNav = function() {
            switchMasterView('dashboard');
            switchAdminTab('advisors');
            document.querySelectorAll('.master-nav-btn').forEach(btn => btn.classList.remove('active-nav'));
            document.getElementById('navBtn-datos')?.classList.add('active-nav');
            setTimeout(() => {
                const sec = document.getElementById('advSection-profiles');
                if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        };

        window.openInformesNav = function() {
            switchMasterView('dashboard');
            switchAdminTab('informes');
            document.querySelectorAll('.master-nav-btn').forEach(btn => btn.classList.remove('active-nav'));
            document.getElementById('navBtn-datos')?.classList.add('active-nav');
            setTimeout(() => {
                const sec = document.getElementById('advSection-dossier');
                if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        };

        window.openEcosystemServicesNav = function() {
            switchMasterView('dashboard');
            switchAdminTab('ecosystem');
            document.querySelectorAll('.master-nav-btn').forEach(btn => btn.classList.remove('active-nav'));
            document.getElementById('navBtn-datos')?.classList.add('active-nav');
            setTimeout(() => {
                const sec = document.getElementById('advSection-ecosystem');
                if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        };

        window.openCockpitNav = function() {
            switchMasterView('dashboard');
            switchAdminTab('cockpit');
            document.querySelectorAll('.master-nav-btn').forEach(btn => btn.classList.remove('active-nav'));
            document.getElementById('navBtn-datos')?.classList.add('active-nav');
        };

        window.openTutorialNav = function() {
            switchMasterView('juegos');
        };

        window.openJuegosNav = function() {
            switchMasterView('juegos');
        };

        window.openCuadernoNav = function() {
            switchMasterView('cuaderno');
            document.querySelectorAll('.master-nav-btn').forEach(btn => btn.classList.remove('active-nav'));
            document.getElementById('navBtn-cuaderno')?.classList.add('active-nav');
        };

        window.switchMasterView = switchMasterView;
        function switchMasterView(viewId, mode) {
            if (viewId === 'cuenca') {
                viewId = 'territory';
                if (!mode) mode = 'cerro';
            }
            currentMasterView = viewId;
            if (mode) currentTerritorialMode = mode;
            window.scrollTo(0, 0);
            
            // Ocultar todas las vistas de pantalla completa
            document.querySelectorAll('.master-view').forEach(el => el.classList.remove('active-view'));
            
            // Desactivar todos los botones nav principales
            document.querySelectorAll('.master-nav-btn').forEach(btn => {
                btn.classList.remove('active-nav');
            });

            // Activar botón nav correspondiente en el menú superior unificado
            let targetNavBtnId = 'navBtn-' + viewId;
            if (viewId === 'panal') {
                targetNavBtnId = 'navBtn-panal';
            } else if (viewId === 'dashboard') {
                targetNavBtnId = 'navBtn-cockpit';
            } else if (viewId === 'landing') {
                targetNavBtnId = 'navBtn-landing';
            } else if (viewId === 'telemetry') {
                targetNavBtnId = 'navBtn-telemetry';
            } else if (viewId === 'docs') {
                targetNavBtnId = 'navBtn-docs';
            } else if (viewId === 'cuaderno') {
                targetNavBtnId = 'navBtn-cuaderno';
            } else if (viewId === 'juegos') {
                targetNavBtnId = 'navBtn-tutorial';
            }
            const activeBtn = document.getElementById(targetNavBtnId);
            if (activeBtn) {
                activeBtn.classList.add('active-nav');
            }

            // Controlar visibilidad exclusiva del mapa, panel lateral, barra de estado y overlays de flujos
            const mapEl = document.getElementById('map');
            const flowCanvas = document.getElementById('energyFlowCanvas');
            const autoRefreshBar = document.getElementById('mapAutoRefreshBar');
            const energyHUD = document.getElementById('mapEnergyHUD');
            const sidebar = document.getElementById('territorialSidebar');
            const statusBar = document.getElementById('territorialStatusBar');

            const mapDock = document.getElementById('cuencaMapControlDock');
            const cerroSatNav = document.getElementById('cerroSatelliteSubdeckNav');
            if (viewId === 'territory') {
                if (mapEl) mapEl.style.display = 'block';
                if (flowCanvas) flowCanvas.style.display = 'block';
                if (mapDock) mapDock.style.display = 'flex';
                if (sidebar) {
                    sidebar.style.display = 'flex';
                    const expandBtn = document.getElementById('btnExpandTerritorialSidebar');
                    if (sidebar.classList.contains('sidebar-collapsed')) {
                        sidebar.style.transform = 'translateX(100%)';
                        sidebar.style.pointerEvents = 'none';
                        if (expandBtn) expandBtn.classList.remove('hidden');
                    } else {
                        sidebar.style.transform = 'translateX(0)';
                        sidebar.style.pointerEvents = 'auto';
                        if (expandBtn) expandBtn.classList.add('hidden');
                    }
                }
                if (statusBar) {
                    statusBar.style.display = (currentTerritorialMode === 'cerro') ? 'none' : 'flex';
                }

                const momentsBar = document.getElementById('cuencaMomentsQuickBar');
                const windyScrubber = document.getElementById('cuencaWindyTimelineScrubber');
                if (currentTerritorialMode === 'cerro') {
                    if (cerroSatNav) cerroSatNav.style.display = 'flex';
                    if (momentsBar) momentsBar.style.display = 'flex';
                    if (windyScrubber) windyScrubber.style.display = 'flex';
                    if (sidebar) sidebar.style.top = '98px';
                } else {
                    if (cerroSatNav) cerroSatNav.style.display = 'none';
                    if (momentsBar) momentsBar.style.display = 'none';
                    if (windyScrubber) windyScrubber.style.display = 'none';
                    if (sidebar) sidebar.style.top = '3.5rem';
                }

                if (map) {
                    initObrasGisMarkers();
                    setTimeout(() => {
                        map.invalidateSize(true);
                        if (window.energyFlowEngine) {
                            window.energyFlowEngine.resize();
                            window.energyFlowEngine.resume();
                            window.energyFlowEngine.render();
                        }
                    }, 60);
                    setTimeout(() => {
                        map.invalidateSize(true);
                        if (window.energyFlowEngine) {
                            window.energyFlowEngine.resize();
                            window.energyFlowEngine.resume();
                            window.energyFlowEngine.render();
                        }
                    }, 250);
                }
            } else {
                if (cerroSatNav) cerroSatNav.style.display = 'none';
                const momentsBar = document.getElementById('cuencaMomentsQuickBar');
                const windyScrubber = document.getElementById('cuencaWindyTimelineScrubber');
                const specLegend = document.getElementById('cuencaSpectralLegendWidget');
                const tactLegend = document.getElementById('cuencaTacticalLegendWidget');
                const advCard = document.getElementById('cuencaAdvisorDirectiveCard');
                if (momentsBar) momentsBar.style.display = 'none';
                if (windyScrubber) windyScrubber.style.display = 'none';
                if (specLegend) specLegend.style.display = 'none';
                if (tactLegend) tactLegend.style.display = 'none';
                if (advCard) advCard.style.display = 'none';

                if (mapEl) mapEl.style.display = 'none';
                if (flowCanvas) flowCanvas.style.display = 'none';
                if (mapDock) mapDock.style.display = 'none';
                if (sidebar) sidebar.style.display = 'none';
                if (statusBar) statusBar.style.display = 'none';
                const expandBtn = document.getElementById('btnExpandTerritorialSidebar');
                if (expandBtn) expandBtn.classList.add('hidden');
                closeNeighborDrawer();
                const targetEl = document.getElementById('view-' + viewId);
                if (targetEl) targetEl.classList.add('active-view');
            }

            // Inicializar vistas específicas si es necesario
            if (viewId === 'telemetry') {
                initStudioCharts();
            } else if (viewId === 'docs') {
                initDocsCatalog();
            } else if (viewId === 'mesa') {
                initMesaSuite();
            } else if (viewId === 'dashboard') {
                initCockpitView();
            } else if (viewId === 'cerro') {
                if (window.basinTwin) {
                    window.basinTwin.updateUI();
                }
            } else if (viewId === 'panal') {
                initPanalSuite(mode);
            } else if (viewId === 'cuaderno') {
                if (typeof initHubCuadernoView === 'function') {
                    initHubCuadernoView();
                }
            }

            // El Menú Superior a nivel de Hub se mantiene único, consistente y estable.
            // Las herramientas operativas particulares se despliegan dentro de cada modo (Predio, Cuenca o Vecinal).
            const ctxTools = document.getElementById('contextualTools');
            if (ctxTools) {
                ctxTools.innerHTML = '';
            }
        }

        function toggleCerroCampaignBoard(show) {
            const board = document.getElementById('cerroCampaignBoard');
            const reopenBtn = document.getElementById('btnOpenCerroCampaignBoard');
            if (board) {
                if (show) {
                    board.style.display = 'flex';
                    board.style.opacity = '1';
                    board.style.pointerEvents = 'auto';
                    if (reopenBtn) reopenBtn.style.display = 'none';
                } else {
                    board.style.opacity = '0';
                    board.style.pointerEvents = 'none';
                    setTimeout(() => { board.style.display = 'none'; }, 250);
                    if (reopenBtn) reopenBtn.style.display = 'inline-flex';
                }
            }
        }

        function openCerroCampaignBoard() {
            toggleCerroCampaignBoard(true);
        }

        function openCerroMap() {
            openCerroMapWithTab('tab-territory');
        }

        window.toggleCuencaMapDock = function(show) {
            const flyout = document.getElementById('cuencaMapDockFlyout');
            const arrow = document.getElementById('dockTriggerArrow');
            const label = document.getElementById('dockTriggerLabel');
            if (!flyout) return;
            const shouldOpen = (typeof show === 'boolean') ? show : flyout.classList.contains('hidden');
            if (shouldOpen) {
                flyout.classList.remove('hidden');
                if (arrow) arrow.innerText = '▼';
                if (label) label.innerText = 'Ocultar Menú';
            } else {
                flyout.classList.add('hidden');
                if (arrow) arrow.innerText = '▲';
                if (label) label.innerText = 'Capas & Flujos';
            }
        };

        window.toggleTerritorialSidebar = function(forceOpen) {
            const sidebar = document.getElementById('territorialSidebar');
            const expandBtn = document.getElementById('btnExpandTerritorialSidebar');
            const navStateTag = document.getElementById('navSidebarStateTag');
            const navBtn = document.getElementById('btnNavToggleSidebar');
            if (!sidebar) return;

            const isCollapsed = sidebar.classList.contains('sidebar-collapsed') || sidebar.style.transform === 'translateX(100%)' || sidebar.style.display === 'none';
            const shouldOpen = (typeof forceOpen === 'boolean') ? forceOpen : isCollapsed;

            if (shouldOpen) {
                sidebar.style.display = 'flex';
                sidebar.classList.remove('sidebar-collapsed');
                sidebar.style.transform = 'translateX(0)';
                sidebar.style.pointerEvents = 'auto';
                if (expandBtn) expandBtn.classList.add('hidden');
                if (navStateTag) {
                    navStateTag.innerText = 'ABIERTO';
                    navStateTag.className = 'ml-0.5 text-[8.5px] px-1.5 py-0.2 rounded bg-sky-500/30 text-sky-200 font-mono font-bold';
                }
                if (navBtn) {
                    navBtn.classList.add('bg-sky-500/30');
                    navBtn.classList.remove('bg-slate-900/80');
                }
            } else {
                sidebar.classList.add('sidebar-collapsed');
                sidebar.style.transform = 'translateX(100%)';
                sidebar.style.pointerEvents = 'none';
                if (expandBtn) expandBtn.classList.remove('hidden');
                if (navStateTag) {
                    navStateTag.innerText = 'REPLEGADO';
                    navStateTag.className = 'ml-0.5 text-[8.5px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 font-mono font-bold';
                }
                if (navBtn) {
                    navBtn.classList.remove('bg-sky-500/30');
                    navBtn.classList.add('bg-slate-900/80');
                }
            }

            setTimeout(() => {
                if (map) {
                    map.invalidateSize(true);
                }
                if (window.energyFlowEngine) {
                    window.energyFlowEngine.resize();
                    window.energyFlowEngine.render();
                }
            }, 350);
        };

        function openCerroMapWithTab(tabId) {
            switchMasterView('territory', 'cerro');
            const cerroSatNav = document.getElementById('cerroSatelliteSubdeckNav');
            if (cerroSatNav) cerroSatNav.style.display = 'flex';
            const sidebar = document.getElementById('territorialSidebar');
            if (sidebar) {
                sidebar.style.top = '98px';
                sidebar.style.display = 'flex';
                sidebar.classList.remove('sidebar-collapsed');
                sidebar.style.transform = 'translateX(0)';
            }
            const mapDock = document.getElementById('cuencaMapControlDock');
            if (mapDock) mapDock.style.display = 'flex';
            if (typeof selectSidebarTab === 'function') {
                selectSidebarTab(tabId || 'tab-tiempo');
            }
            const statusModeLabel = document.getElementById('statusModeLabel');
            if (statusModeLabel) {
                statusModeLabel.innerHTML = '🏔️ Modo: Cumbre del Cerro (Macro-Cuenca 122k ha)';
                statusModeLabel.className = 'text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30 whitespace-nowrap';
            }
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                    map.flyTo([-36.2115, -71.6050], 12, { duration: 1.0 });
                }
                if (window.energyFlowEngine) {
                    window.energyFlowEngine.toggles.wind = true;
                    window.energyFlowEngine.resize();
                    window.energyFlowEngine.render();
                }
                const topPill = document.getElementById('hubWindyTopPill');
                if (topPill) topPill.style.display = 'flex';
                const scrubber = document.getElementById('cuencaWindyTimelineScrubber');
                if (scrubber) scrubber.style.display = 'block';
            }, 100);
        }

        // Navegación con Botones a las Vistas Predefinidas de la Cuenca
        function flyToCerroLocation(lat, lng, zoom, name, tabId) {
            switchMasterView('territory', 'cerro');
            if (tabId) selectSidebarTab(tabId);
            const statusModeLabel = document.getElementById('statusModeLabel');
            if (statusModeLabel) {
                statusModeLabel.innerHTML = `🏔️ Locación: ${name}`;
                statusModeLabel.className = 'text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30 whitespace-nowrap';
            }
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                    map.flyTo([lat, lng], zoom, { duration: 1.5 });
                }
            }, 100);
        }

        function openMesaLanding() {
            openMesaMode();
        }

        function toggleMesaCampaignBoard(show) {
            const board = document.getElementById('mesaCampaignBoard');
            const reopenBtn = document.getElementById('btnOpenMesaCampaignBoard');
            if (board) {
                if (show) {
                    board.style.display = 'flex';
                    board.style.opacity = '1';
                    board.style.pointerEvents = 'auto';
                    if (reopenBtn) reopenBtn.style.display = 'none';
                } else {
                    board.style.opacity = '0';
                    board.style.pointerEvents = 'none';
                    setTimeout(() => { board.style.display = 'none'; }, 250);
                    if (reopenBtn) reopenBtn.style.display = 'inline-flex';
                }
            }
        }

        function openMesaCampaignBoard() {
            toggleMesaCampaignBoard(true);
        }

        // Explorar Mosaico Vecinal en Mapa Satelital GIS
        function openMesaMap() {
            switchMasterView('territory', 'mesa');
            selectSidebarTab('tab-territory');
            const statusModeLabel = document.getElementById('statusModeLabel');
            if (statusModeLabel) {
                statusModeLabel.innerHTML = '🤝 Modo: La Mesa de Vecinos (Fronteras & Biomas)';
                statusModeLabel.className = 'text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30';
            }
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                    map.flyTo([-36.21156, -71.60530], 13.5, { duration: 1.5 });
                }
            }, 100);
        }

        // Exportar funciones a window para acceso global
        window.openPredioMode = openPredioMode;
        window.openCerroMode = openCerroMode;
        window.openMesaMode = openMesaMode;
        window.openMesaLanding = openMesaLanding;
        window.openMesaMap = openMesaMap;
        window.toggleCerroCampaignBoard = toggleCerroCampaignBoard;
        window.openCerroCampaignBoard = openCerroCampaignBoard;
        window.toggleMesaCampaignBoard = toggleMesaCampaignBoard;
        window.openMesaCampaignBoard = openMesaCampaignBoard;

        // Coordenadas centroidales para los 10 predios vecinales
        const PREDIO_COORDINATES = {
            'MENIEL': [-36.21156, -71.60530],
            'SAN_JOSE': [-36.2020, -71.6150],
            'LOS_BOLDOS': [-36.2140, -71.5750],
            'RETIRO_PONIENTE': [-36.1920, -71.6350],
            'STA_LUCIA': [-36.2180, -71.5950],
            'MORA_VERDE': [-36.1820, -71.6100],
            'LOS_MAITENES': [-36.2250, -71.5850],
            'DON_VICTOR': [-36.2080, -71.6300],
            'EL_CARMEN': [-36.2150, -71.6400],
            'LA_PALMA': [-36.2300, -71.5700]
        };

        // Selección de predio en la grilla interactiva de La Mesa
        function selectMesaPredio(id) {
            changeFarmerPortfolio(id);
            const sel = document.getElementById('farmerPortfolioSelector');
            if (sel) sel.value = id;
            
            // Resaltar tarjeta seleccionada en la grilla
            document.querySelectorAll('#mesaPrediosButtonGrid > div').forEach(card => {
                card.classList.remove('border-emerald-500', 'bg-emerald-950/30', 'ring-2', 'ring-emerald-500/40');
                card.classList.add('border-white/10');
            });
            const activeCard = document.getElementById('predioBtn-' + id);
            if (activeCard) {
                activeCard.classList.remove('border-white/10');
                activeCard.classList.add('border-emerald-500', 'bg-emerald-950/30', 'ring-2', 'ring-emerald-500/40');
            }
        }

        // Volar directamente a un predio en el mapa GIS desde La Mesa
        function flyToPredioLocation(predioId) {
            selectMesaPredio(predioId);
            switchMasterView('territory', 'mesa');
            selectSidebarTab('tab-territory');
            const statusModeLabel = document.getElementById('statusModeLabel');
            if (statusModeLabel) {
                statusModeLabel.innerHTML = `🤝 Predio Vecinal: ${predioId}`;
                statusModeLabel.className = 'text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30';
            }
            const coords = PREDIO_COORDINATES[predioId] || [-36.21156, -71.60530];
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                    map.flyTo(coords, 14.5, { duration: 1.5 });
                }
                if (geojsonPredios && geojsonPredios.features) {
                    const feat = geojsonPredios.features.find(f => f.properties && f.properties.id === predioId);
                    if (feat) openNeighborDrawer(feat.properties);
                }
            }, 100);
        }

        // Acceso directo a Obras Comunitarias de Borde
        function openObrasBorde() {
            switchMasterView('territory', 'mesa');
            selectSidebarTab('tab-territory');
            const statusModeLabel = document.getElementById('statusModeLabel');
            if (statusModeLabel) {
                statusModeLabel.innerHTML = '🛠️ Modo: Proyectos Cooperativos de Borde';
                statusModeLabel.className = 'text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30';
            }
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                    map.flyTo([-36.2050, -71.5950], 14, { duration: 1.5 });
                }
            }, 100);
        }

        // ═══════════════════════════════════════════════════════════════════
        // SUITE DE LA MESA DE VECINOS: MALETÍN PREDIAL, PAISAJE & DAO
        // ═══════════════════════════════════════════════════════════════════
        const FARMER_PORTFOLIOS = {
            'MENIEL': {
                name: 'Fundo Meniel / Colliguay',
                rol: 'Rol 142-88 Retiro',
                waterReserve: '18.500 m³',
                waterSub: 'Tranque Keyline activo (Cap. 18.500 m³)',
                vwc: '36.2% VWC',
                waterBar: '82%',
                biomass: '4.820 kg MS/ha',
                stocking: '1.4 UA/ha (PRV 8 potreros)',
                firewall: '2.4 km manejados',
                fwi: 'FWI 24 (Bajo)',
                dga: '42.5 L/s consuntivos',
                dgaReal: 'Consumo real: 29.8 L/s • Excedente +12.7 L/s para recarga comunitaria'
            },
            'SAN_JOSE': {
                name: 'Agrícola San José de Longaví',
                rol: 'Rol 142-12 Retiro',
                waterReserve: '34.200 m³',
                waterSub: 'Cuarteles de contención de crecidas',
                vwc: '48.1% VWC',
                waterBar: '95%',
                biomass: '6.150 kg MS/ha',
                stocking: '0.8 UA/ha (Rastrojos arroz)',
                firewall: '1.8 km bordes acequia',
                fwi: 'FWI 18 (Muy Bajo)',
                dga: '110.0 L/s consuntivos',
                dgaReal: 'Consumo real: 95.0 L/s • Drenaje hacia canal matriz activo'
            },
            'RETIRO_PONIENTE': {
                name: 'Hacienda Retiro Poniente',
                rol: 'Rol 138-20 Retiro',
                waterReserve: '8.200 m³',
                waterSub: 'Reservorio austral de cabecera',
                vwc: '31.0% VWC',
                waterBar: '58%',
                biomass: '3.900 kg MS/ha',
                stocking: '1.1 UA/ha (Avena forrajera)',
                firewall: '3.1 km faja arado perimetral',
                fwi: 'FWI 32 (Moderado)',
                dga: '75.0 L/s consuntivos',
                dgaReal: 'Consumo real: 68.5 L/s tecnificado por carretes'
            },
            'STA_LUCIA': {
                name: 'Agrícola Santa Lucía del Huape',
                rol: 'Rol 140-15 Retiro',
                waterReserve: '4.500 m³',
                waterSub: 'Tranque de ladera secano',
                vwc: '22.8% VWC',
                waterBar: '42%',
                biomass: '1.850 kg MS/ha',
                stocking: '0.5 UA/ha (Ovinos en invierno)',
                firewall: '2.0 km franja limpia espinos',
                fwi: 'FWI 41 (Moderado/Alto)',
                dga: '18.0 L/s de pozo profundo',
                dgaReal: 'Consumo real: 14.0 L/s goteo de alta eficiencia'
            },
            'AJI_RETIRO': {
                name: 'Coop. Campesina Ají de Retiro',
                rol: 'Rol 145-30 Retiro',
                waterReserve: '12.000 m³',
                waterSub: 'Tranque comunitario INDAP',
                vwc: '34.5% VWC',
                waterBar: '76%',
                biomass: '5.200 kg MS/ha',
                stocking: '0.2 UA/ha (Aves libres)',
                firewall: '1.4 km cerco vivo quillay',
                fwi: 'FWI 22 (Bajo)',
                dga: '38.0 L/s canal comunal',
                dgaReal: 'Consumo real: 31.2 L/s con compuertas automatizadas'
            },
            'LOS_BOLDOS': {
                name: 'Fundo Forestal Los Boldos',
                rol: 'Rol 143-05 Retiro',
                waterReserve: '2.100 m³',
                waterSub: 'Drenaje precario de ladera',
                vwc: '18.4% VWC',
                waterBar: '25%',
                biomass: '7.800 kg MS/ha',
                stocking: '0.0 UA/ha (Pino denso)',
                firewall: '0.8 km cortafuegos deficiente',
                fwi: 'FWI 68 (Crítico Puelche)',
                dga: '8.0 L/s vertiente',
                dgaReal: 'Consumo real: 8.0 L/s absorción monocultivo'
            },
            'MORA_VERDE': {
                name: 'Agrícola Mora Verde del Sur',
                rol: 'Rol 141-02 Retiro',
                waterReserve: '6.800 m³',
                waterSub: 'Tranque austral tecnificado',
                vwc: '38.0% VWC',
                waterBar: '80%',
                biomass: '3.400 kg MS/ha',
                stocking: '0.3 UA/ha (Manejo integrado)',
                firewall: '2.1 km franja limpia',
                fwi: 'FWI 25 (Bajo)',
                dga: '32.0 L/s consuntivos',
                dgaReal: 'Consumo real: 26.5 L/s microaspersión'
            },
            'LOS_MAITENES': {
                name: 'Fundo Los Maitenes (Bosque Nativo)',
                rol: 'Rol 144-01 Retiro',
                waterReserve: '14.200 m³',
                waterSub: 'Humedal natural & quebrada',
                vwc: '42.0% VWC',
                waterBar: '88%',
                biomass: '6.500 kg MS/ha',
                stocking: '0.6 UA/ha (Apicultura & Caprinos)',
                firewall: '3.5 km faja biológica quillay',
                fwi: 'FWI 20 (Muy Bajo)',
                dga: '22.0 L/s vertiente protegida',
                dgaReal: 'Consumo real: 12.0 L/s recarga cuenca'
            },
            'DON_VICTOR': {
                name: 'Parcela Don Víctor (Frutales)',
                rol: 'Rol 144-22 Retiro',
                waterReserve: '7.500 m³',
                waterSub: 'Tranque familiar Keyline',
                vwc: '35.0% VWC',
                waterBar: '72%',
                biomass: '4.100 kg MS/ha',
                stocking: '0.8 UA/ha (Frutales mixtos)',
                firewall: '1.6 km zanja de infiltración',
                fwi: 'FWI 28 (Bajo)',
                dga: '20.0 L/s canal comunal',
                dgaReal: 'Consumo real: 16.5 L/s goteo solar'
            },
            'EL_CARMEN': {
                name: 'Viña El Carmen (Uva Torontel)',
                rol: 'Rol 145-10 Retiro',
                waterReserve: '5.200 m³',
                waterSub: 'Reservorio de secano interior',
                vwc: '26.5% VWC',
                waterBar: '50%',
                biomass: '2.400 kg MS/ha',
                stocking: '0.4 UA/ha (Pastoreo en receso)',
                firewall: '2.8 km callejones limpios',
                fwi: 'FWI 35 (Moderado)',
                dga: '15.0 L/s pozo noria',
                dgaReal: 'Consumo real: 11.8 L/s tecnificado'
            },
            'LA_PALMA': {
                name: 'Reserva Precordillera La Palma',
                rol: 'Rol 146-01 Retiro',
                waterReserve: '28.000 m³',
                waterSub: 'Cabecera de cuenca y deshielos',
                vwc: '45.0% VWC',
                waterBar: '92%',
                biomass: '8.200 kg MS/ha',
                stocking: '0.1 UA/ha (Santuario silvestre)',
                firewall: '5.0 km barrera cortafuego natural',
                fwi: 'FWI 18 (Muy Bajo)',
                dga: '50.0 L/s vertientes de altura',
                dgaReal: 'Consumo real: 10.0 L/s conservación'
            }
        };

        let activeFarmerPortfolioId = 'MENIEL';

        function changeFarmerPortfolio(id) {
            activeFarmerPortfolioId = id;
            const p = FARMER_PORTFOLIOS[id];
            if (!p) return;
            const elBadge = document.getElementById('farmerBadgeRol');
            if (elBadge) elBadge.innerText = p.rol;
            const elRes = document.getElementById('fpWaterReserve');
            if (elRes) elRes.innerText = p.waterReserve;
            const elSub = document.getElementById('fpWaterSub');
            if (elSub) elSub.innerText = p.waterSub;
            const elVwc = document.getElementById('fpVwc');
            if (elVwc) elVwc.innerText = p.vwc;
            const elBar = document.getElementById('fpWaterBar');
            if (elBar) elBar.style.width = p.waterBar;
            const elBio = document.getElementById('fpBiomass');
            if (elBio) elBio.innerText = p.biomass;
            const elStock = document.getElementById('fpStocking');
            if (elStock) elStock.innerText = p.stocking;
            const elFire = document.getElementById('fpFirewall');
            if (elFire) elFire.innerText = p.firewall;
            const elFwi = document.getElementById('fpFwi');
            if (elFwi) elFwi.innerText = p.fwi;
            const elDga = document.getElementById('fpDga');
            if (elDga) elDga.innerText = p.dga;
            const elDgaReal = document.getElementById('fpDgaReal');
            if (elDgaReal) elDgaReal.innerText = p.dgaReal;
        }

        const DAO_PROPOSALS = [
            {
                id: 'prop-01',
                tag: 'MOCIÓN #01 • PIRO-RESILIENCIA',
                title: 'Faja Cortafuegos Comunitaria de 45m',
                scope: 'Meniel (142-88) ↔ Los Boldos (143-05)',
                description: 'Pastoreo en ultra-alta densidad con ovinos + desmalezado mecánico en 2.4 km limítrofes con monocultivo forestal.',
                budget: '$14.2M CLP (50% Fondos Propios / 50% Maule Resiliente)',
                yesVotes: 142,
                noVotes: 27,
                userVote: null,
                status: 'VOTACIÓN ACTIVA'
            },
            {
                id: 'prop-02',
                tag: 'MOCIÓN #02 • SEGURIDAD HÍDRICA APR',
                title: 'Tranque Keyline de Alivio y Reserva APR',
                scope: 'Meniel (142-88) ↔ APR San José',
                description: 'Compuerta automatizada para captar escorrentías de crecida (>180 m³/s) y asegurar 6.000 m³ para agua potable rural.',
                budget: '$8.8M CLP (Aporte DOH & Cooperativa)',
                yesVotes: 198,
                noVotes: 4,
                userVote: 'yes',
                status: 'APROBADA • EN EJECUCIÓN (72%)'
            },
            {
                id: 'prop-03',
                tag: 'MOCIÓN #03 • SUELO & QUEMA CERO',
                title: 'Pacto de Quema Cero & Chipeadora Común',
                scope: '10 Predios de la Cuenca (508 ha)',
                description: 'Incorporación de rastrojos de maíz y poda al suelo para elevar materia orgánica de 2.1% a 3.4% en 3 temporadas.',
                budget: '$22.5M CLP (Postulación INDAP)',
                yesVotes: 110,
                noVotes: 38,
                userVote: null,
                status: 'EN DEBATE VECINAL'
            }
        ];

        function renderDAOProposals() {
            const container = document.getElementById('daoProposalsContainer');
            if (!container) return;
            
            container.innerHTML = DAO_PROPOSALS.map(prop => {
                const total = prop.yesVotes + prop.noVotes;
                const yesPct = total > 0 ? Math.round((prop.yesVotes / total) * 100) : 50;
                const noPct = 100 - yesPct;
                const userVotedYes = prop.userVote === 'yes';
                const userVotedNo = prop.userVote === 'no';

                return `
                    <div class="p-3 bg-black/50 rounded-xl border border-white/10 space-y-2 hover:border-emerald-500/40 transition-colors">
                        <div class="flex items-center justify-between text-[10px] font-mono">
                            <span class="text-emerald-400 font-bold tracking-wider">${prop.tag}</span>
                            <span class="px-2 py-0.5 rounded ${prop.status.includes('APROBADA') ? 'bg-sky-950 text-sky-300 border border-sky-500/30' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'} font-bold">${prop.status}</span>
                        </div>
                        <h4 class="text-xs font-bold text-white">${prop.title}</h4>
                        <p class="text-[10px] text-slate-400 leading-relaxed">${prop.description}</p>
                        <div class="flex justify-between items-center text-[10px] font-mono text-slate-300 pt-1">
                            <span class="text-emerald-400 font-bold">${yesPct}% A Favor (${prop.yesVotes})</span>
                            <span class="text-red-400 font-bold">${noPct}% En Contra (${prop.noVotes})</span>
                        </div>
                        <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                            <div class="bg-emerald-500 h-full transition-all duration-500" style="width: ${yesPct}%"></div>
                            <div class="bg-red-500 h-full transition-all duration-500" style="width: ${noPct}%"></div>
                        </div>
                        <div class="flex items-center gap-2 pt-1">
                            <button onclick="voteDAOProposal('${prop.id}', 'yes')" class="flex-1 py-1 px-2 rounded-lg text-[10px] font-mono font-bold transition-all ${userVotedYes ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}">
                                ${userVotedYes ? '✓ Votaste A Favor' : '👍 Apoyar (+10)'}
                            </button>
                            <button onclick="voteDAOProposal('${prop.id}', 'no')" class="flex-1 py-1 px-2 rounded-lg text-[10px] font-mono font-bold transition-all ${userVotedNo ? 'bg-red-500 text-slate-950' : 'bg-white/10 hover:bg-red-500/20 text-red-300 border border-red-500/30'}">
                                ${userVotedNo ? '✗ Votaste En Contra' : '👎 Oponerse'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function voteDAOProposal(propId, choice) {
            const prop = DAO_PROPOSALS.find(p => p.id === propId);
            if (!prop) return;
            
            if (prop.userVote === choice) {
                if (choice === 'yes') prop.yesVotes -= 10;
                if (choice === 'no') prop.noVotes -= 10;
                prop.userVote = null;
            } else {
                if (prop.userVote === 'yes') prop.yesVotes -= 10;
                if (prop.userVote === 'no') prop.noVotes -= 10;
                
                if (choice === 'yes') prop.yesVotes += 10;
                if (choice === 'no') prop.noVotes += 10;
                prop.userVote = choice;
            }
            renderDAOProposals();
        }

        function updateConsensusSimulator(val) {
            const pct = parseInt(val, 10);
            const elPct = document.getElementById('consensusSimPercent');
            if (elPct) elPct.innerText = pct + '% Predios';
            
            const fwiReduction = Math.round(15 + (pct * 0.47));
            const waterDays = Math.round(10 + (pct * 0.42));
            
            const elFwi = document.getElementById('simFwiResult');
            if (elFwi) elFwi.innerText = '-' + fwiReduction + '% Piro-Riesgo';
            const elWater = document.getElementById('simWaterResult');
            if (elWater) elWater.innerText = '+' + waterDays + ' Días Autonomía';
        }

        function downloadFormalAgreements() {
            const content = `=========================================================\n` +
                `LIBRO MAYOR DE ACUERDOS DE BORDE & GOBERNANZA VECINAL\n` +
                `COMUNA DE RETIRO Y PARRAL • CUENCA MAULE SUR\n` +
                `PROTOCOLO OFICIAL DE MAYORDOMÍA TERRITORIAL AGROTWIN\n` +
                `=========================================================\n\n` +
                `FECHA DE REGISTRO: ${new Date().toISOString()}\n` +
                `PREDIOS PARTICIPANTES: 10 Predios Catastrados (508 ha)\n` +
                `ESTADO DEL LIBRO: VIGENTE E INMUTABLE\n\n` +
                `--- ACUERDO 01: SERVIDUMBRE HÍDRICA & DESAGÜE ECOLÓGICO ---\n` +
                `Partes: Rol 142-88 (Fundo Meniel) & Rol 142-12 (Agrícola San José)\n` +
                `Objeto: Canalización controlada hacia tranque Keyline y aforo permanente.\n` +
                `Hash Blockchain: 0x9a8f4c219803bf19284ea6c901e38921df0\n\n` +
                `--- ACUERDO 02: FAJA CORTAFUEGOS LIMÍTROFE DE 45 METROS ---\n` +
                `Partes: Rol 142-88 (Fundo Meniel) & Rol 143-05 (Consorcio Los Boldos)\n` +
                `Objeto: Exclusión de biomasa fina inflamable mediante silvopastoreo.\n` +
                `Estado: Moción DAO en proceso de ratificación cuadrática.\n\n` +
                `--- ACUERDO 03: RESPALDO DE CONSUMO HUMANO RED APR COPIHUE ---\n` +
                `Partes: Fundo Meniel, Agrícola San José & Comité APR Copihue (30 familias)\n` +
                `Objeto: Respaldo hídrico de 6.000 m³ durante emergencias estivales.\n` +
                `Hash Blockchain: 0x7c41890bfe2901a89c314059d81640a3219\n`;

            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Pactos_Vecinales_MauleSur_AgroTwin.txt';
            a.click();
            URL.revokeObjectURL(url);
        }

        function copyDossierToClipboard() {
            const elPreview = document.getElementById('dossierPreviewBox');
            const content = elPreview ? elPreview.innerText : '';
            navigator.clipboard.writeText(content);
            alert("📋 Informe Técnico Oficial copiado al portapapeles con éxito.");
        }

        function downloadFormalExecutiveDossier() {
            const elPreview = document.getElementById('dossierPreviewBox');
            const content = elPreview ? elPreview.innerText : 'AGROTWIN MASTER SUITE • INFORME TÉCNICO OFICIAL';
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Dossier_Ejecutivo_AgroTwin_MauleSur.txt';
            a.click();
            URL.revokeObjectURL(url);
        }

        // ═══════════════════════════════════════════════════════════════════
        // PRINCIPIO ÁRBOL: BUS DE ESTADO CENTRAL DEL TRONCO (SUITE HUB) & SYNC
        // ═══════════════════════════════════════════════════════════════════
        window.agroTwinStateBus = {
            predio: {
                name: 'Fundo Colliguay (Predio Twin)',
                lastSync: 'En línea',
                metrics: { aforoLps: 28.0, tranqueM3: 18500, soilVwc: '36.2%', fwi: 24, biomassKgHa: 4820 }
            },
            mesa: {
                name: 'La Mesa de Vecinos (508 ha)',
                lastSync: 'En línea',
                metrics: { prediosConectados: 10, firewallKm: 2.4, daoCredits: 100, consensus: '94%' }
            },
            cuenca: {
                name: 'La Cumbre del Cerro (122k ha)',
                lastSync: 'En línea',
                metrics: { dgaStation: 'Longaví', caudalLps: 42.5, fwiRegional: 48, alertLevel: 'Verde' }
            },
            establo: {
                name: 'Establo Inteligente & Bienestar Animal',
                lastSync: 'En línea',
                metrics: { thiIndice: 68.2, rumiaMinDia: 465, bcsPromedio: 3.4, confortBovino: '96%' }
            },
            invernadero: {
                name: 'Invernadero Clima Controlado & CEA',
                lastSync: 'En línea',
                metrics: { vpdKpa: 1.15, tempIntC: 22.4, rhPct: 68.5, parUmol: 840 }
            },
            excursion: {
                name: 'Excursión / Incursión Biodiversidad & Pirogestión',
                lastSync: 'En línea',
                metrics: { camarasActivas: 6, indiceNDVI: 0.74, biomasaCombustible: '8.2 t/ha', alertasFauna: 0 }
            }
        };

        window.showMasterToast = function(msg, icon = '🌳', type = 'info') {
            const bgClass = type === 'success' ? 'bg-emerald-950 border-emerald-500' : type === 'warning' ? 'bg-amber-950 border-amber-500' : 'bg-stone-900 border-amber-500';
            const toast = document.createElement('div');
            toast.className = `fixed bottom-6 right-6 z-[99999] px-4 py-3 rounded-2xl ${bgClass} text-white text-xs font-mono shadow-2xl flex items-center gap-3 border transition-all`;
            toast.style.boxShadow = '0 20px 40px rgba(0,0,0,0.6)';
            toast.innerHTML = `<span class="text-2xl">${icon}</span><div><div class="font-bold text-amber-300">Principio Árbol • Tronco Suite Hub</div><div class="text-[11px] text-slate-200 mt-0.5 leading-snug">${msg}</div></div>`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(12px)';
                setTimeout(() => toast.remove(), 400);
            }, 4000);
        };

        window.showToast = function(msg) {
            window.showMasterToast(msg, '✅', 'info');
        };

        window.syncBranchWithHub = function(branchName) {
            const now = new Date().toLocaleTimeString();
            if (branchName === 'mesa') {
                window.agroTwinStateBus.mesa.lastSync = now;
                window.showMasterToast(`Rama MESA VECINAL sincronizada: 10 predios, 508 ha y consenso DAO consolidados en el Tronco Hub.`, '🤝', 'success');
            } else if (branchName === 'cuenca') {
                window.agroTwinStateBus.cuenca.lastSync = now;
                window.showMasterToast(`Rama CUENCA sincronizada: Macro-hidrología 122k ha y alertas FWI consolidadas en el Tronco Hub.`, '🏔️', 'success');
            } else if (branchName === 'predio') {
                window.agroTwinStateBus.predio.lastSync = now;
                window.showMasterToast(`Rama PREDIO sincronizada: Aforo 28 L/s, Tranque 18.5k m³ y FDR consolidados en el Tronco Hub.`, '🚜', 'success');
            } else if (branchName === 'establo') {
                window.agroTwinStateBus.establo.lastSync = now;
                window.showMasterToast(`Rama ESTABLO sincronizada: THI 68.2, rumia 465 min y confort 96% consolidados en el Tronco Hub.`, '🐄', 'success');
            } else if (branchName === 'invernadero') {
                window.agroTwinStateBus.invernadero.lastSync = now;
                window.showMasterToast(`Rama INVERNADERO sincronizada: VPD 1.15 kPa, clima dinámico y fertirriego consolidados en el Tronco Hub.`, '🌿', 'success');
            } else if (branchName === 'excursion') {
                window.agroTwinStateBus.excursion.lastSync = now;
                window.showMasterToast(`Rama EXCURSIÓN sincronizada: Fototrampeo, NDVI 0.74 y fajas de contención consolidados en el Tronco Hub.`, '🥾', 'success');
            }
            if (typeof updateArbolEventLog === 'function') {
                updateArbolEventLog(branchName, 'SINCRONIZACIÓN MANUAL');
            }
        };

        window.updateArbolEventLog = function(branch, action, payload) {
            const logEl = document.getElementById('arbolEventLog');
            if (!logEl) return;
            const time = new Date().toLocaleTimeString();
            const dataToFormat = payload || window.agroTwinStateBus[branch]?.metrics || {};
            const entry = `[${time}] [TRONCO-HUB] Rama '${branch.toUpperCase()}' emitió '${action}':\n${JSON.stringify(dataToFormat, null, 2)}`;
            if (logEl.innerText.startsWith('// Esperando')) {
                logEl.innerText = entry;
            } else {
                logEl.innerText = entry + '\n\n' + logEl.innerText;
            }
        };

        // Escucha de mensajes entrantes desde la rama Predio (Three.js WebGL en iframe)
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SYNC_BRANCH_STATE') {
                const b = event.data.branch || 'predio';
                const now = new Date().toLocaleTimeString();
                if (window.agroTwinStateBus[b]) {
                    window.agroTwinStateBus[b].lastSync = now;
                    if (event.data.data) {
                        window.agroTwinStateBus[b].metrics = { ...window.agroTwinStateBus[b].metrics, ...event.data.data };
                    }
                }
                window.showMasterToast(`Telemetría recibida de Rama ${b.toUpperCase()} y consolidada en Tronco Hub (${now}).`, '📥', 'success');
                if (typeof updateArbolEventLog === 'function') {
                    updateArbolEventLog(b, 'POST_MESSAGE EN VIVO', event.data.data);
                }
            }
        });

        // --- SIMULADORES EN VIVO PARA SCRIPTS DEL VAULT ---
        function runInteractivePRV() {
            const ugm = parseFloat(document.getElementById('prv-ugm')?.value || 1.8);
            const rest = parseInt(document.getElementById('prv-rest')?.value || 38);
            const biomass = parseFloat(document.getElementById('prv-biomass')?.value || 2800);

            const ugmValEl = document.getElementById('prv-ugm-val');
            const restValEl = document.getElementById('prv-rest-val');
            const bioValEl = document.getElementById('prv-biomass-val');
            if (ugmValEl) ugmValEl.innerText = ugm.toFixed(1) + ' UGM';
            if (restValEl) restValEl.innerText = rest + ' Días';
            if (bioValEl) bioValEl.innerText = biomass.toLocaleString() + ' kg/ha';

            const paddockArea = 9.2 / 8; // 1.15 ha por potrero en Fundo Meniel
            const dailyHerdCons = +(ugm * 450 * 0.03).toFixed(1);
            const occDays = +(rest / 7).toFixed(1);
            const instStocking = +(ugm / paddockArea).toFixed(2);
            const forageAvail = paddockArea * biomass * 0.70;
            const daysSupp = +(forageAvail / dailyHerdCons).toFixed(1);
            const compliant = occDays <= 3.0 ? '✅ 2ª Ley Voisin Cumplida (<3d)' : '⚠️ Ajustar a <3d (rotación rápida)';

            const resEl = document.getElementById('prv-result');
            if (resEl) {
                resEl.innerText = `Ocupación: ${occDays} d/potrero (${compliant}) • Carga: ${instStocking} UGM/ha • Consumo: ${dailyHerdCons} kg MS/d • Autonomía: ${daysSupp} d`;
            }
        }
        window.runInteractivePRV = runInteractivePRV;

        function runInteractiveFAO56() {
            const t = parseFloat(document.getElementById('fao-temp')?.value || 24.5);
            const u2 = parseFloat(document.getElementById('fao-wind')?.value || 2.4);
            const rn = parseFloat(document.getElementById('fao-rn')?.value || 18.5);

            document.getElementById('fao-temp-val').innerText = t.toFixed(1) + ' °C';
            document.getElementById('fao-wind-val').innerText = u2.toFixed(1) + ' m/s';
            document.getElementById('fao-rn-val').innerText = rn.toFixed(1) + ' MJ';

            // Parámetros psicrométricos aproximados a nivel del mar (Parral ~160 msnm)
            const delta = 0.188;
            const gamma = 0.066;
            const g = 0.4;
            const es = 0.6108 * Math.exp((17.27 * t) / (t + 237.3));
            const ea = es * 0.45; // 45% HR media

            const numerator = 0.408 * delta * (rn - g) + gamma * (900 / (t + 273)) * u2 * (es - ea);
            const denominator = delta + gamma * (1 + 0.34 * u2);
            const et0 = +(numerator / denominator).toFixed(2);
            const m3ha = (et0 * 10).toFixed(1);

            const resEl = document.getElementById('fao-result');
            if (resEl) resEl.innerText = `${et0} mm/día (${m3ha} m³/ha/día)`;
        }

        function runInteractiveFWI() {
            const t = parseFloat(document.getElementById('fwi-temp')?.value || 31.0);
            const rh = parseFloat(document.getElementById('fwi-rh')?.value || 22);
            const wind = parseFloat(document.getElementById('fwi-wind')?.value || 38);

            document.getElementById('fwi-temp-val').innerText = t.toFixed(1) + ' °C';
            document.getElementById('fwi-rh-val').innerText = rh + ' %';
            document.getElementById('fwi-wind-val').innerText = wind + ' km/h';

            const m = 147.2 * (101 - rh) / (59.5 + rh);
            const ffmc = 59.5 * (250 - m) / (147.2 + m);
            const isi = 0.208 * Math.exp(0.05039 * wind) * (91.9 * Math.exp(-0.1386 * m) * (1 + Math.pow(m, 5.31) / 4.93e7));
            const fwi = +(isi * 1.62).toFixed(1);

            let cat = 'Bajo';
            let color = '#34d399';
            if (fwi >= 50) { cat = 'EXTREMO'; color = '#ef4444'; }
            else if (fwi >= 35) { cat = 'ALTO'; color = '#f97316'; }
            else if (fwi >= 20) { cat = 'MODERADO'; color = '#eab308'; }

            const puelche = wind > 30 && rh < 30;
            const resEl = document.getElementById('fwi-result');
            if (resEl) {
                resEl.style.color = color;
                resEl.innerText = `FWI ${fwi} • ${cat} ${puelche ? '(🚨 Alerta Puelche Activa)' : '(Condiciones Estables)'}`;
            }
        }

        function runInteractiveKeyline() {
            const inflow = parseFloat(document.getElementById('keyline-inflow')?.value || 180);
            const cap = parseFloat(document.getElementById('keyline-cap')?.value || 20000);

            document.getElementById('keyline-inflow-val').innerText = inflow + ' m³/s';
            document.getElementById('keyline-cap-val').innerText = (cap).toLocaleString() + ' m³';

            const maxDiversionRate = 4.2;
            const mitigated = Math.max(0, inflow - Math.min(inflow * 0.15, maxDiversionRate)).toFixed(1);
            const diff = (inflow - mitigated).toFixed(1);
            const days = Math.round(cap / 450);

            const resEl = document.getElementById('keyline-result');
            if (resEl) {
                resEl.innerText = `${mitigated} m³/s (-${diff} m³/s amortiguado) • ${days} Días Autonomía APR`;
            }
        }

        function runInteractiveDAO() {
            const votes = parseInt(document.getElementById('dao-votes')?.value || 7);
            document.getElementById('dao-votes-val').innerText = votes + (votes === 1 ? ' Voto' : ' Votos');

            const cost = Math.pow(votes, 2);
            const remaining = Math.max(0, 100 - cost);

            const resEl = document.getElementById('dao-result');
            if (resEl) {
                resEl.innerText = `Costo: ${cost} Créditos (${votes}²) • Restan: ${remaining} Créditos`;
            }
        }

        function initMesaSuite() {
            renderDAOProposals();
            const sel = document.getElementById('farmerPortfolioSelector');
            if (sel) changeFarmerPortfolio(sel.value);
            const simInput = document.querySelector('#view-mesa input[type=range]');
            if (simInput) updateConsensusSimulator(simInput.value);
        }

        // Subtabs del Centro de Documentación & Vault
        function switchDocsTab(tabId) {
            // Compatibilidad con identificadores antiguos y unificación de Ingesta & Pipeline dentro de Arquitectura
            if (tabId === 'docs-pipeline') {
                switchDocsTab('docs-arch');
                if (typeof switchArchModule === 'function') switchArchModule('pipeline');
                return;
            }
            if (tabId === 'docs-geojson') tabId = 'docs-scripts';
            if (tabId === 'docs-results') tabId = 'docs-tables';

            document.querySelectorAll('.docs-subcontent').forEach(c => c.classList.add('hidden'));
            document.querySelectorAll('.docs-subtab-btn').forEach(b => b.classList.remove('active'));
            
            const content = document.getElementById(tabId);
            if (content) content.classList.remove('hidden');

            const btnId = tabId.replace('docs-', 'docsTabBtn-');
            const btn = document.getElementById(btnId);
            if (btn) btn.classList.add('active');

            if (tabId === 'docs-dossier') {
                setTimeout(() => {
                    const el = document.getElementById('docs-dossier');
                    const viewDocs = document.getElementById('view-docs');
                    if (viewDocs && el) {
                        viewDocs.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' });
                    } else if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 50);
            }

            try {
                if (tabId === 'docs-scripts') {
                    const geoJsonView = document.getElementById('geojsonCodeView');
                    if (geoJsonView && typeof geojsonPredios !== 'undefined') {
                        geoJsonView.innerText = JSON.stringify(geojsonPredios, null, 2);
                    }
                } else if (tabId === 'docs-reporter') {
                    if (typeof updateReportPreview === 'function') {
                        updateReportPreview();
                    }
                } else if (tabId === 'docs-tables' || tabId === 'docs-biomes') {
                    if (typeof initDocsCatalog === 'function') {
                        initDocsCatalog();
                    }
                }
            } catch (err) {
                console.warn('[Docs Vault] Error actualizando subtab:', tabId, err);
            }
        }
        window.switchDocsTab = switchDocsTab;

        window.openDossierInHub = function() {
            if (typeof switchMasterView === 'function') switchMasterView('docs');
            if (typeof switchDocsTab === 'function') switchDocsTab('docs-dossier');
            setTimeout(() => {
                const el = document.getElementById('docs-dossier');
                const viewDocs = document.getElementById('view-docs');
                if (viewDocs && el) {
                    viewDocs.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' });
                } else if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 80);
        };

        window.openDossierModal = function() {
            const el = document.getElementById('dossier-modal');
            if (el) {
                el.classList.remove('hidden');
                el.classList.add('flex');
            }
        };

        window.closeDossierModal = function() {
            const el = document.getElementById('dossier-modal');
            if (el) {
                el.classList.add('hidden');
                el.classList.remove('flex');
            }
        };

        window.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDossierModal();
            }
        });

        // Navegación Master-Detail de Arquitectura (6 Módulos con Mermaid & Tablas)
        window.switchArchModule = function(moduleId) {
            document.querySelectorAll('.arch-detail-panel').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.arch-nav-item').forEach(el => {
                el.classList.remove('arch-item-active');
                el.classList.remove('border-[#D97706]');
                el.classList.add('border-transparent');
            });

            const targetDetail = document.getElementById('arch-detail-' + moduleId);
            if (targetDetail) targetDetail.classList.remove('hidden');

            const targetNav = document.getElementById('arch-nav-' + moduleId);
            if (targetNav) {
                targetNav.classList.add('arch-item-active');
                targetNav.classList.remove('border-transparent');
                targetNav.classList.add('border-[#D97706]');
            }

            if (moduleId === 'stack') {
                setTimeout(() => {
                    if (typeof window.renderHubVaultMermaid === 'function') {
                        window.renderHubVaultMermaid('arch');
                    }
                }, 50);
            }
            if (moduleId === 'atmosferica') {
                setTimeout(() => {
                    if (typeof window.renderLatexInContainer === 'function') {
                        window.renderLatexInContainer('arch-detail-atmosferica');
                    } else if (typeof renderMathInElement === 'function' && targetDetail) {
                        try {
                            renderMathInElement(targetDetail, {
                                delimiters: [
                                    {left: '$$', right: '$$', display: true},
                                    {left: '\\[', right: '\\]', display: true},
                                    {left: '$', right: '$', display: false},
                                    {left: '\\(', right: '\\)', display: false}
                                ],
                                throwOnError: false
                            });
                        } catch(e) {}
                    }
                }, 50);
            }
        };

        // Renderizador de Diagramas Mermaid para el Vault de Arquitectura
        // Renderizador de Diagramas Arquitecturales Vectoriales para el Vault (SVG Alta Fidelidad Galpón)
        window.renderHubVaultMermaid = function(type) {
            const container = document.getElementById('hubVaultMermaidContainer');
            if (!container) return;

            const buttons = ['arch', 'events', 'tree', 'vision'];
            buttons.forEach(b => {
                const btn = document.getElementById('btnHubMermaid-' + b);
                if (btn) {
                    if (b === type) {
                        btn.className = 'px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-600 text-white shadow-sm transition-all cursor-pointer';
                    } else {
                        btn.className = 'px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white hover:bg-stone-100 text-stone-700 border border-[#E7DAC6] transition-all cursor-pointer';
                    }
                }
            });

            const svgs = {
                arch: `<svg viewBox="0 0 940 350" class="w-full min-w-[800px] h-auto select-none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="vCardShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#1C1917" flood-opacity="0.08"/>
    </filter>
    <marker id="vArrowGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669" />
    </marker>
    <marker id="vArrowIndigo" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#4F46E5" />
    </marker>
    <marker id="vArrowAmber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706" />
    </marker>
  </defs>

  <!-- Capa 1: Hardware IoT -->
  <g filter="url(#vCardShadow)">
    <rect x="20" y="25" width="270" height="295" rx="16" fill="#FFFFFF" stroke="#059669" stroke-width="2"/>
    <rect x="20" y="25" width="270" height="38" rx="16" fill="#ECFDF5"/>
    <text x="36" y="50" fill="#065F46" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="12">🌱 1. TERRENO &amp; HARDWARE</text>
    <rect x="220" y="36" width="60" height="18" rx="6" fill="#D1FAE5"/>
    <text x="250" y="49" fill="#047857" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold" text-anchor="middle">C / C++</text>
    
    <rect x="34" y="75" width="242" height="50" rx="10" fill="#F0FDF4" stroke="#A7F3D0" stroke-width="1"/>
    <text x="46" y="94" fill="#065F46" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11">ESP32 DevKit v1 / S3</text>
    <text x="46" y="112" fill="#4B5563" font-family="'JetBrains Mono', monospace" font-size="9">firmware/esp32_field_enclosure.ino</text>

    <rect x="34" y="134" width="242" height="50" rx="10" fill="#F0FDF4" stroke="#A7F3D0" stroke-width="1"/>
    <text x="46" y="153" fill="#065F46" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11">Sondas FDR Multinivel</text>
    <text x="46" y="171" fill="#4B5563" font-family="'JetBrains Mono', monospace" font-size="9">Lectura 10 / 30 / 60 cm ADC Calibrado</text>

    <rect x="34" y="193" width="242" height="50" rx="10" fill="#F0FDF4" stroke="#A7F3D0" stroke-width="1"/>
    <text x="46" y="212" fill="#065F46" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11">Display Local SPI &amp; I2C</text>
    <text x="46" y="230" fill="#4B5563" font-family="'JetBrains Mono', monospace" font-size="9">TFT ILI9341 3.5'' + BME280 Clima</text>

    <rect x="34" y="252" width="242" height="50" rx="10" fill="#F0FDF4" stroke="#A7F3D0" stroke-width="1"/>
    <text x="46" y="271" fill="#065F46" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11">Relés Optoacoplados</text>
    <text x="46" y="289" fill="#4B5563" font-family="'JetBrains Mono', monospace" font-size="9">Bombas Pozo, Riego &amp; Aspersión Heladas</text>
  </g>

  <!-- Flecha 1 -> 2 -->
  <path d="M 290 172 L 330 172" stroke="#059669" stroke-width="2.5" marker-end="url(#vArrowGreen)"/>
  <rect x="293" y="145" width="34" height="18" rx="4" fill="#FFFFFF" stroke="#059669" stroke-width="1"/>
  <text x="310" y="157" fill="#059669" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="bold" text-anchor="middle">WiFi</text>

  <!-- Capa 2: Backend Gateway -->
  <g filter="url(#vCardShadow)">
    <rect x="340" y="25" width="260" height="295" rx="16" fill="#FFFFFF" stroke="#4F46E5" stroke-width="2"/>
    <rect x="340" y="25" width="260" height="38" rx="16" fill="#EEF2FF"/>
    <text x="356" y="50" fill="#3730A3" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="12">⚡ 2. BACKEND &amp; GATEWAY</text>
    <rect x="530" y="36" width="60" height="18" rx="6" fill="#E0E7FF"/>
    <text x="560" y="49" fill="#4338CA" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold" text-anchor="middle">Node.js</text>

    <rect x="354" y="75" width="232" height="66" rx="10" fill="#F5F3FF" stroke="#C7D2FE" stroke-width="1"/>
    <text x="366" y="94" fill="#3730A3" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11">Servidor Local server.cjs</text>
    <text x="366" y="112" fill="#4B5563" font-family="'JetBrains Mono', monospace" font-size="9">Puerto 7773 (Zero External Deps)</text>
    <text x="366" y="128" fill="#4F46E5" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold">HTTP Router + Static Assets</text>

    <rect x="354" y="150" width="232" height="66" rx="10" fill="#F5F3FF" stroke="#C7D2FE" stroke-width="1"/>
    <text x="366" y="169" fill="#3730A3" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11">API Telemetría &amp; Enclosure</text>
    <text x="366" y="187" fill="#4B5563" font-family="'JetBrains Mono', monospace" font-size="9">POST /api/enclosure/telemetry</text>
    <text x="366" y="203" fill="#4F46E5" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold">Buffer Circular &amp; Persistencia</text>

    <rect x="354" y="225" width="232" height="77" rx="10" fill="#F5F3FF" stroke="#C7D2FE" stroke-width="1"/>
    <text x="366" y="244" fill="#3730A3" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11">Sincronizador Cuenca</text>
    <text x="366" y="262" fill="#4B5563" font-family="'JetBrains Mono', monospace" font-size="9">Bridge Regional Puerto 7774</text>
    <text x="366" y="278" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Balance Hídrico Macro Longaví</text>
    <text x="366" y="291" fill="#4F46E5" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="bold">/api/basin-sync</text>
  </g>

  <!-- Flecha 2 -> 3 -->
  <path d="M 600 172 L 640 172" stroke="#4F46E5" stroke-width="2.5" marker-end="url(#vArrowIndigo)"/>
  <rect x="604" y="145" width="32" height="18" rx="4" fill="#FFFFFF" stroke="#4F46E5" stroke-width="1"/>
  <text x="620" y="157" fill="#4F46E5" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="bold" text-anchor="middle">REST</text>

  <!-- Capa 3: Cliente 3D & UI -->
  <g filter="url(#vCardShadow)">
    <rect x="650" y="25" width="270" height="295" rx="16" fill="#FFFFFF" stroke="#D97706" stroke-width="2"/>
    <rect x="650" y="25" width="270" height="38" rx="16" fill="#FEF3C7"/>
    <text x="666" y="50" fill="#92400E" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="12">🖥️ 3. GEMELO DIGITAL 3D &amp; UI</text>
    <rect x="850" y="36" width="60" height="18" rx="6" fill="#FDE68A"/>
    <text x="880" y="49" fill="#B45309" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold" text-anchor="middle">WebGL 2.0</text>

    <rect x="664" y="75" width="242" height="50" rx="10" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1"/>
    <text x="676" y="94" fill="#92400E" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11">Three.js r128 + R3F + CesiumJS</text>
    <text x="676" y="112" fill="#4B5563" font-family="'JetBrains Mono', monospace" font-size="9">Sombras PCF 4K • Ortofoto Esri • DEM</text>

    <rect x="664" y="134" width="242" height="50" rx="10" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1"/>
    <text x="676" y="153" fill="#92400E" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11">Shaders GLSL Customizados</text>
    <text x="676" y="171" fill="#4B5563" font-family="'JetBrains Mono', monospace" font-size="9">Gradientes Humedad • Filtros Sobel PBR</text>

    <rect x="664" y="193" width="242" height="50" rx="10" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1"/>
    <text x="676" y="212" fill="#92400E" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11">Motor Biofísico &amp; Simulación</text>
    <text x="676" y="230" fill="#4B5563" font-family="'JetBrains Mono', monospace" font-size="9">FAO-56 Penman • Modelo Inversión Térmica</text>

    <rect x="664" y="252" width="242" height="50" rx="10" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1"/>
    <text x="676" y="271" fill="#92400E" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11">UI Glassmorphism &amp; EventBus</text>
    <text x="676" y="289" fill="#4B5563" font-family="'JetBrains Mono', monospace" font-size="9">Arquitectura Pub/Sub desacoplada + Chart.js</text>
  </g>
</svg>`,
                events: `<svg viewBox="0 0 940 370" class="w-full min-w-[800px] h-auto select-none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="vSeqShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#1C1917" flood-opacity="0.07"/>
    </filter>
    <marker id="vArrowEv1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706" />
    </marker>
    <marker id="vArrowEv2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669" />
    </marker>
    <marker id="vArrowEv3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#4F46E5" />
    </marker>
  </defs>

  <!-- Carriles Verticales -->
  <line x1="100" y1="65" x2="100" y2="350" stroke="#E7DAC6" stroke-width="1.5" stroke-dasharray="4 4" />
  <line x1="280" y1="65" x2="280" y2="350" stroke="#E7DAC6" stroke-width="1.5" stroke-dasharray="4 4" />
  <line x1="470" y1="65" x2="470" y2="350" stroke="#FDE68A" stroke-width="2" stroke-dasharray="4 4" />
  <line x1="660" y1="65" x2="660" y2="350" stroke="#E7DAC6" stroke-width="1.5" stroke-dasharray="4 4" />
  <line x1="840" y1="65" x2="840" y2="350" stroke="#E7DAC6" stroke-width="1.5" stroke-dasharray="4 4" />

  <!-- Cabeceras de Actores -->
  <g filter="url(#vSeqShadow)">
    <rect x="30" y="15" width="140" height="42" rx="10" fill="#FFFFFF" stroke="#D97706" stroke-width="1.5"/>
    <text x="100" y="41" fill="#78350F" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" text-anchor="middle">🧑‍🌾 Operador</text>

    <rect x="210" y="15" width="140" height="42" rx="10" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/>
    <text x="280" y="41" fill="#0369A1" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" text-anchor="middle">🎛️ UIController</text>

    <rect x="400" y="15" width="140" height="42" rx="10" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
    <text x="470" y="41" fill="#B45309" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" text-anchor="middle">📡 EventBus</text>

    <rect x="590" y="15" width="140" height="42" rx="10" fill="#FFFFFF" stroke="#059669" stroke-width="1.5"/>
    <text x="660" y="41" fill="#065F46" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" text-anchor="middle">🌐 MapManager 3D</text>

    <rect x="770" y="15" width="140" height="42" rx="10" fill="#FFFFFF" stroke="#4F46E5" stroke-width="1.5"/>
    <text x="840" y="41" fill="#3730A3" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" text-anchor="middle">⚡ ESP32 / Server</text>
  </g>

  <!-- Paso 1: Clic en Entidad -->
  <path d="M 100 95 L 278 95" stroke="#D97706" stroke-width="2" marker-end="url(#vArrowEv1)" />
  <rect x="135" y="80" width="105" height="18" rx="4" fill="#FEF3C7" stroke="#FDE68A" stroke-width="1"/>
  <text x="187" y="93" fill="#92400E" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold" text-anchor="middle">1. Clic en Sensor IOT</text>

  <!-- Paso 2: Emitir Evento -->
  <path d="M 280 135 L 468 135" stroke="#0284C7" stroke-width="2" marker-end="url(#vArrowEv2)" />
  <rect x="305" y="120" width="140" height="18" rx="4" fill="#F0F9FF" stroke="#BAE6FD" stroke-width="1"/>
  <text x="375" y="133" fill="#0369A1" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold" text-anchor="middle">2. emit('ENTITY_SELECT')</text>

  <!-- Paso 3a: Bus activa Cámara 3D -->
  <path d="M 470 175 L 658 175" stroke="#059669" stroke-width="2" marker-end="url(#vArrowEv2)" />
  <rect x="495" y="160" width="140" height="18" rx="4" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1"/>
  <text x="565" y="173" fill="#065F46" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold" text-anchor="middle">3. flyTo() + Pulso Shaders</text>

  <!-- Paso 3b: Bus abre UI Drawer -->
  <path d="M 470 215 L 282 215" stroke="#0284C7" stroke-width="2" marker-end="url(#vArrowEv2)" />
  <rect x="310" y="200" width="130" height="18" rx="4" fill="#F0F9FF" stroke="#BAE6FD" stroke-width="1"/>
  <text x="375" y="213" fill="#0369A1" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold" text-anchor="middle">4. Despliega Drawer &amp; Chart</text>

  <!-- Caja Loop de Telemetría cada 15s -->
  <rect x="410" y="250" width="510" height="90" rx="12" fill="#F5F3FF" stroke="#C7D2FE" stroke-width="1.5" stroke-dasharray="6 3"/>
  <rect x="420" y="256" width="150" height="18" rx="4" fill="#EDE9FE"/>
  <text x="495" y="269" fill="#5B21B6" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold" text-anchor="middle">LOOP TELEMETRÍA (15s)</text>

  <path d="M 840 295 L 472 295" stroke="#4F46E5" stroke-width="2" marker-end="url(#vArrowEv3)" />
  <text x="650" y="288" fill="#4338CA" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold" text-anchor="middle">Payload { moisture: 24.5%, temp: 18.2°C }</text>

  <path d="M 470 325 L 658 325" stroke="#059669" stroke-width="1.5" stroke-dasharray="4 2" marker-end="url(#vArrowEv2)" />
  <text x="565" y="320" fill="#065F46" font-family="'JetBrains Mono', monospace" font-size="8.5">Actualiza Shaders Suelo</text>

  <path d="M 470 325 L 282 325" stroke="#0284C7" stroke-width="1.5" stroke-dasharray="4 2" marker-end="url(#vArrowEv2)" />
  <text x="375" y="320" fill="#0369A1" font-family="'JetBrains Mono', monospace" font-size="8.5">Refresca Badges &amp; Series</text>
</svg>`,
                tree: `<svg viewBox="0 0 940 380" class="w-full min-w-[800px] h-auto select-none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="vTreeShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#1C1917" flood-opacity="0.09"/>
    </filter>
  </defs>

  <!-- Nodo Raíz: AgriTwin 3D Suite -->
  <g filter="url(#vTreeShadow)">
    <rect x="270" y="15" width="400" height="60" rx="14" fill="#FFFFFF" stroke="#059669" stroke-width="2.5"/>
    <rect x="270" y="15" width="400" height="24" rx="14" fill="#ECFDF5"/>
    <text x="470" y="32" fill="#065F46" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" text-anchor="middle">🌿 NÚCLEO ESTRUCTURAL</text>
    <text x="470" y="58" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" text-anchor="middle">AgriTwin 3D: Suite de Gemelo Digital</text>
  </g>

  <!-- Conectores Tronco a 5 Ramas -->
  <path d="M 470 75 L 110 130" stroke="#059669" stroke-width="2" fill="none"/>
  <path d="M 470 75 L 290 130" stroke="#059669" stroke-width="2" fill="none"/>
  <path d="M 470 75 L 470 130" stroke="#059669" stroke-width="2" fill="none"/>
  <path d="M 470 75 L 650 130" stroke="#059669" stroke-width="2" fill="none"/>
  <path d="M 470 75 L 830 130" stroke="#059669" stroke-width="2" fill="none"/>

  <!-- Rama 1: Render 3D -->
  <g filter="url(#vTreeShadow)">
    <rect x="20" y="130" width="175" height="225" rx="12" fill="#FFFFFF" stroke="#EA580C" stroke-width="1.8"/>
    <rect x="20" y="130" width="175" height="32" rx="12" fill="#FFF7ED"/>
    <text x="107" y="151" fill="#C2410C" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="bold" text-anchor="middle">🎮 Motores 3D</text>
    
    <text x="32" y="180" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• Three.js r128</text>
    <text x="32" y="195" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">WebGL 2.0 @ 60 FPS</text>

    <text x="32" y="220" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• CesiumJS</text>
    <text x="32" y="235" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Ortofoto Esri + DEM</text>

    <text x="32" y="260" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• React Three Fiber</text>
    <text x="32" y="275" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Componentes 3D R3F</text>

    <text x="32" y="300" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• Shaders GLSL</text>
    <text x="32" y="315" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Normales Sobel &amp; Humedad</text>
  </g>

  <!-- Rama 2: Geoespacial -->
  <g filter="url(#vTreeShadow)">
    <rect x="205" y="130" width="175" height="225" rx="12" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.8"/>
    <rect x="205" y="130" width="175" height="32" rx="12" fill="#F0F9FF"/>
    <text x="292" y="151" fill="#0369A1" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="bold" text-anchor="middle">🗺️ Datos Espaciales</text>

    <text x="217" y="180" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• GLTF / GLB 2.0</text>
    <text x="217" y="195" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Vegetación &amp; Equipos</text>

    <text x="217" y="220" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• GeoJSON WGS84</text>
    <text x="217" y="235" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Potreros, Canales, Cercos</text>

    <text x="217" y="260" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• Shapefile (.shp)</text>
    <text x="217" y="275" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">shpjs parser vectorial</text>

    <text x="217" y="300" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• Ecosistema JSON</text>
    <text x="217" y="315" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Configuraciones Maestras</text>
  </g>

  <!-- Rama 3: Interfaz & UX -->
  <g filter="url(#vTreeShadow)">
    <rect x="390" y="130" width="170" height="225" rx="12" fill="#FFFFFF" stroke="#D97706" stroke-width="1.8"/>
    <rect x="390" y="130" width="170" height="32" rx="12" fill="#FEF3C7"/>
    <text x="475" y="151" fill="#92400E" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="bold" text-anchor="middle">🎛️ Interfaz &amp; UX</text>

    <text x="402" y="180" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• Glassmorphism</text>
    <text x="402" y="195" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Backdrop Filter Blur</text>

    <text x="402" y="220" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• Chart.js &amp; Canvas</text>
    <text x="402" y="235" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Series Temporales &amp; FDR</text>

    <text x="402" y="260" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• Tipografías</text>
    <text x="402" y="275" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Outfit, Inter, JetBrains</text>

    <text x="402" y="300" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• EventBus Pub/Sub</text>
    <text x="402" y="315" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Desacoplamiento Total</text>
  </g>

  <!-- Rama 4: Hardware IoT -->
  <g filter="url(#vTreeShadow)">
    <rect x="570" y="130" width="175" height="225" rx="12" fill="#FFFFFF" stroke="#059669" stroke-width="1.8"/>
    <rect x="570" y="130" width="175" height="32" rx="12" fill="#ECFDF5"/>
    <text x="657" y="151" fill="#065F46" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="bold" text-anchor="middle">🌱 Hardware IoT</text>

    <text x="582" y="180" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• ESP32 DevKit/S3</text>
    <text x="582" y="195" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Dual-Core Tensilica 240MHz</text>

    <text x="582" y="220" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• C / C++ Firmware</text>
    <text x="582" y="235" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Framework Arduino</text>

    <text x="582" y="260" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• Display SPI TFT</text>
    <text x="582" y="275" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">ILI9341 320x240 Local</text>

    <text x="582" y="300" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• Sondas &amp; Relés</text>
    <text x="582" y="315" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">FDR Multinivel + Opto</text>
  </g>

  <!-- Rama 5: Servidor & Sistema -->
  <g filter="url(#vTreeShadow)">
    <rect x="755" y="130" width="165" height="225" rx="12" fill="#FFFFFF" stroke="#4F46E5" stroke-width="1.8"/>
    <rect x="755" y="130" width="165" height="32" rx="12" fill="#EEF2FF"/>
    <text x="837" y="151" fill="#3730A3" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="bold" text-anchor="middle">⚡ Servidor &amp; OS</text>

    <text x="767" y="180" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• Node.js Nativo</text>
    <text x="767" y="195" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">server.cjs (:7773)</text>

    <text x="767" y="220" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• Sync Cuenca</text>
    <text x="767" y="235" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Acople Regional (:7774)</text>

    <text x="767" y="260" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• App Desktop</text>
    <text x="767" y="275" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Electron Wrapper</text>

    <text x="767" y="300" fill="#1C1917" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold">• Swift &amp; Bash</text>
    <text x="767" y="315" fill="#6B7280" font-family="'JetBrains Mono', monospace" font-size="8.5">Launchers &amp; Assets Mac</text>
  </g>
</svg>`,
                vision: `<svg viewBox="0 0 940 380" class="w-full min-w-[800px] h-auto select-none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="vVisShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#1C1917" flood-opacity="0.08"/>
    </filter>
    <marker id="vArrowVisRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#DC2626" />
    </marker>
    <marker id="vArrowVisAmber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706" />
    </marker>
    <marker id="vArrowVisGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669" />
    </marker>
  </defs>

  <!-- Carriles Verticales -->
  <line x1="120" y1="65" x2="120" y2="360" stroke="#E7DAC6" stroke-width="1.5" stroke-dasharray="4 4" />
  <line x1="310" y1="65" x2="310" y2="360" stroke="#E7DAC6" stroke-width="1.5" stroke-dasharray="4 4" />
  <line x1="500" y1="65" x2="500" y2="360" stroke="#E7DAC6" stroke-width="1.5" stroke-dasharray="4 4" />
  <line x1="690" y1="65" x2="690" y2="360" stroke="#E7DAC6" stroke-width="1.5" stroke-dasharray="4 4" />
  <line x1="860" y1="65" x2="860" y2="360" stroke="#E7DAC6" stroke-width="1.5" stroke-dasharray="4 4" />

  <!-- Cabeceras de Actores C2 -->
  <g filter="url(#vVisShadow)">
    <rect x="40" y="15" width="160" height="42" rx="10" fill="#FFFFFF" stroke="#059669" stroke-width="1.5"/>
    <text x="120" y="41" fill="#065F46" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" text-anchor="middle">📹 Cámara 4G Solar</text>

    <rect x="230" y="15" width="160" height="42" rx="10" fill="#FFFFFF" stroke="#DC2626" stroke-width="1.5"/>
    <text x="310" y="41" fill="#991B1B" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" text-anchor="middle">🧠 Edge AI (YOLOv8)</text>

    <rect x="420" y="15" width="160" height="42" rx="10" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
    <text x="500" y="41" fill="#92400E" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" text-anchor="middle">🌐 AgriTwin 3D (C2)</text>

    <rect x="610" y="15" width="160" height="42" rx="10" fill="#FFFFFF" stroke="#4F46E5" stroke-width="1.5"/>
    <text x="690" y="41" fill="#3730A3" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" text-anchor="middle">🏢 DJI Dock 2</text>

    <rect x="780" y="15" width="150" height="42" rx="10" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/>
    <text x="855" y="41" fill="#0369A1" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" text-anchor="middle">🚁 Dron Matrice 3D</text>
  </g>

  <!-- FASE 1: Detección Perimetral -->
  <rect x="50" y="80" width="450" height="85" rx="8" fill="#FEF2F2" stroke="#FECACA" stroke-width="1"/>
  <text x="65" y="98" fill="#991B1B" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold">🔴 FASE 1: DETECCIÓN PERIMETRAL EN EL BORDE</text>

  <path d="M 120 120 L 308 120" stroke="#DC2626" stroke-width="2" marker-end="url(#vArrowVisRed)"/>
  <text x="214" y="114" fill="#991B1B" font-family="'JetBrains Mono', monospace" font-size="8.5" text-anchor="middle">Stream RTSP (YOLOv8 Inferencia)</text>

  <path d="M 310 145 L 498 145" stroke="#DC2626" stroke-width="2" marker-end="url(#vArrowVisRed)"/>
  <text x="404" y="139" fill="#991B1B" font-family="'JetBrains Mono', monospace" font-size="8.5" text-anchor="middle">Alerta MQTT (Caída Caudal / Intrusión)</text>

  <!-- FASE 2: Despacho Táctico e Intercepción -->
  <rect x="360" y="180" width="550" height="90" rx="8" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1"/>
  <text x="375" y="198" fill="#92400E" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold">🟡 FASE 2: DESPACHO TÁCTICO &amp; INTERCEPCIÓN (&lt;90s)</text>

  <path d="M 500 220 L 688 220" stroke="#D97706" stroke-width="2" marker-end="url(#vArrowVisAmber)"/>
  <text x="594" y="214" fill="#92400E" font-family="'JetBrains Mono', monospace" font-size="8.5" text-anchor="middle">Comando MISSION_DISPATCH(Target_XYZ)</text>

  <path d="M 690 245 L 858 245" stroke="#4F46E5" stroke-width="2" marker-end="url(#vArrowVisAmber)"/>
  <text x="774" y="239" fill="#4338CA" font-family="'JetBrains Mono', monospace" font-size="8.5" text-anchor="middle">Apertura Domo + Despegue RTK</text>

  <!-- FASE 3: Cenital y Ortomosaico -->
  <rect x="420" y="285" width="490" height="75" rx="8" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1"/>
  <text x="435" y="303" fill="#065F46" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="bold">🟢 FASE 3: INSPECCIÓN CENITAL &amp; ORTOMOSAICO NDVI</text>

  <path d="M 860 330 L 502 330" stroke="#059669" stroke-width="2" marker-end="url(#vArrowVisGreen)"/>
  <text x="681" y="324" fill="#065F46" font-family="'JetBrains Mono', monospace" font-size="8.5" text-anchor="middle">Telemetría RTK + Video Térmico/RGB + Ortomosaico 3D</text>
</svg>`
            };

            container.innerHTML = svgs[type] || svgs.arch;
        };

        window.switchScriptDatasetItem = function(itemId) {
            document.querySelectorAll('.script-detail-panel').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.script-nav-item').forEach(el => {
                el.classList.remove('script-item-active');
                el.classList.remove('border-[#D97706]');
                el.classList.add('border-transparent');
            });

            const targetDetail = document.getElementById('script-detail-' + itemId);
            if (targetDetail) targetDetail.classList.remove('hidden');

            const targetNav = document.getElementById('script-nav-' + itemId);
            if (targetNav) {
                targetNav.classList.add('script-item-active');
                targetNav.classList.remove('border-transparent');
                targetNav.classList.add('border-[#D97706]');
            }

            if (itemId === 'catastro') {
                const geoJsonView = document.getElementById('geojsonCodeView');
                if (geoJsonView && typeof geojsonPredios !== 'undefined') {
                    geoJsonView.innerText = JSON.stringify(geojsonPredios, null, 2);
                }
            }
        };

        // Filtro en Vivo de Scripts & Datasets
        window.filterScriptsAndDatasets = function(query) {
            const q = (query || '').toLowerCase().trim();
            document.querySelectorAll('.script-nav-item').forEach(item => {
                const text = item.innerText.toLowerCase();
                if (!q || text.includes(q)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        };

        // Portapapeles para Código y Datasets
        window.copyCodeToClipboard = function(elementId) {
            const el = document.getElementById(elementId);
            if (!el) return;
            const text = el.innerText || el.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-mono shadow-2xl flex items-center gap-2 border border-stone-700';
                toast.innerHTML = '<span>✅</span> Código copiado al portapapeles';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2500);
            });
        };

        window.copyGeoJSONToClipboard = function() {
            if (typeof geojsonPredios !== 'undefined') {
                navigator.clipboard.writeText(JSON.stringify(geojsonPredios, null, 2)).then(() => {
                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-2 rounded-xl bg-emerald-900 text-white text-xs font-mono shadow-2xl flex items-center gap-2 border border-emerald-700';
                    toast.innerHTML = '<span>🗺️</span> GeoJSON copiado al portapapeles';
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 2500);
                });
            }
        };



// =========================================================================
// PANTALLAS DE TRANSICIÓN CINEMÁTICA CON TÍBET & PEPITA (3 SEGUNDOS)
// =========================================================================
const TRANSITION_DATA = {
    galpon: {
        title: 'El Galpón Predial • Fundo Meniel',
        subtitle: 'Ingresando al Taller Biofísico & Gemelo Digital 3D...',
        image: 'assets/ui/transitions/trans_galpon_tibet_pepita_1790989846786.jpg',
        tip: '💡 Tíbet y Pepita inspeccionan la telemetría IoT y los planos de curvas a nivel Keyline antes de encender las mallas 3D.'
    },
    invernadero: {
        title: 'Invernadero & Cultivos • Agroecología',
        subtitle: 'Abriendo el Catálogo Botánico, Biopreparados & Cuarteles...',
        image: 'assets/ui/transitions/trans_cultivos_tibet_pepita_1790989795731.jpg',
        tip: '🌱 Tíbet olfatea los almácigos de tomate cherry mientras Pepita vigila los viñedos y huertos exteriores.'
    },
    establo: {
        title: 'Establo & Sanidad Ganadera • Pastoreo Voisin',
        subtitle: 'Conectando Fichas SAG RFID, Curvas de Peso & Rotación...',
        image: 'assets/ui/transitions/trans_establo_tibet_pepita_1790989811912.jpg',
        tip: '🐂 Pepita protege la manga de pesaje y Tíbet saluda al lote de vacas en descanso forrajero.'
    },
    incursion: {
        title: 'Incursión a Campo • Rewilding & Suelo Vivo',
        subtitle: 'Cargando Protocolos de Monitoreo VESS & Fitosociología...',
        image: 'assets/ui/transitions/trans_incursion_tibet_pepita_1790989829077.jpg',
        tip: '🧭 En lo profundo del bosque esclerófilo, Tíbet lleva el estuche de protocolos y Pepita abre la huella de expedición.'
    },
    cerro: {
        title: 'La Cumbre del Cerro • Macro-Cuenca (122k ha)',
        subtitle: 'Sintonizando el Simulador de Crecidas del Río Longaví...',
        image: 'assets/ui/transitions/trans_cerro_tibet_pepita_1790989864303.jpg',
        tip: '🏔️ Mirador panorámico: Tíbet y Pepita contemplan la cuenca alta y las estaciones climáticas con viento Puelche.'
    },
    mesa: {
        title: 'La Mesa de Vecinos • Gobernanza Rural DAO',
        subtitle: 'Reuniendo los 10 Predios Colindantes y Acuerdos de Borde...',
        image: 'assets/ui/transitions/trans_mesa_tibet_pepita_1790989882756.jpg',
        tip: '🤝 Alrededor del fuego comunitario, Tíbet y Pepita acompañan la asamblea vecinal y los pactos cortafuego.'
    }
};

let activeTransitionTimeout = null;

function triggerCinematicTransition(targetMode, callback) {
    const data = TRANSITION_DATA[targetMode] || TRANSITION_DATA.galpon;
    let overlay = document.getElementById('cinematicTransitionOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'cinematicTransitionOverlay';
        overlay.className = 'fixed inset-0 z-[9999] flex flex-col justify-between p-6 sm:p-12 select-none overflow-hidden transition-opacity duration-500';
        overlay.style.background = '#0a0d14';
        overlay.innerHTML = `
            <div id="transBgImg" class="absolute inset-0 w-full h-full bg-cover bg-center filter brightness-90 transform scale-100 transition-transform duration-3000 ease-out"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-stone-950/80 pointer-events-none"></div>
            
            <!-- Header Superior -->
            <div class="relative z-10 flex items-center justify-between">
                <div class="flex items-center gap-3 bg-stone-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
                    <span class="text-xl">🐕</span>
                    <div>
                        <div class="text-xs font-black text-amber-400 font-mono tracking-wider uppercase">Tíbet & Pepita • Guías del Fundo</div>
                        <div id="transSubtitle" class="text-[11px] text-stone-300 font-sans">Cambiando de escenario...</div>
                    </div>
                </div>
                <button id="btnSkipTrans" class="relative z-10 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 border border-white/20 text-xs font-mono font-bold transition-all cursor-pointer">Saltar (Esc) ⏭️</button>
            </div>

            <!-- Footer Inferior con Barra de Progreso y Consejo -->
            <div class="relative z-10 max-w-3xl space-y-3">
                <div>
                    <span id="transTitle" class="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight drop-shadow-md">AgroTwin Suite</span>
                </div>
                <p id="transTip" class="text-xs sm:text-sm text-amber-100/90 font-sans leading-relaxed drop-shadow bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10"></p>
                
                <!-- Barra de carga 3s -->
                <div class="w-full bg-stone-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/15 shadow-inner">
                    <div id="transProgressBar" class="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-3000 ease-linear" style="width: 0%;"></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('btnSkipTrans')?.addEventListener('click', () => {
            if (typeof window.completeTransitionEarly === 'function') {
                window.completeTransitionEarly();
            }
        });
    }

    const bgEl = document.getElementById('transBgImg');
    const titleEl = document.getElementById('transTitle');
    const subEl = document.getElementById('transSubtitle');
    const tipEl = document.getElementById('transTip');
    const barEl = document.getElementById('transProgressBar');

    if (bgEl) {
        bgEl.style.backgroundImage = `url("${data.image}")`;
        bgEl.style.transform = 'scale(1.04)';
    }
    if (titleEl) titleEl.textContent = data.title;
    if (subEl) subEl.textContent = data.subtitle;
    if (tipEl) tipEl.textContent = data.tip;
    if (barEl) {
        barEl.style.transition = 'none';
        barEl.style.width = '0%';
        setTimeout(() => {
            barEl.style.transition = 'width 3000ms linear';
            barEl.style.width = '100%';
        }, 50);
    }

    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';

    let executed = false;
    const finish = () => {
        if (executed) return;
        executed = true;
        if (activeTransitionTimeout) clearTimeout(activeTransitionTimeout);
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
        if (typeof callback === 'function') callback();
    };

    window.completeTransitionEarly = finish;
    activeTransitionTimeout = setTimeout(finish, 3000);
}

function launchModeWithTransition(modeName) {
    triggerCinematicTransition(modeName, () => {
        if (modeName === 'galpon') openPredioModeDirect();
        else if (modeName === 'invernadero') openInvernaderoModeDirect();
        else if (modeName === 'establo') openEstabloModeDirect();
        else if (modeName === 'incursion') openIncursionModeDirect();
        else if (modeName === 'cerro') openCerroModeDirect();
        else if (modeName === 'mesa') openMesaModeDirect();
    });
}

function openPredioMode() { launchModeWithTransition('galpon'); }
function openInvernaderoMode() { launchModeWithTransition('invernadero'); }
function openEstabloMode() { launchModeWithTransition('establo'); }
function openIncursionMode() { launchModeWithTransition('incursion'); }
function openCerroMode() { launchModeWithTransition('cerro'); }
function openMesaMode() { launchModeWithTransition('mesa'); }

function openPredioModeDirect() {
    switchMasterView('galpon');
}

let hubPlanMaestroActive = false;

function setPlanMaestroState(active) {
    hubPlanMaestroActive = !!active;
    const btnToggle = document.getElementById('hubBtnTogglePlanMaestro');
    const btnLabel = document.getElementById('hubPlanMaestroBtnLabel');
    const lbl = document.getElementById('hubPredioActiveModeLabel');
    const yeomansBtn = document.getElementById('hubBtnYeomansToggle');
    const dossierBtn = document.getElementById('hubBtnDossierObra');

    if (btnToggle) {
        if (hubPlanMaestroActive) {
            btnToggle.className = 'px-3.5 py-1.5 rounded-xl text-xs font-mono font-black bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 border border-amber-400 shadow-lg shadow-amber-500/30 transition-all cursor-pointer flex items-center gap-2';
            if (btnLabel) btnLabel.textContent = 'Plan Maestro (Activo)';
            if (lbl) {
                lbl.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span><span>PLAN MAESTRO (18 Puntos Yeomans)</span>';
                lbl.className = 'text-xs font-mono font-bold text-amber-400 hidden sm:flex items-center gap-1.5';
            }
            if (yeomansBtn) yeomansBtn.style.display = 'inline-flex';
            if (dossierBtn) dossierBtn.style.display = 'inline-flex';
        } else {
            btnToggle.className = 'px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-stone-900 text-stone-300 border border-amber-500/30 hover:border-amber-500/70 hover:text-white transition-all cursor-pointer flex items-center gap-2 shadow-md';
            if (btnLabel) btnLabel.textContent = 'Plan Maestro';
            if (lbl) {
                lbl.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400"></span><span>MODO PREDIO 3D</span>';
                lbl.className = 'text-xs font-mono font-bold text-amber-400 hidden sm:flex items-center gap-1.5';
            }
            if (yeomansBtn) yeomansBtn.style.display = 'none';
            if (dossierBtn) dossierBtn.style.display = 'none';
        }
    }

    try {
        const iframe = document.querySelector('#view-galpon iframe') || document.getElementById('iframePredio');
        if (iframe && iframe.contentWindow) {
            if (typeof iframe.contentWindow.setPlanMaestro === 'function') {
                iframe.contentWindow.setPlanMaestro(hubPlanMaestroActive);
            } else if (typeof iframe.contentWindow.setPredioDualMode === 'function') {
                iframe.contentWindow.setPredioDualMode(hubPlanMaestroActive ? 'designer' : 'predio');
            } else {
                iframe.contentWindow.postMessage({ action: 'setPlanMaestro', active: hubPlanMaestroActive }, '*');
            }
            if (hubPlanMaestroActive && typeof iframe.contentWindow.closeGalponWorkshop === 'function') {
                iframe.contentWindow.closeGalponWorkshop();
            }
        }
    } catch(e) {
        console.warn('Sync plan maestro mode err:', e);
    }
}
window.setPlanMaestroState = setPlanMaestroState;

function togglePlanMaestroMode() {
    setPlanMaestroState(!hubPlanMaestroActive);
}
window.togglePlanMaestroMode = togglePlanMaestroMode;

// Compatibilidad hacia atrás si algún link externo llama setHubPredioMode
function setHubPredioMode(mode) {
    setPlanMaestroState(mode === 'designer' || mode === 'plan_maestro');
}
window.setHubPredioMode = setHubPredioMode;

function triggerHubWhatIfRain() {
    try {
        const iframe = document.querySelector('#view-galpon iframe') || document.getElementById('iframePredio');
        if (iframe && iframe.contentWindow) {
            if (typeof iframe.contentWindow.closeGalponWorkshop === 'function') {
                iframe.contentWindow.closeGalponWorkshop();
            }
            if (typeof iframe.contentWindow.triggerWhatIfStorm === 'function') {
                iframe.contentWindow.triggerWhatIfStorm();
            } else {
                iframe.contentWindow.postMessage({ action: 'whatif' }, '*');
            }
        }
    } catch(e) {}
}
window.triggerHubWhatIfRain = triggerHubWhatIfRain;

function triggerHubYeomansPanel() {
    try {
        const iframe = document.querySelector('#view-galpon iframe') || document.getElementById('iframePredio');
        if (iframe && iframe.contentWindow) {
            if (typeof iframe.contentWindow.closeGalponWorkshop === 'function') {
                iframe.contentWindow.closeGalponWorkshop();
            }
            if (typeof iframe.contentWindow.toggleYeomansPanel === 'function') {
                iframe.contentWindow.toggleYeomansPanel();
            } else {
                iframe.contentWindow.postMessage({ action: 'toggleYeomans' }, '*');
            }
        }
    } catch(e) {}
}
window.triggerHubYeomansPanel = triggerHubYeomansPanel;

function triggerHubDossier() {
    try {
        const iframe = document.querySelector('#view-galpon iframe') || document.getElementById('iframePredio');
        if (iframe && iframe.contentWindow) {
            if (typeof iframe.contentWindow.openDossierPlanMaestroModal === 'function') {
                iframe.contentWindow.openDossierPlanMaestroModal();
            } else {
                iframe.contentWindow.postMessage({ action: 'dossier' }, '*');
            }
        }
    } catch(e) {}
}
window.triggerHubDossier = triggerHubDossier;

function toggleHubWorkshop3D() {
    try {
        const iframe = document.querySelector('#view-galpon iframe') || document.getElementById('iframePredio');
        if (iframe && iframe.contentWindow) {
            if (typeof iframe.contentWindow.toggleGalponWorkshop === 'function') {
                iframe.contentWindow.toggleGalponWorkshop();
            } else {
                iframe.contentWindow.postMessage({ action: 'toggleWorkshop' }, '*');
            }
        }
    } catch(e) {}
}
window.toggleHubWorkshop3D = toggleHubWorkshop3D;

function openInvernaderoModeDirect() {
    switchMasterView('invernadero');
    toggleInvernaderoCampaignBoard(true);
}

function openEstabloModeDirect() {
    switchMasterView('establo');
}

function openIncursionModeDirect() {
    switchMasterView('incursion');
    toggleIncursionCampaignBoard(true);
}

function openCerroModeDirect() {
    openCerroMapWithTab('tab-tiempo');
}

function openMesaModeDirect() {
    switchMasterView('mesa');
    if (typeof initMesaSuite === 'function') initMesaSuite();
    if (typeof openMesaCampaignBoard === 'function') openMesaCampaignBoard();
}

function toggleInvernaderoCampaignBoard(show) {
    const b = document.getElementById('invernaderoCampaignBoard');
    const r = document.getElementById('btnOpenInvernaderoCampaignBoard');
    if (b) {
        b.style.display = show ? 'flex' : 'none';
        if (r) r.style.display = show ? 'none' : 'inline-flex';
    }
}

function toggleEstabloCampaignBoard(show) {
    const b = document.getElementById('establoCampaignBoard');
    const r = document.getElementById('btnOpenEstabloCampaignBoard');
    if (b) {
        b.style.display = show ? 'flex' : 'none';
        if (r) r.style.display = show ? 'none' : 'inline-flex';
    }
}

function toggleIncursionCampaignBoard(show) {
    const b = document.getElementById('incursionCampaignBoard');
    const r = document.getElementById('btnOpenIncursionCampaignBoard');
    if (b) {
        b.style.display = show ? 'flex' : 'none';
        if (r) r.style.display = show ? 'none' : 'inline-flex';
    }
}

/**
 * Conmuta hacia la Caja de Terreno industrial IP67 (TFT ESP32 & Relés)
 * en la rama deseada ('general' | 'cuarteles' | 'establo').
 */
function openCajaTerrenoFromHub(branch = 'general') {
    switchMasterView('galpon');
    try {
        const iframe = document.querySelector('#view-galpon iframe');
        if (iframe) {
            const trigger = () => {
                try {
                    if (iframe.contentWindow && typeof iframe.contentWindow.openGalponWorkshop === 'function') {
                        iframe.contentWindow.openGalponWorkshop(branch);
                    } else if (iframe.contentWindow) {
                        iframe.contentWindow.postMessage({ action: 'openWorkshop', branch: branch }, '*');
                    }
                } catch(e) {}
            };
            trigger();
            iframe.removeEventListener('load', trigger);
            iframe.addEventListener('load', trigger, { once: true });
            setTimeout(trigger, 300);
            setTimeout(trigger, 800);
        }
    } catch(err) {
        console.error('Error abriendo Caja de Terreno desde Hub:', err);
    }
}
window.openCajaTerrenoFromHub = openCajaTerrenoFromHub;


function openRewildProtocolDrawer() {
    const modal = document.getElementById('rewildProtocolDrawerModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

function closeRewildProtocolDrawer() {
    const modal = document.getElementById('rewildProtocolDrawerModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}
window.openRewildProtocolDrawer = openRewildProtocolDrawer;
window.closeRewildProtocolDrawer = closeRewildProtocolDrawer;

// ═══════════════════════════════════════════════════════════════════
// CUADERNO DE CAMPO & NOTAS DEL OPERADOR (6 RAMAS AOE • HUB LEVEL)
// 100% DESACOPLADO • LOCALSTORAGE SOBERANO • CERO IMPACTO EN DATOS CENTRALES
// ═══════════════════════════════════════════════════════════════════
const HUB_CUADERNO_STORAGE_KEY = 'agritwin_operator_fieldnotes_v1';
let hubCuadernoActiveTab = 'tasks';
let hubCuadernoActiveBranch = 'all';

const HUB_CUADERNO_BRANCHES = [
    { id: 'galpon', name: 'El Galpón Predial (3D)', icon: '🏡', color: '#0284c7', bg: 'bg-sky-50 text-sky-800 border-sky-300', targetView: 'galpon', desc: 'Zona 0 y 1 • Gemelo 3D Meniel' },
    { id: 'invernadero', name: 'Invernadero & Cultivos', icon: '🌿', color: '#059669', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', targetView: 'invernadero', desc: 'Zona 1 y 2 • Suelo vivo y biointensivo' },
    { id: 'establo', name: 'Establo & Ganadería PRV', icon: '🐄', color: '#d97706', bg: 'bg-amber-50 text-amber-800 border-amber-300', targetView: 'establo', desc: 'Zona 2 y 3 • Pastoreo Voisin y forraje' },
    { id: 'incursion', name: 'Incursión a Campo (Rewilding)', icon: '🌲', color: '#65a30d', bg: 'bg-lime-50 text-lime-800 border-lime-300', targetView: 'incursion', desc: 'Zona 5 • Monitoreo silvestre y fauna' },
    { id: 'cerro', name: 'La Cumbre del Cerro (Cuenca)', icon: '🏔️', color: '#7c3aed', bg: 'bg-purple-50 text-purple-800 border-purple-300', targetView: 'cerro', desc: 'Zona 4 y Macro • 122.000 ha de cuenca' },
    { id: 'mesa', name: 'La Mesa Vecinal DAO', icon: '👥', color: '#2563eb', bg: 'bg-blue-50 text-blue-800 border-blue-300', targetView: 'mesa', desc: 'Gobernanza comunitaria de 10 predios' }
];

function loadHubCuadernoData() {
    try {
        const raw = localStorage.getItem(HUB_CUADERNO_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                tasks: parsed.tasks || [],
                scratchpad: parsed.scratchpad || ''
            };
        }
    } catch(e) {
        console.warn('[Cuaderno Hub] Error al leer localStorage:', e);
    }

    // Datos iniciales de demostración en las 6 ramas AoE
    return {
        tasks: [
            {
                id: 'task_hub_1',
                text: 'Comprobar afilado de herramientas y cuchillas en el Taller del Galpón',
                branchId: 'galpon',
                isPersonal: false,
                completed: false,
                createdAt: Date.now() - 3600000
            },
            {
                id: 'task_hub_2',
                text: 'Verificar humedad y volteo de pila de Bokashi en el Invernadero',
                branchId: 'invernadero',
                isPersonal: false,
                completed: false,
                createdAt: Date.now() - 2400000
            },
            {
                id: 'task_hub_3',
                text: 'Revisar rotación de Clarita hacia potrero P4 y nivel del bebedero',
                branchId: 'establo',
                isPersonal: false,
                completed: false,
                createdAt: Date.now() - 1800000
            },
            {
                id: 'task_hub_4',
                text: 'Pedir guantes de recambio a bodega y avisar cambio de turno',
                branchId: 'galpon',
                isPersonal: true,
                completed: true,
                createdAt: Date.now() - 7200000
            }
        ],
        scratchpad: "Notas libres de faena:\n- Viento Puelche calmo en la cuenca, radiación favorable para secado.\n- Buen aforo en zanja Keyline y rotación Voisin en orden.\n- Asunto personal: confirmar recambio de botas de agua para el próximo turno."
    };
}

function saveHubCuadernoData(data) {
    try {
        localStorage.setItem(HUB_CUADERNO_STORAGE_KEY, JSON.stringify(data));
        updateHubCuadernoBadges();
    } catch(e) {
        console.error('[Cuaderno Hub] Error al guardar datos:', e);
    }
}

function updateHubCuadernoBadges() {
    const data = loadHubCuadernoData();
    const pendingCount = data.tasks.filter(t => !t.completed).length;

    // Badge en Navbar superior
    const navBadge = document.getElementById('hubPendingBadge');
    if (navBadge) {
        if (pendingCount > 0) {
            navBadge.textContent = pendingCount;
            navBadge.classList.remove('hidden');
        } else {
            navBadge.classList.add('hidden');
        }
    }

    // Texto de pendientes en la vista
    const pendingText = document.getElementById('hubCuadernoPendingText');
    if (pendingText) {
        pendingText.textContent = `${pendingCount} tarea${pendingCount === 1 ? '' : 's'} pendiente${pendingCount === 1 ? '' : 's'}`;
    }

    // Contadores por rama
    const countAll = document.getElementById('countBranch-all');
    if (countAll) countAll.textContent = pendingCount;

    HUB_CUADERNO_BRANCHES.forEach(b => {
        const el = document.getElementById(`countBranch-${b.id}`);
        if (el) {
            const count = data.tasks.filter(t => t.branchId === b.id && !t.completed).length;
            el.textContent = count;
        }
    });
}

function initHubCuadernoView() {
    updateHubCuadernoBadges();
    renderHubCuadernoTasks();
    const data = loadHubCuadernoData();
    const textarea = document.getElementById('hubCuadernoScratchpadTextarea');
    const charCount = document.getElementById('hubCuadernoCharCount');
    if (textarea) {
        textarea.value = data.scratchpad || '';
        if (charCount) charCount.textContent = `${textarea.value.length} caracteres`;
    }
}

function switchHubCuadernoTab(tab) {
    hubCuadernoActiveTab = tab;
    const btnTasks = document.getElementById('hubCuadernoTabBtn-tasks');
    const btnScratch = document.getElementById('hubCuadernoTabBtn-scratchpad');
    const contentTasks = document.getElementById('hubCuadernoContent-tasks');
    const contentScratch = document.getElementById('hubCuadernoContent-scratchpad');

    if (tab === 'tasks') {
        if (btnTasks) btnTasks.className = 'px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer bg-amber-600 text-white shadow-sm';
        if (btnScratch) btnScratch.className = 'px-4 py-2 rounded-xl text-xs font-mono font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 flex items-center gap-2 transition-all cursor-pointer';
        if (contentTasks) contentTasks.style.display = 'block';
        if (contentScratch) contentScratch.style.display = 'none';
        renderHubCuadernoTasks();
    } else {
        if (btnTasks) btnTasks.className = 'px-4 py-2 rounded-xl text-xs font-mono font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 flex items-center gap-2 transition-all cursor-pointer';
        if (btnScratch) btnScratch.className = 'px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer bg-amber-600 text-white shadow-sm';
        if (contentTasks) contentTasks.style.display = 'none';
        if (contentScratch) contentScratch.style.display = 'block';
        const textarea = document.getElementById('hubCuadernoScratchpadTextarea');
        if (textarea) textarea.focus();
    }
}

function filterHubCuadernoBranch(branchId) {
    hubCuadernoActiveBranch = branchId;
    const allBranches = ['all', 'galpon', 'invernadero', 'establo', 'incursion', 'cerro', 'mesa'];
    allBranches.forEach(b => {
        const btn = document.getElementById(`branchFilter-${b}`);
        if (btn) {
            if (b === branchId) {
                btn.className = 'px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer bg-amber-600 text-white border-amber-600 shadow-sm';
            } else {
                btn.className = 'px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer bg-white text-stone-700 border-[#E7DAC6] hover:bg-stone-100';
            }
        }
    });
    renderHubCuadernoTasks();
}

function renderHubCuadernoTasks() {
    const container = document.getElementById('hubCuadernoTasksContainer');
    if (!container) return;

    const data = loadHubCuadernoData();
    let tasks = data.tasks;

    if (hubCuadernoActiveBranch !== 'all') {
        tasks = tasks.filter(t => t.branchId === hubCuadernoActiveBranch);
    }

    const pending = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);

    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="p-8 rounded-2xl bg-white border border-[#E7DAC6] text-center space-y-2">
                <span class="text-3xl">🌱</span>
                <div class="font-serif font-bold text-stone-800 text-sm">Sin tareas registradas en esta rama</div>
                <p class="text-xs text-stone-500 font-sans max-w-md mx-auto">
                    Usa el campo superior para anotar pendientes de terreno, checklists diarios o notas personales.
                </p>
            </div>
        `;
        return;
    }

    let html = '<div class="space-y-2.5">';

    // Renderizar pendientes
    if (pending.length > 0) {
        html += pending.map(t => renderHubTaskItemHTML(t)).join('');
    }

    // Renderizar completadas
    if (completed.length > 0) {
        html += `
            <div class="pt-4 pb-1 border-b border-stone-200 flex items-center justify-between font-mono text-[11px] text-stone-500">
                <span>TAREAS REALIZADAS (${completed.length})</span>
            </div>
        `;
        html += completed.map(t => renderHubTaskItemHTML(t)).join('');
    }

    html += '</div>';
    container.innerHTML = html;
}

function renderHubTaskItemHTML(task) {
    const branch = HUB_CUADERNO_BRANCHES.find(b => b.id === task.branchId) || HUB_CUADERNO_BRANCHES[0];
    const isDone = !!task.completed;
    const timeFormatted = formatHubCuadernoTime(task.createdAt);

    return `
        <div class="p-3.5 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-3 ${isDone ? 'bg-stone-50/60 border-stone-200 opacity-60' : 'bg-white border-[#E7DAC6] shadow-sm hover:border-amber-400'}">
            <div class="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                <input type="checkbox" onchange="toggleHubCuadernoTask('${task.id}')" ${isDone ? 'checked' : ''} class="mt-0.5 sm:mt-0 w-4 h-4 text-amber-600 rounded border-stone-300 cursor-pointer">
                <div class="flex-1 min-w-0">
                    <div class="text-xs sm:text-sm font-sans ${isDone ? 'line-through text-stone-400' : 'text-stone-800 font-medium'} break-words">
                        ${escapeHubHTML(task.text)}
                    </div>
                    <div class="flex items-center gap-2 mt-1 flex-wrap text-[10px] font-mono text-stone-500">
                        <span class="px-2 py-0.5 rounded border font-semibold flex items-center gap-1 ${branch.bg}">
                            <span>${branch.icon}</span> ${branch.name}
                        </span>
                        ${task.isPersonal ? '<span class="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-bold">👤 Personal</span>' : ''}
                        <span>•</span>
                        <span>${timeFormatted}</span>
                        <!-- Botón de salto diegético a la rama AoE correspondiente -->
                        <button onclick="switchMasterView('${branch.targetView}')" class="text-amber-700 hover:text-amber-900 underline font-bold ml-1 cursor-pointer" title="Ir a la vista de esta rama">
                            [Abrir Rama ↗]
                        </button>
                    </div>
                </div>
            </div>
            <button onclick="deleteHubCuadernoTask('${task.id}')" class="text-stone-400 hover:text-rose-600 transition-colors text-base font-bold px-2 py-1 cursor-pointer" title="Eliminar apunte">
                &times;
            </button>
        </div>
    `;
}

function addHubCuadernoTask() {
    const input = document.getElementById('hubCuadernoNewTaskInput');
    const branchSelect = document.getElementById('hubCuadernoNewTaskBranch');
    const personalCheck = document.getElementById('hubCuadernoNewTaskPersonal');

    if (!input || !input.value.trim()) return;

    const text = input.value.trim();
    const branchId = branchSelect ? branchSelect.value : (hubCuadernoActiveBranch !== 'all' ? hubCuadernoActiveBranch : 'galpon');
    const isPersonal = personalCheck ? personalCheck.checked : false;

    const data = loadHubCuadernoData();
    const newTask = {
        id: 'task_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        text: text,
        branchId: branchId,
        isPersonal: isPersonal,
        completed: false,
        createdAt: Date.now()
    };

    data.tasks.unshift(newTask);
    saveHubCuadernoData(data);

    input.value = '';
    if (personalCheck) personalCheck.checked = false;
    renderHubCuadernoTasks();
}

function toggleHubCuadernoTask(id) {
    const data = loadHubCuadernoData();
    const task = data.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveHubCuadernoData(data);
        renderHubCuadernoTasks();
    }
}

function deleteHubCuadernoTask(id) {
    const data = loadHubCuadernoData();
    data.tasks = data.tasks.filter(t => t.id !== id);
    saveHubCuadernoData(data);
    renderHubCuadernoTasks();
}

function clearHubCuadernoCompleted() {
    const data = loadHubCuadernoData();
    const countCompleted = data.tasks.filter(t => t.completed).length;
    if (countCompleted === 0) return;

    data.tasks = data.tasks.filter(t => !t.completed);
    saveHubCuadernoData(data);
    renderHubCuadernoTasks();
}

let hubCuadernoAutosaveTimer = null;
function saveHubCuadernoScratchpad() {
    const textarea = document.getElementById('hubCuadernoScratchpadTextarea');
    const charCount = document.getElementById('hubCuadernoCharCount');
    const indicator = document.getElementById('hubCuadernoAutosaveIndicator');

    if (!textarea) return;
    const text = textarea.value;
    if (charCount) charCount.textContent = `${text.length} caracteres`;

    if (indicator) indicator.textContent = 'Guardando...';

    clearTimeout(hubCuadernoAutosaveTimer);
    hubCuadernoAutosaveTimer = setTimeout(() => {
        const data = loadHubCuadernoData();
        data.scratchpad = text;
        saveHubCuadernoData(data);
        if (indicator) indicator.textContent = 'Guardado localmente';
        setTimeout(() => {
            if (indicator) indicator.textContent = 'Autoguardado al escribir';
        }, 1200);
    }, 400);
}

function exportHubCuadernoTxt() {
    const data = loadHubCuadernoData();
    let content = "=========================================================\n";
    content += "AGRITWIN • CUADERNO DE CAMPO & NOTAS DEL OPERADOR\n";
    content += `Fecha de Exportación: ${new Date().toLocaleString()}\n`;
    content += "Almacenamiento Local Soberano (Desacoplado de la base central)\n";
    content += "=========================================================\n\n";

    content += "--- TAREAS & CHECKLISTS POR RAMAS ---\n";
    if (data.tasks.length === 0) {
        content += "(Sin tareas registradas)\n";
    } else {
        data.tasks.forEach((t, i) => {
            const branch = HUB_CUADERNO_BRANCHES.find(b => b.id === t.branchId) || { name: t.branchId };
            const status = t.completed ? "[X] REALIZADA" : "[ ] PENDIENTE";
            const pers = t.isPersonal ? " [👤 Personal]" : "";
            content += `${i + 1}. ${status} [${branch.name}]${pers}: ${t.text}\n`;
        });
    }

    content += "\n--- BLOC LIBRE DE ANOTACIONES ---\n";
    content += (data.scratchpad || "(Vacío)").trim() + "\n\n";
    content += "=========================================================\n";
    content += "Fin del Cuaderno de Operador • AgroTwin Maule Sur\n";

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cuaderno_operador_agritwin_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatHubCuadernoTime(ts) {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'hace un instante';
    if (mins < 60) return `hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
}

function escapeHubHTML(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Inicializar badges y datos de cuaderno al cargar el Hub
document.addEventListener('DOMContentLoaded', () => {
    updateHubCuadernoBadges();
});

// ═══════════════════════════════════════════════════════════════════
// EXPOSICIÓN GLOBAL EN WINDOW (GARANTÍA PARA ONCLICK INLINE Y EVENTOS)
// ═══════════════════════════════════════════════════════════════════
window.switchMasterView = switchMasterView;
window.switchDocsTab = switchDocsTab;
window.initHubCuadernoView = initHubCuadernoView;
window.switchHubCuadernoTab = switchHubCuadernoTab;
window.filterHubCuadernoBranch = filterHubCuadernoBranch;
window.addHubCuadernoTask = addHubCuadernoTask;
window.toggleHubCuadernoTask = toggleHubCuadernoTask;
window.deleteHubCuadernoTask = deleteHubCuadernoTask;
window.saveHubCuadernoScratchpad = saveHubCuadernoScratchpad;
window.exportHubCuadernoTxt = exportHubCuadernoTxt;
window.openPredioModeDirect = openPredioModeDirect;
window.openInvernaderoModeDirect = openInvernaderoModeDirect;
window.openEstabloModeDirect = openEstabloModeDirect;
window.openIncursionModeDirect = openIncursionModeDirect;
window.openCerroModeDirect = openCerroModeDirect;
window.openMesaModeDirect = openMesaModeDirect;
window.openCerroMapWithTab = openCerroMapWithTab;
window.flyToCerroLocation = flyToCerroLocation;

