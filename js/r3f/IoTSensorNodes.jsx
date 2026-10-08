import React from 'react';
import { Html } from '@react-three/drei';

/**
 * IoT Sensor Nodes with 3D Floating HTML Micro-Cards (Drei <Html>)
 * 
 * Features:
 * - Direct 3D coordinate pinning with automatic camera frustum culling
 * - Distance-adaptive scaling factor
 * - Precision farming telemetry: circular SVG soil moisture gauge, temperature, LoRaWAN beacon
 */
export function IoTSensorNodes({ sensors = [], onSelectSensor }) {
  return (
    <group name="iot_sensor_nodes">
      {sensors.map((s) => (
        <SensorNodeItem key={s.id} sensor={s} onSelect={onSelectSensor} />
      ))}
    </group>
  );
}

function SensorNodeItem({ sensor, onSelect }) {
  const pos = [sensor.x || 0, 0.45, sensor.z || 0];
  const moisture = sensor.metrics?.soilMoisturePercent || 36;
  const temp = sensor.metrics?.temperatureC || 21;
  const battery = sensor.metrics?.batteryPercent || 92;

  const isWeather = sensor.id.includes('WX') || (sensor.name && sensor.name.includes('Meteorológica'));
  const themeColor = isWeather ? '#f59e0b' : '#10b981';
  const icon = isWeather ? '🌤️' : '🌱';

  const radius = 16;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (moisture / 100) * circ;

  return (
    <group position={pos}>
      {/* 1. Metallic Physical 3D Sensor Pole */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 3.4, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Enclosure Box */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <boxGeometry args={[0.7, 0.5, 0.4]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>

      {/* Solar Panel */}
      <mesh position={[0, 3.1, 0]} rotation={[Math.PI / 6, 0, 0]}>
        <boxGeometry args={[0.9, 0.05, 0.6]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Ground Anchor LED Ring */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.1, 24]} />
        <meshBasicMaterial color={themeColor} transparent opacity={0.65} />
      </mesh>

      {/* 2. 3D Floating HTML Micro-Card (Drei <Html>) */}
      <Html
        position={[0, 4.4, 0]}
        center
        distanceFactor={18}
        zIndexRange={[100, 0]}
      >
        <div
          className="iot-3d-floating-card"
          onClick={() => onSelect && onSelect(sensor)}
          style={{ width: '160px', transform: 'translate3d(0,0,0)' }}
        >
          {/* Connecting Stem Line */}
          <div className="iot-card-stem-line" />

          {/* Glass Card Body */}
          <div className="iot-card-inner">
            <div className="iot-card-header">
              <span
                className="iot-card-icon"
                style={{ background: `${themeColor}22`, borderColor: `${themeColor}66` }}
              >
                {icon}
              </span>
              <div className="iot-card-title-group">
                <div className="iot-card-name">{sensor.name || sensor.id}</div>
                <div className="iot-card-type" style={{ color: themeColor }}>
                  {isWeather ? 'Clima' : 'Sonda Suelo'}
                </div>
              </div>
              <div className="iot-lora-beacon" title="LoRaWAN Active">
                <span className="iot-signal-dot" />
                <span className="iot-signal-bars">📶</span>
              </div>
            </div>

            <div className="iot-card-body">
              {/* Dial Widget */}
              <div className="iot-metric-dial">
                <svg className="iot-dial-svg" width="40" height="40" viewBox="0 0 40 40">
                  <circle className="iot-dial-bg" cx="20" cy="20" r={radius} />
                  <circle
                    className="iot-dial-fill"
                    cx="20"
                    cy="20"
                    r={radius}
                    style={{
                      strokeDasharray: circ,
                      strokeDashoffset: offset,
                      stroke: themeColor
                    }}
                  />
                </svg>
                <div className="iot-dial-val">{moisture}%</div>
              </div>

              {/* Stats */}
              <div className="iot-card-stats">
                <div className="iot-stat-row">
                  <span className="label">Temp</span>
                  <span className="val">{temp}°C</span>
                </div>
                <div className="iot-stat-row">
                  <span className="label">Bat</span>
                  <span className="val" style={{ color: '#34d399' }}>{battery}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
