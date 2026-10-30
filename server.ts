import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const getAiClient = (customKey?: string) => {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * Execute Gemini generation with seamless fallback to gemini-3.1-flash-lite if
 * primary model (gemini-3.8-flash) is experiencing high demand, 503, or rate limits.
 */
async function generateWithFallback(ai: GoogleGenAI, params: any) {
  const primaryModel = params.model || 'gemini-3.8-flash';
  const fallbackModel = 'gemini-3.1-flash-lite';

  try {
    const callPromise = ai.models.generateContent({ ...params, model: primaryModel });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Primary model request timeout')), 9000)
    );
    return (await Promise.race([callPromise, timeoutPromise])) as any;
  } catch (err: any) {
    console.warn(
      `Primary model (${primaryModel}) unavailable or timed out: ${err?.message}. Falling back to ${fallbackModel}...`
    );
    return await ai.models.generateContent({ ...params, model: fallbackModel });
  }
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Server-side Gemini content generation endpoint
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, contents, config, model, customApiKey } = req.body;
    const key = customApiKey || (req.headers['x-custom-api-key'] as string);
    const ai = getAiClient(key);

    const response = await generateWithFallback(ai, {
      model: model || 'gemini-3.8-flash',
      contents: contents || prompt,
      config: config || undefined,
    });

    res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Server-side Gemini generation error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate content' });
  }
});

// Professional tutor endpoint (bypasses browser proxy restriction)
app.post('/api/tutor', async (req, res) => {
  try {
    const { userInput, jobDescription, customApiKey } = req.body;
    const key = customApiKey || (req.headers['x-custom-api-key'] as string);
    const ai = getAiClient(key);

    const prompt = `You are an AI English Tutor specializing in professional vocabulary and morphology.
User input: "${userInput}"
User job description/field: "${jobDescription || 'Professional'}"

Generate a list of 5-8 relevant, practical vocabulary words, collocations, or morphological derivatives related to their input and profession.
Return ONLY a valid JSON array of objects. Each object must have exactly two string properties: "word" and "translation" (in Vietnamese).
Do NOT include any markdown code blocks, backticks, or other text outside the JSON array.

Example output:
[
  {"word": "collaborate", "translation": "hợp tác, phối hợp"},
  {"word": "deliverable", "translation": "sản phẩm bàn giao"}
]`;

    const response = await generateWithFallback(ai, {
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    let cleanStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    let cards = [];
    try {
      cards = JSON.parse(cleanStr);
      if (!Array.isArray(cards)) cards = [];
    } catch (e) {
      console.warn('Failed to parse tutor JSON, attempting recovery:', text);
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          cards = JSON.parse(match[0]);
        } catch {}
      }
    }

    res.json({ cards, text });
  } catch (error: any) {
    console.error('Tutor API error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate tutor flashcards' });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
