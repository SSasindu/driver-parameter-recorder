#include <TinyGPS++.h>
#include <Wire.h>
#include <MPU6050.h>
#include "FS.h"
#include "SD.h"
#include "SPI.h"
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFiManager.h>

#define RXD2 16
#define TXD2 17
#define I2C_SDA 22
#define I2C_SCL 21

#define CS 5
#define MISO 19 //12
#define MOSI 23 //13
#define SCK 18 //14

#define MAX_LINES 200
#define GPS_BAUD 9600

#define redLED 25
#define greenLED 32
#define yellowLED 33

int count = 0;
const int deviceId = 13;
int16_t ax=0, ay=0, az=0, gx=0, gy=0, gz=0;
float accX, accY, accZ, filtered_ax, filtered_ay, filtered_az, gyroX, gyroY, gyroZ;
// Filtered linear acceleration
float linAccX_f = 0, linAccY_f = 0, linAccZ_f = 0;
// Store last input for HPF
float lastLinAccX = 0, lastLinAccY = 0, lastLinAccZ = 0;
const float alpha = 0.93;
float roll = 0, pitch = 0, yaw = 0;
unsigned long lastTime = 0;

const char *serverName = "https://driver-parameter-recorder-web.vercel.app/api/upload";

TinyGPSPlus gps;
MPU6050 mpu;

HardwareSerial gpsSerial(2);

// Kalman filter
class SimpleKalmanFilter
{
  float _err_measure;
  float _err_estimate;
  float _q;
  float _current_estimate;
  float _last_estimate;
  float _kalman_gain;

public:
  SimpleKalmanFilter(float mea_e, float est_e, float q)
  {
    _err_measure = mea_e;
    _err_estimate = est_e;
    _q = q;
  }

  float updateEstimate(float mea)
  {
    _kalman_gain = _err_estimate / (_err_estimate + _err_measure);
    _current_estimate = _last_estimate + _kalman_gain * (mea - _last_estimate);
    _err_estimate = (1.0 - _kalman_gain) * _err_estimate + fabs(_last_estimate - _current_estimate) * _q;
    _last_estimate = _current_estimate;
    return _current_estimate;
  }

  void setMeasurementError(float mea_e) { _err_measure = mea_e; }
  void setEstimateError(float est_e) { _err_estimate = est_e; }
  void setProcessNoise(float q) { _q = q; }
};

void writeFile(fs::FS &fs, const char *path, const char *message)
{
  Serial.printf("Writing file: %s\n", path);

  File file = fs.open(path, FILE_WRITE);
  if (!file)
  {
    Serial.println("Failed to open file for writing");
    return;
  }
  if (file.println(message))
  {
    Serial.println("File written");
  }
  else
  {
    Serial.println("Write failed");
  }
  file.close();
}

void logDataToSD(float ax, float ay, float az, float speed, String date, String time)
{
  digitalWrite(yellowLED, HIGH);
  File file = SD.open("/data.txt", FILE_APPEND);
  StaticJsonDocument<200> doc;
  doc["deviceId"] = deviceId;
  doc["date"] = date;
  doc["time"] = time;
  doc["accX"] = ax;
  doc["accY"] = ay;
  doc["accZ"] = az;
  doc["speed"] = speed;
  doc["valid"] = 1;
  String json;
  serializeJson(doc, json);

  // appendFile(SD, "/data.txt", json)
  if (file)
  {
    file.println(json);
    file.flush();
    file.close();
    Serial.println("Data logged.");
    delay(75);
    digitalWrite(yellowLED, LOW);
  }
  else
  {
    Serial.println("Failed to open file.");
  }
}

String readFileToJsonArray()
{
  File file = SD.open("/data.txt", FILE_READ);
  if (!file)
  {
    Serial.println("Failed to open file");
    return "";
  }

  String jsonPayload = "[";
  bool first = true;

  while (file.available())
  {
    String line = file.readStringUntil('\n');
    line.trim();
    if (line.length() == 0) continue;
    if (!line.endsWith("}")) continue;      
    if (line.indexOf("\"valid\":1") == -1) continue; 

    if (!first) jsonPayload += ",";
    jsonPayload += line;
    first = false;
  }

  jsonPayload += "]";
  file.close();

  return jsonPayload;
}

void sendSDDataToServer()
{
  digitalWrite(greenLED,HIGH);
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("WiFi not connected");
    return;
  }

  String jsonString = readFileToJsonArray();

  HTTPClient http;
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(jsonString);
  String response = http.getString();

  Serial.print("Response code: ");
  Serial.println(httpCode);
  Serial.println("Response: " + response);

  if (httpCode == 200)
  {
    writeFile(SD, "/data.txt", "User_1"); // Only if successfully inserted, Data cleared
    // delay(150);
    digitalWrite(greenLED,LOW);
  }
  http.end();
}

