const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ GET all leaves
router.get('/', (req, res) => {
  db.query('SELECT * FROM leaves ORDER BY start_date', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(results, null, 2));
  });
});

// ✅ BATCH INSERT leaves
router.post('/batch', (req, res) => {
  const leaveArray = req.body;

  if (!Array.isArray(leaveArray)) {
    return res.status(400).json({ error: 'Request body must be an array of leave objects' });
  }

  const values = leaveArray.map(l => [
    l.leave_id,
    l.staff_id,
    l.leave_type,
    l.start_date,
    l.end_date,
    l.reason,
    l.status || 'pending'
  ]);

  const sql = `
    INSERT INTO leaves (
      leave_id, staff_id, leave_type, start_date, end_date, reason, status
    ) VALUES ?
  `;

  db.query(sql, [values], (err, result) => {
    if (err) return res.status(500).json({ error: 'Batch insert failed', details: err });
    res.status(201).json({ message: `${result.affectedRows} leave requests submitted successfully` });
  });
});

// ✅ INDIVIDUAL ENDPOINTS — add below

// GET single leave
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM leaves WHERE leave_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Leave not found' });
    res.json(results[0]);
  });
});

// UPDATE leave
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { staff_id, leave_type, start_date, end_date, reason, status } = req.body;

  const sql = `
    UPDATE leaves SET staff_id = ?, leave_type = ?, start_date = ?, end_date = ?, reason = ?, status = ?
    WHERE leave_id = ?
  `;

  db.query(sql, [staff_id, leave_type, start_date, end_date, reason, status, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Update failed', details: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Leave not found' });
    res.json({ message: 'Leave updated successfully' });
  });
});

// DELETE leave
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM leaves WHERE leave_id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Delete failed', details: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Leave not found' });
    res.json({ message: 'Leave deleted successfully' });
  });
});

// 🔍 GET leave requests by specific date
router.get('/date/:date', (req, res) => {
  const { date } = req.params;
  const sql = `SELECT * FROM leaves WHERE DATE(start_date) <= ? AND DATE(end_date) >= ?`;
  db.query(sql, [date, date], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    res.json(results);
  });
});

// ✅ APPROVE leave request
router.post('/:id/approve', (req, res) => {
  const { id } = req.params;
  db.query(`UPDATE leaves SET status = 'approved' WHERE leave_id = ?`, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Update failed', details: err });
    res.json({ message: 'Leave approved successfully' });
  });
});

// ❌ REJECT leave request
router.post('/:id/reject', (req, res) => {
  const { id } = req.params;
  db.query(`UPDATE leaves SET status = 'rejected' WHERE leave_id = ?`, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Update failed', details: err });
    res.json({ message: 'Leave rejected successfully' });
  });
});


module.exports = router;
