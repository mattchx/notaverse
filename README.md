# Notaverse

A full-stack application providing a digital workspace with authentication, note-taking, clip management, and resource organization capabilities.

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite 6 for build tooling
- TailwindCSS v4 + shadcn/ui for styling
- React Router 7 for navigation

### Backend
- Node.js with Express
- TypeScript
- Drizzle ORM with Turso/libSQL
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
│   │   ├── pages/         # Route components
│   │   ├── types/         # TypeScript definitions
│   │   ├── utils/         # Utility functions
│   │   └── lib/           # Configuration and helpers
│   └── public/            # Static assets
├── server/                # Backend Express application
│   └── src/
│       ├── config/        # Server configuration
│       ├── db/            # Database models and config
│       ├── middleware/    # Express middleware
│       ├── routes/        # API route handlers
│       ├── services/      # Business logic
│       └── types/         # TypeScript definitions
├── docs/                  # Documentation
└── notes/                 # Project notes
```

## Setup and Installation

### Prerequisites
- Node.js 18+ and npm/pnpm
- Turso account and database (for the backend)

### Client Setup
1. Navigate to the client directory: `cd client`
2. Install dependencies: `npm install` or `pnpm install`
3. Create a `.env` file with:
   ```
   VITE_API_BASE_URL=http://localhost:3002
   ```
4. Start the development server: `npm run dev` or `pnpm dev`

### Server Setup
1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install` or `pnpm install`
3. Create a `.env` file with:
   ```
   NODE_ENV=development
   PORT=3002
   SESSION_SECRET=your_session_secret_at_least_32_chars_long
   CORS_ORIGIN=http://localhost:5173
   TURSO_DB_URL=your_turso_database_url
   TURSO_AUTH_TOKEN=your_turso_auth_token
   ```
4. Start the development server: `npm run dev` or `pnpm dev`

## Features

- **Authentication**
  - User registration and login
  - Protected routes
  - Session management

- **Notes System**
  - Create, read, update, and delete notes
  - Organized note management with sections

- **Resource Management**
  - Resource uploading and organization
  - Resource access control
  - Media library support

## Development Guidelines

1. Follow the established code patterns and styles
2. Use TypeScript types for all variables and functions
3. Minimize console logging in production code
4. Use environment variables appropriately
5. Follow the tasks in TODO.md for planned enhancements

## Recently Added Improvements

- Enhanced environment configuration for type safety
- Added debug mode for controlled logging
- Improved documentation and setup instructions
- Added proper error handling for API requests
- Organized code with clearer structure

## License

[MIT](LICENSE)