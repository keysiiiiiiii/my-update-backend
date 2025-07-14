const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// 🔐 Register new user
router.post('/register', async (req, res) => {
  const { user_id, name, role, email, password } = req.body;

  if (!user_id || !name || !role || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (user_id, name, role, email, password)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [user_id, name, role, email, hashedPassword], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Email or ID already exists' });
        }
        return res.status(500).json({ error: 'Registration failed', details: err });
      }

      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Hashing error', details: err });
  }
});


// ✅ Add login route below (without removing /register)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE email = ? OR user_id = ? LIMIT 1';
  db.query(sql, [email, email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });

    const user = results[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid password' });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        name: user.name,
        role: user.role
      }
    });
  });
});

module.exports = router;
