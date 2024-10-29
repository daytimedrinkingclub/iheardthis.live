# IHeardThis.live

A platform for music enthusiasts to track and share their live music experiences. Users can search for artists they've seen live, add them to their profile, and build their personal concert history.

## Features

- 🎵 Search artists using Spotify API
- 🎫 Track live music experiences
- ⭐ Rate and add notes to experiences
- 🌍 Add event details like venue and location
- 🎨 Modern dark theme with neon accents

## Tech Stack

- React + Vite
- Tailwind CSS
- Supabase (Auth & Database)
- Spotify Web API

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Spotify Developer account

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/daytimedrinkingclub/iheardthis.live
   cd iheardthis.live
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
   VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Supabase Setup**

   a. Create a new Supabase project
   
   b. Enable Email Auth in Authentication settings
   
   c. Create Storage bucket:
      - Go to Storage in your Supabase dashboard
      - Create a new bucket named "images"
      - Make the bucket public
   
   d. Run the SQL setup script:
      - Go to SQL Editor in your Supabase dashboard
      - Copy contents from `setup.sql`
      - Run the script

   The setup includes:
   - Database tables and relationships
   - Row Level Security (RLS) policies
   - Storage bucket for profile images
   - Automated triggers and functions

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Database Schema

### Profiles
- Extends Supabase auth.users
- Stores user profile information
- Contains social media links

### Artists
- Stores Spotify artist information
- Uses Spotify ID as primary key
- Includes genres and image URLs

### User Artist Experiences
- Links users with artists they've seen
- Stores event details and ratings
- Supports multiple attendees

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Storage Structure

### Images Bucket
- Purpose: Stores user profile pictures and other images
- Access: Public read, authenticated write
- Location: `storage.objects` with bucket_id 'images'
- Policies:
  - Public can view all images
  - Authenticated users can upload images
  - Files are served via Supabase CDN