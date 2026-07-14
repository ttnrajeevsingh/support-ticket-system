import { render, screen } from '@testing-library/react';
import StatusControl from '@/components/tickets/StatusControl';

// Mock the stores
jest.mock('@/store/useTicketStore', () => ({
  useTicketStore: () => ({
    changeStatus: jest.fn(),
    error: null,
    clearError: jest.fn(),
  }),
}));

jest.mock('@/store/useUserStore', () => ({
  useUserStore: () => ({
    users: [{ id: 'user-1', name: 'Alice Admin' }],
  }),
}));

describe('StatusControl', () => {
  test('renders valid transition buttons for "open" status', () => {
    render(<StatusControl ticketId="t1" currentStatus="open" />);
    expect(screen.getByText('Start Progress')).toBeInTheDocument();
    expect(screen.getByText('Cancel Ticket')).toBeInTheDocument();
  });

  test('does NOT render invalid transitions for "open" status', () => {
    render(<StatusControl ticketId="t1" currentStatus="open" />);
    expect(screen.queryByText('Mark Resolved')).not.toBeInTheDocument();
    expect(screen.queryByText('Close')).not.toBeInTheDocument();
  });

  test('renders valid transition buttons for "in_progress"', () => {
    render(<StatusControl ticketId="t1" currentStatus="in_progress" />);
    expect(screen.getByText('Mark Resolved')).toBeInTheDocument();
    expect(screen.getByText('Cancel Ticket')).toBeInTheDocument();
  });

  test('does NOT render "Start Progress" for "in_progress"', () => {
    render(<StatusControl ticketId="t1" currentStatus="in_progress" />);
    expect(screen.queryByText('Start Progress')).not.toBeInTheDocument();
  });

  test('renders only "Close" button for "resolved"', () => {
    render(<StatusControl ticketId="t1" currentStatus="resolved" />);
    expect(screen.getByText('Close')).toBeInTheDocument();
    expect(screen.queryByText('Mark Resolved')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel Ticket')).not.toBeInTheDocument();
  });

  test('shows terminal message for "closed" status', () => {
    render(<StatusControl ticketId="t1" currentStatus="closed" />);
    expect(screen.getByText(/terminal state/i)).toBeInTheDocument();
  });

  test('shows terminal message for "cancelled" status', () => {
    render(<StatusControl ticketId="t1" currentStatus="cancelled" />);
    expect(screen.getByText(/terminal state/i)).toBeInTheDocument();
  });

  test('renders the current status badge', () => {
    render(<StatusControl ticketId="t1" currentStatus="open" />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });
});
