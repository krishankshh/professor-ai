const { enhancePromptWithRAG } = require('./enhancedRagService');
const { generatePersonalizedSystemPrompt } = require('./personalizationService');
const axios = require('axios');
const LearningSession = require('../models/LearningSession');

/**
 * Enhanced LLM Service for Professor AI
 * This service integrates open-source LLMs with RAG and personalization
 */

// Configuration for LLM
const LLM_CONFIG = {
  // Base URL for LLM API (will be configurable via environment variables)
  baseUrl: process.env.LLM_API_URL || 'http://localhost:11434',
  // Default model to use
  model: process.env.LLM_MODEL || 'llama3',
  // Default system prompt
  defaultSystemPrompt: `
    You are Professor AI, a personalized AI tutor.
    
    Your teaching approach:
    - Be engaging, friendly, and occasionally use humor to make learning enjoyable
    - Break down complex concepts into understandable parts
    - Use analogies and examples to illustrate concepts
    - Ask questions to check understanding
    - Provide encouragement and positive reinforcement
    
    Respond to the student's questions in a helpful, accurate, and educational manner.
  `
};

/**
 * Initialize the LLM service
 * @returns {Promise<boolean>} - Whether initialization was successful
 */
const initLLMService = async () => {
  try {
    console.log('Initializing enhanced LLM service');
    // Check if LLM API is available
    const response = await axios.get(`${LLM_CONFIG.baseUrl}/api/health`);
    return response.status === 200;
  } catch (error) {
    console.error('Error initializing LLM service:', error);
    console.log('LLM service will run in mock mode for development');
    return false;
  }
};

/**
 * Generate a response from the LLM
 * @param {string} prompt - User prompt
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - LLM response
 */
const generateLLMResponse = async (prompt, options = {}) => {
  try {
    const { 
      systemPrompt = LLM_CONFIG.defaultSystemPrompt,
      temperature = 0.7,
      maxTokens = 1024,
      userId = null,
      sessionId = null,
      topic = null,
      useRag = true
    } = options;
    
    // Enhance prompt with RAG if enabled
    let enhancedPrompt = prompt;
    let retrievedDocuments = [];
    
    if (useRag) {
      const ragResult = await enhancePromptWithRAG(prompt, {
        userId,
        sessionId,
        topic
      });
      
      enhancedPrompt = ragResult.enhancedPrompt;
      retrievedDocuments = ragResult.documents;
    }
    
    // Get personalized system prompt if userId is provided
    let personalizedSystemPrompt = systemPrompt;
    if (userId && topic) {
      personalizedSystemPrompt = await generatePersonalizedSystemPrompt(userId, topic);
    }
    
    // Call the LLM API
    const response = await axios.post(`${LLM_CONFIG.baseUrl}/api/chat`, {
      model: LLM_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: personalizedSystemPrompt
        },
        {
          role: 'user',
          content: enhancedPrompt
        }
      ],
      temperature,
      max_tokens: maxTokens
    });
    
    // Extract the response content
    const llmResponse = response.data.choices[0].message.content;
    
    // If session ID is provided, update the learning session
    if (sessionId) {
      await updateLearningSession(sessionId, prompt, llmResponse, retrievedDocuments);
    }
    
    return {
      response: llmResponse,
      documents: retrievedDocuments
    };
  } catch (error) {
    console.error('Error generating LLM response:', error);
    
    // Return a fallback response for development
    return {
      response: `I apologize, but I'm having trouble connecting to my knowledge base at the moment. Let me provide a general answer based on what I know.
      
      ${generateFallbackResponse(prompt)}
      
      If you have more specific questions, please ask and I'll do my best to help.`,
      documents: []
    };
  }
};

/**
 * Update a learning session with new interaction
 * @param {string} sessionId - Learning session ID
 * @param {string} question - User question
 * @param {string} answer - AI answer
 * @param {Array} documents - Retrieved documents
 * @returns {Promise<Object>} - Updated session
 */
const updateLearningSession = async (sessionId, question, answer, documents = []) => {
  try {
    // Get session
    const session = await LearningSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Extract relevant topics from documents
    const relevantTopics = documents.map(doc => doc.topic).filter(Boolean);
    
    // Add interaction to session
    session.interactions.push({
      question,
      answer,
      timestamp: Date.now(),
      relevantTopics,
      aiConfidence: 0.9 // Default confidence
    });
    
    // Update session
    session.updatedAt = Date.now();
    
    // Save session
    await session.save();
    
    return session;
  } catch (error) {
    console.error('Error updating learning session:', error);
    throw error;
  }
};

/**
 * Generate a fallback response for development
 * @param {string} prompt - User prompt
 * @returns {string} - Fallback response
 */
const generateFallbackResponse = (prompt) => {
  // Simple keyword-based fallback for development
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('machine learning')) {
    return 'Machine learning is a field of artificial intelligence that uses statistical techniques to give computer systems the ability to "learn" from data, without being explicitly programmed. The process of learning begins with observations or data, such as examples, direct experience, or instruction.';
  } else if (promptLower.includes('python')) {
    return 'Python is a high-level, interpreted programming language known for its readability and simplicity. It supports multiple programming paradigms, including procedural, object-oriented, and functional programming.';
  } else if (promptLower.includes('math') || promptLower.includes('mathematics')) {
    return 'Mathematics is the study of numbers, quantities, and shapes. It is essential in many fields, including natural science, engineering, medicine, finance, and social sciences.';
  } else {
    return 'I understand you\'re asking about this topic. In a normal operation, I would provide a detailed and personalized response based on my knowledge and relevant documents.';
  }
};

module.exports = {
  initLLMService,
  generateLLMResponse
};
