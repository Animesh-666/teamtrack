import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; 
import { isSuperAdmin } from '../middleware/authMiddleware.js'; // The bouncer we created earlier!
import { getAllUsers, updateUserRole } from '../controllers/userController.js';

const router = express.Router();

// Apply BOTH the standard login check (protect) AND the Super Admin check
router.get('/', protect, isSuperAdmin, getAllUsers);
router.put('/:id/role', protect, isSuperAdmin, updateUserRole);

export default router;