Bid — Functional Requirements Document (FRD)
Project Type: Hackathon Demo (Functional MVP, not just presentational) Track: Best App for Business Finance + Best Gemini Hack Version: 0.4 Last Updated: April 26, 2026

1. Overview
Bid gives small business owners the same access to federal contracts that defense primes and consultancy firms already have. Owners describe their business in plain English; the platform surfaces currently open federal opportunities they qualify for, helps them draft tailored proposal responses, and shows them real intelligence about who wins similar contracts and what those contracts pay — data that paid GovCon platforms charge $20K/year for.
This document scopes the hackathon MVP. The bias is toward real, working features over visual mockups. The opportunity feed is powered by the live SAM.gov Get Opportunities Public API. Award Intelligence (median award, award velocity, profile fit, frequent winners) is computed from the live USAspending.gov API. Every AI-generated artifact (NAICS classification, plain-English summary, proposal draft, capability statement) is produced by live Google Gemini API calls, cached to keep the demo fast. HUBZone determination uses the real SBA HUBZone API. The only stubs are user authentication, persistent storage beyond a session, and final SAM.gov submission (a link-out by design, not a fake).

2. The Problem We're Solving
The federal government is required by law to award at least 23% of all contracting dollars (~$180B/year) to small businesses. Subgoals reserve specific portions for women-owned (WOSB), veteran-owned (SDVOSB), HUBZone, and economically disadvantaged (8(a)) firms. The simplified acquisition threshold (≤$250K) was designed so small businesses could win contracts without overwhelming procurement overhead.
But 75% of all federal small-business dollars flow to the same ~5% of registered firms. The rest of the $180B is left on the table by businesses that don't know they qualify, can't navigate SAM.gov, have never heard of a capability statement, and have no idea what a competitive bid for a given contract looks like. Bid closes that gap on all four fronts.

3. Real vs. Stubbed (the honesty audit)
What is real and live
✅ SAM.gov feed — live API, real opportunities updated every minute
✅ NAICS code suggestion — live Gemini call analyzing user's business description
✅ HUBZone determination — live SBA HUBZone API call from user's address
✅ Plain-English opportunity summary — live Gemini call on each opportunity's full text
✅ Proposal draft generation — live Gemini call combining profile + opportunity + capability statement
✅ Capability statement generation — live Gemini call from onboarding profile
✅ Variant regeneration ("shorter / more technical / emphasize past performance") — live Gemini calls with different system prompts
✅ Match score algorithm — deterministic local computation, transparent
✅ Award Intelligence panel — live USAspending.gov data, deterministic statistics
✅ Strategic recommendations — live Gemini call on top of the Award Intelligence stats
✅ Document export — real PDF generation of capability statement and proposal
✅ Profile persistence — localStorage (survives refreshes within session)
✅ Save / unsave opportunities — localStorage-backed pipeline
What is stubbed (and called out clearly)
❌ Multi-device account sync — single-device only (localStorage). Clean v2 answer: Supabase, one day's work.
❌ Direct submission to SAM.gov — by design, a link-out. SAM.gov submission is a multi-step authenticated workflow per opportunity; user submits on the official site.
❌ SAM.gov registration — Bid drafts the registration content but doesn't submit it.
❌ Set-aside certifications — Bid identifies what user qualifies for but doesn't submit applications (SBA's own portals).
The stubs are intentional and defensible. Everything that can be real is real.

4. Demo User Flow
The demo follows a four-screen narrative:
Onboarding → real-time NAICS classification + HUBZone check
Feed (Home) → live SAM.gov data, ranked by deterministic match score
Opportunity Detail → live AI summary, proposal, Award Intelligence panel, and past-awards research
Profile / Pipeline → saved opportunities, capability statement, generated documents

