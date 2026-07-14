import { render, screen, act, fireEvent } from '@testing-library/react';
import SearchBar from '@/components/ui/SearchBar';

jest.useFakeTimers();

describe('SearchBar', () => {
  test('renders an input with placeholder', () => {
    render(<SearchBar onSearch={jest.fn()} />);
    expect(screen.getByPlaceholderText('Search tickets...')).toBeInTheDocument();
  });

  test('accepts custom placeholder', () => {
    render(<SearchBar onSearch={jest.fn()} placeholder="Find something..." />);
    expect(screen.getByPlaceholderText('Find something...')).toBeInTheDocument();
  });

  test('has aria-label for accessibility', () => {
    render(<SearchBar onSearch={jest.fn()} />);
    expect(screen.getByLabelText('Search tickets')).toBeInTheDocument();
  });

  test('calls onSearch after debounce delay', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByLabelText('Search tickets');

    fireEvent.change(input, { target: { value: 'dark' } });

    // Not called immediately
    expect(onSearch).not.toHaveBeenCalledWith('dark');

    // Advance past debounce (300ms)
    act(() => { jest.advanceTimersByTime(350); });

    expect(onSearch).toHaveBeenCalledWith('dark');
  });

  test('debounces rapid input — only last value fires', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByLabelText('Search tickets');

    fireEvent.change(input, { target: { value: 'd' } });
    act(() => { jest.advanceTimersByTime(100); });

    fireEvent.change(input, { target: { value: 'da' } });
    act(() => { jest.advanceTimersByTime(100); });

    fireEvent.change(input, { target: { value: 'dar' } });
    act(() => { jest.advanceTimersByTime(100); });

    fireEvent.change(input, { target: { value: 'dark' } });

    // Advance past the final debounce
    act(() => { jest.advanceTimersByTime(350); });

    // The last call should have 'dark'
    const lastCall = onSearch.mock.calls[onSearch.mock.calls.length - 1][0];
    expect(lastCall).toBe('dark');
  });

  test('calls onSearch with empty string when cleared', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByLabelText('Search tickets');

    fireEvent.change(input, { target: { value: 'test' } });
    act(() => { jest.advanceTimersByTime(350); });

    fireEvent.change(input, { target: { value: '' } });
    act(() => { jest.advanceTimersByTime(350); });

    const lastCall = onSearch.mock.calls[onSearch.mock.calls.length - 1][0];
    expect(lastCall).toBe('');
  });
});
