import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userUpdateData } from '@/types';

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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ deviceId: string }> }
) {
    try {
        const { deviceId } = await params;
        const { email, currentPassword, password } = await request.json();
        // Validate deviceId parameter
        if (!deviceId) {
            return NextResponse.json({
                error: 'Device ID is required'
            }, { status: 400 });
        }
        if (!email && !currentPassword && !password) {
            return NextResponse.json({
                error: 'At least one field (email or password) is required to update'
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

        // Find user by deviceId
        const user = await usersCollection.findOne({ deviceId: deviceIdInt });

        if (!user) {
            return NextResponse.json({
                error: 'User not found'
            }, { status: 404 });
        }
        // If updating password, verify current password
        if (password) {
            if (!currentPassword) {
                return NextResponse.json({
                    error: 'Current password is required to update password'
                }, { status: 400 });
            }
            const auth = await bcrypt.compare(currentPassword, user.password);
            if (!auth) {
                return NextResponse.json({
                    error: 'Current password is not matching'
                }, { status: 401 });
            }
        }
        // Prepare update object
        const updateData: userUpdateData = {
            email: email || user.email,
            password: password ? await bcrypt.hash(password, 10) : user.password
        };

        // Update user in the database
        const result = await usersCollection.updateOne({ deviceId: deviceIdInt }, { $set: updateData });

        if (result.modifiedCount === 0) {
            return NextResponse.json({
                error: 'Failed to update user'
            }, { status: 500 });
        }

        const responseUser = {
            id: user._id,
            firstName: user.firstName,
            email: user.email || '',
            deviceId: user.deviceId,
            createdAt: user.createdAt
        };

        return NextResponse.json({
            message: 'User updated successfully',
            user: responseUser
        }, { status: 200 });
    } catch (error: unknown) {
        console.error("MongoDB Config Update Error:", error instanceof Error ? error.message : String(error));

        return NextResponse.json({
            error: 'Configuration update failed',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}