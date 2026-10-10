// Cliente HTTP mínimo para la API de Fidelify.
// En desarrollo usa el proxy de Vite (/api → localhost:3000).
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message
    throw new ApiError(res.status, message ?? 'Error inesperado')
  }
  return body as T
}

export interface PassDetail {
  serialNumber: string
  balance: number
  rewardsReady: number
  customer: { name: string; phone: string }
  program: { name: string; stampsRequired: number; rewardText: string }
}

export interface PassSummary {
  serialNumber: string
  balance: number
  stampsRequired: number
  rewardsReady: number
  rewardEarned?: boolean
}

export const passesApi = {
  get: (serial: string) => api<PassDetail>(`/passes/${encodeURIComponent(serial)}`),
  stamp: (serial: string, count = 1) =>
    api<PassSummary>(`/passes/${encodeURIComponent(serial)}/stamp`, {
      method: 'POST',
      body: JSON.stringify({ count }),
    }),
  redeem: (serial: string) =>
    api<PassSummary>(`/passes/${encodeURIComponent(serial)}/redeem`, { method: 'POST' }),
}
