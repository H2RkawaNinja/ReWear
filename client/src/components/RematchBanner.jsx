import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const RematchBanner = ({ outfit }) => {
  if (!outfit) return null;

  return (
    <section className="section-street bg-gradient-to-r from-street-900 via-street-800 to-street-900 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="container-street relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-4">
              <Sparkles size={16} />
              <span className="text-sm font-semibold uppercase tracking-wider">Outfit der Woche</span>
            </div>
            
            <img
              src="/images/titel-rematch.png"
              alt="Re:Match"
              className="h-20 md:h-24 lg:h-28 w-auto mb-2 mx-auto lg:mx-0"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <h2 className="font-graffiti text-5xl md:text-6xl lg:text-7xl text-white mb-2" style={{ display: 'none' }}>
              Re:Match
            </h2>
            
            <h3 className="font-street text-2xl md:text-3xl text-primary mb-4">
              {outfit.titel}
            </h3>
            
            {outfit.beschreibung && (
              <p className="text-street-300 text-lg max-w-xl mb-6">
                {outfit.beschreibung}
              </p>
            )}

            {/* Artikel Preview */}
            {outfit.artikel && outfit.artikel.length > 0 && (
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                {outfit.artikel.slice(0, 4).map((artikel) => (
                  <Link 
                    key={artikel.id}
                    to={`/artikel/${artikel.id}`}
                    className="bg-street-700/50 hover:bg-street-700 px-3 py-1 rounded text-sm text-street-200 transition-colors"
                  >
                    {artikel.name}
                  </Link>
                ))}
                {outfit.artikel.length > 4 && (
                  <span className="bg-street-800 px-3 py-1 rounded text-sm text-street-400">
                    +{outfit.artikel.length - 4} mehr
                  </span>
                )}
              </div>
            )}

            {/* CTA */}
            <Link to="/rematch" className="btn-street inline-block">
              Zum Re:Match
            </Link>
          </div>

          {/* Image */}
          <div className="flex-1 max-w-md">
            {outfit.bild ? (
              <div className="relative">
                <img 
                  src={outfit.bild}
                  alt={outfit.titel}
                  className="rounded-lg shadow-street w-full"
                />
                {/* Decorative Frame */}
                <div className="absolute -inset-2 border-2 border-primary/30 rounded-lg -z-10"></div>
                <div className="absolute -inset-4 border border-secondary/20 rounded-lg -z-20"></div>
              </div>
            ) : (
              <div className="aspect-square bg-street-800 rounded-lg flex items-center justify-center">
                <span className="font-graffiti text-4xl text-street-600">Re:Match</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RematchBanner;
