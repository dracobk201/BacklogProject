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

# Production build
npm run build
```

### 🔄 Android Build & Sync Workflow

Whenever you make frontend changes (components, styles, translations, logic) that need to be reflected in the Android build, follow this workflow:

#### Step 1: Compile & Sync (Single Command)
Run the all-in-one command in the project root:
```bash
npm run cap:sync
```
> **What this does:**
> 1. `npm run build`: Executes TypeScript verification (`tsc -b`) and bundles web assets with Vite into `dist/`.
> 2. `npx cap sync android`: Copies `dist/` into native Android assets (`android/app/src/main/assets/public`) and updates native plugin configurations.

#### Step 2: Run or Build the Android App

Choose one of the following methods depending on your workflow:

- **Option A: Via Android Studio (Recommended)**
  1. Open the native Android project:
     ```bash
     npm run cap:open
     ```
  2. In Android Studio:
     - **Test on physical device or emulator**: Click the green **Run** button (or press `Shift + F10`).
     - **Generate an APK**: Navigate to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

- **Option B: Run directly via CLI**
  With an Android emulator running or a physical device connected via USB debugging:
  ```bash
  npx cap run android
  ```

- **Option C: Build Debug APK via CLI**
  On Windows (PowerShell):
  ```powershell
  cd android
  .\gradlew assembleDebug
  cd ..
  ```
  The generated APK will be located at:
  `android/app/build/outputs/apk/debug/app-debug.apk`

#### Typical Development Cycle
```bash
npm run lint          # Optional: Verify code quality before syncing
npm run cap:sync      # Bundle web assets and copy to Android
npm run cap:open      # Open Android Studio (or press Run if already open)
```
> **Tip:** If Android Studio is already running, you do not need to reopen it. Simply run `npm run cap:sync` in your terminal and click **Run / Apply Changes** in Android Studio.

---

### 📦 Generating a Production Release Bundle (`app-release.aab`)

To upload an update to the **Google Play Console**, you must produce an **Android App Bundle (.aab)** signed with your release key.

#### 1. Increment Version in `android/app/build.gradle`
Google Play requires each uploaded bundle to have a strictly higher `versionCode` than the previous release:
```groovy
defaultConfig {
    applicationId "com.pakatagames.backlogpriority"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 4          // Increment by 1 (e.g. 3 -> 4)
    versionName "1.0.6"    // Update semantic version string
    ...
}
```

#### 2. Compile Web Assets & Sync
Ensure the latest production web build is synced into the native assets:
```bash
npm run cap:sync
```

#### 3. Build the Bundle

##### Method A: Via Command Line (Recommended if `key.properties` is configured)
If you have `android/key.properties` configured with your keystore credentials:
```powershell
cd android
.\gradlew bundleRelease
cd ..
```
The signed AAB file will be generated at:
```text
android/app/build/outputs/bundle/release/app-release.aab
```

##### Method B: Via Android Studio (GUI Signing)
1. Open Android Studio:
   ```bash
   npm run cap:open
   ```
2. In the top navigation bar, go to **Build > Generate Signed Bundle / APK...**
3. Select **Android App Bundle** and click **Next**.
4. Specify:
   - **Key store path**: Location of your `.jks` / `.keystore` file
   - **Key store password**, **Key alias**, and **Key password**
5. Select the **release** destination folder and build variant.
6. Click **Finish**. The output directory with `app-release.aab` will appear in a notification popup.

> [!NOTE]
> To automate signing with Gradle (Method A), create a file at `android/key.properties` (never commit this file to git):
> ```properties
> storeFile=../my-release-key.jks
> storePassword=your-keystore-password
> keyAlias=your-key-alias
> keyPassword=your-key-password
> ```

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
