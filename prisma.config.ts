import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
    // Direct (non-pooled) connection used by Prisma migrations
    // Required when DATABASE_URL points to a PgBouncer pooled endpoint (e.g. Supabase)
    directUrl: process.env.DIRECT_URL,
  },
})
