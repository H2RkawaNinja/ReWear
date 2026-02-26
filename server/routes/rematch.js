const express = require('express');
const { RematchOutfit, RematchArtikel, Artikel, Kategorie, Mitarbeiter } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Aktives Outfit abrufen (öffentlich - für Startseite)
router.get('/aktiv', async (req, res) => {
  try {
    const outfit = await RematchOutfit.findOne({
      where: { aktiv: true },
      include: [{
        model: Artikel,
        as: 'artikel',
        include: [{
          model: Kategorie,
          as: 'kategorie'
        }]
      }, {
        model: Mitarbeiter,
        as: 'ersteller',
        attributes: ['id', 'vorname', 'nachname']
      }],
      order: [[{ model: Artikel, as: 'artikel' }, RematchArtikel, 'position', 'ASC']]
    });
    
    if (!outfit) {
      return res.status(404).json({ error: 'Kein aktives Outfit gefunden.' });
    }
    
    res.json(outfit);
    
  } catch (error) {
    console.error('Aktives Outfit abrufen Fehler:', error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// Alle Outfits abrufen (Admin)
router.get('/',
  authenticate,
  requirePermission('rematch.verwalten'),
  async (req, res) => {
    try {
      const { archiviert } = req.query;
      
      const where = {};
      if (archiviert === 'true') {
        where.archiviert_am = { [require('sequelize').Op.ne]: null };
      } else if (archiviert === 'false') {
        where.archiviert_am = null;
      }
      
      const outfits = await RematchOutfit.findAll({
        where,
        include: [{
          model: Artikel,
          as: 'artikel',
          attributes: ['id', 'name', 'bilder']
        }, {
          model: Mitarbeiter,
          as: 'ersteller',
          attributes: ['id', 'vorname', 'nachname']
        }],
        order: [['erstellt_am', 'DESC']]
      });
      
      res.json(outfits);
      
    } catch (error) {
      console.error('Outfits abrufen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Einzelnes Outfit abrufen
router.get('/:id',
  authenticate,
  requirePermission('rematch.verwalten'),
  async (req, res) => {
    try {
      const outfit = await RematchOutfit.findByPk(req.params.id, {
        include: [{
          model: Artikel,
          as: 'artikel',
          include: [{ model: Kategorie, as: 'kategorie' }]
        }, {
          model: Mitarbeiter,
          as: 'ersteller',
          attributes: ['id', 'vorname', 'nachname']
        }],
        order: [[{ model: Artikel, as: 'artikel' }, RematchArtikel, 'position', 'ASC']]
      });
      
      if (!outfit) {
        return res.status(404).json({ error: 'Outfit nicht gefunden.' });
      }
      
      res.json(outfit);
      
    } catch (error) {
      console.error('Outfit abrufen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Neues Outfit erstellen
router.post('/',
  authenticate,
  requirePermission('rematch.verwalten'),
  upload.single('bild'),
  handleUploadError,
  async (req, res) => {
    try {
      const { titel, beschreibung, gesamtpreis, woche_von, woche_bis, artikel } = req.body;
      
      if (!titel) {
        return res.status(400).json({ error: 'Titel ist erforderlich.' });
      }
      
      const bild = req.file ? `/uploads/rematch/${req.file.filename}` : null;
      
      const outfit = await RematchOutfit.create({
        titel,
        beschreibung,
        gesamtpreis: gesamtpreis || null,
        bild,
        woche_von,
        woche_bis,
        erstellt_von: req.mitarbeiter.id
      });
      
      // Artikel hinzufügen wenn vorhanden
      if (artikel) {
        const artikelIds = JSON.parse(artikel);
        for (let i = 0; i < artikelIds.length; i++) {
          await RematchArtikel.create({
            outfit_id: outfit.id,
            artikel_id: artikelIds[i],
            position: i
          });
        }
      }
      
      // Mit Relationen laden
      const outfitMitRelationen = await RematchOutfit.findByPk(outfit.id, {
        include: [{
          model: Artikel,
          as: 'artikel'
        }]
      });
      
      res.status(201).json(outfitMitRelationen);
      
    } catch (error) {
      console.error('Outfit erstellen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Outfit aktualisieren
router.put('/:id',
  authenticate,
  requirePermission('rematch.verwalten'),
  upload.single('bild'),
  handleUploadError,
  async (req, res) => {
    try {
      const outfit = await RematchOutfit.findByPk(req.params.id);
      
      if (!outfit) {
        return res.status(404).json({ error: 'Outfit nicht gefunden.' });
      }
      
      const updateData = { ...req.body };
      
      if (req.file) {
        updateData.bild = `/uploads/rematch/${req.file.filename}`;
      }
      
      // Artikel separat behandeln
      delete updateData.artikel;
      
      await outfit.update(updateData);
      
      // Artikel aktualisieren wenn vorhanden
      if (req.body.artikel) {
        const artikelIds = JSON.parse(req.body.artikel);
        
        // Alte Verknüpfungen löschen
        await RematchArtikel.destroy({ where: { outfit_id: outfit.id } });
        
        // Neue Verknüpfungen erstellen
        for (let i = 0; i < artikelIds.length; i++) {
          await RematchArtikel.create({
            outfit_id: outfit.id,
            artikel_id: artikelIds[i],
            position: i
          });
        }
      }
      
      const aktualisiert = await RematchOutfit.findByPk(outfit.id, {
        include: [{ model: Artikel, as: 'artikel' }]
      });
      
      res.json(aktualisiert);
      
    } catch (error) {
      console.error('Outfit aktualisieren Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Outfit aktivieren (deaktiviert alle anderen)
router.patch('/:id/aktivieren',
  authenticate,
  requirePermission('rematch.verwalten'),
  async (req, res) => {
    try {
      const outfit = await RematchOutfit.findByPk(req.params.id);
      
      if (!outfit) {
        return res.status(404).json({ error: 'Outfit nicht gefunden.' });
      }
      
      // Alle anderen deaktivieren
      await RematchOutfit.update(
        { aktiv: false },
        { where: {} }
      );
      
      // Dieses aktivieren
      await outfit.update({ aktiv: true });
      
      res.json({ message: 'Outfit aktiviert!', outfit });
      
    } catch (error) {
      console.error('Outfit aktivieren Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Outfit archivieren (manuell)
router.patch('/:id/archivieren',
  authenticate,
  requirePermission('rematch.verwalten'),
  async (req, res) => {
    try {
      const outfit = await RematchOutfit.findByPk(req.params.id);
      
      if (!outfit) {
        return res.status(404).json({ error: 'Outfit nicht gefunden.' });
      }
      
      await outfit.update({
        aktiv: false,
        archiviert_am: new Date()
      });
      
      res.json({ message: 'Outfit archiviert!', outfit });
      
    } catch (error) {
      console.error('Outfit archivieren Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Outfit löschen
router.delete('/:id',
  authenticate,
  requirePermission('rematch.verwalten'),
  async (req, res) => {
    try {
      const outfit = await RematchOutfit.findByPk(req.params.id);
      
      if (!outfit) {
        return res.status(404).json({ error: 'Outfit nicht gefunden.' });
      }
      
      // Verknüpfungen löschen
      await RematchArtikel.destroy({ where: { outfit_id: outfit.id } });
      
      await outfit.destroy();
      
      res.json({ message: 'Outfit erfolgreich gelöscht.' });
      
    } catch (error) {
      console.error('Outfit löschen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

module.exports = router;
