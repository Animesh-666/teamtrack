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
    // If no user is logged in, clean up the socket connection
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // 🚀 FIXED: Renamed to SOCKET_URL so it doesn't clash with the state variable!
    const SOCKET_URL = import.meta.env.VITE_API_URL || "https://teamtrack-6xvb.onrender.com";

    // 🚀 FIXED: Passed SOCKET_URL instead of the undefined 'socketUrl'
    const newSocket = io(SOCKET_URL, {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); 

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};