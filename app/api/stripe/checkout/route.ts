import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { PRICING_TIERS, PricingTier, getCreditsForTier } from '@/lib/pricing';

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session for purchasing credits
 * 
 * Body: { tier: 'starter_pack' | 'pro_pack' | 'pro_monthly' }
 * Returns: { url: string } - Stripe Checkout URL
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const { tier } = await request.json();

    if (!tier || !PRICING_TIERS[tier as PricingTier]) {
      return NextResponse.json(
        { error: 'Invalid tier specified' },
        { status: 400 }
      );
    }

    const tierInfo = PRICING_TIERS[tier as PricingTier];

    // Get or create Stripe customer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, user_id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    let customerId = profile.stripe_customer_id;

    // Verify customer exists in Stripe (handle env switches between test/live)
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch (error) {
        // Customer doesn't exist in current Stripe environment, create new one
        console.log('Customer not found in Stripe, creating new:', customerId);
        customerId = null;
      }
    }

    // Create Stripe customer if doesn't exist or was invalid
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          userId: userId,
        },
      });

      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: tierInfo.priceId,
          quantity: 1,
        },
      ],
      mode: tierInfo.type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
      metadata: {
        userId,
        tier,
        credits: getCreditsForTier(tier as PricingTier).toString(),
      },
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

