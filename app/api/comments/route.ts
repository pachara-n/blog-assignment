import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const THAI_REGEX = /^[ก-๙0-9\s.,!?]+$/u

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { blogId, authorName, content } = body

  if (!blogId || !authorName?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 })
  }

  if (!THAI_REGEX.test(content.trim())) {
    return NextResponse.json({ error: 'ข้อความรองรับเฉพาะภาษาไทยและตัวเลขเท่านั้น' }, { status: 422 })
  }

  const blog = await prisma.blog.findUnique({ where: { id: blogId }, select: { id: true } })
  if (!blog) return NextResponse.json({ error: 'ไม่พบบทความ' }, { status: 404 })

  const comment = await prisma.comment.create({
    data: { blogId, authorName: authorName.trim(), content: content.trim() },
  })

  return NextResponse.json(comment, { status: 201 })
}
