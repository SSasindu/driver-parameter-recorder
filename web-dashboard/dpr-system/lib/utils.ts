import { DashboardData, DrivingRecord, ScoreColor } from '@/types';

export const getScoreColor = (score: number): ScoreColor => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
};

export const getScoreText = (score: number): string => {
    if (score >= 80) return 'Safe';
    if (score >= 60) return 'Moderate';
    return 'Risky';
};

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatTime = (timeString: string): string => {
    return timeString;
};

export const formatSpeed = (speed: number): string => {
    return `${speed.toFixed(1)} km/h`;
};

export const formatAcceleration = (acceleration: number): string => {
    return `${acceleration.toFixed(2)} m/s²`;
};

export const generateMockData = () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

    // Generate recent records for the last few hours
    const recentRecords = [];
    for (let i = 0; i < 20; i++) {
        const recordTime = new Date(now.getTime() - (i * 5 * 60 * 1000)); // Every 5 minutes
        recentRecords.push({
            id: `record_${i}`,
            date: recordTime.toISOString().split('T')[0],
            time: recordTime.toTimeString().split(' ')[0].substring(0, 5),
            speed: Math.random() * 80 + 20, // 20-100 km/h
            acceleration: (Math.random() - 0.5) * 6, // -3 to +3 m/s²
            timestamp: recordTime.toISOString()
        });
    }

    // Generate hourly data for the last 12 hours
    const hourlyData = [];
    for (let i = 0; i < 12; i++) {
        const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
        hourlyData.unshift({
            hour: hour.getHours().toString().padStart(2, '0') + ':00',
            avgSpeed: Math.random() * 40 + 40, // 40-80 km/h
            maxSpeed: Math.random() * 20 + 80, // 80-100 km/h
            avgAcceleration: (Math.random() - 0.5) * 2 // -1 to +1 m/s²
        });
    }

    return {
        overallScore: Math.floor(Math.random() * 40) + 60, // Score between 60-100
        currentMetrics: {
            speed: Math.random() * 80 + 20, // 20-100 km/h
            acceleration: (Math.random() - 0.5) * 4, // -2 to +2 m/s²
            date: currentDate,
            time: currentTime
        },
        recentRecords,
        hourlyData
    };
};

export const transformDrivingRecords = (records: DrivingRecord[]): DashboardData => {
    const speeds = records.map(r => r.speed || 0).filter(s => s > 0);
    const accelerations = records.map(r => Math.sqrt(Math.pow(r.accX, 2)+Math.pow(r.accY, 2)+Math.pow(r.accZ, 2)));

    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
    const avgAcceleration = accelerations.length > 0 ? accelerations.reduce((a, b) => a + b, 0) / accelerations.length : 0;

    // Calculate driving score (simplified algorithm)
    let score = 85; // Base score
    if (maxSpeed > 80) score -= 10; // Speed penalty
    if (avgAcceleration > 3) score -= 5; // Harsh acceleration penalty
    if (avgAcceleration < -3) score -= 5; // Harsh braking penalty
    score = Math.max(0, Math.min(100, score));

    // Get recent records for display
    const recentRecords = records.slice(0, 10).map(record => ({
        id: record.id,
        date: record.date,
        time: record.time,
        speed: record.speed || 0,
        acceleration: Math.sqrt(Math.pow(record.accX, 2) + Math.pow(record.accY, 2) + Math.pow(record.accZ, 2)) || 0
    }));

    // Generate hourly data (simplified)
    const hourlyData = [];
    for (let i = 0; i < 24; i++) {
        const hourRecords = records.filter(r => {
            if (!r.time) return false;
            const hour = new Date(r.time).getHours();
            return hour === i;
        });

        const avgHourSpeed = hourRecords.length > 0 ?
            hourRecords.reduce((sum, r) => sum + (r.speed || 0), 0) / hourRecords.length : 0;
        const avgHourAccel = hourRecords.length > 0 ?
            hourRecords.reduce((sum, r) => sum + Math.sqrt((Math.pow(r.accX || 0, 2) + Math.pow(r.accY || 0, 2) + Math.pow(r.accZ || 0, 2))), 0) / hourRecords.length : 0;

        hourlyData.push({
            hour: `${i.toString().padStart(2, '0')}:00`,
            avgSpeed: Math.round(avgHourSpeed * 10) / 10,
            maxSpeed: Math.round((hourRecords.length > 0 ? Math.max(...hourRecords.map(r => r.speed || 0)) : 0) * 10) / 10,
            avgAcceleration: Math.round(avgHourAccel * 10) / 10
        });
    }

    return {
        overallScore: score,
        currentMetrics: {
            speed: Math.round(avgSpeed * 10) / 10,
            acceleration: Math.round(avgAcceleration * 10) / 10,
            date: records[0]?.date || new Date().toLocaleDateString(),
            time: records[0]?.time || new Date().toLocaleTimeString()
        },
        stats:{
            totalRecords: records.length,
            avgSpeed: Math.round(avgSpeed * 10) / 10,
            maxSpeed: Math.round(maxSpeed * 10) / 10,
            avgAcceleration: Math.round(avgAcceleration * 10) / 10
        },
        recentRecords,
        hourlyData
    };
};
