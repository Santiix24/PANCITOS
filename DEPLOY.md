# 🚀 GUÍA DE DEPLOY - CALIPAN VIRREY PWA

## 🎯 Opciones de Despliegue

Tu PWA puede desplegarse en múltiples plataformas. Te muestro las opciones:

---

## 1️⃣ NETLIFY (Recomendado - Gratis & Fácil)

### Paso 1: Crear cuenta
1. Ve a [netlify.com](https://netlify.com)
2. Sign up con GitHub
3. Autoriza acceso a tus repos

### Paso 2: Conectar repositorio
1. Click en "New site from Git"
2. Selecciona GitHub
3. Elige el repo `bakecontrol`

### Paso 3: Configurar build
```
Build command: npm run build
Publish directory: dist
Node version: 18
```

### Paso 4: Deploy automático
- Cada push a `main` → Deploy automático
- Tu PWA estará en: `https://calipan-virrey.netlify.app`

**Ventajas:**
✅ Deploy automático con Git
✅ SSL/HTTPS gratis
✅ CDN global
✅ Dominio personalizado

---

## 2️⃣ VERCEL (Alternativa a Netlify)

### Paso 1: Crear cuenta
1. Ve a [vercel.com](https://vercel.com)
2. Sign up con GitHub

### Paso 2: Importar proyecto
1. Click "New Project"
2. Selecciona repo `bakecontrol`
3. Vercel detecta automático: React + Vite

### Paso 3: Deploy
Automático. URL: `https://calipan-virrey.vercel.app`

**Ventajas:**
✅ Creador oficial de Next.js
✅ Deploy automático
✅ Análisis de performance

---

## 3️⃣ GITHUB PAGES (Gratis pero requiere subdominio)

### Paso 1: Modificar vite.config.ts
```typescript
export default defineConfig({
  base: '/bakecontrol/',  // Si el repo es privado
  // O usar: base: '/' si queda en raíz
})
```

### Paso 2: Agregar script en package.json
```json
"scripts": {
  "deploy": "npm run build && npx gh-pages -d dist"
}
```

### Paso 3: Deploy
```bash
npm run deploy
```

Tu app estará en: `https://tu-usuario.github.io/bakecontrol`

---

## 4️⃣ FIREBASE HOSTING

### Paso 1: Instalar Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Paso 2: Inicializar Firebase
```bash
firebase init hosting
```

Selecciona:
```
? What do you want to use as your public directory? dist
? Configure as a single-page app (rewrite all urls to index.html)? Yes
```

### Paso 3: Deploy
```bash
npm run build
firebase deploy
```

URL: `https://calipan-virrey.firebaseapp.com`

---

## 5️⃣ SERVIDOR PROPIO (DigitalOcean, Linode, Azure)

### Requisito: Node.js en el servidor

### Método 1: PM2 + Nginx
```bash
# En el servidor
sudo apt update
sudo apt install nodejs npm nginx

# Clonar repo
git clone <tu-repo>
cd bakecontrol
npm install
npm run build

# Instalar PM2
sudo npm install -g pm2

# Crear app.js para servir dist/
# (Simple http server)
```

### Método 2: Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "build"]
```

```bash
docker build -t calipan-virrey .
docker run -p 3000:3000 calipan-virrey
```

---

## 🔒 SEGURIDAD EN PRODUCCIÓN

### 1. HTTPS Obligatorio
- Netlify/Vercel: Automático ✅
- GitHub Pages: Automático ✅
- Servidor propio: Use Let's Encrypt

```bash
# Let's Encrypt (gratuito)
sudo apt install certbot nginx-certbot
certbot certonly --nginx -d tudominio.com
```

### 2. Headers de Seguridad
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

Netlify: `_headers` file
```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
```

### 3. Service Worker Seguro
El `sw.js` requiere HTTPS (excepto localhost)

### 4. Credenciales (IMPORTANTE ⚠️)

**Las credenciales en el código son HARDCODEADAS.**

Para producción real, considera:

**Opción 1: Supabase Auth (Recomendado)**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

**Opción 2: Firebase Auth**
```typescript
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const auth = getAuth(app)
await signInWithEmailAndPassword(auth, email, password)
```

**Opción 3: API Backend Propio**
```typescript
const response = await fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ username, password })
})
const token = await response.json()
localStorage.setItem('auth-token', token)
```

---

## 📊 DOMINIO PERSONALIZADO

### Registrar dominio
- GoDaddy, Namecheap, Google Domains
- Precio: $12-15/año

### Netlify
1. Dominio → Agregar dominio personalizado
2. Actualiza DNS en registrador:
```
CNAME: www.tudominio.com → nombre-del-sitio.netlify.app
```

### Vercel
1. Settings → Domains
2. Agregar dominio
3. Vercel proporciona DNS records

---

## 🔄 PIPELINE CI/CD

### GitHub Actions (Automático con GitHub)

Crear archivo: `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run build
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

Ventajas:
✅ Deploy automático con cada push
✅ Tests automáticos (si agregas Jest)
✅ Build verificado antes de deploy

---

## 📈 MONITOREO EN PRODUCCIÓN

### Sentry (Error tracking)
```typescript
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new Sentry.Replay()],
})
```

### Google Analytics
```typescript
// En index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Uptime Monitoring
- UptimeRobot (gratis)
- Alertas si la app cae

---

## 💾 BACKUP DE DATOS

Aunque uses localStorage offline, es recomendable:

### Opción 1: Exportar JSON
```typescript
const exportData = () => {
  const data = localStorage.getItem('calipan-state')
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `backup-${Date.now()}.json`
  link.click()
}
```

### Opción 2: Sincronizar con Supabase
```typescript
// Guardar en Supabase cada noche
setInterval(async () => {
  const state = localStorage.getItem('calipan-state')
  await supabase
    .from('backups')
    .insert([{ data: state, created_at: new Date() }])
}, 24 * 60 * 60 * 1000)
```

---

## 📋 CHECKLIST ANTES DE PRODUCCIÓN

- [ ] `npm run build` sin errores
- [ ] Service Worker registrado ✓
- [ ] Manifest válido ✓
- [ ] HTTPS habilitado
- [ ] Meta tags PWA ✓
- [ ] Icons configurados ✓
- [ ] Prueba en móvil (Chrome + Safari)
- [ ] Prueba offline (DevTools > Offline)
- [ ] Prueba instalación como app
- [ ] Datos sensibles NO en código
- [ ] Rate limiting si hay API
- [ ] Backup strategy definida

---

## 🚀 RESUMEN RÁPIDO

| Plataforma | Setup | Costo | Facilidad |
|-----------|-------|-------|-----------|
| **Netlify** | 5 min | Gratis | ⭐⭐⭐⭐⭐ |
| **Vercel** | 5 min | Gratis | ⭐⭐⭐⭐⭐ |
| **Firebase** | 10 min | Gratis | ⭐⭐⭐⭐ |
| **GitHub Pages** | 5 min | Gratis | ⭐⭐⭐ |
| **Servidor Propio** | 1 hora | $5-20/mes | ⭐⭐ |

**Recomendación:** Usa **Netlify** o **Vercel** para ganancia de productividad.

---

## 🔗 RECURSOS

- [Netlify Docs](https://docs.netlify.com)
- [Vercel Docs](https://vercel.com/docs)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

¡Tu PWA está lista para conquistar el mundo! 🌍📱✨
