# Seeding App - UI Layout Documentation

## 📱 Application Overview
**Seeding** is a privacy-focused relapse tracking React Native mobile application built with Expo Router and NativeWind (Tailwind CSS). The app features a tab-based navigation system with dark/light theme support and biometric authentication.

---

## 🏗️ Navigation Structure

```
Root Layout (_layout.tsx)
├── Splash/Loading Screen
├── Index (Route Handler)
│   ├── → Onboarding (if first time)
│   └── → Home Tab (if journey started)
└── Tab Navigation ((tabs)/_layout.tsx)
    ├── Home
    ├── History
    ├── Achievements
    └── Settings
```

---

## 📄 Screen Layouts

### 1. **Onboarding Screen** (`/onboarding`)

#### Layout Structure:
```
┌─────────────────────────────┐
│                             │
│         (Center)            │
│                             │
│    Welcome to Seeding       │  ← Large heading (4xl, bold)
│                             │
│  A privacy-focused          │  ← Subtitle (lg, gray)
│  relapse tracking app       │
│                             │
│    [Get Started Button]     │  ← Emerald green CTA button
│                             │
└─────────────────────────────┘
```

#### UI Elements:
- **Background**: White (light) / Gray-900 (dark)
- **Title**: "Welcome to Seeding" - 4xl, bold
- **Subtitle**: Privacy description - lg, gray-600/400
- **CTA Button**: 
  - Rounded-full shape
  - Emerald-600 background
  - White text, semibold
  - Active state with darker shade

---

### 2. **Home Screen** (`/(tabs)/home`)

#### Layout Structure:
```
┌─────────────────────────────────────┐
│ Header                              │
│ ┌─────────────────┬───────────────┐ │
│ │ Seeding         │ [Emergency]   │ │  ← Emergency help button (red)
│ │ Growth Stage    │               │ │
│ └─────────────────┴───────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │     Circular Progress           │ │
│ │   ┌─────────────────┐           │ │
│ │   │   Growth Icon   │           │ │  ← Animated plant emoji
│ │   │   Live Timer    │           │ │  ← Real-time countdown
│ │   └─────────────────┘           │ │
│ │                                 │ │
│ │  🌱 Seedling • 🎯 24 Hours     │ │  ← Stage & next milestone
│ └─────────────────────────────────┘ │
│                                     │
│ Quick Actions:                      │
│ ┌──────────────┬─────────────────┐  │
│ │ Resisted     │  Record         │  │
│ │ Urge 🛡️     │  Relapse 🔄     │  │  ← Primary action buttons
│ │ (Blue)       │  (White)        │  │
│ └──────────────┴─────────────────┘  │
│                                     │
│ Your Progress:                      │
│ ┌─────────┬─────────┐              │
│ │ Total   │  Best   │              │
│ │ Attempts│ Streak  │              │  ← Stats cards with icons
│ │   12    │  7 days │              │
│ └─────────┴─────────┘              │
│ ┌─────────┬─────────┐              │
│ │ Urges   │ Success │              │
│ │ Resisted│  Rate   │              │
│ │   45    │   78%   │              │
│ └─────────┴─────────┘              │
│                                     │
│ Motivation Card                     │
│ ┌─────────────────────────────────┐ │
│ │ "Every day is a new beginning"  │ │  ← Random quote
│ │ - Marcus Aurelius               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Key Components:

**Header Section:**
- App title: "Seeding" (3xl, semibold, tracking-widest)
- Growth stage description (sm, emerald-700/400)
- Emergency help button (red AlertCircle icon, 14x14)

**Hero Section (Circular Progress):**
- White card with shadow
- **CircularProgress Component:**
  - Size: 260px
  - Stroke width: 16px
  - Gradient colors: emerald shades
  - Progress based on checkpoint duration
- **Center Content:**
  - Growth icon (70px, animated, glowing)
  - Live timer (days:hours:mins:secs)
- **Status Badge:**
  - Growth stage emoji + label
  - Next checkpoint target

**Quick Actions (2 buttons):**
- **Resisted Urge** (Left):
  - Blue-600 background
  - Shield icon (28px, white)
  - "Track your strength" subtitle
- **Record Relapse** (Right):
  - White background
  - RotateCcw icon (28px, emerald)
  - "It's okay to restart" subtitle

**Stats Grid (4 cards in 2x2):**
1. **Total Attempts** - Emerald, RotateCcw icon
2. **Best Streak** - Amber, Award icon
3. **Urges Resisted** - Blue, Shield icon
4. **Success Rate** - Purple, Heart icon

Each card:
- White background with border
- Icon watermark (70px, 15% opacity)
- Label (xs, uppercase, gray)
- Value (3xl, bold, colored)

**Motivation Card:**
- Random stoic quote
- Sparkles icon
- Light background with border

---

### 3. **History Screen** (`/(tabs)/history`)

#### Layout Structure:
```
┌─────────────────────────────────────┐
│ Header                              │
│ ┌─────────────────┬───────────────┐ │
│ │ History         │ [Insights 📊] │ │  ← Insights modal trigger
│ │ Track journey   │               │ │
│ └─────────────────┴───────────────┘ │
│                                     │
│ Stats Summary:                      │
│ ┌──────────────┬─────────────────┐  │
│ │ Total Events │ Current Streak  │  │
│ │     24       │    7 days       │  │
│ └──────────────┴─────────────────┘  │
│                                     │
│ View Toggle:                        │
│ ┌──────────────┬─────────────────┐  │
│ │ [List View]  │ [Calendar View] │  │  ← Toggle between views
│ └──────────────┴─────────────────┘  │
│                                     │
│ ═════════════════════════════════   │
│                                     │
│ LIST VIEW:                          │
│ ┌─────────────────────────────────┐ │
│ │ 📅 Jan 15, 2025 - 2:30 PM       │ │
│ │ 7 days ago                      │ │
│ │ Tags: Stress, Trigger           │ │  ← Relapse item
│ │ Note: "Went for a walk..."      │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 📅 Jan 8, 2025 - 4:15 PM        │ │
│ │ 14 days ago                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ OR                                  │
│                                     │
│ CALENDAR VIEW:                      │
│ ┌─────────────────────────────────┐ │
│ │  January 2025                   │ │
│ │  S  M  T  W  T  F  S            │ │
│ │           1  2  3  4            │ │
│ │  5  6  7 [8] 9 10 11            │ │  ← Days with dots
│ │ 12 13 14[15]16 17 18            │ │    Selected day highlighted
│ │                                 │ │
│ │ Selected: Jan 15                │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ 2:30 PM                     │ │ │  ← Selected date details
│ │ │ Stress, Trigger             │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### View Modes:

