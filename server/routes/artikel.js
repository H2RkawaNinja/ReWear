const express = require('express');
const { Op } = require('sequelize');
const { Artikel, Kategorie, Mitarbeiter } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { logAktion } = require('../utils/logger');

const router = express.Router();

// ─── Artikelvorlagen (Stammdaten) ────────────────────────────────────────────

// Vorlagen abrufen (für Ankauf-Dropdown)
router.get('/vorlagen', authenticate, async (req, res) => {
  try {
    const vorlagen = await Artikel.findAll({
      where: { ist_vorlage: true },
      include: [{ model: Kategorie, as: 'kategorie', attributes: ['id', 'name'] }],
      order: [['name', 'ASC']]
    });
    res.json(vorlagen);
  } catch (error) {
    console.error('Vorlagen abrufen Fehler:', error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// Vorlage erstellen
router.post('/vorlagen', authenticate, requirePermission('artikel.erstellen'), async (req, res) => {
  try {
    const { name, kategorie_id, geschlecht, ankaufspreis, verkaufspreis } = req.body;
    if (!name || !kategorie_id) {
      return res.status(400).json({ error: 'Name und Kategorie sind erforderlich.' });
    }
    const vorlage = await Artikel.create({
      name,
      kategorie_id,
      geschlecht: geschlecht || 'Unisex',
      ankaufspreis: parseFloat(ankaufspreis) || 0,
      verkaufspreis: parseFloat(verkaufspreis) || 0,
      bilder: [],
      ist_vorlage: true,
      freigegeben: false,
      status: 'verfuegbar'
    });
    const mitRelationen = await Artikel.findByPk(vorlage.id, {
      include: [{ model: Kategorie, as: 'kategorie' }]
    });
    res.status(201).json(mitRelationen);
  } catch (error) {
    console.error('Vorlage erstellen Fehler:', error);
    res.status(500).json({ error: 'Serverfehler beim Erstellen.' });
  }
});

// Vorlage aktualisieren
router.put('/vorlagen/:id', authenticate, requirePermission('artikel.bearbeiten'), async (req, res) => {
  try {
    const vorlage = await Artikel.findOne({ where: { id: req.params.id, ist_vorlage: true } });
    if (!vorlage) return res.status(404).json({ error: 'Vorlage nicht gefunden.' });
    const { name, kategorie_id, geschlecht, ankaufspreis, verkaufspreis } = req.body;
    await vorlage.update({
      name: name || vorlage.name,
      kategorie_id: kategorie_id || vorlage.kategorie_id,
      geschlecht: geschlecht || vorlage.geschlecht,
      ankaufspreis: ankaufspreis !== undefined ? parseFloat(ankaufspreis) : vorlage.ankaufspreis,
      verkaufspreis: verkaufspreis !== undefined ? parseFloat(verkaufspreis) : vorlage.verkaufspreis
    });
    const aktualisiert = await Artikel.findByPk(vorlage.id, {
      include: [{ model: Kategorie, as: 'kategorie' }]
    });
    res.json(aktualisiert);
  } catch (error) {
    console.error('Vorlage aktualisieren Fehler:', error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// Vorlage löschen
router.delete('/vorlagen/:id', authenticate, requirePermission('artikel.loeschen'), async (req, res) => {
  try {
    const vorlage = await Artikel.findOne({ where: { id: req.params.id, ist_vorlage: true } });
    if (!vorlage) return res.status(404).json({ error: 'Vorlage nicht gefunden.' });
    await vorlage.destroy();
    res.json({ message: 'Vorlage erfolgreich gelöscht.' });
  } catch (error) {
    console.error('Vorlage löschen Fehler:', error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// ─── Angekaufte Artikel ───────────────────────────────────────────────────────

// Alle Artikel abrufen
router.get('/', async (req, res) => {
  try {
    const {
      kategorie,
      geschlecht,
      status,
      suche,
      seite = 1,
      limit = 20,
      sortierung = 'erstellt_am',
      richtung = 'DESC',
      admin
    } = req.query;

    // Vorlagen niemals im Sortiment zeigen
    const where = { ist_vorlage: false };

    // Öffentlich: nur freigegebene Artikel
    if (!admin) {
      where.freigegeben = true;
      where.status = status || 'verfuegbar';
    } else if (status) {
      where.status = status;
    }

    if (kategorie) where.kategorie_id = kategorie;
    if (geschlecht) where.geschlecht = geschlecht;

    if (suche) {
      where[Op.or] = [
        { name: { [Op.like]: `%${suche}%` } },
        { beschreibung: { [Op.like]: `%${suche}%` } }
      ];
    }

    const offset = (parseInt(seite) - 1) * parseInt(limit);

    const { count, rows: artikel } = await Artikel.findAndCountAll({
      where,
      include: [{
        model: Kategorie,
        as: 'kategorie',
        attributes: ['id', 'name', 'slug']
      }],
      order: [[sortierung, richtung.toUpperCase()]],
      limit: parseInt(limit),
      offset
    });

    res.json({
      artikel,
      pagination: {
        gesamt: count,
        seite: parseInt(seite),
        seiten: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Artikel abrufen Fehler:', error);
    res.status(500).json({ error: 'Serverfehler beim Abrufen der Artikel.' });
  }
});

// Einzelnen Artikel abrufen (öffentlich)
router.get('/:id', async (req, res) => {
  try {
    const artikel = await Artikel.findByPk(req.params.id, {
      include: [
        {
          model: Kategorie,
          as: 'kategorie',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Mitarbeiter,
          as: 'ankaeufer',
          attributes: ['id', 'vorname', 'nachname']
        }
      ]
    });
    
    if (!artikel) {
      return res.status(404).json({ error: 'Artikel nicht gefunden.' });
    }
    
    res.json(artikel);
    
  } catch (error) {
    console.error('Artikel abrufen Fehler:', error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// Ankauf: neuen Artikel anlegen
router.post('/',
  authenticate,
  requirePermission('artikel.erstellen', 'ankauf.durchfuehren'),
  upload.array('bilder', 5),
  handleUploadError,
  async (req, res) => {
    try {
      const { name, beschreibung, kategorie_id, geschlecht, ankaufspreis, verkaufspreis } = req.body;
      if (!name || !kategorie_id || !verkaufspreis) {
        return res.status(400).json({ error: 'Name, Kategorie und Verkaufspreis sind erforderlich.' });
      }
      const bilder = req.files?.map(f => `/uploads/artikel/${f.filename}`) || [];
      const artikel = await Artikel.create({
        name,
        beschreibung,
        kategorie_id,
        geschlecht: geschlecht || 'Unisex',
        ankaufspreis: parseFloat(ankaufspreis) || 0,
        verkaufspreis: parseFloat(verkaufspreis),
        bilder,
        ist_vorlage: false,
        freigegeben: false,
        angekauft_von: req.mitarbeiter.id
      });
      const artikelMitRelationen = await Artikel.findByPk(artikel.id, {
        include: [{ model: Kategorie, as: 'kategorie' }]
      });
      logAktion(`Artikel angekauft: ${artikel.name}`, 'Ankauf', req.mitarbeiter, { artikel_id: artikel.id });
      res.status(201).json(artikelMitRelationen);
    } catch (error) {
      console.error('Artikel erstellen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler beim Erstellen.' });
    }
  }
);

// Artikel aktualisieren
router.put('/:id',
  authenticate,
  requirePermission('artikel.bearbeiten'),
  upload.array('bilder', 5),
  handleUploadError,
  async (req, res) => {
    try {
      const artikel = await Artikel.findByPk(req.params.id);
      
      if (!artikel) {
        return res.status(404).json({ error: 'Artikel nicht gefunden.' });
      }
      
      const updateData = { ...req.body };
      
      // Neue Bilder hinzufügen
      if (req.files?.length > 0) {
        const neueBilder = req.files.map(f => `/uploads/artikel/${f.filename}`);
        updateData.bilder = [...(artikel.bilder || []), ...neueBilder];
      }
      
      // Preise parsen
      if (updateData.ankaufspreis) {
        updateData.ankaufspreis = parseFloat(updateData.ankaufspreis);
      }
      if (updateData.verkaufspreis) {
        updateData.verkaufspreis = parseFloat(updateData.verkaufspreis);
      }
      
      await artikel.update(updateData);
      
      const aktualisiert = await Artikel.findByPk(artikel.id, {
        include: [{ model: Kategorie, as: 'kategorie' }]
      });
      
      res.json(aktualisiert);
      
    } catch (error) {
      console.error('Artikel aktualisieren Fehler:', error);
      res.status(500).json({ error: 'Serverfehler beim Aktualisieren.' });
    }
  }
);

// Artikel löschen
router.delete('/:id',
  authenticate,
  requirePermission('artikel.loeschen'),
  async (req, res) => {
    try {
      const artikel = await Artikel.findByPk(req.params.id);
      
      if (!artikel) {
        return res.status(404).json({ error: 'Artikel nicht gefunden.' });
      }
      
      await artikel.destroy();
      logAktion(`Artikel gelöscht: ${artikel.name}`, 'Artikel', req.mitarbeiter, { artikel_id: req.params.id });
      res.json({ message: 'Artikel erfolgreich gelöscht.' });
      
    } catch (error) {
      console.error('Artikel löschen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler beim Löschen.' });
    }
  }
);

// Freischalten / Sperren
router.patch('/:id/freischalten',
  authenticate,
  requirePermission('artikel.bearbeiten'),
  async (req, res) => {
    try {
      const artikel = await Artikel.findByPk(req.params.id);
      if (!artikel) return res.status(404).json({ error: 'Artikel nicht gefunden.' });
      await artikel.update({ freigegeben: !artikel.freigegeben });
      res.json({ id: artikel.id, freigegeben: artikel.freigegeben });
    } catch (error) {
      console.error('Freischalten Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Artikel-Status ändern (verkauft, reserviert, etc.)
router.patch('/:id/status',
  authenticate,
  requirePermission('artikel.bearbeiten'),
  async (req, res) => {
    try {
      const { status } = req.body;
      const erlaubteStatus = ['verfuegbar', 'reserviert', 'verkauft'];
      
      if (!erlaubteStatus.includes(status)) {
        return res.status(400).json({ 
          error: 'Ungültiger Status. Erlaubt: ' + erlaubteStatus.join(', ') 
        });
      }
      
      const artikel = await Artikel.findByPk(req.params.id);
      
      if (!artikel) {
        return res.status(404).json({ error: 'Artikel nicht gefunden.' });
      }
      
      const updateData = { status };
      
      // Verkaufsdatum setzen wenn verkauft
      if (status === 'verkauft' && artikel.status !== 'verkauft') {
        updateData.verkauft_am = new Date();
      } else if (status !== 'verkauft') {
        updateData.verkauft_am = null;
      }
      
      await artikel.update(updateData);
      
      res.json(artikel);
      
    } catch (error) {
      console.error('Status ändern Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Artikel verkaufen (setzt verkauft_von + verkauft_am)
router.patch('/:id/verkaufen',
  authenticate,
  requirePermission('verkauf.durchfuehren'),
  async (req, res) => {
    try {
      const artikel = await Artikel.findByPk(req.params.id);

      if (!artikel) return res.status(404).json({ error: 'Artikel nicht gefunden.' });
      if (artikel.ist_vorlage) return res.status(400).json({ error: 'Vorlagen können nicht verkauft werden.' });
      if (artikel.status === 'verkauft') return res.status(400).json({ error: 'Artikel wurde bereits verkauft.' });

      await artikel.update({
        status: 'verkauft',
        verkauft_von: req.mitarbeiter.id,
        verkauft_am: new Date(),
        ...(req.body.verkaufspreis !== undefined && req.body.verkaufspreis !== ''
          ? { verkaufspreis: parseFloat(req.body.verkaufspreis) }
          : {})
      });

      const aktualisiert = await Artikel.findByPk(artikel.id, {
        include: [
          { model: Kategorie, as: 'kategorie', attributes: ['id', 'name'] },
          { model: Mitarbeiter, as: 'verkaeufer', attributes: ['id', 'vorname', 'nachname'] }
        ]
      });

      logAktion(`Artikel verkauft: ${artikel.name}`, 'Verkauf', req.mitarbeiter, { artikel_id: artikel.id });
      res.json(aktualisiert);
    } catch (error) {
      console.error('Verkaufen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Verkauf rückgängig machen
router.patch('/:id/verkauf-rueckgaengig',
  authenticate,
  requirePermission('verkauf.durchfuehren'),
  async (req, res) => {
    try {
      const artikel = await Artikel.findByPk(req.params.id);
      if (!artikel) return res.status(404).json({ error: 'Artikel nicht gefunden.' });
      if (artikel.status !== 'verkauft') return res.status(400).json({ error: 'Artikel ist nicht verkauft.' });

      await artikel.update({
        status: 'verfuegbar',
        verkauft_von: null,
        verkauft_am: null
      });

      res.json(artikel);
    } catch (error) {
      console.error('Verkauf-Rückgängig Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Bild von Artikel entfernen
router.delete('/:id/bilder/:index',
  authenticate,
  requirePermission('artikel.bearbeiten'),
  async (req, res) => {
    try {
      const artikel = await Artikel.findByPk(req.params.id);
      
      if (!artikel) {
        return res.status(404).json({ error: 'Artikel nicht gefunden.' });
      }
      
      const index = parseInt(req.params.index);
      const bilder = [...(artikel.bilder || [])];
      
      if (index < 0 || index >= bilder.length) {
        return res.status(400).json({ error: 'Ungültiger Bild-Index.' });
      }
      
      bilder.splice(index, 1);
      await artikel.update({ bilder });
      
      res.json({ message: 'Bild entfernt.', bilder });
      
    } catch (error) {
      console.error('Bild entfernen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

module.exports = router;
