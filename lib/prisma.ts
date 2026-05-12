import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Database operations will fail.');
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
