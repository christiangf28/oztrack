# Milli — Session Log & Project Context

## App Overview
GLP-1 medication companion app (Ozempic, Wegovy, Mounjaro, Zepbound, Saxenda, Trulicity, compounded, etc.)
**Target:** People managing weight loss or diabetes on GLP-1s — mercado global en inglés, lanzamiento **Android/Play Store first**
**Monetization:** HARD PAYWALL (decidido 2026-07-04, basado en RevenueCat State of Subscription Apps 2026) — sin suscripción no hay acceso. Monthly $9.99 / Annual $59.99 preseleccionado con trial de 7 días solo en anual.
**Flujo:** welcome → quiz pre-auth (7 pasos) → value screen → registro → paywall bloqueante → app

---

## Tech Stack
| Layer | Tech |
|---|---|
| Framework | React Native + Expo (TypeScript) |
| Routing | Expo Router (file-based) |
| Backend | Supabase (auth, DB, storage) |
| AI | Anthropic Claude Sonnet API |
| Subscriptions | RevenueCat |
| Charts | Victory Native |
| i18n | i18next + react-i18next + expo-localization |

## Pricing Strategy (actualizado 2026-07-04 — hard paywall)
- Monthly: $9.99/mo
- Annual: $59.99/yr (~50% savings, preseleccionado, trial 7 días SOLO en anual)
- No hay free tier: sin suscripción activa la app redirige al paywall (app/index.tsx)

---

## Database Schema

### users
`id, email, medication, start_date, goals, created_at`

### daily_logs
`id, user_id, date, nausea, fatigue, appetite, mood, energy, weight, water_ml, meal_notes`

### chat_messages
`id, user_id, role, content, created_at`

### subscription_status
`user_id, rc_customer_id, is_active, plan, trial_ends_at`

---

## Compliance Rules (CRITICAL)
- Medical disclaimer must be accepted on onboarding
- Every AI response ends with disclaimer
- Never suggest dose changes, never diagnose
- No clinical data collected (no HbA1c, no doses, no prescriptions)
- Frame AI responses as educational/informational only

---

## Project Structure
```
/app              — Expo Router screens
/features         — auth | tracking | coach | dashboard | paywall
/components       — shared UI
/lib              — supabase | anthropic | revenuecat clients
/hooks            — custom hooks
/i18n             — translations
```

---

## Session History

### Session actual — 2026-07-04 (Fase 1: Monetización)
Ver CHANGELOG.md para el detalle. Resumen:
- [x] Auditoría Fase 0 completa (deuda crítica identificada: API key Anthropic en cliente, copy ES hardcodeado, bypass premium, delete_user RPC faltante)
- [x] Quiz pre-auth + pantalla struggles + value screen (i18n EN/ES)
- [x] Hard paywall (trial solo anual, restore, auto-renew terms, dev bypass solo __DEV__)
- [x] RevenueCat: init al arrancar + logIn al registrarse (keys Android aún placeholder)
- [x] Medicamentos ampliados a 10 (semaglutida, tirzepatida, liraglutida, dulaglutida, compuestos)
- [ ] SIGUIENTE: productos en Play Console + RC dashboard, migración struggles en Supabase, Fase 2 (copy EN, Edge Function proxy, estados vacíos)
- Decisión: lanzamiento Android-first (Play Store); closed testing 12 testers/14 días — arrancar build interno apenas haya keys RC

### Session 1 — 2026-05-24
**Goal:** Project bootstrap + diseño visual completo
- [x] Proyecto Expo inicializado (TypeScript + Expo Router)
- [x] Todas las dependencias instaladas (981 paquetes)
- [x] Auth flow completo (login, register con gradientes hero)
- [x] Onboarding 4 pasos (disclaimer → medicamento → duración → objetivos → síntomas)
- [x] Tab navigation (Track, Coach, Progress, Profile)
- [x] Supabase, Anthropic, RevenueCat clients configurados (keys pendientes)
- [x] **DISEÑO VISUAL COMPLETO** — ver detalles abajo

**Sistema de diseño implementado:**
- Paleta rosa polvoso + crema cálida + salvia + lavanda
- Gradientes en hero, botones, cards de streak, coach avatar
- Sombras suaves (sin bordes duros en la mayoría de elementos)
- ScoreSlider visual con emojis y barra de progreso animada
- Tab bar con fondo activo pill-shaped
- Componentes: Button (gradiente), Input (focus state), Card, Badge, OnboardingLayout
- Idioma: español en toda la UI (i18n EN+ES completo)

**Keys needed from user:**
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- RevenueCat API keys (iOS + Android)

---

## Milestones
- [ ] **M1** — Auth + Onboarding complete
- [ ] **M2** — Daily tracking functional
- [ ] **M3** — AI Coach live (gated)
- [ ] **M4** — Progress dashboard + charts
- [ ] **M5** — Paywall + RevenueCat integrated
- [ ] **M6** — i18n second language (Spanish target)
- [ ] **M7** — App Store + Play Store submission

---

## Marketing Notes
- Primary acquisition: organic search (GLP-1 side effects, Ozempic nausea tips)
- App Store keywords: ozempic tracker, wegovy app, glp-1 companion, mounjaro side effects
- Differentiator: AI coach that *understands* the GLP-1 journey (not generic health app)
- Social proof angle: symptom improvement streaks → shareable milestones
