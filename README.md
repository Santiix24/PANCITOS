# PANCITOS - PWA Panadería Artesanal

PWA instalable para gestión de recetas, costos, inventario y producción de panadería.

## 🎯 Características

✅ **PWA Instalable**: Funciona como app nativa en móvil/desktop  
✅ **Offline 100%**: Funciona sin internet  
✅ **Gestión de Recetas**: CRUD completo + búsqueda + filtros  
✅ **Calculadora**: Escalar recetas por ingrediente base o masa total  
✅ **Cocinar**: Botón para descontar ingredientes del inventario al producir  
✅ **Inventario con Stock**: Control de cantidades disponibles  
✅ **Análisis de Costos**: Costos de recetas + margen configurable + precio sugerido  
✅ **Margen Personalizable**: Configura tu porcentaje de ganancia (0-200%)  
✅ **Exportar PNG**: Guarda recetas escaladas como imagen  
✅ **Dark Mode**: Tema claro/oscuro  
✅ **Moneda COP**: Formateo en pesos colombianos  

## 🔐 Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| Administrador | Administrador2026 | Super Admin |
| calipan | calipan2026 | Admin |
| familia | familia2026 | Solo lectura |
| solonacional | solonacional2026 | Personal |

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev
# Abrir http://localhost:5173

# Build producción
npm run build
```

## 📱 Instalar como App

**Chrome/Edge**: Menú ⋮ → "Instalar aplicación"  
**iPhone/Safari**: Compartir → "Añadir a inicio"

## 🔧 Stack Técnico

- React 18 + TypeScript
- Vite
- TailwindCSS
- Framer Motion
- localStorage (persistencia)

## 🔧 Configuración de Tailwind CSS

Usa Tailwind CDN en el HTML. Para personalizar colores, edita `tailwind.config.js`.

## 📱 Cambios Recientes en el Código

Para evitar "pull-to-refresh", la app desactiva el comportamiento con `preventDefault` en `touchmove`.

## 🎯 Próximos Pasos (Opcionales)

- Conectar a Supabase para sincronización en la nube
- Agregar más usuarios desde base de datos
- Implementar foto de recetas
- Historial de cambios
- Reportes de costos

## 📄 Licencia

Uso privado para CALIPAN VIRREY Panadería.

---

**Creado con ❤️ usando React 18 + TypeScript + Vite + Tailwind CSS**
