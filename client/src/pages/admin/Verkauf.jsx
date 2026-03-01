import { useState, useEffect } from 'react';
import { ShoppingBag, Search, RotateCcw, Tag, X, Banknote, TrendingDown, TrendingUp, CheckCircle, Trash2 } from 'lucide-react';
import api from '../../services/api';

// ─── Verkauf-Modal ────────────────────────────────────────────────────────────
const VerkaufModal = ({ artikel, onClose, onSuccess }) => {
  const [preis, setPreis] = useState(parseFloat(artikel.verkaufspreis).toFixed(2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const vorschlagsPreis = parseFloat(artikel.verkaufspreis);
  const eingabePreis = parseFloat(preis) || 0;
  const differenz = eingabePreis - vorschlagsPreis;

  const getBilder = (b) => {
    if (Array.isArray(b)) return b;
    if (typeof b === 'string') { try { const p = JSON.parse(b); return Array.isArray(p) ? p : []; } catch { return []; } }
    return [];
  };
  const bild = getBilder(artikel.bilder)[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const p = parseFloat(preis);
    if (!preis || isNaN(p) || p <= 0) { setError('Bitte einen gültigen Preis eingeben.'); return; }
    setSaving(true);
    try {
      await api.patch(`/artikel/${artikel.id}/verkaufen`, { verkaufspreis: p });
      onSuccess(artikel.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Verkaufen');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-street-900 border border-street-700 rounded-xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-street-700">
          <h2 className="font-street text-xl text-white flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            Artikel verkaufen
          </h2>
          <button onClick={onClose} className="text-street-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {/* Artikel-Info */}
        <div className="p-5 border-b border-street-700">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-lg bg-street-800 overflow-hidden flex-shrink-0">
              {bild
                ? <img src={bild} alt={artikel.name} className="w-full h-full object-cover" onError={e => { e.target.src = 'https://via.placeholder.com/64x64/1a1a1a/666?text=?'; }} />
                : <div className="w-full h-full flex items-center justify-center"><Tag size={20} className="text-street-600" /></div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-primary text-xs font-semibold uppercase tracking-wider">{artikel.kategorie?.name}</p>
              <h3 className="text-white font-semibold mt-0.5 truncate">{artikel.name}</h3>
              <p className="text-street-400 text-sm mt-1">
                VK-Vorschlag: <span className="text-white font-semibold">${vorschlagsPreis.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Formular */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-street-300 text-sm font-medium mb-2">Tatsächlicher Verkaufspreis *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-street-400 font-semibold">$</span>
              <input
                type="number" step="0.01" min="0.01"
                value={preis}
                onChange={e => { setPreis(e.target.value); setError(''); }}
                className="input-street pl-8 w-full text-lg font-semibold"
                autoFocus
              />
            </div>
            {preis && !isNaN(eingabePreis) && eingabePreis > 0 && Math.abs(differenz) > 0.01 && (
              <div className={`flex items-center gap-1.5 mt-2 text-sm font-medium ${differenz > 0 ? 'text-neon-green' : 'text-orange-400'}`}>
                {differenz > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {differenz > 0 ? '+' : ''}${differenz.toFixed(2)} zum Vorschlag
              </div>
            )}
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          {parseFloat(artikel.ankaufspreis) > 0 && (
            <div className="bg-street-800 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-street-400">Ankaufspreis</span>
                <span className="text-street-300">${parseFloat(artikel.ankaufspreis).toFixed(2)}</span>
              </div>
              {eingabePreis > 0 && (
                <div className="flex justify-between border-t border-street-700 pt-1">
                  <span className="text-street-400">Marge</span>
                  <span className={eingabePreis >= parseFloat(artikel.ankaufspreis) ? 'text-neon-green font-semibold' : 'text-red-400 font-semibold'}>
                    ${(eingabePreis - parseFloat(artikel.ankaufspreis)).toFixed(2)}
                    &nbsp;({parseFloat(artikel.ankaufspreis) > 0
                      ? (((eingabePreis - parseFloat(artikel.ankaufspreis)) / parseFloat(artikel.ankaufspreis)) * 100).toFixed(0)
                      : '∞'}%)
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded bg-street-800 text-street-300 hover:text-white transition-colors text-sm font-medium">
              Abbrechen
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded bg-primary text-black font-semibold text-sm hover:bg-primary/80 transition-colors flex items-center justify-center gap-2">
              {saving ? 'Wird gespeichert...' : <><CheckCircle size={16} /> Verkauf bestätigen</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Hauptseite ───────────────────────────────────────────────────────────────
const Verkauf = () => {
  const [artikel, setArtikel] = useState([]);
  const [kategorien, setKategorien] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suche, setSuche] = useState('');
  const [kategorie, setKategorie] = useState('');
  const [filter, setFilter] = useState('verfuegbar');
  const [verkaufArtikel, setVerkaufArtikel] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    api.get('/kategorien').then(r => setKategorien(r.data)).catch(() => {});
  }, []);

  const loadArtikel = async () => {
    setLoading(true);
    try {
      const res = await api.get('/artikel', {
        params: {
          admin: true,
          status: filter,
          suche: suche || undefined,
          kategorie: kategorie || undefined,
          limit: 50
        }
      });
      setArtikel(res.data.artikel);
    } catch (err) {
      console.error('Fehler:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtikel();
  }, [filter, suche, kategorie]);

  const handleVerkaufSuccess = (id) => {
    setVerkaufArtikel(null);
    // Artikel sofort aus der Liste entfernen (bei filter=verfuegbar)
    if (filter === 'verfuegbar') {
      setArtikel(prev => prev.filter(a => a.id !== id));
    } else {
      // Bei filter=verkauft: Status des Artikels im Array aktualisieren
      setArtikel(prev => prev.map(a => a.id === id ? { ...a, status: 'verkauft' } : a));
    }
    // Hintergrund-Refresh für konsistente Daten
    setTimeout(() => loadArtikel(), 300);
  };

  const handleRueckgaengig = async (id) => {
    if (!confirm('Verkauf rückgängig machen?')) return;
    setProcessing(id);
    try {
      await api.patch(`/artikel/${id}/verkauf-rueckgaengig`);
      loadArtikel();
    } catch (err) {
      alert(err.response?.data?.error || 'Fehler');
    } finally {
      setProcessing(null);
    }
  };
  const handleDelete = async (id) => {
    if (!confirm('Artikel wirklich löschen? Diese Aktion kann nicht rükgängig gemacht werden.')) return;
    setProcessing(id);
    try {
      await api.delete(`/artikel/${id}`);
      setArtikel(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Fehler beim Löschen');
    } finally {
      setProcessing(null);
    }
  };
  const getBilder = (bilder) => {
    if (Array.isArray(bilder)) return bilder;
    if (typeof bilder === 'string') {
      try { const p = JSON.parse(bilder); return Array.isArray(p) ? p : []; } catch { return []; }
    }
    return [];
  };

  return (
    <div>
      {/* Modal */}
      {verkaufArtikel && (
        <VerkaufModal
          artikel={verkaufArtikel}
          onClose={() => setVerkaufArtikel(null)}
          onSuccess={handleVerkaufSuccess}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-street text-3xl text-white flex items-center gap-3">
            <ShoppingBag className="text-neon-green" />
            Verkauf
          </h1>
          <p className="text-street-400">Artikel als verkauft erfassen</p>
        </div>
      </div>

      {/* Filter + Suche */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-street-400" />
          <input
            type="text"
            placeholder="Artikel suchen..."
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            className="input-street pl-10 w-full"
          />
        </div>
        <select
          value={kategorie}
          onChange={(e) => setKategorie(e.target.value)}
          className="input-street sm:w-48"
        >
          <option value="">Alle Kategorien</option>
          {kategorien.map(k => (
            <option key={k.id} value={k.id}>{k.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('verfuegbar')}
            className={`px-4 py-2 text-sm font-medium rounded transition-all ${
              filter === 'verfuegbar'
                ? 'bg-primary text-black'
                : 'bg-street-800 text-street-300 hover:text-white'
            }`}
          >
            Verfügbar
          </button>
          <button
            onClick={() => setFilter('verkauft')}
            className={`px-4 py-2 text-sm font-medium rounded transition-all ${
              filter === 'verkauft'
                ? 'bg-primary text-black'
                : 'bg-street-800 text-street-300 hover:text-white'
            }`}
          >
            Verkauft
          </button>
        </div>
      </div>

      {/* Artikel Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="street-card h-72 animate-pulse bg-street-800" />
          ))}
        </div>
      ) : artikel.length === 0 ? (
        <div className="street-card p-12 text-center">
          <ShoppingBag size={48} className="mx-auto text-street-600 mb-3" />
          <p className="text-street-400">Keine Artikel gefunden</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {artikel.map((a) => {
            const bilder = getBilder(a.bilder);
            const bild = bilder[0];

            return (
              <div key={a.id} className="street-card overflow-hidden flex flex-col group hover:border-street-600 transition-colors">
                <div className="aspect-square bg-street-800 relative overflow-hidden">
                  {bild ? (
                    <img src={bild} alt={a.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300/1a1a1a/666?text=Kein+Bild'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tag size={32} className="text-street-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`badge ${a.status === 'verkauft' ? 'badge-sold' : 'badge-available'}`}>
                      {a.status === 'verkauft' ? 'Verkauft' : 'Verfügbar'}
                    </span>
                  </div>
                </div>

                <div className="p-3 flex flex-col flex-1">
                  <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-0.5">{a.kategorie?.name}</p>
                  <h3 className="text-white font-semibold text-sm truncate mb-2">{a.name}</h3>

                  <div className="mt-auto space-y-1 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-street-500 text-xs">VK-Preis</span>
                      <span className="text-white font-street text-lg">${parseFloat(a.verkaufspreis).toFixed(2)}</span>
                    </div>
                    {parseFloat(a.ankaufspreis) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-street-500 text-xs">Ankauf</span>
                        <span className="text-street-400 text-xs">${parseFloat(a.ankaufspreis).toFixed(2)}</span>
                      </div>
                    )}
                    {a.status === 'verkauft' && a.verkaeufer && (
                      <div className="flex justify-between items-center">
                        <span className="text-street-500 text-xs">Verkauft von</span>
                        <span className="text-street-300 text-xs">{a.verkaeufer.vorname} {a.verkaeufer.nachname}</span>
                      </div>
                    )}
                  </div>

                  {a.status === 'verfuegbar' ? (
                    <button onClick={() => setVerkaufArtikel(a)}
                      className="w-full py-2 text-sm font-semibold rounded bg-primary text-black hover:bg-primary/80 transition-all flex items-center justify-center gap-2">
                      <Banknote size={15} /> Verkaufen
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => handleRueckgaengig(a.id)} disabled={processing === a.id}
                        className="flex-1 py-2 text-sm font-medium rounded bg-street-700 text-street-300 hover:text-white hover:bg-street-600 transition-all flex items-center justify-center gap-2">
                        <RotateCcw size={14} />
                        {processing === a.id ? '...' : 'Rükgängig'}
                      </button>
                      <button onClick={() => handleDelete(a.id)} disabled={processing === a.id}
                        className="py-2 px-3 text-sm font-medium rounded bg-street-700 text-street-400 hover:text-red-500 hover:bg-street-600 transition-all flex items-center justify-center"
                        title="Artikel löschen">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Verkauf;
