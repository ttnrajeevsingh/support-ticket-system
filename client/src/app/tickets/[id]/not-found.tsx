import Link from 'next/link';

export default function TicketNotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Ticket Not Found
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        The ticket you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link href="/" style={{ color: '#2563eb', fontWeight: 500 }}>
        ← Back to all tickets
      </Link>
    </div>
  );
}
