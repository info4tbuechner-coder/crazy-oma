import React, { useEffect, useState, useMemo, useRef } from 'react';

interface ScoreGaugeProps { score: number; }

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const radius = 90;
    const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
    const offset = useMemo(() => circumference - (displayScore / 100) * circumference, [circumference, displayScore]);
    const requestRef = useRef<number>(null);

    useEffect(() => {
        let startTimestamp: number | null = null;
        const startValue = displayScore;
        const duration = 2500; 
        
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const elapsed = timestamp - startTimestamp;
            const progress = Math.min(elapsed / duration, 1);
            
            // Quintic easing out for that mechanical "spin-up" feel
            const t = 1 - Math.pow(1 - progress, 5);
            const currentVal = startValue + (score - startValue) * t;
            
            setDisplayScore(Math.round(currentVal));
            
            if (progress < 1) {
                requestRef.current = window.requestAnimationFrame(step);
            }
        };
        
        requestRef.current = window.requestAnimationFrame(step);
        return () => {
            if (requestRef.current) window.cancelAnimationFrame(requestRef.current);
        };
    }, [score]);

    const colors = useMemo(() => {
        if (score > 80) return { main: '#f43f5e', glow: 'rgba(244, 63, 94, 0.6)', bg: '#881337', text: 'text-brand-accent' };
        if (score > 60) return { main: '#f97316', glow: 'rgba(249, 115, 22, 0.5)', bg: '#7c2d12', text: 'text-orange-500' };
        if (score > 30) return { main: '#eab308', glow: 'rgba(234, 179, 8, 0.5)', bg: '#713f12', text: 'text-yellow-500' };
        return { main: '#14b8a6', glow: 'rgba(20, 184, 166, 0.5)', bg: '#134e4a', text: 'text-brand-clinical' };
    }, [score]);

    return (
        <div className="relative w-full max-w-[320px] xs:max-w-[360px] md:max-w-[450px] aspect-square flex items-center justify-center select-none animate-fade-in mx-auto scale-95 md:scale-100 group cursor-default">
            {/* Ambient Aura Reactor */}
            <div 
                className="absolute inset-0 rounded-full transition-all duration-[3s] animate-pulse-slow blur-[60px] md:blur-[100px] pointer-events-none opacity-40 group-hover:opacity-60"
                style={{ backgroundColor: colors.glow }}
            ></div>

            {/* Outer Decorative Ring (Static Tech) */}
            <div className="absolute inset-4 border border-slate-800/50 rounded-full"></div>
            <div className="absolute inset-4 border border-dashed border-slate-800/30 rounded-full animate-spin [animation-duration:60s]"></div>

            {/* Rotating Data Ring (Counter-Clockwise) */}
            <svg className="absolute inset-0 w-full h-full animate-spin [animation-duration:30s] opacity-30" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="96" stroke={colors.main} strokeWidth="1" fill="none" strokeDasharray="4 8" />
            </svg>

            {/* Main Meter SVG */}
            <svg className="w-full h-full transform -rotate-90 relative z-10 drop-shadow-[0_0_15px_rgba(0,0,0,1)]" viewBox="0 0 200 200">
                <defs>
                    <linearGradient id="scoreGradientOmega" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={colors.main} stopOpacity="1" />
                        <stop offset="100%" stopColor={colors.main} stopOpacity="0.1" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                {/* Background Track */}
                <circle cx="100" cy="100" r={radius} stroke="#0f172a" strokeWidth="12" fill="none" className="opacity-80" />
                
                {/* Progress Arc */}
                <circle 
                    cx="100" cy="100" r={radius} 
                    stroke="url(#scoreGradientOmega)" strokeWidth="12" fill="none" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={offset} 
                    strokeLinecap="round"
                    filter="url(#glow)"
                    className="transition-all duration-700 ease-out"
                />
            </svg>

            {/* Core Data Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <div className="flex flex-col items-center justify-center translate-y-2 relative">
                    {/* Holographic Scanline Overlay on Text */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scan pointer-events-none bg-[length:100%_200%]"></div>
                    
                    <span className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] md:tracking-[0.8em] font-mono opacity-80 mb-2 border-b border-slate-800 pb-1">
                        Toxicity_Index
                    </span>
                    
                    <div className="relative flex items-baseline">
                        <span 
                            className={`text-6xl sm:text-7xl md:text-[8rem] font-mono font-black tracking-tighter leading-none transition-colors duration-500 ${colors.text} drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
                            style={{ textShadow: `0 0 40px ${colors.glow}` }}
                        >
                            {displayScore}
                        </span>
                        <span className="text-xl md:text-3xl font-mono text-slate-600 font-bold ml-2">%</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${score > 0 ? 'bg-slate-500' : 'bg-slate-800'}`}></div>
                        <div className={`h-1.5 w-1.5 rounded-full ${score > 30 ? 'bg-slate-400' : 'bg-slate-800'}`}></div>
                        <div className={`h-1.5 w-1.5 rounded-full ${score > 60 ? 'bg-slate-300' : 'bg-slate-800'}`}></div>
                        <div className={`h-1.5 w-1.5 rounded-full ${score > 80 ? 'bg-white animate-pulse' : 'bg-slate-800'}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreGauge;