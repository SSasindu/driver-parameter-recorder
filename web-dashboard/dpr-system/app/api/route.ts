import { NextResponse } from 'next/server';

// Health check endpoint - matches the root endpoint from ESP32-mongo-API server.js
export async function GET() {
    return NextResponse.json({
        message: "ESP32 MongoDB API is running!",
        status: "healthy",
        timestamp: new Date().toISOString(),
        endpoints: {
            config: {
                post: "/api/config - Create/save device configuration",
                get: "/api/config/[deviceId] - Get configuration by device ID"
            },
            upload: {
                post: "/api/upload - Upload sensor data array"
            },
            dashboard: {
                get: "/api/dashboard/[deviceId] - Get dashboard data by device ID"
            },
            drivingRecords: {
                get: "/api/driving-records/[deviceId] - Get driving records by device ID"
            }
        },
        note: "Next.js API implementation of ESP32-mongo-API server functionality"
    });
}
