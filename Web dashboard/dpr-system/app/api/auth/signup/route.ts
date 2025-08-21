import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { firstName, lastName, deviceId, password } = await request.json();

        if (!firstName || !lastName || !deviceId || !password) {
            return NextResponse.json(
                { message: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if user already exists (using deviceId as email for now)
        const existingUser = await User.findOne({ email: deviceId });
        if (existingUser) {
            return NextResponse.json(
                { message: 'Device ID already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            email: deviceId,
            name: `${firstName} ${lastName}`,
            password: hashedPassword,
        });

        await newUser.save();

        // Create token
        const token = jwt.sign(
            { userId: newUser._id, deviceId: newUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const userResponse = {
            id: newUser._id,
            firstName,
            lastName,
            deviceId: newUser.email,
            createdAt: newUser.createdAt,
        };

        return NextResponse.json({
            user: userResponse,
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
