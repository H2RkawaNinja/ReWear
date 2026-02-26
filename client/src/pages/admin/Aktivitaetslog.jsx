import { useState, useEffect, useCallback } from 'react';
import { Filter, RefreshCw, ChevronLeft, ChevronRight, Clock, Trash2 } from 'lucide-react';
import api from '../../services/api';

const KATEGORIEN = ['alle', 'Artikel', 'Ankauf', 'Verkauf', 'Auth', 'Mitarbeiter', 'Rollen', 'Rematch', 'System'];

const ZEITRAEUME = [
  { value: 'alle', label: 'Alle Zeiten' },
  { value: 'heute', label: 'Heute' },
  { value: 'gestern', label: 'Gestern' },
  { value: 'woche', label: 'Letzte 7 Tage' },
  { value: 'monat', label: 'Dieser Monat' },
];

const KATEGORIE_FARBEN = {
  Artikel:     { bg: 'bg-blue-500/15',   text: 'text-blue-400',   dot: 'bg-blue-400' },
  Ankauf:      { bg: 'bg-green-500/15',  text: 'text-green-400',  dot: 'bg-green-400' },
  Verkauf:     { bg: 'bg-orange-500/15', text: 'text-orange-400', dot: 'bg-orange-400' },
  Auth:        { bg: 'bg-purple-500/15', text: 'text-purple-400', dot: 'bg-purple-400' },
  Mitarbeiter: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  Rollen:      { bg: 'bg-red-500/15',    text: 'text-red-400',    dot: 'bg-red-400' },
  Rematch:     { bg: 'bg-pink-500/15',   text: 'text-pink-400',   dot: 'bg-pink-400' },
  System:      { bg: 'bg-street-700/50', text: 'text-street-400', dot: 'bg-street-500' },
};

const formatZeit = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
};

