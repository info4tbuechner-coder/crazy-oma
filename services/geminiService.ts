import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const getSystemInstruction = (courtMode: boolean = true) => {
    if (courtMode) {
        return `SYSTEM-PROTOKOLL: FAM-COMM-EVAL v5.2 – Forensisch-Psychologisches Kommunikationsgutachten für das Familiengericht.
AUFTRAG: Wissenschaftlich-sachliche Untersuchung elterlicher und interpersoneller Interaktionsmuster und Kommunikationsvektoren mit Fokus auf Bindungsfürsorge, Kooperationseignung, Kindeswohlfaktoren und psychologische Abgrenzungsmuster.

ANALYSESCHWERPUNKTE (BELEGBASIERT & SACHLICH):
1. INTERAKTIONSEIGENTÜMLICHKEITEN: Objektive Dekonstruktion der Diskrepanz zwischen vordergründiger Botschaft und tatsächlichem, funktionalem Kommunikationsziel (z.B. Erzeugung von Loyalitätskonflikten, Grenzüberschreitungen, partnerschaftliche/elterliche Abwertungen).
2. LINGUISTISCHE BELEGFÜHRUNG: Sachlicher Nachweis destruktiver Techniken wie Gaslighting (systematisches Infragestellen von Erziehungskompetenz oder Realitätswahrnehmung), Schuldumkehr (DARVO), Projektion, unbegründetem Druckaufbau und manipulativer Schuldzuweisung.
3. KINDESWOHL- & KOOPERATIONSRELEVANZ: Analyse, inwiefern die Kommunikation auf funktionales Co-Parenting (gemeinsame Sorge) ausgelegt ist oder dieses aktiv blockiert/sabotiert.
4. STRATEGISCHE DEESKALATION (BIFF-METHODE): Formulierung klinisch-sachlicher, kurzer, rein informativer, freundlich-bestimmter (Brief, Informative, Friendly, Firm) und nicht-reaktiver Antwortmuster, um weiteren Konflikteskalationen entgegenzuwirken.

STIL- UND FORMULIERUNGSVORGABE (MANDATORISCH):
- Absolut neutraler, nüchterner, sachlicher und gutachterlicher Tonfall (wertungsfrei, aber analytisch präzise).
- Verwendung etablierter familienpsychologischer und interaktionstheoretischer Fachbegriffe (z.B. Kooperationskompetenz, Bindungsfürsorge, Grenzverletzung, emotionale Instrumentalisierung, zirkuläre Konfliktmuster).
- Vermeidung von populär- oder küchenpsychologischen Diagnosen (z.B. "Narzissmus" oder "Psychopath" als direkte Etiketten vermeiden; stattdessen exakt beschreiben als "hochgradig egozentrierte Interaktionsdynamiken", "destruktive Beziehungs- und Machtansprüche", oder "Mangel an empathischer Perspektivenübernahme").
- Jedes gefundene Muster MUSS extrem präzise an einem wörtlichen Textzitat belegt werden. Keine haltlosen Interpretationen.`;
    }

    return `SYSTEM-PROTOKOLL: 'RDA-OMEGA' v4.8 Forensic Suite.
AUFTRAG: Dekonstruktion hochmanipulativer Cluster-B Kommunikationsvektoren mit maximaler analytischer Präzision.

ANALYSE-MODI (FORCIERT):
1. SEMANTIC DECONSTRUCTION: Identifiziere die Diskrepanz zwischen expliziter Wortwahl und implizitem Erpressungs- oder Manipulationspotenzial.
2. LINGUISTIC FINGERPRINTING: Suche nach Indikatoren für Gaslighting, Schuldzuweisung (Blame Shifting), Wortsalat und zirkuläre Logik.
3. SUBTEXT-DECODER: Was ist das funktionale Ziel der Nachricht? (Status-Erhalt, emotionale Destabilisierung, Kontrolle).
4. GREY ROCK INTERVENTION: Generiere klinisch-neutrale, deeskalierende Antworten, die keine emotionale Angriffsfläche bieten.

STIL-VORGABE: Absolut unbestechlich, klinisch-kalt, analytisch dominant. Keine Floskeln, sondern forensische Evidenz. Nutze Fachterminologie präzise.`;
};

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
    return text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
};

export const analyzeConversation = async (conversation: string, context: string, detailLevel: string = 'standard', courtMode: boolean = true): Promise<AnalysisResult> => {
    const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '',
        httpOptions: {
            headers: {
                'User-Agent': 'aistudio-build'
            }
        }
    });
    
    const prompt = courtMode 
        ? `GUTACHTERLICHE KOMMUNIKATIONSEVALUATION
ANALYSESTANDARD: FAMILIENGERICHTLICHES BEWERTUNGSVERFAHREN
KONTEXT DER ELTERNLICHEN INTERAKTION: ${context}
TRANSKRIPT / PROXIMALER KOMMUNIKATIONS-STREAM:
"""
${conversation}
"""
AUFTRAG: Führe ein wissenschaftlich-psychologisches Kommunikationsgutachten auf Basis des übermittelten Gesprächsmaterials durch. Halte dich an den neutralen, sachlichen Stil ohne polemische Begriffe.`
        : `FORENSIC_MISSION: DECONSTRUCT_PAYLOAD
PRIORITY: MAX
CONTEXT_DYNAMICS: ${context}
RAW_STREAM:
"""
${conversation}
"""
REQUIRED: OMEGA_PROTOCOL execution. Fully map all narcissistic and manipulative vectors.`;
    
    const modelName = detailLevel === 'kompakt' ? 'gemini-3.5-flash' : 'gemini-3.1-pro-preview';
    const thinkingBudget = detailLevel === 'tiefgreifend' ? 32768 : 24576;

    const baseConfig: any = {
        systemInstruction: getSystemInstruction(courtMode),
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
    };

    if (modelName === 'gemini-3.1-pro-preview') {
        baseConfig.thinkingConfig = { thinkingBudget };
    }

    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: baseConfig
    });

    if (!response.text) throw new Error("Keine Daten von der OMEGA-Unit erhalten.");

    const result = JSON.parse(cleanJsonResponse(response.text));

    result.erkannte_muster = (result.erkannte_muster || []).map((m: any) => {
        const id = crypto.randomUUID();
        const start = conversation.toLowerCase().indexOf(m.zitat.toLowerCase());
        return start !== -1 
            ? { ...m, id, startIndex: start, endIndex: start + m.zitat.length } 
            : { ...m, id };
    });

    return { 
        ...result, 
        id: crypto.randomUUID(), 
        timestamp: Date.now(), 
        original_text: conversation 
    };
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioBase64, mimeType }),
    });

    if (!response.ok) {
        throw new Error('Transcription failed');
    }

    const data = await response.json();
    return data.text;
};