import { Router } from 'express';
import { getComments, addComment } from '../controllers/commentController';
import { validateCreateComment } from '../middleware/commentValidation';
import { validate } from '../middleware/validate';

// Mounted at /api/v1/tickets/:id/comments
const router = Router({ mergeParams: true });

router.get('/', getComments);
router.post('/', validateCreateComment, validate, addComment);

export default router;
