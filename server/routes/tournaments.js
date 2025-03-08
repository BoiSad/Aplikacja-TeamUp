const express = require('express');
const db = require('../database');  // Połączenie z bazą danych
const router = express.Router();

// Pobierz wszystkie turnieje
router.get('/', (req, res) => {
    const query = 'SELECT * FROM tournaments';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Błąd przy pobieraniu turniejów:', err);
            return res.status(500).json({ message: 'Błąd serwera przy pobieraniu turniejów.' });
        }

        res.status(200).json(results);
    });
});

// Pobierz turnieje w określonym zakresie dat
router.get('/search', (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: "Musisz podać obie daty: startDate i endDate" });
    }

    const query = 'SELECT id, name, date, lokalizacja, format FROM tournaments WHERE date BETWEEN ? AND ?';
    db.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            console.error('Błąd przy wyszukiwaniu turniejów:', err);
            return res.status(500).json({ message: 'Błąd serwera przy wyszukiwaniu turniejów.' });
        }

        res.status(200).json(results);
    });
});

// Pobierz mecze dla danego turnieju
router.get('/:id/matches', (req, res) => {
    const tournamentId = req.params.id;

    const query = `
        SELECT m.id, t1.name AS team1, t2.name AS team2, m.match_date, r.result
        FROM matches m
        JOIN teams t1 ON m.team1 = t1.id
        JOIN teams t2 ON m.team2 = t2.id
        LEFT JOIN results r ON m.id = r.match_id
        WHERE m.tournament_id = ?
    `;

    db.query(query, [tournamentId], (err, results) => {
        if (err) {
            console.error('Błąd podczas pobierania meczów:', err);
            return res.status(500).json({ message: 'Błąd przy pobieraniu meczów' });
        }

        res.json(results);
    });
});

// Pobierz wszystkie turnieje organizatora
router.get('/my-tournaments', (req, res) => {
    const { organizerId } = req.query;

    console.log('Organizator ID otrzymany z zapytania:', organizerId);

    if (!organizerId) {
        return res.status(400).json({ message: 'Brak organizerId w zapytaniu!' });
    }

    // Zapytanie do bazy danych
    db.query('SELECT id, name FROM tournaments WHERE organizer_id = ?', [organizerId], (error, results) => {
        if (error) {
            console.error('Błąd podczas pobierania turniejów:', error);
            return res.status(500).json({ message: 'Błąd serwera' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Brak turniejów dla tego organizatora.' });
        }

        res.json(results); // Zwracamy wyniki jako JSON
    });
});

// Pobierz pojedynczy turniej na podstawie ID
router.get('/:id', (req, res) => {
    const tournamentId = req.params.id;

    const query = 'SELECT * FROM tournaments WHERE id = ?';
    db.query(query, [tournamentId], (err, results) => {
        if (err) {
            console.error('Błąd przy pobieraniu turnieju:', err);
            return res.status(500).json({ message: 'Błąd serwera przy pobieraniu turnieju.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Nie znaleziono turnieju o takim ID' });
        }

        res.status(200).json(results[0]); // Zwrócenie danych turnieju
    });
});

// PUT - Aktualizacja turnieju
router.put('/:id', (req, res) => {
    const tournamentId = req.params.id;
    const { name, date, lokalizacja, format } = req.body;

    console.log('Próba aktualizacji turnieju...');
    console.log('ID Turnieju:', tournamentId);
    console.log('Dane:', { name, date, lokalizacja, format });

    const query = 'UPDATE tournaments SET name = ?, date = ?, lokalizacja = ?, format = ? WHERE id = ?';
    db.query(query, [name, date, lokalizacja, format, tournamentId], (error, results) => {
        if (error) {
            console.error('Błąd serwera:', error);
            return res.status(500).send('Błąd serwera');
        }

        if (results.affectedRows === 0) {
            console.log('Nie znaleziono turnieju o tym ID');
            return res.status(404).send('Nie znaleziono turnieju');
        }

        res.status(200).send('Turniej zaktualizowany');
    });
});

// DELETE - Usuwanie turnieju i powiązanych meczów
router.delete('/:id', (req, res) => {
    const tournamentId = req.params.id;
    // Najpierw usuwamy wszystkie wyniki powiązane z meczami danego turnieju
    const deleteResultsQuery = `
        DELETE FROM results 
        WHERE match_id IN (SELECT id FROM matches WHERE tournament_id = ?)
    `;
    db.query(deleteResultsQuery, [tournamentId], (err) => {
        if (err) {
            console.error('Błąd podczas usuwania wyników:', err);
            return res.status(500).json({ message: 'Błąd serwera podczas usuwania wyników' });
        }
        // Następnie usuwamy mecze powiązane z turniejem
        const deleteMatchesQuery = 'DELETE FROM matches WHERE tournament_id = ?';

        db.query(deleteMatchesQuery, [tournamentId], (err) => {
            if (err) {
                console.error('Błąd podczas usuwania meczów:', err);
                return res.status(500).json({ message: 'Błąd serwera podczas usuwania meczów' });
            }
            // Na końcu usuwamy turniej
            const deleteTournamentQuery = 'DELETE FROM tournaments WHERE id = ?';
            
            db.query(deleteTournamentQuery, [tournamentId], (error, results) => {
                if (error) {
                    console.error('Błąd podczas usuwania turnieju:', error);
                    return res.status(500).json({ message: 'Błąd serwera podczas usuwania turnieju' });
                }

                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: 'Nie znaleziono takiego turnieju' });
                }

                res.status(200).json({ message: 'Turniej i wszystkie powiązane dane zostały pomyślnie usunięte' });
            });
        });
    });
});

module.exports = router;
