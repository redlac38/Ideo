"use client"

import { useEffect, useState } from 'react'
import { getSession } from '@/lib/auth'
import { ArrowLeft, BookOpen, Users, Medal, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { IDEOLOGIES, PHILOSOPHERS, FAMOUS } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default function BrowsePage({ type }: { type: 'ideologies' | 'thinkers' }) {
  const [session, setSession] = useState<any>(null)
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => d.authenticated && setSession(d.user))
    if (type === 'ideologies') setData(IDEOLOGIES || [])
    else setData([...(PHILOSOPHERS || []), ...(FAMOUS || [])])
  }, [type])

  return (
    <div className="min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="btn-outline px-4 py-2 text-sm flex items-center gap-2">
            <ArrowLeft size={16} strokeWidth={2} /> Back
          </Link>
          <div className="flex gap-3">
            {session && (
              <a href="/api/auth/logout" className="btn-outline px-4 py-2 text-sm flex items-center gap-2">
                <User size={16} strokeWidth={2} /> Sign out
              </a>
            )}
          </div>
        </div>

        <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-900 mb-2">
          {type === 'ideologies' ? 'Ideologies' : 'Thinkers & Leaders'}
        </h1>
        <p className="text-slate-600 mb-8">
          {type === 'ideologies' ? 'Explore the full spectrum of political thought.' : 'Well-known public figures and their approximate ideological alignment.'}
        </p>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-5">
          {data.map((item: any) => (
            <div key={item.id} className="card-premium p-6 group cursor-pointer" onClick={() => {
              // Could link to a detail view
            }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg" style={{ background: item.color }}>
                  {item.short?.[0] || item.name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    {type === 'ideologies' ? `${item.era} · ${item.tag}` : `${item.cat} · ${item.period || ''}`}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{item.desc}</p>
              {item.key ? (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.key.map((k: string) => (
                    <span key={k} className="px-2 py-1 rounded bg-slate-100 text-[11px] text-slate-500 font-medium border border-slate-200">{k}</span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.ideas?.map((idea: string) => (
                    <span key={idea} className="px-2 py-1 rounded bg-slate-100 text-[11px] text-slate-500 font-medium border border-slate-200">{idea}</span>
                  ))}
                </div>
              )}
              <Link href="/design" className="text-sm font-medium text-ideo-600 hover:text-ideo-700 flex items-center gap-1">
                Take Test <Sparkles size={14} strokeWidth={2} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
