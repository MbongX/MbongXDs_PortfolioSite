const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const app = express();
const port = 3000;

// Set security headers
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
app.use(express.static(path.join(__dirname, 'public'), {
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
    res.sendFile(path.join(__dirname, 'public', 'index.html'), {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
});

// Error handling
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start the server
const server = app.listen(port, '0.0.0.0', () => {
    const host = server.address().address;
    // No console.log in production
});
