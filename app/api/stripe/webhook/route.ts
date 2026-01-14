import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();

    if (!stripe) {
      console.log('Stripe not configured, acknowledging webhook');
      return NextResponse.json({ received: true });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    // Verify signature if webhook secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // Parse without verification (for development)
      event = JSON.parse(body) as Stripe.Event;
      console.log('Warning: Webhook signature not verified');
    }

    const supabase = await createServiceClient();

    if (!supabase) {
      console.log('Supabase not configured');
      return NextResponse.json({ received: true });
    }

    // Handle events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Verify this is our app
        if (session.metadata?.app_name !== 'lecture-voice-notes') {
          console.log('Ignoring webhook from different app');
          return NextResponse.json({ received: true });
        }

        const packId = session.metadata?.pack_id;
        const userId = session.metadata?.user_id;

        if (packId && userId) {
          // Mark pack as paid
          await supabase
            .from('study_packs')
            .update({ is_paid: true })
            .eq('id', packId)
            .eq('user_id', userId);

          // Record purchase
          await supabase.from('purchases').insert({
            user_id: userId,
            pack_id: packId,
            stripe_checkout_session_id: session.id,
            amount_total: session.amount_total,
            currency: session.currency,
          });

          // Update or create subscription record with customer ID
          if (session.customer) {
            const { data: existingSub } = await supabase
              .from('subscriptions')
              .select('id')
              .eq('user_id', userId)
              .single();

            if (existingSub) {
              await supabase
                .from('subscriptions')
                .update({ stripe_customer_id: session.customer as string })
                .eq('user_id', userId);
            } else {
              await supabase.from('subscriptions').insert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                status: 'active',
              });
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;

        // Find user by customer ID
        const { data: subRecord } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single();

        if (subRecord) {
          await supabase
            .from('subscriptions')
            .update({
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              current_period_end: periodEnd
                ? new Date(periodEnd * 1000).toISOString()
                : null,
            })
            .eq('user_id', subRecord.user_id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;

        // Find user by customer ID
        const { data: subRecord } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single();

        if (subRecord) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'cancelled',
              current_period_end: periodEnd
                ? new Date(periodEnd * 1000).toISOString()
                : null,
            })
            .eq('user_id', subRecord.user_id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to prevent Stripe retries
    return NextResponse.json({ received: true });
  }
}

