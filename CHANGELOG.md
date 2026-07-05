# Changelog — Semmly

Todas las fechas en formato YYYY-MM-DD. Idioma del changelog: español (comunicación interna); copy de la app: inglés US + español.

## [Unreleased] — Fase 1: Monetización (hard paywall)

### 2026-07-05 (c) — Play Console + RevenueCat en curso, i18n completo, fixes de testing

**Play Console (en progreso, no terminado)**
- App creada bajo package `com.getmilli.app` (nombre visible ya cambiado a "Semmly" en la ficha).
- Content rating (IARC), Data Safety, público objetivo 18+, ads=No, ya completados.
- Suscripción `premium` creada con 2 planes base: `monthly` ($9.99, sin trial) y `annual` ($59.99, con oferta `annual-trial-7d` de 7 días gratis, elegibilidad "nuevos clientes").
- **Pendiente**: terminar de guardar la oferta del plan anual y activar todo; luego crear el "Offering" espejo en RevenueCat.
- Cuenta de servicio Google configurada; falta habilitar **Cloud Pub/Sub API** en Google Cloud Console (avisado al usuario, no confirmado si ya lo hizo).

**RevenueCat — bug real encontrado y corregido**
- El entorno **"preview" de EAS nunca tuvo `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`** (solo estaba en "production"), por eso el SDK nunca inicializaba en los builds de prueba y no aparecía ningún customer en el dashboard. Corregido: la key ya está en ambos entornos.
- Cuenta de prueba para el reviewer de Google: `christiangf28+milli-review@gmail.com` / `MilliReview2026!`, Supabase user ID `162b866f-89bb-4e70-965c-c085af684fa7`. Pendiente otorgarle el entitlement `premium` en RevenueCat una vez que el customer aparezca en el dashboard (requiere que un build con la key correcta corra al menos una vez en un dispositivo/emulador con Play Store).

**QA unlock temporal**
- Se agregó un botón "QA unlock (test builds only)" en el paywall, gateado por `EXPO_PUBLIC_QA_UNLOCK` (solo en entorno "preview" de EAS). Permite saltar el hard paywall en builds de testing sin depender de RevenueCat/Play Billing (los emuladores sin Play Store no soportan bien Play Billing). **IMPORTANTE: remover `EXPO_PUBLIC_QA_UNLOCK` del entorno preview antes de compilar el build que reciban los 12 testers reales** (buscar en `hooks/useSubscription.ts` y `app/paywall.tsx`).

**Coach IA — bug crítico corregido**
- El system prompt de la Edge Function forzaba "responde siempre en español" sin importar el idioma del usuario. `coachSystemPrompt(lang)` ahora recibe el idioma desde el cliente (`i18n.language`) y responde en inglés por defecto, español si corresponde.

**i18n — conversión completa a inglés/español**
- Convertidas a `react-i18next` todas las pantallas que quedaban 100% o parcialmente hardcodeadas en español: tabs (`_layout.tsx`), Track, Coach, Profile, Progress (chrome principal), onboarding completo (demographics, duration, goals, symptoms, disclaimer, welcome), login, register.
- **Selector de idioma real** agregado en Perfil → Ajustes → Idioma (antes mostraba una alerta de "próximamente"). `i18n/index.ts` persiste la elección manual en AsyncStorage (`setAppLanguage()`), pero sigue detectando el idioma del dispositivo por defecto la primera vez.
- Fix menor: "semmly" en minúscula en el hero de login/register se veía mal en fuente de sistema plana (solo funciona en la tipografía redondeada custom del splash) — cambiado a "Semmly".
- **Pendiente (no bloqueante)**: `generateInsights()` en `progress.tsx` y los títulos/descripciones de `useAchievements.ts` siguen generando texto en español dinámicamente — no se tradujeron en esta sesión.

**Fix de layout**
- Paywall: el aviso de renovación automática y los links Terms/Privacy quedaban pegados en la misma línea por un `\n` embebido dentro de un `flexDirection: row` (no empuja a los hermanos a la siguiente línea en RN). Separado en dos filas apiladas.
- Agregada nota de tranquilidad cerca del CTA: "Cancel anytime during your trial — you won't be charged" (solo visible cuando el plan anual está seleccionado), en inglés y español.

