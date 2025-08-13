import { io } from "socket.io-client";

const SOCKET_URL =process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token');
    socket = io( SOCKET_URL, {
      auth: { token },
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 


//  WebRTC signaling functions
export const setupCallListeners = (socket, callbacks) => {
  socket.on('callUser', callbacks.onIncomingCall);
  socket.on('callAccepted', callbacks.onCallAccepted);
  socket.on('callEnded', callbacks.onCallEnded);
  socket.on('userLeft', callbacks.onUserLeft);
};

export const removeCallListeners = (socket) => {
  socket.off('callUser');
  socket.off('callAccepted');
  socket.off('callEnded');
  socket.off('userLeft');
}; 