**1. List View:**
- ScrollView with relapse cards
- Each card shows:
  - Date & time
  - Days ago
  - Tags (colored pills)
  - Note preview
  - Edit/Delete actions

**2. Calendar View:**
- Monthly calendar grid
- Days with relapses marked with dots
- Selected day highlighted
- Details panel below calendar
- Journey start date marked

**Insights Modal:**
- Weekly/Monthly stats
- Trigger analysis
- Success patterns
- Graphs and charts

---

### 4. **Achievements Screen** (`/(tabs)/achievements`)

#### Layout Structure:
```
┌─────────────────────────────────────┐
│ Header                              │
│ ┌─────────────────┬───────────────┐ │
│ │ Achievements    │  [Trophy 🏆]  │ │
│ │ Celebrate       │               │ │
│ └─────────────────┴───────────────┘ │
│                                     │
│ Progress Overview:                  │
│ ┌─────────────────────────────────┐ │
│ │ Your Progress                   │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ ████████░░░░░░░░░░░  45%    │ │ │  ← Progress bar
│ │ └─────────────────────────────┘ │ │
│ │ 12/27 • 15 remaining            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Achievements Grid:                  │
│ ┌────────┬────────┬────────┐        │
│ │  🏅    │  🎯    │  ⭐    │        │
│ │ First  │ 24 Hrs │ Week   │        │  ← Achievement badges
│ │ Step   │ Strong │ Warrior│        │    (3 per row)
│ │ ✓      │  ✓     │   🔒   │        │    Unlocked/Locked
│ └────────┴────────┴────────┘        │
│ ┌────────┬────────┬────────┐        │
│ │  💎    │  🔥    │  🌟    │        │
│ │ Month  │ Resist │Century │        │
│ │Champion│  King  │  Club  │        │
│ │  ✓     │  🔒    │   🔒   │        │
│ └────────┴────────┴────────┘        │
│                                     │
│ (Scrollable grid continues...)      │
└─────────────────────────────────────┘
```

