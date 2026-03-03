# ✅ VALIDACIÓN COMPLETA - CALIPAN VIRREY PWA

## 🔍 CHECKLIST DE VERIFICACIÓN

Ejecuta estos pasos en orden:

---

## PASO 1: Prueba con Perfil "Administrador" 
```
Usuario: Administrador
Password: Administrador2026
```

**Verifica:**
- ✅ Login exitoso
- ✅ Home muestra "Estadísticas"
- ✅ Contador de Recetas: **20**
- ✅ Contador de Inventario: **30**
- ✅ Usuario mostrado: "Administrador"

### En RecipesView:
- ✅ Aparecen 20 recetas listadas
- ✅ Botón "+ AGREGAR" visible
- ✅ Botones editar/eliminar en cada receta
- ✅ Puedes ver: **Pan Francés**, **Croissant**, **Torta Chocolate**, **Cheesecake**, etc.
- ✅ Puedes filtrar por: Panadería / Pastelería
- ✅ Búsqueda funciona (ej: escribe "Pan")

### En InventoryView:
- ✅ Aparecen 30 operaciones (Harina, Mantequilla, Leche, etc.)
- ✅ Cada operación muestra: nombre, tipo (kg/L), cantidad, costo total
- ✅ Ejemplo: "Harina de trigo" | 25kg | 4 | $180,000
- ✅ Puedes ver: Cacao, Chocolate, Queso crema, Fresas, etc.
- ✅ Botón "+ AGREGAR INSUMO" funciona
- ✅ Puedes eliminar operaciones

### En CostsView:
- ✅ Muestra todas las operaciones con costo por unidad
- ✅ Ej: Mantequilla $35,000/kg
- ✅ Ej: Harina $4,500/kg (180,000 ÷ 25kg × 4 sacos)
- ✅ Análisis de márgenes visible

### En CalculatorView:
- ✅ Dropdown muestra todas las 20 recetas
- ✅ Selecciona "Pan Francés Tradicional"
- ✅ Puedes escalar por cantidad (1, 2, 3... productos)
- ✅ O escalar por ingrediente base (500g harina → 1000g)
- ✅ Visualiza los ingredientes escalados
- ✅ Botón "📥 DESCARGAR" genera PNG

---

## PASO 2: Prueba con Perfil "calipan" (Admin Panadería)
```
Usuario: calipan
Password: calipan2026
```

**Verifica:**
- ✅ Login exitoso con nombre "calipan"
- ✅ Mismos datos (20 recetas, 30 insumos)
- ✅ Puede crear/editar recetas propias
- ✅ Puede usar calculadora
- ✅ Puede ver inventario y costos

**Diferencia respecto a Administrador:**
- ❌ No aparecen botones "Eliminar" para recetas de otros
- ✅ Solo puede eliminar sus propias recetas

---

## PASO 3: Prueba con Perfil "familia" (Read-Only)
```
Usuario: familia
Password: familia2026
```

**Verifica:**
- ✅ Login exitoso
- ✅ RecipesView: Aparecen 20 recetas
- ✅ **SIN** botones crear/editar/eliminar
- ✅ Mensaje: "👀 No tienes acceso a esta sección" en acciones
- ✅ CalculatorView: Funciona (solo lectura)
- ✅ InventoryView: **BLOQUEADO** (muestra mensaje de acceso)
- ✅ CostsView: **BLOQUEADO** (muestra mensaje de acceso)

---

## PASO 4: Prueba con Perfil "solonacional" (Personal)
```
Usuario: solonacional
Password: solonacional2026
```

**Verifica:**
- ✅ Login exitoso
- ✅ RecipesView: Aparecen SOLO sus recetas (creadas por "solonacional")
- ✅ Otras recetas no aparecen
- ✅ Botones de CRUD solo en sus propias recetas
- ✅ CalculatorView: Solo con sus recetas
- ✅ InventoryView/CostsView: BLOQUEADAS

---

## PASO 5: Verifica Modo Offline

### En Windows:
1. Abre DevTools (F12)
2. Vete a "Application" → "Service Workers"
3. Verifica que el SW esté "activated and running"
4. Haz click en "Offline" (simula sin internet)
5. Recarga la página (Ctrl+Shift+R limpk cache)
6. **La app debe cargar completamente desde cache**

### En Android:
1. Instala la PWA (menu ≡ → "Instalar")
2. Abre Settings → Airplane Mode → ON
3. Abre CALIPAN VIRREY PWA
4. **Debe funcionar perfectamente sin WiFi**

---

## PASO 6: localStorage Persistence

En DevTools (F12):
1. Vete a "Application" → "Local Storage"
2. Busca `calipan-state`
3. **Debe contener:**
   ```json
   {
     "user": { "username": "...", "role": "..." },
     "recipes": [ ...20 recetas... ],
     "operations": [ ...30 operaciones... ],
     "rememberMe": true/false
   }
   ```
