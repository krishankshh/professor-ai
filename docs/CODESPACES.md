# GitHub Codespaces Setup for Professor AI

This guide explains how to set up and run the Professor AI project using GitHub Codespaces.

## What is GitHub Codespaces?

GitHub Codespaces provides a complete, configurable development environment in the cloud. It allows you to develop entirely in the cloud without needing to install any software locally.

## Setting Up Professor AI in Codespaces

### 1. Start a Codespace

1. Navigate to the [Professor AI repository](https://github.com/krishankshh/professor-ai)
2. Click the green "Code" button
3. Select the "Codespaces" tab
4. Click "Create codespace on main"

![Create Codespace](https://docs.github.com/assets/cb-138303/images/help/codespaces/new-codespace-button.png)

### 2. Configure the Environment

Once your codespace is ready, you'll see a VS Code interface in your browser. Now you need to:

1. Set up the backend:
   ```bash
   cd backend
   npm install
   
   # Create .env file with your MongoDB connection
   echo "PORT=5000
   MONGODB_URI=mongodb+srv://krishankshh54:professorai@rpm.wca8g.mongodb.net/?retryWrites=true&w=majority&appName=rpm
   JWT_SECRET=professor_ai_jwt_secret_8e51b073
   NODE_ENV=development
   LLM_API_URL=https://api.together.xyz
   LLM_MODEL=togethercomputer/llama-3-8b-instruct" > .env
   ```

2. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   
   # Create pages directory if it doesn't exist
   mkdir -p pages
   
   # Create a simple index.js if it doesn't exist
   if [ ! -f "pages/index.js" ]; then
     echo "import React from 'react';
     export default function Home() {
       return <div>Professor AI - Coming Soon</div>;
     }" > pages/index.js
   fi
   ```

### 3. Run the Application

1. Start the backend server:
   ```bash
   # In a terminal
   cd backend
   npm start
   ```

2. In a new terminal, start the frontend:
   ```bash
   # In another terminal
   cd frontend
   npm run dev
   ```

3. Access the application:
   - When the frontend starts, Codespaces will show a notification that your application is running
   - Click "Open in Browser" to view the application
   - Alternatively, go to the "Ports" tab to see all running services and their URLs

### 4. Development in Codespaces

- **File Editing**: Edit files directly in the VS Code interface
- **Terminal Access**: Use the integrated terminal for commands
- **Extensions**: Install VS Code extensions as needed
- **Port Forwarding**: Codespaces automatically forwards ports for web applications
- **GitHub Integration**: Commit and push changes directly from the interface

## Troubleshooting

- **Port Issues**: If you can't access the application, check the "Ports" tab to ensure ports are being forwarded correctly
- **MongoDB Connection**: If you have issues connecting to MongoDB, verify your connection string in the .env file
- **Node Modules**: If you encounter module not found errors, try running `npm install` again

## Saving Your Work

Your codespace will persist your changes, but it's good practice to:

1. Commit your changes regularly:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

2. Create a new branch for features:
   ```bash
   git checkout -b feature-name
   ```

## Resources

- [GitHub Codespaces Documentation](https://docs.github.com/en/codespaces)
- [VS Code in Codespaces](https://code.visualstudio.com/docs/remote/codespaces)
