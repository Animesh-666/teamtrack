import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin
export const getAllUsers = async (req, res) => {
  try {
    // We use .select('-password') so we don't accidentally send passwords to the frontend!
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/SuperAdmin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure they only pass valid roles
    if (!['MEMBER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    user.role = role;
    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user role" });
  }
};