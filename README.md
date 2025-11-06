# YTB Next.js Frontend

A modern video streaming platform frontend built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🔐 **User Authentication** - Register, login, and session management
- 🎥 **Video Browsing** - Discover and watch videos
- ▶️ **HLS Video Player** - Adaptive bitrate streaming with HLS.js
- 📹 **Content Creator Studio** - Manage your uploaded videos
- ⬆️ **Direct S3 Upload** - Fast video uploads to AWS S3
- ✏️ **Video Management** - Edit metadata and delete videos
- 📱 **Responsive Design** - Works on desktop and mobile

## Prerequisites

- Node.js 18+ and npm
- Backend API running (see [ytb backend repo](https://github.com/haidang029kg/ytb))

## Getting Started

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Replace the URL with your backend API endpoint.

3. **Run the development server:**

```bash
npm run dev
```

4. **Open the application:**

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ytb-next/
├── app/                      # Next.js app directory
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── studio/              # Creator studio
│   │   ├── upload/          # Video upload
│   │   └── videos/[id]/edit # Edit video
│   ├── video/[id]/          # Video player page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── Navbar.tsx           # Navigation bar
│   ├── VideoCard.tsx        # Video thumbnail card
│   └── VideoPlayer.tsx      # HLS video player
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication state
└── lib/                     # Utilities
    └── api.ts               # API client with axios
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend integrates with the YTB backend API for:

- User authentication (register, login, token refresh)
- Video CRUD operations
- S3 presigned URL generation for uploads
- Video processing status tracking

See `lib/api.ts` for the complete API client implementation.

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework
- **Axios** - HTTP client with interceptors
- **HLS.js** - HTTP Live Streaming player
- **React Context** - State management

## Features in Detail

### Authentication
- JWT-based authentication with access and refresh tokens
- Automatic token refresh on expiration
- Protected routes for authenticated users

### Video Player
- Adaptive bitrate streaming (HLS)
- Multiple quality levels (360p, 720p, 1080p)
- Fallback for Safari native HLS support
- Error handling and recovery

### Video Upload
- Multi-step upload process:
  1. Create video metadata
  2. Get S3 presigned URL
  3. Direct upload to S3
  4. Trigger HLS processing
- Upload progress indicator
- Processing status tracking

### Creator Studio
- View all uploaded videos
- Track processing status
- Edit video metadata
- Delete videos

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

## License

ISC
