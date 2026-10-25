/**
 * AgriTwin - Actuator & Industrial Relay Manager (Chilean Farm Enclosure)
 * 
 * Gestiona el estado y la lógica de interbloqueo de los interruptores y relés
 * del Gabinete Industrial de Terreno IP67:
 * - Riego y Gestión Hídrica (Bomba de pozo, Válvula sectorial, Aspersión antiheladas)
 * - Confort Establo y Ganadería (Bebederos, Cortinas térmicas, Portones PRV, Dosificador)
 * 
 * Interbloqueos agroclimáticos automáticos basados en datos OpenWeather y sensores locales.
 */

import { bus } from '../utils/EventBus.js';

export const ACTUATORS_DEFINITION = [
  // ─── RAMA 1: GENERAL PREDIO / CASAL ─────────────────────────
  {
    id: 'act_pump_deepwell',
    branch: 'general',
    name: 'Bomba Pozo Profundo (MEE DGA)',
    category: 'Extracción Hídrica',
    icon: '⚡',
    voltage: '380V Trifásico',
    mode: 'auto', // 'auto' | 'on' | 'off'
    state: false,
    lockoutReason: 'Turno de canal activo. Ahorro energético en curso.',
    autoRule: 'Apagado automático si reserva del perfil > 3 días y turno de canal arriba en < 4 días.',
    kwRating: 15.0,
    impactMessage: 'Ahorro de $112.000 CLP/semana al priorizar turno de canal sobre pozo.'
  },
  {
    id: 'act_canal_gate',
    branch: 'general',
    name: 'Compuerta Matriz Turno de Canal',
    category: 'Riego Gravitacional',
    icon: '🌊',
    voltage: '24V DC Actuador Lineal',
    mode: 'auto',
    state: true,
    lockoutReason: null,
    autoRule: 'Apertura programada según rol de la Asociación de Canalistas del Maule (Martes 08:00 h).',
    kwRating: 0.2,
    impactMessage: 'Ingreso de 1.150 m³ de agua sin costo eléctrico directo.'
  },
  {
    id: 'act_master_valve',
    branch: 'general',
    name: 'Válvula Matriz Tranque Keyline',
    category: 'Distribución Principal',
    icon: '🚰',
    voltage: '24V AC Solenoide',
    mode: 'auto',
    state: true,
    lockoutReason: null,
    autoRule: 'Mantiene presurizada la red gravimétrica mientras el tranque supere el 25% de cota.',
    kwRating: 0.05,
    impactMessage: 'Presión por carga estática natural: 2.2 bar hacia los cuarteles bajos.'
  },

  // ─── RAMA 2: CUARTELES / AGRÍCOLA ──────────────────────────
  {
    id: 'act_valve_sector_cherries',
    branch: 'cuarteles',
    name: 'Electroválvula Sector 1 (Cerezos Lapins)',
    category: 'Riego Localizado por Goteo',
    icon: '🍒',
    voltage: '24V AC',
    mode: 'auto',
    state: false,
    lockoutReason: 'Bloqueo: OpenWeather prevé lluvia > 12 mm en 48h. Evita cracking.',
    autoRule: 'Riego nocturno (22:00 a 04:00) para minimizar evapotranspiración.',
    kwRating: 0.04,
    impactMessage: 'Prevención de asfixia radicular y preservación de cutícula del fruto.'
  },
  {
    id: 'act_frost_sprinklers',
    branch: 'cuarteles',
    name: 'Aspersión Antihelada Sub-Copa',
    category: 'Defensa Térmica Pasiva/Activa',
    icon: '❄️',
    voltage: '380V Bomba Booster',
    mode: 'auto',
    state: false,
    lockoutReason: 'INTERBLOQUEO ACTIVO: Temp. Bulbo Húmedo es -1.5°C (< -0.5°C). Aspersión prohibida por daño evaporativo destructivo.',
    autoRule: 'Solo arma si T. Fruta <= 0.0°C Y Temp. Bulbo Húmedo (Twb) >= -0.5°C.',
    kwRating: 22.0,
    impactMessage: 'Seguro de cosecha: Protege $14.5M CLP en botones florales y fruto cuajado.'
  },
  {
    id: 'act_valve_vineyard',
    branch: 'cuarteles',
    name: 'Riego Deficitario Controlado (Viña País)',
    category: 'Manejo Enológico',
    icon: '🍇',
    voltage: '24V AC',
    mode: 'auto',
    state: false,
    lockoutReason: null,
    autoRule: 'Sostiene estrés moderado (CWSI 0.35-0.45) para concentración de polifenoles.',
    kwRating: 0.04,
    impactMessage: 'Optimización de grado brix y acidez natural de viña patrimonial.'
  },

  // ─── RAMA 3: ESTABLO / GANADERÍA ────────────────────────────
  {
    id: 'act_water_trough',
    branch: 'establo',
    name: 'Llenado Automático Bebederos P1-P8',
    category: 'Hidratación Animal',
    icon: '🐄',
    voltage: '12V DC Válvula Flotador',
    mode: 'auto',
    state: true,
    lockoutReason: null,
    autoRule: 'Corte preventivo si temperatura ambiente < -2.0°C para evitar rotura de cañerías por congelación.',
    kwRating: 0.02,
    impactMessage: 'Asegura 60 L/vaca/día para rebaño Clavel Alemán y Angus.'
  },
  {
    id: 'act_curtains_barn',
    branch: 'establo',
    name: 'Cortinas Motorizadas Galpón (Viento Puelche)',
    category: 'Climatización Establo',
    icon: '🏠',
    voltage: '220V Motor Reductor',
    mode: 'auto',
    state: false, // false = Abiertas, true = Cerradas
    lockoutReason: null,
    autoRule: 'Cierre hermético de barlovento si ráfagas de viento Puelche superan los 25 km/h o lluvia > 5 mm/h.',
    kwRating: 0.75,
    impactMessage: 'Control de estrés calórico/eólico e Índice ITH en ternereras y aves.'
  },
  {
    id: 'act_gate_prv',
    branch: 'establo',
    name: 'Portón Automatizado Pastoreo Voisin (PRV)',
    category: 'Manejo Rotacional',
    icon: '🚪',
    voltage: '12V DC Batería Solar',
    mode: 'auto',
    state: false,
    lockoutReason: null,
    autoRule: 'Apertura hacia nuevo potrero según tiempo de descanso óptimo (Leyes de Voisin).',
    kwRating: 0.05,
    impactMessage: 'Cero sobrepastoreo. Salto programado de potrero P3 a potrero P1.'
  },
  {
    id: 'act_feed_doser',
    branch: 'establo',
    name: 'Dosificador Suplementación Térmica',
    category: 'Nutrición Inviernal',
    icon: '🌾',
    voltage: '220V Sinfín',
    mode: 'auto',
    state: false,
    lockoutReason: null,
    autoRule: 'Incrementa automáticamente un 15% la ración seca si el pronóstico anuncia frentes polares < 0°C.',
    kwRating: 1.1,
    impactMessage: 'Mantenimiento del balance energético del ganado en heladas severas.'
  }
];

