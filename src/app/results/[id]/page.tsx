"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { DIMS } from '@/lib/data'
import { matchPct } from '@/lib/math'
import { ArrowLeft, RefreshCw, Share2, User } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const DIM_LABELS = DIMS.map((d) => d.name)

export default function ResultsViewPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResult()
  }, [id])

  async function fetchResult() {
    try {
      const token = localStorage.getItem('ideo_guest_token')
      const url = token ? `/api/results?token=${token}` : `/api/results?id=${id}`
      const res = await fetch(url)
      if (res.ok) {
        const d = await res.json()
        setData(d)
      } else {
        router.push('/design')
      }
    } catch {
      router.push('/design')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-ideo-200 border-t-ideo-600 animate-spin" />
          <p className="text-sm text-slate-500">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><p className="text-slate-500">Profile not found.</p></div>
  }

  const ideRaw = data.ideology || data.ideology_name
  const ide = ideRaw
    ? { name: ideRaw.name || 'Unknown', tag: ideRaw.tag || 'Unknown', desc: ideRaw.desc || '', full: ideRaw.full || '', era: ideRaw.era || '', archetype: ideRaw.archetype || '', color: ideRaw.color || '#1e3a8a' }
    : data.ideology

  return (
    <div className="min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="btn-outline px-4 py-2 text-sm flex items-center gap-2">
            <ArrowLeft size={16} strokeWidth={2} /> Back
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => fetchResult()}
              className="btn-ghost px-3 py-2"
            >
              <RefreshCw size={16} strokeWidth={2} />
            </button>
            <button
              onClick={() => {
                const txt = `I got ${ide.name} (${data.ideologyMatch}% match) on Ideo.`
                navigator.clipboard.writeText(txt).then(() => alert('Copied!'))
              }}
              className="btn-ghost px-3 py-2"
            >
              <Share2 size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-ideo-200 bg-gradient-to-b from-ideo-50 via-white to-white p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-ideo-100 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10 grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-3xl flex items-center justify-center text-white font-extrabold text-3xl shadow-2xl shadow-ideo-500/40" style={{ background: `linear-gradient(135deg,${ide.color},${ide.color})` }}>
                {ide.name.charAt(0)}
              </div>
              <div className="text-center">
                <span className="mb-2 block inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ideo-100 text-ideo-700 text-xs font-bold">{ide.tag}</span>
                <h2 className="font-display font-bold text-3xl text-slate-900 mb-1">{ide.name}</h2>
                <span className="text-2xl font-bold text-ideo-600">{data.ideologyMatch}%</span><span className="text-slate-500 font-semibold"> match</span>
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="text-lg text-slate-600 leading-relaxed mb-4">{ide.desc}</p>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">Era: {ide.era}</span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">Archetype: {ide.archetype}</span>
              </div>
              <div className="bg-white/60 border border-ideo-200 rounded-xl p-4">
                <h3 className="font-bold text-slate-900 mb-2">What this means</h3>
                <p className="text-slate-600 leading-relaxed">{ide.full}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="card-premium p-6">
            <h3 className="font-bold text-slate-900 mb-4">14-Dimensional Profile</h3>
            <div className="h-[340px] w-full">
              <canvas id="radarChart" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 mb-3">Axis Positions</h3>
            {DIMS.map((d) => {
              const v = data.scores?.[d.id] ?? 0
              const pct = Math.round(((v + 3) / 6) * 100)
              return (
                <div key={d.id} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700 text-sm">{d.name}</span>
                    <span className="text-xs font-bold text-slate-500">{v < 0 ? 'L' : v > 0 ? 'R' : 'C'}</span>
                  </div>
                  <div className="meter">
                    <div className="meter-bar" style={{ background: d.color, width: `${Math.abs(pct - 50) * 2}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top matches */}
        <div className="card-premium p-6 mb-8">
          <h3 className="font-bold text-slate-900 mb-4">Closest Matches</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {data.topMatches?.slice(0, 4).map((m: any, i: number) => (
              <div key={i} className="p-3 rounded-xl border border-slate-200 bg-white/50">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-slate-900">{m.ideology.short}</span>
                  <span className="px-2 py-0.5 rounded bg-ideo-100 text-ideo-700 text-xs font-bold">{m.match}%</span>
                </div>
                <p className="text-xs text-slate-500 leading-tight mt-1">{m.ideology.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Regimes & Countries */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card-premium p-6">
            <h3 className="font-bold text-slate-900 mb-4">Regimes</h3>
            <div className="space-y-2">
              {data.regimeMatches?.map((m: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg border border-slate-100 bg-white/50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: m.regime.color }}>{m.regime.short[0]}</div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-900">{m.regime.short}</span>
                    <p className="text-xs text-slate-500">{m.regime.country} · {m.regime.period}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{m.match}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-premium p-6">
            <h3 className="font-bold text-slate-900 mb-4">Countries</h3>
            <div className="space-y-2">
              {data.countryMatches?.map((m: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg border border-slate-100 bg-white/50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: m.country.color }}>{m.country.flag}</div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-900">{m.country.name}</span>
                    <p className="text-xs text-slate-500">{m.country.region}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{m.match}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Famous */}
        <div className="card-premium p-6 mb-8">
          <h3 className="font-bold text-slate-900 mb-4">Aligned Figures</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.famousMatches?.map((m: any, i: number) => (
              <div key={i} className="p-3 rounded-xl border border-slate-200 bg-white text-center">
                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2 overflow-hidden">
                  <span className="text-3xl">{m.person.flag}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900 block">{m.person.name}</span>
                <span className="text-xs text-slate-500 block mb-2">{m.person.role}</span>
                <span className="text-xs font-bold text-green-600">{m.match}% match</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
