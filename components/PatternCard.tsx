import React from 'react';
import type { NarcissisticPattern } from '../types';

interface PatternCardProps {
    pattern: NarcissisticPattern;
    isActive?: boolean;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, isActive }) => {
    // Dynamic styles based on severity
    const config = {
        niedrig: { color: 'text-slate-400', border: 'border-slate-700', bg: 'bg-slate-800/20', glow: 'shadow-none' },
        mittel: { color: 'text-brand-warning', border: 'border-brand-warning/30', bg: 'bg-brand-warning/5', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.05)]' },
        hoch: { color: 'text-brand-accent', border: 'border-brand-accent/40', bg: 'bg-brand-accent/5', glow: 'shadow-[0_0_40px_rgba(244,63,94,0.1)]' },
        kritisch: { color: 'text-brand-accent', border: 'border-brand-accent/60', bg: 'bg-brand-accent/10', glow: 'shadow-[0_0_60px_rgba(244,63,94,0.15)]' }
    }[pattern.schweregrad];

    return (
        <article 
            className={`
                relative flex flex-col h-full overflow-hidden transition-all duration-500 group
                rounded-[3rem] border-2 backdrop-blur-2xl
                ${isActive ? `scale-[1.02] z-20 ${config.border} bg-[#0b1221]` : 'border-slate-800 bg-[#050a14] hover:border-slate-600'}
                ${config.glow}
            `}
        >
            {/* Top Security Strip */}
            <div className={`h-1.5 w-full ${pattern.schweregrad === 'kritisch' ? 'bg-brand-accent animate-pulse' : (pattern.schweregrad === 'hoch' ? 'bg-brand-accent' : 'bg-slate-800')}`}></div>

            <div className="p-8 md:p-12 flex flex-col h-full relative z-10">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 terminal-grid opacity-[0.03] pointer-events-none"></div>
                
                {/* Header Section */}
                <header className="flex justify-between items-start mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">
                                ID: {pattern.id.substring(0, 6).toUpperCase()}
                            </span>
                        </div>
                        <h4 className={`text-2xl md:text-3xl font-display font-black tracking-tighter uppercase leading-none ${config.color}`}>
                            {pattern.muster_name}
                        </h4>
                    </div>
                    <div className={`
                        px-4 py-1.5 rounded border text-[9px] font-black uppercase tracking-[0.2em] font-mono
                        ${config.bg} ${config.border} ${config.color}
                    `}>
                        {pattern.schweregrad}
                    </div>
                </header>

                {/* Evidence Box */}
                <div className="relative mb-10 group/evidence">
                    <div className="absolute -inset-2 bg-slate-800/30 rounded-2xl blur opacity-0 group-hover/evidence:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative bg-slate-950/80 border-l-2 border-slate-700 p-6 md:p-8 rounded-r-2xl">
                        <div className="absolute top-4 left-0 w-0.5 h-8 bg-brand-primary"></div>
                        <p className="font-serif italic text-lg md:text-xl text-slate-200 leading-relaxed opacity-90">
                            "{pattern.zitat}"
                        </p>
                    </div>
                </div>

                {/* Analysis Body */}
                <div className="space-y-4 flex-grow">
                    <div className="flex items-center gap-4">
                        <span className="h-[1px] w-8 bg-slate-700"></span>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] font-mono">Payload Analysis</span>
                        <span className="h-[1px] flex-grow bg-slate-700"></span>
                    </div>
                    <p className="text-sm md:text-base text-slate-400 font-mono leading-relaxed pl-4 border-l border-slate-800/50">
                        {pattern.erklaerung}
                    </p>
                </div>

                {/* Footer / Countermeasure */}
                <div className="mt-10 pt-6">
                    <div className={`
                        p-6 rounded-2xl border transition-all duration-500
                        ${isActive ? 'bg-brand-clinical/10 border-brand-clinical/30' : 'bg-slate-900/30 border-slate-800 group-hover:bg-slate-900/50'}
                    `}>
                        <div className="flex items-center gap-3 mb-3">
                            <svg className="w-4 h-4 text-brand-clinical" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-[9px] font-black text-brand-clinical uppercase tracking-[0.3em] font-mono">Countermeasure</span>
                        </div>
                        <p className="text-sm font-bold text-slate-300 leading-relaxed">
                            {pattern.gegenmassnahme}
                        </p>
                    </div>
                </div>
            </div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M0 0H40V40" stroke="currentColor" strokeWidth="1"/>
                </svg>
            </div>
            <div className="absolute bottom-0 left-0 p-4 opacity-20 rotate-180">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M0 0H40V40" stroke="currentColor" strokeWidth="1"/>
                </svg>
            </div>
        </article>
    );
};

export default PatternCard;