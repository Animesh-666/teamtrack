import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc     Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Please fill in all required fields" });
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    
    const user = await User.create({ name, email: email.toLowerCase(), password, role: role || "MEMBER" });
    const token = generateToken(user._id);

    return res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc     Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = generateToken(user._id);
    return res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc     Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc     Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    // 🚀 FIXED: Wrapped in 'data' object for frontend compatibility
    return res.json({
      data: users,
      users: users,
      members: users
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc     Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ productivityScore: -1, completedTasks: -1 })
      .lean();

    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    // 🚀 FIXED: Wrapped in 'data' object so frontend finds the leaderboard array
    return res.json({
      data: leaderboard,
      leaderboard: leaderboard
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc     Update user profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email.toLowerCase();
    if (req.body.avatar) user.avatar = req.body.avatar;
    
    await user.save();
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc     Change user password
export const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !(await bcrypt.compare(req.body.currentPassword, user.password))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    user.password = req.body.newPassword;
    await user.save();
    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};