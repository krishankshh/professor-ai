# Professor AI - Deployment Guide

This document provides comprehensive instructions for setting up and deploying the Professor AI tutoring system. The system uses open-source LLMs to provide personalized, adaptive learning experiences.

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Self-Hosting Guide](#self-hosting-guide)
3. [Cloud Deployment Options](#cloud-deployment-options)
4. [Environment Configuration](#environment-configuration)
5. [LLM Setup](#llm-setup)
6. [Database Setup](#database-setup)
7. [Troubleshooting](#troubleshooting)

## Local Development Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (v4.4+)
- Ollama or another local LLM server
- Git

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/krishankshh/professor-ai.git
   cd professor-ai
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
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

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

2. Create a `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:3000`

### Setting Up Ollama for LLM Support
1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull the Llama 3 model:
   ```bash
   ollama pull llama3
   ```
3. Start the Ollama server:
   ```bash
   ollama serve
   ```
4. Test the Ollama API:
   ```bash
   curl http://localhost:11434/api/generate -d '{
     "model": "llama3",
     "prompt": "Hello, world!"
   }'
   ```

## Self-Hosting Guide

### System Requirements
- 4+ CPU cores
- 16+ GB RAM (32+ GB recommended for better LLM performance)
- 50+ GB storage
- Ubuntu 20.04 LTS or newer

### Production Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/krishankshh/professor-ai.git
   cd professor-ai
   ```

2. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit the `.env` file with production values.

3. Install dependencies and build:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   npm run build
   ```

4. Set up a production MongoDB instance:
   - Install MongoDB:
     ```bash
     sudo apt update
     sudo apt install -y mongodb
     sudo systemctl enable mongodb
     sudo systemctl start mongodb
     ```
   - Or use MongoDB Atlas for a managed solution

5. Set up Nginx as a reverse proxy:
   ```bash
   sudo apt install -y nginx
   ```

   Create a new Nginx configuration:
   ```bash
   sudo nano /etc/nginx/sites-available/professor-ai
   ```

   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the configuration:
   ```bash
   sudo ln -s /etc/nginx/sites-available/professor-ai /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. Set up PM2 for process management:
   ```bash
   sudo npm install -g pm2
   
   # Start backend
   cd ~/professor-ai/backend
   pm2 start server.js --name professor-ai-backend
   
   # Start frontend
   cd ~/professor-ai/frontend
   pm2 start npm --name professor-ai-frontend -- start
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

7. Set up SSL with Let's Encrypt:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### LLM Setup for Production

For production, you have several options for hosting the LLM:

1. **Local Ollama (Recommended for self-hosting)**:
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Pull the model
   ollama pull llama3
   
   # Create a systemd service
   sudo nano /etc/systemd/system/ollama.service
   ```
   
   Add the following content:
   ```
   [Unit]
   Description=Ollama Service
   After=network.target
   
   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu
   ExecStart=/usr/local/bin/ollama serve
   Restart=on-failure
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   Enable and start the service:
   ```bash
   sudo systemctl enable ollama
   sudo systemctl start ollama
   ```

2. **Using Hugging Face Inference API**:
   - Create an account on Hugging Face
   - Get an API key
   - Update your `.env` file to use the Hugging Face API

## Cloud Deployment Options

### AWS Deployment

1. **EC2 Instance Setup**:
   - Launch an EC2 instance (recommended: t3.xlarge or better)
   - Use Ubuntu Server 22.04 LTS
   - Configure security groups to allow HTTP (80), HTTPS (443), and SSH (22)
   - Connect to your instance via SSH

2. **Follow the self-hosting guide** above to set up the application

3. **Use Amazon RDS for MongoDB** (optional):
   - Create a MongoDB-compatible database in Amazon DocumentDB
   - Update your `.env` file with the DocumentDB connection string

### Digital Ocean Deployment

1. **Create a Droplet**:
   - Size: 8GB RAM / 4 CPUs or higher
   - Choose Ubuntu 22.04 LTS
   - Add your SSH key

2. **Follow the self-hosting guide** above to set up the application

3. **Use Digital Ocean Managed MongoDB** (optional):
   - Create a MongoDB database cluster
   - Update your `.env` file with the connection string

### Google Cloud Platform

1. **Create a Compute Engine VM**:
   - Machine type: e2-standard-4 or better
   - Boot disk: Ubuntu 22.04 LTS
   - Allow HTTP and HTTPS traffic

2. **Follow the self-hosting guide** above to set up the application

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Port for the backend server | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/professor-ai |
| JWT_SECRET | Secret for JWT token generation | your_secret_key |
| NODE_ENV | Environment (development/production) | production |
| LLM_API_URL | URL for the LLM API | http://localhost:11434 |
| LLM_MODEL | Model name for the LLM | llama3 |
| EMBEDDING_API_URL | URL for the embedding API | http://localhost:11434 |
| EMBEDDING_MODEL | Model name for embeddings | llama3 |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | URL for the backend API | http://localhost:5000/api |

## LLM Setup

### Supported Open-Source Models

Professor AI is designed to work with various open-source LLMs:

1. **Llama 3** (Recommended):
   - High-quality responses
   - Good performance on consumer hardware
   - Available via Ollama

2. **Mistral**:
   - Good alternative to Llama 3
   - Available via Ollama

3. **Falcon**:
   - Lightweight option for limited hardware
   - Available via Hugging Face

### Model Configuration

You can configure the model parameters in `backend/utils/enhancedLlmService.js`:

```javascript
const LLM_CONFIG = {
  baseUrl: process.env.LLM_API_URL || 'http://localhost:11434',
  model: process.env.LLM_MODEL || 'llama3',
  // Other parameters...
};
```

## Database Setup

### MongoDB Schema

The application uses MongoDB with the following collections:
- Users
- UserProfiles
- LearningHistories
- LearningSession
- Syllabi
- Assessments
- Documents

### Indexes

For optimal performance, create the following indexes:

```javascript
// Run in MongoDB shell or use a MongoDB client
db.documents.createIndex({ title: "text", content: "text", topic: "text", tags: "text" });
db.users.createIndex({ email: 1 }, { unique: true });
db.learninghistories.createIndex({ user: 1, topic: 1 });
```

## Troubleshooting

### Common Issues

1. **LLM Connection Issues**:
   - Ensure Ollama is running: `systemctl status ollama`
   - Check the LLM API URL in your `.env` file
   - Verify the model is downloaded: `ollama list`

2. **MongoDB Connection Issues**:
   - Ensure MongoDB is running: `systemctl status mongodb`
   - Check the MongoDB connection string in your `.env` file
   - Verify network connectivity to the MongoDB server

3. **Frontend Not Connecting to Backend**:
   - Check the NEXT_PUBLIC_API_URL in your frontend `.env.local` file
   - Ensure the backend server is running
   - Check for CORS issues in the browser console

4. **Performance Issues**:
   - LLM responses are slow: Consider using a smaller model or upgrading hardware
   - Database queries are slow: Add appropriate indexes
   - High memory usage: Adjust Node.js memory limits with `--max-old-space-size` flag

### Getting Help

If you encounter issues not covered in this guide:
1. Check the GitHub repository issues section
2. Review the code documentation
3. Reach out to the project maintainers

## Maintenance

### Backup Procedures

1. **Database Backup**:
   ```bash
   mongodump --db professor-ai --out /path/to/backup/directory
   ```

2. **Restore from Backup**:
   ```bash
   mongorestore --db professor-ai /path/to/backup/directory/professor-ai
   ```

### Updating the Application

1. Pull the latest changes:
   ```bash
   cd professor-ai
   git pull origin main
   ```

2. Update dependencies and rebuild:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   npm run build
   ```

3. Restart the services:
   ```bash
   pm2 restart all
   ```
