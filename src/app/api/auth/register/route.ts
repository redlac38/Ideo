import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'
import { hashPassword } from '@/lib/password'
import { signToken, setSessionCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const result = await query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, passwordHash, name || null]
    )

    const user = result.rows[0]
    const token = await signToken({ userId: user.id, email: user.email, name: user.name })
    await setSessionCookie(token, 7 * 24 * 60 * 60)

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
