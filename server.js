import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Log para debug
console.log('Environment PORT:', process.env.PORT);
console.log('Using PORT:', PORT);
console.log('__dirname:', __dirname);
console.log('dist exists:', existsSync(join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT, timestamp: new Date().toISOString() });
});

// Servir arquivos estáticos da pasta dist
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback: todas as rotas retornam index.html
app.get('*', (req, res) => {
  try {
    const indexPath = join(__dirname, 'dist', 'index.html');
    console.log('Serving index.html from:', indexPath);
    const indexHtml = readFileSync(indexPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.send(indexHtml);
  } catch (error) {
    console.error('Error loading index.html:', error);
    res.status(500).send(`Error loading index.html: ${error.message}`);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
