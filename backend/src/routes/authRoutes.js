import { Router } from 'express';
import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  refresh,
  register,
  resetPassword,
} from '../controllers/authController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
} from '../validators/authValidators.js';

export const authRoutes = Router();

authRoutes.post('/register', registerValidator, validate, register);
authRoutes.post('/login', loginValidator, validate, login);
authRoutes.post('/refresh', refresh);
authRoutes.post('/logout', logout);
authRoutes.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
authRoutes.post('/reset-password/:token', resetPasswordValidator, validate, resetPassword);
authRoutes.get('/me', requireAuth, getCurrentUser);
