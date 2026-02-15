
import React from 'react';

const SplashScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 animate-fade-in">
            <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-xl bg-sky-500 opacity-20 blur-xl"></div>
                    <div className="relative flex items-center justify-center w-full h-full border border-sky-500/30 rounded-xl bg-slate-900 shadow-2xl">
                        <div className="flex gap-1">
                            <div className="w-1.5 h-6 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-1.5 h-10 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-8 bg-clinical-teal rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                </div>
                <h1 className="text-3xl font-bold font-display tracking-tight text-white">
                    RDA <span className="text-sky-500">PRO</span>
                </h1>
                <p className="text-slate-500 text-sm mt-2 uppercase tracking-[0.2em]">Relational Dynamics Analyzer</p>
            </div>
        </div>
    );
};

export default SplashScreen;
