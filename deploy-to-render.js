const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Render API key
const RENDER_API_KEY = 'rnd_smh4ZyYgyGZCvZbB2gVXtBpzxMoy';

// Function to get owner ID
async function getOwnerId() {
  try {
    console.log('Retrieving owner ID from Render API...');
    
    const response = await axios.get(
      'https://api.render.com/v1/owners',
      {
        headers: {
          'Authorization': `Bearer ${RENDER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.length > 0) {
      const ownerId = response.data[0].id;
      console.log(`Found owner ID: ${ownerId}`);
      return ownerId;
    } else {
      throw new Error('No owners found for this API key');
    }
  } catch (error) {
    console.error('Error retrieving owner ID:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to deploy to Render
async function deployToRender() {
  try {
    console.log('Starting deployment to Render...');
    
    // Get owner ID
    const ownerId = await getOwnerId();
    
    // Read the render.yaml file
    const renderYamlPath = path.join(__dirname, 'render.yaml');
    const renderConfig = yaml.load(fs.readFileSync(renderYamlPath, 'utf8'));
    
    // Create a new deploy
    const response = await axios.post(
      'https://api.render.com/v1/services',
      {
        name: 'professor-ai',
        ownerId: ownerId,
        repo: 'https://github.com/krishankshh/professor-ai',
        branch: 'main',
        autoDeploy: 'yes',
        serviceDetails: renderConfig
      },
      {
        headers: {
          'Authorization': `Bearer ${RENDER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Deployment initiated successfully!');
    console.log('Service details:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error deploying to Render:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Execute the deployment
deployToRender()
  .then(result => {
    console.log('Deployment process completed.');
    console.log('Frontend URL:', result.serviceUrl);
  })
  .catch(err => {
    console.error('Deployment failed:', err);
    process.exit(1);
  });
