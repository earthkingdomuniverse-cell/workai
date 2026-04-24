import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

/* eslint-disable no-var */
declare global {
  var __workaiPrisma: PrismaClient | undefined;
}
/* eslint-enable no-var */

const databaseUrl = env.DATABASE_URL || 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

export const prisma =
  globalThis.__workaiPrisma ??
  new PrismaClient({
    adapter,
  });

if (!globalThis.__workaiPrisma) {
  globalThis.__workaiPrisma = prisma;
}

export default prisma;
