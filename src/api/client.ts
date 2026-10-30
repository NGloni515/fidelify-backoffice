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

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'CASHIER'
  active: boolean
}

export const staffApi = {
  list: () => api<TeamMember[]>('/staff'),
  create: (input: { name: string; email: string; password: string }) =>
    api<TeamMember>('/staff', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, changes: { active?: boolean; password?: string }) =>
    api<TeamMember>(`/staff/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(changes) }),
}

export const accountApi = {
  changePassword: (currentPassword: string, newPassword: string) =>
    api<void>('/auth/password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
}
