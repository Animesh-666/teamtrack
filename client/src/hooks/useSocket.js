/**
 * useSocket.js
 * ─────────────────────────────────────────────────────────────
 * Custom React hook wrapping the SocketContext to easily access
 * the WebSocket client instance and connection status.
 */

import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default useSocket;