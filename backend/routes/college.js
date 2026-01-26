const express = require('express');
const User = require('../models/User');
const College = require('../models/College');
const Assessment = require('../models/Assessment');
const AssessmentScore = require('../models/AssessmentScore');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get college overview
router.get('/overview', authenticate, authorize('college_admin'), async (req, res) => {
  try {
    const admin = await User.findById(req.userId);
    const college = await College.findOne({ college_id: admin.managed_college_id });
    
    const studentCount = await User.countDocuments({
      role: 'student',
      college_id: admin.managed_college_id
    });
    
    const assessmentCount = await Assessment.countDocuments({
      college_id: admin.managed_college_id
    });
    
    res.json({
      college: {
        college_id: college.college_id,
        name: college.name_display,
        verified: college.verified,
        location: college.location
      },
      stats: {
        total_students: studentCount,
        total_assessments: assessmentCount
      }
    });
  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// Get students in college
router.get('/students', authenticate, authorize('college_admin'), async (req, res) => {
  try {
    const admin = await User.findById(req.userId);
    const { year, page = 1, limit = 50 } = req.query;
    
    const filter = {
      role: 'student',
      college_id: admin.managed_college_id
    };
    
    if (year && year !== 'all') {
      filter.graduation_year = parseInt(year);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const students = await User.find(filter)
      .select('name email graduation_year course global_engineer_score college_engineer_score')
      .sort('-college_engineer_score')
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

// Create assessment
router.post('/assessments', authenticate, authorize('college_admin'), async (req, res) => {
  try {
    const admin = await User.findById(req.userId);
    const { name, description, max_marks, weightage } = req.body;
    
    if (!name || !max_marks || !weightage) {
      return res.status(400).json({ error: 'Name, max_marks, and weightage are required' });
    }
    
    const assessment = new Assessment({
      college_id: admin.managed_college_id,
      name,
      description,
      max_marks,
      weightage,
      created_by: req.userId
    });
    
    await assessment.save();
    
    res.status(201).json({
      message: 'Assessment created successfully',
      assessment
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Get assessments
router.get('/assessments', authenticate, authorize('college_admin'), async (req, res) => {
  try {
    const admin = await User.findById(req.userId);
    
    const assessments = await Assessment.find({
      college_id: admin.managed_college_id
    }).sort('-created_at');
    
    res.json({ assessments });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Upload assessment scores (CSV/Excel format expected as JSON array)
router.post('/assessments/:id/scores', authenticate, authorize('college_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { scores } = req.body; // Array of { student_email, marks_obtained }
    
    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const score of scores) {
      try {
        const student = await User.findOne({
          email: score.student_email,
          role: 'student',
          college_id: assessment.college_id
        });
        
        if (!student) {
          results.failed++;
          results.errors.push(`Student not found: ${score.student_email}`);
          continue;
        }
        
        await AssessmentScore.findOneAndUpdate(
          { assessment_id: id, student_id: student._id },
          {
            marks_obtained: score.marks_obtained,
            remarks: score.remarks || ''
          },
          { upsert: true, new: true }
        );
        
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Error for ${score.student_email}: ${err.message}`);
      }
    }
    
    res.json({
      message: 'Scores uploaded',
      results
    });
  } catch (error) {
    console.error('Upload scores error:', error);
    res.status(500).json({ error: 'Failed to upload scores' });
  }
});

// Calculate college engineer scores
router.post('/calculate-scores', authenticate, authorize('college_admin'), async (req, res) => {
  try {
    const admin = await User.findById(req.userId);
    
    // Get all assessments for this college
    const assessments = await Assessment.find({
      college_id: admin.managed_college_id
    });
    
    if (assessments.length === 0) {
      return res.status(400).json({ error: 'No assessments found' });
    }
    
    // Get all students in college
    const students = await User.find({
      role: 'student',
      college_id: admin.managed_college_id
    });
    
    let updatedCount = 0;
    
    for (const student of students) {
      let totalWeightedScore = 0;
      let totalWeightage = 0;
      
      for (const assessment of assessments) {
        const score = await AssessmentScore.findOne({
          assessment_id: assessment._id,
          student_id: student._id
        });
        
        if (score) {
          const percentage = (score.marks_obtained / assessment.max_marks) * 100;
          totalWeightedScore += (percentage * assessment.weightage);
          totalWeightage += assessment.weightage;
        }
      }
      
      if (totalWeightage > 0) {
        student.college_engineer_score = Math.round((totalWeightedScore / totalWeightage) * 10);
        await student.save();
        updatedCount++;
      }
    }
    
    res.json({
      message: 'College engineer scores calculated',
      students_updated: updatedCount
    });
  } catch (error) {
    console.error('Calculate scores error:', error);
    res.status(500).json({ error: 'Failed to calculate scores' });
  }
});

module.exports = router;
