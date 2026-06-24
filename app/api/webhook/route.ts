import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const supabase = await createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession
        const userId = session.metadata?.supabase_user_id
        const plan = session.metadata?.plan
        if (!userId) break

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        await supabase.from('profiles').update({
          subscription_status: 'active',
          subscription_plan: plan,
          subscription_id: subscription.id,
          subscription_start: new Date(subscription.current_period_start * 1000).toISOString(),
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }).eq('id', userId)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const { data: profile } = await supabase.from('profiles').select('id').eq('subscription_id', sub.id).single()
        if (!profile) break
        await supabase.from('profiles').update({
          subscription_status: sub.status as any,
          subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq('id', profile.id)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const { data: profile } = await supabase.from('profiles').select('id').eq('subscription_id', sub.id).single()
        if (!profile) break
        await supabase.from('profiles').update({ subscription_status: 'cancelled' }).eq('id', profile.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const { data: profile } = await supabase.from('profiles').select('id').eq('customer_id', customerId).single()
        if (!profile) break
        await supabase.from('profiles').update({ subscription_status: 'past_due' }).eq('id', profile.id)
        break
      }
    }

    await supabase.from('payment_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      metadata: event.data.object as any,
    }).onConflict('stripe_event_id').ignore()

  } catch (err: any) {
    console.error('Webhook handler error:', err)
  }

  return NextResponse.json({ received: true })
}
