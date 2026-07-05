# Milli — GLP-1 Medication Companion App

Mobile app for people managing weight loss or diabetes on GLP-1 medications (Ozempic, Wegovy, Mounjaro, Zepbound).

## Features

- **Daily logging** — weight, symptoms (nausea, fatigue, appetite, mood, energy), water intake, and meal notes
- **AI Coach** — personalized weekly insights powered by Claude, correlating all tracked variables
- **Progress charts** — visualize trends over time with interactive Victory Native charts
- **Freemium model** — core tracking free; AI Coach + advanced insights behind subscription
- **Multilingual** — EN/ES support via i18next

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React Native 0.81 + Expo SDK 54 (TypeScript) |
| Routing | Expo Router (file-based) |
| Backend | Supabase (auth, DB, storage) |
| AI | Anthropic Claude Sonnet API |
| Subscriptions | RevenueCat (7-day free trial, no credit card) |
| Charts | Victory Native |
| i18n | i18next + react-i18next + expo-localization |

## Getting Started

```bash
git clone https://github.com/christiangf28/oztrack.git
cd oztrack
npm install
npx expo start
```

Requires:
- `.env` with `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, and RevenueCat API keys
- Expo Go or a physical device / simulator

## Safety & Compliance

- Medical disclaimer accepted during onboarding
- Every AI response includes a disclaimer
- AI never suggests dose changes or provides diagnoses
- No clinical data collected (no HbA1c, no prescription details)
- All AI responses are framed as educational/informational only

## License

MIT © Christian Guajardo
