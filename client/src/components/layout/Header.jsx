import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Dünne Akzentlinie oben */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="bg-zinc-900/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-24">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div>
                <span className="font-graffiti text-2xl text-white leading-none transition-colors">RE:WEAR</span>
                <span className="block text-[10px] text-white/80 tracking-[0.3em] uppercase font-mono transition-colors">WESTSIDE</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 text-sm font-medium tracking-wide transition-all ${
                  isActive('/')
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                HOME
                {isActive('/') && <div className="h-px bg-primary mt-0.5" />}
              </Link>
              <Link
                to="/artikel"
                className={`px-4 py-2 text-sm font-medium tracking-wide transition-all ${
                  isActive('/artikel')
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                SORTIMENT
                {isActive('/artikel') && <div className="h-px bg-primary mt-0.5" />}
              </Link>
              <Link
                to="/rematch"
                className={`px-4 py-2 text-sm font-medium tracking-wide transition-all ${
                  isActive('/rematch')
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                RE:MATCH
                {isActive('/rematch') && <div className="h-px bg-primary mt-0.5" />}
              </Link>
              <Link
                to="/admin/login"
                className="ml-4 px-4 py-1.5 text-xs font-mono tracking-widest text-primary border border-primary/40 hover:border-primary hover:bg-primary/10 transition-all"
              >
                [ TEAM ]
              </Link>

            </nav>

            {/* Mobile Buttons */}
            <div className="md:hidden flex items-center gap-2">
              <button
                className="text-white/70 hover:text-white transition-colors p-1"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-zinc-900/98">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              <Link to="/" className="py-2 text-sm text-white/75 hover:text-white tracking-widest font-mono transition-colors" onClick={() => setMenuOpen(false)}>HOME</Link>
              <Link to="/artikel" className="py-2 text-sm text-white/75 hover:text-white tracking-widest font-mono transition-colors" onClick={() => setMenuOpen(false)}>SORTIMENT</Link>
              <Link to="/rematch" className="py-2 text-sm text-white/75 hover:text-white tracking-widest font-mono transition-colors" onClick={() => setMenuOpen(false)}>RE:MATCH</Link>
              <Link to="/admin/login" className="mt-2 py-2 text-sm text-primary/80 hover:text-primary tracking-widest font-mono transition-colors" onClick={() => setMenuOpen(false)}>[ TEAM LOGIN ]</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
