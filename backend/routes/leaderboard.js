const express = require('express');
const User = require('../models/User');
const College = require('../models/College');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get leaderboard
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, year, sort, college_id, limit = 100, page = 1 } = req.query;
    
    // Build filter
    const filter = { role: 'student' };
    
    // Filter by college for college leaderboard
    if (type === 'college') {
      const cid = college_id || req.user.college_id || req.user.managed_college_id;
      if (!cid) {
        return res.status(400).json({ error: 'College ID required' });
      }
      filter.college_id = cid;
    }
    
    // Filter by graduation year
    if (year && year !== 'all') {
      filter.graduation_year = parseInt(year);
    }
    
    // Determine sort field
    let sortField = '-global_engineer_score';
    switch (sort) {
      case 'engineer_score':
        sortField = type === 'college' ? '-college_engineer_score' : '-global_engineer_score';
        break;
      case 'cf':
        sortField = '-ratings.codeforces';
        break;
      case 'lc':
        sortField = '-ratings.leetcode';
        break;
      case 'cc':
        sortField = '-ratings.codechef';
        break;
      default:
        sortField = type === 'college' ? '-college_engineer_score' : '-global_engineer_score';
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch students
    const students = await User.find(filter)
      .select('name profile_photo college_id graduation_year course global_engineer_score college_engineer_score ratings problems_solved platforms')
      .sort(sortField)
      .limit(parseInt(limit))
      .skip(skip);
    
    // Get college info
    const collegeIds = [...new Set(students.map(s => s.college_id))];
    const colleges = await College.find({ college_id: { $in: collegeIds } });
    const collegeMap = {};
    colleges.forEach(c => {
      collegeMap[c.college_id] = c.name_display;
    });
    
    // Format response
    const leaderboard = students.map((student, index) => ({
      rank: skip + index + 1,
      id: student._id,
      name: student.name,
      profile_photo: student.profile_photo,
      college: collegeMap[student.college_id] || 'Unknown',
      graduation_year: student.graduation_year,
      course: student.course,
      global_engineer_score: student.global_engineer_score,
      college_engineer_score: student.college_engineer_score,
      ratings: {
        leetcode: student.platforms?.leetcode ? (student.ratings?.leetcode || 0) : 0,
        codeforces: student.platforms?.codeforces ? (student.ratings?.codeforces || 0) : 0,
        codechef: student.platforms?.codechef ? (student.ratings?.codechef || 0) : 0
      },
      problems_solved: student.problems_solved
    }));
    
    // Get total count
    const total = await User.countDocuments(filter);
    
    res.json({
      leaderboard,
      meta: {
        type,
        year: year || 'all',
        sort,
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get available graduation years
router.get('/years', authenticate, async (req, res) => {
  try {
    const years = await User.distinct('graduation_year', { role: 'student' });
    res.json({ years: years.sort((a, b) => a - b) });
  } catch (error) {
    console.error('Get years error:', error);
    res.status(500).json({ error: 'Failed to fetch years' });
  }
});

module.exports = router;
