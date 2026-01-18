# Project: IHeardThis.live

## Project Overview
IHeardThis.live is a React-based web application for music enthusiasts to track and share their live music experiences. It leverages the Spotify API for artist data and Supabase for authentication, database, and storage.

## Tech Stack
- **Frontend Framework:** React (using Vite)
- **Styling:** Tailwind CSS, Framer Motion (animations), Headless UI (accessible components)
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **External APIs:** Spotify Web API (via `spotify-web-api-node` and custom integration)
- **State Management:** React Context (`AuthContext`) and local state
- **Routing:** React Router DOM
- **Notifications:** Sonner

## Architecture & Directory Structure
- **`src/`**: Source code root.
    - **`components/`**: Reusable UI components (`Header`, `Footer`, `AuthModal`, `ArtistSearch`, etc.).
    - **`contexts/`**: React Context definitions (primarily `AuthContext.jsx` for user session management).
    - **`lib/`**: Configuration and client initialization (e.g., `supabase.js`).
    - **`pages/`**: Main route views (`Home.jsx`, `Profile.jsx`, `PublicProfile.jsx`).
    - **`App.jsx`**: Main application component and routing setup.
    - **`main.jsx`**: Application entry point.
- **`setup.sql`**: Database schema, RLS policies, and triggers for Supabase.

## Database Schema (Supabase)
The project uses a PostgreSQL database hosted on Supabase with the following key tables:
- **`profiles`**: Extends Supabase `auth.users`. Stores user details (username, avatar, social links).
- **`artists`**: Caches Spotify artist data (ID, name, image, genres).
- **`user_artist_experiences`**: Link table between users and artists, tracking specific event details (date, venue, rating).

Row Level Security (RLS) is enabled on all tables to ensure data privacy and integrity.

## Development Workflow

### Prerequisites
- Node.js (v16+)
- Supabase Project
- Spotify Developer Account

### Environment Setup
Create a `.env` file in the root directory with the following keys:
```env
VITE_SPOTIFY_CLIENT_ID=...
VITE_SPOTIFY_CLIENT_SECRET=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Key Commands
- **Install Dependencies:** `npm install`
- **Start Dev Server:** `npm run dev`
- **Build for Production:** `npm run build`
- **Lint Code:** `npm run lint`

### Conventions
- **Styling:** Use Tailwind CSS utility classes.
- **Components:** Functional components with Hooks.
- **Imports:** Absolute imports are not configured; use relative paths.
- **Formatting:** Prettier (implied).

## Notes
- **Unused Dependencies:** `appwrite` appears in `package.json` but is likely unused in favor of Supabase.
- **Deployment:** The project is built with Vite and can be deployed to any static host (Vercel, Netlify, etc.).
- **Database Changes:** Always update `setup.sql` when modifying the database schema to keep a record of changes.
