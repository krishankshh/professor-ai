const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LearningSession = require('../models/LearningSession');
const User = require('../models/User');

// Enhanced LLM integration
const { generateLLMResponse } = require('../utils/enhancedLlmService');

// @route   POST api/tutoring/session
// @desc    Start a new tutoring session
// @access  Private
router.post('/session', auth, async (req, res) => {
  try {
    const { topic, syllabusId } = req.body;

    // Create new learning session
    const session = new LearningSession({
      user: req.user.id,
      topic,
      syllabus: syllabusId || null,
      startTime: Date.now(),
      progress: 0,
      interactions: []
    });

    // Save session to database
    await session.save();

    res.json(session);
  } catch (err) {
    console.error('Error starting session:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/tutoring/session/:id/message
// @desc    Send a message in a tutoring session
// @access  Private
router.post('/session/:id/message', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Find session by ID
    const session = await LearningSession.findById(req.params.id);

    // Check if session exists
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user owns the session
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Get user data for personalization
    const user = await User.findById(req.user.id);

    // Generate AI response using enhanced LLM service
    const llmResult = await generateLLMResponse(message, {
      userId: req.user.id,
      sessionId: session._id,
      topic: session.topic,
      useRag: true
    });

    // Add interaction to session
    session.interactions.push({
      question: message,
      answer: llmResult.response,
      timestamp: Date.now(),
      relevantDocuments: llmResult.documents.map(doc => doc._id)
    });

    // Update session progress (simplified for now)
    session.progress = Math.min(100, session.progress + 5);

    // Save updated session
    await session.save();

    res.json({ 
      message: llmResult.response,
      sessionId: session._id,
      progress: session.progress,
      relevantDocuments: llmResult.documents
    });
  } catch (err) {
    console.error('Error processing message:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/tutoring/chat
// @desc    Simple chat endpoint without session (for testing)
// @access  Public
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Generate AI response using enhanced LLM service
    const llmResult = await generateLLMResponse(message, {
      useRag: false
    });

    res.json({ 
      response: llmResult.response
    });
  } catch (err) {
    console.error('Error processing chat message:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tutoring/session/:id/end
// @desc    End a tutoring session
// @access  Private
router.put('/session/:id/end', auth, async (req, res) => {
  try {
    // Find session by ID
    const session = await LearningSession.findById(req.params.id);

    // Check if session exists
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user owns the session
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update session end time
    session.endTime = Date.now();

    // Save updated session
    await session.save();

    res.json(session);
  } catch (err) {
    console.error('Error ending session:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tutoring/sessions
// @desc    Get all tutoring sessions for a user
// @access  Private
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await LearningSession.find({ user: req.user.id })
      .sort({ startTime: -1 });
    res.json(sessions);
  } catch (err) {
    console.error('Error getting sessions:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tutoring/session/:id
// @desc    Get a tutoring session by ID
// @access  Private
router.get('/session/:id', auth, async (req, res) => {
  try {
    const session = await LearningSession.findById(req.params.id);

    // Check if session exists
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user owns the session
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(session);
  } catch (err) {
    console.error('Error getting session:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
