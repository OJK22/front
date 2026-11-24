# Tulkarm Municipality Public Library Management System

A React + TypeScript frontend for a municipal public-library system. The application code in this repository is organized into public-facing pages and staff workflows for library operations.

> **Project scope:** This repository contains the frontend only. The API and database are maintained separately and are not included here.

## Main areas

The current source tree includes these application areas:

- **Public portal:** home, about, services, contact, news/posts, search, member profile, and online borrowing-request entry points.
- **Library operations:** book catalog screens, adding and editing book records, barcode workflows, deletion, and reports.
- **Borrowing and subscriptions:** subscriber and guarantor workflows, new and renewed subscriptions, loans, returns, late-return handling, online requests, alerts, and reports.
- **Administration:** employee and group management, permission-aware navigation, dashboard statistics, and reporting components.

The exact availability of each operation depends on the separately deployed API and the permissions returned by that service.

## Technology

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS and shadcn/ui
- Vitest and ESLint

## Requirements

- Node.js and npm compatible with the versions in `package.json` and `package-lock.json`.

## Run locally

Run these commands from this directory (the `LibraryProject-main` directory):

```bash
npm ci
npm run dev
```

Vite serves the app on port `5001` by default.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

These commands are documented from the package scripts; they have not been represented as passing until run in a local or CI environment.

## API and deployment notes

The development Vite configuration proxies `/api`, `/api/Cms`, and `/media` to the API/media hosts currently configured in `vite.config.ts`. Those development proxy targets currently use HTTP. Production deployments should use HTTPS and an appropriately configured reverse proxy or secure API base URL. Do not assume the development proxy is a production deployment configuration.

Authentication state is currently handled in the browser by the frontend. Client-side route guards and permission-based UI controls are not a substitute for authorization on the API: the server must validate every protected operation.

## Related repositories

- [Books management UI](https://github.com/OJK22/books)
- [Staff administration UI](https://github.com/OJK22/admin)
- [Lending prototype](https://github.com/OJK22/loan) — experimental and not a production replacement for the main system.

## Security

Please do not submit real member records, passwords, access tokens, or production database exports in issues or pull requests. Report security concerns privately to the project maintainer.

## License and project rights

No open-source license is currently included in this repository. Until the rights holder(s) explicitly select and add an OSI-approved license, do not assume that the code is licensed for reuse. Confirm the municipality's and project contributors' rights before publishing a license.
