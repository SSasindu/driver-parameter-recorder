import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
    try {
        // Parse the incoming JSON data
        const configData = await request.json();
        console.log('Received configuration data:', configData);

        // Handle both ESP32 config format and web dashboard format
        let userData;
        let deviceId;

        if (configData.firstName && configData.password) {
            // Web dashboard format
            const { firstName, deviceId: devId, email, password } = configData;
            deviceId = devId;

            // Validate required fields
            if (!firstName || !deviceId || !password) {
                return NextResponse.json({
                    error: 'All fields are required: firstName, deviceId, password'
                }, { status: 400 });
            }

            // Validate password length
            if (password.length < 6) {
                return NextResponse.json({
                    error: 'Password must be at least 6 characters long'
                }, { status: 400 });
            }

            // Hash the password before storing
            const hashedPassword = await bcrypt.hash(password, 10);

            userData = {
                firstName,
                deviceId: parseInt(deviceId),
                email: email || '', // Store email if provided
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        } else {
            deviceId = configData.deviceId;
            userData = {
                ...configData,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }

        // Connect to MongoDB and get the native client
        const mongoose = await connectDB();
        const db = mongoose.connection.getClient().db("vehicleDB");

        if (!db) {
            throw new Error('Database connection failed');
        }

        // Access the Users collection in vehicleDB
        const usersCollection = db.collection("Users");

        // Check if deviceId already exists
        const existingUser = await usersCollection.findOne({ deviceId: userData.deviceId });

        if (existingUser) {
            return NextResponse.json({
                error: 'Device ID already exists'
            }, { status: 400 });
        }

        // Insert the user data into the Users collection
        const result = await usersCollection.insertOne(userData);

        console.log(`Configuration saved with ID: ${result.insertedId}`);

        const token = jwt.sign(
                        {
                            userId: configData._id,
                            deviceId: configData.deviceId,
                            firstName: configData.firstName
                        },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    );
        
        const user = {
            id: configData._id,
            firstName: configData.firstName,
            email: configData.email || '',
            deviceId: configData.deviceId,
            createdAt: configData.createdAt
        };

        return NextResponse.json({
            message: configData.firstName ? 'User configuration saved successfully' : 'Configuration saved successfully',
            token,
            user
        }, { status: 200 });

    } catch (error: unknown) {
        console.error("MongoDB Config Insert Error:", error instanceof Error ? error.message : String(error));

        return NextResponse.json({
            error: 'Configuration insert failed',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

// Handle GET requests to show API documentation
export async function GET() {
    return NextResponse.json({
        message: 'Configuration Endpoint',
        description: 'POST configuration data to store in MongoDB Users collection. Supports both web dashboard signup and ESP32 device configuration.',
        usage: {
            method: 'POST',
            contentType: 'application/json',
            webDashboardFormat: {
                firstName: 'string (required)',
                deviceId: 'string/number (required, must be unique)',
                password: 'string (required, min 6 characters)'
            },
            esp32Format: {
                deviceId: 'number (required, must be unique)',
                'any other config fields': 'supported'
            }
        },
        examples: {
            webDashboard: {
                firstName: 'John Doe',
                deviceId: 'ESP32_001',
                password: 'securepassword123'
            },
            esp32: {
                deviceId: 12345,
                configParam1: 'value1',
                configParam2: 'value2'
            }
        },
        notes: [
            'GET /config/[deviceId] - Retrieve configuration by device ID',
            'Device ID uniqueness is enforced across all formats'
        ]
    });
}