import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCheck, UserX, Users, Banknote, CheckCircle2, X, AlertCircle, Copy, Link } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Mitarbeiter = () => {
  const [mitarbeiter, setMitarbeiter] = useState([]);
  const [rollen, setRollen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMitarbeiter, setEditingMitarbeiter] = useState(null);
  const [saving, setSaving] = useState(false);
  const { hasPermission, mitarbeiter: currentUser } = useAuth();

  // Auszahlung
  const [showAuszahlung, setShowAuszahlung] = useState(false);
  const [auszahlungStats, setAuszahlungStats] = useState([]);
  const [auszahlungLoading, setAuszahlungLoading] = useState(false);
  const [zahlend, setZahlend] = useState(new Set());
  const [setupLink, setSetupLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    benutzername: '',
    email: '',
    passwort: '',
    vorname: '',
    nachname: '',
    rollen_id: '',
    bankkonto: '',
    bonus_prozent: '5'
  });

  const loadData = async () => {
    try {
      const [mitarbeiterRes, rollenRes] = await Promise.all([
        api.get('/mitarbeiter'),
        api.get('/rollen')
      ]);
      setMitarbeiter(mitarbeiterRes.data);
      setRollen(rollenRes.data);
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
      benutzername: '',
      email: '',
      passwort: '',
      vorname: '',
      nachname: '',
      rollen_id: '',
      bankkonto: '',
      bonus_prozent: '5'
    });
    setEditingMitarbeiter(null);
    setShowForm(false);
  };

  const openEditForm = (m) => {
    setEditingMitarbeiter(m);
    setFormData({
      benutzername: m.benutzername,
      email: m.email,
      passwort: '',
      vorname: m.vorname,
      nachname: m.nachname,
      rollen_id: m.rollen_id,
      bankkonto: m.bankkonto || '',
      bonus_prozent: m.bonus_prozent || '5'
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = { ...formData };
      if (!data.passwort) delete data.passwort;

      if (editingMitarbeiter) {
        await api.put(`/mitarbeiter/${editingMitarbeiter.id}`, data);
      } else {
        const res = await api.post('/mitarbeiter', data);
        if (res.data.setup_token) {
          setSetupLink(`${window.location.origin}/passwort-einrichten/${res.data.setup_token}`);
        }
      }

      resetForm();
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (id, aktiv) => {
    try {
      await api.patch(`/mitarbeiter/${id}/status`, { aktiv: !aktiv });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Mitarbeiter wirklich löschen?')) return;
    try {
      await api.delete(`/mitarbeiter/${id}`);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Löschen');
    }
  };

  const canManage = hasPermission('mitarbeiter.verwalten');

  const loadAuszahlungStats = async () => {
    setAuszahlungLoading(true);
    try {
      const res = await api.get('/stats/mitarbeiter');
      setAuszahlungStats(res.data);
    } catch (error) {
      console.error('Auszahlung Stats Fehler:', error);
    } finally {
      setAuszahlungLoading(false);
    }
  };

  const openAuszahlung = () => {
    setShowAuszahlung(true);
    loadAuszahlungStats();
  };

  const handleAuszahlen = async (id) => {
    setZahlend(prev => new Set(prev).add(id));
    try {
      await api.post(`/mitarbeiter/${id}/auszahlen`);
      await loadAuszahlungStats();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Auszahlen');
    } finally {
      setZahlend(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const handleAlleAuszahlen = async () => {
    const offene = auszahlungStats.filter(m => parseFloat(m.bonus) > 0);
    if (!offene.length) return;
    if (!confirm(`Wirklich alle ${offene.length} Mitarbeiter als ausgezahlt markieren?`)) return;
    for (const m of offene) {
      await handleAuszahlen(m.id);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-street text-3xl text-white flex items-center gap-3">
            <Users className="text-neon-purple" />
            Mitarbeiter
          </h1>
          <p className="text-street-400">{mitarbeiter.length} Team-Mitglieder</p>
        </div>
        {canManage && !showForm && (
          <div className="flex gap-3">
            <button onClick={openAuszahlung} className="btn-street-outline flex items-center gap-2">
              <Banknote size={20} />
              Auszahlung
            </button>
            <button onClick={() => setShowForm(true)} className="btn-street flex items-center gap-2">
              <Plus size={20} />
              Neuer Mitarbeiter
            </button>
          </div>
        )}
      </div>

      {/* Auszahlungs-Modal */}
      {showAuszahlung && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="street-card w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-street-700">
              <div>
                <h2 className="font-street text-2xl text-white flex items-center gap-3">
                  <Banknote className="text-neon-green" />
                  Bonus Auszahlung
                </h2>
                <p className="text-street-400 text-sm mt-0.5">Offene Bonus-Beträge seit letzter Auszahlung</p>
              </div>
              <button onClick={() => setShowAuszahlung(false)} className="text-street-400 hover:text-white p-2 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6">
              {auszahlungLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-street-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (() => {
                const offene = auszahlungStats.filter(m => parseFloat(m.bonus) > 0);
                const erledigt = auszahlungStats.filter(m => parseFloat(m.bonus) <= 0);
                return (
                  <div className="space-y-4">
                    {offene.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-street-500">
                        <CheckCircle2 size={48} className="text-neon-green mb-3" />
                        <p className="text-white font-semibold">Alle ausgezahlt!</p>
                        <p className="text-sm mt-1">Es gibt keine offenen Bonus-Beträge.</p>
                      </div>
                    )}
                    {offene.length > 0 && (
                      <>
                        <div className="space-y-3">
                          {offene.map(m => (
                            <div key={m.id} className="bg-street-800 rounded-xl p-4 flex items-center gap-4">
                              {/* Avatar */}
                              <div className="w-10 h-10 rounded-full bg-street-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                {m.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold">{m.name}</p>
                                {m.bankkonto ? (
                                  <p className="text-street-400 text-sm font-mono">{m.bankkonto}</p>
                                ) : (
                                  <div className="flex items-center gap-1 text-orange-400 text-xs mt-0.5">
                                    <AlertCircle size={12} />
                                    Kein Bankkonto hinterlegt
                                  </div>
                                )}
                                <p className="text-street-500 text-xs mt-0.5">{m.verkaeufe} Verkäufe · ${m.umsatz} Umsatz · {m.bonus_prozent}%</p>
                              </div>
                              {/* Betrag */}
                              <div className="text-right flex-shrink-0">
                                <p className="text-neon-green font-street text-2xl">${parseFloat(m.bonus).toFixed(2)}</p>
                                <p className="text-street-500 text-xs">offen</p>
                              </div>
                              {/* Button */}
                              <button
                                onClick={() => handleAuszahlen(m.id)}
                                disabled={zahlend.has(m.id)}
                                className="btn-street flex items-center gap-2 flex-shrink-0 text-sm py-2 px-3"
                              >
                                {zahlend.has(m.id) ? (
                                  <span className="animate-pulse">...</span>
                                ) : (
                                  <>
                                    <CheckCircle2 size={16} />
                                    Überwiesen
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                        {/* Gesamt */}
                        <div className="bg-street-900 rounded-xl p-4 flex items-center justify-between border border-street-700">
                          <span className="text-street-400 font-semibold">Gesamt auszuzahlen</span>
                          <span className="text-neon-green font-street text-2xl">
                            ${offene.reduce((s, m) => s + parseFloat(m.bonus), 0).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                    {/* Bereits ausgezahlt */}
                    {erledigt.length > 0 && (
                      <div className="border-t border-street-700 pt-4">
                        <p className="text-street-500 text-xs uppercase tracking-widest mb-3">Aktuell kein offener Bonus</p>
                        <div className="space-y-2">
                          {erledigt.map(m => (
                            <div key={m.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-street-900/50 opacity-60">
                              <div className="w-8 h-8 rounded-full bg-street-700 flex items-center justify-center text-street-400 text-sm font-semibold flex-shrink-0">
                                {m.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-street-400 flex-1">{m.name}</span>
                              <CheckCircle2 size={16} className="text-neon-green" />
                              <span className="text-street-500 text-sm">$0.00</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="border-t border-street-700 p-6 flex gap-3">
              {auszahlungStats.filter(m => parseFloat(m.bonus) > 0).length > 1 && (
                <button
                  onClick={handleAlleAuszahlen}
                  className="btn-street flex items-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Alle als überwiesen markieren
                </button>
              )}
              <button
                onClick={() => setShowAuszahlung(false)}
                className="btn-street-outline ml-auto"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && canManage && (
        <div className="street-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-street text-xl text-white">
              {editingMitarbeiter ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
            </h2>
            <button onClick={resetForm} className="text-street-400 hover:text-white">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">Vorname *</label>
                <input
                  type="text"
                  value={formData.vorname}
                  onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                  className="input-street"
                  required
                />
              </div>
              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">Nachname *</label>
                <input
                  type="text"
                  value={formData.nachname}
                  onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
                  className="input-street"
                  required
                />
              </div>
              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">Benutzername *</label>
                <input
                  type="text"
                  value={formData.benutzername}
                  onChange={(e) => setFormData({ ...formData, benutzername: e.target.value })}
                  className="input-street"
                  required
                />
              </div>
              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-street"
                  required
                />
              </div>
              {editingMitarbeiter && (
              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">
                  Passwort (leer lassen für unverändert)
                </label>
                <input
                  type="password"
                  value={formData.passwort}
                  onChange={(e) => setFormData({ ...formData, passwort: e.target.value })}
                  className="input-street"
                  minLength={6}
                />
              </div>
              )}
              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">Rolle *</label>
                <select
                  value={formData.rollen_id}
                  onChange={(e) => setFormData({ ...formData, rollen_id: e.target.value })}
                  className="input-street"
                  required
                >
                  <option value="">Wählen...</option>
                  {rollen.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">Bankkonto (beginnt mit LS)</label>
                <input
                  type="text"
                  value={formData.bankkonto}
                  onChange={(e) => setFormData({ ...formData, bankkonto: e.target.value })}
                  className="input-street"
                  placeholder="LS..."
                  pattern="LS.*"
                  title="Bankkonto muss mit LS beginnen"
                />
              </div>
              <div>
                <label className="block text-street-300 text-sm font-semibold mb-2">Bonus in % vom Verkauf</label>
                <input
                  type="number"
                  value={formData.bonus_prozent}
                  onChange={(e) => setFormData({ ...formData, bonus_prozent: e.target.value })}
                  className="input-street"
                  min="0"
                  max="100"
                  step="0.5"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={saving} className="btn-street flex-1">
                {saving ? 'Speichern...' : (editingMitarbeiter ? 'Speichern' : 'Anlegen')}
              </button>
              <button type="button" onClick={resetForm} className="btn-street-outline">
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      <div className="street-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mitarbeiter</th>
                <th>Benutzername</th>
                <th>Email</th>
                <th>Rolle</th>
                <th>Status</th>
                {canManage && <th>Aktionen</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={canManage ? 6 : 5}>
                      <div className="h-12 bg-street-800 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : mitarbeiter.length > 0 ? (
                mitarbeiter.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: m.rolle?.farbe || '#6B7280' }}
                        >
                          {m.vorname[0]}{m.nachname[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{m.vorname} {m.nachname}</p>
                          {m.id === currentUser?.id && (
                            <span className="text-primary text-xs">(Du)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-street-300">{m.benutzername}</td>
                    <td className="text-street-300">{m.email}</td>
                    <td>
                      <span 
                        className="px-2 py-1 rounded text-sm"
                        style={{ 
                          backgroundColor: `${m.rolle?.farbe}20`,
                          color: m.rolle?.farbe
                        }}
                      >
                        {m.rolle?.name}
                      </span>
                    </td>
                    <td>
                      {m.aktiv ? (
                        <span className="badge badge-available">Aktiv</span>
                      ) : (
                        <span className="badge bg-street-700 text-street-400">Inaktiv</span>
                      )}
                    </td>
                    {canManage && (
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusToggle(m.id, m.aktiv)}
                            disabled={m.id === currentUser?.id}
                            className={`p-2 transition-colors ${
                              m.id === currentUser?.id 
                                ? 'text-street-700 cursor-not-allowed' 
                                : m.aktiv 
                                  ? 'text-street-400 hover:text-red-500' 
                                  : 'text-street-400 hover:text-neon-green'
                            }`}
                            title={m.aktiv ? 'Deaktivieren' : 'Aktivieren'}
                          >
                            {m.aktiv ? <UserX size={18} /> : <UserCheck size={18} />}
                          </button>
                          <button
                            onClick={() => openEditForm(m)}
                            className="p-2 text-street-400 hover:text-primary transition-colors"
                            title="Bearbeiten"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            disabled={m.id === currentUser?.id}
                            className={`p-2 transition-colors ${
                              m.id === currentUser?.id 
                                ? 'text-street-700 cursor-not-allowed' 
                                : 'text-street-400 hover:text-red-500'
                            }`}
                            title="Löschen"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="text-center py-12 text-street-500">
                    Keine Mitarbeiter gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Setup Link Modal */}
      {setupLink && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card-street max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <Link size={22} className="text-orange-400" />
              <h2 className="text-lg font-bold text-white">Einrichtungslink generiert</h2>
            </div>
            <p className="text-street-300 text-sm mb-3">
              Schicke diesen Link an den neuen Mitarbeiter. Das Konto ist erst aktiv, nachdem das Passwort gesetzt wurde.
            </p>
            <div className="flex gap-2 mb-3">
              <input
                readOnly
                value={setupLink}
                className="input-street flex-1 text-sm"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(setupLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn-street-secondary px-3 flex items-center gap-1"
                title="Kopieren"
              >
                {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-street-500 text-xs mb-5">Link ist 72 Stunden gültig.</p>
            <button
              onClick={() => { setSetupLink(null); setCopied(false); }}
              className="btn-street w-full"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mitarbeiter;