class ActuatorManager {
  constructor() {
    this.storageKey = 'agritwin_actuators_state_v1';
    this.actuators = this.loadState();
    this.setupReactiveListeners();
  }

  setupReactiveListeners() {
    bus.on('weather:updated', (data) => {
      this.evaluateInterlocks(data, null);
    });
    bus.on('telemetry:updated', (telemetry) => {
      this.evaluateInterlocks(null, telemetry);
    });
    bus.on('sim:step', (simData) => {
      this.evaluateInterlocks(simData?.weather, simData?.sensors);
    });
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Fusionar con definiciones base para preservar metadatos
          return ACTUATORS_DEFINITION.map(base => {
            const found = parsed.find(p => p.id === base.id);
            return found ? { ...base, mode: found.mode, state: found.state } : { ...base };
          });
        }
      }
    } catch (err) {
      console.warn('[ActuatorManager] Error leyendo estado desde localStorage, usando predeterminados:', err);
    }
    return JSON.parse(JSON.stringify(ACTUATORS_DEFINITION));
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.actuators));
      bus.emit('actuators:updated', this.actuators);
    } catch (err) {
      console.warn('[ActuatorManager] Error persistiendo actuadores en localStorage:', err);
    }
  }

  getAll() {
    return this.actuators;
  }

  getByBranch(branch) {
    if (branch === 'general') return this.actuators; // En general se ve el resumen de todo
    return this.actuators.filter(a => a.branch === branch);
  }

  get(id) {
    return this.actuators.find(a => a.id === id);
  }

  /**
   * Conmuta el modo de un interruptor: 'auto' -> 'on' -> 'off' -> 'auto'
   */
  cycleMode(id) {
    const act = this.get(id);
    if (!act) return;

    if (act.mode === 'auto') {
      act.mode = 'on';
      act.state = true;
    } else if (act.mode === 'on') {
      act.mode = 'off';
      act.state = false;
    } else {
      act.mode = 'auto';
      // Recalcular estado por regla automática
      act.state = !act.lockoutReason;
    }

    this.saveState();
    bus.emit('ui:show_toast', `⚙️ ${act.name}: Modo ${act.mode.toUpperCase()} (${act.state ? 'ACTIVO' : 'INACTIVO'})`);
    return act;
  }

  /**
   * Fuerza el estado de un interruptor si está en manual
   */
  setState(id, state) {
    const act = this.get(id);
    if (!act) return;
    act.state = !!state;
    this.saveState();
  }

  /**
   * Evalúa interbloqueos agroclimáticos en base a OpenWeather y sensores locales
   */
  evaluateInterlocks(weatherData, sensorData) {
    let changed = false;

    // 1. Interbloqueo Aspersión Antihelada
    const frostAct = this.get('act_frost_sprinklers');
    if (frostAct) {
      const wetBulb = sensorData?.wetBulbTempC ?? -1.5;
      const fruitTemp = sensorData?.fruitHeightTempC ?? -0.8;
      
      if (fruitTemp <= 0 && wetBulb < -0.5) {
        frostAct.lockoutReason = `BLOQUEO CRÍTICO: Temp. Bulbo Húmedo (${wetBulb}°C < -0.5°C). Riego provocaría congelamiento evaporativo destructivo.`;
        if (frostAct.mode === 'auto') frostAct.state = false;
      } else if (fruitTemp <= 0 && wetBulb >= -0.5) {
        frostAct.lockoutReason = null;
        if (frostAct.mode === 'auto') frostAct.state = true;
      } else {
        frostAct.lockoutReason = null;
        if (frostAct.mode === 'auto') frostAct.state = false;
      }
      changed = true;
    }

    // 2. Interbloqueo Riego Cerezos por Lluvia OpenWeather (Cracking)
    const cherryAct = this.get('act_valve_sector_cherries');
    if (cherryAct) {
      const rain72hProb = weatherData?.rain_72h_prob ?? 75;
      const rainMmForecast = weatherData?.rain_mm_forecast ?? 14.5;
      if (rainMmForecast > 10.0 && rain72hProb > 60) {
        cherryAct.lockoutReason = `BLOQUEO PREVENTIVO: Lluvia prevista a 72h (${rainMmForecast} mm, prob. ${rain72hProb}%). Evitar sobre-hidratación y cracking.`;
        if (cherryAct.mode === 'auto') cherryAct.state = false;
      } else {
        cherryAct.lockoutReason = null;
      }
      changed = true;
    }

    // 3. Cortinas Establo por Viento Puelche
    const barnCurtains = this.get('act_curtains_barn');
    if (barnCurtains) {
      const windSpeed = weatherData?.wind_speed_kmh ?? 24.5;
      if (windSpeed > 22.0) {
        barnCurtains.state = true; // Cerradas para proteger
      } else {
        if (barnCurtains.mode === 'auto') barnCurtains.state = false;
      }
      changed = true;
    }

    if (changed) {
      this.saveState();
      const activeLockouts = this.actuators.filter(a => a.lockoutReason);
      if (activeLockouts.length > 0 && (!this._lastAlertTime || Date.now() - this._lastAlertTime > 60000)) {
        this._lastAlertTime = Date.now();
        const first = activeLockouts[0];
        bus.emit('ui:show_toast', `⚡ Interbloqueo Automático: ${first.name} (${first.lockoutReason.split('.')[0]})`);
      }
      bus.emit('actuators:lockout_changed', {
        lockoutsCount: activeLockouts.length,
        actuators: this.actuators
      });
    }
  }
}

export const actuatorManager = new ActuatorManager();
