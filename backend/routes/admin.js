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

function adminOnly(req, res, next) {
  if (req.user.role === 'companion') {
    return res.status(403).json({ error: 'Companions cannot access admin routes.' });
  }
  next();
}

// GET /reports — all safety reports with reporter and reported user names
router.get('/reports', authenticate, adminOnly, (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT sr.*,
             r.name as reporter_name,
             r.email as reporter_email,
             ru.name as reported_user_name,
             ru.email as reported_user_email
      FROM safety_reports sr
      JOIN users r ON r.id = sr.reporter_id
      JOIN users ru ON ru.id = sr.reported_user_id
      ORDER BY sr.created_at DESC
    `).all();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /reports/:id — update report status
router.patch('/reports/:id', authenticate, adminOnly, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'status must be one of: pending, reviewed, resolved.' });
    }

    const report = db.prepare('SELECT * FROM safety_reports WHERE id = ?').get(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const reviewedAt = status !== 'pending' ? new Date().toISOString() : null;
    db.prepare(
      'UPDATE safety_reports SET status = ?, reviewed_at = ? WHERE id = ?'
    ).run(status, reviewedAt, id);

    const updated = db.prepare('SELECT * FROM safety_reports WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /analytics/happiness — avg scores by activity, total sessions, avg safety_rating
router.get('/analytics/happiness', authenticate, adminOnly, (req, res) => {
  try {
    const totalSessions = db.prepare('SELECT COUNT(*) as count FROM happiness_scores').get().count;

    const byActivity = db.prepare(`
      SELECT b.activity,
             COUNT(*) as sessions,
             ROUND(AVG(hs.after_score), 2) as avg_after_score,
             ROUND(AVG(hs.safety_rating), 2) as avg_safety_rating,
             SUM(hs.would_meet_again) as would_meet_again_count
      FROM happiness_scores hs
      JOIN bookings b ON b.id = hs.booking_id
      GROUP BY b.activity
      ORDER BY avg_after_score DESC
    `).all();

    const overall = db.prepare(`
      SELECT ROUND(AVG(after_score), 2) as avg_score,
             ROUND(AVG(safety_rating), 2) as avg_safety_rating
      FROM happiness_scores
    `).get();

    res.json({ totalSessions, byActivity, overall });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /analytics/moods — mood frequency counts, most popular moods
router.get('/analytics/moods', authenticate, adminOnly, (req, res) => {
  try {
    const moodCounts = db.prepare(`
      SELECT selected_mood, COUNT(*) as count
      FROM mood_logs
      GROUP BY selected_mood
      ORDER BY count DESC
    `).all();

    const totalLogs = moodCounts.reduce((sum, m) => sum + m.count, 0);
    const mostPopular = moodCounts.length > 0 ? moodCounts[0].selected_mood : null;

    res.json({ moodCounts, totalLogs, mostPopular });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /companions/available — all companions with their live status
router.get('/companions/available', authenticate, adminOnly, (req, res) => {
  try {
    const companions = db.prepare(`
      SELECT c.*, u.name, u.email,
             cls.is_available_now,
             cls.current_city as live_city,
             cls.latitude,
             cls.longitude,
             cls.updated_at as status_updated_at
      FROM companions c
      JOIN users u ON u.id = c.user_id
      LEFT JOIN companion_live_status cls ON cls.companion_id = c.id
      ORDER BY cls.is_available_now DESC, c.avg_rating DESC
    `).all();
    res.json(companions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
