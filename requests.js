const express = require('express');
const router = express.Router();
const db = require('../db'); // your db.js file

// GET /api/requests-for-vp
router.get('/vp', (req, res) => {
  const query = `SELECT id, staff_name, date, reason, file_url, status FROM leave_requests ORDER BY date DESC`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// POST /api/requests-for-vp/update-status
router.post('/update-status', (req, res) => {
  const { id, status } = req.body;
  if (!id || !status) return res.status(400).json({ error: 'Missing id or status' });

  const query = `UPDATE leave_requests SET status = ? WHERE id = ?`;

  db.query(query, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update status' });
    res.json({ success: true });
  });
});


module.exports = router;
