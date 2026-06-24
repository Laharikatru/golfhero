'use client'
import { useEffect, useState } from 'react'
import { Gift, Play, Eye, CheckCircle, Zap, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminDrawPage() {
  const [draws, setDraws] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [simResult, setSimResult] = useState<any>(null)
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('draws').select('*').order('draw_year', { ascending: false }).order('draw_month', { ascending: false })
    setDraws(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function runSimulation() {
    setRunning(true); setSimResult(null)
    const res = await fetch('/api/draw/simulate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month, year, drawType }) })
    const data = await res.json()
    setSimResult(data); setRunning(false)
  }

  async function publishDraw() {
    if (!simResult) return
    if (!confirm('Publish this draw? This will notify all participants.')) return
    setRunning(true)
    const res = await fetch('/api/draw/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...simResult, month, year, drawType }) })
    const data = await res.json()
    if (data.success) { setSimResult(null); load() }
    setRunning(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">Draw Manager</h1>
        <p className="text-gray-400">Configure, simulate, and publish monthly draws</p>
      </div>

      {/* Draw config */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-5">Configure New Draw</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Month</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d4aa]">
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Year</label>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d4aa]">
              {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Draw Type</label>
            <select value={drawType} onChange={e => setDrawType(e.target.value as any)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d4aa]">
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic (score-weighted)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={runSimulation} disabled={running}
            className="flex items-center gap-2 px-5 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl font-semibold hover:bg-blue-500/30 disabled:opacity-50 transition-all">
            {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            {running ? 'Running...' : 'Simulate Draw'}
          </button>
          {simResult && (
            <button onClick={publishDraw} disabled={running}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-semibold hover:bg-emerald-500/30 disabled:opacity-50 transition-all">
              <CheckCircle className="w-4 h-4" /> Publish Draw
            </button>
          )}
        </div>
      </div>

      {/* Simulation result */}
      {simResult && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-blue-400" /> Simulation Result — {MONTHS[month - 1]} {year}</h3>
          <div className="flex gap-3 mb-5">
            {simResult.numbers?.map((n: number) => (
              <div key={n} className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center font-black text-white text-lg">{n}</div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Jackpot Pool (40%)', value: simResult.pool_5match },
              { label: '4-Match Pool (35%)', value: simResult.pool_4match },
              { label: '3-Match Pool (25%)', value: simResult.pool_3match },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className="font-bold text-white">£{Number(value || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-400">Participants: <span className="text-white font-semibold">{simResult.participant_count}</span> active subscribers</div>
          {simResult.winners5 > 0 && <div className="mt-2 text-sm text-[#f5a623] font-semibold">🎉 {simResult.winners5} jackpot winner(s)!</div>}
          {simResult.winners4 > 0 && <div className="mt-1 text-sm text-white">4-match: {simResult.winners4} winner(s)</div>}
          {simResult.winners3 > 0 && <div className="mt-1 text-sm text-white">3-match: {simResult.winners3} winner(s)</div>}
        </div>
      )}

      {/* Past draws */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-bold text-white">All Draws</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {['Period','Numbers','Total Pool','Status','Published'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {loading ? [...Array(3)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-4"><div className="h-6 bg-white/5 rounded animate-pulse" /></td></tr>)
              : draws.map(d => (
                <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-4 font-medium text-white">{MONTHS[d.draw_month - 1]} {d.draw_year}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      {[d.number_1,d.number_2,d.number_3,d.number_4,d.number_5].filter(Boolean).map((n:number) => (
                        <div key={n} className="w-7 h-7 rounded-full bg-[#00d4aa]/20 text-[#00d4aa] flex items-center justify-center text-xs font-bold">{n}</div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-300">£{Number(d.total_pool).toFixed(2)}</td>
                  <td className="px-4 py-4"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${d.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : d.status === 'simulation' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>{d.status}</span></td>
                  <td className="px-4 py-4 text-sm text-gray-500">{d.published_at ? new Date(d.published_at).toLocaleDateString('en-GB') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && draws.length === 0 && <div className="text-center py-12 text-gray-500"><Gift className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>No draws yet</p></div>}
        </div>
      </div>
    </div>
  )
}
