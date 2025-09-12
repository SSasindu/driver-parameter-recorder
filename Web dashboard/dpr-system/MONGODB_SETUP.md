# MongoDB Integration Guide

This document explains how to set up and use MongoDB with the Driver Parameter Recorder system.

## Setup

### 1. Environment Configuration

Copy the example environment file and configure your MongoDB connection:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your MongoDB connection details:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/driver-parameter-recorder

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 2. MongoDB Installation

#### Local Installation (Recommended for Development)

**Windows:**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service automatically

**MongoDB Compass (GUI - Optional):**
Download MongoDB Compass for a graphical interface to view your data.

#### Cloud Installation (MongoDB Atlas)

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string and update `MONGODB_URI` in `.env.local`

### 3. Database Schema

The application uses two main collections:

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, used as Device ID),
  name: String (full name),
  password: String (hashed with bcryptjs),
  createdAt: Date,
  updatedAt: Date
}
```

#### DrivingRecords Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  date: String (YYYY-MM-DD format),
  time: String (HH:mm:ss format),
  speed: Number (km/h),
  acceleration: Number (m/s²),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication

**POST /api/auth/signup**
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "deviceId": "DEVICE001",
  "password": "yourpassword"
}
```

**POST /api/auth/login**
```json
{
  "deviceId": "DEVICE001",
  "password": "yourpassword"
}
```

### Dashboard Data

**GET /api/dashboard**
Headers: `Authorization: Bearer <jwt_token>`

Returns dashboard data including current metrics, recent records, hourly charts, and overall score.

### Driving Records

**POST /api/driving-records**
Headers: `Authorization: Bearer <jwt_token>`
```json
{
  "date": "2024-01-15",
  "time": "14:30:25",
  "speed": 65.5,
  "acceleration": 2.3
}
```

## Data Flow

1. **Authentication**: Users sign up with firstName, lastName, deviceId, and password
2. **Data Collection**: Arduino/ESP32 sends driving data to `/api/driving-records`
3. **Dashboard**: Web app fetches aggregated data from `/api/dashboard`
4. **Real-time Updates**: Dashboard polls for new data every few seconds

## Development Notes

- The application falls back to mock data if no real records exist
- Connection pooling is handled automatically by Mongoose
- Database indexes are created for efficient querying (userId + date)
- All passwords are hashed using bcryptjs before storage

## Arduino Integration

To send data from your Arduino/ESP32 to the API:

```cpp
// Example HTTP POST to save driving record
String jsonData = "{\"date\":\"2024-01-15\",\"time\":\"14:30:25\",\"speed\":65.5,\"acceleration\":2.3}";
http.addHeader("Content-Type", "application/json");
http.addHeader("Authorization", "Bearer " + authToken);
int httpResponseCode = http.POST(jsonData);
```

## Troubleshooting

**Connection Issues:**
- Ensure MongoDB service is running
- Check your `MONGODB_URI` in `.env.local`
- Verify network connectivity if using MongoDB Atlas

**Authentication Issues:**
- Ensure `JWT_SECRET` is set in `.env.local`
- Check that the same secret is used across all API routes

**Data Issues:**
- Verify data types match the schema (speed/acceleration as numbers)
- Check date/time format consistency
