/*
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
*/
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('date', { ascending: true })
                .order('heure', { ascending: true });

            if (error) throw error;

            return res.status(200).json(data);
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erreur de lecture');
        }
    }

    if (req.method === 'POST') {
        try {
            const tableau = req.body;

            const { error: deleteError } = await supabase
                .from('tasks')
                .delete()
                .neq('id', 0);

            if (deleteError) throw deleteError;

            if (tableau.length > 0) {
                const lignes = tableau.map(t => ({
                    text: t.text,
                    date: t.date,
                    heure: t.heure,
                    checkbox_state: t.checkbox_state
                }));

                const { error: insertError } = await supabase
                    .from('tasks')
                    .insert(lignes);

                if (insertError) throw insertError;
            }

            return res.status(200).send('OK');
        } catch (err) {
            console.error(err);
            return res.status(500).send("Erreur d'écriture");
        }
    }

    res.status(405).send('Méthode non autorisée');
};