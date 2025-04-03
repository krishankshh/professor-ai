const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Syllabus = require('../models/Syllabus');

// @route   POST api/syllabus
// @desc    Create a new syllabus
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, topics, difficulty } = req.body;

    // Create new syllabus
    const syllabus = new Syllabus({
      title,
      description,
      user: req.user.id,
      topics,
      difficulty
    });

    // Save syllabus to database
    await syllabus.save();

    res.json(syllabus);
  } catch (err) {
    console.error('Error creating syllabus:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/syllabus
// @desc    Get all syllabi for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const syllabi = await Syllabus.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(syllabi);
  } catch (err) {
    console.error('Error getting syllabi:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/syllabus/:id
// @desc    Get syllabus by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);

    // Check if syllabus exists
    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }

    // Check if user owns the syllabus
    if (syllabus.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(syllabus);
  } catch (err) {
    console.error('Error getting syllabus:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/syllabus/:id
// @desc    Update syllabus
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, topics, difficulty } = req.body;

    // Find syllabus by ID
    let syllabus = await Syllabus.findById(req.params.id);

    // Check if syllabus exists
    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }

    // Check if user owns the syllabus
    if (syllabus.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update syllabus
    syllabus.title = title || syllabus.title;
    syllabus.description = description || syllabus.description;
    syllabus.topics = topics || syllabus.topics;
    syllabus.difficulty = difficulty || syllabus.difficulty;
    syllabus.updatedAt = Date.now();

    // Save updated syllabus
    await syllabus.save();

    res.json(syllabus);
  } catch (err) {
    console.error('Error updating syllabus:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/syllabus/:id
// @desc    Delete syllabus
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find syllabus by ID
    const syllabus = await Syllabus.findById(req.params.id);

    // Check if syllabus exists
    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }

    // Check if user owns the syllabus
    if (syllabus.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete syllabus
    await syllabus.remove();

    res.json({ message: 'Syllabus removed' });
  } catch (err) {
    console.error('Error deleting syllabus:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
