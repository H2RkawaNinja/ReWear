const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const Mitarbeiter = sequelize.define('Mitarbeiter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  benutzername: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwort: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  vorname: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nachname: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Pfad zum Profilbild'
  },
  rollen_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rollen',
      key: 'id'
    }
  },
  aktiv: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  letzter_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  bankkonto: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Bankkonto beginnt immer mit LS'
  },
  bonus_prozent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 5.00,
    comment: 'Bonus in Prozent vom Verkaufspreis'
  },
  bonus_reset_am: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
    comment: 'Zeitstempel der letzten Bonus-Auszahlung'
  },
  setup_token: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: null,
    comment: 'Token für Erstpasswort-Einrichtung'
  },
  setup_token_expires: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
    comment: 'Ablaufzeit des Setup-Tokens'
  }
}, {
  tableName: 'mitarbeiter',
  timestamps: true,
  hooks: {
    beforeCreate: async (mitarbeiter) => {
      if (mitarbeiter.passwort) {
        mitarbeiter.passwort = await bcrypt.hash(mitarbeiter.passwort, 12);
      }
    },
    beforeUpdate: async (mitarbeiter) => {
      if (mitarbeiter.changed('passwort')) {
        mitarbeiter.passwort = await bcrypt.hash(mitarbeiter.passwort, 12);
      }
    }
  }
});

// Instanzmethode zum Passwort-Check
Mitarbeiter.prototype.checkPasswort = async function(passwort) {
  return await bcrypt.compare(passwort, this.passwort);
};

// Passwort aus JSON-Output entfernen
Mitarbeiter.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.passwort;
  delete values.setup_token;
  return values;
};

module.exports = Mitarbeiter;
