const express = require('express');
const User = require('../models/User');
const College = require('../models/College');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all pending college admins
router.get('/pending-admins', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const pendingAdmins = await User.find({
      role: 'college_admin',
      approved: false
    }).select('-password');
    
    // Get college info
    const collegeIds = pendingAdmins.map(a => a.managed_college_id);
    const colleges = await College.find({ college_id: { $in: collegeIds } });
    const collegeMap = {};
    colleges.forEach(c => {
      collegeMap[c.college_id] = c;
    });
    
    const adminsWithColleges = pendingAdmins.map(admin => ({
      ...admin.toObject(),
      college: collegeMap[admin.managed_college_id]
    }));
    
    res.json({ admins: adminsWithColleges });
  } catch (error) {
    console.error('Get pending admins error:', error);
    res.status(500).json({ error: 'Failed to fetch pending admins' });
  }
});

// Approve college admin
router.post('/approve-admin/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    
    if (!admin || admin.role !== 'college_admin') {
      return res.status(404).json({ error: 'College admin not found' });
    }
    
    admin.approved = true;
    await admin.save();
    
    res.json({
      message: 'College admin approved',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        approved: admin.approved
      }
    });
  } catch (error) {
    console.error('Approve admin error:', error);
    res.status(500).json({ error: 'Failed to approve admin' });
  }
});

// Get all colleges
router.get('/colleges', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const colleges = await College.find().sort('name_display');
    res.json({ colleges });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

// Verify college
router.post('/verify-college/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const college = await College.findOne({ college_id: req.params.id });
    
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    college.verified = true;
    await college.save();
    
    res.json({
      message: 'College verified',
      college
    });
  } catch (error) {
    console.error('Verify college error:', error);
    res.status(500).json({ error: 'Failed to verify college' });
  }
});

// Rename college
router.put('/colleges/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { name_display } = req.body;
    
    if (!name_display) {
      return res.status(400).json({ error: 'College name required' });
    }
    
    const college = await College.findOne({ college_id: req.params.id });
    
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    college.name_display = name_display;
    // name_key will be updated by pre-save hook
    await college.save();
    
    res.json({
      message: 'College renamed',
      college
    });
  } catch (error) {
    console.error('Rename college error:', error);
    res.status(500).json({ error: 'Failed to rename college' });
  }
});

// Get platform statistics
router.get('/stats', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalColleges = await College.countDocuments();
    const verifiedColleges = await College.countDocuments({ verified: true });
    const totalCollegeAdmins = await User.countDocuments({ role: 'college_admin' });
    const pendingAdmins = await User.countDocuments({ role: 'college_admin', approved: false });
    
    res.json({
      stats: {
        total_students: totalStudents,
        total_colleges: totalColleges,
        verified_colleges: verifiedColleges,
        total_college_admins: totalCollegeAdmins,
        pending_admins: pendingAdmins
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all students (with filters)
router.get('/students', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { college_id, year, page = 1, limit = 50 } = req.query;
    
    const filter = { role: 'student' };
    
    if (college_id) {
      filter.college_id = college_id;
    }
    
    if (year && year !== 'all') {
      filter.graduation_year = parseInt(year);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const students = await User.find(filter)
      .select('name email college_id graduation_year course global_engineer_score college_engineer_score')
      .sort('-global_engineer_score')
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      students,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

module.exports = router;
