import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audioBase64, mimeType } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY || ''
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
            {
                inlineData: {
                    data: audioBase64,
                    mimeType: mimeType
                }
            },
            {
                text: "Transkribiere diese Sprachnachricht / Audiodatei präzise und vollständig auf Deutsch. Gebe AUSSCHLIESSLICH das transkribierte Ergebnis zurück. Verwende korrekte Rechtschreibung, Zeichensetzung und Absätze. Keine Einleitungen, Kommentare, Metadaten, Sprecherlabels oder Anmerkungen. Wenn kein verständlicher Ton vorhanden ist oder ein Fehler vorliegt, antworte leer."
            }
        ]
      });

      res.json({ text: response.text?.trim() || "" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Transcription failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
