const LearningSession = require('../models/LearningSession');
const LearningHistory = require('../models/LearningHistory');
const UserProfile = require('../models/UserProfile');

/**
 * Feedback Service for Professor AI
 * This service provides feedback collection and progress visualization functionality
 */

/**
 * Record user feedback for a learning session interaction
 * @param {string} sessionId - Learning session ID
 * @param {number} interactionIndex - Index of the interaction
 * @param {Object} feedback - User feedback
 * @returns {Promise<Object>} - Updated session
 */
const recordInteractionFeedback = async (sessionId, interactionIndex, feedback) => {
  try {
    // Get session
    const session = await LearningSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Validate interaction index
    if (interactionIndex < 0 || interactionIndex >= session.interactions.length) {
      throw new Error('Invalid interaction index');
    }
    
    // Update interaction with feedback
    session.interactions[interactionIndex].userFeedback = {
      helpful: feedback.helpful,
      rating: feedback.rating,
      comment: feedback.comment || ''
    };
    
    // Save session
    await session.save();
    
    return session;
  } catch (error) {
    console.error('Error recording interaction feedback:', error);
    throw error;
  }
};

/**
 * Record session feedback at the end of a learning session
 * @param {string} sessionId - Learning session ID
 * @param {Object} feedback - Session feedback
 * @returns {Promise<Object>} - Updated session
 */
const recordSessionFeedback = async (sessionId, feedback) => {
  try {
    // Get session
    const session = await LearningSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Update session with feedback
    session.feedback = {
      rating: feedback.rating,
      comments: feedback.comments || '',
      helpfulness: feedback.helpfulness,
      clarity: feedback.clarity,
      engagement: feedback.engagement,
      timestamp: Date.now()
    };
    
    // Mark session as completed if it's not already
    if (session.status !== 'completed') {
      session.status = 'completed';
      session.endTime = Date.now();
      
      // Calculate duration
      const durationMs = session.endTime - session.startTime;
      session.duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
    }
    
    // Save session
    await session.save();
    
    // Update learning history
    await updateLearningHistoryWithSessionFeedback(session);
    
    return session;
  } catch (error) {
    console.error('Error recording session feedback:', error);
    throw error;
  }
};

/**
 * Update learning history with session feedback
 * @param {Object} session - Learning session
 * @returns {Promise<Object>} - Updated learning history
 */
const updateLearningHistoryWithSessionFeedback = async (session) => {
  try {
    // Get learning history
    let learningHistory = await LearningHistory.findOne({
      user: session.user,
      topic: session.topic
    });
    
    if (!learningHistory) {
      // Create new learning history if it doesn't exist
      learningHistory = new LearningHistory({
        user: session.user,
        topic: session.topic,
        syllabus: session.syllabus,
        sessions: [],
        assessments: [],
        overallProgress: 0,
        strengths: [],
        weaknesses: [],
        lastStudied: Date.now()
      });
    }
    
    // Find session in history
    const sessionIndex = learningHistory.sessions.findIndex(
      s => s.sessionId.toString() === session._id.toString()
    );
    
    // Update session data
    const sessionData = {
      sessionId: session._id,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      progress: session.progress,
      topicsCovered: session.conceptsCovered?.map(concept => ({
        title: concept.concept,
        mastery: concept.mastery
      })) || []
    };
    
    if (sessionIndex >= 0) {
      learningHistory.sessions[sessionIndex] = sessionData;
    } else {
      learningHistory.sessions.push(sessionData);
    }
    
    // Update last studied time
    learningHistory.lastStudied = Date.now();
    
    // Calculate overall progress
    if (learningHistory.sessions.length > 0) {
      learningHistory.overallProgress = Math.min(
        100,
        learningHistory.sessions.reduce((sum, s) => sum + s.progress, 0) / learningHistory.sessions.length
      );
    }
    
    // Save learning history
    await learningHistory.save();
    
    return learningHistory;
  } catch (error) {
    console.error('Error updating learning history with session feedback:', error);
    throw error;
  }
};

/**
 * Get progress visualization data for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Progress visualization data
 */
