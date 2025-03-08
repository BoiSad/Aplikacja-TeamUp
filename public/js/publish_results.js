document.addEventListener('DOMContentLoaded', () => {
    async function fetchTournaments() {
        try {
            const response = await fetch('http://localhost:3001/api/tournaments');
            const tournamentSelect = document.getElementById('tournament');

            tournaments.forEach(tournament => {
                const option = document.createElement('option');
                option.value = tournament.id;
                option.textContent = tournament.name;
                tournamentSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Błąd przy ładowaniu turniejów:', error);
        }
    }

    // Funkcja do pobierania drużyn
    async function fetchTeams() {
        try {
            const response = await fetch('http://localhost:3001/api/teams');
            const teams = await response.json();

            const team1Select = document.getElementById('team1');
            const team2Select = document.getElementById('team2');

            team1Select.innerHTML = '<option value="">Wybierz drużynę</option>';
            team2Select.innerHTML = '<option value="">Wybierz drużynę</option>';

            teams.forEach(team => {
                const option1 = document.createElement('option');
                option1.value = team.id;
                option1.textContent = team.name;
                team1Select.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = team.id;
                option2.textContent = team.name;
                team2Select.appendChild(option2);
            });
        } catch (error) {
            console.error('Błąd przy ładowaniu drużyn:', error);
        }
    }

    document.getElementById('tournament').addEventListener('change', (event) => {
        const tournamentId = event.target.value;
        if (tournamentId) {
            fetchTeams(); // Pobierz drużyny (bez względu na turniej)
        }
    });

    fetchTournaments(); // Załaduj turnieje przy starcie strony
    fetchTeams(); // Załaduj drużyny przy starcie strony

    // Wysyłanie wyników do backendu
    document.getElementById('publishResultsForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const tournamentId = document.getElementById('tournament').value;
        const team1Id = document.getElementById('team1').value;
        const team2Id = document.getElementById('team2').value;
        const result1 = document.getElementById('result1').value;
        const result2 = document.getElementById('result2').value;

        if (!tournamentId || !team1Id || !team2Id || !result1 || !result2) {
            alert('Wszystkie pola muszą być wypełnione!');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tournamentId,
                    team1Id,
                    team2Id,
                    result1,
                    result2,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                alert('Wyniki zostały opublikowane!');
            } else {
                alert(`Błąd: ${result.message}`);
            }
        } catch (error) {
            console.error('Błąd przy publikowaniu wyników:', error);
        }
    });
});