void createAccessPoint(){
  digitalWrite(greenLED,HIGH);
  WiFiManager wm;
  // Try to connect, if fails, start AP mode with config portal
  if (!wm.autoConnect("ESP32_ConfigAP", "12345678")) {
    Serial.println("Failed to connect and hit timeout");
    ESP.restart();
  }

  Serial.println("Connected to Wi-Fi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  // delay(200);
  digitalWrite(greenLED,LOW);
}

SimpleKalmanFilter kf_ax(0.1, 0.1, 0.5);
SimpleKalmanFilter kf_ay(0.1, 0.1, 0.5);
SimpleKalmanFilter kf_az(0.1, 0.1, 0.5);

SimpleKalmanFilter kf_speed(3, 3, 0.01);

void setup()
{
  Serial.begin(GPS_BAUD);
  createAccessPoint();
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);
  Serial.println("Serial 2 started at 9600 baud rate");
  Wire.begin(I2C_SDA, I2C_SCL);
  pinMode(redLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
  digitalWrite(redLED,LOW);
  digitalWrite(greenLED,LOW);
  digitalWrite(yellowLED,LOW);

  //MPU initialization
  mpu.initialize();

  if (mpu.testConnection())
  {
    Serial.println("MPU6050 connected successfully!");
    lastTime = millis();
  }
  else
  {
    Serial.println("MPU6050 connection failed!");
    while (1)
      ; // Stop if failed
  }

  // SD card accessing
  if (!SD.begin(CS))
  {
    Serial.println("Card Mount Failed");
  }

  if (!SD.exists("/data.txt"))
  {
    Serial.println("Creating new file...");
    writeFile(SD, "/data.txt", "");
  }

  // String array = readFileToJsonArray();
  // Serial.print(array);

  // readFile(SD, "/data.txt");
  sendSDDataToServer();
  writeFile(SD, "/data.txt", "");
}

void loop()
{
  // ax = ay = az = gx = gy = gz = 0;
  // mpu.getAcceleration(&ax, &ay, &az);
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  accX = (float)ax / 16384.0;
  accY = (float)ay / 16384.0;
  accZ = (float)az / 16384.0;
  gyroX = gx / 131.0; 
  gyroY = gy / 131.0;
  gyroZ = gz / 131.0;

  // Apply Kalman filtering
  accX = kf_ax.updateEstimate(accX);
  accY = kf_ay.updateEstimate(accY);
  accZ = kf_az.updateEstimate(accZ);

  unsigned long now = millis();
  float dt = (now - lastTime) / 1000.0;
  lastTime = now;

  float accRoll = atan2(accY, accZ) * 180 / PI;
  float accPitch = atan2(-accX, sqrt(accY * accY + accZ * accZ)) * 180 / PI;

  roll = 0.98 * (roll + gyroX * dt) + 0.02 * accRoll;
  pitch = 0.98 * (pitch + gyroY * dt) + 0.02 * accPitch;
  yaw += gyroZ * dt;

  float gX = sin(radians(pitch));
  float gY = sin(radians(roll));
  float gZ = cos(radians(pitch)) * cos(radians(roll));

  float linAccX = (accX - gX) * 9.80665;
  float linAccY = (accY - gY) * 9.80665;
  float linAccZ = (accZ - gZ) * 9.80665;

  // Apply High-Pass Filter (HPF)
  linAccX_f = alpha * (linAccX_f + linAccX - lastLinAccX);
  linAccY_f = alpha * (linAccY_f + linAccY - lastLinAccY);
  linAccZ_f = alpha * (linAccZ_f + linAccZ - lastLinAccZ);

  // Update last raw inputs
  lastLinAccX = linAccX;
  lastLinAccY = linAccY;
  lastLinAccZ = linAccZ;

  // Serial.print("filteredLinearAccX(m/s^2):");
  // Serial.print(linAccX_f); Serial.print(",");
  // Serial.print("filteredLinearAccY(m/s^2):");
  // Serial.print(linAccY_f); Serial.print(",");
  // Serial.print("filteredLinearAccZ(m/s^2):");
  // Serial.println(linAccZ_f);  

  while (gpsSerial.available() > 0)
  {
    gps.encode(gpsSerial.read());
  }

  int hour = gps.time.hour();
  int minute = gps.time.minute();

  // Add +5 hours and +30 minutes
  minute += 30;
  hour += 5;

  if (minute >= 60)
  {
    minute -= 60;
    hour += 1;
  }
  if (hour >= 24)
  {
    hour -= 24;
  }

  // properly format details
  char timeBuffer[10];
  sprintf(timeBuffer, "%02d:%02d:%02d", hour, minute, gps.time.second());
  float raw_speed = gps.speed.kmph();
  float filtered_speed = kf_speed.updateEstimate(raw_speed);
  String date = String(gps.date.year()) + "-" + String(gps.date.month()) + "-" + String(gps.date.day());
  String timeStr = timeBuffer;

  if (date == "2000-0-0"){
    digitalWrite(redLED,HIGH);
    return;
  }
  digitalWrite(redLED,LOW);

  logDataToSD(linAccX_f, linAccY_f, linAccZ_f, filtered_speed, date, timeStr);
  count++;
  if (count >= MAX_LINES)
  {
    sendSDDataToServer();
    count = 0;
  }

  delay(500);
}
