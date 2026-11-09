/**
 * AgriTwin Hub - Fuentes de Datos Territoriales & Inspector Operacional
 * Permite explorar cómo opera cada organismo oficial (DGA, ISRIC, Copernicus, INIA, CONAF, ECMWF, KioT)
 * y muestra la estructura real del payload extraído para la Cuenca del Maule Sur / Fundo Meniel.
 */

const AGRITWIN_DATA_SOURCES = {
    dga: {
        id: 'dga',
        name: 'Dirección General de Aguas (DGA-MOP Chile)',
        shortName: 'DGA-MOP',
        country: 'Chile 🇨🇱',
        founded: 1969,
        logo: 'assets/sources/dga_logo.jpg',
        protocol: 'API REST SNIH & Red BNA Oficial',
        protocolBadge: 'bg-blue-100 text-blue-800 border-blue-300',
        headline: 'Red Hidrométrica Oficial de Cauces Fluviales y Pozos de Agua Subterránea (SHAC)',
        description: 'La DGA es el órgano del Ministerio de Obras Públicas responsable de la administración del Código de Aguas, monitoreo de caudales superficiales y niveles freáticos en Chile.',
        keyMetrics: [
            { label: 'Estación Activa', val: 'Longaví en El Canelo (07354002-1)' },
            { label: 'Caudal en Vivo', val: '14.82 m³/s' },
            { label: 'Nivel de Escurrimiento', val: '1.42 m' },
            { label: 'Anomalía vs. Histórico', val: '-33.8% (Déficit Moderado)' }
        ],
        payload: {
            "provider": "Dirección General de Aguas (DGA-MOP)",
            "jurisdiction": "Chile",
            "station_bna": "07354002-1",
            "station_name": "Rio Longavi En El Canelo",
            "basin": "073 - Rio Maule",
            "subbasin": "0735 - Rio Longavi",
            "coordinates": { "lat": -36.0825, "lon": -71.4883, "elevation_m": 340 },
            "status": "OPERATIONAL_REALTIME",
            "last_synced_utc": "2026-11-08T21:00:00Z",
            "latest_readings": [
                { "timestamp_local": "2026-11-08 18:00", "discharge_m3s": 14.82, "stage_m": 1.42, "qc_flag": "AUTOMATED_VALID" },
                { "timestamp_local": "2026-11-08 17:00", "discharge_m3s": 15.10, "stage_m": 1.44, "qc_flag": "AUTOMATED_VALID" },
                { "timestamp_local": "2026-11-08 16:00", "discharge_m3s": 15.65, "stage_m": 1.47, "qc_flag": "AUTOMATED_VALID" }
            ],
            "hydro_context": {
                "q_monthly_median_november": 22.40,
                "q85_drought_threshold": 11.20,
                "current_flow_regime": "BASEFLOW_DECLINING",
                "water_rights_allocation_pct": 68.2
            }
        },
        operation: {
            frequency: 'Horaria continua (sensores de nivel acústicos y radar DGA)',
            acquisition: 'Consulta automatizada HTTP REST al Sistema Nacional de Información Hidrológica (SNIH / DGA-R) y cruce con el Banco Nacional de Aguas (BNA).',
            preprocessing: 'Filtrado de anomalías por spike-test, validación contra curva de descarga $H-Q$ calibrada, cálculo de anomalías relativas contra la normal hidrológica 1991-2020.',
            storageSize: '~42 KB por estación/mes (series temporales comprimidas JSON/Parquet).',
            coverageScope: 'Nacional Chile: >1,200 estaciones fluviométricas y >800 pozos de la red piezométrica.'
        },
        agronomicUtility: {
            question: '¿Para qué le sirve este dato al agricultor en su predio?',
            answer: 'Te permite saber exactamente con cuánta agua viene el río o canal matriz antes de abrir las compuertas de tu predio o acordar turnos de riego con la Junta de Vigilancia del Río Longaví. Si el río cae por debajo del umbral de alerta, el gemelo digital te avisa 48 horas antes para adelantar riegos en cuarteles críticos y evitar encender bombas de pozo profundo innecesariamente.',
            economicImpact: 'Ahorro estimado: $3.2M a $5.8M CLP por temporada en bombeo eléctrico optimizado y prevención de estrés hídrico en cuaja de frutales.',
            expedienteAction: 'En tu Expediente Predial puedes vincular el código de tu derecho de agua (DGA) para asociar el aforo oficial al balance de tus potreros.'
        }
    },

    isric: {
        id: 'isric',
        name: 'ISRIC – World Soil Information (SoilGrids 2.0)',
        shortName: 'ISRIC SoilGrids',
        country: 'Países Bajos 🇳🇱 / Global',
        founded: 1966,
        logo: 'assets/sources/isric_museum_thumb.jpg',
        protocol: 'REST API & Web Coverage Service (WCS)',
        protocolBadge: 'bg-amber-100 text-amber-800 border-amber-300',
        headline: 'Base de Datos Global Edafológica Digital a 250 m con Cuantificación Espacial de Incertidumbre',
        description: 'Custodio del World Soil Museum en Wageningen y centro mundial de datos de suelos bajo el Consejo Científico Internacional (ISC). Modela la distribución 3D de propiedades edáficas mediante Quantile Regression Forests sobre más de 240,000 perfiles WoSIS.',
        keyMetrics: [
            { label: 'Carbono Orgánico (0-5cm)', val: '28.4 g/kg (SOC)' },
            { label: 'Densidad Aparente Seca', val: '1.28 g/cm³ (BDOD)' },
            { label: 'Stock Carbono Hectárea', val: '16.62 t C/ha (SOCS 0-5cm)' },
            { label: 'Stock Carbono Equivalente', val: '251.01 t CO₂e/ha (0-30cm)' }
        ],
        payload: {
            "provider": "ISRIC - World Soil Information",
            "dataset": "SoilGrids 2.0 (Poggio et al., 2021)",
            "spatial_resolution": "250m grid (Quantile Regression Forests)",
            "target_location": { "lat": -35.9876, "lon": -71.5123, "predio_alias": "Fundo Meniel, Longavi" },
            "soil_taxonomy_wrb": "Eutric Fluvisols / Cambisols",
            "depth_horizons": {
                "layer_0_5cm": {
                    "soc_organic_carbon_g_kg": { "mean": 28.4, "q05": 21.2, "q95": 36.8 },
                    "bdod_bulk_density_g_cm3": { "mean": 1.28, "q05": 1.15, "q95": 1.41 },
                    "clay_pct": 24.5, "sand_pct": 42.1, "silt_pct": 33.4,
                    "crf_coarse_fragments_pct": 8.5,
                    "ph_h2o": 6.4,
                    "cec_cmolc_kg": 18.2
                },
                "layer_5_15cm": { "soc_organic_carbon_g_kg": { "mean": 19.8 }, "bdod_bulk_density_g_cm3": { "mean": 1.34 } },
                "layer_15_30cm": { "soc_organic_carbon_g_kg": { "mean": 14.1 }, "bdod_bulk_density_g_cm3": { "mean": 1.40 } }
            },
            "agritwin_calculated_stocks": {
                "socs_0_5cm_tC_ha": 16.62,
                "socs_total_0_30cm_tC_ha": 68.45,
                "equivalent_co2e_sequestered_t_ha": 251.01,
                "ipcc_tier_level": "Tier 2 Pedotransfer Function with WoSIS harmonization"
            }
        },
        operation: {
            frequency: 'Línea de base estandarizada multi-anual (resolución 250m)',
            acquisition: 'Descarga mediante WCS / REST API de ISRIC y biblioteca científica R `geodata::soil_world(var="soc", depth=5)` acoplada al motor GeoTIFF raster.',
            preprocessing: 'Recorte exacto por polígono predial (GeoJSON), extracción multi-profundidad (0-5, 5-15, 15-30 cm), integración de textura (arcilla, arena, limo) en ecuaciones de pedotransferencia de Saxton & Rawls (2006) para retención hídrica ($SPAC$).',
            storageSize: '~85 KB por predio (GeoJSON de polígono + perfiles matriciales).',
            coverageScope: 'Cobertura planetaria continua (todos los continentes excepto Antártica).'
        },
        agronomicUtility: {
            question: '¿Para qué le sirve este dato al agricultor en su predio?',
            answer: 'Conoces la calidad biológica de tu suelo, su capacidad de almacenar agua de lluvia (AWC) y el stock de carbono ya retenido sin tener que pagar cientos de miles de pesos por calicatas de laboratorio. Esto te permite postular a programas de certificación de carbono y planificar rotaciones de pastoreo regenerativo para aumentar la fertilidad natural.',
            economicImpact: 'Ahorro de $600,000 CLP en análisis edáficos iniciales y habilitación de bonos de secuestro de carbono valorados en $30-45 USD por tonelada de CO₂e.',
            expedienteAction: 'Al dar de alta tu predio en el Expediente, se extraen automáticamente tus horizontes de suelo para calcular la tasa de infiltración Keyline.'
        }
    },

    copernicus: {
        id: 'copernicus',
        name: 'Copernicus / ESA – Sentinel-2 L2A',
        shortName: 'Sentinel-2 L2A',
        country: 'Unión Europea 🇪🇺 / Global',
        founded: 1998,
        logo: 'assets/sources/esa_logo.svg',
        protocol: 'SpatioTemporal Asset Catalog (STAC) & COG',
        protocolBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        headline: 'Constelación Satelital Óptica Multiespectral a 10-20 m con Revisitación Cada 5 Días',
        description: 'Programa espacial insignia europeo operado por la Agencia Espacial Europea (ESA). La constelación Sentinel-2A/2B proporciona 13 bandas espectrales desde el visible hasta el infrarrojo de onda corta (SWIR).',
        keyMetrics: [
            { label: 'Última Escena', val: 'S2B Tile 19HBD (05 Nov 2026)' },
            { label: 'Vigor Foliar NDVI', val: '0.791 (Dosel Denso)' },
            { label: 'Clorofila Red Edge', val: '0.556 (NDRE) / 0.184 (MCARI)' },
            { label: 'Cobertura Nubosa Predio', val: '0.0% (Cielo Despejado)' }
        ],
        payload: {
            "provider": "European Space Agency (ESA) - Copernicus Programme",
            "satellite_mission": "Sentinel-2B MSI (MultiSpectral Instrument)",
            "processing_level": "Level-2A (Surface Reflectance BOA / Sen2Cor)",
            "granule_id": "S2B_MSIL2A_20261105T144029_N0500_R096_T19HBD",
            "acquisition_date_utc": "2026-11-05T14:40:29Z",
            "tile_code": "19HBD",
            "cloud_coverage_scene_pct": 2.14,
            "predio_cloud_mask_pct": 0.0,
            "surface_reflectance_bands": {
                "B02_blue_490nm": 0.0418,
                "B03_green_560nm": 0.0782,
                "B04_red_665nm": 0.0512,
                "B05_red_edge_705nm": 0.1250,
                "B08_nir_842nm": 0.4385,
                "B11_swir1_1610nm": 0.1980,
                "B12_swir2_2190nm": 0.1120
            },
            "spectral_indices": {
                "ndvi": 0.791,
                "ndre": 0.556,
                "mcari": 0.184,
                "ndmi_water_index": 0.377,
                "savi_l05": 0.612,
                "bsi_bare_soil": -0.420,
                "fractional_vegetation_cover_fc": 0.82
            },
            "vegetation_health_status": "OPTIMAL_VIGOR_NO_WATER_STRESS"
        },
        operation: {
            frequency: 'Cada 5 días en condiciones ópticas libres de nubes.',
            acquisition: 'Ingesta automatizada vía protocolo STAC sobre AWS Open Data y Copernicus Data Space Ecosystem (CDSE) en formato Cloud-Optimized GeoTIFF (COG).',
            preprocessing: 'Enmascaramiento de nubes y sombras mediante clasificación de escena (SCL), corrección topográfica por DEM Copernicus 30m, cálculo de índices Red Edge que previenen la saturación asintótica del NDVI.',
            storageSize: '~150 KB por escena recortada al predio (tensores multibanda optimizados).',
            coverageScope: 'Planetaria completa en franjas orbitales de 290 km.'
        },
        agronomicUtility: {
            question: '¿Para qué le sirve este dato al agricultor en su predio?',
            answer: 'Detecta estrés hídrico o plagas entre 4 y 7 días antes de que las hojas se marchiten o muestren signos perceptibles al ojo humano. Gracias a las bandas Red Edge ($B05\text{-}B07$), el sistema te muestra exactamente qué potrero o hilera de árboles está recibiendo menos agua por fallas de goteros o baja presión.',
            economicImpact: 'Incremento del 12% al 18% en rendimiento de fruta comercializable y reducción del 20% en consumo de fertilizantes nitrogenados dirigidos.',
            expedienteAction: 'Tu Expediente Predial descarga cada 5 días la nueva foto satelital y grafica la curva de evolución del vigor de tus potreros.'
        }
    },

    inia: {
        id: 'inia',
        name: 'AGROMET – INIA Chile',
        shortName: 'AGROMET-INIA',
        country: 'Chile 🇨🇱',
        founded: 1964,
        logo: 'assets/sources/inia_logo.jpg',
        protocol: 'API REST Agrometeorológica',
        protocolBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        headline: 'Red Oficial de Estaciones Agrometeorológicas Automáticas en Valles Productivos',
        description: 'El Instituto de Investigaciones Agropecuarias (INIA) es el brazo científico agroalimentario de Chile (Minagri). Opera más de 320 estaciones automáticas con sensores de temperatura, humedad, viento y radiación solar.',
        keyMetrics: [
            { label: 'Estación de Referencia', val: 'Longaví - Las Mercedes (ST-342)' },
            { label: 'Temperatura Actual', val: '24.8 °C' },
            { label: 'Evapotranspiración ETo', val: '5.42 mm/día (FAO-56)' },
            { label: 'Lámina de Riego Sugerida', val: '4.34 mm (Kc = 0.80)' }
        ],
        payload: {
            "provider": "AGROMET - INIA Chile (Minagri)",
            "station_code": "ST_342_LONGAVI",
            "station_name": "Longavi - Las Mercedes",
            "comuna": "Longavi",
            "region": "Maule (VII Region)",
            "coordinates": { "lat": -36.0125, "lon": -71.5340, "elevation_m": 185 },
            "distance_to_predio_km": 3.8,
            "sample_time_local": "2026-11-08 17:00",
            "meteorological_telemetry": {
                "temperature_air_c": 24.8,
                "temperature_max_c": 27.4,
                "temperature_min_c": 6.8,
                "relative_humidity_pct": 38.5,
                "wind_speed_ms": 3.4,
                "wind_direction_deg": 195,
                "solar_radiation_wm2": 820.5,
                "precipitation_today_mm": 0.0
            },
            "fao56_penman_monteith_calculation": {
                "reference_evapotranspiration_et0_mm": 5.42,
                "vapor_pressure_deficit_vpd_kpa": 1.94,
                "crop_coefficient_kc": 0.80,
                "crop_water_demand_etc_mm": 4.34,
                "chilling_hours_accumulated": 780,
                "growing_degree_days_base10": 342.5
            }
        },
        operation: {
            frequency: 'Horaria continua los 365 días del año.',
            acquisition: 'Consulta directa a la API REST de la Red Agrometeorológica Nacional (`agromet.inia.cl`) filtrando estaciones en radio < 25 km.',
            preprocessing: 'Ajuste de temperatura por gradiente altitudinal barométrico (adiabático seco $\sim 0.65^\circ\text{C}/100\text{m}$), cómputo del modelo canónico Penman-Monteith FAO-56 para obtener $ET_0$.',
            storageSize: '~35 KB por estación/mes.',
            coverageScope: 'Valles agrícolas centrales y transversales de Chile (Arica a Magallanes).'
        },
        agronomicUtility: {
            question: '¿Para qué le sirve este dato al agricultor en su predio?',
            answer: 'Te entrega la cifra exacta de milímetros de agua que transpiraron tus plantas y evaporó el suelo hoy. En lugar de regar por tanteo o "tantas horas al día", riegas exactamente los milímetros necesarios ($ET_c$), evitando asfixia radicular, lavado de nutrientes y derroche de agua.',
            economicImpact: 'Ahorro del 25% al 35% en gasto energético de motores de riego y reducción drástica de enfermedades fúngicas por exceso de humedad.',
            expedienteAction: 'En el Expediente puedes definir el tipo de cultivo y marco de plantación para que AgriTwin aplique el $K_c$ exacto a los datos de INIA.'
        }
    },

    conaf: {
        id: 'conaf',
        name: 'CONAF / NASA FIRMS (Chile & Global)',
        shortName: 'CONAF & FIRMS',
        country: 'Chile 🇨🇱 / EE.UU. 🇺🇸',
        founded: 1970,
        logo: 'assets/sources/conaf_logo.png',
        protocol: 'NASA FIRMS API & SIDCO Polygons',
        protocolBadge: 'bg-red-100 text-red-800 border-red-300',
        headline: 'Detección Satelital Térmica de Focos de Calor VIIRS/MODIS y Sistema SIDCO de Incendios',
        description: 'La Corporación Nacional Forestal (CONAF) coordina el combate y alerta de incendios forestales en Chile mediante el Sistema de Información Digital para Control de Operaciones (SIDCO), complementado por la telemetría térmica orbital de NASA FIRMS.',
        keyMetrics: [
            { label: 'Focos en Radio 30km', val: '1 Foco Activo Detectado' },
            { label: 'Distancia al Predio', val: '12.8 km (Azimut 52° NE)' },
            { label: 'Potencia Térmica FRP', val: '18.4 MW (VIIRS 375m)' },
            { label: 'Alerta Puelche / FWI', val: '38.5 (Riesgo Moderado-Alto)' }
        ],
        payload: {
            "provider": "CONAF SIDCO & NASA FIRMS (Earthdata)",
            "sensors": ["VIIRS S-NPP (375m)", "VIIRS NOAA-20 (375m)", "MODIS Terra/Aqua (1km)"],
            "query_radius_km": 30.0,
            "center_coordinates": [-35.9876, -71.5123],
            "detected_hotspots": [
                {
                    "hotspot_id": "VIIRS_20261108_0530_19HBD_01",
                    "latitude": -35.9124,
                    "longitude": -71.4210,
                    "brightness_temp_kelvin": 348.6,
                    "fire_radiative_power_mw": 18.4,
                    "confidence": "HIGH",
                    "acquisition_time_utc": "2026-11-08T05:30:00Z",
                    "distance_to_predio_km": 12.8,
                    "bearing_direction_deg": 52,
                    "conaf_fire_name": "Sector Pajonales - Retiro",
                    "status": "COMBATE_ACTIVO"
                }
            ],
            "ballistic_spotting_risk": {
                "wind_direction_local": "SW (sur-oeste, aleja el humo del predio)",
                "threat_level": "MONITOREO_PREVENTIVO",
                "albini_spotting_range_km": 0.65,
                "keyline_green_buffer_status": "DITCHES_FILLED_MOISTURE_120PCT"
            }
        },
        operation: {
            frequency: 'Actualizaciones orbitales cada 3 a 6 horas (pasadas diurnas y nocturnas).',
            acquisition: 'Ingesta REST a la API de NASA FIRMS (MAP_KEY autenticada) y sincronización con reportes cartográficos SIDCO de CONAF.',
            preprocessing: 'Geofencing predial en radio de 30 km, proyección del cono de dispersión eólica de pavesas incandescentes según modelo Albini (1979) y balance térmico de Rothermel (1972).',
            storageSize: '~15 KB por consulta predial.',
            coverageScope: 'Cobertura global en tiempo cuasi-real con latencia < 3 horas.'
        },
        agronomicUtility: {
            question: '¿Para qué le sirve este dato al agricultor en su predio?',
            answer: 'Te advierte si hay un incendio forestal activo cerca de tu campo antes de que puedas oler el humo. Cruza la posición del fuego con la dirección del viento local para decirte si las pavesas incandescentes amenazan tus pastizales o galpones, dándote tiempo para activar zanjas de agua Keyline y llenar tranques de emergencia.',
            economicImpact: 'Protección patrimonial de infraestructura crítica, animales e instalaciones valoradas en cientos de millones de pesos.',
            expedienteAction: 'En tu Expediente se calcula la distancia exacta de tu cerco perimetral a plantaciones forestales colindantes y focos activos.'
        }
    },

    ecmwf: {
        id: 'ecmwf',
        name: 'ECMWF / ERA5-Land (Copernicus Climate C3S)',
        shortName: 'ECMWF ERA5-Land',
        country: 'Europa 🇪🇺 / Global',
        founded: 1975,
        logo: 'assets/sources/ecmwf_logo.svg',
        protocol: 'CDS API (Climate Data Store) & GRIB/NetCDF',
        protocolBadge: 'bg-purple-100 text-purple-800 border-purple-300',
        headline: 'Reanálisis Climático Horario Planetario a 9 km desde 1950 hasta Tiempo Real',
        description: 'El Centro Europeo de Previsiones Meteorológicas a Plazo Medio (ECMWF) en Reading, Bolonia y Bonn es el referente mundial en asimilación de datos atmosféricos globales y modelación climática numérica.',
        keyMetrics: [
            { label: 'Resolución de Cuadrícula', val: '9 km (ERA5-Land Grid Point)' },
            { label: 'Humedad Capa 1 (0-7cm)', val: '0.28 m³/m³' },
            { label: 'Humedad Capa 2 (7-28cm)', val: '0.32 m³/m³' },
            { label: 'Energía Convectiva CAPE', val: '450 J/kg (Bajo Riesgo Granizo)' }
        ],
        payload: {
            "provider": "ECMWF - Copernicus Climate Change Service (C3S)",
            "product": "ERA5-Land Hourly Enhanced Reanalysis",
            "grid_resolution": "0.1 degree (~9 km)",
            "grid_cell_center": [-36.00, -71.50],
            "dataset_reference_time": "2026-11-08T18:00:00Z",
            "atmospheric_variables": {
                "surface_air_pressure_hpa": 985.2,
                "surface_solar_radiation_downwards_j_m2": 2845000,
                "wind_u_component_10m_ms": 1.8,
                "wind_v_component_10m_ms": 2.9,
                "wind_gust_10m_ms": 6.2,
                "total_precipitation_forecast_72h_mm": 0.0
            },
            "subsurface_vadose_layers": {
                "soil_water_volumetric_layer_1_0_7cm_m3m3": 0.28,
                "soil_water_volumetric_layer_2_7_28cm_m3m3": 0.32,
                "soil_water_volumetric_layer_3_28_100cm_m3m3": 0.34,
                "soil_water_volumetric_layer_4_100_289cm_m3m3": 0.35,
                "soil_temperature_level_1_c": 19.4
            },
            "severe_weather_instability": {
                "convective_available_potential_energy_cape_j_kg": 450.0,
                "deep_layer_shear_0_6km_ms": 14.5,
                "hail_threat_category": "LOW_INSTABILITY"
            }
        },
        operation: {
            frequency: 'Cuadrícula horaria continua con extensión climatológica histórica desde 1950.',
            acquisition: 'Ingesta mediante la API Python `cdsapi` del Climate Data Store de Copernicus, extrayendo tensores NetCDF/GRIB2.',
            preprocessing: 'Downscaling estadístico con corrección de sesgo local (quantile mapping) contra estaciones terrenas INIA y modelo digital de elevación.',
            storageSize: '~65 KB por punto de cuadrícula predial/mes.',
            coverageScope: 'Planetaria completa continental continua.'
        },
        agronomicUtility: {
            question: '¿Para qué le sirve este dato al agricultor en su predio?',
            answer: 'Te permite conocer la reserva hídrica del suelo en profundidad (hasta 2.8 metros) que el satélite óptico no puede ver directamente. Además, su pronóstico numérico te anticipa olas de calor, heladas y tormentas de granizo con 3 a 5 días de margen de maniobra.',
            economicImpact: 'Planificación estratégica de siembras y cosechas, reduciendo el riesgo de pérdida total por eventos meteorológicos extremos.',
            expedienteAction: 'El Expediente utiliza la serie histórica ERA5 para calcular el balance hídrico multi-anual y la probabilidad de sequía en tu predio.'
        }
    },

    kiot: {
        id: 'kiot',
        name: 'Red Centinela KioT / LoRaWAN (AgriTwin SpA)',
        shortName: 'Centinela KioT',
        country: 'Chile 🇨🇱 / AgriTwin SpA',
        founded: 2024,
        logo: 'assets/sources/dga_logo.jpg', // or generic badge
        protocol: 'LoRaWAN 1.0.3 (Banda AU915) & MQTT/JSON',
        protocolBadge: 'bg-teal-100 text-teal-800 border-teal-300',
        headline: 'Telemetría In-Situ de Ultra-Bajo Consumo para Zona Vadosa, Pozos y Microclima',
        description: 'Dispositivos de hardware abierto basados en microcontroladores RP2040 y ESP32 diseñados por AgriTwin SpA. Transmiten a distancias de hasta 15 km sin depender de cobertura celular 3G/4G.',
        keyMetrics: [
            { label: 'Dispositivo Centinela', val: 'KIOT-NODE-LONGAVI-01' },
            { label: 'Humedad Suelo a 20 cm', val: '28.5% VWC (Radicular)' },
            { label: 'Humedad Suelo a 60 cm', val: '34.2% VWC (Profunda)' },
            { label: 'Profundidad Freática Pozo', val: '4.15 m (Nivel Estático)' }
        ],
        payload: {
            "provider": "AgriTwin SpA - Red Centinela KioT",
            "device_id": "KIOT-NODE-LONGAVI-01",
            "device_model": "Centinela Soil & Well Probe v2.4",
            "telemetry_protocol": "LoRaWAN 1.0.3 Class A (AU915 MHz)",
            "gateway_mac": "70B3D57ED005A1F2",
            "rf_metrics": { "rssi_dbm": -88, "snr_db": 9.4, "spreading_factor": 7, "frequency_mhz": 916.8 },
            "battery_system": { "voltage_v": 3.92, "charge_pct": 94, "solar_charging": true },
            "raw_hex_frame": "016701120268450302008c04020112",
            "decoded_measurements": {
                "timestamp_iso": "2026-11-08T18:05:12-03:00",
                "vadose_soil_moisture_20cm_vwc_pct": 28.5,
                "vadose_soil_moisture_60cm_vwc_pct": 34.2,
                "vadose_soil_temperature_20cm_c": 17.2,
                "electrical_conductivity_bulk_ds_m": 0.82,
                "groundwater_table_depth_m": 4.15,
                "ambient_air_temperature_c": 23.4,
                "ambient_relative_humidity_pct": 41.0
            },
            "asimilacion_kalman": {
                "ground_truth_for_sentinel2": "CALIBRATION_CONFIRMED",
                "vadose_depletion_pct": 14.2,
                "recommended_irrigation_window_hours": 3.5
            }
        },
        operation: {
            frequency: 'Transmisión periódica cada 15 a 60 minutos según nivel de batería y régimen de riego.',
            acquisition: 'Recepción mediante antena Gateway LoRaWAN local instalada en el predio o loma vecinal, con retransmisión por broker MQTT seguro.',
            preprocessing: 'Decodificación binaria de bytes, validación de integridad CRC, asimilación estocástica (Filtro de Kalman Unscented) para calibrar el satélite óptico con la realidad subterránea.',
            storageSize: '~12 KB por nodo/semana (tramas compactas altamente optimizadas).',
            coverageScope: 'Radio de cobertura radial de 8 a 15 km desde la antena central del predio o cuenca.'
        },
        agronomicUtility: {
            question: '¿Para qué le sirve este dato al agricultor en su predio?',
            answer: 'Es la verdad física en el terreno: te dice en tiempo real si el agua del riego efectivamente llegó a la zona de raíces (a 20 y 60 cm de profundidad) o si se quedó en la superficie evaporándose. También monitorea el nivel estático y dinámico de tu pozo profundo para proteger las bombas contra el funcionamiento en seco.',
            economicImpact: 'Evita la quema de bombas de pozo profundo ($1.8M - $3.5M CLP por reparación) y reduce hasta un 30% el tiempo de sobre-riego.',
            expedienteAction: 'En tu Expediente puedes registrar los códigos ID de tus nodos Centinela para vincularlos a tus potreros y tranques.'
        }
    }
};

