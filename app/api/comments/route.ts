import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const THAI_REGEX = /^[ก-๙0-9\s.,!?]+$/u

// จำกัด 5 ความคิดเห็นต่อ IP ต่อ 60 วินาที เพื่อป้องกัน spam
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const LIMIT = 5
const WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  if (entry.count >= LIMIT) return true
  entry.count++
  return false
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'ส่งความคิดเห็นบ่อยเกินไป กรุณารอสักครู่' }, { status: 429 })
  }

  const body = await req.json()
  const { blogId, authorName, content } = body

  if (!blogId || !authorName?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 })
  }

  // validate ฝั่ง server ซ้ำอีกรอบแม้ client จะ validate แล้ว
  // เพราะ API เปิดรับ request จากทุกที่ ไม่ใช่แค่จาก UI ของเรา
  if (!THAI_REGEX.test(content.trim())) {
    return NextResponse.json({ error: 'ข้อความรองรับเฉพาะภาษาไทยและตัวเลขเท่านั้น' }, { status: 422 })
  }

  // ตรวจสอบว่า blog มีอยู่จริงก่อน insert เพื่อป้องกัน orphan comment
  // (comment ที่ blogId ไม่มีใน DB จะทำให้ FK constraint error อยู่แล้ว แต่ error message จะน่าเกลียด)
  const blog = await prisma.blog.findUnique({ where: { id: blogId }, select: { id: true } })
  if (!blog) return NextResponse.json({ error: 'ไม่พบบทความ' }, { status: 404 })

  // comment ใหม่ทุกอันเริ่มต้นที่ PENDING โดย default (กำหนดใน schema)
  // ต้องรอ admin approve ก่อนถึงจะแสดงในหน้า public
  const comment = await prisma.comment.create({
    data: { blogId, authorName: authorName.trim(), content: content.trim() },
  })

  return NextResponse.json(comment, { status: 201 })
}
