# BidBridge

Democratizing federal contracting by providing small businesses with AI-driven opportunity matching, automated proposal drafting, and institutional-grade award intelligence.

BidBridge helps small business owners find federal contracts they are qualified to pursue, understand the solicitation in plain English, draft first-pass response materials, and make better financial decisions using real award history from official federal data sources.

## Why BidBridge

Federal law mandates that 23% of all government contracting dollars be awarded to small businesses, a pool of roughly $180 billion annually. Despite that mandate, 75% of these dollars consistently flow to the same 5% of registered firms.

The problem is not a lack of opportunity or talent. It is an overwhelming asymmetry in information and administrative overhead. Small business owners often cannot afford the $20,000-per-year GovCon intelligence platforms used by defense primes and consultancies. BidBridge closes that gap by putting live opportunity discovery, proposal assistance, and defensible award intelligence into one workflow.

## What It Does

- **Smart opportunity matching:** Aggregates live opportunities from SAM.gov and ranks them using a transparent profile-fit score based on NAICS, set-aside eligibility, geography, and business attributes.
- **AI-generated proposal support:** Uses Gemini to translate dense federal solicitations into plain-English summaries and draft tailored 1 to 2 page responses that address evaluation factors.
- **Award intelligence:** Uses USAspending.gov data to calculate median award values, market velocity, frequent winners, and profile similarity from real historical awards.
- **Capability statements:** Generates professional capability statement content from the user's business profile and exports polished PDF documents.
- **HUBZone and set-aside guidance:** Checks HUBZone eligibility and surfaces relevant WOSB, VOSB, SDVOSB, HUBZone, 8(a), and small business set-aside signals.

## Built With

- **Framework:** Next.js 14 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Shadcn UI, Framer Motion
- **AI:** Google Gemini API, using `gemini-2.5-flash`
- **Data APIs:** SAM.gov API, USAspending.gov API, SBA HUBZone API
- **Tools:** React PDF, Lucide React, Zod, React Hook Form

## How It Works

BidBridge uses a hybrid approach: deterministic data pipelines do the financial math, and Gemini handles language-heavy work like classification, summaries, proposal drafts, capability statements, and strategic recommendations.

The match score is explainable rather than predictive. It uses a Jaccard-style similarity calculation:

```text
J(A, B) = |A intersection B| / |A union B|
