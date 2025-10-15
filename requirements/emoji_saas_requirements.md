# Emoji SaaS - Detailed Requirements & Implementation Specs

## Project Context
- **API Provider:** Replicate (image generation)
- **Database:** Supabase
- **Auth:** Clerk
- **Payment:** Stripe
- **Budget Constraint:** $5/day Replicate spend limit (~130 new trial users/day at $0.0375 per user)

---

## 1. Tier Structure & Features

### Tier 1: Free Trial
**Allocation:** 5 credits (one-time, non-renewing)
**Cost to absorb:** $0.0375 per user
**Features:**
- Generate emojis with prompt input
- View generated emoji on dashboard
- Personal and commercial use allowed
- Cannot share to public gallery
- PNG export only (with metadata embedded)
- View other users' public gallery (read-only)

**User Flow:**
- New user via Clerk signup
- Automatically assigned 5 trial credits
- Credits tracked in `user_credits` table with `purchase_type: 'trial'`
- One-time assignment, no refresh or expiry

---

### Tier 2: One-Time Purchases

#### Tier 2A: Starter Pack
**Price:** $4.99
**Credits:** 30 credits (non-expiring)
**Features:**
- Personal and commercial use allowed
- PNG export with metadata
- Share emojis to public gallery
- Basic analytics (view count, like count)
- Priority email support

---

#### Tier 2B: Pro Pack
**Price:** $9.99
**Credits:** 75 credits (non-expiring)
**Features:**
- Personal and commercial use allowed
- PNG export with metadata
- Batch generation (generate 3-5 variations per prompt)
- Public gallery with full analytics
- Custom style/prompt saved library (max 10 saved)
- Priority support

---

### Tier 3: Recurring Subscription

#### Tier 3A: Pro Monthly
**Price:** $3.99/month
**Credits:** 15 credits per month (resets on billing date)
**Features:**
- Personal and commercial use allowed
- PNG export with metadata
- Share to public gallery
- Priority support
- Auto-renews monthly via Stripe

---

## 2. Database Schema Requirements

### users table (Clerk integration)
```
user_id (primary key, from Clerk)
email
created_at
subscription_status (active, cancelled, trial)
```

### user_credits table
```
id (primary key)
user_id (foreign key)
credits_allocated (integer)
credits_remaining (integer)
purchase_type ('trial' | 'one-time' | 'recurring')
purchase_date
expiry_date (null for non-expiring)
order_id (reference to Stripe order if applicable)
```

### emoji_generations table
```
id (primary key)
user_id (foreign key)
prompt (text)
image_url (string, stored on Supabase storage)
has_watermark (boolean)
created_at
shares_count
likes_count
is_public (boolean)
credits_used (integer, typically 1)
```

### stripe_transactions table
```
id (primary key)
user_id (foreign key)
stripe_payment_id
tier_purchased ('starter_pack' | 'pro_pack' | 'pro_monthly')
amount_usd
status ('completed' | 'failed' | 'pending')
created_at
```

---

## 3. Feature Implementation Checklist

### Authentication & Onboarding
- [ ] Clerk integration for signup/login
- [ ] Auto-assign 5 trial credits on signup
- [ ] Dashboard landing page post-login
- [ ] Credit balance display (persistent across pages)

### Core Generation
- [ ] Prompt input form
- [ ] Validate prompt (min 5 chars, max 500 chars)
- [ ] Deduct 1 credit per generation from `user_credits.credits_remaining`
- [ ] Check credit balance before allowing generation (block if 0)
- [ ] Send prompt to Replicate API
- [ ] Store image URL in `emoji_generations` table
- [ ] Embed PNG metadata (prompt, author, date, platform URL)
- [ ] Display generated emoji on dashboard with timestamp

### Payment Integration (Stripe)
- [ ] Stripe account setup
- [ ] One-time purchase flow for Starter ($4.99) and Pro ($9.99) packs
- [ ] Recurring subscription flow for Pro Monthly ($3.99/month)
- [ ] Payment success/failure handling
- [ ] Webhook listener for Stripe events (payment completed, subscription renewal)
- [ ] Update `user_credits` table on successful payment
- [ ] Add order record to `stripe_transactions`

### Public Gallery
- [ ] List all public emoji_generations (is_public = true)
- [ ] Display: emoji image, author name, like count, comment option
- [ ] Individual emoji detail page with prompt displayed and metadata visible
- [ ] Like/unlike functionality with count persistence
- [ ] Share button (generate shareable link)
- [ ] All public gallery emojis include embedded metadata for attribution

### Paywall Logic
- [ ] If user has 0 credits: show upgrade modal
- [ ] Upgrade modal shows Starter/Pro packs with pricing
- [ ] Free trial users cannot access public gallery sharing
- [ ] All outputs are PNG format with embedded metadata

### Monitoring & Budget
- [ ] Dashboard to track daily Replicate spend
- [ ] Alert when approaching $5/day limit
- [ ] Manual cutoff mechanism if budget exceeded

---

## 4. Cost Breakdown Per User

| Tier | Cost to you | Your margin |
|------|------------|------------|
| Free Trial (5 credits) | $0.0375 | You absorb |
| Starter Pack ($4.99, 30 credits) | $0.225 API + ~$0.30 Stripe fees | ~$4.44 |
| Pro Pack ($9.99, 75 credits) | $0.5625 API + ~$0.60 Stripe fees | ~$8.83 |
| Pro Monthly ($3.99, 15 credits) | $0.1125 API + ~$0.20 monthly platform | ~$3.68 |

---

## 5. Success Metrics to Track

- **Signup to first generation:** Time to value
- **Free trial conversion:** % of trial users upgrading within 7 days
- **One-time vs recurring:** Which tier converts better
- **Daily active users:** DAU growth
- **Credit burn rate:** Average credits used per user per day
- **Public gallery engagement:** Likes, shares, repeat visits
- **Stripe metrics:** Failed payments, subscription churn rate

---

## 6. Launch Rollout Plan

### Phase 1: Internal Testing
- Deploy with live Replicate/Stripe sandbox
- Test 5-10 users with real payment flow
- Validate credit deduction logic
- Monitor Replicate spend tracking

### Phase 2: Beta Launch (20-50 users)
- Invite early testers via email/personal network
- Track conversion metrics
- Gather feedback on pricing/features
- Adjust if needed

### Phase 3: Public Launch
- Release publicly when confident in payment flow
- Monitor $5/day budget closely
- Scale incrementally based on cost/conversion ratio

---

## 7. Technical Notes

- Store Replicate API responses with metadata for potential future caching
- Implement rate limiting on generation endpoint (max 5 requests per 60 seconds per user)
- Use Supabase RLS (Row Level Security) to ensure users only see their own credits
- **PNG Metadata Embedding:** Use Sharp.js to embed metadata in all PNG outputs before upload to Supabase
  - Include: original prompt, author username, generation date, license info, app URL
  - Implementation example:
    ```javascript
    const sharp = require('sharp');
    
    sharp(buffer)
      .withMetadata({
        exif: {
          IFD0: {
            ImageDescription: `Prompt: ${prompt}`,
            Copyright: `Created by ${username}`,
            Software: 'Emoji SaaS',
            UserComment: `License: Personal & Commercial Use`
          }
        }
      })
      .toBuffer()
    ```
  - Metadata travels with the PNG file, providing backlink to your platform when shared
- Webhook security: validate all Stripe webhook signatures before processing
