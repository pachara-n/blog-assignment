import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Next.js dev mode รัน HMR (Hot Module Reload) ซ้ำๆ ทำให้สร้าง PrismaClient ใหม่ทุกครั้ง
// และ connection pool เต็มเร็วมาก แก้โดยเก็บ instance ไว้บน globalThis ซึ่งไม่ถูก reload
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
