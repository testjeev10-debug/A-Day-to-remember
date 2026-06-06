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
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    } catch {}
  }
  next();
}

// Rich scenario suggestions per mood
const MOOD_SCENARIOS = {
  'Lonely': [
    { id: 'docks-walk', emoji: '🌊', title: 'Walk at the docks', description: 'Stroll along the waterfront, breathe in the fresh air and have a heart-to-heart chat', activity: 'Morning Walk', duration: '1-2 hrs', vibe: 'Calm & Cozy' },
    { id: 'coffee-chat', emoji: '☕', title: 'Coffee & chitchat', description: 'Find a cozy café, grab a warm drink and just talk about anything and everything', activity: 'Dining & Cafes', duration: '1-2 hrs', vibe: 'Warm & Friendly' },
    { id: 'bookstore-browse', emoji: '📚', title: 'Bookstore hangout', description: 'Wander through a bookstore together, share book recommendations and explore ideas', activity: 'Book Club & Reading', duration: '1-2 hrs', vibe: 'Calm & Cozy' },
    { id: 'comfort-tv', emoji: '🛋️', title: 'Comfort binge session', description: 'Curl up and watch a feel-good series together — zero judgment, all warmth', activity: 'Cuddling & Comfort', duration: '2-3 hrs', vibe: 'Cozy & Safe' },
    { id: 'park-picnic', emoji: '🌸', title: 'Park picnic & conversation', description: 'Pack some snacks, find a sunny spot and enjoy slow, meaningful company', activity: 'Picnic', duration: '2 hrs', vibe: 'Cheerful & Light' },
  ],
  'Bored': [
    { id: 'arcade-battle', emoji: '🕹️', title: 'Arcade battle', description: 'Head to an arcade and compete in games — winner buys the snacks!', activity: 'Arcade Gaming', duration: '2 hrs', vibe: 'Fun & Energetic' },
    { id: 'mystery-food-tour', emoji: '🍜', title: 'Mystery food tour', description: 'Your companion picks 3 spots you have never tried. Surprise guaranteed!', activity: 'Food Tour', duration: '2-3 hrs', vibe: 'Adventurous & Fun' },
    { id: 'thrift-hunt', emoji: '🛍️', title: 'Thrift store treasure hunt', description: 'See who finds the weirdest or coolest item for under $5', activity: 'Shopping', duration: '2 hrs', vibe: 'Playful & Creative' },
    { id: 'escape-room', emoji: '🔐', title: 'Escape room challenge', description: 'Put your brains together and race against the clock to escape', activity: 'Escape Rooms', duration: '1-2 hrs', vibe: 'Thrilling & Fun' },
    { id: 'board-games', emoji: '🎲', title: 'Board game café', description: 'Pick from hundreds of games, order drinks and lose track of time', activity: 'Board Games & Puzzles', duration: '2-3 hrs', vibe: 'Relaxed & Fun' },
  ],
  'Stressed': [
    { id: 'sunset-walk', emoji: '🌅', title: 'Sunset walk & vent session', description: 'Walk it out at golden hour — fresh air, gentle movement and a listening ear', activity: 'Morning Walk', duration: '1 hr', vibe: 'Calming & Healing' },
    { id: 'yoga-session', emoji: '🧘', title: 'Guided yoga & breathwork', description: 'Unwind with a calming yoga session in the park or at a studio', activity: 'Yoga & Meditation', duration: '1-2 hrs', vibe: 'Peaceful & Restorative' },
    { id: 'spa-afternoon', emoji: '💆', title: 'Spa afternoon', description: 'Treat yourself to a relaxing spa day with a companion who keeps the vibe chill', activity: 'Spa Day', duration: '2-3 hrs', vibe: 'Luxurious & Calm' },
    { id: 'museum-wander', emoji: '🏛️', title: 'Quiet museum wander', description: 'Slow down and get lost in art, history or science — no rushing, just you and curiosity', activity: 'Museum & Art Gallery', duration: '2 hrs', vibe: 'Calm & Reflective' },
    { id: 'cafe-corner', emoji: '🍵', title: 'Quiet café corner', description: 'Find the quietest café table, order herbal tea and decompress together', activity: 'Dining & Cafes', duration: '1 hr', vibe: 'Cozy & Quiet' },
  ],
  'Adventurous': [
    { id: 'city-explore', emoji: '🗺️', title: 'Hidden city explorer', description: 'Your companion takes you to spots most locals don\'t even know about', activity: 'Outdoor & City Tours', duration: '3 hrs', vibe: 'Exciting & Bold' },
    { id: 'hike-sunrise', emoji: '🌄', title: 'Sunrise hike', description: 'Hit the trail early for breathtaking views and fresh mountain air', activity: 'Hiking & Nature Walks', duration: '3-4 hrs', vibe: 'Energetic & Bold' },
    { id: 'food-adventure', emoji: '🌮', title: 'Spicy food adventure', description: 'Challenge your taste buds at the most daring restaurants in town', activity: 'Food Tour', duration: '2-3 hrs', vibe: 'Bold & Exciting' },
    { id: 'concert-night', emoji: '🎸', title: 'Live concert night', description: 'Catch a live band or performer and feel the energy of live music', activity: 'Concerts & Live Music', duration: '3 hrs', vibe: 'Electric & Wild' },
    { id: 'photo-walk', emoji: '📸', title: 'Urban photography walk', description: 'See the city through a camera lens — capture stories in every street corner', activity: 'Photography Walk', duration: '2-3 hrs', vibe: 'Creative & Free' },
  ],
  'Curious': [
    { id: 'museum-deep', emoji: '🎨', title: 'Deep-dive museum visit', description: 'Pick one exhibit and go deep — your companion adds fascinating context', activity: 'Museum & Art Gallery', duration: '2-3 hrs', vibe: 'Intellectual & Enriching' },
    { id: 'cooking-class', emoji: '👨‍🍳', title: 'Cook a new cuisine together', description: 'Pick a cuisine you\'ve never cooked and learn it side by side', activity: 'Cooking Together', duration: '2 hrs', vibe: 'Creative & Warm' },
    { id: 'volunteer-day', emoji: '🤝', title: 'Volunteer for a day', description: 'Give back and learn something new about your community and yourself', activity: 'Volunteering Together', duration: '3-4 hrs', vibe: 'Meaningful & Uplifting' },
    { id: 'photo-story', emoji: '📷', title: 'Documentary photo walk', description: 'Create a visual story of your neighbourhood — street art, faces, textures', activity: 'Photography Walk', duration: '2 hrs', vibe: 'Artistic & Exploratory' },
    { id: 'book-club', emoji: '📖', title: 'One-on-one book club', description: 'Both pick a chapter of the same book and debate your interpretations over coffee', activity: 'Book Club & Reading', duration: '1-2 hrs', vibe: 'Thoughtful & Lively' },
  ],
  'Motivated': [
    { id: 'gym-partner', emoji: '🏋️', title: 'Gym partner session', description: 'Hit the gym with someone who keeps you accountable and hypes you up', activity: 'Gym & Workout', duration: '1-2 hrs', vibe: 'Energetic & Focused' },
    { id: 'morning-cycle', emoji: '🚴', title: 'Morning cycling route', description: 'Map out a scenic cycling route and push each other to finish strong', activity: 'Cycling', duration: '1-2 hrs', vibe: 'Active & Fresh' },
    { id: 'trail-run', emoji: '🏃', title: 'Trail run or power walk', description: 'Hit a nature trail and burn energy while soaking in the scenery', activity: 'Hiking & Nature Walks', duration: '1.5 hrs', vibe: 'Energetic & Free' },
    { id: 'yoga-power', emoji: '🧘', title: 'Power yoga flow', description: 'A strong vinyasa session to build strength and clear your head', activity: 'Yoga & Meditation', duration: '1 hr', vibe: 'Strong & Centered' },
    { id: 'dawn-walk', emoji: '🌞', title: 'Dawn walk & planning session', description: 'Walk and talk through your goals for the week — accountability and fresh air', activity: 'Morning Walk', duration: '45 min', vibe: 'Crisp & Purposeful' },
  ],
  'Celebrating': [
    { id: 'fancy-dinner', emoji: '🍾', title: 'Celebratory dinner', description: 'Toast to you at a restaurant that matches the magnitude of your win', activity: 'Dining & Cafes', duration: '2 hrs', vibe: 'Festive & Special' },
    { id: 'karaoke-night', emoji: '🎤', title: 'Karaoke night out', description: 'Belt your heart out and make it a night to remember — literally', activity: 'Karaoke', duration: '2-3 hrs', vibe: 'Wild & Fun' },
    { id: 'dance-night', emoji: '💃', title: 'Dance the night away', description: 'Hit a dance floor and celebrate with music and movement', activity: 'Dancing', duration: '2-3 hrs', vibe: 'Electric & Joyful' },
    { id: 'live-show', emoji: '🎶', title: 'Live music show', description: 'Experience the energy of live performance to mark your milestone', activity: 'Concerts & Live Music', duration: '3 hrs', vibe: 'Euphoric & Memorable' },
    { id: 'rooftop-bar', emoji: '🥂', title: 'Rooftop bar evening', description: 'Sip drinks with a view and let the city skyline be your backdrop', activity: 'Bar & Nightlife', duration: '2 hrs', vibe: 'Glamorous & Fun' },
  ],
  'New in town': [
    { id: 'local-guide', emoji: '🗺️', title: 'Local guide tour', description: 'Your companion is a local — they show you real spots, not tourist traps', activity: 'Outdoor & City Tours', duration: '3 hrs', vibe: 'Exciting & Welcoming' },
    { id: 'food-scene', emoji: '🍽️', title: 'Local food scene tour', description: 'Taste your way through the city\'s best bites from street food to hidden gems', activity: 'Food Tour', duration: '2-3 hrs', vibe: 'Delicious & Adventurous' },
    { id: 'culture-dive', emoji: '🏛️', title: 'Culture & history dive', description: 'Understand the soul of your new city through its museums and landmarks', activity: 'Museum & Art Gallery', duration: '2 hrs', vibe: 'Enriching & Grounding' },
    { id: 'photo-memories', emoji: '📸', title: 'First day photo memories', description: 'Document your first impressions — a photo walk that tells your arrival story', activity: 'Photography Walk', duration: '2 hrs', vibe: 'Nostalgic & Exciting' },
    { id: 'nature-escape', emoji: '🌲', title: 'Nature escape nearby', description: 'Find the nearest park or nature spot and reset with fresh air', activity: 'Hiking & Nature Walks', duration: '2-3 hrs', vibe: 'Peaceful & Refreshing' },
  ],
};

