import { useSyncExternalStore } from 'react'
import { ApiError, request } from '../api/http'

export interface StaffUser {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'CASHIER'
  branchId: string | null
  business: { id: string; name: string; slug: string }
}

interface SessionResponse {
  accessToken: string
  expiresIn: number
  user: StaffUser
}

// The access token lives in memory only. A reload loses it on purpose and
// restoreSession() gets a new one from the refresh cookie.
let accessToken: string | null = null
let user: StaffUser | null = null
let renewing: Promise<boolean> | null = null
let restoreAttempted = false
const listeners = new Set<() => void>()

function set(next: SessionResponse | null) {
  accessToken = next?.accessToken ?? null
  user = next?.user ?? null
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getAccessToken() {
  return accessToken
}

export function useCurrentUser() {
  return useSyncExternalStore(subscribe, () => user)
}

export async function login(email: string, password: string) {
  const session = await request<SessionResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  set(session)
  return session.user
}

// Concurrent 401s share one renewal instead of firing one each.
export function renewSession(): Promise<boolean> {
  renewing ??= request<SessionResponse>('/auth/refresh', { method: 'POST' })
    .then((session) => {
      set(session)
      return true
    })
    .catch((error: unknown) => {
      // Only a rejected cookie ends the session; a network blip must not log the cashier out.
      if (error instanceof ApiError && error.status === 401) set(null)
      return false
    })
    .finally(() => {
      renewing = null
    })
  return renewing
}

export async function restoreSession(): Promise<StaffUser | null> {
  if (!user && !restoreAttempted) {
    restoreAttempted = true
    await renewSession()
  }
  return user
}

export async function logout() {
  await request('/auth/logout', { method: 'POST' }).catch(() => {})
  set(null)
}
