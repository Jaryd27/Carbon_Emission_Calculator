// server/server.js
import 'dotenv/config';                  // load .env (DB creds, etc.)
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from /public
app.use(express.static(path.join(process.cwd(), 'public')));

// Mount all routes (pages + API) exactly as they are defined
app.use('/', router);

// Fallback 404 for unknown API paths (prevents HTML from leaking into JSON fetches)
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
