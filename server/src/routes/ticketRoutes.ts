import { Router } from 'express';
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  changeTicketStatus,
} from '../controllers/ticketController';
import {
  validateCreateTicket,
  validateUpdateTicket,
  validateStatusChange,
  validateTicketQuery,
} from '../middleware/ticketValidation';
import { validate } from '../middleware/validate';
import commentRoutes from './commentRoutes';

const router = Router();

router.get(  '/',              validateTicketQuery,   validate, listTickets);
router.post( '/',              validateCreateTicket,  validate, createTicket);
router.get(  '/:id',                                           getTicket);
router.patch('/:id',           validateUpdateTicket,  validate, updateTicket);
router.patch('/:id/status',    validateStatusChange,  validate, changeTicketStatus);

// Nested: /api/v1/tickets/:id/comments
router.use('/:id/comments', commentRoutes);

export default router;
