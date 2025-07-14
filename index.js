const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const db = require('./db');

// Middleware
app.use(express.json());
app.use(cors()); // ✅ Allow CORS for cross-origin requests

// Serve static files from /public
app.use(express.static('public'));

// Routes
const staffRoutes = require('./routes/staffRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

// if you have one

app.use('/api/staff', staffRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api', authRoutes);
app.use('/api/attendance', attendanceRoutes);

// optional

// Test route to confirm frontend-backend connection
app.get('/api/test', (req, res) => {
  res.send('✅ Backend is connected successfully!');
});

// Default root
app.get('/', (req, res) => {
  res.send('Staff Leave Management API');
});

// Start server on 0.0.0.0 to allow LAN access
const PORT = 3000;
app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on all interfaces');
});
