const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();



app.use(cors({
    origin: '*',  // Zezwalaj na zapytania z każdej domeny
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Zezwalaj na wszystkie metody HTTP
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Zezwalaj na wszystkie nagłówki
  }));



// Importowanie plików routingowych
const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/matches');
const resultsRoutes = require('./routes/results');
const teamsRoutes = require('./routes/teams');
const createTournamentRoutes = require('./routes/create-tournament');
const tournamentsRoutes = require('./routes/tournaments'); // Obsługa turniejów
const generateScheduleRoutes = require('./routes/generate-schedule'); // Nowy plik routingu


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Definiowanie tras
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/create-tournament', createTournamentRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/generate-schedule', generateScheduleRoutes);


// Start serwera
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
