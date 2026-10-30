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

  // ─── API PÚBLICA EXPORTADA ────────────────────────────────────────────────
  return {
    BASIN_CONSTANTS: BASIN_CONSTANTS,
    calculateLongaviRiverFlow: calculateLongaviRiverFlow,
    calculateBullileoReservoir: calculateBullileoReservoir,
    evaluateFarmBoundaryCoupling: evaluateFarmBoundaryCoupling,
    simulateBasinTrajectory: simulateBasinTrajectory
  };
}));
