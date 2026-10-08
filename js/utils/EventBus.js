/**
 * AgriTwin - EventBus Utility
 * 
 * Lightweight Publish-Subscribe Event Bus to decouple the data sources,
 * Cesium 3D map engine, UI drawer, and simulation events.
 * 
 * Future Extension: When integrating WebSockets or MQTT brokers,
 * incoming messages from sensors emit events onto this bus, allowing
 * the UI and Map to update seamlessly without direct coupling.
 */

class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event
   * @param {string} eventName 
   * @param {Function} callback 
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    return () => this.off(eventName, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName 
   * @param {Function} callback 
   */
  off(eventName, callback) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
  }

  /**
   * Publish an event with data
   * @param {string} eventName 
   * @param {any} data 
   */
  emit(eventName, data) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error executing listener for event "${eventName}":`, err);
      }
    });
  }
}

// Global Singleton Instance
export const bus = new EventBus();
