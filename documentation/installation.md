# Installation Guide

## Prerequisites

- Git
- Node.js 18+
- Python 3.10+
- Docker (optional)

## Quick Start

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/pusakamediaid-dotcom/Architect-Prime.git
cd Architect-Prime
\`\`\`

### 2. Choose Your Module

#### Python Data Science
\`\`\`bash
cd multi-language-modules/python-data-science
pip install -r requirements.txt
\`\`\`

#### Node.js TypeScript
\`\`\`bash
cd multi-language-modules/nodejs-typescript
npm install
\`\`\`

#### Go High Performance
\`\`\`bash
cd multi-language-modules/go-high-performance
go mod download
\`\`\`

### 3. Run with Docker
\`\`\`bash
cd devops-and-automation
docker-compose up -d
\`\`\`

## Configuration

Copy `.env.example` to `.env` and configure:

\`\`\`bash
cp .env.example .env
\`\`\`

## Troubleshooting

Q: Module not found?
A: Ensure you ran the install command for the specific module.

Q: Port already in use?
A: Change the port in the configuration file.