#### Achievement Badge States:
- **Unlocked**: Full color, checkmark, touchable
- **Locked**: Grayscale, lock icon, 50% opacity
- **Recently Unlocked**: Celebration animation

**Achievement Categories:**
- Time-based (1 hour, 24 hours, week, month, etc.)
- Urge resistance milestones
- Streak achievements
- Special occasions (100 days, 1 year, etc.)

---

### 5. **Settings Screen** (`/(tabs)/settings`)

#### Layout Structure:
```
┌─────────────────────────────────────┐
│ Header                              │
│ ┌─────────────────┬───────────────┐ │
│ │ Settings        │  [Settings ⚙️] │ │
│ │ Customize       │               │ │
│ └─────────────────┴───────────────┘ │
│                                     │
│ ══ APPEARANCE ══                    │
│ ┌─────────────────────────────────┐ │
│ │ Theme                           │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ ☀️ Light Mode          (•)  │ │ │  ← Radio selected
│ │ └─────────────────────────────┘ │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ 🌙 Dark Mode           ( )  │ │ │  ← Radio unselected
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ══ SECURITY ══                      │
│ ┌─────────────────────────────────┐ │
│ │ 🔒 App Lock                     │ │
│ │ Protect with Face ID     [ON]  │ │  ← Toggle switch
│ └─────────────────────────────────┘ │
│                                     │
│ ══ DATA MANAGEMENT ══               │
│ ┌─────────────────────────────────┐ │
│ │ 🗑️ Reset All Data         →    │ │  ← Destructive action
│ │ Permanently delete all records  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ App Info:                           │
│ ┌─────────────────────────────────┐ │
│ │         ℹ️                       │ │
│ │      Seeding                    │ │
│ │    Version 1.0.0                │ │
│ │                                 │ │
│ │ Privacy-focused relapse tracking│ │
│ │ Your data stays on your device  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Settings Sections:

**1. Appearance:**
- Theme selector (Light/Dark)
- Radio button style selection
- Animated transitions

**2. Security:**
- App Lock toggle
- Biometric authentication (Face ID/Touch ID/Fingerprint)
- Requires authentication to enable/disable

**3. Data Management:**
- Reset all data button (red, destructive)
- Confirmation alert with warning

**4. App Info:**
- App icon/logo
- Version number
- Privacy statement

---

## 🎨 Modal Components

### 1. **Relapse Modal**

```
┌─────────────────────────────────────┐
│ Header (Rose background)            │
│ ┌─────────────────┬───────────────┐ │
│ │ Log Relapse     │    🔄        │ │
│ │ Every journey   │               │ │
│ │ has setbacks    │               │ │
│ └─────────────────┴───────────────┘ │
│                                     │
│ Content Card:                       │
│ ┌─────────────────────────────────┐ │
│ │ HOW DID YOU OVERCOME IT?        │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ (Text input)                │ │ │
│ │ │ e.g., Went for a walk...    │ │ │
│ │ │                             │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ WHAT TRIGGERED THE URGE?        │ │
│ │ [Stress] [Trigger] [Social]     │ │  ← Tag pills
│ │ [Boredom] [Craving] [Other]     │ │    (toggleable)
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │         [Save]                  │ │  ← Emerald button
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │         [Cancel]                │ │  ← White/bordered
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Features:**
- Multiline text input for notes
- Tag selection (multiple)
- Timestamp display (when editing)
- Save/Cancel actions
- Keyboard avoiding view

---

### 2. **Urge Modal**

