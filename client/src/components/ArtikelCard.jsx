import { Link } from 'react-router-dom';

const ArtikelCard = ({ artikel }) => {
  const statusBadge = {
    verfuegbar: 'badge-available',
    reserviert: 'badge-reserved',
    verkauft: 'badge-sold'
  };

  const statusText = {
    verfuegbar: 'Verfügbar',
    reserviert: 'Reserviert',
    verkauft: 'Verkauft'
  };

  let bilderArray = [];
  if (Array.isArray(artikel?.bilder)) {
    bilderArray = artikel.bilder;
  } else if (typeof artikel?.bilder === 'string' && artikel.bilder) {
    try {
      const parsed = JSON.parse(artikel.bilder);
      bilderArray = Array.isArray(parsed) ? parsed : [artikel.bilder];
    } catch {
      bilderArray = [artikel.bilder];
    }
  }
  const erstesImage = bilderArray[0] || null;

  return (
    <Link to={`/artikel/${artikel.id}`} className="street-card hover-lift group">
      {/* Bild */}
      <div className="aspect-square relative overflow-hidden bg-street-800">
        <img 
          src={erstesImage || 'https://via.placeholder.com/400x400/1a1a1a/666?text=Kein+Bild'} 
          alt={artikel.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x400/1a1a1a/666?text=Kein+Bild';
          }}
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`badge ${statusBadge[artikel.status]}`}>
            {statusText[artikel.status]}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-street-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-4 left-4 right-4">
            <span className="btn-street text-sm w-full text-center block">
              Details ansehen
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Kategorie */}
        {artikel.kategorie && (
          <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            {artikel.kategorie.name}
          </p>
        )}
        
        {/* Name */}
        <h3 className="font-street text-lg text-white truncate">
          {artikel.name}
        </h3>
        
        {/* Details */}
        <div className="flex items-center gap-2 mt-2 text-sm text-street-400">
          {artikel.geschlecht && (
            <span>{artikel.geschlecht}</span>
          )}
        </div>

        {/* Preis */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-street text-white">
            ${parseFloat(artikel.verkaufspreis).toFixed(0)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ArtikelCard;
