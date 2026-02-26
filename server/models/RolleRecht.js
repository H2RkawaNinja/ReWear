const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RolleRecht = sequelize.define('RolleRecht', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rollen_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rollen',
      key: 'id'
    }
  },
  recht_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rechte',
      key: 'id'
    }
  }
}, {
  tableName: 'rollen_rechte',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['rollen_id', 'recht_id']
    }
  ]
});

module.exports = RolleRecht;
