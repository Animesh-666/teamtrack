/**
 * Auth Validators
 * Express middleware functions that validate request body
 * before hitting the controller logic.
 */

export const validateRegister = (req, res, next) => {
  const errors = [];
  const { name, email, password, role } = req.body;

  // Name
  if (!name || name.trim().length === 0) {
    errors.push("Name is required");
  } else if (name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  } else if (name.trim().length > 50) {
    errors.push("Name cannot exceed 50 characters");
  }

  // Email
  if (!email || email.trim().length === 0) {
    errors.push("Email is required");
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
    errors.push("Please enter a valid email address");
  }

  // Password
  if (!password) {
    errors.push("Password is required");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  } else if (password.length > 128) {
    errors.push("Password cannot exceed 128 characters");
  }

  // Role (optional, but must be valid if provided)
  if (role && !["ADMIN", "MEMBER", "admin", "member"].includes(role)) {
    errors.push("Role must be either ADMIN or MEMBER");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(". ") });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const errors = [];
  const { email, password } = req.body;

  if (!email || email.trim().length === 0) {
    errors.push("Email is required");
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
    errors.push("Please enter a valid email address");
  }

  if (!password) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(". ") });
  }

  next();
};

export const validateUpdateProfile = (req, res, next) => {
  const errors = [];
  const { name, email } = req.body;

  if (name !== undefined) {
    if (name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    } else if (name.trim().length > 50) {
      errors.push("Name cannot exceed 50 characters");
    }
  }

  if (email !== undefined) {
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.push("Please enter a valid email address");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(". ") });
  }

  next();
};

export const validateChangePassword = (req, res, next) => {
  const errors = [];
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword) {
    errors.push("Current password is required");
  }

  if (!newPassword) {
    errors.push("New password is required");
  } else if (newPassword.length < 6) {
    errors.push("New password must be at least 6 characters");
  } else if (newPassword.length > 128) {
    errors.push("New password cannot exceed 128 characters");
  }

  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push("New password must be different from current password");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(". ") });
  }

  next();
};
