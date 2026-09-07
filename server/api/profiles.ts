import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Only public-safe columns -- never select `spotify`/`spotify_refresh`
// (OAuth tokens) here; those are read server-side only, via the
// authenticated user's own session, by the /api/spotify/* routes.
export default defineEventHandler(async (event) => {
    return await prisma.profiles.findMany({
        select: {
            id: true,
            username: true,
            displayname: true,
            bio: true,
            avatar: true,
            game: true,
            pro: true,
            staff: true,
            verified: true,
            mod: true,
            background_url: true,
            background: true,
            css: true,
            html: true,
            pally: true,
            social: true,
            custom_domain: true,
        },
    })
})
