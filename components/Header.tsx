import React from 'react';
import { InfoIcon, BookOpenIcon } from './ui/Icons';

interface HeaderProps {
    onHelpClick: () => void;
    onSettingsClick: () => void;
    activeView: 'main' | 'help' | 'settings';
}

const Header: React.FC<HeaderProps> = ({ onHelpClick, onSettingsClick, activeView }) => {
    return (
        <header className="bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-40 border-b border-slate-900 shadow-2xl pt-[env(safe-area-inset-top)]">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
                <div className="flex items-center justify-between h-16 md:h-24">
                    <div className="flex items-center gap-3 md:gap-6 group cursor-pointer" onClick={() => window.location.reload()}>
                         <div className="flex items-center justify-center w-10 h-10 md:w-16 md:h-16 text-brand-primary rounded-xl md:rounded-2xl bg-slate-900 border border-slate-800 shadow-inner transition-all group-hover:border-brand-primary/50 group-hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] relative overflow-hidden shrink-0">
                            <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-10 md:w-10 transform transition-transform group-hover:scale-110 relative z-10" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex flex-col -space-y-1">
                            <div className="flex items-center gap-2 md:gap-3">
                                <h1 className="text-xl md:text-3xl font-black font-display tracking-tight text-white uppercase">
                                    RDA <span className="text-brand-primary">PRO</span>
                                </h1>
                                <span className="hidden xs:inline-block text-[8px] md:text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-lg border border-brand-primary/20 font-mono font-bold">OMEGA_4.5</span>
                            </div>
                            <span className="text-[7px] md:text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] font-mono truncate max-w-[150px] md:max-w-none">Relational Dynamics Forensic Suite</span>
                        </div>
                    </div>
                    
                    <nav className="flex items-center gap-2 md:gap-4">
                        <HeaderButton 
                            onClick={onHelpClick} 
                            active={activeView === 'help'} 
                            icon={<BookOpenIcon className="w-5 h-5 md:w-4 md:h-4" />} 
                            label="Glossar" 
                        />
                        <HeaderButton 
                            onClick={onSettingsClick} 
                            active={activeView === 'settings'} 
                            icon={<SettingsIcon className="w-5 h-5 md:w-4 md:h-4" />} 
                            label="Konfiguration" 
                        />
                    </nav>
                </div>
            </div>
        </header>
    );
};

const SettingsIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const HeaderButton = ({ onClick, active, icon, label }: any) => (
    <button 
        onClick={onClick} 
        className={`flex items-center justify-center w-10 h-10 md:w-auto md:px-6 md:py-3.5 md:gap-3 transition-all rounded-xl md:rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] ${active ? 'text-brand-primary bg-brand-primary/10 border-brand-primary/30 shadow-[0_0_20px_rgba(14,165,233,0.15)]' : 'text-slate-500 border-slate-900/50 hover:text-brand-primary hover:border-brand-primary/20 hover:bg-slate-900/50'}`}
        aria-label={label}
    >
        {icon}
        <span className="hidden lg:inline">{label}</span>
    </button>
);

export default Header;