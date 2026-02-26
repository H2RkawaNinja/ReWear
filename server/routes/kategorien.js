const express = require('express');
const { Kategorie, Artikel } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Alle Kategorien abrufen (öffentlich)
router.get('/', async (req, res) => {
  try {
    const kategorien = await Kategorie.findAll({
      order: [['reihenfolge', 'ASC'], ['name', 'ASC']],
      include: [{
        model: Artikel,
        as: 'artikel',
        attributes: ['id'],
        where: { status: 'verfuegbar' },
        required: false
      }]
    });
    
    // Anzahl der Artikel pro Kategorie hinzufügen
    const result = kategorien.map(k => ({
      id: k.id,
      name: k.name,
      slug: k.slug,
      icon: k.icon,
      reihenfolge: k.reihenfolge,
      artikelAnzahl: k.artikel?.length || 0
    }));
    
    res.json(result);
    
  } catch (error) {
    console.error('Kategorien abrufen Fehler:', error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// Einzelne Kategorie abrufen
router.get('/:id', async (req, res) => {
  try {
    const kategorie = await Kategorie.findByPk(req.params.id);
    
    if (!kategorie) {
      return res.status(404).json({ error: 'Kategorie nicht gefunden.' });
    }
    
    res.json(kategorie);
    
  } catch (error) {
    console.error('Kategorie abrufen Fehler:', error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// Neue Kategorie erstellen
router.post('/',
  authenticate,
  requirePermission('artikel.bearbeiten'),
  async (req, res) => {
    try {
      const { name, icon, reihenfolge } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name ist erforderlich.' });
      }
      
      // Slug generieren
      const slug = name
        .toLowerCase()
        .replace(/[äÄ]/g, 'ae')
        .replace(/[öÖ]/g, 'oe')
        .replace(/[üÜ]/g, 'ue')
        .replace(/[ß]/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Prüfen ob Slug schon existiert
      const existiert = await Kategorie.findOne({ where: { slug } });
      if (existiert) {
        return res.status(400).json({ error: 'Eine Kategorie mit diesem Namen existiert bereits.' });
      }
      
      const kategorie = await Kategorie.create({
        name,
        slug,
        icon,
        reihenfolge: reihenfolge || 0
      });
      
      res.status(201).json(kategorie);
      
    } catch (error) {
      console.error('Kategorie erstellen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Kategorie aktualisieren
router.put('/:id',
  authenticate,
  requirePermission('artikel.bearbeiten'),
  async (req, res) => {
    try {
      const kategorie = await Kategorie.findByPk(req.params.id);
      
      if (!kategorie) {
        return res.status(404).json({ error: 'Kategorie nicht gefunden.' });
      }
      
      const { name, icon, reihenfolge } = req.body;
      const updateData = {};
      
      if (name && name !== kategorie.name) {
        updateData.name = name;
        updateData.slug = name
          .toLowerCase()
          .replace(/[äÄ]/g, 'ae')
          .replace(/[öÖ]/g, 'oe')
          .replace(/[üÜ]/g, 'ue')
          .replace(/[ß]/g, 'ss')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      
      if (icon !== undefined) updateData.icon = icon;
      if (reihenfolge !== undefined) updateData.reihenfolge = reihenfolge;
      
      await kategorie.update(updateData);
      
      res.json(kategorie);
      
    } catch (error) {
      console.error('Kategorie aktualisieren Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Kategorie löschen
router.delete('/:id',
  authenticate,
  requirePermission('artikel.loeschen'),
  async (req, res) => {
    try {
      const kategorie = await Kategorie.findByPk(req.params.id);
      
      if (!kategorie) {
        return res.status(404).json({ error: 'Kategorie nicht gefunden.' });
      }
      
      // Prüfen ob Artikel in der Kategorie sind
      const artikelAnzahl = await Artikel.count({ 
        where: { kategorie_id: kategorie.id } 
      });
      
      if (artikelAnzahl > 0) {
        return res.status(400).json({ 
          error: `Kategorie kann nicht gelöscht werden. ${artikelAnzahl} Artikel sind noch zugeordnet.` 
        });
      }
      
      await kategorie.destroy();
      
      res.json({ message: 'Kategorie erfolgreich gelöscht.' });
      
    } catch (error) {
      console.error('Kategorie löschen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

module.exports = router;
