const express = require('express');
const db = require('../database'); // Połączenie z bazą danych
const router = express.Router(); // Tworzenie instancji routera

// Tworzenie nowego turnieju
router.post('/', (req, res) => {
    const { name, date, lokalizacja, format, organizer_id } = req.body; // Odbieramy organizer_id z body

    if (!name || !date || !lokalizacja || !format || !organizer_id) {
        return res.status(400).json({ message: 'Wszystkie pola są wymagane!' });
    }

    // Sprawdzamy, czy turniej o podanej nazwie już istnieje
    const checkQuery = 'SELECT COUNT(*) AS count FROM tournaments WHERE name = ?';
    db.query(checkQuery, [name], (err, results) => {
        if (err) {
            console.error('Błąd sprawdzania duplikacji:', err);
            return res.status(500).json({ message: 'Błąd serwera podczas sprawdzania turnieju' });
        }

        if (results[0].count > 0) {
            return res.status(400).json({ message: 'Turniej o tej nazwie już istnieje!' });
        }

        // Jeśli turniej nie istnieje, dodajemy go do bazy danych
        const insertTournament = 'INSERT INTO tournaments (name, date, lokalizacja, format, organizer_id) VALUES (?, ?, ?, ?, ?)';
        db.query(insertTournament, [name, date, lokalizacja, format, organizer_id], (err, results) => {
            if (err) {
                console.error('Błąd dodawania turnieju:', err);
                return res.status(500).json({ message: 'Błąd serwera podczas dodawania turnieju' });
            }

            res.status(201).json({ message: 'Turniej został pomyślnie stworzony' });
        });
    });
});


// Funkcja do generowania terminarza metodą "Round Robin"
const generateRoundRobinSchedule = (teams) => {
    const schedule = [];
    const numberOfTeams = teams.length;
    
    if (numberOfTeams % 2 !== 0) {
        teams.push('Bye'); // Jeśli liczba drużyn jest nieparzysta, dodajemy "Bye" jako wolny termin
    }

    const totalRounds = teams.length - 1;
    const matchesPerRound = teams.length / 2;
    let teamList = [...teams];

    for (let round = 0; round < totalRounds; round++) {
        let roundMatches = [];

        for (let match = 0; match < matchesPerRound; match++) {
            const team1 = teamList[match];
            const team2 = teamList[teamList.length - 1 - match];

            if (team1 !== 'Bye' && team2 !== 'Bye') {
                roundMatches.push({ team1, team2 });
            }
        }

        schedule.push(...roundMatches);
        teamList.splice(1, 0, teamList.pop()); // Obracanie drużyn
    }

    return schedule;
};

// Endpoint do generowania terminarza meczów
router.post('/generate-schedule', (req, res) => {
    const { teams } = req.body;

    if (!teams || teams.length < 2) {
        return res.status(400).json({ message: 'Musisz podać co najmniej dwie drużyny!' });
    }

    const schedule = generateRoundRobinSchedule(teams);
/// Sprawdzenie, czy mecz już istnieje przed dodaniem
const checkMatchQuery = 'SELECT COUNT(*) AS count FROM matches WHERE team1 = ? AND team2 = ?';

const insertMatches = 'INSERT INTO matches (team1, team2) VALUES (?, ?)';

schedule.forEach(match => {
    db.query(checkMatchQuery, [match.team1, match.team2], (err, results) => {
        if (err) {
            console.error('Błąd sprawdzania meczu:', err);
            return;
        }

        if (results[0].count === 0) { // Jeśli mecz nie istnieje, dodajemy
            db.query(insertMatches, [match.team1, match.team2], (err) => {
                if (err) console.error('Błąd zapisu meczu:', err);
            });
        }
    });
});

res.status(201).json({ message: 'Kalendarz został wygenerowany!', schedule });
});

module.exports = router;