```
┌─────────────────────────────────────┐
│ Header (Blue background)            │
│ ┌─────────────────┬───────────────┐ │
│ │ Urge Resisted!  │    🛡️        │ │
│ │ 💪 Great job!   │               │ │
│ └─────────────────┴───────────────┘ │
│                                     │
│ Content Card:                       │
│ ┌─────────────────────────────────┐ │
│ │ HOW DID YOU OVERCOME IT?        │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ (Text input)                │ │ │
│ │ │ e.g., Went for a walk...    │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ WHAT TRIGGERED THE URGE?        │ │
│ │ [Stress] [Boredom] [Trigger]    │ │  ← Context pills
│ │ [Social] [Tired] [Anxious]      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │      [Log Victory]              │ │  ← Blue button
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │        [Cancel]                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Similar to Relapse Modal but:**
- Blue theme instead of rose
- "Log Victory" button text
- Different context options

---

### 3. **Emergency Help Modal**

```
┌─────────────────────────────────────┐
│ Header (Rose background)            │
│ ┌─────────────────┬───────────────┐ │
│ │ You've Got This │      [X]      │ │  ← Close button
│ │ This will pass  │               │ │
│ └─────────────────┴───────────────┘ │
│                                     │
│ Stoic Wisdom:                       │
│ ┌─────────────────────────────────┐ │
│ │ 🧠 Stoic Wisdom      [New]      │ │  ← Random quote
│ │ ┌─────────────────────────────┐ │ │
│ │ │ DISCIPLINE                  │ │ │  ← Category badge
│ │ │ "You have power over your   │ │ │
│ │ │  mind - not outside events" │ │ │
│ │ │ — Marcus Aurelius           │ │ │
│ │ │                             │ │ │
│ │ │ This teaches that...        │ │ │  ← Explanation
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Take Action Now:                    │
│ ┌─────────────────────────────────┐ │
│ │ 💪 Physical Reset               │ │
│ │ Do 10 push-ups, cold shower...  │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🧘 Mental Distraction           │ │
│ │ Call a friend, meditate...      │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🎯 Remember Your Why            │ │
│ │ Think about your goals...       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Reminder:                           │
│ ┌─────────────────────────────────┐ │
│ │ This feeling is temporary       │ │
│ │ Urges last 15-20 minutes        │ │  ← Motivational message
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Features:**
- Stoic quotes with categories
- Refresh for new quote
- Action suggestions (3 categories)
- Reminder message
- Full-screen modal with close button

---

### 4. **Achievement Celebration Modal**

```
┌─────────────────────────────────────┐
│                                     │
│             ✨ ✨ ✨                │
│                                     │
│         🏆 Achievement             │
│           Unlocked!                 │
│                                     │
│         [Trophy Icon]               │  ← Large animated icon
│                                     │
│       "24 Hours Strong"             │  ← Achievement title
│                                     │
│   "Completed your first day"        │  ← Description
│                                     │
│             ✨ ✨ ✨                │
│                                     │
│      [Continue Journey]             │  ← Dismiss button
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Confetti/celebration animation
- Large achievement icon
- Achievement name and description
- Celebratory message
- Auto-dismiss or manual close

---

### 5. **Insights Modal** (History)

```
┌─────────────────────────────────────┐
│ Header                              │
│ ┌─────────────────┬───────────────┐ │
│ │ Your Insights   │      [X]      │ │
│ └─────────────────┴───────────────┘ │
│                                     │
│ Time Period: [Week] [Month] [All]   │  ← Filter tabs
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📊 Relapse Frequency            │ │
│ │ [Bar Chart]                     │ │  ← Weekly/Monthly chart
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🏷️ Common Triggers               │ │
│ │ Stress     ████████ 45%         │ │
│ │ Boredom    ██████   32%         │ │  ← Horizontal bars
│ │ Trigger    ████     23%         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📅 Best Time Periods            │ │
│ │ Longest streak: 14 days         │ │
│ │ Most urges resisted: 23         │ │  ← Key stats
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Features:**
- Time period filters
- Frequency charts
- Trigger analysis
- Pattern insights
- Success metrics

---

### 6. **Achievement Detail Modal**

