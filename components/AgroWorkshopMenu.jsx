import React, { useState, useEffect } from 'react';
import { 
  Compass, Droplets, Flame, ShieldAlert, Cpu, Wrench, FileText, 
  Layers, Activity, ChevronRight, X, ExternalLink, RefreshCw, 
  FolderTree, Terminal, Sparkles, BookOpen, Radio, Settings, 
  CheckCircle2, Gauge, BarChart3, Database, Eye
} from 'lucide-react';

/**
 * AgroWorkshopMenu - Menú Diegético "Taller Agrícola" inspirado en Age of Empires II
 * 
 * Estaciones Maestras Auditadas:
 *  - Objeto C (Monitor Industrial / Mesa de Planos): Visor Predial 3D / AgroTwin (Three.js WebGL)
 *  - Objeto A (Portapapeles / Libreta de Campo): Manual & Documentación Biofísica (FAO-56 Penman-Monteith)
 *  - Objeto B (Tablero con Herramientas & Sensores IoT): Configurador IoT & Terreno (ESP32 & LoRaWAN)
 *  - Objeto D (Libro Enmarcado ESG): Histórico ESG / MRV Ledger (Carbono tCO2e & EUDR)
 *  - Objeto E (Radio Vintage / Pizarra Comunal): Red Territorial & APRs (B2G, Piro-riesgo & Acuíferos)
 *  - Objeto F (Caja Metálica de Engranajes): Ajustes del Sistema & Webhooks WhatsApp
 */

// 6 Estaciones Maestras con coordenadas porcentuales diegéticas sobre workshop_bg.png
export const WORKSHOP_STATIONS = [
  {
    id: 'station_a',
    code: 'OBJ-A',
    title: 'Manual & Documentación Biofísica',
    shortTitle: 'Libreta Biofísica',
    category: 'Modelos Biofísicos',
    badge: 'FAO-56 / Penman',
    spriteSrc: '/assets/ui/sprite_a_clipboard.png',
    position: { top: '22%', left: '6.5%', width: '9.5%' },
    hangAngle: '-2.5deg',
    description: 'Documentación técnica de algoritmos biofísicos: evapotranspiración real Penman-Monteith, balance hídrico en 3 estratos de suelo y modelo DEM de drenaje katabático de heladas.',
    tools: [
      'FAO-56 Penman-Monteith (ETo × Kc)',
      'Balance Radicular en 3 Estratos (0-20cm, 20-60cm, 60-100cm)',
      'Modelo DEM de Aire Frío Katabático',
      'Catálogo Taxonómico Botánico (8 Frutales & Nativos)'
    ]
  },
  {
    id: 'station_b',
    code: 'OBJ-B',
    title: 'Configurador IoT & Terreno',
    shortTitle: 'Tablero IoT',
    category: 'Hardware & Polígonos',
    badge: 'ESP32 / LoRaWAN',
    spriteSrc: '/assets/ui/sprite_b_iot_board.png',
    position: { top: '23%', left: '19.5%', width: '10.5%' },
    hangAngle: '1.8deg',
    description: 'Tablero de taller para gestión de sondas de humedad FDR capacitivas, enlaces LoRaWAN / 4G, delimitación de cuarteles con Pincel 3D e importación ESRI Shapefile.',
    tools: [
      'Gestor de Sondas IoT ESP32 / LoRaWAN',
      'Pincel 3D Poligonal & Medición de Áreas',
      'Tarjetas Flotantes HTML en Espacio 3D',
      'Importador/Exportador .agritwin y Shapefiles'
    ]
  },
  {
    id: 'station_c',
    code: 'OBJ-C',
    title: 'Visor Predial 3D / AgroTwin',
    shortTitle: 'Mesa de Planos 3D',
    category: 'Motor Gráfico WebGL',
    badge: 'Three.js / PBR',
    spriteSrc: '/assets/ui/sprite_c_monitor.png',
    position: { top: '56%', left: '50.5%', width: '13%' },
    hangAngle: '-1.2deg',
    description: 'Centro de mando táctico del gemelo digital: relieve topográfico DEM exagerable, textura de suelo PBR con surcos normales, iluminación solar diurna y parcelas extruidas estilo Civ VI.',
    tools: [
      'Motor 3D Three.js r128 (PBR Shaders)',
      'Capas de Suelo, NDVI & Esri World Imagery',
      'Vegetación Instanciada (Single-Draw-Call)',
      'Simulador Solar Diurno & Hora Dorada'
    ]
  },
  {
    id: 'station_d',
    code: 'OBJ-D',
    title: 'Histórico ESG / MRV Ledger',
    shortTitle: 'Libro de Registros ESG',
    category: 'Certificación & Carbono',
    badge: 'Cero Deforestación',
    spriteSrc: '/assets/ui/sprite_d_esg_book.png',
    position: { top: '69%', left: '33%', width: '10.5%' },
    hangAngle: '3.0deg',
    description: 'Libro maestro de auditoría ambiental: pasaporte digital de trazabilidad, secuestro de carbono tCO2e/ha certificado con hash criptográfico MRV y cumplimiento EUDR 100% Cero Deforestación.',
    tools: [
      'Balance de Carbono (4.8 tCO2e/ha secuestradas)',
      'EUDR Cero Deforestación (Línea base Sentinel-2 2020)',
      'Índice de Integridad Ecológica (IEI: 0.88)',
      'Hash Criptográfico MRV: 0x8f2d4a19c6e'
    ]
  },
  {
    id: 'station_e',
    code: 'OBJ-E',
    title: 'Red Territorial & APRs',
    shortTitle: 'Radio & Pizarra Comunal',
    category: 'Comunidad B2G',
    badge: 'Acuíferos & FWI',
    spriteSrc: '/assets/ui/sprite_e_radio.png',
    position: { top: '44%', left: '36%', width: '11%' },
    hangAngle: '-2.0deg',
    description: 'Estación de enlace territorial: semáforo de recarga de acuíferos para Comités de Agua Potable Rural (APR), índice de riesgo de incendios FWI y cálculo de camiones aljibe evitados.',
    tools: [
      'Semáforo de Acuíferos & Pozos Comunitarios',
      'Índice de Incendios Forestales FWI & Combustible',
      'Planificación de Cortafuegos Preventivos (14.2 km)',
      'Monitoreo Social B2G: 1,420 Familias Abastecidas'
    ]
  },
  {
    id: 'station_f',
    code: 'OBJ-F',
    title: 'Ajustes del Sistema & Telemetría',
    shortTitle: 'Caja de Herramientas',
    category: 'Configuración & APIs',
    badge: 'Webhooks / n8n',
    spriteSrc: '/assets/ui/sprite_f_toolbox.png',
    position: { top: '68%', left: '10%', width: '12%' },
    hangAngle: '2.2deg',
    description: 'Caja de herramientas técnicas: inspección de shaders GLSL en vivo, calibración de post-procesamiento UnrealBloom, configuración de webhooks n8n y despacho de alertas autónomas a WhatsApp Business.',
    tools: [
      'Inspector Técnico 3D (FPS, Shaders, Memoria)',
      'Webhooks n8n & WhatsApp Cloud API',
      'Velocidad de Simulación Temporal (1x, 2x, 5x)',
      'Parámetros Globales & Protocolos de Calibración'
    ]
  }
];

