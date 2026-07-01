import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

export const PARENT_SESSION_COOKIE = 'kidquest_parent_session'
const SESSION_DURATION_MS = 30 * 60 * 1000 // 30 minuten

/** Secure cookies alleen bij HTTPS — HTTP (bv. VPS IP:3001) anders worden sessies niet opgeslagen. */
export function useSecureSessionCookies(): boolean {
  const url = process.env.NEXTAUTH_URL ?? ''
  if (url.startsWith('https://')) return true
  if (url.startsWith('http://')) return false
  return false
}

function getSecret(): string {
  return process.env.NEXTAUTH_SECRET ?? process.env.PARENT_PIN ?? 'kidquest-dev-secret'
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex')
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_DURATION_MS
  const payload = `parent:${expires}`
  return `${payload}:${sign(payload)}`
}

export function verifySessionToken(token: string): boolean {
  const lastColon = token.lastIndexOf(':')
  if (lastColon === -1) return false

  const payload = token.slice(0, lastColon)
  const signature = token.slice(lastColon + 1)

  if (!payload.startsWith('parent:')) return false

  const expires = Number(payload.slice('parent:'.length))
  if (!Number.isFinite(expires) || Date.now() > expires) return false

  const expected = sign(payload)
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function isParentAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(PARENT_SESSION_COOKIE)?.value
  return token ? verifySessionToken(token) : false
}

export function sessionCookieOptions(token: string) {
  return {
    name: PARENT_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: useSecureSessionCookies(),
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  }
}

export function clearSessionCookieOptions() {
  return {
    name: PARENT_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: useSecureSessionCookies(),
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }
}
