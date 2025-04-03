import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TutoringProvider } from './context/TutoringContext';

// Components
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import OnboardingFlow from './components/OnboardingFlow';
import TutoringSession from './components/TutoringSession';
import AssessmentQuiz from './components/AssessmentQuiz';
import SyllabusCreator from './components/SyllabusCreator';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <TutoringProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/onboarding" element={<OnboardingFlow />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tutoring" 
                element={
                  <ProtectedRoute>
                    <TutoringSession />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/assessment" 
                element={
                  <ProtectedRoute>
                    <AssessmentQuiz />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/syllabus/create" 
                element={
                  <ProtectedRoute>
                    <SyllabusCreator />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect root to dashboard or login */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </TutoringProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
