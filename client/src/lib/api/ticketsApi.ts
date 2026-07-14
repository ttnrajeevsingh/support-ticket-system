import { fetchApi } from './fetchClient';
import { Ticket, CreateTicketInput, UpdateTicketInput, Status } from '@/types/ticket';

export async function getTickets(params?: {
  search?: string;
  status?: Status;
  signal?: AbortSignal;
}): Promise<Ticket[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return fetchApi<Ticket[]>(`/tickets${qs ? `?${qs}` : ''}`, {
    signal: params?.signal,
  });
}

export async function getTicket(id: string): Promise<Ticket> {
  return fetchApi<Ticket>(`/tickets/${id}`);
}

export async function createTicket(data: CreateTicketInput): Promise<Ticket> {
  return fetchApi<Ticket>('/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTicket(id: string, data: UpdateTicketInput): Promise<Ticket> {
  return fetchApi<Ticket>(`/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function changeStatus(
  id: string,
  status: Status,
  userId: string,
): Promise<Ticket> {
  return fetchApi<Ticket>(`/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, userId }),
  });
}
