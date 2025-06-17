import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const socket: typeof Socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
});

export default socket;

socket.on('connect', () => {
  console.log('[Socket] Connected to WebSocket server with ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] Disconnected from WebSocket server. Reason:', reason);
});

socket.on('connect_error', (err: Error) => {
  console.error('[Socket] Connection error:', err.message);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (err: Error) => {
  console.error('[Socket] Reconnection error:', err.message);
});