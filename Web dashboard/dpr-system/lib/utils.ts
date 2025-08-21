import { ScoreColor } from '@/types';

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
