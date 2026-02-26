import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, BookOpen } from 'lucide-react';
import api from '../../services/api';

const emptyForm = {
  name: '',
  kategorie_id: '',
  geschlecht: 'Unisex',
  ankaufspreis: '',
  verkaufspreis: ''
};

const Artikelstammdaten = () => {
  const [vorlagen, setVorlagen] = useState([]);
  const [kategorien, setKategorien] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      const [vRes, kRes] = await Promise.allSettled([
        api.get('/artikel/vorlagen'),
        api.get('/kategorien')
      ]);
      if (vRes.status === 'fulfilled') setVorlagen(vRes.value.data);
      if (kRes.status === 'fulfilled') setKategorien(kRes.value.data);
    } catch (err) {
      console.error('Laden Fehler:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (v) => {
    setEditId(v.id);
    setFormData({
      name: v.name || '',
      kategorie_id: v.kategorie_id || '',
      geschlecht: v.geschlecht || 'Unisex',
      ankaufspreis: v.ankaufspreis || '',
      verkaufspreis: v.verkaufspreis || ''
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/artikel/vorlagen/${editId}`, formData);
      } else {
        await api.post('/artikel/vorlagen', formData);
      }
      setShowForm(false);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/artikel/vorlagen/${id}`);
      setDeleteId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Fehler beim Löschen');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-neon-green border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="text-neon-green" size={28} />
          <div>
            <h1 className="font-street text-2xl text-white">Artikelstammdaten</h1>
            <p className="text-street-400 text-sm">Artikelvorlagen für den Ankauf verwalten</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Neue Vorlage
        </button>
      </div>

      {/* Table */}
      {vorlagen.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen size={48} className="text-street-600 mx-auto mb-4" />
          <p className="text-street-400">Noch keine Vorlagen vorhanden.</p>
          <button onClick={openCreate} className="btn-primary mt-4">
            Erste Vorlage anlegen
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-street-800 bg-street-900">
                <th className="text-left px-4 py-3 text-street-400 text-sm font-medium">Name</th>
                <th className="text-left px-4 py-3 text-street-400 text-sm font-medium hidden md:table-cell">Kategorie</th>
                <th className="text-left px-4 py-3 text-street-400 text-sm font-medium hidden lg:table-cell">Geschlecht</th>
                <th className="text-right px-4 py-3 text-street-400 text-sm font-medium">Ankauf</th>
                <th className="text-right px-4 py-3 text-street-400 text-sm font-medium">Verkauf</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {vorlagen.map((v, i) => (
                <tr
                  key={v.id}
                  className={`border-b border-street-800/50 hover:bg-street-800/30 transition-colors ${
                    i % 2 === 0 ? '' : 'bg-street-900/30'
                  }`}
                >
                  <td className="px-4 py-3 text-white font-medium">{v.name}</td>
                  <td className="px-4 py-3 text-street-400 hidden md:table-cell">
                    {v.kategorie?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-street-400 hidden lg:table-cell">{v.geschlecht}</td>
                  <td className="px-4 py-3 text-right text-street-300">
                    {v.ankaufspreis ? `$${parseFloat(v.ankaufspreis).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-neon-green font-medium">
                    {v.verkaufspreis ? `$${parseFloat(v.verkaufspreis).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(v)}
                        className="p-1.5 rounded hover:bg-street-700 text-street-400 hover:text-white transition-colors"
                        title="Bearbeiten"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(v.id)}
                        className="p-1.5 rounded hover:bg-red-900/40 text-street-400 hover:text-red-400 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-street-950 border border-street-700 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-street-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neon-green/15 flex items-center justify-center">
                  <BookOpen size={16} className="text-neon-green" />
                </div>
                <h2 className="font-street text-lg text-white">
                  {editId ? 'Vorlage bearbeiten' : 'Neue Vorlage'}
                </h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-street-500 hover:text-white hover:bg-street-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">
                  Name <span className="text-neon-green">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-street"
                  placeholder="z.B. Hoodie Classic"
                  required
                  autoFocus
                />
              </div>

              {/* Kategorie + Geschlecht */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">
                    Kategorie <span className="text-neon-green">*</span>
                  </label>
                  <select
                    name="kategorie_id"
                    value={formData.kategorie_id}
                    onChange={handleChange}
                    className="input-street"
                    required
                  >
                    <option value="">Wählen...</option>
                    {kategorien.map(k => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">Geschlecht</label>
                  <select
                    name="geschlecht"
                    value={formData.geschlecht}
                    onChange={handleChange}
                    className="input-street"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Männlich">Männlich</option>
                    <option value="Weiblich">Weiblich</option>
                  </select>
                </div>
              </div>

              {/* Preise */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">MAX-Ankaufspreis</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-street-500 text-sm">$</span>
                    <input
                      type="number"
                      name="ankaufspreis"
                      value={formData.ankaufspreis}
                      onChange={handleChange}
                      className="input-street pl-7"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">Verkaufspreis</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-street-500 text-sm">$</span>
                    <input
                      type="number"
                      name="verkaufspreis"
                      value={formData.verkaufspreis}
                      onChange={handleChange}
                      className="input-street pl-7"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Gewinn-Anzeige */}
              {formData.ankaufspreis && formData.verkaufspreis && (
                <div className="px-3 py-2 bg-street-800 rounded-lg text-sm text-street-400">
                  Marge:{' '}
                  <span className="text-neon-green font-semibold">
                    ${(parseFloat(formData.verkaufspreis) - parseFloat(formData.ankaufspreis)).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 btn-street-outline"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-street flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {editId ? 'Speichern' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-street-900 border border-street-700 rounded-xl p-6 max-w-sm w-full text-center">
            <Trash2 size={40} className="text-red-400 mx-auto mb-4" />
            <h3 className="font-street text-xl text-white mb-2">Vorlage löschen?</h3>
            <p className="text-street-400 text-sm mb-6">Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-street-600 rounded-lg text-street-400 hover:text-white transition-colors text-sm">
                Abbrechen
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm">
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Artikelstammdaten;