const getProgressVisualization = async (userId) => {
  try {
    // Get all learning histories for user
    const learningHistories = await LearningHistory.find({ user: userId });
    
    // Get user profile
    const userProfile = await UserProfile.findOne({ user: userId });
    
    // Calculate topic progress
    const topicProgress = learningHistories.map(history => ({
      topic: history.topic,
      progress: history.overallProgress,
      lastStudied: history.lastStudied,
      sessionsCount: history.sessions.length,
      assessmentsCount: history.assessments.length,
      strengths: history.strengths,
      weaknesses: history.weaknesses
    }));
    
    // Calculate progress over time
    const progressOverTime = [];
    const timePoints = [];
    
    // Get all sessions across all topics
    learningHistories.forEach(history => {
      history.sessions.forEach(session => {
        timePoints.push({
          topic: history.topic,
          date: session.endTime || session.startTime,
          progress: session.progress
        });
      });
      
      // Add assessment points
      history.assessments.forEach(assessment => {
        timePoints.push({
          topic: history.topic,
          date: assessment.completedAt,
          progress: assessment.score,
          isAssessment: true
        });
      });
    });
    
    // Sort by date
    timePoints.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Group by month for long-term visualization
    const monthlyProgress = {};
    timePoints.forEach(point => {
      const date = new Date(point.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyProgress[monthKey]) {
        monthlyProgress[monthKey] = {
          date: new Date(date.getFullYear(), date.getMonth(), 1),
          points: []
        };
      }
      
      monthlyProgress[monthKey].points.push(point);
    });
    
    // Calculate average progress per month
    const monthlyAverageProgress = Object.keys(monthlyProgress).map(key => {
      const month = monthlyProgress[key];
      const avgProgress = month.points.reduce((sum, p) => sum + p.progress, 0) / month.points.length;
      
      return {
        date: month.date,
        progress: Math.round(avgProgress)
      };
    });
    
    // Calculate skill development
    const skillDevelopment = userProfile?.skillLevels.map(skill => ({
      subject: skill.subject,
      level: skill.level,
      // Convert level to numeric value for visualization
      value: skill.level === 'beginner' ? 25 :
             skill.level === 'intermediate' ? 50 :
             skill.level === 'advanced' ? 75 :
             skill.level === 'expert' ? 100 : 0
    })) || [];
    
    return {
      topicProgress,
      progressOverTime: timePoints,
      monthlyProgress: monthlyAverageProgress,
      skillDevelopment,
      overallProgress: topicProgress.length > 0
        ? Math.round(topicProgress.reduce((sum, t) => sum + t.progress, 0) / topicProgress.length)
        : 0,
      mostStudiedTopics: topicProgress
        .sort((a, b) => b.sessionsCount - a.sessionsCount)
        .slice(0, 3)
        .map(t => t.topic),
      recentTopics: topicProgress
        .sort((a, b) => new Date(b.lastStudied) - new Date(a.lastStudied))
        .slice(0, 3)
        .map(t => t.topic)
    };
  } catch (error) {
    console.error('Error getting progress visualization:', error);
    throw error;
  }
};

/**
 * Generate knowledge retention recommendations
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Knowledge retention recommendations
 */
const generateKnowledgeRetentionRecommendations = async (userId) => {
  try {
    // Get all learning histories for user
    const learningHistories = await LearningHistory.find({ user: userId });
    
    // Calculate time since last study for each topic
    const topicsWithLastStudied = learningHistories.map(history => {
      const daysSinceLastStudy = Math.round(
        (Date.now() - new Date(history.lastStudied)) / (1000 * 60 * 60 * 24)
      );
      
      return {
        topic: history.topic,
        progress: history.overallProgress,
        daysSinceLastStudy,
        forgettingCurve: calculateForgettingCurve(history.overallProgress, daysSinceLastStudy)
      };
    });
    
    // Sort by forgetting curve (lowest retention first)
    topicsWithLastStudied.sort((a, b) => a.forgettingCurve - b.forgettingCurve);
    
    // Generate recommendations
    const recommendations = topicsWithLastStudied.map(topic => {
      let recommendationType = 'review';
      let urgency = 'low';
      
      if (topic.forgettingCurve < 30) {
        recommendationType = 'relearn';
        urgency = 'high';
      } else if (topic.forgettingCurve < 50) {
        recommendationType = 'practice';
        urgency = 'medium';
      }
      
      return {
        topic: topic.topic,
        retentionEstimate: topic.forgettingCurve,
        recommendationType,
        urgency,
        message: generateRetentionMessage(topic.topic, topic.forgettingCurve, topic.daysSinceLastStudy)
      };
    });
    
    return {
      recommendations: recommendations.slice(0, 5), // Top 5 recommendations
      averageRetention: topicsWithLastStudied.length > 0
        ? Math.round(topicsWithLastStudied.reduce((sum, t) => sum + t.forgettingCurve, 0) / topicsWithLastStudied.length)
        : 0
    };
  } catch (error) {
    console.error('Error generating knowledge retention recommendations:', error);
    throw error;
  }
};

/**
 * Calculate forgetting curve based on Ebbinghaus' model
 * @param {number} initialStrength - Initial strength (progress)
 * @param {number} daysSince - Days since last study
 * @returns {number} - Retention percentage
 */
const calculateForgettingCurve = (initialStrength, daysSince) => {
  // Simplified forgetting curve formula
  // R = e^(-t/S) where:
  // R is retention
  // t is time (days)
  // S is strength of memory (higher progress = stronger memory)
  
  // Convert progress to strength factor (1-10)
  const strength = (initialStrength / 10) + 1;
  
  // Calculate retention
  const retention = Math.exp(-daysSince / strength) * 100;
  
  // Return rounded retention percentage
  return Math.round(Math.max(0, Math.min(100, retention)));
};

/**
 * Generate retention message
 * @param {string} topic - Topic name
 * @param {number} retention - Retention percentage
 * @param {number} daysSince - Days since last study
 * @returns {string} - Retention message
 */
const generateRetentionMessage = (topic, retention, daysSince) => {
  if (retention < 30) {
    return `It's been ${daysSince} days since you studied ${topic}. Your estimated retention is low (${retention}%). Consider reviewing this topic soon to reinforce your knowledge.`;
  } else if (retention < 50) {
    return `You studied ${topic} ${daysSince} days ago. Your estimated retention is moderate (${retention}%). A practice session would help strengthen your understanding.`;
  } else if (retention < 70) {
    return `You last studied ${topic} ${daysSince} days ago. Your retention is still good (${retention}%), but a quick review would be beneficial.`;
  } else {
    return `Your knowledge of ${topic} is still strong (${retention}% retention) after ${daysSince} days. Keep up the good work!`;
  }
};

module.exports = {
  recordInteractionFeedback,
  recordSessionFeedback,
  getProgressVisualization,
  generateKnowledgeRetentionRecommendations
};
