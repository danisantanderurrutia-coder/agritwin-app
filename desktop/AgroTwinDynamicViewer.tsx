import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Landmark, TreePine, Wrench, Droplets, Flame, 
  ShieldAlert, Sparkles, ExternalLink, Maximize2, RefreshCw, 
  Layers, Cpu, Activity, CheckCircle2, ChevronRight, MessageSquare, 
  FileText, ShieldCheck, Eye, Compass, Sun, MapPin, Gauge
} from 'lucide-react';
import { AgroWorkshopMenu } from '../components/AgroWorkshopMenu.jsx';

export type ViewMode = 'ENTERPRISE' | 'TERRITORIAL' | 'ESG' | 'STUDIO';

interface BiophysicalState {
  simulatedHour: string;
  avgMoisture: string;
  globalRisk: string;
  enterprise: {
    layer1_0_20cm: number | string;
    layer2_20_60cm: number | string;
    layer3_60_100cm: number | string;
    cwsi: number | string;
    irrigationSheetMm: number | string;
    irrigationDurationMin: number;
    et0PenmanMonteith: number | string;
    frostMinTemp: number | string;
    frostRiskLevel: string;
    frostLocation: string;
    frostHourPredict: string;
  };
  territorial: {
    aquiferRechargePercent: number;
    aquiferStatus: string;
    fwiScore: number;
    fwiCategory: string;
    fuelLoadTonHa: number;
    aprCommitteesCount: number;
    familiesSupplied: number;
    waterTrucksAvoided: number;
    savingsClp: string;
    firebreaksCleanKm: number;
    criticalSector: string;
  };
  esg: {
    carbonTco2eHa: number;
    ieiScore: number;
    eudrCompliance: string;
    baselineYear: string;
    mrvHash: string;
    biodiversityCredits: number;
    restorationCorridorHa: number;
  };
}

const DEFAULT_BIOPHYSICAL_DATA: BiophysicalState = {
  simulatedHour: '10:00',
  avgMoisture: '37.2%',
  globalRisk: 'optimal',
  enterprise: {
    layer1_0_20cm: '24.8',
    layer2_20_60cm: '36.2',
    layer3_60_100cm: '42.5',
    cwsi: 0.26,
    irrigationSheetMm: 5.8,
    irrigationDurationMin: 42,
    et0PenmanMonteith: 3.6,
    frostMinTemp: 1.4,
    frostRiskLevel: 'warning',
    frostLocation: 'Hondonada baja del Estero',
    frostHourPredict: '06:15 AM'
  },
  territorial: {
    aquiferRechargePercent: 68,
    aquiferStatus: 'warning',
    fwiScore: 38,
    fwiCategory: 'Alto',
    fuelLoadTonHa: 4.5,
    aprCommitteesCount: 6,
    familiesSupplied: 1420,
    waterTrucksAvoided: 14,
    savingsClp: '$4.2M CLP',
    firebreaksCleanKm: 14.2,
    criticalSector: 'Sector Ribera Sur (3.2 km)'
  },
  esg: {
    carbonTco2eHa: 4.8,
    ieiScore: 0.88,
    eudrCompliance: '100% Cero Deforestación',
    baselineYear: 'Diciembre 2020 (Sentinel-2)',
    mrvHash: '0x8f2d4a19c6e',
    biodiversityCredits: 128,
    restorationCorridorHa: 8.4
  }
};

interface AgroTwinDynamicViewerProps {
  initialMode?: ViewMode;
  onNavigate?: (viewId: string) => void;
  serverUrl?: string;
  onOpenStandalone?: () => void;
}

