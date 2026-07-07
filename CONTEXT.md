# Semmly (ex-Milli, ex-Oztrack) — Session Log & Project Context

## App Overview
GLP-1 medication companion app (Ozempic, Wegovy, Mounjaro, Zepbound, Rybelsus, Saxenda, Victoza, Trulicity, compounded, etc.)
**Target:** People managing weight loss or diabetes on GLP-1s — mercado global en inglés, lanzamiento **Android/Play Store first**
**Monetization:** HARD PAYWALL (decidido 2026-07-04, basado en RevenueCat State of Subscription Apps 2026) — sin suscripción no hay acceso. Monthly $9.99 / Annual $59.99 preseleccionado con trial de 7 días solo en anual.
**Flujo:** welcome → quiz pre-auth (6 pasos) → value screen → registro → paywall bloqueante → app
**Nombre**: repo GitHub `christiangf28/semmly`, pero el package Android es `com.getmilli.app` (intencional — no se puede cambiar tras crear la app en Play Console, ver CHANGELOG 2026-07-05(b)).

---

## Estado actual (al cerrar sesión 2026-07-06 — v2.0.0)

**🚫 BLOQUEANTE: Google rechazó la release de closed testing** por "Play Console Requirements": apps con funciones médicas declaradas (educación médica + gestión de medicamentos — reales en la app) requieren **cuenta de organización**, y la cuenta actual es personal. Decisión: constituir una **SpA en Chile** con objeto social amplio → D-U-N-S → cuenta org de Play → transferir la app. **Todo el detalle de la empresa/trámite (no del código) vive en `Desktop\Documentos\Maqui Salud Digital SpA\CONTEXTO-EMPRESA.md` y en `Desktop\Semmly\PLAN-CUENTA-ORGANIZACION.md` — leer esos archivos primero para retomar el hilo del trámite.** Timeline 2-6 semanas (D-U-N-S manda). Sin sideload a testers mientras tanto (decisión de Chris). NO redeclarar salud de menos: riesgo de strike.

**Avance del trámite (al 2026-07-07, resumen — detalle completo en CONTEXTO-EMPRESA.md):** SpA **Maqui Salud Digital SpA** constituida, RUT **78.462.382-3**. ✅ Inicio de Actividades SII confirmado y aprobado. 🔄 D-U-N-S en curso (gratis, vía dnb.com opción "I'm a Google developer"; formulario extenso de D&B ya completado). Falta: cuenta de organización Play (US$25, requiere D-U-N-S) → transferir la app.

**Código**: rama `main`, todo commiteado. App **v2.0.0 / versionCode 2**. Sesión 2026-07-05(d-e): revisión profunda completa + 13 commits — coach seguro (mensajes persistidos server-side, validación de tamaño), fechas locales (lib/dates.ts), Track carga el log del día, suscripción reactiva (listener RC + focus), i18n 100% (notificaciones, push, logros, insights, legales), entitlement `Semmly Pro`, link RC en cada login, Google OAuth y Forgot Password removidos de v1, deps pesadas fuera (APK 128→89MB).
**Edge Function coach**: DESPLEGADA y verificada e2e (primer deploy histórico; `ANTHROPIC_API_KEY` como secret; project-ref `wxorkmbztzoiupehfwfx`).
**RevenueCat**: COMPLETO — productos `premium:monthly`/`premium:annual` (Play) attachados al entitlement **`Semmly Pro`** (renombrado por Chris; el código debe coincidir letra por letra), offering `default` con packages Annual/Monthly verificado por API. Reviewer con grant promocional lifetime. Link Supabase↔RC en cada sign-in (fix en _layout).
**Sentry**: FUNCIONANDO (DSN real en EAS prod+preview y .env; primer evento capturado = robo-crawler de Google).
**Play Console**: productos activos + trial anual activo, license testers (12 + Chris), ficha completa (screenshots en `store-assets/screenshots/` + textos). AAB v2.0.0 en `Desktop\Semmly\semmly-v2.0-closed-testing.aab` — listo para re-subir desde la cuenta de organización.
**Cuenta de prueba (reviewer)**: `christiangf28+milli-review@gmail.com` / `MilliReview2026!`, Supabase ID `162b866f-89bb-4e70-965c-c085af684fa7` — con 14 días de logs sembrados y grant Semmly Pro.
**Mensaje de bienvenida a testers**: redactado (EN/ES) — enviarlo solo cuando haya release aprobada (links de testing dan 404 antes).

### Cómo retomar
1. Leer `Desktop\Documentos\Maqui Salud Digital SpA\CONTEXTO-EMPRESA.md` (estado de la SpA/trámites) y `Desktop\Semmly\PLAN-CUENTA-ORGANIZACION.md` (guía paso a paso del trámite) — ninguno de los dos es código, son el hilo de la empresa.
2. Si D-U-N-S ya llegó y la cuenta org de Play ya existe: transferir app → re-verificar suscripción/license testers/service account de RevenueCat → re-subir AAB v2.0.0 → closed testing.
3. Mientras tanto, backlog v2.1 (pedidos de Chris 2026-07-05, no bloqueante):
   - Lista de medicamentos con mayúscula inicial: los IDs `ozempic`/`wegovy`/`mounjaro`/`zepbound`/`rybelsus`/`saxenda`/`victoza`/`trulicity` no tienen entrada en `onboarding.medication.meds.*` de los locales (solo existen los viejos semaglutide/tirzepatide/etc.) → agregar las 8 keys en en.ts/es.ts.
   - "Other medication": campo de texto opcional para el nombre (modal de Profile + onboarding). Se guarda en `users.medication` sin migración (MED_LABEL hace fallback al valor crudo).
   - Dosis opcional: POSTERGADO — contradice la Privacy Policy publicada ("no recolectamos dosis"), acerca a app médica, el Coach tiene prohibido hablar de dosis. Reevaluar con feedback de testers.
   - Warning "SecureStore value larger than 2048 bytes" (sesión JWT Supabase): funciona hoy, migrar a AsyncStorage + refresh token en SecureStore antes de que futuras versiones de Expo lo hagan error.
   - Menores: tokens de color repetidos (#5BA8D0/gradientes), ThemeContext useMemo, weightUnit no persistido, columna `energy` vestigial, mensajes intro del coach no persistidos, evaluar Haiku 4.5 en vez de Sonnet para el coach (costo).
4. IMPORTANTE al hablar con Chris: es de CHILE, sin voseo argentino.

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
