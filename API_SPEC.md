# Backend API Specification

## Overview

REST API for the Looper App social platform. Handles user management, track uploads, social interactions, and content discovery.

## Base URL

```
Production: https://api.looperapp.com
Development: http://localhost:3000
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "displayName": "string"
}

Response: 201 Created
{
  "user": User,
  "token": "string"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response: 200 OK
{
  "user": User,
  "token": "string"
}
```

### Users

#### Get User
```
GET /users/:userId

Response: 200 OK
User
```

#### Get Current User
```
GET /users/me
Auth: Required

Response: 200 OK
User
```

#### Update User
```
PATCH /users/:userId
Auth: Required (own profile only)
Content-Type: application/json

{
  "displayName": "string",
  "bio": "string",
  "website": "string",
  ...
}

Response: 200 OK
User
```

#### Search Users
```
GET /users/search?q=<query>&page=1&pageSize=20

Response: 200 OK
User[]
```

### Tracks

#### Upload Track
```
POST /tracks
Auth: Required
Content-Type: multipart/form-data

Fields:
- title: string
- description: string (optional)
- audioFile: File (audio)
- projectFile: File (JSON)
- coverImage: File (optional)
- tags: string (JSON array)
- isPublic: boolean
- isRemixable: boolean
- remixMetadata: string (JSON, optional)

Response: 201 Created
Track
```

#### Get Track
```
GET /tracks/:trackId

Response: 200 OK
Track
```

#### Update Track
```
PATCH /tracks/:trackId
Auth: Required (owner only)
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "tags": ["string"],
  "isPublic": boolean
}

Response: 200 OK
Track
```

#### Delete Track
```
DELETE /tracks/:trackId
Auth: Required (owner only)

Response: 204 No Content
```

#### Get User Tracks
```
GET /users/:userId/tracks?page=1&pageSize=20

Response: 200 OK
Track[]
```

#### Download Project File
```
GET /tracks/:trackId/project

Response: 200 OK
ProjectFile
```

#### Get Remixes
```
GET /tracks/:trackId/remixes?page=1&pageSize=20

Response: 200 OK
Track[]
```

#### Get Remix Chain
```
GET /tracks/:trackId/remix-chain

Response: 200 OK
Track[]
```

### Feeds

#### Get Feed
```
GET /feed/:type?page=1&pageSize=20

Types: trending, new, recommended, following, remixes

Response: 200 OK
{
  "id": "string",
  "type": "string",
  "tracks": Track[],
  "pagination": {
    "page": number,
    "pageSize": number,
    "totalCount": number,
    "hasMore": boolean
  }
}
```

### Search

#### Search Tracks
```
GET /tracks/search?q=<query>&page=1&pageSize=20

Response: 200 OK
Track[]
```

#### Search by Tag
```
GET /tracks/by-tag?tag=<tag>&page=1&pageSize=20

Response: 200 OK
Track[]
```

### Social Interactions

#### Like Track
```
POST /tracks/:trackId/like
Auth: Required

Response: 200 OK
{
  "id": "string",
  "userId": "string",
  "trackId": "string",
  "createdAt": "ISO date"
}
```

#### Unlike Track
```
DELETE /tracks/:trackId/like
Auth: Required

Response: 204 No Content
```

#### Get Liked Tracks
```
GET /users/:userId/likes?page=1&pageSize=20

Response: 200 OK
Track[]
```

### Comments

#### Get Comments
```
GET /tracks/:trackId/comments?page=1&pageSize=20

Response: 200 OK
Comment[]
```

#### Add Comment
```
POST /tracks/:trackId/comments
Auth: Required
Content-Type: application/json

{
  "content": "string",
  "timestamp": number (optional, for time-based comments)
}

Response: 201 Created
Comment
```

#### Update Comment
```
PATCH /comments/:commentId
Auth: Required (owner only)
Content-Type: application/json

{
  "content": "string"
}

Response: 200 OK
Comment
```

#### Delete Comment
```
DELETE /comments/:commentId
Auth: Required (owner only)

Response: 204 No Content
```

