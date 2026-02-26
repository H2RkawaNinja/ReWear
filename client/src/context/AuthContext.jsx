import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Token SOFORT synchron im API-Client setzen (vor dem ersten Render)
const savedToken = localStorage.getItem('token');
if (savedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth muss innerhalb eines AuthProviders verwendet werden');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [mitarbeiter, setMitarbeiter] = useState(null);
  const [rechte, setRechte] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  // Beim Start: Benutzer laden wenn Token vorhanden
  useEffect(() => {
    // Verhindert doppeltes Laden im StrictMode
    if (initialized.current) return;
    initialized.current = true;

    const controller = new AbortController();

    const loadUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      // Sicherstellen dass der Header gesetzt ist
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        const response = await api.get('/auth/me', {
          signal: controller.signal
        });
        setMitarbeiter(response.data.mitarbeiter);
        setRechte(response.data.rechte || []);
      } catch (error) {
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
          return; // Abort - nicht als Fehler behandeln
        }
        console.error('Fehler beim Laden des Benutzers:', error);
        // Token ungültig - entfernen
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setMitarbeiter(null);
        setRechte([]);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    return () => controller.abort();
  }, []);

  const setToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const login = async (benutzername, passwort) => {
    const response = await api.post('/auth/login', { benutzername, passwort });
    setToken(response.data.token);
    setMitarbeiter(response.data.mitarbeiter);
    setRechte(response.data.rechte || []);
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setMitarbeiter(null);
    setRechte([]);
  };

  const hasPermission = (recht) => {
    return rechte.includes(recht);
  };

  const hasAnyPermission = (...rechteList) => {
    return rechteList.some(r => rechte.includes(r));
  };

  const value = {
    mitarbeiter,
    rechte,
    loading,
    isAuthenticated: !!mitarbeiter,
    login,
    logout,
    hasPermission,
    hasAnyPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
