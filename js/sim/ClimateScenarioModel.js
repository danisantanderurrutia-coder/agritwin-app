/**
 * AgriTwin - ClimateScenarioModel Module
 * 
 * Defines the 8 Core Climate Moments / Scenarios for Basin & Farm modeling:
 *  1. CURRENT_LIVE       - Calibrated / Real-time baseline
 *  2. SUMMER_NORMAL      - Standard Mediterranean summer
 *  3. HEATWAVE_ONLY      - High temperature spike, moderate wind
 *  4. DROUGHT_ONLY       - Multi-year La Niña soil & aquifer depletion
 *  5. COMPOUND_EXTREME   - Megadrought + Heatwave + Catabatic Puelche wind (Fire alert)
 *  6. WINTER_DRY         - Cold, clear skies, snowpack deficit, frost risk
 *  7. WINTER_RAINY_T10   - Ordinary winter storm (65 mm, normal 0°C isotherm)
 *  8. ATMOSPHERIC_RIVER  - Catastrophic T=100 storm (140 mm, warm 0°C isotherm at 3400m)
 */

import { WildfireRiskModel } from './WildfireRiskModel.js?v=3.0.0';

export class ClimateScenarioModel {
  static SCENARIOS = {
    'CURRENT_LIVE': {
      id: 'CURRENT_LIVE',
      name: 'Momento Actual / Calibrado',
      category: 'baseline',
      badge: 'En Vivo',
      badgeColor: '#10b981',
      description: 'Condiciones de régimen equilibrado. Caudal base y balance hídrico bajo parámetros normales.',
      weather: {
        temp: 24.5,
        rh: 42,
        windSpeed: 14,
        windDirection: 220, // SW (Brisa marina diurna)
        windGusts: 18,
        pressure: 1014,
        precip24h: 0,
        isothermZeroM: 2600,
        month: 1
      },
      hydrology: {
        floodElevation: -10.0, // Bajo el lecho
        flowRateM3s: 124.5,
        aquiferDepletionM: 0.0,
        aquiferStress: false
      },
      advisorDirectives: {
        geografo: 'Caudal matriz del Río Longaví en rango óptimo. Bocatomas operando al 100%.',
        meteorologa: 'Brisa de valle sin ráfagas de riesgo. FWI bajo control.',
        biologo: 'Corredor ripario turgente con alta capacidad amortiguadora.'
      }
    },

    'SUMMER_NORMAL': {
      id: 'SUMMER_NORMAL',
      name: 'Verano Normal (Régimen Base)',
      category: 'summer',
      badge: 'Base Estival',
      badgeColor: '#38bdf8',
      description: 'Verano mediterráneo típico con alta insolación, brisa vespertina del SW y riego programado.',
      weather: {
        temp: 28.0,
        rh: 35,
        windSpeed: 18,
        windDirection: 225, // SW
        windGusts: 24,
        pressure: 1013,
        precip24h: 0,
        isothermZeroM: 3000,
        month: 1
      },
      hydrology: {
        floodElevation: -10.0,
        flowRateM3s: 110.0,
        aquiferDepletionM: -2.5,
        aquiferStress: false
      },
      advisorDirectives: {
        geografo: 'Aforo en canales estable. Embalse Bullileo con 78% de llenado.',
        meteorologa: 'Evapotranspiración ET0 en 5.2 mm/día. Turno de riego Voisin regular.',
        biologo: 'Fauna activa en el dosel esclerófilo. Cobertura de sombra efectiva.'
      }
    },

    'HEATWAVE_ONLY': {
      id: 'HEATWAVE_ONLY',
      name: 'Solo Ola de Calor (Sin Puelche)',
      category: 'summer',
      badge: 'Térmico',
      badgeColor: '#f59e0b',
      description: 'Pico térmico extremo (>36°C) por bloqueo anticiclónico, pero con viento moderado sin efecto Foehn.',
      weather: {
        temp: 37.2,
        rh: 21,
        windSpeed: 10,
        windDirection: 190, // S-SW
        windGusts: 15,
        pressure: 1016,
        precip24h: 0,
        isothermZeroM: 3600,
        month: 1
      },
      hydrology: {
        floodElevation: -10.0,
        flowRateM3s: 95.0,
        aquiferDepletionM: -4.0,
        aquiferStress: false
      },
      advisorDirectives: {
        geografo: 'Mayor consumo hídrico por estrés térmico. Caudal de riego bajo demanda máxima.',
        meteorologa: 'Estrés CWSI > 0.65. Activar microaspersión para evitar golpe de sol en fruta.',
        biologo: 'Dispersión de aves hacia charcas del estero. Mantener agua viva en abrevaderos.'
      }
    },

    'DROUGHT_ONLY': {
      id: 'DROUGHT_ONLY',
      name: 'Solo Megasequía (La Niña Prolongada)',
      category: 'drought',
      badge: 'Déficit -45%',
      badgeColor: '#eab308',
      description: 'Déficit pluviométrico y nival acumulado. Napa freática deprimida a más de 11 metros de profundidad.',
      weather: {
        temp: 26.5,
        rh: 30,
        windSpeed: 14,
        windDirection: 210,
        windGusts: 20,
        pressure: 1015,
        precip24h: 0,
        isothermZeroM: 2800,
        month: 2
      },
      hydrology: {
        floodElevation: -10.0,
        flowRateM3s: 48.0,
        aquiferDepletionM: -11.2,
        aquiferStress: true
      },
      advisorDirectives: {
        geografo: 'Alerta DGA: Pozos en cota crítica. Activar distribución por turnos estrictos.',
        meteorologa: 'Drought Code (DC) supera 420. Suelo orgánico profundo completamente deshidratado.',
        biologo: 'Proteger vertientes nativas en fondos de quebrada para salvar bancos de semillas.'
      }
    },

    'COMPOUND_EXTREME': {
      id: 'COMPOUND_EXTREME',
      name: 'Megasequía + Ola de Calor + Viento Puelche',
      category: 'extreme_fire',
      badge: 'ALERTA ROJA FWI',
      badgeColor: '#ef4444',
      description: 'El peor escenario de piro-riesgo: masa de aire catabática Foehn desde los Andes, ráfagas >60 km/h y HR < 10%.',
      weather: {
        temp: 39.5,
        rh: 9,
        windSpeed: 38,
        windDirection: 65, // E-NE (Viento Puelche / Raco)
        windGusts: 64,
        pressure: 1008,
        precip24h: 0,
        isothermZeroM: 3800,
        month: 1
      },
      hydrology: {
        floodElevation: -10.0,
        flowRateM3s: 42.0,
        aquiferDepletionM: -12.5,
        aquiferStress: true
      },
      advisorDirectives: {
        geografo: 'Cerrar compuertas de paso en zonas de bosque denso. Concentrar agua en faja de 45m.',
        meteorologa: 'FWI CRÍTICO 52. Regla 30-30-30 superada con creces. Prohibición total de maquinaria.',
        biologo: 'Pavesas con alcance de 1.8 km. El corredor ripario es la única barrera de retención.'
      }
    },

    'WINTER_DRY': {
      id: 'WINTER_DRY',
      name: 'Invierno Seco & Heladas Polares',
      category: 'winter',
      badge: 'Heladas',
      badgeColor: '#818cf8',
      description: 'Masa de aire polar con cielo despejado y viento calmo. Fuerte radiación nocturna con inversión térmica bajo cero.',
      weather: {
        temp: 2.5,
        rh: 82,
        windSpeed: 6,
        windDirection: 160, // S
        windGusts: 10,
        pressure: 1024,
        precip24h: 0,
        isothermZeroM: 1400,
        month: 7
      },
      hydrology: {
        floodElevation: -10.0,
        flowRateM3s: 85.0,
        aquiferDepletionM: -3.0,
        aquiferStress: false
      },
      advisorDirectives: {
        geografo: 'Drenaje katabático de aire frío hacia el bajo del predio. Riesgo en brotes tiernos.',
        meteorologa: 'Mínima prevista -3.8°C a las 06:30 hrs. Activar torres de ventilación y aspersión.',
        biologo: 'Dormancia invernal en árboles caducos. Suelo con buena humedad acumulada.'
      }
    },

    'WINTER_RAINY_T10': {
      id: 'WINTER_RAINY_T10',
      name: 'Invierno Lluvioso Ordinario (T=10 años)',
      category: 'winter_flood',
      badge: 'Lluvia 65mm',
      badgeColor: '#0284c7',
      description: 'Frente frío con 65 mm de precipitación en 24h. Nieve acumulada desde cota 1.800m. Estero en crecida contenida.',
      weather: {
        temp: 11.0,
        rh: 94,
        windSpeed: 28,
        windDirection: 315, // NW (Frente de temporal estándar)
        windGusts: 45,
        pressure: 1002,
        precip24h: 65,
        isothermZeroM: 1800,
        month: 6
      },
      hydrology: {
        floodElevation: 0.45, // Crecida moderada dentro de terrazas bajas
        flowRateM3s: 240.0,
        aquiferDepletionM: +1.2,
        aquiferStress: false
      },
      advisorDirectives: {
        geografo: 'Crecida ordinaria dentro de riberas. Zanjas Keyline infiltrando al 100%.',
        meteorologa: 'Isoterma baja (1.800m): el 60% de la precipitación cuenca alta cae como nieve.',
        biologo: 'Aporte de nutrientes aluviales y recarga biológica de humedales riparios.'
      }
    },

    'ATMOSPHERIC_RIVER': {
      id: 'ATMOSPHERIC_RIVER',
      name: 'Río Atmosférico Cálido • Isoterma 0 Alta (T=100)',
      category: 'extreme_flood',
      badge: 'DESBORDE T=100',
      badgeColor: '#0369a1',
      description: 'Evento catastrófico tipo junio/agosto 2023: 140 mm de lluvia líquida sobre nieve andina (Isoterma a 3.400m).',
      weather: {
        temp: 16.5,
        rh: 98,
        windSpeed: 42,
        windDirection: 330, // NNW
        windGusts: 70,
        pressure: 994,
        precip24h: 140,
        isothermZeroM: 3400,
        month: 6
      },
      hydrology: {
        floodElevation: 2.1, // Desborde masivo sobre potreros
        flowRateM3s: 680.0,
        aquiferDepletionM: +3.5,
        aquiferStress: false
      },
      advisorDirectives: {
        geografo: 'Alerta Roja Hidráulica: Caudal quintuplicado. Evacuar animales de terrazas bajas.',
        meteorologa: 'Río atmosférico categoría 4. Nieve preexistente se licúa y triplica el escurrimiento.',
        biologo: 'El corredor de sauces y quillayes reduce la velocidad del agua en 42%, evitando el corte de camino.'
      }
    },

    'WHATIF_TORRENTIAL': {
      id: 'WHATIF_TORRENTIAL',
      name: 'Tormenta Torrencial What-If (60mm en 4h • Keyline)',
      category: 'whatif',
      badge: 'What-If 60mm/4h',
      badgeColor: '#38bdf8',
      description: 'Pulso de precipitación torrencial concentrado: 60 mm en 4 horas. Pone a prueba la capacidad de absorción del suelo, las zanjas Keyline (swales) y la retención del tranque alto (18.500 m³).',
      weather: {
        temp: 14.0,
        rh: 96,
        windSpeed: 32,
        windDirection: 315, // NW
        windGusts: 48,
        pressure: 998,
        precip24h: 60,
        isothermZeroM: 2200,
        month: 5
      },
      hydrology: {
        floodElevation: 0.8,
        flowRateM3s: 185.0,
        aquiferDepletionM: +1.8,
        aquiferStress: false
      },
      advisorDirectives: {
        geografo: 'Carga de escorrentía rápida encauzada por los canales de desvío y zanjas de infiltración hacia el tranque alto.',
        meteorologa: 'Intensidad horaria sostenida de 15 mm/h por 4 horas. Generación de escorrentía superficial acelerada.',
        biologo: 'Los camellones sembrados reducen la velocidad del flujo y retienen 930 m³ como esponja viva.'
      }
    }
  };

