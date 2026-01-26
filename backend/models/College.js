const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const collegeSchema = new mongoose.Schema({
  college_id: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    required: true
  },
  name_display: {
    type: String,
    required: true,
    trim: true
  },
  name_key: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  location: {
    city: String,
    state: String,
    country: { type: String, default: 'India' }
  },
  admin_email: {
    type: String,
    required: true
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

// CRITICAL: Enforce unique index on name_key
collegeSchema.index({ name_key: 1 }, { unique: true });

// Helper function to normalize college name
collegeSchema.statics.normalizeCollegeName = function(name) {
  return name
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
};

// Pre-save hook to set name_key
collegeSchema.pre('save', function(next) {
  if (this.isModified('name_display')) {
    this.name_key = this.constructor.normalizeCollegeName(this.name_display);
  }
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('College', collegeSchema);
