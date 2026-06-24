'use client'
import { useEffect, useState } from 'react'
import { Target, Plus, Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ScoresPage() {
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [newScore, setNewScore] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newNotes, setNewNotes] = useState('')
  const [editScore, setEditScore] = useState('')
  const [editDate, setEditDate] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('golf_scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }).limit(5)
    setScores(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addScore() {
    setError('')
    const s = parseInt(newScore)
    if (isNaN(s) || s < 1 || s > 45) { setError('Score must be between 1 and 45'); return }
    if (!newDate) { setError('Please select a date'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('golf_scores').insert({ user_id: user!.id, score: s, score_date: newDate, notes: newNotes || null })
    if (err) { setError(err.message); setSaving(false); return }
    setNewScore(''); setNewDate(new Date().toISOString().split('T')[0]); setNewNotes(''); setAdding(false)
    setSaving(false)
    load()
  }

  async function saveEdit(id: string) {
    setError('')
    const s = parseInt(editScore)
    if (isNaN(s) || s < 1 || s > 45) { setError('Score must be between 1 and 45'); return }
    setSaving(true)
    const supabase = createClient()
    const { error: err } = await supabase.from('golf_scores').update({ score: s, score_date: editDate }).eq('id', id)
    if (err) { setError(err.message); setSaving(false); return }
    setEditId(null); setSaving(false); load()
  }

  async function deleteScore(id: string) {
    if (!confirm('Delete this score?')) return
    const supabase = createClient()
    await supabase.from('golf_scores').delete().eq('id', id)
    load()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">My Scores</h1>
          <p className="text-gray-400">Your last 5 Stableford scores — used for monthly draws</p>
        </div>
        {!adding && scores.length < 5 && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-[#080c10] rounded-xl font-bold hover:opacity-90 transition-opacity text-sm">
            <Plus className="w-4 h-4" /> Add Score
          </button>
        )}
        {!adding && scores.length >= 5 && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-[#080c10] rounded-xl font-bold hover:opacity-90 transition-opacity text-sm">
            <Plus className="w-4 h-4" /> Add (replaces oldest)
          </button>
        )}
      </div>

      {/* Info banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <span className="font-semibold text-blue-400">Rolling 5-score system:</span> Only your latest 5 scores are kept. Adding a 6th automatically removes your oldest score. Scores range from 1–45 (Stableford format). One score per date allowed.
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>}

      {/* Add score form */}
      {adding && (
        <div className="bg-[#00d4aa]/5 border border-[#00d4aa]/30 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white">Add New Score</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Score (1–45)</label>
              <input type="number" min="1" max="45" value={newScore} onChange={e => setNewScore(e.target.value)}
                placeholder="e.g. 28"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d4aa] transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Date</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} max={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d4aa] transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Notes (optional)</label>
            <input type="text" value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="e.g. Windy conditions"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d4aa] transition-colors" />
          </div>
          <div className="flex gap-3">
            <button onClick={addScore} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#00d4aa] text-[#080c10] rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity text-sm">
              <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Score'}
            </button>
            <button onClick={() => { setAdding(false); setError('') }} className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-gray-400 rounded-xl font-medium hover:text-white transition-colors text-sm">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scores list */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : scores.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-2xl">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No scores yet</p>
          <p className="text-gray-600 text-sm mt-1">Add your first Stableford score to enter draws</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scores.map((s, i) => (
            <div key={s.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              {editId === s.id ? (
                <div className="flex items-center gap-4 flex-wrap">
                  <input type="number" min="1" max="45" value={editScore} onChange={e => setEditScore(e.target.value)}
                    className="w-24 bg-white/5 border border-[#00d4aa]/50 rounded-xl px-3 py-2 text-white focus:outline-none" />
                  <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} max={new Date().toISOString().split('T')[0]}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                  <div className="flex gap-2 ml-auto">
                    <button onClick={() => saveEdit(s.id)} className="p-2 bg-[#00d4aa]/20 text-[#00d4aa] rounded-lg hover:bg-[#00d4aa]/30 transition-colors"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditId(null)} className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-2 border-[#00d4aa] bg-[#00d4aa]/10 flex items-center justify-center font-black text-xl text-[#00d4aa]">{s.score}</div>
                  <div className="flex-1">
                    <div className="font-bold text-white">{new Date(s.score_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    {s.notes && <div className="text-sm text-gray-500 mt-0.5">{s.notes}</div>}
                    {i === 0 && <span className="text-xs text-[#00d4aa] font-semibold mt-1 inline-block">Most recent</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditId(s.id); setEditScore(String(s.score)); setEditDate(s.score_date) }}
                      className="p-2 text-gray-500 hover:text-[#00d4aa] hover:bg-[#00d4aa]/10 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteScore(s.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Draw numbers preview */}
      {scores.length > 0 && (
        <div className="bg-gradient-to-r from-[#00d4aa]/10 to-[#00a8ff]/10 border border-[#00d4aa]/20 rounded-2xl p-6">
          <h3 className="font-bold text-white mb-3">Your Draw Numbers</h3>
          <p className="text-sm text-gray-400 mb-4">These scores will be matched against this month's drawn numbers</p>
          <div className="flex gap-3 flex-wrap">
            {scores.map(s => (
              <div key={s.id} className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00a8ff] flex items-center justify-center font-black text-[#080c10] text-lg shadow-lg shadow-[#00d4aa]/20">
                {s.score}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
