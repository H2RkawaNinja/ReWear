import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Upload, X, Check, ChevronDown, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const emptyForm = {
  name: '',
  beschreibung: '',
  kategorie_id: '',
  geschlecht: 'Unisex',
  ankaufspreis: '',
  verkaufspreis: ''
};

const Ankauf = () => {
  const navigate = useNavigate();
  const [vorlagen, setVorlagen] = useState([]);
  const [kategorien, setKategorien] = useState([]);
  const [selectedVorlage, setSelectedVorlage] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [bilder, setBilder] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [vRes, kRes] = await Promise.all([
          api.get('/artikel/vorlagen'),
          api.get('/kategorien')
        ]);
        setVorlagen(vRes.data);
        setKategorien(kRes.data);
      } catch (err) {
        console.error('Fehler beim Laden:', err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const urls = bilder.map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [bilder]);

  const handleVorlageChange = (e) => {
    const id = e.target.value;
    setSelectedVorlage(id);
    if (!id) {
      setFormData(emptyForm);
      return;
    }
    const v = vorlagen.find(v => String(v.id) === String(id));
    if (v) {
      setFormData({
        name: v.name || '',
        beschreibung: v.beschreibung || '',
        kategorie_id: v.kategorie_id || '',
        geschlecht: v.geschlecht || 'Unisex',
        ankaufspreis: v.ankaufspreis || '',
        verkaufspreis: v.verkaufspreis || ''
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setBilder(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const removeBild = (index) => {
    setBilder(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setSelectedVorlage('');
    setFormData(emptyForm);
    setBilder([]);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v !== '') data.append(k, v); });
      bilder.forEach(f => data.append('bilder', f));

      await api.post('/artikel', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Fehler beim Ankauf');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-neon-green" />
        </div>
        <h1 className="font-street text-3xl text-white mb-4">Ankauf erfolgreich!</h1>
        <p className="text-street-400 mb-8">
          Der Artikel wurde angelegt. Er muss noch im Sortiment freigeschaltet werden.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button onClick={resetForm} className="btn-street">
            Weiteren Artikel ankaufen
          </button>
          <button onClick={() => navigate('/admin/artikel')} className="btn-street-outline">
            Zum Sortiment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package size={32} className="text-neon-green" />
        </div>
        <h1 className="font-street text-3xl text-white mb-2">Neuer Ankauf</h1>
        <p className="text-street-400">Artikel vom Kunden ankaufen und ins Sortiment aufnehmen</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Vorlage auswählen */}
        <div className="street-card p-6">
          <h2 className="font-street text-lg text-white mb-1">Artikelvorlage wählen</h2>
          <p className="text-street-500 text-sm mb-4">Wähle eine Vorlage aus den Stammdaten – die Felder werden automatisch befüllt.</p>

          {vorlagen.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-street-800 rounded-lg text-street-400 text-sm">
              <AlertCircle size={18} className="text-yellow-500 shrink-0" />
              Noch keine Vorlagen vorhanden. Bitte zuerst{' '}
              <button
                type="button"
                onClick={() => navigate('/admin/stammdaten')}
                className="text-neon-green hover:underline"
              >
                Artikelstammdaten anlegen
              </button>.
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedVorlage}
                onChange={handleVorlageChange}
                className="input-street appearance-none pr-10"
              >
                <option value="">— Vorlage auswählen —</option>
                {vorlagen.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name}{v.kategorie ? ` (${v.kategorie.name})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-street-500 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Bilder */}
        <div className="street-card p-6">
          <h2 className="font-street text-lg text-white mb-4">Fotos</h2>
          <label className="block border-2 border-dashed border-street-600 rounded-lg p-8 text-center cursor-pointer hover:border-neon-green transition-colors">
            <Upload size={32} className="mx-auto text-street-500 mb-2" />
            <p className="text-street-400">Fotos aufnehmen oder hochladen</p>
            <input type="file" multiple accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          </label>
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {previewUrls.map((url, i) => (
                <div key={i} className="relative aspect-square rounded overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeBild(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Artikel Info */}
        <div className="street-card p-6 space-y-4">
          <h2 className="font-street text-lg text-white">Artikelinformationen</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-street-300 text-sm font-semibold mb-2">Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="z.B. Nike Air Force 1" className="input-street" required />
            </div>

            <div>
              <label className="block text-street-300 text-sm font-semibold mb-2">Kategorie *</label>
              <select name="kategorie_id" value={formData.kategorie_id} onChange={handleChange}
                className="input-street" required>
                <option value="">Wählen...</option>
                {kategorien.map(k => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-street-300 text-sm font-semibold mb-2">Für</label>
              <select name="geschlecht" value={formData.geschlecht} onChange={handleChange} className="input-street">
                <option value="Männlich">Männlich</option>
                <option value="Weiblich">Weiblich</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-street-300 text-sm font-semibold mb-2">Beschreibung</label>
            <textarea name="beschreibung" value={formData.beschreibung} onChange={handleChange}
              rows={3} placeholder="Zusätzliche Details, Mängel, etc." className="input-street resize-none" />
          </div>
        </div>

        {/* Preise */}
        <div className="street-card p-6">
          <h2 className="font-street text-lg text-white mb-4">Preise</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-street-300 text-sm font-semibold mb-2">MAX-Ankaufspreis ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-street-500">$</span>
                <input type="number" name="ankaufspreis" value={formData.ankaufspreis} onChange={handleChange}
                  step="1" min="0" placeholder="0" className="input-street pl-8" />
              </div>
            </div>
            <div>
              <label className="block text-street-300 text-sm font-semibold mb-2">Verkaufspreis ($) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-street-500">$</span>
                <input type="number" name="verkaufspreis" value={formData.verkaufspreis} onChange={handleChange}
                  step="1" min="0" placeholder="0" className="input-street pl-8" required />
              </div>
            </div>
          </div>

          {formData.ankaufspreis && formData.verkaufspreis && (
            <div className="mt-4 p-3 bg-street-800 rounded-lg">
              <p className="text-street-400 text-sm">
                Erwarteter Gewinn:{' '}
                <span className="text-neon-green font-semibold">
                  ${(parseFloat(formData.verkaufspreis) - parseFloat(formData.ankaufspreis)).toFixed(0)}
                </span>
              </p>
            </div>
          )}
        </div>

        <button type="submit" disabled={saving}
          className="btn-street w-full flex items-center justify-center gap-2 py-4 text-lg">
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Wird angelegt...
            </>
          ) : (
            <>
              <Package size={24} />
              Artikel ankaufen
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Ankauf;
