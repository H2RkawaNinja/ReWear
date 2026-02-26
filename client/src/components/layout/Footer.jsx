import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-street-900 border-t border-street-700 py-12">
      <div className="container-street">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Info */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="font-street text-xl text-white">RW</span>
              </div>
              <div>
                <h2 className="font-street text-xl text-white tracking-wider">RE:WEAR</h2>
                <p className="text-xs text-primary font-semibold tracking-widest">WESTSIDE</p>
              </div>
            </Link>
            <p className="text-street-400 text-sm">
              Gebrauchte Streetwear aus der Hood. 
            </p>
            <p className="text-street-400 text-sm">
              MADE:WITH:LOVE:BY:H2R"
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-street text-lg text-white mb-4">NAVIGATION</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-street-400 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/artikel" className="text-street-400 hover:text-primary transition-colors">
                  Sortiment
                </Link>
              </li>
              <li>
                <Link to="/rematch" className="text-street-400 hover:text-primary transition-colors">
                  Re:Match
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-street-400 hover:text-primary transition-colors">
                  Team Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-street text-lg text-white mb-4">INFO</h3>
            <p className="text-street-400 text-sm">
              RE:WEAR ist ein Secondhand-Shop für Streetwear in der Westside.
            </p>
            <p className="text-street-500 text-xs mt-4">
              Preise nur zur Ansicht - kein Online-Kauf möglich.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-street-700 mt-8 pt-8 text-center space-y-2">
          <p className="text-street-500 text-sm">
            © {new Date().getFullYear()} RE:WEAR Westside. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs" style={{ color: '#39ff14' }}>
            Diese Website ist fiktiv und Teil eines Roleplay-Servers auf{' '}
            <a
              href="https://unity-life.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:opacity-80"
              style={{ color: '#39ff14' }}
            >
              unity-life.de
            </a>
            . Alle dargestellten Personen, Produkte und Preise sind erfunden.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
