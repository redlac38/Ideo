"use client"

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12">
      <div className="max-w-md w-full px-4 sm:px-6 lg:px-8">
        <div className="card-premium p-8 mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-600 text-white mb-4">
              <User size={24} strokeWidth={2} />
            </div>
            <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">Create account</h2>
            <p className="text-slate-600">Join Ideo to save your results</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className="block w-full py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-ideo-500 focus:border-transparent outline-none transition-all"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-ideo-500 focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="block w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-ideo-500 focus:border-transparent outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-500">At least 6 characters</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <ArrowRight size={18} strokeWidth={2} className="animate-spin" />
              ) : (
                <>
                  Create account <ArrowRight size={18} strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-ideo-600 hover:text-ideo-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
