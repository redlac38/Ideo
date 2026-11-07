"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ResultsView from './ResultsView'
import {
  Sparkles, Skip, HelpCircle, ChevronRight, RefreshCw, Share2, User,
  BarChart2, Globe, Users, Medal, BookOpen, Crown, ArrowRight, Save,
} from 'lucide-react'
import { DIMS, QUESTIONS, IDEOLOGIES, REGIMES, COUNTRIES, PHILOSOPHERS, FAMOUS, RELIGIONS } from '@/lib/data'
import { s, normalize, matchPct, cosSim, cn } from '@/lib/math'
import { getSession, setSessionCookie, clearSessionCookie } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

interface Question {
  id: string
  type: 'mc' | 'slider' | 'dropdown' | 'adaptive'
  text: string
  category: string
  context?: string
  dims: string[]
  opts: string[]
  vals: number[]
  adaptive?: boolean
  condition?: (ans: Record<string, string>) => boolean
}

interface Ideology {
  id: string
  name: string
  short: string
  desc: string
  full: string
  scores: Record<string, number>
  color: string
  era: string
  tag: string
  archetype: string
  key: string[]
  famous: string[]
}

interface Regime {
  id: string
  name: string
  short: string
  type: string
  country: string
  period: string
  desc: string
  scores: Record<string, number>
  color: string
  flag: string
  notable: string[]
}

interface Country {
  id: string
  name: string
  region: string
  scores: Record<string, number>
  color: string
  flag: string
}

interface Philosopher {
  id: string
  name: string
  period: string
  nat: string
  desc: string
  scores: Record<string, number>
  color: string
  ideas: string[]
  quote: string
}

interface Leader {
  id: string
  name: string
  role: string
  cat: string
  scores: Record<string, number>
  color: string
  flag: string
}

interface Religion {
  id: string
  name: string
  desc: string
  scores: Record<string, number>
  color: string
}

const DIM_LABELS: Record<string, string> = {
  economic: 'Economy', authority: 'Authority', globalism: 'Globalism',
  progress: 'Progress', civic: 'Civic', equality: 'Equality',
  intervention: 'Intervention', technocracy: 'Technocracy',
  environment: 'Environment', urban_rural: 'Urban/Rural',
  collectivism: 'Collectivism', pace: 'Pace of Change',
  religion_state: 'Religion & State', denomination: 'Religious Tradition',
}

const DIM_COLORS: Record<string, string> = {
  economic: '#1e3a8a', authority: '#dc2626', globalism: '#059669',
  progress: '#7c3aed', civic: '#d97706', equality: '#0891b2',
  intervention: '#be185d', technocracy: '#6b21a8', environment: '#15803d',
  urban_rural: '#b45309', collectivism: '#0ea5e9', pace: '#db2777',
  religion_state: '#7c2d12', denomination: '#92400e',
}

const DIM_LEFT: Record<string, string> = {
  economic: 'Command / Planned', authority: 'Libertarian', globalism: 'Internationalist',
  progress: 'Progressive', civic: 'Secular', equality: 'Egalitarian',
  intervention: 'Non-interventionist', technocracy: 'Technocratic',
  environment: 'Environmental', urban_rural: 'Urban-focused',
  collectivism: 'Collectivist', pace: 'Reformist',
  religion_state: 'Strict Separation', denomination: 'None / Atheist',
}

const DIM_RIGHT: Record<string, string> = {
  economic: 'Market / Private', authority: 'Authoritarian', globalism: 'Nationalist',
  progress: 'Traditional', civic: 'Religious', equality: 'Hierarchical',
  intervention: 'Interventionist', technocracy: 'Populist',
  environment: 'Developmental', urban_rural: 'Rural-focused',
  collectivism: 'Individualist', pace: 'Revolutionary',
  religion_state: 'State Religion', denomination: 'Established Denomination',
}

