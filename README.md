# 🎮 Backlog Priority (Android & Web)

A modern, mobile-first application designed to intelligently organize video game backlogs and eliminate gamer analysis paralysis through a personalized priority algorithm.

Packaged as a native **Android** application using **Capacitor** with full web parity.

- **Application Name**: Backlog Priority
- **Android Package ID**: `com.pakatagames.backlogpriority`

---

## 🛠️ Technology Stack

- **Frontend Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/)
- **Mobile Container**: [Capacitor](https://capacitorjs.com/) (Target: Android `/android`)
- **Design System**: [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router) (Strict, type-safe routing)
- **Data Fetching & Cache**: [TanStack Query v5](https://tanstack.com/query)
- **Global State**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Authentication)
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)

---

## 📋 Android Migration Roadmap

The migration plan tracking progress across Capacitor configuration, shadcn/ui migration, mobile hardware UX, Supabase deep links, and Google Play Store deployment is documented in:

👉 **[ANDROID_MIGRATION_PLAN.md](./ANDROID_MIGRATION_PLAN.md)**

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js (v20 or higher recommended)
- npm
- [Android Studio](https://developer.android.com/studio) with Android SDK and command-line tools installed

### Install Dependencies
```bash
npm install
```

### Run in Web Development Mode (Vite Dev Server)
```bash
npm run dev
```

### Quality & Build Commands
```bash
# Type-check and linting
npm run lint

# Run unit tests
npm run test

# Production build
npm run build
```

### Android Native Execution & Sync (Capacitor)
```bash
# Compile web assets and sync with native Android project
npm run build
npx cap sync android

# Open Android Studio project
npx cap open android
```

---

## 📱 Project Structure

```text
src/
├── assets/          # Static images and media assets
├── components/      # Shared design system components (shadcn/ui)
│   └── ui/          # Atomic UI primitives (button, card, dialog, etc.)
├── data/            # Master reference datasets (platforms, consoles, genres)
├── features/        # Feature-oriented domain modules
│   ├── auth/        # Authentication, profile, settings, game forms & catalog
│   ├── core/        # Layout, AppHeader, mobile BottomNav, safe areas
│   └── dashboard/   # Metrics, recommendation engine, priority calculator
├── lib/             # Utility helpers (cn, utils)
├── locales/         # Multi-language translation dictionaries (en, es, it)
├── routes/          # TanStack Router type-safe file-based routes
├── services/        # Backend services (Supabase queries & IGDB/OpenCritic APIs)
├── stores/          # Zustand global stores (settings, user preferences)
└── types/           # TypeScript strict interfaces and Database schemas
```