export const AgroTwinDynamicViewer: React.FC<AgroTwinDynamicViewerProps> = ({
  initialMode = 'ENTERPRISE',
  onNavigate,
  serverUrl = 'http://localhost:7773',
  onOpenStandalone
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  const [biophysicalData, setBiophysicalData] = useState<BiophysicalState>(DEFAULT_BIOPHYSICAL_DATA);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [showBioSimModal, setShowBioSimModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showWorkshopMenu, setShowWorkshopMenu] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Escuchar mensajes provenientes del motor 3D en WebGL
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'simulation:tick') {
        setBiophysicalData(prev => ({
          ...prev,
          ...event.data
        }));
      } else if (event.data && event.data.type === 'AGROTWIN_PROFILE_CHANGED') {
        const mode = event.data.profile as ViewMode;
        if (['ENTERPRISE', 'TERRITORIAL', 'ESG', 'STUDIO'].includes(mode)) {
          setViewMode(mode);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Notificar al motor 3D sobre el cambio de modo sin reiniciar WebGL (Single-Engine)
  const handleProfileSelect = (mode: ViewMode) => {
    setViewMode(mode);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SET_AGROTWIN_PROFILE',
        profile: mode.toLowerCase()
      }, '*');
    }
  };

  const handleOpenDedicatedTab = () => {
    if (onOpenStandalone) {
      onOpenStandalone();
    } else {
      window.open(serverUrl, '_blank');
    }
  };

  if (showWorkshopMenu) {
    return (
      <div className="fixed inset-0 z-50 w-full h-full bg-[#0a0705]">
        <AgroWorkshopMenu onLaunchTwin={() => setShowWorkshopMenu(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full space-y-6 animate-fadeIn">
      {/* ─── BARRA MAESTRA DEL PERFILADOR DE VISTAS (SINGLE-ENGINE MULTI-PROFILE) ─── */}
      <div className="bg-[#0B1510]/95 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-5 shadow-2xl space-y-5">
        
        {/* Cabecera con selector y estado */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-emerald-900/40 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-[#04120B] border border-emerald-400/40 p-2.5 shadow-inner shrink-0">
              <img src="/logo-agritwin.png" alt="AgriTwin 3D" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>AgroTwin 3D</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold">
                    Single-Engine V2
                  </span>
                </h2>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Motor WebGL Three.js Activo" />
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Perfilador de Vistas Dinámico • Zoom adaptativo, capas vectoriales y HUD especializado
              </p>
            </div>
          </div>

          {/* Acciones de ventana */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <button
              onClick={() => setShowWorkshopMenu(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600/25 hover:bg-amber-600/35 text-amber-300 border border-amber-500/50 text-xs font-bold transition-all shadow-md active:scale-95"
              title="Abrir Menú Diegético Taller Agrícola (Age of Empires II)"
            >
              <span className="text-sm">🏰</span>
              <span>Taller Agrícola</span>
            </button>

            <button
              onClick={() => setShowBioSimModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
              title="Especificación de la Caja Negra Biofísica"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Caja Negra Biofísica</span>
            </button>

            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
              title="Ver Despacho Dinámico por WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Alertas</span>
            </button>

            <button
              onClick={handleOpenDedicatedTab}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Puerto 7773</span>
            </button>
          </div>
        </div>

        {/* ─── SELECTOR SEGMENTADO DE PERFILES (CLIENT-TAILORED VIEWS) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Perfil 1: B2B Enterprise */}
          <button
            onClick={() => handleProfileSelect('ENTERPRISE')}
            className={`p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden ${
              viewMode === 'ENTERPRISE'
                ? 'bg-gradient-to-br from-emerald-950/90 to-emerald-900/60 border-emerald-400 shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-400/50'
                : 'bg-[#06140D]/70 border-emerald-900/40 hover:bg-emerald-950/30 text-slate-400 hover:border-emerald-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                <span className="text-base">🍇</span> B2B ENTERPRISE
              </span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                viewMode === 'ENTERPRISE' ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                Predio / Cuartel
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Suelo en 3 estratos, lámina de riego milimétrico y heladas katabáticas.
            </p>
          </button>

          {/* Perfil 2: B2G Territorial */}
          <button
            onClick={() => handleProfileSelect('TERRITORIAL')}
            className={`p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden ${
              viewMode === 'TERRITORIAL'
                ? 'bg-gradient-to-br from-cyan-950/90 to-sky-900/60 border-cyan-400 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/50'
                : 'bg-[#06140D]/70 border-emerald-900/40 hover:bg-cyan-950/30 text-slate-400 hover:border-cyan-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                <span className="text-base">🏛️</span> B2G TERRITORIAL
              </span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                viewMode === 'TERRITORIAL' ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                Cuenca / Comuna
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Semáforo de acuíferos, FWI incendios, rutas de aljibes y cortafuegos.
            </p>
          </button>

          {/* Perfil 3: ESG / MRV Ledger */}
          <button
            onClick={() => handleProfileSelect('ESG')}
            className={`p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden ${
              viewMode === 'ESG'
                ? 'bg-gradient-to-br from-amber-950/90 to-yellow-900/50 border-amber-400 shadow-lg shadow-amber-950/60 ring-1 ring-amber-400/50'
                : 'bg-[#06140D]/70 border-emerald-900/40 hover:bg-amber-950/30 text-slate-400 hover:border-amber-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                <span className="text-base">🌿</span> ESG / MRV LEDGER
              </span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                viewMode === 'ESG' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                Regional / Ecosistema
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Captura tCO2e/ha, Integridad Ecológica (IEI) y No-Deforestación EUDR.
            </p>
          </button>

          {/* Perfil 4: Modo Estudio / Sandbox */}
          <button
            onClick={() => handleProfileSelect('STUDIO')}
            className={`p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden ${
              viewMode === 'STUDIO'
                ? 'bg-gradient-to-br from-purple-950/90 to-fuchsia-900/50 border-purple-400 shadow-lg shadow-purple-950/60 ring-1 ring-purple-400/50'
                : 'bg-[#06140D]/70 border-emerald-900/40 hover:bg-purple-950/30 text-slate-400 hover:border-purple-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                <span className="text-base">🛠️</span> MODO ESTUDIO
              </span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                viewMode === 'STUDIO' ? 'bg-purple-400 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                Full Sandbox
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Pincel 3D, escultor DEM, sol/hora y catálogo de 35 ítems liberados.
            </p>
          </button>
        </div>

        {/* ─── WIDGETS DINÁMICOS CONDICIONADOS SEGÚN EL VIEWMODE ─── */}
        <div className="bg-[#040C07] border border-emerald-500/20 rounded-2xl p-4">
          
          {/* MODO B2B ENTERPRISE WIDGETS */}
          {viewMode === 'ENTERPRISE' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3">
                <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Humedad Radicular (20-60cm)</div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">
                  {biophysicalData.enterprise.layer2_20_60cm}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Zona radicular activa (CWSI: {biophysicalData.enterprise.cwsi})</div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3">
                <div className="text-[10px] text-amber-400 font-mono font-bold uppercase">Lámina de Riego</div>
                <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
                  {biophysicalData.enterprise.irrigationSheetMm} mm
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{biophysicalData.enterprise.irrigationDurationMin} min de bombeo sugeridos</div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3">
                <div className="text-[10px] text-sky-400 font-mono font-bold uppercase">Alerta Helada Katabática</div>
                <div className="text-xl sm:text-2xl font-black text-sky-300 mt-1">
                  {biophysicalData.enterprise.frostMinTemp}°C
                </div>
                <div className="text-[10px] text-sky-400/80 mt-0.5">{biophysicalData.enterprise.frostHourPredict} (En el bajo)</div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3">
                <div className="text-[10px] text-emerald-300 font-mono font-bold uppercase">Evapotranspiración ETo</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                  {biophysicalData.enterprise.et0PenmanMonteith} mm/d
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">FAO-56 Penman-Monteith</div>
              </div>
            </div>
          )}

          {/* MODO B2G TERRITORIAL WIDGETS */}
          {viewMode === 'TERRITORIAL' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
              <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3">
                <div className="text-[10px] text-cyan-400 font-mono font-bold uppercase">Semáforo de Acuífero</div>
                <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
                  🟡 {biophysicalData.territorial.aquiferRechargePercent}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Recarga napa freática (Cuenca Perquilauquén)</div>
              </div>

              <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3">
                <div className="text-[10px] text-rose-400 font-mono font-bold uppercase">Piro-Riesgo FWI Canadiense</div>
                <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">
                  {biophysicalData.territorial.fwiScore} ({biophysicalData.territorial.fwiCategory})
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Carga combustible: {biophysicalData.territorial.fuelLoadTonHa} t/ha</div>
              </div>

              <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3">
                <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Camiones Aljibe Evitados</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
                  {biophysicalData.territorial.waterTrucksAvoided} rutas
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-0.5">Ahorro: {biophysicalData.territorial.savingsClp}</div>
              </div>

              <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3">
                <div className="text-[10px] text-cyan-300 font-mono font-bold uppercase">Cortafuegos Operativos</div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">
                  {biophysicalData.territorial.firebreaksCleanKm} km
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{biophysicalData.territorial.criticalSector}</div>
              </div>
            </div>
          )}

          {/* MODO ESG / MRV LEDGER WIDGETS */}
          {viewMode === 'ESG' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3">
                <div className="text-[10px] text-amber-400 font-mono font-bold uppercase">Captura de Carbono</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
                  {biophysicalData.esg.carbonTco2eHa} tCO2e/ha
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Tier 2 IPCC • Bosque esclerófilo</div>
              </div>

              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3">
                <div className="text-[10px] text-cyan-400 font-mono font-bold uppercase">Integridad Ecológica (IEI)</div>
                <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-1">
                  {biophysicalData.esg.ieiScore} / 1.00
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Conectividad biológica alta</div>
              </div>

              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3">
                <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Compliance EUDR</div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">
                  100% Cero Def.
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Sentinel-2 (Línea base post-2020)</div>
              </div>

              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3">
                <div className="text-[10px] text-amber-300 font-mono font-bold uppercase">Créditos Biodiversidad</div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                  {biophysicalData.esg.biodiversityCredits} PBC
                </div>
                <div className="text-[10px] text-amber-400/80 mt-0.5">Hash: {biophysicalData.esg.mrvHash}</div>
              </div>
            </div>
          )}

          {/* MODO ESTUDIO / MAESTRO WIDGETS */}
          {viewMode === 'STUDIO' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
              <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3">
                <div className="text-[10px] text-purple-400 font-mono font-bold uppercase">Herramientas 3D</div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">
                  100% Libres
                </div>
                <div className="text-[10px] text-purple-300/80 mt-0.5">Pincel, Escultor, Sol & DEM</div>
              </div>

              <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3">
                <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Catálogo de Ítems</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
                  35 Modelos
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Frutales, Nativo, Infraestructura</div>
              </div>

              <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3">
                <div className="text-[10px] text-cyan-400 font-mono font-bold uppercase">GIS & Shapefiles</div>
                <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-1">
                  .shp / .zip
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Importador cliente shpjs activo</div>
              </div>

              <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3">
                <div className="text-[10px] text-amber-400 font-mono font-bold uppercase">Simulación IoT</div>
                <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
                  {biophysicalData.simulatedHour} hrs
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Humedad global: {biophysicalData.avgMoisture}</div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ─── VISOR 3D WEBGL CENTRAL (SINGLE-ENGINE RUNTIME PERSISTENTE) ─── */}
      <div className="rounded-3xl border-2 border-emerald-500/40 overflow-hidden shadow-2xl bg-slate-950 relative">
        
        {/* Barra superior de control del visor 3D */}
        <div className="bg-slate-900/90 px-4 py-3 flex items-center justify-between text-xs font-mono text-slate-300 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/90" />
            <span className="w-3 h-3 rounded-full bg-amber-500/90" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/90" />
            <span className="text-white font-bold ml-1 flex items-center gap-2">
              <span>AgriTwin 3D WebGL Engine</span>
              <span className="text-[10px] text-emerald-400 font-sans px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 font-bold">
                {viewMode === 'ENTERPRISE' && 'Lente B2B: Cuarteles & Riego'}
                {viewMode === 'TERRITORIAL' && 'Lente B2G: Cuenca & Acuíferos'}
                {viewMode === 'ESG' && 'Lente ESG: MRV & Carbono'}
                {viewMode === 'STUDIO' && 'Lente Maestro: Full Sandbox'}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleOpenDedicatedTab} 
              className="hover:text-emerald-400 flex items-center gap-1 transition-colors text-slate-300"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Pantalla Completa</span>
            </button>
          </div>
        </div>

        {/* Iframe que aloja el Three.js Engine sin recrearse jamás al cambiar de perfil */}
        <div className="relative w-full h-[620px] bg-[#0B111C]">
          <iframe 
            ref={iframeRef}
            src={serverUrl} 
            title="AgroTwin 3D WebGL Engine Canvas" 
            className="w-full h-full border-0"
            onLoad={() => {
              setIsIframeLoaded(true);
              // Sincronizar el perfil inicial al cargar el iframe
              iframeRef.current?.contentWindow?.postMessage({
                type: 'SET_AGROTWIN_PROFILE',
                profile: viewMode.toLowerCase()
              }, '*');
            }}
          />
        </div>
      </div>

      {/* ─── MODAL: MOTOR BIOFÍSICO FAO-56 & ESPECIFICACIÓN CAJA NEGRA ─── */}
      {showBioSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B1710] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔬</span>
                <div>
                  <h3 className="text-lg font-black text-white">Motor Biofísico Unificado (Caja Negra)</h3>
                  <span className="text-xs text-amber-400 font-mono">Calibrado FAO-56 • FWI Canadiense • IPCC Tier 2</span>
                </div>
              </div>
              <button 
                onClick={() => setShowBioSimModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <strong>¿Por qué una Caja Negra Unificada?</strong>
                <p className="mt-1">
                  Los 3 perfiles de clientes leen de la misma física de suelo, atmósfera y vegetación. No duplicamos modelos ni cálculos: el balance hidrológico alimenta simultáneamente el riego del cuartel (B2B), la recarga del acuífero (B2G) y el secuestro de carbono (ESG).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border-l-4 border-emerald-400">
                  <strong className="text-white block mb-1">1. Balance en 3 Estratos</strong>
                  • 0-20 cm: Evaporación directa<br/>
                  • 20-60 cm: Absorción radicular<br/>
                  • 60-100 cm: Recarga napa profunda
                </div>

                <div className="p-3 rounded-xl bg-white/5 border-l-4 border-cyan-400">
                  <strong className="text-white block mb-1">2. Piro-Riesgo FWI</strong>
                  Canadian Forest Service (FFMC, DMC, DC) acoplado al anemómetro y combustible fino seco.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border-l-4 border-amber-400">
                <strong className="text-white block mb-1">3. Ledger MRV Inmutable</strong>
                Verificación de no-deforestación EUDR con serie multiespectral Sentinel-2 y cálculo de carbono por biomasa arbórea.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setShowBioSimModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: DESPACHO DINÁMICO POR WHATSAPP ─── */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b141a] border border-emerald-500/40 rounded-3xl overflow-hidden max-w-md w-full shadow-2xl">
            {/* Header WhatsApp */}
            <div className="bg-[#075e54] px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#128c7e] flex items-center justify-center font-bold text-lg">
                  🌱
                </div>
                <div>
                  <div className="font-bold text-sm">AgroTwin Bot • AgroTech Chile</div>
                  <div className="text-[10px] text-emerald-200">Verificado • Servidor Maule</div>
                </div>
              </div>
              <button 
                onClick={() => setShowWhatsAppModal(false)}
                className="text-white/80 hover:text-white text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Body WhatsApp Condicionado según el viewMode */}
            <div className="p-5 space-y-3 min-h-[260px] text-xs">
              <div className="text-center text-[10px] text-slate-400 bg-slate-900/60 py-1 px-3 rounded-full mx-auto w-fit">
                HOY • MODO {viewMode}
              </div>

              {viewMode === 'ENTERPRISE' && (
                <div className="bg-[#005c4b] text-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-md space-y-2">
                  <div className="font-bold text-emerald-300 text-sm">🚨 ALERTA MATUTINA PREDIAL</div>
                  <div>Predio: <strong>Meniels (Parral, Maule)</strong></div>
                  <hr className="border-white/10" />
                  <div>• <strong>Riego Sugerido:</strong> Cuartel A (Brotes)</div>
                  <div>• <strong>Lámina:</strong> 5.8 mm (42 min bomba)</div>
                  <div>• <strong>Humedad Radicular:</strong> 28.4% (Estrés leve)</div>
                  <div>• <strong>Helada Katabática:</strong> 1.2°C a las 06:15 AM en el bajo.</div>
                  <div className="text-right text-[10px] text-emerald-300/80">05:00 ✓✓</div>
                </div>
              )}

              {viewMode === 'TERRITORIAL' && (
                <div className="bg-[#005c4b] text-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-md space-y-2">
                  <div className="font-bold text-cyan-300 text-sm">🏛️ INFORME COMUNAL DE CUENCA</div>
                  <div>Destinatario: <strong>Alcaldía & APR Parral</strong></div>
                  <hr className="border-white/10" />
                  <div>• <strong>Semáforo Acuífero:</strong> 🟡 Precaución (68% recarga)</div>
                  <div>• <strong>Piro-Riesgo FWI:</strong> 38 (Alto en interfaz)</div>
                  <div>• <strong>Rutas Aljibe:</strong> 14 rutas ahorradas este mes</div>
                  <div>• <strong>Cortafuegos:</strong> 14.2 km limpios en Ribera Sur.</div>
                  <div className="text-right text-[10px] text-cyan-300/80">08:30 ✓✓</div>
                </div>
              )}

              {viewMode === 'ESG' && (
                <div className="bg-[#005c4b] text-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-md space-y-2">
                  <div className="font-bold text-amber-300 text-sm">🌿 CERTIFICADO MRV LEDGER</div>
                  <div>Auditoría: <strong>EUDR Cero-Deforestación</strong></div>
                  <hr className="border-white/10" />
                  <div>• <strong>Deforestación Neta:</strong> 0.00% verificada</div>
                  <div>• <strong>Captura Carbono:</strong> 4.8 tCO2e/ha/año</div>
                  <div>• <strong>Integridad Ecológica:</strong> 0.88 / 1.00</div>
                  <div>• <strong>Hash:</strong> <code className="text-emerald-300">0x8f2d4a19c6e</code></div>
                  <div className="text-right text-[10px] text-amber-300/80">12:00 ✓✓</div>
                </div>
              )}

              {viewMode === 'STUDIO' && (
                <div className="bg-[#005c4b] text-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-md space-y-2">
                  <div className="font-bold text-purple-300 text-sm">🛠️ REPORTE DE TELEMETRÍA GLOBAL</div>
                  <div>Entorno: <strong>AgriTwin 3D Sandbox</strong></div>
                  <hr className="border-white/10" />
                  <div>• <strong>Nodos IoT:</strong> 5 activos transmitiendo</div>
                  <div>• <strong>Pincel Vectorial:</strong> Calibrado</div>
                  <div>• <strong>Catálogo 3D:</strong> 35 especies listas</div>
                  <div className="text-right text-[10px] text-purple-300/80">14:00 ✓✓</div>
                </div>
              )}
            </div>

            {/* Footer WhatsApp */}
            <div className="bg-[#111b21] p-3 text-center text-[10px] text-slate-400 border-t border-slate-800">
              ⚡ Webhook autónomo conectado a servidor local en puerto 7773
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