**Testing con emulador Android**
- Se instaló Android Studio + emulador, y se maneja vía `adb` (instalar APK, `uiautomator dump` para ubicar coordenadas exactas de botones, `screencap` para capturas) para navegar la app sin intervención manual. Nota técnica: usar `MSYS_NO_PATHCONV=1` antes de comandos `adb shell` con rutas tipo `/sdcard/...` en Git Bash de Windows, si no MSYS reescribe la ruta como si fuera de Windows y falla.
- Build de referencia con todo lo de esta sesión: **build ID `dc8b0248-0c90-450e-a2dc-08791edfe8a5`** (perfil `preview`), lanzado al cerrar la sesión — revisar con `npx eas build:view dc8b0248-0c90-450e-a2dc-08791edfe8a5` si terminó bien.

**Pendiente inmediato al retomar**
1. Verificar que el build `dc8b0248...` terminó OK, descargar el APK e instalarlo en el emulador (o pedir al usuario que lo haga).
2. Recorrer el onboarding, tocar "QA unlock" en el paywall, y sacar 4-6 screenshots reales para Play Store (ya en inglés).
3. Terminar de guardar la oferta del plan anual en Play Console (si no se hizo) y crear el Offering en RevenueCat.
4. Confirmar si el usuario habilitó Cloud Pub/Sub API.
5. Una vez que haya subscripciones reales, otorgar `premium` a la cuenta de prueba del reviewer en RevenueCat.

### 2026-07-05 (b) — Rebrand: Milli → Semmly

**Decisión**: "Milli" descartado tras verificar colisiones reales — existe "Milli" (co.genvis.milli) app de wellness/juegos de palabras en ambas tiendas, y más grave, **millihealth.com** es un "AI-powered health coach" casi idéntico en posicionamiento al nuestro. "Wren", "Vela", "Viora", "Lumora", "Syntra", "Aviora" y "Glymo" también descartados por colisión (ver sesión 2026-07-05). **Semmly** elegido: nod a semaglutida, sin colisión exacta verificada.

**Cambiado**
- Rebrand del nombre visible en 20+ archivos: UI, wordmark, persona del coach, legales, docs, i18n EN/ES, repo GitHub (`christiangf28/semmly`).
- **Importante**: `app.json` mantiene intencionalmente `package`/`bundleIdentifier` = `com.getmilli.app` — la app en Play Console ya estaba creada con ese identificador y todo el formulario de contenido (clasificación IARC, datos de usuario, público objetivo) ya completado bajo ese package. Cambiarlo habría obligado a crear una app nueva en Play Console desde cero. Solo cambia el nombre visible ("Semmly"); el package interno es invisible al usuario.
- Pendiente manual: cambiar "Nombre de la app" en Play Console (Store presence → Main store listing) de "Milli" a "Semmly"; renombrar el proyecto en RevenueCat (cosmético).
- Splash screen y feature graphic tienen el wordmark "milli" horneado en la imagen — pendiente regenerar con Gemini usando el prompt de splash/feature graphic pero con "semmly".

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

**Decisión**: "Oztrack" descartado por riesgo de trademark (evoca Ozempic®, Novo Nordisk es litigiosa); "Plume" descartado (Plume Clinic, telehealth USA). **Milli** elegido en ese momento: guiño a los miligramos (nombre descartado un día después, ver entrada 2026-07-05 (b) más arriba).

**Cambiado**
- Rebrand completo en 20+ archivos: nombre visible, wordmark en auth, persona del coach ("Oz Coach" → "Milli"), legales, docs, i18n EN/ES.
- `app.json`: name "Milli", scheme "milli", package/bundleId `com.getmilli.app` (este package se mantuvo en el rename posterior a Semmly). El `slug` sigue siendo "oztrack" para no romper el vínculo con el proyecto EAS.
- Emails de contacto → `support@getmilli.app` / `privacy@getmilli.app`.
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
