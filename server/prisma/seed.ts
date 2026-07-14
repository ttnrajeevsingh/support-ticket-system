import { PrismaClient, Role, Priority, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Clean existing data (order matters for FK constraints) ──────────────────
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ───────────────────────────────────────────────────────────────────
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Admin',
      email: 'alice@example.com',
      role: Role.admin,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Agent',
      email: 'bob@example.com',
      role: Role.agent,
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: 'Carol Agent',
      email: 'carol@example.com',
      role: Role.agent,
    },
  });

  console.log(`✅ Created 3 users: ${alice.name}, ${bob.name}, ${carol.name}`);

  // ── Tickets — one per status ─────────────────────────────────────────────────
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Login page crashes on mobile',
      description: 'Users on iOS 17 report a blank screen after tapping the login button. Reproducible on iPhone 14.',
      priority: Priority.high,
      status: Status.open,
      createdBy: alice.id,
      assignedTo: bob.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Dashboard charts not loading',
      description: 'The analytics dashboard shows empty chart placeholders. The API returns 200 but the data is not rendered.',
      priority: Priority.medium,
      status: Status.in_progress,
      createdBy: alice.id,
      assignedTo: carol.id,
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: 'Export to CSV missing date fields',
      description: 'When exporting tickets to CSV, the createdAt and updatedAt columns are empty. All other fields export correctly.',
      priority: Priority.low,
      status: Status.resolved,
      createdBy: bob.id,
      assignedTo: carol.id,
    },
  });

  const ticket4 = await prisma.ticket.create({
    data: {
      title: 'Password reset email not delivered',
      description: 'Several users report never receiving the password reset email. Checked spam folders — not there either.',
      priority: Priority.critical,
      status: Status.closed,
      createdBy: carol.id,
      assignedTo: alice.id,
    },
  });

  const ticket5 = await prisma.ticket.create({
    data: {
      title: 'Dark mode toggle resets on page refresh',
      description: 'Dark mode preference is not persisted. Every page load resets to light mode despite the user selecting dark.',
      priority: Priority.low,
      status: Status.cancelled,
      createdBy: bob.id,
      assignedTo: null,
    },
  });

  console.log(`✅ Created 5 tickets covering all statuses`);

  // ── Comments ─────────────────────────────────────────────────────────────────
  await prisma.comment.create({
    data: {
      ticketId: ticket1.id,
      message: 'Reproduced on iPhone 14 running iOS 17.1. The crash occurs when the login form submits. Investigating the auth service.',
      createdBy: bob.id,
    },
  });

  await prisma.comment.create({
    data: {
      ticketId: ticket2.id,
      message: 'Identified the root cause — the chart library is throwing a hydration error in the new Next.js version. Working on a fix.',
      createdBy: carol.id,
    },
  });

  await prisma.comment.create({
    data: {
      ticketId: ticket2.id,
      message: 'Fix deployed to staging. Please verify the charts are rendering correctly before we close this.',
      createdBy: alice.id,
    },
  });

  console.log(`✅ Created 3 comments`);
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
