import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shirt, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Package,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  Home
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { mitarbeiter, hasPermission, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Noch am Laden - warten
    if (authLoading) return;

    // Nicht eingeloggt - nichts tun
    if (!isAuthenticated || !mitarbeiter) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadStats = async () => {
      try {
        const res = await api.get('/stats', { signal: controller.signal });
        setStats(res.data);
      } catch (error) {
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
        console.error('Fehler beim Laden der Statistiken:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    return () => controller.abort();
  }, [authLoading, isAuthenticated, mitarbeiter]);

  const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
    <div className="stats-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-street-400 text-sm mb-1">{label}</p>
          <p className="value" style={{ color }}>{value}</p>
          {subtext && <p className="text-street-500 text-xs mt-1">{subtext}</p>}
        </div>
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ to, icon: Icon, label, color }) => (
    <Link
      to={to}
      className="street-card p-4 flex items-center gap-4 group hover-lift"
    >
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={24} style={{ color }} />
      </div>
      <span className="font-semibold text-white group-hover:text-primary transition-colors">
        {label}
      </span>
      <ArrowRight size={18} className="ml-auto text-street-500 group-hover:text-primary transition-colors" />
    </Link>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-street text-3xl text-white mb-2">
            Willkommen, {mitarbeiter?.vorname}!
          </h1>
          <p className="text-street-400">
            Hier ist deine Übersicht für heute.
          </p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-street-800 border border-street-700 text-street-300 hover:text-white hover:border-primary transition-colors text-sm font-medium mt-1 whitespace-nowrap"
        >
          <Home size={15} />
          Kundenbereich
        </Link>
      </div>

      {/* Stats Grid */}
      {hasPermission('statistiken.ansehen') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="stats-card animate-pulse">
                <div className="h-16 bg-street-800 rounded"></div>
              </div>
            ))
          ) : stats ? (
            <>
              <StatCard 
                icon={Shirt}
                label="Artikel verfügbar"
                value={stats.artikel.verfuegbar}
                color="#6bcb77"
                subtext={`${stats.artikel.gesamt} gesamt`}
              />
              <StatCard 
                icon={DollarSign}
                label="Lagerwert"
                value={`$${parseFloat(stats.werte.lagerWert).toLocaleString()}`}
                color="#4d96ff"
              />
              <StatCard 
                icon={TrendingUp}
                label="Verkäufe (Monat)"
                value={stats.monat.verkauft}
                color="#ff6b35"
                subtext={`$${parseFloat(stats.monat.umsatz).toLocaleString()} Umsatz`}
              />
              <StatCard 
                icon={Users}
                label="Team"
                value={stats.mitarbeiter.aktiv}
                color="#9b5de5"
                subtext={`${stats.mitarbeiter.gesamt} gesamt`}
              />
            </>
          ) : null}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-street text-xl text-white mb-4">Schnellaktionen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hasPermission('ankauf.durchfuehren') && (
            <QuickAction 
              to="/admin/ankauf"
              icon={Package}
              label="Neuen Artikel ankaufen"
              color="#6bcb77"
            />
          )}
          {hasPermission('artikel.ansehen') && (
            <QuickAction 
              to="/admin/artikel"
              icon={Shirt}
              label="Artikel verwalten"
              color="#4d96ff"
            />
          )}
          {hasPermission('verkauf.durchfuehren') && (
            <QuickAction 
              to="/admin/verkauf"
              icon={ShoppingCart}
              label="Verkauf"
              color="#ffd166"
            />
          )}
          {hasPermission('rematch.verwalten') && (
            <QuickAction 
              to="/admin/rematch"
              icon={Sparkles}
              label="Re:Match bearbeiten"
              color="#ff6b35"
            />
          )}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <h2 className="font-street text-xl text-white mb-4">System Info</h2>
        <div className="street-card p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-street text-primary">
                {stats?.kategorien || '-'}
              </p>
              <p className="text-street-400 text-sm">Kategorien</p>
            </div>
            <div>
              <p className="text-2xl font-street text-secondary">
                {stats?.artikel.verkauft || '-'}
              </p>
              <p className="text-street-400 text-sm">Verkauft</p>
            </div>
            <div>
              <p className="text-2xl font-street text-accent">
                {stats?.artikel.reserviert || '-'}
              </p>
              <p className="text-street-400 text-sm">Reserviert</p>
            </div>
            <div>
              <p className="text-2xl font-street text-neon-purple">
                {stats?.rematch.gesamt || '-'}
              </p>
              <p className="text-street-400 text-sm">Re:Match Outfits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
