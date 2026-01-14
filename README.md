# CiteDeck

Turn your lecture slides into source-cited flashcards in minutes.

## Overview

CiteDeck is a post-class study asset generator that transforms uploaded course materials (PDFs + pasted text) into source-cited study guides and Anki/Quizlet-ready decks, with a fast "Fix in 10 seconds" correction loop.

## Features

- **Anonymous First**: Try the core experience without signup (3-5 minutes of free use)
- **Source Citations**: Every card links back to [Source p.X] references
- **Quick Fixes**: Flag incorrect cards and regenerate in 10 seconds
- **Export Anywhere**: Download as Anki TSV or Quizlet CSV
- **AI-Powered**: Uses OpenAI for generation with graceful fallback

## File Structure

```
lecture-voice-notes/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Tailwind styles
│   ├── app/page.tsx                # Anonymous app flow
│   ├── auth/page.tsx               # Login/signup
│   ├── dashboard/page.tsx          # User dashboard
│   ├── courses/
│   │   ├── new/page.tsx            # Create course
│   │   └── [id]/
│   │       ├── page.tsx            # Course details
│   │       └── packs/new/page.tsx  # Create pack
│   ├── packs/[id]/page.tsx         # Pack view with cards
│   ├── account/page.tsx            # Account settings
│   ├── pricing/page.tsx            # Pricing page
│   └── api/
│       ├── auth/
│       │   ├── migrate/route.ts    # Migrate localStorage data
│       │   └── signout/route.ts    # Sign out
│       ├── packs/
│       │   ├── preview/route.ts    # Generate preview (no auth)
│       │   └── [packId]/generate/route.ts
│       ├── cards/[cardId]/regenerate/route.ts
│       ├── exports/[packId]/route.ts
│       └── stripe/
│           ├── checkout/route.ts   # Create checkout session
│           └── webhook/route.ts    # Stripe webhook handler
├── components/
│   ├── CitationModal.tsx           # Citation popup
│   ├── FlashCard.tsx               # Card component
│   ├── SavePromptBanner.tsx        # Sign-up prompt
│   └── StudyGuide.tsx              # Guide renderer
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client
│   │   └── middleware.ts           # Auth middleware
│   ├── stripe.ts                   # Stripe helpers
│   ├── openai.ts                   # AI generation
│   ├── citations.ts                # Citation utilities
│   ├── exporters.ts                # Anki/Quizlet export
│   ├── localStorage.ts             # Anonymous data storage
│   └── env.ts                      # Environment helpers
├── supabase/
│   ├── schema.sql                  # Database schema
│   └── rls.sql                     # Row-level security
├── middleware.ts                   # Next.js middleware
└── package.json
```

## Database Schema

### Tables

- `profiles` - User profiles linked to auth.users
- `courses` - User courses (name, term, exam_date)
- `study_packs` - Study packs within courses
- `documents` - Uploaded/pasted materials
- `document_pages` - Page-level text extraction
- `chunks` - Text chunks with embeddings (pgvector)
- `study_guides` - Generated study guides
- `cards` - Flashcards with citations
- `card_feedback` - User corrections
- `exports` - Export history
- `subscriptions` - Stripe subscription tracking
- `purchases` - One-time purchase records

### Functions

- `match_chunks(pack_id, query_embedding, match_count)` - Vector similarity search
- `handle_new_user()` - Auto-create profile on signup

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/migrate` | POST | Migrate localStorage to Supabase |
| `/api/auth/signout` | POST | Sign out user |
| `/api/packs/preview` | POST | Generate 10-card preview (no auth) |
| `/api/packs/[packId]/generate` | POST | Generate full pack (auth) |
| `/api/cards/[cardId]/regenerate` | POST | Regenerate single card (auth) |
| `/api/exports/[packId]` | POST | Export to Anki/Quizlet |
| `/api/stripe/checkout` | POST | Create checkout session |
| `/api/stripe/webhook` | POST | Handle Stripe events |

## Environment Variables

### Required (from shared Vercel team)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `STRIPE_SECRET_KEY` | Stripe secret key (server only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret (optional) |
| `DATABASE_URL` | Direct database connection |

### Project-specific (need setup)

| Variable | Purpose | Feature |
|----------|---------|---------|
| `NEXT_PUBLIC_STRIPE_EXAM_PACK_PRICE_ID` | Stripe price ID for Exam Pack | Enables purchase button |
| `OPENAI_API_KEY` | OpenAI API key | AI generation (optional - has fallback) |

### Set by default

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://lecture-voice-notes.vercel.app` |

## Graceful Fallbacks

- **No Supabase**: App shows setup required message; anonymous mode still works
- **No Stripe**: Purchase buttons hidden; "Upgrades unavailable" message
- **No OpenAI**: Uses deterministic key-term extraction fallback
- **No price ID**: Hides upgrade prompts entirely

## Setup

1. Clone and install:
```bash
git clone https://github.com/your-username/lecture-voice-notes
cd lecture-voice-notes
npm install
```

2. Set up environment variables (copy `.env.local.example` to `.env.local`)

3. Run database migrations:
```bash
# Using Supabase CLI
supabase db push

# Or manually run supabase/schema.sql and supabase/rls.sql
```

4. Start development server:
```bash
npm run dev
```

## Deployment

The app is configured for Vercel deployment:

```bash
npx vercel --prod
```

Stripe webhook URL: `https://lecture-voice-notes.vercel.app/api/stripe/webhook`

## Services Status

### ACTIVE (using from available list)
- Supabase (Auth, Database, Storage)
- Stripe (Payments)

### INACTIVE (needs setup)
- `NEXT_PUBLIC_STRIPE_EXAM_PACK_PRICE_ID` - Create a product/price in Stripe Dashboard
- `OPENAI_API_KEY` - Optional, enables AI-powered generation
