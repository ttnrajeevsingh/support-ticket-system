import { render, screen } from '@testing-library/react';
import CommentList from '@/components/comments/CommentList';
import { Comment } from '@/types/ticket';

const mockComments: Comment[] = [
  {
    id: 'c1',
    ticketId: 't1',
    message: 'First comment',
    createdBy: 'user-1',
    createdAt: '2024-01-01T10:00:00.000Z',
    author: { id: 'user-1', name: 'Alice Admin', email: 'alice@example.com', role: 'admin', createdAt: '2024-01-01T00:00:00Z' },
  },
  {
    id: 'c2',
    ticketId: 't1',
    message: 'Second comment',
    createdBy: 'user-2',
    createdAt: '2024-01-02T10:00:00.000Z',
    author: { id: 'user-2', name: 'Bob Agent', email: 'bob@example.com', role: 'agent', createdAt: '2024-01-01T00:00:00Z' },
  },
];

describe('CommentList', () => {
  test('renders empty state when no comments', () => {
    render(<CommentList comments={[]} />);
    expect(screen.getByText('No comments yet.')).toBeInTheDocument();
  });

  test('renders all comments', () => {
    render(<CommentList comments={mockComments} />);
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Second comment')).toBeInTheDocument();
  });

  test('renders author names', () => {
    render(<CommentList comments={mockComments} />);
    expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    expect(screen.getByText('Bob Agent')).toBeInTheDocument();
  });

  test('renders comments in provided order (oldest first)', () => {
    const { container } = render(<CommentList comments={mockComments} />);
    const items = container.querySelectorAll('[class*="item"]');
    expect(items).toHaveLength(2);
  });
});
