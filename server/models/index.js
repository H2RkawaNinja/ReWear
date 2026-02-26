const sequelize = require('../config/db');

// Models importieren
const Rolle = require('./Rolle');
const Recht = require('./Recht');
const RolleRecht = require('./RolleRecht');
const Mitarbeiter = require('./Mitarbeiter');
const Kategorie = require('./Kategorie');
const Artikel = require('./Artikel');
const RematchOutfit = require('./RematchOutfit');
const RematchArtikel = require('./RematchArtikel');

// ==========================================
// RELATIONEN / ASSOCIATIONS
// ==========================================

// Rolle <-> Recht (Many-to-Many)
Rolle.belongsToMany(Recht, { 
  through: RolleRecht, 
  foreignKey: 'rollen_id',
  otherKey: 'recht_id',
  as: 'rechte'
});
Recht.belongsToMany(Rolle, { 
  through: RolleRecht, 
  foreignKey: 'recht_id',
  otherKey: 'rollen_id',
  as: 'rollen'
});

// Mitarbeiter -> Rolle (Many-to-One)
Mitarbeiter.belongsTo(Rolle, { 
  foreignKey: 'rollen_id', 
  as: 'rolle' 
});
Rolle.hasMany(Mitarbeiter, { 
  foreignKey: 'rollen_id', 
  as: 'mitarbeiter' 
});

// Artikel -> Kategorie (Many-to-One)
Artikel.belongsTo(Kategorie, { 
  foreignKey: 'kategorie_id', 
  as: 'kategorie' 
});
Kategorie.hasMany(Artikel, { 
  foreignKey: 'kategorie_id', 
  as: 'artikel' 
});

// Artikel -> Mitarbeiter (angekauft von)
Artikel.belongsTo(Mitarbeiter, { 
  foreignKey: 'angekauft_von', 
  as: 'ankaeufer' 
});
Mitarbeiter.hasMany(Artikel, { 
  foreignKey: 'angekauft_von', 
  as: 'angekaufte_artikel' 
});

// Artikel -> Mitarbeiter (verkauft von)
Artikel.belongsTo(Mitarbeiter, { 
  foreignKey: 'verkauft_von', 
  as: 'verkaeufer' 
});
Mitarbeiter.hasMany(Artikel, { 
  foreignKey: 'verkauft_von', 
  as: 'verkaufte_artikel' 
});

// RematchOutfit -> Mitarbeiter (erstellt von)
RematchOutfit.belongsTo(Mitarbeiter, { 
  foreignKey: 'erstellt_von', 
  as: 'ersteller' 
});
Mitarbeiter.hasMany(RematchOutfit, { 
  foreignKey: 'erstellt_von', 
  as: 'erstellte_outfits' 
});

// RematchOutfit <-> Artikel (Many-to-Many)
RematchOutfit.belongsToMany(Artikel, { 
  through: RematchArtikel, 
  foreignKey: 'outfit_id',
  otherKey: 'artikel_id',
  as: 'artikel'
});
Artikel.belongsToMany(RematchOutfit, { 
  through: RematchArtikel, 
  foreignKey: 'artikel_id',
  otherKey: 'outfit_id',
  as: 'outfits'
});

// Exportieren
module.exports = {
  sequelize,
  Rolle,
  Recht,
  RolleRecht,
  Mitarbeiter,
  Kategorie,
  Artikel,
  RematchOutfit,
  RematchArtikel
};
