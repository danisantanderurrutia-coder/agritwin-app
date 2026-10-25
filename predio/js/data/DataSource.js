/**
 * AgriTwin - DataSource Module
 * 
 * Central data abstraction layer for farm assets, parcel geometries, and IoT telemetry.
 * Currently fetches static JSON/GeoJSON files and initializes simulated sensor data structures.
 * 
 * FUTURE EXTENSION ROADMAP:
 *  1. MQTT Connection: Replace `loadEntities()` with a MQTT client connection (e.g. mqtt.js over WebSocket).
 *     Incoming MQTT payloads topic `agritwin/sensors/{sensor_id}/telemetry` will update the cache and
 *     trigger `bus.emit('sensor:telemetry_updated', data)`.
 *  2. PostgreSQL / PostGIS: Query spatial entities via GeoJSON REST endpoints:
 *     `GET /api/v1/parcels?bbox=...` or `GET /api/v1/sensors/history?id=101`.
 */

import { bus } from '../utils/EventBus.js';
import { BUNDLED_PARCELS, BUNDLED_ENTITIES } from './BundledData.js';

export class DataSource {
  constructor() {
    this.parcelsData = null;
    this.entitiesData = null;
    this.sensorsMap = new Map();
    this.treesMap = new Map();
  }

  /**
   * Loads both GeoJSON field boundaries and JSON sensor/tree entities.
   * Gracefully falls back to bundled offline datasets if fetch fails (e.g. file:// protocol / CORS).
   */
  async loadAll() {
    try {
      const [parcelsRes, entitiesRes] = await Promise.all([
        fetch('data/farm_parcels.geojson'),
        fetch('data/farm_entities.json')
      ]);

      if (!parcelsRes.ok || !entitiesRes.ok) {
        throw new Error(`HTTP status: parcels=${parcelsRes.status}, entities=${entitiesRes.status}`);
      }

      this.parcelsData = await parcelsRes.json();
      this.entitiesData = await entitiesRes.json();
    } catch (err) {
      console.warn('⚠️ No se pudo cargar vía HTTP (posible protocolo local file:// o sin red). Usando dataset preembebido de alta fidelidad:', err.message);
      this.parcelsData = JSON.parse(JSON.stringify(BUNDLED_PARCELS));
      this.entitiesData = JSON.parse(JSON.stringify(BUNDLED_ENTITIES));
    }

    // Index entities into maps for fast O(1) lookup
    if (this.entitiesData && this.entitiesData.sensors) {
      this.entitiesData.sensors.forEach(sensor => {
        this.sensorsMap.set(sensor.id, sensor);
      });
    }

    if (this.entitiesData && this.entitiesData.trees) {
      this.entitiesData.trees.forEach(tree => {
        this.treesMap.set(tree.id, tree);
      });
    }

    console.log(`Loaded ${this.parcelsData?.features?.length || 0} parcels, ${this.sensorsMap.size} sensors, and ${this.treesMap.size} trees.`);
    
    bus.emit('data:loaded', {
      parcels: this.parcelsData,
      entities: this.entitiesData
    });

    return {
      parcels: this.parcelsData,
      entities: this.entitiesData
    };
  }

  /**
   * Lookup sensor entity by ID
   * @param {string} sensorId 
   */
  getSensor(sensorId) {
    return this.sensorsMap.get(sensorId);
  }

  /**
   * Update sensor telemetry value in cache (used by SimulationEngine or MQTT client)
   * @param {string} sensorId 
   * @param {Object} newTelemetry 
   */
  updateSensorTelemetry(sensorId, newTelemetry) {
    const sensor = this.sensorsMap.get(sensorId);
    if (sensor) {
      sensor.telemetry = { ...sensor.telemetry, ...newTelemetry };
      sensor.lastUpdated = new Date().toISOString();

      // Maintain historical log for sparkline graph (max 24 points)
      if (!sensor.history) sensor.history = [];
      sensor.history.push({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        moisture: sensor.telemetry.soilMoisture,
        temperature: sensor.telemetry.temperature,
        windSpeed: sensor.telemetry.windSpeedKmH
      });
      if (sensor.history.length > 24) sensor.history.shift();

      // Notify system of update
      bus.emit('sensor:telemetry_updated', sensor);
    }
  }
}
