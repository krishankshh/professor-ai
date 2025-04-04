# Professor AI - Deployment and Usage Guide

This comprehensive guide provides instructions for deploying and using the Professor AI application through various methods.

## Table of Contents
1. [Overview](#overview)
2. [Local Development](#local-development)
3. [GitHub Codespaces Deployment](#github-codespaces-deployment)
4. [Render Deployment](#render-deployment)
5. [MongoDB Configuration](#mongodb-configuration)
6. [Environment Variables](#environment-variables)
7. [Testing the Application](#testing-the-application)
8. [Troubleshooting](#troubleshooting)

## Overview

Professor AI is an AI-powered personalized tutoring system that provides adaptive, engaging, and real-time learning experiences for students. The system uses an open-source LLM (Llama 3) through Together.ai's API to deliver human-like tutoring experiences.

### Key Features
- Personalized learning paths based on user's academic background
- Real-time AI chat with human-like interactions
- Adaptive difficulty adjustment
- Integrated assessments and knowledge retention tracking
- MongoDB integration for storing user data and learning materials

### Technical Stack
- **Frontend**: Next.js with React
- **Backend**: Node.js with Express
- **Database**: MongoDB Atlas
- **AI Model**: Llama 3 via Together.ai API
- **Deployment**: Render.com

## Local Development

### Prerequisites
- Node.js (v16+)
- Git
- MongoDB (optional for local development, as the app is configured to use MongoDB Atlas)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/krishankshh/professor-ai.git
   cd professor-ai
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   The `.env` file should already be configured with the MongoDB Atlas URI. If not, create it with:
   ```bash
   echo "PORT=5000
   MONGODB_URI=mongodb+srv://krishankshh54:professorai@rpm.wca8g.mongodb.net/?retryWrites=true&w=majority&appName=rpm
   JWT_SECRET=professor_ai_jwt_secret_8e51b073
   NODE_ENV=development
   LLM_API_URL=https://api.together.xyz
   LLM_MODEL=togethercomputer/llama-3-8b-instruct
   RENDER_API_KEY=rnd_smh4ZyYgyGZCvZbB2gVXtBpzxMoy" > .env
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```
   The backend will run on http://localhost:5000

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

2. **Configure environment variables**
   Create a `.env.local` file:
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:3000

## GitHub Codespaces Deployment

GitHub Codespaces provides a complete development environment in the cloud, making it easy to work on the project without local setup.

### Steps

1. **Start a Codespace**
   - Navigate to the GitHub repository: https://github.com/krishankshh/professor-ai
   - Click the green "Code" button
   - Select the "Codespaces" tab
   - Click "Create codespace on main"

2. **Set up the environment**
   Once your codespace is ready, you'll see a VS Code interface in your browser. Open a terminal and run:

   ```bash
   # Set up backend
   cd backend
   npm install
   
   # Create .env file
   echo "PORT=5000
   MONGODB_URI=mongodb+srv://krishankshh54:professorai@rpm.wca8g.mongodb.net/?retryWrites=true&w=majority&appName=rpm
   JWT_SECRET=professor_ai_jwt_secret_8e51b073
   NODE_ENV=development
   LLM_API_URL=https://api.together.xyz
   LLM_MODEL=togethercomputer/llama-3-8b-instruct
   RENDER_API_KEY=rnd_smh4ZyYgyGZCvZbB2gVXtBpzxMoy" > .env
   
   # Start backend in a new terminal
   npm start
   ```

3. **Set up the frontend**
   Open a new terminal and run:
   ```bash
   cd frontend
   npm install
   
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=https://CODESPACE_NAME-5000.app.github.dev/api" > .env.local
   
   # Start the frontend
   npm run dev
   ```

4. **Access the application**
   - When the frontend starts, Codespaces will show a notification
   - Click "Open in Browser" to view the application
   - Alternatively, go to the "Ports" tab to see all running services and their URLs

## Render Deployment

### Prerequisites
- GitHub account with the repository
- Render.com account
- MongoDB Atlas account (already set up)

### Backend Deployment

1. **Log in to Render**
   Go to [Render Dashboard](https://dashboard.render.com/) and log in

2. **Create a new Web Service**
   - Click "New" and select "Web Service"
   - Connect your GitHub repository
   - Select the repository: krishankshh/professor-ai

3. **Configure the backend service**
   - Name: professor-ai-backend
   - Root Directory: backend
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add the following environment variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb+srv://krishankshh54:professorai@rpm.wca8g.mongodb.net/?retryWrites=true&w=majority&appName=rpm
     JWT_SECRET=professor_ai_jwt_secret_8e51b073
     NODE_ENV=production
     LLM_API_URL=https://api.together.xyz
     LLM_MODEL=togethercomputer/llama-3-8b-instruct
     RENDER_API_KEY=rnd_smh4ZyYgyGZCvZbB2gVXtBpzxMoy
     ```
   - Click "Create Web Service"

4. **Wait for deployment**
   Render will automatically build and deploy your backend service. This may take a few minutes.

### Frontend Deployment

1. **Create another Web Service**
   - Click "New" and select "Web Service"
   - Connect to the same GitHub repository

2. **Configure the frontend service**
   - Name: professor-ai-frontend
   - Root Directory: frontend
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add the following environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://professor-ai-backend.onrender.com/api
     ```
     (Replace with your actual backend URL from the previous step)
   - Click "Create Web Service"

3. **Wait for deployment**
   Render will automatically build and deploy your frontend service.

4. **Access your application**
   Once deployment is complete, you can access your application at the URL provided by Render.

## MongoDB Configuration

The application is configured to use MongoDB Atlas with the following connection string:
```
mongodb+srv://krishankshh54:professorai@rpm.wca8g.mongodb.net/?retryWrites=true&w=majority&appName=rpm
```

### Database Structure
The application uses the following collections:
- Users: Store user information and preferences
- LearningSession: Track tutoring sessions
- Syllabus: Store custom syllabi created by users
- Assessment: Store quizzes and assessments
- Documents: Store reference materials for RAG

## Environment Variables

### Backend Variables
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Port for the backend server | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb+srv://krishankshh54:professorai@rpm.wca8g.mongodb.net/?retryWrites=true&w=majority&appName=rpm |
| JWT_SECRET | Secret for JWT token generation | professor_ai_jwt_secret_8e51b073 |
| NODE_ENV | Environment (development/production) | production |
| LLM_API_URL | URL for the LLM API | https://api.together.xyz |
| LLM_MODEL | Model name for the LLM | togethercomputer/llama-3-8b-instruct |
| RENDER_API_KEY | API key for Render | rnd_smh4ZyYgyGZCvZbB2gVXtBpzxMoy |

### Frontend Variables
| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | URL for the backend API | http://localhost:5000/api |

## Testing the Application

Once deployed, you can test the Professor AI application:

1. **Access the application** using the provided URL
2. **Ask questions** in the chat interface
3. **Test the AI's knowledge** with various academic questions
4. **Evaluate responses** for accuracy and helpfulness

### Example Questions to Test
- "Can you explain the concept of photosynthesis?"
- "What are the key principles of object-oriented programming?"
- "Help me understand the causes of World War I"
- "Explain the quadratic formula and how to use it"
- "What's the difference between mitosis and meiosis?"

## Troubleshooting

### Common Issues

1. **Backend Connection Issues**
   - Check if the backend is running
   - Verify the NEXT_PUBLIC_API_URL in the frontend environment
   - Check for CORS issues in the browser console

2. **MongoDB Connection Issues**
   - Verify the MongoDB URI is correct
   - Check if IP access is allowed in MongoDB Atlas
   - Look for connection errors in the backend logs

3. **LLM API Issues**
   - Verify the Together.ai API key is valid
   - Check if the model name is correct
   - Look for API rate limiting issues

4. **Render Deployment Issues**
   - Check the build logs for errors
   - Verify all environment variables are set correctly
   - Ensure the start command is correct

For any other issues, please refer to the GitHub repository or contact the project maintainers.
