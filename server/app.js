const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const http = require('http');

const { initSocket } = require('./socket');

require('./jobs/rankingJob');
require('./jobs/tokenCleanupJob');

const app = express();
const server = http.createServer(app);

// Important: pass app into initSocket so controllers can use req.app.get('io')
const io = initSocket(server, app);

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.use(helmet());
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Feature routes
const reviewRoutes = require('./routes/reviews');
const creatorRoutes = require('./routes/creators');
const contentRoutes = require('./routes/content');
const socialRoutes = require('./routes/social');
const messageRoutes = require('./routes/messages');
const offlineRoutes = require('./routes/offline');
const statsRoutes = require('./routes/stats');
const exploreRoutes = require('./routes/explore');

app.use('/api/reviews', reviewRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', offlineRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/explore', exploreRoutes);

// Existing routes
const buddyRoutes = require('./routes/buddy');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const destinationRoutes = require('./routes/destinations');
const tripRoutes = require('./routes/trips');
const itineraryRoutes = require('./routes/itinerary');
const emergencyRoutes = require('./routes/emergency');
const utilitiesRoutes = require('./routes/utilities');
const sharedRouter = require('./routes/shared');
const usersRoutes = require('./routes/users');
const gamificationRoutes = require('./routes/gamification');

app.use('/api/buddy', buddyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/utilities', utilitiesRoutes);
app.use('/api/shared', sharedRouter);
app.use('/api/users', usersRoutes);
app.use('/api/gamification', gamificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max limit is 5MB.' });
    }

    return res.status(400).json({ error: err.message });
  }

  next(err);
});

app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 TravelBuddy API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Auth:   http://localhost:${PORT}/api/auth/*\n`);
});
