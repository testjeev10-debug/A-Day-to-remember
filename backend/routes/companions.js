const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'adaytoremember_secret';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

// GET /api/companions
router.get('/', (req, res) => {
  const { activity, city, maxRate } = req.query;

  let query = `
    SELECT c.*, u.name, u.email
    FROM companions c
    JOIN users u ON u.id = c.user_id
    WHERE 1=1
  `;
  const params = [];

  if (city) {
    query += ` AND LOWER(c.city) LIKE LOWER(?)`;
    params.push(`%${city}%`);
  }
  if (maxRate) {
    query += ` AND c.hourly_rate <= ?`;
    params.push(parseFloat(maxRate));
  }

  query += ` ORDER BY c.avg_rating DESC`;

  let companions = db.prepare(query).all(...params);

  // Filter by activity in JS (activities is JSON)
  if (activity) {
    companions = companions.filter((c) => {
      try {
        const acts = JSON.parse(c.activities || '[]');
        return acts.some((a) => a.toLowerCase().includes(activity.toLowerCase()));
      } catch {
        return false;
      }
    });
  }

  res.json(companions);
});

// GET /api/companions/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const companion = db.prepare(`
    SELECT c.*, u.name, u.email
    FROM companions c
    JOIN users u ON u.id = c.user_id
    WHERE c.id = ?
  `).get(id);

  if (!companion) {
    return res.status(404).json({ error: 'Companion not found.' });
  }

  const reviews = db.prepare(`
    SELECT r.*, u.name as reviewer_name
    FROM reviews r
    JOIN users u ON u.id = r.reviewer_id
    WHERE r.companion_id = ?
    ORDER BY r.created_at DESC
  `).all(id);

  res.json({ ...companion, reviews });
});

// PUT /api/companions/profile
router.put('/profile', authenticate, (req, res) => {
  if (req.user.role !== 'companion') {
    return res.status(403).json({ error: 'Only companions can update their profile.' });
  }

  const { bio, hourly_rate, activities, city, photo_url } = req.body;

  const companion = db.prepare('SELECT * FROM companions WHERE user_id = ?').get(req.user.userId);
  if (!companion) {
    return res.status(404).json({ error: 'Companion profile not found.' });
  }

  db.prepare(`
    UPDATE companions
    SET bio = ?, hourly_rate = ?, activities = ?, city = ?, photo_url = ?
    WHERE user_id = ?
  `).run(
    bio !== undefined ? bio : companion.bio,
    hourly_rate !== undefined ? parseFloat(hourly_rate) : companion.hourly_rate,
    activities !== undefined ? JSON.stringify(activities) : companion.activities,
    city !== undefined ? city : companion.city,
    photo_url !== undefined ? photo_url : companion.photo_url,
    req.user.userId
  );

  const updated = db.prepare('SELECT * FROM companions WHERE user_id = ?').get(req.user.userId);
  res.json(updated);
});

module.exports = router;
