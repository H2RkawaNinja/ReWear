import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, Shirt } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import ArtikelCard from '../components/ArtikelCard';
import api from '../services/api';

const Artikel = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artikel, setArtikel] = useState([]);
  const [kategorien, setKategorien] = useState([]);
  const [pagination, setPagination] = useState({ gesamt: 0, seite: 1, seiten: 1 });
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter States
  const [filter, setFilter] = useState({
    suche: searchParams.get('suche') || '',
    kategorie: searchParams.get('kategorie') || '',
    geschlecht: searchParams.get('geschlecht') || ''
  });

  const geschlechter = ['Männlich', 'Weiblich', 'Unisex'];

  // Kategorien laden
  useEffect(() => {
    const loadKategorien = async () => {
      try {
        const res = await api.get('/kategorien');
        setKategorien(res.data);
      } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error);
      }
    };
    loadKategorien();
  }, []);

  // Artikel laden
  useEffect(() => {
    const loadArtikel = async () => {
      setLoading(true);
      try {
        const params = {
          seite: searchParams.get('seite') || 1,
          limit: 12
        };

        if (filter.suche) params.suche = filter.suche;
        if (filter.kategorie) params.kategorie = filter.kategorie;
        if (filter.geschlecht) params.geschlecht = filter.geschlecht;

        const res = await api.get('/artikel', { params });
        setArtikel(res.data.artikel);
        setPagination(res.data.pagination);
      } catch (error) {
        console.error('Fehler beim Laden der Artikel:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArtikel();
  }, [searchParams, filter]);

  // Filter anwenden
  const applyFilter = () => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
    setFilterOpen(false);
  };

  // Filter zurücksetzen
  const resetFilter = () => {
    setFilter({
      suche: '',
      kategorie: '',
      geschlecht: ''
    });
    setSearchParams({});
  };

  // Aktive Filter zählen
  const activeFilterCount = Object.values(filter).filter(v => v).length;

  return (
    <PublicLayout>
      {/* Header */}
      <section className="bg-street-900 py-12 border-b border-street-700">
        <div className="container-street">
          <h1 className="font-street text-4xl md:text-5xl text-white mb-2">
            SORTIMENT
          </h1>
          <p className="text-street-400">
            {pagination.gesamt} Artikel verfügbar
          </p>
        </div>
      </section>

      <div className="container-street py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Suche */}
              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">
                  Suche
                </label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-street-500" />
                  <input
                    type="text"
                    placeholder="Artikel suchen..."
                    value={filter.suche}
                    onChange={(e) => setFilter({ ...filter, suche: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                    className="input-street pl-10"
                  />
                </div>
              </div>

              {/* Kategorie */}
              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">
                  Kategorie
                </label>
                <select
                  value={filter.kategorie}
                  onChange={(e) => setFilter({ ...filter, kategorie: e.target.value })}
                  className="input-street"
                >
                  <option value="">Alle Kategorien</option>
                  {kategorien.map((k) => (
                    <option key={k.id} value={k.id}>{k.name}</option>
                  ))}
                </select>
              </div>

              {/* Geschlecht */}
              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">
                  Für
                </label>
                <select
                  value={filter.geschlecht}
                  onChange={(e) => setFilter({ ...filter, geschlecht: e.target.value })}
                  className="input-street"
                >
                  <option value="">Alle</option>
                  {geschlechter.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button onClick={applyFilter} className="btn-street flex-1 text-sm py-2">
                  Anwenden
                </button>
                {activeFilterCount > 0 && (
                  <button onClick={resetFilter} className="btn-street-outline text-sm py-2 px-3">
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setFilterOpen(true)}
                className="btn-street-outline w-full flex items-center justify-center gap-2"
              >
                <Filter size={18} />
                Filter
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Aktive Filter Tags */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filter.suche && (
                  <span className="bg-street-800 text-street-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Suche: {filter.suche}
                    <button onClick={() => setFilter({ ...filter, suche: '' })}><X size={14} /></button>
                  </span>
                )}
                {filter.kategorie && (
                  <span className="bg-street-800 text-street-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {kategorien.find(k => k.id == filter.kategorie)?.name}
                    <button onClick={() => setFilter({ ...filter, kategorie: '' })}><X size={14} /></button>
                  </span>
                )}
                {filter.geschlecht && (
                  <span className="bg-street-800 text-street-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {filter.geschlecht}
                    <button onClick={() => setFilter({ ...filter, geschlecht: '' })}><X size={14} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Artikel Grid */}
            {loading ? (
              <div className="grid-street">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-square bg-street-800 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : artikel.length > 0 ? (
              <>
                <div className="grid-street stagger-children">
                  {artikel.map((a) => (
                    <ArtikelCard key={a.id} artikel={a} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.seiten > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {[...Array(pagination.seiten)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.set('seite', i + 1);
                          setSearchParams(params);
                        }}
                        className={`w-10 h-10 rounded font-semibold transition-colors ${
                          pagination.seite === i + 1
                            ? 'bg-primary text-white'
                            : 'bg-street-800 text-street-400 hover:bg-street-700'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <Shirt size={64} className="mx-auto text-street-700 mb-4" />
                <h3 className="font-street text-xl text-white mb-2">Keine Artikel gefunden</h3>
                <p className="text-street-400 mb-6">Versuch es mit anderen Filtern.</p>
                <button onClick={resetFilter} className="btn-street-outline">
                  Filter zurücksetzen
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80" onClick={() => setFilterOpen(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-street-900 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-street text-xl text-white">Filter</h3>
              <button onClick={() => setFilterOpen(false)} className="text-street-400">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Mobile Filter Fields - same as desktop */}
              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">Suche</label>
                <input
                  type="text"
                  placeholder="Artikel suchen..."
                  value={filter.suche}
                  onChange={(e) => setFilter({ ...filter, suche: e.target.value })}
                  className="input-street"
                />
              </div>

              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">Kategorie</label>
                <select
                  value={filter.kategorie}
                  onChange={(e) => setFilter({ ...filter, kategorie: e.target.value })}
                  className="input-street"
                >
                  <option value="">Alle Kategorien</option>
                  {kategorien.map((k) => (
                    <option key={k.id} value={k.id}>{k.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">Für</label>
                <select
                  value={filter.geschlecht}
                  onChange={(e) => setFilter({ ...filter, geschlecht: e.target.value })}
                  className="input-street"
                >
                  <option value="">Alle</option>
                  {geschlechter.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={applyFilter} className="btn-street flex-1">
                  Anwenden
                </button>
                <button onClick={resetFilter} className="btn-street-outline flex-1">
                  Zurücksetzen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default Artikel;
