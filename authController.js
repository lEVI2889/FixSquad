const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;

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
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const newUserId = result.insertId;
    const token = generateToken(newUserId);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUserId,
        name,
        email,
        token
      }
    });
  } catch (err) {
    console.error('Register error:', err.message);
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
      'SELECT id, name, email, password FROM users WHERE email = ?',
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

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        token
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

module.exports = { register, login };
