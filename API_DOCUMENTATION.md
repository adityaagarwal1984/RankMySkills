# API Documentation - TalentTrack

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register Student
**POST** `/auth/register/student`

**Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "name": "John Doe",
  "college_name": "MIT",
  "graduation_year": 2027,
  "course": "Computer Science"
}
```

**Response:**
```json
{
  "message": "Student registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student",
    "college_id": "uuid-here"
  }
}
```

### Register College Admin
**POST** `/auth/register/college`

**Body:**
```json
{
  "email": "admin@college.edu",
  "password": "password123",
  "name": "Admin Name",
  "college_name": "MIT",
  "city": "Cambridge",
  "state": "MA"
}
```

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 👤 Student Endpoints

### Get Profile
**GET** `/student/profile`
**Auth:** Required (student)

**Response:**
```json
{
  "student": {
    "id": "...",
    "name": "John Doe",
    "email": "student@example.com",
    "profile_photo": "url",
    "college": {
      "college_id": "uuid",
      "name": "MIT",
      "verified": true
    },
    "graduation_year": 2027,
    "course": "Computer Science",
    "platforms": {
      "leetcode": "username",
      "codeforces": "handle",
      "codechef": "username",
      "gfg": "username"
    },
    "ratings": {
      "leetcode": 1800,
      "codeforces": 1400,
      "codechef": 1600
    },
    "problems_solved": {
      "leetcode": 150,
      "codeforces": 100,
      "codechef": 80,
      "gfg": 200
    },
    "global_engineer_score": 450,
    "college_engineer_score": 850
  }
}
```

### Update Profile
**PUT** `/student/profile`
**Auth:** Required (student)

**Body:**
```json
{
  "name": "John Updated",
  "course": "AI & ML",
  "graduation_year": 2027,
  "profile_photo": "https://...",
  "platforms": {
    "leetcode": "new_username",
    "codeforces": "new_handle"
  }
}
```

### Get Rankings
**GET** `/student/rankings`
**Auth:** Required (student)

**Response:**
```json
{
  "rankings": {
    "global": {
      "rank": 45,
      "total": 1000,
      "score_type": "Global Engineer Score"
    },
    "global_year": {
      "rank": 12,
      "total": 250,
      "year": 2027,
      "score_type": "Global Engineer Score"
    },
    "college": {
      "rank": 5,
      "total": 50,
      "score_type": "College Engineer Score"
    },
    "college_year": {
      "rank": 2,
      "total": 15,
      "year": 2027,
      "score_type": "College Engineer Score"
    }
  }
}
```

---

## 🏆 Leaderboard Endpoints

### Get Leaderboard
**GET** `/leaderboard`
**Auth:** Required

**Query Parameters:**
- `type`: "global" or "college" (required)
- `year`: graduation year or "all" (default: "all")
- `sort`: "engineer_score", "cf", "lc", "cc" (default: "engineer_score")
- `college_id`: required for type=college (auto-filled from user)
- `page`: page number (default: 1)
- `limit`: results per page (default: 100)

**Example:**
```
GET /leaderboard?type=global&year=2027&sort=cf&page=1
```

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "id": "...",
      "name": "Top Student",
      "profile_photo": "url",
      "college": "MIT",
      "graduation_year": 2027,
      "course": "CS",
      "global_engineer_score": 950,
      "college_engineer_score": 890,
      "ratings": {
        "leetcode": 2400,
        "codeforces": 2100,
        "codechef": 2200
      },
      "problems_solved": {
        "leetcode": 500,
        "codeforces": 300,
        "codechef": 250,
        "gfg": 600
      }
    }
  ],
  "meta": {
    "type": "global",
    "year": "2027",
    "sort": "cf",
    "page": 1,
    "limit": 100,
    "total": 250,
    "total_pages": 3
  }
}
```

### Get Available Years
**GET** `/leaderboard/years`
**Auth:** Required

**Response:**
```json
{
  "years": [2025, 2026, 2027, 2028]
}
```

---

## 🏫 College Admin Endpoints

### Get College Overview
**GET** `/college/overview`
**Auth:** Required (college_admin)

**Response:**
```json
{
  "college": {
    "college_id": "uuid",
    "name": "MIT",
    "verified": true,
    "location": {
      "city": "Cambridge",
      "state": "MA"
    }
  },
  "stats": {
    "total_students": 150,
    "total_assessments": 12
  }
}
```

### Get College Students
**GET** `/college/students?year=2027&page=1&limit=50`
**Auth:** Required (college_admin)

### Create Assessment
**POST** `/college/assessments`
**Auth:** Required (college_admin)

**Body:**
```json
{
  "name": "Mid-Term Exam",
  "description": "Data Structures",
  "max_marks": 100,
  "weightage": 20
}
```

### Upload Assessment Scores
**POST** `/college/assessments/:id/scores`
**Auth:** Required (college_admin)

**Body:**
```json
{
  "scores": [
    {
      "student_email": "student1@example.com",
      "marks_obtained": 85,
      "remarks": "Good"
    },
    {
      "student_email": "student2@example.com",
      "marks_obtained": 92
    }
  ]
}
```

### Calculate College Scores
**POST** `/college/calculate-scores`
**Auth:** Required (college_admin)

Recalculates college engineer scores for all students based on assessments.

---

## 👑 Admin Endpoints

### Get Platform Stats
**GET** `/admin/stats`
**Auth:** Required (super_admin)

**Response:**
```json
{
  "stats": {
    "total_students": 5000,
    "total_colleges": 150,
    "verified_colleges": 120,
    "total_college_admins": 150,
    "pending_admins": 10
  }
}
```

### Get Pending Admins
**GET** `/admin/pending-admins`
**Auth:** Required (super_admin)

### Approve College Admin
**POST** `/admin/approve-admin/:id`
**Auth:** Required (super_admin)

### Get All Colleges
**GET** `/admin/colleges`
**Auth:** Required (super_admin)

### Verify College
**POST** `/admin/verify-college/:id`
**Auth:** Required (super_admin)

### Rename College
**PUT** `/admin/colleges/:id`
**Auth:** Required (super_admin)

**Body:**
```json
{
  "name_display": "Massachusetts Institute of Technology"
}
```

### Get All Students
**GET** `/admin/students?college_id=uuid&year=2027&page=1`
**Auth:** Required (super_admin)

---

## 🔢 Global Engineer Score Calculation

The score is calculated automatically when student ratings are updated:

```javascript
EngineerScore = (
  sqrt((CF - 800) / 2700) * 0.40 +
  sqrt((LC - 1400) / 1100) * 0.35 +
  sqrt((CC - 1200) / 1800) * 0.25
) * 1000
```

Where:
- CF = Codeforces rating (clamped to 800-3500)
- LC = LeetCode rating (clamped to 1400-2500)
- CC = CodeChef rating (clamped to 1200-3000)

All normalized values clamped between 0 and 1.

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Server error message"
}
```

---

## 📝 Notes

1. All timestamps are in ISO 8601 format
2. Pagination uses 1-based indexing
3. College identification always uses `college_id` (UUID), never names
4. Student cannot change their college directly (admin only)
5. College Engineer Score can be null if no assessments exist
6. Platform usernames are optional but recommended for accurate scoring
