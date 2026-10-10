import { getAccessToken, renewSession } from '../auth/session'
import { ApiError, request } from './http'

export { ApiError }

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    return await request<T>(path, init, getAccessToken())
  } catch (error) {
    const expired = error instanceof ApiError && error.status === 401
    if (!expired || !(await renewSession())) throw error
    return request<T>(path, init, getAccessToken())
  }
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
