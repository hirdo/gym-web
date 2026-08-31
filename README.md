# GymTrack

A gym-themed fitness tracking web application built with Angular 19, Keycloak authentication, and deployed on Vercel.

## Tech Stack

- **Frontend:** Angular 19 (Standalone Components, Signals)
- **Auth:** Keycloak (keycloak-angular v19 + keycloak-js v26)
- **Styling:** Tailwind CSS v4 (Dark theme, Red/Gold accents)
- **Deployment:** Vercel (Static SPA)
- **State:** Angular Signals + localStorage

## Getting Started

### Prerequisites

- Node.js >= 22.x
- Docker & Docker Compose (for local Keycloak)

### 1. Install dependencies

```bash
npm install
```

### 2. Start Keycloak (local)

```bash
cd docker
docker compose up -d
```

Keycloak will be available at `http://localhost:8080`
- Admin console: `http://localhost:8080/admin` (admin / admin)
- Test user: `testuser@gymtrack.app` / `testpass123`

### 3. Start the dev server

```bash
ng serve
```

Open `http://localhost:4200`

## Project Structure

```
src/app/
  core/           - Guards, services, models
  shared/         - Navbar, footer, shared components
  features/       - Landing, dashboard, workouts, schedule, membership, profile
```

## Deployment (Vercel)

Set these environment variables in Vercel:

| Variable | Description |
|---|---|
| `KEYCLOAK_URL` | Production Keycloak URL |
| `KEYCLOAK_REALM` | Realm name (default: `gym-app`) |
| `KEYCLOAK_CLIENT_ID` | Client ID (default: `gym-web-client`) |

The build command `npm run build:vercel` injects these into the production environment at build time.

## Keycloak Production Setup

For production, you need a Keycloak server accessible via HTTPS. Options:
1. **Self-hosted** on Fly.io, Railway, or any VPS with Docker
2. **Managed** via cloud-iam.com or Phase Two (free tier available)

Production client config:
- Client type: Public (OpenID Connect)
- Valid redirect URIs: `https://your-domain.vercel.app/*`
- Web origins: `https://your-domain.vercel.app`
- PKCE: S256
