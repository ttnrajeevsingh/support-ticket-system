'use client';

import TicketListView from '@/components/tickets/TicketListView';

export default function HomePage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
            Tickets
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.125rem' }}>
            Manage and track support requests
          </p>
        </div>
      </div>
      <TicketListView />
    </div>
  );
}
