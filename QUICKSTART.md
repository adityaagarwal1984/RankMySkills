# TalentTrack - Quick Start Guide

## Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (or local MongoDB)
- Git (optional)

## Step-by-Step Setup

### 1️⃣ Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
# Copy .env.example to .env and fill in your MongoDB URI
copy .env.example .env

# Edit .env file with your details:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/talenttrack
# JWT_SECRET=your-random-secret-key-here
# PORT=5000

# Start the server
npm run dev
```

✅ Backend should be running on http://localhost:5000

### 2️⃣ Student Dashboard Setup (3 minutes)

Open a new terminal:

```bash
# Navigate to student dashboard
cd student-dashboard

# Install dependencies
npm install

# Create environment file
copy .env.example .env

# Edit .env (should point to backend):
# REACT_APP_API_URL=http://localhost:5000/api

# Start the app
npm start
```

✅ Student Dashboard should open at http://localhost:3000

### 3️⃣ College Dashboard Setup (Optional)

Open a new terminal:

```bash
cd college-dashboard
npm install
npm start
```

Runs on http://localhost:3001 (or next available port)

### 4️⃣ Admin Dashboard Setup (Optional)

Open a new terminal:

```bash
cd admin-dashboard
npm install
npm start
```

Runs on http://localhost:3002 (or next available port)

## 🧪 Testing the Application

### Create a Student Account

1. Go to http://localhost:3000
2. Click "Register here"
3. Fill in the form:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
   - College: MIT
   - Course: Computer Science
   - Graduation Year: 2027
4. Click "Register"

### Explore the Dashboard

After registration, you'll see:
- **Home**: Your profile and 4 ranking cards
- **Portfolio**: Connect your coding platforms
- **Global Leaderboard**: See all students
- **College Leaderboard**: See students in your college
- **Edit Profile**: Update your information

## 📝 Sample Data

To test leaderboards, you'll need multiple students. Register a few accounts with different:
- Colleges (to test college leaderboard)
- Graduation years (to test year filtering)
- Platform ratings (update via Edit Profile → manually for now)

## 🔧 Troubleshooting

### Backend won't start
- Check MongoDB URI is correct
- Ensure MongoDB Atlas allows connections from your IP
- Check port 5000 is not in use

### Frontend won't connect
- Verify backend is running on port 5000
- Check `.env` file has correct API URL
- Clear browser cache and reload

### "Cannot find module" errors
- Run `npm install` again
- Delete `node_modules` and run `npm install`

## 🎯 What to Do Next

1. **Create test accounts** - Register 5-10 students
2. **Update platform usernames** - Go to Edit Profile
3. **Test leaderboards** - Filter by year, sort by different metrics
4. **College admin** - Register via `/register` on college dashboard (needs super admin approval)
5. **Super admin** - Create directly in MongoDB or via backend script

## 📚 Key Endpoints

- Student Registration: `POST /api/auth/register/student`
- Login: `POST /api/auth/login`
- Get Profile: `GET /api/student/profile` (requires auth)
- Leaderboard: `GET /api/leaderboard?type=global&year=all&sort=engineer_score`

## 🔐 Default Test Admin

To create a super admin, you'll need to manually insert into MongoDB:

```javascript
{
  email: "admin@talenttrack.in",
  password: "hashed-password",  // Use bcrypt to hash
  role: "super_admin",
  name: "System Admin",
  approved: true
}
```

Or use the backend to register and manually change role in database.

## 🎨 Customization

- **Colors**: Edit Tailwind config in each dashboard
- **Logo**: Replace text in navbar components
- **Features**: Add new pages in `src/pages/` and routes in `App.js`

---

**Need Help?** Check README.md for detailed documentation.
