# MongoDB Configuration for Professor AI

This document provides instructions for setting up MongoDB for the Professor AI project.

## Local MongoDB Setup

1. Install MongoDB Community Edition on your system
   ```bash
   # For Ubuntu 22.04
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

2. Start MongoDB service
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod  # Optional: to start MongoDB on system boot
   ```

3. Create database and user
   ```bash
   mongosh --eval "db = db.getSiblingDB('professor-ai'); db.createUser({user: 'professor-ai-user', pwd: 'password123', roles: [{role: 'readWrite', db: 'professor-ai'}]}); db.createCollection('users'); db.createCollection('documents'); db.createCollection('syllabi'); db.createCollection('learning_sessions'); db.createCollection('assessments'); db.createCollection('learning_history'); db.createCollection('user_profiles');"
   ```

4. Configure environment variables
   Create a `.env` file in the backend directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://professor-ai-user:password123@localhost:27017/professor-ai
   JWT_SECRET=professor_ai_jwt_secret_8e51b073
   NODE_ENV=development
   ```

## MongoDB Atlas Setup (Alternative)

If you prefer using MongoDB Atlas cloud service:

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster
3. Configure network access to allow connections from your application
4. Create a database user with appropriate permissions
5. Get your connection string and update the `.env` file:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
   ```

## Database Collections

The Professor AI application uses the following collections:
- users: User authentication and profile information
- documents: Learning materials and resources
- syllabi: Course syllabi and curriculum structures
- learning_sessions: Active learning session data
- assessments: Quizzes and assessment data
- learning_history: User learning history and progress
- user_profiles: Extended user profile information

## Security Notes

- The `.env` file is included in `.gitignore` to prevent sensitive information from being committed to the repository
- For production deployment, use strong, unique passwords
- Consider using environment variables instead of `.env` files in production environments
