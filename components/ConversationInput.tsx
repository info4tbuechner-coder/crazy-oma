import React, { useState, useRef, useCallback } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { MicIcon, UploadIcon, TrashIcon } from './ui/Icons';
import { EXAMPLE_CONVERSATIONS } from '../constants';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import PdfPreviewModal from './PdfPreviewModal';

interface ConversationInputProps {
    onAnalyze: (conversation: string, context: string) => void;
    isLoading: boolean;
    maxLength: number;
}

const ConversationInput: React.FC<ConversationInputProps> = ({ onAnalyze, isLoading, maxLength }) => {
    const [conversation, setConversation] = useState('');
    const [context, setContext] = useState('');
    const [pendingPdf, setPendingPdf] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onSpeechResult = useCallback((text: string) => {
        setConversation(prev => prev + (prev ? ' ' : '') + text);
    }, []);

    const { isListening, toggle: toggleMic } = useSpeechRecognition(onSpeechResult);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type === 'application/pdf') {
            setPendingPdf(file);
        } else {
            const reader = new FileReader();
            reader.onload = (event) => setConversation(event.target?.result as string);
            reader.readAsText(file);
        }
    };

    const handlePdfExtract = (text: string) => {
        setConversation(text);
        setPendingPdf(null);
    };

    const charCount = conversation.length;
    const isLimitExceeded = charCount > maxLength;
    const progressPercent = Math.min((charCount / maxLength) * 100, 100);

    return (
        <div className="space-y-6 md:space-y-12 animate-slide-up">
            <Card className="border-slate-800 bg-slate-900/50 relative overflow-hidden p-0 rounded-3xl md:rounded-[4rem] shadow-3xl border-2 hover:border-slate-700 transition-all group/input">
                <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary opacity-20 group-hover:opacity-60 transition-opacity duration-1000"></div>
                
                <div className="p-6 md:p-14 space-y-6 md:space-y-12">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1 md:space-y-3">
                            <label className="text-[10px] md:text-[11px] font-black text-brand-primary uppercase tracking-[0.4em] md:tracking-[0.6em] flex items-center gap-3 md:gap-5 font-mono">
                                <span className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${isListening ? 'bg-brand-accent animate-ping' : 'bg-brand-primary animate-pulse-slow shadow-[0_0_12px_rgba(14,165,233,0.5)]'}`}></span>
                                Primary Entry Port
                            </label>
                            <p className="text-[8px] md:text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] ml-5 md:ml-8">Core-Buffer: Stable | {isListening ? 'Streaming' : 'Ready'}</p>
                        </div>
                        <div className="flex gap-2 md:gap-4">
                            <button 
                                onClick={toggleMic}
                                className={`p-4 md:p-6 rounded-2xl md:rounded-[1.8rem] transition-all border-2 ${isListening ? 'bg-brand-accent/20 text-brand-accent border-brand-accent shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'bg-slate-950 text-slate-600 border-slate-800 hover:text-brand-primary hover:border-brand-primary/40 active:scale-95'}`}
                                aria-label="Sprachaufzeichnung"
                            >
                                <MicIcon className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                            <button 
                                onClick={() => { if(window.confirm('Buffer wirklich löschen?')) setConversation(''); }}
                                className="p-4 md:p-6 bg-slate-950 text-slate-600 border-2 border-slate-800 hover:text-brand-accent hover:border-brand-accent/40 rounded-2xl md:rounded-[1.8rem] transition-all active:scale-95"
                                aria-label="Buffer löschen"
                            >
                                <TrashIcon className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="relative group/field">
                        {/* Mobile Text Size: text-base prevents iOS zoom on focus. Desktop returns to text-sm/base */}
                        <textarea
                            rows={8}
                            value={conversation}
                            onChange={(e) => setConversation(e.target.value)}
                            placeholder="Protokoll-Daten hier einspeisen..."
                            className={`w-full bg-slate-950/70 border-2 border-slate-800 rounded-2xl md:rounded-[3rem] text-base md:text-lg focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/30 transition-all p-6 md:p-12 placeholder-slate-800 font-mono leading-relaxed resize-none ${isLimitExceeded ? 'border-brand-accent ring-brand-accent/10' : ''}`}
                        />
                        <div className="absolute bottom-4 right-4 md:bottom-10 md:right-12 flex items-center gap-3 md:gap-6 bg-slate-950/95 rounded-xl border border-slate-800 px-4 py-1.5 md:px-7 md:py-3 shadow-4xl backdrop-blur-md">
                             <div className="hidden md:block w-28 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                                <div className={`h-full ${isLimitExceeded ? 'bg-brand-accent shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-brand-primary shadow-[0_0_10px_rgba(14,165,233,0.5)]'} transition-all duration-1000 ease-out`} style={{ width: `${progressPercent}%` }}></div>
                             </div>
                             <span className={`text-[9px] md:text-[10px] font-mono font-black tracking-tighter ${isLimitExceeded ? 'text-brand-accent animate-pulse' : 'text-slate-500'}`}>
                                {charCount.toLocaleString()} <span className="text-slate-800">/</span> {maxLength.toLocaleString()} B
                             </span>
                        </div>
                    </div>

                    <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6">
                        <div className="relative">
                             {/* Mobile Text Size: text-base prevents iOS zoom */}
                            <input
                                type="text"
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                placeholder="Kontext-Variablen..."
                                className="w-full bg-slate-950/80 border-2 border-slate-800 rounded-xl md:rounded-[2.2rem] text-base md:text-sm focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/30 transition-all px-6 py-4 md:px-10 md:py-6 placeholder-slate-800 font-sans shadow-inner"
                            />
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className="flex items-center justify-center gap-3 px-6 py-4 md:px-10 md:py-6 bg-slate-950/50 border-2 border-slate-800 rounded-xl md:rounded-[2.2rem] text-[10px] md:text-[11px] text-slate-500 hover:text-white hover:border-brand-primary/30 transition-all uppercase tracking-[0.2em] md:tracking-[0.4em] font-black group/btn active:scale-95"
                        >
                            <UploadIcon className="w-4 h-4 md:w-5 md:h-5" /> 
                            Import Report
                        </button>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.pdf" onChange={handleFileUpload} />
                </div>

                <div className="px-6 pb-6 md:px-14 md:pb-14 md:pt-0">
                    <Button 
                        onClick={() => onAnalyze(conversation, context)} 
                        isLoading={isLoading} 
                        disabled={isLimitExceeded || !conversation.trim()}
                        className="w-full !rounded-2xl md:!rounded-[4rem] !py-6 md:!py-12 !bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-110 shadow-3xl shadow-brand-primary/20 transition-all font-display text-lg md:text-2xl font-black tracking-tight uppercase active:scale-[0.98]"
                    >
                        Analyse Starten
                    </Button>
                </div>
            </Card>

            <div className="px-4 md:px-10 space-y-4 md:space-y-8">
                <div className="flex items-center gap-4 md:gap-6">
                    <h4 className="text-[9px] md:text-[11px] font-black text-slate-800 uppercase tracking-[0.5em] md:tracking-[1em] font-mono whitespace-nowrap">Tactical Presets</h4>
                    <div className="h-[1px] w-full bg-slate-900/50"></div>
                </div>
                <div className="flex flex-wrap md:grid md:grid-cols-1 gap-3 md:gap-5">
                    {EXAMPLE_CONVERSATIONS.map((ex, i) => (
                        <button 
                            key={i} 
                            onClick={() => {setConversation(ex.conversation); setContext(ex.context);}}
                            className="flex-1 md:flex-none text-left p-4 md:p-10 bg-slate-900/20 border-2 border-slate-800/40 hover:border-brand-primary/30 rounded-xl md:rounded-[3rem] group transition-all hover:bg-slate-900/40 hover:scale-[1.01] active:scale-[0.99]"
                        >
                            <p className="text-[10px] md:text-[12px] font-black text-slate-500 group-hover:text-brand-primary transition-colors uppercase tracking-[0.1em] md:tracking-[0.3em] leading-relaxed">
                                {ex.name}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {pendingPdf && <PdfPreviewModal file={pendingPdf} onClose={() => setPendingPdf(null)} onExtract={handlePdfExtract} />}
        </div>
    );
};

export default ConversationInput;