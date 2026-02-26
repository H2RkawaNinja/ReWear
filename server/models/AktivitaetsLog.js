const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AktivitaetsLog = sequelize.define('AktivitaetsLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  aktion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  kategorie: {
    type: DataTypes.ENUM('Artikel', 'Ankauf', 'Verkauf', 'Auth', 'Mitarbeiter', 'Rollen', 'Rematch', 'System'),
    allowNull: false,
    defaultValue: 'System'
  },
  mitarbeiter_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Denormalisiert – bleibt erhalten auch wenn Mitarbeiter gelöscht wird
  mitarbeiter_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'aktivitaetslog',
  timestamps: true,
  createdAt: 'erstellt_am',
  updatedAt: false
});

module.exports = AktivitaetsLog;
