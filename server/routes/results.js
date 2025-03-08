
const express = require('express');
const db = require('../database');  // Połączenie z bazą danych
const router = express.Router();


router.post('/', (req, res) => {
    const { tournamentId, team1Id, team2Id, result1, result2 } = req.body;

    // Sprawdzenie, czy wszystkie dane zostały przekazane
    if (!tournamentId || !team1Id || !team2Id || !result1 || !result2) {
        return res.status(400).json({ message: 'Wszystkie pola muszą być wypełnione' });
    }

    // Sprawdzanie, czy istnieje mecz w tabeli matches
    const checkMatchQuery = `
        SELECT id FROM matches WHERE tournament_id = ? AND team1 = ? AND team2 = ? LIMIT 1
    `;

    db.query(checkMatchQuery, [tournamentId, team1Id, team2Id], (err, results) => {
        if (err) {
            console.error('Błąd przy sprawdzaniu meczu:', err);
            return res.status(500).json({ message: 'Błąd przy sprawdzaniu meczu' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Nie znaleziono meczu dla tych drużyn w tym turnieju' });
        }

        // Uzyskanie ID meczu
        const matchId = results[0].id;

        // Wynik w formie tekstowej (np. "3-1")
        const resultText = `${result1}-${result2}`;

        // Zapytanie do zapisania wyniku w tabeli `results`
        const insertResultQuery = `
            INSERT INTO results (tournament_id, match_id, result)
            VALUES (?, ?, ?)
        `;

        // Zapisywanie wyniku
        db.query(insertResultQuery, [tournamentId, matchId, resultText], (err, result) => {
            if (err) {
                console.error('Błąd podczas zapisywania wyników:', err);
                return res.status(500).json({ message: 'Błąd podczas zapisywania wyników' });
            }

            // Zwrocenie odpowiedzi sukcesu
            res.status(200).json({ message: 'Wyniki zostały zapisane pomyślnie' });
        });
    });
});
module.exports = router;