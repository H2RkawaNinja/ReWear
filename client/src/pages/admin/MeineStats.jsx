import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Package, Banknote, Award, CreditCard } from 'lucide-react';
import api from '../../services/api';
const StatCard = ({ icon: Icon, label, value, color = 'text-primary' }) => (
  <div className="street-card p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 rounded bg-street-800 ${color}`}>
        <Icon size={20} />
      </div>
      <span className="text-street-400 text-sm">{label}</span>
    </div>
    <p className={`text-white font-street text-2xl ${color}`}>{value}</p>
  </div>
);

const MeineStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/stats/meine');
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Fehler beim Laden');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="street-card p-5 h-28 animate-pulse bg-street-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="street-card p-8 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

const { gesamt, monat: dieserMonat, letzte_verkaeufe: letzteVerkaeufe, mitarbeiter: mitarbeiterInfo } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <TrendingUp className="text-neon-green" size={28} />
        <div>
          <h1 className="font-street text-3xl text-white">Meine Stats</h1>
          <p className="text-street-400">
            {mitarbeiterInfo?.name}
          </p>
        </div>
      </div>

      {/* Bankkonto */}
      {mitarbeiterInfo?.bankkonto && (
        <div className="street-card p-4 flex items-center gap-4">
          <CreditCard className="text-primary" size={20} />
          <div>
            <p className="text-street-400 text-xs">Bankkonto</p>
            <p className="text-white font-mono">{mitarbeiterInfo.bankkonto}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-street-400 text-xs">Bonus-Satz</p>
            <p className="text-neon-green font-semibold">{mitarbeiterInfo.bonus_prozent}%</p>
          </div>
        </div>
      )}

      {/* Gesamt-Statistiken */}
      <div>
        <h2 className="text-street-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Gesamt
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Package}
            label="Ankäufe"
            value={gesamt.ankaufe}
            color="text-blue-400"
          />
          <StatCard
            icon={ShoppingBag}
            label="Verkäufe"
            value={gesamt.verkaeufe}
            color="text-primary"
          />
          <StatCard
            icon={Banknote}
            label="Umsatz"
            value={`$${parseFloat(gesamt.umsatz || 0).toFixed(2)}`}
            color="text-white"
          />
          <StatCard
            icon={Award}
            label="Bonus verdient"
            value={`$${parseFloat(gesamt.bonus || 0).toFixed(2)}`}
            color="text-neon-green"
          />
        </div>
        {/* Bonus-Aufschlüsselung */}
        {(parseFloat(gesamt.bonus_aus_ankauf || 0) > 0 || parseFloat(gesamt.bonus_aus_verkauf || 0) > 0) && (
          <div className="bg-street-900 rounded-xl p-3 flex flex-wrap gap-4 text-sm border border-street-700 mt-3">
            <div className="flex items-center gap-2">
              <ShoppingBag size={14} className="text-primary" />
              <span className="text-street-400">Aus Verkäufen:</span>
              <span className="text-white font-semibold">${parseFloat(gesamt.bonus_aus_verkauf || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package size={14} className="text-blue-400" />
              <span className="text-street-400">Aus Ankäufen:</span>
              <span className="text-blue-400 font-semibold">${parseFloat(gesamt.bonus_aus_ankauf || 0).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Dieser Monat */}
      <div>
        <h2 className="text-street-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Dieser Monat
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={ShoppingBag}
            label="Verkäufe"
            value={dieserMonat.verkaeufe}
            color="text-primary"
          />
          <StatCard
            icon={Banknote}
            label="Umsatz"
            value={`$${parseFloat(dieserMonat.umsatz || 0).toFixed(2)}`}
            color="text-white"
          />
          <StatCard
            icon={Award}
            label="Bonus"
            value={`$${parseFloat(dieserMonat.bonus || 0).toFixed(2)}`}
            color="text-neon-green"
          />
        </div>
      </div>

      {/* Letzte Verkäufe */}
      <div>
        <h2 className="text-street-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Letzte Verkäufe
        </h2>
        {letzteVerkaeufe && letzteVerkaeufe.length > 0 ? (
          <div className="street-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-street-800">
                <tr>
                  <th className="text-left px-4 py-3 text-street-400 font-medium">Artikel</th>
                  <th className="text-left px-4 py-3 text-street-400 font-medium">Kategorie</th>
                  <th className="text-right px-4 py-3 text-street-400 font-medium">Preis</th>
                  <th className="text-right px-4 py-3 text-street-400 font-medium">Datum</th>
                </tr>
              </thead>
              <tbody>
                {letzteVerkaeufe.map((v, i) => (
                  <tr
                    key={v.id}
                    className={i % 2 === 0 ? 'bg-street-900' : 'bg-street-800/40'}
                  >
                    <td className="px-4 py-3 text-white">{v.name}</td>
                    <td className="px-4 py-3 text-street-300">{v.kategorie?.name || '–'}</td>
                    <td className="px-4 py-3 text-right text-primary font-semibold">
                      ${parseFloat(v.verkaufspreis).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-street-400">
                      {v.verkauft_am
                        ? new Date(v.verkauft_am).toLocaleDateString('de-DE')
                        : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="street-card p-8 text-center">
            <ShoppingBag size={32} className="mx-auto text-street-600 mb-2" />
            <p className="text-street-400">Noch keine Verkäufe</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeineStats;
