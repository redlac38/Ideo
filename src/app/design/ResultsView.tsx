"use client"

import { useState } from 'react'
import { Save } from 'lucide-react'
import { DIMS } from '@/lib/data'
import { DIM_LEFT, DIM_RIGHT } from '@/lib/math'

interface ResultsViewProps {
  result: any
  session: any
  onSave: () => void
  loading: boolean
}

export default function ResultsView({ result, session, onSave, loading }: ResultsViewProps) {
  const [saved, setSaved] = useState(false)
  const ide = result.ideology

  async function handleSave() {
    await onSave()
    setSaved(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 mb-2">Your Ideal Country</h1>
          <p className="text-slate-600">Nation profile complete</p>
        </div>
        <div className="flex gap-3">
          {!saved && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary px-6 py-3 text-sm flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Save size={18} strokeWidth={2} className="animate-spin" /> : <Save size={18} strokeWidth={2} />} Save Profile
            </button>
          )}
          {saved && (
            <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">Saved</span>
          )}
        </div>
      </div>

      <div className="insight-card mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-ideo-100 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-3xl flex items-center justify-center text-white font-extrabold text-3xl shadow-2xl shadow-ideo-500/40" style={{ background: `linear-gradient(135deg,${ide.color},${ide.color})` }}>
              {ide.name.charAt(0)}
            </div>
            <div className="text-center">
              <span className="mb-2 block inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ideo-100 text-ideo-700 text-xs font-bold">{ide.tag}</span>
              <h2 className="font-display font-bold text-3xl text-slate-900 mb-1">{ide.name}</h2>
              <span className="text-2xl font-bold text-ideo-600">{ide.ideologyMatch}%</span><span className="text-slate-500 font-semibold"> match</span>
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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-premium p-6">
          <h3 className="font-bold text-slate-900 mb-4">14-Dimensional Profile</h3>
          <div className="h-[340px] w-full">
            <canvas id="radarChart" />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 mb-3">Where you fall on each axis</h3>
          {DIMS.map((d) => {
            const v = result.scores[d.id]
            const pct = Math.round(((v + 3) / 6) * 100)
            return (
              <div key={d.id} className="axis-row">
                <div className="axis-label">{d.name}</div>
                <div className="axis-track">
                  <div className="axis-fill" style={{ background: d.color, width: `${Math.abs(pct - 50) * 2}%` }} />
                  <div className="axis-dot" style={{ background: d.color, left: `${pct}%` }} />
                </div>
                <div className="axis-left">{DIM_LEFT[d.id]}</div>
                <div className="axis-center">Center</div>
                <div className="axis-right">{DIM_RIGHT[d.id]}</div>
              </div>
            )
          })}
        </div>
      </div>

      {result.religionMatch && result.religionMatch.match >= 25 && (
        <div className="card-premium p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">☥</span> Religion & Theocracy Profile
          </h3>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg" style={{ background: result.religionMatch.religion.color }}>
              {result.religionMatch.religion.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-900">{result.religionMatch.religion.name}</span>
                <span className="px-2 py-0.5 rounded bg-ideo-100 text-ideo-700 text-xs font-bold">{result.religionMatch.match}% match</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{result.religionMatch.religion.desc}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card-premium p-6">
        <h3 className="font-bold text-slate-900 mb-4">Closest Ideology Matches</h3>
        <div className="space-y-3">
          {result.topMatches.map((m: any, i: number) => (
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

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-premium p-6">
          <h3 className="font-bold text-slate-900 mb-4">Historical & Current Regimes</h3>
          <div className="space-y-2">
            {result.regimeMatches.map((m: any, i: number) => (
              <div key={i} className="regime-row">
                <div className="regime-avatar" style={{ background: m.regime.color }}>{m.regime.short[0]}</div>
                <div className="regime-info">
                  <span className="regime-name">{m.regime.short}</span>
                  <span className="regime-sub">{m.regime.country} · {m.regime.period}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">{m.match}%</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">{m.regime.type.toLowerCase()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-premium p-6">
          <h3 className="font-bold text-slate-900 mb-4">Modern Countries</h3>
          <div className="space-y-2">
            {result.countryMatches.map((m: any, i: number) => (
              <div key={i} className="regime-row">
                <div className="regime-avatar" style={{ background: m.country.color }}>{m.country.flag}</div>
                <div className="regime-info">
                  <span className="regime-name">{m.country.name}</span>
                  <span className="regime-sub">{m.country.region}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">{m.match}%</div>
                  <div className="text-xs text-slate-400">country</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-premium p-6">
        <h3 className="font-bold text-slate-900 mb-4">Aligned Public Figures</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {result.famousMatches.map((m: any, i: number) => (
            <div key={i} className="people-card">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                <span className="text-4xl">{m.person.flag}</span>
              </div>
              <span className="people-name">{m.person.name}</span>
              <span className="people-role">{m.person.role}</span>
              <span className="people-match">{m.match}% match</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
