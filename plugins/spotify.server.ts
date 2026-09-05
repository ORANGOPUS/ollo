// Server-only: uses the Spotify client secret, which must never reach the browser bundle.
export default defineNuxtPlugin(() => {
  const clientID = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  const basic = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');
  const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

  const getAccessToken = async () => {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
    });
    return response.json();
  };

  const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';
  const getNowPlaying = async () => {
    const { access_token: accessToken } = await getAccessToken();
    return fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  return {
    provide: {
      spotify: {
        getNowPlaying,
      },
    },
  };
});
