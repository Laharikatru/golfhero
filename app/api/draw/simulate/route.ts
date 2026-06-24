import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRandomDraw, generateAlgorithmicDraw, countMatches, calculatePrizeTiers } from '@/lib/draw-engine'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { month, year, drawType } = await request.json()

    const { data: config } = await supabase.from('prize_pool_config').select('*').single()
    const { count: activeCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active')
    const { data: allScores } = await supabase.from('golf_scores').select('score, user_id').in(
      'user_id',
      (await supabase.from('profiles').select('id').eq('subscription_status', 'active')).data?.map((p: any) => p.id) || []
    )

    let drawnNumbers: number[]
    if (drawType === 'algorithmic' && allScores && allScores.length > 0) {
      const freq: Record<number, number> = {}
      allScores.forEach((s: any) => { freq[s.score] = (freq[s.score] || 0) + 1 })
      drawnNumbers = generateAlgorithmicDraw(freq)
    } else {
      drawnNumbers = generateRandomDraw()
    }

    const totalPool = (activeCount || 0) * (config?.monthly_plan_amount || 9.99) * ((config?.pool_contribution_pct || 40) / 100)
    const tiers = calculatePrizeTiers(totalPool)

    // Count winners per tier
    const userScoreMap = new Map<string, number[]>()
    allScores?.forEach((s: any) => {
      if (!userScoreMap.has(s.user_id)) userScoreMap.set(s.user_id, [])
      userScoreMap.get(s.user_id)!.push(s.score)
    })

    let winners5 = 0, winners4 = 0, winners3 = 0
    userScoreMap.forEach(scores => {
      const matches = countMatches(scores, drawnNumbers)
      if (matches === 5) winners5++
      else if (matches === 4) winners4++
      else if (matches === 3) winners3++
    })

    return NextResponse.json({
      numbers: drawnNumbers,
      total_pool: totalPool,
      pool_5match: tiers.match5,
      pool_4match: tiers.match4,
      pool_3match: tiers.match3,
      participant_count: activeCount,
      winners5, winners4, winners3,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
