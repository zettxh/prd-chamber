import { Context, Next } from 'hono'
import pkg from 'jsonwebtoken'
const { verify } = pkg
import { getCookie } from 'hono/cookie'

export const JWT_SECRET = process.env.JWT_SECRET ?? 'prd-chamber-dev-secret-2026'
export const COOKIE_NAME = 'prd_token'

// Extend Hono context variables
declare module 'hono' {
  interface ContextVariableMap {
    userId: string
    userEmail: string
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const token =
    getCookie(c, COOKIE_NAME) ??
    c.req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return c.json({ error: 'Unauthorized — no token' }, 401)
  }

  try {
    const payload = verify(token, JWT_SECRET) as { sub: string; email: string }
    c.set('userId', payload.sub)
    c.set('userEmail', payload.email)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized — invalid token' }, 401)
  }
}