let currentInspectedSourceId = 'dga';
let currentSourceInspectorTab = 'payload';

function inspectDataSource(sourceId, tab = null) {
    if (!AGRITWIN_DATA_SOURCES[sourceId]) sourceId = 'dga';
    currentInspectedSourceId = sourceId;
    if (tab) currentSourceInspectorTab = tab;

    const source = AGRITWIN_DATA_SOURCES[sourceId];

    // 1. Highlight the selected card in Submódulo 1
    document.querySelectorAll('.source-provider-card').forEach(card => {
        card.classList.remove('ring-2', 'ring-emerald-600', 'border-emerald-600', 'bg-emerald-50/15', 'shadow-md');
        card.classList.add('border-[#E7DAC6]');
    });
    const targetCard = document.getElementById(`source-card-${sourceId}`);
    if (targetCard) {
        targetCard.classList.remove('border-[#E7DAC6]');
        targetCard.classList.add('ring-2', 'ring-emerald-600', 'border-emerald-600', 'bg-emerald-50/15', 'shadow-md');
    }

    // 2. Render inspector header
    const inspector = document.getElementById('dataSourceInspector');
    if (!inspector) return;

    // Header info
    const logoEl = document.getElementById('inspectorSourceLogo');
    if (logoEl) {
        logoEl.src = source.logo;
        logoEl.alt = source.name;
    }
    const nameEl = document.getElementById('inspectorSourceName');
    if (nameEl) nameEl.textContent = source.name;
    
    const countryEl = document.getElementById('inspectorSourceCountry');
    if (countryEl) countryEl.textContent = `${source.country} • Fundado en ${source.founded}`;

    const protocolEl = document.getElementById('inspectorSourceProtocol');
    if (protocolEl) {
        protocolEl.textContent = source.protocol;
        protocolEl.className = `text-[10px] font-mono px-2 py-0.5 rounded border ${source.protocolBadge}`;
    }

    const descEl = document.getElementById('inspectorSourceHeadline');
    if (descEl) descEl.textContent = source.headline;

    // Key metrics pill row
    const metricsContainer = document.getElementById('inspectorSourceMetrics');
    if (metricsContainer) {
        metricsContainer.innerHTML = source.keyMetrics.map(m => `
            <div class="px-3 py-1.5 rounded-xl bg-white border border-[#E7DAC6] shadow-2xs flex flex-col">
                <span class="text-[9.5px] uppercase font-mono text-stone-400 font-bold tracking-wider">${m.label}</span>
                <span class="text-xs font-bold text-stone-900 font-mono">${m.val}</span>
            </div>
        `).join('');
    }

    // Render active tab content
    renderInspectorTabContent();

    // Update active tab buttons
    document.querySelectorAll('.inspector-tab-btn').forEach(btn => {
        btn.classList.remove('bg-emerald-800', 'text-white', 'shadow-xs');
        btn.classList.add('bg-white', 'text-stone-700', 'hover:bg-stone-50');
    });
    const activeTabBtn = document.getElementById(`inspectorTabBtn-${currentSourceInspectorTab}`);
    if (activeTabBtn) {
        activeTabBtn.classList.remove('bg-white', 'text-stone-700', 'hover:bg-stone-50');
        activeTabBtn.classList.add('bg-emerald-800', 'text-white', 'shadow-xs');
    }
}

