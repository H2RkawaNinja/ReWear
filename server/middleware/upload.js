const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload-Verzeichnis erstellen falls nicht vorhanden
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Konfiguration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Unterordner basierend auf Typ
    let subDir = 'misc';
    
    if (req.baseUrl.includes('artikel')) {
      subDir = 'artikel';
    } else if (req.baseUrl.includes('mitarbeiter')) {
      subDir = 'avatars';
    } else if (req.baseUrl.includes('rematch')) {
      subDir = 'rematch';
    }
    
    const dir = path.join(uploadDir, subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Eindeutiger Dateiname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Dateityp-Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Ungültiger Dateityp. Erlaubt: JPEG, PNG, WebP'), false);
  }
};

// Multer Instanz
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  }
});

// Fehlerhandler für Multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Datei zu groß. Maximum: 5MB' });
    }
    return res.status(400).json({ error: `Upload-Fehler: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = {
  upload,
  handleUploadError
};
