# Library Management Frontend

This directory contains the Vite + React + TypeScript application for the library-management frontend.

## Requirements

- Node.js and npm

## Setup

```bash
npm ci
npm run dev
```

## Checks

```bash
npm run lint
npm test
npm run build
```

## Configuration and security

The frontend calls a separately hosted API. Review `vite.config.ts` and the API helpers before changing endpoint configuration. Use HTTPS for production deployments. Client-side route guards are only a user-experience feature; authorization must be enforced by the API.

Never commit real credentials or personal data. The root repository README contains project scope, related repositories, contribution guidance, and licensing information.
