import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({
                error: 'Token is required'
            }, { status: 400 });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET) as { deviceId: number, iat: number, exp: number };

        // Connect to MongoDB to get fresh user data
        const mongoose = await connectDB();
        const db = mongoose.connection.getClient().db("vehicleDB");
        const usersCollection = db.collection("Users");

        // Find user by ID to ensure they still exist
        const user = await usersCollection.findOne({
            deviceId: decoded.deviceId
        });

        if (!user) {
            return NextResponse.json({
                error: 'User not found'
            }, { status: 404 });
        }

        // Return user data (excluding password)
        // const { password, ...safeUserData } = user;
        const userData = {
            id: user._id,
            firstName: user.firstName,
            email: user.email || '',
            deviceId: user.deviceId,
            createdAt: user.createdAt
        };

        return NextResponse.json({
            valid: true,
            user: userData
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Token verification error:', error);

        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({
                error: 'Invalid token'
            }, { status: 401 });
        }

        if (error instanceof jwt.TokenExpiredError) {
            return NextResponse.json({
                error: 'Token expired'
            }, { status: 401 });
        }

        return NextResponse.json({
            error: 'Token verification failed'
        }, { status: 500 });
    }
}
