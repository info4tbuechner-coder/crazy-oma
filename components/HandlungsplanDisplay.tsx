
import React, { useState } from 'react';
import type { AnalysisResult, Advice, OptimizedResponse } from '../types';
import Card from './ui/Card';
import { CopyIcon, CheckIcon, LightBulbIcon } from './ui/Icons';
import AdviceCard from './AdviceCard';

interface HandlungsplanDisplayProps {
    plan: AnalysisResult['handlungsplan'];
}

const HandlungsplanDisplay: React.FC<HandlungsplanDisplayProps> = ({ plan }) => {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2000);
        });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Fazit Section */}
            <Card className="bg-brand-primary/[0.03] border-brand-primary/20 p-8 rounded-[3rem]">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                        <LightBulbIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black text-brand-primary uppercase tracking-[0.4em] font-mono">Strategisches Fazit</h3>
                </div>
                <p className="text-slate-200 text-lg leading-relaxed italic font-serif border-l-2 border-brand-primary/30 pl-6">
                    "{plan.fazit}"
                </p>
            </Card>

            {/* Response Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponseCard 
                    title="Deeskalierend" 
                    text={plan.vorschlag_antwort.deeskalierend} 
                    type="neutral"
                    onCopy={() => copyToClipboard(plan.vorschlag_antwort.deeskalierend, 'deeskalierend')}
                    isCopied={copiedKey === 'deeskalierend'}
                />
                <ResponseCard 
                    title="Bestimmt" 
                    text={plan.vorschlag_antwort.bestimmt} 
                    type="clinical"
                    onCopy={() => copyToClipboard(plan.vorschlag_antwort.bestimmt, 'bestimmt')}
                    isCopied={copiedKey === 'bestimmt'}
                />
            </div>

            {/* Advice Grid */}
            <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em] font-mono px-4">Interventions-Protokoll</h4>
                <div className="grid grid-cols-1 gap-4">
                    {plan.interventionen.map((advice, idx) => (
                        <AdviceCard key={idx} advice={advice} />
                    ))}
                </div>
            </div>
        </div>
    );
};

interface ResponseCardProps {
    title: string;
    text: string;
    type: 'neutral' | 'clinical';
    onCopy: () => void;
    isCopied: boolean;
}

const ResponseCard: React.FC<ResponseCardProps> = ({ title, text, type, onCopy, isCopied }) => {
    const colorClass = type === 'clinical' ? 'text-brand-clinical' : 'text-slate-400';
    const bgClass = type === 'clinical' ? 'bg-brand-clinical/[0.03]' : 'bg-slate-900/40';
    const borderClass = type === 'clinical' ? 'border-brand-clinical/20' : 'border-slate-800';

    return (
        <Card className={`${bgClass} ${borderClass} p-8 rounded-[2.5rem] group relative overflow-hidden transition-all duration-500 hover:border-brand-primary/30`}>
            <div className="flex justify-between items-center mb-6">
                <span className={`text-[9px] font-black uppercase tracking-[0.4em] font-mono ${colorClass}`}>{title}</span>
                <button 
                    onClick={onCopy}
                    className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-500 hover:text-brand-primary transition-all active:scale-95"
                >
                    {isCopied ? <CheckIcon className="w-4 h-4 text-brand-clinical" /> : <CopyIcon className="w-4 h-4" />}
                </button>
            </div>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-mono selection:bg-brand-primary/40">
                {text}
            </p>
        </Card>
    );
};

export default HandlungsplanDisplay;
