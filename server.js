const express = require('express');
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
});