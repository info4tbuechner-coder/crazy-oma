import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import Card from './ui/Card';

interface SentimentTrendChartProps {
    data: { time: number; score: number }[];
}

export const SentimentTrendChart: React.FC<SentimentTrendChartProps> = ({ data }) => {
    // Format data for Recharts
    const chartData = data.map((d, index) => ({
        ...d,
        id: index,
        formattedTime: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    return (
        <Card className="p-6 rounded-[2rem] border border-slate-800 bg-[#040812]/50">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono mb-6">
                Sentiment_Entwicklungs_Verlauf
            </h4>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="formattedTime" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" />
                        <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" domain={[0, 100]} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '1rem' }}
                            itemStyle={{ color: '#0ea5e9', fontSize: 12 }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#0ea5e9" 
                            fillOpacity={1} 
                            fill="url(#colorScore)" 
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
