import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import ScoreGauge from './ScoreGauge';
import PatternCard from './PatternCard';
import FingerprintDisplay from './FingerprintDisplay';
import PatternDistributionChart from './PatternDistributionChart';
import HandlungsplanDisplay from './HandlungsplanDisplay';
import { DownloadIcon, ExpandIcon, ShrinkIcon, InfoIcon, FileIcon } from './ui/Icons';
import PrintPreviewModal from './PrintPreviewModal';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface AnalysisDisplayProps {
    state: {
        status: 'idle' | 'loading' | 'success' | 'error';
        data: AnalysisResult | null;
        error: string | null;
    };
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ state }) => {
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [activePatternId, setActivePatternId] = useState<string | null>(null);
    const [tooltipData, setTooltipData] = useState<{ x: number, y: number, text: string, name: string, severity: string } | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const patternRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const containerRef = useRef<HTMLDivElement>(null);

    const toggleFullScreen = useCallback(() => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => setIsFullScreen(true)).catch(console.error);
        } else {
            document.exitFullscreen().then(() => setIsFullScreen(false)).catch(console.error);
        }
    }, []);

    useEffect(() => {
        const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const scrollToPattern = useCallback((id: string) => {
        setActivePatternId(id);
        const target = patternRefs.current[id];
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.classList.add('ring-4', 'ring-brand-primary/40', 'duration-500', 'scale-[1.02]');
            setTimeout(() => target.classList.remove('ring-4', 'ring-brand-primary/40', 'scale-[1.02]'), 2000);
        }
    }, []);

    const radarData = useMemo(() => {
        if (!state.data) return [];
        const f = state.data.linguistischer_fingerabdruck;
        return [
            { subject: 'Validierung', A: f.emotionale_validierung, fullMark: 100 },
            { subject: 'Transparenz', A: Math.max(0, 100 - state.data.score), fullMark: 100 },
            { subject: 'Empathie', A: f.emotionale_validierung * 0.8, fullMark: 100 },
            { subject: 'Klarheit', A: 100 - (state.data.erkannte_muster.length * 10), fullMark: 100 },
            { subject: 'Objektivität', A: 50 + (f.emotionale_validierung / 2), fullMark: 100 },
        ];
    }, [state.data]);

    const highlightedText = useMemo(() => {
        if (!state.data) return null;
        const text = state.data.original_text;
        const patterns = [...state.data.erkannte_muster]
            .filter(p => p.startIndex !== undefined)
            .sort((a, b) => a.startIndex! - b.startIndex!);
        
        const parts: React.ReactNode[] = [];
        let lastIdx = 0;

        patterns.forEach((p) => {
            const start = p.startIndex!;
            const end = p.endIndex!;
            if (start < lastIdx) return;
            
            if (start > lastIdx) parts.push(text.substring(lastIdx, start));
            
            const isCritical = p.schweregrad === 'hoch' || p.schweregrad === 'kritisch';
            parts.push(
                <span 
                    key={`hl-${p.id}`} 
                    onMouseEnter={() => setActivePatternId(p.id)}
                    onMouseMove={(e) => setTooltipData({ x: e.clientX + 10, y: e.clientY + 10, text: p.erklaerung, name: p.muster_name, severity: p.schweregrad })}
                    onMouseLeave={() => { setTooltipData(null); setActivePatternId(null); }}
                    onClick={() => scrollToPattern(p.id)}
                    className={`
                        ${isCritical ? 'highlight-critical' : 'highlight-warning'} 
                        ${activePatternId === p.id ? 'highlight-active' : ''} 
                        cursor-pointer px-1 rounded transition-all duration-300
                    `}
                >
                    {text.substring(start, end)}
                </span>
            );
            lastIdx = end;
        });
        
        if (lastIdx < text.length) parts.push(text.substring(lastIdx));
        return parts;
    }, [state.data, activePatternId, scrollToPattern]);

    if (state.status === 'loading') return (
        <div className="flex flex-col items-center justify-center py-48 forensic-panel rounded-[5rem] animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-primary/[0.02] animate-pulse"></div>
            <div className="absolute inset-0 terminal-grid opacity-10"></div>
            <div className="relative mb-16">
                <div className="w-40 h-40 border-[3px] border-slate-800 border-t-brand-primary rounded-full animate-spin shadow-[0_0_100px_rgba(14,165,233,0.2)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-brand-primary/10 rounded-full animate-ping opacity-20"></div>
                </div>
            </div>
            <div className="text-center space-y-8 px-6 relative z-10">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-[1.2em] font-mono animate-terminal-blink">Omega_Scan_Active</h3>
                <div className="flex flex-col items-center gap-4">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest italic">Interrogating linguistic payload...</p>
                    <div className="h-0.5 bg-slate-900 rounded-full overflow-hidden w-64 md:w-96 border border-slate-800">
                        <div className="h-full bg-brand-primary animate-scan shadow-[0_0_25px_rgba(14,165,233,1)]"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (state.status === 'error') return (
        <Card className="border-brand-accent/40 bg-brand-accent/[0.03] p-24 text-center rounded-[4rem] animate-shake">
            <h3 className="text-4xl font-black text-white mb-6 font-display uppercase tracking-tight">System Leak Detected</h3>
            <p className="text-slate-500 text-lg mb-12 font-mono italic max-w-xl mx-auto leading-relaxed border-l-2 border-brand-accent/20 pl-8 italic">
                {state.error || "Unerwartete Protokoll-Unterbrechung"}
            </p>
            <Button variant="danger" onClick={() => window.location.reload()} className="!rounded-full !px-20 !py-8 !text-xs uppercase tracking-[0.5em] font-black">Emergency Reset</Button>
        </Card>
    );

    if (!state.data) return null;
    const res = state.data;

    return (
        <div 
            ref={containerRef}
            className={`space-y-16 md:space-y-32 animate-fade-in ${isFullScreen ? 'fixed inset-0 z-[100] bg-slate-950 p-12 overflow-y-auto crt-effect' : 'pb-64'}`}
        >
            {/* Primary Analysis HUB */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <Card className="lg:col-span-5 p-12 md:p-20 rounded-[4rem] bg-[#070e1a] border-slate-800 shadow-4xl flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full terminal-grid opacity-5"></div>
                    <ScoreGauge score={res.score} />
                    <div className="mt-16 text-center">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[1em] font-mono mb-4 block">Risk Assessment</span>
                        <div className={`px-16 py-4 rounded-full border-2 text-[12px] font-black tracking-[0.6em] font-mono shadow-2xl transition-all duration-1000 ${res.score > 70 ? 'bg-brand-accent/5 text-brand-accent border-brand-accent/20' : 'bg-brand-clinical/5 text-brand-clinical border-brand-clinical/20'}`}>
                            {res.score > 70 ? 'CRITICAL_THREAT' : 'STABLE_PROTOCOL'}
                        </div>
                    </div>
                </Card>

                <Card className="lg:col-span-7 p-12 md:p-20 rounded-[4rem] bg-[#070e1a]/95 border-slate-800 shadow-4xl relative overflow-hidden flex flex-col justify-between">
                    <div className="space-y-12">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[12px] md:text-[14px] font-black text-brand-primary uppercase tracking-[1em] font-mono flex items-center gap-6">
                                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-ping"></span>
                                Executive Dossier
                            </h3>
                            <span className="text-[8px] font-mono text-slate-700 bg-slate-950 px-3 py-1 rounded-md border border-slate-800">SIG_TYPE: OMEGA_SYNTH</span>
                        </div>
                        <p className="text-white text-3xl md:text-5xl font-display font-bold leading-[1.15] tracking-tight italic decoration-brand-primary/10 decoration-[12px] underline-offset-[-10px] underline">
                            {res.zusammenfassung}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-12 pt-16 border-t border-slate-800/50 mt-16">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] font-mono">Linguistic Radar</h4>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid stroke="#1e293b" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 8, fontFamily: 'JetBrains Mono' }} />
                                        <Radar name="OMEGA" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] font-mono">Fingerprint Analysis</h4>
                            <FingerprintDisplay fingerprint={res.linguistischer_fingerabdruck} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Forensic Visualization (The Mirror) */}
            <div className="space-y-12">
                 <div className="flex items-center gap-10 px-8">
                    <h3 className="text-[13px] font-black text-slate-700 uppercase tracking-[2em] font-mono whitespace-nowrap">Forensic_Mirror_v4</h3>
                    <div className="h-[1px] w-full bg-slate-900 shadow-inner"></div>
                </div>
                <Card className={`scanline-container p-12 md:p-24 rounded-[5rem] border-slate-800 bg-[#03070d] shadow-2xl relative overflow-hidden`}>
                    <div className="absolute inset-0 terminal-grid opacity-5 pointer-events-none"></div>
                    <div className="flex flex-col lg:flex-row justify-between items-start mb-20 gap-8 relative z-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-6">
                                <div className="w-4 h-4 bg-brand-primary rounded-full animate-glow-pulse shadow-[0_0_20px_rgba(14,165,233,1)]"></div>
                                <h3 className="text-xl md:text-2xl font-black text-brand-primary uppercase tracking-[1.5em] font-mono">Evidence Stream</h3>
                            </div>
                            <p className="text-[9px] text-slate-600 uppercase tracking-[0.4em] font-bold italic pl-10">Deconstructing Subtextual Manipulation in Real-Time</p>
                        </div>
                        <div className="flex gap-4 w-full lg:w-auto">
                            <button onClick={toggleFullScreen} className="flex-1 lg:flex-none p-6 bg-slate-900/40 border border-slate-800 text-slate-500 rounded-[2rem] hover:text-brand-primary hover:border-brand-primary/40 transition-all shadow-xl backdrop-blur-md active:scale-95">
                                {isFullScreen ? <ShrinkIcon className="w-6 h-6" /> : <ExpandIcon className="w-6 h-6" />}
                            </button>
                            <Button variant="secondary" onClick={() => setShowPrintModal(true)} className="flex-1 lg:flex-none !rounded-[2rem] !px-12 !py-6 !text-[10px] !bg-slate-900/40 !border-slate-800 !text-slate-400 hover:!text-white shadow-xl !tracking-[0.4em]">
                                <DownloadIcon className="w-5 h-5 mr-4" /> EXPORT_PROTOCOL
                            </Button>
                        </div>
                    </div>
                    <div className="forensic-mirror text-slate-300 text-xl md:text-3xl font-mono whitespace-pre-wrap p-12 md:p-20 border border-slate-900/60 rounded-[4rem] bg-slate-950/60 leading-[2.6] antialiased relative z-10 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] overflow-hidden min-h-[500px]">
                        <div className="absolute top-0 left-0 w-full h-full bg-brand-primary/[0.005] pointer-events-none"></div>
                        {highlightedText}
                    </div>
                </Card>
            </div>

            {/* Tactical Interventions Section */}
            <div className="space-y-16">
                <div className="flex items-center gap-10 px-8">
                    <h3 className="text-[13px] font-black text-slate-700 uppercase tracking-[2em] font-mono whitespace-nowrap">Strategic_Interventions</h3>
                    <div className="h-[1px] w-full bg-slate-900 shadow-inner"></div>
                </div>
                <HandlungsplanDisplay plan={res.handlungsplan} />
            </div>

            {/* Detailed Dossiers Section */}
            <div className="space-y-16">
                <div className="flex items-center gap-10 px-8">
                    <h3 className="text-[13px] font-black text-slate-700 uppercase tracking-[2em] font-mono whitespace-nowrap">Pattern Dossiers</h3>
                    <div className="h-[1px] w-full bg-slate-900 shadow-inner"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
                    {res.erkannte_muster.map((m) => (
                        <div 
                            key={m.id} 
                            ref={el => { patternRefs.current[m.id] = el; }}
                            onMouseEnter={() => setActivePatternId(m.id)}
                            onMouseLeave={() => setActivePatternId(null)}
                            className={`transition-all duration-1000 ${activePatternId === m.id ? 'scale-[1.03] z-10' : ''}`}
                        >
                            <PatternCard pattern={m} isActive={activePatternId === m.id} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Tactical HUD Tooltip */}
            {tooltipData && (
                <div 
                    className="fixed pointer-events-none z-[1000] forensic-panel p-8 rounded-[2.5rem] border-2 border-brand-primary/50 max-w-[340px] shadow-[0_0_80px_rgba(14,165,233,0.3)] animate-fade-in backdrop-blur-3xl overflow-hidden"
                    style={{ 
                        left: Math.min(tooltipData.x, window.innerWidth - 380), 
                        top: Math.max(20, Math.min(tooltipData.y, window.innerHeight - 300)) 
                    }}
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary animate-scan opacity-50"></div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <InfoIcon className="w-5 h-5 text-brand-primary" />
                            <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em] font-mono">Omega_ID_Verify</span>
                        </div>
                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest font-mono ${tooltipData.severity === 'hoch' || tooltipData.severity === 'kritisch' ? 'text-brand-accent bg-brand-accent/10 border border-brand-accent/20' : 'text-brand-warning bg-brand-warning/10 border border-brand-warning/20'}`}>
                            {tooltipData.severity}
                        </span>
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-3 tracking-tight font-display">{tooltipData.name}</h4>
                    <p className="text-[14px] text-slate-300 font-mono leading-relaxed italic opacity-90">
                        {tooltipData.text}
                    </p>
                    <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                         <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">TAP_TO_LOCATE_DOSSIER</span>
                         <div className="flex gap-1">
                            {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-brand-primary/40 rounded-full"></div>)}
                         </div>
                    </div>
                </div>
            )}

            {showPrintModal && <PrintPreviewModal result={res} onClose={() => setShowPrintModal(false)} />}
        </div>
    );
};

export default AnalysisDisplay;