import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, loading, hasPermission, mitarbeiter } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-street-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-street-400">Laden...</p>
        </div>
      </div>
    );
  }

  // Zusätzliche Prüfung: Ist wirklich ein Mitarbeiter geladen?
  if (!isAuthenticated || !mitarbeiter) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-street-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-street text-primary mb-4">ZUGRIFF VERWEIGERT</h1>
          <p className="text-street-400">Du hast keine Berechtigung für diese Seite.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
