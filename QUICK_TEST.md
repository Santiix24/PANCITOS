🥐 PRUEBA OFFLINE EN 5 MIN
═════════════════════════════════════════════════════════════════════════════

⚡ PASO 1: ACCEDE A LA APP (30 segundos)
─────────────────────────────────────────────────────────────────────────────
1. Abre navegador (Chrome o Edge)
2. Ve a: http://localhost:5176/
3. Login con: calipan / calipan2026
4. Espera 10 segundos (cachea los assets)


⚡ PASO 2: ACTIVA MODO OFFLINE (10 segundos)
─────────────────────────────────────────────────────────────────────────────
1. Presiona F12 (abre DevTools)
2. Ve a: Application → Service Workers
3. Marca el checkbox: "Offline" ☑️
4. Presiona F5 (recargar)

✅ RESULTADO ESPERADO:
   • La página carga normalmente
   • Todas las recetas visibles
   • Puedes navegar sin problemas
   • En console ves: "✅ Encontrado en cache"


⚡ PASO 3: NAVEGA POR LA APP (2 min)
─────────────────────────────────────────────────────────────────────────────
Prueba estas funciones (SIN INTERNET):

1. 📖 RECETAS
   ✅ Ver todas las recetas
   ✅ Buscar una receta
   ✅ Filtrar por Panadería/Pastelería

2. 🧮 CALCULADORA
   ✅ Selecciona una receta
   ✅ Escala por cantidad (ej: 5 panes)
   ✅ Ver cálculo de masa

3. 💾 DATOS GUARDADOS
   ✅ Si creaste algo online, verás los datos


⚡ PASO 4: VERIFICA FUNCIONA (1 min)
─────────────────────────────────────────────────────────────────────────────
Busca en console (F12 → Console):

Deberías ver estos mensajes ✅:
   ✅ Service Worker registrado correctamente
   ❌ Network falló, buscando en cache
   ✅ Encontrado en cache: http://localhost:5176/


❌ PROBLEMAS?
─────────────────────────────────────────────────────────────────────────────

❌ Pantalla blanca
   → Abre DevTools
   → Ir a Application
   → Limpia TODO: "Clear site data"
   → Recarga
   → Espera 10 segundos
   → Prueba offline de nuevo

❌ "Service Worker registration failed"
   → Limpia cache (ver arriba)
   → Cierra Chrome completamente
   → Reabre y vuelve a http://localhost:5176/

❌ "Network Error" en console
   → Esto es NORMAL en offline
   → Busca debajo: "✅ Encontrado en cache"
   → Si ves, significa que FUNCIONA


🎯 TL;DR (Muy resumido)
─────────────────────────────────────────────────────────────────────────────

1. Accede: http://localhost:5176/
2. F12 → Application → Service Workers → Marca "Offline" → F5
3. ✅ FUNCIONA #OfflineReady


🚀 VERSIÓN AVANZADA (Instalable)
─────────────────────────────────────────────────────────────────────────────

1. Abre: http://localhost:5176/
2. Busca botón "Instalar" en la barra de direcciones
3. Click → "Instalar"
4. Abre desde Menú Inicio → CALIPAN VIRREY
5. Desactiva WiFi
6. ✅ App funciona como app nativa desktop


═════════════════════════════════════════════════════════════════════════════════
¡Eso es todo! Tu app offline está lista! 🥐✨
═════════════════════════════════════════════════════════════════════════════════