  /**
   * Evaluates hydraulic flood level and risk metrics based on continuous custom sliders:
   * rainMm, isothermZeroM, priorSoilSat
   */
  static computeHydrology(rainMm, isothermM, priorSat = 0.5) {
    // Área de cuenca alta líquida: si la isoterma sube de 2000m a 3500m, el área aportante se triplica
    const liquidAreaMultiplier = Math.min(3.2, Math.max(0.6, (isothermM - 1200) / 750));
    const effectiveRunoffMm = rainMm * (0.2 + priorSat * 0.6) * liquidAreaMultiplier;
    
    // Caudal estimado m3/s
    const flowRate = Math.round(40 + effectiveRunoffMm * 2.8);

    // Cota de agua vertical en el modelo 3D (-10m = seco, -0.5m = lecho, >0.8m = desborde)
    let floodLevel = -10.0;
    if (rainMm > 15 || flowRate > 150) {
      floodLevel = Math.min(3.2, Math.max(-1.0, (flowRate - 120) / 180));
    }

    return {
      flowRateM3s: flowRate,
      floodLevel: floodLevel,
      isOverflow: floodLevel > 0.6,
      effectiveRunoffMm: Math.round(effectiveRunoffMm)
    };
  }

  /**
   * Evaluates wildfire risk FWI and spread rate based on custom sliders:
   * temp, rh, windSpeed, windDir
   */
  static computeFireRisk(weather) {
    const dummyParcel = { cropType: 'pino', slope: 18, aspect: 'north' };
    const metrics = WildfireRiskModel.evaluateParcelRisk(dummyParcel, weather);
    
    // Si el viento es del sector Este-Noreste (Puelche: 45° a 90°), penalizar FWI con factor catabático
    const dir = weather.windDirection || 220;
    const isPuelcheSector = (dir >= 30 && dir <= 110);
    const puelcheBonus = isPuelcheSector ? 1.25 : 1.0;

    const adjustedScore = Math.min(100, Math.round(metrics.score * puelcheBonus));

    return {
      ...metrics,
      score: adjustedScore,
      isPuelche: isPuelcheSector,
      tier: adjustedScore > 65 ? 'Extremo' : (adjustedScore > 45 ? 'Alto' : (adjustedScore > 25 ? 'Moderado' : 'Bajo'))
    };
  }
}
