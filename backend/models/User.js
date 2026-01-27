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
  
  // Platform ratings (current ratings, updated by system)
  ratings: {
    leetcode: { type: Number, default: 1500 },
    codeforces: { type: Number, default: 0 },
    codechef: { type: Number, default: 0 }
  },
  
  // Platform max ratings (highest ratings achieved)
  max_ratings: {
    leetcode: { type: Number, default: 1500 },
    codeforces: { type: Number, default: 0 },
    codechef: { type: Number, default: 0 }
  },
  
  // Problem counts
  problems_solved: {
    leetcode: { type: Number, default: 0 },
    codeforces: { type: Number, default: 0 },
    codechef: { type: Number, default: 0 },
    gfg: { type: Number, default: 0 }
  },
  
  // GeeksForGeeks specific data
  gfg_coding_score: {
    type: Number,
    default: null
  },
  gfg_institute_rank: {
    type: Number,
    default: null
  },
  gfg_institute_name: {
    type: String,
    default: null
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
// Formula: (0.35 * sqrt(clamp((CF - 800) / 2700, 0, 1)) + 
//           0.30 * sqrt(clamp((LC - 1400) / 1100, 0, 1)) + 
//           0.25 * sqrt(clamp((CC - 1200) / 1800, 0, 1)) + 
//           0.10 * sqrt(clamp(TotalSolved / 2000, 0, 1))) * 1000
userSchema.methods.calculateGlobalEngineerScore = function() {
  // Use actual ratings with proper defaults
  const cf = this.ratings.codeforces || 0;
  const lc = this.ratings.leetcode || 1500;
  const cc = this.ratings.codechef || 0;
  
  // Calculate total problems solved across all platforms
  const totalSolved = (this.problems_solved.leetcode || 0) + 
                      (this.problems_solved.codeforces || 0) + 
                      (this.problems_solved.codechef || 0);
  
  // Clamp and normalize each component
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  
  const cfNormalized = clamp((cf - 800) / 2700, 0, 1);
  const lcNormalized = clamp((lc - 1400) / 1100, 0, 1);
  const ccNormalized = clamp((cc - 1200) / 1800, 0, 1);
  const totalNormalized = clamp(totalSolved / 2000, 0, 1);
  
  // Apply square root and weighted sum
  this.global_engineer_score = Math.round(
    (0.35 * Math.sqrt(cfNormalized) + 
     0.30 * Math.sqrt(lcNormalized) + 
     0.25 * Math.sqrt(ccNormalized) + 
     0.10 * Math.sqrt(totalNormalized)) * 1000
  );
  
  return this.global_engineer_score;
};

module.exports = mongoose.model('User', userSchema);