// Group activities per mood
const GROUP_ACTIVITIES = {
  'Lonely': [
    { emoji: '🎲', title: 'Board Game Night', description: 'Join a public board game meetup — meet new people in a low-pressure setting', spots: '4-8 people' },
    { emoji: '📚', title: 'Community Book Circle', description: 'Local reading groups meet weekly at coffee shops and libraries', spots: '5-12 people' },
  ],
  'Bored': [
    { emoji: '🎮', title: 'Multiplayer Gaming Event', description: 'Group arcade sessions and multiplayer game nights happening this week', spots: '4-10 people' },
    { emoji: '🎨', title: 'Paint & Sip Night', description: 'Guided painting session with drinks — no experience needed', spots: '8-15 people' },
  ],
  'Stressed': [
    { emoji: '🧘', title: 'Group Meditation Circle', description: 'Free community guided meditation session in the park this weekend', spots: '10-20 people' },
    { emoji: '🚶', title: 'Wellness Walking Club', description: 'Join a structured walking group focused on mindfulness and light chat', spots: '5-15 people' },
  ],
  'Adventurous': [
    { emoji: '🥾', title: 'Weekend Hiking Group', description: 'Join 6-12 explorers on a scenic local trail this Saturday', spots: '6-12 people' },
    { emoji: '📸', title: 'Street Photography Meetup', description: 'Collaborative photo walk with post-session review and sharing', spots: '5-10 people' },
  ],
  'Curious': [
    { emoji: '🔭', title: 'Stargazing Night', description: 'Community telescope event on a hilltop — guides explain constellations', spots: '10-25 people' },
    { emoji: '🎙️', title: 'TED-style Talk Night', description: 'Local speakers share 5-minute ideas on fascinating topics', spots: '15-30 people' },
  ],
  'Motivated': [
    { emoji: '🏃', title: 'Community Run Club', description: 'Free 5K run every Saturday morning — all paces welcome', spots: '10-50 people' },
    { emoji: '🏋️', title: 'Outdoor Boot Camp', description: 'Group fitness session in the park led by a certified trainer', spots: '8-20 people' },
  ],
  'Celebrating': [
    { emoji: '🎉', title: 'Pop-up Party Night', description: 'Join a community celebration event — music, drinks and strangers to impress', spots: '20-50 people' },
    { emoji: '🎤', title: 'Open Mic Karaoke', description: 'Public karaoke session — show up, sing, make new friends', spots: '10-30 people' },
  ],
  'New in town': [
    { emoji: '🌍', title: 'Expat & Newcomers Meetup', description: 'Weekly gathering for people new to the city — instantly feel at home', spots: '10-30 people' },
    { emoji: '🍕', title: 'International Food Potluck', description: 'Bring a dish from your home culture and share stories over food', spots: '15-25 people' },
  ],
};

