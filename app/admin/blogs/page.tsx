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
    <div className="min-h-screen bg-[#f7f7f8]" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
      <AdminNav />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-[22px] font-bold text-[#242424] mb-1">จัดการบทความ</h1>
            <p className="text-sm text-[#9ca3af]">ทั้งหมด {blogs.length} บทความ</p>
          </div>
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-2 h-[42px] px-5 bg-[#242424] text-white rounded-lg text-sm font-medium no-underline self-start sm:self-auto"
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
