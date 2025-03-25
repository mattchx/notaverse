import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import https from 'https';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

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

    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(audioFilePath));
    form.append('model', 'whisper-1');
    form.append('response_format', 'verbose_json');

    console.log('Starting transcription...');
    console.log('Request details:', {
      model: 'whisper-1',
      fileSize: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
      timestamp: new Date().toISOString()
    });

    // Create manual request
    return new Promise((resolve, reject) => {
      const request = https.request({
        hostname: 'api.openai.com',
        path: '/v1/audio/transcriptions',
        method: 'POST',
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'whisper-1'
        }
      }, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          if (response.statusCode === 200) {
            try {
              const result = JSON.parse(data);
              console.log('Transcription completed successfully');
              console.log('Response details:', {
                duration: result.duration,
                language: result.language,
                text: result.text
              });
              resolve(result);
            } catch (error) {
              reject(new Error('Failed to parse response: ' + error.message));
            }
          } else {
            console.error('API Error Response:', {
              statusCode: response.statusCode,
              statusMessage: response.statusMessage,
              data: data
            });
            reject(new Error(`API request failed with status ${response.statusCode}`));
          }
        });
      });

      request.on('error', (error) => {
        console.error('Request error:', error);
        reject(error);
      });

      // Set timeout
      request.setTimeout(60000, () => {
        request.destroy();
        reject(new Error('Request timed out after 60 seconds'));
      });

      // Send the form data
      form.pipe(request);
    });
  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    throw error;
  }
}

// Example usage
const audioFile = process.argv[2];
if (!audioFile) {
  console.error('Please provide an audio file path: node test-whisper.js <audio-file>');
  process.exit(1);
}

transcribeAudio(audioFile)
  .catch(error => {
    console.error('Failed to transcribe audio:', error.message);
    process.exit(1);
  });