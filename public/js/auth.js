document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('role'); // Pobranie roli użytkownika
    const organizerId = localStorage.getItem('id');
    console.log('🔍 Rola użytkownika:', userRole); // Debugowanie
   


    if (userRole !== 'organizator') {
        console.log('ukrycie przycisów dla obserwatora'); // Debugowanie
        document.getElementById('nav-create-tournament')?.remove();
        document.getElementById('nav-publish-results')?.remove();
        document.getElementById('nav-organizer-dashboard')?.remove();
    }
    
    const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData);

        console.log('Wysyłane dane do rejestracji:', data);

        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            console.log('Odpowiedź serwera:', result);

            const messageElement = document.getElementById('registerMessage');
            messageElement.textContent = result.message;

            // Dodajemy odpowiednią klasę w zależności od odpowiedzi
            messageElement.classList.remove('message-success', 'message-error', 'message-info', 'message-warning');
            if (response.ok) {
                messageElement.classList.add('message-success');
            } else {
                messageElement.classList.add('message-error');
            }

        } catch (error) {
            console.error('Błąd rejestracji:', error);
            const messageElement = document.getElementById('registerMessage');
            messageElement.textContent = 'Błąd przy rejestracji!';
            messageElement.classList.remove('message-success', 'message-error', 'message-info', 'message-warning');
            messageElement.classList.add('message-error');
        }
    });
}

//Obsługa logowania
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData);

        if (!data.username || !data.password) {
            const messageElement = document.getElementById('loginMessage');
            messageElement.textContent = 'Proszę uzupełnić wszystkie pola.';
            messageElement.classList.remove('message-success', 'message-error', 'message-info', 'message-warning');
            messageElement.classList.add('message-error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            const messageElement = document.getElementById('loginMessage');
            messageElement.textContent = result.message;

            if (response.ok) {
                //dane użytkownika do localStorage
                localStorage.setItem('username', result.user.username);
                localStorage.setItem('role', result.user.role);
                localStorage.setItem('id', result.user.id);

                //komunikat o udanym logowaniu
                messageElement.textContent = 'Logowanie udane!';
                messageElement.classList.remove('message-error', 'message-info', 'message-warning');
                messageElement.classList.add('message-success');

               
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                messageElement.classList.remove('message-success', 'message-info', 'message-warning');
                messageElement.classList.add('message-error');
            }

        } catch (error) {
            const messageElement = document.getElementById('loginMessage');
            messageElement.textContent = 'Błąd logowania!';
            messageElement.classList.remove('message-success', 'message-error', 'message-info', 'message-warning');
            messageElement.classList.add('message-error');
            console.error('Błąd logowania:', error);
        }
    });
}


    // przycisk do wylogowania
    
    const logoutButton = document.getElementById('logoutButton');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            window.location.href = 'login.html';
        });
    }
    
});
document.getElementById('logo').addEventListener('click', () => {
    window.location.href = '/index.html';j
});