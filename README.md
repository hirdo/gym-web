# GymTrack

<p align="center">
  <img src="public/favicon.svg" alt="Gym Track Logo" width="120" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-19-dd0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.3-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-12-dd2c00?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase" />
  <img src="https://img.shields.io/badge/Keycloak-26-4d4d4d?style=for-the-badge&logo=keycloak&logoColor=white" alt="Keycloak" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

A gym-themed fitness tracking web application with real-time data sync, Keycloak authentication, and a bold dark-mode UI.

---

## Tech Stack

| Layer | Technology | Description |
|:---:|---|---|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" width="20" /> | **Angular 19** | Standalone Components, Signals, zoneless-ready |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="20" /> | **TypeScript 5.7** | Strict mode, type-safe throughout |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="20" /> | **Tailwind CSS 4.3** | Dark theme, CSS-native `@theme` tokens |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" width="20" /> | **Firebase 12** | Firestore real-time sync, `onSnapshot` subscriptions |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="20" /> | **Keycloak 26** | OpenID Connect, PKCE S256, SSO-ready |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg" width="20" /> | **Vercel** | Static SPA deployment, build-time env injection |

## Features

- **Workout Tracking** — Log exercises, sets, reps, and weights per session
- **Smart Scheduling** — Weekly calendar view, drag workouts into your plan
- **Real-Time Sync** — Firestore `onSnapshot` keeps data live across devices
- **Auth & SSO** — Keycloak login/register with social provider support (Google, GitHub)
- **Membership Tiers** — Basic (free), Premium, Elite plans
- **Admin Panel** — User management, role-based access control
- **Dark Mode UI** — Orange primary (`#f97316`), green accent (`#22c55e`), OLED-friendly

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
  core/
    guards/          - Route protection (auth, admin)
    interceptors/    - HTTP interceptors (bearer token)
    models/          - TypeScript interfaces (Workout, User)
    services/        - AuthService, FirestoreService, WorkoutService
  shared/
    components/      - Navbar, Footer, LoadingSpinner
    pipes/           - Custom pipes
  features/
    admin/           - Admin panel (user management, stats)
    dashboard/       - User dashboard (workout summary)
    landing/         - Public landing page (hero, features, pricing)
    membership/      - Membership plans & upgrade
    profile/         - User profile settings
    schedule/        - Weekly workout calendar
    workouts/        - Workout CRUD
      workout-create/  - Create/edit workout form
      workout-detail/  - Single workout view
      workout-list/    - All workouts list
```

## Deployment (Vercel)

Set these environment variables in Vercel project settings:

| Variable | Description |
|---|---|
| `KEYCLOAK_URL` | Keycloak URL with `/auth` suffix if needed |
| `KEYCLOAK_REALM` | Realm name |
| `KEYCLOAK_CLIENT_ID` | Client ID |
| `FIREBASE_API_KEY` | Firebase API key |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `FIREBASE_APP_ID` | Firebase app ID |

The build command `npm run build:vercel` runs `scripts/set-env.js` to inject these into the production environment at build time.

> **Note:** Cloud-IAM uses the `/auth` path prefix — set `KEYCLOAK_URL` to `https://<instance>.cloud-iam.com/auth`

## Keycloak Production Setup

For production, you need a Keycloak server accessible via HTTPS.

### Cloud-IAM (Recommended)

Managed Keycloak-as-a-Service — no Docker, no server management, always online:

1. Sign up at [cloud-iam.com](https://www.cloud-iam.com)
2. Create a Keycloak instance (free tier: 1 realm, 100 users)
3. Your instance URL: `https://<your-instance>.cloud-iam.com/auth`
4. Create realm and client (Public, OpenID Connect)
5. Set `KEYCLOAK_URL` in Vercel to your Cloud-IAM URL (with `/auth`)

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
