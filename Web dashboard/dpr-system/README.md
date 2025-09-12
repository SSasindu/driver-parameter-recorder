# Driver Parameter Recorder (DPR) System - Web Dashboard

A modern, responsive web application for monitoring real-time driving data including speed, acceleration, date, and time.

## Features

### 🔐 Authentication
- **Login**: Device ID and password authentication
- **Signup**: User registration with first name, last name, device ID, and password
- **JWT Authentication**: Secure token-based authentication with backend integration

### 📊 Dashboard
- **Live Metrics**: Real-time driving data display
  - Current speed (km/h)
  - Acceleration (m/s²) with color-coded indicators
  - Current date and time

- **Performance Charts**: Interactive visualizations using Recharts
  - Speed trend over the last 12 hours (average and maximum)
  - Acceleration trend over the last 12 hours

- **Driving Records**: Tabular view of recent data points
  - Date, time, speed, and acceleration for each record
  - Color-coded acceleration values for quick assessment
  - Real-time data without trip calculations

### 🎨 UI/UX
- **Modern Design**: Clean interface built with TailwindCSS
- **Responsive Layout**: Optimized for both mobile and desktop
- **Sidebar Navigation**: Easy navigation between dashboard sections
- **Loading States**: Smooth user experience with loading indicators

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: TailwindCSS 4
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Authentication**: JWT with bcryptjs for password hashing
- **API**: Axios for HTTP requests

## Data Structure

The application focuses on real-time driving data with the following key metrics:
- **Speed**: Current vehicle speed in km/h
- **Acceleration**: Current acceleration in m/s²
- **Date**: Current date (YYYY-MM-DD format)
- **Time**: Current time (HH:MM format)

No trip distances or duration calculations are performed - only real-time point data is stored and displayed.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Credentials

For testing purposes, you can use these credentials:
- **Device ID**: `DEVICE001`
- **Password**: `password`

Or create a new account through the signup form.

## API Endpoints

The application includes mock API endpoints for development:

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration  
- `GET /api/auth/verify` - Token verification
- `GET /api/dashboard` - Dashboard data

## Backend Integration

To integrate with a real backend:

1. Update the `NEXT_PUBLIC_API_URL` in `.env.local`
2. Replace mock API routes in `app/api/` with your backend endpoints
3. Ensure your backend implements the same API contract
