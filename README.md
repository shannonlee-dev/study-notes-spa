# Study Notes SPA

Study Notes is a React 18 single-page application for managing structured learning notes with Supabase-backed remote data. It supports listing, filtering, detail views, creation, editing, deletion, authentication-aware routes, and profile display.

The app is organized around predictable data flow: remote reads and mutations are isolated in feature hooks, reusable UI components stay domain-agnostic, and route guards keep protected actions separate from public navigation.

## Stack

- React 18
- Vite
- React Router
- Supabase JavaScript SDK
- CSS

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Environment

Copy `.env.example` to `.env` and fill in Supabase values.

```bash
cp .env.example .env
```

```text
VITE_SUPABASE_URL=<Supabase project URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
```

Real keys are excluded from Git and should be configured in the deployment dashboard.

## Data Model

Example `notes` table:

```sql
create table notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now()
);
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | App overview |
| `/login` | Supabase Auth login |
| `/notes` | Remote notes list, filter, empty state, error state |
| `/notes/:id` | Detail view and deletion |
| `/notes/new` | Protected create form |
| `/notes/:id/edit` | Protected edit form |
| `/profile` | Protected user profile |
| `*` | Not Found |

## Project Structure

```text
src/
├── components/
│   └── ui/              # domain-agnostic UI
├── features/
│   └── notes/
│       ├── components/  # notes-specific UI
│       └── hooks/       # remote data and mutations
├── layout/              # app shell and navigation
├── routes/              # route guards
├── pages/               # route-level screens
├── context/             # auth and toast state
└── lib/                 # Supabase client and validation helpers
```

## Design Notes

- `src/components/ui` contains reusable UI that does not know about Supabase or note records.
- `src/features/notes` owns note-specific forms, lists, reads, and mutations.
- Loading, error, and empty states are rendered through shared components.
- Controlled forms keep validation and previews predictable.
- Successful mutations navigate intentionally and surface feedback through toast state.
- `vercel.json` includes an SPA fallback so deep links resolve to `index.html`.
