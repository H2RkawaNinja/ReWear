const jwt = require('jsonwebtoken');
const { Mitarbeiter, Rolle, Recht } = require('../models');

// Authentifizierung prüfen
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Nicht autorisiert. Token fehlt.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const mitarbeiter = await Mitarbeiter.findByPk(decoded.id, {
      include: [{
        model: Rolle,
        as: 'rolle',
        include: [{
          model: Recht,
          as: 'rechte'
        }]
      }]
    });
    
    if (!mitarbeiter || !mitarbeiter.aktiv) {
      return res.status(401).json({ error: 'Mitarbeiter nicht gefunden oder inaktiv.' });
    }
    
    // Mitarbeiter und Rechte an Request anhängen
    req.mitarbeiter = mitarbeiter;
    req.rechte = mitarbeiter.rolle?.rechte?.map(r => r.schluessel) || [];
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Ungültiger Token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token abgelaufen.' });
    }
    console.error('Auth Fehler:', error);
    return res.status(500).json({ error: 'Authentifizierungsfehler.' });
  }
};

// Recht prüfen
const requirePermission = (...rechte) => {
  return (req, res, next) => {
    if (!req.rechte) {
      return res.status(403).json({ error: 'Keine Berechtigungen gefunden.' });
    }
    
    // Prüfen ob mindestens eines der erforderlichen Rechte vorhanden ist
    const hasPermission = rechte.some(recht => req.rechte.includes(recht));
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Keine Berechtigung für diese Aktion.',
        required: rechte
      });
    }
    
    next();
  };
};

// Alle erforderlichen Rechte prüfen
const requireAllPermissions = (...rechte) => {
  return (req, res, next) => {
    if (!req.rechte) {
      return res.status(403).json({ error: 'Keine Berechtigungen gefunden.' });
    }
    
    const hasAll = rechte.every(recht => req.rechte.includes(recht));
    
    if (!hasAll) {
      return res.status(403).json({ 
        error: 'Nicht alle erforderlichen Berechtigungen vorhanden.',
        required: rechte
      });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  requirePermission,
  requireAllPermissions
};
