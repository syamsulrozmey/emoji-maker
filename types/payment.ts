/**
 * Payment and transaction type definitions
 * Used for Stripe integration and credit tracking
 */

export interface UserCredit {
  id: string;
  user_id: string;
  credits_allocated: number;
  credits_remaining: number;
  purchase_type: 'trial' | 'one_time_starter' | 'one_time_pro' | 'subscription_monthly';
  purchase_date: string;
  expiry_date: string | null;
  stripe_payment_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
}

export interface StripeTransaction {
  id: string;
  user_id: string;
  stripe_payment_id: string;
  stripe_customer_id?: string;
  tier_purchased: 'starter_pack' | 'pro_pack' | 'pro_monthly';
  amount_usd: number;
  credits_granted: number;
  status: 'completed' | 'failed' | 'pending' | 'refunded';
  created_at: string;
}

export type PricingTier = 'starter_pack' | 'pro_pack' | 'pro_monthly';

export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired';

export interface Profile {
  user_id: string;
  credits: number;
  tier: 'free' | 'pro';
  subscription_status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

