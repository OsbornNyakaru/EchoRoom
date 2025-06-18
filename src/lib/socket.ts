import { io, Socket } from 'socket.io-client';

const VITE_BACKEND_URL = import.meta.env.VITE_VITE_BACKEND_URL || '${VITE_BACKEND_URL}/';

const socket = io(VITE_BACKEND_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
}) as Socket;

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