require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');

// NOTE for Rohan (Week1_Rohan_CONTRACT.md, Section 2):
// Once routes/serviceRoutes.js exists, uncomment the two lines below.
// This mounts it at /api/services with the `protect` middleware running
// first, exactly as the contract requires.
// const serviceRoutes = require('./routes/serviceRoutes');
// app.use('/api/services', protect, serviceRoutes);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Service Portfolio Manager API is running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
