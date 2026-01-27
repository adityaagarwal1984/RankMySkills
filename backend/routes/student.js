const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const College = require('../models/College');
const { authenticate, authorize } = require('../middleware/auth');
const platformService = require('../services/platformService');

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
        max_ratings: student.max_ratings,
        problems_solved: student.problems_solved,
        gfg_coding_score: student.gfg_coding_score,
        gfg_institute_rank: student.gfg_institute_rank,
        gfg_institute_name: student.gfg_institute_name,
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

// Sync platform data from external sources
router.post('/sync-platforms', authenticate, authorize('student'), async (req, res) => {
  try {
    const student = await User.findById(req.userId);
    
    if (!student.platforms || 
        (!student.platforms.leetcode && !student.platforms.codeforces && 
         !student.platforms.codechef && !student.platforms.gfg)) {
      return res.status(400).json({ 
        error: 'No platform usernames configured. Please add your usernames first.' 
      });
    }

    // Fetch data from all configured platforms
    const platformData = await platformService.fetchAllPlatformData(student.platforms);

    let updatedCount = 0;
    const results = {};

    // Update LeetCode data
    if (platformData.leetcode?.success) {
      student.ratings.leetcode = platformData.leetcode.rating;
      student.max_ratings.leetcode = platformData.leetcode.maxRating;
      student.problems_solved.leetcode = platformData.leetcode.problemsSolved;
      results.leetcode = { 
        success: true, 
        rating: platformData.leetcode.rating,
        maxRating: platformData.leetcode.maxRating,
        problems: platformData.leetcode.problemsSolved
      };
      updatedCount++;
    } else if (platformData.leetcode) {
      results.leetcode = { success: false, error: platformData.leetcode.error };
    }

    // Update Codeforces data
    if (platformData.codeforces?.success) {
      student.ratings.codeforces = platformData.codeforces.rating;
      student.max_ratings.codeforces = platformData.codeforces.maxRating;
      student.problems_solved.codeforces = platformData.codeforces.problemsSolved;
      results.codeforces = { 
        success: true, 
        rating: platformData.codeforces.rating,
        maxRating: platformData.codeforces.maxRating,
        problems: platformData.codeforces.problemsSolved
      };
      updatedCount++;
    } else if (platformData.codeforces) {
      results.codeforces = { success: false, error: platformData.codeforces.error };
    }

    // Update CodeChef data
    if (platformData.codechef?.success) {
      student.ratings.codechef = platformData.codechef.rating;
      student.max_ratings.codechef = platformData.codechef.maxRating;
      student.problems_solved.codechef = platformData.codechef.problemsSolved;
      results.codechef = { 
        success: true, 
        rating: platformData.codechef.rating,
        maxRating: platformData.codechef.maxRating,
        problems: platformData.codechef.problemsSolved
      };
      updatedCount++;
    } else if (platformData.codechef) {
      results.codechef = { success: false, error: platformData.codechef.error };
    }

    // Update GeeksForGeeks data
    if (platformData.gfg?.success) {
      student.problems_solved.gfg = platformData.gfg.problemsSolved;
      student.gfg_coding_score = platformData.gfg.codingScore;
      student.gfg_institute_rank = platformData.gfg.instituteRank;
      student.gfg_institute_name = platformData.gfg.instituteName;
      results.gfg = { 
        success: true, 
        problems: platformData.gfg.problemsSolved,
        codingScore: platformData.gfg.codingScore,
        instituteRank: platformData.gfg.instituteRank,
        instituteName: platformData.gfg.instituteName
      };
      updatedCount++;
    } else if (platformData.gfg) {
      results.gfg = { success: false, error: platformData.gfg.error };
    }

    if (updatedCount > 0) {
      // Recalculate global engineer score
      student.calculateGlobalEngineerScore();
      await student.save();

      res.json({
        message: `Successfully synced ${updatedCount} platform(s)`,
        global_engineer_score: student.global_engineer_score,
        ratings: student.ratings,
        max_coding_score: student.gfg_coding_score,
        gfg_ratings: student.max_ratings,
        problems_solved: student.problems_solved,
        gfg_institute_rank: student.gfg_institute_rank,
        results
      });
    } else {
      res.status(400).json({
        error: 'Failed to sync any platforms. Please check your usernames.',
        results
      });
    }
  } catch (error) {
    console.error('Sync platforms error:', error);
    res.status(500).json({ error: 'Failed to sync platform data' });
  }
});

module.exports = router;
