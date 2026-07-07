const { put, list } = require('@vercel/blob');

const BLOB_PATHNAME = 'data.json';

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        try {
            const { blobs } = await list({ prefix: BLOB_PATHNAME });
            const existing = blobs.find(b => b.pathname === BLOB_PATHNAME);

            if (!existing) {
                return res.status(200).json([]);
            }

            const response = await fetch(existing.url);
            const data = await response.json();
            return res.status(200).json(data);
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erreur de lecture');
        }
    }

    if (req.method === 'POST') {
        try {
            const jsonString = JSON.stringify(req.body);

            await put(BLOB_PATHNAME, jsonString, {
                access: 'public',
                addRandomSuffix: false,
                allowOverwrite: true,
                contentType: 'application/json'
            });

            return res.status(200).send('OK');
        } catch (err) {
            console.error(err);
            return res.status(500).send("Erreur d'écriture");
        }
    }

    res.status(405).send('Méthode non autorisée');
};