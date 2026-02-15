
import React from 'react';
import { useAnalysisHistory } from '../hooks/useAnalysisHistory';
import { AnalysisResult } from '../types';
// Import FileIcon from the ui/Icons file
import { XIcon, TrashIcon, DownloadIcon, FileIcon } from './ui/Icons';
import Button from './ui/Button';

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadAnalysis: (result: AnalysisResult) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, onLoadAnalysis }) => {
    const { history, removeAnalysis, clearHistory } = useAnalysisHistory();

    const exportHistory = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(history, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `rda_pro_history_${new Date().toISOString()}.json`;
        link.click();
    };
    
    return (
        <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'bg-black/60 backdrop-blur-sm' : 'pointer-events-none bg-transparent opacity-0'}`} onClick={onClose}>
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <div>
                            <h2 className="text-lg font-bold text-white uppercase tracking-tight">Analyse-Verlauf</h2>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Archivierte Protokolle</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all">
                            <XIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {history.length > 0 ? (
                        <>
                            <div className="flex-grow overflow-y-auto p-6 space-y-4">
                                {history.map((item) => (
                                    <div key={item.id} className="group p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50 hover:border-brand-primary/30 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1">{new Date(item.timestamp).toLocaleString('de-DE')}</p>
                                                <p className="text-xs text-slate-300 font-medium line-clamp-2 italic leading-relaxed">"{item.zusammenfassung}"</p>
                                            </div>
                                            <button onClick={() => removeAnalysis(item.id)} className="text-slate-600 hover:text-red-400 p-2 bg-slate-900/50 rounded-xl transition-all">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/30">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${item.score > 70 ? 'text-brand-accent border-brand-accent/20' : 'text-brand-clinical border-brand-clinical/20'}`}>
                                                Index: {item.score}
                                            </span>
                                            <button 
                                                onClick={() => onLoadAnalysis(item)} 
                                                className="text-xs font-bold text-brand-primary hover:text-white transition-all uppercase tracking-widest flex items-center gap-2"
                                            >
                                                Details laden
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                             <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-3">
                                <Button onClick={exportHistory} variant="secondary" size="sm" className="flex-1 !rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
                                    <DownloadIcon className="h-4 w-4" />
                                    Export
                                </Button>
                                <Button onClick={() => { if(window.confirm('Verlauf wirklich komplett löschen?')) clearHistory(); }} variant="danger" size="sm" className="flex-1 !rounded-xl !bg-red-950/30 !text-red-400 !border-red-900/30 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
                                    <TrashIcon className="h-4 w-4" />
                                    Clear
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-700 border border-slate-700/50">
                                <FileIcon className="h-8 w-8" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Der Verlauf ist aktuell leer. Starten Sie eine neue Analyse zur Archivierung.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistorySidebar;
