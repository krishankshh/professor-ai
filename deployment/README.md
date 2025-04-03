# Professor AI Deployment

This directory contains the deployment configuration for Professor AI, an AI-powered personalized tutoring system.

## Deployment Structure

- `backend/`: Backend Express.js API with MongoDB connection
- `frontend/`: Next.js frontend application
- `docker-compose.yml`: Docker Compose configuration for containerized deployment
- `backend/Dockerfile`: Docker configuration for backend service
- `frontend/Dockerfile`: Docker configuration for frontend service

## Deployment Instructions

1. Make sure Docker and Docker Compose are installed on your system
2. Navigate to this directory
3. Run `docker-compose up -d` to start all services
4. Access the application at http://localhost:3000

## Environment Variables

The deployment is configured with the following environment variables:

### Backend
- PORT=5000
- MONGODB_URI=mongodb://professor-ai-user:password123@mongodb:27017/professor-ai
- JWT_SECRET=professor_ai_jwt_secret_8e51b073
- NODE_ENV=production
- LLM_API_URL=https://api.together.xyz
- LLM_MODEL=togethercomputer/llama-3-8b-instruct

### Frontend
- NEXT_PUBLIC_API_URL=http://localhost:5000/api

## Security Notes

For production deployment, please change the default passwords and secrets.
