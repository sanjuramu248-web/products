import { PrismaClient } from "@prisma/client";

// create global type
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// create prisma instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

// store in global (dev only)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
