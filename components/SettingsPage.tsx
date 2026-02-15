
import React from 'react';
import Card from './ui/Card';
import { AppSettings } from '../types';

interface SettingsPageProps {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSettingsChange }) => {
    const handleChange = (key: keyof AppSettings, value: any) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <Card className="animate-fade-in border-slate-800 p-10 rounded-[3rem] bg-slate-900/40 relative overflow-hidden">
            <div className="absolute inset-0 terminal-grid opacity-[0.05] pointer-events-none"></div>
            
            <div className="flex items-center gap-6 mb-12 border-b border-slate-800 pb-8 relative z-10">
                <div className="p-4 bg-brand-primary/10 rounded-2xl text-brand-primary border border-brand-primary/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-3xl font-bold font-display text-white tracking-tight">System-Konfiguration</h2>
                    <p className="text-slate-500 text-sm uppercase tracking-[0.2em] font-mono mt-1">Analyse-Parameter & Heuristiken</p>
                </div>
            </div>

            <div className="space-y-12 relative z-10 max-w-2xl">
                {/* Max Length */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] font-mono">Maximale Protokolllänge (Zeichen)</label>
                        <span className="text-xl font-mono font-bold text-brand-primary">{settings.maxProtocolLength.toLocaleString()}</span>
                    </div>
                    <input 
                        type="range" 
                        min="1000" 
                        max="50000" 
                        step="1000"
                        value={settings.maxProtocolLength}
                        onChange={(e) => handleChange('maxProtocolLength', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                    <p className="text-[10px] text-slate-600 italic">Bestimmt, wie viele Zeichen der "Neural-Forensik"-Stream maximal pro Analyse verarbeitet.</p>
                </div>

                {/* Toxicity Threshold */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] font-mono">Toxicity-Score Schwellenwert (%)</label>
                        <span className="text-xl font-mono font-bold text-brand-accent">{settings.toxicityThreshold}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        step="5"
                        value={settings.toxicityThreshold}
                        onChange={(e) => handleChange('toxicityThreshold', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                    />
                    <p className="text-[10px] text-slate-600 italic">Löst einen visuellen Warnhinweis aus, sobald der berechnete Index diesen Wert überschreitet.</p>
                </div>

                {/* Detail Level */}
                <div className="space-y-6">
                    {/* Fixed typo in closing label tag: changed </ts-label> to </label> */}
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] font-mono block">Detailtiefe der Analyse</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {(['kompakt', 'standard', 'tiefgreifend'] as const).map((level) => (
                            <button
                                key={level}
                                onClick={() => handleChange('detailLevel', level)}
                                className={`px-6 py-4 rounded-2xl border-2 transition-all text-xs font-bold uppercase tracking-widest ${
                                    settings.detailLevel === level 
                                    ? 'bg-brand-primary/20 border-brand-primary text-white shadow-[0_0_20px_rgba(14,165,233,0.2)]' 
                                    : 'bg-slate-800/50 border-slate-800 text-slate-500 hover:border-slate-700'
                                }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-600 italic">
                        {settings.detailLevel === 'kompakt' && "Schnellere Analyse, fokussiert auf die wichtigsten Kern-Muster."}
                        {settings.detailLevel === 'standard' && "Ausgewogenes Verhältnis zwischen Geschwindigkeit und analytischer Tiefe."}
                        {settings.detailLevel === 'tiefgreifend' && "Maximale Nutzung des 'Thinking Budgets' für komplexe linguistische Dekonstruktion."}
                    </p>
                </div>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-800 flex justify-between items-center opacity-40">
                <span className="text-[10px] font-mono uppercase tracking-widest">Settings Hash: {btoa(JSON.stringify(settings)).substring(0, 12)}</span>
                <span className="text-[10px] font-mono uppercase tracking-widest">RDA PRO v3.5.0-STABLE</span>
            </div>
        </Card>
    );
};

export default SettingsPage;
