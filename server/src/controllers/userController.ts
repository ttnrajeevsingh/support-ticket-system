import { Request, Response, NextFunction } from 'express';
import * as userRepository from '../repositories/userRepository';

/**
 * GET /api/v1/users
 * Returns all seeded users for the assignee dropdown.
 */
export async function getUsers(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await userRepository.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
}
