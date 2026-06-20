import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminNav from '@/components/AdminNav'
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
    <div style={{ minHeight: '100vh', background: '#f7f7f8', fontFamily: "'Noto Sans Thai', sans-serif" }}>
      <AdminNav />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#242424', marginBottom: 4 }}>จัดการ Comment</h1>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>
            ทั้งหมด {comments.length} ความคิดเห็น ({pendingCount} รอการอนุมัติ)
          </p>
        </div>
        <CommentTable initialComments={serialized} />
      </div>
    </div>
  )
}
