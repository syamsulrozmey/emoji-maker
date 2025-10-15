-- ============================================================
-- EMOJI SAAS MIGRATION - Credit System & Stripe Integration
-- ============================================================
-- Run this in your Supabase SQL Editor to migrate from daily
-- refresh system to one-time trial + paid tier system
--
-- This migration:
-- 1. Adds new fields to emojis table for public gallery (future)
-- 2. Creates user_credits table for granular credit tracking
-- 3. Creates stripe_transactions table for payment records
-- 4. Updates profiles table structure
-- 5. Migrates existing users to trial credit system
-- ============================================================

-- ============================================================
-- 1. UPDATE EMOJIS TABLE
-- ============================================================
-- Add new fields for future public gallery and metadata
ALTER TABLE emojis 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_watermark BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 1;

-- ============================================================
-- 2. CREATE USER_CREDITS TABLE
-- ============================================================
-- Tracks all credit allocations (trial, one-time purchases, subscriptions)
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  credits_allocated INTEGER NOT NULL,
  credits_remaining INTEGER NOT NULL,
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('trial', 'one_time_starter', 'one_time_pro', 'subscription_monthly')),
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  stripe_payment_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. CREATE STRIPE_TRANSACTIONS TABLE
-- ============================================================
-- Records all Stripe payment transactions
CREATE TABLE IF NOT EXISTS stripe_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  stripe_payment_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  tier_purchased TEXT NOT NULL CHECK (tier_purchased IN ('starter_pack', 'pro_pack', 'pro_monthly')),
  amount_usd NUMERIC(10,2) NOT NULL,
  credits_granted INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'pending', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. UPDATE PROFILES TABLE
-- ============================================================
-- Remove daily reset tracking and add subscription status
ALTER TABLE profiles DROP COLUMN IF EXISTS last_credit_reset;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired'));

-- Update existing users to have trial status
UPDATE profiles SET subscription_status = 'trial' WHERE subscription_status IS NULL;

-- ============================================================
-- 5. MIGRATE EXISTING USERS
-- ============================================================
-- Give existing users their 5 trial credits in the new system
-- Uses GREATEST to ensure no negative credits
INSERT INTO user_credits (user_id, credits_allocated, credits_remaining, purchase_type)
SELECT user_id, 5, GREATEST(credits, 0), 'trial'
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM user_credits WHERE user_credits.user_id = profiles.user_id
);

-- ============================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_purchase_type ON user_credits(purchase_type);
CREATE INDEX IF NOT EXISTS idx_stripe_transactions_user_id ON stripe_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_transactions_payment_id ON stripe_transactions(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_emojis_is_public ON emojis(is_public);

-- ============================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_credits
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;
CREATE POLICY "Users can view their own credits" ON user_credits
  FOR SELECT USING (true);

-- RLS Policies for stripe_transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON stripe_transactions;
CREATE POLICY "Users can view their own transactions" ON stripe_transactions
  FOR SELECT USING (true);

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Next steps:
-- 1. Deploy updated application code with new credit logic
-- 2. Configure Stripe integration (API keys, webhooks)
-- 3. Test credit deduction and purchase flows
-- ============================================================

