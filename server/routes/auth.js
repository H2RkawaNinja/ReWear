const express = require('express');
const jwt = require('jsonwebtoken');
const { Mitarbeiter, Rolle, Recht } = require('../models');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { benutzername, passwort } = req.body;
    
    if (!benutzername || !passwort) {
      return res.status(400).json({ error: 'Benutzername und Passwort erforderlich.' });
    }
    
    // Mitarbeiter suchen (per Benutzername oder Email)
    const mitarbeiter = await Mitarbeiter.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { benutzername },
          { email: benutzername }
        ]
      },
      include: [{
        model: Rolle,
        as: 'rolle',
        include: [{
          model: Recht,
          as: 'rechte'
        }]
      }]
    });
    
    if (!mitarbeiter) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten.' });
    }
    
    if (!mitarbeiter.aktiv) {
      return res.status(401).json({ error: 'Account ist deaktiviert.' });
    }
    
    // Passwort prüfen
    const isValid = await mitarbeiter.checkPasswort(passwort);
    if (!isValid) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten.' });
    }
    
    // Letzten Login aktualisieren
    await mitarbeiter.update({ letzter_login: new Date() });
    
    // Token erstellen
    const token = jwt.sign(
      { id: mitarbeiter.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Rechte extrahieren
    const rechte = mitarbeiter.rolle?.rechte?.map(r => r.schluessel) || [];
    
    res.json({
      message: 'Login erfolgreich!',
      token,
      mitarbeiter: {
        id: mitarbeiter.id,
        benutzername: mitarbeiter.benutzername,
        email: mitarbeiter.email,
        vorname: mitarbeiter.vorname,
        nachname: mitarbeiter.nachname,
        avatar: mitarbeiter.avatar,
        rolle: mitarbeiter.rolle?.name,
        rollenFarbe: mitarbeiter.rolle?.farbe
      },
      rechte
    });
    
  } catch (error) {
    console.error('Login Fehler:', error);
    res.status(500).json({ error: 'Serverfehler beim Login.' });
  }
});

// Aktuellen Benutzer abrufen
router.get('/me', require('../middleware/auth').authenticate, async (req, res) => {
  try {
    const rechte = req.mitarbeiter.rolle?.rechte?.map(r => r.schluessel) || [];
    
    res.json({
      mitarbeiter: {
        id: req.mitarbeiter.id,
        benutzername: req.mitarbeiter.benutzername,
        email: req.mitarbeiter.email,
        vorname: req.mitarbeiter.vorname,
        nachname: req.mitarbeiter.nachname,
        avatar: req.mitarbeiter.avatar,
        rolle: req.mitarbeiter.rolle?.name,
        rollenFarbe: req.mitarbeiter.rolle?.farbe
      },
      rechte
    });
  } catch (error) {
    console.error('Me Fehler:', error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// Passwort ändern
router.put('/passwort', require('../middleware/auth').authenticate, async (req, res) => {
  try {
    const { altesPasswort, neuesPasswort } = req.body;
    
    if (!altesPasswort || !neuesPasswort) {
      return res.status(400).json({ error: 'Altes und neues Passwort erforderlich.' });
    }
    
    if (neuesPasswort.length < 6) {
      return res.status(400).json({ error: 'Neues Passwort muss mindestens 6 Zeichen haben.' });
    }
    
    // Altes Passwort prüfen
    const mitarbeiter = await Mitarbeiter.findByPk(req.mitarbeiter.id);
    const isValid = await mitarbeiter.checkPasswort(altesPasswort);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Altes Passwort ist falsch.' });
    }
    
    // Neues Passwort setzen
    await mitarbeiter.update({ passwort: neuesPasswort });
    
    res.json({ message: 'Passwort erfolgreich geändert!' });
    
  } catch (error) {
    console.error('Passwort-Änderung Fehler:', error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// Setup-Token prüfen (GET) - gibt Mitarbeitername zurück
router.get('/setup/:token', async (req, res) => {
  try {
    const mitarbeiter = await Mitarbeiter.findOne({
      where: { setup_token: req.params.token }
    });

    if (!mitarbeiter) {
      return res.status(404).json({ error: 'Ungültiger oder bereits verwendeter Link.' });
    }

    if (new Date() > new Date(mitarbeiter.setup_token_expires)) {
      return res.status(410).json({ error: 'Dieser Link ist abgelaufen. Bitte einen Admin kontaktieren.' });
    }

    res.json({
      valid: true,
      name: `${mitarbeiter.vorname} ${mitarbeiter.nachname}`,
      benutzername: mitarbeiter.benutzername
    });
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// Passwort einrichten (POST)
router.post('/setup/:token', async (req, res) => {
  try {
    const { passwort, passwort_bestaetigung } = req.body;

    if (!passwort || !passwort_bestaetigung) {
      return res.status(400).json({ error: 'Passwort und Bestätigung sind erforderlich.' });
    }
    if (passwort !== passwort_bestaetigung) {
      return res.status(400).json({ error: 'Passwörter stimmen nicht überein.' });
    }
    if (passwort.length < 6) {
      return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen haben.' });
    }

    const mitarbeiter = await Mitarbeiter.findOne({
      where: { setup_token: req.params.token }
    });

    if (!mitarbeiter) {
      return res.status(404).json({ error: 'Ungültiger oder bereits verwendeter Link.' });
    }

    if (new Date() > new Date(mitarbeiter.setup_token_expires)) {
      return res.status(410).json({ error: 'Dieser Link ist abgelaufen. Bitte einen Admin kontaktieren.' });
    }

    // Passwort setzen, Account aktivieren, Token löschen
    await mitarbeiter.update({
      passwort,
      aktiv: true,
      setup_token: null,
      setup_token_expires: null
    });

    res.json({ message: 'Passwort erfolgreich gesetzt! Du kannst dich jetzt einloggen.' });
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

module.exports = router;
