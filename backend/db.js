const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'adaytoremember.db');
const db = new Database(DB_PATH);

db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('client', 'companion')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS companions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    bio TEXT DEFAULT '',
    hourly_rate REAL DEFAULT 0,
    activities TEXT DEFAULT '[]',
    city TEXT DEFAULT '',
    photo_url TEXT DEFAULT '',
    avg_rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    companion_id INTEGER NOT NULL,
    activity TEXT NOT NULL,
    date TEXT NOT NULL,
    hours INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','completed','cancelled')),
    total_price REAL NOT NULL,
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (companion_id) REFERENCES companions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER UNIQUE NOT NULL,
    reviewer_id INTEGER NOT NULL,
    companion_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (companion_id) REFERENCES companions(id) ON DELETE CASCADE
  );
`);

// Seed companion data if not already present
const existingCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
if (existingCount.cnt === 0) {
  const password = bcrypt.hashSync('password123', 10);

  const companions = [
    {
      name: 'Sofia Ramirez',
      email: 'sofia@example.com',
      bio: 'Hi! I am Sofia, a bubbly and enthusiastic companion who loves exploring the city. Whether it\'s shopping, a picnic in the park, or thrift hunting for hidden gems, I make every outing an adventure.',
      hourly_rate: 35,
      activities: JSON.stringify(['Shopping', 'Dining & Cafes', 'Picnic', 'Thrift Shopping', 'Outdoor & City Tours', 'Photography Walk']),
      city: 'New York',
      photo_url: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      name: 'James Chen',
      email: 'james@example.com',
      bio: 'Movie buff, gamer and adventure seeker! I\'m your go-to companion for arcade battles, escape rooms, binge-watching sessions, and outdoor hikes. Let\'s make your day unforgettable.',
      hourly_rate: 30,
      activities: JSON.stringify(['Movies & Entertainment', 'Arcade Gaming', 'Binge Watching', 'Escape Rooms', 'Hiking & Nature Walks', 'Board Games & Puzzles']),
      city: 'Los Angeles',
      photo_url: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      name: 'Aisha Thompson',
      email: 'aisha@example.com',
      bio: 'Warm, empathetic and always present. I specialize in emotional support, comfort and meaningful connection. I\'m also great for yoga, spa days, morning walks and cozy binge-watching sessions.',
      hourly_rate: 40,
      activities: JSON.stringify(['Emotional Support', 'Cuddling & Comfort', 'Yoga & Meditation', 'Spa Day', 'Morning Walk', 'Binge Watching']),
      city: 'Chicago',
      photo_url: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    {
      name: 'Marco Bianchi',
      email: 'marco@example.com',
      bio: 'Food enthusiast and certified city guide. From hidden restaurant gems to cooking together at home, food tours to brunch dates — every meal becomes a memory. I also love live music and dancing!',
      hourly_rate: 45,
      activities: JSON.stringify(['Dining & Cafes', 'Food Tour', 'Cooking Together', 'Brunch Date', 'Dessert & Cafe Hopping', 'Concerts & Live Music', 'Dancing']),
      city: 'San Francisco',
      photo_url: 'https://randomuser.me/api/portraits/men/75.jpg',
    },
    {
      name: 'Lily Park',
      email: 'lily@example.com',
      bio: 'Fashion-forward, creative and fun! I\'m your perfect companion for shopping, karaoke nights, painting sessions, and stargazing. Whether it\'s a night out or a cozy DIY project, I\'m all in!',
      hourly_rate: 28,
      activities: JSON.stringify(['Shopping', 'Karaoke', 'Painting & Art', 'Stargazing', 'Dancing', 'Bar & Nightlife', 'DIY Projects']),
      city: 'New York',
      photo_url: 'https://randomuser.me/api/portraits/women/90.jpg',
    },
    {
      name: 'Ryan Patel',
      email: 'ryan@example.com',
      bio: 'Fitness coach and outdoor enthusiast! I\'ll keep you motivated at the gym, join you for cycling, beach days or camping trips. Sports watching and volunteering are my way of staying connected to the community.',
      hourly_rate: 38,
      activities: JSON.stringify(['Gym & Workout', 'Cycling', 'Beach Day', 'Camping', 'Sports Watching', 'Hiking & Nature Walks', 'Volunteering Together']),
      city: 'Miami',
      photo_url: 'https://randomuser.me/api/portraits/men/52.jpg',
    },
    {
      name: 'Zoe Williams',
      email: 'zoe@example.com',
      bio: 'Book lover, museum nerd and creative soul. I\'m great for quiet activities like reading together, visiting galleries, grocery shopping, or a peaceful morning walk. Always patient, never rushed.',
      hourly_rate: 32,
      activities: JSON.stringify(['Book Club & Reading', 'Museum & Art Gallery', 'Grocery Shopping', 'Morning Walk', 'Gardening', 'Photography Walk', 'Painting & Art']),
      city: 'Seattle',
      photo_url: 'https://randomuser.me/api/portraits/women/22.jpg',
    },
  ];

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
  );
  const insertCompanion = db.prepare(
    'INSERT INTO companions (user_id, bio, hourly_rate, activities, city, photo_url, avg_rating, review_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const ratings = [4.8, 4.6, 4.9, 4.7, 4.5, 4.8, 4.7];
  const reviewCounts = [24, 17, 31, 22, 14, 19, 11];

  companions.forEach((c, idx) => {
    const result = insertUser.run(c.name, c.email, password, 'companion');
    insertCompanion.run(
      result.lastInsertRowid,
      c.bio,
      c.hourly_rate,
      c.activities,
      c.city,
      c.photo_url,
      ratings[idx],
      reviewCounts[idx]
    );
  });

  // Seed sample reviews
  const sampleReviews = [
    { companionIdx: 1, rating: 5, comment: 'Sofia was absolutely wonderful! She made our shopping trip so fun and found amazing deals.' },
    { companionIdx: 1, rating: 5, comment: 'Such a warm and genuine person. Will definitely book again!' },
    { companionIdx: 2, rating: 4, comment: 'James picked a great movie and we had amazing conversations after. Highly recommend.' },
    { companionIdx: 3, rating: 5, comment: 'Aisha is incredibly compassionate. She truly listened and made me feel so much better.' },
    { companionIdx: 4, rating: 5, comment: 'Marco took us to the most incredible hidden restaurant. A truly unforgettable experience.' },
    { companionIdx: 5, rating: 4, comment: 'Lily has incredible fashion sense and made shopping a complete blast!' },
  ];

  // Create a dummy client for seeded reviews
  const clientResult = insertUser.run('Demo Client', 'demo@example.com', password, 'client');
  const clientId = clientResult.lastInsertRowid;

  const insertBooking = db.prepare(
    'INSERT INTO bookings (client_id, companion_id, activity, date, hours, status, total_price, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertReview = db.prepare(
    'INSERT INTO reviews (booking_id, reviewer_id, companion_id, rating, comment) VALUES (?, ?, ?, ?, ?)'
  );

  const companionRows = db.prepare('SELECT id FROM companions ORDER BY id').all();

  sampleReviews.forEach((r) => {
    const companion = companionRows[r.companionIdx - 1];
    if (!companion) return;
    const companionUser = db.prepare('SELECT u.*, c.hourly_rate FROM users u JOIN companions c ON c.user_id = u.id WHERE c.id = ?').get(companion.id);
    const booking = insertBooking.run(
      clientId,
      companion.id,
      'Shopping',
      '2025-01-15',
      2,
      'completed',
      companionUser.hourly_rate * 2,
      ''
    );
    insertReview.run(booking.lastInsertRowid, clientId, companion.id, r.rating, r.comment);
  });

  console.log('Database seeded with 5 companions and sample reviews.');
}

// New feature tables
db.exec(`
  CREATE TABLE IF NOT EXISTS mood_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    selected_mood TEXT NOT NULL,
    recommended_activity TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS happiness_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    companion_id INTEGER NOT NULL,
    before_mood TEXT,
    after_score INTEGER,
    safety_rating INTEGER,
    would_meet_again INTEGER,
    feedback_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS safety_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id INTEGER NOT NULL,
    reported_user_id INTEGER NOT NULL,
    booking_id INTEGER,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS blocked_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blocker_id INTEGER NOT NULL,
    blocked_user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_user_id)
  );

  CREATE TABLE IF NOT EXISTS companion_live_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    companion_id INTEGER UNIQUE NOT NULL,
    is_available_now INTEGER DEFAULT 0,
    current_city TEXT,
    latitude REAL,
    longitude REAL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS booking_safety (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER UNIQUE NOT NULL,
    user_checkin_at DATETIME,
    user_checkout_at DATETIME,
    companion_checkin_at DATETIME,
    companion_checkout_at DATETIME,
    sos_triggered INTEGER DEFAULT 0,
    sos_triggered_at DATETIME
  );
`);

// Seed companion_live_status for existing companions if not present
const liveStatusCount = db.prepare('SELECT COUNT(*) as cnt FROM companion_live_status').get();
if (liveStatusCount.cnt === 0) {
  const allCompanions = db.prepare('SELECT id FROM companions').all();
  const insertLiveStatus = db.prepare(
    'INSERT OR IGNORE INTO companion_live_status (companion_id, is_available_now) VALUES (?, 0)'
  );
  allCompanions.forEach((c) => insertLiveStatus.run(c.id));
}

module.exports = db;
