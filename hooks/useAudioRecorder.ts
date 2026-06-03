import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseAudioRecorderResult {
    isRecording: boolean;
    isPaused: boolean;
    recordingTime: number; // in seconds
    startRecording: () => Promise<void>;
    pauseRecording: () => void;
    resumeRecording: () => void;
    stopRecording: () => Promise<{ blob: Blob; url: string } | null>;
    cancelRecording: () => void;
    error: string | null;
}

export const useAudioRecorder = (): UseAudioRecorderResult => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<any>(null);
    const resolvePromiseRef = useRef<((value: { blob: Blob; url: string } | null) => void) | null>(null);

    // Clear timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startRecording = useCallback(async () => {
        setError(null);
        chunksRef.current = [];
        setRecordingTime(0);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            streamRef.current = stream;

            // Determine supported mimeTypes for voice messages
            let options = {};
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                options = { mimeType: 'audio/webm;codecs=opus' };
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/webm' };
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
                options = { mimeType: 'audio/ogg' };
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                options = { mimeType: 'audio/mp4' };
            }

            const recorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const mimeType = recorder.mimeType || 'audio/webm';
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                
                if (resolvePromiseRef.current) {
                    if (chunksRef.current.length > 0 && blob.size > 100) {
                        resolvePromiseRef.current({ blob, url });
                    } else {
                        resolvePromiseRef.current(null);
                    }
                    resolvePromiseRef.current = null;
                }

                // Stop stream tracks
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
                
                setIsRecording(false);
                setIsPaused(false);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            };

            recorder.start(250); // Get chunks every 250ms
            setIsRecording(true);
            setIsPaused(false);

            // Timer management
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err: any) {
            console.error('Mikrofon-Zugriff fehlgeschlagen:', err);
            setError(err.message || 'Mikrofon-Zugrif fehlgeschlagen.');
            setIsRecording(false);
        }
    }, []);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, []);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    }, []);

    const stopRecording = useCallback((): Promise<{ blob: Blob; url: string } | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
                resolve(null);
                return;
            }

            resolvePromiseRef.current = resolve;
            mediaRecorderRef.current.stop();
        });
    }, []);

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            // override resolve to resolve immediately to null
            resolvePromiseRef.current = () => {};
            mediaRecorderRef.current.stop();
        }
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);
        chunksRef.current = [];
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    return {
        isRecording,
        isPaused,
        recordingTime,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        cancelRecording,
        error
    };
};
