const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();



// Pozwól na zapytania tylko z Twojego frontendu na Render
const allowedOrigins = ['https://aplikacja-teamup.onrender.com', 'http://localhost:3001'];




// Konfiguracja CORS
app.use(cors({
  origin: allowedOrigins,   // Tylko te domeny mają dostęp do backendu
  methods: ['GET', 'POST'],  // Dopuszczone metody HTTP
  allowedHeaders: ['Content-Type', 'Authorization'], // Dopuszczone nagłówki
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
