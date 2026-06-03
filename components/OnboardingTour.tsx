import React, { useState, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import Button from './ui/Button';

const STEPS = [
    {
        target: 'tour-input-area',
        title: 'Input Terminal',
        content: 'Hier speisen Sie Kommunikationsprotokolle, E-Mails oder Gesprächsnotizen ein. Nutzen Sie die Mikrofon-Funktion für Diktate oder den PDF-Import für Dokumente.',
        position: 'bottom'
    },
    {
        target: 'tour-analyze-btn',
        title: 'Forensik Starten',
        content: 'Initiiert den RDA OMEGA Algorithmus. Das System dekonstruiert den Subtext und sucht nach manipulativen Vektoren (Gaslighting, DARVO, etc.).',
        position: 'top'
    },
    {
        target: 'tour-history-btn',
        title: 'Fallarchiv',
        content: 'Zugriff auf vergangene Analysen. Alle Daten werden lokal in Ihrem Browser verschlüsselt gespeichert.',
        position: 'left'
    },
    {
        target: 'tour-panic-btn',
        title: 'Notfall Protokoll',
        content: 'Löscht sofort alle lokalen Daten und beendet die Sitzung. Nutzen Sie dies bei Kompromittierung der Sicherheit.',
        position: 'left'
    }
];

const OnboardingTour: React.FC = () => {
    const [hasSeenTour, setHasSeenTour] = usePersistentState<boolean>('rda_pro_tour_seen_v1', false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        // Start tour if not seen yet, slight delay for UI render
        if (!hasSeenTour) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [hasSeenTour]);

    useEffect(() => {
        if (!isVisible) return;

        const updatePosition = () => {
            const step = STEPS[currentStepIndex];
            const element = document.getElementById(step.target);
            
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTargetRect(element.getBoundingClientRect());
            } else {
                // If element not found (e.g. mobile view differences), skip or finish
                handleNext();
            }
        };

        // Initial update
        setTimeout(updatePosition, 300); // Wait for scroll
        
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [currentStepIndex, isVisible]);

    const handleNext = () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            setIsVisible(false);
            setHasSeenTour(true);
        }
    };

    const handleSkip = () => {
        setIsVisible(false);
        setHasSeenTour(true);
    };

    if (!isVisible || !targetRect) return null;

    const step = STEPS[currentStepIndex];
    const isLastStep = currentStepIndex === STEPS.length - 1;

    // Calculate Popover Position
    let popoverStyle: React.CSSProperties = {};
    const margin = 20;

    // Simple positioning logic (can be expanded)
    if (window.innerWidth < 768) {
        // Mobile: Always bottom fixed
        popoverStyle = {
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            right: '20px',
            zIndex: 9999
        };
    } else {
        // Desktop
        switch (step.position) {
            case 'bottom':
                popoverStyle = { top: targetRect.bottom + margin, left: targetRect.left };
                break;
            case 'top':
                popoverStyle = { bottom: window.innerHeight - targetRect.top + margin, left: targetRect.left };
                break;
            case 'left':
                popoverStyle = { top: targetRect.top, right: window.innerWidth - targetRect.left + margin };
                break;
            case 'right':
                popoverStyle = { top: targetRect.top, left: targetRect.right + margin };
                break;
            default:
                popoverStyle = { top: targetRect.bottom + margin, left: targetRect.left };
        }
        popoverStyle.position = 'fixed';
        popoverStyle.zIndex = 9999;
        popoverStyle.maxWidth = '350px';
    }

    return (
        <>
            {/* Backdrop overlay with cutout effect via huge borders or just semi-transparent overlay */}
            <div className="fixed inset-0 z-[9990] bg-slate-950/80 backdrop-blur-sm transition-all duration-500"></div>

            {/* Highlight Box around Target */}
            <div 
                className="fixed z-[9991] pointer-events-none transition-all duration-500 ease-in-out border-2 border-brand-primary shadow-[0_0_50px_rgba(14,165,233,0.3)] rounded-2xl"
                style={{
                    top: targetRect.top - 5,
                    left: targetRect.left - 5,
                    width: targetRect.width + 10,
                    height: targetRect.height + 10,
                }}
            >
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-brand-primary"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-brand-primary"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-brand-primary"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-brand-primary"></div>
            </div>

            {/* The Tooltip Card */}
            <div style={popoverStyle} className="animate-slide-up">
                <div className="bg-[#0b1221] border border-brand-primary/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                    {/* Scanline decoration */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary animate-scan opacity-50"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded bg-brand-primary text-slate-950 text-xs font-black font-mono">
                                {currentStepIndex + 1}
                            </span>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest font-display">{step.title}</h4>
                        </div>
                        <button onClick={handleSkip} className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest font-mono">
                            Abort
                        </button>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed font-mono mb-6">
                        {step.content}
                    </p>

                    <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                        <div className="flex gap-1">
                            {STEPS.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`w-1.5 h-1.5 rounded-full ${idx === currentStepIndex ? 'bg-brand-primary' : 'bg-slate-800'}`}
                                ></div>
                            ))}
                        </div>
                        <Button size="sm" onClick={handleNext} className="!py-2 !px-4 !text-[10px] uppercase tracking-widest">
                            {isLastStep ? 'Initialize' : 'Next Node'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OnboardingTour;