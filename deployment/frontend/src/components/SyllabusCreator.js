import React from 'react';
import { useTutoring } from '../context/TutoringContext';
import { useAuth } from '../context/AuthContext';

const SyllabusCreator = () => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [topics, setTopics] = React.useState([{ title: '', description: '', order: 0 }]);
  const [difficulty, setDifficulty] = React.useState('intermediate');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);

  const { user } = useAuth();
  
  const handleAddTopic = () => {
    setTopics([...topics, { title: '', description: '', order: topics.length }]);
  };

  const handleRemoveTopic = (index) => {
    const newTopics = [...topics];
    newTopics.splice(index, 1);
    // Update order for remaining topics
    newTopics.forEach((topic, idx) => {
      topic.order = idx;
    });
    setTopics(newTopics);
  };

  const handleTopicChange = (index, field, value) => {
    const newTopics = [...topics];
    newTopics[index][field] = value;
    setTopics(newTopics);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }
    
    if (topics.some(topic => !topic.title.trim())) {
      setError('All topics must have a title');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create syllabus object
      const syllabusData = {
        title,
        description,
        topics,
        difficulty,
      };
      
      // Call API to create syllabus (mock for now)
      // await syllabusService.createSyllabus(syllabusData);
      
      // Reset form on success
      setTitle('');
      setDescription('');
      setTopics([{ title: '', description: '', order: 0 }]);
      setDifficulty('intermediate');
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to create syllabus');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Syllabus</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Syllabus created successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Introduction to Machine Learning"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Provide a brief description of this syllabus"
            rows="3"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="difficulty" className="block text-gray-700 font-medium mb-2">
            Difficulty Level
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Topics</label>
          
          {topics.map((topic, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Topic {index + 1}</h4>
                {topics.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="mb-2">
                <input
                  type="text"
                  value={topic.title}
                  onChange={(e) => handleTopicChange(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Topic title"
                  required
                />
              </div>
              
              <div>
                <textarea
                  value={topic.description}
                  onChange={(e) => handleTopicChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Topic description"
                  rows="2"
                />
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddTopic}
            className="mt-2 text-primary-600 hover:text-primary-800 font-medium"
          >
            + Add Another Topic
          </button>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Syllabus'}
        </button>
      </form>
    </div>
  );
};

export default SyllabusCreator;
