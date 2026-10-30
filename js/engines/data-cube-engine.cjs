/**
 * @file data-cube-engine.js
 * @description Motor de Cubo de Datos Espaciotemporal Multidimensional (4D Tensor & Polytope-Style Feature Slicer).
 * @version 1.0.0
 * 
 * ARQUITECTURA DIGITAL TWIN (Inspirada en Destination Earth / Polytope & Zarr):
 * - Fusión unificada en un tensor 4D de:
 *   1. Teledetección Satelital Superficial (STAC / Sentinel-2).
 *   2. Estratigrafía y Balance Biofísico Radicular (FAO-56 / soil-water-engine).
 *   3. Forzamiento de Cuenca e Hidrología Fluvial (basin-hydrology-engine).
 * - Dimensiones ortogonales: Espacio (Cuartel) × Estrato (Profundidad) × Tiempo (7 Días) × Variables Biofísicas.
 * - Motor de corte geométrico (Slicing): permite extraer sub-cubos y mapas espaciales en O(1) tiempo constante.
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
    root.AgriDataCubeEngine = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.AgriDataCubeEngine = api;
  }
}(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this)), function () {
  'use strict';

  // ─── 1. DEFINICIÓN DE DIMENSIONES DEL CUBO AGRITWIN ────────────────────────
  const CUBE_DIMENSIONS = {
    spatial: ['CROP-AVE-01', 'CROP-VIN-01', 'CROP-CER-01', 'PRADERA-PRV', 'TRANQUE-COLLIGUAY'],
    strata: ['canopy_surface', 'root_shallow_20cm', 'root_mid_60cm', 'subsoil_100cm', 'phreatic_aquifer'],
    temporal_steps: 7, // Días proyectados T0 a T+6
    variables: [
      'vwc_percent',          // Humedad volumétrica de suelo (%)
      'ks_stress_factor',     // Factor de reducción de estrés de cultivo (0.0 a 1.0)
      'temp_c',               // Temperatura (°C)
      'spectral_ndvi',        // Vigor fotosintético (Sentinel-2)
      'spectral_ndmi',        // Estrés hídrico foliar (Sentinel-2)
      'irrigation_quota_mm',  // Riego recibido (mm)
      'deep_drainage_mm'      // Percolación / recarga de napa (mm)
    ]
  };

  /**
   * Construye y fusiona el Cubo 4D completo combinando Satélite + Suelo FAO-56 + Cuenca.
   * 
   * @param {Object} context
   *   @param {Object} context.soilEngine - Instancia de AgriSoilWaterEngine
   *   @param {Object} context.stacClient - Instancia de AgriStacClient
   *   @param {Object} context.basinEngine - Instancia de AgriBasinHydrologyEngine
   *   @param {Array<Object>} [context.forcing7d] - Serie climática de 7 días
   *   @param {string} [context.scenarioKey='baseline'] - Escenario a proyectar
   * @returns {Object} Cubo de datos tensorizado con metadatos y métodos de consulta
   */
  function buildFarmDataCube(context = {}) {
    const SoilEngine = context.soilEngine || (typeof AgriSoilWaterEngine !== 'undefined' ? AgriSoilWaterEngine : null);
    const StacClient = context.stacClient || (typeof AgriStacClient !== 'undefined' ? AgriStacClient : null);
    const BasinEngine = context.basinEngine || (typeof AgriBasinHydrologyEngine !== 'undefined' ? AgriBasinHydrologyEngine : null);

    const scenarioKey = context.scenarioKey || 'baseline';
    const forcing = context.forcing7d || [
      { timestamp: 'Hoy (T0)', et0_mm: 5.2, precip_mm: 0, temp_air_c: 22.0 },
      { timestamp: '+1D', et0_mm: 5.6, precip_mm: 0, temp_air_c: 23.5 },
      { timestamp: '+2D', et0_mm: 6.0, precip_mm: 0, temp_air_c: 24.8 },
      { timestamp: '+3D', et0_mm: 6.8, precip_mm: 0, temp_air_c: 27.2 },
      { timestamp: '+4D', et0_mm: 7.0, precip_mm: 0, temp_air_c: 28.0 },
      { timestamp: '+5D', et0_mm: 6.2, precip_mm: 0, temp_air_c: 25.0 },
      { timestamp: '+6D', et0_mm: 5.5, precip_mm: 0, temp_air_c: 22.5 }
    ];

    // 1. Obtener la capa satelital STAC superficial
    const spectralSummary = StacClient ? StacClient.getPaddocksSpectralSummary() : null;

    // 2. Obtener la capa hidrológica de cuenca (Condiciones de borde)
    const basinSeries = BasinEngine ? BasinEngine.simulateBasinTrajectory(forcing) : [];

    // Estructura interna de almacenamiento tensorizado (Data Store)
    const tensorData = {};

    CUBE_DIMENSIONS.spatial.forEach(paddockId => {
      tensorData[paddockId] = {};
      
      const paddockSpectral = spectralSummary?.paddocks?.[paddockId]?.indices || {
        ndvi: 0.78, ndmi: 0.45, ndwi: -0.70
      };

      // Si es el tranque, el comportamiento es de masa de agua libre
      const isTranque = paddockId === 'TRANQUE-COLLIGUAY';

      // Simulación de suelo FAO-56 para el cuartel
      let soilTrajectory = [];
      let capacity = null;

      if (!isTranque && SoilEngine) {
        capacity = SoilEngine.calculateHydraulicCapacity('franco_arcilloso', paddockId);
        const s0 = SoilEngine.createInitialState(paddockId === 'CROP-VIN-01' ? 29.0 : 34.0, capacity);
        
        const irrigationMm = scenarioKey === 'pump_failure' ? 0 : (scenarioKey === 'deficit_rdi' ? 2.8 : 5.5);
        const simForcing = forcing.map((f, i) => ({
          ...f,
          irrigation_mm: (scenarioKey === 'pump_failure' && i >= 2) ? 0 : irrigationMm
        }));

        soilTrajectory = SoilEngine.simulateSeries(s0, simForcing, capacity);
      }

      CUBE_DIMENSIONS.strata.forEach(stratum => {
        tensorData[paddockId][stratum] = [];

        for (let t = 0; t < CUBE_DIMENSIONS.temporal_steps; t++) {
          const stepClimate = forcing[t] || {};
          const soilStep = soilTrajectory[t] || {};
          const basinStep = basinSeries[t] || {};

          let vwc = 34.0;
          let ks = 1.0;
          let temp = stepClimate.temp_air_c || 22.0;
          let drainage = 0;
          let irrig = soilStep.irrigation_applied_mm || 0;

          if (isTranque) {
            vwc = 100.0;
            ks = 1.0;
            temp = temp - 4.5; // Inercia térmica del tranque
          } else if (stratum === 'canopy_surface') {
            vwc = Number((paddockSpectral.ndmi * 60.0).toFixed(1)); // Proximal a contenido de agua foliar
            ks = soilStep.ks_stress_factor ?? 1.0;
            temp = temp + 1.2;
          } else if (stratum === 'root_shallow_20cm') {
            vwc = soilStep.vwc_percent ?? 34.0;
            ks = soilStep.ks_stress_factor ?? 1.0;
            temp = temp - 2.0;
          } else if (stratum === 'root_mid_60cm') {
            vwc = Number(((soilStep.vwc_percent ?? 34.0) * 0.92).toFixed(1));
            ks = soilStep.ks_stress_factor ?? 1.0;
            temp = temp - 4.0;
          } else if (stratum === 'subsoil_100cm') {
            vwc = Number(((soilStep.vwc_percent ?? 34.0) * 1.12).toFixed(1));
            drainage = soilStep.deep_drainage_mm || 0;
            temp = 14.5; // Temperatura geotérmica estable
          } else if (stratum === 'phreatic_aquifer') {
            vwc = 44.0; // Saturación aluvial
            temp = 13.0;
          }

          tensorData[paddockId][stratum].push({
            t: t,
            timestamp: stepClimate.timestamp || `Día ${t}`,
            vwc_percent: Number(vwc.toFixed(1)),
            ks_stress_factor: Number(ks.toFixed(2)),
            temp_c: Number(temp.toFixed(1)),
            spectral_ndvi: paddockSpectral.ndvi,
            spectral_ndmi: paddockSpectral.ndmi,
            irrigation_quota_mm: irrig,
            deep_drainage_mm: drainage,
            river_flow_m3_s: basinStep.river?.caudal_m3_s || 8.5
          });
        }
      });
    });

    return {
      type: 'AgriTwin_4D_Spatiotemporal_Cube',
      version: '1.0.0',
      created_at: new Date().toISOString(),
      scenario: scenarioKey,
      dimensions: CUBE_DIMENSIONS,
      data: tensorData,
      metadata: {
        farm: 'Fundo Meniel (Retiro)',
        area_ha: 24.8,
        stac_scene: spectralSummary?.scene_id || 'S2B_LATEST',
        basin_engine: 'AgriBasinHydrologyEngine v1.0.0'
      }
    };
  }

  /**
   * Operación de corte geométrico estilo Polytope (Slicing):
   * Permite fijar dimensiones y extraer la proyección deseada en O(1).
   * 
   * @param {Object} cube - Objeto retornado por buildFarmDataCube
   * @param {Object} query - Criterios de corte
   *   @param {string} [query.paddock] - Cuartel específico
   *   @param {string} [query.stratum] - Estrato de profundidad específico
   *   @param {number} [query.time] - Paso temporal específico (0 a 6)
   *   @param {string} [query.variable='vwc_percent'] - Variable a extraer
   * @returns {Object} Sub-cubo o matriz resultante
   */
  function slice(cube, query = {}) {
    if (!cube || !cube.data) return null;
    const variable = query.variable || 'vwc_percent';

    // CASO 1: Corte Espacial (Mapa 2D de todo el predio para un Día y Estrato fijos)
    // Retorna { [paddockId]: value }
    if (query.time !== undefined && query.stratum) {
      const spatialMap = {};
      CUBE_DIMENSIONS.spatial.forEach(pId => {
        const cell = cube.data[pId]?.[query.stratum]?.[query.time];
        spatialMap[pId] = cell ? cell[variable] : null;
      });
      return {
        slice_type: 'SPATIAL_MAP_2D',
        time_step: query.time,
        stratum: query.stratum,
        variable: variable,
        values: spatialMap
      };
    }

    // CASO 2: Corte Estratigráfico (Matriz Profundidad × Tiempo para un Cuartel fijo)
    // Ideal para gráficos de perfiles de suelo y dashboards
    if (query.paddock && !query.stratum && query.time === undefined) {
      const matrix = {};
      CUBE_DIMENSIONS.strata.forEach(st => {
        matrix[st] = cube.data[query.paddock]?.[st]?.map(cell => ({
          t: cell.t,
          timestamp: cell.timestamp,
          val: cell[variable]
        })) || [];
      });
      return {
        slice_type: 'STRATIGRAPHIC_TIME_MATRIX',
        paddock: query.paddock,
        variable: variable,
        matrix: matrix
      };
    }

    // CASO 3: Trayectoria Temporal Unidimensional (Serie 1D para un punto del cubo)
    if (query.paddock && query.stratum) {
      const trajectory = cube.data[query.paddock]?.[query.stratum]?.map(cell => ({
        t: cell.t,
        timestamp: cell.timestamp,
        val: cell[variable]
      })) || [];
      return {
        slice_type: 'TIME_SERIES_1D',
        paddock: query.paddock,
        stratum: query.stratum,
        variable: variable,
        series: trajectory
      };
    }

    return { error: 'Consulta de corte no válida. Especifique paddock, stratum o time.' };
  }

  // ─── API PÚBLICA EXPORTADA ────────────────────────────────────────────────
  return {
    CUBE_DIMENSIONS: CUBE_DIMENSIONS,
    buildFarmDataCube: buildFarmDataCube,
    slice: slice
  };
}));
