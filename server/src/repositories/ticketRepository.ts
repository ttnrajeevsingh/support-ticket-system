import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { Ticket, CreateTicketInput, UpdateTicketInput, TicketFilters } from '../types/ticket';
import { NotFoundError } from '../errors/NotFoundError';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

function mapTicket(t: any): Ticket {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    assignedTo: t.assignedTo ?? null,
    createdBy: t.createdBy,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    creator: t.creator
      ? { ...t.creator, createdAt: t.creator.createdAt.toISOString() }
      : undefined,
    assignee: t.assignee
      ? { ...t.assignee, createdAt: t.assignee.createdAt.toISOString() }
      : null,
    comments: t.comments?.map((c: any) => ({
      id: c.id,
      ticketId: c.ticketId,
      message: c.message,
      createdBy: c.createdBy,
      createdAt: c.createdAt.toISOString(),
      author: c.author
        ? { ...c.author, createdAt: c.author.createdAt.toISOString() }
        : undefined,
    })),
  };
}

// ─── Repository functions ─────────────────────────────────────────────────────

export async function findAll(filters: TicketFilters = {}): Promise<Ticket[]> {
  const { search, status, priority, assignedTo } = filters;

  // ── Full-text search path (uses raw SQL for GIN index) ────────────────────
  if (search) {
    // Build a tsquery that supports prefix matching:
    // "dar" → 'dar:*'  |  "dark mode" → 'dark & mode:*'
    // This allows partial word matching as the user types.
    const sanitized = search.replace(/[^\w\s]/g, '').trim();
    const words = sanitized.split(/\s+/).filter(Boolean);
    const tsquery = words
      .map((word, i) => (i === words.length - 1 ? `${word}:*` : word))
      .join(' & ');

    const conditions: Prisma.Sql[] = [
      Prisma.sql`to_tsvector('english', t.title || ' ' || t.description) @@ to_tsquery('english', ${tsquery})`,
    ];
    if (status)     conditions.push(Prisma.sql`t.status = ${status}::"Status"`);
    if (priority)   conditions.push(Prisma.sql`t.priority = ${priority}::"Priority"`);
    if (assignedTo) conditions.push(Prisma.sql`t.assigned_to = ${assignedTo}::uuid`);

    const whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;

    const rows: any[] = await prisma.$queryRaw`
      SELECT
        t.id, t.title, t.description, t.priority, t.status,
        t.assigned_to AS "assignedTo", t.created_by AS "createdBy",
        t.created_at AS "createdAt", t.updated_at AS "updatedAt",
        json_build_object('id', cu.id, 'name', cu.name, 'email', cu.email, 'role', cu.role, 'createdAt', cu.created_at) AS creator,
        CASE WHEN au.id IS NOT NULL
          THEN json_build_object('id', au.id, 'name', au.name, 'email', au.email, 'role', au.role, 'createdAt', au.created_at)
          ELSE NULL
        END AS assignee
      FROM tickets t
      LEFT JOIN users cu ON cu.id = t.created_by
      LEFT JOIN users au ON au.id = t.assigned_to
      ${whereClause}
      ORDER BY t.created_at DESC
    `;

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      priority: r.priority,
      status: r.status,
      assignedTo: r.assignedTo ?? null,
      createdBy: r.createdBy,
      createdAt: new Date(r.createdAt).toISOString(),
      updatedAt: new Date(r.updatedAt).toISOString(),
      creator: r.creator
        ? { ...r.creator, createdAt: new Date(r.creator.createdAt).toISOString() }
        : undefined,
      assignee: r.assignee
        ? { ...r.assignee, createdAt: new Date(r.assignee.createdAt).toISOString() }
        : null,
    }));
  }

  // ── Standard filter path (Prisma typed query) ─────────────────────────────
  const tickets = await prisma.ticket.findMany({
    where: {
      ...(status     && { status }),
      ...(priority   && { priority }),
      ...(assignedTo && { assignedTo }),
    },
    include: {
      creator: { select: userSelect },
      assignee: { select: userSelect },
    },
    orderBy: { createdAt: 'desc' },
  });

  return tickets.map(mapTicket);
}

export async function findById(id: string): Promise<Ticket> {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      creator: { select: userSelect },
      assignee: { select: userSelect },
      comments: {
        include: { author: { select: userSelect } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket) throw new NotFoundError('Ticket');
  return mapTicket(ticket);
}

export async function create(data: CreateTicketInput): Promise<Ticket> {
  const ticket = await prisma.ticket.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      assignedTo: data.assignedTo ?? null,
      createdBy: data.createdBy,
    },
    include: {
      creator: { select: userSelect },
      assignee: { select: userSelect },
    },
  });

  return mapTicket(ticket);
}

export async function update(id: string, data: UpdateTicketInput): Promise<Ticket> {
  try {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...(data.title       !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priority    !== undefined && { priority: data.priority }),
        ...(data.assignedTo  !== undefined && { assignedTo: data.assignedTo }),
      },
      include: {
        creator: { select: userSelect },
        assignee: { select: userSelect },
      },
    });
    return mapTicket(ticket);
  } catch (err: any) {
    if (err?.code === 'P2025') throw new NotFoundError('Ticket');
    throw err;
  }
}

export async function updateStatus(id: string, status: string): Promise<Ticket> {
  try {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status: status as any },
      include: {
        creator: { select: userSelect },
        assignee: { select: userSelect },
      },
    });
    return mapTicket(ticket);
  } catch (err: any) {
    if (err?.code === 'P2025') throw new NotFoundError('Ticket');
    throw err;
  }
}
