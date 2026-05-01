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
- PocketBase (Auth, Database, Storage)
- Spotify Web API

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A running PocketBase instance (single binary, < 50 MB RAM)
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
   VITE_PB_URL=http://127.0.0.1:8090
   ```

4. **PocketBase Setup**

   a. Download the binary for your platform from <https://pocketbase.io/docs/> and run it:
      ```bash
      ./pocketbase serve
      ```

   b. Open the admin UI at <http://127.0.0.1:8090/_/> and create the first admin account.

   c. Import the schema:
      - Go to **Settings → Import collections**
      - Paste the contents of `pb_schema.json`
      - Click **Review** then **Confirm and import**

   d. (Optional) Enable Google OAuth:
      - Go to **Collections → users → Edit collection → Options → OAuth2**
      - Toggle **Google** on and paste your Google OAuth client ID and secret
      - Add your app's origin to your Google Cloud OAuth consent screen

   The schema sets up:
   - The built-in `users` auth collection extended with profile fields (name, country, social URLs, avatar file field)
   - `artists` collection (Spotify ID is used as the record ID)
   - `experiences` collection linking users to artists with a unique `(user_id, artist_id)` index
   - Collection rules equivalent to the previous Supabase RLS policies

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Database Schema

### users (auth collection)
- Built-in PocketBase auth collection (email + password + optional OAuth2)
- Extended with: `name`, `avatar` (file), `country`, `twitter_url`, `spotify_url`, `soundcloud_url`, `youtube_url`
- The auth user record _is_ the profile — no separate profiles table

### artists
- Stores Spotify artist information
- Uses the Spotify ID as the record ID
- Fields: `name`, `image_url`, `spotify_url`, `genres` (json), `followers`

### experiences
- Links users with artists they've seen
- Fields: `user_id`, `artist_id`, `event_name`, `city`, `country`, `attended_with` (multi-relation to users)
- Unique constraint on `(user_id, artist_id)`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## File Storage

Profile pictures are stored as the `avatar` file field on the `users` collection. PocketBase generates thumbnails automatically (`100x100`, `300x300`) and serves the file at `${VITE_PB_URL}/api/files/<collectionId>/<recordId>/<filename>`. The frontend uses `pb.files.getUrl(record, record.avatar)` to build URLs.