const MOOD_MAP = {
  'Lonely': ['Dining & Cafes', 'Morning Walk', 'Emotional Support', 'Book Club & Reading', 'Cuddling & Comfort', 'Picnic'],
  'Bored': ['Shopping', 'Movies & Entertainment', 'Arcade Gaming', 'Food Tour', 'Board Games & Puzzles', 'Escape Rooms'],
  'Stressed': ['Morning Walk', 'Yoga & Meditation', 'Museum & Art Gallery', 'Spa Day', 'Dining & Cafes'],
  'Adventurous': ['Outdoor & City Tours', 'Food Tour', 'Hiking & Nature Walks', 'Concerts & Live Music', 'Photography Walk'],
  'Curious': ['Museum & Art Gallery', 'Book Club & Reading', 'Photography Walk', 'Cooking Together', 'Volunteering Together'],
  'Motivated': ['Gym & Workout', 'Cycling', 'Hiking & Nature Walks', 'Yoga & Meditation', 'Morning Walk'],
  'Celebrating': ['Dining & Cafes', 'Concerts & Live Music', 'Dancing', 'Karaoke', 'Bar & Nightlife'],
  'New in town': ['Outdoor & City Tours', 'Food Tour', 'Museum & Art Gallery', 'Photography Walk', 'Hiking & Nature Walks'],
};

