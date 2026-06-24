import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLANS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await request.json()
    const planConfig = PLANS[plan as keyof typeof PLANS] || PLANS.monthly

    const { data: profile } = await supabase.from('profiles').select('customer_id').eq('id', user.id).single()

    let customerId = profile?.customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email!, metadata: { supabase_id: user.id } })
      customerId = customer.id
      await supabase.from('profiles').update({ customer_id: customerId }).eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup`,
      metadata: { supabase_user_id: user.id, plan },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
