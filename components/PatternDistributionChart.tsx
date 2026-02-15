import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import type { NarcissisticPattern } from '../types';

interface PatternDistributionChartProps {
    patterns: NarcissisticPattern[];
}

const COLORS = ['#0ea5e9', '#6366f1', '#14b8a6', '#f43f5e', '#a855f7', '#f59e0b'];

const PatternDistributionChart: React.FC<PatternDistributionChartProps> = ({ patterns }) => {
    const chartData = useMemo(() => {
        const counts = patterns.reduce((acc: Record<string, number>, p) => {
            acc[p.muster_name] = (acc[p.muster_name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Fix: Explicitly cast count to number to resolve arithmetic operation type errors in the sort function
        const data = Object.entries(counts).map(([name, count]) => ({
            name,
            count: count as number
        }));

        return data.sort((a, b) => b.count - a.count);
    }, [patterns]);

    if (chartData.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-800 text-[10px] font-mono tracking-widest uppercase italic">Buffer Empty</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <defs>
                    <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                <CartesianGrid strokeDasharray="2 10" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80} 
                    tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono', fontWeight: 700 }} 
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    cursor={{ fill: '#0ea5e9', opacity: 0.05 }}
                    contentStyle={{
                        backgroundColor: '#050b16',
                        border: '1px solid #1e293b',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '10px',
                        fontFamily: 'JetBrains Mono'
                    }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} filter="url(#barGlow)">
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default PatternDistributionChart;