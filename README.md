<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a38c776d-77e0-46cf-9e63-b9431cc0be75

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend API

The Express API is mounted under `/api` and uses PostgreSQL through Drizzle ORM.

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and a long random `JWT_SECRET`.
2. Generate and apply the database migration:
   `npm run db:generate` then `npm run db:migrate`
3. Start the app with `npm run dev`.

Available API groups include:

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- `GET /api/progress/:userId`, `/api/recommendations/:userId`, `/api/analytics/:userId`
- `GET /api/foundations/:userId`, `POST /api/lesson/complete`, `POST /api/challenge/submit`
- `POST /api/savePrompt`, `GET /api/achievements/:userId`, `GET /api/certificate/:userId`
- `GET /api/seo/:page`

Protected endpoints require `Authorization: Bearer <token>`. For a Vercel frontend, set
`FRONTEND_URL` on the backend to the frontend origin; multiple origins may be comma-separated.

### Free-tier deployment

- Deploy the Vite frontend to Vercel.
- Deploy the Node/Express server to Render or Railway.
- Create a PostgreSQL database on the same provider and run `npm run db:migrate` during deployment.
- Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and `GEMINI_API_KEY` in the backend environment.
