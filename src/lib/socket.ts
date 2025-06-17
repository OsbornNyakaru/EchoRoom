import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const socket: typeof Socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

export default socket;

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

socket.on('connect_error', (err: Error) => {
  console.error('Socket connection error:', err.message);
});