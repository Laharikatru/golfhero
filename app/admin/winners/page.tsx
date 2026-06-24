'use client'
import { useEffect, useState } from 'react'
import { CheckSquare, Check, X, ExternalLink, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  async function load() {
    const supabase = createClient()
    const query = supabase.from('draw_results').select('*, draws(*), profiles(full_name, email)').gt('prize_amount', 0).order('created_at', { ascending: false })
    if (filter !== 'all') query.eq('payment_status', filter)
    const { data } = await query
    setWinners(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    const updates: any = { payment_status: status, reviewed_at: new Date().toISOString() }
    if (status === 'paid') updates.paid_at = new Date().toISOString()
    await supabase.from('draw_results').update(updates).eq('id', id)
    load()
  }

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const STATUS_COLOR: Record<string, string> = { pending: 'bg-amber-500/20 text-amber-400', approved: 'bg-blue-500/20 text-blue-400', paid: 'bg-emerald-500/20 text-emerald-400', rejected: 'bg-red-500/20 text-red-400' }
  const MATCH_LABELS: Record<number, string> = { 5: '🏆 Jackpot!', 4: '4-Match', 3: '3-Match' }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">Winners & Verification</h1>
        <p className="text-gray-400">Review proof submissions and manage payouts</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'paid', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-[#00d4aa] text-[#080c10]' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : winners.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-2xl">
          <CheckSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No winners in this category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {winners.map(w => (
            <div key={w.id} className={`border rounded-2xl p-6 ${w.payment_status === 'pending' ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10 bg-white/[0.03]'}`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-white">{w.profiles?.full_name || w.profiles?.email}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[w.payment_status]}`}>{w.payment_status}</span>
                    <span className="text-xs bg-[#f5a623]/20 text-[#f5a623] px-2 py-0.5 rounded-full font-semibold">{MATCH_LABELS[w.match_count]}</span>
                  </div>
                  <div className="text-sm text-gray-400">{w.profiles?.email}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{w.draws ? `${MONTHS[w.draws.draw_month - 1]} ${w.draws.draw_year} Draw` : ''}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-[#f5a623]">£{Number(w.prize_amount).toFixed(2)}</div>
                  {w.paid_at && <div className="text-xs text-gray-500 mt-0.5">Paid {new Date(w.paid_at).toLocaleDateString('en-GB')}</div>}
                </div>
              </div>

              {/* Matched numbers */}
              <div className="flex gap-2 mb-4">
                {w.matched_numbers?.map((n: number) => (
                  <div key={n} className="w-8 h-8 rounded-full bg-[#00d4aa] text-[#080c10] flex items-center justify-center font-bold text-xs">{n}</div>
                ))}
              </div>

              {/* Proof */}
              {w.proof_url && (
                <div className="mb-4 p-3 bg-white/5 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">Submitted Proof</div>
                  <a href={w.proof_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#00d4aa] text-sm hover:underline">
                    <ExternalLink className="w-3 h-3" /> View proof screenshot
                  </a>
                  {w.proof_submitted_at && <div className="text-xs text-gray-500 mt-1">Submitted: {new Date(w.proof_submitted_at).toLocaleDateString('en-GB')}</div>}
                </div>
              )}

              {/* Actions */}
              {w.payment_status === 'pending' && w.proof_url && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(w.id, 'approved')} className="flex items-center gap-1 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-semibold hover:bg-blue-500/30 transition-all">
                    <Check className="w-3 h-3" /> Approve
                  </button>
                  <button onClick={() => updateStatus(w.id, 'rejected')} className="flex items-center gap-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-semibold hover:bg-red-500/30 transition-all">
                    <X className="w-3 h-3" /> Reject
                  </button>
                </div>
              )}
              {w.payment_status === 'approved' && (
                <button onClick={() => updateStatus(w.id, 'paid')} className="flex items-center gap-1 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-semibold hover:bg-emerald-500/30 transition-all">
                  <Trophy className="w-3 h-3" /> Mark as Paid
                </button>
              )}
              {!w.proof_url && w.payment_status === 'pending' && (
                <div className="text-xs text-gray-500">Waiting for winner to submit proof...</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
