import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app  = express();
const PORT = parseInt(process.env.PORT ?? '3000', 10);
const TALLY_BASE = (process.env.TALLY_BASE_URL ?? 'https://api.tallyy.org').replace(/\/$/, '');
const TALLY_KEY  = process.env.TALLY_API_KEY ?? '';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ─── Tally proxy ─────────────────────────────────────────────────────────────

async function tallyPost(endpoint: string, body: unknown): Promise<{ status: number; data: unknown }> {
  const res = await fetch(`${TALLY_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${TALLY_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

app.post('/api/route', async (req, res) => {
  try {
    const { status, data } = await tallyPost('/route', req.body);
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
});

app.post('/api/telemetry', async (req, res) => {
  try {
    const { status, data } = await tallyPost('/telemetry', req.body);
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`TallyTestClient → http://localhost:${PORT}`);
  if (!TALLY_KEY) console.warn('WARNING: TALLY_API_KEY is not set in .env');
});
