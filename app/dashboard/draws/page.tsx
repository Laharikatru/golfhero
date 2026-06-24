'use client'
import { useEffect, useState } from 'react'
import { Gift, Trophy, Upload, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DrawsPage() {
  const [draws, setDraws] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [proofUrl, setProofUrl] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: dr }, { data: res }] = await Promise.all([
        supabase.from('draws').select('*').in('status', ['published', 'completed']).order('draw_year', { ascending: false }).order('draw_month', { ascending: false }),
        supabase.from('draw_results').select('*, draws(*)').eq('user_id', user!.id).order('created_at', { ascending: false }),
      ])
      setDraws(dr || [])
      setResults(res || [])
      setLoading(false)
    }
    load()
  }, [])

  async function submitProof(resultId: string) {
    if (!proofUrl) return
    const supabase = createClient()
    await supabase.from('draw_results').update({ proof_url: proofUrl, proof_submitted_at: new Date().toISOString(), payment_status: 'pending' }).eq('id', resultId)
    setUploadingId(null); setProofUrl('')
    window.location.reload()
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = { pending: 'bg-amber-500/20 text-amber-400', approved: 'bg-blue-500/20 text-blue-400', paid: 'bg-emerald-500/20 text-emerald-400', rejected: 'bg-red-500/20 text-red-400' }
    return map[status] || 'bg-gray-500/20 text-gray-400'
  }

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}</div>

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">Draws & Prizes</h1>
        <p className="text-gray-400">Your draw history and winnings</p>
      </div>

      {/* My results */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-[#f5a623]" /> My Results</h2>
        {results.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.02] border border-white/10 rounded-2xl">
            <Gift className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No draw results yet. Draws run monthly!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map(r => (
              <div key={r.id} className={`border rounded-2xl p-6 ${r.prize_amount > 0 ? 'border-[#f5a623]/30 bg-[#f5a623]/5' : 'border-white/10 bg-white/[0.03]'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-bold text-white">{r.draws ? `${MONTHS[r.draws.draw_month - 1]} ${r.draws.draw_year}` : 'Draw'}</div>
                    <div className="text-sm text-gray-400 mt-0.5">{r.match_count} numbers matched</div>
                  </div>
                  <div className="text-right">
                    {r.prize_amount > 0 ? (
                      <div className="text-xl font-black text-[#f5a623]">£{Number(r.prize_amount).toFixed(2)}</div>
                    ) : (
                      <div className="text-gray-500 font-medium">No prize</div>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block ${getStatusBadge(r.payment_status)}`}>{r.payment_status}</span>
                  </div>
                </div>

                {/* Drawn numbers vs user scores */}
                {r.draws && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">Drawn numbers</div>
                    <div className="flex gap-2 flex-wrap">
                      {[r.draws.number_1, r.draws.number_2, r.draws.number_3, r.draws.number_4, r.draws.number_5].filter(Boolean).map((n: number) => {
                        const matched = r.user_scores?.includes(n)
                        return (
                          <div key={n} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${matched ? 'bg-[#00d4aa] text-[#080c10] shadow-lg shadow-[#00d4aa]/30' : 'bg-white/10 text-gray-400'}`}>{n}</div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Proof upload for winners */}
                {r.prize_amount > 0 && r.payment_status === 'pending' && !r.proof_url && (
                  <div className="border-t border-white/10 pt-4">
                    {uploadingId === r.id ? (
                      <div className="space-y-3">
                        <div className="text-sm text-white font-medium">Submit proof of your scores (screenshot URL)</div>
                        <input type="url" value={proofUrl} onChange={e => setProofUrl(e.target.value)} placeholder="https://..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00d4aa]" />
                        <div className="flex gap-2">
                          <button onClick={() => submitProof(r.id)} className="flex items-center gap-1 px-4 py-2 bg-[#00d4aa] text-[#080c10] rounded-lg text-sm font-bold"><Check className="w-3 h-3" /> Submit</button>
                          <button onClick={() => setUploadingId(null)} className="flex items-center gap-1 px-4 py-2 border border-white/10 text-gray-400 rounded-lg text-sm"><X className="w-3 h-3" /> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setUploadingId(r.id)} className="flex items-center gap-2 text-sm text-[#00d4aa] hover:text-white transition-colors font-semibold">
                        <Upload className="w-4 h-4" /> Submit verification proof
                      </button>
                    )}
                  </div>
                )}
                {r.proof_url && <div className="text-xs text-green-400 mt-2 flex items-center gap-1"><Check className="w-3 h-3" /> Proof submitted — awaiting review</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past draws */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Gift className="w-5 h-5 text-[#00d4aa]" /> Published Draws</h2>
        {draws.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-white/10 rounded-2xl">No published draws yet</div>
        ) : (
          <div className="space-y-3">
            {draws.map(d => (
              <div key={d.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-white">{MONTHS[d.draw_month - 1]} {d.draw_year}</div>
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-semibold capitalize">{d.status}</span>
                </div>
                <div className="flex gap-2 mb-3">
                  {[d.number_1, d.number_2, d.number_3, d.number_4, d.number_5].filter(Boolean).map((n: number) => (
                    <div key={n} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00a8ff] flex items-center justify-center font-bold text-[#080c10] text-sm">{n}</div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-xs text-gray-500">Jackpot</div>
                    <div className="text-sm font-bold text-[#f5a623]">£{Number(d.pool_5match).toFixed(0)}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-xs text-gray-500">4-Match</div>
                    <div className="text-sm font-bold text-white">£{Number(d.pool_4match).toFixed(0)}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-xs text-gray-500">3-Match</div>
                    <div className="text-sm font-bold text-white">£{Number(d.pool_3match).toFixed(0)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
