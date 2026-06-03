import React, { useState, useRef, useCallback } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { TrashIcon } from './ui/Icons';
import { EXAMPLE_CONVERSATIONS } from '../constants';
import PdfPreviewModal from './PdfPreviewModal';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { transcribeAudio } from '../services/geminiService';
import { 
    Mic, 
    Square, 
    Pause, 
    Play, 
    Loader2, 
    Upload, 
    X, 
    Sparkles, 
    FileAudio, 
    ChevronRight, 
    Compass
} from 'lucide-react';

interface ConversationInputProps {
    onAnalyze: (conversation: string, context: string) => void;
    isLoading: boolean;
    maxLength: number;
}

const ConversationInput: React.FC<ConversationInputProps> = ({ onAnalyze, isLoading, maxLength }) => {
    const [conversation, setConversation] = useState('');
    const [context, setContext] = useState('');
    const [pendingPdf, setPendingPdf] = useState<File | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionStatus, setTranscriptionStatus] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        isRecording,
        isPaused,
        recordingTime,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        cancelRecording,
        error: recorderError
    } = useAudioRecorder();

    // Helper to convert File or Blob to raw Base64
    const fileToBase64 = (file: File | Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.substring(result.indexOf(',') + 1);
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        // Check for PDF Ext
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            setPendingPdf(file);
            return;
        }

        // Check for Audio files
        const isAudio = file.type.startsWith('audio/') || 
            ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.aac', '.amr', '.caf', '.mp4'].some(ext => file.name.toLowerCase().endsWith(ext));

        if (isAudio) {
            setIsTranscribing(true);
            setTranscriptionStatus('Audiodatensatz wird mit OMEGA-STT dechiffriert...');
            try {
                const base64 = await fileToBase64(file);
                
                // Mime Type classification
                let detectedMime = file.type;
                if (!detectedMime) {
                    if (file.name.endsWith('.mp3')) detectedMime = 'audio/mp3';
                    else if (file.name.endsWith('.wav')) detectedMime = 'audio/wav';
                    else if (file.name.endsWith('.m4a')) detectedMime = 'audio/m4a';
                    else if (file.name.endsWith('.ogg')) detectedMime = 'audio/ogg';
                    else if (file.name.endsWith('.webm')) detectedMime = 'audio/webm';
                    else if (file.name.endsWith('.mp4')) detectedMime = 'audio/mp4';
                    else detectedMime = 'audio/mp3'; // Fallback
                }

                const transcript = await transcribeAudio(base64, detectedMime);
                if (transcript) {
                    setConversation(prev => prev + (prev ? '\n\n' : '') + transcript);
                } else {
                    alert("OMEGA-STT: In der Audiodatei konnte keine verständliche Sprache dekonstruiert werden.");
                }
            } catch (error) {
                console.error(error);
                alert("Fehler bei der Audio-Transkription über Gemini.");
            } finally {
                setIsTranscribing(false);
            }
        } else {
            // General Plaintext files (.txt)
            const reader = new FileReader();
            reader.onload = (event) => setConversation(event.target?.result as string);
            reader.readAsText(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleStopRecording = async () => {
        setIsTranscribing(true);
        setTranscriptionStatus('Sprachaufnahme wird verarbeitet und transkribiert...');
        try {
            const recordingResult = await stopRecording();
            if (recordingResult) {
                const base64 = await fileToBase64(recordingResult.blob);
                const transcript = await transcribeAudio(base64, recordingResult.blob.type || 'audio/webm');
                if (transcript) {
                    setConversation(prev => prev + (prev ? '\n\n' : '') + transcript);
                } else {
                    alert("OMEGA-STT: In der Aufnahme wurde kein valider Sprach-Payload detektiert.");
                }
            }
        } catch (error) {
            console.error(error);
            alert("Fehler beim Transkribieren Ihrer Aufnahme.");
        } finally {
            setIsTranscribing(false);
        }
    };

    const handlePdfExtract = (text: string) => {
        setConversation(text);
        setPendingPdf(null);
    };

    // Drag & Drop Handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const charCount = conversation.length;
    const isLimitExceeded = charCount > maxLength;
    const progressPercent = Math.min((charCount / maxLength) * 100, 100);

    return (
        <div className="space-y-6 md:space-y-12 animate-slide-up">
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes bounceWave {
                    0% { transform: scaleY(0.2); }
                    100% { transform: scaleY(1); }
                }
            `}} />

            {/* Main Interactive Input HUD Card */}
            <Card 
                id="tour-input-area" 
                className={`border-slate-800 bg-slate-900/50 relative overflow-hidden p-0 rounded-3xl md:rounded-[4rem] shadow-3xl border-2 transition-all duration-300 group/input ${
                    isDragging ? 'border-brand-primary ring-4 ring-brand-primary/10 scale-[1.01] bg-[#0c1629]' : 'hover:border-slate-700'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary opacity-20 group-hover:opacity-60 transition-opacity duration-1000"></div>

                {/* Drag-over Layer Indicator */}
                {isDragging && (
                    <div className="absolute inset-0 bg-brand-primary/10 backdrop-blur-sm z-20 flex flex-col items-center justify-center pointer-events-none text-brand-primary">
                        <Upload className="w-16 h-16 mb-4 animate-bounce" />
                        <span className="font-mono text-sm uppercase tracking-widest font-black">Dateihauptstrom hier loslassen</span>
                    </div>
                )}

                {/* Loader overlay during STT operation */}
                {isTranscribing && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8">
                        <div className="w-full max-w-md bg-slate-900 border-2 border-brand-primary/40 rounded-3xl p-8 md:p-12 shadow-4xl relative overflow-hidden text-center">
                            <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary animate-pulse"></div>
                            <div className="flex flex-col items-center space-y-6">
                                <div className="relative">
                                    <Loader2 className="w-16 h-16 text-brand-primary animate-spin" />
                                    <Sparkles className="w-6 h-6 text-brand-secondary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-black text-brand-primary uppercase tracking-[0.4em] font-mono animate-pulse">STT DECODER CONNECTED</h4>
                                    <p className="text-xs md:text-sm text-slate-300 font-medium font-sans leading-relaxed">
                                        {transcriptionStatus}
                                    </p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                                        Analysiere Frequenzen via Gemini-AI...
                                    </p>
                                </div>
                                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                                    <div className="h-full bg-gradient-to-r from-brand-primary to-[#a855f7] w-2/3 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="p-6 md:p-14 space-y-6 md:space-y-12 animate-fade-in">
                    
                    {/* Header Controls */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-1 md:space-y-3">
                            <label className="text-[10px] md:text-[11px] font-black text-brand-primary uppercase tracking-[0.4em] md:tracking-[0.6em] flex items-center gap-3 md:gap-5 font-mono">
                                <span className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                                    isRecording ? 'bg-brand-accent animate-ping' : 'bg-brand-primary animate-pulse-slow shadow-[0_0_12px_rgba(14,165,233,0.5)]'
                                }`}></span>
                                Primary Entry Port
                            </label>
                            <p className="text-[8px] md:text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] ml-5 md:ml-8">
                                Core-Buffer: Stable | {isRecording ? 'Streaming Audio' : 'Ready'}
                            </p>
                        </div>
                        
                        {/* Audio actions + delete */}
                        <div className="flex gap-2 md:gap-4">
                            {!isRecording && (
                                <button 
                                    onClick={startRecording}
                                    className="p-4 md:p-6 bg-slate-950 text-slate-600 border-2 border-slate-800 hover:text-brand-accent hover:border-brand-accent/40 rounded-2xl md:rounded-[1.8rem] transition-all active:scale-95 flex items-center gap-2 font-mono text-[10px] font-bold uppercase"
                                    title="Sprachaufnahme starten"
                                    aria-label="Mikrofonaufnahme starten"
                                >
                                    <Mic className="w-5 h-5 md:w-6 md:h-6 text-brand-primary group-hover/input:animate-pulse" />
                                    <span className="hidden sm:inline">REC</span>
                                </button>
                            )}
                            <button 
                                onClick={() => { if(window.confirm('Buffer-Text wirklich komplett löschen?')) setConversation(''); }}
                                className="p-4 md:p-6 bg-slate-950 text-slate-600 border-2 border-slate-800 hover:text-brand-accent hover:border-brand-accent/40 rounded-2xl md:rounded-[1.8rem] transition-all active:scale-95"
                                aria-label="Buffer löschen"
                                title="Buffer löschen"
                            >
                                <TrashIcon className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Microphone input failure indicator */}
                    {recorderError && (
                        <div className="bg-red-950/20 border border-brand-accent/30 rounded-xl p-4 text-xs font-mono text-brand-accent space-y-2">
                            <p>[ERROR] Mikrofon-Zugriff fehlgeschlagen: {recorderError}</p>
                            <p className="text-[10px] opacity-70">
                                Bitte stellen Sie sicher, dass Sie im Browser die Mikrofon-Berechtigung für diese Webseite erteilt haben und kein anderes Programm das Mikrofon blockiert.
                            </p>
                        </div>
                    )}

                    {/* Active Audio Recording Screen Overlay */}
                    {isRecording ? (
                        <div className="flex flex-col items-center justify-center py-10 px-6 bg-slate-950/80 border-2 border-brand-accent/40 rounded-2xl md:rounded-[3rem] min-h-[290px] relative overflow-hidden animate-fade-in shadow-[0_0_50px_rgba(244,63,94,0.08)]">
                            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-brand-accent/[0.02] to-transparent pointer-events-none"></div>

                            <div className="flex items-center gap-3 text-brand-accent animate-pulse mb-6">
                                 <span className="w-2.5 h-2.5 rounded-full bg-brand-accent shadow-[0_0_15px_rgba(244,63,94,0.8)]"></span>
                                 <span className="text-[10px] md:text-xs font-black font-mono uppercase tracking-[0.3em]">
                                     {isPaused ? 'OMEGA STT REC PAUSED' : 'OMEGA STT CHANNEL SCANNING_'}
                                 </span>
                            </div>

                            {/* Soundwave bars mapping sound input */}
                            <div className="flex items-end gap-1.5 h-16 md:h-24 mb-8 px-12">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((bar) => {
                                    const randomDelay = Math.random() * 0.8;
                                    const randomDuration = 0.5 + Math.random() * 1.0;
                                    return (
                                        <div 
                                            key={bar} 
                                            className="w-1.5 md:w-2 bg-gradient-to-t from-brand-accent to-rose-400 rounded-full"
                                            style={{ 
                                                height: isPaused ? '8px' : '100%',
                                                animation: isPaused ? 'none' : `bounceWave ${randomDuration}s ease-in-out infinite alternate`,
                                                animationDelay: `${randomDelay}s`,
                                                transformOrigin: 'bottom'
                                            }}
                                        />
                                    );
                                })}
                            </div>

                            {/* Chrono Counter */}
                            <div className="text-4xl md:text-6xl font-mono font-black text-white mb-8 tracking-widest bg-slate-900/90 border-2 border-slate-800 rounded-2xl px-8 py-3 shadow-2xl">
                                {formatTime(recordingTime)}
                            </div>

                            {/* Mic Action Bar */}
                            <div className="flex gap-3 md:gap-4 flex-wrap justify-center">
                                <button 
                                    onClick={isPaused ? resumeRecording : pauseRecording}
                                    className="flex items-center gap-2 px-5 py-3 md:px-7 md:py-4 bg-slate-900 border-2 border-slate-800 hover:border-slate-500 text-slate-300 rounded-xl md:rounded-[1.5rem] font-mono text-[10px] md:text-xs uppercase tracking-wider font-bold transition-all active:scale-95"
                                >
                                    {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                                    {isPaused ? 'Fortsetzen' : 'Pause'}
                                </button>
                                <button 
                                    onClick={handleStopRecording}
                                    className="flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-emerald-950/40 border-2 border-emerald-800 text-emerald-400 rounded-xl md:rounded-[1.5rem] font-mono text-[10px] md:text-xs uppercase tracking-wider font-black transition-all hover:bg-emerald-500 hover:text-white hover:border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-95"
                                >
                                    <Square className="w-4 h-4 text-current" />
                                    Fertigstellen
                                </button>
                                <button 
                                    onClick={cancelRecording}
                                    className="flex items-center gap-2 px-5 py-3 md:px-7 md:py-4 bg-red-950/20 border-2 border-red-900/40 text-red-400 rounded-xl md:rounded-[1.5rem] font-mono text-[10px] md:text-xs uppercase tracking-wider font-bold transition-all hover:bg-brand-accent hover:text-white hover:border-brand-accent active:scale-95"
                                >
                                    <X className="w-4 h-4" />
                                    Abbrechen
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Textarea entry window */
                        <div className="relative group/field">
                            <textarea
                                rows={8}
                                value={conversation}
                                onChange={(e) => setConversation(e.target.value)}
                                placeholder="Gesprächsprotokoll, Chat, Transkripte oder Audio hier einspeisen (auch einfach Drag-and-Drop von Audio/PDF-Dateien)..."
                                className={`w-full bg-slate-950/70 border-2 border-slate-800 rounded-2xl md:rounded-[3rem] text-sm sm:text-base md:text-lg focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/30 transition-all p-4 sm:p-6 md:p-12 pb-16 sm:pb-20 md:pb-12 placeholder-slate-800 font-mono leading-relaxed resize-none ${
                                    isLimitExceeded ? 'border-brand-accent ring-brand-accent/10' : ''
                                }`}
                            />
                            <div className="absolute bottom-4 right-4 md:bottom-10 md:right-12 flex items-center gap-3 md:gap-6 bg-slate-950/95 rounded-xl border border-slate-800 px-4 py-1.5 md:px-7 md:py-3 shadow-4xl backdrop-blur-md">
                                 <div className="hidden md:block w-28 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                                    <div 
                                        className={`h-full ${
                                            isLimitExceeded ? 'bg-brand-accent shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-brand-primary shadow-[0_0_10px_rgba(14,165,233,0.5)]'
                                        } transition-all duration-1000 ease-out`} 
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                 </div>
                                 <span className={`text-[9px] md:text-[10px] font-mono font-black tracking-tighter ${
                                     isLimitExceeded ? 'text-brand-accent animate-pulse' : 'text-slate-500'
                                 }`}>
                                    {charCount.toLocaleString()} <span className="text-slate-800">/</span> {maxLength.toLocaleString()} C
                                 </span>
                            </div>
                        </div>
                    )}

                    {/* Secondary Payload Actions & Target Files */}
                    <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                placeholder="Kontext-Variablen (z.B. Erpressungsversuch, Schwiegermutter, WhatsApp-Chat)..."
                                className="w-full bg-slate-950/80 border-2 border-slate-800 rounded-xl md:rounded-[2.2rem] text-sm sm:text-base md:text-sm focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/30 transition-all px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-6 placeholder-slate-800 font-sans shadow-inner text-white"
                            />
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className="flex items-center justify-center gap-3 px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-6 bg-slate-950/50 border-2 border-slate-800 rounded-xl md:rounded-[2.2rem] text-[10px] md:text-[11px] text-slate-500 hover:text-white hover:border-brand-primary/30 transition-all uppercase tracking-[0.2em] md:tracking-[0.4em] font-black group/btn active:scale-95"
                        >
                            <Upload className="w-4 h-4 md:w-5 md:h-5 text-brand-primary" /> 
                            Import Audio / PDF / Text
                        </button>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".txt,.pdf,.mp3,.wav,.m4a,.ogg,.webm,.aac,.caf,.amr,.mp4" 
                        onChange={handleFileChange} 
                    />
                </div>

                <div className="px-6 pb-6 md:px-14 md:pb-14 md:pt-0">
                    <Button 
                        id="tour-analyze-btn"
                        onClick={() => onAnalyze(conversation, context)} 
                        isLoading={isLoading} 
                        disabled={isLimitExceeded || !conversation.trim() || isRecording}
                        className="w-full !rounded-2xl md:!rounded-[4rem] !py-6 md:!py-12 !bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-110 shadow-3xl shadow-brand-primary/20 transition-all font-display text-lg md:text-2xl font-black tracking-tight uppercase active:scale-[0.98]"
                    >
                        Analyse Starten
                    </Button>
                </div>
            </Card>

            {/* Tactical presets */}
            <div className="px-4 md:px-10 space-y-4 md:space-y-8">
                <div className="flex items-center gap-4 md:gap-6">
                    <Compass className="w-4 h-4 text-slate-700" />
                    <h4 className="text-[9px] md:text-[11px] font-black text-slate-800 uppercase tracking-[0.5em] md:tracking-[1em] font-mono whitespace-nowrap">
                        Tactical Presets
                    </h4>
                    <div className="h-[1px] w-full bg-slate-900/50"></div>
                </div>
                <div className="flex flex-wrap md:grid md:grid-cols-1 gap-3 md:gap-5">
                    {EXAMPLE_CONVERSATIONS.map((ex, i) => (
                        <button 
                            key={i} 
                            onClick={() => {setConversation(ex.conversation); setContext(ex.context);}}
                            className="flex-1 md:flex-none text-left p-4 md:p-10 bg-slate-900/20 border-2 border-slate-800/40 hover:border-brand-primary/30 rounded-xl md:rounded-[3rem] group transition-all hover:bg-slate-900/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between"
                        >
                            <p className="text-[10px] md:text-[12px] font-black text-slate-500 group-hover:text-brand-primary transition-colors uppercase tracking-[0.1em] md:tracking-[0.3em] leading-relaxed">
                                {ex.name}
                            </p>
                            <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-brand-primary transition-colors hidden sm:block" />
                        </button>
                    ))}
                </div>
            </div>

            {pendingPdf && <PdfPreviewModal file={pendingPdf} onClose={() => setPendingPdf(null)} onExtract={handlePdfExtract} />}
        </div>
    );
};

export default ConversationInput;
