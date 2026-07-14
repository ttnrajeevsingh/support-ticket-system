import { render, screen } from '@testing-library/react';
import PriorityBadge from '@/components/tickets/PriorityBadge';

describe('PriorityBadge', () => {
  test('renders "Low" for low priority', () => {
    render(<PriorityBadge priority="low" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  test('renders "Medium" for medium priority', () => {
    render(<PriorityBadge priority="medium" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  test('renders "High" for high priority', () => {
    render(<PriorityBadge priority="high" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  test('renders "Critical" for critical priority', () => {
    render(<PriorityBadge priority="critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  test('applies correct CSS class', () => {
    const { container } = render(<PriorityBadge priority="high" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('high');
  });
});
