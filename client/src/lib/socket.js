import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let socket = null;

/** Lazily creates a single shared Socket.io connection for the app. */
export function getSocket() {
  if (!socket) {
    socket = io(API_URL, { autoConnect: true, reconnection: true });
  }
  return socket;
}
