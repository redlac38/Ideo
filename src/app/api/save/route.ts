import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'
import { getSession } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const body = await req.json()
    const {
      scores, answers, ideologyId, ideologyName, ideologyMatch,
      radarData, topMatches, regimeMatches, countryMatches,
      philosopherMatches, leaderMatches, famousMatches, religionMatch,
      name, isGuest = false, guestToken,
    } = body

    let userId = null
    if (session) {
      userId = session.userId
    }

    // If guest and no token, generate one
    let finalGuestToken = guestToken
    if (isGuest && !finalGuestToken) {
      finalGuestToken = uuidv4()
    }

    const result = await query(
      `INSERT INTO results
        (user_id, is_guest, guest_token, name, scores, answers, ideology_id, ideology_name, ideology_match,
         radar_data, top_matches, regime_matches, country_matches, philosopher_matches, leader_matches,
         famous_matches, religion_match, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING id`,
      [
        userId, isGuest, finalGuestToken, name || null,
        JSON.stringify(scores), JSON.stringify(answers), ideologyId, ideologyName, ideologyMatch,
        JSON.stringify(radarData), JSON.stringify(topMatches), JSON.stringify(regimeMatches),
        JSON.stringify(countryMatches), JSON.stringify(philosopherMatches), JSON.stringify(leaderMatches),
        JSON.stringify(famousMatches), JSON.stringify(religionMatch), new Date().toISOString(),
      ]
    )

    return NextResponse.json({ id: result.rows[0].id, guestToken: finalGuestToken })
  } catch (err) {
    console.error('Save error:', err)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const token = searchParams.get('token')

    if (id) {
      let q = 'SELECT * FROM results WHERE id = $1'
      const params: unknown[] = [id]
      if (!session) {
        q += ' AND is_guest = true'
      } else {
        q += ' AND (user_id = $2 OR is_guest = true)'
        params.push(session.userId)
      }
      const result = await query(q, params)
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      return NextResponse.json(result.rows[0])
    }

    if (token) {
      const result = await query('SELECT * FROM results WHERE guest_token = $1', [token])
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      return NextResponse.json(result.rows[0])
    }

    // List user's results
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const result = await query(
      'SELECT id, name, ideology_name, ideology_match, completed_at FROM results WHERE user_id = $1 ORDER BY created_at DESC',
      [session.userId]
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('Results error:', err)
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
