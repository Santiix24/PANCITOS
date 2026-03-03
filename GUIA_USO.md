# 📚 GUÍA DE USO - CALIPAN VIRREY PWA

## 🎯 Guía Paso a Paso para Usar la App

---

## 1️⃣ PRIMER LOGIN

### Pantalla de Login
```
┌─────────────────────────────────┐
│         🥐 CALIPAN VIRREY       │
│     Panadería Premium           │
│                                 │
│ [Usuario: ____________]         │
│ [Contraseña: __________ 👁️]    │
│ ☑ Recordar credenciales        │
│                                 │
│      [ INGRESAR ]               │
│                                 │
│ Credenciales de prueba:         │
│ ├─ Admin: calipan/calipan2026  │
│ └─ Super: Administrador/...    │
└─────────────────────────────────┘
```

### Opción 1: Login como Admin
1. Usuario: `calipan`
2. Contraseña: `calipan2026`
3. Marca ☑ "Recordar credenciales"
4. Click "Ingresar"

**Resultado:** Acceso a TODO (Recetas, Calculadora, Inventario, Costos)

### Opción 2: Login como Solo Lectura
1. Usuario: `familia`
2. Contraseña: `familia2026`
3. Click "Ingresar"

**Resultado:** Solo ver recetas (sin editar/eliminar)

---

## 📖 MÓDULO 1: RECETAS

### 📝 Crear Nueva Receta

```
1. Click en "Recetas" (navbar)
2. Search bar: (vacío o con filtro)
3. Filtro: Todas / Panadería / Pastelería
4. Click en "+ Nueva" (botón azul)

↓ Se abre formulario ↓
```

**FORM: Nueva Receta**
```
┌─────────────────────────────────┐
│ 📖 Nueva Receta                 │
├─────────────────────────────────┤
│                                 │
│ Nombre: [Pan de Molde ______]   │
│                                 │
│ Categoría: [Panadería ▼]        │
│ Temperatura: [220 °C]           │
│                                 │
│ Tiempo: [35 minutos]            │
│                                 │
│ Ingredientes:                   │
│ ├─ [Harina] [500] [g] [X]      │
│ ├─ [Agua] [300] [ml] [X]       │
│ ├─ [Sal] [10] [g] [X]          │
│ └─ [+ Añadir]                   │
│                                 │
│ Instrucciones:                  │
│ ┌─────────────────────────────┐ │
│ │ 1. Mezclar ingredientes...  │ │
│ │ 2. Amasar 10 minutos...     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [ CREAR ] [ CANCELAR ]          │
└─────────────────────────────────┘
```

**Ejemplo Completo: Pan Integral**

| Campo | Valor |
|-------|-------|
| **Nombre** | Pan Integral Casero |
| **Categoría** | Panadería |
| **Temperatura** | 240°C |
| **Tiempo** | 45 minutos |
| **Ingrediente 1** | Harina integral | 500g |
| **Ingrediente 2** | Agua tibia | 320ml |
| **Ingrediente 3** | Sal marina | 10g |
| **Ingrediente 4** | Levadura fresca | 10g |
| **Instrucciones** | Mezclar, amasar 10 min, reposar 1h, hornear |

✅ Click "CREAR"

### 🔍 Buscar y Filtrar

```
Barra de búsqueda: [ Escribe "Pan" ]
↓
Muestra solo recetas con "Pan" en el nombre

Filtro Categoría: [Pastelería ▼]
↓
Muestra solo recetas de Pastelería
```

**Ejemplo:** Buscar "Torta" en Pastelería
- Aparecen: Torta Chocolate, Torta de Zanahoria
- No aparecen: Pan, Croissant (son Panadería)

### ✏️ Editar Receta

```
1. En la lista de recetas, encuentra la que quieres
2. Click en icono [✏️ editar] (lado derecho)
3. Formulario se abre en modo EDICIÓN
4. Cambios deseados
5. Click "ACTUALIZAR"
```

**Ejemplo:** Aumentar temperatura de 220°C a 240°C
- Click en la receta "Pan de Molde"
- Click ✏️
- Campo Temperatura: Borra 220, escribe 240
- Click "ACTUALIZAR"

