const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const STATE_PATH = path.join(DATA_DIR, 'founder-os-state.json');

app.use(express.json({ limit: '5mb' }));
app.use(express.static(__dirname));

function ensureStateFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STATE_PATH)) {
    fs.writeFileSync(
      STATE_PATH,
      JSON.stringify({ data: null, updatedAt: null }, null, 2),
      'utf8'
    );
  }
}

function readState() {
  ensureStateFile();
  try {
    const raw = fs.readFileSync(STATE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      data: parsed?.data ?? null,
      updatedAt: parsed?.updatedAt ?? null
    };
  } catch {
    return { data: null, updatedAt: null };
  }
}

function writeState(data) {
  const payload = {
    data,
    updatedAt: new Date().toISOString()
  };
  ensureStateFile();
  fs.writeFileSync(STATE_PATH, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', app: 'Founder OS' });
});

app.get('/api/founder-os', (_req, res) => {
  const state = readState();
  res.json({ ok: true, ...state });
});

app.put('/api/founder-os', (req, res) => {
  const data = req.body?.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ error: 'data object is required' });
  }

  const saved = writeState(data);
  return res.json({ ok: true, ...saved });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Founder OS running on http://localhost:${PORT}`);
});
