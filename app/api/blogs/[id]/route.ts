import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// แปลง title เป็น URL-safe slug: lowercase, เว้นวรรค→ขีด, ตัดอักขระพิเศษออก
// ภาษาไทยจะถูกตัดออกทั้งหมด เพราะ URL ไม่ควรมี non-ASCII characters
function slugify(title: string) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const blog = await prisma.blog.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: 'asc' } } },
  })
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(blog)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, content, coverImageUrl, slug: rawSlug } = body

  if (!title || !content || !coverImageUrl) {
    return NextResponse.json({ error: 'title, content และ coverImageUrl จำเป็นต้องกรอก' }, { status: 400 })
  }

  const slug = rawSlug ? rawSlug.trim() : slugify(title)
  // NOT: { id: params.id } ยกเว้น blog ตัวเองออกจากการเช็ค
  // เพราะถ้า slug ไม่เปลี่ยน การ findFirst จะเจอตัวเองและ return error โดยไม่จำเป็น
  const existing = await prisma.blog.findFirst({ where: { slug, NOT: { id: params.id } } })
  if (existing) return NextResponse.json({ error: 'slug นี้ถูกใช้งานแล้ว' }, { status: 409 })

  const blog = await prisma.blog.update({
    where: { id: params.id },
    data: { title, content, coverImageUrl, slug },
  })

  return NextResponse.json(blog)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.blog.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
