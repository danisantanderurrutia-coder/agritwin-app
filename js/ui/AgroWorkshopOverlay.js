/**
 * AgriTwin - AgroWorkshopOverlay Module
 * 
 * Implements the Age of Empires II diegetic Workshop Menu ("Taller Agrícola"):
 *  - Diegetic background layer (workshop_bg.png)
 *  - 6 Interactive cutout PNG sprites with percentage positioning
 *  - Physics hang/sway & golden glow hover effects
 *  - Diegetic wood & brass tooltips
 *  - Fixed Admin Panel with live audited File Tree and central engines dock
 *  - Interactive dynamic Chart.js replacement for Python static graphs
 *  - Seamless navigation to all audited tools and 3D digital twin
 */

import { bus } from '../utils/EventBus.js';
import { propertyRegistryManager, CHILEAN_LAND_LEGAL_FRAMEWORK } from '../data/PropertyRegistryManager.js';
import { actuatorManager } from '../data/ActuatorManager.js';
import { weatherService } from '../data/WeatherService.js';
import { AdminPanelViews } from './workshop/AdminPanelViews.js';
import { FieldEnclosureModal } from './workshop/FieldEnclosureModal.js';

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
    title: 'Manual & Documentación Biofísica',
    shortTitle: 'Libreta Biofísica',
    category: 'Modelos Biofísicos',
    badge: 'FAO-56 / Penman',
    metric: 'FAO-56 • Penman ETc',
    spriteSrc: 'assets/ui/sprite_a_clipboard.png',
    position: { top: '22%', left: '6.5%', width: '9.5%' },
    hangClass: 'sprite-a',
    description: 'Documentación técnica de algoritmos biofísicos: evapotranspiración real Penman-Monteith, balance hídrico en 3 estratos radiculares y modelo DEM de acumulación katabática de aire frío.',
    tools: [
      'FAO-56 Penman-Monteith (ETc = ETo × Kc)',
      'Balance Hídrico en 3 Estratos (0-20, 20-60, 60-100cm)',
      'Modelo DEM de Drenaje Katabático de Heladas',
      'Catálogo Taxonómico Botánico de Cultivos & Nativos'
    ],
    chartData: {
      labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      dataset1: [36, 34, 32, 33, 41, 39, 37, 36],
      dataset2: [28, 27, 26, 28, 35, 34, 31, 29],
      label1: 'Estrato 1 (0-20 cm) %',
      label2: 'Estrato 2 (20-60 cm) %'
    },
    action: (app, overlay) => {
      if (overlay) overlay.openAdminPanelWithTab('predios');
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
    title: 'Visor Predial 3D / AgroTwin',
    shortTitle: 'Mesa de Planos 3D',
    category: 'Motor Gráfico WebGL',
    badge: 'Three.js / PBR',
    metric: '60 FPS • PBR Shaders',
    spriteSrc: 'assets/ui/sprite_c_monitor.png',
    position: { top: '56%', left: '50.5%', width: '13%' },
    hangClass: 'sprite-c',
    description: 'Centro de mando táctico del gemelo digital: relieve topográfico DEM dinámico, textura de suelo PBR con surcos normales, iluminación solar diurna y parcelas extruidas estilo Civ VI.',
    tools: [
      'Motor 3D Three.js r128 (PBR Shaders)',
      'Capas de Suelo, NDVI & Esri World Imagery',
      'Vegetación Instanciada (Single-Draw-Call)',
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
      if (overlay) overlay.openAdminPanelWithTab('visor3d');
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
    title: 'Ajustes del Sistema & Telemetría',
    shortTitle: 'Caja de Herramientas',
    category: 'Configuración & APIs',
    badge: 'Webhooks / n8n',
    metric: 'n8n Cloud • Bloom On',
    spriteSrc: 'assets/ui/sprite_f_toolbox.png',
    position: { top: '68%', left: '10%', width: '12%' },
    hangClass: 'sprite-f',
    description: 'Caja de herramientas técnicas: inspección de shaders GLSL en vivo, calibración de post-procesamiento UnrealBloom, configuración de webhooks n8n y despacho de alertas autónomas a WhatsApp Business.',
    tools: [
      'Inspector Técnico 3D (FPS, Shaders, Memoria)',
      'Webhooks n8n & WhatsApp Cloud API',
      'Velocidad de Simulación Temporal (1x, 2x, 5x)',
      'Parámetros Globales & Protocolos de Calibración'
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

// ─── Procedural Audio Engine (Silenciado Total por instrucción de usuario) ────
class WorkshopAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }
  init() {}
  playWoodClick() {}
  playBellGong() {}
  playParchmentOpen() {}
}

export class AgroWorkshopOverlay {
  constructor(app) {
    this.app = app;
    this.audio = new WorkshopAudioEngine();
    this.overlayEl = null;
    this.activeModalStation = null;
    this.showAdminPanel = false;
    this.activeAdminTab = 'sensors';
    this.sensorSubView = 'telemetry';
    this.simTemp = 18.5;
    this.simMoisture = 36.2;
    this.simCwsi = 0.25;
    this.selectedPredioId = 'meniels';
    this.currentChartInstance = null;
    this.showCampaignBoard = true;
    this.selectedMauleSensorTab = 'frost';
    this.selectedPropertySubTab = 'titles'; // 'titles' | 'legal' | 'vault' | 'mosaic'
    this.selectedLegalDocTab = 'dl3516';
    this.selectedEnclosureBranch = 'general'; // 'general' | 'cuarteles' | 'establo'
  }

  init() {
    this.injectHTML();
    this.bindEvents();
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === '3d' || params.get('noworkshop') === '1') {
      this.close();
    } else {
      this.open(false);
    }
  }

  injectHTML() {
    let overlay = document.getElementById('workshopOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'workshopOverlay';
      overlay.className = 'workshop-overlay';
      document.body.appendChild(overlay);
    }
    this.overlayEl = overlay;
    this.render();
  }

  render() {
    this.overlayEl.innerHTML = `
      <!-- Botón Flotante para Cerrar Galpón (Esc) -->
      <button id="btnWorkshopClose" class="btn-workshop-close" style="position: absolute; top: 16px; right: 16px; z-index: 60; width: 36px; height: 36px; border-radius: 10px; background: rgba(13, 19, 34, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.18); color: #cbd5e1; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.6); transition: all 0.2s;" onmouseover="this.style.color='white'; this.style.borderColor='rgba(255,255,255,0.4)'" onmouseout="this.style.color='#cbd5e1'; this.style.borderColor='rgba(255,255,255,0.18)'" title="Volver al Predio 3D (Esc)">
        &times;
      </button>

      <!-- Escena Diegética: Fondo + Sprites PNG -->
      <div class="workshop-stage-container">
        <div class="workshop-stage-viewport">
          <img src="assets/ui/workshop_bg.png" alt="Taller Agrícola Menú" class="workshop-bg-img" draggable="false">
          <div class="workshop-vignette"></div>

          <!-- Panel Central Obsidian Glass: Selección y Despacho Predial (Solo visible al hacer clic en Mesa de Planos) -->
          ${this.showCampaignBoard ? `
          <div class="workshop-campaign-board" id="workshopCampaignBoard" style="position: absolute; top: 24px; left: 50%; transform: translateX(-50%); z-index: 45; width: 620px; max-width: 94vw; animation: fadeIn 0.25s ease-out;">
            <div style="position: relative; background: rgba(13, 19, 34, 0.96); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 22px 24px; box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.95), 0 0 35px rgba(245, 158, 11, 0.2); text-align: center;">

              <!-- Botón Cerrar Tablero -->
              <button id="btnCloseCampaignBoard" style="position: absolute; top: 12px; right: 14px; width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.color='white'; this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.color='#cbd5e1'; this.style.background='rgba(255,255,255,0.08)'">&times;</button>

              <!-- Ribbon de Identificación -->
              <div style="display: inline-flex; align-items: center; gap: 6px; padding: 3px 12px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 9999px; margin-bottom: 10px;">
                <span style="font-size: 11px;">🏡</span>
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #fbbf24;">
                  FUNDO COLLIGUAY • TRABAJO DIARIO
                </span>
              </div>

              <!-- Título del Predio -->
              <div style="margin-bottom: 12px;">
                <h2 style="font-size: 22px; font-weight: 800; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; margin: 0 0 4px 0;">
                  ${this.app?.projectManager?.currentProject?.name || 'Fundo Estero Colliguay'}
                </h2>
                <div style="font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span>📍 Parral, Maule Sur</span>
                  <span>•</span>
                  <span>12.8 ha • PRV & Keyline</span>
                  <span>•</span>
                  <span style="color: #10b981;">Ground-Truth Activo</span>
                </div>
              </div>

              <!-- Píldoras de Telemetría Predial -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 18px; font-family: 'JetBrains Mono', monospace;">
                <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.06); padding: 8px; border-radius: 12px; text-align: center;">
                  <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase;">Superficie</span>
                  <span style="font-size: 13px; font-weight: 800; color: #f8fafc;">12.8 ha</span>
                </div>
                <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.06); padding: 8px; border-radius: 12px; text-align: center;">
                  <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase;">Red IoT</span>
                  <span style="font-size: 13px; font-weight: 800; color: #10b981;">5 Sondas</span>
                </div>
                <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.06); padding: 8px; border-radius: 12px; text-align: center;">
                  <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase;">Humedad Suelo</span>
                  <span style="font-size: 13px; font-weight: 800; color: #0ea5e9;">37.2% VWC</span>
                </div>
                <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.06); padding: 8px; border-radius: 12px; text-align: center;">
                  <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase;">Tranque Keyline</span>
                  <span style="font-size: 13px; font-weight: 800; color: #f59e0b;">18.5k m³</span>
                </div>
              </div>

              <!-- Botón Principal Único: Entrar al Fundo en Modo Predio 3D -->
              <div style="margin-bottom: 18px;">
                <button id="btnBoardLaunchPredio3D" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-radius: 14px; background: linear-gradient(135deg, #f59e0b, #d97706); border: 1.5px solid rgba(251, 191, 36, 0.6); cursor: pointer; text-align: left; transition: all 0.2s; box-shadow: 0 4px 18px rgba(245, 158, 11, 0.35);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 22px rgba(245, 158, 11, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 18px rgba(245, 158, 11, 0.35)'">
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <span style="font-size: 26px;">🌾</span>
                    <div>
                      <div style="font-weight: 800; font-size: 15px; color: #1e1103; font-family: 'Plus Jakarta Sans', sans-serif;">Entrar en Modo Predio 3D</div>
                      <div style="font-size: 11px; color: #451a03; font-weight: 600; font-family: 'JetBrains Mono', monospace;">Fundo Estero Colliguay • Relieve DEM • Sondas IoT</div>
                    </div>
                  </div>
                  <span style="font-weight: 800; color: #1e1103; font-size: 18px;">▶</span>
                </button>
              </div>

              <!-- Acciones Secundarias de Proyecto -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 10px; color: #94a3b8; font-weight: 600;">Gestión de Proyectos:</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                <button id="btnBoardNewProject" style="padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'">
                  <span>✨</span> Nuevo Predio
                </button>
                <button id="btnBoardOpenProject" style="padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'">
                  <span>📁</span> Cargar .agritwin
                </button>
                <button id="btnBoardImportGis" style="padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'">
                  <span>🗺️</span> Importar (.shp)
                </button>
              </div>

              <div style="margin-top: 14px; font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace;">
                💡 Explora las estaciones técnicas diegéticas o presiona <kbd style="background: rgba(255,255,255,0.1); padding: 1px 5px; border-radius: 4px; color: #cbd5e1;">W</kbd> para alternar el taller.
              </div>
            </div>
          </div>
          ` : ''}

          <!-- Los 6 Sprites Recortados Diegéticos -->
          ${WORKSHOP_STATIONS_DATA.map(st => `
            <div class="workshop-sprite-anchor ${st.hangClass}" data-station-id="${st.id}" style="top: ${st.position.top}; left: ${st.position.left}; width: ${st.position.width};">
              <img src="${st.spriteSrc}" alt="${st.title}" class="workshop-sprite-img" draggable="false">
              <span class="sprite-ping-dot"></span>

              <!-- Cartela Tooltip Madera y Latón -->
              <div class="workshop-tooltip">
                <div class="tooltip-cartela">
                  <div class="tooltip-header">
                    <span class="tooltip-code">${st.code} • ${st.badge}</span>
                    <span class="tooltip-category">${st.category}</span>
                  </div>
                  <h4 class="tooltip-title">${st.title}</h4>
                  <p class="tooltip-desc">${st.description}</p>
                  <div class="tooltip-footer">
                    <span class="tooltip-callout">▶ Clic para interactuar</span>
                    <span style="color: #a8a29e;">${st.tools.length} submódulos</span>
                  </div>
                </div>
              </div>

              <!-- Cartela Unificada AoE II Persistente (Capa 2) -->
              <div class="aoe-unified-station-badge">
                <div class="aoe-badge-meta">
                  <span class="aoe-badge-code">${st.code}</span>
                  <span class="aoe-badge-dot"></span>
                </div>
                <div class="aoe-badge-title">${st.shortTitle}</div>
                <div class="aoe-badge-metric">${st.metric || st.badge}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Panel Maestro Predial (Modal Amplio Centrado Diegético) -->
      ${this.showAdminPanel ? `
        <div class="modal-overlay glass-modal-backdrop" id="adminPanelBackdrop" style="display: flex; z-index: 70;">
          ${this.renderAdminPanelHTML()}
        </div>
      ` : ''}

      <!-- Modal de Detalle de Estación con Gráfica Dinámica Chart.js (Legacy / Fallback) -->
      ${this.activeModalStation ? this.renderStationModalHTML(this.activeModalStation) : ''}
    `;

    this.bindDynamicListeners();

    // Inicializar Gráfica Chart.js si el Panel Maestro o Modal está abierto
    if (this.showAdminPanel) {
      this.initChartForActiveTab();
      if (this.activeAdminTab === 'vault') {
        this.initMermaidInVault();
      }
    } else if (this.activeModalStation) {
      this.initChart(this.activeModalStation);
    }
  }

  renderAdminPanelHTML() {
    return AdminPanelViews.render(this);
  }

  renderStationModalHTML(station) {
    // Especialización: Gabinete Industrial de Terreno IP67 (station_b)
    if (station?.id === 'station_b') {
      return FieldEnclosureModal.render(this, station);
    }

    // Especialización: Modal del Sprite de Registro de Límites Prediales & Régimen Jurídico (station_map)
    if (station.id === 'station_map') {
      const activeProp = propertyRegistryManager.getProperty(this.selectedPredioId);
      const subTab = this.selectedPropertySubTab || 'titles';
      const legalKey = this.selectedLegalDocTab || 'dl3516';
      const legalFramework = CHILEAN_LAND_LEGAL_FRAMEWORK[legalKey] || CHILEAN_LAND_LEGAL_FRAMEWORK.dl3516;

      const subTabs = [
        { id: 'titles', icon: '📜', label: 'Títulos & CBR' },
        { id: 'legal', icon: '⚖️', label: 'Marco Legal & Suelo' },
        { id: 'vault', icon: '📁', label: `Bóveda Documental (${activeProp.documentos.length})` },
        { id: 'mosaic', icon: '🗺️', label: 'Deslindes & Mosaico' }
      ];

      return `
        <div class="modal-overlay glass-modal-backdrop" style="display: flex; z-index: 70;">
          <div class="station-modal-container" style="max-width: 820px; width: 92%; max-height: 90vh;">
            <!-- Header Modal con Selector de Predio -->
            <div style="padding: 14px 18px; background: #27150c; border-bottom: 2px solid #78350f; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 8px; background: #1a0e07; border: 1px solid #d97706; padding: 4px; display: flex; align-items: center; justify-content: center;">
                  <img src="${station.spriteSrc}" alt="${station.title}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-family: monospace; font-size: 11px; font-weight: 800; color: #fbbf24; background: #451a03; padding: 1px 6px; border-radius: 4px; border: 1px solid #92400e;">
                      ${station.code}
                    </span>
                    <h3 style="margin: 0; font-family: Georgia, serif; font-size: 16px; font-weight: 800; color: #ffffff;">
                      ${station.title}
                    </h3>
                  </div>
                  <div style="font-size: 11px; color: #d6c4a8;">
                    Rol SII: <strong style="color: #fde047;">${activeProp.rolSII}</strong> • CBR ${activeProp.cbr.conservador}
                  </div>
                </div>
              </div>

              <!-- Selector de Predio & Botón Cerrar -->
              <div style="display: flex; align-items: center; gap: 10px;">
                <select id="selectModalPropertyRegistry" style="background: #150a04; color: #fde047; border: 1px solid #b45309; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-family: monospace; cursor: pointer;">
                  ${propertyRegistryManager.getAllProperties().map(p => `
                    <option value="${p.id}" ${p.id === activeProp.id ? 'selected' : ''}>${p.name} (${p.rolSII})</option>
                  `).join('')}
                </select>
                <button id="btnCloseStationModal" class="btn-workshop-close">&times;</button>
              </div>
            </div>

            <!-- Barra de Sub-Pestañas Operativas del Registro Predial -->
            <div style="display: flex; background: #1a0d06; border-bottom: 1px solid #78350f; padding: 4px 12px; gap: 6px; overflow-x: auto;">
              ${subTabs.map(t => `
                <button class="prop-registry-tab-btn ${subTab === t.id ? 'active' : ''}" data-prop-tab="${t.id}" style="padding: 8px 14px; border-radius: 6px; border: 1px solid ${subTab === t.id ? '#f59e0b' : 'transparent'}; background: ${subTab === t.id ? 'rgba(245, 158, 11, 0.2)' : 'transparent'}; color: ${subTab === t.id ? '#fde047' : '#cbd5e1'}; font-size: 11px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
                  <span>${t.icon}</span>
                  <span>${t.label}</span>
                </button>
              `).join('')}
            </div>

            <!-- Body Modal Dinámico por Pestaña -->
            <div style="padding: 16px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; color: #e6ccb2; max-height: calc(90vh - 180px);">
              
              <!-- ================= 1. SUB-PESTAÑA: TÍTULOS & CBR ================= -->
              ${subTab === 'titles' ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <!-- Tarjeta Inscripción CBR -->
                  <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong style="color: #fbbf24; font-size: 12px;">🏛️ Conservador de Bienes Raíces (CBR)</strong>
                      <span style="font-size: 9.5px; background: rgba(16,185,129,0.2); color: #34d399; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.4); font-weight: bold;">Dominio Vigente</span>
                    </div>
                    <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
                      • <strong>Jurisdicción:</strong> ${activeProp.cbr.conservador}<br>
                      • <strong>Inscripción:</strong> Fojas ${activeProp.cbr.fojas} N° ${activeProp.cbr.numero} del Año ${activeProp.cbr.ano}<br>
                      • <strong>Registro:</strong> ${activeProp.cbr.registro}<br>
                      • <strong>Superficie Física:</strong> ${activeProp.superficieTotalHa} hectáreas
                    </div>
                  </div>

                  <!-- Tarjeta Avalúo SII -->
                  <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong style="color: #38bdf8; font-size: 12px;">📑 Servicio de Impuestos Internos (SII)</strong>
                      <span style="font-size: 9.5px; background: rgba(56,189,248,0.2); color: #38bdf8; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.4); font-weight: bold;">Serie Agrícola</span>
                    </div>
                    <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
                      • <strong>Rol de Avalúo:</strong> ${activeProp.rolSII}<br>
                      • <strong>Destino Predial:</strong> ${activeProp.serieSII}<br>
                      • <strong>Avalúo Fiscal:</strong> $${activeProp.avaluoFiscalCLP.toLocaleString('es-CL')} CLP<br>
                      • <strong>Impuesto Territorial:</strong> ${activeProp.exencionContribuciones}
                    </div>
                  </div>
                </div>

                <!-- Propietarios y Titulares de Dominio -->
                <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px;">
                  <strong style="color: #fbbf24; font-size: 12px; display: block; margin-bottom: 8px;">👥 Registro de Titulares de Dominio & Propietarios:</strong>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${activeProp.propietarios.map(p => `
                      <div style="display: flex; justify-content: space-between; align-items: center; background: #120703; padding: 8px 10px; border-radius: 6px; border: 1px solid #3d1704; font-size: 11px;">
                        <div>
                          <strong style="color: #ffffff;">${p.nombre}</strong>
                          <span style="color: #94a3b8; font-family: monospace; margin-left: 8px;">RUT: ${p.rut}</span>
                        </div>
                        <span style="color: #fde047; font-weight: bold; font-family: monospace;">Participación: ${p.participacion}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Derechos de Agua DGA -->
                <div style="background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(14, 165, 233, 0.4); border-radius: 10px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="color: #38bdf8; font-size: 12px;">💧 Derechos de Aprovechamiento de Aguas (Código de Aguas & DGA)</strong>
                    <span style="font-size: 9.5px; color: #7dd3fc; font-family: monospace;">${activeProp.derechosAgua.codigoCPA_DGA}</span>
                  </div>
                  <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
                    • <strong>Caudal Autorizado:</strong> ${activeProp.derechosAgua.caudalTotalLs} L/s<br>
                    • <strong>Fuentes de Captación:</strong> ${activeProp.derechosAgua.fuente}<br>
                    • <strong>Registro de Aguas CBR:</strong> ${activeProp.derechosAgua.fojasAguasCBR}<br>
                    • <strong>Transmisión MEE DGA Res. 1238:</strong> <span style="color: #4ade80; font-weight: bold;">${activeProp.derechosAgua.estadoMEE}</span>
                  </div>
                </div>

                <!-- Deslindes Notariales -->
                <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px;">
                  <strong style="color: #fbbf24; font-size: 12px; display: block; margin-bottom: 8px;">🧭 Deslindes Notariales del Título de Propiedad:</strong>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                    <div style="background: #120703; padding: 8px; border-radius: 6px; border-left: 3px solid #38bdf8;">
                      <strong style="color: #38bdf8;">NORTE:</strong> <span style="color: #cbd5e1;">${activeProp.deslindes.norte}</span>
                    </div>
                    <div style="background: #120703; padding: 8px; border-radius: 6px; border-left: 3px solid #f59e0b;">
                      <strong style="color: #f59e0b;">SUR:</strong> <span style="color: #cbd5e1;">${activeProp.deslindes.sur}</span>
                    </div>
                    <div style="background: #120703; padding: 8px; border-radius: 6px; border-left: 3px solid #10b981;">
                      <strong style="color: #10b981;">ESTE:</strong> <span style="color: #cbd5e1;">${activeProp.deslindes.este}</span>
                    </div>
                    <div style="background: #120703; padding: 8px; border-radius: 6px; border-left: 3px solid #c084fc;">
                      <strong style="color: #c084fc;">OESTE:</strong> <span style="color: #cbd5e1;">${activeProp.deslindes.oeste}</span>
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- ================= 2. SUB-PESTAÑA: MARCO LEGAL & USO DE SUELO ================= -->
              ${subTab === 'legal' ? `
                <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px;">
                  <div style="display: flex; gap: 6px; margin-bottom: 12px; overflow-x: auto; padding-bottom: 4px;">
                    ${Object.keys(CHILEAN_LAND_LEGAL_FRAMEWORK).map(k => {
                      const fw = CHILEAN_LAND_LEGAL_FRAMEWORK[k];
                      return `
                        <button class="legal-framework-btn ${legalKey === k ? 'active' : ''}" data-legal-key="${k}" style="padding: 6px 10px; border-radius: 6px; border: 1px solid ${legalKey === k ? fw.color : 'rgba(255,255,255,0.1)'}; background: ${legalKey === k ? 'rgba(0,0,0,0.4)' : '#140803'}; color: ${legalKey === k ? fw.color : '#cbd5e1'}; font-size: 10.5px; font-weight: bold; cursor: pointer; white-space: nowrap;">
                          ${fw.title.split('-')[0].trim()}
                        </button>
                      `;
                    }).join('')}
                  </div>

                  <div style="border-left: 3px solid ${legalFramework.color}; padding-left: 10px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <h4 style="margin: 0; color: #ffffff; font-size: 13px; font-family: Georgia, serif;">${legalFramework.title}</h4>
                      <span style="font-size: 9.5px; background: rgba(0,0,0,0.4); color: ${legalFramework.color}; border: 1px solid ${legalFramework.color}; padding: 2px 6px; border-radius: 4px; font-family: monospace;">
                        ${legalFramework.badge}
                      </span>
                    </div>
                    <div style="font-size: 10.5px; color: #94a3b8; margin-top: 3px;">
                      Autoridad Fiscalizadora: <strong style="color: #cbd5e1;">${legalFramework.authority}</strong>
                    </div>
                    <p style="font-size: 11px; color: #e2e8f0; margin: 6px 0 0 0; line-height: 1.45;">
                      ${legalFramework.summary}
                    </p>
                  </div>

                  <!-- Reglas & Obligaciones Clave -->
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${legalFramework.rules.map(r => `
                      <div style="background: #120703; padding: 10px; border-radius: 6px; border: 1px solid #3d1704;">
                        <strong style="color: ${legalFramework.color}; font-size: 11px; display: block; margin-bottom: 3px;">
                          ✓ ${r.topic}
                        </strong>
                        <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
                          ${r.desc}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Resumen de Restricciones del Predio Actual -->
                <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 10px; padding: 12px;">
                  <strong style="color: #f87171; font-size: 12px; display: block; margin-bottom: 6px;">
                    ⚠️ Gravámenes, Servidumbres & Restricciones Activas para ${activeProp.name}:
                  </strong>
                  <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #fecaca; line-height: 1.5;">
                    ${activeProp.restriccionesLegales.map(r => `<li>${r}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              <!-- ================= 3. SUB-PESTAÑA: BÓVEDA DE DOCUMENTOS (.AGRITWIN) ================= -->
              ${subTab === 'vault' ? `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #180d06; padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(120,53,15,0.7);">
                  <div>
                    <strong style="color: #fbbf24; font-size: 12px;">📁 Custodia Documental del Predio (${activeProp.documentos.length} archivos)</strong>
                    <div style="font-size: 10px; color: #94a3b8;">Almacenamiento seguro persistente para escrituras, certificados CBR, planos SAG y DGA.</div>
                  </div>
                  <div>
                    <input type="file" id="inputUploadLegalDoc" style="display: none;" accept=".pdf,.dwg,.doc,.docx,.txt,.agritwin">
                    <button id="btnTriggerUploadLegalDoc" style="padding: 6px 12px; background: #d97706; color: #fff; border: 1px solid #f59e0b; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                      <span>➕ Adjuntar Archivo</span>
                    </button>
                  </div>
                </div>

                <!-- Lista de Documentos en Custodia -->
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${activeProp.documentos.map(doc => `
                    <div style="background: #140803; border: 1px solid #451a03; border-radius: 8px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;" onmouseover="this.style.borderColor='#f59e0b'" onmouseout="this.style.borderColor='#451a03'">
                      <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <span style="font-size: 22px;">📄</span>
                        <div>
                          <div style="font-size: 12px; font-weight: bold; color: #ffffff;">
                            ${doc.nombre}
                          </div>
                          <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">
                            <span style="color: #fde047; font-weight: 600;">${doc.tipo}</span> • Emisor: ${doc.emisor} • ${doc.fecha} • ${doc.tamano}
                          </div>
                          <div style="font-size: 9.5px; color: #94a3b8; font-family: monospace; margin-top: 3px;">
                            SHA-256: ${doc.hashSha256.substring(0, 24)}... ${doc.verificado ? '<span style="color: #34d399;">✓ Conforme CBR</span>' : ''}
                          </div>
                          ${doc.nota ? `<div style="font-size: 10px; color: #d6c4a8; font-style: italic; margin-top: 3px;">"${doc.nota}"</div>` : ''}
                        </div>
                      </div>

                      <div style="display: flex; gap: 6px;">
                        <button class="btn-download-vault-doc" data-doc-name="${doc.nombre}" style="padding: 5px 8px; background: rgba(56,189,248,0.2); border: 1px solid rgba(56,189,248,0.4); color: #38bdf8; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">
                          📥 Descargar
                        </button>
                        <button class="btn-delete-vault-doc" data-doc-id="${doc.id}" style="padding: 5px 8px; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #f87171; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">
                          🗑️
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <!-- ================= 4. SUB-PESTAÑA: DESLINDES & MOSAICO ================= -->
              ${subTab === 'mosaic' ? `
                <div style="background: #180d06; border: 1px solid rgba(120,53,15,0.7); border-radius: 10px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="color: #fbbf24; font-size: 12px;">🗺️ Mosaico Catastral & Predios Colindantes</strong>
                    <span style="font-size: 10px; font-family: monospace; color: #34d399; background: rgba(16,185,129,0.2); padding: 2px 6px; border-radius: 4px;">100% Acoplado DEM 3D</span>
                  </div>
                  <p style="font-size: 11px; color: #cbd5e1; margin: 0 0 10px 0; line-height: 1.45;">
                    Permite visualizar el polígono del predio en relación a predios vecinos, evaluar riesgos de interfaz (incendios, amortiguación de quebradas) y verificar deslindes físicos georreferenciados.
                  </p>
                  
                  <!-- Contenedor del Gráfico Dinámico Chart.js de Conformidad de Linderos -->
                  <div style="background: #120804; padding: 12px; border-radius: 8px; border: 1px solid rgba(120,53,15,0.8); margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-size: 11px; font-weight: bold; color: #ffffff;">📊 Conformidad Legal de Linderos vs. Superficie Predial</span>
                      <span style="font-size: 9.5px; color: #fbbf24; font-family: monospace;">Malla Vecinal Maule</span>
                    </div>
                    <div style="position: relative; height: 160px; width: 100%;">
                      <canvas id="stationDynamicChart"></canvas>
                    </div>
                  </div>

                  <button id="btnFocusPredioIn3D" style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid #38bdf8; color: #7dd3fc; border-radius: 8px; font-size: 11.5px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
                    <span>🎯 Enfocar Polígono de Límites & Curvas en el Visor 3D</span>
                  </button>
                </div>
              ` : ''}

            </div>

            <!-- Footer Modal -->
            <div style="padding: 12px 20px; background: #231309; border-top: 1px solid #78350f; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; color: #a89984; font-family: Georgia, serif;">
                Predio Activo: <strong>${activeProp.name}</strong> • Rol: <strong>${activeProp.rolSII}</strong>
              </span>
              <div style="display: flex; gap: 8px;">
                <button id="btnDismissStationModal" class="btn-workshop-action">
                  Cerrar
                </button>
                <button id="btnDownloadConsolidatedReport" class="btn-workshop-action btn-workshop-primary" style="background: #047857; border-color: #10b981; color: #ffffff;">
                  📥 Descargar Dossier Legal (.txt)
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Modal genérico para el resto de los sprites
    return `
      <div class="modal-overlay glass-modal-backdrop" style="display: flex; z-index: 70;">
        <div class="station-modal-container">
          <!-- Header Modal -->
          <div style="padding: 16px 20px; background: #27150c; border-bottom: 2px solid #78350f; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 44px; height: 44px; border-radius: 8px; background: #1a0e07; border: 1px solid #d97706; padding: 4px; display: flex; align-items: center; justify-content: center;">
                <img src="${station.spriteSrc}" alt="${station.title}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-family: monospace; font-size: 11px; font-weight: 800; color: #fbbf24; background: #451a03; padding: 1px 6px; border-radius: 4px; border: 1px solid #92400e;">
                    ${station.code}
                  </span>
                  <h3 style="margin: 0; font-family: Georgia, serif; font-size: 16px; font-weight: 800; color: #ffffff;">
                    ${station.title}
                  </h3>
                </div>
                <div style="font-size: 11px; color: #d6c4a8; font-style: italic;">
                  ${station.category} • ${station.badge}
                </div>
              </div>
            </div>
            <button id="btnCloseStationModal" class="btn-workshop-close">&times;</button>
          </div>

          <!-- Body Modal con Gráfica Dinámica Reemplazando Python -->
          <div style="padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; color: #e6ccb2;">
            <div style="background: #24130a; padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(120,53,15,0.6); font-size: 12px; line-height: 1.5;">
              ${station.description}
            </div>

            <div>
              <div style="font-family: monospace; font-size: 11px; font-weight: 800; color: #fbbf24; text-transform: uppercase; margin-bottom: 8px;">
                🛠️ Submódulos Auditados
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                ${station.tools.map(tool => `
                  <div style="background: #140a05; padding: 8px 10px; border-radius: 6px; border: 1px solid #451a03; font-size: 11px; display: flex; align-items: center; gap: 6px; color: #cbd5e1;">
                    <span style="color: #34d399;">✓</span>
                    <span>${tool}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Contenedor del Gráfico Dinámico Chart.js -->
            <div style="background: #120804; padding: 14px; border-radius: 12px; border: 1px solid rgba(120,53,15,0.8);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <div style="font-family: Georgia, serif; font-size: 13px; font-weight: 800; color: #fff;">
                  📊 Gráfica Interactiva en Tiempo Real (Reemplazo Python)
                </div>
                <span style="font-family: monospace; font-size: 10px; background: rgba(16,185,129,0.2); color: #34d399; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.4);">
                  Chart.js 60fps
                </span>
              </div>
              <div style="position: relative; height: 160px; width: 100%;">
                <canvas id="stationDynamicChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Footer Modal -->
          <div style="padding: 14px 20px; background: #231309; border-top: 1px solid #78350f; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; color: #a89984; font-family: Georgia, serif;">
              Presiona Esc para volver al taller
            </span>
            <div style="display: flex; gap: 8px;">
              <button id="btnDismissStationModal" class="btn-workshop-action">
                Cerrar
              </button>
              <button id="btnExecuteStationAction" class="btn-workshop-action btn-workshop-primary">
                ${station.id === 'station_c' ? 'Abrir Gemelo 3D' : station.id === 'station_map' ? 'Abrir Simulación Territorial' : 'Abrir Herramienta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Exponer ayudantes globales para interacción desde Drawer de Predio (Establo, Cultivos, etc.)
    window.openGalponWorkshop = (branch = null) => {
      this.open();
      if (branch) {
        this.selectedEnclosureBranch = branch;
        this.openStationModal('station_b');
      } else {
        this.showCampaignBoard = true;
        this.closeStationModal();
        this.render();
      }
    };
    window.triggerSimRain = () => {
      bus.emit('weather:toggle_rain');
      bus.emit('ui:show_toast', '🌧️ Alternando simulación 3D de precipitaciones procedurales.');
    };

    // Abrir/cerrar con tecla W o Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'w' || e.key === 'W') {
        if (!e.target.matches('input, textarea')) {
          this.toggle();
        }
      }
      if (e.key === 'Escape' && this.overlayEl.classList.contains('active')) {
        if (this.activeModalStation) {
          this.closeStationModal();
        } else if (this.showAdminPanel) {
          this.showAdminPanel = false;
          this.render();
        } else {
          this.close();
        }
      }
    });
  }

  bindDynamicListeners() {
    // Botón Salto al Gemelo 3D (Header)
    const btnLaunch = document.getElementById('btnWorkshopLaunchTwin');
    if (btnLaunch) {
      btnLaunch.addEventListener('click', () => {
        this.close();
        if (this.app && this.app.mapManager) {
          this.app.mapManager.flyToPreset('overview');
        }
        bus.emit('ui:show_toast', '🌾 Bienvenido al Fundo Estero Colliguay. Gemelo 3D activo.');
      });
    }

    // Acciones del Tablón de Campaña Diegético (AoE II)
    const btnBoardGabinete = document.getElementById('btnBoardOpenGabinete');
    if (btnBoardGabinete) {
      btnBoardGabinete.addEventListener('click', () => {
        this.openStationModal('station_b');
      });
    }

    const btnBoardRain = document.getElementById('btnBoardSimulateRain');
    if (btnBoardRain) {
      btnBoardRain.addEventListener('click', () => {
        if (window.triggerSimRain) {
          window.triggerSimRain();
        } else {
          bus.emit('weather:toggle_rain');
        }
      });
    }

    const btnBoardLaunchPredio = document.getElementById('btnBoardLaunchPredio3D') || document.getElementById('btnBoardLaunchColliguay');
    if (btnBoardLaunchPredio) {
      btnBoardLaunchPredio.addEventListener('click', () => {
        this.close();
        if (this.app && this.app.mapManager) {
          this.app.mapManager.flyToPreset('overview');
        }
        bus.emit('ui:show_toast', '🌾 Modo Predio 3D activo. Explorando Fundo Estero Colliguay.');
      });
    }

    const btnBoardNew = document.getElementById('btnBoardNewProject');
    if (btnBoardNew) {
      btnBoardNew.addEventListener('click', () => {
        this.close();
        if (this.app && this.app.drawingManager) {
          this.app.drawingManager.toggleDrawingMode(true);
        }
        bus.emit('ui:show_toast', '✨ Nuevo predio en blanco. Usa el Pincel 3D para trazar tus primeras parcelas.');
      });
    }

    const btnBoardOpen = document.getElementById('btnBoardOpenProject');
    if (btnBoardOpen) {
      btnBoardOpen.addEventListener('click', () => {
        const agritwinInput = document.getElementById('agritwinFileInput');
        if (agritwinInput) {
          agritwinInput.click();
        } else {
          bus.emit('ui:show_toast', '📁 Selector de archivo .agritwin no disponible.');
        }
      });
    }

    const btnBoardImportGis = document.getElementById('btnBoardImportGis');
    if (btnBoardImportGis) {
      btnBoardImportGis.addEventListener('click', () => {
        this.close();
        if (this.app && this.app.projectManager && typeof this.app.projectManager.openImporterModal === 'function') {
          this.app.projectManager.openImporterModal();
        } else {
          const shapefileModal = document.getElementById('shapefileModal');
          if (shapefileModal) shapefileModal.style.display = 'flex';
        }
        bus.emit('ui:show_toast', '🗺️ Importador Shapefile (.shp / GeoJSON) abierto.');
      });
    }

    // Botón Cerrar Tablero Campaña
    const btnCloseCampaign = document.getElementById('btnCloseCampaignBoard');
    if (btnCloseCampaign) {
      btnCloseCampaign.addEventListener('click', () => {
        this.showCampaignBoard = false;
        this.render();
      });
    }

    // Botón Cerrar
    const btnClose = document.getElementById('btnWorkshopClose');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }

    // Toggle Admin Panel
    const btnAdminToggle = document.getElementById('btnWorkshopAdminToggle');
    if (btnAdminToggle) {
      btnAdminToggle.addEventListener('click', () => {
        this.showAdminPanel = !this.showAdminPanel;
        this.render();
      });
    }

    const btnCloseAdmin = document.getElementById('btnCloseAdminPanel');
    if (btnCloseAdmin) {
      btnCloseAdmin.addEventListener('click', () => {
        this.showAdminPanel = false;
        this.render();
      });
    }

    // Tabs del Admin Panel
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeAdminTab = btn.dataset.tab;
        this.render();
      });
    });

    // Clicks en los Sprites Diegéticos con protección contra arrastre (drag/pan)
    document.querySelectorAll('.workshop-sprite-anchor').forEach(el => {
      let startX = 0;
      let startY = 0;

      el.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
      });

      el.addEventListener('click', (e) => {
        const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
        if (dist > 8) return; // Si el usuario estaba desplazando la pantalla, ignorar

        this.audio?.playWoodClick();
        const id = el.dataset.stationId;
        const station = WORKSHOP_STATIONS_DATA.find(s => s.id === id);
        if (station && station.action) {
          station.action(this.app, this);
        } else if (station) {
          this.openStationModal(station);
        }
      });
    });

    // Clicks en saltos de estación del Admin Panel
    document.querySelectorAll('.station-jump-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.stationId;
        const station = WORKSHOP_STATIONS_DATA.find(s => s.id === id);
        if (station && station.action) {
          station.action(this.app, this);
        } else if (station) {
          this.openStationModal(station);
        }
      });
    });

    // Sub-vistas de Sensores: Telemetría vs Formato Informe
    const btnSubTelemetria = document.getElementById('btnSubTelemetria');
    if (btnSubTelemetria) {
      btnSubTelemetria.addEventListener('click', () => {
        this.sensorSubView = 'telemetry';
        this.render();
      });
    }

    const btnSubInforme = document.getElementById('btnSubInforme');
    if (btnSubInforme) {
      btnSubInforme.addEventListener('click', () => {
        this.sensorSubView = 'report';
        this.render();
      });
    }

    // Sliders de Calibración FDR en Vivo
    const sliderTemp = document.getElementById('sliderSimTemp');
    if (sliderTemp) {
      sliderTemp.addEventListener('input', (e) => {
        this.simTemp = parseFloat(e.target.value);
        const txt = document.getElementById('txtSimTemp');
        if (txt) txt.innerText = `${this.simTemp}°C`;
      });
    }

    const sliderMoisture = document.getElementById('sliderSimMoisture');
    if (sliderMoisture) {
      sliderMoisture.addEventListener('input', (e) => {
        this.simMoisture = parseFloat(e.target.value);
        const txt = document.getElementById('txtSimMoisture');
        if (txt) txt.innerText = `${this.simMoisture}%`;
      });
    }

    const sliderCwsi = document.getElementById('sliderSimCwsi');
    if (sliderCwsi) {
      sliderCwsi.addEventListener('input', (e) => {
        this.simCwsi = parseFloat(e.target.value);
        const txt = document.getElementById('txtSimCwsi');
        if (txt) txt.innerText = `${this.simCwsi}`;
      });
    }

    // Selector de Predios en Libreta Biofísica
    const selectPredio = document.getElementById('selectAdminPredio');
    if (selectPredio) {
      selectPredio.addEventListener('change', (e) => {
        this.selectedPredioId = e.target.value;
        propertyRegistryManager.setSelectedProperty(this.selectedPredioId);
        this.render();
      });
    }

    const btnAdminOpenPropStation = document.getElementById('btnAdminOpenPropertyRegistryStation');
    if (btnAdminOpenPropStation) {
      btnAdminOpenPropStation.addEventListener('click', () => {
        const st = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_map');
        if (st) this.openStationModal(st);
      });
    }

    // Botones de 1-Click Copy en Herramientas & CLI
    document.querySelectorAll('.btn-copy-cmd').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        if (cmd) {
          navigator.clipboard.writeText(cmd).then(() => {
            const originalText = btn.innerText;
            btn.innerText = '✓ ¡Copiado!';
            setTimeout(() => { btn.innerText = originalText; }, 2000);
            bus.emit('ui:show_toast', `📋 Comando copiado: ${cmd}`);
          }).catch(() => {
            bus.emit('ui:show_toast', `Comando: ${cmd}`);
          });
        }
      });
    });

    // Descarga de Informe Oficial de Telemetría IoT en formato TXT (Red Maule Sur)
    const btnDownloadReport = document.getElementById('btnDownloadIoTReport');
    if (btnDownloadReport) {
      btnDownloadReport.addEventListener('click', () => {
        const reportContent = `========================================================================
URRUTIA AGROTECH & AGRITWIN 3D - CERTIFICADO TÉCNICO OFICIAL DE TELEMETRÍA IOT
Código Documento: INF-IOT-2026-MAULE-SUR
Fecha Emisión: ${new Date().toISOString()}
Norma / Estándar: SAG / DGA MEE (Res. 1238) / GlobalGAP / EUDR Verificado
========================================================================

1. ANTECEDENTES DEL PREDIO & RED DE MICROCLIMA
------------------------------------------------------------------------
- Predio: Fundo Meniels (Estero Colliguay)
- Ubicación: Parral, Región del Maule, Chile (Lat -36.14°S, Lon -71.82°W)
- Superficie: 24.8 Hectáreas (Cerezo Lapins, Cepa País, Pastoreo PRV)
- Modelo de Red: Hardware Compartido (Gateway LoRaWAN Industrial + Nodos Satélite)
- Operador Técnico: AgroTech Maule SpA & Asesoría Técnica de Red

2. TELEMETRÍA EN VIVO • PILARES PRODUCTIVOS DEL MAULE
------------------------------------------------------------------------
[A] NODO HELADAS A ALTURA DE FRUTA (IOT-FROST-01 - 1.2 metros):
    - Temperatura Altura Fruta: -0.8 °C (Yemas de Cerezo Expuestas)
    - Temperatura Abrigo Meteorológico (2.0 metros): 2.4 °C (Delta: -3.2 °C)
    - Temperatura de Bulbo Húmedo: -1.5 °C (Psicrometría de Stull)
    - Dinámica Eólica: 1.8 km/h (Calma - Helada Radiativa Katabática)
    - DICTAMEN: NO ENCENDER RIEGO ANTIHELADA. Bulbo húmedo es menor a -0.5 °C;
      aplicar agua provocará congelamiento evaporativo destructivo en flores.
      Activar ventiladores de inversión térmica o calefactores.

[B] SENSOR DE MOJAMIENTO FOLIAR (IOT-LEAF-01 - PHYTOS-31):
    - Horas Continuas de Hoja Mojada: 11.5 horas
    - Humedad Relativa Canopia: 94 % | Temperatura Follaje: 17.2 °C
    - Índice de Presión Botrytis (Modelo Mills): 82 % (Crítico > 70%)
    - DICTAMEN: GATILLAR APLICACIÓN DE BOTRICIDA. Umbral epidemiológico
      cumplido. Realizar aplicación preventiva hoy en franja 16:30 - 19:00 h.
      Ahorro vs. calendario ciego: $380.000 CLP/ha.

[C] CAUDALÍMETRO TELEMÉTRICO & TURNO DE CANAL (IOT-FLOW-01):
    - Caudal Instantáneo de Bombeo: 24.5 L/s
    - Transmisión DGA MEE: CONFORME (Resolución DGA N° 1238 / Lote 0912)
    - Días de Reserva en Suelo: 4.2 días (Perfil Franco-Arcilloso Maule)
    - Próximo Turno de Canal: en 4.0 días (Martes 08:00 h)
    - DICTAMEN: POZO APAGADO. El suelo sostiene el cultivo hasta el turno.
      Solicitar 32 mm en el turno para recarga por gravedad. Ahorro: $112.000 CLP.

[D] ESTACIÓN MICROZONA & VENTANA FITOSANITARIA (IOT-WX-01):
    - Viento Actual: 5.2 km/h ENE (Apto pulverización < 10 km/h)
    - Ventana Segura de Hoy: 07:30 a 10:45 h (Suspender al mediodía por Puelche)
    - Riesgo de Partidura de Cerezas (Cracking 72h): Riesgo Medio (14.5 mm previstos)
    - Horas de Frío Acumuladas: 745 HF | Grados-Día: 390 GD

3. DICTAMEN INTEGRAL DEL ASESOR AGRONÓMICO
------------------------------------------------------------------------
El manejo en el Maule prioriza el seguro productivo sobre el volumen hídrico.
Se valida la estrategia de cero daño por heladas mediante ventilación de aire frío
y se mantiene el cumplimiento normativo DGA al 100%.

Firma Digital Criptográfica: 0x8f2d4a19c6e3b7fa99d140e
AgriTwin Telemetry Engine v2.4 • Red AgroTech Región del Maule
========================================================================`;
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'INF-IOT-2026-MAULE_Fundo_Meniels.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        bus.emit('ui:show_toast', '📥 Informe técnico Maule descargado exitosamente (.txt)');
      });
    }

    // Acciones de la Pestaña Motores & Auditoría en el Admin Panel
    const btnLaunchInspector = document.getElementById('btnAdminLaunchEngineInspector');
    if (btnLaunchInspector) {
      btnLaunchInspector.addEventListener('click', () => {
        this.close();
        if (this.app?.engineInspectorModal) {
          this.app.engineInspectorModal.open();
        } else {
          bus.emit('ui:show_toast', '⚙️ Presiona Shift+D para abrir el Inspector de Motor 3D.');
        }
      });
    }

    const btnLaunchBioSim = document.getElementById('btnAdminLaunchBioSim');
    if (btnLaunchBioSim) {
      btnLaunchBioSim.addEventListener('click', () => {
        const modal = document.getElementById('bioSimModal');
        if (modal) modal.style.display = 'flex';
      });
    }

    const btnLaunchWindModal = document.getElementById('btnAdminLaunchWindModal');
    if (btnLaunchWindModal) {
      btnLaunchWindModal.addEventListener('click', () => {
        this.openWindDossierModal();
      });
    }

    const btnActivateAllWinds = document.getElementById('btnAdminActivateAllWinds');
    if (btnActivateAllWinds) {
      btnActivateAllWinds.addEventListener('click', () => {
        this.close();
        bus.emit('geomorph:toggle_wind_streamlines', true);
        bus.emit('ui:show_toast', '🌪️ Campo de vientos orográficos multidirreccionales activado en el Visor 3D.');
      });
    }

    const btnOpenMauleBoard = document.getElementById('btnAdminOpenMauleIoTBoard');
    if (btnOpenMauleBoard) {
      btnOpenMauleBoard.addEventListener('click', () => {
        const stationB = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_b');
        if (stationB) {
          this.openStationModal(stationB);
        }
      });
    }

    const btnLaunchReporte = document.getElementById('btnAdminLaunchReporteTecnico');
    if (btnLaunchReporte) {
      btnLaunchReporte.addEventListener('click', () => {
        const modal = document.getElementById('reporteTecnicoModal');
        if (modal) modal.style.display = 'flex';
      });
    }

    // Maule Sensor Network Tabs Listener
    document.querySelectorAll('.maule-sensor-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.dataset.mauleTab;
        if (tabKey) {
          this.selectedMauleSensorTab = tabKey;
          this.render();
        }
      });
    });

    // Selector de Modo de Caja de Terreno (Operación vs Esquema de Conexiones Físicas)
    document.querySelectorAll('.enclosure-main-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab) {
          this.selectedEnclosureTab = tab;
          this.render();
        }
      });
    });

    // Selector de Circuitos en el Gemelo de Conexiones
    document.querySelectorAll('.btn-select-circuit').forEach(btn => {
      btn.addEventListener('click', () => {
        const cId = btn.dataset.circuitId;
        if (cId) {
          this.selectedCircuitId = cId;
          this.render();
        }
      });
    });

    // Pulso de señal interactivo en el Gemelo de Conexiones
    const btnPulse = document.getElementById('btnSimulateSignalPulse');
    const feedbackPulse = document.getElementById('signalPulseFeedback');
    if (btnPulse && feedbackPulse) {
      btnPulse.addEventListener('click', () => {
        feedbackPulse.style.display = 'block';
        btnPulse.style.background = '#22c55e';
        btnPulse.style.color = '#000000';
        setTimeout(() => {
          btnPulse.style.background = 'rgba(34, 197, 94, 0.2)';
          btnPulse.style.color = '#86efac';
        }, 300);
        setTimeout(() => {
          feedbackPulse.style.display = 'none';
        }, 4000);
      });
    }

    // Copiar código firmware en el Gemelo de Conexiones
    const btnCopyCode = document.getElementById('btnCopyFirmwareCode');
    if (btnCopyCode) {
      btnCopyCode.addEventListener('click', () => {
        const codePre = btnCopyCode.closest('div').parentElement.querySelector('pre');
        if (codePre) {
          navigator.clipboard.writeText(codePre.textContent).then(() => {
            const orig = btnCopyCode.textContent;
            btnCopyCode.textContent = '¡Copiado! ✓';
            btnCopyCode.style.color = '#4ade80';
            setTimeout(() => {
              btnCopyCode.textContent = orig;
              btnCopyCode.style.color = '#e4e4e7';
            }, 2000);
          });
        }
      });
    }

    // Selector de Ramas de la Caja de Terreno (General / Cuarteles / Establo)
    document.querySelectorAll('.enclosure-branch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const branchId = btn.dataset.branchId;
        if (branchId) {
          this.selectedEnclosureBranch = branchId;
          this.render();
        }
      });
    });

    // Conmutador Enlace Simulado vs. Hardware Real (ESP32)
    const btnToggleHwLink = document.getElementById('btnToggleHardwareLinkMode');
    if (btnToggleHwLink) {
      btnToggleHwLink.addEventListener('click', () => {
        const nextMode = weatherService.linkMode === 'live_hardware' ? 'simulated' : 'live_hardware';
        weatherService.setLinkMode(nextMode);
        this.render();
      });
    }

    // Conmutador Basculante de Interruptores / Relés Industriales
    document.querySelectorAll('.btn-toggle-actuator-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        const actId = btn.dataset.actId;
        if (actId) {
          actuatorManager.cycleMode(actId);
          this.render();
        }
      });
    });

    // Sub-pestañas de Registro Predial (station_map)
    document.querySelectorAll('.prop-registry-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.dataset.propTab;
        if (tabKey) {
          this.selectedPropertySubTab = tabKey;
          this.render();
        }
      });
    });

    // Selector de predio en modal station_map
    const selectPropModal = document.getElementById('selectModalPropertyRegistry');
    if (selectPropModal) {
      selectPropModal.addEventListener('change', (e) => {
        this.selectedPredioId = e.target.value;
        propertyRegistryManager.setSelectedProperty(this.selectedPredioId);
        this.render();
      });
    }

    // Botones de Marco Legal
    document.querySelectorAll('.legal-framework-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.legalKey;
        if (k) {
          this.selectedLegalDocTab = k;
          this.render();
        }
      });
    });

    // Carga de archivos en Bóveda Documental
    const btnTriggerUpload = document.getElementById('btnTriggerUploadLegalDoc');
    const inputUploadDoc = document.getElementById('inputUploadLegalDoc');
    if (btnTriggerUpload && inputUploadDoc) {
      btnTriggerUpload.addEventListener('click', () => inputUploadDoc.click());
      inputUploadDoc.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const sizeKb = (file.size / 1024).toFixed(1);
          const sizeStr = file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${sizeKb} KB`;
          const ext = file.name.split('.').pop().toLowerCase();
          const docType = ext === 'pdf' ? 'Documento Legal PDF' : (ext === 'dwg' ? 'Plano CAD Georreferenciado' : 'Archivo Predial');

          const reader = new FileReader();
          reader.onload = (re) => {
            propertyRegistryManager.addDocumentToProperty(this.selectedPredioId, {
              nombre: file.name,
              tipo: docType,
              emisor: 'Cargado por Propietario',
              fecha: new Date().toISOString().split('T')[0],
              tamano: sizeStr,
              verificado: true,
              nota: `Archivo ingresado localmente (${file.type || ext}).`,
              dataUrl: re.target?.result || null
            });
            this.render();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Descarga de documentos desde la Bóveda Documental
    document.querySelectorAll('.btn-download-vault-doc').forEach(btn => {
      btn.addEventListener('click', () => {
        const docName = btn.dataset.docName;
        const prop = propertyRegistryManager.getProperty(this.selectedPredioId);
        const doc = prop.documentos.find(d => d.nombre === docName);
        if (doc) {
          const content = doc.dataUrl || `DOCUMENTO PREDIAL DIGITALIZADO\nPredio: ${prop.name}\nRol SII: ${prop.rolSII}\nDocumento: ${doc.nombre}\nTipo: ${doc.tipo}\nEmisor: ${doc.emisor}\nFecha: ${doc.fecha}\nHash SHA-256: ${doc.hashSha256}\n\n[Contenido certificado bajo custodia en AgriTwin Digital Twin Bóveda]`;
          const isDataUrl = doc.dataUrl && doc.dataUrl.startsWith('data:');
          const a = document.createElement('a');
          if (isDataUrl) {
            a.href = doc.dataUrl;
          } else {
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            a.href = URL.createObjectURL(blob);
          }
          a.download = doc.nombre.endsWith('.txt') || doc.nombre.endsWith('.pdf') ? doc.nombre : `${doc.nombre}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          bus.emit('ui:show_toast', `📥 Descargando documento: ${doc.nombre}`);
        }
      });
    });

    // Eliminación de documentos de la Bóveda
    document.querySelectorAll('.btn-delete-vault-doc').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.dataset.docId;
        if (confirm('¿Deseas eliminar este documento del registro local?')) {
          propertyRegistryManager.deleteDocumentFromProperty(this.selectedPredioId, docId);
          this.render();
        }
      });
    });

    // Descarga de Dossier Consolidado Legal .txt
    const btnDownloadConsolidated = document.getElementById('btnDownloadConsolidatedReport');
    if (btnDownloadConsolidated) {
      btnDownloadConsolidated.addEventListener('click', () => {
        const prop = propertyRegistryManager.getProperty(this.selectedPredioId);
        const report = propertyRegistryManager.generateConsolidatedLegalReport(this.selectedPredioId);
        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DOSSIER_LEGAL_${prop.rolSII.replace('-', '_')}_${prop.name.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        bus.emit('ui:show_toast', `📥 Dossier Legal de ${prop.name} descargado exitosamente (.txt)`);
      });
    }

    // Botón Enfocar Predio en 3D
    const btnFocus3D = document.getElementById('btnFocusPredioIn3D');
    if (btnFocus3D) {
      btnFocus3D.addEventListener('click', () => {
        this.close();
        if (this.app?.uiController?.flyToColliguayLocal) {
          this.app.uiController.flyToColliguayLocal();
        } else {
          bus.emit('map:flyto', 'overview');
        }
        bus.emit('ui:show_toast', '🎯 Enfocando polígono de límites prediales y curvas de relieve en el Visor 3D.');
      });
    }

    // Modal listeners
    const adminBackdrop = document.getElementById('adminPanelBackdrop');
    if (adminBackdrop) {
      adminBackdrop.addEventListener('click', (e) => {
        if (e.target === adminBackdrop) {
          this.closeAdminPanel();
        }
      });
    }

    const btnFocusSensor = document.getElementById('btnFocusSensorIn3D');
    if (btnFocusSensor) {
      btnFocusSensor.addEventListener('click', () => {
        const activeKey = this.selectedMauleSensorTab || 'frost';
        const cfg = MAULE_SENSORS_CONFIG[activeKey] || MAULE_SENSORS_CONFIG.frost;
        this.close();
        if (this.app?.sensorManager) {
          this.app.sensorManager.highlightSensor(cfg.sensorId);
        }
        bus.emit('ui:show_toast', `🎯 Enfocando sensor ${cfg.name} en el Visor de Predio 3D.`);
      });
    }

    const btnToggleCampaign = document.getElementById('btnToggleCampaignFromAdmin');
    if (btnToggleCampaign) {
      btnToggleCampaign.addEventListener('click', () => {
        this.showCampaignBoard = !this.showCampaignBoard;
        this.render();
        bus.emit('ui:show_toast', this.showCampaignBoard ? '🗺️ Tablón de Misión visible.' : '🗺️ Tablón de Misión oculto.');
      });
    }

    const btnEnter3D = document.getElementById('btnEnter3DFromAdmin');
    if (btnEnter3D) {
      btnEnter3D.addEventListener('click', () => {
        this.close();
        if (this.app?.mapManager?.flyToPreset) {
          this.app.mapManager.flyToPreset('overview');
        }
        bus.emit('ui:show_toast', '🌾 Entrando al Gemelo Digital 3D del Predio.');
      });
    }

    const btnJumpTerritorial = document.getElementById('btnJumpTerritorial');
    if (btnJumpTerritorial) {
      btnJumpTerritorial.addEventListener('click', () => {
        this.close();
        const btn = document.getElementById('nav_profile_territorial');
        if (btn) btn.click();
        bus.emit('ui:show_toast', '📻 Conectando con la Red Territorial & APRs.');
      });
    }

    const btnCloseModal = document.getElementById('btnCloseStationModal');
    const btnDismissModal = document.getElementById('btnDismissStationModal');
    if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeStationModal());
    if (btnDismissModal) btnDismissModal.addEventListener('click', () => this.closeStationModal());

    const btnAction = document.getElementById('btnExecuteStationAction');
    if (btnAction && this.activeModalStation) {
      btnAction.addEventListener('click', () => {
        const st = this.activeModalStation;
        if (st.id === 'station_b') {
          const activeKey = this.selectedMauleSensorTab || 'frost';
          const cfg = MAULE_SENSORS_CONFIG[activeKey] || MAULE_SENSORS_CONFIG.frost;
          this.close();
          if (this.app?.sensorManager) {
            this.app.sensorManager.highlightSensor(cfg.sensorId);
          }
          bus.emit('ui:show_toast', `🎯 Enfocando sensor ${cfg.name} en el Visor de Predio 3D.`);
          return;
        }
        this.close();
        if (st.action) {
          st.action(this.app, this);
        }
      });
    }

    // Inicializar Gráfica Chart.js si el modal está abierto
    if (this.activeModalStation) {
      this.initChart(this.activeModalStation);
    }
  }

  openAdminPanelWithTab(tabId) {
    this.showAdminPanel = true;
    this.activeAdminTab = tabId || 'sensors';
    this.activeModalStation = null;
    this.audio?.playParchmentOpen();
    this.render();
  }

  closeAdminPanel() {
    this.showAdminPanel = false;
    if (this.currentChartInstance) {
      this.currentChartInstance.destroy();
      this.currentChartInstance = null;
    }
    this.render();
  }

  openStationModal(station) {
    const id = typeof station === 'string' ? station : station?.id;
    if (id === 'station_b') {
      this.activeModalStation = typeof station === 'object' ? station : WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_b');
      this.showAdminPanel = false;
      this.audio?.playWoodClick();
      this.render();
      return;
    }
    if (id === 'station_a') this.openAdminPanelWithTab('predios');
    else if (id === 'station_c') this.openAdminPanelWithTab('visor3d');
    else if (id === 'station_map') this.openAdminPanelWithTab('map');
    else if (id === 'station_d') this.openAdminPanelWithTab('vault');
    else if (id === 'station_e') this.openAdminPanelWithTab('territorial');
    else if (id === 'station_f') this.openAdminPanelWithTab('scripts');
    else this.openAdminPanelWithTab('sensors');
  }

  closeStationModal() {
    this.activeModalStation = null;
    if (this.currentChartInstance) {
      this.currentChartInstance.destroy();
      this.currentChartInstance = null;
    }
    this.render();
  }

  initChartForActiveTab() {
    const canvas = document.getElementById('stationDynamicChart');
    if (!canvas || !window.Chart) return;

    if (this.currentChartInstance) {
      this.currentChartInstance.destroy();
      this.currentChartInstance = null;
    }

    const ctx = canvas.getContext('2d');
    let cLabels, cDataset1, cDataset2, cLabel1, cLabel2, cColor1, cColor2, chartType = 'line';

    if (this.activeAdminTab === 'sensors') {
      const activeKey = this.selectedMauleSensorTab || 'frost';
      const cfg = MAULE_SENSORS_CONFIG[activeKey] || MAULE_SENSORS_CONFIG.frost;
      cLabels = cfg.chartLabels;
      cDataset1 = cfg.dataset1;
      cDataset2 = cfg.dataset2;
      cLabel1 = cfg.label1;
      cLabel2 = cfg.label2;
      cColor1 = cfg.color || '#38bdf8';
      cColor2 = '#fbbf24';
    } else if (this.activeAdminTab === 'predios') {
      const st = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_a');
      cLabels = st?.chartData?.labels || ['00:00', '06:00', '12:00', '18:00'];
      cDataset1 = st?.chartData?.dataset1 || [36, 32, 41, 37];
      cDataset2 = st?.chartData?.dataset2 || [28, 26, 35, 31];
      cLabel1 = st?.chartData?.label1 || 'Estrato 1 (0-20 cm) %';
      cLabel2 = st?.chartData?.label2 || 'Estrato 2 (20-60 cm) %';
      cColor1 = '#10b981';
      cColor2 = '#38bdf8';
    } else if (this.activeAdminTab === 'visor3d') {
      const st = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_c');
      cLabels = st?.chartData?.labels || ['Cuartel A', 'Cuartel B', 'Cuartel C', 'Cuartel D', 'Borde Estero'];
      cDataset1 = st?.chartData?.dataset1 || [0.78, 0.82, 0.65, 0.71, 0.89];
      cDataset2 = st?.chartData?.dataset2 || [12.4, 8.6, 14.1, 9.8, 5.2];
      cLabel1 = st?.chartData?.label1 || 'Índice Vigor NDVI';
      cLabel2 = st?.chartData?.label2 || 'Área Cuartel (ha)';
      cColor1 = '#22c55e';
      cColor2 = '#f59e0b';
      chartType = 'bar';
    } else if (this.activeAdminTab === 'map') {
      const st = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_map');
      cLabels = st?.chartData?.labels || ['Fundo Meniels', 'Forestal Pinos', 'Viña Santa Elena', 'Don Pedro', 'Los Boldos'];
      cDataset1 = st?.chartData?.dataset1 || [100, 100, 85, 70, 100];
      cDataset2 = st?.chartData?.dataset2 || [12.8, 140.0, 35.2, 18.0, 62.0];
      cLabel1 = st?.chartData?.label1 || 'Conformidad Legal %';
      cLabel2 = st?.chartData?.label2 || 'Superficie (ha)';
      cColor1 = '#38bdf8';
      cColor2 = '#f59e0b';
      chartType = 'bar';
    } else if (this.activeAdminTab === 'vault') {
      const st = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_d');
      cLabels = st?.chartData?.labels || ['2020', '2021', '2022', '2023', '2024', '2025'];
      cDataset1 = st?.chartData?.dataset1 || [1.8, 2.4, 3.1, 3.9, 4.8, 5.6];
      cDataset2 = st?.chartData?.dataset2 || [0.65, 0.70, 0.76, 0.82, 0.88, 0.92];
      cLabel1 = st?.chartData?.label1 || 'Carbono Secuestrado (tCO2e/ha)';
      cLabel2 = st?.chartData?.label2 || 'Índice Integridad IEI';
      cColor1 = '#10b981';
      cColor2 = '#c084fc';
    } else if (this.activeAdminTab === 'territorial') {
      const st = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_e');
      cLabels = st?.chartData?.labels || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      cDataset1 = st?.chartData?.dataset1 || [18, 24, 38, 45, 52, 42, 28];
      cDataset2 = st?.chartData?.dataset2 || [72, 70, 68, 65, 63, 62, 64];
      cLabel1 = st?.chartData?.label1 || 'Índice FWI Piro-Riesgo';
      cLabel2 = st?.chartData?.label2 || 'Nivel Freático Acuífero (%)';
      cColor1 = '#ef4444';
      cColor2 = '#0284c7';
    } else if (this.activeAdminTab === 'scripts') {
      const st = WORKSHOP_STATIONS_DATA.find(s => s.id === 'station_f');
      cLabels = st?.chartData?.labels || ['Draw Calls', 'Triángulos (k)', 'Texturas (MB)', 'Shader Passes', 'FPS'];
      cDataset1 = st?.chartData?.dataset1 || [4, 48, 32, 6, 60];
      cDataset2 = st?.chartData?.dataset2 || [12, 120, 96, 10, 30];
      cLabel1 = st?.chartData?.label1 || 'Métricas Actuales';
      cLabel2 = st?.chartData?.label2 || 'Umbral Máximo Seguro';
      cColor1 = '#fbbf24';
      cColor2 = '#a855f7';
      chartType = 'bar';
    } else {
      return;
    }

    const grad1 = ctx.createLinearGradient(0, 0, 0, 160);
    grad1.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    grad1.addColorStop(1, 'rgba(56, 189, 248, 0.02)');

    const grad2 = ctx.createLinearGradient(0, 0, 0, 160);
    grad2.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    grad2.addColorStop(1, 'rgba(251, 191, 36, 0.02)');

    this.currentChartInstance = new window.Chart(ctx, {
      type: chartType,
      data: {
        labels: cLabels,
        datasets: [
          {
            label: cLabel1,
            data: cDataset1,
            borderColor: cColor1,
            backgroundColor: chartType === 'bar' ? 'rgba(56, 189, 248, 0.5)' : grad1,
            borderWidth: 2,
            tension: 0.35,
            fill: chartType !== 'bar',
            pointBackgroundColor: cColor1,
            pointRadius: 3
          },
          {
            label: cLabel2,
            data: cDataset2,
            borderColor: cColor2,
            backgroundColor: chartType === 'bar' ? 'rgba(251, 191, 36, 0.5)' : grad2,
            borderWidth: 2,
            tension: 0.35,
            fill: chartType !== 'bar',
            pointBackgroundColor: cColor2,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#d6c4a8',
              font: { family: 'Georgia, serif', size: 10 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(22, 14, 10, 0.95)',
            titleColor: '#fbbf24',
            bodyColor: '#e6ccb2',
            borderColor: '#b45309',
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(120, 53, 15, 0.2)' },
            ticks: { color: '#94a3b8', font: { size: 9, family: 'monospace' } }
          },
          y: {
            grid: { color: 'rgba(120, 53, 15, 0.2)' },
            ticks: { color: '#94a3b8', font: { size: 9, family: 'monospace' } }
          }
        }
      }
    });
  }

  initChart(station) {
    const canvas = document.getElementById('stationDynamicChart');
    if (!canvas || !window.Chart) return;

    if (this.currentChartInstance) {
      this.currentChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');

    let cLabels, cDataset1, cDataset2, cLabel1, cLabel2, cColor1, cColor2;

    if (station.id === 'station_b') {
      const activeKey = this.selectedMauleSensorTab || 'frost';
      const cfg = MAULE_SENSORS_CONFIG[activeKey] || MAULE_SENSORS_CONFIG.frost;
      cLabels = cfg.chartLabels;
      cDataset1 = cfg.dataset1;
      cDataset2 = cfg.dataset2;
      cLabel1 = cfg.label1;
      cLabel2 = cfg.label2;
      cColor1 = cfg.color || '#38bdf8';
      cColor2 = '#fbbf24';
    } else {
      const cData = station.chartData;
      cLabels = cData.labels;
      cDataset1 = cData.dataset1;
      cDataset2 = cData.dataset2;
      cLabel1 = cData.label1;
      cLabel2 = cData.label2;
      cColor1 = '#fbbf24';
      cColor2 = '#34d399';
    }

    const grad1 = ctx.createLinearGradient(0, 0, 0, 160);
    grad1.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    grad1.addColorStop(1, 'rgba(56, 189, 248, 0.02)');

    const grad2 = ctx.createLinearGradient(0, 0, 0, 160);
    grad2.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    grad2.addColorStop(1, 'rgba(251, 191, 36, 0.02)');

    this.currentChartInstance = new window.Chart(ctx, {
      type: station.id === 'station_f' ? 'bar' : 'line',
      data: {
        labels: cLabels,
        datasets: [
          {
            label: cLabel1,
            data: cDataset1,
            borderColor: cColor1,
            backgroundColor: grad1,
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointBackgroundColor: cColor1,
            pointRadius: 3
          },
          {
            label: cLabel2,
            data: cDataset2,
            borderColor: cColor2,
            backgroundColor: grad2,
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointBackgroundColor: cColor2,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#d6c4a8',
              font: { family: 'Georgia, serif', size: 10 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(22, 14, 10, 0.95)',
            titleColor: '#fbbf24',
            bodyColor: '#e6ccb2',
            borderColor: '#b45309',
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(120, 53, 15, 0.2)' },
            ticks: { color: '#94a3b8', font: { size: 9, family: 'monospace' } }
          },
          y: {
            grid: { color: 'rgba(120, 53, 15, 0.2)' },
            ticks: { color: '#94a3b8', font: { size: 9, family: 'monospace' } }
          }
        }
      }
    });
  }

  open(playSound = true) {
    if (this.overlayEl) {
      this.overlayEl.style.display = 'flex';
      this.overlayEl.classList.add('active');
      this.showCampaignBoard = true;
      this.render();
      if (playSound) this.audio?.playBellGong();
    }
  }

  close() {
    if (this.overlayEl) {
      this.audio?.playWoodClick();
      this.overlayEl.classList.remove('active');
      this.overlayEl.style.display = 'none';
      this.closeStationModal();
      if (this.app?.mapManager?.onWindowResize) {
        setTimeout(() => this.app.mapManager.onWindowResize(), 50);
      }
    }
  }

  openWindDossierModal() {
    const existing = document.getElementById('windDossierModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'windDossierModal';
    modal.className = 'modal-overlay glass-modal-backdrop';
    modal.style.cssText = 'display: flex; z-index: 100; position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(12px); align-items: center; justify-content: center; padding: 20px;';

    modal.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.98); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 14px; max-width: 760px; width: 100%; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Header -->
        <div style="padding: 16px 20px; background: rgba(245, 158, 11, 0.1); border-bottom: 1px solid rgba(245, 158, 11, 0.3); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 22px;">🌪️</span>
            <div>
              <div style="font-weight: 800; font-size: 14px; color: #fbbf24;">Fundamento Científico: Dinámica de Vientos en Cuenca</div>
              <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">MICROESCALA OROGRÁFICA 3D vs. MALLAS REGIONALES 2D (WINDY)</div>
            </div>
          </div>
          <button id="btnCloseWindDossier" style="background: transparent; border: none; font-size: 24px; color: #94a3b8; cursor: pointer;">&times;</button>
        </div>

        <!-- Body -->
        <div style="padding: 20px; overflow-y: auto; color: #cbd5e1; font-size: 11px; line-height: 1.55; display: flex; flex-direction: column; gap: 14px;">
          <!-- 1. Por qué no es uniforme como Windy -->
          <div style="background: rgba(0,0,0,0.3); padding: 12px 14px; border-radius: 8px; border-left: 3px solid #38bdf8;">
            <strong style="color: #38bdf8; font-size: 12px;">¿Por qué Windy cubre todo el mapa y en un visor de cuenca no debe ser así?</strong>
            <p style="margin: 6px 0 0 0; color: #94a3b8;">
              Modelos globales (ECMWF, GFS) operan a resoluciones de 9 a 22 km por celda. A esa escala, una montaña o una quebrada de 200m se promedia como una planicie; el motor de Windy dibuja una textura homogénea en pantalla plana (2D). Si proyectáramos ese campo sin considerar el DEM, las flechas atravesarían cerros de forma físicamente imposible. En AgriTwin, cada partícula sigue la cota del relieve <em>(Y = DEM(x, z) + h)</em> y sortea la orografía.
            </p>
          </div>

          <!-- 2. Matriz de las 4 Corrientes -->
          <div>
            <div style="font-weight: 700; color: #fbbf24; font-size: 12px; margin-bottom: 8px;">Las 4 Corrientes de Aire Físicas en la Cuenca del Maule:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 10px; border-radius: 8px;">
                <div style="font-weight: 700; color: #f87171;">🔴 1. Viento Puelche / Raco (ENE $\\to$ WSW)</div>
                <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">
                  Viento catabático de descenso andino (efecto foehn). Caliente y seco (~42 km/h, ráfagas >60 km/h). Activa la regla 30-30-30 y el índice FWI de incendios forestales.
                </div>
              </div>
              <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); padding: 10px; border-radius: 8px;">
                <div style="font-weight: 700; color: #38bdf8;">🔵 2. Brisa Marina Diurna (SW $\\to$ NE)</div>
                <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">
                  Flujo fresco del Pacífico impulsado por gradiente térmico vespertino. Asciende por laderas soleadas (~18 km/h), amortiguando el estrés térmico en frutales.
                </div>
              </div>
              <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); padding: 10px; border-radius: 8px;">
                <div style="font-weight: 700; color: #c084fc;">🟣 3. Drenaje Catabático Nocturno (Heladas)</div>
                <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">
                  Enfriamiento radiativo de laderas altas. El aire frío y denso desciende a baja velocidad (~9 km/h) a ras de suelo (0.8m) acumulándose en fondos de cuenca.
                </div>
              </div>
              <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 10px; border-radius: 8px;">
                <div style="font-weight: 700; color: #34d399;">🟢 4. Chorro Quebrada (Efecto Venturi)</div>
                <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">
                  Encajonamiento orográfico a lo largo del talweg del estero Colliguay. Flujo acelerado por conservación de masa, define el corredor biológico ripario.
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Formulación Matemática -->
          <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; font-family: monospace; font-size: 10px; color: #e2e8f0;">
            <div style="color: #fbbf24; font-weight: bold; margin-bottom: 4px;">Fórmula de Advección 3D Acoplada al DEM:</div>
            <div>P_{t+Δt}.x = P_t.x + (u_base + Δu_turb) * Δt</div>
            <div>P_{t+Δt}.z = P_t.z + (w_base + Δw_turb) * Δt</div>
            <div>P_{t+Δt}.y = DEM(P_x, P_z) + h_offset + A * sin(ω_y * t)</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 12px 20px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: flex-end; gap: 8px;">
          <button id="btnDismissWindDossier" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 11px;">Cerrar</button>
          <button id="btnApplyWindsFromDossier" style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #000; font-weight: bold; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 11px;">🌪️ Visualizar en Terreno 3D</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    document.getElementById('btnCloseWindDossier')?.addEventListener('click', closeModal);
    document.getElementById('btnDismissWindDossier')?.addEventListener('click', closeModal);
    document.getElementById('btnApplyWindsFromDossier')?.addEventListener('click', () => {
      closeModal();
      this.close();
      bus.emit('geomorph:toggle_wind_streamlines', true);
      bus.emit('ui:show_toast', '🌪️ Visualizando corrientes orográficas en el Gemelo 3D.');
    });
  }

  initMermaidInVault() {
    const target = document.getElementById('vaultMermaidTarget');
    if (!target) return;

    if (!this.selectedVaultDiagram) {
      this.selectedVaultDiagram = 'arch';
    }

    const diagrams = {
      arch: `graph TD
    classDef iot fill:#064E3B,stroke:#10B981,stroke-width:2px,color:#ECFDF5;
    classDef srv fill:#1E1B4B,stroke:#818CF8,stroke-width:2px,color:#E0E7FF;
    classDef client fill:#0B253A,stroke:#38BDF8,stroke-width:2px,color:#F0F9FF;
    classDef render fill:#431407,stroke:#FB923C,stroke-width:2px,color:#FFF7ED;

    subgraph TERRENO["🌱 1. Hardware IoT de Terreno (C / C++)"]
        ESP["ESP32 DevKit v1 / S3<br/>firmware/esp32_field_enclosure.ino"]:::iot
        FDR["Sondas FDR Suelo<br/>Humedad Multinivel (20-100cm)"]:::iot
        CLIM["BME280 / SHT45<br/>T° / RH / Presión"]:::iot
        RELE["Relés Optoacoplados<br/>Bombas Pozo, Riego, Heladas"]:::iot
        TFT["Display Local SPI<br/>TFT_eSPI ILI9341 3.5''"]:::iot

        FDR -->|Lectura Analógica| ESP
        CLIM -->|Bus I2C| ESP
        ESP -->|Control GPIO| RELE
        ESP -->|UI SPI 320x240| TFT
    end

    subgraph BACK["⚡ 2. Backend & Sincronización (Node.js)"]
        SRV["Servidor HTTP Nativo<br/>server.cjs (:7773)"]:::srv
        API_TEL["API Telemetría & Status<br/>/api/enclosure/*"]:::srv
        SYNC_CUENCA["Acople Cuenca Longaví<br/>/api/basin-sync (:7774)"]:::srv

        SRV --- API_TEL
        SRV --- SYNC_CUENCA
    end

    subgraph CLIENTE["🖥️ 3. Cliente & Gemelo Digital 3D (JS / WebGL)"]
        BROWSER["Navegador Web / Electron<br/>WebGL 2.0 @ 60 FPS"]:::client
        THREE["Three.js r128 + R3F<br/>PBR Shaders & Sombras 4K"]:::render
        CESIUM["CesiumJS<br/>Ortofoto Esri & DEM"]:::render
        SHADERS["Shaders GLSL Custom<br/>Normales Sobel & Suelo"]:::render
        SIM["Simulación Biofísica<br/>FAO-56 & Riesgo Heladas"]:::client
        UI["UI Glassmorphism<br/>EventBus Pub/Sub & Chart.js"]:::client

        BROWSER --> THREE
        BROWSER --> CESIUM
        THREE --> SHADERS
        BROWSER --> SIM
        BROWSER --> UI
    end

    ESP ==>|WiFi REST (JSON)| API_TEL
    API_TEL --> SRV
    SRV ==>|HTTP Local / EventBus| BROWSER`,

      events: `sequenceDiagram
    autonumber
    actor Operador as 🧑‍🌾 Operador Agrícola
    participant UI as 🎛️ UIController
    participant Bus as 📡 EventBus (Pub/Sub)
    participant Map as 🌐 MapManager (Three.js)
    participant Sim as 🧬 SimulationEngine
    participant HW as ⚡ ESP32 / server.cjs

    Operador->>UI: Clic en Sensor IOT-SN-02
    UI->>Bus: emit('ENTITY_SELECTED', id)
    Bus->>Map: Cámara cinemática (flyTo) + Pulso Verde
    Bus->>UI: Despliega Drawer Lateral & Series Chart.js

    loop Cada 15s (Telemetría en Vivo)
        HW->>Sim: Payload { moisture: 24.5%, temp: 18.2°C }
        Sim->>Sim: Balance Hídrico FAO-56 & Riesgo Helada
        Sim->>Bus: emit('TELEMETRY_UPDATED')
        Bus->>Map: Actualiza shaders GLSL de humedad de suelo
        Bus->>UI: Refresca Sparklines y Badges de Alerta
    end`,

      tech: `graph TD
    classDef root fill:#0B2519,stroke:#10B981,stroke-width:3px,color:#FFF;
    classDef branch fill:#071810,stroke:#F59E0B,stroke-width:2px,color:#FFF;
    classDef leaf fill:#1E293B,stroke:#64748B,stroke-width:1px,color:#FFF;

    ROOT["AgriTwin 3D Suite<br/>(Predio Meniel 3D)"]:::root

    ROOT --> M3D["Motores 3D & Shaders"]:::branch
    ROOT --> DAT["Datos & Geoespacial"]:::branch
    ROOT --> GUI["Interfaz & UX"]:::branch
    ROOT --> IOT["Hardware IoT Terreno"]:::branch
    ROOT --> SIS["Sistemas & Servidor"]:::branch

    M3D --> T1["Three.js r128 (WebGL 2.0)"]:::leaf
    M3D --> T2["CesiumJS (Ortofoto Abierta Esri)"]:::leaf
    M3D --> T3["React Three Fiber (R3F)"]:::leaf
    M3D --> T4["Shaders GLSL (Texturas Sobel PBR)"]:::leaf

    DAT --> D1["Modelos 3D GLTF / GLB 2.0"]:::leaf
    DAT --> D2["Polígonos GeoJSON WGS84"]:::leaf
    DAT --> D3["Shapefiles (.shp) via shpjs"]:::leaf
    DAT --> D4["Ecosistema Maestro JSON"]:::leaf

    GUI --> G1["Glassmorphism (Backdrop CSS)"]:::leaf
    GUI --> G2["Chart.js & Canvas 2D"]:::leaf
    GUI --> G3["Tipografías Inter & Outfit"]:::leaf
    GUI --> G4["EventBus Desacoplado Pub/Sub"]:::leaf

    IOT --> I1["ESP32 DevKit v1 / S3"]:::leaf
    IOT --> I2["C / C++ (Arduino Framework)"]:::leaf
    IOT --> I3["Display TFT SPI ILI9341"]:::leaf
    IOT --> I4["Sondas FDR & Relés Industriales"]:::leaf

    SIS --> S1["Node.js Nativo (server.cjs :7773)"]:::leaf
    SIS --> S2["Acople Regional Cuenca (:7774)"]:::leaf
    SIS --> S3["Electron Desktop App"]:::leaf
    SIS --> S4["Binarios Swift & Scripts Bash"]:::leaf`
    };

    const code = diagrams[this.selectedVaultDiagram] || diagrams.arch;

    if (window.mermaid) {
      const id = 'mermaid-render-' + Date.now();
      try {
        window.mermaid.render(id, code).then(({ svg }) => {
          target.innerHTML = svg;
          const svgEl = target.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
          }
        }).catch(err => {
          console.warn('[Mermaid render error]', err);
          target.innerHTML = `<pre style="color: #cbd5e1; font-size: 10px; font-family: monospace; text-align: left; background: #0f0704; padding: 10px; border-radius: 6px;">${code}</pre>`;
        });
      } catch (e) {
        target.innerHTML = `<pre style="color: #cbd5e1; font-size: 10px; font-family: monospace; text-align: left; background: #0f0704; padding: 10px; border-radius: 6px;">${code}</pre>`;
      }
    } else {
      target.innerHTML = `<pre style="color: #cbd5e1; font-size: 10px; font-family: monospace; text-align: left; background: #0f0704; padding: 10px; border-radius: 6px;">${code}</pre>`;
    }

    // Listeners para botones de pestañas del diagrama Mermaid
    document.querySelectorAll('.btn-mermaid-tab').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        document.querySelectorAll('.btn-mermaid-tab').forEach(b => {
          b.classList.remove('active');
          b.style.background = '#27150c';
          b.style.borderColor = '#78350f';
          b.style.color = '#cbd5e1';
        });
        btn.classList.add('active');
        btn.style.background = 'rgba(245,158,11,0.2)';
        btn.style.borderColor = '#f59e0b';
        btn.style.color = '#fde68a';
        this.selectedVaultDiagram = btn.dataset.diagram;
        this.initMermaidInVault();
      };
    });
  }

  toggle() {
    if (this.overlayEl && this.overlayEl.classList.contains('active')) {
      this.close();
    } else {
      this.open();
    }
  }
}
