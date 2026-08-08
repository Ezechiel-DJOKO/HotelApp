import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  const SOCKET_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://localhost:5000";

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("🔌 Socket.IO connecté");
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket.IO déconnecté:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket.IO erreur:", error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket.IO déconnecté manuellement");
  }
};

export const getSocket = (): Socket | null => socket;