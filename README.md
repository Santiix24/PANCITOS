# CALIPAN VIRREY - PWA Panadería

PWA instalable (Progressive Web App) para gestión de recetas, costos e inventario de panadería.

## 🎯 Características

✅ **PWA Instalable**: Funciona como app nativa en móvil/desktop
✅ **Offline 100%**: Service Worker + localStorage para funcionar sin internet
✅ **Login Hardcoded**: 4 usuarios con permisos diferentes
✅ **Módulo Recetas**: CRUD completo + búsqueda + filtros
✅ **Calculadora**: Escalar recetas por ingrediente base o masa total
✅ **Exportar PNG**: Guarda recetas escaladas como imagen
✅ **Panel Inventario**: CRUD de insumos + costo por gramo/100g/kg
✅ **Panel Costos**: Analiza costos de recetas + margen de ganancia + precio sugerido
✅ **Diseño Premium**: Mobile-first + dark mode + animaciones Framer Motion
✅ **Datos en Tiempo Real**: Búsqueda y filtros instantáneos
✅ **Moneda COP**: Formateo automático de valores en pesos colombianos

## 🔐 Usuarios de Prueba

| Usuario | Contraseña | Rol | Acceso |
|---------|-----------|-----|--------|
| Administrador | Administrador2026 | superadmin | Todo |
| calipan | calipan2026 | admin | Recetas, Calculadora, Inventario, Costos |
| familia | familia2026 | readonly | Solo lectura |
| solonacional | solonacional2026 | personal | Solo sus recetas |

## 📦 Instalación

### Requisitos
- Node.js 18+ 
- npm o yarn

### Pasos

```bash
# 1. Clonar o descargar el proyecto
cd bakecontrol

# 2. Instalar dependencias
npm install

# 3. Iniciar desarrollo
npm run dev

# 4. Abrir en navegador
# http://localhost:5173
```

## 🚀 Build & Deploy

```bash
# Generar build optimizado
npm run build

# Vista previa del build
npm run preview
```

## 📱 Instalar como App

### En Chrome/Edge (Android & Desktop)
1. Abre `http://localhost:5173`
2. Click en el menú ⋮ → "Instalar aplicación"
3. ¡Listo! La app aparece como icono en tu pantalla de inicio

### En iPhone (iOS)
1. Abre Safari
2. La app → Opciones
3. "Añadir a la pantalla de inicio"

## 🏗️ Estructura del Proyecto

```
bakecontrol/
├── index.html              # HTML con meta tags PWA
├── src/
│   └── index.tsx          # App completa en React + TypeScript
├── public/
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service Worker para offline
├── package.json           # Dependencias
├── vite.config.ts         # Config Vite
├── tsconfig.json          # Config TypeScript
└── tailwind.config.js     # Config Tailwind CSS
```

## 🎨 Diseño

- **Colores**: Marrón (#4A3728) + Caramelo (#A4703E) + Crema (#FDFBF7)
- **Tipografía**: Playfair Display (títulos) + Inter (texto)
- **Animaciones**: Framer Motion en botones, navegación y transiciones
- **Dark Mode**: Automático según sistema operativo
- **Responsive**: Mobile-first con navbar inferior en móvil y sidebar en desktop

## 💾 Persistencia de Datos

- **localStorage**: Almacena recetas e inventario offline
- **Service Worker**: Cache para funcionamiento sin internet
- **Sincronización**: Al recuperar conexión (preparado para Supabase)

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