### ❌ Eliminar Receta

```
1. En la lista, encuentra la receta
2. Click en icono [🗑️ eliminar]
3. Confirma: "¿Eliminar receta?"
4. ✅ Eliminada
```

⚠️ **CUIDADO:** No se puede deshacer

---

## 🧮 MÓDULO 2: CALCULADORA

### Escalar Receta

**Caso 1: Escalar por Ingrediente Base**

```
Selecciona receta: [Pan Integral ▼]

↓

Opción 1: ◉ Por ingrediente base
         ○ Por masa total

↓

Ingrediente base: [Harina ▼]
Cantidad deseada: [750] g    ← Quiero 750g de harina (original: 500g)

[ ESCALAR RECETA ]

↓ RESULTADO ↓

Pan Integral (Escalada 1.5x)

Ingredientes:
├─ Harina: 750g (original: 500g)
├─ Agua: 480ml (original: 320ml)  ← Recalculado proporcionalmente
├─ Sal: 15g (original: 10g)
└─ Levadura: 15g (original: 10g)

Instrucciones:
├─ Temperatura: 240°C
├─ Tiempo: 45 minutos
└─ Pasos: [...mismo...]

[ DESCARGAR COMO PNG ]
```

**Caso 2: Escalar por Masa Total**

```
Opción 2: ○ Por ingrediente base
         ◉ Por masa total

↓

Bolsa de 800g de pan deseas, ¿cuánto?
Masa total deseada: [1200] g    ← Quiero pan más grande

Masa actual: 1130g (mostrado automático)

[ ESCALAR RECETA ]

↓ RESULTADO ↓

Todos los ingredientes escalados a 1200g de masa final
```

### 📥 Descargar Receta como PNG

```
La receta escalada tiene un botón azul:

[ ⬇️ DESCARGAR COMO PNG ]

↓ Se descarga imagen con:
├─ Nombre de la receta
├─ Factor de escala (1.5x)
├─ Tabla de ingredientes
├─ Instrucciones
├─ Temperatura y tiempo
└─ Branding CALIPAN VIRREY + Fecha
```

**Uso:** Imprimir o compartir en WhatsApp

---

## 🛒 MÓDULO 3: INVENTARIO (Solo Admin)

### ➕ Agregar Insumo

```
Click: "🛒 Inventario" (navbar)

↓

Click: "+ Nuevo Insumo"

↓ FORM ↓

┌─────────────────────────────────┐
│ Insumo: Harina Premium          │
├─────────────────────────────────┤
│ Nombre: [Harina Premium ______] │
│ Tipo: [kg ▼]                    │
│ Peso por Presentación: [1] kg   │
│ Unidades Compradas: [20] unid   │
│ Costo Total: [400,000] pesos    │
│                                 │
│ [ CREAR ] [ CANCELAR ]          │
└─────────────────────────────────┘
```

**Ejemplo Completo:**

| Campo | Valor |
|-------|-------|
| **Nombre** | Harina Premium |
| **Tipo** | kg (kilogramo) |
| **Presentación** | 1 kg por bolsa |
| **Cantidad Comprada** | 20 bolsas |
| **Costo Total** | $400,000 |

✅ CREAR

### Sistema Calcula Automáticamente:

```
Total: 1kg × 20 = 20 kg
Costo total: $400,000

┌──────────────────────┐
│ Por gramo: $20       │ ← $400,000 / 20,000g
│ Por 100g: $2,000     │ ← $20 × 100
│ Por kg: $20,000      │ ← $400,000 / 20
└──────────────────────┘
```

### Tarjeta de Insumo en Inversario

```
┌─────────────────────────────────┐
│ Harina Premium                  │
│ 1 kg × 20 = 20 kg       [✏️][🗑️]│
├─────────────────────────────────┤
│ Por gramo:   $20.00             │
│ Por 100g:    $2,000             │
│ Por kg:      $20,000            │
├─────────────────────────────────┤
│ Costo total: $400,000           │
└─────────────────────────────────┘
```

