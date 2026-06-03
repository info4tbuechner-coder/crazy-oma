import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { NarcissisticPattern } from '../types';
import Card from './ui/Card';
import { InfoIcon } from './ui/Icons';

interface PatternSummaryGridProps {
    patterns: NarcissisticPattern[];
    activePatternId: string | null;
    onSelectPattern: (id: string) => void;
    onLocatePattern: (id: string) => void;
}

const SEVERITY_ORDER: Record<string, number> = {
    kritisch: 4,
    hoch: 3,
    mittel: 2,
    niedrig: 1
};

const SEVERITY_CONFIG = {
    kritisch: {
        bg: 'bg-brand-accent/10',
        border: 'border-brand-accent/40 hover:border-brand-accent/80',
        selectedBorder: 'border-brand-accent shadow-[0_0_25px_rgba(244,63,94,0.3)]',
        color: 'text-brand-accent',
        bullet: 'bg-brand-accent animate-ping',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]',
        label: 'Kritisch'
    },
    hoch: {
        bg: 'bg-brand-accent/5',
        border: 'border-brand-accent/20 hover:border-brand-accent/50',
        selectedBorder: 'border-brand-accent/80 shadow-[0_0_20px_rgba(244,63,94,0.2)]',
        color: 'text-brand-accent/80',
        bullet: 'bg-brand-accent/80',
        glow: 'shadow-[0_0_10px_rgba(244,63,94,0.1)]',
        label: 'Hoch'
    },
    mittel: {
        bg: 'bg-brand-warning/5',
        border: 'border-brand-warning/25 hover:border-brand-warning/60',
        selectedBorder: 'border-brand-warning shadow-[0_0_20px_rgba(245,158,11,0.2)]',
        color: 'text-brand-warning',
        bullet: 'bg-brand-warning',
        glow: 'shadow-[0_0_10px_rgba(245,158,11,0.05)]',
        label: 'Mittel'
    },
    niedrig: {
        bg: 'bg-slate-800/10',
        border: 'border-slate-800 hover:border-slate-600',
        selectedBorder: 'border-slate-500 shadow-none',
        color: 'text-slate-400',
        bullet: 'bg-slate-500',
        glow: 'shadow-none',
        label: 'Niedrig'
    }
};

