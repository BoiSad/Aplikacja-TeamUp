const express = require("express"); // Importujemy Express
const router = express.Router(); // Tworzymy instancję routera
const db = require("../database"); // Załadowanie bazy danych (upewnij się, że ścieżka jest poprawna)

// Definicja trasy POST
router.post("/", async (req, res) => {
    const { teams } = req.body;
    console.log("📥 Otrzymane drużyny:", teams);

    if (!teams || teams.length < 2) {
        return res.status(400).json({ message: "Potrzeba co najmniej 2 drużyn!" });
    }

    try {
        let teamIds = {};

        // 🔹 Pobieramy ID ostatniego turnieju
        const [tournamentRows] = await db.promise().query("SELECT id FROM tournaments ORDER BY id DESC LIMIT 1");

        if (tournamentRows.length === 0) {
            return res.status(400).json({ message: "Nie znaleziono turnieju w bazie!" });
        }

        const tournament_id = tournamentRows[0].id;
        console.log("📥 Otrzymane ID turnieju:", tournament_id);

        // 🔹 Dla każdej drużyny sprawdzamy, czy istnieje w bazie
        for (const teamName of teams) {
            const [rows] = await db.promise().query("SELECT id FROM teams WHERE name = ?", [teamName]);

            if (rows.length > 0) {
                teamIds[teamName] = rows[0].id;

                // ✅ Aktualizujemy `tournament_id` dla istniejącej drużyny
                await db.promise().query("UPDATE teams SET tournament_id = ? WHERE id = ?", [tournament_id, rows[0].id]);

            } else {
                // ✅ Jeśli drużyny nie ma, dodajemy ją do bazy **z przypisanym turniejem**
                const [insertTeams] = await db.promise().query("INSERT INTO teams (name, tournament_id) VALUES (?, ?)", [teamName, tournament_id]);
                teamIds[teamName] = insertTeams.insertId;
            }
        }

        console.log("✅ Drużyny zapisane w bazie:", teamIds)

      
        // 🔹 Generowanie meczów
        const matches = [];
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                const matchDate = new Date();
                const matchDateFormatted = matchDate.toISOString().split('T')[0];  // Formatujemy datę do YYYY-MM-DD

                matches.push({
                    team1: teamIds[teams[i]], // ID drużyny 1
                    team2: teamIds[teams[j]], // ID drużyny 2
                    match_date: matchDateFormatted, // Data w formacie YYYY-MM-DD
                    tournament_id: tournament_id  // Przypisujemy ID turnieju
                });
            }
        }

        console.log("📅 Wygenerowane mecze:", matches);

        // 🔹 Zapisujemy mecze do bazy danych
        const query = "INSERT INTO matches (team1, team2, match_date, tournament_id) VALUES ?";
        const values = matches.map(match => [match.team1, match.team2, match.match_date, match.tournament_id]);

        await db.promise().query(query, [values]);

        // 🔹 Pobieramy pełne informacje o drużynach (nazwy) dla każdego meczu
        const matchIds = matches.map(match => [match.team1, match.team2]);

        // Pobierz drużyny z bazy danych po ID
        const [teamsInfo] = await db.promise().query(`
            SELECT id, name FROM teams WHERE id IN (?)
        `, [matchIds.flat()]);

        // Przygotowujemy pełne dane meczów z nazwami drużyn
        const matchesWithNames = matches.map(match => {
            const team1Info = teamsInfo.find(team => team.id === match.team1);
            const team2Info = teamsInfo.find(team => team.id === match.team2);
            
            return {
                team1: { id: team1Info.id, name: team1Info.name },
                team2: { id: team2Info.id, name: team2Info.name },
                match_date: match.match_date,
                tournament_id: match.tournament_id
            };
        });

        res.status(201).json({ message: "Terminarz został wygenerowany!", matches: matchesWithNames });
    } catch (error) {
        console.error("❌ Błąd przy generowaniu terminarza:", error);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

// Eksportujemy router, aby móc go zaimportować w innych częściach aplikacji
module.exports = router;
