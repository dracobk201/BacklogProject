# 🎮 Video Game Backlog Manager (Android & Web)

Aplicación moderna para la gestión inteligente de backlogs de videojuegos. Su objetivo principal es resolver la parálisis por análisis de los jugadores mediante un algoritmo personalizado de priorización de títulos pendientes.

La aplicación está diseñada con un enfoque **mobile-first** y empaquetada para **Android** utilizando **Capacitor**, manteniendo paridad total con su versión web.

---

## 🛠️ Stack Tecnológico

- **Frontend Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/)
- **Mobile Container**: [Capacitor](https://capacitorjs.com/) (Target: Android)
- **Sistema de Diseño**: [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router) (Enrutamiento estricto y type-safe)
- **Data Fetching / Cache**: [TanStack Query v5](https://tanstack.com/query)
- **Estado Global**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth)
- **Testing**: [Vitest](https://vitest.dev/) y [React Testing Library](https://testing-library.com/)

---

## 📋 Plan de Migración a Android

El seguimiento detallado del proceso de migración (Capacitor, sustitución de Ant Design por shadcn/ui, deep linking de Supabase y publicación en Google Play) se encuentra documentado en:

👉 **[ANDROID_MIGRATION_PLAN.md](./ANDROID_MIGRATION_PLAN.md)**

---

## 🚀 Inicio Rápido (Desarrollo)

### Requisitos Previos
- Node.js (v20 o superior recomendado)
- npm
- [Android Studio](https://developer.android.com/studio) con Android SDK instalado (para compilar y emular en Android)

### Instalación de dependencias
```bash
npm install
```

### Ejecutar en modo Web (Vite Dev Server)
```bash
npm run dev
```

### Comandos de Calidad y Build
```bash
# Validar tipado y linting
npm run lint

# Ejecutar tests unitarios
npm run test

# Compilar para producción
npm run build
```

### Sincronización y Ejecución en Android (Capacitor)
```bash
# Sincronizar el build web con el proyecto nativo de Android
npm run build
npx cap sync android

# Abrir el proyecto en Android Studio
npx cap open android
```

---

## 📱 Estructura del Proyecto

```text
src/
├── assets/          # Imágenes y recursos estáticos
├── components/      # Componentes UI reutilizables (shadcn/ui)
├── data/            # Listas maestras (plataformas, géneros, etc.)
├── features/        # Arquitectura modular por dominio funcional
│   ├── auth/        # Login, perfil, gestión de sesión y usuarios
│   ├── core/        # Layout principal móvil (BottomNav, Header, etc.)
│   └── dashboard/   # Dashboard con recomendaciones y backlog
├── lib/             # Utilidades de configuración (cn, etc.)
├── routes/          # Rutas de TanStack Router
├── services/        # Servicios y llamadas a Supabase / APIs
├── stores/          # Stores de Zustand (ajustes, filtros, etc.)
└── types/           # Tipados estrictos de TypeScript y Base de Datos
```