// GET /scenarios/:mood — rich scenario suggestions + available companions per scenario activity
router.get('/scenarios/:mood', optionalAuth, (req, res) => {
  try {
    const mood = decodeURIComponent(req.params.mood);
    const scenarios = MOOD_SCENARIOS[mood] || [];
    const groupActivities = GROUP_ACTIVITIES[mood] || [];

    // For each scenario, find companions available NOW who do that activity
    const scenariosWithCompanions = scenarios.map((scenario) => {
      const companions = db.prepare(`
        SELECT c.*, u.name, u.email, cls.is_available_now, cls.current_city
        FROM companions c
        JOIN users u ON u.id = c.user_id
        LEFT JOIN companion_live_status cls ON cls.companion_id = c.id
        WHERE cls.is_available_now = 1
      `).all().filter((companion) => {
        try {
          const acts = JSON.parse(companion.activities || '[]');
          return acts.includes(scenario.activity);
        } catch { return false; }
      }).slice(0, 3);

      return { ...scenario, availableCompanions: companions };
    });

    res.json({ scenarios: scenariosWithCompanions, groupActivities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /companions-for-activity — all companions (available now first) for a chosen activity
router.get('/companions-for-activity', optionalAuth, (req, res) => {
  try {
    const { activity } = req.query;
    if (!activity) return res.status(400).json({ error: 'activity required' });

    const all = db.prepare(`
      SELECT c.*, u.name, u.email,
        COALESCE(cls.is_available_now, 0) as is_available_now,
        cls.current_city as live_city
      FROM companions c
      JOIN users u ON u.id = c.user_id
      LEFT JOIN companion_live_status cls ON cls.companion_id = c.id
      ORDER BY cls.is_available_now DESC, c.avg_rating DESC
    `).all().filter((companion) => {
      try {
        const acts = JSON.parse(companion.activities || '[]');
        return acts.includes(activity);
      } catch { return false; }
    });

    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / — save mood log
router.post('/', optionalAuth, (req, res) => {
  try {
    const { selected_mood, recommended_activity } = req.body;
    if (!selected_mood) {
      return res.status(400).json({ error: 'selected_mood is required.' });
    }

    const recommendations = MOOD_MAP[selected_mood] || [];

    if (req.user) {
      db.prepare(
        'INSERT INTO mood_logs (user_id, selected_mood, recommended_activity) VALUES (?, ?, ?)'
      ).run(req.user.userId, selected_mood, recommended_activity || (recommendations[0] || ''));
    }

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

    if (!latestMood) return res.json([]);

    const recommendations = MOOD_MAP[latestMood.selected_mood] || [];
    if (recommendations.length === 0) return res.json([]);

    const allCompanions = db.prepare(`
      SELECT c.*, u.name, u.email
      FROM companions c
      JOIN users u ON u.id = c.user_id
    `).all();

    const matched = allCompanions.filter((companion) => {
      try {
        const activities = JSON.parse(companion.activities || '[]');
        return activities.some((a) => recommendations.includes(a));
      } catch { return false; }
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
