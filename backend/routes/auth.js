const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/User');

const College = require('../models/College');
const CollegeAdminRequest = require('../models/CollegeAdminRequest');

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

const generateInviteCode = () => {
  return `RMS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

// --- Authentication Helper Functions ---

// Generate Access and Refresh Tokens
const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 60); // 60 days

  // Add key to user's refreshTokens array
  user.refreshTokens.push({ token: refreshToken, expiresAt });
  
  // Clean up expired tokens
  user.refreshTokens = user.refreshTokens.filter(t => t.expiresAt > new Date());
  
  await user.save();

  return { accessToken, refreshToken };
};

// Set Cookies
const setCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction, // true in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' requires secure: true
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 60 * 24 * 60 * 60 * 1000 // 60 days
  });
};

// Register Student
router.post('/register/student', async (req, res) => {
  try {
    const { email, password, name, college_name, graduation_year, course } = req.body;
    
    // Validate required fields
    if (!email || !password || !name || !college_name || !graduation_year || !course) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Normalize and find/create college
    const normalizedName = College.normalizeCollegeName(college_name);
    let college = await College.findOne({ name_key: normalizedName });
    
    if (!college) {
      // Create new college (unverified)
      college = new College({
        name_display: college_name,
        name_key: normalizedName,
        admin_email: 'pending@example.com',
        verified: false
      });
      await college.save();
    }
    
    // Create student user
    const user = new User({
      email,
      password,
      name,
      role: 'student',
      college_id: college.college_id,
      graduation_year,
      course
    });
    
    // Calculate initial engineer score
    user.calculateGlobalEngineerScore();
    await user.save();
    
    // Generate tokens and set cookies
    const { accessToken, refreshToken } = await generateTokens(user);
    setCookies(res, accessToken, refreshToken);
    
    res.status(201).json({
      message: 'Student registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        college_id: user.college_id
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Register College Admin
router.post('/register/college', async (req, res) => {
  try {
    const { email, password, name, college_id, college_name, city, state, invite_code } = req.body;
    
    if (!email || !password || !name || (!college_id && !college_name) || !invite_code) {
      return res.status(400).json({ error: 'Name, email, password, college, and invite code are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    let college = null;

    // Preferred flow for dropdown-based registration: submit selected college_id
    if (college_id) {
      college = await College.findOne({ college_id });

      if (!college) {
        return res.status(404).json({ error: 'Selected college not found' });
      }
    } else {
      // Backward-compatible fallback for older forms that still send college_name
      const normalizedName = College.normalizeCollegeName(college_name);
      college = await College.findOne({ name_key: normalizedName });
      
      if (!college) {
        college = new College({
          name_display: college_name,
          name_key: normalizedName,
          admin_email: email,
          verified: false,
          location: { city, state }
        });
        await college.save();
      }
    }

    const existingApprovedAdmin = await User.findOne({
      role: 'college_admin',
      managed_college_id: college.college_id,
      approved: true
    });
    if (existingApprovedAdmin) {
      return res.status(409).json({ error: 'College admin access already granted for this college' });
    }

    const request = await CollegeAdminRequest.findOne({
      email: email.toLowerCase(),
      college_id: college.college_id,
      invite_code,
      status: 'approved'
    });

    if (!request) {
      return res.status(403).json({ error: 'Invalid invite code for this college or email' });
    }

    if (!college.admin_email || college.admin_email === 'pending@example.com') {
      college.admin_email = email;
    }

    if ((!college.location?.city && city) || (!college.location?.state && state)) {
      college.location = {
        city: college.location?.city || city,
        state: college.location?.state || state,
        country: college.location?.country || 'India'
      };
    }

    if (college.isModified()) {
      await college.save();
    }
    
    // Create college admin (pending approval)
    const user = new User({
      email,
      password,
      name,
      role: 'college_admin',
      managed_college_id: college.college_id,
      approved: true,
      designation: request.designation,
      phone: request.phone
    });
    
    await user.save();

    request.status = 'used';
    request.used_at = new Date();
    await request.save();
    
    const { accessToken, refreshToken } = await generateTokens(user);
    setCookies(res, accessToken, refreshToken);
    
    res.status(201).json({
      message: 'College admin registered successfully.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        approved: user.approved
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Request College Admin Access (public)
router.post('/request-college-admin', async (req, res) => {
  try {
    const { name, email, college_id, designation, phone, message } = req.body;

    if (!name || !email || !college_id || !designation || !phone) {
      return res.status(400).json({ error: 'Name, email, college, designation, and phone are required' });
    }

    const college = await College.findOne({ college_id });
    if (!college) {
      return res.status(404).json({ error: 'Selected college not found' });
    }

    const existingApprovedAdmin = await User.findOne({
      role: 'college_admin',
      managed_college_id: college_id,
      approved: true
    });
    if (existingApprovedAdmin) {
      return res.status(409).json({ error: 'College admin access already granted for this college' });
    }

    const existingPending = await CollegeAdminRequest.findOne({
      email: email.toLowerCase(),
      college_id,
      status: 'pending'
    });
    if (existingPending) {
      return res.status(409).json({ error: 'You already have a pending request for this college' });
    }

    const invite_code = generateInviteCode();

    const request = await CollegeAdminRequest.create({
      name,
      email: email.toLowerCase(),
      college_id,
      college_name: college.name_display,
      designation,
      phone,
      message: message || '',
      invite_code
    });

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.EMAIL_USER;

    if (superAdminEmail) {
      await sendEmail({
        toEmail: superAdminEmail,
        toName: 'Super Admin',
        subject: 'New College Admin Access Request',
        htmlContent: `
          <html>
          <body>
            <h2>New College Admin Request</h2>
            <p><strong>Name:</strong> ${request.name}</p>
            <p><strong>Email:</strong> ${request.email}</p>
            <p><strong>College:</strong> ${request.college_name}</p>
            <p><strong>Designation:</strong> ${request.designation}</p>
            <p><strong>Phone:</strong> ${request.phone}</p>
            <p><strong>Message:</strong> ${request.message || 'NA'}</p>
            <p><strong>Invite Code:</strong> ${request.invite_code}</p>
            <p>Review this request in the admin dashboard to approve or deny.</p>
          </body>
          </html>
        `
      });
    }

    res.status(201).json({
      message: 'Request submitted successfully. You will receive an invite code after approval.',
      request_id: request._id
    });
  } catch (error) {
    console.error('Request college admin error:', error);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check approval for college admin
    if (user.role === 'college_admin' && !user.approved) {
      return res.status(403).json({ error: 'Account pending approval' });
    }
    
    // Generate tokens and set cookies
    const { accessToken, refreshToken } = await generateTokens(user);
    setCookies(res, accessToken, refreshToken);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        college_id: user.college_id || user.managed_college_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh Token Endpoint
router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }
    
    // Find user with this refresh token
    const user = await User.findOne({
      'refreshTokens.token': refreshToken,
      'refreshTokens.expiresAt': { $gt: new Date() }
    });
    
    if (!user) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Remove the old refresh token (Token Rotation) 
    // or keep it? Requirement says "Used only to issue a new access token".
    // "Store refresh tokens in database for revocation".
    // Secure approach: Remove used token, issue new one.
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
    
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);
    setCookies(res, accessToken, newRefreshToken);
    
    res.json({ message: 'Token refreshed' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      // Create unique index ensures email unique, but here we update by finding token? 
      // Better to find by token directly in array
      await User.updateOne(
        { 'refreshTokens.token': refreshToken },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }
    
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Forgot Password - Send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If the email exists, a password reset link has been sent' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log('Reset Password requested for:', email);
    console.log('Using Frontend URL:', frontendUrl);
    
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    // Send email using Brevo (Sendinblue)
    console.log('Sending reset email via Brevo...');

    const emailResponse = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'RankMySkills', email: process.env.EMAIL_USER || 'no-reply@rankmyskills.com' },
        to: [{ email: user.email, name: user.name }],
        subject: 'Password Reset - RankMySkills',
        htmlContent: `
          <html>
          <body>
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>You requested a password reset for your account.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>RankMySkills Team</p>
          </body>
          </html>
        `
      },
      {
        headers: {
          'api-key': process.env.BREVO_API,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Reset email sent successfully:', emailResponse.data);
    
    res.json({ message: 'If the email exists, a password reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    // Update password and clear reset token
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    
    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get all colleges (public endpoint for registration)
router.get('/colleges', async (req, res) => {
  try {
    const colleges = await College.find().sort('name_display').select('college_id name_display');
    const approvedCollegeIds = await User.distinct('managed_college_id', {
      role: 'college_admin',
      approved: true
    });
    const approvedSet = new Set(approvedCollegeIds);

    const enriched = colleges.map((college) => ({
      college_id: college.college_id,
      name_display: college.name_display,
      has_approved_admin: approvedSet.has(college.college_id)
    }));

    res.json({ colleges: enriched });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

module.exports = router;
