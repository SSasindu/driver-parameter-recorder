# Driver Parameter Recorder System (Black Box for Vehicles)

This project aims to build an embedded system that monitors and records various vehicle and driver behavior parameters. The system acts like a "black box" for buses or other vehicles, logging real-time data such as vehicle speed, acceleration, pedal positions, and engine RPM to an SD card and optionally transmitting it via Wi-Fi to the cloud.

---

## Components Used

| Component                        | Purpose                                             |
|----------------------------------|-----------------------------------------------------|
| **ESP32**                        | Main microcontroller (Wi-Fi + Bluetooth support)    |
| **GPS Module (NEO-6M)**          | Collects GPS location, date/time, and vehicle speed |
| **MPU-6050 (Accelerometer + Gyro)** | Measures 3-axis acceleration and movement        |
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
   - ESP32 initializes peripherals: SD, GPS, MPU6050
   - Configure Wi-Fi through access point and connect to internet
2. **Data Acquisition**
   - Reads GPS location, speed, and time
   - Reads acceleration about 3-axes from MPU6050
3. **Data Logging**
   - Combines data into a json format log
   - Appends to `data.txt` on SD card
4. **Data Transmission** 
   - Sends data via HTTP POST request
   - Sends to cloud database(mongoDB) via Wi-Fi
5. **Analysing data**
   - Analyze data in the cloud and output useful informations through the web app dashboard
   - User details are stored in seperate collection in the database
6. **Dashboard for showing driver details**
   - Put deviceID and password for logging in
   - Showing the analyzed data of the particular deviceID details using web app dashboard

---


##  Communication Methods

- **HTTP protocol** – Use Android app or serial terminal to receive logs wirelessly
- **Wi-Fi** – Upload logs to a cloud server or Google Sheets

---

##  Getting Started

###  Wiring Overview
- GPS → UART (RX/TX)
- MPU6050 → I2C (SDA, SCL)
- SD Module → SPI (MISO, MOSI, SCK, CS)

## **Project Timeline**

| Week | Task                                                                    |
|------|-------------------------------------------------------------------------|
| 1    | Finalize requirements and system design (block diagram, component list) |
| 2    | Purchase and test individual components (ESP32, sensors, modules, etc.) |
| 3    | Integrate sensors with ESP32 and test basic data collection             |
| 4    | Develop logics for threshold values and implement                       |
| 5    | Combine all modules into single embedded system, start debugging        |
| 6    | Build the web app and test the whole system                             |
| 7    | Test system in simulated and real environments                          |
| 8    | Setting threshold values which are suitable for a good driver according to tests|
| 9    | Test and update threshold values in simulated and real environments     |
| 10   | Test and update threshold values in simulated and real environments     |
| 11   | Finalize documentation (README, diagrams, user manual)                  |
| 12   | Create presentation/demo and submit final project                       |

---
