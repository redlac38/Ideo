# Ideo — Political Ideology Platform

Build your ideal country across 14 dimensions and save your analysis to the cloud.

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import it in Vercel (Framework: Next.js).
3. Add a **Vercel Postgres** database in the Vercel dashboard.
4. Copy the connection strings into your project Environment Variables.
5. Run the schema SQL against your database (see `src/lib/schema.sql`).
6. Deploy.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values.

| Variable | Description |
|----------|-------------|
| `POSTGRES_URL` | Vercel Postgres connection string |
| `POSTGRES_URL_NON_POOLING` | Non-pooling connection string |
| `POSTGRES_USER` | Database user |
| `POSTGRES_HOST` | Database host |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DATABASE` | Database name |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry (e.g. 7d) |
| `NEXT_PUBLIC_APP_URL` | Your app URL |
