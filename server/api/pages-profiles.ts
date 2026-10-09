import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Feeds the read-only site at ollo.thng.my (pages-site/build.mjs).
// Only people who switched on "Show my profile on ollo.thng.my", and only the
// fields that site shows. No custom CSS/HTML, payment or account details.
export default defineEventHandler(async () => {
    const rows = await prisma.profiles.findMany({
        where: { show_on_pages: true, username: { not: null } },
        select: {
            username: true,
            displayname: true,
            bio: true,
            avatar: true,
            socials: { select: { name: true, url: true } },
        },
    })
    return rows.map((p) => ({
        username: p.username,
        displayName: p.displayname,
        bio: p.bio,
        avatar: p.avatar,
        links: p.socials.map((s) => ({ label: s.name, url: s.url })),
    }))
})
