const Assessment = require('../models/Assessment');
const LearningHistory = require('../models/LearningHistory');
const { generateLLMResponse } = require('./enhancedLlmService');

/**
 * Assessment Service for Professor AI
 * This service provides quiz generation and knowledge assessment functionality
 */

/**
 * Generate a quiz based on a topic or syllabus
 * @param {Object} options - Quiz generation options
 * @returns {Promise<Object>} - Generated quiz
 */
const generateQuiz = async (options) => {
  try {
    const {
      topic,
      syllabusId = null,
      userId,
      difficulty = 'medium',
      questionCount = 5,
      questionTypes = ['multiple_choice'],
      includeExplanations = true
    } = options;

    // Create quiz generation prompt
    const prompt = `
      Generate a quiz about "${topic}" with the following specifications:
      - Number of questions: ${questionCount}
      - Difficulty level: ${difficulty}
      - Question types: ${questionTypes.join(', ')}
      ${includeExplanations ? '- Include explanations for correct answers' : ''}
      
      Format the quiz as a JSON object with the following structure:
      {
        "title": "Quiz title",
        "description": "Brief description of the quiz",
        "questions": [
          {
            "question": "Question text",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": 0, // Index of correct answer (0-based)
            "explanation": "Explanation of the correct answer",
            "difficulty": "easy/medium/hard",
            "topics": ["specific topic", "subtopic"]
          }
        ]
      }
      
      Make sure the questions are challenging but fair, and cover different aspects of the topic.
      Ensure that the correct answers are accurate and the explanations are educational.
    `;

    // Generate quiz using LLM
    const llmResponse = await generateLLMResponse(prompt, {
      userId,
      topic,
      useRag: true,
      temperature: 0.7
    });

    // Parse the JSON response
    let quizData;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = llmResponse.response.match(/```json\n([\s\S]*?)\n```/) || 
                        llmResponse.response.match(/```\n([\s\S]*?)\n```/) ||
                        llmResponse.response.match(/{[\s\S]*?}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : llmResponse.response;
      quizData = JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing quiz JSON:', error);
      throw new Error('Failed to generate valid quiz format');
    }

    // Create assessment in database
    const assessment = new Assessment({
      title: quizData.title,
      description: quizData.description,
      syllabus: syllabusId,
      user: userId,
      questions: quizData.questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.options[q.correctAnswer],
        explanation: q.explanation,
        difficulty: q.difficulty || difficulty,
        topics: q.topics || [topic],
        points: 1
      })),
      type: 'quiz',
      timeLimit: 30,
      passingScore: 70,
      isAdaptive: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    await assessment.save();
    return assessment;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

/**
 * Grade a completed assessment
 * @param {string} assessmentId - Assessment ID
 * @param {Array} userAnswers - User's answers
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Grading results
 */
const gradeAssessment = async (assessmentId, userAnswers, userId) => {
  try {
    // Get assessment
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Calculate score
    let correctCount = 0;
    let totalPoints = 0;
    const gradedAnswers = [];

    assessment.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      const points = isCorrect ? question.points || 1 : 0;
      
      correctCount += isCorrect ? 1 : 0;
      totalPoints += points;
      
      gradedAnswers.push({
        questionIndex: index,
        selectedAnswer: userAnswer,
        isCorrect,
        points
      });
    });

    const totalPossiblePoints = assessment.questions.reduce(
      (sum, q) => sum + (q.points || 1), 
      0
    );
    
    const score = Math.round((totalPoints / totalPossiblePoints) * 100);
    const passed = score >= assessment.passingScore;

    // Record attempt
    const attempt = {
      startTime: Date.now() - 1000 * 60 * 10, // Assume 10 minutes ago
      endTime: Date.now(),
      score,
      answers: gradedAnswers,
      passed
    };

    assessment.attempts.push(attempt);
    await assessment.save();

    // Update learning history
    await updateLearningHistoryWithAssessment(userId, assessment, score);

    return {
      assessmentId,
      score,
      correctCount,
      totalQuestions: assessment.questions.length,
      passed,
      gradedAnswers,
      feedback: generateFeedback(score, assessment.passingScore)
    };
  } catch (error) {
    console.error('Error grading assessment:', error);
    throw error;
  }
};

/**
 * Update learning history with assessment results
 * @param {string} userId - User ID
 * @param {Object} assessment - Assessment object
 * @param {number} score - Assessment score
 * @returns {Promise<Object>} - Updated learning history
 */
