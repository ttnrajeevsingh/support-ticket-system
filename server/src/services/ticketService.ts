import * as ticketRepository from '../repositories/ticketRepository';
import * as userRepository from '../repositories/userRepository';
import { assertTransition } from './stateMachine';
import { NotFoundError } from '../errors/NotFoundError';
import { Ticket, CreateTicketInput, UpdateTicketInput, Status, TicketFilters } from '../types/ticket';

export async function listTickets(filters: TicketFilters): Promise<Ticket[]> {
  return ticketRepository.findAll(filters);
}

export async function getTicket(id: string): Promise<Ticket> {
  return ticketRepository.findById(id);
}

export async function createTicket(data: CreateTicketInput): Promise<Ticket> {
  // Ensure the creator exists
  const creator = await userRepository.findById(data.createdBy);
  if (!creator) throw new NotFoundError('User');

  // Ensure the assignee exists if provided
  if (data.assignedTo) {
    const assignee = await userRepository.findById(data.assignedTo);
    if (!assignee) throw new NotFoundError('User');
  }

  return ticketRepository.create(data);
}

export async function updateTicket(id: string, data: UpdateTicketInput): Promise<Ticket> {
  return ticketRepository.update(id, data);
}

export async function changeStatus(
  id: string,
  newStatus: Status,
  userId: string,
): Promise<Ticket> {
  // Verify actor exists
  const user = await userRepository.findById(userId);
  if (!user) throw new NotFoundError('User');

  // Fetch current ticket to get current status
  const ticket = await ticketRepository.findById(id);

  // Enforce state machine — throws InvalidTransitionError if invalid
  assertTransition(ticket.status, newStatus);

  return ticketRepository.updateStatus(id, newStatus);
}
