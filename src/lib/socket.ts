import { io, Socket } from 'socket.io-client';

// For now, we'll create a mock socket that doesn't actually connect
// This prevents connection errors while maintaining the interface
class MockSocket {
  public id: string = 'mock-socket-id';
  private listeners: { [event: string]: Function[] } = {};
  private connected: boolean = false;

  constructor() {
    // Simulate connection after a short delay
    setTimeout(() => {
      this.connected = true;
      this.emit('connect');
    }, 1000);
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(...args));
    }
  }

  disconnect() {
    this.connected = false;
    this.emit('disconnect', 'client disconnect');
  }

  connect() {
    if (!this.connected) {
      this.connected = true;
      this.emit('connect');
    }
  }
}

// Create mock socket instance
const socket = new MockSocket() as any;

export default socket;

// Log mock connection status
console.log('[Socket] Using mock socket - no backend connection required');