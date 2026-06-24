'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Trophy, Eye, EyeOff, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultPlan = searchParams.get('plan') || 'monthly'
  const [plan, setPlan] = useState(defaultPlan)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    const res = await fetch('/api/subscription/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#080c10] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4aa] to-[#00a8ff] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#080c10]" />
            </div>
            <span className="font-bold text-xl text-white">GolfHero</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Create your account</h1>
          <p className="text-gray-400">Join thousands of golfers making a difference</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { id: 'monthly', name: 'Monthly', price: '£9.99/mo', sub: 'Billed monthly' },
            { id: 'yearly', name: 'Yearly', price: '£99.99/yr', sub: 'Save 17%', badge: 'BEST VALUE' },
          ].map(p => (
            <button key={p.id} onClick={() => setPlan(p.id)}
              className={`relative p-5 rounded-xl border text-left transition-all ${plan === p.id ? 'border-[#00d4aa] bg-[#00d4aa]/10' : 'border-white/10 bg-white/[0.03] hover:border-white/20'}`}>
              {p.badge && <span className="absolute -top-2 left-3 px-2 py-0.5 bg-[#00d4aa] text-[#080c10] text-xs font-black rounded">{p.badge}</span>}
              {plan === p.id && <Check className="absolute top-3 right-3 w-4 h-4 text-[#00d4aa]" />}
              <div className="font-bold text-white">{p.name}</div>
              <div className="text-lg font-black text-white mt-1">{p.price}</div>
              <div className="text-xs text-gray-500 mt-0.5">{p.sub}</div>
            </button>
          ))}
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="John Smith"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00d4aa] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00d4aa] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#00d4aa] transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#00d4aa] to-[#00a8ff] text-[#080c10] hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Creating account...' : `Continue to Payment →`}
            </button>
            <p className="text-center text-xs text-gray-600">By signing up you agree to our Terms of Service</p>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#00d4aa] hover:text-white transition-colors font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return <Suspense><SignupForm /></Suspense>
}