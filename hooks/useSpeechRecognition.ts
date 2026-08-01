
import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = (onResult: (transcript: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'de-DE';

        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .slice(event.resultIndex)
                .map((result: any) => result[0].transcript)
                .join('');
            
            if (transcript) onResult(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            // No auto-restart to prevent unexpected loops
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) recognitionRef.current.abort();
        };
    }, [onResult]);

    const toggle = useCallback(() => {
        if (!recognitionRef.current) {
            alert("Spracherkennung wird von diesem Browser nicht unterstützt.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error(e);
            }
        }
    }, [isListening]);

    return { isListening, toggle };
};
