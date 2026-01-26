# Student Dashboard - Left Navbar Structure

The student dashboard MUST have a **left sidebar navigation** that persists across all pages.

## Navigation Items (Fixed Order)

1. **Home** 🏠
   - Profile information
   - Engineer scores
   - 4 ranking cards

2. **Portfolio** 📁
   - LeetCode card
   - Codeforces card
   - CodeChef card
   - GeeksForGeeks card

3. **Global Leaderboard** 🌍
   - All students comparison
   - Filters: Year, Sort by

4. **College Leaderboard** 🏫
   - College-specific comparison
   - Filters: Year, Sort by

5. **Edit Profile** ✏️
   - Update personal info
   - Update platform usernames

## Layout Structure

```
┌─────────────┬────────────────────────────────────┐
│             │                                    │
│  Sidebar    │         Page Content               │
│             │                                    │
│  - Home     │  (Home/Portfolio/Leaderboards)    │
│  - Portfolio│                                    │
│  - Global   │                                    │
│  - College  │                                    │
│  - Edit     │                                    │
│             │                                    │
│  [Profile]  │                                    │
│  [Logout]   │                                    │
└─────────────┴────────────────────────────────────┘
```

## Implementation

See: `student-dashboard/src/components/DashboardLayout.js`

The sidebar is implemented as a fixed left panel (264px width) with the main content offset by `ml-64`.
