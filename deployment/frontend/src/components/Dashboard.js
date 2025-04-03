import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = React.useState([]);
  const [syllabi, setSyllabi] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Fetch user's learning sessions and syllabi
  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, these would be API calls
        // const sessionsData = await tutoringService.getSessions();
        // const syllabiData = await syllabusService.getAllSyllabi();
        
        // Mock data for now
        const sessionsData = [
          {
            id: '1',
            topic: 'Introduction to Machine Learning',
            startTime: new Date(Date.now() - 86400000), // 1 day ago
            endTime: new Date(Date.now() - 82800000),   // 23 hours ago
            progress: 75
          },
          {
            id: '2',
            topic: 'Python Programming Basics',
            startTime: new Date(Date.now() - 172800000), // 2 days ago
            endTime: new Date(Date.now() - 169200000),   // 47 hours ago
            progress: 100
          }
        ];
        
        const syllabiData = [
          {
            id: '1',
            title: 'Machine Learning Fundamentals',
            description: 'A comprehensive introduction to machine learning concepts',
            topics: [
              { title: 'Introduction to ML', order: 0 },
              { title: 'Supervised Learning', order: 1 },
              { title: 'Unsupervised Learning', order: 2 }
            ],
            difficulty: 'intermediate'
          },
          {
            id: '2',
            title: 'Python for Data Science',
            description: 'Learn Python programming for data analysis and visualization',
            topics: [
              { title: 'Python Basics', order: 0 },
              { title: 'Data Structures', order: 1 },
              { title: 'NumPy and Pandas', order: 2 }
            ],
            difficulty: 'beginner'
          }
        ];
        
        setSessions(sessionsData);
        setSyllabi(syllabiData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name || 'Student'}</h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>
        <button
          onClick={logout}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-primary-50 p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-primary-800 mb-2">Learning Sessions</h3>
          <p className="text-4xl font-bold text-primary-600">{sessions.length}</p>
          <p className="text-gray-600">Total sessions</p>
        </div>
        
        <div className="bg-secondary-50 p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-secondary-800 mb-2">Syllabi</h3>
          <p className="text-4xl font-bold text-secondary-600">{syllabi.length}</p>
          <p className="text-gray-600">Custom learning paths</p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-green-800 mb-2">Progress</h3>
          <p className="text-4xl font-bold text-green-600">
            {sessions.length > 0
              ? Math.round(sessions.reduce((acc, session) => acc + session.progress, 0) / sessions.length)
              : 0}%
          </p>
          <p className="text-gray-600">Average completion</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Sessions</h2>
          
          {sessions.length === 0 ? (
            <p className="text-gray-500">No learning sessions yet. Start one now!</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{session.topic}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(session.startTime)}
                      </p>
                    </div>
                    <div className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {session.progress}% complete
                    </div>
                  </div>
                  
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full"
                      style={{ width: `${session.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              
              <button className="text-primary-600 hover:text-primary-800 font-medium">
                View all sessions
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Syllabi</h2>
          
          {syllabi.length === 0 ? (
            <p className="text-gray-500">No syllabi created yet. Create one to customize your learning!</p>
          ) : (
            <div className="space-y-4">
              {syllabi.map((syllabus) => (
                <div key={syllabus.id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{syllabus.title}</h3>
                      <p className="text-sm text-gray-600">
                        {syllabus.topics.length} topics • {syllabus.difficulty} level
                      </p>
                    </div>
                    <button className="text-primary-600 hover:text-primary-800 text-sm">
                      Start Learning
                    </button>
                  </div>
                  <p className="text-gray-700 text-sm mt-1">{syllabus.description}</p>
                </div>
              ))}
              
              <button className="text-primary-600 hover:text-primary-800 font-medium">
                Create new syllabus
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Start</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
            <h3 className="font-semibold text-lg text-primary-700">New Tutoring Session</h3>
            <p className="text-sm text-gray-600">Start learning with your AI tutor</p>
          </button>
          
          <button className="p-4 border-2 border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
            <h3 className="font-semibold text-lg text-secondary-700">Create Syllabus</h3>
            <p className="text-sm text-gray-600">Customize your learning path</p>
          </button>
          
          <button className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors">
            <h3 className="font-semibold text-lg text-green-700">Take Assessment</h3>
            <p className="text-sm text-gray-600">Test your knowledge</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
