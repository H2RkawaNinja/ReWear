const express = require('express');
const { Rolle, Recht, RolleRecht, Mitarbeiter } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Alle Rollen abrufen
router.get('/',
  authenticate,
  requirePermission('rollen.verwalten', 'mitarbeiter.ansehen'),
  async (req, res) => {
    try {
      const rollen = await Rolle.findAll({
        include: [{
          model: Recht,
          as: 'rechte'
        }],
        order: [['name', 'ASC']]
      });
      
      res.json(rollen);
      
    } catch (error) {
      console.error('Rollen abrufen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Einzelne Rolle abrufen
router.get('/:id',
  authenticate,
  requirePermission('rollen.verwalten'),
  async (req, res) => {
    try {
      const rolle = await Rolle.findByPk(req.params.id, {
        include: [{
          model: Recht,
          as: 'rechte'
        }]
      });
      
      if (!rolle) {
        return res.status(404).json({ error: 'Rolle nicht gefunden.' });
      }
      
      res.json(rolle);
      
    } catch (error) {
      console.error('Rolle abrufen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Neue Rolle erstellen
router.post('/',
  authenticate,
  requirePermission('rollen.verwalten'),
  async (req, res) => {
    try {
      const { name, farbe, beschreibung, rechte } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name ist erforderlich.' });
      }
      
      // Prüfen ob Name schon existiert
      const existiert = await Rolle.findOne({ where: { name } });
      if (existiert) {
        return res.status(400).json({ error: 'Eine Rolle mit diesem Namen existiert bereits.' });
      }
      
      const rolle = await Rolle.create({
        name,
        farbe: farbe || '#6B7280',
        beschreibung
      });
      
      // Rechte zuweisen wenn vorhanden
      if (rechte && Array.isArray(rechte) && rechte.length > 0) {
        const rechteInstanzen = await Recht.findAll({
          where: { id: rechte }
        });
        await rolle.setRechte(rechteInstanzen);
      }
      
      // Mit Rechten laden
      const rolleMitRechten = await Rolle.findByPk(rolle.id, {
        include: [{ model: Recht, as: 'rechte' }]
      });
      
      res.status(201).json(rolleMitRechten);
      
    } catch (error) {
      console.error('Rolle erstellen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Rolle aktualisieren
router.put('/:id',
  authenticate,
  requirePermission('rollen.verwalten'),
  async (req, res) => {
    try {
      const rolle = await Rolle.findByPk(req.params.id);
      
      if (!rolle) {
        return res.status(404).json({ error: 'Rolle nicht gefunden.' });
      }
      
      const { name, farbe, beschreibung, rechte } = req.body;
      
      // Name-Duplikat prüfen
      if (name && name !== rolle.name) {
        const existiert = await Rolle.findOne({ where: { name } });
        if (existiert) {
          return res.status(400).json({ error: 'Eine Rolle mit diesem Namen existiert bereits.' });
        }
      }
      
      await rolle.update({
        name: name || rolle.name,
        farbe: farbe || rolle.farbe,
        beschreibung: beschreibung !== undefined ? beschreibung : rolle.beschreibung
      });
      
      // Rechte aktualisieren wenn vorhanden
      if (rechte !== undefined && Array.isArray(rechte)) {
        const rechteInstanzen = await Recht.findAll({
          where: { id: rechte }
        });
        await rolle.setRechte(rechteInstanzen);
      }
      
      // Aktualisierte Rolle laden
      const aktualisiert = await Rolle.findByPk(rolle.id, {
        include: [{ model: Recht, as: 'rechte' }]
      });
      
      res.json(aktualisiert);
      
    } catch (error) {
      console.error('Rolle aktualisieren Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Rolle löschen
router.delete('/:id',
  authenticate,
  requirePermission('rollen.verwalten'),
  async (req, res) => {
    try {
      const rolle = await Rolle.findByPk(req.params.id);
      
      if (!rolle) {
        return res.status(404).json({ error: 'Rolle nicht gefunden.' });
      }
      
      // Prüfen ob Mitarbeiter diese Rolle haben
      const mitarbeiterAnzahl = await Mitarbeiter.count({
        where: { rollen_id: rolle.id }
      });
      
      if (mitarbeiterAnzahl > 0) {
        return res.status(400).json({
          error: `Rolle kann nicht gelöscht werden. ${mitarbeiterAnzahl} Mitarbeiter haben diese Rolle.`
        });
      }
      
      await rolle.destroy();
      
      res.json({ message: 'Rolle erfolgreich gelöscht.' });
      
    } catch (error) {
      console.error('Rolle löschen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

module.exports = router;
