import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function POST(request: NextRequest) {
    try {
        // Parse the incoming JSON data
        const data = await request.json();

        // Validate that data is an array
        if (!Array.isArray(data)) {
            return NextResponse.json({
                error: 'Data must be an array of JSON objects'
            }, { status: 400 });
        }

        // Connect to MongoDB and get the native client
        const mongoose = await connectDB();
        const db = mongoose.connection.getClient().db("vehicleDB");

        if (!db) {
            throw new Error('Database connection failed');
        }

        const collection = db.collection("sensorData");

        // Insert the data directly into the existing sensorData collection
        const result = await collection.insertMany(data);

        console.log(`Inserted ${result.insertedCount} documents`);

        return NextResponse.json({
            message: 'Data inserted successfully'
        }, { status: 200 });

    } catch (error: unknown) {
        console.error("MongoDB Insert Error:", error instanceof Error ? error.message : String(error));

        return NextResponse.json({
            error: 'Database insert failed',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

// Handle GET requests to show API documentation
export async function GET() {
    return NextResponse.json({
        message: 'ESP32 MongoDB API Data Upload Endpoint',
        description: 'POST an array of sensor data to store in MongoDB sensorData collection. Matches the functionality of the ESP32-mongo-API server.',
        usage: {
            method: 'POST',
            contentType: 'application/json',
            body: 'Array of sensor data objects'
        },
        example: [
            {
                timestamp: '2025-08-23T14:30:15Z',
                speed: 45.5,
                acceleration: 2.1,
                temperature: 25.3,
                deviceId: 12345
            }
        ],
        notes: [
            'Data is inserted into vehicleDB.sensorData collection',
            'Array validation is performed but empty arrays are allowed',
            'Matches the original ESP32-mongo-API server.js /upload endpoint'
        ]
    });
}
