# API Documentation

The primary runnable API is located in:

```text
multi-language-modules/nodejs-typescript
```

## Base URL

```text
http://localhost:3000
```

## Endpoints

### Health

```http
GET /health
```

### Register Demo User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123"
}
```

### Login Demo User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "Password123"
}
```

### Create User

```http
POST /api/users
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123"
}
```

### List Users

```http
GET /api/users
```

Swagger UI is available at:

```text
http://localhost:3000/docs
```
