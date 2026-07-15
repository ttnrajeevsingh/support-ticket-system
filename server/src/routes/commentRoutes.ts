import { Router } from 'express';
import { getComments, addComment } from '../controllers/commentController';
import { validateCreateComment } from '../middleware/commentValidation';
import { validate } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimiter';

// Mounted at /api/v1/tickets/:id/comments
const router = Router({ mergeParams: true });

router.get('/', getComments);
router.post('/', writeLimiter, validateCreateComment, validate, addComment);

export default router;
