import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const AssessmentQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [showResults, setShowResults] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [answers, setAnswers] = React.useState([]);
  
  // Mock quiz data - in a real app, this would come from the API
  const quizData = {
    title: "Introduction to Machine Learning",
    description: "Test your knowledge of basic machine learning concepts",
    questions: [
      {
        id: 1,
        question: "What is supervised learning?",
        options: [
          "Learning without any labeled data",
          "Learning with labeled data where the model is trained to predict outputs",
          "Learning by reinforcement through trial and error",
          "Learning by clustering similar data points"
        ],
        correctAnswer: 1,
        explanation: "Supervised learning uses labeled data to train models to predict outputs based on inputs."
      },
      {
        id: 2,
        question: "Which of the following is NOT a type of machine learning?",
        options: [
          "Supervised learning",
          "Unsupervised learning",
          "Reinforcement learning",
          "Deterministic learning"
        ],
        correctAnswer: 3,
        explanation: "Deterministic learning is not a standard type of machine learning. The main types are supervised, unsupervised, and reinforcement learning."
      },
      {
        id: 3,
        question: "What is the purpose of a loss function in machine learning?",
        options: [
          "To measure how well the model is performing",
          "To generate random data for training",
          "To create visualizations of the data",
          "To store the trained model parameters"
        ],
        correctAnswer: 0,
        explanation: "A loss function measures the difference between the model's predictions and the actual values, indicating how well the model is performing."
      },
      {
        id: 4,
        question: "What is overfitting in machine learning?",
        options: [
          "When a model performs poorly on both training and test data",
          "When a model performs well on training data but poorly on test data",
          "When a model performs poorly on training data but well on test data",
          "When a model requires too much computational power"
        ],
        correctAnswer: 1,
        explanation: "Overfitting occurs when a model learns the training data too well, including its noise and outliers, causing it to perform poorly on new, unseen data."
      },
      {
        id: 5,
        question: "Which algorithm is commonly used for classification problems?",
        options: [
          "Linear regression",
          "K-means clustering",
          "Random forest",
          "Principal Component Analysis (PCA)"
        ],
        correctAnswer: 2,
        explanation: "Random forest is a popular algorithm for classification problems, using an ensemble of decision trees to make predictions."
      }
    ]
  };
  
  // Handle selecting an answer
  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };
  
  // Handle moving to the next question
  const handleNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      answers.forEach((answer, index) => {
        if (answer === quizData.questions[index].correctAnswer) {
          correctCount++;
        }
      });
      setScore(correctCount);
      setShowResults(true);
    }
  };
  
  // Handle moving to the previous question
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  // Handle retaking the quiz
  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setShowResults(false);
    setScore(0);
    setAnswers([]);
  };
  
  // Current question data
  const question = quizData.questions[currentQuestion];
  
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {!showResults ? (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{quizData.title}</h2>
            <p className="text-gray-600">{quizData.description}</p>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestion + 1} of {quizData.questions.length}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(((currentQuestion + 1) / quizData.questions.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
            
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div 
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion] === index 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                      answers[currentQuestion] === index 
                        ? 'border-primary-500 bg-primary-500' 
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestion] === index && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={handleNextQuestion}
              disabled={answers[currentQuestion] === undefined}
              className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion === quizData.questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Quiz Results</h2>
            <p className="text-gray-600">You scored {score} out of {quizData.questions.length}</p>
            
            <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full ${
                  score / quizData.questions.length >= 0.7 
                    ? 'bg-green-500' 
                    : score / quizData.questions.length >= 0.4 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`}
                style={{ width: `${(score / quizData.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-8 space-y-6">
            {quizData.questions.map((q, index) => (
              <div key={q.id} className="text-left p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">{index + 1}. {q.question}</h3>
                
                <div className="space-y-2 mb-3">
                  {q.options.map((option, optIndex) => (
                    <div 
                      key={optIndex}
                      className={`p-2 rounded ${
                        optIndex === q.correctAnswer && answers[index] === optIndex
                          ? 'bg-green-100 border border-green-300'
                          : optIndex !== q.correctAnswer && answers[index] === optIndex
                            ? 'bg-red-100 border border-red-300'
                            : optIndex === q.correctAnswer
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {option}
                      {optIndex === q.correctAnswer && (
                        <span className="ml-2 text-green-600 text-sm">✓ Correct</span>
                      )}
                      {optIndex !== q.correctAnswer && answers[index] === optIndex && (
                        <span className="ml-2 text-red-600 text-sm">✗ Incorrect</span>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRetakeQuiz}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
            >
              Retake Quiz
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-primary-600 text-white rounded-md"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentQuiz;
