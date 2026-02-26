import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import api from '../services/api';

const SetupPasswort = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [info, setInfo] = useState(null);       // { name, benutzername }
  const [status, setStatus] = useState('loading'); // loading | valid | invalid | expired | success
  const [passwort, setPasswort] = useState('');
  const [bestaetigung, setBestaetigung] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await api.get(`/auth/setup/${token}`);
        setInfo(res.data);
        setStatus('valid');
      } catch (err) {
        if (err.response?.status === 410) setStatus('expired');
        else setStatus('invalid');
      }
    };
    validate();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (passwort !== bestaetigung) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    if (passwort.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen haben.');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/auth/setup/${token}`, { passwort, passwort_bestaetigung: bestaetigung });
      setStatus('success');
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-street-950 flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/images/logo-main.png"
            alt="RE:WEAR"
            className="h-32 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(255,107,53,0.4)]"
          />
        </div>

        <div className="bg-street-900 border border-street-700 rounded-xl p-8">

          {/* Loading */}
          {status === 'loading' && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-street-400">Link wird geprüft...</p>
            </div>
          )}

          {/* Ungültig */}
          {(status === 'invalid' || status === 'expired') && (
            <div className="text-center py-6">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h2 className="font-street text-xl text-white mb-2">
                {status === 'expired' ? 'Link abgelaufen' : 'Ungültiger Link'}
              </h2>
              <p className="text-street-400 text-sm">
                {status === 'expired'
                  ? 'Dieser Einrichtungslink ist abgelaufen (72h). Bitte einen Administrator kontaktieren.'
                  : 'Dieser Link ist ungültig oder wurde bereits verwendet.'}
              </p>
            </div>
          )}

          {/* Erfolgreich */}
          {status === 'success' && (
            <div className="text-center py-6">
              <CheckCircle2 size={48} className="text-neon-green mx-auto mb-4" />
              <h2 className="font-street text-xl text-white mb-2">Passwort gesetzt!</h2>
              <p className="text-street-400 text-sm mb-6">
                Dein Account ist jetzt aktiv. Du kannst dich einloggen.
              </p>
              <button
                onClick={() => navigate('/admin/login')}
                className="btn-street w-full"
              >
                Zum Login
              </button>
            </div>
          )}

          {/* Formular */}
          {status === 'valid' && info && (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Lock size={18} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-street text-xl text-white">Passwort einrichten</h2>
                    <p className="text-street-400 text-sm">Willkommen, {info.name}!</p>
                  </div>
                </div>
                <p className="text-street-500 text-xs mt-3">
                  Benutzername: <span className="text-street-300 font-mono">{info.benutzername}</span>
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 mb-5">
                  <AlertCircle size={18} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">
                    Passwort wählen
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={passwort}
                      onChange={e => setPasswort(e.target.value)}
                      className="input-street pr-12"
                      placeholder="Mindestens 6 Zeichen"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-street-400 hover:text-white transition-colors"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-street-300 text-sm font-semibold mb-2">
                    Passwort bestätigen
                  </label>
                  <div className="relative">
                    <input
                      type={showPw2 ? 'text' : 'password'}
                      value={bestaetigung}
                      onChange={e => setBestaetigung(e.target.value)}
                      className="input-street pr-12"
                      placeholder="Passwort wiederholen"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw2(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-street-400 hover:text-white transition-colors"
                    >
                      {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {bestaetigung && passwort !== bestaetigung && (
                    <p className="text-red-400 text-xs mt-1">Passwörter stimmen nicht überein.</p>
                  )}
                  {bestaetigung && passwort === bestaetigung && (
                    <p className="text-neon-green text-xs mt-1 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Passwörter stimmen überein
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-street w-full mt-2"
                >
                  {saving ? 'Wird gespeichert...' : 'Passwort festlegen & Account aktivieren'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupPasswort;
