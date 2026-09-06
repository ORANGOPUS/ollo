# ollo

one little link, organised.

ollo is a customisable page for your social media content. Open-source & 100% free to use.

## Features

- **Profiles & Dashboard** — a personal page for your posts, links, and socials
- **Explore** — discover other profiles on ollo
- **Posts** — create, like, and delete posts from your dashboard
- **Live streaming** — go live and chat with viewers, powered by [Stream](https://getstream.io/)
- **Spotify widget** — show what you're currently listening to, with automatic token refresh
- **Customisable settings** — tabbed settings with custom CSS support
- **Account management** — delete your account and associated data at any time

## Tech stack

- [Nuxt 3](https://nuxt.com/) / Vue 3
- [Supabase](https://supabase.com/) for auth and data
- [Prisma](https://www.prisma.io/) as the database client
- [Tailwind CSS](https://tailwindcss.com/) + [Nuxt UI](https://ui.nuxt.com/)
- [Pinia](https://pinia.vuejs.org/) for state management
- [GetStream](https://getstream.io/) for live video and chat
- [Capacitor](https://capacitorjs.com/) wraps the mobile UI (`pages/app/**`) as the Android app

## Getting started

Requires **Node.js 22+** (`.nvmrc`/`.node-version` are provided) — Supabase's
realtime client needs the native `WebSocket` global that Node only ships by
default from v22 onward, and it's constructed on every Supabase client, not
just realtime features.

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root with the variables your setup needs, for example:

```bash
DATABASE_URL=
SUPABASE_URL=
SUPABASE_KEY=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=
```

Start the dev server:

```bash
npm run dev
```

Other useful scripts:

```bash
npm run build     # build for production
npm run generate  # generate a static site
npm run preview   # preview the production build
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for how the pages, server API,
database, and third-party services fit together — including how the
[Android app](./ARCHITECTURE.md#mobile-app-android) is built.

## License

[MIT](./LICENSE)
