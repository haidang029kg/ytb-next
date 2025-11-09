# API Integration Status

## Overview

This document tracks the integration status between the ytb-next frontend and ytb-api backend.

**Last Updated:** 2025-11-09

---

## Authentication API ✅ FIXED

### Backend Endpoints (ytb-api)

Located in: `src/api/auth/api.py`
Router prefix: `/auth`

| Endpoint                                 | Method | Purpose              | Status         |
| ---------------------------------------- | ------ | -------------------- | -------------- |
| `/auth/registration`                     | POST   | Register new user    | ✅ Implemented |
| `/auth/registration/confirmation`        | GET    | Verify email         | ✅ Implemented |
| `/auth/registration/confirmation/resend` | POST   | Resend verification  | ✅ Implemented |
| `/auth/token`                            | POST   | Login (get tokens)   | ✅ Implemented |
| `/auth/token/refresh`                    | POST   | Refresh access token | ✅ Implemented |
| `/auth/me`                               | GET    | Get current user     | ✅ Implemented |

### Frontend Integration

Located in: `lib/api.ts`

**Changes Made:**

- ✅ Updated `/register` → `/auth/registration`
- ✅ Updated `/login` → `/auth/token`
- ✅ Updated `/refresh-token` → `/auth/token/refresh`
- ✅ Updated `/current-user` → `/auth/me`

### Authentication Flow

#### Registration Flow ✅ UPDATED

1. User submits registration form
2. Frontend calls `POST /auth/registration` with:
   - `username` (required)
   - `email` (required)
   - `password` (required)
   - `confirm_password` (required)
3. Backend validates passwords match and creates user
4. Backend sends verification email
5. User receives email and clicks verification link
6. User must verify email via `GET /auth/registration/confirmation?token=...`
7. After verification, user can login

**Note:** Registration does NOT auto-login users. Email verification is required first.

#### Login Flow ✅ UPDATED

1. User submits login form with `username` (or email) and `password`
2. Frontend calls `POST /auth/token` with `application/x-www-form-urlencoded` data (OAuth2 standard)
3. Backend returns:
   ```json
   {
     "access_token": "...",
     "refresh_token": "...",
     "token_type": "Bearer"
   }
   ```
4. Frontend stores tokens in localStorage
5. Frontend fetches user data via `GET /auth/me`

#### Token Refresh ✅ WORKING

- Automatic via axios response interceptor
- On 401 error, attempts refresh using `POST /auth/token/refresh`
- Updates access_token automatically
- Redirects to login if refresh fails

---

## Video API ❌ NOT IMPLEMENTED

### Backend Status

Currently, the ytb-api backend only has:

- `GET /studio/info` - Empty endpoint (just returns status)

### Missing Backend Endpoints

The frontend expects these endpoints, but they **DO NOT EXIST** in the backend:

| Endpoint                              | Method | Purpose               | Backend Status     |
| ------------------------------------- | ------ | --------------------- | ------------------ |
| `/studio/videos`                      | GET    | Get all public videos | ❌ Not implemented |
| `/studio/videos/{id}`                 | GET    | Get video by ID       | ❌ Not implemented |
| `/studio/videos/my-videos`            | GET    | Get user's videos     | ❌ Not implemented |
| `/studio/videos`                      | POST   | Create video metadata | ❌ Not implemented |
| `/studio/videos/{id}`                 | PATCH  | Update video metadata | ❌ Not implemented |
| `/studio/videos/{id}`                 | DELETE | Delete video          | ❌ Not implemented |
| `/studio/videos/presigned-upload-url` | GET    | Get S3 upload URL     | ❌ Not implemented |
| `/studio/videos/{id}/upload-complete` | PATCH  | Mark upload complete  | ❌ Not implemented |

### Affected Frontend Pages

These pages will show error messages until backend endpoints are implemented:

1. **`/shorts`** - Public video viewer
   - Uses: `GET /studio/videos`
   - Shows: "Failed to load videos" error

2. **`/studio`** - Creator dashboard
   - Uses: `GET /studio/videos/my-videos`
   - Uses: `DELETE /studio/videos/{id}`
   - Shows: "Failed to load videos" error

3. **`/studio/upload`** - Video upload
   - Uses: `POST /studio/videos`
   - Uses: `GET /studio/videos/presigned-upload-url`
   - Uses: `PATCH /studio/videos/{id}/upload-complete`
   - Will fail during upload process

