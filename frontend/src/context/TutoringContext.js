import React, { createContext, useState, useContext } from 'react';
import { tutoringService } from '../services/api';

// Create tutoring context
const TutoringContext = createContext();

// Tutoring provider component
export const TutoringProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Start a new tutoring session
  const startSession = async (topic, syllabusId) => {
    try {
      setLoading(true);
      setError(null);
      const session = await tutoringService.startSession(topic, syllabusId);
      setCurrentSession(session);
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          content: `Hello! I'm your AI tutor for ${topic}. How can I help you today?`,
          timestamp: new Date(),
        },
      ]);
      return session;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send a message in the current session
  const sendMessage = async (message) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add user message to the list
      const userMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        content: message,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, userMessage]);
      
      let response;
      
      // If there's an active session, use session-based chat
      if (currentSession) {
        response = await tutoringService.sendMessage(currentSession.id, message);
      } else {
        // Otherwise use the simple chat endpoint
        response = await tutoringService.sendChatMessage(message);
      }
      
      // Add AI response to the list
      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: response.message || response.response, // Handle both response formats
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // End the current session
  const endSession = async () => {
    if (!currentSession) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await tutoringService.endSession(currentSession.id);
      setCurrentSession(null);
      setMessages([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to end session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user's previous sessions
  const getPreviousSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessions = await tutoringService.getSessions();
      return sessions;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get sessions');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Start a simple chat without session (for testing)
  const startSimpleChat = () => {
    setCurrentSession(null);
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        content: `Hello! I'm Professor AI, your personal AI tutor. How can I help you today?`,
        timestamp: new Date(),
      },
    ]);
  };

  // Context value
  const value = {
    currentSession,
    messages,
    loading,
    error,
    startSession,
    sendMessage,
    endSession,
    getPreviousSessions,
    startSimpleChat,
  };

  return <TutoringContext.Provider value={value}>{children}</TutoringContext.Provider>;
};

// Custom hook to use tutoring context
export const useTutoring = () => {
  const context = useContext(TutoringContext);
  if (!context) {
    throw new Error('useTutoring must be used within a TutoringProvider');
  }
  return context;
};

export default TutoringContext;
