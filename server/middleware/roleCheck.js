// @desc    Role-based access control middleware
//          Pass one or more allowed roles, e.g. roleCheck("ADMIN") or roleCheck("ADMIN", "MEMBER")
//          Must be used AFTER the auth middleware (req.user must exist)

const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Not authorized. Please login first." });
    }

    // Normalize to uppercase for comparison
    const userRole = req.user.role?.toUpperCase();

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. This action requires one of the following roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

export default roleCheck;
