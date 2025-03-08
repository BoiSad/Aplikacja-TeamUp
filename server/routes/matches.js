const express = require('express');
const db = require('../database');  // Połączenie z bazą danych
const router = express.Router(); // Tworzenie instancji routera

// Endpoint do publikacji wyników
router.post('/publish', (req, res) => {
    const { tournamentId, team1Id, team2Id, score1, score2 } = req.body;

    if (!tournamentId || !team1Id || !team2Id || !score1 || !score2) {
        return res.status(400).json({ message: 'Wszystkie dane są wymagane.' });
    }

    const query = 'INSERT INTO results (tournament_id, team1_id, team2_id, result1, result2) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [tournamentId, team1Id, team2Id, score1, score2], (err, results) => {
        if (err) {
            console.error('Błąd przy zapisywaniu wyniku meczu:', err);
            return res.status(500).json({ message: 'Błąd serwera przy zapisywaniu wyniku.' });
        }

        res.status(200).json({ message: 'Wynik zapisany pomyślnie.' });
    });
});



module.exports = router;
