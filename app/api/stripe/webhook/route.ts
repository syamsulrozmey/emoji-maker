import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { addCredits } from '@/lib/credits';
import { getPurchaseType, PricingTier } from '@/lib/pricing';
import Stripe from 'stripe';

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 * 
 * Events handled:
 * - checkout.session.completed: Add credits for one-time purchases and new subscriptions
 * - invoice.paid: Handle subscription renewals
 * - customer.subscription.deleted: Mark subscription as cancelled
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout completion
 * Creates transaction record and adds credits
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as PricingTier;
  const creditsToAdd = parseInt(session.metadata?.credits || '0');

  if (!userId || !tier || !creditsToAdd) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  // Get payment intent ID for one-time payments or subscription ID for subscriptions
  const paymentId = session.payment_intent as string || session.subscription as string;

  if (!paymentId) {
    console.error('No payment ID found in session:', session.id);
    return;
  }

  // Check if transaction already processed (idempotency)
  const { data: existingTransaction } = await supabaseAdmin
    .from('stripe_transactions')
    .select('id')
    .eq('stripe_payment_id', paymentId)
    .single();

  if (existingTransaction) {
    console.log('Transaction already processed:', paymentId);
    return;
  }

  // Create transaction record
  const { error: transactionError } = await supabaseAdmin
    .from('stripe_transactions')
    .insert({
      user_id: userId,
      stripe_payment_id: paymentId,
      stripe_customer_id: session.customer as string,
      tier_purchased: tier,
      amount_usd: (session.amount_total || 0) / 100, // Convert cents to dollars
      credits_granted: creditsToAdd,
      status: 'completed',
    });

  if (transactionError) {
    console.error('Error creating transaction record:', transactionError);
    throw transactionError;
  }

  // Add credits to user account
  const purchaseType = getPurchaseType(tier);
  const subscriptionId = session.subscription as string | undefined;

  await addCredits(userId, creditsToAdd, purchaseType, paymentId, subscriptionId, true);

  // Update profile subscription status if it's a subscription
  if (tier === 'pro_monthly') {
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'active',
        stripe_subscription_id: subscriptionId,
      })
      .eq('user_id', userId);
  }

  console.log(`✅ Credits added for user ${userId}: ${creditsToAdd} credits (${tier})`);
}

/**
 * Handle successful invoice payment (subscription renewals)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Skip if this is the first invoice (already handled by checkout.session.completed)
  if (invoice.billing_reason === 'subscription_create') {
    return;
  }

  const subscriptionId = invoice.subscription as string;
  const customerId = invoice.customer as string;

  if (!subscriptionId) {
    console.log('No subscription ID in invoice');
    return;
  }

  // Get user ID from subscription metadata
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata:', subscriptionId);
    return;
  }

  // Check if already processed
  const { data: existingTransaction } = await supabaseAdmin
    .from('stripe_transactions')
    .select('id')
    .eq('stripe_payment_id', invoice.payment_intent as string)
    .single();

  if (existingTransaction) {
    console.log('Invoice already processed:', invoice.id);
    return;
  }

  // Add monthly credits (15 for pro_monthly)
  const creditsToAdd = 15;
  const tier = 'pro_monthly';

  // Create transaction record
  await supabaseAdmin
    .from('stripe_transactions')
    .insert({
      user_id: userId,
      stripe_payment_id: invoice.payment_intent as string,
      stripe_customer_id: customerId,
      tier_purchased: tier,
      amount_usd: (invoice.amount_paid || 0) / 100,
      credits_granted: creditsToAdd,
      status: 'completed',
    });

  // Add credits
  await addCredits(userId, creditsToAdd, 'subscription_monthly', invoice.payment_intent as string, subscriptionId, true);

  console.log(`✅ Subscription renewal: ${creditsToAdd} credits added for user ${userId}`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata:', subscription.id);
    return;
  }

  // Update profile subscription status
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
      stripe_subscription_id: null,
    })
    .eq('user_id', userId);

  console.log(`✅ Subscription cancelled for user ${userId}`);
}

/**
 * Handle subscription updates (e.g., paused, resumed)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    return;
  }

  let status: 'active' | 'cancelled' | 'expired' = 'active';

  if (subscription.status === 'canceled') {
    status = 'cancelled';
  } else if (subscription.status === 'unpaid' || subscription.status === 'past_due') {
    status = 'expired';
  }

  await supabaseAdmin
    .from('profiles')
    .update({ subscription_status: status })
    .eq('user_id', userId);
}

