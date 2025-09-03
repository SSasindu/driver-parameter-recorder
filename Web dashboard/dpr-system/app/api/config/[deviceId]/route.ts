import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ deviceId: string }> }
) {
    try {
        const { deviceId } = await params;

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

        // Find configuration by deviceId
        const configData = await usersCollection.findOne({ deviceId: deviceIdInt });

        if (!configData) {
            return NextResponse.json({
                error: 'Configuration not found for the specified device ID'
            }, { status: 404 });
        }
        const safeConfigData = { 
            firstName: configData.firstName,
            email: configData.email || '',
            deviceId: configData.deviceId,
            createdAt: configData.createdAt,
            updatedAt: configData.updatedAt
         };
        // Return the configuration data (excluding sensitive information like password)
        // const { password, ...safeConfigData } = configData;
        
        return NextResponse.json(safeConfigData, { status: 200 });

    } catch (error: unknown) {
        console.error("MongoDB Config Fetch Error:", error instanceof Error ? error.message : String(error));

        return NextResponse.json({
            error: 'Configuration fetch failed',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ deviceId: string }> }
) {
    try {
        const { deviceId } = await params;
        const { password } = await request.json();
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

        // Find configuration by deviceId
        const configData = await usersCollection.findOne({ deviceId: deviceIdInt });

        if (!configData) {
            return NextResponse.json({
                error: 'Configuration not found for the specified device ID'
            }, { status: 404 });
        }
        const auth = await bcrypt.compare(password, configData.password);
        if (auth) {
            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: configData._id,
                    deviceId: configData.deviceId,
                    firstName: configData.firstName
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Prepare user object (excluding password)
            const user = {
                id: configData._id,
                firstName: configData.firstName,
                email: configData.email || '',
                deviceId: configData.deviceId,
                createdAt: configData.createdAt
            };

            return NextResponse.json({
                message: 'Successfully logged in',
                token,
                user
            }, { status: 200 });
        } else {
            return NextResponse.json({
                error: 'Invalid password'
            }, { status: 401 });
        }
    } catch (error: unknown) {
        console.error("MongoDB Config Fetch Error:", error instanceof Error ? error.message : String(error));

        return NextResponse.json({
            error: 'Configuration fetch failed',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
