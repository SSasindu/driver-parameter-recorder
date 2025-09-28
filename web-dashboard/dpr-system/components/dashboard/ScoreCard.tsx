'use client';

import React from 'react';
import { getScoreColor, getScoreText } from '@/lib/utils';

interface ScoreCardProps {
    score: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score }) => {
    const color = getScoreColor(score);
    const text = getScoreText(score);

    const colorClasses = {
        green: 'bg-green-50 border-green-200 text-green-800',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        red: 'bg-red-50 border-red-200 text-red-800'
    };

    const scoreColorClasses = {
        green: 'text-green-600',
        yellow: 'text-yellow-600',
        red: 'text-red-600'
    };

    return (
        <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all duration-200`}>
            <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Overall Driving Score</h3>
                <div className={`text-5xl font-bold mb-2 ${scoreColorClasses[color]}`}>
                    {score}
                </div>
                <div className="text-sm font-medium uppercase tracking-wide">
                    {text} Driver
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${color === 'green' ? 'bg-green-500' :
                                color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${score}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
