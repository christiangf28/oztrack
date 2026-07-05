# Guía de lanzamiento beta — Semmly en Google Play

## FASE 1 — GitHub Pages (Privacy Policy URL)

Google Play exige una URL pública de Política de Privacidad. La tienes lista en `docs/`.

1. Sube el repositorio a GitHub (si no lo tienes):
   ```
   git init
   git add .
   git commit -m "Semmly v1.0"
   git remote add origin https://github.com/TU_USUARIO/semmly.git
   git push -u origin main
   ```
2. En GitHub → Settings → Pages → Source: "Deploy from branch" → branch: `main` → folder: `/docs`
3. Tu Privacy Policy quedará en:
   `https://TU_USUARIO.github.io/semmly/privacy.html`
4. Guarda esa URL — la necesitarás en Google Play Console.

---

## FASE 2 — EAS Build (Android)

### 2.1 Instalar EAS CLI
```bash
npm install -g eas-cli
```

### 2.2 Login con tu cuenta Expo
```bash
eas login
```
(Crea cuenta gratis en expo.dev si no tienes)

### 2.3 Configurar el proyecto EAS
```bash
eas build:configure
```
Esto rellena automáticamente `extra.eas.projectId` en `app.json`.

### 2.4 Configurar secrets de producción en EAS
Las variables de entorno NO se suben con el código. Agrégalas en el dashboard de EAS:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_ANTHROPIC_API_KEY --value "sk-ant-api03-..."
```
O ve a: https://expo.dev → tu proyecto → Secrets → Add secret

Variables a agregar:
- `EXPO_PUBLIC_ANTHROPIC_API_KEY` — tu clave de Anthropic
- `EXPO_PUBLIC_SUPABASE_URL` — https://wxorkmbztzoiupehfwfx.supabase.co
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — tu anon key de Supabase

### 2.5 Build de prueba (APK para instalar en tu teléfono)
```bash
eas build --platform android --profile preview
```
- Genera un APK instalable directamente
- Prueba toda la app antes del build de producción
- El build tarda ~10-20 minutos en los servidores de Expo
- Recibirás un link para descargar el APK cuando termine

### 2.6 Build de producción (AAB para Google Play)
```bash
eas build --platform android --profile production
```
- Genera un .aab firmado y listo para subir a Google Play
- EAS genera y gestiona el keystore de firma automáticamente
- **Importante:** guarda el keystore en un lugar seguro desde expo.dev

---

## FASE 3 — Google Play Console

### 3.1 Crear cuenta de desarrollador
- URL: https://play.google.com/console
- Pago único de $25
- Verificación de identidad (puede tardar 1-2 días)

### 3.2 Crear la app
1. "Crear app" → nombre: **Semmly**
2. Idioma: Español (España) o Español (Latinoamérica)
3. Tipo: App (no juego)
4. Gratis / De pago: **Gratis** (con compras integradas)

### 3.3 Store listing (Ficha de Play Store)
Rellena con los textos de `docs/google-play-listing.md`:
- Nombre de la app: `Semmly — GLP-1 Companion`
- Descripción corta (80 chars)
- Descripción completa
- Icono: necesitas el `icon.png` exportado a **512×512 px**
- Screenshots: mínimo 2 capturas del teléfono (1080×1920 px)

**Para hacer screenshots:** usa el emulador de Android en Android Studio o un teléfono Android con la app instalada (preview build).

### 3.4 Configurar sección "Data Safety" (obligatoria)
Esta sección declara qué datos recopila la app:

| Tipo de dato | ¿Se recopila? | ¿Se comparte? | ¿Se cifra? |
|---|---|---|---|
| Dirección de email | Sí | No | Sí (en tránsito) |
| Información de salud | Sí | No | Sí (en tránsito) |
| Mensajes en la app | Sí | Sí (Anthropic, solo procesamiento) | Sí |
| Historial financiero | No | — | — |

- ¿Se pueden eliminar los datos? → **Sí** (contactando soporte)
- URL de Política de Privacidad → tu URL de GitHub Pages

### 3.5 Calificación de contenido
- Completa el cuestionario: sin violencia, sin contenido adulto
- La app menciona medicamentos → audiencia recomendada: **18+**

### 3.6 Subir el AAB y lanzar beta
1. Menú izquierdo → Testing → Internal Testing (o Closed Testing)
2. "Crear versión" → subir el .aab generado por EAS
3. Añadir testers (por email o grupo de Google)
4. Revisar y lanzar

**Diferencia entre tracks:**
- **Internal Testing**: hasta 100 testers, aprobación instantánea, no aparece en búsquedas
- **Closed Testing (Alpha/Beta)**: más testers, revisión de Google (1-3 días), no aparece en búsquedas públicas
- **Open Testing**: cualquiera puede unirse desde la ficha de Play

Para la primera beta, usa **Internal Testing** — es inmediato.

---

## CHECKLIST FINAL

### Código ✅
- [x] privacy.tsx y terms.tsx — useTheme() correcto
- [x] EXPO_PUBLIC_ANTHROPIC_API_KEY — prefijo correcto para bundle
- [x] app.json — package, versionCode, permissions, plugins
- [x] eas.json — profiles de build configurados

### Contenido para subir ✅
- [x] Privacy Policy HTML (`docs/privacy.html`)
- [x] Textos de Store listing (`docs/google-play-listing.md`)
- [ ] Screenshots (2 mínimo — tomar con preview build)
- [ ] Icono 512×512 px

### Acciones pendientes (requieren tu intervención)
- [ ] Subir repo a GitHub y activar GitHub Pages
- [ ] `eas login` + `eas build:configure`
- [ ] Agregar secrets en EAS dashboard
- [ ] `eas build --platform android --profile preview` → probar en teléfono
- [ ] `eas build --platform android --profile production`
- [ ] Crear cuenta Google Play Console ($25)
- [ ] Subir AAB + store listing + screenshots
- [ ] Lanzar en Internal Testing
