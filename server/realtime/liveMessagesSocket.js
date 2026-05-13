const { getPool } = require('../utils/liveDb');
const { saveMessage } = require('../controllers/liveMessageController');

function normalizeId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

module.exports = function attachLiveMessagesSocket(io, app) {
  io.on('connection', (socket) => {
    socket.on('join_conversation', ({ convId }) => {
      const id = normalizeId(convId);
      if (id) socket.join(`conversation:${id}`);
    });

    socket.on('leave_conversation', ({ convId }) => {
      const id = normalizeId(convId);
      if (id) socket.leave(`conversation:${id}`);
    });

    socket.on('send_message', async (payload, ack) => {
      try {
        const convId = normalizeId(payload?.convId);
        const senderId = normalizeId(payload?.senderId || payload?.userId);
        const messageText = payload?.messageText || payload?.text;
        if (!convId || !senderId || !String(messageText || '').trim()) {
          throw new Error('convId, senderId and messageText are required');
        }

        const pool = await getPool({ app });
        const message = await saveMessage(pool, {
          convId,
          senderId,
          messageText,
          mediaUrl: payload?.mediaUrl || null,
          messageType: payload?.messageType || 'text',
        });

        io.to(`conversation:${convId}`).emit('new_message', message);
        if (ack) ack({ ok: true, message });
      } catch (err) {
        console.error('socket send_message error:', err);
        if (ack) ack({ ok: false, message: err.message });
      }
    });
  });
};
