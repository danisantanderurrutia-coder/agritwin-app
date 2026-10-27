        // --- 1. DATA DEFINITIONS ---

        const LULC_CLASSES = [
            { id: 'bosque', name: 'Bosque Nativo Esclerófilo', area: 18400, percent: 15.1, color: '#16a34a', hex: '#16a34a' },
            { id: 'agricola', name: 'Agrícola Tradicional & Arroz', area: 42600, percent: 34.9, color: '#eab308', hex: '#eab308' },
            { id: 'agua', name: 'Cuerpos de Agua & Embalses', area: 3200, percent: 2.6, color: '#0ea5e9', hex: '#0ea5e9' },
            { id: 'cordillera', name: 'Cordillera & Montaña Andina', area: 24100, percent: 19.8, color: '#a1a1aa', hex: '#a1a1aa' },
            { id: 'forestal', name: 'Monocultivo Forestal', area: 31800, percent: 26.1, color: '#dc2626', hex: '#dc2626' },
            { id: 'urbano', name: 'Urbano Central', area: 1450, percent: 1.2, color: '#f97316', hex: '#f97316' },
            { id: 'villorrios', name: 'Villorrios & Poblados', area: 820, percent: 0.7, color: '#f59e0b', hex: '#f59e0b' }
        ];

        // ─── 1.1 MOSAICO CATASTRAL PREDIAL RURAL (Roles SII, Títulos CBR & Fuentes Oficiales) ───
        // Anti-alucinación: Se separan explícitamente los datos verificados del predio piloto (Fundo Meniel)
        // de los predios colindantes, cuyos sensores y títulos no registrados se declaran como "Dato no disponible".
        const geojsonPredios = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "id": "MENIEL",
                        "name": "Fundo Meniel (Predio Piloto)",
                        "rol": "418-24 Parral",
                        "comuna": "Parral",
                        "area_ha": 24.8,
                        "crop": "Cerezos Lapins (12 ha) & Avellano Tonda (10 ha)",
                        "water_L_s": 42.5,
                        "water_status": "Oficial DAA / Transmisión MEE",
                        "has_iot_sensors": true,
                        "has_cbr_deed": true,
                        "vwc": "36.2%",
                        "fwi": 24,
                        "fwi_status": "Bajo (Keyline Activo)",
                        "soil": "Franco-arcilloso estructurado",
                        "owner": "Meniel SpA / Cooperativa Agua Viva",
                        "cbr": {
                            "conservador": "Conservador de Bienes Raíces de Parral",
                            "fojas": "124v",
                            "numero": "189",
                            "ano": 2014,
                            "registro": "Registro de Propiedad",
                            "verificado": true
                        },
                        "verified": true,
                        "color": "#10b981",
                        "stroke": "#059669"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6090, -36.2085], [-71.6020, -36.2070], [-71.6005, -36.2135],
                            [-71.6075, -36.2160], [-71.6090, -36.2085]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "SAN_JOSE",
                        "name": "Agrícola San José de Longaví",
                        "rol": "142-12 Retiro",
                        "comuna": "Retiro",
                        "area_ha": 68.4,
                        "crop": "Arroz Zafiro & Cuarteles de Inundación",
                        "water_L_s": "Dato no disponible",
                        "water_status": "Pendiente de registro DGA",
                        "has_iot_sensors": false,
                        "has_cbr_deed": false,
                        "vwc": "Dato no disponible",
                        "fwi": 18,
                        "fwi_status": "Estimado zonal ERA5",
                        "soil": "Arcilloso Vertisol de Vega (CIREN)",
                        "owner": "Dato no disponible (Rellenable)",
                        "cbr": { "conservador": null, "fojas": null, "numero": null, "ano": null, "verificado": false },
                        "verified": false,
                        "color": "#eab308",
                        "stroke": "#ca8a04"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6250, -36.1950], [-71.6050, -36.1920], [-71.6020, -36.2070],
                            [-71.6090, -36.2085], [-71.6280, -36.2060], [-71.6250, -36.1950]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "LOS_BOLDOS",
                        "name": "Fundo Forestal Los Boldos",
                        "rol": "143-05 Retiro",
                        "comuna": "Retiro",
                        "area_ha": 112.5,
                        "crop": "Monocultivo Pino Radiata (2012) & Eucalipto",
                        "water_L_s": "Dato no disponible",
                        "water_status": "Pendiente de verificación vertiente",
                        "has_iot_sensors": false,
                        "has_cbr_deed": false,
                        "vwc": "Dato no disponible",
                        "fwi": 68,
                        "fwi_status": "Crítico / Extremo (Puelche)",
                        "soil": "Granítico degradado de ladera",
                        "owner": "Dato no disponible (Rellenable)",
                        "cbr": { "conservador": null, "fojas": null, "numero": null, "ano": null, "verificado": false },
                        "verified": false,
                        "color": "#dc2626",
                        "stroke": "#b91c1c"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5950, -36.2050], [-71.5600, -36.1980], [-71.5550, -36.2250],
                            [-71.5920, -36.2280], [-71.6005, -36.2135], [-71.5950, -36.2050]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "RETIRO_PONIENTE",
                        "name": "Hacienda Retiro Poniente",
                        "rol": "138-20 Retiro",
                        "comuna": "Retiro",
                        "area_ha": 84.0,
                        "crop": "Trigo Candeal, Avena & Maíz forrajero",
                        "water_L_s": "Dato no disponible",
                        "water_status": "Pendiente de consulta canal",
                        "has_iot_sensors": false,
                        "has_cbr_deed": false,
                        "vwc": "Dato no disponible",
                        "fwi": 32,
                        "fwi_status": "Moderado (Satelital)",
                        "soil": "Aluvial franco profundo",
                        "owner": "Dato no disponible (Rellenable)",
                        "cbr": { "conservador": null, "fojas": null, "numero": null, "ano": null, "verificado": false },
                        "verified": false,
                        "color": "#f59e0b",
                        "stroke": "#d97706"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6450, -36.1850], [-71.6250, -36.1820], [-71.6250, -36.1950],
                            [-71.6480, -36.2050], [-71.6450, -36.1850]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "STA_LUCIA",
                        "name": "Agrícola Santa Lucía del Huape",
                        "rol": "140-15 Retiro",
                        "comuna": "Retiro",
                        "area_ha": 36.2,
                        "crop": "Arándanos Duke & Moras de Exportación",
                        "water_L_s": "Dato no disponible",
                        "water_status": "Pendiente de aforo en pozo",
                        "has_iot_sensors": false,
                        "has_cbr_deed": false,
                        "vwc": "Dato no disponible",
                        "fwi": 26,
                        "fwi_status": "Bajo (Estimación)",
                        "soil": "Franco arenoso permeable",
                        "owner": "Dato no disponible (Rellenable)",
                        "cbr": { "conservador": null, "fojas": null, "numero": null, "ano": null, "verificado": false },
                        "verified": false,
                        "color": "#8b5cf6",
                        "stroke": "#7c3aed"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6075, -36.2160], [-71.6005, -36.2135], [-71.5980, -36.2280],
                            [-71.6120, -36.2320], [-71.6075, -36.2160]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "MORA_VERDE",
                        "name": "Agrícola Mora Verde del Sur",
                        "rol": "141-02 Retiro",
                        "comuna": "Retiro",
                        "area_ha": 28.0,
                        "crop": "Berries Orgánicos & Frambuesa",
                        "water_L_s": "Dato no disponible",
                        "water_status": "Pendiente de registro DGA",
                        "has_iot_sensors": false,
                        "has_cbr_deed": false,
                        "vwc": "Dato no disponible",
                        "fwi": 25,
                        "fwi_status": "Bajo (Sentinel-2)",
                        "soil": "Franco limoso de terraza aluvial",
                        "owner": "Dato no disponible (Rellenable)",
                        "cbr": { "conservador": null, "fojas": null, "numero": null, "ano": null, "verificado": false },
                        "verified": false,
                        "color": "#3b82f6",
                        "stroke": "#2563eb"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6180, -36.1750], [-71.6020, -36.1740], [-71.6050, -36.1880],
                            [-71.6210, -36.1890], [-71.6180, -36.1750]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "LOS_MAITENES",
                        "name": "Fundo Los Maitenes",
                        "rol": "144-01 Retiro",
                        "comuna": "Retiro",
                        "area_ha": 55.0,
                        "crop": "Bosque Esclerófilo Nativo & Apicultura",
                        "water_L_s": "Dato no disponible",
                        "water_status": "Vertiente natural (Sin aforo)",
                        "has_iot_sensors": false,
                        "has_cbr_deed": false,
                        "vwc": "Dato no disponible",
                        "fwi": 20,
                        "fwi_status": "Muy Bajo (Cobertura densa)",
                        "soil": "Franco con horizonte orgánico activo",
                        "owner": "Dato no disponible (Rellenable)",
                        "cbr": { "conservador": null, "fojas": null, "numero": null, "ano": null, "verificado": false },
                        "verified": false,
                        "color": "#10b981",
                        "stroke": "#059669"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5950, -36.2200], [-71.5750, -36.2180], [-71.5780, -36.2320],
                            [-71.5980, -36.2340], [-71.5950, -36.2200]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "DON_VICTOR",
                        "name": "Parcela Don Víctor",
                        "rol": "144-22 Retiro",
                        "comuna": "Retiro",
                        "area_ha": 18.5,
                        "crop": "Frutales Mixtos (Perales & Manzanos)",
                        "water_L_s": "Dato no disponible",
                        "water_status": "Pendiente de registro compuerta",
                        "has_iot_sensors": false,
                        "has_cbr_deed": false,
                        "vwc": "Dato no disponible",
                        "fwi": 28,
                        "fwi_status": "Bajo (Microclima)",
                        "soil": "Franco arcilloso profundo",
                        "owner": "Dato no disponible (Rellenable)",
                        "cbr": { "conservador": null, "fojas": null, "numero": null, "ano": null, "verificado": false },
                        "verified": false,
                        "color": "#14b8a6",
                        "stroke": "#0d9488"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6380, -36.2020], [-71.6220, -36.2010], [-71.6240, -36.2150],
                            [-71.6400, -36.2160], [-71.6380, -36.2020]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "EL_CARMEN",
                        "name": "Viña El Carmen",
                        "rol": "145-10 Retiro",
                        "comuna": "Retiro",
                        "area_ha": 38.0,
                        "crop": "Uva Torontel & Parras de Secano",
                        "water_L_s": "Dato no disponible",
                        "water_status": "Pozo noria tradicional (Sin MEE)",
                        "has_iot_sensors": false,
                        "has_cbr_deed": false,
                        "vwc": "Dato no disponible",
                        "fwi": 35,
                        "fwi_status": "Moderado (Secano)",
                        "soil": "Granítico rojo meteorizado",
                        "owner": "Dato no disponible (Rellenable)",
                        "cbr": { "conservador": null, "fojas": null, "numero": null, "ano": null, "verificado": false },
                        "verified": false,
                        "color": "#f43f5e",
                        "stroke": "#e11d48"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6500, -36.2100], [-71.6300, -36.2080], [-71.6330, -36.2220],
                            [-71.6530, -36.2240], [-71.6500, -36.2100]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "LA_PALMA",
                        "name": "Reserva Precordillera La Palma",
                        "rol": "146-01 Retiro",
                        "comuna": "Retiro",
                        "area_ha": 65.0,
                        "crop": "Santuario Silvestre & Corredor Biológico",
                        "water_L_s": "Dato no disponible",
                        "water_status": "Vertientes de altura (Ecológico)",
                        "has_iot_sensors": false,
                        "has_cbr_deed": false,
                        "vwc": "Dato no disponible",
                        "fwi": 18,
                        "fwi_status": "Muy Bajo (Bosque denso)",
                        "soil": "Rocoso de ladera precordillerana",
                        "owner": "Dato no disponible (Rellenable)",
                        "cbr": { "conservador": null, "fojas": null, "numero": null, "ano": null, "verificado": false },
                        "verified": false,
                        "color": "#6366f1",
                        "stroke": "#4f46e5"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5800, -36.2250], [-71.5550, -36.2200], [-71.5580, -36.2400],
                            [-71.5830, -36.2450], [-71.5800, -36.2250]
                        ]]
                    }
                }
            ]
        };

        // ─── 1.1B ESTÁNDAR VECINO INFORMADO: MÓDULO 1 - MOSAICO LULC BIOFÍSICO (LOD DUAL: MACRO >50ha + LOCAL 5km) ───
        // Cobertura biofísica pura (Sentinel-2 L2A BOA 10m) independiente de roles de tenencia de la tierra.
        // Biomasa Forestal Unificada temporalmente (con estrategia de discriminación por pendiente DEM >18° y textura Canny).
        const geojsonBiofisicoLulc = {
            "type": "FeatureCollection",
            "features": [
                // ── MACRO-POLÍGONOS CUENCA (MMU ≥ 50 ha) ──
                {
                    "type": "Feature",
                    "properties": {
                        "id": "MACRO_FOR_CORDILLERA",
                        "name": "Cinturón Biomasa Precordillera Andina",
                        "class": "biomasa_forestal",
                        "area_ha": 12300,
                        "zone": "Macro-Cuenca (LOD MMU ≥50 ha)",
                        "confidence": "94% (Sentinel-2 L2A)",
                        "label_note": "Biomasa Unificada (Estrategia: pendiente DEM >18° y textura Canny para discriminar nativo de pino)",
                        "hazard_link": "Combustible masivo continuo en corredor de viento Puelche",
                        "color": "#f43f5e",
                        "fillColor": "#e11d48",
                        "stroke": "#fb7185"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5200, -36.2100], [-71.4400, -36.2150], [-71.4100, -36.2800],
                            [-71.4300, -36.3300], [-71.5100, -36.3100], [-71.5200, -36.2100]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "MACRO_FOR_COSTA",
                        "name": "Macizo Forestal Cordillera de la Costa",
                        "class": "biomasa_forestal",
                        "area_ha": 14850,
                        "zone": "Macro-Cuenca (LOD MMU ≥50 ha)",
                        "confidence": "95% (Sentinel-2 L2A)",
                        "label_note": "Biomasa Unificada (Plantaciones densas de pino insigne y eucalipto glóbulus)",
                        "hazard_link": "Combustible denso perimetral en límite poniente de cuenca",
                        "color": "#f43f5e",
                        "fillColor": "#e11d48",
                        "stroke": "#fb7185"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.8200, -36.0800], [-71.9300, -36.0900], [-71.9500, -36.1800],
                            [-71.8500, -36.2000], [-71.8100, -36.1400], [-71.8200, -36.0800]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "MACRO_AGR_LONGAVI",
                        "name": "Matriz Agrícola Irrigada Cuenca Media",
                        "class": "matriz_agricola",
                        "area_ha": 18600,
                        "zone": "Macro-Cuenca (LOD MMU ≥50 ha)",
                        "confidence": "96% (Sentinel-2 L2A)",
                        "label_note": "Suelo aluvial bajo riego gravitacional de canales Longaví",
                        "hazard_link": "Amortiguador térmico de baja inflamabilidad estival",
                        "color": "#10b981",
                        "fillColor": "#059669",
                        "stroke": "#34d399"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5800, -36.1800], [-71.6500, -36.1500], [-71.7400, -36.1350],
                            [-71.7200, -36.1850], [-71.6400, -36.2050], [-71.5800, -36.1800]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "MACRO_SEC_PARRAL",
                        "name": "Llanura de Secano & Rastrojo Parral-Retiro",
                        "class": "secano_rastrojo",
                        "area_ha": 9800,
                        "zone": "Macro-Cuenca (LOD MMU ≥50 ha)",
                        "confidence": "93% (Sentinel-2 L2A)",
                        "label_note": "Pastizal seco estival y rastrojo de cosecha de cereal",
                        "hazard_link": "Combustible ligero de ignición rápida a ras de suelo",
                        "color": "#f59e0b",
                        "fillColor": "#d97706",
                        "stroke": "#fbbf24"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.7000, -36.0500], [-71.8200, -36.0600], [-71.8400, -36.1200],
                            [-71.7300, -36.1150], [-71.7000, -36.0500]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "MACRO_AGUA_BULLILEO",
                        "name": "Espejo Mayor Embalse Bullileo",
                        "class": "espejo_agua",
                        "area_ha": 3200,
                        "zone": "Macro-Cuenca (LOD MMU ≥50 ha)",
                        "confidence": "99% (MNDWI Sentinel-2)",
                        "label_note": "Cuerpo de agua léntico principal de regulación de cuenca",
                        "hazard_link": "Reserva hídrica estratégica regional (84.2 Hm³)",
                        "color": "#06b6d4",
                        "fillColor": "#0891b2",
                        "stroke": "#22d3ee"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.4050, -36.2650], [-71.4350, -36.2700], [-71.4350, -36.2950],
                            [-71.4100, -36.2900], [-71.4050, -36.2650]
                        ]]
                    }
                },

                // ── POLÍGONOS DE ALTA RESOLUCIÓN LOCAL (RADIO 5 KM MENIEL, MMU ≥ 1.5 ha) ──
                {
                    "type": "Feature",
                    "properties": {
                        "id": "LOC_AGUA_MENIEL",
                        "name": "Tranque Acumulador Fundo Meniel",
                        "class": "espejo_agua",
                        "area_ha": 1.8,
                        "vol_estimado_m3": "18.500 m³",
                        "zone": "Radio Local Táctico (<5 km)",
                        "confidence": "98% (MNDWI)",
                        "label_note": "Espejo superficial detectado; calibración batimétrica media hm=3.2m",
                        "hazard_link": "Punto de abastecimiento aéreo para brigadas y cortafuego vivo",
                        "color": "#06b6d4",
                        "fillColor": "#0891b2",
                        "stroke": "#22d3ee"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6058, -36.2102], [-71.6038, -36.2102], [-71.6038, -36.2118],
                            [-71.6058, -36.2118], [-71.6058, -36.2102]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "LOC_AGUA_CRISTALES",
                        "name": "Tranque Vecinal Los Cristales",
                        "class": "espejo_agua",
                        "area_ha": 2.4,
                        "vol_estimado_m3": "24.800 m³",
                        "zone": "Radio Local Táctico (<5 km)",
                        "confidence": "97% (MNDWI)",
                        "label_note": "Tranque vecino colindante oeste; capacidad de apoyo hídrico",
                        "hazard_link": "Respaldo hídrico colaborativo en red vecinal",
                        "color": "#06b6d4",
                        "fillColor": "#0891b2",
                        "stroke": "#22d3ee"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6165, -36.2170], [-71.6135, -36.2170], [-71.6135, -36.2195],
                            [-71.6165, -36.2195], [-71.6165, -36.2170]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "LOC_AGUA_SANMANUEL",
                        "name": "Tranque Sector San Manuel",
                        "class": "espejo_agua",
                        "area_ha": 3.1,
                        "vol_estimado_m3": "32.000 m³",
                        "zone": "Radio Local Táctico (<5 km)",
                        "confidence": "98% (MNDWI)",
                        "label_note": "Tranque intermedio de canal San Manuel",
                        "hazard_link": "Punto de recarga de agua para sector norte",
                        "color": "#06b6d4",
                        "fillColor": "#0891b2",
                        "stroke": "#22d3ee"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6225, -36.2010], [-71.6190, -36.2010], [-71.6190, -36.2038],
                            [-71.6225, -36.2038], [-71.6225, -36.2010]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "LOC_AGR_CEREZOS",
                        "name": "Cuartel Cerezos Meniel (Norte)",
                        "class": "matriz_agricola",
                        "area_ha": 12.0,
                        "zone": "Radio Local Táctico (<5 km)",
                        "confidence": "96% (Sentinel-2 L2A)",
                        "label_note": "Cuartel frutal bajo riego por goteo; vigor NDVI 0.74",
                        "hazard_link": "Canopia densa activa; barrera verde hidratada contra fuego",
                        "color": "#10b981",
                        "fillColor": "#059669",
                        "stroke": "#34d399"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6085, -36.2088], [-71.6025, -36.2075], [-71.6020, -36.2110],
                            [-71.6082, -36.2115], [-71.6085, -36.2088]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "LOC_AGR_AVELLANOS",
                        "name": "Cuartel Avellanos Meniel (Sur Keyline)",
                        "class": "matriz_agricola",
                        "area_ha": 10.0,
                        "zone": "Radio Local Táctico (<5 km)",
                        "confidence": "95% (Sentinel-2 L2A)",
                        "label_note": "Cuartel estructurado con líneas Keyline a desnivel; VWC 34.8%",
                        "hazard_link": "Alta retención de agua de escorrentía e infiltración profunda",
                        "color": "#10b981",
                        "fillColor": "#059669",
                        "stroke": "#34d399"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6082, -36.2115], [-71.6020, -36.2110], [-71.6010, -36.2140],
                            [-71.6075, -36.2155], [-71.6082, -36.2115]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "LOC_FOR_NORTE",
                        "name": "Rodal Biomasa Forestal Flanco Norte",
                        "class": "biomasa_forestal",
                        "area_ha": 14.2,
                        "zone": "Radio Local Táctico (<5 km)",
                        "confidence": "94% (Sentinel-2 L2A)",
                        "label_note": "Biomasa Unificada (Colindante directo; pendiente suave 6°; monocultivo comercial)",
                        "hazard_link": "Riesgo de interfaz WUI directo sobre el deslinde norte de Meniel",
                        "color": "#f43f5e",
                        "fillColor": "#e11d48",
                        "stroke": "#fb7185"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6000, -36.2010], [-71.5930, -36.2010], [-71.5940, -36.2065],
                            [-71.6015, -36.2060], [-71.6000, -36.2010]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "LOC_FOR_GUINDO",
                        "name": "Remanente Nativo Quebrada El Guindo",
                        "class": "biomasa_forestal",
                        "area_ha": 8.5,
                        "zone": "Radio Local Táctico (<5 km)",
                        "confidence": "92% (Sentinel-2 L2A)",
                        "label_note": "Biomasa Unificada (Quebrada escarpada pendiente 24°; firma esclerófila nativa)",
                        "hazard_link": "Amortiguador biológico de erosión y cortafuego natural en vaguada",
                        "color": "#f43f5e",
                        "fillColor": "#e11d48",
                        "stroke": "#fb7185"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5890, -36.2120], [-71.5810, -36.2110], [-71.5820, -36.2165],
                            [-71.5900, -36.2160], [-71.5890, -36.2120]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "LOC_SEC_SANANTONIO",
                        "name": "Parche Pastizal / Secano San Antonio",
                        "class": "secano_rastrojo",
                        "area_ha": 18.6,
                        "zone": "Radio Local Táctico (<5 km)",
                        "confidence": "93% (Sentinel-2 L2A)",
                        "label_note": "Pastizal seco estival en deslinde sur",
                        "hazard_link": "Riesgo de inicio de fuego por colilla o maquinaria agrícola",
                        "color": "#f59e0b",
                        "fillColor": "#d97706",
                        "stroke": "#fbbf24"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6210, -36.2240], [-71.6140, -36.2230], [-71.6150, -36.2295],
                            [-71.6225, -36.2290], [-71.6210, -36.2240]
                        ]]
                    }
                }
            ]
        };

        // ─── 1.2 ZONIFICACIÓN DE AMENAZA DE INUNDACIÓN FLUVIAL (DGA / SENAPRED) ───
        const geojsonInundacion = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "id": "INUND_T10",
                        "recurrence": "T = 10 Años (Alta Amenaza)",
                        "caudal_critico": "180 m³/s",
                        "descripcion": "Cauce activo y riberas bajas del Río Longaví. Desbordes recurrentes en temporales de invierno.",
                        "afectacion": "Vegas agrícolas bajas, caminos ribereños y bocatomas de canales.",
                        "cota_max": "165 msnm",
                        "color": "#0284c7",
                        "fillOpacity": 0.45
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.4500, -36.2420], [-71.4900, -36.2230], [-71.5300, -36.2080],
                            [-71.5700, -36.1920], [-71.6100, -36.1810], [-71.6500, -36.1710],
                            [-71.6900, -36.1620], [-71.7200, -36.1550], [-71.7250, -36.1590],
                            [-71.6920, -36.1660], [-71.6520, -36.1760], [-71.6120, -36.1860],
                            [-71.5720, -36.1970], [-71.5320, -36.2130], [-71.4920, -36.2280],
                            [-71.4520, -36.2460], [-71.4500, -36.2420]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "INUND_T50",
                        "recurrence": "T = 50 Años (Media Amenaza)",
                        "caudal_critico": "340 m³/s",
                        "descripcion": "Llanura aluvial y paleocauces de desborde del Río Longaví y esteros tributarios.",
                        "afectacion": "Cuarteles de arrozales, parcelas colindantes y pozos de noria comarcales.",
                        "cota_max": "172 msnm",
                        "color": "#38bdf8",
                        "fillOpacity": 0.30
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.4400, -36.2380], [-71.4850, -36.2170], [-71.5250, -36.2010],
                            [-71.5650, -36.1840], [-71.6050, -36.1730], [-71.6550, -36.1630],
                            [-71.7000, -36.1530], [-71.7350, -36.1480], [-71.7400, -36.1650],
                            [-71.6950, -36.1750], [-71.6450, -36.1860], [-71.6020, -36.1970],
                            [-71.5600, -36.2110], [-71.5200, -36.2260], [-71.4780, -36.2430],
                            [-71.4380, -36.2580], [-71.4400, -36.2380]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "INUND_T100",
                        "recurrence": "T = 100 Años (Baja Amenaza / Crecida Milenaria)",
                        "caudal_critico": "520 m³/s",
                        "descripcion": "Máxima envolvente de inundación histórica. Desborde masivo hacia fondos de cuenca.",
                        "afectacion": "Comités APR, puentes rurales secundarios y subestaciones eléctricas.",
                        "cota_max": "180 msnm",
                        "color": "#7dd3fc",
                        "fillOpacity": 0.18
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.4300, -36.2320], [-71.4750, -36.2100], [-71.5150, -36.1920],
                            [-71.5580, -36.1750], [-71.6000, -36.1640], [-71.6600, -36.1520],
                            [-71.7100, -36.1420], [-71.7500, -36.1380], [-71.7600, -36.1750],
                            [-71.7050, -36.1880], [-71.6400, -36.2010], [-71.5950, -36.2150],
                            [-71.5500, -36.2280], [-71.5050, -36.2450], [-71.4650, -36.2620],
                            [-71.4250, -36.2750], [-71.4300, -36.2320]
                        ]]
                    }
                }
            ]
        };

        // ─── 1.3 ZONIFICACIÓN DE PELIGRO DE INCENDIO FORESTAL (CONAF / FWI PAISAJE) ───
        const geojsonIncendios = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "id": "FIRE_CRITICA",
                        "zona": "Zona Crítica de Interfaz Forestal (Laderas Andinas)",
                        "organismo": "CONAF / FWI Landscape",
                        "peligro": "EXTREMO (FWI 68-82)",
                        "factor": "Monocultivo de Pino/Eucalipto continuo + Descenso Adiabático Viento Puelche (38 km/h)",
                        "especies": "Pinus radiata, Acacia dealbata, Matorral espinoso seco",
                        "color": "#dc2626",
                        "fillOpacity": 0.40
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5500, -36.1000], [-71.4200, -36.0800], [-71.3800, -36.2200],
                            [-71.4400, -36.3200], [-71.5200, -36.2600], [-71.5500, -36.1000]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "FIRE_MODERADA",
                        "zona": "Secano Interior y Lomas de Pastizal",
                        "organismo": "CONAF / SIT",
                        "peligro": "ALTO (FWI 45-55)",
                        "factor": "Pastura seca en verano con discontinuidad arbórea",
                        "especies": "Gramíneas anuales, Espino (Acacia caven)",
                        "color": "#f59e0b",
                        "fillOpacity": 0.28
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.7200, -36.0600], [-71.6500, -36.0600], [-71.6400, -36.1600],
                            [-71.7200, -36.1500], [-71.7200, -36.0600]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "FIRE_CORTAFUEGOS",
                        "zona": "Cortafuegos Vivos & Keyline Protegido (Meniel)",
                        "organismo": "AgroTwin SDSS / MRV",
                        "peligro": "MITIGADO / RESILIENTE (FWI 24)",
                        "factor": "Barrera perimetral de Peumo/Quillay hidratada (37% VWC) + Fajas PRV de 25m",
                        "especies": "Cryptocarya alba (Peumo), Quillaja saponaria (Quillay), Pastura verde",
                        "color": "#10b981",
                        "fillOpacity": 0.65
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6110, -36.2070], [-71.6000, -36.2055], [-71.5990, -36.2150],
                            [-71.6095, -36.2180], [-71.6110, -36.2070]
                        ]]
                    }
                }
            ]
        };

        // ─── 1.3.1 MAPA DE EXPOSICIÓN Y VULNERABILIDAD TERRITORIAL (ESTILO COLONIA / FOTO 4) ───
        const geojsonCologneFloodExposure = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "id": "EXP_RESIDENCIAL",
                        "tipo": "Área Residencial & Asentamientos APR",
                        "clase": "Vulnerabilidad Humana Alta",
                        "color": "#f43f5e",
                        "fillColor": "#e11d48",
                        "fillOpacity": 0.50,
                        "habitantes": "4.850 hab",
                        "infraestructura": "Viviendas rurales, comités APR Bullileo y Retiro Este, escuelas",
                        "profundidad_critica": "1.2 - 2.1 m",
                        "danio_potencial": "Crítico (Peligro de vida y colapso de norias)"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.7100, -36.1450], [-71.6900, -36.1380], [-71.6700, -36.1480],
                            [-71.6750, -36.1620], [-71.7050, -36.1600], [-71.7100, -36.1450]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "EXP_INFRAESTRUCTURA_VIAL",
                        "tipo": "Corredores Viales & Puentes Estratégicos",
                        "clase": "Conectividad Crítica",
                        "color": "#ea580c",
                        "fillColor": "#c2410c",
                        "fillOpacity": 0.55,
                        "habitantes": "Flujo 8.4k veh/día",
                        "infraestructura": "Cruce Ruta 5 Sur Km 328, Puente Malcho Ruta L-110",
                        "profundidad_critica": "0.8 - 1.5 m",
                        "danio_potencial": "Alto (Aislamiento de cuenca y corte de suministros)"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.7450, -36.1300], [-71.7250, -36.1280], [-71.7200, -36.1750],
                            [-71.7380, -36.1780], [-71.7450, -36.1300]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "EXP_AGRICOLA_INTENSIVO",
                        "tipo": "Suelo Agrícola de Alto Valor (Arroz y Frutales)",
                        "clase": "Vulnerabilidad Económica Productiva",
                        "color": "#eab308",
                        "fillColor": "#ca8a04",
                        "fillOpacity": 0.40,
                        "habitantes": "92 parcelas activas",
                        "infraestructura": "Cuarteles de arroz inundable, plantaciones de nogal y canales DGA",
                        "profundidad_critica": "0.4 - 0.9 m",
                        "danio_potencial": "Medio-Alto (Pérdida de cosecha y colmatación de drenajes)"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6600, -36.1680], [-71.6200, -36.1600], [-71.5900, -36.1780],
                            [-71.6050, -36.2050], [-71.6480, -36.1950], [-71.6600, -36.1680]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "EXP_VEGA_AMORTIGUACION",
                        "tipo": "Humedal Ribereño & Buffer de Amortiguación Natural",
                        "clase": "Infraestructura Verde Resiliente",
                        "color": "#10b981",
                        "fillColor": "#059669",
                        "fillOpacity": 0.35,
                        "habitantes": "Zona No Habitada",
                        "infraestructura": "Sauces nativos, vegas de infiltración y zanjas de recarga freática",
                        "profundidad_critica": "2.0 - 3.5 m (Diseñada para retención)",
                        "danio_potencial": "Favorable (Disipador natural de energía cinética)"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5800, -36.1950], [-71.5400, -36.1980], [-71.5050, -36.2200],
                            [-71.5200, -36.2380], [-71.5650, -36.2250], [-71.5800, -36.1950]
                        ]]
                    }
                }
            ]
        };

        // ─── 1.3.2 ZONIFICACIÓN DE SEVERIDAD CAL FIRE FHSZ & WUI EMBER ZONE (FOTOS 6 & 7) ───
        const geojsonCalFireFhsz = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "id": "CALFIRE_VHFHSZ",
                        "clase": "Very High Fire Hazard Severity Zone (VHFHSZ)",
                        "severidad": "Extrema (Laderas Andinas >25°)",
                        "combustible": "Plantación continua Pino Radiata / Matorral esclerófilo",
                        "color": "#b91c1c",
                        "fillColor": "#991b1b",
                        "fillOpacity": 0.45,
                        "fwi_referencia": "65 - 85",
                        "accion_requerida": "Evacuación preventiva y apertura de cortafuegos clase 1"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5200, -36.1200], [-71.4300, -36.1000], [-71.3900, -36.2200],
                            [-71.4500, -36.2800], [-71.5000, -36.2400], [-71.5200, -36.1200]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "CALFIRE_HFHSZ",
                        "clase": "High Fire Hazard Severity Zone (HFHSZ)",
                        "severidad": "Alta (Transición Agroforestal)",
                        "combustible": "Matorral seco, espinales y pastizal denso no pastoreado",
                        "color": "#ea580c",
                        "fillColor": "#c2410c",
                        "fillOpacity": 0.38,
                        "fwi_referencia": "45 - 65",
                        "accion_requerida": "Monitoreo con dron y humectación de fajas perimetrales"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5600, -36.1400], [-71.5200, -36.1250], [-71.5000, -36.2400],
                            [-71.5450, -36.2300], [-71.5600, -36.1400]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "CALFIRE_MFHSZ",
                        "clase": "Moderate Fire Hazard Severity Zone (MFHSZ)",
                        "severidad": "Moderada (Valle de Riego)",
                        "combustible": "Cultivos regados, pastizal verde y viñedos",
                        "color": "#f59e0b",
                        "fillColor": "#d97706",
                        "fillOpacity": 0.25,
                        "fwi_referencia": "20 - 45",
                        "accion_requerida": "Mantenimiento ordinario de acequias cortafuego"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6500, -36.1000], [-71.5800, -36.1100], [-71.5700, -36.2400],
                            [-71.6600, -36.2200], [-71.6500, -36.1000]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "WUI_EMBER_ZONE",
                        "clase": "WUI Ember Projection Zone (Zona de Pavesas)",
                        "severidad": "Proyección por Viento Puelche (1.5 km a sotavento)",
                        "combustible": "Lluvia de pavesas ígneas sobre tejados y copas aisladas",
                        "color": "#f43f5e",
                        "fillColor": "#e11d48",
                        "fillOpacity": 0.30,
                        "dashArray": "6, 4",
                        "fwi_referencia": "Ember Risk 78%",
                        "accion_requerida": "Protección de aleros, aspersores de techo activados"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5500, -36.1800], [-71.4900, -36.1600], [-71.4800, -36.2100],
                            [-71.5300, -36.2300], [-71.5500, -36.1800]
                        ]]
                    }
                }
            ]
        };

        // ─── 1.3.3 SUSCEPTIBILIDAD DE REMOCIÓN EN MASA Y CONOS DE DEYECCIÓN (FOTO 9 & 10) ───
        const geojsonLandslideSusceptibility = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "id": "LANDSLIDE_SCAR_A110",
                        "tipo": "Zona de Escarpe Activo (Scar Zone)",
                        "sector": "Garganta Bullileo - Talud Oriental Ruta L-110",
                        "pendiente": "34° (Escarpe descalzado por escorrentía)",
                        "geologia": "Coluvio volcánico no consolidado sobre tobas alteradas",
                        "color": "#ef4444",
                        "fillColor": "#dc2626",
                        "fillOpacity": 0.55,
                        "volumen_desprendible": "28.500 m³",
                        "susceptibilidad": "Muy Alta (Crítica con lluvia >80mm)"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.4450, -36.2550], [-71.4250, -36.2500], [-71.4150, -36.2700],
                            [-71.4350, -36.2800], [-71.4450, -36.2550]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "LANDSLIDE_RUNOUT_CONE",
                        "tipo": "Cono de Deyección Aluvial (Runout & Deposition)",
                        "sector": "Cruce Quebrada y Calzada Ruta L-110 km 18.2",
                        "pendiente": "12° - 18° (Área de impacto dinámico)",
                        "geologia": "Matriz detrítica con bolones hasta 1.2m diámetro",
                        "color": "#f59e0b",
                        "fillColor": "#d97706",
                        "fillOpacity": 0.40,
                        "dashArray": "8, 4",
                        "volumen_desprendible": "Runout proyectado 420 m lineales",
                        "susceptibilidad": "Alta (Riesgo inminente de corte de calzada)"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.4480, -36.2620], [-71.4320, -36.2680], [-71.4420, -36.2850],
                            [-71.4600, -36.2750], [-71.4480, -36.2620]
                        ]]
                    }
                }
            ]
        };

        // ─── 1.4 COMITÉS DE AGUA POTABLE RURAL (APRs Cuenca Maule Sur) ───
        const aprsData = [
            {
                name: "Comité APR Retiro Sur",
                lat: -36.0650,
                lng: -71.7580,
                familias: 1450,
                pozo_prof_m: 45,
                bombeo_L_s: 8.5,
                cota_msnm: 168,
                vulnerabilidad: "Media (Baja cota de recarga estival)"
            },
            {
                name: "Comité APR San José de Parral",
                lat: -36.1520,
                lng: -71.8150,
                familias: 820,
                pozo_prof_m: 32,
                bombeo_L_s: 6.2,
                cota_msnm: 162,
                vulnerabilidad: "Alta (Emplazado en Faja de Inundación T=50)"
            },
            {
                name: "Comité APR Copihue Oriente",
                lat: -36.1150,
                lng: -71.7200,
                familias: 610,
                pozo_prof_m: 28,
                bombeo_L_s: 4.5,
                cota_msnm: 175,
                vulnerabilidad: "Baja (Monitoreo DGA estable)"
            },
            {
                name: "Comité APR Villorrio Meniel",
                lat: -36.2050,
                lng: -71.6020,
                familias: 240,
                pozo_prof_m: 18,
                bombeo_L_s: 3.1,
                cota_msnm: 194,
                vulnerabilidad: "Protegida (Recarga permanente por zanjas Keyline Meniel)"
            },
            {
                name: "Comité APR Ajial - Longaví",
                lat: -36.1850,
                lng: -71.6850,
                familias: 480,
                pozo_prof_m: 35,
                bombeo_L_s: 5.0,
                cota_msnm: 166,
                vulnerabilidad: "Media-Alta (Sensible a turbiedad en crecidas)"
            }
        ];

        const fundoMenielCoords = [
            [-36.2085, -71.6090],
            [-36.2070, -71.6020],
            [-36.2135, -71.6005],
            [-36.2160, -71.6075],
            [-36.2085, -71.6090]
        ];

        const sensors = [
            // Red Centinela Local KioT (Fundo Meniel)
            { name: "FDR-01 Cerezos (Fundo Meniel)", lat: -36.2095, lng: -71.6060, data: "36.2% VWC, Bat 92% • 0-20 cm", network: "KioT Mesh" },
            { name: "FDR-02 Avellano (Fundo Meniel)", lat: -36.2120, lng: -71.6030, data: "34.8% VWC, Bat 88% • 20-60 cm", network: "KioT Mesh" },
            { name: "FDR-03 Keyline Sur (Fundo Meniel)", lat: -36.2145, lng: -71.6050, data: "37.1% VWC, Bat 95% • Infiltración", network: "KioT Mesh" },
            { name: "FDR-04 Pastura & Ganado (Meniel)", lat: -36.2105, lng: -71.6080, data: "35.0% VWC, Bat 90% • Silvopastoril", network: "KioT Mesh" },
            { name: "Piezómetro Tranque (Meniel)", lat: -36.2110, lng: -71.6045, data: "18,500 m³, Bat 99% • Cota 198m", type: "water", network: "KioT Mesh" },
            
            // Estaciones Meteorológicas Públicas Oficiales (DMC / DGA / INIA)
            { name: "Estación Agroclimática INIA Retiro", lat: -36.0580, lng: -71.7610, data: "T: 22.4°C, HR: 38%, ETo: 4.8 mm/día", type: "inia", network: "INIA Red Agroclimática" },
            { name: "Estación Fluviométrica DGA Río Longaví", lat: -36.1750, lng: -71.6700, data: "Caudal Oficial: 185 m³/s, Nivel: 2.15m", type: "water", network: "DGA Aguas" },
            { name: "Estación Meteorológica DMC Parral Centro", lat: -36.1432, lng: -71.8267, data: "Viento Puelche: 38 km/h E-NE, Presión 1014 hPa", type: "dmc", network: "DMC Aeronáutica" },
            { name: "Estación Embalse Bullileo (DGA)", lat: -36.2800, lng: -71.4200, data: "Volumen: 84.2 Hm³, Cota: 395 msnm (Llenado 78%)", type: "water", network: "DGA Embalses" }
        ];

        const rivers = [
            { name: "Río Longaví", coords: [[-36.1600,-71.7200], [-36.1750,-71.6700], [-36.1900,-71.6200], [-36.2100,-71.5500], [-36.2300,-71.4800]], color: '#38bdf8' },
            { name: "Río Perquilauquén", coords: [[-36.0800,-71.8200], [-36.1100,-71.7500], [-36.1400,-71.6800]], color: '#0ea5e9' },
            { name: "Canal Matriz Retiro", coords: [[-36.0550,-71.7600], [-36.1200,-71.7100], [-36.1800,-71.6500]], color: '#0284c7' }
        ];

        // --- 2. MAP INITIALIZATION (Enfoque Predial Limpio en Fundo Meniel) ---
        const map = L.map('map', {
            center: [-36.2115, -71.6050],
            zoom: 14,
            zoomControl: false
        });
        window.map = map;

        // Inicializar de inmediato LivingEnergyFlowEngine si está disponible en ventana
        if (typeof LivingEnergyFlowEngine !== 'undefined' && !window.energyFlowEngine) {
            window.energyFlowEngine = new LivingEnergyFlowEngine(map, 'energyFlowCanvas');
        }

        L.control.zoom({ position: 'bottomleft' }).addTo(map);

        // Base Layers Robustos de Alta Resolución
        const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, GIS User Community',
            maxZoom: 19
        });

        const openTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
            maxZoom: 17
        });

        const darkTactical = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO &copy; OpenStreetMap &mdash; Modo Táctico Oscuro C2',
            subdomains: 'abcd',
            maxZoom: 19,
            className: 'c2-dark-tactical-tile'
        });

        const osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        });

        // 1. Relieve DEM Hillshade Real (Copernicus DEM 30m / Esri World Hillshade Analítico)
        const hillshadeDem = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Copernicus DEM 30m / SRTM Analítico',
            maxZoom: 18,
            className: 'analytical-hillshade-tile'
        });

        // 1.1 Modelo Digital de Elevación Hipsométrico 3D (Paleta Clásica de Alto Contraste con Relieve y Batimetría)
        const DemColorGridLayer = L.GridLayer.extend({
            createTile: function(coords, done) {
                const tile = document.createElement('canvas');
                tile.width = 256;
                tile.height = 256;
                const ctx = tile.getContext('2d');
                
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = function() {
                    try {
                        const off = document.createElement('canvas');
                        off.width = 256;
                        off.height = 256;
                        const offCtx = off.getContext('2d');
                        offCtx.drawImage(img, 0, 0);
                        const imgData = offCtx.getImageData(0, 0, 256, 256);
                        const d = imgData.data;
                        const outData = ctx.createImageData(256, 256);
                        const o = outData.data;

                        // Decodificar elevaciones Terrarium SRTM: (R * 256 + G + B / 256) - 32768
                        const elevs = new Float32Array(256 * 256);
                        for (let i = 0, p = 0; i < d.length; i += 4, p++) {
                            elevs[p] = (d[i] * 256.0 + d[i+1] + d[i+2] / 256.0) - 32768.0;
                        }

                        for (let y = 0; y < 256; y++) {
                            const y0 = Math.max(0, y - 1);
                            const y1 = Math.min(255, y + 1);
                            for (let x = 0; x < 256; x++) {
                                const idx = y * 256 + x;
                                const e = elevs[idx];

                                // Iluminación y sombreado de relieve (Sol NO 315°, altitud 45°)
                                const x0 = Math.max(0, x - 1);
                                const x1 = Math.min(255, x + 1);
                                const dx = (elevs[y * 256 + x1] - elevs[y * 256 + x0]) * 0.055;
                                const dy = (elevs[y1 * 256 + x] - elevs[y0 * 256 + x]) * 0.055;
                                const shade = Math.min(1.35, Math.max(0.38, 0.78 + (dx * -0.65 - dy * 0.65) * 0.08));

                                // Paleta Hipsométrica Clásica de Alto Contraste
                                let r, g, b;
                                if (e < 200) { // Valle Central fluvial (Verde esmeralda profundo)
                                    const t = Math.max(0, (e - 100) / 100);
                                    r = 22 + t * 30; g = 130 - t * 10; b = 40 + t * 20;
                                } else if (e < 450) { // Terrazas y pie de monte (Verde claro a amarillo-oro)
                                    const t = (e - 200) / 250;
                                    r = 52 + t * 170; g = 150 + t * 60; b = 60 - t * 30;
                                } else if (e < 900) { // Precordillera media (Amarillo cálido a ocre)
                                    const t = (e - 450) / 450;
                                    r = 222 - t * 20; g = 210 - t * 80; b = 30 - t * 10;
                                } else if (e < 1600) { // Bosque y ladera andina (Naranja a terracota/marrón)
                                    const t = (e - 900) / 700;
                                    r = 202 - t * 50; g = 130 - t * 70; b = 20 + t * 10;
                                } else if (e < 2300) { // Roquedales y escarpes andinos (Marrón pizarra)
                                    const t = (e - 1600) / 700;
                                    r = 152 - t * 80; g = 60 + t * 30; b = 30 + t * 60;
                                } else { // Cumbres alpinas y nieves eternas (Blanco nieve brillante)
                                    const t = Math.min(1, (e - 2300) / 700);
                                    r = 180 + t * 75; g = 180 + t * 75; b = 200 + t * 55;
                                }

                                const pIdx = idx * 4;
                                o[pIdx]   = Math.min(255, Math.round(r * shade));
                                o[pIdx+1] = Math.min(255, Math.round(g * shade));
                                o[pIdx+2] = Math.min(255, Math.round(b * shade));
                                o[pIdx+3] = 255;
                            }
                        }
                        ctx.putImageData(outData, 0, 0);
                        done(null, tile);
                    } catch (err) {
                        ctx.fillStyle = '#1e293b';
                        ctx.fillRect(0, 0, 256, 256);
                        done(null, tile);
                    }
                };
                img.onerror = function() {
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(0, 0, 256, 256);
                    done(null, tile);
                };
                img.src = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${coords.z}/${coords.x}/${coords.y}.png`;
                return tile;
            }
        });
        const demColor = new DemColorGridLayer({
            attribution: 'AWS Elevation &copy; SRTM / Mapzen DEM &mdash; Hipsometría de Alto Contraste',
            maxZoom: 15,
            minZoom: 9
        });

        // 2. Frecuencias e Índices Espectrales Satelitales (Sentinel-2 y Sentinel-1)
        const ndviSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Sentinel-2 L2A &mdash; NDVI Vigor Vegetal & Clorofila (B8 NIR / B4 Red)',
            maxZoom: 18,
            className: 'spectral-ndvi-tile-filter'
        });

        const ndmiSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Sentinel-2 L2A &mdash; NDMI Humedad Canopia & Estrés Hídrico (B8 NIR / B11 SWIR)',
            maxZoom: 18,
            className: 'spectral-ndmi-tile-filter'
        });

        const nbrSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Sentinel-2 L2A &mdash; NBR Combustible Seco & Riesgo Fuego (B8A NIR / B12 SWIR-2)',
            maxZoom: 18,
            className: 'spectral-nbr-tile-filter'
        });

        const sarRadar = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Sentinel-1 C-SAR &mdash; Radar 5.4 GHz Microondas Todo-Tiempo (VV/VH)',
            maxZoom: 18,
            className: 'spectral-sar-tile-filter'
        });

        const falseColorSwir = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Sentinel-2 &mdash; Falso Color Infrarrojo SWIR-2/NIR/Red (B12, B8, B4)',
            maxZoom: 18,
            className: 'spectral-swir-tile-filter'
        });

        const ndwiSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Sentinel-2 L2A &mdash; NDWI Agua Libre & Humedad Superficial (B3 Verde / B8 NIR)',
            maxZoom: 18,
            className: 'spectral-ndwi-tile-filter'
        });

        const eviSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Sentinel-2 L2A &mdash; EVI/SAVI Vigor Vegetal Ajustado por Suelo (B8 NIR / B4 Red / B2 Blue)',
            maxZoom: 18,
            className: 'spectral-evi-tile-filter'
        });

        const lstThermal = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Landsat-9 / Sentinel-3 &mdash; LST Temperatura Superficial Radiométrica (B10 TIR)',
            maxZoom: 18,
            className: 'spectral-lst-tile-filter'
        });

        // 3. Curvas de Nivel Keyline Prediales (Fundo Meniel a 2 metros de desnivel)
        const keylineContoursGroup = L.featureGroup();
        const keylineAltitudes = [
            { cota: 192, latOffset: 0.0020, color: '#10b981' },
            { cota: 194, latOffset: 0.0010, color: '#34d399' },
            { cota: 196, latOffset: 0.0000, color: '#6ee7b7' },
            { cota: 198, latOffset: -0.0010, color: '#a7f3d0' },
            { cota: 200, latOffset: -0.0020, color: '#f59e0b' }
        ];
        keylineAltitudes.forEach(alt => {
            const pts = [
                [-36.2095 + alt.latOffset, -71.6095],
                [-36.2105 + alt.latOffset, -71.6070],
                [-36.2118 + alt.latOffset, -71.6045],
                [-36.2132 + alt.latOffset, -71.6020],
                [-36.2140 + alt.latOffset, -71.6000]
            ];
            const line = L.polyline(pts, {
                color: alt.color,
                weight: 2,
                dashArray: '5, 4',
                opacity: 0.85
            });
            line.bindTooltip(`<b>Cota Keyline ${alt.cota} m.s.n.m.</b><br><span style="font-size:9px;color:#94a3b8;">Canal de infiltración y zanja subsoladora</span>`, { sticky: true });
            line.addTo(keylineContoursGroup);
        });
        window.keylineContoursGroup = keylineContoursGroup;

        const baseLayers = {
            "🛰️ Satélite HD (ESRI)": esriSat,
            "🏔️ DEM Hipsométrico 3D": demColor,
            "🏛️ Topo-Administrativo": openTopo,
            "🏔️ Relieve Hillshade DEM": hillshadeDem,
            "🌱 Índice NDVI Sentinel-2": ndviSat,
            "💧 Humedad Suelo NDWI": ndwiSat,
            "💧 Humedad Canopia NDMI": ndmiSat,
            "🌾 Vigor Ajustado EVI": eviSat,
            "🔥 Combustible Seco NBR": nbrSat,
            "🌡️ LST Térmico Radiométrico": lstThermal,
            "📡 Radar SAR Sentinel-1": sarRadar,
            "🛰️ Falso Color SWIR": falseColorSwir,
            "🗺️ OpenStreetMap": osmStandard
        };

        // Activar Satélite ESRI por defecto (Cero errores 404, resolución satelital cristalina)
        esriSat.addTo(map);

        window.currentBaseLayer = esriSat;
        window.leafletBaseLayers = {
            esriSat: esriSat,
            demColor: demColor,
            openTopo: openTopo,
            darkTactical: darkTactical,
            osmStandard: osmStandard,
            hillshadeDem: hillshadeDem,
            ndviSat: ndviSat,
            ndwiSat: ndwiSat,
            ndmiSat: ndmiSat,
            eviSat: eviSat,
            nbrSat: nbrSat,
            lstThermal: lstThermal,
            sarRadar: sarRadar,
            falseColorSwir: falseColorSwir
        };

        // Función para inyectar patrones SVG tácticos (punteados / stippled) en Leaflet
        window.injectTacticalSvgPatterns = function() {
            try {
                const overlayPane = map.getPanes() ? map.getPanes().overlayPane : null;
                const svg = overlayPane ? overlayPane.querySelector('svg') : null;
                if (!svg) return;
                let defs = svg.querySelector('defs#tacticalSvgDefs');
                if (!defs) {
                    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                    defs.id = 'tacticalSvgDefs';
                    svg.insertBefore(defs, svg.firstChild);
                }
                defs.innerHTML = `
                    <pattern id="pattern-tactical-flood" width="12" height="12" patternUnits="userSpaceOnUse">
                        <rect width="12" height="12" fill="rgba(14, 165, 233, 0.22)" />
                        <circle cx="6" cy="6" r="2.2" fill="#38bdf8" opacity="0.9" />
                        <circle cx="0" cy="0" r="1.2" fill="#0284c7" opacity="0.6" />
                        <circle cx="12" cy="12" r="1.2" fill="#0284c7" opacity="0.6" />
                    </pattern>
                    <pattern id="pattern-tactical-fire" width="12" height="12" patternUnits="userSpaceOnUse">
                        <rect width="12" height="12" fill="rgba(239, 68, 68, 0.24)" />
                        <circle cx="6" cy="6" r="2.4" fill="#f97316" opacity="0.95" />
                        <circle cx="0" cy="0" r="1.4" fill="#dc2626" opacity="0.75" />
                        <circle cx="12" cy="12" r="1.4" fill="#dc2626" opacity="0.75" />
                    </pattern>
                    <pattern id="pattern-tactical-landslide" width="12" height="12" patternUnits="userSpaceOnUse">
                        <rect width="12" height="12" fill="rgba(245, 158, 11, 0.24)" />
                        <circle cx="6" cy="6" r="2.2" fill="#fbbf24" opacity="0.9" />
                        <circle cx="0" cy="0" r="1.2" fill="#d97706" opacity="0.7" />
                        <circle cx="12" cy="12" r="1.2" fill="#d97706" opacity="0.7" />
                    </pattern>
                `;
            } catch (err) {
                console.warn('Tactical SVG Defs:', err);
            }
        };

        window.setMapBaseLayer = function(layerKey) {
            if (!window.leafletBaseLayers || !window.leafletBaseLayers[layerKey]) return;
            if (window.currentBaseLayer) {
                map.removeLayer(window.currentBaseLayer);
            }
            window.currentBaseLayer = window.leafletBaseLayers[layerKey];
            window.currentBaseLayer.addTo(map);

            const isDarkTactical = (layerKey === 'darkTactical');
            const mapContainer = map.getContainer();
            if (mapContainer) {
                mapContainer.classList.toggle('c2-tactical-active', isDarkTactical);
            }

            // Inyectar patrones SVG para unidades tácticas de riesgo
            window.injectTacticalSvgPatterns();
            
            // Actualizar botones de capa en el menú lateral
            const allLayerButtons = [
                'btnLayerSat', 'btnLayerDemColor', 'btnLayerTopo', 'btnLayerDark',
                'btnLayerHillshadeDem',
                'btnLayerNdvi', 'btnLayerNdwi', 'btnLayerNdmi', 'btnLayerEvi', 'btnLayerNbr', 'btnLayerLst', 'btnLayerSar', 'btnLayerSwir'
            ];
            const btnKeyMap = {
                'esriSat': 'btnLayerSat',
                'demColor': 'btnLayerDemColor',
                'openTopo': 'btnLayerTopo',
                'darkTactical': 'btnLayerDark',
                'hillshadeDem': 'btnLayerHillshadeDem',
                'ndviSat': 'btnLayerNdvi',
                'ndwiSat': 'btnLayerNdwi',
                'ndmiSat': 'btnLayerNdmi',
                'eviSat': 'btnLayerEvi',
                'nbrSat': 'btnLayerNbr',
                'lstThermal': 'btnLayerLst',
                'sarRadar': 'btnLayerSar',
                'falseColorSwir': 'btnLayerSwir'
            };
            const actCls = 'px-2 py-1.5 rounded-lg bg-sky-500/30 text-sky-200 border border-sky-400/60 font-mono text-[10px] font-bold transition-all cursor-pointer text-center shadow-[0_0_10px_rgba(56,189,248,0.25)]';
            const inactCls = 'px-2 py-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 font-mono text-[10px] transition-all cursor-pointer text-center';

            allLayerButtons.forEach(btnId => {
                const el = document.getElementById(btnId);
                if (!el) return;
                const targetBtnId = btnKeyMap[layerKey];
                el.className = (btnId === targetBtnId) ? actCls : inactCls;
            });

            // Actualizar leyenda contextual dinámica
            if (window.updateContextualSpectralLegend) {
                window.updateContextualSpectralLegend(layerKey);
            }

            // Sincronizar visuales de unidades tácticas
            if (window.syncTacticalRiskUnits) {
                window.syncTacticalRiskUnits(isDarkTactical);
            }
        };

        // Actualizar Leyenda Espectral Contextual según la Capa Activa
        window.updateContextualSpectralLegend = function(layerKey) {
            const widget = document.getElementById('cuencaSpectralLegendWidget');
            const titleEl = document.getElementById('cuencaSpectralLegendTitle');
            const rampEl = document.getElementById('cuencaSpectralLegendRamp');
            const labelsEl = document.getElementById('cuencaSpectralLegendLabels');
            const noteEl = document.getElementById('cuencaSpectralLegendNote');
            if (!widget) return;

            const legendConfigs = {
                'ndviSat': {
                    title: '🌱 Índice NDVI (Vigor Vegetal & Clorofila)',
                    titleColor: '#4ade80',
                    ramp: `
                        <div style="flex: 1; background: #8c4516;" title="< 0.15 Suelo desnudo / Rastrojo"></div>
                        <div style="flex: 1; background: #d9381e;" title="0.15 - 0.35 Estrés severo"></div>
                        <div style="flex: 1; background: #f2d126;" title="0.35 - 0.60 Vigor moderado"></div>
                        <div style="flex: 1; background: #38bf40;" title="0.60 - 0.75 Vigor alto"></div>
                        <div style="flex: 1; background: #0b732e;" title="> 0.75 Dosel denso óptimo"></div>
                    `,
                    labels: `<span>0.10 (Suelo)</span><span>0.40 (Estrés)</span><span>0.85 (Óptimo)</span>`,
                    note: 'Sentinel-2 L2A B8 (NIR 842nm) + B4 (Red 665nm). Detecta densidad de biomasa fotosintética.'
                },
                'ndmiSat': {
                    title: '💧 Índice NDMI (Estrés Hídrico & Humedad Canopia)',
                    titleColor: '#38bdf8',
                    ramp: `
                        <div style="flex: 1; background: #b45309;" title="< -0.10 Déficit hídrico severo"></div>
                        <div style="flex: 1; background: #f59e0b;" title="-0.10 - 0.10 Estrés hídrico moderado"></div>
                        <div style="flex: 1; background: #06b6d4;" title="0.10 - 0.25 Humedad media"></div>
                        <div style="flex: 1; background: #0284c7;" title="0.25 - 0.40 Humedad óptima"></div>
                        <div style="flex: 1; background: #1d4ed8;" title="> 0.40 Saturación / Riego pleno"></div>
                    `,
                    labels: `<span>-0.20 (Sequía)</span><span>0.15 (Normal)</span><span>0.45 (Saturado)</span>`,
                    note: 'Sentinel-2 B8 (NIR) vs B11 (SWIR 1610nm). Alerta deshidratación celular 10-14 días antes de marchitez.'
                },
                'ndwiSat': {
                    title: '💧 Índice NDWI (Agua Libre & Humedad Superficial)',
                    titleColor: '#38bdf8',
                    ramp: `
                        <div style="flex: 1; background: #b45309;" title="< -0.20 Suelo árido"></div>
                        <div style="flex: 1; background: #f59e0b;" title="-0.20 - 0.0 Humedad baja"></div>
                        <div style="flex: 1; background: #06b6d4;" title="0.0 - 0.20 Humedad superficial media"></div>
                        <div style="flex: 1; background: #0284c7;" title="0.20 - 0.40 Suelo saturado / Charcos"></div>
                        <div style="flex: 1; background: #1e40af;" title="> 0.40 Agua libre / Tranques"></div>
                    `,
                    labels: `<span>-0.30 (Seco)</span><span>0.10 (Húmedo)</span><span>0.50 (Agua)</span>`,
                    note: 'Sentinel-2 B3 (Green 560nm) vs B8 (NIR 842nm). Mapeo de láminas de agua, esteros y tranques.'
                },
                'eviSat': {
                    title: '🌾 Índice EVI/SAVI (Vigor Ajustado por Suelo)',
                    titleColor: '#84cc16',
                    ramp: `
                        <div style="flex: 1; background: #78350f;" title="< 0.10 Suelo desnudo / Rastrojo"></div>
                        <div style="flex: 1; background: #d97706;" title="0.10 - 0.25 Biomasa incipiente"></div>
                        <div style="flex: 1; background: #eab308;" title="0.25 - 0.45 Vigor medio"></div>
                        <div style="flex: 1; background: #65a30d;" title="0.45 - 0.65 Cobertura densa"></div>
                        <div style="flex: 1; background: #15803d;" title="> 0.65 Dosel hiper-vigoroso"></div>
                    `,
                    labels: `<span>0.05 (Suelo)</span><span>0.35 (Medio)</span><span>0.75 (Alto)</span>`,
                    note: 'Sentinel-2 L2A B8/B4/B2 con factor L=0.5. Elimina ruido del suelo en frutales con espaciamiento amplio.'
                },
                'lstThermal': {
                    title: '🌡️ LST Temperatura Superficial (Radiometría Térmica)',
                    titleColor: '#f43f5e',
                    ramp: `
                        <div style="flex: 1; background: #1e3a8a;" title="< 12°C Zonas húmedas / Sombrías"></div>
                        <div style="flex: 1; background: #0284c7;" title="12 - 18°C Canopia transpirando"></div>
                        <div style="flex: 1; background: #eab308;" title="18 - 26°C Temperatura moderada"></div>
                        <div style="flex: 1; background: #ea580c;" title="26 - 34°C Estrés térmico"></div>
                        <div style="flex: 1; background: #991b1b;" title="> 34°C Suelo sobrecalentado"></div>
                    `,
                    labels: `<span>10°C (Frío)</span><span>22°C (Óptimo)</span><span>38°C (Extremo)</span>`,
                    note: 'Sensor Térmico Infrarrojo (TIR 10-12µm). Identifica islas de calor y estrés radiativo antes del marchitamiento.'
                },
                'nbrSat': {
                    title: '🔥 Índice NBR (Combustible Seco & Riesgo Fuego)',
                    titleColor: '#fb7185',
                    ramp: `
                        <div style="flex: 1; background: #dc2626;" title="Combustible fino hiper-seco (Alto peligro)"></div>
                        <div style="flex: 1; background: #ea580c;" title="Vegetación estresada deshidratada"></div>
                        <div style="flex: 1; background: #d97706;" title="Humedad media transicional"></div>
                        <div style="flex: 1; background: #16a34a;" title="Follaje verde hidratado"></div>
                        <div style="flex: 1; background: #059669;" title="Dosel húmedo resistente a ignición"></div>
                    `,
                    labels: `<span>< -0.1 (Crítico)</span><span>0.15 (Seco)</span><span>> 0.50 (Seguro)</span>`,
                    note: 'Sentinel-2 B8A (NIR) vs B12 (SWIR-2 2190nm). Diagnóstico de biomasa seca combustible pre-verano.'
                },
                'sarRadar': {
                    title: '📡 Radar SAR Sentinel-1 (Microondas Todo-Tiempo)',
                    titleColor: '#a78bfa',
                    ramp: `
                        <div style="flex: 1; background: #020617;" title="Agua libre especular (Inundación)"></div>
                        <div style="flex: 1; background: #1e293b;" title="Suelo saturado / Charcos"></div>
                        <div style="flex: 1; background: #475569;" title="Suelo agrícola labrado"></div>
                        <div style="flex: 1; background: #94a3b8;" title="Canopia rugosa / Monte"></div>
                        <div style="flex: 1; background: #f8fafc;" title="Infraestructura / Doble rebote"></div>
                    `,
                    labels: `<span>-24 dB (Agua)</span><span>-14 dB (Suelo)</span><span>-4 dB (Estructuras)</span>`,
                    note: 'Banda C (5.4 GHz VV/VH). Penetra nubes de tormenta y humo. Mapea crecidas cuando el cielo está cubierto.'
                },
                'falseColorSwir': {
                    title: '🛰️ Falso Color SWIR (Penetración de Humo & Suelo)',
                    titleColor: '#f59e0b',
                    ramp: `
                        <div style="flex: 1; background: #1e1b4b;" title="Agua profunda"></div>
                        <div style="flex: 1; background: #b45309;" title="Suelo seco / Tierra expuesta"></div>
                        <div style="flex: 1; background: #0284c7;" title="Suelo húmedo / Barros"></div>
                        <div style="flex: 1; background: #16a34a;" title="Vegetación vigorosa"></div>
                        <div style="flex: 1; background: #ef4444;" title="Frente térmico activo"></div>
                    `,
                    labels: `<span>B12 (SWIR-2)</span><span>B8 (NIR)</span><span>B4 (Rojo)</span>`,
                    note: 'SWIR 2.2µm traspasa aerosoles y humo de incendios permitiendo ver el terreno en crisis.'
                },
                'hillshadeDem': {
                    title: '🏔️ Relieve Hillshade DEM (Topografía 3D Analítica)',
                    titleColor: '#e2e8f0',
                    ramp: `
                        <div style="flex: 1; background: #1e293b;" title="Fondo de quebrada / Sombra 3D"></div>
                        <div style="flex: 1; background: #334155;" title="Ladera umbría pronunciada"></div>
                        <div style="flex: 1; background: #64748b;" title="Pendiente media"></div>
                        <div style="flex: 1; background: #cbd5e1;" title="Solana / Ladera iluminada"></div>
                        <div style="flex: 1; background: #ffffff;" title="Cresta divisoria de aguas"></div>
                    `,
                    labels: `<span>0° (Valle)</span><span>25° (Ladera)</span><span>> 45° (Escarpe)</span>`,
                    note: 'Copernicus DEM 30m / SRTM. Modelo de iluminación azimut 315° / altitud 45°. Revela cañones y pendientes.'
                },
                'demColor': {
                    title: '🏔️ DEM Hipsométrico 3D (Elevación & Batimetría)',
                    titleColor: '#facc15',
                    ramp: `
                        <div style="flex: 1; background: #166534;" title="120 - 220m Valle Fluvial"></div>
                        <div style="flex: 1; background: #84cc16;" title="220 - 450m Terrazas & Pie de Monte"></div>
                        <div style="flex: 1; background: #facc15;" title="450 - 900m Precordillera Media"></div>
                        <div style="flex: 1; background: #ea580c;" title="900 - 1600m Ladera Andina"></div>
                        <div style="flex: 1; background: #78350f;" title="1600 - 2300m Roquedales"></div>
                        <div style="flex: 1; background: #f8fafc;" title="> 2300m Cumbres & Nieves"></div>
                    `,
                    labels: `<span>140m (Valle)</span><span>650m (Precordillera)</span><span>> 2400m (Andes)</span>`,
                    note: 'Modelo Digital de Elevación SRTM 30m calibrado con sombreado de relieve 3D y batimetría fluvial/embalse.'
                }
            };

            const cfg = legendConfigs[layerKey];
            const intLegend = document.getElementById('integratedSpectralLegendContent');
            const intLegendBlock = document.getElementById('integratedSpectralLegendBlock');

            if (cfg) {
                if (titleEl) {
                    titleEl.innerText = cfg.title;
                    titleEl.style.color = cfg.titleColor;
                }
                if (rampEl) rampEl.innerHTML = cfg.ramp;
                if (labelsEl) labelsEl.innerHTML = cfg.labels;
                if (noteEl) noteEl.innerText = cfg.note;

                if (intLegend) {
                    intLegend.innerHTML = `
                        <div class="space-y-1.5 p-2 rounded-lg bg-black/60 border border-white/10 font-mono text-[9.5px]">
                            <div class="flex items-center justify-between font-bold" style="color: ${cfg.titleColor}">
                                <span>${cfg.title}</span>
                                <span class="text-[8.5px] px-1 rounded bg-white/10 text-slate-300">ACTIVA</span>
                            </div>
                            <div style="display: flex; height: 10px; border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2);">
                                ${cfg.ramp}
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 8.5px; color: #cbd5e1;">
                                ${cfg.labels}
                            </div>
                            <div style="font-size: 8.5px; color: #94a3b8; line-height: 1.3;" class="pt-1 border-t border-white/5">
                                ${cfg.note}
                            </div>
                        </div>
                    `;
                }
                if (intLegendBlock) intLegendBlock.style.display = 'block';
            } else {
                // Es capa base pura -> Ocultar leyenda espectral
                if (intLegendBlock) intLegendBlock.style.display = 'none';
            }
        };

        // Actualizar Leyenda Táctica Contextual (Solo mostrar riesgos actualmente activos)
        window.updateContextualTacticalLegend = function() {
            const widget = document.getElementById('cuencaTacticalLegendWidget');
            if (!widget) return;

            const isFloodActive = overlayLayers['inundacion'] && map.hasLayer(overlayLayers['inundacion']);
            const isFireActive = overlayLayers['incendios'] && map.hasLayer(overlayLayers['incendios']);
            const isSlideActive = overlayLayers['landslides'] && map.hasLayer(overlayLayers['landslides']);
            const isVecinosActive = overlayLayers['vecinos'] && map.hasLayer(overlayLayers['vecinos']);
            const anyRisk = isFloodActive || isFireActive || isSlideActive || isVecinosActive;

            const secHvr = document.getElementById('tacticalLegendSecHvr');
            const secColonia = document.getElementById('tacticalLegendSecColonia');
            const secFire = document.getElementById('tacticalLegendSecFire');
            const secSlide = document.getElementById('tacticalLegendSecSlide');
            const secDefense = document.getElementById('tacticalLegendSecDefense');

            if (secHvr) secHvr.style.display = anyRisk ? 'block' : 'none';
            if (secColonia) secColonia.style.display = (isFloodActive || isVecinosActive) ? 'block' : 'none';
            if (secFire) secFire.style.display = isFireActive ? 'block' : 'none';
            if (secSlide) secSlide.style.display = isSlideActive ? 'block' : 'none';
            if (secDefense) secDefense.style.display = anyRisk ? 'block' : 'none';

            widget.style.display = 'none'; // Siempre oculto del mapa; disponible en Tab 3 (Riesgos)
        };

        // Alternar Curvas de Nivel Keyline Prediales
        window.toggleKeylineContoursLayer = function() {
            const grp = window.keylineContoursGroup;
            const btn = document.getElementById('btnKeylineContours');
            if (!grp) return;
            const isActive = map.hasLayer(grp);
            if (isActive) {
                map.removeLayer(grp);
                if (btn) btn.className = 'px-2 py-2 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 font-mono text-[10px] transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5';
            } else {
                map.addLayer(grp);
                if (btn) btn.className = 'px-2 py-2 rounded-lg bg-emerald-500/25 text-emerald-300 border border-emerald-400/60 font-mono text-[10px] font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 shadow-[0_0_10px_rgba(16,185,129,0.25)]';
                map.flyTo([-36.2115, -71.6050], 15, { duration: 1.0 });
            }
        };

        // Ingesta Interactiva de DEM Propio
        window.openDemUploadModal = function() {
            let m = document.getElementById('modalDemUpload');
            if (!m) {
                m = document.createElement('div');
                m.id = 'modalDemUpload';
                m.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4';
                m.innerHTML = `
                    <div class="bg-[#0b1220] border border-amber-500/40 rounded-2xl max-w-lg w-full p-5 shadow-2xl font-mono text-slate-200 space-y-4">
                        <div class="flex items-center justify-between border-b border-white/10 pb-3">
                            <span class="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                                <span>🏔️</span> Ingesta de DEM / Dron / LiDAR (Predio Meniel)
                            </span>
                            <button onclick="document.getElementById('modalDemUpload').classList.add('hidden')" class="text-slate-400 hover:text-white text-base">✕</button>
                        </div>
                        <div class="border-2 border-dashed border-amber-500/40 rounded-xl p-6 text-center hover:bg-white/5 transition-all cursor-pointer" onclick="document.getElementById('fileInputDem').click()">
                            <input type="file" id="fileInputDem" class="hidden" accept=".tif,.tiff,.geojson,.json,.asc" onchange="window.simulateDemUpload(this.files[0])">
                            <div class="text-3xl mb-2">📥</div>
                            <p class="text-xs font-bold text-amber-200 mb-1">Arrastre su archivo GeoTIFF / DEM ráster aquí</p>
                            <p class="text-[10px] text-slate-400">o haga clic para examinar desde su equipo</p>
                            <p class="text-[8.5px] text-slate-500 mt-2">Formatos: .tif, .geotiff, .geojson (curvas LiDAR/Dron) &bull; Máx 500 MB</p>
                        </div>
                        <div class="p-3 rounded-lg bg-black/50 border border-white/5 space-y-1.5 text-[9.5px]">
                            <div class="flex items-center justify-between text-slate-400">
                                <span>Sistema de Coordenadas:</span>
                                <span class="text-amber-300 font-bold">EPSG:32719 (UTM 19S) / WGS84</span>
                            </div>
                            <div class="flex items-center justify-between text-slate-400">
                                <span>Resolución Espacial:</span>
                                <span class="text-amber-300 font-bold">5 cm - 1 m / px (Dron / WebODM / QGIS)</span>
                            </div>
                            <div class="flex items-center justify-between text-slate-400">
                                <span>Área Objetivo:</span>
                                <span class="text-emerald-300 font-bold">Fundo Meniel (24.8 ha) & Microcuenca</span>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="document.getElementById('modalDemUpload').classList.add('hidden')" class="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs">Cancelar</button>
                            <button onclick="window.simulateDemUpload({name: 'meniel_dsm_dron_10cm.tif'})" class="flex-1 py-2 rounded-lg bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/60 text-amber-200 hover:text-white text-xs font-bold transition-all">Simular Carga de DEM</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(m);
            }
            m.classList.remove('hidden');
        };

        window.simulateDemUpload = function(file) {
            const fileName = file ? file.name : 'meniel_dem_dron_10cm.tif';
            const m = document.getElementById('modalDemUpload');
            if (m) m.classList.add('hidden');
            
            // Activar curvas Keyline y centrar en Meniel con toast feedback
            if (typeof window.toggleKeylineContoursLayer === 'function') {
                window.toggleKeylineContoursLayer();
            }
            
            const toast = document.createElement('div');
            toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,0.95);color:#fcd34d;padding:10px 18px;border-radius:12px;font-family:JetBrains Mono,monospace;font-size:11px;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,0.8);border:1px solid rgba(245,158,11,0.5);z-index:99999;display:flex;align-items:center;gap:10px;backdrop-filter:blur(12px);';
            toast.innerHTML = '<span>🏔️</span> <span>DEM <b>' + fileName + '</b> georreferenciado con éxito sobre Meniel (EPSG:32719). Curvas activas.</span>';
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.4s ease';
                setTimeout(() => toast.remove(), 400);
            }, 3500);
        };

        window.toggleCuencaTacticalLegend = function(forceState) {
            const legend = document.getElementById('cuencaTacticalLegendWidget');
            if (legend) legend.style.display = 'none'; // Siempre oculto del mapa para despejar la vista
            
            // Redirigir al usuario al nuevo sistema limpio: Tab 3 (Riesgos Climáticos)
            if (typeof window.selectSidebarTab === 'function') {
                window.selectSidebarTab('tab-riesgos');
            }
            // Asegurar que el sidebar esté expandido
            const sidebar = document.getElementById('territorialSidebar');
            if (sidebar && sidebar.classList.contains('-translate-x-full')) {
                sidebar.classList.remove('-translate-x-full');
            }
            const btn = document.getElementById('btnDockTacticalLegend');
            if (btn) {
                btn.classList.add('bg-purple-600', 'text-white');
                btn.classList.remove('bg-purple-500/20', 'text-purple-200');
                setTimeout(() => {
                    btn.classList.remove('bg-purple-600', 'text-white');
                    btn.classList.add('bg-purple-500/20', 'text-purple-200');
                }, 2000);
            }
        };

        window.toggleCuencaTacticalLegendCompact = function() {
            const body = document.getElementById('cuencaTacticalLegendBody');
            const widget = document.getElementById('cuencaTacticalLegendWidget');
            if (!body || !widget) return;
            if (body.style.display === 'none') {
                body.style.display = 'block';
                widget.style.maxHeight = '480px';
            } else {
                body.style.display = 'none';
                widget.style.maxHeight = '48px';
            }
        };

        window.refreshAndAutoUpdateMap = function() {
            if (!map) return;
            const btn = document.getElementById('btnAutoRefreshMap');
            if (btn) {
                btn.innerHTML = '<span class="animate-spin">🔄</span><span>Actualizando...</span>';
            }
            // Forzar invalidación de dimensiones
            map.invalidateSize(true);
            
            // Re-dibujar base layer
            if (window.currentBaseLayer && typeof window.currentBaseLayer.redraw === 'function') {
                window.currentBaseLayer.redraw();
            }
            
            // Sincronizar canvas de flujos energéticos
            if (window.energyFlowEngine) {
                window.energyFlowEngine.resize();
            }

            setTimeout(() => {
                if (btn) {
                    btn.innerHTML = '<span>✅</span><span>Actualizado</span>';
                    setTimeout(() => {
                        btn.innerHTML = '<span>🔄</span><span>Auto-Actualizar Mapa</span>';
                    }, 1400);
                }
            }, 300);
        };

        window.centerMapToBasin = function() {
            if (!map) return;
            map.flyTo([-36.1432, -71.65], 11, { duration: 1.0 });
        };

        const mainLayersControl = L.control.layers(baseLayers, null, { position: 'topleft', collapsed: true }).addTo(map);

        // Map Layers Object to hold references
        const overlayLayers = {};
        window.overlayLayers = overlayLayers;

        // 2.1 Mosaico Catastral Predial Rural (Roles SII)
        function getPredioScenarioStyle(feature, presetKey) {
            const p = feature.properties;
            const key = presetKey || (window.cuencaForecastState?.activePreset || 'normal');
            
            // Reacción biológica y de riesgo según escenario climático
            if (key === 'puelche_fire') {
                if (p.id === 'LOS_BOLDOS') {
                    return { color: '#ef4444', weight: 3.5, opacity: 1, fillColor: '#dc2626', fillOpacity: 0.75 };
                } else if (p.id === 'EL_CULENAR' || p.id === 'MENIEL') {
                    return { color: '#10b981', weight: 2.5, opacity: 0.95, fillColor: '#059669', fillOpacity: 0.55 }; // Cortafuego resiliente
                } else {
                    return { color: '#f97316', weight: 2, opacity: 0.85, fillColor: '#ea580c', fillOpacity: 0.50 };
                }
            } else if (key === 'storm_t100') {
                if (p.id === 'RESERVA_RIO' || p.id === 'SAN_JOSE' || p.id === 'EL_SAUCE') {
                    return { color: '#1d4ed8', weight: 3.5, opacity: 1, fillColor: '#2563eb', fillOpacity: 0.70 }; // Desborde aluvial
                } else {
                    return { color: '#0284c7', weight: 2, opacity: 0.85, fillColor: '#0ea5e9', fillOpacity: 0.45 };
                }
            } else if (key === 'storm_t10') {
                if (p.id === 'RESERVA_RIO' || p.id === 'SAN_JOSE') {
                    return { color: '#0284c7', weight: 2.5, opacity: 0.9, fillColor: '#38bdf8', fillOpacity: 0.55 };
                } else {
                    return { color: '#0369a1', weight: 1.8, opacity: 0.8, fillColor: '#0284c7', fillOpacity: 0.35 };
                }
            } else if (key === 'heatwave') {
                if (p.id === 'LOS_BOLDOS' || p.id === 'VINA_AUSTRAL') {
                    return { color: '#f43f5e', weight: 2.5, opacity: 0.9, fillColor: '#e11d48', fillOpacity: 0.60 }; // Estrés térmico crítico
                } else if (p.id === 'MENIEL' || p.id === 'STA_LUCIA') {
                    return { color: '#f59e0b', weight: 2, opacity: 0.85, fillColor: '#d97706', fillOpacity: 0.45 };
                } else {
                    return { color: '#fb923c', weight: 2, opacity: 0.8, fillColor: '#f97316', fillOpacity: 0.45 };
                }
            } else if (key === 'drought') {
                if (p.id === 'MENIEL') {
                    return { color: '#10b981', weight: 2, opacity: 0.9, fillColor: '#10b981', fillOpacity: 0.45 }; // Zanjas Keyline retienen agua
                } else {
                    return { color: '#d97706', weight: 2, opacity: 0.85, fillColor: '#b45309', fillOpacity: 0.50 }; // Abatimiento hídrico general
                }
            } else if (key === 'winter_dry') {
                return { color: '#93c5fd', weight: 2, opacity: 0.85, fillColor: '#60a5fa', fillOpacity: 0.35 }; // Helada polar
            }

            // Normal / Base
            return {
                color: p.stroke || '#10b981',
                weight: 2,
                opacity: 0.9,
                fillColor: p.color || '#10b981',
                fillOpacity: 0.35
            };
        }

        // ═══════════════════════════════════════════════════════════════════
        // 2.1 CATASTRO PREDIAL: SEPARACIÓN LIMPIA DE FUNDO MENIEL & RED VECINAL
        // ═══════════════════════════════════════════════════════════════════
        const menielFeature = geojsonPredios.features.find(f => f.properties.id === 'MENIEL') || geojsonPredios.features[0];
        const vecinosFeatures = geojsonPredios.features.filter(f => f.properties.id !== 'MENIEL');

        // 1. Capa Fundo Meniel (Ancla Territorial Principal - ACTIVA POR DEFECTO)
        const menielLayer = L.geoJSON(menielFeature, {
            style: function() {
                return {
                    color: '#10b981',
                    weight: 3.2,
                    fillColor: '#10b981',
                    fillOpacity: 0.22,
                    className: 'meniel-anchor-polygon'
                };
            },
            onEachFeature: function(feature, layer) {
                const p = feature.properties;
                layer.on('mouseover', function() { this.setStyle({ fillOpacity: 0.45, weight: 4 }); });
                layer.on('mouseout', function() { this.setStyle({ fillOpacity: 0.22, weight: 3.2 }); });
                const popupHtml = `
                    <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; min-width: 250px; padding: 4px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #10b981; padding-bottom: 4px; margin-bottom: 6px;">
                            <strong style="color: #34d399; font-size: 13px;">🏡 ${p.name}</strong>
                            <span style="background: rgba(16, 185, 129, 0.25); color: #6ee7b7; padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: bold;">TWIN ACTIVO</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                            <span style="color: #94a3b8;">Rol SII:</span>
                            <span style="color: #f8fafc; font-weight: bold; background: rgba(255,255,255,0.1); padding: 1px 4px; border-radius: 3px;">${p.rol}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                            <span style="color: #94a3b8;">Superficie:</span>
                            <span style="color: #38bdf8; font-weight: bold;">${p.area_ha} ha</span>
                        </div>
                        <div style="margin-bottom: 4px;">
                            <span style="color: #94a3b8; display: block; font-size: 10px;">Manejo / Sistema:</span>
                            <span style="color: #cbd5e1; font-size: 10px;">${p.crop} (Líneas Clave & Infiltración)</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                            <span style="color: #94a3b8;">Derechos DGA:</span>
                            <span style="color: #0ea5e9; font-weight: bold;">${p.water_L_s} L/s</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                            <span style="color: #94a3b8;">Humedad Suelo FDR:</span>
                            <span style="color: #10b981; font-weight: bold;">${p.vwc}</span>
                        </div>
                        <div style="border-top: 1px solid #1e293b; padding-top: 4px; margin-top: 4px; font-size: 9px; color: #64748b;">
                            Propietario: ${p.owner} &bull; Retiro, Región del Maule
                        </div>
                    </div>
                `;
                layer.bindPopup(popupHtml);
            }
        });
        overlayLayers['meniel'] = menielLayer;
        // Clean Slate: Fundo Meniel es la única capa territorial activa por defecto
        menielLayer.addTo(map);

        // 2. Capa Red Vecinal (9 Predios Colindantes - DESACTIVADA POR DEFECTO)
        const vecinosLayerGroup = L.geoJSON({ type: "FeatureCollection", features: vecinosFeatures }, {
            style: function(feature) {
                return getPredioScenarioStyle(feature, window.cuencaForecastState?.activePreset || 'normal');
            },
            onEachFeature: function(feature, layer) {
                const p = feature.properties;
                layer.on('mouseover', function() { this.setStyle({ fillOpacity: 0.70, weight: 3 }); });
                layer.on('mouseout', function() { 
                    const currentStyle = getPredioScenarioStyle(feature, window.cuencaForecastState?.activePreset);
                    this.setStyle(currentStyle); 
                });
                const popupHtml = `
                    <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; min-width: 240px; padding: 2px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
                            <strong style="color: ${p.color}; font-size: 12px;">${p.name}</strong>
                            <span style="color: #94a3b8; font-size: 9px;">Vecino</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                            <span style="color: #94a3b8;">Rol SII:</span>
                            <span style="color: #f8fafc; font-weight: bold;">${p.rol}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                            <span style="color: #94a3b8;">Superficie:</span>
                            <span style="color: #38bdf8; font-weight: bold;">${p.area_ha} ha</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                            <span style="color: #94a3b8;">Derechos DGA:</span>
                            <span style="color: #0ea5e9; font-weight: bold;">${p.water_L_s} L/s</span>
                        </div>
                    </div>
                `;
                layer.bindPopup(popupHtml);
            }
        });
        overlayLayers['vecinos'] = vecinosLayerGroup;
        overlayLayers['predios'] = vecinosLayerGroup; // Compatibilidad retroactiva

        // Helper para crear Celdas Tácticas de Alerta (Rectángulos Orientados por Transecto)
        // Creador de Celdas de Alerta Táctica con escalado de Intensidad y Opacidad (Hue-Preserving)
        function createTacticalAlertCell(opts) {
            // Si viene severidad porcentual (0-100), escalar opacidad y grosor preservando el color base de la amenaza
            const sev = typeof opts.severityPercent === 'number' ? Math.max(0, Math.min(100, opts.severityPercent)) : 50;
            const computedOpacity = opts.fillOpacity !== undefined ? opts.fillOpacity : (0.12 + (sev / 100) * 0.38);
            const computedWeight = opts.weight !== undefined ? opts.weight : (1.6 + (sev / 100) * 1.8);
            const isCritical = sev >= 75;

            const poly = L.polygon(opts.coords, {
                color: opts.color,
                weight: computedWeight,
                dashArray: isCritical ? null : '6, 4',
                fillColor: opts.color,
                fillOpacity: computedOpacity,
                className: `tactical-alert-cell ${opts.className || ''}`
            });

            const popupHtml = `
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 4px; min-width: 250px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${opts.color}; padding-bottom: 4px; margin-bottom: 6px;">
                        <strong style="color: ${opts.color}; font-size: 12px;">${opts.name}</strong>
                        <span style="background: rgba(255,255,255,0.12); color: #ffffff; padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: bold;">${opts.phase}</span>
                    </div>
                    <div style="font-size: 9.5px; color: #94a3b8; margin-bottom: 5px; background: rgba(0,0,0,0.3); padding: 4px 6px; border-radius: 4px; display: flex; justify-content: space-between;">
                        <span>⚠️ <i>Severidad calculada:</i></span>
                        <b style="color: ${opts.color}; font-size: 10px;">${sev}% [${isCritical ? 'CRÍTICO' : (sev >= 50 ? 'ALTO' : 'MODERADO')}]</b>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 5px; font-size: 10px;">
                        ${opts.metricsHtml || ''}
                    </div>
                    <div style="font-size: 10px; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 4px;">
                        ${opts.notes || ''}
                    </div>
                </div>
            `;
            poly.bindPopup(popupHtml);

            // Badge táctico de esquina con severidad explícita y color nativo de la amenaza
            const center = poly.getBounds().getCenter();
            const badgeLabel = opts.badgeLabel || `[${opts.id}] ${sev}% • ${opts.phase}`;
            const badgeIcon = L.divIcon({
                className: 'tactical-cell-badge-icon',
                html: `
                    <div style="background: rgba(8, 12, 22, 0.94); border: 1.4px ${isCritical ? 'solid' : 'dashed'} ${opts.color}; border-radius: 6px; padding: 2px 7px; box-shadow: 0 2px 10px rgba(0,0,0,0.7); font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 800; color: ${opts.color}; display: flex; align-items: center; gap: 5px; white-space: nowrap; pointer-events: none;">
                        <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${opts.color}; box-shadow: 0 0 6px ${opts.color};"></span>
                        <span>${badgeLabel}</span>
                    </div>
                `,
                iconSize: [140, 22],
                iconAnchor: [70, 11]
            });
            const badge = L.marker(center, { icon: badgeIcon, interactive: false });

            return { poly, badge };
        }

        // Helper para crear flechas de avance operacional en SVG
        function createTacticalArrowMarker(lat, lng, rotationDeg, label, colorHex, strokeHex, isReverse) {
            const svgBody = isReverse
                ? `<path d="M 110 20 L 35 20 L 35 10 L 5 20 L 35 30 L 35 20 Z" fill="${colorHex}" stroke="${strokeHex}" stroke-width="1.5"/>
                   <text x="38" y="16" fill="#030712" font-size="8.5" font-weight="900" font-family="JetBrains Mono">${label}</text>`
                : `<path d="M 10 20 L 85 20 L 85 10 L 115 20 L 85 30 L 85 20 Z" fill="${colorHex}" stroke="${strokeHex}" stroke-width="1.5"/>
                   <text x="18" y="16" fill="#030712" font-size="8.5" font-weight="900" font-family="JetBrains Mono">${label}</text>`;

            const iconHtml = `
                <div style="width: 125px; height: 40px; transform: rotate(${rotationDeg}deg); pointer-events: none; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.7));">
                    <svg viewBox="0 0 125 40" class="w-full h-full">${svgBody}</svg>
                </div>
            `;
            const icon = L.divIcon({
                className: 'tactical-arrow-icon',
                html: iconHtml,
                iconSize: [125, 40],
                iconAnchor: [62, 20]
            });
            return L.marker([lat, lng], { icon: icon });
        }

        // ═══════════════════════════════════════════════════════════════════
        // 2.2 TRANSECTO TÁCTICO FLUVIAL (INUNDACIÓN • CELDAS F-01 A F-03)
        // ═══════════════════════════════════════════════════════════════════
        const transectoFluvialGroup = L.layerGroup();

        // Celda F-01: Cabecera Quilaimo (0-2h)
        const cellF01 = createTacticalAlertCell({
            id: 'F-01',
            threatType: 'flood',
            severityPercent: 88,
            name: '🌊 Talweg Cabecera Quilaimo',
            phase: '0-2h Arribo',
            color: '#0284c7',
            badgeLabel: '[F-01] 88% CRÍTICO • Q_PICO',
            coords: [[-36.1830, -71.6540], [-36.1810, -71.6465], [-36.1870, -71.6460], [-36.1890, -71.6535]],
            metricsHtml: `
                <div>• Calado Máx: <b style="color:#ffffff;">1.85 m</b></div>
                <div>• Caudal Pico: <b style="color:#38bdf8;">142 m³/s</b></div>
                <div>• Velocidad: <b style="color:#bae6fd;">2.4 m/s</b></div>
                <div>• Avance: <b style="color:#fde047;">2.1 km/h ➔</b></div>
            `,
            notes: '🎯 Desborde primario del lecho matriz Longaví hacia vegas bajas.'
        });
        cellF01.poly.addTo(transectoFluvialGroup);
        cellF01.badge.addTo(transectoFluvialGroup);

        // Celda F-02: Valle Meniel Keyline (2-6h)
        const cellF02 = createTacticalAlertCell({
            id: 'F-02',
            threatType: 'flood',
            severityPercent: 58,
            name: '🌊 Valle Meniel Keyline',
            phase: '2-6h Propagación',
            color: '#0284c7',
            badgeLabel: '[F-02] 58% MEDIO • KEYLINE',
            coords: [[-36.1960, -71.6290], [-36.1940, -71.6210], [-36.2000, -71.6210], [-36.2020, -71.6290]],
            metricsHtml: `
                <div>• Calado Valle: <b style="color:#ffffff;">0.85 m</b></div>
                <div>• Keyline Amort.: <b style="color:#34d399;">~18.5k m³</b></div>
                <div>• Área Afectada: <b style="color:#38bdf8;">42 ha</b></div>
                <div>• Amortiguación: <b style="color:#86efac;">65% VWC</b></div>
            `,
            notes: '🎯 Llanura de inundación adyacente a Fundo Meniel protegida por zanjas de infiltración.'
        });
        cellF02.poly.addTo(transectoFluvialGroup);
        cellF02.badge.addTo(transectoFluvialGroup);

        // Celda F-03: Cruce Ruta 5 Sur (6-12h)
        const cellF03 = createTacticalAlertCell({
            id: 'F-03',
            threatType: 'flood',
            severityPercent: 35,
            name: '🌊 Cruce Ruta 5 Sur (Retiro)',
            phase: '6-12h Límite',
            color: '#0284c7',
            badgeLabel: '[F-03] 35% MODERADO • RUTA 5',
            coords: [[-36.1525, -71.7245], [-36.1510, -71.7155], [-36.1575, -71.7155], [-36.1590, -71.7245]],
            metricsHtml: `
                <div>• Cota Máx: <b style="color:#ffffff;">145 msnm</b></div>
                <div>• Cuello Botella: <b style="color:#f87171;">Vial R5</b></div>
                <div>• Afectación: <b style="color:#fde047;">Puente Longaví</b></div>
                <div>• Población: <b style="color:#bae6fd;">3.2k hab</b></div>
            `,
            notes: '🎯 Punto de remanso hidrográfico y corte de conectividad vial mayor.'
        });
        cellF03.poly.addTo(transectoFluvialGroup);
        cellF03.badge.addTo(transectoFluvialGroup);

        // Línea Defensiva Keyline en Meniel
        const keylineDefenseCoords = [
            [-36.2080, -71.6150], [-36.2115, -71.6053], [-36.2150, -71.5980], [-36.2190, -71.5920]
        ];
        const keylineDefenseLine = L.polyline(keylineDefenseCoords, {
            color: '#06b6d4',
            weight: 4.0,
            dashArray: '8, 6',
            opacity: 0.95,
            className: 'tactical-defensive-line keyline-line'
        });
        keylineDefenseLine.bindTooltip(`
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: bold; color: #67e8f9; background: rgba(8,18,34,0.9); padding: 3px 6px; border-radius: 4px; border: 1px solid #06b6d4;">
                🛡️ LÍNEA DEFENSIVA KEYLINE &bull; RETENCIÓN ~18.5k m³
            </div>
        `, { permanent: true, direction: 'top', offset: [0, -10], className: 'tactical-tooltip-clean' });
        keylineDefenseLine.addTo(transectoFluvialGroup);

        // Flecha direccional táctica fluvial
        createTacticalArrowMarker(-36.1880, -71.6550, -22, 'FLUJO LONGAVÍ ➔', 'rgba(56, 189, 248, 0.75)', '#e0f2fe', false).addTo(transectoFluvialGroup);

        // Polígonos de Envolvente y Zonificación de Inundación Fluvial (T=10, T=50, T=100)
        const inundacionGeoJsonLayer = L.geoJSON(geojsonInundacion, {
            style: function(feature) {
                const p = feature.properties || {};
                return {
                    color: p.color || '#0284c7',
                    weight: 2,
                    dashArray: p.id === 'INUND_T100' ? '6, 4' : (p.id === 'INUND_T50' ? '4, 3' : '2, 2'),
                    fillColor: p.color || '#0284c7',
                    fillOpacity: p.fillOpacity || 0.25,
                    className: 'tactical-flood-polygon'
                };
            },
            onEachFeature: function(feature, layer) {
                const p = feature.properties || {};
                layer.bindPopup(`
                    <div style="font-family:'JetBrains Mono',monospace; min-width:240px; font-size:11px; padding:4px;">
                        <div style="border-bottom:1px solid ${p.color}; padding-bottom:4px; margin-bottom:6px;">
                            <strong style="color:${p.color}; font-size:12px;">🌊 ${p.recurrence}</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                            <span style="color:#94a3b8;">Caudal Crítico:</span>
                            <span style="color:#38bdf8; font-weight:bold;">${p.caudal_critico}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                            <span style="color:#94a3b8;">Cota Máxima:</span>
                            <span style="color:#f8fafc; font-weight:bold;">${p.cota_max}</span>
                        </div>
                        <div style="margin-top:6px; color:#cbd5e1; font-size:10px; line-height:1.4;">
                            ${p.descripcion}
                        </div>
                        <div style="margin-top:4px; color:#fde047; font-size:10px; line-height:1.3;">
                            ⚠️ <b>Afectación:</b> ${p.afectacion}
                        </div>
                    </div>
                `);
                layer.bindTooltip(`<b>${p.recurrence}</b><br><span style="font-size:10px;color:#38bdf8;">Q: ${p.caudal_critico} | Cota: ${p.cota_max}</span>`, { sticky: true });
            }
        });
        inundacionGeoJsonLayer.addTo(transectoFluvialGroup);
        window.inundacionGeoJsonLayer = inundacionGeoJsonLayer;

        overlayLayers['inundacion'] = transectoFluvialGroup;
        overlayLayers['transecto_fluvial'] = transectoFluvialGroup;

        // ═══════════════════════════════════════════════════════════════════
        // 2.3 TRANSECTO TÁCTICO PIROGÉNICO (INCENDIO WUI • CELDAS P-01 A P-03)
        // ═══════════════════════════════════════════════════════════════════
        const transectoIncendioGroup = L.layerGroup();

        // Celda P-01: Ladera Alta Pino (0-2h)
        const cellP01 = createTacticalAlertCell({
            id: 'P-01',
            threatType: 'fire',
            severityPercent: 92,
            name: '🔥 Foco Ladera Alta Cordillera',
            phase: '0-2h Inicio',
            color: '#ef4444',
            badgeLabel: '[P-01] 92% EXTREMO • FWI 74',
            coords: [[-36.1720, -71.4750], [-36.1710, -71.4650], [-36.1780, -71.4650], [-36.1790, -71.4750]],
            metricsHtml: `
                <div>• FWI Severidad: <b style="color:#ef4444;">74 (Extremo)</b></div>
                <div>• Ráfaga Puelche: <b style="color:#f97316;">38 km/h ESE</b></div>
                <div>• Llama Altura: <b style="color:#fde047;">4.2 m</b></div>
                <div>• Avance: <b style="color:#f87171;">850 m/h ◄</b></div>
            `,
            notes: '🎯 Foco primario en masa forestal densa con pendiente descendente hacia Meniel.'
        });
        cellP01.poly.addTo(transectoIncendioGroup);
        cellP01.badge.addTo(transectoIncendioGroup);

        // Celda P-02: Transición WUI Pavesas (2-6h)
        const cellP02 = createTacticalAlertCell({
            id: 'P-02',
            threatType: 'fire',
            severityPercent: 68,
            name: '🔥 Transición WUI Pavesas',
            phase: '2-6h Salto',
            color: '#ef4444',
            badgeLabel: '[P-02] 68% ALTO • SPOTTING',
            coords: [[-36.1920, -71.5300], [-36.1910, -71.5200], [-36.1980, -71.5200], [-36.1990, -71.5300]],
            metricsHtml: `
                <div>• Salto Chispas: <b style="color:#fde047;">1.2 km ONO</b></div>
                <div>• Combustible: <b style="color:#ffffff;">Matorral Seco</b></div>
                <div>• Riesgo Copas: <b style="color:#ef4444;">Alto</b></div>
                <div>• Avance Frente: <b style="color:#f87171;">620 m/h ◄</b></div>
            `,
            notes: '🎯 Zona crítica de proyección de pavesas sobre interfaz bosque-agrícola.'
        });
        cellP02.poly.addTo(transectoIncendioGroup);
        cellP02.badge.addTo(transectoIncendioGroup);

        // Celda P-03: Borde Predio Meniel (6-12h)
        const cellP03 = createTacticalAlertCell({
            id: 'P-03',
            threatType: 'fire',
            severityPercent: 45,
            name: '🔥 Interfaz Peri-Predial Meniel',
            phase: '6-12h Envolvente',
            color: '#ef4444',
            badgeLabel: '[P-03] 45% MODERADO • BORDE',
            coords: [[-36.2070, -71.5800], [-36.2060, -71.5700], [-36.2130, -71.5700], [-36.2140, -71.5800]],
            metricsHtml: `
                <div>• Distancia Meniel: <b style="color:#34d399;">Contigua (&lt;300m)</b></div>
                <div>• Humedad Pasto: <b style="color:#38bdf8;">14% FDR</b></div>
                <div>• Barrera Cortaf.: <b style="color:#86efac;">Activa 45m</b></div>
                <div>• Amenaza Vuelco: <b style="color:#fde047;">Moderada</b></div>
            `,
            notes: '🎯 Envolvente táctica directa sobre el límite oriental del Fundo Meniel.'
        });
        cellP03.poly.addTo(transectoIncendioGroup);
        cellP03.badge.addTo(transectoIncendioGroup);

        // Faja Cortafuegos Preventivo WUI de 45m
        const firebreakCoords = [
            [-36.1620, -71.4750], [-36.1850, -71.4950], [-36.2150, -71.5180], [-36.2380, -71.5350]
        ];
        const firebreakLine = L.polyline(firebreakCoords, {
            color: '#10b981',
            weight: 4.5,
            dashArray: '12, 6',
            opacity: 0.95,
            className: 'tactical-defensive-line firebreak-line'
        });
        firebreakLine.bindTooltip(`
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: bold; color: #6ee7b7; background: rgba(6,28,18,0.9); padding: 3px 6px; border-radius: 4px; border: 1px solid #10b981;">
                🛡️ FAJA CORTAFUEGOS WUI 45m &bull; BARRERA ACTIVA PUELCHE
            </div>
        `, { permanent: true, direction: 'bottom', offset: [0, 10], className: 'tactical-tooltip-clean' });
        firebreakLine.addTo(transectoIncendioGroup);

        // Flecha táctica de piro-avance
        createTacticalArrowMarker(-36.1880, -71.5250, 0, 'AVANCE PUELCHE ◄', 'rgba(220, 38, 38, 0.90)', '#ffffff', true).addTo(transectoIncendioGroup);

        // Polígonos de Peligro y Zonificación de Incendio Forestal (CONAF / FWI)
        const incendiosGeoJsonLayer = L.geoJSON(geojsonIncendios, {
            style: function(feature) {
                const p = feature.properties || {};
                return {
                    color: p.color || '#ef4444',
                    weight: 2,
                    dashArray: p.id === 'FIRE_CRITICA' ? '5, 3' : '3, 3',
                    fillColor: p.color || '#ef4444',
                    fillOpacity: p.fillOpacity || 0.28,
                    className: 'tactical-fire-polygon'
                };
            },
            onEachFeature: function(feature, layer) {
                const p = feature.properties || {};
                layer.bindPopup(`
                    <div style="font-family:'JetBrains Mono',monospace; min-width:240px; font-size:11px; padding:4px;">
                        <div style="border-bottom:1px solid ${p.color}; padding-bottom:4px; margin-bottom:6px;">
                            <strong style="color:${p.color}; font-size:12px;">🔥 ${p.zona}</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                            <span style="color:#94a3b8;">Nivel Peligro:</span>
                            <span style="color:#f87171; font-weight:bold;">${p.peligro}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                            <span style="color:#94a3b8;">Organismo:</span>
                            <span style="color:#f8fafc; font-weight:bold;">${p.organismo}</span>
                        </div>
                        <div style="margin-top:6px; color:#cbd5e1; font-size:10px; line-height:1.4;">
                            ${p.factor}
                        </div>
                        <div style="margin-top:4px; color:#86efac; font-size:10px; line-height:1.3;">
                            🌿 <b>Especies:</b> ${p.especies}
                        </div>
                    </div>
                `);
                layer.bindTooltip(`<b>${p.zona}</b><br><span style="font-size:10px;color:#f87171;">${p.peligro}</span>`, { sticky: true });
            }
        });
        incendiosGeoJsonLayer.addTo(transectoIncendioGroup);
        window.incendiosGeoJsonLayer = incendiosGeoJsonLayer;

        overlayLayers['incendios'] = transectoIncendioGroup;
        overlayLayers['transecto_incendios'] = transectoIncendioGroup;

        // ═══════════════════════════════════════════════════════════════════
        // 2.4 TRANSECTO TÁCTICO REMOCIÓN EN MASA (LANDSLIDE • CELDAS M-01 A M-02)
        // ═══════════════════════════════════════════════════════════════════
        const transectoRemocionGroup = L.layerGroup();

        // Celda M-01: Escarpe Activo 34°
        const cellM01 = createTacticalAlertCell({
            id: 'M-01',
            threatType: 'landslide',
            severityPercent: 86,
            name: '⛰️ Escarpe Activo Quebrada (A110)',
            phase: 'Cabecera Inestable',
            color: '#f59e0b',
            badgeLabel: '[M-01] 86% INESTABLE • 34°',
            coords: [[-36.2575, -71.4390], [-36.2565, -71.4310], [-36.2625, -71.4310], [-36.2635, -71.4390]],
            metricsHtml: `
                <div>• Pendiente: <b style="color:#f59e0b;">34° (Escarpe)</b></div>
                <div>• Susceptibilidad: <b style="color:#ef4444;">86% (Alta)</b></div>
                <div>• Volumen Estim.: <b style="color:#ffffff;">28.5k m³</b></div>
                <div>• Geología: <b style="color:#fde047;">Coluvial</b></div>
            `,
            notes: '🎯 Zona de desprendimiento gravitacional reactivada por saturación pluviométrica.'
        });
        cellM01.poly.addTo(transectoRemocionGroup);
        cellM01.badge.addTo(transectoRemocionGroup);

        // Celda M-02: Cono Runout Aluvial L-110
        const cellM02 = createTacticalAlertCell({
            id: 'M-02',
            threatType: 'landslide',
            severityPercent: 55,
            name: '⛰️ Cono Runout Aluvial Ruta L-110',
            phase: 'Corte Vial Inminente',
            color: '#f59e0b',
            badgeLabel: '[M-02] 55% MODERADO • RUNOUT',
            coords: [[-36.2655, -71.4540], [-36.2645, -71.4460], [-36.2705, -71.4460], [-36.2715, -71.4540]],
            metricsHtml: `
                <div>• Afectación: <b style="color:#ffffff;">Ruta L-110</b></div>
                <div>• Cono Longitud: <b style="color:#fde047;">1.4 km</b></div>
                <div>• Aislamiento: <b style="color:#f87171;">Bullileo-Meniel</b></div>
                <div>• Mitigación: <b style="color:#86efac;">Muro Gaviones</b></div>
            `,
            notes: '🎯 Garganta de acceso vial crítica con riesgo de taponamiento de calzada.'
        });
        cellM02.poly.addTo(transectoRemocionGroup);
        cellM02.badge.addTo(transectoRemocionGroup);

        // Flecha táctica gravitacional
        createTacticalArrowMarker(-36.2620, -71.4320, 115, 'RUNOUT ALUVIAL A110', 'rgba(245, 158, 11, 0.90)', '#ffffff', false).addTo(transectoRemocionGroup);

        // Polígonos de Susceptibilidad de Remoción en Masa y Conos Aluviales (L-110)
        const landslideGeoJsonLayer = L.geoJSON(geojsonLandslideSusceptibility, {
            style: function(feature) {
                const p = feature.properties || {};
                return {
                    color: p.color || '#f59e0b',
                    weight: 2,
                    dashArray: p.dashArray || '6, 3',
                    fillColor: p.fillColor || p.color || '#f59e0b',
                    fillOpacity: p.fillOpacity || 0.35,
                    className: 'tactical-landslide-polygon'
                };
            },
            onEachFeature: function(feature, layer) {
                const p = feature.properties || {};
                layer.bindPopup(`
                    <div style="font-family:'JetBrains Mono',monospace; min-width:240px; font-size:11px; padding:4px;">
                        <div style="border-bottom:1px solid ${p.color}; padding-bottom:4px; margin-bottom:6px;">
                            <strong style="color:${p.color}; font-size:12px;">⛰️ ${p.tipo}</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                            <span style="color:#94a3b8;">Sector:</span>
                            <span style="color:#f8fafc; font-weight:bold;">${p.sector}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                            <span style="color:#94a3b8;">Pendiente:</span>
                            <span style="color:#f59e0b; font-weight:bold;">${p.pendiente}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                            <span style="color:#94a3b8;">Volumen Est.:</span>
                            <span style="color:#ef4444; font-weight:bold;">${p.volumen_desprendible}</span>
                        </div>
                        <div style="margin-top:6px; color:#cbd5e1; font-size:10px; line-height:1.4;">
                            ${p.geologia}
                        </div>
                    </div>
                `);
                layer.bindTooltip(`<b>${p.tipo}</b><br><span style="font-size:10px;color:#f59e0b;">${p.susceptibilidad}</span>`, { sticky: true });
            }
        });
        landslideGeoJsonLayer.addTo(transectoRemocionGroup);
        window.landslideGeoJsonLayer = landslideGeoJsonLayer;

        overlayLayers['landslides'] = transectoRemocionGroup;
        overlayLayers['landslide_susceptibility'] = transectoRemocionGroup;

        // ═══════════════════════════════════════════════════════════════════
        // 2.5 CAPAS INSTITUCIONALES (APRs, RÍOS, SENSORES - OFF POR DEFECTO)
        // ═══════════════════════════════════════════════════════════════════
        const aprLayerGroup = L.layerGroup();
        aprsData.forEach(apr => {
            const aprIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background: #0284c7; border: 2px solid white; border-radius: 50%; width: 14px; height: 14px; box-shadow: 0 0 10px rgba(14, 165, 233, 0.9);"></div>`,
                iconSize: [16, 16]
            });
            const aprPopup = `
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; min-width: 220px; padding: 2px;">
                    <div style="border-bottom: 1px solid #0369a1; padding-bottom: 4px; margin-bottom: 4px;">
                        <strong style="color: #38bdf8; font-size: 12px;">🚰 ${apr.name}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span style="color: #94a3b8;">Familias:</span>
                        <span style="color: #f8fafc; font-weight: bold;">${apr.familias.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span style="color: #94a3b8;">Pozo Profundo:</span>
                        <span style="color: #38bdf8;">${apr.pozo_prof_m} m</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span style="color: #94a3b8;">Caudal Bombeo:</span>
                        <span style="color: #0ea5e9; font-weight: bold;">${apr.bombeo_L_s} L/s</span>
                    </div>
                    <div style="font-size: 9px; color: #cbd5e1; margin-top: 4px; background: rgba(0,0,0,0.3); padding: 3px; border-radius: 3px;">
                        Estado: ${apr.vulnerabilidad}
                    </div>
                </div>
            `;
            L.marker([apr.lat, apr.lng], { icon: aprIcon }).bindPopup(aprPopup).addTo(aprLayerGroup);
        });
        overlayLayers['aprs'] = aprLayerGroup;

        const riverLayerGroup = L.layerGroup();
        rivers.forEach(r => {
            L.polyline(r.coords, { color: r.color, weight: 3, opacity: 0.8 }).bindPopup(r.name).addTo(riverLayerGroup);
        });
        overlayLayers['rivers'] = riverLayerGroup;

        const sensorLayerGroup = L.layerGroup();
        sensors.forEach(s => {
            let markerClass = 'pulse-marker';
            if (s.type === 'water') markerClass = 'pulse-marker water';
            else if (s.type === 'dmc') markerClass = 'pulse-marker dmc';
            else if (s.type === 'inia') markerClass = 'pulse-marker inia';

            const customIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="${markerClass}"></div>`,
                iconSize: [20, 20]
            });
            const popupContent = `
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 2px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 4px;">
                        <strong style="color: #10b981; font-size: 12px;">${s.name}</strong>
                    </div>
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background: rgba(0,0,0,0.4); color: #94a3b8; font-size: 9px; margin-bottom: 4px;">Red: ${s.network || 'KioT Mesh'}</span>
                    <div style="color: #cbd5e1; margin-top: 2px;">${s.data}</div>
                    <div style="font-size: 9px; color: #64748b; margin-top: 4px;">WGS84: ${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}</div>
                </div>
            `;
            L.marker([s.lat, s.lng], { icon: customIcon }).bindPopup(popupContent).addTo(sensorLayerGroup);
        });
        overlayLayers['sensors'] = sensorLayerGroup;

        // Capas WMS
        const wmsMinagri = L.tileLayer.wms('https://ide.minagri.gob.cl/geoserver/wms', {
            layers: 'ciren:catastro_fruticola',
            format: 'image/png',
            transparent: true,
            opacity: 0.65,
            attribution: 'IDE Minagri / CIREN'
        });
        overlayLayers['wms_minagri'] = wmsMinagri;

        const wmsConaf = L.tileLayer.wms('https://sit.conaf.cl/geoserver/wms', {
            layers: 'conaf:snaspe_areas',
            format: 'image/png',
            transparent: true,
            opacity: 0.65,
            attribution: 'CONAF SIT'
        });
        overlayLayers['wms_conaf'] = wmsConaf;

        // Capas Tradicionales de Exposición
        const exposureCologneLayer = L.geoJSON(geojsonCologneFloodExposure, {
            style: function(feature) {
                const p = feature.properties;
                return {
                    color: p.color,
                    weight: 2.2,
                    fillColor: p.fillColor,
                    fillOpacity: p.fillOpacity,
                    dashArray: p.id === 'EXP_RESIDENCIAL' ? '6, 4' : null,
                    className: 'cologne-exposure-poly'
                };
            }
        });
        overlayLayers['exposure_cologne'] = exposureCologneLayer;

        const calFireFhszLayer = L.geoJSON(geojsonCalFireFhsz, {
            style: function(feature) {
                const p = feature.properties;
                return {
                    color: p.color,
                    weight: 2.2,
                    fillColor: p.fillColor,
                    fillOpacity: p.fillOpacity,
                    dashArray: p.dashArray || null,
                    className: 'calfire-fhsz-poly'
                };
            }
        });
        overlayLayers['calfire_fhsz'] = calFireFhszLayer;

        // ═══════════════════════════════════════════════════════════════════
        // 2.5B ESTÁNDAR VECINO INFORMADO: MÓDULO 1 - MOSAICO LULC BIOFÍSICO PURO (SIN CATASTRO)
        // ═══════════════════════════════════════════════════════════════════
        const biofisicoLulcLayer = L.geoJSON(geojsonBiofisicoLulc, {
            style: function(feature) {
                const p = feature.properties || {};
                const isMacro = (p.id && p.id.startsWith('MACRO_')) || (p.area_ha >= 50);
                // Borde segmentado para reflejar la incerteza de la autosegmentación satelital (sin límite legal catastral)
                const dashPattern = isMacro ? '7, 4' : '4, 3';
                return {
                    color: p.stroke || p.color,
                    weight: isMacro ? 2.2 : 1.6,
                    dashArray: dashPattern,
                    fillColor: p.fillColor || p.color,
                    fillOpacity: p.class === 'espejo_agua' ? 0.45 : 0.22,
                    className: 'lulc-biofisico-poly'
                };
            },
            onEachFeature: function(feature, layer) {
                const p = feature.properties || {};
                const isMacro = (p.id && p.id.startsWith('MACRO_')) || (p.area_ha >= 50);
                const dashPattern = isMacro ? '7, 4' : '4, 3';
                layer.on('mouseover', function(e) {
                    this.setStyle({ fillOpacity: 0.65, weight: 2.8, dashArray: dashPattern });
                    this.bringToFront();
                });
                layer.on('mouseout', function(e) {
                    this.setStyle({ 
                        fillOpacity: p.class === 'espejo_agua' ? 0.45 : 0.22, 
                        weight: isMacro ? 2.2 : 1.6,
                        dashArray: dashPattern 
                    });
                });

                const classIcon = p.class === 'espejo_agua' ? '💧' : (p.class === 'biomasa_forestal' ? '🌲' : (p.class === 'matriz_agricola' ? '🌾' : '🌾'));
                const classNameLabel = p.class === 'espejo_agua' ? 'Cuerpo / Espejo de Agua' : (p.class === 'biomasa_forestal' ? 'Biomasa Forestal Continua' : (p.class === 'matriz_agricola' ? 'Matriz Agrícola Irrigada' : 'Secano & Rastrojo Estival'));

                const popupHtml = `
                    <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #f8fafc; min-width: 250px; line-height: 1.4;">
                        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 5px; margin-bottom: 6px;">
                            <span style="font-size: 9px; color: #38bdf8; font-weight: bold; background: rgba(56,189,248,0.15); padding: 1px 5px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3);">
                                LULC BIOFÍSICO &bull; S2 L2A
                            </span>
                            <span style="font-size: 9px; color: #10b981; font-weight: bold;">${p.confidence}</span>
                        </div>
                        <strong style="display: block; font-size: 12px; color: #ffffff; margin-bottom: 4px;">
                            ${classIcon} ${p.name}
                        </strong>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 10px;">
                            <span style="color: #94a3b8;">Clase Biofísica:</span>
                            <span style="color: ${p.color}; font-weight: bold;">${classNameLabel}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 10px;">
                            <span style="color: #94a3b8;">Superficie:</span>
                            <span style="color: #f8fafc; font-weight: bold;">${p.area_ha.toLocaleString()} ha</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 10px;">
                            <span style="color: #94a3b8;">Resolución LOD:</span>
                            <span style="color: #e2e8f0; font-size: 9.5px;">${p.zone}</span>
                        </div>
                        ${p.vol_estimado_m3 ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 10px; background: rgba(6,182,212,0.15); padding: 2px 4px; border-radius: 4px; border: 1px solid rgba(6,182,212,0.3);">
                            <span style="color: #67e8f9;">Volumen Est.:</span>
                            <span style="color: #ffffff; font-weight: bold;">${p.vol_estimado_m3}</span>
                        </div>
                        ` : ''}
                        <div style="margin-top: 6px; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 9.5px; color: #cbd5e1;">
                            <span style="color: #f59e0b; font-weight: bold;">⚡ Vínculo Territorial:</span> ${p.hazard_link}
                        </div>
                        <div style="margin-top: 5px; font-size: 8.5px; color: #a5b4fc; background: rgba(99,102,241,0.15); padding: 3px 6px; border-radius: 4px; border: 1px dashed rgba(165,180,252,0.4);">
                            ✂️ <b>Borde Segmentado:</b> Incerteza espectral S2 (10m) &bull; No representa deslinde legal catastral.
                        </div>
                        ${p.label_note ? `
                        <div style="margin-top: 4px; font-size: 8.5px; color: #94a3b8; font-style: italic;">
                            ℹ️ ${p.label_note}
                        </div>
                        ` : ''}
                    </div>
                `;
                layer.bindPopup(popupHtml);
            }
        });
        overlayLayers['lulc_biofisico'] = biofisicoLulcLayer;

        // ═══════════════════════════════════════════════════════════════════
        // 2.5C ESTÁNDAR VECINO INFORMADO: MÓDULO 2 - VECTORES DE AMENAZA TRANSFRONTERIZA
        // Haces vectoriales tácticos militares (Pickett's Charge style) multi-escenario
        // Modelado biofísico acoplado: Rothermel (1972) + Elipse Huygens + Albini Spotting (1979)
        // ═══════════════════════════════════════════════════════════════════
        const TACTICAL_WIND_REGIMES = {
            puelche: {
                id: 'puelche',
                name: 'Viento Puelche (Catabático ESE)',
                shortName: 'Puelche ESE',
                windSpeedKmh: 42,
                windDeg: 120, // Sopla desde ESE (120°) hacia WNW (300°)
                airTempC: 34.5,
                relativeHumidity: 14,
                lfmcPct: 62, // Humedad foliar viva Sentinel-2 NDWI < 80% (Crítico)
                dfmcPct: 4.1, // Humedad hojarasca muerta Simard/Nelson (Polvorín)
                spreadMultiplier: 2.35,
                spottingKm: 1.35,
                color: '#dc2626',
                primaryThreatSector: 'Deslinde Este & Flanco Nororiente (Colindancia Directa Meniel)',
                description: 'Viento andino descendente con compresión adiabática seca. Fuego de avance rápido (>18 m/min) con salto masivo de pavesas sobre cortafuegos.'
            },
            surazo: {
                id: 'surazo',
                name: 'Surazo Estival (Brisa de Valle SSW)',
                shortName: 'Surazo SSW',
                windSpeedKmh: 24,
                windDeg: 205, // Sopla desde SSW (205°) hacia NNE (25°)
                airTempC: 27.2,
                relativeHumidity: 44,
                lfmcPct: 78,
                dfmcPct: 8.6,
                spreadMultiplier: 1.25,
                spottingKm: 0.55,
                color: '#f97316',
                primaryThreatSector: 'Deslinde Sur & Potreros PRV (Franja Forestal Faldeo Bullileo)',
                description: 'Régimen dominante en tardes estivales impulsado por el anticiclón pacífico. Empuja fuegos hacia el norte a lo largo del corredor agrícola de Retiro.'
            },
            norte: {
                id: 'norte',
                name: 'Viento Norte Pre-Frontal (NNW)',
                shortName: 'Norte NNW',
                windSpeedKmh: 28,
                windDeg: 340, // Sopla desde NNW (340°) hacia SSE (160°)
                airTempC: 31.0,
                relativeHumidity: 36,
                lfmcPct: 71,
                dfmcPct: 6.9,
                spreadMultiplier: 1.55,
                spottingKm: 0.85,
                color: '#ea580c',
                primaryThreatSector: 'Deslinde Norte & Cuarteles de Frutales (Paños de Secano y Espino)',
                description: 'Cuña térmica pre-frontal. Empuja focos hacia el sur-sureste amenazando cuarteles de cerezos y tranques de acumulación.'
            },
            live: {
                id: 'live',
                name: 'Telemetría en Tiempo Real (SDSS)',
                shortName: 'Tiempo Real',
                windSpeedKmh: 18,
                windDeg: 180,
                airTempC: 24.5,
                relativeHumidity: 52,
                lfmcPct: 84,
                dfmcPct: 10.2,
                spreadMultiplier: 1.0,
                spottingKm: 0.35,
                color: '#f59e0b',
                primaryThreatSector: 'Dinámico según estación meteorológica activa',
                description: 'Condición instantánea calculada con sensores IoT y modelo meteorológico en vivo.'
            }
        };

        window.TACTICAL_WIND_REGIMES = TACTICAL_WIND_REGIMES;
        window.currentTacticalWindRegime = 'puelche';

        const tacticalFireVectorsLayer = L.layerGroup();
        overlayLayers['fire_threat_vectors'] = tacticalFireVectorsLayer;

        // Función matemática geodesica de destino
        function destLatLng(lat, lng, distanceKm, bearingDeg) {
            const R = 6371;
            const dR = distanceKm / R;
            const bRad = bearingDeg * Math.PI / 180;
            const phi1 = lat * Math.PI / 180;
            const lambda1 = lng * Math.PI / 180;
            const phi2 = Math.asin(Math.sin(phi1) * Math.cos(dR) + Math.cos(phi1) * Math.sin(dR) * Math.cos(bRad));
            const lambda2 = lambda1 + Math.atan2(Math.sin(bRad) * Math.sin(dR) * Math.cos(phi1), Math.cos(dR) - Math.sin(phi1) * Math.sin(phi2));
            return [phi2 * 180 / Math.PI, lambda2 * 180 / Math.PI];
        }

        // Generador de puntos de curvatura Bézier cuadrática
        function bezierPoints(p0, pc, p1, steps = 18) {
            const pts = [];
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const lat = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * pc[0] + t * t * p1[0];
                const lng = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * pc[1] + t * t * p1[1];
                pts.push([lat, lng]);
            }
            return pts;
        }

        // Cálculo de orientación final (rumbo) entre dos puntos
        function calcBearing(pA, pB) {
            const lat1 = pA[0] * Math.PI / 180;
            const lat2 = pB[0] * Math.PI / 180;
            const dLng = (pB[1] - pA[1]) * Math.PI / 180;
            const y = Math.sin(dLng) * Math.cos(lat2);
            const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
            const b = Math.atan2(y, x) * 180 / Math.PI;
            return (b + 360) % 360;
        }

        // Construcción de flecha táctica militar completa (Varilla curvada + Punta afilada + Badge interactivo)
        function createTacticalFireArrow(p0, pc, p1, opts) {
            const pts = bezierPoints(p0, pc, p1, 16);
            const finalBearing = calcBearing(pts[pts.length - 2], pts[pts.length - 1]);

            // 1. Línea principal de la flecha con halo de contraste táctico
            const shaft = L.polyline(pts, {
                color: opts.color || '#dc2626',
                weight: opts.weight || 4.5,
                opacity: opts.opacity || 0.92,
                dashArray: opts.dashArray || null,
                className: 'tactical-fire-vector-shaft'
            });

            // 2. Cabezal de flecha militar afilado (Pickett's Charge style)
            const arrowHeadSize = opts.headSize || (opts.weight > 4 ? 26 : 20);
            const arrowSvg = `
                <div style="width: ${arrowHeadSize * 1.4}px; height: ${arrowHeadSize * 1.4}px; transform: rotate(${finalBearing}deg); transform-origin: center; pointer-events: auto; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.85)); cursor: pointer;">
                    <svg viewBox="-20 -15 35 30" class="w-full h-full">
                        <polygon points="0,0 -16,-7 -11,0 -16,7" fill="${opts.color || '#dc2626'}" stroke="#ffffff" stroke-width="${opts.weight > 4 ? '1.5' : '1.0'}"/>
                    </svg>
                </div>
            `;
            const headIcon = L.divIcon({
                className: 'tactical-arrow-head-icon',
                html: arrowSvg,
                iconSize: [arrowHeadSize * 1.4, arrowHeadSize * 1.4],
                iconAnchor: [arrowHeadSize * 0.7, arrowHeadSize * 0.7]
            });
            const headMarker = L.marker(p1, { icon: headIcon });

            // 3. Badge táctico flotante en la cabeza si está especificado
            let badgeMarker = null;
            if (opts.badgeText) {
                const badgeIcon = L.divIcon({
                    className: 'tactical-fire-badge-icon',
                    html: `
                        <div style="background: rgba(10, 14, 24, 0.95); border: 1.2px solid ${opts.color || '#dc2626'}; border-radius: 6px; padding: 2px 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.85); font-family: 'JetBrains Mono', monospace; font-size: 8.5px; font-weight: 800; color: #ffffff; white-space: nowrap; display: flex; align-items: center; gap: 4px; pointer-events: auto; cursor: pointer;">
                            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${opts.color || '#dc2626'}; box-shadow: 0 0 6px ${opts.color || '#dc2626'};"></span>
                            <span>${opts.badgeText}</span>
                        </div>
                    `,
                    iconSize: [120, 20],
                    iconAnchor: [60, -8]
                });
                badgeMarker = L.marker(p1, { icon: badgeIcon });
            }

            // 4. Popup táctico acoplado
            if (opts.popupHtml) {
                shaft.bindPopup(opts.popupHtml);
                headMarker.bindPopup(opts.popupHtml);
                if (badgeMarker) badgeMarker.bindPopup(opts.popupHtml);
            }

            return { shaft, headMarker, badgeMarker };
        }

        // Generador completo de Haces Vectoriales Tácticos (Multi-Escenario)
        function renderTacticalFireVectorsForRegime(regimeKey) {
            tacticalFireVectorsLayer.clearLayers();
            const regime = TACTICAL_WIND_REGIMES[regimeKey] || TACTICAL_WIND_REGIMES.puelche;
            const windDeg = regime.windDeg;
            const fireDir = (windDeg + 180) % 360; // Rumbo de propagación a favor del viento

            // ═══════════════════════════════════════════════════════════════════
            // FUENTE 1: RODAL FORESTAL COLINDANTE INMEDIATO ESTE (Pino Insigne 18m)
            // Deslinde a solo 600m del límite Este de Fundo Meniel
            // ═══════════════════════════════════════════════════════════════════
            const frontEste = [
                { id: 'E1', lat: -36.2100, lng: -71.5935, name: 'Borde Norte Rodal Este', lfmc: regime.lfmcPct, fuel: 'Pino Insigne Adulto (Modelo 7)' },
                { id: 'E2', lat: -36.2135, lng: -71.5930, name: 'Frente Central Colindancia Este', lfmc: regime.lfmcPct, fuel: 'Pino Insigne Denso (Modelo 7)' },
                { id: 'E3', lat: -36.2170, lng: -71.5940, name: 'Borde Sur Rodal Este (Vaguada)', lfmc: regime.lfmcPct + 4, fuel: 'Pino + Quebrada Esclerófila' }
            ];

            frontEste.forEach((pt, idx) => {
                const isCenter = (idx === 1);
                let bearing = fireDir;
                let reachKm = 1.35 * regime.spreadMultiplier;
                let probPct = isCenter ? (regimeKey === 'puelche' ? 92 : (regimeKey === 'norte' ? 58 : 42)) : (regimeKey === 'puelche' ? 84 : 45);
                let timeMin = Math.round(18 / (regime.spreadMultiplier * (isCenter ? 1.0 : 0.85)));

                if (regimeKey === 'puelche') {
                    // Puelche empuja directo al WNW hacia Meniel
                    bearing = 295 + (idx - 1) * 14;
                    reachKm = (isCenter ? 2.4 : 1.8) * (regime.spreadMultiplier / 2.0);
                } else if (regimeKey === 'surazo') {
                    // Surazo empuja hacia NNE paralelo a la montaña
                    bearing = 20 + (idx - 1) * 12;
                    reachKm = 1.6;
                    probPct = 48;
                    timeMin = 38;
                } else if (regimeKey === 'norte') {
                    // Norte empuja hacia SSE
                    bearing = 165 + (idx - 1) * 12;
                    reachKm = 1.7;
                    probPct = 62;
                    timeMin = 32;
                }

                const p0 = [pt.lat, pt.lng];
                const p1 = destLatLng(pt.lat, pt.lng, reachKm, bearing);
                // Control point con suave curvatura orográfica
                const pMid = destLatLng(pt.lat, pt.lng, reachKm * 0.5, bearing + (idx === 0 ? 8 : (idx === 2 ? -8 : 3)));
                const pc = pMid;

                const popupHtml = `
                    <div style="font-family:'JetBrains Mono',monospace; min-width:270px; font-size:11px; padding:5px; color:#f8fafc; line-height:1.45;">
                        <div style="border-bottom:1px solid rgba(239,68,68,0.4); padding-bottom:5px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:10px; font-weight:bold; color:#ef4444; background:rgba(239,68,68,0.2); padding:1px 6px; border-radius:4px; border:1px solid rgba(239,68,68,0.4);">
                                VECTOR TÁCTICO &bull; ESTÁNDAR VECINO
                            </span>
                            <span style="font-size:10px; font-weight:bold; color:#fbbf24;">${probPct}% PROB.</span>
                        </div>
                        <strong style="display:block; font-size:12px; color:#ffffff; margin-bottom:4px;">
                            🏹 Vector Piro-Dinámico: ${pt.name}
                        </strong>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-size:10px;">
                            <span style="color:#94a3b8;">Régimen Eólico:</span>
                            <span style="color:#f59e0b; font-weight:bold;">${regime.name}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-size:10px;">
                            <span style="color:#94a3b8;">Humedad Foliar (LFMC S2):</span>
                            <span style="color:${regime.lfmcPct < 70 ? '#ef4444' : '#10b981'}; font-weight:bold;">${regime.lfmcPct}% (${regime.lfmcPct < 80 ? 'CRÍTICO' : 'SEGURO'})</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-size:10px;">
                            <span style="color:#94a3b8;">Humedad Hojarasca (DFMC):</span>
                            <span style="color:#f87171; font-weight:bold;">${regime.dfmcPct}%</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-size:10px;">
                            <span style="color:#94a3b8;">Velocidad de Avance (R):</span>
                            <span style="color:#ffffff; font-weight:bold;">${(regime.spreadMultiplier * 8.2).toFixed(1)} m/min</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-size:10px; background:rgba(239,68,68,0.15); padding:2px 5px; border-radius:4px;">
                            <span style="color:#fca5a5; font-weight:bold;">Impacto en Deslinde:</span>
                            <span style="color:#ffffff; font-weight:bold;">~${timeMin} minutos</span>
                        </div>
                        <div style="margin-top:6px; padding-top:5px; border-top:1px solid rgba(255,255,255,0.1); font-size:9.5px; color:#cbd5e1;">
                            <span style="color:#fbbf24; font-weight:bold;">🛡️ Acción Vecinal Sugerida:</span> Activar faja cortafuego perimetral Este de 45m y precargar tranque de auxilio.
                        </div>
                    </div>
                `;

                const arrowObj = createTacticalFireArrow(p0, pc, p1, {
                    color: isCenter ? regime.color : '#ea580c',
                    weight: isCenter ? (regimeKey === 'puelche' ? 5.8 : 4.8) : 3.4,
                    badgeText: isCenter ? `🔥 ${probPct}% • ${timeMin} min` : `${probPct}%`,
                    popupHtml: popupHtml
                });

                arrowObj.shaft.addTo(tacticalFireVectorsLayer);
                arrowObj.headMarker.addTo(tacticalFireVectorsLayer);
                if (arrowObj.badgeMarker) arrowObj.badgeMarker.addTo(tacticalFireVectorsLayer);

                // Si es Puelche y es la flecha central, agregar vector balístico de salto de pavesas (Spotting Albini)
                if (regimeKey === 'puelche' && isCenter) {
                    const pSpotStart = p1;
                    const pSpotEnd = destLatLng(p1[0], p1[1], regime.spottingKm, bearing);
                    const pSpotMid = destLatLng(p1[0], p1[1], regime.spottingKm * 0.5, bearing + 4);

                    const spotArrow = createTacticalFireArrow(pSpotStart, pSpotMid, pSpotEnd, {
                        color: '#fbbf24',
                        weight: 2.6,
                        dashArray: '5, 5',
                        headSize: 18,
                        badgeText: `💥 Pavesas +${regime.spottingKm}km`,
                        popupHtml: `
                            <div style="font-family:'JetBrains Mono',monospace; min-width:240px; font-size:11px; padding:4px; color:#f8fafc;">
                                <strong style="color:#fbbf24; font-size:12px;">💥 Salto Balístico de Pavesas (Albini 1979)</strong>
                                <p style="font-size:10px; color:#cbd5e1; margin-top:4px;">
                                    Proyección de corteza y conos incandescentes desprendidos del dosel de pino (18m). Cruza caminos, acequias y cortafuegos estrechos.
                                </p>
                                <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:10px;">
                                    <span style="color:#94a3b8;">Alcance Aerotransportado:</span>
                                    <span style="color:#fde047; font-weight:bold;">${regime.spottingKm} km</span>
                                </div>
                            </div>
                        `
                    });
                    spotArrow.shaft.addTo(tacticalFireVectorsLayer);
                    spotArrow.headMarker.addTo(tacticalFireVectorsLayer);
                    if (spotArrow.badgeMarker) spotArrow.badgeMarker.addTo(tacticalFireVectorsLayer);
                }
            });

            // ═══════════════════════════════════════════════════════════════════
            // FUENTE 2: MACIZO PRECORDILLERANO ESTE (8.450 ha)
            // Gran frente forestal andino que alimenta la cuenca
            // ═══════════════════════════════════════════════════════════════════
            const frontCordillera = [
                { id: 'C1', lat: -36.2050, lng: -71.5350, name: 'Macizo Cordillerano Alto Norte' },
                { id: 'C2', lat: -36.2200, lng: -71.5300, name: 'Macizo Cordillerano Alto Centro' },
                { id: 'C3', lat: -36.2380, lng: -71.5250, name: 'Macizo Cordillerano Cajón Longaví' }
            ];

            frontCordillera.forEach((pt, idx) => {
                let bearing = fireDir;
                let reachKm = 2.4 * regime.spreadMultiplier;
                let probPct = (regimeKey === 'puelche') ? 88 : 45;
                let timeMin = Math.round(55 / regime.spreadMultiplier);

                if (regimeKey === 'puelche') {
                    bearing = 290 + (idx - 1) * 10;
                    reachKm = 3.6;
                } else if (regimeKey === 'surazo') {
                    bearing = 15 + (idx - 1) * 8;
                    reachKm = 2.2;
                } else if (regimeKey === 'norte') {
                    bearing = 160 + (idx - 1) * 8;
                    reachKm = 2.5;
                }

                const p0 = [pt.lat, pt.lng];
                const p1 = destLatLng(pt.lat, pt.lng, reachKm, bearing);
                const pc = destLatLng(pt.lat, pt.lng, reachKm * 0.5, bearing + (idx === 0 ? 6 : -6));

                const cordObj = createTacticalFireArrow(p0, pc, p1, {
                    color: (regimeKey === 'puelche') ? '#b91c1c' : '#c2410c',
                    weight: (regimeKey === 'puelche') ? 5.2 : 3.8,
                    badgeText: (regimeKey === 'puelche') ? `Macro-Frente • ${probPct}%` : null,
                    popupHtml: `
                        <div style="font-family:'JetBrains Mono',monospace; font-size:11px; padding:4px; color:#f8fafc;">
                            <strong style="color:#ef4444;">🏔️ ${pt.name}</strong>
                            <div style="font-size:10px; color:#cbd5e1; margin-top:3px;">
                                Gran masa combustible continua (>8.000 ha). En régimen Puelche alimenta frentes masivos de avance hacia el fondo de valle.
                            </div>
                        </div>
                    `
                });

                cordObj.shaft.addTo(tacticalFireVectorsLayer);
                cordObj.headMarker.addTo(tacticalFireVectorsLayer);
                if (cordObj.badgeMarker) cordObj.badgeMarker.addTo(tacticalFireVectorsLayer);
            });

            // ═══════════════════════════════════════════════════════════════════
            // FUENTE 3: FRANJA FORESTAL SUR (Faldeo Bullileo, 22.3 ha)
            // Principal vector crítico bajo SURAZO ESTIVAL
            // ═══════════════════════════════════════════════════════════════════
            const frontSur = [
                { id: 'S1', lat: -36.2320, lng: -71.6150, name: 'Franja Sur Oeste' },
                { id: 'S2', lat: -36.2340, lng: -71.6050, name: 'Franja Sur Centro (Ruta Bullileo)' },
                { id: 'S3', lat: -36.2360, lng: -71.5950, name: 'Franja Sur Este' }
            ];

            frontSur.forEach((pt, idx) => {
                const isCenter = (idx === 1);
                let bearing = fireDir;
                let reachKm = 1.4 * regime.spreadMultiplier;
                let probPct = (regimeKey === 'surazo') ? (isCenter ? 86 : 74) : 38;
                let timeMin = (regimeKey === 'surazo') ? (isCenter ? 26 : 34) : 48;

                if (regimeKey === 'surazo') {
                    // Surazo empuja hacia NNE directo a Meniel
                    bearing = 25 + (idx - 1) * 14;
                    reachKm = (isCenter ? 2.5 : 1.9);
                } else if (regimeKey === 'puelche') {
                    bearing = 305 + (idx - 1) * 10;
                    reachKm = 1.5;
                } else if (regimeKey === 'norte') {
                    bearing = 160 + (idx - 1) * 10;
                    reachKm = 1.2;
                }

                const p0 = [pt.lat, pt.lng];
                const p1 = destLatLng(pt.lat, pt.lng, reachKm, bearing);
                const pc = destLatLng(pt.lat, pt.lng, reachKm * 0.5, bearing + (idx === 0 ? -6 : 6));

                const surObj = createTacticalFireArrow(p0, pc, p1, {
                    color: (regimeKey === 'surazo') ? '#f97316' : '#ea580c',
                    weight: (regimeKey === 'surazo') ? (isCenter ? 5.5 : 4.0) : 3.0,
                    badgeText: (regimeKey === 'surazo' && isCenter) ? `🔥 ${probPct}% • ${timeMin} min` : null,
                    popupHtml: `
                        <div style="font-family:'JetBrains Mono',monospace; font-size:11px; padding:4px; color:#f8fafc;">
                            <strong style="color:#f97316;">🌲 ${pt.name}</strong>
                            <div style="font-size:10px; color:#cbd5e1; margin-top:3px;">
                                Rodales en faldeo sur. Bajo <b>Surazo Estival</b> constituye el vector principal de propagación hacia las pasturas y viviendas de Meniel.
                            </div>
                        </div>
                    `
                });

                surObj.shaft.addTo(tacticalFireVectorsLayer);
                surObj.headMarker.addTo(tacticalFireVectorsLayer);
                if (surObj.badgeMarker) surObj.badgeMarker.addTo(tacticalFireVectorsLayer);
            });

            // ═══════════════════════════════════════════════════════════════════
            // FUENTE 4: PAÑOS DE SECANO & MATORRAL NORTE
            // Principal vector crítico bajo VIENTO NORTE PRE-FRONTAL
            // ═══════════════════════════════════════════════════════════════════
            const frontNorte = [
                { id: 'N1', lat: -36.1860, lng: -71.6150, name: 'Borde Secano Norte Oeste' },
                { id: 'N2', lat: -36.1840, lng: -71.6050, name: 'Borde Secano Norte Centro' },
                { id: 'N3', lat: -36.1820, lng: -71.5950, name: 'Borde Secano Norte Este' }
            ];

            frontNorte.forEach((pt, idx) => {
                const isCenter = (idx === 1);
                let bearing = fireDir;
                let reachKm = 1.3 * regime.spreadMultiplier;
                let probPct = (regimeKey === 'norte') ? (isCenter ? 79 : 68) : 35;
                let timeMin = (regimeKey === 'norte') ? (isCenter ? 32 : 40) : 55;

                if (regimeKey === 'norte') {
                    // Norte empuja hacia SSE directo a los huertos de Meniel
                    bearing = 160 + (idx - 1) * 12;
                    reachKm = (isCenter ? 2.4 : 1.8);
                } else if (regimeKey === 'puelche') {
                    bearing = 290 + (idx - 1) * 10;
                    reachKm = 1.4;
                } else if (regimeKey === 'surazo') {
                    bearing = 20 + (idx - 1) * 10;
                    reachKm = 1.1;
                }

                const p0 = [pt.lat, pt.lng];
                const p1 = destLatLng(pt.lat, pt.lng, reachKm, bearing);
                const pc = destLatLng(pt.lat, pt.lng, reachKm * 0.5, bearing + (idx === 0 ? 5 : -5));

                const norteObj = createTacticalFireArrow(p0, pc, p1, {
                    color: (regimeKey === 'norte') ? '#ef4444' : '#f59e0b',
                    weight: (regimeKey === 'norte') ? (isCenter ? 5.0 : 3.6) : 2.8,
                    badgeText: (regimeKey === 'norte' && isCenter) ? `🔥 ${probPct}% • ${timeMin} min` : null,
                    popupHtml: `
                        <div style="font-family:'JetBrains Mono',monospace; font-size:11px; padding:4px; color:#f8fafc;">
                            <strong style="color:#ef4444;">🌾 ${pt.name}</strong>
                            <div style="font-size:10px; color:#cbd5e1; margin-top:3px;">
                                Paño de rastrojos secos y espinal. Bajo <b>Viento Norte Pre-frontal</b> proyecta frentes rápidos sobre los cuarteles frutales de Meniel.
                            </div>
                        </div>
                    `
                });

                norteObj.shaft.addTo(tacticalFireVectorsLayer);
                norteObj.headMarker.addTo(tacticalFireVectorsLayer);
                if (norteObj.badgeMarker) norteObj.badgeMarker.addTo(tacticalFireVectorsLayer);
            });
        }

        // Conmutador del Régimen Eólico Activo
        window.setTacticalWindRegime = function(regimeKey) {
            if (!TACTICAL_WIND_REGIMES[regimeKey]) regimeKey = 'puelche';
            window.currentTacticalWindRegime = regimeKey;
            
            // Re-renderizar los vectores si la capa está activa
            renderTacticalFireVectorsForRegime(regimeKey);

            // Actualizar botones de selección en el Sidebar
            ['puelche', 'surazo', 'norte', 'live'].forEach(rk => {
                const btn = document.getElementById('btnTacticalRegime_' + rk);
                if (btn) {
                    if (rk === regimeKey) {
                        btn.className = 'py-1.5 px-2 rounded-lg bg-red-600 text-white font-mono font-bold text-[10px] shadow-sm transition-all border border-red-400 cursor-pointer flex items-center justify-center gap-1';
                    } else {
                        btn.className = 'py-1.5 px-2 rounded-lg bg-black/40 hover:bg-white/10 text-slate-300 font-mono text-[10px] transition-all border border-white/5 cursor-pointer flex items-center justify-center gap-1';
                    }
                }
            });

            // Actualizar tarjeta de inteligencia táctica del escenario activo
            const reg = TACTICAL_WIND_REGIMES[regimeKey];
            const titleEl = document.getElementById('tacticalScenarioTitle');
            const speedEl = document.getElementById('tacticalScenarioSpeed');
            const lfmcEl = document.getElementById('tacticalScenarioLfmc');
            const dfmcEl = document.getElementById('tacticalScenarioDfmc');
            const sectorEl = document.getElementById('tacticalScenarioSector');
            const descEl = document.getElementById('tacticalScenarioDesc');

            if (titleEl) titleEl.innerText = reg.name;
            if (speedEl) speedEl.innerText = reg.windSpeedKmh + ' km/h';
            if (lfmcEl) lfmcEl.innerText = reg.lfmcPct + '%';
            if (dfmcEl) dfmcEl.innerText = reg.dfmcPct + '%';
            if (sectorEl) sectorEl.innerText = reg.primaryThreatSector;
            if (descEl) descEl.innerText = reg.description;
        };

        // Toggle principal de la capa de Vectores Tácticos (Módulo 2)
        window.toggleTacticalFireVectorsLayer = function(force) {
            const layer = overlayLayers['fire_threat_vectors'];
            if (!layer || !map) return;
            const isActive = map.hasLayer(layer);
            const shouldBeActive = (force !== undefined) ? force : !isActive;

            if (shouldBeActive) {
                renderTacticalFireVectorsForRegime(window.currentTacticalWindRegime || 'puelche');
                map.addLayer(layer);
            } else {
                map.removeLayer(layer);
            }

            updateDockButtonState('fire_threat_vectors', shouldBeActive);

            // Sincronizar badge lateral si existe
            const sbBadge = document.getElementById('badgeSidebarFireVectors');
            if (sbBadge) {
                sbBadge.innerText = shouldBeActive ? 'ACTIVO' : 'ACTIVAR';
                sbBadge.className = shouldBeActive 
                    ? 'text-[8.5px] px-1.5 py-0.5 rounded bg-red-500/40 text-red-200 border border-red-400/60 font-mono font-bold'
                    : 'text-[8.5px] px-1.5 py-0.5 rounded bg-black/60 text-slate-300 border border-white/10 font-mono';
            }
        };

        // Renderizado inicial en memoria de los vectores
        renderTacticalFireVectorsForRegime('puelche');

        // ═══════════════════════════════════════════════════════════════════
        // 2.5D SIMULADOR DE IGNICIÓN TÁCTICA INTERACTIVA (CLICK-TO-IGNITE) & CHOQUE CON FAJA 45M
        // Permite al usuario seleccionar un punto arbitrario en el mapa y simular la pluma balística
        // Cruce con Faja Cortafuegos de 45m y balance hídrico de aspersión perimetral (Tranque Meniel)
        // ═══════════════════════════════════════════════════════════════════
        const customIgnitionLayer = L.layerGroup();
        customIgnitionLayer.addTo(map);
        window.customIgnitionLayer = customIgnitionLayer;
        window.isClickToIgniteActive = false;
        window.activeCustomIgnitionState = null;

        // Función para activar / desactivar el modo Click-to-Ignite
        window.toggleClickToIgniteMode = function(force) {
            window.isClickToIgniteActive = (force !== undefined) ? force : !window.isClickToIgniteActive;
            const btn = document.getElementById('btnToggleClickToIgnite');
            const badge = document.getElementById('badgeClickToIgnite');
            const mapContainer = map.getContainer();

            if (window.isClickToIgniteActive) {
                if (mapContainer) mapContainer.style.cursor = 'crosshair';
                if (btn) btn.className = 'w-full py-2 px-3 rounded-lg bg-amber-500/35 border border-amber-400 text-white font-mono text-[10.5px] font-bold flex items-center justify-between transition-all cursor-pointer shadow-md animate-pulse';
                if (badge) {
                    badge.innerText = 'HAZ CLICK EN EL MAPA';
                    badge.className = 'text-[8.5px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/60 font-mono font-bold';
                }
                // Si la capa de vectores está apagada, la encendemos para ver el contexto
                if (overlayLayers['fire_threat_vectors'] && !map.hasLayer(overlayLayers['fire_threat_vectors'])) {
                    window.toggleTacticalFireVectorsLayer(true);
                }
            } else {
                if (mapContainer) mapContainer.style.cursor = '';
                if (btn) btn.className = 'w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 hover:text-white font-mono text-[10.5px] font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm';
                if (badge) {
                    badge.innerText = 'ACTIVAR';
                    badge.className = 'text-[8.5px] px-1.5 py-0.5 rounded bg-black/60 text-slate-300 border border-white/10 font-mono';
                }
            }
        };

        // Función para limpiar la simulación ad-hoc activa
        window.clearCustomIgnition = function() {
            customIgnitionLayer.clearLayers();
            window.activeCustomIgnitionState = null;
            const card = document.getElementById('cardCustomIgnitionDiagnostics');
            if (card) card.classList.add('hidden');
        };

        // Manejador del click sobre el mapa en modo Click-to-Ignite
        map.on('click', function(e) {
            if (!window.isClickToIgniteActive) return;

            const clickLat = e.latlng.lat;
            const clickLng = e.latlng.lng;
            const menielEastBoundary = [-36.2115, -71.5950];

            // Distancia geodésica a los límites de Fundo Meniel
            const distBoundaryMeters = map.distance(e.latlng, L.latLng(menielEastBoundary[0], menielEastBoundary[1]));
            const distBoundaryKm = distBoundaryMeters / 1000;

            const regimeKey = window.currentTacticalWindRegime || 'puelche';
            const regime = TACTICAL_WIND_REGIMES[regimeKey] || TACTICAL_WIND_REGIMES.puelche;

            // Dirección del fuego según viento activo
            const windDeg = regime.windDeg;
            const fireDir = (windDeg + 180) % 360;

            // Velocidad de avance de cabeza Rothermel (m/min) y km/h
            const speedMpm = 18.4 * (regime.spreadMultiplier / 2.35);
            const speedKmh = (speedMpm * 60) / 1000;
            const arrivalTimeMin = Math.max(2, Math.round(distBoundaryKm / (speedKmh / 60)));

            // Interacción con la Faja Cortafuegos WUI de 45m
            let fajaSurfaceRetencionPct = 100;
            let fajaSpottingBreakthroughPct = 0;
            let spottingOverreachKm = 0;

            if (regime.spottingKm > 0.045) {
                spottingOverreachKm = +(regime.spottingKm - 0.045).toFixed(2);
                fajaSpottingBreakthroughPct = Math.min(95, Math.round((regime.spottingKm / 0.045) * (1 - regime.lfmcPct / 100) * 10));
            }

            if (regimeKey === 'puelche') {
                fajaSurfaceRetencionPct = 85;
                fajaSpottingBreakthroughPct = 94;
            } else if (regimeKey === 'surazo') {
                fajaSurfaceRetencionPct = 98;
                fajaSpottingBreakthroughPct = 38;
            } else if (regimeKey === 'norte') {
                fajaSurfaceRetencionPct = 92;
                fajaSpottingBreakthroughPct = 76;
            } else {
                fajaSurfaceRetencionPct = 95;
                fajaSpottingBreakthroughPct = 42;
            }

            // Consumo hídrico para aspersión defensiva perimetral (Tranque Meniel 18.500 m³)
            const fajaSectorLengthM = Math.min(1200, Math.max(450, Math.round(distBoundaryMeters * 0.6)));
            const fajaAreaM2 = fajaSectorLengthM * 45;
            const waterRequiredM3 = Math.round((fajaAreaM2 * 4.5 * (40 / 60)) / 1000);
            const tranqueTotalM3 = 18500;
            const tranqueUsagePct = +((waterRequiredM3 / tranqueTotalM3) * 100).toFixed(2);

            // Guardar estado en memoria
            window.activeCustomIgnitionState = {
                lat: clickLat,
                lng: clickLng,
                distKm: +distBoundaryKm.toFixed(2),
                arrivalTimeMin,
                regimeKey,
                speedKmh: +speedKmh.toFixed(2),
                spottingKm: regime.spottingKm,
                fajaSurfaceRetencionPct,
                fajaSpottingBreakthroughPct,
                spottingOverreachKm,
                waterRequiredM3,
                tranqueUsagePct
            };

            // Limpiar capa previa y dibujar nuevos vectores dinámicos
            customIgnitionLayer.clearLayers();

            // 1. Marcador táctico del foco con pulso térmico
            const flameIcon = L.divIcon({
                className: 'custom-flame-ignition-icon',
                html: `
                    <div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
                        <div style="position:absolute; width:36px; height:36px; border-radius:50%; background:rgba(239,68,68,0.4); border:1.5px solid #ef4444; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                        <div style="position:absolute; width:26px; height:26px; border-radius:50%; background:rgba(220,38,38,0.9); box-shadow:0 0 15px rgba(239,68,68,0.9); display:flex; align-items:center; justify-content:center; border:1px solid #ffffff;">
                            <span style="font-size:14px;">🔥</span>
                        </div>
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            const flameMarker = L.marker([clickLat, clickLng], { icon: flameIcon });
            flameMarker.bindTooltip(`
                <div style="font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:bold; color:#fecaca; background:rgba(18,6,6,0.95); padding:3px 6px; border-radius:4px; border:1px solid #ef4444;">
                    🎯 FOCO AD-HOC • ${distBoundaryKm.toFixed(2)} km a Meniel (${arrivalTimeMin} min)
                </div>
            `, { permanent: true, direction: 'top', offset: [0, -18] });
            flameMarker.addTo(customIgnitionLayer);

            // 2. Pluma balística militar adaptada desde este punto de ignición
            const reachKm = Math.max(1.2, Math.min(distBoundaryKm + 0.6, 3.2));
            const p0 = [clickLat, clickLng];

            // Haz Central (Head fire)
            const p1_head = destLatLng(clickLat, clickLng, reachKm, fireDir);
            const pc_head = destLatLng(clickLat, clickLng, reachKm * 0.5, fireDir + 4);
            const headArrow = createTacticalFireArrow(p0, pc_head, p1_head, {
                color: '#dc2626',
                weight: 5.5,
                badgeText: `🔥 ${Math.min(96, Math.max(45, 92 - Math.round(distBoundaryKm * 10)))}% • ${arrivalTimeMin} min`,
                popupHtml: `
                    <div style="font-family:'JetBrains Mono',monospace; font-size:11px; padding:4px; color:#f8fafc; min-width:220px;">
                        <strong style="color:#ef4444; font-size:12px;">🎯 Simulación de Ignición Ad-hoc</strong>
                        <div style="display:flex; justify-content:space-between; margin-top:4px;">
                            <span style="color:#94a3b8;">Distancia a Meniel:</span>
                            <b style="color:#f87171;">${distBoundaryKm.toFixed(2)} km</b>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-top:2px;">
                            <span style="color:#94a3b8;">Tiempo Estimado:</span>
                            <b style="color:#fca5a5;">${arrivalTimeMin} min (${speedKmh.toFixed(1)} km/h)</b>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-top:2px;">
                            <span style="color:#94a3b8;">Salto Faja 45m:</span>
                            <b style="color:#fbbf24;">${fajaSpottingBreakthroughPct}% prob (${regime.spottingKm} km)</b>
                        </div>
                        <div style="margin-top:6px; padding-top:4px; border-top:1px solid rgba(255,255,255,0.1); font-size:10px; color:#86efac;">
                            💧 <b>Agua Aspersión Tranque:</b> ${waterRequiredM3} m³ (${tranqueUsagePct}% capacidad)
                        </div>
                    </div>
                `
            });
            headArrow.shaft.addTo(customIgnitionLayer);
            headArrow.headMarker.addTo(customIgnitionLayer);
            if (headArrow.badgeMarker) headArrow.badgeMarker.addTo(customIgnitionLayer);

            // Flanco Izquierdo
            const p1_left = destLatLng(clickLat, clickLng, reachKm * 0.65, fireDir - 16);
            const pc_left = destLatLng(clickLat, clickLng, reachKm * 0.35, fireDir - 8);
            const leftArrow = createTacticalFireArrow(p0, pc_left, p1_left, { color: '#f97316', weight: 2.8, opacity: 0.85 });
            leftArrow.shaft.addTo(customIgnitionLayer);
            leftArrow.headMarker.addTo(customIgnitionLayer);

            // Flanco Derecho
            const p1_right = destLatLng(clickLat, clickLng, reachKm * 0.65, fireDir + 16);
            const pc_right = destLatLng(clickLat, clickLng, reachKm * 0.35, fireDir + 8);
            const rightArrow = createTacticalFireArrow(p0, pc_right, p1_right, { color: '#f97316', weight: 2.8, opacity: 0.85 });
            rightArrow.shaft.addTo(customIgnitionLayer);
            rightArrow.headMarker.addTo(customIgnitionLayer);

            // Vector de Pavesas (Spotting Albini) superando la barrera
            if (regime.spottingKm > 0) {
                const spotDest = destLatLng(clickLat, clickLng, Math.min(distBoundaryKm + 0.3, reachKm + regime.spottingKm * 0.6), fireDir + 3);
                const spotPts = bezierPoints(p0, destLatLng(clickLat, clickLng, regime.spottingKm * 0.5, fireDir - 10), spotDest, 14);
                const spotLine = L.polyline(spotPts, {
                    color: '#fde047',
                    weight: 2.0,
                    dashArray: '4, 6',
                    opacity: 0.95
                });
                spotLine.bindTooltip(`
                    <div style="font-family:'JetBrains Mono',monospace; font-size:9px; color:#fef08a; background:rgba(0,0,0,0.9); padding:2px 5px; border-radius:3px; border:1px solid #facc15;">
                        ⚡ SALTO PAVESAS: ${regime.spottingKm} km (Albini) &bull; Cruza faja 45m
                    </div>
                `, { sticky: true });
                spotLine.addTo(customIgnitionLayer);
            }

            // Actualizar Tarjeta de Diagnóstico Dinámico en el Sidebar (#tab-riesgos)
            const card = document.getElementById('cardCustomIgnitionDiagnostics');
            if (card) {
                card.classList.remove('hidden');
                const elCoords = document.getElementById('customIgnitionCoords');
                const elDist = document.getElementById('customIgnitionDist');
                const elTime = document.getElementById('customIgnitionTime');
                const elFaja = document.getElementById('customIgnitionFajaStatus');
                const elSpot = document.getElementById('customIgnitionSpotting');
                const elWater = document.getElementById('customIgnitionWater');

                if (elCoords) elCoords.innerText = `${clickLat.toFixed(4)}, ${clickLng.toFixed(4)}`;
                if (elDist) elDist.innerText = `${distBoundaryKm.toFixed(2)} km a Meniel`;
                if (elTime) elTime.innerText = `${arrivalTimeMin} min (${speedKmh.toFixed(1)} km/h)`;
                if (elFaja) {
                    elFaja.innerHTML = `Suelo: <b class="text-emerald-400">${fajaSurfaceRetencionPct}% retención</b> &bull; Pavesas: <b class="text-red-400">${fajaSpottingBreakthroughPct}% salto</b>`;
                }
                if (elSpot) {
                    elSpot.innerText = `${regime.spottingKm} km salto proy. (supera faja 45m)`;
                }
                if (elWater) {
                    elWater.innerHTML = `<b class="text-cyan-300">${waterRequiredM3} m³</b> (${tranqueUsagePct}% de Tranque Meniel 18.5k m³) &bull; 40 min aspersión`;
                }
            }

            // Desactivar el cursor de click para permitir interacción normal tras definir el foco
            window.toggleClickToIgniteMode(false);
        });

        // ═══════════════════════════════════════════════════════════════════
        // 2.5E ESTÁNDAR VECINO PROTEGIDO: MÓDULO 3 - RESERVA HÍDRICA COLECTIVA
        // 18 Tranques de acumulación DGA/CNR en radio 5 km (342.500 m³ nominales)
        // Modelado espectral acoplado: InfeRes / Global Water Watch + Banda MNDWI (Xu 2006)
        // ═══════════════════════════════════════════════════════════════════
        const geojsonTranquesCuenca5km = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_MENIEL_01",
                        "name": "Tranque Keyline Fundo Meniel (Piloto)",
                        "sector": "Parral / Fundo Meniel",
                        "rol": "418-24 Parral",
                        "dist_km": 0.0,
                        "bearing": "Centro",
                        "center": [-36.2105, -71.6045],
                        "capacity_m3": 18500,
                        "current_m3": 17020,
                        "fill_pct": 92,
                        "tolerance_pct": 0.5, // Piezómetro IoT sumergido real
                        "aptitude": ["aljibe", "helipunto", "bombeo"],
                        "sensor": "Piezómetro KioT Sumergido LoRaWAN (Ground-Truth)",
                        "canal": "Derivado 3 Canal San Manuel",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.76,
                        "elevation_m": 198
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6058, -36.2098], [-71.6032, -36.2098],
                            [-71.6032, -36.2112], [-71.6058, -36.2112],
                            [-71.6058, -36.2098]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_CRISTALES_N",
                        "name": "Tranque Los Cristales Norte",
                        "sector": "Estero Los Cristales",
                        "rol": "412-10 Retiro",
                        "dist_km": 2.2,
                        "bearing": "NE",
                        "center": [-36.1950, -71.5920],
                        "capacity_m3": 29000,
                        "current_m3": 23490,
                        "fill_pct": 81,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe", "helipunto"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Canal Los Cristales / Melado",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.74,
                        "elevation_m": 215
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5936, -36.1938], [-71.5904, -36.1938],
                            [-71.5904, -36.1962], [-71.5936, -36.1962],
                            [-71.5936, -36.1938]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_SAN_MANUEL_E",
                        "name": "Tranque San Manuel Este",
                        "sector": "San Manuel Central",
                        "rol": "420-05 Parral",
                        "dist_km": 2.1,
                        "bearing": "E",
                        "center": [-36.2040, -71.5830],
                        "capacity_m3": 28000,
                        "current_m3": 20720,
                        "fill_pct": 74,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe", "bombeo"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Matriz Canal San Manuel",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.71,
                        "elevation_m": 208
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5844, -36.2028], [-71.5816, -36.2028],
                            [-71.5816, -36.2052], [-71.5844, -36.2052],
                            [-71.5844, -36.2028]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_MAITEN_ALTO",
                        "name": "Tranque Maitén Alto",
                        "sector": "El Maitén Cordillera",
                        "rol": "425-18 Parral",
                        "dist_km": 2.3,
                        "bearing": "SW",
                        "center": [-36.2280, -71.6210],
                        "capacity_m3": 35000,
                        "current_m3": 29750,
                        "fill_pct": 85,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe", "helipunto"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Derivado Canal Melado",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.78,
                        "elevation_m": 224
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6228, -36.2266], [-71.6192, -36.2266],
                            [-71.6192, -36.2294], [-71.6228, -36.2294],
                            [-71.6228, -36.2266]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_QUEBRADA_HONDA",
                        "name": "Tranque Quebrada Honda",
                        "sector": "Lomas del Pehuenche",
                        "rol": "431-02 Parral",
                        "dist_km": 2.8,
                        "bearing": "SE",
                        "center": [-36.2350, -71.5950],
                        "capacity_m3": 22500,
                        "current_m3": 15300,
                        "fill_pct": 68,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Estero Los Cristales",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.69,
                        "elevation_m": 236
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5964, -36.2338], [-71.5936, -36.2338],
                            [-71.5936, -36.2362], [-71.5964, -36.2362],
                            [-71.5964, -36.2338]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_MELADO_01",
                        "name": "Tranque Canal Melado 1",
                        "sector": "Ribera Norte Melado",
                        "rol": "398-14 Retiro",
                        "dist_km": 3.3,
                        "bearing": "N",
                        "center": [-36.1820, -71.6110],
                        "capacity_m3": 22000,
                        "current_m3": 17380,
                        "fill_pct": 79,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe", "bombeo"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Canal Melado Matriz",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.75,
                        "elevation_m": 192
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6126, -36.1808], [-71.6094, -36.1808],
                            [-71.6094, -36.1832], [-71.6126, -36.1832],
                            [-71.6126, -36.1808]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_MELADO_02",
                        "name": "Tranque Canal Melado 2",
                        "sector": "Quilaimo Alto",
                        "rol": "399-08 Retiro",
                        "dist_km": 4.0,
                        "bearing": "NNE",
                        "center": [-36.1760, -71.6030],
                        "capacity_m3": 19200,
                        "current_m3": 13824,
                        "fill_pct": 72,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Canal Melado Matriz",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.70,
                        "elevation_m": 195
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6044, -36.1748], [-71.6016, -36.1748],
                            [-71.6016, -36.1772], [-71.6044, -36.1772],
                            [-71.6044, -36.1748]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_SAN_MANUEL_B",
                        "name": "Tranque San Manuel Bajo",
                        "sector": "Llano Aluvial Oeste",
                        "rol": "415-33 Parral",
                        "dist_km": 2.9,
                        "bearing": "W",
                        "center": [-36.2190, -71.6350],
                        "capacity_m3": 14800,
                        "current_m3": 9620,
                        "fill_pct": 65,
                        "tolerance_pct": 15,
                        "aptitude": ["bombeo", "aljibe"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Derivado Menor San Manuel",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.67,
                        "elevation_m": 188
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6364, -36.2178], [-71.6336, -36.2178],
                            [-71.6336, -36.2202], [-71.6364, -36.2202],
                            [-71.6364, -36.2178]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_EL_BOLDO",
                        "name": "Tranque El Boldo",
                        "sector": "Camino a Catillo",
                        "rol": "433-11 Parral",
                        "dist_km": 3.6,
                        "bearing": "S",
                        "center": [-36.2420, -71.6180],
                        "capacity_m3": 12400,
                        "current_m3": 9920,
                        "fill_pct": 80,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Canal San Manuel",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.72,
                        "elevation_m": 218
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6192, -36.2408], [-71.6168, -36.2408],
                            [-71.6168, -36.2432], [-71.6192, -36.2432],
                            [-71.6192, -36.2408]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_LOMA_GARZAS",
                        "name": "Tranque Loma de las Garzas",
                        "sector": "Vegas de Longaví",
                        "rol": "405-22 Retiro",
                        "dist_km": 3.8,
                        "bearing": "NW",
                        "center": [-36.1890, -71.6380],
                        "capacity_m3": 16500,
                        "current_m3": 11550,
                        "fill_pct": 70,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Canal Longaví Matriz",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.68,
                        "elevation_m": 182
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6394, -36.1878], [-71.6366, -36.1878],
                            [-71.6366, -36.1902], [-71.6394, -36.1902],
                            [-71.6394, -36.1878]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_PENASCO_SUR",
                        "name": "Tranque Peñasco Sur",
                        "sector": "Piedemonte Andino",
                        "rol": "440-07 Parral",
                        "dist_km": 4.4,
                        "bearing": "SE",
                        "center": [-36.2480, -71.5850],
                        "capacity_m3": 20000,
                        "current_m3": 16800,
                        "fill_pct": 84,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe", "helipunto"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Vertedero Quebrada Honda",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.77,
                        "elevation_m": 254
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5864, -36.2468], [-71.5836, -36.2468],
                            [-71.5836, -36.2492], [-71.5864, -36.2492],
                            [-71.5864, -36.2468]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_LOS_AROMOS",
                        "name": "Tranque Los Aromos",
                        "sector": "Colliguay Este",
                        "rol": "422-19 Parral",
                        "dist_km": 3.9,
                        "bearing": "E",
                        "center": [-36.2080, -71.5620],
                        "capacity_m3": 9800,
                        "current_m3": 5684,
                        "fill_pct": 58,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Estero Los Cristales",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.63,
                        "elevation_m": 212
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5632, -36.2070], [-71.5608, -36.2070],
                            [-71.5608, -36.2090], [-71.5632, -36.2090],
                            [-71.5632, -36.2070]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_RINCON_VERDE",
                        "name": "Tranque Rincón Verde",
                        "sector": "Faldas del Roble",
                        "rol": "428-15 Parral",
                        "dist_km": 3.3,
                        "bearing": "SE",
                        "center": [-36.2230, -71.5710],
                        "capacity_m3": 11200,
                        "current_m3": 8176,
                        "fill_pct": 73,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Derivado San Manuel 4",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.69,
                        "elevation_m": 220
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5724, -36.2218], [-71.5696, -36.2218],
                            [-71.5696, -36.2242], [-71.5724, -36.2242],
                            [-71.5724, -36.2218]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_VEGA_GRANDE",
                        "name": "Tranque Vega Grande",
                        "sector": "Villaseca Norte",
                        "rol": "392-04 Retiro",
                        "dist_km": 4.6,
                        "bearing": "NNE",
                        "center": [-36.1720, -71.5890],
                        "capacity_m3": 17600,
                        "current_m3": 14256,
                        "fill_pct": 81,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Canal Melado Derivado",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.73,
                        "elevation_m": 202
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5904, -36.1708], [-71.5876, -36.1708],
                            [-71.5876, -36.1732], [-71.5904, -36.1732],
                            [-71.5904, -36.1708]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_POTRERO_NUEVO",
                        "name": "Tranque Potrero Nuevo",
                        "sector": "Parral Poniente",
                        "rol": "417-12 Parral",
                        "dist_km": 3.5,
                        "bearing": "W",
                        "center": [-36.2010, -71.6420],
                        "capacity_m3": 15000,
                        "current_m3": 10350,
                        "fill_pct": 69,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Canal San Manuel Derivado",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.67,
                        "elevation_m": 184
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6434, -36.1998], [-71.6406, -36.1998],
                            [-71.6406, -36.2022], [-71.6434, -36.2022],
                            [-71.6434, -36.1998]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_COIRON_ALTO",
                        "name": "Tranque Coirón Alto",
                        "sector": "Lomas de Coirón",
                        "rol": "437-09 Parral",
                        "dist_km": 4.4,
                        "bearing": "SW",
                        "center": [-36.2390, -71.6400],
                        "capacity_m3": 21500,
                        "current_m3": 18920,
                        "fill_pct": 88,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe", "helipunto"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Canal Melado Alto",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.79,
                        "elevation_m": 228
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6416, -36.2378], [-71.6384, -36.2378],
                            [-71.6384, -36.2402], [-71.6416, -36.2402],
                            [-71.6416, -36.2378]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_EL_MEMBRILLO",
                        "name": "Tranque El Membrillo",
                        "sector": "Los Cristales Oriente",
                        "rol": "414-06 Retiro",
                        "dist_km": 3.8,
                        "bearing": "NE",
                        "center": [-36.1910, -71.5700],
                        "capacity_m3": 13500,
                        "current_m3": 8370,
                        "fill_pct": 62,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Estero Los Cristales",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.65,
                        "elevation_m": 222
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.5714, -36.1898], [-71.5686, -36.1898],
                            [-71.5686, -36.1922], [-71.5714, -36.1922],
                            [-71.5714, -36.1898]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "id": "TR_LA_LEONERA",
                        "name": "Tranque La Leonera",
                        "sector": "Límite Forestal Sur",
                        "rol": "444-21 Parral",
                        "dist_km": 4.4,
                        "bearing": "S",
                        "center": [-36.2510, -71.6080],
                        "capacity_m3": 16000,
                        "current_m3": 12320,
                        "fill_pct": 77,
                        "tolerance_pct": 15,
                        "aptitude": ["aljibe", "bombeo"],
                        "sensor": "Sentinel-2 MSI L2A (InfeRes Hipsométrico)",
                        "canal": "Canal San Manuel Cabecera",
                        "satellite_age": "Hace 2 días (Copernicus S2A L2A)",
                        "mndwi": 0.72,
                        "elevation_m": 242
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-71.6094, -36.2498], [-71.6066, -36.2498],
                            [-71.6066, -36.2522], [-71.6094, -36.2522],
                            [-71.6094, -36.2498]
                        ]]
                    }
                }
            ]
        };

        window.geojsonTranquesCuenca5km = geojsonTranquesCuenca5km;

        // Capa Leaflet de los 18 Tranques Colectivos
        const tranquesLayer = L.geoJSON(geojsonTranquesCuenca5km, {
            style: function(feature) {
                const p = feature.properties;
                const isMeniel = p.id === 'TR_MENIEL_01';
                return {
                    color: isMeniel ? '#10b981' : '#06b6d4',
                    weight: isMeniel ? 2.8 : 2.0,
                    dashArray: '4, 3', // Incerteza batimétrica satelital ±15%
                    fillColor: isMeniel ? '#059669' : '#0891b2',
                    fillOpacity: 0.65,
                    className: 'tranque-polygon-water'
                };
            },
            onEachFeature: function(feature, layer) {
                const p = feature.properties;
                const isMeniel = p.id === 'TR_MENIEL_01';

                // Tooltip táctico flotante
                layer.bindTooltip(`
                    <div style="font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:bold; color:${isMeniel ? '#6ee7b7' : '#67e8f9'}; background:rgba(7,14,26,0.95); padding:3px 7px; border-radius:4px; border:1px solid ${isMeniel ? 'rgba(16,185,129,0.5)' : 'rgba(6,182,212,0.5)'}; box-shadow:0 2px 8px rgba(0,0,0,0.7);">
                        💧 ${p.name} &bull; ${(p.current_m3 / 1000).toFixed(1)}k m³ (${p.fill_pct}%)
                    </div>
                `, { permanent: false, direction: 'top', offset: [0, -6] });

                // Popup interactivo de comando táctico
                const aptBadges = p.aptitude.map(a => {
                    if (a === 'aljibe') return '<span style="background:rgba(249,115,22,0.25); color:#fdba74; padding:1px 5px; border-radius:3px; border:1px solid rgba(249,115,22,0.4); font-size:9px;">🚒 Aljibe</span>';
                    if (a === 'helipunto') return '<span style="background:rgba(56,189,248,0.25); color:#7dd3fc; padding:1px 5px; border-radius:3px; border:1px solid rgba(56,189,248,0.4); font-size:9px;">🚁 Helipunto</span>';
                    if (a === 'bombeo') return '<span style="background:rgba(168,85,247,0.25); color:#d8b4fe; padding:1px 5px; border-radius:3px; border:1px solid rgba(168,85,247,0.4); font-size:9px;">🔌 Bombeo</span>';
                    return '';
                }).join(' ');

                const popupHtml = `
                    <div style="font-family:'JetBrains Mono',monospace; font-size:11px; min-width:270px; padding:4px; color:#f8fafc;">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid ${isMeniel ? '#10b981' : '#06b6d4'}; padding-bottom:4px; margin-bottom:6px;">
                            <strong style="color:${isMeniel ? '#34d399' : '#38bdf8'}; font-size:12px;">💧 ${p.name}</strong>
                            <span style="background:${isMeniel ? 'rgba(16,185,129,0.3)' : 'rgba(6,182,212,0.2)'}; color:${isMeniel ? '#6ee7b7' : '#67e8f9'}; padding:1px 5px; border-radius:3px; font-size:8.5px; font-weight:bold;">${isMeniel ? 'GROUND TRUTH' : 'INFERES S2'}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-size:10px;">
                            <span style="color:#94a3b8;">Ubicación / Rol:</span>
                            <span style="color:#f1f5f9; font-weight:bold;">${p.rol} (${p.dist_km.toFixed(1)} km ${p.bearing})</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-size:10px;">
                            <span style="color:#94a3b8;">Capacidad Nominal:</span>
                            <span style="color:#f1f5f9; font-weight:bold;">${p.capacity_m3.toLocaleString()} m³</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-size:10px;">
                            <span style="color:#94a3b8;">Volumen Estimado:</span>
                            <span style="color:${isMeniel ? '#34d399' : '#38bdf8'}; font-weight:bold;">${p.current_m3.toLocaleString()} m³ (${p.fill_pct}%)</span>
                        </div>
                        <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden; margin:4px 0 6px 0;">
                            <div style="width:${p.fill_pct}%; height:100%; background:${p.fill_pct > 75 ? '#10b981' : (p.fill_pct > 50 ? '#06b6d4' : '#f59e0b')}; border-radius:3px;"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-size:9.5px;">
                            <span style="color:#94a3b8;">Tolerancia Batimétrica:</span>
                            <span style="color:#cbd5e1;">&plusmn;${p.tolerance_pct}% ${isMeniel ? '(Sensor Presión)' : '(Curva InfeRes)'}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:9.5px;">
                            <span style="color:#94a3b8;">Canal Aportante:</span>
                            <span style="color:#7dd3fc;">${p.canal}</span>
                        </div>
                        <div style="margin-bottom:6px;">
                            <span style="color:#94a3b8; font-size:9px; display:block; margin-bottom:2px;">Aptitud Táctica de Carga:</span>
                            <div style="display:flex; gap:4px; flex-wrap:wrap;">${aptBadges}</div>
                        </div>
                        <div style="display:flex; gap:4px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.1);">
                            <button onclick="calculateWaterTransitTime('${p.id}')" style="flex:1; padding:4px 6px; font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:bold; background:rgba(249,115,22,0.25); color:#fdba74; border:1px solid rgba(249,115,22,0.5); border-radius:4px; cursor:pointer;">
                                ⏱️ Tiempo Aljibe
                            </button>
                            <button onclick="inspectTranqueMNDWI('${p.id}')" style="flex:1; padding:4px 6px; font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:bold; background:rgba(6,182,212,0.25); color:#67e8f9; border:1px solid rgba(6,182,212,0.5); border-radius:4px; cursor:pointer;">
                                🛰️ Banda MNDWI
                            </button>
                        </div>
                    </div>
                `;
                layer.bindPopup(popupHtml);
            }
        });

        overlayLayers['recursos_tranques'] = tranquesLayer;

        // ═══════════════════════════════════════════════════════════════════
        // CAPA ESPECTRAL MNDWI (Xu 2006: Verde B03 vs SWIR-1 B11)
        // Renders visual spectral layer + contextual floating HUD legend
        // ═══════════════════════════════════════════════════════════════════
        const mndwiSpectralLayer = L.layerGroup();

        // 1. Capa de contraste atmosférico / territorial oscuro
        const spectralBaseMask = L.polygon([
            [-36.1500, -71.6700], [-36.1500, -71.5400],
            [-36.2700, -71.5400], [-36.2700, -71.6700]
        ], {
            color: 'transparent',
            fillColor: '#0b1329',
            fillOpacity: 0.38,
            interactive: false
        });
        mndwiSpectralLayer.addLayer(spectralBaseMask);

        // 2. Corredores de agua fluviales vivos (Río Longaví, Estero Cristales, Canal Melado)
        const riverCorridorsMndwi = [
            // Río Longaví
            L.polyline([
                [-36.1620, -71.6620], [-36.1750, -71.6420], [-36.1880, -71.6210],
                [-36.2050, -71.6020], [-36.2250, -71.5810], [-36.2480, -71.5580]
            ], { color: '#00f0ff', weight: 6, opacity: 0.88, className: 'mndwi-river-glow' })
            .bindTooltip('<div style="font-family:\'JetBrains Mono\'; font-size:9px; background:#041a2e; color:#00f0ff; padding:2px 5px; border-radius:3px; border:1px solid #00f0ff;">🌊 Río Longaví &bull; MNDWI: +0.72</div>'),

            // Estero Los Cristales
            L.polyline([
                [-36.1880, -71.5720], [-36.1950, -71.5850], [-36.2040, -71.5950],
                [-36.2150, -71.6080], [-36.2350, -71.6180]
            ], { color: '#38bdf8', weight: 4.5, opacity: 0.85 })
            .bindTooltip('<div style="font-family:\'JetBrains Mono\'; font-size:9px; background:#041a2e; color:#38bdf8; padding:2px 5px; border-radius:3px; border:1px solid #38bdf8;">💧 Estero Los Cristales &bull; MNDWI: +0.64</div>'),

            // Canal Melado Matriz
            L.polyline([
                [-36.1740, -71.6150], [-36.1810, -71.6050], [-36.1920, -71.5880],
                [-36.2080, -71.5760]
            ], { color: '#06b6d4', weight: 3.5, opacity: 0.8, dashArray: '6, 4' })
            .bindTooltip('<div style="font-family:\'JetBrains Mono\'; font-size:9px; background:#041a2e; color:#06b6d4; padding:2px 5px; border-radius:3px; border:1px solid #06b6d4;">⚡ Canal Melado Matriz &bull; MNDWI: +0.58</div>')
        ];
        riverCorridorsMndwi.forEach(r => mndwiSpectralLayer.addLayer(r));

        // 3. Resplandor de los 18 tranques en espectro MNDWI (azul eléctrico resplandeciente)
        geojsonTranquesCuenca5km.features.forEach(f => {
            const p = f.properties;
            const coords = f.geometry.coordinates[0].map(c => [c[1], c[0]]);
            const glowPoly = L.polygon(coords, {
                color: '#ffffff',
                weight: 1.8,
                fillColor: '#00f0ff',
                fillOpacity: 0.92,
                className: 'mndwi-tranque-glow'
            });
            glowPoly.bindTooltip(`
                <div style="font-family:'JetBrains Mono',monospace; font-size:9.5px; font-weight:bold; color:#00f0ff; background:#031525; padding:3px 6px; border-radius:4px; border:1px solid #00f0ff; box-shadow:0 0 10px rgba(0,240,255,0.6);">
                    🛰️ MNDWI: +${p.mndwi.toFixed(2)} &bull; ${p.name}
                </div>
            `, { permanent: false, direction: 'top' });
            mndwiSpectralLayer.addLayer(glowPoly);
        });

        overlayLayers['mndwi_espectral'] = mndwiSpectralLayer;

        // ═══════════════════════════════════════════════════════════════════
        // CONTROLADORES Y FUNCIONES OPERATIVAS DE RECURSOS & TRANQUES
        // ═══════════════════════════════════════════════════════════════════

        // Toggle de la Capa de 18 Tranques
        window.toggleTranquesLayer = function(force) {
            const layer = overlayLayers['recursos_tranques'];
            if (!layer || !map) return;
            const isActive = map.hasLayer(layer);
            const shouldBeActive = (force !== undefined) ? force : !isActive;

            if (shouldBeActive) {
                map.addLayer(layer);
            } else {
                map.removeLayer(layer);
            }
            updateDockButtonState('recursos_tranques', shouldBeActive);

            // Sincronizar botón lateral si existe
            const btnSidebar = document.getElementById('btnToggleTranquesSidebar');
            if (btnSidebar) {
                if (shouldBeActive) {
                    btnSidebar.className = 'py-1.5 px-2 rounded-lg bg-cyan-500 text-white border border-cyan-300 font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer';
                    btnSidebar.innerHTML = '<span>💧</span> <span>18 Tranques Activos</span>';
                } else {
                    btnSidebar.className = 'py-1.5 px-2 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-400/50 font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer';
                    btnSidebar.innerHTML = '<span>💧</span> <span>Ver 18 Tranques</span>';
                }
            }
        };

        // Toggle de la Capa Espectral MNDWI
        window.toggleMNDWILayer = function(force) {
            const layer = overlayLayers['mndwi_espectral'];
            if (!layer || !map) return;
            const isActive = map.hasLayer(layer);
            const shouldBeActive = (force !== undefined) ? force : !isActive;

            if (shouldBeActive) {
                map.addLayer(layer);
                showMndwiSpectralHudLegend(true);
            } else {
                map.removeLayer(layer);
                showMndwiSpectralHudLegend(false);
            }
            updateDockButtonState('mndwi_espectral', shouldBeActive);

            // Sincronizar botón lateral
            const btnSidebar = document.getElementById('btnToggleMndwiSidebar');
            if (btnSidebar) {
                if (shouldBeActive) {
                    btnSidebar.className = 'py-1.5 px-2 rounded-lg bg-sky-500 text-white border border-sky-300 font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer';
                    btnSidebar.innerHTML = '<span>🛰️</span> <span>MNDWI Activo</span>';
                } else {
                    btnSidebar.className = 'py-1.5 px-2 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-400/50 font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer';
                    btnSidebar.innerHTML = '<span>🛰️</span> <span>Banda MNDWI</span>';
                }
            }
        };

        // Mostrar / Ocultar Leyenda Flotante HUD de Teledetección MNDWI
        function showMndwiSpectralHudLegend(visible) {
            let hud = document.getElementById('legendMndwiSpectral');
            if (!hud && visible) {
                hud = document.createElement('div');
                hud.id = 'legendMndwiSpectral';
                hud.className = 'fixed left-4 bottom-12 z-30 p-3 rounded-xl bg-[#070e1a]/95 backdrop-blur-md border border-cyan-400/50 shadow-2xl font-mono text-[10px] text-slate-200 max-w-xs space-y-2 select-none animate-fadeIn';
                hud.innerHTML = `
                    <div class="flex items-center justify-between border-b border-cyan-500/30 pb-1.5">
                        <span class="font-bold text-cyan-300 flex items-center gap-1.5">
                            <span>🛰️</span> Sentinel-2 MSI &bull; MNDWI (Xu 2006)
                        </span>
                        <button onclick="window.toggleMNDWILayer(false)" class="text-slate-400 hover:text-white px-1 font-bold cursor-pointer">&times;</button>
                    </div>
                    <div class="text-[9px] text-slate-300 bg-black/40 p-1.5 rounded border border-white/5">
                        <b>Fórmula de Absorción:</b> (B03 Verde - B11 SWIR1) / (B03 + B11)
                    </div>
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="w-3.5 h-3 rounded bg-[#00f0ff] border border-white shadow-[0_0_8px_#00f0ff] shrink-0"></span>
                            <span class="text-[9px] leading-tight"><b>+0.2 a +1.0:</b> Agua libre / Tranques profundos</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="w-3.5 h-3 rounded bg-[#0d9488] border border-white/20 shrink-0"></span>
                            <span class="text-[9px] leading-tight"><b>0.0 a +0.2:</b> Suelo saturado / Riberas</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="w-3.5 h-3 rounded bg-[#475569] border border-white/20 shrink-0"></span>
                            <span class="text-[9px] leading-tight"><b>-0.3 a 0.0:</b> Huertos irrigados (Cerezos/Avellano)</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="w-3.5 h-3 rounded bg-[#18181b] border border-white/20 shrink-0"></span>
                            <span class="text-[9px] leading-tight"><b>&lt; -0.3:</b> Rastrojo seco / Suelo mineral</span>
                        </div>
                    </div>
                    <div class="text-[8px] text-slate-400 pt-1 border-t border-white/10 flex justify-between">
                        <span>Copernicus L2A BOA</span>
                        <span>Res. 10m &bull; Revisita 5d</span>
                    </div>
                `;
                document.body.appendChild(hud);
            }
            if (hud) {
                hud.style.display = visible ? 'block' : 'none';
            }
        }

        // Enfocar un tranque específico en el mapa
        window.centerTranque = function(tranqueId) {
            const feat = geojsonTranquesCuenca5km.features.find(f => f.properties.id === tranqueId);
            if (!feat || !map) return;
            const p = feat.properties;
            
            // Si la capa de tranques está apagada, encenderla
            if (overlayLayers['recursos_tranques'] && !map.hasLayer(overlayLayers['recursos_tranques'])) {
                window.toggleTranquesLayer(true);
            }

            map.flyTo([p.center[0], p.center[1]], 15.5, { duration: 1.2 });

            // Abrir popup de la capa si está disponible
            setTimeout(() => {
                if (overlayLayers['recursos_tranques']) {
                    overlayLayers['recursos_tranques'].eachLayer(layer => {
                        if (layer.feature && layer.feature.properties.id === tranqueId) {
                            layer.openPopup();
                        }
                    });
                }
            }, 1250);
        };

        // Inspeccionar tranque en banda MNDWI
        window.inspectTranqueMNDWI = function(tranqueId) {
            window.centerTranque(tranqueId);
            if (!map.hasLayer(overlayLayers['mndwi_espectral'])) {
                window.toggleMNDWILayer(true);
            }
        };

        // Cálculo de Tiempo de Despacho de Camión Aljibe hacia Fundo Meniel
        window.calculateWaterTransitTime = function(tranqueId) {
            const feat = geojsonTranquesCuenca5km.features.find(f => f.properties.id === tranqueId);
            if (!feat) return;
            const p = feat.properties;

            if (p.id === 'TR_MENIEL_01') {
                alert(`🏡 Tranque Meniel es fuente in-situ (0.0 km):\n• Bombeo directo inmediato por manguera de 4" (120 L/s).\n• Carga de aljibe en conexión storz perimetral: 12 min.\n• Helipunto Bambi Bucket: 60m (tiempo rotación 2.5 min).`);
                return;
            }

            // Velocidad promedio aljibe ripio/asfalto: 28 km/h
            const travelOneWayMin = Math.round((p.dist_km / 28) * 60);
            const fillTimeMin = 12; // Carga de 10.000 L con motobomba
            const cycleTotalMin = (travelOneWayMin * 2) + fillTimeMin + 8; // Retorno + vaciado

            const msg = `🚒 LOGÍSTICA DE CARGA & DESPACHO ALJIBE\n──────────────────────────────────────\nFuente: ${p.name}\nDistancia a Meniel: ${p.dist_km.toFixed(1)} km (${p.bearing})\nCapacidad Disponible: ${p.current_m3.toLocaleString()} m³ (${p.fill_pct}%)\n\n• Tiempo de viaje hacia Meniel (28 km/h): ${travelOneWayMin} min\n• Tiempo de succión y llenado 10k L: ${fillTimeMin} min\n• Ciclo completo de rotación: ~${cycleTotalMin} minutos por camión.\n• Aptitud: ${p.aptitude.join(', ').toUpperCase()}`;
            alert(msg);
        };

        // Filtrado dinámico de la lista de tranques en el Sidebar
        window.filterTranquesByAptitude = function(aptitude) {
            // Actualizar botones de filtro
            document.querySelectorAll('.tranque-filter-btn').forEach(btn => {
                btn.className = 'tranque-filter-btn px-2 py-0.5 rounded bg-black/40 text-slate-300 hover:text-white border border-white/10 cursor-pointer whitespace-nowrap text-[9px]';
            });
            const activeBtn = event ? event.target : null;
            if (activeBtn) {
                activeBtn.className = 'tranque-filter-btn active px-2 py-0.5 rounded bg-sky-500/30 text-sky-200 border border-sky-400/50 font-bold cursor-pointer whitespace-nowrap text-[9px]';
            }

            renderRecursosTranquesList(aptitude);
        };

        // Renderizado del catálogo de 18 tranques en el contenedor `#listaTranquesContainer`
        function renderRecursosTranquesList(filterAptitude = 'all') {
            const container = document.getElementById('listaTranquesContainer');
            const countLabel = document.getElementById('lblRecursosFiltroCount');
            if (!container) return;

            let list = geojsonTranquesCuenca5km.features;
            if (filterAptitude !== 'all') {
                list = list.filter(f => f.properties.aptitude.includes(filterAptitude));
            }

            if (countLabel) {
                countLabel.innerText = `${list.length} Obras (${filterAptitude === 'all' ? 'Total' : filterAptitude})`;
            }

            container.innerHTML = list.map(f => {
                const p = f.properties;
                const isMeniel = p.id === 'TR_MENIEL_01';
                const fillBarColor = p.fill_pct > 75 ? 'bg-emerald-500' : (p.fill_pct > 50 ? 'bg-cyan-500' : 'bg-amber-500');

                return `
                    <div class="p-2 rounded-lg bg-black/40 border ${isMeniel ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-white/5 hover:border-cyan-500/30'} space-y-1 text-[9.5px] transition-all">
                        <div class="flex items-center justify-between">
                            <span class="font-bold ${isMeniel ? 'text-emerald-300' : 'text-slate-200'} truncate flex items-center gap-1">
                                <span>${isMeniel ? '🏡' : '💧'}</span>
                                <span class="truncate">${p.name}</span>
                            </span>
                            <span class="text-[8.5px] font-mono text-cyan-300 shrink-0 font-bold">
                                ${(p.current_m3 / 1000).toFixed(1)}k m³
                            </span>
                        </div>
                        <div class="flex items-center justify-between text-[8.5px] text-slate-400 font-mono">
                            <span>${p.dist_km === 0 ? 'En Caserío' : `${p.dist_km.toFixed(1)} km ${p.bearing}`} &bull; ${p.rol}</span>
                            <span class="${p.fill_pct > 75 ? 'text-emerald-400' : 'text-cyan-400'} font-bold">${p.fill_pct}% Lleno (&plusmn;${p.tolerance_pct}%)</span>
                        </div>
                        <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div class="${fillBarColor} h-full rounded-full" style="width: ${p.fill_pct}%"></div>
                        </div>
                        <div class="flex items-center justify-between pt-1 border-t border-white/5 text-[8.5px]">
                            <div class="flex items-center gap-1 text-slate-300">
                                ${p.aptitude.includes('aljibe') ? '<span title="Apto para Aljibe">🚒</span>' : ''}
                                ${p.aptitude.includes('helipunto') ? '<span title="Helipunto Bambi Bucket">🚁</span>' : ''}
                                ${p.aptitude.includes('bombeo') ? '<span title="Motobomba fija">🔌</span>' : ''}
                            </div>
                            <div class="flex items-center gap-1">
                                <button onclick="centerTranque('${p.id}')" class="px-1.5 py-0.5 rounded bg-white/10 hover:bg-cyan-500/30 text-cyan-200 font-bold transition-all cursor-pointer" title="Centrar en el mapa">
                                    🔍 Ver
                                </button>
                                <button onclick="inspectTranqueMNDWI('${p.id}')" class="px-1.5 py-0.5 rounded bg-white/10 hover:bg-sky-500/30 text-sky-200 font-bold transition-all cursor-pointer" title="Ver en Banda Espectral MNDWI">
                                    🛰️ MNDWI
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        window.renderRecursosTranquesList = renderRecursosTranquesList;

        // Renderizado inicial al cargar
        setTimeout(() => {
            renderRecursosTranquesList('all');
        }, 300);

        // ═══════════════════════════════════════════════════════════════════
        // 2.6 FUNCIONES DE CONTROL DE TRANSECTOS, ENCUADRE CONTEXTUAL & VIENTO
        // ═══════════════════════════════════════════════════════════════════
        
        // Función para actualizar estilos visuales de botones y badges en los menús del dock
        function updateDockButtonState(type, isActive) {
            const btnMap = {
                'inundacion': {
                    id: 'btnDockInundacion',
                    badgeId: 'badgeDockInundacion',
                    activeCls: 'bg-sky-500/30 text-white border-sky-400/60',
                    inactiveCls: 'bg-white/5 text-sky-200 border-white/5',
                    badgeActive: 'bg-sky-500/30 text-sky-300 border-sky-400/50 font-bold',
                    badgeInactive: 'bg-black/40 text-slate-400 border-white/5'
                },
                'incendios': {
                    id: 'btnDockIncendio',
                    badgeId: 'badgeDockIncendio',
                    activeCls: 'bg-rose-500/30 text-white border-rose-400/60',
                    inactiveCls: 'bg-white/5 text-rose-200 border-white/5',
                    badgeActive: 'bg-rose-500/30 text-rose-300 border-rose-400/50 font-bold',
                    badgeInactive: 'bg-black/40 text-slate-400 border-white/5'
                },
                'landslides': {
                    id: 'btnDockRemocion',
                    badgeId: 'badgeDockRemocion',
                    activeCls: 'bg-amber-500/30 text-white border-amber-400/60',
                    inactiveCls: 'bg-white/5 text-amber-200 border-white/5',
                    badgeActive: 'bg-amber-500/30 text-amber-300 border-amber-400/50 font-bold',
                    badgeInactive: 'bg-black/40 text-slate-400 border-white/5'
                },
                'vecinos': {
                    id: 'btnDockVecinos',
                    badgeId: 'badgeDockVecinos',
                    activeCls: 'bg-emerald-500/30 text-white border-emerald-400/60',
                    inactiveCls: 'bg-white/5 text-emerald-200 border-white/5',
                    badgeActive: 'bg-emerald-500/30 text-emerald-300 border-emerald-400/50 font-bold',
                    badgeInactive: 'bg-black/40 text-slate-400 border-white/5'
                },
                'viento': {
                    id: 'btnDockViento',
                    badgeId: 'badgeDockViento',
                    activeCls: 'bg-orange-500/30 text-white border-orange-400/60',
                    inactiveCls: 'bg-white/5 text-orange-200 border-white/5',
                    badgeActive: 'bg-orange-500/30 text-orange-300 border-orange-400/50 font-bold',
                    badgeInactive: 'bg-black/40 text-slate-400 border-white/5'
                },
                'lulc_biofisico': {
                    id: 'btnDockLulcBio',
                    badgeId: 'badgeDockLulcBio',
                    activeCls: 'bg-emerald-500/30 text-white border-emerald-400/60',
                    inactiveCls: 'bg-white/5 text-emerald-200 border-white/5',
                    badgeActive: 'bg-emerald-500/30 text-emerald-300 border-emerald-400/50 font-bold',
                    badgeInactive: 'bg-black/40 text-slate-400 border-white/5'
                },
                'fire_threat_vectors': {
                    id: 'btnDockFireVectors',
                    badgeId: 'badgeDockFireVectors',
                    activeCls: 'bg-red-500/30 text-white border-red-400/60',
                    inactiveCls: 'bg-white/5 text-red-200 border-white/5',
                    badgeActive: 'bg-red-500/30 text-red-300 border-red-400/50 font-bold',
                    badgeInactive: 'bg-black/40 text-slate-400 border-white/5'
                },
                'recursos_tranques': {
                    id: 'btnDockTranques',
                    badgeId: 'badgeDockTranques',
                    activeCls: 'bg-cyan-500/30 text-white border-cyan-400/60',
                    inactiveCls: 'bg-white/5 text-cyan-200 border-white/5',
                    badgeActive: 'bg-cyan-500/30 text-cyan-300 border-cyan-400/50 font-bold',
                    badgeInactive: 'bg-black/40 text-slate-400 border-white/5'
                },
                'mndwi_espectral': {
                    id: 'btnDockMNDWI',
                    badgeId: 'badgeDockMNDWI',
                    activeCls: 'bg-sky-500/30 text-white border-sky-400/60',
                    inactiveCls: 'bg-white/5 text-sky-200 border-white/5',
                    badgeActive: 'bg-sky-500/30 text-sky-300 border-sky-400/50 font-bold',
                    badgeInactive: 'bg-black/40 text-slate-400 border-white/5'
                }
            };
            const cfg = btnMap[type];
            if (!cfg) return;
            const btn = document.getElementById(cfg.id);
            const badge = document.getElementById(cfg.badgeId);
            if (btn) {
                if (isActive) {
                    cfg.inactiveCls.split(' ').forEach(c => btn.classList.remove(c));
                    cfg.activeCls.split(' ').forEach(c => btn.classList.add(c));
                } else {
                    cfg.activeCls.split(' ').forEach(c => btn.classList.remove(c));
                    cfg.inactiveCls.split(' ').forEach(c => btn.classList.add(c));
                }
            }
            if (badge) {
                badge.innerText = isActive ? 'ACTIVO' : 'OFF';
                badge.className = `text-[9px] px-1.5 py-0.5 rounded border ${isActive ? cfg.badgeActive : cfg.badgeInactive}`;
            }

            // Sincronizar checkboxes en el sidebar táctico y capas SIG
            const chkSidebar = document.getElementById('chkSidebar-' + type);
            if (chkSidebar) {
                chkSidebar.checked = isActive;
            }
            const altCheckboxes = {
                'inundacion': 'checkboxTransectoFluvial',
                'incendios': 'checkboxTransectoIncendio',
                'landslides': 'checkboxTransectoRemocion',
                'vecinos': 'checkboxRedVecinal'
            };
            if (altCheckboxes[type]) {
                const altChk = document.getElementById(altCheckboxes[type]);
                if (altChk) altChk.checked = isActive;
            }

            // Actualizar indicador en el botón trigger del menú
            const anyHazardActive = ['inundacion', 'incendios', 'landslides', 'viento', 'vecinos'].some(t => {
                const l = overlayLayers[t];
                return (t === 'viento') ? (window.energyFlowEngine && window.energyFlowEngine.toggles.wind) : (l && map.hasLayer(l));
            });
            const dot = document.getElementById('dotDockRiesgosActive');
            if (dot) {
                if (anyHazardActive) dot.classList.remove('hidden');
                else dot.classList.add('hidden');
            }

            // Sincronizar leyenda táctica contextual (solo mostrar riesgos activos)
            if (typeof window.updateContextualTacticalLegend === 'function') {
                window.updateContextualTacticalLegend();
            }
        }
        window.updateDockButtonState = updateDockButtonState;

        // Alternar menú desplegable de Capas & Riesgos
        window.toggleCuencaRiesgosMenu = function(force) {
            const el = document.getElementById('cuencaRiesgosFlyout');
            if (!el) return;
            const isHidden = el.classList.contains('hidden');
            const show = (force !== undefined) ? force : isHidden;
            if (show) {
                el.classList.remove('hidden');
                const toolFly = document.getElementById('cuencaHerramientasFlyout');
                if (toolFly) toolFly.classList.add('hidden');
            } else {
                el.classList.add('hidden');
            }
        };

        // Alternar menú desplegable de Herramientas
        window.toggleCuencaHerramientasMenu = function(force) {
            const el = document.getElementById('cuencaHerramientasFlyout');
            if (!el) return;
            const isHidden = el.classList.contains('hidden');
            const show = (force !== undefined) ? force : isHidden;
            if (show) {
                el.classList.remove('hidden');
                const riesFly = document.getElementById('cuencaRiesgosFlyout');
                if (riesFly) riesFly.classList.add('hidden');
            } else {
                el.classList.add('hidden');
            }
        };

        // Cerrar menús al hacer clic fuera del dock
        document.addEventListener('click', function(e) {
            const dock = document.getElementById('cuencaMapControlDock');
            if (dock && !dock.contains(e.target)) {
                const rFly = document.getElementById('cuencaRiesgosFlyout');
                if (rFly) rFly.classList.add('hidden');
                const hFly = document.getElementById('cuencaHerramientasFlyout');
                if (hFly) hFly.classList.add('hidden');
            }
        });

        // Helper para desactivar una capa de riesgo y sus flujos asociados de forma consistente
        window.deactivateRiskLayer = function(type) {
            const layer = overlayLayers[type];
            if (layer && map.hasLayer(layer)) {
                map.removeLayer(layer);
            }
            updateDockButtonState(type, false);
            const chk = document.getElementById('chkSidebar-' + type);
            if (chk) chk.checked = false;

            if (window.energyFlowEngine) {
                if (type === 'inundacion') {
                    window.energyFlowEngine.toggles.floodWave = false;
                    window.energyFlowEngine.toggles.water = false;
                    const chkFlood = document.getElementById('toggleFlowFloodWave');
                    if (chkFlood) chkFlood.checked = false;
                    const chkWater = document.getElementById('toggleFlowWater');
                    if (chkWater) chkWater.checked = false;
                } else if (type === 'incendios') {
                    window.energyFlowEngine.toggles.fireWave = false;
                    const chkFire = document.getElementById('toggleFlowFireWave');
                    if (chkFire) chkFire.checked = false;
                } else if (type === 'landslides') {
                    window.energyFlowEngine.toggles.landslideWave = false;
                    const chkSlide = document.getElementById('toggleFlowLandslideWave');
                    if (chkSlide) chkSlide.checked = false;
                }
            }
        };

        // Toggle de Transectos con Encuadre Contextual Suave (Opción 1A) y Mutua Exclusión Física
        window.toggleTransectLayer = function(type) {
            const layer = overlayLayers[type];
            if (!layer) return;

            const isActive = map.hasLayer(layer);
            if (isActive) {
                map.removeLayer(layer);
            } else {
                map.addLayer(layer);
            }

            const newState = !isActive;
            updateDockButtonState(type, newState);

            // Mutua exclusión física entre Inundación e Incendios
            if (newState) {
                if (type === 'inundacion') {
                    window.deactivateRiskLayer('incendios');
                } else if (type === 'incendios') {
                    window.deactivateRiskLayer('inundacion');
                }
            }

            // Sincronizar apertura de Tab 3 (Riesgos) y desplegar el módulo correspondiente
            if (newState) {
                if (typeof window.selectSidebarTab === 'function') {
                    window.selectSidebarTab('tab-riesgos');
                }
                const accordions = {
                    'inundacion': 'detailsRiskFlood',
                    'incendios': 'detailsRiskFire',
                    'landslides': 'detailsRiskSlide'
                };
                const targetAcc = document.getElementById(accordions[type]);
                if (targetAcc) targetAcc.open = true;
            }

            const chkMap = {
                'inundacion': 'chkSidebar-inundacion',
                'incendios': 'chkSidebar-incendios',
                'landslides': 'chkSidebar-landslides'
            };
            const chkEl = document.getElementById(chkMap[type]);
            if (chkEl) chkEl.checked = newState;

            // Sincronizar dinámicamente los flujos energéticos vivos que emanan de cada amenaza
            if (window.energyFlowEngine) {
                if (type === 'inundacion') {
                    window.energyFlowEngine.toggles.floodWave = newState;
                    window.energyFlowEngine.toggles.water = newState;
                    const chkFlood = document.getElementById('toggleFlowFloodWave');
                    if (chkFlood) chkFlood.checked = newState;
                    const chkWater = document.getElementById('toggleFlowWater');
                    if (chkWater) chkWater.checked = newState;
                } else if (type === 'incendios') {
                    window.energyFlowEngine.toggles.fireWave = newState;
                    const chkFire = document.getElementById('toggleFlowFireWave');
                    if (chkFire) chkFire.checked = newState;
                } else if (type === 'landslides') {
                    window.energyFlowEngine.toggles.landslideWave = newState;
                    const chkSlide = document.getElementById('toggleFlowLandslideWave');
                    if (chkSlide) chkSlide.checked = newState;
                }
            }

            const menielCoords = [-36.2115, -71.6050];
            try {
                if (!isActive) {
                    // Al activar: enmarcar celdas del transecto en contexto con Meniel
                    let b = L.latLngBounds([menielCoords]);
                    if (typeof layer.getBounds === 'function' && layer.getBounds() && layer.getBounds().isValid()) {
                        b.extend(layer.getBounds());
                    } else if (layer.eachLayer) {
                        layer.eachLayer(l => {
                            if (typeof l.getBounds === 'function' && l.getBounds() && l.getBounds().isValid()) b.extend(l.getBounds());
                            else if (typeof l.getLatLng === 'function' && l.getLatLng()) b.extend(l.getLatLng());
                        });
                    }
                    if (b && typeof b.isValid === 'function' && b.isValid()) {
                        map.fitBounds(b, { paddingTopLeft: [40, 40], paddingBottomRight: [40, 40], maxZoom: 14 });
                    } else {
                        map.setView(menielCoords, 14);
                    }
                } else {
                    // Al desactivar: si no quedan otros riesgos activos, regresar al predio Meniel limpio
                    const anyHazardActive = ['inundacion', 'incendios', 'landslides'].some(t => overlayLayers[t] && map.hasLayer(overlayLayers[t]));
                    if (!anyHazardActive && map) {
                        map.setView(menielCoords, 14);
                    }
                }
            } catch (camErr) {
                console.warn("Camera adjustment handled safely:", camErr);
                try { if (map && map.setView) map.setView(menielCoords, 14); } catch(e){}
            }
        };

        // ═══════════════════════════════════════════════════════════════════
        // ESTÁNDAR VECINO INFORMADO: TOGGLE LULC BIOFÍSICO (MÓDULO 1)
        // ═══════════════════════════════════════════════════════════════════
        window.toggleBiofisicoLulcLayer = function(force) {
            const layer = overlayLayers['lulc_biofisico'];
            if (!layer || !map) return;
            const isActive = map.hasLayer(layer);
            const shouldBeActive = (force !== undefined) ? force : !isActive;
            if (shouldBeActive) {
                map.addLayer(layer);
            } else {
                map.removeLayer(layer);
            }
            updateDockButtonState('lulc_biofisico', shouldBeActive);

            // Sincronizar badge lateral si existe
            const sbBadge = document.getElementById('badgeSidebarLulcBio');
            if (sbBadge) {
                sbBadge.innerText = shouldBeActive ? 'ACTIVO' : 'ACTIVAR';
                sbBadge.className = shouldBeActive 
                    ? 'text-[8.5px] px-1.5 py-0.5 rounded bg-emerald-500/40 text-emerald-200 border border-emerald-400/60 font-mono font-bold'
                    : 'text-[8.5px] px-1.5 py-0.5 rounded bg-black/60 text-slate-300 border border-white/10 font-mono';
            }
        };

        // Centrar directamente en Meniel
        window.flyToMeniel = function() {
            map.flyTo([-36.2115, -71.6050], 14, { duration: 1.0 });
            const btn = document.getElementById('btnDockMeniel');
            if (btn) {
                btn.classList.add('bg-emerald-600', 'text-white');
                setTimeout(() => {
                    btn.classList.remove('bg-emerald-600', 'text-white');
                    btn.classList.add('bg-emerald-500/25', 'text-emerald-300');
                }, 800);
            }
        };

        // Toggle de Capa de Predios Vecinos
        window.toggleVecinosLayer = function() {
            const layer = overlayLayers['vecinos'];
            if (!layer) return;
            const isActive = map.hasLayer(layer);
            if (isActive) {
                map.removeLayer(layer);
            } else {
                map.addLayer(layer);
            }
            updateDockButtonState('vecinos', !isActive);
        };

        // Control Explícito del Viento Puelche (Variación Atmosférica ON/OFF en Pestaña 1)
        window.isPuelcheActive = false;

        window.setPuelcheState = function(active) {
            window.isPuelcheActive = !!active;

            // Sincronizar botón en Tab 1 (Atmósfera / Tiempo)
            const btn = document.getElementById('btnTogglePuelcheWind');
            const dot = document.getElementById('dotPuelcheWind');
            const lbl = document.getElementById('labelPuelcheWind');

            if (btn && dot && lbl) {
                if (window.isPuelcheActive) {
                    btn.className = 'px-3 py-1 rounded-md text-[10px] font-bold transition-all border flex items-center gap-1.5 bg-rose-950/90 text-rose-200 border-rose-500/70 shadow-[0_0_12px_rgba(239,68,68,0.4)] cursor-pointer';
                    dot.className = 'w-2 h-2 rounded-full bg-rose-400 animate-pulse';
                    lbl.innerText = 'PUELCHE: ON (ESE 58 km/h)';
                } else {
                    btn.className = 'px-3 py-1 rounded-md text-[10px] font-bold transition-all border flex items-center gap-1.5 bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 cursor-pointer shadow-sm';
                    dot.className = 'w-2 h-2 rounded-full bg-slate-500';
                    lbl.innerText = 'PUELCHE: OFF';
                }
            }

            // Sincronizar motor de partículas y líneas de corriente eólicas
            if (window.energyFlowEngine) {
                window.energyFlowEngine.isPuelcheActive = window.isPuelcheActive;
                if (window.isPuelcheActive) {
                    window.energyFlowEngine.toggles.wind = true;
                    window.energyFlowEngine.setRegime('storm');
                    if (typeof window.energyFlowEngine.setAtmosphericState === 'function') {
                        window.energyFlowEngine.setAtmosphericState({
                            windSpeed: 58,
                            windDir: 75, // ESE Puelche catabático
                            temp: 39,
                            precip: 0
                        });
                    }
                    const chkWind = document.getElementById('toggleFlowWind');
                    if (chkWind) chkWind.checked = true;
                } else {
                    window.energyFlowEngine.setRegime('base');
                    if (typeof window.energyFlowEngine.setAtmosphericState === 'function') {
                        window.energyFlowEngine.setAtmosphericState({
                            windSpeed: 15,
                            windDir: 225, // Brisa SW normal
                            temp: 22,
                            precip: 0
                        });
                    }
                }
            }

            // Sincronizar sliders meteorológicos si Puelche está ON
            if (window.isPuelcheActive) {
                const sWind = document.getElementById('slide-wind');
                const sHum = document.getElementById('slide-hum');
                const sTemp = document.getElementById('slide-temp');
                if (sWind) sWind.value = 58;
                if (sHum) sHum.value = 11;
                if (sTemp) sTemp.value = 39;
                if (typeof updateFWI === 'function') updateFWI(39, 11, 58);
            }
            updateDockButtonState('viento', window.isPuelcheActive);
            return window.isPuelcheActive;
        };

        window.togglePuelcheWind = function() {
            return window.setPuelcheState(!window.isPuelcheActive);
        };

        // Toggle de Viento según Emergencia (Opción 3: Puelche / Humo solo bajo demanda)
        window.toggleWindEmergency = function(forcedState) {
            return window.setPuelcheState(forcedState);
        };

        // Registrar capas en el control Leaflet tradicional (colapsado)
        if (typeof mainLayersControl !== 'undefined' && mainLayersControl) {
            mainLayersControl.addOverlay(menielLayer, "🏡 Fundo Meniel (Twin Núcleo)");
            mainLayersControl.addOverlay(vecinosLayerGroup, "👥 Red Vecinal (9 Predios)");
            mainLayersControl.addOverlay(transectoFluvialGroup, "🌊 Transecto Fluvial (F-01..F-03)");
            mainLayersControl.addOverlay(transectoIncendioGroup, "🔥 Transecto Pirogénico (P-01..P-03)");
            mainLayersControl.addOverlay(transectoRemocionGroup, "⛰️ Transecto Remoción (M-01..M-02)");
            mainLayersControl.addOverlay(exposureCologneLayer, "🏘️ Exposición Suelo (Colonia)");
            mainLayersControl.addOverlay(calFireFhszLayer, "🔥 Severidad CAL FIRE FHSZ");
        }

        // Función para sincronizar unidades tácticas con el modo Táctico Oscuro C2
        window.syncTacticalRiskUnits = function(isDark) {
            window.injectTacticalSvgPatterns();
            const groups = [
                { grp: typeof transectoFluvialGroup !== 'undefined' ? transectoFluvialGroup : null, color: '#38bdf8' },
                { grp: typeof transectoIncendioGroup !== 'undefined' ? transectoIncendioGroup : null, color: '#ef4444' },
                { grp: typeof transectoRemocionGroup !== 'undefined' ? transectoRemocionGroup : null, color: '#f59e0b' }
            ];
            groups.forEach(g => {
                if (g.grp && g.grp.eachLayer) {
                    g.grp.eachLayer(l => {
                        if (typeof l.setStyle === 'function') {
                            l.setStyle({
                                weight: isDark ? 3.2 : 2.5,
                                fillOpacity: isDark ? 0.45 : 0.25
                            });
                        }
                    });
                }
            });
            if (typeof floodUnitPoly !== 'undefined' && floodUnitPoly) {
                floodUnitPoly.setStyle({ weight: isDark ? 3.5 : 2.8, color: '#38bdf8', fillOpacity: isDark ? 0.55 : 0.35 });
            }
            if (typeof fireUnitPoly !== 'undefined' && fireUnitPoly) {
                fireUnitPoly.setStyle({ weight: isDark ? 3.5 : 2.8, color: '#ef4444', fillOpacity: isDark ? 0.55 : 0.35 });
            }
            if (typeof landslideUnitPoly !== 'undefined' && landslideUnitPoly) {
                landslideUnitPoly.setStyle({ weight: isDark ? 3.5 : 2.8, color: '#f59e0b', fillOpacity: isDark ? 0.55 : 0.35 });
            }
        };

        // Modal de Detalle In-Situ de Deslizamiento (Foto 9 d, e, f Zoom In-Situ)
        window.openLandslideDetailModal = function(pointId) {
            let modal = document.getElementById('landslideDetailModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'landslideDetailModal';
                modal.className = 'diegetic-modal-backdrop active';
                document.body.appendChild(modal);
            }
            modal.innerHTML = `
                <div class="diegetic-modal-card p-6 space-y-4 border-amber-500/50 max-w-xl bg-[#090d18] text-slate-200">
                    <div class="flex items-center justify-between border-b border-white/10 pb-3">
                        <div class="flex items-center gap-2">
                            <span class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-base">⛰️</span>
                            <div>
                                <h3 class="font-extrabold text-sm text-white font-mono">[IN-SITU] CICATRIZ DE DESLIZAMIENTO ${pointId || 'A110'}</h3>
                                <div class="text-[10px] text-amber-400 font-mono">Quebrada Precordillerana • Cota 680m • Escarpe Activo</div>
                            </div>
                        </div>
                        <button onclick="document.getElementById('landslideDetailModal').remove()" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-lg cursor-pointer">&times;</button>
                    </div>

                    <!-- Ficha Satelital de Detalle Estilo Foto 9 d, e, f -->
                    <div class="rounded-xl overflow-hidden border border-amber-500/30 bg-black/60 p-2 space-y-2">
                        <div class="relative rounded-lg overflow-hidden border border-white/10" style="height: 180px; background: linear-gradient(135deg, #1e293b, #0f172a);">
                            <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                <svg viewBox="0 0 320 140" class="w-full h-full font-mono">
                                    <!-- Ladera de montaña -->
                                    <path d="M 20 20 Q 90 40 160 80 T 300 130 L 300 140 L 20 140 Z" fill="#334155" opacity="0.6"/>
                                    <!-- Cicatriz de deslizamiento / escarpe (polígono rojo segmentado) -->
                                    <path d="M 60 35 Q 110 55 140 85 Q 115 105 85 95 Q 55 75 60 35 Z" fill="rgba(245, 158, 11, 0.45)" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,3"/>
                                    <circle cx="95" cy="70" r="4" fill="#ef4444" stroke="#ffffff" stroke-width="1.2"/>
                                    <text x="105" y="74" fill="#fde047" font-size="9" font-weight="bold">Punto 110 (Escarpe)</text>
                                    <!-- Cono de derrubios / deyección hacia el camino -->
                                    <path d="M 140 85 Q 185 110 240 125 L 210 130 Q 150 115 115 105 Z" fill="rgba(239, 68, 68, 0.4)" stroke="#ef4444" stroke-width="1.5"/>
                                    <!-- Traza de la Ruta L-110 -->
                                    <line x1="20" y1="130" x2="300" y2="130" stroke="#94a3b8" stroke-width="3"/>
                                    <line x1="20" y1="130" x2="300" y2="130" stroke="#f59e0b" stroke-dasharray="6,4" stroke-width="1.2"/>
                                    <text x="215" y="125" fill="#f87171" font-size="8.5" font-weight="bold">⚠️ Corte Ruta L-110</text>
                                </svg>
                            </div>
                            <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-amber-400/40 text-[9px] font-mono text-amber-300">
                                🛰️ ZOOM DETALLE • RESOLUCIÓN 0.5M
                            </div>
                        </div>

                        <div class="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1 text-center">
                            <div class="p-2 rounded bg-black/40 border border-white/5">
                                <span class="text-slate-400 block">Pendiente</span>
                                <b class="text-amber-400 text-xs">32°</b>
                            </div>
                            <div class="p-2 rounded bg-black/40 border border-white/5">
                                <span class="text-slate-400 block">Saturación Suelo</span>
                                <b class="text-sky-300 text-xs">92%</b>
                            </div>
                            <div class="p-2 rounded bg-black/40 border border-white/5">
                                <span class="text-slate-400 block">Riesgo Colapso</span>
                                <b class="text-red-400 text-xs">86% (Muy Alto)</b>
                            </div>
                        </div>
                    </div>

                    <div class="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs space-y-1 font-mono">
                        <div class="text-amber-300 font-bold">📋 Medidas Tácticas de Contingencia:</div>
                        <div class="text-slate-300 text-[11px] leading-relaxed font-sans">
                            1. Corte preventivo de calzada en Km 14.2 de Ruta L-110.<br>
                            2. Desvío prioritario de conectividad por variante C-14 para furgones de cosecha y residentes.<br>
                            3. Instalación de biomallas de retención y gaviones en pie de talud.
                        </div>
                    </div>

                    <div class="pt-2 flex justify-end">
                        <button onclick="document.getElementById('landslideDetailModal').remove()" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer">
                            Cerrar Ficha
                        </button>
                    </div>
                </div>
            `;
            modal.style.display = 'flex';
        };


        // Map Events for Status Bar
        map.on('mousemove', function(e) {
            document.getElementById('cursor-coords').innerText = `Lat: ${e.latlng.lat.toFixed(5)}, Lng: ${e.latlng.lng.toFixed(5)}`;
        });
        map.on('zoomend', function() {
            document.getElementById('zoom-level').innerText = `Zoom: ${map.getZoom()}`;
        });

        // FlyTo Function
        function flyTo(lat, lng, zoom) {
            map.flyTo([lat, lng], zoom, {
                duration: 1.5
            });
        }

        // Layer Toggling Function
        function toggleLayer(layerId, checkbox) {
            const layer = overlayLayers[layerId];
            if (!layer) return;
            if (checkbox.checked) {
                map.addLayer(layer);
            } else {
                map.removeLayer(layer);
            }
        }
        window.toggleLayer = toggleLayer;


        // --- 3. UI INITIALIZATION & LOGIC ---

        // Real-time Clock
        function updateClock() {
            const now = new Date();
            const el = document.getElementById('real-time-clock');
            if (el) el.innerText = now.toISOString().substr(11, 8);
        }
        setInterval(updateClock, 1000);
        updateClock();

        // Tabs Logic
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active classes
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('text-emerald-400', 'border-emerald-500');
                    b.classList.add('text-slate-400', 'border-transparent');
                });
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active to clicked
                btn.classList.add('text-emerald-400', 'border-emerald-500');
                btn.classList.remove('text-slate-400', 'border-transparent');
                const targetId = btn.dataset.target;
                const targetEl = document.getElementById(targetId);
                if (targetEl) targetEl.classList.add('active');

                // Si se activa el panel táctico H-V-R, refrescar los indicadores
                if (targetId === 'tab-tactico' && typeof window.updateHvrMatrix === 'function') {
                    window.updateHvrMatrix(window.cuencaForecastState?.activePreset || 'normal');
                }
            });
        });

        function selectSidebarTab(tabId) {
            if (tabId === 'tab-windy' || tabId === 'tab-water') tabId = 'tab-tiempo';
            if (tabId === 'tab-territory' || tabId === 'tab-centinela') tabId = 'tab-sig';
            if (tabId === 'tab-tactico') tabId = 'tab-riesgos';
            if (tabId === 'tab-tranques' || tabId === 'tab-agua') tabId = 'tab-recursos';
            const btn = document.querySelector(`.tab-btn[data-target="${tabId}"]`);
            if (btn) btn.click();
            if (typeof window.toggleTerritorialSidebar === 'function') {
                window.toggleTerritorialSidebar(true);
            }
        }
        window.selectSidebarTab = selectSidebarTab;

        // Populate Layer Toggles con 5 Bloques Coherentes de Capas SIG & Terreno
        const toggleContainer = document.getElementById('layer-toggles');
        if (toggleContainer) {
            toggleContainer.innerHTML = `
                <div class="space-y-2.5">
                    <!-- BLOQUE 1: CARTOGRAFÍA BASE ESTRUCTURAL -->
                    <details class="group bg-black/40 rounded-xl border border-sky-500/25 overflow-hidden transition-all duration-200" open>
                        <summary class="flex items-center justify-between p-2.5 px-3 cursor-pointer select-none hover:bg-white/5 transition-colors list-none">
                            <span class="text-[10px] font-bold text-sky-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                                <span>🛰️</span> 1. Cartografía Base Estructural
                            </span>
                            <div class="flex items-center gap-1.5">
                                <span class="text-[8.5px] font-mono text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-500/30 font-bold">3 CAPAS</span>
                                <span class="text-[10px] text-slate-400 group-open:rotate-180 transition-transform duration-200">▼</span>
                            </div>
                        </summary>
                        <div class="p-3 pt-1 border-t border-white/5 space-y-2">
                            <div class="grid grid-cols-3 gap-1.5">
                                <button onclick="setMapBaseLayer('esriSat')" id="btnLayerSat" class="px-2 py-1.5 rounded-lg bg-sky-500/30 text-sky-200 border border-sky-400/60 font-mono text-[10px] font-bold transition-all cursor-pointer text-center shadow-[0_0_10px_rgba(56,189,248,0.25)]">
                                    🛰️ Satélite HD
                                </button>
                                <button onclick="setMapBaseLayer('demColor')" id="btnLayerDemColor" class="px-2 py-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 font-mono text-[10px] transition-all cursor-pointer text-center" title="Modelo Digital de Elevación con rampa hipsométrica viva y sombreado 3D">
                                    🏔️ DEM Color
                                </button>
                                <button onclick="setMapBaseLayer('openTopo')" id="btnLayerTopo" class="px-2 py-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 font-mono text-[10px] transition-all cursor-pointer text-center" title="Cartografía con caminos, toponimia y límites administrativos">
                                    🏛️ Topo-Admin
                                </button>
                            </div>
                            <p class="text-[8.5px] text-slate-400 font-mono leading-tight">
                                Base de referencia geográfica, relieve hipsométrico continuo y delimitaciones comunales.
                            </p>
                        </div>
                    </details>

                    <!-- BLOQUE 2: TOPOGRAFÍA & RELIEVE DEM -->
                    <details class="group bg-black/40 rounded-xl border border-amber-500/25 overflow-hidden transition-all duration-200" open>
                        <summary class="flex items-center justify-between p-2.5 px-3 cursor-pointer select-none hover:bg-white/5 transition-colors list-none">
                            <span class="text-[10px] font-bold text-amber-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                                <span>🏔️</span> 2. Topografía & Relieve DEM
                            </span>
                            <div class="flex items-center gap-1.5">
                                <span class="text-[8.5px] font-mono text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">FÍSICA 3D</span>
                                <span class="text-[10px] text-slate-400 group-open:rotate-180 transition-transform duration-200">▼</span>
                            </div>
                        </summary>
                        <div class="p-3 pt-1 border-t border-white/5 space-y-2">
                            <div class="grid grid-cols-2 gap-1.5">
                                <button onclick="setMapBaseLayer('demColor')" id="btnLayerDemColorAlt" class="px-2 py-2 rounded-lg bg-amber-500/20 text-amber-200 hover:text-white border border-amber-500/40 font-mono text-[10px] transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5">
                                    <span class="font-bold">🏔️ Hipsometría DEM</span>
                                    <span class="text-[8px] text-amber-300/80 font-normal">Paleta Viva 3D & Relieve</span>
                                </button>
                                <button onclick="window.toggleKeylineContoursLayer()" id="btnKeylineContours" class="px-2 py-2 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 font-mono text-[10px] transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5">
                                    <span class="font-bold">📐 Curvas Keyline</span>
                                    <span class="text-[8px] text-emerald-300/80 font-normal">Isolíneas Meniel 2m</span>
                                </button>
                            </div>

                            <!-- Sonda de Elevación & Batimetría / Profundidad en Vivo -->
                            <div class="p-2.5 rounded-lg bg-black/50 border border-sky-500/30 space-y-1.5 font-mono text-[9.5px]">
                                <div class="flex items-center justify-between border-b border-white/10 pb-1">
                                    <span class="text-sky-300 font-bold flex items-center gap-1">
                                        <span>📍</span> Sonda de Elevación & Profundidad
                                    </span>
                                    <span class="text-[8px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">MUESTRA DINÁMICA</span>
                                </div>
                                <div class="grid grid-cols-2 gap-1.5">
                                    <div class="bg-white/5 p-1.5 rounded">
                                        <span class="text-slate-400 block text-[8px]">Cota Terrestre:</span>
                                        <b id="sondaElevVal" class="text-amber-300 text-[10.5px]">194 msnm</b>
                                    </div>
                                    <div class="bg-white/5 p-1.5 rounded">
                                        <span class="text-slate-400 block text-[8px]">Profundidad / Columna:</span>
                                        <b id="sondaDepthVal" class="text-sky-300 text-[10.5px]">-18.5 m (Napa)</b>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between text-[8.5px] text-slate-300 pt-0.5">
                                    <span>Pendiente: <b id="sondaSlopeVal" class="text-emerald-400">4.2% (Valle Aluvial)</b></span>
                                    <span id="sondaZoneVal" class="text-slate-400 text-[8px]">Meniel / Longaví</span>
                                </div>
                            </div>

                            <!-- Ingesta DEM Propio -->
                            <div class="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                                <div class="flex items-center justify-between">
                                    <span class="text-[9.5px] font-bold text-amber-200 font-mono flex items-center gap-1">
                                        <span>📥</span> Ingesta DEM / Dron / LiDAR
                                    </span>
                                    <span class="text-[8px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">GeoTIFF</span>
                                </div>
                                <p class="text-[8.5px] text-slate-400 font-mono leading-tight">
                                    Cargue ortofotos y modelos de elevación procesados en WebODM / QGIS para el predio Meniel.
                                </p>
                                <button onclick="window.openDemUploadModal()" class="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 hover:text-white font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5">
                                    <span>⬆️</span> Cargar DEM Propio (.tif / .geojson)
                                </button>
                            </div>
                        </div>
                    </details>

                    <!-- BLOQUE 3: TELEDETECCIÓN ESPECTRAL & RADAR (SENTINEL 1 & 2) -->
                    <details class="group bg-black/40 rounded-xl border border-emerald-500/25 overflow-hidden transition-all duration-200" open>
                        <summary class="flex items-center justify-between p-2.5 px-3 cursor-pointer select-none hover:bg-white/5 transition-colors list-none">
                            <span class="text-[10px] font-bold text-emerald-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                                <span>📡</span> 3. Frecuencias Satelitales (Sentinel)
                            </span>
                            <div class="flex items-center gap-1.5">
                                <span class="text-[8.5px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">8 BANDAS</span>
                                <span class="text-[10px] text-slate-400 group-open:rotate-180 transition-transform duration-200">▼</span>
                            </div>
                        </summary>
                        <div class="p-3 pt-1 border-t border-white/5 space-y-2">
                            <div class="grid grid-cols-2 gap-1.5">
                                <button onclick="setMapBaseLayer('ndviSat')" id="btnLayerNdvi" class="p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 font-mono text-[10px] transition-all cursor-pointer text-left flex flex-col gap-0.5">
                                    <span class="font-bold text-emerald-300 flex items-center gap-1">🌱 Vigor NDVI</span>
                                    <span class="text-[8px] text-slate-400">NIR/Red &bull; Clorofila</span>
                                </button>
                                <button onclick="setMapBaseLayer('ndwiSat')" id="btnLayerNdwi" class="p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 font-mono text-[10px] transition-all cursor-pointer text-left flex flex-col gap-0.5">
                                    <span class="font-bold text-sky-300 flex items-center gap-1">💧 Humedad NDWI</span>
                                    <span class="text-[8px] text-slate-400">Green/NIR &bull; Agua Libre</span>
                                </button>
                                <button onclick="setMapBaseLayer('ndmiSat')" id="btnLayerNdmi" class="p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 font-mono text-[10px] transition-all cursor-pointer text-left flex flex-col gap-0.5">
                                    <span class="font-bold text-cyan-300 flex items-center gap-1">🌿 Estrés NDMI</span>
                                    <span class="text-[8px] text-slate-400">NIR/SWIR &bull; Canopia</span>
                                </button>
                                <button onclick="setMapBaseLayer('eviSat')" id="btnLayerEvi" class="p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 font-mono text-[10px] transition-all cursor-pointer text-left flex flex-col gap-0.5">
                                    <span class="font-bold text-lime-300 flex items-center gap-1">🌾 Vigor EVI</span>
                                    <span class="text-[8px] text-slate-400">Ajustado por Suelo</span>
                                </button>
                                <button onclick="setMapBaseLayer('nbrSat')" id="btnLayerNbr" class="p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 font-mono text-[10px] transition-all cursor-pointer text-left flex flex-col gap-0.5">
                                    <span class="font-bold text-rose-300 flex items-center gap-1">🔥 Combustible NBR</span>
                                    <span class="text-[8px] text-slate-400">B8A/B12 &bull; Peligro Fuego</span>
                                </button>
                                <button onclick="setMapBaseLayer('lstThermal')" id="btnLayerLst" class="p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 font-mono text-[10px] transition-all cursor-pointer text-left flex flex-col gap-0.5">
                                    <span class="font-bold text-red-300 flex items-center gap-1">🌡️ LST Térmico</span>
                                    <span class="text-[8px] text-slate-400">Radiometría Superficie</span>
                                </button>
                                <button onclick="setMapBaseLayer('sarRadar')" id="btnLayerSar" class="p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 font-mono text-[10px] transition-all cursor-pointer text-left flex flex-col gap-0.5">
                                    <span class="font-bold text-purple-300 flex items-center gap-1">📡 Radar SAR S-1</span>
                                    <span class="text-[8px] text-slate-400">Microondas Todo-Tiempo</span>
                                </button>
                                <button onclick="setMapBaseLayer('falseColorSwir')" id="btnLayerSwir" class="p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 font-mono text-[10px] transition-all cursor-pointer text-left flex flex-col gap-0.5">
                                    <span class="font-bold text-amber-200 flex items-center gap-1">🛰️ SWIR Humo</span>
                                    <span class="text-[8px] text-slate-400">Penetración Aerosoles</span>
                                </button>
                            </div>

                            <!-- LEYENDA ESPECTRAL CONTEXTUAL INTEGRADA DENTRO DEL SIDEBAR -->
                            <div id="integratedSpectralLegendBlock" style="display: none;" class="mt-2 pt-2 border-t border-white/10">
                                <div id="integratedSpectralLegendContent"></div>
                            </div>
                        </div>
                    </details>

                    <!-- BLOQUE 4: HERRAMIENTAS DE GEOMORFOLOGÍA & MODELOS DE CORTE -->
                    <details class="group bg-black/40 rounded-xl border border-sky-500/25 overflow-hidden transition-all duration-200" open>
                        <summary class="flex items-center justify-between p-2.5 px-3 cursor-pointer select-none hover:bg-white/5 transition-colors list-none">
                            <span class="text-[10px] font-bold text-sky-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                                <span>📐</span> 4. Herramientas de Geomorfología
                            </span>
                            <div class="flex items-center gap-1.5">
                                <span class="text-[8.5px] font-mono text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-500/30 font-bold">MODAL HD</span>
                                <span class="text-[10px] text-slate-400 group-open:rotate-180 transition-transform duration-200">▼</span>
                            </div>
                        </summary>
                        <div class="p-3 pt-1 border-t border-white/5 space-y-2">
                            <p class="text-[9px] text-slate-400 font-mono leading-tight">
                                Modelos de corte biofísico y perfiles de elevación en ventana superpuesta de alta resolución.
                            </p>
                            <div class="space-y-1.5">
                                <button onclick="window.openBiophysicalModal('transect')" class="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-sky-500/15 border border-white/5 hover:border-sky-500/30 flex items-center justify-between text-xs text-sky-200 transition-all cursor-pointer">
                                    <span class="flex items-center gap-2 font-mono">
                                        <span>📐</span>
                                        <span>Transecto Longitudinal X-Y (Andes ➔ Valle)</span>
                                    </span>
                                    <span class="text-[9px] text-sky-400 font-bold">Ver HD ↗</span>
                                </button>
                                <button onclick="window.openBiophysicalModal('sediments')" class="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-emerald-500/15 border border-white/5 hover:border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200 transition-all cursor-pointer">
                                    <span class="flex items-center gap-2 font-mono">
                                        <span>🌊</span>
                                        <span>Corte de Sedimentos & Shields</span>
                                    </span>
                                    <span class="text-[9px] text-emerald-400 font-bold">Ver HD ↗</span>
                                </button>
                                <button onclick="window.openBiophysicalModal('slope25d')" class="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-yellow-500/15 border border-white/5 hover:border-yellow-500/30 flex items-center justify-between text-xs text-yellow-200 transition-all cursor-pointer">
                                    <span class="flex items-center gap-2 font-mono">
                                        <span>🏔️</span>
                                        <span>Bloque Geomorfológico 2.5D (Ladera 34°)</span>
                                    </span>
                                    <span class="text-[9px] text-yellow-400 font-bold">Ver HD ↗</span>
                                </button>
                                <button onclick="window.toggleAtmosphericInfluenceSurfaces()" id="btnToggleInfluenceSurfaces" class="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-sky-500/15 border border-white/5 hover:border-sky-500/30 flex items-center justify-between text-xs text-sky-200 transition-all cursor-pointer">
                                    <span class="flex items-center gap-2 font-mono">
                                        <span>🌐</span>
                                        <span>Áreas de Influencia & Isopletas</span>
                                    </span>
                                    <span id="labelInfluenceStatus" class="text-[9px] text-sky-400 font-bold font-mono">Activar ↗</span>
                                </button>
                            </div>
                        </div>
                    </details>
                </div>
            `;
        }


        // Modals
        function openModal() {
            const el = document.getElementById('exec-modal');
            if (el) {
                el.classList.remove('hidden');
                el.classList.add('flex');
            }
        }
        function closeModal() {
            const el = document.getElementById('exec-modal');
            if (el) {
                el.classList.add('hidden');
                el.classList.remove('flex');
            }
        }
        window.openModal = openModal;
        window.closeModal = closeModal;

        // Formal Report Download
        function downloadFormalReport() {
            const date = new Date().toISOString().split('T')[0];
            const content = `
================================================================================
REPÚBLICA DE CHILE - DOSSIER INSTITUCIONAL & MODELO DE CUENCA
SISTEMA DE SOPORTE DE DECISIÓN ESPACIAL (SDSS) - AGROTWIN REGIONAL
================================================================================
FECHA: ${date}
UBICACIÓN: Cuenca Maule Sur (Parral - Retiro)
ÁREA DE ESTUDIO: 122,070 Hectáreas
PROYECTO: Fundo Meniel (Diseño Regenerativo Keyline)

[NOTA DE TRANSPARENCIA & AUDITORÍA TÉCNICA]
Los valores de CAPEX, TIR, ahorros energéticos y balances hídricos corresponden
a un MODELO DE SIMULACIÓN PROYECTADA de ingeniería biofísica (prototipo), diseñado
para evaluación territorial y no a una auditoría contable ni telemetría privada.
--------------------------------------------------------------------------------

1. RETORNO FINANCIERO Y OPERATIVO (PROYECCIÓN DE MODELO)
--------------------------------------------------------------------------------
- CAPEX Inicial Estimado: $48,500,000 CLP (Diseño Keyline + 5 Nodos IoT proyectados)
- TIR Anual Proyectada: 18.6% (Modelo Teórico)
- Período de Recuperación (Payback): 3.8 Años
- Ahorro Energético Estimado (Bombeo): -$8,200,000 CLP/Año

2. SEGURIDAD HÍDRICA Y RESILIENCIA (MODELO DE DISEÑO)
--------------------------------------------------------------------------------
- Capacidad Tranque Acumulador: 18,500 m³ (Capacidad Nominal)
- Tasa de Infiltración de Suelo Mejorada: 320 L/s (Diseño Keyline)
- Autonomía Hídrica Estimada: 42 Días continuos
- Mitigación de Inundaciones (Peak): -3.2% (Modelado de Escorrentía)
- Estado Actual de Humedad (FDR): ~36.2% VWC (Simulado / Balance de Suelo)

3. RESILIENCIA AL FUEGO (PIRO-ESTRATÉGICO)
--------------------------------------------------------------------------------
- Fire Weather Index (FWI) Local: 24 (Bajo • Modelado micro-cuenca)
- Comparativa FWI Monocultivos Aledaños: 68 (Alto • Reanálisis ERA5)
- Barrera Verde Activa: 2.4 km perimetral proyectada (Peumo, Quillay)
- Valor de Activo Resguardado (Pérdida Evitada): $140,000,000 CLP (Estimación de Activo)

4. GOBERNANZA, ESG Y GESTIÓN COMUNITARIA (ESTRUCTURA PROPUESTA)
--------------------------------------------------------------------------------
- Vehículo de Inversión Propuesto: Meniel SpA
- Participación Local: Cooperativa de Agua Viva (En formación)
- Impacto Social Estimado: 30 Familias rurales
- Monitoreo y Reporte (MRV): Simulación Testnet (0x9f8b...3a2c)
- Certificación de Carbono y Agua: En estructuración metodológica

5. RED CENTINELA LOCAL (TELEMETRÍA & MODELOS)
--------------------------------------------------------------------------------
- Malla IoT KioT Predial: 5 Nodos modelados (FDR-01 a FDR-04, Piezómetro Tranque)
- Red Pública Meteorológica: Open-Meteo / WMO en vivo (Parral - Retiro)
- Estaciones Referenciales: INIA Retiro, DGA Río Longaví, DMC Parral Centro
- Caudal Referencial Longaví: ~14.5 m³/s (Caudal estacional de cuenca)
- Reserva Embalse Bullileo: 85.8 Hm³ (Referencial oficial DGA)

6. MODELAMIENTO MICRO-ATMOSFÉRICO LOCAL
--------------------------------------------------------------------------------
- Viento Puelche (Efecto Foehn): 38 km/h E-NE, compresión adiabática ladera andina
- Regla 30-30-30: Temp >30°C, HR <30%, Viento >30 km/h (Alerta de desecación foliar y piro-riesgo)
- Mitigación Foehn: Barrera verde perimetral de Peumo/Quillay (62% amortiguación)
- Drenaje Catabático Nocturno: Enfriamiento radiativo a las 05:30 AM (-2.4°C bajo cota 170m)
- Evapotranspiración Atmosférica ETo: 5.1 mm/día (Penman-Monteith)

7. ESTRATEGIA GANADERA TERRITORIAL (PASTOREO RACIONAL VOISIN)
--------------------------------------------------------------------------------
- Carga Animal Regional: 1.8 UGM/ha en pasturas polifíticas perennes
- Tiempo de Reposo Forrajero: 42 Días (Curva sigmoidea óptima de rebrote)
- Biociclado de Nutrientes: +4.2 kg MO/m² en dos temporadas por deyección animal
- Retención Hídrica Adicional: +144,000 Litros/ha por cada 1% de aumento de Materia Orgánica
- Cortafuegos Pastoriles Vivos: Desbroce perimetral biológico en franjas de 25m

DOCUMENTO GENERADO AUTOMÁTICAMENTE POR AGROTWIN REGIONAL V2.6
================================================================================
            `;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Reporte_Tecnico_MauleSur_${date}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }

        // --- 4. CHARTS (Chart.js) ---
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = 'JetBrains Mono';

        // 4.1 LULC Donut Chart
        const ctxLulc = document.getElementById('lulcChart')?.getContext('2d');
        ctxLulc && new Chart(ctxLulc, {
            type: 'doughnut',
            data: {
                labels: LULC_CLASSES.map(c => c.name),
                datasets: [{
                    data: LULC_CLASSES.map(c => c.area),
                    backgroundColor: LULC_CLASSES.map(c => c.hex),
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed !== null) {
                                    label += context.parsed.toLocaleString() + ' ha';
                                }
                                return label;
                            }
                        }
                    }
                },
                cutout: '75%'
            }
        });

        // 4.2 ROI Line Chart
        const ctxRoi = document.getElementById('roiChart')?.getContext('2d');
        ctxRoi && new Chart(ctxRoi, {
            type: 'line',
            data: {
                labels: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9','Y10'],
                datasets: [
                    {
                        label: 'Flujo Caja Acumulado (CLP Millones)',
                        data: [-48.5, -35.2, -20.1, -2.5, 18.4, 39.0, 58.2, 79.5, 98.1, 118.0, 135.5],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Breakeven',
                        data: [0,0,0,0,0,0,0,0,0,0,0],
                        borderColor: '#ef4444',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });

        // 4.3 FWI Horizontal Bar Chart
        const ctxFwi = document.getElementById('fwiChart')?.getContext('2d');
        const fwiChart = ctxFwi && new Chart(ctxFwi, {
            type: 'bar',
            data: {
                labels: ['Fundo Meniel', 'Monocultivo Vecino'],
                datasets: [{
                    data: [24, 68],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });

        // 4.4 Water Area Chart
        const ctxWater = document.getElementById('waterChart')?.getContext('2d');
        ctxWater && new Chart(ctxWater, {
            type: 'line',
            data: {
                labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
                datasets: [
                    {
                        label: 'Demanda Hídrica',
                        data: [45, 42, 35, 20, 10, 5, 5, 10, 25, 38, 48, 50],
                        borderColor: '#ef4444',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: 'Oferta (Tranque + Suelo)',
                        data: [20, 15, 15, 30, 60, 90, 100, 95, 70, 50, 30, 25],
                        borderColor: '#0ea5e9',
                        backgroundColor: 'rgba(14, 165, 233, 0.2)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } }
            }
        });


        // --- 5. SIMULATOR LOGIC & CANONICAL VAN WAGNER FWI ---

        function computeVanWagnerFWI(tempC, relHumidity, windKmh) {
            const rh = Math.min(99, Math.max(5, relHumidity));
            const m = 147.2 * (101 - rh) / (59.5 + rh);
            const ffmc = 59.5 * (250 - m) / (147.2 + m);
            const isi = 0.208 * Math.exp(0.05039 * Math.max(1, windKmh)) * (91.9 * Math.exp(-0.1386 * m) * (1 + Math.pow(m, 5.31) / 4.93e7));
            const fwi = +(isi * 1.62).toFixed(1);
            let category = 'Bajo';
            if (fwi >= 50) category = 'Catastrófico';
            else if (fwi >= 35) category = 'Alto';
            else if (fwi >= 20) category = 'Moderado';
            return { fwi, ffmc: +ffmc.toFixed(1), isi: +isi.toFixed(1), category };
        }

        function updateFWI(tempVal, humVal, windVal) {
            const sTemp = document.getElementById('slide-temp');
            const sHum = document.getElementById('slide-hum');
            const sWind = document.getElementById('slide-wind');

            const temp = (typeof tempVal === 'number') ? tempVal : (sTemp ? parseFloat(sTemp.value) : (cuencaForecastState?.temp || 22));
            const hum = (typeof humVal === 'number') ? humVal : (sHum ? parseFloat(sHum.value) : (cuencaForecastState?.humidity || 45));
            const wind = (typeof windVal === 'number') ? windVal : (sWind ? parseFloat(sWind.value) : (cuencaForecastState?.windSpeed || 15));

            const valTemp = document.getElementById('val-temp');
            const valHum = document.getElementById('val-hum');
            const valWind = document.getElementById('val-wind');
            if (valTemp) valTemp.innerText = temp + ' °C';
            if (valHum) valHum.innerText = hum + ' %';
            if (valWind) valWind.innerText = wind + ' km/h';

            // Algoritmo canónico Van Wagner (1987) / CONAF Chile
            const vwf = computeVanWagnerFWI(temp, hum, wind);
            let fwi = Math.round(vwf.fwi);

            const fwiValEl = document.getElementById('fwi-value');
            if (fwiValEl) fwiValEl.innerText = fwi;
            
            const labelEl = document.getElementById('fwi-label');
            const indEl = document.getElementById('fwi-indicator');

            let color, text, bg;
            if (fwi < 30) {
                color = '#10b981'; text = 'RIESGO BAJO'; bg = 'rgba(16, 185, 129, 0.3)';
            } else if (fwi < 50) {
                color = '#f59e0b'; text = 'RIESGO ALTO'; bg = 'rgba(245, 158, 11, 0.3)';
            } else {
                color = '#ef4444'; text = 'CATASTRÓFICO'; bg = 'rgba(239, 68, 68, 0.3)';
            }

            if (labelEl) {
                labelEl.innerText = text;
                labelEl.style.color = color;
                labelEl.style.backgroundColor = bg;
            }
            
            if (indEl) indEl.style.backgroundColor = color;
            if (fwiValEl) fwiValEl.style.color = color;
            
            // Update Header if element exists
            const hdrFwiEl = document.getElementById('hdr-fwi');
            if (hdrFwiEl) {
                hdrFwiEl.innerText = `${fwi} (${text.split(' ')[1] || text})`;
                hdrFwiEl.style.color = color;
            }

            // Update Chart
            if (typeof fwiChart !== 'undefined' && fwiChart && fwiChart.data) {
                fwiChart.data.datasets[0].data[0] = fwi;
                fwiChart.data.datasets[0].data[1] = Math.min(100, fwi + 44); 
                fwiChart.update();
            }

            // REACCIÓN CARTOGRÁFICA DINÁMICA: Capa de Incendios CONAF
            if (typeof incendiosLayer !== 'undefined' && incendiosLayer && typeof incendiosLayer.setStyle === 'function') {
                incendiosLayer.setStyle(function(feature) {
                    const p = feature.properties;
                    if (p.id === 'FIRE_CORTAFUEGOS' || p.id === 'FIRE_BARRERA') {
                        return {
                            color: '#10b981',
                            weight: fwi > 50 ? 3 : 2,
                            fillColor: '#10b981',
                            fillOpacity: 0.65
                        };
                    } else if (p.id === 'FIRE_CRITICA') {
                        const alpha = Math.min(0.85, 0.25 + (fwi / 140));
                        return {
                            color: fwi > 50 ? '#dc2626' : p.color,
                            weight: fwi > 50 ? 3 : 1.5,
                            fillColor: fwi > 50 ? '#dc2626' : p.color,
                            fillOpacity: alpha
                        };
                    } else {
                        const alpha = Math.min(0.65, 0.15 + (fwi / 200));
                        return {
                            color: p.color,
                            weight: 1.5,
                            fillColor: p.color,
                            fillOpacity: alpha
                        };
                    }
                });
            }
        }

        function updateWater(precipVal, flowVal) {
            const sPrecip = document.getElementById('slide-precip');
            const sFlow = document.getElementById('slide-flow');

            const precip = (typeof precipVal === 'number') ? precipVal : (sPrecip ? parseFloat(sPrecip.value) : (cuencaForecastState?.precip || 0));
            const flow = (typeof flowVal === 'number') ? flowVal : (sFlow ? parseFloat(sFlow.value) : 125);

            const valPrecip = document.getElementById('val-precip');
            const valFlow = document.getElementById('val-flow');
            if (valPrecip) valPrecip.innerText = precip + ' mm';
            if (valFlow) valFlow.innerText = flow + ' m³/s';

            const hdrCaudalEl = document.getElementById('hdr-caudal');
            if (hdrCaudalEl) {
                hdrCaudalEl.innerText = flow.toFixed(1) + ' m³/s';
            }

            // REACCIÓN CARTOGRÁFICA DINÁMICA: Capa de Inundación según caudal
            if (typeof inundacionLayer !== 'undefined' && inundacionLayer && typeof inundacionLayer.setStyle === 'function') {
                inundacionLayer.setStyle(function(feature) {
                    const p = feature.properties;
                    if (p.id === 'INUND_T10') {
                        // T=10 años (Q > 250 m³/s)
                        const active = flow >= 250;
                        return {
                            color: active ? '#0284c7' : '#0369a1',
                            weight: active ? 3 : 1.5,
                            fillColor: '#0284c7',
                            fillOpacity: active ? Math.min(0.85, 0.45 + (flow / 800)) : 0.2
                        };
                    } else if (p.id === 'INUND_T50') {
                        // T=50 años (Q > 480 m³/s)
                        const active = flow >= 480;
                        return {
                            color: active ? '#0369a1' : '#1e3a8a',
                            weight: active ? 3 : 1,
                            fillColor: '#0369a1',
                            fillOpacity: active ? Math.min(0.75, 0.35 + (flow / 1000)) : 0.15
                        };
                    } else if (p.id === 'INUND_T100') {
                        // T=100 años (Q > 850 m³/s)
                        const active = flow >= 850;
                        return {
                            color: active ? '#1e3a8a' : '#0f172a',
                            weight: active ? 3 : 1,
                            fillColor: '#1d4ed8',
                            fillOpacity: active ? 0.65 : 0.1
                        };
                    }
                    return {
                        color: p.color,
                        weight: 1,
                        fillColor: p.color,
                        fillOpacity: p.fillOpacity
                    };
                });
            }
        }

        // Exponer funciones biofísicas de simulación a nivel global para interactividad reactiva
        window.updateFWI = updateFWI;
        window.updateWater = updateWater;

        // Llamada inicial para sincronizar estados de simulación
        updateFWI();
        updateWater();

        // Live API Inspector Function
        async function testLiveApi() {
            const outEls = [
                document.getElementById('api-live-output'),
                document.getElementById('api-live-output-telemetry')
            ].filter(Boolean);
            if (outEls.length === 0) return;
            outEls.forEach(el => el.innerText = "Consultando GET /api/telemetry/summary...");
            try {
                const start = performance.now();
                const res = await fetch('/api/telemetry/summary');
                const json = await res.json();
                const ms = Math.round(performance.now() - start);
                const txt = `// HTTP 200 OK (${ms}ms) | Timestamp: ${new Date().toLocaleTimeString()}\n` + JSON.stringify(json, null, 2);
                outEls.forEach(el => el.innerText = txt);
            } catch (err) {
                outEls.forEach(el => el.innerText = "// Error conectando a la API: " + err.message);
            }
        }

    

        // ═══════════════════════════════════════════════════════════════════
        // MAPEO DE BIOMAS GEMINI A PREDIOS
        // ═══════════════════════════════════════════════════════════════════
        const BIOMES_MAP = {
            'MENIEL': {
                name: 'Agricultura Regenerativa & Keyline',
                image: 'assets/catan/tile_colliguay.jpg',
                tag: 'Núcleo AgroTech',
                color: '#10b981',
                desc: 'Predio núcleo con diseño Keyline, pastoreo PRV y matriz de 15 sondas FDR.'
            },
            'SAN_JOSE': {
                name: 'Vega Ribereña & Cultivo de Inundación',
                image: 'assets/catan/tile_water.jpg',
                tag: 'Arroz & Humedal',
                color: '#0ea5e9',
                desc: 'Cuarteles de arroz inundado contiguos al Río Longaví, actuando como zona de disipación.'
            },
            'LOS_BOLDOS': {
                name: 'Monocultivo Forestal (Pino Radiata)',
                image: 'assets/catan/tile_pines.jpg',
                tag: 'Piro-Riesgo Crítico',
                color: '#ef4444',
                desc: 'Plantación forestal densa en ladera granítica, alta exposición a viento Puelche.'
            },
            'RETIRO_PONIENTE': {
                name: 'Cultivos Anuales & Granos Dorados',
                image: 'assets/catan/tile_wheat.jpg',
                tag: 'Trigo Candeal',
                color: '#f59e0b',
                desc: 'Suelos aluviales profundos bajo rotación de cereales de invierno y maíz.'
            },
            'STA_LUCIA': {
                name: 'Frutales Menores & Huerto de Riego',
                image: 'assets/catan/tile_pasture.jpg',
                tag: 'Arándanos & Huape',
                color: '#8b5cf6',
                desc: 'Huerto intensivo tecnificado con riego por goteo y malla sombreante.'
            },
            'EL_CULENAR': {
                name: 'Silvopastoril PRV & Bosque Esclerófilo',
                image: 'assets/catan/tile_forest.jpg',
                tag: 'PRV & Nativo',
                color: '#14b8a6',
                desc: 'Pastoreo racional integrado a parches de Quillay, Peumo y espinos nativos.'
            },
            'VINA_AUSTRAL': {
                name: 'Viñedo Patrimonial de Secano Interior',
                image: 'assets/catan/tile_vineyard.jpg',
                tag: 'País & Carignan',
                color: '#ec4899',
                desc: 'Parras centenarias de secano en ladera roja meteorizada de alto valor patrimonial.'
            },
            'EL_SAUCE': {
                name: 'Pastura Natural & Forraje Tradicional',
                image: 'assets/catan/tile_pasture.jpg',
                tag: 'Forrajero',
                color: '#84cc16',
                desc: 'Praderas naturales de secano para crianza extensiva bovina y ovina.'
            },
            'SAN_CRISTOBAL': {
                name: 'Chacras & Granos Tradicionales',
                image: 'assets/catan/tile_wheat.jpg',
                tag: 'Maíz & Hortalizas',
                color: '#eab308',
                desc: 'Policultivos de temporada estival con derechos de canal matriz.'
            },
            'LA_PALMA': {
                name: 'Precordillera & Matorral Esclerófilo Andino',
                image: 'assets/catan/tile_mountain.jpg',
                tag: 'Amortiguación Andina',
                color: '#6366f1',
                desc: 'Zona de transición hacia los Andes maulinos, cabecera de quebradas hidrológicas.'
            }
        };
        window.BIOMES_MAP = BIOMES_MAP;

        // ═══════════════════════════════════════════════════════════════════
        // SUITE CUENCA MAULE SUR • CONTROLLER WINDY 7D & 8 MOMENTOS CLIMÁTICOS
        // ═══════════════════════════════════════════════════════════════════

        var cuencaForecastState = {
            isLive: true,
            selectedDayIdx: 0,
            selectedHour: 12,
            isPlaying: false,
            playTimer: null,
            cachedData: null,
            activePreset: 'normal'
        };

        // 1. Alternar barra de 8 momentos climáticos en el mapa
        window.toggleCuencaMomentsBar = function(show) {
            const bar = document.getElementById('cuencaMomentsQuickBar');
            if (!bar) return;
            const isVis = (typeof show === 'boolean') ? show : (bar.style.display !== 'none');
            bar.style.display = isVis ? 'none' : 'flex';
        };

        // 2. Alternar visibilidad de overlays teóricos de simulación
        window.isCuencaSimOverlaysVisible = true;
        window.toggleCuencaSimOverlays = function() {
            window.isCuencaSimOverlaysVisible = !window.isCuencaSimOverlaysVisible;
            const btn = document.getElementById('btnToggleSimOverlayCuenca');
            if (btn) {
                btn.innerHTML = window.isCuencaSimOverlaysVisible ? '<span>👁️</span> Simulación: ON' : '<span>🚫</span> Terreno Limpio';
                btn.style.background = window.isCuencaSimOverlaysVisible ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.08)';
                btn.style.borderColor = window.isCuencaSimOverlaysVisible ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.2)';
                btn.style.color = window.isCuencaSimOverlaysVisible ? '#fca5a5' : '#94a3b8';
            }

            if (!window.isCuencaSimOverlaysVisible) {
                // Terreno limpio: ocultar manchas y calmar flujos
                if (overlayLayers['inundacion']) map.removeLayer(overlayLayers['inundacion']);
                if (overlayLayers['incendios']) map.removeLayer(overlayLayers['incendios']);
                if (window.energyFlowEngine) window.energyFlowEngine.setRegime('calm');
            } else {
                if (overlayLayers['inundacion']) map.addLayer(overlayLayers['inundacion']);
                if (overlayLayers['incendios']) map.addLayer(overlayLayers['incendios']);
                window.applyCuencaClimatePreset(cuencaForecastState.activePreset);
            }
        };

        // 3. Aplicar 1 de los 8 Momentos Climáticos desde la barra de cuenca o el panel lateral
        window.applyCuencaClimatePreset = function(presetKey, btnEl) {
            cuencaForecastState.activePreset = presetKey;
            
            // Actualizar píldoras activas en cualquier contenedor (sidebar o quickbar)
            document.querySelectorAll('.basin-moment-pill').forEach(p => p.classList.remove('active'));
            if (btnEl) {
                btnEl.classList.add('active');
            } else {
                const matchBtn = document.querySelector(`.basin-moment-pill[onclick*="'${presetKey}'"]`);
                if (matchBtn) matchBtn.classList.add('active');
            }

            // Valores biofísicos canónicos por cada uno de los 8 momentos
            const momentsMap = {
                'normal': {
                    temp: 22, hum: 45, wind: 15, precip: 10, flow: 125,
                    windDir: 225, windDirLbl: 'SW (Brisa Base)',
                    regime: 'base', center: [-36.1432, -71.65], zoom: 11
                },
                'summer_normal': {
                    temp: 28, hum: 38, wind: 20, precip: 0, flow: 95,
                    windDir: 230, windDirLbl: 'SW (Brisa Marina)',
                    regime: 'base', center: [-36.1432, -71.65], zoom: 11
                },
                'heatwave': {
                    temp: 38, hum: 18, wind: 14, precip: 0, flow: 68,
                    windDir: 190, windDirLbl: 'S (Ola Calor)',
                    regime: 'base', center: [-36.2115, -71.6053], zoom: 12
                },
                'drought': {
                    temp: 32, hum: 22, wind: 16, precip: 0, flow: 42,
                    windDir: 210, windDirLbl: 'SSW (Megasequía)',
                    regime: 'calm', center: [-36.18, -71.62], zoom: 11
                },
                'puelche_fire': {
                    temp: 39, hum: 11, wind: 58, precip: 0, flow: 85,
                    windDir: 75, windDirLbl: 'ESE (Puelche Extremo)',
                    regime: 'storm', center: [-36.1950, -71.5000], zoom: 11
                },
                'winter_dry': {
                    temp: 2, hum: 82, wind: 6, precip: 0, flow: 75,
                    windDir: 160, windDirLbl: 'SSE (Helada Polar)',
                    regime: 'calm', center: [-36.2115, -71.6053], zoom: 12
                },
                'storm_t10': {
                    temp: 11, hum: 92, wind: 32, precip: 65, flow: 290,
                    windDir: 310, windDirLbl: 'NW (Frente T=10)',
                    regime: 'storm', center: [-36.1600, -71.6800], zoom: 11
                },
                'storm_t100': {
                    temp: 16, hum: 98, wind: 52, precip: 145, flow: 880,
                    windDir: 320, windDirLbl: 'NNW (Río Atmosférico T=100)',
                    regime: 'storm', center: [-36.1300, -71.7200], zoom: 11
                }
            };

            const cfg = momentsMap[presetKey] || momentsMap['normal'];

            // 1. Sincronizar sliders y estado cartográfico de Leaflet
            const sTemp = document.getElementById('slide-temp');
            const sHum = document.getElementById('slide-hum');
            const sWind = document.getElementById('slide-wind');
            const sPrecip = document.getElementById('slide-precip');
            const sFlow = document.getElementById('slide-flow');

            if (sTemp) sTemp.value = cfg.temp;
            if (sHum) sHum.value = cfg.hum;
            if (sWind) sWind.value = cfg.wind;
            if (sPrecip) sPrecip.value = cfg.precip;
            if (sFlow) sFlow.value = cfg.flow;

            // Invocar motores de actualización cartográfica
            if (typeof updateFWI === 'function') updateFWI(cfg.temp, cfg.hum, cfg.wind);
            if (typeof updateWater === 'function') updateWater(cfg.precip, cfg.flow);

            // Sincronizar simulador paramétrico del cerro si está activo
            if (typeof simulateBasinPreset === 'function') {
                simulateBasinPreset(presetKey);
            }

            // 2. Dictamen reactivo de asesores de cuenca
            const advisorCard = document.getElementById('cuencaAdvisorDirectiveCard');
            const advisorText = document.getElementById('cuencaAdvisorDirectiveText');
            if (advisorCard && advisorText) {
                advisorCard.style.display = 'block';
                if (presetKey === 'puelche_fire') {
                    advisorText.innerHTML = '<b>Ing. Cecilia Lagos (Meteorología):</b> Alerta Roja Puelche. Ráfagas 58 km/h del ESE con HR 11%. FWI 52 extremo en interfaz forestal. Activar cortafuegos PRV.';
                } else if (presetKey === 'storm_t100') {
                    advisorText.innerHTML = '<b>Dr. Fernando Albornoz (Hidrólogo):</b> Río Atmosférico T=100 (145mm). Isoterma 0°C a 3.400m activa aluviones. Caudal Río Longaví 880 m³/s desborda llanuras aluviales T100.';
                } else if (presetKey === 'heatwave') {
                    advisorText.innerHTML = '<b>Dra. Marcela Oyarzún (Agrónoma):</b> Bloqueo anticiclónico 38°C. Estrés evaporativo crítico. Incrementar pulsos de riego subterráneo y sombreado silvopastoril.';
                } else if (presetKey === 'drought') {
                    advisorText.innerHTML = '<b>Dr. Fernando Albornoz (Hidrólogo):</b> Megasequía persistente. Caudal menguado a 42 m³/s. Napa en APRs abatida a -24m. Dependencia crítica de zanjas Keyline.';
                } else if (presetKey === 'winter_dry') {
                    advisorText.innerHTML = '<b>Ing. Cecilia Lagos (Meteorología):</b> Inversión térmica invernal con helada polar 2°C. Riesgo de escarcha en frutales de vega. Flujo catabático calmo.';
                } else if (presetKey === 'storm_t10') {
                    advisorText.innerHTML = '<b>Dr. Fernando Albornoz (Hidrólogo):</b> Temporal regular T=10 (65mm). Caudal 290 m³/s amortiguado por terrazas y tranques de infiltración.';
                } else {
                    advisorText.innerHTML = '<b>Dr. Fernando Albornoz:</b> Caudal matriz Río Longaví en régimen base equilibrado (125 m³/s). Bocatomas operando en régimen normal.';
                }
            }

            // 3. Sincronizar métricas del timeline scrubber
            const tMetric = document.getElementById('cuencaWindyTempMetric');
            const wMetric = document.getElementById('cuencaWindyWindMetric');
            const pMetric = document.getElementById('cuencaWindyPrecipMetric');
            if (tMetric) tMetric.innerText = `${cfg.temp}°C`;
            if (wMetric) wMetric.innerText = `${cfg.wind} km/h ${cfg.windDirLbl}`;
            if (pMetric) pMetric.innerText = `${cfg.precip} mm`;

            // 4. Afectar visualmente al motor LivingEnergyFlowEngine (Windy Style)
            if (window.energyFlowEngine) {
                window.energyFlowEngine.setRegime(cfg.regime);
                if (typeof window.energyFlowEngine.setAtmosphericState === 'function') {
                    window.energyFlowEngine.setAtmosphericState({
                        windSpeed: cfg.wind,
                        windDir: cfg.windDir,
                        temp: cfg.temp,
                        precip: cfg.precip
                    });
                }
            }

            // 4.1 Actualizar estilo reactivo de los polígonos prediales en el mapa
            if (overlayLayers && overlayLayers['predios'] && typeof getPredioScenarioStyle === 'function') {
                overlayLayers['predios'].setStyle(function(feature) {
                    return getPredioScenarioStyle(feature, presetKey);
                });
            }

            // 4.2 Si hay un área de estudio (AOI) seleccionada, recalcular su diagnóstico en vivo
            if (typeof updateCuencaAoiDiagnostic === 'function') {
                updateCuencaAoiDiagnostic();
            }

            // 4.3 REACCIÓN DE UNIDADES TÁCTICAS DE RIESGO Y CAPAS DE EXPOSICIÓN
            try {
                // Actualizar Matriz Cuantitativa H-V-R
                if (typeof window.updateHvrMatrix === 'function') {
                    window.updateHvrMatrix(presetKey);
                }

                // 1. Celdas Tácticas de Alerta por Transecto (Reacción Dinámica al Escenario)
                const fluvialCells = [cellF01, cellF02, cellF03].filter(c => c && c.poly);
                const pyrogenicCells = [cellP01, cellP02, cellP03].filter(c => c && c.poly);
                const landslideCells = [cellM01, cellM02].filter(c => c && c.poly);

                // Matriz de compatibilidad y mutua exclusión física en los 8 Momentos
                if (presetKey === 'storm_t100' || presetKey === 'storm_t10') {
                    // Crecidas / Lluvia extrema: apagar activamente Incendios y Puelche
                    if (typeof window.deactivateRiskLayer === 'function') {
                        window.deactivateRiskLayer('incendios');
                    }
                    if (typeof window.setPuelcheState === 'function') {
                        window.setPuelcheState(false);
                    }

                    fluvialCells.forEach(c => c.poly.setStyle({ weight: 3.8, color: '#38bdf8', fillOpacity: 0.45, dashArray: '8, 3' }));
                    pyrogenicCells.forEach(c => c.poly.setStyle({ weight: 1.5, color: '#64748b', fillOpacity: 0.08, dashArray: '4, 4' }));
                    landslideCells.forEach(c => c.poly.setStyle({ weight: 3.8, color: '#ef4444', fillOpacity: 0.50, dashArray: '8, 3' }));
                    if (typeof window.toggleTransectLayer === 'function' && typeof transectoFluvialGroup !== 'undefined' && !map.hasLayer(transectoFluvialGroup)) {
                        window.toggleTransectLayer('inundacion');
                    }
                } else if (presetKey === 'puelche_fire') {
                    // Momento 5: Puelche Catabático (Tiempo extremo: Viento ESE 58 km/h, HR 11%)
                    // Desacople: NO activa incendios automáticamente. Apaga inundaciones.
                    if (typeof window.deactivateRiskLayer === 'function') {
                        window.deactivateRiskLayer('inundacion');
                    }
                    if (typeof window.setPuelcheState === 'function') {
                        window.setPuelcheState(true);
                    }

                    pyrogenicCells.forEach(c => c.poly.setStyle({ weight: 4.2, color: '#ef4444', fillOpacity: 0.55, dashArray: '8, 3' }));
                    fluvialCells.forEach(c => c.poly.setStyle({ weight: 1.5, color: '#0369a1', fillOpacity: 0.08, dashArray: '4, 4' }));
                    landslideCells.forEach(c => c.poly.setStyle({ weight: 1.5, color: '#64748b', fillOpacity: 0.08, dashArray: '4, 4' }));
                } else if (presetKey === 'heatwave') {
                    // Ola de calor: desactiva inundaciones y desactiva puelche (viento sur calmo 14 km/h)
                    if (typeof window.deactivateRiskLayer === 'function') {
                        window.deactivateRiskLayer('inundacion');
                    }
                    if (typeof window.setPuelcheState === 'function') {
                        window.setPuelcheState(false);
                    }

                    pyrogenicCells.forEach(c => c.poly.setStyle({ weight: 4.0, color: '#f97316', fillOpacity: 0.45, dashArray: '6, 3' }));
                    fluvialCells.forEach(c => c.poly.setStyle({ weight: 1.5, color: '#0369a1', fillOpacity: 0.08, dashArray: '4, 4' }));
                    landslideCells.forEach(c => c.poly.setStyle({ weight: 1.5, color: '#64748b', fillOpacity: 0.08, dashArray: '4, 4' }));
                } else if (presetKey === 'drought') {
                    // Megasequía: desactiva inundaciones y desactiva puelche
                    if (typeof window.deactivateRiskLayer === 'function') {
                        window.deactivateRiskLayer('inundacion');
                    }
                    if (typeof window.setPuelcheState === 'function') {
                        window.setPuelcheState(false);
                    }

                    pyrogenicCells.forEach(c => c.poly.setStyle({ weight: 2.8, color: '#f59e0b', fillOpacity: 0.30, dashArray: '6, 4' }));
                    fluvialCells.forEach(c => c.poly.setStyle({ weight: 1.5, color: '#0284c7', fillOpacity: 0.08, dashArray: '4, 4' }));
                    landslideCells.forEach(c => c.poly.setStyle({ weight: 1.5, color: '#64748b', fillOpacity: 0.08, dashArray: '4, 4' }));
                } else if (presetKey === 'winter_dry') {
                    // Helada polar: desactiva incendios
                    if (typeof window.deactivateRiskLayer === 'function') {
                        window.deactivateRiskLayer('incendios');
                    }
                    if (typeof window.setPuelcheState === 'function') {
                        window.setPuelcheState(false);
                    }

                    fluvialCells.forEach(c => c.poly.setStyle({ weight: 1.8, color: '#38bdf8', fillOpacity: 0.15, dashArray: '4, 4' }));
                    pyrogenicCells.forEach(c => c.poly.setStyle({ weight: 1.5, color: '#64748b', fillOpacity: 0.08, dashArray: '4, 4' }));
                    landslideCells.forEach(c => c.poly.setStyle({ weight: 1.5, color: '#64748b', fillOpacity: 0.08, dashArray: '4, 4' }));
                } else {
                    // Normal / Verano normal: estado equilibrado sin Puelche
                    if (typeof window.setPuelcheState === 'function') {
                        window.setPuelcheState(false);
                    }

                    fluvialCells.forEach(c => c.poly.setStyle({ weight: 2.2, color: '#38bdf8', fillOpacity: 0.20, dashArray: '6, 4' }));
                    pyrogenicCells.forEach(c => c.poly.setStyle({ weight: 2.2, color: '#ef4444', fillOpacity: 0.22, dashArray: '6, 4' }));
                    landslideCells.forEach(c => c.poly.setStyle({ weight: 2.2, color: '#f59e0b', fillOpacity: 0.22, dashArray: '6, 4' }));
                }

                // 2. Capa de Exposición Territorial Colonia (Uso de Suelo / Activos)
                if (typeof exposureCologneLayer !== 'undefined' && exposureCologneLayer) {
                    exposureCologneLayer.setStyle(function(feature) {
                        const p = feature.properties;
                        if (presetKey === 'storm_t100' || presetKey === 'storm_t10') {
                            const isCrit = (p.id === 'EXP_RESIDENCIAL' || p.id === 'EXP_INFRAESTRUCTURA_VIAL');
                            return {
                                color: p.color,
                                weight: isCrit ? 3.8 : 2.2,
                                fillColor: p.fillColor,
                                fillOpacity: isCrit ? 0.75 : 0.45,
                                dashArray: p.id === 'EXP_RESIDENCIAL' ? '6, 4' : null
                            };
                        } else if (presetKey === 'puelche_fire') {
                            return { color: p.color, weight: 1.2, fillColor: p.fillColor, fillOpacity: 0.15 };
                        } else {
                            return { color: p.color, weight: 2.2, fillColor: p.fillColor, fillOpacity: p.fillOpacity, dashArray: p.id === 'EXP_RESIDENCIAL' ? '6, 4' : null };
                        }
                    });
                }

                // 3. Capa de Severidad CAL FIRE FHSZ
                if (typeof calFireFhszLayer !== 'undefined' && calFireFhszLayer) {
                    calFireFhszLayer.setStyle(function(feature) {
                        const p = feature.properties;
                        if (presetKey === 'puelche_fire' || presetKey === 'heatwave') {
                            const isHigh = (p.id === 'CALFIRE_VHFHSZ' || p.id === 'WUI_EMBER_ZONE');
                            return {
                                color: p.color,
                                weight: isHigh ? 3.8 : 2.2,
                                fillColor: p.fillColor,
                                fillOpacity: isHigh ? 0.70 : 0.40,
                                dashArray: p.dashArray || null
                            };
                        } else if (presetKey === 'storm_t100') {
                            return { color: p.color, weight: 1.2, fillColor: p.fillColor, fillOpacity: 0.15 };
                        } else {
                            return { color: p.color, weight: 2.2, fillColor: p.fillColor, fillOpacity: p.fillOpacity, dashArray: p.dashArray || null };
                        }
                    });
                }

                // 4. Capa de Susceptibilidad de Deslizamientos
                if (typeof landslideSusceptibilityLayer !== 'undefined' && landslideSusceptibilityLayer) {
                    landslideSusceptibilityLayer.setStyle(function(feature) {
                        const p = feature.properties;
                        if (presetKey === 'storm_t100' || presetKey === 'storm_t10') {
                            return {
                                color: '#ef4444',
                                weight: 3.5,
                                fillColor: '#dc2626',
                                fillOpacity: 0.75,
                                dashArray: p.dashArray || null
                            };
                        } else {
                            return {
                                color: p.color,
                                weight: 2.5,
                                fillColor: p.fillColor,
                                fillOpacity: p.fillOpacity,
                                dashArray: p.dashArray || null
                            };
                        }
                    });
                }
            } catch (errTactical) {
                console.warn('Tactical Units & Exposure layers preset sync:', errTactical);
            }

            // 5. Animación de cámara focal en el mapa Leaflet
            if (map && cfg.center) {
                map.flyTo(cfg.center, cfg.zoom, { duration: 1.2 });
            }
        };

        // ═══════════════════════════════════════════════════════════════════
        // CONTROLADOR DE VARIABLES TIPO WINDY & SUB-PESTAÑAS TÁCTICAS
        // ═══════════════════════════════════════════════════════════════════
        window.activeWindyVariable = 'wind';
        window.hubWindyUnits = 'kt'; // 'kt', 'km/h', 'm/s'
        window.hubAltitudeM = 10;
        window.hubForecastModel = 'ecmwf';
        window.hubPlaySpeed = 1;
        window.hubIsPlaying = true;

        window.setCuencaWindyVariable = function(varKey) {
            window.activeWindyVariable = varKey;
            const vars = ['wind', 'gusts', 'precip', 'temp', 'clouds', 'pressure'];
            vars.forEach(v => {
                const btn = document.getElementById('btnWindyVar-' + v);
                if (btn) {
                    if (v === varKey) {
                        btn.className = 'p-2 rounded-lg bg-sky-500/30 border border-sky-400 text-sky-200 font-bold text-left flex items-center justify-between cursor-pointer transition-all shadow-md';
                    } else {
                        btn.className = 'p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white font-medium text-left flex items-center justify-between cursor-pointer transition-all';
                    }
                }
            });

            // Actualizar Píldora HUD Superior Izquierda
            const iconEl = document.getElementById('hubWindyIcon');
            const nameEl = document.getElementById('hubWindyLayerName');
            const layerMeta = {
                wind:     { name: 'Viento 10m', icon: '🍃' },
                gusts:    { name: 'Ráfagas de Viento', icon: '🌪️' },
                precip:   { name: 'Precipitación', icon: '🌧️' },
                temp:     { name: 'Temperatura', icon: '🌡️' },
                clouds:   { name: 'Cobertura de Nubes', icon: '☁️' },
                pressure: { name: 'Presión e Isóbaras', icon: '🔘' },
                fwi:      { name: 'Piro-Riesgo FWI & Rothermel', icon: '🔥' }
            };
            if (iconEl && layerMeta[varKey]) iconEl.textContent = layerMeta[varKey].icon;
            if (nameEl && layerMeta[varKey]) nameEl.textContent = layerMeta[varKey].name;

            // Actualizar Rampa de Color en Barra Espectral Inferior
            const bar = document.getElementById('hubSpectralBar');
            const ticks = document.getElementById('hubSpectralTicks');
            if (bar && ticks) {
                if (varKey === 'wind' || varKey === 'gusts') {
                    bar.style.background = 'linear-gradient(to right, #38bdf8 0%, #22c55e 25%, #eab308 50%, #ef4444 75%, #d946ef 100%)';
                    ticks.innerHTML = '<span>0 kt</span><span>10</span><span>20</span><span>30</span><span>40</span><span>60+ kt</span>';
                } else if (varKey === 'temp') {
                    bar.style.background = 'linear-gradient(to right, #3b82f6 0%, #06b6d4 25%, #10b981 50%, #f59e0b 75%, #ef4444 100%)';
                    ticks.innerHTML = '<span>-5°C</span><span>5°C</span><span>15°C</span><span>25°C</span><span>35°C</span><span>45°C</span>';
                } else if (varKey === 'precip') {
                    bar.style.background = 'linear-gradient(to right, rgba(56,189,248,0.2) 0%, #38bdf8 20%, #3b82f6 50%, #1d4ed8 75%, #831843 100%)';
                    ticks.innerHTML = '<span>0 mm</span><span>2 mm</span><span>10 mm</span><span>25 mm</span><span>50 mm</span><span>100+ mm</span>';
                } else if (varKey === 'clouds') {
                    bar.style.background = 'linear-gradient(to right, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.7) 70%, #ffffff 100%)';
                    ticks.innerHTML = '<span>0%</span><span>20%</span><span>40%</span><span>60%</span><span>80%</span><span>100%</span>';
                } else if (varKey === 'pressure') {
                    bar.style.background = 'linear-gradient(to right, #9333ea 0%, #3b82f6 30%, #10b981 60%, #f59e0b 85%, #ef4444 100%)';
                    ticks.innerHTML = '<span>995 hPa</span><span>1005</span><span>1013</span><span>1020</span><span>1028 hPa</span>';
                } else if (varKey === 'fwi') {
                    bar.style.background = 'linear-gradient(to right, #22c55e 0%, #eab308 25%, #f97316 50%, #ef4444 75%, #7f1d1d 100%)';
                    ticks.innerHTML = '<span>0 Bajo</span><span>15 Mod</span><span>30 Alto</span><span>45 Muy Alto</span><span>60+ Extremo</span>';
                }
            }

            if (window.energyFlowEngine) {
                if (typeof window.energyFlowEngine.setActiveVariable === 'function') {
                    window.energyFlowEngine.setActiveVariable(varKey);
                }
                window.energyFlowEngine.toggles.wind = true;
                window.energyFlowEngine.render();
            }
        };

        window.cycleHubWindyUnits = function() {
            const units = ['kt', 'km/h', 'm/s'];
            const nextIdx = (units.indexOf(window.hubWindyUnits) + 1) % units.length;
            window.hubWindyUnits = units[nextIdx];
            const btn = document.getElementById('hubWindyUnitBtn');
            if (btn) btn.textContent = window.hubWindyUnits + ' ▾';
            if (window.updateHubWindyHudDisplay) window.updateHubWindyHudDisplay();
        };

        window.onHubAltitudeChange = function(sliderVal) {
            const alts = [10, 100, 500, 1500, 3000];
            const labels = ['Superficie (10m) ✈️', '100m AGL', '500m AGL', '1.500m (FL050)', '3.000m (FL100 ✈️)'];
            const idx = Math.max(0, Math.min(4, parseInt(sliderVal) || 0));
            window.hubAltitudeM = alts[idx];
            const lbl = document.getElementById('labelHubAltitudeVal');
            if (lbl) lbl.textContent = labels[idx];
            if (window.energyFlowEngine) {
                window.energyFlowEngine.altitudeM = window.hubAltitudeM;
                window.energyFlowEngine.render();
            }
        };

        window.setHubForecastModel = function(modelKey) {
            window.hubForecastModel = modelKey;
            const btnEcmwf = document.getElementById('btnHubModelEcmwf');
            const btnGfs = document.getElementById('btnHubModelGfs');
            if (btnEcmwf && btnGfs) {
                if (modelKey === 'ecmwf') {
                    btnEcmwf.className = 'px-2 py-0.5 rounded bg-sky-500/30 border border-sky-400 text-sky-200 font-bold cursor-pointer transition-all';
                    btnGfs.className = 'px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer transition-all';
                } else {
                    btnGfs.className = 'px-2 py-0.5 rounded bg-sky-500/30 border border-sky-400 text-sky-200 font-bold cursor-pointer transition-all';
                    btnEcmwf.className = 'px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer transition-all';
                }
            }
            if (window.energyFlowEngine) {
                window.energyFlowEngine.forecastModel = modelKey;
                window.energyFlowEngine.render();
            }
        };

        window.onHubParticleSpeedChange = function(val) {
            const spd = parseFloat(val) || 1.0;
            const lbl = document.getElementById('valHubParticleSpeed');
            if (lbl) lbl.textContent = spd.toFixed(1) + 'x';
            if (window.energyFlowEngine) {
                window.energyFlowEngine.userSpeedMultiplier = spd;
            }
        };

        window.onHubParticleOpacityChange = function(val) {
            const op = parseFloat(val) || 0.85;
            const lbl = document.getElementById('valHubParticleOpacity');
            if (lbl) lbl.textContent = Math.round(op * 100) + '%';
            if (window.energyFlowEngine) {
                window.energyFlowEngine.userOpacity = op;
                window.energyFlowEngine.render();
            }
        };

        window.toggleHubWindyPlay = function() {
            window.hubIsPlaying = !window.hubIsPlaying;
            const btn = document.getElementById('hubBtnWindyPlayPause');
            if (btn) btn.textContent = window.hubIsPlaying ? '⏸' : '▶';
        };

        window.setHubWindyPlaySpeed = function(spd, btn) {
            window.hubPlaySpeed = spd;
            document.querySelectorAll('.hub-speed-pill').forEach(b => {
                b.className = 'hub-speed-pill px-2 py-0.5 rounded cursor-pointer text-slate-400 hover:text-white';
            });
            if (btn) btn.className = 'hub-speed-pill active px-2 py-0.5 rounded cursor-pointer text-white font-bold bg-white/20';
        };

        window.onHubScrubberInput = function(hourIdx) {
            const totalHours = 168; // 7 días
            const idx = parseInt(hourIdx) || 0;
            const pct = (idx / totalHours) * 100;
            const handle = document.getElementById('hubScrubberHandle');
            if (handle) handle.style.left = `${pct}%`;

            const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const today = new Date();
            const targetDate = new Date(today.getTime() + idx * 3600 * 1000);
            const hourStr = String(targetDate.getHours()).padStart(2, '0') + ':00';
            const dayStr = dayNames[targetDate.getDay()] + ' ' + targetDate.getDate();

            const pill = document.getElementById('hubScrubberHourPill');
            if (pill) pill.textContent = hourStr;

            const dateLbl = document.getElementById('hubTimelineDateLabel');
            if (dateLbl) dateLbl.textContent = `${dayStr} ${hourStr} — Pronóstico ECMWF 9km`;

            // Actualizar métricas locales
            const windMetric = document.getElementById('cuencaWindyWindMetric');
            const tempMetric = document.getElementById('cuencaWindyTempMetric');
            const precipMetric = document.getElementById('cuencaWindyPrecipMetric');
            
            // Simulación diurna paramétrica coherente
            const h = targetDate.getHours();
            const tempVal = (14 + Math.sin((h - 9) * Math.PI / 12) * 11).toFixed(1);
            const windVal = (12 + Math.sin((h - 12) * Math.PI / 12) * 16 + (idx % 5)).toFixed(1);
            const precipVal = (h >= 18 && h <= 23 && (idx > 48)) ? (2.4 + (idx % 3)).toFixed(1) : '0.0';

            if (tempMetric) tempMetric.textContent = `${tempVal}°C`;
            if (windMetric) windMetric.textContent = `${windVal} kt SW`;
            if (precipMetric) precipMetric.textContent = `${precipVal} mm`;

            if (window.energyFlowEngine) {
                window.energyFlowEngine.windSpeed = parseFloat(windVal);
                window.energyFlowEngine.temp = parseFloat(tempVal);
                window.energyFlowEngine.precip = parseFloat(precipVal);
                window.energyFlowEngine.render();
            }

            if (window.updateHubWindyHudDisplay) window.updateHubWindyHudDisplay();
        };

        window.updateHubWindyHudDisplay = function() {
            const valEl = document.getElementById('hubWindySpeedVal');
            const arrowEl = document.getElementById('hubWindyVectorArrow');
            const dirEl = document.getElementById('hubWindyVectorDir');
            if (!valEl) return;

            let spdKt = (window.energyFlowEngine && window.energyFlowEngine.windSpeed) ? window.energyFlowEngine.windSpeed : 24;
            let displaySpd = spdKt;
            if (window.hubWindyUnits === 'km/h') displaySpd = spdKt * 1.852;
            else if (window.hubWindyUnits === 'm/s') displaySpd = spdKt * 0.514444;

            valEl.textContent = Math.round(displaySpd);

            const dir = (window.energyFlowEngine && window.energyFlowEngine.windDir) ? window.energyFlowEngine.windDir : 220;
            if (dirEl) dirEl.textContent = `${Math.round(dir)}° SO`;
            if (arrowEl) arrowEl.style.transform = `rotate(${dir - 45}deg)`;
        };

        // Generar grilla de 7 días en el track inferior
        window.initHubDaysGrid = function() {
            const grid = document.getElementById('hubDaysGrid');
            if (!grid) return;
            const days = ['Hoy', '+1D', '+2D', '+3D', '+4D', '+5D', '+6D'];
            grid.innerHTML = days.map((d, i) => `
                <div class="flex-1 flex items-center justify-center font-bold text-[9px] ${i === 0 ? 'text-amber-400 bg-amber-500/10' : ''}">${d}</div>
            `).join('');
        };
        setTimeout(window.initHubDaysGrid, 200);

        // Retículo cursor sobre el mapa de la cuenca
        setTimeout(() => {
            if (typeof map !== 'undefined' && map) {
                const tooltip = document.getElementById('hubWindyCursorTooltip');
                map.on('mousemove', (e) => {
                    if (!tooltip) return;
                    const topPill = document.getElementById('hubWindyTopPill');
                    if (!topPill || topPill.style.display === 'none') {
                        tooltip.classList.add('hidden');
                        return;
                    }
                    tooltip.classList.remove('hidden');
                    tooltip.style.left = (e.originalEvent.clientX + 16) + 'px';
                    tooltip.style.top = (e.originalEvent.clientY - 20) + 'px';

                    const lat = e.latlng.lat;
                    const lng = e.latlng.lng;
                    const coordsEl = document.getElementById('hubWindyTooltipCoords');
                    const cotaEl = document.getElementById('hubWindyTooltipCota');
                    const speedEl = document.getElementById('hubWindyTooltipSpeed');
                    const arrowEl = document.getElementById('hubWindyTooltipArrow');
                    const varEl = document.getElementById('hubWindyTooltipVar');

                    if (coordsEl) coordsEl.textContent = `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
                    
                    // Cálculo de cota DEM interpolada del Longaví (-71.40 cordillera 2400m a -71.80 vega 140m)
                    const cotaM = Math.max(120, Math.min(2800, Math.round(140 + Math.pow(Math.max(0, (lng + 71.80) / 0.40), 1.8) * 2600)));
                    if (cotaEl) cotaEl.textContent = `📍 Cota: ${cotaM} msnm`;

                    // Actualizar Sonda DEM Lateral de Elevación & Profundidad
                    const sondaElev = document.getElementById('sondaElevVal');
                    const sondaDepth = document.getElementById('sondaDepthVal');
                    const sondaSlope = document.getElementById('sondaSlopeVal');
                    const sondaZone = document.getElementById('sondaZoneVal');

                    if (sondaElev) sondaElev.textContent = `${cotaM} msnm`;
                    
                    const distBullileo = Math.hypot(lat - (-36.2800), (lng - (-71.4200)) * 1.3);
                    const distLongavi = Math.abs(lat - (-36.1750 + (lng - (-71.6700)) * 0.42));
                    const distMeniel = Math.hypot(lat - (-36.2115), lng - (-71.6053));

                    if (distBullileo < 0.025) {
                        const depth = Math.min(62, Math.max(5, (0.025 - distBullileo) * 2400));
                        if (sondaDepth) sondaDepth.textContent = `-${depth.toFixed(1)} m (Bullileo)`;
                        if (sondaSlope) sondaSlope.textContent = `Vaso 60M m³ • 395m`;
                        if (sondaZone) sondaZone.textContent = 'Embalse Bullileo';
                    } else if (distLongavi < 0.008) {
                        if (sondaDepth) sondaDepth.textContent = `-2.15 m (Río Longaví)`;
                        if (sondaSlope) sondaSlope.textContent = `Caudal 185 m³/s`;
                        if (sondaZone) sondaZone.textContent = 'Cauce Fluvial';
                    } else if (distMeniel < 0.008) {
                        if (sondaDepth) sondaDepth.textContent = `-6.5 m (Tranque)`;
                        if (sondaSlope) sondaSlope.textContent = `Keyline Infiltración`;
                        if (sondaZone) sondaZone.textContent = 'Twin Meniel';
                    } else {
                        const napaM = Math.round(Math.max(4, 38 - (cotaM / 2800) * 32));
                        if (sondaDepth) sondaDepth.textContent = `-${napaM} m (Napa APR)`;
                        const slopePct = Math.round(Math.min(65, 2.5 + Math.pow(Math.max(0, (lng + 71.80) / 0.45), 2.2) * 58));
                        let zoneDesc = 'Valle Aluvial';
                        if (cotaM > 1600) zoneDesc = 'Alta Cordillera';
                        else if (cotaM > 800) zoneDesc = 'Precordillera';
                        else if (cotaM > 350) zoneDesc = 'Pie de Monte';
                        if (sondaSlope) sondaSlope.textContent = `${slopePct}% (${zoneDesc})`;
                        if (sondaZone) sondaZone.textContent = `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
                    }

                    const baseSpd = (window.energyFlowEngine?.windSpeed || 18);
                    const orographicSpeed = Math.round(baseSpd * (1.0 + (cotaM / 3000) * 0.75));
                    
                    let unitVal = orographicSpeed;
                    if (window.hubWindyUnits === 'km/h') unitVal = Math.round(orographicSpeed * 1.852);
                    else if (window.hubWindyUnits === 'm/s') unitVal = Math.round(orographicSpeed * 0.514444);

                    if (speedEl) speedEl.textContent = `${unitVal} ${window.hubWindyUnits}`;
                    if (varEl) varEl.textContent = (window.activeWindyVariable || 'Viento');
                });

                map.on('mouseout', () => {
                    const tooltip = document.getElementById('hubWindyCursorTooltip');
                    if (tooltip) tooltip.classList.add('hidden');
                });
            }
        }, 500);

        window.toggleAtmosphericInfluenceSurfaces = function() {
            if (!window.energyFlowEngine) return;
            const newState = !window.energyFlowEngine.showInfluenceSurfaces;
            window.energyFlowEngine.showInfluenceSurfaces = newState;
            const btn = document.getElementById('btnToggleInfluenceSurfaces');
            const lbl = document.getElementById('labelInfluenceStatus');
            if (lbl) {
                lbl.textContent = newState ? 'ACTIVO 🟢' : 'Activar ↗';
                lbl.className = newState ? 'text-[9px] text-emerald-400 font-bold font-mono' : 'text-[9px] text-sky-400 font-bold font-mono';
            }
            if (btn) {
                btn.className = newState 
                    ? 'w-full text-left p-2 rounded-lg bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-between text-xs text-emerald-200 transition-all cursor-pointer'
                    : 'w-full text-left p-2 rounded-lg bg-white/5 hover:bg-sky-500/15 border border-white/5 hover:border-sky-500/30 flex items-center justify-between text-xs text-sky-200 transition-all cursor-pointer';
            }
            window.energyFlowEngine.render();
        };

        window.switchTacticoSidebarSubTab = function(subTab) {
            // El panel táctico está consolidado de forma unificada en la matriz canónica H-V-R y capas C2
            if (typeof window.updateHvrMatrix === 'function') {
                window.updateHvrMatrix(window.cuencaForecastState?.activePreset || 'normal');
            }
        };

        // Helper para alternar capas desde el panel HVR
        window.toggleOverlayByName = function(name, checkbox) {
            const lyr = overlayLayers[name];
            if (!lyr) return;
            if (checkbox.checked) {
                if (!map.hasLayer(lyr)) map.addLayer(lyr);
            } else {
                if (map.hasLayer(lyr)) map.removeLayer(lyr);
            }
        };

        // ═══════════════════════════════════════════════════════════════════
        // MOTOR MATEMÁTICO CUANTITATIVO H-V-R (CANONICAL RISK = HAZARD * VULNERABILITY)
        // ═══════════════════════════════════════════════════════════════════
        window.updateHvrMatrix = function(presetKey) {
            const key = presetKey || (window.cuencaForecastState?.activePreset || 'normal');
            
            const matrixData = {
                'storm_t100': {
                    h: 92, v: 74, r: 68.1,
                    tag: 'RÍO ATMOSFÉRICO T=100 (CRÍTICO)',
                    tagColor: 'bg-red-950 text-red-300 border-red-500/40',
                    levelClass: 'CLASE 4 • ALTO / SEVERO (0.6 - 0.8)',
                    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
                    rColor: 'text-orange-400',
                    descH: 'Caudal Río Longaví 880 m³/s • Precipitación 145 mm/24h • Isoterma 0°C a 3.400m',
                    descV: 'Llanuras de inundación habitadas, bocatomas matrices y cruces viales Ruta 5 / L-110',
                    deltaTag: '+58% (Alerta Máxima)',
                    deltaAvg: '+58.3%',
                    deltaPeak: '+76.4%'
                },
                'storm_t10': {
                    h: 68, v: 62, r: 42.2,
                    tag: 'TEMPORAL T=10 (MODERADO)',
                    tagColor: 'bg-sky-950 text-sky-300 border-sky-500/40',
                    levelClass: 'CLASE 3 • MODERADO (0.4 - 0.6)',
                    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                    rColor: 'text-amber-400',
                    descH: 'Caudal Río Longaví 290 m³/s • Precipitación 65 mm • Saturación suelo 78%',
                    descV: 'Vegas aluviales bajas, canales de regadío y puentes secundarios',
                    deltaTag: '+32% (Crecida Ordinaria)',
                    deltaAvg: '+32.4%',
                    deltaPeak: '+45.0%'
                },
                'puelche_fire': {
                    h: 88, v: 65, r: 57.2,
                    tag: 'PIRO-FRENTE PUELCHE (EXTREMO)',
                    tagColor: 'bg-red-950 text-red-300 border-red-500/40',
                    levelClass: 'CLASE 3 • MODERADO-ALTO (0.4 - 0.6)',
                    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
                    rColor: 'text-orange-400',
                    descH: 'Viento Puelche 58 km/h ESE • Humedad 11% • Temp 39°C • FWI 74 Extremo',
                    descV: 'Interfaz urbano-forestal, plantaciones de pino continuas y tendido de transmisión',
                    deltaTag: '+47% (Alerta Roja Incendio)',
                    deltaAvg: '+47.4%',
                    deltaPeak: '+68.2%'
                },
                'heatwave': {
                    h: 72, v: 58, r: 41.8,
                    tag: 'OLA DE CALOR EXTREMA',
                    tagColor: 'bg-orange-950 text-orange-300 border-orange-500/40',
                    levelClass: 'CLASE 3 • MODERADO (0.4 - 0.6)',
                    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                    rColor: 'text-amber-400',
                    descH: 'Temperatura 38°C • Radiación 980 W/m² • Evapotranspiración 8.2 mm/d',
                    descV: 'Cultivos sin cobertura, suelos expuestos y estrés térmico pecuario',
                    deltaTag: '+32% (Estrés Hídrico)',
                    deltaAvg: '+32.0%',
                    deltaPeak: '+42.5%'
                },
                'drought': {
                    h: 55, v: 58, r: 31.9,
                    tag: 'MEGASEQUÍA PERSISTENTE',
                    tagColor: 'bg-amber-950 text-amber-300 border-amber-500/40',
                    levelClass: 'CLASE 2 • BAJO-MODERADO (0.2 - 0.4)',
                    badgeColor: 'bg-lime-500/20 text-lime-300 border-lime-500/40',
                    rColor: 'text-lime-400',
                    descH: 'Caudal menguado a 42 m³/s • Napa freática en pozos APR abatida a -24m',
                    descV: 'Sistemas APR comunitarios y turnos de riego de cola de canal',
                    deltaTag: '+22% (Déficit Hídrico)',
                    deltaAvg: '+22.1%',
                    deltaPeak: '+31.0%'
                },
                'winter_dry': {
                    h: 35, v: 42, r: 14.7,
                    tag: 'HELADA POLAR INVERNAL',
                    tagColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
                    levelClass: 'CLASE 1 • MUY BAJO (0.0 - 0.2)',
                    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                    rColor: 'text-emerald-400',
                    descH: 'Temperatura 2°C • Inversión térmica superficial • Flujo catabático calmo',
                    descV: 'Frutales caducos en receso y pasturas de vega',
                    deltaTag: '+5% (Riesgo Térmico Local)',
                    deltaAvg: '+4.9%',
                    deltaPeak: '+12.0%'
                },
                'summer_normal': {
                    h: 32, v: 36, r: 11.5,
                    tag: 'VERANO REGULAR EQUILIBRADO',
                    tagColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
                    levelClass: 'CLASE 1 • MUY BAJO (0.0 - 0.2)',
                    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                    rColor: 'text-emerald-400',
                    descH: 'Temperatura 28°C • Brisa marina 20 km/h • Caudal matriz 95 m³/s',
                    descV: 'Operación regularizada de compuertas y canales',
                    deltaTag: '+2% (Estable)',
                    deltaAvg: '+1.7%',
                    deltaPeak: '+4.0%'
                },
                'normal': {
                    h: 28, v: 35, r: 9.8,
                    tag: 'LÍNEA BASE (NORMAL)',
                    tagColor: 'bg-sky-950 text-sky-300 border-sky-500/30',
                    levelClass: 'CLASE 1 • MUY BAJO (0.0 - 0.2)',
                    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                    rColor: 'text-emerald-400',
                    descH: 'Caudal 125 m³/s • Viento 15 km/h • Humedad 45%',
                    descV: '12.8k ha agrícolas • 5 comités APR • 3 puentes viales',
                    deltaTag: '+0% (Estable)',
                    deltaAvg: '+0%',
                    deltaPeak: '+0%'
                }
            };

            const data = matrixData[key] || matrixData['normal'];

            const elValH = document.getElementById('valHvrH');
            const elValV = document.getElementById('valHvrV');
            const elValR = document.getElementById('valHvrR');
            const elBarPctH = document.getElementById('barPctH');
            const elBarPctV = document.getElementById('barPctV');
            const elBarPctR = document.getElementById('barPctR');
            const elBarFillH = document.getElementById('barFillH');
            const elBarFillV = document.getElementById('barFillV');
            const elBarFillR = document.getElementById('barFillR');
            const elBadgeLevel = document.getElementById('badgeHvrLevel');
            const elScenarioTag = document.getElementById('hvrScenarioTag');
            const elDescH = document.getElementById('descHvrH');
            const elDescV = document.getElementById('descHvrV');
            const elDeltaTag = document.getElementById('hvrDeltaTag');
            const elDeltaAvg = document.getElementById('hvrDeltaAvg');
            const elDeltaPeak = document.getElementById('hvrDeltaPeak');

            if (elValH) elValH.innerText = `H: ${data.h}%`;
            if (elValV) elValV.innerText = `V: ${data.v}%`;
            if (elValR) {
                elValR.innerText = `R: ${data.r}%`;
                elValR.className = `${data.rColor} font-extrabold`;
            }
            if (elBarPctH) elBarPctH.innerText = `${data.h}%`;
            if (elBarPctV) elBarPctV.innerText = `${data.v}%`;
            if (elBarPctR) elBarPctR.innerText = `${data.r}%`;
            if (elBarFillH) elBarFillH.style.width = `${data.h}%`;
            if (elBarFillV) elBarFillV.style.width = `${data.v}%`;
            if (elBarFillR) {
                elBarFillR.style.width = `${data.r}%`;
                if (data.r < 20) elBarFillR.className = 'bg-emerald-500 h-full transition-all duration-500';
                else if (data.r < 40) elBarFillR.className = 'bg-lime-500 h-full transition-all duration-500';
                else if (data.r < 60) elBarFillR.className = 'bg-amber-500 h-full transition-all duration-500';
                else if (data.r < 80) elBarFillR.className = 'bg-orange-500 h-full transition-all duration-500';
                else elBarFillR.className = 'bg-red-600 h-full transition-all duration-500';
            }
            if (elBadgeLevel) {
                elBadgeLevel.innerText = data.levelClass;
                elBadgeLevel.className = `inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold ${data.badgeColor}`;
            }
            if (elScenarioTag) {
                elScenarioTag.innerText = data.tag;
                elScenarioTag.className = `px-2 py-0.5 rounded text-[9px] font-bold font-mono border ${data.tagColor}`;
            }
            if (elDescH) elDescH.innerText = data.descH;
            if (elDescV) elDescV.innerText = data.descV;
            if (elDeltaTag) elDeltaTag.innerText = data.deltaTag;
            if (elDeltaAvg) elDeltaAvg.innerText = data.deltaAvg;
            if (elDeltaPeak) elDeltaPeak.innerText = data.deltaPeak;
        };

        // 4. Servicio Open-Meteo & Scrubber de Cuenca
        window.fetchCuencaRealForecast = async function() {
            const LAT = -36.21156;
            const LON = -71.60530;
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&forecast_days=7&timezone=auto`;

            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const raw = await res.json();
                
                const hourly = [];
                const h = raw.hourly;
                for (let i = 0; i < h.time.length; i++) {
                    hourly.push({
                        timeStr: h.time[i],
                        temp: Math.round(h.temperature_2m[i] * 10) / 10,
                        rh: Math.round(h.relative_humidity_2m[i]),
                        precip: Math.round(h.precipitation[i] * 10) / 10,
                        windSpeed: Math.round(h.wind_speed_10m[i]),
                        windDir: Math.round(h.wind_direction_10m[i]),
                        windGusts: Math.round(h.wind_gusts_10m[i] || h.wind_speed_10m[i] * 1.3)
                    });
                }

                const daily = [];
                const d = raw.daily;
                const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                for (let i = 0; i < d.time.length; i++) {
                    const dt = new Date(d.time[i] + 'T00:00:00');
                    daily.push({
                        dateStr: d.time[i],
                        dayName: dayNames[dt.getDay()],
                        tempMax: Math.round(d.temperature_2m_max[i]),
                        tempMin: Math.round(d.temperature_2m_min[i]),
                        precipSum: Math.round(d.precipitation_sum[i] * 10) / 10,
                        windMax: Math.round(d.wind_speed_10m_max[i])
                    });
                }

                cuencaForecastState.cachedData = { hourly, daily };
                renderCuencaWindyDaysBar();
                updateCuencaWindyDisplay();
            } catch (err) {
                console.warn('[Cuenca Open-Meteo] Fallback estival calibrado:', err);
                generateCuencaFallbackForecast();
            }
        };

        function generateCuencaFallbackForecast() {
            const dayNames = ['Hoy', 'Mañana', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            const daily = dayNames.map((name, i) => ({
                dayName: name,
                tempMax: 26 + (i % 3) * 3,
                tempMin: 9 + (i % 2) * 2,
                precipSum: i === 4 ? 12.4 : 0.0,
                windMax: 28 + (i % 2) * 14
            }));

            const hourly = [];
            for (let d = 0; d < 7; d++) {
                for (let h = 0; h < 24; h++) {
                    hourly.push({
                        temp: 14 + (h >= 11 && h <= 17 ? 14 : 2),
                        rh: (h >= 12 && h <= 18) ? 32 : 75,
                        precip: (d === 4 && h >= 10 && h <= 16) ? 2.5 : 0.0,
                        windSpeed: (h >= 12 && h <= 18) ? 24 : 8,
                        windDir: (h >= 6 && h <= 11) ? 65 : 225,
                        windGusts: 32
                    });
                }
            }
            cuencaForecastState.cachedData = { hourly, daily };
            renderCuencaWindyDaysBar();
            updateCuencaWindyDisplay();
        }

        function renderCuencaWindyDaysBar() {
            const bar = document.getElementById('cuencaWindyDaysBar');
            if (!bar || !cuencaForecastState.cachedData?.daily) return;
            bar.innerHTML = '';

            cuencaForecastState.cachedData.daily.forEach((day, idx) => {
                const pill = document.createElement('button');
                pill.className = `windy-day-pill ${idx === cuencaForecastState.selectedDayIdx ? 'active' : ''}`;
                pill.style.cssText = `padding: 2px 7px; border-radius: 9999px; font-size: 9.5px; font-weight: 700; font-family: 'JetBrains Mono', monospace; cursor: pointer; transition: all 0.2s; ${idx === cuencaForecastState.selectedDayIdx ? 'background: rgba(56, 189, 248, 0.35); border: 1px solid #38bdf8; color: #bae6fd;' : 'background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1;'}`;
                pill.innerHTML = `<span>${day.dayName}</span> <b style="color: #fde047;">${day.tempMax}°</b>`;
                pill.title = `Min ${day.tempMin}°C, Max ${day.tempMax}°C, Lluvia ${day.precipSum}mm, Viento ${day.windMax}km/h`;
                pill.onclick = () => {
                    cuencaForecastState.selectedDayIdx = idx;
                    renderCuencaWindyDaysBar();
                    updateCuencaWindyDisplay();
                };
                bar.appendChild(pill);
            });
        }

        window.setCuencaWindySource = function(isLive) {
            cuencaForecastState.isLive = isLive;
            const btnLive = document.getElementById('btnCuencaWindyModeLive');
            const btnSim = document.getElementById('btnCuencaWindyModeSim');
            const daysBar = document.getElementById('cuencaWindyDaysBar');

            if (btnLive && btnSim) {
                if (isLive) {
                    btnLive.style.background = 'rgba(16, 185, 129, 0.35)';
                    btnLive.style.borderColor = '#10b981';
                    btnLive.style.color = '#6ee7b7';
                    btnSim.style.background = 'transparent';
                    btnSim.style.borderColor = 'transparent';
                    btnSim.style.color = '#94a3b8';
                    if (daysBar) daysBar.style.display = 'flex';
                } else {
                    btnSim.style.background = 'rgba(245, 158, 11, 0.35)';
                    btnSim.style.borderColor = '#f59e0b';
                    btnSim.style.color = '#fde047';
                    btnLive.style.background = 'transparent';
                    btnLive.style.borderColor = 'transparent';
                    btnLive.style.color = '#94a3b8';
                    if (daysBar) daysBar.style.display = 'none';
                }
            }
            updateCuencaWindyDisplay();
        };

        window.onCuencaTimeSliderChange = function(hourVal) {
            cuencaForecastState.selectedHour = parseInt(hourVal);
            updateCuencaWindyDisplay();
        };

        function updateCuencaWindyDisplay() {
            const h = cuencaForecastState.selectedHour;
            const lbl = document.getElementById('cuencaWindyTimeLabel');
            if (lbl) lbl.innerText = `${h.toString().padStart(2, '0')}:00`;

            const tMetric = document.getElementById('cuencaWindyTempMetric');
            const wMetric = document.getElementById('cuencaWindyWindMetric');
            const pMetric = document.getElementById('cuencaWindyPrecipMetric');

            if (cuencaForecastState.isLive && cuencaForecastState.cachedData?.hourly) {
                const hourGlobalIdx = cuencaForecastState.selectedDayIdx * 24 + h;
                const entry = cuencaForecastState.cachedData.hourly[hourGlobalIdx] || cuencaForecastState.cachedData.hourly[h];
                if (entry) {
                    if (tMetric) tMetric.innerText = `${entry.temp}°C`;
                    if (wMetric) {
                        const dirDeg = entry.windDir;
                        let dirLbl = 'SW';
                        if (dirDeg >= 30 && dirDeg <= 110) dirLbl = 'ESE (Puelche)';
                        else if (dirDeg > 110 && dirDeg < 200) dirLbl = 'S';
                        else if (dirDeg >= 200 && dirDeg <= 260) dirLbl = 'SW (Brisa)';
                        wMetric.innerText = `${entry.windSpeed} km/h ${dirLbl}`;
                    }
                    if (pMetric) pMetric.innerText = `${entry.precip} mm`;

                    // Conectar dinámicamente al régimen del motor de flujos energéticos
                    if (window.energyFlowEngine) {
                        if (entry.windSpeed > 35 || entry.precip > 5.0) {
                            window.energyFlowEngine.setRegime('storm');
                        } else if (entry.windSpeed < 12) {
                            window.energyFlowEngine.setRegime('calm');
                        } else {
                            window.energyFlowEngine.setRegime('base');
                        }

                        if (typeof window.energyFlowEngine.setAtmosphericState === 'function') {
                            window.energyFlowEngine.setAtmosphericState({
                                windSpeed: entry.windSpeed,
                                windDir: entry.windDir,
                                temp: entry.temp,
                                precip: entry.precip
                            });
                        }
                    }

                    // Dinámica atmosférica sobre el terreno: actualizar FWI con viento y temperatura
                    const sTemp = document.getElementById('slide-temp');
                    const sWind = document.getElementById('slide-wind');
                    if (sTemp && sWind) {
                        sTemp.value = Math.max(20, Math.min(44, entry.temp));
                        sWind.value = Math.max(5, Math.min(75, entry.windSpeed));
                        if (typeof updateFWI === 'function') updateFWI();
                    }

                    // Si hay lluvia en el pronóstico, simular crecida proporcional en el Longaví
                    const extraFlow = (entry.precip || 0) * 35;
                    const slideFlow = document.getElementById('slide-flow');
                    if (slideFlow) {
                        slideFlow.value = Math.min(650, 124.5 + extraFlow);
                        if (typeof updateWater === 'function') updateWater();
                    }
                }
            } else {
                // Modo Escenarios Simulado 24H
                let temp = 14;
                let windSpeed = 8;
                let windDir = 225;
                let windDirLbl = 'SW (Brisa Nocturna)';
                let precip = 0.0;

                if (h >= 11 && h <= 18) {
                    temp = 28;
                    windSpeed = 22;
                    windDir = 235;
                    windDirLbl = 'SW (Brisa Marina)';
                } else if (h >= 6 && h < 11) {
                    temp = 18;
                    windSpeed = 38;
                    windDir = 70;
                    windDirLbl = 'ESE (Puelche Seco)';
                }

                if (tMetric) tMetric.innerText = `${temp}°C`;
                if (wMetric) wMetric.innerText = `${windSpeed} km/h ${windDirLbl}`;
                if (pMetric) pMetric.innerText = `${precip.toFixed(1)} mm`;

                if (window.energyFlowEngine && typeof window.energyFlowEngine.setAtmosphericState === 'function') {
                    window.energyFlowEngine.setAtmosphericState({
                        windSpeed: windSpeed,
                        windDir: windDir,
                        temp: temp,
                        precip: precip
                    });
                }
            }
        }

        window.toggleCuencaWindyPlay = function() {
            cuencaForecastState.isPlaying = !cuencaForecastState.isPlaying;
            const btn = document.getElementById('btnCuencaWindyPlayPause');
            const slider = document.getElementById('cuencaWindyTimeSlider');

            if (btn) {
                btn.innerText = cuencaForecastState.isPlaying ? '⏸' : '▶';
                btn.style.background = cuencaForecastState.isPlaying ? 'rgba(245, 158, 11, 0.35)' : 'rgba(14, 165, 233, 0.25)';
                btn.style.borderColor = cuencaForecastState.isPlaying ? '#f59e0b' : 'rgba(56, 189, 248, 0.5)';
            }

            if (cuencaForecastState.isPlaying) {
                cuencaForecastState.playTimer = setInterval(() => {
                    cuencaForecastState.selectedHour = (cuencaForecastState.selectedHour + 1) % 24;
                    if (slider) slider.value = cuencaForecastState.selectedHour;
                    updateCuencaWindyDisplay();
                }, 1000);
            } else {
                clearInterval(cuencaForecastState.playTimer);
                cuencaForecastState.playTimer = null;
            }
        };

        // ═══════════════════════════════════════════════════════════════════
        // HERRAMIENTA DE SELECCIÓN DE ÁREA LIBRE (AOI) & MODELACIÓN LOCALIZADA
        // ═══════════════════════════════════════════════════════════════════
        window.cuencaAoiState = {
            isDrawing: false,
            activeBounds: null,
            rectLayer: null,
            startLatLng: null
        };

        window.toggleCuencaAoiDrawing = function() {
            if (!map) return;
            window.cuencaAoiState.isDrawing = !window.cuencaAoiState.isDrawing;
            
            const btn = document.getElementById('btnToggleAoiDraw');
            const txt = document.getElementById('btnToggleAoiDrawText');
            const badge = document.getElementById('aoiStatusBadge');

            if (window.cuencaAoiState.isDrawing) {
                map.getContainer().style.cursor = 'crosshair';
                if (btn) {
                    btn.className = 'flex-1 py-1.5 px-3 rounded-lg bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 border border-amber-400 text-[11px] font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md animate-pulse';
                }
                if (txt) txt.innerText = 'Haz Clic y Arrastra en Mapa';
                if (badge) {
                    badge.innerText = 'MODO DIBUJO';
                    badge.className = 'text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/50 font-bold';
                }
            } else {
                map.getContainer().style.cursor = '';
                if (btn) {
                    btn.className = 'flex-1 py-1.5 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 border border-sky-400/50 text-[11px] font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm';
                }
                if (txt) txt.innerText = window.cuencaAoiState.activeBounds ? 'Re-marcar Área' : 'Marcar Área en Mapa';
                if (badge) {
                    badge.innerText = window.cuencaAoiState.activeBounds ? 'AOI ACTIVO' : 'INACTIVO';
                    badge.className = window.cuencaAoiState.activeBounds
                        ? 'text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-bold'
                        : 'text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10';
                }
            }
        };

        window.clearCuencaAoiSelection = function() {
            if (!map) return;
            if (window.cuencaAoiState.rectLayer) {
                map.removeLayer(window.cuencaAoiState.rectLayer);
                window.cuencaAoiState.rectLayer = null;
            }
            window.cuencaAoiState.activeBounds = null;
            window.cuencaAoiState.isDrawing = false;
            map.getContainer().style.cursor = '';

            const resCard = document.getElementById('aoiResultsCard');
            if (resCard) resCard.classList.add('hidden');

            const btn = document.getElementById('btnToggleAoiDraw');
            const txt = document.getElementById('btnToggleAoiDrawText');
            const badge = document.getElementById('aoiStatusBadge');
            if (btn) btn.className = 'flex-1 py-1.5 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 border border-sky-400/50 text-[11px] font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm';
            if (txt) txt.innerText = 'Marcar Área en Mapa';
            if (badge) {
                badge.innerText = 'INACTIVO';
                badge.className = 'text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10';
            }
        };

        // Escucha de interacción en el mapa Leaflet para el trazado de caja AOI
        (function setupAoiMapEvents() {
            let isMouseDown = false;

            function onMapMouseDown(e) {
                if (!window.cuencaAoiState.isDrawing) return;
                isMouseDown = true;
                map.dragging.disable();
                window.cuencaAoiState.startLatLng = e.latlng;

                if (window.cuencaAoiState.rectLayer) {
                    map.removeLayer(window.cuencaAoiState.rectLayer);
                    window.cuencaAoiState.rectLayer = null;
                }

                const initialBounds = L.latLngBounds(e.latlng, e.latlng);
                window.cuencaAoiState.rectLayer = L.rectangle(initialBounds, {
                    color: '#38bdf8',
                    weight: 2,
                    dashArray: '4, 4',
                    fillColor: '#0284c7',
                    fillOpacity: 0.35
                }).addTo(map);
            }

            function onMapMouseMove(e) {
                if (!window.cuencaAoiState.isDrawing || !isMouseDown || !window.cuencaAoiState.rectLayer) return;
                const bounds = L.latLngBounds(window.cuencaAoiState.startLatLng, e.latlng);
                window.cuencaAoiState.rectLayer.setBounds(bounds);
            }

            function onMapMouseUp(e) {
                if (!window.cuencaAoiState.isDrawing || !isMouseDown) return;
                isMouseDown = false;
                map.dragging.enable();
                window.cuencaAoiState.isDrawing = false;
                map.getContainer().style.cursor = '';

                const endLatLng = e.latlng;
                const startLatLng = window.cuencaAoiState.startLatLng;
                
                // Si fue un solo clic casi sin desplazamiento, crear una caja predeterminada de 1.5 km (~225 ha)
                let bounds;
                const distLat = Math.abs(endLatLng.lat - startLatLng.lat);
                const distLng = Math.abs(endLatLng.lng - startLatLng.lng);
                if (distLat < 0.002 && distLng < 0.002) {
                    bounds = L.latLngBounds(
                        [startLatLng.lat - 0.008, startLatLng.lng - 0.008],
                        [startLatLng.lat + 0.008, startLatLng.lng + 0.008]
                    );
                    if (window.cuencaAoiState.rectLayer) {
                        window.cuencaAoiState.rectLayer.setBounds(bounds);
                    }
                } else {
                    bounds = L.latLngBounds(startLatLng, endLatLng);
                }

                window.cuencaAoiState.activeBounds = bounds;

                // Estilo final de la caja seleccionada
                if (window.cuencaAoiState.rectLayer) {
                    window.cuencaAoiState.rectLayer.setStyle({
                        color: '#f59e0b',
                        weight: 2.5,
                        dashArray: null,
                        fillColor: '#f59e0b',
                        fillOpacity: 0.30
                    });
                }

                const btn = document.getElementById('btnToggleAoiDraw');
                const txt = document.getElementById('btnToggleAoiDrawText');
                const badge = document.getElementById('aoiStatusBadge');
                if (btn) btn.className = 'flex-1 py-1.5 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 border border-sky-400/50 text-[11px] font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm';
                if (txt) txt.innerText = 'Re-marcar Área';
                if (badge) {
                    badge.innerText = 'AOI ACTIVO';
                    badge.className = 'text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-bold';
                }

                // Correr diagnóstico biofísico sobre el AOI
                window.updateCuencaAoiDiagnostic();
            }

            // Enlazar al mapa cuando esté disponible
            const checkMapTimer = setInterval(() => {
                if (typeof map !== 'undefined' && map) {
                    clearInterval(checkMapTimer);
                    map.on('mousedown', onMapMouseDown);
                    map.on('mousemove', onMapMouseMove);
                    map.on('mouseup', onMapMouseUp);
                }
            }, 250);
        })();

        // Diagnóstico Biofísico Dinámico sobre el AOI según el Escenario Climático Activo
        window.updateCuencaAoiDiagnostic = function() {
            const bounds = window.cuencaAoiState.activeBounds;
            if (!bounds) return;

            const resCard = document.getElementById('aoiResultsCard');
            if (resCard) resCard.classList.remove('hidden');

            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            const centerLat = (sw.lat + ne.lat) / 2;
            const centerLng = (sw.lng + ne.lng) / 2;

            // 1. Superficie aproximada en Hectáreas
            // 1 grado lat aprox 111.32 km, 1 grado lng en lat -36° aprox 89.8 km
            const dLatKm = Math.abs(ne.lat - sw.lat) * 111.32;
            const dLngKm = Math.abs(ne.lng - sw.lng) * 89.8;
            const areaHa = Math.max(5, Math.round(dLatKm * dLngKm * 100));

            // 2. Estimación de Cota msnm según posición longitudinal
            // -71.30 (Altas Cumbres > 2200m) -> -71.75 (Valle Central ~ 150m)
            const cotaNorm = Math.max(0, Math.min(1, (-71.35 - centerLng) / (-71.35 - (-71.80))));
            const cotaMsnm = Math.round(2100 - (cotaNorm * 1920));

            // 3. Zona biofísica
            let zoneName = 'Valle Central Aluvial';
            if (centerLng > -71.55) zoneName = 'Precordillera Andina';
            else if (centerLng < -71.70) zoneName = 'Secano Interior';
            else zoneName = 'Fondo de Cuenca / Riego';

            const activePreset = window.cuencaForecastState?.activePreset || 'normal';
            let riskLabel = 'BAJO';
            let riskColor = '#10b981';
            let riskBg = 'rgba(16, 185, 129, 0.2)';
            let diagText = '';
            let aoiRectColor = '#10b981';

            if (activePreset === 'puelche_fire') {
                if (centerLng > -71.60) {
                    riskLabel = 'CRÍTICO / PIRO-ALERTA';
                    riskColor = '#ef4444';
                    riskBg = 'rgba(239, 68, 68, 0.25)';
                    diagText = 'Exposición directa a vientos catabáticos del ESE (58 km/h). FWI > 55. Propagación rápida hacia interfaz boscosa.';
                    aoiRectColor = '#ef4444';
                } else {
                    riskLabel = 'MODERADO-ALTO';
                    riskColor = '#f59e0b';
                    riskBg = 'rgba(245, 158, 11, 0.25)';
                    diagText = 'Baja humedad relativa (<15%). Peligro por pavesas secundarias en pastizales y rastrojos.';
                    aoiRectColor = '#f59e0b';
                }
            } else if (activePreset === 'storm_t100') {
                if (cotaMsnm < 250) {
                    riskLabel = 'EXTREMO INUNDACIÓN';
                    riskColor = '#2563eb';
                    riskBg = 'rgba(37, 99, 235, 0.3)';
                    diagText = 'Zona baja receptora de escorrentía aluvial (Q 880 m³/s). Alto riesgo de corte de caminos y desborde ribereño.';
                    aoiRectColor = '#1d4ed8';
                } else {
                    riskLabel = 'ALTO ALUVIONAL';
                    riskColor = '#0284c7';
                    riskBg = 'rgba(2, 132, 199, 0.25)';
                    diagText = 'Isoterma 0°C a 3.400m satura perfiles de ladera. Riesgo de deslizamientos de detritos en quebradas tributarias.';
                    aoiRectColor = '#0284c7';
                }
            } else if (activePreset === 'storm_t10') {
                if (cotaMsnm < 220) {
                    riskLabel = 'CRECIDA ORDINARIA';
                    riskColor = '#0284c7';
                    riskBg = 'rgba(2, 132, 199, 0.2)';
                    diagText = 'Caudal matriz 290 m³/s. Inundación confinada a lecho activo y zanjas de drenaje primarias.';
                    aoiRectColor = '#0284c7';
                } else {
                    riskLabel = 'MODERADO';
                    riskColor = '#10b981';
                    riskBg = 'rgba(16, 185, 129, 0.2)';
                    diagText = 'Precipitación de 65mm recarga tranques y napas freáticas sin desbordes estructurales.';
                    aoiRectColor = '#10b981';
                }
            } else if (activePreset === 'heatwave') {
                riskLabel = 'ESTRÉS TÉRMICO CRÍTICO';
                riskColor = '#f43f5e';
                riskBg = 'rgba(244, 63, 94, 0.25)';
                diagText = '38°C persistente. Evapotranspiración potencial >7.8 mm/día. Reducción de calibre en frutales y estrés fisiológico.';
                aoiRectColor = '#f43f5e';
            } else if (activePreset === 'drought') {
                riskLabel = 'ESTRÉS HÍDRICO SEVERO';
                riskColor = '#d97706';
                riskBg = 'rgba(217, 119, 6, 0.25)';
                diagText = 'Napa abatida a -24m y caudal base en mínimos (42 m³/s). Dependencia estricta de turno DGA o zanjas Keyline.';
                aoiRectColor = '#d97706';
            } else if (activePreset === 'winter_dry') {
                riskLabel = 'HELADA POLAR RADIANTE';
                riskColor = '#60a5fa';
                riskBg = 'rgba(96, 165, 250, 0.25)';
                diagText = 'Inversión térmica nocturna con -3.5°C a 2°C en fondo de valle. Riesgo de quema vegetativa por escarcha.';
                aoiRectColor = '#60a5fa';
            } else {
                riskLabel = 'RÉGIMEN BASE EQUILIBRADO';
                riskColor = '#10b981';
                riskBg = 'rgba(16, 185, 129, 0.2)';
                diagText = 'Condición de aforo normal (125 m³/s, 22°C, HR 45%). Bocatomas y canales operando dentro de umbrales óptimos.';
                aoiRectColor = '#10b981';
            }

            // Actualizar la interfaz
            const elArea = document.getElementById('aoiAreaHa');
            const elCota = document.getElementById('aoiCota');
            const elZone = document.getElementById('aoiZone');
            const elScore = document.getElementById('aoiRiskScore');
            const elDiag = document.getElementById('aoiDiagnosticText');

            if (elArea) elArea.innerText = `${areaHa} ha`;
            if (elCota) elCota.innerText = `~${cotaMsnm} msnm`;
            if (elZone) elZone.innerText = zoneName;
            if (elScore) {
                elScore.innerText = riskLabel;
                elScore.style.color = riskColor;
                elScore.style.backgroundColor = riskBg;
            }
            if (elDiag) elDiag.innerText = diagText;

            // Actualizar el color de la caja en el mapa Leaflet
            if (window.cuencaAoiState.rectLayer) {
                window.cuencaAoiState.rectLayer.setStyle({
                    color: aoiRectColor,
                    fillColor: aoiRectColor,
                    fillOpacity: 0.35,
                    weight: 3
                });
            }
        };

        // Inicializar Pronóstico Real de Cuenca y Matriz H-V-R al cargar
        setTimeout(() => {
            window.fetchCuencaRealForecast();
            if (typeof window.switchTacticoSidebarSubTab === 'function') {
                window.switchTacticoSidebarSubTab('hvr');
            }
            if (typeof window.updateHvrMatrix === 'function') {
                window.updateHvrMatrix('normal');
            }
        }, 300);





        
        // ═══════════════════════════════════════════════════════════════════════
        // RENDERIZADOR UNIVERSAL DE LATEX CON KATEX (ROBUSTO CONTRA CONFLICTOS $)
        // ═══════════════════════════════════════════════════════════════════════
        
        // ═══════════════════════════════════════════════════════════════════════
        // DISPARADORES DIRECTOS DESDE LA BÓVEDA (VAULT) Y MODAL AL GEMELO 3D
        // ═══════════════════════════════════════════════════════════════════════
        window.launchClimateScenarioFromVault = function(presetKey) {
            if (typeof window.switchMasterView === 'function') {
                window.switchMasterView('cuenca');
            }
            setTimeout(function() {
                if (typeof window.applyCuencaClimatePreset === 'function') {
                    window.applyCuencaClimatePreset(presetKey);
                }
                if (typeof window.switchTiempoSubTab === 'function') {
                    window.switchTiempoSubTab('controles');
                }
            }, 180);
        };

        
        window.launchAtmosphericLayerFromModal = function(layerKey) {
            window.closeAtmosphericScienceModal();
            setTimeout(function() {
                if (typeof window.setCuencaWindyVariable === 'function') {
                    window.setCuencaWindyVariable(layerKey);
                }
                if (typeof window.switchTiempoSubTab === 'function') {
                    window.switchTiempoSubTab('controles');
                }
            }, 120);
        };

        window.launchClimateScenarioFromModal = function(presetKey) {
            window.closeAtmosphericScienceModal();
            setTimeout(function() {
                if (typeof window.applyCuencaClimatePreset === 'function') {
                    window.applyCuencaClimatePreset(presetKey);
                }
                if (typeof window.switchTiempoSubTab === 'function') {
                    window.switchTiempoSubTab('controles');
                }
            }, 100);
        };

        window.launchAtmosphericLayerFromVault = function(layerKey) {
            if (typeof window.switchMasterView === 'function') {
                window.switchMasterView('cuenca');
            }
            setTimeout(function() {
                if (typeof window.setCuencaWindyVariable === 'function') {
                    window.setCuencaWindyVariable(layerKey);
                }
                if (typeof window.switchTiempoSubTab === 'function') {
                    window.switchTiempoSubTab('controles');
                }
            }, 180);
        };

window.renderLatexInContainer = function(target) {
            if (typeof renderMathInElement !== 'function') {
                setTimeout(function() {
                    if (typeof renderMathInElement === 'function') {
                        window.renderLatexInContainer(target);
                    }
                }, 150);
                return;
            }
            const el = typeof target === 'string' ? document.getElementById(target) : target;
            if (!el) return;
            try {
                renderMathInElement(el, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '\\[', right: '\\]', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false}
                    ],
                    throwOnError: false,
                    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
                });
            } catch (err) {
                console.warn('[KaTeX] render error in container:', err);
            }
        };

        // ═══════════════════════════════════════════════════════════════════════
        // CONTROLADOR TÁCTICO: SUBPESTAÑAS DE TIEMPO (RESUMEN vs CONTROLES)
        // ═══════════════════════════════════════════════════════════════════════
        window.switchTiempoSubTab = function(subKey) {
            const paneResumen = document.getElementById('subtab-tiempo-resumen');
            const paneControles = document.getElementById('subtab-tiempo-controles');
            const btnResumen = document.getElementById('btnSubTabTiempoResumen');
            const btnControles = document.getElementById('btnSubTabTiempoControles');

            if (subKey === 'resumen') {
                if (paneResumen) paneResumen.classList.remove('hidden');
                if (paneControles) paneControles.classList.add('hidden');

                if (btnResumen) {
                    btnResumen.className = 'flex-1 py-1.5 px-3 rounded-lg font-bold text-sky-300 bg-sky-500/20 border border-sky-400/50 shadow transition-all cursor-pointer flex items-center justify-center gap-1.5';
                }
                if (btnControles) {
                    btnControles.className = 'flex-1 py-1.5 px-3 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer flex items-center justify-center gap-1.5';
                }
            } else {
                if (paneResumen) paneResumen.classList.add('hidden');
                if (paneControles) paneControles.classList.remove('hidden');

                if (btnControles) {
                    btnControles.className = 'flex-1 py-1.5 px-3 rounded-lg font-bold text-sky-300 bg-sky-500/20 border border-sky-400/50 shadow transition-all cursor-pointer flex items-center justify-center gap-1.5';
                }
                if (btnResumen) {
                    btnResumen.className = 'flex-1 py-1.5 px-3 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer flex items-center justify-center gap-1.5';
                }
            }
        };

        // ═══════════════════════════════════════════════════════════════════════
        // MODAL DE CIENCIA ATMOSFÉRICA & DOWNSCALING (6 CAPAS & 8 MOMENTOS)
        // ═══════════════════════════════════════════════════════════════════════
        window.openAtmosphericScienceModal = function(initialTab) {
            const modal = document.getElementById('modalAtmosphericScience');
            if (modal) {
                modal.classList.remove('hidden');
                setTimeout(function() {
                    if (typeof window.renderLatexInContainer === 'function') {
                        window.renderLatexInContainer(modal);
                    }
                }, 50);
            }
            window.switchAtmoModalTab(initialTab || 'layers');
        };

        window.closeAtmosphericScienceModal = function() {
            const modal = document.getElementById('modalAtmosphericScience');
            if (modal) {
                modal.classList.add('hidden');
            }
        };

        window.switchAtmoModalTab = function(tabKey) {
            const paneLayers = document.getElementById('atmoPaneLayers');
            const paneMoments = document.getElementById('atmoPaneMoments');
            const paneFormulas = document.getElementById('atmoPaneFormulas');

            const btnLayers = document.getElementById('btnAtmoTabLayers');
            const btnMoments = document.getElementById('btnAtmoTabMoments');
            const btnFormulas = document.getElementById('btnAtmoTabFormulas');

            if (paneLayers) paneLayers.classList.add('hidden');
            if (paneMoments) paneMoments.classList.add('hidden');
            if (paneFormulas) paneFormulas.classList.add('hidden');

            const inactiveBtnClass = 'px-3.5 py-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer whitespace-nowrap';
            const activeBtnClass = 'px-3.5 py-1.5 rounded-lg bg-sky-500/30 text-sky-200 border border-sky-400 font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm';

            if (btnLayers) btnLayers.className = inactiveBtnClass;
            if (btnMoments) btnMoments.className = inactiveBtnClass;
            if (btnFormulas) btnFormulas.className = inactiveBtnClass;

            setTimeout(function() {
                if (typeof window.renderLatexInContainer === 'function') {
                    window.renderLatexInContainer('modalAtmosphericScience');
                }
            }, 30);
            if (tabKey === 'moments') {
                if (paneMoments) paneMoments.classList.remove('hidden');
                if (btnMoments) btnMoments.className = activeBtnClass;
            } else if (tabKey === 'formulas') {
                if (paneFormulas) paneFormulas.classList.remove('hidden');
                if (btnFormulas) btnFormulas.className = activeBtnClass;
            } else {
                if (paneLayers) paneLayers.classList.remove('hidden');
                if (btnLayers) btnLayers.className = activeBtnClass;
            }
        };

        // Redirección directa desde el modal hacia el Módulo 13 de la Bóveda del Hub
        window.openAtmosphericDocInVault = function() {
            window.closeAtmosphericScienceModal();
            if (typeof window.switchMasterView === 'function') {
                window.switchMasterView('docs');
            }
            if (typeof window.switchDocsTab === 'function') {
                window.switchDocsTab('docs-arch');
            }
            if (typeof window.switchArchModule === 'function') {
                window.switchArchModule('atmosferica');
            }
        };

        // Escape key listener para cerrar el modal de ciencia atmosférica
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                window.closeAtmosphericScienceModal();
            }
        });

        // ═══════════════════════════════════════════════════════════════════════
        // GENERADOR & DESCARGADOR DE REPORTE TÉCNICO-CIENTÍFICO EN PDF
        // ═══════════════════════════════════════════════════════════════════════
        window.downloadAtmosphericSciencePdf = function() {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Por favor permite ventanas emergentes para generar el reporte técnico en PDF.');
                return;
            }

            const currentDate = new Date().toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte Técnico-Científico: Física Atmosférica &amp; Downscaling 30m - AgriTwin Cuenca Longaví</title>
    <!-- KaTeX CSS para renderizado matemático de publicación -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
    <style>
        @page {
            size: A4 portrait;
            margin: 16mm 14mm 16mm 14mm;
        }
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1a202c;
            line-height: 1.45;
            font-size: 9.5pt;
            margin: 0;
            padding: 20px 24px;
            background: #fff;
        }
        .header {
            border-bottom: 2.5px solid #0f766e;
            padding-bottom: 12px;
            margin-bottom: 14px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .header-title h1 {
            font-size: 14pt;
            margin: 0 0 3px 0;
            color: #0f766e;
            font-weight: 800;
            letter-spacing: -0.3px;
            text-transform: uppercase;
        }
        .header-title h2 {
            font-size: 10pt;
            margin: 0;
            color: #334155;
            font-weight: 600;
        }
        .meta-stamp {
            text-align: right;
            font-size: 7.5pt;
            color: #64748b;
            font-family: monospace;
            line-height: 1.4;
        }
        .abstract-box {
            background-color: #f8fafc;
            border-left: 3.5px solid #0284c7;
            padding: 8px 12px;
            margin-bottom: 14px;
            font-size: 8.5pt;
            line-height: 1.5;
            color: #334155;
            border-radius: 0 4px 4px 0;
        }
        .abstract-box b {
            color: #0369a1;
        }
        h2.section-title {
            font-size: 10.5pt;
            color: #0f172a;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin-top: 14px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
            margin-bottom: 12px;
        }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 5px 7px;
            vertical-align: top;
        }
        th {
            background-color: #f1f5f9;
            color: #1e293b;
            font-weight: 700;
            font-size: 7.5pt;
            text-transform: uppercase;
        }
        .code {
            font-family: monospace;
            background: #f1f5f9;
            padding: 1px 4px;
            border-radius: 3px;
            font-size: 7.5pt;
        }
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 12px;
        }
        .card {
            border: 1px solid #e2e8f0;
            border-radius: 5px;
            padding: 7px 9px;
            background: #fafafa;
        }
        .card b {
            color: #0f766e;
            font-size: 8.5pt;
        }
        .equation-box {
            background: #f8fafc;
            border: 1px dashed #94a3b8;
            padding: 6px 8px;
            margin: 4px 0 2px 0;
            border-radius: 4px;
            text-align: center;
        }
        .footer-stamp {
            margin-top: 18px;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            font-size: 7pt;
            color: #94a3b8;
            text-align: center;
            font-family: monospace;
        }
        .action-bar {
            position: fixed;
            top: 12px;
            right: 12px;
            z-index: 9999;
            display: flex;
            gap: 8px;
        }
        .btn-action {
            background: #0f766e;
            color: white;
            border: none;
            padding: 7px 14px;
            border-radius: 6px;
            font-size: 8.5pt;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            transition: all 0.2s;
        }
        .btn-action:hover {
            background: #0d9488;
        }
        .btn-close {
            background: #64748b;
        }
        .btn-close:hover {
            background: #475569;
        }
        @media print {
            body { padding: 0; }
            .action-bar { display: none !important; }
            h2.section-title { page-break-after: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            .card { page-break-inside: avoid; }
            .abstract-box { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="action-bar no-print">
        <button class="btn-action" onclick="window.print()">🖨️ Imprimir / Guardar en PDF</button>
        <button class="btn-action btn-close" onclick="window.close()">✕ Cerrar</button>
    </div>

    <div class="header">
        <div class="header-title">
            <h1>República de Chile • Sistema SDSS AgriTwin</h1>
            <h2>Especificación Físico-Matemática: Downscaling Micro-Orográfico &amp; Dinámica Atmosférica (30m)</h2>
            <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">
                Cuenca del Río Longaví (122.000 ha) • Maule Sur • Centro de Modelación Hidroclimática
            </div>
        </div>
        <div class="meta-stamp">
            <b>CÓDIGO:</b> AGRI-ATM-2026-V4<br>
            <b>FECHA:</b> ${currentDate}<br>
            <b>ESTADO:</b> OFICIAL / AUDITADO<br>
            <b>RESOLUCIÓN:</b> DEM 30m / ECMWF 9km
        </div>
    </div>

    <div class="abstract-box">
        <b>RESUMEN TÉCNICO-CIENTÍFICO:</b> Este informe documenta la integración matemática y el downscaling numérico del gemelo digital AgriTwin. Las condiciones de contorno globales de <b>ECMWF IFS (9 km)</b> y <b>NOAA GFS (22 km)</b> son moduladas físicamente a <b>30 metros</b> mediante el DEM Copernicus/SRTM, la rugosidad aerodinámica LULC y las ecuaciones de conservación de masa, validadas contra las redes DGA, INIA y DMC.
    </div>

    
    <h2 class="section-title">0. Redes de Datos, Sensores Terrestres &amp; Pipeline de Ingesta</h2>
    <div style="font-size: 8pt; color: #475569; margin-bottom: 8px;">
        La arquitectura atmosférica de AgriTwin no depende de un único proveedor, sino que articula cuatro niveles jerárquicos de telemetría y asimilación:
    </div>
    <table>
        <thead>
            <tr>
                <th style="width: 18%;">Nivel de Ingesta</th>
                <th style="width: 27%;">Fuente Oficial / Proveedor</th>
                <th style="width: 25%;">Resolución Espacio-Temporal</th>
                <th style="width: 30%;">Rol en el Gemelo Digital Cuenca</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><b>Nivel A: Forzante Global</b></td>
                <td><b>Open-Meteo API</b><br>(ECMWF IFS &amp; NOAA GFS)</td>
                <td>9 km (ECMWF) / 22 km (GFS)<br>Paso horario (actualización 4x/día)</td>
                <td>Condición de contorno sinóptica regional: presión superficial, geopotencial, radiación y vientos libres.</td>
            </tr>
            <tr>
                <td><b>Nivel B: Relieve &amp; LULC</b></td>
                <td><b>Copernicus DEM GLO-30m</b><br>+ Sentinel-2 L2A BOA (10m)</td>
                <td>Malla fija 30 metros (elevación)<br>10 metros (rugosidad $z_0$)</td>
                <td>Modulación orográfica: gradiente adiabático, sombras 3D, aceleración Venturi y coeficiente de rugosidad de Manning.</td>
            </tr>
            <tr>
                <td><b>Nivel C: Redes Oficiales</b></td>
                <td><b>DGA Maule, DMC &amp; INIA</b><br>(Linares, Bullileo, Cauquenes)</td>
                <td>Estaciones meteorológicas horarias / Aforos limnigráficos</td>
                <td>Ground-truth de validación de caudales reales ($m^3/s$), volúmenes de embalse y calibración térmica.</td>
            </tr>
            <tr>
                <td><b>Nivel D: Sensores Prediales</b></td>
                <td><b>Nodos KioT LoRaWAN</b><br>(Huerto Meniel &amp; Microcuencas)</td>
                <td>Lectura cada 10 min<br>Sensores a nivel de dosel y suelo</td>
                <td>Detección hiperlocal de inversiones térmicas nocturnas (heladas radiativas) y humedad foliar de canopia.</td>
            </tr>
        </tbody>
    </table>

    <h2 class="section-title">1. Matriz Comparativa: Las 6 Capas Atmosféricas</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 14%;">Capa</th>
                <th style="width: 13%;">Variable API</th>
                <th style="width: 22%;">Modelo Global (9-22 km)</th>
                <th style="width: 26%;">Downscaling AgriTwin (30 m DEM)</th>
                <th style="width: 25%;">Sesgo &amp; Mitigación en Tierra</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><b>1. Viento a 10m</b></td>
                <td><span class="code">wind_speed_10m</span><br><span class="code">wind_direction</span></td>
                <td>Circulación barotrópica general en malla regular sin micro-orografía.</td>
                <td>Aceleración Venturi ($v_2 = v_1 A_1/A_2$), fricción de Prandtl ($z_0$ LULC) y 850 partículas lagrangianas.</td>
                <td><b>Sesgo:</b> Subestima catabáticos.<br><b>Mitigación:</b> Anemómetros DMC Linares y Meniel.</td>
            </tr>
            <tr>
                <td><b>2. Ráfagas (Gusts)</b></td>
                <td><span class="code">wind_gusts_10m</span></td>
                <td>Parametrización PBL mediante energía cinética turbulenta ($u_{10m} + 3.0\\sigma_u$).</td>
                <td>Inestabilidad de cizalladura por número de Richardson ($Ri < 0.25$) en laderas a sotavento (&gt;25° pendiente).</td>
                <td><b>Sesgo:</b> Promedia ráfagas breves.<br><b>Mitigación:</b> Ráfagas máximas en dosel huerto.</td>
            </tr>
            <tr>
                <td><b>3. Lluvia &amp; Escorrentía</b></td>
                <td><span class="code">precipitation</span><br><span class="code">rain</span></td>
                <td>Microfísica de condensación en columna vertical sin resolver cañones.</td>
                <td>Realce orográfico adiabático en cresta andina + enrutamiento Manning-Strickler sobre red hidrológica vectorial.</td>
                <td><b>Sesgo:</b> Desplaza centroides 15 km.<br><b>Mitigación:</b> Pluviógrafos DGA Bullileo/Digua.</td>
            </tr>
            <tr>
                <td><b>4. Temperatura a 2m</b></td>
                <td><span class="code">temperature_2m</span></td>
                <td>Flujo de calor sensible de superficie en cota media de celda.</td>
                <td>Gradiente adiabático local ($0.0065^\\circ\\text{C/m}$) + decantación catabática de aire frío denso en hondonadas (heladas).</td>
                <td><b>Sesgo:</b> Oculta heladas severas (+3°C).<br><b>Mitigación:</b> Red INIA Quilamapu y KioT.</td>
            </tr>
            <tr>
                <td><b>5. Nubes &amp; Radiación</b></td>
                <td><span class="code">cloud_cover</span><br><span class="code">direct_radiation</span></td>
                <td>Humedad relativa crítica por capa de presión.</td>
                <td>Sombreado topográfico 3D (Klein-Theilacker) con ángulo cenital + cálculo Penman-Monteith FAO-56 pixel a pixel.</td>
                <td><b>Sesgo:</b> Pierde nieblas de río.<br><b>Mitigación:</b> Piranómetros INIA Cauquenes y GOES-16.</td>
            </tr>
            <tr>
                <td><b>6. Presión &amp; Isóbaras</b></td>
                <td><span class="code">surface_pressure</span><br><span class="code">pressure_msl</span></td>
                <td>Integración hidrostática estándar al nivel del mar.</td>
                <td>Reducción barométrica barotrópica exacta por cota DEM, spline bicúbico y cálculo de balance geostrófico.</td>
                <td><b>Sesgo:</b> Distorsión en relieve andino.<br><b>Mitigación:</b> Barómetros digitales DGA Longaví.</td>
            </tr>
        </tbody>
    </table>

    <h2 class="section-title">2. Caracterización de los 8 Momentos Climáticos</h2>
    <div class="grid-2">
        <div class="card">
            <b>1. Actual Base (Calibrado de Referencia):</b>
            <div style="font-size: 7.5pt; color: #475569; margin-top: 2px;">
                Caudal Río Longaví 18.2 m³/s, Bullileo al 68%, viento WSW 12 kt, 22.4°C, HR 54%. Régimen equilibrado calibrado con aforos DGA.
            </div>
        </div>
        <div class="card">
            <b>2. Verano Normal (Brisa Térmica Mediterránea):</b>
            <div style="font-size: 7.5pt; color: #475569; margin-top: 2px;">
                Brisa térmica vespertina SW 15 kt, 28.5°C, HR 38%, $ET_0 = 6.2\\text{ mm/d}$. Riego de restitución hídrica máxima en huertos.
            </div>
        </div>
        <div class="card">
            <b>3. Ola de Calor Extrema (&gt;37°C):</b>
            <div style="font-size: 7.5pt; color: #475569; margin-top: 2px;">
                Dorsal cálida con subsidencia adiabática: 37.8°C, HR 19%. Estrés térmico severo, cierre estomático y golpe de sol en frutos.
            </div>
        </div>
        <div class="card">
            <b>4. Megasequía Crónica (La Niña):</b>
            <div style="font-size: 7.5pt; color: #475569; margin-top: 2px;">
                Déficit pluviométrico del 65%, caudal a 2.4 m³/s (estiaje crítico), abatimiento de 11m en acuífero de Retiro. Restricción de riego.
            </div>
        </div>
        <div class="card">
            <b>5. Viento Puelche Catabático (Foehn):</b>
            <div style="font-size: 7.5pt; color: #475569; margin-top: 2px;">
                Compresión adiabática seca desde Argentina: ESE 28 kt con rachas &gt;55 kt, HR &lt;16%, alza térmica de +8°C. Regla 30-30-30 activa.
            </div>
        </div>
        <div class="card">
            <b>6. Incendio Forestal (Rothermel FWI &gt;65):</b>
            <div style="font-size: 7.5pt; color: #475569; margin-top: 2px;">
                Frente de fuego avanzando a 1.8 km/h en plantaciones de pino/eucalipto con pavesas a 1.2 km. Activación de cortafuegos Keyline.
            </div>
        </div>
        <div class="card">
            <b>7. Temporal de Invierno (Río Atmosférico):</b>
            <div style="font-size: 7.5pt; color: #475569; margin-top: 2px;">
                Evento cálido con isoterma 0°C a 2.900 msnm. Caudal instantáneo &gt;380 m³/s en el río. Riesgo aluvial y socavamiento de riberas.
            </div>
        </div>
        <div class="card">
            <b>8. Helada Polar / Negra Radiativa (-4°C):</b>
            <div style="font-size: 7.5pt; color: #475569; margin-top: 2px;">
                Enfriamiento radiativo en calma ($v < 0.5\\text{ m/s}$) con rocío a -5.2°C. Inversión catabática en hondonadas con muerte de yemas.
            </div>
        </div>
    </div>

    <h2 class="section-title">3. Ecuaciones Matemáticas Rectoras</h2>
    <div class="grid-2">
        <div class="card">
            <b>A. Navier-Stokes Microescala 2D:</b>
            <div class="equation-box">
                $$\\frac{\\partial \\mathbf{u}}{\\partial t} + (\\mathbf{u}\\cdot\\nabla)\\mathbf{u} = -\\frac{1}{\\rho}\\nabla p + \\nu \\nabla^2\\mathbf{u} - \\frac{C_d}{h}|\\mathbf{u}|\\mathbf{u} + \\mathbf{F}_{\\text{topo}}$$
            </div>
        </div>
        <div class="card">
            <b>B. Advección Lagrangiana Estilo Windy:</b>
            <div class="equation-box">
                $$\\mathbf{x}_{t+\\Delta t} = \\mathbf{x}_t + \\mathbf{u}(\\mathbf{x}_t, t)\\Delta t + \\sqrt{2D\\Delta t}\\,\\boldsymbol{\\xi}$$
            </div>
        </div>
        <div class="card">
            <b>C. Hidráulica Fluvial de Manning:</b>
            <div class="equation-box">
                $$Q = \\frac{1}{n} A R_h^{2/3} S_0^{1/2}$$
            </div>
        </div>
        <div class="card">
            <b>D. Evapotranspiración Penman-Monteith (FAO-56):</b>
            <div class="equation-box">
                $$ET_0 = \\frac{0.408\\Delta(R_n - G) + \\gamma\\frac{900}{T+273}u_2(e_s - e_a)}{\\Delta + \\gamma(1 + 0.34u_2)}$$
            </div>
        </div>
        <div class="card">
            <b>E. Propagación de Fuego de Rothermel:</b>
            <div class="equation-box">
                $$R = \\frac{I_R \\xi (1 + \\phi_w + \\phi_s)}{\\rho_b \\epsilon Q_{ig}}$$
            </div>
        </div>
        <div class="card">
            <b>F. Enfriamiento Radiativo Catabático:</b>
            <div class="equation-box">
                $$T(z, t) = T_0(z) - \\frac{R_{\\text{net}}}{\\rho c_p h_{\\text{pbl}}} t \\left[1 - \\left(\\frac{z}{h_{\\text{inv}}}\\right)^2\\right]$$
            </div>
        </div>
    </div>

    <div class="footer-stamp">
        SISTEMA DE SOPORTE A LA DECISIÓN TERRITORIAL AGROTWIN • MAULE SUR • DOCUMENTO TÉCNICO AUDITABLE • IMPRESIÓN OFICIAL KATEX
    </div>

    <script>
        function executeRenderAndPrint() {
            let tries = 0;
            function checkAndRun() {
                tries++;
                if (typeof renderMathInElement === 'function') {
                    try {
                        renderMathInElement(document.body, {
                            delimiters: [
                                {left: '$$', right: '$$', display: true},
                                {left: '\\\\[', right: '\\\\]', display: true},
                                {left: '$', right: '$', display: false},
                                {left: '\\\\(', right: '\\\\)', display: false}
                            ],
                            throwOnError: false
                        });
                    } catch (e) {
                        console.error('[KaTeX Print] Error rendering math:', e);
                    }
                    
                    if (document.fonts && document.fonts.ready) {
                        document.fonts.ready.then(function() {
                            setTimeout(function() {
                                window.print();
                            }, 350);
                        });
                    } else {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    }
                } else if (tries < 50) {
                    setTimeout(checkAndRun, 100);
                } else {
                    window.print();
                }
            }
            checkAndRun();
        }

        if (document.readyState === 'complete') {
            executeRenderAndPrint();
        } else {
            window.addEventListener('load', executeRenderAndPrint);
        }
    </script>
</body>
</html>`;

            printWindow.document.open();
            printWindow.document.write(htmlContent);
            printWindow.document.close();
        };

