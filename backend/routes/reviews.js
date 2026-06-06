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

// POST /api/reviews
router.post('/', authenticate, (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ error: 'Only clients can post reviews.' });
  }

  const { booking_id, rating, comment } = req.body;

  if (!booking_id || !rating) {
    return res.status(400).json({ error: 'booking_id and rating are required.' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });
  if (booking.client_id !== req.user.userId) {
    return res.status(403).json({ error: 'Not your booking.' });
  }
  if (booking.status !== 'completed') {
    return res.status(400).json({ error: 'Can only review completed bookings.' });
  }

  const existing = db.prepare('SELECT id FROM reviews WHERE booking_id = ?').get(booking_id);
  if (existing) {
    return res.status(409).json({ error: 'Review already submitted for this booking.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO reviews (booking_id, reviewer_id, companion_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(booking_id, req.user.userId, booking.companion_id, parseInt(rating), comment || '');

    // Update companion avg_rating
    const stats = db.prepare(`
      SELECT AVG(rating) as avg, COUNT(*) as cnt
      FROM reviews WHERE companion_id = ?
    `).get(booking.companion_id);

    db.prepare(`
      UPDATE companions SET avg_rating = ?, review_count = ? WHERE id = ?
    `).run(
      Math.round(stats.avg * 10) / 10,
      stats.cnt,
      booking.companion_id
    );

    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

module.exports = router;
