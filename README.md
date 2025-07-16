# ProID - Interactive Map of Singapore

A collaborative platform for building your dream Singapore through an interactive map where users can add contributions with text, images, videos, and audio.

## Features

- Interactive map of Singapore using Leaflet
- User authentication with Supabase
- Real-time collaborative contributions
- Media upload support (images, videos, audio)
- AI chatbot for suggestions
- Progress tracking

## Setup

### Prerequisites

- Node.js (v18 or higher)
- Bun (recommended) or npm
- Supabase account and project

### Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard under Settings > API.

### Installation

1. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

2. Start the development server:
   ```bash
   bun dev
   # or
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Database Setup

Run the SQL migrations in the `migrations/` folder in your Supabase SQL editor:

1. `database-setup.sql` - Creates the main tables
2. `profiles-table.sql` - Creates user profiles table
3. `map-markers.sql` - Creates map markers table
4. `storage-setup.sql` - Sets up storage buckets

## Authentication Issues

If you're experiencing authentication problems:

1. Check that your environment variables are set correctly
2. Ensure your Supabase project has authentication enabled
3. Check the browser console for any error messages
4. Use the "Debug Auth" button on the map page to test authentication

## Development

- Built with React 18 and Vite
- UI components using Chakra UI
- Map functionality with Leaflet
- Real-time updates with Supabase subscriptions
