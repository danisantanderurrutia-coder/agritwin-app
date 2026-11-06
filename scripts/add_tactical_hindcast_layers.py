# -*- coding: utf-8 -*-
with open('/Users/danielsantander/Documents/agritwin-app/js/hub/geo-layers.js', 'r', encoding='utf-8') as f:
    geo = f.read()

# Buscamos la sección donde se dibuja hindcastSimulationLayer en loadHindcastBenchmarkInCuenca
target = '''            // 5. Dibujar Elipse y Vector en hindcastSimulationLayer
            hindcastSimulationLayer.clearLayers();'''

replacement = '''            // 5. Dibujar la SUITE TÁCTICA COMPLETA DE AGRITWIN en hindcastSimulationLayer:
            //    • Elipse paramétrica Rothermel-Fons
            //    • Transectos de amenaza pirogénica calibrados (P-01..P-03)
            //    • Haces vectoriales balísticos de cabeza y flancos (Huygens)
            //    • Faja defensiva WUI de contención y diagnóstico de salto de pavesas
            //    • Marcadores de foco y spotting
            hindcastSimulationLayer.clearLayers();

            if (isVina) {
                // ── TRANSECTOS TÁCTICOS VIÑA DEL MAR (P-VINA-01 A 03) ──
                const cellVina01 = createTacticalAlertCell({
                    id: 'P-VINA-01',
                    threatType: 'fire',
                    severityPercent: 95,
                    name: '🔥 Foco Peñuelas & Eucalipto Denso',
                    phase: '0-2h Disparo Inicial',
                    color: '#ef4444',
                    badgeLabel: '[P-VINA-01] 95% CRÍTICO • FWI 72',
                    coords: [[-33.1500, -71.5150], [-33.1500, -71.4850], [-33.1250, -71.4850], [-33.1250, -71.5150]],
                    metricsHtml: `
                        <div>• FWI Severidad: <b style="color:#ef4444;">72 (Extremo)</b></div>
                        <div>• Ráfaga Sur: <b style="color:#f97316;">65 km/h S–SSO</b></div>
                        <div>• Llama Altura: <b style="color:#fde047;">5.4 m</b></div>
                        <div>• Avance Cabeza: <b style="color:#f87171;">1.35 km/h ▲</b></div>
                    `,
                    notes: '🎯 Ignición en sotobosque deshidratado (30 mm lluvia en 90 días). Masa forestal densa con pendiente positiva hacia el norte.'
                });
                cellVina01.poly.addTo(hindcastSimulationLayer);
                cellVina01.badge.addTo(hindcastSimulationLayer);

                const cellVina02 = createTacticalAlertCell({
                    id: 'P-VINA-02',
                    threatType: 'fire',
                    severityPercent: 88,
                    name: '🔥 Garganta Quebradas Las Pataguas',
                    phase: '2-5h Aceleración & Spotting',
                    color: '#f97316',
                    badgeLabel: '[P-VINA-02] 88% ALTO • CHIMENEA',
                    coords: [[-33.1200, -71.5200], [-33.1200, -71.4700], [-33.0800, -71.4700], [-33.0800, -71.5200]],
                    metricsHtml: `
                        <div>• Efecto Chimenea: <b style="color:#f97316;">Quebrada Suroeste</b></div>
                        <div>• Salto Pavesas: <b style="color:#fde047;">1.85 km (Albini)</b></div>
                        <div>• Combustible: <b style="color:#ffffff;">Eucalipto / Matorral</b></div>
                        <div>• Amenaza Copas: <b style="color:#ef4444;">Activa Severa</b></div>
                    `,
                    notes: '🎯 Canalización eólica en cañones estrechos. Proyección masiva de pavesas sobre las quebradas intermedias.'
                });
                cellVina02.poly.addTo(hindcastSimulationLayer);
                cellVina02.badge.addTo(hindcastSimulationLayer);

                const cellVina03 = createTacticalAlertCell({
                    id: 'P-VINA-03',
                    threatType: 'fire',
                    severityPercent: 98,
                    name: '🔥 Interfaz WUI Achupallas / Canal Chacao / El Olivar',
                    phase: '5-9h Ruptura Urbana',
                    color: '#dc2626',
                    badgeLabel: '[P-VINA-03] 98% CATASTRÓFICO',
                    coords: [[-33.0750, -71.5350], [-33.0750, -71.4500], [-33.0350, -71.4500], [-33.0350, -71.5350]],
                    metricsHtml: `
                        <div>• Ruptura WUI: <b style="color:#ef4444;">94% Salto Faja</b></div>
                        <div>• Tejido Urbano: <b style="color:#f87171;">Alta densidad</b></div>
                        <div>• Foco Secundario: <b style="color:#fde047;">Jardín Botánico</b></div>
                        <div>• Impacto C2: <b style="color:#dc2626;">Colapso de Interfaz</b></div>
                    `,
                    notes: '🎯 Penetración violenta del fuego por lluvia de pavesas sobre techos y quebradas no desmalezadas.'
                });
                cellVina03.poly.addTo(hindcastSimulationLayer);
                cellVina03.badge.addTo(hindcastSimulationLayer);

                // ── HACES VECTORIALES BALÍSTICOS TÁCTICOS (ROTHERMEL + HUYGENS) ──
                // Haz Central de Cabeza (Norte hacia Viña / Canal Chacao)
                const arrowVinaHead = createTacticalFireArrow(
                    [-33.1400, -71.5000],
                    [-33.0850, -71.4950],
                    [-33.0450, -71.4980],
                    {
                        color: '#dc2626',
                        weight: 5.5,
                        badgeText: '🔥 CABEZA 96% • 22 m/min • Achupallas',
                        popupHtml: `
                            <div style="font-family:'JetBrains Mono',monospace; font-size:11px; padding:3px; color:#f8fafc;">
                                <strong style="color:#ef4444;">🎯 Haz Central de Cabeza (Viña 2024)</strong>
                                <div>• Tasa Avance: <b>22.4 m/min (Rothermel)</b></div>
                                <div>• Dirección: <b>Norte (10°) bajo viento Sur 65 km/h</b></div>
                                <div>• Salto Pavesas: <b>1.85 km (Albini)</b></div>
                            </div>
                        `
                    }
                );
                arrowVinaHead.shaft.addTo(hindcastSimulationLayer);
                arrowVinaHead.headMarker.addTo(hindcastSimulationLayer);
                if (arrowVinaHead.badgeMarker) arrowVinaHead.badgeMarker.addTo(hindcastSimulationLayer);

                // Flanco Izquierdo (Hacia Achupallas / Mirador Reñaca)
                const arrowVinaFlankW = createTacticalFireArrow(
                    [-33.1200, -71.5050],
                    [-33.0800, -71.5250],
                    [-33.0550, -71.5300],
                    {
                        color: '#f97316',
                        weight: 4.0,
                        dashArray: '6, 3',
                        badgeText: '🔥 FLANCO OESTE 84% • 14 m/min',
                        popupHtml: '<div><b>Flanco Oeste WUI</b>: Propagación lateral por ladera sur.</div>'
                    }
                );
                arrowVinaFlankW.shaft.addTo(hindcastSimulationLayer);
                arrowVinaFlankW.headMarker.addTo(hindcastSimulationLayer);
                if (arrowVinaFlankW.badgeMarker) arrowVinaFlankW.badgeMarker.addTo(hindcastSimulationLayer);

                // Flanco Derecho (Hacia Quilpué / Villa Alemana)
                const arrowVinaFlankE = createTacticalFireArrow(
                    [-33.1200, -71.4950],
                    [-33.0750, -71.4650],
                    [-33.0500, -71.4550],
                    {
                        color: '#ea580c',
                        weight: 4.0,
                        dashArray: '6, 3',
                        badgeText: '🔥 FLANCO ESTE 76% • Quilpué',
                        popupHtml: '<div><b>Flanco Este</b>: Avance hacia Paso Hondo y sectores periurbanos de Quilpué.</div>'
                    }
                );
                arrowVinaFlankE.shaft.addTo(hindcastSimulationLayer);
                arrowVinaFlankE.headMarker.addTo(hindcastSimulationLayer);
                if (arrowVinaFlankE.badgeMarker) arrowVinaFlankE.badgeMarker.addTo(hindcastSimulationLayer);

                // ── FAJA DEFENSIVA CORTAFUEGOS WUI DE CONTENCIÓN TEÓRICA ──
                const vinaFirebreak = L.polyline([
                    [-33.0650, -71.5450], [-33.0600, -71.5150], [-33.0620, -71.4850], [-33.0680, -71.4500], [-33.0750, -71.4250]
                ], {
                    color: '#10b981',
                    weight: 4.5,
                    dashArray: '10, 5',
                    opacity: 0.95
                });
                vinaFirebreak.bindTooltip(`
                    <div style="font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:bold; color:#6ee7b7; background:rgba(6,28,18,0.95); padding:3px 6px; border-radius:4px; border:1px solid #10b981;">
                        🛡️ FAJA DEFENSIVA WUI 45m &bull; Diagnóstico: 94% Penetración Aérea por Pavesas (Viento 65 km/h)
                    </div>
                `, { permanent: true, direction: 'top', offset: [0, -8] });
                vinaFirebreak.addTo(hindcastSimulationLayer);

            } else {
                // ── TRANSECTOS TÁCTICOS SANTA JUANA (P-SJ-01 A 03) ──
                const cellSJ01 = createTacticalAlertCell({
                    id: 'P-SJ-01',
                    threatType: 'fire',
                    severityPercent: 96,
                    name: '🔥 Foco Nacimiento / Cordillera de la Costa',
                    phase: '0-6h Disparo Puelche',
                    color: '#ef4444',
                    badgeLabel: '[P-SJ-01] 96% EXTREMO • FWI 78',
                    coords: [[-37.4200, -72.7600], [-37.4200, -72.6800], [-37.3500, -72.6800], [-37.3500, -72.7600]],
                    metricsHtml: `
                        <div>• FWI Severidad: <b style="color:#ef4444;">78 (Extremo)</b></div>
                        <div>• Viento Puelche: <b style="color:#f97316;">58 km/h SE</b></div>
                        <div>• Temperatura: <b style="color:#ef4444;">40,0 °C · HR 11%</b></div>
                        <div>• Avance Frente: <b style="color:#f87171;">1.85 km/h ◄</b></div>
                    `,
                    notes: '🎯 Megaincendio en monocultivo forestal continuo (pino/eucalipto) bajo estrés térmico extremo.'
                });
                cellSJ01.poly.addTo(hindcastSimulationLayer);
                cellSJ01.badge.addTo(hindcastSimulationLayer);

                const cellSJ02 = createTacticalAlertCell({
                    id: 'P-SJ-02',
                    threatType: 'fire',
                    severityPercent: 91,
                    name: '🔥 Corredor Eólico Ribera Sur Río Biobío',
                    phase: '6-18h Expansión Masiva',
                    color: '#f97316',
                    badgeLabel: '[P-SJ-02] 91% CRÍTICO • RÍO',
                    coords: [[-37.3500, -72.9000], [-37.3500, -72.7600], [-37.2400, -72.7600], [-37.2400, -72.9000]],
                    metricsHtml: `
                        <div>• Salto Chispas: <b style="color:#fde047;">2.4 km NO (Biobío)</b></div>
                        <div>• Combustible: <b style="color:#ffffff;">Pino Maduro</b></div>
                        <div>• Foco Secundario: <b style="color:#ef4444;">Cruce de Ribera</b></div>
                        <div>• Envolvente: <b style="color:#f97316;">42.599 ha</b></div>
                    `,
                    notes: '🎯 Propagación explosiva paralela al cauce del río Biobío con cruce de pavesas transfronterizo.'
                });
                cellSJ02.poly.addTo(hindcastSimulationLayer);
                cellSJ02.badge.addTo(hindcastSimulationLayer);

                const cellSJ03 = createTacticalAlertCell({
                    id: 'P-SJ-03',
                    threatType: 'fire',
                    severityPercent: 78,
                    name: '🔥 Interfaz Urbana Santa Juana & Valles Agrícolas',
                    phase: '18-36h Envolvente Rural',
                    color: '#dc2626',
                    badgeLabel: '[P-SJ-03] 78% ALTO • CASCO',
                    coords: [[-37.2400, -73.0800], [-37.2400, -72.9000], [-37.1500, -72.9000], [-37.1500, -73.0800]],
                    metricsHtml: `
                        <div>• Amenaza Casco: <b style="color:#ef4444;">Inminente</b></div>
                        <div>• Interfaz Agrícola: <b style="color:#34d399;">Pérdida forrajera</b></div>
                        <div>• Giro Eólico: <b style="color:#38bdf8;">Cambio a NO (81% HR)</b></div>
                    `,
                    notes: '🎯 Contención final al ingresar aire húmedo costero el 4 de febrero.'
                });
                cellSJ03.poly.addTo(hindcastSimulationLayer);
                cellSJ03.badge.addTo(hindcastSimulationLayer);

                // Haces Vectoriales Santa Juana (Hacia Noroeste 330°)
                const arrowSJHead = createTacticalFireArrow(
                    [-37.3800, -72.7800],
                    [-37.2800, -72.9200],
                    [-37.1800, -73.0200],
                    {
                        color: '#dc2626',
                        weight: 6.0,
                        badgeText: '🔥 EJE PRINCIPAL 98% • Puelche SE 58 km/h',
                        popupHtml: '<div><b>Cabeza Principal Santa Juana</b>: Avance SE a NO a lo largo de 34 km.</div>'
                    }
                );
                arrowSJHead.shaft.addTo(hindcastSimulationLayer);
                arrowSJHead.headMarker.addTo(hindcastSimulationLayer);
                if (arrowSJHead.badgeMarker) arrowSJHead.badgeMarker.addTo(hindcastSimulationLayer);
            }'''

assert target in geo, "target not found in geo-layers.js"
geo = geo.replace(target, replacement, 1)

with open('/Users/danielsantander/Documents/agritwin-app/js/hub/geo-layers.js', 'w', encoding='utf-8') as f:
    f.write(geo)

print("geo-layers.js actualizado con toda la suite táctica de transectos, haces vectoriales y fajas WUI para Viña y Santa Juana!")
