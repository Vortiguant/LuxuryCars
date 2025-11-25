# Luxury Cars (Demo)

This demo stores bookings, reviews, and basic account data in browser `localStorage`.

## Authentication note
Passwords are hashed with SHA-256 before being written to the `lux-users` key to avoid storing them in plain text. This is suitable for demo purposes only because storage and verification all happen client-side. For any production deployment, replace this local approach with a managed authentication provider (e.g., Auth0, Cognito, Clerk) or a server-backed identity service that can securely handle credential storage, session management, and multi-factor protections.
