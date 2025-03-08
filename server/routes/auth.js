    const express = require('express');
    const bcrypt = require('bcrypt');
    const db = require('../database'); // Połączenie z bazą danych
    const router = express.Router();

    router.post('/register', async (req, res) => {
        console.log('🔍 Otrzymane dane rejestracji:', req.body); // ✅ Sprawdź w terminalu
    
        const { username, email, password, role } = req.body;
    
        if (!username || !password || !email || !role) {
            return res.status(400).json({ message: 'Wszystkie pola są wymagane!' });
        }
    
        if (!['organizator', 'obserwator'].includes(role)) {
            return res.status(400).json({ message: 'Niepoprawna rola!' });
        }
    
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertRegister = 'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)';
            console.log(`SQL: ${insertRegister} | Wartości: [${username}, ${hashedPassword}, ${email}, ${role}]`);
    
            db.query(insertRegister, [username, hashedPassword, email, role], (err, results) => {
                if (err) {
                    console.error('❌ Błąd zapisu do bazy:', err.sqlMessage);
                    return res.status(500).json({ message: 'Podana nazwa użytkownika istnieje już w bazie danych!', error: err.sqlMessage });
                }
                res.status(201).json({ message: 'Rejestracja zakończona sukcesem!' });
            });
        } catch (error) {
            console.error('Błąd serwera:', error);
            res.status(500).json({ message: 'Błąd serwera' });
        }
    });
    // 📌 Logowanie użytkownika
    router.post('/login', async (req, res) => {
        const { username, password } = req.body;
    
        if (!username || !password) {
            return res.status(400).json({ message: 'Podaj login i hasło!' });
        }
    
        try {
            const query = 'SELECT * FROM users WHERE username = ?';
            db.query(query, [username], async (err, results) => {
                if (err) {
                    console.error('Błąd bazy danych:', err);
                    return res.status(500).json({ message: 'Błąd serwera' });
                }
    
                if (results.length === 0) {
                    return res.status(401).json({ message: 'Nieprawidłowe dane logowania!' });
                }
    
                const user = results[0];
                const isPasswordValid = await bcrypt.compare(password, user.password);
    
                if (!isPasswordValid) {
                    return res.status(401).json({ message: '<h5>Nieprawidłowe dane logowania!' });
                }
    
                res.status(200).json({ 
                    message: 'Logowanie udane!',
                    user: { id: user.id, username: user.username, email: user.email, role: user.role }
                });
            });
        } catch (error) {
            console.error('Błąd serwera:', error);
            res.status(500).json({ message: 'Błąd serwera' });
        }
    });
    
    


    module.exports = router;
