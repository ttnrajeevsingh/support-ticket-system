import { fetchApi, ApiException } from '@/lib/api/fetchClient';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('fetchApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  test('returns parsed JSON on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: '123', title: 'Test' }),
    });

    const result = await fetchApi('/tickets/123');
    expect(result).toEqual({ id: '123', title: 'Test' });
  });

  test('sends Content-Type application/json header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await fetchApi('/tickets');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  test('throws ApiException on 400 error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Title is required', code: 'VALIDATION_ERROR' }),
    });

    await expect(fetchApi('/tickets')).rejects.toThrow(ApiException);
    await expect(fetchApi('/tickets')).rejects.toMatchObject({
      message: 'Title is required',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    });
  });

  test('throws ApiException on 422 error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ error: "Cannot transition from 'open' to 'closed'", code: 'INVALID_TRANSITION' }),
    });

    await expect(fetchApi('/tickets/1/status')).rejects.toMatchObject({
      code: 'INVALID_TRANSITION',
      statusCode: 422,
    });
  });

  test('throws ApiException on 404 error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Ticket not found', code: 'TICKET_NOT_FOUND' }),
    });

    await expect(fetchApi('/tickets/unknown')).rejects.toMatchObject({
      code: 'TICKET_NOT_FOUND',
      statusCode: 404,
    });
  });

  test('handles non-JSON error response gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => { throw new Error('not json'); },
    });

    await expect(fetchApi('/tickets')).rejects.toMatchObject({
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    });
  });

  test('passes signal for AbortController', async () => {
    const controller = new AbortController();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ([]),
    });

    await fetchApi('/tickets', { signal: controller.signal });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});
