import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Log para debug
console.log('Environment PORT:', process.env.PORT);
console.log('Using PORT:', PORT);

// Servir arquivos estáticos da pasta dist
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback: todas as rotas retornam index.html
app.get('*', (req, res) => {
  try {
    const indexHtml = readFileSync(join(__dirname, 'dist', 'index.html'), 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.send(indexHtml);
  } catch (error) {
    res.status(500).send('Error loading index.html');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