export const PatternSummaryGrid: React.FC<PatternSummaryGridProps> = ({
    patterns,
    activePatternId,
    onSelectPattern,
    onLocatePattern
}) => {
    const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

    // Sync selected pattern id with parent if specified; otherwise fall back to internal
    const activeId = activePatternId || internalSelectedId;

    // Severity metric counts
    const severityCounts = useMemo(() => {
        const counts = { total: patterns.length, kritisch: 0, hoch: 0, mittel: 0, niedrig: 0 };
        patterns.forEach(p => {
            if (p.schweregrad in counts) {
                counts[p.schweregrad as keyof typeof counts]++;
            }
        });
        return counts;
    }, [patterns]);

    // Sort and filter patterns
    const processedPatterns = useMemo(() => {
        let items = [...patterns];

        // Filter by severity tier
        if (selectedSeverityFilter) {
            items = items.filter(p => p.schweregrad === selectedSeverityFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            items = items.filter(
                p =>
                    p.muster_name.toLowerCase().includes(query) ||
                    p.zitat.toLowerCase().includes(query) ||
                    p.erklaerung.toLowerCase().includes(query)
            );
        }

        // Sorted by severity priority order
        return items.sort((a, b) => {
            const levelA = SEVERITY_ORDER[a.schweregrad] || 0;
            const levelB = SEVERITY_ORDER[b.schweregrad] || 0;
            return levelB - levelA;
        });
    }, [patterns, selectedSeverityFilter, searchQuery]);

    // Automatically inspect the first element or most toxic if nothing selected
    const selectedPattern = useMemo(() => {
        if (activeId) {
            const found = patterns.find(p => p.id === activeId);
            if (found) return found;
        }
        return processedPatterns[0] || null;
    }, [activeId, patterns, processedPatterns]);

    const handleSelect = (id: string) => {
        setInternalSelectedId(id);
        onSelectPattern(id);
    };

    return (
        <div id="tactical-threat-matrix" className="space-y-6 md:space-y-10">
            {/* HUD Control Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-900/50">
                <div className="space-y-2">
                    <h4 className="text-sm font-black text-brand-primary uppercase tracking-[0.4em] font-mono flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse shadow-[0_0_10px_rgba(244,63,94,1)]"></span>
                        Synthetisierte Muster-Zusammenfassung
                    </h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                        Gezielte Dekonstruktion toxischer Kommunikationstaktiken
                    </p>
                </div>

                {/* Live Real-time Counters as Filter Pills */}
                <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setSelectedSeverityFilter(null)}
                        className={`px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-[0.15em] font-mono transition-all ${
                            selectedSeverityFilter === null
                                ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/30 shadow-[0_0_15px_rgba(14,165,233,0.15)]Scale-105'
                                : 'bg-slate-950/40 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
                        }`}
                    >
                        Alle ({severityCounts.total})
                    </button>

                    {(['kritisch', 'hoch', 'mittel', 'niedrig'] as const).map(sev => {
                        const count = severityCounts[sev];
                        const cfg = SEVERITY_CONFIG[sev];
                        const isActive = selectedSeverityFilter === sev;
                        return (
                            <button
                                key={sev}
                                onClick={() => setSelectedSeverityFilter(sev)}
                                className={`px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-[0.15em] font-mono transition-all flex items-center gap-2 ${
                                    isActive
                                        ? `${cfg.bg} ${cfg.color} ${cfg.selectedBorder} scale-105`
                                        : 'bg-slate-950/40 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
                                }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.bullet}`} />
                                {cfg.label} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Live Search and Metric Panel */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Search Bar & Grid Column */}
                <div className="xl:col-span-7 space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Mustername, Erklärung oder Zitat filtern..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl py-4 pl-12 pr-6 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 font-mono transition-all"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Interactive Grid Representation */}
                    {processedPatterns.length === 0 ? (
                        <div className="text-center py-16 bg-[#040812]/50 border border-slate-900 rounded-[2rem] border-dashed">
                            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest italic">
                                Keine Muster entsprechen dem aktiven Filter
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {processedPatterns.map((m, index) => {
                                const cfg = SEVERITY_CONFIG[m.schweregrad as keyof typeof SEVERITY_CONFIG];
                                const isSelected = selectedPattern && selectedPattern.id === m.id;
                                return (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
                                        key={m.id}
                                        onClick={() => handleSelect(m.id)}
                                        className={`
                                            w-full text-left p-6 rounded-[2rem] border-2 backdrop-blur-md transition-all duration-300 relative overflow-hidden group/item flex flex-col justify-between h-[180px]
                                            ${isSelected ? `${cfg.selectedBorder} ${cfg.bg}` : `border-slate-900/60 bg-[#040812]/40 hover:bg-[#070e1d]/50 ${cfg.border}`}
                                        `}
                                    >
                                        {/* Corner Decorative indicators */}
                                        <div className="absolute top-0 right-0 w-8 h-8 opacity-[0.03] group-hover/item:opacity-10 transition-opacity">
                                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M0 0H32V32" />
                                            </svg>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start">
                                                {/* Meta ID */}
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${cfg.bullet}`} />
                                                    <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
                                                        ID:{m.id.substring(0, 5).toUpperCase()}
                                                    </span>
                                                </div>
                                                {/* Severity Badge */}
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full font-mono border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                                    {m.schweregrad}
                                                </span>
                                            </div>

                                            {/* Pattern Title */}
                                            <h5 className="text-sm md:text-base font-display font-bold text-slate-200 group-hover/item:text-white transition-colors uppercase tracking-tight line-clamp-1">
                                                {m.muster_name}
                                            </h5>

                                            {/* Zitat Snippet */}
                                            <p className="text-xs text-slate-500 font-serif italic line-clamp-2 pr-2">
                                                "{m.zitat}"
                                            </p>
                                        </div>

                                        {/* Bottom Status Ribbon */}
                                        <div className="pt-2 flex justify-between items-center text-[8px] font-mono text-slate-600 border-t border-slate-900/30">
                                            <span>KLICKEN FÜR TACTICAL INSPECT</span>
                                            <span className="group-hover/item:text-brand-primary transition-colors">➔</span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Expanded Tactical Inspect HUD Panel */}
                <div className="xl:col-span-5 h-full">
                    <AnimatePresence mode="wait">
                        {selectedPattern ? (
                            <motion.div
                                key={selectedPattern.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.25 }}
                                className="h-full"
                            >
                                <Card className="p-8 rounded-[3rem] border-slate-850 bg-[#050b16] shadow-4xl relative overflow-hidden flex flex-col justify-between min-h-[460px] border-2 border-slate-800/80">
                                    <div className="absolute inset-0 terminal-grid opacity-5 pointer-events-none"></div>
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-primary/40 animate-pulse"></div>

                                    {/* Inspect Header */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-1">
                                                <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.3em] font-mono flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-ping" />
                                                    Tactical Inspect
                                                </span>
                                                <h4 className="text-lg md:text-xl font-display font-bold text-white uppercase tracking-tight">
                                                    {selectedPattern.muster_name}
                                                </h4>
                                            </div>

                                            <div className={`px-4 py-1 rounded text-[9px] font-mono uppercase tracking-widest font-black ${SEVERITY_CONFIG[selectedPattern.schweregrad as keyof typeof SEVERITY_CONFIG].bg} ${SEVERITY_CONFIG[selectedPattern.schweregrad as keyof typeof SEVERITY_CONFIG].border} ${SEVERITY_CONFIG[selectedPattern.schweregrad as keyof typeof SEVERITY_CONFIG].color}`}>
                                                {selectedPattern.schweregrad}
                                            </div>
                                        </div>

                                        {/* Evidence Quoted Content */}
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Linguistischer Payload (Zitat)</span>
                                            <div className="bg-slate-950/80 border-l-2 border-brand-accent p-4 rounded-r-xl relative overflow-hidden">
                                                <p className="font-serif italic text-sm text-slate-200 leading-relaxed">
                                                    "{selectedPattern.zitat}"
                                                </p>
                                            </div>
                                        </div>

                                        {/* Explanation */}
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Forense Dekonstruktion</span>
                                            <p className="text-xs text-slate-400 font-mono leading-relaxed bg-[#030610]/40 p-4 rounded-xl border border-slate-900/40">
                                                {selectedPattern.erklaerung}
                                            </p>
                                        </div>

                                        {/* Actions & Countermeasures Section */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-brand-clinical">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-[8px] font-mono uppercase tracking-wider font-bold">Empfohlene Gegenmassnahme</span>
                                            </div>
                                            <div className="bg-brand-clinical/5 border border-brand-clinical/20 p-4 rounded-xl">
                                                <p className="text-xs text-brand-clinical font-semibold leading-relaxed">
                                                    {selectedPattern.gegenmassnahme}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Shortcuts */}
                                    <div className="pt-6 border-t border-slate-900/50 mt-8 flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => onLocatePattern(selectedPattern.id)}
                                            className="flex-1 py-3 px-4 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider font-mono text-center transition-all"
                                        >
                                            🔍 Evidence Mirror Focus
                                        </button>
                                        <button
                                            onClick={() => {
                                                const dossierElement = document.getElementById(`pattern-dossier-${selectedPattern.id}`);
                                                if (dossierElement) {
                                                    dossierElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    dossierElement.classList.add('ring-4', 'ring-brand-primary/40');
                                                    setTimeout(() => dossierElement.classList.remove('ring-4', 'ring-brand-primary/40'), 2000);
                                                }
                                            }}
                                            className="flex-1 py-3 px-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider font-mono text-center transition-all"
                                        >
                                            ➔ Zum Dossier
                                        </button>
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <Card className="p-8 rounded-[3rem] border-slate-900/50 bg-[#040812]/20 flex flex-col items-center justify-center min-h-[460px] text-center">
                                <InfoIcon className="w-12 h-12 text-slate-700 mb-4 animate-pulse" />
                                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500">
                                    Target Monitor Offline
                                </h4>
                                <p className="text-[10px] text-slate-600 font-mono mt-2 uppercase">
                                    Wähle ein Bedrohungsmuster links aus, um den De-Larping-Decoder zu starten
                                </p>
                            </Card>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};
