const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Einstellung = sequelize.define('Einstellung', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  schluessel: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  wert: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  beschreibung: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'einstellungen',
  timestamps: true
});

module.exports = Einstellung;
