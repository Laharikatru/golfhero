'use client'
import { useEffect, useState } from 'react'
import { Users, Search, Edit2, Check, X, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editStatus, setEditStatus] = useState('')

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('profiles').select('*, charities(name)').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveEdit(id: string) {
    const supabase = createClient()
    await supabase.from('profiles').update({ full_name: editName, subscription_status: editStatus }).eq('id', id)
    setEditId(null); load()
  }

  async function makeAdmin(id: string) {
    if (!confirm('Make this user an admin?')) return
    const supabase = createClient()
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', id)
    load()
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const STATUS_COLOR: Record<string, string> = { active: 'bg-emerald-500/20 text-emerald-400', inactive: 'bg-gray-500/20 text-gray-400', cancelled: 'bg-red-500/20 text-red-400', past_due: 'bg-amber-500/20 text-amber-400' }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Users</h1>
          <p className="text-gray-400">{users.length} total users</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00d4aa]" />
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['User', 'Status', 'Plan', 'Charity', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-6 bg-white/5 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-4">
                    {editId === u.id ? (
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        className="bg-white/10 border border-[#00d4aa]/50 rounded-lg px-2 py-1 text-white text-sm w-36 focus:outline-none" />
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-white flex items-center gap-1">
                          {u.full_name || '—'}
                          {u.role === 'admin' && <Shield className="w-3 h-3 text-[#f5a623]" />}
                        </div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {editId === u.id ? (
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm focus:outline-none">
                        {['active','inactive','cancelled','past_due'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLOR[u.subscription_status] || 'bg-gray-500/20 text-gray-400'}`}>{u.subscription_status || 'inactive'}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-400 capitalize">{u.subscription_plan || '—'}</td>
                  <td className="px-4 py-4 text-sm text-gray-400">{u.charities?.name?.split(' ')[0] || '—'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-4">
                    {editId === u.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => saveEdit(u.id)} className="p-1.5 bg-[#00d4aa]/20 text-[#00d4aa] rounded-lg hover:bg-[#00d4aa]/30"><Check className="w-3 h-3" /></button>
                        <button onClick={() => setEditId(null)} className="p-1.5 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button onClick={() => { setEditId(u.id); setEditName(u.full_name || ''); setEditStatus(u.subscription_status || 'inactive') }}
                          className="p-1.5 text-gray-500 hover:text-[#00d4aa] hover:bg-[#00d4aa]/10 rounded-lg transition-all"><Edit2 className="w-3 h-3" /></button>
                        {u.role !== 'admin' && (
                          <button onClick={() => makeAdmin(u.id)} className="p-1.5 text-gray-500 hover:text-[#f5a623] hover:bg-[#f5a623]/10 rounded-lg transition-all" title="Make admin"><Shield className="w-3 h-3" /></button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500"><Users className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>No users found</p></div>
          )}
        </div>
      </div>
    </div>
  )
}