export default function DesignPage() {
  const router = useRouter()
  const isSample = typeof window !== 'undefined' && window.location.search.includes('sample=1')

  const [session, setSession] = useState<any>(null)
  const [phase, setPhase] = useState<'welcome' | 'testing' | 'results'>('welcome')
  const [asked, setAsked] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, { option: number | string; text: string; value: number }>>({})
  const [scores, setScores] = useState<Record<string, number>>({
    economic: 0, authority: 0, globalism: 0, progress: 0, civic: 0,
    equality: 0, intervention: 0, technocracy: 0, environment: 0,
    urban_rural: 0, collectivism: 0, pace: 0, religion_state: 0, denomination: 0,
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [currentQ, setCurrentQ] = useState<Question | null>(null)

  useEffect(() => {
    checkSession()
    if (isSample) {
      loadSample()
    }
  }, [])

  async function checkSession() {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.authenticated) setSession(data.user)
    } catch {
      // ignore
    }
  }

  function loadSample() {
    const sampleScores = {
      economic: -1, authority: 1, globalism: 0, progress: -1, civic: -1,
      equality: 1, intervention: -1, technocracy: 1, environment: -1,
      urban_rural: 0, collectivism: 1, pace: -1, religion_state: -1, denomination: -1,
    }
    setScores(sampleScores)
    setAsked(Array.from({ length: 50 }, (_, i) => 'q' + (i + 1)))
    computeResult(sampleScores, {})
  }

  function selectNextQuestion(): Question | null {
    const unasked = QUESTIONS.filter((q) => !asked.includes(q.id))
    if (unasked.length === 0) return null

    // Filter by conditions
    const valid = unasked.filter((q) => {
      if (q.condition) return q.condition(answers)
      return true
    })
    if (valid.length === 0) return null

    // Simple adaptive: pick the question whose dimensions have highest uncertainty
    const maxRaw = 3
    const uncertainty: Record<string, number> = {}
    for (const d of DIMS) {
      uncertainty[d.id] = 1 - Math.abs(scores[d.id]) / maxRaw
    }

    let best: Question | null = null
    let bs = -1
    for (const q of valid) {
      let sc = 0
      for (const d of q.dims) sc += uncertainty[d]
      sc /= q.dims.length
      if (q.id === 'q50') sc += 0.6
      if (sc > bs) { bs = sc; best = q }
    }
    return best
  }

  function renderTest() {
    if (asked.length >= 50) { finishTest(); return }
    const q = selectNextQuestion()
    if (!q) { finishTest(); return }
    setCurrentQ(q)
  }

  function selectOption(optIdx: number | string, value: number) {
    const q = currentQ!
    const text = typeof optIdx === 'number' ? q.opts[optIdx] : String(optIdx)
    setAnswers((prev) => ({ ...prev, [q.id]: { option: optIdx, text, value } }))
    const newScores = { ...scores }
    for (const d of q.dims) {
      newScores[d] += value
    }
    setScores(newScores)
    setAsked((prev) => [...new Set([...prev, q.id])])
    renderTest()
  }

  function skipQuestion() {
    const q = currentQ
    if (!q) return
    setAsked((prev) => [...new Set([...prev, q.id])])
    renderTest()
  }

  function finishTest() {
    setPhase('results')
    computeResult(scores, answers)
  }

  async function computeResult(scores: Record<string, number>, answers: Record<string, any>) {
    const norm = normalize(scores)
    let best: any = null
    for (const ide of IDEOLOGIES) {
      const m = matchPct(norm, ide.scores)
      if (!best || m > best.match) best = { ideology: ide, match: m }
    }
    const topIdeos = IDEOLOGIES.map((ide) => ({ ideology: ide, match: matchPct(norm, ide.scores) }))
      .sort((x, y) => y.match - x.match).slice(0, 6)
    const regimes = REGIMES.map((r) => ({ regime: r, match: matchPct(norm, r.scores) }))
      .sort((x, y) => y.match - x.match).slice(0, 6)
    const countries = COUNTRIES.map((c) => ({ country: c, match: matchPct(norm, c.scores) }))
      .sort((x, y) => y.match - x.match).slice(0, 6)
    const philosophers = PHILOSOPHERS.map((p) => ({ philosopher: p, match: matchPct(norm, p.scores) }))
      .sort((x, y) => y.match - x.match).slice(0, 6)
    const famous = FAMOUS.map((f) => ({ person: f, match: matchPct(norm, f.scores) }))
      .sort((x, y) => y.match - x.match).slice(0, 6)

    let relBest: any = null
    for (const r of RELIGIONS) {
      const m = matchPct(norm, r.scores)
      if (!relBest || m > relBest.match) relBest = { religion: r, match: m }
    }

    const newResult = {
      scores: norm,
      ideology: best.ideology,
      ideologyMatch: best.match,
      topMatches: topIdeos,
      regimeMatches: regimes,
      countryMatches: countries,
      philosopherMatches: philosophers,
      leaderMatches: famous,
      famousMatches: famous,
      radarData: norm,
      answers,
      religionMatch: relBest,
    }
    setResult(newResult)
  }

  async function saveResult() {
    if (!result) return
    setLoading(true)
    try {
      const isGuest = !session
      let guestToken = undefined
      if (isGuest) guestToken = crypto.randomUUID()

      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores: result.scores,
          answers: result.answers,
          ideologyId: result.ideology.id,
          ideologyName: result.ideology.name,
          ideologyMatch: result.ideologyMatch,
          radarData: result.radarData,
          topMatches: result.topMatches,
          regimeMatches: result.regimeMatches,
          countryMatches: result.countryMatches,
          philosopherMatches: result.philosopherMatches,
          leaderMatches: result.leaderMatches,
          famousMatches: result.famousMatches,
          religionMatch: result.religionMatch,
          isGuest,
          guestToken,
        }),
      })
      const data = await res.json()
      if (res.ok && data.id) {
        // If guest, store token in localStorage for retrieval
        if (isGuest && data.guestToken) {
          localStorage.setItem('ideo_guest_token', data.guestToken)
        }
        router.push(`/results/${data.id}`)
        router.refresh()
      }
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Welcome phase
  if (phase === 'welcome') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-ideo-600 to-accent-600 text-white mb-6 flex-shrink-0 mx-auto shadow-xl shadow-ideo-500/30">
            <Sparkles size={32} strokeWidth={2.5} />
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-slate-900 mb-6 tracking-tight leading-tight">
            Build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-ideo-600 to-accent-600">ideal country</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
            Answer 50 detailed questions across 14 dimensions. Your choices adapt based on previous answers.
            Nothing is saved until you choose to create an account or continue as a guest.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => { setPhase('testing'); renderTest() }}
              className="btn-primary px-9 py-3.5 text-base flex items-center gap-2 w-full sm:w-auto"
            >
              <Sparkles size={20} strokeWidth={2} /> Begin the Test
            </button>
            <LinkAuth />
          </div>
        </div>
      </div>
    )
  }

  // Testing phase
  if (phase === 'testing') {
    return (
      <div className="min-h-[calc(100vh-64px)] py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-ideo-600 uppercase tracking-wider mb-1">
                <span id="q-counter">{asked.length + 1}</span>
                <span className="text-slate-400 font-normal">/ 50</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-slate-900 mb-1">{currentQ?.category}</h2>
              <p className="text-sm text-slate-500">{currentQ?.context}</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <span id="q-pct">{Math.round((asked.length / 50) * 100)}%</span> complete
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
            <div
              id="q-bar"
              className="h-full bg-gradient-to-r from-ideo-600 to-accent-600 rounded-full transition-all duration-700"
              style={{ width: `${Math.round((asked.length / 50) * 100)}%` }}
            ></div>
          </div>
          <div className="card-premium p-8 md:p-12 mb-8 min-h-[340px] flex flex-col justify-center fade-in">
            <div className="flex items-start gap-3 mb-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-ideo-50 text-ideo-600 flex items-center justify-center text-lg font-bold">
                {asked.length + 1}
              </div>
              <p className="text-lg text-slate-800 leading-relaxed font-medium">{currentQ?.text}</p>
            </div>
            {currentQ?.context && (
              <p className="text-sm text-slate-500 mb-6 italic">{currentQ.context}</p>
            )}
            <div className="space-y-3">
              {renderOptions(currentQ!)}
            </div>
            <div className="skip-row">
              <button
                onClick={skipQuestion}
                className="btn-outline text-sm px-5 py-2.5"
              >
                <Skip size={16} strokeWidth={2} /> Skip question
              </button>
              <button className="help-badge" onClick={() => alert('Hint: Consider how much power the state should have versus individual freedom.')}>
                <HelpCircle size={16} strokeWidth={2} /> I don't understand
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {currentQ?.dims.map((d) => (
                <span key={d} className="dim-chip" style={{ background: `rgba(${hexToRgb(DIM_COLORS[d]) || '30,58,138'},0.08)`, color: DIM_COLORS[d] }}>
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Results phase
  if (phase === 'results') {
    return (
      <div className="min-h-[calc(100vh-64px)] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ResultsView result={result} session={session} onSave={saveResult} loading={loading} />
        </div>
      </div>
    )
  }

  return null
}

function renderOptions(q: Question) {
  if (q.type === 'slider') {
    return (
      <div className="slider-wrap">
        <div className="slider-labels">
          <span>{DIM_LEFT[q.dims[0]]}</span><span>Center</span><span>{DIM_RIGHT[q.dims[0]]}</span>
        </div>
        <input
          type="range" min="-3" max="3" step="1" defaultValue="0"
          className="w-full accent-ideo-600"
          onChange={(e) => {
            // handled by next button
          }}
        />
      </div>
    )
  }
  return q.opts.map((opt, i) => (
    <label key={i} className="option-card cursor-pointer" onClick={() => selectOption(i, q.vals[i])}>
      <div className="opt-letter">{String.fromCharCode(65 + i)}</div>
      <div className="flex-1 min-w-0 pl-3 pr-2">
        <p className="text-slate-800 leading-relaxed">{opt}</p>
      </div>
      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </label>
  ))
}

function LinkAuth() {
  return (
    <div className="mt-6 text-sm text-slate-600">
      Want to save your result?{' '}
      <a href="/auth/login" className="font-medium text-ideo-600 hover:text-ideo-700">Sign in</a>{' '}
      or continue as a guest.
    </div>
  )
}

function hexToRgb(hex: string): string | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? `${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)}` : null
}
