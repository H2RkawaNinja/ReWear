const { Rolle, Recht, RolleRecht, Mitarbeiter, Kategorie } = require('../models');
const sequelize = require('../config/db');

// Vordefinierte Rechte
const RECHTE = [
  // Artikel
  { schluessel: 'artikel.ansehen', name: 'Artikel ansehen', beschreibung: 'Kann alle Artikel im Admin-Bereich sehen', kategorie: 'Artikel' },
  { schluessel: 'artikel.erstellen', name: 'Artikel erstellen', beschreibung: 'Kann neue Artikel anlegen', kategorie: 'Artikel' },
  { schluessel: 'artikel.bearbeiten', name: 'Artikel bearbeiten', beschreibung: 'Kann bestehende Artikel bearbeiten', kategorie: 'Artikel' },
  { schluessel: 'artikel.loeschen', name: 'Artikel löschen', beschreibung: 'Kann Artikel löschen', kategorie: 'Artikel' },
  
  // Ankauf
  { schluessel: 'ankauf.durchfuehren', name: 'Ankauf durchführen', beschreibung: 'Kann neue Artikel ankaufen', kategorie: 'Ankauf' },
  
  // Verkauf
  { schluessel: 'verkauf.durchfuehren', name: 'Verkauf durchführen', beschreibung: 'Kann Artikel verkaufen und Verkauf rückgängig machen', kategorie: 'Verkauf' },
  
  // Re:Match
  { schluessel: 'rematch.verwalten', name: 'Re:Match verwalten', beschreibung: 'Kann Outfit der Woche erstellen und verwalten', kategorie: 'Re:Match' },
  
  // Mitarbeiter
  { schluessel: 'mitarbeiter.ansehen', name: 'Mitarbeiter ansehen', beschreibung: 'Kann Mitarbeiterliste sehen', kategorie: 'Mitarbeiter' },
  { schluessel: 'mitarbeiter.verwalten', name: 'Mitarbeiter verwalten', beschreibung: 'Kann Mitarbeiter anlegen, bearbeiten und löschen', kategorie: 'Mitarbeiter' },
  
  // Rollen
  { schluessel: 'rollen.verwalten', name: 'Rollen verwalten', beschreibung: 'Kann Rollen und Berechtigungen verwalten', kategorie: 'Rollen' },
  
  // Statistiken
  { schluessel: 'dashboard.stats', name: 'Dashboard-Statistiken sehen', beschreibung: 'Kann die Statistik-Kacheln auf dem Dashboard sehen', kategorie: 'Statistiken' },
  { schluessel: 'statistiken.ansehen', name: 'Statistiken ansehen', beschreibung: 'Kann die Statistiken-Seite mit Diagrammen und detaillierten Auswertungen öffnen', kategorie: 'Statistiken' },

  // System
  { schluessel: 'log.ansehen', name: 'Aktivitätslog ansehen', beschreibung: 'Kann alle Aktivitäten im System einsehen und filtern', kategorie: 'System' }
];

// Standard-Kategorien
const KATEGORIEN = [
  // Männer-Kategorien
  { name: 'Taschen (Männer)', slug: 'taschen-maenner', icon: '🎒', reihenfolge: 1 },
  { name: 'Schuhe (Männer)', slug: 'schuhe-maenner', icon: '👟', reihenfolge: 2 },
  { name: 'Hose (Männer)', slug: 'hose-maenner', icon: '👖', reihenfolge: 3 },
  { name: 'Oberteile (Männer)', slug: 'oberteile-maenner', icon: '👕', reihenfolge: 4 },
  { name: 'Accessoires (Männer)', slug: 'accessoires-maenner', icon: '🧢', reihenfolge: 5 },
  
  // Frauen-Kategorien
  { name: 'Taschen (Frauen)', slug: 'taschen-frauen', icon: '👜', reihenfolge: 6 },
  { name: 'Schuhe (Frauen)', slug: 'schuhe-frauen', icon: '👠', reihenfolge: 7 },
  { name: 'Hosen (Frauen)', slug: 'hosen-frauen', icon: '👖', reihenfolge: 8 },
  { name: 'Oberteile (Frauen)', slug: 'oberteile-frauen', icon: '👚', reihenfolge: 9 },
  { name: 'Accessoires (Frauen)', slug: 'accessoires-frauen', icon: '💍', reihenfolge: 10 },
  { name: 'Kleider', slug: 'kleider', icon: '👗', reihenfolge: 11 }
];

const seed = async () => {
  try {
    console.log('🌱 Starte Seeding...\n');
    
    // Verbindung testen
    await sequelize.authenticate();
    console.log('✅ Datenbankverbindung OK\n');
    
    // Tabellen synchronisieren
    await sequelize.sync({ force: true });
    console.log('✅ Tabellen erstellt\n');
    
    // Rechte erstellen
    console.log('📝 Erstelle Rechte...');
    const rechte = await Recht.bulkCreate(RECHTE);
    console.log(`   ${rechte.length} Rechte erstellt\n`);
    
    // Admin-Rolle erstellen (alle Rechte)
    console.log('👑 Erstelle Admin-Rolle...');
    const adminRolle = await Rolle.create({
      name: 'Admin',
      farbe: '#EF4444',
      beschreibung: 'Vollzugriff auf alle Funktionen'
    });
    await adminRolle.setRechte(rechte);
    console.log('   Admin-Rolle erstellt mit allen Rechten\n');
    
    // Mitarbeiter-Rolle erstellen (Basis-Rechte)
    console.log('👤 Erstelle Mitarbeiter-Rolle...');
    const mitarbeiterRolle = await Rolle.create({
      name: 'Mitarbeiter',
      farbe: '#3B82F6',
      beschreibung: 'Basis-Zugriff für normale Mitarbeiter'
    });
    
    // Basis-Rechte für Mitarbeiter
    const basisRechte = rechte.filter(r => 
      ['artikel.ansehen', 'artikel.erstellen', 'ankauf.durchfuehren', 'statistiken.ansehen'].includes(r.schluessel)
    );
    await mitarbeiterRolle.setRechte(basisRechte);
    console.log('   Mitarbeiter-Rolle erstellt mit Basis-Rechten\n');
    
    // Admin-Benutzer erstellen
    console.log('🔐 Erstelle Admin-Benutzer...');
    const admin = await Mitarbeiter.create({
      benutzername: 'admin',
      email: 'admin@rewear.de',
      passwort: 'admin123',
      vorname: 'Admin',
      nachname: 'ReWear',
      rollen_id: adminRolle.id
    });
    console.log('   Admin-Benutzer erstellt');
    console.log('   Benutzername: admin');
    console.log('   Passwort: admin123\n');
    
    // Kategorien erstellen
    console.log('📁 Erstelle Kategorien...');
    const kategorien = await Kategorie.bulkCreate(KATEGORIEN);
    console.log(`   ${kategorien.length} Kategorien erstellt\n`);
    
    console.log('═══════════════════════════════════════════');
    console.log('✅ SEEDING ABGESCHLOSSEN!');
    console.log('═══════════════════════════════════════════');
    console.log('\n🔑 Login-Daten:');
    console.log('   Benutzername: admin');
    console.log('   Passwort: admin123');
    console.log('\n⚠️  Bitte Passwort nach erstem Login ändern!\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding fehlgeschlagen:', error);
    process.exit(1);
  }
};

seed();
