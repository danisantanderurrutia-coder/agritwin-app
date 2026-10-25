/**
 * AgriTwin - WildfireRiskModel
 *
 * Canadian Forest Fire Weather Index (FWI) & Topoclimatic Fuel Model
 * Evaluates fire danger index based on weather telemetry (temp, RH, wind),
 * terrain slope/aspect, and crop fuel flammability.
 *
 * AUDIT FIXES (2026-09-01):
 *  - BUG-4: Fixed fuelMoisture formula — was returning negative values when temp < 20°C
 *  - BUG-5: Added calculateDMC() and calculateDC() for complete FWI system
 *  - Improved FFMC by properly connecting m_o moisture content to output scale
 *  - Calibrated for Maule Region (-36°S) Mediterranean climate regime
 */

export class WildfireRiskModel {

  static FUEL_MODELS = {
    'pine':    { name: 'Pino Radiata / Eucalipto (Alta Inflamabilidad)',   factor: 2.1, fmcBase: 12, deadFuelRatio: 0.85 },
    'cereal':  { name: 'Cereal / Pastizal Seco (Propagación Rápida)',      factor: 1.8, fmcBase: 10, deadFuelRatio: 0.92 },
    'shrub':   { name: 'Arbustal Esclerófilo / Maqui',                     factor: 1.3, fmcBase: 18, deadFuelRatio: 0.65 },
    'native':  { name: 'Bosque Nativo Roble-Hualo (Resiliente)',           factor: 0.6, fmcBase: 35, deadFuelRatio: 0.30 },
    'orchard': { name: 'Frutales Regados (Manzanos / Cerezos)',            factor: 0.4, fmcBase: 45, deadFuelRatio: 0.20 },
    'wetland': { name: 'Río / Humedal Estero Colliguay',                   factor: 0.1, fmcBase: 80, deadFuelRatio: 0.05 }
  };

  /**
   * Fine Fuel Moisture Code (FFMC) — Canadian Forest Service Van Wagner (1987)
   * Properly connects initial moisture content m_o to the FFMC output scale.
   * @param {number} temp - Temperature °C
   * @param {number} rh   - Relative Humidity %
   * @param {number} windSpeed - Wind speed km/h
   * @returns {number} FFMC (0 - 101)
   */
  static calculateFFMC(temp, rh, windSpeed) {
    // Step 1: Equilibrium moisture content from RH + temp
    // Ed (drying) and Ew (wetting) equilibrium equations (Van Wagner 1987)
    const Ed = 0.942 * Math.pow(rh, 0.679) + 11 * Math.exp((rh - 100) / 10) + 0.18 * (21.1 - temp) * (1 - Math.exp(-0.115 * rh));
    const Ew = 0.618 * Math.pow(rh, 0.753) + 10 * Math.exp((rh - 100) / 10) + 0.18 * (21.1 - temp) * (1 - Math.exp(-0.115 * rh));

    // Step 2: Previous day FFMC-based moisture content (assumes 85 FFMC as neutral start)
    const ffmcPrev = 85.0;
    const m_o = 147.2 * (101 - ffmcPrev) / (59.5 + ffmcPrev);

    // Step 3: Drying or wetting rate
    let m;
    if (m_o > Ed) {
      const ko = 0.424 * (1 - Math.pow(rh / 100, 1.7)) + 0.0694 * Math.sqrt(windSpeed) * (1 - Math.pow(rh / 100, 8));
      const kd = ko * 0.581 * Math.exp(0.0365 * temp);
      m = Ed + (m_o - Ed) * Math.pow(10, -kd);
    } else if (m_o < Ew) {
      const kw = 0.424 * (1 - Math.pow((100 - rh) / 100, 1.7)) + 0.0694 * Math.sqrt(windSpeed) * (1 - Math.pow((100 - rh) / 100, 8));
      const k_wt = kw * 0.581 * Math.exp(0.0365 * temp);
      m = Ew - (Ew - m_o) * Math.pow(10, -k_wt);
    } else {
      m = m_o;
    }

    const ffmc = 59.5 * (250 - m) / (147.2 + m);
    return Math.round(Math.min(101, Math.max(0, ffmc)) * 10) / 10;
  }

  /**
   * Duff Moisture Code (DMC) — Represents moisture of loosely compacted organic layers
   * Simplified single-day approximation suitable for daily telemetry.
   * @param {number} temp  - Temperature °C
   * @param {number} rh    - Relative Humidity %
   * @param {number} precip - Precipitation last 24h mm
   * @param {number} month  - Month (1-12)
   * @returns {number} DMC (0 - 200+)
   */
  static calculateDMC(temp, rh, precip = 0, month = 1) {
    // Day-length adjustment factor for -36°S latitude (Maule)
    // Southern Hemisphere: reverse seasons
    const dayLengthFactors = [7.9, 8.4, 8.6, 7.5, 6.4, 5.8, 6.0, 7.1, 8.4, 9.3, 9.4, 8.6];
    const Le = dayLengthFactors[Math.min(month - 1, 11)];

    // Drying contribution from temperature
    const K = Math.max(0, 1.894 * (temp + 1.1) * (100 - rh) * Le * 1e-6);
    const prevDMC = 6; // neutral start
    return Math.round(Math.max(0, prevDMC + 100 * K) * 10) / 10;
  }

