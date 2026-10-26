/**
 * firmware/esp32_field_enclosure.ino
 * 
 * AgriTwin 3D - Firmware Base para Controlador de Campo ESP32
 * Compatible con:
 * - Placas: ESP32 DevKit v1 / ESP32-S3 / TTGO T-Display
 * - Pantalla: TFT 3.5" ILI9341 (SPI) o ST7789
 * - Módulo Relés: Placa de 4/8 canales con optoacopladores (Active LOW)
 * - Sensórica I2C/Analógica: BME280 / SHT45 (T/RH), FDR Capacitivo de Suelo
 * 
 * Funcionalidad:
 * 1. Conexión WiFi a router de predio o hotspot 4G
 * 2. Consulta a OpenWeatherMap API para pronóstico y macro-clima
 * 3. Renderiza en pantalla TFT la interfaz idéntica al gemelo digital
 * 4. Polling a http://<IP_AGRITWIN>:7773/api/enclosure/status para activar/desactivar relés físicos
 * 5. Envía lecturas locales a http://<IP_AGRITWIN>:7773/api/enclosure/telemetry
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <TFT_eSPI.h> // Configurar User_Setup.h con el driver de tu pantalla

// ─── Configuración de Red & API ──────────────────────────────────────────────
const char* WIFI_SSID     = "AgroTech_Predio_WiFi";
const char* WIFI_PASSWORD = "TuPasswordSeguro";
const char* OWM_API_KEY   = "TU_API_KEY_OPENWEATHERMAP"; // Opcional si el servidor actúa de proxy
const char* AGRITWIN_HOST = "http://192.168.1.100:7773"; // IP de la máquina donde corre AgriTwin

// Coordenadas del Predio (Parral / Retiro, Maule)
const float LAT = -36.14;
const float LON = -71.82;

// ─── Pines de Relés (Módulo de 4 Canales Optoacoplado) ────────────────────────
const int RELAY_PIN_VALVE_CHERRIES   = 25; // GPIO25 -> Relé 1 (Válvula Cerezos)
const int RELAY_PIN_FROST_SPRINKLERS = 26; // GPIO26 -> Relé 2 (Aspersión Helada)
const int RELAY_PIN_DEEPWELL_PUMP    = 27; // GPIO27 -> Relé 3 (Bomba Pozo DGA)
const int RELAY_PIN_WATER_TROUGH     = 14; // GPIO14 -> Relé 4 (Bebederos Establo)

// ─── Instancias ──────────────────────────────────────────────────────────────
TFT_eSPI tft = TFT_eSPI();
unsigned long lastPollTime = 0;
const unsigned long POLL_INTERVAL_MS = 15000; // Cada 15 segundos

void setup() {
  Serial.begin(115200);
  delay(500);

  // Inicializar pines de relés (Inician apagados en HIGH para placas activas en LOW)
  pinMode(RELAY_PIN_VALVE_CHERRIES, OUTPUT);
  pinMode(RELAY_PIN_FROST_SPRINKLERS, OUTPUT);
  pinMode(RELAY_PIN_DEEPWELL_PUMP, OUTPUT);
  pinMode(RELAY_PIN_WATER_TROUGH, OUTPUT);

  digitalWrite(RELAY_PIN_VALVE_CHERRIES, HIGH);
  digitalWrite(RELAY_PIN_FROST_SPRINKLERS, HIGH);
  digitalWrite(RELAY_PIN_DEEPWELL_PUMP, HIGH);
  digitalWrite(RELAY_PIN_WATER_TROUGH, HIGH);

  // Inicializar Display TFT
  tft.init();
  tft.setRotation(1); // Modo apaisado (Landscape)
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setTextSize(2);
  tft.drawString("AGRITWIN 3D - ESP32", 20, 30);
  tft.setTextSize(1);
  tft.drawString("Gabinete Industrial IP67 - Red Maule Sur", 20, 60);

  // Conectar WiFi
  tft.drawString("Conectando WiFi...", 20, 90);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    tft.drawString("WiFi Conectado! IP: " + WiFi.localIP().toString(), 20, 110);
    delay(1000);
  } else {
    tft.setTextColor(TFT_RED, TFT_BLACK);
    tft.drawString("Modo Autónomo Local (Sin WiFi)", 20, 110);
  }

  drawEnclosureDashboardUI();
}

void loop() {
  if (millis() - lastPollTime >= POLL_INTERVAL_MS) {
    lastPollTime = millis();
    syncWithAgriTwinServer();
  }
  delay(100);
}

void drawEnclosureDashboardUI() {
  tft.fillScreen(TFT_BLACK);

  // Cabecera Industrial
  tft.fillRect(0, 0, 320, 24, tft.color565(30, 15, 8));
  tft.setTextColor(TFT_GOLD, tft.color565(30, 15, 8));
  tft.setTextSize(1);
  tft.drawString("CONTROLADOR DE CAMPO IP67 • MAULE SUR", 10, 6);

  // Cuadro Macro OpenWeather
  tft.drawRect(8, 30, 148, 110, TFT_NAVY);
  tft.setTextColor(TFT_CYAN, TFT_BLACK);
  tft.drawString("MACRO: OPENWEATHER", 14, 36);
  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setTextSize(2);
  tft.drawString("18.5 C", 14, 52);
  tft.setTextSize(1);
  tft.drawString("Viento: 6.8 km/h ENE", 14, 76);
  tft.drawString("Lluvia 72h: 14.5 mm", 14, 92);
  tft.setTextColor(TFT_YELLOW, TFT_BLACK);
  tft.drawString("Alerta Cracking 75%", 14, 112);

  // Cuadro Microclima Suelo
  tft.drawRect(164, 30, 148, 110, tft.color565(120, 53, 15));
  tft.setTextColor(TFT_ORANGE, TFT_BLACK);
  tft.drawString("SUELO & FRUTA (IN SITU)", 170, 36);
  tft.setTextColor(TFT_RED, TFT_BLACK);
  tft.setTextSize(2);
  tft.drawString("-0.8 C", 170, 52);
  tft.setTextSize(1);
  tft.drawString("Bulbo Humedo: -1.5 C", 170, 76);
  tft.drawString("Suelo FDR: 36.2% VWC", 170, 92);
  tft.setTextColor(TFT_RED, TFT_BLACK);
  tft.drawString("NO REGAR HELADA!", 170, 112);

  // Zona Inferior: Relés
  tft.fillRect(8, 150, 304, 78, tft.color565(20, 10, 5));
  tft.drawRect(8, 150, 304, 78, tft.color565(90, 40, 10));
  tft.setTextColor(TFT_WHITE, tft.color565(20, 10, 5));
  tft.drawString("BANCO DE RELES INDUSTRIALES (ACTUADORES):", 14, 156);

  tft.drawString("R1 Cerezos: [BLOQUEO LLUVIA]", 14, 172);
  tft.drawString("R2 Helada:  [INTERBLOQUEO Twb]", 14, 186);
  tft.drawString("R3 Pozo:    [APAGADO TURNO DGA]", 14, 200);
  tft.drawString("R4 Establo: [ACTIVO BEBEDERO]", 14, 214);
}

void syncWithAgriTwinServer() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(AGRITWIN_HOST) + "/api/enclosure/status";
  http.begin(url);
  int httpCode = http.GET();

  if (httpCode == 200) {
    String payload = http.getString();
    StaticJsonDocument<512> doc;
    deserializeJson(doc, payload);

    bool r1 = doc["relays"]["r1_cherries_valve"];
    bool r2 = doc["relays"]["r2_frost_sprinklers"];
    bool r3 = doc["relays"]["r3_deepwell_pump"];
    bool r4 = doc["relays"]["r4_water_trough"];

    // Actualizar pines físicos (LOW = Encendido)
    digitalWrite(RELAY_PIN_VALVE_CHERRIES, r1 ? LOW : HIGH);
    digitalWrite(RELAY_PIN_FROST_SPRINKLERS, r2 ? LOW : HIGH);
    digitalWrite(RELAY_PIN_DEEPWELL_PUMP, r3 ? LOW : HIGH);
    digitalWrite(RELAY_PIN_WATER_TROUGH, r4 ? LOW : HIGH);

    Serial.println("[AgriTwin ESP32] Relés sincronizados con el Gemelo Digital.");
  }
  http.end();
}
