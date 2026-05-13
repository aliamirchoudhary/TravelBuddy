function registerMessageSocket(io) {
  io.on('connection', (socket) => {
    socket.on('join_conversation', (convId) => {
      if (!convId) return;

      socket.join(String(convId));
      socket.join(`conversation:${convId}`);
    });

    socket.on('leave_conversation', (convId) => {
      if (!convId) return;

      socket.leave(String(convId));
      socket.leave(`conversation:${convId}`);
    });

    socket.on('typing', ({ convId, userId, isTyping }) => {
      if (!convId) return;

      socket.to(`conversation:${convId}`).emit('typing', {
        convId,
        userId,
        isTyping: Boolean(isTyping),
      });
    });
  });
}

module.exports = registerMessageSocket;
