import { Router } from 'express';
import { createDeal, getDealById, getDeals, updateDeal } from '../controllers/dealController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createDealValidator, updateDealValidator } from '../validators/dealValidators.js';

export const dealRoutes = Router();

dealRoutes.use(requireAuth);
dealRoutes.get('/', getDeals);
dealRoutes.get('/:id', getDealById);
dealRoutes.post('/', createDealValidator, validate, createDeal);
dealRoutes.patch('/:id', updateDealValidator, validate, updateDeal);
