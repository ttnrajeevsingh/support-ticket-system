import prisma from '../lib/prisma';
import { Comment } from '../types/ticket';
import { NotFoundError } from '../errors/NotFoundError';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

function mapComment(c: any): Comment {
  return {
    id: c.id,
    ticketId: c.ticketId,
    message: c.message,
    createdBy: c.createdBy,
    createdAt: c.createdAt.toISOString(),
    author: c.author
      ? { ...c.author, createdAt: c.author.createdAt.toISOString() }
      : undefined,
  };
}

export async function findByTicketId(ticketId: string): Promise<Comment[]> {
  // Verify ticket exists
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new NotFoundError('Ticket');

  const comments = await prisma.comment.findMany({
    where: { ticketId },
    include: { author: { select: userSelect } },
    orderBy: { createdAt: 'asc' },
  });

  return comments.map(mapComment);
}

export async function create(data: {
  ticketId: string;
  message: string;
  createdBy: string;
}): Promise<Comment> {
  // Verify ticket exists
  const ticket = await prisma.ticket.findUnique({ where: { id: data.ticketId } });
  if (!ticket) throw new NotFoundError('Ticket');

  const comment = await prisma.comment.create({
    data: {
      ticketId: data.ticketId,
      message: data.message,
      createdBy: data.createdBy,
    },
    include: { author: { select: userSelect } },
  });

  return mapComment(comment);
}