```
┌─────────────────────────────────────┐
│                [X]                  │  ← Close button
│                                     │
│         [Large Icon]                │  ← Achievement icon (100px)
│                                     │
│       "Week Warrior"                │  ← Title (2xl, bold)
│                                     │
│   "Complete 7 days clean"           │  ← Description
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Status: ✓ Unlocked              │ │
│ │ Unlocked: Jan 15, 2025          │ │  ← Details card
│ │ Rarity: 🌟 Rare (23%)           │ │
│ └─────────────────────────────────┘ │
│                                     │
│     [Share Achievement]             │  ← Optional action
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 Design System

### Color Palette

**Light Theme:**
- Background: `gray-50` (#f9fafb)
- Surface: `white` (#ffffff)
- Primary: `emerald-600` (#10b981)
- Secondary: `blue-600` (#3b82f6)
- Accent: `amber-600` (#f59e0b)
- Danger: `red-600` (#ef4444)
- Text Primary: `gray-900` (#111827)
- Text Secondary: `gray-600` (#4b5563)
- Border: `gray-200` (#e5e7eb)

**Dark Theme:**
- Background: `gray-950` (#030712)
- Surface: `gray-900` (#111827)
- Primary: `emerald-400` (#34d399)
- Secondary: `blue-400` (#60a5fa)
- Accent: `amber-400` (#fbbf24)
- Danger: `red-400` (#f87171)
- Text Primary: `white` (#ffffff)
- Text Secondary: `gray-400` (#9ca3af)
- Border: `gray-800` (#1f2937)

### Typography (Poppins Font)

- **Headings:**
  - 3xl (30px) - Screen titles
  - 2xl (24px) - Section headers
  - xl (20px) - Subsections
  - lg (18px) - Card titles

- **Body:**
  - base (16px) - Regular text
  - sm (14px) - Secondary text
  - xs (12px) - Labels, captions

- **Weights:**
  - Regular (400)
  - Medium (500)
  - SemiBold (600)
  - Bold (700)

### Spacing

- **Padding/Margin:**
  - px-6 (24px) - Screen horizontal padding
  - py-4 (16px) - Button vertical padding
  - gap-3/4/6 (12px/16px/24px) - Element spacing

- **Rounded Corners:**
  - rounded-2xl (16px) - Cards, buttons
  - rounded-xl (12px) - Input fields
  - rounded-full - Pills, badges

### Shadows & Elevation

- **Cards:** `shadow-sm` with border
- **Modals:** `shadow-lg` with border
- **Buttons:** Active state opacity changes

---

## 🧩 Reusable Components

### 1. **CircularProgress** (`src/components/home/CircularProgress.tsx`)
- Animated SVG circle
- Gradient stroke support
- Progress based on time elapsed
- Children rendered in center

### 2. **GrowthIcon** (`src/components/home/GrowthIcon.tsx`)
- Emoji-based plant stages
- Animated transitions
- Glowing effect option
- Sizes: sm, md, lg

### 3. **LiveTimer** (`src/components/home/LiveTimer.tsx`)
- Real-time countdown
- Format: days:hours:mins:secs
- Updates every second
- Optional days display

### 4. **AchievementBadge** (`src/components/achievements/AchievementBadge.tsx`)
- Locked/Unlocked states
- Icon, title, description
- Touch feedback
- Progress indicator

### 5. **MotivationCard** (`src/components/home/MotivationCard.tsx`)
- Random stoic quotes
- Refresh functionality
- Styled card with icon
- Category-based colors

### 6. **HistoryCalendar** (`src/components/history/HistoryCalendar.tsx`)
- Monthly view
- Marked days
- Date selection
- Journey start indicator

### 7. **ScreenWrapper** (`src/components/common/ScreenWrapper.tsx`)
- Consistent screen padding
- Safe area handling
- Background color management

### 8. **AppLock** (`src/components/common/AppLock.tsx`)
- Biometric authentication overlay
- Face ID/Touch ID/Fingerprint
- App resume detection

### 9. **ThemeTransitionOverlay** (`src/components/common/ThemeTransitionOverlay.tsx`)
- Smooth theme switching
- Fade animation
- Prevents white flash

---

## 📊 Tab Bar Navigation

```
┌───────────────────────────────────────────┐
│  [🏠]    [📊]    [🏆]    [⚙️]           │
│  Home   History  Achieve  Settings        │
└───────────────────────────────────────────┘
```

**Tab Bar Specs:**
- Height: 70px + safe area inset
- Background: white (light) / gray-800 (dark)
- Active color: emerald-600
- Inactive color: gray-400
- Icons: Lucide React Native (24px)
- Labels: 11px, Poppins SemiBold
- Border top: gray-200/700

**Icons:**
- Home: `Home`
- History: `History`
- Achievements: `Trophy`
- Settings: `Settings`

---

## 🔐 Security Features

### App Lock Screen
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│            🔒                       │
│                                     │
│         Seeding                     │
│                                     │
│    Unlock with Face ID              │
│                                     │
│       [Authenticate]                │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

- Triggered on app open (if enabled)
- Biometric prompt
- Fallback to device passcode
- Full-screen overlay

---

## 🎭 Animations & Transitions

### Screen Transitions
- **Tab switching:** Fade animation (150ms)
- **Modal presentation:** Slide from bottom
- **Theme switching:** Fade overlay (200ms)

### Component Animations
- **Achievement unlock:** Scale + confetti
- **Button press:** Scale 0.95
- **Growth icon:** Rotation + glow pulse
- **Progress circles:** Smooth arc drawing
- **Theme buttons:** Spring animation

### Haptic Feedback
- Light impact on button press
- Medium impact on modal dismiss
- Success notification on save

---

## 📱 Responsive Considerations

### Safe Area Handling
- All screens use `SafeAreaProvider`
- Tab bar respects bottom inset
- Headers account for status bar
- Modals use `KeyboardAvoidingView`

### Keyboard Management
- Input fields scroll into view
- Modal height adjusts
- Dismiss on outside tap
- Return key handling

### Dark Mode Support
- All components have dark variants
- Smooth transition overlay
- Persistent preference
- System theme detection

---

## 🗂️ File Structure Summary

```
app/
├── _layout.tsx          # Root navigation & initialization
├── index.tsx            # Route handler (splash)
├── onboarding.tsx       # First-time user screen
└── (tabs)/
    ├── _layout.tsx      # Tab navigation setup
    ├── home.tsx         # Main dashboard
    ├── history.tsx      # Relapse history & calendar
    ├── achievements.tsx # Achievement gallery
    └── settings.tsx     # App settings

