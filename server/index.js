const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/db');

// Models importieren (für Sync)
require('./models');

// Routes importieren
const authRoutes = require('./routes/auth');
const artikelRoutes = require('./routes/artikel');
const kategorienRoutes = require('./routes/kategorien');
const mitarbeiterRoutes = require('./routes/mitarbeiter');
const rollenRoutes = require('./routes/rollen');
const rechteRoutes = require('./routes/rechte');
const rematchRoutes = require('./routes/rematch');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statische Dateien (Uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/artikel', artikelRoutes);
app.use('/api/kategorien', kategorienRoutes);
app.use('/api/mitarbeiter', mitarbeiterRoutes);
app.use('/api/rollen', rollenRoutes);
app.use('/api/rechte', rechteRoutes);
app.use('/api/rematch', rematchRoutes);
app.use('/api/stats', statsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ReWear API läuft!' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Etwas ist schief gelaufen!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route nicht gefunden' });
});

// Datenbank verbinden und Server starten
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Verbindung erfolgreich!');
    
    // Tabellen synchronisieren (in Produktion: Migrations verwenden)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Datenbank synchronisiert!');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 ReWear Server läuft auf Port ${PORT}`);
      console.log(`📦 API verfügbar unter: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Datenbankverbindung fehlgeschlagen:', error);
    process.exit(1);
  }
};

startServer();
