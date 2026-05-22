import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { config as dotenvConfig } from 'dotenv';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

// Load .env: packaged app reads from beside the .exe, dev reads from project root
const envPath = app.isPackaged
  ? path.join(path.dirname(process.execPath), '.env')
  : path.join(__dirname, '..', '.env');
dotenvConfig({ path: envPath });

const PORT = 3001;

function getDistPath() {
  // extraResources copies dist/ → resources/dist/
  return app.isPackaged
    ? path.join(process.resourcesPath, 'dist')
    : path.join(__dirname, '..', 'dist');
}

function startServer() {
  const srv = express();
  srv.use(cors());
  srv.use(express.json());

  const distPath = getDistPath();
  srv.use(express.static(distPath));

  srv.post('/api/generate', async (req, res) => {
    const { prompt } = req.body as { prompt: string };
    if (!prompt) { res.status(400).json({ error: 'prompt required' }); return; }
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
      res.json({ text });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // SPA fallback
  srv.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  srv.listen(PORT, () => console.log(`Studia server on :${PORT}`));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 620,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL(`http://localhost:${PORT}`);

  // Open external links in system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  startServer();
  // Brief wait for the express server to bind
  setTimeout(createWindow, 800);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
