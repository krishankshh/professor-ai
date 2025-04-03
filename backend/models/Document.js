const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Document content is required']
  },
  type: {
    type: String,
    enum: ['article', 'textbook', 'notes', 'reference', 'custom'],
    default: 'article'
  },
  tags: [{
    type: String,
    trim: true
  }],
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  embeddings: {
    type: Object,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for text search
DocumentSchema.index({ title: 'text', content: 'text', subject: 'text', tags: 'text' });

module.exports = mongoose.model('Document', DocumentSchema);
