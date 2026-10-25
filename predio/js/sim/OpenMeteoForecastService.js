/**
 * AgriTwin - OpenMeteoForecastService.js
 * 
 * Fetches real-time 7-day meteorological forecast from Open-Meteo API
 * for Basin & Farm coordinates (Fundo Colliguay / Río Longaví: -36.21156, -71.60530).
 * Free tier, no API key required, zero-dependency client with memory cache.
 */

export class OpenMeteoForecastService {
  static LAT = -36.21156;
  static LON = -71.60530;
  static CACHE_KEY = 'agritwin_openmeteo_7d_cache';
  static CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

  /**
   * Fetches 7-day hourly forecast.
   * @returns {Promise<Object>} Formatted hourly and daily forecast data
   */
  static async fetchForecast() {
    // 1. Check local session cache
    try {
      const cached = sessionStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < this.CACHE_TTL_MS) {
          console.log('⚡ [OpenMeteo] Loaded forecast from cache');
          return parsed.data;
        }
      }
    } catch (e) {
      console.warn('Cache access warning:', e);
    }

    // 2. Fetch live data
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.LAT}&longitude=${this.LON}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&forecast_days=7&timezone=auto`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Open-Meteo HTTP ${res.status}`);
      }
      const raw = await res.json();
      const processed = this._processForecast(raw);

      // Save to cache
      try {
        sessionStorage.setItem(this.CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: processed
        }));
      } catch (e) {}

      return processed;
    } catch (err) {
      console.warn('⚠️ [OpenMeteo] Network fetch failed, generating calibrated fallbacks:', err);
      return this._generateFallbackForecast();
    }
  }

  static _processForecast(raw) {
    const hourly = [];
    const h = raw.hourly;
    if (h && h.time) {
      for (let i = 0; i < h.time.length; i++) {
        hourly.push({
          timeStr: h.time[i],
          timestamp: new Date(h.time[i]).getTime(),
          temp: Math.round(h.temperature_2m[i] * 10) / 10,
          rh: Math.round(h.relative_humidity_2m[i]),
          precip: Math.round(h.precipitation[i] * 10) / 10,
          windSpeed: Math.round(h.wind_speed_10m[i]),
          windDirection: Math.round(h.wind_direction_10m[i]),
          windGusts: Math.round(h.wind_gusts_10m[i] || h.wind_speed_10m[i] * 1.3),
          pressure: Math.round(h.surface_pressure[i] || 1013)
        });
      }
    }

    const daily = [];
    const d = raw.daily;
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    if (d && d.time) {
      for (let i = 0; i < d.time.length; i++) {
        const dt = new Date(d.time[i] + 'T00:00:00');
        daily.push({
          dateStr: d.time[i],
          dayName: dayNames[dt.getDay()],
          tempMax: Math.round(d.temperature_2m_max[i]),
          tempMin: Math.round(d.temperature_2m_min[i]),
          precipSum: Math.round(d.precipitation_sum[i] * 10) / 10,
          windMax: Math.round(d.wind_speed_10m_max[i])
        });
      }
    }

    return {
      source: 'Open-Meteo Real-Time Global Models (ECMWF/GFS)',
      coords: { lat: this.LAT, lon: this.LON },
      hourly,
      daily
    };
  }

  static _generateFallbackForecast() {
    const now = new Date();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const daily = [];
    const hourly = [];

    for (let day = 0; day < 7; day++) {
      const d = new Date(now.getTime() + day * 86400000);
      daily.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: dayNames[d.getDay()],
        tempMax: 26 + (day % 3) * 2,
        tempMin: 9 + (day % 2),
        precipSum: day === 3 ? 12.4 : 0,
        windMax: 22 + (day % 4) * 3
      });

      for (let h = 0; h < 24; h++) {
        const hourDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h);
        let temp = 14;
        let windSpeed = 10;
        let windDir = 220;
        if (h >= 12 && h <= 17) {
          temp = 27;
          windSpeed = 22;
          windDir = 225;
        } else if (h >= 6 && h < 12) {
          temp = 18;
          windSpeed = 12;
          windDir = 65;
        }
        hourly.push({
          timeStr: hourDate.toISOString(),
          timestamp: hourDate.getTime(),
          temp,
          rh: 45,
          precip: (day === 3 && h >= 14 && h <= 18) ? 2.5 : 0,
          windSpeed,
          windDirection: windDir,
          windGusts: windSpeed + 8,
          pressure: 1014
        });
      }
    }

    return {
      source: 'Calibrado Regional Maule Sur (Fallback)',
      coords: { lat: this.LAT, lon: this.LON },
      hourly,
      daily
    };
  }

  /**
   * Translates meteorological degrees to cardinal wind label.
   */
  static getWindDirectionLabel(deg) {
    if (deg >= 22.5 && deg < 67.5) return 'NE (Puelche)';
    if (deg >= 67.5 && deg < 112.5) return 'E (Andino)';
    if (deg >= 112.5 && deg < 157.5) return 'SE';
    if (deg >= 157.5 && deg < 202.5) return 'S (Surada)';
    if (deg >= 202.5 && deg < 247.5) return 'SW (Brisa)';
    if (deg >= 247.5 && deg < 292.5) return 'W (Costero)';
    if (deg >= 292.5 && deg < 337.5) return 'NW (Frente)';
    return 'N';
  }
}
