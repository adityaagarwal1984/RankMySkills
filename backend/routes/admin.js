const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const College = require('../models/College');
const CollegeAdminRequest = require('../models/CollegeAdminRequest');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const sendEmail = async ({ toEmail, toName, subject, htmlContent }) => {
  if (!process.env.BREVO_API || !process.env.EMAIL_USER) {
    console.warn('Email not configured. Skipping send:', subject);
    return;
  }

  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: { name: 'RankMySkills', email: process.env.EMAIL_USER },
      to: [{ email: toEmail, name: toName }],
      subject,
      htmlContent
    },
    {
      headers: {
        'api-key': process.env.BREVO_API,
        'Content-Type': 'application/json'
      }
    }
  );
};

async function buildCollegeAdminSummary(collegeIds) {
  const collegeAdmins = await User.find({
    role: 'college_admin',
    managed_college_id: { $in: collegeIds }
  }).select('managed_college_id approved name email designation phone');

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
      designation: admin.designation || null,
      phone: admin.phone || null,
      approved: admin.approved
    };

    if (admin.approved) {
      summaryMap[collegeId].approved_admins += 1;
      summaryMap[collegeId].has_approved_admin = true;
      summaryMap[collegeId].latest_approved_admin = {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        designation: admin.designation || null,
        phone: admin.phone || null,
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

// Get college admin access requests
router.get('/college-admin-requests', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    const requests = await CollegeAdminRequest.find({ status })
      .sort('-created_at')
      .lean();

    const collegeIds = requests.map((reqItem) => reqItem.college_id);
    const colleges = await College.find({ college_id: { $in: collegeIds } }).lean();
    const collegeMap = {};
    colleges.forEach((college) => {
      collegeMap[college.college_id] = college;
    });

    const enriched = requests.map((reqItem) => {
      const college = collegeMap[reqItem.college_id];
      const location = college?.location
        ? [college.location.city, college.location.state].filter(Boolean).join(', ')
        : '';

      return {
        ...reqItem,
        college_name: reqItem.college_name || college?.name_display || 'Unknown college',
        college_location: location || 'Not provided',
        requested_at: reqItem.created_at ? new Date(reqItem.created_at).toLocaleString() : 'NA'
      };
    });

    res.json({ requests: enriched });
  } catch (error) {
    console.error('Get college admin requests error:', error);
    res.status(500).json({ error: 'Failed to fetch college admin requests' });
  }
});

// Get verified college admins (approved + registered)
router.get('/college-admins', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const admins = await User.find({ role: 'college_admin', approved: true })
      .select('name email managed_college_id designation phone')
      .lean();

    const collegeIds = admins.map((admin) => admin.managed_college_id);
    const colleges = await College.find({ college_id: { $in: collegeIds } }).lean();
    const collegeMap = {};
    colleges.forEach((college) => {
      collegeMap[college.college_id] = college;
    });

    const requests = await CollegeAdminRequest.find({
      status: 'used',
      college_id: { $in: collegeIds }
    }).lean();
    const requestMap = {};
    requests.forEach((reqItem) => {
      requestMap[`${reqItem.email}-${reqItem.college_id}`] = reqItem;
    });

    const enriched = admins.map((admin) => {
      const college = collegeMap[admin.managed_college_id];
      const requestKey = `${admin.email}-${admin.managed_college_id}`;
      const request = requestMap[requestKey];
      const location = college?.location
        ? [college.location.city, college.location.state].filter(Boolean).join(', ')
        : '';

      return {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        designation: admin.designation || request?.designation || 'NA',
        phone: admin.phone || request?.phone || 'NA',
        college_id: admin.managed_college_id,
        college_name: college?.name_display || request?.college_name || 'Unknown college',
        college_location: location || 'Not provided'
      };
    });

    res.json({ admins: enriched });
  } catch (error) {
    console.error('Get college admins error:', error);
    res.status(500).json({ error: 'Failed to fetch college admins' });
  }
});

// Approve college admin request (sends invite code)
router.post('/college-admin-requests/:id/approve', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const request = await CollegeAdminRequest.findById(req.params.id);

    if (!request || request.status !== 'pending') {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    const college = await College.findOne({ college_id: request.college_id });
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    const existingApprovedAdmin = await User.findOne({
      role: 'college_admin',
      managed_college_id: request.college_id,
      approved: true
    });

    if (existingApprovedAdmin) {
      return res.status(409).json({ error: 'College admin access already granted for this college' });
    }

    request.status = 'approved';
    request.approved_at = new Date();
    await request.save();

    const registerUrl = process.env.COLLEGE_DASHBOARD_URL || 'https://college.rankmyskills.in/register';

    await sendEmail({
      toEmail: request.email,
      toName: request.name,
      subject: 'RankMySkills College Admin Access Approved',
      htmlContent: `
        <html>
        <body>
          <h2>Your college admin request is approved</h2>
          <p>Hi ${request.name},</p>
          <p>You can now register as a college admin using the invite code below.</p>
          <p><strong>Invite Code:</strong> ${request.invite_code}</p>
          <p>Use the link below to register:</p>
          <a href="${registerUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0f766e; color: white; text-decoration: none; border-radius: 6px;">Register as College Admin</a>
          <p>If the button does not work, open this URL:</p>
          <p>${registerUrl}</p>
          <p>Best regards,<br>RankMySkills Team</p>
        </body>
        </html>
      `
    });

    res.json({ message: 'Invite email sent to requester.' });
  } catch (error) {
    console.error('Approve college admin request error:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

// Deny college admin request (sends denial email)
router.post('/college-admin-requests/:id/deny', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const request = await CollegeAdminRequest.findById(req.params.id);

    if (!request || request.status !== 'pending') {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    request.status = 'denied';
    request.denied_at = new Date();
    await request.save();

    await sendEmail({
      toEmail: request.email,
      toName: request.name,
      subject: 'RankMySkills College Admin Request अपडेट',
      htmlContent: `
        <html>
        <body>
          <h2>College admin request update</h2>
          <p>Hi ${request.name},</p>
          <p>Thank you for your request. At this time, we are unable to approve college admin access.</p>
          <p>If this is unexpected, you may reply with additional details.</p>
          <p>Best regards,<br>RankMySkills Team</p>
        </body>
        </html>
      `
    });

    res.json({ message: 'Denial email sent to requester.' });
  } catch (error) {
    console.error('Deny college admin request error:', error);
    res.status(500).json({ error: 'Failed to deny request' });
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