// Árbol de archivos auditado del repositorio AgroTwin
export const AUDITED_FILE_TREE = {
  name: 'agritwin',
  type: 'root',
  children: [
    {
      name: 'js',
      type: 'folder',
      description: 'Lógica central del gemelo digital y orquestadores',
      children: [
        { name: 'app.js', type: 'file', note: 'Orquestador principal y arranque de módulos' },
        { 
          name: 'ui', 
          type: 'folder',
          children: [
            { name: 'UIController.js', type: 'file', note: 'Controlador de paneles, drawers y vistas (110KB)' },
            { name: 'EngineInspectorModal.js', type: 'file', note: 'Inspector de shaders GLSL y rendimiento 3D' },
            { name: 'PossibilitiesCatalog.js', type: 'file', note: 'Catálogo de taxonomía botánica e infraestructura' },
            { name: 'ChartManager.js', type: 'file', note: 'Renderizador de sparklines en Canvas 2D' }
          ]
        },
        {
          name: 'map',
          type: 'folder',
          children: [
            { name: 'MapManager.js', type: 'file', note: 'Instancia Three.js, órbita, cámara y presets' },
            { name: 'BiophysicalTerrainShader.js', type: 'file', note: 'Shader GLSL de humedad en 3 estratos' },
            { name: 'DrawingManager.js', type: 'file', note: 'Pincel 3D poligonal y cálculo de superficie' },
            { name: 'IoTHtmlOverlayManager.js', type: 'file', note: 'Tarjetas flotantes HTML en espacio 3D' },
            { name: 'PBRSoilGenerator.js', type: 'file', note: 'NormalMaps de surcos y textura de suelo' },
            { name: 'SpatialWidgets.js', type: 'file', note: 'Brújula 3D, trayectoria solar y escala gráfica' }
          ]
        },
        {
          name: 'sim',
          type: 'folder',
          children: [
            { name: 'SimulationEngine.js', type: 'file', note: 'Motor de simulación biofísica diurna e IoT' },
            { name: 'WildfireRiskModel.js', type: 'file', note: 'Cálculo de índice FWI y combustible ton/ha' }
          ]
        },
        {
          name: 'entities',
          type: 'folder',
          children: [
            { name: 'ParcelManager.js', type: 'file', note: 'Polígonos 3D extruidos estilo Civ VI' },
            { name: 'SensorManager.js', type: 'file', note: 'Pines 3D de sensores con anillos de pulso' },
            { name: 'CropManager.js', type: 'file', note: 'Doseles arbóreos e instancias de cultivos' },
            { name: 'InstancedVegetationManager.js', type: 'file', note: 'Vegetación masiva en un solo draw-call' }
          ]
        },
        {
          name: 'data',
          type: 'folder',
          children: [
            { name: 'DataSource.js', type: 'file', note: 'Carga y normalización de GeoJSON / JSON' },
            { name: 'ProjectManager.js', type: 'file', note: 'Importación Shapefile y proyectos .agritwin' },
            { name: 'BundledData.js', type: 'file', note: 'Datos precargados de respaldo del predio' }
          ]
        },
        {
          name: 'r3f',
          type: 'folder',
          description: 'Componentes React Three Fiber',
          children: [
            { name: 'AgroTwinCanvas.jsx', type: 'file', note: 'Master Canvas R3F' },
            { name: 'AtmosphereAndSun.jsx', type: 'file', note: 'Atmósfera e iluminación solar PBR' },
            { name: 'TerrainPBR.jsx', type: 'file', note: 'Malla de terreno PBR y sombreadores' },
            { name: 'VegetationInstances.jsx', type: 'file', note: 'Instancias de árboles y frutales' },
            { name: 'InteractiveParcels.jsx', type: 'file', note: 'Parcelas interactivas con elevación al hover' },
            { name: 'IoTSensorNodes.jsx', type: 'file', note: 'Nodos IoT con tarjetas HTML Drei' },
            { name: 'PostProcessingPipeline.jsx', type: 'file', note: 'Oclusión ambiental N8AO y Bloom' }
          ]
        }
      ]
    },
    {
      name: 'desktop',
      type: 'folder',
      description: 'Capa Desktop & Visor Dinámico',
      children: [
        { name: 'AgroTwinDynamicViewer.tsx', type: 'file', note: 'Contenedor React multi-perfil (Enterprise, Territorial, ESG)' },
        { name: 'main.js', type: 'file', note: 'Arranque de Electron para escritorio' }
      ]
    },
    {
      name: 'data',
      type: 'folder',
      children: [
        { name: 'farm_parcels.geojson', type: 'file', note: 'Geometrías de cuarteles (Manzanos, Cerezos, Viñedos)' },
        { name: 'farm_entities.json', type: 'file', note: 'Registro de sensores y coordenadas de árboles' }
      ]
    },
    {
      name: 'css',
      type: 'folder',
      children: [
        { name: 'main.css', type: 'file', note: 'Tokens Obsidian Dark y tipografía Outfit/Inter' },
        { name: 'glassmorphism.css', type: 'file', note: 'Efectos de desenfoque de fondo y tarjetas de vidrio' },
        { name: 'components.css', type: 'file', note: 'Estilos de botones, badges y controles' },
        { name: 'drawing-tools.css', type: 'file', note: 'Controles flotantes del pincel 3D' }
      ]
    },
    {
      name: 'assets',
      type: 'folder',
      children: [
        { name: 'ui', type: 'folder', children: [
          { name: 'workshop_bg.png', type: 'file', note: 'Fondo diegético 2D galpón agrícola AoE II' },
          { name: 'workshop_sprites.png', type: 'file', note: 'Grilla de 6 objetos aislados' },
          { name: 'sprite_a_clipboard.png', type: 'file', note: 'Sprite Objeto A recortado' },
          { name: 'sprite_b_iot_board.png', type: 'file', note: 'Sprite Objeto B recortado' },
          { name: 'sprite_c_monitor.png', type: 'file', note: 'Sprite Objeto C recortado' },
          { name: 'sprite_d_esg_book.png', type: 'file', note: 'Sprite Objeto D recortado' },
          { name: 'sprite_e_radio.png', type: 'file', note: 'Sprite Objeto E recortado' },
          { name: 'sprite_f_toolbox.png', type: 'file', note: 'Sprite Objeto F recortado' }
        ]}
      ]
    }
  ]
};

