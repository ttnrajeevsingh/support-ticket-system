import { Router } from 'express';
import userRoutes from './userRoutes';
import ticketRoutes from './ticketRoutes';

export const router = Router();

router.get('/ping', (_req, res) => res.json({ message: 'API v1 ready' }));

router.use('/users',   userRoutes);
router.use('/tickets', ticketRoutes);
