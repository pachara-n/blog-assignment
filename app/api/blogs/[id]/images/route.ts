import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET!
const MAX_GALLERY = 6

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = (formData.get('type') as string) ?? 'gallery'

  if (!file) return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 400 })

  // ตรวจสอบจำนวน gallery images ฝั่ง server ซ้ำอีกรอบ
  // client เช็คแล้ว แต่ถ้ามีคนส่ง request ตรงๆ โดยไม่ผ่าน UI ก็จะยังถูก enforce
  if (type === 'gallery') {
    const count = await prisma.blogImage.count({ where: { blogId: params.id } })
    if (count >= MAX_GALLERY) {
      return NextResponse.json({ error: `อัปโหลดได้สูงสุด ${MAX_GALLERY} รูป` }, { status: 400 })
    }
  }

  // ใช้ blogId + timestamp เป็น path เพื่อจัดกลุ่มรูปตาม blog
  // และป้องกัน filename ชนกัน (เช่น อัปโหลด cover.jpg สองครั้ง)
  const ext = file.name.split('.').pop()
  const path = `${params.id}/${type}-${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, bytes, { contentType: file.type })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // getPublicUrl ไม่ทำ network request — แค่ construct URL จาก bucket + path
  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)

  if (type === 'cover') {
    await prisma.blog.update({ where: { id: params.id }, data: { coverImageUrl: publicUrl } })
    return NextResponse.json({ url: publicUrl })
  }

  // หา order สูงสุดปัจจุบันแล้ว +1 เพื่อต่อท้าย gallery เสมอ
  // ถ้ายังไม่มีรูปเลย maxOrder จะเป็น null → ใช้ -1 เป็น fallback → order แรกจะเป็น 0
  const maxOrder = await prisma.blogImage.findFirst({
    where: { blogId: params.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const image = await prisma.blogImage.create({
    data: { url: publicUrl, blogId: params.id, order: (maxOrder?.order ?? -1) + 1 },
  })

  return NextResponse.json(image, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { imageId } = await req.json()
  if (!imageId) return NextResponse.json({ error: 'imageId required' }, { status: 400 })

  // กำหนดทั้ง id และ blogId ใน where เพื่อป้องกันไม่ให้ลบรูปของ blog อื่น
  // (admin ที่รู้ imageId ของ blog อื่นจะไม่สามารถลบได้ถ้าไม่ตรง blogId)
  await prisma.blogImage.delete({ where: { id: imageId, blogId: params.id } })
  return NextResponse.json({ success: true })
}