const updateLearningHistoryWithAssessment = async (userId, assessment, score) => {
  try {
    // Get or create learning history
    let learningHistory = await LearningHistory.findOne({
      user: userId,
      topic: assessment.title.split(' - ')[0] // Extract main topic from title
    });

    if (!learningHistory) {
      learningHistory = new LearningHistory({
        user: userId,
        topic: assessment.title.split(' - ')[0],
        syllabus: assessment.syllabus,
        sessions: [],
        assessments: [],
        overallProgress: 0,
        strengths: [],
        weaknesses: [],
        lastStudied: Date.now()
      });
    }

    // Determine performance level
    let performance = 'fair';
    if (score >= 90) {
      performance = 'excellent';
    } else if (score >= 75) {
      performance = 'good';
    } else if (score < 50) {
      performance = 'poor';
    }

    // Add assessment to history
    learningHistory.assessments.push({
      assessmentId: assessment._id,
      score,
      completedAt: Date.now(),
      performance
    });

    // Update last studied time
    learningHistory.lastStudied = Date.now();

    // Recalculate overall progress
    // Weight: 70% from sessions, 30% from assessments
    const sessionProgress = learningHistory.sessions.length > 0
      ? learningHistory.sessions.reduce((sum, s) => sum + s.progress, 0) / learningHistory.sessions.length
      : 0;
    
    const assessmentProgress = learningHistory.assessments.length > 0
      ? learningHistory.assessments.reduce((sum, a) => sum + a.score, 0) / learningHistory.assessments.length
      : 0;
    
    learningHistory.overallProgress = Math.min(
      100,
      Math.round((sessionProgress * 0.7) + (assessmentProgress * 0.3))
    );

    // Update strengths and weaknesses based on assessment
    // This would require more detailed question-by-question analysis
    // For now, we'll use a simplified approach
    
    await learningHistory.save();
    return learningHistory;
  } catch (error) {
    console.error('Error updating learning history with assessment:', error);
    throw error;
  }
};

/**
 * Generate feedback based on score
 * @param {number} score - Assessment score
 * @param {number} passingScore - Passing score threshold
 * @returns {string} - Feedback message
 */
const generateFeedback = (score, passingScore) => {
  if (score >= 90) {
    return "Excellent work! You've demonstrated a strong understanding of the material.";
  } else if (score >= passingScore) {
    return "Good job! You've passed the assessment and shown a solid grasp of the concepts.";
  } else if (score >= passingScore - 10) {
    return "You're almost there! With a bit more study, you'll be able to master these concepts.";
  } else {
    return "This topic needs more attention. Consider reviewing the material and trying again.";
  }
};

/**
 * Get performance analytics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Performance analytics
 */
const getPerformanceAnalytics = async (userId) => {
  try {
    // Get all learning histories for user
    const learningHistories = await LearningHistory.find({ user: userId });
    
    // Get all assessments for user
    const assessments = await Assessment.find({ user: userId });
    
    // Calculate overall statistics
    const overallProgress = learningHistories.length > 0
      ? learningHistories.reduce((sum, h) => sum + h.overallProgress, 0) / learningHistories.length
      : 0;
    
    const assessmentScores = [];
    assessments.forEach(assessment => {
      assessment.attempts.forEach(attempt => {
        assessmentScores.push({
          title: assessment.title,
          score: attempt.score,
          date: attempt.endTime
        });
      });
    });
    
    // Sort by date
    assessmentScores.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Calculate progress over time
    const progressOverTime = learningHistories.map(history => {
      const sessions = history.sessions.sort((a, b) => 
        new Date(a.startTime) - new Date(b.startTime)
      );
      
      return {
        topic: history.topic,
        progress: sessions.map(session => ({
          date: session.startTime,
          progress: session.progress
        }))
      };
    });
    
    // Identify strengths and weaknesses
    const strengths = [];
    const weaknesses = [];
    
    learningHistories.forEach(history => {
      history.strengths.forEach(strength => {
        strengths.push({
          topic: history.topic,
          subtopic: strength.topic,
          score: strength.score
        });
      });
      
      history.weaknesses.forEach(weakness => {
        weaknesses.push({
          topic: history.topic,
          subtopic: weakness.topic,
          score: weakness.score
        });
      });
    });
    
    // Sort by score
    strengths.sort((a, b) => b.score - a.score);
    weaknesses.sort((a, b) => a.score - b.score);
    
    return {
      overallProgress,
      recentAssessments: assessmentScores.slice(0, 5),
      progressOverTime,
      topStrengths: strengths.slice(0, 3),
      topWeaknesses: weaknesses.slice(0, 3),
      totalSessionsCompleted: learningHistories.reduce((sum, h) => sum + h.sessions.length, 0),
      totalAssessmentsCompleted: assessmentScores.length,
      averageAssessmentScore: assessmentScores.length > 0
        ? assessmentScores.reduce((sum, a) => sum + a.score, 0) / assessmentScores.length
        : 0
    };
  } catch (error) {
    console.error('Error getting performance analytics:', error);
    throw error;
  }
};

module.exports = {
  generateQuiz,
  gradeAssessment,
  getPerformanceAnalytics
};
