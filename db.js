const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to MySQL database');
});

module.exports = db;

const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors()); // Allow frontend to access backend
app.use(express.json());

const requestRoutes = require('./routes/requests');
app.use('/api/requests-for-vp', requestRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