### 📝 Editar Insumo

```
Click ✏️ en la tarjeta
Cambios necesarios
Click "ACTUALIZAR"
```

### 🗑️ Eliminar Insumo

```
Click 🗑️ en la tarjeta
Confirma
Listo
```

---

## 💰 MÓDULO 4: COSTOS DE RECETAS (Solo Admin)

### Analizar Costo de Receta

```
Click: "💰 Costos" (navbar)

↓

Seleccionar Receta: [Pan Integral ▼]

↓

Slider Margen de Ganancia: 
[-------|-------|-------|-------|-------]
0%                   35%                100%
       ↑ Ajusta a 35%

[ CALCULAR COSTOS ]

↓ ANÁLISIS ↓

┌─────────────────────────────────────┐
│ Costo Total de Ingredientes         │
│                                     │
│              $8,450 COP             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Precio Sugerido (+35%)              │
│                                     │
│             $11,408 COP             │
└─────────────────────────────────────┘

Ganancia Estimada: $2,958 COP
```

### Desglose de Costos

```
BARRA DE DISTRIBUCIÓN:

Harina (500g):
▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮ 70% | $5,915

Agua (320ml):
▮ 2% | $170

Sal Marina (10g):
▮▮ 3% | $254

Levadura (10g):
▮▮▮▮▮ 25% | $2,113

Total: $8,450
```

### Cálculos Automáticos

**Sistema hace esto:**

1. Busca cada ingrediente en INVENTARIO
2. Obtiene: Costo por gramo
3. Multiplica: Cantidad en receta × Costo/gramo
4. Suma: Todos los ingredientes

**Ejemplo:**
```
Ingrediente: Harina 500g
En inventario: Harina cuesta $20 por kg ($20 por 1000g)
Costo por gramo: $20 / 1000 = $0.02

Costo en receta: 500g × $0.02 = $10

Pero la receta está bien, el precio es menor porque 
el inventario registra otra harina...
```

### Ajustar Margen de Ganancia

```
Mueve el slider:

30% → Pan cuesta 10.4% más
50% → Pan cuesta 50% más  ← Recomendado panadería
75% → Pan cuesta 75% más  ← Máximo margen
```

Precio Sugerido = Costo Total × (1 + Margen%)

---

## 🔓 PERMISOS SEGÚN ROL

### 👨‍💼 Administrador (calipan / calipan2026)

| Acción | Permitido |
|--------|-----------|
| Ver recetas | ✅ |
| Crear receta | ✅ |
| Editar receta | ✅ |
| Eliminar receta | ✅ |
| Usar calculadora | ✅ |
| Ver inventario | ✅ |
| Crear insumo | ✅ |
| Editar insumo | ✅ |
| Eliminar insumo | ✅ |
| Analizar costos | ✅ |
| Cambiar margen | ✅ |

### 👁️ Solo Lectura (familia / familia2026)

| Acción | Permitido |
|--------|-----------|
| Ver recetas | ✅ |
| Crear receta | ❌ |
| Editar receta | ❌ |
| Eliminar receta | ❌ |
| Usar calculadora | ✅ |
| Ver inventario | ❌ |
| Crear insumo | ❌ |
| Editar insumo | ❌ |
| Eliminar insumo | ❌ |
| Analizar costos | ❌ |

### 📱 Solo sus Recetas (solonacional / solonacional2026)

| Acción | Permitido |
|--------|-----------|
| Ver SUS recetas | ✅ |
| Ver otras recetas | ❌ |
| Crear receta | ✅ |
| Editar SU receta | ✅ |
| Eliminar SU receta | ✅ |
| Usar calculadora | ✅ |
| Ver inventario | ❌ |
| Analizar costos | ❌ |

---

## 💾 GUARDAR Y SINCRONIZAR

### Persistencia Automática

```
Cada que CREAS/EDITAS/ELIMINAS:
  ↓
localStorage se actualiza automáticamente
  ↓
Si cierras y abres la app:
  ↓
Los datos siguen ahí ✅ (Sin conexión)
```

