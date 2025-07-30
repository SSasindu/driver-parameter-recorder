# Driver Parameter Recorder System (Black Box for Vehicles)

This project aims to build an embedded system that monitors and records various vehicle and driver behavior parameters. The system acts like a "black box" for buses or other vehicles, logging real-time data such as vehicle speed, acceleration, pedal positions, and engine RPM to an SD card and optionally transmitting it via Wi-Fi to the cloud.

---

## Components Used

| Component                        | Purpose                                             |
|----------------------------------|-----------------------------------------------------|
| **ESP32**                        | Main microcontroller (Wi-Fi + Bluetooth support)    |
| **GPS Module (NEO-6M)**          | Collects GPS location, date/time, and vehicle speed |
| **MPU-6050 (Accelerometer + Gyro)** | Measures 3-axis acceleration and movement            |
| **Micro SD Card Module**         | Logs all data locally for retrieval and analysis    |

---

## Features

-  GPS tracking with timestamp
-  Real-time speed and acceleration monitoring
-  Data fusion (GPS + accelerometer) for accurate speed calculation
-  SD card logging with time-stamped entries
-  Upload SD card data to cloud and analyze them in the cloud
-  Show the driver records according to cloud data using a web app
-  Modular code structure for easy component expansion

---

## How It Works

1. **Startup**
   - ESP32 initializes peripherals: SD, GPS, MPU6050, Hall sensors
2. **Data Acquisition**
   - Reads GPS location, speed, and time
   - Reads acceleration from MPU6050
3. **Data Logging**
   - Combines data into a CSV format log
   - Appends to `log.txt` on SD card
4. **Data Transmission** 
   - Sends data via Bluetooth Serial or GSM HTTP POST *(optional)*
   - Sends to cloud via Wi-Fi
5. **Analysing data**
   - Analyze data in the cloud and output useful informations
6. **Dashboard for showing driver details**
   - Showing the received data using web app dashboard

---


##  Communication Methods

- **Bluetooth (Classic)** – Use Android app or serial terminal to receive logs wirelessly
- **Wi-Fi** – Upload logs to a cloud server or Google Sheets

---

##  Getting Started

###  Wiring Overview
- GPS → UART (RX/TX)
- MPU6050 → SPI 
- SD Module → SPI (MISO, MOSI, SCK, CS)

## **Project Timeline**

| Week | Task                                                                    |
|------|-------------------------------------------------------------------------|
| 1    | Finalize requirements and system design (block diagram, component list) |
| 2    | Purchase and test individual components (ESP32, sensors, modules, etc.) |
| 3    | Integrate sensors with ESP32 and test basic data collection             |
| 4    | Develop logics for threshold values and implement                       |
| 5    | Combine all modules into single embedded system, start debugging        |
| 6    | Test system in simulated and real environments                          |
| 7    | Test system in simulated and real environments                          |
| 8    | Setting threshold values which are suitable for a good driver according to tests|
| 9    | Test threshold values in simulated and real environments                |
| 10   | Test threshold values in simulated and real environments                |
| 11   | Finalize documentation (README, diagrams, user manual)                  |
| 12   | Create presentation/demo and submit final project                       |

---
