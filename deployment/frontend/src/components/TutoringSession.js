import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTutoring } from '../context/TutoringContext';

const TutoringSession = () => {
  const { user } = useAuth();
  const { 
    currentSession, 
    messages, 
    startSession, 
    sendMessage, 
    endSession, 
    loading 
  } = useTutoring();
  
  const [topic, setTopic] = React.useState('');
  const [syllabusId, setSyllabusId] = React.useState('');
  const [syllabi, setSyllabi] = React.useState([]);
  const [isStarting, setIsStarting] = React.useState(false);
  
  const chatContainerRef = React.useRef(null);
  
  // Fetch user's syllabi
  React.useEffect(() => {
    const fetchSyllabi = async () => {
      try {
        // In a real implementation, this would be an API call
        // const data = await syllabusService.getAllSyllabi();
        
        // Mock data for now
        const data = [
          {
            id: '1',
            title: 'Machine Learning Fundamentals',
            difficulty: 'intermediate'
          },
          {
            id: '2',
            title: 'Python for Data Science',
            difficulty: 'beginner'
          }
        ];
        
        setSyllabi(data);
      } catch (error) {
        console.error('Error fetching syllabi:', error);
      }
    };
    
    fetchSyllabi();
  }, []);
  
  // Scroll to bottom of chat when messages change
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Handle starting a new session
  const handleStartSession = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      return;
    }
    
    try {
      setIsStarting(true);
      await startSession(topic, syllabusId || null);
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setIsStarting(false);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const message = formData.get('message');
    
    if (!message.trim() || loading) {
      return;
    }
    
    try {
      form.reset();
      await sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Handle ending the session
  const handleEndSession = async () => {
    try {
      await endSession();
      setTopic('');
      setSyllabusId('');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Professor AI</h1>
          {currentSession && (
            <button
              onClick={handleEndSession}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
            >
              End Session
            </button>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col p-6">
        {!currentSession ? (
          /* Session setup form */
          <div className="max-w-md mx-auto w-full bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Start a New Tutoring Session</h2>
            
            <form onSubmit={handleStartSession}>
              <div className="mb-4">
                <label htmlFor="topic" className="block text-gray-700 font-medium mb-2">
                  What would you like to learn about?
                </label>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Machine Learning, Python, Calculus"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="syllabus" className="block text-gray-700 font-medium mb-2">
                  Select a syllabus (optional)
                </label>
                <select
                  id="syllabus"
                  value={syllabusId}
                  onChange={(e) => setSyllabusId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">None (Free-form tutoring)</option>
                  {syllabi.map((syllabus) => (
                    <option key={syllabus.id} value={syllabus.id}>
                      {syllabus.title} ({syllabus.difficulty})
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                type="submit"
                disabled={isStarting || !topic.trim()}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isStarting ? 'Starting Session...' : 'Start Tutoring Session'}
              </button>
            </form>
          </div>
        ) : (
          /* Chat interface */
          <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
            {/* Chat header */}
            <div className="bg-primary-600 text-white p-4">
              <h2 className="text-xl font-semibold">{currentSession.topic}</h2>
              <p className="text-sm opacity-80">Session with Professor AI</p>
            </div>
            
            {/* Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 p-4 overflow-y-auto"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      msg.sender === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="text-left mb-4">
                  <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="message"
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={loading}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  disabled={loading}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default TutoringSession;
