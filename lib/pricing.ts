/**
 * Pricing configuration for Emoji SaaS
 * Maps tier names to Stripe price IDs and feature details
 */

export type PricingTier = 'starter_pack' | 'pro_pack' | 'pro_monthly';

export interface Feature {
  id: string;
  label: string;
  available: boolean;
  eta?: string;
  status?: 'planned' | 'in_development' | 'coming_soon';
  roadmapLink?: string;
}

export interface PricingTierInfo {
  name: string;
  price: number;
  credits: number;
  priceId: string;
  features: Feature[];
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
      {
        id: 'starter_credits',
        label: '30 credits',
        available: true,
      },
      {
        id: 'png_export',
        label: 'PNG export with metadata',
        available: true,
      },
      {
        id: 'public_gallery_share',
        label: 'Share to public gallery',
        available: false,
        status: 'coming_soon',
        eta: 'Q1 2026',
      },
      {
        id: 'commercial_use',
        label: 'Personal & commercial use',
        available: true,
      },
      {
        id: 'priority_email_support',
        label: 'Priority email support',
        available: true,
      },
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
      {
        id: 'pro_credits',
        label: '75 credits',
        available: true,
      },
      {
        id: 'png_export',
        label: 'PNG export with metadata',
        available: true,
      },
      {
        id: 'batch_generation',
        label: 'Batch generation (3-5 variations)',
        available: false,
        status: 'in_development',
        eta: 'Q1 2026',
      },
      {
        id: 'public_gallery_analytics',
        label: 'Public gallery with analytics',
        available: false,
        status: 'coming_soon',
        eta: 'Q2 2026',
      },
      {
        id: 'custom_prompt_library',
        label: 'Custom style/prompt library (10 saved)',
        available: false,
        status: 'planned',
        eta: 'Q2 2026',
      },
      {
        id: 'commercial_use',
        label: 'Personal & commercial use',
        available: true,
      },
      {
        id: 'priority_support',
        label: 'Priority support',
        available: true,
      },
    ],
  },
  pro_monthly: {
    name: 'Pro Monthly',
    price: 3.99,
    credits: 15,
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    type: 'subscription',
    features: [
      {
        id: 'monthly_credits',
        label: '15 credits per month',
        available: true,
      },
      {
        id: 'png_export',
        label: 'PNG export with metadata',
        available: true,
      },
      {
        id: 'batch_generation',
        label: 'Batch generation (3-5 variations)',
        available: false,
        status: 'coming_soon',
        eta: 'Q1 2026',
      },
      {
        id: 'public_gallery_analytics',
        label: 'Public gallery with analytics',
        available: false,
        status: 'coming_soon',
        eta: 'Q2 2026',
      },
      {
        id: 'custom_prompt_library',
        label: 'Custom style/prompt library (10 saved)',
        available: false,
        status: 'coming_soon',
        eta: 'Q2 2026',
      },
      {
        id: 'public_gallery_share',
        label: 'Share to public gallery',
        available: false,
        status: 'coming_soon',
        eta: 'Q1 2026',
      },
      {
        id: 'commercial_use',
        label: 'Personal & commercial use',
        available: true,
      },
      {
        id: 'priority_support',
        label: 'Priority support',
        available: true,
      },
      {
        id: 'auto_renews',
        label: 'Auto-renews monthly',
        available: true,
      },
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

