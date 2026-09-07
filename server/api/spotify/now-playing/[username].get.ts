import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Public endpoint (profile pages show "now playing" to anonymous visitors
// too) but the Spotify tokens themselves never leave the server: this
// looks them up via Prisma (not exposed through /api/profiles), calls
// Spotify, refreshes with the client secret if needed, and returns only
// the now-playing payload.
export default defineEventHandler(async (event) => {
    const username = getRouterParam(event, 'username')
    if (!username) {
        throw createError({ statusCode: 400, statusMessage: 'Missing username' })
    }

    const profile = await prisma.profiles.findFirst({
        where: { username },
        select: { id: true, spotify: true, spotify_refresh: true },
    })

    if (!profile?.spotify) {
        return { item: null }
    }

    async function fetchNowPlaying(accessToken: string) {
        return fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
    }

    let response = await fetchNowPlaying(profile.spotify)

    if (response.status === 401 && profile.spotify_refresh) {
        const clientId = process.env.SPOTIFY_CLIENT_ID
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
        if (clientId && clientSecret) {
            const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: profile.spotify_refresh,
                    client_id: clientId,
                    client_secret: clientSecret,
                }),
            })
            if (refreshResponse.ok) {
                const tokens = await refreshResponse.json()
                await prisma.profiles.update({
                    where: { id: profile.id },
                    data: {
                        spotify: tokens.access_token,
                        spotify_refresh: tokens.refresh_token || profile.spotify_refresh,
                    },
                })
                response = await fetchNowPlaying(tokens.access_token)
            }
        }
    }

    if (response.status === 204 || !response.ok) {
        return { item: null }
    }

    const data = await response.json().catch(() => null)
    if (!data?.item) {
        return { item: null }
    }

    return {
        item: {
            name: data.item.name,
            artists: data.item.artists?.map((a: any) => ({ name: a.name })) || [],
            album: {
                name: data.item.album?.name,
                images: data.item.album?.images || [],
            },
            duration_ms: data.item.duration_ms,
        },
        progress_ms: data.progress_ms,
        is_playing: data.is_playing,
    }
})
