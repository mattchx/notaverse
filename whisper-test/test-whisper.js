import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

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

// Get audio file metadata using ffprobe if available
async function getAudioMetadata(filePath) {
  try {
    const { stdout } = await execPromise(`ffprobe -v error -show_entries format=duration,bit_rate -show_entries stream=codec_name,channels,sample_rate -of json "${filePath}"`);
    return JSON.parse(stdout);
  } catch (error) {
    console.warn('Could not get detailed audio metadata. Is ffprobe installed?');
    console.warn(error.message);
    return null;
  }
}

async function transcribeAudio(audioFilePath) {
  try {
    // Verify file exists and get basic stats
    const stats = fs.statSync(audioFilePath);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log('File information:', {
      size: `${fileSizeMB} MB`,
      path: path.resolve(audioFilePath),
      extension: path.extname(audioFilePath).toLowerCase(),
      exists: true
    });

    if (stats.size === 0) {
      throw new Error('Audio file is empty');
    }
    
    // Check file size limit
    if (parseFloat(fileSizeMB) > 25) {
      throw new Error(`File size (${fileSizeMB} MB) exceeds OpenAI's 25 MB limit`);
    }

    // Get detailed audio metadata if possible
    const metadata = await getAudioMetadata(audioFilePath);
    if (metadata) {
      console.log('Audio metadata:', JSON.stringify(metadata, null, 2));
      
      // Extract useful information
      const format = metadata.format || {};
      const streams = metadata.streams || [];
      const audioStream = streams.find(s => s.codec_type === 'audio') || {};
      
      console.log('Audio properties:', {
        codec: audioStream.codec_name,
        channels: audioStream.channels,
        sampleRate: audioStream.sample_rate ? `${audioStream.sample_rate} Hz` : 'unknown',
        bitrate: format.bit_rate ? `${Math.round(format.bit_rate / 1000)} kbps` : 'unknown',
        duration: format.duration ? `${Math.round(format.duration)} seconds` : 'unknown'
      });
      
      // Warn about potential issues
      if (audioStream.channels > 1) {
        console.warn('Note: Multi-channel audio (stereo) detected. Whisper works best with mono audio.');
      }
      
      if (audioStream.sample_rate && audioStream.sample_rate < 16000) {
        console.warn('Warning: Low sample rate detected. Whisper recommends at least 16kHz sample rate.');
      }
      
      if (format.bit_rate && format.bit_rate < 32000) {
        console.warn('Warning: Low bitrate detected. This may affect transcription quality.');
      }
    }

    // Validate file extension
    const validExtensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];
    const fileExt = path.extname(audioFilePath).toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      console.warn(`Warning: File extension '${fileExt}' may not be supported by OpenAI. Valid extensions are: ${validExtensions.join(', ')}`);
    }

    // Create file stream
    const fileStream = fs.createReadStream(audioFilePath);
    
    console.log('Starting transcription...');
    console.log('Request details:', {
      model: 'whisper-1',
      fileSize: `${fileSizeMB} MB`,
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
      text: transcription.text.substring(0, 100) + (transcription.text.length > 100 ? '...' : '') // Show preview
    });

    // Create transcripts directory if it doesn't exist
    const transcriptsDir = path.join(__dirname, 'transcripts');
    if (!fs.existsSync(transcriptsDir)) {
      fs.mkdirSync(transcriptsDir, { recursive: true });
    }

    // Save transcription to file in transcripts directory
    const outputFileName = path.basename(audioFilePath, path.extname(audioFilePath)) + '.txt';
    const outputFilePath = path.join(transcriptsDir, outputFileName);
    
    // Write the full transcript to the file
    fs.writeFileSync(outputFilePath, transcription.text);
    console.log(`Transcription saved to: ${outputFilePath}`);
    
    // Also save detailed JSON output if requested
    if (process.argv.includes('--json')) {
      const jsonOutputPath = path.join(transcriptsDir, path.basename(audioFilePath, path.extname(audioFilePath)) + '.json');
      fs.writeFileSync(jsonOutputPath, JSON.stringify(transcription, null, 2));
      console.log(`Detailed JSON data saved to: ${jsonOutputPath}`);
    }

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
        data: JSON.stringify(error.response.data, null, 2)
      });
      
      // Specific error advice
      if (error.status === 400) {
        console.error('\nPossible causes for 400 Bad Request:');
        console.error('- File format not supported (must be mp3, mp4, mpeg, mpga, m4a, wav, or webm)');
        console.error('- File is corrupted or has invalid audio data');
        console.error('- Audio may be too short or contain no speech');
        console.error('- Audio quality too low (noise, distortion, compression artifacts)');
        
        console.error('\nSuggested fixes:');
        console.error('- Try converting your file to a different format (e.g., wav or mp3)');
        console.error('- Use a higher bitrate/quality when encoding');
        console.error('- Convert stereo to mono audio');
        console.error('- Increase sample rate to at least 16kHz');
        console.error('- Remove noise or normalize audio levels');
        console.error('- Try: ffmpeg -i your_file.mp3 -ar 16000 -ac 1 -c:a aac -b:a 192k output.m4a');
      }
      
      if (error.status === 413) {
        console.error('\nError 413: File too large. OpenAI supports files up to 25MB.');
        console.error('Try compressing the audio or splitting it into smaller segments.');
      }
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