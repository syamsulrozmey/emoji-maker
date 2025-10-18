# Emoji Maker - Technical Architecture

Complete technical documentation of the Emoji Maker SaaS platform architecture, components, and development workflow.

**Last Updated**: October 2025

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Routes](#api-routes)
5. [Authentication & Authorization](#authentication--authorization)
6. [Payment Flow](#payment-flow)
7. [Key Components](#key-components)
8. [Development Workflow](#development-workflow)
9. [Deployment Checklist](#deployment-checklist)

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect)

### Backend
- **Runtime**: Node.js 20+
- **API**: Next.js API Routes (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (emoji images)
- **Authentication**: Clerk
- **Payments**: Stripe
- **AI Model**: Replicate (SDXL Emoji by fofr)
- **Image Processing**: Sharp

### Key Dependencies
```json
{
  "dependencies": {
    "@clerk/nextjs": "^6.33.3",
    "@supabase/supabase-js": "^2.75.0",
    "stripe": "^19.1.0",
    "@stripe/stripe-js": "^8.1.0",
    "replicate": "^1.3.0",
    "sharp": "^0.34.4",
    "svix": "^1.77.0"
  }
}
```

---

## System Architecture

### High-Level Overview

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌─────────────────┐                   ┌──────────────┐
│  Clerk Auth     │                   │   Stripe     │
│  (Sign In/Up)   │                   │  (Payments)  │
└─────────────────┘                   └──────────────┘
       │                                      │
       ▼                                      │
┌─────────────────────────────────────────────┴──────┐
│           Next.js App (Middleware)                 │
│  - Authentication Check                            │
│  - Auto Profile Creation (ensureUserProfile)       │
└────────────────────┬───────────────────────────────┘
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
   ┌────────┐  ┌─────────┐  ┌──────────┐
   │  Page  │  │   API   │  │ Webhook  │
   │ Routes │  │ Routes  │  │  Routes  │
   └────────┘  └────┬────┘  └────┬─────┘
                    │            │
       ┌────────────┼────────────┘
       ▼            ▼
   ┌──────────────────────┐
   │    Supabase DB       │
   │  - profiles          │
   │  - emojis            │
   │  - user_credits      │
   │  - folders           │
   │  - transactions      │
   └──────────────────────┘
       │
       ▼
   ┌──────────────────────┐
   │  Supabase Storage    │
   │  (Emoji Images)      │
   └──────────────────────┘
       ▲
       │
   ┌──────────────────────┐
   │   Replicate API      │
   │  (AI Generation)     │
   └──────────────────────┘
```

### Request Flow

1. **User Authentication**
   - User signs in via Clerk
   - Middleware intercepts all protected routes
   - `ensureUserProfile()` checks/creates Supabase profile
   - Request continues to destination

2. **Emoji Generation**
   - User submits prompt via `PromptInput`
   - `POST /api/generate` checks credit balance
   - Calls Replicate API with prompt
   - Downloads generated image
   - Embeds metadata using Sharp
   - Uploads to Supabase Storage
   - Saves record to `emojis` table
   - Deducts 1 credit using FIFO logic
   - Returns emoji data to client

3. **Payment Processing**
   - User clicks upgrade, selects tier
   - `POST /api/stripe/checkout` creates Checkout Session
   - User redirected to Stripe
   - User completes payment
   - Stripe sends webhook to `/api/stripe/webhook`
   - Webhook validates signature
   - Credits added to `user_credits` table
   - Transaction recorded in `stripe_transactions`
   - User redirected back to app with updated credits

---

## Database Schema

### Tables Overview

```
profiles (User accounts)
├── user_id (TEXT, PK) - Clerk user ID
├── credits (INTEGER) - Total available credits (computed from user_credits)
├── tier (TEXT) - 'free' | 'starter' | 'pro'
├── stripe_customer_id (TEXT)
├── stripe_subscription_id (TEXT)
├── subscription_status (TEXT) - 'active' | 'canceled' | 'past_due' | NULL
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

user_credits (Granular credit allocations)
├── id (UUID, PK)
├── user_id (TEXT, FK → profiles.user_id)
├── credits_allocated (INTEGER) - Original amount
├── credits_remaining (INTEGER) - Current remaining
├── purchase_type (TEXT) - 'trial' | 'starter_pack' | 'pro_pack' | 'pro_monthly'
├── stripe_payment_intent_id (TEXT)
├── expires_at (TIMESTAMP) - NULL for non-expiring
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

emojis (Generated emojis)
├── id (BIGINT, PK)
├── image_url (TEXT) - Supabase Storage URL
├── prompt (TEXT) - Generation prompt
├── likes_count (NUMERIC) - Total likes
├── creator_user_id (TEXT) - Creator's Clerk ID
├── is_public (BOOLEAN) - Future: public gallery
├── has_watermark (BOOLEAN)
├── shares_count (INTEGER)
├── credits_used (INTEGER) - Credits spent on generation
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

emoji_likes (User likes)
├── user_id (TEXT, FK → profiles.user_id)
├── emoji_id (BIGINT, FK → emojis.id)
└── PRIMARY KEY (user_id, emoji_id)

folders (User-created categories)
├── id (UUID, PK)
├── name (TEXT) - Folder name
├── user_id (TEXT) - Owner's Clerk ID
└── created_at (TIMESTAMP)

emoji_folders (Emoji-to-folder assignments)
├── id (UUID, PK)
├── emoji_id (BIGINT, FK → emojis.id ON DELETE CASCADE)
├── folder_id (UUID, FK → folders.id ON DELETE CASCADE)
├── user_id (TEXT) - Assignment owner
├── created_at (TIMESTAMP)
└── UNIQUE(emoji_id, user_id)

stripe_transactions (Payment records)
├── id (UUID, PK)
├── user_id (TEXT, FK → profiles.user_id)
├── stripe_payment_intent_id (TEXT)
├── stripe_subscription_id (TEXT)
├── amount (INTEGER) - Amount in cents
├── currency (TEXT) - 'usd'
├── status (TEXT) - 'completed' | 'pending' | 'failed'
├── credits_allocated (INTEGER)
├── purchase_type (TEXT)
├── metadata (JSONB)
└── created_at (TIMESTAMP)
```

### Key Relationships

- One user has many credit allocations (profiles → user_credits)
- One user creates many emojis (profiles → emojis)
- One user can like many emojis (profiles → emoji_likes)
- One emoji can be liked by many users (emojis → emoji_likes)
- One user has many folders (profiles → folders)
- One emoji can be in one folder per user (emojis → emoji_folders)

### Indexes

```sql
-- Performance optimization indexes
idx_user_credits_user_id
idx_user_credits_purchase_type
idx_stripe_transactions_user_id
idx_stripe_transactions_payment_id
idx_emojis_creator_user_id
idx_emojis_is_public
idx_emoji_folders_user_id
idx_emoji_folders_emoji_id
```

---

## API Routes

### Public Routes

#### POST /api/stripe/webhook
Handles Stripe webhook events (signature-verified, no auth required)

**Events Handled**:
- `checkout.session.completed` - Adds credits after one-time purchase
- `invoice.paid` - Adds credits after subscription renewal
- `customer.subscription.deleted` - Updates subscription status
- `customer.subscription.updated` - Updates subscription status

### Protected Routes (Require Authentication)

#### Emoji Generation

**POST /api/generate**
- Generates emoji from text prompt
- Requires 1 credit
- Returns: `{ success, emoji, credits }`

**GET /api/emojis**
- Fetches all emojis for current user
- Includes folder assignments and like status
- Returns: `{ success, emojis }`

**PATCH /api/emojis/[id]/folder**
- Assigns/unassigns emoji to folder
- Body: `{ folderId: string | null }`
- Returns: `{ success, folderId }`

#### Folder Management

**GET /api/folders**
- Fetches all folders for current user
- Returns: `{ success, folders }`

**POST /api/folders**
- Creates new folder
- Body: `{ name: string }`
- Returns: `{ success, folder }`

**PUT /api/folders**
- Renames folder
- Body: `{ id: string, name: string }`
- Returns: `{ success, folder }`

**DELETE /api/folders?id={id}**
- Deletes folder and emoji assignments
- Returns: `{ success }`

#### Likes

**POST /api/likes**
- Toggles like on emoji
- Body: `{ emojiId: number }`
- Returns: `{ success, isLiked, likesCount }`

#### Profile & Credits

**GET /api/profile/credits**
- Gets current credit balance and tier
- Returns: `{ success, credits, tier }`

**GET /api/profile/credit-history**
- Gets purchase history
- Returns: `{ success, history }`

**POST /api/profile/sync**
- Manual profile sync (fallback)
- Creates profile if doesn't exist
- Returns: `{ success, profile }`

#### Stripe Payment

**POST /api/stripe/checkout**
- Creates Stripe Checkout session
- Body: `{ tier: 'starter_pack' | 'pro_pack' | 'pro_monthly' }`
- Returns: `{ sessionId }`

**POST /api/stripe/portal**
- Creates Customer Portal session for subscription management
- Returns: `{ url }`

---

## Authentication & Authorization

### Clerk Integration

**Setup**:
```typescript
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**Middleware Protection**:
```typescript
// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { ensureUserProfile } from "./lib/ensure-profile";

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
    
    const { userId } = await auth();
    if (userId) {
      await ensureUserProfile(userId);
    }
  }
});
```

### Profile Auto-Creation

**Flow**:
1. User signs in/up via Clerk
2. Middleware intercepts request
3. `ensureUserProfile(userId)` checks Supabase
4. If profile doesn't exist:
   - Creates profile with `user_id`, `tier: 'free'`
   - Creates trial credit allocation (5 credits)
5. Request continues

**Implementation**:
```typescript
// lib/ensure-profile.ts
export async function ensureUserProfile(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    // Create profile
    await supabase.from('profiles').insert({ user_id: userId });
    
    // Add trial credits
    await supabase.from('user_credits').insert({
      user_id: userId,
      credits_allocated: 5,
      credits_remaining: 5,
      purchase_type: 'trial'
    });
  }
}
```

---

## Payment Flow

### Pricing Tiers

| Tier | Price | Credits | Type |
|------|-------|---------|------|
| Trial | Free | 5 | One-time |
| Starter Pack | $4.99 | 30 | One-time |
| Pro Pack | $9.99 | 75 | One-time |
| Pro Monthly | $3.99/mo | 15/month | Subscription |

### Checkout Flow

```
User clicks "Upgrade"
      ↓
Opens UpgradeModal
      ↓
Selects pricing tier
      ↓
POST /api/stripe/checkout
      ↓
Creates Checkout Session with metadata:
  - userId
  - tier
  - credits
      ↓
Redirects to Stripe Checkout
      ↓
User completes payment
      ↓
Stripe sends webhook to /api/stripe/webhook
      ↓
Webhook validates signature
      ↓
checkout.session.completed event
      ↓
Extracts metadata (userId, tier, credits)
      ↓
Creates record in user_credits table
      ↓
Creates record in stripe_transactions table
      ↓
Redirects user to app?success=true
      ↓
App polls /api/profile/credits
      ↓
Credits updated, modal closes
```

### Credit System Logic

**Credit Deduction (FIFO)**:
```typescript
// lib/credits.ts
export async function deductCredit(userId: string) {
  // Get oldest allocation with remaining credits
  const { data: allocation } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .gt('credits_remaining', 0)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (!allocation) {
    throw new Error('Insufficient credits');
  }

  // Deduct from oldest
  await supabase
    .from('user_credits')
    .update({ credits_remaining: allocation.credits_remaining - 1 })
    .eq('id', allocation.id);
}
```

**Total Credits Calculation**:
```typescript
export async function getTotalAvailableCredits(userId: string) {
  const { data } = await supabase
    .from('user_credits')
    .select('credits_remaining')
    .eq('user_id', userId);

  return data?.reduce((sum, row) => sum + row.credits_remaining, 0) || 0;
}
```

---

## Key Components

### Frontend Components

#### Header (`components/header.tsx`)
- Displays credit count
- Upgrade button
- User avatar with Clerk UserButton

#### PromptInput (`components/prompt-input.tsx`)
- Text input for emoji prompt
- Generate button with loading state
- Validates prompt before submission

#### FilterTabs (`components/filter-tabs.tsx`)
- "All" tab + custom folder tabs
- Add folder button
- Folder rename/delete actions

#### EmojiGrid (`components/emoji-grid.tsx`)
- Responsive grid layout (3-5 columns)
- Empty state when no emojis
- Renders EmojiCard components

#### EmojiCard (`components/emoji-card.tsx`)
- Displays emoji image
- Hover overlay with actions:
  - Like button
  - Download button
  - Folder assignment button
- Click to open lightbox

#### UpgradeModal (`components/upgrade-modal.tsx`)
- Displays 3 pricing tiers
- "Most Popular" badge on Pro Pack
- Redirects to Stripe Checkout
- Auto-opens when credits = 0

### Backend Utilities

#### lib/credits.ts
- `getTotalAvailableCredits(userId)` - Calculate total
- `deductCredit(userId)` - FIFO deduction
- `addCredits(userId, amount, purchaseType)` - Add allocation
- `getCreditHistory(userId)` - Purchase history

#### lib/ensure-profile.ts
- `ensureUserProfile(userId)` - Check/create profile
- Used in middleware for auto-sync

#### lib/stripe.ts
- `stripe` - Initialized Stripe client
- Used in API routes for payment operations

#### lib/pricing.ts
- Pricing tier configuration
- Price IDs mapping
- Credit amounts per tier

#### lib/supabase.ts
- `supabase` - Initialized Supabase client
- Used across all API routes

---

## Development Workflow

### Local Setup

1. **Clone and install**:
   ```bash
   git clone <repo>
   cd emoji-maker
   npm install
   ```

2. **Environment variables** (`.env.local`):
   ```env
   # Replicate
   REPLICATE_API_TOKEN=r8_xxx
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
   CLERK_SECRET_KEY=sk_test_xxx
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_xxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   STRIPE_STARTER_PACK_PRICE_ID=price_xxx
   STRIPE_PRO_PACK_PRICE_ID=price_xxx
   STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
   
   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Database setup**:
   ```bash
   # Run migrations in Supabase SQL Editor
   # 1. supabase_saas_migration.sql
   # 2. supabase_folders_schema.sql
   ```

4. **Start development**:
   ```bash
   # Terminal 1: Next.js dev server
   npm run dev
   
   # Terminal 2: Stripe webhook forwarding
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

### Development Commands

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Testing

**Manual Testing Checklist**:
- [ ] Sign up new user → Profile created in Supabase
- [ ] Check credits → Should be 5 (trial)
- [ ] Generate emoji → Credit deducted to 4
- [ ] Create folder → Folder appears in tabs
- [ ] Assign emoji to folder → Emoji moves to folder tab
- [ ] Like emoji → Like count increases
- [ ] Test payment with `4242 4242 4242 4242`
- [ ] Verify webhook → Credits added after payment
- [ ] Test subscription portal → Can manage subscription

**Stripe Test Cards**:
- Success: `4242 4242 4242 4242`
- Requires Auth: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 0002`

---

## Deployment Checklist

### Pre-Deployment

- [ ] Run database migrations in production Supabase
- [ ] Switch Stripe to live mode
- [ ] Create live Stripe products and get Price IDs
- [ ] Set up production webhook endpoint in Stripe
- [ ] Update all environment variables in hosting platform
- [ ] Test build locally: `npm run build`
- [ ] Verify no build errors or warnings

### Environment Variables (Production)

Replace all test keys with live keys:
- Stripe: `sk_live_xxx`, `pk_live_xxx`, live Price IDs
- Set production webhook secret from Stripe Dashboard
- Update `NEXT_PUBLIC_APP_URL` to production domain

### Post-Deployment

- [ ] Test user signup → profile creation
- [ ] Test emoji generation
- [ ] Test payment flow end-to-end
- [ ] Verify webhook receives events
- [ ] Test subscription renewal (wait or trigger manually)
- [ ] Monitor error logs for 24 hours
- [ ] Set up Replicate spending alerts ($5/day limit)
- [ ] Enable Stripe Radar for fraud prevention

### Recommended Hosting

- **Frontend**: Vercel (zero-config Next.js)
- **Database**: Supabase (already hosted)
- **Monitoring**: Sentry, Vercel Analytics

### Performance Optimization

- Images served via Supabase CDN (automatic)
- Static assets cached by CDN
- Database queries optimized with indexes
- Middleware runs on edge (low latency)

---

## Troubleshooting

### Common Issues

**Credits not added after payment**:
1. Check Stripe Dashboard → Webhooks → Recent events
2. Look for `checkout.session.completed` event
3. Check Response tab for errors
4. Verify webhook secret matches `.env.local`

**Profile not created on signup**:
1. Check middleware logs in terminal
2. Verify Supabase credentials in `.env.local`
3. Test manual sync: `POST /api/profile/sync`

**Emoji generation fails**:
1. Verify Replicate API token is valid
2. Check Replicate account has credits
3. Check Next.js API logs for errors
4. Verify Supabase storage bucket exists and is public

**Webhook 404 errors**:
1. Verify route file exists at `app/api/stripe/webhook/route.ts`
2. Check Next.js build logs for errors
3. Try restarting dev server
4. Verify webhook URL in Stripe Dashboard

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Replicate API Reference](https://replicate.com/docs/reference)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Document Version**: 1.0  
**Last Updated**: October 2025  
**Maintainer**: Development Team

