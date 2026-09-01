# GymTrack

![Angular](https://img.shields.io/badge/Angular-19-dd0031?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06b6d4?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12-dd2c00?logo=firebase&logoColor=white)
![Keycloak](https://img.shields.io/badge/Keycloak-26-4d4d4d?logo=keycloak&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?logo=vercel&logoColor=white)

A gym-themed fitness tracking web application with real-time data sync, Keycloak authentication, and a bold dark-mode UI.

## Tech Stack

- **Frontend:** Angular 19 (Standalone Components, Signals)
- **Auth:** Keycloak (keycloak-angular v19 + keycloak-js v26)
- **Database:** Firebase Firestore (real-time sync, `firebase` v12)
- **Styling:** Tailwind CSS v4 (Dark theme, Orange primary, Green accent)
- **Deployment:** Vercel (Static SPA)
- **State:** Angular Signals + Firestore real-time subscriptions

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

### 3. Configure Firebase

Update `src/environments/environment.ts` with your Firebase project credentials:

```typescript
firebase: {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.firebasestorage.app',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
}
```

### 4. Start the dev server

```bash
ng serve
```

Open `http://localhost:4200`

## Project Structure

```
src/app/
  core/           - Guards, interceptors, services, models
  shared/         - Navbar, footer, loading spinner, pipes
  features/
    admin/        - Admin panel (user management)
    dashboard/    - User dashboard
    landing/      - Public landing page
    membership/   - Membership plans
    profile/      - User profile
    schedule/     - Weekly workout calendar
    workouts/     - Workout CRUD (list, create, detail)
```

## Deployment (Vercel)

Set these environment variables in Vercel project settings:

| Variable | Description |
|---|---|
| `KEYCLOAK_URL` | Production Keycloak URL (HTTPS) |
| `KEYCLOAK_REALM` | Realm name (default: `gym-app`) |
| `KEYCLOAK_CLIENT_ID` | Client ID (default: `gym-web-client`) |
| `FIREBASE_API_KEY` | Firebase API key |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `FIREBASE_APP_ID` | Firebase app ID |

The build command `npm run build:vercel` runs `scripts/set-env.js` to inject these into the production environment at build time.

## Keycloak Production Setup

For production, you need a Keycloak server accessible via HTTPS.

### Cloud-IAM (Recommended)

Managed Keycloak-as-a-Service — no Docker, no server management, always online:

1. Sign up at [cloud-iam.com](https://www.cloud-iam.com)
2. Create a Keycloak instance (free tier: 1 realm, 100 users)
3. Your instance URL: `https://<your-instance>.cloud-iam.com`
4. Create realm `gym-app` and client `gym-web-client`
5. Set `KEYCLOAK_URL` in Vercel to your Cloud-IAM URL

### Self-Hosted Alternatives

| Option | Notes |
|---|---|
| **Railway.app** | Free trial credit, Docker support |
| **Fly.io** | Free tier VM with Docker |
| **Render.com** | Free tier (512MB RAM, cold starts) |
| **Any VPS** | Docker + `quay.io/keycloak/keycloak:26.0` |
| **Phase Two** | Managed Keycloak with extensions (free tier) |

### Production Client Config

- Client type: Public (OpenID Connect)
- Valid redirect URIs: `https://your-domain.vercel.app/*`
- Web origins: `https://your-domain.vercel.app`
- PKCE: S256
