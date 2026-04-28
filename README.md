# BidBridge

**Federal contracting intelligence for small businesses.**

$180 billion in federal contracts is set aside for small businesses every year. Most never see a dollar of it — not because they aren't qualified, but because finding, understanding, and responding to opportunities requires tools that cost $20,000/year or more. BidBridge puts live opportunity discovery, AI-assisted proposal drafting, and real award intelligence into one free workflow.

---

## Background

Federal law mandates that 23% of all government contracting dollars be awarded to small businesses. Despite that mandate, 75% of those dollars consistently flow to the same 5% of registered firms. The gap isn't talent — it's access to information.

BidBridge connects directly to SAM.gov (the official federal contract database), USAspending.gov (historical award data), and the SBA HUBZone API to give any small business owner a real-time picture of the opportunities they qualify for, what those contracts are actually worth, and how to respond.

---

## Features

### Opportunity Feed
- Pulls live solicitations from SAM.gov filtered to your NAICS codes, set-aside eligibility, and state
- Ranks each opportunity with a transparent match score (0–100) based on NAICS overlap, set-aside eligibility, geography, and revenue range
- AI-generated one-line summaries for each card so you can scan fast
- Filters: under $250K, set-aside only, closing soon, within 100 miles

### Opportunity Detail
- Plain-English breakdown of what the agency wants — evaluation factors, required attachments, key requirements
- AI-drafted 1–2 page response tailored to your business profile and the specific solicitation
- Proposal variants: shorter, more technical, or emphasizing past performance
- One-click PDF export of your drafted response
- Direct link to the official SAM.gov contract page

### Award Intelligence
- Median award value and interquartile range from real USAspending.gov data
- Award velocity chart (trend over 8 quarters)
- Profile fit score — what share of past winners looked like your business
- Frequent winners list with average award values
- Full table of recent awards with recipient, amount, period, and set-aside type
- AI-generated strategic recommendations based on the cohort data

### Business Profile & Onboarding
- 3-step onboarding: business basics → NAICS classification → set-aside certifications
- AI classifies your business description into up to 3 NAICS codes with confidence scores
- SBA HUBZone eligibility check from your address (live SBA API)
- Automatically determines small business size status from SBA size standards
- Detects qualifying set-asides: 8(a), HUBZone, WOSB, EDWOSB, VOSB, SDVOSB

### Capability Statement
- AI-generated capability statement from your profile
- Editable in-browser with auto-save
- One-click PDF export

### Pipeline
- Save opportunities to a personal pipeline
- Tracks total pipeline value and set-aside breakdown
- Cached proposal drafts accessible from the profile page

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| AI | Google Gemini 2.5 Flash (`@google/genai`) |
| Contract data | SAM.gov API v2 |
| Award data | USAspending.gov API |
| HUBZone | SBA Certify Map API |
| Geocoding | Nominatim (OpenStreetMap) |
| PDF export | `@react-pdf/renderer` |
| Icons | Lucide React |

Caching is handled server-side in memory (LRU-style with TTLs) to minimize API calls. All AI calls are cached by input hash so repeated requests are free. Profile and pipeline data live in `localStorage` — no database required.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/bidbridge.git
cd bidbridge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Get your API keys

You need two API keys:

**SAM.gov API key (free)**
1. Go to [sam.gov/profile/Details](https://sam.gov/profile/Details)
2. Sign in or create a free account
3. Click **Request API Key** and follow the prompts
4. You'll receive the key by email within minutes

**Google Gemini API key (free tier available)**
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with a Google account
3. Click **Get API key** → **Create API key**
4. Copy the key

> **Note on free tier limits:** The Gemini free tier allows ~15 requests per minute. On a fresh feed load, BidBridge generates summaries for up to 12 cards in parallel, which can briefly hit this limit. If you see "You have exceeded the current limit", either wait a minute and refresh or enable billing in Google AI Studio for higher rate limits.

### 4. Create your environment file

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your keys:

```env
SAM_API_KEY=your_sam_gov_api_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for production

```bash
npm run build
npm start
```

---

## Usage

1. **Visit the app** → you'll land on the home page
2. **Click "Get started"** → complete the 3-step onboarding with your business details
3. **Browse your feed** → opportunities are ranked and summarized for your specific profile
4. **Click any opportunity** → read the plain-English summary, view the AI-drafted response, and check the award intelligence panel
5. **Save opportunities** → build your pipeline from the feed or detail page
6. **Export** → download your drafted response or capability statement as a PDF

---

## Project Structure

```
app/                  Next.js App Router pages
  page.tsx            Landing page
  feed/               Opportunity feed
  opportunity/[id]/   Opportunity detail + AI drafting
  onboarding/         3-step profile setup
  profile/            Saved pipeline + capability statement
  api/                Server-side API routes

components/
  feed/               Feed cards, filters, pipeline rail
  opportunity/        Detail panels, proposal editor, award intelligence
  onboarding/         Step forms, NAICS cards, ownership flags
  profile/            Saved opportunities, capability statement editor
  shared/             Logo, toasts, empty states, streaming text

lib/
  samApi.ts           SAM.gov API client + response mapper
  gemini.ts           Gemini API wrapper (structured + streaming)
  hubzoneApi.ts       SBA HUBZone eligibility check
  ranking.ts          Opportunity match scoring
  prompts/            All AI system prompts and response schemas
  cache.ts            Server-side LRU cache with TTLs
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SAM_API_KEY` | Yes | SAM.gov API key for live federal contract data |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |

---

## Data Sources

- **[SAM.gov](https://sam.gov)** — the official System for Award Management. All federal contract opportunities are posted here by law.
- **[USAspending.gov](https://usaspending.gov)** — official database of all federal spending, including historical contract awards.
- **[SBA HUBZone Map](https://maps.certify.sba.gov)** — the Small Business Administration's official HUBZone determination tool.
- **[Nominatim](https://nominatim.org)** — open-source geocoding powered by OpenStreetMap, used for proximity matching.

No data is fabricated. If the award cohort is too small (fewer than 10 comparable contracts), BidBridge declines to show award intelligence rather than present unreliable statistics.
