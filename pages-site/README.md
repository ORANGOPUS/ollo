# Read-only ollo on GitHub Pages

A static version of ollo: public profiles from `profiles/*.json`, built into
plain HTML and published to the `gh-pages` branch. There's no server, no
database and no sign-in. GitHub is the store, and pull requests are the edit
button.

## How it works

- `profiles/<username>.json` holds one public profile (rules in `profiles/README.md`).
- `pages-site/build.mjs` validates every profile and writes `pages-site/dist/`.
  It uses only Node built-ins.
- `.github/workflows/pages-validate.yml` runs the build on pull requests and
  explains any errors in the log.
- `.github/workflows/pages-deploy.yml` builds on every merge to `main` and
  force-pushes `dist/` to `gh-pages`.
- The privacy contact and controller come from `legal` in `app.config.ts`,
  shared with the full app.

## One-time setup

1. Merge this to `main`. The first deploy creates the `gh-pages` branch.
2. Go to **Settings → Pages**, set **Source: Deploy from a branch**, **Branch:
   `gh-pages` / root**, then save.
3. The site appears at `https://orangopus.github.io/ollo/`. If the repo is
   renamed, update the `/ollo/` paths in `404.html` (in `build.mjs`).

## Run locally

```sh
node pages-site/build.mjs          # validate + build into pages-site/dist
node pages-site/build.mjs --check  # validate only
```

## Not included (compared with ollo.bio)

Sign-in, posting, likes, live streaming, Spotify, custom CSS/HTML and custom
domains. Those need the server and database the full app uses.
