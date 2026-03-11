import { Router } from 'express';
import { getUserProfile, getUsers } from '../controllers/userController.js';
import { requireAuth } from '../middlewares/auth.js';

export const userRoutes = Router();

userRoutes.use(requireAuth);
userRoutes.get('/', getUsers);
userRoutes.get('/:id', getUserProfile);
