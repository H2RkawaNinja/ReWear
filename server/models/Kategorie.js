const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Kategorie = sequelize.define('Kategorie', {
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
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'URL-freundlicher Name'
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Icon-Name für UI'
  },
  reihenfolge: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'kategorien',
  timestamps: true
});

module.exports = Kategorie;
