const mongoose = require('mongoose');

const assessmentScoreSchema = new mongoose.Schema({
  assessment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  marks_obtained: {
    type: Number,
    required: true,
    min: 0
  },
  remarks: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

assessmentScoreSchema.index({ assessment_id: 1, student_id: 1 }, { unique: true });
assessmentScoreSchema.index({ student_id: 1 });

module.exports = mongoose.model('AssessmentScore', assessmentScoreSchema);
