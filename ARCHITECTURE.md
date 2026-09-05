# Architecture

ollo is a [Nuxt 3](https://nuxt.com/) application: Vue 3 on the frontend, Nuxt's
Nitro server for API routes, [Supabase](https://supabase.com/) for auth and
Postgres, and [Prisma](https://www.prisma.io/) as the client used to query that
same database from server routes.

```
Browser (Vue pages/components)
        │
        │  fetch()
        ▼
Nitro server routes (server/api/*)
        │
        │  Prisma Client
        ▼
Supabase Postgres (auth + public schemas)
```

Supabase also handles authentication directly from the client via
`@nuxtjs/supabase`; Prisma is used for reading/writing `public` schema data
(posts, likes, profiles, socials) from the server routes.

## Layers

### Pages (`pages/`)

File-based routing via Nuxt:

- `index.vue` — landing page
- `login.vue` — Supabase-backed auth
- `home.vue` / `explore.vue` — feed and profile discovery
- `[profile].vue` — public profile page, rendered per-user (custom CSS/HTML supported)
- `dashboard.vue` — the signed-in user's own dashboard: posts, settings, account deletion
- `[username]/live.vue` — watch a user's live stream
- `[username]/spotify.vue` — a user's now-playing Spotify overlay

### Layouts (`layouts/`)

- `default.vue` — standard chrome (nav, etc.) for normal pages
- `overlays.vue` — bare layout used for embeddable overlays (e.g. Spotify/stream widgets)

### Components (`components/`)

Reusable UI: `Nav`, `Tab`/`TabsWrapper` (settings tabs), `Content` (post
rendering), `Like`, `Chat`, `Video`, `Broadcast`/`Recordings` (live streaming),
`Spotify` (now-playing widget), `Canny` (feedback widget).

### State (`stores/`)

[Pinia](https://pinia.vuejs.org/) stores hold client-side state. Currently:

- `getstream.client.ts` — wraps `@stream-io/video-client` to create/join/leave
  livestream calls and expose reactive local/remote participant state.

### Plugins (`plugins/`)

Nuxt plugins injected app-wide:

- `pinia.ts` — installs the Pinia store
- `dayjs.ts` — relative-time formatting
- `spotify.ts` — Spotify OAuth refresh-token flow + "now playing" lookup
- `rawger.ts` — RAWG API client (game data, used for the "game" profile field)

### Server API (`server/api/`)

Nitro request handlers, each a thin wrapper around Prisma:

| Route | Method | Purpose |
| --- | --- | --- |
| `posts.ts` | GET | list posts |
| `create-post.ts` | POST | create a post |
| `delete-post/[id].ts` | DELETE | delete a post by id |
| `likes.ts` | GET | list likes |
| `like-post.ts` | POST | like a post |
| `unlike-post/[id].ts` | DELETE | remove a like by id |
| `profiles.ts` | GET | list profiles |
| `socials.ts` | GET | list a profile's social links |

These routes are unauthenticated at the handler level — access control is
expected to happen via Supabase row-level security and/or the client only
calling them on behalf of the logged-in user. They are intentionally small;
business logic beyond basic CRUD lives in the calling page/component.

### Data model (`prisma/schema.prisma`)

Two schemas map to Supabase's structure:

- `auth.*` — Supabase-managed auth tables (`users`, `sessions`,
  `identities`, `refresh_tokens`, etc.). Not written to directly by app code.
- `public.*` — application tables:
  - `profiles` — one row per user: display name, bio, avatar, custom CSS/HTML,
    badges (`pro`/`staff`/`verified`/`mod`), Spotify/Discord/PayPal links, etc.
  - `posts` — a profile's posts, with `replies` and `likes` relations.
  - `likes` — join table between `posts` and users, unique per `(post_id, user_id)`.
  - `replies` — replies to a post.
  - `socials` — a profile's social/link buttons (icon, url, colors).
  - `streams` — livestream metadata per user.

## External services

- **Supabase** — auth, Postgres hosting, and (via `@nuxtjs/supabase`) session
  handling on the client.
- **Prisma** — typed query layer over the same Postgres database, used from
  Nitro server routes.
- **GetStream** (`@stream-io/video-client`) — livestream video and HLS ingest;
  driven by the `getstream` Pinia store.
- **Spotify Web API** — now-playing data via a refresh-token flow in
  `plugins/spotify.ts`.
- **Canny** — public feedback board, embedded via `components/Canny.vue`.
- **RAWG API** — game metadata for the profile "currently playing" field.

## Conventions

- Server routes are one file per endpoint under `server/api/`; dynamic
  segments (`[id].ts`) read `event.context.params`.
- Client state that needs to be reactive and shared across components goes in
  a Pinia store under `stores/`; otherwise prefer local component state.
- Per-profile customisation (`profiles.css`, `profiles.html`) is rendered on
  the public profile page (`pages/[profile].vue`) rather than baked into the
  build, so profile pages stay dynamic per row in the database.
