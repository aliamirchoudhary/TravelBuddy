const registerMessageSocket = require('./realtime/messagesSocket');

let io;

function initSocket(server, app) {
  const { Server } = require('socket.io');

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  if (app) {
    app.set('io', io);
  }

  registerMessageSocket(io);

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('register', (userId) => {
      if (!userId) return;

      socket.join(`user:${userId}`);
      console.log(`   → User ${userId} joined room user:${userId}`);
    });

    socket.on('join_trip', (tripId) => {
      if (!tripId) return;

      socket.join(`trip:${tripId}`);
      console.log(`   → Socket ${socket.id} joined room trip:${tripId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket first.');
  }

  return io;
}

module.exports = { initSocket, getIO };
