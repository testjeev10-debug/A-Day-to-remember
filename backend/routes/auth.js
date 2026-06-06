const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'adaytoremember_secret';

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role, bio, hourly_rate, activities, city, photo_url } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' });
  }
  if (!['client', 'companion'].includes(role)) {
    return res.status(400).json({ error: 'Role must be client or companion.' });
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const result = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    ).run(name, email, hashedPassword, role);

    const userId = result.lastInsertRowid;

    if (role === 'companion') {
      db.prepare(
        'INSERT INTO companions (user_id, bio, hourly_rate, activities, city, photo_url) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(
        userId,
        bio || '',
        parseFloat(hourly_rate) || 0,
        JSON.stringify(activities || []),
        city || '',
        photo_url || ''
      );
    }

    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userId);
    let companionData = null;
    if (role === 'companion') {
      companionData = db.prepare('SELECT * FROM companions WHERE user_id = ?').get(userId);
    }

    const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user, companion: companionData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  let companionData = null;
  if (user.role === 'companion') {
    companionData = db.prepare('SELECT * FROM companions WHERE user_id = ?').get(user.id);
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    companion: companionData,
  });
});

module.exports = router;