function setSourceInspectorTab(tab) {
    currentSourceInspectorTab = tab;
    renderInspectorTabContent();

    document.querySelectorAll('.inspector-tab-btn').forEach(btn => {
        btn.classList.remove('bg-emerald-800', 'text-white', 'shadow-xs');
        btn.classList.add('bg-white', 'text-stone-700', 'hover:bg-stone-50');
    });
    const activeTabBtn = document.getElementById(`inspectorTabBtn-${tab}`);
    if (activeTabBtn) {
        activeTabBtn.classList.remove('bg-white', 'text-stone-700', 'hover:bg-stone-50');
        activeTabBtn.classList.add('bg-emerald-800', 'text-white', 'shadow-xs');
    }
}

function renderInspectorTabContent() {
    const source = AGRITWIN_DATA_SOURCES[currentInspectedSourceId];
    const container = document.getElementById('inspectorTabContent');
    if (!container || !source) return;

    if (currentSourceInspectorTab === 'payload') {
        const jsonStr = JSON.stringify(source.payload, null, 2);
        container.innerHTML = `
            <div class="space-y-3">
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span class="font-mono text-stone-600 font-semibold">Muestra de Extracción Real • Cuenca Maule Sur (Fundo Meniel)</span>
                    </div>
                    <button onclick="copyDataSourcePayload()" class="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono text-[11px] transition-all flex items-center gap-1.5 cursor-pointer border border-stone-300">
                        <span id="copyPayloadIcon">📋</span> <span id="copyPayloadLabel">Copiar JSON</span>
                    </button>
                </div>
                <div class="relative rounded-xl overflow-hidden border border-stone-800 shadow-inner">
                    <div class="bg-stone-950 px-4 py-2 border-b border-stone-800 flex items-center justify-between text-[11px] font-mono text-stone-400">
                        <span>payload_${source.id}_extraction.json</span>
                        <span class="text-stone-500">Content-Type: application/json; charset=utf-8</span>
                    </div>
                    <pre id="jsonPayloadCode" class="p-4 bg-stone-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[360px] leading-relaxed select-text">${escapeHtml(jsonStr)}</pre>
                </div>
            </div>
        `;
    } else if (currentSourceInspectorTab === 'operation') {
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div class="p-4 rounded-xl bg-white border border-[#E7DAC6] space-y-2">
                    <div class="flex items-center gap-2 text-stone-900 font-bold font-mono">
                        <span>⏱️</span> <span>Frecuencia &amp; Latencia de Ingesta</span>
                    </div>
                    <p class="text-stone-600 leading-relaxed">${source.operation.frequency}</p>
                </div>
                <div class="p-4 rounded-xl bg-white border border-[#E7DAC6] space-y-2">
                    <div class="flex items-center gap-2 text-stone-900 font-bold font-mono">
                        <span>🌐</span> <span>Mecanismo Técnico de Adquisición</span>
                    </div>
                    <p class="text-stone-600 leading-relaxed">${source.operation.acquisition}</p>
                </div>
                <div class="p-4 rounded-xl bg-white border border-[#E7DAC6] space-y-2 md:col-span-2">
                    <div class="flex items-center gap-2 text-stone-900 font-bold font-mono">
                        <span>⚙️</span> <span>Transformaciones &amp; Control de Calidad por AgriTwin</span>
                    </div>
                    <p class="text-stone-600 leading-relaxed">${source.operation.preprocessing}</p>
                </div>
                <div class="p-4 rounded-xl bg-white border border-[#E7DAC6] space-y-2">
                    <div class="flex items-center gap-2 text-stone-900 font-bold font-mono">
                        <span>💾</span> <span>Peso en Almacenamiento Predial</span>
                    </div>
                    <p class="text-stone-600 leading-relaxed">${source.operation.storageSize}</p>
                </div>
                <div class="p-4 rounded-xl bg-white border border-[#E7DAC6] space-y-2">
                    <div class="flex items-center gap-2 text-stone-900 font-bold font-mono">
                        <span>🗺️</span> <span>Cobertura Espacial / Cobertura Oficial</span>
                    </div>
                    <p class="text-stone-600 leading-relaxed">${source.operation.coverageScope}</p>
                </div>
            </div>
        `;
    } else if (currentSourceInspectorTab === 'agronomic') {
        container.innerHTML = `
            <div class="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E7DAC6] space-y-4 text-xs font-sans">
                <div class="space-y-1.5">
                    <h5 class="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
                        <span>🌾</span> <span>${source.agronomicUtility.question}</span>
                    </h5>
                    <p class="text-stone-700 leading-relaxed text-[12.5px]">${source.agronomicUtility.answer}</p>
                </div>

                <div class="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                    <div class="text-[11px] font-mono font-bold text-amber-900 flex items-center gap-1.5">
                        <span>💰</span> <span>Impacto Económico Directo &amp; Mitigación de Pérdidas</span>
                    </div>
                    <p class="text-amber-950 font-medium leading-relaxed">${source.agronomicUtility.economicImpact}</p>
                </div>

                <div class="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div class="space-y-1">
                        <div class="text-[11px] font-mono font-bold text-emerald-900 flex items-center gap-1.5">
                            <span>📂</span> <span>Descarga Específica en tu Expediente Predial</span>
                        </div>
                        <p class="text-emerald-950 leading-relaxed text-[11.5px]">${source.agronomicUtility.expedienteAction}</p>
                    </div>
                    <button onclick="if(typeof switchView === 'function') switchView('cuaderno');" class="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-mono text-xs transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5">
                        <span>Ir al Expediente</span> <span>→</span>
                    </button>
                </div>
            </div>
        `;
    }
}

function copyDataSourcePayload() {
    const source = AGRITWIN_DATA_SOURCES[currentInspectedSourceId];
    if (!source) return;
    const jsonStr = JSON.stringify(source.payload, null, 2);
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonStr).then(() => {
            const label = document.getElementById('copyPayloadLabel');
            const icon = document.getElementById('copyPayloadIcon');
            if (label) label.textContent = '¡Copiado al Portapapeles!';
            if (icon) icon.textContent = '✅';
            setTimeout(() => {
                if (label) label.textContent = 'Copiar JSON';
                if (icon) icon.textContent = '📋';
            }, 2000);
        });
    }
}

function togglePipelineFlowDiagram() {
    const container = document.getElementById('pipelineDiagramContainer');
    const label = document.getElementById('pipelineToggleLabel');
    if (!container) return;

    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        if (label) label.textContent = 'Ocultar Flujo';
    } else {
        container.classList.add('hidden');
        if (label) label.textContent = 'Ver Flujo';
    }
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Auto-initialize when DOM is ready or section is opened
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => inspectDataSource('dga'), 100);
    });
} else {
    setTimeout(() => inspectDataSource('dga'), 100);
}
