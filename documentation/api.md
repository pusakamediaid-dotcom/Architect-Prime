# API Documentation

The primary runnable API is located in:

```text
multi-language-modules/nodejs-typescript
```

## Base URL

```text
http://localhost:3000
```

## Authentication

JWT is returned by register and login endpoints. Passwords are hashed with bcrypt and password hashes are never returned by the API.

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "Password123"
}
```

## Users

### Create User

```http
POST /api/users
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john@example.com",
  "password": "Password123",
  "role": "moderator"
}
```

### List Users

```http
GET /api/users?page=1&limit=20
```

### Get User

```http
GET /api/users/{id}
```

### Search Users

```http
GET /api/users/search?q=Jane&field=name
```

Allowed search fields:

- `name`
- `email`
- `role`
- `status`

### Update User

```http
PUT /api/users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Updated",
  "status": "active"
}
```

### Delete User

```http
DELETE /api/users/{id}
Authorization: Bearer <token>
```

## Documentation UI

Swagger UI is available at:

```text
http://localhost:3000/docs
```

## Error Shape

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error"
  }
}
```
