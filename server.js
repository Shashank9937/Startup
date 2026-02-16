const express = require('express');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const DATA_DIR = path.join(__dirname, 'data');
const STATE_PATH = path.join(DATA_DIR, 'founder-os-state.json');
const DIST_DIR = path.join(__dirname, 'dist');
const CLIENT_DIR = fs.existsSync(DIST_DIR) ? DIST_DIR : __dirname;

const usePostgres = Boolean(DATABASE_URL);
const pool = usePostgres ? new Pool({ connectionString: DATABASE_URL }) : null;

app.use(express.json({ limit: '5mb' }));
app.use(express.static(CLIENT_DIR));

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

async function initStorage() {
  if (!usePostgres) {
    ensureStateFile();
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS founder_os_state (
      id TEXT PRIMARY KEY,
      payload JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function readState() {
  if (usePostgres) {
    const res = await pool.query(
      'SELECT payload, updated_at FROM founder_os_state WHERE id = $1',
      ['default']
    );
    if (!res.rows[0]) return { data: null, updatedAt: null };
    return {
      data: res.rows[0].payload || null,
      updatedAt: res.rows[0].updated_at || null
    };
  }

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

async function writeState(data) {
  const payload = {
    data,
    updatedAt: new Date().toISOString()
  };

  if (usePostgres) {
    await pool.query(
      `INSERT INTO founder_os_state (id, payload, updated_at)
       VALUES ($1, $2::jsonb, $3)
       ON CONFLICT (id)
       DO UPDATE SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at`,
      ['default', JSON.stringify(payload.data), payload.updatedAt]
    );
    return payload;
  }

  ensureStateFile();
  fs.writeFileSync(STATE_PATH, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

app.get('/healthz', async (_req, res) => {
  try {
    if (usePostgres) await pool.query('SELECT 1');
    return res.json({ status: 'ok', app: 'Founder OS', storage: usePostgres ? 'postgres' : 'file' });
  } catch (error) {
    console.error(error);
    return res.status(503).json({ status: 'degraded', app: 'Founder OS', storage: 'postgres' });
  }
});

app.get('/api/founder-os', async (_req, res) => {
  try {
    const state = await readState();
    return res.json({ ok: true, ...state, storage: usePostgres ? 'postgres' : 'file' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to read Founder OS state' });
  }
});

app.put('/api/founder-os', async (req, res) => {
  const data = req.body?.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ error: 'data object is required' });
  }

  try {
    const saved = await writeState(data);
    return res.json({ ok: true, ...saved, storage: usePostgres ? 'postgres' : 'file' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to save Founder OS state' });
  }
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path === '/healthz') {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.sendFile(path.join(CLIENT_DIR, 'index.html'));
});

initStorage()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Founder OS running on http://localhost:${PORT} (storage: ${usePostgres ? 'postgres' : 'file'})`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize storage:', error);
    process.exit(1);
  });
