'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Blog = {
  id: string
  title: string
  slug: string
  isPublished: boolean
  createdAt: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BlogTable({ initialBlogs }: { initialBlogs: Blog[] }) {
  const [blogs, setBlogs] = useState(initialBlogs)
  const router = useRouter()

  async function togglePublish(id: string) {
    const res = await fetch(`/api/blogs/${id}/publish`, { method: 'PATCH' })
    if (!res.ok) return
    const updated = await res.json()
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, isPublished: updated.isPublished } : b))
  }

  async function deleteBlog(id: string) {
    if (!confirm('ยืนยันการลบบทความนี้?')) return
    const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' })
    if (!res.ok) return
    setBlogs(prev => prev.filter(b => b.id !== id))
    router.refresh()
  }

  return (
    <div className="bg-white border border-[#eaeaea] rounded-[10px] overflow-hidden">
      <div className="overflow-x-auto">
        {/* Header */}
        <div className="grid gap-4 px-6 py-3.5 bg-[#fafafa] border-b border-[#eaeaea] text-xs font-semibold text-[#757575] uppercase tracking-[0.5px]" style={{ gridTemplateColumns: '1fr 200px 120px 130px 180px', minWidth: 760 }}>
          <span>ชื่อบทความ</span>
          <span>URL Slug</span>
          <span>สถานะ</span>
          <span>วันที่โพสต์</span>
          <span className="text-right">Actions</span>
        </div>

        {blogs.map(blog => (
          <div
            key={blog.id}
            className="grid gap-4 px-6 py-4 border-b border-[#f5f5f5] items-center"
            style={{ gridTemplateColumns: '1fr 200px 120px 130px 180px', minWidth: 760 }}
          >
            <p className="text-sm font-medium text-[#242424]">{blog.title}</p>
            <span className="text-xs text-[#9ca3af] font-mono">{blog.slug}</span>
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${blog.isPublished ? 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]' : 'bg-[#f5f5f5] text-[#757575] border-[#e5e5e5]'}`}>
                {blog.isPublished ? 'Published' : 'Unpublished'}
              </span>
            </div>
            <span className="text-[13px] text-[#757575]">{formatDate(blog.createdAt)}</span>
            <div className="flex gap-2 justify-end">
              <Link
                href={`/admin/blogs/${blog.id}/edit`}
                className="px-3 py-1.5 border border-[#e5e5e5] rounded-md text-xs font-medium text-[#242424] no-underline"
              >
                แก้ไข
              </Link>
              <button
                onClick={() => togglePublish(blog.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer font-[inherit] ${blog.isPublished ? 'border border-[#e5e5e5] bg-white text-[#757575]' : 'border border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]'}`}
              >
                {blog.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={() => deleteBlog(blog.id)}
                className="px-3 py-1.5 border border-[#fecaca] rounded-md text-xs font-medium text-[#ef4444] bg-white cursor-pointer font-[inherit]"
              >
                ลบ
              </button>
            </div>
          </div>
        ))}

        {blogs.length === 0 && (
          <div className="px-8 py-[60px] text-center text-[#9ca3af] text-sm">
            ยังไม่มีบทความ
          </div>
        )}
      </div>
    </div>
  )
}
