const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  academicBackground: {
    educationLevel: {
      type: String,
      enum: ['primary', 'secondary', 'undergraduate', 'graduate', 'postgraduate', 'other'],
      default: 'undergraduate'
    },
    fieldOfStudy: {
      type: String
    },
    institution: {
      type: String
    }
  },
  learningPreferences: {
    preferredLearningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'reading', 'kinesthetic', 'multimodal'],
      default: 'multimodal'
    },
    preferredPace: {
      type: String,
      enum: ['slow', 'moderate', 'fast', 'adaptive'],
      default: 'adaptive'
    },
    preferredContentTypes: [{
      type: String,
      enum: ['text', 'video', 'interactive', 'examples', 'exercises']
    }],
    preferredSessionDuration: {
      type: Number,
      default: 30 // in minutes
    }
  },
  interests: [{
    type: String
  }],
  goals: [{
    description: {
      type: String,
      required: true
    },
    targetDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active'
    }
  }],
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    },
    studyReminders: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'none'],
      default: 'weekly'
    }
  },
  avatar: {
    type: String
  },
  bio: {
    type: String
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
