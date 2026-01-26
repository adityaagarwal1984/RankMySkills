const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  college_id: {
    type: String,
    ref: 'College',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  max_marks: {
    type: Number,
    required: true,
    min: 0
  },
  weightage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 10
  },
  assessment_date: {
    type: Date,
    default: Date.now
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

assessmentSchema.index({ college_id: 1, created_at: -1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
