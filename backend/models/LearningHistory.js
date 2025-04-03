const mongoose = require('mongoose');

const LearningHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningSession'
  }],
  assessments: [{
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment'
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    answers: [{
      questionIndex: Number,
      selectedOption: Number,
      isCorrect: Boolean
    }]
  }],
  topics: [{
    name: {
      type: String,
      required: true
    },
    proficiency: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastStudied: {
      type: Date
    }
  }],
  totalStudyTime: {
    type: Number,
    default: 0 // in minutes
  },
  strengths: [{
    type: String
  }],
  weaknesses: [{
    type: String
  }],
  learningPath: {
    currentTopic: {
      type: String
    },
    nextTopics: [{
      type: String
    }],
    completedTopics: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LearningHistory', LearningHistorySchema);
