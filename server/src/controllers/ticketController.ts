import { Request, Response, NextFunction } from 'express';
import * as ticketService from '../services/ticketService';
import { TicketFilters, Status } from '../types/ticket';

export async function listTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters: TicketFilters = {
      search:     req.query.search     as string | undefined,
      status:     req.query.status     as Status | undefined,
      priority:   req.query.priority   as any,
      assignedTo: req.query.assignedTo as string | undefined,
    };
    const tickets = await ticketService.listTickets(filters);
    res.json(tickets);
  } catch (err) { next(err); }
}

export async function getTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ticket = await ticketService.getTicket(req.params['id'] as string);
    res.json(ticket);
  } catch (err) { next(err); }
}

export async function createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ticket = await ticketService.createTicket(req.body);
    res.status(201).json(ticket);
  } catch (err) { next(err); }
}

export async function updateTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ticket = await ticketService.updateTicket(req.params['id'] as string, req.body);
    res.json(ticket);
  } catch (err) { next(err); }
}

export async function changeTicketStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ticket = await ticketService.changeStatus(
      req.params['id'] as string,
      req.body.status as Status,
      req.body.userId as string,
    );
    res.json(ticket);
  } catch (err) { next(err); }
}
