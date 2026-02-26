import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Sparkles, Archive, Check, Search } from 'lucide-react';
import api from '../../services/api';

const RematchEditor = () => {
  const [outfits, setOutfits] = useState([]);
  const [artikel, setArtikel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [artikelSuche, setArtikelSuche] = useState('');

  const [formData, setFormData] = useState({
    titel: '',
    beschreibung: '',
    gesamtpreis: '',
    woche_von: '',
    woche_bis: '',
    artikelIds: []
  });
  const [bild, setBild] = useState(null);
  const [bildPreview, setBildPreview] = useState('');

  const loadOutfits = async () => {
    try {
      const res = await api.get('/rematch');
      setOutfits(res.data);
    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArtikel = async () => {
    try {
      const res = await api.get('/artikel', { params: { status: 'verfuegbar', limit: 100 } });
      setArtikel(res.data.artikel);
    } catch (error) {
      console.error('Fehler:', error);
    }
  };

  useEffect(() => {
    loadOutfits();
    loadArtikel();
  }, []);

  const resetForm = () => {
    setFormData({
      titel: '',
      beschreibung: '',
      gesamtpreis: '',
      woche_von: '',
      woche_bis: '',
      artikelIds: []
    });
    setBild(null);
    setBildPreview('');
    setEditingOutfit(null);
    setShowForm(false);
  };

  const openEditForm = (outfit) => {
    setEditingOutfit(outfit);
    setFormData({
      titel: outfit.titel,
      beschreibung: outfit.beschreibung || '',
      gesamtpreis: outfit.gesamtpreis || '',
      woche_von: outfit.woche_von || '',
      woche_bis: outfit.woche_bis || '',
      artikelIds: outfit.artikel?.map(a => a.id) || []
    });
    setBildPreview(outfit.bild || '');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append('titel', formData.titel);
      data.append('beschreibung', formData.beschreibung);
      data.append('gesamtpreis', formData.gesamtpreis);
      data.append('woche_von', formData.woche_von);
      data.append('woche_bis', formData.woche_bis);
      data.append('artikel', JSON.stringify(formData.artikelIds));
      if (bild) data.append('bild', bild);

      if (editingOutfit) {
        await api.put(`/rematch/${editingOutfit.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/rematch', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      resetForm();
      loadOutfits();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.patch(`/rematch/${id}/aktivieren`);
      loadOutfits();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler');
    }
  };

  const handleArchive = async (id) => {
    if (!confirm('Outfit wirklich archivieren?')) return;
    try {
      await api.patch(`/rematch/${id}/archivieren`);
      loadOutfits();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Outfit wirklich löschen?')) return;
    try {
      await api.delete(`/rematch/${id}`);
      loadOutfits();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler');
    }
  };

  const toggleArtikel = (artikelId) => {
    setFormData(prev => ({
      ...prev,
      artikelIds: prev.artikelIds.includes(artikelId)
        ? prev.artikelIds.filter(id => id !== artikelId)
        : [...prev.artikelIds, artikelId]
    }));
  };

  const filteredArtikel = artikel.filter(a => 
    a.name.toLowerCase().includes(artikelSuche.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-street text-3xl text-white flex items-center gap-3">
            <Sparkles className="text-secondary" />
            Re:Match
          </h1>
          <p className="text-street-400">Outfit der Woche verwalten</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)} 
            className="btn-street flex items-center gap-2"
          >
            <Plus size={20} />
            Neues Outfit
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="street-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-street text-xl text-white">
              {editingOutfit ? 'Outfit bearbeiten' : 'Neues Outfit erstellen'}
            </h2>
            <button onClick={resetForm} className="text-street-400 hover:text-white">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">Titel *</label>
                  <input
                    type="text"
                    value={formData.titel}
                    onChange={(e) => setFormData({ ...formData, titel: e.target.value })}
                    placeholder="z.B. Streetwear Essentials"
                    className="input-street"
                    required
                  />
                </div>

                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">Beschreibung</label>
                  <textarea
                    value={formData.beschreibung}
                    onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                    rows={3}
                    className="input-street resize-none"
                  />
                </div>

                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">Gesamtpreis ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.gesamtpreis}
                    onChange={(e) => setFormData({ ...formData, gesamtpreis: e.target.value })}
                    placeholder="z.B. 49.99"
                    className="input-street"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-street-300 text-sm font-semibold mb-2">Woche von</label>
                    <input
                      type="date"
                      value={formData.woche_von}
                      onChange={(e) => setFormData({ ...formData, woche_von: e.target.value })}
                      className="input-street"
                    />
                  </div>
                  <div>
                    <label className="block text-street-300 text-sm font-semibold mb-2">Woche bis</label>
                    <input
                      type="date"
                      value={formData.woche_bis}
                      onChange={(e) => setFormData({ ...formData, woche_bis: e.target.value })}
                      className="input-street"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">Outfit-Bild</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setBild(file);
                      if (file) setBildPreview(URL.createObjectURL(file));
                    }}
                    className="input-street"
                  />
                  {bildPreview && (
                    <img src={bildPreview} alt="" className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">
                  Artikel im Outfit ({formData.artikelIds.length} ausgewählt)
                </label>
                
                <div className="relative mb-2">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-street-500" />
                  <input
                    type="text"
                    placeholder="Artikel suchen..."
                    value={artikelSuche}
                    onChange={(e) => setArtikelSuche(e.target.value)}
                    className="input-street pl-10"
                  />
                </div>

                <div className="h-64 overflow-y-auto border border-street-700 rounded-lg">
                  {filteredArtikel.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => toggleArtikel(a.id)}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                        formData.artikelIds.includes(a.id)
                          ? 'bg-primary/20 border-l-2 border-primary'
                          : 'hover:bg-street-800'
                      }`}
                    >
                      <div className="w-10 h-10 bg-street-700 rounded overflow-hidden flex-shrink-0">
                        {a.bilder?.[0] && (
                          <img src={a.bilder[0]} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white truncate">{a.name}</p>
                        <p className="text-street-500 text-sm">{a.groesse} • ${a.verkaufspreis}</p>
                      </div>
                      {formData.artikelIds.includes(a.id) && (
                        <Check size={18} className="text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={saving} className="btn-street flex-1">
                {saving ? 'Speichern...' : (editingOutfit ? 'Speichern' : 'Outfit erstellen')}
              </button>
              <button type="button" onClick={resetForm} className="btn-street-outline">
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Outfit Liste */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-street-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : outfits.length > 0 ? (
        <div className="grid gap-4">
          {outfits.map((outfit) => (
            <div 
              key={outfit.id} 
              className={`street-card p-4 ${outfit.aktiv ? 'ring-2 ring-secondary' : ''}`}
            >
              <div className="flex items-start gap-4">
                {outfit.bild ? (
                  <img 
                    src={outfit.bild} 
                    alt={outfit.titel}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-street-800 rounded-lg flex items-center justify-center">
                    <Sparkles className="text-street-600" />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-street text-xl text-white">{outfit.titel}</h3>
                        {outfit.aktiv && (
                          <span className="badge badge-available">AKTIV</span>
                        )}
                        {outfit.archiviert_am && (
                          <span className="badge bg-street-700 text-street-400">Archiviert</span>
                        )}
                      </div>
                      {outfit.beschreibung && (
                        <p className="text-street-400 text-sm mt-1">{outfit.beschreibung}</p>
                      )}
                      <p className="text-street-500 text-sm mt-2">
                        {outfit.artikel?.length || 0} Artikel
                        {outfit.woche_von && ` • ${outfit.woche_von} - ${outfit.woche_bis}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!outfit.aktiv && !outfit.archiviert_am && (
                        <button
                          onClick={() => handleActivate(outfit.id)}
                          className="p-2 text-neon-green hover:bg-neon-green/20 rounded transition-colors"
                          title="Aktivieren"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => openEditForm(outfit)}
                        className="p-2 text-street-400 hover:text-primary transition-colors"
                        title="Bearbeiten"
                      >
                        <Edit size={18} />
                      </button>
                      {!outfit.archiviert_am && (
                        <button
                          onClick={() => handleArchive(outfit.id)}
                          className="p-2 text-street-400 hover:text-secondary transition-colors"
                          title="Archivieren"
                        >
                          <Archive size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(outfit.id)}
                        className="p-2 text-street-400 hover:text-red-500 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Sparkles size={48} className="mx-auto text-street-700 mb-4" />
          <h3 className="font-street text-xl text-white mb-2">Keine Outfits</h3>
          <p className="text-street-400 mb-6">Erstelle dein erstes Re:Match Outfit!</p>
          <button onClick={() => setShowForm(true)} className="btn-street">
            Outfit erstellen
          </button>
        </div>
      )}
    </div>
  );
};

export default RematchEditor;
