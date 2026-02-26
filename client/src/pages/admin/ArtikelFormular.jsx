import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Save } from 'lucide-react';
import api from '../../services/api';

const ArtikelFormular = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [kategorien, setKategorien] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    beschreibung: '',
    kategorie_id: '',
    geschlecht: 'Unisex',
    ankaufspreis: '',
    verkaufspreis: ''
  });
  const [bilder, setBilder] = useState([]);
  const [existingBilder, setExistingBilder] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Kategorien laden
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

  // Artikel laden wenn bearbeiten
  useEffect(() => {
    if (!isEdit) return;

    const loadArtikel = async () => {
      try {
        const res = await api.get(`/artikel/${id}`);
        const a = res.data;
        setFormData({
          name: a.name,
          beschreibung: a.beschreibung || '',
          kategorie_id: a.kategorie_id,
          geschlecht: a.geschlecht,
          ankaufspreis: a.ankaufspreis,
          verkaufspreis: a.verkaufspreis
        });
        setExistingBilder(a.bilder || []);
      } catch (error) {
        console.error('Fehler:', error);
        navigate('/admin/artikel');
      } finally {
        setLoading(false);
      }
    };

    loadArtikel();
  }, [id, isEdit, navigate]);

  // Bilder Preview
  useEffect(() => {
    const urls = bilder.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [bilder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setBilder(prev => [...prev, ...files]);
  };

  const removeNewBild = (index) => {
    setBilder(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingBild = async (index) => {
    if (isEdit) {
      try {
        await api.delete(`/artikel/${id}/bilder/${index}`);
        setExistingBilder(prev => prev.filter((_, i) => i !== index));
      } catch (error) {
        alert('Fehler beim Entfernen des Bildes');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') data.append(key, value);
      });
      bilder.forEach(file => data.append('bilder', file));

      if (isEdit) {
        await api.put(`/artikel/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/artikel', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/admin/artikel');
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-street-800 rounded"></div>
        <div className="h-96 bg-street-800 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/artikel')}
          className="p-2 text-street-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-street text-3xl text-white">
          {isEdit ? 'Artikel bearbeiten' : 'Neuer Artikel'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hauptinfos */}
          <div className="lg:col-span-2 space-y-6">
            <div className="street-card p-6 space-y-4">
              <h2 className="font-street text-lg text-white">Grundinfos</h2>
              
              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-street"
                  required
                />
              </div>

              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">
                  Beschreibung
                </label>
                <textarea
                  name="beschreibung"
                  value={formData.beschreibung}
                  onChange={handleChange}
                  rows={4}
                  className="input-street resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">
                    Kategorie *
                  </label>
                  <select
                    name="kategorie_id"
                    value={formData.kategorie_id}
                    onChange={handleChange}
                    className="input-street"
                    required
                  >
                    <option value="">Wählen...</option>
                    {kategorien.map((k) => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="street-card p-6 space-y-4">
              <h2 className="font-street text-lg text-white">Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">
                    Für
                  </label>
                  <select
                    name="geschlecht"
                    value={formData.geschlecht}
                    onChange={handleChange}
                    className="input-street"
                  >
                    <option value="Männlich">Männlich</option>
                    <option value="Weiblich">Weiblich</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="street-card p-6 space-y-4">
              <h2 className="font-street text-lg text-white">Preise</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">
                    MAX Ankaufspreis
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-street-500">$</span>
                    <input
                      type="number"
                      name="ankaufspreis"
                      value={formData.ankaufspreis}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="input-street pl-8"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">
                    Verkaufspreis *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-street-500">$</span>
                    <input
                      type="number"
                      name="verkaufspreis"
                      value={formData.verkaufspreis}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="input-street pl-8"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bilder */}
          <div className="space-y-6">
            <div className="street-card p-6">
              <h2 className="font-street text-lg text-white mb-4">Bilder</h2>
              
              {/* Upload Area */}
              <label className="block border-2 border-dashed border-street-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                <Upload size={32} className="mx-auto text-street-500 mb-2" />
                <p className="text-street-400 text-sm">Bilder hochladen</p>
                <p className="text-street-600 text-xs mt-1">Max. 5MB pro Bild</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Existing Images */}
              {existingBilder.length > 0 && (
                <div className="mt-4">
                  <p className="text-street-400 text-sm mb-2">Vorhandene Bilder:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {existingBilder.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded overflow-hidden group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingBild(i)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {previewUrls.length > 0 && (
                <div className="mt-4">
                  <p className="text-street-400 text-sm mb-2">Neue Bilder:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded overflow-hidden group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewBild(i)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="btn-street w-full flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Speichern...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isEdit ? 'Änderungen speichern' : 'Artikel erstellen'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArtikelFormular;
