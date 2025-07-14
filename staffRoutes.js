const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ GET all staff
router.get('/', (req, res) => {
  db.query('SELECT * FROM staff ORDER BY staff_id', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(results, null, 2));
  });
});

// ✅ BATCH INSERT staff
router.post('/batch', (req, res) => {
  const staffData = req.body;

  if (!Array.isArray(staffData)) {
    return res.status(400).json({ error: 'Request body should be an array' });
  }

  const values = staffData.map(staff => [
    staff.staff_id,
    staff.name,
    staff.employee_type,
    staff.allow_sick_leave || false,
    staff.allow_other_leaves || false
  ]);

  const query = `
    INSERT INTO staff (staff_id, name, employee_type, allow_sick_leave, allow_other_leaves)
    VALUES ?
  `;

  db.query(query, [values], (err) => {
    if (err) return res.status(500).json({ error: 'Batch insert failed', details: err });
    res.status(201).json({ message: 'Staff batch inserted successfully' });
  });
});

// ✅ INDIVIDUAL ENDPOINTS — add below

// GET single staff
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM staff WHERE staff_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Staff not found' });
    res.json(results[0]);
  });
});

// UPDATE staff
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, employee_type, allow_sick_leave, allow_other_leaves } = req.body;

  const sql = `
    UPDATE staff SET name = ?, employee_type = ?, allow_sick_leave = ?, allow_other_leaves = ?
    WHERE staff_id = ?
  `;

  db.query(sql, [name, employee_type, allow_sick_leave, allow_other_leaves, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Update failed', details: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Staff not found' });
    res.json({ message: 'Staff updated successfully' });
  });
});

// DELETE staff
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM staff WHERE staff_id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Delete failed', details: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Staff not found' });
    res.json({ message: 'Staff deleted successfully' });
  });
});

module.exports = router;
