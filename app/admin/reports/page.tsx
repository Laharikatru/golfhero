'use client'
import { useEffect, useState } from 'react'
import { BarChart2, Users, Trophy, Heart, Gift, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminReportsPage() {
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: cancelledUsers },
        { data: charityData },
        { data: drawData },
        { data: winnerData },
        { data: configData },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'cancelled'),
        supabase.from('charities').select('name, total_raised').eq('is_active', true).order('total_raised', { ascending: false }).limit(6),
        supabase.from('draws').select('*').in('status', ['published', 'completed']).order('draw_year', { ascending: false }).order('draw_month', { ascending: false }).limit(6),
        supabase.from('draw_results').select('prize_amount, payment_status').gt('prize_amount', 0),
        supabase.from('prize_pool_config').select('*').single(),
      ])

      const totalPrizesPaid = winnerData?.filter(w => w.payment_status === 'paid').reduce((s: number, w: any) => s + Number(w.prize_amount), 0) || 0
      const totalPrizesAwarded = winnerData?.reduce((s: number, w: any) => s + Number(w.prize_amount), 0) || 0
      const monthlyRevenue = (activeUsers || 0) * (configData?.monthly_plan_amount || 9.99)
      const monthlyCharity = monthlyRevenue * ((configData?.charity_min_pct || 10) / 100)
      const monthlyPool = monthlyRevenue * ((configData?.pool_contribution_pct || 40) / 100)

      setData({ totalUsers, activeUsers, cancelledUsers, charityData, drawData, totalPrizesPaid, totalPrizesAwarded, monthlyRevenue, monthlyCharity, monthlyPool, config: configData })
      setLoading(false)
    }
    load()
  }, [])

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}</div>

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">Reports & Analytics</h1>
        <p className="text-gray-400">Platform performance overview</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Total Users', value: data.totalUsers, color: 'text-blue-400', bg: 'from-blue-500/10' },
          { icon: TrendingUp, label: 'Active Subscribers', value: data.activeUsers, color: 'text-emerald-400', bg: 'from-emerald-500/10' },
          { icon: BarChart2, label: 'Monthly Revenue', value: `£${Number(data.monthlyRevenue || 0).toFixed(2)}`, color: 'text-[#00d4aa]', bg: 'from-teal-500/10' },
          { icon: Gift, label: 'Monthly Prize Pool', value: `£${Number(data.monthlyPool || 0).toFixed(2)}`, color: 'text-[#f5a623]', bg: 'from-amber-500/10' },
          { icon: Heart, label: 'Monthly Charity', value: `£${Number(data.monthlyCharity || 0).toFixed(2)}`, color: 'text-pink-400', bg: 'from-pink-500/10' },
          { icon: Trophy, label: 'Total Prizes Paid', value: `£${Number(data.totalPrizesPaid || 0).toFixed(2)}`, color: 'text-purple-400', bg: 'from-purple-500/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`bg-gradient-to-b ${bg} to-transparent border border-white/10 rounded-2xl p-5`}>
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className={`text-xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Subscriber breakdown */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-5 flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> Subscriber Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: 'Active', count: data.activeUsers, color: 'bg-emerald-400', total: data.totalUsers },
            { label: 'Cancelled', count: data.cancelledUsers, color: 'bg-red-400', total: data.totalUsers },
            { label: 'Inactive/Other', count: (data.totalUsers || 0) - (data.activeUsers || 0) - (data.cancelledUsers || 0), color: 'bg-gray-400', total: data.totalUsers },
          ].map(({ label, count, color, total }) => (
            <div key={label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-semibold">{count || 0}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${total ? ((count || 0) / total) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charity totals */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-5 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-400" /> Charity Contribution Totals</h2>
        <div className="space-y-3">
          {(data.charityData || []).map((c: any) => {
            const max = Math.max(...(data.charityData || []).map((x: any) => Number(x.total_raised)))
            return (
              <div key={c.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-300">{c.name}</span>
                  <span className="text-[#00d4aa] font-semibold">£{Number(c.total_raised).toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00d4aa] to-[#00a8ff] rounded-full" style={{ width: `${max ? (Number(c.total_raised) / max) * 100 : 0}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Draw history */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-5 flex items-center gap-2"><Gift className="w-4 h-4 text-[#f5a623]" /> Draw History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5">
              {['Period','Numbers','Total Pool','5-Match','4-Match','3-Match','Participants'].map(h => <th key={h} className="text-left px-3 py-2 text-xs text-gray-500 font-semibold uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {(data.drawData || []).map((d: any) => (
                <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-3 text-white font-medium">{MONTHS[d.draw_month - 1]} {d.draw_year}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">{[d.number_1,d.number_2,d.number_3,d.number_4,d.number_5].filter(Boolean).map((n:number) => (
                      <span key={n} className="w-6 h-6 rounded-full bg-[#00d4aa]/20 text-[#00d4aa] flex items-center justify-center text-xs font-bold">{n}</span>
                    ))}</div>
                  </td>
                  <td className="px-3 py-3 text-gray-300">£{Number(d.total_pool).toFixed(0)}</td>
                  <td className="px-3 py-3 text-[#f5a623]">£{Number(d.pool_5match).toFixed(0)}</td>
                  <td className="px-3 py-3 text-gray-300">£{Number(d.pool_4match).toFixed(0)}</td>
                  <td className="px-3 py-3 text-gray-300">£{Number(d.pool_3match).toFixed(0)}</td>
                  <td className="px-3 py-3 text-gray-400">{d.participant_count}</td>
                </tr>
              ))}
              {(!data.drawData || data.drawData.length === 0) && <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-500">No draws published yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Config */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-5">Prize Pool Configuration</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { label: 'Monthly Plan', value: `£${data.config?.monthly_plan_amount}` },
            { label: 'Yearly Plan', value: `£${data.config?.yearly_plan_amount}` },
            { label: 'Pool Contribution', value: `${data.config?.pool_contribution_pct}%` },
            { label: 'Min Charity %', value: `${data.config?.charity_min_pct}%` },
            { label: '5-Match Share', value: `${data.config?.match5_pct}%` },
            { label: '4-Match Share', value: `${data.config?.match4_pct}%` },
            { label: '3-Match Share', value: `${data.config?.match3_pct}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-1">{label}</div>
              <div className="font-bold text-white">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
