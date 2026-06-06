const { Database: SQLiteDB } = require('node-sqlite3-wasm');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'adaytoremember.db');
const _db = new SQLiteDB(DB_PATH);

// Shim to make node-sqlite3-wasm look like better-sqlite3
// better-sqlite3: stmt.run(...args), stmt.get(...args), stmt.all(...args)
// node-sqlite3-wasm: stmt.run([...args]), stmt.get([...args]), stmt.all([...args])
function wrapStmt(stmt) {
  return {
    run: (...args) => stmt.run(args.length === 1 && Array.isArray(args[0]) ? args[0] : args),
    get: (...args) => stmt.get(args.length === 1 && Array.isArray(args[0]) ? args[0] : args),
    all: (...args) => stmt.all(args.length === 1 && Array.isArray(args[0]) ? args[0] : args),
  };
}

const db = {
  prepare: (sql) => wrapStmt(_db.prepare(sql)),
  exec: (sql) => _db.exec(sql),
  pragma: (sql) => _db.run(`PRAGMA ${sql}`),
};

// Enable foreign keys
_db.run('PRAGMA foreign_keys = ON');

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
      bio: 'Hi! I am Sofia, a bubbly and enthusiastic companion who loves exploring the city. Whether you want to discover hidden gems or simply have great conversation over coffee, I am here for you.',
      hourly_rate: 35,
      activities: JSON.stringify(['Shopping', 'Dining & Cafes', 'Outdoor & City Tours']),
      city: 'New York',
      photo_url: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      name: 'James Chen',
      email: 'james@example.com',
      bio: 'Movie buff and adventure seeker! I know all the best theaters and outdoor spots in town. Let me make your day truly memorable with fun-filled activities tailored just for you.',
      hourly_rate: 30,
      activities: JSON.stringify(['Movies & Entertainment', 'Outdoor & City Tours', 'Shopping']),
      city: 'Los Angeles',
      photo_url: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      name: 'Aisha Thompson',
      email: 'aisha@example.com',
      bio: 'Warm, empathetic, and always present. I specialize in emotional support and meaningful conversations. Whether you are going through a tough time or just need someone to talk to, I am here.',
      hourly_rate: 40,
      activities: JSON.stringify(['Emotional Support', 'Dining & Cafes', 'Shopping']),
      city: 'Chicago',
      photo_url: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    {
      name: 'Marco Bianchi',
      email: 'marco@example.com',
      bio: 'Food enthusiast and certified city guide. I will take you to the best local restaurants and hidden neighborhood spots. Every meal and stroll becomes an unforgettable experience with me.',
      hourly_rate: 45,
      activities: JSON.stringify(['Dining & Cafes', 'Outdoor & City Tours', 'Movies & Entertainment']),
      city: 'San Francisco',
      photo_url: 'https://randomuser.me/api/portraits/men/75.jpg',
    },
    {
      name: 'Lily Park',
      email: 'lily@example.com',
      bio: 'Fashion-forward and always up-to-date with the latest trends! Shopping with me is an experience in itself. I will help you find the perfect outfits and make it a fun, stress-free day.',
      hourly_rate: 28,
      activities: JSON.stringify(['Shopping', 'Movies & Entertainment', 'Dining & Cafes']),
      city: 'New York',
      photo_url: 'https://randomuser.me/api/portraits/women/90.jpg',
    },
  ];

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
  );
  const insertCompanion = db.prepare(
    'INSERT INTO companions (user_id, bio, hourly_rate, activities, city, photo_url, avg_rating, review_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const ratings = [4.8, 4.6, 4.9, 4.7, 4.5];
  const reviewCounts = [24, 17, 31, 22, 14];

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

module.exports = db;
