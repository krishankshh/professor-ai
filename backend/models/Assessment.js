const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    trim: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['quiz', 'test', 'exercise', 'challenge'],
    default: 'quiz'
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
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      text: {
        type: String,
        required: true
      },
      isCorrect: {
        type: Boolean,
        default: false
      }
    }],
    explanation: {
      type: String
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  timeLimit: {
    type: Number,
    default: 0 // 0 means no time limit
  },
  passingScore: {
    type: Number,
    default: 70
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
