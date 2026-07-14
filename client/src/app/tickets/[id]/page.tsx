'use client';

import { use } from 'react';
import TicketDetailView from '@/components/tickets/TicketDetailView';

interface Props {
  params: Promise<{ id: string }>;
}

export default function TicketDetailPage({ params }: Props) {
  const { id } = use(params);

  return <TicketDetailView ticketId={id} />;
}
