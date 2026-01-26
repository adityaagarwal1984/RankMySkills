const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const College = require('../models/College');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile-photos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

// Get student profile
router.get('/profile', authenticate, authorize('student'), async (req, res) => {
  try {
    const student = await User.findById(req.userId).select('-password');
    const college = await College.findOne({ college_id: student.college_id });
    
    res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        profile_photo: student.profile_photo,
        college: {
          college_id: college.college_id,
          name: college.name_display,
          verified: college.verified
        },
        graduation_year: student.graduation_year,
        course: student.course,
        platforms: student.platforms,
        ratings: student.ratings,
        problems_solved: student.problems_solved,
        global_engineer_score: student.global_engineer_score,
        college_engineer_score: student.college_engineer_score
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Upload profile photo
router.post('/upload-photo', authenticate, authorize('student'), upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
    
    // Update user's profile photo
    await User.findByIdAndUpdate(req.userId, {
      profile_photo: photoUrl
    });
    
    res.json({
      message: 'Photo uploaded successfully',
      photoUrl
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload photo' });
  }
});

// Update student profile
router.put('/profile', authenticate, authorize('student'), async (req, res) => {
  try {
    const { name, course, graduation_year, platforms, profile_photo } = req.body;
    
    const updates = {};
    if (name) updates.name = name;
    if (course) updates.course = course;
    if (graduation_year) updates.graduation_year = graduation_year;
    if (profile_photo) updates.profile_photo = profile_photo;
    if (platforms) updates.platforms = platforms;
    
    const student = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    ).select('-password');
    
    res.json({
      message: 'Profile updated successfully',
      student
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get student rankings
router.get('/rankings', authenticate, authorize('student'), async (req, res) => {
  try {
    const student = await User.findById(req.userId);
    
    // Global rank (all students)
    const globalRank = await User.countDocuments({
      role: 'student',
      global_engineer_score: { $gt: student.global_engineer_score }
    }) + 1;
    const totalGlobal = await User.countDocuments({ role: 'student' });
    
    // Global rank (same year)
    const globalRankYear = await User.countDocuments({
      role: 'student',
      graduation_year: student.graduation_year,
      global_engineer_score: { $gt: student.global_engineer_score }
    }) + 1;
    const totalGlobalYear = await User.countDocuments({
      role: 'student',
      graduation_year: student.graduation_year
    });
    
    // College rank (all years)
    const collegeRank = await User.countDocuments({
      role: 'student',
      college_id: student.college_id,
      college_engineer_score: { $gt: student.college_engineer_score }
    }) + 1;
    const totalCollege = await User.countDocuments({
      role: 'student',
      college_id: student.college_id
    });
    
    // College rank (same year)
    const collegeRankYear = await User.countDocuments({
      role: 'student',
      college_id: student.college_id,
      graduation_year: student.graduation_year,
      college_engineer_score: { $gt: student.college_engineer_score }
    }) + 1;
    const totalCollegeYear = await User.countDocuments({
      role: 'student',
      college_id: student.college_id,
      graduation_year: student.graduation_year
    });
    
    res.json({
      rankings: {
        global: {
          rank: globalRank,
          total: totalGlobal,
          score_type: 'Global Engineer Score'
        },
        global_year: {
          rank: globalRankYear,
          total: totalGlobalYear,
          year: student.graduation_year,
          score_type: 'Global Engineer Score'
        },
        college: {
          rank: collegeRank,
          total: totalCollege,
          score_type: 'College Engineer Score'
        },
        college_year: {
          rank: collegeRankYear,
          total: totalCollegeYear,
          year: student.graduation_year,
          score_type: 'College Engineer Score'
        }
      }
    });
  } catch (error) {
    console.error('Get rankings error:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

// Update platform ratings (admin use or cron job)
router.post('/update-ratings', authenticate, authorize('student'), async (req, res) => {
  try {
    const { ratings, problems_solved } = req.body;
    
    const student = await User.findById(req.userId);
    
    if (ratings) {
      student.ratings = { ...student.ratings, ...ratings };
    }
    
    if (problems_solved) {
      student.problems_solved = { ...student.problems_solved, ...problems_solved };
    }
    
    // Recalculate engineer score
    student.calculateGlobalEngineerScore();
    await student.save();
    
    res.json({
      message: 'Ratings updated successfully',
      global_engineer_score: student.global_engineer_score
    });
  } catch (error) {
    console.error('Update ratings error:', error);
    res.status(500).json({ error: 'Failed to update ratings' });
  }
});

module.exports = router;
