'use client'
import { useEffect, useState } from 'react'
import { Users, Trophy, Heart, Gift, TrendingUp, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, active: 0, pool: 0, charity: 0, draws: 0, winners: 0 })
  const [recent, setRecent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ count: users }, { count: active }, { data: draws }, { data: winners }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
        supabase.from('draws').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('draw_results').select('*', { count: 'exact', head: true }).gt('prize_amount', 0),
      ])
      const pool = (active || 0) * 9.99 * 0.4
      const charity = (active || 0) * 9.99 * 0.1
      setStats({ users: users || 0, active: active || 0, pool, charity, draws: draws?.length || 0, winners: 0 })
      setRecent(draws || [])
      setLoading(false)
    }
    load()
  }, [])

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />)}</div>

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">Admin Overview</h1>
        <p className="text-gray-400">Platform at a glance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Total Users', value: stats.users, color: 'text-blue-400', bg: 'from-blue-500/10' },
          { icon: TrendingUp, label: 'Active Subscribers', value: stats.active, color: 'text-emerald-400', bg: 'from-emerald-500/10' },
          { icon: Trophy, label: 'Monthly Prize Pool', value: `£${stats.pool.toFixed(2)}`, color: 'text-[#f5a623]', bg: 'from-amber-500/10' },
          { icon: Heart, label: 'Charity This Month', value: `£${stats.charity.toFixed(2)}`, color: 'text-pink-400', bg: 'from-pink-500/10' },
          { icon: Gift, label: 'Total Draws', value: stats.draws, color: 'text-purple-400', bg: 'from-purple-500/10' },
          { icon: AlertCircle, label: 'Pending Verification', value: stats.winners, color: 'text-amber-400', bg: 'from-amber-500/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`bg-gradient-to-b ${bg} to-transparent border border-white/10 rounded-2xl p-5`}>
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className={`text-xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-5">Recent Draws</h2>
        {recent.length === 0 ? (
          <p className="text-gray-500 text-sm">No draws yet. Go to Draw Manager to create one.</p>
        ) : (
          <div className="space-y-3">
            {recent.map(d => (
              <div key={d.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="font-medium text-white">{MONTHS[d.draw_month - 1]} {d.draw_year}</div>
                <div className="flex gap-2">
                  {[d.number_1, d.number_2, d.number_3, d.number_4, d.number_5].filter(Boolean).map((n: number) => (
                    <div key={n} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00a8ff] flex items-center justify-center font-bold text-[#080c10] text-xs">{n}</div>
                  ))}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${d.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : d.status === 'simulation' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>{d.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
