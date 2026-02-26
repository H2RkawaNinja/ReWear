# 🔥 ReWear Southside

**Second-Hand Klamotten Shop für RP Server**

Ein moderner, stylisher Klamotten-Shop im Southside Gang-Style. Öffentlich sichtbares Inventar, Admin-Dashboard für Ankauf und Verwaltung, und das wöchentliche **Re:Match** Outfit-Feature.

---

## 🚀 Features

### Öffentliche Seite
- 👀 Inventar-Übersicht mit Filter & Suche
- 📦 Artikel-Detailansicht mit Bildern
- 🎯 **Re:Match** - Wöchentlich kuratierte Outfits
- 🌙 Dark Street-Style Theme

### Admin Dashboard
- 🛒 **Ankauf** - Neue Artikel im Shop aufnehmen
- 📝 **Artikel verwalten** - Bearbeiten, Archivieren, Löschen
- 👕 **Re:Match Editor** - Wöchentliche Outfits zusammenstellen
- 📊 **Statistiken** - Verkaufszahlen, Umsatz, Charts
- 👥 **Mitarbeiter** - Team verwalten
- 🔐 **Rollen & Rechte** - Flexibles Berechtigungssystem

---

## 🛠️ Tech Stack

| Komponente | Technologie |
|------------|-------------|
| Backend | Node.js + Express |
| Frontend | React 18 + Vite |
| Database | MySQL + Sequelize |
| Styling | Tailwind CSS |
| Auth | JWT |
| Deployment | PM2 + Nginx |

---

## 📦 Installation

### Voraussetzungen
- Node.js 18+
- MySQL 8.0+
- npm oder yarn

### 1. Repository klonen
```bash
git clone <dein-repo>
cd ReWear
```

### 2. MySQL Datenbank erstellen
```sql
CREATE DATABASE rewear CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'rewear'@'localhost' IDENTIFIED BY 'sicheres_passwort';
GRANT ALL PRIVILEGES ON rewear.* TO 'rewear'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Backend einrichten
```bash
cd server
npm install

# Umgebungsvariablen kopieren
cp .env.example .env

# .env bearbeiten mit deinen Daten:
# DB_HOST=localhost
# DB_USER=rewear
# DB_PASSWORD=sicheres_passwort
# DB_NAME=rewear
# JWT_SECRET=ein_sehr_langes_geheimes_passwort_hier
```

### 4. Datenbank initialisieren
```bash
npm run seed
```
Dies erstellt:
- Alle Tabellen
- Standard-Kategorien (Jacken, Hosen, Schuhe, etc.)
- Admin-Rolle (alle Rechte)
- Mitarbeiter-Rolle (Basis-Rechte)
- Admin-Account: `admin` / `admin123` ⚠️ **Sofort ändern!**

### 5. Frontend einrichten
```bash
cd ../client
npm install
```

### 6. Entwicklung starten
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Admin Login: http://localhost:5173/admin

---

## 🚀 Deployment (VPS)

### 1. Server vorbereiten
```bash
# Als root
apt update && apt upgrade -y
apt install nginx mysql-server nodejs npm -y

# Node.js 18+ installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y

# PM2 global installieren
npm install -g pm2
```

### 2. Projekt auf Server kopieren
```bash
# Projekt nach /var/www/rewear kopieren
mkdir -p /var/www/rewear
# rsync, scp oder git clone verwenden
```

### 3. Backend deployen
```bash
cd /var/www/rewear/server
npm install --production
cp .env.example .env
nano .env  # Produktions-Werte eintragen
npm run seed

# Mit PM2 starten
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Frontend bauen
```bash
cd /var/www/rewear/client
npm install
npm run build
```

### 5. Nginx einrichten
```bash
cp /var/www/rewear/nginx.conf.example /etc/nginx/sites-available/rewear
nano /etc/nginx/sites-available/rewear  # Domain anpassen
ln -s /etc/nginx/sites-available/rewear /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 6. SSL mit Let's Encrypt
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d deine-domain.de -d www.deine-domain.de
```

---

## 🔐 Berechtigungssystem

Das System verwendet ein flexibles Rollen-Rechte-System:

### Standard-Rechte
| Recht | Beschreibung |
|-------|--------------|
| `artikel.ansehen` | Artikel im Admin sehen |
| `artikel.erstellen` | Neue Artikel anlegen |
| `artikel.bearbeiten` | Artikel bearbeiten |
| `artikel.loeschen` | Artikel löschen |
| `rematch.ansehen` | Re:Match Outfits sehen |
| `rematch.verwalten` | Re:Match verwalten |
| `mitarbeiter.ansehen` | Team-Liste sehen |
| `mitarbeiter.verwalten` | Mitarbeiter verwalten |
| `rollen.ansehen` | Rollen sehen |
| `rollen.verwalten` | Rollen bearbeiten |
| `statistiken.ansehen` | Statistiken sehen |
| `ankauf.durchfuehren` | Ankauf-Funktion nutzen |
| `archiv.ansehen` | Archiv einsehen |

### Neue Rolle anlegen
1. Admin Dashboard → Rollen
2. "Neue Rolle" Button
3. Name eingeben
4. Rechte per Checkbox zuweisen

---

## 📁 Projektstruktur

```
ReWear/
├── server/                 # Backend
│   ├── config/            # DB-Konfiguration
│   ├── middleware/        # Auth, Upload
│   ├── models/            # Sequelize Models
│   ├── routes/            # API Endpoints
│   ├── seeders/           # Datenbank-Seed
│   ├── uploads/           # Artikelbilder
│   └── index.js           # Server Entry
│
├── client/                 # Frontend
│   ├── src/
│   │   ├── components/    # React Components
│   │   ├── context/       # Auth Context
│   │   ├── pages/         # Seiten
│   │   │   ├── admin/     # Dashboard
│   │   │   └── ...        # Öffentlich
│   │   ├── services/      # API Service
│   │   └── styles/        # CSS
│   └── index.html
│
├── nginx.conf.example      # Nginx Beispiel
└── README.md
```

---

## 🎨 Anpassungen

### Farben ändern
Bearbeite `client/tailwind.config.js`:
```js
colors: {
  street: { /* Hauptfarben */ },
  'neon-green': '#39ff14',  // Akzent
  'blood-red': '#dc143c',   // Fehler/Wichtig
  gold: '#ffd700'           // Highlights
}
```

### Kategorien hinzufügen
Bearbeite `server/seeders/seed.js` und führe erneut aus:
```bash
npm run seed
```

Oder füge sie über die API hinzu.

---

## 🐛 Troubleshooting

### "ECONNREFUSED" bei MySQL
```bash
# MySQL läuft?
systemctl status mysql

# MySQL neu starten
systemctl restart mysql
```

### Bilder werden nicht angezeigt
```bash
# Uploads-Ordner existiert?
mkdir -p server/uploads
chmod 755 server/uploads
```

### PM2 zeigt Error
```bash
pm2 logs rewear-api
pm2 restart rewear-api
```

---

## 📞 Support

Bei Fragen oder Problemen - viel Erfolg mit eurem RP Shop! 🔥

---

**Made with 💀 for the Streets**
