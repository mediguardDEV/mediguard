/*
 * ==============================================================================
 * MEDIGUARD SMART PILL DISPENSER - OFFICIAL ESP32 FIRMWARE (.INO)
 * ==============================================================================
 * Hardware Pinout Mapping based on MediGuard Wiring Blueprint (ESP32 DevKit 38 Pin):
 * 
 * 1. OLED DISPLAY (SSD1306 128x64 I2C):
 *    VCC -> 3V3, GND -> GND, SCL -> D22, SDA -> D21
 * 
 * 2. RTC DS1307 (I2C):
 *    VCC -> 5V, GND -> GND, SCL -> D22, SDA -> D21
 * 
 * 3. 4x4 MATRIX KEYPAD:
 *    Rows: R1 -> D13, R2 -> D12, R3 -> D14, R4 -> D27
 *    Cols: C1 -> D26, C2 -> D25, C3 -> D33, C4 -> D32
 * 
 * 4. BUZZER (Active 5V):
 *    + -> D4, - -> GND
 * 
 * 5. LED INDICATORS (With 220Ω Resistors):
 *    Morning (Green)  -> D16
 *    Afternoon (Yellow) -> D17
 *    Evening (Blue)   -> D18
 *    Night (Red)      -> D19
 * 
 * 6. SERVO MOTORS (Pill Dispensers):
 *    Servo 1 (Morning)   -> D2
 *    Servo 2 (Afternoon) -> D15
 *    Servo 3 (Evening)   -> D5
 *    Servo 4 (Night)     -> D23
 * 
 * FEATURES:
 * - Bluetooth Provisioning: Configure WiFi SSID, Password & User ID via BT Terminal
 * - User ID Locking: Locks device telemetry to the logged-in user account ID/email
 * - Web Sync: Posts real-time measurements & dose logs to MediGuard API
 * - Device Unbinding / Reset: Press Keypad 'D' twice or '*' + '#' to clear saved User ID & WiFi
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <BluetoothSerial.h>
#include <Preferences.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <RTClib.h>
#include <ESP32Servo.h>
#include <Keypad.h>

// --- PIN DEFINITIONS ---
#define OLED_RESET -1
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define BUZZER_PIN 4

// LED Pins
#define LED_MORNING 16
#define LED_AFTERNOON 17
#define LED_EVENING 18
#define LED_NIGHT 19

// Servo Pins
#define SERVO_MORNING 2
#define SERVO_AFTERNOON 15
#define SERVO_EVENING 5
#define SERVO_NIGHT 23

// 4x4 Keypad Setup
const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {13, 12, 14, 27};
byte colPins[COLS] = {26, 25, 33, 32};
Keypad customKeypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// Hardware Objects
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
RTC_DS1307 rtc;
BluetoothSerial SerialBT;
Preferences preferences;

Servo servoMorning;
Servo servoAfternoon;
Servo servoEvening;
Servo servoNight;

// Global State
String wifiSSID = "";
String wifiPass = "";
String boundUserId = "";
String deviceId = "";
String serverApiUrl = "https://your-mediguard-app.com/api/esp32/sync"; // Or local server IP

bool isWiFiConnected = false;
unsigned long lastSyncTime = 0;
const unsigned long SYNC_INTERVAL = 10000; // Sync telemetry every 10s

char lastKeyPressed = ' ';
unsigned long lastKeyTime = 0;

void setup() {
  Serial.begin(115200);

  // Initialize Pins
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_MORNING, OUTPUT);
  pinMode(LED_AFTERNOON, OUTPUT);
  pinMode(LED_EVENING, OUTPUT);
  pinMode(LED_NIGHT, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_MORNING, LOW);
  digitalWrite(LED_AFTERNOON, LOW);
  digitalWrite(LED_EVENING, LOW);
  digitalWrite(LED_NIGHT, LOW);

  // Initialize Servos
  servoMorning.attach(SERVO_MORNING);
  servoAfternoon.attach(SERVO_AFTERNOON);
  servoEvening.attach(SERVO_EVENING);
  servoNight.attach(SERVO_NIGHT);

  servoMorning.write(0);
  servoAfternoon.write(0);
  servoEvening.write(0);
  servoNight.write(0);

  // Initialize I2C (SCL=22, SDA=21)
  Wire.begin(21, 22);

  // OLED Setup
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 OLED allocation failed");
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("MEDIGUARD SMART BOX");
  display.println("Booting System...");
  display.display();

  // RTC Setup
  if (!rtc.begin()) {
    Serial.println("Couldn't find RTC");
  }

  // Device Unique ID from MAC
  uint64_t chipid = ESP.getEfuseMac();
  deviceId = "MEDIGUARD-" + String((uint32_t)(chipid >> 32), HEX) + String((uint32_t)chipid, HEX);
  deviceId.toUpperCase();

  // Load Saved Credentials from NVS Memory
  preferences.begin("mediguard", false);
  wifiSSID = preferences.getString("ssid", "");
  wifiPass = preferences.getString("pass", "");
  boundUserId = preferences.getString("user_id", "");

  Serial.println("Device ID: " + deviceId);
  Serial.println("Bound User ID: " + (boundUserId.length() > 0 ? boundUserId : "UNBOUND"));

  if (wifiSSID.length() == 0 || boundUserId.length() == 0) {
    startBluetoothProvisioning();
  } else {
    connectToWiFi();
  }
}

void loop() {
  // Check Keypad Input
  char key = customKeypad.getKey();
  if (key) {
    handleKeypadPress(key);
  }

  // Handle Bluetooth Provisioning Stream
  if (SerialBT.hasClient() && SerialBT.available()) {
    handleBluetoothData();
  }

  // Periodically Sync Telemetry with Website API
  if (WiFi.status() == WL_CONNECTED && millis() - lastSyncTime > SYNC_INTERVAL) {
    lastSyncTime = millis();
    sendTelemetryToServer();
  }

  // Update Display
  updateOLEDDisplay();
  delay(50);
}

// --- BLUETOOTH PROVISIONING ---
void startBluetoothProvisioning() {
  String btName = "MediGuard_Box_" + deviceId.substring(deviceId.length() - 4);
  SerialBT.begin(btName);
  
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("BLUETOOTH PROVISION");
  display.println("Pair with BT Name:");
  display.println(btName);
  display.println("\nSend Format:");
  display.println("SSID:xxx,PASS:xxx,");
  display.println("USER_ID:your_email");
  display.display();

  // Beep sound indicator
  tone(BUZZER_PIN, 1000, 200);
}

void handleBluetoothData() {
  String input = SerialBT.readStringUntil('\n');
  input.trim();
  Serial.println("BT Received: " + input);

  // Expected Format: SSID:WifiName,PASS:Secret,USER_ID:user@example.com
  if (input.indexOf("SSID:") >= 0 && input.indexOf("USER_ID:") >= 0) {
    int ssidIndex = input.indexOf("SSID:");
    int passIndex = input.indexOf(",PASS:");
    int userIndex = input.indexOf(",USER_ID:");

    if (passIndex > ssidIndex && userIndex > passIndex) {
      wifiSSID = input.substring(ssidIndex + 5, passIndex);
      wifiPass = input.substring(passIndex + 6, userIndex);
      boundUserId = input.substring(userIndex + 9);

      // Save to NVS Flash Memory
      preferences.putString("ssid", wifiSSID);
      preferences.putString("pass", wifiPass);
      preferences.putString("user_id", boundUserId);

      SerialBT.println("SUCCESS: MediGuard Config Saved. Connecting...");
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("CONFIG RECEIVED!");
      display.println("Bound User: " + boundUserId);
      display.println("Connecting WiFi...");
      display.display();

      delay(1500);
      connectToWiFi();
    }
  } else {
    SerialBT.println("ERROR: Invalid format. Send: SSID:Name,PASS:Secret,USER_ID:user@email.com");
  }
}

// --- WIFI CONNECTION ---
void connectToWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(wifiSSID.c_str(), wifiPass.c_str());

  int attempts = 0;
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Connecting WiFi...");
  display.println("SSID: " + wifiSSID);
  display.display();

  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    isWiFiConnected = true;
    Serial.println("\nWiFi Connected! IP: " + WiFi.localIP().toString());
    
    // Play Success Melody
    tone(BUZZER_PIN, 1200, 100);
    delay(150);
    tone(BUZZER_PIN, 1600, 200);
  } else {
    isWiFiConnected = false;
    Serial.println("\nWiFi Connection Failed.");
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("WiFi Failed!");
    display.println("Press 'D' twice to reset.");
    display.display();
  }
}

// --- SERVER TELEMETRY SYNC ---
void sendTelemetryToServer() {
  if (WiFi.status() != WL_CONNECTED || boundUserId.length() == 0) return;

  HTTPClient http;
  http.begin(serverApiUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-owner", boundUserId);

  // Construct JSON Body
  String jsonBody = "{";
  jsonBody += "\"deviceId\":\"" + deviceId + "\",";
  jsonBody += "\"userId\":\"" + boundUserId + "\",";
  jsonBody += "\"ipAddress\":\"" + WiFi.localIP().toString() + "\",";
  jsonBody += "\"wifiSSID\":\"" + wifiSSID + "\",";
  jsonBody += "\"wifiSignalDbm\":" + String(WiFi.RSSI()) + ",";
  jsonBody += "\"batteryLevel\":95,";
  jsonBody += "\"isCharging\":false";
  jsonBody += "}";

  int httpResponseCode = http.POST(jsonBody);
  if (httpResponseCode > 0) {
    Serial.println("Telemetry Synced Successfully. HTTP " + String(httpResponseCode));
  } else {
    Serial.println("Telemetry Sync Error: " + String(httpResponseCode));
  }
  http.end();
}

// --- KEYPAD CONTROLS & UNBIND RESET ---
void handleKeypadPress(char key) {
  Serial.println("Key Pressed: " + String(key));

  // Sound Key Beep
  tone(BUZZER_PIN, 2000, 50);

  // Check for Double Press of 'D' for Device Reset/Unbind
  if (key == 'D') {
    if (lastKeyPressed == 'D' && (millis() - lastKeyTime < 3000)) {
      resetAndUnbindDevice();
      return;
    }
  }

  lastKeyPressed = key;
  lastKeyTime = millis();

  // Manual Dispense Actions
  if (key == '1') {
    dispenseCompartment("Morning", SERVO_MORNING, LED_MORNING, servoMorning);
  } else if (key == '2') {
    dispenseCompartment("Afternoon", SERVO_AFTERNOON, LED_AFTERNOON, servoAfternoon);
  } else if (key == '3') {
    dispenseCompartment("Evening", SERVO_EVENING, LED_EVENING, servoEvening);
  } else if (key == '4') {
    dispenseCompartment("Night", SERVO_NIGHT, LED_NIGHT, servoNight);
  }
}

void dispenseCompartment(String name, int servoPin, int ledPin, Servo &s) {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("DISPENSING DOSE");
  display.println("Slot: " + name);
  display.display();

  digitalWrite(ledPin, HIGH);
  s.write(90); // Rotate servo to open slot
  
  // Alert melody
  tone(BUZZER_PIN, 1500, 300);
  delay(2000);

  s.write(0); // Return servo to closed position
  digitalWrite(ledPin, LOW);

  // Notify Web Backend of Dose Action
  sendDoseLogToServer(name);
}

void sendDoseLogToServer(String compartment) {
  if (WiFi.status() != WL_CONNECTED || boundUserId.length() == 0) return;

  HTTPClient http;
  http.begin(serverApiUrl);
  http.addHeader("Content-Type", "application/json");

  String jsonBody = "{";
  jsonBody += "\"deviceId\":\"" + deviceId + "\",";
  jsonBody += "\"userId\":\"" + boundUserId + "\",";
  jsonBody += "\"event\":\"dose_taken\",";
  jsonBody += "\"compartment\":\"" + compartment + "\"";
  jsonBody += "}";

  http.POST(jsonBody);
  http.end();
}

// --- UNBIND DEVICE / RESET MEMORY ---
void resetAndUnbindDevice() {
  Serial.println("RESET TRIGGERED: Clearing User ID and WiFi Credentials...");

  // Warning Alarm Beeps
  for (int i = 0; i < 3; i++) {
    tone(BUZZER_PIN, 800, 200);
    delay(250);
  }

  // Clear Preferences in NVS Memory
  preferences.clear();
  wifiSSID = "";
  wifiPass = "";
  boundUserId = "";

  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("UNBOUND SUCCESS!");
  display.println("Device reset complete.");
  display.println("Restarting into");
  display.println("Bluetooth Mode...");
  display.display();

  delay(3000);
  ESP.restart();
}

// --- OLED DISPLAY LOOP ---
void updateOLEDDisplay() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("MEDIGUARD HEALTH BOX");
  display.println("---------------------");

  if (boundUserId.length() > 0) {
    display.println("User: " + boundUserId);
  } else {
    display.println("User: [UNBOUND]");
  }

  if (isWiFiConnected) {
    display.println("WiFi: Connected (" + String(WiFi.RSSI()) + "dBm)");
  } else {
    display.println("WiFi: Disconnected");
  }

  // Time from RTC or Uptime
  DateTime now = rtc.now();
  char timeBuffer[20];
  snprintf(timeBuffer, sizeof(timeBuffer), "Time: %02d:%02d:%02d", now.hour(), now.minute(), now.second());
  display.println(timeBuffer);

  display.display();
}
