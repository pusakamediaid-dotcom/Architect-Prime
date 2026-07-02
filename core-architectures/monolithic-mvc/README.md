# Monolithic MVC Architecture

A clean, traditional backend-frontend architecture following the Model-View-Controller pattern.

## Structure

```
monolithic-mvc/
├── app/
│   ├── controllers/
│   ├── models/
│   ├── views/
│   ├── middleware/
│   └── routes/
├── config/
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── database/
│   ├── migrations/
│   └── seeders/
├── tests/
├── .env.example
└── server.js
```

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

## Features

- Express.js backend
- EJS templating
- MySQL/PostgreSQL support
- Session-based auth
- RESTful routing
