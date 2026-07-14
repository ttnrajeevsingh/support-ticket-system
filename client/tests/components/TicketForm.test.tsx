import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TicketForm from '@/components/tickets/TicketForm';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock stores
const mockCreateTicket = jest.fn();
jest.mock('@/store/useTicketStore', () => ({
  useTicketStore: () => ({
    createTicket: mockCreateTicket,
  }),
}));

jest.mock('@/store/useUserStore', () => ({
  useUserStore: () => ({
    users: [
      { id: 'user-1', name: 'Alice Admin' },
      { id: 'user-2', name: 'Bob Agent' },
    ],
    fetchUsers: jest.fn(),
  }),
}));

describe('TicketForm', () => {
  beforeEach(() => {
    mockCreateTicket.mockReset();
  });

  test('renders all form fields', () => {
    render(<TicketForm />);
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description *')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority *')).toBeInTheDocument();
    expect(screen.getByLabelText('Assign To')).toBeInTheDocument();
    expect(screen.getByLabelText('Created By *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create ticket/i })).toBeInTheDocument();
  });

  test('shows validation error for empty title on submit', async () => {
    render(<TicketForm />);
    fireEvent.click(screen.getByRole('button', { name: /create ticket/i }));

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
    });
    expect(mockCreateTicket).not.toHaveBeenCalled();
  });

  test('shows validation error for short description', async () => {
    render(<TicketForm />);
    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Valid title' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Short' } });
    fireEvent.click(screen.getByRole('button', { name: /create ticket/i }));

    await waitFor(() => {
      expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
    });
    expect(mockCreateTicket).not.toHaveBeenCalled();
  });

  test('populates priority dropdown with 4 options', () => {
    render(<TicketForm />);
    const select = screen.getByLabelText('Priority *') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(['low', 'medium', 'high', 'critical']);
  });

  test('populates assignee dropdown from users store', () => {
    render(<TicketForm />);
    const select = screen.getByLabelText('Assign To') as HTMLSelectElement;
    expect(select).toContainHTML('Alice Admin');
    expect(select).toContainHTML('Bob Agent');
  });

  test('calls createTicket with valid data', async () => {
    mockCreateTicket.mockResolvedValue({ id: 'new-ticket' });

    render(<TicketForm />);
    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Valid title here' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'A description that is long enough' } });
    fireEvent.click(screen.getByRole('button', { name: /create ticket/i }));

    await waitFor(() => {
      expect(mockCreateTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Valid title here',
          description: 'A description that is long enough',
          priority: 'medium',
        }),
      );
    });
  });
});
