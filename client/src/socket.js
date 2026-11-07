import { io } from "socket.io-client";

// Khi deploy cùng backend trên 1 domain hoặc dùng Vite proxy trong dev, origin là rỗng / window.location.origin
// Hoặc có thể override bằng biến môi trường VITE_SERVER_URL nếu frontend và backend deploy ở 2 host khác nhau.
const SERVER_URL = import.meta.env.VITE_SERVER_URL || window.location.origin;

export const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

