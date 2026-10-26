/**
 * AgriTwin - SensorPinoutData.js
 * 
 * Base de datos técnica y pedagógica de conexionado físico para los sensores de campo,
 * estaciones meteorológicas y actuadores del fundo.
 * 
 * Mapeo:
 *  - Microcontroladores: ESP32-S3 (DevKitC-1), ESP32-C3 Mini, ESP32-WROOM-32U
 *  - Interfaces: I2C, SPI, RS485 / Modbus, ADC Analógico (0-3.3V), 1-Wire, Pulso / Interrupción, Relés Optoacoplados.
 */

export const SENSOR_CIRCUITS_CATALOG = [
  {
    id: 'circuit-sht45-weather',
    category: 'Clima & Atmósfera',
    title: 'Sensor Termo-Higrométrico de Precisión (SHT45) & Abrigo Meteorológico',
    mcu: 'ESP32-S3 (LoRaWAN & Wi-Fi)',
    voltage: '3.3V DC (LDO Regulado)',
    protocol: 'I2C Bus (0x44)',
    sensorName: 'Sensirion SHT45-DIS (±1.5% RH, ±0.1°C)',
    icon: '🌤️',
    difficulty: 'Fácil (4 cables)',
    description: 'Sensor digital para medición de temperatura de bulbo seco y humedad relativa dentro del abrigo meteorológico o a 1.2 m en altura de fruta. Permite calcular el Bulbo Húmedo (Stull) para defensa de heladas.',
    materials: [
      '1x ESP32-S3 DevKit con antena externa U.FL',
      '1x Breakout SHT45 con cápsula de teflón antipolvo/agua',
      '2x Resistencias Pull-Up 4.7 kΩ (si el breakout no las incluye)',
      '1x Cable blindado 4 hilos (AWG 24 o 26, apantallado a tierra)',
      '1x Condensador cerámico 100 nF para desacoplo VCC-GND'
    ],
    connections: [
      { pinSensor: 'VIN / VDD', pinEsp: '3V3', color: '#ef4444', wireType: 'Alimentación', note: 'Nunca conectar a 5V (dañaría el sensor SHT45)' },
      { pinSensor: 'GND', pinEsp: 'GND', color: '#1e293b', wireType: 'Tierra común', note: 'Conectar también la malla del cable a tierra del chasis' },
      { pinSensor: 'SDA', pinEsp: 'GPIO 21 (o 8 en S3)', color: '#38bdf8', wireType: 'I2C Serial Data', note: 'Línea bidireccional de datos con pull-up' },
      { pinSensor: 'SCL', pinEsp: 'GPIO 22 (o 9 en S3)', color: '#facc15', wireType: 'I2C Serial Clock', note: 'Reloj de bus I2C sincronizado a 100 kHz' }
    ],
    codeSnippet: `// ESP32 Arduino / ESP-IDF (Wire.h)
#include <Wire.h>

#define I2C_SDA 21
#define I2C_SCL 22
#define SHT45_ADDR 0x44

void setup() {
  Serial.begin(115200);
  Wire.begin(I2C_SDA, I2C_SCL, 100000); // 100kHz I2C
  Serial.println("SHT45 Inicializado en Bus I2C");
}

void loop() {
  Wire.beginTransmission(SHT45_ADDR);
  Wire.write(0xFD); // Comando de alta precisión
  Wire.endTransmission();
  delay(10);
  Wire.requestFrom(SHT45_ADDR, 6);
  // Lee 6 bytes (Temp MSB/LSB/CRC + Hum MSB/LSB/CRC)
  delay(2000);
}`,
    pedagogicTip: '💡 Consejo de Terreno: Para evitar mediciones falseadas por el sol directo, coloca el SHT45 dentro de un plato de radiación solar (Radiation Shield) ventilado de lamas blancas, ubicado exactamente a la altura del estrato vegetal (1.2m para flor de cerezo).'
  },

  {
    id: 'circuit-fdr-soil',
    category: 'Suelo & Riego',
    title: 'Sonda Capacitiva / FDR Multinivel de Suelo (Estratos 20, 40, 60 cm)',
    mcu: 'ESP32-S3 LoRaWAN',
    voltage: '5V - 12V DC (Step-Up o Batería LiFePO4)',
    protocol: 'RS485 / Modbus RTU (Half-Duplex)',
    sensorName: 'Sonda Multi-Estrato FDR 3 Niveles (VWC%, CE, Temp)',
    icon: '🌱',
    difficulty: 'Intermedio (Módulo MAX485)',
    description: 'Sonda tubular enterrada para medición continua del contenido volumétrico de agua (VWC) y conductividad eléctrica. Comunica por bus industrial RS485 diferencial hacia el transceptor MAX485 del ESP32.',
    materials: [
      '1x ESP32-S3',
      '1x Transceptor TTL a RS485 (MAX485 o SP3485 a 3.3V)',
      '1x Sonda FDR multinivel Modbus con conector M12',
      '1x Resistencia terminal de 120 Ω entre líneas A y B (al final del bus)',
      '1x Step-up DC-DC de 3.7V a 12V (para alimentar la sonda antes de cada lectura)'
    ],
    connections: [
      { pinSensor: 'VCC (Rojo)', pinEsp: '12V / VOUT (Power Gate)', color: '#ef4444', wireType: 'Alimentación Conmutada', note: 'Encendido vía MOSFET P para bajo consumo sleep' },
      { pinSensor: 'GND (Negro)', pinEsp: 'GND', color: '#1e293b', wireType: 'Tierra común', note: 'GND común con ESP32 y regulador' },
      { pinSensor: 'RS485 A (Amarillo/Blanco)', pinEsp: 'MAX485 Pin A', color: '#22c55e', wireType: 'Señal No Inversora (+)', note: 'Línea diferencial A (+)' },
      { pinSensor: 'RS485 B (Azul/Verde)', pinEsp: 'MAX485 Pin B', color: '#38bdf8', wireType: 'Señal Inversora (-)', note: 'Línea diferencial B (-)' },
      { pinSensor: 'MAX485 RO (Rx Out)', pinEsp: 'GPIO 16 (UART2 Rx)', color: '#a855f7', wireType: 'UART Serial Rx', note: 'Lectura de tramas Modbus hex' },
      { pinSensor: 'MAX485 DI (Tx In)', pinEsp: 'GPIO 17 (UART2 Tx)', color: '#ec4899', wireType: 'UART Serial Tx', note: 'Envío de petición Modbus (0x01 0x03...)' },
      { pinSensor: 'MAX485 RE / DE', pinEsp: 'GPIO 4 (Dirección Tx/Rx)', color: '#f59e0b', wireType: 'Control de Flujo RS485', note: 'HIGH = Transmitiendo, LOW = Escuchando respuesta' }
    ],
    codeSnippet: `// Modbus RTU Master con HardwareSerial
#define RXD2 16
#define TXD2 17
#define RS485_DIR_PIN 4

void setup() {
  pinMode(RS485_DIR_PIN, OUTPUT);
  digitalWrite(RS485_DIR_PIN, LOW); // Modo Escucha (RX)
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);
}

void requestSoilStratum() {
  digitalWrite(RS485_DIR_PIN, HIGH); // Habilitar Transmisión (TX)
  byte query[] = {0x01, 0x03, 0x00, 0x00, 0x00, 0x06, 0xC5, 0xC8}; // Modbus Hex
  Serial2.write(query, sizeof(query));
  Serial2.flush();
  digitalWrite(RS485_DIR_PIN, LOW);  // Volver a Escucha (RX)
}`,
    pedagogicTip: '💡 Consejo de Terreno: Los buses RS485 toleran hasta 1.200 metros de longitud en el campo. Usa siempre cable de par trenzado apantallado (STP Cat 5/6) para evitar que los ráfagas de los motores de bombas generen ruido electromagnético en los datos.'
  },

  {
    id: 'circuit-phytos31-leaf',
    category: 'Sanidad Vegetal & Plagas',
    title: 'Sensor de Mojamiento Foliar (PHYTOS-31 Mills) para Presión Fúngica',
    mcu: 'ESP32-C3 Ultra-Low-Power',
    voltage: '2.5V - 5V DC',
    protocol: 'Analógico / Salida de Voltaje Lineal o Pulsos de Frecuencia',
    sensorName: 'METER PHYTOS-31 (Hoja Dieléctrica Artificial)',
    icon: '🍃',
    difficulty: 'Fácil (3 cables)',
    description: 'Mide la presencia de agua sobre la superficie foliar calculando la constante dieléctrica del agua líquida sobre una rejilla de circuito impreso. Esencial para calcular las "Horas de Hoja Mojada" del modelo de Mills contra Botrytis cinerea y Venturia.',
    materials: [
      '1x ESP32-C3 o ESP32 con ADC calibrado',
      '1x Sensor de hoja artificial PHYTOS-31 con cable de 5m',
      '1x Soporte de montaje en varilla para inclinar a 45°',
      '1x Divisor resistivo o filtro pasabajo RC (10kΩ + 100nF) para reducir ruido ADC'
    ],
    connections: [
      { pinSensor: 'Blanco (Power)', pinEsp: '3V3 / GPIO conmutable', color: '#ef4444', wireType: 'Alimentación DC', note: '2.5V a 5.0V (miliamperios mínimos)' },
      { pinSensor: 'Negro (Ground)', pinEsp: 'GND', color: '#1e293b', wireType: 'Tierra común', note: 'Referencia analógica de 0V' },
      { pinSensor: 'Rojo (Output Voltaje)', pinEsp: 'GPIO 34 (ADC1_CH6)', color: '#10b981', wireType: 'Entrada Analógica ADC', note: '250 mV a 1.250 mV. <450 mV = Seco, >600 mV = Mojado' }
    ],
    codeSnippet: `// Lectura Analógica con Atenuación para ESP32
#define PIN_LEAF_ADC 34

void setup() {
  analogSetPinAttenuation(PIN_LEAF_ADC, ADC_11db); // Rango 0 a 3.3V
}

void loop() {
  int rawAdc = analogRead(PIN_LEAF_ADC);
  float voltageMv = (rawAdc / 4095.0) * 3300.0;
  
  bool isLeafWet = (voltageMv > 500.0);
  Serial.printf("Voltaje Hoja: %.1f mV -> Estado: %s\\n", 
                voltageMv, isLeafWet ? "MOJADA (Riesgo Hongo)" : "SECA");
  delay(5000);
}`,
    pedagogicTip: '💡 Consejo de Terreno: Orienta la hoja artificial hacia el norte o en un ángulo de 45° con respecto al suelo simulando la canopia real. Nunca pintes ni raspes la superficie dieléctrica con cuchilla, límpiala suavemente con agua destilada y un paño sin pelusa.'
  },

  {
    id: 'circuit-relays-actuators',
    category: 'Fuerza & Actuación',
    title: 'Módulo de 4 Canales de Relé Industrial Optoacoplados (Electroválvulas & Bomba)',
    mcu: 'ESP32-S3 / ESP32 Estándar',
    voltage: '5V (Bobinas) / 3.3V (Lógica Optoaislada)',
    protocol: 'GPIO Digital (Salida Push-Pull Active-LOW)',
    sensorName: 'Banco de Relés SPDT Songle / Omron 10A 250VAC',
    icon: '⚡',
    difficulty: 'Intermedio (Lógica Optoacoplador)',
    description: 'Control de potencia para conmutación de electroválvulas de 24V AC de riego por goteo, arrancadores suaves de bombas trifásicas de pozo y cortinas térmicas. Dispone de optoacoplamiento galvánico para aislar los transitorios de los motores del microcontrolador.',
    materials: [
      '1x ESP32-S3',
      '1x Módulo 4 u 8 Relés de 5V con optoacopladores (PC817)',
      '1x Fuente de alimentación doble: 5V DC para bobinas + 3.3V para ESP32',
      '1x Borneras industriales de carril DIN',
      '4x Diodos Flyback / Snubbers RC (para cargas inductivas de 24VAC)'
    ],
    connections: [
      { pinSensor: 'VCC (Módulo Relé)', pinEsp: '5V (Fuente Externa)', color: '#ef4444', wireType: 'Alimentación de Bobinas', note: 'Alimentar por separado para no saturar el regulador 3.3V del ESP32' },
      { pinSensor: 'GND (Módulo Relé)', pinEsp: 'GND (Común)', color: '#1e293b', wireType: 'Tierra del sistema', note: 'Unir tierras lógica y de potencia si no se retira el jumper JD-VCC' },
      { pinSensor: 'IN1 (Relé Bomba Pozo)', pinEsp: 'GPIO 25', color: '#f59e0b', wireType: 'Control Digital', note: 'LOW = Bobina armada / Contacto C-NO cerrado' },
      { pinSensor: 'IN2 (Relé Válvula Cerezos)', pinEsp: 'GPIO 26', color: '#10b981', wireType: 'Control Digital', note: 'LOW = Válvula 24VAC energizada' },
      { pinSensor: 'IN3 (Relé Válvula Viña)', pinEsp: 'GPIO 27', color: '#8b5cf6', wireType: 'Control Digital', note: 'LOW = Sector RDC abierto' },
      { pinSensor: 'IN4 (Relé Aspersión Helada)', pinEsp: 'GPIO 14', color: '#06b6d4', wireType: 'Control Digital', note: 'Interbloqueado por software si Bulbo Húmedo < -0.5°C' }
    ],
    codeSnippet: `// Manejo de Relés Optoacoplados (Active-LOW)
#define RELAY_PUMP 25
#define RELAY_VALVE_CHERRIES 26
#define RELAY_VALVE_VINES 27
#define RELAY_FROST_SPRINKLERS 14

void setup() {
  // Asegurar que inician apagados (HIGH) antes de configurar OUTPUT
  digitalWrite(RELAY_PUMP, HIGH);
  digitalWrite(RELAY_VALVE_CHERRIES, HIGH);
  pinMode(RELAY_PUMP, OUTPUT);
  pinMode(RELAY_VALVE_CHERRIES, OUTPUT);
}

void triggerIrrigationSector(bool activate) {
  // LOW activa el optoacoplador y la bobina del relé
  digitalWrite(RELAY_VALVE_CHERRIES, activate ? LOW : HIGH);
}`,
    pedagogicTip: '💡 Consejo de Seguridad Industrial: Retira el jumper "JD-VCC" del módulo de relés si quieres aislamiento galvánico 100% puro. Alimenta las bobinas con una fuente independiente de 5V y usa solo VCC de 3.3V del ESP32 para los LEDs de los optoacopladores.'
  },

  {
    id: 'circuit-ili9341-tft',
    category: 'Interfaz Diegética & Display',
    title: 'Pantalla TFT Color 3.5" (ILI9341 SPI) con Bus de Alta Velocidad',
    mcu: 'ESP32-S3 (Hardware SPI Bus)',
    voltage: '3.3V DC / 5V VCC',
    protocol: 'SPI Bus a 40 MHz (VSPI / HSPI)',
    sensorName: 'Display Gráfico ILI9341 320x240 RGB con Backlight LED',
    icon: '📟',
    difficulty: 'Intermedio (7 cables SPI)',
    description: 'Es el display que ves montado en la puerta de la Caja de Terreno. Muestra las curvas térmicas, el estado de los relés, la señal LoRaWAN y las alertas agronómicas locales sin necesidad de llevar un ordenador al campo.',
    materials: [
      '1x ESP32-S3',
      '1x Pantalla TFT 3.2" o 3.5" ILI9341 SPI',
      '1x Cable plano tipo ribbon (7 a 8 hilos cortos < 15 cm)'
    ],
    connections: [
      { pinSensor: 'VCC', pinEsp: '3V3 / 5V (según regulador placa)', color: '#ef4444', wireType: 'Alimentación', note: 'La mayoría de boards ILI9341 traen regulador 3.3V integrado' },
      { pinSensor: 'GND', pinEsp: 'GND', color: '#1e293b', wireType: 'Tierra', note: 'Referencia común' },
      { pinSensor: 'CS (Chip Select)', pinEsp: 'GPIO 15', color: '#f59e0b', wireType: 'SPI Chip Select', note: 'Activa la comunicación con la pantalla' },
      { pinSensor: 'RESET', pinEsp: 'GPIO 4 (o EN)', color: '#94a3b8', wireType: 'Reset Hardware', note: 'Reinicio físico del controlador ILI9341' },
      { pinSensor: 'DC (Data/Command)', pinEsp: 'GPIO 2', color: '#a855f7', wireType: 'Control D/C', note: 'HIGH = Datos gráficos, LOW = Comando de registro' },
      { pinSensor: 'MOSI / SDI', pinEsp: 'GPIO 23 (Master Out Slave In)', color: '#22c55e', wireType: 'Datos SPI (Frame Buffer)', note: 'Línea de transmisión a 40 MHz' },
      { pinSensor: 'SCK / CLK', pinEsp: 'GPIO 18 (Serial Clock)', color: '#facc15', wireType: 'Reloj SPI', note: 'Frecuencia de refresco de pantalla' },
      { pinSensor: 'LED (Backlight)', pinEsp: '3V3 (o GPIO PWM para dimmer)', color: '#fb923c', wireType: 'Luz de Fondo', note: 'Conectar a 3.3V a través de resistencia 100 Ω' }
    ],
    codeSnippet: `// Driver TFT_eSPI (User_Setup.h)
#define USER_SETUP_LOADED 1
#define ILI9341_DRIVER
#define TFT_MISO 19
#define TFT_MOSI 23
#define TFT_SCLK 18
#define TFT_CS   15
#define TFT_DC    2
#define TFT_RST   4
#define SPI_FREQUENCY 40000000 // 40MHz ultra fluido`,
    pedagogicTip: '💡 Consejo de Refresco: Si la pantalla parpadea o se llena de nieve blanca al enviar datos, es por capacitancia parásita en cables largos. Mantén los cables SPI por debajo de 12 cm de longitud o baja la frecuencia SPI a 27 MHz.'
  },

  {
    id: 'circuit-lora-sx1262',
    category: 'Comunicaciones de Campo',
    title: 'Transceptor LoRaWAN de Largo Alcance (Semtech SX1262 / RFM95W)',
    mcu: 'ESP32 / ESP32-C3',
    voltage: '3.3V DC Limpio',
    protocol: 'SPI Bus + Pines de Interrupción DIO1 / BUSY',
    sensorName: 'Módulo LoRa SX1262 915 MHz (Chirp Spread Spectrum)',
    icon: '📡',
    difficulty: 'Avanzado (Antena & SPI)',
    description: 'Permite transmitir los paquetes de telemetría de suelo y microclima hasta 12 km de distancia a través de cerros y valles hacia el Gateway central del fundo, utilizando bandas libres ISM (AU915 en Chile).',
    materials: [
      '1x ESP32 DevKit',
      '1x Módulo LoRa Semtech SX1262 con conector SMA',
      '1x Antena de fibra de vidrio 915 MHz de 3 dBi o 5.8 dBi',
      '1x Condensador de tántalo 10 µF para soportar los pulsos de transmisión (+22 dBm)'
    ],
    connections: [
      { pinSensor: '3V3', pinEsp: '3V3 (Regulador de bajo ruido)', color: '#ef4444', wireType: 'Alimentación', note: 'Picos de hasta 120 mA durante transmisión RF' },
      { pinSensor: 'GND', pinEsp: 'GND', color: '#1e293b', wireType: 'Plano de Tierra', note: 'Crucial para el rendimiento RF de la antena' },
      { pinSensor: 'NSS (CS)', pinEsp: 'GPIO 5', color: '#f59e0b', wireType: 'SPI Slave Select', note: 'Selección de chip LoRa' },
      { pinSensor: 'SCK', pinEsp: 'GPIO 18', color: '#facc15', wireType: 'SPI Clock', note: 'Reloj SPI a 10 MHz' },
      { pinSensor: 'MOSI', pinEsp: 'GPIO 23', color: '#22c55e', wireType: 'SPI MOSI', note: 'Envío de payloads y registros' },
      { pinSensor: 'MISO', pinEsp: 'GPIO 19', color: '#38bdf8', wireType: 'SPI MISO', note: 'Recepción de datos de radio' },
      { pinSensor: 'DIO1', pinEsp: 'GPIO 35 (o GPIO 3)', color: '#a855f7', wireType: 'Interrupción Rx/Tx Done', note: 'Avisa al ESP32 que el paquete terminó de salir al aire' },
      { pinSensor: 'BUSY', pinEsp: 'GPIO 32 (o GPIO 2)', color: '#ec4899', wireType: 'Línea de Estado SX1262', note: 'Indica si el oscilador RF está ocupado' }
    ],
    codeSnippet: `// RadioLib Library para SX1262
#include <RadioLib.h>

SX1262 radio = new Module(5, 35, 14, 32); // NSS, DIO1, NRST, BUSY

void setup() {
  int state = radio.begin(915.0, 125.0, 7, 5, 0x12, 22); // 915MHz, SF7, BW125kHz, 22dBm
  if (state == RADIOLIB_ERR_NONE) {
    Serial.println("LoRa SX1262 Listo para Enlace Fundo");
  }
}`,
    pedagogicTip: '⚠️ REGLA DE ORO DE RADIOFRECUENCIA: NUNCA enciendas ni transmitas con el módulo LoRa sin tener la antena SMA conectada; la potencia reflejada quemará el amplificador de potencia final (PA) en menos de 1 segundo.'
  }
];
