const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RematchOutfit = sequelize.define('RematchOutfit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titel: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  beschreibung: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bild: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Hauptbild des Outfits'
  },
  aktiv: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Nur ein Outfit kann aktiv sein (wird angezeigt)'
  },
  erstellt_von: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'mitarbeiter',
      key: 'id'
    }
  },
  archiviert_am: {
    type: DataTypes.DATE,
    allowNull: true
  },
  gesamtpreis: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Gesamtpreis des Outfits'
  },
  woche_von: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Startdatum der Woche'
  },
  woche_bis: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Enddatum der Woche'
  }
}, {
  tableName: 'rematch_outfits',
  timestamps: true
});

module.exports = RematchOutfit;
