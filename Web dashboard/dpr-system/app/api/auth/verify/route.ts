import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
    userId: string;
    deviceId: string;
}

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { message: 'Authorization token required' },
            { status: 401 }
        );
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        await connectDB();

        const user = await User.findById(decoded.deviceId);

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        const userResponse = {
            id: user._id,
            firstName: user.name,
            email: user.email,
            deviceId: user.deviceId,
            createdAt: user.createdAt,
        };

        return NextResponse.json({
            user: userResponse,
            valid: true
        });
    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json(
            { message: 'Invalid token', valid: false },
            { status: 401 }
        );
    }
}