4. **`/studio/videos/{id}/edit`** - Edit video
   - Uses: `GET /studio/videos/{id}`
   - Uses: `PATCH /studio/videos/{id}`
   - Shows: Error when loading/saving

5. **`/video/{id}`** - Video player
   - Uses: `GET /studio/videos/{id}`
   - Shows: Error when loading

---

## Backend Implementation Checklist

To make the frontend fully functional, the ytb-api backend needs:

### 1. Database Models

- [ ] Video model with fields:
  - `id`, `title`, `description`
  - `video_url`, `thumbnail_url`
  - `user_id` (foreign key)
  - `processing_status` (pending/processing/completed/failed)
  - `views`, `likes`
  - `created_at`, `updated_at`

### 2. Video Endpoints

- [ ] `GET /studio/videos` - List all public completed videos
- [ ] `GET /studio/videos/{id}` - Get video details
- [ ] `GET /studio/videos/my-videos` - List current user's videos (requires auth)
- [ ] `POST /studio/videos` - Create video metadata (requires auth)
- [ ] `PATCH /studio/videos/{id}` - Update video (requires auth + ownership)
- [ ] `DELETE /studio/videos/{id}` - Delete video (requires auth + ownership)

### 3. S3 Upload Integration

- [ ] `GET /studio/videos/presigned-upload-url` - Generate S3 presigned URL
  - Query params: `filename`, `content_type`
  - Returns: `upload_url`, `video_url` (final S3 location)
- [ ] `PATCH /studio/videos/{id}/upload-complete` - Mark video uploaded
  - Body: `video_url`
  - Triggers: HLS processing job

### 4. Video Processing

- [ ] HLS transcoding (convert video to multiple quality levels)
- [ ] Generate m3u8 playlist
- [ ] Update video status: pending → processing → completed/failed
- [ ] Generate thumbnail from video

### 5. Additional Features

- [ ] View count tracking
- [ ] Like/unlike functionality
- [ ] Comment system (optional)

---

## Environment Configuration

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend

Required environment variables for video functionality:

- AWS credentials (for S3 upload)
- S3 bucket name
- Video processing service configuration

---

## Testing Recommendations

### Phase 1: Authentication (✅ Ready to Test)

1. Test registration → check email → verify → login flow
2. Test token refresh on 401 errors
3. Test logout and protected routes

### Phase 2: Video API (❌ Blocked - Backend Not Ready)

1. Cannot test until backend endpoints are implemented
2. Frontend code is ready and will work once backend is available

---

## Known Issues

### 1. Video Pages Show Errors ⚠️

**Cause:** Backend video endpoints don't exist yet
**Impact:** All video-related pages show error messages
**Fix:** Implement backend video API

### 2. Email Verification Required

**Cause:** Backend enforces email verification before login
**Impact:** Users cannot login immediately after registration
**Fix:** This is expected behavior - inform users via UI (✅ already implemented)

### 3. No Error Boundary

**Cause:** No global error handling in Next.js app
**Impact:** API errors only show component-level messages
**Fix:** Add error boundary component (optional enhancement)

---

## Migration Notes

### Changes from Old API Structure

**Authentication:**

- `/register` → `/auth/registration` ✅
- `/login` → `/auth/token` ✅
- `/refresh-token` → `/auth/token/refresh` ✅
- `/current-user` → `/auth/me` ✅

**Registration Fields:**

- Old: `email`, `password`, `full_name`
- New: `username`, `email`, `password`, `confirm_password` ✅
- Added: Username field and password confirmation

**Registration Response:**

- Old: Returned `{ access_token, refresh_token, user }`
- New: Returns only `{ user }` - requires email verification first ✅

**Login Format:**

- Old: JSON with `{ username, password }`
- New: Form data (application/x-www-form-urlencoded) - OAuth2 standard ✅

**Login Response:**

- Old: May have included user object
- New: Only returns `{ access_token, refresh_token, token_type }` ✅
- Fix: Added second call to `/auth/me` to fetch user data ✅

---

## Contact & Support

For backend API questions, refer to:

- Repository: https://github.com/haidang029kg/ytb-api
- Backend structure: FastAPI with SQLAlchemy
- Auth implementation: `src/api/auth/api.py`
- Studio endpoints: `src/api/studio/api.py` (minimal implementation)
