# 🪟 Guía de Prueba en Windows - CALIPAN VIRREY Offline

## 🚀 Paso 1: Eliminar Cache Anterior

Para asegurar que el nuevo Service Worker se registra sin conflictos:

```
1. Abre DevTools: Presiona F12
2. Ve a Application → Storage
3. Bajo "Clear site data" (lado izquierdo), marca TODO:
   ☑️ Cache Storage
   ☑️ Cookies
   ☑️ Local Storage
   ☑️ Session Storage
4. Dale click en "Clear site data"
```

## 🌐 Paso 2: Accede a la App

**URL LOCAL (tu PC)**:
```
http://localhost:5176/
```

**Desde otro dispositivo**:
```
http://10.136.13.127:5176/
```

## 📦 Paso 3: Verifica el Service Worker

Abre DevTools (F12) y ve a **Application** → **Service Workers**:

```
✅ Debe mostrar:
  Status: "activated and running"
  Scope: http://localhost:5176/ (o tu URL)
  CALIPAN-VIRREY-V3
```

Si ves rojo/error:
- Recarga la página (Ctrl+F5 para limpiar cache)
- Espera 5 segundos
- Actualiza

## 💾 Paso 4: Deja que Cachee

El primer acceso es importante para cachear:

1. ✅ **Login** con usuario: `calipan` (contraseña: `calipan2026`)
2. ✅ **Navega** por todas las funciones:
   - 📖 Recetas
   - 🧮 Calculadora  
   - 🛒 Inventario
   - 💰 Costos
3. ✅ **Espera 10 segundos** (el SW cachea todo automáticamente)

En la consola verás:
```
💾 Assets cacheado: http://localhost:5176/assets/index-xxxxx.js
💾 Assets cacheado: http://localhost:5176/index.html
✅ Cache core completado
```

## 📴 Paso 5: Prueba Offline

### Opción A: Con DevTools (Más fácil para pruear)

```
1. F12 → Abre DevTools
2. Ve a Application → Service Workers
3. Marca el checkbox: "Offline" ☑️
4. Presiona F5 (Recargar)
```

**Resultado esperado**:
- ✅ La página carga normalmente (desde cache)
- ✅ Todas las recetas visibles
- ✅ Calculadora funciona
- ✅ Costos muestran datos guardados
- ✅ En console ves: "✅ Encontrado en cache"

### Opción B: Sin Internet (Más realista)

```
1. Cierra DevTools (F12)
2. **Desactiva WiFi completamente**:
   - Haz click en icon WiFi (esquina inferior derecha)
   - Click en tu WiFi red
   - Disconectar
3. Recarga la página (F5)
```

**Resultado esperado**:
- ✅ La página carga desde cache
- ✅ Todas las funciones responden
- ✅ No hay errores en console

### Opción C: Modo Avión (Más seguro)

```
1. Presiona Windows + A (para abrir Center de Notificaciones)
2. Click en "Modo Avión" ✈️
3. Vuelve a la app
4. Recarga (F5)
```

**Resultado esperado**: Mismo que Opción B ✅

## 🔍 Debugging - Console Messages

Cuando estés en **Offline**, en la console deberías ver:

```
❌ Network falló, buscando en cache: http://localhost:5176/
✅ Encontrado en cache: http://localhost:5176/
```

O para assets:

```
✅ Assets desde cache: http://localhost:5176/assets/index-xxxxx.js
✅ Encontrado en cache: http://localhost:5176/
```

Si ves:
```
❌ Network failed, buscando en cache
❌ Service Worker registration failed
```

Significa que algo no está bien. Intenta:
1. Limpiar cache completamente (ver Paso 1)
2. Recargar con Ctrl+Shift+R (hard refresh)
3. Esperar 10 segundos
4. Recargar nuevamente

## 📱 Instalar como PWA en Windows

**En Chrome o Edge**:

```
1. Abre la URL: http://localhost:5176/
2. Espera 5 segundos
3. Ver un botón "Instalar" en la barra de direcciones:
   [Instalar CALIPAN VIRREY] ← Haz click aquí
4. Si no ves botón:
   - Botón derecho en la página
   - "Instalar esta aplicación como app"
5. Confirma
```

**Después de instalar**:

