const mongoose = require('mongoose');

const collegeAdminRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  college_id: {
    type: String,
    required: true
  },
  college_name: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    default: '',
    trim: true
  },
  invite_code: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied', 'used'],
    default: 'pending'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  approved_at: {
    type: Date,
    default: null
  },
  denied_at: {
    type: Date,
    default: null
  },
  used_at: {
    type: Date,
    default: null
  }
});

collegeAdminRequestSchema.index({ email: 1, college_id: 1, status: 1 });

module.exports = mongoose.model('CollegeAdminRequest', collegeAdminRequestSchema);
