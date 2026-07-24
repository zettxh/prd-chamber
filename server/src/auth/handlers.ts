import { Context } from 'hono'
import { compareSync } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { eq } from 'drizzle-orm'
import { setCookie } from 'hono/cookie'
import { JWT_SECRET, COOKIE_NAME } from '../middleware/auth.js'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'

export async function loginHandler(c: Context) {
  const { email, password } = await c.req.json<{ email: string; password: string }>()

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400)
  }

  const user = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (!user[0]) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const valid = compareSync(password, user[0].passwordHash)
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = jwt.sign(
    { sub: user[0].id, email: user[0].email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  return c.json({
    user: {
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
    },
    token,
  })
}

export async function logoutHandler(c: Context) {
  setCookie(c, COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  })
  return c.json({ message: 'Logged out' })
}

export async function meHandler(c: Context) {
  const userId = c.get('userId')

  const user = await db.select({
    id: users.id,
    email: users.email,
    name: users.name,
  }).from(users).where(eq(users.id, userId)).limit(1)

  if (!user[0]) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ user: user[0] })
}
