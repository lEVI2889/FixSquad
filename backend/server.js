require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');

// NOTE for Rohan (Week1_Rohan_CONTRACT.md, Section 2):
// Once routes/serviceRoutes.js exists, uncomment the two lines below.
// This mounts it at /api/services with the `protect` middleware running
// first, exactly as the contract requires.
const app = express();
const serviceRoutes = require('./routes/serviceRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/services', protect, serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', protect, bookingRoutes);
app.use('/api/availability', protect, availabilityRoutes);

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
