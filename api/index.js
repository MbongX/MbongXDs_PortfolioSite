// This is the Azure Functions entry point
const { app } = require('@azure/functions');
const express = require('express');
const path = require('path');

// Create an Express app
const expressApp = express();

// Middleware
expressApp.use(express.json());

expressApp.use(express.static(path.join(__dirname, '..', 'public')));

expressApp.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the API!' });
});

// Azure Functions handler
app.http('index', {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    handler: async (request, context) => {
        context.log('HTTP function processed a request.');
        return expressApp(request, context.res);
    }
});
