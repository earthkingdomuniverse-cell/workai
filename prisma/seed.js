// Lightweight DB seed script (best-effort, safe for environments without migrations)
let prisma = null
try {
  // eslint-disable-next-line global-require
  const { PrismaClient } = require('@prisma/client')
  prisma = new PrismaClient()
} catch {
  // No Prisma client available; skip seeding
}

async function main() {
  if (!prisma) {
    console.log('Prisma client not available. Skipping seed.')
    return
  }
  try {
    const t = await prisma.thread?.create({
      data: {
        id: 'seed_1',
        topic: 'Seed Thread',
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }).catch(() => null)
    if (t) {
      await prisma.message?.create({
        data: {
          id: 'seed_msg_1',
          threadId: t.id,
          senderId: 'seed',
          text: 'seed message',
          timestamp: new Date().toISOString(),
        },
      }).catch(() => null)
    }
  } catch (e) {
    console.log('Seed encountered error (likely due to missing migrations):', (e && (e.message || e.toString())))
  } finally {
    if (prisma?.$disconnect) {
      await prisma.$disconnect()
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
