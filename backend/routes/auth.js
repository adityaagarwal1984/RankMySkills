const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
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

module.exports = router;