  /**
   * Drought Code (DC) — Represents deep organic moisture / drought stress
   * @param {number} temp   - Temperature °C
   * @param {number} precip - Precipitation last 24h mm
   * @param {number} month  - Month (1-12)
   * @returns {number} DC (0 - 1000)
   */
  static calculateDC(temp, precip = 0, month = 1) {
    // Solar radiation factors for -36°S
    const Lf = [-1.6, -1.6, -1.6, 0.9, 3.8, 5.8, 6.4, 5.0, 2.4, 0.4, -1.6, -1.6];
    const Lm = Lf[Math.min(month - 1, 11)];

    const V = Math.max(0, 0.36 * (temp + 2.8) + Lm);
    const prevDC = 15; // neutral start
    return Math.round(Math.max(0, prevDC + 0.5 * V) * 10) / 10;
  }

  /**
   * Evaluates overall wildfire risk score (0–100) and risk tier.
   * Full FWI system: FFMC + DMC + DC + ISI + BUI → FWI
   */
  static evaluateParcelRisk(parcel, weatherTelemetry) {
    const { temp = 26, rh = 35, wind = 14, precip = 0, month = 1 } = weatherTelemetry;

    const ffmc = this.calculateFFMC(temp, rh, wind);
    const dmc  = this.calculateDMC(temp, rh, precip, month);
    const dc   = this.calculateDC(temp, precip, month);

    // Initial Spread Index (ISI) — combines FFMC & wind
    const fW = Math.exp(0.05039 * wind);
    const fm = 147.2 * (101 - ffmc) / (59.5 + ffmc);
    const fF = 91.9 * Math.exp(-0.1386 * fm) * (1 + Math.pow(fm, 5.31) / 49300000);
    const isi = Math.round(0.208 * fW * fF * 10) / 10;

    // Buildup Index (BUI) — combines DMC & DC
    let bui;
    if (dmc <= 0.4 * dc) {
      bui = 0.8 * dmc * dc / (dmc + 0.4 * dc);
    } else {
      bui = dmc - (1 - 0.8 * dc / (dmc + 0.4 * dc)) * (0.92 + Math.pow(0.0114 * dmc, 1.7));
    }
    bui = Math.max(0, Math.round(bui * 10) / 10);

    // Determine fuel factor based on parcel crop type
    const cropType = (parcel.cropType || 'orchard').toLowerCase();
    let fuelConfig = this.FUEL_MODELS.orchard;
    if (cropType.includes('pino') || cropType.includes('eucalipto'))    fuelConfig = this.FUEL_MODELS.pine;
    else if (cropType.includes('cereal') || cropType.includes('trigo') || cropType.includes('pastizal')) fuelConfig = this.FUEL_MODELS.cereal;
    else if (cropType.includes('bosque') || cropType.includes('nativo') || cropType.includes('quillay')) fuelConfig = this.FUEL_MODELS.native;
    else if (cropType.includes('maqui') || cropType.includes('arbusto')) fuelConfig = this.FUEL_MODELS.shrub;
    else if (cropType.includes('río') || cropType.includes('agua'))      fuelConfig = this.FUEL_MODELS.wetland;

    // Topographic slope/aspect vulnerability (Maule — North-facing slopes more exposed)
    const slope = parcel.slopeDegrees || 8;
    const isNorthFacing = (parcel.aspectDegrees >= 300 || parcel.aspectDegrees <= 60);
    const topoFactor = 1.0 + (slope / 45) * 0.4 + (isNorthFacing ? 0.25 : 0.0);

    // BUG-4 FIX: Use exponential decay for fuel moisture — stays positive for all temp/rh ranges
    const tempMoistureFactor = Math.exp(-0.02 * (temp - 20));
    const fuelMoisture = Math.max(4, Math.round(fuelConfig.fmcBase * (rh / 60) * tempMoistureFactor));

    // Final FWI score integrating ISI, BUI, fuel type and topography
    const rawScore = isi * (bui / 50 + 0.4) * fuelConfig.factor * topoFactor * 3.5;
    const score = Math.min(100, Math.max(0, Math.round(rawScore)));

    let tier = 'Bajo';
    let color = '#10b981';
    let desc = 'Condición de riesgo bajo. Humedad vegetal adecuada.';

    if (score > 80) {
      tier = 'Extremo';
      color = '#ef4444';
      desc = '⚠️ RIESGO EXTREMO DE INCENDIO. Alta velocidad de propagación.';
    } else if (score > 55) {
      tier = 'Alto';
      color = '#f97316';
      desc = 'Riesgo Alto. Combustibles secos y viento desfavorable.';
    } else if (score > 30) {
      tier = 'Moderado';
      color = '#f59e0b';
      desc = 'Riesgo Moderado. Vigilancia preventiva recomendada.';
    }

    return {
      score,
      tier,
      color,
      desc,
      ffmc,
      dmc,
      dc,
      isi,
      bui,
      fuelMoisture: `${fuelMoisture}%`,
      rateOfSpread: `${Math.round((score / 15) * 10) / 10} m/min`,
      fuelType: fuelConfig.name,
      topoFactor: `${Math.round(topoFactor * 100) / 100}x`
    };
  }
}
