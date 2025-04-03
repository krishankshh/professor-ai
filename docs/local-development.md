# Local Development Setup Guide

This guide provides step-by-step instructions for setting up the Professor AI project for local development.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (v16+)
- npm (v8+)
- MongoDB (v4.4+)
- Git
- Ollama (for local LLM hosting)

## Step 1: Clone the Repository

```bash
git clone https://github.com/krishankshh/professor-ai.git
cd professor-ai
```

## Step 2: Set Up the Backend

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the backend directory:
   ```bash
   cp .env.example .env
   ```

3. Open the `.env` file and update the configuration as needed:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/professor-ai
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   LLM_API_URL=http://localhost:11434
   LLM_MODEL=llama3
   EMBEDDING_API_URL=http://localhost:11434
   EMBEDDING_MODEL=llama3
   ```

4. Start the MongoDB service if it's not already running:
   ```bash
   sudo systemctl start mongodb
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```

## Step 3: Set Up the Frontend

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Access the application in your browser at `http://localhost:3000`

## Step 4: Set Up Ollama for LLM Support

1. Install Ollama from [ollama.ai](https://ollama.ai)

2. Pull the Llama 3 model:
   ```bash
   ollama pull llama3
   ```

3. Start the Ollama server:
   ```bash
   ollama serve
   ```

4. Test that Ollama is working correctly:
   ```bash
   curl http://localhost:11434/api/generate -d '{
     "model": "llama3",
     "prompt": "Hello, world!"
   }'
   ```

## Step 5: Testing the Application

1. Register a new user account through the web interface

2. Test the tutoring functionality by starting a new session

3. Create a syllabus and test the personalized learning features

4. Generate and take an assessment to test the assessment system

## Development Workflow

1. Backend code is located in the `backend` directory:
   - `models/`: MongoDB schemas
   - `routes/`: API endpoints
   - `utils/`: Utility functions and services
   - `middleware/`: Express middleware

2. Frontend code is located in the `frontend` directory:
   - `src/components/`: React components
   - `src/context/`: React context providers
   - `src/services/`: API service functions
   - `src/pages/`: Next.js pages

3. Make changes to the code and the development servers will automatically reload

4. Commit your changes to Git:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

## Troubleshooting

### Backend Issues

- If you see MongoDB connection errors, ensure MongoDB is running:
  ```bash
  sudo systemctl status mongodb
  ```

- If you see LLM connection errors, ensure Ollama is running:
  ```bash
  ps aux | grep ollama
  ```

### Frontend Issues

- If you see API connection errors, ensure the backend server is running and the `NEXT_PUBLIC_API_URL` is set correctly

- Clear your browser cache if you experience unexpected behavior

## Additional Resources

- Check the `docs` directory for more detailed documentation
- Refer to the deployment guide for production deployment instructions
- See the user manual for detailed usage instructions
