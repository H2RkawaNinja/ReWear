const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RematchArtikel = sequelize.define('RematchArtikel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  outfit_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rematch_outfits',
      key: 'id'
    }
  },
  artikel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'artikel',
      key: 'id'
    }
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Reihenfolge im Outfit'
  }
}, {
  tableName: 'rematch_artikel',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['outfit_id', 'artikel_id']
    }
  ]
});

module.exports = RematchArtikel;
