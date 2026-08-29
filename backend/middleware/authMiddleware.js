const jwt = require('jsonwebtoken');

// CONTRACT REQUIREMENT (Rohan's Week1_Rohan_CONTRACT.md, Section 2):
// This middleware MUST attach the authenticated user's ID to the request
// object exactly as req.user.id, since Rohan's service routes read it
// directly (e.g. to set services.provider_id).
//
// SPRINT 2 UPDATE (Naim's Week2_Naim_CONTRACT.md):
// req.user now also carries `role` so that the isAdmin middleware below
// can enforce admin-only access without an extra database round-trip.
const protect = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach both id AND role — existing routes only read req.user.id, which
    // is unchanged. The new isAdmin middleware reads req.user.role.
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

// Admin-only gate. MUST be used AFTER `protect` in the middleware chain so
// that req.user is already populated.
// Usage in server.js: app.use('/api/admin', protect, isAdmin, adminRoutes);
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Forbidden: Admin access required.'
  });
};

module.exports = { protect, isAdmin };
