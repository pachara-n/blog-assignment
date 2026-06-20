import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blog = await prisma.blog.findUnique({ where: { id: params.id }, select: { isPublished: true } })
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // toggle: อ่านค่าปัจจุบันแล้วกลับด้าน ทำให้ endpoint เดียวทำได้ทั้ง publish และ unpublish
  const updated = await prisma.blog.update({
    where: { id: params.id },
    data: { isPublished: !blog.isPublished },
  })

  return NextResponse.json(updated)
}
