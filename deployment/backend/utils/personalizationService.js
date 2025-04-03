const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const LearningHistory = require('../models/LearningHistory');
const LearningSession = require('../models/LearningSession');
const Syllabus = require('../models/Syllabus');
const Assessment = require('../models/Assessment');

/**
 * Personalization Service for Professor AI
 * This service provides personalized learning experiences based on user profiles and learning history
 */

/**
 * Initialize a user profile with default preferences
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Created user profile
 */
const initializeUserProfile = async (userId) => {
  try {
    // Check if profile already exists
    const existingProfile = await UserProfile.findOne({ user: userId });
    if (existingProfile) {
      return existingProfile;
    }
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create default profile
    const profile = new UserProfile({
      user: userId,
      displayName: user.name,
      learningPreferences: {
        preferredExamples: user.learningPreferences?.preferredExamples || 'practical',
        communicationStyle: user.learningPreferences?.communicationStyle || 'conversational',
        detailLevel: user.learningPreferences?.detailLevel || 'balanced',
        learningPace: 'moderate',
        visualAids: true
      },
      subjectsOfInterest: [],
      skillLevels: []
    });
    
    await profile.save();
    return profile;
  } catch (error) {
    console.error('Error initializing user profile:', error);
    throw error;
  }
};

/**
 * Generate a personalized learning path for a user
 * @param {string} userId - User ID
 * @param {string} topic - Learning topic
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Personalized learning path
 */
const generatePersonalizedLearningPath = async (userId, topic, options = {}) => {
  try {
    // Get user profile and learning history
    const userProfile = await UserProfile.findOne({ user: userId });
    if (!userProfile) {
      await initializeUserProfile(userId);
    }
    
    const learningHistory = await LearningHistory.findOne({ 
      user: userId,
      topic: { $regex: new RegExp(topic, 'i') }
    });
    
    // Find relevant syllabi
    const syllabi = await Syllabus.find({
      $or: [
        { user: userId },
        { isPublic: true }
      ],
      $or: [
        { title: { $regex: new RegExp(topic, 'i') } },
        { tags: { $in: [topic] } },
        { 'topics.title': { $regex: new RegExp(topic, 'i') } }
      ]
    }).sort({ createdAt: -1 });
    
    // Determine appropriate difficulty level
    let recommendedDifficulty = 'intermediate';
    
    // If user has skill level for this topic, use it
    const relevantSkill = userProfile?.skillLevels?.find(skill => 
      skill.subject.toLowerCase().includes(topic.toLowerCase())
    );
    
    if (relevantSkill) {
      switch (relevantSkill.level) {
        case 'beginner':
          recommendedDifficulty = 'beginner';
          break;
        case 'intermediate':
          recommendedDifficulty = 'intermediate';
          break;
        case 'advanced':
        case 'expert':
          recommendedDifficulty = 'advanced';
          break;
      }
    } else if (learningHistory) {
      // If user has history with this topic, adjust difficulty based on progress
      if (learningHistory.overallProgress < 30) {
        recommendedDifficulty = 'beginner';
      } else if (learningHistory.overallProgress > 70) {
        recommendedDifficulty = 'advanced';
      }
    }
    
    // Select or create a syllabus
    let selectedSyllabus;
    
    if (syllabi.length > 0) {
      // Find syllabus with matching difficulty
      selectedSyllabus = syllabi.find(s => s.difficulty === recommendedDifficulty);
      
      // If no exact match, take the first one
      if (!selectedSyllabus) {
        selectedSyllabus = syllabi[0];
      }
    }
    
    // If no syllabus found, we'll return a recommendation to create one
    if (!selectedSyllabus) {
      return {
        topic,
        recommendedDifficulty,
        message: "No existing syllabus found for this topic. Consider creating one.",
        needsSyllabus: true
      };
    }
    
    // Determine starting point based on learning history
    let startingTopicIndex = 0;
    if (learningHistory) {
      // Find the last topic the user was working on
      const lastSession = learningHistory.sessions
        .filter(session => session.sessionId.syllabus?.toString() === selectedSyllabus._id.toString())
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0];
      
      if (lastSession) {
        // Find the topic with the lowest mastery
        const lowestMasteryTopic = lastSession.topicsCovered
          .sort((a, b) => a.mastery - b.mastery)[0];
        
        if (lowestMasteryTopic) {
          // Find the index of this topic in the syllabus
          startingTopicIndex = selectedSyllabus.topics.findIndex(
            t => t.title === lowestMasteryTopic.title
          );
          
          // If not found or mastery is high, move to the next topic
          if (startingTopicIndex === -1 || lowestMasteryTopic.mastery > 80) {
            startingTopicIndex = 0;
          }
        }
      }
    }
    
    // Create personalized learning path
    return {
      topic,
      syllabus: selectedSyllabus,
      recommendedDifficulty,
      startingTopicIndex,
      userPreferences: userProfile?.learningPreferences || {},
      estimatedCompletionTime: selectedSyllabus.totalDuration || 
        selectedSyllabus.topics.reduce((sum, topic) => sum + (topic.estimatedDuration || 30), 0)
    };
  } catch (error) {
    console.error('Error generating personalized learning path:', error);
    throw error;
  }
};

