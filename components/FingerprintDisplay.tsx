import React from 'react';

interface FingerprintDisplayProps {
    fingerprint: {
        tonfall: string[];
        dominanz_verhaeltnis: string;
        emotionale_validierung: number;
    };
}

const FingerprintDisplay: React.FC<FingerprintDisplayProps> = ({ fingerprint }) => {
    // Generate segments for the LED bar
    const totalSegments = 20;
    const activeSegments = Math.round((fingerprint.emotionale_validierung / 100) * totalSegments);

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Tone Signature Chips */}
            <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-sm bg-brand-primary animate-pulse"></span>
                        Vocal_Signature
                    </p>
                    <span className="text-[8px] font-mono text-slate-700">DETECTED_MODALITIES</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {fingerprint.tonfall.map((tag, i) => (
                        <div key={i} className="group relative">
                            <div className="absolute inset-0 bg-brand-primary/20 blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="relative z-10 block px-4 py-1.5 bg-[#0b1221] border border-brand-primary/20 rounded-lg text-[10px] text-brand-primary font-mono font-bold tracking-tight shadow-sm group-hover:border-brand-primary/50 group-hover:text-white transition-all">
                                {tag.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Dominance Ratio Slider */}
            <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-sm bg-brand-secondary"></span>
                        Power_Dynamics
                    </p>
                    <span className="text-[8px] font-mono text-slate-700">ASYMMETRY_CHECK</span>
                </div>
                <div className="relative h-12 bg-[#0b1221] border border-slate-800 rounded-xl flex items-center px-4 overflow-hidden">
                    <div className="absolute inset-0 terminal-grid opacity-10"></div>
                    <div className="w-full flex items-center justify-between relative z-10">
                        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Subject</span>
                        <div className="px-6 py-1 bg-brand-secondary/10 border border-brand-secondary/30 rounded-md">
                            <span className="text-xs font-black text-brand-secondary font-mono tracking-widest uppercase shadow-brand-secondary/20 drop-shadow-md">
                                {fingerprint.dominanz_verhaeltnis}
                            </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Target</span>
                    </div>
                </div>
            </div>

            {/* Emotional Validity LED Meter */}
            <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-sm bg-brand-clinical"></span>
                        Empathy_Resonance
                    </p>
                    <span className="text-[10px] font-mono font-bold text-brand-clinical">
                        {fingerprint.emotionale_validierung}%
                    </span>
                </div>
                
                <div className="flex gap-1 h-3 w-full p-1 bg-[#050a14] rounded-lg border border-slate-800 shadow-inner">
                    {Array.from({ length: totalSegments }).map((_, i) => {
                        const isActive = i < activeSegments;
                        // Color gradient logic: Low = Red, Mid = Yellow, High = Teal/Green
                        let colorClass = 'bg-slate-800 opacity-20';
                        if (isActive) {
                            if (i < 5) colorClass = 'bg-brand-accent shadow-[0_0_5px_rgba(244,63,94,0.8)]';
                            else if (i < 12) colorClass = 'bg-brand-warning shadow-[0_0_5px_rgba(245,158,11,0.8)]';
                            else colorClass = 'bg-brand-clinical shadow-[0_0_5px_rgba(20,184,166,0.8)]';
                        }
                        return (
                            <div 
                                key={i} 
                                className={`flex-1 rounded-[1px] transition-all duration-300 ${colorClass}`}
                                style={{ transitionDelay: `${i * 30}ms` }}
                            ></div>
                        );
                    })}
                </div>
                <div className="flex justify-between text-[8px] font-mono text-slate-600 uppercase">
                    <span>Critical</span>
                    <span>Nominal</span>
                    <span>Optimal</span>
                </div>
            </div>
        </div>
    );
};

export default FingerprintDisplay;