const axios = require('axios');

/**
 * RAG (Retrieval-Augmented Generation) Service for Professor AI
 * This service enhances LLM responses with relevant information from the knowledge base
 */

// Vector database configuration (using simple in-memory for prototype)
// In production, this would be replaced with a proper vector database like Pinecone, Weaviate, etc.
let documentVectors = [];

/**
 * Initialize the RAG service
 * @returns {Promise<boolean>} - Whether initialization was successful
 */
const initRAGService = async () => {
  try {
    console.log('Initializing RAG service');
    // In a production environment, this would connect to a vector database
    // and load any necessary models for embedding generation
    return true;
  } catch (error) {
    console.error('Error initializing RAG service:', error);
    return false;
  }
};

/**
 * Add a document to the knowledge base
 * @param {Object} document - Document to add
 * @returns {Promise<Object>} - Added document with vector
 */
const addDocument = async (document) => {
  try {
    // Generate embeddings for the document
    const embedding = await generateEmbedding(document.content);
    
    // Store document with its embedding
    const documentWithVector = {
      ...document,
      vector: embedding,
      id: Date.now().toString() // Simple ID generation for prototype
    };
    
    documentVectors.push(documentWithVector);
    return documentWithVector;
  } catch (error) {
    console.error('Error adding document to RAG:', error);
    throw error;
  }
};

/**
 * Search for relevant documents based on a query
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Relevant documents
 */
const searchRelevantDocuments = async (query, options = {}) => {
  try {
    const { limit = 3, threshold = 0.7, topic = null } = options;
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Find relevant documents by calculating similarity
    let results = documentVectors
      .map(doc => ({
        ...doc,
        similarity: calculateCosineSimilarity(queryEmbedding, doc.vector)
      }))
      .filter(doc => doc.similarity > threshold);
    
    // Filter by topic if provided
    if (topic) {
      results = results.filter(doc => doc.topic === topic);
    }
    
    // Sort by similarity and limit results
    results.sort((a, b) => b.similarity - a.similarity);
    results = results.slice(0, limit);
    
    return results.map(({ id, title, content, similarity, metadata }) => ({
      id, title, content, similarity, metadata
    }));
  } catch (error) {
    console.error('Error searching documents:', error);
    return [];
  }
};

/**
 * Enhance a prompt with relevant information from the knowledge base
 * @param {string} userMessage - The user's message
 * @param {Object} context - Additional context
 * @returns {Promise<string>} - Enhanced prompt
 */
const enhancePromptWithRAG = async (userMessage, context = {}) => {
  try {
    const { topic = null } = context;
    
    // Search for relevant documents
    const relevantDocs = await searchRelevantDocuments(userMessage, {
      limit: 3,
      topic
    });
    
    // If no relevant documents found, return original message
    if (relevantDocs.length === 0) {
      return userMessage;
    }
    
    // Construct enhanced prompt with retrieved information
    const retrievedInfo = relevantDocs
      .map(doc => `--- Document: ${doc.title} ---\n${doc.content}\n`)
      .join('\n');
    
    const enhancedPrompt = `
I need information about the following question:
${userMessage}

Here is some relevant information that might help:
${retrievedInfo}

Based on this information and your knowledge, please provide a comprehensive answer to the question.
`;
    
    return enhancedPrompt;
  } catch (error) {
    console.error('Error enhancing prompt with RAG:', error);
    return userMessage; // Fallback to original message
  }
};

/**
 * Generate embedding for text using the LLM API
 * In production, this would use a dedicated embedding model
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<Array>} - Embedding vector
 */
const generateEmbedding = async (text) => {
  // Simplified embedding generation for prototype
  // In production, this would use a proper embedding model
  
  // This is a very simplified mock implementation
  // It creates a random vector of length 384 (common embedding size)
  // In a real implementation, this would call an embedding API
  return Array.from({ length: 384 }, () => Math.random());
};

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {number} - Similarity score (0-1)
 */
const calculateCosineSimilarity = (vecA, vecB) => {
  // Ensure vectors are of the same length
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must be of the same length');
  }
  
  // Calculate dot product
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  // Calculate magnitude
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  // Calculate cosine similarity
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
};

module.exports = {
  initRAGService,
  addDocument,
  searchRelevantDocuments,
  enhancePromptWithRAG
};
