# QuickAi

QuickAi is a modern AI tools frontend built with React, Vite, Tailwind CSS, and Clerk authentication. It provides a polished landing page, authenticated dashboard layout, and dedicated spaces for common AI workflows like article writing, blog title generation, image generation, background removal, object removal, resume review, and community sharing.

This repository currently contains the client application. The UI foundation, routing, authentication flow, and sample data wiring are in place, while several tool pages are still scaffolded and ready for backend/API integration.

## Features

- Clean landing page with hero, testimonials, pricing, and AI tools sections
- Clerk-powered authentication for gated dashboard access
- Dashboard layout with responsive sidebar and protected routes
- Dedicated routes for multiple AI tool experiences
- Sample creation and community data for rapid UI development
- Vite development workflow with ESLint support

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- React Router 7
- Clerk
- Lucide React

## Project Structure

```text
QuickAi/
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- package.json
|   `-- vite.config.js
`-- README.md
```

## Available Pages

### Public

- `/` - marketing homepage

### Protected

- `/ai` - dashboard
- `/ai/write-article`
- `/ai/blog-titles`
- `/ai/generate-images`
- `/ai/remove-background`
- `/ai/remove-object`
- `/ai/review-resume`
- `/ai/community`

## Current Status

The following parts are already implemented:

- Landing page UI and reusable marketing components
- Authentication guard for the AI dashboard
- Dashboard shell with sidebar navigation
- Dummy content for creations and published community items

The following parts are currently placeholders and need feature logic or API integration:

- Article writer
- Blog title generator
- Image generation
- Background removal
- Object removal
- Resume review
- Community interactions beyond static demo data

## Getting Started

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Configure environment variables

Create a `.env` file inside `client/` and add:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Without this key, the app will fail at startup because Clerk is initialized in `client/src/main.jsx`.

### 3. Start the development server

```bash
cd client
npm run dev
```

### 4. Build for production

```bash
cd client
npm run build
```

### 5. Preview the production build

```bash
cd client
npm run preview
```

## Scripts

From the `client/` directory:

- `npm run dev` - start the Vite dev server
- `npm run build` - create a production build
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint

## Authentication

QuickAi uses Clerk for sign-in and user session management.

- Public users can browse the homepage
- Access to `/ai/*` routes requires authentication
- Unauthenticated users visiting protected routes are shown the Clerk sign-in screen

## Notes For Development

- The app currently uses local dummy data from `client/src/assets/assets.js`
- There is no backend or AI API integration in this repository yet
- Tool pages are ideal extension points for connecting OpenAI, image APIs, storage, and database services

## Roadmap Ideas

- Connect each tool page to real AI APIs
- Store user generations in a database
- Add upload handling for image tools and resume review
- Support publishing, liking, and commenting in the community section
- Add loading states, empty states, and error handling across all tools
- Introduce role-based plans, usage quotas, and billing

## License

This project does not currently include a license file. Add one before public distribution if needed.
