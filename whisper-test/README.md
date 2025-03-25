# OpenAI Whisper API Test

Simple test environment for OpenAI's Whisper speech-to-text API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the project root and add your OpenAI API key:
```env
OPENAI_API_KEY=your-api-key-here
```

Note: Make sure your OpenAI account has billing set up as Whisper is a paid API.

## Usage

### Test API Connection

Check if your API key is valid and Whisper is available:
```bash
npm run check-api
```

This will:
- Verify your API key
- List available models
- Confirm Whisper access

### Transcribe Audio

Transcribe an audio file:
```bash
npm run transcribe /path/to/audio.mp3
```

Example:
```bash
npm run transcribe /Users/mattch/downloads/test.m4a
```

Supported audio formats:
- mp3
- mp4
- mpeg
- mpga
- m4a
- wav
- webm

## Error Handling

Common errors and solutions:

1. "insufficient_quota" (HTTP 429):
   - Check your OpenAI account billing setup
   - Verify you have available credits

2. "API key not found":
   - Make sure you've created the `.env` file
   - Verify your API key is correctly set
   - Ensure the key starts with "sk-"

## File Structure

```
whisper-test/
├── .env                # API key configuration
├── .gitignore         # Git ignore rules
├── package.json       # Project configuration
├── test-connection.js # API connection test
└── test-whisper.js    # Whisper transcription test
```

## Scripts

- `npm run check-api`: Test OpenAI API connection
- `npm run transcribe`: Run audio transcription

## Notes

- Maximum audio file size: 25 MB
- Audio longer than 30 seconds may be truncated
- Response includes:
  - Transcribed text
  - Audio duration
  - Detected language