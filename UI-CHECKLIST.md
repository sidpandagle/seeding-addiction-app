# Seeding UI Implementation Checklist

> "Track your growth. Cultivate your strength."

## 🎨 Design System

### Color Palette
- [x] Define primary color: Deep emerald green (#1B5E20)
- [x] Define accent color: Fresh lime (#A5D6A7)
- [x] Define support color: Golden glow (#FFD54F)
- [x] Setup light mode background: Off-white
- [x] Setup dark mode background: Deep charcoal
- [x] Create color theme configuration file (`src/theme/colors.ts`)
- [x] Implement dark/light theme switch (`ThemeToggle` component + `themeStore`)

### Typography
- [x] Install rounded font (Poppins via `@expo-google-fonts/poppins`)
- [x] Configure font weights and sizes (Regular, Medium, SemiBold, Bold)
- [x] Define typography scale for headings, body, captions (`src/theme/typography.ts`)

### UI Components
- [x] Create clean card components with soft shadows (implemented in Home screen)
- [x] Implement circular progress bars
- [x] Build gradient progress rings
- [ ] Create achievement badge components

## 📱 Key Screens

### Home Screen
- [x] Design main layout with centered growth visual
- [x] Implement "Days since last relapse" counter (live countdown with days/hours/min/sec)
- [ ] Add glowing seed/plant icon that grows with streak
- [x] Create motivational subtext component ("Track your progress")
- [ ] Implement growth stage transitions (Seed → Sprout → Plant → Tree)
- [ ] Add gradient growth indicators (green → gold)

### Onboarding Screen
- [x] Design welcome screen with app intro
- [x] Implement "Get Started" flow
- [x] Set journey start timestamp

### Relapse Action
- [x] Design reset confirmation dialog (`RelapseModal` component)
- [ ] Create "plant withering to seed" animation
- [x] Ensure supportive, non-guilt-inducing messaging
- [ ] Add gentle haptic feedback on reset

### Progress Visualization (Relapses Screen)
- [x] Show historical relapse data
- [x] Display relapse list with timestamps and notes
- [x] Build circular progress bar for current streak
- [ ] Display milestones and achievements

### Settings Screen
- [x] Implement app lock with biometric authentication
- [x] Add theme toggle functionality
- [x] Reset all data option with confirmation
- [x] Display app version and info

### Motivation Section
- [ ] Create quotes/affirmations json.
- [ ] Implement fade-in animation for affirmations
- [ ] Add nature-inspired transitions (leaf flutter)
- [ ] Rotate motivational messages

### Achievements
- [ ] Design achievement unlock screens
- [ ] Create visual stages:
  - [ ] "Sapling Stage"
  - [ ] "Branching Out"
  - [ ] "Full Bloom"
- [ ] Add celebration animations
- [ ] Implement achievement notifications

## ✨ Animations & Interactions

### Core Animations
- [ ] Install and configure `react-native-reanimated`
- [ ] Install and configure `moti` for micro-animations
- [ ] Create growth animation for plant icon
- [ ] Build wither animation for relapse reset
- [ ] Implement fade-in/out for affirmations
- [ ] Add leaf flutter transition
- [ ] Create celebration animation for milestones

### Haptic Feedback
- [ ] Install `expo-haptics`
- [ ] Implement haptic feedback for relapse reset
- [ ] Add haptic for milestone achievements
- [ ] Include haptic for navigation actions

## 🎯 Visual Style References

### Design Inspiration
- [ ] Review Stoic minimalism patterns
- [ ] Study Headspace app design
- [ ] Analyze Calm app UI/UX
- [ ] Research Lofi-style mindfulness apps
- [ ] Incorporate clean, minimal aesthetic

## 🌓 Dark Mode

### Dark Theme Implementation
- [x] Design forest-dark color palette (Deep charcoal #1C1C1E)
- [x] Setup theme store with persistence
- [x] Create ThemeToggle component
- [ ] Create glowing seed icons for dark mode
- [ ] Adjust card shadows for dark mode
- [ ] Update gradient colors for dark mode
- [ ] Apply theme colors to all screens (currently using Tailwind defaults)
- [ ] Ensure smooth theme transitions

## 🧩 Technical Setup

### Dependencies
- [x] Setup NativeWind for Tailwind CSS styling
- [x] Configure Zustand for state management
- [x] Setup expo-sqlite for local database
- [x] Install expo-secure-store for encryption
- [x] Install expo-local-authentication for biometric lock
- [x] Install @expo-google-fonts/poppins
- [x] Install react-native-svg for circular progress
- [ ] Install `react-native-reanimated`
- [ ] Install `moti` for animations
- [x] Install `expo-linear-gradient`
- [ ] Install `expo-haptics`
- [x] Configure theme system (colors.ts + typography.ts + themeStore)

### Database & Storage
- [x] SQLite schema with relapses table
- [x] Database helpers (add, get, delete, update)
- [x] Encryption key management
- [x] Journey start tracking
- [x] Zustand store connected to database

### Security & Privacy
- [x] Biometric authentication (Face ID/Touch ID/Fingerprint)
- [x] App lock implementation
- [x] Local-only data storage
- [x] Secure key storage

### Gradients & Visual Effects
- [x] Setup linear gradients for growth indicators
- [ ] Create soft depth effects with gradients
- [ ] Implement glow effects for seed icons

## 📝 Copy & Messaging

### Tone Guidelines
- [x] Ensure supportive, never shaming tone
- [x] Focus on progress and self-belief
- [x] Review all copy for encouraging language

### Example Copy
- [x] "Track your growth. Cultivate your strength." (app tagline)
- [x] "Track your progress" (home screen subtext)
- [ ] "Keep growing."
- [ ] "You've planted the seed. Stay grounded."
- [ ] "Another day stronger."
- [ ] Add context-specific motivational messages

## 🌱 Growth Metaphor Implementation

### Visual Progression Stages
- [ ] Design Seed stage (Day 0-7)
- [ ] Design Sprout stage (Day 8-30)
- [ ] Design Plant stage (Day 31-90)
- [ ] Design Tree stage (Day 90+)
- [ ] Create smooth transitions between stages

### Progress Indicators
- [x] Circular progress ring with gradient
- [ ] Achievement badges

## ✅ Quality Assurance

### Testing
- [ ] Test all animations on both iOS and Android
- [ ] Verify dark/light mode switches smoothly
- [ ] Ensure haptic feedback works correctly
- [ ] Test performance of animations
- [ ] Validate accessibility features
- [ ] Test on various screen sizes

### Polish
- [x] Ensure consistent spacing and alignment (via NativeWind)
- [ ] Verify color contrast ratios
- [ ] Smooth out animation timings
- [x] Add loading states where needed (app initialization)
- [x] Implement error states gracefully (error handling in _layout)

---

## 📊 Current Implementation Status

### ✅ Completed Core Features
- **Database & Storage**: SQLite with encryption, journey tracking
- **Authentication**: Biometric app lock (Face ID/Touch ID/Fingerprint)
- **Screens**: Onboarding, Home, Relapses history, Settings
- **Theme System**: Color palette, typography, theme toggle infrastructure
- **State Management**: Zustand stores for relapses and theme
- **UI Framework**: NativeWind + Tailwind CSS setup

### 🎨 Pending Visual Enhancements
- **Growth Metaphor**: Animated plant icon that grows with streak
- **Animations**: Reanimated + Moti setup, growth/wither animations
- **Gradients**: Linear gradients for progress indicators
- **Haptic Feedback**: Tactile feedback for key interactions
- **Dark Mode Integration**: Apply theme colors throughout UI
- **Achievements System**: Milestone tracking and celebration

### 🌱 Next Priority Items
1. Install and configure animation libraries (reanimated, moti)
2. Design and implement growth stage visuals (Seed → Tree)
3. Add expo-linear-gradient for progress rings
4. Integrate expo-haptics for tactile feedback
5. Apply theme system colors to replace Tailwind defaults
6. Create circular progress visualization
7. Build achievement/milestone system

---

**Design Philosophy:** Supportive, never shaming. Every screen should encourage self-belief and progress.
