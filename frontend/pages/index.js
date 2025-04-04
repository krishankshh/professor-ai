import React, { useState, useEffect } from 'react';
import { tutoringService } from '../src/services/api';

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      content: 'Hello! I\'m Professor AI, your personalized AI tutor. How can I help you today?'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    try {
      // Add user message to chat
      const userMessage = {
        sender: 'user',
        content: message
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Show loading state
      setLoading(true);
      setResponse('Connecting to AI tutor...');
      
      // Call the API
      const result = await tutoringService.sendChatMessage(message);
      
      // Add AI response to chat
      const aiMessage = {
        sender: 'ai',
        content: result.response
      };
      setMessages(prev => [...prev, aiMessage]);
      setResponse(result.response);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error connecting to AI tutor. Please try again.');
      
      // Add error message to chat
      const errorMessage = {
        sender: 'ai',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2c3e50', textAlign: 'center' }}>Professor AI - Personalized Tutoring System</h1>
      <p style={{ textAlign: 'center', marginBottom: '20px' }}>Ask any question to get started with your personalized learning experience</p>
      
      <div style={{ marginBottom: '20px', maxHeight: '400px', overflowY: 'auto', padding: '10px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{ 
              marginBottom: '10px',
              textAlign: msg.sender === 'user' ? 'right' : 'left',
            }}
          >
            <div style={{ 
              display: 'inline-block',
              padding: '10px 15px',
              borderRadius: '10px',
              maxWidth: '80%',
              backgroundColor: msg.sender === 'user' ? '#3498db' : '#f8f9fa',
              color: msg.sender === 'user' ? 'white' : '#333',
              border: msg.sender === 'user' ? 'none' : '1px solid #e9ecef'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Ask your question here...'
            style={{ width: '100%', height: '100px', marginBottom: '10px', padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '16px' }}
            disabled={loading}
          />
        </div>
        <button 
          type='submit' 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: loading ? '#95a5a6' : '#3498db', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            fontSize: '16px', 
            fontWeight: 'bold' 
          }}
          disabled={!message.trim() || loading}
        >
          {loading ? 'Sending...' : 'Send Question'}
        </button>
      </form>
      
      <div style={{ marginTop: '40px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '8px', fontSize: '14px' }}>
        <h3 style={{ color: '#2c3e50', marginTop: '0' }}>About Professor AI</h3>
        <p>Professor AI is an AI-powered personalized tutoring system that adapts to your learning style and academic background. The full version includes:</p>
        <ul>
          <li>Personalized learning paths based on your goals</li>
          <li>Interactive tutoring sessions with an AI tutor</li>
          <li>Assessments to test your knowledge</li>
          <li>Progress tracking and recommendations</li>
        </ul>
      </div>
    </div>
  );
}
