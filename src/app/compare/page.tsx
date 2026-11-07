"use client"

import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { DIMS, IDEOLOGIES, REGIMES, COUNTRIES } from '@/lib/data'
import { matchPct } from '@/lib/math'
import Link from 'next/link'
import { Sparkles, BarChart2, Globe, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const DIM_LABELS = (DIMS || []).map((d) => d.name)

export default function ComparePage() {
  const [aId, setAId] = useState<string>('')
  const [bId, setBId] = useState<string>('')
  const [aData, setAData] = useState<number[]>((DIMS || []).map(() => 0))
  const [bData, setBData] = useState<number[]>((DIMS || []).map(() => 0))
  const [aLabel, setALabel] = useState('Entity A')
  const [bLabel, setBLabel] = useState('Entity B')

  useEffect(() => {
    const all = [...(IDEOLOGIES || []).map((i) => ({ id: i.id, name: i.name, scores: i.scores, color: i.color, type: 'Ideology' as const })),
      ...(REGIMES || []).map((r) => ({ id: r.id, name: r.name, scores: r.scores, color: r.color, type: 'Regime' as const })),
      ...(COUNTRIES || []).map((c) => ({ id: c.id, name: c.name, scores: c.scores, color: c.color, type: 'Country' as const }))]

    if (aId && bId) {
      const ia = all.find((x) => x.id === aId)
      const ib = all.find((x) => x.id === bId)
      if (ia && ib) {
        setALabel(ia.name)
        setBLabel(ib.name)
        setAData((DIMS || []).map((d) => ia.scores[d.id]))
        setBData((DIMS || []).map((d) => ib.scores[d.id]))
      }
    }
  }, [aId, bId])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { min: -3, max: 3, ticks: { stepSize: 1 } } },
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Side-by-Side Ideological Comparison', color: '#0f172a', font: { family: '"Plus Jakarta Sans"', size: 16, weight: '800' } },
    },
  } as any

  return (
    <div className="min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 mb-2">Compare Entities</h1>
            <p className="text-slate-600">Compare any two ideologies, regimes, or countries across the 14 dimensions.</p>
          </div>
          <Link href="/" className="btn-outline px-5 py-3 text-sm">
            <ArrowLeft size={16} strokeWidth={2} /> Back to Home
          </Link>
        </div>

        <div className="card-premium p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-2">
              <label className="font-bold text-slate-700 text-sm uppercase tracking-wider">Entity A</label>
              <select
                id="cmp-a"
                value={aId}
                onChange={(e) => setAId(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-ideo-500 outline-none"
              >
                <option value="">Select entity A...</option>
                {(IDEOLOGIES || []).map((i) => <option key={i.id} value={i.id}>{i.name} (Ideology)</option>)}
                {(REGIMES || []).map((r) => <option key={r.id} value={r.id}>{r.name} (Regime)</option>)}
                {(COUNTRIES || []).map((c) => <option key={c.id} value={c.id}>{c.name} (Country)</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-bold text-slate-700 text-sm uppercase tracking-wider">Entity B</label>
              <select
                id="cmp-b"
                value={bId}
                onChange={(e) => setBId(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-ideo-500 outline-none"
              >
                <option value="">Select entity B...</option>
                {(IDEOLOGIES || []).map((i) => <option key={i.id} value={i.id}>{i.name} (Ideology)</option>)}
                {(REGIMES || []).map((r) => <option key={r.id} value={r.id}>{r.name} (Regime)</option>)}
                {(COUNTRIES || []).map((c) => <option key={c.id} value={c.id}>{c.name} (Country)</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="card-premium p-6">
              <h3 className="font-bold text-slate-900 mb-3">{aLabel}</h3>
              <div className="h-[400px] w-full">
                <Bar
                  data={{
                    labels: DIM_LABELS,
                    datasets: [{ label: aLabel, data: aData, backgroundColor: '#1e3a8a' }],
                  }}
                  options={options}
                />
              </div>
            </div>
            <div className="card-premium p-6">
              <h3 className="font-bold text-slate-900 mb-3">{bLabel}</h3>
              <div className="h-[400px] w-full">
                <Bar
                  data={{
                    labels: DIM_LABELS,
                    datasets: [{ label: bLabel, data: bData, backgroundColor: '#7c3aed' }],
                  }}
                  options={options}
                />
              </div>
            </div>
          </div>

          {aId && bId && (
            <div className="mt-8 card-premium p-6">
              <h3 className="font-bold text-slate-900 mb-3">Similarity Score</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="meter mb-2">
                    <div className="meter-bar bg-ideo-600" style={{ width: `${matchPct(IDEOLOGIES.find((x) => x.id === aId)?.scores || {}, IDEOLOGIES.find((x) => x.id === bId)?.scores || {})}%` }} />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {matchPct(IDEOLOGIES.find((x) => x.id === aId)?.scores || {}, IDEOLOGIES.find((x) => x.id === bId)?.scores || {})}%
                  </div>
                  <p className="text-sm text-slate-500">Ideological alignment</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
