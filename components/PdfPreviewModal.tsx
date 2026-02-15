import React, { useState, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Modal from './ui/Modal';
import Button from './ui/Button';

// Robust worker initialization
const pdfVersion = pdfjsLib.version;
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfVersion}/build/pdf.worker.mjs`;

interface PdfPreviewModalProps {
    file: File;
    onClose: () => void;
    onExtract: (text: string) => void;
}

const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ file, onClose, onExtract }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [isExtracting, setIsExtracting] = useState(false);
    
    const renderPdf = useCallback(async (canvas: HTMLCanvasElement) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            setNumPages(pdf.numPages);
            
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            const context = canvas.getContext('2d');
            
            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                await (page.render(renderContext as any) as any).promise;
            }
        } catch (error) {
            console.error("Failed to render PDF preview", error);
        }
    }, [file]);

    const handleExtractText = async () => {
        setIsExtracting(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
                fullText += pageText + '\n';
            }
            onExtract(fullText.trim());
        } catch (error) {
            console.error("Failed to extract text from PDF", error);
            alert("Das PDF konnte nicht verarbeitet werden. Bitte stellen Sie sicher, dass es sich um eine lesbare Textdatei handelt.");
            setIsExtracting(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Forensischer PDF Import" size="full">
            <div className="space-y-6">
                <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                         <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p className="text-sm text-slate-400">
                        Vorschau der ersten Seite. Die Analyse umfasst alle <span className="text-white font-bold">{numPages}</span> Seiten des Protokolls.
                    </p>
                </div>
                
                <div className="bg-slate-950/80 p-6 rounded-[2.5rem] border border-slate-800 overflow-auto max-h-[50vh] flex justify-center shadow-inner crt-effect">
                    <canvas 
                        ref={(node) => { if (node) renderPdf(node); }}
                        className="rounded-xl shadow-2xl"
                    />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" onClick={onClose} className="!rounded-xl !px-8">Abbrechen</Button>
                    <Button onClick={handleExtractText} isLoading={isExtracting} className="!rounded-xl !px-8 !bg-brand-primary">
                        Datenstrom initialisieren
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PdfPreviewModal;