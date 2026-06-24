'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Trophy, LayoutDashboard, Target, Heart, Gift, Settings, LogOut, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/scores', icon: Target, label: 'My Scores' },
  { href: '/dashboard/charity', icon: Heart, label: 'My Charity' },
  { href: '/dashboard/draws', icon: Gift, label: 'Draws & Prizes' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#00a8ff] flex items-center justify-center">
            <Trophy className="w-4 h-4 text-[#080c10]" />
          </div>
          <span className="font-bold text-white">GolfHero</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-white/5">
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00a8ff] flex items-center justify-center text-[#080c10] font-bold text-sm">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{user.email}</div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#080c10' }}>
      
      {/* Desktop sidebar - fixed */}
      <div style={{ width: '256px', flexShrink: 0, position: 'fixed', top: 0, left: 0, height: '100vh', backgroundColor: '#0d1117', borderRight: '1px solid rgba(255,255,255,0.05)', zIndex: 30, display: 'flex', flexDirection: 'column' }}>
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-[#0d1117] border-r border-white/5 flex flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div style={{ marginLeft: '256px', flex: 1, minWidth: 0, width: 'calc(100% - 256px)' }}>
        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </div>

    </div>
  )
}