#### Like Comment
```
POST /comments/:commentId/like
Auth: Required

Response: 200 OK
```

### Follow System

#### Follow User
```
POST /users/:userId/follow
Auth: Required

Response: 200 OK
{
  "id": "string",
  "followerId": "string",
  "followingId": "string",
  "createdAt": "ISO date"
}
```

#### Unfollow User
```
DELETE /users/:userId/follow
Auth: Required

Response: 204 No Content
```

#### Get Followers
```
GET /users/:userId/followers?page=1&pageSize=20

Response: 200 OK
User[]
```

#### Get Following
```
GET /users/:userId/following?page=1&pageSize=20

Response: 200 OK
User[]
```

### Sharing

#### Share Track
```
POST /tracks/:trackId/share
Auth: Required
Content-Type: application/json

{
  "platform": "string" (optional)
}

Response: 200 OK
{
  "id": "string",
  "userId": "string",
  "trackId": "string",
  "platform": "string",
  "createdAt": "ISO date"
}
```

### Notifications

#### Get Notifications
```
GET /notifications?page=1&pageSize=20
Auth: Required

Response: 200 OK
Notification[]
```

#### Mark as Read
```
POST /notifications/:notificationId/read
Auth: Required

Response: 200 OK
```

#### Mark All as Read
```
POST /notifications/read-all
Auth: Required

Response: 200 OK
```

## Data Models

### User
```typescript
{
  "id": "string",
  "username": "string",
  "displayName": "string",
  "email": "string",
  "avatarUrl": "string",
  "bio": "string",
  "website": "string",
  "socialLinks": {
    "instagram": "string",
    "twitter": "string",
    "soundcloud": "string",
    "youtube": "string"
  },
  "stats": {
    "followers": number,
    "following": number,
    "tracksCount": number,
    "remixesCount": number,
    "likesReceived": number
  },
  "metadata": {
    "joinedAt": "ISO date",
    "lastActive": "ISO date",
    "verified": boolean
  }
}
```

### Track
```typescript
{
  "id": "string",
  "title": "string",
  "description": "string",
  "authorId": "string",
  "author": User,
  "projectId": "string",
  "audioUrl": "string",
  "coverImageUrl": "string",
  "waveformData": number[],
  "duration": number,
  "bpm": number,
  "key": "string",
  "tags": string[],
  "isPublic": boolean,
  "isRemixable": boolean,
  "originalTrackId": "string",
  "remixChain": string[],
  "stats": {
    "plays": number,
    "likes": number,
    "comments": number,
    "remixes": number,
    "shares": number
  },
  "metadata": {
    "createdAt": "ISO date",
    "updatedAt": "ISO date",
    "publishedAt": "ISO date"
  }
}
```

### Comment
```typescript
{
  "id": "string",
  "trackId": "string",
  "authorId": "string",
  "author": User,
  "content": "string",
  "timestamp": number,
  "parentCommentId": "string",
  "likes": number,
  "metadata": {
    "createdAt": "ISO date",
    "updatedAt": "ISO date",
    "edited": boolean
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Common Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

- **Authenticated**: 1000 requests/hour
- **Unauthenticated**: 100 requests/hour
- **Upload**: 10 tracks/hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

## Webhooks (Optional)

For real-time features, consider implementing webhooks:

- `track.created`
- `track.liked`
- `track.commented`
- `user.followed`
- `remix.created`

## Implementation Notes

### Storage
- Audio files: S3-compatible storage with CDN
- Project files: Database (JSON/JSONB column)
- Images: Image CDN with transformations

### Database Schema
- Use PostgreSQL or MongoDB
- Index: userId, trackId, createdAt, tags
- Full-text search on: title, description, tags

### Caching
- Redis for session storage
- Cache trending/popular feeds
- Cache user profiles

### Background Jobs
- Generate waveforms after upload
- Process audio encoding
- Update statistics
- Send notifications

### Security
- Validate file uploads (size, type)
- Scan for malware
- Content moderation queue
- CSRF protection
- Rate limiting per IP and user
