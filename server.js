/*const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/tasks', (req,res) => {
    fs.readFile('data.json', 'utf-8', (err, data) => {
        if(err) {
            return res.status(500).send('Erreur de lecture');
        }
        res.send(data);
    });
});

app.post('/tasks', (req, res) => {
    const jsonString = JSON.stringify(req.body);
    fs.writeFile('data.json', jsonString, (err) => { 
        if (err) {
            return res.status(500).send('Erreur d\'écriture')
        }
        res.send('OK');
    });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});*/

const express = require('express');
const path = require('path');
const { put, list } = require('@vercel/blob');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const BLOB_PATHNAME = 'data.json';

app.get('/tasks', async (req, res) => {
    try {
        const { blobs } = await list({ prefix: BLOB_PATHNAME });
        const existing = blobs.find(b => b.pathname === BLOB_PATHNAME);

        if (!existing) {
            return res.json([]);
        }

        const response = await fetch(existing.url);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur de lecture');
    }
});

app.post('/tasks', async (req, res) => {
    try {
        const jsonString = JSON.stringify(req.body);

        await put(BLOB_PATHNAME, jsonString, {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: true,
            contentType: 'application/json'
        });

        res.send('OK');
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur d'écriture");
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});