# Cloud Deployment Options

This guide outlines various cloud deployment options for the Professor AI tutoring system.

## AWS Deployment

### EC2 Instance Setup

1. **Launch an EC2 Instance**:
   - Go to the AWS Management Console
   - Navigate to EC2 service
   - Click "Launch Instance"
   - Choose an Amazon Machine Image (AMI): Ubuntu Server 22.04 LTS
   - Select an instance type: t3.xlarge or better (recommended for LLM hosting)
   - Configure instance details as needed
   - Add storage: At least 50GB
   - Configure security groups to allow:
     - HTTP (port 80)
     - HTTPS (port 443)
     - SSH (port 22)
   - Review and launch the instance
   - Select or create a key pair for SSH access

2. **Connect to Your Instance**:
   ```bash
   ssh -i /path/to/your-key.pem ubuntu@your-instance-public-dns
   ```

3. **Install Dependencies**:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   sudo apt install -y nodejs npm mongodb nginx
   
   # Install Node.js 16.x
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

4. **Follow the Self-Hosting Guide** from the deployment-guide.md document

### Using Amazon RDS for MongoDB

For a more scalable and managed database solution:

1. **Create a MongoDB-Compatible Database**:
   - Go to the AWS Management Console
   - Navigate to Amazon DocumentDB
   - Click "Create cluster"
   - Configure your cluster settings
   - Set up security groups to allow access from your EC2 instance

2. **Update Your Application Configuration**:
   - Modify the `.env` file in your backend directory:
     ```
     MONGODB_URI=mongodb://username:password@your-docdb-endpoint:27017/professor-ai
     ```

### Using AWS S3 for Static Assets

1. **Create an S3 Bucket**:
   - Go to the AWS Management Console
   - Navigate to S3 service
   - Click "Create bucket"
   - Configure bucket settings and permissions

2. **Configure Your Application to Use S3**:
   - Install the AWS SDK in your backend:
     ```bash
     cd backend
     npm install aws-sdk
     ```
   - Update your file upload code to use S3

## Google Cloud Platform Deployment

### Compute Engine Setup

1. **Create a VM Instance**:
   - Go to the Google Cloud Console
   - Navigate to Compute Engine > VM instances
   - Click "Create Instance"
   - Name your instance
   - Select a region and zone
   - Machine configuration: e2-standard-4 or better
   - Boot disk: Ubuntu 22.04 LTS (50GB or more)
   - Allow HTTP and HTTPS traffic
   - Click "Create"

2. **Connect to Your Instance**:
   - Click the SSH button next to your instance in the GCP console, or
   - Use gcloud command:
     ```bash
     gcloud compute ssh --zone "your-zone" "your-instance-name"
     ```

3. **Follow the Self-Hosting Guide** from the deployment-guide.md document

### Using MongoDB Atlas on GCP

1. **Create a MongoDB Atlas Cluster**:
   - Sign up for MongoDB Atlas
   - Create a new project
   - Build a new cluster
   - Select GCP as the cloud provider
   - Choose the same region as your Compute Engine instance
   - Configure cluster tier and settings

2. **Configure Network Access**:
   - In MongoDB Atlas, go to Network Access
   - Add the IP address of your Compute Engine instance
   - Or allow access from anywhere (less secure)

3. **Update Your Application Configuration**:
   - Modify the `.env` file in your backend directory:
     ```
     MONGODB_URI=mongodb+srv://username:password@your-atlas-cluster.mongodb.net/professor-ai
     ```

## Digital Ocean Deployment

### Droplet Setup

1. **Create a Droplet**:
   - Log in to your Digital Ocean account
   - Click "Create" > "Droplets"
   - Choose an image: Ubuntu 22.04 LTS
   - Select a plan: Basic or General Purpose with at least 8GB RAM / 4 CPUs
   - Choose a datacenter region
   - Add your SSH key
   - Click "Create Droplet"

2. **Connect to Your Droplet**:
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Create a Non-Root User**:
   ```bash
   adduser ubuntu
   usermod -aG sudo ubuntu
   ```

4. **Follow the Self-Hosting Guide** from the deployment-guide.md document

### Using Digital Ocean Managed MongoDB

1. **Create a MongoDB Database**:
   - In the Digital Ocean console, go to Databases
   - Click "Create Database Cluster"
   - Select MongoDB
   - Choose a plan
   - Select the same region as your Droplet
   - Configure database settings

2. **Configure Firewall Rules**:
   - In the database settings, add your Droplet's IP to the trusted sources

