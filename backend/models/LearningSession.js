const mongoose = require('mongoose');

const LearningSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  syllabus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Syllabus'
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'abandoned'],
    default: 'active'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0
  },
  learningObjectives: [{
    type: String
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LearningSession', LearningSessionSchema);
