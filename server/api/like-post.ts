import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const user = await requireUser(event)

    const body = await readBody(event)
    const post_id = Number(body?.post_id)
    if (!Number.isInteger(post_id)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid post_id' })
    }

    try {
        const res = await prisma.likes.create({
            data: {
                user_id: user.id,
                post_id
            }
        })
        return res;
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            throw createError({ statusCode: 409, statusMessage: 'Already liked' })
        }
        throw err;
    }
})
