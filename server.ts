import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Server-side Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Gemini explanation endpoint
app.post('/api/explain', async (req, res) => {
  try {
    const { summary, language = 'en' } = req.body;
    if (!summary) {
      return res.status(400).json({ error: 'Missing summary payload' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key not configured on server',
        fallbackNeeded: true,
      });
    }

    const langName = language === 'hi' ? 'Hindi (हिंदी)' : 'English';
    const systemInstruction = `You are a food packaging technologist advising a small Indian food business. In under 150 words, using simple language, explain why the top recommendation fits, mention one risk and one tip. Do not invent numbers that are not in the JSON. Respond in ${langName}.`;

    const prompt = `Here is the structured packaging recommendation data in JSON:\n${JSON.stringify(summary, null, 2)}\n\nPlease provide your packaging technologist explanation, risk alert, and actionable tip in ${langName}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const explanation = response.text || '';
    return res.json({ explanation });
  } catch (error: any) {
    console.error('Gemini explanation error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate explanation',
      fallbackNeeded: true,
    });
  }
});

// Vite integration for development and static file serving for production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PackSmart server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
