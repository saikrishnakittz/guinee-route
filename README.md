# GuinéeRoute — Operations Command Center

A React-based operations dashboard for monitoring field agents and active missions along the RN1 corridor between Coyah and Dubréka.

## Features

- KPI bar for agents on duty, active missions, and offline alerts.
- RN1 corridor view with agent markers.
- Live mission drawer with progress, distance, duration, and recorded violations.

Only claim features that are implemented and verified in the submitted version.

## Tech Stack

- React and Vite
- Node.js and Express
- Prisma ORM
- PostgreSQL

## Project Structure

```text
guinee-route/
├── client/                 # React + Vite dashboard
└── server/                 # Express API and Prisma
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.js
    └── src/
        ├── routes/
        ├── app.js
        └── prisma.js
```

Adjust this tree if your current repository differs.

## Prerequisites

- Node.js and npm
- PostgreSQL
- Git

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/saikrishnakittz/guinee-route.git
cd guinee-route
```

### 2. Install and configure the backend

```bash
cd server
npm install
```

Create `server/.env` with your local PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/guinee_route?schema=public"
```

Replace the placeholders with your local credentials. Never commit `.env` or real credentials.

Run migrations and seed data using the scripts configured in `server/package.json`. Common commands are:

```bash
npx prisma migrate deploy
npm run seed
```

For a fresh development database, `npx prisma migrate dev` may be appropriate instead. Use the scripts that match your project configuration.

Start the backend:

```bash
npm run dev
```

The API is expected at `http://localhost:5000` if that is the port configured in your app.

### 3. Install and start the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite, commonly `http://localhost:5173`.

If the frontend uses an environment variable for the backend URL, configure it for your local environment. Never put database credentials in frontend variables.

## API Endpoints

- `GET /api/v1/dashboard/stats` — dashboard KPI data
- `GET /api/v1/agents/live` — agent data and live positions



