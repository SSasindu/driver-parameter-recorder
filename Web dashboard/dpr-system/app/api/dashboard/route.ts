import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import DrivingRecord from '@/lib/models/DrivingRecord';
import { generateMockData } from '@/lib/utils';

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

        // Get driving records for the user
        const records = await DrivingRecord.find({ userId: decoded.userId })
            .sort({ createdAt: -1 })
            .limit(100);

        // If no records exist, return mock data for demo purposes
        if (records.length === 0) {
            const mockData = generateMockData();
            return NextResponse.json(mockData);
        }

        // Process real data
        const recentRecords = records.slice(0, 10).map(record => ({
            id: record._id.toString(),
            date: record.date,
            time: record.time,
            speed: record.speed,
            acceleration: record.acceleration,
        }));

        // Calculate current metrics (latest record)
        const latestRecord = records[0];
        const currentMetrics = {
            speed: latestRecord.speed,
            acceleration: latestRecord.acceleration,
            date: latestRecord.date,
            time: latestRecord.time,
        };

        // Calculate hourly data for charts
        const hourlyData: Array<{ hour: string, speed: number, acceleration: number }> = [];
        const hoursMap = new Map();

        records.forEach(record => {
            const hour = record.time.split(':')[0];
            if (!hoursMap.has(hour)) {
                hoursMap.set(hour, { speeds: [], accelerations: [], hour });
            }
            hoursMap.get(hour).speeds.push(record.speed);
            hoursMap.get(hour).accelerations.push(record.acceleration);
        });

        hoursMap.forEach((data, hour) => {
            const avgSpeed = data.speeds.reduce((a: number, b: number) => a + b, 0) / data.speeds.length;
            const avgAcceleration = data.accelerations.reduce((a: number, b: number) => a + b, 0) / data.accelerations.length;

            hourlyData.push({
                hour: `${hour}:00`,
                speed: Math.round(avgSpeed * 10) / 10,
                acceleration: Math.round(avgAcceleration * 100) / 100,
            });
        });

        // Sort hourly data by hour
        hourlyData.sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

        // Calculate overall score (simplified calculation)
        const avgSpeed = records.reduce((sum, record) => sum + record.speed, 0) / records.length;
        const avgAcceleration = Math.abs(records.reduce((sum, record) => sum + record.acceleration, 0) / records.length);

        // Score calculation: good speed control (50-70 km/h) and smooth acceleration
        let speedScore = 100;
        if (avgSpeed < 30 || avgSpeed > 90) speedScore = 60;
        else if (avgSpeed < 40 || avgSpeed > 80) speedScore = 80;

        const accelerationScore = Math.max(50, 100 - (avgAcceleration * 10));

        const overallScore = Math.round((speedScore + accelerationScore) / 2);

        const dashboardData = {
            currentMetrics,
            recentRecords,
            hourlyData,
            overallScore,
        };

        return NextResponse.json(dashboardData);
    } catch (error) {
        console.error('Dashboard API error:', error);
        return NextResponse.json(
            { message: 'Invalid token' },
            { status: 401 }
        );
    }
}