const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔘 POST attendance (Time In / Out)
router.post('/', (req, res) => {
  const { staff_id, status } = req.body;

  if (!staff_id || !['IN', 'OUT'].includes(status)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const sql = 'INSERT INTO attendance (staff_id, status) VALUES (?, ?)';
  db.query(sql, [staff_id, status], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    res.status(201).json({ message: 'Attendance recorded successfully' });
  });
});

// 🔍 GET attendance logs by staff_id
router.get('/:staff_id', (req, res) => {
  const { staff_id } = req.params;
  const sql = 'SELECT * FROM attendance WHERE staff_id = ? ORDER BY timestamp DESC';
  db.query(sql, [staff_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    res.json(results);
  });
});

// 🔍 GET attendance by date (yyyy-mm-dd)
router.get('/date/:date', (req, res) => {
  const { date } = req.params;
  const sql = `
    SELECT * FROM attendance 
    WHERE DATE(timestamp) = ? 
    ORDER BY timestamp DESC
  `;
  db.query(sql, [date], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    res.json(results);
  });
});

module.exports = router;
