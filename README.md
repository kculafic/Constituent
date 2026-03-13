# Constituent.

An AI-powered civic tech tool that helps everyday people contact their elected representatives effectively — with letters and phone scripts that actually work.

Live demo on https://constituent-ddgzbrure-kculafics-projects.vercel.app/

## The Problem

Most civic tools help people *write* a letter. Constituent helps people write one that *gets read*. Congressional offices receive thousands of constituent contacts. Form letters get tallied and filed. Personalized, specific, locally-grounded communication gets attention. This app is built around that distinction.

*Note*: Constituent is currently a prototype for Illinois residents only. The app uses a hardcoded ZIP-to-congressional-district lookup table (api/app/controllers/representatives_controller.rb:24-33) that only contains Illinois ZIP codes. This allows the team to validate the core product concept and user experience before expanding to a nationwide dataset. The UI explicitly states this limitation (src/components/ZipLookup.tsx:49-53).

## What It Does

- **Find your reps** — Enter your address and ZIP code to instantly identify your 2 U.S. Senators and House Representative via Census Bureau geocoding
- **Select your rep** — Choose which representative you're contacting before drafting
- **Pick an issue** — Choose from 15+ issue areas with guided prompts to help you frame your position
- **Generate your communication** — AI produces a personalized constituent letter or phone script addressed to the specific rep you selected, in your voice, referencing your local context
- **Send it effectively** — Guidance on how to make your contact count (district office vs. DC, calls vs. letters, follow-up timing)
- **Copy and go** — One-click copy to clipboard

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend | Ruby on Rails 8 API |
| Geocoding | U.S. Census Bureau Geocoding API |
| Legislator data | [@unitedstates/congress-legislators](https://github.com/unitedstates/congress-legislators) |
| AI generation | Google Gemini 2.0 Flash |

## Getting Started

### Prerequisites

- Node.js 18+
- Ruby 3.2+ / Rails 8
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Add your Gemini API key to .env
npm run dev
```

### Backend Setup

```bash
cd backend
bundle install
rails db:create db:migrate
rails server
```

Frontend runs on `http://localhost:5173`, Rails API on `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
VITE_GEMINI_KEY=your_gemini_api_key_here
```

## How It Works

1. User enters a street address + ZIP — the Rails backend calls the Census geocoding API to resolve the exact congressional district, avoiding CORS issues and handling edge cases where ZIP codes straddle district boundaries
2. The app fetches current legislator data from the `unitedstates` GitHub project (no API key required, always current)
3. User selects one rep, one issue, and adds personal context via guided notes
4. Gemini generates a letter or phone script personalized to that rep, that issue, and that constituent's voice
5. User copies and sends

## Why Address + ZIP (Not Just ZIP)

ZIP codes are postal boundaries. Congressional districts are political ones. They don't align cleanly — a single ZIP code can span two districts. Providing a street address allows the Census geocoder to pinpoint the exact district rather than guessing from a ZIP centroid.

## Issues Covered

Healthcare · Climate & Environment · Education · Immigration · Housing & Affordability · Voting Rights · Economic Policy · Gun Safety · Criminal Justice Reform · Foreign Policy · Social Security & Medicare · LGBTQ+ Rights · Labor & Workers' Rights · Veterans Affairs · Free Press & Democracy

## Contributing

Pull requests welcome. Please open an issue first for significant changes.

## License

MIT
