import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { deviceId, password } = await request.json();

        if (!deviceId || !password) {
            return NextResponse.json(
                { message: 'Device ID and password are required' },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email: deviceId });

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            { userId: user._id, deviceId: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Extract first and last name from the stored name
        const nameParts = user.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const userResponse = {
            id: user._id,
            firstName,
            lastName,
            deviceId: user.email,
            createdAt: user.createdAt,
        };

        return NextResponse.json({
            user: userResponse,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
