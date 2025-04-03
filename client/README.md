# Notaverse Client

This is the frontend application for Notaverse, a note-taking and resource management tool.

## Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- Backend server running (see ../server/README.md)

### Environment Configuration
Create a `.env` file in the client directory with the following variables:

```
VITE_API_BASE_URL=http://localhost:3002
```

### Installation
```bash
# Install dependencies
npm install
# or with pnpm
pnpm install
```

### Development
```bash
# Start development server
npm run dev
# or with pnpm
pnpm dev
```

### Building for Production
```bash
# Build the app
npm run build
# or with pnpm
pnpm build

# Preview the production build
npm run preview
# or with pnpm
pnpm preview
```

## Technology Stack
- React 19+ with TypeScript
- Vite for build and development
- React Router 7 for routing
- Tailwind CSS for styling
- Radix UI for accessible components

## Project Structure
- `src/components/` - UI components
- `src/contexts/` - React context providers
- `src/lib/` - Utility libraries and configuration
- `src/pages/` - Page components
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions

## Development Guidelines
1. Follow existing code style and patterns
2. Use TypeScript types for all variables and functions
3. Keep components small and focused on a single responsibility
4. Use the environment configuration for all environment variables
5. Keep console logging to a minimum in production code

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
