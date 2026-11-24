# Library Management System — Frontend

A React + TypeScript frontend for a library-management application. The application source lives in [`LibraryProject-main/`](./LibraryProject-main/).

## Repository layout

- `LibraryProject-main/` — Vite application source, dependencies, and development configuration.

## Stack

- React 18, TypeScript, and Vite
- React Router
- Tailwind CSS and shadcn/ui
- TanStack Query and Axios

## Local development

```bash
cd LibraryProject-main
npm ci
npm run dev
```

Run the available checks before submitting changes:

```bash
npm run lint
npm test
npm run build
```

## Configuration and security

The frontend communicates with a separately hosted API. Configure API endpoints for the target environment and use HTTPS in production. Frontend route guards and locally stored permissions are not security boundaries: the API must authenticate every request and enforce authorization server-side.

Do not commit real credentials, private keys, production data, or personal information. Use environment variables and provide placeholders in example configuration files.

## Related repositories

- [Books management UI](https://github.com/OJK22/books)
- [Staff administration UI](https://github.com/OJK22/admin)
- [Lending prototype](https://github.com/OJK22/loan)

The lending repository is an experimental prototype and is not a production-ready component.

## Contributing

Bug reports and focused pull requests are welcome. Include reproduction steps for bugs and describe the behavior changed by a pull request. Run the checks above and disclose any checks that could not be run.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
