// Server-only: exchanges a Spotify refresh token for a new access token
// using the client secret, which must never reach the browser bundle.
export default defineEventHandler(async (event) => {
    await requireUser(event)

    const body = await readBody(event)
    const refresh_token = body?.refresh_token
    if (typeof refresh_token !== 'string' || !refresh_token) {
        throw createError({ statusCode: 400, statusMessage: 'Missing refresh_token' })
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    if (!clientId || !clientSecret) {
        throw createError({ statusCode: 500, statusMessage: 'Spotify is not configured' })
    }

    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
        client_id: clientId,
        client_secret: clientSecret,
    })

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
    })

    if (!response.ok) {
        throw createError({ statusCode: 502, statusMessage: 'Spotify token refresh failed' })
    }

    const data = await response.json()
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refresh_token,
    }
})
