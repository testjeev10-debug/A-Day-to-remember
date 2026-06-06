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

// POST /reports — file a safety report
router.post('/reports', authenticate, (req, res) => {
  try {
    const { reported_user_id, booking_id, reason, description } = req.body;

    if (!reported_user_id || !reason) {
      return res.status(400).json({ error: 'reported_user_id and reason are required.' });
    }

    const reportedUser = db.prepare('SELECT id FROM users WHERE id = ?').get(reported_user_id);
    if (!reportedUser) {
      return res.status(404).json({ error: 'Reported user not found.' });
    }

    const result = db.prepare(`
      INSERT INTO safety_reports (reporter_id, reported_user_id, booking_id, reason, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.userId, reported_user_id, booking_id || null, reason, description || null);

    const record = db.prepare('SELECT * FROM safety_reports WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /block/:userId — block a user
router.post('/block/:userId', authenticate, (req, res) => {
  try {
    const { userId } = req.params;

    if (parseInt(userId) === req.user.userId) {
      return res.status(400).json({ error: 'You cannot block yourself.' });
    }

    const targetUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    db.prepare(
      'INSERT OR IGNORE INTO blocked_users (blocker_id, blocked_user_id) VALUES (?, ?)'
    ).run(req.user.userId, parseInt(userId));

    res.json({ blocked: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /block/:userId — unblock a user
router.delete('/block/:userId', authenticate, (req, res) => {
  try {
    const { userId } = req.params;

    db.prepare(
      'DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_user_id = ?'
    ).run(req.user.userId, parseInt(userId));

    res.json({ blocked: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /blocked — list blocked user IDs for authenticated user
router.get('/blocked', authenticate, (req, res) => {
  try {
    const blocked = db.prepare(
      'SELECT blocked_user_id, created_at FROM blocked_users WHERE blocker_id = ?'
    ).all(req.user.userId);
    res.json(blocked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /bookings/:bookingId/checkin — user checks in
router.post('/bookings/:bookingId/checkin', authenticate, (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Verify user is part of this booking
    let isClient = booking.client_id === req.user.userId;
    let isCompanion = false;
    if (req.user.role === 'companion') {
      const companion = db.prepare('SELECT * FROM companions WHERE user_id = ?').get(req.user.userId);
      isCompanion = companion && booking.companion_id === companion.id;
    }

    if (!isClient && !isCompanion) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const now = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM booking_safety WHERE booking_id = ?').get(bookingId);
    if (existing) {
      if (isClient) {
        db.prepare('UPDATE booking_safety SET user_checkin_at = ? WHERE booking_id = ?').run(now, bookingId);
      } else {
        db.prepare('UPDATE booking_safety SET companion_checkin_at = ? WHERE booking_id = ?').run(now, bookingId);
      }
    } else {
      if (isClient) {
        db.prepare(
          'INSERT INTO booking_safety (booking_id, user_checkin_at) VALUES (?, ?)'
        ).run(bookingId, now);
      } else {
        db.prepare(
          'INSERT INTO booking_safety (booking_id, companion_checkin_at) VALUES (?, ?)'
        ).run(bookingId, now);
      }
    }

    const safety = db.prepare('SELECT * FROM booking_safety WHERE booking_id = ?').get(bookingId);
    res.json(safety);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /bookings/:bookingId/checkout — user checks out
router.post('/bookings/:bookingId/checkout', authenticate, (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    let isClient = booking.client_id === req.user.userId;
    let isCompanion = false;
    if (req.user.role === 'companion') {
      const companion = db.prepare('SELECT * FROM companions WHERE user_id = ?').get(req.user.userId);
      isCompanion = companion && booking.companion_id === companion.id;
    }

    if (!isClient && !isCompanion) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const now = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM booking_safety WHERE booking_id = ?').get(bookingId);
    if (existing) {
      if (isClient) {
        db.prepare('UPDATE booking_safety SET user_checkout_at = ? WHERE booking_id = ?').run(now, bookingId);
      } else {
        db.prepare('UPDATE booking_safety SET companion_checkout_at = ? WHERE booking_id = ?').run(now, bookingId);
      }
    } else {
      if (isClient) {
        db.prepare(
          'INSERT INTO booking_safety (booking_id, user_checkout_at) VALUES (?, ?)'
        ).run(bookingId, now);
      } else {
        db.prepare(
          'INSERT INTO booking_safety (booking_id, companion_checkout_at) VALUES (?, ?)'
        ).run(bookingId, now);
      }
    }

    const safety = db.prepare('SELECT * FROM booking_safety WHERE booking_id = ?').get(bookingId);
    res.json(safety);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /bookings/:bookingId/sos — trigger SOS
router.post('/bookings/:bookingId/sos', authenticate, (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    let isClient = booking.client_id === req.user.userId;
    let isCompanion = false;
    if (req.user.role === 'companion') {
      const companion = db.prepare('SELECT * FROM companions WHERE user_id = ?').get(req.user.userId);
      isCompanion = companion && booking.companion_id === companion.id;
    }

    if (!isClient && !isCompanion) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const now = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM booking_safety WHERE booking_id = ?').get(bookingId);
    if (existing) {
      db.prepare(
        'UPDATE booking_safety SET sos_triggered = 1, sos_triggered_at = ? WHERE booking_id = ?'
      ).run(now, bookingId);
    } else {
      db.prepare(
        'INSERT INTO booking_safety (booking_id, sos_triggered, sos_triggered_at) VALUES (?, 1, ?)'
      ).run(bookingId, now);
    }

    res.json({ sos: true, message: 'Emergency services notified. Stay safe.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /bookings/:bookingId/safety — get safety status for a booking
router.get('/bookings/:bookingId/safety', authenticate, (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    let isClient = booking.client_id === req.user.userId;
    let isCompanion = false;
    if (req.user.role === 'companion') {
      const companion = db.prepare('SELECT * FROM companions WHERE user_id = ?').get(req.user.userId);
      isCompanion = companion && booking.companion_id === companion.id;
    }

    if (!isClient && !isCompanion) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const safety = db.prepare('SELECT * FROM booking_safety WHERE booking_id = ?').get(bookingId);
    res.json(safety || { booking_id: parseInt(bookingId), sos_triggered: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
