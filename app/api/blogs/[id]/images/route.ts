import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'

const BUCKET = 'blog-images'
const MAX_GALLERY = 6

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = (formData.get('type') as string) ?? 'gallery'

  if (!file) return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 400 })

  if (type === 'gallery') {
    const count = await prisma.blogImage.count({ where: { blogId: params.id } })
    if (count >= MAX_GALLERY) {
      return NextResponse.json({ error: `อัปโหลดได้สูงสุด ${MAX_GALLERY} รูป` }, { status: 400 })
    }
  }

  const ext = file.name.split('.').pop()
  const path = `${params.id}/${type}-${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, bytes, { contentType: file.type })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)

  if (type === 'cover') {
    await prisma.blog.update({ where: { id: params.id }, data: { coverImageUrl: publicUrl } })
    return NextResponse.json({ url: publicUrl })
  }

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

  await prisma.blogImage.delete({ where: { id: imageId, blogId: params.id } })
  return NextResponse.json({ success: true })
}
