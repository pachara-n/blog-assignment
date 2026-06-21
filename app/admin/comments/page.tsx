import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminNav from '@/components/AdminNav'

export const dynamic = 'force-dynamic'
import CommentTable from '@/components/CommentTable'

export default async function AdminCommentsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { blog: { select: { title: true } } },
  })

  const serialized = comments.map(c => ({
    id: c.id,
    authorName: c.authorName,
    content: c.content,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    blogTitle: c.blog.title,
  }))

  const pendingCount = comments.filter(c => c.status === 'PENDING').length

  return (
    <div className="min-h-screen bg-[#f7f7f8]" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
      <AdminNav />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-[22px] font-bold text-[#242424] mb-1">จัดการ Comment</h1>
          <p className="text-sm text-[#9ca3af]">
            ทั้งหมด {comments.length} ความคิดเห็น ({pendingCount} รอการอนุมัติ)
          </p>
        </div>
        <CommentTable initialComments={serialized} />
      </div>
    </div>
  )
}
