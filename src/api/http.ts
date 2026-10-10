const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function request<T>(path: string, init?: RequestInit, accessToken?: string | null): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...init,
    // The refresh token is an HttpOnly cookie; without this the browser drops it cross-origin.
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message
    throw new ApiError(res.status, message ?? 'Error inesperado')
  }
  return body as T
}