export const AgroWorkshopMenu = ({
  onSelectStation,
  onLaunchTwin,
  initialStation = null
}) => {
  const [hoveredStation, setHoveredStation] = useState(null);
  const [activeModalStation, setActiveModalStation] = useState(initialStation);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState('tree'); // 'tree' | 'engines' | 'stations'
  const [expandedFolders, setExpandedFolders] = useState({ 'agritwin': true, 'js': true, 'ui': true, 'map': true, 'sim': true, 'r3f': true });

  // Cerrar modal con escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModalStation(null);
        setShowAdminPanel(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStationClick = (station) => {
    if (station.id === 'station_c') {
      // Objeto C: Visor Predial 3D directo
      if (onLaunchTwin) {
        onLaunchTwin();
        return;
      }
    }

    // Salto inmediato a las categorías del Panel Administrador / Documentación
    if (station.id === 'station_a') {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'agritwin:navigate_admin', tab: 'predios' }, '*');
      } else {
        window.location.href = 'http://localhost:7771/?view=docs&tab=predios';
      }
      return;
    }
    if (station.id === 'station_b') {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'agritwin:navigate_admin', tab: 'sensors' }, '*');
      } else {
        window.location.href = 'http://localhost:7771/?view=docs&tab=sensors';
      }
      return;
    }
    if (station.id === 'station_d') {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'agritwin:navigate_admin', tab: 'vault' }, '*');
      } else {
        window.location.href = 'http://localhost:7771/?view=docs&tab=vault';
      }
      return;
    }
    if (station.id === 'station_f') {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'agritwin:navigate_admin', tab: 'scripts' }, '*');
      } else {
        window.location.href = 'http://localhost:7771/?view=docs&tab=scripts';
      }
      return;
    }

    setActiveModalStation(station);
    if (onSelectStation) {
      onSelectStation(station);
    }
  };

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Renderizador recursivo del árbol de archivos
  const renderTreeItem = (item, path = '') => {
    const currentPath = `${path}/${item.name}`;
    const isFolder = item.type === 'folder' || item.type === 'root';
    const isExpanded = expandedFolders[item.name];

    return (
      <div key={currentPath} className="text-xs font-mono select-none">
        <div 
          onClick={() => isFolder && toggleFolder(item.name)}
          className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-colors ${
            isFolder ? 'hover:bg-amber-500/10 text-amber-200' : 'hover:bg-emerald-500/10 text-slate-300'
          }`}
        >
          {isFolder ? (
            <span className="text-amber-400 text-[10px] w-3.5">
              {isExpanded ? '▼' : '▶'}
            </span>
          ) : (
            <span className="text-slate-500 text-[10px] w-3.5">─</span>
          )}
          <span className="font-semibold">{item.name}</span>
          {item.note && (
            <span className="text-[10px] text-slate-500 truncate ml-2">
              — {item.note}
            </span>
          )}
        </div>

        {isFolder && isExpanded && item.children && (
          <div className="pl-4 border-l border-amber-900/30 ml-2.5 my-0.5 space-y-0.5">
            {item.children.map(child => renderTreeItem(child, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0705] font-sans select-none">
      
      {/* ─── 1. BARRA SUPERIOR FIJA: PANEL DE ADMINISTRADOR & DOCUMENTACIÓN ─── */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3 bg-[#130d09]/90 backdrop-blur-md border-b-2 border-[#5c3e21] shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#27180e] border border-[#d97706]/60 p-1.5 shadow-inner flex items-center justify-center">
              <span className="text-2xl">🏰</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wide text-[#fbbf24] uppercase font-serif drop-shadow">
                  Taller Agrícola AgroTwin
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3b2314] text-[#fde68a] border border-[#b45309] font-bold">
                  AoE II Edition
                </span>
              </div>
              <p className="text-[11px] text-[#d6c4a8] font-serif italic">
                Pabellón Central de Operaciones, Modelos Biofísicos & Gemelo Digital 3D
              </p>
            </div>
          </div>
        </div>

        {/* ─── DOCK DE MOTORES CENTRALES (SOLICITADO POR EL USUARIO) ─── */}
        <div className="hidden lg:flex items-center gap-3 bg-[#20150e]/95 px-4 py-1.5 rounded-xl border border-[#78350f]/80 shadow-inner">
          <div className="flex items-center gap-2 pr-3 border-r border-[#78350f]/60">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#93c5fd] font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>Motor Gráfico 3D</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-300 font-semibold">
                Three.js PBR • 60 FPS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#fde68a] font-bold flex items-center gap-1">
                <Activity className="w-3 h-3 text-amber-400" />
                <span>Motor Biofísico</span>
              </div>
              <div className="text-[11px] font-mono text-amber-300 font-semibold">
                FAO-56 Penman • 3 Capas
              </div>
            </div>
          </div>
        </div>

        {/* Acciones de Cabecera: Admin Panel & Salto Directo al Gemelo 3D */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-serif font-bold transition-all shadow-md ${
              showAdminPanel 
                ? 'bg-[#b45309] text-amber-100 border-[#fef3c7]' 
                : 'bg-[#2b180d] hover:bg-[#3f2413] text-[#fde68a] border-[#b45309]'
            }`}
            title="Abrir Panel de Administrador, Documentación y Árbol de Archivos"
          >
            <FolderTree className="w-4 h-4 text-[#fbbf24]" />
            <span>Panel Administrador & Árbol</span>
          </button>

          {onLaunchTwin && (
            <button
              onClick={onLaunchTwin}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#059669] hover:to-[#10b981] text-white border border-[#34d399]/60 text-xs font-serif font-bold transition-all shadow-lg hover:shadow-emerald-900/50"
            >
              <Eye className="w-4 h-4 text-white" />
              <span>Entrar al Gemelo 3D</span>
            </button>
          )}
        </div>
      </header>

      {/* ─── 2. ESCENA PRINCIPAL: FONDO DIEGÉTICO & SPRITES RECORTABLES ─── */}
      <main className="relative w-full h-full pt-14 flex items-center justify-center overflow-hidden">
        
        {/* Contenedor con Aspect Ratio fijo 16:9 que escala automáticamente */}
        <div 
          className="relative w-full h-full max-w-[1920px] max-h-[1080px] flex items-center justify-center"
          style={{ aspectRatio: '16/9' }}
        >
          {/* Imagen de Fondo (Galpón Agrícola Rústico AoE II) */}
          <img
            src="/assets/ui/workshop_bg.png"
            alt="Taller Agrícola Menú Diegético"
            className="w-full h-full object-cover select-none pointer-events-none filter contrast-105 brightness-95"
            draggable={false}
          />

          {/* Viñeta cinematográfica y grano de luz cálida */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/20" />

          {/* ─── 3. LOS 6 SPRITES DIEGÉTICOS RECORTADOS CON HOVER FÍSICO ─── */}
          {WORKSHOP_STATIONS.map((station) => {
            const isHovered = hoveredStation?.id === station.id;

            return (
              <div
                key={station.id}
                onClick={() => handleStationClick(station)}
                onMouseEnter={() => setHoveredStation(station)}
                onMouseLeave={() => setHoveredStation(null)}
                className="absolute cursor-pointer select-none group"
                style={{
                  top: station.position.top,
                  left: station.position.left,
                  width: station.position.width,
                  zIndex: isHovered ? 25 : 10,
                  transformOrigin: 'top center',
                  transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), filter 300ms ease'
                }}
              >
                {/* Objeto Sprite con balanceo físico y resplandor dorado */}
                <div
                  className="relative w-full transition-all duration-300"
                  style={{
                    transform: isHovered ? `scale(1.06) rotate(${station.hangAngle || '1.8deg'})` : 'scale(1) rotate(0deg)',
                    filter: isHovered 
                      ? 'drop-shadow(0 0 16px rgba(251, 191, 36, 0.85)) brightness(1.18)' 
                      : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.65))'
                  }}
                >
                  <img
                    src={station.spriteSrc}
                    alt={station.title}
                    className="w-full h-auto object-contain select-none"
                    draggable={false}
                  />

                  {/* Punto de luz indicadora diegética */}
                  <span 
                    className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-ping opacity-75 group-hover:opacity-100" 
                  />
                </div>

                {/* ─── 4. CARTELA DIEGÉTICA ESTILO AGE OF EMPIRES II (TOOLTIP) ─── */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 pointer-events-none transition-all duration-200 z-30 ${
                    isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                  }`}
                >
                  {/* Cartela en Madera con Borde Dorado y Remaches */}
                  <div className="relative bg-[#22130a]/95 text-[#fde68a] border-2 border-[#b45309] rounded-lg p-3 shadow-2xl backdrop-blur-sm">
                    {/* Flecha inferior */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#b45309]" />
                    
                    {/* Encabezado del Tooltip */}
                    <div className="flex items-center justify-between border-b border-[#78350f]/70 pb-1.5 mb-1.5">
                      <span className="text-[10px] font-mono font-black text-[#fbbf24] tracking-wider uppercase">
                        {station.code} • {station.badge}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#451a03] text-amber-200 font-serif border border-[#92400e]">
                        {station.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-black font-serif text-white tracking-wide leading-snug">
                      {station.title}
                    </h4>

                    <p className="text-[10px] text-[#e6ccb2] font-sans mt-1 leading-normal line-clamp-2">
                      {station.description}
                    </p>

                    <div className="mt-2 pt-1.5 border-t border-[#78350f]/50 flex items-center justify-between text-[9px] font-serif text-[#fef3c7]">
                      <span className="text-amber-400 font-bold">▶ Clic para interactuar</span>
                      <span className="text-[#a8a29e]">{station.tools.length} submódulos</span>
                    </div>
                  </div>
                </div>

                {/* Letrero colgante inferior sutil */}
                <div className="mt-1 text-center">
                  <span className="inline-block px-2 py-0.5 rounded bg-[#1f1208]/90 border border-[#92400e]/80 text-[10px] font-serif font-bold text-[#fde68a] shadow-md">
                    {station.shortTitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ─── 5. PANEL DE ADMINISTRADOR & DOCUMENTACIÓN (SOLICITADO POR EL USUARIO) ─── */}
      {showAdminPanel && (
        <aside className="absolute top-16 right-6 bottom-6 w-[440px] z-40 bg-[#160e0a]/95 backdrop-blur-xl border-2 border-[#b45309] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
          
          {/* Header del Panel */}
          <div className="flex items-center justify-between p-4 bg-[#23140c] border-b border-[#78350f]">
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#fbbf24]" />
              <div>
                <h3 className="text-sm font-black text-[#fbbf24] font-serif uppercase tracking-wider">
                  Panel de Administrador & Documentación
                </h3>
                <p className="text-[10px] text-[#d6c4a8] font-sans">
                  Arquitectura auditada y motores del Gemelo Digital
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAdminPanel(false)}
              className="p-1 rounded-lg text-amber-300 hover:text-white hover:bg-amber-900/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pestañas de Navegación del Administrador */}
          <div className="flex border-b border-[#78350f]/60 bg-[#1a0e08]">
            <button
              onClick={() => setActiveAdminTab('tree')}
              className={`flex-1 py-2 text-xs font-serif font-bold transition-colors ${
                activeAdminTab === 'tree'
                  ? 'text-[#fbbf24] border-b-2 border-[#fbbf24] bg-[#29170e]'
                  : 'text-[#d6c4a8] hover:text-white'
              }`}
            >
              🌳 Árbol de Archivos
            </button>
            <button
              onClick={() => setActiveAdminTab('engines')}
              className={`flex-1 py-2 text-xs font-serif font-bold transition-colors ${
                activeAdminTab === 'engines'
                  ? 'text-[#fbbf24] border-b-2 border-[#fbbf24] bg-[#29170e]'
                  : 'text-[#d6c4a8] hover:text-white'
              }`}
            >
              ⚙️ Motores (3D & Bio)
            </button>
            <button
              onClick={() => setActiveAdminTab('stations')}
              className={`flex-1 py-2 text-xs font-serif font-bold transition-colors ${
                activeAdminTab === 'stations'
                  ? 'text-[#fbbf24] border-b-2 border-[#fbbf24] bg-[#29170e]'
                  : 'text-[#d6c4a8] hover:text-white'
              }`}
            >
              🏷️ 6 Estaciones
            </button>
          </div>

          {/* Cuerpo del Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* TAB: Árbol de Archivos Auditado */}
            {activeAdminTab === 'tree' && (
              <div className="space-y-3">
                <div className="bg-[#24150d] p-3 rounded-xl border border-[#78350f]/50">
                  <span className="text-[11px] text-amber-200 font-sans block mb-1 font-semibold">
                    📂 Explorador de Código AgroTwin
                  </span>
                  <p className="text-[10px] text-[#a89984] leading-relaxed">
                    Ningún componente está aislado. Todos los módulos (`/js`, `/r3f`, `/map`, `/sim`) se vinculan a las 6 estaciones del taller diegético.
                  </p>
                </div>
                <div className="bg-[#0e0805] p-3 rounded-xl border border-[#451a03] overflow-x-auto">
                  {renderTreeItem(AUDITED_FILE_TREE)}
                </div>
              </div>
            )}

            {/* TAB: Motores (Gráfico y Biofísico) */}
            {activeAdminTab === 'engines' && (
              <div className="space-y-4">
                {/* Motor 1: 3D WebGL / R3F */}
                <div className="bg-[#1f120a] p-4 rounded-xl border border-[#78350f] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white font-serif">
                        Motor Gráfico 3D (Three.js r128 / R3F)
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
                      WebGL 2.0
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    Pipeline con sombreadores PBR, exageración de DEM (0.3x a 2.8x), post-procesado UnrealBloom/N8AO y vegetación instanciada en un único draw-call.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                    <div className="bg-[#140b06] p-2 rounded">
                      <span className="text-slate-500 block">Render Passes:</span>
                      Bloom + N8AO + Tonemap
                    </div>
                    <div className="bg-[#140b06] p-2 rounded">
                      <span className="text-slate-500 block">Capas de Terreno:</span>
                      Esri Satellite / Civ VI Hybrid
                    </div>
                  </div>
                </div>

                {/* Motor 2: Biofísico FAO-56 */}
                <div className="bg-[#1f120a] p-4 rounded-xl border border-[#78350f] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-white font-serif">
                        Motor Biofísico (Ground-Truth Sim)
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono">
                      FAO-56
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    Modela balance hídrico en 3 estratos radiculares (0-20, 20-60, 60-100 cm), evapotranspiración de cultivo (ETc = ETo × Kc) y drenaje de aire frío katabático.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                    <div className="bg-[#140b06] p-2 rounded">
                      <span className="text-slate-500 block">Humedad Radicular:</span>
                      Estrés hídrico CWSI: 0.26
                    </div>
                    <div className="bg-[#140b06] p-2 rounded">
                      <span className="text-slate-500 block">Riesgo Heladas:</span>
                      Katabático: 1.4°C (06:15)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: 6 Estaciones Maestras */}
            {activeAdminTab === 'stations' && (
              <div className="space-y-2">
                {WORKSHOP_STATIONS.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => handleStationClick(st)}
                    className="p-3 rounded-xl bg-[#22130a] hover:bg-[#331c0e] border border-[#78350f]/70 cursor-pointer transition-all flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400">{st.code}</span>
                        <h5 className="text-xs font-serif font-bold text-white">{st.title}</h5>
                      </div>
                      <p className="text-[10px] text-[#a89984] mt-1">{st.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            )}

          </div>

          <div className="p-3 bg-[#1e1008] border-t border-[#78350f] text-center">
            <span className="text-[10px] text-[#a89984] font-serif">
              AgriTwin Engine Architecture • AgroTech Chile & Rewild
            </span>
          </div>
        </aside>
      )}

      {/* ─── 6. MODAL INTERACTIVO DE ESTACIÓN CON GRÁFICOS DINÁMICOS ─── */}
      {activeModalStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#190f09] border-2 border-[#b45309] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Cabecera del Modal Estilo AoE II */}
            <div className="flex items-center justify-between p-4 bg-[#2b170c] border-b-2 border-[#78350f]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#1a0e07] border border-[#d97706] p-1 shadow-inner flex items-center justify-center">
                  <img
                    src={activeModalStation.spriteSrc}
                    alt={activeModalStation.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#fbbf24] px-1.5 py-0.5 rounded bg-[#451a03] border border-[#92400e]">
                      {activeModalStation.code}
                    </span>
                    <h3 className="text-base font-black font-serif text-white tracking-wide">
                      {activeModalStation.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#d6c4a8] font-serif italic">
                    {activeModalStation.category} • {activeModalStation.badge}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModalStation(null)}
                className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-900/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Modal con Gráfico Dinámico */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#e6ccb2]">
              
              {/* Descripción */}
              <div className="p-4 rounded-xl bg-[#24130a] border border-[#78350f]/60 leading-relaxed">
                {activeModalStation.description}
              </div>

              {/* Mapeo de Submódulos Auditados */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#fbbf24] mb-2">
                  🛠️ Submódulos y Herramientas Auditadas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeModalStation.tools.map((tool, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-[#140a05] border border-[#451a03] text-xs font-sans text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{tool}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gráfica Dinámica (Sustitución de gráficas estáticas de Python) */}
              <div className="p-4 rounded-xl bg-[#120804] border border-[#78350f]/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-serif font-bold text-white">
                      Telemetría & Gráfico de Tendencia Dinámica
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Interactiva (Reemplazo Python)
                  </span>
                </div>

                {/* Gráfico de barras/curva interactiva SVG con gradientes */}
                <div className="h-36 w-full flex items-end justify-between gap-1 pt-4 px-2 border-b border-l border-[#78350f]/50 relative">
                  {/* Línea de guía */}
                  <div className="absolute top-6 left-0 right-0 border-b border-dashed border-[#78350f]/30" />
                  
                  {/* Barras dinámicas de 12 horas */}
                  {[
                    { h: '00:00', v: 34, temp: 8.2 },
                    { h: '02:00', v: 32, temp: 6.4 },
                    { h: '04:00', v: 29, temp: 4.1 },
                    { h: '06:00', v: 27, temp: 1.4 },
                    { h: '08:00', v: 28, temp: 7.9 },
                    { h: '10:00', v: 36, temp: 18.2 },
                    { h: '12:00', v: 42, temp: 24.5 },
                    { h: '14:00', v: 39, temp: 26.8 },
                    { h: '16:00', v: 37, temp: 23.4 },
                    { h: '18:00', v: 35, temp: 19.1 },
                    { h: '20:00', v: 33, temp: 14.8 },
                    { h: '22:00', v: 34, temp: 11.2 }
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[9px] font-mono text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.v}%
                      </span>
                      <div 
                        className="w-full rounded-t transition-all duration-300 bg-gradient-to-t from-emerald-800 via-amber-600 to-amber-400 group-hover:brightness-125"
                        style={{ height: `${(bar.v / 50) * 100}%` }}
                      />
                      <span className="text-[8px] font-mono text-slate-500">
                        {bar.h}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Humedad de Estrato Radicular (20-60cm) vs Hora Diurna</span>
                  <span className="text-amber-400 font-mono">Simulación FAO-56 Calibrada</span>
                </div>
              </div>

            </div>

            {/* Footer con Acciones */}
            <div className="p-4 bg-[#231309] border-t border-[#78350f] flex items-center justify-between">
              <span className="text-xs text-[#a89984] font-serif">
                Presiona Esc para cerrar
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModalStation(null)}
                  className="px-4 py-2 rounded-lg bg-[#381e0e] hover:bg-[#4a2814] text-amber-200 text-xs font-serif font-bold transition-colors"
                >
                  Cerrar
                </button>

                {activeModalStation.id === 'station_a' && (
                  <button
                    onClick={() => {
                      setActiveModalStation(null);
                      if (window.parent && window.parent !== window) {
                        window.parent.postMessage({ type: 'agritwin:navigate_admin', tab: 'predios' }, '*');
                      } else {
                        window.open('http://localhost:7771/?view=docs&tab=predios', '_blank');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-serif font-bold transition-colors shadow-lg flex items-center gap-1.5"
                  >
                    <span>Ver Datos GIS / Satelitales (Panel Admin)</span>
                  </button>
                )}

                {activeModalStation.id === 'station_b' && (
                  <button
                    onClick={() => {
                      setActiveModalStation(null);
                      if (window.parent && window.parent !== window) {
                        window.parent.postMessage({ type: 'agritwin:navigate_admin', tab: 'sensors' }, '*');
                      } else {
                        window.open('http://localhost:7771/?view=docs&tab=sensors', '_blank');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-serif font-bold transition-colors shadow-lg flex items-center gap-1.5"
                  >
                    <span>Ir directamente a Sensores (Panel Admin)</span>
                  </button>
                )}

                {activeModalStation.id === 'station_d' && (
                  <button
                    onClick={() => {
                      setActiveModalStation(null);
                      if (window.parent && window.parent !== window) {
                        window.parent.postMessage({ type: 'agritwin:navigate_admin', tab: 'vault' }, '*');
                      } else {
                        window.open('http://localhost:7771/?view=docs&tab=vault', '_blank');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-serif font-bold transition-colors shadow-lg flex items-center gap-1.5"
                  >
                    <span>Ir a Libro ESG / Documentación (Panel Admin)</span>
                  </button>
                )}

                {activeModalStation.id === 'station_f' && (
                  <button
                    onClick={() => {
                      setActiveModalStation(null);
                      if (window.parent && window.parent !== window) {
                        window.parent.postMessage({ type: 'agritwin:navigate_admin', tab: 'scripts' }, '*');
                      } else {
                        window.open('http://localhost:7771/?view=docs&tab=scripts', '_blank');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-serif font-bold transition-colors shadow-lg flex items-center gap-1.5"
                  >
                    <span>Ver Scripts & CLI (Panel Admin)</span>
                  </button>
                )}

                {activeModalStation.id === 'station_c' && onLaunchTwin && (
                  <button
                    onClick={() => {
                      setActiveModalStation(null);
                      onLaunchTwin();
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-serif font-bold transition-colors shadow-lg"
                  >
                    Abrir en 3D
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AgroWorkshopMenu;
