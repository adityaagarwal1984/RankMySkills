require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const platformService = require('./services/platformService');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const collegeRoutes = require('./routes/college');
const adminRoutes = require('./routes/admin');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();

// Middleware
app.use(cors());
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

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');

  // Auto-sync scheduler (Running in background)
  const runAutoSync = async () => {
    console.log('🔄 Starting daily platform auto-sync...');
    try {
      // Find students who haven't synced in 24h or never synced
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
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

  // Run auto-sync every 24 hours
  setInterval(runAutoSync, 24 * 60 * 60 * 1000);
  
  // Also run once shortly after startup
  setTimeout(runAutoSync, 60 * 1000); 
  
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
