import TicketForm from '@/components/tickets/TicketForm';

export default function CreateTicketPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
        New Ticket
      </h1>
      <TicketForm />
    </div>
  );
}
