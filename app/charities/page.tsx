import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Trophy, Heart, Search, ExternalLink } from 'lucide-react'

export default async function CharitiesPage() {
  const supabase = await createClient()
  const { data: charities } = await supabase.from('charities').select('*, charity_events(*)').eq('is_active', true).order('is_featured', { ascending: false })
  const featured = charities?.filter(c => c.is_featured) || []
  const rest = charities?.filter(c => !c.is_featured) || []

  return (
    <div className="min-h-screen bg-[#080c10] text-white">
      <nav className="fixed top-0 w-full z-50 bg-[#080c10]/80 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#00a8ff] flex items-center justify-center">
              <Trophy className="w-4 h-4 text-[#080c10]" />
            </div>
            <span className="font-bold text-lg">GolfHero</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white px-4 py-2">Sign In</Link>
            <Link href="/auth/signup" className="text-sm font-semibold px-5 py-2 rounded-lg bg-gradient-to-r from-[#00d4aa] to-[#00a8ff] text-[#080c10]">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm mb-6">
              <Heart className="w-4 h-4" /> Supporting {charities?.length} charities
            </div>
            <h1 className="text-5xl font-black mb-4">Causes We Support</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Every GolfHero subscription contributes to a charity you choose. These are our verified partners.</p>
          </div>

          {/* Featured */}
          {featured.length > 0 && (
            <div className="mb-16">
              <h2 className="text-lg font-bold text-gray-400 mb-6 uppercase tracking-widest text-sm">Featured Charities</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {featured.map(c => (
                  <div key={c.id} className="bg-gradient-to-b from-[#00d4aa]/10 to-transparent border border-[#00d4aa]/20 rounded-2xl p-6 hover:border-[#00d4aa]/40 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-pink-400" />
                      </div>
                      <span className="text-xs bg-[#f5a623]/20 text-[#f5a623] px-2 py-0.5 rounded-full font-semibold">Featured</span>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1">{c.name}</h3>
                    <div className="text-xs text-[#00d4aa] font-semibold mb-3">{c.category}</div>
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">{c.short_description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#00d4aa] font-bold">£{Number(c.total_raised).toLocaleString()} raised</span>
                      {c.website_url && <a href={c.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                    </div>
                    {c.charity_events?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="text-xs text-gray-500 mb-2">Upcoming events</div>
                        {c.charity_events.slice(0, 2).map((ev: any) => (
                          <div key={ev.id} className="text-xs text-gray-400 py-1">{ev.title} — {new Date(ev.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All charities */}
          <div>
            <h2 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">All Partner Charities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map(c => (
                <div key={c.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                      <Heart className="w-5 h-5 text-pink-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm mb-0.5 truncate">{c.name}</h3>
                      <div className="text-xs text-gray-500 mb-2">{c.category}</div>
                      <div className="text-xs text-[#00d4aa] font-semibold">£{Number(c.total_raised).toLocaleString()} raised</div>
                    </div>
                  </div>
                  {c.short_description && <p className="text-xs text-gray-400 mt-3 leading-relaxed">{c.short_description}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/auth/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-[#00d4aa] to-[#00a8ff] text-[#080c10] hover:opacity-90 transition-opacity text-lg">
              Choose Your Charity — Get Started →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
