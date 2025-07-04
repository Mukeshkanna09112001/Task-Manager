import express from 'express';
import { getUsers } from '../controllers/userController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getUsers);

export default router;