/**
 * Pricing configuration for Emoji SaaS
 * Maps tier names to Stripe price IDs and feature details
 */

export type PricingTier = 'starter_pack' | 'pro_pack' | 'pro_monthly';

export interface PricingTierInfo {
  name: string;
  price: number;
  credits: number;
  priceId: string;
  features: string[];
  type: 'one_time' | 'subscription';
  popular?: boolean;
}

export const PRICING_TIERS: Record<PricingTier, PricingTierInfo> = {
  starter_pack: {
    name: 'Starter Pack',
    price: 4.99,
    credits: 30,
    priceId: process.env.STRIPE_STARTER_PACK_PRICE_ID || '',
    type: 'one_time',
    features: [
      '30 credits',
      'PNG export with metadata',
      'Share to public gallery (Coming soon)',
      'Personal & commercial use',
      'Priority email support',
    ],
  },
  pro_pack: {
    name: 'Pro Pack',
    price: 9.99,
    credits: 75,
    priceId: process.env.STRIPE_PRO_PACK_PRICE_ID || '',
    type: 'one_time',
    popular: true,
    features: [
      '75 credits',
      'PNG export with metadata',
      'Batch generation (3-5 variations) (Coming soon)',
      'Public gallery with analytics (Coming soon)',
      'Custom style/prompt library (10 saved) (Coming soon)',
      'Personal & commercial use',
      'Priority support',
    ],
  },
  pro_monthly: {
    name: 'Pro Monthly',
    price: 3.99,
    credits: 15,
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    type: 'subscription',
    features: [
      '15 credits per month',
      'PNG export with metadata',
      'Share to public gallery (Coming soon)',
      'Personal & commercial use',
      'Priority support',
      'Auto-renews monthly',
    ],
  },
};

/**
 * Get tier info by tier name
 */
export function getTierInfo(tier: PricingTier): PricingTierInfo {
  return PRICING_TIERS[tier];
}

/**
 * Get credits amount for a tier
 */
export function getCreditsForTier(tier: PricingTier): number {
  return PRICING_TIERS[tier].credits;
}

/**
 * Get purchase type string for user_credits table
 */
export function getPurchaseType(tier: PricingTier): 'one_time_starter' | 'one_time_pro' | 'subscription_monthly' {
  switch (tier) {
    case 'starter_pack':
      return 'one_time_starter';
    case 'pro_pack':
      return 'one_time_pro';
    case 'pro_monthly':
      return 'subscription_monthly';
  }
}

