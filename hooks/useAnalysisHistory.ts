
import { useCallback } from 'react';
import { usePersistentState } from './usePersistentState';
import type { AnalysisResult } from '../types';

const MAX_HISTORY_ITEMS = 50;

export const useAnalysisHistory = () => {
    const [history, setHistory] = usePersistentState<AnalysisResult[]>('rda_pro_history', []);

    const addAnalysis = useCallback((newAnalysis: AnalysisResult) => {
        setHistory(prevHistory => {
            const updatedHistory = [newAnalysis, ...prevHistory];
            if (updatedHistory.length > MAX_HISTORY_ITEMS) {
                return updatedHistory.slice(0, MAX_HISTORY_ITEMS);
            }
            return updatedHistory;
        });
    }, [setHistory]);

    const removeAnalysis = useCallback((id: string) => {
        setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
    }, [setHistory]);

    const clearHistory = useCallback(() => {
        setHistory([]);
    }, [setHistory]);

    return { history, addAnalysis, removeAnalysis, clearHistory };
};