### Recordar Credenciales

```
Login:
  ☑ Recordar credenciales
  ↓
Próxima vez que abras:
  ↓
Usuario cargado automáticamente
  ↓
Solo ingresa contraseña
```

---

## 🌙 DARK MODE

### Automático según Sistema Operativo

```
Windows:
  Settings → Personalization → Colors
    └─ Light / Dark
  ↓
App cambia automáticamente

iPhone:
  Settings → Display & Brightness
    └─ Light / Dark / Auto
  ↓
App cambia automáticamente
```

---

## 📱 INSTALAR COMO APP

### En Chrome/Android

```
1. Abre http://localhost:5173
2. Espera 2 segundos (splash screen)
3. Click en ⋮ (3 puntitos arriba derecha)
4. "Instalar aplicación"
5. Confirma

↓

App aparece en:
├─ Pantalla de inicio
├─ Drawer de apps
└─ Funciona sin navegador
```

### En Safari/iPhone

```
1. Abre en Safari: http://localhost:5173
2. Click en compartir (cuadro con flecha)
3. "Añadir a Pantalla de Inicio"
4. Nombrala: "CALIPAN VIRREY"
5. Añadir

↓

App en pantalla principal
└─ Toca para abrir (sin Safari)
```

---

## ⚙️ MODO OFFLINE

### Funciona 100% sin Internet

```
1. Instalada como app
2. Todos los datos en localStorage
3. Service Worker cachea archivos

↓

Si se corta internet:
  ├─ Sigue funcionando
  ├─ Puedes ver recetas
  ├─ Puedes crear recetas
  ├─ Puedes usar calculadora
  └─ Todo se sincroniza al reconectar
```

---

## 🔐 LOGOUT (Salir)

```
Mobile:
  Click en [+] FAB
  Menú: "Salir"
  ↓
  Vuelves a login

Desktop:
  Sidebar → "Salir" (botón rojo)
  ↓
  Vuelves a login
```

---

## 🎨 ATAJOS VISUALES

### Colores por Acción

| Color | Significado |
|-------|-------------|
| 🟫 Marrón (#4A3728) | Primario (navbar, títulos) |
| 🟧 Caramelo (#A4703E) | Secundario (botones, accents) |
| 🟨 Crema (#FDFBF7) | Fondo principal |
| 🔵 Azul | Editar |
| 🔴 Rojo | Eliminar/Peligro |
| 🟢 Verde (en completados) | Éxito |

---

## ⌨️ ATAJOS DE TECLADO (Futuro)

| Atajo | Acción |
|-------|--------|
| `Ctrl+N` | Nueva receta |
| `Ctrl+F` | Buscar |
| `Escape` | Cerrar modal |
| `Ctrl+S` | Guardar (al editar) |

*En próximas versiones*

---

## 🆘 SOLUCIONAR PROBLEMAS

### "Olvidé mi contraseña"
❌ No hay recuperación (hardcoded)
✅ Contacta al admin para resetear

### "Datos desaparecieron"
1. Limpia cache: Settings → Clear browsing data
2. Reinstala app
3. Si no aparecen: Contacta admin

### "App no se instala"
- Usa Chrome 90+ o Safari 14+
- Debe ser HTTPS en producción (localhost funciona)
- Espera 2 segundos al cargar

### "Offline no funciona"
1. Abre DevTools (F12)
2. Application → Service Workers
3. Verifica que esté registrado ✅
4. Offline mode: Activa en DevTools → Throttling

---

## 📞 SOPORTE TÉCNICO

Si algo falla:
1. Reporta el error exacto
2. Captura de pantalla
3. Qué navegador/device usas
4. Paso a paso para reproducir

---

¡Felicidades! Ahora eres experto en usar CALIPAN VIRREY PWA! 🎉

**Próximas features:**
- 📸 Fotos de recetas
- 📊 Reportes de costos
- 📅 Historial de cambios
- 👥 Múltiples usuarios reales

---

*Última actualización: Marzo 2026*
*CALIPAN VIRREY PWA v1.0*
