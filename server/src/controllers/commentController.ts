import { Request, Response, NextFunction } from 'express';
import * as commentRepository from '../repositories/commentRepository';

export async function getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const comments = await commentRepository.findByTicketId(req.params['id'] as string);
    res.json(comments);
  } catch (err) { next(err); }
}

export async function addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const comment = await commentRepository.create({
      ticketId: req.params['id'] as string,
      message: req.body.message,
      createdBy: req.body.createdBy,
    });
    res.status(201).json(comment);
  } catch (err) { next(err); }
}
