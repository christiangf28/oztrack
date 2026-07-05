# Changelog — Milli

Todas las fechas en formato YYYY-MM-DD. Idioma del changelog: español (comunicación interna); copy de la app: inglés US + español.

## [Unreleased] — Fase 1: Monetización (hard paywall)

### 2026-07-05 — API key fuera del cliente + Sentry

**Seguridad (crítico, cerrado)**
- La API key de Anthropic ya NO viaja en el cliente. Se movió a `supabase/functions/coach/index.ts`, una Edge Function que hace de proxy: recibe el JWT del usuario, arma el contexto (medicamento/objetivo/últimos registros vía RLS, sin email ni user_id) y llama a Claude con la key como secret de Supabase.
- Límite anti-abuso server-side: 30 mensajes/24h por usuario (ventana móvil), pensado para el closed testing con testers desconocidos — evita que un loop de cliente o un mal uso queme el crédito de la API. Historial enviado a Claude capado a los últimos 20 mensajes.
- `lib/anthropic.ts` reescrito: expone `askCoach(messages)` que llama a la función vía `supabase.functions.invoke`; se eliminó `@anthropic-ai/sdk` del cliente (dependencia removida de package.json).
- `.env`: `EXPO_PUBLIC_ANTHROPIC_API_KEY` eliminado. Pendiente correr `supabase secrets set ANTHROPIC_API_KEY=...` y `supabase functions deploy coach` (bloqueado por login de la CLI, ver pendientes).

**Añadido**
- Sentry (`@sentry/react-native`) integrado para crash reporting — reemplaza/complementa alertas tipo Discord. Captura automática de errores no manejados + `Sentry.captureException` explícito en fallas del coach y de compras/restore (paywall). Gateado por `EXPO_PUBLIC_SENTRY_DSN` (placeholder en `.env`, pendiente crear cuenta).
- `tsconfig.json` excluye `supabase/functions` (runtime Deno, no Node/RN).

### 2026-07-04 (b) — Rebrand: Oztrack → Milli

**Decisión**: "Oztrack" descartado por riesgo de trademark (evoca Ozempic®, Novo Nordisk es litigiosa); "Plume" descartado (Plume Clinic, telehealth USA). **Milli** elegido: guiño a los miligramos, sin colisiones en salud/wellness (verificado 2026-07-04).

**Cambiado**
- Rebrand completo en 20+ archivos: nombre visible, wordmark en auth, persona del coach ("Oz Coach" → "Milli"), legales, docs, i18n EN/ES.
- `app.json`: name "Milli", scheme "milli", package/bundleId `com.getmilli.app` (definir dominio: getmilli.app o milli.health — comprar antes de publicar). El `slug` sigue siendo "oztrack" para no romper el vínculo con el proyecto EAS.
- Emails de contacto → `support@getmilli.app` / `privacy@getmilli.app` (crear cuando haya dominio).
- Claves internas de AsyncStorage (`oztrack_*`) se mantienen a propósito (invisibles al usuario).

**Añadido**
- Assets nuevos de marca (generados con Gemini, watermark removido, procesados con Pillow): `icon.png` 1024², `adaptive-icon.png` 1024² (droplet+halo reconstruidos dentro de la zona segura de Android), `splash.png` 1284×2778, `notification-icon.png` 96² (silueta blanca+alpha), `favicon.png`. Feature graphic 1024×500 para Play Console en `Desktop\Oztrack\feature-graphic-1024x500.png`.

### 2026-07-04

**Añadido**
- Quiz de onboarding pre-auth: el usuario responde todo el quiz ANTES de crear cuenta (welcome → disclaimer → medication → demographics → duration → goals → symptoms → struggles → value screen → registro → paywall).
- Pantalla nueva `onboarding/struggles.tsx`: qué le cuesta más al usuario (efectos secundarios, antojos, constancia, estancamiento, motivación, días de inyección). Multi-select, i18n EN/ES.
- Pantalla nueva `onboarding/value.tsx`: resumen personalizado del plan (medicamento, objetivo, síntomas, focos) antes de pedir la cuenta. i18n EN/ES.
- `lib/quiz.ts`: respuestas del quiz persistidas en AsyncStorage (sobreviven reinicios); `saveProfileFromQuiz()` vuelca el quiz a Supabase al registrarse.
- Medicamentos ampliados: Saxenda y Victoza (liraglutida), Trulicity (dulaglutida), GLP-1 compuesto (farmacia magistral). Total 10 opciones, con i18n.
- Columna `struggles text[]` en `users` (schema + migración `supabase/migrations/2026-07-04_add_struggles.sql`).
- Social proof placeholder y términos de renovación automática en el paywall (requisito de tienda).

**Cambiado**
- **Hard paywall**: sin suscripción activa no hay acceso a la app (gating en `app/index.tsx`). El paywall solo es cerrable si se abre desde Profile (`?dismissable=1`).
- Trial de 7 días **solo en el plan anual** (banner y CTA dinámicos según plan seleccionado).
- Paywall convertido a i18n EN/ES (antes español hardcodeado).
- `useSubscription`: eliminado el bypass que daba premium a todos si RevenueCat no estaba configurado. Ahora: sin RC ⇒ no premium. En `__DEV__` existe un botón "Continue (dev)" en el paywall que marca un flag local para poder navegar la app.
- `initRevenueCat()` ahora se llama al arrancar la app (antes no se llamaba nunca — el SDK jamás se inicializaba) y `Purchases.logIn(userId)` al registrarse.
- Registro: crea el perfil desde el quiz guardado y redirige al paywall (antes iba al onboarding post-auth).

**Pendiente de Fase 1**
- Crear productos en Google Play Console + RevenueCat dashboard (monthly $9.99, annual $59.99 con trial 7 días) y reemplazar `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` en `.env` (hoy es placeholder).
- Correr la migración `2026-07-04_add_struggles.sql` en Supabase.
- Paso de notificaciones dentro del quiz (opt-in) — diferido.

**Deuda conocida (Fase 2)**
- API key de Anthropic todavía en el cliente (`lib/anthropic.ts`) — mover a Supabase Edge Function + pseudonimización.
- Copy de pantallas existentes (track, coach, progress, profile, auth, welcome, disclaimer, duration, goals, symptoms, demographics) todavía hardcodeado en español — migrar a i18n con EN default.
- `delete_user` RPC no existe en el schema — el borrado de cuenta no elimina el usuario de auth.
- Webhook RevenueCat → tabla `subscription_status` sin implementar.
