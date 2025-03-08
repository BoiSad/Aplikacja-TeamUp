document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchTournamentForm');
    const tournamentsList = document.getElementById('tournamentsList');

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; 
    }

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        let url = `/api/tournaments/search?startDate=${startDate}&endDate=${endDate}`;
        
        try {
            const response = await fetch(url);
            const tournaments = await response.json();

            tournamentsList.innerHTML = '';

            if (tournaments.length > 0) {
                tournaments.forEach(tournament => {
                    const tournamentElement = document.createElement('div');
                    tournamentElement.classList.add('tournament');
                    tournamentElement.innerHTML = `
                        <h3 class="tournament-title" data-id="${tournament.id}">
                            ${tournament.name}
                        </h3>
                        <p>Data: ${formatDate(tournament.date)}</p>
                        <p>Lokalizacja: ${tournament.lokalizacja}</p>
                        <p>Format: ${tournament.format}</p>
                        <div class="matches" id="matches-${tournament.id}" style="display: none;"></div>
                    `;
                    
                    tournamentsList.appendChild(tournamentElement);
                });

                // Dodajemy obsługę kliknięcia w turniej
                document.querySelectorAll('.tournament-title').forEach(title => {
                    title.addEventListener('click', async (event) => {
                        const tournamentId = event.target.getAttribute('data-id');
                        const matchesDiv = document.getElementById(`matches-${tournamentId}`);

                        // Jeśli mecze są już widoczne -> ukryj je
                        if (matchesDiv.style.display === 'block') {
                            matchesDiv.style.display = 'none';
                            return;
                        }

                        try {
                            const response = await fetch(`/api/tournaments/${tournamentId}/matches`);
                            const matches = await response.json();

                            matchesDiv.innerHTML = `<p>Mecze:</p>`;
                            if (matches.length > 0) {
                                const table = document.createElement('table');
                                table.innerHTML = `
                                    <tr>
                                        <th>Drużyna 1</th>
                                        <th>Drużyna 2</th>
                                        <th>Data Meczu</th>
                                        <th>Wynik</th>
                                    </tr>
                                `;

                                matches.forEach(match => {
                                    const row = document.createElement('tr');

                                    // Wyświetlanie wyniku
                                    let result = 'Brak wyniku';
                                    if (match.result) {
                                        result = match.result; // Wynik w formacie "3-1"
                                    }

                                    row.innerHTML = `
                                        <td>${match.team1}</td>
                                        <td>${match.team2}</td>
                                        <td>${formatDate(match.match_date)}</td>
                                        <td>${result}</td>
                                    `;
                                    table.appendChild(row);
                                });

                                matchesDiv.appendChild(table);
                            } else {
                                matchesDiv.innerHTML += `<p>Brak zaplanowanych meczów.</p>`;
                            }
                            matchesDiv.style.display = 'block';
                        } catch (error) {
                            console.error('Błąd pobierania meczów:', error);
                        }
                    });
                });
            } else {
                tournamentsList.innerHTML = '<h5>Brak turniejów pasujących do wyszukiwania.</h5>';
            }
        } catch (error) {
            console.error('Błąd połączenia:', error);
            tournamentsList.innerHTML = '<p>Błąd połączenia z serwerem.</p>';
        }
    });
});
