const axios = require('axios');
const Document = require('../models/Document');

/**
 * Enhanced RAG (Retrieval-Augmented Generation) Service for Professor AI
 * This service provides advanced document retrieval and embedding functionality
 * to enhance LLM responses with relevant information
 */

// Configuration for embedding model
const EMBEDDING_CONFIG = {
  // Base URL for embedding API (will be configurable via environment variables)
  baseUrl: process.env.EMBEDDING_API_URL || 'http://localhost:11434',
  // Default model to use for embeddings
  model: process.env.EMBEDDING_MODEL || 'llama3',
  // Embedding dimensions
  dimensions: 384
};

/**
 * Initialize the RAG service
 * @returns {Promise<boolean>} - Whether initialization was successful
 */
const initRAGService = async () => {
  try {
    console.log('Initializing enhanced RAG service');
    // In a production environment, this would connect to a vector database
    // and load any necessary models for embedding generation
    return true;
  } catch (error) {
    console.error('Error initializing RAG service:', error);
    return false;
  }
};

/**
 * Generate embeddings for text using the embedding model
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<Array>} - Embedding vector
 */
const generateEmbedding = async (text) => {
  try {
    // Call the embedding API
    const response = await axios.post(`${EMBEDDING_CONFIG.baseUrl}/api/embeddings`, {
      model: EMBEDDING_CONFIG.model,
      input: text,
      encoding_format: 'float'
    });
    
    return response.data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Fallback to a simple mock embedding for development
    return Array.from({ length: EMBEDDING_CONFIG.dimensions }, () => Math.random());
  }
};

/**
 * Add a document to the knowledge base with embeddings
 * @param {Object} documentData - Document data to add
 * @returns {Promise<Object>} - Added document
 */
const addDocument = async (documentData) => {
  try {
    // Generate embeddings for the document content
    const embedding = await generateEmbedding(documentData.content);
    
    // Create new document with embeddings
    const document = new Document({
      ...documentData,
      embeddings: { vector: embedding },
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    // Save document to database
    await document.save();
    
    return document;
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
    const { limit = 3, threshold = 0.7, topic = null, userId = null } = options;
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Find all documents that match optional filters
    let documents = await Document.find(
      topic ? { topic } : {}
    );
    
    // If userId is provided, include only documents created by the user or public documents
    if (userId) {
      documents = documents.filter(doc => 
        doc.user?.toString() === userId.toString() || doc.isPublic === true
      );
    }
    
    // Calculate similarity for each document
    const documentsWithSimilarity = await Promise.all(
      documents.map(async (doc) => {
        // If document doesn't have embeddings, generate them
        if (!doc.embeddings || !doc.embeddings.vector) {
          const embedding = await generateEmbedding(doc.content);
          doc.embeddings = { vector: embedding };
          await doc.save();
        }
        
        // Calculate cosine similarity
        const similarity = calculateCosineSimilarity(
          queryEmbedding, 
          doc.embeddings.vector
        );
        
        return {
          ...doc.toObject(),
          similarity
        };
      })
    );
    
    // Filter by similarity threshold
    const relevantDocuments = documentsWithSimilarity
      .filter(doc => doc.similarity > threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    // Update usage statistics for retrieved documents
    await Promise.all(
      relevantDocuments.map(async (doc) => {
        await Document.findByIdAndUpdate(doc._id, {
          $inc: { usageCount: 1 },
          lastUsed: Date.now()
        });
      })
    );
    
    return relevantDocuments;
  } catch (error) {
    console.error('Error searching documents:', error);
    return [];
  }
};

/**
 * Enhance a prompt with relevant information from the knowledge base
 * @param {string} userMessage - The user's message
 * @param {Object} context - Additional context
 * @returns {Promise<Object>} - Enhanced prompt and retrieved documents
 */
const enhancePromptWithRAG = async (userMessage, context = {}) => {
  try {
    const { topic = null, userId = null, sessionId = null } = context;
    
    // Search for relevant documents
    const relevantDocs = await searchRelevantDocuments(userMessage, {
      limit: 5,
      topic,
      userId
    });
    
    // If no relevant documents found, return original message
    if (relevantDocs.length === 0) {
      return {
        enhancedPrompt: userMessage,
        documents: []
      };
    }
    
    // Construct enhanced prompt with retrieved information
    const retrievedInfo = relevantDocs
      .map((doc, index) => 
        `[Document ${index + 1}] ${doc.title}\n${doc.content}\n`
      )
      .join('\n');
    
    const enhancedPrompt = `
I need information about the following question:
${userMessage}

Here is some relevant information that might help:
${retrievedInfo}

Based on this information and your knowledge, please provide a comprehensive answer to the question.
Include citations to the documents when appropriate using [Document X] notation.
`;
    
    return {
      enhancedPrompt,
      documents: relevantDocs
    };
  } catch (error) {
    console.error('Error enhancing prompt with RAG:', error);
    return {
      enhancedPrompt: userMessage,
      documents: []
    };
  }
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

/**
 * Create a batch of documents from a syllabus
 * @param {Object} syllabus - Syllabus object
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Created documents
 */
const createDocumentsFromSyllabus = async (syllabus, userId) => {
  try {
    const documents = [];
    
    // Create a document for the syllabus overview
    const overviewDoc = await addDocument({
      title: `${syllabus.title} - Overview`,
      content: syllabus.description,
      topic: syllabus.title,
      syllabus: syllabus._id,
      user: userId,
      source: 'system_generated',
      contentType: 'text',
      tags: ['overview', ...syllabus.tags || []],
      isVerified: true
    });
    
    documents.push(overviewDoc);
    
    // Create documents for each topic in the syllabus
    for (const topic of syllabus.topics) {
      if (topic.content) {
        const topicDoc = await addDocument({
          title: `${syllabus.title} - ${topic.title}`,
          content: topic.content,
          topic: syllabus.title,
          syllabus: syllabus._id,
          user: userId,
          source: 'system_generated',
          contentType: 'text',
          tags: [topic.title, ...syllabus.tags || []],
          isVerified: true
        });
        
        documents.push(topicDoc);
      }
    }
    
    return documents;
  } catch (error) {
    console.error('Error creating documents from syllabus:', error);
    throw error;
  }
};

module.exports = {
  initRAGService,
  addDocument,
  searchRelevantDocuments,
  enhancePromptWithRAG,
  generateEmbedding,
  createDocumentsFromSyllabus
};
