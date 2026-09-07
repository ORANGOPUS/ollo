import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Returns the caller's own full profile row, including the columns
// anon/authenticated can no longer SELECT directly (spotify,
// spotify_refresh) -- safe here because it's scoped to the
// authenticated caller's own id, not an arbitrary row.
export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    return await prisma.profiles.findUnique({ where: { id: user.id } })
})