/**
 * Update user profile based on learning session
 * @param {string} userId - User ID
 * @param {string} sessionId - Learning session ID
 * @returns {Promise<Object>} - Updated user profile and learning history
 */
const updateUserProfileFromSession = async (userId, sessionId) => {
  try {
    // Get session data
    const session = await LearningSession.findById(sessionId);
    if (!session || session.user.toString() !== userId) {
      throw new Error('Session not found or unauthorized');
    }
    
    // Get or create user profile
    let userProfile = await UserProfile.findOne({ user: userId });
    if (!userProfile) {
      userProfile = await initializeUserProfile(userId);
    }
    
    // Get or create learning history
    let learningHistory = await LearningHistory.findOne({ 
      user: userId,
      topic: session.topic
    });
    
    if (!learningHistory) {
      learningHistory = new LearningHistory({
        user: userId,
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
    
    // Update learning history with session data
    const sessionData = {
      sessionId: session._id,
      startTime: session.startTime,
      endTime: session.endTime || Date.now(),
      duration: session.duration || 
        Math.round(((session.endTime || Date.now()) - session.startTime) / (1000 * 60)),
      progress: session.progress,
      topicsCovered: session.conceptsCovered?.map(concept => ({
        title: concept.concept,
        mastery: concept.mastery
      })) || []
    };
    
    // Add session to history if not already present
    if (!learningHistory.sessions.some(s => s.sessionId.toString() === session._id.toString())) {
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
    
    // Update strengths and weaknesses based on concept mastery
    const allConcepts = [];
    learningHistory.sessions.forEach(s => {
      s.topicsCovered.forEach(topic => {
        const existingConcept = allConcepts.find(c => c.topic === topic.title);
        if (existingConcept) {
          existingConcept.scores.push(topic.mastery);
        } else {
          allConcepts.push({
            topic: topic.title,
            scores: [topic.mastery]
          });
        }
      });
    });
    
    // Calculate average scores
    const conceptAverages = allConcepts.map(concept => ({
      topic: concept.topic,
      score: concept.scores.reduce((sum, score) => sum + score, 0) / concept.scores.length
    }));
    
    // Sort by score
    conceptAverages.sort((a, b) => b.score - a.score);
    
    // Update strengths (top 3)
    learningHistory.strengths = conceptAverages
      .filter(c => c.score >= 70)
      .slice(0, 3);
    
    // Update weaknesses (bottom 3)
    learningHistory.weaknesses = conceptAverages
      .filter(c => c.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
    
    // Save learning history
    await learningHistory.save();
    
    // Update user profile with subject interest if not already present
    if (!userProfile.subjectsOfInterest.includes(session.topic)) {
      userProfile.subjectsOfInterest.push(session.topic);
    }
    
    // Update skill level for this topic
    const skillIndex = userProfile.skillLevels.findIndex(
      skill => skill.subject === session.topic
    );
    
    let skillLevel = 'beginner';
    if (learningHistory.overallProgress > 70) {
      skillLevel = 'advanced';
    } else if (learningHistory.overallProgress > 30) {
      skillLevel = 'intermediate';
    }
    
    if (skillIndex >= 0) {
      userProfile.skillLevels[skillIndex].level = skillLevel;
    } else {
      userProfile.skillLevels.push({
        subject: session.topic,
        level: skillLevel
      });
    }
    
    // Save user profile
    await userProfile.save();
    
    return {
      userProfile,
      learningHistory
    };
  } catch (error) {
    console.error('Error updating user profile from session:', error);
    throw error;
  }
};

/**
 * Generate personalized system prompt for LLM
 * @param {string} userId - User ID
 * @param {string} topic - Current topic
 * @returns {Promise<string>} - Personalized system prompt
 */
const generatePersonalizedSystemPrompt = async (userId, topic) => {
  try {
    // Get user profile
    const userProfile = await UserProfile.findOne({ user: userId });
    if (!userProfile) {
      // Return default prompt if no profile exists
      return `
        You are Professor AI, a personalized AI tutor specializing in ${topic || 'various subjects'}.
        
        Your teaching approach:
        - Complexity level: intermediate
        - Example style: practical
        - Communication style: conversational
        - Detail level: balanced
        
        Guidelines:
        - Be engaging, friendly, and occasionally use humor to make learning enjoyable
        - Break down complex concepts into understandable parts
        - Use analogies and examples to illustrate concepts
        - Ask questions to check understanding
        - Provide encouragement and positive reinforcement
        - Be concise but thorough in your explanations
        
        The current topic is: ${topic || 'to be determined based on the student\'s questions'}
        
        Respond to the student's questions in a helpful, accurate, and educational manner.
      `;
    }
    
    // Get user data
    const user = await User.findById(userId);
    
    // Get learning history for this topic
    const learningHistory = await LearningHistory.findOne({ 
      user: userId,
      topic: { $regex: new RegExp(topic, 'i') }
    });
    
    // Determine complexity level based on skill level
    let complexityLevel = 'intermediate';
    
    // Check skill level for this topic
    const relevantSkill = userProfile.skillLevels.find(skill => 
      skill.subject.toLowerCase().includes(topic.toLowerCase())
    );
    
    if (relevantSkill) {
      complexityLevel = relevantSkill.level;
    } else if (user.academicBackground) {
      // Fallback to academic background
      switch (user.academicBackground) {
        case 'high_school':
          complexityLevel = 'beginner';
          break;
        case 'undergraduate':
          complexityLevel = 'intermediate';
          break;
        case 'graduate':
        case 'phd':
          complexityLevel = 'advanced';
          break;
      }
    }
    
    // Extract learning preferences
    const { 
      preferredExamples = 'practical',
      communicationStyle = 'conversational',
      detailLevel = 'balanced'
    } = userProfile.learningPreferences;
    
    // Add strengths and weaknesses if available
    let strengthsWeaknesses = '';
    if (learningHistory) {
      if (learningHistory.strengths.length > 0) {
        strengthsWeaknesses += '\nStrengths in this topic:\n';
        learningHistory.strengths.forEach(strength => {
          strengthsWeaknesses += `- ${strength.topic}\n`;
        });
      }
      
      if (learningHistory.weaknesses.length > 0) {
        strengthsWeaknesses += '\nAreas that need improvement:\n';
        learningHistory.weaknesses.forEach(weakness => {
          strengthsWeaknesses += `- ${weakness.topic}\n`;
        });
      }
    }
    
    // Build the personalized system prompt
    return `
      You are Professor AI, a personalized AI tutor specializing in ${topic || 'various subjects'}.
      
      Your teaching approach for ${userProfile.displayName || 'this student'}:
      - Complexity level: ${complexityLevel}
      - Example style: ${preferredExamples}
      - Communication style: ${communicationStyle}
      - Detail level: ${detailLevel}
      
      Guidelines:
      - Be engaging, friendly, and occasionally use humor to make learning enjoyable
      - Adapt explanations to the student's academic background (${user.academicBackground || 'general'})
      - Break down complex concepts into understandable parts
      - Use ${preferredExamples} examples to illustrate concepts
      - Ask questions to check understanding
      - Provide encouragement and positive reinforcement
      - Be ${detailLevel === 'concise' ? 'brief and to the point' : detailLevel === 'comprehensive' ? 'thorough and detailed' : 'balanced in detail level'}
      ${strengthsWeaknesses}
      
      The current topic is: ${topic || 'to be determined based on the student\'s questions'}
      
      Respond to the student's questions in a helpful, accurate, and educational manner.
    `;
  } catch (error) {
    console.error('Error generating personalized system prompt:', error);
    // Return default prompt on error
    return `
      You are Professor AI, a personalized AI tutor specializing in ${topic || 'various subjects'}.
      
      Your teaching approach:
      - Complexity level: intermediate
      - Example style: practical
      - Communication style: conversational
      - Detail level: balanced
      
      Guidelines:
      - Be engaging, friendly, and occasionally use humor to make learning enjoyable
      - Break down complex concepts into understandable parts
      - Use analogies and examples to illustrate concepts
      - Ask questions to check understanding
      - Provide encouragement and positive reinforcement
      - Be concise but thorough in your explanations
      
      The current topic is: ${topic || 'to be determined based on the student\'s questions'}
      
      Respond to the student's questions in a helpful, accurate, and educational manner.
    `;
  }
};

module.exports = {
  initializeUserProfile,
  generatePersonalizedLearningPath,
  updateUserProfileFromSession,
  generatePersonalizedSystemPrompt
};
