
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Modal from './ui/Modal';
import Button from './ui/Button';
import PrintableView from './PrintableView';
import type { AnalysisResult } from '../types';

interface PrintPreviewModalProps {
    result: AnalysisResult;
    onClose: () => void;
}

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ result, onClose }) => {
    const [iframeRoot, setIframeRoot] = useState<HTMLElement | null>(null);
    const printRoot = document.getElementById('print-root');

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Druckvorschau / Export" size="full">
            <div className="space-y-4">
                <div className="bg-white h-[70vh] overflow-y-auto p-4 rounded-md shadow-inner">
                    <iframe 
                        srcDoc={`
                            <html>
                                <head>
                                    <title>Print Preview</title>
                                    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">
                                    <style>
                                        @media print { body { -webkit-print-color-adjust: exact; } }
                                        body { margin: 0; padding: 0; background: white; }
                                        #iframe-print-root { width: 100%; height: 100%; }
                                    </style>
                                </head>
                                <body>
                                    <div id="iframe-print-root"></div>
                                </body>
                            </html>
                        `}
                        className="w-full h-full border-0"
                        title="Druckvorschau"
                        onLoad={(e) => {
                            const iframe = e.target as HTMLIFrameElement;
                            const iframeDoc = iframe.contentDocument;
                            if (iframeDoc) {
                                const rootEl = iframeDoc.getElementById('iframe-print-root');
                                if (rootEl) {
                                    setIframeRoot(rootEl);
                                }
                            }
                        }}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>Schließen</Button>
                    <Button onClick={handlePrint}>Drucken</Button>
                </div>
            </div>

            {/* Render to the hidden print root for the actual browser print command */}
            {printRoot && createPortal(<PrintableView result={result} />, printRoot)}
            
            {/* Render to the iframe for the visual preview */}
            {iframeRoot && createPortal(<PrintableView result={result} />, iframeRoot)}

            <style>
                {`
                    @media print {
                        body > #root {
                            display: none !important;
                        }
                        #print-root {
                            display: block !important;
                        }
                    }
                `}
            </style>
        </Modal>
    );
};

export default PrintPreviewModal;
