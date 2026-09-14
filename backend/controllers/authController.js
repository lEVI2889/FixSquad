const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// SPRINT 2 UPDATE (Naim's Week2_Naim_CONTRACT.md):
// `role` is now included in the JWT payload so that authMiddleware.js can
// attach req.user.role and the isAdmin middleware can gate admin routes
// without an extra DB query.
const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'fixsquad_secret_key_123';
  return jwt.sign({ id, role }, secret, { expiresIn: '7d' });
};

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, role = 'customer' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'name, email and password are required' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    const newUserId = result.insertId;
    // Pass role to generateToken so the JWT payload includes it
    const token = generateToken(newUserId, role);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUserId,
        name,
        email,
        role,
        token
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.message.includes('connect')) {
      const mockUser = { id: 1, name, email, role };
      const token = generateToken(mockUser.id, mockUser.role);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully (Dev Fallback)',
        data: { ...mockUser, token }
      });
    }
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'email and password are required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.message.includes('connect')) {
      const mockRole = email.includes('provider') ? 'provider' : email.includes('admin') ? 'admin' : 'customer';
      const mockUser = { id: 1, name: 'Wasik Customer', email, role: mockRole };
      const token = generateToken(mockUser.id, mockUser.role);
      return res.status(200).json({
        success: true,
        message: 'Login successful (Dev Fallback)',
        data: { ...mockUser, token }
      });
    }
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};


module.exports = { register, login };
