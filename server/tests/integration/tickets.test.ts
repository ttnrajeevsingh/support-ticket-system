import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import { Status } from '../../src/types/ticket';

// ─── Test setup ───────────────────────────────────────────────────────────────

let userId: string;

async function createTicketWithStatus(status: Status): Promise<string> {
  // Create in "open" state first
  const ticket = await prisma.ticket.create({
    data: {
      title: `Test ticket (${status})`,
      description: 'Integration test ticket description',
      priority: 'medium',
      status: 'open',
      createdBy: userId,
    },
  });

  // Walk the state machine to reach the target status
  const path: Record<Status, Status[]> = {
    open: [],
    in_progress: ['in_progress'],
    resolved: ['in_progress', 'resolved'],
    closed: ['in_progress', 'resolved', 'closed'],
    cancelled: ['cancelled'],
  };

  let id = ticket.id;
  for (const step of path[status]) {
    await prisma.ticket.update({ where: { id }, data: { status: step } });
  }

  return id;
}

beforeAll(async () => {
  // Get a seeded user
  const user = await prisma.user.findFirst();
  if (!user) throw new Error('No seeded users found — run prisma db seed first');
  userId = user.id;
});

afterAll(async () => {
  // Clean up test tickets (keep seed data by only deleting our test titles)
  await prisma.ticket.deleteMany({ where: { title: { startsWith: 'Test ticket' } } });
  await prisma.$disconnect();
});

// ─── Valid transitions ────────────────────────────────────────────────────────

describe('PATCH /api/v1/tickets/:id/status — valid transitions', () => {
  const validCases: [Status, Status][] = [
    ['open', 'in_progress'],
    ['open', 'cancelled'],
    ['in_progress', 'resolved'],
    ['in_progress', 'cancelled'],
    ['resolved', 'closed'],
  ];

  test.each(validCases)('%s → %s returns 200', async (from, to) => {
    const ticketId = await createTicketWithStatus(from);

    const res = await request(app)
      .patch(`/api/v1/tickets/${ticketId}/status`)
      .send({ status: to, userId });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(to);
  });
});

// ─── Invalid transitions ──────────────────────────────────────────────────────

describe('PATCH /api/v1/tickets/:id/status — invalid transitions', () => {
  const invalidCases: [Status, Status][] = [
    ['open', 'resolved'],
    ['open', 'closed'],
    ['in_progress', 'open'],
    ['in_progress', 'closed'],
    ['resolved', 'open'],
    ['resolved', 'in_progress'],
    ['resolved', 'cancelled'],
    ['closed', 'open'],
    ['cancelled', 'open'],
  ];

  test.each(invalidCases)('%s → %s returns 422 INVALID_TRANSITION', async (from, to) => {
    const ticketId = await createTicketWithStatus(from);

    const res = await request(app)
      .patch(`/api/v1/tickets/${ticketId}/status`)
      .send({ status: to, userId });

    expect(res.status).toBe(422);
    expect(res.body.code).toBe('INVALID_TRANSITION');
    expect(res.body.error).toContain(from);
    expect(res.body.error).toContain(to);
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('PATCH /api/v1/tickets/:id/status — edge cases', () => {
  test('unknown ticket returns 404', async () => {
    const res = await request(app)
      .patch('/api/v1/tickets/00000000-0000-0000-0000-000000000000/status')
      .send({ status: 'in_progress', userId });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('TICKET_NOT_FOUND');
  });

  test('missing status field returns 400', async () => {
    const ticketId = await createTicketWithStatus('open');

    const res = await request(app)
      .patch(`/api/v1/tickets/${ticketId}/status`)
      .send({ userId });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  test('invalid status value returns 400', async () => {
    const ticketId = await createTicketWithStatus('open');

    const res = await request(app)
      .patch(`/api/v1/tickets/${ticketId}/status`)
      .send({ status: 'invalid_value', userId });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});
