# Serverless Cloud Architecture

AWS Lambda and Firebase Functions based serverless architecture.

## Providers

- AWS Lambda (Node.js, Python)
- Firebase Cloud Functions (TypeScript)
- Vercel Serverless Functions

## Structure

```
serverless-cloud/
├── aws-lambda/
│   ├── functions/
│   ├── layers/
│   └── serverless.yml
├── firebase-functions/
│   ├── functions/
│   │   ├── src/
│   │   └── package.json
│   └── firebase.json
└── vercel/
    └── api/
```

## Quick Start

### AWS Lambda
```bash
cd aws-lambda
serverless deploy
```

### Firebase
```bash
cd firebase-functions
npm install
firebase deploy --only functions
```

## Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| helloWorld | HTTP | Basic endpoint |
| processImage | S3 | Image processing |
| sendEmail | Queue | Email sending |
| analytics | CloudWatch | Analytics processing |
