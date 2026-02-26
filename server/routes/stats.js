const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const { Artikel, Kategorie, Mitarbeiter, RematchOutfit } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Übersichts-Statistiken
router.get('/',
  authenticate,
  requirePermission('dashboard.stats', 'statistiken.ansehen'),
  async (req, res) => {
    try {
      // Artikel-Statistiken (Vorlagen ausschließen)
      const nurArtikel = { ist_vorlage: false };
      const artikelGesamt = await Artikel.count({ where: nurArtikel });
      const artikelVerfuegbar = await Artikel.count({ where: { ...nurArtikel, status: 'verfuegbar' } });
      const artikelVerkauft = await Artikel.count({ where: { ...nurArtikel, status: 'verkauft' } });
      const artikelReserviert = await Artikel.count({ where: { ...nurArtikel, status: 'reserviert' } });
      
      // Wert-Statistiken
      const lagerWert = await Artikel.sum('verkaufspreis', {
        where: { ...nurArtikel, status: 'verfuegbar' }
      }) || 0;
      
      const ankaufsWert = await Artikel.sum('ankaufspreis', {
        where: { ...nurArtikel, status: 'verfuegbar' }
      }) || 0;
      
      // Verkaufs-Statistiken (diesen Monat)
      const ersterDesMonats = new Date();
      ersterDesMonats.setDate(1);
      ersterDesMonats.setHours(0, 0, 0, 0);

      // Verkaufs-Statistiken (dieses Jahr)
      const ersterDesJahres = new Date();
      ersterDesJahres.setMonth(0, 1);
      ersterDesJahres.setHours(0, 0, 0, 0);
      
      const verkauftDiesenMonat = await Artikel.count({
        where: {
          ...nurArtikel,
          status: 'verkauft',
          verkauft_am: { [Op.gte]: ersterDesMonats }
        }
      });
      
      const umsatzDiesenMonat = await Artikel.sum('verkaufspreis', {
        where: {
          ...nurArtikel,
          status: 'verkauft',
          verkauft_am: { [Op.gte]: ersterDesMonats }
        }
      }) || 0;

      const umsatzDiesesJahr = await Artikel.sum('verkaufspreis', {
        where: {
          ...nurArtikel,
          status: 'verkauft',
          verkauft_am: { [Op.gte]: ersterDesJahres }
        }
      }) || 0;

      const verkauftDiesesJahr = await Artikel.count({
        where: {
          ...nurArtikel,
          status: 'verkauft',
          verkauft_am: { [Op.gte]: ersterDesJahres }
        }
      });

      // Gesamtumsatz aller Zeiten
      const umsatzGesamt = await Artikel.sum('verkaufspreis', {
        where: { ...nurArtikel, status: 'verkauft' }
      }) || 0;

      // Gesamter Ankaufswert (nur verkaufte Artikel)
      const ankaufsWertVerkauft = await Artikel.sum('ankaufspreis', {
        where: { ...nurArtikel, status: 'verkauft' }
      }) || 0;

      const gesamtGewinn = umsatzGesamt - ankaufsWertVerkauft;
      const marge = umsatzGesamt > 0 ? ((gesamtGewinn / umsatzGesamt) * 100).toFixed(1) : '0.0';
      
      // Mitarbeiter-Statistiken
      const mitarbeiterGesamt = await Mitarbeiter.count();
      const mitarbeiterAktiv = await Mitarbeiter.count({ where: { aktiv: true } });
      
      // Kategorien-Statistiken
      const kategorienAnzahl = await Kategorie.count();
      
      // Re:Match Statistiken
      const rematchGesamt = await RematchOutfit.count();
      const rematchArchiviert = await RematchOutfit.count({
        where: { archiviert_am: { [Op.ne]: null } }
      });
      
      res.json({
        artikel: {
          gesamt: artikelGesamt,
          verfuegbar: artikelVerfuegbar,
          verkauft: artikelVerkauft,
          reserviert: artikelReserviert
        },
        werte: {
          lagerWert: parseFloat(lagerWert).toFixed(2),
          ankaufsWert: parseFloat(ankaufsWert).toFixed(2),
          potenziellerGewinn: parseFloat(lagerWert - ankaufsWert).toFixed(2)
        },
        monat: {
          verkauft: verkauftDiesenMonat,
          umsatz: parseFloat(umsatzDiesenMonat).toFixed(2)
        },
        jahr: {
          verkauft: verkauftDiesesJahr,
          umsatz: parseFloat(umsatzDiesesJahr).toFixed(2)
        },
        gesamt: {
          umsatz: parseFloat(umsatzGesamt).toFixed(2),
          gewinn: parseFloat(gesamtGewinn).toFixed(2),
          marge: marge
        },
        mitarbeiter: {
          gesamt: mitarbeiterGesamt,
          aktiv: mitarbeiterAktiv
        },
        kategorien: kategorienAnzahl,
        rematch: {
          gesamt: rematchGesamt,
          archiviert: rematchArchiviert,
          aktiv: rematchGesamt - rematchArchiviert
        }
      });
      
    } catch (error) {
      console.error('Statistiken Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Artikel pro Kategorie
router.get('/kategorien',
  authenticate,
  requirePermission('statistiken.ansehen'),
  async (req, res) => {
    try {
      const kategorien = await Kategorie.findAll({
        include: [{
          model: Artikel,
          as: 'artikel',
          attributes: ['id', 'status', 'verkaufspreis'],
          where: { ist_vorlage: false },
          required: false
        }]
      });
      
      const stats = kategorien.map(k => ({
        id: k.id,
        name: k.name,
        gesamt: k.artikel.length,
        verfuegbar: k.artikel.filter(a => a.status === 'verfuegbar').length,
        verkauft: k.artikel.filter(a => a.status === 'verkauft').length,
        wert: k.artikel
          .filter(a => a.status === 'verfuegbar')
          .reduce((sum, a) => sum + parseFloat(a.verkaufspreis), 0)
          .toFixed(2)
      }));
      
      res.json(stats);
      
    } catch (error) {
      console.error('Kategorien-Stats Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Verkäufe mit flexiblem Zeitraum
router.get('/verkaeufe',
  authenticate,
  requirePermission('statistiken.ansehen'),
  async (req, res) => {
    try {
      const zeitraum = req.query.zeitraum || '30d';

      let vonDatum = new Date();
      let groupFormat;

      switch (zeitraum) {
        case '7d':
          vonDatum.setDate(vonDatum.getDate() - 7);
          groupFormat = fn('DATE', col('verkauft_am'));
          break;
        case '3m':
          vonDatum.setMonth(vonDatum.getMonth() - 3);
          groupFormat = fn('DATE_FORMAT', col('verkauft_am'), '%Y-%u'); // Jahr-KW
          break;
        case '12m':
          vonDatum.setMonth(vonDatum.getMonth() - 12);
          groupFormat = fn('DATE_FORMAT', col('verkauft_am'), '%Y-%m');
          break;
        case 'all':
          vonDatum = new Date('2000-01-01');
          groupFormat = fn('DATE_FORMAT', col('verkauft_am'), '%Y-%m');
          break;
        default: // 30d
          vonDatum.setDate(vonDatum.getDate() - 30);
          groupFormat = fn('DATE', col('verkauft_am'));
      }

      const verkaeufe = await Artikel.findAll({
        where: {
          ist_vorlage: false,
          status: 'verkauft',
          verkauft_am: { [Op.gte]: vonDatum }
        },
        attributes: [
          [groupFormat, 'datum'],
          [fn('COUNT', col('id')), 'anzahl'],
          [fn('SUM', col('verkaufspreis')), 'umsatz'],
          [fn('SUM', col('ankaufspreis')), 'kosten']
        ],
        group: [groupFormat],
        order: [[groupFormat, 'ASC']]
      });

      res.json(verkaeufe);

    } catch (error) {
      console.error('Verkäufe-Stats Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Top Mitarbeiter (nach Ankäufen)
router.get('/mitarbeiter',
  authenticate,
  requirePermission('statistiken.ansehen'),
  async (req, res) => {
    try {
      const mitarbeiter = await Mitarbeiter.findAll({
        include: [
          {
            model: Artikel,
            as: 'angekaufte_artikel',
            attributes: ['id', 'verkaufspreis', 'verkauft_am', 'status'],
            where: { ist_vorlage: false },
            required: false
          },
          {
            model: Artikel,
            as: 'verkaufte_artikel',
            attributes: ['id', 'verkaufspreis', 'ankaufspreis', 'verkauft_am'],
            where: { ist_vorlage: false, status: 'verkauft' },
            required: false
          }
        ],
        attributes: ['id', 'vorname', 'nachname', 'avatar', 'bankkonto', 'bonus_prozent', 'bonus_reset_am']
      });

      const stats = mitarbeiter.map(m => {
        const resetDatum = m.bonus_reset_am ? new Date(m.bonus_reset_am) : null;
        const bonus_p = parseFloat(m.bonus_prozent) / 100;

        // Verkauf-Bonus: Artikel die dieser MA verkauft hat (nach reset)
        const relevanteVerkaeufe = (m.verkaufte_artikel || []).filter(a =>
          !resetDatum || new Date(a.verkauft_am) > resetDatum
        );
        const umsatzVerkauf = relevanteVerkaeufe.reduce((s, a) => s + parseFloat(a.verkaufspreis), 0);

        // Ankauf-Bonus: Artikel die dieser MA angekauft hat und die verkauft wurden (nach reset)
        const ankaufBonusArtikel = (m.angekaufte_artikel || []).filter(a =>
          a.status === 'verkauft' &&
          a.verkauft_am &&
          (!resetDatum || new Date(a.verkauft_am) > resetDatum)
        );
        const umsatzAnkauf = ankaufBonusArtikel.reduce((s, a) => s + parseFloat(a.verkaufspreis), 0);

        const bonus = (umsatzVerkauf + umsatzAnkauf) * bonus_p;

        return {
          id: m.id,
          name: `${m.vorname} ${m.nachname}`,
          avatar: m.avatar,
          bankkonto: m.bankkonto,
          bonus_prozent: parseFloat(m.bonus_prozent),
          bonus_reset_am: m.bonus_reset_am,
          ankaufe: (m.angekaufte_artikel || []).length,
          verkaeufe: relevanteVerkaeufe.length,
          umsatz: umsatzVerkauf.toFixed(2),
          bonus: bonus.toFixed(2),
          bonus_aus_verkauf: (umsatzVerkauf * bonus_p).toFixed(2),
          bonus_aus_ankauf: (umsatzAnkauf * bonus_p).toFixed(2)
        };
      }).sort((a, b) => b.verkaeufe - a.verkaeufe);

      res.json(stats);
    } catch (error) {
      console.error('Mitarbeiter-Stats Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

// Eigene Stats (jeder Mitarbeiter sieht seine eigenen)
router.get('/meine',
  authenticate,
  async (req, res) => {
    try {
      const ich = await Mitarbeiter.findByPk(req.mitarbeiter.id, {
        attributes: ['id', 'vorname', 'nachname', 'bankkonto', 'bonus_prozent', 'bonus_reset_am'],
        include: [
          {
            model: Artikel,
            as: 'angekaufte_artikel',
            attributes: ['id', 'name', 'ankaufspreis', 'verkaufspreis', 'status', 'verkauft_am', 'erstellt_am'],
            where: { ist_vorlage: false },
            required: false
          },
          {
            model: Artikel,
            as: 'verkaufte_artikel',
            attributes: ['id', 'name', 'verkaufspreis', 'ankaufspreis', 'verkauft_am'],
            where: { ist_vorlage: false, status: 'verkauft' },
            required: false
          }
        ]
      });

      const angekaufte = ich.angekaufte_artikel || [];
      const alleVerkaufte = ich.verkaufte_artikel || [];
      const resetDatum = ich.bonus_reset_am ? new Date(ich.bonus_reset_am) : null;
      const bonus_p = parseFloat(ich.bonus_prozent) / 100;

      // Verkauf-Bonus: Verkäufe seit letzter Auszahlung
      const relevanteVerkaeufe = alleVerkaufte.filter(a =>
        !resetDatum || new Date(a.verkauft_am) > resetDatum
      );
      const umsatzVerkauf = relevanteVerkaeufe.reduce((s, a) => s + parseFloat(a.verkaufspreis), 0);
      const bonusAusVerkauf = umsatzVerkauf * bonus_p;

      // Ankauf-Bonus: Angekaufte Artikel die verkauft wurden (nach reset)
      const ankaufBonusArtikel = angekaufte.filter(a =>
        a.status === 'verkauft' &&
        a.verkauft_am &&
        (!resetDatum || new Date(a.verkauft_am) > resetDatum)
      );
      const umsatzAnkauf = ankaufBonusArtikel.reduce((s, a) => s + parseFloat(a.verkaufspreis), 0);
      const bonusAusAnkauf = umsatzAnkauf * bonus_p;

      const bonusGesamt = bonusAusVerkauf + bonusAusAnkauf;
      const umsatzGesamt = umsatzVerkauf; // Umsatz = verkaufte Artikel

      // Diesen Monat
      const ersterDesMonats = new Date();
      ersterDesMonats.setDate(1); ersterDesMonats.setHours(0, 0, 0, 0);
      const verkaufteMonat = alleVerkaufte.filter(a => new Date(a.verkauft_am) >= ersterDesMonats);
      const ankaufMonat = angekaufte.filter(a =>
        a.status === 'verkauft' && a.verkauft_am && new Date(a.verkauft_am) >= ersterDesMonats
      );
      const umsatzMonat = verkaufteMonat.reduce((s, a) => s + parseFloat(a.verkaufspreis), 0);
      const bonusMonat = (umsatzMonat + ankaufMonat.reduce((s, a) => s + parseFloat(a.verkaufspreis), 0)) * bonus_p;

      res.json({
        mitarbeiter: {
          id: ich.id,
          name: `${ich.vorname} ${ich.nachname}`,
          bankkonto: ich.bankkonto,
          bonus_prozent: parseFloat(ich.bonus_prozent)
        },
        gesamt: {
          ankaufe: angekaufte.length,
          verkaeufe: relevanteVerkaeufe.length,
          umsatz: umsatzGesamt.toFixed(2),
          bonus: bonusGesamt.toFixed(2),
          bonus_aus_verkauf: bonusAusVerkauf.toFixed(2),
          bonus_aus_ankauf: bonusAusAnkauf.toFixed(2)
        },
        monat: {
          verkaeufe: verkaufteMonat.length,
          umsatz: umsatzMonat.toFixed(2),
          bonus: bonusMonat.toFixed(2)
        },
        letzte_verkaeufe: alleVerkaufte
          .sort((a, b) => new Date(b.verkauft_am) - new Date(a.verkauft_am))
          .slice(0, 10)
      });
    } catch (error) {
      console.error('Eigene Stats Fehler:', error);
      res.status(500).json({ error: 'Serverfehler.' });
    }
  }
);

module.exports = router;
