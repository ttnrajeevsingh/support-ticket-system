import { ApiError } from '@/types/ticket';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export class ApiException extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export async function fetchApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let body: ApiError;
    try {
      body = await res.json();
    } catch {
      body = { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' };
    }
    throw new ApiException(body.error, body.code, res.status);
  }

  return res.json();
}
