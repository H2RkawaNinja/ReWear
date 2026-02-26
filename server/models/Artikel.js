const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Artikel = sequelize.define('Artikel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  beschreibung: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  kategorie_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'kategorien',
      key: 'id'
    }
  },
  geschlecht: {
    type: DataTypes.ENUM('Männlich', 'Weiblich', 'Unisex'),
    allowNull: false,
    defaultValue: 'Unisex'
  },
  ankaufspreis: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  verkaufspreis: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  bilder: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array von Bildpfaden'
  },
  status: {
    type: DataTypes.ENUM('verfuegbar', 'reserviert', 'verkauft'),
    allowNull: false,
    defaultValue: 'verfuegbar'
  },
  ist_vorlage: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Artikelstammdaten - Vorlage für Ankauf'
  },
  freigegeben: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Im öffentlichen Shop sichtbar'
  },
  angekauft_von: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'mitarbeiter', key: 'id' },
    comment: 'Mitarbeiter der den Artikel angekauft hat'
  },
  verkauft_von: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'mitarbeiter', key: 'id' },
    comment: 'Mitarbeiter der den Artikel verkauft hat'
  },
  verkauft_am: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'artikel',
  timestamps: true
});

module.exports = Artikel;
