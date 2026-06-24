'use client'
import { useEffect, useState } from 'react'
import { Heart, Plus, Edit2, Trash2, Check, X, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', short_description: '', description: '', category: '', website_url: '', image_url: '', is_featured: false })
  const [saving, setSaving] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('charities').select('*').order('created_at', { ascending: false })
    setCharities(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function resetForm() { setForm({ name: '', short_description: '', description: '', category: '', website_url: '', image_url: '', is_featured: false }) }

  async function save() {
    if (!form.name) return
    setSaving(true)
    const supabase = createClient()
    const slug = form.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
    if (editId) {
      await supabase.from('charities').update({ ...form, slug }).eq('id', editId)
      setEditId(null)
    } else {
      await supabase.from('charities').insert({ ...form, slug })
      setAdding(false)
    }
    resetForm(); setSaving(false); load()
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('charities').update({ is_active: !current }).eq('id', id)
    load()
  }

  async function toggleFeatured(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('charities').update({ is_featured: !current }).eq('id', id)
    load()
  }

  async function deleteCharity(id: string) {
    if (!confirm('Delete this charity?')) return
    const supabase = createClient()
    await supabase.from('charities').delete().eq('id', id)
    load()
  }

  const FormFields = () => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Name *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Charity name"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00d4aa]" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Category</label>
          <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Health & Medical"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00d4aa]" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Short Description</label>
        <input value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} placeholder="One line summary"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00d4aa]" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Full Description</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Full charity description" rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00d4aa] resize-none" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Website URL</label>
          <input value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00d4aa]" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Image URL</label>
          <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00d4aa]" />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="accent-[#00d4aa]" />
        <span className="text-sm text-gray-300">Featured charity (shown on homepage)</span>
      </label>
      <div className="flex gap-3">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#00d4aa] text-[#080c10] rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50">
          <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={() => { setAdding(false); setEditId(null); resetForm() }} className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-gray-400 rounded-xl text-sm hover:text-white">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Charities</h1>
          <p className="text-gray-400">{charities.length} charities</p>
        </div>
        {!adding && !editId && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-[#080c10] rounded-xl font-bold text-sm">
            <Plus className="w-4 h-4" /> Add Charity
          </button>
        )}
      </div>

      {adding && (
        <div className="bg-[#00d4aa]/5 border border-[#00d4aa]/30 rounded-2xl p-6">
          <h3 className="font-bold text-white mb-4">Add New Charity</h3>
          <FormFields />
        </div>
      )}

      <div className="space-y-4">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)
        : charities.map(c => (
          <div key={c.id} className={`border rounded-2xl p-5 ${!c.is_active ? 'opacity-50' : ''} ${editId === c.id ? 'border-[#00d4aa]/30 bg-[#00d4aa]/5' : 'border-white/10 bg-white/[0.03]'}`}>
            {editId === c.id ? (
              <>
                <h3 className="font-bold text-white mb-4">Edit: {c.name}</h3>
                <FormFields />
              </>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white">{c.name}</span>
                      {c.is_featured && <span className="text-xs bg-[#f5a623]/20 text-[#f5a623] px-2 py-0.5 rounded-full font-semibold">Featured</span>}
                      {!c.is_active && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{c.category}</div>
                    <div className="text-sm text-gray-400 mt-1">{c.short_description}</div>
                    <div className="text-xs text-[#00d4aa] mt-1 font-semibold">£{Number(c.total_raised).toLocaleString()} raised</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleFeatured(c.id, c.is_featured)} className={`p-1.5 rounded-lg transition-all ${c.is_featured ? 'text-[#f5a623] bg-[#f5a623]/10' : 'text-gray-500 hover:text-[#f5a623]'}`} title="Toggle featured"><Star className="w-4 h-4" /></button>
                  <button onClick={() => { setEditId(c.id); setForm({ name: c.name, short_description: c.short_description || '', description: c.description || '', category: c.category || '', website_url: c.website_url || '', image_url: c.image_url || '', is_featured: c.is_featured }) }} className="p-1.5 text-gray-500 hover:text-[#00d4aa] hover:bg-[#00d4aa]/10 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => toggleActive(c.id, c.is_active)} className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg" title={c.is_active ? 'Deactivate' : 'Activate'}><Check className="w-4 h-4" /></button>
                  <button onClick={() => deleteCharity(c.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
