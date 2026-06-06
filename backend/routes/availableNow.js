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

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}

// POST /toggle — companion toggles availability
router.post('/toggle', authenticate, (req, res) => {
  try {
    if (req.user.role !== 'companion') {
      return res.status(403).json({ error: 'Only companions can toggle availability.' });
    }

    const companion = db.prepare('SELECT * FROM companions WHERE user_id = ?').get(req.user.userId);
    if (!companion) {
      return res.status(404).json({ error: 'Companion profile not found.' });
    }

    const { is_available_now, current_city, latitude, longitude } = req.body;

    db.prepare(`
      INSERT INTO companion_live_status (companion_id, is_available_now, current_city, latitude, longitude, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(companion_id) DO UPDATE SET
        is_available_now = excluded.is_available_now,
        current_city = excluded.current_city,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      companion.id,
      is_available_now ? 1 : 0,
      current_city || null,
      latitude != null ? latitude : null,
      longitude != null ? longitude : null
    );

    const status = db.prepare('SELECT * FROM companion_live_status WHERE companion_id = ?').get(companion.id);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET / — get available companions
router.get('/', optionalAuth, (req, res) => {
  try {
    const { activity, maxRate, minRating } = req.query;

    let blockedIds = [];
    if (req.user) {
      const blocked = db.prepare(
        'SELECT blocked_user_id FROM blocked_users WHERE blocker_id = ?'
      ).all(req.user.userId);
      blockedIds = blocked.map((b) => b.blocked_user_id);
    }

    let companions = db.prepare(`
      SELECT c.*, u.name, u.email, cls.is_available_now, cls.current_city as live_city,
             cls.latitude, cls.longitude, cls.updated_at as status_updated_at
      FROM companions c
      JOIN users u ON u.id = c.user_id
      JOIN companion_live_status cls ON cls.companion_id = c.id
      WHERE cls.is_available_now = 1
    `).all();

    if (blockedIds.length > 0) {
      companions = companions.filter((c) => !blockedIds.includes(c.user_id));
    }

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

    if (maxRate) {
      companions = companions.filter((c) => c.hourly_rate <= parseFloat(maxRate));
    }

    if (minRating) {
      companions = companions.filter((c) => c.avg_rating >= parseFloat(minRating));
    }

    res.json(companions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /status — own availability status
router.get('/status', authenticate, (req, res) => {
  try {
    if (req.user.role !== 'companion') {
      return res.status(403).json({ error: 'Only companions can view their status.' });
    }

    const companion = db.prepare('SELECT * FROM companions WHERE user_id = ?').get(req.user.userId);
    if (!companion) {
      return res.status(404).json({ error: 'Companion profile not found.' });
    }

    const status = db.prepare('SELECT * FROM companion_live_status WHERE companion_id = ?').get(companion.id);
    res.json(status || { companion_id: companion.id, is_available_now: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
