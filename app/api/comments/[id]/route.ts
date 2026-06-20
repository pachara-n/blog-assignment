import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await req.json()
  // whitelist ค่าที่รับได้แทนการเช็ค enum จาก Prisma โดยตรง
  // เพื่อให้ error message ชัดเจนกว่า Prisma จะ throw เอง
  if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'status ไม่ถูกต้อง' }, { status: 400 })
  }

  // status เปลี่ยนได้ทุกทิศทาง: APPROVED → REJECTED และ REJECTED → APPROVED ก็ได้
  // ตาม requirement ที่ระบุว่าต้องสามารถ reject comment ที่เคย approve แล้วได้
  const comment = await prisma.comment.update({
    where: { id: params.id },
    data: { status },
  })

  return NextResponse.json(comment)
}
