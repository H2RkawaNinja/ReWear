const express = require('express');
const { Op } = require('sequelize');
const { AktivitaetsLog, Mitarbeiter } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Aktivitätslog abrufen mit Filtern
router.get('/',
  authenticate,
  requirePermission('log.ansehen'),
  async (req, res) => {
    try {
      const { kategorie, mitarbeiter_id, zeitraum, seite = 1, limit = 50 } = req.query;

      const where = {};

      // Filter: Kategorie
      if (kategorie && kategorie !== 'alle') {
        where.kategorie = kategorie;
      }

      // Filter: Mitarbeiter
      if (mitarbeiter_id && mitarbeiter_id !== 'alle') {
        where.mitarbeiter_id = parseInt(mitarbeiter_id);
      }

      // Filter: Zeitraum
      if (zeitraum && zeitraum !== 'alle') {
        const jetzt = new Date();
        let von;

        if (zeitraum === 'heute') {
          von = new Date();
          von.setHours(0, 0, 0, 0);
        } else if (zeitraum === 'gestern') {
          von = new Date();
          von.setDate(von.getDate() - 1);
          von.setHours(0, 0, 0, 0);
          const bis = new Date();
          bis.setHours(0, 0, 0, 0);
          where.erstellt_am = { [Op.gte]: von, [Op.lt]: bis };
        } else if (zeitraum === 'woche') {
          von = new Date();
          von.setDate(von.getDate() - 7);
        } else if (zeitraum === 'monat') {
          von = new Date();
          von.setDate(1);
          von.setHours(0, 0, 0, 0);
        }

        if (von && !where.erstellt_am) {
          where.erstellt_am = { [Op.gte]: von };
        }
      }

      const offset = (parseInt(seite) - 1) * parseInt(limit);

      const { count, rows } = await AktivitaetsLog.findAndCountAll({
        where,
        order: [['erstellt_am', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        gesamt: count,
        seiten: Math.ceil(count / parseInt(limit)),
        aktuelleSeite: parseInt(seite),
        eintraege: rows
      });

    } catch (error) {
      console.error('Log abrufen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Mitarbeiter-Liste für Filter
router.get('/mitarbeiter',
  authenticate,
  requirePermission('log.ansehen'),
  async (req, res) => {
    try {
      const liste = await Mitarbeiter.findAll({
        attributes: ['id', 'vorname', 'nachname'],
        order: [['vorname', 'ASC']]
      });
      res.json(liste);
    } catch (error) {
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Alle Logs löschen
router.delete('/',
  authenticate,
  requirePermission('log.ansehen'),
  async (req, res) => {
    try {
      const anzahl = await AktivitaetsLog.destroy({ where: {}, truncate: true });
      res.json({ message: 'Alle Log-Einträge wurden gelöscht.', anzahl });
    } catch (error) {
      console.error('Log löschen Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

module.exports = router;