4. Haz cambios (agrega receta, edita insumo)
5. Recarga página
6. **Los cambios deben persistir**

---

## PASO 7: Responsive Design

### Mobile (DevTools, iPhone 12)
- ✅ Navbar está en BOTTOM
- ✅ FAB (+) button visible arriba derecha
- ✅ Todo cabe sin scroll horizontal
- ✅ Buttons son 48px+ (touch-friendly)
- ✅ Fondos glassmorphism son visibles

### Tablet (iPad Air)
- ✅ Layout adaptable
- ✅ Navbar puede estar bottom o side
- ✅ Cards tienen buen espaciado

### Desktop (1920x1080)
- ✅ Sidebar fijo a la izquierda
- ✅ Contenido ocupa resto del espacio
- ✅ Animaciones smooth a 60 FPS

---

## PASO 8: Funcionalidades Específicas

### Receta "Pan Francés Tradicional":
```
Ingredientes:
  - Harina de trigo: 500g
  - Agua: 300ml
  - Sal: 10g
  - Levadura fresca: 10g

Temperatura: 220°C
Tiempo: 45 min
Instrucciones: Mezclar, fermentar 2h, formar y hornear
Creador: Administrador
```

### Operación "Harina de trigo":
```
Tipo: kg
Presentación: 25kg
Compradas: 4 sacos
Costo Total: $180,000
Costo Unit: $4,500/kg
```

### Cálculo de Escala:
- Pan Francés × 2: Harina 1000g, Agua 600ml, etc.
- Pan Francés × basado en 1kg de harina: escala proporcional

---

## 🎯 CASOS DE TEST ESPECÍFICOS

### Test 1: Crear Receta Personalizada
```
Perfil: calipan
1. RecipesView → "+ AGREGAR"
2. Nombre: "Pan de Queso Casero"
3. Categoría: Panadería
4. Ingredientes: 
   - Harina: 400g
   - Queso rallado: 100g
5. Temp: 200°C | Tiempo: 30 min
6. Guardar
✅ Debe aparecer en la lista (receta #21)
✅ localStorage debe actualizar
```

### Test 2: Agregar Insumo
```
Perfil: Administrador
1. InventoryView → "+ AGREGAR INSUMO"
2. Nombre: "Levadura seca"
3. Tipo: kg
4. Presentación: 0.5kg
5. Unidades: 1
6. Costo: $25,000
7. Guardar
✅ Debe aparecer en lista (#31)
✅ CostsView debe mostrar $50,000/kg
```

### Test 3: Escalar Receta
```
Perfil: cualquiera
1. CalculatorView
2. Selecciona "Tres Leches Premium"
3. Cantidad: 4 tortas
4. Check ingredientes:
   - Harina: 250g → 1000g ✅
   - Huevos: 3 → 12 ✅
   - Leche condensada: 400ml → 1600ml ✅
5. Download PNG
✅ Imagen debe contener todos los ingredientes
```

### Test 4: Cambiar Perfil sin Cerrar
```
1. Login: Administrador
2. Home → ver 20 recetas
3. Logout (Usuario menu → "CERRAR SESIÓN")
4. Login: familia
5. RecipesView → recetas visibles pero SIN botones
6. Try Inventory → mensaje "No acceso"
✅ Permisos cambian correctamente
```

---

## ⚠️ QUÉ REVISAR SI ALGO NO FUNCIONA

### Problema: localStorage vacío (30 operaciones no aparecen)
**Solución:**
```javascript
// En DevTools console:
localStorage.removeItem('calipan-state');
location.reload();
// Debe cargar defaults y mostrar 30 operaciones
```

### Problema: Service Worker no cachea
**Solución:**
1. DevTools → Application → Service Workers
2. Click en "Update" o "Unregister"
3. Recarga página
4. Verifica que SW esté "activated"

### Problema: App lenta
**Solución:**
- 519 KB es normal para Vite dev
- En producción sería más pequeña con minificación
- Desactiva extensions del navegador
- Limpia cache: Ctrl+Shift+Delete

---

## 📊 RESULTADOS ESPERADOS

| Componente | Esperado | ¿Funciona? |
|---|---|---|
| Login 4 perfiles | ✅ | [ ] |
| 20 Recetas cargan | ✅ | [ ] |
| 30 Operaciones cargan | ✅ | [ ] |
| Permisos por perfil | ✅ | [ ] |
| Offline funciona | ✅ | [ ] |
| Calculator escala | ✅ | [ ] |
| Responsive mobile | ✅ | [ ] |
| localStorage persiste | ✅ | [ ] |
| Animations smooth | ✅ | [ ] |
| Dark mode funciona | ✅ | [ ] |

---

## 🎉 Cuando TODO está funcionando:

✅ **APP LISTA PARA PRODUCCIÓN**

La aplicación está completamente funcional, offline, responsiva y rica en datos.

