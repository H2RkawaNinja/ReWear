import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Pages
import Home from './pages/Home';
import Artikel from './pages/Artikel';
import ArtikelDetail from './pages/ArtikelDetail';
import Rematch from './pages/Rematch';
import SetupPasswort from './pages/SetupPasswort';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ArtikelVerwalten from './pages/admin/ArtikelVerwalten';
import ArtikelFormular from './pages/admin/ArtikelFormular';
import Artikelstammdaten from './pages/admin/Artikelstammdaten';
import Ankauf from './pages/admin/Ankauf';
import RematchEditor from './pages/admin/RematchEditor';
import Statistiken from './pages/admin/Statistiken';
import Mitarbeiter from './pages/admin/Mitarbeiter';
import Rollen from './pages/admin/Rollen';
import Verkauf from './pages/admin/Verkauf';
import MeineStats from './pages/admin/MeineStats';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Öffentliche Seiten */}
          <Route path="/" element={<Home />} />
          <Route path="/artikel" element={<Artikel />} />
          <Route path="/artikel/:id" element={<ArtikelDetail />} />
          <Route path="/rematch" element={<Rematch />} />
          
          {/* Admin Login */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/passwort-einrichten/:token" element={<SetupPasswort />} />
          
          {/* Admin Bereich (geschützt) */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="artikel" element={<ArtikelVerwalten />} />
            <Route path="artikel/neu" element={<ArtikelFormular />} />
            <Route path="artikel/:id" element={<ArtikelFormular />} />
            <Route path="stammdaten" element={<Artikelstammdaten />} />
            <Route path="ankauf" element={<Ankauf />} />
            <Route path="rematch" element={<RematchEditor />} />
            <Route path="statistiken" element={<Statistiken />} />
            <Route path="mitarbeiter" element={<Mitarbeiter />} />
            <Route path="rollen" element={<Rollen />} />
            <Route path="verkauf" element={<Verkauf />} />
            <Route path="meine-stats" element={<MeineStats />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
