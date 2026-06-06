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

// POST /:bookingId — submit happiness score (client only)
router.post('/:bookingId', authenticate, (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can submit happiness scores.' });
    }

    const { bookingId } = req.params;
    const { before_mood, after_score, safety_rating, would_meet_again, feedback_text } = req.body;

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    if (booking.client_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Happiness scores can only be submitted for completed bookings.' });
    }

    if (after_score == null || after_score < 1 || after_score > 10) {
      return res.status(400).json({ error: 'after_score must be between 1 and 10.' });
    }
    if (safety_rating != null && (safety_rating < 1 || safety_rating > 5)) {
      return res.status(400).json({ error: 'safety_rating must be between 1 and 5.' });
    }

    const result = db.prepare(`
      INSERT INTO happiness_scores
        (booking_id, user_id, companion_id, before_mood, after_score, safety_rating, would_meet_again, feedback_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      bookingId,
      req.user.userId,
      booking.companion_id,
      before_mood || null,
      after_score,
      safety_rating || null,
      would_meet_again ? 1 : 0,
      feedback_text || null
    );

    const record = db.prepare('SELECT * FROM happiness_scores WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(record);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Happiness score already submitted for this booking.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /dashboard — happiness dashboard for authenticated user
router.get('/dashboard', authenticate, (req, res) => {
  try {
    const scores = db.prepare(`
      SELECT hs.*, b.activity, u.name as companion_name
      FROM happiness_scores hs
      JOIN bookings b ON b.id = hs.booking_id
      JOIN companions c ON c.id = hs.companion_id
      JOIN users u ON u.id = c.user_id
      WHERE hs.user_id = ?
    `).all(req.user.userId);

    const totalSessions = scores.length;
    const averageScore = totalSessions > 0
      ? Math.round((scores.reduce((sum, s) => sum + s.after_score, 0) / totalSessions) * 10) / 10
      : 0;

    // Best category: activity with highest avg after_score
    const activityMap = {};
    scores.forEach((s) => {
      if (!activityMap[s.activity]) activityMap[s.activity] = { total: 0, count: 0 };
      activityMap[s.activity].total += s.after_score;
      activityMap[s.activity].count += 1;
    });
    let bestCategory = null;
    let bestCategoryScore = 0;
    for (const [activity, data] of Object.entries(activityMap)) {
      const avg = data.total / data.count;
      if (avg > bestCategoryScore) {
        bestCategoryScore = avg;
        bestCategory = activity;
      }
    }

    // Top companions: companions with avg score >= 4, ordered by score desc, top 3
    const companionMap = {};
    scores.forEach((s) => {
      if (!companionMap[s.companion_id]) {
        companionMap[s.companion_id] = { companion_id: s.companion_id, name: s.companion_name, total: 0, count: 0 };
      }
      companionMap[s.companion_id].total += s.after_score;
      companionMap[s.companion_id].count += 1;
    });
    const topCompanions = Object.values(companionMap)
      .map((c) => ({ ...c, avgScore: Math.round((c.total / c.count) * 10) / 10 }))
      .filter((c) => c.avgScore >= 4)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 3);

    // Mood history: last 10 mood logs
    const moodHistory = db.prepare(
      'SELECT * FROM mood_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
    ).all(req.user.userId);

    res.json({
      averageScore,
      totalSessions,
      bestCategory,
      topCompanions,
      moodHistory,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
