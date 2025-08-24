import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET(
    request: NextRequest,
    { params }: { params: { deviceId: string } }
) {
    try {
        const { deviceId } = params;

        // Validate deviceId parameter
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

        // Access the Users collection in vehicleDB
        const usersCollection = db.collection("Users");

        // Convert deviceId to integer to match the original server.js logic
        const deviceIdInt = parseInt(deviceId);

        console.log(`Fetching configuration for device ID: ${deviceIdInt}`);
        console.log(`Fetching configuration from: ${usersCollection.dbName}`);

        // Find configuration by deviceId
        const configData = await usersCollection.findOne({ deviceId: deviceIdInt });

        if (!configData) {
            return NextResponse.json({
                error: 'Configuration not found for the specified device ID'
            }, { status: 404 });
        }

        // Return the configuration data (excluding sensitive information like password)
        const { password, ...safeConfigData } = configData;

        return NextResponse.json(safeConfigData, { status: 200 });

    } catch (error: any) {
        console.error("MongoDB Config Fetch Error:", error.message);

        return NextResponse.json({
            error: 'Configuration fetch failed',
            details: error.message
        }, { status: 500 });
    }
}
