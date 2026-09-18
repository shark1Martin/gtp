# Guess the Porsche

A quick-fire quiz: look at a photo of a Porsche and pick the right model line
from four options. One round per model, with a score and a rank at the
end. Sign in to save your scores and appear on the leaderboard.

## Stack

- [TanStack Start](https://tanstack.com/start) with React 19 (file-based
  routing, server-side rendering)
- Tailwind CSS v4
- [Supabase](https://supabase.com) for accounts, score saving, and the
  leaderboard
- Vite for development, Nitro for the production server build

## Getting started

Requires Node.js 22 or newer and npm.

```sh
npm install
cp .env.example .env.local   # then fill in your Supabase URL and anon key
npm run dev                  # http://localhost:8080
```

The app reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at startup and
will not boot without them, so the Supabase setup below is required even if
you only want to play the quiz locally.

### Supabase setup

1. Create a project at supabase.com.
2. In the SQL editor, run the files in `supabase/` in order:
   `schema.sql`, then `002_display_name.sql`, then `003_hardening.sql`.
3. Copy the project URL and anon key from Project Settings into `.env.local`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload on port 8080 |
| `npm run build` | Production build (server + client) into `.output/` |
| `npm run preview` | Serve the production build locally |
| `npm run generate:cars` | Rebuild the car photo manifest (also runs automatically before `dev` and `build`) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Adding cars and photos

Photos live in `public/cars/<model-id>/`, one folder per model, with files
named by angle (`front.jpg`, `side.jpg`, `side-2.jpg`, ...). See
[public/cars/README.md](public/cars/README.md) for the naming convention,
photo attribution, and how to register a brand-new model.

## Project layout

```
src/routes/            File-based routes. __root.tsx is the app shell,
                       index.tsx is the quiz, leaderboard.tsx the standings.
                       routeTree.gen.ts is generated; don't edit it by hand.
src/lib/quiz-data.ts   Model list, photo credits, question generator
src/lib/auth.tsx       Supabase auth context (sign up / in / out)
src/lib/supabase.ts    Supabase client
src/components/        Auth dialog and the shadcn dialog primitive it uses
src/server.ts          Server entry wrapper that renders a friendly 500 page
src/start.ts           Request middleware (error page + CSRF protection)
src/styles.css         Tailwind theme, fonts, and quiz animations
scripts/               generate-car-manifest.mjs
supabase/              SQL to set up the database
public/cars/           Car photos, one folder per model
```

## Deploying

`npm run build` produces a self-contained Node server in `.output/`. Run it
with:

```sh
node .output/server/index.mjs
```

To target a specific host instead (Cloudflare, Vercel, Netlify, ...), pass a
preset to `nitro()` in `vite.config.ts`, for example
`nitro({ preset: "cloudflare-module" })`, or set the `NITRO_PRESET`
environment variable at build time.
