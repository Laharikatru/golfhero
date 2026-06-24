import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function countMatches(scores: number[], drawn: number[]): number {
  return scores.filter(s => drawn.includes(s)).length
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { numbers, month, year, drawType, total_pool, pool_5match, pool_4match, pool_3match, participant_count } = await request.json()

    const { data: draw, error: drawError } = await supabase.from('draws').upsert({
      draw_month: month, draw_year: year, draw_type: drawType, status: 'published',
      number_1: numbers[0], number_2: numbers[1], number_3: numbers[2], number_4: numbers[3], number_5: numbers[4],
      total_pool, pool_5match, pool_4match, pool_3match, participant_count, published_at: new Date().toISOString(),
    }, { onConflict: 'draw_month,draw_year' }).select().single()

    if (drawError) throw drawError

    const { data: activeUsers } = await supabase.from('profiles').select('id').eq('subscription_status', 'active')
    const userIds = activeUsers?.map((u: any) => u.id) || []

    if (userIds.length > 0) {
      const { data: allScores } = await supabase.from('golf_scores').select('score, user_id').in('user_id', userIds)
      const userScoreMap = new Map<string, number[]>()
      allScores?.forEach((s: any) => {
        if (!userScoreMap.has(s.user_id)) userScoreMap.set(s.user_id, [])
        userScoreMap.get(s.user_id)!.push(s.score)
      })

      let count5 = 0, count4 = 0, count3 = 0
      userScoreMap.forEach(scores => {
        const m = countMatches(scores, numbers)
        if (m === 5) count5++
        else if (m === 4) count4++
        else if (m === 3) count3++
      })

      const results = []
      for (const [userId, scores] of userScoreMap) {
        const matched = scores.filter(s => numbers.includes(s))
        const matchCount = matched.length
        let prizeAmount = 0
        if (matchCount === 5 && count5 > 0) prizeAmount = pool_5match / count5
        else if (matchCount === 4 && count4 > 0) prizeAmount = pool_4match / count4
        else if (matchCount === 3 && count3 > 0) prizeAmount = pool_3match / count3

        results.push({
          draw_id: draw.id, user_id: userId, user_scores: scores,
          match_count: matchCount, matched_numbers: matched,
          prize_amount: Number(prizeAmount.toFixed(2)),
          payment_status: 'pending',
        })
      }

      if (results.length > 0) {
        await supabase.from('draw_results').upsert(results, { onConflict: 'draw_id,user_id' })
      }
    }

    return NextResponse.json({ success: true, drawId: draw.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}