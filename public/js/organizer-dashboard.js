document.addEventListener('DOMContentLoaded', () => {
    const organizerId = localStorage.getItem('id'); // Pobieramy ID organizatora

    // Pobranie listy turniejów organizatora
    async function getTournaments() {
        try {
            if (!organizerId) {
                console.error('Brak organizerId w localStorage');
                return;
            }

            const response = await fetch(`/api/tournaments/my-tournaments?organizerId=${organizerId}`);
            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }

            const data = await response.json();
            const tournamentSelectEdit = document.getElementById('edit-tournament-name');
            const tournamentSelectDelete = document.getElementById('delete-tournament-id'); // Nowy element dla formularza usuwania

            // Czyszczenie listy rozwijanej
            tournamentSelectEdit.innerHTML = '<option value="">Wybierz turniej</option>';
            tournamentSelectDelete.innerHTML = '<option value="">Wybierz turniej do usunięcia</option>'; // Czyszczenie formularza usuwania

            if (data.length === 0) {
                console.log('Brak turniejów dla tego organizatora.');
                return;
            }

            // Dodawanie opcji do listy rozwijanej dla edycji
            data.forEach(tournament => {
                const option = new Option(tournament.name, tournament.id);
                tournamentSelectEdit.appendChild(option);
            });

            // Dodawanie opcji do listy rozwijanej dla usuwania
            data.forEach(tournament => {
                const option = new Option(tournament.name, tournament.id);
                tournamentSelectDelete.appendChild(option);
            });

            // Obsługa zmiany wyboru turnieju w formularzu edycji
            tournamentSelectEdit.addEventListener('change', handleTournamentSelectionEdit);
        } catch (error) {
            console.error('Błąd pobierania turnieju:', error);
        }
    }

    // Wczytanie danych turnieju do formularza po jego wybraniu
    async function handleTournamentSelectionEdit(event) {
        const tournamentId = event.target.value;

        if (tournamentId) {
            try {
                const response = await fetch(`/api/tournaments/${tournamentId}`);
                if (!response.ok) {
                    throw new Error('Błąd podczas pobierania danych turnieju');
                }

                const data = await response.json();

                // Wypełnienie formularza danymi turnieju
                document.getElementById('edit-tournament-form').dataset.tournamentId = tournamentId;

                // Ustawienie wartości w formularzu
                document.getElementById('edit-tournament-date').value = formatDateToInput(data.date);
                document.getElementById('edit-tournament-location').value = data.lokalizacja;
                document.getElementById('edit-tournament-format').value = data.format;

                // Zapisujemy nazwę turnieju do zmiennej, aby ją przekazać przy aktualizacji
                document.getElementById('edit-tournament-form').dataset.tournamentName = data.name;
            } catch (error) {
                console.error('Błąd podczas pobierania danych turnieju:', error);
            }
        }
    }

    // Funkcja do konwertowania daty na format yyyy-MM-dd
    function formatDateToInput(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Funkcja aktualizująca turniej po naciśnięciu "Zaktualizuj"
    document.getElementById('edit-tournament-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const tournamentId = document.getElementById('edit-tournament-name').value;

        if (!tournamentId) {
            alert('Wybierz turniej, który chcesz edytować.');
            return;
        }

        const name = document.getElementById('edit-tournament-form').dataset.tournamentName; // Pobieramy nazwę, którą zapisałem wcześniej
        const date = document.getElementById('edit-tournament-date').value;
        const lokalizacja = document.getElementById('edit-tournament-location').value;
        const format = document.getElementById('edit-tournament-format').value;

        const data = { name, date, lokalizacja, format }; // Wysyłamy zaktualizowane dane, ale nie zmieniając nazwy

        try {
            const response = await fetch(`/api/tournaments/${tournamentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Błąd podczas aktualizacji turnieju');
            }

            alert('Turniej zaktualizowany!');
            getTournaments(); // Odśwież listę turniejów
        } catch (error) {
            console.error('Błąd podczas aktualizacji turnieju:', error);
        }
    });

    document.getElementById('delete-tournament-form').addEventListener('submit', async function(event) {
        event.preventDefault();
    
        const tournamentId = document.getElementById('delete-tournament-id').value;
        const messageDiv = document.getElementById('delete-message'); // Zmienna do komunikatów
        
        // Sprawdzenie, czy podano ID turnieju
        if (!tournamentId) {
            messageDiv.textContent = 'Proszę podać ID turnieju!';
            messageDiv.classList.remove('message-success', 'message-info', 'message-warning');
            messageDiv.classList.add('message-error');
            messageDiv.style.display = 'block';
            return;
        }
    
        try {
            const response = await fetch(`/api/tournaments/${tournamentId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const result = await response.json(); // Odczytanie odpowiedzi z serwera
                messageDiv.textContent = result.message || 'Turniej został pomyślnie usunięty!';
                messageDiv.classList.remove('message-error', 'message-info', 'message-warning');
                messageDiv.classList.add('message-success');
                messageDiv.style.display = 'block';
    
                // Opcjonalnie: odświeżenie listy turniejów po usunięciu
                getTournaments();
            } else {
                const errorResult = await response.json();
                messageDiv.textContent = errorResult.message || 'Błąd podczas usuwania turnieju!';
                messageDiv.classList.remove('message-success', 'message-info', 'message-warning');
                messageDiv.classList.add('message-error');
                messageDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Błąd przy usuwaniu turnieju:', error);
            messageDiv.textContent = 'Błąd serwera!';
            messageDiv.classList.remove('message-success', 'message-info', 'message-warning');
            messageDiv.classList.add('message-error');
            messageDiv.style.display = 'block';
        }
    });
getTournaments();
});