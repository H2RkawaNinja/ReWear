import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Globe, EyeOff, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ArtikelVerwalten = () => {
  const [artikel, setArtikel] = useState([]);
  const [kategorien, setKategorien] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ seite: 1, seiten: 1, gesamt: 0 });
  const [filter, setFilter] = useState({
    suche: '',
    kategorie: '',
    status: 'verfuegbar'
  });
  const { hasPermission } = useAuth();

  const loadArtikel = async (seite = 1) => {
    setLoading(true);
    try {
      const params = { seite, limit: 20, admin: 1 };
      if (filter.suche) params.suche = filter.suche;
      if (filter.kategorie) params.kategorie = filter.kategorie;
      if (filter.status) params.status = filter.status;
      
      const res = await api.get('/artikel', { params });
      setArtikel(res.data.artikel);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadKategorien = async () => {
      try {
        const res = await api.get('/kategorien');
        setKategorien(res.data);
      } catch (error) {
        console.error('Fehler:', error);
      }
    };
    loadKategorien();
  }, []);

  useEffect(() => {
    loadArtikel();
  }, [filter]);

  const handleDelete = async (id) => {
    if (!confirm('Artikel wirklich löschen?')) return;
    
    try {
      await api.delete(`/artikel/${id}`);
      loadArtikel(pagination.seite);
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Löschen');
    }
  };

  const handleStatusChange = async (id, neuerStatus) => {
    try {
      await api.patch(`/artikel/${id}/status`, { status: neuerStatus });
      // Artikel sofort entfernen wenn neuer Status nicht zum Filter passt
      if (filter.status && filter.status !== neuerStatus) {
        setArtikel(prev => prev.filter(a => a.id !== id));
      } else {
        loadArtikel(pagination.seite);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Ändern');
    }
  };

  const handleFreischalten = async (id) => {
    try {
      await api.patch(`/artikel/${id}/freischalten`);
      loadArtikel(pagination.seite);
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Freischalten');
    }
  };

  const statusBadge = {
    verfuegbar: 'badge-available',
    reserviert: 'badge-reserved',
    verkauft: 'badge-sold'
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-street text-3xl text-white">Artikel</h1>
          <p className="text-street-400">{pagination.gesamt} Artikel insgesamt</p>
        </div>
        {hasPermission('artikel.erstellen') && (
          <Link to="/admin/artikel/neu" className="btn-street flex items-center gap-2">
            <Plus size={20} />
            Neuer Artikel
          </Link>
        )}
      </div>

      {/* Filter */}
      <div className="street-card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-street-500" />
            <input
              type="text"
              placeholder="Suchen..."
              value={filter.suche}
              onChange={(e) => setFilter({ ...filter, suche: e.target.value })}
              className="input-street pl-10"
            />
          </div>
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
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="input-street"
          >
            <option value="">Alle Status</option>
            <option value="verfuegbar">Verfügbar</option>
            <option value="reserviert">Reserviert</option>
            <option value="verkauft">Verkauft</option>
          </select>
          <button
            onClick={() => setFilter({ suche: '', kategorie: '', status: 'verfuegbar' })}
            className="btn-street-outline"
          >
            Zurücksetzen
          </button>
        </div>
      </div>

      {/* Tabelle */}
      <div className="street-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bild</th>
                <th>Name</th>
                <th>Kategorie</th>
                <th>Preis</th>
                <th>Status</th>
                <th>Shop</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7}>
                      <div className="h-12 bg-street-800 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : artikel.length > 0 ? (
                artikel.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="w-12 h-12 bg-street-800 rounded overflow-hidden">
                        {a.bilder?.[0] && (
                          <img 
                            src={a.bilder[0]} 
                            alt={a.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-semibold text-white">{a.name}</p>
                      </div>
                    </td>
                    <td className="text-street-300">{a.kategorie?.name || '-'}</td>
                    <td className="font-semibold text-white">${parseFloat(a.verkaufspreis).toFixed(0)}</td>
                    <td>
                      {hasPermission('artikel.bearbeiten') ? (
                        <div className="relative inline-flex items-center">
                          <select
                            value={a.status}
                            onChange={(e) => handleStatusChange(a.id, e.target.value)}
                            style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                            className={`pr-6 pl-3 py-1 rounded-full text-xs font-semibold border cursor-pointer outline-none transition-colors
                              ${ a.status === 'verfuegbar' ? 'bg-neon-green/20 text-neon-green border-neon-green/40 hover:bg-neon-green/30' : ''}
                              ${ a.status === 'reserviert' ? 'bg-orange-400/20 text-orange-400 border-orange-400/40 hover:bg-orange-400/30' : ''}
                              ${ a.status === 'verkauft'   ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30' : ''}
                            `}
                          >
                            <option value="verfuegbar" style={{background:'#1a1a1a', color:'#fff'}}>Verfügbar</option>
                            <option value="reserviert" style={{background:'#1a1a1a', color:'#fff'}}>Reserviert</option>
                            <option value="verkauft"   style={{background:'#1a1a1a', color:'#fff'}}>Verkauft</option>
                          </select>
                          <ChevronDown
                            size={11}
                            className={`absolute right-1.5 pointer-events-none
                              ${ a.status === 'verfuegbar' ? 'text-neon-green' : ''}
                              ${ a.status === 'reserviert' ? 'text-orange-400' : ''}
                              ${ a.status === 'verkauft'   ? 'text-red-400' : ''}
                            `}
                          />
                        </div>
                      ) : (
                        <span className={`badge ${statusBadge[a.status]}`}>
                          {a.status === 'verfuegbar' ? 'Verfügbar' : 
                           a.status === 'reserviert' ? 'Reserviert' : 'Verkauft'}
                        </span>
                      )}
                    </td>
                    <td>
                      {hasPermission('artikel.bearbeiten') ? (
                        <button
                          onClick={() => handleFreischalten(a.id)}
                          title={a.freigegeben ? 'Im Shop sichtbar – klicken zum Sperren' : 'Nicht sichtbar – klicken zum Freischalten'}
                          className={`p-1.5 rounded-full transition-colors ${
                            a.freigegeben
                              ? 'bg-neon-green/20 text-neon-green hover:bg-red-900/30 hover:text-red-400'
                              : 'bg-street-800 text-street-500 hover:bg-neon-green/20 hover:text-neon-green'
                          }`}
                        >
                          {a.freigegeben ? <Globe size={16} /> : <EyeOff size={16} />}
                        </button>
                      ) : (
                        <span className={a.freigegeben ? 'text-neon-green' : 'text-street-600'}>
                          {a.freigegeben ? <Globe size={16} /> : <EyeOff size={16} />}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/artikel/${a.id}`}
                          target="_blank"
                          className="p-2 text-street-400 hover:text-white transition-colors"
                          title="Ansehen"
                        >
                          <Eye size={18} />
                        </Link>
                        {hasPermission('artikel.bearbeiten') && (
                          <Link
                            to={`/admin/artikel/${a.id}`}
                            className="p-2 text-street-400 hover:text-primary transition-colors"
                            title="Bearbeiten"
                          >
                            <Edit size={18} />
                          </Link>
                        )}
                        {hasPermission('artikel.loeschen') && a.status !== 'verkauft' && (
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="p-2 text-street-400 hover:text-red-500 transition-colors"
                            title="Löschen"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-street-500">
                    Keine Artikel gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.seiten > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-street-700">
            {[...Array(pagination.seiten)].map((_, i) => (
              <button
                key={i}
                onClick={() => loadArtikel(i + 1)}
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
      </div>
    </div>
  );
};

export default ArtikelVerwalten;
