
import React, { useState, useEffect, useCallback } from 'react';
import { analyzeConversation } from '../services/geminiService';
import { useSessionState } from '../hooks/useSessionState';
import { usePersistentState } from '../hooks/usePersistentState';
import { useAnalysisHistory } from '../hooks/useAnalysisHistory';
import { AnalysisResult, AppSettings } from '../types';

import SplashScreen from './SplashScreen';
import LoginScreen from './LoginScreen';
import Header from './Header';
import ConversationInput from './ConversationInput';
import AnalysisDisplay from './AnalysisDisplay';
import HistorySidebar from './HistorySidebar';
import HelpPage from './HelpPage';
import SettingsPage from './SettingsPage';
import { HistoryIcon, TrashIcon } from './ui/Icons';
import Button from './ui/Button';

type AnalysisState = {
    status: 'idle' | 'loading' | 'success' | 'error';
    data: AnalysisResult | null;
    error: string | null;
};

const DEFAULT_SETTINGS: AppSettings = {
    maxProtocolLength: 15000,
    toxicityThreshold: 70,
    detailLevel: 'standard',
    enableCrtEffect: true
};

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useSessionState<boolean>('rda_pro_auth', false);
    const [showSplash, setShowSplash] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'main' | 'help' | 'settings'>('main');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    
    const [settings, setSettings] = usePersistentState<AppSettings>('rda_pro_settings', DEFAULT_SETTINGS);

    const [analysisState, setAnalysisState] = useState<AnalysisState>({
        status: 'idle',
        data: null,
        error: null,
    });

    const { addAnalysis } = useAnalysisHistory();

    // Haptic Feedback Helper
    const vibrate = (pattern: number | number[]) => {
        if ('vibrate' in navigator) {
            try { navigator.vibrate(pattern); } catch (e) {}
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2200);
        
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handlePanic = useCallback(() => {
        vibrate([50, 100, 50]);
        if(window.confirm('VORSICHT: Alle lokalen Daten werden gelöscht und die Sitzung beendet. Fortfahren?')) {
            window.localStorage.clear();
            window.sessionStorage.clear();
            window.location.reload();
        }
    }, []);

    const handleAnalyze = useCallback(async (conversation: string, context: string) => {
        if (!conversation.trim()) {
            vibrate(30);
            setAnalysisState({ 
                status: 'error', 
                data: null, 
                error: "Systemfehler: Keine Primärdaten für die Analyse vorhanden." 
            });
            return;
        }

        vibrate(50);
        setAnalysisState({ status: 'loading', data: null, error: null });
        
        try {
            const result = await analyzeConversation(conversation, context, settings.detailLevel);
            setAnalysisState({ status: 'success', data: result, error: null });
            addAnalysis(result);
            vibrate([20, 40, 20]);
        } catch (err: any) {
            console.error(err);
            vibrate([100, 50, 100]);
            setAnalysisState({ 
                status: 'error', 
                data: null, 
                error: err.message || "Kritische Systemunterbrechung: Die Forensik-Unit meldet einen Timeout." 
            });
        }
    }, [addAnalysis, settings.detailLevel]);

    const handleLoadAnalysis = useCallback((result: AnalysisResult) => {
        vibrate(20);
        setAnalysisState({ status: 'success', data: result, error: null });
        setCurrentView('main');
        setIsHistoryOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    if (showSplash) return <SplashScreen />;
    if (!isAuthenticated) return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;

    return (
        <div className={`min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-brand-primary/40 ${settings.enableCrtEffect ? 'crt-effect' : ''}`}>
            
            {/* Offline Banner */}
            {!isOnline && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-brand-accent/90 text-white text-[10px] font-black uppercase tracking-[0.4em] py-2 text-center backdrop-blur-md animate-fade-in font-mono">
                    System-Konnektivität unterbrochen | Offline-Modus aktiv
                </div>
            )}

            {/* Ambient Dynamic Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-brand-primary/10 rounded-full blur-[140px] animate-glow-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-secondary/10 rounded-full blur-[140px] animate-glow-pulse delay-700"></div>
            </div>

            <Header 
                onHelpClick={() => { vibrate(10); setCurrentView(v => v === 'help' ? 'main' : 'help'); }} 
                onSettingsClick={() => { vibrate(10); setCurrentView(v => v === 'settings' ? 'main' : 'settings'); }}
                activeView={currentView}
            />
            
            <main className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-6 md:py-12 transition-all duration-700">
                <div className="animate-fade-in">
                    {currentView === 'main' ? (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12 items-start">
                            <div className="xl:col-span-4 xl:sticky xl:top-32 space-y-6 md:space-y-10 z-20">
                                <ConversationInput 
                                    onAnalyze={handleAnalyze} 
                                    isLoading={analysisState.status === 'loading'} 
                                    maxLength={settings.maxProtocolLength} 
                                />
                            </div>
                            <div className="xl:col-span-8 space-y-8 md:space-y-12">
                                <AnalysisDisplay state={analysisState} />
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-5xl mx-auto py-2 md:py-6 animate-slide-up">
                            <button 
                                onClick={() => { vibrate(5); setCurrentView('main'); }} 
                                className="group mb-8 md:mb-12 flex items-center gap-4 text-xs font-black uppercase tracking-[0.4em] text-slate-500 hover:text-brand-primary transition-all p-2"
                            >
                                <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-brand-primary transition-all">←</span>
                                Dashboard
                            </button>
                            {currentView === 'help' ? <HelpPage /> : <SettingsPage settings={settings} onSettingsChange={setSettings} />}
                        </div>
                    )}
                </div>
            </main>

            <div className="fixed bottom-6 right-6 md:bottom-12 md:right-12 flex flex-col gap-4 md:gap-6 z-50 no-print">
                <button
                    onClick={handlePanic}
                    className="p-4 md:p-6 bg-brand-accent/10 backdrop-blur-md border border-brand-accent/30 text-brand-accent rounded-full md:rounded-[2.5rem] shadow-2xl hover:bg-brand-accent hover:text-white hover:scale-105 active:scale-95 transition-all group flex items-center gap-4 overflow-hidden"
                >
                    <TrashIcon className="h-6 w-6" />
                    <span className="max-w-0 group-hover:max-w-xs transition-all duration-500 uppercase text-[9px] font-black tracking-[0.3em] whitespace-nowrap">Panic</span>
                </button>
                <button
                    onClick={() => { vibrate(10); setIsHistoryOpen(true); }}
                    className="p-4 md:p-6 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-brand-primary rounded-full md:rounded-[2.5rem] shadow-2xl hover:bg-slate-800 hover:border-brand-primary hover:scale-105 active:scale-95 transition-all"
                >
                    <HistoryIcon className="h-6 w-6" />
                </button>
            </div>
            
            <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} onLoadAnalysis={handleLoadAnalysis} />
        </div>
    );
};

export default App;
