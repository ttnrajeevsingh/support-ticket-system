import { body, query } from 'express-validator';

const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
const VALID_STATUSES   = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'] as const;

export const validateCreateTicket = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('priority')
    .notEmpty().withMessage('Priority is required')
    .isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),
  body('createdBy')
    .notEmpty().withMessage('createdBy is required')
    .isUUID().withMessage('createdBy must be a valid UUID'),
  body('assignedTo')
    .optional({ nullable: true })
    .isUUID().withMessage('assignedTo must be a valid UUID'),
];

export const validateUpdateTicket = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),
  body('assignedTo')
    .optional({ nullable: true })
    .isUUID().withMessage('assignedTo must be a valid UUID'),
];

export const validateStatusChange = [
  body('status')
    .notEmpty().withMessage('status is required')
    .isIn(VALID_STATUSES).withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('userId')
    .notEmpty().withMessage('userId is required')
    .isUUID().withMessage('userId must be a valid UUID'),
];

export const validateTicketQuery = [
  query('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}`),
  query('priority')
    .optional()
    .isIn(VALID_PRIORITIES).withMessage(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`),
  query('assignedTo')
    .optional()
    .isUUID().withMessage('assignedTo must be a valid UUID'),
];
