import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shirt, Tag, Star } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import ArtikelCard from '../components/ArtikelCard';
import api from '../services/api';

const Home = () => {
  const [neueArtikel, setNeueArtikel] = useState([]);
  const [totalArtikel, setTotalArtikel] = useState(0);
  const [kategorien, setKategorien] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Parallel laden
        const [artikelRes, kategorienRes] = await Promise.allSettled([
          api.get('/artikel', { params: { limit: 8, sortierung: 'erstellt_am', richtung: 'DESC' } }),
          api.get('/kategorien')
        ]);

        if (artikelRes.status === 'fulfilled') {
          setNeueArtikel(artikelRes.value.data.artikel);
          setTotalArtikel(artikelRes.value.data.pagination?.gesamt || 0);
        }
        if (kategorienRes.status === 'fulfilled') {
          setKategorien(kategorienRes.value.data);
        }
      } catch (error) {
        console.error('Fehler beim Laden:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/images/hero-bg.png"
            alt="Hero Background"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback zu JPG wenn PNG fehlt
              if (e.target.src.includes('.png')) {
                e.target.src = '/images/hero-bg.jpg';
                return;
              }
              // Ultimate Fallback zu Gradient wenn beide Bilder fehlen
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
            }}
          />
          {/* Dark Overlay für bessere Lesbarkeit */}
          <div className="absolute inset-0 bg-black/40"></div>
          
          {/* Optionale Decorative Elements - können entfernt werden */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container-street relative z-10 text-center py-20">
          {/* Main Logo */}
          <div className="mb-8">
            <img 
              src="/images/logo-main.png"
              alt="Shop Logo" 
              className="mx-auto max-w-sm md:max-w-xl lg:max-w-3xl h-auto transition-transform duration-700 hover:scale-105"
              onError={(e) => {
                // Fallback wenn Logo fehlt - zeigt stylischen Text
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            {/* Fallback Text-Logo */}
            <div style={{ display: 'none' }} className="text-center">
              <h1 className="font-graffiti text-6xl md:text-8xl lg:text-9xl text-white mb-4 text-graffiti">
                SHOP
              </h1>
              <p className="font-street text-2xl md:text-3xl text-primary tracking-[0.3em]">
                WESTSIDE
              </p>
            </div>
          </div>

          <p className="text-street-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Gebrauchte Streetwear aus der Hood. Echte Klamotten, faire Preise. 
            Nur vor Ort in der Westside.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/artikel" className="btn-street flex items-center gap-2">
              <Shirt size={20} />
              Sortiment durchstöbern
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
            <div className="text-center">
              <p className="font-street text-3xl text-primary">{totalArtikel}+</p>
              <p className="text-street-400 text-sm">Artikel</p>
            </div>
            <div className="text-center">
              <p className="font-street text-3xl text-secondary">{kategorien.length}</p>
              <p className="text-street-400 text-sm">Kategorien</p>
            </div>
            <div className="text-center">
              <p className="font-street text-3xl text-accent">100%</p>
              <p className="text-street-400 text-sm">Street</p>
            </div>
          </div>
        </div>

      </section>

      {/* Neue Artikel Section */}
      <section className="section-street">
        <div className="container-street">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-street text-4xl md:text-5xl text-white mb-2">
                NEUE DROPS
              </h2>
              <p className="text-street-400">Frisch reinbekommen</p>
            </div>
            <Link 
              to="/artikel" 
              className="hidden sm:flex items-center gap-2 text-primary hover:text-secondary transition-colors font-semibold"
            >
              Alle ansehen
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Artikel Grid */}
          {loading ? (
            <div className="grid-street">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-street-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : neueArtikel.length > 0 ? (
            <div className="grid-street stagger-children">
              {neueArtikel.map((artikel) => (
                <ArtikelCard key={artikel.id} artikel={artikel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Shirt size={64} className="mx-auto text-street-700 mb-4" />
              <p className="text-street-400">Noch keine Artikel vorhanden.</p>
            </div>
          )}

          {/* Mobile Link */}
          <div className="mt-8 text-center sm:hidden">
            <Link to="/artikel" className="btn-street-outline">
              Alle Artikel ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* Kategorien Section */}
      <section className="section-street bg-street-900/50">
        <div className="container-street">
          <div className="text-center mb-16">
            <h2 className="font-street text-4xl md:text-5xl text-white mb-4">
              SHOP KATEGORIEN
            </h2>
            <p className="text-street-400 text-lg max-w-2xl mx-auto">
              Von frischen Streetwear-Pieces bis zu seltenen Vintage-Finds - 
              entdecke unsere handverlesene Auswahl für jeden Style
            </p>
          </div>

          {/* Männer Kategorien */}
            <div className="mb-16">
              <h3 className="font-street text-3xl text-primary mb-8 text-center">MÄNNER</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {kategorien
                  .filter(kategorie => kategorie.slug.includes('maenner'))
                  .map((kategorie) => (
                  <Link
                    key={kategorie.id}
                    to={`/artikel?kategorie=${kategorie.id}`}
                    className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20"
                  >
                    {/* Überschrift Bild */}
                    <div className="relative h-20 overflow-hidden bg-street-900">
                      <img 
                        src={`/images/kategorien/titel-${kategorie.slug}.png`}
                        alt={`${kategorie.name} Titel`}
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          const slug = kategorie.slug;
                          
                          if (e.target.src.includes('.png')) {
                            e.target.src = `/images/kategorien/titel-${slug}.jpg`;
                            return;
                          }
                          
                          // Fallback auf allgemeine Titel-Bilder für Männer-Kategorien
                          if (slug.includes('maenner')) {
                            const baseSlug = slug.split('-')[0]; // z.B. "hose" aus "hose-maenner"
                            
                            // Spezielle Mappings für Singular/Plural
                            const slugMappings = {
                              'hose': 'hosen',
                              'taschen': 'taschen',
                              'schuhe': 'schuhe', 
                              'oberteile': 'oberteile',
                              'accessoires': 'accessoires'
                            };
                            
                            const mappedSlug = slugMappings[baseSlug] || baseSlug;
                            
                            if (!e.target.src.includes(`titel-${mappedSlug}.`)) {
                              e.target.src = `/images/kategorien/titel-${mappedSlug}.png`;
                              return;
                            }
                          }
                          
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-primary to-secondary hidden items-center justify-center"
                        style={{ display: 'none' }}
                      >
                        <h4 className="font-street text-lg text-white font-bold tracking-wider">
                          {kategorie.name.replace(' (Männer)', '').toUpperCase()}
                        </h4>
                      </div>
                    </div>

                    {/* Produkt Bild */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img 
                        src={`/images/kategorien/${kategorie.slug}.png`}
                        alt={`${kategorie.name} Produkte`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const slug = kategorie.slug;
                          
                          if (e.target.src.includes('.png')) {
                            e.target.src = `/images/kategorien/${slug}.jpg`;
                            return;
                          }
                          
                          // Ultimate fallback - da Sie jetzt alle Bilder haben, sollte das selten auftreten
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-sm hidden items-center justify-center"
                        style={{ display: 'none' }}
                      >
                        <div className="text-4xl opacity-50">{kategorie.icon || '👕'}</div>
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">
                          <span className="text-xs font-semibold">
                            {kategorie.artikelAnzahl || 0} verfügbar
                          </span>
                          <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-2xl transition-all duration-300"></div>
                  </Link>
                ))}
              </div>
            </div>
          {/* Frauen Kategorien */}
          <div>
            <h3 className="font-street text-3xl text-secondary mb-8 text-center">FRAUEN</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {kategorien
                .filter(kategorie => kategorie.slug.includes('frauen') || kategorie.slug === 'kleider')
                .map((kategorie) => (
                <Link
                  key={kategorie.id}
                  to={`/artikel?kategorie=${kategorie.id}`}
                  className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20"
                >
                  {/* Überschrift Bild */}
                  <div className="relative h-20 overflow-hidden bg-street-900">
                    <img 
                      src={`/images/kategorien/titel-${kategorie.slug}.png`}
                      alt={`${kategorie.name} Titel`}
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        const slug = kategorie.slug;
                        
                        if (e.target.src.includes('.png')) {
                          e.target.src = `/images/kategorien/titel-${slug}.jpg`;
                          return;
                        }
                        
                        // Fallback auf allgemeine Titel-Bilder für Frauen-Kategorien
                        if (slug.includes('frauen')) {
                          const baseSlug = slug.split('-')[0]; // z.B. "hosen" aus "hosen-frauen"
                          if (!e.target.src.includes(`titel-${baseSlug}.`)) {
                            e.target.src = `/images/kategorien/titel-${baseSlug}.png`;
                            return;
                          }
                        }
                        
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-secondary to-accent hidden items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <h4 className="font-street text-lg text-white font-bold tracking-wider">
                        {kategorie.name.replace(' (Frauen)', '').toUpperCase()}
                      </h4>
                    </div>
                  </div>

                  {/* Produkt Bild */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img 
                      src={`/images/kategorien/${kategorie.slug}.png`}
                      alt={`${kategorie.name} Produkte`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        const slug = kategorie.slug;
                        
                        if (e.target.src.includes('.png')) {
                          e.target.src = `/images/kategorien/${slug}.jpg`;
                          return;
                        }
                        
                        // Spezielle Fallbacks für Frauen-Kategorien auf allgemeine Bilder
                        if (slug.includes('frauen')) {
                          const baseSlug = slug.split('-')[0]; // z.B. "hosen" aus "hosen-frauen"
                          if (!e.target.src.includes(baseSlug)) {
                            e.target.src = `/images/kategorien/${baseSlug}.png`;
                            return;
                          }
                        }
                        
                        // Ultimate fallback
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-accent/30 backdrop-blur-sm hidden items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <div className="text-4xl opacity-50">{kategorie.icon || '👗'}</div>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">
                        <span className="text-xs font-semibold">
                          {kategorie.artikelAnzahl || 0} verfügbar
                        </span>
                        <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-secondary/30 rounded-2xl transition-all duration-300"></div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Zusätzliche Info */}
          <div className="text-center mt-16">
            <p className="text-street-500 text-sm mb-4">
              Alle Artikel werden sorgfältig geprüft und authentifiziert
            </p>
            <Link 
              to="/artikel" 
              className="btn-street-outline inline-flex items-center gap-2"
            >
              Gesamtes Sortiment anzeigen
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="section-street">
        <div className="container-street">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-graffiti text-4xl md:text-5xl text-white mb-6">
              Wie funktioniert's?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag size={28} className="text-primary" />
                </div>
                <h3 className="font-street text-xl text-white mb-2">1. DURCHSTÖBERN</h3>
                <p className="text-street-400">Check unser Sortiment online und find deinen Style.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shirt size={28} className="text-secondary" />
                </div>
                <h3 className="font-street text-xl text-white mb-2">2. VORBEIKOMMEN</h3>
                <p className="text-street-400">Komm in die Westside und probier die Sachen an.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star size={28} className="text-accent" />
                </div>
                <h3 className="font-street text-xl text-white mb-2">3. MITNEHMEN</h3>
                <p className="text-street-400">Zahl vor Ort und rock deinen neuen Look.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;
