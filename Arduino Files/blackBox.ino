#include <TinyGPS++.h>
#include <Wire.h>
#include <MPU6050.h>
#include "FS.h"
#include "SD.h"
#include "SPI.h"
#include <ArduinoJson.h>

#define RXD2 16
#define TXD2 17
#define I2C_SDA 22
#define I2C_SCL 21

#define CS 5
#define MISO 19
#define MOSI 23
#define SCK 18

#define MAX_LINES 600

#define GPS_BAUD 9600

TinyGPSPlus gps;
MPU6050 mpu;

HardwareSerial gpsSerial(2);

// Kalman filter
class SimpleKalmanFilter {
  float _err_measure;
  float _err_estimate;
  float _q;
  float _current_estimate;
  float _last_estimate;
  float _kalman_gain;

  public:
    SimpleKalmanFilter(float mea_e, float est_e, float q) {
      _err_measure = mea_e;
      _err_estimate = est_e;
      _q = q;
    }

    float updateEstimate(float mea) {
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

// Functions for SD card write
void readFile(fs::FS &fs, const char * path){
  Serial.printf("Reading file: %s\n", path);

  File file = fs.open(path);
  if(!file){
    Serial.println("Failed to open file for reading");
    return;
  }

  Serial.print("Read from file: ");
  while(file.available()){
    Serial.write(file.read());
  }
  file.close();
}

void writeFile(fs::FS &fs, const char * path, const char * message){
  Serial.printf("Writing file: %s\n", path);

  File file = fs.open(path, FILE_WRITE);
  if(!file){
    Serial.println("Failed to open file for writing");
    return;
  }
  if(file.println(message)){
    Serial.println("File written");
  } else {
    Serial.println("Write failed");
  }
  file.close();
}

void logDataToSD(float ax, float ay, float az, float speed, String date, String time) {
  File file = SD.open("/data.txt", FILE_APPEND);
  StaticJsonDocument<200> doc;
  doc["date"] = date;
  doc["time"] = time;
  doc["accX"] = ax;
  doc["accY"] = ay;
  doc["accZ"] = az;
  doc["speed"] = speed;
  String json;
  serializeJson(doc, json);

  // appendFile(SD, "/data.txt", json)
  if (file) {
    file.println(json);
    file.close();
    Serial.println("Data logged.");
  } else {
    Serial.println("Failed to open file.");
  }
}

SimpleKalmanFilter kf_ax(0.1, 0.1, 0.5);
SimpleKalmanFilter kf_ay(0.1, 0.1, 0.5);
SimpleKalmanFilter kf_az(0.1, 0.1, 0.5);

SimpleKalmanFilter kf_speed(3, 3, 0.01);

int count = 0;

void setup(){
  Serial.begin(GPS_BAUD);

  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);
  Serial.println("Serial 2 started at 9600 baud rate");

  Wire.begin(I2C_SDA, I2C_SCL);
  
  mpu.initialize();

  if (mpu.testConnection()) {
    Serial.println("MPU6050 connected successfully!");
  } else {
    Serial.println("MPU6050 connection failed!");
    while (1); // Stop if failed
  }

  // SD card accessing
  if(!SD.begin(CS)){
    Serial.println("Card Mount Failed");
  }

  if (!SD.exists("/data.txt")) {
    Serial.println("Creating new file...");
    writeFile(SD, "/data.txt", "User1");
  }

  readFile(SD, "/data.txt");
  // writeFile(SD, "/data.txt", "User1");

}

void loop(){

  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);

  float ax_ms2 = (float)ax / 16384.0 * 9.80665;
  float ay_ms2 = (float)ay / 16384.0 * 9.80665;
  float az_ms2 = (float)az / 16384.0 * 9.80665;
  
  // Apply Kalman filtering
  float filtered_ax = kf_ax.updateEstimate(ax_ms2);
  float filtered_ay = kf_ay.updateEstimate(ay_ms2);
  float filtered_az = kf_az.updateEstimate(az_ms2);
  
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  int hour = gps.time.hour();
  int minute = gps.time.minute();

  // Add +5 hours and +30 minutes
  minute += 30;
  hour += 5;

  if (minute >= 60) {
    minute -= 60;
    hour += 1;
  }
  if (hour >= 24) {
    hour -= 24;
  }

  // properly format details
  char timeBuffer[10];
  sprintf(timeBuffer, "%02d:%02d:%02d", hour, minute, gps.time.second());
  float raw_speed = gps.speed.kmph();
  float filtered_speed = kf_speed.updateEstimate(raw_speed);
  String date = String(gps.date.year()) + "-" + String(gps.date.month()) + "-" + String(gps.date.day());
  String timeStr = timeBuffer;

  logDataToSD(filtered_ax, filtered_ay, filtered_az, filtered_speed, date, timeStr);
  count++;

  delay(500);
}

