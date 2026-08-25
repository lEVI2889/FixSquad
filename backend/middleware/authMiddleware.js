const jwt = require('jsonwebtoken');

// CONTRACT REQUIREMENT (Rohan's Week1_Rohan_CONTRACT.md, Section 2):
// This middleware MUST attach the authenticated user's ID to the request
// object exactly as req.user.id, since Rohan's service routes read it
// directly (e.g. to set services.provider_id).
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
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

module.exports = { protect };
