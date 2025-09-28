import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { transformDrivingRecords } from '@/lib/utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ deviceId: string }> }
) {
    try {
        const { deviceId } = await params;
        console.log('Fetching records for deviceId:', deviceId);
        if (!deviceId) {
            return NextResponse.json({
                error: 'Device ID is required'
            }, { status: 400 });
        }

        // Connect to MongoDB and get the native client
        const mongoose = await connectDB();
        const db = mongoose.connection.getClient().db("vehicleDB");

        if (!db) {
            throw new Error('Database connection failed');
        }

        // Access the sensorData collection
        const sensorDataCollection = db.collection("sensorData");

        // Convert deviceId to integer if needed
        const deviceIdInt = parseInt(deviceId);

        // Find all records for this deviceId, sorted by timestamp (newest first)
        const records = await sensorDataCollection
            .find({ deviceId: deviceIdInt })
            .sort({ timestamp: -1 })
            .limit(100) // Limit to last 100 records
            .toArray();

        const allRecords = await sensorDataCollection
            .find({ deviceId: deviceIdInt })
            .sort({ date: -1 })
            .toArray();

        // Transform the data to match the expected format
        const transformedRecords = records.map(record => ({
            id: record._id.toString(),
            date: record.date ? new Date(record.date).toLocaleDateString() : new Date().toLocaleDateString(),
            time: record.time ,
            speed: record.speed || 0,
            accX: record.accX || 0,
            accY: record.accY || 0,
            accZ: record.accZ || 0,
            // deviceId: record.deviceId
        }));

        const transformedAllRecords = allRecords.map(record => ({
            id: record._id.toString(),
            date: record.date ? new Date(record.date).toLocaleDateString() : new Date().toLocaleDateString(),
            time: record.time,
            speed: record.speed || 0,
            acceleration: Math.sqrt(Math.pow(record.accX, 2) + Math.pow(record.accY, 2) + Math.pow(record.accZ, 2)) || 0,
            // deviceId: record.deviceId
        }));

        const dashboardData = transformDrivingRecords(transformedRecords);

        return NextResponse.json({
            records: dashboardData,
            allRecords: transformedAllRecords,
            deviceId: deviceIdInt
        }, { status: 200 });

    } catch (error: unknown) {
        console.error("Error fetching driving records:", error instanceof Error ? error.message : String(error));

        return NextResponse.json({
            error: 'Failed to fetch driving records',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
