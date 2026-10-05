# Eco Circle - React Native Mobile Application Plan

## 1. Project Overview
**Eco Circle** is a private community resource-sharing mobile application built targeting **Android** (and iOS) using **React Native**, **Expo**, **TypeScript**, and **Expo Router**. Verified community members can share unused items, browse and request needed resources, communicate after request approval, post local information, join events, and report neighborhood issues.

---

## 2. Technology Stack & Rationale
- **Frontend Framework**: React Native 0.76 + Expo SDK 52
  - *Rationale*: True native mobile UI execution targeting Android, runnable seamlessly on physical devices via Expo Go, and buildable to Android APK/AAB packages.
- **Navigation Engine**: Expo Router v4 (File-based navigation)
  - *Rationale*: Native stack and tab navigator integration supporting strict group routes (`(auth)`, `(user)`, `(admin)`).
- **Language**: TypeScript (v5.3+)
  - *Rationale*: Strong type definitions for UserProfile, ResourceItem, ResourceRequest, CommunityPost, Event, and ProblemReport schemas.
- **Backend Architecture**: Supabase (PostgreSQL, Auth, Storage, Realtime)
  - *Rationale*: Production-grade authentication, row-level security (RLS), image asset storage, and realtime messaging.

---

## 3. User Roles & Capabilities

### A. ADMIN (Community Head / Manager)
1. Verify newly registered community members (Approve or Reject).
2. Manage verified community members.
3. Monitor shared resources.
4. Manage community posts & information.
5. Create and manage community events.
6. View, assign, and update reported community problem statuses.
7. Broadcast urgent community announcements.
8. View real-time community statistics and analytics.

### B. COMMUNITY USER (Verified Resident)
1. Register an account and submit verification document proof.
2. Wait for Admin approval (restricted access during pending state).
3. Log in once approved.
4. Share unused resources (with photos, condition, description).
5. Browse and search available resources.
6. Submit resource requests to owners.
7. Accept or reject requests for own resources.
8. View contact information upon request acceptance to coordinate exchange.
9. Post community information and comment on posts.
10. View and RSVP for community events.
11. Report neighborhood problems and track status.
12. Manage profile and notifications.

---

## 4. Complete Screen List (45 Screens)

### User Screens (1–27)
1. **Splash Screen** (`app/index.tsx`)
2. **Welcome / Role Selection** (`app/(auth)/welcome.tsx`)
3. **User Login** (`app/(auth)/user-login.tsx`)
4. **User Registration** (`app/(auth)/user-register.tsx`)
5. **Pending Verification** (`app/(auth)/pending-verification.tsx`)
6. **Verification Success** (`app/(auth)/verification-success.tsx`)
7. **Home Dashboard** (`app/(user)/home.tsx`)
8. **Community Feed** (`app/(user)/community.tsx`)
9. **Notifications** (`app/(user)/notifications.tsx`)
10. **User Profile** (`app/(user)/profile.tsx`)
11. **Edit Profile**
12. **Browse Resources** (`app/(user)/resources.tsx`)
13. **Resource Details**
14. **Share Resource**
15. **My Shared Resources**
16. **Edit Resource**
17. **My Resource Requests**
18. **Received Requests**
19. **Request Details**
20. **Request Accepted / Contact Owner**
21. **Create Community Post**
22. **Post Details / Comments**
23. **Community Events** (`app/(user)/events.tsx`)
24. **Event Details**
25. **Report Community Problem**
26. **My Reported Problems**
27. **Problem Details / Status**

### Admin Screens (28–45)
28. **Admin Login** (`app/(auth)/admin-login.tsx`)
29. **Admin Dashboard** (`app/(admin)/dashboard.tsx`)
30. **Pending User Approvals** (`app/(admin)/users.tsx`)
31. **User Verification Details**
32. **All Community Members**
33. **Member Profile**
34. **All Shared Resources** (`app/(admin)/resources.tsx`)
35. **Resource Details / Moderation**
36. **Community Posts Management** (`app/(admin)/posts.tsx`)
37. **Post Details**
38. **Create Announcement**
39. **Events Management** (`app/(admin)/events.tsx`)
40. **Create/Edit Event**
41. **Reported Problems** (`app/(admin)/problems.tsx`)
42. **Problem Details**
43. **Update Problem Status**
44. **Community Analytics** (`app/(admin)/analytics.tsx`)
45. **Admin Profile / Settings**

---

## 5. Development Phases

- **Phase 1 (Completed)**: React Native + Expo + TypeScript setup, file-based route architecture in `app/`, components, types, services, and app layout.
- **Phase 2**: Authentication & Verification Module (Login, Register, Pending Approval, Admin Approvals).
- **Phase 3**: User Home Dashboard & Notifications.
- **Phase 4**: Resource Sharing & Discovery Module.
- **Phase 5**: Community Information & Feed.
- **Phase 6**: Community Events & Issue Reporting.
- **Phase 7**: Admin Control Panel, Analytics & Moderation.
