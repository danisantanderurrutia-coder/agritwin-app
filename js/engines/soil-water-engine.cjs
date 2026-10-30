/**
 * @file soil-water-engine.js
 * @description Motor Biofísico Desacoplado de Balance Hídrico y Dinámica de Suelo (FAO-56 Dual/Single + Bucket Model).
 * @version 1.0.0
 * 
 * ARQUITECTURA DIGITAL TWIN (Inspirada en Destination Earth):
 * - CERO dependencias del DOM, Three.js, Leaflet o librerías externas.
 * - Isomórfico: Funciona en Node.js (CommonJS/ESM) y en el navegador (Window global).
 * - Núcleo matemático puro y determinista: Estado(T+1) = f(Estado(T), Forzamiento, Parámetros).
 * - Soporte nativo para bifurcación de escenarios What-If y asimilación de datos de sensores (FDR).
 */

(function (root, factory) {
  const api = factory();
  if (typeof exports === 'object') {
    Object.assign(exports, api);
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = api;
    }
  }
  if (typeof define === 'function' && define.amd) {
    define([], function () { return api; });
  }
  if (typeof root !== 'undefined') {
    root.AgriSoilWaterEngine = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.AgriSoilWaterEngine = api;
  }
}(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this)), function () {
  'use strict';

  // ─── 1. BASE DE DATOS EDAFOLÓGICA (Propiedades Hídricas Típicas) ─────────
  // Texturas de suelo con:
  // theta_fc: Capacidad de Campo (% VWC / m³·m⁻³)
  // theta_wp: Punto de Marchitez Permanente (% VWC)
  // theta_sat: Porosidad / Saturación (% VWC)
  // k_sat_mm_day: Conductividad hidráulica saturada (mm/día)
  const SOIL_TEXTURE_PROFILES = {
    franco_arcilloso: {
      name: 'Franco Arcilloso (Maule Sur / Valle Central)',
      theta_fc: 0.34,
      theta_wp: 0.18,
      theta_sat: 0.47,
      k_sat_mm_day: 120.0,
      cr_factor: 1.2 // Coeficiente de ascenso capilar potencial
    },
    franco: {
      name: 'Franco Aluvial Clásico',
      theta_fc: 0.28,
      theta_wp: 0.13,
      theta_sat: 0.45,
      k_sat_mm_day: 250.0,
      cr_factor: 1.0
    },
    franco_arenoso: {
      name: 'Franco Arenoso (Terrazas Fluviales)',
      theta_fc: 0.22,
      theta_wp: 0.09,
      theta_sat: 0.42,
      k_sat_mm_day: 500.0,
      cr_factor: 0.6
    },
    arcillo_limoso: {
      name: 'Arcillo Limoso (Planicies de Inundación / Tranque)',
      theta_fc: 0.38,
      theta_wp: 0.22,
      theta_sat: 0.50,
      k_sat_mm_day: 40.0,
      cr_factor: 1.5
    }
  };

  // ─── 2. PERFILES DE CULTIVO (Parámetros FAO-56 de Fundo Meniel) ──────────
  // z_r: Profundidad radicular efectiva de absorción (metros)
  // p_depletion: Fracción de agotamiento permisible sin estrés (RAW/TAW)
  // kc_stages: Coeficientes de cultivo por etapa fenológica (ini, mid, end)
  const CROP_PROFILES = {
    'CROP-AVE-01': {
      name: 'Avellano Europeo (Corylus avellana)',
      z_r: 0.65,
      p_depletion: 0.45, // Sensible a estrés en llenado de fruto
      kc: 0.85,
      kc_stages: { ini: 0.45, mid: 0.95, end: 0.65 },
      critical_stress_threshold: 0.22 // VWC crítico (% de alarma)
    },
    'CROP-VIN-01': {
      name: 'Viñedo Patrimonial País & Carignan',
      z_r: 0.80, // Raíces profundas en secano interior
      p_depletion: 0.60, // Tolerante a estrés controlado (RDI)
      kc: 0.60,
      kc_stages: { ini: 0.30, mid: 0.70, end: 0.40 },
      critical_stress_threshold: 0.16
    },
    'CROP-CER-01': {
      name: 'Cerezos Lapins (Prunus avium)',
      z_r: 0.55,
      p_depletion: 0.40, // Alta exigencia de agua en calibre
      kc: 0.90,
      kc_stages: { ini: 0.45, mid: 1.05, end: 0.70 },
      critical_stress_threshold: 0.24
    },
    'PRADERA-PRV': {
      name: 'Pradera Mixta Trébol Festuca (PRV)',
      z_r: 0.30,
      p_depletion: 0.50,
      kc: 0.95,
      kc_stages: { ini: 0.70, mid: 1.00, end: 0.85 },
      critical_stress_threshold: 0.18
    }
  };

  /**
   * Calcula los parámetros estáticos de retención de humedad para una combinación de suelo y cultivo.
   * 
   * @param {Object} soil - Configuración de suelo o key de SOIL_TEXTURE_PROFILES
   * @param {Object} crop - Configuración de cultivo o key de CROP_PROFILES
   * @returns {Object} Constantes hidráulicas del perfil
   */
  function calculateHydraulicCapacity(soil, crop) {
    const s = typeof soil === 'string' ? (SOIL_TEXTURE_PROFILES[soil] || SOIL_TEXTURE_PROFILES.franco_arcilloso) : soil;
    const c = typeof crop === 'string' ? (CROP_PROFILES[crop] || CROP_PROFILES['CROP-AVE-01']) : crop;

    const z_r = c.z_r || 0.60; // Metros
    const p = c.p_depletion || 0.50;

    // TAW (Total Available Water / Agua Total Disponible en zona de raíces, mm)
    // TAW = 1000 * (theta_fc - theta_wp) * z_r
    const taw_mm = 1000.0 * (s.theta_fc - s.theta_wp) * z_r;

    // RAW (Readily Available Water / Agua Fácilmente Aprovechable sin estrés, mm)
    const raw_mm = p * taw_mm;

    // Capacidad volumétrica máxima de retención saturada (mm)
    const sat_capacity_mm = 1000.0 * s.theta_sat * z_r;
    // Capacidad a Capacidad de Campo (mm)
    const fc_capacity_mm = 1000.0 * s.theta_fc * z_r;
    // Capacidad a Punto de Marchitez (mm)
    const wp_capacity_mm = 1000.0 * s.theta_wp * z_r;

    return {
      soil: s,
      crop: c,
      z_r_m: z_r,
      p_fraction: p,
      taw_mm: Math.max(0.1, Number(taw_mm.toFixed(2))),
      raw_mm: Math.max(0.1, Number(raw_mm.toFixed(2))),
      fc_capacity_mm: Number(fc_capacity_mm.toFixed(2)),
      wp_capacity_mm: Number(wp_capacity_mm.toFixed(2)),
      sat_capacity_mm: Number(sat_capacity_mm.toFixed(2))
    };
  }

  /**
   * Inicializa un estado de suelo a partir de una lectura de sensor real o supuesta (VWC %).
   * 
   * @param {number} vwc_percent - Humedad volumétrica actual (ej. 34.5%)
   * @param {Object} capacity - Retorno de calculateHydraulicCapacity
   * @returns {Object} Estado biofísico inicial en T=0
   */
  function createInitialState(vwc_percent, capacity) {
    const theta = Math.max(0.01, Math.min(0.60, vwc_percent > 1 ? vwc_percent / 100.0 : vwc_percent));
    const current_water_mm = 1000.0 * theta * capacity.z_r_m;

    // Agotamiento radicular actual (Dr, mm) respecto a Capacidad de Campo
    // Si el suelo está sobre Capacidad de Campo, Dr = 0
    let dr_mm = (capacity.soil.theta_fc - theta) * 1000.0 * capacity.z_r_m;
    if (dr_mm < 0) dr_mm = 0; // Agua gravitacional temporal

    return {
      t: 0,
      timestamp: new Date().toISOString(),
      vwc_fraction: Number(theta.toFixed(4)),
      vwc_percent: Number((theta * 100.0).toFixed(2)),
      water_storage_mm: Number(current_water_mm.toFixed(2)),
      dr_depletion_mm: Number(dr_mm.toFixed(2)),
      ks_stress_factor: calculateStressFactor(dr_mm, capacity),
      stress_level: getStressLabel(theta, capacity),
      deep_drainage_mm: 0,
      runoff_mm: 0,
      etc_adj_mm: 0
    };
  }

  /**
   * Coeficiente de reducción de estrés hídrico según FAO-56 (Ks).
   * Ks = 1 cuando Dr <= RAW (sin estrés).
   * Ks disminuye linealmente a 0 cuando Dr va desde RAW hasta TAW.
   */
  function calculateStressFactor(dr_mm, capacity) {
    const taw = capacity.taw_mm;
    const raw = capacity.raw_mm;

    if (dr_mm <= raw) return 1.0;
    if (dr_mm >= taw) return 0.0;
    return Math.max(0.0, Math.min(1.0, (taw - dr_mm) / (taw - raw)));
  }

  function getStressLabel(theta, capacity) {
    if (theta > capacity.soil.theta_fc) return 'SATURADO_ANÓXICO';
    if (theta >= capacity.soil.theta_fc * 0.90) return 'ÓPTIMO_CAPACIDAD_CAMPO';
    if (theta >= capacity.soil.theta_wp + ((capacity.soil.theta_fc - capacity.soil.theta_wp) * (1 - capacity.p_fraction))) {
      return 'CONFORT_HÍDRICO';
    }
    if (theta > capacity.soil.theta_wp) return 'ESTRÉS_HÍDRICO_ACTIVO';
    return 'MARCHITEZ_PERMANENTE';
  }

  /**
   * Ejecuta un paso de tiempo (t -> t+1), típicamente 1 día o 1 hora.
   * Es una función pura y determinista.
   * 
   * @param {Object} prevState - Estado al inicio del paso
   * @param {Object} forcing - Variables forzantes del paso
   *   @param {number} forcing.et0_mm - Evapotranspiración de referencia Penman-Monteith (mm)
   *   @param {number} forcing.precip_mm - Lluvia (mm)
   *   @param {number} forcing.irrigation_mm - Riego aplicado en el paso (mm)
   *   @param {number} [forcing.kc_override] - Factor Kc específico para este paso
   * @param {Object} capacity - Constantes hidráulicas de calculateHydraulicCapacity
   * @returns {Object} Nuevo estado biofísico en t+1
   */
  function step(prevState, forcing, capacity) {
    const et0 = Math.max(0, forcing.et0_mm || 0);
    const precip = Math.max(0, forcing.precip_mm || 0);
    const irrigation = Math.max(0, forcing.irrigation_mm || 0);
    const kc = forcing.kc_override !== undefined ? forcing.kc_override : (capacity.crop.kc || 0.85);

    // 1. Estimar Ks basado en el agotamiento anterior
    const ks = calculateStressFactor(prevState.dr_depletion_mm, capacity);

    // 2. Evapotranspiración real ajustada del cultivo (ETc adj, mm)
    const etc_adj = Number((ks * kc * et0).toFixed(2));

    // 3. Infiltración y escorrentía superficial
    // Si la lluvia + riego excede la conductividad de saturación diaria, genera escorrentía
    const water_input = precip + irrigation;
    let effective_input = water_input;
    let runoff_mm = 0;

    const max_daily_intake = capacity.soil.k_sat_mm_day || 150.0;
    if (water_input > max_daily_intake) {
      runoff_mm = water_input - max_daily_intake;
      effective_input = max_daily_intake;
    }

    // 4. Actualización del Balance Hídrico (Ecuación de continuidad FAO-56):
    // Dr(t) = Dr(t-1) - Infiltración + ETc_adj
    let new_dr = prevState.dr_depletion_mm - effective_input + etc_adj;
    let deep_drainage_mm = 0;

    // Si new_dr < 0, significa que el suelo se llenó por encima de Capacidad de Campo.
    // El agua en exceso drena hacia el acuífero profundo / napa freática (percolación profunda).
    if (new_dr < 0) {
      deep_drainage_mm = Math.abs(new_dr);
      new_dr = 0; // El suelo queda a Capacidad de Campo
    }

    // El agotamiento no puede exceder el TAW total más el punto seco absoluto
    const max_depletion = capacity.taw_mm + (capacity.wp_capacity_mm * 0.5);
    if (new_dr > max_depletion) {
      new_dr = max_depletion;
    }

    // 5. Convertir nuevo Dr a humedad volumétrica (VWC %)
    // theta = theta_fc - (Dr / (1000 * Zr))
    let new_theta = capacity.soil.theta_fc - (new_dr / (1000.0 * capacity.z_r_m));
    if (new_theta < 0.02) new_theta = 0.02;

    const new_water_storage = 1000.0 * new_theta * capacity.z_r_m;
    const new_ks = calculateStressFactor(new_dr, capacity);

    return {
      t: prevState.t + 1,
      timestamp: forcing.timestamp || null,
      vwc_fraction: Number(new_theta.toFixed(4)),
      vwc_percent: Number((new_theta * 100.0).toFixed(2)),
      water_storage_mm: Number(new_water_storage.toFixed(2)),
      dr_depletion_mm: Number(new_dr.toFixed(2)),
      ks_stress_factor: Number(new_ks.toFixed(3)),
      stress_level: getStressLabel(new_theta, capacity),
      etc_adj_mm: etc_adj,
      irrigation_applied_mm: irrigation,
      precip_effective_mm: effective_input - irrigation,
      runoff_mm: Number(runoff_mm.toFixed(2)),
      deep_drainage_mm: Number(deep_drainage_mm.toFixed(2))
    };
  }

  /**
   * Ejecuta una serie temporal completa hacia adelante en el tiempo (Forward Simulation).
   * 
   * @param {Object} initialState - Estado en T=0
   * @param {Array<Object>} forcingSeries - Lista de pasos forzantes (ET0, lluvia, riego proyectados)
   * @param {Object} capacity - Constantes hidráulicas
   * @returns {Array<Object>} Trayectoria temporal completa [Estado(0), Estado(1), ..., Estado(N)]
   */
  function simulateSeries(initialState, forcingSeries, capacity) {
    const trajectory = [initialState];
    let currentState = initialState;

    for (let i = 0; i < forcingSeries.length; i++) {
      const nextState = step(currentState, forcingSeries[i], capacity);
      trajectory.push(nextState);
      currentState = nextState;
    }

    return trajectory;
  }

  /**
   * Ejecuta múltiples ramas de escenarios ("What-If") a partir del mismo snapshot inicial T=0.
   * 
   * @param {Object} initialState - Estado inmutable de los sensores en T=0
   * @param {Array<Object>} baseClimate - Serie climática base (ej. pronóstico DestinE a 7 días)
   * @param {Object} scenarioModifiers - Diccionario de escenarios { [scenarioKey]: modifierFn }
   * @param {Object} capacity - Constantes hidráulicas
   * @returns {Object} Diccionario con las trayectorias de cada escenario
   */
  function simulateScenarios(initialState, baseClimate, scenarioModifiers, capacity) {
    const results = {};

    Object.keys(scenarioModifiers).forEach(key => {
      const item = scenarioModifiers[key];
      const modifierFn = typeof item === 'function' ? item : (item.modifier || item.fn || (s => s));
      const scenarioName = typeof item === 'object' && item.name ? item.name : key;
      const scenarioDesc = typeof item === 'object' && item.description ? item.description : '';

      // Aplicar el modificador a cada paso de la serie base
      const customizedForcing = baseClimate.map((stepData, idx) => {
        return modifierFn(Object.assign({}, stepData), idx);
      });

      results[key] = {
        name: scenarioName,
        description: scenarioDesc,
        trajectory: simulateSeries(initialState, customizedForcing, capacity)
      };
    });

    return results;
  }

  /**
   * Asimilación de Datos (Data Assimilation / Nudging):
   * Compara la predicción del modelo con la observación real de la sonda FDR
   * y calcula la corrección de sesgo para calibrar parámetros del suelo o el estado.
   * 
   * @param {Object} predictedState - Estado predicho por el motor para el tiempo T
   * @param {number} observedVwcPercent - Lectura real de la sonda FDR en tiempo T (ej. 31.8%)
   * @param {Object} capacity - Constantes hidráulicas actuales
   * @param {number} [learningRate=0.25] - Peso de corrección (0 a 1)
   * @returns {Object} Diagnóstico de discrepancia y estado corregido
   */
  function assimilateObservation(predictedState, observedVwcPercent, capacity, learningRate = 0.25) {
    const obs_fraction = observedVwcPercent > 1 ? observedVwcPercent / 100.0 : observedVwcPercent;
    const error_vwc = obs_fraction - predictedState.vwc_fraction;

    // Estado corregido aplicando nudging proporcional
    const corrected_vwc = predictedState.vwc_fraction + (learningRate * error_vwc);
    const corrected_state = createInitialState(corrected_vwc * 100.0, capacity);
    corrected_state.t = predictedState.t;
    corrected_state.timestamp = predictedState.timestamp;

    return {
      time: predictedState.t,
      predicted_vwc_percent: predictedState.vwc_percent,
      observed_vwc_percent: Number((obs_fraction * 100.0).toFixed(2)),
      residual_error_pct: Number((error_vwc * 100.0).toFixed(2)),
      drift_alert: Math.abs(error_vwc) > 0.05 ? 'ALTA_DESVIACIÓN_RECALIBRAR' : 'DENTRO_DE_TOLERANCIA',
      corrected_state: corrected_state,
      suggested_action: error_vwc < -0.04 
        ? 'El suelo retiene menos agua de lo modelado: revisar textura o drenaje profundo.' 
        : (error_vwc > 0.04 ? 'Mayor humedad de la prevista: posible ascenso freático o riego no computado.' : 'Modelo en sintonía con terreno.')
    };
  }

  // ─── API PÚBLICA EXPORTADA ────────────────────────────────────────────────
  return {
    SOIL_TEXTURE_PROFILES: SOIL_TEXTURE_PROFILES,
    CROP_PROFILES: CROP_PROFILES,
    calculateHydraulicCapacity: calculateHydraulicCapacity,
    createInitialState: createInitialState,
    calculateStressFactor: calculateStressFactor,
    step: step,
    simulateSeries: simulateSeries,
    simulateScenarios: simulateScenarios,
    assimilateObservation: assimilateObservation
  };
}));
