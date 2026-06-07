/**
 * SocketContext.jsx
 * ─────────────────────────────────────────────────────────────
 * SocketProvider context establishing real-time WebSockets connection.
 */

import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import useAuth from "../hooks/useAuth";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const socket = io(import.meta.env.VITE_API_URL || "https://teamtrack-6xvb.onrender.com");

    // Initialize socket connection
    const newSocket = io(socketUrl, {
      auth: {
        token: localStorage.getItem("token")
      },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    newSocket.on("connect", () => {
      setConnected(true);
      console.log("WebSocket connected successfully:", newSocket.id);
      // Join user specific room
      newSocket.emit("user:join", user._id);
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
      console.log("WebSocket disconnected.");
    });

    setSocket(newSocket);

    // Cleanup on unmount or user change
    return () => {
      newSocket.disconnect();
      setConnected(false);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};