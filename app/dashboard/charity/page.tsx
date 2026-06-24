'use client'
import { useEffect, useState } from 'react'
import { Heart, Search, Check, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CharityPage() {
  const [charities, setCharities] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string>('')
  const [pct, setPct] = useState(10)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: ch }, { data: prof }] = await Promise.all([
        supabase.from('charities').select('*').eq('is_active', true).order('is_featured', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', user!.id).single(),
      ])
      setCharities(ch || [])
      setProfile(prof)
      setSelectedId(prof?.charity_id || '')
      setPct(prof?.charity_contribution_pct || 10)
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    if (!selectedId) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ charity_id: selectedId, charity_contribution_pct: pct }).eq('id', user!.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const filtered = charities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.category?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">My Charity</h1>
        <p className="text-gray-400">Choose which charity receives a portion of your subscription</p>
      </div>

      {/* Contribution slider */}
      <div className="bg-gradient-to-r from-pink-500/10 to-transparent border border-pink-500/20 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-1">Monthly Contribution</h3>
        <p className="text-sm text-gray-400 mb-5">Minimum 10% of your subscription fee</p>
        <div className="flex items-center gap-4 mb-3">
          <input type="range" min="10" max="100" value={pct} onChange={e => setPct(Number(e.target.value))}
            className="flex-1 accent-[#00d4aa]" />
          <span className="text-2xl font-black text-[#00d4aa] w-16 text-right">{pct}%</span>
        </div>
        <div className="text-sm text-gray-400">
          = <span className="text-white font-bold">£{((profile?.subscription_plan === 'yearly' ? 99.99 / 12 : 9.99) * pct / 100).toFixed(2)}</span> per month
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search charities..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00d4aa] transition-colors" />
      </div>

      {/* Charity grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(c => (
            <button key={c.id} onClick={() => setSelectedId(c.id)}
              className={`text-left p-5 rounded-2xl border transition-all ${selectedId === c.id ? 'border-[#00d4aa] bg-[#00d4aa]/10' : 'border-white/10 bg-white/[0.03] hover:border-white/20'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <Heart className={`w-5 h-5 ${selectedId === c.id ? 'text-[#00d4aa]' : 'text-pink-400'}`} />
                </div>
                {selectedId === c.id && <Check className="w-5 h-5 text-[#00d4aa]" />}
                {c.is_featured && selectedId !== c.id && <span className="text-xs bg-[#f5a623]/20 text-[#f5a623] px-2 py-0.5 rounded-full font-semibold">Featured</span>}
              </div>
              <div className="font-bold text-white text-sm mb-1">{c.name}</div>
              <div className="text-xs text-gray-500 mb-2">{c.category}</div>
              <div className="text-xs text-gray-400 line-clamp-2">{c.short_description}</div>
              <div className="text-xs text-[#00d4aa] font-semibold mt-3">£{Number(c.total_raised).toLocaleString()} raised</div>
            </button>
          ))}
        </div>
      )}

      <button onClick={save} disabled={!selectedId || saving}
        className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#00d4aa] to-[#00a8ff] text-[#080c10] hover:opacity-90 disabled:opacity-40 transition-opacity text-lg">
        {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Charity Selection'}
      </button>
    </div>
  )
}
