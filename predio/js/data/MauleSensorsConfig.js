/**
 * AgriTwin - Maule Agroclimatic Sensors & Workshop Stations Config
 * Definiciones de sensores críticos (Heladas, Mojamiento foliar, Viento Puelche, FDR) y Estaciones AoE II
 */

export const MAULE_SENSORS_CONFIG = {
  frost: {
    id: 'frost',
    sensorId: 'IOT-FROST-01',
    name: 'Nodos de Helada a Altura de Fruta (1.2m)',
    icon: '❄️',
    badge: 'Prioridad Crítica • Maule Sur',
    color: '#38bdf8',
    hardware: 'Nodo LoRaWAN Ultra-Low-Power (ESP32-C3) + SHT45 a 1.2m (BOM ref: USD 25-40)',
    locationNote: 'Hondonadas bajas del predio donde drena y se acumula el aire frío katabático',
    targetCrop: 'Cerezo Lapins / Santina, Manzano, Kiwi y Vid Vinífera',
    toolName: 'Calculadora Psicrométrica de Bulbo Húmedo & Inversión Térmica',
    toolDesc: 'Calcula en tiempo real la temperatura de bulbo húmedo (Twb) y la contrasta con el abrigo meteorológico estándar a 2 metros. Distingue helada radiativa pura (calma térmica) de helada advectiva (con viento) para guiar la decisión de aspersión antihelada.',
    recommendation: '⚠️ NO ENCENDER RIEGO ANTIHELADA: T. Fruta es -0.8°C pero la temperatura de bulbo húmedo es -1.5°C (< -0.5°C). Aplicar aspersión con bulbo bajo provocará evaporación y congelamiento destructivo por calor latente negativo. Utilizar calefactores o ventiladores de inversión.',
    economicImpact: 'Protección de cosecha: $14.500.000 CLP estimados en riesgo de pérdida por cuartel.',
    chartTitle: 'Curva Térmica Altura Fruta (1.2m) vs. Abrigo Oficial (2m) & Bulbo Húmedo',
    chartLabels: ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00'],
    dataset1: [3.8, 2.5, 1.2, 0.2, -0.4, -0.8, 1.4],
    label1: 'T. Altura Fruta 1.2m (°C)',
    dataset2: [5.6, 4.8, 4.0, 3.4, 2.8, 2.4, 3.8],
    label2: 'T. Abrigo Oficial 2m (°C)'
  },
  leaf: {
    id: 'leaf',
    sensorId: 'IOT-LEAF-01',
    name: 'Sensor de Mojamiento Foliar (PHYTOS-31)',
    icon: '🍃',
    badge: 'Prioridad Crítica • Control Hongos',
    color: '#84cc16',
    hardware: 'Sensor Dieléctrico de Resistencia de Superficie Foliar PHYTOS-31 + LoRaWAN',
    locationNote: 'Canopia foliar en cuarteles de parrón (cepa País) y huerto de arándanos',
    targetCrop: 'Vid vinífera (Botritis y Oídio), Arándano y Manzano (Venturia)',
    toolName: 'Modelo Epidemiológico de Mills (Infección por Horas de Hoja Mojada)',
    toolDesc: 'Modela el riesgo de germinación y penetración de esporas fúngicas según horas continuas de agua líquida sobre la cutícula foliar cruzado con temperaturas óptimas (15-22°C).',
    recommendation: '🍄 GATILLAR APLICACIÓN DE BOTRICIDA: 11.5 horas acumuladas de mojamiento a 17.2°C superan el umbral letal de infección. Suspender calendario fijo. Aplicar fungicida específico hoy en ventana sin viento de 16:30 a 19:00 h.',
    economicImpact: 'Ahorro de $380.000 CLP/ha al sustituir 2 aplicaciones ciegas por pulverizaciones gatilladas por riesgo real.',
    chartTitle: 'Horas Continuas de Hoja Mojada & Curva de Riesgo Botrytis Mills (%)',
    chartLabels: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'],
    dataset1: [1.5, 3.5, 5.5, 7.5, 9.5, 11.5, 12.0, 10.5],
    label1: 'Horas Mojamiento Continuo (h)',
    dataset2: [15, 28, 42, 60, 75, 82, 85, 80],
    label2: 'Riesgo Botrytis Mills (%)'
  },
  flow: {
    id: 'flow',
    sensorId: 'IOT-FLOW-01',
    name: 'Caudalímetro Telemétrico DGA & Control Turno de Canal',
    icon: '🚰',
    badge: 'Prioridad Alta • Cumplimiento Normativo',
    color: '#0284c7',
    hardware: 'Caudalímetro Electromagnético DN100 + Datalogger 4G LTE-M (Norma MEE DGA Res. 1238)',
    locationNote: 'Cabezal de bombeo pozo profundo y matriz de compuerta de canal',
    targetCrop: 'Todos los cuarteles bajo riego tecnificado y gravitacional',
    toolName: 'Calculador de Agotamiento de Suelo vs. Turno de Canal',
    toolDesc: 'Resuelve la pregunta clave del productor del Maule: no es cuándo regar sino cuánto aplicar en el turno y si la reserva del perfil alcanza hasta el siguiente turno de canal.',
    recommendation: '💧 DECISIÓN TURNO DE CANAL: La reserva del perfil aguanta 4.2 días. El turno del canal llega en 4 días (Martes 08:00 h). NO ENCENDER BOMBA DE POZO; aplicar 32 mm (1.150 m³) durante el turno para recargar perfil por gravedad.',
    economicImpact: 'Ahorro eléctrico de $112.000 CLP en bombeo de pozo + transmisión DGA MEE al día.',
    chartTitle: 'Lámina Útil de Suelo (mm) vs. Turno del Canal de Regadío',
    chartLabels: ['Día 1', 'Día 2', 'Día 3', 'Día 4 (Turno)', 'Día 5', 'Día 6', 'Día 7'],
    dataset1: [48, 40, 32, 24, 52, 45, 38],
    label1: 'Lámina Útil Suelo (mm)',
    dataset2: [22, 22, 22, 22, 22, 22, 22],
    label2: 'Umbral Crítico de Reposición (mm)'
  },
  wx: {
    id: 'wx',
    sensorId: 'IOT-WX-01',
    name: 'Estación Central de Microzona (Compartida)',
    icon: '🌤️',
    badge: 'Prioridad Crítica • Red 20-40 Productores',
    color: '#f59e0b',
    hardware: 'Torre Meteorológica Profesional OMM + Gateway LoRaWAN industrial (USD 1.500 compartido en red)',
    locationNote: 'Punto central de la microzona (cubre 5 a 15 km de radio según topografía)',
    targetCrop: 'Red territorial de productores asociados (Cereza, Vid, Berries)',
    toolName: 'Matriz de Ventana Fitosanitaria & Semáforo de Partidura (Cracking 72h)',
    toolDesc: 'Calcula ETo diaria Penman-Monteith, ventanas horarias de viento (<10 km/h) para pulverización fitosanitaria sin deriva y pronóstico de lluvia a 72h para cerezas.',
    recommendation: '🚜 VENTANA FITOSANITARIA ACTIVA: Aplicar entre 07:30 y 10:45 h (viento 5.2 km/h ENE, sin deriva). Suspender al mediodía por viento Puelche > 22 km/h. Monitorear lluvia pronosticada a 72h para cuartel cerezo Lapins.',
    economicImpact: 'Cero deriva a predios vecinos + 100% de eficacia fitosanitaria del producto aplicado.',
    chartTitle: 'Velocidad de Viento Diurna (km/h) & Límite Máximo de Deriva',
    chartLabels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    dataset1: [3.5, 5.2, 7.8, 16.5, 22.4, 24.8, 18.0, 8.5],
    label1: 'Velocidad de Viento (km/h)',
    dataset2: [10, 10, 10, 10, 10, 10, 10, 10],
    label2: 'Límite Máximo Seguro Deriva (10 km/h)'
  },
  soil: {
    id: 'soil',
    sensorId: 'IOT-SN-01',
    name: 'Sonda FDR Suelo Calibrada (Multi-Estrato)',
    icon: '🌱',
    badge: 'Prioridad Media • Riego Tecnificado',
    color: '#10b981',
    hardware: 'Sonda FDR Capacitiva Multinivel (20, 40, 60, 100 cm) + Calibración Franco-Arcilloso Maule',
    locationNote: 'Bulbo de riego bajo gotero en cuartel representativo',
    targetCrop: 'Cerezo y Viñedos bajo riego localizado',
    toolName: 'Inspector de Bulbo Radicular & Curva de Calibración Textural',
    toolDesc: 'Corrige la trampa de la calibración deficiente (+/-10% de error volumétrico sin calibrar). Modela el contenido hídrico volumétrico real en suelo franco-arcilloso del Maule.',
    recommendation: '🌱 ESTRATO RADICULAR EN ESTADO ÓPTIMO: Estrato 20-60cm retiene 36.5% de humedad. No sobre-regar para evitar asfixia radicular en estratos arcillosos profundos.',
    economicImpact: 'Ahorro de 18% en consumo de agua y energía de riego sin mermar calibre.',
    chartTitle: 'Humedad Volumétrica por Estrato Radicular (%)',
    chartLabels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    dataset1: [28, 26, 25, 42, 38, 35, 33],
    label1: 'Estrato 0-20cm Superficie (%)',
    dataset2: [38, 37, 36, 44, 42, 40, 39],
    label2: 'Estrato 20-60cm Raíz Activa (%)'
  }
};

