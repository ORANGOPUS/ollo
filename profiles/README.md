# Profiles for the read-only ollo

Every file in this folder is one public profile on the GitHub Pages version of
ollo (`https://ollo.thng.my/`). Files starting with `_` are ignored.

**Everything you put here is public**, and stays in this repository's git
history even after you delete it. Only add what you're happy for anyone to see.

## Add your profile

1. Copy `_template.json` to `profiles/<username>.json`. The quickest way is the
   "Add your profile" page on the site, which opens GitHub's editor with the
   template filled in.
2. Edit the fields (rules below) and open a pull request.
3. A check runs on your pull request and tells you if anything needs fixing.
4. Once a maintainer merges it, your page appears at
   `https://ollo.thng.my/<username>/` within a few minutes.

## Fields

| Field | Required | Rules |
|---|---|---|
| `username` | yes | Must match the filename. 2–30 characters: `a-z`, `0-9`, `.`, `_`, `-`; starts and ends with a letter or number. |
| `displayName` | yes | 1–50 characters |
| `bio` | no | Up to 280 characters |
| `tint` | no | One of `#04d87f` `#fdd35c` `#7ec8ff` `#ff9f7a` `#c9a6ff` `#8fe3c4`. Picked from your username if left out. |
| `avatar` | no | `avatars/<username>.png` (or `.jpg` / `.webp`), max 1 MB, added in the same pull request. Uses the ollo default avatar if left out. |
| `links` | no | Up to 12 items of `{ "label": "...", "url": "https://..." }`. Labels up to 40 characters; only `https://` links. |

There's no custom HTML or CSS. Anyone can open a pull request, so profiles
can't run scripts or load trackers.

## Change or delete your profile

- **Change it:** edit your file in a pull request.
- **Delete it:** open a pull request that removes your file (and your avatar).
  The next deploy takes it off the site.
- **Remove it from git history as well:** contact Orangopus Collective (see
  the privacy notice on the site). This needs a maintainer to rewrite history.
