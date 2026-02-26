const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Recht = sequelize.define('Recht', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  schluessel: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Eindeutiger Schlüssel z.B. artikel.erstellen'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Anzeigename für UI'
  },
  beschreibung: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  kategorie: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'allgemein',
    comment: 'Gruppierung für UI'
  }
}, {
  tableName: 'rechte',
  timestamps: true
});

module.exports = Recht;
