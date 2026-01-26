# TalentTrack - Student Skill Tracking Platform

TalentTrack is a comprehensive student skill tracking and ranking platform for engineering students and colleges, with a system admin ensuring trust and data integrity.

## 🏗️ Architecture

### Backend (Shared)
- **Framework**: Node.js + Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT with role-based access control
- **API**: RESTful APIs for all three dashboards

### Frontend (Three Separate Dashboards)
- **Technology**: React + Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios

### Dashboard Domains
1. **Student Dashboard** → `talenttrack.in`
2. **College Dashboard** → `college.talenttrack.in`
3. **Admin Dashboard** → `admin.talenttrack.in`

## 📁 Project Structure

```
TalentTrack/
├── backend/                  # Shared Node.js backend
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Auth middleware
│   └── server.js            # Main server file
│
├── student-dashboard/       # Student React app
│   ├── src/
│   │   ├── pages/          # Home, Portfolio, Leaderboards, EditProfile
│   │   ├── components/     # DashboardLayout with left navbar
│   │   ├── context/        # AuthContext
│   │   └── api/            # API client
│   └── package.json
│
├── college-dashboard/       # College Admin React app
│   └── src/
│
└── admin-dashboard/         # Super Admin React app
    └── src/
```

## 🔐 Roles & Permissions

### Student
- View personal dashboard
- Update profile and platform usernames
- View global and college leaderboards
- **Cannot**: Change college, modify scores

### College Admin
- Manage college students
- Create assessments
- Upload marks (CSV/Excel)
- Calculate College Engineer Scores
- View college leaderboard
- **Requires**: Super admin approval

### Super Admin
- Approve college admins
- Verify colleges
- Rename/merge colleges
- Monitor all users and colleges
- View all leaderboards

## 🎓 Student Dashboard Features

### Left Sidebar Navigation (Fixed)
1. **Home** - Profile, Engineer Scores, 4 Ranking Cards
2. **Portfolio** - Coding platform stats (LC, CF, CC, GFG)
3. **Global Leaderboard** - Compare with all students
4. **College Leaderboard** - Compare within college
5. **Edit Profile** - Update personal info

### Home Page Components
- **Profile Section**: Photo, name, college, year, course
- **Engineer Scores**: 
  - Global Engineer Score (platform-defined, read-only)
  - College Engineer Score (college-defined, read-only)
- **4 Ranking Cards**:
  1. Global Rank (all students) - Based on Global Engineer Score
  2. Global Rank (same graduation year) - Based on Global Engineer Score
  3. College Rank (all years) - Based on College Engineer Score
  4. College Rank (same year) - Based on College Engineer Score

### Portfolio Page
Shows 4 platform cards:
- LeetCode (username, rating, problems solved)
- Codeforces (username, rating, problems solved)
- CodeChef (username, rating, problems solved)
- GeeksForGeeks (username, problems solved)

### Leaderboard Pages
**Filters**: Graduation year (All/2025/2026/2027...)
**Sorting**: Engineer Score (default), CF rating, LC rating, CC rating

## 🧮 Global Engineer Score Formula (LOCKED)

```javascript
EngineerScore = (
  sqrt((CF - 800) / 2700) * 0.40 +
  sqrt((LC - 1400) / 1100) * 0.35 +
  sqrt((CC - 1200) / 1800) * 0.25
) * 1000
```

All values clamped between 0 and 1.

## 🏫 Database Schema

### College Schema (CRITICAL)
- `college_id`: UUID (permanent identifier)
- `name_display`: Display name
- `name_key`: UPPERCASE normalized (UNIQUE INDEX)
- `verified`: Boolean

**CRITICAL RULE**: College duplication prevented via `name_key` normalization.

### User Schema
- Common: email, password, role, name, profile_photo
- Student-specific: college_id, graduation_year, course, platforms, ratings, problems_solved, engineer scores
- College admin: managed_college_id, approved

### Assessment Schema
- college_id, name, description, max_marks, weightage

### AssessmentScore Schema
- assessment_id, student_id, marks_obtained

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file (copy from .env.example)
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-secret-key
PORT=5000

# Start server
npm start
# Or for development:
npm run dev
```

### 2. Student Dashboard

```bash
cd student-dashboard
npm install

# Create .env file
REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
```

The student dashboard will run on http://localhost:3000

### 3. College Dashboard

```bash
cd college-dashboard
npm install
npm start
```

Runs on http://localhost:3001

### 4. Admin Dashboard

```bash
cd admin-dashboard
npm install
npm start
```

Runs on http://localhost:3002

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register/student` - Register student
- `POST /api/auth/register/college` - Register college admin
- `POST /api/auth/login` - Login

### Student
- `GET /api/student/profile` - Get profile
- `PUT /api/student/profile` - Update profile
- `GET /api/student/rankings` - Get rankings

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard
  - Query params: `type=global|college`, `year`, `sort`, `page`

### College Admin
- `GET /api/college/overview` - College overview
- `GET /api/college/students` - List students
- `POST /api/college/assessments` - Create assessment
- `POST /api/college/assessments/:id/scores` - Upload scores
- `POST /api/college/calculate-scores` - Calculate college scores

### Super Admin
- `GET /api/admin/pending-admins` - Pending approvals
- `POST /api/admin/approve-admin/:id` - Approve admin
- `GET /api/admin/colleges` - List colleges
- `POST /api/admin/verify-college/:id` - Verify college

## 🎯 Key Features

### ✅ Implemented
- Complete backend with MongoDB schemas
- JWT authentication with role-based access
- Student dashboard with 5-page navigation
- Home page with 4 ranking cards
- Portfolio page with 4 platform cards
- Global and college leaderboards with filters
- Edit profile functionality
- College normalization to prevent duplicates
- Global Engineer Score calculation
- College dashboard (basic structure)
- Admin dashboard (basic structure)

### ⚠️ NOT Included (As Per Requirements)
- Company dashboard
- Payments
- Messaging
- Resume builder
- Advanced analytics
- Notifications

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📝 Development Notes

1. **College Normalization**: Always use `college_id` for relationships. Never trust raw college names.
2. **Engineer Scores**: Global score is calculated automatically. College score is computed by college admin.
3. **Rankings**: Four separate ranking contexts (global all, global year, college all, college year).
4. **Authentication**: All routes protected by role-based middleware.
5. **Leaderboards**: Single API endpoint reused across all dashboards with different parameters.

## 🛡️ Security

- Passwords hashed with bcryptjs
- JWT tokens for authentication
- Role-based route protection
- College admin approval required
- Input validation on all endpoints

## 📱 Responsive Design

All dashboards built with Tailwind CSS for responsive layouts.

## 🎨 Color Scheme

- **Student Dashboard**: Blue (#3b82f6)
- **College Dashboard**: Purple (#8b5cf6)
- **Admin Dashboard**: Red (#dc2626)

## 📞 Support

For issues or questions, check:
- Backend logs: Console output from server.js
- Frontend errors: Browser console
- Database: MongoDB Atlas dashboard

---

**Built with ❤️ for Engineering Students**