3. **Update Your Application Configuration**:
   - Modify the `.env` file in your backend directory:
     ```
     MONGODB_URI=mongodb+srv://username:password@your-do-db-cluster.mongodb.net/professor-ai
     ```

## Azure Deployment

### Virtual Machine Setup

1. **Create a Virtual Machine**:
   - Go to the Azure Portal
   - Navigate to Virtual Machines
   - Click "Add" > "Virtual machine"
   - Configure the VM:
     - Image: Ubuntu Server 22.04 LTS
     - Size: Standard_D4s_v3 or better
     - Authentication: SSH public key
     - Inbound ports: Allow SSH (22), HTTP (80), HTTPS (443)
   - Review and create

2. **Connect to Your VM**:
   ```bash
   ssh azureuser@your-vm-public-ip
   ```

3. **Follow the Self-Hosting Guide** from the deployment-guide.md document

### Using Azure Cosmos DB for MongoDB

1. **Create a Cosmos DB Account**:
   - In the Azure Portal, go to Azure Cosmos DB
   - Click "Create"
   - Select API: Azure Cosmos DB for MongoDB
   - Configure account settings
   - Review and create

2. **Update Your Application Configuration**:
   - Modify the `.env` file in your backend directory:
     ```
     MONGODB_URI=mongodb://your-cosmos-account:primary-key@your-cosmos-account.documents.azure.com:10255/professor-ai?ssl=true
     ```

## Serverless Deployment Options

For a more scalable and managed deployment, consider these serverless options:

### AWS Serverless

1. **Backend**: AWS Lambda + API Gateway
   - Package your Express app for Lambda using AWS Serverless Express
   - Create API Gateway endpoints to trigger Lambda functions
   - Use DynamoDB or DocumentDB for database

2. **Frontend**: S3 + CloudFront
   - Build your Next.js app for static export
   - Upload to S3 bucket
   - Configure CloudFront for CDN and HTTPS

### Google Cloud Serverless

1. **Backend**: Cloud Functions or Cloud Run
   - Package your Express app for Cloud Functions or Cloud Run
   - Configure HTTP triggers
   - Use Firestore or MongoDB Atlas for database

2. **Frontend**: Firebase Hosting
   - Build your Next.js app for static export
   - Deploy to Firebase Hosting

## Containerized Deployment

For a more portable deployment, consider using Docker and Kubernetes:

### Docker Deployment

1. **Create Dockerfiles**:
   - For backend:
     ```dockerfile
     FROM node:16
     WORKDIR /app
     COPY package*.json ./
     RUN npm install
     COPY . .
     EXPOSE 5000
     CMD ["npm", "start"]
     ```
   - For frontend:
     ```dockerfile
     FROM node:16
     WORKDIR /app
     COPY package*.json ./
     RUN npm install
     COPY . .
     RUN npm run build
     EXPOSE 3000
     CMD ["npm", "start"]
     ```

2. **Create Docker Compose File**:
   ```yaml
   version: '3'
   services:
     backend:
       build: ./backend
       ports:
         - "5000:5000"
       environment:
         - MONGODB_URI=mongodb://mongo:27017/professor-ai
         - LLM_API_URL=http://ollama:11434
       depends_on:
         - mongo
         - ollama
     
     frontend:
       build: ./frontend
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_API_URL=http://localhost:5000/api
       depends_on:
         - backend
     
     mongo:
       image: mongo
       volumes:
         - mongo-data:/data/db
     
     ollama:
       image: ollama/ollama
       volumes:
         - ollama-models:/root/.ollama
   
   volumes:
     mongo-data:
     ollama-models:
   ```

3. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

### Kubernetes Deployment

For production-grade containerized deployment, consider using Kubernetes:

1. **Create Kubernetes Manifests** for each component
2. **Deploy to a Kubernetes Cluster** (EKS, GKE, AKS, or self-hosted)
3. **Configure Ingress** for external access
4. **Set Up Persistent Volumes** for data storage

## Performance Optimization Tips

Regardless of your deployment platform, consider these optimizations:

1. **Use a CDN** for static assets
2. **Implement caching** for API responses
3. **Configure proper scaling** based on usage patterns
4. **Monitor performance** and set up alerts
5. **Implement database indexing** for frequently queried fields
6. **Use connection pooling** for database connections
7. **Configure proper resource limits** for containers or VMs

## Security Considerations

1. **Enable HTTPS** for all traffic
2. **Use secure environment variables** for sensitive information
3. **Implement proper authentication and authorization**
4. **Configure network security groups** to restrict access
5. **Regularly update dependencies** to patch security vulnerabilities
6. **Set up automated backups** for your database
7. **Implement rate limiting** to prevent abuse
