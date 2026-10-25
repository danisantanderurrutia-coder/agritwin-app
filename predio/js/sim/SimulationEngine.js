/**
 * AgriTwin - SimulationEngine Module
 * 
 * Simulates real-time IoT sensor telemetry streams over LoRaWAN / WiFi.
 * Generates realistic fluctuations:
 *  - Diurnal ambient temperature curves (°C)
 *  - Soil moisture evaporation decay (%)
 *  - Random weather micro-variations
 *  - Automated Water Stress Alert triggering when soil moisture drops below 25%
 * 
 * FUTURE EXTENSION ROADMAP:
 *  In production, this module will be deactivated and replaced by a real MQTT Subscriber:
 *  ```js
 *  import mqtt from 'mqtt';
 *  const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');
 *  client.subscribe('agritwin/sensors/+/telemetry');
 *  client.on('message', (topic, payload) => {
 *    const data = JSON.parse(payload);
 *    dataSource.updateSensorTelemetry(data.sensorId, data.telemetry);
 *  });
 *  ```
 */

import { bus } from '../utils/EventBus.js';

export class SimulationEngine {
  constructor(dataSource) {
    this.dataSource = dataSource;
    this.timer = null;
    this.isRunning = false;
    this.baseIntervalMs = 3000;
    this.speedMultiplier = 1;
    this.intervalMs = 3000;
    this.simulatedHour = 10; // Start simulation at 10:00 AM
    this.latestBasinTelemetry = null;

    // Conexión y sincronización periódica con Cuenca Regional (:7774)
    this.syncBasinTelemetry();
    this.basinInterval = setInterval(() => this.syncBasinTelemetry(), 20000);
  }

  async syncBasinTelemetry() {
    try {
      const res = await fetch('/api/basin-sync');
      if (res.ok) {
        const basin = await res.json();
        this.latestBasinTelemetry = basin;
        bus.emit('basin:telemetry_updated', basin);
      }
    } catch (e) {
      // Fallback silencioso
    }
  }

  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
    this.intervalMs = Math.round(this.baseIntervalMs / multiplier);
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Start live simulation loop
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.timer = setInterval(() => {
      this.tick();
    }, this.intervalMs);

