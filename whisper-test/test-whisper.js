import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Validate API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is not set in .env file');
}

const openai = new OpenAI({
  apiKey: apiKey,
  maxRetries: 3,
  timeout: 60000 // 60 seconds timeout
});

async function transcribeAudio(audioFilePath) {
  try {
    // Verify file exists and get stats
    const stats = fs.statSync(audioFilePath);
    console.log('File information:', {
      size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
      path: path.resolve(audioFilePath),
      exists: true
    });

    if (stats.size === 0) {
      throw new Error('Audio file is empty');
    }

    // Create file stream
    const fileStream = fs.createReadStream(audioFilePath);
    
    console.log('Starting transcription...');
    console.log('Request details:', {
      model: 'whisper-1',
      fileSize: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
      timestamp: new Date().toISOString()
    });

    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
      response_format: "verbose_json" // Get detailed response
    });

    console.log('Transcription completed successfully');
    console.log('Response details:', {
      duration: transcription.duration,
      language: transcription.language,
      text: transcription.text
    });

    return transcription;
  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code
    });

    if (error.response) {
      console.error('API Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    throw error;
  }
}

// Get audio file path from command line arguments
const audioFile = process.argv[2];
if (!audioFile) {
  console.error('Please provide an audio file path:');
  console.error('npm run transcribe /path/to/audio.mp3');
  process.exit(1);
}

transcribeAudio(audioFile)
  .catch(error => {
    console.error('Failed to transcribe audio:', error.message);
    process.exit(1);
  });