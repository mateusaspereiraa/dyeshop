import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var prisma: PrismaClient | undefined
}

let prisma: any

if (process.env.JEST_WORKER_ID) {
  // Minimal stub for tests; individual tests should mock methods as needed
  prisma = {
    order: { findUnique: async () => null, create: async () => null },
    product: { findUnique: async () => null, findFirst: async () => null }
  }
} else {
  prisma = global.prisma || new PrismaClient()
  if (process.env.NODE_ENV !== 'production') global.prisma = prisma
}

export default prisma
export { prisma }