5. Functional Requirements
5.1 Onboarding Screen
A multi-step form (3 steps) collecting the business profile. Two AI-powered moments live in onboarding — both real, both visible to the judge.
Step 1 — Business Basics
Business name + DBA (optional)
Year founded
Number of employees (drives small-business size standard)
Annual revenue range (drives size standard for non-manufacturing NAICS)
HQ address — used for HUBZone determination + geographic match scoring
Website URL (optional, used to enrich capability statement)
Step 2 — What You Sell (live Gemini call #1)
Single textarea with plain-English business description (e.g., "We make custom packaging for small craft food brands")
On "Continue" click, fire live Gemini API call with structured-output prompt:

 Given this business description, return the top 5 most likely NAICS codes from the official 2022 NAICS taxonomy, with confidence scores and one-sentence explanations. Respond as JSON matching this schema: { codes: [{ code, title, confidence, why }] }.



Use Gemini's structured output mode (responseSchema parameter) so we get clean JSON, not parsed text
UI shows a loading state ("Classifying your business…") for ~2s, then renders 5 NAICS codes as selectable cards with explanations
User picks 1-3 codes
For each selected code, a local SBA size standards lookup (from a JSON of the official table — public, ~1,057 rows, ships with the app) determines whether the user is "small" by federal definition
Step 3 — Ownership & Certifications (live SBA HUBZone API call)
Multi-select chips for ownership profile:
Woman-owned (≥51%) — qualifies for WOSB
Veteran-owned — qualifies for VOSB
Service-disabled veteran-owned — qualifies for SDVOSB
Member of disadvantaged group — flags 8(a) eligibility
HUBZone check happens automatically when the user enters their address in Step 1. By Step 3 the result is already loaded:

 "Your address at 4523 Knox Rd, Hyattsville MD is in a HUBZone (verified via SBA HUBZone API). You qualify for HUBZone set-asides."



Live "qualifications panel" updates as user selects:

 "You qualify for WOSB + HUBZone set-asides. ~8% of all federal contracting — $62B/year — is reserved for businesses like yours."



End of onboarding — capability statement generation (live Gemini call #2)
When the user clicks "Finish," fire a Gemini call:
Given this complete business profile, generate a 1-2 page federal capability statement following standard federal contracting conventions. Include sections for Core Competencies, Differentiators, Past Performance (placeholder), Certifications, and Contact Information.
The statement renders on the next page as a real document. User can edit it inline (contenteditable) and save. Exportable as a real PDF via react-pdf.
Behavior
Progress indicator across all 3 steps
"Save profile" persists to localStorage
Smooth transition into the feed on completion
Profile editable later from /profile page

5.2 Feed (Home) Screen
Twitter/X-inspired vertical feed of opportunity "cards." Real-time data, real-time match scoring.
Real data flow:
Page mounts → reads profile from localStorage
Builds SAM.gov query from user's NAICS codes + set-aside qualifications
Hits internal /api/opportunities route, which proxies to SAM.gov
Server-side response is parsed via mapSamResponse() into the internal Opportunity type
Each opportunity is scored locally via the match-score algorithm (§5.6)
Results sorted by score (desc) then deadline (asc)
Rendered as cards
Each card displays:
Agency badge — derived from department + subTier fields (e.g., "USDA · Forest Service")
Set-aside badge — colored chip for WOSB/SDVOSB/HUBZone/8(a)/SBA
Opportunity title — from title
1–2 sentence plain-English summary — (live Gemini call #3, deferred): on first feed load, fire batched summary generation in the background for the top 12 opportunities; cards show truncated description until the AI summary swaps in. Cached after first generation.
Estimated value range — derived from awardCeiling/awardFloor if present
Performance location — from placeOfPerformance.city + state
Response deadline — from responseDeadLine, rendered as "Closes in 12 days" with red urgency styling under 7 days
Match score — deterministic computation displayed as circular progress + number ("96")
Match reasons (3 short bullets)
CTA buttons — "📝 Draft Response" (primary) and "🔖 Save" (secondary)
Sticky top nav: logo, functional search bar, filter chips (All Under $250K Set-aside only Closing soon Within 100mi), profile avatar.
Optional rails: Right rail with "Your pipeline" — live count of saved opportunities + total $ value computed from localStorage.
Loading state: skeleton cards while SAM.gov call resolves.
Error fallback: if SAM.gov is down/rate-limited, fall back to 8 hardcoded opportunities. Fallback only — primary path is live data.

5.3 Opportunity Detail Screen
This is where the demo earns the pitch. Three real data sources stack up as the judge watches.
Header section:
Agency + sub-agency
Opportunity title
Set-aside type chip
Deadline countdown (red if <7 days)
Estimated value
Performance location
Prominent "Open on SAM.gov ↗" button — opens the real federal page in a new tab
Secondary "Save to pipeline" button
Body sections (in render order):
5.3.1 What the Agency Wants (live Gemini call #4)
Left column. On detail page mount:
Fetch full opportunity detail from /api/opportunity/[id] (single SAM.gov call)
Fire Gemini API call with structured-output prompt:

 Translate this opportunity from federal procurement language into plain English. Return JSON: { summary: string (3 paragraphs), evaluationFactors: [{ factor, weight }], requiredAttachments: string[], keyRequirements: string[] }



Render as it streams using Gemini's streamGenerateContent — judges see live AI output
5.3.2 Your Drafted Response (live Gemini call #5)
Right column. After §5.3.1's call completes, fire a second Gemini call:
You are a federal contracting consultant helping {{user.businessName}} respond to {{opportunity.title}} at the simplified acquisition threshold. Draft a 1-2 page response that directly addresses each evaluation factor in order, uses the business's actual capabilities, cites their set-aside qualifications where legally relevant, and stays concrete.
The output streams into a styled document block. When complete:
"Copy response" → real clipboard copy, "Copied ✓" toast
"Download as PDF" → real PDF download
Variant switcher: "Shorter" / "More technical" / "Emphasize past performance" — each fires a live regeneration call with a modified prompt. Cached locally.
Word count + estimated page count
5.3.3 Award Intelligence (live USAspending.gov + Gemini call #6)
Full-width panel below the proposal. This is the killer feature. A four-card dashboard that turns the Federal Procurement Data System into actionable intelligence.
Data flow:
From the opportunity, extract: NAICS code, awarding sub-tier agency, set-aside type, estimated value range
Server-side call to /api/award-intelligence/[opportunityId], which:
Queries USAspending spending_by_award for matching contracts in the last 24 months
If the cohort is <10 awards, progressively broaden: drop value range → drop agency, keep NAICS + set-aside
If still <10 after broadening, return { insufficientData: true } — never fake numbers
Compute four deterministic statistics from the cohort
One Gemini call (#6) for strategic recommendations grounded in those stats
The four cards:
Card 1 — Median Award (lead stat, the most defensible)
Computed: median award amount from cohort
Display: $112K headline, ($48K – $235K) 25th–75th percentile range below
Footer: from 47 past awards
Why it's bulletproof: pure aggregation on real federal data, no statistical squishiness
Card 2 — Award Velocity
Computed: award counts grouped by quarter over the last 8 quarters
Display: inline SVG sparkline (▁▂▃▅▄▆▇█) with trend annotation (↗ up 4x)
Footer: over 8 qtrs
Why it's bulletproof: simple count over time, says whether this is a growing or shrinking opportunity area
Card 3 — Profile Fit
Computed: (similar_winners.length / cohort.length) * 100, where "similar" means the recipient shares ≥50% of the user's qualifying dimensions (size, set-aside category, geographic region)
Display: 22% headline
Footer: matched 47 past winners' profile
Why the framing is honest: this is the share of past winners who looked like the user, not a true win probability. We never call it "win probability." See §5.3.4 below.
Card 4 — Frequent Winners
Computed: top 3 recipients by award count in the cohort
Display: numbered list with recipient_name | win count | avg award $
Function: lets the user identify potential competitors or subcontracting partners
Why it's powerful: this is competitive intelligence GovCon platforms charge $400/month for
Below the cards — "How this is computed" panel (always visible, not hidden behind a hover)
HOW THIS IS COMPUTED
We pulled 47 contracts the Forest Service awarded under
NAICS 322220 in the last 24 months for $43K–$172K. Of those,
10 went to women-owned small businesses in the Mid-Atlantic —
your cohort.

Source: USAspending.gov · official federal data

This is critical. Showing the source is the difference between "trustworthy data product" and "AI black box." Judges with stats backgrounds will appreciate the transparency.
Below the explainer — Strategic Recommendations (Gemini call #6)
Three short bullet recommendations generated from the stats. Example output:
"Price between $90K and $130K — that's the 25th–75th percentile of past awards under this contract type."
"Emphasize HUBZone status — 4 of 10 similar past winners cited it prominently in their capability statements."
"Consider Acme Custom Products as a potential subcontractor — they've won 5 contracts in this category, suggesting capacity for teaming."
The recommendations come from Gemini, but they're anchored to real numbers from the deterministic stats above. AI does the language; the data does the math.
5.3.4 The Naming Discipline (important — read carefully)
We never use the phrase "win probability" or "win rate." Here's why and what we use instead:
Bad framing (don't use)
Honest framing (use)
"Win probability"
"Profile Fit"
"22% historical win rate"
"22% of past winners matched your profile"
"Win Intelligence"
"Award Intelligence"
"Your odds of winning"
"Your similarity to past winners"

The reason: USAspending only contains award winners — not all bidders. We don't know how many businesses bid and lost on each contract. So we cannot compute true win probability. What we can compute is the share of past winners who match the user's profile, which is honest and still useful.
A judge with a stats background asking "what's the denominator?" gets a clean answer: "the number of past winners on similar contracts. We're showing you what fraction of them looked like you. We don't have access to bidder data, so we don't claim to predict your win rate — we show you whether your profile resembles people who have won before."
That's a defensible answer. "We computed a 22% win probability" is not.
5.3.5 Recent Awards (table)
A simple table at the bottom of the panel showing the 5 most recent contracts in the cohort:
Recipient
Award
Period
Set-Aside
Greenfield Printing Co.
$145,200
Sep 2025 – Aug 2026
WOSB
Acme Custom Products LLC
$98,400
Jul 2025 – Jun 2026
WOSB
...
...
...
...

Pulled from the same USAspending query — no extra API call needed.

5.4 Profile / Pipeline Screen
Real, functional dashboard:
The user's capability statement (editable; persists to localStorage; PDF export works)
All saved opportunities (toggleable from the feed)
All generated proposal drafts (cached from detail page visits)
"Value pipeline" — real sum of saved opportunities' estimated values
"Edit profile" button → returns to onboarding with values pre-filled

5.5 Match Score Algorithm
For each opportunity, compute a 0–100 match score:
score = 0
reasons = []

// NAICS overlap (40 points max)
if any user NAICS exactly matches opportunity NAICS:
  score += 40
  reasons.push(`NAICS ${code} matches exactly`)
else if first 3 digits match:
  score += 25
  reasons.push(`NAICS industry group matches`)

// Set-aside qualification (25 points)
if opportunity.setAside AND user qualifies:
  score += 25
  reasons.push(`Reserved for ${opportunity.setAside} — you qualify`)
else if no set-aside:
  score += 10

// Size standard fit (15 points)
if user fits SBA size standard for opportunity NAICS:
  score += 15

// Geographic proximity (10 points)
distance = haversine(user.address, opportunity.popLocation)
if distance < 50mi: score += 10
else if distance < 250mi: score += 6
else if distance < 1000mi: score += 2

// Capability statement keyword overlap (10 points)
score += jaccard(capability_words, opportunity_words) * 10

return { score: min(100, score), reasons }

Address-to-coordinates handled by Nominatim at onboarding, cached in profile.
5.6 Award Intelligence — Cohort & Similarity Logic
Cohort definition (the data we pull from USAspending):
filters = {
  award_type_codes: ["A", "B", "C", "D"],   // Definitive contracts only
  naics_codes: [opportunity.naics],
  agencies: [{ type: "awarding", tier: "subtier", name: opportunity.subtier }],
  set_aside_type_codes: opportunity.setAside ? [opportunity.setAside] : undefined,
  award_amounts: [{
    lower_bound: estimatedValue * 0.5,
    upper_bound: estimatedValue * 2.0
  }],
  time_period: [{
    start_date: <24 months ago>,
    end_date: <today>
  }]
}

Progressive broadening (if cohort is too small):
Step
Cohort size
Action
Initial query
≥30
Use as-is; high confidence
Initial query
10–29
Use; mark as medium confidence
Initial query
<10
Drop value range, retry
After dropping value
<10
Drop agency (keep NAICS + set-aside), retry
After all broadening
<10
Show "Insufficient data" — never fake numbers

Similarity scoring (for Profile Fit card):
For each winner in the cohort, compute similarity to user across four dimensions:
function similarityScore(winner: Recipient, user: Profile): number {
  let score = 0
  let total = 0

  // Size standard alignment (weight 1.0)
  total += 1
  if (winner.is_small_business === user.is_small_business) score += 1

  // Set-aside category overlap (weight 1.5)
  total += 1.5
  const winnerCategories = winner.business_types  // array
  const userCategories = user.qualifyingCategories
  const overlap = intersection(winnerCategories, userCategories).length
  if (overlap > 0) score += 1.5 * (overlap / userCategories.length)

  // Geographic match (weight 1.0)
  total += 1
  if (winner.state === user.state) score += 1
  else if (sameRegion(winner.state, user.state)) score += 0.5

  // Award size band (weight 0.5) - very rough proxy for revenue tier
  total += 0.5
  if (sameMagnitude(winner.totalAwards, user.estimatedRevenue)) score += 0.5

  return score / total  // 0.0 to 1.0
}

const similar = cohort.filter(w => similarityScore(w, user) >= 0.5)
const profileFit = (similar.length / cohort.length) * 100

This is deterministic, transparent, and explainable. No ML, no LLM, no magic.

6. SAM.gov API Integration
Endpoint: GET https://api.sam.gov/opportunities/v2/search
Auth: api_key query parameter. Free key from api.data.gov (1,000 req/hour). Server-side only.
Query parameters:
Param
Value
Purpose
api_key
process.env.SAM_API_KEY
Auth
postedFrom
MM/DD/YYYY (30 days ago)
Required date range
postedTo
MM/DD/YYYY (today)
Required date range
ncode
comma-joined user NAICS codes
Industry filter
typeOfSetAside
derived from user qualifications
WOSB, HZC, SDVOSBC, 8A
state
user's HQ state + adjacent
Geographic filter
ptype
o,k
Solicitation + Combined Synopsis/Solicitation
limit
25
Page size

Where it lives: app/api/opportunities/route.ts. Page fetches from internal route on mount.
Caching: server-side LRU keyed by query hash, 5-minute TTL.

7. USAspending.gov API Integration
Endpoint: POST https://api.usaspending.gov/api/v2/search/spending_by_award/
Auth: None. Public API.
Used for: Award Intelligence panel (§5.3.3). Single endpoint, single call per opportunity-detail-page load.
Request body shape (real, confirmed from official docs):
{
  "filters": {
    "award_type_codes": ["A", "B", "C", "D"],
    "naics_codes": ["322220"],
    "agencies": [
      { "type": "awarding", "tier": "subtier", "name": "Forest Service" }
    ],
    "set_aside_type_codes": ["WOSB"],
    "award_amounts": [
      { "lower_bound": 43000, "upper_bound": 172000 }
    ],
    "time_period": [
      { "start_date": "2024-04-26", "end_date": "2026-04-26" }
    ]
  },
  "fields": [
    "Award ID",
    "Recipient Name",
    "Recipient UEI",
    "Award Amount",
    "Period of Performance Start Date",
    "Period of Performance Current End Date",
    "Set-Aside Type",
    "recipient_business_categories",
    "recipient_location_state_code"
  ],
  "page": 1,
  "limit": 100,
  "sort": "Award Amount",
  "order": "desc"
}

Where it lives: app/api/award-intelligence/[opportunityId]/route.ts.
Caching: server-side LRU keyed by (naics, agency, setAside, valueRangeBucket), 24-hour TTL. The cohort is the same for every user looking at the same opportunity, so cache aggressively at the opportunity level, not the user level. The user-similarity filter happens after the cache hit, in <1ms.
Known limitations (called out for honesty):
Some agencies under-report recipient_business_categories — handle gracefully (treat missing as "unknown," exclude from similarity calc but include in cohort size)
Awards under $10K (micro-purchase threshold) are not in the dataset
Data updates daily, slight lag from SAM.gov posting → USAspending appearance

8. Google Gemini API Integration
SDK: @google/genai (official Google GenAI SDK for Node.js)
Model used for all calls: gemini-2.5-flash
Fast (typically <2s for short outputs)
Supports structured output via responseSchema
Supports streaming via generateContentStream
Free tier covers entire hackathon
Two server endpoints handle all six AI calls (consolidated for simplicity):
Endpoint
Used for
Mode
/api/gemini/structured
NAICS classification, opportunity detail summary parsing
JSON mode with responseSchema
/api/gemini/generate
Capability statement, feed summary, proposal draft, variant regeneration, Award Intelligence recommendations
Streaming text

Each endpoint accepts { task, input } where task is one of: classify-naics, capability-statement, summarize-opportunity-card, summarize-detail, draft-proposal, proposal-variant, award-intel-recommendations. Endpoint loads the right system prompt from lib/prompts/index.ts and calls Gemini.
Auth: GEMINI_API_KEY environment variable, server-side only.
Streaming: /api/gemini/generate returns a ReadableStream directly; frontend uses native ReadableStreamDefaultReader.
Caching:
Server-side cache by (task, input_hash)
First click on the demo opportunity: ~6-10 seconds for the proposal to stream in
Subsequent clicks (rehearsal or repeat): instant from cache
Pre-warm the cache by visiting the demo opportunities once before judging
Cost: Gemini 2.5 Flash is ~$0.30/1M input tokens, $2.50/1M output tokens. A full demo run costs <$0.05. Five rehearsals + live demo = under $0.30.

9. SBA HUBZone API Integration
Endpoint: https://hubzone-prod.azurewebsites.net/api/sites/lookup (public, no auth)
Use: During onboarding Step 1, server-side call from /api/hubzone. Returns boolean + qualification expiration. Result attached to user profile.
Fallback: if API is unreachable, treat as "not in HUBZone" rather than blocking the user.

10. Non-Functional / Presentation Requirements
10.1 Aesthetic Direction
Modern, civic, finance-credible — Bloomberg Terminal meets Linear meets Twitter.
Award Intelligence in particular should feel like a Bloomberg panel — dense, data-first, monospace numerics, restrained. This is the visual cue that says "this is real intelligence, not a chatbot."
Palette (restrained, dark theme):
Role
Hex
Use
Background
#0b0e14
Primary canvas
Surface
#141923
Card backgrounds
Border
#222936
Subtle dividers
Ink
#e6ebf2
Primary text
Ink-muted
#8892a6
Metadata, labels
Accent (primary)
#3ddc84
Match scores, CTAs, success
Accent (warning)
#ffb84d
Deadline urgency
Accent (danger)
#ff5e5e
<3-day deadlines

Typography:
Display + headings: Geist (or Inter Display)
Body: Inter
Numerics + tabular data: Geist Mono — for dollar values, NAICS codes, deadlines, match scores, all Award Intelligence numbers
Fonts loaded via next/font.
10.2 Component & Interaction Polish
Card hover: subtle lift + border highlight
Match score: large numerical display with circular progress
Award Intelligence numbers: tabular monospace, large
Award velocity sparkline: pure inline SVG, animated draw on mount
Deadline countdown: live-updating, color-graded by urgency
Set-aside chips: distinct color per category
Page transitions: Framer Motion (200ms)
Skeleton loading: shimmer effect while feed/AI calls resolve
Toast notifications for "Copied", "Saved", etc.
Streaming AI text: cursor-style indicator while Gemini responses stream in
10.3 Responsive
Must look clean on laptop (1440×900) during demo. Mobile is nice-to-have.
10.4 Performance
Server-rendered feed (Next.js App Router)
Streaming AI responses so the user sees progress
Pre-warm cache before demo for hero opportunities
Award Intelligence panel loads in parallel with proposal draft (separate fetch promises)

11. Out of Scope (clearly stubbed)
❌ Multi-device account sync (localStorage only)
❌ Direct submission to SAM.gov (link-out by design)
❌ SAM.gov registration submission (we draft, user submits)
❌ Set-aside certification submission
❌ Email notifications for new matching opportunities
❌ Subcontracting marketplace (mentioned as v2 in pitch)
❌ True win probability (we don't have bidder data — see §5.3.4)
These are the only faked elements. Everything else is real.

12. Tech Stack
Layer
Choice
Rationale
Framework
Next.js 14 (App Router)
Server components for API proxying, streaming AI
Language
TypeScript
Type safety on opportunity + profile + cohort shapes
Styling
Tailwind CSS + CSS variables
Dark theme tokens, fast iteration
UI Primitives
shadcn/ui
Form, dialog, badge, skeleton, toast
Icons
Lucide React
Clean, business-appropriate
Fonts
Geist + Geist Mono + Inter via next/font
Modern, technical
State
React Context + localStorage
Profile + saved pipeline persistence
Animation
Framer Motion
Page transitions, card hovers, sparkline reveal
Form Validation
react-hook-form + zod
Onboarding multi-step
AI Calls
@google/genai
Official Google GenAI SDK
AI Streaming
Native ReadableStream
SDK supports streaming directly
PDF Export
@react-pdf/renderer
Real downloads
Geocoding
Nominatim (OSM)
Free address → lat/lng
Caching
In-memory LRU on server (lru-cache)
Protect rate limits
Charts
Inline SVG (no library) for sparkline
Keep dependencies minimal
Deployment
Vercel
One-command deploy, env vars, instant URL


13. Baseline File Structure
bid/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                         # Landing → onboarding or feed
│   ├── globals.css                      # Tailwind + dark theme tokens
│   │
│   ├── api/
│   │   ├── opportunities/
│   │   │   └── route.ts                 # SAM.gov proxy + caching
│   │   ├── opportunity/
│   │   │   └── [id]/
│   │   │       └── route.ts             # Single SAM.gov opportunity detail
│   │   ├── award-intelligence/
│   │   │   └── [id]/
│   │   │       └── route.ts             # USAspending cohort + stats
│   │   ├── gemini/
│   │   │   ├── structured/
│   │   │   │   └── route.ts             # JSON-mode Gemini calls
│   │   │   └── generate/
│   │   │       └── route.ts             # Streaming Gemini calls
│   │   ├── hubzone/
│   │   │   └── route.ts                 # SBA HUBZone proxy
│   │   └── geocode/
│   │       └── route.ts                 # Nominatim proxy
│   │
│   ├── onboarding/
│   │   └── page.tsx                     # 3-step business profile form
│   ├── feed/
│   │   └── page.tsx                     # Home feed
│   ├── opportunity/
│   │   └── [id]/
│   │       └── page.tsx                 # Detail + AI summary + proposal + Award Intel
│   └── profile/
│       └── page.tsx                     # Capability stmt + saved pipeline
│
├── components/
│   ├── ui/                              # shadcn primitives
│   │
│   ├── onboarding/
│   │   ├── BusinessBasicsStep.tsx
│   │   ├── WhatYouSellStep.tsx          # Live NAICS classifier
│   │   ├── OwnershipStep.tsx            # HUBZone result
│   │   ├── NaicsCard.tsx
│   │   ├── QualificationsPanel.tsx
│   │   └── ProgressBar.tsx
│   │
│   ├── feed/
│   │   ├── OpportunityCard.tsx
│   │   ├── FeedHeader.tsx
│   │   ├── FilterChips.tsx
│   │   ├── PipelineRail.tsx
│   │   ├── DeadlineBadge.tsx
│   │   ├── SetAsideBadge.tsx
│   │   ├── MatchScore.tsx
│   │   └── SkeletonCard.tsx
│   │
│   ├── opportunity/
│   │   ├── OpportunityHeader.tsx
│   │   ├── PlainSummary.tsx             # Streams Gemini summary
│   │   ├── ProposalDraft.tsx            # Streams Gemini proposal
│   │   ├── VariantSwitcher.tsx
│   │   ├── AwardIntelligence.tsx        # The four-card panel
│   │   ├── MedianAwardCard.tsx
│   │   ├── VelocitySparkline.tsx        # Inline SVG sparkline
│   │   ├── ProfileFitCard.tsx
│   │   ├── FrequentWinners.tsx
│   │   ├── HowComputed.tsx              # Source/methodology disclosure
│   │   ├── StrategicRecommendations.tsx # Streams Gemini recs
│   │   ├── RecentAwardsTable.tsx
│   │   ├── CopyButton.tsx
│   │   └── PdfDownloadButton.tsx
│   │
│   ├── profile/
│   │   ├── CapabilityStatement.tsx
│   │   ├── SavedOpportunities.tsx
│   │   └── ValuePipeline.tsx
│   │
│   └── shared/
│       ├── Logo.tsx
│       ├── AgencyBadge.tsx
│       ├── EmptyState.tsx
│       ├── StreamingText.tsx            # Reusable streaming display
│       └── ToastProvider.tsx
│
├── lib/
│   ├── samApi.ts                        # SAM.gov fetch + query builder + mapper
│   ├── usaspendingApi.ts                # USAspending fetch + filter builder
│   ├── awardIntelligence.ts             # Cohort analysis + similarity scoring
│   ├── gemini.ts                        # @google/genai wrapper
│   ├── hubzoneApi.ts
│   ├── geocode.ts
│   ├── prompts/
│   │   └── index.ts                     # ALL system prompts in ONE file
│   ├── ranking.ts                       # Match-score algorithm
│   ├── setAsides.ts                     # Set-aside catalog + qualification logic
│   ├── sizeStandards.ts                 # SBA size standard table (real data)
│   ├── naicsCatalog.ts                  # NAICS 2022 catalog (real data)
│   ├── pdf.ts                           # PDF generation helpers
│   ├── cache.ts                         # LRU cache for API responses
│   ├── profile.ts                       # localStorage helpers
│   ├── mock/
│   │   └── opportunities.ts             # 8 fallback opportunities
│   └── types.ts
│
├── context/
│   └── ProfileContext.tsx
│
├── public/
│   ├── logo.svg
│   └── agency-icons/
│
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
├── .env.local                           # SAM_API_KEY, GEMINI_API_KEY
└── README.md


14. Demo Script (90 seconds)
0:00 – 0:10 — Open landing. Hero: "$180 billion in federal contracts is set aside for small businesses every year. Most never see a dollar of it. Bid changes that." Click "Get started."
0:10 – 0:35 — Onboarding. Walk through as Maria's Custom Packaging, 4-person shop in Hyattsville, MD. Type the business description. Watch the Gemini NAICS classifier run live — 5 codes appear in 2 seconds with explanations. Pick 322220. Step 3: check "Woman-owned." HUBZone result already loaded — "Verified: Hyattsville is in a HUBZone (SBA API)." Qualifications panel updates.
0:35 – 0:50 — Feed loads with real SAM.gov data. Top card: USDA Forest Service custom branded merchandise — closes in 14 days — 96% match — WOSB set-aside — $85K–$145K.
0:50 – 1:15 — Click into the USDA card. Live Gemini summary streams in on the left. Proposal streams in on the right. (Pause briefly: "every word you're seeing is generated for Maria, by Gemini, right now.")
1:15 – 1:40 — "But here's where Bid earns its name." Scroll to Award Intelligence. The four cards are already loaded from USAspending. Walk through them in order:
"Median past award: $112K. That's Maria's price target."
"Awards per quarter: trending up. Forest Service is spending more on this, not less."
"22% of past winners shared Maria's profile — woman-owned small businesses in the Mid-Atlantic. That's not a long shot."
"And here are the three businesses she'll likely be competing against — or could partner with as a sub if she doesn't win the prime."
Then point at the "How this is computed" panel: "All from 47 real federal contract awards in the last 24 months. Source-cited, no AI hallucinations on the numbers."
1:40 – 1:50 — Strategic recommendations have streamed in below. Read one: "Price between $90K and $130K — that's the 25th–75th percentile of past awards under this contract type." Click "Make it more technical" — proposal regenerates live.
1:50 — "Federal contracting isn't a closed club. Bid runs on real federal data, real Gemini AI, and real procurement intelligence. The kind of intelligence GovCon consultants charge $20,000 a year for. We're putting it in the hands of a four-person print shop."

15. Success Criteria
✅ Judges can interact with the running app and break nothing
✅ Three live Gemini streaming moments visible (NAICS, summary, proposal)
✅ Real SAM.gov data loaded in the feed at demo time
✅ Real USAspending data drives the Award Intelligence panel with at least 30+ awards in the demo cohort
✅ Real PDF download works
✅ "96% match" hero card scores correctly via deterministic algorithm
✅ A judge can re-run the variant switcher and see different real outputs
✅ "How this is computed" panel is visible and cites the source
✅ Aesthetic reads as serious business finance infrastructure
✅ The "Profile Fit" framing is used consistently — no "win probability" anywhere in the UI

16. Pre-Build Checklist
[ ] SAM.gov API key registered at api.data.gov
[ ] Gemini API key obtained from Google AI Studio
[ ] Test SAM.gov query returns valid data
[ ] Test Gemini structured output call returns expected JSON
[ ] Test Gemini streaming call works end-to-end
[ ] Test SBA HUBZone API with a known HUBZone address
[ ] Test USAspending spending_by_award for the demo cohort — confirm ≥30 awards exist for (NAICS 322220, Forest Service, WOSB, last 24mo)
[ ] Vercel project created, env vars configured
[ ] Demo profile decided: Maria's Custom Packaging, Hyattsville MD, 4 employees, WOSB + HUBZone
[ ] 8 fallback opportunities written and tagged for resilience
[ ] Pre-warm cache rehearsal completed before judging (visit hero opportunity, let all data load)
[ ] Demo laptop test: feed loads in <3s, AI streams visible, Award Intelligence loads in parallel, no console errors

17. Risk Register
Risk
Mitigation
SAM.gov API rate-limited during demo
LRU cache; pre-warm with rehearsal; 8 fallback opportunities
Gemini API slow during demo
Streaming UI shows progress; pre-warm cache 5min before
USAspending cohort too small for demo opportunity
Pre-validate during build: confirm ≥30 awards exist for (NAICS, agency, set-aside) of hero opportunity. If short, switch demo opportunity. Insufficient-data state is a graceful fallback but undermines the demo.
USAspending API slow
Award Intelligence loads in parallel with proposal — if late, show skeleton then populate. 24hr cache means subsequent demos are instant.
Judge asks about "win probability"
The framing is "Profile Fit." Have the answer rehearsed: "We compute the share of past winners who match the user's profile — we don't have bidder data, so we don't claim true win probability." This is a strength, not a weakness.
Judge clicks unrehearsed opportunity that's slow
Loading skeletons are pretty; judges expect AI streaming
HUBZone API down
Treat as "not in HUBZone"; non-blocking
User-input edge cases break onboarding
Zod validation; sensible defaults


18. Why Award Intelligence Wins the Pitch
This feature is the bridge between "AI app that fills out forms" and "intelligence platform a freelance consultant would pay $300/month for."
Three things make it defensible:
The math is real. Median, percentile, count, and Jaccard similarity are all transparent statistics on public federal data. No black box, no LLM hallucination on numbers.


The framing is honest. We never claim "win probability" — we claim "profile fit," and we show our work. A statistician on the judging panel will respect this.


The source is cited. "Computed from 47 USAspending records, last 24 months" is on-screen. Judges can verify in one click.


What it adds to the pitch:
"Match score answers 'are you allowed to bid?' Award Intelligence answers 'should you bother?' We're not just helping Maria write the proposal. We're telling her what to charge, who she's competing against, and whether her profile resembles people who have actually won. That's the kind of intelligence the people winning 75% of small-business contracts already have. Bid puts it in the hands of the other 95%."

End of FRD v0.4 — with Award Intelligence integrated
