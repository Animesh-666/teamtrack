import jwt from "jsonwebtoken";
import User from "../models/User.js";

// @desc    Middleware to protect routes and securely populate session context
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      // Decode the signed token payload safely
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 🚀 BULLETPROOF FIX: Check every possible property format signed inside the token!
      const lookupId = decoded.id || decoded._id || (decoded.user && (decoded.user.id || decoded.user._id));

      if (!lookupId) {
        console.error("Token verified successfully but no identifiable user ID property was found in payload:", decoded);
        return res.status(401).json({ message: "Not authorized, invalid token payload payload format" });
      }
      
      // Pull full profile safely from MongoDB collections
      req.user = await User.findById(lookupId).select("-password");
      
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user profile no longer exists in database" });
      }

      return next();
    } catch (error) {
      console.error("Token verification crashed downstream:", error);
      return res.status(401).json({ message: "Not authorized, token validation failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// @desc    Middleware to authorize Admin and Team Leader management nodes
export const admin = (req, res, next) => {
  if (req.user && req.user.role) {
    // Standardize role string definitions
    const roleUpper = req.user.role.trim().toUpperCase();
    
    // Clean case-insensitive validation match
    if (roleUpper === 'ADMIN' || roleUpper === 'TEAM LEADER') {
      return next();
    }
  }
  
  return res.status(403).json({ message: "Not authorized as an admin or team leader" });
};