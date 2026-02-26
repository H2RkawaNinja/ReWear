const { AktivitaetsLog } = require('../models');

/**
 * Schreibt einen Eintrag ins Aktivitätslog.
 * Nie blockierend – Fehler werden nur geloggt, nicht geworfen.
 * Keine personenbezogenen oder sensiblen Daten (keine IPs etc.)
 */
const logAktion = async (aktion, kategorie, mitarbeiter = null, details = {}) => {
  try {
    await AktivitaetsLog.create({
      aktion,
      kategorie,
      mitarbeiter_id: mitarbeiter?.id || null,
      mitarbeiter_name: mitarbeiter
        ? `${mitarbeiter.vorname} ${mitarbeiter.nachname}`
        : null,
      details
    });
  } catch (err) {
    // Logging darf nie die Hauptfunktionalität unterbrechen
    console.error('[Logger] Fehler beim Schreiben des Aktivitätslogs:', err.message);
  }
};

module.exports = { logAktion };
