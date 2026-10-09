import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Deletes everything ollo stores for the signed-in user, in one transaction.
// Replaces the old `delete_user` RPC, whose definition lives only in the
// database and couldn't be reviewed. Most public tables reference profiles
// with ON DELETE NO ACTION, so children are removed explicitly before the
// profile and the auth user.
export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    const id = user.id

    await prisma.$transaction(async (tx) => {
        const ownPosts = await tx.posts.findMany({ where: { user_id: id }, select: { id: true } })
        const postIds = ownPosts.map((p) => p.id)

        // Likes and replies the user made, and those on the user's own posts
        await tx.likes.deleteMany({ where: { OR: [{ user_id: id }, { post_id: { in: postIds } }] } })
        await tx.replies.deleteMany({ where: { OR: [{ user_id: id }, { post_id: { in: postIds } }] } })
        await tx.posts.deleteMany({ where: { user_id: id } })

        await tx.socials.deleteMany({ where: { user_id: id } })
        await tx.layouts.deleteMany({ where: { id } })
        // `streams` is @@ignore'd in Prisma (no unique id), so use raw SQL
        await tx.$executeRaw`DELETE FROM public.streams WHERE user_id = ${id}::uuid`

        // Profile row also holds the Spotify access/refresh tokens
        await tx.profiles.deleteMany({ where: { id } })

        // Cascades to identities, sessions, refresh tokens and MFA factors
        await tx.users.deleteMany({ where: { id } })
    })

    return { deleted: true }
})
