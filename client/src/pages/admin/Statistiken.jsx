import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, TrendingUp, Package, Euro, Users, Banknote, ShoppingBag, RefreshCw, Landmark, Pencil, Check, X
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

const ZEITRAEUME = [
  { key: '7d',  label: '7 Tage' },
  { key: '30d', label: '30 Tage' },
  { key: '3m',  label: '3 Monate' },
  { key: '12m', label: '12 Monate' },
  { key: 'all', label: 'Gesamt' },
];

const PIE_COLORS = ['#ff6b35','#4d96ff','#6bcb77','#9b5de5','#ffd166','#ef476f','#06d6a0','#118ab2'];

const fmt = (v) => `$${parseFloat(v||0).toLocaleString('de-DE',{minimumFractionDigits:2})}`;
const fmtShort = (v) => {
  const n = parseFloat(v||0);
  if (n >= 1000) return `$${(n/1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-street-900 border border-street-700 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-street-300 mb-2 font-medium">{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{color:p.color}}>
          {p.name}: {p.name==='Artikel' ? p.value : fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
  <div className="stats-card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-street-400 text-sm">{label}</p>
        <p className="text-3xl font-street mt-1" style={{color}}>{value}</p>
        {subtext && <p className="text-street-500 text-sm mt-1">{subtext}</p>}
      </div>
      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{backgroundColor:`${color}20`}}>
        <Icon size={24} style={{color}} />
      </div>
    </div>
  </div>
);

const Statistiken = () => {
  const [stats, setStats] = useState(null);
  const [kategorieStats, setKategorieStats] = useState([]);
  const [mitarbeiterStats, setMitarbeiterStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [zeitraum, setZeitraum] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [editKorrektur, setEditKorrektur] = useState(false);
  const [korrekturWert, setKorrekturWert] = useState('0');
  const [korrekturSaving, setKorrekturSaving] = useState(false);

  const loadChartData = useCallback(async (zr) => {
    setChartLoading(true);
    try {
      const res = await api.get(`/stats/verkaeufe?zeitraum=${zr}`);
      setChartData(res.data.map(d => ({
        datum: d.datum,
        Umsatz: parseFloat(d.umsatz||0),
        Kosten: parseFloat(d.kosten||0),
        Gewinn: parseFloat(d.umsatz||0) - parseFloat(d.kosten||0),
        Artikel: parseInt(d.anzahl||0),
      })));
    } catch(e) { console.error(e); }
    finally { setChartLoading(false); }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [statsRes, kategorienRes, mitarbeiterRes] = await Promise.all([
          api.get('/stats'),
          api.get('/stats/kategorien'),
          api.get('/stats/mitarbeiter'),
        ]);
        setStats(statsRes.data);
        setKategorieStats(kategorienRes.data);
        setMitarbeiterStats(mitarbeiterRes.data);
        // Korrektur-Wert aus geladenen Stats übernehmen
        const k = statsRes.data?.firmenkonto?.korrektur;
        if (k !== undefined) setKorrekturWert(parseFloat(k).toFixed(2));
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadAll();
    loadChartData('30d');
  }, [loadChartData]);

  const handleZeitraum = (zr) => {
    setZeitraum(zr);
    loadChartData(zr);
  };

  const handleKorrekturSave = async () => {
    setKorrekturSaving(true);
    try {
      await api.patch('/stats/firmenkonto-korrektur', { korrektur: parseFloat(korrekturWert) || 0 });
      // Stats neu laden damit Soll-Wert aktualisiert wird
      const res = await api.get('/stats');
      setStats(res.data);
      setKorrekturWert(parseFloat(res.data?.firmenkonto?.korrektur || 0).toFixed(2));
      setEditKorrektur(false);
    } catch (e) {
      alert(e.response?.data?.error || 'Fehler beim Speichern');
    } finally {
      setKorrekturSaving(false);
    }
  };

  const pieData = kategorieStats
    .filter(k => k.gesamt > 0)
    .map(k => ({ name: k.name, value: k.gesamt, verfuegbar: k.verfuegbar, verkauft: k.verkauft }));

  const mitBarData = mitarbeiterStats.map(m => ({
    name: m.name.split(' ')[0],
    'Ankäufe': m.ankaufe,
    'Verkäufe': m.verkaeufe,
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-street-800 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-street-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="h-72 bg-street-800 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-street text-3xl text-white flex items-center gap-3">
          <BarChart3 className="text-neon-blue" />
          Statistiken
        </h1>
        <p className="text-street-400 mt-1">Übersicht über Umsatz, Bestand und Team</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Artikel verfügbar"
          value={stats?.artikel.verfuegbar || 0}
          subtext={`${stats?.artikel.gesamt || 0} gesamt`} color="#6bcb77" />
        <StatCard icon={Euro} label="Lagerwert"
          value={`$${parseFloat(stats?.werte.lagerWert||0).toLocaleString('de-DE')}`} color="#4d96ff" />
        <StatCard icon={TrendingUp} label="Umsatz diesen Monat"
          value={`$${parseFloat(stats?.monat.umsatz||0).toLocaleString('de-DE')}`}
          subtext={`${stats?.monat.verkauft||0} Artikel verkauft`} color="#ff6b35" />
        <StatCard icon={Banknote} label="Gesamtgewinn (real.)"
          value={`$${parseFloat(stats?.gesamt?.gewinn||0).toLocaleString('de-DE')}`}
          subtext={`Marge: ${stats?.gesamt?.marge||0}%`} color="#9b5de5" />
      </div>

      {/* Firmenkonto-Soll */}
      <div className="street-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Landmark size={20} className="text-neon-green" />
          <h2 className="font-street text-xl text-white">Firmenkonto-Soll</h2>
          <span className="ml-2 text-xs text-street-500 font-normal">Einnahmen aus Verkäufen − alle Ankaufskosten</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-street-800 rounded-lg p-4 text-center">
            <p className="text-street-400 text-sm mb-1">Einnahmen (Verkäufe)</p>
            <p className="text-2xl font-street text-neon-green">
              {fmt(stats?.firmenkonto?.einnahmen)}
            </p>
            <p className="text-street-500 text-xs mt-1">{stats?.artikel.verkauft || 0} Artikel verkauft</p>
          </div>
          <div className="bg-street-800 rounded-lg p-4 text-center">
            <p className="text-street-400 text-sm mb-1">Ausgaben (Ankäufe)</p>
            <p className="text-2xl font-street text-red-400">
              − {fmt(stats?.firmenkonto?.ausgaben)}
            </p>
            <p className="text-street-500 text-xs mt-1">{stats?.artikel.gesamt || 0} Artikel insgesamt</p>
          </div>
          <div className={`rounded-lg p-4 text-center border-2 ${
            parseFloat(stats?.firmenkonto?.soll || 0) >= 0
              ? 'bg-neon-green/10 border-neon-green/40'
              : 'bg-red-900/20 border-red-500/40'
          }`}>
            <p className="text-street-300 text-sm mb-1 font-semibold">Soll-Kontostand</p>
            <p className={`text-3xl font-street ${
              parseFloat(stats?.firmenkonto?.soll || 0) >= 0 ? 'text-neon-green' : 'text-red-400'
            }`}>
              {fmt(stats?.firmenkonto?.soll)}
            </p>
            <p className="text-street-500 text-xs mt-1">sollte auf dem Konto sein</p>
          </div>
        </div>

        {/* Manuelle Korrektur */}
        <div className="mt-4 pt-4 border-t border-street-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-street-400 text-sm">Manuelle Korrektur</span>
            {!editKorrektur ? (
              <button
                onClick={() => setEditKorrektur(true)}
                className="flex items-center gap-1.5 text-xs text-street-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-street-700"
              >
                <Pencil size={13} /> Bearbeiten
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleKorrekturSave}
                  disabled={korrekturSaving}
                  className="flex items-center gap-1 text-xs bg-neon-green/20 text-neon-green hover:bg-neon-green/30 px-2 py-1 rounded transition-colors"
                >
                  <Check size={13} /> {korrekturSaving ? 'Speichern...' : 'Speichern'}
                </button>
                <button
                  onClick={() => { setEditKorrektur(false); setKorrekturWert(parseFloat(stats?.firmenkonto?.korrektur || 0).toFixed(2)); }}
                  className="flex items-center gap-1 text-xs bg-street-700 text-street-300 hover:text-white px-2 py-1 rounded transition-colors"
                >
                  <X size={13} /> Abbrechen
                </button>
              </div>
            )}
          </div>
          {!editKorrektur ? (
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${
                parseFloat(stats?.firmenkonto?.korrektur || 0) > 0 ? 'text-neon-green' :
                parseFloat(stats?.firmenkonto?.korrektur || 0) < 0 ? 'text-red-400' : 'text-street-500'
              }`}>
                {parseFloat(stats?.firmenkonto?.korrektur || 0) > 0 ? '+' : ''}{fmt(stats?.firmenkonto?.korrektur)}
              </span>
              <span className="text-street-600 text-xs">wird zum Soll addiert</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 max-w-xs">
              <span className="text-street-400 font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                value={korrekturWert}
                onChange={e => setKorrekturWert(e.target.value)}
                className="input-street text-sm py-1.5 flex-1"
                autoFocus
              />
              <span className="text-street-500 text-xs whitespace-nowrap">neg. Wert = Abzug</span>
            </div>
          )}
        </div>
      </div>

      {/* Umsatz-Übersicht Zahlen */}
      <div className="street-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <ShoppingBag size={20} className="text-neon-green" />
          <h2 className="font-street text-xl text-white">Umsatz &amp; Gewinn im Überblick</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Monat', umsatz: stats?.monat.umsatz, stueck: stats?.monat.verkauft, color: 'text-orange-400' },
            { label: `Jahr ${new Date().getFullYear()}`, umsatz: stats?.jahr?.umsatz, stueck: stats?.jahr?.verkauft, color: 'text-blue-400' },
            { label: 'Gesamtumsatz', umsatz: stats?.gesamt?.umsatz, stueck: stats?.artikel.verkauft, color: 'text-neon-green' },
            { label: 'Pot. Lagergewinn', umsatz: stats?.werte.potenziellerGewinn, stueck: null, color: 'text-purple-400', sub: 'bei Vollverkauf' },
          ].map((item, i) => (
            <div key={i} className={`text-center py-4 ${i > 0 ? 'border-l border-street-700' : ''}`}>
              <p className="text-street-400 text-xs mb-1">{item.label}</p>
              <p className={`text-xl font-street ${item.color}`}>{fmt(item.umsatz)}</p>
              <p className="text-street-500 text-xs mt-1">{item.sub || `${item.stueck||0} Artikel`}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Umsatz-Chart mit Zeitraumwahl */}
      <div className="street-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h2 className="font-street text-xl text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-orange-400" />
            Umsatzverlauf
          </h2>
          <div className="flex gap-1 flex-wrap">
            {ZEITRAEUME.map(z => (
              <button key={z.key} onClick={() => handleZeitraum(z.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  zeitraum === z.key
                    ? 'bg-primary text-white'
                    : 'bg-street-800 text-street-400 hover:text-white hover:bg-street-700'
                }`}>
                {z.label}
              </button>
            ))}
          </div>
        </div>
        {chartLoading ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw size={24} className="animate-spin text-street-500" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-street-500">
            Keine Verkäufe in diesem Zeitraum
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradUmsatz" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradGewinn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6bcb77" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6bcb77" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="datum" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
              <YAxis tickFormatter={fmtShort} tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12, paddingTop: 12 }} />
              <Area type="monotone" dataKey="Umsatz" stroke="#ff6b35" strokeWidth={2} fill="url(#gradUmsatz)" />
              <Area type="monotone" dataKey="Gewinn" stroke="#6bcb77" strokeWidth={2} fill="url(#gradGewinn)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Kategorien Pie + Mitarbeiter Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="street-card p-6">
          <h2 className="font-street text-xl text-white mb-4">Artikel nach Kategorie</h2>
          {pieData.length === 0 ? (
            <p className="text-street-500 text-center py-12">Keine Daten</p>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} Artikel (${props.payload.verfuegbar} verf., ${props.payload.verkauft} verk.)`,
                      props.payload.name
                    ]}
                    contentStyle={{ background: '#0f0f1a', border: '1px solid #2a2a3a', borderRadius: 8 }}
                    itemStyle={{ color: '#ccc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 w-full">
                {pieData.map((k, i) => (
                  <div key={k.name} className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-street-300 truncate">{k.name}</span>
                    <span className="text-street-500 ml-auto">{k.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="street-card p-6">
          <h2 className="font-street text-xl text-white mb-4">Team-Performance</h2>
          {mitBarData.length === 0 ? (
            <p className="text-street-500 text-center py-12">Keine Daten</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={mitBarData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="Ankäufe" fill="#4d96ff" radius={[3,3,0,0]} />
                <Bar dataKey="Verkäufe" fill="#ff6b35" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Mitarbeiter-Tabelle */}
      <div className="street-card p-6">
        <h2 className="font-street text-xl text-white mb-4 flex items-center gap-2">
          <Users size={20} className="text-primary" />
          Mitarbeiter Übersicht
        </h2>
        {mitarbeiterStats.length === 0 ? (
          <p className="text-street-500 text-center py-6">Keine Daten vorhanden</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-street-800">
                <tr>
                  <th className="text-left px-4 py-3 text-street-400 font-medium">Mitarbeiter</th>
                  <th className="text-right px-4 py-3 text-street-400 font-medium">Ankäufe</th>
                  <th className="text-right px-4 py-3 text-street-400 font-medium">Verkäufe</th>
                  <th className="text-right px-4 py-3 text-street-400 font-medium">Umsatz</th>
                  <th className="text-right px-4 py-3 text-street-400 font-medium">Bonus %</th>
                  <th className="text-right px-4 py-3 text-street-400 font-medium">Bonus $</th>
                  <th className="text-left px-4 py-3 text-street-400 font-medium">Bankkonto</th>
                </tr>
              </thead>
              <tbody>
                {mitarbeiterStats.map((m, i) => (
                  <tr key={m.id} className={i % 2 === 0 ? 'bg-street-900' : 'bg-street-800/40'}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                          {m.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-white font-medium">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-blue-400 font-semibold">{m.ankaufe}</td>
                    <td className="px-4 py-3 text-right text-primary font-semibold">{m.verkaeufe}</td>
                    <td className="px-4 py-3 text-right text-white">${parseFloat(m.umsatz).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-street-400">{m.bonus_prozent}%</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-neon-green font-semibold block">${parseFloat(m.bonus).toFixed(2)}</span>
                      {parseFloat(m.bonus_aus_ankauf||0) > 0 && (
                        <span className="text-blue-400/70 text-xs">${parseFloat(m.bonus_aus_ankauf).toFixed(2)} Ankauf</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-street-300 font-mono text-xs">
                      {m.bankkonto || <span className="text-street-600">–</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-street-800 border-t border-street-700">
                <tr>
                  <td className="px-4 py-3 text-street-400 font-semibold">Gesamt</td>
                  <td className="px-4 py-3 text-right text-blue-400 font-bold">{mitarbeiterStats.reduce((s,m)=>s+m.ankaufe,0)}</td>
                  <td className="px-4 py-3 text-right text-primary font-bold">{mitarbeiterStats.reduce((s,m)=>s+m.verkaeufe,0)}</td>
                  <td className="px-4 py-3 text-right text-white font-bold">${mitarbeiterStats.reduce((s,m)=>s+parseFloat(m.umsatz),0).toFixed(2)}</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right text-neon-green font-bold">${mitarbeiterStats.reduce((s,m)=>s+parseFloat(m.bonus),0).toFixed(2)}</td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Artikel Status + Quick Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="street-card p-6">
          <h2 className="font-street text-xl text-white mb-4">Artikel-Status</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Verfügbar', value: stats?.artikel.verfuegbar||0, color: 'text-neon-green' },
              { label: 'Reserviert', value: stats?.artikel.reserviert||0, color: 'text-yellow-400' },
              { label: 'Verkauft',   value: stats?.artikel.verkauft||0,   color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="text-center p-4 bg-street-800 rounded-lg">
                <p className={`text-3xl font-street ${s.color}`}>{s.value}</p>
                <p className="text-street-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="street-card p-6">
          <h2 className="font-street text-xl text-white mb-4">Quick Facts</h2>
          <div className="space-y-3">
            {[
              { label: 'Kategorien', value: stats?.kategorien||0 },
              { label: 'Team-Mitglieder', value: `${stats?.mitarbeiter.aktiv||0} aktiv` },
              { label: 'Re:Match Outfits', value: stats?.rematch.gesamt||0 },
              { label: 'Ø Verkaufspreis', value: `$${stats?.artikel.verfuegbar>0 ? (parseFloat(stats.werte.lagerWert)/stats.artikel.verfuegbar).toFixed(2) : '0.00'}` },
            ].map(f => (
              <div key={f.label} className="flex justify-between py-2 border-b border-street-700 last:border-0">
                <span className="text-street-400">{f.label}</span>
                <span className="text-white font-semibold">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistiken;
