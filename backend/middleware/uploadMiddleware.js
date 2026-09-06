const multer = require('multer');
const path = require('path');

// ─── Disk Storage Configuration ───────────────────────────────────────────────
// Files are saved to backend/uploads/ with a timestamp prefix to avoid
// filename collisions across concurrent uploads.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // e.g. "1725634500000-my-photo.jpg"
    const uniquePrefix = Date.now();
    // Sanitize the original name: replace spaces and special chars with hyphens
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    cb(null, `${uniquePrefix}-${safeName}`);
  }
});

// ─── File Type Filter ─────────────────────────────────────────────────────────
// Only allow JPEG, PNG, and WebP images. Reject all other MIME types with a
// clear 400-level error message.
const fileFilter = (req, file, cb) => {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// ─── Exported Multer Instance ─────────────────────────────────────────────────
// 5 MB size limit per file. Single-file upload using field name 'serviceImage'.
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

module.exports = upload;
