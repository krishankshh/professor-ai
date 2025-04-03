# Professor AI Deployment Guide

This document provides instructions for deploying the Professor AI application using different methods.

## Deployment Options

### 1. Local Deployment

#### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Git

#### Steps
1. Clone the repository
   ```bash
   git clone https://github.com/krishankshh/professor-ai.git
   cd professor-ai
   ```

2. Set up backend
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   npm start
   ```

3. Set up frontend
   ```bash
   cd ../frontend
   npm install
   # Create a .env.local file with NEXT_PUBLIC_API_URL=http://localhost:5000/api
   npm run dev
   ```

4. Access the application at http://localhost:3000

### 2. Docker Deployment

#### Prerequisites
- Docker and Docker Compose

#### Steps
1. Clone the repository
   ```bash
   git clone https://github.com/krishankshh/professor-ai.git
   cd professor-ai
   ```

2. Configure environment variables
   ```bash
   # Edit backend/.env with your MongoDB URI and other settings
   ```

3. Start the services
   ```bash
   docker-compose up -d
   ```

4. Access the application at http://localhost:3000

### 3. Render Deployment

#### Prerequisites
- GitHub account
- Render account (https://render.com)
- MongoDB Atlas account

#### Steps
1. Fork the repository to your GitHub account

2. Create a new Web Service in Render for the backend
   - Connect your GitHub repository
   - Select the `backend` directory
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables from your `.env` file

3. Create a new Web Service in Render for the frontend
   - Connect your GitHub repository
   - Select the `frontend` directory
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`
   - Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api`

4. Access your application at the URL provided by Render

## GitHub Codespaces Setup

GitHub Codespaces provides a complete development environment in the cloud.

### Steps to Run with Codespaces

1. Navigate to the repository on GitHub
2. Click the "Code" button and select "Open with Codespaces"
3. Click "New codespace"
4. Once the codespace is ready, open a terminal and run:
   ```bash
   # Install dependencies for backend
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   
   # Start the backend
   npm start
   ```
5. Open a new terminal and run:
   ```bash
   # Install dependencies for frontend
   cd frontend
   npm install
   # Create a .env.local file with NEXT_PUBLIC_API_URL=http://localhost:5000/api
   npm run dev
   ```
6. When Codespaces asks if you want to open the application in the browser, click "Open in Browser"

## MongoDB Configuration

The application is configured to use MongoDB Atlas with the following connection string:
```
mongodb+srv://krishankshh54:professorai@rpm.wca8g.mongodb.net/?retryWrites=true&w=majority&appName=rpm
```

For local development, you can use a local MongoDB instance:
```
mongodb://localhost:27017/professor-ai
```

## Environment Variables

### Backend
- `PORT`: Port number for the backend server (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `NODE_ENV`: Environment (development, production)
- `LLM_API_URL`: URL for the LLM API
- `LLM_MODEL`: Model name for the LLM

### Frontend
- `NEXT_PUBLIC_API_URL`: URL of the backend API
