const express = require('express');
const db = require('../database'); // Połączenie z bazą danych
const router = express.Router();

// Pobierz wszystkie drużyny z informacją o turnieju
router.get('/', async (req, res) => {
    const getTeams = `
        SELECT teams.id, teams.name, teams.tournament_id, 
               tournaments.name AS tournament_name
        FROM teams
        LEFT JOIN tournaments ON teams.tournament_id = tournaments.id
        ORDER BY teams.name ASC`; // Sortowanie alfabetyczne po nazwie drużyny

    try {
        db.query(getTeams, (err, results) => {
            if (err) {
                console.error('Błąd przy pobieraniu drużyn:', err);
                return res.status(500).json({ message: 'Błąd serwera przy pobieraniu drużyn.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Brak drużyn w bazie!' });
            }

            res.status(200).json(results); // Zwracamy wszystkie drużyny wraz z nazwą turnieju
        });
    } catch (error) {
        console.error('Błąd serwera:', error);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

module.exports = router;
