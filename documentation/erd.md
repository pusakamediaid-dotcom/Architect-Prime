# Database Schema (ERD)

## Users Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL |
| role | ENUM | DEFAULT 'user' |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

## Posts Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY (users.id) |
| title | VARCHAR(255) | NOT NULL |
| content | TEXT | NOT NULL |
| published | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

## Relationships

- Users → Posts: One-to-Many
- Users can have many Posts
- Posts belong to one User

## Diagram

\`\`\`
┌─────────────┐       ┌─────────────┐
│   users     │       │    posts    │
├─────────────┤       ├─────────────┤
│ id (PK)     │──1:N──│ user_id (FK)│
│ name        │       │ id (PK)     │
│ email       │       │ title       │
│ password    │       │ content     │
│ role        │       │ published   │
│ created_at  │       │ created_at  │
│ updated_at  │       │ updated_at  │
└─────────────┘       └─────────────┘
\`\`\`
