# Eco Circle 🌿 (React Native Android Mobile App)

> **Eco Circle** is a complete community resource-sharing mobile application built with **React Native**, **Expo**, **TypeScript**, and **Expo Router** targeting Android devices.

---

## 🌟 Architecture & Features

- **Platform**: React Native (Expo SDK 52)
- **Primary Target**: Android (playable on Expo Go app & compileable to APK/AAB)
- **Language**: TypeScript
- **Navigation**: Expo Router (File-based route structure)
- **Design System**: Eco-theme color palette (`#10B981` Emerald, `#047857` Dark Green, `#D1FAE5` Light Green, `#F59E0B` Amber, `#0284C7` Blue) with native `StyleSheet` components
- **Role-Based Access**:
  - **Admin**: Member approval queue, resource moderation, issue resolution, broadcast announcements.
  - **User**: Unused item sharing, resource requests, community feed, events, and problem reporting.

---

## 🚀 How to Run the App with Expo

### Prerequisites
- Node.js (v18+)
- **Expo Go** app installed on your Android smartphone (from Google Play Store), OR an Android Emulator.

### Commands

1. **Navigate to the project root**:
   ```bash
   cd "Eco Circle"
   ```

2. **Start Expo Development Server**:
   ```bash
   npx expo start
   ```

3. **Run on Android**:
   - Press **`a`** in your terminal to launch on a connected Android device / emulator.
   - OR scan the QR code using the **Expo Go** app on your Android smartphone.

---

## 📁 Directory Structure

```
Eco Circle/
├── app/                  # Expo Router file-based screen routes
│   ├── _layout.tsx       # Root layout provider wrapper
│   ├── index.tsx         # Splash landing screen
│   ├── (auth)/           # Authentication screens (Login, Register, Pending, Success)
│   ├── (user)/           # User Tab Navigator (Home, Resources, Feed, Events, Alerts, Profile)
│   └── (admin)/          # Admin Tab Navigator (Dashboard, Approvals, Moderation, Issues, Analytics)
├── components/           # Reusable React Native UI components (Button, Card, StatusBadge, etc.)
├── constants/            # Design system palette (colors.ts) and typed routes (routes.ts)
├── contexts/             # React Native Context API (AuthContext, AppDataContext)
├── services/             # Modular service API abstractions prepared for Supabase
├── types/                # TypeScript interfaces (auth, resource, request, community, event, problem)
├── app.json              # Expo configuration (Package: com.ecocircle.app)
└── tsconfig.json         # TypeScript configuration
```