    bus.emit('simulation:state', { running: true, speed: this.speedMultiplier });
    console.log(`IoT Simulation Engine started (${this.speedMultiplier}x speed).`);
  }

  /**
   * Pause simulation loop
   */
  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.timer);
    this.timer = null;

    bus.emit('simulation:state', { running: false, speed: this.speedMultiplier });
    console.log('IoT Simulation Engine paused.');
  }

  /**
   * Toggle simulation state
   */
  toggle() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * Single simulation step / tick
   */
  tick() {
    // Advance simulated time (10 min per tick)
    this.simulatedHour = (this.simulatedHour + 0.166) % 24;

    const sensors = this.dataSource.entitiesData ? this.dataSource.entitiesData.sensors : [];

    sensors.forEach(sensor => {
      let { soilMoisture, temperature, humidity, batteryLevel } = sensor.telemetry;

      // 1. Temperature diurnal sine curve (peak at 14:00, lowest at 04:00)
      const baseTemp = 22 + 8 * Math.sin((this.simulatedHour - 8) * (Math.PI / 12));
      const tempNoise = (Math.random() - 0.5) * 0.8;
      temperature = parseFloat((baseTemp + tempNoise).toFixed(1));

      // 2. Multi-layer soil moisture (0-20cm, 20-60cm, 60-100cm) based on FAO-56 cascade
      const moistureLoss = 0.15 + (temperature > 26 ? 0.1 : 0.0);
      soilMoisture = Math.max(12, soilMoisture - moistureLoss + (Math.random() - 0.5) * 0.1);
      soilMoisture = parseFloat(soilMoisture.toFixed(1));

      // Layer 1 (0-20 cm): highly sensitive to solar radiation & surface evaporation
      const soilMoistureLayer1 = parseFloat(Math.max(8, soilMoisture * 0.72 + (Math.random() - 0.5) * 0.4).toFixed(1));
      // Layer 2 (20-60 cm): active root zone
      const soilMoistureLayer2 = soilMoisture;
      // Layer 3 (60-100 cm): deep aquifer infiltration & reserve
      const soilMoistureLayer3 = parseFloat(Math.min(52, soilMoisture * 1.15 + 4.0).toFixed(1));

      // FAO-56 Penman-Monteith ETo approximation (mm/day)
      const et0PenmanMonteith = parseFloat((3.4 + (temperature > 22 ? (temperature - 22) * 0.22 : 0)).toFixed(1));

      // CWSI Crop Water Stress Index (0.00 optimal to 1.00 severe stress)
      const cwsiStressIndex = parseFloat(Math.min(1.0, Math.max(0.05, (42 - soilMoistureLayer2) / 40)).toFixed(2));

      // 3. Humidity inverse to temperature
      humidity = parseFloat(Math.min(95, Math.max(30, 90 - (temperature * 1.8) + (Math.random() - 0.5))).toFixed(1));

      // 4. Battery slow drain
      batteryLevel = parseFloat(Math.max(5, batteryLevel - 0.01).toFixed(1));

      // 5. Determine health status threshold
      let status = 'optimal';
      if (soilMoistureLayer2 < 25.0 || temperature > 32.0) {
        status = 'critical';
      } else if (soilMoistureLayer2 < 32.0 || temperature > 28.0) {
        status = 'warning';
      }

      // Preserve all specific hardware properties (e.g. anemometer wind speed)
      const updatedTelemetry = {
        ...sensor.telemetry,
        soilMoisture,
        soilMoistureLayer1,
        soilMoistureLayer2,
        soilMoistureLayer3,
        et0PenmanMonteith,
        cwsiStressIndex,
        telemetryMode: 'SIMULATED_FAO56',
        temperature,
        humidity,
        batteryLevel,
        status
      };

      // Realistic wind speed micro-fluctuations for anemometer
      if (sensor.telemetry.windSpeedKmH !== undefined && !sensor.id.includes('FROST')) {
        const windNoise = (Math.random() - 0.5) * 1.8;
        updatedTelemetry.windSpeedKmH = parseFloat(Math.max(4.0, sensor.telemetry.windSpeedKmH + windNoise).toFixed(1));
        updatedTelemetry.gustSpeedKmH = parseFloat((updatedTelemetry.windSpeedKmH * 1.45 + Math.random() * 2).toFixed(1));
      }

      // Dynamic Maule Agro-Climatic Sensor Behaviors:
      if (sensor.id.includes('FROST') || sensor.categoryMaule === 'frost_fruit_height') {
        // Cold katabatic air drainage accumulates between 03:00 and 07:00
        const isDawnCold = (this.simulatedHour >= 3.0 && this.simulatedHour <= 7.5);
        const coldDip = isDawnCold ? -3.8 : 0.0;
        const fruitTemp = parseFloat((temperature - 4.5 + coldDip + (Math.random() - 0.5) * 0.4).toFixed(1));
        const shelterTemp = parseFloat((temperature - 1.2 + (Math.random() - 0.5) * 0.3).toFixed(1));
        
        // Approximate Psychrometric Wet Bulb Temperature (Stull formulation)
        const rh = humidity;
        const twb = fruitTemp * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
                    Math.atan(fruitTemp + rh) - Math.atan(rh - 1.676331) +
                    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) - 4.686035;
        const wetBulb = parseFloat(twb.toFixed(1));

        updatedTelemetry.fruitHeightTempC = fruitTemp;
        updatedTelemetry.temperature = fruitTemp;
        updatedTelemetry.shelterTemp2mC = shelterTemp;
        updatedTelemetry.deltaHeightShelterC = parseFloat((fruitTemp - shelterTemp).toFixed(1));
        updatedTelemetry.wetBulbTempC = wetBulb;
        updatedTelemetry.dewPointC = parseFloat((fruitTemp - ((100 - rh) / 5)).toFixed(1));
        
        if (fruitTemp <= 0.0) {
          updatedTelemetry.status = 'critical';
          const shouldWater = wetBulb >= -0.5;
          updatedTelemetry.decision = {
            code: shouldWater ? 'ACTIVAR_RIEGO_ANTIHELADA' : 'EVITAR_RIEGO_BULBO_BAJO',
            actionNeeded: shouldWater ? 'ACTIVAR ASPERSIÓN ANTIHELADA' : 'NO RIEGO / CALEFACCIÓN O VENTILADORES',
            summary: shouldWater 
              ? `T. Fruta ${fruitTemp}°C. Bulbo húmedo es ${wetBulb}°C (seguro). Aspersión formará hielo protector liberando calor latente.`
              : `T. Fruta ${fruitTemp}°C. Bulbo húmedo es ${wetBulb}°C (RIESGOSO < -0.5°C). Aspersión causará enfriamiento evaporativo destructivo.`,
            phenology: 'Floración yemas cerezo Lapins',
            lossRiskCLP: 14500000
          };
        } else if (fruitTemp <= 2.5) {
          updatedTelemetry.status = 'warning';
        } else {
          updatedTelemetry.status = 'optimal';
        }
      } else if (sensor.id.includes('LEAF') || sensor.categoryMaule === 'foliar_wetness') {
        // Foliar wetness accumulates during night/morning humidity or rain
        const isHumidPeriod = humidity > 85.0;
        let wetHours = sensor.telemetry.leafWetnessHours || 8.0;
        wetHours = isHumidPeriod ? parseFloat(Math.min(24, wetHours + 0.16).toFixed(1)) : parseFloat(Math.max(0, wetHours - 0.25).toFixed(1));
        
        // Mills-like Botrytis risk model (combination of continuous hours and temp around 15-22°C)
        const tempOptimum = (temperature >= 14 && temperature <= 24);
        const botrytisRisk = parseFloat(Math.min(1.0, (wetHours / 14.0) * (tempOptimum ? 1.1 : 0.6)).toFixed(2));
        
        updatedTelemetry.leafWetnessHours = wetHours;
        updatedTelemetry.leafWetnessPct = wetHours > 0 ? 100.0 : 0.0;
        updatedTelemetry.botrytisRiskIndex = botrytisRisk;
        updatedTelemetry.venturiaRiskIndex = parseFloat(Math.min(1.0, botrytisRisk * 0.85).toFixed(2));
        updatedTelemetry.status = botrytisRisk > 0.7 ? 'critical' : (botrytisRisk > 0.4 ? 'warning' : 'optimal');
      } else if (sensor.id.includes('FLOW') || sensor.categoryMaule === 'water_canal_dga') {
        // Deep well pumping & canal turn depletion tracking
        const reserveDays = parseFloat(Math.max(0.5, (soilMoistureLayer2 - 18) / 4.8).toFixed(1));
        updatedTelemetry.soilWaterReserveDays = reserveDays;
        updatedTelemetry.status = reserveDays < 1.5 ? 'warning' : 'optimal';
      }

      // Update data source cache and emit event
      this.dataSource.updateSensorTelemetry(sensor.id, updatedTelemetry);

      // Emit alert if critical water stress is reached
      if (status === 'critical') {
        bus.emit('alert:triggered', {
          sensorId: sensor.id,
          sensorName: sensor.name,
          message: `Estrés hídrico crítico en sensor ${sensor.name}! Humedad del suelo: ${soilMoisture}% (Umbral < 25%)`
        });
      }
    });

    // Calculate aggregate metrics across the 3 profiles
    let sumMoisture = 0;
    let sumL1 = 0;
    let sumL2 = 0;
    let sumL3 = 0;
    let criticalCount = 0;
    let warningCount = 0;

    sensors.forEach(s => {
      sumMoisture += s.telemetry.soilMoisture;
      sumL1 += s.telemetry.soilMoistureLayer1 || (s.telemetry.soilMoisture * 0.72);
      sumL2 += s.telemetry.soilMoistureLayer2 || s.telemetry.soilMoisture;
      sumL3 += s.telemetry.soilMoistureLayer3 || (s.telemetry.soilMoisture * 1.15);
      if (s.telemetry.status === 'critical') criticalCount++;
      if (s.telemetry.status === 'warning') warningCount++;
    });

    const sensorCount = sensors.length || 1;
    const avgMoisture = (sumMoisture / sensorCount).toFixed(1);
    const avgL1 = (sumL1 / sensorCount).toFixed(1);
    const avgL2 = (sumL2 / sensorCount).toFixed(1);
    const avgL3 = (sumL3 / sensorCount).toFixed(1);

    let globalRisk = 'optimal';
    if (criticalCount > 0) globalRisk = 'critical';
    else if (warningCount > 0) globalRisk = 'warning';

    // 1. Enterprise Profile Biophysical Calculations
    const et0Avg = sensors.length > 0 ? sensors[0].telemetry.et0PenmanMonteith : 3.6;
    const irrigationSheetMm = parseFloat(Math.max(2.5, (40 - avgL2) * 0.42).toFixed(1));
    const irrigationDurationMin = Math.round(irrigationSheetMm * 7.2);
    const frostMinTemp = parseFloat((1.2 + (this.simulatedHour < 7 ? (7 - this.simulatedHour) * 0.15 : (this.simulatedHour - 7) * 0.8)).toFixed(1));
    const frostRiskLevel = frostMinTemp < 2.0 ? 'warning' : 'optimal';

    // 2. Territorial Profile Hydrological & Fire Risk Calculations
    const aquiferRecharge = parseFloat(Math.min(95, Math.max(40, avgL3 * 1.6)).toFixed(0));
    const aquiferStatus = aquiferRecharge < 50 ? 'critical' : (aquiferRecharge < 72 ? 'warning' : 'optimal');
    const fwiScore = Math.round(Math.min(85, Math.max(12, (100 - avgL1) * 0.65 + (sensors[0]?.telemetry?.windSpeedKmH || 14) * 0.8)));

    // 3. ESG / MRV Ledger Metrics
    const carbonStockTco2 = parseFloat((4.6 + (avgL2 > 30 ? 0.3 : 0.1)).toFixed(2));
    const ieiScore = parseFloat((0.85 + (avgL3 > 35 ? 0.04 : 0.01)).toFixed(2));

    const biophysicalPayload = {
      simulatedHour: this.formatSimulatedTime(this.simulatedHour),
      avgMoisture: `${avgMoisture}%`,
      globalRisk: globalRisk,
      
      // Enterprise View Package
      enterprise: {
        layer1_0_20cm: avgL1,
        layer2_20_60cm: avgL2,
        layer3_60_100cm: avgL3,
        cwsi: sensors[0]?.telemetry?.cwsiStressIndex || 0.26,
        irrigationSheetMm: irrigationSheetMm,
        irrigationDurationMin: irrigationDurationMin,
        et0PenmanMonteith: et0Avg,
        frostMinTemp: frostMinTemp,
        frostRiskLevel: frostRiskLevel,
        frostLocation: 'Hondonada baja del Estero',
        frostHourPredict: '06:15 AM'
      },

      // Territorial View Package
      territorial: {
        aquiferRechargePercent: aquiferRecharge,
        aquiferStatus: aquiferStatus,
        fwiScore: fwiScore,
        fwiCategory: fwiScore > 50 ? 'Extremo' : (fwiScore > 32 ? 'Alto' : 'Moderado'),
        fuelLoadTonHa: 4.5,
        aprCommitteesCount: 6,
        familiesSupplied: 1420,
        waterTrucksAvoided: 14,
        savingsClp: '$4.2M CLP',
        firebreaksCleanKm: 14.2,
        criticalSector: 'Sector Ribera Sur (3.2 km)'
      },

      // ESG / MRV Package
      esg: {
        carbonTco2eHa: carbonStockTco2,
        ieiScore: ieiScore,
        eudrCompliance: '100% Cero Deforestación',
        baselineYear: 'Diciembre 2020 (Sentinel-2)',
        mrvHash: '0x8f2d' + Math.floor(this.simulatedHour * 1000).toString(16) + '4a1',
        biodiversityCredits: 128,
        restorationCorridorHa: 8.4
      }
    };

    bus.emit('simulation:tick', biophysicalPayload);
    this.latestBiophysicalData = biophysicalPayload;
  }

  /**
   * Format decimal hours to HH:MM string
   */
  formatSimulatedTime(decimalHours) {
    const hours = Math.floor(decimalHours);
    const minutes = Math.floor((decimalHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
