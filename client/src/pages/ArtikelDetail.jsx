import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Tag, Ruler, Sparkles, AlertCircle } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../services/api';

const ArtikelDetail = () => {
  const { id } = useParams();
  const [artikel, setArtikel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aktivBild, setAktivBild] = useState(0);

  useEffect(() => {
    const loadArtikel = async () => {
      try {
        const res = await api.get(`/artikel/${id}`);
        setArtikel(res.data);
      } catch (err) {
        setError('Artikel nicht gefunden');
      } finally {
        setLoading(false);
      }
    };

    loadArtikel();
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="container-street py-20">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-street-800 rounded mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-street-800 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-6 w-24 bg-street-800 rounded"></div>
                <div className="h-10 w-3/4 bg-street-800 rounded"></div>
                <div className="h-20 bg-street-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !artikel) {
    return (
      <PublicLayout>
        <div className="container-street py-20 text-center">
          <AlertCircle size={64} className="mx-auto text-primary mb-4" />
          <h1 className="font-street text-3xl text-white mb-2">Artikel nicht gefunden</h1>
          <p className="text-street-400 mb-8">Der gesuchte Artikel existiert nicht oder wurde entfernt.</p>
          <Link to="/artikel" className="btn-street">
            Zurück zum Sortiment
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const statusInfo = {
    verfuegbar: { text: 'Verfügbar', class: 'badge-available' },
    reserviert: { text: 'Reserviert', class: 'badge-reserved' },
    verkauft: { text: 'Verkauft', class: 'badge-sold' }
  };

  let bilder = [];
  if (Array.isArray(artikel?.bilder)) {
    bilder = artikel.bilder;
  } else if (typeof artikel?.bilder === 'string' && artikel.bilder) {
    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(artikel.bilder);
      bilder = Array.isArray(parsed) ? parsed : [artikel.bilder];
    } catch {
      bilder = [artikel.bilder];
    }
  }
  if (!bilder.length) {
    bilder = ['https://via.placeholder.com/600x600/1a1a1a/666?text=Kein+Bild'];
  }

  return (
    <PublicLayout>
      <div className="container-street py-8">
        {/* Zurück Button */}
        <Link 
          to="/artikel" 
          className="inline-flex items-center gap-2 text-street-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          Zurück zum Sortiment
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Bilder */}
          <div className="space-y-4">
            {/* Hauptbild */}
            <div className="aspect-square bg-street-800 rounded-lg overflow-hidden relative">
              <img
                  src={bilder[aktivBild] || 'https://via.placeholder.com/600x600/1a1a1a/666?text=Kein+Bild'}
                  alt={artikel.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x600/1a1a1a/666?text=Kein+Bild';
                  }}
                />
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`badge ${statusInfo[artikel.status].class}`}>
                  {statusInfo[artikel.status].text}
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {bilder.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {bilder.map((bild, index) => (
                  <button
                    key={index}
                    onClick={() => setAktivBild(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      aktivBild === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={bild}
                      alt={`${artikel.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {/* Kategorie */}
            {artikel.kategorie && (
              <Link 
                to={`/artikel?kategorie=${artikel.kategorie.id}`}
                className="inline-block text-primary text-sm font-semibold uppercase tracking-wider hover:text-secondary transition-colors mb-2"
              >
                {artikel.kategorie.name}
              </Link>
            )}

            {/* Name */}
            <h1 className="font-street text-4xl md:text-5xl text-white mb-4">
              {artikel.name}
            </h1>

            {/* Preis */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-street text-primary">
                ${parseFloat(artikel.verkaufspreis).toFixed(0)}
              </span>
              <span className="text-street-500">(nur vor Ort)</span>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="street-card p-4">
                <div className="flex items-center gap-3">
                  <Ruler size={20} className="text-primary" />
                  <div>
                    <p className="text-street-400 text-xs">Größe</p>
                    <p className="font-semibold text-white">{artikel.groesse}</p>
                  </div>
                </div>
              </div>
              
              <div className="street-card p-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="text-secondary" />
                  <div>
                    <p className="text-street-400 text-xs">Zustand</p>
                    <p className="font-semibold text-white">{artikel.zustand}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Liste */}
            <div className="space-y-4 mb-8">

              <div className="flex justify-between py-3 border-b border-street-700">
                <span className="text-street-400">Für</span>
                <span className="text-white">{artikel.geschlecht}</span>
              </div>
            </div>

            {/* Beschreibung */}
            {artikel.beschreibung && (
              <div className="mb-8">
                <h3 className="font-street text-lg text-white mb-3">Beschreibung</h3>
                <p className="text-street-300 leading-relaxed">{artikel.beschreibung}</p>
              </div>
            )}

            {/* Hinweis Box */}
            <div className="bg-street-800 border border-street-700 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Tag size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-street text-lg text-white mb-2">Nur vor Ort</h4>
                  <p className="text-street-400 text-sm">
                    Dieser Artikel kann nur vor Ort in unserem Shop in der Westside angeschaut 
                    und gekauft werden. Online-Bestellung ist nicht möglich.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ArtikelDetail;
