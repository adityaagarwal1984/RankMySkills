require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const platformService = require('./services/platformService');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const collegeRoutes = require('./routes/college');
const adminRoutes = require('./routes/admin');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const AUTO_SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins (or specify your frontend URL)
  credentials: true // Allow cookies
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'TalentTrack API is running' });
});

// Serve React SPA (student dashboard).
// This fixes deep-link refreshes like /dashboard/portfolio returning 404.
const studentBuildPath = path.join(__dirname, '..', 'student-dashboard', 'build');
const shouldServeStudentApp =
  process.env.SERVE_STUDENT_APP !== 'false' &&
  (process.env.NODE_ENV === 'production' || fs.existsSync(studentBuildPath));

if (shouldServeStudentApp && fs.existsSync(studentBuildPath)) {
  // Static assets (JS/CSS/images)
  app.use(express.static(studentBuildPath));

  // SPA fallback: anything that's not an API or uploads route should serve index.html
  app.get(/^\/(?!api\/|uploads\/).*/, (req, res) => {
    res.sendFile(path.join(studentBuildPath, 'index.html'));
  });
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');

  // Auto-sync scheduler (Running in background)
  const runAutoSync = async () => {
    console.log('🔄 Starting daily platform auto-sync...');
    try {
      // Find students who haven't synced in 24h or never synced
      const twentyFourHoursAgo = new Date(Date.now() - AUTO_SYNC_INTERVAL_MS);
      
      const students = await User.find({ 
        role: 'student',
        $or: [
          { last_synced: { $lt: twentyFourHoursAgo } },
          { last_synced: null }
        ]
      });
      
      console.log(`Found ${students.length} students needing sync.`);
      
      // Process in sequence to avoid rate limits
      for (const student of students) {
        if (student.platforms && Object.values(student.platforms).some(p => p)) {
           await platformService.syncStudentData(student);
           // Small delay between requests
           await new Promise(resolve => setTimeout(resolve, 2000)); 
        }
      }
      console.log('✅ Daily auto-sync batch completed.');
    } catch (error) {
      console.error('❌ Auto-sync error:', error);
    }
  };

  // Run once on startup so stale records are caught immediately after deploy/restart
  runAutoSync().catch((error) => {
    console.error('Initial auto-sync error:', error);
  });

  // Run auto-sync every 24 hours
  setInterval(runAutoSync, AUTO_SYNC_INTERVAL_MS);
  
  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});