src/components/
├── home/
│   ├── CircularProgress.tsx
│   ├── GrowthIcon.tsx
│   ├── LiveTimer.tsx
│   └── MotivationCard.tsx
├── history/
│   ├── HistoryCalendar.tsx
│   ├── HistoryList.tsx
│   ├── ViewToggle.tsx
│   ├── InsightsModal.tsx
│   └── CalendarRelapseDetails.tsx
├── achievements/
│   ├── AchievementBadge.tsx
│   ├── AchievementsGrid.tsx
│   ├── AchievementCelebration.tsx
│   └── AchievementDetailModal.tsx
├── modals/
│   ├── RelapseModal.tsx
│   ├── UrgeModal.tsx
│   └── EmergencyHelpModal.tsx
└── common/
    ├── ScreenWrapper.tsx
    ├── AppLock.tsx
    └── ThemeTransitionOverlay.tsx
```

---

## 🎯 Key User Flows

### 1. First Time User
```
Open App → Onboarding → Get Started → Home (Journey Starts)
```

### 2. Record Relapse
```
Home → Record Relapse Button → Fill Modal → Save → Timer Resets
```

### 3. Log Resisted Urge
```
Home → Resisted Urge Button → Fill Modal → Save → Stats Update
```

### 4. Emergency Help
```
Home → Emergency Button → Read Stoic Quote → Take Action Suggestion
```

### 5. View Progress
```
Home → View Stats Cards → Navigate to History → See Calendar/List
```

### 6. Unlock Achievement
```
Time Passes → Achievement Triggers → Celebration Modal → View in Achievements Tab
```

### 7. Change Theme
```
Settings → Appearance → Select Light/Dark → Smooth Transition
```

---

## 📝 Notes

- **Privacy First:** All data stored locally using SQLite
- **Offline First:** No internet connection required
- **Performance:** Optimized re-renders, memoization, lazy loading
- **Accessibility:** Semantic HTML, touch targets 44x44px minimum
- **Platform:** iOS & Android support via Expo
- **Testing:** Manual testing on physical devices recommended

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Framework:** React Native (Expo Router) + NativeWind
