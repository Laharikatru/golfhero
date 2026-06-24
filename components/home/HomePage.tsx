'use client'
import Link from 'next/link'
import { Trophy, Heart, Target, ChevronRight, Star, Users, TrendingUp, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080c10] text-white overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-[#080c10]/80 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#00a8ff] flex items-center justify-center">
              <Trophy className="w-4 h-4 text-[#080c10]" />
            </div>
            <span className="font-bold text-lg">GolfHero</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <Link href="/charities" className="hover:text-white transition-colors">Charities</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link href="#prizes" className="hover:text-white transition-colors">Prizes</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">Sign In</Link>
            <Link href="/auth/signup" className="text-sm font-semibold px-5 py-2 rounded-lg bg-gradient-to-r from-[#00d4aa] to-[#00a8ff] text-[#080c10] hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(0,212,170,0.08)_0%,transparent_60%),radial-gradient(ellipse_at_80%_20%,rgba(0,168,255,0.08)_0%,transparent_60%)]" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-[#00d4aa] mb-8">
            <Heart className="w-4 h-4" />
            <span>Golf meets charity meets winning</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Play Golf.<br />
            <span className="bg-gradient-to-r from-[#00d4aa] to-[#00a8ff] bg-clip-text text-transparent">Give Back.</span><br />
            Win Big.
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Track your Stableford scores, support the charities you love, and enter monthly prize draws — all in one beautifully designed platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#00d4aa] to-[#00a8ff] text-[#080c10] hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-lg shadow-[#00d4aa]/20">
              Start for £9.99/month →
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-gray-300 border border-white/10 hover:border-white/30 hover:text-white transition-all">
              See how it works
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[['£48K+', 'Raised for charity'], ['2,400+', 'Active members'], ['£12K', 'Monthly jackpot']].map(([val, label]) => (
              <div key={label}>
                <div className="text-2xl font-black text-white">{val}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">How GolfHero Works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to play, give, and win</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'Enter Your Scores', desc: 'Log your last 5 Stableford scores (1–45). Simple, fast, mobile-friendly. One score per round date.', color: 'from-[#00d4aa] to-[#00a8ff]', step: '01' },
              { icon: Heart, title: 'Support Charity', desc: 'Choose a charity you care about. At least 10% of your subscription goes directly to them every month.', color: 'from-[#f5a623] to-[#f5d660]', step: '02' },
              { icon: Trophy, title: 'Win Monthly Prizes', desc: 'Your scores become your draw numbers. Match 3, 4, or all 5 drawn numbers to win cash prizes.', color: 'from-[#ff6b6b] to-[#f5a623]', step: '03' },
            ].map(({ icon: Icon, title, desc, color, step }) => (
              <div key={title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-[#080c10]" />
                  </div>
                  <span className="text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors">{step}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIZES */}
      <section id="prizes" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Monthly Prize Structure</h2>
            <p className="text-gray-400 text-lg">Every month, a portion of all subscriptions goes into the prize pool</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { match: '5 Numbers', share: '40%', label: 'Jackpot', desc: 'Rolls over if unclaimed!', color: 'border-[#f5a623]/30 bg-[#f5a623]/5', badge: 'bg-[#f5a623]/20 text-[#f5a623]' },
              { match: '4 Numbers', share: '35%', label: 'Second Prize', desc: 'Split among all winners', color: 'border-[#00d4aa]/30 bg-[#00d4aa]/5', badge: 'bg-[#00d4aa]/20 text-[#00d4aa]' },
              { match: '3 Numbers', share: '25%', label: 'Third Prize', desc: 'Split among all winners', color: 'border-white/10 bg-white/[0.02]', badge: 'bg-white/10 text-gray-300' },
            ].map(({ match, share, label, desc, color, badge }) => (
              <div key={match} className={`border rounded-2xl p-8 text-center ${color}`}>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${badge}`}>{label}</div>
                <div className="text-5xl font-black mb-2">{share}</div>
                <div className="text-lg font-semibold mb-2">of Prize Pool</div>
                <div className="text-sm text-gray-400 font-medium mb-4">{match} Matched</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHARITIES */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Support Causes You Care About</h2>
            <p className="text-gray-400 text-lg">Choose from our verified charity partners</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { name: 'Cancer Research UK', cat: 'Health & Medical', raised: '£48,320' },
              { name: 'RNLI', cat: 'Emergency Services', raised: '£22,150' },
              { name: 'Comic Relief', cat: 'International Aid', raised: '£15,600' },
              { name: 'WWF UK', cat: 'Environment', raised: '£18,900' },
              { name: 'Age UK', cat: 'Elderly Care', raised: '£12,800' },
              { name: 'Macmillan Cancer Support', cat: 'Health & Medical', raised: '£31,200' },
            ].map(({ name, cat, raised }) => (
              <div key={name} className="bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00d4aa]/20 to-[#00a8ff]/20 flex items-center justify-center mb-4">
                  <Heart className="w-5 h-5 text-[#00d4aa]" />
                </div>
                <h3 className="font-bold mb-1">{name}</h3>
                <p className="text-xs text-gray-500 mb-3">{cat}</p>
                <div className="text-sm text-[#00d4aa] font-semibold">{raised} raised</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/charities" className="inline-flex items-center gap-2 text-[#00d4aa] hover:text-white transition-colors font-semibold">
              View all charities <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section className="py-24 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4">Simple, Honest Pricing</h2>
          <p className="text-gray-400 text-lg mb-16">No hidden fees. Cancel anytime.</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-left">
              <div className="text-sm text-gray-400 mb-2">Monthly</div>
              <div className="text-4xl font-black mb-1">£9.99<span className="text-lg font-normal text-gray-400">/mo</span></div>
              <p className="text-gray-400 text-sm mb-6">Billed monthly, cancel anytime</p>
              {['Score tracking', 'Monthly draw entry', 'Charity contribution', 'Winner dashboard'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Star className="w-3 h-3 text-[#00d4aa]" /> {f}
                </div>
              ))}
              <Link href="/auth/signup?plan=monthly" className="mt-6 w-full block text-center py-3 rounded-xl border border-white/20 font-semibold hover:bg-white/5 transition-all">
                Get Started
              </Link>
            </div>
            <div className="bg-gradient-to-b from-[#00d4aa]/10 to-transparent border border-[#00d4aa]/30 rounded-2xl p-8 text-left relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00d4aa] text-[#080c10] text-xs font-black">BEST VALUE</div>
              <div className="text-sm text-[#00d4aa] mb-2">Yearly</div>
              <div className="text-4xl font-black mb-1">£99.99<span className="text-lg font-normal text-gray-400">/yr</span></div>
              <p className="text-gray-400 text-sm mb-6">Save 17% vs monthly</p>
              {['Everything in Monthly', '2 months free', 'Priority draw entry', 'Early access features'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Star className="w-3 h-3 text-[#00d4aa]" /> {f}
                </div>
              ))}
              <Link href="/auth/signup?plan=yearly" className="mt-6 w-full block text-center py-3 rounded-xl font-bold bg-gradient-to-r from-[#00d4aa] to-[#00a8ff] text-[#080c10] hover:opacity-90 transition-opacity">
                Get Started — Save 17%
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Shield, label: 'Secure Payments', sub: 'Stripe PCI compliant' },
              { icon: Heart, label: 'Real Charities', sub: 'Verified partners' },
              { icon: Users, label: '2,400+ Members', sub: 'And growing' },
              { icon: TrendingUp, label: '£148K+ Raised', sub: 'For good causes' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label}>
                <Icon className="w-6 h-6 text-[#00d4aa] mx-auto mb-3" />
                <div className="font-bold text-sm">{label}</div>
                <div className="text-xs text-gray-500 mt-1">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#00d4aa] to-[#00a8ff] flex items-center justify-center">
              <Trophy className="w-3 h-3 text-[#080c10]" />
            </div>
            <span className="font-bold">GolfHero</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/charities" className="hover:text-white transition-colors">Charities</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
          <div className="text-xs text-gray-600">© 2026 GolfHero. All rights reserved.</div>
        </div>
      </footer>

    </div>
  )
}