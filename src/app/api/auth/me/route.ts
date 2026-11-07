import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    return NextResponse.json({ authenticated: true, user: session })
  } catch (err) {
    console.error('Me error:', err)
    return NextResponse.json({ error: 'Session check failed' }, { status: 500 })
  }
}
