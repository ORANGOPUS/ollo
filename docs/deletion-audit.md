# ollo account deletion audit

Repo: `ORANGOPUS/ollo` at `99dbbad`. Date: 9 October 2026. This is based on reading the code only; nothing was run against a live database.

## Before this change

Both dashboards called `supabase.rpc('delete_user')`, with no confirmation, error handling or sign-out. The RPC is defined only in the Supabase database, not in the repo, so what it actually deletes can't be checked from the code. The Prisma schema shows why it probably doesn't delete everything:

| Data | Where | Removed by the old flow? |
|---|---|---|
| Auth user, identities, sessions, refresh tokens, MFA | `auth.*` | Likely yes, if `delete_user` deletes from `auth.users` (these cascade) |
| Profile (incl. `spotify` + `spotify_refresh` tokens, custom CSS/HTML, PayPal, Discord ID) | `public.profiles` | **Unknown.** Not linked to `auth.users` in the schema, so it doesn't cascade |
| Posts | `public.posts` | **No cascade.** The link to profiles is `NO ACTION`, so a profile delete fails while posts exist |
| Replies (by the user, and on the user's posts) | `public.replies` | **No cascade** (`NO ACTION`) |
| Likes the user made | `public.likes` | **No.** `user_id` has no foreign key at all |
| Social links | `public.socials` | **No cascade** (`NO ACTION`) |
| Layouts | `public.layouts` | **No cascade** (`NO ACTION`) |
| Stream records | `public.streams` | **No cascade** (`NO ACTION`) |
| Uploaded avatar | Supabase Storage `uploads/public/avatars/<id>?updated` | **No.** Storage files are never deleted by SQL |
| GetStream live calls and recordings | GetStream | **No.** Not touched |
| Sign-in audit log (IP addresses) | `auth.audit_log_entries` | **No.** No user link; kept under Supabase's log retention |

## Fixed in the PR

- New `server/api/delete-account.post.ts` deletes, in one transaction: likes and replies (by the user and on their posts), posts, socials, layouts, streams, the profile (including Spotify tokens), then `auth.users` (which cascades identities, sessions, refresh tokens and MFA).
- New `composables/useDeleteAccount.ts` (used by both dashboards):
  - asks for confirmation;
  - removes the uploaded avatar from storage;
  - calls the endpoint and signs out;
  - shows an error if anything fails.
- The "don't share your data with third parties" text in the app dashboard was wrong: Supabase, Vercel, Discord, GetStream, Spotify and Canny all process data. It now links to the privacy notice.

## Not fixed: needs a decision or access beyond the repo

1. **GetStream data.** Livestream calls are keyed by username, and recordings may exist. Deleting them needs the GetStream server secret on the server. Add a server-side GetStream delete call (calls and recordings for the user) to `delete-account`.
2. **GetStream token exposed in the browser.** `stores/getstream.client.ts` uses a single shared `VITE_APP_TOKEN` in client code, for a user called `orangopus`. Anyone can take it from the JavaScript bundle and act as that user. Issue short-lived tokens for each user from a server endpoint instead.
3. **`delete_user` RPC.** No code calls it any more. Review it in Supabase, then drop it or make it match the new endpoint.
4. **Storage key.** Avatars are saved under a literal `?updated` suffix (`public/avatars/<id>?updated`). The new flow deletes that exact key. Older uploads under other keys, and the custom background images, aren't covered. Check the `uploads` bucket for other keys that contain a user's ID.
5. **Spotify.** Deleting the profile deletes the tokens, but Spotify has no API to revoke an app's access. Users can remove ollo in their Spotify account settings; the privacy notice says this.
6. **Foreign keys.** Consider making the `public.*` user foreign keys `ON DELETE CASCADE` and linking `profiles.id` to `auth.users.id`. That way deleting the user in the Supabase dashboard also cleans up everything.
