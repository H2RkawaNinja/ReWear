import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, Check } from 'lucide-react';
import api from '../../services/api';

const Rollen = () => {
  const [rollen, setRollen] = useState([]);
  const [rechte, setRechte] = useState({ rechte: [], gruppiert: {} });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRolle, setEditingRolle] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    farbe: '#6B7280',
    beschreibung: '',
    rechte: []
  });

  const loadData = async () => {
    try {
      const [rollenRes, rechteRes] = await Promise.all([
        api.get('/rollen'),
        api.get('/rechte')
      ]);
      setRollen(rollenRes.data);
      setRechte(rechteRes.data);
    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      farbe: '#6B7280',
      beschreibung: '',
      rechte: []
    });
    setEditingRolle(null);
    setShowForm(false);
  };

  const openEditForm = (rolle) => {
    setEditingRolle(rolle);
    setFormData({
      name: rolle.name,
      farbe: rolle.farbe,
      beschreibung: rolle.beschreibung || '',
      rechte: rolle.rechte?.map(r => r.id) || []
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingRolle) {
        await api.put(`/rollen/${editingRolle.id}`, formData);
      } else {
        await api.post('/rollen', formData);
      }

      resetForm();
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Rolle wirklich löschen?')) return;
    try {
      await api.delete(`/rollen/${id}`);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Löschen');
    }
  };

  const toggleRecht = (rechtId) => {
    setFormData(prev => ({
      ...prev,
      rechte: prev.rechte.includes(rechtId)
        ? prev.rechte.filter(id => id !== rechtId)
        : [...prev.rechte, rechtId]
    }));
  };

  const selectAllRechte = () => {
    setFormData(prev => ({
      ...prev,
      rechte: rechte.rechte.map(r => r.id)
    }));
  };

  const deselectAllRechte = () => {
    setFormData(prev => ({
      ...prev,
      rechte: []
    }));
  };

  const predefinedColors = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6',
    '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#1F2937'
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-street text-3xl text-white flex items-center gap-3">
            <Shield className="text-neon-blue" />
            Rollen & Rechte
          </h1>
          <p className="text-street-400">Berechtigungen für Mitarbeiter verwalten</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-street flex items-center gap-2">
            <Plus size={20} />
            Neue Rolle
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="street-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-street text-xl text-white">
              {editingRolle ? 'Rolle bearbeiten' : 'Neue Rolle'}
            </h2>
            <button onClick={resetForm} className="text-street-400 hover:text-white">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Manager"
                    className="input-street"
                    required
                  />
                </div>

                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">Farbe</label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, farbe: color })}
                          className={`w-8 h-8 rounded transition-transform ${
                            formData.farbe === color ? 'scale-110 ring-2 ring-white' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={formData.farbe}
                      onChange={(e) => setFormData({ ...formData, farbe: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                  </div>
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
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-street-300 text-sm font-semibold">
                    Berechtigungen ({formData.rechte.length}/{rechte.rechte.length})
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllRechte}
                      className="text-xs text-primary hover:text-secondary"
                    >
                      Alle
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllRechte}
                      className="text-xs text-street-400 hover:text-white"
                    >
                      Keine
                    </button>
                  </div>
                </div>

                <div className="h-64 overflow-y-auto border border-street-700 rounded-lg p-2 space-y-4">
                  {Object.entries(rechte.gruppiert).map(([kategorie, kategorieRechte]) => (
                    <div key={kategorie}>
                      <p className="text-street-400 text-xs font-semibold uppercase tracking-wider mb-2">
                        {kategorie}
                      </p>
                      <div className="space-y-1">
                        {kategorieRechte.map((recht) => (
                          <label
                            key={recht.id}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                              formData.rechte.includes(recht.id)
                                ? 'bg-primary/20'
                                : 'hover:bg-street-800'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                              formData.rechte.includes(recht.id)
                                ? 'bg-primary border-primary'
                                : 'border-street-600'
                            }`}>
                              {formData.rechte.includes(recht.id) && (
                                <Check size={14} className="text-white" />
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.rechte.includes(recht.id)}
                              onChange={() => toggleRecht(recht.id)}
                              className="hidden"
                            />
                            <div>
                              <p className="text-white text-sm">{recht.name}</p>
                              {recht.beschreibung && (
                                <p className="text-street-500 text-xs">{recht.beschreibung}</p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={saving} className="btn-street flex-1">
                {saving ? 'Speichern...' : (editingRolle ? 'Speichern' : 'Rolle erstellen')}
              </button>
              <button type="button" onClick={resetForm} className="btn-street-outline">
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rollen Liste */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-street-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : rollen.length > 0 ? (
        <div className="grid gap-4">
          {rollen.map((rolle) => (
            <div key={rolle.id} className="street-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${rolle.farbe}30` }}
                  >
                    <Shield size={24} style={{ color: rolle.farbe }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 
                        className="font-street text-xl"
                        style={{ color: rolle.farbe }}
                      >
                        {rolle.name}
                      </h3>
                    </div>
                    {rolle.beschreibung && (
                      <p className="text-street-400 text-sm mt-1">{rolle.beschreibung}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rolle.rechte?.slice(0, 5).map((recht) => (
                        <span 
                          key={recht.id}
                          className="px-2 py-0.5 bg-street-800 rounded text-xs text-street-400"
                        >
                          {recht.name}
                        </span>
                      ))}
                      {rolle.rechte?.length > 5 && (
                        <span className="px-2 py-0.5 bg-street-800 rounded text-xs text-street-500">
                          +{rolle.rechte.length - 5} mehr
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditForm(rolle)}
                    className="p-2 text-street-400 hover:text-primary transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(rolle.id)}
                    className="p-2 text-street-400 hover:text-red-500 transition-colors"
                    title="Löschen"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Shield size={48} className="mx-auto text-street-700 mb-4" />
          <h3 className="font-street text-xl text-white mb-2">Keine Rollen</h3>
          <p className="text-street-400 mb-6">Erstelle deine erste Rolle!</p>
          <button onClick={() => setShowForm(true)} className="btn-street">
            Rolle erstellen
          </button>
        </div>
      )}
    </div>
  );
};

export default Rollen;
