const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  generateQuiz, 
  gradeAssessment, 
  getPerformanceAnalytics 
} = require('../utils/assessmentService');
const {
  recordInteractionFeedback,
  recordSessionFeedback,
  getProgressVisualization,
  generateKnowledgeRetentionRecommendations
} = require('../utils/feedbackService');

// @route   POST api/assessment/generate-quiz
// @desc    Generate a new quiz
// @access  Private
router.post('/generate-quiz', auth, async (req, res) => {
  try {
    const { topic, syllabusId, difficulty, questionCount, questionTypes, includeExplanations } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    const quiz = await generateQuiz({
      topic,
      syllabusId,
      userId: req.user.id,
      difficulty: difficulty || 'medium',
      questionCount: questionCount || 5,
      questionTypes: questionTypes || ['multiple_choice'],
      includeExplanations: includeExplanations !== false
    });
    
    res.json(quiz);
  } catch (err) {
    console.error('Error generating quiz:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/assessment/grade/:id
// @desc    Grade a completed assessment
// @access  Private
router.post('/grade/:id', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array is required' });
    }
    
    const results = await gradeAssessment(
      req.params.id,
      answers,
      req.user.id
    );
    
    res.json(results);
  } catch (err) {
    console.error('Error grading assessment:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/assessment/analytics
// @desc    Get user performance analytics
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const analytics = await getPerformanceAnalytics(req.user.id);
    res.json(analytics);
  } catch (err) {
    console.error('Error getting performance analytics:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/assessment/feedback/interaction/:sessionId/:interactionIndex
// @desc    Record feedback for a specific interaction
// @access  Private
router.post('/feedback/interaction/:sessionId/:interactionIndex', auth, async (req, res) => {
  try {
    const { helpful, rating, comment } = req.body;
    
    if (rating === undefined) {
      return res.status(400).json({ message: 'Rating is required' });
    }
    
    const session = await recordInteractionFeedback(
      req.params.sessionId,
      parseInt(req.params.interactionIndex),
      {
        helpful: helpful !== false,
        rating,
        comment
      }
    );
    
    res.json(session);
  } catch (err) {
    console.error('Error recording interaction feedback:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/assessment/feedback/session/:sessionId
// @desc    Record feedback for an entire session
// @access  Private
router.post('/feedback/session/:sessionId', auth, async (req, res) => {
  try {
    const { rating, comments, helpfulness, clarity, engagement } = req.body;
    
    if (rating === undefined) {
      return res.status(400).json({ message: 'Rating is required' });
    }
    
    const session = await recordSessionFeedback(
      req.params.sessionId,
      {
        rating,
        comments,
        helpfulness: helpfulness || rating,
        clarity: clarity || rating,
        engagement: engagement || rating
      }
    );
    
    res.json(session);
  } catch (err) {
    console.error('Error recording session feedback:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/assessment/progress
// @desc    Get progress visualization data
// @access  Private
router.get('/progress', auth, async (req, res) => {
  try {
    const progressData = await getProgressVisualization(req.user.id);
    res.json(progressData);
  } catch (err) {
    console.error('Error getting progress visualization:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/assessment/retention
// @desc    Get knowledge retention recommendations
// @access  Private
router.get('/retention', auth, async (req, res) => {
  try {
    const recommendations = await generateKnowledgeRetentionRecommendations(req.user.id);
    res.json(recommendations);
  } catch (err) {
    console.error('Error generating retention recommendations:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
