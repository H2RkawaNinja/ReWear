import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shirt, 
  ShoppingCart, 
  Sparkles, 
  BarChart3, 
  Users, 
  Shield, 
  LogOut,
  Menu,
  X,
  BookOpen,
  ShoppingBag,
  TrendingUp,
  ScrollText
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mitarbeiter, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { 
      to: '/admin', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      end: true
    },
    { 
      to: '/admin/stammdaten', 
      icon: BookOpen, 
      label: 'Stammdaten',
      permission: 'artikel.erstellen'
    },
    { 
      to: '/admin/artikel', 
      icon: Shirt, 
      label: 'Sortiment',
      permission: 'artikel.ansehen'
    },
    { 
      to: '/admin/ankauf', 
      icon: ShoppingCart, 
      label: 'Ankauf',
      permission: 'ankauf.durchfuehren'
    },
    { 
      to: '/admin/rematch', 
      icon: Sparkles, 
      label: 'Re:Match',
      permission: 'rematch.verwalten'
    },
    { 
      to: '/admin/verkauf', 
      icon: ShoppingBag, 
      label: 'Verkauf',
      permission: 'artikel.bearbeiten'
    },
    { 
      to: '/admin/meine-stats', 
      icon: TrendingUp, 
      label: 'Meine Stats'
    },
    { 
      to: '/admin/statistiken', 
      icon: BarChart3, 
      label: 'Statistiken',
      permission: 'statistiken.ansehen'
    },
    { 
      to: '/admin/mitarbeiter', 
      icon: Users, 
      label: 'Mitarbeiter',
      permission: 'mitarbeiter.ansehen'
    },
    { 
      to: '/admin/rollen', 
      icon: Shield, 
      label: 'Rollen',
      permission: 'rollen.verwalten'
    },
    { 
      to: '/admin/log', 
      icon: ScrollText, 
      label: 'Aktivitätslog',
      permission: 'log.ansehen'
    },
  ];

  const filteredNavItems = navItems.filter(
    item => !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="min-h-screen bg-street-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex sidebar flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-street-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="font-street text-xl text-white">RW</span>
            </div>
            <div>
              <h1 className="font-street text-xl text-white">RE:WEAR</h1>
              <p className="text-[10px] text-primary tracking-widest">ADMIN</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-street-700">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: mitarbeiter?.rollenFarbe || '#6B7280' }}
            >
              {mitarbeiter?.vorname?.[0]}{mitarbeiter?.nachname?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">
                {mitarbeiter?.vorname} {mitarbeiter?.nachname}
              </p>
              <p className="text-street-500 text-xs truncate">
                {mitarbeiter?.rolle}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-street-400 hover:text-white hover:bg-street-800 rounded transition-colors"
          >
            <LogOut size={18} />
            Abmelden
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-street-900 border-b border-street-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="font-street text-lg text-white">RW</span>
            </div>
            <span className="font-street text-lg text-white">ADMIN</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80" onClick={() => setSidebarOpen(false)}></div>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-street-900 flex flex-col animate-slide-up">
            {/* Logo */}
            <div className="p-6 border-b border-street-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="font-street text-xl text-white">RW</span>
                </div>
                <span className="font-street text-xl text-white">ADMIN</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-street-400">
                <X size={24} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => 
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-street-700">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: mitarbeiter?.rollenFarbe || '#6B7280' }}
                >
                  {mitarbeiter?.vorname?.[0]}{mitarbeiter?.nachname?.[0]}
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {mitarbeiter?.vorname} {mitarbeiter?.nachname}
                  </p>
                  <p className="text-street-500 text-xs">{mitarbeiter?.rolle}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-street-400 hover:text-white hover:bg-street-800 rounded transition-colors"
              >
                <LogOut size={18} />
                Abmelden
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
