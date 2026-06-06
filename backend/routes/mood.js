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

const MOOD_MAP = {
  'Lonely': ['Dining & Cafes', 'Morning Walk', 'Emotional Support', 'Book Club & Reading', 'Cuddling & Comfort'],
  'Bored': ['Shopping', 'Movies & Entertainment', 'Arcade Gaming', 'Food Tour', 'Board Games & Puzzles'],
  'Stressed': ['Morning Walk', 'Yoga & Meditation', 'Museum & Art Gallery', 'Spa Day', 'Dining & Cafes'],
  'Adventurous': ['Outdoor & City Tours', 'Food Tour', 'Hiking & Nature Walks', 'Concerts & Live Music', 'Photography Walk'],
  'Curious': ['Museum & Art Gallery', 'Book Club & Reading', 'Photography Walk', 'Cooking Together', 'Volunteering Together'],
  'Motivated': ['Gym & Workout', 'Cycling', 'Hiking & Nature Walks', 'Yoga & Meditation', 'Morning Walk'],
  'Celebrating': ['Dining & Cafes', 'Concerts & Live Music', 'Dancing', 'Karaoke', 'Bar & Nightlife'],
  'New in town': ['Outdoor & City Tours', 'Food Tour', 'Museum & Art Gallery', 'Photography Walk', 'Hiking & Nature Walks'],
};

// POST / — save mood log
router.post('/', authenticate, (req, res) => {
  try {
    const { selected_mood, recommended_activity } = req.body;
    if (!selected_mood) {
      return res.status(400).json({ error: 'selected_mood is required.' });
    }

    const recommendations = MOOD_MAP[selected_mood] || [];

    db.prepare(
      'INSERT INTO mood_logs (user_id, selected_mood, recommended_activity) VALUES (?, ?, ?)'
    ).run(req.user.userId, selected_mood, recommended_activity || (recommendations[0] || ''));

    res.status(201).json({ mood: selected_mood, recommendations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /recommendations — companions matching latest mood
router.get('/recommendations', authenticate, (req, res) => {
  try {
    const latestMood = db.prepare(
      'SELECT * FROM mood_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
    ).get(req.user.userId);

    if (!latestMood) {
      return res.json([]);
    }

    const recommendations = MOOD_MAP[latestMood.selected_mood] || [];
    if (recommendations.length === 0) {
      return res.json([]);
    }

    const allCompanions = db.prepare(`
      SELECT c.*, u.name, u.email
      FROM companions c
      JOIN users u ON u.id = c.user_id
    `).all();

    const matched = allCompanions.filter((companion) => {
      try {
        const activities = JSON.parse(companion.activities || '[]');
        return activities.some((a) => recommendations.includes(a));
      } catch {
        return false;
      }
    }).slice(0, 6);

    res.json(matched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /history — last 10 mood logs
router.get('/history', authenticate, (req, res) => {
  try {
    const logs = db.prepare(
      'SELECT * FROM mood_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
    ).all(req.user.userId);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
