import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
import AdminNav from '@/components/AdminNav'
import BlogTable from '@/components/BlogTable'

export default async function AdminBlogsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, isPublished: true, createdAt: true },
  })

  const serialized = blogs.map(b => ({ ...b, createdAt: b.createdAt.toISOString() }))

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f8', fontFamily: "'Noto Sans Thai', sans-serif" }}>
      <AdminNav />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#242424', marginBottom: 4 }}>จัดการบทความ</h1>
            <p style={{ fontSize: 14, color: '#9ca3af' }}>ทั้งหมด {blogs.length} บทความ</p>
          </div>
          <Link
            href="/admin/blogs/new"
            style={{
              height: 42, padding: '0 20px', background: '#242424', color: '#fff',
              borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            สร้าง Blog ใหม่
          </Link>
        </div>
        <BlogTable initialBlogs={serialized} />
      </div>
    </div>
  )
}
