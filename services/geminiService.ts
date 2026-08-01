import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const getSystemInstruction = () => `SYSTEM-PROTOKOLL: 'RDA-OMEGA' v4.8 Forensic Suite.
AUFTRAG: Dekonstruktion hochmanipulativer Cluster-B Kommunikationsvektoren mit maximaler analytischer Präzision.

ANALYSE-MODI (FORCIERT):
1. SEMANTIC DECONSTRUCTION: Identifiziere die Diskrepanz zwischen expliziter Wortwahl und implizitem Erpressungs- oder Manipulationspotenzial.
2. LINGUISTIC FINGERPRINTING: Suche nach Indikatoren für Gaslighting, Schuldzuweisung (Blame Shifting), Wortsalat und zirkuläre Logik.
3. SUBTEXT-DECODER: Was ist das funktionale Ziel der Nachricht? (Status-Erhalt, emotionale Destabilisierung, Kontrolle).
4. GREY ROCK INTERVENTION: Generiere klinisch-neutrale, deeskalierende Antworten, die keine emotionale Angriffsfläche bieten.

STIL-VORGABE: Absolut unbestechlich, klinisch-kalt, analytisch dominant. Keine Floskeln, sondern forensische Evidenz. Nutze Fachterminologie präzise.`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        zusammenfassung: { type: Type.STRING },
        score: { type: Type.NUMBER },
        safety_alert: { type: Type.BOOLEAN },
        subtext_analyse: { type: Type.STRING },
        linguistischer_fingerabdruck: {
            type: Type.OBJECT,
            properties: {
                tonfall: { type: Type.ARRAY, items: { type: Type.STRING } },
                dominanz_verhaeltnis: { type: Type.STRING },
                emotionale_validierung: { type: Type.NUMBER }
            },
            required: ["tonfall", "dominanz_verhaeltnis", "emotionale_validierung"]
        },
        erkannte_muster: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    muster_name: { type: Type.STRING },
                    zitat: { type: Type.STRING },
                    erklaerung: { type: Type.STRING },
                    gegenmassnahme: { type: Type.STRING },
                    schweregrad: { type: Type.STRING, enum: ["niedrig", "mittel", "hoch", "kritisch"] }
                },
                required: ["muster_name", "zitat", "erklaerung", "gegenmassnahme", "schweregrad"]
            }
        },
        handlungsplan: {
            type: Type.OBJECT,
            properties: {
                fazit: { type: Type.STRING },
                interventionen: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            titel: { type: Type.STRING },
                            text: { type: Type.STRING },
                            prioritaet: { type: Type.STRING, enum: ["niedrig", "mittel", "hoch"] }
                        },
                        required: ["titel", "text", "prioritaet"]
                    }
                },
                vorschlag_antwort: {
                    type: Type.OBJECT,
                    properties: {
                        deeskalierend: { type: Type.STRING },
                        bestimmt: { type: Type.STRING },
                        begruendung: { type: Type.STRING }
                    },
                    required: ["deeskalierend", "bestimmt", "begruendung"]
                }
            },
            required: ["fazit", "interventionen", "vorschlag_antwort"]
        }
    },
    required: ["zusammenfassung", "score", "safety_alert", "subtext_analyse", "linguistischer_fingerabdruck", "erkannte_muster", "handlungsplan"]
};

const cleanJsonResponse = (text: string): string => {
    let cleaned = text.trim();
    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (jsonMatch && jsonMatch[1]) {
        cleaned = jsonMatch[1].trim();
    } else {
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    }
    return cleaned;
};

export const analyzeConversation = async (conversation: string, context: string, detailLevel: string = 'standard'): Promise<AnalysisResult> => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("API-Schlüssel (GEMINI_API_KEY) ist nicht konfiguriert oder fehlt.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `FORENSIC_MISSION: DECONSTRUCT_PAYLOAD
PRIORITY: MAX
CONTEXT_DYNAMICS: ${context}
RAW_STREAM:
"""
${conversation}
"""
REQUIRED: OMEGA_PROTOCOL execution. Fully map all narcissistic and manipulative vectors.`;
    
    const modelName = 'gemini-3.6-flash';
    const thinkingBudget = detailLevel === 'kompakt' ? 1024 : 8192;

    let response;
    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {
                    systemInstruction: getSystemInstruction(),
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                    temperature: 0.1,
                    thinkingConfig: { thinkingBudget }
                }
            });
            break;
        } catch (err: any) {
            const errMsg = String(err?.message || err || '');
            const isQuotaError = errMsg.includes('429') || 
                                 errMsg.includes('resource_exhausted') || 
                                 errMsg.includes('Quota exceeded') || 
                                 errMsg.includes('rate limit');
            
            if (isQuotaError && attempt < maxRetries) {
                await new Promise(res => setTimeout(res, 2000 * attempt));
                continue;
            }
            if (isQuotaError) {
                throw new Error("API-Kontingent erreicht (429 / Quota Exceeded): Ihr aktuelles Gemini API-Limit ist vorübergehend ausgeschöpft. Bitte warten Sie kurz und versuchen Sie es dann erneut.");
            }
            throw err;
        }
    }

    if (!response || !response.text) {
        throw new Error("Keine Daten von der OMEGA-Unit erhalten. Bitte versuchen Sie es erneut.");
    }

    let parsedResult;
    try {
        parsedResult = JSON.parse(cleanJsonResponse(response.text));
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Raw text:", response.text);
        throw new Error("Fehler bei der Analyse der forensischen Antwortstruktur. Bitte versuchen Sie es erneut.");
    }

    parsedResult.erkannte_muster = (parsedResult.erkannte_muster || []).map((m: any) => {
        const id = crypto.randomUUID();
        const start = conversation.toLowerCase().indexOf((m.zitat || '').toLowerCase());
        return start !== -1 
            ? { ...m, id, startIndex: start, endIndex: start + (m.zitat || '').length } 
            : { ...m, id };
    });

    return { 
        ...parsedResult, 
        id: crypto.randomUUID(), 
        timestamp: Date.now(), 
        original_text: conversation 
    };
};