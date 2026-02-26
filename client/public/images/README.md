# Bilder für ReWear Southside

## Logo & Branding
- `logo.png` - Haupt-Logo (transparent PNG)
- `logo-white.png` - Weißes Logo für dunkle Hintergründe
- `favicon.ico` - Browser-Icon

## Kategorien (kategorien/)
Für jede Kategorie werden zwei Bilder benötigt (getrennt nach Geschlecht):

### MÄNNER - Produkt-Bilder:
- `taschen-maenner.png/.jpg` - Taschen für Männer (1200x900px)
- `schuhe-maenner.png/.jpg` - Schuhe für Männer (1200x900px)
- `hose-maenner.png/.jpg` - Hosen für Männer (1200x900px)
- `oberteile-maenner.png/.jpg` - Oberteile für Männer (1200x900px)
- `accessoires-maenner.png/.jpg` - Accessoires für Männer (1200x900px)

### MÄNNER - Titel-Bilder:
- `titel-taschen-maenner.png/.jpg` - "Taschen" Überschrift Männer (1200x300px)
- `titel-schuhe-maenner.png/.jpg` - "Schuhe" Überschrift Männer (1200x300px)
- `titel-hose-maenner.png/.jpg` - "Hose" Überschrift Männer (1200x300px)
- `titel-oberteile-maenner.png/.jpg` - "Oberteile" Überschrift Männer (1200x300px)
- `titel-accessoires-maenner.png/.jpg` - "Accessoires" Überschrift Männer (1200x300px)

### FRAUEN - Produkt-Bilder:
- `taschen-frauen.png/.jpg` - Taschen für Frauen (1200x900px)
- `schuhe-frauen.png/.jpg` - Schuhe für Frauen (1200x900px)
- `hosen-frauen.png/.jpg` - Hosen für Frauen (1200x900px)
- `oberteile-frauen.png/.jpg` - Oberteile für Frauen (1200x900px)
- `accessoires-frauen.png/.jpg` - Accessoires für Frauen (1200x900px)
- `kleider.png/.jpg` - Kleider (1200x900px)

### FRAUEN - Titel-Bilder:
- `titel-taschen-frauen.png/.jpg` - "Taschen" Überschrift Frauen (1200x300px)
- `titel-schuhe-frauen.png/.jpg` - "Schuhe" Überschrift Frauen (1200x300px)
- `titel-hosen-frauen.png/.jpg` - "Hosen" Überschrift Frauen (1200x300px)
- `titel-oberteile-frauen.png/.jpg` - "Oberteile" Überschrift Frauen (1200x300px)
- `titel-accessoires-frauen.png/.jpg` - "Accessoires" Überschrift Frauen (1200x300px)
- `titel-kleider.png/.jpg` - "Kleider" Überschrift (1200x300px)

### Fallback Bilder (optional):
- `placeholder-jacken.jpg` - Fallback für Jacken
- `placeholder-hoodies.jpg` - Fallback für Hoodies
- `placeholder-t-shirts.jpg` - Fallback für T-Shirts
- `placeholder-hosen.jpg` - Fallback für Hosen
- `placeholder-schuhe.jpg` - Fallback für Schuhe
- `placeholder-accessoires.jpg` - Fallback für Accessoires

## Hintergrund & Texturen
- `hero-bg.jpg` - Hero-Section Hintergrund
- `graffiti-bg.png` - Graffiti Muster (optional)
- `concrete-texture.png` - Beton Textur (optional)

## Icons & Grafiken
- `placeholder-artikel.png` - Fallback für Artikel ohne Bild

## Empfohlene Größen
- Logo: 200x60px (transparent PNG)
- Hero Background: 1920x1080px
- Kategorie Produkt-Bilder: 1200x900px (Aspect Ratio 4:3)
- Kategorie Titel-Bilder: 1200x300px (Aspect Ratio 4:1) 
- Favicon: 32x32px

## Verwendung im Code
```jsx
// Logo in Header
<img src="/images/logo-white.png" alt="ReWear Southside" />

// Kategorie Titel-Bilder
<img src="/images/kategorien/titel-hosen.jpg" alt="Hosen Titel" />

// Kategorie Produkt-Bilder
<img src="/images/kategorien/hosen.jpg" alt="Hosen Produkte" />

// Hero Background
style={{ backgroundImage: 'url(/images/hero-bg.jpg)' }}

// Favicon in index.html
<link rel="icon" href="/images/favicon.ico" />
```

## Ordnerstruktur
```
images/
├── logo.png
├── logo-white.png
├── favicon.ico
├── hero-bg.jpg
├── placeholder-artikel.png
└── kategorien/
    ├── MÄNNER:
    ├── taschen-maenner.png (oder .jpg)
    ├── titel-taschen-maenner.png (oder .jpg)
    ├── schuhe-maenner.png (oder .jpg)
    ├── titel-schuhe-maenner.png (oder .jpg)
    ├── hose-maenner.png (oder .jpg)
    ├── titel-hose-maenner.png (oder .jpg)
    ├── oberteile-maenner.png (oder .jpg)
    ├── titel-oberteile-maenner.png (oder .jpg)
    ├── accessoires-maenner.png (oder .jpg)
    ├── titel-accessoires-maenner.png (oder .jpg)
    ├── FRAUEN:
    ├── taschen-frauen.png (oder .jpg)
    ├── titel-taschen-frauen.png (oder .jpg)
    ├── schuhe-frauen.png (oder .jpg)
    ├── titel-schuhe-frauen.png (oder .jpg)
    ├── hosen-frauen.png (oder .jpg)
    ├── titel-hosen-frauen.png (oder .jpg)
    ├── oberteile-frauen.png (oder .jpg)
    ├── titel-oberteile-frauen.png (oder .jpg)
    ├── accessoires-frauen.png (oder .jpg)
    ├── titel-accessoires-frauen.png (oder .jpg)
    ├── kleider.png (oder .jpg)
    └── titel-kleider.png (oder .jpg)
```

Einfach die Bilder entsprechend der Ordnerstruktur hinzufügen!