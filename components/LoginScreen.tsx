
import React, { useState } from 'react';
import Button from './ui/Button';

interface LoginScreenProps {
    onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Professioneller System-Schlüssel
        if (password === 'RDA-SYSTEM-PRO') {
            onLoginSuccess();
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center animate-fade-in p-4 overflow-hidden relative">
            {/* Ambient Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow delay-1000"></div>

            <div className={`max-w-md w-full p-10 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] z-10 ${error ? 'animate-shake' : ''}`}>
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-primary/20 shadow-inner">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold font-display text-white tracking-tight">
                        Portal-Autorisierung
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">Geben Sie den System-Key ein, um die Clinical Suite zu laden.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">
                            System-Key
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoFocus
                                placeholder="RDA-SYSTEM-PRO"
                                className={`block w-full px-5 py-4 bg-slate-950/50 border rounded-2xl text-white focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all placeholder-slate-800 font-mono text-sm tracking-widest ${error ? 'border-red-500/50' : 'border-slate-800'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-500 transition-colors p-1"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.076m10.725 8.7a3.374 3.374 0 01-4.256-4.238m8.035 8.859L21 21m-4.944-4.944l-2.431-2.431m1.622-1.622l2.431 2.431M15.73 15.73A5.029 5.029 0 0021 12c0-5.338-4.125-9.667-9-9.667-1.3 0-2.542.313-3.635.867m12.33 12.33L3 3" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                        {error && <p className="text-[10px] text-red-500 mt-2 ml-1 uppercase tracking-widest font-bold animate-pulse">Zugriff verweigert - Key inkorrekt</p>}
                    </div>

                    <Button type="submit" className="w-full !bg-brand-primary hover:!bg-brand-primary/90 !rounded-2xl !py-4 shadow-xl shadow-brand-primary/10">
                        Initialisieren
                    </Button>
                </form>
                
                <div className="mt-12 pt-6 border-t border-slate-800/50 text-center">
                    <p className="text-[10px] text-slate-700 uppercase tracking-[0.3em] font-bold">
                        RDA Professional v3.1.2 | Clinical OS
                    </p>
                </div>
            </div>
            
            <p className="mt-8 text-[11px] text-slate-800 uppercase tracking-widest font-bold hover:text-slate-700 transition-colors cursor-default">
                &copy; 2025 Relational Dynamics Forensic Lab
            </p>
        </div>
    );
};

export default LoginScreen;
