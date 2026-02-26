const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Rolle = sequelize.define('Rolle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  farbe: {
    type: DataTypes.STRING(7),
    allowNull: false,
    defaultValue: '#6B7280',
    comment: 'Hex-Farbe für UI-Darstellung'
  },
  beschreibung: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'rollen',
  timestamps: true
});

module.exports = Rolle;
