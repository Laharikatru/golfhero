'use client'
import { useEffect, useState } from 'react'
import { Settings, User, CreditCard, Bell, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
      setProfile(data)
      setFullName(data?.full_name || '')
      setLoading(false)
    }
    load()
  }, [])

  async function saveProfile() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user!.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function openPortal() {
    setPortalLoading(true)
    const res = await fetch('/api/subscription/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setPortalLoading(false)
  }

  const STATUS_COLOR: Record<string, string> = { active: 'text-emerald-400', inactive: 'text-gray-500', cancelled: 'text-red-400', past_due: 'text-amber-400' }

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}</div>

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">Settings</h1>
        <p className="text-gray-400">Manage your account and subscription</p>
      </div>

      {/* Profile */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-5 flex items-center gap-2"><User className="w-4 h-4 text-[#00d4aa]" /> Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d4aa] transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input value={profile?.email || ''} disabled className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
          </div>
          <button onClick={saveProfile} disabled={saving}
            className="px-6 py-2.5 bg-[#00d4aa] text-[#080c10] rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-5 flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#00d4aa]" /> Subscription</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <div className="text-sm text-gray-400">Status</div>
              <div className={`font-bold capitalize mt-0.5 ${STATUS_COLOR[profile?.subscription_status] || 'text-gray-400'}`}>{profile?.subscription_status || 'Inactive'}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Plan</div>
              <div className="font-bold text-white capitalize mt-0.5">{profile?.subscription_plan || '—'}</div>
            </div>
          </div>
          {profile?.subscription_end && (
            <div className="text-sm text-gray-400">
              {profile.subscription_status === 'active' ? 'Renews' : 'Expires'}: <span className="text-white">{new Date(profile.subscription_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          )}
          {profile?.subscription_status === 'active' ? (
            <button onClick={openPortal} disabled={portalLoading}
              className="px-6 py-2.5 border border-white/20 text-gray-300 rounded-xl font-semibold text-sm hover:bg-white/5 disabled:opacity-50 transition-all">
              {portalLoading ? 'Loading...' : 'Manage Billing (Stripe Portal)'}
            </button>
          ) : (
            <a href="/auth/signup" className="inline-block px-6 py-2.5 bg-gradient-to-r from-[#00d4aa] to-[#00a8ff] text-[#080c10] rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
              Subscribe Now
            </a>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-5 flex items-center gap-2"><Shield className="w-4 h-4 text-[#00d4aa]" /> Security</h2>
        <p className="text-sm text-gray-400 mb-4">Password changes are handled through your email provider.</p>
        <button onClick={async () => {
          const supabase = createClient()
          await supabase.auth.resetPasswordForEmail(profile?.email, { redirectTo: `${window.location.origin}/auth/callback` })
          alert('Password reset email sent!')
        }} className="px-6 py-2.5 border border-white/20 text-gray-300 rounded-xl font-semibold text-sm hover:bg-white/5 transition-all">
          Send Password Reset Email
        </button>
      </div>
    </div>
  )
}
