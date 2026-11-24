# Security review notes

## Findings requiring backend verification
- The frontend stores the bearer token and serialized user profile in browser local storage. Treat this as accessible to any script running in the origin; keep dependencies and rendered HTML safe, and consider an HttpOnly, Secure, SameSite cookie session if the API architecture supports it.
- The UI grants all displayed permissions when the local profile says `userName === "admin"` or `groupName === "SuperAdmin"`. This is only a presentation convenience, never an authorization boundary. The ASP.NET API must independently authorize every protected read and write using trusted server-side claims/roles.
- The public API helper sends requests without authentication. Confirm that every endpoint it calls is intentionally public and that member-specific data is not exposed.

## Changes in this branch
- Ignore local `.env*` files while allowing a committed `.env.example` template.
- No tracked environment file or application data was removed.
