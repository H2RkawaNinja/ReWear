const express = require('express');
const crypto = require('crypto');
const { Mitarbeiter, Rolle, Recht } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { logAktion } = require('../utils/logger');

const router = express.Router();

// Alle Mitarbeiter abrufen
router.get('/',
  authenticate,
  requirePermission('mitarbeiter.ansehen', 'mitarbeiter.verwalten'),
  async (req, res) => {
    try {
      const mitarbeiter = await Mitarbeiter.findAll({
        include: [{
          model: Rolle,
          as: 'rolle',
          attributes: ['id', 'name', 'farbe']
        }],
        order: [['vorname', 'ASC'], ['nachname', 'ASC']]
      });
      
      res.json(mitarbeiter);
      
    } catch (error) {
      console.error('Mitarbeiter abrufen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Einzelnen Mitarbeiter abrufen
router.get('/:id',
  authenticate,
  requirePermission('mitarbeiter.ansehen', 'mitarbeiter.verwalten'),
  async (req, res) => {
    try {
      const mitarbeiter = await Mitarbeiter.findByPk(req.params.id, {
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
        return res.status(404).json({ error: 'Mitarbeiter nicht gefunden.' });
      }
      
      res.json(mitarbeiter);
      
    } catch (error) {
      console.error('Mitarbeiter abrufen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Neuen Mitarbeiter erstellen
router.post('/',
  authenticate,
  requirePermission('mitarbeiter.verwalten'),
  upload.single('avatar'),
  handleUploadError,
  async (req, res) => {
    try {
      const { benutzername, email, vorname, nachname, rollen_id, bankkonto, bonus_prozent } = req.body;
      
      // Validierung
      if (!benutzername || !email || !vorname || !nachname || !rollen_id) {
        return res.status(400).json({ 
          error: 'Alle Felder sind erforderlich: benutzername, email, vorname, nachname, rollen_id' 
        });
      }

      // Bankkonto muss mit LS beginnen
      if (bankkonto && !bankkonto.startsWith('LS')) {
        return res.status(400).json({ error: 'Bankkonto muss mit LS beginnen.' });
      }
      
      // Prüfen ob Benutzername/Email schon existiert
      const existiert = await Mitarbeiter.findOne({
        where: {
          [require('sequelize').Op.or]: [
            { benutzername },
            { email }
          ]
        }
      });
      
      if (existiert) {
        return res.status(400).json({ error: 'Benutzername oder Email bereits vergeben.' });
      }
      
      // Rolle prüfen
      const rolle = await Rolle.findByPk(rollen_id);
      if (!rolle) {
        return res.status(400).json({ error: 'Ungültige Rolle.' });
      }

      // Setup-Token generieren (läuft in 72 Stunden ab)
      const setupToken = crypto.randomBytes(32).toString('hex');
      const setupExpires = new Date(Date.now() + 72 * 60 * 60 * 1000);
      
      const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;
      
      const mitarbeiter = await Mitarbeiter.create({
        benutzername,
        email,
        passwort: crypto.randomBytes(32).toString('hex'), // Platzhalter - wird durch Setup ersetzt
        vorname,
        nachname,
        rollen_id,
        avatar,
        bankkonto: bankkonto || null,
        bonus_prozent: bonus_prozent ? parseFloat(bonus_prozent) : 5.00,
        aktiv: false, // Inaktiv bis Passwort gesetzt
        setup_token: setupToken,
        setup_token_expires: setupExpires
      });
      
      // Mit Rolle laden
      const mitRolle = await Mitarbeiter.findByPk(mitarbeiter.id, {
        include: [{ model: Rolle, as: 'rolle' }]
      });

      // Setup-Link im Response zurückgeben
      logAktion(`Mitarbeiter angelegt: ${mitarbeiter.vorname} ${mitarbeiter.nachname}`, 'Mitarbeiter', req.mitarbeiter, { mitarbeiter_id: mitarbeiter.id });
      res.status(201).json({
        ...mitRolle.toJSON(),
        setup_token: setupToken // Nur bei Erstellung zurückgeben
      });
      
    } catch (error) {
      console.error('Mitarbeiter erstellen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler beim Erstellen.' });
    }
  }
);

// Mitarbeiter aktualisieren
router.put('/:id',
  authenticate,
  requirePermission('mitarbeiter.verwalten'),
  upload.single('avatar'),
  handleUploadError,
  async (req, res) => {
    try {
      const mitarbeiter = await Mitarbeiter.findByPk(req.params.id);
      
      if (!mitarbeiter) {
        return res.status(404).json({ error: 'Mitarbeiter nicht gefunden.' });
      }
      
      const updateData = { ...req.body };
      
      // Bankkonto muss mit LS beginnen
      if (updateData.bankkonto && !updateData.bankkonto.startsWith('LS')) {
        return res.status(400).json({ error: 'Bankkonto muss mit LS beginnen.' });
      }

      // Passwort nur aktualisieren wenn explizit gesetzt und nicht leer
      if (!updateData.passwort || updateData.passwort === '') {
        delete updateData.passwort;
      }
      
      // Avatar
      if (req.file) {
        updateData.avatar = `/uploads/avatars/${req.file.filename}`;
      }
      
      await mitarbeiter.update(updateData);
      
      const aktualisiert = await Mitarbeiter.findByPk(mitarbeiter.id, {
        include: [{ model: Rolle, as: 'rolle' }]
      });
      
      res.json(aktualisiert);
      
    } catch (error) {
      console.error('Mitarbeiter aktualisieren Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Bonus auszahlen (reset bonus_reset_am auf jetzt)
router.post('/:id/auszahlen',
  authenticate,
  requirePermission('mitarbeiter.verwalten'),
  async (req, res) => {
    try {
      const mitarbeiter = await Mitarbeiter.findByPk(req.params.id);

      if (!mitarbeiter) {
        return res.status(404).json({ error: 'Mitarbeiter nicht gefunden.' });
      }

      await mitarbeiter.update({ bonus_reset_am: new Date() });

      res.json({ message: 'Bonus wurde als ausgezahlt markiert.', bonus_reset_am: mitarbeiter.bonus_reset_am });
    } catch (error) {
      console.error('Auszahlen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Mitarbeiter (de)aktivieren
router.patch('/:id/status',
  authenticate,
  requirePermission('mitarbeiter.verwalten'),
  async (req, res) => {
    try {
      const { aktiv } = req.body;
      
      const mitarbeiter = await Mitarbeiter.findByPk(req.params.id);
      
      if (!mitarbeiter) {
        return res.status(404).json({ error: 'Mitarbeiter nicht gefunden.' });
      }
      
      // Sich selbst nicht deaktivieren
      if (mitarbeiter.id === req.mitarbeiter.id && aktiv === false) {
        return res.status(400).json({ error: 'Du kannst dich nicht selbst deaktivieren.' });
      }
      
      await mitarbeiter.update({ aktiv });
      
      res.json({ 
        message: aktiv ? 'Mitarbeiter aktiviert.' : 'Mitarbeiter deaktiviert.',
        mitarbeiter
      });
      
    } catch (error) {
      console.error('Status ändern Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Mitarbeiter löschen
router.delete('/:id',
  authenticate,
  requirePermission('mitarbeiter.verwalten'),
  async (req, res) => {
    try {
      const mitarbeiter = await Mitarbeiter.findByPk(req.params.id);
      
      if (!mitarbeiter) {
        return res.status(404).json({ error: 'Mitarbeiter nicht gefunden.' });
      }
      
      // Sich selbst nicht löschen
      if (mitarbeiter.id === req.mitarbeiter.id) {
        return res.status(400).json({ error: 'Du kannst dich nicht selbst löschen.' });
      }
      
      await mitarbeiter.destroy();
      logAktion(`Mitarbeiter gelöscht: ${mitarbeiter.vorname} ${mitarbeiter.nachname}`, 'Mitarbeiter', req.mitarbeiter, { mitarbeiter_id: mitarbeiter.id });
      res.json({ message: 'Mitarbeiter erfolgreich gelöscht.' });
      
    } catch (error) {
      console.error('Mitarbeiter löschen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

module.exports = router;
