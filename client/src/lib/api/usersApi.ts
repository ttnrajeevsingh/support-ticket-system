import { fetchApi } from './fetchClient';
import { User } from '@/types/ticket';

export async function getUsers(): Promise<User[]> {
  return fetchApi<User[]>('/users');
}
