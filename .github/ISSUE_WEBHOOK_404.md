# Stripe Webhook Returns 404 - Credits Not Added After Payment

## Issue Summary

Stripe payments complete successfully, but the webhook endpoint returns 404 errors, preventing credits from being added to user accounts and transaction records from being saved to Supabase.

## Current Behavior

1. ✅ **Payment Flow Works**: Users can click "Upgrade", select a plan, and complete Stripe checkout
2. ✅ **Stripe Processes Payment**: Payment is successfully charged via Stripe
3. ✅ **User Redirected**: User is redirected back to app with `?success=true` parameter
4. ❌ **Webhook Returns 404**: Stripe CLI shows `404` when POSTing to `/api/stripe/webhook`
5. ❌ **Credits Not Added**: User's credit balance remains unchanged
6. ❌ **No Database Records**: No entries created in `stripe_transactions` or `user_credits` tables

## Expected Behavior

1. Stripe checkout completes ✅
2. Stripe sends `checkout.session.completed` event to webhook
3. Webhook receives event with `200` status ❌ (currently 404)
4. Credits are added to user account ❌
5. Transaction record saved to `stripe_transactions` table ❌
6. User sees updated credit balance ❌

## Technical Details

### Webhook File Location
```
app/api/stripe/webhook/route.ts
```
- File exists ✅
- Contains correct `POST` export ✅
- Code syntax is valid ✅

### Environment Configuration
```env
STRIPE_SECRET_KEY=sk_test_*** (set)
STRIPE_WEBHOOK_SECRET=whsec_*** (set)
STRIPE_*_PRICE_ID=price_*** (set)
```

### Test Results

**Browser Test:**
- Accessing `http://localhost:3000/api/stripe/webhook` returns **405 Method Not Allowed**
- This is correct (route exists, just doesn't allow GET)

**Stripe CLI Test:**
- Command: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Result: `404` errors for all events including `checkout.session.completed`

**Sample Log:**
```
2025-10-15 23:26:00   --> checkout.session.completed [evt_xxx]
2025-10-15 23:26:01  <--  [404] POST http://localhost:3000/api/stripe/webhook
```

## Attempted Solutions

1. ✅ Deleted `.next` folder and restarted dev server
2. ✅ Restarted Stripe CLI listener
3. ✅ Verified port consistency (all on 3000)
4. ✅ Confirmed webhook file exists with correct exports
5. ✅ Verified environment variables are set
6. ❌ Issue persists

## Intermittent Success

- Manual test trigger from Stripe Dashboard showed **one successful receipt** of `invoice_payment.paid` event
- Suggests route CAN work but isn't consistently available
- May be related to Next.js route registration timing

## Impact

**High Priority** - Blocking core monetization functionality:
- Users cannot purchase credits
- No revenue can be collected
- Trial users cannot upgrade
- Subscription renewals won't work

## Reproduction Steps

1. Start dev server: `npm run dev` (on port 3000)
2. Start Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Open app at `http://localhost:3000`
4. Click "Upgrade" and select any plan
5. Complete checkout with test card `4242 4242 4242 4242`
6. Observe Stripe CLI shows 404 errors
7. Check user credits - no change
8. Check Supabase tables - no new records

## Potential Root Causes

### Theory 1: Next.js Route Registration Issue
- Route file exists but Next.js doesn't register it consistently
- May be related to hot module replacement (HMR) timing
- Could be App Router caching issue

### Theory 2: Port Mismatch
- Initially had issue with port 3001 vs 3000
- Now consistent on 3000 but problem persists
- May need hard server restart

### Theory 3: File System / Build Issue
- Route file might not be compiled correctly
- Could be TypeScript compilation issue
- May need fresh `node_modules` install

### Theory 4: Webhook Signature Verification
- Route might be rejecting requests before logging
- Stripe CLI signature might not match expected format
- Need to check server logs for signature errors

## Next Steps to Debug

1. **Check Next.js Server Logs**
   - Look for any error messages when webhook is called
   - Check for signature verification failures
   - Look for import/compilation errors

2. **Add Debug Logging**
   - Add console.log at very start of webhook POST function
   - Confirm function is actually being called
   - Log signature and body for debugging

3. **Try Alternative Route Structure**
   - Test with simple endpoint first (no Stripe verification)
   - If works, add Stripe logic incrementally
   - Helps isolate where problem occurs

4. **Nuclear Option: Clean Reinstall**
   ```bash
   rm -rf node_modules .next
   npm install
   npm run dev
   ```

5. **Test with Production Webhook** (if local fails)
   - Deploy to Vercel/production environment
   - Configure actual webhook URL in Stripe Dashboard
   - Test in production environment

## Related Files

- `app/api/stripe/webhook/route.ts` - Webhook handler
- `lib/credits.ts` - Credit management functions
- `lib/stripe.ts` - Stripe client initialization
- `supabase_saas_migration.sql` - Database schema with required tables
- `.env.local` - Environment configuration

## System Information

- **OS**: macOS
- **Node**: v18+ (assumed)
- **Next.js**: 15.5.4
- **Stripe Package**: Latest
- **Dev Server Port**: 3000
- **Stripe CLI**: Installed and authenticated

## Success Criteria

- [ ] Stripe CLI shows `200 OK` for webhook events
- [ ] Credits added to user account after payment
- [ ] Transaction record created in `stripe_transactions` table
- [ ] User credit record created in `user_credits` table
- [ ] User sees updated credit count in UI
- [ ] No 404 errors in Stripe CLI output

---

**Created**: 2025-10-15  
**Branch**: `fix/stripe-webhook-404`  
**Priority**: High  
**Status**: In Progress

