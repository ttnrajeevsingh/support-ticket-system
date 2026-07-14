import prisma from '../lib/prisma';
import { User } from '../types/ticket';

/**
 * Returns all users ordered alphabetically by name.
 * Used to populate the assignee dropdown in the UI.
 */
export async function findAll(): Promise<User[]> {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as User['role'],
    createdAt: u.createdAt.toISOString(),
  }));
}

/**
 * Finds a user by ID. Returns null if not found.
 */
export async function findById(id: string): Promise<User | null> {
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as User['role'],
    createdAt: u.createdAt.toISOString(),
  };
}
