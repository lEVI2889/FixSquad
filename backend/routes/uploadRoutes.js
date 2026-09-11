const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadServiceImage } = require('../controllers/uploadController');

// POST /api/upload/service-image
// Accepts a single image via the 'serviceImage' multipart field.
// Requires authentication — providers upload images for their own services.
// Multer processes the file first, then the controller handler runs.
router.post(
  '/service-image',
  protect,
  upload.single('serviceImage'),
  // Multer error handler: catches file type rejection and size limit errors
  // and formats them as a standard API response instead of a generic Express crash.
  (err, req, res, next) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  },
  uploadServiceImage
);

module.exports = router;
