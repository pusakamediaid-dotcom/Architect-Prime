# 🏗️ Architect-Prime

> Multi-architecture academic and professional boilerplate ecosystem for Engineering, IT, and Data Science projects.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/pusakamediaid-dotcom/Architect-Prime/ci.yml?label=CI)](https://github.com/pusakamediaid-dotcom/Architect-Prime/actions)

<p align="center">
  <img src="assets/academic-workflow-realistic.png" alt="Architect-Prime academic software development workflow" width="100%">
</p>

---

## Overview

Architect-Prime is a structured repository for learning, building, and explaining modern software architecture. It keeps the original big vision: multiple architectures, multiple languages, DevOps automation, documentation utilities, academic templates, and cloud/serverless references.

The repository is now documented honestly: the **Node.js TypeScript API** is the primary runnable demo, while several advanced stacks are maintained as scaffolds or previews until their full runtime profiles are completed.

---

## Module Status

| Area | Module | Status | Validation Command |
|---|---|---|---|
| Primary API | `multi-language-modules/nodejs-typescript` | Ready baseline | `npm ci && npm run build && npm test` |
| Data Science | `multi-language-modules/python-data-science` | Preview | `python -m compileall -q ...` |
| Go Service | `multi-language-modules/go-high-performance` | Preview | `go test ./...` |
| PHP Modern | `multi-language-modules/php-modern` | Laravel-style scaffold | `composer validate` |
| Microservices | `core-architectures/microservices-clean` | Advanced scaffold | Compose profile pending full Dockerfiles |
| Serverless AWS | `core-architectures/serverless-cloud/aws-lambda` | Scaffold | `serverless package` |
| Firebase | `core-architectures/serverless-cloud/firebase-functions` | Scaffold | `npm run build` inside `functions` |
| DevOps | `devops-and-automation/docker-compose/docker-compose.demo.yml` | Ready config | `docker compose -f ... config` |

---

## Features

- Modular architecture references: MVC, microservices, serverless, language modules.
- Runnable Node.js TypeScript API with Express, validation, JWT, bcrypt, Swagger UI, tests, and Prisma schema scaffold.
- Python academic utilities and data-science pipeline templates.
- Go, PHP, AWS Lambda, and Firebase scaffolds for expansion.
- DevOps profile with Docker Compose demo and Kubernetes manifest.
- CI pipeline for Python compile checks, Node build/test/audit, and Docker Compose config validation.
- Product-grade documentation files: roadmap, support, security, changelog, and setup script.

<p align="center">
  <img src="assets/repository-modules-realistic.png" alt="Architect-Prime modular repository organization" width="100%">
</p>

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/pusakamediaid-dotcom/Architect-Prime.git
cd Architect-Prime
```

### 2. Setup

```bash
cp .env.example .env
bash setup.sh
```

### 3. Run Primary Node.js API

```bash
cd multi-language-modules/nodejs-typescript
npm run dev
```

Open:

- Health check: <http://localhost:3000/health>
- Swagger UI: <http://localhost:3000/docs>

### 4. Run Validation

```bash
make build
make test
```

<p align="center">
  <img src="assets/devops-demo-realistic.png" alt="Architect-Prime local DevOps demo setup" width="100%">
</p>

---

## Architecture

```text
Architect-Prime/
├── .github/workflows/                 # CI and security automation
├── academic-utilities/                # LaTeX, Markdown, chart/report utilities
├── core-architectures/                # MVC, microservices, serverless references
├── devops-and-automation/             # Docker Compose, Kubernetes, scripts
├── documentation/                     # API, ERD, installation docs
├── multi-language-modules/            # Node.js, Python, Go, PHP modules
├── .env.example                       # Safe local configuration template
├── Makefile                           # Developer commands
├── setup.sh                           # Bootstrap script
└── README.md
```

---

## Examples

### Create a User in the Node API

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Password123"}'
```

### Python Compile Check

```bash
python3 -m compileall -q academic-utilities multi-language-modules/python-data-science devops-and-automation
```

### Docker Demo Config Validation

```bash
docker compose -f devops-and-automation/docker-compose/docker-compose.demo.yml config
```

---

## Roadmap

See [`ROADMAP.md`](ROADMAP.md).

---

## Troubleshooting

### `npm ci` fails

Delete `node_modules` in the Node module and retry:

```bash
cd multi-language-modules/nodejs-typescript
rm -rf node_modules
npm ci
```

### Port 3000 already used

```bash
PORT=3001 npm run dev
```

### Production JWT error

Set a strong secret:

```bash
export JWT_SECRET="replace-with-a-long-random-secret"
```

---

## FAQ

### Is every module production-ready?

No. The primary Node.js module is the runnable baseline. Other modules are preserved and improved as scaffolds/previews for learning and expansion.

### Can this be used as a commercial product base?

Yes, after adapting the scaffold modules, configuring secrets, adding your business-specific persistence, and running your own security review.

### Why keep preview/scaffold modules?

Architect-Prime is intended to be a broad architecture reference. The goal is to improve quality without deleting the original multi-stack vision.

<p align="center">
  <img src="assets/academic-documentation-realistic.png" alt="Architect-Prime academic documentation toolkit" width="100%">
</p>

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`SUPPORT.md`](SUPPORT.md).

---

## Security

See [`SECURITY.md`](SECURITY.md).

---

## License

MIT License. See [`LICENSE`](LICENSE).
