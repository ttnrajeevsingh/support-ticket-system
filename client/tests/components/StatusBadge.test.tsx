import { render, screen } from '@testing-library/react';
import StatusBadge from '@/components/tickets/StatusBadge';

describe('StatusBadge', () => {
  test('renders "Open" for open status', () => {
    render(<StatusBadge status="open" />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  test('renders "In Progress" for in_progress status', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  test('renders "Resolved" for resolved status', () => {
    render(<StatusBadge status="resolved" />);
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  test('renders "Closed" for closed status', () => {
    render(<StatusBadge status="closed" />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  test('renders "Cancelled" for cancelled status', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  test('applies correct CSS class for status', () => {
    const { container } = render(<StatusBadge status="open" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('open');
  });
});
