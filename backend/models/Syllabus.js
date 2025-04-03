const mongoose = require('mongoose');

const SyllabusSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Syllabus title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'all'
  },
  topics: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    subtopics: [{
      title: {
        type: String,
        required: true
      },
      description: {
        type: String
      },
      resources: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      }]
    }]
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
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

module.exports = mongoose.model('Syllabus', SyllabusSchema);
