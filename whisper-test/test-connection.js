import OpenAI from 'openai';
import 'dotenv/config';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is not set in .env file');
}

const openai = new OpenAI({
  apiKey: apiKey,
  maxRetries: 3,
  timeout: 30000
});

async function testConnection() {
  try {
    console.log('Testing OpenAI API connection...');
    
    // First test - list models
    console.log('Attempting to list available models...');
    const models = await openai.models.list();
    console.log('Successfully connected to OpenAI API');
    console.log('Number of available models:', models.data.length);
    
    // Check if whisper-1 is available
    const whisperModel = models.data.find(model => model.id === 'whisper-1');
    if (whisperModel) {
      console.log('✓ Whisper model is available');
    } else {
      console.log('⨯ Whisper model not found in available models');
    }
    
  } catch (error) {
    console.error('Connection test failed:', {
      name: error.name,
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code
    });
    
    if (error.message.includes('API key')) {
      console.error('\nPossible API key issues:');
      console.error('1. Key might be invalid or expired');
      console.error('2. Key might not have proper permissions');
      console.error('3. Account might need billing setup');
    }
    
    throw error;
  }
}

testConnection()
  .catch(error => {
    console.error('Test failed:', error.message);
    process.exit(1);
  });