import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const user = await requireUser(event)

    const id = Number(event.context.params.id)
    const like = await prisma.likes.findUnique({ where: { id } })
    if (!like) {
        throw createError({ statusCode: 404, statusMessage: 'Like not found' })
    }
    if (like.user_id !== user.id) {
        throw createError({ statusCode: 403, statusMessage: 'You can only remove your own likes' })
    }

    const deleted = await prisma.likes.delete({
        where: { id }
    })

    return deleted;
})
