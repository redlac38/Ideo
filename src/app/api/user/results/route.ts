import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const result = await query(
      'SELECT id, name, ideology_name, ideology_match, completed_at FROM results WHERE user_id = $1 ORDER BY created_at DESC',
      [session.userId]
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('User results error:', err)
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
