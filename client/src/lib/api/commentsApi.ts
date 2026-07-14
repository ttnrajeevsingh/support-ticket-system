import { fetchApi } from './fetchClient';
import { Comment } from '@/types/ticket';

export async function getComments(ticketId: string): Promise<Comment[]> {
  return fetchApi<Comment[]>(`/tickets/${ticketId}/comments`);
}

export async function addComment(
  ticketId: string,
  message: string,
  createdBy: string,
): Promise<Comment> {
  return fetchApi<Comment>(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ message, createdBy }),
  });
}
