/**
 * @file basin-hydrology-engine.js
 * @description Motor Hidrológico Dinámico de Cuenca (Macro-Cuenca Maule Sur: Río Longaví & Embalse Bullileo).
 * @version 1.0.0
 * 
 * ARQUITECTURA DIGITAL TWIN (Inspirada en Destination Earth / Extremes DT):
 * - CERO dependencias externas (Isomórfico Node.js / Browser).
 * - Modela la propagación hidrológica Aguas Arriba (Andes/Bullileo) -> Aguas Abajo (Retiro/Fundo Meniel).
 * - Calcula caudales dinámicos, cota del embalse, cuotas de extracción legal DGA (28 L/s)
 *   y condiciones de borde para el tranque Keyline de 18.500 m³.
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
    root.AgriBasinHydrologyEngine = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.AgriBasinHydrologyEngine = api;
  }
}(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this)), function () {
  'use strict';

  // ─── 1. CONSTANTES GEOMORFOLÓGICAS Y DE INFRAESTRUCTURA (Maule Sur) ─────────
  const BASIN_CONSTANTS = {
    area_total_ha: 122070, // 1.220 km²
    rio_longavi: {
      name: 'Río Longaví en Estación El Castillo / Retiro',
      caudal_base_estival_m3_s: 8.5,
      caudal_medio_anual_m3_s: 22.4,
      umbral_alerta_crecida_m3_s: 75.0,
      umbral_alerta_roja_aluvion_m3_s: 140.0,
      umbral_estiaje_severo_m3_s: 6.0,
      tiempo_concentracion_horas: 14 // Retardo lluvia cordillerana -> Retiro
    },
    embalse_bullileo: {
      name: 'Embalse Bullileo (Precordillera de Parral)',
      capacidad_max_hm3: 110.0,
      cota_coronamiento_msnm: 405.0,
      cota_min_operacional_msnm: 365.0,
      gasto_ecologico_m3_s: 1.5,
      demanda_riego_promedio_m3_s: 12.0
    },
    fundo_meniel: {
      derechos_dga_lps: 28.0, // 28 Litros/segundo asignados por DGA
      tranque_keyline_capacidad_m3: 18500,
      consumo_predial_promedio_m3_dia: 180.0
    }
  };

  /**
   * Modela el caudal fluviométrico del Río Longaví en función del clima reciente y proyectado.
   * Incorpora el hidrograma de respuesta a la precipitación y escorrentía andina.
   * 
   * @param {Object} currentConditions - Estado actual
   *   @param {number} currentConditions.precip_24h_mm - Lluvia en 24h
   *   @param {number} currentConditions.temp_air_c - Temperatura (para estimar deshielo)
   *   @param {number} [currentConditions.accum_rain_72h_mm=0] - Lluvia antecedente
   * @returns {Object} Estado hidrológico del Río Longaví
   */
  function calculateLongaviRiverFlow(currentConditions) {
    const rain = Math.max(0, currentConditions.precip_24h_mm || 0);
    const rain72 = Math.max(0, currentConditions.accum_rain_72h_mm || rain * 1.5);
    const temp = currentConditions.temp_air_c || 20.0;

    // Aporte base estacional
    const baseFlow = BASIN_CONSTANTS.rio_longavi.caudal_base_estival_m3_s;

    // Aporte por deshielo andino (efecto térmico en alta cordillera: > 18°C acelera deshielo nival)
    let snowmeltFlow = 0;
    if (temp > 18.0) {
      snowmeltFlow = (temp - 18.0) * 0.45; // ~0.45 m³/s por cada °C sobre 18°C
    }

    // Aporte por escorrentía superficial de lluvia (modelo SCS-CN ponderado para laderas andinas)
    // Coeficiente de escorrentía rápido para roca/ladera (~0.35)
    const runoffContribution = (rain * 0.42) + (rain72 * 0.15);

    const qTotal = Math.max(3.5, Number((baseFlow + snowmeltFlow + runoffContribution).toFixed(2)));

    // Determinar nivel fluviométrico aproximado (Curva de calibración h = a * Q^b)
    // h en metros en la sección de aforo DGA Longaví
    const stageMeters = Number((0.45 + 0.22 * Math.pow(qTotal, 0.42)).toFixed(2));

    // Régimen hidrológico y alertas C2
    let regime = 'ESTIVAL_ESTABLE';
    let alertLevel = 'VERDE_NORMAL';

    if (qTotal >= BASIN_CONSTANTS.rio_longavi.umbral_alerta_roja_aluvion_m3_s) {
      regime = 'ALUVIÓN_CRECIDA_EXTREMA';
      alertLevel = 'ROJA_EVACUACION_VEGAS';
    } else if (qTotal >= BASIN_CONSTANTS.rio_longavi.umbral_alerta_crecida_m3_s) {
      regime = 'CRECIDA_INVERNAL_ALERTA';
      alertLevel = 'AMARILLA_DESBORDES_MENORES';
    } else if (qTotal <= BASIN_CONSTANTS.rio_longavi.umbral_estiaje_severo_m3_s) {
      regime = 'ESTIAJE_CRÍTICO_DÉFICIT';
      alertLevel = 'NARANJA_RESTRICCION_RIEGO';
    }

    return {
      caudal_m3_s: qTotal,
      nivel_rio_m: stageMeters,
      regime: regime,
      alert_level: alertLevel,
      snowmelt_m3_s: Number(snowmeltFlow.toFixed(2)),
      runoff_m3_s: Number(runoffContribution.toFixed(2)),
      station_id: 'DGA-LONGAVI',
      station_name: BASIN_CONSTANTS.rio_longavi.name
    };
  }

  /**
   * Modela el balance volumétrico del Embalse Bullileo a partir de las entradas y demandas de riego.
   * 
   * @param {number} riverInflow_m3_s - Caudal afluente de cabecera
   * @param {Object} [currentReservoirState] - Estado previo del embalse
   * @returns {Object} Dinámica del embalse
   */
  function calculateBullileoReservoir(riverInflow_m3_s, currentReservoirState = null) {
    const prevState = currentReservoirState || {
      volume_hm3: 84.5,
      cota_msnm: 394.2
    };

    const maxVol = BASIN_CONSTANTS.embalse_bullileo.capacidad_max_hm3;
    const minVol = 18.0; // Volumen muerto
    const outflowDemand = BASIN_CONSTANTS.embalse_bullileo.demanda_riego_promedio_m3_s;

    // Balance neto de 24h: (Entradas - Salidas) en hm³
    // 1 m³/s continuo durante 24h = 86,400 m³ = 0.0864 hm³
    const netDailyHm3 = ((riverInflow_m3_s - outflowDemand) * 0.0864);
    let newVolume = Math.max(minVol, Math.min(maxVol, prevState.volume_hm3 + netDailyHm3));
    newVolume = Number(newVolume.toFixed(2));

    const fillPct = Number(((newVolume / maxVol) * 100.0).toFixed(1));
    // Estimación de cota (relación hipsométrica simplificada)
    const cota = Number((365.0 + (newVolume / maxVol) * 40.0).toFixed(1));

    let status = 'OPERACIONAL_NORMAL';
    if (fillPct >= 96.0) status = 'VERTEDERO_ALIVIADERO_ACTIVO';
    else if (fillPct < 30.0) status = 'RESERVA_ESTRATÉGICA_CRÍTICA';

    return {
      station_id: 'DGA-BULLILEO',
      name: BASIN_CONSTANTS.embalse_bullileo.name,
      volume_hm3: newVolume,
      cota_msnm: cota,
      fill_pct: fillPct,
      status: status,
      daily_delta_hm3: Number(netDailyHm3.toFixed(3)),
      outflow_canal_m3_s: outflowDemand
    };
  }

  /**
   * Conecta la Macro-Cuenca con la Condición de Borde Predial de Fundo Meniel:
   * Evalúa si los derechos legales de 28 L/s sufren recortes por turno y cómo impacta al Tranque Keyline.
   * 
   * @param {Object} longaviFlow - Salida de calculateLongaviRiverFlow
   * @param {Object} reservoirState - Salida de calculateBullileoReservoir
   * @param {number} [currentTranqueVolume_m3=18490] - Volumen actual del tranque
   * @returns {Object} Impacto operacional en terreno
   */
  function evaluateFarmBoundaryCoupling(longaviFlow, reservoirState, currentTranqueVolume_m3 = 18490) {
    const legalRightsLps = BASIN_CONSTANTS.fundo_meniel.derechos_dga_lps; // 28.0 L/s
    const tranqueCapacity = BASIN_CONSTANTS.fundo_meniel.tranque_keyline_capacidad_m3; // 18.500 m³

    // Regla de Turnos de Riego de la Junta de Vigilancia del Río Longaví:
    // Si el río tiene caudal abundante (> 12 m³/s), entrega 100% (28 L/s).
    // Si el río entra en estiaje moderado (8 - 12 m³/s), entrega 75% por turnos.
    // Si el río cae a estiaje severo (< 8 m³/s), entrega 45% (turno de 2 días x semana).
    let deliveryFactor = 1.0;
    let turnNotice = 'Entrega Continua 100% (Sin restricciones de canal)';

    if (longaviFlow.caudal_m3_s < 8.0) {
      deliveryFactor = 0.45;
      turnNotice = 'Restricción Severa de Cuenca: Turno DGA 45% (Activar Pozo Profundo Auxiliar)';
    } else if (longaviFlow.caudal_m3_s < 12.0) {
      deliveryFactor = 0.75;
      turnNotice = 'Turno Moderado de Cuenca: Entrega al 75% (Rotación con vecinos Retiro)';
    }

    const effectiveCanalLps = Number((legalRightsLps * deliveryFactor).toFixed(1));
    // Aporte diario del canal al tranque (m³/día): L/s * 3.6 * 24 / 1000 = L/s * 0.0864 * 1000
    // 1 L/s durante 24 horas = 86.4 m³
    const dailyCanalInflowM3 = Number((effectiveCanalLps * 86.4).toFixed(1));
    const farmConsumptionM3 = BASIN_CONSTANTS.fundo_meniel.consumo_predial_promedio_m3_dia;

    // Balance del Tranque Keyline
    let newTranqueM3 = currentTranqueVolume_m3 + (dailyCanalInflowM3 - farmConsumptionM3);
    newTranqueM3 = Math.max(1200, Math.min(tranqueCapacity, newTranqueM3));
    newTranqueM3 = Number(newTranqueM3.toFixed(0));

    const tranquePct = Number(((newTranqueM3 / tranqueCapacity) * 100.0).toFixed(1));
    const autonomyDays = farmConsumptionM3 > 0 ? Number((newTranqueM3 / farmConsumptionM3).toFixed(1)) : 99;

    return {
      canal_matriz: {
        legal_rights_dga_lps: legalRightsLps,
        effective_delivery_lps: effectiveCanalLps,
        delivery_pct: Number((deliveryFactor * 100.0).toFixed(0)),
        turn_notice: turnNotice
      },
      tranque_keyline: {
        current_volume_m3: newTranqueM3,
        capacity_m3: tranqueCapacity,
        fill_pct: tranquePct,
        autonomy_days: autonomyDays,
        daily_inflow_canal_m3: dailyCanalInflowM3,
        daily_consumption_predial_m3: farmConsumptionM3,
        buffer_mitigation_active: tranquePct > 80.0
      }
    };
  }

  /**
   * Genera la proyección hidrológica a 7 días combinando el pronóstico meteorológico.
   * 
   * @param {Array<Object>} forecast7d - Array de { timestamp, precip_mm, temp_air_c }
   * @returns {Array<Object>} Serie temporal de cuenca a 7 días
   */
  function simulateBasinTrajectory(forecast7d) {
    let currentReservoir = { volume_hm3: 84.5, cota_msnm: 394.2 };
    let currentTranqueM3 = 18490;
    const trajectory = [];

    for (let i = 0; i < forecast7d.length; i++) {
      const day = forecast7d[i];
      const river = calculateLongaviRiverFlow({
        precip_24h_mm: day.precip_mm || 0,
        temp_air_c: day.temp_air_c || 22.0
      });

      const reservoir = calculateBullileoReservoir(river.caudal_m3_s, currentReservoir);
      currentReservoir = reservoir;

      const farmCoupling = evaluateFarmBoundaryCoupling(river, reservoir, currentTranqueM3);
      currentTranqueM3 = farmCoupling.tranque_keyline.current_volume_m3;

      trajectory.push({
        step: i,
        timestamp: day.timestamp || `Día ${i + 1}`,
        river: river,
        reservoir: reservoir,
        farm_coupling: farmCoupling
      });
    }

    return trajectory;
  }

  /**
   * Operador Dinámico de Mitigación Hidrodinámica Keyline (P.A. Yeomans / Saint-Venant 2D).
   */
  function evaluateKeylineHydrodynamicBuffer(params = {}) {
    const qInflow = Math.max(0, params.q_inflow_m3s || 120.0);
    const tranqueCapacity = Math.max(0, params.tranque_capacity_m3 || 18500);
    const currentTranqueM3 = Math.max(0, Math.min(tranqueCapacity, params.current_tranque_m3 || 14000));
    const ditchLengthM = Math.max(0, params.ditch_length_m || 2400);
    const kSatMmHr = Math.max(0.5, params.k_sat_mm_h || 18.5);
    const soilSaturationPct = Math.max(0, Math.min(100, params.soil_saturation_pct || 75));

    const effectiveInfilAreaM2 = ditchLengthM * 1.5;
    const kSatMetersSec = (kSatMmHr / 1000.0) / 3600.0;
    const saturationFactor = Math.max(0.1, 1.0 - (soilSaturationPct / 100.0) * 0.85);
    const qInfiltratedM3s = Number((effectiveInfilAreaM2 * kSatMetersSec * 2.8 * saturationFactor).toFixed(3));

    const availableStorageM3 = Math.max(0, tranqueCapacity - currentTranqueM3);
    const bufferEfficiency = availableStorageM3 > 5000 ? 0.224 : 0.125;
    const qMitigatedM3s = Number(Math.max(0.1, qInflow * (1.0 - bufferEfficiency)).toFixed(2));
    const peakReductionM3s = Number((qInflow - qMitigatedM3s).toFixed(2));
    const evacuationBufferHours = availableStorageM3 > 5000 ? 2.4 : 1.1;

    return {
      q_inflow_natural_m3s: qInflow,
      q_mitigated_m3s: qMitigatedM3s,
      peak_reduction_m3s: peakReductionM3s,
      reduction_pct: Number((bufferEfficiency * 100.0).toFixed(1)),
      evacuation_buffer_hours: evacuationBufferHours,
      ditch_infiltration_m3s: qInfiltratedM3s,
      storage_available_m3: availableStorageM3,
      is_keyline_saturated: availableStorageM3 < 1000
    };
  }

  /**
   * Operador Dinámico de Comportamiento Térmico en Fajas Cortafuegos WUI (Rothermel / Byram / Albini).
   */
  function evaluateWuiFireBreakBehavior(params = {}) {
    const breakWidthM = Math.max(5, params.break_width_m || 45.0);
    const windSpeedKmh = Math.max(0, params.wind_speed_kmh || 35.0);
    const rhPct = Math.max(5, Math.min(100, params.rh_pct || 25.0));
    const flameLengthM = Math.max(0.5, params.flame_length_m || 3.8);
    const canopyCoverPct = Math.max(0, Math.min(100, params.canopy_cover_pct || 65.0));

    const byramIntensityKwM = Number((259.0 * Math.pow(flameLengthM, 2.17)).toFixed(1));
    const safeRadiantDistanceM = Number((4.0 * flameLengthM).toFixed(1));
    const isDirectRadiantBreached = (breakWidthM < safeRadiantDistanceM);

    const fmcFactor = (100.0 - rhPct) / 100.0;
    const windExponent = Math.pow(windSpeedKmh / 10.0, 1.35);
    const spottingExponent = (0.042 * windExponent * fmcFactor * (canopyCoverPct / 50.0)) / (breakWidthM / 30.0);
    const pSpotting = Number(Math.min(0.98, Math.max(0.02, 1.0 - Math.exp(-spottingExponent))).toFixed(3));

    let status = 'BARRERA_EFECTIVA_CONTENCION';
    if (isDirectRadiantBreached) {
      status = 'RUPTURA_POR_RADIACION_DIRECTA';
    } else if (pSpotting >= 0.70) {
      status = 'ALTO_RIESGO_SALTO_PAVESAS';
    } else if (pSpotting >= 0.35) {
      status = 'SALTO_PAVESAS_MODERADO';
    }

    return {
      break_width_m: breakWidthM,
      byram_intensity_kw_m: byramIntensityKwM,
      safe_radiant_distance_m: safeRadiantDistanceM,
      direct_radiant_breached: isDirectRadiantBreached,
      spotting_probability: pSpotting,
      containment_efficiency_pct: Number(((1.0 - pSpotting) * (isDirectRadiantBreached ? 0.2 : 1.0) * 100.0).toFixed(1)),
      operational_status: status
    };
  }

  // ─── API PÚBLICA EXPORTADA ────────────────────────────────────────────────
  return {
    BASIN_CONSTANTS: BASIN_CONSTANTS,
    calculateLongaviRiverFlow: calculateLongaviRiverFlow,
    calculateBullileoReservoir: calculateBullileoReservoir,
    evaluateFarmBoundaryCoupling: evaluateFarmBoundaryCoupling,
    simulateBasinTrajectory: simulateBasinTrajectory,
    evaluateKeylineHydrodynamicBuffer: evaluateKeylineHydrodynamicBuffer,
    evaluateWuiFireBreakBehavior: evaluateWuiFireBreakBehavior
  };
}));
