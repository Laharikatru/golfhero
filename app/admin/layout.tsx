'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Trophy, LayoutDashboard, Users, Gift, Heart, CheckSquare, BarChart2, LogOut, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/draw', icon: Gift, label: 'Draw Manager' },
  { href: '/admin/charities', icon: Heart, label: 'Charities' },
  { href: '/admin/winners', icon: CheckSquare, label: 'Winners' },
  { href: '/admin/reports', icon: BarChart2, label: 'Reports' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f5a623] to-[#ff6b6b] flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">GolfHero</div>
            <div className="text-xs text-[#f5a623] font-semibold">Admin Panel</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-4 h-4" /> {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all mb-1">
          <LayoutDashboard className="w-4 h-4" /> User Dashboard
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#080c10] flex">
      <aside className="hidden lg:flex w-64 flex-col bg-[#0d1117] border-r border-white/5 fixed h-full">
        <Sidebar />
      </aside>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-[#0d1117] border-r border-white/5 flex flex-col"><Sidebar /></div>
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
        </div>
      )}
      <main className="flex-1 lg:ml-64">
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/5">
          <span className="font-bold text-white">Admin Panel</span>
          <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-white">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
