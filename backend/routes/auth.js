const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const User = require('../models/User');

const resend = new Resend(process.env.RESEND_API);
const College = require('../models/College');

const router = express.Router();

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
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Student registered successfully',
      token,
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
    const { email, password, name, college_name, city, state } = req.body;
    
    if (!email || !password || !name || !college_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Normalize and find/create college
    const normalizedName = College.normalizeCollegeName(college_name);
    let college = await College.findOne({ name_key: normalizedName });
    
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
    
    // Create college admin (pending approval)
    const user = new User({
      email,
      password,
      name,
      role: 'college_admin',
      managed_college_id: college.college_id,
      approved: false
    });
    
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'College admin registered. Awaiting approval.',
      token,
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
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
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
    
    // Send email using Resend
    console.log('Sending reset email via Resend...');

    const { data, error } = await resend.emails.send({
      from: 'RankMySkills <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Password Reset - RankMySkills',
      html: `
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
      `
    });

    if (error) {
      console.error('Resend Error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    console.log('Reset email sent successfully:', data);
    
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
    res.json({ colleges });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

module.exports = router;
