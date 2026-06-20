import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function slugify(title: string) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const perPage = 10

  const where = {
    isPublished: true,
    ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
  }

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: perPage,
      skip: (page - 1) * perPage,
      select: { id: true, title: true, slug: true, coverImageUrl: true, createdAt: true, viewCount: true },
    }),
    prisma.blog.count({ where }),
  ])

  return NextResponse.json({ blogs, total, page, perPage })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, content, coverImageUrl, slug: rawSlug } = body

  if (!title || !content || !coverImageUrl) {
    return NextResponse.json({ error: 'title, content และ coverImageUrl จำเป็นต้องกรอก' }, { status: 400 })
  }

  const slug = rawSlug ? rawSlug.trim() : slugify(title)
  const existing = await prisma.blog.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: 'slug นี้ถูกใช้งานแล้ว' }, { status: 409 })

  const blog = await prisma.blog.create({
    data: { title, content, coverImageUrl, slug },
  })

  return NextResponse.json(blog, { status: 201 })
}
