# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Seeding** is a privacy-focused relapse tracking mobile app built with React Native and Expo. All data is stored locally using SQLite, with no cloud sync in the MVP phase.

## Key Technologies

- **Expo Router** (v6) for file-based routing (entry point: `expo-router/entry`)
- **NativeWind** for Tailwind CSS styling in React Native
- **Zustand** for state management
- **expo-sqlite** for local database storage
- **expo-secure-store** for secure encryption key storage
- **TypeScript** with strict mode enabled

## Development Commands

```bash
# Start development server
npm start

# Platform-specific development
npm run android
npm run ios
npm run web

# Run tests
npm test
```

## Build & Deploy (EAS)

The project uses Expo Application Services (EAS) for builds:

```bash
# Development builds (with dev client)
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview builds (internal testing)
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Production builds
eas build --profile production --platform ios
eas build --profile production --platform android
```

**Build configurations:**
- `development`: Dev client enabled, iOS simulator support, Android APK
- `preview`: Internal distribution, Android APK
- `production`: Store distribution, Android AAB

## Architecture

### Planned Folder Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components (Onboarding, Home, RelapseList, Settings)
├── stores/         # Zustand stores (relapseStore)
├── db/             # SQLite database schema & helpers
├── services/       # External services (backup, authentication)
└── utils/          # Utility functions
```

### Database Schema (Planned)

**Table: `relapse`**
- `id`: UUID primary key
- `timestamp`: ISO8601 string
- `note`: Optional text
- `tags`: Optional string/array

**DB Helpers:**
- `addRelapse()`, `getRelapses()`, `deleteRelapse()`, `updateRelapse()`

### State Management

Zustand store (`relapseStore`) will manage:
- State: `relapses`, `loading`, `error`
- Actions connected to DB helpers

### Privacy & Security

- All data stored locally (no cloud sync in MVP)
- Encryption keys stored in `expo-secure-store`
- Optional biometric/passcode app lock using Expo LocalAuthentication
- Export to CSV for user-controlled backups

## Styling

NativeWind is configured with:
- Tailwind content paths: `App.{js,jsx,ts,tsx}`, `src/**`, `app/**`
- Babel preset configured for `jsxImportSource: "nativewind"`
- Use Tailwind utility classes in className props

## TypeScript Configuration

- Extends `expo/tsconfig.base`
- Strict mode enabled
- Includes `nativewind-env.d.ts` for type definitions
