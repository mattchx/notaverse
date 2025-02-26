# Notaverse

A full-stack application providing a digital workspace with authentication, note-taking, clip management, and resource organization capabilities.

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite 6 for build tooling
- TailwindCSS v4 + shadcn/ui for styling
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript
- Express Session for authentication
- Bcrypt for password hashing
- Zod for validation
- CORS enabled

## Project Structure

```
notaverse/
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React context providers
│   │   ├── pages/        # Route components
│   │   ├── types/        # TypeScript definitions
│   │   └── lib/          # Utility functions
│   └── public/           # Static assets
└── server/               # Backend Express application
    └── src/
        ├── config/       # Server configuration
        ├── middleware/   # Express middleware
        ├── routes/       # API route handlers
        ├── services/     # Business logic
        └── types/        # TypeScript definitions
```

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

## Development

Run both client and server concurrently:
```bash
npm run dev
```

Or run them separately:
```bash
# Run client only
npm run client

# Run server only
npm run server
```

### Client
- Development server runs on `http://localhost:5173` by default
- Built with Vite for fast HMR (Hot Module Replacement)
- Uses TypeScript for type safety
- Implements protected routes for authenticated content

### Server
- Runs on `http://localhost:3000` by default
- TypeScript-powered Express server
- Session-based authentication
- RESTful API endpoints for:
  - Authentication (login/register)
  - Clips management
  - Notes organization
  - Resource handling

## Features

- **Authentication**
  - User registration and login
  - Protected routes
  - Session management

- **Notes System**
  - Create, read, update, and delete notes
  - Organized note management

- **Clips Management**
  - Clip creation and organization
  - Clip sharing capabilities

- **Resource Management**
  - Resource uploading and organization
  - Resource access control