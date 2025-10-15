# Stripe Setup Guide

Complete guide for setting up Stripe payment integration for Emoji Maker SaaS.

## Prerequisites

- A Stripe account (sign up at https://stripe.com)
- Admin access to your Stripe Dashboard
- Local development environment set up

---

## Step 1: Get Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Click on **Developers** in the left sidebar
3. Go to **API keys** section
4. Copy your **Publishable key** (starts with `pk_test_`)
5. Click **Reveal test key** and copy your **Secret key** (starts with `sk_test_`)

Add these to your `.env.local` file:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

---

## Step 2: Create Products and Prices

### Create Products

1. In Stripe Dashboard, go to **Product catalog**
2. Click **+ Add product**

Create these three products:

#### Product 1: Starter Pack
- **Name:** Starter Pack
- **Description:** 30 emoji generation credits
- **Pricing:**
  - Type: **One time**
  - Price: **$4.99 USD**
  - Billing period: One time
- Click **Save product**
- Copy the **Price ID** (starts with `price_`)

#### Product 2: Pro Pack
- **Name:** Pro Pack
- **Description:** 75 emoji generation credits with advanced features
- **Pricing:**
  - Type: **One time**
  - Price: **$9.99 USD**
  - Billing period: One time
- Click **Save product**
- Copy the **Price ID**

#### Product 3: Pro Monthly
- **Name:** Pro Monthly Subscription
- **Description:** 15 credits per month, auto-renewing
- **Pricing:**
  - Type: **Recurring**
  - Price: **$3.99 USD**
  - Billing period: **Monthly**
- Click **Save product**
- Copy the **Price ID**

### Add Price IDs to Environment

Add the price IDs to your `.env.local`:

```env
STRIPE_STARTER_PACK_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_PACK_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
```

---

## Step 3: Set Up Webhooks

Webhooks allow Stripe to notify your app when payments are completed.

### Using Stripe CLI (Development)

1. **Install Stripe CLI:**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows (using Scoop)
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe
   
   # Linux
   # Download from https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`) and add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Using Stripe Dashboard (Production)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. **Endpoint URL:** `https://yourdomain.com/api/stripe/webhook`
4. **Events to send:** Select these events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Click **Add endpoint**
6. Copy the **Signing secret** and add to your production environment variables

---

## Step 4: Test Payment Flow

### Test the Checkout Process

1. Start your development server:
   ```bash
   npm run dev
   ```

2. In another terminal, start Stripe webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. Open your app in a browser: `http://localhost:3000`

4. Click **Upgrade** button to open the pricing modal

5. Click **Select Plan** on any tier

6. You'll be redirected to Stripe Checkout

7. Use Stripe test card numbers:
   - **Success:** `4242 4242 4242 4242`
   - **Requires authentication:** `4000 0025 0000 3155`
   - **Declined:** `4000 0000 0000 0002`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

8. Complete the payment

9. You should be redirected back to your app with credits added

### Verify in Stripe Dashboard

1. Go to **Payments** → **All transactions**
2. You should see your test payment
3. Check **Customers** to see the created customer record

---

## Step 5: Database Verification

After a successful test payment, verify in Supabase:

1. Check `stripe_transactions` table:
   - Should have a new row with payment details
   - `status` should be `completed`

2. Check `user_credits` table:
   - Should have a new credit allocation
   - `purchase_type` should match the tier purchased

3. Check `profiles` table:
   - `credits` should be updated
   - `stripe_customer_id` should be populated

---

## Step 6: Production Deployment

### Before Going Live

1. **Switch to Live Mode in Stripe Dashboard**
   - Toggle from Test to Live mode in the top-right

2. **Get Live API Keys**
   - Go to **Developers** → **API keys**
   - Copy your **Live** publishable and secret keys

3. **Update Live Environment Variables**
   ```env
   STRIPE_SECRET_KEY=sk_live_your_live_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
   ```

4. **Get Live Price IDs**
   - Create products in Live mode (same as Step 2)
   - Update price IDs in production environment

5. **Create Live Webhook**
   - Follow "Using Stripe Dashboard (Production)" steps above
   - Use your production URL

6. **Enable Payment Methods**
   - In Stripe Dashboard, go to **Settings** → **Payment methods**
   - Enable: Cards, Apple Pay, Google Pay

7. **Configure Tax Settings (if applicable)**
   - Go to **Settings** → **Tax**
   - Configure based on your business location

---

## Step 7: Monitor Payments

### Stripe Dashboard

- Monitor payments: **Payments** → **All transactions**
- View customers: **Customers**
- Check subscriptions: **Subscriptions**
- Review disputes: **Disputes**

### Your App

- Monitor Replicate spend to stay within $5/day budget
- Track conversion rates in `stripe_transactions` table
- Watch for failed webhooks in logs

---

## Troubleshooting

### Webhook Not Receiving Events

1. Check Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
2. Verify webhook secret in `.env.local` matches CLI output
3. Check Next.js server logs for errors
4. Ensure webhook endpoint is accessible: `POST /api/stripe/webhook`

### Credits Not Added After Payment

1. Check Stripe Dashboard → Webhooks → Recent events
2. Look for `checkout.session.completed` event
3. Click on the event and check **Response** tab for errors
4. Verify metadata is included in checkout session (userId, tier, credits)
5. Check Supabase logs for database errors

### Checkout Session Creation Fails

1. Verify all price IDs are correct in `.env.local`
2. Check that products are active in Stripe Dashboard
3. Ensure Stripe API keys are valid
4. Check server logs for detailed error messages

### Subscription Not Renewing

1. Verify `invoice.paid` webhook is configured
2. Check that subscription has correct metadata (userId)
3. Ensure customer has valid payment method
4. Review failed invoices in Stripe Dashboard

---

## Security Best Practices

1. **Never commit `.env.local` to version control**
   - Add to `.gitignore`

2. **Always verify webhook signatures**
   - Already implemented in `/api/stripe/webhook/route.ts`

3. **Use HTTPS in production**
   - Required for webhooks and secure payment processing

4. **Keep API keys secure**
   - Store in environment variables only
   - Rotate keys if compromised

5. **Enable Stripe Radar**
   - Helps prevent fraudulent transactions
   - Available in Stripe Dashboard → Radar

---

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Testing Stripe](https://stripe.com/docs/testing)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Stripe Dashboard](https://dashboard.stripe.com)

---

## Support

If you encounter issues:

1. Check [Stripe Documentation](https://stripe.com/docs)
2. Review Stripe Dashboard logs
3. Check your application logs
4. Contact Stripe Support for payment-related issues

