// POST /api/upload/service-image
// Accepts a single image file via the 'serviceImage' multipart field.
// Returns the publicly accessible URL of the saved file.
// The URL is then included in POST /api/services or PUT /api/services/:id
// as the `image_url` body field.
exports.uploadServiceImage = (req, res) => {
  // req.file is populated by the uploadMiddleware (multer) that runs before this handler.
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided. Please attach a file using the "serviceImage" field.'
    });
  }

  // Build the public URL using the server's origin from the request.
  // Falls back to localhost:5000 for local development.
  const protocol = req.protocol;
  const host = req.get('host');
  const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  return res.status(200).json({
    success: true,
    message: 'Image uploaded successfully.',
    data: {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    }
  });
};
