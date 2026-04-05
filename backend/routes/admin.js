const express = require('express');
const User = require('../models/User');
const College = require('../models/College');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

async function buildCollegeAdminSummary(collegeIds) {
  const collegeAdmins = await User.find({
    role: 'college_admin',
    managed_college_id: { $in: collegeIds }
  }).select('managed_college_id approved name email');

  const summaryMap = {};

  collegeAdmins.forEach((admin) => {
    const collegeId = admin.managed_college_id;

    if (!summaryMap[collegeId]) {
      summaryMap[collegeId] = {
        total_admins: 0,
        approved_admins: 0,
        pending_admins: 0,
        latest_admin: null,
        latest_approved_admin: null,
        has_approved_admin: false
      };
    }

    summaryMap[collegeId].total_admins += 1;
    summaryMap[collegeId].latest_admin = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      approved: admin.approved
    };

    if (admin.approved) {
      summaryMap[collegeId].approved_admins += 1;
      summaryMap[collegeId].has_approved_admin = true;
      summaryMap[collegeId].latest_approved_admin = {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        approved: admin.approved
      };
    } else {
      summaryMap[collegeId].pending_admins += 1;
    }
  });

  return summaryMap;
}

function getDefaultAdminSummary() {
  return {
    total_admins: 0,
    approved_admins: 0,
    pending_admins: 0,
    latest_admin: null,
    latest_approved_admin: null,
    has_approved_admin: false
  };
}

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

    const college = await College.findOne({ college_id: admin.managed_college_id });
    if (!college) {
      return res.status(404).json({ error: 'College not found for this admin' });
    }
    
    admin.approved = true;
    college.verified = true;

    await Promise.all([admin.save(), college.save()]);
    
    res.json({
      message: 'College admin approved and college marked as verified',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        approved: admin.approved
      },
      college: {
        college_id: college.college_id,
        name_display: college.name_display,
        verified: college.verified
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
    const collegeIds = colleges.map((college) => college.college_id);
    const adminSummaryMap = await buildCollegeAdminSummary(collegeIds);

    const enrichedColleges = colleges.map((college) => ({
      ...college.toObject(),
      verified: Boolean((adminSummaryMap[college.college_id] || getDefaultAdminSummary()).has_approved_admin),
      admin_summary: adminSummaryMap[college.college_id] || getDefaultAdminSummary()
    }));

    res.json({ colleges: enrichedColleges });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

// Revoke college admin access for a college
router.post('/deny-college-access/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const college = await College.findOne({ college_id: req.params.id });

    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    const updateResult = await User.updateMany(
      { role: 'college_admin', managed_college_id: req.params.id, approved: true },
      { $set: { approved: false } }
    );

    college.verified = false;
    await college.save();

    res.json({
      message: 'College admin access denied and college marked as unverified',
      college: {
        college_id: college.college_id,
        name_display: college.name_display,
        verified: college.verified
      },
      admins_revoked: updateResult.modifiedCount || 0
    });
  } catch (error) {
    console.error('Deny college access error:', error);
    res.status(500).json({ error: 'Failed to deny college access' });
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
    const totalCollegeAdmins = await User.countDocuments({ role: 'college_admin' });
    const pendingAdmins = await User.countDocuments({ role: 'college_admin', approved: false });
    const verifiedCollegeIds = await User.distinct('managed_college_id', {
      role: 'college_admin',
      approved: true
    });
    const verifiedColleges = verifiedCollegeIds.length;
    
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
