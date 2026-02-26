import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Login = () => {
  const [benutzername, setBenutzername] = useState('');
  const [passwort, setPasswort] = useState('');
  const [showPasswort, setShowPasswort] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect wenn bereits eingeloggt
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  // Alten ungültigen Token beim Öffnen der Login-Seite bereinigen
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [authLoading, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(benutzername, passwort);
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-street-950 flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/images/logo-main.png"
            alt="RE:WEAR"
            className="h-80 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(255,107,53,0.4)]"
          />
          <p className="text-primary font-semibold tracking-widest text-sm">TEAM LOGIN</p>
        </div>

        {/* Login Form */}
        <div className="bg-street-900 border border-street-700 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Benutzername */}
            <div>
              <label className="block text-street-300 text-sm font-semibold mb-2">
                Benutzername
              </label>
              <input
                type="text"
                value={benutzername}
                onChange={(e) => setBenutzername(e.target.value)}
                placeholder="Dein Benutzername"
                className="input-street"
                required
                autoFocus
              />
            </div>

            {/* Passwort */}
            <div>
              <label className="block text-street-300 text-sm font-semibold mb-2">
                Passwort
              </label>
              <div className="relative">
                <input
                  type={showPasswort ? 'text' : 'password'}
                  value={passwort}
                  onChange={(e) => setPasswort(e.target.value)}
                  placeholder="••••••••"
                  className="input-street pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswort(!showPasswort)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-street-500 hover:text-street-300 transition-colors"
                >
                  {showPasswort ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-street w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Einloggen...
                </>
              ) : (
                'Einloggen'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-street-600 text-sm mt-8">
          © {new Date().getFullYear()} RE:WEAR Westside
        </p>
      </div>
    </div>
  );
};

export default Login;
