import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const user = await requireUser(event)

    const body = await readBody(event)
    const content = typeof body?.content === 'string' ? body.content.trim() : ''
    if (!content || content.length > 2000) {
        throw createError({ statusCode: 400, statusMessage: 'Post content must be between 1 and 2000 characters' })
    }

    const res = await prisma.posts.create({
        data: {
            content,
            user_id: user.id
        }
    })

    return res;
})
