import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, slug: true, isPublished: true,
      createdAt: true, viewCount: true, coverImageUrl: true,
    },
  })

  return NextResponse.json(blogs)
}
