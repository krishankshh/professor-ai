const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const { addDocument, searchRelevantDocuments } = require('../utils/ragService');

// @route   POST api/documents
// @desc    Add a new document to the knowledge base
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, topic, syllabusId, metadata } = req.body;

    // Create new document
    const document = new Document({
      title,
      content,
      topic,
      syllabus: syllabusId || null,
      user: req.user.id,
      metadata: metadata || {}
    });

    // Save document to database
    await document.save();

    // Add document to RAG service
    await addDocument({
      id: document._id.toString(),
      title,
      content,
      topic,
      metadata: metadata || {}
    });

    res.json(document);
  } catch (err) {
    console.error('Error adding document:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/documents
// @desc    Get all documents for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error('Error getting documents:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/documents/search
// @desc    Search documents by query
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { query, topic, limit } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Search for relevant documents
    const results = await searchRelevantDocuments(query, {
      topic: topic || null,
      limit: limit ? parseInt(limit) : 5
    });
    
    res.json(results);
  } catch (err) {
    console.error('Error searching documents:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/documents/:id
// @desc    Get document by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    // Check if document exists
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user owns the document
    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(document);
  } catch (err) {
    console.error('Error getting document:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    // Check if document exists
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user owns the document
    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Delete document
    await document.remove();
    
    res.json({ message: 'Document removed' });
  } catch (err) {
    console.error('Error deleting document:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
