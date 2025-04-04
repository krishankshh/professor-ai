const axios = require('axios');

/**
 * LLM Service for Professor AI
 * This service integrates with Together.ai API to provide AI tutoring capabilities
 * Using Llama 3 model for high-quality responses
 */

// Configuration for LLM
const LLM_CONFIG = {
  // Base URL for Together.ai API (configured via environment variables)
  baseUrl: process.env.LLM_API_URL || 'https://api.together.xyz',
  // Default model to use
  model: process.env.LLM_MODEL || 'togethercomputer/llama-3-8b-instruct',
  // API Key
  apiKey: process.env.RENDER_API_KEY,
  // Default parameters
  defaultParams: {
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 1024
  }
};

/**
 * Generate a response from the AI tutor based on user input and context
 * @param {string} userMessage - The message from the user
 * @param {Object} context - Additional context for personalization
 * @returns {Promise<string>} - The AI-generated response
 */
const generateAIResponse = async (userMessage, context = {}) => {
  try {
    // Extract context information
    const { sessionHistory = [], userBackground = '', topic = '', learningPreferences = {} } = context;
    
    // Build conversation history for context
    const conversationHistory = sessionHistory.map(interaction => ({
      role: 'user',
      content: interaction.question
    })).concat(sessionHistory.map(interaction => ({
      role: 'assistant',
      content: interaction.answer
    })));
    
    // Create system prompt with personalization
    const systemPrompt = createPersonalizedSystemPrompt(userBackground, topic, learningPreferences);
    
    // Prepare the prompt for the LLM
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];
    
    // Call the LLM API
    const response = await callLLMAPI(messages);
    
    return response;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Could you try again?";
  }
};

/**
 * Create a personalized system prompt based on user information
 * @param {string} userBackground - User's academic background
 * @param {string} topic - Current topic being discussed
 * @param {Object} learningPreferences - User's learning preferences
 * @returns {string} - Personalized system prompt
 */
const createPersonalizedSystemPrompt = (userBackground, topic, learningPreferences) => {
  // Adjust teaching style based on academic background
  let complexityLevel = 'intermediate';
  switch (userBackground) {
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
    default:
      complexityLevel = 'intermediate';
  }
  
  // Extract learning preferences
  const { 
    preferredExamples = 'practical',
    communicationStyle = 'conversational',
    detailLevel = 'balanced'
  } = learningPreferences;
  
  // Build the system prompt
  return `
    You are Professor AI, a personalized AI tutor specializing in ${topic || 'various subjects'}.
    
    Your teaching approach:
    - Complexity level: ${complexityLevel}
    - Example style: ${preferredExamples}
    - Communication style: ${communicationStyle}
    - Detail level: ${detailLevel}
    
    Guidelines:
    - Be engaging, friendly, and occasionally use humor to make learning enjoyable
    - Adapt explanations to the student's academic background (${userBackground || 'general'})
    - Break down complex concepts into understandable parts
    - Use analogies and examples to illustrate concepts
    - Ask questions to check understanding
    - Provide encouragement and positive reinforcement
    - Be concise but thorough in your explanations
    
    The current topic is: ${topic || 'to be determined based on the student\'s questions'}
    
    Respond to the student's questions in a helpful, accurate, and educational manner.
  `;
};

/**
 * Call the LLM API with the prepared messages
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Promise<string>} - The LLM-generated response
 */
const callLLMAPI = async (messages) => {
  try {
    // For Together.ai API
    const response = await axios.post(`${LLM_CONFIG.baseUrl}/v1/chat/completions`, {
      model: LLM_CONFIG.model,
      messages,
      temperature: LLM_CONFIG.defaultParams.temperature,
      top_p: LLM_CONFIG.defaultParams.top_p,
      max_tokens: LLM_CONFIG.defaultParams.max_tokens
    }, {
      headers: {
        'Authorization': `Bearer ${LLM_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling LLM API:', error);
    throw error;
  }
};

/**
 * Initialize the LLM service
 * This function can be used to set up any necessary configurations or connections
 */
const initLLMService = async () => {
  try {
    console.log(`Initializing LLM service with model: ${LLM_CONFIG.model}`);
    // Check if the LLM API is available and API key is valid
    await axios.get(`${LLM_CONFIG.baseUrl}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${LLM_CONFIG.apiKey}`
      }
    });
    console.log('LLM API is available and API key is valid');
    return true;
  } catch (error) {
    console.error('Error initializing LLM service:', error);
    console.warn('LLM service will use fallback responses');
    return false;
  }
};

module.exports = {
  generateAIResponse,
  initLLMService
};
