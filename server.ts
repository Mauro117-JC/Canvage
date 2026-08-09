import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI lazily inside API handlers
  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    return new GoogleGenAI({ apiKey });
  };

  // API Route: AI Article Summarizer & Generator
  app.post('/api/ai/article-assist', async (req, res) => {
    try {
      const { topicOrUrl, action } = req.body;

      if (!topicOrUrl) {
        return res.status(400).json({ error: 'Topic or URL prompt is required.' });
      }

      const ai = getAI();

      if (action === 'generate') {
        const prompt = `Write a short, compelling editorial article snippet and title about: "${topicOrUrl}".
Provide a response in JSON format with the following keys:
"title": (Catchy headline),
"category": (One of: "Design & Editorial", "Architecture", "Culture", "Photography", "Quotes & Ideas"),
"summary": (1-2 sentence hook),
"content": (2 short paragraphs of body text),
"author": (Author name),
"tags": (Array of 3-4 string tags),
"readTimeMinutes": (Number, e.g. 3)
Do not surround with codeblock markdown. Just pure JSON.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const cleanJsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJsonStr);

        return res.json({ success: true, data });
      } else if (action === 'summarize') {
        const prompt = `Analyze this text/content and generate an editorial summary and metadata:
"${topicOrUrl}"

Respond in pure JSON with keys:
"title": (Clean title),
"category": (e.g. Design & Editorial, Culture, Architecture, Tech, Photography),
"summary": (Crisp 2-sentence summary),
"tags": (Array of 3-4 string tags)
Do not surround with codeblock markdown.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const cleanJsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJsonStr);

        return res.json({ success: true, data });
      }

      res.status(400).json({ error: 'Invalid action.' });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error?.message || 'Failed to generate AI assistance.' });
    }
  });

  // Health route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite Middleware setup for dev vs production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Collage Canvas server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
