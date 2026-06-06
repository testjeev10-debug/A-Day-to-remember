const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Initialize DB (runs seed if needed)
require('./db');

// Routes — available-now MUST be registered before /api/companions to avoid :id capture
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companions/available-now', require('./routes/availableNow'));
app.use('/api/companions', require('./routes/companions'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/social-coach', require('./routes/socialCoach'));
app.use('/api/happiness', require('./routes/happiness'));
app.use('/api/safety', require('./routes/safety'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`A Day to Remember API running on http://localhost:${PORT}`);
});
