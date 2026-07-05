# Semmly (ex-Milli, ex-Oztrack) — Session Log & Project Context

## App Overview
GLP-1 medication companion app (Ozempic, Wegovy, Mounjaro, Zepbound, Rybelsus, Saxenda, Victoza, Trulicity, compounded, etc.)
**Target:** People managing weight loss or diabetes on GLP-1s — mercado global en inglés, lanzamiento **Android/Play Store first**
**Monetization:** HARD PAYWALL (decidido 2026-07-04, basado en RevenueCat State of Subscription Apps 2026) — sin suscripción no hay acceso. Monthly $9.99 / Annual $59.99 preseleccionado con trial de 7 días solo en anual.
**Flujo:** welcome → quiz pre-auth (6 pasos) → value screen → registro → paywall bloqueante → app
**Nombre**: repo GitHub `christiangf28/semmly`, pero el package Android es `com.getmilli.app` (intencional — no se puede cambiar tras crear la app en Play Console, ver CHANGELOG 2026-07-05(b)).

---

## Estado actual (al cerrar sesión 2026-07-05)

**Código**: rama `main`, working tree limpio, todo pusheado. Último commit `baa68d3`.
**i18n**: conversión completa a EN/ES en todas las pantallas (tabs, onboarding, auth, track/coach/progress/profile). Selector manual de idioma en Perfil → Ajustes. Pendiente menor: texto generado dinámicamente en `generateInsights()` (progress.tsx) y `useAchievements.ts` sigue en español.
**Build de referencia**: perfil `preview` de EAS, build ID `dc8b0248-0c90-450e-a2dc-08791edfe8a5` (lanzado al cerrar esta sesión — verificar si terminó con `npx eas build:view dc8b0248-0c90-450e-a2dc-08791edfe8a5`).
**Play Console**: app creada (package `com.getmilli.app`, nombre visible "Semmly"), content rating + data safety + público objetivo completados. Suscripción `premium` con planes `monthly` ($9.99) y `annual` ($59.99 + trial 7 días) — falta confirmar que la oferta del anual quedó guardada y todo en estado "Activo".
**RevenueCat**: bug real corregido — faltaba `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` en el entorno "preview" de EAS (solo estaba en "production"), por eso nunca aparecía ningún customer. Ya corregido en ambos entornos. Falta: crear el Offering espejo de los planes de Play Console, y otorgar `premium` a la cuenta de prueba del reviewer.
**Cuenta de prueba (reviewer de Google)**: `christiangf28+milli-review@gmail.com` / `MilliReview2026!`, Supabase user ID `162b866f-89bb-4e70-965c-c085af684fa7`.
**QA unlock**: botón temporal en el paywall (`EXPO_PUBLIC_QA_UNLOCK`, solo entorno preview) para bypasear el hard paywall en testing sin RevenueCat real. **Sacarlo antes del build para los 12 testers.**
**Pendiente del usuario**: confirmar si habilitó Cloud Pub/Sub API en Google Cloud (lo pedimos, no confirmado).

### Cómo retomar
1. Verificar build `dc8b0248...`, descargar/instalar APK en emulador o teléfono.
2. Recorrer onboarding, tocar "QA unlock" en paywall, sacar 4-6 screenshots reales en inglés para Play Store.
3. Terminar Play Console (oferta del plan anual) + crear Offering en RevenueCat.
4. Cuando haya productos reales, otorgar `premium` a la cuenta de prueba en RevenueCat dashboard.
5. Ver CHANGELOG.md → entrada "2026-07-05 (c)" para el detalle completo de esta sesión.

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

## Historial resumido
Detalle completo de cada sesión en CHANGELOG.md — acá solo el resumen de una línea por hito, para no duplicar.

- **2026-05-24**: bootstrap del proyecto (Expo+TS+Router), diseño visual completo (paleta rosa/crema/salvia/lavanda), auth+onboarding+tabs armados, todo en español.
- **2026-07-04**: pasa a "producto con revenue" — quiz pre-auth + value screen, hard paywall, RevenueCat init, 10 medicamentos, rebrand Oztrack→Milli.
- **2026-07-05**: rebrand Milli→Semmly (colisión de marca), API key de Anthropic fuera del cliente, Sentry, delete_user implementado, i18n completo EN/ES, fixes de RevenueCat/paywall, Play Console en progreso. Ver "Estado actual" arriba.

---

## Milestones
- [x] **M1** — Auth + Onboarding complete
- [x] **M2** — Daily tracking functional
- [x] **M3** — AI Coach live (gated)
- [x] **M4** — Progress dashboard + charts
- [x] **M5** — Paywall + RevenueCat integrated (código listo; falta Offering real en RC + oferta anual en Play Console)
- [x] **M6** — i18n EN/ES completo con selector manual
- [ ] **M7** — Play Store submission (Play Console en progreso, screenshots pendientes, closed testing 12 testers/14 días no arrancado)

---

## Marketing Notes
- Primary acquisition: organic search (GLP-1 side effects, Ozempic nausea tips)
- App Store keywords: ozempic tracker, wegovy app, glp-1 companion, mounjaro side effects
- Differentiator: AI coach that *understands* the GLP-1 journey (not generic health app)
- Social proof angle: symptom improvement streaks → shareable milestones
