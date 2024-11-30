// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'minimal',
  })
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      log: [
        {
          emit: 'stdout',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
      errorFormat: 'pretty',
    })
  }
  prisma = global.cachedPrisma
}

// Middleware for error handling
prisma.$use(async (params, next) => {
  try {
    return await next(params)
  } catch (error) {
    console.error('Database error:', {
      error,
      model: params.model,
      action: params.action,
      args: params.args,
    })
    throw error
  }
})

// Cleanup on exit
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export const db = prisma