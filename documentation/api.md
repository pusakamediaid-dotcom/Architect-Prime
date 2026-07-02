# API Documentation

## REST API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request:**
\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "user": { "id": "1", "name": "John Doe", "email": "john@example.com" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`

#### POST /api/auth/login
Login user.

**Request:**
\`\`\`json
{
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`

### Users

#### GET /api/users
Get all users (requires authentication).

**Headers:**
\`\`\`
Authorization: Bearer <token>
\`\`\`

**Response:**
\`\`\`json
{
  "users": [...],
  "pagination": { "page": 1, "total": 50 }
}
\`\`\`

#### GET /api/users/{id}
Get user by ID.

#### PUT /api/users/{id}
Update user.

#### DELETE /api/users/{id}
Delete user.

## Error Responses

\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
\`\`\`

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |
