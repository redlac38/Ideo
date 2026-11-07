"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Sparkles, LayoutDashboard, BarChart2, Globe, Users, Share2, RefreshCw, User, LogOut, ArrowLeft } from 'lucide-react'
import { getSession } from '@/lib/auth'

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/design', label: 'Build Country', icon: Sparkles },
  { href: '/results', label: 'My Results', icon: BarChart2 },
  { href: '/compare', label: 'Compare', icon: Globe },
  { href: '/ideologies', label: 'Ideologies', icon: Users },
]

export default function HomePage() {
  const [session, setSession] = useState<any>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.authenticated) setSession(data.user)
    } catch {
      // ignore
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-40 glass border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ideo-600 to-accent-600 flex items-center justify-center text-white font-bold shadow-lg shadow-ideo-500/40">
                I
              </div>
              <span className="font-display font-bold text-xl text-slate-900 tracking-tight">Ideo</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-ideo-600 transition-colors"
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                )
              })}
            </div>
            <div className="flex items-center gap-3">
              {checking ? (
                <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
              ) : session ? (
                <div className="flex items-center gap-3">
                  <Link href="/results" className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
                    <BarChart2 size={16} strokeWidth={2} /> My Results
                  </Link>
                  <button
                    onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => location.reload())}
                    className="btn-outline px-5 py-2.5 text-sm flex items-center gap-2"
                  >
                    <LogOut size={16} strokeWidth={2} /> Sign out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    className="hidden sm:flex items-center gap-2 px-5 py-3 bg-ideo-600 text-white rounded-xl font-bold shadow-lg shadow-ideo-500/40 hover:bg-ideo-700 transition-colors"
                    onClick={() => (location.href = '/design')}
                  >
                    <Sparkles size={16} strokeWidth={2} /> Build Country
                  </button>
                  <Link href="/auth/login" className="btn-outline px-5 py-2.5 text-sm flex items-center gap-2">
                    <User size={16} strokeWidth={2} /> Sign in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative">
        <section className="min-h-[calc(100vh-64px)] flex flex-col justify-center py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-ideo-600 to-accent-600 text-white mb-6 flex-shrink-0 mx-auto shadow-xl shadow-ideo-500/30">
              <Sparkles size={32} strokeWidth={2.5} />
            </div>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl text-slate-900 mb-6 tracking-tight leading-tight">
              Design your <span className="text-transparent bg-clip-text bg-gradient-to-r from-ideo-600 to-accent-600">ideal country</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Build a nation from the ground up across 14 dimensions of governance, economy, society, and foreign
              policy — including religion &amp; theocracy. Save your analysis and compare it to historical and current
              regimes, countries, philosophers, and public figures.
            </p>
            <div className="grid md:grid-cols-4 gap-5 mb-14">
              <FeatureCard
                icon={<Sparkles size={24} strokeWidth={2} />}
                title="50 Detailed Questions"
                desc="MC, slider, dropdown, and adaptive follow-ups across 14 dimensions."
                color="bg-ideo-50 text-ideo-600"
              />
              <FeatureCard
                icon={<LayoutDashboard size={24} strokeWidth={2} />}
                title="14 Dimensions"
                desc="Includes Religion & State and Religious Tradition for deep analysis."
                color="bg-accent-50 text-accent-600"
              />
              <FeatureCard
                icon={<BarChart2 size={24} strokeWidth={2} />}
                title="Rich Visualizations"
                desc="Radar, spectrum, compass, and alignment charts comparing your country."
                color="bg-rose-50 text-rose-600"
              />
              <FeatureCard
                icon={<Users size={24} strokeWidth={2} />}
                title="Save & Compare"
                desc="Create an account to save your results and revisit them anytime."
                color="bg-violet-50 text-violet-600"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/design"
                className="btn-primary px-9 py-3.5 text-base flex items-center gap-2 w-full sm:w-auto"
              >
                <Sparkles size={20} strokeWidth={2} /> Start Building
              </Link>
              <button
                onClick={() => (location.href = '/design?sample=1')}
                className="btn-outline px-9 py-3.5 text-base flex items-center gap-2 w-full sm:w-auto"
              >
                <RefreshCw size={20} strokeWidth={2} /> Try Sample Profile
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            Ideo is for educational exploration. Results are saved to your account and never shared.
          </p>
          <div className="flex gap-4">
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">Home</Link>
            <Link href="/design" className="text-sm text-slate-600 hover:text-slate-900">Build Country</Link>
            <Link href="/compare" className="text-sm text-slate-600 hover:text-slate-900">Compare</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <div className="card-premium p-6">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>{icon}</div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}
