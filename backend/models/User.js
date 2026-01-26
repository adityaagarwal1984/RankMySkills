const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'college_admin', 'super_admin'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  profile_photo: {
    type: String,
    default: null
  },
  
  // Student-specific fields
  college_id: {
    type: String,
    ref: 'College',
    required: function() { return this.role === 'student'; }
  },
  graduation_year: {
    type: Number,
    required: function() { return this.role === 'student'; }
  },
  course: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  
  // Platform usernames
  platforms: {
    leetcode: { type: String, default: null },
    codeforces: { type: String, default: null },
    codechef: { type: String, default: null },
    gfg: { type: String, default: null }
  },
  
  // Platform ratings (updated by system)
  ratings: {
    leetcode: { type: Number, default: 1400 },
    codeforces: { type: Number, default: 800 },
    codechef: { type: Number, default: 1200 }
  },
  
  // Problem counts
  problems_solved: {
    leetcode: { type: Number, default: 0 },
    codeforces: { type: Number, default: 0 },
    codechef: { type: Number, default: 0 },
    gfg: { type: Number, default: 0 }
  },
  
  // Engineer Scores
  global_engineer_score: {
    type: Number,
    default: 0
  },
  college_engineer_score: {
    type: Number,
    default: null
  },
  
  // College admin specific
  managed_college_id: {
    type: String,
    ref: 'College',
    required: function() { return this.role === 'college_admin'; }
  },
  approved: {
    type: Boolean,
    default: function() { return this.role !== 'college_admin'; }
  },
  
  // Password reset fields
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updated_at = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate Global Engineer Score
userSchema.methods.calculateGlobalEngineerScore = function() {
  const cf = Math.max(800, Math.min(3500, this.ratings.codeforces));
  const lc = Math.max(1400, Math.min(2500, this.ratings.leetcode));
  const cc = Math.max(1200, Math.min(3000, this.ratings.codechef));
  
  const cfNorm = Math.sqrt((cf - 800) / 2700);
  const lcNorm = Math.sqrt((lc - 1400) / 1100);
  const ccNorm = Math.sqrt((cc - 1200) / 1800);
  
  // Clamp between 0 and 1
  const cfClamped = Math.max(0, Math.min(1, cfNorm));
  const lcClamped = Math.max(0, Math.min(1, lcNorm));
  const ccClamped = Math.max(0, Math.min(1, ccNorm));
  
  this.global_engineer_score = Math.round(
    (cfClamped * 0.40 + lcClamped * 0.35 + ccClamped * 0.25) * 1000
  );
  
  return this.global_engineer_score;
};

module.exports = mongoose.model('User', userSchema);