const KategorieBadge = ({ kategorie }) => {
  const farbe = KATEGORIE_FARBEN[kategorie] || KATEGORIE_FARBEN.System;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${farbe.bg} ${farbe.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${farbe.dot}`} />
      {kategorie}
    </span>
  );
};

const Aktivitaetslog = () => {
  const [eintraege, setEintraege] = useState([]);
  const [gesamt, setGesamt] = useState(0);
  const [seiten, setSeiten] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mitarbeiterListe, setMitarbeiterListe] = useState([]);
  const [bestaetigung, setBestaetigung] = useState(false);
  const [loesching, setLoesching] = useState(false);

  const [filter, setFilter] = useState({
    kategorie: 'alle',
    mitarbeiter_id: 'alle',
    zeitraum: 'heute',
    seite: 1
  });

  const laden = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        kategorie: filter.kategorie,
        mitarbeiter_id: filter.mitarbeiter_id,
        zeitraum: filter.zeitraum,
        seite: filter.seite,
        limit: 50
      });
      const res = await api.get(`/log?${params}`);
      setEintraege(res.data.eintraege);
      setGesamt(res.data.gesamt);
      setSeiten(res.data.seiten);
    } catch (err) {
      console.error('Log laden Fehler:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    laden();
  }, [laden]);

  useEffect(() => {
    api.get('/log/mitarbeiter').then(res => setMitarbeiterListe(res.data)).catch(() => {});
  }, []);

  const setFilterVal = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: value, seite: key !== 'seite' ? 1 : prev.seite }));
  };

  const alleLoeschen = async () => {
    setLoesching(true);
    try {
      await api.delete('/log');
      setEintraege([]);
      setGesamt(0);
      setSeiten(1);
      setBestaetigung(false);
    } catch (err) {
      console.error('Log löschen Fehler:', err);
    } finally {
      setLoesching(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-street text-3xl text-white mb-1">Aktivitätslog</h1>
          <p className="text-street-400 text-sm">
            {gesamt} Einträge gefunden
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBestaetigung(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/60 transition-colors rounded-lg text-sm"
          >
            <Trash2 size={15} />
            Alle löschen
          </button>
          <button
            onClick={laden}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-street-800 border border-street-700 text-street-300 hover:text-white hover:border-primary transition-colors rounded-lg text-sm"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Aktualisieren
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="street-card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3 text-street-400 text-sm">
          <Filter size={15} />
          Filter
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Kategorie */}
          <div>
            <label className="block text-xs text-street-500 mb-1.5">Kategorie</label>
            <select
              value={filter.kategorie}
              onChange={e => setFilterVal('kategorie', e.target.value)}
              className="w-full bg-street-800 border border-street-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              {KATEGORIEN.map(k => (
                <option key={k} value={k}>{k === 'alle' ? 'Alle Kategorien' : k}</option>
              ))}
            </select>
          </div>

          {/* Mitarbeiter */}
          <div>
            <label className="block text-xs text-street-500 mb-1.5">Mitarbeiter</label>
            <select
              value={filter.mitarbeiter_id}
              onChange={e => setFilterVal('mitarbeiter_id', e.target.value)}
              className="w-full bg-street-800 border border-street-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="alle">Alle Mitarbeiter</option>
              {mitarbeiterListe.map(m => (
                <option key={m.id} value={m.id}>{m.vorname} {m.nachname}</option>
              ))}
            </select>
          </div>

          {/* Zeitraum */}
          <div>
            <label className="block text-xs text-street-500 mb-1.5">Zeitraum</label>
            <select
              value={filter.zeitraum}
              onChange={e => setFilterVal('zeitraum', e.target.value)}
              className="w-full bg-street-800 border border-street-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              {ZEITRAEUME.map(z => (
                <option key={z.value} value={z.value}>{z.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabelle */}
      <div className="street-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-street-400">
            <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-primary" />
            Lade Einträge...
          </div>
        ) : eintraege.length === 0 ? (
          <div className="p-12 text-center text-street-400">
            <Clock size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-semibold text-white mb-1">Keine Einträge</p>
            <p className="text-sm">Für den gewählten Filter wurden keine Aktivitäten gefunden.</p>
          </div>
        ) : (
          <>
            {/* Desktop Tabelle */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-street-700">
                    <th className="text-left text-xs text-street-500 font-medium px-5 py-3 w-44">Zeit</th>
                    <th className="text-left text-xs text-street-500 font-medium px-5 py-3 w-36">Mitarbeiter</th>
                    <th className="text-left text-xs text-street-500 font-medium px-5 py-3 w-32">Kategorie</th>
                    <th className="text-left text-xs text-street-500 font-medium px-5 py-3">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {eintraege.map((e, i) => (
                    <tr
                      key={e.id}
                      className={`border-b border-street-800 hover:bg-street-800/50 transition-colors ${i % 2 === 0 ? '' : 'bg-street-900/30'}`}
                    >
                      <td className="px-5 py-3 text-xs text-street-400 whitespace-nowrap font-mono">
                        {formatZeit(e.erstellt_am)}
                      </td>
                      <td className="px-5 py-3 text-sm text-white">
                        {e.mitarbeiter_name || <span className="text-street-600 italic">System</span>}
                      </td>
                      <td className="px-5 py-3">
                        <KategorieBadge kategorie={e.kategorie} />
                      </td>
                      <td className="px-5 py-3 text-sm text-street-200">
                        {e.aktion}
                        {e.details && Object.keys(e.details).length > 0 && (
                          <span className="ml-2 text-xs text-street-500 font-mono">
                            {Object.entries(e.details)
                              .filter(([k]) => !['artikel_id', 'mitarbeiter_id'].includes(k))
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' · ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-street-800">
              {eintraege.map(e => (
                <div key={e.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <KategorieBadge kategorie={e.kategorie} />
                    <span className="text-xs text-street-500 font-mono">{formatZeit(e.erstellt_am)}</span>
                  </div>
                  <p className="text-sm text-white mb-1">{e.aktion}</p>
                  <p className="text-xs text-street-500">{e.mitarbeiter_name || 'System'}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {seiten > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-street-400">
            Seite {filter.seite} von {seiten}
          </span>
          <div className="flex gap-2">
            <button
              disabled={filter.seite <= 1}
              onClick={() => setFilterVal('seite', filter.seite - 1)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-street-800 border border-street-700 text-street-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <ChevronLeft size={15} /> Zurück
            </button>
            <button
              disabled={filter.seite >= seiten}
              onClick={() => setFilterVal('seite', filter.seite + 1)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-street-800 border border-street-700 text-street-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Weiter <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Bestätigungsdialog */}
      {bestaetigung && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setBestaetigung(false)} />
          <div className="relative bg-street-900 border border-street-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Log löschen?</h3>
                <p className="text-street-400 text-sm">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              </div>
            </div>
            <p className="text-street-300 text-sm mb-6">
              Es werden <span className="text-white font-semibold">{gesamt} Einträge</span> unwiderruflich gelöscht.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBestaetigung(false)}
                disabled={loesching}
                className="flex-1 px-4 py-2 bg-street-800 border border-street-600 text-street-300 hover:text-white rounded-lg text-sm transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={alleLoeschen}
                disabled={loesching}
                className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loesching ? 'Wird gelöscht...' : 'Ja, alle löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aktivitaetslog;
