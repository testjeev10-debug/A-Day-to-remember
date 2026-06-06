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

// POST /api/bookings - create booking (client only)
router.post('/', authenticate, (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ error: 'Only clients can create bookings.' });
  }

  const { companion_id, activity, date, hours, notes } = req.body;

  if (!companion_id || !activity || !date || !hours) {
    return res.status(400).json({ error: 'companion_id, activity, date, and hours are required.' });
  }

  const companion = db.prepare('SELECT * FROM companions WHERE id = ?').get(companion_id);
  if (!companion) {
    return res.status(404).json({ error: 'Companion not found.' });
  }

  const total_price = companion.hourly_rate * parseInt(hours);

  const result = db.prepare(`
    INSERT INTO bookings (client_id, companion_id, activity, date, hours, status, total_price, notes)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(req.user.userId, companion_id, activity, date, parseInt(hours), total_price, notes || '');

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(booking);
});

// GET /api/bookings - get own bookings
router.get('/', authenticate, (req, res) => {
  let bookings;

  if (req.user.role === 'client') {
    bookings = db.prepare(`
      SELECT b.*, u.name as companion_name, c.photo_url, c.id as companion_profile_id
      FROM bookings b
      JOIN companions c ON c.id = b.companion_id
      JOIN users u ON u.id = c.user_id
      WHERE b.client_id = ?
      ORDER BY b.created_at DESC
    `).all(req.user.userId);
  } else {
    // Companion - find their companion record
    const companion = db.prepare('SELECT * FROM companions WHERE user_id = ?').get(req.user.userId);
    if (!companion) return res.json([]);

    bookings = db.prepare(`
      SELECT b.*, u.name as client_name
      FROM bookings b
      JOIN users u ON u.id = b.client_id
      WHERE b.companion_id = ?
      ORDER BY b.created_at DESC
    `).all(companion.id);
  }

  // Check if each completed booking has a review
  const enriched = bookings.map((b) => {
    const review = db.prepare('SELECT * FROM reviews WHERE booking_id = ?').get(b.id);
    return { ...b, has_review: !!review };
  });

  res.json(enriched);
});

// PUT /api/bookings/:id/status
router.put('/:id/status', authenticate, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });

  if (req.user.role === 'client') {
    // Clients can only cancel their own pending bookings
    if (booking.client_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    if (status !== 'cancelled') {
      return res.status(400).json({ error: 'Clients can only cancel bookings.' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending bookings can be cancelled.' });
    }
  } else if (req.user.role === 'companion') {
    const companion = db.prepare('SELECT * FROM companions WHERE user_id = ?').get(req.user.userId);
    if (!companion || booking.companion_id !== companion.id) {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
  }

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id);
  const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  res.json(updated);
});

module.exports = router;
