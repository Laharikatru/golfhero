'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Target, Heart, Gift, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [scores, setScores] = useState<any[]>([])
  const [charity, setCharity] = useState<any>(null)
  const [draws, setDraws] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: prof }, { data: sc }, { data: dr }] = await Promise.all([
        supabase.from('profiles').select('*, charities(name)').eq('id', user.id).single(),
        supabase.from('golf_scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }).limit(5),
        supabase.from('draw_results').select('*, draws(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      ])
      setProfile(prof)
      setScores(sc || [])
      setDraws(dr || [])
      if (prof?.charity_id) {
        const { data: ch } = await supabase.from('charities').select('*').eq('id', prof.charity_id).single()
        setCharity(ch)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="animate-pulse space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
    </div>
  )

  const isActive = profile?.subscription_status === 'active'

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
        </h1>
        <p className="text-gray-400">Here's your GolfHero overview</p>
      </div>

      {/* Subscription alert */}
      {!isActive && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <span className="text-amber-400 font-semibold">No active subscription</span>
            <span className="text-gray-400 text-sm ml-2">Subscribe to enter draws and track scores.</span>
          </div>
          <Link href="/auth/signup" className="px-4 py-2 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition-colors">
            Subscribe Now
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: CheckCircle, label: 'Subscription', value: profile?.subscription_status || 'Inactive', color: isActive ? 'text-emerald-400' : 'text-gray-500', bg: 'from-emerald-500/10 to-transparent' },
          { icon: Target, label: 'Scores Entered', value: `${scores.length}/5`, color: 'text-blue-400', bg: 'from-blue-500/10 to-transparent' },
          { icon: Heart, label: 'Charity', value: charity?.name?.split(' ')[0] || 'None selected', color: 'text-pink-400', bg: 'from-pink-500/10 to-transparent' },
          { icon: Trophy, label: 'Total Winnings', value: `£${Number(profile?.total_winnings || 0).toFixed(2)}`, color: 'text-[#f5a623]', bg: 'from-amber-500/10 to-transparent' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`bg-gradient-to-b ${bg} border border-white/10 rounded-2xl p-5`}>
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className={`font-bold text-sm ${color} capitalize`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Recent scores */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white flex items-center gap-2"><Target className="w-4 h-4 text-[#00d4aa]" /> Recent Scores</h2>
          <Link href="/dashboard/scores" className="text-sm text-[#00d4aa] hover:text-white transition-colors">Manage →</Link>
        </div>
        {scores.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No scores yet. <Link href="/dashboard/scores" className="text-[#00d4aa]">Add your first score</Link></p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {scores.map(s => (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full border-2 border-[#00d4aa] bg-[#00d4aa]/10 flex items-center justify-center font-black text-[#00d4aa]">{s.score}</div>
                <span className="text-xs text-gray-500">{new Date(s.score_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charity contribution */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white flex items-center gap-2"><Heart className="w-4 h-4 text-pink-400" /> Charity Contribution</h2>
          <Link href="/dashboard/charity" className="text-sm text-[#00d4aa] hover:text-white transition-colors">Change →</Link>
        </div>
        {charity ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <div className="font-bold text-white">{charity.name}</div>
              <div className="text-sm text-gray-400">{profile?.charity_contribution_pct}% of subscription donated monthly</div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No charity selected. <Link href="/dashboard/charity" className="text-[#00d4aa]">Choose one now</Link></p>
        )}
      </div>

      {/* Recent draw results */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white flex items-center gap-2"><Gift className="w-4 h-4 text-[#f5a623]" /> Recent Draw Results</h2>
          <Link href="/dashboard/draws" className="text-sm text-[#00d4aa] hover:text-white transition-colors">View all →</Link>
        </div>
        {draws.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Gift className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No draw results yet. Draws happen monthly!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {draws.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <div className="font-medium text-white text-sm">
                    {r.draws ? `${new Date(r.draws.draw_year, r.draws.draw_month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })} Draw` : 'Draw'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{r.match_count} numbers matched</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${r.prize_amount > 0 ? 'text-[#f5a623]' : 'text-gray-500'}`}>
                    {r.prize_amount > 0 ? `£${r.prize_amount}` : 'No prize'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 capitalize">{r.payment_status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
