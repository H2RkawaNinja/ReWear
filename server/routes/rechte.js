const express = require('express');
const { Recht } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Alle Rechte abrufen
router.get('/',
  authenticate,
  requirePermission('rollen.verwalten'),
  async (req, res) => {
    try {
      const rechte = await Recht.findAll({
        order: [['kategorie', 'ASC'], ['name', 'ASC']]
      });
      
      // Nach Kategorien gruppieren
      const gruppiert = rechte.reduce((acc, recht) => {
        const kategorie = recht.kategorie;
        if (!acc[kategorie]) {
          acc[kategorie] = [];
        }
        acc[kategorie].push(recht);
        return acc;
      }, {});
      
      res.json({
        rechte,
        gruppiert
      });
      
    } catch (error) {
      console.error('Rechte abrufen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

module.exports = router;