```
1. Abre el Menú Inicio de Windows
2. Busca: "CALIPAN VIRREY"
3. Haz click para abrir como app standalone
4. Ahora es una app de verdad (no tab del navegador)
5. Prueba offline:
   - Desactiva WiFi
   - Abre la app
   - ✅ Funciona completamente offline
```

## ⚡ Pruebas Completas Recomendadas

### Test 1: Cache Basic
- [ ] Limpia sitio (Paso 1)
- [ ] Accede a localhost:5176
- [ ] Espera 10 segundos
- [ ] DevTools → Offline ✓
- [ ] Recarga
- [ ] ✅ Debe cargar (busca "Encontrado en cache" en console)

### Test 2: Multiple Navigations
- [ ] Offline ✓
- [ ] Navega por todas las secciones:
  - [ ] Inicio
  - [ ] Recetas
  - [ ] Calculadora
  - [ ] Inventario (si eres admin)
  - [ ] Costos (si eres admin)
- [ ] ✅ Todo debe funcionar sin internet

### Test 3: Data Persistence
- [ ] Estando ONLINE:
  - [ ] Login con `calipan`
  - [ ] Crea una nueva receta
  - [ ] Agrégale ingredientes
  - [ ] Guarda
- [ ] Desactiva WiFi
- [ ] OFFLINE:
  - [ ] Recarga página
  - [ ] ✅ Tu receta nueva debe aparecer
  - [ ] ✅ Puedes verla, editarla, usarla en calculadora

### Test 4: Installed App Experience
- [ ] Instala como PWA (ver sección arriba)
- [ ] Cierra Chrome/Edge completamente
- [ ] Abre la app CALIPAN VIRREY desde Inicio
- [ ] Desactiva WiFi
- [ ] Recarga en la app
- [ ] ✅ Debe funcionar perfectamente

## 🐛 Solución de Problemas

### Problema: "Página en blanco" offline
**Solución**:
1. Limpia cache (Paso 1)
2. Recarga con Ctrl+Shift+R
3. Espera 30 segundos online
4. Prueba offline nuevamente

### Problema: Service Worker no registra
**Solución**:
1. Verifica en console si dice: "Service Worker registration failed"
2. Abre index.html → busca `navigator.serviceWorker.register`
3. Debe ser `/sw.js` (no `./sw.js` ni otra ruta)
4. Limpia cache E cookies

### Problema: Datos no persisten offline
**Solución**:
1. Abre DevTools → Application → Local Storage
2. Busca key: `calipan-state`
3. Si no existe, es porque no se guardó online
4. Haz algunas acciones online (crear receta, ingresar inventario)
5. Cierra y reabre DevTools
6. ✅ Debe existir `calipan-state` con datos

### Problema: PWA no instala
**Solución**:
1. Asegúrate que `manifest.json` existe en `/public`
2. En DevTools → Application → Manifest
3. Debe mostrar `"start_url": "/"`
4. Y `"display": "standalone"`
5. Si no aparece botón Instalar:
   - Botón derecho → Instalar aplicación
   - O: ⋮ menú → Apps → Instalar aplicación

## 📊 Verificación Final

Para confirmar que todo está correcto, abre DevTools y verifica:

**Application → Cache Storage**:
```
✅ Debe haber un cache llamado: "calipan-virrey-v3"
   Dentro debe tener:
   - index.html
   - manifest.json
   - assets/index-[HASH].js
   - Y otros archivos
```

**Application → Service Workers**:
```
✅ Status: "activated and running"
✅ Scope: http://localhost:5176/ (o tu dominio)
```

**Application → Local Storage**:
```
✅ Key: "calipan-state"
   Value: JSON con tus recetas, inventario, etc.
```

Si todo esto existe ✅, tu app está **listo para offline completo**.

## 🎉 ¡Listo!

Tu CALIPAN VIRREY PWA ahora:
- ✅ Funciona 100% offline
- ✅ Cachea todos los assets automáticamente
- ✅ Preserva datos en localStorage
- ✅ Es instalable como app en Windows
- ✅ Carga instantáneamente desde cache

**Disfruta tu panadería app sin internet! 🥐**

---

Cualquier duda, abre **DevTools → Console** y busca los mensajes 🔧 para ver qué está pasando.