export const WORKSHOP_STATIONS_DATA = [
  {
    id: 'station_a',
    code: 'OBJ-A',
    title: 'Plan Maestro & Estratégico de Permacultura',
    shortTitle: 'Estratégico Permacultura',
    category: 'Planificación Agroecológica & ROI',
    badge: 'Curva 5 Años • Zonas 0-5 • ROI',
    metric: 'Zonas 0-5 • ROI 3.8 Años',
    spriteSrc: 'assets/ui/sprite_a_clipboard.png',
    position: { top: '22%', left: '6.5%', width: '9.5%' },
    hangClass: 'sprite-a',
    description: 'Estrategia predial permacultural y retorno agroecológico a 5 años: zonificación de Bill Mollison (Zonas 0 a 5), curva de acumulación biológica, balance de infiltración Keyline, ahorro químico anual, sustitución de diésel y auditoría What-If en tiempo real.',
    tools: [
      'Curva de Regeneración Biológica a 5 Años (Suelo Vivo & Infiltración)',
      'Zonificación Concéntrica de Mollison (Zona 0 a Zona 5)',
      'Retorno de Inversión (ROI) & Ahorro en Insumos Agroquímicos',
      'Infiltración Keyline vs. Escorrentía Torrencial',
      'Simbiosis Espacial: 1 Polígono = 1 Uso de Suelo',
      'Auditoría What-If Dinámica de Intervenciones'
    ],
    chartData: {
      labels: ['Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'],
      dataset1: [15, 38, 65, 84, 96],
      dataset2: [25, 48, 72, 88, 98],
      label1: 'Regeneración Suelo Vivo (%)',
      label2: 'Independencia de Insumos (%)'
    },
    action: (app, overlay) => {
      if (overlay) overlay.openStrategicPermacultureModal();
    }
  },
  {
    id: 'station_b',
    code: 'RED-MAULE-IOT',
    title: 'Red de Sensores Maule & Telemetría IoT',
    shortTitle: 'Red Sensores Maule',
    category: 'Hardware & Microclima Compartido',
    badge: 'Heladas • Mojamiento • Turnos • DGA',
    metric: '5 Nodos • Mills Botrytis',
    spriteSrc: 'assets/ui/sprite_b_iot_board.png',
    position: { top: '23%', left: '19.5%', width: '10.5%' },
    hangClass: 'sprite-b',
    description: 'Centro de mando de la Red de Sensores de Pequeños y Medianos Agricultores de la Región del Maule: monitoreo térmico a altura de fruta contra heladas de primavera, modelos de mojamiento foliar para control de botritis, caudalímetros con transmisión DGA (MEE) y cálculo de balance para turnos de canal.',
    tools: [
      'Nodos de Helada a Altura de Fruta (Bulbo Húmedo & Inversión Katabática)',
      'Sensor de Mojamiento Foliar PHYTOS-31 (Modelo Mills para Botrytis)',
      'Estación Microzonal Compartida (Ventana Fitosanitaria & Cracking)',
      'Caudalímetro MEE DGA Res. 1238 & Planificador de Turno de Canal',
      'Sondas FDR Multi-Estrato Calibradas a Suelo Franco-Arcilloso'
    ],
    chartData: {
      labels: ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00'],
      dataset1: [4.2, 3.1, 1.8, 0.4, -0.2, -0.8, 1.2],
      dataset2: [6.0, 5.2, 4.4, 3.8, 3.0, 2.4, 3.5],
      label1: 'Temp. Altura Fruta 1.2m (°C)',
      label2: 'Temp. Abrigo Oficial 2m (°C)'
    },
    action: (app, overlay) => {
      if (overlay) overlay.openStationModal('station_b');
    }
  },
  {
    id: 'station_c',
    code: 'OBJ-C',
    title: 'Twin 3D Predio / Fundo Colliguay',
    shortTitle: 'Twin 3D Predio',
    category: 'Vuelo Libre Tridimensional',
    badge: 'Twin 3D • 60 FPS',
    metric: '60 FPS • Relieve 3D',
    spriteSrc: 'assets/ui/sprite_c_monitor.png',
    position: { top: '56%', left: '50.5%', width: '13%' },
    hangClass: 'sprite-c',
    description: 'Ingreso directo al gemelo digital tridimensional: navegación en vuelo libre sobre el Fundo Colliguay (12.8 ha), mallas de terreno DEM, tranques Keyline, potreros rotacionales y telemetría de campo.',
    tools: [
      'Entrar al Gemelo Digital 3D (Vuelo Libre)',
      'Simulador What-If Permacultural & Objetos 3D',
      'Inspección de Relieve DEM & Cámaras',
      'Monitoreo de Sondas FDR y Boyas',
      'Simulador Solar Diurno & Hora Dorada'
    ],
    chartData: {
      labels: ['Cuartel A', 'Cuartel B', 'Cuartel C', 'Cuartel D', 'Borde Estero'],
      dataset1: [0.78, 0.82, 0.65, 0.71, 0.89],
      dataset2: [12.4, 8.6, 14.1, 9.8, 5.2],
      label1: 'Índice Vigor NDVI',
      label2: 'Área Cuartel (ha)'
    },
    action: (app, overlay) => {
      if (overlay) {
        overlay.close();
        if (app?.mapManager?.flyToPreset) {
          app.mapManager.flyToPreset('overview');
        }
      }
    }
  },
  {
    id: 'station_map',
    code: 'REGISTRO-PREDIAL',
    title: 'Registro de Límites Prediales & Régimen Jurídico',
    shortTitle: 'Registros de Límites',
    category: 'Régimen Jurídico & Deslindes',
    badge: 'Rol SII • CBR • DL 3516 • IFC • Bóveda',
    metric: 'Rol 144-01 • CBR 100%',
    spriteSrc: 'assets/ui/sprite_map_vecinal.png',
    position: { top: '54%', left: '68%', width: '13%' },
    hangClass: 'sprite-map',
    description: 'Bóveda técnica y jurídica del predio: títulos de propiedad inscritos en el Conservador de Bienes Raíces (CBR), Rol de Avalúo SII, deslindes catastrales, régimen normativo de uso de suelo (DL 3516, IFC Art. 55 LGUC, DGA Aguas, CONAF Bosque Nativo) y gestor documental local persistente para escrituras y certificados.',
    tools: [
      'Inscripción de Dominio CBR & Rol de Avalúo Fiscal SII',
      'Deslindes Catastrales Cardinales (Norte, Sur, Este, Oeste)',
      'Régimen de Suelo: DL 3516 (5.000m²) & Art. 55 LGUC (IFC)',
      'Derechos de Agua (CBR & Catastro Público DGA Ley 21.435)',
      'Bóveda Documental Persistente (Carga de Archivos .pdf/.dwg)',
      'Mosaico Territorial Vecinal & Acople al Visor 3D'
    ],
    chartData: {
      labels: ['Fundo Meniels (12.8ha)', 'Forestal Los Pinos (140ha)', 'Viña Santa Elena (35.2ha)', 'Parcela Don Pedro (18ha)', 'Reserva Los Boldos (62ha)'],
      dataset1: [100, 100, 85, 70, 100],
      dataset2: [12.8, 140.0, 35.2, 18.0, 62.0],
      label1: 'Conformidad Legal & CBR %',
      label2: 'Superficie Total (ha)'
    },
    action: (app, overlay) => {
      if (overlay) overlay.openAdminPanelWithTab('map');
    }
  },
  {
    id: 'station_d',
    code: 'OBJ-D',
    title: 'Histórico ESG / MRV Ledger',
    shortTitle: 'Libro de Registros ESG',
    category: 'Certificación & Carbono',
    badge: 'Cero Deforestación',
    metric: '4.8 tCO2e/ha • EUDR 100%',
    spriteSrc: 'assets/ui/sprite_d_esg_book.png',
    position: { top: '69%', left: '33%', width: '10.5%' },
    hangClass: 'sprite-d',
    description: 'Libro maestro de auditoría ambiental: pasaporte digital de trazabilidad, secuestro de carbono tCO2e/ha certificado con hash criptográfico MRV y cumplimiento EUDR 100% Cero Deforestación.',
    tools: [
      'Balance de Carbono (4.8 tCO2e/ha secuestradas)',
      'EUDR Cero Deforestación (Línea base Sentinel-2 2020)',
      'Índice de Integridad Ecológica (IEI: 0.88)',
      'Hash Criptográfico MRV: 0x8f2d4a19c6e'
    ],
    chartData: {
      labels: ['2020', '2021', '2022', '2023', '2024', '2025 (Prev)'],
      dataset1: [1.8, 2.4, 3.1, 3.9, 4.8, 5.6],
      dataset2: [0.65, 0.70, 0.76, 0.82, 0.88, 0.92],
      label1: 'Carbono Secuestrado (tCO2e/ha)',
      label2: 'Índice Integridad IEI'
    },
    action: (app, overlay) => {
      if (overlay) overlay.openAdminPanelWithTab('vault');
    }
  },
  {
    id: 'station_e',
    code: 'OBJ-E',
    title: 'Red Territorial & APRs',
    shortTitle: 'Radio & Pizarra Comunal',
    category: 'Comunidad B2G',
    badge: 'Acuíferos & FWI',
    metric: 'FWI 24 • 1.420 Familias',
    spriteSrc: 'assets/ui/sprite_e_radio.png',
    position: { top: '44%', left: '36%', width: '11%' },
    hangClass: 'sprite-e',
    description: 'Estación de enlace territorial: semáforo de recarga de acuíferos para Comités de Agua Potable Rural (APR), índice de riesgo de incendios FWI y cálculo de camiones aljibe evitados.',
    tools: [
      'Semáforo de Acuíferos & Pozos Comunitarios',
      'Índice de Incendios Forestales FWI & Combustible',
      'Planificación de Cortafuegos Preventivos (14.2 km)',
      'Monitoreo Social B2G: 1,420 Familias Abastecidas'
    ],
    chartData: {
      labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      dataset1: [18, 24, 38, 45, 52, 42, 28],
      dataset2: [72, 70, 68, 65, 63, 62, 64],
      label1: 'Índice FWI Piro-Riesgo',
      label2: 'Nivel Freático Acuífero (%)'
    },
    action: (app, overlay) => {
      if (overlay) overlay.openAdminPanelWithTab('territorial');
    }
  },
  {
    id: 'station_f',
    code: 'OBJ-F',
    title: 'Caja de Herramientas & Modelos Biofísicos',
    shortTitle: 'Caja de Herramientas',
    category: 'Modelos Biofísicos, Shaders & APIs',
    badge: 'FAO-56 • Shaders PBR • n8n',
    metric: 'FAO-56 • 60 FPS • n8n',
    spriteSrc: 'assets/ui/sprite_f_toolbox.png',
    position: { top: '68%', left: '10%', width: '12%' },
    hangClass: 'sprite-f',
    description: 'Caja de herramientas y modelos biofísicos unificados: evapotranspiración Penman-Monteith (FAO-56), balance radicular en 3 estratos, relieve DEM, shaders PBR con normales Sobel, vegetación instanciada, Dossier de Obra Keyline (18.500 m³), webhooks n8n y WhatsApp Cloud API.',
    tools: [
      'FAO-56 Penman-Monteith (ETc = ETo × Kc)',
      'Balance Hídrico en 3 Estratos Radiculares (0-20, 20-60, 60-100cm)',
      'Motor 3D Three.js r128 (PBR Shaders & DEM)',
      'Shaders GLSL Sobel & UnrealBloom Post-Processing',
      'Vegetación Instanciada (Single-Draw-Call)',
      'Dossier Ejecutivo de Obra & Plan Maestro Keyline',
      'Inspector Técnico 3D (FPS, Shaders, Memoria)',
      'Webhooks n8n & WhatsApp Cloud API'
    ],
    chartData: {
      labels: ['Draw Calls', 'Triángulos (k)', 'Texturas (MB)', 'Shader Passes', 'FPS'],
      dataset1: [4, 48, 32, 6, 60],
      dataset2: [12, 120, 96, 10, 30],
      label1: 'Métricas Actuales',
      label2: 'Umbral Máximo Seguro'
    },
    action: (app, overlay) => {
      if (overlay) overlay.openAdminPanelWithTab('scripts');
    }
  }
];
