import { useEffect, useState } from 'react';
import socket from '../lib/socket'; // Import the shared socket instance
import type { Socket } from 'socket.io-client'; // Import Socket type for clarity

const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) return; // Ensure socket is available

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      // Clean up listeners when component unmounts
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []); // No dependencies that would cause re-creation of socket listeners

  return { socket, isConnected };
};

export default useSocket; 