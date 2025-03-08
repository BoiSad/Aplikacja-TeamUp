document.addEventListener('DOMContentLoaded', function() {
    // Pobranie ID organizatora (zakładając, że jest zapisane w localStorage)
    const organizerId = localStorage.getItem('id');
    console.log('id_uzytkownika:', organizerId); // Debugowanie
    
    // Komunikaty dla formularza tworzenia turnieju
    const createTournamentMessageDiv = document.getElementById('create-tournament-message');
    const form = document.getElementById('createTournamentForm');

    // Dodanie event listenera do formularza
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Sprawdzenie, czy organizator jest zalogowany
        if (!organizerId) {
            createTournamentMessageDiv.textContent = 'Brak ID organizatora. Upewnij się, że jesteś zalogowany!';
            createTournamentMessageDiv.classList.remove('message-success', 'message-warning');
            createTournamentMessageDiv.classList.add('message-error'); // Ustawienie klasy błędu
            createTournamentMessageDiv.style.display = 'block'; // Pokazanie komunikatu
            return;
        }

        // Pobranie danych z formularza
        const tournamentData = {
            name: document.getElementById('name').value,
            date: document.getElementById('date').value,
            lokalizacja: document.getElementById('lokalizacja').value,
            format: document.getElementById('format').value,
            organizer_id: organizerId  // Dodanie ID organizatora
        };

        console.log('Dane z formularza:', tournamentData);

        // Wysyłanie danych do backendu
        fetch('/api/create-tournament', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tournamentData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                createTournamentMessageDiv.textContent = 'Turniej został pomyślnie utworzony!';
                createTournamentMessageDiv.classList.remove('message-error', 'message-warning');
                createTournamentMessageDiv.classList.add('message-success'); // Ustawienie klasy sukcesu
                createTournamentMessageDiv.style.display = 'block'; // Pokazanie komunikatu
            } else {
                createTournamentMessageDiv.textContent = data.message || 'Wystąpił błąd podczas tworzenia turnieju!';
                createTournamentMessageDiv.classList.remove('message-success', 'message-warning');
                createTournamentMessageDiv.classList.add('message-error'); // Ustawienie klasy błędu
                createTournamentMessageDiv.style.display = 'block'; // Pokazanie komunikatu
            }
        })
        .catch(error => {
            console.error('Błąd:', error);
            createTournamentMessageDiv.textContent = 'Wystąpił błąd podczas tworzenia turnieju!';
            createTournamentMessageDiv.classList.remove('message-success', 'message-warning');
            createTournamentMessageDiv.classList.add('message-error'); // Ustawienie klasy błędu
            createTournamentMessageDiv.style.display = 'block'; // Pokazanie komunikatu
        });
    });

    // Komunikaty dla formularza generowania terminarza
    const scheduleMessageDiv = document.getElementById('schedule-message');
    const generateTeamNamesButton = document.getElementById('generate-team-names');
    const teamCountSelect = document.getElementById('team-count');
    const teamNamesContainer = document.getElementById('team-names-container');
    const teamNamesForm = document.getElementById('team-names-form');
    const generateScheduleButton = document.getElementById('generate-schedule');
    const scheduleDisplay = document.getElementById('schedule-display'); // Definicja scheduleDisplay

    // Obsługa generowania pól dla drużyn
    generateTeamNamesButton.addEventListener('click', () => {
        const teamCount = parseInt(teamCountSelect.value);
        teamNamesContainer.innerHTML = '';  // Resetowanie zawartości

        for (let i = 1; i <= teamCount; i++) {
            const label = document.createElement('label');
            label.textContent = `Nazwa drużyny ${i}:`;

            const input = document.createElement('input');
            input.type = 'text';
            input.name = `team${i}`;
            input.required = true;

            teamNamesContainer.appendChild(label);
            teamNamesContainer.appendChild(input);
            teamNamesContainer.appendChild(document.createElement('br'));
        }

        teamNamesForm.style.display = 'block'; // Pokazanie formularza
    });

    // Obsługa wysyłania drużyn do backendu i generowania kalendarza
    generateScheduleButton.addEventListener('click', async () => {
        const teamInputs = teamNamesContainer.querySelectorAll('input');
        const teams = [];

        teamInputs.forEach(input => {
            if (input.value.trim() !== '') {
                teams.push(input.value.trim());
            }
        });

        if (teams.length < 2) {
            scheduleMessageDiv.textContent = 'Musisz wprowadzić co najmniej dwie drużyny!';
            scheduleMessageDiv.classList.remove('message-success', 'message-info', 'message-warning');
            scheduleMessageDiv.classList.add('message-error'); // Dodanie klasy dla błędu
            scheduleMessageDiv.style.display = 'block'; // Upewniamy się, że komunikat będzie widoczny
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/generate-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teams })
            });

            const result = await response.json();
            console.log('Odpowiedź z serwera:', result);

            
            if (response.ok) {
                // Czyszczenie starego terminarza
                scheduleDisplay.innerHTML = '';

                if (Array.isArray(result.matches) && result.matches.length > 0) {
                    const table = document.createElement('table');
                    const headerRow = document.createElement('tr');
                    
                    // Nagłówki tabeli
                    headerRow.innerHTML = `
                        <th>Drużyna 1</th>
                        <th>Drużyna 2</th>
                        <th>Data</th>
                    `;
                    table.appendChild(headerRow);

                    // Dodajemy mecze
                    result.matches.forEach(match => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td class="team-name">${match.team1.name}</td>
                            <td class="team-name">${match.team2.name}</td>
                            <td class="match-date">${match.match_date}</td>
                        `;
                        table.appendChild(row);
                    });

                    // Dodajemy tabelę do sekcji
                    scheduleDisplay.appendChild(table);
                } else {
                    scheduleDisplay.innerHTML = '<p>Brak meczów do wyświetlenia.</p>';
                }
            } else {
                scheduleMessageDiv.textContent = `Błąd: ${result.message}`;
                scheduleMessageDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Błąd połączenia:', error);
            scheduleMessageDiv.textContent = 'Błąd połączenia z serwerem';
            scheduleMessageDiv.style.display = 'block';
        }
    });
});
