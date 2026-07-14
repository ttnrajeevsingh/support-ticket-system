import { body } from 'express-validator';

export const validateCreateComment = [
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 1 }).withMessage('Message must not be empty'),
  body('createdBy')
    .notEmpty().withMessage('createdBy is required')
    .isUUID().withMessage('createdBy must be a valid UUID'),
];
