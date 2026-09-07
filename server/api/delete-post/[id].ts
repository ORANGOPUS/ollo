import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const user = await requireUser(event)

    const id = Number(event.context.params.id)
    const post = await prisma.posts.findUnique({ where: { id } })
    if (!post) {
        throw createError({ statusCode: 404, statusMessage: 'Post not found' })
    }
    if (post.user_id !== user.id) {
        throw createError({ statusCode: 403, statusMessage: 'You can only delete your own posts' })
    }

    const deleted = await prisma.posts.delete({
        where: { id }
    })

    return deleted;
})
