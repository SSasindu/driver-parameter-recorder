import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import DrivingRecord from '@/lib/models/DrivingRecord';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
    userId: string;
    deviceId: string;
}

export async function POST(request: NextRequest) {
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

        const { date, time, speed, acceleration } = await request.json();

        if (!date || !time || speed === undefined || acceleration === undefined) {
            return NextResponse.json(
                { message: 'All fields are required: date, time, speed, acceleration' },
                { status: 400 }
            );
        }

        // Validate data types
        if (typeof speed !== 'number' || typeof acceleration !== 'number') {
            return NextResponse.json(
                { message: 'Speed and acceleration must be numbers' },
                { status: 400 }
            );
        }

        const newRecord = new DrivingRecord({
            userId: decoded.userId,
            date,
            time,
            speed,
            acceleration,
        });

        await newRecord.save();

        return NextResponse.json({
            message: 'Driving record saved successfully',
            record: {
                id: newRecord._id,
                date: newRecord.date,
                time: newRecord.time,
                speed: newRecord.speed,
                acceleration: newRecord.acceleration,
            }
        });
    } catch (error) {
        console.error('Save driving record error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
