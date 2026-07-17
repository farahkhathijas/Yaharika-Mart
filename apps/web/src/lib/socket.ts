import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = () => {
  if (socket) return socket;

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
  socket = io(socketUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket || initSocket();

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
