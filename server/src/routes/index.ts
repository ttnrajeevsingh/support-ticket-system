import { Router } from 'express';
import userRoutes from './userRoutes';
import ticketRoutes from './ticketRoutes';

export const router = Router();

router.use('/users', userRoutes);
router.use('/tickets', ticketRoutes);
