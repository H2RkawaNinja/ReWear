import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Package, Tag } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import ArtikelCard from '../components/ArtikelCard';
import api from '../services/api';

const Rematch = () => {
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/rematch/aktiv');
        setOutfit(res.data);
      } catch {
        setOutfit(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PublicLayout>

      {/* ── HERO ── */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-black">
        {/* BG Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]" />
        </div>
        {/* Diagonal lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-secondary to-transparent rotate-12 scale-y-150" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary to-transparent -rotate-6 scale-y-150" />
        </div>

        <div className="container-street relative z-10 text-center py-20">
          <div className="inline-flex items-center gap-2 border border-secondary/40 bg-secondary/10 text-secondary px-5 py-2 rounded-full mb-8 backdrop-blur-sm">
            <Sparkles size={14} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Outfit der Woche</span>
          </div>

          <div className="mb-6">
            <img
              src="/images/titel-rematch.png"
              alt="Re:Match"
              className="h-28 md:h-40 lg:h-52 w-auto mx-auto drop-shadow-[0_0_40px_rgba(255,107,53,0.4)]"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
            />
            <h1 className="font-graffiti text-7xl md:text-9xl text-white" style={{ display: 'none' }}>Re:Match</h1>
          </div>

          <p className="text-street-400 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Jede Woche. Ein komplettes Outfit. Dein neuer Look.
          </p>

          <div className="mt-12 flex flex-col items-center gap-2 text-street-600 animate-pulse">
            <div className="w-px h-12 bg-gradient-to-b from-transparent to-street-600" />
            <span className="text-xs tracking-widest font-mono">SCROLL</span>
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      {loading ? (
        <section className="section-street bg-street-950">
          <div className="container-street text-center py-24">
            <div className="w-10 h-10 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-street-500 font-mono text-sm tracking-widest">LOADING...</p>
          </div>
        </section>
      ) : !outfit ? (
        <section className="section-street bg-street-950">
          <div className="container-street text-center py-24">
            <Package size={48} className="mx-auto text-street-700 mb-6" />
            <h2 className="font-street text-3xl text-white mb-3">Kein aktives Outfit</h2>
            <p className="text-street-500 mb-8">Schau bald wieder vorbei — das nächste Re:Match kommt bestimmt.</p>
            <Link to="/artikel" className="btn-street inline-flex items-center gap-2">
              Sortiment durchstÃ¶bern <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      ) : (
        <>
          {/* ── OUTFIT SHOWCASE ── */}
          <section className="relative bg-street-950 overflow-hidden">
            <div className="h-px bg-gradient-to-r from-transparent via-secondary to-transparent" />

            <div className="container-street py-16 lg:py-24">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                {/* Bild */}
                <div className="relative group order-2 lg:order-1 max-w-sm mx-auto w-full">
                  {outfit.bild ? (
                    <>
                      <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-secondary z-10" />
                      <div className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 border-secondary z-10" />
                      <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 border-secondary z-10" />
                      <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-secondary z-10" />
                      <div className="absolute inset-0 bg-secondary/10 blur-2xl scale-110 rounded-xl" />
                      <img
                        src={outfit.bild}
                        alt={outfit.titel}
                        className="relative z-10 w-full rounded-xl object-cover shadow-2xl group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </>
                  ) : (
                    <div className="aspect-[3/4] bg-street-900 rounded-xl flex items-center justify-center border border-street-700">
                      <span className="font-graffiti text-5xl text-street-700">Re:Match</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="order-1 lg:order-2">
                  {(outfit.woche_von || outfit.woche_bis) && (
                    <p className="text-street-500 font-mono text-xs tracking-[0.2em] uppercase mb-4">
                      {outfit.woche_von && new Date(outfit.woche_von).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                      {outfit.woche_von && outfit.woche_bis && ' — '}
                      {outfit.woche_bis && new Date(outfit.woche_bis).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  )}

                  <h2 className="font-street text-5xl md:text-6xl text-white mb-6 leading-tight">
                    {outfit.titel}
                  </h2>

                  {outfit.beschreibung && (
                    <p className="text-street-300 text-lg leading-relaxed mb-8 border-l-2 border-secondary/50 pl-4">
                      {outfit.beschreibung}
                    </p>
                  )}

                  {outfit.gesamtpreis && (
                    <div className="inline-flex items-center gap-3 mb-8 bg-street-900 border border-street-700 px-6 py-4 rounded-xl">
                      <Tag size={18} className="text-secondary" />
                      <div>
                        <p className="text-street-500 text-xs font-mono tracking-widest uppercase">Outfit-Gesamtpreis</p>
                        <p className="font-street text-4xl text-secondary">
                          {parseFloat(outfit.gesamtpreis).toFixed(2).replace('.', ',')} $
                        </p>
                      </div>
                    </div>
                  )}

                  {outfit.artikel?.length > 0 && (
                    <div>
                      <p className="text-street-500 text-xs font-mono tracking-widest uppercase mb-3">Enthält</p>
                      <div className="flex flex-wrap gap-2">
                        {outfit.artikel.map((a) => (
                          <Link
                            key={a.id}
                            to={`/artikel/${a.id}`}
                            className="border border-street-700 hover:border-secondary/50 bg-street-900/50 hover:bg-street-800 px-3 py-1.5 rounded-lg text-sm text-street-300 hover:text-white transition-all"
                          >
                            {a.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-street-700 to-transparent" />
          </section>

          {/* ── ARTIKEL GRID ── */}
          {outfit.artikel?.length > 0 && (
            <section className="section-street bg-black">
              <div className="container-street">
                <div className="flex items-center gap-6 mb-12">
                  <div>
                    <p className="text-street-600 font-mono text-xs tracking-[0.2em] uppercase mb-1">Teile des Outfits</p>
                    <h3 className="font-street text-3xl text-white">Die Pieces</h3>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-street-700 to-transparent" />
                  <span className="bg-street-900 border border-street-700 text-street-400 font-mono text-sm px-4 py-1.5 rounded-full">
                    {outfit.artikel.length} Artikel
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {outfit.artikel.map((artikel) => (
                    <ArtikelCard key={artikel.id} artikel={artikel} />
                  ))}
                </div>

                <div className="mt-16 text-center">
                  <div className="inline-block border border-street-700 rounded-2xl p-8 bg-street-950">
                    <p className="text-street-400 mb-4">Noch mehr entdecken?</p>
                    <Link to="/artikel" className="btn-street inline-flex items-center gap-2">
                      Ganzes Sortiment ansehen <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </PublicLayout>
  );
};

export default Rematch;
