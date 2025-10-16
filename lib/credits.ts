import { supabase, supabaseAdmin } from './supabase';

/**
 * Credit Management Utility
 * Handles all credit-related operations for the SaaS system
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

/**
 * Get total available credits for a user across all purchases
 * Sums up all credits_remaining from user_credits table
 * 
 * @param userId - The user's ID from Clerk
 * @returns Total available credits
 */
export async function getTotalAvailableCredits(userId: string): Promise<number> {
  try {
    // Fetch all credit allocations for user
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('credits_remaining')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user credits:', error);
      throw new Error(`Failed to fetch credits: ${error.message}`);
    }

    if (!credits || credits.length === 0) {
      return 0;
    }

    // Sum up all remaining credits
    const totalCredits = credits.reduce((sum, credit) => sum + credit.credits_remaining, 0);
    return totalCredits;
  } catch (error) {
    console.error('Error in getTotalAvailableCredits:', error);
    throw error;
  }
}

/**
 * Deduct one credit from user's account
 * Prioritizes oldest purchases first (FIFO)
 * Updates both user_credits and profiles tables
 * 
 * @param userId - The user's ID from Clerk
 * @returns New total credit balance after deduction
 */
export async function deductCredit(userId: string): Promise<number> {
  try {
    // Fetch user's credit allocations, oldest first
    const { data: credits, error: fetchError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .gt('credits_remaining', 0)
      .order('purchase_date', { ascending: true });

    if (fetchError) {
      console.error('Error fetching user credits for deduction:', fetchError);
      throw new Error(`Failed to fetch credits: ${fetchError.message}`);
    }

    if (!credits || credits.length === 0) {
      throw new Error('No credits available to deduct');
    }

    // Deduct from the oldest credit allocation (FIFO)
    const oldestCredit = credits[0];
    const newRemainingForOldest = oldestCredit.credits_remaining - 1;

    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ credits_remaining: newRemainingForOldest })
      .eq('id', oldestCredit.id);

    if (updateError) {
      console.error('Error updating user_credits:', updateError);
      throw new Error(`Failed to deduct credit: ${updateError.message}`);
    }

    // Calculate new total credits
    const newTotal = await getTotalAvailableCredits(userId);

    // Update profiles table with new total
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ credits: newTotal })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error updating profile credits:', profileError);
      // Continue anyway - user_credits is the source of truth
    }

    console.log(`✅ Credit deducted for user ${userId}. New balance: ${newTotal}`);
    return newTotal;
  } catch (error) {
    console.error('Error in deductCredit:', error);
    throw error;
  }
}

/**
 * Add credits to user's account
 * Creates new credit allocation record and updates profile total
 * 
 * @param userId - The user's ID from Clerk
 * @param amount - Number of credits to add
 * @param purchaseType - Type of purchase ('trial', 'one_time_starter', etc.)
 * @param stripePaymentId - Optional Stripe payment ID for tracking
 * @param stripeSubscriptionId - Optional Stripe subscription ID for recurring payments
 * @param bypassRLS - If true, uses admin client to bypass RLS (for webhooks)
 * @returns New total credit balance
 */
export async function addCredits(
  userId: string,
  amount: number,
  purchaseType: 'trial' | 'one_time_starter' | 'one_time_pro' | 'subscription_monthly',
  stripePaymentId?: string,
  stripeSubscriptionId?: string,
  bypassRLS: boolean = false
): Promise<number> {
  try {
    // Use admin client if bypassing RLS (webhooks), otherwise use regular client
    const client = bypassRLS ? supabaseAdmin : supabase;

    // Create new credit allocation
    const { error: insertError } = await client
      .from('user_credits')
      .insert({
        user_id: userId,
        credits_allocated: amount,
        credits_remaining: amount,
        purchase_type: purchaseType,
        stripe_payment_id: stripePaymentId,
        stripe_subscription_id: stripeSubscriptionId,
        expiry_date: null, // No expiry for any tier in current system
      });

    if (insertError) {
      console.error('Error inserting user credits:', insertError);
      throw new Error(`Failed to add credits: ${insertError.message}`);
    }

    // Calculate new total
    const newTotal = await getTotalAvailableCredits(userId);

    // Update profiles table with new total
    const { error: profileError } = await client
      .from('profiles')
      .update({ credits: newTotal })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error updating profile credits:', profileError);
      // Continue anyway - user_credits is the source of truth
    }

    console.log(`✅ ${amount} credits added for user ${userId}. New balance: ${newTotal}`);
    return newTotal;
  } catch (error) {
    console.error('Error in addCredits:', error);
    throw error;
  }
}

/**
 * Get detailed credit history for a user
 * Returns all credit allocations with purchase information
 * 
 * @param userId - The user's ID from Clerk
 * @returns Array of credit allocation records
 */
export async function getCreditHistory(userId: string): Promise<UserCredit[]> {
  try {
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false });

    if (error) {
      console.error('Error fetching credit history:', error);
      throw new Error(`Failed to fetch credit history: ${error.message}`);
    }

    return credits || [];
  } catch (error) {
    console.error('Error in getCreditHistory:', error);
    throw error;
  }
}

