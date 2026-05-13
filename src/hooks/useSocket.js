import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

/**
 * Hook to connect to the Socket.io server and listen for
 * real-time buddy matching events.
 *
 * Events handled:
 * - buddy_request  → notification toast
 * - buddy_accepted → success toast
 * - buddy_declined → info toast
 *
 * @returns {object|null} socket instance
 */
export default function useSocket() {
  const socketRef = useRef(null);
  const userId = useAuthStore(s => s.user?.id);

  useEffect(() => {
    if (!userId) return;

    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

    socketRef.current = io(serverUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    // Register this user in their personal room
    socketRef.current.emit('register', userId);

    // Listen for buddy events
    socketRef.current.on('buddy_request', (data) => {
      toast('🤝 New buddy request received!', {
        icon: '📬',
        duration: 5000,
      });
    });

    socketRef.current.on('buddy_accepted', (data) => {
      toast.success('🎉 Your buddy request was accepted!', {
        duration: 5000,
      });
    });

    socketRef.current.on('buddy_declined', (data) => {
      toast('Your buddy request was declined', {
        icon: '😔',
        duration: 4000,
      });
    });

    socketRef.current.on('badge_earned', (data) => {
      // Lazy load to prevent circular dependencies if any
      import('../store/badgeStore').then((module) => {
        module.default.getState().showBadge(data);
      });
      // Also play a sound here if desired
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  return socketRef.current;
}
