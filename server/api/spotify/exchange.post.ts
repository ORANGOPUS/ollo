import { serverSupabaseClient } from '#supabase/server';

// Server-only: exchanges a Spotify OAuth authorization code for tokens
// using the client secret, which must never reach the browser bundle.
export default defineEventHandler(async (event) => {
    const user = await requireUser(event)

    const body = await readBody(event)
    const code = body?.code
    const redirect_uri = body?.redirect_uri
    if (typeof code !== 'string' || !code || typeof redirect_uri !== 'string' || !redirect_uri) {
        throw createError({ statusCode: 400, statusMessage: 'Missing code or redirect_uri' })
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    if (!clientId || !clientSecret) {
        throw createError({ statusCode: 500, statusMessage: 'Spotify is not configured' })
    }

    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id: clientId,
        client_secret: clientSecret,
    })

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
    })

    if (!response.ok) {
        throw createError({ statusCode: 502, statusMessage: 'Spotify code exchange failed' })
    }

    const data = await response.json()

    const supabase = await serverSupabaseClient(event)
    await supabase
        .from('profiles')
        .update({ spotify: data.access_token, spotify_refresh: data.refresh_token })
        .eq('id', user.id)

    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
    }
})
