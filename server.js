import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';
import helmet from 'helmet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));

// Enable gzip compression
app.use(compression());

// Set cache control headers
const oneYear = 31536000;
app.use(express.static(join(__dirname, 'public'), {
  maxAge: oneYear,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', `public, max-age=${oneYear}, immutable`);
    } else if (filePath.endsWith('.ico')) {
      res.setHeader('Content-Type', 'image/x-icon');
      res.setHeader('Cache-Control', `public, max-age=${oneYear}, immutable`);
    } else if (filePath.match(/\.(js|css)$/)) {
      res.setHeader('Cache-Control', `public, max-age=${oneYear}, immutable`);
    }
  }
}));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'), {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
