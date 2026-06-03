
import React from 'react';
import type { AnalysisResult } from '../types';

interface PrintableViewProps {
    result: AnalysisResult;
}

const PrintableView: React.FC<PrintableViewProps> = ({ result }) => {
    const { zusammenfassung, score, erkannte_muster, handlungsplan, linguistischer_fingerabdruck, safety_alert } = result;

    const isCourtMode = 
        zusammenfassung?.toLowerCase().includes('gutachten') || 
        zusammenfassung?.toLowerCase().includes('eval') || 
        zusammenfassung?.toLowerCase().includes('fam-') || 
        zusammenfassung?.toLowerCase().includes('elter') || 
        zusammenfassung?.toLowerCase().includes('sorge') || 
        zusammenfassung?.toLowerCase().includes('kind') || 
        zusammenfassung?.toLowerCase().includes('gericht') || 
        result.original_text?.toLowerCase().includes('sorge') ||
        result.original_text?.toLowerCase().includes('kind') ||
        result.original_text?.toLowerCase().includes('umgang');

    const docTitle = isCourtMode ? "Gutachterlicher Interaktionsbericht" : "Relational Dynamics Client Report";
    const docSub = isCourtMode ? "Fachliche Auswertung gemäß familienpsychologischen Kriterien (FAM-COMM-EVAL)" : "Relational Dynamics Analyzer Professional Suite (RDA-PRO)";
    const summaryTitle = isCourtMode ? "Zusammenfassende Beurteilung des Interaktionsverhaltens" : "Executive Summary & Main Score";
    const scoreLabel = isCourtMode ? "KONFLIKTGRAD" : "TOXICITY INDEX";
    const metricsTitle = isCourtMode ? "Interaktionelle & Linguistische Metriken" : "Klinische Metriken & Linguistik";
    const evidenceTitle = isCourtMode ? "Fachlich dokumentierte Verhaltensmuster & Textbelege" : "Beweismittelführung (Mustererkennung)";
    const planTitle = isCourtMode ? "Empfohlene Deeskalations- & Abgrenzungsmaßnahmen" : "Strategisches Interventions-Protokoll";
    const footerLabel = isCourtMode ? "Gerichtlich orientiertes Gutachter-Format | Familiengerichtliche Relevanz-Prüfung" : "Generiert mit RDA Professional Suite v3.1 | Forensische Kommunikationsevaluation";
    
    return (
        <div style={{ 
            fontFamily: "'Inter', sans-serif", 
            color: '#1e293b', 
            padding: '40px', 
            maxWidth: '800px', 
            margin: '0 auto', 
            backgroundColor: '#fff',
            lineHeight: '1.5'
        }}>
            {/* Header */}
            <header style={{ 
                borderBottom: '3px solid #0ea5e9', 
                paddingBottom: '20px', 
                marginBottom: '30px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-end' 
            }}>
                <div>
                    <h1 style={{ 
                        fontFamily: isCourtMode ? "'Georgia', serif" : "'Lexend', sans-serif", 
                        fontSize: isCourtMode ? '22px' : '24px', 
                        fontWeight: '700', 
                        margin: 0, 
                        color: '#0f172a',
                        textTransform: isCourtMode ? 'none' : 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {docTitle}
                    </h1>
                    <p style={{ margin: '6px 0 0', color: '#475569', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {docSub}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                        Bericht-ID: <span style={{ fontFamily: 'monospace' }}>{result.id.substring(0, 8).toUpperCase()}</span>
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                        Datum: {new Date(result.timestamp).toLocaleString('de-DE')}
                    </p>
                </div>
            </header>

            {/* Safety Alert (if applicable) */}
            {safety_alert && (
                <div style={{ 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fee2e2', 
                    padding: '15px', 
                    borderRadius: '8px', 
                    marginBottom: '30px',
                    display: 'flex',
                    gap: '15px'
                }}>
                    <div style={{ fontSize: '24px' }}>⚠️</div>
                    <div>
                        <h4 style={{ margin: '0 0 4px', color: '#991b1b', fontSize: '13px', fontWeight: '700' }}>HINWEIS ZUR INTERAKTIONSMUSTERSCHWERE</h4>
                        <p style={{ margin: 0, fontSize: '11px', color: '#b91c1c' }}>
                            Diese Auswertung identifiziert erhebliche relationale Spannungsfaktoren oder dysfunktionale Kommunikationsmuster. Professionelle Unterstützung wird empfohlen.
                        </p>
                    </div>
                </div>
            )}

            {/* Executive Summary & Main Score */}
            <section style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', gap: '30px' }}>
                    <div style={{ flex: '1' }}>
                        <h2 style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
                            {summaryTitle}
                        </h2>
                        <p style={{ fontSize: '13px', color: '#334155', fontWeight: '500', fontStyle: isCourtMode ? 'normal' : 'italic', margin: 0, borderLeft: '4px solid #0ea5e9', paddingLeft: '15px', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                            {zusammenfassung}
                        </p>
                    </div>
                    <div style={{ 
                        width: '120px', 
                        height: '120px', 
                        border: '8px solid #f1f5f9', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <div style={{ 
                            fontSize: '28px', 
                            fontWeight: '800', 
                            color: score > 70 ? '#ef4444' : (score > 40 ? '#f59e0b' : '#14b8a6') 
                        }}>
                            {score}
                        </div>
                        <div style={{ fontSize: '8px', fontWeight: '800', color: '#94a3b8' }}>{scoreLabel}</div>
                    </div>
                </div>
            </section>

            {/* Clinical Metrics */}
            <section style={{ marginBottom: '40px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                <h2 style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>
                    {metricsTitle}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Emotionale Validität & Sachlichkeit</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{linguistischer_fingerabdruck.emotionale_validierung}%</span>
                            <div style={{ height: '6px', flex: 1, backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
                                <div style={{ height: '100%', width: `${linguistischer_fingerabdruck.emotionale_validierung}%`, backgroundColor: '#0ea5e9', borderRadius: '3px' }}></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Dominanz-Verhältnis</p>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#334155', margin: 0 }}>{linguistischer_fingerabdruck.dominanz_verhaeltnis}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Tonfall-Signatur</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {linguistischer_fingerabdruck.tonfall.map(t => (
                                <span key={t} style={{ 
                                    padding: '3px 8px', 
                                    backgroundColor: '#fff', 
                                    border: '1px solid #e2e8f0', 
                                    borderRadius: '4px', 
                                    fontSize: '10px', 
                                    fontWeight: '700', 
                                    color: '#475569' 
                                }}>{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Pattern Evidence */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>
                    {evidenceTitle}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {erkannte_muster.map((pattern, index) => (
                        <div key={index} style={{ border: '1px solid #f1f5f9', borderRadius: '8px', padding: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#0369a1', margin: 0 }}>
                                    {pattern.muster_name}
                                </h3>
                                <span style={{ fontSize: '9px', fontWeight: '800', color: pattern.schweregrad === 'kritisch' || pattern.schweregrad === 'hoch' ? '#ef4444' : '#64748b', textTransform: 'uppercase', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                    Relevanz: {pattern.schweregrad}
                                </span>
                            </div>
                            <blockquote style={{ 
                                margin: '0 0 10px', 
                                paddingLeft: '12px', 
                                borderLeft: '2px solid #0ea5e9', 
                                fontStyle: 'italic', 
                                fontSize: '12px', 
                                color: '#475569',
                                backgroundColor: '#f8fafc',
                                padding: '8px 12px',
                                borderRadius: '0 6px 6px 0'
                            }}>
                                "{pattern.zitat}"
                            </blockquote>
                            <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                                <span style={{ fontWeight: '700', color: '#64748b', textTransform: 'uppercase', fontSize: '9px', marginRight: '5px' }}>Fachliche Bewertung:</span>
                                {pattern.erklaerung}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Strategic Plan */}
            <section style={{ backgroundColor: '#f0f9ff', padding: '25px', borderRadius: '15px', border: '1px solid #e0f2fe' }}>
                <h2 style={{ fontSize: '12px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>
                    {planTitle}
                </h2>
                <p style={{ fontSize: '13px', color: '#075985', fontWeight: '500', marginBottom: '20px', lineHeight: '1.6' }}>
                    {handlungsplan.fazit}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {handlungsplan.interventionen.map((tip, index) => (
                         <div key={index} style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '15px', border: '1px solid #bae6fd' }}>
                             <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>{tip.titel}</h4>
                             <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.4' }}>{tip.text}</p>
                         </div>
                    ))}
                </div>
            </section>

            {/* Footer / Legal */}
            <footer style={{ marginTop: '50px', borderTop: '1px solid #f1f5f9', paddingTop: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '600' }}>
                    {footerLabel}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '9px', color: '#94a3b8', fontStyle: 'italic', lineHeight: '1.4' }}>
                    Hinweis: Dieser Bericht dient als Orientierungs- und Analysehilfe zur Dokumentation und Dekonstruktion dysfunktionaler Interaktionsverhaltensweisen. Er stellt keine medizinische oder rechtsverbindliche Diagnose dar.
                </p>
            </footer>
        </div>
    );
};

export default PrintableView;
