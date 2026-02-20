const express = require('express');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const User = require('../models/User');
const College = require('../models/College');
const { authenticate, authorize } = require('../middleware/auth');
const platformService = require('../services/platformService');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads (using Cloudinary)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'talenttrack/profile-photos',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    // For Cloudinary storage, checking mimetype is usually sufficient, 
    // but we can keep the extension check if desired, though filaname is handled by Cloudinary
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
        platform_verification: student.platform_verification,
        ratings: student.ratings,
        max_ratings: student.max_ratings,
        problems_solved: student.problems_solved,
        gfg_coding_score: student.gfg_coding_score,
        gfg_institute_rank: student.gfg_institute_rank,
        gfg_institute_name: student.gfg_institute_name,
        global_engineer_score: student.global_engineer_score,
        college_engineer_score: student.college_engineer_score,
        last_synced: student.last_synced
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
    
    // Cloudinary returns the absolute URL in req.file.path
    const photoUrl = req.file.path;
    
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
    
    const student = await User.findById(req.userId);
    if (!student) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (name) student.name = name;
    if (course) student.course = course;
    if (graduation_year) student.graduation_year = graduation_year;
    if (profile_photo) student.profile_photo = profile_photo;
    
    let platformChanged = false;

    if (platforms) {
      // Check for platform changes to reset verification
      const validPlatforms = ['leetcode', 'codeforces', 'codechef', 'gfg'];
      
      validPlatforms.forEach(platform => {
        // Only process if the platform is actually in the request body
        if (platforms[platform] !== undefined) {
          const oldValue = student.platforms[platform];
          const newValue = platforms[platform];
          
          // If value changed or removed
          if (newValue !== oldValue) {
            student.platforms[platform] = newValue;
            platformChanged = true;
            
            // Reset verification if username changed/removed
            // We use direct assignment to ensure mongoose detects change
            if (student.platform_verification && student.platform_verification[platform]) {
              student.platform_verification[platform].verified = false;
              student.platform_verification[platform].verification_code = null;
              student.platform_verification[platform].verified_at = null;
            }
            
            // Reset ratings/stats if removed
            if (!newValue) {
               if (student.ratings) student.ratings[platform] = 0;
               if (student.problems_solved) student.problems_solved[platform] = 0;
               if (platform === 'gfg') {
                 student.gfg_coding_score = 0;
                 student.gfg_institute_rank = 0;
               }
            }
          }
        }
      });
      
      // Explicitly mark modified to ensure updates are saved
      student.markModified('platforms');
      student.markModified('platform_verification');
      student.markModified('ratings');
      student.markModified('problems_solved');
    }

    // Recalculate score (will use 0s for unverified platforms automatically via model method)
    student.calculateGlobalEngineerScore();
    
    // Save with the changes
    const updatedStudent = await student.save();

    // Trigger immediate sync if platforms changed
    if (platformChanged) {
        // Run asynchronously, don't wait for it to reply to user
        platformService.syncStudentData(student).catch(err => 
            console.error('Background sync failed after profile update:', err)
        );
    }
    
    res.json({
      message: 'Profile updated successfully',
      student: updatedStudent
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
      $or: [
        { global_engineer_score: { $gt: student.global_engineer_score } },
        { global_engineer_score: student.global_engineer_score, _id: { $lt: student._id } }
      ]
    }) + 1;
    const totalGlobal = await User.countDocuments({ role: 'student' });
    
    // Global rank (same year)
    const globalRankYear = await User.countDocuments({
      role: 'student',
      graduation_year: student.graduation_year,
      $or: [
        { global_engineer_score: { $gt: student.global_engineer_score } },
        { global_engineer_score: student.global_engineer_score, _id: { $lt: student._id } }
      ]
    }) + 1;
    const totalGlobalYear = await User.countDocuments({
      role: 'student',
      graduation_year: student.graduation_year
    });
    
    // College rank (all years)
    const collegeRank = await User.countDocuments({
      role: 'student',
      college_id: student.college_id,
      $or: [
        { global_engineer_score: { $gt: student.global_engineer_score } },
        { global_engineer_score: student.global_engineer_score, _id: { $lt: student._id } }
      ]
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
      $or: [
        { global_engineer_score: { $gt: student.global_engineer_score } },
        { global_engineer_score: student.global_engineer_score, _id: { $lt: student._id } }
      ]
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
          score_type: 'Global Engineer Score'
        },
        college_year: {
          rank: collegeRankYear,
          total: totalCollegeYear,
          year: student.graduation_year,
          score_type: 'Global Engineer Score'
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
    
    // Cooldown check (30 minutes)
    if (student.last_synced) {
      const thirtyMinutesAgo = new Date(Date.now() - 30* 60 * 1000);
      if (student.last_synced > thirtyMinutesAgo) {
        const remainingMinutes = Math.ceil((student.last_synced.getTime() + 30* 60 * 1000 - Date.now()) / (60 * 1000));
        return res.status(429).json({ 
          error: `Sync cooldown active. Please wait ${remainingMinutes} minute(s) before syncing again.` 
        });
      }
    }

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
      student.ratings.leetcode = platformData.leetcode.rating || student.ratings.leetcode;
      student.max_ratings.leetcode = platformData.leetcode.maxRating || student.max_ratings.leetcode;
      student.problems_solved.leetcode = platformData.leetcode.problemsSolved || student.problems_solved.leetcode;
      results.leetcode = { 
        success: true, 
        rating: student.ratings.leetcode,
        maxRating: student.max_ratings.leetcode,
        problems: student.problems_solved.leetcode
      };
      updatedCount++;
    } else if (platformData.leetcode) {
      results.leetcode = { success: false, error: platformData.leetcode.error };
    }

    // Update Codeforces data
    if (platformData.codeforces?.success) {
      student.ratings.codeforces = platformData.codeforces.rating || student.ratings.codeforces;
      student.max_ratings.codeforces = platformData.codeforces.maxRating || student.max_ratings.codeforces;
      student.problems_solved.codeforces = platformData.codeforces.problemsSolved || student.problems_solved.codeforces;
      results.codeforces = { 
        success: true, 
        rating: student.ratings.codeforces,
        maxRating: student.max_ratings.codeforces,
        problems: student.problems_solved.codeforces
      };
      updatedCount++;
    } else if (platformData.codeforces) {
      results.codeforces = { success: false, error: platformData.codeforces.error };
    }

    // Update CodeChef data
    if (platformData.codechef?.success) {
      student.ratings.codechef = platformData.codechef.rating || student.ratings.codechef;
      student.max_ratings.codechef = platformData.codechef.maxRating || student.max_ratings.codechef;
      student.problems_solved.codechef = platformData.codechef.problemsSolved || student.problems_solved.codechef;
      results.codechef = { 
        success: true, 
        rating: student.ratings.codechef,
        maxRating: student.max_ratings.codechef,
        problems: student.problems_solved.codechef
      };
      updatedCount++;
    } else if (platformData.codechef) {
      results.codechef = { success: false, error: platformData.codechef.error };
    }

    // Update GeeksForGeeks data
    if (platformData.gfg?.success) {
      // Use nullish coalescing to allow 0 values
      student.problems_solved.gfg = platformData.gfg.problemsSolved ?? student.problems_solved.gfg;
      student.gfg_coding_score = platformData.gfg.codingScore ?? student.gfg_coding_score;
      student.gfg_institute_rank = platformData.gfg.instituteRank ?? student.gfg_institute_rank;
      student.gfg_institute_name = platformData.gfg.instituteName || student.gfg_institute_name;
      results.gfg = { 
        success: true, 
        problems: student.problems_solved.gfg,
        codingScore: student.gfg_coding_score,
        instituteRank: student.gfg_institute_rank,
        instituteName: student.gfg_institute_name
      };
      updatedCount++;
    } else if (platformData.gfg) {
      results.gfg = { success: false, error: platformData.gfg.error };
    }

    if (updatedCount > 0) {
      // Recalculate global engineer score
      student.calculateGlobalEngineerScore();
      student.last_synced = new Date();
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

// Generate verification code for a platform
router.post('/verify/generate', authenticate, authorize('student'), async (req, res) => {
  try {
    const { platform } = req.body;
    console.log('Generate verification code request:', { userId: req.userId, platform });
    
    const validPlatforms = ['leetcode', 'codeforces', 'codechef', 'gfg'];
    
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }
    
    const student = await User.findById(req.userId);
    
    if (!student) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if username is provided
    if (!req.body.username && !student.platforms[platform]) {
       return res.status(400).json({ error: 'Please provide username' });
    }

    const username = req.body.username || student.platforms[platform];
    
    // Generate verification code (letters only for GFG, alphanumeric for others)
    let verificationCode;
    if (platform === 'gfg') {
      // GFG only allows letters and spaces in name field
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let code = 'TT ';
      for (let i = 0; i < 6; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
      }
      verificationCode = code;
    } else {
      // Other platforms allow alphanumeric
      verificationCode = 'TT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }
    console.log('Generated code for', platform, ':', verificationCode);
    
    // Initialize platform_verification if it doesn't exist
    if (!student.platform_verification) {
      student.platform_verification = {
        leetcode: {},
        codeforces: {},
        codechef: {},
        gfg: {}
      };
    }
    if (!student.platform_verification[platform]) {
      student.platform_verification[platform] = {};
    }
    
    student.platform_verification[platform].verification_code = verificationCode;
    student.platform_verification[platform].verified = false;
    
    await student.save();
    console.log('Verification code saved successfully');
    
    res.json({ 
      verification_code: verificationCode,
      platform,
      username: username
    });
  } catch (error) {
    console.error('Generate verification code error:', error);
    res.status(500).json({ error: 'Failed to generate verification code' });
  }
});

// Verify a platform profile
router.post('/verify/check', authenticate, authorize('student'), async (req, res) => {
  try {
    const { platform, username } = req.body;
    const validPlatforms = ['leetcode', 'codeforces', 'codechef', 'gfg'];
    
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }
    
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const student = await User.findById(req.userId);
    
    if (!student.platform_verification[platform]?.verification_code) {
      return res.status(400).json({ error: 'Please generate a verification code first' });
    }
    
    const verificationCode = student.platform_verification[platform].verification_code;
    
    // Check the platform for the verification code
    let verified = false;
    
    try {
      if (platform === 'leetcode') {
        verified = await platformService.verifyLeetCodeProfile(username, verificationCode);
      } else if (platform === 'codeforces') {
        verified = await platformService.verifyCodeforcesProfile(username, verificationCode);
      } else if (platform === 'codechef') {
        verified = await platformService.verifyCodeChefProfile(username, verificationCode);
      } else if (platform === 'gfg') {
        verified = await platformService.verifyGFGProfile(username, verificationCode);
      }
    } catch (error) {
      console.error(`Error fetching ${platform} data for verification:`, error);
      return res.status(400).json({ 
        error: `Could not fetch ${platform} profile. Please make sure the code is added and try again.` 
      });
    }
    
    if (verified) {
      // Save the confirmed username and verified status
      student.platforms[platform] = username;
      student.platform_verification[platform].verified = true;
      student.platform_verification[platform].verified_at = new Date();
      
      // Calculate score immediately
      student.calculateGlobalEngineerScore();

      await student.save();
      
      // Trigger sync immediately so user sees their stats
      try {
        await platformService.syncStudentData(student);
      } catch (syncErr) {
        console.error('Post-verification sync failed:', syncErr);
      }

      res.json({ 
        success: true, 
        message: `${platform} profile verified successfully!`,
        verified: true 
      });
    } else {
      res.status(400).json({ 
        success: false,
        error: `Verification code not found in your ${platform} profile. Please make sure you added it correctly.`,
        verified: false
      });
    }
  } catch (error) {
    console.error('Verify platform error:', error);
    res.status(500).json({ error: 'Failed to verify platform' });
  }
});

// Delete a platform username
router.delete('/platform/:platform', authenticate, authorize('student'), async (req, res) => {
  try {
    const { platform } = req.params;
    const validPlatforms = ['leetcode', 'codeforces', 'codechef', 'gfg'];
    
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const student = await User.findById(req.userId);
    if (!student) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Clear platform data
    if (student.platforms) {
      student.platforms[platform] = null;
    }

    // Clear verification status
    if (student.platform_verification && student.platform_verification[platform]) {
      student.platform_verification[platform].verified = false;
      student.platform_verification[platform].verification_code = null;
      student.platform_verification[platform].verified_at = null;
    }

    // Reset ratings/stats
    if (student.ratings) student.ratings[platform] = 0;
    if (student.problems_solved) student.problems_solved[platform] = 0;
    if (platform === 'gfg') {
      student.gfg_coding_score = 0;
      student.gfg_institute_rank = 0;
    }

    // Recalculate score
    student.calculateGlobalEngineerScore();
    const updatedStudent = await student.save();

    res.json({
      message: `${platform} username removed successfully`,
      student: updatedStudent
    });

  } catch (error) {
    console.error('Delete platform error:', error);
    res.status(500).json({ error: 'Failed to delete platform username' });
  }
});

module.exports = router;
