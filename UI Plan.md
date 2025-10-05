# Seeding UI Design Plan

**Status**: Implementation in Progress

This document outlines the UI/UX vision for **Seeding** — a privacy-focused, minimal yet emotional relapse tracking app for self-growth.

---

## 🎯 Core Vision

Design a modern, mindful, and motivating theme for a React Native Expo app called Seeding.
The app should visually represent growth, renewal, and self-discipline.

Think of the user's journey as planting a seed of self-control that grows into a strong tree over time.

## 🌱 Design Goals

**Mood**: Calm, hopeful, slightly spiritual yet tech-forward.

**Core Metaphor**: "Seed → Sprout → Plant → Tree" to represent progress streaks.

### ✅ Implemented Color Palette
Located in [`src/theme/colors.ts`](src/theme/colors.ts):
- **Primary**: Deep emerald green (#1B5E20) ✅
- **Accent**: Fresh lime (#A5D6A7) ✅
- **Support**: Golden glow (#FFD54F) ✅
- **Light Background**: Off-white (#FAFAFA) ✅
- **Dark Background**: Deep charcoal (#1C1C1E) ✅

### ✅ Implemented Typography
Located in [`src/theme/typography.ts`](src/theme/typography.ts):
- **Font Family**: Poppins (Regular, Medium, SemiBold, Bold) ✅
- **Typography Scale**: Defined for h1-h6, body, captions, buttons ✅
- **Loaded via**: `@expo-google-fonts/poppins` ✅

### 🎨 UI Style (Partial Implementation)
- ✅ Clean cards with soft shadows (Home screen stats cards)
- ⏳ Gradient progress rings (planned)
- ⏳ Animated growth visuals (planned)

### 🌓 Dark Mode (Infrastructure Ready)
- ✅ Theme store with persistence ([`src/stores/themeStore.ts`](src/stores/themeStore.ts))
- ✅ ThemeToggle component ([`src/components/ThemeToggle.tsx`](src/components/ThemeToggle.tsx))
- ⏳ Apply theme colors throughout UI (currently using Tailwind defaults)
- ⏳ Glowing seed icons for dark mode

## 📱 Key Screens Implementation Status

### ✅ Onboarding Screen ([`app/onboarding.tsx`](app/onboarding.tsx))
- Welcome message with app intro
- "Get Started" button to begin journey
- Sets initial journey timestamp

### ✅ Home Screen ([`app/home.tsx`](app/home.tsx))
**Implemented:**
- Clean "Days since last relapse" counter with live countdown
- Stats cards showing current streak and total relapses
- Navigation to History and Settings
- Floating action button for recording relapses
- Motivational subtext: "Track your progress"

**Pending:**
- ⏳ Glowing seed/plant icon that grows with streak
- ⏳ Growth stage transitions (Seed → Sprout → Plant → Tree)
- ⏳ Gradient progress rings

### ✅ Relapse Modal ([`src/components/RelapseModal.tsx`](src/components/RelapseModal.tsx))
**Implemented:**
- Confirmation dialog for recording relapse
- Optional note input
- Supportive messaging (non-guilt-inducing)

**Pending:**
- ⏳ "Plant withering to seed" animation
- ⏳ Gentle haptic feedback

### ✅ Relapses Screen ([`app/relapses.tsx`](app/relapses.tsx))
**Implemented:**
- Historical relapse list with timestamps
- Optional notes display
- Delete functionality

### ✅ Settings Screen ([`app/settings.tsx`](app/settings.tsx))
**Implemented:**
- Biometric app lock toggle (Face ID/Touch ID/Fingerprint)
- Reset all data option
- App version info
- Theme toggle infrastructure

**Pending:**
- ⏳ Visible theme toggle in Settings UI
- ⏳ Export data functionality

### ⏳ Motivation Section (Planned)
- Subtle fade-in affirmations
- Nature-inspired transitions (leaf flutter)
- Rotating motivational quotes

### ⏳ Achievements (Planned)
- "Sapling Stage", "Branching Out", "Full Bloom"
- Unlock animations
- Milestone celebration screens

## 🌌 Visual Style & Animations

### Design Inspiration
- Stoic minimalism
- Headspace app design
- Calm app UI/UX
- Lofi-style mindfulness apps

### ⏳ Animation Libraries (To Install)
- `react-native-reanimated` for complex animations
- `moti` for micro-animations
- `expo-linear-gradient` for gradient effects
- `expo-haptics` for tactile feedback

### Planned Animations
- Growth animation for plant icon (Seed → Tree progression)
- Wither animation for relapse reset
- Fade-in/out for motivational quotes
- Leaf flutter transitions
- Celebration animations for milestones
- Gradient growth indicators (green → gold)

## 🧠 Tone & Messaging

**Philosophy**: Supportive, never shaming. Every screen should encourage self-belief and progress.

### ✅ Implemented Copy
- "Seeding — Track your growth. Cultivate your strength." (app tagline)
- "Track your progress" (home screen)
- Privacy-focused messaging throughout

### ⏳ Planned Copy Additions
- "Keep growing."
- "You've planted the seed. Stay grounded."
- "Another day stronger."
- Context-specific motivational affirmations

---

## ⚙️ Technical Implementation

### ✅ Core Tech Stack (Implemented)
- **Framework**: Expo + React Native ✅
- **Routing**: Expo Router v6 (file-based) ✅
- **Styling**: NativeWind (Tailwind CSS for RN) ✅
- **State Management**: Zustand ✅
- **Database**: expo-sqlite with encryption ✅
- **Security**: expo-secure-store + expo-local-authentication ✅
- **Fonts**: @expo-google-fonts/poppins ✅

### ⏳ Pending Installations
- `react-native-reanimated` for animations
- `moti` for micro-animations
- `expo-linear-gradient` for gradients
- `expo-haptics` for tactile feedback

### 📁 Project Structure
```
app/                      # Expo Router screens
  ├── _layout.tsx         # Root layout with initialization
  ├── index.tsx           # Entry point (routing logic)
  ├── onboarding.tsx      # First-time user flow
  ├── home.tsx            # Main screen with streak counter
  ├── relapses.tsx        # History view
  └── settings.tsx        # App configuration

src/
  ├── components/         # Reusable UI components
  │   ├── AppLock.tsx
  │   ├── RelapseModal.tsx
  │   └── ThemeToggle.tsx
  ├── stores/             # Zustand state management
  │   ├── relapseStore.ts
  │   └── themeStore.ts
  ├── theme/              # Design system
  │   ├── colors.ts
  │   ├── typography.ts
  │   └── index.ts
  ├── db/                 # SQLite database
  │   ├── schema.ts
  │   ├── helpers.ts
  │   └── index.ts
  └── services/           # External services
      └── security.ts
```

---

## 🎯 Summary

**Seeding — Track your growth. Cultivate your strength.**

A privacy-first, locally-stored relapse tracker with a growth-focused metaphor that transforms self-improvement into a visual journey from seed to tree.